import { db } from '../../../../../src/db';
import { cardRatings } from '../../../../../src/db/schema/card-social';
import { and, eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body?.userId;
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 },
      );

    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId))
      return NextResponse.json(
        { success: false, error: 'Invalid card id' },
        { status: 400 },
      );

    const ratingValue = parseInt(body.rating, 10);

    if (ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 },
      );
    }

    // Check if user already rated this card
    const existingRating = await db
      .select()
      .from(cardRatings)
      .where(
        and(
          eq(cardRatings.cardId, cardId),
          eq(cardRatings.userId, userId),
        ),
      )
      .limit(1);

    if (existingRating.length > 0) {
      // Update existing rating
      await db
        .update(cardRatings)
        .set({
          rating: ratingValue,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(cardRatings.cardId, cardId),
            eq(cardRatings.userId, userId),
          ),
        );
    } else {
      // Insert new rating
      await db.insert(cardRatings).values({
        cardId,
        userId,
        rating: ratingValue,
      });
    }

    // Get average rating and count
    const ratingStats = await db
      .select({
        averageRating: sql<number>`AVG(${cardRatings.rating})`,
        ratingCount: sql<number>`COUNT(*)`,
      })
      .from(cardRatings)
      .where(eq(cardRatings.cardId, cardId));

    const avgRating =
      Math.round((ratingStats[0]?.averageRating || 0) * 10) / 10;
    const count = Number(ratingStats[0]?.ratingCount || 0);

    return NextResponse.json({
      success: true,
      data: {
        rating: avgRating,
        count: count,
        isRated: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to submit rating' },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId))
      return NextResponse.json(
        { success: false, error: 'Invalid card id' },
        { status: 400 },
      );

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    // Get average rating and count
    const ratingStats = await db
      .select({
        averageRating: sql<number>`AVG(${cardRatings.rating})`,
        ratingCount: sql<number>`COUNT(*)`,
      })
      .from(cardRatings)
      .where(eq(cardRatings.cardId, cardId));

    const avgRating =
      Math.round((ratingStats[0]?.averageRating || 0) * 10) / 10;
    const count = Number(ratingStats[0]?.ratingCount || 0);

    // Check if current user has rated this card
    let isRated = false;
    if (userId) {
      const userRating = await db
        .select()
        .from(cardRatings)
        .where(
          and(
            eq(cardRatings.cardId, cardId),
            eq(cardRatings.userId, userId),
          ),
        )
        .limit(1);

      isRated = userRating.length > 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        rating: avgRating,
        count: count,
        isRated: isRated,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rating' },
      { status: 500 },
    );
  }
}
