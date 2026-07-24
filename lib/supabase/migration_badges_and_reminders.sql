-- Run this ONCE in your existing Supabase project's SQL Editor.
-- Adds: reminder preference columns on profiles, and a new user_badges
-- table that records the date each badge was first earned.
--
-- Safe to run even if some of this already exists — it checks first.

do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_name = 'profiles' and column_name = 'reminder_enabled') then
    alter table profiles add column reminder_enabled boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_name = 'profiles' and column_name = 'reminder_time') then
    alter table profiles add column reminder_time text default '20:00';
  end if;
end $$;

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique (user_id, badge_key)
);

alter table user_badges enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where tablename = 'user_badges' and policyname = 'Badge history is viewable by everyone') then
    create policy "Badge history is viewable by everyone"
      on user_badges for select
      using (true);
  end if;

  if not exists (select 1 from pg_policies
                 where tablename = 'user_badges' and policyname = 'Users can insert their own badge records') then
    create policy "Users can insert their own badge records"
      on user_badges for insert
      with check (auth.uid() = user_id);
  end if;
end $$;