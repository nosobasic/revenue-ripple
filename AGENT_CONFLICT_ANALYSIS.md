# Agent Feature Conflict Analysis

## Proposed Tables vs Existing Schema

### Proposed Agent Tables
- `agent_catalog`
- `agent_instances` 
- `agent_credentials`
- `agent_runs`
- `agent_alerts`
- `usage_counters`

### Existing Tables Analysis

#### ✅ No Conflicts Found
Based on the SQL files and server.py analysis, **no existing tables conflict** with the proposed agent tables.

#### Existing Table Names
```
users
tripwire_purchases
subscriptions
founders_annual_members
commissions
payouts
webhook_logs
user_progress
user_module_completion
user_onboarding
user_milestones
feature_waitlist
book_giveaway_submissions
api_keys
activity_log
founders_timer_tracking
```

#### Recommended Naming Convention
Since no conflicts exist, we can use the proposed names directly:
- `agent_catalog` ✅
- `agent_instances` ✅  
- `agent_credentials` ✅
- `agent_runs` ✅
- `agent_alerts` ✅
- `usage_counters` ✅

**Alternative**: If you prefer the `rr_` prefix for consistency:
- `rr_agent_catalog`
- `rr_agent_instances`
- `rr_agent_credentials`
- `rr_agent_runs`
- `rr_agent_alerts`
- `rr_usage_counters`

## Schema Compatibility Analysis

### Existing Patterns to Follow
1. **UUID Primary Keys**: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
2. **User References**: `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
3. **Timestamps**: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
4. **RLS Policies**: Enable RLS on all new tables
5. **Indexes**: Create indexes on foreign keys and frequently queried columns

### Recommended Schema Structure

```sql
-- Agent Catalog (available agents)
CREATE TABLE agent_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    config_schema JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Instances (user's configured agents)
CREATE TABLE agent_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    catalog_id UUID NOT NULL REFERENCES agent_catalog(id),
    name TEXT NOT NULL,
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Credentials (encrypted credentials)
CREATE TABLE agent_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
    credential_type TEXT NOT NULL,
    encrypted_data TEXT NOT NULL, -- encrypted JSON
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Runs (execution history)
CREATE TABLE agent_runs (
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

-- Agent Alerts (notifications)
CREATE TABLE agent_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_id UUID REFERENCES agent_instances(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Counters (rate limiting)
CREATE TABLE usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    counter_type TEXT NOT NULL, -- 'daily_runs', 'monthly_runs', etc.
    count INTEGER DEFAULT 0,
    reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, counter_type)
);
```

## RLS Policy Recommendations

### Standard Policies for All Tables
```sql
-- Enable RLS
ALTER TABLE agent_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own agent data" ON agent_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credentials" ON agent_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own runs" ON agent_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own alerts" ON agent_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON usage_counters FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can create own instances" ON agent_instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can create own credentials" ON agent_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can create own runs" ON agent_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can create own alerts" ON agent_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can create own usage" ON usage_counters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own instances" ON agent_instances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credentials" ON agent_credentials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own runs" ON agent_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON agent_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_counters FOR UPDATE USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access" ON agent_catalog FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access instances" ON agent_instances FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access credentials" ON agent_credentials FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access runs" ON agent_runs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access alerts" ON agent_alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access usage" ON usage_counters FOR ALL USING (auth.role() = 'service_role');
```

## Index Recommendations

```sql
-- Performance indexes
CREATE INDEX idx_agent_instances_user_id ON agent_instances(user_id);
CREATE INDEX idx_agent_instances_catalog_id ON agent_instances(catalog_id);
CREATE INDEX idx_agent_credentials_user_id ON agent_credentials(user_id);
CREATE INDEX idx_agent_credentials_instance_id ON agent_credentials(instance_id);
CREATE INDEX idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX idx_agent_runs_instance_id ON agent_runs(instance_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_started_at ON agent_runs(started_at);
CREATE INDEX idx_agent_alerts_user_id ON agent_alerts(user_id);
CREATE INDEX idx_agent_alerts_instance_id ON agent_alerts(instance_id);
CREATE INDEX idx_agent_alerts_is_read ON agent_alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_usage_counters_user_id ON usage_counters(user_id);
CREATE INDEX idx_usage_counters_type ON usage_counters(counter_type);
```

## Migration Strategy

### Phase 1: Schema Creation
1. Create all tables with `CREATE TABLE IF NOT EXISTS`
2. Add indexes with `CREATE INDEX IF NOT EXISTS`
3. Enable RLS on all tables
4. Create RLS policies

### Phase 2: Feature Flag Integration
1. Add `REVRIPPLE_COMMAND_CENTER_ENABLED` environment variable
2. Create stub API endpoints
3. Add frontend feature flag checks

### Phase 3: Gradual Rollout
1. Start with read-only operations
2. Add write operations behind feature flag
3. Enable for specific user groups
4. Full rollout after testing
