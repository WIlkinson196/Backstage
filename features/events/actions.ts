"use server";

import { revalidatePath } from "next/cache";
import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";
import type { EventRecord, EventStatus } from "./types/event";

const statuses: EventStatus[] = ["draft", "provisional", "confirmed", "planning", "ready", "live", "completed", "cancelled"];

export async function updateEventStatusAction(eventId: string, formData: FormData) {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !supabase || !context.userId) return;
  const status = String(formData.get("status") || "") as EventStatus;
  if (!statuses.includes(status)) return;
  const { error } = await supabase.from("events").update({ status, updated_at: new Date().toISOString() }).eq("id", eventId).eq("venue_id", context.venueId);
  if (error) throw new Error(error.message);
  await supabase.from("event_activity").insert({
    venue_id: context.venueId,
    event_id: eventId,
    activity_type: "status_changed",
    title: `Event moved to ${status}`,
    detail: "Event status updated from the Backstage workspace.",
    actor_user_id: context.userId,
    actor_name: context.userName
  });
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

export async function saveEventWorkspaceAction(event: EventRecord): Promise<{ ok: boolean; error?: string }> {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !supabase || !context.userId) return { ok: false, error: "Build mode should save this record in your browser." };
  if (!event.id || !event.clientName.trim()) return { ok: false, error: "The function needs a client or event name." };
  const { error } = await supabase.rpc("save_event_workspace", { p_event_id: event.id, p_payload: event, p_actor_user_id: context.userId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/events");
  revalidatePath(`/events/${event.id}`);
  if (event.linkedWeddingId) revalidatePath(`/weddings/${event.linkedWeddingId}`);
  return { ok: true };
}
