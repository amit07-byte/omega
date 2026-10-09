-- Omega V1 authentication profile.
-- Apply this in the Supabase SQL editor. The app only has the public anon key,
-- so it cannot create tables or policies itself.
--
-- Each confirmed signup stores the account role chosen on the signup form.
-- Row Level Security lets a signed-in user read and write only their own row.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('business', 'creator')),
  constraint profiles_display_name_length check (
    char_length(display_name) between 2 and 80
  )
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on table public.profiles from public;
grant select, insert, update on table public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen_role text;
  chosen_name text;
begin
  chosen_role := coalesce(new.raw_user_meta_data ->> 'role', 'creator');
  if chosen_role not in ('business', 'creator') then
    chosen_role := 'creator';
  end if;

  chosen_name := trim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  if char_length(chosen_name) < 2 then
    chosen_name := split_part(coalesce(new.email, 'member'), '@', 1);
  end if;
  if char_length(chosen_name) > 80 then
    chosen_name := left(chosen_name, 80);
  end if;
  if char_length(chosen_name) < 2 then
    chosen_name := 'Member';
  end if;

  insert into public.profiles (id, email, role, display_name)
  values (new.id, coalesce(new.email, ''), chosen_role, chosen_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
