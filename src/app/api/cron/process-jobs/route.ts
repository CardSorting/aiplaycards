/**
 * Cron Job Endpoint for Serverless Job Processing
 * Optimized for Cron with proper authentication
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

function isValidCronRequest(request: NextRequest): boolean {
  // Cron authentication
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow requests without auth
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Production: require auth header
  if (!authHeader || !cronSecret) {
    console.error('[Cron] Missing authorization header or CRON_SECRET');
    return false;
  }

  // Support both "Bearer token" and direct token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  const isValid = token === cronSecret;

  if (!isValid) {
    console.error('[Cron] Invalid cron secret provided');
  }

  return isValid;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Validate cron request
  if (!isValidCronRequest(request)) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Invalid or missing cron authentication',
      },
      { status: 401 },
    );
  }

  try {
    // Build the base URL for internal API calls
    const baseUrl = process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : 'http://localhost:3000';

    // First, check if there are any pending jobs
    const healthResponse = await fetch(`${baseUrl}/api/workers/trigger`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cron-Job/1.0',
      },
    });

    if (!healthResponse.ok) {
      throw new Error(`Health check failed: HTTP ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    const pendingJobs = healthData.totalPendingJobs || 0;

    if (pendingJobs === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending jobs to process (daily cleanup run)',
        pendingJobs: 0,
        processed: 0,
        duration: Date.now() - startTime,
        cronTimestamp: new Date().toISOString(),
        frequency: 'daily',
      });
    }

    // Process more jobs at once since this runs daily (Hobby plan limitation)
    const maxJobsPerQueue = Math.max(10, Math.ceil(pendingJobs / 2)); // Process more aggressively
    console.log(
      `[Cron] Daily processing: will process up to ${maxJobsPerQueue} jobs per queue`,
    );

    const processingResponse = await fetch(`${baseUrl}/api/workers/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Cron-Job-Daily/1.0',
      },
      body: JSON.stringify({
        queues: 'all',
        maxJobsPerQueue: maxJobsPerQueue, // Process more jobs since we only run daily
      }),
    });

    if (!processingResponse.ok) {
      throw new Error(
        `Processing failed: HTTP ${processingResponse.status} - ${processingResponse.statusText}`,
      );
    }

    const result = await processingResponse.json();
    const duration = Date.now() - startTime;

    console.log(
      `[Cron]   - Jobs processed: ${result.summary?.totalProcessed || 0}`,
    );
    console.log(
      `[Cron]   - Queues processed: ${result.summary?.queuesProcessed || 0}`,
    );

    return NextResponse.json({
      success: true,
      message: 'Daily automated job processing completed successfully',
      pendingJobsFound: pendingJobs,
      ...result,
      duration,
      cronTimestamp: new Date().toISOString(),
      frequency: 'daily',
      nextRunEstimate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next run in 24 hours
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Cron] ❌ Job processing failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Cron job processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        cronTimestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for flexibility with different cron services
  return GET(request);
}
