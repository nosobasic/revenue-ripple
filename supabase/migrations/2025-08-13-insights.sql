-- Ensure insights_usage table
create table if not exists public.insights_usage (
	user_id uuid not null references public.users(id) on delete cascade,
	month date not null,
	prompts_queries int default 0,
	suggestions_queries int default 0,
	constraint insights_usage_unique unique (user_id, month)
);

-- Ensure insight_daily_cache table
create table if not exists public.insight_daily_cache (
	user_id uuid not null references public.users(id) on delete cascade,
	business_id uuid null,
	day date not null,
	suggestion text not null,
	title text null,
	source text null,
	constraint insight_daily_cache_unique unique (user_id, day, business_id)
);

-- Optional RPC for atomic increment
create or replace function public.increment_suggestions_queries(p_user_id uuid, p_month date)
returns json as $$
DECLARE
	new_count int;
BEGIN
	update public.insights_usage
	set suggestions_queries = coalesce(suggestions_queries, 0) + 1
	where user_id = p_user_id and month = p_month;
	select suggestions_queries into new_count from public.insights_usage where user_id = p_user_id and month = p_month;
	return json_build_object('suggestions_queries', new_count);
END;
$$ language plpgsql security definer;