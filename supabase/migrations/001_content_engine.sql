-- Revenue Ripple Content Engine
-- Tables for transcript storage, gap analysis, video generation pipeline, and audit log.

-- ---------------------------------------------------------------------------
-- 1. video_transcripts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.video_transcripts (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id    text UNIQUE NOT NULL,
    title       text NOT NULL,
    transcript  text,
    topic_tags  text[],
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- Upgrade path: table may already exist from a manual import (no id / topic_tags).
ALTER TABLE public.video_transcripts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE public.video_transcripts ADD COLUMN IF NOT EXISTS topic_tags text[];
ALTER TABLE public.video_transcripts ADD COLUMN IF NOT EXISTS transcript text;
ALTER TABLE public.video_transcripts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.video_transcripts ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS video_transcripts_created_at_idx
    ON public.video_transcripts (created_at DESC);

CREATE INDEX IF NOT EXISTS video_transcripts_topic_tags_idx
    ON public.video_transcripts
    USING gin (topic_tags);

-- ---------------------------------------------------------------------------
-- 2. content_gaps
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_gaps (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topic         text NOT NULL UNIQUE,
    coverage_pct  integer NOT NULL DEFAULT 0 CHECK (coverage_pct >= 0 AND coverage_pct <= 100),
    video_count   integer NOT NULL DEFAULT 0,
    last_analyzed timestamptz NOT NULL DEFAULT now(),
    priority      text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'))
);

CREATE INDEX IF NOT EXISTS content_gaps_priority_idx
    ON public.content_gaps (priority);

CREATE INDEX IF NOT EXISTS content_gaps_coverage_idx
    ON public.content_gaps (coverage_pct ASC);

-- ---------------------------------------------------------------------------
-- 3. generated_videos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_videos (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title              text NOT NULL,
    script             text,
    topic              text,
    gap_id             uuid REFERENCES public.content_gaps (id) ON DELETE SET NULL,
    synthesia_video_id text,
    vimeo_video_id     text,
    vimeo_embed_url    text,
    status             text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'rendering', 'uploading', 'published', 'failed')),
    published_at       timestamptz,
    created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_videos_status_idx
    ON public.generated_videos (status);

CREATE INDEX IF NOT EXISTS generated_videos_created_at_idx
    ON public.generated_videos (created_at DESC);

CREATE INDEX IF NOT EXISTS generated_videos_gap_id_idx
    ON public.generated_videos (gap_id);

-- ---------------------------------------------------------------------------
-- 4. content_activity_log
--    (Named content_activity_log — public.activity_log already exists for
--     admin/DevOps with columns: user_id, type, description, metadata)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_activity_log (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type  text NOT NULL CHECK (
        event_type IN ('script_generated', 'video_rendered', 'video_published', 'gap_analyzed')
    ),
    payload     jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_activity_log_event_type_idx
    ON public.content_activity_log (event_type);

CREATE INDEX IF NOT EXISTS content_activity_log_created_at_idx
    ON public.content_activity_log (created_at DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security — service_role full access; no public policies
-- (service_role key bypasses RLS; explicit policies document server access)
-- ---------------------------------------------------------------------------
ALTER TABLE public.video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_video_transcripts" ON public.video_transcripts;
CREATE POLICY "service_role_all_video_transcripts"
    ON public.video_transcripts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_content_gaps" ON public.content_gaps;
CREATE POLICY "service_role_all_content_gaps"
    ON public.content_gaps
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_generated_videos" ON public.generated_videos;
CREATE POLICY "service_role_all_generated_videos"
    ON public.generated_videos
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_content_activity_log" ON public.content_activity_log;
CREATE POLICY "service_role_all_content_activity_log"
    ON public.content_activity_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
