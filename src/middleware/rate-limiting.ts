import { NextRequest, NextResponse } from 'next/server';

/**
 * Advanced rate limiting and DDoS protection middleware
 * Implements multiple layers of protection against abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
  skipSuccessful?: boolean;
  skipErrors?: boolean;
}

// Different rate limits for different types of operations
export const RATE_LIMIT_CONFIGS = {
  // General API access
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },

  // Financial operations (credits, marketplace)
  financial: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    blockDurationMs: 10 * 60 * 1000, // 10 minutes
  },

  // Image generation/upload
  media: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },

} as const;

// In-memory store for rate limiting (consider Redis for production scaling)
const rateLimitStore = new Map<string, RateLimitEntry>();
const suspiciousIPs = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();

  // Clean rate limit store
  for (const [key, entry] of rateLimitStore.entries()) {
    if (
      now > entry.resetTime &&
      (!entry.blocked || (entry.blockUntil && now > entry.blockUntil))
    ) {
      rateLimitStore.delete(key);
    }
  }

  // Clean suspicious IPs
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.lastAttempt > 60 * 60 * 1000) {
      // 1 hour
      suspiciousIPs.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest, userId?: string): string {
  const ip = getClientIP(request);
  return userId ? `user:${userId}` : `ip:${ip}`;
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-vercel-forwarded-for') ||
    'unknown'
  );
}

/**
 * Check if IP is suspicious based on behavior patterns
 */
function checkSuspiciousActivity(request: NextRequest): boolean {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';

  // Check for bot patterns
  const botPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|axios|postman/i,
    /^$/,
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    markSuspiciousIP(ip);
    return true;
  }

  // Check for rapid requests from same IP
  const suspiciousData = suspiciousIPs.get(ip);
  const now = Date.now();

  if (suspiciousData) {
    // If more than 5 suspicious attempts in last 10 minutes
    if (
      suspiciousData.count > 5 &&
      now - suspiciousData.lastAttempt < 10 * 60 * 1000
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Mark IP as suspicious
 */
function markSuspiciousIP(ip: string): void {
  const existing = suspiciousIPs.get(ip);
  if (existing) {
    existing.count++;
    existing.lastAttempt = Date.now();
  } else {
    suspiciousIPs.set(ip, { count: 1, lastAttempt: Date.now() });
  }
}

/**
 * Get rate limit configuration based on request path
 */
function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMIT_CONFIGS.auth;
  }

  if (
    pathname.includes('/credits') ||
    pathname.includes('/paypal') ||
    pathname.includes('/marketplace')
  ) {
    return RATE_LIMIT_CONFIGS.financial;
  }

  if (
    pathname.includes('/upload') ||
    pathname.includes('/generate-image') ||
    pathname.includes('/animate')
  ) {
    return RATE_LIMIT_CONFIGS.media;
  }

  return RATE_LIMIT_CONFIGS.api;
}

/**
 * Main rate limiting middleware
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  customConfig?: Partial<RateLimitConfig>,
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const { pathname } = request.nextUrl;
    const config = { ...getRateLimitConfig(pathname), ...customConfig };
    const userId = context?.user?.id;
    const clientId = getClientId(request, userId);
    const ip = getClientIP(request);

    // Check for suspicious activity first
    if (checkSuspiciousActivity(request)) {
      console.warn(
        `[RateLimit] Suspicious activity detected from ${ip}, User-Agent: ${request.headers.get(
          'user-agent',
        )}`,
      );
      return NextResponse.json(
        { error: 'Request blocked due to suspicious activity' },
        { status: 429 },
      );
    }

    const now = Date.now();
    let entry = rateLimitStore.get(clientId);

    // Initialize or reset entry if window expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
      rateLimitStore.set(clientId, entry);
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      const remainingTime = Math.ceil((entry.blockUntil - now) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You are temporarily blocked.',
          retryAfter: remainingTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': remainingTime.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.blockUntil.toString(),
          },
        },
      );
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + config.blockDurationMs;

      // Log the rate limit violation
      console.warn(
        `[RateLimit] Rate limit exceeded for ${clientId} on ${pathname}. Blocked for ${config.blockDurationMs / 1000
        } seconds.`,
      );

      const remainingTime = Math.ceil(config.blockDurationMs / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You are temporarily blocked.',
          retryAfter: remainingTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': remainingTime.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.blockUntil.toString(),
          },
        },
      );
    }

    // Execute the handler
    try {
      const response = await handler(request, context);

      // Add rate limit headers to successful responses
      const remaining = Math.max(0, config.maxRequests - entry.count);
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

      return response;
    } catch (error) {
      console.error(`[RateLimit] Handler error for ${clientId}:`, error);
      throw error;
    }
  };
}

/**
 * Specialized rate limiting for high-value operations
 */
export function withStrictRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
) {
  return withRateLimit(handler, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // Very restrictive
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Get rate limiting statistics
 */
export function getRateLimitStats(): {
  totalEntries: number;
  blockedEntries: number;
  suspiciousIPs: number;
} {
  let blockedEntries = 0;
  const now = Date.now();

  for (const entry of rateLimitStore.values()) {
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      blockedEntries++;
    }
  }

  return {
    totalEntries: rateLimitStore.size,
    blockedEntries,
    suspiciousIPs: suspiciousIPs.size,
  };
}
