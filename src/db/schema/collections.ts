import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { cards } from './cards';

export const collections = pgTable(
  'collections',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 30 }).notNull(), // 'user_created', 'nano_composite', 'special_pack', 'template', etc.
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId),

    // Collection metadata
    isPrivate: boolean('is_private').default(true),
    visibility: varchar('visibility', { length: 20 }).default('private'), // 'private', 'public', 'shared', 'unlisted'
    coverImageUrl: text('cover_image_url'),
    tags: jsonb('tags'), // Array of strings for categorization
    categories: jsonb('categories'), // Primary categories like ['pokémon', 'strategy', 'competitive']

    // Advanced metadata
    theme: varchar('theme', { length: 50 }), // Theme/packaging theme
    difficulty: smallint('difficulty'), // 1-5 difficulty level indicator
    language: varchar('language', { length: 10 }).default('en'), // Primary language

    // Sharing and collaboration
    isTemplate: boolean('is_template').default(false), // Can be used as template
    allowCollaboration: boolean('allow_collaboration').default(false),
    allowedUsers: jsonb('allowed_users'), // Array of user IDs with access

    // Statistics
    totalCards: integer('total_cards').default(0),
    totalViews: integer('total_views').default(0),
    totalLikes: integer('total_likes').default(0),
    totalComments: integer('total_comments').default(0),
    avgRating: smallint('avg_rating'), // Average rating 1-5
    featured: boolean('featured').default(false), // Featured by moderators
    trending: boolean('trending').default(false), // Automatically calculated

    // Template/parent relationship
    parentCollectionId: integer('parent_collection_id'),
    version: integer('version').default(1), // For collection updates

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Unique constraint to prevent duplicate collection names per user
    uniqueUserCollectionName: unique('collections_user_name_unique').on(
      table.userId,
      table.name,
    ),
    // Indexes for performance
    idxUserId: index('collections_user_id_idx').on(table.userId),
    idxType: index('collections_type_idx').on(table.type),
    idxTypeUser: index('collections_type_user_idx').on(
      table.type,
      table.userId,
    ),
    idxVisibility: index('collections_visibility_idx').on(table.visibility),
    idxTheme: index('collections_theme_idx').on(table.theme),
    idxCategories: index('collections_categories_idx').on(table.categories),
    idxFeatured: index('collections_featured_idx').on(table.featured),
    idxTrending: index('collections_trending_idx').on(table.trending),
    idxTotalViews: index('collections_total_views_idx').on(table.totalViews),
    idxTotalLikes: index('collections_total_likes_idx').on(table.totalLikes),
    idxParent: index('collections_parent_collection_id_idx').on(
      table.parentCollectionId,
    ),
    idxCreatedAt: index('collections_created_at_idx').on(table.createdAt),
    idxUpdatedAt: index('collections_updated_at_idx').on(table.updatedAt),
  }),
);

// Junction table for collection-card relationships (many-to-many)
// This allows cards to be in multiple collections
export const collectionCards = pgTable(
  'collection_cards',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id), // References cards.id
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId), // Ensure owner matches

    // Position/order in collection
    position: integer('position').default(0),

    // When added to collection
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  table => ({
    // Unique constraint to prevent duplicate cards in the same collection
    uniqueCollectionCard: unique('collection_cards_collection_card_unique').on(
      table.collectionId,
      table.cardId,
    ),
    // Indexes for performance
    idxCollectionId: index('collection_cards_collection_id_idx').on(
      table.collectionId,
    ),
    idxCardId: index('collection_cards_card_id_idx').on(table.cardId),
    idxUserCollection: index('collection_cards_user_collection_idx').on(
      table.userId,
      table.collectionId,
    ),
  }),
);

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionCard = typeof collectionCards.$inferSelect;
export type NewCollectionCard = typeof collectionCards.$inferInsert;
