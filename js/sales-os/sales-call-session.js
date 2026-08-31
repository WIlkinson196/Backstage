// SALES OS 2.0 — PHASE 2: GUIDED SALES SESSION
// Replaces the old Live Call experience with a queue-based guided selling workspace.
// Uses the existing sales_leads + sales_lead_activities schema; no migration required.

SalesOS.SESSION_MARKER_START='--- SALES OS 2 SESSION ---';
SalesOS.SESSION_MARKER_END='--- END SALES OS 2 SESSION ---';

SalesOS.salesPlay=function(lead){
  const sector=String(lead.businessType||'').toLowerCase();
  const plays=[
    {
      match:/network|association|membership|property/,
      name:'Networking / Association',
      objective:'Understand the recurring format and secure a venue visit or trial event.',
      opener:'I wanted to understand how your events currently work and what makes a venue genuinely useful for your members, rather than just send you a generic room-hire price.',
      discovery:[
        ['frequency','How often do you run events?','Frequency'],
        ['attendance','What is your typical attendance?','Attendance'],
        ['format','What does the event normally look like — networking, speakers, food, breaks?','Format'],
        ['currentVenue','Where are you currently holding them?','Current venue'],
        ['works','What works well with the current venue?','Current strengths'],
        ['pain','If you could improve one thing about the current setup, what would it be?','Pain / improvement'],
        ['spend','Roughly what does a typical event cost or spend with the venue?','Current spend'],
        ['decision','Who ultimately decides where the group meets?','Decision maker'],
        ['decisionDate','When would you realistically review or change venue?','Decision timing']
      ],
      services:['Networking Events','Meetings','Private Dining','Accommodation'],
      close:'Would it make sense to come over for a short look around so you can compare the space properly before making any decision?'
    },
    {
      match:/funeral/,
      name:'Funeral Director Partnership',
      objective:'Build a professional referral relationship, not a hard sell.',
      opener:'I wanted to introduce Windmill Farm as an option you can confidently mention to families when they need somewhere private, easy to reach and flexible after a service.',
      discovery:[
        ['typicalNumbers','What sort of guest numbers do families most commonly need?','Typical numbers'],
        ['leadTime','How much notice do you normally have for wake arrangements?','Lead time'],
        ['needs','What do families ask you about most when choosing a venue?','Family priorities'],
        ['food','What catering style tends to work best?','Catering'],
        ['access','Are parking and accessibility common concerns?','Access needs'],
        ['currentOptions','Which venues do you currently recommend or see families using?','Current options'],
        ['gaps','Is there anything families struggle to find locally?','Market gap'],
        ['contactProcess','Who in your team normally gives venue information to families?','Referral process']
      ],
      services:['Wakes','Private Dining','Accommodation'],
      close:'Would it be useful if I brought over a simple information pack and showed you the room so your team knows exactly what we can offer families?'
    },
    {
      match:/construction|manufacturer|engineering|industrial|logistics/,
      name:'Local Employer',
      objective:'Identify recurring business needs and get to the organiser or decision maker.',
      opener:'We work with local employers on meetings, training, recruitment, accommodation and staff events. I wanted to understand what you organise across a normal year and whether we could make any of it easier.',
      discovery:[
        ['organiser','Who normally organises meetings, training or staff events?','Organiser'],
        ['frequency','What do you take off-site during a typical year?','Event frequency'],
        ['training','Do you run training, inductions or recruitment days?','Training / recruitment'],
        ['numbers','What sort of group sizes are typical?','Group size'],
        ['currentVenue','Where do you usually go currently?','Current venue'],
        ['pain','What causes the most hassle with external venues?','Pain / friction'],
        ['accommodation','Do contractors, trainers or visitors ever need bedrooms?','Accommodation'],
        ['christmas','Who organises your Christmas or staff celebration?','Christmas'],
        ['decision','Who approves venue spend?','Decision maker'],
        ['timing','What is the next event we could realistically help with?','Next opportunity']
      ],
      services:['Meetings','Training Days','Recruitment Events','Christmas Parties','Staff Celebrations','Accommodation','Awards Evenings'],
      close:'Rather than changing everything, could we host one upcoming meeting or training day so you can see how the venue works for your team?'
    },
    {
      match:/care|health/,
      name:'Care / Healthcare',
      objective:'Find recurring meetings, training, recruitment, family and staff-event opportunities.',
      opener:'We support local organisations with training, interviews, team meetings, staff celebrations and accommodation. I wanted to understand what you currently organise externally.',
      discovery:[
        ['organiser','Who normally books external meetings or events?','Organiser'],
        ['training','How often do you run training or recruitment sessions?','Training frequency'],
        ['numbers','What group sizes are typical?','Group size'],
        ['family','Do you ever arrange family meetings or larger gatherings?','Family events'],
        ['staff','What do you do for staff celebrations or Christmas?','Staff events'],
        ['currentVenue','Where do you usually go?','Current venue'],
        ['pain','What would make an external venue easier for your team?','Pain / improvement'],
        ['decision','Who gives final approval?','Decision maker'],
        ['timing','What is the next realistic requirement?','Next opportunity']
      ],
      services:['Meetings','Training Days','Recruitment Events','Staff Celebrations','Christmas Parties','Private Dining','Accommodation'],
      close:'Would a quick venue tour be useful so you know what is available before the next requirement comes up?'
    },
    {
      match:/education|school|college|academy/,
      name:'Education',
      objective:'Open opportunities for INSET, meetings, recruitment, celebrations and accommodation.',
      opener:'We work with local organisations on meetings, training and events, and I wanted to understand what your school or trust takes off-site during the year.',
      discovery:[
        ['organiser','Who arranges off-site meetings, INSET or staff events?','Organiser'],
        ['inset','Do you ever take INSET or training days off-site?','INSET / training'],
        ['governors','Where do governor or leadership meetings take place?','Meetings'],
        ['celebrations','What staff celebrations, awards or end-of-year events do you run?','Celebrations'],
        ['numbers','What sizes are typical?','Group size'],
        ['currentVenue','Which venues do you currently use?','Current venue'],
        ['pain','What would you improve about those arrangements?','Pain / improvement'],
        ['decision','Who approves bookings?','Decision maker'],
        ['timing','What is the next relevant date or planning cycle?','Timing']
      ],
      services:['Training Days','Meetings','Recruitment Events','Staff Celebrations','Awards Evenings','Accommodation'],
      close:'Could I invite the organiser over for coffee and a quick tour before your next planning cycle?'
    },
    {
      match:/sport|club/,
      name:'Sports Club / Society',
      objective:'Identify awards, dinners, committees, fundraising and accommodation opportunities.',
      opener:'I wanted to understand what the club organises across the season — awards, meetings, dinners, fundraising or accommodation — and whether we could support any of it.',
      discovery:[
        ['calendar','What are the main events in your annual calendar?','Annual calendar'],
        ['awards','Where do you hold awards or presentation evenings?','Awards'],
        ['numbers','What attendance do those events normally get?','Attendance'],
        ['meetings','Do committee or AGM meetings ever need external space?','Meetings'],
        ['fundraising','Do you run fundraising or sponsor events?','Fundraising'],
        ['currentVenue','Where do you currently hold larger events?','Current venue'],
        ['pain','What would make those events easier or better?','Pain / improvement'],
        ['decision','Who decides venues?','Decision maker'],
        ['timing','What is the next event we could help with?','Next opportunity']
      ],
      services:['Awards Evenings','Private Dining','Meetings','Staff Celebrations','Accommodation'],
      close:'Would it be worth showing you the function space before the next awards or club event is planned?'
    }
  ];
  const fallback={
    name:'Local Business Discovery',
    objective:SalesOS.nextObjective?SalesOS.nextObjective(lead):'Create a two-way conversation and agree a dated next step.',
    opener:'We work with local organisations on meetings, training, staff events, private functions and accommodation. I wanted to understand what you organise across a normal year and whether we could help with anything coming up.',
    discovery:[
      ['organiser','Who normally organises meetings, events or accommodation?','Organiser'],
      ['calendar','What events or external meetings do you run across a typical year?','Annual requirements'],
      ['numbers','What group sizes are typical?','Group size'],
      ['currentVenue','Where do you currently hold them?','Current venue'],
      ['works','What works well with your current arrangements?','Current strengths'],
      ['pain','What would you improve if you could?','Pain / improvement'],
      ['spend','Do you know roughly what you normally spend?','Spend / budget'],
      ['decision','Who makes the final venue decision?','Decision maker'],
      ['timing','What is the next realistic opportunity?','Timing']
    ],
    services:['Meetings','Training Days','Christmas Parties','Staff Celebrations','Private Dining','Accommodation'],
    close:'Would a short venue visit make sense so you can see what is available before the next requirement comes up?'
  };
  return plays.find(p=>p.match.test(sector))||fallback;
};

SalesOS.sessionQueueLeads=function(){
  const ids=(SalesOS.sessionQueue||[]);
  const fromIds=ids.map(id=>(DB.salesLeads||[]).find(x=>x.id===id)).filter(Boolean);
  return fromIds.length?fromIds:SalesOS.queue().filter(x=>x.phone||x.email).slice(0,12);
};

SalesOS.sessionPosition=function(leadId){
  const q=SalesOS.sessionQueueLeads();
  const i=q.findIndex(x=>x.id===leadId);
  return {queue:q,index:Math.max(0,i),total:q.length,next:i>=0?q[i+1]||null:null,prev:i>0?q[i-1]:null};
};

SalesOS.relationshipStage=function(lead){
  if(lead.status==='Converted')return {label:'Customer',tone:'green'};
  if(lead.relationship==='Strategic')return {label:'Strategic',tone:'purple'};
  if(['Negotiation','Proposal Sent','Proposal Required','Meeting Booked'].includes(lead.status))return {label:'Engaged',tone:'green'};
  if(lead.status==='Conversation Started'||lead.relationship==='Hot')return {label:'Warm',tone:'amber'};
  if(lead.status==='Attempting Contact'||lead.status==='First Contact Due'||lead.contactAttempts>0)return {label:'Contacted',tone:'blue'};
  return {label:'Cold',tone:'gray'};
};

SalesOS.qualifyScore=function(lead,form){
  const data=form?new FormData(form):null;
  const has=(name)=>data?String(data.get(name)||'').trim().length>0:false;
  const discovery=form?[...form.querySelectorAll('[data-discovery-key]')]:[];
  const answerMap={};discovery.forEach(x=>answerMap[x.dataset.discoveryKey]=String(x.value||'').trim());
  const checks=[
    ['Need',!!(lead.servicesNeeded||discovery.some(x=>String(x.value||'').trim()))],
    ['Decision maker',!!(data?data.has('decisionMaker'):lead.decisionMaker)],
    ['Value',Number(data?data.get('potentialValue'):lead.potentialValue||0)>0],
    ['Timing',!!(answerMap.timing||answerMap.decisionDate||has('decisionDate'))],
    ['Current situation',!!(answerMap.currentVenue||answerMap.calendar||answerMap.frequency)],
    ['Problem / reason to change',!!(answerMap.pain)],
    ['Next step',!!(data?String(data.get('nextAction')||'').trim():lead.nextAction)]
  ];
  const done=checks.filter(x=>x[1]).length;
  return {checks,done,total:checks.length,pct:Math.round(done/checks.length*100)};
};

SalesOS.objectionData=function(key){
  const offer=SalesOS.firstMeetingOffer();
  const map={
    existing:{title:'We already have a venue',dont:'Do not attack the existing venue or ask them to move everything.',meaning:'The perceived risk of changing is greater than the benefit they currently see.',ask:['What works particularly well there?','If you could improve one thing, what would it be?','Do they cover every event type and every date you need?','Would a reliable second option ever be useful?'],say:'That makes complete sense. I am not asking you to move everything. I would just like the chance to host one suitable event so you have a strong second option and can compare us for yourself.',advance:'Offer one low-risk trial meeting or venue visit.'},
    expensive:{title:'That sounds expensive',dont:'Do not immediately discount.',meaning:'They may be over budget or comparing different levels of inclusion.',ask:['Compared with another venue or against a budget you had in mind?','What is included in the other option?','What budget were you aiming for?','Which parts of the package actually matter most?'],say:'Completely understand. Before I change anything, can I understand whether we are above the budget you had in mind or whether you are comparing us with another venue?',advance:'Rescope intelligently before considering any reduction.'},
    think:{title:'I need to think about it',dont:'Do not accept a vague “I’ll think about it” with no follow-up.',meaning:'There is usually an unanswered question, internal discussion or unresolved risk.',ask:['Of course — what part do you still need to think through?','Who else needs to be involved?','Is there anything in the proposal you are unsure about?','When will you realistically make the decision?'],say:'Absolutely. So I do not chase you blindly, what part do you still need to think through and when do you expect to decide?',advance:'Agree a real decision date and follow-up.'},
    information:{title:'Just send me some information',dont:'Do not send a generic brochure and disappear.',meaning:'Could be genuine interest or a polite exit.',ask:['Which type of event should I tailor it around?','What numbers are typical?','What matters most — price, food, room, parking, accommodation?','When would it be sensible to speak after you have looked?'],say:'Absolutely. I would rather send something relevant than a generic brochure. What type of event should I tailor the information around?',advance:'Send tailored information and book the follow-up.'},
    noevents:{title:'We have no events planned',dont:'Do not only think about large parties.',meaning:'They may not recognise meetings, training, recruitment or accommodation as “events”.',ask:['Do you ever take meetings or training off-site?','Do you recruit or interview groups?','Who arranges Christmas or staff celebrations?','Do visitors or contractors ever need accommodation?'],say:'No problem. I am not only thinking about large events — we also support meetings, training, interviews, staff meals and accommodation throughout the year.',advance:'Broaden the opportunity or agree a sensible nurture date.'},
    approval:{title:'I need approval',dont:'Do not keep selling only to an influencer.',meaning:'You have not yet reached the economic decision maker.',ask:['Who gives final approval?','What information do they need?','When will they review it?','Could we involve them in a short call or visit?'],say:'Of course. Let me make that approval as easy as possible. Who needs to see it and what do they normally need before saying yes?',advance:'Identify the approver and secure the review date.'},
    uninterested:{title:'We are not interested',dont:'Do not argue.',meaning:'The real reason may be timing, relevance, incumbent venue, budget or wrong contact.',ask:['Is that because you do not use external venues?','Do you already have arrangements in place?','Is the timing simply wrong?','Would being a backup option ever be useful?'],say:'No problem at all. Just so I do not contact you unnecessarily, is that because you never use external venues, or because you already have something in place?',advance:'Either uncover a future route or close/nurture cleanly.'}
  };
  return map[key]||map.existing;
};

SalesOS.showObjection=function(key){
  const item=SalesOS.objectionData(key),panel=document.getElementById('sales-os-objection-panel');
  if(!panel)return;
  panel.innerHTML=`<div class="rounded-2xl border border-amber-200 bg-amber-50 p-5">
    <div class="flex flex-wrap items-center gap-2"><span class="px-2 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">LIVE COACH</span><h3 class="font-bold text-xl">${esc(item.title)}</h3></div>
    <div class="grid lg:grid-cols-2 gap-3 mt-4">
      <div class="rounded-xl bg-red-50 border border-red-100 p-4"><p class="text-[10px] font-bold tracking-widest text-red-700">DON'T</p><p class="text-sm mt-2">${esc(item.dont)}</p></div>
      <div class="rounded-xl bg-white border border-amber-100 p-4"><p class="text-[10px] font-bold tracking-widest text-gray-500">WHAT IT MAY MEAN</p><p class="text-sm mt-2">${esc(item.meaning)}</p></div>
    </div>
    <div class="rounded-xl bg-charcoal-900 text-white p-4 mt-3"><p class="text-[10px] font-bold tracking-widest text-olive-200">TRY THIS</p><p class="text-sm leading-relaxed mt-2">“${esc(item.say)}”</p></div>
    <div class="grid lg:grid-cols-[1fr_.8fr] gap-3 mt-3"><div class="rounded-xl bg-white border p-4"><p class="text-[10px] font-bold tracking-widest text-blue-700">ASK NEXT</p><ul class="mt-2 space-y-2 text-sm">${item.ask.map(x=>`<li>• ${esc(x)}</li>`).join('')}</ul></div><div class="rounded-xl bg-olive-50 border border-olive-100 p-4"><p class="text-[10px] font-bold tracking-widest text-olive-700">ADVANCE THE SALE</p><p class="text-sm mt-2 font-semibold">${esc(item.advance)}</p></div></div>
  </div>`;
  if(window.lucide)lucide.createIcons();
};

SalesOS.refreshSessionCoach=function(){
  const form=document.getElementById('sales-os-session-form'),host=document.getElementById('sales-os-live-coach');
  if(!form||!host)return;
  const lead=(DB.salesLeads||[]).find(x=>x.id===SalesOS.activeLeadId);if(!lead)return;
  const q=SalesOS.qualifyScore(lead,form);
  const answered=[...form.querySelectorAll('[data-discovery-key]')].filter(x=>String(x.value||'').trim()).length;
  let message='Start by understanding their current situation before pitching Windmill Farm.';
  if(answered>=2)message='Good start. Now find the problem or friction in their current setup.';
  if(answered>=4&&!form.querySelector('[data-discovery-key="pain"]')?.value)message='You have context, but no reason for change yet. Ask what they would improve.';
  if(form.querySelector('[data-discovery-key="pain"]')?.value&&!form.querySelector('[data-discovery-key="decision"]')?.value)message='You have found a problem. Now identify who actually makes the decision.';
  if(q.done>=5)message='Strong discovery. Do not over-pitch — secure the next commitment.';
  host.innerHTML=`<p class="text-[10px] font-bold tracking-widest text-olive-200">LIVE COACH</p><p class="font-bold mt-1">${esc(message)}</p><div class="mt-3 h-2 bg-white/10 rounded-full overflow-hidden"><div class="h-full bg-gold-400" style="width:${q.pct}%"></div></div><p class="text-[10px] text-white/60 mt-2">${q.done}/${q.total} qualification signals captured</p>`;
};

SalesOS.closeLiveCall=function(){
  document.getElementById('sales-os-live-call')?.remove();
  document.body.style.overflow='';
};

SalesOS.nextSessionLead=function(currentId){
  const p=SalesOS.sessionPosition(currentId);
  return p.next;
};

SalesOS.composeSessionNotes=function(lead,form){
  const data=new FormData(form);
  const discovery=[...form.querySelectorAll('[data-discovery-key]')]
    .filter(x=>String(x.value||'').trim())
    .map(x=>`• ${x.dataset.discoveryLabel}: ${String(x.value).trim()}`);
  const services=[...form.querySelectorAll('[name="liveServices"]:checked')].map(x=>x.value);
  const body=[
    SalesOS.SESSION_MARKER_START,
    `Date: ${new Date().toLocaleString('en-GB')}`,
    'CALL OBJECTIVE',
    String(data.get('callObjective')||'').trim(),
    'CALL NOTES',
    String(data.get('callNotes')||'').trim(),
    'DISCOVERY ANSWERS',
    discovery.join('\n'),
    'OPPORTUNITIES DISCUSSED',
    services.map(x=>`• ${x}`).join('\n'),
    'CURRENT POSITION',
    String(data.get('currentPosition')||'').trim(),
    'QUALIFICATION',
    SalesOS.qualifyScore(lead,form).checks.map(([l,ok])=>`• ${l}: ${ok?'Yes':'No'}`).join('\n'),
    SalesOS.SESSION_MARKER_END
  ].join('\n');
  return [String(lead.notes||'').trim(),body].filter(Boolean).join('\n\n');
};

SalesOS.persistSessionDetails=async function(lead,form){
  const data=new FormData(form);
  const services=[...form.querySelectorAll('[name="liveServices"]:checked')].map(x=>x.value);
  const record={
    contact_name:String(data.get('contactName')||'').trim()||null,
    job_title:String(data.get('jobTitle')||'').trim()||null,
    decision_maker:data.has('decisionMaker'),
    phone:String(data.get('phone')||'').trim()||null,
    email:String(data.get('email')||'').trim().toLowerCase()||null,
    services_needed:services.join(', ')||null,
    potential_value:Number(data.get('potentialValue')||0),
    annual_potential:Number(data.get('annualPotential')||0),
    relationship:String(data.get('relationship')||lead.relationship||'Cold'),
    outcome:String(data.get('currentPosition')||'').trim()||null,
    notes:SalesOS.composeSessionNotes(lead,form)
  };
  const {error}=await supabaseClient.from('sales_leads').update(record).eq('id',lead.id);
  if(error)throw error;
};

SalesOS.outcomeDefaults=function(outcome){
  const map={
    'No Answer':['Attempting Contact','Call again and follow up by email',2],
    'Left Voicemail':['Attempting Contact','Send a short follow-up email',1],
    'Spoke to Reception':['Researching','Find and contact the decision maker',2],
    'Found Decision Maker':['First Contact Due','Call the identified decision maker',1],
    'Spoke to Decision Maker':['Conversation Started','Qualify requirements and book a meeting',2],
    'Information Requested':['Conversation Started','Send tailored information and follow up',2],
    'Interested':['Conversation Started','Book a meeting or venue visit',2],
    'Meeting Booked':['Meeting Booked','Prepare for the meeting / venue visit',1],
    'Proposal Required':['Proposal Required','Create and send the tailored proposal',1],
    'Proposal Sent':['Proposal Sent','Follow up proposal and agree decision date',3],
    'Negotiating':['Negotiation','Resolve blocker and agree decision',2],
    'Converted':['Converted','',null],
    'Not Interested':['Not Interested','',null],
    'Wrong Details':['Researching','Find accurate decision-maker details',2],
    'Other':['Conversation Started','Complete the agreed next action',2]
  };
  return map[outcome]||map.Other;
};

SalesOS.updateOutcomeDefaults=function(){
  const form=document.getElementById('sales-os-session-form');if(!form)return;
  const outcome=form.querySelector('[name="sessionOutcome"]')?.value||'';
  if(!outcome)return;
  const [status,action,days]=SalesOS.outcomeDefaults(outcome);
  const actionEl=form.querySelector('[name="nextAction"]'),dateEl=form.querySelector('[name="nextFollowup"]');
  if(actionEl)actionEl.value=action;
  if(dateEl)dateEl.value=days!==null?salesAddDays(currentDateStr(),days):'';
  const closed=['Converted','Not Interested'].includes(outcome);
  if(actionEl)actionEl.required=!closed;
  if(dateEl)dateEl.required=!closed;
};

SalesOS.saveSessionOutcome=async function(leadId,goNext=false){
  const lead=(DB.salesLeads||[]).find(x=>x.id===leadId),form=document.getElementById('sales-os-session-form');
  if(!lead||!form)return;
  const data=new FormData(form),outcome=String(data.get('sessionOutcome')||'').trim();
  if(!outcome){toast('Choose the call outcome before finishing','error');return;}
  const closed=['Converted','Not Interested'].includes(outcome);
  const nextAction=String(data.get('nextAction')||'').trim(),nextFollowup=String(data.get('nextFollowup')||'').trim();
  if(!closed&&(!nextAction||!nextFollowup)){toast('Every live prospect needs a dated next commitment','error');return;}
  try{
    await SalesOS.persistSessionDetails(lead,form);
    const [status]=SalesOS.outcomeDefaults(outcome);
    const note=String(data.get('callNotes')||'').trim()||String(data.get('currentPosition')||'').trim()||`Guided sales session: ${outcome}`;
    const activity={
      sales_lead_id:lead.id,
      activity_type:'Outbound Call',
      activity_date:currentDateStr(),
      staff:String(data.get('staff')||lead.assignedTo||'')||null,
      outcome,
      notes:note
    };
    const a=await supabaseClient.from('sales_lead_activities').insert(activity);
    if(a.error)throw a.error;
    const rel=outcome==='Converted'?'Existing Customer':(['Interested','Meeting Booked','Proposal Required','Proposal Sent','Negotiating'].includes(outcome)?'Hot':(['Spoke to Decision Maker','Information Requested'].includes(outcome)?'Warm':lead.relationship));
    const update={
      status,
      next_action:closed?null:nextAction,
      next_followup:closed?null:nextFollowup,
      last_contact:currentDateStr(),
      contact_attempts:Number(lead.contactAttempts||0)+1,
      relationship:rel,
      outcome:String(data.get('currentPosition')||note).trim()||null
    };
    const u=await supabaseClient.from('sales_leads').update(update).eq('id',lead.id);
    if(u.error)throw u.error;
    if(window.SalesOS?.sequenceAfterOutcome)await SalesOS.sequenceAfterOutcome(lead.id,outcome);
    await loadSalesLeadsFromSupabase();
    if(outcome==='Converted'){
      SalesOS.closeLiveCall();
      openLeadOpportunityWizard(lead.id);
      toast('Converted — now capture the revenue opportunity');
      return;
    }
    const next=goNext?SalesOS.nextSessionLead(lead.id):null;
    if(goNext&&next){
      SalesOS.openLiveCall(next.id);
      toast('Outcome saved — moving to next prospect');
    }else{
      SalesOS.closeLiveCall();
      renderSection();
      toast('Sales session saved and next step controlled');
    }
  }catch(err){
    console.error(err);toast('The sales session could not be saved','error');
  }
};

SalesOS.openLiveCall=function(leadId){
  const lead=(DB.salesLeads||[]).find(x=>x.id===leadId);if(!lead)return;
  SalesOS.closeLiveCall();SalesOS.activeLeadId=leadId;
  const play=SalesOS.salesPlay(lead),pos=SalesOS.sessionPosition(leadId),relationship=SalesOS.relationshipStage(lead);
  const selected=String(lead.servicesNeeded||'').split(',').map(x=>x.trim()).filter(Boolean);
  const serviceOptions=[...new Set([...play.services,'Meetings','Training Days','Conferences','Christmas Parties','Staff Celebrations','Private Dining','Accommodation','Recruitment Events','Awards Evenings','Wakes','Networking Events'])];
  const previous=SalesOS.latestActivity(lead.id);
  const workspace=document.createElement('div');
  workspace.id='sales-os-live-call';workspace.className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm p-1 lg:p-4';
  workspace.innerHTML=`<div class="h-full max-w-[1600px] mx-auto bg-[#f7f7f4] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
    <header class="bg-charcoal-900 text-white px-4 lg:px-6 py-4 flex-shrink-0">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0"><div class="flex gap-2 items-center flex-wrap"><span class="text-[10px] font-bold tracking-[.18em] text-gold-300">GUIDED SALES SESSION</span><span class="px-2 py-1 bg-white/10 rounded-full text-[10px]">${pos.total?`${pos.index+1} / ${pos.total}`:'Single prospect'}</span></div>
          <div class="flex gap-3 items-center flex-wrap mt-1"><h2 class="text-2xl lg:text-3xl font-bold">${esc(lead.companyName)}</h2><span class="badge ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span><span class="px-2 py-1 rounded-full text-[10px] font-bold bg-white/10">${relationship.label}</span></div>
          <p class="text-sm text-white/65 mt-1">${esc(lead.contactName||'Decision maker not identified')} · ${esc(lead.businessType||'Sector not set')} · ${SalesOS.money(lead.potentialValue)} potential</p>
        </div>
        <div class="flex gap-2"><button type="button" onclick="SalesOS.closeLiveCall()" class="p-2.5 rounded-lg bg-white/10"><i data-lucide="x"></i></button></div>
      </div>
      ${pos.total?`<div class="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"><div class="h-full bg-gold-400" style="width:${Math.round((pos.index+1)/pos.total*100)}%"></div></div>`:''}
    </header>

    <form id="sales-os-session-form" class="flex-1 overflow-y-auto" oninput="SalesOS.refreshSessionCoach()">
      <div class="p-3 lg:p-5 grid xl:grid-cols-[.72fr_1.55fr_.73fr] gap-4">
        <aside class="space-y-4">
          <section class="bg-white border rounded-2xl p-4">
            <p class="text-[10px] font-bold tracking-widest text-red-700">WHY NOW</p><p class="text-sm font-semibold mt-1">${esc(SalesOS.priorityReason(lead))}</p>
            <div class="mt-3 rounded-xl bg-olive-50 p-3"><p class="text-[10px] font-bold text-olive-700">TODAY'S OBJECTIVE</p><p class="text-sm mt-1">${esc(play.objective)}</p></div>
          </section>
          <section class="bg-white border rounded-2xl p-4">
            <p class="text-[10px] font-bold tracking-widest text-olive-700">PRE-CALL INTELLIGENCE</p>
            <div class="mt-3 space-y-3 text-xs">
              <div><span class="text-gray-400">Last contact</span><strong class="block">${lead.lastContact?SalesOS.date(lead.lastContact):'Never'}</strong></div>
              <div><span class="text-gray-400">Last outcome</span><strong class="block">${esc(previous?.outcome||lead.outcome||'Nothing recorded')}</strong></div>
              <div><span class="text-gray-400">Next action</span><strong class="block">${esc(lead.nextAction||'Not controlled')}</strong></div>
              <div><span class="text-gray-400">Annual potential</span><strong class="block">${SalesOS.money(lead.annualPotential)}</strong></div>
            </div>
          </section>
          <section class="bg-white border rounded-2xl p-4">
            <p class="text-[10px] font-bold tracking-widest text-blue-700">CONTACT</p>
            <div class="grid gap-2 mt-3">${lead.phone?`<a href="tel:${esc(lead.phone)}" class="px-3 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-bold text-center">☎ ${esc(lead.phone)}</a>`:'<div class="text-xs text-red-600">No phone recorded</div>'}${lead.email?`<a href="mailto:${esc(lead.email)}" class="px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold text-center">Email</a>`:''}</div>
          </section>
          <section class="bg-charcoal-900 text-white rounded-2xl p-4" id="sales-os-live-coach"></section>
        </aside>

        <main class="space-y-4">
          <section class="bg-white border rounded-2xl p-5">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">${esc(play.name).toUpperCase()} PLAY</p><h3 class="font-bold text-xl mt-1">Open naturally — then discover</h3></div><span class="text-[10px] px-2 py-1 rounded-full bg-olive-100 text-olive-800 font-bold">DON'T PITCH TOO EARLY</span></div>
            <div class="rounded-xl bg-cream-50 border border-cream-200 p-4 mt-4"><p class="text-[10px] font-bold text-gray-500">SUGGESTED OPENING</p><p class="text-sm leading-relaxed mt-2">“${esc(play.opener)}”</p></div>
          </section>

          <section class="bg-white border rounded-2xl p-5">
            <div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">DISCOVERY</p><h3 class="font-bold text-xl mt-1">Understand before you sell</h3></div><p class="text-[10px] text-gray-400 max-w-[230px]">Capture useful answers, not a transcript. The coach changes as discovery improves.</p></div>
            <div class="grid md:grid-cols-2 gap-3 mt-4">${play.discovery.map(([key,q,label])=>`<label class="rounded-xl border border-gray-200 p-3"><span class="text-xs font-semibold text-gray-700">${esc(q)}</span><textarea data-discovery-key="${esc(key)}" data-discovery-label="${esc(label)}" rows="2" class="mt-2 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Useful answer…"></textarea></label>`).join('')}</div>
          </section>

          <section class="bg-white border rounded-2xl p-5">
            <p class="text-[10px] font-bold tracking-widest text-olive-700">OPPORTUNITY MAP</p><h3 class="font-bold text-lg mt-1">What could this account realistically buy?</h3>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">${serviceOptions.map(x=>`<label class="flex items-center gap-2 rounded-xl border p-3 hover:bg-olive-50"><input type="checkbox" name="liveServices" value="${esc(x)}" ${selected.includes(x)?'checked':''}><span class="text-xs">${esc(x)}</span></label>`).join('')}</div>
          </section>

          <section class="bg-white border rounded-2xl p-5">
            <div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-amber-700">OBJECTION COACH</p><h3 class="font-bold text-lg mt-1">They've said…</h3></div><p class="text-[10px] text-gray-400">Use the prompts to diagnose, not argue.</p></div>
            <div class="flex flex-wrap gap-2 mt-3">${[['existing','We already have a venue'],['expensive','Too expensive'],['think','Need to think'],['information','Send information'],['noevents','No events planned'],['approval','Need approval'],['uninterested','Not interested']].map(([k,l])=>`<button type="button" onclick="SalesOS.showObjection('${k}')" class="px-3 py-2 rounded-lg border bg-white text-xs font-semibold hover:bg-amber-50">${esc(l)}</button>`).join('')}</div>
            <div id="sales-os-objection-panel" class="mt-4"></div>
          </section>

          <section class="bg-white border rounded-2xl p-5">
            <p class="text-[10px] font-bold tracking-widest text-olive-700">ACCOUNT UPDATE</p>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <label class="text-xs text-gray-600">Contact name<input name="contactName" value="${esc(lead.contactName||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
              <label class="text-xs text-gray-600">Job title<input name="jobTitle" value="${esc(lead.jobTitle||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
              <label class="text-xs text-gray-600">Phone<input name="phone" value="${esc(lead.phone||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
              <label class="text-xs text-gray-600">Email<input name="email" value="${esc(lead.email||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
              <label class="text-xs text-gray-600">Potential value (£)<input type="number" min="0" name="potentialValue" value="${Number(lead.potentialValue||0)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
              <label class="text-xs text-gray-600">Annual potential (£)<input type="number" min="0" name="annualPotential" value="${Number(lead.annualPotential||0)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
              <label class="text-xs text-gray-600">Relationship<select name="relationship" class="mt-1 w-full px-3 py-2 border rounded-lg">${['Cold','Warm','Hot','Strategic','Existing Customer'].map(x=>`<option ${lead.relationship===x?'selected':''}>${x}</option>`).join('')}</select></label>
              <label class="flex items-center gap-2 text-sm mt-6"><input type="checkbox" name="decisionMaker" ${lead.decisionMaker?'checked':''}> Decision maker</label>
            </div>
          </section>

          <section class="bg-white border rounded-2xl p-5">
            <p class="text-[10px] font-bold tracking-widest text-olive-700">CALL NOTES</p>
            <div class="grid md:grid-cols-2 gap-3 mt-3"><label class="text-xs text-gray-600">Live notes<textarea name="callNotes" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Key facts, objections, promises…"></textarea></label><label class="text-xs text-gray-600">Current position<textarea name="currentPosition" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Where does this relationship/opportunity now stand?">${esc(lead.outcome||'')}</textarea></label></div>
          </section>

          <section class="bg-white border-2 border-olive-300 rounded-2xl p-5">
            <p class="text-[10px] font-bold tracking-widest text-olive-700">MICRO-COMMITMENT</p><h3 class="font-bold text-xl mt-1">Never finish with “spoke to customer”</h3>
            <div class="rounded-xl bg-olive-50 p-4 mt-3"><p class="text-xs text-olive-700 font-bold">TRY TO ADVANCE TO:</p><p class="text-sm mt-1">“${esc(play.close)}”</p></div>
            <div class="grid md:grid-cols-3 gap-3 mt-4">
              <label class="text-xs text-gray-600">Outcome *<select name="sessionOutcome" required onchange="SalesOS.updateOutcomeDefaults()" class="mt-1 w-full px-3 py-2.5 border rounded-lg"><option value="">Select outcome…</option>${['No Answer','Left Voicemail','Spoke to Reception','Found Decision Maker','Spoke to Decision Maker','Information Requested','Interested','Meeting Booked','Proposal Required','Proposal Sent','Negotiating','Converted','Not Interested','Wrong Details','Other'].map(x=>`<option>${x}</option>`).join('')}</select></label>
              <label class="text-xs text-gray-600">Next action *<input name="nextAction" value="${esc(lead.nextAction||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg" placeholder="Specific commitment"></label>
              <label class="text-xs text-gray-600">When? *<input type="date" name="nextFollowup" value="${esc(lead.nextFollowup||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
            </div>
            <input type="hidden" name="callObjective" value="${esc(play.objective)}">
            <input type="hidden" name="staff" value="${esc(lead.assignedTo||'')}">
          </section>
        </main>

        <aside class="space-y-4">
          <section class="bg-white border rounded-2xl p-4">
            <p class="text-[10px] font-bold tracking-widest text-olive-700">THE WINDMILL 7</p><div id="sales-os-qualification-list" class="mt-3"></div>
          </section>
          <section class="bg-gold-50 border border-gold-200 rounded-2xl p-4">
            <p class="text-[10px] font-bold tracking-widest text-amber-700">LOW-RISK ADVANCE</p><p class="font-bold mt-1">${esc(SalesOS.firstMeetingOffer().title)}</p><p class="text-xs text-amber-800 mt-2">${esc(SalesOS.firstMeetingOffer().script)}</p>
          </section>
          <section class="bg-white border rounded-2xl p-4">
            <p class="text-[10px] font-bold tracking-widest text-olive-700">WHY WINDMILL FARM</p><div class="mt-3 space-y-2">${SalesOS.advantages().slice(0,7).map(([title,detail])=>`<div class="text-xs"><strong>${esc(title)}</strong><p class="text-gray-500">${esc(detail)}</p></div>`).join('')}</div>
          </section>
          <div class="grid gap-2 sticky bottom-0 bg-[#f7f7f4] py-2">
            <button type="button" onclick="SalesOS.saveSessionOutcome('${lead.id}',true)" class="w-full py-3 bg-olive-700 text-white rounded-xl font-bold">${pos.next?'Save & Next Prospect →':'Save & Finish Session'}</button>
            <button type="button" onclick="SalesOS.saveSessionOutcome('${lead.id}',false)" class="w-full py-3 bg-charcoal-900 text-white rounded-xl font-semibold">Save & Close</button>
            <button type="button" onclick="SalesOS.closeLiveCall()" class="w-full py-2.5 bg-white border rounded-xl text-sm font-semibold">Cancel</button>
          </div>
        </aside>
      </div>
    </form>
  </div>`;
  document.body.appendChild(workspace);document.body.style.overflow='hidden';
  const form=document.getElementById('sales-os-session-form');
  const renderQual=()=>{const q=SalesOS.qualifyScore(lead,form),host=document.getElementById('sales-os-qualification-list');if(host)host.innerHTML=`<div class="flex items-center justify-between"><strong class="text-2xl">${q.done}/${q.total}</strong><span class="text-xs font-bold ${q.pct>=70?'text-green-700':'text-amber-700'}">${q.pct}% qualified</span></div><div class="mt-3 space-y-2">${q.checks.map(([l,ok])=>`<div class="flex gap-2 text-xs"><span class="${ok?'text-green-600':'text-amber-500'}">${ok?'✓':'○'}</span>${esc(l)}</div>`).join('')}</div>`;};
  form.addEventListener('input',()=>{SalesOS.refreshSessionCoach();renderQual();});
  renderQual();SalesOS.refreshSessionCoach();
  if(window.lucide)lucide.createIcons();
};

SalesOS.renderCalls=function(){
  const queue=SalesOS.queue().filter(x=>x.phone||x.email).slice(0,15);
  return SalesOS.panel('Guided Sales Sessions','The system ranks the queue. The playbook helps the manager create a better conversation.',`<div class="divide-y -mx-5 -my-5">${queue.length?queue.map((lead,i)=>`<article class="p-5 grid lg:grid-cols-[42px_1fr_auto] gap-4 items-center"><span class="w-10 h-10 rounded-full ${i<3?'bg-gold-500 text-white':'bg-olive-100 text-olive-700'} flex items-center justify-center font-bold">${i+1}</span><div><div class="flex gap-2 items-center flex-wrap"><strong>${esc(lead.companyName)}</strong><span class="badge ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span></div><p class="text-xs text-gray-500 mt-1">${esc(SalesOS.priorityReason(lead))}</p><div class="grid md:grid-cols-2 gap-2 mt-2"><div class="rounded-lg bg-red-50 p-2 text-xs"><b class="text-red-700">WHY NOW</b><p>${esc(SalesOS.priorityReason(lead))}</p></div><div class="rounded-lg bg-olive-50 p-2 text-xs"><b class="text-olive-700">OBJECTIVE</b><p>${esc(SalesOS.salesPlay(lead).objective)}</p></div></div></div><button onclick="SalesOS.openLiveCall('${lead.id}')" class="px-4 py-2.5 bg-charcoal-900 text-white rounded-lg text-sm font-bold">Start Session</button></article>`).join(''):'<div class="p-10 text-center text-gray-400">No contactable prospects available.</div>'}</div>`);
};
