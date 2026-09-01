-- Backstage v0.13 — Wedding Data & Output Foundation
create table if not exists public.wedding_output_snapshots (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null, venue_id uuid, output_key text not null,
 version integer not null default 1, audience text not null, model_snapshot jsonb not null,
 planning_fingerprint text, guests_fingerprint text, timings_fingerprint text, commercial_fingerprint text,
 status text not null default 'draft' check (status in ('draft','issued','stale','superseded')),
 generated_at timestamptz not null default now(), issued_at timestamptz, issued_by text
);
create index if not exists idx_wedding_output_snapshots_wedding on public.wedding_output_snapshots (wedding_id,output_key,version desc);
create table if not exists public.wedding_output_issues (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null, venue_id uuid, area text not null,
 level text not null check (level in ('blocker','warning','info')), message text not null, source text,
 resolved_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists idx_wedding_output_issues_wedding on public.wedding_output_issues (wedding_id,resolved_at);
