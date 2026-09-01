import { demoActivities, demoEnquiries } from "../data/demo";
import type { EnquiryActivity, EnquiryPriority, EnquiryRecord, EnquiryStage } from "../types/enquiry";
import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";

type Relation<T> = T | T[] | null;

type EnquiryRow = {
  id: string;
  event_type: string;
  event_date: string | null;
  guest_count: number | null;
  estimated_value: number | string | null;
  status: string;
  priority: string | null;
  source: string | null;
  raw_message: string | null;
  ai_score: number | null;
  ai_summary: string | null;
  next_action: string | null;
  next_action_at: string | null;
  provisional_expiry: string | null;
  lost_reason: string | null;
  created_at: string;
  contact: Relation<{ first_name: string | null; last_name: string | null; email: string | null; phone: string | null }>;
  owner: Relation<{ display_name: string | null }>;
};

function first<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normaliseStage(value: string): EnquiryStage {
  const allowed: EnquiryStage[] = ["new", "contacted", "viewing_booked", "viewing_completed", "proposal_sent", "provisional", "confirmed", "lost", "follow_up_later"];
  return allowed.includes(value as EnquiryStage) ? value as EnquiryStage : "new";
}

function mapEnquiry(row: EnquiryRow): EnquiryRecord {
  const contact = first(row.contact);
  const owner = first(row.owner);
  const contactName = [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") || "Unnamed contact";
  return {
    id: row.id,
    contactName,
    email: contact?.email || "",
    phone: contact?.phone || undefined,
    eventType: row.event_type,
    eventDate: row.event_date || undefined,
    guestCount: row.guest_count ?? undefined,
    estimatedValue: Number(row.estimated_value || 0),
    stage: normaliseStage(row.status),
    priority: (["hot", "warm", "normal"].includes(row.priority || "") ? row.priority : "normal") as EnquiryPriority,
    source: row.source || "Unknown",
    owner: owner?.display_name || "Unassigned",
    aiScore: row.ai_score ?? 0,
    aiSummary: row.ai_summary || "Backstage will build an intelligence summary as activity is recorded.",
    nextAction: row.next_action || "Set the next action",
    nextActionDate: row.next_action_at?.slice(0, 10) || row.created_at.slice(0, 10),
    createdAt: row.created_at,
    provisionalExpiry: row.provisional_expiry || undefined,
    lostReason: row.lost_reason || undefined,
    rawMessage: row.raw_message || undefined
  };
}

const enquirySelect = "id,event_type,event_date,guest_count,estimated_value,status,priority,source,raw_message,ai_score,ai_summary,next_action,next_action_at,provisional_expiry,lost_reason,created_at,contact:contacts!enquiries_contact_id_fkey(first_name,last_name,email,phone),owner:user_profiles!enquiries_owner_user_id_fkey(display_name)";

export async function getEnquiries(): Promise<EnquiryRecord[]> {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) return demoEnquiries;
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("enquiries").select(enquirySelect).eq("venue_id", context.venueId).order("created_at", { ascending: false });
  if (error) {
    console.error("Could not load enquiries", error);
    return [];
  }
  return (data as unknown as EnquiryRow[]).map(mapEnquiry);
}

export async function getEnquiry(id: string): Promise<EnquiryRecord | null> {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) return demoEnquiries.find((item) => item.id === id) ?? null;
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("enquiries").select(enquirySelect).eq("id", id).eq("venue_id", context.venueId).maybeSingle();
  if (error || !data) return null;
  return mapEnquiry(data as unknown as EnquiryRow);
}

export async function getEnquiryActivities(id: string): Promise<EnquiryActivity[]> {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) return demoActivities.filter((item) => item.enquiryId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("enquiry_activity").select("id,enquiry_id,activity_type,title,detail,actor_name,created_at").eq("enquiry_id", id).eq("venue_id", context.venueId).order("created_at", { ascending: false });
  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    enquiryId: row.enquiry_id,
    type: row.activity_type as EnquiryActivity["type"],
    title: row.title,
    detail: row.detail || "",
    createdAt: row.created_at,
    actor: row.actor_name || "Backstage"
  }));
}

