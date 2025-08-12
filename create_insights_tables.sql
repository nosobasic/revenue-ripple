-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insights usage tracking table
CREATE TABLE IF NOT EXISTS insights_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    month date NOT NULL, -- first day of the month
    prompts_queries int NOT NULL DEFAULT 0,
    suggestions_queries int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, month)
);

-- Insights daily cache table
CREATE TABLE IF NOT EXISTS insight_daily_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    business_id uuid NULL,
    day date NOT NULL, -- date in user's TZ or UTC
    title text NULL, -- short headline
    suggestion text NOT NULL, -- full text
    source text NOT NULL, -- e.g., "top_suggestion" | "generated"
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, day, business_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_insights_usage_user_month ON insights_usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_insight_daily_cache_user_day ON insight_daily_cache(user_id, day);
CREATE INDEX IF NOT EXISTS idx_insight_daily_cache_user_business_day ON insight_daily_cache(user_id, business_id, day);

-- Add RLS policies
ALTER TABLE insights_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_daily_cache ENABLE ROW LEVEL SECURITY;

-- RLS policy for insights_usage - users can only see their own usage
CREATE POLICY "Users can view their own insights usage" ON insights_usage
    FOR ALL USING (auth.uid() = user_id);

-- RLS policy for insight_daily_cache - users can only see their own cache entries
CREATE POLICY "Users can view their own insight daily cache" ON insight_daily_cache
    FOR ALL USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insights_usage_updated_at 
    BEFORE UPDATE ON insights_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
