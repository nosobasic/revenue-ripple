-- Create ai_prompts table for AI Business Insights
-- This table stores user prompts with proper indexing and RLS policies

CREATE TABLE IF NOT EXISTS ai_prompts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_prompts_user_id ON ai_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_is_active ON ai_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_created_at ON ai_prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_user_category ON ai_prompts(user_id, category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_user_active ON ai_prompts(user_id, is_active);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_ai_prompts_updated_at
    BEFORE UPDATE ON ai_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_prompts_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see their own prompts
CREATE POLICY "Users can view own prompts" ON ai_prompts
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own prompts
CREATE POLICY "Users can create own prompts" ON ai_prompts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own prompts
CREATE POLICY "Users can update own prompts" ON ai_prompts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own prompts
CREATE POLICY "Users can delete own prompts" ON ai_prompts
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add comments for documentation
COMMENT ON TABLE ai_prompts IS 'Stores AI prompts created by users for business insights';
COMMENT ON COLUMN ai_prompts.id IS 'Primary key for the prompt';
COMMENT ON COLUMN ai_prompts.user_id IS 'UUID of the user who owns this prompt';
COMMENT ON COLUMN ai_prompts.title IS 'Title of the prompt (max 200 chars)';
COMMENT ON COLUMN ai_prompts.content IS 'Full content of the prompt';
COMMENT ON COLUMN ai_prompts.category IS 'Category of the prompt (max 100 chars)';
COMMENT ON COLUMN ai_prompts.tags IS 'JSON array of tags for the prompt';
COMMENT ON COLUMN ai_prompts.is_active IS 'Whether the prompt is active (soft delete)';
COMMENT ON COLUMN ai_prompts.usage_count IS 'Number of times this prompt has been used';
COMMENT ON COLUMN ai_prompts.created_at IS 'Timestamp when the prompt was created';
COMMENT ON COLUMN ai_prompts.updated_at IS 'Timestamp when the prompt was last updated';