import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/db';
import { boosterJobs } from '../../../src/db/schema/booster-jobs';
import { eq, gt, sql } from 'drizzle-orm';
import { auth } from '../../../auth';
import { users } from '../../../src/db/schema/users';
import { dbUtils } from '../../../src/db/utils';

const CREDIT_COST = 25; // credits per booster open

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    await dbUtils.ensurePerformanceIndexes();
    const session = await auth();
    const currentUser = session?.user;
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

    // Fetch credits for current user if available
    let credits: number | undefined = undefined;
    if (currentUser) {
      const row = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.userId, currentUser.id!))
        .limit(1);
      credits = row[0]?.credits ?? 0;
    }

    return NextResponse.json(
      {
        status: 'active',
        slug: null,
        name: 'Booster',
        opensLastHour,
        opensLast24h,
        credits,
        creditCost: CREDIT_COST,
        startsAt: null,
      },
      {
        headers: {
          // Allow short-lived caching for anonymous; keep private for authed because of credits
          'Cache-Control': currentUser
            ? 'private, max-age=15, stale-while-revalidate=60'
            : 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
          Vary: currentUser ? 'Cookie' : 'Accept-Encoding',
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
