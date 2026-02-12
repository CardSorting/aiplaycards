import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import {
  cards,
  customBoosterPackCards,
  customBoosterPackListings,
  customBoosterPacks,
  users,
} from '@db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { normalizeCardData } from '@components/CardDisplayWrapper/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listingId = parseInt(id);
    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'Invalid listing ID' },
        { status: 400 },
      );
    }

    // Get the listing with pack details
    const [listing] = await db
      .select({
        id: customBoosterPackListings.id,
        packId: customBoosterPackListings.packId,
        name: customBoosterPacks.name,
        description: customBoosterPacks.description,
        packSize: customBoosterPacks.packSize,
        packsAvailable: customBoosterPackListings.packsAvailable,
        priceCredits: customBoosterPackListings.priceCredits,
        priceUsd: customBoosterPackListings.priceUsd,
        sellerUserId: customBoosterPackListings.sellerUserId,
        sellerUsername: users.username,
        createdAt: customBoosterPackListings.createdAt,
      })
      .from(customBoosterPackListings)
      .innerJoin(
        customBoosterPacks,
        eq(customBoosterPackListings.packId, customBoosterPacks.id),
      )
      .leftJoin(users, eq(customBoosterPackListings.sellerUserId, users.userId))
      .where(
        and(
          eq(customBoosterPackListings.id, listingId),
          eq(customBoosterPackListings.status, 'active'),
          eq(customBoosterPacks.isActive, true),
        ),
      );

    if (!listing) {
      return NextResponse.json(
        { error: 'Booster pack not found' },
        { status: 404 },
      );
    }

    // Get preview cards from the pack (limit to 8 for preview)
    const packCards = await db
      .select({
        id: cards.id,
        name: cards.name,
        type: cards.type,
        rarity: cards.rarity,
        imageData: cards.imageData,
        userId: cards.userId,
      })
      .from(customBoosterPackCards)
      .innerJoin(cards, eq(customBoosterPackCards.cardId, cards.id))
      .where(eq(customBoosterPackCards.packId, listing.packId))
      .limit(8);

    // Get total card count
    const [{ totalCards }] = await db
      .select({
        totalCards: sql<number>`count(*)`,
      })
      .from(customBoosterPackCards)
      .where(eq(customBoosterPackCards.packId, listing.packId));

    // Normalize card data for consistent field naming
    const previewCards = packCards.map(card => normalizeCardData(card));

    const result = {
      ...listing,
      previewCards,
      totalCards,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching booster pack details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booster pack details' },
      { status: 500 },
    );
  }
}
