import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { cards } from './cards';
import { marketplaceListings } from './marketplace';

export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId),
    type: varchar('type', { length: 32 }).notNull(), // 'follower' | 'like' | 'sale' | 'welcome' | 'moderation'
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // Optional references based on notification type
    fromUserId: varchar('from_user_id', { length: 255 }).references(
      () => users.userId,
    ), // For follower/like notifications
    cardId: integer('card_id').references(() => cards.id), // For like notifications
    listingId: integer('listing_id').references(() => marketplaceListings.id), // For sale notifications
  },
  table => ({
    idxUserId: index('notifications_user_id_idx').on(table.userId),
    idxUserIdIsRead: index('notifications_user_id_is_read_idx').on(
      table.userId,
      table.isRead,
    ),
    idxType: index('notifications_type_idx').on(table.type),
    idxCreatedAt: index('notifications_created_at_idx').on(table.createdAt),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
