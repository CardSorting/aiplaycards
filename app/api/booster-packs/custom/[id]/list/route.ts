import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { customBoosterPackListings, customBoosterPacks } from '@db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const packId = parseInt(id);
    if (isNaN(packId)) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
    }

    const body = await request.json();
    const { priceCredits, priceUsd, packsAvailable = 1, sellerUserId } = body;

    // Validation
    if (!priceCredits || priceCredits < 1) {
      return NextResponse.json(
        { error: 'Price in credits is required and must be positive' },
        { status: 400 },
      );
    }

    if (!priceUsd || parseFloat(priceUsd) < 0.01) {
      return NextResponse.json(
        { error: 'Price in USD is required and must be at least $0.01' },
        { status: 400 },
      );
    }

    if (packsAvailable < 1 || packsAvailable > 1000) {
      return NextResponse.json(
        {
          error: 'Packs available must be between 1 and 1000',
        },
        { status: 400 },
      );
    }

    if (!sellerUserId) {
      return NextResponse.json(
        { error: 'Seller user ID is required' },
        { status: 400 },
      );
    }

    // Verify the pack exists
    const [pack] = await db
      .select({
        id: customBoosterPacks.id,
        name: customBoosterPacks.name,
        creatorUserId: customBoosterPacks.creatorUserId,
        isActive: customBoosterPacks.isActive,
      })
      .from(customBoosterPacks)
      .where(eq(customBoosterPacks.id, packId));

    if (!pack) {
      return NextResponse.json(
        {
          error: 'Pack not found',
        },
        { status: 404 },
      );
    }

    if (!pack.isActive) {
      return NextResponse.json(
        {
          error: 'Cannot list an inactive pack',
        },
        { status: 400 },
      );
    }

    // Check if there's already an active listing for this pack
    const [existingListing] = await db
      .select({ id: customBoosterPackListings.id })
      .from(customBoosterPackListings)
      .where(
        and(
          eq(customBoosterPackListings.packId, packId),
          eq(customBoosterPackListings.sellerUserId, sellerUserId),
          eq(customBoosterPackListings.status, 'active'),
        ),
      );

    if (existingListing) {
      return NextResponse.json(
        {
          error: 'This pack already has an active listing',
        },
        { status: 400 },
      );
    }

    // Create the listing
    const [listing] = await db
      .insert(customBoosterPackListings)
      .values({
        packId: pack.id,
        sellerUserId,
        priceCredits,
        priceUsd: parseFloat(priceUsd).toFixed(2),
        packsAvailable,
        status: 'active',
      })
      .returning();

    return NextResponse.json({
      listingId: listing.id,
      packId: pack.id,
      packName: pack.name,
      priceCredits,
      priceUsd: listing.priceUsd,
      packsAvailable,
      status: 'active',
      message: 'Pack listed successfully in the marketplace!',
    });
  } catch (error) {
    console.error('Error creating booster pack listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 },
    );
  }
}
