create type sales_activity_type as enum (
  'call_connected',
  'call_no_answer',
  'email_sent',
  'viewing_booked',
  'viewing_completed',
  'proposal_sent',
  'follow_up',
  'provisional',
  'note'
);

alter table enquiries
  add column if not exists priority text not null default 'normal',
  add column if not exists owner_name text,
  add column if not exists next_action text,
  add column if not exists next_action_at timestamptz,
  add column if not exists viewing_at timestamptz,
  add column if not exists proposal_sent_at timestamptz,
  add column if not exists provisional_expires_at timestamptz,
  add column if not exists lost_reason text,
  add column if not exists lost_notes text,
  add column if not exists ai_summary text,
  add column if not exists ai_recommended_action text,
  add column if not exists ai_last_scored_at timestamptz;

create table if not exists enquiry_sales_activities (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  activity_type sales_activity_type not null,
  title text not null,
  detail text,
  outcome text,
  next_action text,
  next_action_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists enquiry_proposals (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  version integer not null default 1,
  title text not null,
  status text not null default 'draft',
  value numeric(12,2),
  content jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists enquiry_viewings (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  outcome text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists enquiry_ai_assessments (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  score integer check (score between 0 and 100),
  summary text,
  intent_signals jsonb not null default '[]'::jsonb,
  missing_information jsonb not null default '[]'::jsonb,
  recommended_products jsonb not null default '[]'::jsonb,
  recommended_action text,
  risk_flags jsonb not null default '[]'::jsonb,
  model_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_enquiries_next_action_at on enquiries(next_action_at);
create index if not exists idx_enquiry_sales_activities_enquiry on enquiry_sales_activities(enquiry_id, created_at desc);
create index if not exists idx_enquiry_proposals_enquiry on enquiry_proposals(enquiry_id, created_at desc);
create index if not exists idx_enquiry_viewings_enquiry on enquiry_viewings(enquiry_id, scheduled_at desc);
create index if not exists idx_enquiry_ai_assessments_enquiry on enquiry_ai_assessments(enquiry_id, created_at desc);
