import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { db } from '@db';
import { customBoosterPackListings, customBoosterPacks } from '@db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id } = await params;
    const packId = parseInt(id);
    if (isNaN(packId)) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
    }

    const body = await request.json();
    const { priceCredits, priceUsd, packsAvailable = 1 } = body;

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

    // Verify the pack belongs to the user
    const [pack] = await db
      .select({
        id: customBoosterPacks.id,
        name: customBoosterPacks.name,
        creatorUserId: customBoosterPacks.creatorUserId,
        isActive: customBoosterPacks.isActive,
      })
      .from(customBoosterPacks)
      .where(
        and(
          eq(customBoosterPacks.id, packId),
          eq(customBoosterPacks.creatorUserId, session.user.id),
        ),
      );

    if (!pack) {
      return NextResponse.json(
        {
          error: 'Pack not found or you do not have permission to list it',
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
          eq(customBoosterPackListings.sellerUserId, session.user.id),
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
        sellerUserId: session.user.id,
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
