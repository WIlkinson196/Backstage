import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";
import { demoCalendarBookings, demoCalendarSpaces } from "../data/demo";
import type { CalendarBooking, CalendarWorkspaceData } from "../types/calendar";

function relation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function londonParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}

export async function getCalendarWorkspace(): Promise<CalendarWorkspaceData> {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) {
    return { spaces: demoCalendarSpaces, bookings: demoCalendarBookings, demoMode: true, defaultHoldDays: 14, defaultSetupMinutes: 60, defaultClearMinutes: 60 };
  }
  const supabase = await getServerSupabase();
  if (!supabase) return { spaces: [], bookings: [], demoMode: false, defaultHoldDays: 14, defaultSetupMinutes: 60, defaultClearMinutes: 60 };

  const [spacesResult, allocationsResult, blocksResult, rulesResult, enquiriesResult] = await Promise.all([
    supabase.from("venue_spaces").select("id,name,capacity_seated,capacity_standing").eq("venue_id", context.venueId).eq("is_active", true).order("name"),
    supabase.from("event_space_allocations").select("id,event_id,starts_at,ends_at,setup_minutes,clear_minutes,status,hold_expires_at,space:venue_spaces!event_space_allocations_space_id_fkey(id,name),event:events!event_space_allocations_event_id_fkey(title,client_name,event_type,guest_count,quoted_value,notes)").eq("venue_id", context.venueId).order("starts_at"),
    supabase.from("venue_availability_blocks").select("id,space_id,starts_at,ends_at,reason,notes,space:venue_spaces!venue_availability_blocks_space_id_fkey(id,name)").eq("venue_id", context.venueId).order("starts_at"),
    supabase.from("venue_booking_rules").select("default_hold_days,default_setup_minutes,default_clear_minutes").eq("venue_id", context.venueId).maybeSingle(),
    supabase.from("enquiries").select("id,event_type,event_date,guest_count,estimated_value,status,contact:contacts!enquiries_contact_id_fkey(first_name,last_name)").eq("venue_id", context.venueId).not("event_date", "is", null).not("status", "in", "(lost,confirmed)")
  ]);

  if (spacesResult.error) console.error("Calendar spaces failed", spacesResult.error);
  if (allocationsResult.error) console.error("Calendar allocations failed", allocationsResult.error);
  if (blocksResult.error) console.error("Calendar availability blocks failed", blocksResult.error);

  const spaces = (spacesResult.data || []).map((space) => ({
    id: space.id,
    name: space.name,
    capacity: Math.max(Number(space.capacity_seated || 0), Number(space.capacity_standing || 0))
  }));

  const bookings: CalendarBooking[] = (allocationsResult.data || []).map((row) => {
    const event = relation(row.event as unknown as { title: string; client_name: string; event_type: string; guest_count: number | null; quoted_value: number | string; notes: string | null } | Array<{ title: string; client_name: string; event_type: string; guest_count: number | null; quoted_value: number | string; notes: string | null }> | null);
    const space = relation(row.space as unknown as { id: string; name: string } | Array<{ id: string; name: string }> | null);
    const start = londonParts(row.starts_at);
    const end = londonParts(row.ends_at);
    return {
      id: row.id,
      eventId: row.event_id,
      clientName: event?.client_name || "Customer",
      title: event?.title || "Event",
      eventType: event?.event_type || "Event",
      date: start.date,
      startTime: start.time,
      endTime: end.time,
      spaceId: space?.id || "",
      spaceName: space?.name || "Space",
      guestCount: Number(event?.guest_count || 0),
      status: row.status as CalendarBooking["status"],
      quotedValue: Number(event?.quoted_value || 0),
      setupMinutes: Number(row.setup_minutes || 0),
      clearMinutes: Number(row.clear_minutes || 0),
      holdExpiresAt: row.hold_expires_at || undefined,
      notes: event?.notes || undefined
    };
  });

  for (const row of blocksResult.data || []) {
    const start = londonParts(row.starts_at);
    const end = londonParts(row.ends_at);
    const selectedSpace = relation(row.space as unknown as { id: string; name: string } | Array<{ id: string; name: string }> | null);
    const affectedSpaces = selectedSpace ? [selectedSpace] : spaces;
    for (const space of affectedSpaces) {
      bookings.push({
        id: `block-${row.id}-${space.id}`,
        clientName: row.reason,
        title: row.reason,
        eventType: "Unavailable",
        date: start.date,
        startTime: start.time,
        endTime: end.time,
        spaceId: space.id,
        spaceName: space.name,
        guestCount: 0,
        status: "blocked",
        quotedValue: 0,
        setupMinutes: 0,
        clearMinutes: 0,
        notes: row.notes || undefined
      });
    }
  }

  for (const row of enquiriesResult.data || []) {
    const contact = relation(row.contact as unknown as { first_name: string | null; last_name: string | null } | Array<{ first_name: string | null; last_name: string | null }> | null);
    const clientName = [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") || "Enquiry";
    bookings.push({
      id: `enquiry-${row.id}`,
      clientName,
      title: `${clientName} · ${row.event_type} enquiry`,
      eventType: row.event_type,
      date: row.event_date!,
      startTime: "00:00",
      endTime: "23:59",
      spaceId: spaces[0]?.id || "",
      spaceName: spaces[0]?.name || "Preferred date",
      guestCount: Number(row.guest_count || 0),
      status: "enquiry",
      quotedValue: Number(row.estimated_value || 0),
      setupMinutes: 0,
      clearMinutes: 0,
      advisory: true
    });
  }

  const rules = rulesResult.data;
  return {
    spaces,
    bookings,
    demoMode: false,
    defaultHoldDays: Number(rules?.default_hold_days || 14),
    defaultSetupMinutes: Number(rules?.default_setup_minutes || 60),
    defaultClearMinutes: Number(rules?.default_clear_minutes || 60)
  };
}
