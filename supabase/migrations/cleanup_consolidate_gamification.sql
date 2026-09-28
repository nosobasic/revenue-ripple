-- Consolidation & Cleanup Migration
-- This merges duplicate gamification features and cleans up the codebase

-- ============================================================
-- 1. CONSOLIDATE ONBOARDING TABLES
-- ============================================================

-- Migrate data from old user_onboarding to new user_onboarding_state
INSERT INTO public.user_onboarding_state (user_id, completed, completed_at, data, created_at)
SELECT 
    user_id,
    has_completed,
    completed_at,
    jsonb_build_object('selected_goal', selected_goal) as data,
    created_at
FROM public.user_onboarding
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_onboarding_state 
    WHERE user_onboarding_state.user_id = user_onboarding.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Drop old onboarding table (backup data first if needed)
-- DROP TABLE IF EXISTS public.user_onboarding CASCADE;

-- ============================================================
-- 2. RENAME user_milestones TO user_achievement_milestones
-- This differentiates achievement celebrations from goal milestones
-- ============================================================

-- Rename the table to be clearer about its purpose
ALTER TABLE IF EXISTS public.user_milestones 
RENAME TO user_achievement_milestones;

-- Update indexes
DROP INDEX IF EXISTS idx_user_milestones_user_id;
DROP INDEX IF EXISTS idx_user_milestones_shown;

CREATE INDEX IF NOT EXISTS idx_user_achievement_milestones_user_id 
    ON public.user_achievement_milestones(user_id);
    
CREATE INDEX IF NOT EXISTS idx_user_achievement_milestones_shown 
    ON public.user_achievement_milestones(shown) WHERE shown = false;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own milestones" ON public.user_achievement_milestones;
DROP POLICY IF EXISTS "Users can insert their own milestones" ON public.user_achievement_milestones;
DROP POLICY IF EXISTS "Users can update their own milestones" ON public.user_achievement_milestones;

CREATE POLICY "Users can view their own achievement milestones" 
    ON public.user_achievement_milestones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievement milestones" 
    ON public.user_achievement_milestones FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement milestones" 
    ON public.user_achievement_milestones FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- 3. ADD COMMENT TO CLARIFY TABLE PURPOSES
-- ============================================================

COMMENT ON TABLE public.user_achievement_milestones IS 
'Tracks user achievements and celebrations (e.g., first course completed, halfway through education)';

COMMENT ON TABLE public.goal_milestones IS 
'Tracks sub-milestones for user-defined goals';

COMMENT ON TABLE public.user_onboarding_state IS 
'Enhanced onboarding flow with step tracking and progress data';

-- ============================================================
-- 4. CREATE VIEW FOR BACKWARD COMPATIBILITY
-- ============================================================

-- Create a view to maintain compatibility with old code
CREATE OR REPLACE VIEW public.user_milestones AS
SELECT * FROM public.user_achievement_milestones;

-- ============================================================
-- SUMMARY OF CHANGES:
-- ============================================================
-- 
-- Before:
-- - user_onboarding (simple, old)
-- - user_onboarding_state (enhanced, new) 
-- - user_milestones (achievement celebrations)
-- - goal_milestones (goal sub-tasks)
--
-- After:
-- - user_onboarding_state (primary onboarding system)
-- - user_achievement_milestones (renamed from user_milestones)
-- - goal_milestones (goal-specific milestones)
-- - user_milestones VIEW (for backward compatibility)
-- - user_onboarding (kept for backward compat, can be dropped later)
--
-- This keeps both milestone systems but clarifies their purposes:
-- - Achievement milestones = Platform-wide celebrations
-- - Goal milestones = User-specific goal tracking
-- ============================================================
