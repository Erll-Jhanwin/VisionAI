-- Drop all existing policies first
drop policy if exists "Allow anonymous read/write" on analysis_history;
drop policy if exists "Enable read access for all users" on analysis_history;
drop policy if exists "Enable insert access for all users" on analysis_history;

-- Create the table if it doesn't exist
create table if not exists analysis_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  objects text,
  context text,
  recommendations text
);

-- Ensure RLS is enabled
alter table analysis_history enable row level security;

-- Create separate policies for each operation
create policy "anon_select" on analysis_history
  for select
  using (true);

create policy "anon_insert" on analysis_history
  for insert
  with check (true);
