import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { authUsers } from './auth';
import { claimedSpecialCards } from './special-collection';

/**
 * Animation jobs queue for special collection cards
 * Separate from main booster queue to avoid conflicts
 */
export const specialAnimationJobs = pgTable('special_animation_jobs', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),

  // Job identification
  jobId: varchar('job_id', { length: 255 }).notNull().unique(), // UUID for pg-boss

  // User and card references
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => authUsers.id),
  cardId: integer('card_id')
    .notNull()
    .references(() => claimedSpecialCards.id),

  // Animation details
  animationType: varchar('animation_type', { length: 50 }).notNull(), // 'sparkle', 'glow', 'rotate', 'bounce'
  duration: integer('duration').notNull().default(3000), // Duration in milliseconds
  creditCost: integer('credit_cost').notNull().default(100), // Cost per animation

  // Job status
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  priority: integer('priority').notNull().default(0), // Higher number = higher priority

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  scheduledFor: timestamp('scheduled_for'), // When to start the animation
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),

  // Processing details
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  lastError: text('last_error'),

  // Animation result
  animationData: text('animation_data'), // JSON data for animation parameters
  completed: boolean('completed').notNull().default(false),

  // Credit transaction
  creditTransactionId: varchar('credit_transaction_id', { length: 255 }),
  creditsDeducted: boolean('credits_deducted').notNull().default(false),
});

/**
 * Animation templates for different card rarities and types
 */
export const specialAnimationTemplates = pgTable(
  'special_animation_templates',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),

    // Template identification
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),

    // Animation properties
    animationType: varchar('animation_type', { length: 50 }).notNull(),
    duration: integer('duration').notNull().default(3000),
    creditCost: integer('credit_cost').notNull().default(100),

    // Template data
    animationConfig: text('animation_config').notNull(), // JSON config for animation

    // Availability
    rarityFilter: varchar('rarity_filter', { length: 50 }), // Which rarities can use this template
    isActive: boolean('is_active').notNull().default(true),
    isPremium: boolean('is_premium').notNull().default(false),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
);

/**
 * User animation preferences and limits
 */
export const specialAnimationPreferences = pgTable(
  'special_animation_preferences',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),

    // User reference
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => authUsers.id)
      .unique(),

    // Preferences
    autoPlayAnimations: boolean('auto_play_animations').notNull().default(true),
    preferredAnimationType: varchar('preferred_animation_type', { length: 50 }),
    animationSpeed: varchar('animation_speed', { length: 20 })
      .notNull()
      .default('normal'), // 'slow', 'normal', 'fast'

    // Usage limits (to prevent abuse)
    dailyAnimationLimit: integer('daily_animation_limit').notNull().default(10),
    animationsUsedToday: integer('animations_used_today').notNull().default(0),
    lastUsageReset: timestamp('last_usage_reset').notNull().defaultNow(),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
);
