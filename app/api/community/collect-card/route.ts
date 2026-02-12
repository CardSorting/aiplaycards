import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '../../../../auth';
import { db } from '../../../../src/db';
import { cards } from '../../../../src/db/schema';
import { CreditService } from '../../../../src/services/credit-service';

type CollectCardRequest = {
  cardId: number;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser || !currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardId }: CollectCardRequest = await request.json();
    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 },
      );
    }

    // Verify the card exists and is in the community pool
    const card = await db
      .select()
      .from(cards)
      .where(
        and(
          eq(cards.id, cardId),
          eq(cards.pregenerated, true),
          eq(cards.packSlug, 'community'),
        ),
      )
      .limit(1);

    if (!card.length) {
      return NextResponse.json(
        { error: 'Card not found in community pool' },
        { status: 404 },
      );
    }

    // Check if user already owns this card
    const existingOwnership = await db
      .select()
      .from(cards)
      .where(
        and(
          eq(cards.name, card[0].name),
          eq(cards.userId, currentUser.id!),
          eq(cards.pregenerated, false),
        ),
      )
      .limit(1);

    if (existingOwnership.length > 0) {
      return NextResponse.json(
        { error: 'You already own this card' },
        { status: 400 },
      );
    }

    // Check if user has enough credits (maybe lower cost than pack opening?)
    const COLLECTION_COST_CREDITS = 10; // Lower cost for collecting individual cards
    const hasCredits = await CreditService.hasEnoughCredits(
      currentUser.id!,
      COLLECTION_COST_CREDITS,
    );
    if (!hasCredits) {
      const balance = await CreditService.getBalance(currentUser.id);
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: COLLECTION_COST_CREDITS,
          balance: balance?.balance || 0,
        },
        { status: 400 },
      );
    }

    // Deduct credits
    try {
      const deductionResult = await CreditService.deductCredits({
        userId: currentUser.id,
        amount: COLLECTION_COST_CREDITS,
        reason: `Collected "${card[0].name}" from community pool`,
        metadata: { cardId, cardName: card[0].name },
      });

      if (!deductionResult.success) {
        return NextResponse.json(
          { error: 'Failed to process payment' },
          { status: 500 },
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 },
      );
    }

    // Create a new copy of the card for the user
    try {
      const newCardData = {
        name: card[0].name,
        description: card[0].description,
        type: card[0].type,
        subtype: card[0].subtype,
        supertype: card[0].supertype,
        rarity: card[0].rarity,
        hitpoints: card[0].hitpoints,
        cardNumber: card[0].cardNumber,
        totalInSet: card[0].totalInSet,
        illustrator: card[0].illustrator,
        dexStats: card[0].dexStats,
        moves: card[0].moves,
        ability: card[0].ability,
        weakness: card[0].weakness,
        resistance: card[0].resistance,
        retreatCost: card[0].retreatCost,
        imageData: card[0].imageData,
        cardEditorState: card[0].cardEditorState,
        animationUrl: card[0].animationUrl,
        animationKey: card[0].animationKey,
        animationPrompt: card[0].animationPrompt,
        animatedAt: card[0].animatedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        userId: currentUser.id, // Now owned by the collector
        source: 'community-collection',
        pregenerated: false, // No longer in pre-generated pool
        packSlug: null, // Not part of a pack anymore
        raritySlot: null, // Not part of pre-generated system anymore
      };

      const result = await db
        .insert(cards)
        .values(newCardData)
        .returning({ id: cards.id });

      return NextResponse.json({
        success: true,
        cardId: result[0].id,
        message: `Successfully collected "${card[0].name}"`,
        creditsDeducted: COLLECTION_COST_CREDITS,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to collect card' },
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
