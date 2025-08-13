create table if not exists public.user_onboarding_profile (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	answers jsonb not null default '{}'::jsonb,
	created_at timestamp with time zone default now(),
	updated_at timestamp with time zone default now(),
	constraint user_onboarding_profile_unique unique (user_id)
);
