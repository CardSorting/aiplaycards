import { NextRequest, NextResponse } from 'next/server';
import { cardLikeQueries, cardQueries } from '../../../../../src/db/queries';
import { dbUtils } from '../../../../../src/db/utils';
import { auth } from '../../../../../auth';
import { notificationService } from '../../../../../src/services/notification-service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    dbUtils.validateEnv();
    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId))
      return NextResponse.json(
        { success: false, error: 'Invalid card id' },
        { status: 400 },
      );
    const count = await cardLikeQueries.count(cardId);
    const session = await auth();
    const currentUser = session?.user;
    const isLiked = currentUser
      ? await cardLikeQueries.isLiked(cardId, currentUser.id!)
      : false;
    return NextResponse.json({ success: true, data: { count, isLiked } });
  } catch (e) {
    console.error('[likes] GET error', e);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likes' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    dbUtils.validateEnv();
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId))
      return NextResponse.json(
        { success: false, error: 'Invalid card id' },
        { status: 400 },
      );
    const body = await request.json().catch(() => ({}));
    const action = (body?.action || '').toString();
    if (action === 'like') {
      const liked = await cardLikeQueries.like(cardId, currentUser.id!);

      // Create notification for the card owner
      if (liked) {
        try {
          const card = await cardQueries.getById(cardId);
          if (card && card.userId && card.userId !== currentUser.id!) {
            await notificationService.notifyCardLiked(
              card.userId,
              currentUser.id!,
              cardId,
              card.name,
              currentUser.name || currentUser.email || undefined,
            );
          }
        } catch (error) {
          console.error('Failed to create like notification:', error);
        }
      }
    } else if (action === 'unlike') {
      await cardLikeQueries.unlike(cardId, currentUser.id!);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 },
      );
    }
    const count = await cardLikeQueries.count(cardId);
    const isLiked = await cardLikeQueries.isLiked(cardId, currentUser.id!);
    return NextResponse.json({ success: true, data: { count, isLiked } });
  } catch (e) {
    console.error('[likes] POST error', e);
    return NextResponse.json(
      { success: false, error: 'Failed to update like' },
      { status: 500 },
    );
  }
}
