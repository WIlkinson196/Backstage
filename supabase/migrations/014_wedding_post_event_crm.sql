-- Backstage v0.11 — Wedding Post-Event CRM
-- Additive foundation for close-out, reviews, permissions and anniversary retention.

create table if not exists wedding_post_event_records (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  event_closed boolean not null default false,
  closeout_completed_at timestamptz,
  thank_you_status text not null default 'not_sent',
  thank_you_sent_at timestamptz,
  review_status text not null default 'not_requested',
  review_requested_at timestamptz,
  review_received_at timestamptz,
  review_rating integer,
  review_source text,
  review_excerpt text,
  testimonial_permission text not null default 'unknown',
  media_permission text not null default 'unknown',
  anniversary_status text not null default 'not_scheduled',
  anniversary_send_date date,
  repeat_opportunity text,
  estimated_repeat_value numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id)
);

create table if not exists wedding_post_event_tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  category text not null,
  label text not null,
  detail text,
  owner text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists wedding_relationship_touchpoints (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  touchpoint_type text not null,
  channel text not null,
  status text not null default 'recommended',
  scheduled_for timestamptz,
  completed_at timestamptz,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists wedding_marketing_permissions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  permission_type text not null,
  status text not null default 'unknown',
  requested_at timestamptz,
  responded_at timestamptz,
  evidence_note text,
  created_at timestamptz not null default now(),
  unique (wedding_id, permission_type)
);

create index if not exists idx_wedding_post_event_tasks_wedding on wedding_post_event_tasks(wedding_id);
create index if not exists idx_wedding_touchpoints_wedding on wedding_relationship_touchpoints(wedding_id);
create index if not exists idx_wedding_touchpoints_schedule on wedding_relationship_touchpoints(scheduled_for);
