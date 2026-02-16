import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/db';
import {
  cards,
  claimedSpecialCards,
  marketplaceListings,
  mtgCards,
  users,
  yugiohCards,
} from '../../../src/db';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { auth } from '../../../auth';
import { dbUtils } from '../../../src/db/utils';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    await dbUtils.ensurePerformanceIndexes();
    const url = new URL(request.url);
    const limit = Math.max(
      1,
      Math.min(50, parseInt(url.searchParams.get('limit') || '20', 10)),
    );
    const offset = Math.max(
      0,
      parseInt(url.searchParams.get('offset') || '0', 10),
    );
    const seller = url.searchParams.get('seller');
    const statusParam = (url.searchParams.get('status') || '').toLowerCase(); // active | sold | canceled
    const search = (url.searchParams.get('search') || '').trim();
    const sort = (url.searchParams.get('sort') || 'new').toLowerCase(); // new | price_asc | price_desc
    const cardIdParam = url.searchParams.get('cardId');
    const cardId = cardIdParam ? parseInt(cardIdParam, 10) : undefined;
    const minPriceParam = url.searchParams.get('minPrice');
    const maxPriceParam = url.searchParams.get('maxPrice');
    const minPrice = minPriceParam
      ? Math.max(0, parseInt(minPriceParam, 10) || 0)
      : undefined;
    const maxPrice = maxPriceParam
      ? Math.max(0, parseInt(maxPriceParam, 10) || 0)
      : undefined;
    const typeFilter = url.searchParams.get('type');
    const category = (
      url.searchParams.get('category') || 'monster'
    ).toLowerCase(); // monster | pokemon | duel | yugioh | spell | mtg | special

    // Base marketplace filters
    let where = and(
      eq(
        marketplaceListings.status,
        statusParam === 'sold' || statusParam === 'canceled'
          ? (statusParam as 'sold' | 'canceled')
          : 'active',
      ),
      eq(marketplaceListings.cardCategory, category),
      eq(marketplaceListings.moderationStatus, 'approved'), // Only show approved listings in public marketplace
    );

    if (seller)
      where = and(where, eq(marketplaceListings.sellerUserId, seller));
    if (Number.isFinite(cardId))
      where = and(where, eq(marketplaceListings.cardId, cardId!));
    if (Number.isFinite(minPrice))
      where = and(where, gte(marketplaceListings.priceCredits, minPrice!));
    if (Number.isFinite(maxPrice))
      where = and(where, lte(marketplaceListings.priceCredits, maxPrice!));

    let rows: unknown[] = [];
    let total = 0;

    if (category === 'pokemon' || category === 'monster') {
      // Pokemon cards query
      if (typeFilter) where = and(where, eq(cards.type, typeFilter));
      if (search)
        where = and(where, sql`${cards.name} ILIKE ${'%' + search + '%'}`);

      rows = await db
        .select({
          id: marketplaceListings.id,
          cardId: marketplaceListings.cardId,
          priceCredits: marketplaceListings.priceCredits,
          status: marketplaceListings.status,
          soldAt: marketplaceListings.soldAt,
          createdAt: marketplaceListings.createdAt,
          sellerUserId: marketplaceListings.sellerUserId,
          sellerUsername: users.username,
          cardName: cards.name,
          cardType: cards.type,
          cardSubtype: cards.subtype,
          cardSupertype: cards.supertype,
          cardRarity: cards.rarity,
          // Additional card fields for display
          name: cards.name,
          type: cards.type,
          subtype: cards.subtype,
          supertype: cards.supertype,
          rarity: cards.rarity,
          hitpoints: cards.hitpoints,
          isPublic: cards.isPublic,
          imageData: cards.imageData,
          cardEditorState: cards.cardEditorState,
          illustrator: cards.illustrator,
          description: cards.description,
          dexStats: cards.dexStats,
          ability: cards.ability,
          moves: cards.moves,
          primaryImage: sql<string>`(COALESCE((${cards.imageData} -> 'generated' ->> 0), NULL))`,
          primaryThumb: sql<string>`(COALESCE((${cards.imageData} -> 'thumbs' ->> 0), NULL))`,
        })
        .from(marketplaceListings)
        .innerJoin(cards, eq(cards.id, marketplaceListings.cardId))
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where)
        .orderBy(
          sort === 'price_asc'
            ? marketplaceListings.priceCredits
            : sort === 'price_desc'
            ? desc(marketplaceListings.priceCredits)
            : desc(marketplaceListings.createdAt),
        )
        .limit(limit)
        .offset(offset);

      const totalRows = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(marketplaceListings)
        .innerJoin(cards, eq(cards.id, marketplaceListings.cardId))
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where);
      total = totalRows?.[0]?.count ?? 0;
    } else if (category === 'yugioh' || category === 'duel') {
      // YuGiOh cards query
      if (typeFilter) where = and(where, eq(yugiohCards.cardType, typeFilter));
      if (search)
        where = and(
          where,
          sql`${yugiohCards.name} ILIKE ${'%' + search + '%'}`,
        );

      rows = await db
        .select({
          id: marketplaceListings.id,
          cardId: marketplaceListings.cardId,
          priceCredits: marketplaceListings.priceCredits,
          status: marketplaceListings.status,
          soldAt: marketplaceListings.soldAt,
          createdAt: marketplaceListings.createdAt,
          sellerUserId: marketplaceListings.sellerUserId,
          sellerUsername: users.username,
          // YuGiOh card fields
          name: yugiohCards.name,
          cardType: yugiohCards.cardType,
          cardSubtype: yugiohCards.cardSubtype,
          cardRare: yugiohCards.cardRare,
          cardAttr: yugiohCards.cardAttr,
          cardRace: yugiohCards.cardRace,
          cardLevel: yugiohCards.cardLevel,
          cardATK: yugiohCards.cardATK,
          cardDEF: yugiohCards.cardDEF,
          description: yugiohCards.description,
          isPendulum: yugiohCards.isPendulum,
          cardPendulumInfo: yugiohCards.cardPendulumInfo,
        })
        .from(marketplaceListings)
        .innerJoin(yugiohCards, eq(yugiohCards.id, marketplaceListings.cardId))
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where)
        .orderBy(
          sort === 'price_asc'
            ? marketplaceListings.priceCredits
            : sort === 'price_desc'
            ? desc(marketplaceListings.priceCredits)
            : desc(marketplaceListings.createdAt),
        )
        .limit(limit)
        .offset(offset);

      const totalRows = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(marketplaceListings)
        .innerJoin(yugiohCards, eq(yugiohCards.id, marketplaceListings.cardId))
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where);
      total = totalRows?.[0]?.count ?? 0;
    } else if (category === 'mtg' || category === 'spell') {
      // MTG cards query
      if (typeFilter) where = and(where, eq(mtgCards.type, typeFilter));
      if (search)
        where = and(where, sql`${mtgCards.name} ILIKE ${'%' + search + '%'}`);

      rows = await db
        .select({
          id: marketplaceListings.id,
          cardId: marketplaceListings.cardId,
          priceCredits: marketplaceListings.priceCredits,
          status: marketplaceListings.status,
          soldAt: marketplaceListings.soldAt,
          createdAt: marketplaceListings.createdAt,
          sellerUserId: marketplaceListings.sellerUserId,
          sellerUsername: users.username,
          // MTG card fields
          name: mtgCards.name,
          manaCost: mtgCards.manaCost,
          convertedManaCost: mtgCards.convertedManaCost,
          type: mtgCards.type,
          subTypes: mtgCards.subTypes,
          rarity: mtgCards.rarity,
          set: mtgCards.set,
          artist: mtgCards.artist,
          flavorText: mtgCards.flavorText,
          power: mtgCards.power,
          toughness: mtgCards.toughness,
          loyalty: mtgCards.loyalty,
          text: mtgCards.text,
          imageUrl: mtgCards.imageUrl,
          layout: mtgCards.layout,
          colors: mtgCards.colors,
          colorIdentity: mtgCards.colorIdentity,
          isToken: mtgCards.isToken,
          isPublic: mtgCards.isPublic,
          imageData: mtgCards.imageData,
          cardEditorState: mtgCards.cardEditorState,
          animationUrl: mtgCards.animationUrl,
          animationKey: mtgCards.animationKey,
          animationPrompt: mtgCards.animationPrompt,
          animatedAt: mtgCards.animatedAt,
          // Normalized fields for consistency
          description: mtgCards.text,
          supertype: sql<string>`'MTG'`,
          subtype: sql<string>`COALESCE(${mtgCards.subTypes}->0, ${mtgCards.type})`,
          primaryImage: sql<string>`(COALESCE((${mtgCards.imageData} -> 'generated' ->> 0), ${mtgCards.imageUrl}))`,
          primaryThumb: sql<string>`(COALESCE((${mtgCards.imageData} -> 'thumbs' ->> 0), ${mtgCards.imageUrl}))`,
        })
        .from(marketplaceListings)
        .innerJoin(mtgCards, eq(mtgCards.id, marketplaceListings.cardId))
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where)
        .orderBy(
          sort === 'price_asc'
            ? marketplaceListings.priceCredits
            : sort === 'price_desc'
            ? desc(marketplaceListings.priceCredits)
            : desc(marketplaceListings.createdAt),
        )
        .limit(limit)
        .offset(offset);

      const totalRows = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(marketplaceListings)
        .innerJoin(mtgCards, eq(mtgCards.id, marketplaceListings.cardId))
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where);
      total = totalRows?.[0]?.count ?? 0;
    } else if (category === 'special') {
      // Special collection cards query
      if (typeFilter)
        where = and(where, eq(claimedSpecialCards.rarity, typeFilter));
      if (search)
        where = and(
          where,
          sql`${claimedSpecialCards.cardName} ILIKE ${'%' + search + '%'}`,
        );

      rows = await db
        .select({
          id: marketplaceListings.id,
          cardId: marketplaceListings.cardId,
          priceCredits: marketplaceListings.priceCredits,
          status: marketplaceListings.status,
          soldAt: marketplaceListings.soldAt,
          createdAt: marketplaceListings.createdAt,
          sellerUserId: marketplaceListings.sellerUserId,
          sellerUsername: users.username,
          // Special collection card fields
          name: claimedSpecialCards.cardName,
          cardName: claimedSpecialCards.cardName,
          imageUrl: claimedSpecialCards.imageUrl,
          rarity: claimedSpecialCards.rarity,
          categoryId: claimedSpecialCards.categoryId,
          categoryName: claimedSpecialCards.categoryName,
          categoryColor: claimedSpecialCards.categoryColor,
          animationUrl: claimedSpecialCards.animationUrl,
          // Normalized fields for card display wrapper
          type: claimedSpecialCards.rarity,
          supertype: sql<string>`'Special'`,
          subtype: claimedSpecialCards.categoryName,
        })
        .from(marketplaceListings)
        .innerJoin(
          claimedSpecialCards,
          eq(claimedSpecialCards.id, marketplaceListings.cardId),
        )
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where)
        .orderBy(
          sort === 'price_asc'
            ? marketplaceListings.priceCredits
            : sort === 'price_desc'
            ? desc(marketplaceListings.priceCredits)
            : desc(marketplaceListings.createdAt),
        )
        .limit(limit)
        .offset(offset);

      const totalRows = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(marketplaceListings)
        .innerJoin(
          claimedSpecialCards,
          eq(claimedSpecialCards.id, marketplaceListings.cardId),
        )
        .innerJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
        .where(where);
      total = totalRows?.[0]?.count ?? 0;
    }

    return NextResponse.json(
      {
        data: rows,
        total,
        limit,
        page: Math.floor(offset / limit) + 1,
        category,
      },
      {
        headers: {
          'Cache-Control':
            'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        },
      },
    );
  } catch (e) {
    console.error('[marketplace] GET error', e);
    return NextResponse.json(
      { error: 'Failed to load marketplace' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    dbUtils.validateEnv();
    await dbUtils.ensurePerformanceIndexes();
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request
      .json()
      .catch(() => ({} as Record<string, unknown>));
    const cardId = parseInt(body?.cardId, 10);
    const priceCredits = parseInt(body?.priceCredits, 10);
    if (
      !Number.isFinite(cardId) ||
      !Number.isFinite(priceCredits) ||
      priceCredits <= 0
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Check if it's a Pokemon card
    const [pokemonCard] = await db
      .select()
      .from(cards)
      .where(and(eq(cards.id, cardId), eq(cards.userId, currentUser.id!)))
      .limit(1);

    // Check if it's a YuGiOh card
    const [yugiohCard] = await db
      .select()
      .from(yugiohCards)
      .where(
        and(
          eq(yugiohCards.id, cardId),
          eq(yugiohCards.userId, currentUser.id!),
        ),
      )
      .limit(1);

    // Check if it's an MTG card
    const [mtgCard] = await db
      .select()
      .from(mtgCards)
      .where(and(eq(mtgCards.id, cardId), eq(mtgCards.userId, currentUser.id!)))
      .limit(1);

    // Check if it's a Special Collection card
    const [specialCard] = await db
      .select()
      .from(claimedSpecialCards)
      .where(
        and(
          eq(claimedSpecialCards.id, cardId),
          eq(claimedSpecialCards.ownerId, currentUser.id!),
        ),
      )
      .limit(1);

    let cardCategory: string;
    if (pokemonCard) {
      cardCategory = 'monster';
    } else if (yugiohCard) {
      cardCategory = 'duel';
    } else if (mtgCard) {
      cardCategory = 'spell';
    } else if (specialCard) {
      cardCategory = 'special';
    } else {
      return NextResponse.json(
        { error: 'Card not found or not owned' },
        { status: 404 },
      );
    }

    // Prevent duplicate active listing for same card (1 of 1 per card instance)
    const existing = await db
      .select({ id: marketplaceListings.id })
      .from(marketplaceListings)
      .where(
        and(
          eq(marketplaceListings.cardId, cardId),
          eq(marketplaceListings.cardCategory, cardCategory),
          eq(marketplaceListings.status, 'active'),
        ),
      )
      .limit(1);
    if (existing[0])
      return NextResponse.json(
        { error: 'This card is already listed on the marketplace' },
        { status: 409 },
      );

    // Determine moderation status based on card category
    let moderationStatus = 'approved'; // Default for pokemon, yugioh, mtg cards
    if (cardCategory === 'special') {
      // Check if it's an ATC card (from special collection with ATC rarity)
      if (specialCard && specialCard.rarity === 'ATC') {
        moderationStatus = 'pending'; // ATC cards require approval
      }
    }

    const [row] = await db
      .insert(marketplaceListings)
      .values({
        cardId,
        cardCategory,
        sellerUserId: currentUser.id!,
        priceCredits,
        moderationStatus,
      })
      .returning();

    // Return different response based on moderation status
    if (moderationStatus === 'pending') {
      return NextResponse.json(
        {
          data: row,
          message:
            'Your ATC card listing has been submitted for approval and will appear on the marketplace once approved.',
          moderationStatus: 'pending',
        },
        { status: 201 },
      );
    }

    return NextResponse.json({ data: row }, { status: 201 });
  } catch (e) {
    console.error('[marketplace] POST error', e);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 },
    );
  }
}
