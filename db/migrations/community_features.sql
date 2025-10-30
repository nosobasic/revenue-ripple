-- Community Features Database Tables
-- Run these in your Supabase SQL editor

-- Community posts table - main forum posts
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    upvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community replies table - replies to posts
CREATE TABLE IF NOT EXISTS community_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    parent_reply_id UUID REFERENCES community_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Success stories table - user success stories
CREATE TABLE IF NOT EXISTS success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    outcome TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post upvotes table - track who upvoted what posts
CREATE TABLE IF NOT EXISTS post_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Reply upvotes table - track who upvoted what replies
CREATE TABLE IF NOT EXISTS reply_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES community_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reply_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_upvotes ON community_posts(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_pinned ON community_posts(is_pinned) WHERE is_pinned = true;

CREATE INDEX IF NOT EXISTS idx_community_replies_post_id ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_user_id ON community_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_created_at ON community_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_replies_parent_reply_id ON community_replies(parent_reply_id);

CREATE INDEX IF NOT EXISTS idx_success_stories_user_id ON success_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_is_featured ON success_stories(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_success_stories_is_approved ON success_stories(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_success_stories_created_at ON success_stories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON post_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON post_upvotes(user_id);

CREATE INDEX IF NOT EXISTS idx_reply_upvotes_reply_id ON reply_upvotes(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_upvotes_user_id ON reply_upvotes(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_upvotes ENABLE ROW LEVEL SECURITY;

-- Community posts policies
CREATE POLICY "Users can view all community posts"
    ON community_posts FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own community posts"
    ON community_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community posts"
    ON community_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community posts"
    ON community_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Community replies policies
CREATE POLICY "Users can view all community replies"
    ON community_replies FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own community replies"
    ON community_replies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community replies"
    ON community_replies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community replies"
    ON community_replies FOR DELETE
    USING (auth.uid() = user_id);

-- Success stories policies
CREATE POLICY "Users can view approved success stories"
    ON success_stories FOR SELECT
    USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own success stories"
    ON success_stories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own success stories"
    ON success_stories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own success stories"
    ON success_stories FOR DELETE
    USING (auth.uid() = user_id);

-- Post upvotes policies
CREATE POLICY "Users can view all post upvotes"
    ON post_upvotes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own post upvotes"
    ON post_upvotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post upvotes"
    ON post_upvotes FOR DELETE
    USING (auth.uid() = user_id);

-- Reply upvotes policies
CREATE POLICY "Users can view all reply upvotes"
    ON reply_upvotes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own reply upvotes"
    ON reply_upvotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reply upvotes"
    ON reply_upvotes FOR DELETE
    USING (auth.uid() = user_id);

-- Functions to update upvote counts
CREATE OR REPLACE FUNCTION update_post_upvotes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET upvotes = upvotes + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET upvotes = upvotes - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_reply_upvotes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_replies 
        SET upvotes = upvotes + 1 
        WHERE id = NEW.reply_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_replies 
        SET upvotes = upvotes - 1 
        WHERE id = OLD.reply_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update upvote counts
CREATE TRIGGER trigger_update_post_upvotes
    AFTER INSERT OR DELETE ON post_upvotes
    FOR EACH ROW EXECUTE FUNCTION update_post_upvotes();

CREATE TRIGGER trigger_update_reply_upvotes
    AFTER INSERT OR DELETE ON reply_upvotes
    FOR EACH ROW EXECUTE FUNCTION update_reply_upvotes();

-- Insert some sample categories
INSERT INTO community_posts (user_id, title, content, category, upvotes) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Welcome to the Community!', 'This is a sample post to get the community started. Feel free to introduce yourself and share what you''re working on!', 'general', 5),
    ('00000000-0000-0000-0000-000000000000', 'Marketing Tips & Strategies', 'Share your best marketing strategies and learn from others in the community.', 'marketing', 3),
    ('00000000-0000-0000-0000-000000000000', 'AI Tools Discussion', 'Discuss the latest AI tools and how they can help your business.', 'ai', 7)
ON CONFLICT DO NOTHING;
