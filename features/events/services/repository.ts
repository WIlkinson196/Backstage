import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";
import { demoEvents } from "../data/demo";
import type { EventIntegration, EventPlan, EventPlanKind, EventRecord, EventStatus, EventTask, EventRunningOrderItem, EventPayment, EventsWorkspaceData } from "../types/event";

const integrations: EventIntegration[] = [
  { key: "payments", label: "Stripe Connect", status: "prepared", description: "Payment links, deposits and automatic reconciliation." },
  { key: "email", label: "Venue email", status: "prepared", description: "Approved reminders, confirmations and follow-ups." },
  { key: "ai", label: "OpenAI", status: "prepared", description: "Drafting, missing-detail checks and event summaries." },
  { key: "documents", label: "Document storage", status: "prepared", description: "Versioned packs, contracts and customer uploads." },
  { key: "portal", label: "Customer portal", status: "prepared", description: "Secure planning, messages, files and payments." }
];

type BaseEventRow = {
  id: string; title: string; client_name: string; event_type: string; event_date: string | null;
  start_time: string | null; end_time: string | null; guest_count: number | null; status: string;
  quoted_value: number | string; paid_value: number | string; notes: string | null; source_enquiry_id: string | null;
  created_at: string; owner: { display_name: string | null } | { display_name: string | null }[] | null;
};

type OperationRow = {
  event_id: string; booking_reference: string | null; coordinator_label: string | null; room_name: string | null;
  package_name: string | null; day_guests: number | null; evening_guests: number | null; final_meeting_at: string | null;
  readiness_score: number; next_action: string | null; next_action_due: string | null;
  function_sheet_status: EventRecord["functionSheetStatus"]; food_order_status: EventRecord["foodOrderStatus"];
  plan_data: EventPlan | null; linked_wedding_id: string | null;
};

function kindFor(eventType: string): EventPlanKind {
  const value = eventType.toLowerCase();
  if (value.includes("wedding")) return "wedding";
  if (["meeting", "conference", "training"].some((term) => value.includes(term))) return "meeting";
  if (value.includes("wake")) return "wake";
  if (["party", "celebration", "anniversary", "christening", "birthday"].some((term) => value.includes(term))) return "party";
  return "event";
}

function emptyPlan(eventType: string): EventPlan {
  return { kind: kindFor(eventType), contact: {}, room: {}, food: {}, av: {}, entertainment: {}, accommodation: {} };
}

function ownerName(ownerValue: BaseEventRow["owner"]) {
  const owner = Array.isArray(ownerValue) ? ownerValue[0] : ownerValue;
  return owner?.display_name || "Unassigned";
}

function mapEvent(row: BaseEventRow, operation?: OperationRow, tasks: EventTask[] = [], runningOrder: EventRunningOrderItem[] = [], payments: EventPayment[] = []): EventRecord {
  return {
    id: row.id, title: row.title, clientName: row.client_name, eventType: row.event_type,
    eventDate: row.event_date || undefined, startTime: row.start_time || undefined, endTime: row.end_time || undefined,
    guestCount: row.guest_count ?? undefined, dayGuests: operation?.day_guests ?? undefined, eveningGuests: operation?.evening_guests ?? undefined,
    status: row.status as EventStatus, bookingReference: operation?.booking_reference || undefined,
    quotedValue: Number(row.quoted_value || 0), paidValue: Number(row.paid_value || 0), owner: operation?.coordinator_label || ownerName(row.owner),
    room: operation?.room_name || operation?.plan_data?.room.space || undefined, packageName: operation?.package_name || undefined,
    notes: row.notes || undefined, sourceEnquiryId: row.source_enquiry_id || undefined, linkedWeddingId: operation?.linked_wedding_id || undefined,
    createdAt: row.created_at, readinessScore: Number(operation?.readiness_score || 0), nextAction: operation?.next_action || "Complete the operational plan",
    nextActionDue: operation?.next_action_due || undefined, finalMeetingAt: operation?.final_meeting_at || undefined,
    functionSheetStatus: operation?.function_sheet_status || "not_started", foodOrderStatus: operation?.food_order_status || "not_started",
    plan: operation?.plan_data || emptyPlan(row.event_type), tasks, runningOrder, payments, integrations
  };
}

const eventSelect = "id,title,client_name,event_type,event_date,start_time,end_time,guest_count,status,quoted_value,paid_value,notes,source_enquiry_id,created_at,owner:user_profiles!events_owner_user_id_fkey(display_name)";

async function getLiveEvents(): Promise<EventRecord[]> {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || !supabase) return [];
  const [eventsResult, operationsResult, tasksResult, orderResult, paymentsResult] = await Promise.all([
    supabase.from("events").select(eventSelect).eq("venue_id", context.venueId).order("event_date", { ascending: true }),
    supabase.from("event_operations").select("event_id,booking_reference,coordinator_label,room_name,package_name,day_guests,evening_guests,final_meeting_at,readiness_score,next_action,next_action_due,function_sheet_status,food_order_status,plan_data,linked_wedding_id").eq("venue_id", context.venueId),
    supabase.from("event_tasks").select("id,event_id,title,category,priority,due_date,assigned_to,completed").eq("venue_id", context.venueId).order("due_date"),
    supabase.from("event_running_order").select("id,event_id,item_time,title,detail,category,completed").eq("venue_id", context.venueId).order("item_time"),
    supabase.from("event_payment_schedule").select("id,event_id,label,amount,due_date,paid_date,status").eq("venue_id", context.venueId).order("due_date")
  ]);
  if (eventsResult.error) { console.error("Could not load events", eventsResult.error); return []; }
  if (operationsResult.error) console.error("Could not load event operations", operationsResult.error);

  const operations = new Map((operationsResult.data || []).map((item) => [item.event_id, item as unknown as OperationRow]));
  const tasks = new Map<string, EventTask[]>();
  for (const row of tasksResult.data || []) {
    const list = tasks.get(row.event_id) || [];
    list.push({ id: row.id, title: row.title, category: row.category as EventTask["category"], priority: row.priority as EventTask["priority"], dueDate: row.due_date || undefined, assignedTo: row.assigned_to || undefined, completed: Boolean(row.completed) });
    tasks.set(row.event_id, list);
  }
  const running = new Map<string, EventRunningOrderItem[]>();
  for (const row of orderResult.data || []) {
    const list = running.get(row.event_id) || [];
    list.push({ id: row.id, time: String(row.item_time || "").slice(0, 5), title: row.title, detail: row.detail || undefined, category: row.category as EventRunningOrderItem["category"], completed: Boolean(row.completed) });
    running.set(row.event_id, list);
  }
  const payments = new Map<string, EventPayment[]>();
  for (const row of paymentsResult.data || []) {
    const list = payments.get(row.event_id) || [];
    list.push({ id: row.id, label: row.label, amount: Number(row.amount || 0), dueDate: row.due_date || undefined, paidDate: row.paid_date || undefined, status: row.status as EventPayment["status"] });
    payments.set(row.event_id, list);
  }
  return (eventsResult.data as unknown as BaseEventRow[]).map((row) => mapEvent(row, operations.get(row.id), tasks.get(row.id), running.get(row.id), payments.get(row.id)));
}

export async function getEventsWorkspace(): Promise<EventsWorkspaceData> {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) return { events: demoEvents, demoMode: true };
  return { events: await getLiveEvents(), demoMode: false };
}

export async function getEvents(): Promise<EventRecord[]> {
  return (await getEventsWorkspace()).events;
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  const workspace = await getEventsWorkspace();
  return workspace.events.find((event) => event.id === id) || null;
}
