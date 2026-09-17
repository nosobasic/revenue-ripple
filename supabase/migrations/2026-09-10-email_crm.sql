-- Email CRM (SES migration). Service role bypasses RLS; admins can read via users.role.

CREATE TABLE IF NOT EXISTS public.email_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    name text,
    phone text,
    source text,
    tags text[] NOT NULL DEFAULT '{}',
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained', 'paused')),
    unsubscribe_token text UNIQUE,
    suppression_reason text,
    unsubscribed_at timestamptz,
    getresponse_contact_id text,
    getresponse_campaign_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_contacts_status_idx ON public.email_contacts (status);
CREATE INDEX IF NOT EXISTS email_contacts_source_idx ON public.email_contacts (source);

CREATE TABLE IF NOT EXISTS public.email_sequences (
    id text PRIMARY KEY,
    name text NOT NULL,
    engine text NOT NULL CHECK (engine IN ('due_worker', 'step_functions')),
    next_sequence text,
    next_delay_days integer,
    steps jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid NOT NULL REFERENCES public.email_contacts (id) ON DELETE CASCADE,
    sequence_id text NOT NULL REFERENCES public.email_sequences (id),
    step_index integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'paused'
        CHECK (status IN ('active', 'paused', 'completed', 'suppressed', 'shadow')),
    origin text,
    next_send_at timestamptz,
    last_sent_at timestamptz,
    completed_at timestamptz,
    getresponse_day_of_cycle integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_enrollments_due_idx
    ON public.email_enrollments (status, next_send_at)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS email_enrollments_contact_idx
    ON public.email_enrollments (contact_id);

CREATE TABLE IF NOT EXISTS public.email_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid REFERENCES public.email_contacts (id) ON DELETE SET NULL,
    enrollment_id uuid REFERENCES public.email_enrollments (id) ON DELETE SET NULL,
    event_type text NOT NULL,
    payload jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_events_contact_idx ON public.email_events (contact_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.email_send_counters (
    send_date date PRIMARY KEY,
    sent_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_email_contacts" ON public.email_contacts;
CREATE POLICY "service_role_all_email_contacts"
    ON public.email_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_email_sequences" ON public.email_sequences;
CREATE POLICY "service_role_all_email_sequences"
    ON public.email_sequences FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_email_enrollments" ON public.email_enrollments;
CREATE POLICY "service_role_all_email_enrollments"
    ON public.email_enrollments FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_email_events" ON public.email_events;
CREATE POLICY "service_role_all_email_events"
    ON public.email_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_email_send_counters" ON public.email_send_counters;
CREATE POLICY "service_role_all_email_send_counters"
    ON public.email_send_counters FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admins_read_email_contacts" ON public.email_contacts;
CREATE POLICY "admins_read_email_contacts"
    ON public.email_contacts FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "admins_read_email_enrollments" ON public.email_enrollments;
CREATE POLICY "admins_read_email_enrollments"
    ON public.email_enrollments FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "admins_read_email_sequences" ON public.email_sequences;
CREATE POLICY "admins_read_email_sequences"
    ON public.email_sequences FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "admins_read_email_events" ON public.email_events;
CREATE POLICY "admins_read_email_events"
    ON public.email_events FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

INSERT INTO public.email_sequences (id, name, engine)
VALUES
    ('indoctrination', 'Lead magnet indoctrination', 'due_worker'),
    ('dmd_course_26', 'Digital Marketing Domination 26-lesson course', 'due_worker'),
    ('founders_annual', 'Founders Annual onboarding', 'step_functions'),
    ('tripwire_buyer', 'Tripwire ebook follow-up', 'due_worker'),
    ('paid_buyer', 'Paid membership / reseller welcome', 'due_worker')
ON CONFLICT (id) DO NOTHING;

UPDATE public.email_sequences SET next_sequence = 'dmd_course_26', next_delay_days = 14
WHERE id = 'indoctrination';
