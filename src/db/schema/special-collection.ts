import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Track pack claiming events (separate from individual cards) - defined first to avoid circular reference
export const specialPackClaims = pgTable('special_pack_claims', {
  id: serial('id').primaryKey(),

  // User who claimed the pack
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.userId),

  // Pack details at claim time (denormalized)
  packDisplayName: varchar('pack_display_name', { length: 255 }).notNull(), // "Special Pack #1", etc.
  categoryId: integer('category_id'),
  categoryName: varchar('category_name', { length: 255 }),
  categoryColor: varchar('category_color', { length: 7 }),

  // Claiming details
  claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  claimSessionId: varchar('claim_session_id', { length: 100 }), // For tracking claim sessions

  // Pack statistics
  totalCards: integer('total_cards').notNull(),
  cardsReceived: integer('cards_received').notNull(),

  // Status
  status: varchar('status', { length: 20 }).notNull().default('completed'), // 'completed', 'partial', 'failed'

  // Metadata
  claimMetadata: jsonb('claim_metadata'), // Browser info, IP, etc. for security

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Separate table for claimed special cards (completely isolated from regular cards/collections)
export const claimedSpecialCards = pgTable('claimed_special_cards', {
  id: serial('id').primaryKey(),

  // User who claimed the card
  ownerId: varchar('owner_id', { length: 255 })
    .notNull()
    .references(() => users.userId),

  // Card details
  cardName: varchar('card_name', { length: 255 }).notNull(),
  imageUrl: text('image_url').notNull(),
  rarity: varchar('rarity', { length: 50 }).notNull(),

  // Category information (denormalized for performance)
  categoryId: integer('category_id'),
  categoryName: varchar('category_name', { length: 255 }), // Snapshot at claim time
  categoryColor: varchar('category_color', { length: 7 }), // Snapshot at claim time

  // Claiming details
  claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  claimMethod: varchar('claim_method', { length: 50 })
    .notNull()
    .default('pack_claim'), // 'pack_claim', 'direct_gift', etc.

  // Pack context (for organization in collection)
  packClaimId: integer('pack_claim_id')
    .notNull()
    .references(() => specialPackClaims.id),

  // Position in original pack (for display purposes)
  originalSlotNumber: integer('original_slot_number').notNull(),

  // Additional metadata
  metadata: jsonb('metadata'), // Any extra data about the card at claim time

  // Animation fields
  animationUrl: text('animation_url'), // URL to the animated video
  animationKey: text('animation_key'), // Backblaze storage key for the video
  animationPrompt: text('animation_prompt'), // Prompt used for animation generation
  animatedAt: timestamp('animated_at'), // When the animation was completed

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Index for performance
// Note: These would be created via migration, showing intent here
// CREATE INDEX idx_claimed_special_cards_owner ON claimed_special_cards(owner_id);
// CREATE INDEX idx_claimed_special_cards_category ON claimed_special_cards(category_id);
// CREATE INDEX idx_claimed_special_cards_pack_claim ON claimed_special_cards(pack_claim_id);
// CREATE INDEX idx_special_pack_claims_user ON special_pack_claims(user_id);
// CREATE INDEX idx_special_pack_claims_category ON special_pack_claims(category_id);
