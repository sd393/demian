-- ============================================================
-- Row Level Security Policies
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles          enable row level security;
alter table public.startups          enable row level security;
alter table public.investor_profiles enable row level security;
alter table public.pitch_versions    enable row level security;
alter table public.saved_startups    enable row level security;
alter table public.startup_views     enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- INSERT is service_role only (signup server action creates profiles)
-- No insert policy needed — service_role bypasses RLS

-- ============================================================
-- STARTUPS
-- ============================================================

-- Founders can insert their own startup
create policy "Founders can insert own startup"
  on public.startups for insert
  with check (
    auth.uid() = founder_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'founder'
    )
  );

-- Founders can read their own startup
create policy "Founders can read own startup"
  on public.startups for select
  using (
    auth.uid() = founder_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'founder'
    )
  );

-- Founders can update their own startup
create policy "Founders can update own startup"
  on public.startups for update
  using (
    auth.uid() = founder_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'founder'
    )
  );

-- Investors can read all startups
create policy "Investors can read all startups"
  on public.startups for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );

-- ============================================================
-- INVESTOR PROFILES
-- ============================================================

-- Investors can insert their own profile
create policy "Investors can insert own profile"
  on public.investor_profiles for insert
  with check (
    auth.uid() = investor_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );

-- Investors can read their own profile
create policy "Investors can read own profile"
  on public.investor_profiles for select
  using (
    auth.uid() = investor_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );

-- Investors can update their own profile
create policy "Investors can update own profile"
  on public.investor_profiles for update
  using (
    auth.uid() = investor_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );

-- ============================================================
-- PITCH VERSIONS
-- ============================================================

-- Founders can insert pitch versions for their own startup
create policy "Founders can insert own pitch versions"
  on public.pitch_versions for insert
  with check (
    exists (
      select 1 from public.startups
      where startups.id = startup_id and startups.founder_id = auth.uid()
    )
  );

-- Founders can read their own pitch versions
create policy "Founders can read own pitch versions"
  on public.pitch_versions for select
  using (
    exists (
      select 1 from public.startups
      where startups.id = startup_id and startups.founder_id = auth.uid()
    )
  );

-- Investors can read all pitch versions
create policy "Investors can read all pitch versions"
  on public.pitch_versions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );

-- ============================================================
-- SAVED STARTUPS
-- ============================================================

-- Investors can manage their own saves
create policy "Investors can insert own saves"
  on public.saved_startups for insert
  with check (
    auth.uid() = investor_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );

create policy "Investors can read own saves"
  on public.saved_startups for select
  using (auth.uid() = investor_id);

create policy "Investors can delete own saves"
  on public.saved_startups for delete
  using (auth.uid() = investor_id);

-- ============================================================
-- STARTUP VIEWS
-- ============================================================

-- Investors can insert views
create policy "Investors can insert views"
  on public.startup_views for insert
  with check (
    auth.uid() = investor_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );

-- Founders can read views on their own startup
create policy "Founders can read views on own startup"
  on public.startup_views for select
  using (
    exists (
      select 1 from public.startups
      where startups.id = startup_id and startups.founder_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE POLICIES (pitch-decks bucket)
-- ============================================================

-- Founders can upload to their own folder
create policy "Founders can upload own decks"
  on storage.objects for insert
  with check (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'founder'
    )
  );

-- Founders can read their own decks
create policy "Founders can read own decks"
  on storage.objects for select
  using (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Founders can update (overwrite) their own decks
create policy "Founders can update own decks"
  on storage.objects for update
  using (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Investors can read all decks
create policy "Investors can read all decks"
  on storage.objects for select
  using (
    bucket_id = 'pitch-decks'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'investor'
    )
  );
