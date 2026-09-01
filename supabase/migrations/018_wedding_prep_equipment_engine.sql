-- Backstage v0.15 - Wedding Prep & Equipment Engine
create table if not exists public.venue_wedding_prep_rules (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null,
  rule_key text not null,
  department text not null,
  item_name text not null,
  calculation_type text not null default 'fixed',
  calculation_config jsonb not null default '{}'::jsonb,
  notes text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, rule_key)
);
create index if not exists idx_venue_wedding_prep_rules_venue on public.venue_wedding_prep_rules (venue_id, active, sort_order);

create table if not exists public.wedding_prep_snapshots (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  venue_id uuid,
  version integer not null default 1,
  prep_snapshot jsonb not null,
  planning_fingerprint text,
  guests_fingerprint text,
  timings_fingerprint text,
  commercial_fingerprint text,
  operations_fingerprint text,
  status text not null default 'draft' check (status in ('draft','issued','stale','superseded')),
  generated_at timestamptz not null default now(),
  issued_at timestamptz,
  issued_by text
);
create index if not exists idx_wedding_prep_snapshots_lookup on public.wedding_prep_snapshots (wedding_id, version desc);
