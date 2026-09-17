-- Database Schema Enhancements for Revenue Ripple
-- Run this in your Supabase SQL editor
-- Based on your existing schema, these are the missing pieces needed for the fixes

-- Add missing webhook logs table for debugging
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

-- Enhance existing referral_clicks table with missing columns
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS landing_page TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_module_completion_user_course ON user_module_completion(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_module_completion_module ON user_module_completion(module_id);
CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON commissions(referrer_username);
CREATE INDEX IF NOT EXISTS idx_commissions_email ON commissions(email);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer ON referral_clicks(referrer_username);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referrer ON referral_signups(referrer_username);
CREATE INDEX IF NOT EXISTS idx_tripwire_purchases_referrer ON tripwire_purchases(referrer_username);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);

-- Enable Row Level Security on new table
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for webhook_logs
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

-- Update existing RLS policies if needed (optional)
-- Note: Only run these if you don't already have RLS policies set up

-- Users table policies (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON users
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can manage all users') THEN
        CREATE POLICY "Admins can manage all users" ON users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;
END $$;

-- User progress policies (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can view own progress') THEN
        CREATE POLICY "Users can view own progress" ON user_progress
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can update own progress') THEN
        CREATE POLICY "Users can update own progress" ON user_progress
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- User module completion policies (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_module_completion' AND policyname = 'Users can manage own completions') THEN
        CREATE POLICY "Users can manage own completions" ON user_module_completion
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add helpful comments
COMMENT ON TABLE webhook_logs IS 'Log webhook events for debugging and monitoring';
COMMENT ON COLUMN referral_clicks.landing_page IS 'Page where the referral click occurred';
COMMENT ON COLUMN referral_clicks.converted IS 'Whether this click resulted in a conversion';

-- Optional: Add missing columns to existing tables if needed
-- Uncomment these if your tables are missing these columns:

-- For commissions table:
-- ALTER TABLE commissions ADD COLUMN IF NOT EXISTS payment_method TEXT;
-- ALTER TABLE commissions ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

-- For subscriptions table:
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;