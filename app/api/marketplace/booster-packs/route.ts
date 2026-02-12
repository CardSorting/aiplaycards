import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import {
  customBoosterPackListings,
  customBoosterPacks,
  users,
} from '@db/schema';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'new';
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    let orderBy;
    switch (sort) {
      case 'price_asc':
        orderBy = customBoosterPackListings.priceUsd;
        break;
      case 'price_desc':
        orderBy = desc(customBoosterPackListings.priceUsd);
        break;
      default:
        orderBy = desc(customBoosterPackListings.createdAt);
        break;
    }

    const whereConditions = [
      eq(customBoosterPackListings.status, 'active'),
      eq(customBoosterPacks.isActive, true),
    ];

    // Add search filter if provided
    if (search && search.trim()) {
      whereConditions.push(
        ilike(customBoosterPacks.name, `%${search.trim()}%`),
      );
    }

    const query = db
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
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const listings = await query;

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(customBoosterPackListings)
      .innerJoin(
        customBoosterPacks,
        eq(customBoosterPackListings.packId, customBoosterPacks.id),
      )
      .where(and(...whereConditions));

    const [{ count: total }] = await countQuery;

    return NextResponse.json({
      data: listings,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching marketplace booster packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace booster packs' },
      { status: 500 },
    );
  }
}
