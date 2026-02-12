import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  serial,
  smallint,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enum types for better data integrity
export const UserStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DEACTIVATED: 'deactivated',
} as const;

export const UserRole = {
  USER: 'user',
  PREMIUM: 'premium',
  MODERATOR: 'moderator',
} as const;

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull().unique(),

    // Profile fields
    displayName: varchar('display_name', { length: 150 }),
    bio: varchar('bio', { length: 500 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    bannerUrl: varchar('banner_url', { length: 500 }),

    // Status and role
    status: varchar('status', { length: 20 }).default(UserStatus.ACTIVE),
    role: varchar('role', { length: 20 }).default(UserRole.USER),

    // Financial fields
    credits: integer('credits').notNull().default(0),
    totalCreditsEarned: integer('total_credits_earned').default(0),
    totalCreditsSpent: integer('total_credits_spent').default(0),

    // Engagement metrics
    reputation: integer('reputation').default(0),
    level: smallint('level').default(1),
    xp: integer('xp').default(0),

    // Privacy and preferences
    isPrivate: boolean('is_private').default(false),
    allowMessages: boolean('allow_messages').default(true),
    receiveNotifications: boolean('receive_notifications').default(true),

    // Verification and badges
    verified: boolean('verified').default(false),
    badges: varchar('badges', { length: 1000 }), // JSON array of badge IDs

    // Security and meta
    lastLoginAt: timestamp('last_login_at'),
    lastActivityAt: timestamp('last_activity_at'),
    mfaEnabled: boolean('mfa_enabled').default(false),

    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deactivatedAt: timestamp('deactivated_at'),
    version: integer('version').default(1),

    // GDPR compliance
    deletedAt: timestamp('deleted_at'), // Soft delete
  },
  table => ({
    // Check constraints for data integrity using SQL template literals
    creditsMinCheck: check(
      'users_credits_min_check',
      sql`${table.credits} >= 0`,
    ),
    statusCheck: check(
      'users_status_check',
      sql`${table.status} IN ('${UserStatus.ACTIVE}', '${UserStatus.SUSPENDED}', '${UserStatus.BANNED}', '${UserStatus.DEACTIVATED}')`,
    ),
    roleCheck: check(
      'users_role_check',
      sql`${table.role} IN ('${UserRole.USER}', '${UserRole.PREMIUM}', '${UserRole.MODERATOR}')`,
    ),
    levelCheck: check(
      'users_level_check',
      sql`${table.level} >= 1 AND ${table.level} <= 100`,
    ),
    xpCheck: check('users_xp_check', sql`${table.xp} >= 0`),

    // Indexes for performance
    idxUserId: index('users_user_id_idx').on(table.userId),
    idxStatus: index('users_status_idx').on(table.status),
    idxRole: index('users_role_idx').on(table.role),
    idxLastActivity: index('users_last_activity_idx').on(table.lastActivityAt),
    idxCreatedAt: index('users_created_at_idx').on(table.createdAt),
    idxCredits: index('users_credits_idx').on(table.credits),
    idxReputation: index('users_reputation_idx').on(table.reputation),
    idxPrivate: index('users_private_filter_idx').on(table.isPrivate),
    idxDeletedAt: index('users_deleted_at_idx').on(table.deletedAt),

    // Covering indexes for common queries
    idxActiveUsers: index('users_active_idx').on(
      table.status,
      table.createdAt,
      table.lastActivityAt,
    ),
    idxUserProfile: index('users_profile_idx').on(
      table.userId,
      table.displayName,
      table.avatarUrl,
    ),

    // Partial index for active premium users (more performant than full index)
    idxActivePremium: index('users_active_premium_idx')
      .on(table.lastActivityAt, table.role)
      .where(
        sql`${table.status} = ${UserStatus.ACTIVE} AND ${table.role} = ${UserRole.PREMIUM}`,
      ),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
