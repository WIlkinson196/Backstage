// SALES OS 2.0 — PHASE 3: PROSPECTS / ACCOUNT WORKSPACE

SalesOS.prospectView=localStorage.getItem('windmill_sales_prospect_view')||'all';

SalesOS.prospectViewMatch=function(lead,view){
  const days=SalesOS.daysSince(lead.lastContact);
  if(view==='unworked')return !lead.lastContact||Number(lead.contactAttempts||0)===0;
  if(view==='engaged')return ['Conversation Started','Meeting Booked','Proposal Required','Proposal Sent','Negotiation'].includes(lead.status)||['Warm','Hot','Strategic'].includes(lead.relationship);
  if(view==='dormant')return activeSalesLead(lead)&&days!==null&&days>=30;
  if(view==='customers')return lead.status==='Converted'||!!SalesOS.accountCompany(lead)?.currentCustomer;
  if(view==='needs-dm')return activeSalesLead(lead)&&!SalesOS.accountContacts(lead).some(c=>c.decisionMaker);
  return true;
};

SalesOS.setProspectView=function(view){
  SalesOS.prospectView=view||'all';
  localStorage.setItem('windmill_sales_prospect_view',SalesOS.prospectView);
  SalesOS.filterProspects();
};

SalesOS.filterProspects=function(){
  const query=(document.getElementById('sales-search')?.value||'').toLowerCase();
  const status=document.getElementById('sales-status')?.value||'';
  const owner=document.getElementById('sales-owner')?.value||'';
  const industry=document.getElementById('sales-industry')?.value||'';
  let rows=(DB.salesLeads||[]).filter(lead=>{
    const company=SalesOS.accountCompany(lead),contacts=SalesOS.accountContacts(lead);
    const hay=[lead.companyName,lead.contactName,lead.jobTitle,lead.phone,lead.email,lead.postcode,lead.businessType,lead.servicesNeeded,lead.nextAction,company?.name,...contacts.flatMap(c=>[c.name,c.jobTitle,c.email,c.phone])].join(' ').toLowerCase();
    return (!query||hay.includes(query))&&(!status||lead.status===status)&&(!owner||lead.assignedTo===owner)&&(!industry||lead.businessType===industry)&&SalesOS.prospectViewMatch(lead,SalesOS.prospectView);
  });
  rows.sort((a,b)=>SalesOS.priority(b)-SalesOS.priority(a));
  const list=document.getElementById('sales-lead-list');if(!list)return;
  list.innerHTML=rows.length?rows.map(renderSalesLeadCard).join(''):`<div class="bg-white rounded-2xl border border-dashed p-10 text-center"><i data-lucide="building-2" class="mx-auto text-gray-300"></i><p class="font-bold mt-3">No accounts match this view</p><p class="text-sm text-gray-400 mt-1">Change the filters or add a new target business.</p></div>`;
  document.querySelectorAll('[data-prospect-view]').forEach(b=>b.className=`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${b.dataset.prospectView===SalesOS.prospectView?'bg-charcoal-900 text-white':'bg-white border text-gray-600'}`);
  if(window.lucide)lucide.createIcons();
};

SalesOS.renderDatabase=function(){
  const leads=DB.salesLeads||[],active=leads.filter(activeSalesLead);
  const dormant=active.filter(l=>SalesOS.daysSince(l.lastContact)!==null&&SalesOS.daysSince(l.lastContact)>=30);
  const dm=active.filter(l=>SalesOS.accountContacts(l).some(c=>c.decisionMaker));
  const annual=active.reduce((s,l)=>s+Number(l.annualPotential||0),0);
  const views=[
    ['all','All Accounts',leads.length],
    ['unworked','Unworked',leads.filter(l=>!l.lastContact||!l.contactAttempts).length],
    ['engaged','Engaged',leads.filter(l=>SalesOS.prospectViewMatch(l,'engaged')).length],
    ['needs-dm','Need Decision Maker',active.length-dm.length],
    ['dormant','Dormant',dormant.length],
    ['customers','Customers',leads.filter(l=>SalesOS.prospectViewMatch(l,'customers')).length]
  ];
  setTimeout(()=>SalesOS.filterProspects(),0);
  return `<div class="space-y-4">
    <section class="rounded-3xl bg-gradient-to-r from-charcoal-900 via-[#35412f] to-olive-800 text-white p-5 lg:p-7"><div class="flex flex-col xl:flex-row xl:items-end justify-between gap-5"><div><p class="text-xs font-bold tracking-[.18em] text-gold-300">PROSPECTS · ACCOUNT 360</p><h2 class="text-2xl lg:text-4xl font-bold mt-1">Build relationships, not lead rows.</h2><p class="text-sm text-white/70 mt-2 max-w-3xl">See the people, relationship, commercial potential, account whitespace, activity and opportunities together. One company should become a growing account, not a forgotten single booking.</p></div><button onclick="openSalesLeadForm()" class="px-4 py-3 bg-gold-500 text-white rounded-xl font-bold">+ Target Business</button></div></section>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${SalesOS.kpi('Active Accounts',active.length,'Currently in proactive play','building-2','olive')}${SalesOS.kpi('Decision Makers',dm.length,`${active.length?Math.round(dm.length/active.length*100):0}% of active accounts`,'user-check','blue')}${SalesOS.kpi('Dormant',dormant.length,'30+ days since contact','moon-star',dormant.length?'gold':'green')}${SalesOS.kpi('Annual Potential',SalesOS.money(annual),'Estimated proactive recurring value','repeat-2','green')}</div>
    <section class="bg-white rounded-2xl border shadow-sm p-3">
      <div class="flex gap-2 overflow-x-auto pb-2">${views.map(([id,label,count])=>`<button data-prospect-view="${id}" onclick="SalesOS.setProspectView('${id}')" class="px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap">${esc(label)} <span class="opacity-60">${count}</span></button>`).join('')}</div>
      <div class="grid lg:grid-cols-[1fr_auto_auto_auto] gap-2 pt-2 border-t"><input id="sales-search" oninput="SalesOS.filterProspects()" placeholder="Search company, person, role, email, phone, sector, area or service…" class="px-4 py-2.5 rounded-lg border text-sm"><select id="sales-status" onchange="SalesOS.filterProspects()" class="px-3 py-2.5 rounded-lg border text-sm"><option value="">All Stages</option>${salesLeadStatuses().map(s=>`<option>${esc(s)}</option>`).join('')}</select><select id="sales-owner" onchange="SalesOS.filterProspects()" class="px-3 py-2.5 rounded-lg border text-sm"><option value="">All Owners</option>${activeStaff().map(s=>`<option>${esc(s.name)}</option>`).join('')}</select><select id="sales-industry" onchange="SalesOS.filterProspects()" class="px-3 py-2.5 rounded-lg border text-sm"><option value="">All Sectors</option>${[...new Set(leads.map(l=>l.businessType).filter(Boolean))].sort().map(v=>`<option>${esc(v)}</option>`).join('')}</select></div>
    </section>
    <div id="sales-lead-list" class="space-y-3"></div>
  </div>`;
};

renderSalesLeadCard=function(lead){
  const priority=SalesOS.priority(lead),relationship=SalesOS.accountRelationship(lead),commercial=SalesOS.accountCommercials(lead),contacts=SalesOS.accountContacts(lead),flags=SalesOS.accountRiskFlags(lead),expansion=SalesOS.accountExpansion(lead);
  const dm=contacts.find(c=>c.decisionMaker),sequence=window.SalesOS?.sequenceLabel?SalesOS.sequenceLabel(lead):null;
  return `<article class="bg-white rounded-2xl border ${salesLeadOverdue(lead)?'border-red-200':'border-gray-200'} shadow-sm overflow-hidden hover:shadow-md transition">
    <div class="p-4 lg:p-5 grid xl:grid-cols-[72px_1fr_auto] gap-4 items-start">
      <div class="rounded-xl ${priority>=110?'bg-red-50 text-red-700':priority>=80?'bg-gold-50 text-amber-700':'bg-olive-50 text-olive-700'} p-3 text-center"><p class="text-[9px] font-bold">PRIORITY</p><p class="text-2xl font-bold">${priority}</p></div>
      <div class="min-w-0">
        <div class="flex gap-2 items-center flex-wrap"><button onclick="SalesOS.openAccount360('${lead.id}')" class="font-bold text-lg hover:text-olive-700 text-left">${esc(lead.companyName)}</button><span class="badge ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span><span class="px-2 py-1 rounded-full text-[9px] font-bold bg-gray-100 text-gray-700">${relationship.label} ${relationship.score}</span>${flags.length?`<span class="badge bg-amber-100 text-amber-800">${flags.length} risk${flags.length===1?'':'s'}</span>`:''}${sequence?`<span class="badge ${sequence.tone==='blue'?'bg-blue-100 text-blue-700':sequence.tone==='olive'?'bg-olive-100 text-olive-800':'bg-gray-100 text-gray-600'}">${esc(sequence.label)}</span>`:''}</div>
        <p class="text-xs text-gray-500 mt-1">${dm?`Decision maker: ${esc(dm.name)}${dm.jobTitle?' · '+esc(dm.jobTitle):''}`:contacts.length?`${esc(contacts[0].name)} · decision maker not confirmed`:'No named contact'} · ${esc(lead.businessType||'Sector missing')} · ${esc(lead.postcode||'Area missing')}</p>
        <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-3">
          <div class="rounded-xl bg-cream-50 p-3"><p class="text-[9px] text-gray-500">NEXT MOVE</p><p class="text-xs font-semibold mt-1">${esc(SalesOS.accountNextMove(lead))}</p></div>
          <div class="rounded-xl bg-gray-50 p-3"><p class="text-[9px] text-gray-500">ACCOUNT POTENTIAL</p><p class="text-sm font-bold mt-1">${SalesOS.money(lead.potentialValue)}</p><p class="text-[9px] text-gray-400">${SalesOS.money(commercial.annual)} annual</p></div>
          <div class="rounded-xl bg-gray-50 p-3"><p class="text-[9px] text-gray-500">OPEN OPPORTUNITIES</p><p class="text-sm font-bold mt-1">${commercial.open.length} · ${SalesOS.money(commercial.pipeline)}</p><p class="text-[9px] text-gray-400">${SalesOS.money(commercial.weighted)} weighted</p></div>
          <div class="rounded-xl bg-gray-50 p-3"><p class="text-[9px] text-gray-500">ACCOUNT WHITESPACE</p><p class="text-sm font-bold mt-1">${expansion.filter(x=>!x.unsuitable&&!x.known).length} areas</p><p class="text-[9px] text-gray-400">${expansion.filter(x=>x.recommended&&!x.known).length} recommended</p></div>
        </div>
      </div>
      <div class="flex xl:flex-col gap-2 flex-wrap">${activeSalesLead(lead)?`<button onclick="SalesOS.openLiveCall('${lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-bold">Guided Session</button>`:''}<button onclick="SalesOS.openAccount360('${lead.id}')" class="px-3 py-2 bg-olive-700 text-white rounded-lg text-xs font-bold">Account 360</button><button onclick="openLeadOpportunityWizard('${lead.id}')" class="px-3 py-2 bg-gold-50 text-amber-800 rounded-lg text-xs font-bold">+ Opportunity</button></div>
    </div>
  </article>`;
};

// Keep legacy filter entry points functional when other parts of the CRM invoke them.
filterSalesLeads=SalesOS.filterProspects;
setSalesLeadView=function(view){SalesOS.setProspectView(view==='hot'?'engaged':view==='uncontacted'?'unworked':view==='all'?'all':'all');};
