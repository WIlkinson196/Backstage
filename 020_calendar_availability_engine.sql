-- Backstage v0.17 — Calendar, Availability & Provisional Bookings

create table if not exists public.venue_booking_rules (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null unique references public.venues(id) on delete cascade,
  default_hold_days integer not null default 14 check (default_hold_days between 1 and 90),
  default_setup_minutes integer not null default 60 check (default_setup_minutes between 0 and 1440),
  default_clear_minutes integer not null default 60 check (default_clear_minutes between 0 and 1440),
  allow_manager_override boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.event_space_allocations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  space_id uuid not null references public.venue_spaces(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  setup_minutes integer not null default 0 check (setup_minutes between 0 and 1440),
  clear_minutes integer not null default 0 check (clear_minutes between 0 and 1440),
  status text not null default 'provisional' check (status in ('provisional','confirmed','released','cancelled')),
  hold_expires_at timestamptz,
  released_at timestamptz,
  release_reason text,
  override_reason text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (status <> 'provisional' or hold_expires_at is not null)
);

create table if not exists public.venue_availability_blocks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  space_id uuid references public.venue_spaces(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null,
  notes text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_space_allocations_calendar
  on public.event_space_allocations (venue_id, starts_at, ends_at);
create index if not exists idx_space_allocations_space
  on public.event_space_allocations (space_id, starts_at, ends_at);
create index if not exists idx_space_allocations_holds
  on public.event_space_allocations (venue_id, hold_expires_at)
  where status = 'provisional' and released_at is null;
create index if not exists idx_availability_blocks_calendar
  on public.venue_availability_blocks (venue_id, starts_at, ends_at);

alter table public.venue_booking_rules enable row level security;
alter table public.event_space_allocations enable row level security;
alter table public.venue_availability_blocks enable row level security;

drop policy if exists "booking rules tenant read" on public.venue_booking_rules;
create policy "booking rules tenant read" on public.venue_booking_rules for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "booking rules tenant manage" on public.venue_booking_rules;
create policy "booking rules tenant manage" on public.venue_booking_rules for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager']));

drop policy if exists "space allocations tenant read" on public.event_space_allocations;
create policy "space allocations tenant read" on public.event_space_allocations for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "space allocations tenant create" on public.event_space_allocations;
create policy "space allocations tenant create" on public.event_space_allocations for insert to authenticated
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations']));
drop policy if exists "space allocations tenant update" on public.event_space_allocations;
create policy "space allocations tenant update" on public.event_space_allocations for update to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations']));

drop policy if exists "availability blocks tenant read" on public.venue_availability_blocks;
create policy "availability blocks tenant read" on public.venue_availability_blocks for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "availability blocks tenant manage" on public.venue_availability_blocks;
create policy "availability blocks tenant manage" on public.venue_availability_blocks for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','operations']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','operations']));

create or replace function public.calendar_conflicts(
  p_venue_id uuid,
  p_space_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_setup_minutes integer default 0,
  p_clear_minutes integer default 0,
  p_ignore_allocation_id uuid default null
)
returns table (
  allocation_id uuid,
  event_id uuid,
  event_title text,
  allocation_status text,
  starts_at timestamptz,
  ends_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select a.id, a.event_id, e.title, a.status, a.starts_at, a.ends_at
  from public.event_space_allocations a
  join public.events e on e.id = a.event_id
  where a.venue_id = p_venue_id
    and a.space_id = p_space_id
    and a.id is distinct from p_ignore_allocation_id
    and a.released_at is null
    and a.status in ('provisional','confirmed')
    and (a.status = 'confirmed' or a.hold_expires_at > now())
    and tstzrange(
      a.starts_at - make_interval(mins => a.setup_minutes),
      a.ends_at + make_interval(mins => a.clear_minutes),
      '[)'
    ) && tstzrange(
      p_starts_at - make_interval(mins => greatest(p_setup_minutes, 0)),
      p_ends_at + make_interval(mins => greatest(p_clear_minutes, 0)),
      '[)'
    )
  union all
  select b.id, null::uuid, b.reason, 'blocked'::text, b.starts_at, b.ends_at
  from public.venue_availability_blocks b
  where b.venue_id = p_venue_id
    and (b.space_id is null or b.space_id = p_space_id)
    and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(
      p_starts_at - make_interval(mins => greatest(p_setup_minutes, 0)),
      p_ends_at + make_interval(mins => greatest(p_clear_minutes, 0)),
      '[)'
    );
$$;

revoke all on function public.calendar_conflicts(uuid,uuid,timestamptz,timestamptz,integer,integer,uuid) from public;
grant execute on function public.calendar_conflicts(uuid,uuid,timestamptz,timestamptz,integer,integer,uuid) to authenticated;

create or replace function public.create_calendar_booking(
  p_organisation_id uuid,
  p_venue_id uuid,
  p_space_id uuid,
  p_client_name text,
  p_event_type text,
  p_title text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_guest_count integer,
  p_quoted_value numeric,
  p_status text,
  p_hold_days integer,
  p_setup_minutes integer,
  p_clear_minutes integer,
  p_notes text,
  p_owner_user_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_event_id uuid;
  new_allocation_id uuid;
  conflict_count integer;
  allocation_status text;
  venue_organisation_id uuid;
  space_capacity integer;
begin
  if p_status not in ('provisional','confirmed') then
    raise exception 'Calendar bookings must be provisional or confirmed.' using errcode = '22023';
  end if;
  if p_ends_at <= p_starts_at then
    raise exception 'The finish time must be after the start time.' using errcode = '22023';
  end if;

  select organisation_id into venue_organisation_id from public.venues where id = p_venue_id;
  if venue_organisation_id is null or venue_organisation_id is distinct from p_organisation_id then
    raise exception 'The venue does not belong to the selected organisation.' using errcode = '22023';
  end if;

  select greatest(coalesce(capacity_seated, 0), coalesce(capacity_standing, 0))
  into space_capacity
  from public.venue_spaces
  where id = p_space_id and venue_id = p_venue_id and is_active;
  if space_capacity is null then
    raise exception 'The selected venue space is unavailable.' using errcode = '22023';
  end if;
  if coalesce(p_guest_count, 0) > 0 and space_capacity > 0 and p_guest_count > space_capacity then
    raise exception 'The guest count exceeds the selected space capacity.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_space_id::text));
  select count(*) into conflict_count
  from public.calendar_conflicts(p_venue_id, p_space_id, p_starts_at, p_ends_at, p_setup_minutes, p_clear_minutes, null);
  if conflict_count > 0 then
    raise exception 'The selected space is already occupied during this time.' using errcode = 'P0001';
  end if;

  allocation_status := p_status;
  insert into public.events (
    organisation_id, venue_id, event_type, title, client_name, event_date,
    start_time, end_time, guest_count, status, quoted_value, owner_user_id, notes
  ) values (
    p_organisation_id, p_venue_id, p_event_type, p_title, p_client_name,
    (p_starts_at at time zone 'Europe/London')::date,
    (p_starts_at at time zone 'Europe/London')::time,
    (p_ends_at at time zone 'Europe/London')::time,
    p_guest_count, p_status, coalesce(p_quoted_value, 0), p_owner_user_id, p_notes
  ) returning id into new_event_id;

  insert into public.event_space_allocations (
    organisation_id, venue_id, event_id, space_id, starts_at, ends_at,
    setup_minutes, clear_minutes, status, hold_expires_at, created_by
  ) values (
    p_organisation_id, p_venue_id, new_event_id, p_space_id, p_starts_at, p_ends_at,
    greatest(p_setup_minutes, 0), greatest(p_clear_minutes, 0), allocation_status,
    case when allocation_status = 'provisional' then now() + make_interval(days => greatest(p_hold_days, 1)) else null end,
    p_owner_user_id
  ) returning id into new_allocation_id;

  insert into public.event_activity (venue_id, event_id, activity_type, title, detail, actor_user_id)
  values (p_venue_id, new_event_id, 'calendar_created', 'Calendar booking created',
    case when allocation_status = 'provisional' then 'Provisional space hold created.' else 'Confirmed space booking created.' end,
    p_owner_user_id);

  return jsonb_build_object('event_id', new_event_id, 'allocation_id', new_allocation_id);
end;
$$;

revoke all on function public.create_calendar_booking(uuid,uuid,uuid,text,text,text,timestamptz,timestamptz,integer,numeric,text,integer,integer,integer,text,uuid) from public;
grant execute on function public.create_calendar_booking(uuid,uuid,uuid,text,text,text,timestamptz,timestamptz,integer,numeric,text,integer,integer,integer,text,uuid) to authenticated;

create or replace function public.confirm_calendar_booking(p_allocation_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  allocation public.event_space_allocations%rowtype;
  conflict_count integer;
begin
  select * into allocation from public.event_space_allocations where id = p_allocation_id for update;
  if allocation.id is null then raise exception 'Booking allocation not found.' using errcode = 'P0002'; end if;
  perform pg_advisory_xact_lock(hashtext(allocation.space_id::text));
  select count(*) into conflict_count from public.calendar_conflicts(
    allocation.venue_id, allocation.space_id, allocation.starts_at, allocation.ends_at,
    allocation.setup_minutes, allocation.clear_minutes, allocation.id
  );
  if conflict_count > 0 then raise exception 'This hold now conflicts with another booking.' using errcode = 'P0001'; end if;

  update public.event_space_allocations
  set status = 'confirmed', hold_expires_at = null, updated_at = now()
  where id = allocation.id;
  update public.events set status = 'confirmed', updated_at = now() where id = allocation.event_id;
  return allocation.event_id;
end;
$$;

revoke all on function public.confirm_calendar_booking(uuid) from public;
grant execute on function public.confirm_calendar_booking(uuid) to authenticated;

create or replace function public.release_calendar_booking(p_allocation_id uuid, p_reason text default 'Released by venue')
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  allocation public.event_space_allocations%rowtype;
begin
  select * into allocation from public.event_space_allocations where id = p_allocation_id for update;
  if allocation.id is null then raise exception 'Booking allocation not found.' using errcode = 'P0002'; end if;
  update public.event_space_allocations
  set status = 'released', released_at = now(), release_reason = p_reason, updated_at = now()
  where id = allocation.id;
  update public.events set status = 'cancelled', updated_at = now() where id = allocation.event_id;
  return allocation.event_id;
end;
$$;

revoke all on function public.release_calendar_booking(uuid,text) from public;
grant execute on function public.release_calendar_booking(uuid,text) to authenticated;
