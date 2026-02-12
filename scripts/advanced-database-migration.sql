-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA IMPROVEMENT MIGRATION
-- File: scripts/advanced-database-migration.sql
--
-- This migration implements industry-standard database improvements
-- focusing on admin functions and print order relationships:
-- - Enhanced print order schema with admin workflow
-- - Admin workflow and audit trail integration
-- - Relationship integrity and cascade behavior
-- - Advanced audit trails with GDPR compliance
-- - Performance monitoring and optimization
-- - Data retention and archival strategies
-- - Row-level security policies
-- - Database triggers for automatic audit logging
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADVANCED AUDIT TRAIL SYSTEM
-- =====================================================

-- Create audit trail table (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_trail') THEN
    CREATE TABLE audit_trail (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255), -- Can be NULL for system actions
      actor_type VARCHAR(20) DEFAULT 'user',
      actor_ip VARCHAR(45),
      actor_user_agent TEXT,
      session_id VARCHAR(255),
      action VARCHAR(32) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(255),
      old_values JSONB,
      new_values JSONB,
      changes JSONB,
      context JSONB,
      severity VARCHAR(20) DEFAULT 'LOW',
      status VARCHAR(20) DEFAULT 'SUCCESS',
      compliance_flags JSONB,
      data_class VARCHAR(50),
      retention_years INTEGER DEFAULT 7,
      error_code VARCHAR(50),
      error_message TEXT,
      event_time TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      partition_key INTEGER DEFAULT 0
    );

    -- Create indexes for the audit trail
    CREATE INDEX CONCURRENTLY audit_trail_user_action_idx ON audit_trail(user_id, action, event_time DESC);
    CREATE INDEX CONCURRENTLY audit_trail_entity_type_idx ON audit_trail(entity_type, event_time DESC);
    CREATE INDEX CONCURRENTLY audit_trail_entity_id_idx ON audit_trail(entity_id);
    CREATE INDEX CONCURRENTLY audit_trail_event_time_idx ON audit_trail(event_time);
    CREATE INDEX CONCURRENTLY audit_trail_severity_idx ON audit_trail(severity);
    CREATE INDEX CONCURRENTLY audit_trail_status_idx ON audit_trail(status);

    -- GIN indexes for JSONB fields
    CREATE INDEX CONCURRENTLY audit_trail_old_values_gsi_idx ON audit_trail USING gin (old_values);
    CREATE INDEX CONCURRENTLY audit_trail_new_values_gsi_idx ON audit_trail USING gin (new_values);
    CREATE INDEX CONCURRENTLY audit_trail_changes_gsi_idx ON audit_trail USING gin (changes);
    CREATE INDEX CONCURRENTLY audit_trail_context_gsi_idx ON audit_trail USING gin (context);

    -- Partial indexes for better performance
    CREATE INDEX CONCURRENTLY audit_trail_sensitive_data_idx ON audit_trail(event_time, data_class)
      WHERE data_class IN ('confidential', 'sensitive');
    CREATE INDEX CONCURRENTLY audit_trail_errors_idx ON audit_trail(event_time, severity)
      WHERE status = 'FAILURE' OR severity = 'CRITICAL';

    RAISE NOTICE 'Created audit_trail table and indexes';
  END IF;
END $$;

-- =====================================================
-- 2. USER SESSIONS TABLE FOR SECURITY MONITORING
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    CREATE TABLE user_sessions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL UNIQUE,
      user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      ip_address VARCHAR(45),
      user_agent TEXT,
      device_fingerprint JSONB,
      location_data JSONB,
      is_active BOOLEAN DEFAULT true,
      last_activity TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP,
      failed_attempts INTEGER DEFAULT 0,
      suspicious_activity BOOLEAN DEFAULT false,
      risk_score INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      terminated_at TIMESTAMP
    );

    -- Create indexes for session management
    CREATE INDEX CONCURRENTLY user_sessions_user_id_idx ON user_sessions(user_id);
    CREATE INDEX CONCURRENTLY user_sessions_session_id_idx ON user_sessions(session_id);
    CREATE INDEX CONCURRENTLY user_sessions_is_active_idx ON user_sessions(is_active, last_activity);
    CREATE INDEX CONCURRENTLY user_sessions_expires_at_idx ON user_sessions(expires_at);
    CREATE INDEX CONCURRENTLY user_sessions_risk_idx ON user_sessions(risk_score, is_active);

    RAISE NOTICE 'Created user_sessions table and indexes';
  END IF;
END $$;

-- =====================================================
-- 3. PERFORMANCE MONITORING TABLES
-- =====================================================

-- Performance metrics table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') THEN
    CREATE TABLE performance_metrics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(100) NOT NULL,
      metric_value INTEGER NOT NULL,
      dimensions JSONB,
      collected_at TIMESTAMP NOT NULL DEFAULT NOW(),
      retention_days INTEGER DEFAULT 30
    );

    CREATE INDEX CONCURRENTLY performance_metrics_metric_time_idx ON performance_metrics(metric_name, collected_at);
    CREATE INDEX CONCURRENTLY performance_metrics_collected_at_idx ON performance_metrics(collected_at);
    CREATE INDEX CONCURRENTLY performance_metrics_dimensions_gin_idx ON performance_metrics USING gin (dimensions);

    RAISE NOTICE 'Created performance_metrics table';
  END IF;
END $$;

-- Query analytics table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'query_analytics') THEN
    CREATE TABLE query_analytics (
      id SERIAL PRIMARY KEY,
      query_hash VARCHAR(64) NOT NULL,
      query_text TEXT,
      execution_time INTEGER NOT NULL,
      rows_affected INTEGER,
      plan_cost INTEGER,
      called_by VARCHAR(50),
      user_context JSONB,
      collected_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_slow_query BOOLEAN DEFAULT false
    );

    CREATE INDEX CONCURRENTLY query_analytics_query_hash_idx ON query_analytics(query_hash);
    CREATE INDEX CONCURRENTLY query_analytics_execution_time_idx ON query_analytics(execution_time);
    CREATE INDEX CONCURRENTLY query_analytics_slow_query_idx ON query_analytics(collected_at, execution_time)
      WHERE is_slow_query = true;
    CREATE INDEX CONCURRENTLY query_analytics_collected_at_idx ON query_analytics(collected_at);

    RAISE NOTICE 'Created query_analytics table';
  END IF;
END $$;

-- Connection metrics table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connection_metrics') THEN
    CREATE TABLE connection_metrics (
      id SERIAL PRIMARY KEY,
      pool_name VARCHAR(50) NOT NULL,
      active_connections INTEGER NOT NULL,
      idle_connections INTEGER NOT NULL,
      waiting_clients INTEGER NOT NULL,
      max_connections INTEGER NOT NULL,
      collected_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX CONCURRENTLY connection_metrics_pool_time_idx ON connection_metrics(pool_name, collected_at);
    CREATE INDEX CONCURRENTLY connection_metrics_collected_at_idx ON connection_metrics(collected_at);

    RAISE NOTICE 'Created connection_metrics table';
  END IF;
END $$;

-- =====================================================
-- 4. MAINTENANCE AND ARCHIVAL TABLES
-- =====================================================

-- Data retention policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'retention_policies') THEN
    CREATE TABLE retention_policies (
      id SERIAL PRIMARY KEY,
      table_name VARCHAR(100) NOT NULL,
      column_name VARCHAR(100), -- NULL for table-wide policies
      retention_period_days INTEGER NOT NULL,
      archive_threshold_days INTEGER,
      delete_threshold_days INTEGER,
      last_executed TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    RAISE NOTICE 'Created retention_policies table';
  END IF;
END $$;

-- Maintenance logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_logs') THEN
    CREATE TABLE maintenance_logs (
      id SERIAL PRIMARY KEY,
      operation VARCHAR(50) NOT NULL,
      target_table VARCHAR(100),
      started_at TIMESTAMP NOT NULL,
      completed_at TIMESTAMP,
      duration_ms INTEGER,
      success BOOLEAN DEFAULT true,
      details JSONB,
      triggered_by VARCHAR(50) DEFAULT 'automatic'
    );

    CREATE INDEX CONCURRENTLY maintenance_logs_operation_idx ON maintenance_logs(operation, started_at);
    CREATE INDEX CONCURRENTLY maintenance_logs_target_table_idx ON maintenance_logs(target_table, started_at);
    CREATE INDEX CONCURRENTLY maintenance_logs_success_idx ON maintenance_logs(success, started_at);
    CREATE INDEX CONCURRENTLY maintenance_logs_started_at_idx ON maintenance_logs(started_at);
    CREATE INDEX CONCURRENTLY maintenance_logs_triggered_by_idx ON maintenance_logs(triggered_by);

    RAISE NOTICE 'Created maintenance_logs table';
  END IF;
END $$;

-- =====================================================
-- 5. ADVANCED DATABASE TRIGGERS FOR AUDIT TRAILS
-- =====================================================

-- Function to automatically log audit events
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    changes_json JSONB := '{}';
    entity_type TEXT;
    action TEXT;
    old_row JSONB;
    new_row JSONB;
BEGIN
    -- Determine entity type from table name
    entity_type := TG_TABLE_NAME;

    -- Determine action
    IF TG_OP = 'INSERT' THEN
        action := 'CREATE';
        new_row := row_to_json(NEW)::JSONB;
        old_row := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        action := 'UPDATE';
        new_row := row_to_json(NEW)::JSONB;
        old_row := row_to_json(OLD)::JSONB;

        -- Build changes JSON
        SELECT jsonb_object_agg(key, jsonb_build_object('old', old_row->key, 'new', new_row->key))
        INTO changes_json
        FROM jsonb_object_keys(COALESCE(old_row, '{}'::jsonb) || COALESCE(new_row, '{}'::jsonb)) AS key
        WHERE old_row->key IS DISTINCT FROM new_row->key;

    ELSIF TG_OP = 'DELETE' THEN
        action := 'DELETE';
        old_row := row_to_json(OLD)::JSONB;
        new_row := NULL;
    END IF;

    -- Insert audit record
    INSERT INTO audit_trail (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        changes,
        data_class,
        severity
    ) VALUES (
        COALESCE(current_setting('app.current_user_id', true), 'system'),
        action,
        entity_type,
        CASE
            WHEN TG_OP = 'DELETE' THEN (old_row->>'id')::TEXT
            ELSE (new_row->>'id')::TEXT
        END,
        CASE WHEN TG_OP != 'INSERT' THEN old_row ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN new_row ELSE NULL END,
        CASE WHEN TG_OP = 'UPDATE' THEN changes_json ELSE NULL END,
        'internal', -- Default data class
        'LOW' -- Default severity
    );

    -- Return appropriate row for trigger
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables (users, cards, collections)
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_cards_trigger ON cards;
CREATE TRIGGER audit_cards_trigger
    AFTER INSERT OR UPDATE OR DELETE ON cards
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_collections_trigger ON collections;
CREATE TRIGGER audit_collections_trigger
    AFTER INSERT OR UPDATE OR DELETE ON collections
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

RAISE NOTICE 'Created audit triggers for key tables';

-- =====================================================
-- 6. ROW-LEVEL SECURITY POLICIES
-- =====================================================

-- Enable Row Level Security on key tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data or public data
CREATE POLICY users_own_data ON users
    FOR ALL USING (
        user_id = current_setting('app.current_user_id', true)::VARCHAR(255)
        OR current_setting('app.current_user_id', true)::VARCHAR(255) IN ('admin', 'system')
    );

-- Users can see public cards or their own cards
CREATE POLICY cards_public_or_own ON cards
    FOR SELECT USING (
        is_public = true
        OR user_id = current_setting('app.current_user_id', true)::VARCHAR(255)
        OR current_setting('app.current_user_id', true)::VARCHAR(255) IN ('admin', 'system')
    );

-- Cards can be modified only by their owners or admins
CREATE POLICY cards_modify_own ON cards
    FOR ALL USING (
        user_id = current_setting('app.current_user_id', true)::VARCHAR(255)
        OR current_setting('app.current_user_id', true)::VARCHAR(255) IN ('admin', 'system')
    );

-- Collections visibility policy
CREATE POLICY collections_visibility ON collections
    FOR SELECT USING (
        is_private = false
        OR user_id = current_setting('app.current_user_id', true)::VARCHAR(255)
        OR current_setting('app.current_user_id', true)::VARCHAR(255) IN ('admin', 'system')
        OR visibility IN ('public', 'shared')
    );

-- Audit trail - only admins and auditors can see sensitive data
CREATE POLICY audit_trail_access ON audit_trail
    FOR SELECT USING (
        current_setting('app.current_user_id', true)::VARCHAR(255) IN ('admin', 'auditor')
        OR data_class NOT IN ('confidential', 'sensitive')
    );

RAISE NOTICE 'Created Row Level Security policies';

-- =====================================================
-- 7. DATA RETENTION FUNCTION
-- =====================================================

-- Function to automatically clean up old data based on retention policies
CREATE OR REPLACE FUNCTION execute_data_retention()
RETURNS TABLE(processed_table TEXT, deleted_records BIGINT) AS $$
DECLARE
    policy_record RECORD;
    delete_query TEXT;
    start_time TIMESTAMP;
    affected_rows BIGINT;
BEGIN
    FOR policy_record IN
        SELECT * FROM retention_policies WHERE is_active = true
    LOOP
        start_time := NOW();
        affected_rows := 0;

        -- Build delete query based on policy
        IF policy_record.column_name IS NULL THEN
            -- Table-wide retention
            delete_query := format(
                'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days''',
                policy_record.table_name,
                'created_at', -- Assume created_at column for table-wide
                policy_record.retention_period_days
            );
        ELSE
            -- Column-specific retention
            delete_query := format(
                'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days''',
                policy_record.table_name,
                policy_record.column_name,
                policy_record.retention_period_days
            );
        END IF;

        -- Execute the delete query
        EXECUTE delete_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;

        -- Log the operation
        INSERT INTO maintenance_logs (
            operation,
            target_table,
            started_at,
            completed_at,
            duration_ms,
            success,
            details,
            triggered_by
        ) VALUES (
            'data_retention',
            policy_record.table_name,
            start_time,
            NOW(),
            EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000,
            true,
            jsonb_build_object(
                'policy_id', policy_record.id,
                'retention_days', policy_record.retention_period_days,
                'delete_query', delete_query,
                'affected_rows', affected_rows
            ),
            'automatic'
        );

        -- Return result for this table
        processed_table := policy_record.table_name;
        deleted_records := affected_rows;
        RETURN NEXT;

        -- Update last execution time
        UPDATE retention_policies
        SET last_executed = NOW()
        WHERE id = policy_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. PERFORMANCE OPTIMIZATION FUNCTIONS
-- =====================================================

-- Function to analyze query performance and suggest improvements
CREATE OR REPLACE FUNCTION analyze_query_performance(
    query_text TEXT,
    execution_time_threshold INTEGER DEFAULT 100
) RETURNS TABLE (
    suggestion_type TEXT,
    suggestion TEXT,
    estimated_improvement_percent INTEGER
) AS $$
DECLARE
    query_plan JSONB;
    is_sequential_scan BOOLEAN := false;
    is_full_table_scan BOOLEAN := false;
    has_index_scan BOOLEAN := false;
    estimated_cost NUMERIC;
    actual_rows BIGINT;
BEGIN
    -- Execute EXPLAIN and capture the plan
    EXECUTE format('EXPLAIN (FORMAT JSON) %s', query_text) INTO query_plan;

    -- Analyze the query plan for optimization opportunities
    SELECT
        (query_plan->0->'Plan'->>'Node Type')::TEXT = 'Seq Scan',
        (query_plan->0->'Plan'->>'Node Type')::TEXT IN ('Seq Scan', 'Bitmap Heap Scan'),
        (query_plan->0->'Plan'->>'Node Type')::TEXT LIKE '%Index%'
    INTO is_sequential_scan, is_full_table_scan, has_index_scan;

    -- Provide optimization suggestions
    IF is_sequential_scan THEN
        suggestion_type := 'sequential_scan';
        suggestion := 'Consider adding indexes on frequently filtered columns to avoid sequential table scans';
        estimated_improvement_percent := 500;
        RETURN NEXT;
    END IF;

    IF NOT has_index_scan THEN
        suggestion_type := 'missing_index';
        suggestion := 'Query may benefit from additional indexes on join or where clause columns';
        estimated_improvement_percent := 300;
        RETURN NEXT;
    END IF;

    -- Default suggestion for slow queries
    IF execution_time_threshold > 0 THEN
        suggestion_type := 'query_optimization';
        suggestion := 'Review query structure, consider adding composite indexes, or denormalization';
        estimated_improvement_percent := 200;
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. DEFAULT RETENTION POLICIES
-- =====================================================

-- Insert default retention policies for key tables
INSERT INTO retention_policies (table_name, column_name, retention_period_days, is_active) VALUES
    ('audit_trail', 'event_time', 2555, true), -- 7 years for audit trails
    ('performance_metrics', 'collected_at', 90, true), -- 90 days for performance metrics
    ('query_analytics', 'collected_at', 365, true), -- 1 year for query analytics
    ('connection_metrics', 'collected_at', 30, true), -- 30 days for connection metrics
    ('user_sessions', 'created_at', 365, true), -- 1 year for inactive sessions
    ('maintenance_logs', 'started_at', 1095, true) -- 3 years for maintenance logs
ON CONFLICT (table_name, column_name) DO NOTHING;

RAISE NOTICE 'Inserted default retention policies';

-- =====================================================
-- 10. DATABASE OPTIMIZATION SETTINGS
-- =====================================================

-- Set some PostgreSQL optimization settings
-- These would typically be set at the database or session level
DO $$
BEGIN
    -- Enable extended statistics for better query planning
    EXECUTE 'CREATE STATISTICS IF NOT EXISTS users_stats ON user_id, status, role, credits FROM users';

    -- Create partial indexes for common query patterns
    CREATE INDEX CONCURRENTLY IF NOT EXISTS cards_active_public_idx ON cards(created_at, quality)
      WHERE is_public = true AND deleted_at IS NULL;

    CREATE INDEX CONCURRENTLY IF NOT EXISTS users_active_premium_users_idx ON users(last_activity_at, level)
      WHERE status = 'active' AND role = 'premium';

    RAISE NOTICE 'Applied database optimization settings and indexes';
END $$;

-- =====================================================
-- 11. AUTOMATED MAINTENANCE SCHEDULE
-- =====================================================

-- Create a maintenance function that combines vacuum, analyze, and reindex
CREATE OR REPLACE FUNCTION perform_database_maintenance(
    target_table TEXT DEFAULT NULL,
    maintenance_type TEXT DEFAULT 'full'
) RETURNS JSONB AS $$
DECLARE
    start_time TIMESTAMP := NOW();
    table_list TEXT[];
    stat_record RECORD;
    result JSONB := '{}';
BEGIN
    -- Get list of tables to maintain
    IF target_table IS NOT NULL THEN
        table_list := ARRAY[target_table];
    ELSE
        SELECT array_agg(tablename::TEXT)
        INTO table_list
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT LIKE 'pg_%'
          AND tablename NOT LIKE '%_pkey';
    END IF;

    -- Perform maintenance on each table
    FOREACH target_table IN ARRAY table_list LOOP
        BEGIN
            -- Log maintenance start
            INSERT INTO maintenance_logs (operation, target_table, started_at, triggered_by)
            VALUES (maintenance_type || '_maintenance', target_table, start_time, 'scheduled');

            -- Perform VACUUM
            IF maintenance_type IN ('full', 'vacuum') THEN
                EXECUTE format('VACUUM %s', target_table);
            END IF;

            -- Perform ANALYZE to update statistics
            IF maintenance_type IN ('full', 'analyze') THEN
                EXECUTE format('ANALYZE %s', target_table);
            END IF;

            -- Perform REINDEX (concurrently to avoid blocking)
            IF maintenance_type IN ('full', 'reindex') THEN
                EXECUTE format('REINDEX TABLE CONCURRENTLY %s', target_table);
            END IF;

            -- Log successful completion
            UPDATE maintenance_logs
            SET completed_at = NOW(),
                duration_ms = EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000,
                success = true
            WHERE operation = maintenance_type || '_maintenance'
              AND target_table = perform_database_maintenance.target_table
              AND started_at = start_time;

            result := result || jsonb_build_object(
                target_table,
                jsonb_build_object('status', 'completed', 'duration_ms', EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000)
            );

        EXCEPTION WHEN OTHERS THEN
            -- Log failure
            UPDATE maintenance_logs
            SET completed_at = NOW(),
                duration_ms = EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000,
                success = false,
                details = jsonb_build_object('error', SQLERRM)
            WHERE operation = maintenance_type || '_maintenance'
              AND target_table = perform_database_maintenance.target_table
              AND started_at = start_time;

            result := result || jsonb_build_object(
                target_table,
                jsonb_build_object('status', 'failed', 'error', SQLERRM)
            );
        END;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'Created automated maintenance function';

-- =====================================================
-- MIGRATION COMPLETION VERIFICATION
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    trigger_count INTEGER;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'audit_trail', 'user_sessions', 'performance_metrics',
        'query_analytics', 'connection_metrics', 'retention_policies',
        'maintenance_logs'
      );

    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND trigger_name LIKE '%audit%trigger';

    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '  - Tables created: %/7', table_count;
    RAISE NOTICE '  - Audit triggers: %', trigger_count;
    RAISE NOTICE '  - RLS policies: %', policy_count;

    IF table_count >= 7 AND trigger_count >= 3 AND policy_count >= 3 THEN
        RAISE NOTICE '✓ Advanced database migration completed successfully!';
    ELSE
        RAISE NOTICE '⚠ Some components may not have been created properly';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- =====================================================

-- Example queries to test the new features:

-- 1. Test audit trail
-- SELECT * FROM audit_trail WHERE entity_type = 'users' ORDER BY event_time DESC LIMIT 5;

-- 2. Test data retention
-- SELECT * FROM execute_data_retention();

-- 3. Test maintenance function
-- SELECT perform_database_maintenance('users', 'analyze');

-- 4. Test performance monitoring
-- INSERT INTO performance_metrics (metric_name, metric_value, dimensions)
-- VALUES ('api_response_time', 150, '{"endpoint": "/api/cards", "method": "GET"}'::jsonb);

-- 5. Check retention policies
-- SELECT * FROM retention_policies ORDER BY retention_period_days DESC;

-- =====================================================
-- Cleanup Instructions (if needed)
-- =====================================================

-- To rollback this migration:
-- 1. Drop tables: DROP TABLE audit_trail, user_sessions, performance_metrics, query_analytics, connection_metrics, retention_policies, maintenance_logs;
-- 2. Drop functions: DROP FUNCTION audit_trigger_function(), execute_data_retention(), analyze_query_performance(TEXT, INTEGER), perform_database_maintenance(TEXT, TEXT);
-- 3. Drop policies: ALTER TABLE users, cards, collections, audit_trail DISABLE ROW LEVEL SECURITY;
-- 4. Drop triggers: DROP TRIGGER audit_users_trigger ON users; DROP TRIGGER audit_cards_trigger ON cards; DROP TRIGGER audit_collections_trigger ON collections;
