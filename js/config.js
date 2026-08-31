const SUPABASE_URL = "https://wpfjgiiwgfscddjtywle.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_QIc1F0obTl0RjUffd7tLqg_KdayVkaJ";

// Keep the login only for the lifetime of this browser tab.
// Refreshing the page keeps the user signed in, but closing the tab/browser
// removes the stored session so the next visit requires a fresh login.
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      storage: window.sessionStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
