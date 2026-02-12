import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '@db';
import { cards, customBoosterPackCards, customBoosterPacks } from '@db/schema';
import { and, eq, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      packSize = 5,
      totalPacks = 1,
      cards: cardData,
    } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pack name is required' },
        { status: 400 },
      );
    }

    if (!Array.isArray(cardData) || cardData.length === 0) {
      return NextResponse.json(
        { error: 'At least one card is required' },
        { status: 400 },
      );
    }

    if (packSize < 1 || packSize > cardData.length) {
      return NextResponse.json(
        {
          error: `Pack size must be between 1 and ${cardData.length}`,
        },
        { status: 400 },
      );
    }

    // Verify all cards belong to the user
    const cardIds = cardData.map(c => c.cardId);
    const userCards = await db
      .select({ id: cards.id })
      .from(cards)
      .where(
        and(eq(cards.userId, session.user.id), inArray(cards.id, cardIds)),
      );

    if (userCards.length !== cardIds.length) {
      return NextResponse.json(
        {
          error: 'One or more cards do not belong to you',
        },
        { status: 403 },
      );
    }

    // Create the custom booster pack
    const [pack] = await db
      .insert(customBoosterPacks)
      .values({
        creatorUserId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        packSize,
        totalPacks,
        remainingPacks: totalPacks,
        isActive: true,
      })
      .returning();

    // Add cards to the pack
    const packCards = cardData.map(card => ({
      packId: pack.id,
      cardId: card.cardId,
      weight: Math.max(1, Math.min(10, card.weight || 1)), // Clamp weight between 1-10
    }));

    await db.insert(customBoosterPackCards).values(packCards);

    return NextResponse.json({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      packSize: pack.packSize,
      totalPacks: pack.totalPacks,
      cardCount: cardData.length,
    });
  } catch (error) {
    console.error('Error creating custom booster pack:', error);
    return NextResponse.json(
      { error: 'Failed to create custom booster pack' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereConditions = [eq(customBoosterPacks.isActive, true)];
    if (userId) {
      whereConditions.push(eq(customBoosterPacks.creatorUserId, userId));
    }

    const query = db
      .select({
        id: customBoosterPacks.id,
        name: customBoosterPacks.name,
        description: customBoosterPacks.description,
        packSize: customBoosterPacks.packSize,
        totalPacks: customBoosterPacks.totalPacks,
        remainingPacks: customBoosterPacks.remainingPacks,
        createdAt: customBoosterPacks.createdAt,
        creatorUserId: customBoosterPacks.creatorUserId,
      })
      .from(customBoosterPacks)
      .where(and(...whereConditions))
      .orderBy(customBoosterPacks.createdAt)
      .limit(limit)
      .offset(offset);

    const packs = await query;

    return NextResponse.json({
      data: packs,
      total: packs.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching custom booster packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom booster packs' },
      { status: 500 },
    );
  }
}
