-- Apogee database. Paste all of this into the Supabase SQL editor and press Run.
-- It is safe to run more than once.

-- One row per student: their name and the domain they last chose.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  selected_domain text,
  updated_at timestamptz not null default now()
);

-- One row per ticked step. Unticking deletes the row.
create table if not exists public.completed_steps (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  step_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, step_id)
);

-- Row level security: each student can only see and change their own rows.
alter table public.profiles enable row level security;
alter table public.completed_steps enable row level security;

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Create own profile" on public.profiles;
create policy "Create own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Read own steps" on public.completed_steps;
create policy "Read own steps" on public.completed_steps
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Tick own steps" on public.completed_steps;
create policy "Tick own steps" on public.completed_steps
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Untick own steps" on public.completed_steps;
create policy "Untick own steps" on public.completed_steps
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Logged-in students can use these tables (still limited by the policies above).
-- Visitors who are not logged in get no access at all.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.completed_steps to authenticated;
revoke all on public.profiles, public.completed_steps from anon;

-- Create a profile automatically when someone signs up, using the name they typed.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, left(new.raw_user_meta_data ->> 'name', 80))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
