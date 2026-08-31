-- Backstage v0.8
-- Guest management, dietary matrix, seating and floor plan foundation.

ALTER TABLE wedding_guests
  ADD COLUMN IF NOT EXISTS attendance_scope text NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS rsvp_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS table_id uuid,
  ADD COLUMN IF NOT EXISTS seat_number integer,
  ADD COLUMN IF NOT EXISTS age_group text NOT NULL DEFAULT 'adult',
  ADD COLUMN IF NOT EXISTS dietary_severity text,
  ADD COLUMN IF NOT EXISTS accessibility_requirements text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'Venue',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS wedding_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name text NOT NULL,
  shape text NOT NULL DEFAULT 'round',
  capacity integer NOT NULL DEFAULT 10,
  sort_order integer NOT NULL DEFAULT 0,
  x numeric(8,3),
  y numeric(8,3),
  width numeric(8,3),
  height numeric(8,3),
  rotation numeric(8,3) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wedding_guests_table_id_fkey'
  ) THEN
    ALTER TABLE wedding_guests
      ADD CONSTRAINT wedding_guests_table_id_fkey
      FOREIGN KEY (table_id) REFERENCES wedding_tables(id) ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS wedding_floor_plan_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name text NOT NULL,
  zone_type text NOT NULL,
  x numeric(8,3),
  y numeric(8,3),
  width numeric(8,3),
  height numeric(8,3),
  rotation numeric(8,3) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS wedding_guest_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES wedding_guests(id) ON DELETE SET NULL,
  field_name text NOT NULL,
  previous_value jsonb,
  new_value jsonb,
  changed_by text,
  change_source text NOT NULL DEFAULT 'Venue',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_portal_guest_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  allow_guest_names boolean NOT NULL DEFAULT true,
  allow_rsvp boolean NOT NULL DEFAULT true,
  allow_menu_choices boolean NOT NULL DEFAULT true,
  allow_dietaries boolean NOT NULL DEFAULT true,
  allow_accessibility boolean NOT NULL DEFAULT true,
  locked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_guests_wedding_rsvp
  ON wedding_guests(wedding_id, rsvp_status);

CREATE INDEX IF NOT EXISTS idx_wedding_guests_table
  ON wedding_guests(table_id);

CREATE INDEX IF NOT EXISTS idx_wedding_tables_wedding
  ON wedding_tables(wedding_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_wedding_floor_plan_zones_wedding
  ON wedding_floor_plan_zones(wedding_id);

CREATE INDEX IF NOT EXISTS idx_wedding_guest_changes
  ON wedding_guest_change_log(wedding_id, created_at DESC);
