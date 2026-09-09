# CoursePulse

Academic planning platform scaffolded with React + TypeScript + Vite, Tailwind, TanStack Query, Supabase, and Recharts.

Getting started

1. Install dependencies

```bash
cd CoursePulse
npm install
```

2. Create Supabase project and copy values into `.env` (see `.env.example`)

3. Run development server

```bash
npm run dev
```

Install dependencies for FullCalendar

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

Suggested Supabase schema (run in SQL editor)

```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  code text,
  title text,
  progress int,
  user_id uuid references auth.users(id)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  title text,
  due_date timestamptz,
  priority text,
  completed boolean default false,
  user_id uuid references auth.users(id)
);
```

Next steps
- Wire React Query hooks for fetching courses/tasks
- Implement calendar view and mobile navigation
- Add RLS policies and enable Auth

RLS and seed

You can find an example SQL file at `supabase/rls_and_seed.sql` which creates tables, enables RLS policies that scope rows to `auth.uid()`, and includes a seed snippet. For a demo you may need to replace `null` user IDs with your test auth user IDs or temporarily remove the `user_id` condition.

Mutations & hooks

See `src/hooks/mutations.ts` for create/update/delete hooks using React Query and Supabase. Use `useCourses` and `useTasks` to read, and the mutation hooks to modify data.

Using the UI

- Open `/courses` and click **Add course** to create a course.
- Open `/tasks` and click **Add task** to create a task. Use Edit/Delete on each item to modify or remove.

Applying SQL

1. Open your Supabase project SQL editor.
2. Copy `supabase/rls_and_seed.sql` and run it.
3. If you keep `user_id` as `null` in seed rows, either update them to a real `auth.users` id or remove the `user_id` value for initial testing.

