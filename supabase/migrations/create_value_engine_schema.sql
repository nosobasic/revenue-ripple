-- Value Engine Schema Migration
-- Creates the complete schema for the Value Engine content system

-- Create schema
CREATE SCHEMA IF NOT EXISTS value_engine;

-- 1. Raw input from scrapers and APIs
CREATE TABLE IF NOT EXISTS value_engine.raw_feed (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,
    url text,
    title text,
    summary_raw text,
    tags_guess text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    processed boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS raw_feed_created_at_idx
    ON value_engine.raw_feed (created_at DESC);

CREATE INDEX IF NOT EXISTS raw_feed_processed_idx
    ON value_engine.raw_feed (processed);

CREATE INDEX IF NOT EXISTS raw_feed_source_idx
    ON value_engine.raw_feed (source);

-- 2. Processed insights in your voice
CREATE TABLE IF NOT EXISTS value_engine.insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_feed_id uuid REFERENCES value_engine.raw_feed(id) ON DELETE SET NULL,
    one_line_hook text NOT NULL,
    summary_clean text,
    founder_angle text,
    agency_angle text,
    creator_angle text,
    simple_play text,
    urgency_score integer NOT NULL DEFAULT 1,
    tags text[],
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS insights_created_at_idx
    ON value_engine.insights (created_at DESC);

CREATE INDEX IF NOT EXISTS insights_urgency_idx
    ON value_engine.insights (urgency_score DESC);

CREATE INDEX IF NOT EXISTS insights_tags_idx
    ON value_engine.insights
    USING gin (tags);

-- 3. Content items built from insights
--    newsletter issues, deep dives, drops, playbooks, workflows, prompt packs
CREATE TABLE IF NOT EXISTS value_engine.content_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_id uuid REFERENCES value_engine.insights(id) ON DELETE SET NULL,
    content_type text NOT NULL,        -- examples: 'newsletter_issue', 'deep_dive', 'workflow', 'prompt_pack', 'premium_drop'
    level text NOT NULL DEFAULT 'free',  -- 'free' or 'member'
    title text NOT NULL,
    short_description text,
    full_body text,
    url_slug text UNIQUE,
    tags text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz
);

CREATE INDEX IF NOT EXISTS content_items_created_at_idx
    ON value_engine.content_items (created_at DESC);

CREATE INDEX IF NOT EXISTS content_items_level_idx
    ON value_engine.content_items (level);

CREATE INDEX IF NOT EXISTS content_items_type_idx
    ON value_engine.content_items (content_type);

CREATE INDEX IF NOT EXISTS content_items_tags_idx
    ON value_engine.content_items
    USING gin (tags);

-- 4. User events tied to content items
--    opened, clicked, viewed, completed
CREATE TABLE IF NOT EXISTS value_engine.content_to_user_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id uuid NOT NULL REFERENCES value_engine.content_items(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    event_source text,
    duration_seconds integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_user_events_user_idx
    ON value_engine.content_to_user_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS content_user_events_content_idx
    ON value_engine.content_to_user_events (content_id, created_at DESC);

CREATE INDEX IF NOT EXISTS content_user_events_event_type_idx
    ON value_engine.content_to_user_events (event_type);

CREATE INDEX IF NOT EXISTS content_user_events_created_at_idx
    ON value_engine.content_to_user_events (created_at DESC);

-- 5. Engagement scores per user for retention logic
CREATE TABLE IF NOT EXISTS value_engine.engagement_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    score integer NOT NULL DEFAULT 0,
    last_event_at timestamptz,
    last_calculated_at timestamptz,
    segment text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS engagement_scores_score_idx
    ON value_engine.engagement_scores (score DESC);

CREATE INDEX IF NOT EXISTS engagement_scores_segment_idx
    ON value_engine.engagement_scores (segment);

CREATE INDEX IF NOT EXISTS engagement_scores_last_event_idx
    ON value_engine.engagement_scores (last_event_at);

-- 6. Optional helper columns on users for quick access
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS value_engine_segment text,
    ADD COLUMN IF NOT EXISTS value_engine_last_seen timestamptz;

