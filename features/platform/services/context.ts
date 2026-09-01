import { cookies } from "next/headers";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { VenueContext } from "../types/context";

const DEMO_CONTEXT: VenueContext = {
  userId: null,
  userName: "Demo user",
  organisationId: "11111111-1111-1111-1111-111111111111",
  organisationName: "Windmill Farm",
  venueId: "22222222-2222-2222-2222-222222222222",
  venueName: "The Granary",
  role: "owner",
  demoMode: true
};

export async function getCurrentVenueContext(): Promise<VenueContext | null> {
  if (!isSupabaseConfigured()) return DEMO_CONTEXT;
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const cookieStore = await cookies();
  const selectedVenueId = cookieStore.get("backstage_venue_id")?.value;
  let membershipQuery = supabase
    .from("venue_memberships")
    .select("venue_id,role,is_default")
    .eq("user_id", authData.user.id)
    .eq("active", true)
    .order("is_default", { ascending: false });
  if (selectedVenueId) membershipQuery = membershipQuery.eq("venue_id", selectedVenueId);

  let { data: memberships } = await membershipQuery.limit(1);
  if (!memberships?.length && selectedVenueId) {
    const fallback = await supabase
      .from("venue_memberships")
      .select("venue_id,role,is_default")
      .eq("user_id", authData.user.id)
      .eq("active", true)
      .order("is_default", { ascending: false })
      .limit(1);
    memberships = fallback.data;
  }

  const membership = memberships?.[0];
  if (!membership) return null;

  const [{ data: venue }, { data: profile }] = await Promise.all([
    supabase.from("venues").select("id,name,trading_name,organisation_id").eq("id", membership.venue_id).single(),
    supabase.from("user_profiles").select("display_name,email").eq("id", authData.user.id).maybeSingle()
  ]);
  if (!venue) return null;

  const { data: organisation } = await supabase
    .from("organisations")
    .select("id,name")
    .eq("id", venue.organisation_id)
    .single();

  return {
    userId: authData.user.id,
    userName: profile?.display_name || profile?.email || authData.user.email || "Team member",
    organisationId: venue.organisation_id,
    organisationName: organisation?.name || "Organisation",
    venueId: venue.id,
    venueName: venue.trading_name || venue.name,
    role: membership.role,
    demoMode: false
  };
}

