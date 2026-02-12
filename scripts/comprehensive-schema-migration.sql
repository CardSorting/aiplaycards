-- =====================================================
-- COMPREHENSIVE ADMIN WORKFLOW SCHEMA MIGRATION
-- File: scripts/comprehensive-schema-migration.sql
--
-- This migration creates the enhanced admin workflow and print order
-- schema improvements following industry standards:
-- - Admin user roles and permissions
-- - Admin action audit trails
-- - Print order workflow management
-- - Admin capacity management
-- - Business rules engine
-- - Enhanced print order schema with admin workflow states
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADMIN USER ROLES AND PERMISSIONS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_user_roles') THEN
    CREATE TABLE admin_user_roles (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
      permission_level VARCHAR(20) NOT NULL DEFAULT 'junior_admin',
      can_approve_print_orders BOOLEAN NOT NULL DEFAULT false,
      can_modify_credits BOOLEAN NOT NULL DEFAULT false,
      can_manage_users BOOLEAN NOT NULL DEFAULT false,
      can_generate_packs BOOLEAN NOT NULL DEFAULT false,
      can_review_content BOOLEAN NOT NULL DEFAULT true,
      assigned_by_admin_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
      assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_activity_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Create indexes
    CREATE INDEX CONCURRENTLY admin_user_roles_user_id_idx ON admin_user_roles(user_id);
    CREATE INDEX CONCURRENTLY admin_user_roles_permission_level_idx ON admin_user_roles(permission_level);
    CREATE INDEX CONCURRENTLY admin_user_roles_active_idx ON admin_user_roles(is_active, last_activity_at);

    RAISE NOTICE 'Created admin_user_roles table';
  END IF;
END $$;

-- =====================================================
-- 2. ADMIN ACTIONS AUDIT TRAIL
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_actions_audit') THEN
    CREATE TABLE admin_actions_audit (
      id SERIAL PRIMARY KEY,
      admin_user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
      action_type VARCHAR(50) NOT NULL,
      action_description TEXT NOT NULL,
      target_user_id VARCHAR(255) REFERENCES users(user_id),
      target_print_order_id INTEGER REFERENCES print_orders(id),
      target_pack_creation_id INTEGER REFERENCES admin_pack_creations(id),
      old_values JSONB,
      new_values JSONB,
      changes JSONB,
      justification TEXT,
      risk_assessment VARCHAR(20) DEFAULT 'low',
      compliance_flags JSONB,
      ip_address VARCHAR(45),
      user_agent TEXT,
      action_status VARCHAR(20) DEFAULT 'completed',
      failure_reason TEXT,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create indexes for performance
    CREATE INDEX CONCURRENTLY admin_actions_audit_admin_user_idx ON admin_actions_audit(admin_user_id, executed_at);
    CREATE INDEX CONCURRENTLY admin_actions_audit_action_type_idx ON admin_actions_audit(action_type, executed_at);
    CREATE INDEX CONCURRENTLY admin_actions_audit_target_entities_idx ON admin_actions_audit(target_user_id, target_print_order_id, target_pack_creation_id);
    CREATE INDEX CONCURRENTLY admin_actions_audit_executed_at_idx ON admin_actions_audit(executed_at);
    CREATE INDEX CONCURRENTLY admin_actions_audit_status_idx ON admin_actions_audit(action_status);
    CREATE INDEX CONCURRENTLY admin_actions_audit_risk_idx ON admin_actions_audit(risk_assessment);

    -- Composite indexes for admin dashboard queries
    CREATE INDEX CONCURRENTLY admin_actions_audit_dashboard_idx ON admin_actions_audit(admin_user_id, action_type, executed_at DESC);
    CREATE INDEX CONCURRENTLY admin_actions_audit_recent_idx ON admin_actions_audit(executed_at DESC, action_type)
      WHERE executed_at > NOW() - INTERVAL '30 days';

    RAISE NOTICE 'Created admin_actions_audit table';
  END IF;
END $$;

-- =====================================================
-- 3. ADMIN PRINT ORDER WORKFLOW MANAGEMENT
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_print_order_workflow') THEN
    CREATE TABLE admin_print_order_workflow (
      id SERIAL PRIMARY KEY,
      print_order_id INTEGER NOT NULL UNIQUE REFERENCES print_orders(id) ON DELETE CASCADE,
      current_step VARCHAR(50) NOT NULL DEFAULT 'initial_review',
      workflow_status VARCHAR(20) NOT NULL DEFAULT 'active',
      assigned_admin_id VARCHAR(255) REFERENCES users(user_id),
      assigned_by_admin_id VARCHAR(255) REFERENCES users(user_id),
      assigned_at TIMESTAMP,
      priority VARCHAR(20) DEFAULT 'normal',
      sla_due_at TIMESTAMP,
      escalated_at TIMESTAMP,
      initial_review_at TIMESTAMP,
      initial_reviewer_id VARCHAR(255) REFERENCES users(user_id),
      final_approval_at TIMESTAMP,
      final_approver_id VARCHAR(255) REFERENCES users(user_id),
      quality_score INTEGER,
      quality_feedback TEXT,
      requires_rework BOOLEAN DEFAULT false,
      workflow_data JSONB,
      step_history JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Create workflow management indexes
    CREATE INDEX CONCURRENTLY admin_workflow_print_order_idx ON admin_print_order_workflow(print_order_id);
    CREATE INDEX CONCURRENTLY admin_workflow_assigned_admin_idx ON admin_print_order_workflow(assigned_admin_id);
    CREATE INDEX CONCURRENTLY admin_workflow_step_idx ON admin_print_order_workflow(current_step);
    CREATE INDEX CONCURRENTLY admin_workflow_priority_idx ON admin_print_order_workflow(priority, created_at);
    CREATE INDEX CONCURRENTLY admin_workflow_sla_idx ON admin_print_order_workflow(sla_due_at)
      WHERE workflow_status = 'active';
    CREATE INDEX CONCURRENTLY admin_workflow_status_idx ON admin_print_order_workflow(workflow_status);

    RAISE NOTICE 'Created admin_print_order_workflow table';
  END IF;
END $$;

-- =====================================================
-- 4. ADMIN CAPACITY MANAGEMENT
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_capacity_management') THEN
    CREATE TABLE admin_capacity_management (
      id SERIAL PRIMARY KEY,
      admin_user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      max_concurrent_orders INTEGER NOT NULL DEFAULT 10,
      current_active_orders INTEGER NOT NULL DEFAULT 0,
      orders_completed_today INTEGER DEFAULT 0,
      orders_completed_week INTEGER DEFAULT 0,
      average_processing_time INTEGER, -- Minutes
      is_available_for_assignment BOOLEAN DEFAULT true,
      unavailable_until TIMESTAMP,
      quality_rating INTEGER, -- 1-10 average rating
      customer_satisfaction_score INTEGER, -- 1-10
      specialization_areas JSONB, -- ['print_orders', 'user_management', 'content_moderation']
      preferred_shift VARCHAR(20), -- morning | afternoon | evening | flexible
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    -- Create capacity management indexes
    CREATE INDEX CONCURRENTLY admin_capacity_admin_idx ON admin_capacity_management(admin_user_id);
    CREATE INDEX CONCURRENTLY admin_capacity_availability_idx ON admin_capacity_management(is_available_for_assignment, current_active_orders);
    CREATE INDEX CONCURRENTLY admin_capacity_specialization_idx ON admin_capacity_management USING gin (specialization_areas);

    RAISE NOTICE 'Created admin_capacity_management table';
  END IF;
END $$;

-- =====================================================
-- 5. BUSINESS RULES ENGINE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_business_rules') THEN
    CREATE TABLE admin_business_rules (
      id SERIAL PRIMARY KEY,
      rule_name VARCHAR(100) NOT NULL UNIQUE,
      rule_description TEXT NOT NULL,
      conditions JSONB NOT NULL,
      actions JSONB NOT NULL,
      rule_category VARCHAR(50) NOT NULL, -- validation | routing | escalation | automation
      severity VARCHAR(20) DEFAULT 'medium', -- low | medium | high | critical
      is_active BOOLEAN DEFAULT true,
      requires_admin_approval BOOLEAN DEFAULT false,
      created_by_admin_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      trigger_count INTEGER DEFAULT 0,
      last_triggered_at TIMESTAMP
    );

    RAISE NOTICE 'Created admin_business_rules table';
  END IF;
END $$;

-- =====================================================
-- 6. ENHANCED PRINT ORDERS SCHEMA WITH ADMIN WORKFLOW
-- =====================================================

-- Add new columns to print_orders table (if they don't exist)
DO $$
BEGIN
  -- Check and add admin workflow columns to print_orders
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'requires_admin_approval') THEN
    ALTER TABLE print_orders ADD COLUMN admin_created_card_id INTEGER REFERENCES admin_created_cards(id) ON DELETE RESTRICT;
    ALTER TABLE print_orders ADD COLUMN card_type VARCHAR(20) NOT NULL DEFAULT 'regular';
    ALTER TABLE print_orders ADD COLUMN card_image_url VARCHAR(500);
    ALTER TABLE print_orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;
    ALTER TABLE print_orders ADD COLUMN requires_admin_approval BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE print_orders ADD COLUMN previous_status VARCHAR(32);
    ALTER TABLE print_orders ADD COLUMN reviewed_by_admin_id VARCHAR(255) REFERENCES users(user_id);
    ALTER TABLE print_orders ADD COLUMN reviewed_at TIMESTAMP;
    ALTER TABLE print_orders ADD COLUMN review_decision VARCHAR(20);
    ALTER TABLE print_orders ADD COLUMN review_notes TEXT;
    ALTER TABLE print_orders ADD COLUMN review_priority VARCHAR(20) DEFAULT 'normal';
    ALTER TABLE print_orders ADD COLUMN tracking_number VARCHAR(100);
    ALTER TABLE print_orders ADD COLUMN carrier VARCHAR(50);
    ALTER TABLE print_orders ADD COLUMN shipped_at TIMESTAMP;
    ALTER TABLE print_orders ADD COLUMN delivered_at TIMESTAMP;
    ALTER TABLE print_orders ADD COLUMN estimated_delivery TIMESTAMP;
    ALTER TABLE print_orders ADD COLUMN print_quality_rating SMALLINT;
    ALTER TABLE print_orders ADD COLUMN customer_feedback TEXT;
    ALTER TABLE print_orders ADD COLUMN last_modified_by_admin_id VARCHAR(255) REFERENCES users(user_id);
    ALTER TABLE print_orders ADD COLUMN version INTEGER DEFAULT 1;
    ALTER TABLE print_orders ADD COLUMN business_rule_violations JSONB;

    -- Update existing status values to use new enum values
    UPDATE print_orders SET status = 'pending' WHERE status = 'pending' AND status NOT IN ('pending', 'awaiting_admin_review', 'admin_reviewed', 'admin_approved', 'admin_rejected', 'processing', 'printing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned');

    RAISE NOTICE 'Enhanced print_orders table with admin workflow columns';
  END IF;
END $$;

-- Add enhanced indexes for admin workflow
DO $$
BEGIN
  -- Add indexes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_admin_created_card_id_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_admin_created_card_id_idx ON print_orders(admin_created_card_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_card_type_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_card_type_idx ON print_orders(card_type);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_requires_approval_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_requires_approval_idx ON print_orders(requires_admin_approval, status);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_reviewed_by_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_reviewed_by_idx ON print_orders(reviewed_by_admin_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_review_priority_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_review_priority_idx ON print_orders(review_priority, created_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_admin_workflow_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_admin_workflow_idx ON print_orders(status, requires_admin_approval, review_priority, created_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_pending_review_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_pending_review_idx ON print_orders(status, created_at)
      WHERE status IN ('pending', 'awaiting_admin_review', 'admin_reviewed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'print_orders_carrier_tracking_idx') THEN
    CREATE INDEX CONCURRENTLY print_orders_carrier_tracking_idx ON print_orders(carrier, tracking_number, status);
  END IF;

  RAISE NOTICE 'Created enhanced indexes for admin workflow';
END $$;

-- =====================================================
-- 7. ADMIN WORKFLOW BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Function to automatically assign print orders to available admins
CREATE OR REPLACE FUNCTION assign_print_order_to_admin(
    p_print_order_id INTEGER
) RETURNS VARCHAR(255) AS $$
DECLARE
    assigned_admin_id VARCHAR(255);
    assignment_reason TEXT;
BEGIN
    -- Find the most available admin with lowest active orders and highest capacity
    SELECT
        acm.admin_user_id
    INTO assigned_admin_id
    FROM admin_capacity_management acm
    JOIN admin_user_roles aur ON aur.user_id = acm.admin_user_id
    WHERE acm.is_available_for_assignment = true
      AND aur.is_active = true
      AND aur.can_approve_print_orders = true
      AND (acm.unavailable_until IS NULL OR acm.unavailable_until < NOW())
      AND acm.current_active_orders < acm.max_concurrent_orders
    ORDER BY
        acm.current_active_orders ASC,
        acm.quality_rating DESC,
        acm.last_activity_at DESC
    LIMIT 1;

    -- If no admin available, assign to admin with lowest load
    IF assigned_admin_id IS NULL THEN
        SELECT
            acm.admin_user_id
        INTO assigned_admin_id
        FROM admin_capacity_management acm
        JOIN admin_user_roles aur ON aur.user_id = acm.admin_user_id
        WHERE aur.is_active = true
          AND aur.can_approve_print_orders = true
          AND acm.current_active_orders < acm.max_concurrent_orders
        ORDER BY acm.current_active_orders ASC
        LIMIT 1;

        assignment_reason := 'fallback_assignment';
    ELSE
        assignment_reason := 'optimal_assignment';
    END IF;

    -- Create workflow entry and assign order
    IF assigned_admin_id IS NOT NULL THEN
        INSERT INTO admin_print_order_workflow (
            print_order_id,
            assigned_admin_id,
            assigned_by_admin_id,
            workflow_data,
            current_step
        ) VALUES (
            p_print_order_id,
            assigned_admin_id,
            'system',
            jsonb_build_object('assignment_reason', assignment_reason, 'assigned_at', NOW()),
            'initial_review'
        );

        -- Update admin capacity
        UPDATE admin_capacity_management
        SET current_active_orders = current_active_orders + 1,
            updated_at = NOW()
        WHERE admin_user_id = assigned_admin_id;

        -- Log the assignment in audit trail
        INSERT INTO admin_actions_audit (
            admin_user_id,
            action_type,
            action_description,
            target_print_order_id,
            new_values,
            justification
        ) VALUES (
            'system',
            'assign_print_order',
            'Automatically assigned print order to admin',
            p_print_order_id,
            jsonb_build_object('assigned_admin_id', assigned_admin_id, 'assignment_reason', assignment_reason),
            'Load balancing and capacity optimization'
        );
    END IF;

    RETURN assigned_admin_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete admin workflow for a print order
CREATE OR REPLACE FUNCTION complete_admin_workflow(
    p_print_order_id INTEGER,
    p_admin_user_id VARCHAR(255),
    p_decision VARCHAR(20),
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    workflow_id INTEGER;
    current_status VARCHAR(32);
    new_status VARCHAR(32);
BEGIN
    -- Get current workflow and order status
    SELECT apow.id, po.status
    INTO workflow_id, current_status
    FROM admin_print_order_workflow apow
    JOIN print_orders po ON po.id = apow.print_order_id
    WHERE apow.print_order_id = p_print_order_id;

    IF workflow_id IS NULL THEN
        RETURN false;
    END IF;

    -- Determine new status based on decision
    CASE p_decision
        WHEN 'approve' THEN new_status := 'admin_approved';
        WHEN 'reject' THEN new_status := 'admin_rejected';
        WHEN 'request_changes' THEN new_status := 'awaiting_admin_review';
        WHEN 'hold' THEN new_status := 'pending';
        ELSE new_status := current_status;
    END CASE;

    -- Update print order
    UPDATE print_orders
    SET status = new_status,
        previous_status = status,
        reviewed_by_admin_id = p_admin_user_id,
        reviewed_at = NOW(),
        review_decision = p_decision,
        review_notes = p_notes,
        last_modified_by_admin_id = p_admin_user_id,
        updated_at = NOW()
    WHERE id = p_print_order_id;

    -- Update workflow
    UPDATE admin_print_order_workflow
    SET final_approval_at = CASE WHEN p_decision = 'approve' THEN NOW() ELSE final_approval_at END,
        final_approver_id = CASE WHEN p_decision = 'approve' THEN p_admin_user_id ELSE final_approver_id END,
        workflow_status = 'completed',
        updated_at = NOW(),
        step_history = step_history || jsonb_build_object(
            'step_' || extract(epoch from now())::text,
            jsonb_build_object(
                'step', 'final_decision',
                'decision', p_decision,
                'admin_id', p_admin_user_id,
                'timestamp', NOW(),
                'notes', p_notes
            )
        )
    WHERE id = workflow_id;

    -- Update admin capacity
    UPDATE admin_capacity_management
    SET current_active_orders = GREATEST(current_active_orders - 1, 0),
        orders_completed_today = orders_completed_today + 1,
        orders_completed_week = orders_completed_week + 1,
        updated_at = NOW()
    WHERE admin_user_id = p_admin_user_id;

    -- Log the action
    INSERT INTO admin_actions_audit (
        admin_user_id,
        action_type,
        action_description,
        target_print_order_id,
        old_values,
        new_values,
        changes,
        justification
    ) VALUES (
        p_admin_user_id,
        CASE p_decision
            WHEN 'approve' THEN 'approve_print_order'
            WHEN 'reject' THEN 'reject_print_order'
            WHEN 'request_changes' THEN 'request_changes_print_order'
            ELSE 'review_print_order'
        END,
        'Admin completed workflow decision for print order',
        p_print_order_id,
        jsonb_build_object('old_status', current_status),
        jsonb_build_object('new_status', new_status, 'decision', p_decision, 'notes', p_notes),
        jsonb_build_object('status_change', jsonb_build_object('from', current_status, 'to', new_status)),
        'Manual admin review and decision'
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. DEFAULT BUSINESS RULES FOR PRINT ORDERS
-- =====================================================

-- Insert default business rules for print order validation
INSERT INTO admin_business_rules (
    rule_name,
    rule_description,
    conditions,
    actions,
    rule_category,
    severity,
    is_active,
    created_by_admin_id
) VALUES
(
    'high_value_order_requires_approval',
    'Print orders over $25 require admin approval',
    jsonb_build_object(
        'operator', 'and',
        'conditions', ARRAY[
            jsonb_build_object(
                'field', 'total_price',
                'operator', 'greater_than',
                'value', 25.00
            ),
            jsonb_build_object(
                'field', 'status',
                'operator', 'equals',
                'value', 'pending'
            )
        ]
    ),
    jsonb_build_object(
        'type', 'update_field',
        'field', 'requires_admin_approval',
        'value', true
    ),
    'validation',
    'medium',
    true,
    'system'
),
(
    'international_order_requires_approval',
    'International orders require admin approval',
    jsonb_build_object(
        'operator', 'and',
        'conditions', ARRAY[
            jsonb_build_object(
                'field', 'is_international',
                'operator', 'equals',
                'value', true
            ),
            jsonb_build_object(
                'field', 'status',
                'operator', 'equals',
                'value', 'pending'
            )
        ]
    ),
    jsonb_build_object(
        'actions', ARRAY[
            jsonb_build_object(
                'type', 'update_field',
                'field', 'requires_admin_approval',
                'value', true
            ),
            jsonb_build_object(
                'type', 'set_priority',
                'value', 'high'
            )
        ]
    ),
    'validation',
    'medium',
    true,
    'system'
),
(
    'escalate_overdue_reviews',
    'Escalate print orders overdue for review',
    jsonb_build_object(
        'operator', 'and',
        'conditions', ARRAY[
            jsonb_build_object(
                'field', 'status',
                'operator', 'in',
                'value', ARRAY['pending', 'awaiting_admin_review']
            ),
            jsonb_build_object(
                'field', 'created_at',
                'operator', 'older_than_hours',
                'value', 24
            )
        ]
    ),
    jsonb_build_object(
        'actions', ARRAY[
            jsonb_build_object(
                'type', 'escalate',
                'priority', 'urgent'
            ),
            jsonb_build_object(
                'type', 'notify_admins',
                'message', 'Print order overdue for review'
            )
        ]
    ),
    'escalation',
    'high',
    true,
    'system'
)
ON CONFLICT (rule_name) DO NOTHING;

-- =====================================================
-- 9. ADMIN WORKFLOW TRIGGERS
-- =====================================================

-- Trigger to automatically create workflow entries for orders requiring approval
CREATE OR REPLACE FUNCTION create_admin_workflow_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create workflow for orders that require admin approval or are high priority
    IF NEW.requires_admin_approval = true OR NEW.review_priority IN ('high', 'urgent') THEN
        INSERT INTO admin_print_order_workflow (
            print_order_id,
            current_step,
            workflow_status,
            priority
        ) VALUES (
            NEW.id,
            'initial_review',
            'active',
            COALESCE(NEW.review_priority, 'normal')
        ) ON CONFLICT (print_order_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to print_orders table
DROP TRIGGER IF EXISTS create_admin_workflow_trigger ON print_orders;
CREATE TRIGGER create_admin_workflow_trigger
    AFTER INSERT OR UPDATE ON print_orders
    FOR EACH ROW
    WHEN (NEW.requires_admin_approval = true OR NEW.review_priority IN ('high', 'urgent'))
    EXECUTE FUNCTION create_admin_workflow_on_order();

-- Trigger to update print_orders workflow data when workflow changes
CREATE OR REPLACE FUNCTION sync_print_order_workflow()
RETURNS TRIGGER AS $$
BEGIN
    -- Update print_orders with workflow assignment if changed
    IF OLD.assigned_admin_id IS DISTINCT FROM NEW.assigned_admin_id THEN
        UPDATE print_orders
        SET reviewed_by_admin_id = NEW.assigned_admin_id
        WHERE id = NEW.print_order_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to admin_print_order_workflow table
DROP TRIGGER IF EXISTS sync_workflow_trigger ON admin_print_order_workflow;
CREATE TRIGGER sync_workflow_trigger
    AFTER UPDATE ON admin_print_order_workflow
    FOR EACH ROW
    EXECUTE FUNCTION sync_print_order_workflow();

-- =====================================================
-- 10. ADMIN DASHBOARD VIEWS FOR PERFORMANCE
-- =====================================================

-- Create view for admin dashboard metrics
CREATE OR REPLACE VIEW admin_dashboard_metrics AS
SELECT
    aur.user_id as admin_user_id,
    u.display_name as admin_name,
    aur.permission_level,
    acm.current_active_orders,
    acm.max_concurrent_orders,
    acm.orders_completed_today,
    acm.orders_completed_week,
    COALESCE(apow_stats.total_assigned, 0) as total_orders_assigned,
    COALESCE(apow_stats.completed_today, 0) as completed_today,
    COALESCE(audit_stats.actions_today, 0) as actions_today,
    acm.quality_rating,
    acm.customer_satisfaction_score
FROM admin_user_roles aur
JOIN users u ON u.user_id = aur.user_id
LEFT JOIN admin_capacity_management acm ON acm.admin_user_id = aur.user_id
LEFT JOIN (
    SELECT
        apow.assigned_admin_id,
        COUNT(*) as total_assigned,
        COUNT(*) FILTER (WHERE apow.final_approval_at >= CURRENT_DATE) as completed_today
    FROM admin_print_order_workflow apow
    WHERE apow.workflow_status = 'completed'
    GROUP BY apow.assigned_admin_id
) apow_stats ON apow_stats.assigned_admin_id = aur.user_id
LEFT JOIN (
    SELECT
        aaa.admin_user_id,
        COUNT(*) as actions_today
    FROM admin_actions_audit aaa
    WHERE aaa.executed_at >= CURRENT_DATE
    GROUP BY aaa.admin_user_id
) audit_stats ON audit_stats.admin_user_id = aur.user_id
WHERE aur.is_active = true;

-- =====================================================
-- MIGRATION COMPLETION VERIFICATION
-- =====================================================

DO $$
DECLARE
    admin_table_count INTEGER;
    print_orders_enhanced BOOLEAN := false;
    workflow_functions_created BOOLEAN := false;
BEGIN
    -- Count admin workflow tables
    SELECT COUNT(*) INTO admin_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'admin_user_roles', 'admin_actions_audit', 'admin_print_order_workflow',
        'admin_capacity_management', 'admin_business_rules'
      );

    -- Check if print_orders was enhanced
    SELECT COUNT(*) > 0 INTO print_orders_enhanced
    FROM information_schema.columns
    WHERE table_name = 'print_orders' AND column_name = 'requires_admin_approval';

    -- Check if workflow functions exist
    SELECT COUNT(*) > 0 INTO workflow_functions_created
    FROM information_schema.routines
    WHERE routine_name IN ('assign_print_order_to_admin', 'complete_admin_workflow');

    RAISE NOTICE 'Comprehensive Admin Workflow Migration verification:';
    RAISE NOTICE '  - Admin workflow tables created: %/5', admin_table_count;
    RAISE NOTICE '  - Print orders enhanced: %', print_orders_enhanced;
    RAISE NOTICE '  - Workflow functions created: %', workflow_functions_created;

    IF admin_table_count >= 5 AND print_orders_enhanced AND workflow_functions_created THEN
        RAISE NOTICE '✓ Comprehensive admin workflow migration completed successfully!';
        RAISE NOTICE '🎉 Enhanced admin functions and print order relationships are now active!';
    ELSE
        RAISE NOTICE '⚠️ Some admin workflow components may not have been created properly';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION ADMIN SETUP INSTRUCTIONS
-- =====================================================

/*
After running this migration, you should:

1. Assign admin roles to users:
   INSERT INTO admin_user_roles (user_id, permission_level, assigned_by_admin_id) VALUES
   ('your-admin-user-id', 'senior_admin', 'system');

2. Configure admin capacities:
   INSERT INTO admin_capacity_management (admin_user_id) VALUES ('your-admin-user-id');

3. Test the workflow:
   -- Create a test print order with requires_admin_approval = true
   -- Verify automatic assignment in admin_print_order_workflow table
   -- Complete the workflow using complete_admin_workflow() function

4. Monitor admin performance:
   SELECT * FROM admin_dashboard_metrics;

Example usage:

-- Assign an admin role
SELECT assign_admin_role('user-id', 'senior_admin', 'system-admin-id');

-- View admin workload
SELECT * FROM admin_capacity_management WHERE admin_user_id = 'user-id';

-- Review admin actions
SELECT * FROM admin_actions_audit WHERE admin_user_id = 'user-id' ORDER BY executed_at DESC LIMIT 10;
*/
