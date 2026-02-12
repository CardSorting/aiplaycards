import {
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { boosterJobs } from './booster-jobs';
import { sql } from 'drizzle-orm';

// Enum definitions for better data integrity
export const TransactionReason = {
  // Earn credits
  ANIMATION_COMPLETION: 'animation_completion',
  PACK_PURCHASE_REFUND: 'pack_purchase_refund',
  SELLER_FEES: 'seller_fees',
  PROMOTION_REWARD: 'promotion_reward',
  DAILY_BONUS: 'daily_bonus',
  SIGNUP_BONUS: 'signup_bonus',
  REFERRAL_BONUS: 'referral_bonus',

  // Spend credits
  PACK_PURCHASE: 'pack_purchase',
  CARD_ANIMATION: 'card_animation',
  MARKETPLACE_LISTING_FEE: 'marketplace_listing_fee',
  MARKETPLACE_PURCHASE: 'marketplace_purchase',

  // System
  BUG_FIX_COMPENSATION: 'bug_fix_compensation',
  SYSTEM_REFUND: 'system_refund',
} as const;

export const TransactionStatus = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: serial('id').primaryKey(),

    // Transaction details
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    delta: integer('delta').notNull(), // positive for add, negative for consume

    // Transaction metadata
    reason: varchar('reason', { length: 64 }).notNull(),
    description: text('description'), // Human-readable description
    referenceId: varchar('reference_id', { length: 255 }), // External reference (order ID, etc.)
    balanceBefore: integer('balance_before'), // User's balance before transaction
    balanceAfter: integer('balance_after'), // User's balance after transaction

    // Status and tracking
    status: varchar('status', { length: 20 }).default(
      TransactionStatus.COMPLETED,
    ),

    // Relations
    jobId: integer('job_id').references(() => boosterJobs.id, {
      onDelete: 'set null',
    }),
    relatedTransactionId: integer('related_transaction_id'), // For reversals, refunds, etc.

    // Audit and security
    createdAt: timestamp('created_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'), // When transaction was actually processed
    ipAddress: varchar('ip_address', { length: 45 }), // IPv4/IPv6
    userAgent: text('user_agent'),
    sessionId: varchar('session_id', { length: 255 }), // For fraud detection

    // Versioning and soft delete
    version: integer('version').default(1),
    cancelledAt: timestamp('cancelled_at'),
  },
  table => ({
    // Check constraints for data integrity using SQL template literals
    deltaNotZeroCheck: check(
      'credit_transactions_delta_not_zero_check',
      sql`${table.delta} != 0`,
    ),
    reasonValidCheck: check(
      'credit_transactions_reason_valid_check',
      sql`${table.reason} IS NOT NULL AND length(trim(${table.reason})) > 0`,
    ),
    balanceNonNegativeCheck: check(
      'credit_transactions_balance_non_negative_check',
      sql`${table.balanceAfter} IS NULL OR ${table.balanceAfter} >= 0`,
    ),
    balanceConsistencyCheck: check(
      'credit_transactions_balance_consistency_check',
      sql`(${table.balanceBefore} IS NULL AND ${table.balanceAfter} IS NULL) OR (${table.balanceBefore} + ${table.delta} = ${table.balanceAfter})`,
    ),
    processedAfterCreatedCheck: check(
      'credit_transactions_processed_after_created_check',
      sql`${table.processedAt} IS NULL OR ${table.processedAt} >= ${table.createdAt}`,
    ),
    statusValidCheck: check(
      'credit_transactions_status_valid_check',
      sql`${table.status} IN ('completed', 'pending', 'failed', 'cancelled')`,
    ),

    // Performance indexes - covering indexes for common queries
    idxUserId: index('credit_transactions_user_id_idx').on(table.userId),
    idxUserCreatedAt: index('credit_transactions_user_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
    idxReason: index('credit_transactions_reason_idx').on(table.reason),
    idxJobId: index('credit_transactions_job_id_idx').on(table.jobId),
    idxStatus: index('credit_transactions_status_idx').on(table.status),
    idxCreatedAt: index('credit_transactions_created_at_idx').on(
      table.createdAt,
    ),
    idxProcessedAt: index('credit_transactions_processed_at_idx').on(
      table.processedAt,
    ),
    idxDelta: index('credit_transactions_delta_idx').on(table.delta),

    // Complex covering indexes
    idxUserCreditsChange: index(
      'credit_transactions_user_credits_change_idx',
    ).on(table.userId, table.delta, table.createdAt),
    idxRecentTransactions: index('credit_transactions_recent_idx').on(
      table.userId,
      table.createdAt,
      table.status,
    ),

    // Partial indexes for performance
    idxCompletedTransactions: index('credit_transactions_completed_idx')
      .on(table.userId, table.createdAt)
      .where(sql`${table.status} = ${TransactionStatus.COMPLETED}`),

    idxPendingTransactions: index('credit_transactions_pending_idx')
      .on(table.userId, table.createdAt)
      .where(sql`${table.status} = ${TransactionStatus.PENDING}`),

    // Audit and security indexes
    idxSessionId: index('credit_transactions_session_id_idx').on(
      table.sessionId,
    ),
    idxReferenceId: index('credit_transactions_reference_id_idx').on(
      table.referenceId,
    ),
  }),
);

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
