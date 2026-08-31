create table if not exists venue_branding (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null unique references venues(id) on delete cascade,
  primary_colour text,
  secondary_colour text,
  accent_colour text,
  logo_url text,
  favicon_url text,
  proposal_logo_url text,
  email_logo_url text,
  portal_hero_url text,
  tone_of_voice text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists venue_space_features (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references venue_spaces(id) on delete cascade,
  feature_key text not null,
  feature_label text not null,
  value_text text,
  value_boolean boolean,
  metadata jsonb not null default '{}'::jsonb,
  unique(space_id, feature_key)
);

create table if not exists venue_product_inclusions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references venue_products(id) on delete cascade,
  label text not null,
  description text,
  quantity numeric,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0
);

create table if not exists venue_knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  knowledge_type text not null,
  title text not null,
  content text not null,
  source_table text,
  source_id uuid,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_venue_knowledge_entries_venue
  on venue_knowledge_entries(venue_id, knowledge_type);
