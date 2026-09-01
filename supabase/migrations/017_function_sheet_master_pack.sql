-- Backstage v0.14 — Function Sheet + Master Operational Pack

create table if not exists public.wedding_output_issue_log (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  venue_id uuid,
  output_key text not null check (output_key in ('function-sheet','master-pack','running-order','kitchen-prep','customer-summary','supplier-handover')),
  version integer not null default 1,
  snapshot_id uuid,
  status text not null default 'issued' check (status in ('issued','reissued','superseded','stale')),
  planning_fingerprint text,
  guests_fingerprint text,
  timings_fingerprint text,
  commercial_fingerprint text,
  operations_fingerprint text,
  issue_note text,
  issued_by text,
  issued_at timestamptz not null default now()
);

create index if not exists idx_wedding_output_issue_log_lookup
  on public.wedding_output_issue_log (wedding_id, output_key, version desc);

alter table public.wedding_output_snapshots
  add column if not exists operations_fingerprint text;

comment on table public.wedding_output_issue_log is
  'Controlled issue and reissue history for wedding operational outputs. Source fingerprints allow stale-document detection after data changes.';
