import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

// Enum definitions for audit and compliance
export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  SOFT_DELETE: 'SOFT_DELETE',
  RESTORE: 'RESTORE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  ROLE_CHANGE: 'ROLE_CHANGE',
} as const;

export const AuditStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  WARNING: 'WARNING',
} as const;

export const AuditSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// Comprehensive audit trail table following industry standards
export const auditTrail = pgTable(
  'audit_trail',
  {
    id: serial('id').primaryKey(),

    // Actor information
    userId: varchar('user_id', { length: 255 }).references(() => users.userId, {
      onDelete: 'set null',
    }),
    actorType: varchar('actor_type', { length: 20 }).default('user'), // 'user', 'system'
    actorIp: varchar('actor_ip', { length: 45 }), // IPv4/IPv6
    actorUserAgent: text('actor_user_agent'),
    sessionId: varchar('session_id', { length: 255 }),

    // Action details
    action: varchar('action', { length: 32 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(), // 'cards', 'users', 'collections', etc.
    entityId: varchar('entity_id', { length: 255 }), // Primary key of affected entity
    oldValues: jsonb('old_values'), // Previous state (for updates)
    newValues: jsonb('new_values'), // New state
    changes: jsonb('changes'), // Specific fields that changed

    // Context and metadata
    context: jsonb('context'), // Additional context (correlation ID, etc.)
    severity: varchar('severity', { length: 20 }).default(AuditSeverity.LOW),
    status: varchar('status', { length: 20 }).default(AuditStatus.SUCCESS),

    // Compliance and security
    complianceFlags: jsonb('compliance_flags'), // GDPR, SOX, etc.
    dataClass: varchar('data_class', { length: 50 }), // 'public', 'internal', 'confidential', 'sensitive'
    retentionYears: integer('retention_years').default(7), // How long to keep this audit entry

    // Error and failure information
    errorCode: varchar('error_code', { length: 50 }),
    errorMessage: text('error_message'),

    // Timestamps (immutable)
    eventTime: timestamp('event_time').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),

    // Partitioning key (use event_time for automated partitioning)
    partitionKey: integer('partition_key').default(0), // For manual partitioning control
  },
  table => ({
    // Indexes for efficient querying and compliance reporting
    idxUserAction: index('audit_trail_user_action_idx').on(
      table.userId,
      table.action,
      table.eventTime.desc(),
    ),
    idxEntityType: index('audit_trail_entity_type_idx').on(
      table.entityType,
      table.eventTime.desc(),
    ),
    idxEntityId: index('audit_trail_entity_id_idx').on(table.entityId),
    idxEventTime: index('audit_trail_event_time_idx').on(table.eventTime),
    idxSeverity: index('audit_trail_severity_idx').on(table.severity),
    idxStatus: index('audit_trail_status_idx').on(table.status),

    // Composite indexes for common audit queries
    idxCompliance: index('audit_trail_compliance_idx').on(
      table.complianceFlags,
      table.severity,
      table.eventTime,
    ),
    idxRecentActivity: index('audit_trail_recent_activity_idx').on(
      table.action,
      table.entityType,
      table.eventTime.desc(),
    ),

    // Partial indexes for filtering
    idxSensitiveData: index('audit_trail_sensitive_data_idx')
      .on(table.eventTime, table.dataClass)
      .where(sql`${table.dataClass} IN ('confidential', 'sensitive')`),

    idxErrors: index('audit_trail_errors_idx')
      .on(table.eventTime, table.severity)
      .where(
        sql`${table.status} = ${AuditStatus.FAILURE} OR ${table.severity} = ${AuditSeverity.CRITICAL}`,
      ),

    // GIN index for JSONB fields
    idxOldValues: index('audit_trail_old_values_gsi_idx').using(
      'gin',
      table.oldValues,
    ),
    idxNewValues: index('audit_trail_new_values_gsi_idx').using(
      'gin',
      table.newValues,
    ),
    idxChanges: index('audit_trail_changes_gsi_idx').using(
      'gin',
      table.changes,
    ),
    idxContext: index('audit_trail_context_gsi_idx').using(
      'gin',
      table.context,
    ),
  }),
);

// GDPR compliance tracking table
export const dataProcessingActivities = pgTable('data_processing_activities', {
  id: serial('id').primaryKey(),
  activityType: varchar('activity_type', { length: 50 }).notNull(), // 'collection', 'processing', 'storage'
  legalBasis: varchar('legal_basis', { length: 100 }).notNull(), // 'consent', 'contract', 'legitimate_interest', etc.
  purpose: text('purpose').notNull(),
  dataCategories: jsonb('data_categories').notNull(), // Which personal data categories are involved
  recipients: jsonb('recipients'), // Who receives the data
  retentionPeriod: varchar('retention_period', { length: 50 }).notNull(), // '1 year', 'until consent withdrawn', etc.
  securityMeasures: jsonb('security_measures'), // Security controls applied
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Data retention policies table
export const retentionPolicies = pgTable('retention_policies', {
  id: serial('id').primaryKey(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  columnName: varchar('column_name', { length: 100 }), // NULL for table-wide policies
  retentionPeriodDays: integer('retention_period_days').notNull(),
  archiveThresholdDays: integer('archive_threshold_days'), // When to move to cold storage
  deleteThresholdDays: integer('delete_threshold_days'), // When to delete permanently
  lastExecuted: timestamp('last_executed'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Session tracking for security monitoring
export const userSessions = pgTable(
  'user_sessions',
  {
    id: serial('id').primaryKey(),
    sessionId: varchar('session_id', { length: 255 }).notNull().unique(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.userId, {
        onDelete: 'cascade',
      }),

    // Session metadata
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    deviceFingerprint: jsonb('device_fingerprint'),
    locationData: jsonb('location_data'), // Geolocation data (privacy-conscious)

    // Session status
    isActive: boolean('is_active').default(true),
    lastActivity: timestamp('last_activity').defaultNow(),
    expiresAt: timestamp('expires_at'),

    // Security monitoring
    failedAttempts: integer('failed_attempts').default(0),
    suspiciousActivity: boolean('suspicious_activity').default(false),
    riskScore: integer('risk_score').default(0),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    terminatedAt: timestamp('terminated_at'),
  },
  table => ({
    idxUserId: index('user_sessions_user_id_idx').on(table.userId),
    idxSessionId: index('user_sessions_session_id_idx').on(table.sessionId),
    idxIsActive: index('user_sessions_is_active_idx').on(
      table.isActive,
      table.lastActivity,
    ),
    idxExpiresAt: index('user_sessions_expires_at_idx').on(table.expiresAt),
    idxRisk: index('user_sessions_risk_idx').on(
      table.riskScore,
      table.isActive,
    ),
  }),
);

export type AuditTrail = typeof auditTrail.$inferSelect;
export type DataProcessingActivity =
  typeof dataProcessingActivities.$inferSelect;
export type RetentionPolicy = typeof retentionPolicies.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
