-- Enhanced Onboarding Database Tables
-- Run these in your Supabase SQL editor

-- User onboarding tracking table
CREATE TABLE IF NOT EXISTS user_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    has_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    selected_goal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User milestone tracking table
CREATE TABLE IF NOT EXISTS user_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL,
    milestone_value TEXT,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    shown BOOLEAN DEFAULT false,
    shown_at TIMESTAMPTZ
);

-- Waitlist tracking for future features
CREATE TABLE IF NOT EXISTS feature_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    email_sent BOOLEAN DEFAULT false,
    UNIQUE(user_id, feature_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_shown ON user_milestones(shown) WHERE shown = false;
CREATE INDEX IF NOT EXISTS idx_feature_waitlist_user_id ON feature_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_waitlist_feature ON feature_waitlist(feature_name);

-- Row Level Security (RLS) policies
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write their own onboarding data
CREATE POLICY "Users can view their own onboarding"
    ON user_onboarding FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding"
    ON user_onboarding FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
    ON user_onboarding FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to read/write their own milestones
CREATE POLICY "Users can view their own milestones"
    ON user_milestones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
    ON user_milestones FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
    ON user_milestones FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to read/write their own waitlist entries
CREATE POLICY "Users can view their own waitlist entries"
    ON feature_waitlist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waitlist entries"
    ON feature_waitlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_onboarding
CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

