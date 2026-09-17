DROP SCHEMA IF EXISTS value_engine CASCADE;

CREATE TABLE IF NOT EXISTS public.ve_raw_feed (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text DEFAULT 'ai_briefing',
    url text,
    title text,
    summary_raw text,
    tags_guess text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    processed boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS ve_raw_feed_created_at_idx
    ON public.ve_raw_feed (created_at DESC);

CREATE INDEX IF NOT EXISTS ve_raw_feed_processed_idx
    ON public.ve_raw_feed (processed);

CREATE INDEX IF NOT EXISTS ve_raw_feed_source_idx
    ON public.ve_raw_feed (source);

CREATE TABLE IF NOT EXISTS public.ve_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_feed_id uuid REFERENCES public.ve_raw_feed(id) ON DELETE SET NULL,
    one_line_hook text DEFAULT '',
    summary_clean text,
    founder_angle text,
    agency_angle text,
    creator_angle text,
    simple_play text,
    urgency_score integer NOT NULL DEFAULT 1,
    tags text[],
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ve_insights_created_at_idx
    ON public.ve_insights (created_at DESC);

CREATE INDEX IF NOT EXISTS ve_insights_urgency_idx
    ON public.ve_insights (urgency_score DESC);

CREATE INDEX IF NOT EXISTS ve_insights_tags_idx
    ON public.ve_insights
    USING gin (tags);

CREATE TABLE IF NOT EXISTS public.ve_content_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_id uuid REFERENCES public.ve_insights(id) ON DELETE SET NULL,
    content_type text NOT NULL,
    level text NOT NULL DEFAULT 'free',
    title text NOT NULL,
    short_description text,
    full_body text,
    url_slug text UNIQUE,
    tags text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz
);

CREATE INDEX IF NOT EXISTS ve_content_items_created_at_idx
    ON public.ve_content_items (created_at DESC);

CREATE INDEX IF NOT EXISTS ve_content_items_level_idx
    ON public.ve_content_items (level);

CREATE INDEX IF NOT EXISTS ve_content_items_type_idx
    ON public.ve_content_items (content_type);

CREATE INDEX IF NOT EXISTS ve_content_items_tags_idx
    ON public.ve_content_items
    USING gin (tags);

CREATE TABLE IF NOT EXISTS public.ve_content_user_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id uuid NOT NULL REFERENCES public.ve_content_items(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    event_source text,
    duration_seconds integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ve_content_user_events_user_idx
    ON public.ve_content_user_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ve_content_user_events_content_idx
    ON public.ve_content_user_events (content_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ve_content_user_events_event_type_idx
    ON public.ve_content_user_events (event_type);

CREATE INDEX IF NOT EXISTS ve_content_user_events_created_at_idx
    ON public.ve_content_user_events (created_at DESC);

CREATE TABLE IF NOT EXISTS public.ve_engagement_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    score integer NOT NULL DEFAULT 0,
    last_event_at timestamptz,
    last_calculated_at timestamptz,
    segment text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ve_engagement_scores_score_idx
    ON public.ve_engagement_scores (score DESC);

CREATE INDEX IF NOT EXISTS ve_engagement_scores_segment_idx
    ON public.ve_engagement_scores (segment);

CREATE INDEX IF NOT EXISTS ve_engagement_scores_last_event_idx
    ON public.ve_engagement_scores (last_event_at);

ALTER TABLE public.ve_raw_feed
    ALTER COLUMN source DROP NOT NULL;

ALTER TABLE public.ve_raw_feed
    ALTER COLUMN source SET DEFAULT 'ai_briefing';

ALTER TABLE public.ve_insights
    ALTER COLUMN one_line_hook DROP NOT NULL;

ALTER TABLE public.ve_insights
    ALTER COLUMN one_line_hook SET DEFAULT '';

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS value_engine_segment text,
    ADD COLUMN IF NOT EXISTS value_engine_last_seen timestamptz;

