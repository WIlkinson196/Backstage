-- Backstage v0.9
-- Customer / Couple Portal foundation.

CREATE TABLE IF NOT EXISTS wedding_portals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  public_slug text UNIQUE,
  hero_image_url text,
  welcome_message text,
  planning_progress integer NOT NULL DEFAULT 0,
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  activated_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_portal_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id uuid NOT NULL REFERENCES wedding_portals(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  member_role text NOT NULL DEFAULT 'couple',
  auth_user_id uuid,
  invited_at timestamptz,
  accepted_at timestamptz,
  last_seen_at timestamptz,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(portal_id, email)
);

CREATE TABLE IF NOT EXISTS wedding_portal_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  wedding_task_id uuid REFERENCES wedding_tasks(id) ON DELETE SET NULL,
  title text NOT NULL,
  detail text,
  category text,
  due_at timestamptz,
  completed_at timestamptz,
  customer_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS wedding_portal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  sender_scope text NOT NULL,
  sender_name text,
  sender_user_id uuid,
  body text NOT NULL,
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_portal_document_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES wedding_documents(id) ON DELETE CASCADE,
  visible boolean NOT NULL DEFAULT true,
  visible_from timestamptz,
  visible_until timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(wedding_id, document_id)
);

CREATE TABLE IF NOT EXISTS wedding_portal_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  member_id uuid REFERENCES wedding_portal_members(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_portal_tasks_due ON wedding_portal_tasks(wedding_id, due_at);
CREATE INDEX IF NOT EXISTS idx_wedding_portal_messages ON wedding_portal_messages(wedding_id, created_at);
CREATE INDEX IF NOT EXISTS idx_wedding_portal_activity ON wedding_portal_activity(wedding_id, created_at DESC);
