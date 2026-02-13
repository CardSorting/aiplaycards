import { NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { boosterJobs } from '../../../../src/db/schema/booster-jobs';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const job = await db
      .select({
        id: boosterJobs.id,
        userId: boosterJobs.userId,
        status: boosterJobs.status,
        result: boosterJobs.result,
        error: boosterJobs.error,
        updatedAt: boosterJobs.updatedAt,
      })
      .from(boosterJobs)
      .where(eq(boosterJobs.id, jobId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 },
      );
    }

    const { status, result, error } = job[0];

    console.log('API response for job', jobId, ':', { status, result, error });

    return NextResponse.json({
      status,
      card: result,
      error,
    });
  } catch (e) {
    console.error('Error fetching job status:', e);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 },
    );
  }
}
