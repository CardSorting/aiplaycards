import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '../../../../src/db';
import { cards } from '../../../../src/db/schema';
import { RateLimitService } from '../../../../src/services/rate-limit-service';
import { and, count, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  console.log('[submit-card] Received card submission request.');

  try {
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser) {
      console.log('[submit-card] Unauthorized.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardId }: { cardId: number } = await request.json();
    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 },
      );
    }

    console.log(
      `[submit-card] User ${currentUser.id!} submitting card ${cardId} to community pool`,
    );

    // Verify the card exists and belongs to the user
    const card = await db
      .select()
      .from(cards)
      .where(and(eq(cards.id, cardId), eq(cards.userId, currentUser.id!)))
      .limit(1);

    if (!card.length) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 },
      );
    }

    const userCard = card[0];

    // Check if user already has cards in the community pool (rate limiting)
    const userCommunityCards = await db
      .select({ count: count() })
      .from(cards)
      .where(
        and(
          eq(cards.userId, currentUser.id!),
          eq(cards.pregenerated, true),
          eq(cards.packSlug, 'community'),
        ),
      );

    const MAX_USER_COMMUNITY_CARDS = 10; // Limit per user
    if (userCommunityCards[0]?.count >= MAX_USER_COMMUNITY_CARDS) {
      return NextResponse.json(
        {
          error: `You can only have up to ${MAX_USER_COMMUNITY_CARDS} cards in the community pool. Please collect or remove some cards first.`,
        },
        { status: 429 },
      );
    }

    // Rate limiting: Check if user has submitted cards recently
    const canSubmit = await RateLimitService.canSubmitToCommunity(
      currentUser.id!,
    );
    if (!canSubmit.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. ${
            canSubmit.message || 'Please wait before submitting another card.'
          }`,
        },
        { status: 429 },
      );
    }

    // Ensure the card has an image (required for community cards)
    const imageData = userCard.imageData as any; // Cast to any to handle the dynamic type
    if (!imageData?.dataUrl && !imageData?.generated?.length) {
      return NextResponse.json(
        { error: 'Card must have an image to be submitted to the community' },
        { status: 400 },
      );
    }

    // Check if a card with the same name already exists in the community pool
    const existingCommunityCard = await db
      .select()
      .from(cards)
      .where(
        and(
          eq(cards.name, userCard.name),
          eq(cards.pregenerated, true),
          eq(cards.packSlug, 'community'),
        ),
      )
      .limit(1);

    if (existingCommunityCard.length > 0) {
      return NextResponse.json(
        {
          error: 'A card with this name already exists in the community pool',
        },
        { status: 409 },
      );
    }

    // Create a copy of the card for the community pool
    try {
      const communityCardData = {
        name: userCard.name,
        description:
          imageData?.description ||
          `${userCard.name} - A community created card`,
        type: userCard.type,
        subtype: userCard.subtype,
        supertype: userCard.supertype,
        rarity: userCard.rarity,
        hitpoints: userCard.hitpoints,
        cardNumber: userCard.cardNumber,
        totalInSet: userCard.totalInSet,
        illustrator: userCard.illustrator,
        dexStats: userCard.dexStats,
        moves: userCard.moves,
        ability: userCard.ability,
        weakness: userCard.weakness,
        resistance: userCard.resistance,
        retreatCost: userCard.retreatCost,
        imageData: userCard.imageData,
        cardEditorState: userCard.cardEditorState,
        animationUrl: userCard.animationUrl,
        animationKey: userCard.animationKey,
        animationPrompt: userCard.animationPrompt,
        animatedAt: userCard.animatedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        userId: currentUser.id, // Track the original creator
        source: 'community-submission',
        pregenerated: true, // Community cards are pre-generated
        packSlug: 'community', // Community pool identifier
        raritySlot: 'community', // Special rarity slot for community cards
      };

      const result = await db
        .insert(cards)
        .values(communityCardData)
        .returning({ id: cards.id });

      // Record the rate limit action
      await RateLimitService.recordCommunitySubmission(currentUser.id!);

      console.log(
        `[submit-card] Successfully submitted card to community pool. Community card ID: ${result[0].id}`,
      );

      return NextResponse.json({
        success: true,
        communityCardId: result[0].id,
        message: `Successfully submitted "${userCard.name}" to the community pool!`,
      });
    } catch (error) {
      console.error('[submit-card] Failed to create community card:', error);
      return NextResponse.json(
        { error: 'Failed to submit card to community pool' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('[submit-card] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
