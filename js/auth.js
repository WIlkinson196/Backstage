// ===== AUTHENTICATION =====
let currentUserProfile = null;

// Automatically sign staff out after 30 minutes without keyboard, mouse,
// touch, scroll or page activity.
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
let inactivityTimer = null;
let inactivityListenersStarted = false;

function resetInactivityTimer() {
  if (!inactivityListenersStarted) return;

  window.clearTimeout(inactivityTimer);
  inactivityTimer = window.setTimeout(async () => {
    const { data } = await supabaseClient.auth.getSession();
    if (!data?.session) return;

    // Local scope signs out this browser session without unnecessarily
    // ending the same user's session on another device.
    await supabaseClient.auth.signOut({ scope: 'local' });
    showLoginScreen();

    const errorElement = document.getElementById("login-error");
    if (errorElement) {
      errorElement.textContent =
        "You were signed out after 30 minutes of inactivity. Please sign in again.";
      errorElement.classList.remove("hidden");
    }
  }, INACTIVITY_LIMIT_MS);
}

function startInactivityProtection() {
  if (!inactivityListenersStarted) {
    const activityEvents = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "pointerdown"
    ];

    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, resetInactivityTimer, {
        passive: true
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) resetInactivityTimer();
    });

    inactivityListenersStarted = true;
  }

  resetInactivityTimer();
}

function stopInactivityProtection() {
  window.clearTimeout(inactivityTimer);
  inactivityTimer = null;
}

async function loadCurrentUserProfile(options={}) {
  const attempts=Math.max(1,Number(options.attempts||3));
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData?.user) {
    currentUserProfile = null;
    return null;
  }

  let lastError=null;
  for(let attempt=1;attempt<=attempts;attempt++){
    const { data, error } = await supabaseClient
      .from('user_profiles')
      .select('id,email,display_name,role,is_active')
      .eq('id', userData.user.id)
      .maybeSingle();

    if(!error && data){
      currentUserProfile={...data,_profile_state:'loaded'};
      try{sessionStorage.setItem('wf_last_user_profile',JSON.stringify(currentUserProfile));}catch(_){}
      return currentUserProfile;
    }
    lastError=error||new Error('No user profile row was returned');
    if(attempt<attempts) await new Promise(resolve=>setTimeout(resolve,350*attempt));
  }

  console.error('Could not load user permissions after retry:', lastError);
  // Security remains fail-closed, but do not pretend the account has actually
  // changed to generic "staff". Keep identity visible and flag permissions as unavailable.
  let cached=null;
  try{cached=JSON.parse(sessionStorage.getItem('wf_last_user_profile')||'null');}catch(_){}
  currentUserProfile = {
    id: userData.user.id,
    email: userData.user.email || cached?.email || '',
    display_name: cached?.display_name || userData.user.email || 'Signed-in user',
    role: null,
    is_active: true,
    _profile_state:'unavailable',
    _profile_error:String(lastError?.message||lastError||'Profile unavailable')
  };
  return currentUserProfile;
}

async function retryCurrentUserProfile(){
  const previousState=currentUserProfile?._profile_state;
  await loadCurrentUserProfile({attempts:3});
  updateCurrentUserInterface();
  if(currentUserProfile?._profile_state==='loaded'){
    toast(previousState==='unavailable'?'Profile restored — permissions reloaded':'Profile refreshed');
    if(typeof renderSection==='function')renderSection();
    return true;
  }
  toast('Your account is signed in, but CRM permissions still cannot be loaded. Check Supabase and retry.','error');
  return false;
}
window.retryCurrentUserProfile=retryCurrentUserProfile;

function currentUserRole() {
  return currentUserProfile?.role || null;
}

function canAccessSettings() {
  return currentUserProfile?.is_active !== false &&
    ['owner', 'admin'].includes(currentUserRole());
}

function currentUserJobTitle() {
  const name = String(currentUserProfile?.display_name || '').trim().toLowerCase();

  const titlesByName = {
    'scott wilkinson': 'Deputy Manager',
    'amber burland': 'M&E Manager',
    'amber': 'M&E Manager',
    'ian': 'General Manager',
    'harriet': 'Reception & Sales Executive'
  };

  if (titlesByName[name]) return titlesByName[name];

  const titlesByRole = {
    owner: 'Owner',
    admin: 'Administrator',
    manager: 'Manager',
    sales: 'Reception & Sales Executive',
    staff: 'Team Member'
  };

  return titlesByRole[currentUserRole()] || 'Team Member';
}

function updateCurrentUserInterface() {
  const displayName =
    String(currentUserProfile?.display_name || '').trim() ||
    String(currentUserProfile?.email || '').trim() ||
    'User';

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'WF';

  const headerName = document.getElementById('header-user-name');
  const sidebarName = document.getElementById('sidebar-user-name');
  const sidebarRole = document.getElementById('sidebar-user-role');
  const sidebarInitials = document.getElementById('sidebar-user-initials');

  if (headerName) headerName.textContent = displayName;
  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarRole) sidebarRole.textContent = currentUserProfile?._profile_state==='unavailable' ? 'Permissions unavailable' : currentUserJobTitle();
  if (sidebarInitials) sidebarInitials.textContent = initials;

  let profileBanner=document.getElementById('profile-load-warning');
  if(currentUserProfile?._profile_state==='unavailable'){
    if(!profileBanner){
      profileBanner=document.createElement('div');
      profileBanner.id='profile-load-warning';
      profileBanner.className='fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-2xl bg-amber-50 border border-amber-300 text-amber-900 rounded-xl shadow-lg px-4 py-3 text-sm flex items-center gap-3';
      document.body.appendChild(profileBanner);
    }
    profileBanner.innerHTML=`<strong>Account permissions couldn't be loaded.</strong><span>Your access has not been changed.</span><button onclick="retryCurrentUserProfile()" class="underline font-bold">Retry</button>`;
  }else if(profileBanner){profileBanner.remove();}

  // Navigation is initially built before the profile finishes loading.
  // Rebuild it now so owner/admin-only sections such as Settings appear.
  if (typeof buildNav === 'function') buildNav();
}

function isOwnerAccount() {
  return currentUserRole() === 'owner' && currentUserProfile?.is_active !== false;
}

function requireOwnerPermission(actionLabel = 'perform this action') {
  if (isOwnerAccount()) return true;
  toast(`Only the Owner account can ${actionLabel}.`, 'error');
  return false;
}

async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorElement = document.getElementById("login-error");
  const button = document.getElementById("login-button");

  errorElement.classList.add("hidden");
  errorElement.textContent = "";
  button.disabled = true;
  button.textContent = "Signing in...";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  button.disabled = false;
  button.textContent = "Sign in";

  if (error) {
    console.error("Login failed:", error);
    errorElement.textContent = "Incorrect email address or password.";
    errorElement.classList.remove("hidden");
    return;
  }

  await showCRM();
}

async function logoutUser() {
  stopInactivityProtection();

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error("Logout failed:", error);
    toast("Could not sign out", "error");
    return;
  }

  showLoginScreen();
}

function showLoginScreen() {
  stopInactivityProtection();
  currentUserProfile = null;
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("crm-app").classList.add("hidden");
}

async function showCRM() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("crm-app").classList.remove("hidden");

  await loadCurrentUserProfile();
  updateCurrentUserInterface();

  if (currentUserProfile?.is_active === false) {
    await supabaseClient.auth.signOut();
    showLoginScreen();
    const errorElement = document.getElementById("login-error");
    if (errorElement) {
      errorElement.textContent = "This CRM account has been disabled.";
      errorElement.classList.remove("hidden");
    }
    return;
  }

  startInactivityProtection();

  await loadEnquiriesFromSupabase();
  await loadSalesLeadsFromSupabase();
  await loadCompaniesFromSupabase();
  await loadOpportunitiesFromSupabase();
  await loadWeddingsFromSupabase();
  renderSection();
  checkAlerts();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

async function checkLoginSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Could not check login session:", error);
    showLoginScreen();
    return;
  }

  if (data.session) {
    await showCRM();
  } else {
    showLoginScreen();
  }
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    showLoginScreen();
  }
});

async function testSupabaseConnection() {
  const { data, error } = await supabaseClient
    .from("enquiries")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Supabase connection failed:", error);
  } else {
    console.log("Supabase connected successfully:", data);
  }
}
