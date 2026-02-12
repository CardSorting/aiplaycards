import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { SpecialAnimationWorker } from '../../../../../src/features/special-animation/worker';
import PgBoss from 'pg-boss';

export const dynamic = 'force-dynamic';

// Get pg-boss instance (assuming it's available globally or from existing booster system)
let boss: PgBoss;

async function getBossInstance(): Promise<PgBoss> {
  if (!boss) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    boss = new PgBoss(connectionString);
    await boss.start();
  }
  return boss;
}

interface QueueAnimationRequest {
  cardId: number;
  animationType: string;
  duration?: number;
  animationConfig?: any;
}

interface QueueAnimationResponse {
  success: true;
  jobId: string;
  message: string;
  estimatedCost: number;
}

interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  userMessage: string;
  retryable?: boolean;
  supportedActions?: string[];
}

/**
 * Queue a new animation for a special collection card
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          errorCode: 'UNAUTHORIZED',
          userMessage: 'Please sign in to create animations.',
          retryable: true,
          supportedActions: ['sign_in', 'refresh_page'],
        } as ErrorResponse,
        { status: 401 },
      );
    }

    // Parse request body
    let requestData: QueueAnimationRequest;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          errorCode: 'INVALID_JSON',
          userMessage: 'The request data is malformed. Please try again.',
          retryable: true,
          supportedActions: ['retry', 'refresh_page'],
        } as ErrorResponse,
        { status: 400 },
      );
    }

    // Validate required fields
    if (!requestData.cardId || !requestData.animationType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: cardId and animationType',
          errorCode: 'MISSING_FIELDS',
          userMessage: 'Please provide both card ID and animation type.',
          retryable: false,
          supportedActions: ['check_request', 'go_back'],
        } as ErrorResponse,
        { status: 400 },
      );
    }

    // Validate cardId
    if (!Number.isInteger(requestData.cardId) || requestData.cardId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid card ID',
          errorCode: 'INVALID_CARD_ID',
          userMessage: 'The card ID provided is invalid.',
          retryable: false,
          supportedActions: ['go_back', 'select_different_card'],
        } as ErrorResponse,
        { status: 400 },
      );
    }

    // Validate animation type
    const validAnimationTypes = [
      'sparkle',
      'glow',
      'rotate',
      'bounce',
      'flow',
      'energy',
    ];
    if (!validAnimationTypes.includes(requestData.animationType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid animation type: ${requestData.animationType}`,
          errorCode: 'INVALID_ANIMATION_TYPE',
          userMessage: `Animation type must be one of: ${validAnimationTypes.join(
            ', ',
          )}.`,
          retryable: false,
          supportedActions: ['select_valid_type', 'go_back'],
        } as ErrorResponse,
        { status: 400 },
      );
    }

    // Get animation worker
    const bossInstance = await getBossInstance();
    const animationWorker = SpecialAnimationWorker.getInstance(bossInstance);

    // Ensure worker is started
    await animationWorker.start();

    // Queue the animation
    const result = await animationWorker.queueAnimation({
      userId: session.user.id,
      cardId: requestData.cardId,
      animationType: requestData.animationType,
      duration: requestData.duration,
      animationConfig: requestData.animationConfig,
    });

    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes('Card not found')) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            errorCode: 'CARD_NOT_FOUND',
            userMessage: 'This card was not found in your collection.',
            retryable: false,
            supportedActions: ['view_collection', 'go_back'],
          } as ErrorResponse,
          { status: 404 },
        );
      }

      if (result.error?.includes('Daily animation limit')) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            errorCode: 'DAILY_LIMIT_REACHED',
            userMessage: result.error,
            retryable: false,
            supportedActions: ['try_tomorrow', 'view_preferences'],
          } as ErrorResponse,
          { status: 429 },
        );
      }

      // Generic error
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to queue animation',
          errorCode: 'QUEUE_FAILED',
          userMessage:
            'Unable to create animation at this time. Please try again.',
          retryable: true,
          supportedActions: ['retry', 'contact_support'],
        } as ErrorResponse,
        { status: 500 },
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      jobId: result.jobId!,
      message: 'Animation queued successfully!',
      estimatedCost: 25, // Default cost, could be dynamic
    } as QueueAnimationResponse);
  } catch (error) {
    console.error('[Animation Queue API] POST error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: (await auth())?.user?.id,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Handle specific error types
    if (error instanceof Error) {
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
