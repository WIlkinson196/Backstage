"use server";

import { revalidatePath } from "next/cache";
import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";
import type { EventStatus } from "./types/event";

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

