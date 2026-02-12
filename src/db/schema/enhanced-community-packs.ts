// Enhanced Community Pack System - Industry-Grade Database Design
// Following modern database design principles with comprehensive relationships

import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Enums for better data integrity
export const packTypeEnum = pgEnum('pack_type', [
  'manual',
  'themed',
  'custom',
  'community',
  'celebration',
  'rarity_blind',
]);

export const packStatusEnum = pgEnum('pack_status', [
  'draft',
  'pending_review',
  'approved',
  'active',
  'paused',
  'depleted',
  'archived',
]);

export const packClaimTypeEnum = pgEnum('pack_claim_type', [
  'direct_assignment',
  'random_draw',
  'purchase',
  'reward',
  'community_vote',
]);

export const packRotationStrategyEnum = pgEnum('pack_rotation_strategy', [
  'random',
  'weighted',
  'sequential',
  'rarity_based',
  'time_based',
  'demand_driven',
]);

// ============================================================================
// CORE PACK SYSTEM TABLES
// ============================================================================

// Enhanced pack templates with inheritance and advanced features
export const packTemplates = pgTable(
  'pack_templates',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    packType: packTypeEnum('pack_type').notNull().default('manual'),

    // Template inheritance system (self-referencing FK)
    parentTemplateId: integer('parent_template_id'),

    // Card configuration
    cardCount: integer('card_count').notNull().default(5),
    minCards: integer('min_cards').notNull().default(3),
    maxCards: integer('max_cards').notNull().default(6),

    // Rarity distribution system (advanced weighting)
    rarityDistribution: jsonb('rarity_distribution').notNull().$type<{
      common: { weight: number; minCount: number; maxCount: number };
      uncommon: { weight: number; minCount: number; maxCount: number };
      rare: { weight: number; minCount: number; maxCount: number };
      epic?: { weight: number; minCount: number; maxCount: number };
      legendary?: { weight: number; minCount: number; maxCount: number };
    }>(),

    // Theme and styling
    themeConfig: jsonb('theme_config').$type<{
      primaryColor?: string;
      secondaryColor?: string;
      backgroundGradient?: string;
      icon?: string;
      packImage?: string;
      descriptionImage?: string;
    }>(),

    // Pool configuration (which card pools this template can draw from)
    poolConfig: jsonb('pool_config').$type<{
      allowedPools: string[]; // Pool slugs
      exclusionPools?: string[]; // Pools to exclude
      categoryWeights?: Record<string, number>; // Category-based weights
    }>(),

    // Advanced features
    isSeasonal: boolean('is_seasonal').notNull().default(false),
    seasonStart: timestamp('season_start'),
    seasonEnd: timestamp('season_end'),
    tags: jsonb('tags').$type<string[]>().default([]),

    // Metadata and audit
    status: packStatusEnum('status').notNull().default('draft'),
    createdById: varchar('created_by_id', { length: 255 })
      .notNull()
      .references(() => users.userId),
    approvedById: varchar('approved_by_id', { length: 255 }).references(
      () => users.userId,
    ),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    approvedAt: timestamp('approved_at'),
    lastUsedAt: timestamp('last_used_at'),
  },
  table => ({
    idxSlug: uniqueIndex('pack_templates_slug_idx').on(table.slug),
    idxStatus: index('pack_templates_status_idx').on(table.status),
    idxPackType: index('pack_templates_pack_type_idx').on(table.packType),
    idxParentTemplate: index('pack_templates_parent_template_idx').on(
      table.parentTemplateId,
    ),
    idxIsSeasonal: index('pack_templates_is_seasonal_idx').on(table.isSeasonal),
    idxCreatedAt: index('pack_templates_created_at_idx').on(table.createdAt),
    idxSeason: index('pack_templates_season_idx').on(
      table.seasonStart,
      table.seasonEnd,
    ),
  }),
);

// Community pack categories
export const packCategories = pgTable(
  'pack_categories',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    longDescription: text('long_description'),

    // Visual configuration
    color: varchar('color', { length: 7 }).default('#1976d2'),
    icon: varchar('icon', { length: 100 }),
    bannerImage: text('banner_image'),
    displayOrder: integer('display_order').notNull().default(0),

    // Community features
    isCommunityCurated: boolean('is_community_curated')
      .notNull()
      .default(false),
    requiresApproval: boolean('requires_approval').notNull().default(false),
    minVoteThreshold: integer('min_vote_threshold').default(10),

    // Operational settings
    isActive: boolean('is_active').notNull().default(true),
    isVisible: boolean('is_visible').notNull().default(true),

    // Metadata
    tags: jsonb('tags').$type<string[]>().default([]),
    createdById: varchar('created_by_id', { length: 255 })
      .notNull()
      .references(() => users.userId),
    approvedById: varchar('approved_by_id', { length: 255 }).references(
      () => users.userId,
    ),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxSlug: uniqueIndex('pack_categories_slug_idx').on(table.slug),
    idxIsActive: index('pack_categories_is_active_idx').on(table.isActive),
    idxIsVisible: index('pack_categories_is_visible_idx').on(table.isVisible),
    idxDisplayOrder: index('pack_categories_display_order_idx').on(
      table.displayOrder,
    ),
    idxCommunity: index('pack_categories_community_idx').on(
      table.isCommunityCurated,
    ),
  }),
);

// ============================================================================
// CARD POOL AND INVENTORY SYSTEM
// ============================================================================

// Card pools for managing community card collections
export const cardPools = pgTable(
  'card_pools',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),

    // Pool configuration
    poolType: varchar('pool_type', { length: 50 })
      .notNull()
      .default('community'), // 'community', 'seasonal', 'custom'
    capacity: integer('capacity'), // Maximum cards in pool
    rotationStrategy: packRotationStrategyEnum('rotation_strategy')
      .notNull()
      .default('weighted'),

    // Rotation settings
    rotationSchedule: jsonb('rotation_schedule').$type<{
      intervalDays?: number;
      rotatePercentage?: number; // How much of the pool to rotate
      keepHighRated?: boolean; // Keep highly rated cards
    }>(),

    // Stock management
    isDepletable: boolean('is_depletable').notNull().default(true),
    refillStrategy: jsonb('refill_strategy').$type<{
      autoRefill: boolean;
      refillThreshold: number; // Percentage threshold to trigger refill
      refillAmount: number;
      sourcePools?: string[]; // Pools to draw refill cards from
    }>(),

    // Quality control
    minQualityScore: decimal('min_quality_score', { precision: 3, scale: 2 }),
    requiresModeration: boolean('requires_moderation').notNull().default(true),

    // Availability
    isActive: boolean('is_active').notNull().default(true),
    availabilityStart: timestamp('availability_start'),
    availabilityEnd: timestamp('availability_end'),

    // Community features
    allowUserSubmissions: boolean('allow_user_submissions')
      .notNull()
      .default(false),
    submissionGuidelines: text('submission_guidelines'),

    createdById: varchar('created_by_id', { length: 255 })
      .notNull()
      .references(() => users.userId),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxSlug: uniqueIndex('card_pools_slug_idx').on(table.slug),
    idxPoolType: index('card_pools_pool_type_idx').on(table.poolType),
    idxIsActive: index('card_pools_is_active_idx').on(table.isActive),
    idxAvailability: index('card_pools_availability_idx').on(
      table.availabilityStart,
      table.availabilityEnd,
    ),
  }),
);

// Cards within pools (junction table with enhanced metadata)
export const poolCards = pgTable(
  'pool_cards',
  {
    id: serial('id').primaryKey(),
    poolId: integer('pool_id')
      .notNull()
      .references(() => cardPools.id, { onDelete: 'cascade' }),
    cardName: varchar('card_name', { length: 255 }).notNull(),
    imageUrl: text('image_url').notNull(),
    rarity: varchar('rarity', { length: 50 }).notNull(),

    // Enhanced metadata
    categoryId: integer('category_id').references(() => packCategories.id),
    tags: jsonb('tags').$type<string[]>().default([]),
    searchTags: text('search_tags'), // Full-text search optimized

    // Weighting and availability
    baseWeight: integer('base_weight').notNull().default(1),
    dynamicWeight: integer('dynamic_weight').notNull().default(1),
    usageCount: integer('usage_count').notNull().default(0),

    // Quality and moderation
    qualityScore: decimal('quality_score', { precision: 3, scale: 2 }),
    moderationStatus: varchar('moderation_status', { length: 32 })
      .notNull()
      .default('pending'), // 'pending', 'approved', 'rejected'
    moderatedById: varchar('moderated_by_id', { length: 255 }).references(
      () => users.userId,
    ),
    moderatedAt: timestamp('moderated_at'),

    // Contributor information
    submittedById: varchar('submitted_by_id', { length: 255 }).references(
      () => users.userId,
    ),
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),

    // Pool management
    addedById: varchar('added_by_id', { length: 255 }).references(
      () => users.userId,
    ),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'), // For soft deletes/tracking rotation

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxPoolId: index('pool_cards_pool_id_idx').on(table.poolId),
    idxCategoryId: index('pool_cards_category_id_idx').on(table.categoryId),
    idxRarity: index('pool_cards_rarity_idx').on(table.rarity),
    idxModeration: index('pool_cards_moderation_idx').on(
      table.moderationStatus,
    ),
    idxQuality: index('pool_cards_quality_score_idx').on(table.qualityScore),
    idxUsageCount: index('pool_cards_usage_count_idx').on(table.usageCount),
    // Full-text search index for card names and tags
    idxSearch: index('pool_cards_search_idx').on(table.cardName, table.tags),
  }),
);

// Category associations for cards (many-to-many)
export const cardCategoryAssociations = pgTable(
  'card_category_associations',
  {
    id: serial('id').primaryKey(),
    poolCardId: integer('pool_card_id')
      .notNull()
      .references(() => poolCards.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => packCategories.id, { onDelete: 'cascade' }),

    // Association metadata
    weight: integer('weight').notNull().default(1), // Influence in category
    isPrimary: boolean('is_primary').notNull().default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxPoolCard: index('card_category_associations_pool_card_idx').on(
      table.poolCardId,
    ),
    idxCategory: index('card_category_associations_category_idx').on(
      table.categoryId,
    ),
    idxPrimary: index('card_category_associations_primary_idx').on(
      table.poolCardId,
      table.isPrimary,
    ),
  }),
);

// ============================================================================
// PACK INSTANCE AND CLAIMING SYSTEM
// ============================================================================

// Pack instances (actual pack creations for users)
export const packInstances = pgTable(
  'pack_instances',
  {
    id: serial('id').primaryKey(),
    templateId: integer('template_id')
      .notNull()
      .references(() => packTemplates.id),
    recipientUserId: varchar('recipient_user_id', { length: 255 })
      .notNull()
      .references(() => users.userId),

    // Pack configuration at creation time
    cardCount: integer('card_count').notNull(),
    rarityDistribution: jsonb('rarity_distribution').notNull(),
    themeConfig: jsonb('theme_config'),
    tags: jsonb('tags').$type<string[]>().default([]),

    // Claiming system
    claimType: packClaimTypeEnum('claim_type').notNull().default('direct_assignment'),
    isClaimed: boolean('is_claimed').notNull().default(false),
    claimedAt: timestamp('claimed_at'),
    claimSessionId: varchar('claim_session_id', { length: 100 }),

    // Financial aspects
    creditCost: integer('credit_cost').notNull().default(38),
    usdCost: decimal('usd_cost', { precision: 10, scale: 2 }),

    // Creation metadata
    createdById: varchar('created_by_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'set null' }),
    status: varchar('status', { length: 20 }).notNull().default('completed'), // 'pending', 'processing', 'completed', 'failed'

    // Processing details
    processingStartedAt: timestamp('processing_started_at'),
    processingCompletedAt: timestamp('processing_completed_at'),
    error: text('error'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxTemplateId: index('pack_instances_template_id_idx').on(table.templateId),
    idxRecipient: index('pack_instances_recipient_user_id_idx').on(
      table.recipientUserId,
    ),
    idxClaimStatus: index('pack_instances_claim_status_idx').on(
      table.isClaimed,
    ),
    idxStatus: index('pack_instances_status_idx').on(table.status),
    idxCreatedAt: index('pack_instances_created_at_idx').on(table.createdAt),
    idxClaimType: index('pack_instances_claim_type_idx').on(table.claimType),
  }),
);

// Cards within pack instances
export const packInstanceCards = pgTable(
  'pack_instance_cards',
  {
    id: serial('id').primaryKey(),
    packInstanceId: integer('pack_instance_id')
      .notNull()
      .references(() => packInstances.id, { onDelete: 'cascade' }),
    poolCardId: integer('pool_card_id')
      .notNull()
      .references(() => poolCards.id),

    // Card details (denormalized for performance)
    cardName: varchar('card_name', { length: 255 }).notNull(),
    imageUrl: text('image_url').notNull(),
    rarity: varchar('rarity', { length: 50 }).notNull(),

    // Position and metadata
    slotNumber: integer('slot_number').notNull(),
    isHolographic: boolean('is_holographic').notNull().default(false),
    specialEffect: varchar('special_effect', { length: 50 }), // 'shiny', 'golden', etc.

    // Derived information
    categoryId: integer('category_id').references(() => packCategories.id),
    tags: jsonb('tags').$type<string[]>().default([]),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxPackInstance: index('pack_instance_cards_pack_instance_idx').on(
      table.packInstanceId,
    ),
    idxPoolCard: index('pack_instance_cards_pool_card_idx').on(
      table.poolCardId,
    ),
    idxRarity: index('pack_instance_cards_rarity_idx').on(table.rarity),
    idxCategoryId: index('pack_instance_cards_category_id_idx').on(
      table.categoryId,
    ),
    idxSlot: index('pack_instance_cards_slot_idx').on(
      table.packInstanceId,
      table.slotNumber,
    ),
  }),
);

// ============================================================================
// COMMUNITY FEATURES AND GOVERNANCE
// ============================================================================

// User-submitted pack suggestions
export const packSuggestions = pgTable(
  'pack_suggestions',
  {
    id: serial('id').primaryKey(),
    suggestedById: varchar('suggested_by_id', { length: 255 })
      .notNull()
      .references(() => users.userId),

    // Suggestion details
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    packType: packTypeEnum('pack_type').notNull().default('manual'),
    suggestedCardCount: integer('suggested_card_count').notNull().default(5),
    suggestedDistribution: jsonb('suggested_distribution'),

    // Community voting
    upvotes: integer('upvotes').notNull().default(0),
    downvotes: integer('downvotes').notNull().default(0),
    totalVotes: integer('total_votes').notNull().default(0),
    rating: decimal('rating', { precision: 3, scale: 2 }),

    // Status tracking
    status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'reviewing', 'approved', 'rejected', 'implemented'
    reviewedById: varchar('reviewed_by_id', { length: 255 }).references(
      () => users.userId,
    ),
    reviewedAt: timestamp('reviewed_at'),

    // Implementation tracking
    implementedAsTemplateId: integer('implemented_as_template_id').references(
      () => packTemplates.id,
    ),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxSuggestedBy: index('pack_suggestions_suggested_by_idx').on(
      table.suggestedById,
    ),
    idxStatus: index('pack_suggestions_status_idx').on(table.status),
    idxRating: index('pack_suggestions_rating_idx').on(table.rating),
    idxTotalVotes: index('pack_suggestions_total_votes_idx').on(
      table.totalVotes,
    ),
    idxCreatedAt: index('pack_suggestions_created_at_idx').on(table.createdAt),
  }),
);

// User votes on pack suggestions
export const packSuggestionVotes = pgTable(
  'pack_suggestion_votes',
  {
    id: serial('id').primaryKey(),
    suggestionId: integer('suggestion_id')
      .notNull()
      .references(() => packSuggestions.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    voteType: varchar('vote_type', { length: 10 }).notNull(), // 'up', 'down'

    votedAt: timestamp('voted_at').defaultNow().notNull(),
  },
  table => ({
    idxSuggestionUser: uniqueIndex('pack_suggestion_votes_unique_idx').on(
      table.suggestionId,
      table.userId,
    ),
    idxSuggestion: index('pack_suggestion_votes_suggestion_idx').on(
      table.suggestionId,
    ),
    idxUser: index('pack_suggestion_votes_user_idx').on(table.userId),
    idxVoteType: index('pack_suggestion_votes_vote_type_idx').on(
      table.voteType,
    ),
  }),
);

// Pack popularity and usage analytics
export const packAnalytics = pgTable(
  'pack_analytics',
  {
    id: serial('id').primaryKey(),
    templateId: integer('template_id')
      .notNull()
      .references(() => packTemplates.id, { onDelete: 'cascade' }),

    // Time period
    date: timestamp('date').notNull(), // Date (truncated to day)
    period: varchar('period', { length: 10 }).notNull(), // 'daily', 'weekly', 'monthly'

    // Usage metrics
    packsCreated: integer('packs_created').notNull().default(0),
    packsClaimed: integer('packs_claimed').notNull().default(0),
    creditRevenue: integer('credit_revenue').notNull().default(0),
    usdRevenue: decimal('usd_revenue', { precision: 10, scale: 2 })
      .notNull()
      .$default(() => '0'),

    // Engagement metrics
    userSatisfaction: decimal('user_satisfaction', { precision: 3, scale: 2 }), // Average rating
    avgCardsPerPack: decimal('avg_cards_per_pack', { precision: 4, scale: 2 }),
    popularRarities: jsonb('popular_rarities').$type<Record<string, number>>(),
    popularCategories:
      jsonb('popular_categories').$type<Record<string, number>>(),

    // Performance metrics
    avgProcessingTime: integer('avg_processing_time').notNull().default(0), // milliseconds
    successRate: decimal('success_rate', { precision: 5, scale: 4 })
      .notNull()
      .$default(() => '1.0000'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxTemplateDate: uniqueIndex('pack_analytics_template_date_idx').on(
      table.templateId,
      table.period,
      table.date,
    ),
    idxTemplate: index('pack_analytics_template_idx').on(table.templateId),
    idxDate: index('pack_analytics_date_idx').on(table.date),
    idxPeriod: index('pack_analytics_period_idx').on(table.period),
  }),
);

// ============================================================================
// Type Exports
// ============================================================================

export type PackTemplate = typeof packTemplates.$inferSelect;
export type NewPackTemplate = typeof packTemplates.$inferInsert;
export type PackCategory = typeof packCategories.$inferSelect;
export type NewPackCategory = typeof packCategories.$inferInsert;
export type CardPool = typeof cardPools.$inferSelect;
export type NewCardPool = typeof cardPools.$inferInsert;
export type PoolCard = typeof poolCards.$inferSelect;
export type NewPoolCard = typeof poolCards.$inferInsert;
export type CardCategoryAssociation =
  typeof cardCategoryAssociations.$inferSelect;
export type NewCardCategoryAssociation =
  typeof cardCategoryAssociations.$inferInsert;
export type PackInstance = typeof packInstances.$inferSelect;
export type NewPackInstance = typeof packInstances.$inferInsert;
export type PackInstanceCard = typeof packInstanceCards.$inferSelect;
export type NewPackInstanceCard = typeof packInstanceCards.$inferInsert;
export type PackSuggestion = typeof packSuggestions.$inferSelect;
export type NewPackSuggestion = typeof packSuggestions.$inferInsert;
export type PackSuggestionVote = typeof packSuggestionVotes.$inferSelect;
export type NewPackSuggestionVote = typeof packSuggestionVotes.$inferInsert;
export type PackAnalytic = typeof packAnalytics.$inferSelect;
export type NewPackAnalytic = typeof packAnalytics.$inferInsert;
