"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";
import type { EnquiryStage } from "./types/enquiry";

export type EnquiryActionState = { error?: string };

const validStages: EnquiryStage[] = ["new", "contacted", "viewing_booked", "viewing_completed", "proposal_sent", "provisional", "confirmed", "lost", "follow_up_later"];

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function splitName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || "", lastName: parts.join(" ") };
}

function initialScore(formData: FormData) {
  let score = 35;
  if (text(formData, "eventDate")) score += 15;
  if (text(formData, "guestCount")) score += 10;
  if (text(formData, "estimatedValue")) score += 15;
  if (text(formData, "phone")) score += 10;
  if (text(formData, "message")) score += 10;
  return Math.min(score, 95);
}

export async function createEnquiryAction(_: EnquiryActionState, formData: FormData): Promise<EnquiryActionState> {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !supabase || !context.userId) return { error: "Connect Backstage to Supabase and sign in before creating live enquiries." };

  const contactName = text(formData, "contactName");
  const email = text(formData, "email");
  const eventType = text(formData, "eventType");
  if (!contactName || !email || !eventType) return { error: "Contact name, email address and event type are required." };

  const { firstName, lastName } = splitName(contactName);
  const score = initialScore(formData);
  const enquiryResult = await supabase.rpc("create_enquiry_with_contact", {
    p_venue_id: context.venueId,
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
    p_phone: text(formData, "phone"),
    p_event_type: eventType,
    p_event_date: text(formData, "eventDate") || null,
    p_guest_count: Number(text(formData, "guestCount")) || null,
    p_estimated_value: Number(text(formData, "estimatedValue")) || 0,
    p_priority: text(formData, "priority") || "normal",
    p_source: text(formData, "source") || "Direct",
    p_raw_message: text(formData, "message") || null,
    p_ai_score: score,
    p_ai_summary: `New ${eventType.toLowerCase()} enquiry with ${score >= 75 ? "strong" : "developing"} qualification data. Record the next action and response outcome to improve the recommendation.`,
    p_owner_user_id: context.userId
  });
  if (enquiryResult.error || !enquiryResult.data) return { error: enquiryResult.error?.message || "The enquiry could not be created." };

  await supabase.from("enquiry_activity").insert({
    venue_id: context.venueId,
    enquiry_id: enquiryResult.data,
    activity_type: "created",
    title: "Enquiry created",
    detail: `${eventType} enquiry added to the sales pipeline.`,
    actor_user_id: context.userId,
    actor_name: context.userName
  });

  revalidatePath("/enquiries");
  redirect(`/enquiries/${enquiryResult.data}`);
}

export async function progressEnquiryAction(enquiryId: string, formData: FormData) {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !supabase || !context.userId) return;

  const stage = text(formData, "stage") as EnquiryStage;
  if (!validStages.includes(stage)) return;
  const nextAction = text(formData, "nextAction");
  const nextActionDate = text(formData, "nextActionDate");
  const { error } = await supabase.from("enquiries").update({
    status: stage,
    next_action: nextAction || null,
    next_action_at: nextActionDate ? new Date(`${nextActionDate}T09:00:00`).toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("id", enquiryId).eq("venue_id", context.venueId);
  if (error) throw new Error(error.message);

  await supabase.from("enquiry_activity").insert({
    venue_id: context.venueId,
    enquiry_id: enquiryId,
    activity_type: stage,
    title: `Stage changed to ${stage.replaceAll("_", " ")}`,
    detail: nextAction ? `Next action: ${nextAction}` : "Pipeline stage updated.",
    actor_user_id: context.userId,
    actor_name: context.userName
  });
  revalidatePath("/enquiries");
  revalidatePath(`/enquiries/${enquiryId}`);
}

export async function convertEnquiryToEventAction(enquiryId: string) {
  const context = await getCurrentVenueContext();
  const supabase = await getServerSupabase();
  if (!context || context.demoMode || !supabase || !context.userId) return;

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .select("id,contact_id,event_type,event_date,guest_count,estimated_value,contacts!enquiries_contact_id_fkey(first_name,last_name)")
    .eq("id", enquiryId)
    .eq("venue_id", context.venueId)
    .single();
  if (error || !enquiry) throw new Error(error?.message || "Enquiry not found");

  const contactRelation = enquiry.contacts as unknown as { first_name?: string; last_name?: string } | { first_name?: string; last_name?: string }[] | null;
  const contact = Array.isArray(contactRelation) ? contactRelation[0] : contactRelation;
  const clientName = [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") || "Customer";
  const eventResult = await supabase.from("events").insert({
    organisation_id: context.organisationId,
    venue_id: context.venueId,
    source_enquiry_id: enquiry.id,
    primary_contact_id: enquiry.contact_id,
    event_type: enquiry.event_type,
    title: `${clientName} · ${enquiry.event_type}`,
    client_name: clientName,
    event_date: enquiry.event_date,
    guest_count: enquiry.guest_count,
    status: "confirmed",
    quoted_value: Number(enquiry.estimated_value || 0),
    owner_user_id: context.userId
  }).select("id").single();
  if (eventResult.error || !eventResult.data) throw new Error(eventResult.error?.message || "Event could not be created");

  await Promise.all([
    supabase.from("enquiries").update({ status: "confirmed", updated_at: new Date().toISOString() }).eq("id", enquiryId).eq("venue_id", context.venueId),
    supabase.from("enquiry_activity").insert({ venue_id: context.venueId, enquiry_id: enquiryId, activity_type: "confirmed", title: "Booking confirmed", detail: "Enquiry converted to the shared event workspace.", actor_user_id: context.userId, actor_name: context.userName }),
    supabase.from("event_activity").insert({ venue_id: context.venueId, event_id: eventResult.data.id, activity_type: "created", title: "Event created", detail: "Created from a confirmed enquiry.", actor_user_id: context.userId, actor_name: context.userName })
  ]);

  revalidatePath("/enquiries");
  revalidatePath("/events");
  redirect(`/events/${eventResult.data.id}`);
}
