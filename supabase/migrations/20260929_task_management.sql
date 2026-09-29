create table if not exists public.task_overrides (
  id text primary key,
  data jsonb not null,
  status text not null default 'published' check (status in ('published', 'draft', 'archived')),
  revision integer not null default 1,
  updated_by text not null,
  updated_at timestamptz not null default now()
);
alter table public.task_overrides enable row level security;
revoke all on public.task_overrides from anon, authenticated;

create table if not exists public.task_change_history (
  id bigint generated always as identity primary key,
  task_id text not null,
  data jsonb not null,
  status text not null,
  revision integer not null,
  changed_by text not null,
  changed_at timestamptz not null default now()
);
alter table public.task_change_history enable row level security;
revoke all on public.task_change_history from anon, authenticated;

create table if not exists public.task_images (
  id uuid primary key,
  mime_type text not null,
  content bytea not null,
  created_by text not null,
  created_at timestamptz not null default now()
);
alter table public.task_images enable row level security;
revoke all on public.task_images from anon, authenticated;
