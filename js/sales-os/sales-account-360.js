// SALES OS 2.0 — PHASE 3: PROSPECT & ACCOUNT 360
// One account view across proactive lead, known company, contacts, activities and opportunities.
// Uses existing tables only.

SalesOS.normaliseCompanyName=function(value){
  return String(value||'').trim().toLowerCase().replace(/\s+/g,' ');
};

SalesOS.accountCompany=function(lead){
  const name=SalesOS.normaliseCompanyName(lead?.companyName);
  return (DB.companies||[]).find(c=>SalesOS.normaliseCompanyName(c.name)===name)||null;
};

SalesOS.accountContacts=function(lead){
  const company=SalesOS.accountCompany(lead);
  const rows=company?(DB.companyContacts||[]).filter(c=>c.companyId===company.id):[];
  const primary=lead?.contactName?{
    id:`lead-${lead.id}`,
    name:lead.contactName,
    jobTitle:lead.jobTitle||'',
    phone:lead.phone||'',
    email:lead.email||'',
    decisionMaker:!!lead.decisionMaker,
    source:'Prospect'
  }:null;
  const combined=[primary,...rows.map(c=>({...c,source:'Company'}))].filter(Boolean);
  const seen=new Set();
  return combined.filter(c=>{
    const key=String(c.email||c.phone||c.name||'').trim().toLowerCase();
    if(!key)return true;
    if(seen.has(key))return false;
    seen.add(key);return true;
  });
};

SalesOS.accountOpportunities=function(lead){
  const company=SalesOS.accountCompany(lead);
  return company?(DB.opportunities||[]).filter(o=>o.companyId===company.id):[];
};

SalesOS.accountActivities=function(lead){
  const company=SalesOS.accountCompany(lead);
  const leadActivities=SalesOS.activitiesFor(lead.id).map(a=>({...a,origin:'Prospect'}));
  const companyActivities=company?(DB.companyActivities||[]).filter(a=>a.companyId===company.id).map(a=>({...a,origin:'Account'})):[];
  return [...leadActivities,...companyActivities].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
};

SalesOS.accountCommercials=function(lead){
  const company=SalesOS.accountCompany(lead);
  const opportunities=SalesOS.accountOpportunities(lead);
  const open=opportunities.filter(o=>!['Won','Lost'].includes(o.stage));
  const won=opportunities.filter(o=>o.stage==='Won');
  const lost=opportunities.filter(o=>o.stage==='Lost');
  const pipeline=open.reduce((s,o)=>s+Number(o.value||0),0);
  const weighted=open.reduce((s,o)=>s+Number(o.value||0)*(Number(o.probability||0)/100),0);
  const wonValue=won.reduce((s,o)=>s+Number(o.value||0),0);
  const annual=Math.max(Number(lead.annualPotential||0),Number(company?.annualPotential||0));
  return {company,opportunities,open,won,lost,pipeline,weighted,wonValue,annual};
};

SalesOS.accountRelationship=function(lead){
  const days=SalesOS.daysSince(lead.lastContact);
  let label='Cold',score=10;
  if(lead.contactAttempts>0){label='Contacted';score=25;}
  if(lead.status==='Conversation Started'||lead.relationship==='Warm'){label='Engaged';score=45;}
  if(['Meeting Booked','Proposal Required','Proposal Sent','Negotiation'].includes(lead.status)||lead.relationship==='Hot'){label='Warm';score=65;}
  if(lead.relationship==='Strategic'){label='Strong';score=82;}
  if(lead.status==='Converted'||SalesOS.accountCompany(lead)?.currentCustomer){label='Customer';score=92;}
  if(days!==null&&days>90){score-=25;if(label==='Strong')label='Warm';else if(label==='Warm')label='Engaged';}
  else if(days!==null&&days>45){score-=15;}
  if(salesLeadOverdue(lead))score-=10;
  return {label,score:Math.max(0,Math.min(100,score)),days};
};

SalesOS.accountExpansion=function(lead){
  const current=String(lead.servicesNeeded||'').split(',').map(x=>x.trim()).filter(Boolean);
  const all=[
    'Meetings','Training Days','Conferences','Christmas Parties','Staff Celebrations',
    'Private Dining','Accommodation','Recruitment Events','Awards Evenings','Wakes','Networking Events'
  ];
  const sector=String(lead.businessType||'').toLowerCase();
  const recommended=SalesOS.salesPlay?SalesOS.salesPlay(lead).services:[];
  return all.map(service=>({
    service,
    known:current.some(x=>x.toLowerCase()===service.toLowerCase()),
    recommended:recommended.some(x=>x.toLowerCase()===service.toLowerCase()),
    unsuitable:/funeral/.test(sector)&&!['Wakes','Private Dining','Accommodation'].includes(service)
  }));
};

SalesOS.accountRiskFlags=function(lead){
  const contacts=SalesOS.accountContacts(lead),commercial=SalesOS.accountCommercials(lead),flags=[];
  if(!contacts.length)flags.push(['red','No named contact','Identify who organises events or venue spend.']);
  if(!contacts.some(c=>c.decisionMaker))flags.push(['amber','Decision maker unknown','The relationship is vulnerable until authority is understood.']);
  if(!lead.nextAction||!lead.nextFollowup)flags.push(['red','No controlled next step','Every live account needs a dated action.']);
  if(salesLeadOverdue(lead))flags.push(['red','Follow-up overdue','Recover the relationship before it cools further.']);
  if(!lead.servicesNeeded)flags.push(['amber','Account whitespace unknown','Map which services this organisation could realistically buy.']);
  if(!Number(lead.annualPotential||0))flags.push(['amber','Annual value unknown','Estimate recurring potential, not only the next booking.']);
  if(commercial.open.length&&!commercial.open.some(o=>o.nextAction&&o.nextFollowup))flags.push(['amber','Opportunity control weak','At least one open opportunity has no complete next step.']);
  return flags;
};

SalesOS.accountNextMove=function(lead){
  const flags=SalesOS.accountRiskFlags(lead);
  if(flags.length)return flags[0][2];
  const commercial=SalesOS.accountCommercials(lead);
  if(commercial.open.some(o=>o.stage==='Proposal Sent'))return 'Book a decision conversation on the live proposal.';
  if(commercial.won.length)return 'Look for account expansion: what else could this customer use Windmill Farm for?';
  return SalesOS.companyRecommendation?SalesOS.companyRecommendation(lead):salesLeadNextBestAction(lead);
};

SalesOS.accountTab='overview';
SalesOS.setAccountTab=function(tab,leadId){
  SalesOS.accountTab=tab;
  SalesOS.renderAccount360(leadId);
};

SalesOS.renderAccount360=function(leadId){
  const lead=(DB.salesLeads||[]).find(x=>x.id===leadId);if(!lead)return;
  const modal=document.getElementById('sales-account-360-modal');
  const contacts=SalesOS.accountContacts(lead),commercial=SalesOS.accountCommercials(lead),activities=SalesOS.accountActivities(lead);
  const relationship=SalesOS.accountRelationship(lead),flags=SalesOS.accountRiskFlags(lead),expansion=SalesOS.accountExpansion(lead);
  const tabs=[['overview','Overview'],['contacts','Contacts'],['activity','Activity'],['opportunities','Opportunities'],['intelligence','Intelligence']];
  const current=SalesOS.accountTab||'overview';

  const overview=`<div class="space-y-4">
    ${flags.length?`<section class="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-amber-800">ACCOUNT RISKS</p><h3 class="font-bold">${flags.length} thing${flags.length===1?'':'s'} weakening this account</h3></div><button onclick="SalesOS.startAccountSession('${lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-bold">Work Account</button></div><div class="grid md:grid-cols-2 gap-2 mt-3">${flags.map(([tone,title,detail])=>`<div class="bg-white rounded-xl border p-3"><span class="text-[9px] font-bold uppercase ${tone==='red'?'text-red-700':'text-amber-700'}">${esc(title)}</span><p class="text-xs mt-1">${esc(detail)}</p></div>`).join('')}</div></section>`:''}
    <div class="grid xl:grid-cols-[1.15fr_.85fr] gap-4">
      <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-olive-700">ACCOUNT POSITION</p><h3 class="font-bold text-xl mt-1">What do we know?</h3>
        <div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
          <div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Sector</small><strong class="block mt-1">${esc(lead.businessType||'Not known')}</strong></div>
          <div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Owner</small><strong class="block mt-1">${esc(lead.assignedTo||'Unassigned')}</strong></div>
          <div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Current position</small><strong class="block mt-1">${esc(lead.outcome||lead.status)}</strong></div>
          <div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Next action</small><strong class="block mt-1">${esc(lead.nextAction||'Not controlled')}</strong><span class="text-xs text-gray-500">${SalesOS.date(lead.nextFollowup)}</span></div>
        </div>
        <div class="rounded-xl bg-olive-50 border border-olive-100 p-4 mt-4"><p class="text-[10px] font-bold tracking-widest text-olive-700">NEXT BEST MOVE</p><p class="font-semibold mt-1">${esc(SalesOS.accountNextMove(lead))}</p></div>
      </section>
      <section class="bg-charcoal-900 text-white rounded-2xl p-5"><p class="text-[10px] font-bold tracking-widest text-olive-200">RELATIONSHIP STRENGTH</p><div class="flex items-end justify-between mt-2"><div><p class="text-4xl font-bold">${relationship.score}</p><p class="text-sm text-white/60">${relationship.label}</p></div><p class="text-xs text-right text-white/50">${relationship.days===null?'Never contacted':`${relationship.days}d since contact`}</p></div><div class="h-2 bg-white/10 rounded-full overflow-hidden mt-4"><div class="h-full bg-gold-400" style="width:${relationship.score}%"></div></div><p class="text-xs text-white/60 mt-4">Relationship strength falls when accounts go untouched. A good CRM should make neglect visible.</p></section>
    </div>
    <section class="bg-white rounded-2xl border p-5"><div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">ACCOUNT EXPANSION</p><h3 class="font-bold text-xl mt-1">What else could they buy?</h3></div><span class="text-xs text-gray-500">${expansion.filter(x=>x.known).length} services already identified</span></div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-4">${expansion.filter(x=>!x.unsuitable).map(x=>`<div class="rounded-xl border p-3 ${x.known?'bg-green-50 border-green-200':x.recommended?'bg-gold-50 border-gold-200':'bg-gray-50'}"><div class="flex justify-between gap-2"><strong class="text-xs">${esc(x.service)}</strong><span class="text-[9px] font-bold ${x.known?'text-green-700':x.recommended?'text-amber-700':'text-gray-400'}">${x.known?'IDENTIFIED':x.recommended?'EXPLORE':'UNKNOWN'}</span></div></div>`).join('')}</div>
    </section>
  </div>`;

  const contactsHtml=`<section class="bg-white rounded-2xl border overflow-hidden"><div class="p-5 border-b"><p class="text-[10px] font-bold tracking-widest text-olive-700">PEOPLE MAP</p><h3 class="font-bold text-xl mt-1">${contacts.length} known contact${contacts.length===1?'':'s'}</h3><p class="text-xs text-gray-500 mt-1">Know who organises, influences and ultimately approves the venue decision.</p></div><div class="divide-y">${contacts.length?contacts.map(c=>`<article class="p-5 flex flex-col md:flex-row md:items-center gap-4"><div class="w-11 h-11 rounded-full ${c.decisionMaker?'bg-gold-100 text-amber-800':'bg-olive-100 text-olive-700'} flex items-center justify-center"><i data-lucide="${c.decisionMaker?'crown':'user'}"></i></div><div class="flex-1"><div class="flex gap-2 items-center flex-wrap"><strong>${esc(c.name||'Unnamed')}</strong>${c.decisionMaker?'<span class="badge bg-gold-100 text-amber-800">Decision Maker</span>':''}</div><p class="text-xs text-gray-500">${esc(c.jobTitle||'Role not known')} · ${esc(c.source||'Account')}</p><p class="text-xs mt-1">${esc(c.phone||'No phone')} · ${esc(c.email||'No email')}</p></div>${c.phone?`<a href="tel:${esc(c.phone)}" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-bold">Call</a>`:''}</article>`).join(''):'<div class="p-8 text-center text-gray-400">No contact identified yet. Make this the next objective.</div>'}</div></section>`;

  const activityHtml=`<section class="bg-white rounded-2xl border overflow-hidden"><div class="p-5 border-b flex justify-between"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">RELATIONSHIP HISTORY</p><h3 class="font-bold text-xl mt-1">Everything we've done with this account</h3></div><span class="badge bg-gray-100 text-gray-700">${activities.length}</span></div><div class="divide-y max-h-[60vh] overflow-y-auto">${activities.length?activities.map(a=>`<article class="p-4 flex gap-3"><span class="w-9 h-9 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center"><i data-lucide="${/email/i.test(a.type||'')?'mail':/meeting|visit/i.test(a.type||'')?'calendar-check':'phone-call'}"></i></span><div class="flex-1"><div class="flex justify-between gap-3"><strong class="text-sm">${esc(a.type||'Activity')} · ${esc(a.outcome||'No outcome')}</strong><span class="text-xs text-gray-400">${SalesOS.date(a.date)}</span></div><p class="text-[10px] text-gray-400">${esc(a.origin||'Account')} · ${esc(a.staff||'Unassigned')}</p>${a.notes?`<p class="text-sm mt-2 whitespace-pre-wrap">${esc(a.notes)}</p>`:''}</div></article>`).join(''):'<div class="p-8 text-center text-gray-400">No relationship history yet.</div>'}</div></section>`;

  const oppHtml=`<div class="space-y-4"><div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${SalesOS.kpi('Open Pipeline',SalesOS.money(commercial.pipeline),'Live account opportunities','filter','olive')}${SalesOS.kpi('Weighted',SalesOS.money(commercial.weighted),'Probability weighted','chart-no-axes-combined','blue')}${SalesOS.kpi('Won Value',SalesOS.money(commercial.wonValue),'Revenue opportunities recorded won','trophy','green')}${SalesOS.kpi('Annual Potential',SalesOS.money(commercial.annual),'Estimated repeat value','repeat-2','gold')}</div><section class="bg-white rounded-2xl border overflow-hidden"><div class="p-5 border-b flex justify-between"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">OPPORTUNITIES</p><h3 class="font-bold text-xl">Revenue attached to this account</h3></div><button onclick="SalesOS.startAccountOpportunity('${lead.id}')" class="px-3 py-2 bg-gold-500 text-white rounded-lg text-xs font-bold">+ Opportunity</button></div><div class="divide-y">${commercial.opportunities.length?commercial.opportunities.map(o=>{const q=window.SalesOS?.opportunityHealth?SalesOS.opportunityHealth(o):null,a=o.stage==='Won'&&window.SalesOS?.bookingAttribution?SalesOS.bookingAttribution(o):null;return `<article onclick="viewOpportunity('${o.id}')" class="p-4 grid md:grid-cols-[1fr_auto] gap-3 cursor-pointer hover:bg-olive-50"><div><div class="flex gap-2 items-center flex-wrap"><strong>${esc(o.title)}</strong><span class="badge ${o.stage==='Won'?'bg-green-100 text-green-700':o.stage==='Lost'?'bg-red-100 text-red-700':'bg-olive-100 text-olive-800'}">${esc(o.stage)}</span>${q?`<span class="badge ${q.strength.score>=70?'bg-green-100 text-green-700':q.strength.score>=50?'bg-amber-100 text-amber-800':'bg-red-100 text-red-700'}">${q.strength.score}/100 ${q.strength.label}</span>`:''}${a?`<span class="badge ${a.status==='linked'?'bg-blue-100 text-blue-700':a.status==='partial'?'bg-amber-100 text-amber-800':'bg-gray-100 text-gray-600'}">${a.status==='linked'?'Booking linked':a.status==='partial'?'Confirmed enquiry linked':'BK not matched'}</span>`:''}</div><p class="text-xs text-gray-500 mt-1">${esc(o.type)} · Next: ${esc(o.nextAction||'Not controlled')} · ${SalesOS.date(o.nextFollowup)}</p>${q&&q.annual>Number(o.value||0)?`<p class="text-[10px] text-amber-700 mt-1">${SalesOS.money(q.annual)} annualised potential</p>`:''}${a&&a.bookingRef?`<p class="text-[10px] text-blue-700 mt-1">${esc(a.bookingRef)} · ${esc(a.label)}</p>`:''}</div><div class="text-right"><strong>${SalesOS.money(o.value)}</strong><p class="text-xs text-gray-500">${Number(o.probability||0)}% evidence probability</p></div></article>`}).join(''):'<div class="p-8 text-center text-gray-400">No formal opportunities attached yet.</div>'}</div></section></div>`;

  const intelligenceHtml=`<div class="grid xl:grid-cols-2 gap-4">
    <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-olive-700">ACCOUNT WHITESPACE</p><h3 class="font-bold text-xl mt-1">Commercial possibilities</h3><p class="text-sm text-gray-500 mt-2">Do not see this organisation as one event. Map every realistic reason they could use Windmill Farm.</p><div class="mt-4 space-y-2">${expansion.filter(x=>!x.unsuitable).map(x=>`<div class="flex justify-between rounded-lg border p-3"><span class="text-sm">${esc(x.service)}</span><strong class="text-xs ${x.known?'text-green-700':x.recommended?'text-amber-700':'text-gray-400'}">${x.known?'KNOWN NEED':x.recommended?'RECOMMENDED DISCOVERY':'UNQUALIFIED'}</strong></div>`).join('')}</div></section>
    <div class="space-y-4"><section class="bg-charcoal-900 text-white rounded-2xl p-5"><p class="text-[10px] font-bold tracking-widest text-olive-200">COMMERCIAL SNAPSHOT</p><div class="grid grid-cols-2 gap-3 mt-4"><div class="bg-white/10 rounded-xl p-3"><small class="text-white/50">Lead potential</small><strong class="block text-xl">${SalesOS.money(lead.potentialValue)}</strong></div><div class="bg-white/10 rounded-xl p-3"><small class="text-white/50">Annual potential</small><strong class="block text-xl">${SalesOS.money(commercial.annual)}</strong></div><div class="bg-white/10 rounded-xl p-3"><small class="text-white/50">Won opportunities</small><strong class="block text-xl">${SalesOS.money(commercial.wonValue)}</strong></div><div class="bg-white/10 rounded-xl p-3"><small class="text-white/50">Open pipeline</small><strong class="block text-xl">${SalesOS.money(commercial.pipeline)}</strong></div></div></section>
    <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-olive-700">ACCOUNT STRATEGY</p><p class="font-bold mt-2">${esc(SalesOS.accountNextMove(lead))}</p><p class="text-xs text-gray-500 mt-3">${commercial.won.length?'This is already a customer account. Focus on retention, repeat bookings and cross-selling other relevant event types.':'Move from a single-contact prospect to a multi-threaded commercial relationship.'}</p>${window.SalesOS?.setFinderPlay?`<button onclick="SalesOS.closeAccount360();SalesOS.setFinderPlay('meetings')" class="mt-4 px-3 py-2 bg-olive-700 text-white rounded-lg text-xs font-bold">Open Opportunity Finder</button>`:''}</section></div>
  </div>`;

  const content=current==='contacts'?contactsHtml:current==='activity'?activityHtml:current==='opportunities'?oppHtml:current==='intelligence'?intelligenceHtml:overview;

  const html=`<div id="sales-account-360-modal" class="fixed inset-0 z-[10020] bg-black/60 backdrop-blur-sm p-2 lg:p-5"><div class="h-full max-w-[1450px] mx-auto bg-[#f7f7f4] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
    <header class="bg-charcoal-900 text-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><p class="text-[10px] font-bold tracking-[.18em] text-gold-300">ACCOUNT 360</p><div class="flex gap-2 items-center flex-wrap"><h2 class="text-2xl lg:text-3xl font-bold">${esc(lead.companyName)}</h2><span class="badge ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span></div><p class="text-sm text-white/60 mt-1">${esc(lead.businessType||'Sector not set')} · ${esc(lead.postcode||'Area not set')} · Owner: ${esc(lead.assignedTo||'Unassigned')}</p></div><div class="flex gap-2 flex-wrap"><button onclick="SalesOS.startAccountSession('${lead.id}')" class="px-3 py-2 bg-gold-500 text-white rounded-lg text-xs font-bold">Start Guided Session</button>${window.SalesOS?.openSequenceForm?`<button onclick="SalesOS.startAccountSequence('${lead.id}')" class="px-3 py-2 bg-olive-700 text-white rounded-lg text-xs font-bold">Sequence</button><button onclick="SalesOS.startAccountNurture('${lead.id}')" class="px-3 py-2 bg-white/10 text-white rounded-lg text-xs font-bold">Nurture</button>`:''}<button onclick="SalesOS.startAccountEdit('${lead.id}')" class="px-3 py-2 bg-white text-charcoal-900 rounded-lg text-xs font-bold">Edit Account</button><button onclick="SalesOS.closeAccount360()" class="p-2 bg-white/10 rounded-lg"><i data-lucide="x"></i></button></div></header>
    <nav class="bg-white border-b px-3 py-2 flex gap-1 overflow-x-auto">${tabs.map(([id,label])=>`<button onclick="SalesOS.setAccountTab('${id}','${lead.id}')" class="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${current===id?'bg-charcoal-900 text-white':'text-gray-600 hover:bg-olive-50'}">${label}</button>`).join('')}</nav>
    <main class="flex-1 overflow-y-auto p-3 lg:p-5">${content}</main>
  </div></div>`;

  if(modal)modal.outerHTML=html;
  else{const host=document.createElement('div');host.innerHTML=html;document.body.appendChild(host.firstElementChild);document.body.style.overflow='hidden';}
  if(window.lucide)lucide.createIcons();
};

SalesOS.startAccountSession=function(leadId){
  SalesOS.closeAccount360();
  setTimeout(()=>SalesOS.openLiveCall(leadId),30);
};
SalesOS.startAccountSequence=function(leadId){
  SalesOS.closeAccount360();
  setTimeout(()=>SalesOS.openSequenceForm(leadId),30);
};
SalesOS.startAccountNurture=function(leadId){
  SalesOS.closeAccount360();
  setTimeout(()=>SalesOS.openNurtureForm(leadId),30);
};
SalesOS.startAccountOpportunity=function(leadId){
  SalesOS.closeAccount360();
  setTimeout(()=>openLeadOpportunityWizard(leadId),30);
};
SalesOS.startAccountEdit=function(leadId){
  SalesOS.closeAccount360();
  setTimeout(()=>openSalesLeadForm(leadId),30);
};

SalesOS.openAccount360=function(leadId,tab='overview'){
  SalesOS.accountTab=tab;
  SalesOS.renderAccount360(leadId);
};

SalesOS.closeAccount360=function(){
  document.getElementById('sales-account-360-modal')?.remove();
  document.body.style.overflow='';
};


// The old prospect-detail modal is superseded by Account 360.
// Keep the global function name because other CRM buttons already call it.
viewSalesLead=function(id){SalesOS.openAccount360(id,'overview');};
