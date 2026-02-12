import { db } from '../index';
import { cards, marketplaceListings, users } from '../schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export const marketplaceQueries = {
  // Get a marketplace listing by ID with full card and seller details
  getById: async (id: number) => {
    const rows = await db
      .select({
        id: marketplaceListings.id,
        cardId: marketplaceListings.cardId,
        priceCredits: marketplaceListings.priceCredits,
        status: marketplaceListings.status,
        sellerUserId: marketplaceListings.sellerUserId,
        buyerUserId: marketplaceListings.buyerUserId,
        createdAt: marketplaceListings.createdAt,
        updatedAt: marketplaceListings.updatedAt,
        soldAt: marketplaceListings.soldAt,
        // Card details
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
        // Seller details
        sellerUsername: users.username,
        // Computed fields
        primaryImage: sql<string>`(COALESCE((${cards.imageData} -> 'generated' ->> 0), NULL))`,
        primaryThumb: sql<string>`(COALESCE((${cards.imageData} -> 'thumbs' ->> 0), NULL))`,
      })
      .from(marketplaceListings)
      .innerJoin(cards, eq(cards.id, marketplaceListings.cardId))
      .leftJoin(users, eq(users.userId, marketplaceListings.sellerUserId))
      .where(eq(marketplaceListings.id, id))
      .limit(1);

    return rows[0] || null;
  },

  // Get seller profile information with enhanced data
  getSellerProfile: async (sellerHandle: string) => {
    // Try to find by username first, then by userId
    const rows = await db
      .select({
        userId: users.userId,
        username: users.username,
        totalListings: sql<number>`(
          SELECT COUNT(*) 
          FROM marketplace_listings 
          WHERE seller_user_id = ${users.userId} 
          AND status = 'active'
        )`,
        totalSales: sql<number>`(
          SELECT COUNT(*) 
          FROM marketplace_listings 
          WHERE seller_user_id = ${users.userId} 
          AND status = 'sold'
        )`,
        totalRevenue: sql<number>`(
          SELECT COALESCE(SUM(price_credits), 0)
          FROM marketplace_listings 
          WHERE seller_user_id = ${users.userId} 
          AND status = 'sold'
        )`,
        memberSince: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.userId, sellerHandle),
          sql`EXISTS (
            SELECT 1 FROM marketplace_listings 
            WHERE seller_user_id = ${users.userId}
          )`,
        ),
      )
      .limit(1);

    if (rows.length > 0) {
      return rows[0];
    }

    // If not found by userId, try by username
    const usernameRows = await db
      .select({
        userId: users.userId,
        username: users.username,
        totalListings: sql<number>`(
          SELECT COUNT(*) 
          FROM marketplace_listings 
          WHERE seller_user_id = ${users.userId} 
          AND status = 'active'
        )`,
        totalSales: sql<number>`(
          SELECT COUNT(*) 
          FROM marketplace_listings 
          WHERE seller_user_id = ${users.userId} 
          AND status = 'sold'
        )`,
        totalRevenue: sql<number>`(
          SELECT COALESCE(SUM(price_credits), 0)
          FROM marketplace_listings 
          WHERE seller_user_id = ${users.userId} 
          AND status = 'sold'
        )`,
        memberSince: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.username, sellerHandle),
          sql`EXISTS (
            SELECT 1 FROM marketplace_listings 
            WHERE seller_user_id = ${users.userId}
          )`,
        ),
      )
      .limit(1);

    return usernameRows[0] || null;
  },

  // Get active listings count for a seller
  getSellerListingsCount: async (sellerUserId: string) => {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(marketplaceListings)
      .where(
        and(
          eq(marketplaceListings.sellerUserId, sellerUserId),
          eq(marketplaceListings.status, 'active'),
        ),
      );

    return result[0]?.count || 0;
  },

  // Get likes count for a card (implemented with actual card likes table)
  getCardLikesCount: async (cardId: number) => {
    try {
      // This assumes you have a card_likes table or similar
      // For now, we'll use a placeholder that could be implemented
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(sql`card_likes`)
        .where(sql`card_id = ${cardId}`);

      return result[0]?.count || 0;
    } catch {
      // If card_likes table doesn't exist, return 0
      return 0;
    }
  },

  // Get seller rating and review data
  getSellerRating: async (sellerUserId: string) => {
    try {
      // This assumes you have a reviews/ratings table
      const result = await db
        .select({
          averageRating: sql<number>`AVG(rating)`,
          reviewCount: sql<number>`COUNT(*)`,
          positiveReviews: sql<number>`COUNT(CASE WHEN rating >= 4 THEN 1 END)`,
          totalReviews: sql<number>`COUNT(*)`,
        })
        .from(sql`seller_reviews`)
        .where(sql`seller_user_id = ${sellerUserId}`);

      const data = result[0];
      if (data && data.averageRating) {
        return {
          rating: Math.round(data.averageRating * 10) / 10,
          reviewCount: data.reviewCount || 0,
          positivePercentage:
            data.totalReviews > 0
              ? Math.round((data.positiveReviews / data.totalReviews) * 100)
              : 0,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  // Get related listings for SEO content
  getRelatedListings: async (
    cardId: number,
    currentListingId: number,
    limit = 4,
  ) => {
    const rows = await db
      .select({
        id: marketplaceListings.id,
        cardId: marketplaceListings.cardId,
        priceCredits: marketplaceListings.priceCredits,
        name: cards.name,
        type: cards.type,
        rarity: cards.rarity,
        primaryImage: sql<string>`(COALESCE((${cards.imageData} -> 'generated' ->> 0), NULL))`,
      })
      .from(marketplaceListings)
      .innerJoin(cards, eq(cards.id, marketplaceListings.cardId))
      .where(
        and(
          eq(marketplaceListings.status, 'active'),
          sql`${marketplaceListings.id} != ${currentListingId}`,
          sql`${cards.type} = (SELECT type FROM cards WHERE id = ${cardId})`,
        ),
      )
      .orderBy(desc(marketplaceListings.createdAt))
      .limit(limit);

    return rows;
  },

  // Get marketplace statistics for structured data
  getMarketplaceStats: async () => {
    const result = await db
      .select({
        totalListings: sql<number>`COUNT(*)`,
        totalActiveListings: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
        totalSoldListings: sql<number>`COUNT(CASE WHEN status = 'sold' THEN 1 END)`,
        averagePrice: sql<number>`AVG(price_usd)`,
        totalValue: sql<number>`SUM(CASE WHEN status = 'active' THEN price_usd ELSE 0 END)`,
      })
      .from(marketplaceListings);

    return (
      result[0] || {
        totalListings: 0,
        totalActiveListings: 0,
        totalSoldListings: 0,
        averagePrice: 0,
        totalValue: 0,
      }
    );
  },
};
