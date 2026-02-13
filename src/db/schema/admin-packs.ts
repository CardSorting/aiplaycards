// Stub schema for admin packs
// This is a placeholder implementation

import { pgTable, serial, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';

export const adminPacks = pgTable('admin_packs', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const adminPackCreations = pgTable('admin_pack_creations', {
    id: serial('id').primaryKey(),
    packId: integer('pack_id').notNull(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type AdminPack = typeof adminPacks.$inferSelect;
export type NewAdminPack = typeof adminPacks.$inferInsert;
export type AdminPackCreation = typeof adminPackCreations.$inferSelect;
export type NewAdminPackCreation = typeof adminPackCreations.$inferInsert;
