import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { notificationService } from '../../../../src/services/notification-service';
import { dbUtils } from '../../../../src/db/utils';

export async function GET(_request: NextRequest) {
  try {
    dbUtils.validateEnv();

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadCount = await notificationService.getUnreadCount(user.id!);

    // Ensure unreadCount is always a valid number
    const safeUnreadCount =
      typeof unreadCount === 'number' && !isNaN(unreadCount)
        ? Math.max(0, Math.floor(unreadCount))
        : 0;

    return NextResponse.json({
      success: true,
      data: { unreadCount: safeUnreadCount },
    });
  } catch (error) {
    console.error('[notifications/count] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
