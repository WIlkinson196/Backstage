-- Backstage v0.16 — Functional Core / Golden Path
-- Production tenancy, staff membership, canonical events and real enquiry workflow.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  platform_role text not null default 'user' check (platform_role in ('user','support','platform_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, user_id)
);

create table if not exists public.venue_memberships (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','admin','manager','sales','operations','finance','staff','viewer')),
  active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (venue_id, user_id)
);

alter table public.enquiries
  add column if not exists priority text not null default 'normal' check (priority in ('hot','warm','normal')),
  add column if not exists owner_user_id uuid references public.user_profiles(id) on delete set null,
  add column if not exists next_action text,
  add column if not exists next_action_at timestamptz,
  add column if not exists provisional_expiry timestamptz,
  add column if not exists lost_reason text;

create table if not exists public.enquiry_activity (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  activity_type text not null default 'note',
  title text not null,
  detail text,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  actor_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  source_enquiry_id uuid unique references public.enquiries(id) on delete set null,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  event_type text not null,
  title text not null,
  client_name text not null,
  event_date date,
  start_time time,
  end_time time,
  guest_count integer check (guest_count is null or guest_count >= 0),
  status text not null default 'provisional' check (status in ('draft','provisional','confirmed','planning','ready','live','completed','cancelled')),
  quoted_value numeric(12,2) not null default 0,
  paid_value numeric(12,2) not null default 0,
  owner_user_id uuid references public.user_profiles(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_activity (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  activity_type text not null default 'note',
  title text not null,
  detail text,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  actor_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  organisation_id uuid references public.organisations(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  actor_user_id uuid,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  previous_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_org_memberships_user on public.organisation_memberships(user_id, active);
create index if not exists idx_venue_memberships_user on public.venue_memberships(user_id, active);
create index if not exists idx_enquiry_activity_enquiry on public.enquiry_activity(enquiry_id, created_at desc);
create index if not exists idx_events_venue_date on public.events(venue_id, event_date);
create index if not exists idx_events_status on public.events(venue_id, status);
create index if not exists idx_event_activity_event on public.event_activity(event_id, created_at desc);
create index if not exists idx_audit_log_venue on public.audit_log(venue_id, created_at desc);

create or replace function public.create_enquiry_with_contact(
  p_venue_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_event_type text,
  p_event_date date,
  p_guest_count integer,
  p_estimated_value numeric,
  p_priority text,
  p_source text,
  p_raw_message text,
  p_ai_score integer,
  p_ai_summary text,
  p_owner_user_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_contact_id uuid;
  new_enquiry_id uuid;
begin
  insert into public.contacts (venue_id, first_name, last_name, email, phone)
  values (p_venue_id, p_first_name, nullif(p_last_name, ''), p_email, nullif(p_phone, ''))
  returning id into new_contact_id;

  insert into public.enquiries (
    venue_id, contact_id, event_type, event_date, guest_count, estimated_value,
    status, priority, source, raw_message, ai_score, ai_summary, next_action,
    next_action_at, owner_user_id
  ) values (
    p_venue_id, new_contact_id, p_event_type, p_event_date, p_guest_count,
    coalesce(p_estimated_value, 0), 'new', p_priority, p_source, p_raw_message,
    p_ai_score, p_ai_summary, 'Respond and qualify the requirement', now(), p_owner_user_id
  ) returning id into new_enquiry_id;

  return new_enquiry_id;
end;
$$;

revoke all on function public.create_enquiry_with_contact(uuid,text,text,text,text,text,date,integer,numeric,text,text,text,integer,text,uuid) from public;
grant execute on function public.create_enquiry_with_contact(uuid,text,text,text,text,text,date,integer,numeric,text,text,text,integer,text,uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_user_is_org_member(target_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.organisation_memberships m
    where m.organisation_id = target_organisation_id
      and m.user_id = auth.uid()
      and m.active
  );
$$;

create or replace function public.current_user_has_venue_access(target_venue_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.venue_memberships vm
    where vm.venue_id = target_venue_id
      and vm.user_id = auth.uid()
      and vm.active
  ) or exists (
    select 1
    from public.venues v
    join public.organisation_memberships om on om.organisation_id = v.organisation_id
    where v.id = target_venue_id
      and om.user_id = auth.uid()
      and om.active
      and om.role in ('owner','admin')
  );
$$;

create or replace function public.current_user_has_venue_role(target_venue_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.venue_memberships vm
    where vm.venue_id = target_venue_id
      and vm.user_id = auth.uid()
      and vm.active
      and vm.role = any(allowed_roles)
  ) or exists (
    select 1
    from public.venues v
    join public.organisation_memberships om on om.organisation_id = v.organisation_id
    where v.id = target_venue_id
      and om.user_id = auth.uid()
      and om.active
      and om.role in ('owner','admin')
  );
$$;

revoke all on function public.current_user_is_org_member(uuid) from public;
revoke all on function public.current_user_has_venue_access(uuid) from public;
revoke all on function public.current_user_has_venue_role(uuid, text[]) from public;
grant execute on function public.current_user_is_org_member(uuid) to authenticated;
grant execute on function public.current_user_has_venue_access(uuid) to authenticated;
grant execute on function public.current_user_has_venue_role(uuid, text[]) to authenticated;

-- Remove the temporary anonymous demo policies before production tenancy is enabled.
drop policy if exists "dev read demo organisation" on public.organisations;
drop policy if exists "dev read demo venue" on public.venues;
drop policy if exists "dev read demo venue spaces" on public.venue_spaces;
drop policy if exists "dev read demo venue products" on public.venue_products;
drop policy if exists "dev read demo venue policies" on public.venue_policies;
drop policy if exists "dev read demo venue branding" on public.venue_branding;
drop policy if exists "dev read demo knowledge" on public.venue_knowledge_entries;
drop policy if exists "dev read demo space features" on public.venue_space_features;
drop policy if exists "dev read demo product inclusions" on public.venue_product_inclusions;

alter table public.user_profiles enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.venue_memberships enable row level security;
alter table public.organisations enable row level security;
alter table public.venues enable row level security;
alter table public.contacts enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_activity enable row level security;
alter table public.events enable row level security;
alter table public.event_activity enable row level security;
alter table public.audit_log enable row level security;

-- Lock every earlier feature table before it is connected to live repositories.
-- A table with RLS and no policy is deliberately inaccessible rather than cross-tenant.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'venue_spaces','venue_products','venue_policies','venue_branding','venue_space_features',
    'venue_product_inclusions','venue_knowledge_entries','automation_rules','automation_runs',
    'enquiry_ai_assessments','enquiry_proposals','enquiry_sales_activities','enquiry_viewings',
    'weddings','wedding_planning','wedding_meetings','wedding_tasks','wedding_payments',
    'wedding_timeline','wedding_documents','wedding_guests','wedding_running_order',
    'wedding_finalisation','wedding_quotes','wedding_quote_lines','wedding_pricing_snapshots',
    'wedding_planning_fields','wedding_planning_changes','wedding_readiness_checks',
    'wedding_ai_checks','wedding_document_versions','wedding_function_sheet_sections',
    'wedding_guest_change_log','wedding_tables','wedding_floor_plan_zones','wedding_portals',
    'wedding_portal_members','wedding_portal_tasks','wedding_portal_messages',
    'wedding_portal_document_access','wedding_portal_activity','wedding_portal_guest_access',
    'wedding_live_sessions','wedding_live_timeline_state','wedding_live_checks','wedding_live_notes',
    'wedding_live_contacts','wedding_post_event_records','wedding_post_event_tasks',
    'wedding_relationship_touchpoints','wedding_marketing_permissions','wedding_automation_signals',
    'wedding_automation_rules','wedding_ai_drafts','wedding_agent_activity','wedding_output_snapshots',
    'wedding_output_issues','wedding_output_issue_log','venue_wedding_prep_rules','wedding_prep_snapshots'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
    end if;
  end loop;
end;
$$;

drop policy if exists "profiles self read" on public.user_profiles;
create policy "profiles self read" on public.user_profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles shared venue read" on public.user_profiles;
create policy "profiles shared venue read" on public.user_profiles for select to authenticated
  using (exists (
    select 1 from public.venue_memberships mine
    join public.venue_memberships theirs on theirs.venue_id = mine.venue_id
    where mine.user_id = auth.uid() and mine.active and theirs.user_id = user_profiles.id and theirs.active
  ));

drop policy if exists "organisation membership read" on public.organisation_memberships;
create policy "organisation membership read" on public.organisation_memberships for select to authenticated
  using (user_id = auth.uid() or public.current_user_is_org_member(organisation_id));

drop policy if exists "venue membership read" on public.venue_memberships;
create policy "venue membership read" on public.venue_memberships for select to authenticated
  using (user_id = auth.uid() or public.current_user_has_venue_access(venue_id));

drop policy if exists "organisation tenant read" on public.organisations;
create policy "organisation tenant read" on public.organisations for select to authenticated
  using (public.current_user_is_org_member(id));

drop policy if exists "venue tenant read" on public.venues;
create policy "venue tenant read" on public.venues for select to authenticated
  using (public.current_user_has_venue_access(id));

drop policy if exists "venue spaces tenant read" on public.venue_spaces;
create policy "venue spaces tenant read" on public.venue_spaces for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "venue spaces tenant manage" on public.venue_spaces;
create policy "venue spaces tenant manage" on public.venue_spaces for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']));

drop policy if exists "venue products tenant read" on public.venue_products;
create policy "venue products tenant read" on public.venue_products for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "venue products tenant manage" on public.venue_products;
create policy "venue products tenant manage" on public.venue_products for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']));

drop policy if exists "venue policies tenant read" on public.venue_policies;
create policy "venue policies tenant read" on public.venue_policies for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "venue policies tenant manage" on public.venue_policies;
create policy "venue policies tenant manage" on public.venue_policies for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']));

drop policy if exists "venue branding tenant read" on public.venue_branding;
create policy "venue branding tenant read" on public.venue_branding for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "venue branding tenant manage" on public.venue_branding;
create policy "venue branding tenant manage" on public.venue_branding for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']));

drop policy if exists "venue knowledge tenant read" on public.venue_knowledge_entries;
create policy "venue knowledge tenant read" on public.venue_knowledge_entries for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "venue knowledge tenant manage" on public.venue_knowledge_entries;
create policy "venue knowledge tenant manage" on public.venue_knowledge_entries for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']));

drop policy if exists "contacts tenant read" on public.contacts;
create policy "contacts tenant read" on public.contacts for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "contacts tenant create" on public.contacts;
create policy "contacts tenant create" on public.contacts for insert to authenticated
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']));
drop policy if exists "contacts tenant update" on public.contacts;
create policy "contacts tenant update" on public.contacts for update to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']));

drop policy if exists "enquiries tenant read" on public.enquiries;
create policy "enquiries tenant read" on public.enquiries for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "enquiries tenant create" on public.enquiries;
create policy "enquiries tenant create" on public.enquiries for insert to authenticated
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']));
drop policy if exists "enquiries tenant update" on public.enquiries;
create policy "enquiries tenant update" on public.enquiries for update to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']));
drop policy if exists "enquiries tenant delete" on public.enquiries;
create policy "enquiries tenant delete" on public.enquiries for delete to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin']));

drop policy if exists "enquiry activity tenant read" on public.enquiry_activity;
create policy "enquiry activity tenant read" on public.enquiry_activity for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "enquiry activity tenant create" on public.enquiry_activity;
create policy "enquiry activity tenant create" on public.enquiry_activity for insert to authenticated
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales']));

drop policy if exists "events tenant read" on public.events;
create policy "events tenant read" on public.events for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "events tenant create" on public.events;
create policy "events tenant create" on public.events for insert to authenticated
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations']));
drop policy if exists "events tenant update" on public.events;
create policy "events tenant update" on public.events for update to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']));
drop policy if exists "events tenant delete" on public.events;
create policy "events tenant delete" on public.events for delete to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin']));

drop policy if exists "event activity tenant read" on public.event_activity;
create policy "event activity tenant read" on public.event_activity for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "event activity tenant create" on public.event_activity;
create policy "event activity tenant create" on public.event_activity for insert to authenticated
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']));

drop policy if exists "audit tenant read" on public.audit_log;
create policy "audit tenant read" on public.audit_log for select to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']));

create or replace function public.audit_tenant_record()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  record_json jsonb;
  old_json jsonb;
  target_venue_id uuid;
  target_organisation_id uuid;
begin
  record_json := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  old_json := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  target_venue_id := coalesce((record_json ->> 'venue_id')::uuid, (old_json ->> 'venue_id')::uuid);
  select organisation_id into target_organisation_id from public.venues where id = target_venue_id;

  insert into public.audit_log (organisation_id, venue_id, actor_user_id, entity_type, entity_id, action, previous_data, new_data)
  values (
    target_organisation_id,
    target_venue_id,
    auth.uid(),
    tg_table_name,
    coalesce((record_json ->> 'id')::uuid, (old_json ->> 'id')::uuid),
    lower(tg_op),
    old_json,
    record_json
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists enquiries_audit_trigger on public.enquiries;
create trigger enquiries_audit_trigger after insert or update or delete on public.enquiries
  for each row execute function public.audit_tenant_record();
drop trigger if exists events_audit_trigger on public.events;
create trigger events_audit_trigger after insert or update or delete on public.events
  for each row execute function public.audit_tenant_record();
