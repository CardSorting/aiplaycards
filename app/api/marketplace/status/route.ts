import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { marketplaceListings } from '../../../../src/db/schema/marketplace';
import { inArray } from 'drizzle-orm';
import { auth } from '../../../../auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { cardIds } = body;

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cardIds array' },
        { status: 400 },
      );
    }

    // Validate all cardIds are numbers
    const validCardIds = cardIds.filter(id => Number.isInteger(id) && id > 0);
    if (validCardIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get active listings for these cards
    const listings = await db
      .select({
        id: marketplaceListings.id,
        cardId: marketplaceListings.cardId,
        status: marketplaceListings.status,
        priceCredits: marketplaceListings.priceCredits,
        createdAt: marketplaceListings.createdAt,
      })
      .from(marketplaceListings)
      .where(inArray(marketplaceListings.cardId, validCardIds));

    return NextResponse.json({ data: listings });
  } catch (error) {
    console.error('[marketplace/status] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to get listing status' },
      { status: 500 },
    );
  }
}
