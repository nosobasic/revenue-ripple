-- Command Center Agent Tables Migration
-- Safe, non-destructive schema changes
-- Run this in your Supabase SQL editor

-- 1. Agent Catalog (available agents)
CREATE TABLE IF NOT EXISTS agent_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    config_schema JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agent Instances (user's configured agents)
CREATE TABLE IF NOT EXISTS agent_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    catalog_id UUID NOT NULL REFERENCES agent_catalog(id),
    name TEXT NOT NULL,
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agent Credentials (encrypted credentials)
CREATE TABLE IF NOT EXISTS agent_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
    credential_type TEXT NOT NULL,
    encrypted_data TEXT NOT NULL, -- encrypted JSON
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agent Runs (execution history)
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    output_json JSONB,
    error_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Agent Alerts (notifications)
CREATE TABLE IF NOT EXISTS agent_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_id UUID REFERENCES agent_instances(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Usage Counters (rate limiting)
CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    counter_type TEXT NOT NULL, -- 'daily_runs', 'monthly_runs', etc.
    count INTEGER DEFAULT 0,
    reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, counter_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_instances_user_id ON agent_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_instances_catalog_id ON agent_instances(catalog_id);
CREATE INDEX IF NOT EXISTS idx_agent_credentials_user_id ON agent_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_credentials_instance_id ON agent_credentials(instance_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_instance_id ON agent_runs(instance_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_agent_alerts_user_id ON agent_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_alerts_instance_id ON agent_alerts(instance_id);
CREATE INDEX IF NOT EXISTS idx_agent_alerts_is_read ON agent_alerts(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_id ON usage_counters(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_type ON usage_counters(counter_type);

-- Enable Row Level Security
ALTER TABLE agent_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_catalog (read-only for users)
CREATE POLICY "Anyone can read agent catalog" ON agent_catalog FOR SELECT USING (true);
CREATE POLICY "Service role can manage catalog" ON agent_catalog FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for agent_instances
CREATE POLICY "Users can view own instances" ON agent_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own instances" ON agent_instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own instances" ON agent_instances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own instances" ON agent_instances FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access instances" ON agent_instances FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for agent_credentials
CREATE POLICY "Users can view own credentials" ON agent_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own credentials" ON agent_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credentials" ON agent_credentials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credentials" ON agent_credentials FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access credentials" ON agent_credentials FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for agent_runs
CREATE POLICY "Users can view own runs" ON agent_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own runs" ON agent_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own runs" ON agent_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access runs" ON agent_runs FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for agent_alerts
CREATE POLICY "Users can view own alerts" ON agent_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alerts" ON agent_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON agent_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access alerts" ON agent_alerts FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for usage_counters
CREATE POLICY "Users can view own usage" ON usage_counters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own usage" ON usage_counters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_counters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access usage" ON usage_counters FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_agent_catalog_updated_at 
    BEFORE UPDATE ON agent_catalog
    FOR EACH ROW EXECUTE FUNCTION update_agent_updated_at_column();

CREATE TRIGGER update_agent_instances_updated_at 
    BEFORE UPDATE ON agent_instances
    FOR EACH ROW EXECUTE FUNCTION update_agent_updated_at_column();

CREATE TRIGGER update_agent_credentials_updated_at 
    BEFORE UPDATE ON agent_credentials
    FOR EACH ROW EXECUTE FUNCTION update_agent_updated_at_column();

CREATE TRIGGER update_usage_counters_updated_at 
    BEFORE UPDATE ON usage_counters
    FOR EACH ROW EXECUTE FUNCTION update_agent_updated_at_column();

-- Insert sample agent catalog data
INSERT INTO agent_catalog (name, description, category, config_schema) VALUES
('Daily Pulse', 'Daily business metrics and insights', 'analytics', '{"metrics": ["revenue", "conversions", "traffic"], "frequency": "daily"}'),
('Weekly Report', 'Weekly performance summary', 'reporting', '{"sections": ["sales", "marketing", "operations"], "format": "pdf"}'),
('Lead Scraper', 'Extract leads from various sources', 'data_collection', '{"sources": ["linkedin", "google", "directory"], "filters": ["location", "industry"]}'),
('Social Media Monitor', 'Monitor brand mentions and sentiment', 'monitoring', '{"platforms": ["twitter", "facebook", "instagram"], "keywords": ["brand_name", "competitors"]}')
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE agent_catalog IS 'Available agent types that users can configure';
COMMENT ON TABLE agent_instances IS 'User-configured agent instances with custom settings';
COMMENT ON TABLE agent_credentials IS 'Encrypted credentials for agent integrations';
COMMENT ON TABLE agent_runs IS 'Execution history and results of agent runs';
COMMENT ON TABLE agent_alerts IS 'Notifications and alerts from agent executions';
COMMENT ON TABLE usage_counters IS 'Rate limiting and usage tracking for agent executions';
