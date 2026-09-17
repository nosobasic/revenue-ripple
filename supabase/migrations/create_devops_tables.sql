-- DevOps Integration Database Tables
-- Run these in your Supabase SQL editor

-- API Keys table for DevOps integration
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id)
);

-- Webhook log table for DevOps events
CREATE TABLE IF NOT EXISTS webhook_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

-- Activity log table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_log_source ON webhook_log(source);
CREATE INDEX IF NOT EXISTS idx_webhook_log_event_type ON webhook_log(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_log_created_at ON webhook_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for API keys - only admins can manage
CREATE POLICY "Admin users can manage API keys"
ON api_keys
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policy for webhook log - only service role can write, admins can read
CREATE POLICY "Service role can write webhook logs"
ON webhook_log
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin users can read webhook logs"
ON webhook_log
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policy for activity log - users can see their own, admins can see all
CREATE POLICY "Users can view own activity"
ON activity_log
FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Service role can insert activity"
ON activity_log
FOR INSERT
WITH CHECK (true);

-- Insert some sample activity data
INSERT INTO activity_log (user_id, type, description, metadata) VALUES
    (NULL, 'system', 'DevOps integration initialized', '{"source": "devops_module"}'),
    (NULL, 'deployment', 'Production deployment completed', '{"version": "1.0.0", "status": "success"}'),
    (NULL, 'alert', 'High memory usage detected', '{"threshold": "85%", "current": "92%"}')
ON CONFLICT DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE api_keys IS 'API keys for third-party integrations like DevOps module';
COMMENT ON TABLE webhook_log IS 'Log of incoming webhooks from external services';
COMMENT ON TABLE activity_log IS 'System and user activity tracking';