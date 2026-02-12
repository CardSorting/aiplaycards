/**
 * Security logging utility for authentication events
 * Logs security-relevant events for audit and monitoring
 */

interface SecurityLogEntry {
  event: string;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
  timestamp: Date;
}

const MAX_LOG_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory log store (consider using a proper logging service in production)
const securityLogs: SecurityLogEntry[] = [];

/**
 * Logs a security event
 */
export function logSecurityEvent(
  event: string,
  options: {
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    success: boolean;
    reason?: string;
  },
): void {
  const logEntry: SecurityLogEntry = {
    event,
    ...options,
    timestamp: new Date(),
  };

  securityLogs.push(logEntry);

  // Clean up old logs
  const cutoff = new Date(Date.now() - MAX_LOG_AGE_MS);
  while (securityLogs.length > 0 && securityLogs[0].timestamp < cutoff) {
    securityLogs.shift();
  }

  // Log to console in development, use proper logging service in production
  if (process.env.NODE_ENV === 'development') {
    const level = options.success ? 'info' : 'warn';
    console[level](
      `[Security] ${event}:`,
      JSON.stringify({
        ...options,
        timestamp: logEntry.timestamp.toISOString(),
      }),
    );
  }
}

/**
 * Gets recent failed login attempts for an email/IP
 */
export function getRecentFailedAttempts(
  email?: string,
  ip?: string,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
): number {
  const cutoff = new Date(Date.now() - windowMs);
  return securityLogs.filter(
    log =>
      log.event === 'login_attempt' &&
      !log.success &&
      log.timestamp >= cutoff &&
      (email ? log.email === email : true) &&
      (ip ? log.ip === ip : true),
  ).length;
}

/**
 * Checks if an account should be locked based on failed attempts
 */
export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= 5; // Lock after 5 failed attempts
}

/**
 * Calculates lockout duration based on failed attempts
 */
export function getLockoutDuration(failedAttempts: number): number {
  // Exponential backoff: 15 min, 30 min, 1 hour, 2 hours, 4 hours
  const durations = [
    15 * 60 * 1000, // 15 minutes
    30 * 60 * 1000, // 30 minutes
    60 * 60 * 1000, // 1 hour
    2 * 60 * 60 * 1000, // 2 hours
    4 * 60 * 60 * 1000, // 4 hours
  ];
  return durations[Math.min(failedAttempts - 5, durations.length - 1)];
}
