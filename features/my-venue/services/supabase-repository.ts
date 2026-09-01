import type { VenuePolicy, VenueProduct, VenueProfileForm, VenueSpace } from "../types/config";
import { getCurrentVenueContext } from "@/features/platform/services/context";
import { getServerSupabase } from "@/lib/supabase/server";

async function liveContext() {
  const context = await getCurrentVenueContext();
  if (!context || context.demoMode) return null;
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  return { context, supabase };
}

export async function getSupabaseVenueProfile(): Promise<VenueProfileForm | null> {
  const live = await liveContext();
  if (!live) return null;
  const { data: row, error } = await live.supabase.from("venues").select("*").eq("id", live.context.venueId).maybeSingle();
  if (error || !row) return null;
  return {
    name: row.name ?? "",
    tradingName: row.trading_name ?? "",
    description: row.description ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    logoUrl: row.logo_url ?? "",
    heroImageUrl: row.hero_image_url ?? ""
  };
}

export async function getSupabaseVenueSpaces(): Promise<VenueSpace[] | null> {
  const live = await liveContext();
  if (!live) return null;
  const { data: rows, error } = await live.supabase.from("venue_spaces").select("*").eq("venue_id", live.context.venueId).order("name");
  if (error || !rows) return null;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    capacitySeated: row.capacity_seated,
    capacityStanding: row.capacity_standing,
    isActive: row.is_active
  }));
}

export async function getSupabaseVenueProducts(): Promise<VenueProduct[] | null> {
  const live = await liveContext();
  if (!live) return null;
  const { data: rows, error } = await live.supabase.from("venue_products").select("*").eq("venue_id", live.context.venueId).order("name");
  if (error || !rows) return null;
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description ?? "",
    basePrice: row.base_price === null ? null : Number(row.base_price),
    priceType: row.price_type,
    isActive: row.is_active,
    metadata: row.metadata ?? {}
  }));
}

export async function getSupabaseVenuePolicies(): Promise<VenuePolicy[] | null> {
  const live = await liveContext();
  if (!live) return null;
  const { data: rows, error } = await live.supabase.from("venue_policies").select("*").eq("venue_id", live.context.venueId).order("title");
  if (error || !rows) return null;
  return rows.map((row) => ({
    id: row.id,
    policyKey: row.policy_key,
    title: row.title,
    content: row.content ?? "",
    metadata: row.metadata ?? {}
  }));
}

