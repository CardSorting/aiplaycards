import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../../src/db';
import { collectionLikes } from '../../../../../../src/db/schema/card-social';
import { auth } from '../../../../../../auth';

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

    const session = await auth();
    const userId = session?.user?.id;

    // Get total likes count
    const likes = await db
      .select()
      .from(collectionLikes)
      .where(eq(collectionLikes.collectionId, parseInt(collectionId)));

    let isLiked = false;

    // If user is authenticated, check if they liked this collection
    if (userId) {
      const userLike = await db
        .select()
        .from(collectionLikes)
        .where(
          and(
            eq(collectionLikes.collectionId, parseInt(collectionId)),
            eq(collectionLikes.userId, userId),
          ),
        )
        .limit(1);

      isLiked = userLike.length > 0;
    }

    return NextResponse.json({
      success: true,
      likesCount: likes.length,
      isLiked,
    });
  } catch (error) {
    console.error('Collection likes status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collection likes status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
