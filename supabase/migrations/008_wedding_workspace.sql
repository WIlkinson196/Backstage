create type wedding_status as enum ('planning','finalising','ready','live','completed');
create type wedding_meeting_type as enum ('first','halfway','final');
create type wedding_payment_status as enum ('paid','due','overdue','scheduled');

create table if not exists weddings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  enquiry_id uuid references enquiries(id) on delete set null,
  couple_name text not null,
  event_date date not null,
  package_product_id uuid references venue_products(id) on delete set null,
  package_name_snapshot text,
  day_guests integer not null default 0,
  evening_guests integer not null default 0,
  quoted_value numeric(12,2) not null default 0,
  paid_value numeric(12,2) not null default 0,
  coordinator_name text,
  status wedding_status not null default 'planning',
  ceremony_type text not null default 'onsite',
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  planning_score integer not null default 0 check (planning_score between 0 and 100),
  next_milestone text,
  next_milestone_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wedding_planning (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  section_key text not null,
  data jsonb not null default '{}'::jsonb,
  completed_percent integer not null default 0 check (completed_percent between 0 and 100),
  updated_at timestamptz not null default now(),
  unique(wedding_id, section_key)
);

create table if not exists wedding_meetings (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  meeting_type wedding_meeting_type not null,
  planned_at timestamptz,
  completed_at timestamptz,
  completed_by text,
  state jsonb not null default '{}'::jsonb,
  notes text,
  unique(wedding_id, meeting_type)
);

create table if not exists wedding_tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  title text not null,
  category text not null,
  priority text not null default 'Medium',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists wedding_payments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null,
  due_at timestamptz,
  paid_at timestamptz,
  status wedding_payment_status not null default 'scheduled',
  stripe_payment_intent_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists wedding_timeline (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_time time,
  title text not null,
  detail text,
  category text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists wedding_documents (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  document_type text not null,
  title text not null,
  version integer not null default 1,
  status text not null default 'draft',
  storage_path text,
  generated_from jsonb not null default '{}'::jsonb,
  issued_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists wedding_guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  guest_type text,
  table_name text,
  dietary_requirements text,
  menu_choice jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists wedding_running_order (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_time time,
  title text not null,
  owner text,
  operational_notes text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists wedding_finalisation (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null unique references weddings(id) on delete cascade,
  readiness jsonb not null default '{}'::jsonb,
  issued_version integer,
  issued_at timestamptz,
  issued_by text,
  source_hash text,
  reissue_required boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_weddings_venue_date on weddings(venue_id, event_date);
create index if not exists idx_wedding_tasks_due on wedding_tasks(wedding_id, due_at);
create index if not exists idx_wedding_documents_wedding on wedding_documents(wedding_id, created_at desc);
create index if not exists idx_wedding_guests_wedding on wedding_guests(wedding_id);
