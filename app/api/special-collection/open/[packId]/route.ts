import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { SpecialCollectionService } from '../../../../../src/features/special-collection/service';

export const dynamic = 'force-dynamic';

// Enhanced error response interface
interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  userMessage: string;
  redirectUrl?: string;
  retryable?: boolean;
  supportedActions?: string[];
}

interface SuccessResponse {
  success: true;
  message: string;
  claimedCards: any[];
  newBalance: number;
  redirectUrl: string;
  cardsCount: number;
}

/**
 * Categorize and format error responses with user-friendly messages
 */
function formatErrorResponse(
  error: string,
  redirectUrl?: string,
): {
  response: ErrorResponse;
  statusCode: number;
} {
  // Pack already opened
  if (error.includes('already been opened')) {
    return {
      statusCode: 409,
      response: {
        success: false,
        error,
        errorCode: 'PACK_ALREADY_OPENED',
        userMessage:
          'This pack has already been opened. You can view your cards in your collection.',
        redirectUrl: redirectUrl || '/special-collection',
        retryable: false,
        supportedActions: ['view_collection', 'browse_packs'],
      },
    };
  }

  // Insufficient credits
  if (
    error.includes('Insufficient credits') ||
    error.includes('credits to open')
  ) {
    return {
      statusCode: 402,
      response: {
        success: false,
        error,
        errorCode: 'INSUFFICIENT_CREDITS',
        userMessage:
          "You don't have enough credits to open this pack. You can purchase more credits or try a different pack.",
        retryable: false,
        supportedActions: [
          'purchase_credits',
          'browse_cheaper_packs',
          'view_balance',
        ],
      },
    };
  }

  // Pack not found or access denied
  if (
    error.includes('not found') ||
    error.includes('not available') ||
    error.includes('access denied')
  ) {
    return {
      statusCode: 404,
      response: {
        success: false,
        error,
        errorCode: 'PACK_NOT_FOUND',
        userMessage:
          "This pack is not available or you don't have access to it.",
        retryable: false,
        supportedActions: ['browse_packs', 'view_collection'],
      },
    };
  }

  // No cards found (corrupted pack)
  if (error.includes('No cards found')) {
    return {
      statusCode: 422,
      response: {
        success: false,
        error,
        errorCode: 'EMPTY_PACK',
        userMessage:
          'This pack appears to be empty or corrupted. Please contact support.',
        retryable: false,
        supportedActions: ['contact_support', 'browse_packs'],
      },
    };
  }

  // Generic validation error
  return {
    statusCode: 400,
    response: {
      success: false,
      error,
      errorCode: 'VALIDATION_ERROR',
      userMessage: 'There was an issue with your request. Please try again.',
      retryable: true,
      supportedActions: ['retry', 'refresh_page'],
    },
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> },
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          errorCode: 'UNAUTHORIZED',
          userMessage: 'Please sign in to open packs.',
          retryable: true,
          supportedActions: ['sign_in', 'refresh_page'],
        } as ErrorResponse,
        { status: 401 },
      );
    }

    // Parameter validation
    const resolvedParams = await params;
    const packId = parseInt(resolvedParams.packId);

    if (isNaN(packId) || packId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pack ID provided',
          errorCode: 'INVALID_PACK_ID',
          userMessage:
            'The pack ID is invalid. Please try selecting a pack from the available options.',
          retryable: false,
          supportedActions: ['browse_packs', 'go_back'],
        } as ErrorResponse,
        { status: 400 },
      );
    }

    // Attempt to open the pack
    const result = await SpecialCollectionService.openPack(
      session.user.id,
      packId,
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Pack opened successfully!',
        claimedCards: result.claimedCards || [],
        newBalance: result.newBalance || 0,
        redirectUrl: result.redirectUrl || '/special-collection',
        cardsCount: result.claimedCards?.length || 0,
      } as SuccessResponse);
    } else {
      // Format error response with appropriate status code and user-friendly message
      const { response, statusCode } = formatErrorResponse(
        result.error || 'Unknown error occurred',
        result.redirectUrl,
      );

      return NextResponse.json(response, { status: statusCode });
    }
  } catch (error) {
    // Log the full error for debugging with context
    const session = await auth();
    console.error('[Special Collection] POST open pack error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
      packId: (await params)?.packId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Handle specific error types
    if (error instanceof Error) {
      // Database connection errors
      if (
        error.message.includes('connection') ||
        error.message.includes('timeout')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Database connection error',
            errorCode: 'DATABASE_ERROR',
            userMessage:
              "We're experiencing high traffic. Please wait a moment and try again.",
            retryable: true,
            supportedActions: ['retry', 'wait_and_retry'],
          } as ErrorResponse,
          { status: 503 },
        );
      }

      // Transaction errors (likely due to concurrent access)
      if (
        error.message.includes('transaction') ||
        error.message.includes('deadlock')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Transaction conflict',
            errorCode: 'CONCURRENT_ACCESS',
            userMessage:
              'Another action is in progress. Please try again in a moment.',
            retryable: true,
            supportedActions: ['retry', 'refresh_page'],
          } as ErrorResponse,
          { status: 409 },
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        errorCode: 'SERVER_ERROR',
        userMessage:
          'Something went wrong on our end. Please try again in a moment.',
        retryable: true,
        supportedActions: ['retry', 'contact_support', 'refresh_page'],
      } as ErrorResponse,
      { status: 500 },
    );
  }
}
