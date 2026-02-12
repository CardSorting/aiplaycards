import { NextRequest, NextResponse } from 'next/server';
import { QUEUE_NAMES, getJobStatus } from '../../../../src/lib/queues';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const resolvedParams = await params;
    const { jobId } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get('queue') || QUEUE_NAMES.IMAGE_GENERATION;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 },
      );
    }

    const jobStatus = await getJobStatus(queueName, jobId);

    if (!jobStatus) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job: jobStatus,
    });
  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get job status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
