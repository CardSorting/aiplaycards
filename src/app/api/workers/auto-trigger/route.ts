/**
 * Auto-Trigger API for Hobby Plan Alternative
 * Provides frequent job processing without relying on cron
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10; // Keep short for frequent calls

interface TriggerResponse {
  triggered: boolean;
  reason: string;
  processed?: number;
  duration: number;
  timestamp: string;
}

export async function POST(): Promise<NextResponse<TriggerResponse>> {
  const startTime = Date.now();

  try {
    // Get the base URL for internal API calls
    const baseUrl = process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : 'http://localhost:3000';

    // Quick health check to see if processing is needed
    const healthResponse = await fetch(`${baseUrl}/api/workers/trigger`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Auto-Trigger/1.0',
      },
    });

    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    const pendingJobs = healthData.totalPendingJobs || 0;

    // Only process if there are jobs waiting
    if (pendingJobs === 0) {
      return NextResponse.json({
        triggered: false,
        reason: 'No pending jobs found',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Process a small batch of jobs quickly
    const processingResponse = await fetch(`${baseUrl}/api/workers/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Auto-Trigger/1.0',
      },
      body: JSON.stringify({
        queues: 'all',
        maxJobsPerQueue: 2, // Small batches for frequent processing
      }),
    });

    if (!processingResponse.ok) {
      throw new Error(`Processing failed: ${processingResponse.status}`);
    }

    const result = await processingResponse.json();
    const totalProcessed = result.summary?.totalProcessed || 0;

    return NextResponse.json({
      triggered: true,
      reason: `Processed ${totalProcessed} jobs from ${pendingJobs} pending`,
      processed: totalProcessed,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Auto-Trigger] Failed:', error);

    return NextResponse.json(
      {
        triggered: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET(): Promise<NextResponse> {
  // Simple health check
  return NextResponse.json({
    status: 'ready',
    message: 'Auto-trigger endpoint is available',
    usage: 'POST to trigger job processing',
    timestamp: new Date().toISOString(),
  });
}
