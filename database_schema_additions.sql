-- Additional Database Tables for Revenue Ripple Fixes
-- Run this in your Supabase SQL editor
-- Note: This assumes you already have a 'users' table with the correct structure

-- Course progress tracking
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    module_id TEXT,
    completed_modules TEXT[] DEFAULT '{}',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_slug)
);

-- Referral clicks tracking (if not exists)
CREATE TABLE IF NOT EXISTS referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_username TEXT NOT NULL,
    landing_page TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    ip_address INET,
    converted BOOLEAN DEFAULT FALSE,
    conversion_type TEXT
);

-- Webhook logs for debugging (if not exists)
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- 'stripe', 'other'
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course_slug ON course_progress(course_slug);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer ON referral_clicks(referrer_username);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Enable Row Level Security
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Course progress policies
CREATE POLICY "Users can view own progress" ON course_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON course_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON course_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Referral clicks policies
CREATE POLICY "Users can view own referral clicks" ON referral_clicks
    FOR SELECT USING (
        referrer_username = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Anyone can insert referral clicks" ON referral_clicks
    FOR INSERT WITH CHECK (true);

-- Webhook logs policies
CREATE POLICY "Admins can view webhook logs" ON webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Service role can insert webhook logs" ON webhook_logs
    FOR INSERT WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE course_progress IS 'Track user progress through courses and modules';
COMMENT ON TABLE referral_clicks IS 'Track affiliate referral clicks for commission attribution';
COMMENT ON TABLE webhook_logs IS 'Log webhook events for debugging and monitoring';

-- Update existing tables if they need new columns (optional - only run if needed)

-- Add missing columns to existing tables (uncomment if needed):
-- ALTER TABLE commissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled'));
-- ALTER TABLE commissions ADD COLUMN IF NOT EXISTS payment_method TEXT;
-- ALTER TABLE commissions ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired'));
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;