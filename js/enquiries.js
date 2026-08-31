// ===== ENQUIRIES =====
/* PHASE 1: superseded duplicate `renderEnquiries` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `filterEnquiries` removed; active declaration retained later in this file. */


async function deleteEnquiry(id) {
  const { error } = await supabaseClient
    .from("enquiries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete enquiry:", error);
    toast("Enquiry could not be deleted", "error");
    return;
  }

  await loadEnquiriesFromSupabase();
  filterEnquiries();
  toast("Enquiry deleted");
}
/* PHASE 1: superseded duplicate `viewEnquiry` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `addComm` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `saveComm` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `updateEnqStatus` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `openEnquiryForm` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `saveEnquiryForm` removed; active declaration retained later in this file. */



// ===== PIPELINE =====
function renderPipeline(){
 if(!window.EnquiryPipelineHealth){
   return '<div class="section-card">Pipeline health engine is loading…</div>';
 }
 const s=EnquiryPipelineHealth.summary();
 const stages=EnquiryPipelineHealth.stageSummary();
 return `<section class="eqp4-wrap">
   <div class="eqp4-hero">
    <div><p class="eqv2-eyebrow">PIPELINE HEALTH</p><h2>${s.urgent.length+s.stuck.length?`${s.urgent.length+s.stuck.length} opportunities need movement`:'Pipeline is moving'}</h2><p>Stage ageing and workflow risk are shown here; detailed conversion and revenue analysis remains in Reports.</p></div>
    <div class="eqp4-hero-stats"><div><strong>£${s.pipelineValue.toLocaleString()}</strong><span>Live pipeline</span></div><div><strong>£${s.weighted.toLocaleString()}</strong><span>Weighted</span></div><div><strong>${s.urgent.length}</strong><span>Urgent</span></div><div><strong>${s.stuck.length}</strong><span>Stuck</span></div></div>
   </div>
   <div class="eqp4-healthbar"><span class="healthy" style="flex:${Math.max(1,s.healthy.length)}" title="${s.healthy.length} on track"></span><span class="watch" style="flex:${Math.max(0,s.watch.length)}"></span><span class="stuck" style="flex:${Math.max(0,s.stuck.length)}"></span><span class="urgent" style="flex:${Math.max(0,s.urgent.length)}"></span></div>
   <div class="eqp4-legend"><span><i class="healthy"></i>${s.healthy.length} on track</span><span><i class="watch"></i>${s.watch.length} watch</span><span><i class="stuck"></i>${s.stuck.length} stuck</span><span><i class="urgent"></i>${s.urgent.length} urgent</span></div>
   <div class="overflow-x-auto pb-4"><div class="eqp4-board">
    ${stages.map(col=>`<section class="eqp4-col"><header><div><strong>${esc(col.stage)}</strong><small>${col.avg}d avg · target ${col.target}d</small></div><span>${col.rows.length}</span><p>£${col.value.toLocaleString()} · weighted £${col.weighted.toLocaleString()}</p>${col.stuck?`<b>${col.stuck} need movement</b>`:''}</header>
      <div class="eqp4-cards">${col.rows.sort((a,b)=>EnquiryPipelineHealth.info(a).key==='urgent'?-1:EnquiryPipelineHealth.info(b).key==='urgent'?1:Number(b.value||0)-Number(a.value||0)).map(e=>{const h=EnquiryPipelineHealth.info(e),cd=EnquiryPipelineHealth.countdown(e);return `<article onclick="viewEnquiry('${e.id}')" class="${h.key}"><div class="eqp4-cardtop"><strong>${esc(e.name)}</strong><span class="eqp4-state ${h.key}" title="${esc(h.reason)}">${h.label}</span></div><p>${esc(e.eventType||'Event')} · ${esc(e.preferredDate||'TBC')}</p><div class="eqp4-money"><b>£${Number(e.value||0).toLocaleString()}</b><span>${Number(e.probability||0)}%</span></div>${cd?`<div class="eqp4-countdown">${esc(cd)}</div>`:''}<small>${esc(h.reason)}</small><div class="eqp4-cardfoot"><span>${esc(e.staff||'Unassigned')}</span><button onclick="event.stopPropagation();openFollowupOutcome('${e.id}')">Action</button></div></article>`}).join('')||'<div class="eqp4-empty">No opportunities</div>'}</div>
    </section>`).join('')}
   </div></div>
 </section>`;
}



// ============================================================================
// SALES FOLLOW-UP SYSTEM
// This final implementation intentionally overrides the earlier enquiry
// functions in this file.
// ============================================================================

const ENQUIRY_STATUSES = [
  'New Enquiry',
  'Contacted',
  'Brochure Sent',
  'Viewing Booked',
  'Viewing Completed',
  'Quote Sent',
  'Provisional Booking',
  'Deposit Required',
  'Confirmed Booking',
  'Lost Enquiry',
  'Follow Up Later'
];

const LOST_REASONS = [
  'No Response',
  'Date Unavailable',
  'Too Expensive',
  'Booked Elsewhere',
  'Venue Not Suitable',
  'Event Cancelled',
  'Other'
];

const SALES_FOLLOWUP_STAGES = {
  new: {
    label: 'Initial call',
    days: 1,
    action: 'Call the new enquiry',
    guidance: 'Call the customer, understand their plans and aim to book a viewing.'
  },
  call_no_answer: {
    label: 'Follow-up email',
    days: 1,
    action: 'Send the first follow-up email',
    guidance: 'Mention that you tried calling and invite them to arrange a call or viewing.'
  },
  email_sent: {
    label: 'Second call',
    days: 3,
    action: 'Make a second telephone attempt',
    guidance: 'Call again and refer to the email already sent.'
  },
  second_call_no_answer: {
    label: '7-day follow-up',
    days: 7,
    action: 'Send a helpful follow-up',
    guidance: 'Offer assistance, availability checking and a venue viewing.'
  },
  seven_day_sent: {
    label: '14-day follow-up',
    days: 7,
    action: 'Send the 14-day follow-up',
    guidance: 'Check whether they are still looking and ask if their plans have changed.'
  },
  fourteen_day_sent: {
    label: '30-day nurture',
    days: 16,
    action: 'Send the 30-day “changed your mind?” email',
    guidance: 'Keep the message warm and sales-focused without being pushy.'
  },
  thirty_day_sent: {
    label: 'Long-term nurture',
    days: 30,
    action: 'Review and nurture the enquiry',
    guidance: 'Check availability, new packages or a reason to re-engage.'
  },
  custom: {
    label: 'Custom follow-up',
    days: 1,
    action: 'Follow up with this enquiry',
    guidance: 'Review the full enquiry and complete the agreed next action.'
  }
};

let pendingEnquiryFilter = '';

function addDaysToDate(dateString, days) {
  const base = new Date((dateString || todayStr) + 'T12:00:00');
  base.setDate(base.getDate() + Number(days || 0));
  const local = new Date(base.getTime() - base.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatSalesDate(value) {
  if (!value) return 'Not set';
  return new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function followupStageDetails(enquiry) {
  return SALES_FOLLOWUP_STAGES[enquiry.followupStage] || SALES_FOLLOWUP_STAGES.custom;
}

function isOpenSalesEnquiry(enquiry) {
  return !['Confirmed Booking', 'Lost Enquiry'].includes(enquiry.status);
}

function enquiryNeedsRezlynx(enquiry) {
  return enquiry.status === 'Confirmed Booking' && !String(enquiry.rezlynxReference || '').trim();
}

function normaliseRezlynxReference(value) {
  return String(value || '').trim().toUpperCase();
}

function validRezlynxReference(value) {
  return /^BK[A-Z0-9]{4,12}$/.test(normaliseRezlynxReference(value));
}

function openEnquiryActionFilter(filterName) {
  pendingEnquiryFilter = filterName || '';
  navigate('enquiries');
}

function applyPendingEnquiryFilter() {
  if (!pendingEnquiryFilter) return;
  const filter = pendingEnquiryFilter;
  pendingEnquiryFilter = '';

  const statusSelect = document.getElementById('eq-filter-status');
  const actionSelect = document.getElementById('eq-filter-action');

  if (filter === 'new' && statusSelect) statusSelect.value = 'New Enquiry';
  if (actionSelect && ['overdue','today','missing','rezlynx','inactive'].includes(filter)) {
    actionSelect.value = filter;
  }
  filterEnquiries();
}

let enquiryListView = 'active';

function setEnquiryListView(view) {
  enquiryListView = view || 'active';
  filterEnquiries();
}

function enquiryViewCounts() {
  const confirmed = ['Confirmed Booking', 'Confirmed'];
  const lost = ['Lost Enquiry', 'Lost'];
  return {
    active: DB.enquiries.filter(item => !confirmed.includes(item.status) && !lost.includes(item.status)).length,
    confirmed: DB.enquiries.filter(item => confirmed.includes(item.status)).length,
    lost: DB.enquiries.filter(item => lost.includes(item.status)).length,
    all: DB.enquiries.length
  };
}

/* PHASE 1: superseded duplicate `renderEnquiries` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `filterEnquiries` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `viewEnquiry` removed; active declaration retained later in this file. */


function openFollowupOutcome(id) {
  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) return;

  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-lg font-bold">Log Contact Outcome</h2>
        <p class="text-sm text-gray-500">${esc(enquiry.name)}</p>
      </div>
      <button onclick="viewEnquiry('${id}')" class="p-1 hover:bg-gray-100 rounded">
        <i data-lucide="x" style="width:20px;height:20px"></i>
      </button>
    </div>

    <form onsubmit="saveFollowupOutcome(event,'${id}')" class="space-y-4">
      <div>
        <label class="text-xs font-medium text-gray-600">What happened? *</label>
        <select name="outcome" required class="w-full px-3 py-2 border rounded-lg text-sm mt-1">
          <option value="">Select outcome</option>
          <option value="call_connected">Called – spoke to customer</option>
          <option value="call_no_answer">Called – no answer / voicemail</option>
          <option value="email_sent">Follow-up email sent</option>
          <option value="viewing_booked">Viewing booked</option>
          <option value="quote_sent">Quote sent</option>
          <option value="customer_thinking">Customer is considering options</option>
          <option value="provisional">Provisional booking agreed</option>
          <option value="confirmed">Confirmed – deposit received</option>
          <option value="lost">Lost enquiry</option>
          <option value="custom">Other / custom follow-up</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Contact notes *</label>
        <textarea name="note" rows="3" required class="w-full px-3 py-2 border rounded-lg text-sm mt-1"
          placeholder="What was discussed, questions asked and what was agreed?"></textarea>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Custom next follow-up date</label>
        <input name="customDate" type="date" class="w-full px-3 py-2 border rounded-lg text-sm mt-1">
        <p class="text-[11px] text-gray-500 mt-1">Leave blank to use the automatic Windmill Farm sales process.</p>
      </div>

      <button type="submit" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">
        Save Outcome & Schedule Next Action
      </button>
    </form>
  </div>`);
}

async function saveFollowupOutcome(event, id) {
  event.preventDefault();

  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) return;

  const form = new FormData(event.target);
  const outcome = form.get('outcome');
  const note = String(form.get('note') || '').trim();
  const customDate = form.get('customDate') || '';

  if (outcome === 'lost') {
    openLostReasonForm(id, note);
    return;
  }

  const updates = {
    last_contact: todayStr,
    contact_attempts: Number(enquiry.contactAttempts || 0) + 1,
    first_contacted_at: enquiry.firstContactedAt || todayStr
  };

  let stageKey = 'custom';
  let status = enquiry.status;
  let nextAction = 'Follow up with this enquiry';

  if (outcome === 'call_no_answer') {
    stageKey = enquiry.followupStage === 'email_sent' ? 'second_call_no_answer' : 'call_no_answer';
    status = enquiry.status === 'New Enquiry' ? 'Contacted' : enquiry.status;
  } else if (outcome === 'email_sent') {
    stageKey = enquiry.followupStage === 'second_call_no_answer' ? 'seven_day_sent'
      : enquiry.followupStage === 'seven_day_sent' ? 'fourteen_day_sent'
      : enquiry.followupStage === 'fourteen_day_sent' ? 'thirty_day_sent'
      : 'email_sent';
    status = enquiry.status === 'New Enquiry' ? 'Contacted' : enquiry.status;
  } else if (outcome === 'call_connected') {
    stageKey = 'custom';
    status = 'Contacted';
    nextAction = 'Complete the agreed customer follow-up';
  } else if (outcome === 'viewing_booked') {
    stageKey = 'custom';
    status = 'Viewing Booked';
    nextAction = 'Follow up one day after the viewing';
    updates.next_followup = customDate || addDaysToDate(todayStr, 1);
  } else if (outcome === 'quote_sent') {
    stageKey = 'email_sent';
    status = 'Quote Sent';
  } else if (outcome === 'customer_thinking') {
    stageKey = 'seven_day_sent';
    status = 'Follow Up Later';
  } else if (outcome === 'provisional') {
    stageKey = 'custom';
    status = 'Provisional Booking';
    nextAction = 'Chase the deposit and confirmation';
    updates.next_followup = customDate || addDaysToDate(todayStr, 2);
  } else if (outcome === 'confirmed') {
    await openRezlynxReferenceForm(id, note);
    return;
  }

  const stage = SALES_FOLLOWUP_STAGES[stageKey] || SALES_FOLLOWUP_STAGES.custom;
  updates.status = status;
  updates.followup_stage = stageKey;
  updates.next_action = nextAction === 'Follow up with this enquiry' ? stage.action : nextAction;
  updates.next_followup = updates.next_followup || customDate || addDaysToDate(todayStr, stage.days);
  updates.communications = [
    ...(enquiry.comms || []),
    { date: todayStr, type: stage.label, note }
  ];

  const { error } = await supabaseClient.from('enquiries').update(updates).eq('id', id);
  if (error) {
    console.error('Could not save follow-up outcome:', error);
    toast('The follow-up could not be saved', 'error');
    return;
  }

  await loadEnquiriesFromSupabase();
  closeModal();
  renderSection();
  toast('Outcome saved and next action scheduled');
}

function openLostReasonForm(id, initialNote = '') {
  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) { toast('Enquiry could not be found','error'); return; }

  // Always use the CRM modal layer; never rely on browser prompt().
  openModal(`<div class="p-6 max-w-lg">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-red-600">LOST ENQUIRY</p>
        <h2 class="text-xl font-bold mt-1">Close ${esc(enquiry.name)} as lost</h2>
        <p class="text-sm text-gray-500 mt-1">A reason is required so Lost Business reporting stays useful.</p>
      </div>
      <button type="button" onclick="viewEnquiry('${id}')" class="p-2 rounded-lg hover:bg-gray-100"><i data-lucide="x"></i></button>
    </div>

    <form onsubmit="saveLostReason(event,'${id}')" class="space-y-4 mt-5">
      <div>
        <label class="text-xs font-medium text-gray-600">Why was the enquiry lost? *</label>
        <select name="lostReason" required onchange="lostReasonChanged(this)" class="w-full px-3 py-2.5 border rounded-lg text-sm mt-1">
          <option value="">Select a reason</option>
          ${LOST_REASONS.map(reason => `<option value="${esc(reason)}" ${enquiry.lostReason === reason ? 'selected' : ''}>${esc(reason)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="text-xs font-medium text-gray-600">Useful detail <span id="lost-notes-required" class="hidden text-red-600">*</span></label>
        <textarea name="lostNotes" rows="4" class="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="Competitor chosen, price objection, changed date, stopped responding, or anything useful for future sales.">${esc(initialNote || enquiry.lostNotes || '')}</textarea>
        <p class="text-[11px] text-gray-400 mt-1">If you select Other, detail is required.</p>
      </div>
      <div class="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-800">This closes the enquiry, clears its live next action/follow-up and records the reason in Lost Business reporting.</div>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" onclick="viewEnquiry('${id}')" class="py-2.5 bg-gray-100 rounded-lg font-medium">Cancel</button>
        <button id="save-lost-enquiry-btn" type="submit" class="py-2.5 bg-red-600 text-white rounded-lg font-medium">Confirm Lost Enquiry</button>
      </div>
    </form>
  </div>`);
  if(window.lucide)lucide.createIcons();
  const sel=document.querySelector('select[name="lostReason"]');if(sel)lostReasonChanged(sel);
}
function lostReasonChanged(select){
  const form=select?.form;if(!form)return;
  const notes=form.querySelector('[name="lostNotes"]');
  const required=String(select.value||'').toLowerCase()==='other';
  if(notes)notes.required=required;
  document.getElementById('lost-notes-required')?.classList.toggle('hidden',!required);
}

async function saveLostReason(event, id) {
  event.preventDefault();
  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) { toast('Enquiry could not be found','error'); return; }

  const form = new FormData(event.target);
  const lostReason = String(form.get('lostReason')||'').trim();
  const lostNotes = String(form.get('lostNotes') || '').trim();
  if(!lostReason){toast('Select why the enquiry was lost','error');return;}
  if(lostReason.toLowerCase()==='other'&&!lostNotes){toast('Add a little detail for Other','error');return;}

  const btn=document.getElementById('save-lost-enquiry-btn');
  if(btn){btn.disabled=true;btn.textContent='Closing enquiry…';}

  const communications = [
    ...(enquiry.comms || []),
    { date: new Date().toISOString(), type: 'Enquiry closed as lost', note: `${lostReason}${lostNotes ? ': ' + lostNotes : ''}` }
  ];

  const { error } = await supabaseClient.from('enquiries').update({
    status: 'Lost Enquiry',
    lost_reason: lostReason,
    lost_notes: lostNotes || null,
    next_followup: null,
    next_action: null,
    communications
  }).eq('id', id);

  if (error) {
    console.error('Could not save lost reason:', error);
    toast(`Lost enquiry was NOT saved${error.message?`: ${error.message}`:''}`, 'error');
    if(btn){btn.disabled=false;btn.textContent='Try Again';}
    return;
  }

  await loadEnquiriesFromSupabase();
  closeModal();
  renderSection();
  toast(`Lost enquiry recorded — ${lostReason}`);
}

function openRezlynxReferenceForm(id) {
  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) return;

  const destination=enquiry.eventType==='Wedding'?'Weddings':'Functions';

  openModal(`<div class="p-6 max-w-md">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">CONFIRM BOOKING</p>
        <h2 class="text-xl font-bold mt-1">${esc(enquiry.name)}</h2>
        <p class="text-sm text-gray-500 mt-1">Enter the Rezlynx BK reference to confirm and transfer this booking to <strong>${destination}</strong>.</p>
      </div>
      <button type="button" onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100"><i data-lucide="x"></i></button>
    </div>

    <form onsubmit="saveRezlynxReference(event,'${id}')" class="space-y-4 mt-5">
      

      <div>
        <label class="text-xs font-medium text-gray-600">Rezlynx BK Reference *</label>
        <input
          name="rezlynxReference"
          required
          autofocus
          autocomplete="off"
          value="${esc(enquiry.rezlynxReference || '')}"
          placeholder="BK123456"
          class="w-full px-3 py-3 border rounded-lg text-base mt-1 uppercase focus:ring-2 focus:ring-olive-400 focus:outline-none">
        <p class="text-xs text-gray-500 mt-1">Enter the BK number exactly as shown in Rezlynx. It must begin with BK.</p>
      </div>

      ${window.EnquiryProposal?(()=>{const c=EnquiryProposal.conversionSummary(enquiry);return `<div class="rounded-xl bg-olive-50 border border-olive-200 p-4"><p class="text-xs font-bold tracking-widest text-olive-700">CONVERSION PREVIEW → ${c.destination.toUpperCase()}</p><div class="grid grid-cols-2 gap-2 mt-3">${c.items.map(([l,v])=>`<div><small class="text-[10px] text-gray-500">${esc(l)}</small><strong class="block text-xs">${esc(v)}</strong></div>`).join('')}</div><p class="text-[11px] text-olive-800 mt-3">Existing enquiry details and the relevant pre-booking brief will transfer into the confirmed record. Nothing needs to be re-entered unnecessarily.</p></div>`})():`<div class="rounded-lg bg-olive-50 border border-olive-200 p-3 text-xs text-olive-800">${enquiry.eventType==='Wedding'?'<strong>Wedding:</strong> this will create or link the Wedding record and take you to Weddings.':'<strong>Function:</strong> this will create or link the Function record and take you to Functions.'}</div>`}

      <button id="confirm-booking-submit" type="submit" class="w-full py-3 bg-green-600 text-white rounded-lg font-semibold">
        Confirm Booking
      </button>
    </form>
  </div>`);
  if(window.lucide)lucide.createIcons();
}


async function repairConfirmedBookingTransfers(showToast=true){
  const confirmed=(DB.enquiries||[]).filter(item=>item.status==='Confirmed Booking'&&item.rezlynxReference);
  let weddingsFixed=0,functionsFixed=0,failed=0;

  for(const enquiry of confirmed){
    try{
      if(enquiry.eventType==='Wedding'){
        await ensureWeddingFromEnquiry(enquiry);
        weddingsFixed++;
      }else if(typeof ensureFunctionFromEnquiry==='function'){
        const fn=await ensureFunctionFromEnquiry(enquiry);
        if(fn)functionsFixed++; else failed++;
      }
    }catch(error){
      console.error('Confirmed booking repair failed:',enquiry,error);
      failed++;
    }
  }

  await Promise.allSettled([
    typeof loadWeddingsFromSupabase==='function'?loadWeddingsFromSupabase():Promise.resolve(),
    typeof loadFunctionsFromSupabase==='function'?loadFunctionsFromSupabase():Promise.resolve()
  ]);

  if(showToast){
    toast(`Booking transfer check complete: ${weddingsFixed} weddings, ${functionsFixed} functions${failed?`, ${failed} failed`:''}`);
  }
  if(currentSection==='functions'||currentSection==='weddings')renderSection();
  return {weddingsFixed,functionsFixed,failed};
}

async function routeConfirmedEnquiry(enquiry){
  if(!enquiry)return false;

  if(enquiry.eventType==='Wedding'){
    if(typeof ensureWeddingFromEnquiry!=='function'){
      toast('Wedding transfer is not available','error');
      return false;
    }

    await ensureWeddingFromEnquiry(enquiry);
    await loadWeddingsFromSupabase();

    const wedding=(DB.weddings||[]).find(item=>
      item.enquiryId===enquiry.id ||
      String(item.couple||'').toLowerCase()===String(enquiry.name||'').toLowerCase()
    );

    closeModal();
    navigate('weddings');

    if(wedding&&typeof openWeddingWorkspace==='function'){
      setTimeout(()=>openWeddingWorkspace(wedding.id),120);
    }

    toast('Booking confirmed and transferred to Weddings');
    return true;
  }

  if(typeof ensureFunctionFromEnquiry!=='function'){
    toast('Functions transfer is not available','error');
    return false;
  }

  const fn=await ensureFunctionFromEnquiry(enquiry);
  if(!fn)return false;

  closeModal();
  navigate('functions');

  if(typeof openFunctionWorkspace==='function'){
    setTimeout(()=>openFunctionWorkspace(fn.id),150);
  }

  toast('Booking confirmed and transferred to Functions');
  return true;
}

async function saveRezlynxReference(event, id) {
  event.preventDefault();

  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) return;

  const form = new FormData(event.target);
  const reference = normaliseRezlynxReference(form.get('rezlynxReference'));

  if (!validRezlynxReference(reference)) {
    toast('Enter a valid Rezlynx reference beginning BK', 'error');
    return;
  }

  const button=document.getElementById('confirm-booking-submit');
  if(button){button.disabled=true;button.textContent='Confirming…';}

  const communications = [
    ...(enquiry.comms || []),
    {
      date: todayStr,
      type: 'Booking confirmed',
      note: `Rezlynx ${reference}`
    }
  ];

  const { error } = await supabaseClient.from('enquiries').update({
    status: 'Confirmed Booking',
    rezlynx_reference: reference,
    next_followup: null,
    next_action: null,
    last_contact: todayStr,
    communications
  }).eq('id', id);

  if (error) {
    console.error('Could not save Rezlynx reference:', error);
    toast('The booking reference could not be saved', 'error');
    if(button){button.disabled=false;button.textContent='Confirm Booking';}
    return;
  }

  await loadEnquiriesFromSupabase();
  await loadSalesLeadsFromSupabase();
  const updated = DB.enquiries.find(item => item.id === id);

  if (updated) {
    updated.preferredDate = String(updated.preferredDate || '').trim() || null;
  }

  const routed=await routeConfirmedEnquiry(updated);
  if(!routed&&button){
    button.disabled=false;
    button.textContent='Try Transfer Again';
  }
}

async function updateEnqStatus(id, status) {
  if (!status) return;

  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) return;

  if (status === 'Lost Enquiry') {
    openLostReasonForm(id);
    return;
  }

  if (status === 'Confirmed Booking') {
    openRezlynxReferenceForm(id);
    return;
  }

  const updates = { status };

  if (isOpenSalesEnquiry({ ...enquiry, status }) && !enquiry.nextFollowup) {
    updates.followup_stage = 'custom';
    updates.next_action = 'Follow up with this enquiry';
    updates.next_followup = addDaysToDate(todayStr, 1);
  }

  const { error } = await supabaseClient.from('enquiries').update(updates).eq('id', id);
  if (error) {
    console.error('Could not update status:', error);
    toast('Status could not be updated', 'error');
    return;
  }

  await loadEnquiriesFromSupabase();
  viewEnquiry(id);
  toast('Status updated');
}

function addComm(id) {
  openModal(`<div class="p-6">
    <h3 class="font-bold text-lg mb-3">Add Enquiry Note</h3>
    <form onsubmit="saveComm(event,'${id}')">
      <textarea id="comm-note" rows="3" class="w-full px-3 py-2 border rounded-lg text-sm mb-3"
        placeholder="Enter the note..."></textarea>
      <div class="flex gap-2">
        <button type="submit" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">Save</button>
        <button type="button" onclick="viewEnquiry('${id}')" class="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
      </div>
    </form>
  </div>`);
}

async function saveComm(event, id) {
  event.preventDefault();

  const note = String(document.getElementById('comm-note')?.value || '').trim();
  if (!note) {
    toast('Please enter a note', 'error');
    return;
  }

  const enquiry = DB.enquiries.find(item => item.id === id);
  if (!enquiry) return;

  const communications = [
    ...(enquiry.comms || []),
    { date: todayStr, type: 'Note', note }
  ];

  const { error } = await supabaseClient.from('enquiries').update({
    communications
  }).eq('id', id);

  if (error) {
    console.error('Could not save note:', error);
    toast('The note could not be saved', 'error');
    return;
  }

  await loadEnquiriesFromSupabase();
  viewEnquiry(id);
  toast('Note added');
}

function openEnquiryForm(id) {
  const enquiry = id ? DB.enquiries.find(item => item.id === id) : null;
  const sources = ['Website','Instagram','Facebook','Google','Bridebook','Wedding Fayre','Referral','Phone','Walk-in','Other'];
  const types = ['Wedding','Birthday Party','Engagement Party','Anniversary','Baby Shower','Christening','Wake','Corporate Meeting','Conference','Christmas Party','Other'];
  const defaultFollowup = enquiry?.nextFollowup || addDaysToDate(todayStr, 1);

  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-lg font-bold">${id ? 'Edit' : 'New'} Enquiry</h2>
        ${!id ? '<p class="text-xs text-gray-500 mt-1">The first call will automatically be scheduled for tomorrow.</p>' : ''}
      </div>
      <button onclick="closeModal()" class="p-1 hover:bg-gray-100 rounded">
        <i data-lucide="x" style="width:20px;height:20px"></i>
      </button>
    </div>

    <form onsubmit="saveEnquiryForm(event,'${id || ''}')" class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label class="text-xs font-medium text-gray-600">Client Name *</label><input name="name" required value="${esc(enquiry?.name || '')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Event Type</label><select name="eventType" class="w-full px-3 py-2 border rounded-lg text-sm">${types.map(type => `<option ${enquiry?.eventType === type ? 'selected' : ''}>${type}</option>`).join('')}</select></div>
        <div><label class="text-xs font-medium text-gray-600">Email</label><input name="email" type="email" value="${esc(enquiry?.email || '')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Phone</label><input name="phone" value="${esc(enquiry?.phone || '')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Preferred Date</label><input name="preferredDate" type="date" value="${enquiry?.preferredDate || ''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Guests</label><input name="guests" type="number" value="${enquiry?.guests || ''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Budget (£)</label><input name="budget" type="number" value="${enquiry?.budget || ''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Lead Source</label><select name="source" class="w-full px-3 py-2 border rounded-lg text-sm">${sources.map(source => `<option ${enquiry?.source === source ? 'selected' : ''}>${source}</option>`).join('')}</select></div>
        <div><label class="text-xs font-medium text-gray-600">Status</label><select name="status" onchange="enquiryFormStatusChanged(this,'${id || ''}')" class="w-full px-3 py-2 border rounded-lg text-sm">${ENQUIRY_STATUSES.map(status => `<option ${enquiry?.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select><p class="text-[11px] text-gray-400 mt-1">Lost Enquiry opens the required reason workflow.</p></div>
        <div><label class="text-xs font-medium text-gray-600">Priority</label><select name="priority" class="w-full px-3 py-2 border rounded-lg text-sm"><option ${enquiry?.priority === 'Hot' ? 'selected' : ''}>Hot</option><option ${enquiry?.priority === 'Warm' || !enquiry ? 'selected' : ''}>Warm</option><option ${enquiry?.priority === 'Cold' ? 'selected' : ''}>Cold</option></select></div>
        <div><label class="text-xs font-medium text-gray-600">Probability %</label><input name="probability" type="number" min="0" max="100" value="${enquiry?.probability || 50}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Coordinator</label><select name="staff" class="w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(enquiry?.staff || '')}</select></div>
        <div><label class="text-xs font-medium text-gray-600">Estimated Value (£)</label><input name="value" type="number" value="${enquiry?.value || ''}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Next Follow-up</label><input name="nextFollowup" type="date" value="${defaultFollowup}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="text-xs font-medium text-gray-600">Next Action</label><input name="nextAction" value="${esc(enquiry?.nextAction || 'Call the new enquiry')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        
      </div>

      <div><label class="text-xs font-medium text-gray-600">Notes</label><textarea name="notes" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(enquiry?.notes || '')}</textarea></div>

      <button type="submit" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700">Save Enquiry</button>
    </form>
  </div>`);
}


function enquiryFormStatusChanged(select,id){
  if(select.value!=='Lost Enquiry')return;
  const enquiry=id?DB.enquiries.find(item=>item.id===id):null;
  if(!enquiry){
    select.value='New Enquiry';
    toast('Save the enquiry first, then use Lost Enquiry so the reason is recorded','error');
    return;
  }
  select.value=enquiry.status||'New Enquiry';
  openLostReasonForm(id);
}
async function saveEnquiryForm(event, id) {
  event.preventDefault();

  const form = new FormData(event.target);
  const existing = id ? DB.enquiries.find(item => item.id === id) : null;
  const requestedStatus = form.get('status') || 'New Enquiry';
  const needsConfirmPopup = requestedStatus === 'Confirmed Booking' && existing?.status !== 'Confirmed Booking';
  const status = needsConfirmPopup ? (existing?.status || 'New Enquiry') : requestedStatus;
  const reference = normaliseRezlynxReference(existing?.rezlynxReference || '');

  if (requestedStatus === 'Lost Enquiry' && !existing?.lostReason) {
    toast('Use the Lost Enquiry action so a lost reason is recorded', 'error');
    return;
  }

  if (!id && window.EnquiryQA) {
    const matches=EnquiryQA.formDuplicates(form,'');
    if(matches.length){
      const first=matches[0];
      toast(`Possible duplicate: ${first.name} already exists (${first.status})`, 'error');
      if(confirm(`A possible duplicate enquiry already exists for ${first.name}. Open the existing enquiry instead?`)){closeModal();viewEnquiry(first.id);}
      return;
    }
  }

  const automaticFirstFollowup = addDaysToDate(todayStr, 1);

  const record = {
    customer_name: form.get('name'),
    email: form.get('email') || null,
    phone: form.get('phone') || null,
    event_type: form.get('eventType') || null,
    enquiry_date: existing?.enquiryDate || todayStr,
    preferred_date: form.get('preferredDate') || null,
    guests: Number(form.get('guests')) || 0,
    budget: Number(form.get('budget')) || 0,
    package: existing?.package || '',
    source: form.get('source') || null,
    staff: form.get('staff') || null,
    status,
    priority: form.get('priority') || 'Warm',
    probability: Number(form.get('probability')) || 50,
    value: Number(form.get('value')) || 0,
    notes: form.get('notes') || null,
    last_contact: existing?.lastContact || null,
    next_followup: ['Confirmed Booking','Lost Enquiry'].includes(status)
      ? null
      : form.get('nextFollowup') || existing?.nextFollowup || automaticFirstFollowup,
    next_action: ['Confirmed Booking','Lost Enquiry'].includes(status)
      ? null
      : form.get('nextAction') || existing?.nextAction || 'Call the new enquiry',
    followup_stage: existing?.followupStage || 'new',
    contact_attempts: Number(existing?.contactAttempts || 0),
    first_contacted_at: existing?.firstContactedAt || null,
    lost_reason: existing?.lostReason || null,
    lost_notes: existing?.lostNotes || null,
    rezlynx_reference: existing?.rezlynxReference || null,
    communications: existing?.comms || []
  };

  const query = id
    ? supabaseClient.from('enquiries').update(record).eq('id', id).select().single()
    : supabaseClient.from('enquiries').insert(record).select().single();

  const result = await query;

  if (result.error) {
    console.error('Failed to save enquiry:', result.error);
    toast('Enquiry could not be saved', 'error');
    return;
  }

  closeModal();
  await loadEnquiriesFromSupabase();
  await loadSalesLeadsFromSupabase();

  const saved = DB.enquiries.find(item => item.id === result.data.id);

  if (needsConfirmPopup && saved) {
    // The form changes have been saved. Confirmation is deliberately completed
    // through the same small BK popup used everywhere else.
    openRezlynxReferenceForm(saved.id);
    return;
  }

  if (saved?.status === 'Confirmed Booking') {
    await routeConfirmedEnquiry(saved);
    return;
  }

  renderSection();
  toast(id ? 'Enquiry updated' : 'Enquiry created – first call scheduled for tomorrow');
}


// ============================================================================
// WINDMILL FARM — ENQUIRIES CENTRE V2
// Premium shared sales workspace. This deliberately overrides the legacy
// enquiry list and detail renderer while preserving all existing Supabase,
// follow-up, outcome, status, form and conversion logic above.
// ============================================================================

window.EnquiriesCentre = window.EnquiriesCentre || {
  view:'active',
  quickView:'all',
  layout:'cards',
  currentId:'',
  workspaceTab:'overview'
};

if(window.EnquiryQA)EnquiryQA.restoreUI();

EnquiriesCentre.openStatuses=['New Enquiry','Contacted','Brochure Sent','Viewing Booked','Viewing Completed','Quote Sent','Provisional Booking','Deposit Required','Follow Up Later'];
EnquiriesCentre.confirmedStatuses=['Confirmed Booking','Confirmed'];
EnquiriesCentre.lostStatuses=['Lost Enquiry','Lost'];

EnquiriesCentre.isOpen=function(enquiry){
  return !EnquiriesCentre.confirmedStatuses.includes(enquiry.status)&&!EnquiriesCentre.lostStatuses.includes(enquiry.status);
};

EnquiriesCentre.ownerName=function(){
  return String(window.currentUserProfile?.display_name||'').trim();
};

EnquiriesCentre.today=function(){
  return typeof todayStr!=='undefined'?todayStr:new Date().toISOString().slice(0,10);
};

EnquiriesCentre.daysUntil=function(value){
  if(!value)return null;
  return Math.ceil((new Date(value+'T12:00:00')-new Date(EnquiriesCentre.today()+'T12:00:00'))/86400000);
};

EnquiriesCentre.daysSinceContact=function(enquiry){
  const value=enquiry.lastContact||enquiry.enquiryDate;
  return value?Math.max(0,daysSince(value)):null;
};

EnquiriesCentre.hasViewingThisWeek=function(enquiry){
  if(enquiry.status!=='Viewing Booked')return false;
  const days=EnquiriesCentre.daysUntil(enquiry.nextFollowup||enquiry.preferredDate);
  return days!==null&&days>=0&&days<=7;
};

EnquiriesCentre.needsChasing=function(enquiry){
  if(!EnquiriesCentre.isOpen(enquiry))return false;
  const inactive=EnquiriesCentre.daysSinceContact(enquiry);
  const workflowChase=window.EnquiryActivity?.chaseReason?EnquiryActivity.chaseReason(enquiry).length>0:false;
  return workflowChase||isOverdue(enquiry.nextFollowup)||isDueToday(enquiry.nextFollowup)||!enquiry.nextFollowup||(inactive!==null&&inactive>=5);
};

EnquiriesCentre.metrics=function(){
  const all=DB.enquiries||[];
  const active=all.filter(EnquiriesCentre.isOpen);
  const confirmed=all.filter(item=>EnquiriesCentre.confirmedStatuses.includes(item.status));
  const lost=all.filter(item=>EnquiriesCentre.lostStatuses.includes(item.status));
  const newToday=all.filter(item=>item.enquiryDate===EnquiriesCentre.today()).length;
  const chasing=active.filter(EnquiriesCentre.needsChasing).length;
  const viewings=active.filter(EnquiriesCentre.hasViewingThisWeek).length;
  const activeValue=active.reduce((sum,item)=>sum+Number(item.value||0),0);
  const decided=confirmed.length+lost.length;
  const conversion=decided?Math.round(confirmed.length/decided*100):0;
  const dueToday=active.filter(item=>isDueToday(item.nextFollowup)||isOverdue(item.nextFollowup)).length;
  return {all,active,confirmed,lost,newToday,chasing,viewings,activeValue,conversion,dueToday};
};

EnquiriesCentre.setView=function(view){
  EnquiriesCentre.view=view;
  enquiryListView=view;
  if(window.AppRouter)AppRouter.commit(`/enquiries/${encodeURIComponent(view)}`);
  EnquiriesCentre.quickView='all';
  if(window.EnquiryQA)EnquiryQA.saveUI();
  const main=document.getElementById('main-content');
  if(main){
    main.innerHTML=renderEnquiries();
    if(window.lucide)lucide.createIcons();
  }else filterEnquiries();
};

EnquiriesCentre.setQuickView=function(view){
  EnquiriesCentre.quickView=view;
  if(window.EnquiryQA)EnquiryQA.saveUI();
  filterEnquiries();
};

EnquiriesCentre.setLayout=function(layout){
  EnquiriesCentre.layout=layout;
  if(window.EnquiryQA)EnquiryQA.saveUI();
  filterEnquiries();
};

EnquiriesCentre.startCallQueue=function(){
  const rows=(DB.enquiries||[])
    .filter(EnquiriesCentre.isOpen)
    .filter(item=>isOverdue(item.nextFollowup)||isDueToday(item.nextFollowup)||!item.nextFollowup)
    .sort((a,b)=>{
      const aScore=isOverdue(a.nextFollowup)?0:isDueToday(a.nextFollowup)?1:2;
      const bScore=isOverdue(b.nextFollowup)?0:isDueToday(b.nextFollowup)?1:2;
      return aScore-bScore||String(a.nextFollowup||'9999').localeCompare(String(b.nextFollowup||'9999'));
    });
  if(!rows.length)return toast('There are no overdue or due-today calls','error');
  viewEnquiry(rows[0].id);
};

EnquiriesCentre.resizeWorkspace=function(){
  const overlay=document.getElementById('modal-overlay');
  const content=document.getElementById('modal-content');
  if(!overlay||!content)return;
  overlay.classList.remove('p-4');
  overlay.classList.add('p-2','lg:p-5');
  content.className='bg-white rounded-3xl shadow-2xl w-[96vw] max-w-[1550px] h-[92vh] max-h-[92vh] overflow-hidden';
};

EnquiriesCentre.closeWorkspace=function(){
  const overlay=document.getElementById('modal-overlay');
  if(overlay){
    overlay.classList.remove('p-2','lg:p-5');
    overlay.classList.add('p-4');
  }
  closeModal();
};

EnquiriesCentre.setWorkspaceTab=function(tab,id){
  EnquiriesCentre.workspaceTab=tab;
  viewEnquiry(id);
};

EnquiriesCentre.quickFilterButtons=function(){
  const metrics=EnquiriesCentre.metrics();
  return [
    ['all','All Active',metrics.active.length,'layers-3'],
    ['mine','Assigned to Me',metrics.active.filter(item=>String(item.staff||'').toLowerCase()===EnquiriesCentre.ownerName().toLowerCase()).length,'user'],
    ['chase','Need Chasing',metrics.chasing,'phone-call'],
    ['today','Due Today',metrics.dueToday,'alarm-clock'],
    ['new','New',metrics.active.filter(item=>item.status==='New Enquiry').length,'sparkles'],
    ['viewings','Viewings',metrics.viewings,'calendar-check-2'],
    ['high','High Value',metrics.active.filter(item=>Number(item.value||0)>=3000).length,'pound-sterling'],
    ['deposit','Need Deposit',metrics.active.filter(item=>item.status==='Deposit Required').length,'wallet-cards'],
    ['risk','At Risk',window.EnquirySalesCommand?EnquirySalesCommand.stats().risk.length:0,'shield-alert'],
    ['hot','Hot Opportunities',window.EnquirySalesCommand?EnquirySalesCommand.stats().hot.length:0,'flame']
  ];
};

function renderEnquiries(){
  const metrics=EnquiriesCentre.metrics();
  setTimeout(()=>{filterEnquiries();applyPendingEnquiryFilter();},0);

  return `<div class="enquiries-centre-v2 space-y-4">
    <section class="eqv2-hero">
      <div>
        <p class="eqv2-eyebrow">WINDMILL FARM SALES</p>
        <h2>Enquiries Centre</h2>
        <p>One shared view of every opportunity, next action and potential booking value.</p>
      </div>
      <div class="eqv2-hero-actions">
        <button onclick="EnquiriesCentre.startCallQueue()" class="eqv2-start-calls"><i data-lucide="phone-forwarded"></i><span><small>${metrics.dueToday} calls due</small>Start Call Queue</span></button>
        <button onclick="openEnquiryForm()" class="eqv2-new"><i data-lucide="plus"></i>New Enquiry</button>
      </div>
    </section>

    ${window.EnquirySalesCommand?(()=>{
      const sales=EnquirySalesCommand.stats();
      const queue=EnquirySalesCommand.priorityQueue(6);
      return `<section class="eqp1-command">
        <div class="eqp1-command-head"><div><p class="eqv2-eyebrow">SALES COMMAND CENTRE</p><h3>${sales.urgent.length+sales.risk.length?sales.urgent.length+sales.risk.length+' enquiries need attention':'Sales inbox clear'}</h3><p>${sales.noAction.length?`${sales.noAction.length} live enquir${sales.noAction.length===1?'y has':'ies have'} no complete next action.`:'Every live enquiry has a future action recorded.'}</p></div>
        <div class="eqp1-command-stats"><button onclick="EnquiriesCentre.setQuickView('today')"><strong>${sales.overdue.length+sales.dueToday.length}</strong><span>Due / overdue</span></button><button onclick="EnquiriesCentre.setQuickView('risk')"><strong>${sales.risk.length}</strong><span>At risk</span></button><button onclick="EnquiriesCentre.setQuickView('hot')"><strong>${sales.hot.length}</strong><span>Hot</span></button><div><strong>£${sales.weighted.toLocaleString()}</strong><span>Weighted pipeline</span></div></div></div>
        <div class="eqp1-priority">${queue.length?queue.map(item=>{const h=EnquirySalesCommand.health(item);return `<article onclick="viewEnquiry('${item.id}')"><span class="eqp1-health ${h.className}">${h.label}</span><div><strong>${esc(item.name)}</strong><p>${esc(item.eventType||'Event')} · ${esc(item.status)} · £${Number(item.value||0).toLocaleString()}</p><small>${esc(h.reason)}</small></div><button onclick="event.stopPropagation();openFollowupOutcome('${item.id}')">Complete Action</button></article>`}).join(''):`<div class="eqp1-clear"><i data-lucide="badge-check"></i><strong>Nothing urgent right now.</strong><span>Keep every live enquiry moving by always scheduling the next action.</span></div>`}</div>
      </section>`;
    })():''}

    ${window.EnquiryQA?EnquiryQA.banner():''}

    <section class="eqv2-kpis">
      ${[
        ['New Today',metrics.newToday,'sparkles','New enquiries received today'],
        ['Need Chasing',metrics.chasing,'phone-call','Overdue, due or inactive'],
        ['Viewings This Week',metrics.viewings,'calendar-check-2','Booked viewings in next 7 days'],
        ['Active Pipeline',`£${metrics.activeValue.toLocaleString()}`,'circle-pound-sterling',`${metrics.active.length} open opportunities`],
        ['Conversion',`${metrics.conversion}%`,'trending-up',`${metrics.confirmed.length} confirmed · ${metrics.lost.length} lost`]
      ].map(([label,value,icon,detail])=>`<article><span><i data-lucide="${icon}"></i></span><div><p>${label}</p><strong>${value}</strong><small>${detail}</small></div></article>`).join('')}
    </section>

    <section class="eqv2-controls">
      <div class="eqv2-search">
        <i data-lucide="search"></i>
        <input id="eq-search" type="text" placeholder="Search by name, date, email, phone, owner or BK reference…" oninput="filterEnquiries()">
      </div>
      <select id="eq-filter-status" onchange="filterEnquiries()"><option value="">All statuses</option>${ENQUIRY_STATUSES.map(status=>`<option>${status}</option>`).join('')}</select>
      <select id="eq-filter-action" onchange="filterEnquiries()">
        <option value="">All actions</option>
        <option value="overdue">Overdue follow-ups</option>
        <option value="today">Due today</option>
        <option value="missing">No follow-up date</option>
        <option value="new">Not contacted</option>
        <option value="rezlynx">Rezlynx reference required</option>
        <option value="inactive">No activity in 5 days</option>
      </select>
      <select id="eq-sort" onchange="filterEnquiries()">
        <option value="recommended">Recommended order</option>
        <option value="value">Highest value</option>
        <option value="newest">Newest first</option>
        <option value="event-date">Event date</option>
        <option value="followup">Next follow-up</option>
      </select>
    </section>

    <section class="eqv2-main">
      <aside class="eqv2-sidebar">
        <div class="eqv2-side-heading"><p>SAVED VIEWS</p><span>${metrics.active.length} active</span></div>
        ${EnquiriesCentre.quickFilterButtons().map(([id,label,count,icon])=>`<button onclick="EnquiriesCentre.setQuickView('${id}')" class="${EnquiriesCentre.quickView===id?'active':''}"><i data-lucide="${icon}"></i><span>${label}</span><em>${count}</em></button>`).join('')}
        <div class="eqv2-side-divider"></div>
        <button onclick="EnquiriesCentre.setView('confirmed')" class="${EnquiriesCentre.view==='confirmed'?'active':''}"><i data-lucide="badge-check"></i><span>Confirmed</span><em>${metrics.confirmed.length}</em></button>
        <button onclick="EnquiriesCentre.setView('lost')" class="${EnquiriesCentre.view==='lost'?'active':''}"><i data-lucide="archive-x"></i><span>Lost</span><em>${metrics.lost.length}</em></button>
        <button onclick="EnquiriesCentre.setView('all')" class="${EnquiriesCentre.view==='all'?'active':''}"><i data-lucide="database"></i><span>Everything</span><em>${metrics.all.length}</em></button>
      </aside>

      <main class="eqv2-list-panel">
        <div class="eqv2-list-heading">
          <div><p class="eqv2-eyebrow olive">SALES WORKSPACE</p><h3 id="eq-view-title">Active enquiries</h3><p id="eq-view-subtitle">Prioritised by follow-up urgency and commercial value.</p></div>
          <div class="eqv2-layout-toggle">
            <button onclick="EnquiriesCentre.setLayout('cards')" class="${EnquiriesCentre.layout==='cards'?'active':''}"><i data-lucide="layout-grid"></i></button>
            <button onclick="EnquiriesCentre.setLayout('compact')" class="${EnquiriesCentre.layout==='compact'?'active':''}"><i data-lucide="list"></i></button>
          </div>
        </div>
        <div id="eq-alerts"></div>
        <div id="eq-result-count" class="eqv2-result-count"></div>
        <div id="eq-list" class="${EnquiriesCentre.layout==='cards'?'eqv2-card-grid':'eqv2-compact-list'}"></div>
      </main>
    </section>
  </div>`;
}

function filterEnquiries(){
  const search=(document.getElementById('eq-search')?.value||'').trim().toLowerCase();
  const status=document.getElementById('eq-filter-status')?.value||'';
  const action=document.getElementById('eq-filter-action')?.value||'';
  const sort=document.getElementById('eq-sort')?.value||'recommended';
  const ownerName=EnquiriesCentre.ownerName().toLowerCase();

  let list=(DB.enquiries||[]).filter(enquiry=>{
    const isOpen=EnquiriesCentre.isOpen(enquiry);
    const isConfirmed=EnquiriesCentre.confirmedStatuses.includes(enquiry.status);
    const isLost=EnquiriesCentre.lostStatuses.includes(enquiry.status);

    if(EnquiriesCentre.view==='active'&&!isOpen)return false;
    if(EnquiriesCentre.view==='confirmed'&&!isConfirmed)return false;
    if(EnquiriesCentre.view==='lost'&&!isLost)return false;

    const searchable=[enquiry.name,enquiry.email,enquiry.phone,enquiry.preferredDate,enquiry.eventType,enquiry.staff,enquiry.rezlynxReference,enquiry.notes].join(' ').toLowerCase();
    if(search&&!searchable.includes(search))return false;
    if(status&&enquiry.status!==status)return false;

    if(action==='overdue'&&!(isOpen&&isOverdue(enquiry.nextFollowup)))return false;
    if(action==='today'&&!(isOpen&&isDueToday(enquiry.nextFollowup)))return false;
    if(action==='missing'&&!(isOpen&&!enquiry.nextFollowup))return false;
    if(action==='new'&&!(enquiry.status==='New Enquiry'&&!enquiry.firstContactedAt))return false;
    if(action==='rezlynx'&&!enquiryNeedsRezlynx(enquiry))return false;
    if(action==='inactive'&&!(isOpen&&EnquiriesCentre.daysSinceContact(enquiry)>=5))return false;

    if(EnquiriesCentre.view==='active'){
      if(EnquiriesCentre.quickView==='mine'&&String(enquiry.staff||'').toLowerCase()!==ownerName)return false;
      if(EnquiriesCentre.quickView==='chase'&&!EnquiriesCentre.needsChasing(enquiry))return false;
      if(EnquiriesCentre.quickView==='today'&&!(isOverdue(enquiry.nextFollowup)||isDueToday(enquiry.nextFollowup)))return false;
      if(EnquiriesCentre.quickView==='new'&&enquiry.status!=='New Enquiry')return false;
      if(EnquiriesCentre.quickView==='viewings'&&!EnquiriesCentre.hasViewingThisWeek(enquiry))return false;
      if(EnquiriesCentre.quickView==='high'&&Number(enquiry.value||0)<3000)return false;
      if(EnquiriesCentre.quickView==='deposit'&&enquiry.status!=='Deposit Required')return false;
      if(EnquiriesCentre.quickView==='risk'&&(!window.EnquirySalesCommand||EnquirySalesCommand.health(enquiry).key!=='risk'))return false;
      if(EnquiriesCentre.quickView==='hot'&&(!window.EnquirySalesCommand||EnquirySalesCommand.health(enquiry).key!=='hot'))return false;
    }
    return true;
  });

  const urgencyScore=enquiry=>{
    if(!EnquiriesCentre.isOpen(enquiry))return 9;
    if(isOverdue(enquiry.nextFollowup))return 0;
    if(isDueToday(enquiry.nextFollowup))return 1;
    if(!enquiry.nextFollowup)return 2;
    if((enquiry.priority||'').toLowerCase()==='hot')return 3;
    if(EnquiriesCentre.daysSinceContact(enquiry)>=5)return 4;
    return 5;
  };
  const dateValue=(value,fallback=Number.MAX_SAFE_INTEGER)=>{
    if(!value)return fallback;
    const parsed=new Date(value+'T12:00:00').getTime();
    return Number.isNaN(parsed)?fallback:parsed;
  };

  list.sort((a,b)=>{
    if(sort==='value')return Number(b.value||0)-Number(a.value||0);
    if(sort==='newest')return dateValue(b.enquiryDate,0)-dateValue(a.enquiryDate,0);
    if(sort==='event-date')return dateValue(a.preferredDate)-dateValue(b.preferredDate);
    if(sort==='followup')return dateValue(a.nextFollowup)-dateValue(b.nextFollowup);
    if(window.EnquirySalesCommand)return EnquirySalesCommand.health(a).score-EnquirySalesCommand.health(b).score||urgencyScore(a)-urgencyScore(b)||Number(b.value||0)-Number(a.value||0)||dateValue(a.nextFollowup)-dateValue(b.nextFollowup);
    return urgencyScore(a)-urgencyScore(b)||Number(b.value||0)-Number(a.value||0)||dateValue(a.nextFollowup)-dateValue(b.nextFollowup);
  });

  const alerts=[];
  const overdue=(DB.enquiries||[]).filter(item=>EnquiriesCentre.isOpen(item)&&isOverdue(item.nextFollowup));
  const missing=(DB.enquiries||[]).filter(item=>EnquiriesCentre.isOpen(item)&&!item.nextFollowup);
  if(overdue.length)alerts.push(`<button onclick="EnquiriesCentre.setQuickView('chase')" class="eqv2-alert red"><i data-lucide="alert-triangle"></i><span><strong>${overdue.length} overdue follow-up${overdue.length===1?'':'s'}</strong><small>These enquiries should be contacted before lower-priority work.</small></span></button>`);
  if(missing.length)alerts.push(`<button onclick="document.getElementById('eq-filter-action').value='missing';filterEnquiries()" class="eqv2-alert amber"><i data-lucide="calendar-x-2"></i><span><strong>${missing.length} open enquir${missing.length===1?'y has':'ies have'} no next action date</strong><small>Every active enquiry should have a clear next step.</small></span></button>`);

  const alertsEl=document.getElementById('eq-alerts');
  if(alertsEl)alertsEl.innerHTML=alerts.length?`<div class="eqv2-alerts">${alerts.join('')}</div>`:'';

  const titleMap={active:'Active enquiries',confirmed:'Confirmed bookings',lost:'Lost enquiries',all:'All enquiries'};
  const quickMap={mine:'Assigned to me',chase:'Need chasing',today:'Due today',new:'New enquiries',viewings:'Viewings this week',high:'High-value enquiries',deposit:'Deposits required',risk:'At-risk enquiries',hot:'Hot opportunities'};
  const title=document.getElementById('eq-view-title');
  if(title)title.textContent=EnquiriesCentre.view==='active'&&EnquiriesCentre.quickView!=='all'?quickMap[EnquiriesCentre.quickView]:titleMap[EnquiriesCentre.view];
  const count=document.getElementById('eq-result-count');
  if(count)count.textContent=`${list.length} enquir${list.length===1?'y':'ies'} shown`;

  const host=document.getElementById('eq-list');
  if(!host)return;
  host.className=EnquiriesCentre.layout==='cards'?'eqv2-card-grid':'eqv2-compact-list';

  if(!list.length){host.innerHTML=window.EnquiryQA?EnquiryQA.emptyState(EnquiriesCentre.view,EnquiriesCentre.quickView):'<div class="eqv2-empty">No enquiries found.</div>';if(window.lucide)lucide.createIcons();return;}
  host.innerHTML=list.map(enquiry=>{
    const isOpen=EnquiriesCentre.isOpen(enquiry);
    const isConfirmed=EnquiriesCentre.confirmedStatuses.includes(enquiry.status);
    const isLost=EnquiriesCentre.lostStatuses.includes(enquiry.status);
    const stage=followupStageDetails(enquiry);
    const daysSinceLast=EnquiriesCentre.daysSinceContact(enquiry);
    const isLate=isOpen&&isOverdue(enquiry.nextFollowup);
    const dueToday=isOpen&&isDueToday(enquiry.nextFollowup);
    const noDate=isOpen&&!enquiry.nextFollowup;
    const eventDays=EnquiriesCentre.daysUntil(enquiry.preferredDate);
    const nextLabel=isLate?`Overdue · ${formatSalesDate(enquiry.nextFollowup)}`:dueToday?'Due today':noDate?'No date set':enquiry.nextFollowup?`Due ${formatSalesDate(enquiry.nextFollowup)}`:'Closed';
    const icon=/wedding/i.test(enquiry.eventType||'')?'heart':/meeting|conference|corporate/i.test(enquiry.eventType||'')?'briefcase-business':/wake/i.test(enquiry.eventType||'')?'flower-2':'party-popper';
    const riskClass=isLost?'lost':isConfirmed?'won':isLate?'overdue':dueToday?'due':'normal';

    if(EnquiriesCentre.layout==='compact'){
      return `<article class="eqv2-compact ${riskClass}">
        <div class="eqv2-event-icon"><i data-lucide="${icon}"></i></div>
        <div class="eqv2-compact-main"><div><strong>${esc(enquiry.name)}</strong><span class="badge ${statusColor(enquiry.status)}">${esc(enquiry.status)}</span></div><p>${esc(enquiry.eventType||'Event')} · ${enquiry.preferredDate?formatSalesDate(enquiry.preferredDate):'Date TBC'} · ${Number(enquiry.guests||0)} guests</p></div>
        <div class="eqv2-compact-value"><small>Potential</small><strong>£${Number(enquiry.value||0).toLocaleString()}</strong></div>
        <div class="eqv2-compact-action"><small>Next action</small><strong>${esc(enquiry.nextAction||stage.action)}</strong><span>${nextLabel}</span></div>
        <div class="eqv2-compact-owner"><small>Owner</small><strong>${esc(enquiry.staff||'Unassigned')}</strong></div>
        <button onclick="viewEnquiry('${enquiry.id}')" class="eqv2-open-btn">Open</button>
      </article>`;
    }

    return `<article class="eqv2-enquiry-card ${riskClass}">
      <div class="eqv2-card-top">
        <div class="eqv2-event-icon"><i data-lucide="${icon}"></i></div>
        <div class="eqv2-card-title"><div><h4>${esc(enquiry.name)}</h4><span class="badge ${statusColor(enquiry.status)}">${esc(enquiry.status)}</span></div><p>${esc(enquiry.eventType||'Event')} · ${enquiry.preferredDate?formatSalesDate(enquiry.preferredDate):'Date TBC'}</p></div>
        ${isOpen?`<div class="flex flex-col items-end gap-1"><span class="badge ${priorityBadge(enquiry.priority||'Warm')}">${esc(enquiry.priority||'Warm')}</span>${window.EnquirySalesCommand?(()=>{const h=EnquirySalesCommand.health(enquiry);return `<span class="eqp1-health ${h.className}" title="${esc(h.reason)}">${esc(h.label)}</span>`})():''}</div>`:''}
      </div>

      <div class="eqv2-card-stats">
        <div><small>Guests</small><strong>${Number(enquiry.guests||0)}</strong></div>
        <div><small>Potential</small><strong>£${Number(enquiry.value||0).toLocaleString()}</strong></div>
        <div><small>Probability</small><strong>${Number(enquiry.probability||0)}%</strong></div>
        <div><small>Owner</small><strong>${esc(enquiry.staff||'Unassigned')}</strong></div>
      </div>

      ${isOpen?`<div class="eqv2-next-action ${isLate?'red':dueToday||noDate?'amber':'olive'}">
        <div><small>NEXT ACTION</small><strong>${esc(enquiry.nextAction||stage.action)}</strong><p>${esc(stage.guidance)}</p></div>
        <span>${nextLabel}</span>
      </div>`:`<div class="eqv2-next-action ${isConfirmed?'green':'grey'}"><div><small>${isConfirmed?'BOOKING CONFIRMED':'ENQUIRY CLOSED'}</small><strong>${isConfirmed?(enquiry.rezlynxReference||'Transfer pending'):(enquiry.lostReason||'Lost enquiry')}</strong></div></div>`}

      <div class="eqv2-card-signals">
        <span><i data-lucide="clock-3"></i>${daysSinceLast===null?'No contact logged':daysSinceLast===0?'Contacted today':`${daysSinceLast} days since contact`}</span>
        <span><i data-lucide="calendar-days"></i>${eventDays===null?'Date TBC':eventDays<0?'Event date passed':eventDays===0?'Event today':`${eventDays} days to event`}</span>
      </div>

      ${isOpen&&window.EnquiryActivity?.quickButtons?EnquiryActivity.quickButtons(enquiry):''}
      <div class="eqv2-card-actions">
        ${isOpen?`<button onclick="openFollowupOutcome('${enquiry.id}')" class="primary"><i data-lucide="phone-call"></i>Complete Action</button>`:''}
        <button onclick="viewEnquiry('${enquiry.id}')" class="secondary"><i data-lucide="folder-open"></i>Open Enquiry</button>
        <button onclick="openEnquiryForm('${enquiry.id}')" class="icon" title="Edit"><i data-lucide="pencil"></i></button>
      </div>
    </article>`;
  }).join('');

  if(window.lucide)lucide.createIcons();
}

function viewEnquiry(id){
  const enquiry=DB.enquiries.find(item=>item.id===id);
  if(!enquiry)return;
  EnquiriesCentre.currentId=id;
  const stage=followupStageDetails(enquiry);
  const timeline=[...enquiryVisibleComms(enquiry)].reverse();
  const open=EnquiriesCentre.isOpen(enquiry);
  const isLate=open&&isOverdue(enquiry.nextFollowup);
  const tabs=[['overview','Overview'],...(/wedding/i.test(enquiry.eventType||'')&&open?[['weddingBrief','Wedding Brief'],['weddingQuote','Quote Builder']]:[]),...(!/wedding/i.test(enquiry.eventType||'')&&open&&window.EnquiryEventBrief?[['eventBrief','Event Brief']]:[]),...(open&&window.EnquiryProposal?[['proposal','Proposal']]:[]),['timeline','Timeline'],['actions','Tasks & Actions'],['commercial','Commercial'],['history','History']];
  const tab=EnquiriesCentre.workspaceTab||'overview';

  let content='';
  if(tab==='weddingBrief' && /wedding/i.test(enquiry.eventType||'') && open){
    content=renderEnquiryWeddingBrief(enquiry);
  } else if(tab==='weddingQuote' && /wedding/i.test(enquiry.eventType||'') && open){
    content=renderEnquiryWeddingQuote(enquiry);
  } else if(tab==='eventBrief' && !/wedding/i.test(enquiry.eventType||'') && open && window.EnquiryEventBrief){
    content=EnquiryEventBrief.render(enquiry);
  } else if(tab==='proposal' && open && window.EnquiryProposal){
    content=EnquiryProposal.render(enquiry);
  } else if(tab==='timeline'||tab==='history'){
    content=`<section class="eqv2-work-card">
      <div class="eqv2-work-heading"><div><p class="eqv2-eyebrow olive">CONTACT HISTORY</p><h3>Every interaction</h3></div><button onclick="addComm('${id}')" class="eqv2-small-action"><i data-lucide="plus"></i>Add Note</button></div>
      <div class="eqv2-timeline">${timeline.length?timeline.map((item,index)=>`<article><div class="eqv2-timeline-dot"></div><time>${formatSalesDate(item.date)}</time><div><strong>${esc(item.type||'Note')}</strong><p>${esc(item.note||'')}</p>${index===0?'<span>Most recent</span>':''}</div></article>`).join(''):'<div class="eqv2-work-empty">No communication has been logged yet.</div>'}</div>
    </section>`;
  } else if(tab==='actions'){
    content=`<div class="eqv2-work-grid two">
      <section class="eqv2-work-card">
        <p class="eqv2-eyebrow olive">CURRENT ACTION</p><h3>${esc(enquiry.nextAction||stage.action)}</h3><p class="eqv2-work-copy">${esc(stage.guidance)}</p>
        <div class="eqv2-action-due ${isLate?'red':'olive'}"><span>Due</span><strong>${formatSalesDate(enquiry.nextFollowup)}</strong></div>
        <button onclick="openFollowupOutcome('${id}')" class="eqv2-work-primary"><i data-lucide="phone-call"></i>Log Contact or Outcome</button>
        ${window.EnquiryActivity?.quickButtons?EnquiryActivity.quickButtons(enquiry):''}
      </section>
      <section class="eqv2-work-card">
        <p class="eqv2-eyebrow olive">NEXT STEP CONTROL</p><h3>Keep this enquiry moving</h3>
        <div class="eqv2-action-list">
          <button onclick="openFollowupOutcome('${id}')"><i data-lucide="phone"></i><span><strong>Log a call or email</strong><small>Record the result and schedule the next action.</small></span></button>
          <button onclick="addComm('${id}')"><i data-lucide="notebook-pen"></i><span><strong>Add internal note</strong><small>Save useful context for the whole team.</small></span></button>
          <button onclick="openEnquiryForm('${id}')"><i data-lucide="pencil"></i><span><strong>Edit enquiry details</strong><small>Update owner, value, date or contact details.</small></span></button>
        </div>
      </section>
    </div>`;
  } else if(tab==='commercial'){
    const value=Number(enquiry.value||0);
    const budget=Number(enquiry.budget||0);
    const weighted=Math.round(value*(Number(enquiry.probability||0)/100));
    content=`<div class="eqv2-work-grid three">
      <section class="eqv2-commercial-card"><small>Estimated Value</small><strong>£${value.toLocaleString()}</strong><p>The opportunity currently held in the pipeline.</p></section>
      <section class="eqv2-commercial-card"><small>Customer Budget</small><strong>${budget?`£${budget.toLocaleString()}`:'Not set'}</strong><p>Use this to shape the package and objection handling.</p></section>
      <section class="eqv2-commercial-card"><small>Weighted Value</small><strong>£${weighted.toLocaleString()}</strong><p>Value adjusted by the ${Number(enquiry.probability||0)}% probability.</p></section>
      <section class="eqv2-work-card eqv2-span-all"><p class="eqv2-eyebrow olive">COMMERCIAL POSITION</p><h3>Sales details</h3><div class="eqv2-detail-grid">
        <div><small>Lead source</small><strong>${esc(enquiry.source||'Not set')}</strong></div>
        <div><small>Package</small><strong>${esc(enquiry.package||'Not selected')}</strong></div>
        <div><small>Guests</small><strong>${Number(enquiry.guests||0)}</strong></div>
        <div><small>Probability</small><strong>${Number(enquiry.probability||0)}%</strong></div>
        <div><small>Priority</small><strong>${esc(enquiry.priority||'Warm')}</strong></div>
        <div><small>Rezlynx</small><strong>${esc(enquiry.rezlynxReference||'Not applicable')}</strong></div>
      </div></section>
      ${window.EnquiryEstimate?EnquiryEstimate.renderSummary(enquiry):''}
    </div>`;
  } else {
    content=`<div class="eqv2-work-grid two">
      <section class="eqv2-work-card">
        <div class="eqv2-work-heading"><div><p class="eqv2-eyebrow olive">CUSTOMER & EVENT</p><h3>Enquiry details</h3></div><button onclick="openEnquiryForm('${id}')" class="eqv2-small-action"><i data-lucide="pencil"></i>Edit</button></div>
        <div class="eqv2-detail-grid">
          <div><small>Email</small><strong>${esc(enquiry.email||'Not provided')}</strong></div>
          <div><small>Phone</small><strong>${esc(enquiry.phone||'Not provided')}</strong></div>
          <div><small>Event</small><strong>${esc(enquiry.eventType||'Not set')}</strong></div>
          <div><small>Preferred date</small><strong>${enquiry.preferredDate?formatSalesDate(enquiry.preferredDate):'TBC'}</strong></div>
          <div><small>Guests</small><strong>${Number(enquiry.guests||0)}</strong></div>
          <div><small>Coordinator</small><strong>${esc(enquiry.staff||'Unassigned')}</strong></div>
          <div><small>Lead source</small><strong>${esc(enquiry.source||'Not set')}</strong></div>
          <div><small>Enquired</small><strong>${formatSalesDate(enquiry.enquiryDate)}</strong></div>
        </div>
        ${enquiry.notes?`<div class="eqv2-notes"><small>ENQUIRY NOTES</small><p>${esc(enquiry.notes)}</p></div>`:''}
      </section>
      <section class="eqv2-work-card">
        ${open&&!/wedding/i.test(enquiry.eventType||'')&&window.EnquiryEventBrief?(()=>{const c=EnquiryEventBrief.completion(enquiry);const key=EnquiryEventBrief.keyFor(enquiry);const cfg=EnquiryEventBrief.configs[key];return `<div class="eqp2-overview-brief"><div><p class="eqv2-eyebrow olive">EVENT QUALIFICATION</p><h3>${esc(cfg?.title||'Event Brief')}</h3><p>${c.pct}% qualified · capture the detail needed to quote and follow up properly.</p></div><button onclick="EnquiriesCentre.setWorkspaceTab('eventBrief','${id}')">Open Brief</button></div>`})():''}
        <p class="eqv2-eyebrow olive">SALES CONTROL</p><h3>${open?'What happens next':'Outcome'}</h3>
        ${open?`${window.EnquirySalesCommand?(()=>{const h=EnquirySalesCommand.health(enquiry);return `<div class="eqp1-health-explain ${h.className}"><div><span class="eqp1-health ${h.className}">${esc(h.label)}</span><strong>Why am I seeing this?</strong></div><ul>${EnquirySalesCommand.explain(enquiry).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`})():''}<div class="eqv2-current-action ${isLate?'red':'olive'}"><small>NEXT ACTION</small><strong>${esc(enquiry.nextAction||stage.action)}</strong><p>${esc(stage.guidance)}</p><span>${isLate?'Overdue · ':''}${formatSalesDate(enquiry.nextFollowup)}</span></div>
        <button onclick="openFollowupOutcome('${id}')" class="eqv2-work-primary"><i data-lucide="phone-call"></i>Complete This Action</button>
        ${window.EnquiryActivity?.quickButtons?EnquiryActivity.quickButtons(enquiry):''}`:
        `<div class="eqv2-current-action ${EnquiriesCentre.confirmedStatuses.includes(enquiry.status)?'green':'grey'}"><small>${EnquiriesCentre.confirmedStatuses.includes(enquiry.status)?'CONFIRMED':'CLOSED'}</small><strong>${EnquiriesCentre.confirmedStatuses.includes(enquiry.status)?(enquiry.rezlynxReference||'Booking confirmed'):(enquiry.lostReason||'Lost enquiry')}</strong><p>${esc(enquiry.lostNotes||'')}</p></div>`}
        <div class="eqv2-mini-timeline"><p>Last contact <strong>${formatSalesDate(enquiry.lastContact)}</strong></p><p>Contact attempts <strong>${Number(enquiry.contactAttempts||0)}</strong></p><p>Status <strong>${esc(enquiry.status)}</strong></p></div>
      </section>
    </div>`;
  }

  openModal(`<div class="eqv2-workspace h-full flex flex-col">
    <header class="eqv2-workspace-header">
      <div class="eqv2-workspace-title"><div class="eqv2-event-icon"><i data-lucide="${/wedding/i.test(enquiry.eventType||'')?'heart':'briefcase-business'}"></i></div><div><p class="eqv2-eyebrow olive">ENQUIRY WORKSPACE</p><h2>${esc(enquiry.name)}</h2><p>${esc(enquiry.eventType||'Event')} · ${enquiry.preferredDate?formatSalesDate(enquiry.preferredDate):'Date TBC'} · ${Number(enquiry.guests||0)} guests</p></div></div>
      <div class="eqv2-workspace-header-actions"><span class="badge ${statusColor(enquiry.status)}">${esc(enquiry.status)}</span><span class="badge ${priorityBadge(enquiry.priority||'Warm')}">${esc(enquiry.priority||'Warm')}</span><button onclick="EnquiriesCentre.closeWorkspace()"><i data-lucide="x"></i></button></div>
    </header>
    <nav class="eqv2-work-tabs">${tabs.map(([key,label])=>`<button onclick="EnquiriesCentre.setWorkspaceTab('${key}','${id}')" class="${tab===key?'active':''}">${label}</button>`).join('')}</nav>
    <main class="eqv2-workspace-body">${content}</main>
    <footer class="eqv2-workspace-footer">
      <div><span>Potential value</span><strong>£${Number(enquiry.value||0).toLocaleString()}</strong><span>Owner</span><strong>${esc(enquiry.staff||'Unassigned')}</strong></div>
      <div><button onclick="WindmillComms.open('Enquiry','${id}')" class="secondary"><i data-lucide="mail"></i>Email</button><button onclick="addComm('${id}')" class="secondary">Add Note</button><button onclick="openEnquiryForm('${id}')" class="secondary">Edit Details</button><button onclick="EnquiryEstimate.open('${id}')" class="secondary"><i data-lucide="receipt-pound-sterling"></i>Estimate</button>${open&&window.EnquiryProposal?`<button onclick="EnquiryProposal.generate('${id}')" class="secondary"><i data-lucide="file-text"></i>Proposal</button>`:''}${open?`<button onclick="openFollowupOutcome('${id}')" class="primary">Log Outcome</button>`:''}</div>
    </footer>
  </div>`);
  EnquiriesCentre.resizeWorkspace();
  if(window.lucide)lucide.createIcons();
}

(function injectEnquiriesCentreV2Styles(){
  if(document.getElementById('enquiries-centre-v2-styles'))return;
  const style=document.createElement('style');
  style.id='enquiries-centre-v2-styles';
  style.textContent=`
  .enquiries-centre-v2{padding-bottom:20px}.eqv2-eyebrow{font-size:0.77rem;font-weight:900;letter-spacing:.18em;color:#f2cd70}.eqv2-eyebrow.olive{color:#678047}
  .eqv2-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:22px 24px;border-radius:21px;background:radial-gradient(circle at 90% 10%,rgba(213,169,63,.25),transparent 20rem),linear-gradient(135deg,#27372f,#48603b 62%,#69824b);color:#fff;box-shadow:0 15px 32px rgba(35,52,39,.16)}.eqv2-hero h2{font-size:2rem;font-weight:850;letter-spacing:-.04em;margin-top:4px}.eqv2-hero>div>p:last-child{font-size:0.94rem;color:rgba(255,255,255,.75);margin-top:5px}.eqv2-hero-actions{display:flex;gap:8px}.eqv2-hero-actions button{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:11px;font-size:0.83rem;font-weight:850}.eqv2-hero-actions svg{width:17px;height:17px}.eqv2-start-calls{padding:9px 14px;background:#fff;color:#405636}.eqv2-start-calls span{display:flex;flex-direction:column;text-align:left}.eqv2-start-calls small{font-size:0.62rem;color:#899281;font-weight:700}.eqv2-new{padding:11px 14px;background:#d4a843;color:#1f2b24}
  .eqv2-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.eqv2-kpis article{display:flex;gap:11px;align-items:flex-start;padding:14px;border:1px solid #e3e9df;border-radius:16px;background:#fff;box-shadow:0 5px 16px rgba(35,50,38,.045)}.eqv2-kpis article>span{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:#edf3e6;color:#617a42;flex-shrink:0}.eqv2-kpis svg{width:18px;height:18px}.eqv2-kpis p{font-size:0.73rem;color:#707a6d;font-weight:750}.eqv2-kpis strong{display:block;font-size:1.25rem;line-height:1.15;margin-top:3px}.eqv2-kpis small{display:block;font-size:0.62rem;color:#969d94;margin-top:4px}
  .eqv2-controls{display:grid;grid-template-columns:minmax(260px,1fr) repeat(3,180px);gap:8px;padding:11px;border:1px solid #e3e9df;border-radius:15px;background:#fff}.eqv2-controls select,.eqv2-search{height:40px;border:1px solid #dfe5d9;border-radius:10px;background:#fafbf9}.eqv2-controls select{padding:0 10px;font-size:0.79rem}.eqv2-search{display:flex;align-items:center;gap:8px;padding:0 11px}.eqv2-search svg{width:15px;height:15px;color:#899486}.eqv2-search input{width:100%;border:0;outline:0;background:transparent;font-size:0.83rem}
  .eqv2-main{display:grid;grid-template-columns:215px minmax(0,1fr);gap:12px}.eqv2-sidebar,.eqv2-list-panel{border:1px solid #e3e9df;border-radius:17px;background:#fff;box-shadow:0 5px 18px rgba(35,50,38,.045)}.eqv2-sidebar{padding:12px;height:max-content}.eqv2-side-heading{display:flex;align-items:center;justify-content:space-between;padding:4px 6px 9px}.eqv2-side-heading p{font-size:0.63rem;font-weight:900;letter-spacing:.15em;color:#727d70}.eqv2-side-heading span{font-size:0.62rem;color:#9aa198}.eqv2-sidebar>button{display:grid;grid-template-columns:18px minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;padding:9px;border-radius:10px;color:#687364;text-align:left;font-size:0.74rem;font-weight:750}.eqv2-sidebar>button:hover{background:#f2f6ed}.eqv2-sidebar>button.active{background:#5f793e;color:#fff}.eqv2-sidebar svg{width:14px;height:14px}.eqv2-sidebar em{font-style:normal;padding:3px 6px;border-radius:999px;background:rgba(0,0,0,.055);font-size:0.62rem}.eqv2-sidebar button.active em{background:rgba(255,255,255,.17)}.eqv2-side-divider{height:1px;background:#ecefe9;margin:8px 4px}
  .eqv2-list-panel{padding:15px;min-width:0}.eqv2-list-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.eqv2-list-heading h3{font-size:1.05rem;font-weight:850}.eqv2-list-heading>div>p:last-child{font-size:0.73rem;color:#80897d;margin-top:2px}.eqv2-layout-toggle{display:flex;padding:3px;border-radius:9px;background:#f0f3ec}.eqv2-layout-toggle button{width:30px;height:28px;display:grid;place-items:center;border-radius:7px;color:#7c8679}.eqv2-layout-toggle button.active{background:#fff;color:#5d783c;box-shadow:0 2px 6px rgba(0,0,0,.06)}.eqv2-layout-toggle svg{width:14px;height:14px}.eqv2-result-count{font-size:0.63rem;color:#8c9589;margin:10px 1px 7px}
  .eqv2-alerts{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:11px}.eqv2-alert{display:flex;align-items:flex-start;gap:9px;padding:10px;border-radius:11px;text-align:left}.eqv2-alert.red{border:1px solid #f0caca;background:#fff3f3;color:#9e3737}.eqv2-alert.amber{border:1px solid #ead8a3;background:#fff9e6;color:#8a681d}.eqv2-alert svg{width:16px;height:16px;flex-shrink:0}.eqv2-alert strong{display:block;font-size:0.74rem}.eqv2-alert small{display:block;font-size:0.62rem;margin-top:2px;opacity:.8}
  .eqv2-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.eqv2-enquiry-card{display:flex;flex-direction:column;gap:11px;padding:14px;border:1px solid #e2e7df;border-left:4px solid #768e58;border-radius:15px;background:#fff;transition:.16s}.eqv2-enquiry-card:hover{border-color:#c7d4bd;box-shadow:0 8px 20px rgba(35,50,38,.07);transform:translateY(-1px)}.eqv2-enquiry-card.overdue{border-left-color:#d65353;background:linear-gradient(90deg,#fff8f8,#fff 23%)}.eqv2-enquiry-card.due{border-left-color:#d49b35}.eqv2-enquiry-card.won{border-left-color:#4b9a5e}.eqv2-enquiry-card.lost{border-left-color:#9aa29a;opacity:.83}.eqv2-card-top{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:start}.eqv2-event-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#edf3e5;color:#5d783e;flex-shrink:0}.eqv2-event-icon svg{width:17px;height:17px}.eqv2-card-title>div{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.eqv2-card-title h4{font-size:0.93rem;font-weight:850}.eqv2-card-title p{font-size:0.66rem;color:#828b7f;margin-top:3px}.eqv2-card-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.eqv2-card-stats div{padding:8px;border-radius:9px;background:#f7f9f5}.eqv2-card-stats small,.eqv2-next-action small{display:block;font-size:0.62rem;color:#899184;font-weight:800;letter-spacing:.08em}.eqv2-card-stats strong{display:block;font-size:0.76rem;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eqv2-next-action{display:flex;align-items:flex-start;justify-content:space-between;gap:9px;padding:10px;border:1px solid;border-radius:11px}.eqv2-next-action.olive{border-color:#d5e0ca;background:#f2f7ed;color:#4e6938}.eqv2-next-action.red{border-color:#edc8c8;background:#fff3f3;color:#993b3b}.eqv2-next-action.amber{border-color:#e8d7a6;background:#fff8e8;color:#87671d}.eqv2-next-action.green{border-color:#cae2ce;background:#f0f8f1;color:#3f724b}.eqv2-next-action.grey{border-color:#e1e4df;background:#f6f7f5;color:#697168}.eqv2-next-action strong{display:block;font-size:0.78rem;margin-top:2px}.eqv2-next-action p{font-size:0.62rem;margin-top:2px;opacity:.8}.eqv2-next-action>span{font-size:0.62rem;font-weight:850;white-space:nowrap}.eqv2-card-signals{display:flex;gap:13px;flex-wrap:wrap;color:#80897d;font-size:0.62rem}.eqv2-card-signals span{display:flex;align-items:center;gap:4px}.eqv2-card-signals svg{width:12px;height:12px}.eqv2-card-actions{display:flex;gap:6px;margin-top:auto}.eqv2-card-actions button{display:flex;align-items:center;justify-content:center;gap:5px;padding:8px 10px;border-radius:9px;font-size:0.67rem;font-weight:850}.eqv2-card-actions svg{width:13px;height:13px}.eqv2-card-actions .primary{background:#607c3f;color:#fff}.eqv2-card-actions .secondary{background:#eef3e8;color:#567139}.eqv2-card-actions .icon{margin-left:auto;width:31px;padding:0;background:#f1f2ef;color:#687267}
  .eqv2-compact-list{display:flex;flex-direction:column;gap:7px}.eqv2-compact{display:grid;grid-template-columns:38px minmax(190px,1.4fr) 100px minmax(190px,1fr) 105px 58px;gap:10px;align-items:center;padding:10px;border:1px solid #e2e7df;border-left:4px solid #768e58;border-radius:12px;background:#fff}.eqv2-compact.overdue{border-left-color:#d65353}.eqv2-compact.won{border-left-color:#4b9a5e}.eqv2-compact.lost{border-left-color:#999}.eqv2-compact-main>div{display:flex;align-items:center;gap:6px}.eqv2-compact-main strong{font-size:0.79rem}.eqv2-compact-main p,.eqv2-compact small{font-size:0.62rem;color:#858d82}.eqv2-compact-value strong,.eqv2-compact-action strong,.eqv2-compact-owner strong{display:block;font-size:0.71rem;margin-top:2px}.eqv2-compact-action span{display:block;font-size:0.62rem;color:#7c8678;margin-top:2px}.eqv2-open-btn{padding:7px;border-radius:8px;background:#eef3e8;color:#58723d;font-size:0.65rem;font-weight:850}
  .eqv2-empty,.eqv2-work-empty{display:grid;place-items:center;text-align:center;color:#929a90;min-height:250px}.eqv2-empty svg{width:32px;height:32px;color:#8da078}.eqv2-empty strong{font-size:0.92rem}.eqv2-empty p{font-size:0.67rem}
  .eqv2-workspace{background:#f5f7f2}.eqv2-workspace-header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 21px;border-bottom:1px solid #e1e6dd;background:#fff}.eqv2-workspace-title{display:flex;align-items:center;gap:12px;min-width:0}.eqv2-workspace-title h2{font-size:1.45rem;font-weight:850;letter-spacing:-.03em}.eqv2-workspace-title>div:last-child>p:last-child{font-size:0.76rem;color:#7d877a;margin-top:2px}.eqv2-workspace-header-actions{display:flex;align-items:center;gap:7px}.eqv2-workspace-header-actions>button{width:35px;height:35px;display:grid;place-items:center;border-radius:9px;background:#f1f3ef;color:#697367}.eqv2-workspace-header-actions svg{width:18px;height:18px}.eqv2-work-tabs{display:flex;gap:4px;padding:9px 20px;border-bottom:1px solid #e1e6dd;background:#fff;overflow-x:auto}.eqv2-work-tabs button{padding:8px 12px;border-radius:8px;color:#697466;font-size:0.74rem;font-weight:800;white-space:nowrap}.eqv2-work-tabs button.active{background:#5f793e;color:#fff}.eqv2-workspace-body{flex:1;min-height:0;overflow-y:auto;padding:16px 20px}.eqv2-workspace-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 20px;border-top:1px solid #e1e6dd;background:#fff}.eqv2-workspace-footer>div{display:flex;align-items:center;gap:9px}.eqv2-workspace-footer span{font-size:0.62rem;color:#8b9488}.eqv2-workspace-footer strong{font-size:0.79rem}.eqv2-workspace-footer button{padding:8px 11px;border-radius:9px;font-size:0.7rem;font-weight:850}.eqv2-workspace-footer .secondary{background:#f0f2ee;color:#5f695c}.eqv2-workspace-footer .primary{background:#5f793e;color:#fff}
  .eqv2-work-grid{display:grid;gap:12px}.eqv2-work-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.eqv2-work-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.eqv2-span-all{grid-column:1/-1}.eqv2-work-card,.eqv2-commercial-card{padding:16px;border:1px solid #e0e6dc;border-radius:15px;background:#fff;box-shadow:0 4px 14px rgba(35,50,38,.035)}.eqv2-work-card h3{font-size:1rem;font-weight:850;margin-top:3px}.eqv2-work-copy{font-size:0.76rem;color:#748070;margin-top:5px;line-height:1.5}.eqv2-work-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.eqv2-small-action{display:flex;align-items:center;gap:5px;padding:7px 9px;border-radius:8px;background:#eef3e8;color:#58733c;font-size:0.65rem;font-weight:850}.eqv2-small-action svg{width:13px;height:13px}.eqv2-detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.eqv2-detail-grid div{padding:10px;border-radius:10px;background:#f6f8f4}.eqv2-detail-grid small,.eqv2-commercial-card small{display:block;font-size:0.62rem;color:#899386;font-weight:850;letter-spacing:.07em}.eqv2-detail-grid strong{display:block;font-size:0.76rem;margin-top:3px;word-break:break-word}.eqv2-notes{margin-top:12px;padding:11px;border-radius:10px;background:#fff9e7;border:1px solid #eadcae}.eqv2-notes small{font-size:0.62rem;color:#967023;font-weight:850}.eqv2-notes p{font-size:0.72rem;margin-top:4px}.eqv2-current-action{margin-top:12px;padding:13px;border:1px solid;border-radius:12px}.eqv2-current-action.olive{border-color:#d5e0ca;background:#f2f7ed;color:#4e6938}.eqv2-current-action.red{border-color:#edc8c8;background:#fff3f3;color:#993b3b}.eqv2-current-action.green{border-color:#cae2ce;background:#f0f8f1;color:#3f724b}.eqv2-current-action.grey{border-color:#e1e4df;background:#f6f7f5;color:#697168}.eqv2-current-action small{font-size:0.62rem;font-weight:900;letter-spacing:.1em}.eqv2-current-action strong{display:block;font-size:0.88rem;margin-top:3px}.eqv2-current-action p{font-size:0.67rem;margin-top:4px}.eqv2-current-action span{display:inline-block;margin-top:8px;font-size:0.62rem;font-weight:850}.eqv2-work-primary{display:flex;justify-content:center;align-items:center;gap:6px;width:100%;margin-top:11px;padding:10px;border-radius:9px;background:#5f793e;color:#fff;font-size:0.72rem;font-weight:850}.eqv2-work-primary svg{width:14px;height:14px}.eqv2-mini-timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.eqv2-mini-timeline p{padding:8px;border-radius:8px;background:#f6f8f4;font-size:0.62rem;color:#7c8679}.eqv2-mini-timeline strong{display:block;color:#3e493c;margin-top:2px}.eqv2-action-due{display:flex;justify-content:space-between;margin-top:12px;padding:10px;border-radius:9px}.eqv2-action-due.olive{background:#edf3e7;color:#54703a}.eqv2-action-due.red{background:#fff0f0;color:#9a3a3a}.eqv2-action-due span{font-size:0.63rem}.eqv2-action-due strong{font-size:0.74rem}.eqv2-action-list{display:flex;flex-direction:column;gap:7px;margin-top:12px}.eqv2-action-list button{display:grid;grid-template-columns:30px minmax(0,1fr);gap:9px;align-items:center;padding:9px;border:1px solid #e5e9e1;border-radius:10px;text-align:left}.eqv2-action-list svg{width:16px;height:16px;color:#617b43}.eqv2-action-list strong{display:block;font-size:0.72rem}.eqv2-action-list small{display:block;font-size:0.62rem;color:#879084;margin-top:2px}.eqv2-commercial-card strong{display:block;font-size:1.25rem;margin-top:5px}.eqv2-commercial-card p{font-size:0.63rem;color:#858e82;margin-top:5px}.eqv2-timeline{display:flex;flex-direction:column;margin-top:14px}.eqv2-timeline article{display:grid;grid-template-columns:12px 90px minmax(0,1fr);gap:10px;position:relative;padding:0 0 15px}.eqv2-timeline article:before{content:"";position:absolute;left:5px;top:12px;bottom:0;width:2px;background:#dce5d4}.eqv2-timeline article:last-child:before{display:none}.eqv2-timeline-dot{width:12px;height:12px;border:3px solid #dbe6d1;border-radius:50%;background:#607c3f;z-index:1}.eqv2-timeline time{font-size:0.62rem;color:#899286}.eqv2-timeline strong{font-size:0.74rem}.eqv2-timeline p{font-size:0.68rem;color:#727c70;margin-top:2px}.eqv2-timeline span{display:inline-block;margin-top:4px;padding:3px 6px;border-radius:999px;background:#edf3e7;color:#5c773f;font-size:0.62rem;font-weight:850}
  @media(max-width:1250px){.eqv2-kpis{grid-template-columns:repeat(3,1fr)}.eqv2-card-grid{grid-template-columns:1fr}.eqv2-compact{grid-template-columns:38px minmax(180px,1fr) 90px minmax(160px,1fr) 90px 55px}}@media(max-width:900px){.eqv2-hero{align-items:flex-start;flex-direction:column}.eqv2-controls{grid-template-columns:1fr 1fr}.eqv2-search{grid-column:1/-1}.eqv2-main{grid-template-columns:1fr}.eqv2-sidebar{display:flex;overflow-x:auto}.eqv2-sidebar>button{min-width:135px}.eqv2-side-heading,.eqv2-side-divider{display:none}.eqv2-work-grid.two,.eqv2-work-grid.three{grid-template-columns:1fr}.eqv2-workspace-footer{align-items:flex-start;flex-direction:column}.eqv2-compact{grid-template-columns:38px minmax(0,1fr) 70px}.eqv2-compact-action,.eqv2-compact-owner{display:none}}@media(max-width:620px){.eqv2-kpis{grid-template-columns:repeat(2,1fr)}.eqv2-controls{grid-template-columns:1fr}.eqv2-search{grid-column:auto}.eqv2-card-stats{grid-template-columns:repeat(2,1fr)}.eqv2-card-actions{flex-wrap:wrap}.eqv2-alerts{grid-template-columns:1fr}.eqv2-workspace-header{align-items:flex-start}.eqv2-workspace-header-actions .badge{display:none}.eqv2-detail-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
})();
// ============================================================================
// PHASE 6.2 — PRE-BOOKING WEDDING WORKSPACE
// Stored inside the enquiry communications JSON to avoid a Supabase migration.
// The system entry is hidden from the normal contact timeline.
// ============================================================================
const ENQUIRY_WEDDING_DATA_TYPE='__WEDDING_PREBOOK_DATA__';

function enquiryWeddingData(enquiry){
  const entry=[...(enquiry?.comms||[])].reverse().find(x=>x&&x.type===ENQUIRY_WEDDING_DATA_TYPE);
  const data=entry&&entry.data&&typeof entry.data==='object'?entry.data:{};
  const year=Number(String(enquiry?.preferredDate||'').slice(0,4))||2027;
  return {
    brief:{
      weddingFormat:'ceremony_reception', ceremonyLocation:'windmill_farm',
      dayGuests:Number(enquiry?.guests||0), eveningGuests:Number(enquiry?.guests||0),
      ceremonyTime:'', arrivalTime:'', weddingBreakfastTime:'', eveningStartTime:'',
      accommodation:'yes', styleVision:'', foodIdeas:'', drinksIdeas:'', entertainment:'',
      specialRequirements:'', ...(data.brief||{})
    },
    quote:{
      priceYear:[2027,2028,2029].includes(Number(data.quote?.priceYear))?Number(data.quote.priceYear):([2027,2028,2029].includes(year)?year:2027),
      packageName:data.quote?.packageName||enquiry?.package||'Bespoke',
      dayGuests:Number(data.quote?.dayGuests??enquiry?.guests??0),
      eveningGuests:Number(data.quote?.eveningGuests??enquiry?.guests??0),
      menu:data.quote?.menu||'None', menuIncluded:!!data.quote?.menuIncluded,
      drinks:data.quote?.drinks||'None', drinksIncluded:!!data.quote?.drinksIncluded,
      eveningFood:data.quote?.eveningFood||'None', eveningFoodIncluded:!!data.quote?.eveningFoodIncluded,
      extras:Array.isArray(data.quote?.extras)?data.quote.extras:[],
      customItems:Array.isArray(data.quote?.customItems)?data.quote.customItems:[],
      discount:Number(data.quote?.discount||0), notes:data.quote?.notes||''
    }
  };
}

function enquiryVisibleComms(enquiry){
  const hidden=new Set([
    ENQUIRY_WEDDING_DATA_TYPE,
    '__ENQUIRY_EVENT_BRIEF_V2__',
    '__ENQUIRY_SALES_ACTIVITY_STATE_V3__',
    '__ENQUIRY_PROPOSAL_STATE_V5__'
  ]);
  return (enquiry?.comms||[]).filter(x=>x&&!hidden.has(x.type));
}

async function saveEnquiryWeddingData(enquiryId,data,{refresh=true,message='Wedding enquiry details saved'}={}){
  const enquiry=DB.enquiries.find(x=>x.id===enquiryId); if(!enquiry)return false;
  const communications=(enquiry.comms||[]).filter(x=>x&&x.type!==ENQUIRY_WEDDING_DATA_TYPE);
  communications.push({date:new Date().toISOString(),type:ENQUIRY_WEDDING_DATA_TYPE,data});
  const quote=calculateWeddingQuote(data.quote);
  const updates={
    communications,
    package:data.quote.packageName||'Bespoke',
    guests:Number(data.quote.dayGuests||data.brief.dayGuests||enquiry.guests||0),
    value:Number(quote.total||0)
  };
  const {error}=await supabaseClient.from('enquiries').update(updates).eq('id',enquiryId);
  if(error){console.error('Could not save wedding pre-book data',error);toast('Wedding details could not be saved','error');return false;}
  await loadEnquiriesFromSupabase();
  if(refresh)viewEnquiry(enquiryId);
  if(message)toast(message);
  return true;
}

function enquiryWeddingFormatLabel(v){return ({ceremony_reception:'Ceremony & Reception',reception_only:'Reception Only',external_ceremony:'External Ceremony',twilight:'Twilight Wedding',evening_only:'Evening Wedding'})[v]||'Ceremony & Reception';}
function enquiryCeremonyLabel(v){return ({windmill_farm:'The Granary at Windmill Farm',external:'External Venue',church:'Church',registry:'Registry Office',other:'Other / TBC'})[v]||'The Granary at Windmill Farm';}

function renderEnquiryWeddingBrief(enquiry){
 const x=enquiryWeddingData(enquiry),b=x.brief;
 return `<section class="eqv2-work-card">
 <div class="eqv2-work-heading"><div><p class="eqv2-eyebrow olive">PRE-BOOKING WEDDING BRIEF</p><h3>Shape the wedding before they book</h3></div><span class="badge bg-olive-100 text-olive-800">Transfers when confirmed</span></div>
 <p class="eqv2-work-copy">Capture the useful showround and sales detail here. Final guest choices, seating and operational planning stay in Weddings after confirmation.</p>
 <form onsubmit="saveEnquiryWeddingBrief(event,'${enquiry.id}')" class="space-y-4 mt-4">
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <label class="text-xs font-medium text-gray-600">Wedding format<select name="weddingFormat" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${[['ceremony_reception','Ceremony & Reception'],['reception_only','Reception Only'],['external_ceremony','External Ceremony'],['twilight','Twilight Wedding'],['evening_only','Evening Wedding']].map(([v,l])=>`<option value="${v}" ${b.weddingFormat===v?'selected':''}>${l}</option>`).join('')}</select></label>
 <label class="text-xs font-medium text-gray-600">Ceremony location<select name="ceremonyLocation" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${[['windmill_farm','The Granary'],['external','External Venue'],['church','Church'],['registry','Registry Office'],['other','Other / TBC']].map(([v,l])=>`<option value="${v}" ${b.ceremonyLocation===v?'selected':''}>${l}</option>`).join('')}</select></label>
 <label class="text-xs font-medium text-gray-600">Approx. day guests<input name="dayGuests" type="number" min="0" value="${Number(b.dayGuests||0)}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
 <label class="text-xs font-medium text-gray-600">Approx. evening guests<input name="eveningGuests" type="number" min="0" value="${Number(b.eveningGuests||0)}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
 </div>
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <label class="text-xs font-medium text-gray-600">Ceremony time<input name="ceremonyTime" type="time" value="${esc(b.ceremonyTime||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
 <label class="text-xs font-medium text-gray-600">Arrival at Windmill Farm<input name="arrivalTime" type="time" value="${esc(b.arrivalTime||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
 <label class="text-xs font-medium text-gray-600">Wedding breakfast<input name="weddingBreakfastTime" type="time" value="${esc(b.weddingBreakfastTime||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
 <label class="text-xs font-medium text-gray-600">Evening celebration<input name="eveningStartTime" type="time" value="${esc(b.eveningStartTime||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
 </div>
 <div class="grid sm:grid-cols-2 gap-3">
 <label class="text-xs font-medium text-gray-600">Style / wedding vision<textarea name="styleVision" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(b.styleVision||'')}</textarea></label>
 <label class="text-xs font-medium text-gray-600">Food ideas<textarea name="foodIdeas" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(b.foodIdeas||'')}</textarea></label>
 <label class="text-xs font-medium text-gray-600">Drinks ideas<textarea name="drinksIdeas" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(b.drinksIdeas||'')}</textarea></label>
 <label class="text-xs font-medium text-gray-600">Entertainment / music<textarea name="entertainment" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(b.entertainment||'')}</textarea></label>
 <label class="text-xs font-medium text-gray-600">Accommodation<select name="accommodation" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"><option value="yes" ${b.accommodation==='yes'?'selected':''}>Required / interested</option><option value="no" ${b.accommodation==='no'?'selected':''}>Not required</option><option value="tbc" ${b.accommodation==='tbc'?'selected':''}>TBC</option></select></label>
 <label class="text-xs font-medium text-gray-600">Special requirements<textarea name="specialRequirements" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(b.specialRequirements||'')}</textarea></label>
 </div><button class="eqv2-work-primary" type="submit">Save Wedding Brief</button></form></section>`;
}

async function saveEnquiryWeddingBrief(event,id){
 event.preventDefault();const enquiry=DB.enquiries.find(x=>x.id===id);if(!enquiry)return;
 const x=enquiryWeddingData(enquiry),f=new FormData(event.target);
 x.brief={weddingFormat:f.get('weddingFormat'),ceremonyLocation:f.get('ceremonyLocation'),dayGuests:Number(f.get('dayGuests')||0),eveningGuests:Number(f.get('eveningGuests')||0),ceremonyTime:f.get('ceremonyTime')||'',arrivalTime:f.get('arrivalTime')||'',weddingBreakfastTime:f.get('weddingBreakfastTime')||'',eveningStartTime:f.get('eveningStartTime')||'',accommodation:f.get('accommodation')||'tbc',styleVision:f.get('styleVision')||'',foodIdeas:f.get('foodIdeas')||'',drinksIdeas:f.get('drinksIdeas')||'',entertainment:f.get('entertainment')||'',specialRequirements:f.get('specialRequirements')||''};
 x.quote.dayGuests=x.brief.dayGuests;x.quote.eveningGuests=x.brief.eveningGuests;
 await saveEnquiryWeddingData(id,x);
}

function enquiryQuoteLineRows(items,type){
 return items.map((x,i)=>`<div class="grid grid-cols-[1fr_80px_110px_36px] gap-2 items-end mb-2"><label class="text-xs text-gray-600">Item<input data-eq-${type}-name="${i}" value="${esc(x.name||'')}" class="mt-1 w-full px-2 py-2 border rounded text-sm"></label><label class="text-xs text-gray-600">Qty<input data-eq-${type}-qty="${i}" type="number" min="0" step="1" value="${Number(x.quantity||1)}" class="mt-1 w-full px-2 py-2 border rounded text-sm"></label><label class="text-xs text-gray-600">Each<input data-eq-${type}-price="${i}" type="number" min="0" step=".01" value="${Number(x.unitPrice||0)}" class="mt-1 w-full px-2 py-2 border rounded text-sm"></label><button type="button" onclick="removeEnquiryQuoteLine('${type}',${i})" class="h-9 border rounded">×</button></div>`).join('');
}

let enquiryQuoteEditingId='';
function renderEnquiryWeddingQuote(enquiry){
 const x=enquiryWeddingData(enquiry),d=x.quote,p=WEDDING_PRICING[d.priceYear]||WEDDING_PRICING[2027],c=calculateWeddingQuote(d);enquiryQuoteEditingId=enquiry.id;
 return `<div class="grid xl:grid-cols-[1fr_330px] gap-5"><section class="eqv2-work-card">
 <div class="eqv2-work-heading"><div><p class="eqv2-eyebrow olive">WEDDING QUOTE BUILDER</p><h3>Build the proposal before confirmation</h3></div><span class="badge bg-olive-100 text-olive-800">Same wedding pricing engine</span></div>
 <form onsubmit="saveEnquiryWeddingQuote(event,'${enquiry.id}')" id="enquiry-wedding-quote-form" class="space-y-4 mt-4">
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <label class="text-xs font-medium text-gray-600">Price year<select name="priceYear" onchange="enquiryQuoteYearChanged(this.value,'${enquiry.id}')" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${[2027,2028,2029].map(y=>`<option ${d.priceYear===y?'selected':''}>${y}</option>`).join('')}</select></label>
 <label class="text-xs font-medium text-gray-600">Package<select name="packageName" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${Object.keys(p.packages).map(v=>`<option ${d.packageName===v?'selected':''}>${v}</option>`).join('')}</select></label>
 <label class="text-xs font-medium text-gray-600">Day guests<input name="dayGuests" type="number" min="0" value="${d.dayGuests}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
 <label class="text-xs font-medium text-gray-600">Evening guests<input name="eveningGuests" type="number" min="0" value="${d.eveningGuests}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label></div>
 <div class="grid sm:grid-cols-3 gap-3">
 ${[['Wedding Breakfast','menu',p.menus],['Drinks Package','drinks',p.drinks],['Evening Food','eveningFood',p.eveningFood]].map(([label,key,opts])=>`<div class="border rounded-lg p-3"><label class="text-xs font-medium text-gray-600">${label}<select name="${key}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${Object.keys(opts).map(v=>`<option ${d[key]===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="flex gap-2 items-center text-xs mt-2"><input name="${key}Included" type="checkbox" ${d[key+'Included']?'checked':''}> Included in package</label></div>`).join('')}</div>
 <div class="border rounded-lg p-4"><div class="flex justify-between"><strong>Décor & Extras</strong><div><select id="enquiry-extra-select" class="px-2 py-1 border rounded text-sm"><option value="">Choose...</option>${Object.entries(p.extras).map(([n,v])=>`<option value="${esc(n)}">${esc(n)} — ${money(v)}</option>`).join('')}</select><button type="button" onclick="addEnquiryQuoteExtra()" class="ml-2 px-3 py-1.5 bg-olive-600 text-white rounded text-sm">Add</button></div></div><div id="enquiry-extra-lines" class="mt-3">${enquiryQuoteLineRows(d.extras,'extra')}</div></div>
 <div class="border rounded-lg p-4"><div class="flex justify-between"><strong>Custom Items</strong><button type="button" onclick="addEnquiryQuoteCustom()" class="px-3 py-1.5 bg-gray-900 text-white rounded text-sm">+ Custom</button></div><div id="enquiry-custom-lines" class="mt-3">${enquiryQuoteLineRows(d.customItems,'custom')}</div></div>
 <div class="grid sm:grid-cols-2 gap-3"><label class="text-xs font-medium text-gray-600">Discount (£)<input name="discount" type="number" min="0" step=".01" value="${d.discount}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><label class="text-xs font-medium text-gray-600">Proposal notes<textarea name="notes" rows="2" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(d.notes||'')}</textarea></label></div>
 <button class="eqv2-work-primary" type="submit">Save Wedding Quote</button></form></section>
 <aside class="space-y-3"><div class="bg-charcoal-900 text-white rounded-xl p-5"><p class="text-xs tracking-widest text-olive-300 font-bold">CURRENT PROPOSAL</p><p class="text-3xl font-bold mt-1">${money(c.total)}</p><div class="mt-4 space-y-2 text-sm">${renderQuoteSummary(c)}</div></div><button onclick="printEnquiryWeddingProposal('${enquiry.id}')" class="w-full py-3 bg-olive-600 text-white rounded-xl font-semibold">Print Viewing Proposal</button><p class="text-xs text-gray-500">Save changes before printing. When confirmed, this quote is transferred into the Wedding workspace.</p></aside></div>`;
}
function collectEnquiryQuoteLines(type){const names=[...document.querySelectorAll(`[data-eq-${type}-name]`)];return names.map((el,i)=>({name:el.value,quantity:Number(document.querySelector(`[data-eq-${type}-qty="${i}"]`)?.value||1),unitPrice:Number(document.querySelector(`[data-eq-${type}-price="${i}"]`)?.value||0)})).filter(x=>x.name.trim());}
async function saveEnquiryWeddingQuote(event,id){event.preventDefault();const enquiry=DB.enquiries.find(x=>x.id===id);if(!enquiry)return;const x=enquiryWeddingData(enquiry),f=new FormData(event.target);x.quote={priceYear:Number(f.get('priceYear')),packageName:f.get('packageName'),dayGuests:Number(f.get('dayGuests')||0),eveningGuests:Number(f.get('eveningGuests')||0),menu:f.get('menu'),menuIncluded:f.get('menuIncluded')==='on',drinks:f.get('drinks'),drinksIncluded:f.get('drinksIncluded')==='on',eveningFood:f.get('eveningFood'),eveningFoodIncluded:f.get('eveningFoodIncluded')==='on',extras:collectEnquiryQuoteLines('extra'),customItems:collectEnquiryQuoteLines('custom'),discount:Number(f.get('discount')||0),notes:f.get('notes')||''};x.brief.dayGuests=x.quote.dayGuests;x.brief.eveningGuests=x.quote.eveningGuests;await saveEnquiryWeddingData(id,x);}
function addEnquiryQuoteExtra(){const enquiry=DB.enquiries.find(x=>x.id===enquiryQuoteEditingId);if(!enquiry)return;const x=enquiryWeddingData(enquiry),sel=document.getElementById('enquiry-extra-select'),name=sel?.value;if(!name)return;const p=WEDDING_PRICING[x.quote.priceYear]||WEDDING_PRICING[2027];x.quote.extras.push({name,quantity:1,unitPrice:Number(p.extras[name]||0)});temporaryRenderEnquiryQuote(enquiry,x);}
function addEnquiryQuoteCustom(){const enquiry=DB.enquiries.find(x=>x.id===enquiryQuoteEditingId);if(!enquiry)return;const x=enquiryWeddingData(enquiry);x.quote.customItems.push({name:'Custom Item',quantity:1,unitPrice:0});temporaryRenderEnquiryQuote(enquiry,x);}
function removeEnquiryQuoteLine(type,index){const enquiry=DB.enquiries.find(x=>x.id===enquiryQuoteEditingId);if(!enquiry)return;const x=enquiryWeddingData(enquiry);x.quote[type==='extra'?'extras':'customItems'].splice(index,1);temporaryRenderEnquiryQuote(enquiry,x);}
function temporaryRenderEnquiryQuote(enquiry,x){const comms=(enquiry.comms||[]).filter(v=>v&&v.type!==ENQUIRY_WEDDING_DATA_TYPE);const temp={...enquiry,comms:[...comms,{type:ENQUIRY_WEDDING_DATA_TYPE,data:x}]};const host=document.querySelector('.eqv2-workspace-body');if(host)host.innerHTML=renderEnquiryWeddingQuote(temp);if(window.lucide)lucide.createIcons();}
function enquiryQuoteYearChanged(value,id){const enquiry=DB.enquiries.find(x=>x.id===id);if(!enquiry)return;const x=enquiryWeddingData(enquiry);x.quote.priceYear=Number(value);temporaryRenderEnquiryQuote(enquiry,x);}




// ============================================================================
// ENQUIRY PROVISIONAL ESTIMATE / CUSTOMER TAKEAWAY
// Uses enquiry.communications JSON for versioned line-item persistence so no
// database schema change is required. This is deliberately not labelled as a
// tax invoice because the customer has not yet booked.
// ============================================================================
(function(){
  const TYPE='Enquiry Estimate';
  const escHtml=value=>typeof esc==='function'?esc(String(value??'')):String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=value=>`£${Number(value||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const today=()=>typeof todayStr!=='undefined'?todayStr:new Date().toISOString().slice(0,10);
  const addDays=(date,days)=>{
    const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+Number(days||0));
    return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  };
  function records(enquiry){
    const state=[...(enquiry?.comms||[])].reverse().find(x=>x&&x.type===TYPE&&x.data)?.data;
    if(Array.isArray(state?.versions))return state.versions;
    return state?[state]:[];
  }
  function latest(enquiry){
    const rows=records(enquiry);
    return rows.length?rows[rows.length-1]:null;
  }
  function nextVersion(enquiry){
    return records(enquiry).reduce((max,row)=>Math.max(max,Number(row.version||0)),0)+1;
  }
  function starterItems(enquiry){
    const previous=latest(enquiry);
    if(previous?.items?.length)return previous.items.map(x=>({...x}));
    const amount=Number(enquiry?.value||0);
    return [{description:enquiry?.package||`${enquiry?.eventType||'Event'} package / venue`,qty:1,unitPrice:amount||0}];
  }
  function reference(enquiry,version){
    const clean=String(enquiry?.id||'').replace(/[^A-Za-z0-9]/g,'').slice(-6).toUpperCase()||'ENQ';
    return `EST-${clean}-${String(version).padStart(2,'0')}`;
  }
  function rowHtml(item={description:'',qty:1,unitPrice:0}){
    return `<div class="enq-est-row grid grid-cols-[minmax(0,1fr)_85px_120px_42px] gap-2 items-end">
      <div><label class="text-[10px] font-bold text-gray-500">Description</label><input name="description" value="${escHtml(item.description||'')}" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
      <div><label class="text-[10px] font-bold text-gray-500">Qty</label><input name="qty" type="number" min="0" step="1" value="${Number(item.qty||1)}" oninput="EnquiryEstimate.recalc()" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
      <div><label class="text-[10px] font-bold text-gray-500">Unit £</label><input name="unitPrice" type="number" min="0" step="0.01" value="${Number(item.unitPrice||0).toFixed(2)}" oninput="EnquiryEstimate.recalc()" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
      <button type="button" onclick="this.closest('.enq-est-row').remove();EnquiryEstimate.recalc()" class="h-[38px] rounded-lg bg-red-50 text-red-700" title="Remove item">×</button>
    </div>`;
  }
  function open(id){
    const enquiry=(DB.enquiries||[]).find(x=>String(x.id)===String(id));
    if(!enquiry)return toast('Enquiry is no longer loaded','error');
    const previous=latest(enquiry);
    const version=nextVersion(enquiry);
    const issue=today();
    const validUntil=addDays(issue,14);
    const items=starterItems(enquiry);

    openModal(`<div class="p-6">
      <div class="flex justify-between gap-4 items-start mb-5">
        <div><p class="text-xs font-bold tracking-widest text-olive-600">CUSTOMER TAKEAWAY</p><h2 class="text-xl font-bold">Provisional Estimate</h2><p class="text-sm text-gray-500 mt-1">${escHtml(enquiry.name)} · ${escHtml(enquiry.eventType||'Event')} · ${enquiry.preferredDate?formatSalesDate(enquiry.preferredDate):'Date TBC'}</p></div>
        <button type="button" onclick="viewEnquiry('${id}')" class="p-2 rounded-lg bg-gray-100"><i data-lucide="x"></i></button>
      </div>
      <form id="enquiry-estimate-form-${id}" onsubmit="return EnquiryEstimate.saveAndPrint(event,'${id}')" class="space-y-4">
        <div class="grid sm:grid-cols-3 gap-3">
          <div><label class="text-xs font-medium text-gray-600">Estimate reference</label><input name="reference" value="${reference(enquiry,version)}" readonly class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm"></div>
          <div><label class="text-xs font-medium text-gray-600">Issue date</label><input name="issueDate" type="date" value="${issue}" required class="w-full px-3 py-2 border rounded-lg text-sm"></div>
          <div><label class="text-xs font-medium text-gray-600">Valid until</label><input name="validUntil" type="date" value="${validUntil}" required class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        </div>
        <div class="rounded-xl border bg-gray-50 p-3">
          <div class="flex justify-between items-center gap-3 mb-3"><div><h3 class="font-bold">Pricing</h3><p class="text-xs text-gray-500">Add whatever you discussed with the customer.</p></div><button type="button" onclick="EnquiryEstimate.addRow()" class="px-3 py-2 bg-white border rounded-lg text-xs font-bold">+ Add Item</button></div>
          <div id="enquiry-estimate-rows" class="space-y-2">${items.map(rowHtml).join('')}</div>
          <div class="flex justify-end mt-4"><div class="text-right"><small class="block text-xs text-gray-500">ESTIMATED TOTAL</small><strong id="enquiry-estimate-total" class="text-2xl">£0.00</strong></div></div>
        </div>
        <div><label class="text-xs font-medium text-gray-600">Customer-facing notes</label><textarea name="notes" rows="3" class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Any inclusions, choices still to confirm or helpful notes...">${escHtml(previous?.notes||'')}</textarea></div>
        <label class="flex items-start gap-2 rounded-lg bg-olive-50 border border-olive-100 p-3 text-xs text-olive-900"><input name="updateValue" type="checkbox" checked class="mt-0.5"><span><strong>Update enquiry estimated value</strong><br>Keep the sales pipeline aligned with the total on this estimate.</span></label>
        <p class="text-[11px] text-gray-500">The printed customer document is a provisional estimate, not a request for payment. Availability and final pricing remain subject to confirmation.</p>
        <div id="enquiry-estimate-status-${id}" class="hidden rounded-lg border px-3 py-2 text-xs"></div>
        <div class="grid sm:grid-cols-2 gap-2"><button type="button" onclick="EnquiryEstimate.preview('${id}')" class="py-2.5 bg-gray-100 rounded-lg font-medium">Preview Without Saving</button><button type="submit" class="py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save & Print Estimate</button></div>
      </form>
    </div>`);
    recalc();
    if(window.lucide)lucide.createIcons();
  }
  function addRow(){
    const rows=document.getElementById('enquiry-estimate-rows');if(!rows)return;
    rows.insertAdjacentHTML('beforeend',rowHtml());
    recalc();
  }
  function formData(id){
    const form=document.getElementById(`enquiry-estimate-form-${id}`);if(!form)return null;
    const rows=[...form.querySelectorAll('.enq-est-row')].map(row=>({
      description:String(row.querySelector('[name="description"]')?.value||'').trim(),
      qty:Number(row.querySelector('[name="qty"]')?.value||0),
      unitPrice:Number(row.querySelector('[name="unitPrice"]')?.value||0)
    })).filter(row=>row.description&&row.qty>0);
    const total=rows.reduce((sum,row)=>sum+(row.qty*row.unitPrice),0);
    return {form,rows,total,reference:form.reference.value,issueDate:form.issueDate.value,validUntil:form.validUntil.value,notes:String(form.notes.value||'').trim(),updateValue:Boolean(form.updateValue?.checked)};
  }
  function recalc(){
    const form=document.querySelector('[id^="enquiry-estimate-form-"]');if(!form)return;
    const id=form.id.replace('enquiry-estimate-form-',''),data=formData(id);
    const target=document.getElementById('enquiry-estimate-total');
    if(target&&data)target.textContent=money(data.total);
  }
  function docHtml(enquiry,data,version){
    const guestLine=Number(enquiry.guests||0)?`${Number(enquiry.guests)} guests`:'Guest numbers TBC';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${escHtml(enquiry.name)} · Provisional Estimate</title><style>
      @page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#243027;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.top{border-bottom:3px solid #607746;padding-bottom:9mm;display:flex;justify-content:space-between;gap:12mm}.brand small{font-size:8pt;letter-spacing:.16em;font-weight:800;color:#718057}.brand h1{font-family:Georgia,serif;font-weight:400;font-size:27pt;margin:2mm 0}.brand p,.ref p{font-size:8.5pt;color:#657064;margin:1mm 0}.ref{text-align:right}.ref strong{font-size:11pt}.intro{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin:8mm 0}.box{border:1px solid #dce2d8;border-radius:3mm;padding:4mm}.box small{font-size:6.5pt;text-transform:uppercase;letter-spacing:.1em;color:#74806f}.box strong{display:block;margin-top:1mm;font-size:10pt}.box p{font-size:8pt;line-height:1.45;margin:1mm 0 0}.estimate-title{font-family:Georgia,serif;font-size:18pt;margin:6mm 0 3mm}table{width:100%;border-collapse:collapse;font-size:9pt}th{background:#607746;color:white;text-align:left;padding:3mm}td{padding:3.2mm 3mm;border-bottom:1px solid #e3e6e0}th:nth-child(2),th:nth-child(3),th:nth-child(4),td:nth-child(2),td:nth-child(3),td:nth-child(4){text-align:right}.total{display:flex;justify-content:flex-end;margin-top:4mm}.total div{min-width:65mm;background:#f3f6ef;border:1px solid #dce2d8;border-radius:3mm;padding:4mm;text-align:right}.total small{font-size:7pt;color:#6b7568}.total strong{display:block;font-size:19pt;margin-top:1mm}.notes{margin-top:7mm;border-left:3px solid #caa64a;background:#fbfaf4;padding:4mm;font-size:8.5pt;line-height:1.5}.terms{margin-top:8mm;border-top:1px solid #d8ddd5;padding-top:4mm;font-size:7.5pt;color:#667064;line-height:1.5}.footer{margin-top:9mm;display:flex;justify-content:space-between;border-top:1px solid #e0e4de;padding-top:3mm;font-size:7pt;color:#7b8378}</style></head><body>
      <div class="top"><div class="brand"><small>THE GRANARY AT WINDMILL FARM</small><h1>Provisional Estimate</h1><p>A tailored price guide for your event</p></div><div class="ref"><strong>${escHtml(data.reference)}</strong><p>Version ${version}</p><p>Issued ${new Date(data.issueDate+'T12:00').toLocaleDateString('en-GB')}</p><p>Valid until ${new Date(data.validUntil+'T12:00').toLocaleDateString('en-GB')}</p></div></div>
      <div class="intro"><div class="box"><small>Prepared for</small><strong>${escHtml(enquiry.name)}</strong><p>${escHtml(enquiry.email||'')}${enquiry.phone?`<br>${escHtml(enquiry.phone)}`:''}</p></div><div class="box"><small>Your event</small><strong>${escHtml(enquiry.eventType||'Event')}</strong><p>${enquiry.preferredDate?new Date(enquiry.preferredDate+'T12:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'Date to be confirmed'}<br>${escHtml(guestLine)}</p></div></div>
      <h2 class="estimate-title">Your estimated event price</h2>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${data.rows.map(row=>`<tr><td><strong>${escHtml(row.description)}</strong></td><td>${row.qty}</td><td>${money(row.unitPrice)}</td><td>${money(row.qty*row.unitPrice)}</td></tr>`).join('')}</tbody></table>
      <div class="total"><div><small>PROVISIONAL TOTAL</small><strong>${money(data.total)}</strong></div></div>
      ${data.notes?`<div class="notes"><strong>Notes from your event coordinator</strong><br>${escHtml(data.notes).replace(/\n/g,'<br>')}</div>`:''}
      <div class="terms"><strong>About this estimate</strong><br>This document gives you something tangible to take away while considering your event. It is a provisional estimate rather than an invoice or confirmed booking. Your date remains subject to availability and prices may change if guest numbers, menus, drinks, décor or other requirements change. A booking is only confirmed once the venue's normal booking requirements have been completed.</div>
      <div class="footer"><span>The Granary at Windmill Farm</span><span>${escHtml(data.reference)}</span></div>
    </body></html>`;
  }
  function printDoc(enquiry,data,version){
    const win=window.open('','_blank');
    if(!win){toast('Allow pop-ups to print the estimate','error');return false;}
    win.document.write(docHtml(enquiry,data,version));win.document.close();win.focus();setTimeout(()=>win.print(),250);return true;
  }
  function preview(id){
    const enquiry=(DB.enquiries||[]).find(x=>String(x.id)===String(id));const data=formData(id);
    if(!enquiry||!data)return;
    if(!data.rows.length)return toast('Add at least one priced item','error');
    printDoc(enquiry,data,nextVersion(enquiry));
  }
  async function saveAndPrint(event,id){
    event.preventDefault();
    const enquiry=(DB.enquiries||[]).find(x=>String(x.id)===String(id));const data=formData(id);
    const status=document.getElementById(`enquiry-estimate-status-${id}`);
    const show=(msg,error=false)=>{if(!status)return;status.className=`rounded-lg border px-3 py-2 text-xs ${error?'bg-red-50 border-red-200 text-red-700':'bg-olive-50 border-olive-200 text-olive-800'}`;status.textContent=msg;};
    if(!enquiry||!data)return false;
    if(!data.rows.length){show('Add at least one priced item before saving.','error');return false;}
    const version=nextVersion(enquiry);
    const saved={version,reference:data.reference,issueDate:data.issueDate,validUntil:data.validUntil,items:data.rows,total:data.total,notes:data.notes,generatedAt:new Date().toISOString()};
    const communications=(enquiry.comms||[]).filter(x=>x&&x.type!==TYPE);
    // Keep previous estimate history in one state record.
    communications.push({date:new Date().toISOString(),type:TYPE,data:{versions:[...records(enquiry),saved].slice(-30),...saved}});
    const updates={communications};
    if(data.updateValue)updates.value=data.total;
    show('Saving estimate…');
    const {error}=await supabaseClient.from('enquiries').update(updates).eq('id',enquiry.id);
    if(error){console.error('Enquiry estimate save failed',error);show(`Estimate could not be saved${error.message?`: ${error.message}`:''}`,'error');toast('Estimate could not be saved','error');return false;}
    await loadEnquiriesFromSupabase();
    const refreshed=(DB.enquiries||[]).find(x=>String(x.id)===String(id))||enquiry;
    printDoc(refreshed,data,version);
    toast(`Provisional estimate ${data.reference} saved`);
    return false;
  }
  function renderSummary(enquiry){
    const row=latest(enquiry);
    return `<section class="eqv2-work-card eqv2-span-all"><div class="eqv2-work-heading"><div><p class="eqv2-eyebrow olive">CUSTOMER ESTIMATE</p><h3>Give them something tangible to take away</h3></div><button onclick="EnquiryEstimate.open('${enquiry.id}')" class="eqv2-small-action"><i data-lucide="receipt-pound-sterling"></i>${row?'New Version':'Create Estimate'}</button></div><p class="eqv2-work-copy">Build a provisional price from individual line items before the customer commits to a booking.</p>${row?`<div class="eqv2-detail-grid"><div><small>Latest estimate</small><strong>${escHtml(row.reference||'')}</strong></div><div><small>Total</small><strong>${money(row.total)}</strong></div><div><small>Valid until</small><strong>${row.validUntil?new Date(row.validUntil+'T12:00').toLocaleDateString('en-GB'):'Not set'}</strong></div><div><small>Version</small><strong>${Number(row.version||1)}</strong></div></div>`:''}</section>`;
  }
  window.EnquiryEstimate={TYPE,open,addRow,recalc,preview,saveAndPrint,renderSummary,latest,records};
})();
