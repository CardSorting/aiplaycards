import {
  index,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { cards } from './cards';
import { users } from './users';

// Per-card likes
export const cardLikes = pgTable(
  'card_likes',
  {
    id: serial('id').primaryKey(),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    // Prevent duplicate likes (user can only like a card once)
    uniqCardUser: unique('card_likes_card_user_unique').on(
      table.cardId,
      table.userId,
    ),
    idxCard: index('card_likes_card_idx').on(table.cardId),
    idxUser: index('card_likes_user_idx').on(table.userId),
    idxCreatedAt: index('card_likes_created_at_idx').on(table.createdAt),
  }),
);

export type CardLike = typeof cardLikes.$inferSelect;
export type NewCardLike = typeof cardLikes.$inferInsert;

// Per-card comments
export const cardComments = pgTable(
  'card_comments',
  {
    id: serial('id').primaryKey(),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxCard: index('card_comments_card_idx').on(table.cardId),
    idxUser: index('card_comments_user_idx').on(table.userId),
    idxCreatedAt: index('card_comments_created_at_idx').on(table.createdAt),
  }),
);

export type CardComment = typeof cardComments.$inferSelect;
export type NewCardComment = typeof cardComments.$inferInsert;

// Per-card star ratings (1-5 stars)
export const cardRatings = pgTable(
  'card_ratings',
  {
    id: serial('id').primaryKey(),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    rating: smallint('rating').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Prevent duplicate ratings (user can only rate a card once)
    uniqCardUser: unique('card_ratings_card_user_unique').on(
      table.cardId,
      table.userId,
    ),
    idxCard: index('card_ratings_card_idx').on(table.cardId),
    idxUser: index('card_ratings_user_idx').on(table.userId),
    idxRating: index('card_ratings_rating_idx').on(table.rating),
    idxCreatedAt: index('card_ratings_created_at_idx').on(table.createdAt),
  }),
);

export type CardRating = typeof cardRatings.$inferSelect;
export type NewCardRating = typeof cardRatings.$inferInsert;

// Collection social features (similar to card social features but for collections)
import { collections } from './collections';

// Collection likes
export const collectionLikes = pgTable(
  'collection_likes',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    // Prevent duplicate likes (user can only like a collection once)
    uniqCollectionUser: unique('collection_likes_collection_user_unique').on(
      table.collectionId,
      table.userId,
    ),
    idxCollection: index('collection_likes_collection_idx').on(
      table.collectionId,
    ),
    idxUser: index('collection_likes_user_idx').on(table.userId),
    idxCreatedAt: index('collection_likes_created_at_idx').on(table.createdAt),
  }),
);

export type CollectionLike = typeof collectionLikes.$inferSelect;
export type NewCollectionLike = typeof collectionLikes.$inferInsert;

// Collection comments
export const collectionComments = pgTable(
  'collection_comments',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    idxCollection: index('collection_comments_collection_idx').on(
      table.collectionId,
    ),
    idxUser: index('collection_comments_user_idx').on(table.userId),
    idxCreatedAt: index('collection_comments_created_at_idx').on(
      table.createdAt,
    ),
  }),
);

export type CollectionComment = typeof collectionComments.$inferSelect;
export type NewCollectionComment = typeof collectionComments.$inferInsert;

// Collection ratings (1-5 stars)
export const collectionRatings = pgTable(
  'collection_ratings',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    rating: smallint('rating').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Prevent duplicate ratings (user can only rate a collection once)
    uniqCollectionUser: unique('collection_ratings_collection_user_unique').on(
      table.collectionId,
      table.userId,
    ),
    idxCollection: index('collection_ratings_collection_idx').on(
      table.collectionId,
    ),
    idxUser: index('collection_ratings_user_idx').on(table.userId),
    idxRating: index('collection_ratings_rating_idx').on(table.rating),
    idxCreatedAt: index('collection_ratings_created_at_idx').on(
      table.createdAt,
    ),
  }),
);

export type CollectionRating = typeof collectionRatings.$inferSelect;
export type NewCollectionRating = typeof collectionRatings.$inferInsert;

// Collection follows (users following collections)
export const collectionFollows = pgTable(
  'collection_follows',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    // Prevent duplicate follows (user can only follow a collection once)
    uniqCollectionUser: unique('collection_follows_collection_user_unique').on(
      table.collectionId,
      table.userId,
    ),
    idxCollection: index('collection_follows_collection_idx').on(
      table.collectionId,
    ),
    idxUser: index('collection_follows_user_idx').on(table.userId),
    idxCreatedAt: index('collection_follows_created_at_idx').on(
      table.createdAt,
    ),
  }),
);

export type CollectionFollow = typeof collectionFollows.$inferSelect;
export type NewCollectionFollow = typeof collectionFollows.$inferInsert;
