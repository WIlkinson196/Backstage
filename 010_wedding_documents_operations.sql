-- Backstage v0.7
-- Operational documents, running order and source-version tracking.

ALTER TABLE wedding_documents
  ADD COLUMN IF NOT EXISTS source_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source_hash text,
  ADD COLUMN IF NOT EXISTS changed_since_issue boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_generated_at timestamptz;

ALTER TABLE wedding_running_order
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'planned',
  ADD COLUMN IF NOT EXISTS source_section text,
  ADD COLUMN IF NOT EXISTS source_field text;

CREATE TABLE IF NOT EXISTS wedding_document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES wedding_documents(id) ON DELETE CASCADE,
  version integer NOT NULL,
  storage_path text,
  source_hash text,
  source_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  issued_at timestamptz,
  issued_by text,
  UNIQUE(document_id, version)
);

CREATE TABLE IF NOT EXISTS wedding_function_sheet_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'complete',
  generated_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_hash text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, section_key)
);

CREATE TABLE IF NOT EXISTS wedding_readiness_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  check_key text NOT NULL,
  label text NOT NULL,
  detail text,
  status text NOT NULL DEFAULT 'pass',
  blocking boolean NOT NULL DEFAULT false,
  source_section text,
  source_field text,
  resolved_at timestamptz,
  checked_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(wedding_id, check_key)
);

CREATE INDEX IF NOT EXISTS idx_wedding_document_versions_document
  ON wedding_document_versions(document_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_wedding_running_order_time
  ON wedding_running_order(wedding_id, event_time, sort_order);

CREATE INDEX IF NOT EXISTS idx_wedding_readiness_open
  ON wedding_readiness_checks(wedding_id, status)
  WHERE resolved_at IS NULL;
