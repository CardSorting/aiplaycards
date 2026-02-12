import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { dbUtils } from '../../../src/db/utils';
import { userService } from '../../../src/services/user-service';
import { notificationService } from '../../../src/services/notification-service';
import { CreditService } from '../../../src/services/credit-service';
import { addSecurityHeaders } from '../../../src/middleware/credit-validation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    await dbUtils.ensurePerformanceIndexes();
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser) {
      return NextResponse.json(
        { credits: null },
        {
          status: 200,
          headers: { 'Cache-Control': 'private, max-age=30', Vary: 'Cookie' },
        },
      );
    }

    // Ensure user exists in local database with welcome credits if new
    let welcomeData: any = {};
    try {
      const email =
        (currentUser as any)?.email ?? (currentUser as any)?.email ?? undefined;
      const username =
        (currentUser as any)?.username ??
        (currentUser as any)?.name ??
        undefined;

      const result = await userService.ensureUserExists({
        userId: currentUser.id!,
        email,
        username,
      });

      // Add welcome data for new users
      if (result.isNewUser && result.creditsAwarded) {
        welcomeData = {
          isNewUser: true,
          welcomeMessage: notificationService.getWelcomeMessage(
            result.creditsAwarded,
          ),
          boosterInfo: notificationService.getBoosterUnlockMessage(
            result.creditsAwarded,
          ),
          onboardingTips: notificationService.getOnboardingTips(),
          creditsAwarded: result.creditsAwarded,
        };
      }
    } catch (e) {
      console.error('[credits] Failed to ensure user exists:', e);
      // Continue anyway to avoid breaking the credits check
    }

    // Use the enhanced credit service for balance retrieval
    const balance = await CreditService.getBalance(currentUser.id!);
    const credits = balance?.balance ?? 0;

    const response = NextResponse.json(
      {
        credits,
        isActive: balance?.isActive ?? false,
        ...welcomeData,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
          Vary: 'Cookie',
        },
      },
    );

    return addSecurityHeaders(response);
  } catch (e) {
    console.error('[credits] GET error', e);
    const response = NextResponse.json(
      { credits: null },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
    return addSecurityHeaders(response);
  }
}
