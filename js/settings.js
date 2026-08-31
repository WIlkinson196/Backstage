// ===== SETTINGS =====
const HISTORICAL_EVENT_TYPES=['Wedding','Christmas','Meeting','Event','Birthday','Wake','Party','Engagement','Other'];
const HISTORICAL_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

function historicalRecords(){if(!Array.isArray(DB.historical))DB.historical=[];return DB.historical;}
function historicalNormalType(value){
const raw=String(value||'').trim();
if(/^all( event types)?$/i.test(raw))return 'All';
return HISTORICAL_EVENT_TYPES.find(type=>type.toLowerCase()===raw.toLowerCase())||raw||'Other';
}
function historicalMonthRows(year,month){return historicalRecords().filter(r=>String(r.year)===String(year)&&String(r.month).toLowerCase()===String(month).toLowerCase());}
function historicalMonthTotals(year,month){
const rows=historicalMonthRows(year,month),split=rows.filter(r=>historicalNormalType(r.eventType)!=='All'),source=split.length?split:rows;
return source.reduce((t,r)=>({events:t.events+(Number(r.events)||0),revenue:t.revenue+(Number(r.revenue)||0)}),{events:0,revenue:0});
}
function historicalMonthGroups(){
const map={};
historicalRecords().forEach(row=>{const key=`${row.year}|||${row.month}`;if(!map[key])map[key]={year:String(row.year),month:String(row.month),rows:[]};map[key].rows.push(row);});
return Object.values(map).sort((a,b)=>Number(b.year)-Number(a.year)||HISTORICAL_MONTHS.indexOf(a.month)-HISTORICAL_MONTHS.indexOf(b.month));
}
function historicalSplitRow(type,record){
return `<div class="grid grid-cols-[minmax(105px,1.2fr)_minmax(80px,.65fr)_minmax(110px,1fr)] gap-2 items-end historical-split-row" data-type="${esc(type)}">
<div><label class="text-xs font-medium text-gray-600">${esc(type)}</label></div>
<div><label class="text-[11px] text-gray-500">Events</label><input data-kind="events" type="number" min="0" step="1" value="${record?.events??0}" oninput="updateHistoricalSplitTotals()" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div><label class="text-[11px] text-gray-500">Revenue</label><input data-kind="revenue" type="number" min="0" step="0.01" value="${record?.revenue??0}" oninput="updateHistoricalSplitTotals()" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
</div>`;
}
function openHistoricalForm(idOrYear='',monthArg=''){
let year='',month='',legacy=null;
if(idOrYear&&monthArg){year=String(idOrYear);month=String(monthArg);}
else if(idOrYear){legacy=historicalRecords().find(r=>r.id===idOrYear);if(legacy){year=String(legacy.year);month=String(legacy.month);}}
const existing=year&&month?historicalMonthRows(year,month):[];
const split={};existing.filter(r=>historicalNormalType(r.eventType)!=='All').forEach(r=>split[historicalNormalType(r.eventType)]=r);
const all=existing.find(r=>historicalNormalType(r.eventType)==='All')||legacy;
const hasOnlyAll=!!all&&!Object.keys(split).length;
openModal(`<div class="p-6 max-h-[90vh] overflow-y-auto">
<div class="flex justify-between items-start gap-3 mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">HISTORICAL REPORTING DATA</p><h2 class="text-lg font-bold">${year&&month?'Edit Monthly Split':'Add Monthly Record'}</h2><p class="text-xs text-gray-500 mt-1">Enter each function type separately. Monthly totals calculate automatically.</p></div><button onclick="closeModal()" class="p-1 hover:bg-gray-100 rounded"><i data-lucide="x" style="width:20px;height:20px"></i></button></div>
${hasOnlyAll?`<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Old “All” total:</strong> ${Number(all.events||0)} events and £${Number(all.revenue||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}. Split it below; saving replaces the old total.</div>`:''}
<form onsubmit="saveHistoricalSplitForm(event,'${esc(year)}','${esc(month)}')" class="space-y-4">
<div class="grid sm:grid-cols-2 gap-3"><div><label class="text-xs font-medium text-gray-600">Year *</label><input name="year" required pattern="[0-9]{4}" value="${esc(year)}" class="w-full px-3 py-2 border rounded-lg text-sm"></div><div><label class="text-xs font-medium text-gray-600">Month *</label><select name="month" required class="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select month</option>${HISTORICAL_MONTHS.map(item=>`<option ${month===item?'selected':''}>${item}</option>`).join('')}</select></div></div>
<div class="rounded-xl border border-gray-200 p-3"><div class="grid grid-cols-[minmax(105px,1.2fr)_minmax(80px,.65fr)_minmax(110px,1fr)] gap-2 pb-2 border-b text-[11px] font-bold text-gray-500"><span>Function Type</span><span>Number</span><span>Revenue</span></div><div class="space-y-3 mt-3">${HISTORICAL_EVENT_TYPES.map(type=>historicalSplitRow(type,split[type])).join('')}</div></div>
<div class="grid grid-cols-2 gap-3 bg-cream-50 rounded-lg p-3"><div><p class="text-xs text-gray-500">Monthly Events</p><p id="historical-total-events" class="text-xl font-bold">0</p></div><div><p class="text-xs text-gray-500">Monthly Revenue</p><p id="historical-total-revenue" class="text-xl font-bold">£0.00</p></div></div>
<p id="historical-form-error" class="text-sm text-red-600 hidden"></p><button type="submit" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700">Save Monthly Breakdown</button>
</form></div>`);
setTimeout(updateHistoricalSplitTotals,0);
}
function updateHistoricalSplitTotals(){
let events=0,revenue=0;
document.querySelectorAll('.historical-split-row').forEach(row=>{events+=Number(row.querySelector('[data-kind="events"]')?.value||0);revenue+=Number(row.querySelector('[data-kind="revenue"]')?.value||0);});
const a=document.getElementById('historical-total-events'),b=document.getElementById('historical-total-revenue');
if(a)a.textContent=events.toLocaleString('en-GB');if(b)b.textContent='£'+revenue.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
}
/* PHASE 1: superseded duplicate `saveHistoricalSplitForm` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `deleteHistoricalMonth` removed; active declaration retained later in this file. */

function toggleHistoricalMonth(key){const body=document.getElementById(`historical-detail-${key}`),icon=document.getElementById(`historical-icon-${key}`);if(!body)return;body.classList.toggle('hidden');if(icon)icon.setAttribute('data-lucide',body.classList.contains('hidden')?'chevron-down':'chevron-up');lucide.createIcons();}
function openStaffForm(id){
const member=id?staffRecords().find(item=>item.id===id):null;
const roles=['Manager','Sales','Events','Read Only'];
openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold">${id?'Edit':'Add'} Staff Member</h2><button onclick="closeModal()" class="p-1 hover:bg-gray-100 rounded"><i data-lucide="x" style="width:20px;height:20px"></i></button></div><form onsubmit="saveStaffForm(event,'${id||''}')" class="space-y-3"><div><label class="text-xs font-medium text-gray-600">Name *</label><input name="name" required value="${esc(member?.name||'')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div><div><label class="text-xs font-medium text-gray-600">Role</label><select name="role" class="w-full px-3 py-2 border rounded-lg text-sm">${roles.map(role=>`<option ${member?.role===role?'selected':''}>${role}</option>`).join('')}</select></div><label class="flex items-center gap-2 p-3 bg-cream-50 rounded-lg"><input name="active" type="checkbox" ${member?.active!==false?'checked':''}><span class="text-sm">Active and available for assignment</span></label><p id="staff-form-error" class="text-sm text-red-600 hidden"></p><button type="submit" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700">Save Staff Member</button></form></div>`);
}

function saveStaffForm(ev,id){
ev.preventDefault();
const form=new FormData(ev.target),name=String(form.get('name')||'').trim(),error=document.getElementById('staff-form-error');
if(!name){error.textContent='Please enter a staff name.';error.classList.remove('hidden');return;}
const duplicate=staffRecords().find(member=>member.name.toLowerCase()===name.toLowerCase()&&member.id!==id);
if(duplicate){error.textContent='A staff member with this name already exists.';error.classList.remove('hidden');return;}
const record={id:id||'staff-'+Date.now(),name,role:form.get('role')||'Sales',active:form.get('active')==='on'};
const index=staffRecords().findIndex(member=>member.id===id);
if(index>=0)DB.staff[index]=record;else DB.staff.push(record);
saveDB();closeModal();renderSection();toast(id?'Staff member updated':'Staff member added');
}

function toggleStaffActive(id){
const member=staffRecords().find(item=>item.id===id);if(!member)return;
member.active=!member.active;saveDB();renderSection();toast(member.active?'Staff member activated':'Staff member archived');
}

function deleteStaffMember(id){
const member=staffRecords().find(item=>item.id===id);if(!member)return;
const inUse=(DB.enquiries||[]).some(e=>e.staff===member.name)||(DB.weddings||[]).some(w=>w.coordinator===member.name)||(DB.functions||[]).some(f=>f.coordinator===member.name)||(DB.meetings||[]).some(m=>m.staff===member.name)||(DB.tasks||[]).some(t=>t.owner===member.name);
if(inUse){toast('Archive this staff member instead because they are linked to existing records','error');return;}
promptDelete(`Delete ${member.name}?`,()=>{DB.staff=staffRecords().filter(item=>item.id!==id);saveDB();renderSection();toast('Staff member deleted');});
}


// ===== WEDDING V2 PHASE 1 — SETTINGS SYSTEM HEALTH =====
const SystemHealth=window.SystemHealth||{status:'Not tested',detail:'Run a connection test to verify Supabase is reachable.',lastTest:null,build:'WEDDING-V2-P1'};
window.SystemHealth=SystemHealth;
SystemHealth.getDB=()=>{try{if(typeof DB!=='undefined'&&DB)return DB}catch(e){}return window.DB||{}};
SystemHealth.counts=()=>Object.entries(SystemHealth.getDB()).filter(([,v])=>Array.isArray(v)).map(([key,v])=>({key,count:v.length})).sort((a,b)=>b.count-a.count);
SystemHealth.total=()=>SystemHealth.counts().reduce((n,x)=>n+x.count,0);
SystemHealth.bytes=()=>{try{return new Blob([JSON.stringify(SystemHealth.getDB())]).size}catch(e){return 0}};
SystemHealth.fmt=b=>b<1024?`${b} B`:b<1048576?`${(b/1024).toFixed(1)} KB`:`${(b/1048576).toFixed(2)} MB`;
SystemHealth.lastSave=()=>{try{return JSON.parse(localStorage.getItem('wf_health_last_save')||'null')}catch(e){return null}};
SystemHealth.lastError=()=>{try{return JSON.parse(localStorage.getItem('wf_health_last_error')||'null')}catch(e){return null}};
SystemHealth.client=()=>{try{if(typeof supabaseClient!=='undefined'&&supabaseClient)return supabaseClient}catch(e){}return window.supabaseClient||null};
SystemHealth.test=async()=>{
  SystemHealth.status='Testing…';SystemHealth.detail='Checking Supabase Auth response.';SystemHealth.refresh();
  const c=SystemHealth.client();
  if(!c){SystemHealth.status='Unavailable';SystemHealth.detail='No Supabase browser client detected.';SystemHealth.lastTest=new Date().toISOString();SystemHealth.refresh();return}
  try{const t=performance.now(),r=await c.auth.getSession();if(r?.error)throw r.error;SystemHealth.status='Connected';SystemHealth.detail=`Supabase responded in ${Math.round(performance.now()-t)} ms.`}
  catch(e){SystemHealth.status='Connection failed';SystemHealth.detail=String(e?.message||e)}
  SystemHealth.lastTest=new Date().toISOString();SystemHealth.refresh();
};
SystemHealth.backup=()=>{
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),build:SystemHealth.build,data:SystemHealth.getDB()},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`windmill-crm-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('CRM backup downloaded');
};
SystemHealth.render=()=>{
 const counts=SystemHealth.counts(),last=SystemHealth.lastSave(),err=SystemHealth.lastError(),good=SystemHealth.status==='Connected';
 return `<div class="space-y-4">
  <div class="rounded-xl bg-charcoal-900 text-white p-5 flex flex-wrap justify-between gap-4 items-center"><div><p class="text-xs tracking-widest font-bold text-olive-300">SYSTEM HEALTH & SUPABASE</p><h3 class="text-lg font-bold mt-1">CRM reliability</h3><p class="text-sm text-gray-300 mt-1">Know whether the app can see its data and reach Supabase.</p></div><span class="badge ${good?'bg-green-100 text-green-800':'bg-gray-100 text-gray-700'}">${esc(SystemHealth.status)}</span></div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
   <div class="rounded-xl border p-4"><p class="text-xs text-gray-500">Records loaded</p><p class="text-2xl font-bold mt-1">${SystemHealth.total().toLocaleString()}</p></div>
   <div class="rounded-xl border p-4"><p class="text-xs text-gray-500">Loaded browser payload estimate</p><p class="text-2xl font-bold mt-1">${SystemHealth.fmt(SystemHealth.bytes())}</p><p class="text-[10px] text-gray-400 mt-1">Not your hosted Supabase database size.</p></div>
   <div class="rounded-xl border p-4"><p class="text-xs text-gray-500">Last observed save</p><p class="text-sm font-bold mt-2">${last?.at?new Date(last.at).toLocaleString('en-GB'):'Not observed yet'}</p></div>
   <div class="rounded-xl border p-4"><p class="text-xs text-gray-500">Last save error</p><p class="text-sm font-bold mt-2 ${err?'text-red-600':'text-green-700'}">${err?esc(err.message):'None observed'}</p></div>
  </div>
  <div class="grid lg:grid-cols-2 gap-3">
   <div class="rounded-xl border p-4"><div class="flex justify-between gap-3 items-start"><div><h4 class="font-bold">Supabase connection</h4><p class="text-xs text-gray-500 mt-1">${esc(SystemHealth.detail)}</p></div><button onclick="SystemHealth.test()" class="px-3 py-2 rounded-lg bg-olive-600 text-white text-sm">Test now</button></div><p class="text-xs text-gray-400 mt-4">Last test: ${SystemHealth.lastTest?new Date(SystemHealth.lastTest).toLocaleString('en-GB'):'Never'}</p></div>
   <div class="rounded-xl border p-4"><h4 class="font-bold">Capacity & account state</h4><p class="text-xs text-gray-500 mt-1">This browser can estimate only the CRM data currently loaded into memory. It cannot honestly report your exact hosted Supabase database/storage quota. Use Supabase Usage / Database reports for that figure.</p><div class="mt-3 text-xs"><b>Profile permissions:</b> ${typeof currentUserProfile!=='undefined'&&currentUserProfile?._profile_state==='unavailable'?'<span class="text-amber-700"> temporarily unavailable — access is fail-closed, not changed</span>':'<span class="text-green-700"> loaded</span>'}</div></div>
  </div>
  <div class="rounded-xl border p-4"><h4 class="font-bold">Persistence audit</h4><p class="text-xs text-gray-500 mt-1">Core live CRM modules including enquiries, sales leads, companies, opportunities, weddings and functions use Supabase loaders/saves. Some legacy operational modules and UI/preferences still use the browser DB/localStorage layer. Browser-only data is device-specific unless separately synchronised.</p><p class="text-[11px] text-amber-700 mt-2">Do not treat the downloaded browser backup or loaded-payload estimate as a Supabase backup/quota report.</p></div>
  <div class="rounded-xl border p-4"><div class="flex flex-wrap justify-between gap-3"><div><h4 class="font-bold">Largest data collections</h4><p class="text-xs text-gray-500">Useful for seeing where CRM records are growing.</p></div><button onclick="SystemHealth.backup()" class="px-3 py-2 rounded-lg bg-charcoal-900 text-white text-sm">Download CRM Backup</button></div><div class="grid sm:grid-cols-2 gap-x-5 mt-3">${counts.slice(0,12).map(x=>`<div class="flex justify-between border-b py-2 text-sm"><span>${esc(x.key)}</span><b>${x.count}</b></div>`).join('')}</div></div>
 </div>`;
};
SystemHealth.refresh=()=>{const el=document.getElementById('system-health-settings');if(el){el.innerHTML=SystemHealth.render();if(window.lucide)lucide.createIcons()}};
function renderSettings(){
return`<div class="space-y-4">
<div class="section-card">
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">TEAM</p><h3 class="font-bold text-lg text-charcoal-900">Staff Management</h3><p class="text-xs text-gray-500 mt-1">Everyone can see all CRM records. Active staff appear in assignment dropdowns.</p></div><button onclick="openStaffForm()" class="px-3 py-1.5 bg-olive-600 text-white rounded-lg text-xs font-medium hover:bg-olive-700">+ Add Staff Member</button></div>
<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-gray-500 border-b border-olive-100"><th class="py-2 pr-3">Name</th><th class="py-2 pr-3">Role</th><th class="py-2 pr-3">Status</th><th class="py-2 text-right">Actions</th></tr></thead><tbody>${staffRecords().map(member=>`<tr class="border-t border-gray-100"><td class="py-3 pr-3 font-medium">${esc(member.name)}</td><td class="py-3 pr-3">${esc(member.role)}</td><td class="py-3 pr-3"><span class="badge ${member.active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}">${member.active?'Active':'Inactive'}</span></td><td class="py-3 text-right whitespace-nowrap"><button onclick="openStaffForm('${member.id}')" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">Edit</button> <button onclick="toggleStaffActive('${member.id}')" class="px-2 py-1 ${member.active?'bg-amber-50 text-amber-700':'bg-green-50 text-green-700'} rounded text-xs font-medium">${member.active?'Archive':'Activate'}</button> <button onclick="deleteStaffMember('${member.id}')" class="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100">Delete</button></td></tr>`).join('')}</tbody></table></div>
</div>
<div class="section-card">
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p class="text-xs font-bold tracking-widest text-olive-600">COMMUNICATIONS</p><h3 class="font-bold text-lg text-charcoal-900">Email Templates</h3><p class="text-xs text-gray-500 mt-1">Manage the approved wording used by Enquiries, Functions and Weddings. Staff personalise a generated copy without changing the master.</p></div><button onclick="WindmillComms.openManager()" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-xs font-medium">Manage Templates</button></div>
</div>
<div class="section-card"><div id="system-health-settings">${SystemHealth.render()}</div></div>
<div class="section-card">
  <div class="flex flex-wrap items-start justify-between gap-3 mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">CRM STABILISATION</p><h3 class="font-bold text-lg text-charcoal-900">System Regression Audit</h3><p class="text-xs text-gray-500 mt-1">Checks critical CRM wiring without creating or changing booking data.</p></div><button onclick="WeddingV2Regression?.refresh()" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-xs font-medium">Run Audit</button></div>
  <div id="wedding-v2-regression">${window.WeddingV2Regression?WeddingV2Regression.render():'<div class="text-sm text-gray-400">Regression engine loading…</div>'}</div>
</div>
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-4">Settings</h3>
<div class="space-y-3">
<div class="flex justify-between items-center p-3 bg-cream-50 rounded-lg"><span class="text-sm font-medium">Reset All Data</span><button onclick="promptDelete('Reset all data?',()=>{localStorage.removeItem('wfcrm_db');seedData();saveDB();renderSection();toast('Data reset');})" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">Reset</button></div>
<div class="p-3 bg-cream-50 rounded-lg"><p class="text-sm font-medium mb-2">Booking Rules</p><ul class="text-xs text-gray-600 space-y-1 list-disc pl-4"><li>Provisional held 14 days</li><li>£300 non-refundable deposit confirms</li><li>Final meeting ~8 weeks before wedding</li><li>Function sheets 6 weeks before</li></ul></div>
</div></div>
<div class="section-card">
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">HISTORICAL REPORTING DATA</p><h3 class="font-bold text-lg text-charcoal-900">Monthly function breakdown</h3><p class="text-xs text-gray-500 mt-1">Enter each function type separately. Monthly and annual totals calculate automatically.</p></div><button onclick="openHistoricalForm()" class="px-3 py-1.5 bg-olive-600 text-white rounded-lg text-xs font-medium hover:bg-olive-700">+ Add Month</button></div>
<div class="overflow-x-auto"><table class="w-full text-sm min-w-[760px]"><thead><tr class="text-left text-xs text-gray-500 border-b border-olive-100"><th class="py-2 pr-3">Year</th><th class="py-2 pr-3">Month</th><th class="py-2 pr-3">Function Types</th><th class="py-2 pr-3 text-right">Total Events</th><th class="py-2 text-right">Total Revenue</th><th class="py-2 text-right">Actions</th></tr></thead><tbody>${historicalMonthGroups().length?historicalMonthGroups().map((group,index)=>{const split=group.rows.filter(r=>historicalNormalType(r.eventType)!=='All'),source=split.length?split:group.rows,totals=historicalMonthTotals(group.year,group.month),key=`${String(group.year).replace(/\W/g,'')}-${String(group.month).replace(/\W/g,'')}-${index}`;return `<tr class="border-t border-gray-100"><td class="py-3 pr-3">${esc(group.year)}</td><td class="py-3 pr-3 font-medium">${esc(group.month)}</td><td class="py-3 pr-3"><button onclick="toggleHistoricalMonth('${key}')" class="inline-flex items-center gap-1 text-olive-700 font-medium"><i id="historical-icon-${key}" data-lucide="chevron-down" style="width:14px;height:14px"></i>${split.length?`${split.length} types`:'Needs splitting'}</button></td><td class="py-3 pr-3 text-right">${totals.events}</td><td class="py-3 text-right">£${totals.revenue.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td class="py-3 text-right whitespace-nowrap"><button onclick="openHistoricalForm('${esc(group.year)}','${esc(group.month)}')" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">Edit Split</button> <button onclick="deleteHistoricalMonth('${esc(group.year)}','${esc(group.month)}')" class="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100">Delete</button></td></tr><tr id="historical-detail-${key}" class="hidden bg-cream-50"><td colspan="6" class="p-3"><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">${source.map(row=>`<div class="bg-white rounded-lg border border-gray-100 p-3"><div class="flex justify-between gap-2"><strong class="text-sm">${esc(historicalNormalType(row.eventType))}</strong><span class="text-xs text-gray-500">${Number(row.events)||0} events</span></div><p class="text-sm text-gold-700 font-bold mt-1">£${Number(row.revenue||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}</p></div>`).join('')}</div></td></tr>`;}).join(''):`<tr><td colspan="6" class="py-10 text-center text-sm text-gray-400">No historical reporting data has been added yet.</td></tr>`}</tbody></table></div>
</div></div>`;
}



// ============================================================================
// HISTORICAL REPORTING — SUPABASE PERSISTENCE
// Keeps monthly reporting data available after cache clears and on new devices.
// ============================================================================

let historicalReportingLoaded = false;
let historicalReportingLoading = false;

async function loadHistoricalReportingFromSupabase() {
  if (historicalReportingLoading) return;
  historicalReportingLoading = true;

  const localRows = Array.isArray(DB.historical)
    ? DB.historical.map(row => ({...row}))
    : [];

  const { data, error } = await supabaseClient
    .from('historical_reporting')
    .select('*')
    .order('year', { ascending: false })
    .order('month_number', { ascending: true })
    .order('event_type', { ascending: true });

  if (error) {
    console.warn('Historical reporting table is not ready:', error);
    historicalReportingLoading = false;
    return;
  }

  // One-time migration: if Supabase is empty but this browser has the old
  // localStorage records, copy those records into the shared database.
  if (!(data || []).length && localRows.length) {
    const migrationRows = localRows.map(row => ({
      year: Number(row.year),
      month: String(row.month || ''),
      month_number: Math.max(1, HISTORICAL_MONTHS.indexOf(String(row.month || '')) + 1),
      event_type: historicalNormalType(row.eventType),
      events: Number(row.events || 0),
      revenue: Number(row.revenue || 0)
    })).filter(row =>
      Number.isInteger(row.year) &&
      HISTORICAL_MONTHS.includes(row.month) &&
      row.event_type !== 'All'
    );

    if (migrationRows.length) {
      const migration = await supabaseClient
        .from('historical_reporting')
        .upsert(migrationRows, {
          onConflict: 'year,month,event_type'
        });

      if (migration.error) {
        console.error('Historical reporting migration failed:', migration.error);
      } else {
        return loadHistoricalReportingFromSupabase();
      }
    }
  }

  DB.historical = (data || []).map(row => ({
    id: row.id,
    year: Number(row.year),
    month: row.month || '',
    eventType: row.event_type || 'Other',
    events: Number(row.events || 0),
    revenue: Number(row.revenue || 0),
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  }));

  historicalReportingLoaded = true;
  historicalReportingLoading = false;

  if (currentSection === 'settings' || currentSection === 'reports') {
    renderSection();
  }
}

async function saveHistoricalSplitForm(ev, originalYear = '', originalMonth = '') {
  ev.preventDefault();

  const form = new FormData(ev.target);
  const year = String(form.get('year') || '').trim();
  const month = String(form.get('month') || '').trim();
  const error = document.getElementById('historical-form-error');

  if (!/^[0-9]{4}$/.test(year) || !HISTORICAL_MONTHS.includes(month)) {
    error.textContent = 'Please select a valid year and month.';
    error.classList.remove('hidden');
    return;
  }

  const rows = [];
  let totalEvents = 0;
  let totalRevenue = 0;
  let invalid = false;

  document.querySelectorAll('.historical-split-row').forEach(row => {
    const type = row.dataset.type;
    const events = Number(row.querySelector('[data-kind="events"]').value || 0);
    const revenue = Number(row.querySelector('[data-kind="revenue"]').value || 0);

    if (!Number.isInteger(events) || events < 0 || !Number.isFinite(revenue) || revenue < 0) {
      invalid = true;
      return;
    }

    totalEvents += events;
    totalRevenue += revenue;

    if (events > 0 || revenue > 0) {
      rows.push({
        year: Number(year),
        month,
        month_number: HISTORICAL_MONTHS.indexOf(month) + 1,
        event_type: type,
        events,
        revenue
      });
    }
  });

  if (invalid) {
    error.textContent = 'Events must be whole numbers and values cannot be negative.';
    error.classList.remove('hidden');
    return;
  }

  if (totalEvents === 0 && totalRevenue === 0) {
    error.textContent = 'Enter at least one function type with events or revenue.';
    error.classList.remove('hidden');
    return;
  }

  const deleteYears = new Set([year]);
  if (originalYear) deleteYears.add(String(originalYear));

  for (const deleteYear of deleteYears) {
    const deleteMonth = deleteYear === String(originalYear) && originalMonth
      ? originalMonth
      : month;

    const deletion = await supabaseClient
      .from('historical_reporting')
      .delete()
      .eq('year', Number(deleteYear))
      .eq('month', deleteMonth);

    if (deletion.error) {
      console.error(deletion.error);
      error.textContent = 'The old monthly records could not be replaced.';
      error.classList.remove('hidden');
      return;
    }
  }

  const insert = await supabaseClient
    .from('historical_reporting')
    .insert(rows);

  if (insert.error) {
    console.error(insert.error);
    error.textContent = 'The monthly breakdown could not be saved.';
    error.classList.remove('hidden');
    return;
  }

  closeModal();
  await loadHistoricalReportingFromSupabase();
  renderSection();
  toast(originalYear ? 'Monthly breakdown updated' : 'Monthly breakdown added');
}

function deleteHistoricalMonth(year, month) {
  promptDelete(`Delete all historical data for ${month} ${year}?`, async () => {
    const { error } = await supabaseClient
      .from('historical_reporting')
      .delete()
      .eq('year', Number(year))
      .eq('month', month);

    if (error) {
      console.error(error);
      toast('Monthly historical data could not be deleted', 'error');
      return;
    }

    await loadHistoricalReportingFromSupabase();
    renderSection();
    toast('Monthly historical data deleted');
  });
}

async function initialiseHistoricalReportingSync() {
  const { data } = await supabaseClient.auth.getSession();
  if (data?.session) await loadHistoricalReportingFromSupabase();
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session && ['SIGNED_IN', 'INITIAL_SESSION', 'TOKEN_REFRESHED'].includes(event)) {
    window.setTimeout(loadHistoricalReportingFromSupabase, 0);
  }
});

window.setTimeout(initialiseHistoricalReportingSync, 0);
