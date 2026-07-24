-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)

-- 1. Profiles: one row per logged-in user, auto-filled from Google login
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  reminder_enabled boolean default false,
  reminder_time text default '20:00', -- "HH:MM", 24hr, local to the device that sets it
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up via Google
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Sadhana entries: one row per user per day
create table if not exists sadhana_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  entry_date date not null,
  sleep_time time,        -- previous day's sleep time
  wake_time time,
  rounds_chanted int default 0,
  reading_minutes int default 0,
  listening_minutes int default 0,
  mangal_aarti boolean default false,
  seva boolean default false,
  srimad_bhagavatam boolean default false, -- attended SB class, yes/no
  score int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, entry_date)
);

alter table sadhana_entries enable row level security;

-- Everyone can see everyone's sadhana (this is the whole point of the app)
create policy "Entries are viewable by everyone"
  on sadhana_entries for select
  using (true);

create policy "Users can insert their own entries"
  on sadhana_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on sadhana_entries for update
  using (auth.uid() = user_id);

create index if not exists idx_sadhana_entries_date on sadhana_entries (entry_date);
create index if not exists idx_sadhana_entries_user on sadhana_entries (user_id);

-- 3. User badges: records the date each badge was first earned.
-- Rows are only ever inserted once per (user_id, badge_key) — the app
-- checks "have I recorded this yet?" before inserting, so the earned_at
-- date stays fixed even though badge eligibility is recalculated live.
create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique (user_id, badge_key)
);

alter table user_badges enable row level security;

create policy "Badge history is viewable by everyone"
  on user_badges for select
  using (true);

create policy "Users can insert their own badge records"
  on user_badges for insert
  with check (auth.uid() = user_id);