"use server";

import { revalidatePath } from "next/cache";
import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";
import type { CalendarBookingInput } from "./types/calendar";

export type CalendarActionResult = { ok: boolean; eventId?: string; allocationId?: string; error?: string };

function venueLocalToIso(date: string, time: string, timeZone = "Europe/London") {
  const initial = new Date(`${date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(initial);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value || 0);
  const represented = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
  return new Date(initial.getTime() - (represented - initial.getTime())).toISOString();
}

export async function createCalendarBookingAction(input: CalendarBookingInput): Promise<CalendarActionResult> {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !context.userId || !supabase) return { ok: false, error: "Live calendar storage is not connected. Build mode should save this booking in your browser." };
  if (!input.clientName || !input.date || !input.startTime || !input.endTime || !input.spaceId) return { ok: false, error: "Customer, date, times and space are required." };

  const result = await supabase.rpc("create_calendar_booking", {
    p_organisation_id: context.organisationId,
    p_venue_id: context.venueId,
    p_space_id: input.spaceId,
    p_client_name: input.clientName,
    p_event_type: input.eventType,
    p_title: input.title || `${input.clientName} · ${input.eventType}`,
    p_starts_at: venueLocalToIso(input.date, input.startTime),
    p_ends_at: venueLocalToIso(input.date, input.endTime),
    p_guest_count: input.guestCount || null,
    p_quoted_value: input.quotedValue || 0,
    p_status: input.status,
    p_hold_days: input.holdDays,
    p_setup_minutes: input.setupMinutes,
    p_clear_minutes: input.clearMinutes,
    p_notes: input.notes || null,
    p_owner_user_id: context.userId
  });
  if (result.error) return { ok: false, error: result.error.message };
  const payload = result.data as { event_id?: string; allocation_id?: string } | null;
  revalidatePath("/calendar");
  revalidatePath("/events");
  return { ok: true, eventId: payload?.event_id, allocationId: payload?.allocation_id };
}

export async function confirmCalendarBookingAction(allocationId: string): Promise<CalendarActionResult> {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !supabase) return { ok: false, error: "Build mode handles this change in your browser." };
  const result = await supabase.rpc("confirm_calendar_booking", { p_allocation_id: allocationId });
  if (result.error) return { ok: false, error: result.error.message };
  revalidatePath("/calendar");
  revalidatePath("/events");
  return { ok: true, eventId: result.data as string };
}

export async function releaseCalendarBookingAction(allocationId: string): Promise<CalendarActionResult> {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !supabase) return { ok: false, error: "Build mode handles this change in your browser." };
  const result = await supabase.rpc("release_calendar_booking", { p_allocation_id: allocationId, p_reason: "Released from calendar" });
  if (result.error) return { ok: false, error: result.error.message };
  revalidatePath("/calendar");
  revalidatePath("/events");
  return { ok: true, eventId: result.data as string };
}

