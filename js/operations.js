// ===== FUNCTIONS =====
// Functions Centre is now implemented in js/functions.js.
// The old localStorage-only Functions renderer was removed because it overrode
// the Supabase-backed Functions Command Centre when operations.js loaded later.

// ===== CALENDAR =====
let calMonth=6,calYear=2026;
function renderCalendar(){
const legend=[{label:'Wedding',color:'#16a34a'},{label:'Viewing',color:'#3b82f6'},{label:'Function',color:'#f97316'},{label:'Meeting',color:'#8b5cf6'},{label:'Payment',color:'#dc2626'},{label:'Staff',color:'#6b7280'}];
return`<div class="flex items-center justify-between mb-4">
<div class="flex gap-2 flex-wrap">${legend.map(l=>`<span class="flex items-center gap-1 text-xs"><span class="w-2.5 h-2.5 rounded-full" style="background:${l.color}"></span>${l.label}</span>`).join('')}</div>
</div>
<div class="section-card mb-4">
<div class="flex items-center justify-between mb-4">
<button onclick="calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderSection()" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="chevron-left" style="width:18px;height:18px"></i></button>
<h3 class="font-bold text-lg text-charcoal-900" id="cal-title"></h3>
<button onclick="calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderSection()" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="chevron-right" style="width:18px;height:18px"></i></button>
</div>
<div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
<div id="cal-grid" class="grid grid-cols-7 gap-1"></div>
</div>
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">Upcoming Events</h3>
<div class="space-y-2">${DB.events.filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,8).map(e=>`<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-50 cursor-pointer"><div class="w-3 h-3 rounded-full flex-shrink-0" style="background:${e.color}"></div><div class="flex-1"><p class="text-sm font-medium">${esc(e.title)}</p><p class="text-xs text-gray-500">${e.date} ${e.time||''}</p></div></div>`).join('')||'<p class="text-sm text-gray-400">No upcoming events</p>'}</div>
</div>`;
}
function initCalendar(){
const title=document.getElementById('cal-title');
if(title)title.textContent=new Date(calYear,calMonth).toLocaleString('en-GB',{month:'long',year:'numeric'});
const grid=document.getElementById('cal-grid');if(!grid)return;
const first=new Date(calYear,calMonth,1);const startDay=(first.getDay()+6)%7;const days=new Date(calYear,calMonth+1,0).getDate();
let html='';
for(let i=0;i<startDay;i++)html+='<div></div>';
for(let d=1;d<=days;d++){
const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const dayEvents=DB.events.filter(e=>e.date===ds);
const isToday=ds===todayStr;
html+=`<div class="min-h-[40px] p-1 rounded-lg text-xs cursor-pointer hover:bg-olive-50 ${isToday?'bg-olive-100 ring-2 ring-olive-400 font-bold':''}"><span class="block">${d}</span><div class="flex flex-wrap gap-0.5 mt-0.5">${dayEvents.slice(0,3).map(e=>`<div class="w-2 h-2 rounded-full" style="background:${e.color}" title="${esc(e.title)}"></div>`).join('')}</div></div>`;
}
grid.innerHTML=html;
}

// ===== MEETINGS =====
function renderMeetings(){
return`<div class="flex justify-between items-center mb-4"><p class="text-sm text-gray-500">${DB.meetings.length} meeting${DB.meetings.length!==1?'s':''}</p><button onclick="openMeetingForm()" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700">+ New Meeting</button></div>
<div class="space-y-2">${DB.meetings.map(m=>`
<div class="bg-white rounded-xl p-4 border border-olive-100 shadow-sm">
<div class="flex flex-col sm:flex-row sm:items-center gap-3">
<div class="flex-1">
<div class="flex items-center gap-2"><span class="font-semibold text-charcoal-900">${esc(m.client)}</span><span class="badge ${m.status==='Completed'?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}">${m.status}</span></div>
<p class="text-xs text-gray-500 mt-1">${m.type} · ${m.date} ${m.time} · ${m.staff}</p>
${m.actions?`<p class="text-xs text-olive-600 mt-1">→ ${esc(m.actions)}</p>`:''}
</div>
<div class="flex gap-1.5">
<button onclick="toggleMeetingStatus('${m.id}')" class="px-3 py-1.5 bg-olive-50 text-olive-700 rounded-lg text-xs font-medium hover:bg-olive-100">${m.status==='Completed'?'Reopen':'Complete'}</button>
<button onclick="openMeetingForm('${m.id}')" class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">Edit</button>
</div></div></div>`).join('')}</div>`;
}
function toggleMeetingStatus(id){const m=DB.meetings.find(x=>x.id===id);if(m){m.status=m.status==='Completed'?'Outstanding':'Completed';saveDB();renderSection();toast('Updated');}}

function openMeetingForm(id){
const m=id?DB.meetings.find(x=>x.id===id):null;
const types=['Wedding Viewing','First Wedding Meeting','Midpoint Meeting','Final Meeting','Function Planning Meeting','Corporate Meeting','Internal Review'];
openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold">${id?'Edit':'New'} Meeting</h2><button onclick="closeModal()" class="p-1 hover:bg-gray-100 rounded"><i data-lucide="x" style="width:20px;height:20px"></i></button></div>
<form onsubmit="saveMeetingForm(event,'${id||''}')" class="space-y-3">
<div class="grid grid-cols-2 gap-3">
<div><label class="text-xs font-medium text-gray-600">Client *</label><input name="client" required value="${esc(m?.client||'')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div><label class="text-xs font-medium text-gray-600">Type</label><select name="type" class="w-full px-3 py-2 border rounded-lg text-sm">${types.map(t=>`<option ${m?.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
<div><label class="text-xs font-medium text-gray-600">Date</label><input name="date" type="date" value="${m?.date||''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div><label class="text-xs font-medium text-gray-600">Time</label><input name="time" type="time" value="${m?.time||''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div><label class="text-xs font-medium text-gray-600">Staff</label><select name="staff" class="w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(m?.staff||'')}</select></div>
<div><label class="text-xs font-medium text-gray-600">Follow-up</label><input name="followup" type="date" value="${m?.followup||''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
</div>
<div><label class="text-xs font-medium text-gray-600">Actions</label><input name="actions" value="${esc(m?.actions||'')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div><label class="text-xs font-medium text-gray-600">Notes</label><textarea name="notes" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(m?.notes||'')}</textarea></div>
<button type="submit" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700">Save Meeting</button>
</form></div>`);
}
function saveMeetingForm(ev,id){
ev.preventDefault();const f=new FormData(ev.target);
const obj={id:id||'m'+Date.now(),client:f.get('client'),date:f.get('date'),time:f.get('time'),type:f.get('type'),staff:f.get('staff'),notes:f.get('notes'),actions:f.get('actions'),followup:f.get('followup'),status:'Outstanding'};
if(id){const idx=DB.meetings.findIndex(x=>x.id===id);if(idx>=0)DB.meetings[idx]={...DB.meetings[idx],...obj};}else DB.meetings.push(obj);
saveDB();closeModal();renderSection();toast('Meeting saved');
}

// ===== TASKS =====
/* PHASE 1: superseded duplicate `renderTasks` removed; active declaration retained later in this file. */

function getFilteredTasks(){
const filter=document.getElementById('task-filter')?.value||'';
let list=[...DB.tasks];
if(filter==='today')list=list.filter(t=>t.due===todayStr);
else if(filter==='overdue')list=list.filter(t=>isOverdue(t.due)&&t.status!=='Completed');
else if(filter)list=list.filter(t=>t.category===filter);
return list.sort((a,b)=>{const po={Urgent:0,High:1,Medium:2,Low:3};return(po[a.priority]||2)-(po[b.priority]||2);});
}
function cycleTaskStatus(id){const t=DB.tasks.find(x=>x.id===id);if(!t)return;const order=['Not Started','In Progress','Waiting for Client','Completed'];const idx=order.indexOf(t.status);t.status=t.status==='Completed'?'Not Started':order[Math.min(idx+1,order.length-1)];saveDB();renderSection();toast('Updated');}

function openTaskForm(id){
const t=id?DB.tasks.find(x=>x.id===id):null;
openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold">${id?'Edit':'New'} Task</h2><button onclick="closeModal()" class="p-1 hover:bg-gray-100 rounded"><i data-lucide="x" style="width:20px;height:20px"></i></button></div>
<form onsubmit="saveTaskForm(event,'${id||''}')" class="space-y-3">
<div><label class="text-xs font-medium text-gray-600">Title *</label><input name="title" required value="${esc(t?.title||'')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div class="grid grid-cols-2 gap-3">
<div><label class="text-xs font-medium text-gray-600">Client</label><input name="client" value="${esc(t?.client||'')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div><label class="text-xs font-medium text-gray-600">Category</label><select name="category" class="w-full px-3 py-2 border rounded-lg text-sm"><option ${t?.category==='Weddings'?'selected':''}>Weddings</option><option ${t?.category==='Functions'?'selected':''}>Functions</option><option ${t?.category==='Payments'?'selected':''}>Payments</option><option ${t?.category==='Marketing'?'selected':''}>Marketing</option><option ${t?.category==='General'?'selected':''}>General</option></select></div>
<div><label class="text-xs font-medium text-gray-600">Owner</label><select name="owner" class="w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(t?.owner||'')}</select></div>
<div><label class="text-xs font-medium text-gray-600">Due</label><input name="due" type="date" value="${t?.due||''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
<div><label class="text-xs font-medium text-gray-600">Priority</label><select name="priority" class="w-full px-3 py-2 border rounded-lg text-sm"><option ${t?.priority==='Low'?'selected':''}>Low</option><option ${t?.priority==='Medium'?'selected':''}>Medium</option><option ${t?.priority==='High'?'selected':''}>High</option><option ${t?.priority==='Urgent'?'selected':''}>Urgent</option></select></div>
<div><label class="text-xs font-medium text-gray-600">Status</label><select name="status" class="w-full px-3 py-2 border rounded-lg text-sm"><option ${t?.status==='Not Started'?'selected':''}>Not Started</option><option ${t?.status==='In Progress'?'selected':''}>In Progress</option><option ${t?.status==='Waiting for Client'?'selected':''}>Waiting for Client</option><option ${t?.status==='Completed'?'selected':''}>Completed</option></select></div>
</div>
<div><label class="text-xs font-medium text-gray-600">Notes</label><textarea name="notes" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(t?.notes||'')}</textarea></div>
<button type="submit" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700">Save Task</button>
</form></div>`);
}
function saveTaskForm(ev,id){ev.preventDefault();const f=new FormData(ev.target);const obj={id:id||'t'+Date.now(),title:f.get('title'),client:f.get('client'),category:f.get('category'),owner:f.get('owner'),due:f.get('due'),priority:f.get('priority'),status:f.get('status'),notes:f.get('notes')};if(id){const idx=DB.tasks.findIndex(x=>x.id===id);if(idx>=0)DB.tasks[idx]=obj;}else DB.tasks.push(obj);saveDB();closeModal();renderSection();toast('Task saved');}

// ===== PAYMENTS =====
function renderPayments(){
const totalExp=DB.payments.reduce((a,p)=>a+p.totalValue,0);
const depositsRec=DB.payments.filter(p=>p.depositPaid).reduce((a,p)=>a+p.depositReq,0);
const paidFull=DB.payments.filter(p=>p.status==='Paid in Full').reduce((a,p)=>a+p.totalValue,0);
const received=depositsRec+paidFull;
const outstanding=totalExp-received;
const overdue=DB.payments.filter(p=>isOverdue(p.deadline)&&p.status!=='Paid in Full');

return`<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Expected</p><p class="text-xl font-bold text-charcoal-900">£${totalExp.toLocaleString()}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Received</p><p class="text-xl font-bold text-green-600">£${received.toLocaleString()}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Outstanding</p><p class="text-xl font-bold text-orange-600">£${outstanding.toLocaleString()}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Overdue</p><p class="text-xl font-bold text-red-600">${overdue.length}</p></div>
</div>
${overdue.length?`<div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800"><strong>⚠️ Overdue:</strong> ${overdue.map(p=>esc(p.client)+' (£'+p.finalBalance.toLocaleString()+')').join(', ')}</div>`:''}
<div class="space-y-2">${DB.payments.map(p=>`
<div class="bg-white rounded-xl p-4 border border-olive-100 shadow-sm">
<div class="flex flex-col sm:flex-row sm:items-center gap-3">
<div class="flex-1">
<div class="flex items-center gap-2"><span class="font-semibold text-charcoal-900">${esc(p.client)}</span><span class="badge ${payStatusColor(p.status)}">${p.status}</span>${isOverdue(p.deadline)&&p.status!=='Paid in Full'?'<span class="badge bg-red-100 text-red-700">Overdue</span>':''}</div>
<p class="text-xs text-gray-500 mt-1">${p.event} · ${p.date} · Total: £${p.totalValue.toLocaleString()} · Balance: £${p.finalBalance.toLocaleString()}${p.deadline?' · Due: '+p.deadline:''}</p>
</div>
<button onclick="cyclePayStatus('${p.id}')" class="px-3 py-1.5 bg-olive-50 text-olive-700 rounded-lg text-xs font-medium hover:bg-olive-100 whitespace-nowrap">Update →</button>
</div></div>`).join('')}</div>`;
}
function cyclePayStatus(id){const p=DB.payments.find(x=>x.id===id);if(!p)return;const order=['No Payment Received','Deposit Due','Deposit Paid','Part Paid','Final Balance Due','Paid in Full'];const idx=order.indexOf(p.status);p.status=order[Math.min(idx+1,order.length-1)];if(p.status==='Deposit Paid')p.depositPaid=true;saveDB();renderSection();toast('Payment updated');}

// ===== MARKETING =====
function renderMarketing(){
const sources={};DB.enquiries.forEach(e=>{sources[e.source]=(sources[e.source]||0)+1;});
const total=DB.enquiries.length||1;
const booked=DB.enquiries.filter(e=>['Confirmed Booking','Provisional Booking'].includes(e.status));
const sourceConv={};
Object.keys(sources).forEach(s=>{const fromSource=DB.enquiries.filter(e=>e.source===s);const conv=fromSource.filter(e=>['Confirmed Booking','Provisional Booking'].includes(e.status)).length;sourceConv[s]=fromSource.length?Math.round(conv/fromSource.length*100):0;});

return`<div class="grid md:grid-cols-2 gap-4 mb-6">
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">Lead Source Performance</h3>
<div class="space-y-3">${Object.entries(sources).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="flex items-center gap-3"><span class="text-sm flex-1 min-w-0">${k}</span><div class="w-20 bg-gray-200 rounded-full h-2"><div class="bg-olive-500 rounded-full h-2" style="width:${v/total*100}%"></div></div><span class="text-xs font-bold w-6 text-right">${v}</span><span class="text-xs text-olive-600 font-medium w-10 text-right">${sourceConv[k]}%</span></div>`).join('')}</div>
</div>
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">Enquiry Split</h3>
<div class="grid grid-cols-2 gap-4 mb-4">
<div class="text-center p-4 bg-cream-50 rounded-lg"><p class="text-3xl font-bold text-olive-700">${DB.enquiries.filter(e=>e.eventType==='Wedding').length}</p><p class="text-xs text-gray-500 mt-1">Weddings</p></div>
<div class="text-center p-4 bg-cream-50 rounded-lg"><p class="text-3xl font-bold text-gold-500">${DB.enquiries.filter(e=>e.eventType!=='Wedding').length}</p><p class="text-xs text-gray-500 mt-1">Functions</p></div>
</div>
</div>
</div>
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">Campaigns & Activities</h3>
<div class="space-y-2">${DB.marketing.map(m=>`<div class="flex items-center gap-3 p-3 rounded-lg bg-cream-50 border border-cream-200"><div class="flex-1"><p class="text-sm font-medium">${esc(m.title)}</p><p class="text-xs text-gray-500">${m.type} · ${m.date} · <span class="badge bg-olive-100 text-olive-700">${m.status}</span></p></div></div>`).join('')}</div>
</div>`;
}



// ============================================================================
// FOLLOW-UPS WORK QUEUE
// Overrides the earlier generic task-only rendering.
// ============================================================================

function renderTasks() {
  const openEnquiries = DB.enquiries.filter(isOpenSalesEnquiry);
  const overdue = openEnquiries.filter(enquiry => isOverdue(enquiry.nextFollowup));
  const dueToday = openEnquiries.filter(enquiry => isDueToday(enquiry.nextFollowup));
  const upcoming = openEnquiries.filter(enquiry =>
    enquiry.nextFollowup &&
    !isOverdue(enquiry.nextFollowup) &&
    !isDueToday(enquiry.nextFollowup)
  );
  const noDate = openEnquiries.filter(enquiry => !enquiry.nextFollowup);
  const rezlynx = DB.enquiries.filter(enquiryNeedsRezlynx);

  const sortByDate = list => [...list].sort((a, b) =>
    String(a.nextFollowup || '9999-12-31').localeCompare(String(b.nextFollowup || '9999-12-31'))
  );

  function salesCards(list, emptyMessage) {
    if (!list.length) return `<p class="text-sm text-gray-400 py-5 text-center">${emptyMessage}</p>`;

    return sortByDate(list).map(enquiry => {
      const stage = followupStageDetails(enquiry);
      return `<div class="bg-white rounded-xl p-4 border border-olive-100 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-charcoal-900">${esc(enquiry.name)}</span>
              <span class="badge ${statusColor(enquiry.status)}">${enquiry.status}</span>
              <span class="badge ${priorityBadge(enquiry.priority || 'Warm')}">${enquiry.priority || 'Warm'}</span>
              ${isOverdue(enquiry.nextFollowup) ? '<span class="badge bg-red-100 text-red-700">Overdue</span>' : ''}
              ${isDueToday(enquiry.nextFollowup) ? '<span class="badge bg-amber-100 text-amber-800">Due today</span>' : ''}
            </div>
            <p class="text-sm font-medium text-charcoal-900 mt-2">${esc(enquiry.nextAction || stage.action)}</p>
            <p class="text-xs text-gray-500 mt-1">
              ${esc(enquiry.eventType)} · ${esc(enquiry.staff || 'Unassigned')} · Due ${formatSalesDate(enquiry.nextFollowup)}
            </p>
            <p class="text-xs text-gray-600 mt-2">${esc(stage.guidance)}</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button onclick="openFollowupOutcome('${enquiry.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-xs font-medium">
              Complete Action
            </button>
            <button onclick="viewEnquiry('${enquiry.id}')" class="px-3 py-2 bg-olive-50 text-olive-700 rounded-lg text-xs font-medium">
              Open Full Enquiry
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  return `<div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
    <button onclick="document.getElementById('followup-overdue').scrollIntoView({behavior:'smooth'})" class="kpi-card text-left">
      <p class="text-xs text-gray-500">Overdue</p><p class="text-2xl font-bold text-red-600">${overdue.length}</p>
    </button>
    <button onclick="document.getElementById('followup-today').scrollIntoView({behavior:'smooth'})" class="kpi-card text-left">
      <p class="text-xs text-gray-500">Due Today</p><p class="text-2xl font-bold text-amber-600">${dueToday.length}</p>
    </button>
    <button onclick="document.getElementById('followup-upcoming').scrollIntoView({behavior:'smooth'})" class="kpi-card text-left">
      <p class="text-xs text-gray-500">Upcoming</p><p class="text-2xl font-bold text-olive-700">${upcoming.length}</p>
    </button>
    <button onclick="document.getElementById('followup-missing').scrollIntoView({behavior:'smooth'})" class="kpi-card text-left">
      <p class="text-xs text-gray-500">No Date</p><p class="text-2xl font-bold text-red-600">${noDate.length}</p>
    </button>
    <button onclick="document.getElementById('followup-rezlynx').scrollIntoView({behavior:'smooth'})" class="kpi-card text-left">
      <p class="text-xs text-gray-500">Rezlynx Required</p><p class="text-2xl font-bold text-purple-600">${rezlynx.length}</p>
    </button>
  </div>

  <div class="bg-olive-50 border border-olive-200 rounded-xl p-4 mb-6">
    <p class="font-semibold text-sm text-charcoal-900">Daily sales routine</p>
    <p class="text-xs text-gray-600 mt-1">
      Work from top to bottom: overdue first, then today. Log every call or email using Complete Action;
      the CRM will schedule the next step automatically.
    </p>
  </div>

  <div class="space-y-6">
    <section id="followup-overdue">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-red-700">Overdue Follow-Ups</h3>
        <span class="badge bg-red-100 text-red-700">${overdue.length}</span>
      </div>
      <div class="space-y-2">${salesCards(overdue, 'No overdue follow-ups. Excellent.')}</div>
    </section>

    <section id="followup-today">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-charcoal-900">Due Today</h3>
        <span class="badge bg-amber-100 text-amber-800">${dueToday.length}</span>
      </div>
      <div class="space-y-2">${salesCards(dueToday, 'No enquiry follow-ups are due today.')}</div>
    </section>

    <section id="followup-rezlynx">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-charcoal-900">Confirmed – Rezlynx Reference Required</h3>
        <span class="badge bg-purple-100 text-purple-700">${rezlynx.length}</span>
      </div>
      <div class="space-y-2">
        ${rezlynx.length ? rezlynx.map(enquiry => `<div class="bg-white rounded-xl p-4 border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex-1">
            <p class="font-semibold text-charcoal-900">${esc(enquiry.name)}</p>
            <p class="text-xs text-gray-500 mt-1">${esc(enquiry.eventType)} · ${enquiry.preferredDate || 'TBC'}</p>
          </div>
          <button onclick="openRezlynxReferenceForm('${enquiry.id}')" class="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium">Enter BK Reference</button>
          <button onclick="viewEnquiry('${enquiry.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium">Open Full Enquiry</button>
        </div>`).join('') : '<p class="text-sm text-gray-400 py-5 text-center">All confirmed enquiries have a Rezlynx reference.</p>'}
      </div>
    </section>

    <section id="followup-missing">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-charcoal-900">Open Enquiries With No Follow-Up Date</h3>
        <span class="badge bg-red-100 text-red-700">${noDate.length}</span>
      </div>
      <div class="space-y-2">${salesCards(noDate, 'Every open enquiry has a follow-up date.')}</div>
    </section>

    <section id="followup-upcoming">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-charcoal-900">Upcoming Follow-Ups</h3>
        <span class="badge bg-olive-100 text-olive-700">${upcoming.length}</span>
      </div>
      <div class="space-y-2">${salesCards(upcoming, 'No upcoming follow-ups have been scheduled.')}</div>
    </section>

    <details class="bg-white rounded-xl border border-olive-100 shadow-sm">
      <summary class="cursor-pointer p-4 font-semibold text-sm text-charcoal-900">
        Operational Tasks (${DB.tasks.filter(task => task.status !== 'Completed').length} open)
      </summary>
      <div class="p-4 pt-0">
        <div class="flex justify-end mb-3">
          <button onclick="openTaskForm()" class="px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium">+ New Operational Task</button>
        </div>
        <div class="space-y-2">
          ${getFilteredTasks().map(task => `<div class="rounded-lg p-3 border border-gray-100 ${task.status === 'Completed' ? 'opacity-50' : ''}">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <div class="flex-1">
                <p class="text-sm font-medium ${task.status === 'Completed' ? 'line-through' : ''}">${esc(task.title)}</p>
                <p class="text-xs text-gray-500">${task.category} · ${task.owner} · Due ${task.due || 'not set'}</p>
              </div>
              <button onclick="cycleTaskStatus('${task.id}')" class="px-3 py-1.5 bg-olive-50 text-olive-700 rounded-lg text-xs">${task.status === 'Completed' ? 'Reopen' : 'Next →'}</button>
            </div>
          </div>`).join('') || '<p class="text-sm text-gray-400">No operational tasks.</p>'}
        </div>
      </div>
    </details>
  </div>`;
}
