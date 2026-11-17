-- Marketplace tables for business campaigns and creator applications.
-- Apply in the Supabase SQL editor after the profiles migration.
-- The app uses the public anon key only. Nothing in the app marks a plan as paid.

create table if not exists public.business_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null,
  category text not null,
  description text not null,
  website text not null default '',
  city text not null,
  neighborhood text not null,
  updated_at timestamptz not null default now(),
  constraint business_profiles_name_length check (char_length(business_name) between 2 and 80),
  constraint business_profiles_category_length check (char_length(category) between 2 and 40),
  constraint business_profiles_description_length check (char_length(description) between 10 and 600),
  constraint business_profiles_city_length check (char_length(city) between 2 and 80),
  constraint business_profiles_neighborhood_length check (char_length(neighborhood) between 2 and 80)
);

create table if not exists public.creator_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null,
  craft text not null,
  bio text not null,
  city text not null,
  neighborhood text not null,
  updated_at timestamptz not null default now(),
  constraint creator_profiles_name_length check (char_length(display_name) between 2 and 80),
  constraint creator_profiles_craft_length check (char_length(craft) between 2 and 40),
  constraint creator_profiles_bio_length check (char_length(bio) between 10 and 600),
  constraint creator_profiles_city_length check (char_length(city) between 2 and 80),
  constraint creator_profiles_neighborhood_length check (char_length(neighborhood) between 2 and 80)
);

create table if not exists public.business_subscriptions (
  business_id uuid primary key references public.profiles (id) on delete cascade,
  plan text not null default 'free',
  updated_at timestamptz not null default now(),
  constraint business_subscriptions_plan_check check (plan in ('free', 'paid'))
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles (id) on delete cascade,
  title text not null,
  summary text not null,
  deliverable text not null,
  city text not null,
  neighborhood text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  published_at timestamptz,
  constraint campaigns_title_length check (char_length(title) between 4 and 80),
  constraint campaigns_summary_length check (char_length(summary) between 10 and 600),
  constraint campaigns_deliverable_length check (char_length(deliverable) between 4 and 200),
  constraint campaigns_city_length check (char_length(city) between 2 and 80),
  constraint campaigns_neighborhood_length check (char_length(neighborhood) between 2 and 80),
  constraint campaigns_status_check check (status in ('draft', 'published'))
);

create index if not exists campaigns_published_idx
  on public.campaigns (published_at desc)
  where status = 'published';

create index if not exists campaigns_business_idx
  on public.campaigns (business_id, created_at desc);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.creator_profiles (id) on delete cascade,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_message_length check (char_length(message) between 10 and 600),
  constraint applications_status_check check (status in ('pending', 'accepted', 'rejected')),
  constraint applications_one_per_creator unique (campaign_id, creator_id)
);

create index if not exists applications_creator_idx
  on public.applications (creator_id, created_at desc);

alter table public.business_profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.business_subscriptions enable row level security;
alter table public.campaigns enable row level security;
alter table public.applications enable row level security;

create or replace function public.ensure_free_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.business_subscriptions (business_id, plan)
  values (new.id, 'free')
  on conflict (business_id) do nothing;
  return new;
end;
$$;

drop trigger if exists business_profiles_free_plan on public.business_profiles;
create trigger business_profiles_free_plan
  after insert on public.business_profiles
  for each row
  execute function public.ensure_free_plan();

create or replace function public.enforce_free_campaign_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_plan text;
  existing_count integer;
begin
  select plan into current_plan
  from public.business_subscriptions
  where business_id = new.business_id;

  if current_plan is distinct from 'paid' then
    select count(*) into existing_count
    from public.campaigns
    where business_id = new.business_id;

    if existing_count >= 1 then
      raise exception 'A free plan includes one campaign. A paid plan is required for another.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists campaigns_free_limit on public.campaigns;
create trigger campaigns_free_limit
  before insert on public.campaigns
  for each row
  execute function public.enforce_free_campaign_limit();

drop policy if exists "Public can read business profiles" on public.business_profiles;
create policy "Public can read business profiles"
  on public.business_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Businesses insert own profile" on public.business_profiles;
create policy "Businesses insert own profile"
  on public.business_profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Businesses update own profile" on public.business_profiles;
create policy "Businesses update own profile"
  on public.business_profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Authenticated can read creator profiles" on public.creator_profiles;
create policy "Authenticated can read creator profiles"
  on public.creator_profiles for select
  to authenticated
  using (true);

drop policy if exists "Creators insert own profile" on public.creator_profiles;
create policy "Creators insert own profile"
  on public.creator_profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Creators update own profile" on public.creator_profiles;
create policy "Creators update own profile"
  on public.creator_profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Businesses read own plan" on public.business_subscriptions;
create policy "Businesses read own plan"
  on public.business_subscriptions for select
  to authenticated
  using (business_id = (select auth.uid()));

drop policy if exists "Public can read published campaigns" on public.campaigns;
create policy "Public can read published campaigns"
  on public.campaigns for select
  to anon, authenticated
  using (status = 'published' or business_id = (select auth.uid()));

drop policy if exists "Businesses insert own campaigns" on public.campaigns;
create policy "Businesses insert own campaigns"
  on public.campaigns for insert
  to authenticated
  with check (
    business_id = (select auth.uid())
    and exists (
      select 1 from public.business_profiles
      where id = (select auth.uid())
    )
  );

drop policy if exists "Businesses update own campaigns" on public.campaigns;
create policy "Businesses update own campaigns"
  on public.campaigns for update
  to authenticated
  using (business_id = (select auth.uid()))
  with check (business_id = (select auth.uid()));

drop policy if exists "Participants read applications" on public.applications;
create policy "Participants read applications"
  on public.applications for select
  to authenticated
  using (
    creator_id = (select auth.uid())
    or exists (
      select 1 from public.campaigns
      where campaigns.id = applications.campaign_id
        and campaigns.business_id = (select auth.uid())
    )
  );

drop policy if exists "Creators apply to published campaigns" on public.applications;
create policy "Creators apply to published campaigns"
  on public.applications for insert
  to authenticated
  with check (
    creator_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.creator_profiles
      where id = (select auth.uid())
    )
    and exists (
      select 1 from public.campaigns
      where campaigns.id = applications.campaign_id
        and campaigns.status = 'published'
        and campaigns.business_id <> (select auth.uid())
    )
  );

drop policy if exists "Businesses decide applications" on public.applications;
create policy "Businesses decide applications"
  on public.applications for update
  to authenticated
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = applications.campaign_id
        and campaigns.business_id = (select auth.uid())
    )
  )
  with check (
    status in ('accepted', 'rejected')
    and exists (
      select 1 from public.campaigns
      where campaigns.id = applications.campaign_id
        and campaigns.business_id = (select auth.uid())
    )
  );

revoke all on public.business_profiles from anon, authenticated;
revoke all on public.creator_profiles from anon, authenticated;
revoke all on public.business_subscriptions from anon, authenticated;
revoke all on public.campaigns from anon, authenticated;
revoke all on public.applications from anon, authenticated;

grant select on public.business_profiles to anon, authenticated;
grant insert, update on public.business_profiles to authenticated;
grant select, insert, update on public.creator_profiles to authenticated;
grant select on public.business_subscriptions to authenticated;
grant select on public.campaigns to anon, authenticated;
grant insert, update on public.campaigns to authenticated;
grant select, insert, update on public.applications to authenticated;
