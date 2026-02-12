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

interface JobStatusResponse {
  success: true;
  job: {
    jobId: string;
    status: string;
    animationType: string;
    duration: number;
    creditCost: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    animationData?: any;
    error?: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  userMessage: string;
}

/**
 * Get animation job status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
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
    const jobId = resolvedParams.jobId;

    if (!jobId || typeof jobId !== 'string' || jobId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job ID provided',
          errorCode: 'INVALID_JOB_ID',
          userMessage: 'The animation job ID is invalid.',
        } as ErrorResponse,
        { status: 400 },
      );
    }

    // Get animation worker
    const bossInstance = await getBossInstance();
    const animationWorker = SpecialAnimationWorker.getInstance(bossInstance);

    // Get job status
    const job = await animationWorker.getJobStatus(jobId);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: 'Animation job not found',
          errorCode: 'JOB_NOT_FOUND',
          userMessage: 'The animation job was not found. It may have expired.',
        } as ErrorResponse,
        { status: 404 },
      );
    }

    // Verify job belongs to current user
    if (job.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied to animation job',
          errorCode: 'ACCESS_DENIED',
          userMessage: "You don't have access to this animation job.",
        } as ErrorResponse,
        { status: 403 },
      );
    }

    // Parse animation data if it exists
    let animationData = null;
    if (job.animationData) {
      try {
        animationData = JSON.parse(job.animationData);
      } catch (error) {
        console.error(
          '[Animation Status API] Failed to parse animation data:',
          error,
        );
      }
    }

    return NextResponse.json({
      success: true,
      job: {
        jobId: job.jobId,
        status: job.status,
        animationType: job.animationType,
        duration: job.duration,
        creditCost: job.creditCost,
        createdAt: job.createdAt.toISOString(),
        startedAt: job.startedAt?.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        animationData,
        error: job.lastError,
      },
    } as JobStatusResponse);
  } catch (error) {
    console.error('[Animation Status API] GET error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: (await auth())?.user?.id,
      jobId: (await params)?.jobId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        errorCode: 'SERVER_ERROR',
        userMessage: 'Unable to check animation status at this time.',
      } as ErrorResponse,
      { status: 500 },
    );
  }
}
