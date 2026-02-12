import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../src/db';
import { cards, collectionCards, collections } from '../../../../src/db/schema';
import { auth } from '../../../../auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { collectionId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { collectionId } = params;
    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 },
      );
    }

    const collectionIdNum = parseInt(collectionId);
    if (isNaN(collectionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
        { status: 400 },
      );
    }

    // Get collection details
    const collectionData = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionIdNum),
          eq(collections.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!collectionData.length) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 },
      );
    }

    const collection = collectionData[0];

    // Get cards in this collection
    const collectionCardData = await db
      .select({
        card: cards,
        position: collectionCards.position,
        addedAt: collectionCards.addedAt,
      })
      .from(collectionCards)
      .innerJoin(cards, eq(collectionCards.cardId, cards.id))
      .where(
        and(
          eq(collectionCards.collectionId, collectionIdNum),
          eq(collectionCards.userId, session.user.id),
        ),
      )
      .orderBy(collectionCards.position);

    return NextResponse.json({
      success: true,
      collection: {
        ...collection,
        cards: collectionCardData.map((item: any) => ({
          ...item.card,
          collectionPosition: item.position,
          addedToCollectionAt: item.addedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Collection fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { collectionId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { collectionId } = params;
    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 },
      );
    }

    const collectionIdNum = parseInt(collectionId);
    if (isNaN(collectionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, description, tags, isPrivate, coverImageUrl } = body;

    // Verify collection ownership
    const existingCollection = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionIdNum),
          eq(collections.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!existingCollection.length) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 },
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 },
      );
    }

    const updatedCollection = await db
      .update(collections)
      .set({
        name: name.trim(),
        description: description?.trim(),
        tags,
        isPrivate,
        coverImageUrl,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(collections.id, collectionIdNum),
          eq(collections.userId, session.user.id),
        ),
      )
      .returning();

    return NextResponse.json({
      success: true,
      collection: updatedCollection[0],
    });
  } catch (error) {
    console.error('Collection update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { collectionId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { collectionId } = params;
    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 },
      );
    }

    const collectionIdNum = parseInt(collectionId);
    if (isNaN(collectionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
        { status: 400 },
      );
    }

    // Delete collection (cascade will handle collection_cards)
    const deletedCollection = await db
      .delete(collections)
      .where(
        and(
          eq(collections.id, collectionIdNum),
          eq(collections.userId, session.user.id),
        ),
      )
      .returning();

    if (!deletedCollection.length) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    console.error('Collection delete error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
