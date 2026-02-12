import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Social graph: follower -> following (both reference users.userId)
export const follows = pgTable(
  'follows',
  {
    followerUserId: varchar('follower_user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    followingUserId: varchar('following_user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    pk: primaryKey({
      columns: [table.followerUserId, table.followingUserId],
      name: 'follows_pk',
    }),
    idxFollower: index('follows_follower_idx').on(table.followerUserId),
    idxFollowing: index('follows_following_idx').on(table.followingUserId),
    idxCreatedAt: index('follows_created_at_idx').on(table.createdAt),
  }),
);

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
