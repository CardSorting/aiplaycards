-- Enhanced Community Pack System Migration
-- Industry-grade database schema improvements with comprehensive relationships
-- Migration created: November 18, 2025

-- This migration creates the enhanced community pack system with:
-- 1. Advanced pack templates with inheritance and theming
-- 2. Comprehensive card pools with rotation strategies
-- 3. Pack instances and claiming system
-- 4. Community governance features (voting, suggestions)
-- 5. Analytics and performance tracking

BEGIN;

-- Create enums for data integrity
DO $$ BEGIN
    CREATE TYPE pack_type AS ENUM ('manual', 'themed', 'custom', 'community', 'celebration', 'rarity_blind');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pack_status AS ENUM ('draft', 'pending_review', 'approved', 'active', 'paused', 'depleted', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pack_claim_type AS ENUM ('direct_assignment', 'random_draw', 'purchase', 'reward', 'community_vote', 'admin_gift');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pack_rotation_strategy AS ENUM ('random', 'weighted', 'sequential', 'rarity_based', 'time_based', 'demand_driven');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE PACK SYSTEM TABLES
-- ============================================================================

-- Enhanced pack templates with inheritance and advanced features
CREATE TABLE IF NOT EXISTS pack_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    pack_type pack_type NOT NULL DEFAULT 'manual',

    -- Template inheritance system (self-referencing foreign key - added after table creation)
    parent_template_id INTEGER,

    -- Card configuration
    card_count INTEGER NOT NULL DEFAULT 5 CHECK (card_count >= 1 AND card_count <= 10),
    min_cards INTEGER NOT NULL DEFAULT 3 CHECK (min_cards >= 1),
    max_cards INTEGER NOT NULL DEFAULT 6 CHECK (max_cards >= min_cards),

    -- Advanced rarity distribution system
    rarity_distribution JSONB NOT NULL DEFAULT '{
        "common": {"weight": 3, "minCount": 2, "maxCount": 4},
        "uncommon": {"weight": 1, "minCount": 0, "maxCount": 2},
        "rare": {"weight": 1, "minCount": 0, "maxCount": 2}
    }' CHECK (
        jsonb_typeof(rarity_distribution) = 'object' AND
        rarity_distribution ? 'common' AND
        rarity_distribution ? 'uncommon' AND
        rarity_distribution ? 'rare'
    ),

    -- Theme and styling configuration
    theme_config JSONB DEFAULT '{
        "primaryColor": "#1976d2",
        "secondaryColor": "#dc004e",
        "backgroundGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "packImage": null,
        "descriptionImage": null
    }',

    -- Pool configuration (which pools this template can draw from)
    pool_config JSONB DEFAULT '{
        "allowedPools": ["community"],
        "exclusionPools": [],
        "categoryWeights": {}
    }',

    -- Advanced features
    is_seasonal BOOLEAN NOT NULL DEFAULT false,
    season_start TIMESTAMP WITH TIME ZONE,
    season_end TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]',

    -- Status and approval workflow
    status pack_status NOT NULL DEFAULT 'draft',
    approval_required BOOLEAN NOT NULL DEFAULT false,

    -- Metadata and audit
    created_by_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    approved_by_id VARCHAR(255) REFERENCES users(user_id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT seasonal_dates_check CHECK (
        (is_seasonal = false) OR
        (is_seasonal = true AND season_start IS NOT NULL AND season_end IS NOT NULL AND season_start < season_end)
    ),
    CONSTRAINT approval_workflow_check CHECK (
        (status != 'approved') OR
        (status = 'approved' AND approved_by_id IS NOT NULL AND approved_at IS NOT NULL)
    )
);

-- Enhanced pack categories with community features
CREATE TABLE IF NOT EXISTS pack_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT,

    -- Visual configuration
    color VARCHAR(7) DEFAULT '#1976d2' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon VARCHAR(100),
    banner_image TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,

    -- Community governance features
    is_community_curated BOOLEAN NOT NULL DEFAULT false,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    min_vote_threshold INTEGER DEFAULT 10 CHECK (min_vote_threshold >= 0),

    -- Operational settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,

    -- Metadata
    tags JSONB DEFAULT '[]',
    created_by_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    approved_by_id VARCHAR(255) REFERENCES users(user_id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Unique constraint on active slug
    CONSTRAINT unique_active_slug UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- CARD POOL AND INVENTORY SYSTEM
-- ============================================================================

-- Card pools for managing community collections
CREATE TABLE IF NOT EXISTS card_pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,

    -- Pool configuration
    pool_type VARCHAR(50) NOT NULL DEFAULT 'community'
        CHECK (pool_type IN ('community', 'admin', 'seasonal', 'custom')),
    capacity INTEGER CHECK (capacity > 0), -- Maximum cards in pool
    rotation_strategy pack_rotation_strategy NOT NULL DEFAULT 'weighted',

    -- Rotation settings (JSON for flexibility)
    rotation_schedule JSONB DEFAULT '{
        "intervalDays": 7,
        "rotatePercentage": 20,
        "keepHighRated": true
    }',

    -- Stock management
    is_depletable BOOLEAN NOT NULL DEFAULT true,
    refill_strategy JSONB DEFAULT '{
        "autoRefill": true,
        "refillThreshold": 10,
        "refillAmount": 50,
        "sourcePools": ["community"]
    }',

    -- Quality control
    min_quality_score DECIMAL(3,2) CHECK (min_quality_score >= 0 AND min_quality_score <= 5),
    requires_moderation BOOLEAN NOT NULL DEFAULT true,

    -- Availability
    is_active BOOLEAN NOT NULL DEFAULT true,
    availability_start TIMESTAMP WITH TIME ZONE,
    availability_end TIMESTAMP WITH TIME ZONE,

    -- Community features
    allow_user_submissions BOOLEAN NOT NULL DEFAULT false,
    submission_guidelines TEXT,

    created_by_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT availability_dates_check CHECK (
        availability_end IS NULL OR availability_start IS NULL OR availability_start < availability_end
    )
);

-- Cards within pools (junction table with enhanced metadata)
CREATE TABLE IF NOT EXISTS pool_cards (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER NOT NULL REFERENCES card_pools(id) ON DELETE CASCADE,
    card_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    rarity VARCHAR(50) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),

    -- Enhanced metadata
    category_id INTEGER REFERENCES pack_categories(id),
    tags JSONB DEFAULT '[]',
    search_tags TEXT, -- Full-text search optimized

    -- Weighting and availability
    base_weight INTEGER NOT NULL DEFAULT 1 CHECK (base_weight > 0),
    dynamic_weight INTEGER NOT NULL DEFAULT 1 CHECK (dynamic_weight >= 0),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),

    -- Quality and moderation
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 5),
    moderation_status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderated_by_id VARCHAR(255) REFERENCES users(user_id),
    moderated_at TIMESTAMP WITH TIME ZONE,

    -- Contributor information
    submitted_by_id VARCHAR(255) REFERENCES users(user_id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Pool management
    added_by_id VARCHAR(255) REFERENCES users(user_id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    removed_at TIMESTAMP WITH TIME ZONE, -- For soft deletes/tracking rotation

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Unique constraint to prevent duplicate cards in same pool (unless different rarities)
    CONSTRAINT unique_card_in_pool UNIQUE (pool_id, card_name, rarity) DEFERRABLE INITIALLY DEFERRED
);

-- Category associations for cards (many-to-many relationship)
CREATE TABLE IF NOT EXISTS card_category_associations (
    id SERIAL PRIMARY KEY,
    pool_card_id INTEGER NOT NULL REFERENCES pool_cards(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES pack_categories(id) ON DELETE CASCADE,

    -- Association metadata
    weight INTEGER NOT NULL DEFAULT 1 CHECK (weight > 0), -- Influence in category
    is_primary BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Unique constraint to prevent duplicate associations
    CONSTRAINT unique_card_category UNIQUE (pool_card_id, category_id) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- PACK INSTANCE AND CLAIMING SYSTEM
-- ============================================================================

-- Pack instances (actual pack creations for users)
CREATE TABLE IF NOT EXISTS pack_instances (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES pack_templates(id),
    recipient_user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),

    -- Pack configuration at creation time (snapshot for consistency)
    card_count INTEGER NOT NULL,
    rarity_distribution JSONB NOT NULL,
    theme_config JSONB,
    tags JSONB DEFAULT '[]',

    -- Claiming system
    claim_type pack_claim_type NOT NULL DEFAULT 'admin_gift',
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    claim_session_id VARCHAR(100),

    -- Financial aspects
    credit_cost INTEGER NOT NULL DEFAULT 38 CHECK (credit_cost >= 0),
    usd_cost DECIMAL(10,2) CHECK (usd_cost >= 0),

    -- Creation metadata
    created_by_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

    -- Processing details
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Index for efficient querying
    CONSTRAINT claim_status_check CHECK (
        (is_claimed = false) OR
        (is_claimed = true AND claimed_at IS NOT NULL)
    )
);

-- Cards within pack instances (denormalized for performance)
CREATE TABLE IF NOT EXISTS pack_instance_cards (
    id SERIAL PRIMARY KEY,
    pack_instance_id INTEGER NOT NULL REFERENCES pack_instances(id) ON DELETE CASCADE,
    pool_card_id INTEGER NOT NULL REFERENCES pool_cards(id),

    -- Card details (denormalized for performance)
    card_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    rarity VARCHAR(50) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),

    -- Position and metadata
    slot_number INTEGER NOT NULL CHECK (slot_number > 0),
    is_holographic BOOLEAN NOT NULL DEFAULT false,
    special_effect VARCHAR(50) CHECK (special_effect IN ('shiny', 'golden', 'rainbow', 'animated')),

    -- Derived information (cached for performance)
    category_id INTEGER REFERENCES pack_categories(id),
    tags JSONB DEFAULT '[]',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure slot numbers are unique within a pack
    CONSTRAINT unique_slot_in_pack UNIQUE (pack_instance_id, slot_number) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- COMMUNITY FEATURES AND GOVERNANCE
-- ============================================================================

-- User-submitted pack suggestions
CREATE TABLE IF NOT EXISTS pack_suggestions (
    id SERIAL PRIMARY KEY,
    suggested_by_id VARCHAR(255) NOT NULL REFERENCES users(user_id),

    -- Suggestion details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pack_type pack_type NOT NULL DEFAULT 'manual',
    suggested_card_count INTEGER NOT NULL DEFAULT 5 CHECK (suggested_card_count >= 1 AND suggested_card_count <= 10),
    suggested_distribution JSONB,

    -- Community voting
    upvotes INTEGER NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
    downvotes INTEGER NOT NULL DEFAULT 0 CHECK (downvotes >= 0),
    total_votes INTEGER NOT NULL DEFAULT 0 CHECK (total_votes >= 0),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'implemented')),
    reviewed_by_id VARCHAR(255) REFERENCES users(user_id),
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- Implementation tracking
    implemented_as_template_id INTEGER REFERENCES pack_templates(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Computed rating constraint
    CONSTRAINT rating_calculation_check CHECK (
        total_votes = 0 OR rating = ((upvotes::decimal - downvotes::decimal) / total_votes::decimal + 1) * 2.5
    )
);

-- User votes on pack suggestions
CREATE TABLE IF NOT EXISTS pack_suggestion_votes (
    id SERIAL PRIMARY KEY,
    suggestion_id INTEGER NOT NULL REFERENCES pack_suggestions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),

    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Unique constraint: one vote per user per suggestion
    CONSTRAINT unique_user_suggestion_vote UNIQUE (suggestion_id, user_id) DEFERRABLE INITIALLY DEFERRED
);

-- Pack popularity and usage analytics
CREATE TABLE IF NOT EXISTS pack_analytics (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES pack_templates(id) ON DELETE CASCADE,

    -- Time period
    date DATE NOT NULL, -- Date truncated for aggregation
    period VARCHAR(10) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),

    -- Usage metrics
    packs_created INTEGER NOT NULL DEFAULT 0 CHECK (packs_created >= 0),
    packs_claimed INTEGER NOT NULL DEFAULT 0 CHECK (packs_claimed >= 0),
    credit_revenue INTEGER NOT NULL DEFAULT 0 CHECK (credit_revenue >= 0),
    usd_revenue DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (usd_revenue >= 0),

    -- Engagement metrics
    user_satisfaction DECIMAL(3,2) CHECK (user_satisfaction >= 0 AND user_satisfaction <= 5),
    avg_cards_per_pack DECIMAL(4,2),
    popular_rarities JSONB DEFAULT '{}',
    popular_categories JSONB DEFAULT '{}',

    -- Performance metrics
    avg_processing_time INTEGER NOT NULL DEFAULT 0 CHECK (avg_processing_time >= 0), -- milliseconds
    success_rate DECIMAL(5,4) NOT NULL DEFAULT 1.0 CHECK (success_rate >= 0 AND success_rate <= 1),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Unique constraint per template per period per date
    CONSTRAINT unique_template_date_period UNIQUE (template_id, date, period) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Pack templates indexes
CREATE INDEX IF NOT EXISTS idx_pack_templates_slug ON pack_templates(slug);
CREATE INDEX IF NOT EXISTS idx_pack_templates_status ON pack_templates(status);
CREATE INDEX IF NOT EXISTS idx_pack_templates_pack_type ON pack_templates(pack_type);
CREATE INDEX IF NOT EXISTS idx_pack_templates_parent ON pack_templates(parent_template_id);
CREATE INDEX IF NOT EXISTS idx_pack_templates_seasonal ON pack_templates(is_seasonal);
CREATE INDEX IF NOT EXISTS idx_pack_templates_created_at ON pack_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_pack_templates_season_dates ON pack_templates(season_start, season_end);

-- Pack categories indexes
CREATE INDEX IF NOT EXISTS idx_pack_categories_slug ON pack_categories(slug);
CREATE INDEX IF NOT EXISTS idx_pack_categories_active ON pack_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_pack_categories_visible ON pack_categories(is_visible);
CREATE INDEX IF NOT EXISTS idx_pack_categories_display_order ON pack_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_pack_categories_community ON pack_categories(is_community_curated);

-- Card pools indexes
CREATE INDEX IF NOT EXISTS idx_card_pools_slug ON card_pools(slug);
CREATE INDEX IF NOT EXISTS idx_card_pools_pool_type ON card_pools(pool_type);
CREATE INDEX IF NOT EXISTS idx_card_pools_active ON card_pools(is_active);
CREATE INDEX IF NOT EXISTS idx_card_pools_availability ON card_pools(availability_start, availability_end);

-- Pool cards indexes
CREATE INDEX IF NOT EXISTS idx_pool_cards_pool_id ON pool_cards(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_cards_category_id ON pool_cards(category_id);
CREATE INDEX IF NOT EXISTS idx_pool_cards_rarity ON pool_cards(rarity);
CREATE INDEX IF NOT EXISTS idx_pool_cards_moderation_status ON pool_cards(moderation_status);
CREATE INDEX IF NOT EXISTS idx_pool_cards_quality_score ON pool_cards(quality_score);
CREATE INDEX IF NOT EXISTS idx_pool_cards_usage_count ON pool_cards(usage_count);
CREATE INDEX IF NOT EXISTS idx_pool_cards_added_at ON pool_cards(added_at);
-- Full-text search index for card names and tags (GIN index for efficient JSON array search)
CREATE INDEX IF NOT EXISTS idx_pool_cards_search ON pool_cards USING GIN (
    to_tsvector('english', card_name || ' ' || COALESCE(search_tags, ''))
);

-- Card category associations indexes
CREATE INDEX IF NOT EXISTS idx_card_category_associations_pool_card ON card_category_associations(pool_card_id);
CREATE INDEX IF NOT EXISTS idx_card_category_associations_category ON card_category_associations(category_id);
CREATE INDEX IF NOT EXISTS idx_card_category_associations_primary ON card_category_associations(pool_card_id, is_primary);

-- Pack instances indexes
CREATE INDEX IF NOT EXISTS idx_pack_instances_template_id ON pack_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_pack_instances_recipient ON pack_instances(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_pack_instances_claim_status ON pack_instances(is_claimed);
CREATE INDEX IF NOT EXISTS idx_pack_instances_status ON pack_instances(status);
CREATE INDEX IF NOT EXISTS idx_pack_instances_created_at ON pack_instances(created_at);
CREATE INDEX IF NOT EXISTS idx_pack_instances_claim_type ON pack_instances(claim_type);

-- Pack instance cards indexes
CREATE INDEX IF NOT EXISTS idx_pack_instance_cards_pack_instance ON pack_instance_cards(pack_instance_id);
CREATE INDEX IF NOT EXISTS idx_pack_instance_cards_pool_card ON pack_instance_cards(pool_card_id);
CREATE INDEX IF NOT EXISTS idx_pack_instance_cards_rarity ON pack_instance_cards(rarity);
CREATE INDEX IF NOT EXISTS idx_pack_instance_cards_category_id ON pack_instance_cards(category_id);
CREATE INDEX IF NOT EXISTS idx_pack_instance_cards_slot ON pack_instance_cards(pack_instance_id, slot_number);

-- Pack suggestions indexes
CREATE INDEX IF NOT EXISTS idx_pack_suggestions_suggested_by ON pack_suggestions(suggested_by_id);
CREATE INDEX IF NOT EXISTS idx_pack_suggestions_status ON pack_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_pack_suggestions_rating ON pack_suggestions(rating);
CREATE INDEX IF NOT EXISTS idx_pack_suggestions_total_votes ON pack_suggestions(total_votes);
CREATE INDEX IF NOT EXISTS idx_pack_suggestions_created_at ON pack_suggestions(created_at);

-- Pack suggestion votes indexes
CREATE INDEX IF NOT EXISTS idx_pack_suggestion_votes_suggestion ON pack_suggestion_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_pack_suggestion_votes_user ON pack_suggestion_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_pack_suggestion_votes_vote_type ON pack_suggestion_votes(vote_type);

-- Pack analytics indexes
CREATE INDEX IF NOT EXISTS idx_pack_analytics_template ON pack_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_pack_analytics_date ON pack_analytics(date);
CREATE INDEX IF NOT EXISTS idx_pack_analytics_period ON pack_analytics(period);

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default community pool
INSERT INTO card_pools (
    name, slug, description, pool_type, capacity, is_depletable, allow_user_submissions,
    submission_guidelines, created_by_id
) VALUES (
    'Community Card Pool',
    'community',
    'Official community-curated card collection featuring the best user-submitted cards',
    'community',
    10000,
    true,
    true,
    'Please submit cards that fit our community themes. All submissions are moderated for quality.',
    (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)
) ON CONFLICT (slug) DO NOTHING;

-- Insert default admin pool
INSERT INTO card_pools (
    name, slug, description, pool_type, capacity, is_depletable, requires_moderation,
    created_by_id
) VALUES (
    'Admin Card Pool',
    'admin',
    'Official admin-created cards with guaranteed quality',
    'admin',
    NULL, -- Unlimited capacity for admin pool
    false,
    false,
    (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)
) ON CONFLICT (slug) DO NOTHING;

-- Insert default categories
INSERT INTO pack_categories (
    name, slug, description, color, display_order, is_active, is_visible, created_by_id
) VALUES
    ('Pokemon', 'pokemon', 'Classic Pokemon cards and themes', '#FF6B6B', 1, true, true,
     (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Yu-Gi-Oh!', 'yugioh', 'Yu-Gi-Oh! cards and dueling themes', '#4ECDC4', 2, true, true,
     (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Magic: The Gathering', 'magic', 'Magic: The Gathering cards and strategies', '#45B7D1', 3, true, true,
     (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Fantasy', 'fantasy', 'Fantasy-themed cards and creatures', '#96CEB4', 4, true, true,
     (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Sci-Fi', 'sci-fi', 'Science fiction and futuristic themes', '#FFEAA7', 5, true, true,
     (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Anime', 'anime', 'Anime-inspired cards and characters', '#DDA0DD', 6, true, true,
     (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Horror', 'horror', 'Horror and supernatural themes', '#2C3E50', 7, true, false,
     (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- Insert basic pack templates
INSERT INTO pack_templates (
    name, slug, description, pack_type, card_count, rarity_distribution,
    status, created_by_id
) VALUES
    ('Classic Pack', 'classic-pack', 'A traditional booster pack experience', 'manual', 5,
     '{"common": {"weight": 3, "minCount": 2, "maxCount": 4}, "uncommon": {"weight": 1, "minCount": 0, "maxCount": 2}, "rare": {"weight": 1, "minCount": 0, "maxCount": 2}}',
     'approved', (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Premium Pack', 'premium-pack', 'Higher quality cards with better chances', 'manual', 5,
     '{"common": {"weight": 2, "minCount": 1, "maxCount": 3}, "uncommon": {"weight": 2, "minCount": 1, "maxCount": 3}, "rare": {"weight": 1, "minCount": 1, "maxCount": 2}, "epic": {"weight": 0, "minCount": 0, "maxCount": 1}}',
     'approved', (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1)),
    ('Mystery Pack', 'mystery-pack', 'Random card count and rarities', 'rarity_blind', 5,
     '{"common": {"weight": 1, "minCount": 0, "maxCount": 5}, "uncommon": {"weight": 1, "minCount": 0, "maxCount": 5}, "rare": {"weight": 1, "minCount": 0, "maxCount": 5}, "epic": {"weight": 1, "minCount": 0, "maxCount": 5}, "legendary": {"weight": 1, "minCount": 0, "maxCount": 5}}',
     'approved', (SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TRIGGERS FOR DATA INTEGRITY
-- ============================================================================

-- Function to update pack suggestion vote counts
CREATE OR REPLACE FUNCTION update_pack_suggestion_votes()
RETURNS TRIGGER AS $$
BEGIN
    WITH vote_counts AS (
        SELECT
            suggestion_id,
            COUNT(*) FILTER (WHERE vote_type = 'up') as upvotes,
            COUNT(*) FILTER (WHERE vote_type = 'down') as downvotes
        FROM pack_suggestion_votes
        WHERE NEW.suggestion_id IS NULL OR suggestion_id = NEW.suggestion_id
        GROUP BY suggestion_id
    )
    UPDATE pack_suggestions
    SET
        upvotes = COALESCE(vc.upvotes, 0),
        downvotes = COALESCE(vc.downvotes, 0),
        total_votes = COALESCE(vc.upvotes, 0) + COALESCE(vc.downvotes, 0),
        rating = CASE
            WHEN COALESCE(vc.upvotes, 0) + COALESCE(vc.downvotes, 0) = 0 THEN NULL
            ELSE ((COALESCE(vc.upvotes, 0)::decimal - COALESCE(vc.downvotes, 0)::decimal) /
                  (COALESCE(vc.upvotes, 0) + COALESCE(vc.downvotes, 0))::decimal + 1) * 2.5
        END,
        updated_at = NOW()
    FROM vote_counts vc
    WHERE pack_suggestions.id = vc.suggestion_id
    AND (NEW.suggestion_id IS NULL OR pack_suggestions.id = NEW.suggestion_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain vote counts on suggestion votes
DROP TRIGGER IF EXISTS trigger_update_pack_suggestion_votes ON pack_suggestion_votes;
CREATE TRIGGER trigger_update_pack_suggestion_votes
    AFTER INSERT OR UPDATE OR DELETE ON pack_suggestion_votes
    FOR EACH ROW EXECUTE FUNCTION update_pack_suggestion_votes();

-- Function to update template last_used_at
CREATE OR REPLACE FUNCTION update_template_last_used()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pack_templates
    SET last_used_at = NOW(), updated_at = NOW()
    WHERE id = NEW.template_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update template usage timestamp
DROP TRIGGER IF EXISTS trigger_update_template_last_used ON pack_instances;
CREATE TRIGGER trigger_update_template_last_used
    AFTER INSERT ON pack_instances
    FOR EACH ROW EXECUTE FUNCTION update_template_last_used();

-- Function to update pool card usage statistics
CREATE OR REPLACE FUNCTION update_pool_card_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pool_card_id IS NOT NULL THEN
        UPDATE pool_cards
        SET
            usage_count = usage_count + 1,
            dynamic_weight = GREATEST(0, dynamic_weight - 0.1), -- Slight weight reduction to rotate cards
            updated_at = NOW()
        WHERE id = NEW.pool_card_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track card usage
DROP TRIGGER IF EXISTS trigger_update_pool_card_usage ON pack_instance_cards;
CREATE TRIGGER trigger_update_pool_card_usage
    AFTER INSERT ON pack_instance_cards
    FOR EACH ROW EXECUTE FUNCTION update_pool_card_usage();

-- ============================================================================
-- PERMISSIONS AND SECURITY
-- ============================================================================

-- Grant permissions to authenticated users (adjust as needed for your application)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Row Level Security (RLS) policies can be added here as needed
-- ALTER TABLE pack_suggestions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pack_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Update schema export for Drizzle
-- This would be added to the schema index.ts file:
-- export * from './enhanced-community-packs';

COMMIT;

-- Post-migration validation queries
-- SELECT 'Migration completed successfully' as status;

-- Optional: Run these to validate the migration:
-- SELECT COUNT(*) as pack_templates_count FROM pack_templates;
-- SELECT COUNT(*) as card_pools_count FROM card_pools;
-- SELECT COUNT(*) as pack_categories_count FROM pack_categories;
-- SELECT 'All tables created successfully' as validation_result;
