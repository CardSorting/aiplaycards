// Stub auth schema for compatibility
// This module provides types and schemas for auth-related database tables

import { pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';

/**
 * Auth users table - stub implementation
 */
export const authUsers = pgTable('auth_users', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email'),
    emailVerified: timestamp('email_verified'),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type AuthUser = typeof authUsers.$inferSelect;
export type NewAuthUser = typeof authUsers.$inferInsert;
