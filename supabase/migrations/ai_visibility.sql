-- AI Visibility Feature Database Tables
-- Run this in your Supabase SQL editor after database_schema.sql

-- Business profiles for AI visibility tracking
CREATE TABLE IF NOT EXISTS ai_visibility_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_url TEXT,
    industry TEXT NOT NULL,
    niche_keywords TEXT[] DEFAULT '{}',
    visibility_score INTEGER DEFAULT 0,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Competitors being tracked per profile
CREATE TABLE IF NOT EXISTS ai_visibility_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES ai_visibility_profiles(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    competitor_url TEXT,
    visibility_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industry-specific prompts library (shared across all users)
CREATE TABLE IF NOT EXISTS ai_visibility_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_text TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general',
    industry TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visibility check results (cached daily)
CREATE TABLE IF NOT EXISTS ai_visibility_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES ai_visibility_prompts(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    ai_platform TEXT NOT NULL DEFAULT 'openai',
    appears BOOLEAN NOT NULL,
    position INTEGER,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    snippet TEXT,
    samples_taken INTEGER DEFAULT 1,
    checked_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_id, business_name, ai_platform, checked_at)
);

-- User's tracked prompts (which prompts a user is monitoring)
CREATE TABLE IF NOT EXISTS ai_visibility_tracked_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES ai_visibility_profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES ai_visibility_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, prompt_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_visibility_profiles_user_id ON ai_visibility_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_competitors_profile_id ON ai_visibility_competitors(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_prompts_industry ON ai_visibility_prompts(industry);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_prompts_category ON ai_visibility_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_results_prompt_id ON ai_visibility_results(prompt_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_results_business ON ai_visibility_results(business_name);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_results_checked_at ON ai_visibility_results(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_tracked_prompts_profile ON ai_visibility_tracked_prompts(profile_id);

-- Enable Row Level Security
ALTER TABLE ai_visibility_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_tracked_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can only see/manage their own profile
CREATE POLICY "Users can view own visibility profile"
    ON ai_visibility_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own visibility profile"
    ON ai_visibility_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visibility profile"
    ON ai_visibility_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visibility profile"
    ON ai_visibility_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Competitors: users can manage competitors for their own profile
CREATE POLICY "Users can view own competitors"
    ON ai_visibility_competitors FOR SELECT
    USING (profile_id IN (SELECT id FROM ai_visibility_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own competitors"
    ON ai_visibility_competitors FOR ALL
    USING (profile_id IN (SELECT id FROM ai_visibility_profiles WHERE user_id = auth.uid()));

-- Prompts: everyone can read prompts (shared library)
CREATE POLICY "Anyone can view prompts"
    ON ai_visibility_prompts FOR SELECT
    USING (true);

-- Results: everyone can read cached results (shared for efficiency)
CREATE POLICY "Anyone can view visibility results"
    ON ai_visibility_results FOR SELECT
    USING (true);

CREATE POLICY "Service can insert results"
    ON ai_visibility_results FOR INSERT
    WITH CHECK (true);

-- Tracked prompts: users can manage their own tracked prompts
CREATE POLICY "Users can view own tracked prompts"
    ON ai_visibility_tracked_prompts FOR SELECT
    USING (profile_id IN (SELECT id FROM ai_visibility_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own tracked prompts"
    ON ai_visibility_tracked_prompts FOR ALL
    USING (profile_id IN (SELECT id FROM ai_visibility_profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_ai_visibility_profiles_updated_at 
    BEFORE UPDATE ON ai_visibility_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert starter prompts for common industries
INSERT INTO ai_visibility_prompts (prompt_text, category, industry) VALUES
    ('What are the best marketing agencies?', 'comparison', 'marketing'),
    ('Recommend a digital marketing consultant', 'recommendation', 'marketing'),
    ('Who are the top SEO experts?', 'comparison', 'marketing'),
    ('Best social media marketing companies', 'comparison', 'marketing'),
    ('Top email marketing services', 'comparison', 'marketing'),
    ('Best business coaches', 'comparison', 'coaching'),
    ('Who are the top executive coaches?', 'comparison', 'coaching'),
    ('Recommend a life coach', 'recommendation', 'coaching'),
    ('Best leadership coaching programs', 'comparison', 'coaching'),
    ('Top SaaS tools for small business', 'comparison', 'saas'),
    ('Best CRM software', 'comparison', 'saas'),
    ('Recommend a project management tool', 'recommendation', 'saas'),
    ('Top AI tools for business', 'comparison', 'technology'),
    ('Best automation software', 'comparison', 'technology'),
    ('Recommend a web design agency', 'recommendation', 'design'),
    ('Best graphic design services', 'comparison', 'design'),
    ('Top ecommerce platforms', 'comparison', 'ecommerce'),
    ('Best online store builders', 'comparison', 'ecommerce'),
    ('Recommend a real estate agent', 'recommendation', 'realestate'),
    ('Best financial advisors', 'comparison', 'finance')
ON CONFLICT (prompt_text) DO NOTHING;
