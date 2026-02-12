import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '../../../../src/db';
import { creditTransactions } from '../../../../src/db/schema';
import { CreditService } from '../../../../src/services/credit-service';
import { and, eq, lte, sql } from 'drizzle-orm';

const FREE_CREDIT_COOLDOWN_HOURS = 24; // 24 hours between free credit claims

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user recently claimed free credits
    const lastClaimTime = new Date(
      Date.now() - FREE_CREDIT_COOLDOWN_HOURS * 60 * 60 * 1000,
    );

    const recentTransaction = await db
      .select()
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, currentUser.id!),
          eq(creditTransactions.reason, 'user_claimed_free'),
          lte(creditTransactions.createdAt, lastClaimTime),
        ),
      )
      .orderBy(sql`${creditTransactions.createdAt} desc`)
      .limit(1);

    if (recentTransaction.length > 0) {
      const hoursSinceLastClaim =
        (Date.now() - recentTransaction[0].createdAt.getTime()) /
        (1000 * 60 * 60);
      const remainingHours = Math.ceil(
        FREE_CREDIT_COOLDOWN_HOURS - hoursSinceLastClaim,
      );

      return NextResponse.json(
        {
          error: `You must wait ${remainingHours} hours before claiming free credits again`,
          cooldownRemaining: remainingHours * 60 * 60 * 1000, // milliseconds
          canClaimAfter: new Date(
            recentTransaction[0].createdAt.getTime() +
              FREE_CREDIT_COOLDOWN_HOURS * 60 * 60 * 1000,
          ),
        },
        { status: 429 },
      );
    }

    // Award random amount between 5-20 credits for user claims (less than admin giveaways)
    const amount = Math.floor(Math.random() * 15) + 5;

    const result = await CreditService.addCredits({
      userId: currentUser.id!,
      amount,
      reason: 'user_claimed_free',
      metadata: {
        claim_type: 'user_initiated',
        cooldown_hours: FREE_CREDIT_COOLDOWN_HOURS,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to award free credits. Please try again later.',
          details: result.error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      creditsAwarded: amount,
      newBalance: result.newBalance,
      nextClaimAfter: new Date(
        Date.now() + FREE_CREDIT_COOLDOWN_HOURS * 60 * 60 * 1000,
      ),
      transactionId: result.transactionId,
    });
  } catch (error) {
    console.error('Error claiming free credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// GET endpoint to check claim status
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last free credit claim
    const lastClaimResult = await db
      .select({
        createdAt: creditTransactions.createdAt,
        delta: creditTransactions.delta,
      })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, currentUser.id!),
          eq(creditTransactions.reason, 'user_claimed_free'),
        ),
      )
      .orderBy(sql`${creditTransactions.createdAt} desc`)
      .limit(1);

    const lastClaim = lastClaimResult[0];
    const now = Date.now();

    if (!lastClaim) {
      // Never claimed before
      return NextResponse.json({
        canClaim: true,
        hoursUntilNextClaim: 0,
        nextClaimTime: null,
        lastClaimAmount: 0,
        lastClaimTime: null,
      });
    }

    const timeSinceLastClaim = now - lastClaim.createdAt.getTime();
    const cooldownMs = FREE_CREDIT_COOLDOWN_HOURS * 60 * 60 * 1000;
    const canClaim = timeSinceLastClaim >= cooldownMs;

    return NextResponse.json({
      canClaim,
      hoursUntilNextClaim: canClaim
        ? 0
        : Math.ceil((cooldownMs - timeSinceLastClaim) / (1000 * 60 * 60)),
      nextClaimTime: canClaim
        ? null
        : new Date(lastClaim.createdAt.getTime() + cooldownMs),
      lastClaimAmount: Math.abs(lastClaim.delta),
      lastClaimTime: lastClaim.createdAt,
    });
  } catch (error) {
    console.error('Error checking claim status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
