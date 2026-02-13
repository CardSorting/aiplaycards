import { NextRequest, NextResponse } from 'next/server';
import { cardLikeQueries, cardQueries } from '../../../../../src/db/queries';
import { dbUtils } from '../../../../../src/db/utils';
import { notificationService } from '../../../../../src/services/notification-service';

export async function GET(
  request: NextRequest,
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
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const isLiked = userId
      ? await cardLikeQueries.isLiked(cardId, userId)
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
    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId))
      return NextResponse.json(
        { success: false, error: 'Invalid card id' },
        { status: 400 },
      );
    const body = await request.json().catch(() => ({}));
    const action = (body?.action || '').toString();
    const userId = body?.userId;
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 },
      );
    if (action === 'like') {
      const liked = await cardLikeQueries.like(cardId, userId);

      // Create notification for the card owner
      if (liked) {
        try {
          const card = await cardQueries.getById(cardId);
          if (card && card.userId && card.userId !== userId) {
            await notificationService.notifyCardLiked(
              card.userId,
              userId,
              cardId,
              card.name,
              body?.userName || undefined,
            );
          }
        } catch (error) {
          console.error('Failed to create like notification:', error);
        }
      }
    } else if (action === 'unlike') {
      await cardLikeQueries.unlike(cardId, userId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 },
      );
    }
    const count = await cardLikeQueries.count(cardId);
    const isLiked = await cardLikeQueries.isLiked(cardId, userId);
    return NextResponse.json({ success: true, data: { count, isLiked } });
  } catch (e) {
    console.error('[likes] POST error', e);
    return NextResponse.json(
      { success: false, error: 'Failed to update like' },
      { status: 500 },
    );
  }
}
