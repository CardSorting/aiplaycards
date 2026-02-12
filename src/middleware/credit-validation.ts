import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../auth';
import { CreditService } from '../services/credit-service';

/**
 * Enhanced request validation for credit-related operations
 */
export interface CreditRequestValidation {
  userId: string;
  requiredCredits?: number;
  operation: 'read' | 'deduct' | 'add';
  reason?: string;
}

export class CreditValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'CreditValidationError';
  }
}

/**
 * Validates credit operation requests with comprehensive security checks
 */
export async function validateCreditRequest(
  request: NextRequest,
  validation: CreditRequestValidation,
): Promise<
  { success: true; user: any } | { success: false; error: NextResponse }
> {
  try {
    // 1. Authentication check
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 },
        ),
      };
    }

    // 2. User ID validation and authorization
    if (validation.userId !== currentUser.id) {
      console.warn(
        `[CreditValidation] Unauthorized access attempt: ${currentUser.id} tried to access ${validation.userId}`,
      );
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Unauthorized access' },
          { status: 403 },
        ),
      };
    }

    // 3. Rate limiting check (basic implementation)
    const userAgent = request.headers.get('user-agent') || '';
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Block suspicious user agents
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /node/i,
      /postman/i,
      /insomnia/i,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      console.warn(
        `[CreditValidation] Suspicious user agent blocked: ${userAgent} from ${clientIP}`,
      );
      return {
        success: false,
        error: NextResponse.json({ error: 'Invalid client' }, { status: 403 }),
      };
    }

    // 4. Account status validation
    const balance = await CreditService.getBalance(validation.userId);
    if (!balance) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Account not found' },
          { status: 404 },
        ),
      };
    }

    if (!balance.isActive) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Account is suspended' },
          { status: 403 },
        ),
      };
    }

    // 5. Credit amount validation for deduction operations
    if (validation.operation === 'deduct' && validation.requiredCredits) {
      if (validation.requiredCredits <= 0) {
        return {
          success: false,
          error: NextResponse.json(
            { error: 'Invalid credit amount' },
            { status: 400 },
          ),
        };
      }

      if (balance.balance < validation.requiredCredits) {
        return {
          success: false,
          error: NextResponse.json(
            {
              error: `Insufficient credits. ${validation.requiredCredits} credits required.`,
              required: validation.requiredCredits,
              available: balance.balance,
            },
            { status: 402 },
          ),
        };
      }

      // Check for unreasonably large credit deductions (potential abuse)
      const MAX_SINGLE_DEDUCTION = 1000; // Configurable limit
      if (validation.requiredCredits > MAX_SINGLE_DEDUCTION) {
        console.warn(
          `[CreditValidation] Large credit deduction attempted: ${validation.requiredCredits} by ${validation.userId}`,
        );
        return {
          success: false,
          error: NextResponse.json(
            { error: 'Credit amount exceeds maximum allowed' },
            { status: 400 },
          ),
        };
      }
    }

    // 6. Reason validation for transactions
    if (
      (validation.operation === 'deduct' || validation.operation === 'add') &&
      validation.reason
    ) {
      const validReasons = [
        'booster_open',
        'booster_processing_failed',
        'paypal_purchase',
        'welcome_bonus',
        'refund_booster',
        'refund_processing_failed',
        'marketplace_purchase',
        'marketplace_refund',
        'ai_generation',
        'ai_generation_refund',
        'card_animation',
        'animation_job_queue_failed',
      ];

      if (!validReasons.includes(validation.reason)) {
        console.warn(
          `[CreditValidation] Invalid transaction reason: ${validation.reason} by ${validation.userId}`,
        );
        return {
          success: false,
          error: NextResponse.json(
            { error: 'Invalid transaction reason' },
            { status: 400 },
          ),
        };
      }
    }

    return { success: true, user: currentUser };
  } catch (error) {
    console.error('[CreditValidation] Validation error:', error);
    return {
      success: false,
      error: NextResponse.json({ error: 'Validation failed' }, { status: 500 }),
    };
  }
}

/**
 * Middleware wrapper for credit operations
 */
export function withCreditValidation(
  validation: CreditRequestValidation,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validationResult = await validateCreditRequest(request, validation);

    if (!validationResult.success) {
      return validationResult.error;
    }

    try {
      return await handler(request, validationResult.user);
    } catch (error) {
      console.error('[CreditValidation] Handler error:', error);
      return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
  };
}

/**
 * Enhanced security headers for credit-related responses
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
