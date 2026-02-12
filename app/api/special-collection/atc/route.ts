import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '../../../../src/db';
import {
  claimedSpecialCards,
  specialPackClaims,
} from '../../../../src/db/schema/special-collection';
import { adminPackCreations } from '../../../../src/db/schema/admin-packs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const { imageUrl, cardName } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 },
      );
    }

    if (!cardName) {
      return NextResponse.json(
        { error: 'Card name is required' },
        { status: 400 },
      );
    }

    // Start transaction to ensure data consistency
    const result = await db.transaction(async tx => {
      // 1. Create a virtual pack claim for ATC cards (for organization)
      // First, create a dummy admin pack creation entry for ATC cards
      const [dummyPack] = await tx
        .insert(adminPackCreations)
        .values({
          templateId: 1, // Use a default template ID
          recipientUserId: userId,
          createdById: userId, // User creates their own ATC
          status: 'completed',
          totalCards: 1,
        })
        .returning();

      const [packClaim] = await tx
        .insert(specialPackClaims)
        .values({
          userId: userId,
          originalPackCreationId: dummyPack.id,
          packDisplayName: 'Artist Trading Cards',
          categoryId: null,
          categoryName: 'ATC',
          categoryColor: '#10B981', // Emerald green to match the ATC feature
          totalCards: 1,
          cardsReceived: 1,
          claimSessionId: `atc_${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}`,
        })
        .returning();

      // 2. Create the claimed card record
      const [claimedCard] = await tx
        .insert(claimedSpecialCards)
        .values({
          ownerId: userId,
          originalPackCreationId: dummyPack.id,
          cardName,
          imageUrl,
          rarity: 'ATC', // Special rarity for Artist Trading Cards
          categoryId: null,
          categoryName: 'ATC',
          categoryColor: '#10B981',
          packClaimId: packClaim.id,
          originalSlotNumber: 1,
          claimMethod: 'atc_creation',
        })
        .returning();

      return {
        packClaim,
        claimedCard,
      };
    });

    return NextResponse.json({
      success: true,
      card: {
        id: result.claimedCard.id,
        cardName: result.claimedCard.cardName,
        imageUrl: result.claimedCard.imageUrl,
        rarity: result.claimedCard.rarity,
        categoryName: result.claimedCard.categoryName,
        claimedAt: result.claimedCard.claimedAt,
      },
      redirectUrl: `/special-collection?highlight=${result.packClaim.id}&tab=atc`,
    });
  } catch (error) {
    console.error('[ATC] Save error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save ATC card',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
