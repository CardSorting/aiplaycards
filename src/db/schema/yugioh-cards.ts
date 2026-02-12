import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const yugiohCards = pgTable(
  'yugioh_cards',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    // Card type information
    cardType: varchar('card_type', { length: 20 }).notNull(), // Monster, Spell, Trap
    cardSubtype: varchar('card_subtype', { length: 50 }),
    cardRare: varchar('card_rare', { length: 10 }), // N, R, UR

    // Monster-specific fields
    cardAttr: varchar('card_attr', { length: 10 }), // DIVINE, EARTH, WATER, etc.
    cardRace: varchar('card_race', { length: 50 }),
    cardCustomRace: varchar('card_custom_race', { length: 50 }),
    cardCustomRaceEnabled: boolean('card_custom_race_enabled').default(false),
    cardLevel: varchar('card_level', { length: 5 }),
    cardATK: varchar('card_atk', { length: 20 }),
    cardDEF: varchar('card_def', { length: 20 }),

    // Effect types
    cardEff1: varchar('card_eff1', { length: 20 }),
    cardEff2: varchar('card_eff2', { length: 20 }),

    // Pendulum properties
    isPendulum: boolean('is_pendulum').default(false),
    cardBLUE: integer('card_blue'),
    cardRED: integer('card_red'),
    pendulumSize: integer('pendulum_size'),
    cardPendulumInfo: text('card_pendulum_info'),

    // Link monster properties
    links: json('links'),

    // Visual properties
    holo: boolean('holo').default(false),
    titleColor: varchar('title_color', { length: 7 }).default('#000000'),

    // Language settings
    uiLang: varchar('ui_lang', { length: 5 }).default('en'),
    cardLang: varchar('card_lang', { length: 5 }).default('en'),

    // Text sizing
    infoSize: varchar('info_size', { length: 5 }),

    // YGOPro integration
    cardKey: varchar('card_key', { length: 20 }),
    cardLoadYgoProEnabled: boolean('card_load_ygopro_enabled').default(false),

    // Card image data (Backblaze URL)
    imageUrl: text('image_url'), // Backblaze storage URL
    imageData: json('image_data'), // Legacy field for compatibility
    cardEditorState: json('card_editor_state'), // Full state for re-editing

    // Ownership and metadata
    userId: varchar('user_id', { length: 255 }).notNull(),
    isPublic: boolean('is_public').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => ({
    // Speed up common queries
    idxUserIdCreatedAt: index('yugioh_cards_user_id_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
    idxIsPublicCreatedAt: index('yugioh_cards_is_public_created_at_idx').on(
      table.isPublic,
      table.createdAt,
    ),
    idxCardType: index('yugioh_cards_card_type_idx').on(table.cardType),
    idxCreatedAt: index('yugioh_cards_created_at_idx').on(table.createdAt),
  }),
);

export type YugiohCard = typeof yugiohCards.$inferSelect;
export type NewYugiohCard = typeof yugiohCards.$inferInsert;
