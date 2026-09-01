-- Backstage v0.18 — Functions & Weddings Command Centre
-- A shared operational layer beneath meetings, parties, conferences, wakes and weddings.

create table if not exists public.event_operations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  event_id uuid not null unique references public.events(id) on delete cascade,
  booking_reference text,
  coordinator_label text,
  room_name text,
  package_name text,
  day_guests integer check (day_guests is null or day_guests >= 0),
  evening_guests integer check (evening_guests is null or evening_guests >= 0),
  final_meeting_at timestamptz,
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  next_action text,
  next_action_due date,
  function_sheet_status text not null default 'not_started' check (function_sheet_status in ('not_started','draft','issued')),
  food_order_status text not null default 'not_started' check (food_order_status in ('not_started','draft','sent')),
  plan_data jsonb not null default '{}'::jsonb,
  integration_state jsonb not null default '[]'::jsonb,
  linked_wedding_id uuid references public.weddings(id) on delete set null,
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_event_operations_booking_reference
  on public.event_operations (venue_id, upper(booking_reference))
  where booking_reference is not null and booking_reference <> '';
create index if not exists idx_event_operations_action
  on public.event_operations (venue_id, next_action_due);

create table if not exists public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  category text not null default 'Planning',
  priority text not null default 'Medium' check (priority in ('High','Medium','Low')),
  due_date date,
  assigned_to text,
  completed boolean not null default false,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_event_tasks_event on public.event_tasks (event_id, completed, due_date);

create table if not exists public.event_running_order (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  item_time time not null,
  title text not null,
  detail text,
  category text not null default 'operations' check (category in ('arrival','meeting','food','entertainment','operations')),
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_event_running_order_event on public.event_running_order (event_id, item_time);

create table if not exists public.event_payment_schedule (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  due_date date,
  paid_date date,
  status text not null default 'scheduled' check (status in ('paid','due','overdue','scheduled')),
  external_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_event_payment_schedule_event on public.event_payment_schedule (event_id, due_date);

alter table public.event_operations enable row level security;
alter table public.event_tasks enable row level security;
alter table public.event_running_order enable row level security;
alter table public.event_payment_schedule enable row level security;

drop policy if exists "event operations tenant read" on public.event_operations;
create policy "event operations tenant read" on public.event_operations for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "event operations tenant manage" on public.event_operations;
create policy "event operations tenant manage" on public.event_operations for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']));

drop policy if exists "event tasks tenant read" on public.event_tasks;
create policy "event tasks tenant read" on public.event_tasks for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "event tasks tenant manage" on public.event_tasks;
create policy "event tasks tenant manage" on public.event_tasks for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']));

drop policy if exists "event running order tenant read" on public.event_running_order;
create policy "event running order tenant read" on public.event_running_order for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "event running order tenant manage" on public.event_running_order;
create policy "event running order tenant manage" on public.event_running_order for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']));

drop policy if exists "event payment schedule tenant read" on public.event_payment_schedule;
create policy "event payment schedule tenant read" on public.event_payment_schedule for select to authenticated
  using (public.current_user_has_venue_access(venue_id));
drop policy if exists "event payment schedule tenant manage" on public.event_payment_schedule;
create policy "event payment schedule tenant manage" on public.event_payment_schedule for all to authenticated
  using (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']))
  with check (public.current_user_has_venue_role(venue_id, array['owner','admin','manager','sales','operations','finance']));

create or replace function public.save_event_workspace(
  p_event_id uuid,
  p_payload jsonb,
  p_actor_user_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_event public.events%rowtype;
  item jsonb;
  item_index integer;
  safe_status text;
  linked_wedding uuid;
begin
  select * into target_event from public.events where id = p_event_id for update;
  if target_event.id is null then
    raise exception 'Event not found or access denied.' using errcode = 'P0002';
  end if;

  safe_status := coalesce(nullif(p_payload->>'status',''), target_event.status);
  if safe_status not in ('draft','provisional','confirmed','planning','ready','live','completed','cancelled') then
    raise exception 'Invalid event status.' using errcode = '22023';
  end if;
  if coalesce(p_payload->>'linkedWeddingId','') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    linked_wedding := (p_payload->>'linkedWeddingId')::uuid;
  else
    linked_wedding := null;
  end if;
  if linked_wedding is not null and not exists (
    select 1 from public.weddings w where w.id = linked_wedding and w.venue_id = target_event.venue_id
  ) then
    raise exception 'The linked wedding does not belong to this venue.' using errcode = '22023';
  end if;

  update public.events set
    title = coalesce(nullif(p_payload->>'title',''), title),
    client_name = coalesce(nullif(p_payload->>'clientName',''), client_name),
    event_type = coalesce(nullif(p_payload->>'eventType',''), event_type),
    event_date = nullif(p_payload->>'eventDate','')::date,
    start_time = nullif(p_payload->>'startTime','')::time,
    end_time = nullif(p_payload->>'endTime','')::time,
    guest_count = nullif(p_payload->>'guestCount','')::integer,
    status = safe_status,
    quoted_value = coalesce(nullif(p_payload->>'quotedValue','')::numeric, 0),
    paid_value = coalesce(nullif(p_payload->>'paidValue','')::numeric, 0),
    notes = nullif(p_payload->>'notes',''),
    updated_at = now()
  where id = p_event_id;

  insert into public.event_operations (
    organisation_id, venue_id, event_id, booking_reference, coordinator_label, room_name, package_name,
    day_guests, evening_guests, final_meeting_at, readiness_score, next_action, next_action_due,
    function_sheet_status, food_order_status, plan_data, integration_state, linked_wedding_id, updated_at
  ) values (
    target_event.organisation_id, target_event.venue_id, p_event_id, nullif(p_payload->>'bookingReference',''),
    nullif(p_payload->>'owner',''), nullif(p_payload->>'room',''), nullif(p_payload->>'packageName',''),
    nullif(p_payload->>'dayGuests','')::integer, nullif(p_payload->>'eveningGuests','')::integer,
    nullif(p_payload->>'finalMeetingAt','')::timestamptz,
    least(100, greatest(0, coalesce(nullif(p_payload->>'readinessScore','')::integer, 0))),
    nullif(p_payload->>'nextAction',''), nullif(p_payload->>'nextActionDue','')::date,
    coalesce(nullif(p_payload->>'functionSheetStatus',''), 'not_started'),
    coalesce(nullif(p_payload->>'foodOrderStatus',''), 'not_started'),
    coalesce(p_payload->'plan', '{}'::jsonb), coalesce(p_payload->'integrations', '[]'::jsonb), linked_wedding, now()
  )
  on conflict (event_id) do update set
    booking_reference = excluded.booking_reference, coordinator_label = excluded.coordinator_label,
    room_name = excluded.room_name, package_name = excluded.package_name, day_guests = excluded.day_guests,
    evening_guests = excluded.evening_guests, final_meeting_at = excluded.final_meeting_at,
    readiness_score = excluded.readiness_score, next_action = excluded.next_action,
    next_action_due = excluded.next_action_due, function_sheet_status = excluded.function_sheet_status,
    food_order_status = excluded.food_order_status, plan_data = excluded.plan_data,
    integration_state = excluded.integration_state, linked_wedding_id = excluded.linked_wedding_id, updated_at = now();

  delete from public.event_tasks where event_id = p_event_id;
  item_index := 0;
  for item in select * from jsonb_array_elements(coalesce(p_payload->'tasks','[]'::jsonb)) loop
    insert into public.event_tasks (organisation_id, venue_id, event_id, title, category, priority, due_date, assigned_to, completed, completed_at, sort_order)
    values (target_event.organisation_id, target_event.venue_id, p_event_id, item->>'title', coalesce(nullif(item->>'category',''),'Planning'),
      coalesce(nullif(item->>'priority',''),'Medium'), nullif(item->>'dueDate','')::date, nullif(item->>'assignedTo',''),
      coalesce((item->>'completed')::boolean, false), case when coalesce((item->>'completed')::boolean, false) then now() else null end, item_index);
    item_index := item_index + 1;
  end loop;

  delete from public.event_running_order where event_id = p_event_id;
  item_index := 0;
  for item in select * from jsonb_array_elements(coalesce(p_payload->'runningOrder','[]'::jsonb)) loop
    insert into public.event_running_order (organisation_id, venue_id, event_id, item_time, title, detail, category, completed, sort_order)
    values (target_event.organisation_id, target_event.venue_id, p_event_id, (item->>'time')::time, item->>'title', nullif(item->>'detail',''),
      coalesce(nullif(item->>'category',''),'operations'), coalesce((item->>'completed')::boolean, false), item_index);
    item_index := item_index + 1;
  end loop;

  delete from public.event_payment_schedule where event_id = p_event_id;
  for item in select * from jsonb_array_elements(coalesce(p_payload->'payments','[]'::jsonb)) loop
    insert into public.event_payment_schedule (organisation_id, venue_id, event_id, label, amount, due_date, paid_date, status)
    values (target_event.organisation_id, target_event.venue_id, p_event_id, item->>'label', coalesce(nullif(item->>'amount','')::numeric, 0),
      nullif(item->>'dueDate','')::date, nullif(item->>'paidDate','')::date, coalesce(nullif(item->>'status',''),'scheduled'));
  end loop;

  insert into public.event_activity (venue_id, event_id, activity_type, title, detail, actor_user_id)
  values (target_event.venue_id, p_event_id, 'workspace_saved', 'Function workspace updated', 'Operational plan, tasks, running order and payment schedule saved.', coalesce(auth.uid(), p_actor_user_id));
  return p_event_id;
end;
$$;

revoke all on function public.save_event_workspace(uuid,jsonb,uuid) from public;
grant execute on function public.save_event_workspace(uuid,jsonb,uuid) to authenticated;
