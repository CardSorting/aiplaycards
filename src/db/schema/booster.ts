import {
  integer,
  json,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// Per-user booster rarity queue to simulate pack distributions over time
export const boosterUserState = pgTable(
  'booster_user_state',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    rarityQueue: json('rarity_queue').$type<string[] | null>().default(null),
    queueIndex: integer('queue_index').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => ({
    userUnique: uniqueIndex('booster_user_state_user_unique').on(table.userId),
  }),
);

export type BoosterUserState = typeof boosterUserState.$inferSelect;
export type NewBoosterUserState = typeof boosterUserState.$inferInsert;
