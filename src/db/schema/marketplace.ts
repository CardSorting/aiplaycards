import {
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { sql } from 'drizzle-orm';

// Enum definitions for better data integrity
export const CardCategory = {
  POKEMON: 'pokemon',
  YUGIOH: 'yugioh',
  SPECIAL: 'special',
  MTG: 'mtg',
  CUSTOM: 'custom',
} as const;

export const ListingStatus = {
  ACTIVE: 'active',
  SOLD: 'sold',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  DELETED: 'deleted',
} as const;

export const ModerationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
} as const;

export const marketplaceListings = pgTable(
  'marketplace_listings',
  {
    id: serial('id').primaryKey(),

    // Core listing data
    cardId: integer('card_id').notNull(),
    cardCategory: varchar('card_category', { length: 20 })
      .notNull()
      .default(CardCategory.POKEMON),

    // Pricing
    priceCredits: integer('price_credits').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'), // For future fiat support
    priceUsd: integer('price_usd'), // Stored in cents

    // Sellers and buyers
    sellerUserId: varchar('seller_user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    buyerUserId: varchar('buyer_user_id', { length: 255 }).references(
      () => users.userId,
    ),

    // Status and lifecycle
    status: varchar('status', { length: 32 })
      .notNull()
      .default(ListingStatus.ACTIVE),

    // Transaction details
    transactionId: varchar('transaction_id', { length: 255 }), // External payment system reference
    soldAt: timestamp('sold_at'),
    actualPricePaid: integer('actual_price_paid'), // Final price including fees

    // Moderation and compliance
    moderationStatus: varchar('moderation_status', { length: 20 }).default(
      ModerationStatus.APPROVED,
    ),
    moderationReason: varchar('moderation_reason', { length: 500 }),
    moderatedBy: varchar('moderated_by', { length: 255 }).references(
      () => users.userId,
    ),
    moderatedAt: timestamp('moderated_at'),

    // Listing metadata
    title: varchar('title', { length: 255 }), // Custom title if different from card name
    description: text('description'), // Additional description
    condition: varchar('condition', { length: 20 }), // new, used, mint, etc.
    tags: text('tags'), // JSON array of tags
    featuredScore: integer('featured_score').default(0), // For algorithm ranking

    // Analytics and tracking
    viewsCount: integer('views_count').default(0),
    favoritesCount: integer('favorites_count').default(0),
    offersCount: integer('offers_count').default(0),
    lastViewedAt: timestamp('last_viewed_at'),

    // Security and audit
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    sessionId: varchar('session_id', { length: 255 }),
    fraudScore: integer('fraud_score').default(0), // Risk assessment score

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    // Expiration and cleanup
    expiresAt: timestamp('expires_at'), // Auto-expire listings
    deletedAt: timestamp('deleted_at'), // Soft delete
  },
  table => ({
    // Check constraints for data integrity using SQL template literals
    pricePositiveCheck: check(
      'marketplace_listings_price_positive_check',
      sql`${table.priceCredits} > 0`,
    ),
    priceConsistencyCheck: check(
      'marketplace_listings_price_consistency_check',
      sql`${table.priceUsd} IS NULL OR ${table.priceUsd} >= 0`,
    ),
    categoryValidCheck: check(
      'marketplace_listings_category_valid_check',
      sql`${table.cardCategory} IN ('pokemon', 'yugioh', 'special', 'mtg', 'custom')`,
    ),
    statusValidCheck: check(
      'marketplace_listings_status_valid_check',
      sql`${table.status} IN ('active', 'sold', 'cancelled', 'expired', 'deleted')`,
    ),
    moderationStatusValidCheck: check(
      'marketplace_listings_moderation_status_valid_check',
      sql`${table.moderationStatus} IS NULL OR ${table.moderationStatus} IN ('pending', 'approved', 'rejected', 'flagged')`,
    ),
    soldAtConsistencyCheck: check(
      'marketplace_listings_sold_at_consistency_check',
      sql`(${table.status} = 'sold' AND ${table.soldAt} IS NOT NULL) OR (${table.status} != 'sold')`,
    ),
    buyerSoldConsistencyCheck: check(
      'marketplace_listings_buyer_sold_consistency_check',
      sql`(${table.buyerUserId} IS NOT NULL AND ${table.status} = 'sold') OR (${table.buyerUserId} IS NULL AND ${table.status} != 'sold')`,
    ),
    viewsNonNegativeCheck: check(
      'marketplace_listings_views_non_negative_check',
      sql`${table.viewsCount} >= 0 AND ${table.favoritesCount} >= 0`,
    ),

    // Performance indexes - covering indexes for common queries
    idxStatusCreatedAt: index('marketplace_listings_status_created_at_idx').on(
      table.status,
      table.createdAt,
    ),
    idxSellerCreatedAt: index('marketplace_listings_seller_created_at_idx').on(
      table.sellerUserId,
      table.createdAt,
    ),
    idxCardId: index('marketplace_listings_card_id_idx').on(table.cardId),
    idxCardCategory: index('marketplace_listings_card_category_idx').on(
      table.cardCategory,
    ),
    idxPriceCredits: index('marketplace_listings_price_credits_idx').on(
      table.priceCredits,
    ),
    idxModerationStatus: index('marketplace_listings_moderation_status_idx').on(
      table.moderationStatus,
    ),

    // Complex covering indexes for frequent queries
    idxCategoryStatusPrice: index(
      'marketplace_listings_category_status_price_idx',
    ).on(table.cardCategory, table.status, table.priceCredits, table.createdAt),
    idxSellerStatus: index('marketplace_listings_seller_status_idx').on(
      table.sellerUserId,
      table.status,
    ),

    // Analytics indexes
    idxViews: index('marketplace_listings_views_idx').on(table.viewsCount),
    idxCreatedAtViews: index('marketplace_listings_created_at_views_idx').on(
      table.createdAt,
      table.viewsCount,
    ),

    // Security indexes
    idxSessionId: index('marketplace_listings_session_id_idx').on(
      table.sessionId,
    ),
    idxFraudScore: index('marketplace_listings_fraud_score_idx').on(
      table.fraudScore,
    ),

    // Partial indexes for performance
    idxActiveListings: index('marketplace_listings_active_idx')
      .on(table.cardCategory, table.createdAt, table.priceCredits)
      .where(
        sql`${table.status} = ${ListingStatus.ACTIVE} AND ${table.moderationStatus} = ${ModerationStatus.APPROVED}`,
      ),

    idxPendingModeration: index('marketplace_listings_pending_moderation_idx')
      .on(table.createdAt, table.fraudScore)
      .where(sql`${table.moderationStatus} = ${ModerationStatus.PENDING}`),

    idxExpiredListings: index('marketplace_listings_expired_idx')
      .on(table.expiresAt)
      .where(
        sql`${table.expiresAt} < NOW() AND ${table.status} = ${ListingStatus.ACTIVE}`,
      ),
  }),
);

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
