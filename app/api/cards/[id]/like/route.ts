import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../src/db';
import { cardLikes } from '../../../../../src/db/schema/card-social';
import { cards } from '../../../../../src/db/schema/cards';
import { auth } from '../../../../../auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id } = await params;
    const cardId = parseInt(id);
    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
    }

    // Check if card exists and is public
    const card = await db
      .select({ id: cards.id, isPublic: cards.isPublic })
      .from(cards)
      .where(eq(cards.id, cardId))
      .limit(1);

    if (card.length === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (!card[0].isPublic) {
      return NextResponse.json(
        { error: 'Card is not public' },
        { status: 403 },
      );
    }

    // Check if already liked
    const existingLike = await db
      .select({ id: cardLikes.id })
      .from(cardLikes)
      .where(and(eq(cardLikes.cardId, cardId), eq(cardLikes.userId, userId)))
      .limit(1);

    if (existingLike.length > 0) {
      return NextResponse.json(
        { error: 'Card already liked' },
        { status: 409 },
      );
    }

    // Add like
    await db.insert(cardLikes).values({
      cardId,
      userId,
    });

    // Get updated like count
    const likesCount = await db
      .select({ count: cardLikes.id })
      .from(cardLikes)
      .where(eq(cardLikes.cardId, cardId));

    return NextResponse.json({
      success: true,
      isLiked: true,
      likesCount: likesCount.length,
    });
  } catch (error) {
    console.error('Error liking card:', error);
    return NextResponse.json({ error: 'Failed to like card' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id } = await params;
    const cardId = parseInt(id);
    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
    }

    // Remove like
    const result = await db
      .delete(cardLikes)
      .where(and(eq(cardLikes.cardId, cardId), eq(cardLikes.userId, userId)))
      .returning({ id: cardLikes.id });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    // Get updated like count
    const likesCount = await db
      .select({ count: cardLikes.id })
      .from(cardLikes)
      .where(eq(cardLikes.cardId, cardId));

    return NextResponse.json({
      success: true,
      isLiked: false,
      likesCount: likesCount.length,
    });
  } catch (error) {
    console.error('Error unliking card:', error);
    return NextResponse.json(
      { error: 'Failed to unlike card' },
      { status: 500 },
    );
  }
}
