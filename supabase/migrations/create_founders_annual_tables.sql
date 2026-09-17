-- Founders Annual Launch Database Tables
-- Run these in your Supabase SQL editor

-- Table to track Founders Annual members
CREATE TABLE IF NOT EXISTS founders_annual_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    timer_started_at TIMESTAMPTZ,
    spot_number INTEGER,
    bonuses_delivered JSONB DEFAULT '{"welcome_email": false, "discord_invite": false, "vault_access": false, "onboarding_scheduled": false, "reminder_sent": false}'::jsonb,
    referrer_username TEXT,
    amount_paid NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track timer starts (for users browsing before purchase)
CREATE TABLE IF NOT EXISTS founders_timer_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier TEXT NOT NULL, -- email or anonymous ID
    timer_started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    page_visits INTEGER DEFAULT 1,
    converted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add founders-specific columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add is_founder column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_founder') THEN
        ALTER TABLE users ADD COLUMN is_founder BOOLEAN DEFAULT false;
    END IF;
    
    -- Add subscription_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='subscription_type') THEN
        ALTER TABLE users ADD COLUMN subscription_type TEXT;
    END IF;
    
    -- Add founder_benefits column to track delivered bonuses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='founder_benefits') THEN
        ALTER TABLE users ADD COLUMN founder_benefits JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_founders_annual_user_id ON founders_annual_members(user_id);
CREATE INDEX IF NOT EXISTS idx_founders_annual_email ON founders_annual_members(email);
CREATE INDEX IF NOT EXISTS idx_founders_annual_active ON founders_annual_members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_founders_annual_purchased_at ON founders_annual_members(purchased_at);
CREATE INDEX IF NOT EXISTS idx_founders_timer_identifier ON founders_timer_tracking(user_identifier);
CREATE INDEX IF NOT EXISTS idx_founders_timer_converted ON founders_timer_tracking(converted);

-- Function to automatically assign spot numbers
CREATE OR REPLACE FUNCTION assign_founder_spot_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Assign spot number sequentially (1-20 for marketing)
    SELECT COALESCE(MAX(spot_number), 0) + 1 INTO NEW.spot_number
    FROM founders_annual_members
    WHERE spot_number IS NOT NULL;
    
    -- Calculate expiry (1 year from purchase)
    NEW.expires_at := NEW.purchased_at + INTERVAL '1 year';
    
    -- Calculate timer expiry (3 days from timer start)
    IF NEW.timer_started_at IS NOT NULL THEN
        NEW.expires_at := NEW.purchased_at + INTERVAL '1 year';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign spot numbers on insert
DROP TRIGGER IF EXISTS trigger_assign_founder_spot ON founders_annual_members;
CREATE TRIGGER trigger_assign_founder_spot
    BEFORE INSERT ON founders_annual_members
    FOR EACH ROW
    EXECUTE FUNCTION assign_founder_spot_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_founders_annual_updated_at ON founders_annual_members;
CREATE TRIGGER trigger_founders_annual_updated_at
    BEFORE UPDATE ON founders_annual_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_founders_timer_updated_at ON founders_timer_tracking;
CREATE TRIGGER trigger_founders_timer_updated_at
    BEFORE UPDATE ON founders_timer_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE founders_annual_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_timer_tracking ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own data
CREATE POLICY "Users can view their own founder membership"
    ON founders_annual_members FOR SELECT
    USING (auth.uid() = user_id);

-- Allow service role to do everything (for backend operations)
CREATE POLICY "Service role has full access to founders_annual_members"
    ON founders_annual_members FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to founders_timer_tracking"
    ON founders_timer_tracking FOR ALL
    USING (auth.role() = 'service_role');

-- Allow anonymous users to read timer tracking (for countdown display)
CREATE POLICY "Anyone can read timer tracking"
    ON founders_timer_tracking FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert timer tracking"
    ON founders_timer_tracking FOR INSERT
    WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE founders_annual_members IS 'Tracks Founders Annual subscription purchases and bonus delivery status';
COMMENT ON TABLE founders_timer_tracking IS 'Tracks 3-day countdown timer for evergreen urgency';
COMMENT ON COLUMN founders_annual_members.spot_number IS 'Sequential spot number (1-20) for marketing scarcity display';
COMMENT ON COLUMN founders_annual_members.bonuses_delivered IS 'JSON tracking which founder bonuses have been delivered';

