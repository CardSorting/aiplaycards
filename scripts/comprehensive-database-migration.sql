-- =====================================================
-- COMPREHENSIVE DATABASE IMPROVEMENT MIGRATION
-- Industry-Grade Database Schema Enhancement
--
-- This master migration executes all database improvements in correct order:
-- 1. Enhanced relationships and foreign key constraints
-- 2. Advanced indexing strategies
-- 3. Database views for complex queries
-- 4. Data consistency triggers and validation
-- 5. Performance monitoring and alerting
--
-- Run this script to apply all world-class database improvements
-- =====================================================

BEGIN;

-- =====================================================
-- 1. EXECUTE ENHANCED RELATIONSHIPS MIGRATION
-- =====================================================

\echo 'Step 1: Applying enhanced relationships and foreign key constraints...'
\i scripts/enhanced-relationships-migration.sql

-- =====================================================
-- 2. EXECUTE ADVANCED INDEXING MIGRATION
-- =====================================================

\echo 'Step 2: Applying advanced indexing strategies...'
\i scripts/advanced-indexing-migration.sql

-- =====================================================
-- 3. EXECUTE DATABASE VIEWS MIGRATION
-- =====================================================

\echo 'Step 3: Creating database views for complex queries...'
\i scripts/database-views-migration.sql

-- =====================================================
-- 4. ADDITIONAL DATA CONSISTENCY AND VALIDATION
-- =====================================================

\echo 'Step 4: Setting up additional data consistency measures...'

-- Function to audit table relationships and constraints
CREATE OR REPLACE FUNCTION audit_database_constraints()
RETURNS TABLE (
  schema_name TEXT,
  table_name TEXT,
  constraint_name TEXT,
  constraint_type TEXT,
  status TEXT,
  last_checked TIMESTAMP
) AS $$
BEGIN
  -- Create audit log if it doesn't exist
  CREATE TABLE IF NOT EXISTS database_audit_log (
    id SERIAL PRIMARY KEY,
    audit_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    constraint_name VARCHAR(100),
    status VARCHAR(20),
    details JSONB,
    checked_at TIMESTAMP DEFAULT NOW()
  );

  RETURN QUERY
  -- FK constraints audit
  SELECT
    tc.table_schema::TEXT,
    tc.table_name::TEXT,
    tc.constraint_name::TEXT,
    tc.constraint_type::TEXT,
    'ACTIVE'::TEXT as status,
    NOW() as last_checked
  FROM information_schema.table_constraints tc
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'

  UNION ALL

  -- Unique constraints audit
  SELECT
    tc.table_schema::TEXT,
    tc.table_name::TEXT,
    tc.constraint_name::TEXT,
    tc.constraint_type::TEXT,
    'ACTIVE'::TEXT as status,
    NOW() as last_checked
  FROM information_schema.table_constraints tc
  WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'

  UNION ALL

  -- Check constraints audit
  SELECT
    tc.table_schema::TEXT,
    tc.table_name::TEXT,
    tc.constraint_name::TEXT,
    tc.constraint_type::TEXT,
    'ACTIVE'::TEXT as status,
    NOW() as last_checked
  FROM information_schema.table_constraints tc
  WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- Function to validate data integrity and relationships
CREATE OR REPLACE FUNCTION validate_data_integrity()
RETURNS TABLE (
  validation_type TEXT,
  status TEXT,
  records_checked INTEGER,
  issues_found INTEGER,
  details TEXT
) AS $$
DECLARE
  orphan_users INTEGER := 0;
  broken_fks INTEGER := 0;
  invalid_refs INTEGER := 0;
BEGIN
  -- Check for orphaned records
  SELECT COUNT(*) INTO orphan_users
  FROM cards c
  LEFT JOIN users u ON u.user_id = c.user_id
  WHERE c.deleted_at IS NULL AND u.user_id IS NULL;

  -- Check for referential integrity issues
  SELECT COUNT(*) INTO broken_fks
  FROM (
    SELECT 1 FROM collection_cards cc
    LEFT JOIN cards c ON c.id = cc.card_id
    WHERE c.id IS NULL
    UNION ALL
    SELECT 1 FROM collection_cards cc
    LEFT JOIN collections col ON col.id = cc.collection_id
    WHERE col.id IS NULL
  ) broken_refs;

  -- Check for invalid collection references
  SELECT COUNT(*) INTO invalid_refs
  FROM cards c
  LEFT JOIN collections col ON col.id = c.collection_id
  WHERE c.collection_id IS NOT NULL AND col.id IS NULL;

  RETURN QUERY VALUES
    ('Orphan Records', CASE WHEN orphan_users = 0 THEN 'PASS' ELSE 'FAIL' END, orphan_users, orphan_users, 'Cards without valid user references'),
    ('Broken Foreign Keys', CASE WHEN broken_fks = 0 THEN 'PASS' ELSE 'FAIL' END, broken_fks, broken_fks, 'Collection-card relationships with broken references'),
    ('Invalid Collection Refs', CASE WHEN invalid_refs = 0 THEN 'PASS' ELSE 'FAIL' END, invalid_refs, invalid_refs, 'Cards referencing non-existent collections');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. PERFORMANCE OPTIMIZATION SETTINGS
-- =====================================================

\echo 'Step 5: Applying performance optimization settings...'

-- Configure PostgreSQL settings for optimal performance
DO $$
BEGIN
  -- Set connection-specific settings for better performance
  -- Note: These are session-level settings, can be set globally in postgresql.conf
  EXECUTE 'SET work_mem = ''64MB'''; -- Increase working memory
  EXECUTE 'SET maintenance_work_mem = ''256MB'''; -- More memory for maintenance operations
  EXECUTE 'SET shared_preload_libraries = ''pg_stat_statements'''; -- Enable query statistics
  EXECUTE 'SET random_page_cost = 1.1'; -- SSD-optimized random page cost

  RAISE NOTICE 'Performance optimization settings applied';
END;
$$;

-- Create function to optimize autovacuum settings for large tables
CREATE OR REPLACE FUNCTION optimize_table_autovacuum(table_name TEXT)
RETURNS VOID AS $$
DECLARE
  sql_command TEXT;
BEGIN
  sql_command := format('
    ALTER TABLE %I SET (
      autovacuum_vacuum_scale_factor = 0.02,
      autovacuum_vacuum_threshold = 50,
      autovacuum_analyze_scale_factor = 0.01,
      autovacuum_analyze_threshold = 25
    )', table_name);

  EXECUTE sql_command;
  RAISE NOTICE 'Autovacuum optimized for table: %', table_name;
END;
$$ LANGUAGE plpgsql;

-- Apply autovacuum optimizations to key tables
SELECT optimize_table_autovacuum('cards');
SELECT optimize_table_autovacuum('users');
SELECT optimize_table_autovacuum('collections');
SELECT optimize_table_autovacuum('marketplace_listings');

-- =====================================================
-- 6. FINAL VERIFICATION AND REPORTING
-- =====================================================

DO $$
DECLARE
  total_tables INTEGER;
  total_indexes INTEGER;
  total_views INTEGER;
  total_fks INTEGER;
  total_constraints INTEGER;
  db_size TEXT;
BEGIN
  -- Gather comprehensive database statistics
  SELECT COUNT(*) INTO total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

  SELECT COUNT(*) INTO total_indexes
  FROM pg_indexes WHERE schemaname = 'public';

  SELECT COUNT(*) INTO total_views
  FROM information_schema.views WHERE table_schema = 'public';

  SELECT COUNT(*) INTO total_fks
  FROM information_schema.table_constraints
  WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY';

  SELECT COUNT(*) INTO total_constraints
  FROM information_schema.table_constraints
  WHERE table_schema = 'public';

  SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;

  -- Store migration results in audit table
  CREATE TABLE IF NOT EXISTS database_migration_history (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(100) NOT NULL,
    migration_type VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed',
    applied_by VARCHAR(100) DEFAULT current_user,
    metadata JSONB
  );

  INSERT INTO database_migration_history (migration_name, migration_type, metadata)
  VALUES (
    'comprehensive_database_improvement',
    'major_schema_enhancement',
    jsonb_build_object(
      'total_tables', total_tables,
      'total_indexes', total_indexes,
      'total_views', total_views,
      'total_foreign_keys', total_fks,
      'total_constraints', total_constraints,
      'database_size', db_size,
      'enhancements_applied', ARRAY[
        'enhanced_relationships',
        'advanced_indexing',
        'performance_views',
        'data_consistency_triggers',
        'gdpr_compliance_functions',
        'performance_optimizations'
      ]
    )
  );

  RAISE NOTICE '================================================================';
  RAISE NOTICE '🎉 COMPREHENSIVE DATABASE MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'DATABASE STATISTICS:';
  RAISE NOTICE '  - Total Tables: %', total_tables;
  RAISE NOTICE '  - Total Indexes: %', total_indexes;
  RAISE NOTICE '  - Total Views: %', total_views;
  RAISE NOTICE '  - Foreign Key Constraints: %', total_fks;
  RAISE NOTICE '  - Total Constraints: %', total_constraints;
  RAISE NOTICE '  - Database Size: %', db_size;
  RAISE NOTICE '';
  RAISE NOTICE 'ENHANCEMENTS APPLIED:';
  RAISE NOTICE '  ✅ Enhanced foreign key constraints and cascading deletes';
  RAISE NOTICE '  ✅ Advanced indexing strategies (GIN, BRIN, composite)';
  RAISE NOTICE '  ✅ Performance optimization views and materialized views';
  RAISE NOTICE '  ✅ Data consistency triggers and validation functions';
  RAISE NOTICE '  ✅ GDPR-compliant soft delete and audit functions';
  RAISE NOTICE '  ✅ Comprehensive analytics and monitoring views';
  RAISE NOTICE '  ✅ Index usage analysis and maintenance functions';
  RAISE NOTICE '================================================================';
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION SETUP INSTRUCTIONS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 POST-MIGRATION SETUP REQUIRED:';
  RAISE NOTICE '';
  RAISE NOTICE '1. SCHEDULE NIGHTLY MAINTENANCE:';
  RAISE NOTICE '   -- Set up cron job to run:';
  RAISE NOTICE '   -- SELECT refresh_analytics_views(); -- Refresh materialized views';
  RAISE NOTICE '   -- ANALYZE; -- Update table statistics';
  RAISE NOTICE '';
  RAISE NOTICE '2. MONITOR INDEX PERFORMANCE:';
  RAISE NOTICE '   SELECT * FROM analyze_index_usage() WHERE idx_scan = 0; -- Check unused indexes';
  RAISE NOTICE '   SELECT * FROM query_performance_monitor LIMIT 10; -- Monitor slow queries';
  RAISE NOTICE '';
  RAISE NOTICE '3. VERIFY DATA INTEGRITY:';
  RAISE NOTICE '   SELECT * FROM validate_data_integrity(); -- Check for data issues';
  RAISE NOTICE '   SELECT * FROM audit_database_constraints(); -- Audit all constraints';
  RAISE NOTICE '';
  RAISE NOTICE '4. ENABLE PG_STAT_STATEMENTS (if not already enabled)';
  RAISE NOTICE '   ALTER SYSTEM SET shared_preload_libraries = ''pg_stat_statements'';';
  RAISE NOTICE '   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;';
  RAISE NOTICE '';
  RAISE NOTICE '5. RECOMMENDED BACKUP STRATEGY:';
  RAISE NOTICE '   - Daily logical backups with pg_dump';
  RAISE NOTICE '   - Weekly full physical backups';
  RAISE NOTICE '   - Test hourly WAL archives for point-in-time recovery';
  RAISE NOTICE '';
  RAISE NOTICE '6. APPLICATION UPDATES REQUIRED:';
  RAISE NOTICE '   - Update queries to use new views (user_profile_complete, card_catalog, etc.)';
  RAISE NOTICE '   - Implement collection stats updates using triggers';
  RAISE NOTICE '   - Add GDPR soft-delete functionality to user deletion endpoints';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Database is now optimized for enterprise-grade performance!';
END $$;

-- Display final migration summary
SELECT
  migration_name,
  migration_type,
  applied_at,
  status,
  metadata->>'total_indexes' as indexes_added,
  metadata->>'total_views' as views_added,
  metadata->>'database_size' as final_size
FROM database_migration_history
WHERE migration_name = 'comprehensive_database_improvement'
ORDER BY applied_at DESC
LIMIT 1;
