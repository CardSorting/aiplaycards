import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../src/db';
import { collectionLikes } from '../../../../../src/db/schema/card-social';
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

    // Get likes for a specific collection
    const likes = await db
      .select()
      .from(collectionLikes)
      .where(eq(collectionLikes.collectionId, parseInt(collectionId)));

    return NextResponse.json({
      success: true,
      likesCount: likes.length,
      isLiked: false, // We'll handle user-specific checks in a separate endpoint
    });
  } catch (error) {
    console.error('Collection likes fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collection likes',
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

    const { collectionId } = await request.json();

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID required' },
        { status: 400 },
      );
    }

    // Check if user already liked this collection
    const existingLike = await db
      .select()
      .from(collectionLikes)
      .where(
        and(
          eq(collectionLikes.collectionId, parseInt(collectionId)),
          eq(collectionLikes.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike - remove the like
      await db
        .delete(collectionLikes)
        .where(
          and(
            eq(collectionLikes.collectionId, parseInt(collectionId)),
            eq(collectionLikes.userId, session.user.id),
          ),
        );

      return NextResponse.json({
        success: true,
        message: 'Collection unliked',
        liked: false,
      });
    } else {
      // Like - add the like
      await db.insert(collectionLikes).values({
        collectionId: parseInt(collectionId),
        userId: session.user.id,
      });

      return NextResponse.json({
        success: true,
        message: 'Collection liked',
        liked: true,
      });
    }
  } catch (error) {
    console.error('Collection like toggle error:', error);
    return NextResponse.json(
      {
        error: 'Failed to toggle collection like',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
