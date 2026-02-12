import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const boosterDrops = pgTable(
  'booster_drops',
  {
    id: serial('id').primaryKey(),
    packSlug: varchar('pack_slug', { length: 128 }),
    slug: varchar('slug', { length: 128 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    status: varchar('status', { length: 24 }).notNull().default('scheduled'), // scheduled | active | sold_out | ended
    totalSupply: integer('total_supply').notNull(),
    remainingSupply: integer('remaining_supply').notNull(),
    startsAt: timestamp('starts_at'),
    endsAt: timestamp('ends_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    slugUnique: uniqueIndex('booster_drops_slug_unique').on(table.slug),
    // Optional composite uniqueness if desired in future migrations
    // packSlugAndSlugUnique: uniqueIndex('booster_drops_pack_slug_slug_unique').on(table.packSlug, table.slug),
  }),
);

export type BoosterDrop = typeof boosterDrops.$inferSelect;
export type NewBoosterDrop = typeof boosterDrops.$inferInsert;
