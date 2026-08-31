
// ============================================================================
// WINDMILL FARM — FUNCTIONS CENTRE
// Meetings, conferences, parties, wakes, community events and other functions.
// ============================================================================

let functionsTablesReady = true;
let functionsLoaded = false;
let functionsRepairRunning = false;
let opportunityFunctionRepairRunning = false;
let activeFunctionId = '';
let activeFunctionTab = 'overview';
let functionListMode = 'active';

const FUNCTION_TYPES = [
  'Corporate Meeting','Conference','Training','Birthday Party','Engagement Party',
  'Anniversary','Baby Shower','Christening','Wake','Community Event',
  'Private Party','Christmas Party','Other'
];

const MEETING_TYPES = ['Corporate Meeting','Conference','Training'];

const MEETING_PACKAGES = {
  'Flexible Meeting Package': {
    rate:15,
    basis:'delegate',
    source:'Meeting & Conference Guide',
    inclusions:[
      'Private meeting room','Screen & projector','Complimentary Wi-Fi',
      'Unlimited tea & coffee','Flipchart & pens'
    ]
  },
  'Standard Day Delegate Package': {
    rate:25,
    basis:'delegate',
    source:'Meeting & Conference Guide',
    inclusions:[
      'Private room hire','Screen, projector & PA system','Flipchart & pens',
      'Complimentary Wi-Fi','Delegate stationery (pad & pen)',
      'Unlimited tea & coffee throughout the day','Dedicated events team support',
      'Free on-site parking','Buffet, carvery or breakfast food options',
      'Breakout rooms','LCD screen branding welcome slide',
      'Microphone & lectern setup','Room setup tailored to chosen layout'
    ]
  },
  'Enhanced Day Delegate Package': {
    rate:35,
    basis:'delegate',
    source:'Meeting & Conference Guide',
    inclusions:[
      'Everything in Standard Day Delegate Package','Additional buffet platters',
      'Pastries & breakfast rolls on arrival','Biscuits throughout the day',
      'Bottled water','Event host support throughout the day',
      'Post-meeting drinks packages available','Stage setup included'
    ]
  },
  'Bespoke / Room Hire': {
    rate:0,
    basis:'custom',
    source:'Custom',
    inclusions:[]
  }
};

const MEETING_ENHANCEMENTS = {
  'Bacon rolls on arrival':4,
  'Pastries':2,
  'Upgrade buffet lunch to Carvery & Cake Lunch':4.49,
  'Afternoon cake':3.49,
  'Fruit bowl for 6 people':11.95,
  'Bottle still / sparkling water 200ml':2.95,
  'Extra staff member per hour':20,
  'Full stage':200
};

const FUNCTION_TASKS_MEETING = [
  ['Confirm BK reference','Booking','High'],
  ['Confirm final delegate numbers','Planning','High'],
  ['Confirm Day Delegate / meeting package','Commercial','High'],
  ['Confirm room layout','Room Setup','High'],
  ['Confirm arrival, start and finish times','Planning','High'],
  ['Confirm projector requirement','AV & Equipment','High'],
  ['Confirm TV 1 requirement','AV & Equipment','Medium'],
  ['Confirm TV 2 requirement','AV & Equipment','Medium'],
  ['Confirm microphones / PA / lectern','AV & Equipment','Medium'],
  ['Confirm flipchart and stationery','AV & Equipment','Medium'],
  ['Confirm welcome slide / screen branding','AV & Equipment','Medium'],
  ['Confirm tea, coffee and arrival refreshments','Food & Drink','High'],
  ['Confirm lunch / catering','Food & Drink','High'],
  ['Confirm dietary requirements','Food & Drink','High'],
  ['Confirm breakout room requirement','Room Setup','Medium'],
  ['Confirm parking / arrival information','Planning','Low'],
  ['Confirm final invoice / payment','Payments','High'],
  ['Complete function sheet','Operations','High'],
  ['Complete on-day handover','Operations','High']
];

const FUNCTION_TASKS_EVENT = [
  ['Confirm BK reference','Booking','High'],
  ['Confirm final guest numbers','Planning','High'],
  ['Confirm arrival, start and finish times','Planning','High'],
  ['Confirm food / buffet choice','Food & Drink','High'],
  ['Confirm dietary requirements','Food & Drink','High'],
  ['Confirm drinks / bar requirements','Food & Drink','Medium'],
  ['Confirm room layout','Room Setup','High'],
  ['Confirm decorations / balloons','Room Setup','Medium'],
  ['Confirm cake arrangements','Room Setup','Medium'],
  ['Confirm DJ / entertainment','Entertainment','Medium'],
  ['Confirm AV / microphone requirements','AV & Equipment','Medium'],
  ['Confirm running order','Planning','High'],
  ['Confirm final invoice / payment','Payments','High'],
  ['Complete function sheet','Operations','High'],
  ['Complete on-day handover','Operations','High']
];

function isMeetingFunction(fn){
  return MEETING_TYPES.includes(fn?.eventType);
}

function functionMoney(value){
  return '£'+Number(value||0).toLocaleString('en-GB',{minimumFractionDigits:0,maximumFractionDigits:2});
}

function functionDate(value){
  if(!value)return 'Date TBC';
  return new Date(value+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
}

function functionDaysTo(date){
  if(!date)return null;
  const today=new Date(currentDateStr()+'T12:00:00');
  const target=new Date(date+'T12:00:00');
  return Math.ceil((target-today)/86400000);
}

function functionTasksFor(id){
  return (DB.functionTasks||[]).filter(task=>task.functionId===id);
}


async function repairFunctionsFromConfirmedEnquiries(){
  if(functionsRepairRunning)return;
  functionsRepairRunning=true;
  try{
    const confirmed=(DB.enquiries||[]).filter(enquiry=>
      enquiry.status==='Confirmed Booking' &&
      enquiry.eventType!=='Wedding' &&
      String(enquiry.rezlynxReference||'').trim()
    );

    for(const enquiry of confirmed){
      const ref=String(enquiry.rezlynxReference||'').trim().toUpperCase();

      const existsByRef=(DB.functions||[]).some(fn=>String(fn.bookingReference||'').toUpperCase()===ref);
      const existsByEnquiry=(DB.functions||[]).some(fn=>fn.enquiryId===enquiry.id);

      if(!existsByRef&&!existsByEnquiry){
        try{
          await ensureFunctionFromEnquiry(enquiry);
        }catch(error){
          console.error('Auto-repair could not create Function from confirmed enquiry:',enquiry,error);
        }
      }
    }
  }finally{
    functionsRepairRunning=false;
  }
}

function functionOutstanding(fn){
  return Math.max(0,Number(fn.quotedValue||0)-Number(fn.amountPaid||0));
}

function functionPlanningHealth(fn){
  const tasks=functionTasksFor(fn.id);
  if(!tasks.length)return 0;
  return Math.round(tasks.filter(t=>t.completed).length/tasks.length*100);
}

function functionAttention(fn){
  if(fn.status==='Provisional'){
    const hold=fn.planning?.booking?.holdUntil||'';
    if(hold&&hold<currentDateStr())return {tone:'red',label:'Provisional hold expired',detail:'Chase the customer or release the date.'};
    if(hold===currentDateStr())return {tone:'amber',label:'Provisional chase due today',detail:'Contact the customer and confirm next steps.'};
    return {tone:'amber',label:'Provisional booking',detail:hold?`Hold until ${hold}`:'Awaiting confirmation / BK reference'};
  }
  const overdue=functionTasksFor(fn.id).filter(t=>!t.completed&&t.dueDate&&t.dueDate<currentDateStr());
  if(overdue.length)return {tone:'red',label:`${overdue.length} overdue task${overdue.length===1?'':'s'}`,detail:overdue[0].title};
  if(!fn.bookingReference)return {tone:'red',label:'BK reference missing',detail:'Booking must be linked to Rezlynx.'};
  const open=functionTasksFor(fn.id).filter(t=>!t.completed);
  const days=functionDaysTo(fn.eventDate);
  if(days!==null&&days<=14&&open.length)return {tone:'amber',label:`${days===0?'Today':days+' days to go'}`,detail:`${open.length} planning action${open.length===1?'':'s'} still open`};
  if(!fn.coordinator)return {tone:'amber',label:'Coordinator required',detail:'Assign ownership of this booking.'};
  return {tone:'green',label:'On track',detail:`${functionPlanningHealth(fn)}% complete`};
}

async function loadFunctionsFromSupabase(){
  if(!supabaseClient)return;
  const {data,error}=await supabaseClient.from('functions').select('*').order('event_date',{ascending:true});
  if(error){
    console.warn('Functions tables are not ready:',error);
    functionsTablesReady=false;
    DB.functions=[];
    DB.functionTasks=[];
    functionsLoaded=true;
    return;
  }
  functionsTablesReady=true;
  DB.functions=(data||[]).map(row=>({
    id:row.id,enquiryId:row.enquiry_id||'',bookingReference:row.booking_reference||'',
    clientName:row.client_name||'',eventType:row.event_type||'Other',eventDate:row.event_date||'',
    startTime:row.start_time||'',endTime:row.end_time||'',guests:Number(row.guests||0),
    coordinator:row.coordinator||'',status:row.status||'Planning',quotedValue:Number(row.quoted_value||0),
    amountPaid:Number(row.amount_paid||0),packageName:row.package_name||'',room:row.room||'',
    notes:row.notes||'',planning:row.planning_data&&typeof row.planning_data==='object'?row.planning_data:{},
    archivedAt:row.archived_at||'',createdAt:row.created_at||''
  }));

  if(DB.functions.length){
    const ids=DB.functions.map(x=>x.id);
    const taskResult=await supabaseClient.from('function_tasks').select('*').in('function_id',ids).order('sort_order',{ascending:true});
    DB.functionTasks=taskResult.error?[]:(taskResult.data||[]).map(row=>({
      id:row.id,functionId:row.function_id,title:row.title||'',category:row.category||'Planning',
      dueDate:row.due_date||'',priority:row.priority||'Medium',assignedTo:row.assigned_to||'',
      completed:!!row.completed,completedAt:row.completed_at||'',notes:row.notes||'',sortOrder:Number(row.sort_order||0)
    }));
  }else DB.functionTasks=[];

  functionsLoaded=true;

  // Keep Functions self-healing: if a confirmed non-wedding enquiry has a BK
  // reference but no Function record, repair the transfer automatically.
  if(!functionsRepairRunning){
    setTimeout(()=>repairFunctionsFromConfirmedEnquiries(),50);
  }
  if(!opportunityFunctionRepairRunning){
    setTimeout(()=>repairFunctionsFromWonOpportunities(),120);
  }

  if(currentSection==='functions')renderSection();
}

async function ensureTransferredFunctionTasks(functionId,enquiry){
  const {data:existingTasks,error:taskReadError}=await supabaseClient
    .from('function_tasks')
    .select('id')
    .eq('function_id',functionId)
    .limit(1);

  if(taskReadError){
    console.warn('Could not check Function planning tasks:',taskReadError);
    return;
  }
  if(existingTasks?.length)return;

  const template=MEETING_TYPES.includes(enquiry.eventType)?FUNCTION_TASKS_MEETING:FUNCTION_TASKS_EVENT;
  const eventDate=enquiry.preferredDate?new Date(enquiry.preferredDate+'T12:00:00'):null;
  const taskRows=template.map(([title,category,priority],index)=>{
    let due=null;
    if(eventDate){
      const copy=new Date(eventDate);
      const daysBefore=index<3?28:index<12?14:7;
      copy.setDate(copy.getDate()-daysBefore);
      due=copy.toISOString().slice(0,10);
    }
    return {
      function_id:functionId,
      title,category,priority,due_date:due,
      assigned_to:enquiry.staff||null,
      sort_order:index
    };
  });

  const {error}=await supabaseClient.from('function_tasks').insert(taskRows);
  if(error)console.warn('Function task template could not be created:',error);
}


function functionEnquiryTransferSnapshot(enquiry){
  const brief=window.EnquiryEventBrief?.data?EnquiryEventBrief.data(enquiry):{};
  const activity=window.EnquiryActivity?.state?EnquiryActivity.state(enquiry):{};
  return {
    enquirySnapshot:{
      email:enquiry.email||'',
      phone:enquiry.phone||'',
      source:enquiry.source||'',
      notes:enquiry.notes||'',
      budget:Number(enquiry.budget||0),
      probability:Number(enquiry.probability||0),
      priority:enquiry.priority||'',
      originalStatus:enquiry.status||''
    },
    preBookingBrief:brief,
    salesHandoff:{
      viewingDate:activity.viewingDate||'',
      viewingTime:activity.viewingTime||'',
      provisionalExpiry:activity.provisionalExpiry||'',
      proposalSentAt:activity.proposalSentAt||'',
      depositRequestedAt:activity.depositRequestedAt||'',
      lastOutcome:activity.lastOutcome||''
    }
  };
}

async function ensureFunctionFromEnquiry(enquiry){
  if(!enquiry||enquiry.status!=='Confirmed Booking'||enquiry.eventType==='Wedding')return null;

  const ref=String(enquiry.rezlynxReference||'').trim().toUpperCase();
  if(!/^BK[A-Z0-9-]+$/.test(ref)){
    toast('A valid BK reference is required before this booking can transfer to Functions','error');
    return null;
  }

  // IMPORTANT: query Supabase directly. The local DB may be stale or may not yet
  // contain a Function created in another browser/session.
  let existingRow=null;

  const byReference=await supabaseClient
    .from('functions')
    .select('*')
    .eq('booking_reference',ref)
    .maybeSingle();

  if(byReference.error){
    console.error('Could not check Functions by BK reference:',byReference.error);
    toast(`Could not check the Functions register: ${byReference.error.message||'Supabase error'}`,'error');
    return null;
  }
  existingRow=byReference.data||null;

  if(!existingRow&&enquiry.id){
    const byEnquiry=await supabaseClient
      .from('functions')
      .select('*')
      .eq('enquiry_id',enquiry.id)
      .maybeSingle();

    if(byEnquiry.error){
      console.error('Could not check Functions by enquiry:',byEnquiry.error);
      toast(`Could not check the linked Function record: ${byEnquiry.error.message||'Supabase error'}`,'error');
      return null;
    }
    existingRow=byEnquiry.data||null;
  }

  const transferSnapshot=functionEnquiryTransferSnapshot(enquiry);
  const brief=transferSnapshot.preBookingBrief||{};
  const commonUpdate={
    enquiry_id:enquiry.id,
    booking_reference:ref,
    client_name:enquiry.name,
    event_type:enquiry.eventType||'Other',
    event_date:enquiry.preferredDate||null,
    start_time:brief.startTime||brief.arrivalTime||null,
    end_time:brief.finishTime||null,
    guests:Number(enquiry.guests||0),
    coordinator:enquiry.staff||null,
    status:'Confirmed',
    quoted_value:Number(enquiry.value||0)
  };

  let functionRow=existingRow;

  if(existingRow){
    // Link/update the existing booking rather than attempting another insert.
    const mergedPlanning={...(existingRow.planning_data&&typeof existingRow.planning_data==='object'?existingRow.planning_data:{}),...transferSnapshot};
    const {data,error}=await supabaseClient
      .from('functions')
      .update({...commonUpdate,planning_data:mergedPlanning})
      .eq('id',existingRow.id)
      .select()
      .single();

    if(error){
      console.error('Could not link confirmed enquiry to existing Function:',error);
      toast(`Function record found but could not be linked: ${error.message||'Supabase error'}`,'error');
      return null;
    }
    functionRow=data;
  }else{
    const record={
      ...commonUpdate,
      amount_paid:0,
      package_name:isMeetingFunction({eventType:enquiry.eventType})?'Standard Day Delegate Package':null,
      planning_data:transferSnapshot
    };

    let insertResult=await supabaseClient.from('functions').insert(record).select().single();

    // Race/old-record safety: if the BK already exists, retrieve it and link it.
    if(insertResult.error&&String(insertResult.error.code)==='23505'){
      const retry=await supabaseClient
        .from('functions')
        .select('*')
        .eq('booking_reference',ref)
        .maybeSingle();

      if(retry.error||!retry.data){
        console.error('Duplicate BK exists but could not be retrieved:',insertResult.error,retry.error);
        toast('This BK reference already exists in Functions but the record could not be opened','error');
        return null;
      }

      const retryPlanning={...(retry.data.planning_data&&typeof retry.data.planning_data==='object'?retry.data.planning_data:{}),...transferSnapshot};
      const linked=await supabaseClient
        .from('functions')
        .update({...commonUpdate,planning_data:retryPlanning})
        .eq('id',retry.data.id)
        .select()
        .single();

      if(linked.error){
        console.error('Could not link existing duplicate BK Function:',linked.error);
        toast(`Existing Function could not be linked: ${linked.error.message||'Supabase error'}`,'error');
        return null;
      }
      functionRow=linked.data;
    }else if(insertResult.error){
      console.error('Could not create Function from confirmed enquiry:',insertResult.error);
      toast(`Booking confirmed, but Function record could not be created: ${insertResult.error.message||'Supabase error'}`,'error');
      return null;
    }else{
      functionRow=insertResult.data;
    }
  }

  await ensureTransferredFunctionTasks(functionRow.id,enquiry);
  await loadFunctionsFromSupabase();
  return DB.functions.find(fn=>fn.id===functionRow.id)||functionRow;
}


function opportunityToFunctionType(type){
  return {
    'Conference':'Conference',
    'Corporate Meeting':'Corporate Meeting',
    'Christmas Party':'Christmas Party',
    'Private Event':'Private Party',
    'Networking Event':'Community Event',
    'Private Dining':'Private Party',
    'Team Building':'Other',
    'Funeral / Wake':'Wake',
    'Other':'Other'
  }[type]||'Other';
}
function opportunityCreatesFunction(opportunity){
  return !!opportunity && opportunity.stage==='Won' &&
    !['Accommodation','Wedding Referral'].includes(opportunity.type);
}
function functionOpportunityTransferSnapshot(opportunity){
  const company=(DB.companies||[]).find(x=>x.id===opportunity.companyId);
  return {
    opportunitySource:{
      opportunityId:opportunity.id,
      opportunityTitle:opportunity.title||'',
      companyId:opportunity.companyId||'',
      companyName:company?.name||'',
      source:opportunity.source||'',
      originalType:opportunity.type||'',
      wonDate:opportunity.wonDate||'',
      expectedClose:opportunity.expectedClose||'',
      notes:opportunity.notes||'',
      transferredAt:new Date().toISOString()
    }
  };
}
async function ensureFunctionFromOpportunity(opportunity){
  if(!opportunityCreatesFunction(opportunity))return null;
  const ref=String(opportunity.bookingReference||'').trim().toUpperCase();
  if(!/^BK[A-Z0-9-]+$/.test(ref)){
    toast('A valid BK reference is required before a Won Opportunity can transfer to Functions','error');
    return null;
  }

  const eventDate=String(opportunity.eventDate||'').trim();
  if(!eventDate){
    toast('A confirmed event date is required before a Won Opportunity can transfer to Functions','error');
    return null;
  }

  const company=(DB.companies||[]).find(x=>x.id===opportunity.companyId);
  let existing=null;
  const byRef=await supabaseClient.from('functions').select('*').eq('booking_reference',ref).maybeSingle();
  if(byRef.error){console.error('Opportunity -> Function BK check failed',byRef.error);return null;}
  existing=byRef.data||null;

  if(!existing){
    // Also recognise a Function already transferred from this opportunity.
    const local=(DB.functions||[]).find(fn=>fn.planning?.opportunitySource?.opportunityId===opportunity.id);
    if(local){
      const byId=await supabaseClient.from('functions').select('*').eq('id',local.id).maybeSingle();
      if(!byId.error)existing=byId.data||null;
    }
  }

  const eventType=opportunityToFunctionType(opportunity.type);
  const snapshot=functionOpportunityTransferSnapshot(opportunity);
  const common={
    booking_reference:ref,
    client_name:company?.name||opportunity.title||'Opportunity Booking',
    event_type:eventType,
    event_date:eventDate,
    guests:0,
    coordinator:opportunity.assignedTo||null,
    status:'Confirmed',
    quoted_value:Number(opportunity.value||0)
  };
  let row;
  if(existing){
    const planning={...(existing.planning_data&&typeof existing.planning_data==='object'?existing.planning_data:{}),...snapshot};
    const result=await supabaseClient.from('functions').update({...common,planning_data:planning}).eq('id',existing.id).select().single();
    if(result.error){console.error('Opportunity -> existing Function update failed',result.error);toast('Opportunity won, but its Function could not be updated','error');return null;}
    row=result.data;
  }else{
    const record={...common,amount_paid:0,package_name:MEETING_TYPES.includes(eventType)?'Standard Day Delegate Package':null,planning_data:snapshot};
    const result=await supabaseClient.from('functions').insert(record).select().single();
    if(result.error){
      if(String(result.error.code)==='23505'){
        const retry=await supabaseClient.from('functions').select('*').eq('booking_reference',ref).maybeSingle();
        if(retry.data){
          const planning={...(retry.data.planning_data||{}),...snapshot};
          const linked=await supabaseClient.from('functions').update({...common,planning_data:planning}).eq('id',retry.data.id).select().single();
          if(!linked.error)row=linked.data;
        }
      }
      if(!row){console.error('Opportunity -> Function insert failed',result.error);toast('Opportunity won, but the Function record could not be created','error');return null;}
    }else row=result.data;
  }

  try{
    await ensureTransferredFunctionTasks(row.id,{
      eventType,
      preferredDate:eventDate,
      staff:opportunity.assignedTo||''
    });
  }catch(taskError){
    console.error('Transferred Function created/linked but task generation failed',taskError);
    toast('Function created / linked, but its follow-up tasks need checking','error');
  }
  await loadFunctionsFromSupabase();
  return DB.functions.find(x=>x.id===row.id)||row;
}
window.ensureFunctionFromOpportunity=ensureFunctionFromOpportunity;

async function repairFunctionsFromWonOpportunities(){
  if(opportunityFunctionRepairRunning||functionsRepairRunning)return;
  opportunityFunctionRepairRunning=true;
  try{
    const won=(DB.opportunities||[]).filter(opportunityCreatesFunction);
    for(const opportunity of won){
      const ref=String(opportunity.bookingReference||'').trim().toUpperCase();
      if(!/^BK[A-Z0-9-]+$/.test(ref))continue;
      const existsByRef=(DB.functions||[]).some(fn=>String(fn.bookingReference||'').trim().toUpperCase()===ref);
      const existsByOpportunity=(DB.functions||[]).some(fn=>fn.planning?.opportunitySource?.opportunityId===opportunity.id);
      if(!existsByRef&&!existsByOpportunity){
        try{await ensureFunctionFromOpportunity(opportunity)}catch(error){console.error('Won Opportunity repair failed',opportunity,error)}
      }
    }
  }finally{opportunityFunctionRepairRunning=false;}
}

function renderFunctions(){
  if(!functionsLoaded){
    setTimeout(()=>loadFunctionsFromSupabase(),0);
    return `<div class="section-card"><div class="flex items-center gap-3"><i data-lucide="loader-circle" class="animate-spin"></i><div><h3 class="font-bold">Loading Functions Centre</h3><p class="text-sm text-gray-500">Retrieving meetings, conferences and events…</p></div></div></div>`;
  }
  if(!functionsTablesReady){
    return `<div class="section-card max-w-3xl"><h3 class="font-bold">Functions setup required</h3><p class="text-sm text-gray-600 mt-1">Run <strong>setup-functions-centre.sql</strong> in Supabase, then refresh.</p></div>`;
  }

  const all=(DB.functions||[]);
  const active=all.filter(fn=>functionListMode==='archived'?!!fn.archivedAt:!fn.archivedAt);
  const upcoming=active.filter(fn=>{
    const d=functionDaysTo(fn.eventDate);return d!==null&&d>=0;
  }).sort((a,b)=>String(a.eventDate).localeCompare(String(b.eventDate)));
  const thisWeek=upcoming.filter(fn=>functionDaysTo(fn.eventDate)<=7);
  const attention=active.filter(fn=>functionAttention(fn).tone!=='green');
  const value=active.reduce((s,fn)=>s+Number(fn.quotedValue||0),0);
  const outstanding=active.reduce((s,fn)=>s+functionOutstanding(fn),0);

  setTimeout(()=>filterFunctions(),0);

  return `<div class="fc-shell">
    <section class="fc-hero">
      <div><p class="fc-eyebrow">MEETINGS · EVENTS · PARTIES</p><h2>Functions Centre</h2><p>Every confirmed non-wedding booking, linked to its Rezlynx BK reference and operational plan.</p></div>
      <div class="fc-actions">
        <button onclick="repairConfirmedBookingTransfers(true)" class="secondary"><i data-lucide="refresh-cw"></i>Check Transfers</button>
        <button onclick="openFunctionForm()" class="secondary"><i data-lucide="plus"></i>New Function</button>
      </div>
    </section>

    <section class="fc-kpis">
      ${functionKpi('Upcoming',upcoming.length,'calendar-range','olive',`${thisWeek.length} in next 7 days`)}
      ${functionKpi('Needs Attention',attention.length,'alert-circle',attention.length?'red':'green',attention.length?'Planning actions outstanding':'All on track')}
      ${functionKpi('Booked Value',functionMoney(value),'pound-sterling','gold','Active functions')}
      ${functionKpi('Outstanding',functionMoney(outstanding),'credit-card',outstanding?'red':'green','Remaining to collect')}
      ${functionKpi('Meetings / Conferences',active.filter(isMeetingFunction).length,'presentation','teal','Day delegate & corporate bookings')}
    </section>

    <section class="fc-main-grid">
      <article class="fc-panel">
        <div class="fc-panel-head"><div><p class="fc-eyebrow olive">THIS WEEK</p><h3>Operational Forward Look</h3><span>What the team needs to prepare next.</span></div></div>
        <div class="fc-upcoming">${(upcoming.slice(0,7).map(renderFunctionRow).join(''))||'<div class="fc-empty"><strong>No upcoming functions yet.</strong><br><span>Confirmed non-wedding enquiries with a BK reference will appear here automatically.</span></div>'}</div>
      </article>
      <article class="fc-panel">
        <div class="fc-panel-head"><div><p class="fc-eyebrow olive">CONTROL CENTRE</p><h3>Needs Attention</h3><span>Bookings ranked by missing information or overdue tasks.</span></div></div>
        <div class="fc-attention">${(attention.slice(0,6).map(renderFunctionAttention).join(''))||'<div class="fc-empty">Nothing urgent.</div>'}</div>
      </article>
    </section>

    <section class="fc-panel">
      <div class="fc-panel-head all">
        <div><p class="fc-eyebrow olive">ALL BOOKINGS</p><h3>Functions</h3><span>Meetings, conferences, wakes, parties and other events.</span></div>
        <div class="flex gap-2"><button onclick="functionListMode='active';renderSection()" class="${functionListMode==='active'?'fc-active':''}">Active</button><button onclick="functionListMode='archived';renderSection()" class="${functionListMode==='archived'?'fc-active':''}">Archive</button></div>
      </div>
      <div class="fc-filters">
        <div class="fc-search"><i data-lucide="search"></i><input id="function-search" oninput="filterFunctions()" placeholder="Search client, BK reference, type, room…"></div>
        <select id="function-type-filter" onchange="filterFunctions()"><option value="">All types</option>${FUNCTION_TYPES.map(t=>`<option>${t}</option>`).join('')}</select>
        <select id="function-status-filter" onchange="filterFunctions()"><option value="">All statuses</option>${['Planning','Ready','Completed','Cancelled'].map(t=>`<option>${t}</option>`).join('')}</select>
        <select id="function-owner-filter" onchange="filterFunctions()"><option value="">All coordinators</option>${[...new Set(active.map(x=>x.coordinator).filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join('')}</select>
      </div>
      <div id="function-list" class="fc-list"></div>
    </section>
  </div>`;
}

function functionKpi(label,value,icon,tone,sub){
  return `<article><span class="${tone}"><i data-lucide="${icon}"></i></span><div><small>${label}</small><strong>${value}</strong><p>${sub}</p></div></article>`;
}

function renderFunctionRow(fn){
  const att=functionAttention(fn);
  return `<button onclick="openFunctionWorkspace('${fn.id}')" class="fc-row">
    <div class="fc-date"><strong>${fn.eventDate?new Date(fn.eventDate+'T12:00:00').getDate():'—'}</strong><span>${fn.eventDate?new Date(fn.eventDate+'T12:00:00').toLocaleDateString('en-GB',{month:'short'}).toUpperCase():'TBC'}</span></div>
    <div class="fc-row-main"><div><strong>${esc(fn.clientName)}</strong><span class="fc-type">${esc(fn.eventType)}</span></div><small>${esc(fn.bookingReference||'BK missing')} · ${fn.guests} guests · ${esc(fn.room||'Room TBC')}</small></div>
    <div class="fc-health"><strong>${functionPlanningHealth(fn)}%</strong><small>${att.label}</small></div>
    <div class="fc-value"><strong>${functionMoney(fn.quotedValue)}</strong><small>${functionMoney(functionOutstanding(fn))} outstanding</small></div>
  </button>`;
}

function renderFunctionAttention(fn){
  const a=functionAttention(fn);
  return `<button onclick="openFunctionWorkspace('${fn.id}')" class="fc-att-row ${a.tone}">
    <span><i data-lucide="${a.tone==='red'?'alert-circle':a.tone==='amber'?'clock':'check-circle'}"></i></span>
    <div><strong>${esc(fn.clientName)}</strong><small>${esc(a.label)} · ${esc(a.detail)}</small></div>
    <em>${functionDate(fn.eventDate)}</em>
  </button>`;
}

function filterFunctions(){
  const q=(document.getElementById('function-search')?.value||'').toLowerCase();
  const type=document.getElementById('function-type-filter')?.value||'';
  const status=document.getElementById('function-status-filter')?.value||'';
  const owner=document.getElementById('function-owner-filter')?.value||'';
  const rows=(DB.functions||[]).filter(fn=>{
    if(functionListMode==='active'&&fn.archivedAt)return false;
    if(functionListMode==='archived'&&!fn.archivedAt)return false;
    const hay=[fn.clientName,fn.bookingReference,fn.eventType,fn.room,fn.coordinator].join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(!type||fn.eventType===type)&&(!status||fn.status===status)&&(!owner||fn.coordinator===owner);
  }).sort((a,b)=>String(a.eventDate||'9999-12-31').localeCompare(String(b.eventDate||'9999-12-31')));
  const el=document.getElementById('function-list');if(!el)return;
  el.innerHTML=rows.length?rows.map(renderFunctionCard).join(''):'<div class="fc-empty">No functions match these filters.</div>';
  if(window.lucide)lucide.createIcons();
}

function renderFunctionCard(fn){
  const att=functionAttention(fn);
  return `<button onclick="openFunctionWorkspace('${fn.id}')" class="fc-card">
    <div class="fc-card-head"><div><strong>${esc(fn.clientName)}</strong><span>${esc(fn.eventType)}</span></div><span class="fc-status ${att.tone}">${esc(att.label)}</span></div>
    <div class="fc-card-grid">
      <div><small>Date</small><strong>${functionDate(fn.eventDate)}</strong></div>
      <div><small>BK Reference</small><strong>${esc(fn.bookingReference||'Missing')}</strong>${fn.enquiryId?'<span class="block text-[10px] text-olive-600 mt-1">Linked from Enquiries</span>':''}</div>
      <div><small>Guests</small><strong>${fn.guests}</strong></div>
      <div><small>Coordinator</small><strong>${esc(fn.coordinator||'Unassigned')}</strong></div>
      <div><small>Package</small><strong>${esc(fn.packageName||'Bespoke')}</strong></div>
      <div><small>Value</small><strong>${functionMoney(fn.quotedValue)}</strong></div>
    </div>
  </button>`;
}

function openFunctionWorkspace(id){
  activeFunctionId=id;activeFunctionTab='overview';
  if(window.AppRouter)AppRouter.commit(`/functions/${encodeURIComponent(id)}/overview`);
  let panel=document.getElementById('function-workspace-panel');
  if(!panel){
    panel=document.createElement('div');panel.id='function-workspace-panel';
    panel.className='fixed inset-0 z-[90] bg-[#f7f7f4] overflow-y-auto';
    document.body.appendChild(panel);
  }
  renderFunctionWorkspace();
}

function closeFunctionWorkspace(){
  document.getElementById('function-workspace-panel')?.remove();
  activeFunctionId='';
  if(window.AppRouter)AppRouter.commit('/functions');
  renderSection();
}

function setFunctionTab(tab){activeFunctionTab=tab;if(window.AppRouter&&activeFunctionId)AppRouter.commit(`/functions/${encodeURIComponent(activeFunctionId)}/${encodeURIComponent(tab)}`);renderFunctionWorkspace();}

function canPermanentlyDeleteFunction(){
  const role=String(window.currentUserProfile?.role||'').toLowerCase();
  return ['owner','admin'].includes(role);
}

async function cancelFunctionBooking(id){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  if(!confirm(`Cancel ${fn.clientName}? The record will be kept for history.`))return;

  const {error}=await supabaseClient
    .from('functions')
    .update({status:'Cancelled'})
    .eq('id',id);

  if(error){
    console.error(error);
    toast('Function could not be cancelled','error');
    return;
  }

  await loadFunctionsFromSupabase();
  activeFunctionId=id;
  renderFunctionWorkspace();
  toast('Function marked as cancelled');
}

async function archiveFunctionBooking(id){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  if(!confirm(`Archive ${fn.clientName}? It will move out of Active Functions.`))return;

  const {error}=await supabaseClient
    .from('functions')
    .update({archived_at:new Date().toISOString()})
    .eq('id',id);

  if(error){
    console.error(error);
    toast('Function could not be archived','error');
    return;
  }

  closeFunctionWorkspace();
  await loadFunctionsFromSupabase();
  renderSection();
  toast('Function archived');
}

async function restoreFunctionBooking(id){
  const {error}=await supabaseClient
    .from('functions')
    .update({archived_at:null})
    .eq('id',id);

  if(error){
    console.error(error);
    toast('Function could not be restored','error');
    return;
  }

  await loadFunctionsFromSupabase();
  activeFunctionId=id;
  renderFunctionWorkspace();
  toast('Function restored');
}

async function permanentlyDeleteFunction(id){
  if(!canPermanentlyDeleteFunction()){
    toast('Only an Owner/Admin can permanently delete a Function','error');
    return;
  }

  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  const answer=prompt(
    `PERMANENT DELETE\n\nThis is for test/duplicate records only.\nType DELETE to permanently remove "${fn.clientName}".`
  );
  if(answer!=='DELETE')return;

  const {error}=await supabaseClient
    .from('functions')
    .delete()
    .eq('id',id);

  if(error){
    console.error(error);
    toast('Function could not be permanently deleted','error');
    return;
  }

  // function_tasks are removed by ON DELETE CASCADE in Supabase.
  closeFunctionWorkspace();
  await loadFunctionsFromSupabase();
  renderSection();
  toast('Function permanently deleted');
}


function rezlynxClean(value){
  if(value===null||value===undefined)return '';
  return String(value).trim();
}
function rezlynxLine(label,value){
  value=rezlynxClean(value);
  return value?`${label}: ${value}`:'';
}
function rezlynxPlanning(fn,key){
  const value=fn?.planning?.[key];
  if(value===null||value===undefined)return '';
  if(typeof value==='string')return value.trim();
  if(Array.isArray(value))return value.filter(Boolean).join('\n');
  if(typeof value==='object'){
    return Object.entries(value)
      .filter(([,v])=>v!==null&&v!==undefined&&v!==''&&v!==false)
      .map(([k,v])=>`${k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}: ${Array.isArray(v)?v.join(', '):v}`)
      .join('\n');
  }
  return String(value);
}

function buildRezlynxFunctionSections(fn){
  const p=fn.planning||{};
  const req=p.requirements||{}, room=p.roomSetup||{}, av=p.av||{}, food=p.food||{},
        run=p.runningOrder||{}, accom=p.accommodation||{}, notes=p.notesSection||{};

  const booking=[
    fn.eventType||'',
    fn.packageName?`Package: ${fn.packageName}`:'',
    req.summary||'',
    fn.notes||''
  ].filter(Boolean).join('\n');

  const roomText=[
    room.layout&&`Layout: ${room.layout}`,
    room.room&&`Room / Space: ${room.room}`,
    room.tables&&`Tables / Seating: ${room.tables}`,
    room.breakouts&&`Breakout Rooms: ${room.breakouts}`,
    room.arrival&&`Registration / Arrival Setup: ${room.arrival}`,
    room.signage&&`Signage / Welcome Information: ${room.signage}`
  ].filter(Boolean).join('\n');

  const equipment=[
    av.projector&&'Projector: Required',
    av.tv1&&'TV 1: Required',
    av.tv2&&'TV 2: Required',
    av.pa&&'PA / Microphone: Required',
    av.lectern&&'Lectern: Required',
    av.flipchart&&'Flipchart & Pens: Required',
    av.welcomeSlide&&'Welcome Slide / Screen Branding: Required',
    av.stage&&'Stage: Required',
    av.wifi&&'Wi-Fi: Required',
    av.breakout&&'Breakout Room: Required',
    av.notes&&`AV / Equipment Notes: ${av.notes}`,
    av.presenter&&`Presenter / Organiser Contact: ${av.presenter}`
  ].filter(Boolean).join('\n');

  const foodText=[
    food.catering&&`Catering / Menu Choice: ${food.catering}`,
    food.refreshments&&`Tea / Coffee / Refreshments: ${food.refreshments}`,
    food.dietary&&`Dietary Requirements: ${food.dietary}`,
    food.drinks&&`Drinks / Bar: ${food.drinks}`
  ].filter(Boolean).join('\n');

  const runText=[
    run.arrival&&`Arrival: ${run.arrival}`,
    run.start&&`Event Starts: ${run.start}`,
    run.food&&`Food Service: ${run.food}`,
    run.speeches&&`Speeches / Presentations: ${run.speeches}`,
    run.entertainment&&`Entertainment: ${run.entertainment}`,
    run.finish&&`Finish / Room Clear: ${run.finish}`
  ].filter(Boolean).join('\n');

  const noteText=[
    notes.customer&&`Customer Notes: ${notes.customer}`,
    notes.internal&&`Internal Operational Notes: ${notes.internal}`,
    notes.handover&&`On-Day Handover Notes: ${notes.handover}`
  ].filter(Boolean).join('\n');

  const quote=fn.planning?.quoteBuilder||{};
  const quoteLines=Array.isArray(quote.lines)?quote.lines:[];
  const billing=[
    `Quoted Value: ${functionMoney(fn.quotedValue)}`,
    `Amount Paid: ${functionMoney(fn.amountPaid)}`,
    `Outstanding: ${functionMoney(functionOutstanding(fn))}`,
    quoteLines.length?'':null,
    quoteLines.length?'Quote Breakdown:':null,
    ...quoteLines.map(line=>`- ${line.description||line.category}: ${Number(line.quantity||0)} x ${functionMoney(line.unitPrice)} = ${functionMoney(Number(line.quantity||0)*Number(line.unitPrice||0))}`),
    quote.billingNotes?`Billing Instructions: ${quote.billingNotes}`:null
  ].filter(x=>x!==null).join('\n');

  const accomText=[
    accom.rooms&&`Rooms / Room Numbers: ${accom.rooms}`,
    accom.names&&`Guest Names: ${accom.names}`,
    accom.dates&&`Stay Dates: ${accom.dates}`,
    accom.notes&&`Accommodation Notes: ${accom.notes}`
  ].filter(Boolean).join('\n');

  return [
    ['Booking Description',booking],
    ['Room Setup',roomText],
    ['Equipment',equipment],
    ['Food and Drink',foodText],
    ['Order of Events / Timetable',runText],
    ['Other Notes',noteText],
    ['Prices & Billing Instructions',billing],
    ['Accommodation',accomText]
  ];
}

function buildRezlynxFunctionText(fn){
  return buildRezlynxFunctionSections(fn)
    .map(([title,body])=>`${title.toUpperCase()}\n${body||''}`)
    .join('\n\n');
}

async function copyFunctionForRezlynx(id){
  const fn=(DB.functions||[]).find(x=>x.id===id);
  if(!fn)return;

  const sections=buildRezlynxFunctionSections(fn);
  const boxes=[...document.querySelectorAll('[data-rezlynx-box]')];
  const copyText=boxes.length
    ? boxes.map((box,index)=>`${sections[index][0].toUpperCase()}\n${box.value.trim()}`).join('\n\n')
    : buildRezlynxFunctionText(fn);
  try{
    await navigator.clipboard.writeText(copyText);
    toast('Rezlynx notes copied — ready to paste');
  }catch(error){
    console.error(error);
    const area=document.getElementById('rezlynxCopyText');
    if(area){area.focus();area.select();}
    toast('Select the text and copy it manually','error');
  }
}

function openRezlynxTransfer(id){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  const copyText=buildRezlynxFunctionText(fn);
  const modal=document.createElement('div');
  modal.id='rezlynxTransferModal';
  modal.className='fixed inset-0 z-[100] bg-black/45 flex items-center justify-center p-4';
  modal.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div class="p-5 border-b flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">REZLYNX TRANSFER</p>
          <h2 class="text-xl font-bold mt-1">${esc(fn.clientName||'Function')}</h2>
          <p class="text-sm text-gray-500 mt-1">A clean Function Sheet-style summary. Review it, then copy and paste into Rezlynx.</p>
        </div>
        <button onclick="document.getElementById('rezlynxTransferModal').remove()" class="text-2xl leading-none px-2">×</button>
      </div>
      <div class="p-5 overflow-auto space-y-4">
        ${buildRezlynxFunctionSections(fn).map(([title,body],index)=>`
          <section class="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div class="px-4 py-2.5 bg-gray-100 border-b font-bold text-sm">${title}</div>
            <textarea data-rezlynx-box="${index}" class="w-full min-h-[125px] p-4 text-sm leading-6 border-0 outline-none resize-y" placeholder="Nothing recorded yet.">${esc(body||'')}</textarea>
          </section>`).join('')}
        <textarea id="rezlynxCopyText" class="hidden">${esc(copyText)}</textarea>
      </div>
      <div class="p-5 border-t flex justify-end gap-3">
        <button onclick="document.getElementById('rezlynxTransferModal').remove()" class="px-4 py-2 border rounded-lg font-semibold">Close</button>
        <button onclick="copyFunctionForRezlynx('${fn.id}')" class="px-5 py-2 bg-olive-600 text-white rounded-lg font-semibold">Copy for Rezlynx</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}


function functionInvoiceStore(fn){
  const invoices=fn?.planning?.invoices;
  return Array.isArray(invoices)?invoices:[];
}

function nextFunctionInvoiceNumber(fn){
  const invoices=functionInvoiceStore(fn);
  const next=invoices.length+1;
  const ref=String(fn.bookingReference||'FUNCTION').replace(/[^A-Z0-9-]/gi,'').toUpperCase();
  return `${ref}-INV-${String(next).padStart(2,'0')}`;
}

function invoiceDateGB(value){
  if(!value)return '';
  const d=new Date(value+'T12:00:00');
  return d.toLocaleDateString('en-GB');
}

function invoiceMoney(value){
  return '£'+Number(value||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function invoiceLineTotal(line){
  return Number(line.quantity||0)*Number(line.unitPrice||0);
}

function invoiceTotals(lines,vatRate=20){
  const gross=lines.reduce((sum,line)=>sum+invoiceLineTotal(line),0);
  // The current Windmill Farm Excel invoice shows customer-facing prices as VAT-inclusive.
  const net=vatRate?gross/(1+(vatRate/100)):gross;
  const tax=gross-net;
  return {net,tax,gross};
}

function functionInvoiceDefaults(fn){
  const today=currentDateStr();
  const company=fn.planning?.invoiceCustomer||{};
  return {
    invoiceNumber:nextFunctionInvoiceNumber(fn),
    invoiceDate:today,
    customerCompany:company.company||fn.clientName||'',
    customerName:company.contact||'',
    address1:company.address1||'',
    address2:company.address2||'',
    address3:company.address3||'',
    postcode:company.postcode||'',
    poNumber:company.poNumber||'',
    guestName:company.guestName||fn.clientName||'',
    room:fn.room||'',
    bookingReference:fn.bookingReference||'',
    arrival:fn.eventDate||'',
    departure:fn.eventDate||'',
    vatRate:20,
    notes:fn.planning?.quoteBuilder?.billingNotes||'',
    lines:defaultInvoiceLines(fn)
  };
}

function defaultInvoiceLines(fn){
  const quoteLines=fn?.planning?.quoteBuilder?.lines;
  if(Array.isArray(quoteLines)&&quoteLines.length){
    return quoteLines.map(line=>({
      date:fn.eventDate||'',
      description:line.description||line.category||'Function charge',
      quantity:Number(line.quantity||0),
      unitPrice:Number(line.unitPrice||0)
    }));
  }
  const lines=[];
  const guests=Number(fn.guests||0);
  const packageInfo=MEETING_PACKAGES[fn.packageName];
  if(packageInfo&&Number(packageInfo.rate||0)>0){
    lines.push({date:fn.eventDate||'',description:fn.packageName,quantity:guests||1,unitPrice:Number(packageInfo.rate||0)});
  }
  return lines.length?lines:[{date:fn.eventDate||'',description:'',quantity:guests||1,unitPrice:0}];
}

function invoiceFormLine(line={},index=0){
  return `<div class="invoice-line grid grid-cols-[130px_1fr_95px_120px_42px] gap-2 items-end" data-invoice-line>
    <label class="text-xs font-medium text-gray-600">Date
      <input type="date" data-field="date" value="${esc(line.date||'')}" class="mt-1 w-full px-2.5 py-2 border rounded-lg text-sm">
    </label>
    <label class="text-xs font-medium text-gray-600">Description
      <input data-field="description" value="${esc(line.description||'')}" placeholder="Day delegate rate…" class="mt-1 w-full px-2.5 py-2 border rounded-lg text-sm">
    </label>
    <label class="text-xs font-medium text-gray-600">Qty
      <input type="number" step=".01" min="0" data-field="quantity" value="${Number(line.quantity||0)}" oninput="refreshFunctionInvoiceTotals()" class="mt-1 w-full px-2.5 py-2 border rounded-lg text-sm">
    </label>
    <label class="text-xs font-medium text-gray-600">Price each
      <input type="number" step=".01" min="0" data-field="unitPrice" value="${Number(line.unitPrice||0)}" oninput="refreshFunctionInvoiceTotals()" class="mt-1 w-full px-2.5 py-2 border rounded-lg text-sm">
    </label>
    <button type="button" onclick="this.closest('[data-invoice-line]').remove();refreshFunctionInvoiceTotals()" class="mb-0.5 h-[38px] rounded-lg bg-red-50 text-red-700 font-bold">×</button>
  </div>`;
}

function collectFunctionInvoiceDraft(){
  const modal=document.getElementById('functionInvoiceModal');
  if(!modal)return null;
  const get=name=>modal.querySelector(`[name="${name}"]`)?.value?.trim()||'';
  const lines=[...modal.querySelectorAll('[data-invoice-line]')].map(row=>({
    date:row.querySelector('[data-field="date"]')?.value||'',
    description:row.querySelector('[data-field="description"]')?.value?.trim()||'',
    quantity:Number(row.querySelector('[data-field="quantity"]')?.value||0),
    unitPrice:Number(row.querySelector('[data-field="unitPrice"]')?.value||0)
  })).filter(line=>line.description||line.unitPrice||line.quantity);

  return {
    invoiceNumber:get('invoiceNumber'),
    invoiceDate:get('invoiceDate'),
    customerCompany:get('customerCompany'),
    customerName:get('customerName'),
    address1:get('address1'),
    address2:get('address2'),
    address3:get('address3'),
    postcode:get('postcode'),
    poNumber:get('poNumber'),
    guestName:get('guestName'),
    room:get('room'),
    bookingReference:get('bookingReference'),
    arrival:get('arrival'),
    departure:get('departure'),
    vatRate:Number(modal.querySelector('[name="vatRate"]')?.value||20),
    notes:get('notes'),
    lines
  };
}

function refreshFunctionInvoiceTotals(){
  const draft=collectFunctionInvoiceDraft();
  if(!draft)return;
  const totals=invoiceTotals(draft.lines,draft.vatRate);
  const net=document.getElementById('invoiceNetTotal');
  const tax=document.getElementById('invoiceTaxTotal');
  const gross=document.getElementById('invoiceGrossTotal');
  if(net)net.textContent=invoiceMoney(totals.net);
  if(tax)tax.textContent=invoiceMoney(totals.tax);
  if(gross)gross.textContent=invoiceMoney(totals.gross);
}

function addFunctionInvoiceLine(){
  const list=document.getElementById('functionInvoiceLines');
  if(!list)return;
  const fn=(DB.functions||[]).find(x=>x.id===activeFunctionId);
  list.insertAdjacentHTML('beforeend',invoiceFormLine({date:fn?.eventDate||'',description:'',quantity:1,unitPrice:0},list.children.length));
  refreshFunctionInvoiceTotals();
}

function addFunctionInvoicePreset(description,price){
  const list=document.getElementById('functionInvoiceLines');
  const fn=(DB.functions||[]).find(x=>x.id===activeFunctionId);
  if(!list||!fn)return;
  list.insertAdjacentHTML('beforeend',invoiceFormLine({
    date:fn.eventDate||'',
    description,
    quantity:Number(fn.guests||1),
    unitPrice:Number(price||0)
  },list.children.length));
  refreshFunctionInvoiceTotals();
}

function openFunctionInvoiceGenerator(id,invoiceIndex=''){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;

  const existing=invoiceIndex!==''?functionInvoiceStore(fn)[Number(invoiceIndex)]:null;
  const draft=existing?JSON.parse(JSON.stringify(existing)):functionInvoiceDefaults(fn);
  const presets=[
    ...Object.entries(MEETING_ENHANCEMENTS),
    ['Room hire',0],
    ['Additional catering',0],
    ['Other charge',0]
  ];

  const modal=document.createElement('div');
  modal.id='functionInvoiceModal';
  modal.className='fixed inset-0 z-[140] bg-black/50 flex items-center justify-center p-3';
  modal.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col">
      <div class="p-5 border-b flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">FUNCTION INVOICE</p>
          <h2 class="text-xl font-bold mt-1">${existing?'Edit Invoice':'Generate Invoice'} — ${esc(fn.clientName)}</h2>
          <p class="text-sm text-gray-500 mt-1">Designed around the Windmill Farm Excel invoice, but built into the Function record.</p>
        </div>
        <button onclick="document.getElementById('functionInvoiceModal').remove()" class="text-2xl px-2">×</button>
      </div>

      <div class="p-5 overflow-auto space-y-5">
        <section class="grid lg:grid-cols-2 gap-4">
          <div class="border rounded-xl p-4">
            <h3 class="font-bold">Invoice / Customer</h3>
            <div class="grid sm:grid-cols-2 gap-3 mt-3">
              <label class="text-xs font-medium text-gray-600">Invoice Number<input name="invoiceNumber" value="${esc(draft.invoiceNumber||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Invoice Date<input name="invoiceDate" type="date" value="${esc(draft.invoiceDate||currentDateStr())}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Company<input name="customerCompany" value="${esc(draft.customerCompany||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Contact / c/o<input name="customerName" value="${esc(draft.customerName||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600 sm:col-span-2">Address line 1<input name="address1" value="${esc(draft.address1||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Address line 2<input name="address2" value="${esc(draft.address2||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Address line 3<input name="address3" value="${esc(draft.address3||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Postcode<input name="postcode" value="${esc(draft.postcode||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">PO Number<input name="poNumber" value="${esc(draft.poNumber||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
            </div>
          </div>

          <div class="border rounded-xl p-4">
            <h3 class="font-bold">Booking</h3>
            <div class="grid sm:grid-cols-2 gap-3 mt-3">
              <label class="text-xs font-medium text-gray-600">Guest / Company<input name="guestName" value="${esc(draft.guestName||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Room<input name="room" value="${esc(draft.room||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">BK Booking Reference<input name="bookingReference" value="${esc(draft.bookingReference||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm uppercase"></label>
              <label class="text-xs font-medium text-gray-600">VAT Rate (%)<input name="vatRate" type="number" step=".01" value="${Number(draft.vatRate||20)}" oninput="refreshFunctionInvoiceTotals()" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Arrival<input name="arrival" type="date" value="${esc(draft.arrival||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
              <label class="text-xs font-medium text-gray-600">Departure<input name="departure" type="date" value="${esc(draft.departure||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
            </div>
          </div>
        </section>

        <section class="border rounded-xl p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div><h3 class="font-bold">Charges</h3><p class="text-xs text-gray-500 mt-1">Prices are treated as VAT-inclusive, matching the current Excel invoice.</p></div>
            <button type="button" onclick="addFunctionInvoiceLine()" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm font-semibold">+ Add Charge</button>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">${presets.map(([name,price])=>`<button type="button" onclick="addFunctionInvoicePreset('${String(name).replace(/'/g,"\\'")}',${Number(price||0)})" class="px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs">${esc(name)}${price?` · ${invoiceMoney(price)}`:''}</button>`).join('')}</div>
          <div id="functionInvoiceLines" class="space-y-3 mt-4">${(draft.lines||[]).map((line,index)=>invoiceFormLine(line,index)).join('')}</div>
        </section>

        <section class="grid md:grid-cols-[1fr_360px] gap-4">
          <label class="text-xs font-medium text-gray-600">Invoice Notes / Billing Instructions<textarea name="notes" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(draft.notes||'')}</textarea></label>
          <div class="bg-gray-50 border rounded-xl p-4 space-y-2 text-sm">
            <div class="flex justify-between"><span>Net</span><strong id="invoiceNetTotal">£0.00</strong></div>
            <div class="flex justify-between"><span>VAT</span><strong id="invoiceTaxTotal">£0.00</strong></div>
            <div class="flex justify-between border-t pt-3 text-base"><span>Balance Due</span><strong id="invoiceGrossTotal">£0.00</strong></div>
          </div>
        </section>
      </div>

      <div class="p-5 border-t flex flex-wrap justify-end gap-3">
        <button onclick="document.getElementById('functionInvoiceModal').remove()" class="px-4 py-2 border rounded-lg font-semibold">Close</button>
        <button onclick="previewFunctionInvoice('${fn.id}')" class="px-4 py-2 bg-gray-100 rounded-lg font-semibold">Preview Invoice</button>
        <button onclick="saveFunctionInvoice('${fn.id}',${existing?Number(invoiceIndex):-1})" class="px-5 py-2 bg-olive-600 text-white rounded-lg font-semibold">Save Invoice</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  refreshFunctionInvoiceTotals();
}

function buildFunctionInvoiceHTML(fn,draft){
  const totals=invoiceTotals(draft.lines||[],draft.vatRate||20);
  const logo='data:image/png;base64,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';
  const customerAddress=[
    draft.customerCompany,draft.customerName,draft.address1,draft.address2,draft.address3,draft.postcode
  ].filter(Boolean);

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(draft.invoiceNumber||'Invoice')}</title>
  <style>
    @page{size:A4;margin:14mm}
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;font-size:12px}
    .page{max-width:800px;margin:auto}.top{display:grid;grid-template-columns:1.1fr .9fr;gap:36px}
    h1{font-size:30px;margin:0;text-align:right}.venue{font-weight:700;font-size:16px;border-bottom:1.5px solid #111;padding-bottom:8px}
    .muted{line-height:1.5;margin-top:16px}.bank{display:grid;grid-template-columns:105px 1fr;gap:4px 8px;margin-top:20px}
    .bank b{font-weight:700}.details{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:24px}
    .row{display:grid;grid-template-columns:100px 1fr;border-bottom:1px solid #333;padding:3px 0}.row b{font-weight:700}
    table{width:100%;border-collapse:collapse;margin-top:24px}th{border-top:1.5px solid #111;border-bottom:1.5px solid #111;text-align:left;padding:6px 4px}
    td{padding:5px 4px;vertical-align:top}.num{text-align:right}.balance{border-top:1.5px solid #111;border-bottom:1.5px solid #111;margin-top:70px;padding:7px 4px;display:flex;justify-content:flex-end;gap:70px;font-weight:700;font-size:14px}
    .tax{margin-top:28px}.tax-grid{display:grid;grid-template-columns:1fr 120px 120px 120px;margin-top:8px}.tax-grid div{padding:3px}
    .legal{text-align:center;margin-top:40px;line-height:1.45}.logo{display:block;max-width:190px;max-height:105px;object-fit:contain;margin:24px auto 0}
    .notes{margin-top:18px;border-top:1px solid #aaa;padding-top:10px;white-space:pre-wrap}.actions{position:fixed;right:18px;top:18px}
    .actions button{padding:10px 14px;border:0;border-radius:7px;background:#18202b;color:#fff;font-weight:700;cursor:pointer}
    @media print{.actions{display:none}}
  </style></head><body><div class="actions"><button onclick="window.print()">Print / Save PDF</button></div><div class="page">
    <div class="top">
      <div>
        <div class="venue">Windmill Farm</div>
        <div class="muted">Whisby Road<br>Lincoln, Lincolnshire<br>United Kingdom<br>LN6 3QZ<br><br>01522 686878<br>6395@greeneking.co.uk</div>
      </div>
      <div>
        <h1>Invoice</h1>
        <div class="bank">
          <b>Sort Code</b><span>30-00-02</span>
          <b>Account No</b><span>00525222</span>
          <b>Bank</b><span>Lloyds</span>
          <b>Account Name</b><span>Greene King Brewing &amp; Retailing Limited</span>
          <b>Reference</b><span>6395</span>
        </div>
      </div>
    </div>

    <div class="details">
      <div>${customerAddress.map((v,i)=>`<div class="row"><b>${i===0?'Customer':''}</b><span>${esc(v)}</span></div>`).join('')}</div>
      <div>
        <div class="row"><b>PO:</b><span>${esc(draft.poNumber||'')}</span></div>
        <div class="row"><b>Room:</b><span>${esc(draft.room||'')}</span></div>
        <div class="row"><b>Booking:</b><span>${esc(draft.bookingReference||'')}</span></div>
        <div class="row"><b>Arrival:</b><span>${invoiceDateGB(draft.arrival)}</span></div>
        <div class="row"><b>Departure:</b><span>${invoiceDateGB(draft.departure)}</span></div>
        <div class="row"><b>Invoice Date:</b><span>${invoiceDateGB(draft.invoiceDate)}</span></div>
      </div>
    </div>
    <div class="row" style="margin-top:18px"><b>Guest:</b><span>${esc(draft.guestName||fn.clientName||'')}</span></div>

    <table><thead><tr><th>Date</th><th>Description</th><th class="num">Quantity</th><th class="num">Value Each</th><th class="num">Value Total</th></tr></thead>
    <tbody>${(draft.lines||[]).map(line=>`<tr><td>${invoiceDateGB(line.date)}</td><td>${esc(line.description)}</td><td class="num">${Number(line.quantity||0)}</td><td class="num">${invoiceMoney(line.unitPrice)}</td><td class="num">${invoiceMoney(invoiceLineTotal(line))}</td></tr>`).join('')}</tbody></table>

    <div class="balance"><span>Balance Due</span><span>${invoiceMoney(totals.gross)}</span></div>
    <div class="tax"><strong>Tax Analysis</strong><div class="tax-grid"><div><b>Tax Code Description</b></div><div class="num"><b>Nett</b></div><div class="num"><b>Tax</b></div><div class="num"><b>Gross</b></div><div>UK VAT @ ${Number(draft.vatRate||20)}%</div><div class="num">${invoiceMoney(totals.net)}</div><div class="num">${invoiceMoney(totals.tax)}</div><div class="num">${invoiceMoney(totals.gross)}</div></div></div>
    ${draft.notes?`<div class="notes"><strong>Billing Instructions / Notes</strong><br>${esc(draft.notes)}</div>`:''}
    <div class="legal">
      <strong>VAT REG 514 918 246</strong><br><br>
      <strong>Company Name:</strong> Greene King Brewing and Retailing Limited<br>
      <strong>Company Registration No:</strong> 03298903<br>
      Registered Office: Westgate Brewery, Bury St Edmund, Suffolk,<br>United Kingdom, IP33 1QT
      <img class="logo" src="${logo}" alt="Greene King">
    </div>
  </div></body></html>`;
}

function previewFunctionInvoice(id){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  const draft=collectFunctionInvoiceDraft();if(!draft)return;
  const win=window.open('','_blank');
  if(!win){toast('Allow pop-ups to preview the invoice','error');return;}
  win.document.open();win.document.write(buildFunctionInvoiceHTML(fn,draft));win.document.close();
}

async function saveFunctionInvoice(id,invoiceIndex=-1){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  const draft=collectFunctionInvoiceDraft();if(!draft)return;
  if(!draft.customerCompany){toast('Enter the customer / company name','error');return;}
  if(!draft.lines.length){toast('Add at least one invoice charge','error');return;}

  const totals=invoiceTotals(draft.lines,draft.vatRate);
  const invoice={
    ...draft,
    net:totals.net,tax:totals.tax,gross:totals.gross,
    savedAt:new Date().toISOString()
  };

  const planning=JSON.parse(JSON.stringify(fn.planning||{}));
  planning.invoices=Array.isArray(planning.invoices)?planning.invoices:[];
  if(invoiceIndex>=0)planning.invoices[invoiceIndex]=invoice;
  else planning.invoices.push(invoice);

  planning.invoiceCustomer={
    company:draft.customerCompany,contact:draft.customerName,address1:draft.address1,
    address2:draft.address2,address3:draft.address3,postcode:draft.postcode,
    poNumber:draft.poNumber,guestName:draft.guestName
  };

  const {error}=await supabaseClient.from('functions').update({planning_data:planning}).eq('id',id);
  if(error){console.error(error);toast('Invoice could not be saved','error');return;}

  await loadFunctionsFromSupabase();
  activeFunctionId=id;
  document.getElementById('functionInvoiceModal')?.remove();
  renderFunctionWorkspace();
  toast('Invoice saved to this Function');
}

function previewSavedFunctionInvoice(id,index){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  const invoice=functionInvoiceStore(fn)[Number(index)];if(!invoice)return;
  const win=window.open('','_blank');
  if(!win){toast('Allow pop-ups to preview the invoice','error');return;}
  win.document.open();win.document.write(buildFunctionInvoiceHTML(fn,invoice));win.document.close();
}

function renderFunctionInvoices(fn){
  if(!isMeetingFunction(fn)){
    return `<div class="bg-white border rounded-xl p-5"><h3 class="font-bold text-lg">Invoices</h3><p class="text-sm text-gray-500 mt-2">The built-in invoice generator is currently for Corporate Meeting, Conference and Training Functions.</p></div>`;
  }
  const invoices=functionInvoiceStore(fn);
  return `<div class="space-y-4">
    <div class="bg-white border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div><p class="text-xs font-bold tracking-widest text-olive-600">INVOICING</p><h3 class="font-bold text-lg mt-1">Corporate / Meeting Invoices</h3><p class="text-sm text-gray-500 mt-1">Create a clean Windmill Farm / Greene King invoice without the Excel sheet.</p></div>
      <button onclick="openFunctionInvoiceGenerator('${fn.id}')" class="px-4 py-2.5 bg-olive-600 text-white rounded-lg font-semibold">+ Generate Invoice</button>
    </div>
    ${invoices.length?`<div class="bg-white border rounded-xl overflow-hidden"><div class="px-5 py-3 border-b font-semibold">Saved Invoices</div>${invoices.map((inv,index)=>`<div class="px-5 py-4 border-b last:border-0 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><strong>${esc(inv.invoiceNumber||`Invoice ${index+1}`)}</strong><p class="text-sm text-gray-500 mt-1">${invoiceDateGB(inv.invoiceDate)} · ${esc(inv.customerCompany||fn.clientName)} · ${invoiceMoney(inv.gross)}</p></div><div class="flex gap-2"><button onclick="openFunctionInvoiceGenerator('${fn.id}',${index})" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold">Edit</button><button onclick="previewSavedFunctionInvoice('${fn.id}',${index})" class="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">Preview / PDF</button></div></div>`).join('')}</div>`:`<div class="bg-gray-50 border border-dashed rounded-xl p-8 text-center text-sm text-gray-500">No invoices saved for this Function yet.</div>`}
  </div>`;
}



// ============================================================================
// FUNCTIONS V2 — PLAN FUNCTION
// One structured planning screen feeds the existing tabs, Invoice Generator
// and Rezlynx handover. Existing tools remain intact.
// ============================================================================

const FUNCTION_PARTY_TYPES=[
  'Birthday Party','Engagement Party','Anniversary','Baby Shower',
  'Christening','Private Party','Christmas Party'
];

function functionPlanKind(fn){
  if(isMeetingFunction(fn))return 'meeting';
  if(fn?.eventType==='Wake')return 'wake';
  if(FUNCTION_PARTY_TYPES.includes(fn?.eventType))return 'party';
  return 'event';
}

function functionPlanLabel(fn){
  const kind=functionPlanKind(fn);
  if(kind==='meeting')return 'Meeting & Conference Plan';
  if(kind==='wake')return 'Wake Plan';
  if(kind==='party')return 'Party & Celebration Plan';
  return 'Event Plan';
}

function functionPlanDescription(fn){
  const kind=functionPlanKind(fn);
  if(kind==='meeting')return 'Build the delegate package, room, catering, AV and running order in one place.';
  if(kind==='wake')return 'Keep the arrangements simple and clear: numbers, room, refreshments, food, timings and any family requirements.';
  if(kind==='party')return 'Plan guest numbers, food, bar, entertainment, room setup, decorations, cake and timings.';
  return 'Build the operational plan in one place, then use the detailed tabs for anything exceptional.';
}

function functionPlanCompleteness(fn){
  const p=fn.planning||{},kind=functionPlanKind(fn);
  let checks=[];
  if(kind==='meeting'){
    checks=[
      !!fn.guests,!!fn.packageName,!!fn.room,
      !!p.roomSetup?.layout,!!p.food?.refreshments,!!p.food?.catering,
      !!p.runningOrder?.arrival,!!p.runningOrder?.start,
      p.av?.projector!==undefined,!!p.food?.dietary
    ];
  }else if(kind==='party'){
    checks=[
      !!fn.guests,!!fn.room,!!p.roomSetup?.layout,!!p.food?.catering,
      !!p.food?.drinks,!!p.runningOrder?.arrival,!!p.runningOrder?.food,
      !!p.runningOrder?.finish,!!p.entertainment?.dj,!!p.entertainment?.cake
    ];
  }else if(kind==='wake'){
    checks=[
      !!fn.guests,!!fn.room,!!p.roomSetup?.layout,!!p.food?.refreshments,
      !!p.food?.catering,!!p.runningOrder?.arrival,!!p.runningOrder?.food,
      !!p.requirements?.summary
    ];
  }else{
    checks=[
      !!fn.guests,!!fn.room,!!p.roomSetup?.layout,!!p.food?.catering,
      !!p.runningOrder?.arrival,!!p.runningOrder?.start,!!p.runningOrder?.finish
    ];
  }
  return Math.round(checks.filter(Boolean).length/checks.length*100);
}

function fpSelected(a,b){return String(a??'')===String(b??'')?'selected':''}
function fpChecked(v){return v?'checked':''}

function functionPlanSelect(name,label,value,options,help=''){
  return `<label class="fp-field"><span>${label}</span><select name="${name}">${options.map(x=>{
    const pair=Array.isArray(x)?x:[x,x];
    return `<option value="${esc(String(pair[0]))}" ${fpSelected(value,pair[0])}>${esc(String(pair[1]))}</option>`;
  }).join('')}</select>${help?`<small>${help}</small>`:''}</label>`;
}

function functionPlanInput(name,label,value,type='text',attrs='',help=''){
  return `<label class="fp-field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(String(value??''))}" ${attrs}>${help?`<small>${help}</small>`:''}</label>`;
}

function functionPlanTextarea(name,label,value,placeholder='',help=''){
  return `<label class="fp-field fp-wide"><span>${label}</span><textarea name="${name}" rows="3" placeholder="${esc(placeholder)}">${esc(String(value??''))}</textarea>${help?`<small>${help}</small>`:''}</label>`;
}

function functionPlanToggle(name,label,checked,detail=''){
  return `<label class="fp-toggle"><input type="checkbox" name="${name}" ${fpChecked(checked)}><span><strong>${label}</strong>${detail?`<small>${detail}</small>`:''}</span></label>`;
}


function functionMissingItems(fn){
  const p=fn.planning||{},kind=functionPlanKind(fn);
  const room=p.roomSetup||{},food=p.food||{},run=p.runningOrder||{},av=p.av||{},
        entertainment=p.entertainment||{},req=p.requirements||{};
  const missing=[];
  const need=(ok,label)=>{if(!ok)missing.push(label);};
  need(Number(fn.guests||0)>0,kind==='meeting'?'delegate number':'guest number');
  need(!!fn.room,'room');
  need(!!room.layout,'room layout');
  if(kind==='meeting'){
    need(!!fn.packageName,'meeting package');
    need(!!food.refreshments,'refreshments');
    need(!!food.catering,'lunch / food');
    need(!!run.arrival,'arrival time');
    need(!!run.start,'start time');
    need(!!run.finish,'finish time');
    need(typeof av.projector!=='undefined','projector decision');
    need(!!food.dietary,'dietary check');
  }else if(kind==='party'){
    need(!!food.catering,'food choice');
    need(!!food.drinks,'bar / drinks');
    need(!!run.arrival,'arrival time');
    need(!!run.food,'food service time');
    need(!!run.finish,'finish time');
    need(!!entertainment.dj,'entertainment decision');
    need(!!entertainment.cake,'cake decision');
  }else if(kind==='wake'){
    need(!!food.refreshments,'tea / coffee');
    need(!!food.catering,'food choice');
    need(!!run.arrival,'arrival time');
    need(!!run.food,'food service time');
    need(!!req.summary,'family requirements');
  }else{
    need(!!food.catering,'food choice');
    need(!!run.arrival,'arrival time');
    need(!!run.start,'start time');
    need(!!run.finish,'finish time');
  }
  return missing;
}

function functionOperationalSummary(fn){
  const p=fn.planning||{},food=p.food||{},room=p.roomSetup||{},av=p.av||{},run=p.runningOrder||{};
  const kind=functionPlanKind(fn),bits=[];
  bits.push(`${Number(fn.guests||0)} ${kind==='meeting'?'delegates':'guests'}`);
  if(fn.packageName&&kind==='meeting')bits.push(fn.packageName);
  if(fn.room)bits.push(fn.room);
  if(room.layout)bits.push(room.layout);
  if(food.catering)bits.push(food.catering);
  if(kind==='meeting'){
    const equipment=[av.projector&&'Projector',av.tv1&&'TV 1',av.tv2&&'TV 2',av.pa&&'PA/Mic'].filter(Boolean);
    if(equipment.length)bits.push(equipment.join(' + '));
  }
  if(run.arrival)bits.push(`Arrival ${run.arrival}`);
  if(run.food)bits.push(`Food ${run.food}`);
  if(run.finish)bits.push(`Finish ${run.finish}`);
  return bits;
}

function functionPlanSection(title,eyebrow,icon,content,open=false){
  return `<details class="fpc-section" ${open?'open':''}>
    <summary><span class="fpc-section-icon"><i data-lucide="${icon}"></i></span>
      <span class="fpc-section-title"><small>${eyebrow}</small><strong>${title}</strong></span>
      <span class="fpc-chevron"><i data-lucide="chevron-down"></i></span></summary>
    <div class="fpc-section-body">${content}</div>
  </details>`;
}

function renderPlanFunction(fn){
  const p=fn.planning||{};
  const room=p.roomSetup||{},food=p.food||{},run=p.runningOrder||{},av=p.av||{},
        entertainment=p.entertainment||{},req=p.requirements||{},meta=p.planMeta||{},
        accom=p.accommodation||{};
  const kind=functionPlanKind(fn),missing=functionMissingItems(fn),
        summary=functionOperationalSummary(fn),completion=functionPlanCompleteness(fn);
  let sections=[];

  if(kind==='meeting'){
    sections=[
      functionPlanSection('Basics & Package','COMMERCIAL','briefcase-business',`<div class="fp-grid">
        ${functionPlanInput('guests','Delegates',fn.guests,'number','min="0"')}
        ${functionPlanSelect('packageName','Day Delegate / Meeting Package',fn.packageName||'Standard Day Delegate Package',Object.keys(MEETING_PACKAGES))}
        ${functionPlanInput('organiser','Organiser / main contact',meta.organiser||'')}
        ${functionPlanInput('poNumber','PO number / billing reference',meta.poNumber||'')}
      </div>`,true),
      functionPlanSection('Room & Arrival','ROOM','layout-template',`<div class="fp-grid">
        ${functionPlanInput('room','Room / space',fn.room||room.room||'')}
        ${functionPlanSelect('layout','Layout',room.layout||'',[['','Select layout'],['Boardroom','Boardroom'],['Theatre','Theatre'],['Classroom','Classroom'],['U-Shape','U-Shape'],['Cabaret','Cabaret'],['Banquet / Rounds','Banquet / Rounds'],['Bespoke','Bespoke']])}
        ${functionPlanSelect('breakouts','Breakout rooms',room.breakouts||'No',[['No','No'],['Yes — 1','Yes — 1'],['Yes — 2','Yes — 2'],['Yes — 3+','Yes — 3+'],['TBC','TBC']])}
        ${functionPlanSelect('registration','Registration / arrival setup',room.arrival||'None',[['None','None'],['Registration table','Registration table'],['Welcome desk','Welcome desk'],['Name badges / packs','Name badges / delegate packs'],['Bespoke','Bespoke']])}
        ${functionPlanInput('signage','Signage / welcome wording',room.signage||'')}
        ${functionPlanInput('parking','Parking / arrival notes',meta.parking||'')}
      </div>`),
      functionPlanSection('Food & Drink','CATERING','coffee',`<div class="fp-grid">
        ${functionPlanSelect('refreshments','Arrival / refreshment service',food.refreshments||'',[['','Select refreshments'],['Unlimited tea & coffee','Unlimited tea & coffee'],['Tea & coffee on arrival','Tea & coffee on arrival'],['Tea, coffee & bacon rolls','Tea, coffee & bacon rolls'],['Tea, coffee & pastries','Tea, coffee & pastries'],['No refreshments','No refreshments'],['Bespoke','Bespoke']])}
        ${functionPlanSelect('catering','Lunch / food',food.catering||'',[['','Select food'],['Buffet lunch','Buffet lunch'],['Carvery & Cake Lunch','Carvery & Cake Lunch'],['Breakfast meeting','Breakfast meeting'],['Finger food','Finger food'],['No lunch','No lunch'],['Bespoke / TBC','Bespoke / TBC']])}
        ${functionPlanSelect('drinks','Additional drinks',food.drinks||'None',[['None','None'],['Bottled water','Bottled water'],['Post-meeting drinks','Post-meeting drinks'],['Bar required','Bar required'],['Bespoke','Bespoke']])}
        ${functionPlanTextarea('dietary','Dietary & allergen requirements',food.dietary||'','If none, type None confirmed')}
      </div>`),
      functionPlanSection('AV & Equipment','EQUIPMENT','presentation',`<div class="fp-toggle-grid">
        ${functionPlanToggle('av_projector','Projector',av.projector)}
        ${functionPlanToggle('av_tv1','TV 1',av.tv1)}
        ${functionPlanToggle('av_tv2','TV 2',av.tv2)}
        ${functionPlanToggle('av_pa','PA / Microphone',av.pa)}
        ${functionPlanToggle('av_lectern','Lectern',av.lectern)}
        ${functionPlanToggle('av_flipchart','Flipchart & Pens',av.flipchart)}
        ${functionPlanToggle('av_welcomeSlide','Welcome Slide',av.welcomeSlide)}
        ${functionPlanToggle('av_stage','Stage',av.stage)}
        ${functionPlanToggle('av_wifi','Wi-Fi',av.wifi)}
        ${functionPlanToggle('av_breakout','Breakout AV',av.breakout)}
      </div><div class="fp-grid mt-3">${functionPlanTextarea('avNotes','AV / equipment notes',av.notes||'')}</div>`),
      functionPlanSection('Timings','RUNNING ORDER','clock-3',`<div class="fp-grid">
        ${functionPlanInput('arrival','Delegate arrival',run.arrival||fn.startTime||'','time')}
        ${functionPlanInput('start','Meeting starts',run.start||fn.startTime||'','time')}
        ${functionPlanInput('foodTime','Lunch / food service',run.food||'','time')}
        ${functionPlanInput('presentations','Presentations / speeches',run.speeches||'')}
        ${functionPlanInput('finish','Meeting finishes',run.finish||fn.endTime||'','time')}
        ${functionPlanInput('roomClear','Room clear / reset',meta.roomClear||'','time')}
      </div>`)
    ];
  }else if(kind==='party'){
    sections=[
      functionPlanSection('Basics','PARTY','party-popper',`<div class="fp-grid">
        ${functionPlanInput('guests','Guests',fn.guests,'number','min="0"')}
        ${functionPlanInput('occasionName','Occasion / person celebrating',meta.occasionName||fn.clientName||'')}
        ${functionPlanInput('room','Room / space',fn.room||room.room||'')}
        ${functionPlanSelect('layout','Room layout',room.layout||'',[['','Select layout'],['Party / Open Floor','Party / Open Floor'],['Banquet / Rounds','Banquet / Rounds'],['Cabaret','Cabaret'],['Mixed seating & dance floor','Mixed seating & dance floor'],['Private Dining','Private Dining'],['Bespoke','Bespoke']])}
      </div>`,true),
      functionPlanSection('Food & Bar','CATERING','utensils',`<div class="fp-grid">
        ${functionPlanSelect('catering','Food style / menu',food.catering||'',[['','Select food'],['Pub Classics','Pub Classics'],['Signature Menu','Signature Menu'],['Buffet / Finger Food','Buffet / Finger Food'],['Carvery','Carvery'],['No food','No food'],['Bespoke / TBC','Bespoke / TBC']])}
        ${functionPlanSelect('drinks','Bar / drinks',food.drinks||'',[['','Select drinks'],['Main bar / normal service','Main bar / normal service'],['Private bar required','Private bar required'],['Arrival drink','Arrival drink'],['Pre-paid drinks / tokens','Pre-paid drinks / tokens'],['No bar requirement','No bar requirement'],['Bespoke','Bespoke']])}
        ${functionPlanTextarea('dietary','Dietary & allergen requirements',food.dietary||'')}
        ${functionPlanTextarea('refreshments','Additional food / drink notes',food.refreshments||'')}
      </div>`),
      functionPlanSection('Entertainment & Setup','ENTERTAINMENT','music',`<div class="fp-grid">
        ${functionPlanSelect('dj','DJ / entertainment',entertainment.dj||'',[['','Select'],['Customer DJ','Customer DJ'],['Venue / recommended DJ','Venue / recommended DJ'],['Live band','Live band'],['Playlist / background music','Playlist / background music'],['No entertainment','No entertainment'],['TBC','TBC']])}
        ${functionPlanSelect('decor','Decorations',entertainment.decor||'',[['','Select'],['Customer decorating','Customer decorating'],['Balloons','Balloons'],['Venue dressing / setup','Venue dressing / setup'],['Minimal / none','Minimal / none'],['TBC','TBC']])}
        ${functionPlanSelect('cake','Cake',entertainment.cake||'',[['','Select'],['Yes — customer supplying','Yes — customer supplying'],['Yes — storage / setup required','Yes — storage / setup required'],['No cake','No cake'],['TBC','TBC']])}
        ${functionPlanSelect('lighting','Lighting',entertainment.lighting||'Standard',[['Standard','Standard'],['Party lighting','Party lighting'],['Supplier lighting','Supplier lighting'],['Bespoke','Bespoke']])}
        ${functionPlanTextarea('extras','Other entertainment / décor',entertainment.extras||'')}
        ${functionPlanTextarea('tables','Tables / seating notes',room.tables||'')}
      </div>`),
      functionPlanSection('Timings','RUNNING ORDER','clock-3',`<div class="fp-grid">
        ${functionPlanInput('arrival','Guest arrival',run.arrival||fn.startTime||'','time')}
        ${functionPlanInput('start','Function starts',run.start||fn.startTime||'','time')}
        ${functionPlanInput('foodTime','Food service',run.food||'','time')}
        ${functionPlanInput('presentations','Speeches / cake / key moment',run.speeches||'')}
        ${functionPlanInput('entertainmentTime','Entertainment starts',run.entertainment||'','time')}
        ${functionPlanInput('finish','Finish / room clear',run.finish||fn.endTime||'','time')}
      </div>`)
    ];
  }else if(kind==='wake'){
    sections=[
      functionPlanSection('Basics','WAKE','flower-2',`<div class="fp-grid">
        ${functionPlanInput('guests','Expected guests',fn.guests,'number','min="0"')}
        ${functionPlanInput('organiser','Family / organiser contact',meta.organiser||'')}
        ${functionPlanInput('room','Room / private space',fn.room||room.room||'')}
        ${functionPlanSelect('layout','Room layout',room.layout||'',[['','Select layout'],['Mixed seating','Mixed seating'],['Tables / Rounds','Tables / Rounds'],['Informal standing & seating','Informal standing & seating'],['Private Dining','Private Dining'],['Bespoke','Bespoke']])}
      </div>`,true),
      functionPlanSection('Food & Drink','REFRESHMENTS','coffee',`<div class="fp-grid">
        ${functionPlanSelect('refreshments','Tea / coffee',food.refreshments||'',[['','Select'],['Tea & coffee on arrival','Tea & coffee on arrival'],['Tea & coffee throughout','Tea & coffee throughout'],['No hot drinks','No hot drinks'],['Bespoke','Bespoke']])}
        ${functionPlanSelect('catering','Food',food.catering||'',[['','Select food'],['Buffet / Finger Food','Buffet / Finger Food'],['Pub Classics','Pub Classics'],['Private dining','Private dining'],['No food','No food'],['Bespoke / TBC','Bespoke / TBC']])}
        ${functionPlanSelect('drinks','Bar / other drinks',food.drinks||'Normal bar service',[['Normal bar service','Normal bar service'],['Private bar','Private bar'],['No bar','No bar'],['Bespoke','Bespoke']])}
        ${functionPlanTextarea('dietary','Dietary & allergen requirements',food.dietary||'')}
      </div>`),
      functionPlanSection('Timings & Family Notes','ON THE DAY','clock-3',`<div class="fp-grid">
        ${functionPlanInput('arrival','Family / guest arrival',run.arrival||fn.startTime||'','time')}
        ${functionPlanInput('foodTime','Food service',run.food||'','time')}
        ${functionPlanInput('finish','Finish',run.finish||fn.endTime||'','time')}
        ${functionPlanInput('signage','Welcome / signage wording',room.signage||'')}
        ${functionPlanTextarea('requirements','Family requirements / important notes',req.summary||'')}
      </div>`)
    ];
  }else{
    sections=[functionPlanSection('Event Details','EVENT','calendar-range',`<div class="fp-grid">
      ${functionPlanInput('guests','Guests',fn.guests,'number','min="0"')}
      ${functionPlanInput('organiser','Organiser / contact',meta.organiser||'')}
      ${functionPlanInput('room','Room / space',fn.room||room.room||'')}
      ${functionPlanSelect('layout','Room layout',room.layout||'',[['','Select layout'],['Theatre','Theatre'],['Cabaret','Cabaret'],['Banquet / Rounds','Banquet / Rounds'],['Informal','Informal'],['Bespoke','Bespoke']])}
      ${functionPlanSelect('catering','Food / catering',food.catering||'',[['','Select food'],['Pub Classics','Pub Classics'],['Signature Menu','Signature Menu'],['Buffet / Finger Food','Buffet / Finger Food'],['No food','No food'],['Bespoke / TBC','Bespoke / TBC']])}
      ${functionPlanInput('arrival','Arrival',run.arrival||fn.startTime||'','time')}
      ${functionPlanInput('start','Start',run.start||fn.startTime||'','time')}
      ${functionPlanInput('foodTime','Food service',run.food||'','time')}
      ${functionPlanInput('finish','Finish',run.finish||fn.endTime||'','time')}
      ${functionPlanTextarea('dietary','Dietary & allergens',food.dietary||'')}
      ${functionPlanTextarea('requirements','Requirements / operational notes',req.summary||'')}
    </div>`,true)];
  }

  sections.push(functionPlanSection('Final Handover','OPERATIONS','clipboard-check',`<div class="fp-grid">
    ${functionPlanTextarea('requirements','Overall customer requirements',req.summary||'')}
    ${functionPlanTextarea('internalNotes','Internal handover notes',p.notesSection?.internal||'')}
    ${functionPlanTextarea('accommodation','Accommodation requirements',accom.notes||'')}
  </div>`));

  return `<div class="fpc-shell">
    <section class="fpc-command"><div><p class="fpc-eyebrow">PLAN FUNCTION</p><h2>${functionPlanLabel(fn)}</h2><div class="fpc-summary">${summary.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
      <div class="fpc-readiness"><small>Readiness</small><strong>${completion}%</strong><div class="fpc-progress"><span style="width:${completion}%"></span></div></div></section>
    ${missing.length?`<section class="fpc-missing"><div><i data-lucide="alert-triangle"></i><strong>${missing.length} thing${missing.length===1?'':'s'} still needed</strong></div><p>${missing.slice(0,7).map(x=>`<span>${esc(x)}</span>`).join('')}${missing.length>7?`<span>+${missing.length-7} more</span>`:''}</p></section>`:`<section class="fpc-ready"><i data-lucide="check-circle-2"></i><strong>Core Function plan is ready.</strong></section>`}
    <form onsubmit="savePlanFunction(event,'${fn.id}')" class="space-y-3 pb-24">${sections.join('')}
      <div class="fpc-actions">
        <button type="submit" class="fpc-primary"><i data-lucide="save"></i>Save Plan</button>
        <button type="button" onclick="setFunctionTab('quote')" class="fpc-secondary"><i data-lucide="calculator"></i>Build Quote</button>
        <button type="button" onclick="openFunctionInvoiceGenerator('${fn.id}')" class="fpc-secondary"><i data-lucide="receipt-text"></i>Generate Invoice</button>
        <button type="button" onclick="openRezlynxTransfer('${fn.id}')" class="fpc-dark"><i data-lucide="copy"></i>Copy to Rezlynx</button>
      </div>
    </form>
  </div>`;
}

async function savePlanFunction(event,id){
  event.preventDefault();
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  const f=new FormData(event.target);
  const kind=functionPlanKind(fn);
  const planning=JSON.parse(JSON.stringify(fn.planning||{}));

  planning.planMeta=planning.planMeta||{};
  planning.requirements=planning.requirements||{};
  planning.roomSetup=planning.roomSetup||{};
  planning.food=planning.food||{};
  planning.runningOrder=planning.runningOrder||{};
  planning.av=planning.av||{};
  planning.entertainment=planning.entertainment||{};
  planning.notesSection=planning.notesSection||{};
  planning.accommodation=planning.accommodation||{};

  const set=(obj,key,name=key)=>{
    if(f.has(name))obj[key]=String(f.get(name)||'').trim();
  };

  set(planning.planMeta,'organiser');
  set(planning.planMeta,'poNumber');
  set(planning.planMeta,'parking');
  set(planning.planMeta,'occasionName');
  set(planning.planMeta,'roomClear');

  set(planning.requirements,'summary','requirements');
  set(planning.roomSetup,'layout');
  set(planning.roomSetup,'breakouts');
  set(planning.roomSetup,'arrival','registration');
  set(planning.roomSetup,'signage');
  set(planning.roomSetup,'tables');

  set(planning.food,'catering');
  set(planning.food,'refreshments');
  set(planning.food,'dietary');
  set(planning.food,'drinks');

  set(planning.runningOrder,'arrival');
  set(planning.runningOrder,'start');
  set(planning.runningOrder,'food','foodTime');
  set(planning.runningOrder,'speeches','presentations');
  set(planning.runningOrder,'entertainment','entertainmentTime');
  set(planning.runningOrder,'finish');

  set(planning.entertainment,'dj');
  set(planning.entertainment,'decor');
  set(planning.entertainment,'cake');
  set(planning.entertainment,'lighting');
  set(planning.entertainment,'extras');

  set(planning.notesSection,'internal','internalNotes');
  set(planning.accommodation,'notes','accommodation');

  if(kind==='meeting'){
    ['projector','tv1','tv2','pa','lectern','flipchart','welcomeSlide','stage','wifi','breakout'].forEach(key=>{
      planning.av[key]=f.has('av_'+key);
    });
    set(planning.av,'notes','avNotes');
  }

  // Keep the structured room value in planning data as well as the main Function.
  if(f.has('room'))planning.roomSetup.room=String(f.get('room')||'').trim();

  const update={
    planning_data:planning
  };

  if(f.has('guests'))update.guests=Number(f.get('guests')||0);
  if(f.has('room'))update.room=String(f.get('room')||'').trim()||null;
  if(f.has('packageName'))update.package_name=String(f.get('packageName')||'').trim()||null;

  // Start/end remain the master event times; use the structured plan when supplied.
  if(f.has('start')&&f.get('start'))update.start_time=f.get('start');
  else if(f.has('arrival')&&f.get('arrival')&&!fn.startTime)update.start_time=f.get('arrival');
  if(f.has('finish')&&f.get('finish'))update.end_time=f.get('finish');

  const {error}=await supabaseClient.from('functions').update(update).eq('id',id);
  if(error){
    console.error(error);
    toast('Function plan could not be saved','error');
    return;
  }

  await loadFunctionsFromSupabase();
  activeFunctionId=id;
  activeFunctionTab='plan';
  renderFunctionWorkspace();
  toast('Function plan saved');
}


// ============================================================================
// UPDATE 3 — FUNCTION QUOTE BUILDER
// Prices are intentionally editable. The supplied Function material confirms
// the meeting package rates; party/menu rates can be entered and saved per
// booking until the exact price book is supplied.
// ============================================================================

function functionQuoteData(fn){
  const q=fn?.planning?.quoteBuilder;
  return q&&typeof q==='object'?q:{lines:[]};
}

function functionQuoteLines(fn){
  const saved=functionQuoteData(fn).lines;
  if(Array.isArray(saved)&&saved.length)return saved;
  const lines=[];
  if(isMeetingFunction(fn)){
    const pkg=MEETING_PACKAGES[fn.packageName];
    if(pkg&&Number(pkg.rate||0)>0){
      lines.push({category:'Package',description:fn.packageName,quantity:Number(fn.guests||1),unitPrice:Number(pkg.rate||0)});
    }
  }
  return lines;
}

function functionQuoteTotals(lines){
  const gross=(lines||[]).reduce((sum,line)=>sum+(Number(line.quantity||0)*Number(line.unitPrice||0)),0);
  const net=gross/1.2;
  return {gross,net,vat:gross-net};
}

function functionQuoteLine(line={},index=0){
  return `<div class="fq-line" data-quote-line>
    <select data-q="category">
      ${['Package','Room Hire','Food','Drinks','Equipment','Entertainment','Accommodation','Other'].map(x=>`<option ${fpSelected(line.category||'Other',x)}>${x}</option>`).join('')}
    </select>
    <input data-q="description" value="${esc(line.description||'')}" placeholder="Description">
    <input data-q="quantity" type="number" min="0" step=".01" value="${Number(line.quantity||0)}" oninput="refreshFunctionQuoteTotals()">
    <input data-q="unitPrice" type="number" min="0" step=".01" value="${Number(line.unitPrice||0)}" oninput="refreshFunctionQuoteTotals()">
    <strong data-q-total>${functionMoney(Number(line.quantity||0)*Number(line.unitPrice||0))}</strong>
    <button type="button" onclick="this.closest('[data-quote-line]').remove();refreshFunctionQuoteTotals()" title="Remove">×</button>
  </div>`;
}

function collectFunctionQuoteLines(){
  return [...document.querySelectorAll('[data-quote-line]')].map(row=>({
    category:row.querySelector('[data-q="category"]')?.value||'Other',
    description:row.querySelector('[data-q="description"]')?.value?.trim()||'',
    quantity:Number(row.querySelector('[data-q="quantity"]')?.value||0),
    unitPrice:Number(row.querySelector('[data-q="unitPrice"]')?.value||0)
  })).filter(x=>x.description||x.unitPrice);
}

function refreshFunctionQuoteTotals(){
  const lines=collectFunctionQuoteLines();
  document.querySelectorAll('[data-quote-line]').forEach(row=>{
    const q=Number(row.querySelector('[data-q="quantity"]')?.value||0);
    const p=Number(row.querySelector('[data-q="unitPrice"]')?.value||0);
    const total=row.querySelector('[data-q-total]');if(total)total.textContent=functionMoney(q*p);
  });
  const totals=functionQuoteTotals(lines);
  const net=document.getElementById('fqNet'),vat=document.getElementById('fqVat'),gross=document.getElementById('fqGross');
  if(net)net.textContent=functionMoney(totals.net);
  if(vat)vat.textContent=functionMoney(totals.vat);
  if(gross)gross.textContent=functionMoney(totals.gross);
}

function addFunctionQuoteLine(category='Other',description='',quantity=1,unitPrice=0){
  const list=document.getElementById('functionQuoteLines');if(!list)return;
  list.insertAdjacentHTML('beforeend',functionQuoteLine({category,description,quantity,unitPrice},list.children.length));
  refreshFunctionQuoteTotals();
}

function addMeetingQuotePreset(name){
  const fn=(DB.functions||[]).find(x=>x.id===activeFunctionId);if(!fn)return;
  if(MEETING_PACKAGES[name]){
    addFunctionQuoteLine('Package',name,Number(fn.guests||1),Number(MEETING_PACKAGES[name].rate||0));return;
  }
  if(Object.prototype.hasOwnProperty.call(MEETING_ENHANCEMENTS,name)){
    addFunctionQuoteLine('Food',name,Number(fn.guests||1),Number(MEETING_ENHANCEMENTS[name]||0));return;
  }
}

function addPartyQuotePreset(name){
  const fn=(DB.functions||[]).find(x=>x.id===activeFunctionId);if(!fn)return;
  const qty=Number(fn.guests||1);
  // Exact party/menu rates were not present in the supplied source material.
  // We therefore add the correct item with an editable £0 rate rather than inventing a price.
  addFunctionQuoteLine(name==='Room Hire'?'Room Hire':'Food',name,name==='Room Hire'?1:qty,0);
}

function renderFunctionQuoteBuilder(fn){
  const lines=functionQuoteLines(fn), totals=functionQuoteTotals(lines), meeting=isMeetingFunction(fn);
  const q=functionQuoteData(fn);
  return `<div class="fq-shell">
    <section class="fq-hero">
      <div><p>FUNCTION QUOTE BUILDER</p><h2>${meeting?'Meeting / Conference Quote':'Function Quote'}</h2><span>Build the agreed customer price here. Save it once and it becomes the Function value, Invoice starting point and Rezlynx billing summary.</span></div>
      <div class="fq-value"><small>Current quote</small><strong id="fqGross">${functionMoney(totals.gross)}</strong><em>VAT inclusive</em></div>
    </section>

    <section class="fq-card">
      <div class="fq-head"><div><p>QUICK ADD</p><h3>${meeting?'Meeting Packages & Enhancements':'Function Items'}</h3></div></div>
      <div class="fq-presets">
        ${meeting?Object.keys(MEETING_PACKAGES).filter(x=>MEETING_PACKAGES[x].rate>0).map(x=>`<button type="button" onclick="addMeetingQuotePreset('${x.replaceAll("'","\\'")}')"><strong>${esc(x)}</strong><span>${functionMoney(MEETING_PACKAGES[x].rate)} pp</span></button>`).join(''):`
          <button type="button" onclick="addPartyQuotePreset('Pub Classics')"><strong>Pub Classics</strong><span>Enter agreed pp price</span></button>
          <button type="button" onclick="addPartyQuotePreset('Signature Menu')"><strong>Signature Menu</strong><span>Enter agreed pp price</span></button>
          <button type="button" onclick="addPartyQuotePreset('Buffet / Finger Food')"><strong>Buffet / Finger Food</strong><span>Enter agreed pp price</span></button>
          <button type="button" onclick="addPartyQuotePreset('Room Hire')"><strong>Room Hire</strong><span>Enter agreed price</span></button>`}
      </div>
      ${meeting?`<div class="fq-presets fq-small">${Object.entries(MEETING_ENHANCEMENTS).map(([name,price])=>`<button type="button" onclick="addMeetingQuotePreset('${name.replaceAll("'","\\'")}')"><strong>${esc(name)}</strong><span>${functionMoney(price)}</span></button>`).join('')}</div>`:''}
      ${!meeting?`<div class="fq-source-note"><strong>Party/menu pricing:</strong> I have not guessed rates that were not in the supplied material. Add the correct agreed rate in the quote line; once you supply the exact price book these buttons can become automatic.</div>`:''}
    </section>

    <section class="fq-card">
      <div class="fq-head"><div><p>QUOTE LINES</p><h3>Charges</h3></div><button type="button" onclick="addFunctionQuoteLine()" class="fq-add">+ Add Line</button></div>
      <div class="fq-labels"><span>Type</span><span>Description</span><span>Qty</span><span>Price Each</span><span>Total</span><span></span></div>
      <div id="functionQuoteLines" class="space-y-2">${lines.map(functionQuoteLine).join('')}</div>
    </section>

    <section class="fq-grid">
      <div class="fq-card">
        <div class="fq-head"><div><p>CUSTOMER / BILLING</p><h3>Quote Instructions</h3></div></div>
        <label class="fp-field"><span>Customer-facing quote notes</span><textarea id="fqCustomerNotes" rows="4" placeholder="What is included, exclusions, agreed changes…">${esc(q.customerNotes||'')}</textarea></label>
        <label class="fp-field mt-3"><span>Billing / invoice instructions</span><textarea id="fqBillingNotes" rows="4" placeholder="PO required, invoice timing, deposit, split billing…">${esc(q.billingNotes||'')}</textarea></label>
      </div>
      <div class="fq-card">
        <div class="fq-head"><div><p>QUOTE TOTAL</p><h3>VAT Summary</h3></div></div>
        <div class="fq-total-row"><span>Net</span><strong id="fqNet">${functionMoney(totals.net)}</strong></div>
        <div class="fq-total-row"><span>VAT @ 20%</span><strong id="fqVat">${functionMoney(totals.vat)}</strong></div>
        <div class="fq-total-row fq-grand"><span>Customer Total</span><strong id="fqGross">${functionMoney(totals.gross)}</strong></div>
        <small class="fq-vat-note">Prices are treated as VAT-inclusive, matching the existing Windmill Farm invoice generator.</small>
      </div>
    </section>

    <div class="fq-savebar">
      <div><strong>Save Quote & Update Function Value</strong><small>This will update Quoted Value and make these lines available to the Invoice Generator and Rezlynx transfer.</small></div>
      <div class="flex gap-2"><button type="button" onclick="printFunctionProposalV2('${fn.id}')" class="fq-save" style="background:#30392d"><i data-lucide="file-text"></i>Print Proposal</button><button onclick="saveFunctionQuote('${fn.id}')" class="fq-save"><i data-lucide="save"></i>Save Quote</button></div>
    </div>
  </div>`;
}

async function saveFunctionQuote(id){
  const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return;
  const lines=collectFunctionQuoteLines();
  if(!lines.length){toast('Add at least one quote line','error');return;}
  const totals=functionQuoteTotals(lines);
  const planning=JSON.parse(JSON.stringify(fn.planning||{}));
  planning.quoteBuilder={
    lines,
    customerNotes:document.getElementById('fqCustomerNotes')?.value?.trim()||'',
    billingNotes:document.getElementById('fqBillingNotes')?.value?.trim()||'',
    savedAt:new Date().toISOString()
  };
  const {error}=await supabaseClient.from('functions').update({
    quoted_value:totals.gross,
    planning_data:planning
  }).eq('id',id);
  if(error){console.error(error);toast('Quote could not be saved','error');return;}
  await loadFunctionsFromSupabase();activeFunctionId=id;activeFunctionTab='quote';renderFunctionWorkspace();toast('Function quote saved');
}

function renderFunctionWorkspace(){
  const fn=(DB.functions||[]).find(x=>x.id===activeFunctionId);
  const panel=document.getElementById('function-workspace-panel');if(!fn||!panel)return;
  const meeting=isMeetingFunction(fn);
  const tabs=[
    ['overview','Overview','layout-dashboard'],
    ['plan','Plan Function','wand-sparkles'],
    ['quote','Quote Builder','calculator'],
    ['planning','Tasks','clipboard-check'],
    ['food','Food & Drink','utensils'],
    ['room','Room Setup','layout-template'],
    ...(meeting?[['av','AV & Equipment','presentation']]:[['entertainment','Entertainment & Décor','party-popper']]),
    ['running','Running Order','clock-3'],
    ['accommodation','Accommodation','bed-double'],
    ['payments','Payments','credit-card'],
    ['invoices','Invoices','receipt-text'],
    ['notes','Notes','file-text']
  ];

  panel.innerHTML=`<div class="min-h-full">
    <header class="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div class="px-5 lg:px-7 py-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <button onclick="closeFunctionWorkspace()" class="px-3 py-2 bg-gray-100 rounded-lg text-sm"><i data-lucide="arrow-left" class="inline mr-1"></i>Functions</button>
            <div><div class="flex items-center gap-2"><h1 class="text-xl font-bold">${esc(fn.clientName)}</h1><span class="badge bg-olive-100 text-olive-800">${esc(fn.eventType)}</span></div><p class="text-sm text-gray-500 mt-0.5">${functionDate(fn.eventDate)} · ${esc(fn.bookingReference||'BK missing')} · ${fn.guests} guests</p></div>
          </div>
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <button onclick="openFunctionInvoiceGenerator('${fn.id}')" class="px-3 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold">Generate Invoice</button>
            <button onclick="WindmillComms.open('Function','${fn.id}')" class="px-3 py-2 bg-white border rounded-lg text-sm font-semibold"><i data-lucide="mail" class="inline mr-1" style="width:15px"></i>Communications</button>
            <button onclick="openRezlynxTransfer('${fn.id}')" class="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">Copy to Rezlynx</button>
            ${fn.archivedAt
              ? `<button onclick="restoreFunctionBooking('${fn.id}')" class="px-3 py-2 bg-olive-50 text-olive-700 rounded-lg text-sm font-semibold">Restore</button>`
              : `
                <button onclick="openFunctionForm('${fn.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm font-semibold">Edit Function</button>
                ${fn.status!=='Cancelled'?`<button onclick="cancelFunctionBooking('${fn.id}')" class="px-3 py-2 bg-amber-50 text-amber-800 rounded-lg text-sm font-semibold">Cancel Booking</button>`:''}
                <button onclick="archiveFunctionBooking('${fn.id}')" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">Archive</button>
              `}
            ${canPermanentlyDeleteFunction()?`<button onclick="permanentlyDeleteFunction('${fn.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold">Delete Test</button>`:''}
          </div>
        </div>
        <nav class="flex gap-1 overflow-x-auto mt-3">${tabs.map(([id,label,icon])=>`<button onclick="setFunctionTab('${id}')" class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg whitespace-nowrap ${activeFunctionTab===id?'bg-olive-100 text-olive-800 font-semibold':'text-gray-500'}"><i data-lucide="${icon}" style="width:15px;height:15px"></i>${label}</button>`).join('')}</nav>
      </div>
    </header>
    <main class="max-w-[1500px] mx-auto p-5 lg:p-7">${renderFunctionTab(fn)}</main>
  </div>`;
  if(window.lucide)lucide.createIcons();
}


function functionKitchenBuffetRecipes(){
  try{
    return window.KitchenApp?.menuDefinitions?.().fingerBuffet?.recipes||[];
  }catch(e){return [];}
}
function renderFunctionFoodSection(fn){
  const food=fn.planning?.food||{};
  const recipes=functionKitchenBuffetRecipes();
  const selected=new Set(Array.isArray(food.kitchenSelectedIds)?food.kitchenSelectedIds:[]);
  const isBuffet=/buffet/i.test(String(food.catering||''));
  return `<div class="space-y-4">
    <div class="grid md:grid-cols-2 gap-3">
      ${[
        ['catering','Catering / menu choice'],
        ['refreshments','Tea / coffee / refreshments'],
        ['dietary','Dietary & allergen requirements'],
        ['drinks','Drinks / bar requirements']
      ].map(([field,label])=>`<label class="bg-white border rounded-xl p-4 text-xs font-medium text-gray-600"><span class="font-semibold text-gray-800">${label}</span><textarea rows="3" onblur="saveFunctionPlanningField('${fn.id}','food','${field}',this.value)" class="mt-2 w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white">${esc(food[field]||'')}</textarea></label>`).join('')}
    </div>
    ${isBuffet&&recipes.length?`<section class="bg-white border rounded-xl p-5">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div><p class="text-xs font-bold tracking-widest text-olive-600">KITCHEN-LINKED BUFFET</p><h3 class="font-bold text-lg mt-1">Exact buffet items</h3><p class="text-sm text-gray-500 mt-1">Tick the items actually being served. These recipe links pull directly into Kitchen and the shopping-list calculation.</p></div>
        <span class="px-3 py-1.5 rounded-full text-xs font-bold ${selected.size?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}">${selected.size} selected${selected.size?' · shopping linked':''}</span>
      </div>
      <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-2 mt-4">${recipes.map(recipe=>`<label class="flex gap-3 items-start p-3 border rounded-xl ${selected.has(recipe.id)?'bg-green-50 border-green-200':''}"><input type="checkbox" ${selected.has(recipe.id)?'checked':''} onchange="saveFunctionKitchenBuffetSelection('${fn.id}','${recipe.id}',this.checked)"><span><strong class="text-sm">${esc(recipe.name)}</strong><small class="block text-[11px] text-gray-400">Kitchen Specification · page ${recipe.page||'—'}</small></span></label>`).join('')}</div>
    </section>`:isBuffet?`<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Finger Buffet is selected, but the Kitchen Specification catalogue is not currently available. Refresh the page before confirming buffet items.</div>`:''}
  </div>`;
}
async function saveFunctionKitchenBuffetSelection(id,recipeId,checked){
  const fn=DB.functions.find(x=>x.id===id);if(!fn)return;
  const planning=JSON.parse(JSON.stringify(fn.planning||{}));
  planning.food=planning.food||{};
  const set=new Set(Array.isArray(planning.food.kitchenSelectedIds)?planning.food.kitchenSelectedIds:[]);
  checked?set.add(recipeId):set.delete(recipeId);
  planning.food.kitchenSelectedIds=[...set];
  planning.food.kitchenSelectedNames=[...set].map(rid=>{
    try{return KitchenApp.recipeById(rid)?.name||rid}catch(e){return rid}
  });
  const {error}=await supabaseClient.from('functions').update({planning_data:planning}).eq('id',id);
  if(error){console.error(error);toast('Buffet selection could not be saved','error');return;}
  fn.planning=planning;renderFunctionWorkspace();toast('Kitchen buffet selection updated');
}

function renderFunctionTab(fn){
  if(activeFunctionTab==='overview')return renderFunctionOverview(fn);
  if(activeFunctionTab==='plan')return renderPlanFunction(fn);
  if(activeFunctionTab==='quote')return renderFunctionQuoteBuilder(fn);
  if(activeFunctionTab==='planning')return renderFunctionTasks(fn);
  if(activeFunctionTab==='food')return renderFunctionFoodSection(fn);
  if(activeFunctionTab==='room')return renderFunctionJsonSection(fn,'roomSetup','Room Setup',[
    ['layout','Layout'],['room','Room / space'],['tables','Tables / seating'],['breakouts','Breakout rooms'],
    ['arrival','Registration / arrival setup'],['signage','Signage / welcome information']
  ]);
  if(activeFunctionTab==='av')return renderMeetingAV(fn);
  if(activeFunctionTab==='entertainment')return renderFunctionJsonSection(fn,'entertainment','Entertainment & Décor',[
    ['dj','DJ / entertainment'],['decor','Décor / balloons'],['cake','Cake arrangements'],
    ['lighting','Lighting'],['extras','Other extras']
  ]);
  if(activeFunctionTab==='running')return renderFunctionJsonSection(fn,'runningOrder','Running Order',[
    ['arrival','Guest / delegate arrival'],['start','Event starts'],['food','Food service'],['speeches','Speeches / presentations'],
    ['entertainment','Entertainment'],['finish','Finish / room clear']
  ]);
  if(activeFunctionTab==='accommodation')return renderFunctionJsonSection(fn,'accommodation','Accommodation',[
    ['rooms','Rooms / Room Numbers'],['names','Guest Names'],
    ['dates','Stay Dates'],['notes','Accommodation Notes']
  ]);
  if(activeFunctionTab==='payments')return renderFunctionPayments(fn);
  if(activeFunctionTab==='invoices')return renderFunctionInvoices(fn);
  return renderFunctionJsonSection(fn,'notesSection','Function Notes',[
    ['customer','Customer notes'],['internal','Internal operational notes'],['handover','On-day handover notes']
  ]);
}

function renderFunctionOverview(fn){
  const att=functionAttention(fn),tasks=functionTasksFor(fn.id),open=tasks.filter(t=>!t.completed);
  const p=fn.planning||{},food=p.food||{},room=p.roomSetup||{},av=p.av||{},run=p.runningOrder||{};
  const missing=functionMissingItems(fn),readiness=functionPlanCompleteness(fn),kind=functionPlanKind(fn);
  const packageInfo=MEETING_PACKAGES[fn.packageName];
  const equipment=[av.projector&&'Projector',av.tv1&&'TV 1',av.tv2&&'TV 2',av.pa&&'PA/Mic',av.flipchart&&'Flipchart'].filter(Boolean);
  return `<div class="space-y-4">
    <section class="fcc-hero"><div><p class="fcc-eyebrow">FUNCTION COMMAND CENTRE</p><div class="fcc-title-row"><h2>${esc(fn.clientName)}</h2><span>${esc(fn.eventType)}</span></div><p>${functionDate(fn.eventDate)} · ${esc(fn.bookingReference||'BK missing')}</p></div><div class="fcc-readiness"><small>Operational readiness</small><strong>${readiness}%</strong><div><span style="width:${readiness}%"></span></div></div></section>
    <section class="fcc-kpis">
      ${functionOverviewCard(kind==='meeting'?'Delegates':'Guests',fn.guests,'users')}
      ${functionOverviewCard('Room',fn.room||'TBC','door-open')}
      ${functionOverviewCard('Quoted Value',functionMoney(fn.quotedValue),'pound-sterling')}
      ${functionOverviewCard('Outstanding',functionMoney(functionOutstanding(fn)),'credit-card')}
      ${functionOverviewCard('Status',fn.status||'Planning','badge-check')}
    </section>
    ${fn.status==='Provisional'?`<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between gap-3 text-amber-900"><div><strong>Provisional booking</strong><p class="text-sm mt-1">Plan now; enter the BK reference when confirmed.</p></div><button onclick="openConfirmFunctionBooking('${fn.id}')" class="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold">Confirm Booking</button></div>`:''}
    <section class="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
      <div class="space-y-4">
        <div class="fcc-panel"><div class="fcc-panel-head"><div><p>FUNCTION SNAPSHOT</p><h3>What is currently planned</h3></div><button onclick="setFunctionTab('plan')">Edit Plan</button></div>
          <div class="fcc-snapshot">
            <div><small>${kind==='meeting'?'Package':'Food'}</small><strong>${esc(kind==='meeting'?(fn.packageName||'Not selected'):(food.catering||'Not selected'))}</strong></div>
            <div><small>Layout</small><strong>${esc(room.layout||'Not selected')}</strong></div>
            <div><small>Food / Lunch</small><strong>${esc(food.catering||'Not selected')}</strong></div>
            <div><small>Dietary</small><strong>${esc(food.dietary||'Not confirmed')}</strong></div>
            <div><small>Equipment</small><strong>${esc(equipment.join(', ')||'None / not selected')}</strong></div>
            <div><small>Timings</small><strong>${esc([run.arrival&&`Arrival ${run.arrival}`,run.food&&`Food ${run.food}`,run.finish&&`Finish ${run.finish}`].filter(Boolean).join(' · ')||'Not set')}</strong></div>
          </div></div>
        <div class="fcc-panel"><div class="fcc-panel-head"><div><p>NEXT ACTIONS</p><h3>${esc(att.label)}</h3><span>${esc(att.detail)}</span></div><button onclick="setFunctionTab('planning')">View Tasks</button></div>
          <div class="space-y-2">${open.slice(0,5).map(task=>`<label class="fcc-task"><input type="checkbox" onchange="toggleFunctionTask('${task.id}',this.checked)"><span><strong>${esc(task.title)}</strong><small>${esc(task.category)}${task.dueDate?' · Due '+task.dueDate:''}</small></span></label>`).join('')||'<p class="text-sm text-green-700">All planning tasks complete.</p>'}</div></div>
      </div>
      <div class="space-y-4">
        <div class="fcc-panel ${missing.length?'fcc-panel-warn':''}"><div class="fcc-panel-head"><div><p>READINESS CHECK</p><h3>${missing.length?`${missing.length} things still needed`:'Core plan ready'}</h3></div></div>
          ${missing.length?`<div class="fcc-missing-list">${missing.map(x=>`<button onclick="setFunctionTab('plan')"><i data-lucide="circle"></i>${esc(x)}</button>`).join('')}</div>`:`<div class="fcc-ready-note"><i data-lucide="check-circle-2"></i><span>Core details are in place.</span></div>`}</div>
        <div class="fcc-panel"><div class="fcc-panel-head"><div><p>COMMERCIAL</p><h3>${functionMoney(fn.quotedValue)}</h3></div><button onclick="setFunctionTab('quote')">Open Quote</button></div>
          <div class="fcc-commercial"><span><small>Paid</small><strong>${functionMoney(fn.amountPaid)}</strong></span><span><small>Outstanding</small><strong>${functionMoney(functionOutstanding(fn))}</strong></span></div>${packageInfo?`<p class="fcc-package">${esc(fn.packageName)} · ${functionMoney(packageInfo.rate)} per delegate</p>`:''}</div>
        <div class="fcc-actions">
          <button onclick="setFunctionTab('plan')"><i data-lucide="wand-sparkles"></i><span>Plan Function</span></button>
          <button onclick="setFunctionTab('quote')"><i data-lucide="calculator"></i><span>Build Quote</span></button>
          <button onclick="openFunctionInvoiceGenerator('${fn.id}')"><i data-lucide="receipt-text"></i><span>Invoice</span></button>
          <button onclick="openRezlynxTransfer('${fn.id}')"><i data-lucide="copy"></i><span>Rezlynx</span></button>
        </div>
      </div>
    </section>
  </div>`;
}

function functionOverviewCard(label,value,icon){
  return `<div class="bg-white rounded-xl border p-4"><i data-lucide="${icon}" class="text-olive-600" style="width:17px;height:17px"></i><small class="block text-xs text-gray-500 mt-2">${label}</small><strong class="block mt-1">${esc(String(value))}</strong></div>`;
}

function renderFunctionTasks(fn){
  const tasks=functionTasksFor(fn.id);
  return `<div class="space-y-4"><div class="bg-white border rounded-xl p-5 flex justify-between gap-3"><div><h3 class="font-bold text-lg">Planning Checklist</h3><p class="text-sm text-gray-500">The checklist changes depending on whether this is a meeting/conference or an event.</p></div><button onclick="openFunctionTaskForm('${fn.id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm">+ Add Task</button></div>
  <div class="space-y-2">${tasks.map(t=>`<div class="bg-white border rounded-xl p-4 flex items-start gap-3"><input type="checkbox" ${t.completed?'checked':''} onchange="toggleFunctionTask('${t.id}',this.checked)" class="mt-1"><button onclick="openFunctionTaskForm('${fn.id}','${t.id}')" class="flex-1 text-left"><div class="flex gap-2 items-center"><strong class="${t.completed?'line-through text-gray-400':''}">${esc(t.title)}</strong><span class="badge ${t.priority==='High'?'bg-red-100 text-red-700':t.priority==='Medium'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}">${esc(t.priority)}</span></div><p class="text-xs text-gray-500 mt-1">${esc(t.category)}${t.dueDate?' · Due '+t.dueDate:''}${t.assignedTo?' · '+esc(t.assignedTo):''}</p></button></div>`).join('')}</div></div>`;
}

function renderMeetingAV(fn){
  const p=fn.planning||{};
  const av=p.av||{};
  const packageInfo=MEETING_PACKAGES[fn.packageName]||MEETING_PACKAGES['Bespoke / Room Hire'];
  const kit=[
    ['projector','Projector'],['tv1','TV 1'],['tv2','TV 2'],['pa','PA / microphone'],
    ['lectern','Lectern'],['flipchart','Flipchart & pens'],['welcomeSlide','Welcome slide / screen branding'],
    ['stage','Stage'],['wifi','Wi-Fi'],['breakout','Breakout room']
  ];
  return `<div class="space-y-4">
    <div class="bg-white border rounded-xl p-5">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div><p class="text-xs font-bold tracking-widest text-olive-600">DAY DELEGATE RATE</p><h3 class="font-bold text-lg">Meeting & Conference Package</h3><p class="text-sm text-gray-500 mt-1">Rates and inclusions are based on the Windmill Farm Meeting & Conference Guide.</p></div>
        <div class="flex gap-2"><select onchange="changeFunctionMeetingPackage('${fn.id}',this.value)" class="px-3 py-2 border rounded-lg text-sm">${Object.keys(MEETING_PACKAGES).map(name=>`<option ${fn.packageName===name?'selected':''}>${esc(name)}</option>`).join('')}</select><strong class="px-4 py-2 bg-olive-100 text-olive-800 rounded-lg">${packageInfo.rate?functionMoney(packageInfo.rate)+' pp':'Custom'}</strong></div>
      </div>
      <div class="grid md:grid-cols-2 mt-4 gap-2">${packageInfo.inclusions.map(item=>`<div class="flex gap-2 items-start text-sm p-2 bg-gray-50 rounded-lg"><i data-lucide="check" class="text-green-600 mt-0.5" style="width:14px"></i><span>${esc(item)}</span></div>`).join('')}</div>
    </div>
    <div class="bg-white border rounded-xl p-5">
      <h3 class="font-bold">What equipment do they actually need?</h3><p class="text-sm text-gray-500 mt-1">Do not assume package inclusion means the equipment should automatically be set up. Tick the items the customer has confirmed.</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">${kit.map(([key,label])=>`<label class="flex items-center gap-3 p-3 border rounded-xl ${av[key]?'bg-green-50 border-green-200':''}"><input type="checkbox" ${av[key]?'checked':''} onchange="saveFunctionPlanningField('${fn.id}','av','${key}',this.checked)"><span><strong class="text-sm">${label}</strong>${key==='projector'?'<small class="block text-xs text-gray-500">Confirm connection / source</small>':''}${key==='tv1'||key==='tv2'?'<small class="block text-xs text-gray-500">Confirm content / HDMI</small>':''}</span></label>`).join('')}</div>
      <div class="grid md:grid-cols-2 gap-3 mt-4">
        <label class="text-xs font-medium text-gray-600">Presentation / AV notes<textarea rows="4" onblur="saveFunctionPlanningField('${fn.id}','av','notes',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(av.notes||'')}</textarea></label>
        <label class="text-xs font-medium text-gray-600">Presenter / organiser contact<textarea rows="4" onblur="saveFunctionPlanningField('${fn.id}','av','presenter',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(av.presenter||'')}</textarea></label>
      </div>
    </div>
    <div class="bg-white border rounded-xl p-5">
      <h3 class="font-bold">Optional Enhancements</h3><p class="text-sm text-gray-500 mt-1">Guide prices for building the delegate package.</p>
      <div class="grid md:grid-cols-2 gap-2 mt-3">${Object.entries(MEETING_ENHANCEMENTS).map(([name,price])=>`<div class="flex justify-between p-3 rounded-lg bg-gray-50 text-sm"><span>${esc(name)}</span><strong>${functionMoney(price)}${name.includes('staff')?' / hr':name.includes('stage')||name.includes('Fruit')?'':' pp'}</strong></div>`).join('')}</div>
    </div>
  </div>`;
}

async function changeFunctionMeetingPackage(id,name){
  const fn=DB.functions.find(x=>x.id===id);if(!fn)return;
  const pack=MEETING_PACKAGES[name]||MEETING_PACKAGES['Bespoke / Room Hire'];
  const suggested=pack.rate?pack.rate*Number(fn.guests||0):Number(fn.quotedValue||0);
  const {error}=await supabaseClient.from('functions').update({package_name:name,quoted_value:suggested}).eq('id',id);
  if(error){toast('Package could not be changed','error');return;}
  await loadFunctionsFromSupabase();activeFunctionId=id;renderFunctionWorkspace();toast('Meeting package updated');
}

function renderFunctionJsonSection(fn,key,title,fields){
  const data=(fn.planning||{})[key]||{};
  return `<div class="space-y-4">
    <div class="bg-white border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div><p class="text-xs font-bold tracking-widest text-olive-600">DETAILED OVERRIDE</p><h3 class="font-bold text-lg mt-1">${title}</h3><p class="text-sm text-gray-500 mt-1">Use Plan Function for the normal choices. Use these boxes only for extra detail or something unusual.</p></div>
      <button onclick="setFunctionTab('plan')" class="px-3 py-2 bg-olive-50 text-olive-800 rounded-lg text-sm font-semibold whitespace-nowrap">← Plan Function</button>
    </div>
    <div class="grid md:grid-cols-2 gap-3">${fields.map(([field,label])=>`<label class="bg-white border rounded-xl p-4 text-xs font-medium text-gray-600"><span class="font-semibold text-gray-800">${label}</span><textarea rows="3" onblur="saveFunctionPlanningField('${fn.id}','${key}','${field}',this.value)" class="mt-2 w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white">${esc(data[field]||'')}</textarea></label>`).join('')}</div>
  </div>`;
}

async function saveFunctionPlanningField(id,section,field,value){
  const fn=DB.functions.find(x=>x.id===id);if(!fn)return;
  const planning=JSON.parse(JSON.stringify(fn.planning||{}));
  planning[section]=planning[section]||{};
  planning[section][field]=value;
  const {error}=await supabaseClient.from('functions').update({planning_data:planning}).eq('id',id);
  if(error){toast('Could not save this function detail','error');return;}
  fn.planning=planning;
}

function renderFunctionPayments(fn){
  const total=Number(fn.quotedValue||0),paid=Number(fn.amountPaid||0),balance=functionOutstanding(fn);
  return `<div class="space-y-4">
    <div class="grid sm:grid-cols-3 gap-3">${functionOverviewCard('Total Value',functionMoney(total),'pound-sterling')}${functionOverviewCard('Paid',functionMoney(paid),'check-circle')}${functionOverviewCard('Outstanding',functionMoney(balance),'credit-card')}</div>
    <div class="bg-white border rounded-xl p-5"><h3 class="font-bold text-lg">Update Payment Position</h3><form onsubmit="saveFunctionFinancials(event,'${fn.id}')" class="grid sm:grid-cols-2 gap-3 mt-4"><label class="text-xs font-medium text-gray-600">Quoted / Agreed Value (£)<input name="quoted" type="number" step=".01" value="${total}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><label class="text-xs font-medium text-gray-600">Amount Paid (£)<input name="paid" type="number" step=".01" value="${paid}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><button class="sm:col-span-2 py-2.5 bg-olive-600 text-white rounded-lg font-semibold">Save Financials</button></form></div>
  </div>`;
}

async function saveFunctionFinancials(ev,id){
  ev.preventDefault();const f=new FormData(ev.target);
  const {error}=await supabaseClient.from('functions').update({quoted_value:Number(f.get('quoted')||0),amount_paid:Number(f.get('paid')||0)}).eq('id',id);
  if(error){toast('Financials could not be saved','error');return;}
  await loadFunctionsFromSupabase();activeFunctionId=id;renderFunctionWorkspace();toast('Function financials saved');
}


function openConfirmFunctionBooking(id){
  const fn=DB.functions.find(x=>x.id===id);if(!fn)return;
  openModal(`<div class="p-6">
    <div class="flex justify-between items-start gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">CONFIRM FUNCTION</p><h2 class="text-xl font-bold mt-1">${esc(fn.clientName)}</h2><p class="text-sm text-gray-500 mt-1">Enter the Rezlynx booking reference to move this from Provisional to Confirmed.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="confirmFunctionBooking(event,'${id}')" class="mt-5 space-y-4">
      <label class="text-xs font-medium text-gray-600 block">Rezlynx BK Reference *<input required name="bookingReference" placeholder="BK123456" value="${esc(fn.bookingReference||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm uppercase"></label>
      <div class="bg-olive-50 border border-olive-200 rounded-lg p-3 text-xs text-olive-800">Once confirmed, the full planning checklist remains active and the BK reference becomes the permanent link back to Rezlynx.</div>
      <button class="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold">Confirm Booking</button>
    </form>
  </div>`);
}

async function confirmFunctionBooking(ev,id){
  ev.preventDefault();
  const ref=String(new FormData(ev.target).get('bookingReference')||'').trim().toUpperCase();
  if(!/^BK[A-Z0-9-]+$/.test(ref)){toast('Enter a valid Rezlynx BK reference beginning BK','error');return;}
  const {error}=await supabaseClient.from('functions').update({booking_reference:ref,status:'Confirmed'}).eq('id',id);
  if(error){console.error(error);toast(`Booking could not be confirmed: ${error.message||'Supabase error'}`,'error');return;}
  closeModal();await loadFunctionsFromSupabase();activeFunctionId=id;renderFunctionWorkspace();toast('Function confirmed and linked to Rezlynx');
}

function openFunctionForm(id=''){
  const fn=id?DB.functions.find(x=>x.id===id):null;
  openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">FUNCTIONS CENTRE</p><h2 class="text-lg font-bold">${fn?'Edit':'New'} Function</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
  <form onsubmit="saveFunctionForm(event,'${id}')" class="space-y-3">
    <div class="grid sm:grid-cols-2 gap-3">
      <label class="text-xs font-medium text-gray-600">Client / Function Name *<input required name="clientName" value="${esc(fn?.clientName||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Rezlynx BK Reference <span class="text-gray-400">(required when confirmed)</span><input name="bookingReference" value="${esc(fn?.bookingReference||'')}" placeholder="BK123456" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Function Type<select name="eventType" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${FUNCTION_TYPES.map(t=>`<option ${fn?.eventType===t?'selected':''}>${t}</option>`).join('')}</select></label>
      <label class="text-xs font-medium text-gray-600">Event Date<input type="date" name="eventDate" value="${fn?.eventDate||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Start Time<input type="time" name="startTime" value="${fn?.startTime||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">End Time<input type="time" name="endTime" value="${fn?.endTime||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Provisional Hold / Chase Date<input type="date" name="holdUntil" value="${fn?.planning?.booking?.holdUntil||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Guests / Delegates<input type="number" name="guests" value="${fn?.guests||0}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Coordinator<select name="coordinator" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(fn?.coordinator||'',true)}</select></label>
      <label class="text-xs font-medium text-gray-600">Room<input name="room" value="${esc(fn?.room||'')}" placeholder="The Granary / Meeting Room…" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Status<select name="status" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${['Provisional','Confirmed','Planning','Ready','Completed','Cancelled'].map(s=>`<option ${fn?.status===s?'selected':''} ${!fn&&s==='Provisional'?'selected':''}>${s}</option>`).join('')}</select></label>
      <label class="text-xs font-medium text-gray-600">Quoted Value (£)<input type="number" step=".01" name="quotedValue" value="${fn?.quotedValue||0}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Amount Paid (£)<input type="number" step=".01" name="amountPaid" value="${fn?.amountPaid||0}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
    </div>
    <label class="text-xs font-medium text-gray-600 block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(fn?.notes||'')}</textarea></label>
    <div class="rounded-lg bg-olive-50 border border-olive-200 p-3 text-xs text-olive-800">
      Provisional bookings can be saved without a BK reference. Enter the BK only when the booking is confirmed.
    </div>
    <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-semibold">Save Function</button>
  </form></div>`);
}

async function saveFunctionForm(ev,id){
  ev.preventDefault();const f=new FormData(ev.target);
  const ref=String(f.get('bookingReference')||'').trim().toUpperCase();
  const status=String(f.get('status')||'Provisional');
  const needsBK=['Confirmed','Planning','Ready','Completed'].includes(status);
  if(needsBK&&!/^BK[A-Z0-9-]+$/.test(ref)){toast('Enter a valid Rezlynx BK reference before confirming this booking','error');return;}
  if(ref&&!/^BK[A-Z0-9-]+$/.test(ref)){toast('BK reference must begin BK','error');return;}
  const eventType=f.get('eventType');
  const record={
    booking_reference:ref||null,client_name:f.get('clientName'),event_type:eventType,event_date:f.get('eventDate')||null,
    start_time:f.get('startTime')||null,end_time:f.get('endTime')||null,guests:Number(f.get('guests')||0),
    coordinator:f.get('coordinator')||null,room:f.get('room')||null,status:status,
    quoted_value:Number(f.get('quotedValue')||0),amount_paid:Number(f.get('amountPaid')||0),notes:f.get('notes')||null
  };

  const existingFunction=id?DB.functions.find(x=>x.id===id):null;
  const planning=JSON.parse(JSON.stringify(existingFunction?.planning||{}));
  planning.booking=planning.booking||{};
  planning.booking.holdUntil=f.get('holdUntil')||null;
  record.planning_data=planning;
  let result;
  if(id)result=await supabaseClient.from('functions').update(record).eq('id',id).select().single();
  else{
    record.package_name=MEETING_TYPES.includes(eventType)?'Standard Day Delegate Package':null;
    result=await supabaseClient.from('functions').insert(record).select().single();
  }
  if(result.error){console.error(result.error);toast('Function could not be saved','error');return;}
  if(!id){
    const template=MEETING_TYPES.includes(eventType)?FUNCTION_TASKS_MEETING:FUNCTION_TASKS_EVENT;
    await supabaseClient.from('function_tasks').insert(template.map(([title,category,priority],index)=>({function_id:result.data.id,title,category,priority,assigned_to:record.coordinator,sort_order:index})));
  }
  closeModal();await loadFunctionsFromSupabase();renderSection();toast(id?'Function updated':'Function created');
}

function openFunctionTaskForm(functionId,taskId=''){
  const t=taskId?(DB.functionTasks||[]).find(x=>x.id===taskId):null;
  openModal(`<div class="p-6"><h2 class="font-bold text-lg">${t?'Edit':'Add'} Function Task</h2><form onsubmit="saveFunctionTask(event,'${functionId}','${taskId}')" class="space-y-3 mt-4"><label class="text-xs font-medium text-gray-600 block">Task *<input required name="title" value="${esc(t?.title||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><div class="grid sm:grid-cols-2 gap-3"><label class="text-xs font-medium text-gray-600">Category<input name="category" value="${esc(t?.category||'Planning')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><label class="text-xs font-medium text-gray-600">Priority<select name="priority" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${['High','Medium','Low'].map(x=>`<option ${t?.priority===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="text-xs font-medium text-gray-600">Due Date<input type="date" name="dueDate" value="${t?.dueDate||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><label class="text-xs font-medium text-gray-600">Assigned To<select name="assignedTo" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(t?.assignedTo||'',true)}</select></label></div><button class="w-full py-2.5 bg-olive-600 text-white rounded-lg">Save Task</button></form></div>`);
}

async function saveFunctionTask(ev,functionId,taskId){
  ev.preventDefault();const f=new FormData(ev.target);const record={function_id:functionId,title:f.get('title'),category:f.get('category')||'Planning',priority:f.get('priority')||'Medium',due_date:f.get('dueDate')||null,assigned_to:f.get('assignedTo')||null};
  const result=taskId?await supabaseClient.from('function_tasks').update(record).eq('id',taskId):await supabaseClient.from('function_tasks').insert(record);
  if(result.error){toast('Task could not be saved','error');return;}closeModal();await loadFunctionsFromSupabase();activeFunctionId=functionId;renderFunctionWorkspace();toast('Task saved');
}

async function toggleFunctionTask(id,completed){
  const {error}=await supabaseClient.from('function_tasks').update({completed,completed_at:completed?new Date().toISOString():null}).eq('id',id);
  if(error){toast('Task could not be updated','error');return;}await loadFunctionsFromSupabase();if(activeFunctionId)renderFunctionWorkspace();else renderSection();
}

(function injectFunctionsCentreStyles(){
  if(document.getElementById('functions-centre-styles'))return;
  const style=document.createElement('style');style.id='functions-centre-styles';style.textContent=`

  
  .fq-shell{display:flex;flex-direction:column;gap:14px}.fq-hero{display:flex;justify-content:space-between;align-items:center;gap:20px;background:linear-gradient(135deg,#19251e,#526b3d);color:white;border-radius:16px;padding:22px 24px}.fq-hero p,.fq-head p{font-size:.62rem;font-weight:900;letter-spacing:.15em;color:#dfbd4e}.fq-hero h2{font-size:1.45rem;font-weight:800;margin-top:3px}.fq-hero span{display:block;font-size:.78rem;color:rgba(255,255,255,.7);margin-top:4px}.fq-value{text-align:right}.fq-value small,.fq-value em{display:block;font-size:.65rem;color:rgba(255,255,255,.6);font-style:normal}.fq-value strong{display:block;font-size:1.65rem}.fq-card{background:#fff;border:1px solid #e1e6de;border-radius:15px;padding:18px}.fq-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.fq-head h3{font-size:1rem;font-weight:800}.fq-presets{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.fq-presets button{padding:11px;border:1px solid #dfe5db;border-radius:10px;text-align:left;background:#fbfcfa}.fq-presets button:hover{border-color:#718b52;background:#f3f7ee}.fq-presets strong,.fq-presets span{display:block}.fq-presets strong{font-size:.7rem}.fq-presets span{font-size:.62rem;color:#74806f;margin-top:2px}.fq-small{margin-top:8px}.fq-source-note{margin-top:10px;padding:10px 12px;border-radius:9px;background:#fff9e8;border:1px solid #f0df9f;font-size:.7rem;color:#655622}.fq-labels,.fq-line{display:grid;grid-template-columns:120px minmax(180px,1fr) 80px 105px 105px 34px;gap:7px;align-items:center}.fq-labels{font-size:.61rem;font-weight:800;color:#7d8679;padding:0 5px 6px}.fq-line select,.fq-line input{min-width:0;padding:9px;border:1px solid #dfe4dc;border-radius:8px;font-size:.75rem;background:#fbfcfa}.fq-line>strong{text-align:right;font-size:.75rem}.fq-line>button{height:34px;border-radius:8px;background:#fff0f0;color:#b53434;font-weight:900}.fq-add{padding:7px 10px;background:#eef3e8;color:#526b3d;border-radius:8px;font-size:.7rem;font-weight:800}.fq-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:14px}.fq-total-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #edf0eb;font-size:.78rem}.fq-grand{font-size:1rem;border-bottom:0}.fq-grand strong{color:#5e7842}.fq-vat-note{display:block;margin-top:8px;font-size:.62rem;color:#858e82}.fq-savebar{position:sticky;bottom:10px;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 15px;background:rgba(26,34,28,.96);color:#fff;border-radius:13px;box-shadow:0 12px 30px rgba(0,0,0,.18)}.fq-savebar strong{display:block;font-size:.8rem}.fq-savebar small{display:block;font-size:.64rem;color:rgba(255,255,255,.6);margin-top:2px}.fq-save{display:flex;align-items:center;gap:7px;padding:10px 16px;border-radius:9px;background:#72914e;font-size:.78rem;font-weight:800;white-space:nowrap}.fq-save svg{width:15px}@media(max-width:950px){.fq-presets{grid-template-columns:repeat(2,minmax(0,1fr))}.fq-grid{grid-template-columns:1fr}.fq-labels{display:none}.fq-line{grid-template-columns:1fr 1fr}.fq-line>strong{grid-column:1/2;text-align:left}.fq-line>button{grid-column:2/3}}@media(max-width:600px){.fq-hero{flex-direction:column;align-items:flex-start}.fq-value{text-align:left}.fq-presets{grid-template-columns:1fr}.fq-line{grid-template-columns:1fr}.fq-line>strong,.fq-line>button{grid-column:auto}.fq-savebar{flex-direction:column;align-items:flex-start}.fq-save{width:100%;justify-content:center}}

  
  .fpc-shell{display:flex;flex-direction:column;gap:12px}.fpc-command{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px 20px;border-radius:15px;background:linear-gradient(135deg,#293b31,#617846);color:#fff}.fpc-eyebrow,.fcc-eyebrow{font-size:.61rem;font-weight:900;letter-spacing:.16em;color:#e2c25a}.fpc-command h2{font-size:1.3rem;font-weight:800;margin-top:2px}.fpc-summary{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.fpc-summary span{padding:4px 7px;border-radius:999px;background:rgba(255,255,255,.1);font-size:.62rem}.fpc-readiness{width:165px;text-align:right}.fpc-readiness small{display:block;font-size:.62rem;color:rgba(255,255,255,.65)}.fpc-readiness strong{display:block;font-size:1.45rem}.fpc-progress{height:6px;background:rgba(255,255,255,.18);border-radius:99px;overflow:hidden}.fpc-progress span{display:block;height:100%;background:#e2c25a}
  .fpc-missing,.fpc-ready{padding:12px 14px;border-radius:11px}.fpc-missing{background:#fff8e7;border:1px solid #eedb9d;color:#6f5b1e}.fpc-missing>div{display:flex;align-items:center;gap:7px}.fpc-missing svg{width:15px}.fpc-missing p{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.fpc-missing p span{font-size:.63rem;padding:4px 7px;background:#fff;border:1px solid #eedb9d;border-radius:999px}.fpc-ready{display:flex;align-items:center;gap:8px;background:#eef7eb;border:1px solid #cfe3c8;color:#42643b;font-size:.72rem}
  .fpc-section{background:#fff;border:1px solid #dfe5dc;border-radius:13px;overflow:hidden}.fpc-section summary{display:flex;align-items:center;gap:10px;padding:13px 15px;cursor:pointer;list-style:none}.fpc-section summary::-webkit-details-marker{display:none}.fpc-section-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;background:#eef3e8;color:#607b45}.fpc-section-icon svg{width:15px}.fpc-section-title{display:flex;flex-direction:column;flex:1}.fpc-section-title small{font-size:.56rem;font-weight:900;letter-spacing:.14em;color:#6f8553}.fpc-section-title strong{font-size:.84rem}.fpc-chevron svg{width:15px;transition:.2s}.fpc-section[open] .fpc-chevron svg{transform:rotate(180deg)}.fpc-section-body{padding:13px 15px 15px;border-top:1px solid #edf0eb}
  .fpc-actions{display:flex;justify-content:flex-end;gap:8px;padding:10px;background:#1b231d;color:#fff;border-radius:12px}.fpc-actions button{display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:8px;font-size:.72rem;font-weight:800}.fpc-actions svg{width:14px}.fpc-primary{background:#71904e;color:#fff}.fpc-secondary{background:#fff;color:#344332}.fpc-dark{background:#111827;color:#fff}
  .fcc-hero{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px 20px;border-radius:15px;background:linear-gradient(135deg,#293b31,#617846);color:#fff}.fcc-title-row{display:flex;align-items:center;gap:8px}.fcc-title-row h2{font-size:1.45rem;font-weight:800}.fcc-title-row span{padding:4px 7px;border-radius:999px;background:rgba(255,255,255,.12);font-size:.61rem}.fcc-hero>div>p:last-child{font-size:.7rem;color:rgba(255,255,255,.65);margin-top:3px}.fcc-readiness{min-width:160px;text-align:right}.fcc-readiness small{display:block;font-size:.61rem;color:rgba(255,255,255,.65)}.fcc-readiness strong{display:block;font-size:1.45rem}.fcc-readiness>div{height:6px;background:rgba(255,255,255,.18);border-radius:99px;overflow:hidden}.fcc-readiness>div span{display:block;height:100%;background:#e2c25a}
  .fcc-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.fcc-panel{background:#fff;border:1px solid #dfe5dc;border-radius:13px;padding:15px}.fcc-panel-warn{border-color:#ecd88f;background:#fffdf7}.fcc-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}.fcc-panel-head p{font-size:.57rem;font-weight:900;letter-spacing:.14em;color:#6e8353}.fcc-panel-head h3{font-size:.92rem;font-weight:800;margin-top:2px}.fcc-panel-head span{display:block;font-size:.65rem;color:#7f887c;margin-top:2px}.fcc-panel-head button{padding:6px 8px;border-radius:7px;background:#eef3e8;color:#5d7445;font-size:.63rem;font-weight:800}.fcc-snapshot{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.fcc-snapshot>div{padding:10px;border-radius:9px;background:#f7f9f5}.fcc-snapshot small,.fcc-commercial small{display:block;font-size:.58rem;color:#7f897d}.fcc-snapshot strong{display:block;font-size:.7rem;margin-top:2px}.fcc-task{display:flex;gap:9px;padding:9px;border-radius:8px;background:#f8faf7}.fcc-task strong{display:block;font-size:.69rem}.fcc-task small{display:block;font-size:.59rem;color:#858e82;margin-top:1px}.fcc-missing-list{display:flex;flex-direction:column;gap:5px}.fcc-missing-list button{display:flex;align-items:center;gap:6px;width:100%;padding:7px;text-align:left;border-radius:7px;background:#fff9e9;font-size:.66rem}.fcc-missing-list svg{width:11px}.fcc-ready-note{display:flex;align-items:center;gap:8px;font-size:.66rem;color:#517148}.fcc-commercial{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fcc-commercial span{padding:9px;border-radius:8px;background:#f7f9f5}.fcc-commercial strong{display:block;font-size:.78rem}.fcc-package{margin-top:8px;font-size:.62rem;color:#6d7869}.fcc-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fcc-actions button{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid #dfe5dc;border-radius:9px;background:#fff;font-size:.67rem;font-weight:750}.fcc-actions svg{width:15px;color:#637b49}
  @media(max-width:1050px){.fcc-kpis{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.fpc-command,.fcc-hero{flex-direction:column;align-items:flex-start}.fpc-readiness,.fcc-readiness{width:100%;text-align:left}.fcc-kpis{grid-template-columns:1fr 1fr}.fcc-snapshot{grid-template-columns:1fr}.fpc-actions{overflow-x:auto;justify-content:flex-start}.fpc-actions button{white-space:nowrap}}

  .fp-shell{display:flex;flex-direction:column;gap:14px}
  .fp-hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 24px;border-radius:16px;background:linear-gradient(135deg,#293b31,#617846);color:#fff}
  .fp-eyebrow{font-size:.65rem;font-weight:900;letter-spacing:.17em;color:#e4c45f}.fp-hero h2{font-size:1.55rem;font-weight:800;margin-top:3px}.fp-hero p:not(.fp-eyebrow){font-size:.82rem;color:rgba(255,255,255,.72);margin-top:4px}
  .fp-completion{min-width:170px;text-align:right}.fp-completion small{display:block;font-size:.68rem;color:rgba(255,255,255,.65)}.fp-completion strong{display:block;font-size:1.55rem}.fp-completion>div{height:7px;background:rgba(255,255,255,.18);border-radius:99px;overflow:hidden;margin-top:6px}.fp-completion>div>span{display:block;height:100%;background:#e4c45f;border-radius:99px}
  .fp-section{background:#fff;border:1px solid #e1e6de;border-radius:15px;padding:18px}.fp-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px}.fp-section-head p{font-size:.62rem;font-weight:900;letter-spacing:.14em;color:#6a824d}.fp-section-head h3{font-size:1.05rem;font-weight:800;margin-top:2px}.fp-section-icon{width:36px;height:36px;border-radius:9px;background:#eef3e8;color:#617846;display:grid;place-items:center}.fp-section-icon svg{width:17px}
  .fp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.fp-field{display:flex;flex-direction:column;gap:5px;font-size:.72rem;font-weight:650;color:#586255}.fp-field input,.fp-field select,.fp-field textarea{width:100%;padding:10px 11px;border:1px solid #dce2d8;border-radius:9px;background:#fbfcfa;font-size:.82rem;font-weight:400;color:#172018;outline:none}.fp-field input:focus,.fp-field select:focus,.fp-field textarea:focus{border-color:#758e56;background:#fff;box-shadow:0 0 0 3px rgba(117,142,86,.1)}.fp-field small{font-size:.62rem;font-weight:400;color:#8a9387}.fp-wide{grid-column:span 2}
  .fp-toggle-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.fp-toggle{display:flex;align-items:flex-start;gap:8px;padding:11px;border:1px solid #dfe5dc;border-radius:10px;background:#fbfcfa;cursor:pointer}.fp-toggle input{margin-top:2px;accent-color:#627c45}.fp-toggle strong{display:block;font-size:.72rem}.fp-toggle small{display:block;font-size:.59rem;color:#8a9387;margin-top:2px}
  .fp-package-note{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding:10px 12px;border-radius:10px;background:#f3f6ef;border:1px solid #e1e8da;font-size:.72rem}.fp-package-note span{font-weight:800;color:#617846}.fp-package-note small{width:100%;color:#7d867a}
  .fp-savebar{position:sticky;bottom:10px;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 15px;background:rgba(26,34,28,.96);color:#fff;border-radius:13px;box-shadow:0 12px 30px rgba(0,0,0,.18)}.fp-savebar strong{display:block;font-size:.8rem}.fp-savebar small{display:block;font-size:.65rem;color:rgba(255,255,255,.6);margin-top:2px}.fp-save{display:flex;align-items:center;gap:7px;padding:10px 16px;border-radius:9px;background:#72914e;font-size:.78rem;font-weight:800;white-space:nowrap}.fp-save svg{width:15px}
  @media(max-width:1050px){.fp-toggle-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.fp-hero{align-items:flex-start;flex-direction:column}.fp-completion{width:100%;text-align:left}.fp-grid{grid-template-columns:1fr}.fp-wide{grid-column:auto}.fp-toggle-grid{grid-template-columns:1fr 1fr}.fp-savebar{align-items:flex-start;flex-direction:column}.fp-save{width:100%;justify-content:center}}

    .fc-shell{display:flex;flex-direction:column;gap:14px}.fc-eyebrow{font-size:.65rem;font-weight:900;letter-spacing:.16em;color:#ddb94e}.fc-eyebrow.olive{color:#667f49}.fc-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding:24px 26px;border-radius:20px;color:#fff;background:radial-gradient(circle at 86% 10%,rgba(222,187,79,.25),transparent 22rem),linear-gradient(135deg,#283a31,#4d6540 65%,#748b4f)}.fc-hero h2{font-size:2rem;font-weight:850;line-height:1}.fc-hero p:last-child{font-size:.78rem;color:rgba(255,255,255,.76);margin-top:7px}.fc-actions button{display:flex;gap:6px;align-items:center;padding:10px 13px;border-radius:9px;font-size:.65rem;font-weight:850}.fc-actions .secondary{background:#fff;color:#526a3e}.fc-actions svg{width:15px}
  .fc-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}.fc-kpis article{display:flex;gap:10px;padding:14px;border:1px solid #e1e7dd;border-radius:15px;background:#fff}.fc-kpis article>span{width:39px;height:39px;display:grid;place-items:center;border-radius:10px}.fc-kpis .olive{background:#edf3e6;color:#607a42}.fc-kpis .gold{background:#fff5d9;color:#aa7b19}.fc-kpis .red{background:#fff0f0;color:#b64949}.fc-kpis .green{background:#eaf7ed;color:#458151}.fc-kpis .teal{background:#e8f4f1;color:#3f8175}.fc-kpis svg{width:17px}.fc-kpis small{display:block;font-size:.56rem;color:#788276}.fc-kpis strong{display:block;font-size:1.1rem;margin-top:2px}.fc-kpis p{font-size:.47rem;color:#939b91;margin-top:3px}
  .fc-main-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:12px}.fc-panel{border:1px solid #e1e7dd;border-radius:16px;background:#fff;overflow:hidden}.fc-panel-head{display:flex;justify-content:space-between;align-items:flex-start;padding:15px 16px 11px}.fc-panel-head h3{font-size:1rem;font-weight:850}.fc-panel-head span{font-size:.56rem;color:#858e82}.fc-panel-head.all{align-items:center;border-bottom:1px solid #edf0eb}.fc-panel-head.all button{padding:7px 9px;border-radius:7px;background:#f1f4ef;font-size:.54rem;font-weight:800}.fc-panel-head.all button.fc-active{background:#5f793f;color:#fff}
  .fc-row{display:grid;grid-template-columns:45px minmax(0,1fr) 105px 115px;gap:9px;align-items:center;width:100%;padding:9px 13px;border-top:1px solid #edf0eb;text-align:left}.fc-date{width:42px;height:42px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:9px;background:#edf3e6;color:#59723e}.fc-date strong{font-size:.75rem}.fc-date span{font-size:.43rem;font-weight:900}.fc-row-main>div{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.fc-row-main strong{font-size:.61rem}.fc-type{padding:3px 5px;border-radius:999px;background:#f1f3ef;font-size:.44rem;color:#727c6e}.fc-row-main small,.fc-health small,.fc-value small{display:block;font-size:.46rem;color:#858e82;margin-top:2px}.fc-health,.fc-value{text-align:right}.fc-health strong,.fc-value strong{font-size:.58rem}
  .fc-attention{padding:0 11px 11px}.fc-att-row{display:grid;grid-template-columns:34px minmax(0,1fr) 90px;gap:8px;align-items:center;width:100%;padding:9px 3px;border-top:1px solid #edf0eb;text-align:left}.fc-att-row>span{width:31px;height:31px;display:grid;place-items:center;border-radius:8px}.fc-att-row.red>span{background:#fff0f0;color:#b64949}.fc-att-row.amber>span{background:#fff6df;color:#a2771f}.fc-att-row.green>span{background:#edf7ee;color:#4f8156}.fc-att-row svg{width:14px}.fc-att-row strong{display:block;font-size:.58rem}.fc-att-row small{display:block;font-size:.46rem;color:#878f84}.fc-att-row em{font-size:.45rem;font-style:normal;color:#7f897c;text-align:right}.fc-empty{padding:28px;text-align:center;color:#8e968c;font-size:.6rem}
  .fc-filters{display:grid;grid-template-columns:minmax(260px,1fr) repeat(3,170px);gap:8px;padding:12px 14px}.fc-filters select,.fc-search{height:39px;border:1px solid #dfe5da;border-radius:8px}.fc-filters select{padding:0 8px;font-size:.58rem}.fc-search{display:flex;align-items:center;gap:7px;padding:0 10px}.fc-search svg{width:14px;color:#8a9387}.fc-search input{width:100%;border:0;outline:0;font-size:.6rem}.fc-list{padding:0 14px 14px;display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.fc-card{padding:13px;border:1px solid #e2e7de;border-radius:12px;text-align:left}.fc-card-head{display:flex;justify-content:space-between;gap:10px}.fc-card-head strong{display:block;font-size:.68rem}.fc-card-head>div span{font-size:.48rem;color:#838c80}.fc-status{padding:4px 6px;border-radius:999px;font-size:.46rem;font-weight:850}.fc-status.red{background:#fff0f0;color:#ad4545}.fc-status.amber{background:#fff6df;color:#986e19}.fc-status.green{background:#edf7ee;color:#4e8055}.fc-card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.fc-card-grid div{padding:7px;border-radius:8px;background:#f6f8f4}.fc-card-grid small{display:block;font-size:.43rem;color:#848d81}.fc-card-grid strong{display:block;font-size:.53rem;margin-top:2px}
  @media(max-width:1200px){.fc-kpis{grid-template-columns:repeat(3,1fr)}.fc-main-grid{grid-template-columns:1fr}.fc-filters{grid-template-columns:1fr 1fr}.fc-search{grid-column:1/-1}}@media(max-width:800px){.fc-kpis{grid-template-columns:1fr 1fr}.fc-list{grid-template-columns:1fr}.fc-row{grid-template-columns:45px minmax(0,1fr) 90px}.fc-value{display:none}}@media(max-width:600px){.fc-hero{align-items:flex-start;flex-direction:column}.fc-kpis{grid-template-columns:1fr}.fc-filters{grid-template-columns:1fr}.fc-search{grid-column:auto}.fc-card-grid{grid-template-columns:1fr 1fr}}
  `;document.head.appendChild(style);
})();
