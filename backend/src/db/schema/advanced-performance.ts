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

// Global data types and enums for performance optimization
export const IndexStrategy = {
  BTREE: 'btree',
  HASH: 'hash',
  GIST: 'gist',
  GIN: 'gin',
  SPGIST: 'spgist',
  BRIN: 'brin',
  RUM: 'rum',
} as const;

export const PartitionType = {
  RANGE: 'range',
  LIST: 'list',
  HASH: 'hash',
} as const;

export const CompressionType = {
  NONE: 'none',
  LZ4: 'lz4',
  ZSTD: 'zstd',
  PGLZ: 'pglz',
} as const;

// Performance monitoring table
export const performanceMetrics = pgTable(
  'performance_metrics',
  {
    id: serial('id').primaryKey(),
    metricName: varchar('metric_name', { length: 100 }).notNull(),
    metricValue: integer('metric_value').notNull(),
    dimensions: jsonb('dimensions'), // Key tags for filtering (user_id, endpoint, etc.)
    collectedAt: timestamp('collected_at').notNull().defaultNow(),
    retentionDays: integer('retention_days').default(30),
  },
  table => ({
    // Time-series optimized indexes
    idxMetricTime: index('performance_metrics_metric_time_idx').on(
      table.metricName,
      table.collectedAt,
    ),
    idxCollectedAt: index('performance_metrics_collected_at_idx').on(
      table.collectedAt,
    ),
    idxDimensions: index('performance_metrics_dimensions_gin_idx').using(
      'gin',
      table.dimensions,
    ),
  }),
);

// Query analytics table
export const queryAnalytics = pgTable(
  'query_analytics',
  {
    id: serial('id').primaryKey(),
    queryHash: varchar('query_hash', { length: 64 }).notNull(), // SHA256 of query fingerprint
    queryText: text('query_text'), // Anonymized query for analysis
    executionTime: integer('execution_time').notNull(), // in milliseconds
    rowsAffected: integer('rows_affected'),
    planCost: integer('plan_cost'), // PostgreSQL EXPLAIN cost
    calledBy: varchar('called_by', { length: 50 }), // 'api', 'migration', 'manual', etc.
    userContext: jsonb('user_context'), // Safe user info for analysis
    collectedAt: timestamp('collected_at').notNull().defaultNow(),
    isSlowQuery: boolean('is_slow_query').default(false), // > 100ms
  },
  table => ({
    // Performance analysis indexes
    idxQueryHash: index('query_analytics_query_hash_idx').on(table.queryHash),
    idxExecutionTime: index('query_analytics_execution_time_idx').on(
      table.executionTime,
    ),
    idxSlowQuery: index('query_analytics_slow_query_idx')
      .on(table.collectedAt, table.executionTime)
      .where(sql`${table.isSlowQuery} = true`),
    idxCollectedAt: index('query_analytics_collected_at_idx').on(
      table.collectedAt,
    ),
  }),
);

// Connection pool monitoring
export const connectionMetrics = pgTable(
  'connection_metrics',
  {
    id: serial('id').primaryKey(),
    poolName: varchar('pool_name', { length: 50 }).notNull(), // 'main', 'readonly', etc.
    activeConnections: integer('active_connections').notNull(),
    idleConnections: integer('idle_connections').notNull(),
    waitingClients: integer('waiting_clients').notNull(),
    maxConnections: integer('max_connections').notNull(),
    collectedAt: timestamp('collected_at').notNull().defaultNow(),
  },
  table => ({
    idxPoolTime: index('connection_metrics_pool_time_idx').on(
      table.poolName,
      table.collectedAt,
    ),
    idxCollectedAt: index('connection_metrics_collected_at_idx').on(
      table.collectedAt,
    ),
  }),
);

// Advanced indexing strategy table (for dynamic index management)
export const indexStrategies = pgTable(
  'index_strategies',
  {
    id: serial('id').primaryKey(),
    tableName: varchar('table_name', { length: 100 }).notNull(),
    indexName: varchar('index_name', { length: 100 }).notNull(),
    strategy: varchar('strategy', { length: 20 }).default(IndexStrategy.BTREE),
    columns: jsonb('columns').notNull(), // Array of column definitions
    whereClause: text('where_clause'), // For partial indexes
    isActive: boolean('is_active').default(true),
    usageCount: integer('usage_count').default(0), // How often index is used
    lastAnalyzed: timestamp('last_analyzed'), // When index statistics were last updated
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    // Self-referencing indexes for management
    idxTableName: index('index_strategies_table_name_idx').on(table.tableName),
    idxIsActive: index('index_strategies_is_active_idx').on(table.isActive),
    idxUsage: index('index_strategies_usage_idx').on(
      table.usageCount,
      table.lastAnalyzed,
    ),
  }),
);

// Table partitioning strategy
export const partitioningStrategies = pgTable(
  'partitioning_strategies',
  {
    id: serial('id').primaryKey(),
    tableName: varchar('table_name', { length: 100 }).notNull(),
    partitionType: varchar('partition_type', { length: 20 }).default(
      PartitionType.RANGE,
    ),
    partitionKey: varchar('partition_key', { length: 50 }).notNull(), // Column to partition by
    partitionInterval: varchar('partition_interval', { length: 50 }), // 'monthly', 'daily', '1 month', etc.
    retentionPartitions: integer('retention_partitions').default(12), // How many partitions to keep
    isActive: boolean('is_active').default(false), // Currently partitioned?
    lastPartitionCreated: timestamp('last_partition_created'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxTableName: index('partitioning_strategies_table_name_idx').on(
      table.tableName,
    ),
    idxIsActive: index('partitioning_strategies_is_active_idx').on(
      table.isActive,
    ),
  }),
);

// Compression strategy for large tables
export const compressionStrategies = pgTable(
  'compression_strategies',
  {
    id: serial('id').primaryKey(),
    tableName: varchar('table_name', { length: 100 }).notNull(),
    compressionType: varchar('compression_type', { length: 10 }).default(
      CompressionType.LZ4,
    ),
    compressionLevel: integer('compression_level').default(3), // 1-9 for zstd, etc.
    minTupleSize: integer('min_tuple_size').default(2048), // Min size to compress (bytes)
    isActive: boolean('is_active').default(false),
    compressedRows: integer('compressed_rows').default(0),
    compressionRatio: integer('compression_ratio'), // Percentage saved
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxTableName: index('compression_strategies_table_name_idx').on(
      table.tableName,
    ),
    idxIsActive: index('compression_strategies_is_active_idx').on(
      table.isActive,
    ),
  }),
);

// Query optimization hints
export const queryHints = pgTable(
  'query_hints',
  {
    id: serial('id').primaryKey(),
    queryPattern: text('query_pattern').notNull(), // Regex or fingerprint pattern
    hintType: varchar('hint_type', { length: 50 }).notNull(), // 'index', 'join_method', 'scan', etc.
    hintText: text('hint_text').notNull(), // pg_hint_plan syntax
    isActive: boolean('is_active').default(true),
    usageCount: integer('usage_count').default(0),
    averageImprovement: integer('average_improvement'), // Percentage improvement
    lastUsed: timestamp('last_used'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxPattern: index('query_hints_pattern_idx').on(table.queryPattern),
    idxIsActive: index('query_hints_is_active_idx').on(table.isActive),
    idxUsage: index('query_hints_usage_idx').on(
      table.usageCount,
      table.lastUsed,
    ),
  }),
);

// Database maintenance logs
export const maintenanceLogs = pgTable(
  'maintenance_logs',
  {
    id: serial('id').primaryKey(),
    operation: varchar('operation', { length: 50 }).notNull(), // 'vacuum', 'analyze', 'reindex', etc.
    targetTable: varchar('target_table', { length: 100 }),
    startedAt: timestamp('started_at').notNull(),
    completedAt: timestamp('completed_at'),
    durationMs: integer('duration_ms'),
    success: boolean('success').default(true),
    details: jsonb('details'), // Operation-specific metadata
    triggeredBy: varchar('triggered_by', { length: 50 }).default('automatic'), // 'automatic', 'manual', 'cron'
  },
  table => ({
    // Maintenance tracking indexes
    idxOperation: index('maintenance_logs_operation_idx').on(
      table.operation,
      table.startedAt,
    ),
    idxTable: index('maintenance_logs_target_table_idx').on(
      table.targetTable,
      table.startedAt,
    ),
    idxSuccess: index('maintenance_logs_success_idx').on(
      table.success,
      table.startedAt,
    ),
    idxStartedAt: index('maintenance_logs_started_at_idx').on(table.startedAt),
    idxTriggeredBy: index('maintenance_logs_triggered_by_idx').on(
      table.triggeredBy,
    ),
  }),
);

// Optimized data archival strategy
export const archivalStrategies = pgTable(
  'archival_strategies',
  {
    id: serial('id').primaryKey(),
    tableName: varchar('table_name', { length: 100 }).notNull(),
    archiveCondition: text('archive_condition').notNull(), // SQL WHERE clause
    archiveTable: varchar('archive_table', { length: 100 }), // Target archive table
    retentionDays: integer('retention_days').notNull(),
    lastArchiveRun: timestamp('last_archive_run'),
    archivedRecords: integer('archived_records').default(0),
    isActive: boolean('is_active').default(false),
    archiveMethod: varchar('archive_method', { length: 20 }).default('move'), // 'move', 'copy', 'delete'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    idxTableName: index('archival_strategies_table_name_idx').on(
      table.tableName,
    ),
    idxIsActive: index('archival_strategies_is_active_idx').on(table.isActive),
    idxLastRun: index('archival_strategies_last_run_idx').on(
      table.lastArchiveRun,
    ),
  }),
);

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type QueryAnalytic = typeof queryAnalytics.$inferSelect;
export type ConnectionMetric = typeof connectionMetrics.$inferSelect;
export type IndexStrategy = typeof indexStrategies.$inferSelect;
export type PartitioningStrategy = typeof partitioningStrategies.$inferSelect;
export type CompressionStrategy = typeof compressionStrategies.$inferSelect;
export type QueryHint = typeof queryHints.$inferSelect;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type ArchivalStrategy = typeof archivalStrategies.$inferSelect;
