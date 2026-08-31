const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

function showScreen(id){
  ['login-screen','mfa-screen','onboarding-screen','app-screen'].forEach(x => $('#'+x).classList.add('hidden'));
  $('#'+id).classList.remove('hidden');
  lucide.createIcons();
}

function toast(message){
  const t = $('#toast');
  t.textContent = message;
  t.classList.remove('hidden');
  setTimeout(()=>t.classList.add('hidden'), 2800);
}

function navigate(view){
  $$('.view').forEach(v=>v.classList.add('hidden'));
  const target = $('#view-'+view);
  if(target) target.classList.remove('hidden');

  $$('.nav-item').forEach(n=>n.classList.remove('active'));
  const nav = $(`.nav-item[data-view="${view}"]`);
  if(nav) nav.classList.add('active');

  const labels = {
    dashboard:'Dashboard',
    enquiries:'Sales / Enquiries',
    pipeline:'Sales / Pipeline',
    wedding:'Events / Weddings / Emma & James',
    portal:'Customer Portal / Emma & James',
    finance:'Finance / Invoices & Payments',
    settings:'Settings / Profile & Branding'
  };
  $('#breadcrumb').textContent = labels[view] || view;
  window.scrollTo({top:0,behavior:'smooth'});
  lucide.createIcons();
}

$('#login-btn').addEventListener('click', async ()=>{
  // Demo flow. If Supabase config is present, supabase.js can be wired in here.
  showScreen('mfa-screen');
});

$('#invite-setup-btn').addEventListener('click', ()=>showScreen('onboarding-screen'));
$('#mfa-back-btn').addEventListener('click', ()=>showScreen('login-screen'));

$('#send-code-btn').addEventListener('click', async ()=>{
  const phone = $('#mfa-phone').value.trim();
  if(!phone) return toast('Enter a mobile number first.');
  $('#code-area').classList.remove('hidden');
  toast('Demo text code sent. Production uses your configured Supabase SMS provider.');
});

$('#verify-code-btn').addEventListener('click', ()=>showScreen('app-screen'));
$('#onboard-cancel').addEventListener('click', ()=>showScreen('login-screen'));
$('#onboard-save').addEventListener('click', ()=>{
  const venue = $('#onboard-venue-name').value.trim() || 'Your Venue';
  $('#current-venue-label').textContent = venue;
  $('#dashboard-venue-name').textContent = venue;
  showScreen('app-screen');
});

$('#organisation-mode').addEventListener('change', e=>{
  $('#org-help').innerHTML = e.target.value === 'Multi-venue group'
    ? '<b>Multi-venue group:</b> each venue remains isolated. Group users only see the exact venues they are explicitly assigned to.'
    : 'Single venue mode keeps this venue isolated. No other venue can see its enquiries, customers, events, files or finance.';
});

$$('.nav-parent').forEach(btn=>btn.addEventListener('click', ()=>{
  const kids = btn.nextElementSibling;
  if(kids?.classList.contains('nav-children')) kids.classList.toggle('collapsed');
}));

$$('[data-view]').forEach(el=>el.addEventListener('click', ()=>{
  const view = el.dataset.view;
  if(view && $('#view-'+view)) navigate(view);
}));

$$('.tabs button').forEach(b=>b.addEventListener('click',()=>{
  $$('.tabs button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
}));

$('#venue-switch-btn').addEventListener('click', ()=>$('#venue-modal').classList.remove('hidden'));
$('#close-venue-modal').addEventListener('click', ()=>$('#venue-modal').classList.add('hidden'));
$('#venue-modal').addEventListener('click', e=>{ if(e.target.id==='venue-modal') e.currentTarget.classList.add('hidden'); });

$$('.venue-option').forEach(b=>b.addEventListener('click', ()=>{
  const venue = b.dataset.venue;
  $('#current-venue-label').textContent = venue;
  $('#dashboard-venue-name').textContent = venue;
  $('#venue-modal').classList.add('hidden');
  navigate('dashboard');
  toast(`Switched to ${venue}`);
}));

$('#send-portal-invite').addEventListener('click', async ()=>{
  const first = $('#portal-email-1').value.trim();
  const second = $('#portal-email-2').value.trim();
  if(!first) return toast('Enter at least one customer email.');
  // Production: call a secure server/Edge Function. Never put service-role keys in browser code.
  toast(`Portal invite queued for ${[first,second].filter(Boolean).join(' and ')}`);
});

$$('.upload-box input').forEach(input=>input.addEventListener('change', ()=>{
  const count = input.files?.length || 0;
  toast(count ? `${count} image${count>1?'s':''} selected.` : 'No files selected.');
}));

lucide.createIcons();
