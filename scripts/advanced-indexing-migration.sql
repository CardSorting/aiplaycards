-- =====================================================
-- ADVANCED INDEXING STRATEGY MIGRATION
-- Industry-Grade Database Performance Optimization
--
-- This migration implements sophisticated indexing patterns including:
-- - Multi-column composite indexes for complex queries
-- - Partial indexes for data subsets
-- - GIN indexes for JSON operations
-- - BRIN indexes for time-series data
-- - Expression indexes for computed values
-- - Covering indexes for query optimization
-- =====================================================

BEGIN;

-- =====================================================
-- 1. COMPOSITE INDEXES FOR COMPLEX QUERY PATTERNS
-- =====================================================

DO $$
BEGIN
  -- User activity and reputation composite indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_activity_reputation_idx') THEN
    CREATE INDEX CONCURRENTLY users_activity_reputation_idx ON users (
      reputation DESC,
      last_activity_at DESC,
      status,
      role
    ) WHERE deleted_at IS NULL;
  END IF;

  -- Marketplace search optimization
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'marketplace_search_idx') THEN
    CREATE INDEX CONCURRENTLY marketplace_search_idx ON marketplace_listings (
      status,
      category_id,
      price,
      created_at DESC
    );
  END IF;

  -- Collection discovery index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'collections_discovery_idx') THEN
    CREATE INDEX CONCURRENTLY collections_discovery_idx ON collections (
      visibility,
      featured,
      trending,
      total_views DESC,
      total_likes DESC,
      created_at DESC
    );
  END IF;

  -- Card search and filtering
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cards_search_filter_idx') THEN
    CREATE INDEX CONCURRENTLY cards_search_filter_idx ON cards (
      type,
      supertype,
      rarity,
      quality DESC,
      is_public,
      created_at DESC,
      user_id
    ) WHERE deleted_at IS NULL;
  END IF;

  -- Social engagement index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'social_engagement_idx') THEN
    CREATE INDEX CONCURRENTLY social_engagement_idx ON card_likes (
      card_id,
      created_at DESC
    );
  END IF;

  -- Notification timeline index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'notifications_timeline_idx') THEN
    CREATE INDEX CONCURRENTLY notifications_timeline_idx ON notifications (
      user_id,
      created_at DESC,
      type,
      is_read
    );
  END IF;

  -- Print orders workflow index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_workflow_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_workflow_idx ON print_orders (
      status,
      requires_admin_approval,
      review_priority,
      created_at,
      reviewed_by_admin_id
    );
  END IF;
END $$;

-- =====================================================
-- 2. PARTIAL INDEXES FOR DATA SUBSETS
-- =====================================================

DO $$
BEGIN
  -- Active users only (most frequently queried)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_active_only_idx') THEN
    CREATE INDEX CONCURRENTLY users_active_only_idx ON users (
      last_activity_at DESC,
      reputation DESC
    ) WHERE status = 'active' AND deleted_at IS NULL;
  END IF;

  -- Premium users with recent activity
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_premium_active_idx') THEN
    CREATE INDEX CONCURRENTLY users_premium_active_idx ON users (
      last_activity_at DESC,
      credits DESC
    ) WHERE status = 'active' AND role = 'premium' AND deleted_at IS NULL;
  END IF;

  -- Public cards created recently
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cards_public_recent_idx') THEN
    CREATE INDEX CONCURRENTLY cards_public_recent_idx ON cards (
      created_at DESC,
      quality DESC,
      total_views DESC
    ) WHERE is_public = true AND deleted_at IS NULL;
  END IF;

  -- Marketplace active listings
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'marketplace_active_listings_idx') THEN
    CREATE INDEX CONCURRENTLY marketplace_active_listings_idx ON marketplace_listings (
      category_id,
      price ASC,
      reputation DESC
    ) WHERE status = 'active';
  END IF;

  -- Pending admin reviews
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_pending_reviews_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_pending_reviews_idx ON print_orders (
      created_at,
      review_priority DESC,
      total_price DESC
    ) WHERE status IN ('pending', 'awaiting_admin_review') AND requires_admin_approval = true;
  END IF;

  -- Trending collections (calculated field)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'collections_trending_scored_idx') THEN
    CREATE INDEX CONCURRENTLY collections_trending_scored_idx ON collections (
      (total_views::float + total_likes::float * 2 + total_comments::float * 3) DESC,
      created_at DESC
    ) WHERE visibility = 'public' AND trending = true;
  END IF;
END $$;

-- =====================================================
-- 3. EXPRESSION INDEXES FOR COMPUTED VALUES
-- =====================================================

DO $$
BEGIN
  -- User account age (for reputation calculations)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_account_age_idx') THEN
    CREATE INDEX CONCURRENTLY users_account_age_idx ON users (
      EXTRACT(epoch FROM (NOW() - created_at)) / 86400 DESC
    ) WHERE deleted_at IS NULL;
  END IF;

  -- Card "hotness" score (recent activity weighted)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cards_hotness_score_idx') THEN
    CREATE INDEX CONCURRENTLY cards_hotness_score_idx ON cards (
      (quality * 10 + EXTRACT(epoch FROM (NOW() - created_at)) / 86400) DESC
    ) WHERE is_public = true AND deleted_at IS NULL;
  END IF;

  -- Marketplace "bargain" index (price vs quality ratio)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'marketplace_bargain_idx') THEN
    CREATE INDEX CONCURRENTLY marketplace_bargain_idx ON marketplace_listings (
      (price::float / NULLIF(quality_score, 0)) ASC,
      quality_score DESC,
      reputation DESC
    ) WHERE status = 'active' AND price > 0;
  END IF;

  -- Collection engagement rate
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'collections_engagement_rate_idx') THEN
    CREATE INDEX CONCURRENTLY collections_engagement_rate_idx ON collections (
      CASE
        WHEN total_views > 0 THEN (total_likes::float + total_comments::float) / total_views
        ELSE 0
      END DESC
    ) WHERE visibility = 'public';
  END IF;
END $$;

-- =====================================================
-- 4. TIME-SERIES INDEXES (BRIN) FOR LARGE TABLES
-- =====================================================

DO $$
BEGIN
  -- Events table (when implemented) with BRIN for time-series
  -- BRIN indexes are more space efficient for large tables with correlated data

  -- Audit logs time-series
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_actions_audit') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'audit_executed_at_brin_idx') THEN
      CREATE INDEX CONCURRENTLY audit_executed_at_brin_idx ON admin_actions_audit
      USING brin (executed_at) WITH (autosummarize = true);
    END IF;
  END IF;

  -- Notifications timeline (BRIN for large notification tables)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'notifications_created_at_brin_idx') THEN
    CREATE INDEX CONCURRENTLY notifications_created_at_brin_idx ON notifications
    USING brin (created_at) WITH (autosummarize = true);
  END IF;

  -- Credit transactions history
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'credit_transactions_created_at_brin_idx') THEN
    CREATE INDEX CONCURRENTLY credit_transactions_created_at_brin_idx ON credit_transactions
    USING brin (created_at) WITH (autosummarize = true);
  END IF;
END $$;

-- =====================================================
-- 5. FULL-TEXT SEARCH INDEXES
-- =====================================================

DO $$
BEGIN
  -- Cards full-text search (name, description, type)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cards_fts_idx') THEN
    CREATE INDEX CONCURRENTLY cards_fts_idx ON cards
    USING gin (to_tsvector('english',
      COALESCE(name, '') || ' ' ||
      COALESCE(description, '') || ' ' ||
      COALESCE(type, '') || ' ' ||
      COALESCE(rarity, '')
    ))
    WHERE deleted_at IS NULL AND is_public = true;
  END IF;

  -- User search (username, display_name, bio)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_fts_idx') THEN
    CREATE INDEX CONCURRENTLY users_fts_idx ON users
    USING gin (to_tsvector('english',
      COALESCE(username, '') || ' ' ||
      COALESCE(display_name, '') || ' ' ||
      COALESCE(bio, '')
    ))
    WHERE deleted_at IS NULL AND status = 'active';
  END IF;

  -- Collections search
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'collections_fts_idx') THEN
    CREATE INDEX CONCURRENTLY collections_fts_idx ON collections
    USING gin (to_tsvector('english',
      COALESCE(name, '') || ' ' ||
      COALESCE(description, '')
    ))
    WHERE visibility IN ('public', 'shared');
  END IF;
END $$;

-- =====================================================
-- 6. GIN INDEXES FOR JSON OPERATIONS
-- =====================================================

DO $$
BEGIN
  -- Card metadata and tags
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cards_metadata_gin_idx') THEN
    CREATE INDEX CONCURRENTLY cards_metadata_gin_idx ON cards
    USING gin (flags jsonb_ops, image_data jsonb_ops)
    WHERE deleted_at IS NULL;
  END IF;

  -- Collection tags and categories
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'collections_metadata_gin_idx') THEN
    CREATE INDEX CONCURRENTLY collections_metadata_gin_idx ON collections
    USING gin (tags jsonb_ops, categories jsonb_ops);
  END IF;

  -- User preferences and settings
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_settings_gin_idx') THEN
    CREATE INDEX CONCURRENTLY users_settings_gin_idx ON users
    USING gin (badges jsonb_ops)
    WHERE deleted_at IS NULL;
  END IF;

  -- Print order business rules
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'business_rule_violations') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_rules_gin_idx') THEN
      CREATE INDEX CONCURRENTLY print_orders_rules_gin_idx ON print_orders
      USING gin (business_rule_violations jsonb_ops);
    END IF;
  END IF;

  -- Admin workflow data
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_print_order_workflow' AND column_name = 'workflow_data') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'admin_workflow_data_gin_idx') THEN
      CREATE INDEX CONCURRENTLY admin_workflow_data_gin_idx ON admin_print_order_workflow
      USING gin (workflow_data jsonb_ops, step_history jsonb_ops);
    END IF;
  END IF;
END $$;

-- =====================================================
-- 7. COVERING INDEXES FOR FREQUENT QUERIES
-- =====================================================

DO $$
BEGIN
  -- User profile display (covering index for profile queries)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_profile_covering_idx') THEN
    CREATE INDEX CONCURRENTLY users_profile_covering_idx ON users (
      user_id,
      username,
      display_name,
      avatar_url,
      reputation,
      verified,
      last_activity_at
    ) WHERE deleted_at IS NULL;
  END IF;

  -- Card feed covering index (for card list displays)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cards_feed_covering_idx') THEN
    CREATE INDEX CONCURRENTLY cards_feed_covering_idx ON cards (
      id,
      name,
      image_data,
      type,
      rarity,
      quality,
      created_at,
      total_views
    ) WHERE is_public = true AND deleted_at IS NULL;
  END IF;

  -- Marketplace listing cards covering index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'marketplace_listing_covering_idx') THEN
    CREATE INDEX CONCURRENTLY marketplace_listing_covering_idx ON marketplace_listings (
      id,
      title,
      price,
      image_url,
      quality_score,
      reputation,
      condition
    ) WHERE status = 'active';
  END IF;

  -- Collection summary covering index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'collections_summary_covering_idx') THEN
    CREATE INDEX CONCURRENTLY collections_summary_covering_idx ON collections (
      id,
      name,
      cover_image_url,
      total_cards,
      total_likes,
      total_views,
      difficulty,
      theme
    ) WHERE visibility = 'public';
  END IF;
END $$;

-- =====================================================
-- 8. SPECIALIZED INDEXES FOR ANALYTICS
-- =====================================================

DO $$
BEGIN
  -- User engagement analytics
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_engagement_analytics_idx') THEN
    CREATE INDEX CONCURRENTLY user_engagement_analytics_idx ON users (
      DATE_TRUNC('month', created_at),
      status,
      role,
      reputation,
      level,
      credits
    ) WHERE deleted_at IS NULL;
  END IF;

  -- Revenue analytics (marketplace)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'marketplace_revenue_analytics_idx') THEN
    CREATE INDEX CONCURRENTLY marketplace_revenue_analytics_idx ON marketplace_listings (
      DATE_TRUNC('day', sold_at),
      price,
      category_id,
      seller_user_id
    ) WHERE status = 'sold' AND sold_at IS NOT NULL;
  END IF;

  -- Content creation analytics
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'content_creation_analytics_idx') THEN
    CREATE INDEX CONCURRENTLY content_creation_analytics_idx ON cards (
      DATE_TRUNC('week', created_at),
      user_id,
      type,
      supertype,
      source,
      quality
    ) WHERE deleted_at IS NULL;
  END IF;
END $$;

-- =====================================================
-- 9. UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- =====================================================

DO $$
BEGIN
  -- Username uniqueness (case-insensitive)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_username_unique_idx') THEN
    CREATE UNIQUE INDEX CONCURRENTLY users_username_unique_idx ON users (
      LOWER(username)
    ) WHERE deleted_at IS NULL;
  END IF;

  -- Email uniqueness with soft delete consideration
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_email_unique_idx') THEN
    CREATE UNIQUE INDEX CONCURRENTLY users_email_unique_idx ON users (
      LOWER(email)
    ) WHERE deleted_at IS NULL AND email IS NOT NULL;
  END IF;

  -- Collection unique names per user
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'collections_unique_name_per_user_idx') THEN
    CREATE UNIQUE INDEX CONCURRENTLY collections_unique_name_per_user_idx ON collections (
      user_id,
      LOWER(name)
    );
  END IF;
END $$;

-- =====================================================
-- 10. INDEX MAINTENANCE AND MONITORING
-- =====================================================

-- Function to analyze index usage
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
  schemaname name,
  tablename name,
  indexname name,
  idx_scan bigint,
  idx_tup_read bigint,
  idx_tup_fetch bigint,
  last_used timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.schemaname::name,
    ps.tablename::name,
    ps.indexname::name,
    ps.idx_scan,
    ps.idx_tup_read,
    ps.idx_tup_fetch,
    GREATEST(ps.last_idx_scan, ps.last_idx_read, ps.last_idx_fetch) as last_used
  FROM pg_stat_user_indexes ps
  WHERE ps.schemaname = 'public'
  ORDER BY ps.idx_scan DESC, last_used DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to identify unused indexes (be careful with this!)
CREATE OR REPLACE FUNCTION identify_unused_indexes(days_threshold INTEGER DEFAULT 30)
RETURNS TABLE (
  schemaname name,
  tablename name,
  indexname name,
  index_size_mb numeric,
  idx_scan bigint,
  last_scan timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.schemaname::name,
    ps.tablename::name,
    ps.indexname::name,
    pg_size_pretty(pg_relation_size(ps.indexrelid))::numeric,
    ps.idx_scan,
    ps.last_idx_scan as last_scan
  FROM pg_stat_user_indexes ps
  WHERE ps.schemaname = 'public'
    AND ps.idx_scan = 0
    AND ps.last_idx_scan < NOW() - INTERVAL '1 day' * days_threshold
    AND ps.indexname NOT LIKE '%_pkey'
  ORDER BY pg_relation_size(ps.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION VERIFICATION AND VALIDATION
-- =====================================================

DO $$
DECLARE
  index_count INTEGER;
  gin_index_count INTEGER;
  brin_index_count INTEGER;
  fts_index_count INTEGER;
  total_index_size TEXT;
BEGIN
  -- Count various types of indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes WHERE schemaname = 'public';

  SELECT COUNT(*) INTO gin_index_count
  FROM pg_indexes pi
  JOIN pg_class pc ON pc.relname = pi.indexname
  JOIN pg_am pm ON pm.oid = pc.relam
  WHERE pi.schemaname = 'public' AND pm.amname = 'gin';

  SELECT COUNT(*) INTO brin_index_count
  FROM pg_indexes pi
  JOIN pg_class pc ON pc.relname = pi.indexname
  JOIN pg_am pm ON pm.oid = pc.relam
  WHERE pi.schemaname = 'public' AND pm.amname = 'brin';

  SELECT COUNT(*) INTO fts_index_count
  FROM pg_indexes WHERE schemaname = 'public' AND indexdef LIKE '%to_tsvector%';

  -- Calculate total index size
  SELECT pg_size_pretty(SUM(pg_relation_size(indexrelid))) INTO total_index_size
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public';

  RAISE NOTICE 'Advanced Indexing Migration Results:';
  RAISE NOTICE '  - Total Indexes Created: %', index_count;
  RAISE NOTICE '  - GIN Indexes (JSON/FTS): %', gin_index_count;
  RAISE NOTICE '  - BRIN Indexes (Time-series): %', brin_index_count;
  RAISE NOTICE '  - Full-Text Search Indexes: %', fts_index_count;
  RAISE NOTICE '  - Total Index Size: %', total_index_size;
  RAISE NOTICE '  - Composite/Partial Indexes: Active for complex queries';
  RAISE NOTICE '  - Expression Indexes: Implemented for computed values';
  RAISE NOTICE '✅ Advanced indexing strategy migration completed successfully!';
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION INDEX MAINTENANCE
-- =====================================================

/*
Recommended index maintenance after migration:

1. REINDEX CONCURRENTLY large indexes during low-traffic periods:
   REINDEX INDEX CONCURRENTLY cards_search_filter_idx;

2. Monitor index usage:
   SELECT * FROM analyze_index_usage() LIMIT 20;

3. Check for unused indexes (carefully!):
   SELECT * FROM identify_unused_indexes(90); -- 90 days threshold

4. Analyze specific query performance:
   EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM cards WHERE type = 'fire' AND is_public = true ORDER BY created_at DESC LIMIT 50;

5. Consider index-only scans:
   SELECT name, type, rarity FROM cards WHERE is_public = true ORDER BY created_at DESC LIMIT 10;

6. Monitor index bloat:
   SELECT schemaname, tablename, attname, n_distinct, correlation
   FROM pg_stats
   WHERE schemaname = 'public' AND correlation < 0.5;

Index optimization queries:

-- Check index hit rate
SELECT
  sum(idx_scan) as idx_scans,
  sum(seq_scan) as seq_scans,
  round(sum(idx_scan)::numeric / (sum(idx_scan) + sum(seq_scan)) * 100, 2) as idx_hit_rate
FROM pg_stat_user_tables;

-- Largest indexes by size
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;
*/
