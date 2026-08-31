-- Backstage v0.6
-- Deepens wedding pricing, quote and structured planning.

CREATE TABLE IF NOT EXISTS wedding_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  expires_at timestamptz,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  issued_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, version)
);

CREATE TABLE IF NOT EXISTS wedding_quote_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES wedding_quotes(id) ON DELETE CASCADE,
  venue_product_id uuid REFERENCES venue_products(id) ON DELETE SET NULL,
  category text NOT NULL,
  name_snapshot text NOT NULL,
  description_snapshot text,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS wedding_pricing_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  venue_product_id uuid REFERENCES venue_products(id) ON DELETE SET NULL,
  product_name_snapshot text NOT NULL,
  category_snapshot text,
  price_snapshot numeric(12,2) NOT NULL,
  price_type_snapshot text,
  effective_event_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_planning_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  field_key text NOT NULL,
  label_snapshot text NOT NULL,
  value jsonb,
  status text NOT NULL DEFAULT 'missing',
  owner_scope text NOT NULL DEFAULT 'Shared',
  customer_visible boolean NOT NULL DEFAULT false,
  source text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, section_key, field_key)
);

CREATE TABLE IF NOT EXISTS wedding_planning_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  section_key text,
  field_key text,
  previous_value jsonb,
  new_value jsonb,
  changed_by text,
  change_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_ai_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  check_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  detail text,
  related_section text,
  related_field text,
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_quotes_wedding
  ON wedding_quotes(wedding_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_wedding_quote_lines_quote
  ON wedding_quote_lines(quote_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_wedding_planning_fields_wedding
  ON wedding_planning_fields(wedding_id, section_key);

CREATE INDEX IF NOT EXISTS idx_wedding_planning_changes_wedding
  ON wedding_planning_changes(wedding_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wedding_ai_checks_open
  ON wedding_ai_checks(wedding_id, resolved_at)
  WHERE resolved_at IS NULL;
