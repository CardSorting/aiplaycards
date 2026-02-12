import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { cards } from './cards';
import { users } from './users';

// Custom booster packs created by users
export const customBoosterPacks = pgTable(
  'custom_booster_packs',
  {
    id: serial('id').primaryKey(),
    creatorUserId: varchar('creator_user_id', { length: 255 })
      .notNull()
      .references(() => users.userId),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    packSize: integer('pack_size').notNull().default(5), // Number of cards per pack
    totalPacks: integer('total_packs').notNull().default(1), // How many packs are available
    remainingPacks: integer('remaining_packs').notNull().default(1), // Packs still available
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxCreatorUserId: index('custom_booster_packs_creator_user_id_idx').on(
      table.creatorUserId,
    ),
    idxIsActiveCreatedAt: index(
      'custom_booster_packs_is_active_created_at_idx',
    ).on(table.isActive, table.createdAt),
  }),
);

// Cards included in custom booster packs
export const customBoosterPackCards = pgTable(
  'custom_booster_pack_cards',
  {
    id: serial('id').primaryKey(),
    packId: integer('pack_id')
      .notNull()
      .references(() => customBoosterPacks.id, { onDelete: 'cascade' }),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id),
    weight: integer('weight').notNull().default(1), // Probability weight for this card
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxPackId: index('custom_booster_pack_cards_pack_id_idx').on(table.packId),
    idxCardId: index('custom_booster_pack_cards_card_id_idx').on(table.cardId),
    // Unique constraint to prevent duplicate cards in same pack
    idxPackCardUnique: index(
      'custom_booster_pack_cards_pack_card_unique_idx',
    ).on(table.packId, table.cardId),
  }),
);

// Marketplace listings for custom booster packs
export const customBoosterPackListings = pgTable(
  'custom_booster_pack_listings',
  {
    id: serial('id').primaryKey(),
    packId: integer('pack_id')
      .notNull()
      .references(() => customBoosterPacks.id),
    sellerUserId: varchar('seller_user_id', { length: 255 })
      .notNull()
      .references(() => users.userId),
    priceCredits: integer('price_credits').notNull(),
    priceUsd: decimal('price_usd', { precision: 10, scale: 2 }).notNull(),
    packsAvailable: integer('packs_available').notNull().default(1), // How many packs are for sale
    status: varchar('status', { length: 32 }).notNull().default('active'), // active | sold_out | canceled
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxStatusCreatedAt: index(
      'custom_booster_pack_listings_status_created_at_idx',
    ).on(table.status, table.createdAt),
    idxPackId: index('custom_booster_pack_listings_pack_id_idx').on(
      table.packId,
    ),
    idxSellerUserId: index(
      'custom_booster_pack_listings_seller_user_id_idx',
    ).on(table.sellerUserId),
  }),
);

// Purchase history for custom booster packs
export const customBoosterPackPurchases = pgTable(
  'custom_booster_pack_purchases',
  {
    id: serial('id').primaryKey(),
    listingId: integer('listing_id')
      .notNull()
      .references(() => customBoosterPackListings.id),
    buyerUserId: varchar('buyer_user_id', { length: 255 })
      .notNull()
      .references(() => users.userId),
    packsPurchased: integer('packs_purchased').notNull().default(1),
    totalPriceCredits: integer('total_price_credits').notNull(),
    totalPriceUsd: decimal('total_price_usd', {
      precision: 10,
      scale: 2,
    }).notNull(),
    purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
  },
  table => ({
    idxListingId: index('custom_booster_pack_purchases_listing_id_idx').on(
      table.listingId,
    ),
    idxBuyerUserId: index('custom_booster_pack_purchases_buyer_user_id_idx').on(
      table.buyerUserId,
    ),
    idxPurchasedAt: index('custom_booster_pack_purchases_purchased_at_idx').on(
      table.purchasedAt,
    ),
  }),
);

export type CustomBoosterPack = typeof customBoosterPacks.$inferSelect;
export type NewCustomBoosterPack = typeof customBoosterPacks.$inferInsert;
export type CustomBoosterPackCard = typeof customBoosterPackCards.$inferSelect;
export type NewCustomBoosterPackCard =
  typeof customBoosterPackCards.$inferInsert;
export type CustomBoosterPackListing =
  typeof customBoosterPackListings.$inferSelect;
export type NewCustomBoosterPackListing =
  typeof customBoosterPackListings.$inferInsert;
export type CustomBoosterPackPurchase =
  typeof customBoosterPackPurchases.$inferSelect;
export type NewCustomBoosterPackPurchase =
  typeof customBoosterPackPurchases.$inferInsert;
