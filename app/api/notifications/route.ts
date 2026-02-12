import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { notificationService } from '../../../src/services/notification-service';
import { dbUtils } from '../../../src/db/utils';

export async function GET(request: NextRequest) {
  try {
    dbUtils.validateEnv();

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await notificationService.getUserNotifications(
      user.id!,
      {
        limit: Math.min(limit, 100), // Cap at 100
        offset: Math.max(offset, 0),
        unreadOnly,
      },
    );

    const unreadCount = await notificationService.getUnreadCount(user.id!);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          limit,
          offset,
          hasMore: notifications.length === limit,
        },
      },
    });
  } catch (error) {
    console.error('[notifications] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    dbUtils.validateEnv();

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationIds } = body;

    if (action === 'markAsRead') {
      const success = await notificationService.markAsRead(
        user.id!,
        notificationIds,
      );

      if (success) {
        const unreadCount = await notificationService.getUnreadCount(user.id!);
        return NextResponse.json({
          success: true,
          data: { unreadCount },
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to mark as read' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[notifications] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
