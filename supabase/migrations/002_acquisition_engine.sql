-- Downstream of Content Engine. No content tables or policies are changed.
begin;
create table public.acquisition_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 160),
  objective text not null, topic text not null default '', pillar text not null default '',
  idea text not null default '',
  source_video_id uuid references public.generated_videos(id),
  source_transcript_video_id text,
  cta_label text not null, destination_url text not null,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  check (num_nonnulls(source_video_id, source_transcript_video_id) <= 1),
  check (source_video_id is not null or source_transcript_video_id is not null or length(idea) > 0)
);
-- Preserve the existing Content Engine's ID type (UUID in some installations).
do $$ declare source_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into source_type
  from pg_attribute a where a.attrelid = 'public.video_transcripts'::regclass
    and a.attname = 'video_id' and not a.attisdropped;
  if source_type is null or source_type not in ('text','uuid','character varying') then
    raise exception 'Unsupported video_transcripts.video_id type: %', source_type;
  end if;
  execute format('alter table public.acquisition_campaigns alter column source_transcript_video_id type %s using source_transcript_video_id::%s', source_type, source_type);
  alter table public.acquisition_campaigns add constraint acquisition_campaigns_source_transcript_video_id_fkey
    foreign key (source_transcript_video_id) references public.video_transcripts(video_id);
end $$;

create table public.acquisition_posts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.acquisition_campaigns(id),
  platform text not null check (platform in ('linkedin','facebook','instagram','x')),
  body text not null check(length(body) > 0),
  status text not null default 'draft' check(status in ('draft','pending_approval','approved','scheduled','publishing','published','failed')),
  last_actor_id uuid references auth.users(id),
  revision integer not null default 1, approved_by uuid references auth.users(id), approved_at timestamptz,
  scheduled_at timestamptz, claimed_at timestamptz, delivery_token uuid,
  external_id text, external_url text, error text, published_at timestamptz,
  created_at timestamptz not null default now()
);
create index acquisition_posts_due on public.acquisition_posts(scheduled_at) where status = 'scheduled';
create table public.acquisition_revisions (
  id bigint generated always as identity primary key, post_id uuid not null references public.acquisition_posts(id),
  revision integer not null, body text not null, actor_id uuid references auth.users(id),
  created_at timestamptz not null default now(), unique(post_id,revision)
);
create table public.acquisition_activity (
  id bigint generated always as identity primary key, post_id uuid references public.acquisition_posts(id),
  campaign_id uuid references public.acquisition_campaigns(id), event text not null,
  actor_id uuid references auth.users(id), created_at timestamptz not null default now()
);
create table public.acquisition_metrics (
  post_id uuid primary key references public.acquisition_posts(id),
  impressions bigint not null default 0 check(impressions >= 0),
  engagements bigint not null default 0 check(engagements >= 0),
  observed_at timestamptz not null
);
create table public.acquisition_touches (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.acquisition_posts(id),
  created_at timestamptz not null default now()
);
create index acquisition_touches_post on public.acquisition_touches(post_id);
create table public.acquisition_leads (
  id uuid primary key default gen_random_uuid(), email text not null unique, funnel text not null,
  first_touch_id uuid not null references public.acquisition_touches(id),
  last_touch_id uuid not null references public.acquisition_touches(id),
  latest_touch_id uuid not null references public.acquisition_touches(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.acquisition_conversions (
  event_id text primary key, lead_id uuid not null references public.acquisition_leads(id),
  first_touch_id uuid not null references public.acquisition_touches(id),
  last_touch_id uuid not null references public.acquisition_touches(id),
  amount_minor bigint not null check(amount_minor > 0), currency text not null check(currency ~ '^[a-z]{3}$'),
  created_at timestamptz not null default now()
);

-- All access passes through authenticated server endpoints. Browser roles have no access.
do $$ declare t text; begin
  foreach t in array array['acquisition_campaigns','acquisition_posts','acquisition_revisions','acquisition_activity','acquisition_metrics','acquisition_touches','acquisition_leads','acquisition_conversions'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
grant usage, select on sequence public.acquisition_revisions_id_seq, public.acquisition_activity_id_seq to service_role;

-- Capture revisions and state changes transactionally, including worker transitions.
create function public.acquisition_audit() returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'INSERT' or new.body is distinct from old.body then
    insert into acquisition_revisions(post_id, revision, body, actor_id)
      values(new.id,new.revision,new.body,new.last_actor_id);
  end if;
  insert into acquisition_activity(post_id,campaign_id,event,actor_id)
    values(new.id,new.campaign_id,new.status,new.last_actor_id);
  return new;
end $$;
create trigger acquisition_audit_post after insert or update on public.acquisition_posts
  for each row execute function public.acquisition_audit();

create function public.acquisition_transition(p_id uuid, p_revision integer, p_action text, p_actor uuid, p_body text default null, p_at timestamptz default null)
returns public.acquisition_posts language plpgsql set search_path = public as $$
declare p acquisition_posts; begin
  select * into p from acquisition_posts where id=p_id for update;
  if not found or p.revision <> p_revision then raise exception 'Post changed; reload before trying again'; end if;
  if p_action = 'edit' and p.status in ('draft','pending_approval','approved','scheduled','failed') then
    if p_body is null or length(trim(p_body)) = 0 then raise exception 'Body required'; end if;
    p.body := trim(p_body); p.revision := p.revision+1; p.status := 'draft'; p.approved_by := null; p.approved_at := null; p.scheduled_at := null; p.error := null;
  elsif p_action = 'submit' and p.status = 'draft' then p.status := 'pending_approval';
  elsif p_action = 'approve' and p.status = 'pending_approval' then p.status := 'approved'; p.approved_by := p_actor; p.approved_at := now();
  elsif p_action = 'reject' and p.status = 'pending_approval' then p.status := 'draft';
  elsif p_action = 'schedule' and p.status = 'approved' then
    if p_at is null or p_at < now() then raise exception 'Schedule must be in the future'; end if;
    p.scheduled_at := p_at; p.status := 'scheduled';
  elsif p_action = 'unschedule' and p.status = 'scheduled' then p.status := 'approved'; p.scheduled_at := null;
  else raise exception 'Invalid post transition'; end if;
  update acquisition_posts set body=p.body, revision=p.revision, status=p.status, last_actor_id=p_actor, approved_by=p.approved_by,
    approved_at=p.approved_at, scheduled_at=p.scheduled_at, error=p.error where id=p_id returning * into p;
  return p;
end $$;

-- SKIP LOCKED prevents two worker invocations claiming the same post.
-- Publishing jobs are deliberately NOT automatically retried: reconcile uncertain delivery first.
create function public.acquisition_claim() returns setof public.acquisition_posts language sql set search_path = public as $$
  update acquisition_posts set status='publishing',last_actor_id=null,claimed_at=now(),delivery_token=gen_random_uuid()
  where id in (select p.id from acquisition_posts p join acquisition_campaigns c on c.id=p.campaign_id
    where p.status='scheduled' and p.approved_at is not null and p.scheduled_at <= now() and c.status='active'
    order by p.scheduled_at for update of p skip locked limit 10)
  returning *;
$$;
create function public.acquisition_delivery(p_id uuid, p_token uuid, p_external_id text, p_url text, p_error text)
returns void language plpgsql set search_path = public as $$
declare p acquisition_posts; begin
  select * into p from acquisition_posts where id=p_id for update;
  if not found or p.delivery_token is distinct from p_token then raise exception 'Invalid delivery token'; end if;
  if p.status in ('published','failed') then return; end if;
  if p.status <> 'publishing' then raise exception 'Post is not publishing'; end if;
  if p_error is null and nullif(p_external_id,'') is null then raise exception 'External post ID required'; end if;
  update acquisition_posts set last_actor_id=null,status=case when p_error is null then 'published' else 'failed' end,
    external_id=p_external_id,external_url=p_url,error=p_error,published_at=case when p_error is null then now() end where id=p_id;
end $$;
create function public.acquisition_social_metrics(p_id uuid, p_impressions bigint, p_engagements bigint, p_observed_at timestamptz)
returns void language plpgsql set search_path = public as $$
begin
  if not exists(select 1 from acquisition_posts where id=p_id and status='published') then raise exception 'Published post required'; end if;
  if p_observed_at > now()+interval '5 minutes' then raise exception 'Invalid observation time'; end if;
  insert into acquisition_metrics values(p_id,p_impressions,p_engagements,p_observed_at)
  on conflict(post_id) do update set impressions=excluded.impressions,engagements=excluded.engagements,observed_at=excluded.observed_at
  where excluded.observed_at > acquisition_metrics.observed_at;
end $$;

-- Only actual recorded click IDs within the attribution window are accepted.
create function public.acquisition_record_lead(p_email text,p_funnel text,p_first uuid,p_last uuid)
returns void language plpgsql set search_path = public as $$
declare f uuid; l uuid; begin
  select id into f from acquisition_touches where id=p_first and created_at >= now()-interval '90 days';
  select id into l from acquisition_touches where id=p_last and created_at >= now()-interval '90 days';
  if f is null and l is null then return; end if;
  f := coalesce(f,l); l := coalesce(l,f);
  -- Normalize ordering even if a browser supplies the touches out of order.
  if (select created_at from acquisition_touches where id=f) > (select created_at from acquisition_touches where id=l) then
    select l,f into f,l;
  end if;
  insert into acquisition_leads(email,funnel,first_touch_id,last_touch_id,latest_touch_id) values(lower(trim(p_email)),p_funnel,f,l,l)
  on conflict(email) do update set latest_touch_id=case
    when (select created_at from acquisition_touches where id=excluded.latest_touch_id) >
         (select created_at from acquisition_touches where id=acquisition_leads.latest_touch_id)
    then excluded.latest_touch_id else acquisition_leads.latest_touch_id end, updated_at=now();
end $$;
create function public.acquisition_record_conversion(p_event text,p_email text,p_amount bigint,p_currency text)
returns void language sql set search_path = public as $$
  insert into acquisition_conversions(event_id,lead_id,first_touch_id,last_touch_id,amount_minor,currency)
  select p_event,l.id,l.first_touch_id,l.latest_touch_id,p_amount,lower(p_currency) from acquisition_leads l
  join acquisition_touches t on t.id=l.latest_touch_id
  where l.email=lower(trim(p_email)) and p_amount>0 and t.created_at >= now()-interval '90 days'
  on conflict(event_id) do nothing;
$$;

-- Privacy-safe facts for analytics; lead IDs allow unique-customer counting without exposing emails.
create view public.acquisition_facts with (security_invoker=true) as
select 'first:lead:' || l.id::text id, 'first'::text model, 'lead'::text kind,t.post_id,l.id::text identity,0::bigint amount_minor,null::text currency,l.created_at
 from acquisition_leads l join acquisition_touches t on t.id=l.first_touch_id
union all select 'last:lead:' || l.id::text,'last','lead',t.post_id,l.id::text,0,null,l.created_at from acquisition_leads l join acquisition_touches t on t.id=l.last_touch_id
union all select 'first:conversion:' || c.event_id,'first','conversion',t.post_id,c.lead_id::text,c.amount_minor,c.currency,c.created_at from acquisition_conversions c join acquisition_touches t on t.id=c.first_touch_id
union all select 'last:conversion:' || c.event_id,'last','conversion',t.post_id,c.lead_id::text,c.amount_minor,c.currency,c.created_at from acquisition_conversions c join acquisition_touches t on t.id=c.last_touch_id
union all select 'click:' || t.id::text,'both','click',t.post_id,t.id::text,0,null,t.created_at from acquisition_touches t;
revoke all on public.acquisition_facts from anon,authenticated;
grant select on public.acquisition_facts to service_role;
do $$ declare f regprocedure; begin
  for f in select oid::regprocedure from pg_proc where pronamespace='public'::regnamespace and proname like 'acquisition_%' loop
    execute format('revoke all on function %s from public,anon,authenticated',f);
    execute format('grant execute on function %s to service_role',f);
  end loop;
end $$;
commit;
