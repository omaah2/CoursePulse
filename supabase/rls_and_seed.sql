-- Supabase RLS + seed SQL

-- Enable pgcrypto for gen_random_uuid() if not available
create extension if not exists "pgcrypto";

-- Table: courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  code text,
  title text,
  progress int default 0,
  user_id uuid references auth.users(id)
);

-- Table: tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  title text,
  due_date timestamptz,
  priority text,
  completed boolean default false,
  user_id uuid references auth.users(id)
);

-- RLS policies: allow users to insert/select/update/delete only their rows
alter table courses enable row level security;
create policy "courses_per_user" on courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table tasks enable row level security;
create policy "tasks_per_user" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed example (replace with your user ids)
insert into courses (code, title, progress, user_id)
values
('GET210', 'Engineering Mathematics', 78, null),
('ABE204', 'Matlab', 65, null)
on conflict do nothing;

insert into tasks (course_id, title, due_date, priority, completed, user_id)
select c.id, 'Complete ' || c.code || ' Assignment', now() + interval '1 day', 'High', false, c.user_id
from courses c
where c.user_id is null
on conflict do nothing;

-- Note: replace null user_id seeds with real auth user IDs or remove user_id constraints for demos.
