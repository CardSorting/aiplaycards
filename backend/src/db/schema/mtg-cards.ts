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

export const mtgCards = pgTable(
  'mtg_cards',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    manaCost: varchar('mana_cost', { length: 100 }),
    convertedManaCost: integer('converted_mana_cost'),
    type: text('type').notNull(),
    subTypes: json('sub_types').$type<string[]>(),
    rarity: varchar('rarity', { length: 20 }).notNull().default('common'),
    set: varchar('set', { length: 10 }).notNull().default('Custom'),
    artist: varchar('artist', { length: 255 }),
    flavorText: text('flavor_text'),
    power: varchar('power', { length: 10 }),
    toughness: varchar('toughness', { length: 10 }),
    loyalty: varchar('loyalty', { length: 10 }),
    text: text('text'),
    imageUrl: text('image_url'),
    layout: varchar('layout', { length: 20 }).default('normal'),
    colors: json('colors').$type<('W' | 'U' | 'B' | 'R' | 'G')[]>(),
    colorIdentity:
      json('color_identity').$type<('W' | 'U' | 'B' | 'R' | 'G')[]>(),
    isToken: boolean('is_token').default(false),

    // Standard fields for consistency with other card tables
    isPublic: boolean('is_public').default(false),
    userId: varchar('user_id', { length: 255 }),
    source: varchar('source', { length: 20 }).default('editor'),
    pregenerated: boolean('pregenerated').default(false),
    packSlug: varchar('pack_slug', { length: 50 }),
    raritySlot: varchar('rarity_slot', { length: 20 }),

    // Database metadata fields
    cardEditorState: json('card_editor_state'),
    imageData: json('image_data'),

    // Animation fields
    animationUrl: text('animation_url'),
    animationKey: text('animation_key'),
    animationPrompt: text('animation_prompt'),
    animatedAt: timestamp('animated_at'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => ({
    // Speed up common filters and sorting
    idxIsPublicCreatedAt: index('mtg_cards_is_public_created_at_idx').on(
      table.isPublic,
      table.createdAt,
    ),
    idxUserIdCreatedAt: index('mtg_cards_user_id_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
    idxCreatedAt: index('mtg_cards_created_at_idx').on(table.createdAt),
    idxAnimatedAt: index('mtg_cards_animated_at_idx').on(table.animatedAt),
    idxPregeneratedPackRarity: index(
      'mtg_cards_pregenerated_pack_rarity_idx',
    ).on(table.pregenerated, table.packSlug, table.raritySlot),
    idxRarity: index('mtg_cards_rarity_idx').on(table.rarity),
    idxSet: index('mtg_cards_set_idx').on(table.set),
    idxLayout: index('mtg_cards_layout_idx').on(table.layout),
  }),
);

export type MTGCard = typeof mtgCards.$inferSelect;
export type NewMTGCard = typeof mtgCards.$inferInsert;
