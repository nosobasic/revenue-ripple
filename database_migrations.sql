-- AI Personalization & Gamification Database Schema
-- Add these tables to your existing Supabase database

-- User Engagement Tracking Table
CREATE TABLE IF NOT EXISTS user_engagement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    action_type VARCHAR(100) NOT NULL, -- 'course_start', 'video_watch', 'quiz_attempt', etc.
    content_id VARCHAR(255), -- course_id, module_id, video_id, etc.
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Gamification Profile
CREATE TABLE IF NOT EXISTS user_gamification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    current_tier VARCHAR(50) DEFAULT 'bronze',
    total_achievements INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Point Transactions for Audit Trail
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    points INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Learning Streaks
CREATE TABLE IF NOT EXISTS learning_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Challenges
CREATE TABLE IF NOT EXISTS learning_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL, -- 'modules', 'quiz_scores', 'videos', etc.
    target INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'expired'
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Learning Preferences
CREATE TABLE IF NOT EXISTS user_learning_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    learning_style VARCHAR(100), -- 'visual', 'auditory', 'kinesthetic', 'reading'
    preferred_difficulty VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    preferred_session_length INTEGER, -- in minutes
    preferred_times JSONB DEFAULT '[]', -- array of preferred learning times
    content_preferences JSONB DEFAULT '{}', -- user's content preferences
    goals JSONB DEFAULT '{}', -- user's learning goals
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL, -- 'next_level', 'skill_gap', 'trending'
    course_id VARCHAR(255),
    reason TEXT,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    priority VARCHAR(50), -- 'high', 'medium', 'low'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Quiz Results Enhancement (if not exists)
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    module_id VARCHAR(255),
    quiz_id VARCHAR(255),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    time_taken_seconds INTEGER,
    answers JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Skill Assessment
CREATE TABLE IF NOT EXISTS user_skill_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_area VARCHAR(255) NOT NULL, -- 'email-marketing', 'seo', 'social-media', etc.
    proficiency_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    last_assessed TIMESTAMPTZ DEFAULT NOW(),
    assessment_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_area)
);

-- Leaderboard Views (for performance)
CREATE OR REPLACE VIEW leaderboard_all_time AS
SELECT 
    ug.user_id,
    ug.total_points,
    ug.current_tier,
    ug.total_achievements,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    ROW_NUMBER() OVER (ORDER BY ug.total_points DESC) as rank
FROM user_gamification ug
LEFT JOIN profiles p ON ug.user_id = p.id
ORDER BY ug.total_points DESC;

CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT 
    pt.user_id,
    SUM(pt.points) as weekly_points,
    COUNT(*) as activities,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    ROW_NUMBER() OVER (ORDER BY SUM(pt.points) DESC) as rank
FROM point_transactions pt
LEFT JOIN profiles p ON pt.user_id = p.id
WHERE pt.created_at >= NOW() - INTERVAL '7 days'
GROUP BY pt.user_id, p.email, p.first_name, p.last_name, p.avatar_url
ORDER BY weekly_points DESC;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_created_at ON user_engagement(created_at);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_challenges_user_id ON learning_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_challenges_status ON learning_challenges(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_course ON quiz_results(user_id, course_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users to Access Their Own Data
CREATE POLICY "Users can view own engagement data" ON user_engagement
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own gamification data" ON user_gamification
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own point transactions" ON point_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning streaks" ON learning_streaks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own challenges" ON learning_challenges
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" ON user_learning_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations" ON ai_recommendations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz results" ON quiz_results
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own skill assessments" ON user_skill_assessments
    FOR ALL USING (auth.uid() = user_id);

-- Functions for Gamification
CREATE OR REPLACE FUNCTION update_user_gamification_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total points when point transaction is added
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'point_transactions' THEN
        INSERT INTO user_gamification (user_id, total_points)
        VALUES (NEW.user_id, NEW.points)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            total_points = user_gamification.total_points + NEW.points,
            updated_at = NOW();
    END IF;
    
    -- Update achievement count when achievement is added
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'user_achievements' THEN
        UPDATE user_gamification 
        SET 
            total_achievements = total_achievements + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_gamification_points
    AFTER INSERT ON point_transactions
    FOR EACH ROW EXECUTE FUNCTION update_user_gamification_stats();

CREATE TRIGGER trigger_update_gamification_achievements
    AFTER INSERT ON user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_user_gamification_stats();

-- Sample Data for Testing (Optional)
-- You can uncomment these to add sample achievements and challenges

/*
-- Sample Achievement Data
INSERT INTO user_achievements (user_id, achievement_id) VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'first_steps'),
    ((SELECT id FROM auth.users LIMIT 1), 'knowledge_seeker');

-- Sample Point Transactions
INSERT INTO point_transactions (user_id, action, points) VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'course_completed', 100),
    ((SELECT id FROM auth.users LIMIT 1), 'module_completed', 25),
    ((SELECT id FROM auth.users LIMIT 1), 'quiz_passed', 15);

-- Sample Learning Preferences
INSERT INTO user_learning_preferences (user_id, learning_style, preferred_difficulty) VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'visual', 'intermediate');
*/

-- Views for Analytics Dashboard
CREATE OR REPLACE VIEW user_learning_analytics AS
SELECT 
    u.id as user_id,
    u.email,
    ug.total_points,
    ug.current_tier,
    ug.total_achievements,
    ls.current_streak,
    ls.longest_streak,
    COUNT(DISTINCT up.course_id) as courses_started,
    COUNT(DISTINCT CASE WHEN up.percent_done = 100 THEN up.course_id END) as courses_completed,
    AVG(up.percent_done) as avg_completion_rate,
    COUNT(DISTINCT pt.id) as total_activities,
    MAX(ue.created_at) as last_activity
FROM auth.users u
LEFT JOIN user_gamification ug ON u.id = ug.user_id
LEFT JOIN learning_streaks ls ON u.id = ls.user_id
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN point_transactions pt ON u.id = pt.user_id
LEFT JOIN user_engagement ue ON u.id = ue.user_id
GROUP BY u.id, u.email, ug.total_points, ug.current_tier, ug.total_achievements, 
         ls.current_streak, ls.longest_streak;

COMMENT ON TABLE user_engagement IS 'Tracks detailed user interactions for AI analysis';
COMMENT ON TABLE user_gamification IS 'Main gamification profile for each user';
COMMENT ON TABLE point_transactions IS 'Audit trail of all points earned by users';
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';
COMMENT ON TABLE learning_streaks IS 'Daily learning streak tracking';
COMMENT ON TABLE learning_challenges IS 'Weekly/monthly challenges for users';
COMMENT ON TABLE user_learning_preferences IS 'AI-learned user preferences and behavior';
COMMENT ON TABLE ai_recommendations IS 'AI-generated course and content recommendations';
COMMENT ON TABLE user_skill_assessments IS 'User skill proficiency tracking for personalization';