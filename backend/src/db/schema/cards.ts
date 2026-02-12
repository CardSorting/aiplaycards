import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enum definitions for better data integrity
export const CardSupertype = {
  POKEMON: 'pokémon',
  TRAINER: 'trainer',
  ENERGY: 'energy',
  SPECIAL: 'special',
} as const;

export const CardSource = {
  BOOSTER: 'booster',
  SPECIAL_PACK: 'special_pack',
  MARKETPLACE: 'marketplace',
  GIFT: 'gift',
  REWARD: 'reward',
  GENERATED: 'generated',
} as const;

export const CollectionType = {
  USER_GENERATED: 'user_generated',
  SPECIAL_PACK: 'special_pack',
  NANO_COMPOSITE: 'nano_composite',
  BOOSTER_PACK: 'booster_pack',
  PREMIUM_PACK: 'premium_pack',
} as const;

export const cards = pgTable(
  'cards',
  {
    id: serial('id').primaryKey(),

    // Core card fields
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 50 }).notNull(),
    subtype: varchar('subtype', { length: 50 }),
    supertype: varchar('supertype', { length: 50 }).default('special'),
    rarity: varchar('rarity', { length: 50 }),

    // Card stats
    hitpoints: smallint('hitpoints'),
    cardNumber: varchar('card_number', { length: 20 }),
    totalInSet: smallint('total_in_set'),
    illustrator: varchar('illustrator', { length: 255 }),

    // JSONB fields for better performance and querying
    dexStats: jsonb('dex_stats'), // Pokemon stats, evolution, etc.
    moves: jsonb('moves'), // Attack moves with damage, energy cost, etc.
    ability: jsonb('ability'), // Special abilities
    weakness: jsonb('weakness'), // Weakness types and multipliers
    resistance: jsonb('resistance'), // Resistance types and multipliers
    retreatCost: smallint('retreat_cost'), // Energy cost to retreat

    // Media and animation
    imageData: jsonb('image_data'), // Image metadata, URLs, thumbnails
    cardEditorState: jsonb('card_editor_state'), // Editor configuration state
    animationUrl: text('animation_url'),
    animationKey: text('animation_key'),
    animationPrompt: text('animation_prompt'),
    animatedAt: timestamp('animated_at'),

    // Ownership and visibility
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    isPublic: boolean('is_public').default(false),
    userId: varchar('user_id', { length: 255 }),
    source: varchar('source', { length: 20 }).default('booster'),

    // Collection relationships
    collectionId: integer('collection_id'),
    collectionType: varchar('collection_type', { length: 30 }),

    // Pack system
    pregenerated: boolean('pregenerated').default(false),
    packSlug: varchar('pack_slug', { length: 50 }),
    raritySlot: varchar('rarity_slot', { length: 20 }),

    // Quality metrics
    quality: smallint('quality').default(5), // 1-10 quality score for generated cards
    version: smallint('version').default(1), // For card updates
    flags: jsonb('flags'), // Special flags/metadata

    // Soft delete for GDPR compliance
    deletedAt: timestamp('deleted_at'),
  },
  table => ({
    // Check constraints for data integrity using SQL template literals
    hitpointsCheck: check(
      'cards_hitpoints_check',
      sql`${table.hitpoints} IS NULL OR ${table.hitpoints} > 0`,
    ),
    totalInSetCheck: check(
      'cards_total_in_set_check',
      sql`${table.totalInSet} IS NULL OR ${table.totalInSet} > 0`,
    ),
    retreatCostCheck: check(
      'cards_retreat_cost_check',
      sql`${table.retreatCost} IS NULL OR ${table.retreatCost} >= 0`,
    ),
    qualityCheck: check(
      'cards_quality_check',
      sql`${table.quality} >= 1 AND ${table.quality} <= 10`,
    ),
    supertypeCheck: check(
      'cards_supertype_check',
      sql`${table.supertype} IN ('pokémon', 'trainer', 'energy', 'special')`,
    ),
    sourceCheck: check(
      'cards_source_check',
      sql`${table.source} IN ('booster', 'special_pack', 'marketplace', 'gift', 'reward', 'generated')`,
    ),

    // Performance indexes - covering indexes for common queries
    idxIsPublicCreatedAt: index('cards_is_public_created_at_idx').on(
      table.isPublic,
      table.createdAt,
    ),
    idxUserIdCreatedAt: index('cards_user_id_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
    idxCreatedAt: index('cards_created_at_idx').on(table.createdAt),
    idxAnimatedAt: index('cards_animated_at_idx').on(table.animatedAt),
    idxType: index('cards_type_idx').on(table.type),
    idxSupertype: index('cards_supertype_idx').on(table.supertype),
    idxRarity: index('cards_rarity_idx').on(table.rarity),
    idxUserId: index('cards_user_id_idx').on(table.userId),
    idxCollectionId: index('cards_collection_id_idx').on(table.collectionId),
    idxQuality: index('cards_quality_idx').on(table.quality),

    // Pack system indexes
    idxPregeneratedPackRarity: index('cards_pregenerated_pack_rarity_idx').on(
      table.pregenerated,
      table.packSlug,
      table.raritySlot,
    ),
    idxPackSlug: index('cards_pack_slug_idx').on(table.packSlug),

    // Complex covering indexes for frequent queries
    idxPublicCards: index('cards_public_cards_idx').on(
      table.isPublic,
      table.type,
      table.rarity,
      table.createdAt,
    ),
    idxUserCards: index('cards_user_cards_idx').on(
      table.userId,
      table.isPublic,
      table.createdAt,
      table.quality,
    ),

    // Partial indexes for better performance
    idxPublicOnly: index('cards_public_only_idx')
      .on(table.createdAt, table.type, table.rarity)
      .where(sql`${table.isPublic} = true`),
    idxAnimatedOnly: index('cards_animated_only_idx')
      .on(table.animatedAt, table.quality)
      .where(sql`${table.animatedAt} IS NOT NULL`),

    // JSONB GIN indexes for advanced querying (using correct Drizzle syntax)
    idxDexStatsGsi: index('cards_dex_stats_gsi_idx').on(table.dexStats),
    idxMovesGsi: index('cards_moves_gsi_idx').on(table.moves),
    idxFlagsGsi: index('cards_flags_gsi_idx').on(table.flags),

    // Soft delete index
    idxDeletedAt: index('cards_deleted_at_idx').on(table.deletedAt),
  }),
);

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
