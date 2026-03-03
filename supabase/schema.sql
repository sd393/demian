-- ============================================================
-- Demian Database Schema
-- Run this in the Supabase SQL Editor FIRST, then run policies.sql
-- ============================================================

-- 1. Profiles ------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('founder', 'investor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Startups ------------------------------------------------
create table public.startups (
  id            uuid primary key default gen_random_uuid(),
  founder_id    uuid not null references public.profiles(id) on delete cascade unique,
  startup_name  text not null,
  founder_name  text not null,
  school        text not null,
  email         text not null,
  sector        text,
  stage         text,
  website       text,
  one_liner     text not null,
  problem       text not null,
  solution      text not null,
  traction      text,
  fundraising   text,
  deck_path     text,
  location      text,
  tags          text[],
  pitch_score   smallint check (pitch_score between 0 and 100),
  fit_score     smallint check (fit_score between 0 and 100),
  percentile    smallint check (percentile between 0 and 100),
  strengths     text[],
  weaknesses    text[],
  improvements  jsonb,
  summary       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 3. Investor Profiles ----------------------------------------
create table public.investor_profiles (
  id              uuid primary key default gen_random_uuid(),
  investor_id     uuid not null references public.profiles(id) on delete cascade unique,
  investor_name   text not null,
  firm_name       text not null,
  role            text,
  linkedin_url    text,
  sectors         text[] not null,
  stages          text[],
  check_size_min  text,
  check_size_max  text,
  geography       text[],
  thesis          text,
  not_interested  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 4. Pitch Versions -------------------------------------------
create table public.pitch_versions (
  id          uuid primary key default gen_random_uuid(),
  startup_id  uuid not null references public.startups(id) on delete cascade,
  version     smallint not null,
  deck_path   text,
  score       smallint check (score between 0 and 100),
  uploaded_at timestamptz not null default now()
);

-- 5. Saved Startups (investor bookmarks) ----------------------
create table public.saved_startups (
  investor_id uuid not null references public.profiles(id) on delete cascade,
  startup_id  uuid not null references public.startups(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (investor_id, startup_id)
);

-- 6. Startup Views (investor engagement tracking) -------------
create table public.startup_views (
  id          uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.profiles(id) on delete cascade,
  startup_id  uuid not null references public.startups(id) on delete cascade,
  viewed_at   timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_startups_founder    on public.startups(founder_id);
create index idx_startups_sector     on public.startups(sector);
create index idx_startups_stage      on public.startups(stage);
create index idx_pitch_versions_startup on public.pitch_versions(startup_id);
create index idx_saved_startups_investor on public.saved_startups(investor_id);
create index idx_startup_views_startup   on public.startup_views(startup_id);
create index idx_startup_views_investor  on public.startup_views(investor_id);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_startups_updated_at
  before update on public.startups
  for each row execute function public.handle_updated_at();

create trigger set_investor_profiles_updated_at
  before update on public.investor_profiles
  for each row execute function public.handle_updated_at();
