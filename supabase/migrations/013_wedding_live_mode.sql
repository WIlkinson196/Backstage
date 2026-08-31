-- Backstage v0.10 — Wedding Live Mode
-- Additive foundation for event-day delivery. Existing planning records remain the source of truth.

create table if not exists wedding_live_sessions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','live','paused','completed')),
  started_at timestamptz,
  completed_at timestamptz,
  started_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wedding_live_timeline_state (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  running_order_item_id uuid references wedding_running_order(id) on delete set null,
  state text not null default 'upcoming' check (state in ('complete','current','next','upcoming','late','attention')),
  completed_at timestamptz,
  completed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wedding_live_checks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  category text not null,
  label text not null,
  detail text,
  critical boolean not null default false,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by uuid,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wedding_live_notes (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  kind text not null default 'note' check (kind in ('note','change','incident')),
  body text not null,
  author_user_id uuid,
  author_name text,
  created_at timestamptz not null default now()
);

create table if not exists wedding_live_contacts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  role text not null,
  name text not null,
  phone text,
  arrival_time time,
  status text not null default 'confirmed' check (status in ('onsite','due','confirmed','unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wedding_live_sessions_wedding on wedding_live_sessions(wedding_id);
create index if not exists idx_wedding_live_timeline_wedding on wedding_live_timeline_state(wedding_id);
create index if not exists idx_wedding_live_checks_wedding on wedding_live_checks(wedding_id);
create index if not exists idx_wedding_live_notes_wedding on wedding_live_notes(wedding_id, created_at desc);
create index if not exists idx_wedding_live_contacts_wedding on wedding_live_contacts(wedding_id);
