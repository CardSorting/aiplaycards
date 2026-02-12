import { db } from '../../db';
import {
  claimedSpecialCards,
  specialPackClaims,
} from '../../db/schema/special-collection';
import { desc, eq } from 'drizzle-orm';

export interface ClaimedCard {
  id: number;
  cardName: string;
  imageUrl: string;
  rarity: string;
  categoryId?: number | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  claimedAt: Date;
  originalSlotNumber: number;
  packClaimId: number;
}

export interface PackClaim {
  id: number;
  packDisplayName: string;
  categoryId?: number | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  claimedAt: Date;
  totalCards: number;
  cardsReceived: number;
  status: string;
  cards: ClaimedCard[];
}

export interface CollectionStats {
  totalCards: number;
  totalPacks: number;
  categoriesCount: number;
  recentClaimsCount: number; // Last 7 days
}

export interface ClaimPackResult {
  success: boolean;
  packClaimId?: number;
  claimedCards?: ClaimedCard[];
  redirectUrl?: string;
  error?: string;
}

export interface OpenPackResult {
  success: boolean;
  claimedCards?: ClaimedCard[];
  newBalance?: number;
  redirectUrl?: string;
  error?: string;
}

export class SpecialCollectionService {
  /**
   * Get user's special collection organized by pack claims
   */
  static async getUserCollection(userId: string): Promise<PackClaim[]> {
    try {
      const packClaims = await db
        .select({
          claimId: specialPackClaims.id,
          packDisplayName: specialPackClaims.packDisplayName,
          categoryId: specialPackClaims.categoryId,
          categoryName: specialPackClaims.categoryName,
          categoryColor: specialPackClaims.categoryColor,
          claimedAt: specialPackClaims.claimedAt,
          totalCards: specialPackClaims.totalCards,
          cardsReceived: specialPackClaims.cardsReceived,
          status: specialPackClaims.status,
          // Card details
          cardId: claimedSpecialCards.id,
          cardName: claimedSpecialCards.cardName,
          imageUrl: claimedSpecialCards.imageUrl,
          rarity: claimedSpecialCards.rarity,
          originalSlotNumber: claimedSpecialCards.originalSlotNumber,
        })
        .from(specialPackClaims)
        .leftJoin(
          claimedSpecialCards,
          eq(claimedSpecialCards.packClaimId, specialPackClaims.id),
        )
        .where(eq(specialPackClaims.userId, userId))
        .orderBy(
          desc(specialPackClaims.claimedAt),
          claimedSpecialCards.originalSlotNumber,
        );

      // Group cards by pack claim
      const packMap = new Map<number, PackClaim>();

      for (const row of packClaims) {
        if (!packMap.has(row.claimId)) {
          packMap.set(row.claimId, {
            id: row.claimId,
            packDisplayName: row.packDisplayName,
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            categoryColor: row.categoryColor,
            claimedAt: row.claimedAt,
            totalCards: row.totalCards,
            cardsReceived: row.cardsReceived,
            status: row.status,
            cards: [],
          });
        }

        if (
          row.cardId &&
          row.cardName &&
          row.imageUrl &&
          row.rarity &&
          row.originalSlotNumber !== null
        ) {
          packMap.get(row.claimId)!.cards.push({
            id: row.cardId,
            cardName: row.cardName,
            imageUrl: row.imageUrl,
            rarity: row.rarity,
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            categoryColor: row.categoryColor,
            claimedAt: row.claimedAt,
            originalSlotNumber: row.originalSlotNumber,
            packClaimId: row.claimId,
          });
        }
      }

      return Array.from(packMap.values());
    } catch (error) {
      console.error(
        '[SpecialCollectionService] Failed to get user collection:',
        error,
      );
      return [];
    }
  }

  /**
   * Get collection statistics for dashboard
   */
  static async getCollectionStats(userId: string): Promise<CollectionStats> {
    try {
      // Get total cards
      const totalCardsResult = await db
        .select({ count: claimedSpecialCards.id })
        .from(claimedSpecialCards)
        .where(eq(claimedSpecialCards.ownerId, userId));

      // Get total packs
      const totalPacksResult = await db
        .select({ count: specialPackClaims.id })
        .from(specialPackClaims)
        .where(eq(specialPackClaims.userId, userId));

      // Get unique categories
      const categoriesResult = await db
        .selectDistinct({ categoryId: claimedSpecialCards.categoryId })
        .from(claimedSpecialCards)
        .where(eq(claimedSpecialCards.ownerId, userId));

      // Get recent claims (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentClaimsResult = await db
        .select({ count: specialPackClaims.id })
        .from(specialPackClaims)
        .where(
          eq(specialPackClaims.userId, userId),
        );

      return {
        totalCards: totalCardsResult.length,
        totalPacks: totalPacksResult.length,
        categoriesCount: categoriesResult.filter(c => c.categoryId !== null)
          .length,
        recentClaimsCount: recentClaimsResult.length,
      };
    } catch (error) {
      console.error(
        '[SpecialCollectionService] Failed to get collection stats:',
        error,
      );
      return {
        totalCards: 0,
        totalPacks: 0,
        categoriesCount: 0,
        recentClaimsCount: 0,
      };
    }
  }

  /**
   * Get cards by category for filtered view
   */
  static async getCardsByCategory(
    userId: string,
    categoryId?: number,
  ): Promise<ClaimedCard[]> {
    try {
      const whereCondition = categoryId
        ? eq(claimedSpecialCards.categoryId, categoryId)
        : undefined;

      return await db
        .select({
          id: claimedSpecialCards.id,
          cardName: claimedSpecialCards.cardName,
          imageUrl: claimedSpecialCards.imageUrl,
          rarity: claimedSpecialCards.rarity,
          categoryId: claimedSpecialCards.categoryId,
          categoryName: claimedSpecialCards.categoryName,
          categoryColor: claimedSpecialCards.categoryColor,
          claimedAt: claimedSpecialCards.claimedAt,
          originalSlotNumber: claimedSpecialCards.originalSlotNumber,
          packClaimId: claimedSpecialCards.packClaimId,
        })
        .from(claimedSpecialCards)
        .where(whereCondition ? eq(claimedSpecialCards.ownerId, userId) && whereCondition : eq(claimedSpecialCards.ownerId, userId))
        .orderBy(desc(claimedSpecialCards.claimedAt));
    } catch (error) {
      console.error(
        '[SpecialCollectionService] Failed to get cards by category:',
        error,
      );
      return [];
    }
  }

  /**
   * Get individual card by ID for detail view
   */
  static async getCardById(
    userId: string,
    cardId: number,
  ): Promise<ClaimedCard | null> {
    try {
      const result = await db
        .select({
          id: claimedSpecialCards.id,
          cardName: claimedSpecialCards.cardName,
          imageUrl: claimedSpecialCards.imageUrl,
          rarity: claimedSpecialCards.rarity,
          categoryId: claimedSpecialCards.categoryId,
          categoryName: claimedSpecialCards.categoryName,
          categoryColor: claimedSpecialCards.categoryColor,
          claimedAt: claimedSpecialCards.claimedAt,
          originalSlotNumber: claimedSpecialCards.originalSlotNumber,
          packClaimId: claimedSpecialCards.packClaimId,
        })
        .from(claimedSpecialCards)
        .where(
          eq(claimedSpecialCards.id, cardId),
        )
        .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(
        '[SpecialCollectionService] Failed to get card by ID:',
        error,
      );
      return null;
    }
  }
}
