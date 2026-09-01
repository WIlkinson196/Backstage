-- Backstage v0.12 — Wedding Automation + AI Planning Agent

create table if not exists public.wedding_automation_signals (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  venue_id uuid,
  severity text not null check (severity in ('critical','attention','opportunity','healthy')),
  title text not null,
  detail text,
  reason text,
  source text,
  owner text,
  status text not null default 'open' check (status in ('open','dismissed','resolved','approved')),
  requires_approval boolean not null default false,
  suggested_action text,
  estimated_value numeric(12,2),
  detected_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists idx_wedding_automation_signals_wedding on public.wedding_automation_signals (wedding_id, status, detected_at desc);

create table if not exists public.wedding_automation_rules (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid,
  venue_id uuid,
  name text not null,
  description text,
  trigger_key text not null,
  action_key text not null,
  enabled boolean not null default true,
  approval_mode text not null default 'customer_facing' check (approval_mode in ('always','customer_facing','never')),
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_wedding_automation_rules_wedding on public.wedding_automation_rules (wedding_id, enabled);

create table if not exists public.wedding_ai_drafts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  venue_id uuid,
  channel text not null check (channel in ('email','portal','internal')),
  recipient_name text,
  recipient_address text,
  subject text,
  body text not null,
  reason text,
  status text not null default 'draft' check (status in ('draft','approved','rejected','sent')),
  generated_at timestamptz not null default now(),
  approved_at timestamptz,
  sent_at timestamptz
);
create index if not exists idx_wedding_ai_drafts_wedding on public.wedding_ai_drafts (wedding_id, status, generated_at desc);

create table if not exists public.wedding_agent_activity (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  venue_id uuid,
  agent_name text not null default 'planning_agent',
  action_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  actor_type text not null default 'backstage' check (actor_type in ('backstage','user','customer','system')),
  created_at timestamptz not null default now()
);
create index if not exists idx_wedding_agent_activity_wedding on public.wedding_agent_activity (wedding_id, created_at desc);
