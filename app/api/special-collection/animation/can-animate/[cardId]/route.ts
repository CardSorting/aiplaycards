import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { SpecialAnimationWorker } from '../../../../../../src/features/special-animation/worker';
import PgBoss from 'pg-boss';

export const dynamic = 'force-dynamic';

// Get pg-boss instance
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

interface CanAnimateResponse {
  success: true;
  canAnimate: boolean;
  reason?: string;
  animationUrl?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  userMessage: string;
}

/**
 * Check if a special collection card can be animated
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
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
          userMessage: 'Please sign in to check animation status.',
        } as ErrorResponse,
        { status: 401 },
      );
    }

    // Parameter validation
    const resolvedParams = await params;
    const cardIdParam = resolvedParams.cardId;

    if (
      !cardIdParam ||
      typeof cardIdParam !== 'string' ||
      cardIdParam.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid card ID provided',
          errorCode: 'INVALID_CARD_ID',
          userMessage: 'The card ID is invalid.',
        } as ErrorResponse,
        { status: 400 },
      );
    }

    const cardId = parseInt(cardIdParam, 10);
    if (isNaN(cardId) || cardId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Card ID must be a positive integer',
          errorCode: 'INVALID_CARD_ID',
          userMessage: 'The card ID must be a valid number.',
        } as ErrorResponse,
        { status: 400 },
      );
    }

    // Get animation worker
    const bossInstance = await getBossInstance();
    const animationWorker = SpecialAnimationWorker.getInstance(bossInstance);

    // Check if card can be animated
    const result = await animationWorker.canCardBeAnimated(
      cardId,
      session.user.id,
    );

    return NextResponse.json({
      success: true,
      canAnimate: result.canAnimate,
      reason: result.reason,
      animationUrl: result.animationUrl,
    } as CanAnimateResponse);
  } catch (error) {
    console.error('[CanAnimateAPI] GET error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: (await auth())?.user?.id,
      cardId: (await params)?.cardId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        errorCode: 'SERVER_ERROR',
        userMessage: 'Unable to check animation eligibility at this time.',
      } as ErrorResponse,
      { status: 500 },
    );
  }
}
