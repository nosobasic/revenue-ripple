-- Agentic AI Assistant Features Migration
-- Creates tables for goals, quizzes, feature tours, and enhanced onboarding

-- ============================================================
-- USER GOALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'course_completion', 'revenue_target', 'skill_mastery', 'custom'
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC, -- e.g., revenue target, number of courses
    current_value NUMERIC DEFAULT 0,
    target_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    priority INTEGER DEFAULT 1, -- 1 (high) to 5 (low)
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional goal-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_priority ON public.user_goals(priority);
CREATE INDEX IF NOT EXISTS idx_user_goals_target_date ON public.user_goals(target_date);

-- ============================================================
-- GOAL MILESTONES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.goal_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON public.goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_completed ON public.goal_milestones(completed);

-- ============================================================
-- COURSE QUIZZES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- Array of question objects with answers
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_course_quizzes_course_id ON public.course_quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_module_id ON public.course_quizzes(module_id);

-- ============================================================
-- USER QUIZ RESPONSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    answers JSONB NOT NULL, -- User's answers
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1,
    feedback JSONB, -- Detailed feedback per question
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_quiz_responses_user_id ON public.user_quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_responses_quiz_id ON public.user_quiz_responses(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_responses_course_module ON public.user_quiz_responses(course_id, module_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_responses_passed ON public.user_quiz_responses(passed);

-- ============================================================
-- FEATURE TOURS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feature_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_name TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    steps JSONB NOT NULL, -- Array of tour step objects
    target_audience TEXT[], -- User roles who should see this tour
    priority INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_tours_active ON public.feature_tours(active);
CREATE INDEX IF NOT EXISTS idx_feature_tours_priority ON public.feature_tours(priority);

-- ============================================================
-- USER TOUR PROGRESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_tour_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES public.feature_tours(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    skipped BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tour_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tour_progress_user_id ON public.user_tour_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_progress_tour_id ON public.user_tour_progress(tour_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_progress_completed ON public.user_tour_progress(completed);

-- ============================================================
-- ONBOARDING STATE ENHANCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_onboarding_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 5,
    completed BOOLEAN DEFAULT false,
    steps_completed JSONB DEFAULT '[]'::jsonb, -- Array of completed step IDs
    data JSONB DEFAULT '{}'::jsonb, -- User responses and progress data
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_interaction TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_state_user_id ON public.user_onboarding_state(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_state_completed ON public.user_onboarding_state(completed);

-- ============================================================
-- AI ASSISTANT INTERACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_assistant_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'question', 'proactive_suggestion', 'goal_reminder', 'quiz_help'
    context_page TEXT,
    context_data JSONB,
    user_message TEXT,
    ai_response TEXT,
    user_reaction TEXT, -- 'helpful', 'not_helpful', 'dismissed', 'acted_upon'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_assistant_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON public.ai_assistant_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON public.ai_assistant_interactions(created_at DESC);

-- ============================================================
-- HOMEWORK ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    rubric JSONB, -- Grading criteria
    example_submissions JSONB, -- Example good submissions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_course_homework_course_id ON public.course_homework(course_id);

-- ============================================================
-- USER HOMEWORK SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    homework_id UUID NOT NULL REFERENCES public.course_homework(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    submission_text TEXT NOT NULL,
    attachments JSONB, -- URLs to uploaded files
    ai_feedback TEXT, -- AI-generated feedback
    ai_score INTEGER, -- 0-100
    status TEXT DEFAULT 'submitted', -- 'draft', 'submitted', 'reviewed'
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_homework_user_id ON public.user_homework_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_homework_homework_id ON public.user_homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_user_homework_status ON public.user_homework_submissions(status);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- User Goals Policies
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goals" ON public.user_goals
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.user_goals
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.user_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Goal Milestones Policies
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view milestones of their goals" ON public.goal_milestones
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.user_goals
        WHERE public.user_goals.id = public.goal_milestones.goal_id
        AND public.user_goals.user_id = auth.uid()
    ));
CREATE POLICY "Users can insert milestones for their goals" ON public.goal_milestones
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.user_goals
        WHERE public.user_goals.id = public.goal_milestones.goal_id
        AND public.user_goals.user_id = auth.uid()
    ));
CREATE POLICY "Users can update milestones of their goals" ON public.goal_milestones
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.user_goals
        WHERE public.user_goals.id = public.goal_milestones.goal_id
        AND public.user_goals.user_id = auth.uid()
    ));

-- Quiz Responses Policies
ALTER TABLE public.user_quiz_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quiz responses" ON public.user_quiz_responses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz responses" ON public.user_quiz_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tour Progress Policies
ALTER TABLE public.user_tour_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tour progress" ON public.user_tour_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tour progress" ON public.user_tour_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tour progress" ON public.user_tour_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Onboarding State Policies
ALTER TABLE public.user_onboarding_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own onboarding state" ON public.user_onboarding_state
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own onboarding state" ON public.user_onboarding_state
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own onboarding state" ON public.user_onboarding_state
    FOR UPDATE USING (auth.uid() = user_id);

-- AI Interactions Policies
ALTER TABLE public.ai_assistant_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own AI interactions" ON public.ai_assistant_interactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI interactions" ON public.ai_assistant_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Homework Submissions Policies
ALTER TABLE public.user_homework_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own homework submissions" ON public.user_homework_submissions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own homework submissions" ON public.user_homework_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own homework submissions" ON public.user_homework_submissions
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_quizzes_updated_at BEFORE UPDATE ON public.course_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_tours_updated_at BEFORE UPDATE ON public.feature_tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tour_progress_updated_at BEFORE UPDATE ON public.user_tour_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_homework_updated_at BEFORE UPDATE ON public.course_homework
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA: DEFAULT FEATURE TOURS
-- ============================================================

INSERT INTO public.feature_tours (tour_name, title, description, steps, target_audience, priority, active)
VALUES 
(
    'platform-overview',
    'Welcome to Revenue Ripple!',
    'Get a quick tour of the platform and discover all the amazing features available to you',
    '[
        {
            "id": 1,
            "title": "Welcome!",
            "description": "Let me show you around Revenue Ripple. This tour will help you discover key features and get started quickly.",
            "target": "body",
            "placement": "center",
            "action": "next"
        },
        {
            "id": 2,
            "title": "Your Dashboard",
            "description": "Your personal dashboard shows your progress, goals, and recent activity. Check in here regularly!",
            "target": ".dashboard-header",
            "placement": "bottom",
            "action": "next"
        },
        {
            "id": 3,
            "title": "Video Courses",
            "description": "Access our comprehensive library of marketing courses. Learn at your own pace!",
            "target": "[href=\"/courses\"]",
            "placement": "right",
            "action": "next"
        },
        {
            "id": 4,
            "title": "Your AI Assistant",
            "description": "Meet Ripple, your AI marketing assistant! I can answer questions, provide guidance, and help you succeed.",
            "target": ".ai-assistant-trigger",
            "placement": "left",
            "action": "next",
            "highlightElement": true
        },
        {
            "id": 5,
            "title": "Set Your Goals",
            "description": "Define your marketing goals and I'll help you track progress and stay motivated!",
            "target": ".goals-section",
            "placement": "top",
            "action": "complete"
        }
    ]'::jsonb,
    ARRAY['member', 'affiliate', 'reseller', 'admin'],
    1,
    true
),
(
    'course-learning-path',
    'How to Learn Effectively',
    'Learn how to get the most out of our courses with quizzes, homework, and progress tracking',
    '[
        {
            "id": 1,
            "title": "Course Structure",
            "description": "Each course is broken into bite-sized modules. Complete them in order for the best learning experience.",
            "target": ".modules-grid",
            "placement": "top",
            "action": "next"
        },
        {
            "id": 2,
            "title": "Test Your Knowledge",
            "description": "After each module, take a quiz to reinforce what you''ve learned.",
            "target": ".quiz-section",
            "placement": "right",
            "action": "next"
        },
        {
            "id": 3,
            "title": "Apply What You Learn",
            "description": "Complete homework assignments to practice new skills in real scenarios.",
            "target": ".homework-section",
            "placement": "right",
            "action": "next"
        },
        {
            "id": 4,
            "title": "Track Your Progress",
            "description": "Watch your progress bar fill up as you complete modules, quizzes, and homework!",
            "target": ".progress-bar",
            "placement": "bottom",
            "action": "complete"
        }
    ]'::jsonb,
    ARRAY['member', 'affiliate', 'reseller', 'admin'],
    2,
    true
)
ON CONFLICT (tour_name) DO NOTHING;
