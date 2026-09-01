import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";
import type { EventRecord, EventStatus } from "../types/event";

const demoEvents: EventRecord[] = [{
  id: "event-demo-001",
  title: "Lisa Green · Celebration",
  clientName: "Lisa Green",
  eventType: "Celebration",
  eventDate: "2026-10-18",
  guestCount: 80,
  status: "confirmed",
  quotedValue: 1850,
  paidValue: 300,
  owner: "Scott",
  sourceEnquiryId: "enq-demo",
  createdAt: "2026-09-01T10:00:00Z"
}];

type EventRow = {
  id: string; title: string; client_name: string; event_type: string; event_date: string | null;
  start_time: string | null; end_time: string | null; guest_count: number | null; status: string;
  quoted_value: number | string; paid_value: number | string; notes: string | null; source_enquiry_id: string | null;
  created_at: string; owner: { display_name: string | null } | { display_name: string | null }[] | null;
};

function mapEvent(row: EventRow): EventRecord {
  const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    eventType: row.event_type,
    eventDate: row.event_date || undefined,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    guestCount: row.guest_count ?? undefined,
    status: row.status as EventStatus,
    quotedValue: Number(row.quoted_value || 0),
    paidValue: Number(row.paid_value || 0),
    owner: owner?.display_name || "Unassigned",
    notes: row.notes || undefined,
    sourceEnquiryId: row.source_enquiry_id || undefined,
    createdAt: row.created_at
  };
}

const eventSelect = "id,title,client_name,event_type,event_date,start_time,end_time,guest_count,status,quoted_value,paid_value,notes,source_enquiry_id,created_at,owner:user_profiles!events_owner_user_id_fkey(display_name)";

export async function getEvents(): Promise<EventRecord[]> {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) return demoEvents;
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("events").select(eventSelect).eq("venue_id", context.venueId).order("event_date", { ascending: true });
  if (error) {
    console.error("Could not load events", error);
    return [];
  }
  return (data as unknown as EventRow[]).map(mapEvent);
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) return demoEvents.find((event) => event.id === id) || null;
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("events").select(eventSelect).eq("id", id).eq("venue_id", context.venueId).maybeSingle();
  if (error || !data) return null;
  return mapEvent(data as unknown as EventRow);
}

