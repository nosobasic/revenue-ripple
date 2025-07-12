-- Affiliate Section Database Tables
-- Run these in your Supabase SQL editor

-- Affiliate Training Progress table
CREATE TABLE IF NOT EXISTS affiliate_training_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL CHECK (step_number >= 1 AND step_number <= 6),
    step_title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    resources_accessed TEXT[],
    estimated_time_spent INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, step_number)
);

-- Affiliate Performance Metrics table
CREATE TABLE IF NOT EXISTS affiliate_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    funnel_type TEXT NOT NULL, -- 'marketing_potential', 'dmd_book', 'traffic_power'
    
    -- Landing Page Metrics
    landing_page_views INTEGER DEFAULT 0,
    landing_page_conversions INTEGER DEFAULT 0,
    landing_page_conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Email Metrics
    email_subscribers INTEGER DEFAULT 0,
    email_opens INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    email_open_rate DECIMAL(5,2) DEFAULT 0.00,
    email_click_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Traffic Metrics
    total_traffic INTEGER DEFAULT 0,
    organic_traffic INTEGER DEFAULT 0,
    paid_traffic INTEGER DEFAULT 0,
    social_traffic INTEGER DEFAULT 0,
    referral_traffic INTEGER DEFAULT 0,
    
    -- Conversion Metrics
    total_conversions INTEGER DEFAULT 0,
    conversion_value DECIMAL(10,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, metric_date, funnel_type)
);

-- Marketing Materials Usage table
CREATE TABLE IF NOT EXISTS marketing_materials_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL, -- corresponds to material ID in AffiliateTools
    material_title TEXT NOT NULL,
    material_type TEXT NOT NULL, -- 'ebook', 'template', 'guide', 'email_series'
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    format_downloaded TEXT, -- 'PDF', 'ZIP', 'TXT'
    usage_context TEXT, -- 'lead_magnet', 'email_campaign', 'social_media'
    performance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Link Performance table
CREATE TABLE IF NOT EXISTS affiliate_link_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    link_id TEXT NOT NULL,
    campaign_name TEXT,
    link_url TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    
    -- Performance Metrics
    total_clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Attribution
    traffic_source TEXT, -- 'email', 'social', 'organic', 'paid', 'direct'
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Tracking
    first_click_at TIMESTAMPTZ,
    last_click_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, link_id)
);

-- Enhanced Earnings and Payouts table
CREATE TABLE IF NOT EXISTS affiliate_earnings_detailed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    commission_id UUID REFERENCES commissions(id), -- Link to existing commissions table
    
    -- Earnings Details
    earning_type TEXT NOT NULL, -- 'commission', 'bonus', 'recurring', 'one_time'
    product_type TEXT NOT NULL, -- 'membership', 'ebook', 'reseller', 'dmd_book'
    gross_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    
    -- Funnel Attribution
    funnel_type TEXT, -- 'marketing_potential', 'dmd_book', 'traffic_power'
    conversion_step TEXT, -- 'lead_magnet', 'email_sequence', 'direct_sale'
    
    -- Payout Information
    payout_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
    payout_batch_id UUID,
    payout_date TIMESTAMPTZ,
    payout_method TEXT, -- 'paypal', 'stripe', 'wire_transfer'
    
    -- Tracking
    earned_at TIMESTAMPTZ NOT NULL,
    cleared_at TIMESTAMPTZ, -- 30 days from earned_at
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Funnel Setup table
CREATE TABLE IF NOT EXISTS affiliate_funnel_setup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    funnel_name TEXT NOT NULL,
    funnel_type TEXT NOT NULL, -- 'marketing_potential', 'dmd_book', 'traffic_power'
    
    -- Setup Configuration
    landing_page_url TEXT,
    lead_magnet_title TEXT,
    autoresponder_service TEXT, -- 'getresponse', 'mailchimp', 'convertkit'
    autoresponder_list_id TEXT,
    
    -- Email Sequences
    indoctrination_sequence_loaded BOOLEAN DEFAULT false,
    dmd_lessons_loaded BOOLEAN DEFAULT false, -- 26 bi-weekly lessons
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    setup_completed_at TIMESTAMPTZ,
    last_optimization_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, funnel_type)
);

-- Affiliate Goals and Targets table
CREATE TABLE IF NOT EXISTS affiliate_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'monthly_earnings', 'conversions', 'traffic', 'email_subscribers'
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_training_progress_user_id ON affiliate_training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_training_progress_step ON affiliate_training_progress(step_number);
CREATE INDEX IF NOT EXISTS idx_affiliate_performance_metrics_user_id ON affiliate_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_performance_metrics_date ON affiliate_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_affiliate_performance_metrics_funnel ON affiliate_performance_metrics(funnel_type);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_usage_user_id ON marketing_materials_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_usage_material ON marketing_materials_usage(material_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_link_performance_user_id ON affiliate_link_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_link_performance_source ON affiliate_link_performance(traffic_source);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_detailed_user_id ON affiliate_earnings_detailed(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_detailed_type ON affiliate_earnings_detailed(earning_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_detailed_status ON affiliate_earnings_detailed(payout_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_funnel_setup_user_id ON affiliate_funnel_setup(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_funnel_setup_type ON affiliate_funnel_setup(funnel_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_goals_user_id ON affiliate_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_goals_type ON affiliate_goals(goal_type);

-- Row Level Security (RLS) policies
ALTER TABLE affiliate_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_materials_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_link_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_earnings_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_funnel_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_goals ENABLE ROW LEVEL SECURITY;

-- Policies for affiliate training progress
CREATE POLICY "Users can manage their own training progress"
ON affiliate_training_progress
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all training progress"
ON affiliate_training_progress
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policies for affiliate performance metrics
CREATE POLICY "Users can manage their own performance metrics"
ON affiliate_performance_metrics
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all performance metrics"
ON affiliate_performance_metrics
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policies for marketing materials usage
CREATE POLICY "Users can manage their own materials usage"
ON marketing_materials_usage
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all materials usage"
ON marketing_materials_usage
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policies for affiliate link performance
CREATE POLICY "Users can manage their own link performance"
ON affiliate_link_performance
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all link performance"
ON affiliate_link_performance
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policies for affiliate earnings detailed
CREATE POLICY "Users can view their own earnings"
ON affiliate_earnings_detailed
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all earnings"
ON affiliate_earnings_detailed
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policies for affiliate funnel setup
CREATE POLICY "Users can manage their own funnel setup"
ON affiliate_funnel_setup
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all funnel setups"
ON affiliate_funnel_setup
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policies for affiliate goals
CREATE POLICY "Users can manage their own goals"
ON affiliate_goals
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all goals"
ON affiliate_goals
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_affiliate_training_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_affiliate_performance_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_marketing_materials_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_affiliate_link_performance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_affiliate_earnings_detailed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_affiliate_funnel_setup_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_affiliate_training_progress_timestamp
    BEFORE UPDATE ON affiliate_training_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_training_progress_timestamp();

CREATE TRIGGER update_affiliate_performance_metrics_timestamp
    BEFORE UPDATE ON affiliate_performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_performance_metrics_timestamp();

CREATE TRIGGER update_marketing_materials_usage_timestamp
    BEFORE UPDATE ON marketing_materials_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_marketing_materials_usage_timestamp();

CREATE TRIGGER update_affiliate_link_performance_timestamp
    BEFORE UPDATE ON affiliate_link_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_link_performance_timestamp();

CREATE TRIGGER update_affiliate_earnings_detailed_timestamp
    BEFORE UPDATE ON affiliate_earnings_detailed
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_earnings_detailed_timestamp();

CREATE TRIGGER update_affiliate_funnel_setup_timestamp
    BEFORE UPDATE ON affiliate_funnel_setup
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_funnel_setup_timestamp();

-- Insert sample data for the 6-step training process
INSERT INTO affiliate_training_progress (user_id, step_number, step_title, is_completed, resources_accessed, estimated_time_spent) VALUES
    (NULL, 1, 'Start with the Basics', false, ARRAY['Unlock Your Marketing Potential', 'Unleash the Power of Traffic'], 180),
    (NULL, 2, 'Set Up Your Funnel', false, ARRAY['GetResponse Setup Guide', 'Membership Mastery Bundle', 'Landing Page Templates'], 300),
    (NULL, 3, 'Scale Your Marketing', false, ARRAY['DMD Landing Page Template', 'Scaling Strategies Guide'], 240),
    (NULL, 4, 'Access Advanced Tools', false, ARRAY['DMD Affiliate Sign-up', 'Unique Affiliate Link', 'Advanced Marketing Tools'], 120),
    (NULL, 5, 'Automate Your Success', false, ARRAY['Indoctrination Sequence Template', '26 Bi-weekly Lessons', 'Autoresponder Setup Guide'], 180),
    (NULL, 6, 'Drive Traffic', false, ARRAY['Traffic Generation Strategies', 'Traffic Tracking Tools'], 0)
ON CONFLICT (user_id, step_number) DO NOTHING;

-- Insert sample marketing materials
INSERT INTO marketing_materials_usage (user_id, material_id, material_title, material_type, download_count, format_downloaded, usage_context) VALUES
    (NULL, 1, 'Membership Mastery', 'ebook', 0, 'PDF', 'lead_magnet'),
    (NULL, 2, 'Unlock Your Marketing Potential', 'ebook', 0, 'PDF', 'lead_magnet'),
    (NULL, 3, 'Unleash the Power of Traffic', 'ebook', 0, 'PDF', 'lead_magnet'),
    (NULL, 4, 'Digital Marketing Domination Email Series', 'email_series', 0, 'ZIP', 'email_campaign'),
    (NULL, 5, 'Social Media Secrets', 'template', 0, 'PNG', 'social_media')
ON CONFLICT DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE affiliate_training_progress IS 'Tracks affiliate progress through the 6-step training process';
COMMENT ON TABLE affiliate_performance_metrics IS 'Daily performance metrics for affiliate funnels and campaigns';
COMMENT ON TABLE marketing_materials_usage IS 'Tracks usage of marketing materials and resources';
COMMENT ON TABLE affiliate_link_performance IS 'Performance tracking for affiliate links and campaigns';
COMMENT ON TABLE affiliate_earnings_detailed IS 'Detailed earnings tracking with funnel attribution';
COMMENT ON TABLE affiliate_funnel_setup IS 'Configuration and setup tracking for affiliate funnels';
COMMENT ON TABLE affiliate_goals IS 'Goal setting and tracking for affiliates';