// ============================================================================
// WEDDING V2 — PHASE 4 · CALENDAR ENGINE
// ACTIVITIES, NEXT ACTIONS & CHASE ENGINE
// Every open enquiry must leave each interaction with a future action.
// Workflow metadata is stored in the existing communications JSON.
// ============================================================================
(function(){
  const STATE_TYPE='__ENQUIRY_SALES_ACTIVITY_STATE_V3__';
  const HIDDEN_TYPES=new Set([
    STATE_TYPE,
    '__ENQUIRY_EVENT_BRIEF_V2__',
    typeof ENQUIRY_WEDDING_DATA_TYPE!=='undefined'?ENQUIRY_WEDDING_DATA_TYPE:'__WEDDING_PREBOOK_DATA__'
  ]);
  const escx=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
  const today=()=>typeof todayStr!=='undefined'?todayStr:new Date().toISOString().slice(0,10);
  const add=(date,days)=>typeof addDaysToDate==='function'?addDaysToDate(date||today(),days):new Date(Date.now()+days*86400000).toISOString().slice(0,10);

  const OUTCOMES={
    call_connected:{label:'Called — spoke to customer',status:'Contacted',nextAction:'Complete agreed customer follow-up',days:2,activity:'Call connected'},
    call_no_answer:{label:'Called — no answer / voicemail',status:'Contacted',nextAction:'Send follow-up email',days:1,activity:'Call — no answer'},
    email_sent:{label:'Email sent',status:null,nextAction:'Call / chase email response',days:3,activity:'Email sent'},
    customer_replied:{label:'Customer replied',status:'Contacted',nextAction:'Complete agreed follow-up',days:2,activity:'Customer replied'},
    viewing_booked:{label:'Viewing / meeting booked',status:'Viewing Booked',nextAction:'Prepare for viewing / meeting',days:0,activity:'Viewing booked',requiresViewing:true},
    viewing_completed:{label:'Viewing / meeting completed',status:'Viewing Completed',nextAction:'Follow up after viewing',days:1,activity:'Viewing completed'},
    proposal_sent:{label:'Quote / proposal sent',status:'Quote Sent',nextAction:'Follow up proposal',days:3,activity:'Proposal sent'},
    customer_thinking:{label:'Customer considering options',status:'Follow Up Later',nextAction:'Check decision / answer questions',days:4,activity:'Decision pending'},
    provisional:{label:'Provisional date agreed',status:'Provisional Booking',nextAction:'Chase confirmation / deposit',days:2,activity:'Provisional booking',requiresExpiry:true},
    deposit_requested:{label:'Deposit requested',status:'Deposit Required',nextAction:'Chase deposit',days:2,activity:'Deposit requested'},
    custom:{label:'Other / custom activity',status:null,nextAction:'Follow up with this enquiry',days:1,activity:'Sales activity'}
  };

  function rawState(enquiry){
    const entry=[...(enquiry?.comms||[])].reverse().find(x=>x&&x.type===STATE_TYPE);
    return entry?.data&&typeof entry.data==='object'?entry.data:{};
  }
  function state(enquiry){
    const d=rawState(enquiry);
    return {
      viewingDate:d.viewingDate||'',
      viewingTime:d.viewingTime||'',
      provisionalExpiry:d.provisionalExpiry||'',
      proposalSentAt:d.proposalSentAt||'',
      depositRequestedAt:d.depositRequestedAt||'',
      lastOutcome:d.lastOutcome||'',
      lastOutcomeAt:d.lastOutcomeAt||'',
      nextActionSource:d.nextActionSource||'',
      activityCount:Number(d.activityCount||0)
    };
  }
  function visibleComms(enquiry){
    return (enquiry?.comms||[]).filter(x=>x&&!HIDDEN_TYPES.has(x.type));
  }
  function nextDefaults(outcome,form){
    const cfg=OUTCOMES[outcome]||OUTCOMES.custom;
    const viewingDate=form?.get('viewingDate')||'';
    const viewingTime=form?.get('viewingTime')||'';
    const expiry=form?.get('provisionalExpiry')||'';
    if(outcome==='viewing_booked'&&viewingDate){
      return {date:viewingDate,action:`Prepare for viewing${viewingTime?` at ${viewingTime}`:''}`};
    }
    if(outcome==='provisional'&&expiry){
      const chase=add(expiry,-2);
      return {date:chase<today()?today():chase,action:'Chase provisional booking before hold expires'};
    }
    return {date:add(today(),cfg.days),action:cfg.nextAction};
  }
  function outcomeOptions(){
    return [
      ['call_connected','Called — spoke to customer'],
      ['call_no_answer','Called — no answer / voicemail'],
      ['email_sent','Email sent'],
      ['customer_replied','Customer replied'],
      ['viewing_booked','Viewing / meeting booked'],
      ['viewing_completed','Viewing / meeting completed'],
      ['proposal_sent','Quote / proposal sent'],
      ['customer_thinking','Customer considering options'],
      ['provisional','Provisional date agreed'],
      ['deposit_requested','Deposit requested'],
      ['confirmed','Confirmed — deposit received'],
      ['lost','Lost enquiry'],
      ['custom','Other / custom activity']
    ];
  }

  function open(id,preset=''){
    const enquiry=DB.enquiries.find(x=>x.id===id);if(!enquiry)return;
    const st=state(enquiry);
    const defaultAction=enquiry.nextAction||'Follow up with this enquiry';
    const defaultDate=enquiry.nextFollowup||add(today(),1);
    openModal(`<div class="p-6 max-w-2xl">
      <div class="flex justify-between items-start gap-4 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-600">SALES ACTIVITY</p><h2 class="text-xl font-bold mt-1">${escx(enquiry.name)}</h2><p class="text-sm text-gray-500 mt-1">${escx(enquiry.status)} · Every live outcome must leave a next action.</p></div><button onclick="viewEnquiry('${id}')" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="x"></i></button></div>
      <form id="enquiry-activity-form-${id}" onsubmit="return EnquiryActivity.save(event,'${id}')" class="space-y-4">
        <label class="block"><span class="text-xs font-medium text-gray-600">What happened? *</span><select name="outcome" required onchange="EnquiryActivity.outcomeChanged(this,'${id}')" class="w-full px-3 py-2 border rounded-lg text-sm mt-1"><option value="">Select outcome</option>${outcomeOptions().map(([v,l])=>`<option value="${v}" ${preset===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <div id="eqp3-context-fields">
          <div data-context="viewing" class="hidden grid sm:grid-cols-2 gap-3">
            <label><span class="text-xs font-medium text-gray-600">Viewing / meeting date *</span><input name="viewingDate" type="date" disabled value="${escx(st.viewingDate)}" onchange="EnquiryActivity.checkCalendarConflict(this.form,'${id}')" class="w-full px-3 py-2 border rounded-lg text-sm mt-1"></label>
            <label><span class="text-xs font-medium text-gray-600">Viewing / meeting time *</span><input name="viewingTime" type="time" disabled value="${escx(st.viewingTime)}" onchange="EnquiryActivity.checkCalendarConflict(this.form,'${id}')" class="w-full px-3 py-2 border rounded-lg text-sm mt-1"></label>
          </div>
          <div data-context="provisional" class="hidden">
            <label><span class="text-xs font-medium text-gray-600">Provisional hold expiry *</span><input name="provisionalExpiry" type="date" disabled value="${escx(st.provisionalExpiry||add(today(),14))}" class="w-full px-3 py-2 border rounded-lg text-sm mt-1"><small class="text-gray-500">The chase will be scheduled before this date.</small></label>
          </div>
        </div>
        <div id="eqp4-calendar-conflict"></div>
        <input type="hidden" name="calendarOverride" value="">
        <input type="hidden" name="calendarOverrideReason" value="">
        <label class="block"><span class="text-xs font-medium text-gray-600">Contact / activity notes *</span><textarea name="note" rows="3" required class="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="What was discussed, objections, questions and what was agreed?"></textarea></label>
        <section class="rounded-xl bg-olive-50 border border-olive-100 p-4"><div class="flex justify-between gap-3"><div><p class="text-xs font-bold tracking-widest text-olive-700">NEXT ACTION</p><p class="text-xs text-gray-500 mt-1">Auto-filled from the outcome. Change it if the conversation agreed something different.</p></div><span class="text-[10px] font-bold text-red-700">REQUIRED WHILE LIVE</span></div>
          <div class="grid sm:grid-cols-[1fr_160px] gap-3 mt-3"><label><span class="text-xs font-medium text-gray-600">What happens next? *</span><input name="nextAction" required value="${escx(defaultAction)}" class="w-full px-3 py-2 border rounded-lg text-sm mt-1"></label><label><span class="text-xs font-medium text-gray-600">When? *</span><input name="nextDate" required type="date" value="${escx(defaultDate)}" class="w-full px-3 py-2 border rounded-lg text-sm mt-1"></label></div>
        </section>
        <div class="grid sm:grid-cols-4 gap-2">
          <button type="button" onclick="EnquiryActivity.quickNext(1)" class="eqp3-date">Tomorrow</button>
          <button type="button" onclick="EnquiryActivity.quickNext(2)" class="eqp3-date">+2 days</button>
          <button type="button" onclick="EnquiryActivity.quickNext(3)" class="eqp3-date">+3 days</button>
          <button type="button" onclick="EnquiryActivity.quickNext(7)" class="eqp3-date">+7 days</button>
        </div>
        <div id="enquiry-activity-status-${id}" class="hidden rounded-lg border px-3 py-2 text-xs"></div>
        <button id="enquiry-activity-submit-${id}" type="submit" class="w-full py-3 bg-olive-600 text-white rounded-lg font-semibold">Save Activity & Next Action</button>
      </form>
    </div>`);
    if(window.lucide)lucide.createIcons();
    setTimeout(()=>{
      const form=document.getElementById(`enquiry-activity-form-${id}`);
      const sel=form?.querySelector('[name="outcome"]');
      if(sel)outcomeChanged(sel,id);
    },0);
  }

  function outcomeChanged(select,id){
    const outcome=String(select?.value||''),cfg=OUTCOMES[outcome];
    const form=select?.form;
    if(!form)return;

    const viewingWrap=form.querySelector('[data-context="viewing"]');
    const provisionalWrap=form.querySelector('[data-context="provisional"]');
    const viewingActive=outcome==='viewing_booked';
    const provisionalActive=outcome==='provisional';

    viewingWrap?.classList.toggle('hidden',!viewingActive);
    provisionalWrap?.classList.toggle('hidden',!provisionalActive);

    ['viewingDate','viewingTime'].forEach(name=>{
      const input=form.querySelector(`[name="${name}"]`);
      if(!input)return;
      input.disabled=!viewingActive;
      input.required=viewingActive;
    });

    const expiry=form.querySelector('[name="provisionalExpiry"]');
    if(expiry){
      expiry.disabled=!provisionalActive;
      expiry.required=provisionalActive;
    }

    if(!viewingActive){
      const override=form.querySelector('[name="calendarOverride"]');
      const overrideReason=form.querySelector('[name="calendarOverrideReason"]');
      if(override)override.value='';
      if(overrideReason)overrideReason.value='';
      const host=document.getElementById('eqp4-calendar-conflict');
      if(host)host.innerHTML='';
    }

    if(!cfg)return;
    setTimeout(()=>{
      const defs=nextDefaults(outcome,new FormData(form));
      const a=form.querySelector('[name="nextAction"]'),d=form.querySelector('[name="nextDate"]');
      if(a)a.value=defs.action;
      if(d)d.value=defs.date;
    },0);
  }
  function quickNext(days){
    const input=document.querySelector('form [name="nextDate"]');if(input)input.value=add(today(),days);
  }


  function meetingCandidate(form,id){
    const date=form?.querySelector('[name="viewingDate"]')?.value||'';
    const time=form?.querySelector('[name="viewingTime"]')?.value||'';
    const enquiry=DB.enquiries.find(x=>x.id===id);
    return {id:`enquiry-${id}`,source:'meeting',date,time,durationMinutes:60,title:`${enquiry?.name||'Enquiry'} — Viewing / Meeting`};
  }
  function checkCalendarConflict(form,id){
    const host=document.getElementById('eqp4-calendar-conflict');
    if(!host||!window.WindmillCalendar?.conflictSummary)return {blocked:false,conflicts:[]};
    const candidate=meetingCandidate(form,id);
    if(!candidate.date||!candidate.time){host.innerHTML='';return {blocked:false,conflicts:[]};}
    const result=WindmillCalendar.conflictSummary(candidate,{source:'meeting',id:`enquiry-${id}`});
    if(!result.blocked){host.innerHTML='<div class="rounded-lg bg-green-50 border border-green-100 p-3 text-xs text-green-800"><strong>Calendar clear.</strong> No overlapping venue event was found at this time.</div>';return result;}
    const override=form.querySelector('[name="calendarOverride"]')?.value==='yes';
    host.innerHTML=`<div class="wmc-conflict-box"><h4>⚠ Calendar clash detected</h4><p>This viewing / meeting overlaps another calendar item. Normal save is blocked unless you deliberately override it.</p>${result.html}<div class="wmc-conflict-override"><label>Override reason *</label><textarea id="eqp4-override-reason" rows="2" placeholder="Why is this double booking safe / intentional?">${escx(form.querySelector('[name="calendarOverrideReason"]')?.value||'')}</textarea><button type="button" onclick="EnquiryActivity.applyCalendarOverride('${id}')">${override?'Update override reason':'Override clash & allow save'}</button></div></div>`;
    if(window.lucide)lucide.createIcons();
    return result;
  }
  function applyCalendarOverride(id){
    const form=document.querySelector('form[onsubmit*="EnquiryActivity.save"]');if(!form)return;
    const reason=String(document.getElementById('eqp4-override-reason')?.value||'').trim();
    if(!reason){toast('Add a reason before overriding the calendar clash','error');return;}
    form.querySelector('[name="calendarOverride"]').value='yes';
    form.querySelector('[name="calendarOverrideReason"]').value=reason;
    checkCalendarConflict(form,id);
    toast('Calendar clash override recorded — you can now save');
  }

  async function save(event,id){
    if(event?.preventDefault)event.preventDefault();

    const formEl=document.getElementById(`enquiry-activity-form-${id}`)
      ||event?.currentTarget
      ||event?.target?.closest?.('form');
    const submit=document.getElementById(`enquiry-activity-submit-${id}`)||event?.submitter;
    const statusEl=document.getElementById(`enquiry-activity-status-${id}`);
    const originalText=submit?.textContent;

    const showStatus=(message,type='info')=>{
      if(!statusEl)return;
      statusEl.className=`rounded-lg border px-3 py-2 text-xs ${
        type==='error'?'bg-red-50 border-red-200 text-red-700':
        type==='success'?'bg-olive-50 border-olive-200 text-olive-800':
        'bg-blue-50 border-blue-200 text-blue-700'
      }`;
      statusEl.textContent=message;
    };

    try{
      if(!formEl)throw new Error('Activity form could not be found. Close it, reopen the enquiry and try again.');

      // Ensure conditional field validation reflects the currently selected outcome
      // before asking the browser to validate anything.
      const outcomeSelect=formEl.querySelector('[name="outcome"]');
      if(outcomeSelect)outcomeChanged(outcomeSelect,id);

      if(typeof formEl.reportValidity==='function'&&!formEl.reportValidity()){
        showStatus('Complete the required fields before saving.','error');
        return false;
      }

      const enquiry=(DB.enquiries||[]).find(x=>String(x.id)===String(id));
      if(!enquiry)throw new Error('This enquiry is no longer loaded. Refresh and try again.');

      const form=new FormData(formEl);
      const outcome=String(form.get('outcome')||'').trim();
      const note=String(form.get('note')||'').trim();

      if(!outcome){showStatus('Choose what happened before saving.','error');return false;}
      if(!note){showStatus('Add the contact / activity notes before saving.','error');return false;}

      if(outcome==='lost'){openLostReasonForm(id,note);return false;}
      if(outcome==='confirmed'){openRezlynxReferenceForm(id);return false;}

      const cfg=OUTCOMES[outcome]||OUTCOMES.custom;
      const nextAction=String(form.get('nextAction')||'').trim();
      const nextDate=String(form.get('nextDate')||'').trim();
      if(!nextAction||!nextDate){showStatus('Every live enquiry needs a next action and date.','error');return false;}

      if(cfg.requiresViewing&&!form.get('viewingDate')){showStatus('Add the viewing / meeting date.','error');return false;}
      if(cfg.requiresViewing&&!form.get('viewingTime')){showStatus('Add the viewing / meeting time.','error');return false;}

      if(cfg.requiresViewing&&window.WindmillCalendar?.conflictSummary){
        const conflict=WindmillCalendar.conflictSummary(meetingCandidate(formEl,id),{source:'meeting',id:`enquiry-${id}`});
        if(conflict.blocked&&form.get('calendarOverride')!=='yes'){
          checkCalendarConflict(formEl,id);
          showStatus('Calendar clash — review it or use Override before saving.','error');
          return false;
        }
        if(conflict.blocked&&!String(form.get('calendarOverrideReason')||'').trim()){
          showStatus('An override reason is required for a calendar clash.','error');
          return false;
        }
      }

      if(cfg.requiresExpiry&&!form.get('provisionalExpiry')){
        showStatus('Add the provisional expiry date.','error');return false;
      }

      if(submit){submit.disabled=true;submit.textContent='Saving activity…';}
      showStatus('Saving activity and next action…');

      const st=state(enquiry);
      const nextState={
        ...st,
        lastOutcome:outcome,
        lastOutcomeAt:new Date().toISOString(),
        nextActionSource:'activity',
        activityCount:st.activityCount+1
      };
      if(outcome==='viewing_booked'){
        nextState.viewingDate=form.get('viewingDate');
        nextState.viewingTime=form.get('viewingTime')||'';
        nextState.calendarOverride=form.get('calendarOverride')==='yes';
        nextState.calendarOverrideReason=String(form.get('calendarOverrideReason')||'').trim();
      }
      if(outcome==='viewing_completed'&&!nextState.viewingDate)nextState.viewingDate=today();
      if(outcome==='proposal_sent')nextState.proposalSentAt=new Date().toISOString();
      if(outcome==='provisional')nextState.provisionalExpiry=form.get('provisionalExpiry');
      if(outcome==='deposit_requested')nextState.depositRequestedAt=new Date().toISOString();

      const communications=(enquiry.comms||[]).filter(x=>x&&x.type!==STATE_TYPE);
      communications.push({
        date:new Date().toISOString(),
        type:cfg.activity,
        note: outcome==='viewing_booked'&&String(form.get('calendarOverrideReason')||'').trim()
          ? `${note} · Calendar clash override: ${String(form.get('calendarOverrideReason')).trim()}`
          : note,
        outcome,
        nextAction,
        nextFollowup:nextDate
      });
      communications.push({date:new Date().toISOString(),type:STATE_TYPE,data:nextState});

      let status=cfg.status||enquiry.status;
      if(outcome==='email_sent'&&enquiry.status==='New Enquiry')status='Contacted';

      const updates={
        status,
        last_contact:today(),
        contact_attempts:Number(enquiry.contactAttempts||0)+1,
        first_contacted_at:enquiry.firstContactedAt||today(),
        next_action:nextAction,
        next_followup:nextDate,
        followup_stage:outcome,
        communications
      };

      const result=await supabaseClient.from('enquiries').update(updates).eq('id',id);
      if(result.error){
        console.error('Enquiry activity save failed',result.error);
        throw new Error(result.error.message||'Supabase rejected the enquiry update');
      }

      await loadEnquiriesFromSupabase();
      showStatus(`Saved. Next action: ${nextAction} · ${nextDate}`,'success');
      toast('Activity saved — next action scheduled');
      setTimeout(()=>{
        closeModal();
        if(typeof renderSection==='function')renderSection();
      },450);
      return false;
    }catch(error){
      console.error('Enquiry activity save failed',error);
      const message=String(error?.message||error||'Unknown error');
      showStatus(`Could not save: ${message}`,'error');
      toast(`Sales activity could not be saved: ${message}`,'error');
      return false;
    }finally{
      if(submit&&submit.isConnected){
        submit.disabled=false;
        submit.textContent=originalText||'Save Activity & Next Action';
      }
    }
  }
  function quickButtons(enquiry){
    if(!enquiry||!['New Enquiry','Contacted','Brochure Sent','Viewing Booked','Viewing Completed','Quote Sent','Provisional Booking','Deposit Required','Follow Up Later'].includes(enquiry.status))return '';
    const buttons=[];
    if(enquiry.status==='New Enquiry'||enquiry.status==='Contacted')buttons.push(['call_connected','phone','Log Call'],['email_sent','mail','Email Sent']);
    if(!['Viewing Booked','Viewing Completed','Quote Sent','Provisional Booking','Deposit Required'].includes(enquiry.status))buttons.push(['viewing_booked','calendar-plus','Book Viewing']);
    if(enquiry.status==='Viewing Booked')buttons.push(['viewing_completed','calendar-check','Viewing Done']);
    if(['Viewing Completed','Contacted','Brochure Sent','Follow Up Later'].includes(enquiry.status))buttons.push(['proposal_sent','file-check-2','Proposal Sent']);
    if(['Quote Sent','Viewing Completed','Follow Up Later'].includes(enquiry.status))buttons.push(['provisional','calendar-clock','Provisional']);
    if(enquiry.status==='Provisional Booking')buttons.push(['deposit_requested','wallet-cards','Request Deposit']);
    return `<div class="eqp3-quick-actions">${buttons.slice(0,4).map(([o,icon,label])=>`<button onclick="EnquiryActivity.open('${enquiry.id}','${o}')"><i data-lucide="${icon}"></i>${label}</button>`).join('')}</div>`;
  }

  function chaseReason(enquiry){
    const st=state(enquiry),now=today(),reasons=[];
    if(st.viewingDate&&enquiry.status==='Viewing Booked'&&st.viewingDate<now)reasons.push('Viewing date has passed but the enquiry is still marked Viewing Booked.');
    if(st.provisionalExpiry&&enquiry.status==='Provisional Booking'){
      const days=Math.ceil((new Date(st.provisionalExpiry+'T12:00:00')-new Date(now+'T12:00:00'))/86400000);
      if(days<=2)reasons.push(days<0?'Provisional hold has expired.':`Provisional hold expires in ${days} day${days===1?'':'s'}.`);
    }
    if(st.proposalSentAt&&enquiry.status==='Quote Sent'){
      const sent=String(st.proposalSentAt).slice(0,10);
      const days=Math.floor((new Date(now+'T12:00:00')-new Date(sent+'T12:00:00'))/86400000);
      if(days>=3)reasons.push(`Proposal sent ${days} days ago.`);
    }
    return reasons;
  }

  window.EnquiryActivity={STATE_TYPE,HIDDEN_TYPES,OUTCOMES,state,visibleComms,open,save,outcomeChanged,quickNext,quickButtons,chaseReason,checkCalendarConflict,applyCalendarOverride};
  // Replace the older outcome modal with the Phase 3 activity workflow.
  window.openFollowupOutcome=(id)=>open(id);
  window.saveFollowupOutcome=save;
})();
