-- Apply after corrected 002. Reuse existing campaign, post, approval, and attribution systems.
begin;
alter table public.acquisition_posts drop constraint acquisition_posts_platform_check;
alter table public.acquisition_posts add constraint acquisition_posts_platform_check check(platform in ('linkedin','reddit','facebook','instagram','x'));
alter table public.acquisition_posts add column destination_url text;
alter table public.acquisition_posts add column outreach_kind text not null default 'social_post' check(outreach_kind in ('social_post','connection_message','reply'));
create table public.acquisition_opportunities (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.acquisition_campaigns(id),
  post_id uuid unique references public.acquisition_posts(id),
  platform text not null check(platform in ('linkedin','reddit')),
  source_url text not null, source_title text not null default '', source_text text not null default '',
  author text not null default '', company text not null default '', role text not null default '', community text not null default '',
  pain_level integer check(pain_level between 1 and 5), intent text check(intent in ('learning','tools','hiring','venting')),
  buyer boolean, matched_resource_url text, workflow_name text not null default '',
  status text not null default 'new' check(status in ('new','reviewing','dismissed')),
  created_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
  unique(campaign_id,platform,source_url)
);
alter table public.acquisition_opportunities enable row level security;
revoke all on public.acquisition_opportunities from anon,authenticated;
grant all on public.acquisition_opportunities to service_role;
create index acquisition_opportunities_review on public.acquisition_opportunities(status,created_at desc);

-- Repeated runs preserve human edits and decisions and cannot create duplicate drafts.
create function public.acquisition_import_opportunity(p_data jsonb)
returns public.acquisition_opportunities language plpgsql set search_path=public as $$
declare o acquisition_opportunities; draft_id uuid;
begin
  if not exists(select 1 from acquisition_campaigns where id=(p_data->>'campaign_id')::uuid and status='active') then raise exception 'Active campaign required'; end if;
  insert into acquisition_opportunities(campaign_id,platform,source_url,source_title,source_text,author,company,role,community,pain_level,intent,buyer,matched_resource_url,workflow_name)
  values((p_data->>'campaign_id')::uuid,p_data->>'platform',p_data->>'source_url',coalesce(p_data->>'source_title',''),
    coalesce(p_data->>'source_text',''),coalesce(p_data->>'author',''),coalesce(p_data->>'company',''),
    coalesce(p_data->>'role',''),coalesce(p_data->>'community',''),(p_data->>'pain_level')::integer,
    p_data->>'intent',(p_data->>'buyer')::boolean,p_data->>'matched_resource_url',coalesce(p_data->>'workflow_name',''))
  on conflict(campaign_id,platform,source_url) do update set last_seen_at=now() returning * into o;
  if o.post_id is null and o.status <> 'dismissed' then
    insert into acquisition_posts(campaign_id,platform,body,destination_url,outreach_kind)
      values(o.campaign_id,o.platform,p_data->>'reply',o.matched_resource_url,case when o.platform='linkedin' then 'connection_message' else 'reply' end)
      returning id into draft_id;
    update acquisition_opportunities set post_id=draft_id where id=o.id returning * into o;
  end if;
  return o;
end $$;

-- Old workers cannot claim or publish posts after this migration.
create or replace function public.acquisition_claim() returns setof public.acquisition_posts language plpgsql set search_path=public as $$
begin raise exception 'Automatic posting is disabled; use manual outreach'; end $$;
create or replace function public.acquisition_delivery(p_id uuid,p_token uuid,p_external_id text,p_url text,p_error text)
returns void language plpgsql set search_path=public as $$
begin raise exception 'Automatic posting is disabled; record a manual send in Acquisition'; end $$;

create function public.acquisition_mark_sent(p_id uuid,p_revision integer,p_actor uuid,p_url text)
returns public.acquisition_posts language plpgsql set search_path=public as $$
declare p acquisition_posts;
begin
  select * into p from acquisition_posts where id=p_id for update;
  if not found or p.revision <> p_revision then raise exception 'Post changed; reload before trying again'; end if;
  if p.status='published' then return p; end if;
  if p.status not in ('approved','scheduled') or p.approved_at is null then raise exception 'Approve the current draft before recording a manual send'; end if;
  if p_url is null or p_url !~ '^https://' then raise exception 'Source thread, profile, or published post URL required'; end if;
  update acquisition_posts set status='published',published_at=now(),external_url=p_url,last_actor_id=p_actor,error=null where id=p_id returning * into p;
  return p;
end $$;
revoke all on function public.acquisition_import_opportunity(jsonb) from public,anon,authenticated;
revoke all on function public.acquisition_mark_sent(uuid,integer,uuid,text) from public,anon,authenticated;
grant execute on function public.acquisition_import_opportunity(jsonb) to service_role;
grant execute on function public.acquisition_mark_sent(uuid,integer,uuid,text) to service_role;
commit;
