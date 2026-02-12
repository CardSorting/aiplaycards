import { NextRequest, NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Enhanced input validation and sanitization middleware
 * Provides protection against XSS, injection attacks, and data corruption
 */

// Common validation schemas
export const commonSchemas = {
  userId: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email().toLowerCase(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/),
  cardName: z.string().trim().min(1).max(100),
  amount: z.number().int().positive().max(1000000),
  reason: z.string().trim().min(1).max(64),
  objectId: z.number().int().positive(),
  text: z.string().trim().max(5000),
  url: z.string().url().max(2048),
  html: z.string().max(10000),
};

export interface ValidationRule {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string, allowedTags?: string[]): string {
  const config = allowedTags
    ? {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'style'],
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    }
    : {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
      ALLOWED_ATTR: ['href', 'target'],
      FORBID_SCRIPT: true,
      ALLOW_DATA_ATTR: false,
    };

  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize text input to prevent various injection attacks
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/XML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
    .substring(0, 5000); // Enforce length limit
}

/**
 * Rate limiting per user to prevent abuse
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Enhanced validation middleware with sanitization and rate limiting
 */
export function withValidation(
  handler: (
    request: NextRequest,
    validatedData: {
      body?: any;
      query?: any;
      params?: any;
      user?: any;
    },
  ) => Promise<NextResponse>,
  rules: ValidationRule,
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const validatedData: any = {};

      // Extract user info for rate limiting
      if (context?.user?.id) {
        const canProceed = checkRateLimit(context.user.id);
        if (!canProceed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 },
          );
        }
      }

      // Validate and sanitize request body
      if (rules.body) {
        try {
          const rawBody = await request.json();

          // Sanitize string fields in body
          const sanitizedBody = sanitizeObjectStrings(rawBody);

          validatedData.body = rules.body.parse(sanitizedBody);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid request body',
                details: error.errors.map(e => ({
                  field: e.path.join('.'),
                  message: e.message,
                })),
              },
              { status: 400 },
            );
          }
          throw error;
        }
      }

      // Validate query parameters
      if (rules.query) {
        try {
          const { searchParams } = new URL(request.url);
          const queryObject = Object.fromEntries(searchParams);

          // Sanitize query parameters
          const sanitizedQuery = sanitizeObjectStrings(queryObject);

          validatedData.query = rules.query.parse(sanitizedQuery);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid query parameters',
                details: error.errors.map(e => ({
                  field: e.path.join('.'),
                  message: e.message,
                })),
              },
              { status: 400 },
            );
          }
          throw error;
        }
      }

      // Validate URL parameters
      if (rules.params && context?.params) {
        try {
          const sanitizedParams = sanitizeObjectStrings(context.params);
          validatedData.params = rules.params.parse(sanitizedParams);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid URL parameters',
                details: error.errors.map(e => ({
                  field: e.path.join('.'),
                  message: e.message,
                })),
              },
              { status: 400 },
            );
          }
          throw error;
        }
      }

      // Add user context if available
      if (context?.user) {
        validatedData.user = context.user;
      }

      return await handler(request, validatedData);
    } catch (error) {
      console.error('[InputValidation] Validation error:', error);
      return NextResponse.json(
        { error: 'Request validation failed' },
        { status: 400 },
      );
    }
  };
}

/**
 * Recursively sanitize string values in an object
 */
function sanitizeObjectStrings(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Specific validation schemas for different endpoints
 */
export const validationSchemas = {
  // Credit operations
  creditDeduction: z.object({
    amount: commonSchemas.amount,
    reason: commonSchemas.reason,
    jobId: z.number().int().positive().optional(),
  }),

  // Card operations
  createCard: z.object({
    name: commonSchemas.cardName,
    description: z.string().max(1000).optional(),
    imageUrl: commonSchemas.url.optional(),
  }),

  // User operations
  updateProfile: z.object({
    username: commonSchemas.username.optional(),
    email: commonSchemas.email.optional(),
  }),

  // Marketplace operations
  createListing: z.object({
    cardId: commonSchemas.objectId,
    priceCredits: commonSchemas.amount,
    description: z.string().max(500).optional(),
  }),

  // Image upload
  imageUpload: z.object({
    cardName: commonSchemas.cardName,
    imageType: z.enum(['background', 'layer', 'avatar']),
  }),
};

/**
 * Security headers for all API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate',
  );
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
