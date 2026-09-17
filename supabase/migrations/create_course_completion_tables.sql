-- Course Completion Tracking Database Tables
-- Run these in your Supabase SQL editor

-- User progress table - tracks overall course progress
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    percent_done INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- User module completion table - tracks individual module completion
CREATE TABLE IF NOT EXISTS user_module_completion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id, module_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_module_completion_user_id ON user_module_completion(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_completion_course_id ON user_module_completion(course_id);
CREATE INDEX IF NOT EXISTS idx_user_module_completion_completed ON user_module_completion(completed) WHERE completed = true;

-- Row Level Security (RLS) policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_completion ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own progress
CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to read/write their own module completion
CREATE POLICY "Users can view their own module completion"
    ON user_module_completion FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module completion"
    ON user_module_completion FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completion"
    ON user_module_completion FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_progress
CREATE TRIGGER update_user_progress_timestamp BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_progress_timestamp();


