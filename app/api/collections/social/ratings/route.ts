import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../../../../src/db';
import { collectionRatings } from '../../../../../src/db/schema/card-social';
import { auth } from '../../../../../auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID required' },
        { status: 400 },
      );
    }

    // Get ratings for a specific collection with user details
    const ratings = await db
      .select({
        id: collectionRatings.id,
        rating: collectionRatings.rating,
        createdAt: collectionRatings.createdAt,
        updatedAt: collectionRatings.updatedAt,
        user: {
          username: collectionRatings.userId, // We'll use userId as identifier since users table doesn't have name
        },
      })
      .from(collectionRatings)
      .where(eq(collectionRatings.collectionId, parseInt(collectionId)))
      .orderBy(desc(collectionRatings.createdAt));

    // Calculate average rating
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      totalRatings > 0 ? Math.round((sumRatings / totalRatings) * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      ratings,
      totalRatings,
      averageRating,
    });
  } catch (error) {
    console.error('Collection ratings fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collection ratings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { collectionId, rating } = await request.json();

    if (!collectionId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: 'Collection ID and rating (1-5) are required',
        },
        { status: 400 },
      );
    }

    // Check if user already rated this collection
    const existingRating = await db
      .select()
      .from(collectionRatings)
      .where(
        and(
          eq(collectionRatings.collectionId, parseInt(collectionId)),
          eq(collectionRatings.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existingRating.length > 0) {
      // Update existing rating
      await db
        .update(collectionRatings)
        .set({
          rating,
          updatedAt: new Date(),
        })
        .where(eq(collectionRatings.id, existingRating[0].id));

      return NextResponse.json({
        success: true,
        message: 'Rating updated successfully',
        isUpdate: true,
      });
    } else {
      // Create new rating
      await db.insert(collectionRatings).values({
        collectionId: parseInt(collectionId),
        userId: session.user.id,
        rating,
      });

      return NextResponse.json({
        success: true,
        message: 'Rating added successfully',
        isUpdate: false,
      });
    }
  } catch (error) {
    console.error('Collection rating submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit rating',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const ratingId = searchParams.get('ratingId');

    if (!ratingId) {
      return NextResponse.json(
        { error: 'Rating ID required' },
        { status: 400 },
      );
    }

    // Get the rating to check ownership
    const rating = await db
      .select()
      .from(collectionRatings)
      .where(eq(collectionRatings.id, parseInt(ratingId)))
      .limit(1);

    if (!rating.length) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
    }

    // Check if user owns the rating
    if (rating[0].userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own ratings' },
        { status: 403 },
      );
    }

    // Delete the rating
    await db
      .delete(collectionRatings)
      .where(eq(collectionRatings.id, parseInt(ratingId)));

    return NextResponse.json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    console.error('Collection rating deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete rating',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
