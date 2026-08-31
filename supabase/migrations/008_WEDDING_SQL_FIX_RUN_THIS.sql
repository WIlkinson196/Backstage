-- Backstage v0.5.1
-- Wedding workspace migration.
-- Safe to run on a fresh database OR where an older "weddings" table already exists.
-- Also safe to re-run after a partially failed v0.5 migration.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wedding_status') THEN
    CREATE TYPE wedding_status AS ENUM ('planning','finalising','ready','live','completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wedding_meeting_type') THEN
    CREATE TYPE wedding_meeting_type AS ENUM ('first','halfway','final');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wedding_payment_status') THEN
    CREATE TYPE wedding_payment_status AS ENUM ('paid','due','overdue','scheduled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS weddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Upgrade an existing weddings table instead of assuming it is brand new.
ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS venue_id uuid,
  ADD COLUMN IF NOT EXISTS enquiry_id uuid,
  ADD COLUMN IF NOT EXISTS couple_name text,
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS package_product_id uuid,
  ADD COLUMN IF NOT EXISTS package_name_snapshot text,
  ADD COLUMN IF NOT EXISTS day_guests integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS evening_guests integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quoted_value numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_value numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coordinator_name text,
  ADD COLUMN IF NOT EXISTS status wedding_status NOT NULL DEFAULT 'planning',
  ADD COLUMN IF NOT EXISTS ceremony_type text NOT NULL DEFAULT 'onsite',
  ADD COLUMN IF NOT EXISTS readiness_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS planning_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_milestone text,
  ADD COLUMN IF NOT EXISTS next_milestone_at timestamptz,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Add constraints only when they do not already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'weddings_venue_id_fkey'
  ) THEN
    ALTER TABLE weddings
      ADD CONSTRAINT weddings_venue_id_fkey
      FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'weddings_enquiry_id_fkey'
  ) THEN
    ALTER TABLE weddings
      ADD CONSTRAINT weddings_enquiry_id_fkey
      FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'weddings_package_product_id_fkey'
  ) THEN
    ALTER TABLE weddings
      ADD CONSTRAINT weddings_package_product_id_fkey
      FOREIGN KEY (package_product_id) REFERENCES venue_products(id) ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'weddings_readiness_score_check'
  ) THEN
    ALTER TABLE weddings
      ADD CONSTRAINT weddings_readiness_score_check
      CHECK (readiness_score BETWEEN 0 AND 100) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'weddings_planning_score_check'
  ) THEN
    ALTER TABLE weddings
      ADD CONSTRAINT weddings_planning_score_check
      CHECK (planning_score BETWEEN 0 AND 100) NOT VALID;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS wedding_planning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_percent integer NOT NULL DEFAULT 0 CHECK (completed_percent BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, section_key)
);

CREATE TABLE IF NOT EXISTS wedding_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  meeting_type wedding_meeting_type NOT NULL,
  planned_at timestamptz,
  completed_at timestamptz,
  completed_by text,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  UNIQUE(wedding_id, meeting_type)
);

CREATE TABLE IF NOT EXISTS wedding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  label text NOT NULL,
  amount numeric(12,2) NOT NULL,
  due_at timestamptz,
  paid_at timestamptz,
  status wedding_payment_status NOT NULL DEFAULT 'scheduled',
  stripe_payment_intent_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_time time,
  title text NOT NULL,
  detail text,
  category text,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS wedding_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  title text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  storage_path text,
  generated_from jsonb NOT NULL DEFAULT '{}'::jsonb,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name text NOT NULL,
  guest_type text,
  table_name text,
  dietary_requirements text,
  menu_choice jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS wedding_running_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_time time,
  title text NOT NULL,
  owner text,
  operational_notes text,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS wedding_finalisation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  readiness jsonb NOT NULL DEFAULT '{}'::jsonb,
  issued_version integer,
  issued_at timestamptz,
  issued_by text,
  source_hash text,
  reissue_required boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_weddings_venue_date
  ON weddings(venue_id, event_date);

CREATE INDEX IF NOT EXISTS idx_wedding_tasks_due
  ON wedding_tasks(wedding_id, due_at);

CREATE INDEX IF NOT EXISTS idx_wedding_documents_wedding
  ON wedding_documents(wedding_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wedding_guests_wedding
  ON wedding_guests(wedding_id);
