/**
 * Utility functions for robust async operations with timeouts and retry mechanisms
 */

export interface TimeoutOptions {
  timeoutMs: number;
  timeoutMessage?: string;
}

export interface RetryOptions {
  maxRetries: number;
  backoffMs?: number;
  maxBackoffMs?: number;
  exponential?: boolean;
}

export interface RobustAsyncOptions<T = unknown>
  extends Partial<TimeoutOptions>,
    Partial<RetryOptions> {
  fallback?: () => Promise<T>;
  onAttempt?: (attempt: number) => void;
  onTimeout?: () => void;
  onError?: (error: Error, attempt: number) => void;
}

/**
 * Add timeout to any promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  options: TimeoutOptions,
): Promise<T> {
  // Input validation
  if (!promise || typeof promise.then !== 'function') {
    throw new Error('First argument must be a promise');
  }

  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }

  const { timeoutMs, timeoutMessage } = options;

  if (
    typeof timeoutMs !== 'number' ||
    timeoutMs <= 0 ||
    !Number.isFinite(timeoutMs)
  ) {
    throw new Error('timeoutMs must be a positive finite number');
  }

  if (timeoutMs > 600000) {
    // 10 minutes max
    throw new Error('timeoutMs cannot exceed 10 minutes (600000ms)');
  }

  const finalTimeoutMessage =
    typeof timeoutMessage === 'string' && timeoutMessage.trim()
      ? timeoutMessage.trim()
      : `Operation timed out after ${timeoutMs}ms`;

  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(finalTimeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([
    promise.finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }),
    timeoutPromise,
  ]);
}

/**
 * Retry a promise with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions & {
    onAttempt?: (attempt: number) => void;
    onError?: (error: Error, attempt: number) => void;
  },
): Promise<T> {
  // Input validation
  if (!fn || typeof fn !== 'function') {
    throw new Error('First argument must be a function that returns a promise');
  }

  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }

  const {
    maxRetries,
    backoffMs = 1000,
    maxBackoffMs = 10000,
    exponential = true,
    onAttempt,
    onError,
  } = options;

  // Validate numeric options
  if (
    typeof maxRetries !== 'number' ||
    maxRetries < 0 ||
    !Number.isInteger(maxRetries)
  ) {
    throw new Error('maxRetries must be a non-negative integer');
  }

  if (maxRetries > 10) {
    throw new Error('maxRetries cannot exceed 10 to prevent infinite loops');
  }

  if (
    typeof backoffMs !== 'number' ||
    backoffMs <= 0 ||
    !Number.isFinite(backoffMs)
  ) {
    throw new Error('backoffMs must be a positive finite number');
  }

  if (
    typeof maxBackoffMs !== 'number' ||
    maxBackoffMs <= 0 ||
    !Number.isFinite(maxBackoffMs)
  ) {
    throw new Error('maxBackoffMs must be a positive finite number');
  }

  if (backoffMs > maxBackoffMs) {
    throw new Error('backoffMs cannot be greater than maxBackoffMs');
  }

  // Validate callback functions
  if (onAttempt && typeof onAttempt !== 'function') {
    throw new Error('onAttempt must be a function');
  }

  if (onError && typeof onError !== 'function') {
    throw new Error('onError must be a function');
  }

  let lastError: Error | null = null;
  const totalAttempts = maxRetries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      // Call onAttempt callback safely
      try {
        onAttempt?.(attempt);
      } catch (callbackError) {
        console.warn('[withRetry] onAttempt callback failed:', callbackError);
      }

      // Execute the main function
      const promiseResult = fn();
      if (!promiseResult || typeof promiseResult.then !== 'function') {
        throw new Error('Function must return a promise');
      }
      const result = await promiseResult;

      // Success - return result
      return result;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      lastError = normalizedError;

      // Call onError callback safely
      try {
        onError?.(normalizedError, attempt);
      } catch (callbackError) {
        console.warn('[withRetry] onError callback failed:', callbackError);
      }

      // If this wasn't the last attempt, wait before retrying
      if (attempt < totalAttempts) {
        const delay = exponential
          ? Math.min(backoffMs * Math.pow(2, attempt - 1), maxBackoffMs)
          : backoffMs;

        try {
          await sleep(delay);
        } catch (sleepError) {
          console.warn('[withRetry] Sleep interrupted:', sleepError);
          // Continue with retry anyway
        }
      }
    }
  }

  // All attempts failed
  throw lastError || new Error('All retry attempts failed with unknown error');
}

/**
 * Execute async operation with timeout, retry, and fallback
 */
export async function robustAsync<T>(
  fn: () => Promise<T>,
  options: RobustAsyncOptions<T> = {},
): Promise<T> {
  // Input validation
  if (!fn || typeof fn !== 'function') {
    throw new Error('First argument must be a function that returns a promise');
  }

  if (typeof options !== 'object' || options === null) {
    throw new Error('Options must be an object');
  }

  const {
    timeoutMs = 30000,
    timeoutMessage,
    maxRetries = 2,
    backoffMs = 1000,
    maxBackoffMs = 5000,
    exponential = true,
    fallback,
    onAttempt,
    onTimeout,
    onError,
  } = options;

  // Validate callback functions
  if (fallback && typeof fallback !== 'function') {
    throw new Error('fallback must be a function');
  }

  if (onAttempt && typeof onAttempt !== 'function') {
    throw new Error('onAttempt must be a function');
  }

  if (onTimeout && typeof onTimeout !== 'function') {
    throw new Error('onTimeout must be a function');
  }

  if (onError && typeof onError !== 'function') {
    throw new Error('onError must be a function');
  }

  try {
    return await withRetry(
      () => {
        try {
          return withTimeout(fn(), { timeoutMs, timeoutMessage });
        } catch (error) {
          // Convert synchronous errors to rejected promises
          return Promise.reject(error);
        }
      },
      {
        maxRetries,
        backoffMs,
        maxBackoffMs,
        exponential,
        onAttempt: attempt => {
          try {
            onAttempt?.(attempt);
          } catch (callbackError) {
            console.warn(
              '[robustAsync] onAttempt callback failed:',
              callbackError,
            );
          }
        },
        onError: (error, attempt) => {
          try {
            if (error.message.includes('timed out')) {
              onTimeout?.();
            }
            onError?.(error, attempt);
          } catch (callbackError) {
            console.warn(
              '[robustAsync] onError callback failed:',
              callbackError,
            );
          }
        },
      },
    );
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));

    if (fallback) {
      try {
        console.warn(
          '[robustAsync] Main operation failed, using fallback:',
          normalizedError.message,
        );
        const fallbackResult = await fallback();
        return fallbackResult;
      } catch (fallbackError) {
        const fallbackErrorMsg =
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Unknown fallback error';
        throw new Error(
          `Main operation failed: ${normalizedError.message}. Fallback also failed: ${fallbackErrorMsg}`,
        );
      }
    }

    throw normalizedError;
  }
}

/**
 * Execute multiple promises in parallel with individual timeouts
 */
export async function parallelRobust<T>(
  tasks: Array<() => Promise<T>>,
  options: RobustAsyncOptions<T> = {},
): Promise<T[]> {
  // Input validation
  if (!Array.isArray(tasks)) {
    throw new Error('Tasks must be an array');
  }

  if (tasks.length === 0) {
    return [];
  }

  if (tasks.length > 100) {
    throw new Error('Cannot execute more than 100 parallel tasks');
  }

  // Validate each task
  tasks.forEach((task, index) => {
    if (!task || typeof task !== 'function') {
      throw new Error(`Task at index ${index} must be a function`);
    }
  });

  if (typeof options !== 'object' || options === null) {
    throw new Error('Options must be an object');
  }

  try {
    const promises = tasks.map((task, index) => {
      try {
        return robustAsync(task, {
          ...options,
          onAttempt: options.onAttempt
            ? attempt => {
                try {
                  options.onAttempt?.(attempt);
                } catch (error) {
                  console.warn(
                    `[parallelRobust] onAttempt callback failed for task ${index}:`,
                    error,
                  );
                }
              }
            : undefined,
          onError: options.onError
            ? (error, attempt) => {
                try {
                  options.onError?.(error, attempt);
                } catch (callbackError) {
                  console.warn(
                    `[parallelRobust] onError callback failed for task ${index}:`,
                    callbackError,
                  );
                }
              }
            : undefined,
        });
      } catch (error) {
        // Convert synchronous errors to rejected promises
        return Promise.reject(error);
      }
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    throw new Error(`Parallel execution failed: ${normalizedError.message}`);
  }
}

/**
 * Execute promises in parallel but settle all (don't fail fast)
 */
export async function parallelSettled<T>(
  tasks: Array<() => Promise<T>>,
  options: RobustAsyncOptions<T> = {},
): Promise<
  Array<{ status: 'fulfilled' | 'rejected'; value?: T; reason?: Error }>
> {
  const promises = tasks.map(async task => {
    try {
      const value = await robustAsync(task, options);
      return { status: 'fulfilled' as const, value };
    } catch (error) {
      return {
        status: 'rejected' as const,
        reason: error instanceof Error ? error : new Error(String(error)),
      };
    }
  });

  return Promise.all(promises);
}

/**
 * Simple sleep utility
 */
export function sleep(ms: number): Promise<void> {
  // Input validation
  if (typeof ms !== 'number' || ms < 0 || !Number.isFinite(ms)) {
    throw new Error('Sleep duration must be a non-negative finite number');
  }

  if (ms > 300000) {
    // 5 minutes max
    throw new Error('Sleep duration cannot exceed 5 minutes (300000ms)');
  }

  return new Promise(resolve => {
    const timeoutId = setTimeout(() => resolve(), ms);

    // Handle potential timeout cleanup if the promise is somehow cancelled
    // Note: This is more of a defensive measure since there's no built-in cancellation
    return timeoutId;
  });
}

/**
 * Race multiple operations, return first successful result
 */
export async function raceToSuccess<T>(
  tasks: Array<() => Promise<T>>,
  options: {
    timeoutMs?: number;
    minSuccessful?: number;
  } = {},
): Promise<T[]> {
  const { timeoutMs = 60000, minSuccessful = 1 } = options;

  return new Promise((resolve, reject) => {
    const results: T[] = [];
    const errors: Error[] = [];
    let completed = 0;

    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Race timed out after ${timeoutMs}ms with ${results.length} successful results`,
        ),
      );
    }, timeoutMs);

    const checkCompletion = () => {
      if (results.length >= minSuccessful) {
        clearTimeout(timeout);
        resolve(results);
      } else if (completed === tasks.length) {
        clearTimeout(timeout);
        reject(
          new Error(
            `All tasks failed: ${errors.map(e => e.message).join(', ')}`,
          ),
        );
      }
    };

    tasks.forEach(async (task, _index) => {
      try {
        const result = await task();
        results.push(result);
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      } finally {
        completed++;
        checkCompletion();
      }
    });
  });
}
