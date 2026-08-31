/*
  Browser-safe Supabase helper.
  IMPORTANT:
  - Only use the public anon/publishable key here.
  - NEVER put the service_role key in browser code.
  - Production email invites, Stripe, DocuSign and admin actions should run server-side
    (Next.js route handlers or Supabase Edge Functions).
*/

const cfg = window.VENUEOS_CONFIG || {};
window.venueosSupabase = null;

if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) {
  window.venueosSupabase = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );
}

window.VenueOSAuth = {
  async signIn(email, password) {
    if (!window.venueosSupabase) throw new Error("Supabase is not configured.");
    return window.venueosSupabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    if (!window.venueosSupabase) return;
    return window.venueosSupabase.auth.signOut();
  },

  /*
    SMS MFA:
    Configure a supported SMS provider in Supabase Auth first.
    The exact factor-enrolment API can evolve, so wire this after your project
    settings are final rather than hard-coding provider-specific assumptions here.
  */
};

window.VenueOSData = {
  async myVenueMemberships() {
    if (!window.venueosSupabase) throw new Error("Supabase is not configured.");
    return window.venueosSupabase
      .from("venue_members")
      .select("venue_id, role, venues(id,name,organisation_id)")
      .eq("is_active", true);
  },

  async enquiriesForVenue(venueId) {
    if (!window.venueosSupabase) throw new Error("Supabase is not configured.");
    return window.venueosSupabase
      .from("enquiries")
      .select("*")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false });
  }
};
