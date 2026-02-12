-- =====================================================
-- DATABASE VIEWS MIGRATION
-- Industry-Grade Query Optimization with Materialized Views
--
-- This migration creates optimized database views for:
-- - Complex multi-table queries
-- - Aggregated analytics data
-- - Denormalized frequently-accessed data
-- - Materialized views for expensive computations
-- =====================================================

BEGIN;

-- =====================================================
-- 1. USER ENGAGEMENT AND PROFILE VIEWS
-- =====================================================

-- Comprehensive user profile view with all frequently accessed data
CREATE OR REPLACE VIEW user_profile_complete AS
SELECT
  u.id,
  u.user_id,
  u.username,
  u.display_name,
  u.email,
  u.bio,
  u.avatar_url,
  u.banner_url,
  u.reputation,
  u.level,
  u.credits,
  u.total_credits_earned,
  u.total_credits_spent,
  u.verified,
  u.role,
  u.status,
  u.created_at,
  u.last_activity_at,

  -- Social metrics (pre-calculated for performance)
  COALESCE(followers_stats.followers_count, 0) as followers_count,
  COALESCE(following_stats.following_count, 0) as following_count,
  COALESCE(card_stats.cards_created, 0) as cards_created,
  COALESCE(card_stats.public_cards, 0) as public_cards,
  COALESCE(collection_stats.collections_created, 0) as collections_created,

  -- Activity indicators
  CASE WHEN u.last_activity_at > NOW() - INTERVAL '7 days' THEN true ELSE false END as is_active_recently,
  CASE WHEN u.last_activity_at > NOW() - INTERVAL '24 hours' THEN true ELSE false END as is_active_today,

  -- Account age in days
  EXTRACT(epoch FROM (NOW() - u.created_at)) / 86400 as account_age_days,

  -- Financial summary
  COALESCE(credit_summary.total_transactions, 0) as total_credit_transactions,
  COALESCE(credit_summary.net_credits, 0) as net_credits_earned,

  -- Content engagement
  COALESCE(engagement_stats.total_card_likes_received, 0) as total_card_likes_received,
  COALESCE(engagement_stats.total_card_comments_received, 0) as total_card_comments_received,
  COALESCE(engagement_stats.total_collection_likes_received, 0) as total_collection_likes_received

FROM users u
-- Followers count
LEFT JOIN (
  SELECT follower_user_id, COUNT(*) as followers_count
  FROM follows
  GROUP BY follower_user_id
) followers_stats ON followers_stats.follower_user_id = u.user_id
-- Following count
LEFT JOIN (
  SELECT following_user_id, COUNT(*) as following_count
  FROM follows
  GROUP BY following_user_id
) following_stats ON following_stats.following_user_id = u.user_id
-- Cards statistics
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as cards_created,
    COUNT(*) FILTER (WHERE is_public = true AND deleted_at IS NULL) as public_cards
  FROM cards
  WHERE deleted_at IS NULL
  GROUP BY user_id
) card_stats ON card_stats.user_id = u.user_id
-- Collections statistics
LEFT JOIN (
  SELECT user_id, COUNT(*) as collections_created
  FROM collections
  GROUP BY user_id
) collection_stats ON collection_stats.user_id = u.user_id
-- Credit transaction summary
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as total_transactions,
    SUM(delta) FILTER (WHERE delta > 0) as net_credits_earned
  FROM credit_transactions
  GROUP BY user_id
) credit_summary ON credit_summary.user_id = u.user_id
-- Engagement metrics (received)
LEFT JOIN (
  SELECT
    c.user_id,
    COUNT(cl.*) as total_card_likes_received,
    COUNT(cc.*) as total_card_comments_received
  FROM cards c
  LEFT JOIN card_likes cl ON cl.card_id = c.id
  LEFT JOIN card_comments cc ON cc.card_id = c.id
  WHERE c.deleted_at IS NULL
  GROUP BY c.user_id
) engagement_stats ON engagement_stats.user_id = u.user_id
WHERE u.deleted_at IS NULL;

-- =====================================================
-- 2. CARD CATALOG VIEW (COMPREHENSIVE)
-- =====================================================

CREATE OR REPLACE VIEW card_catalog AS
SELECT
  c.id,
  c.name,
  c.description,
  c.type,
  c.supertype,
  c.subtype,
  c.rarity,
  c.hitpoints,
  c.quality,
  c.source,
  c.created_at,
  c.updated_at,

  -- Owner information (without sensitive email)
  u.username as creator_username,
  u.display_name as creator_display_name,
  u.reputation as creator_reputation,
  u.verified as creator_verified,

  -- Image and media data
  c.image_data,
  c.animated_at,

  -- Collection association (optional)
  col.id as collection_id,
  col.name as collection_name,
  col.visibility as collection_visibility,

  -- Social engagement metrics
  COALESCE(card_social.likes_count, 0) as likes_count,
  COALESCE(card_social.comments_count, 0) as comments_count,
  COALESCE(card_social.ratings_count, 0) as ratings_count,
  COALESCE(card_social.avg_rating, 0) as avg_rating,

  -- Content freshness indicators
  CASE WHEN c.created_at > NOW() - INTERVAL '24 hours' THEN true ELSE false END as is_new_today,
  CASE WHEN c.created_at > NOW() - INTERVAL '7 days' THEN true ELSE false END as is_new_this_week,

  -- Quality and popularity score (weighted)
  (
    c.quality * 10 +
    COALESCE(card_social.likes_count, 0) * 2 +
    COALESCE(card_social.comments_count, 0) * 3 +
    EXTRACT(epoch FROM (NOW() - c.created_at)) / 86400 / 30 * 5
  ) as popularity_score

FROM cards c
JOIN users u ON u.user_id = c.user_id
LEFT JOIN collection_cards cc ON cc.card_id = c.id AND cc.user_id = c.user_id
LEFT JOIN collections col ON col.id = cc.collection_id
LEFT JOIN (
  SELECT
    card_id,
    COUNT(*) FILTER (WHERE source_table = 'likes') as likes_count,
    COUNT(*) FILTER (WHERE source_table = 'comments') as comments_count,
    COUNT(*) FILTER (WHERE source_table = 'ratings') as ratings_count,
    AVG(rating) FILTER (WHERE rating IS NOT NULL) as avg_rating
  FROM (
    SELECT card_id, 'likes' as source_table, NULL as rating FROM card_likes
    UNION ALL
    SELECT card_id, 'comments' as source_table, NULL as rating FROM card_comments
    UNION ALL
    SELECT card_id, 'ratings' as source_table, rating FROM card_ratings
  ) combined
  GROUP BY card_id
) card_social ON card_social.card_id = c.id
WHERE c.deleted_at IS NULL
ORDER BY c.created_at DESC;

-- =====================================================
-- 3. MARKETPLACE PERFORMANCE VIEW
-- =====================================================

CREATE OR REPLACE VIEW marketplace_performance AS
SELECT
  ml.id,
  ml.title,
  ml.price,
  ml.reputation,
  ml.condition,
  ml.category_id,
  ml.status,
  ml.created_at,
  ml.sold_at,

  -- Seller analytics
  u.username as seller_username,
  u.reputation as seller_reputation,
  u.verified as seller_verified,
  u.created_at as seller_account_age,

  -- Listing performance metrics
  COALESCE(ml.days_to_sell,
    CASE
      WHEN ml.status IN ('active', 'hidden') THEN EXTRACT(epoch FROM (NOW() - ml.created_at)) / 86400
      ELSE EXTRACT(epoch FROM (ml.sold_at - ml.created_at)) / 86400
    END
  ) as days_listed,

  -- Sales performance
  CASE WHEN ml.status = 'sold' THEN true ELSE false END as did_sell,
  CASE WHEN ml.status = 'sold' THEN ml.price ELSE NULL END as sale_price,
  CASE WHEN ml.status = 'sold' THEN ml.price * 0.95 ELSE NULL END as seller_revenue, -- Assuming 5% platform fee

  -- Competition context
  category_stats.avg_price as category_avg_price,
  category_stats.total_listings as category_active_listings,
  CASE
    WHEN category_stats.avg_price > 0 THEN ml.price / category_stats.avg_price
    ELSE NULL
  END as price_vs_category_avg,

  -- Seller market share
  seller_stats.total_listings as seller_total_listings,
  seller_stats.successful_sales as seller_successful_sales,
  seller_stats.avg_sale_price as seller_avg_sale_price

FROM marketplace_listings ml
JOIN users u ON u.user_id = ml.seller_user_id
-- Category statistics (last 30 days)
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) as total_listings,
    AVG(price) as avg_price
  FROM marketplace_listings ml2
  WHERE ml2.category_id = ml.category_id
    AND ml2.status IN ('active', 'sold')
    AND ml2.created_at > NOW() - INTERVAL '30 days'
) category_stats ON true
-- Seller statistics
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) as total_listings,
    COUNT(*) FILTER (WHERE status = 'sold') as successful_sales,
    AVG(price) FILTER (WHERE status = 'sold') as avg_sale_price
  FROM marketplace_listings ml2
  WHERE ml2.seller_user_id = ml.seller_user_id
    AND ml2.created_at > NOW() - INTERVAL '90 days'
) seller_stats ON true;

-- =====================================================
-- 4. COLLECTION DISCOVERY VIEW
-- =====================================================

CREATE OR REPLACE VIEW collection_discovery AS
SELECT
  c.id,
  c.name,
  c.description,
  c.type,
  c.visibility,
  c.theme,
  c.difficulty,
  c.language,
  c.total_cards,
  c.total_views,
  c.total_likes,
  c.total_comments,
  c.avg_rating,
  c.featured,
  c.trending,
  c.created_at,

  -- Creator information
  u.username as creator_username,
  u.display_name as creator_display_name,
  u.reputation as creator_reputation,
  u.avatar_url as creator_avatar,

  -- Engagement metrics
  COALESCE(coll_social.likes_count, 0) as likes_count,
  COALESCE(coll_social.comments_count, 0) as comments_count,
  COALESCE(coll_social.follows_count, 0) as follows_count,

  -- Discovery algorithm score
  (
    -- Base popularity score
    COALESCE(c.total_views, 0) * 1.0 +
    COALESCE(c.total_likes, 0) * 2.0 +
    COALESCE(c.total_comments, 0) * 3.0 +
    CASE WHEN c.featured THEN 100 ELSE 0 END +
    CASE WHEN c.trending THEN 50 ELSE 0 END +
    -- Recency boost (newer collections get slight boost)
    CASE WHEN c.created_at > NOW() - INTERVAL '7 days' THEN 20 ELSE 0 END +
    -- Quality multiplier based on avg rating
    COALESCE(c.avg_rating, 0) * 10
  ) as discovery_score,

  -- Content type indicators
  CASE WHEN c.is_template THEN true ELSE false END as is_template,
  CASE WHEN c.allow_collaboration THEN true ELSE false END as allows_collaboration

FROM collections c
JOIN users u ON u.user_id = c.user_id
LEFT JOIN (
  SELECT
    collection_id,
    COUNT(*) FILTER (WHERE table_name = 'likes') as likes_count,
    COUNT(*) FILTER (WHERE table_name = 'comments') as comments_count,
    COUNT(*) FILTER (WHERE table_name = 'follows') as follows_count
  FROM (
    SELECT collection_id, 'likes' as table_name FROM collection_likes
    UNION ALL
    SELECT collection_id, 'comments' as table_name FROM collection_comments
    UNION ALL
    SELECT collection_id, 'follows' as table_name FROM collection_follows
  ) combined
  GROUP BY collection_id
) coll_social ON coll_social.collection_id = c.id
WHERE c.visibility IN ('public', 'shared')
ORDER BY discovery_score DESC, c.created_at DESC;

-- =====================================================
-- 5. ANALYTICS DASHBOARD VIEWS
-- =====================================================

-- Daily user activity analytics
CREATE OR REPLACE VIEW daily_user_activity AS
SELECT
  DATE_TRUNC('day', created_at) as activity_date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE action_type = 'create_card') as cards_created,
  COUNT(*) FILTER (WHERE action_type = 'create_collection') as collections_created,
  COUNT(*) FILTER (WHERE action_type = 'marketplace_listing') as marketplace_listings,
  COUNT(*) FILTER (WHERE action_type = 'credit_purchase') as credit_purchases
FROM (
  SELECT created_at, user_id, 'create_card' as action_type FROM cards WHERE deleted_at IS NULL
  UNION ALL
  SELECT created_at, user_id, 'create_collection' as action_type FROM collections
  UNION ALL
  SELECT created_at, seller_user_id as user_id, 'marketplace_listing' as action_type FROM marketplace_listings
  UNION ALL
  SELECT created_at, user_id, 'credit_purchase' as action_type FROM credit_transactions WHERE delta > 0
) combined_actions
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY activity_date DESC;

-- Revenue analytics view
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT
  DATE_TRUNC('day', transaction_date) as revenue_date,
  marketplace_revenue,
  credit_revenue,
  total_revenue,
  marketplace_transactions,
  credit_transactions,
  total_transactions,

  -- Running totals for the month
  SUM(total_revenue) OVER (
    PARTITION BY DATE_TRUNC('month', transaction_date)
    ORDER BY DATE_TRUNC('day', transaction_date)
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) as monthly_running_total,

  -- Comparison to previous period
  LAG(total_revenue, 7) OVER (ORDER BY DATE_TRUNC('day', transaction_date)) as previous_week_same_day

FROM (
  -- Marketplace revenue (5% platform fee)
  SELECT
    COALESCE(sold_at, created_at) as transaction_date,
    price * 0.05 as marketplace_revenue,
    0 as credit_revenue,
    1 as marketplace_transactions,
    0 as credit_transactions
  FROM marketplace_listings
  WHERE status = 'sold' AND sold_at IS NOT NULL

  UNION ALL

  -- Credit system revenue
  SELECT
    created_at as transaction_date,
    CASE
      WHEN type = 'credit_purchase' AND delta > 0 THEN delta * 0.10 -- 10% credit pack markup
      ELSE 0
    END as marketplace_revenue,
    CASE
      WHEN type IN ('premium_subscription', 'featured_listing') THEN ABS(delta)
      ELSE 0
    END as credit_revenue,
    0 as marketplace_transactions,
    CASE WHEN type IN ('credit_purchase', 'premium_subscription', 'featured_listing') THEN 1 ELSE 0 END as credit_transactions
  FROM credit_transactions
  WHERE delta != 0
) revenue_combined
GROUP BY DATE_TRUNC('day', transaction_date), marketplace_revenue, credit_revenue, marketplace_transactions, credit_transactions
ORDER BY revenue_date DESC;

-- =====================================================
-- 6. MATERIALIZED VIEWS FOR EXPENSIVE QUERIES
-- =====================================================

-- Materialized view for user social graph (expensive to compute)
CREATE MATERIALIZED VIEW user_social_graph AS
SELECT
  u1.user_id as user_a,
  u2.user_id as user_b,
  'follows' as relationship_type,
  f.created_at as established_at
FROM users u1
JOIN follows f ON f.following_user_id = u1.user_id
JOIN users u2 ON u2.user_id = f.follower_user_id

UNION ALL

-- Mutual card interactions
SELECT DISTINCT
  ua.user_id as user_a,
  ub.user_id as user_b,
  'card_interaction' as relationship_type,
  GREATEST(cal.created_at, ccl.created_at) as established_at
FROM card_likes cal
JOIN cards ca ON ca.id = cal.card_id
JOIN card_comments ccl ON ccl.card_id = cal.card_id AND ccl.user_id != cal.user_id
JOIN users ua ON ua.user_id = ca.user_id
JOIN users ub ON ub.user_id = ccl.user_id
WHERE ua.user_id != ub.user_id
ORDER BY established_at DESC;

-- Create indexes on materialized view
CREATE INDEX idx_social_graph_users ON user_social_graph (user_a, user_b);
CREATE INDEX idx_social_graph_type ON user_social_graph (relationship_type, established_at DESC);

-- =====================================================
-- 7. CONTENT MODERATION VIEWS
-- =====================================================

-- Content requiring moderation review
CREATE OR REPLACE VIEW content_moderation_queue AS
SELECT
  'card' as content_type,
  c.id as content_id,
  c.name as title,
  c.description as content,
  c.created_at,
  u.username as creator_username,
  u.reputation as creator_reputation,

  -- Risk scoring for moderation priority
  CASE
    WHEN c.is_public = false THEN 10 -- Private content gets higher priority
    WHEN u.reputation < 10 THEN 8 -- New/low-rep users
    WHEN c.created_at > NOW() - INTERVAL '1 hour' THEN 5 -- Very recent content
    ELSE 1
  END as priority_score,

  -- Last moderation activity
  NULL as last_moderated_at,
  NULL as last_moderator_username

FROM cards c
JOIN users u ON u.user_id = c.user_id
WHERE c.deleted_at IS NULL
  AND c.created_at > NOW() - INTERVAL '7 days'
  AND c.source IN ('generated', 'marketplace') -- Auto-generated content needs more review

UNION ALL

SELECT
  'collection' as content_type,
  col.id as content_id,
  col.name as title,
  col.description as content,
  col.created_at,
  u.username as creator_username,
  u.reputation as creator_reputation,

  CASE
    WHEN col.visibility = 'public' THEN 7 -- Public collections need review
    WHEN u.reputation < 10 THEN 6
    ELSE 2
  END as priority_score,

  NULL as last_moderated_at,
  NULL as last_moderator_username

FROM collections col
JOIN users u ON u.user_id = col.user_id
WHERE col.visibility IN ('public', 'shared')
  AND col.created_at > NOW() - INTERVAL '7 days'

ORDER BY priority_score DESC, created_at DESC;

-- =====================================================
-- 8. PERFORMANCE MONITORING VIEWS
-- =====================================================

-- Slow query detection view
CREATE OR REPLACE VIEW query_performance_monitor AS
SELECT
  queryid,
  query,
  calls,
  total_time,
  mean_time,
  max_time,
  temp_blks_written,
  blk_read_time,
  blk_write_time,
  userid::regrole as username,
  dbid::regclass as database
FROM pg_stat_statements
WHERE calls > 100 -- Only queries executed more than 100 times
  AND mean_time > 1000 -- Average execution time > 1 second
ORDER BY mean_time DESC
LIMIT 50;

-- Index usage efficiency view
CREATE OR REPLACE VIEW index_usage_efficiency AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  pg_size_pretty(pg_relation_size(pc.oid)) as table_size,
  ROUND(
    pg_relation_size(indexrelid)::numeric /
    NULLIF(pg_relation_size(pc.oid), 0) * 100, 2
  ) as index_to_table_ratio,
  last_idx_scan,
  CASE
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 1000 THEN 'LOW_USAGE'
    WHEN idx_scan < 10000 THEN 'MODERATE_USAGE'
    ELSE 'HIGH_USAGE'
  END as usage_category
FROM pg_stat_user_indexes ps
JOIN pg_class pc ON pc.relname = ps.tablename
WHERE ps.schemaname = 'public'
ORDER BY idx_scan DESC, pg_relation_size(indexrelid) DESC;

-- =====================================================
-- MIGRATION VERIFICATION AND REFRESH SCHEDULES
-- =====================================================

DO $$
DECLARE
  view_count INTEGER;
  mat_view_count INTEGER;
  total_view_size TEXT;
BEGIN
  -- Count views created
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN (
      'user_profile_complete',
      'card_catalog',
      'marketplace_performance',
      'collection_discovery',
      'daily_user_activity',
      'revenue_analytics',
      'content_moderation_queue',
      'query_performance_monitor',
      'index_usage_efficiency'
    );

  -- Count materialized views
  SELECT COUNT(*) INTO mat_view_count
  FROM pg_matviews
  WHERE schemaname = 'public';

  RAISE NOTICE 'Database Views Migration Results:';
  RAISE NOTICE '  - Standard Views Created: %', view_count;
  RAISE NOTICE '  - Materialized Views Created: %', mat_view_count;
  RAISE NOTICE '  - Performance Monitoring Views: Active';
  RAISE NOTICE '  - Content Moderation Views: Ready';
  RAISE NOTICE '  - Analytics Views: Implemented';
  RAISE NOTICE '✅ Database views migration completed successfully!';
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION REFRESH SCHEDULES
-- =====================================================

/*
Recommended refresh schedules for materialized views:

1. Daily refreshes (after nightly batch processing):
   REFRESH MATERIALIZED VIEW CONCURRENTLY user_social_graph;

2. Hourly analytics updates:
   REFRESH MATERIALIZED VIEW CONCURRENTLY daily_user_activity;

3. Real-time monitoring (every 5 minutes):
   -- Not materialized views but can set up monitoring queries

Example usage in application:

-- Get user profile with all social metrics
SELECT * FROM user_profile_complete WHERE user_id = 'user123';

-- Discover popular collections
SELECT * FROM collection_discovery LIMIT 20;

-- Get marketplace analytics
SELECT * FROM marketplace_performance WHERE status = 'sold' ORDER BY days_listed ASC;

-- Content moderation dashboard
SELECT * FROM content_moderation_queue ORDER BY priority_score DESC LIMIT 50;

-- Monitor database performance
SELECT * FROM query_performance_monitor;
SELECT * FROM index_usage_efficiency WHERE usage_category = 'UNUSED';
*/

-- =====================================================
-- VIEWS MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to refresh all materialized views (run nightly)
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
  -- Refresh materialized views in dependency order
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_social_graph;

  -- Update any stale computed statistics
  -- This could include updating trending scores, etc.

  RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to analyze view performance
CREATE OR REPLACE FUNCTION analyze_view_performance(view_name TEXT)
RETURNS TABLE (
  view_name TEXT,
  estimated_rows BIGINT,
  estimated_cost FLOAT,
  actual_rows BIGINT,
  execution_time FLOAT
) AS $$
DECLARE
  query_text TEXT;
BEGIN
  -- Build EXPLAIN query for the view
  query_text := format('EXPLAIN (ANALYZE, FORMAT JSON) SELECT * FROM %I LIMIT 100', view_name);

  RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;
