import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/db';
import { boosterJobs } from '../../../src/db/schema/booster-jobs';
import { gt, sql } from 'drizzle-orm';
import { dbUtils } from '../../../src/db/utils';

const CREDIT_COST = 25; // credits per booster open

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    await dbUtils.ensurePerformanceIndexes();
    // Drop system removed: always report active status

    // Social proof metrics: recent opens counts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [lastHourRows, lastDayRows] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(boosterJobs)
        .where(gt(boosterJobs.createdAt, oneHourAgo)),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(boosterJobs)
        .where(gt(boosterJobs.createdAt, oneDayAgo)),
    ]);
    const opensLastHour = lastHourRows?.[0]?.count ?? 0;
    const opensLast24h = lastDayRows?.[0]?.count ?? 0;

    return NextResponse.json(
      {
        status: 'active',
        slug: null,
        name: 'Booster',
        opensLastHour,
        opensLast24h,
        credits: undefined,
        creditCost: CREDIT_COST,
        startsAt: null,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
          Vary: 'Accept-Encoding',
        },
      },
    );
  } catch (e) {
    console.error('[booster-pack] GET error', e);
    return NextResponse.json(
      { error: 'Failed to fetch drop info' },
      { status: 500 },
    );
  }
}
