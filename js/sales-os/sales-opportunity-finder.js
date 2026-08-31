// SALES OS 2.0 — PHASE 6: INTELLIGENCE + OPPORTUNITY FINDER
(function(){
  const plays=[
    {
      key:'meetings',label:'Corporate Meetings',icon:'presentation',
      sectors:['Construction','Manufacturer','Healthcare','Care Home','Legal','Public Sector','Education'],
      services:['Meetings','Training Days','Conferences'],
      objective:'Find organisations likely to need regular meetings, training, interviews or off-site working sessions.',
      target:'Local employers with 20+ staff, recurring internal meetings, training or recruitment activity.',
      firstMove:'Identify the organiser and secure a trial meeting or venue visit.'
    },
    {
      key:'christmas',label:'Christmas Parties',icon:'gift',
      sectors:['Construction','Manufacturer','Healthcare','Care Home','Legal','Public Sector','Education','Sports Club'],
      services:['Christmas Parties','Staff Celebrations'],
      objective:'Find businesses with enough staff to support a private or group Christmas booking.',
      target:'Employers, clubs and organisations with staff/member groups large enough for a meaningful festive event.',
      firstMove:'Find who organises the staff Christmas event and when planning normally begins.'
    },
    {
      key:'accommodation',label:'Accommodation',icon:'bed-double',
      sectors:['Construction','Manufacturer','Healthcare','Public Sector','Education','Sports Club'],
      services:['Accommodation'],
      objective:'Find organisations that bring contractors, trainers, visitors or teams into Lincoln.',
      target:'Employers with visiting staff, external trainers, projects, contractors or regional teams.',
      firstMove:'Identify who books external accommodation and what volume / frequency they use.'
    },
    {
      key:'networking',label:'Networking & Associations',icon:'users',
      sectors:['Networking Group','Legal','Wedding Supplier'],
      services:['Networking Events','Meetings','Private Dining'],
      objective:'Find recurring groups where one relationship can create 6–12+ events per year.',
      target:'Membership groups, trade groups, referral networks and associations with regular meetings.',
      firstMove:'Understand frequency, attendance, current venue and annual spend — then sell a venue visit.'
    },
    {
      key:'wakes',label:'Funeral Partnerships',icon:'flower-2',
      sectors:['Funeral Director','Care Home'],
      services:['Wakes','Private Dining','Accommodation'],
      objective:'Build professional referral relationships rather than hard-selling individual wakes.',
      target:'Funeral directors and organisations that regularly support families after a service.',
      firstMove:'Show the room, catering and parking so their team can confidently recommend the venue.'
    },
    {
      key:'awards',label:'Awards & Celebrations',icon:'trophy',
      sectors:['Sports Club','Construction','Manufacturer','Education','Care Home','Healthcare'],
      services:['Awards Evenings','Staff Celebrations','Private Dining'],
      objective:'Find annual celebrations, presentation nights, awards evenings and staff events.',
      target:'Clubs, employers and organisations with annual recognition or member events.',
      firstMove:'Find the annual event calendar and secure the next realistic event date.'
    }
  ];
  SalesOS.finderPlays=plays;
  SalesOS.finderSelectedPlay=localStorage.getItem('windmill_sales_finder_play')||'meetings';

  SalesOS.finderPlay=function(key){return plays.find(p=>p.key===key)||plays[0];};

  SalesOS.finderAccountScore=function(lead,play){
    let score=0,reasons=[];
    const sector=String(lead.businessType||'');
    const services=String(lead.servicesNeeded||'').toLowerCase();
    const days=SalesOS.daysSince(lead.lastContact);
    if(play.sectors.includes(sector)){score+=28;reasons.push('Strong sector fit');}
    if(play.services.some(s=>services.includes(s.toLowerCase()))){score+=24;reasons.push('Relevant need already identified');}
    if(!lead.servicesNeeded){score+=9;reasons.push('Account whitespace still unqualified');}
    if(!lead.contactName){score+=8;reasons.push('Decision-maker research opportunity');}
    if(lead.decisionMaker){score+=10;reasons.push('Decision maker known');}
    if(['Warm','Hot','Strategic'].includes(lead.relationship)){score+=12;reasons.push('Existing relationship');}
    if(days!==null&&days>=30){score+=9;reasons.push('Ready for re-engagement');}
    if(!lead.lastContact){score+=7;reasons.push('Untouched target');}
    if(Number(lead.annualPotential||0)>0){score+=Math.min(12,Math.round(Number(lead.annualPotential)/2000));reasons.push('Annual value recorded');}
    if(Number(lead.potentialValue||0)>0){score+=Math.min(8,Math.round(Number(lead.potentialValue)/1000));}
    if(salesLeadOverdue(lead)){score+=8;reasons.push('Commercial follow-up overdue');}
    return {score:Math.min(100,score),reasons:[...new Set(reasons)].slice(0,4)};
  };

  SalesOS.finderRows=function(key){
    const play=SalesOS.finderPlay(key);
    return (DB.salesLeads||[])
      .filter(activeSalesLead)
      .map(lead=>({lead,...SalesOS.finderAccountScore(lead,play)}))
      .filter(row=>row.score>=15)
      .sort((a,b)=>b.score-a.score||Number(b.lead.annualPotential||b.lead.potentialValue)-Number(a.lead.annualPotential||a.lead.potentialValue));
  };

  SalesOS.finderWhiteSpace=function(){
    const rows=(DB.salesLeads||[]).filter(activeSalesLead);
    return plays.map(play=>{
      const matches=rows.filter(lead=>{
        const sector=String(lead.businessType||'');
        const services=String(lead.servicesNeeded||'').toLowerCase();
        return play.sectors.includes(sector)&&!play.services.some(s=>services.includes(s.toLowerCase()));
      });
      const potential=matches.reduce((s,l)=>s+Number(l.annualPotential||l.potentialValue||0),0);
      return {play,matches,count:matches.length,potential};
    }).sort((a,b)=>b.potential-a.potential||b.count-a.count);
  };

  SalesOS.finderSectorCoverage=function(){
    const desired=SalesOS.marketGaps?SalesOS.marketGaps():[];
    return desired.map(row=>{
      const active=(DB.salesLeads||[]).filter(l=>activeSalesLead(l)&&l.businessType===row.sector);
      const engaged=active.filter(l=>['Conversation Started','Meeting Booked','Proposal Required','Proposal Sent','Negotiation'].includes(l.status));
      const dm=active.filter(l=>l.decisionMaker);
      const annual=active.reduce((s,l)=>s+Number(l.annualPotential||0),0);
      return {...row,engaged:engaged.length,decisionMakers:dm.length,annual};
    });
  };

  SalesOS.finderSession=function(key,limit=8){
    const rows=SalesOS.finderRows(key).filter(r=>r.lead.phone||r.lead.email).slice(0,limit);
    if(!rows.length){toast('No contactable accounts match this sales play yet','error');return;}
    SalesOS.sessionQueue=rows.map(r=>r.lead.id);
    SalesOS.activeLeadId=rows[0].lead.id;
    SalesOS.sessionOpen=true;
    SalesOS.setView('today');
    setTimeout(()=>SalesOS.openLiveCall(rows[0].lead.id),80);
  };

  SalesOS.setFinderPlay=function(key){
    SalesOS.finderSelectedPlay=key;
    localStorage.setItem('windmill_sales_finder_play',key);
    SalesOS.setView('intelligence');
  };

  SalesOS.finderTargetBrief=function(key){
    const play=SalesOS.finderPlay(key),coverage=SalesOS.finderSectorCoverage().filter(x=>play.sectors.includes(x.sector));
    const thin=coverage.filter(x=>x.count<3);
    return {play,coverage,thin};
  };

  SalesOS.renderFinder=function(){
    const key=SalesOS.finderSelectedPlay,play=SalesOS.finderPlay(key),rows=SalesOS.finderRows(key),white=SalesOS.finderWhiteSpace(),coverage=SalesOS.finderSectorCoverage(),brief=SalesOS.finderTargetBrief(key);
    const contactable=rows.filter(r=>r.lead.phone||r.lead.email);
    const annual=rows.reduce((s,r)=>s+Number(r.lead.annualPotential||r.lead.potentialValue||0),0);
    const untouched=rows.filter(r=>!r.lead.lastContact).length;
    const noDM=rows.filter(r=>!r.lead.decisionMaker).length;

    return `<div class="space-y-4">
      <section class="rounded-3xl bg-gradient-to-r from-charcoal-900 via-[#293a31] to-blue-900 text-white p-5 lg:p-7">
        <div class="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          <div><p class="text-xs font-bold tracking-[.18em] text-blue-200">INTELLIGENCE · OPPORTUNITY FINDER</p><h2 class="text-2xl lg:text-4xl font-bold mt-1">Where should Windmill Farm find its next £10k?</h2><p class="text-sm text-white/70 mt-2 max-w-3xl">Choose what you want to sell. The CRM turns existing account data, sector fit, relationship strength, whitespace and follow-up risk into a ranked action list.</p></div>
          <div class="flex gap-2 flex-wrap"><button onclick="SalesOS.finderSession('${key}',8)" class="px-4 py-3 bg-gold-500 text-white rounded-xl font-bold">Work Top 8</button><button onclick="openSalesLeadForm()" class="px-4 py-3 bg-white text-charcoal-900 rounded-xl font-bold">+ Add Target</button></div>
        </div>
      </section>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${SalesOS.kpi('Matched Accounts',rows.length,`${contactable.length} contactable`,'building-2','olive')}
        ${SalesOS.kpi('Potential',SalesOS.money(annual),'Recorded annual / immediate value','badge-pound-sterling','green')}
        ${SalesOS.kpi('Untouched',untouched,'No recorded customer contact','sparkles',untouched?'gold':'green')}
        ${SalesOS.kpi('Need Decision Maker',noDM,'Commercial authority not yet known','user-search',noDM?'red':'green')}
      </div>

      <section class="bg-white rounded-2xl border p-4">
        <div class="flex gap-2 overflow-x-auto">${plays.map(p=>`<button onclick="SalesOS.setFinderPlay('${p.key}')" class="min-w-[160px] text-left rounded-xl p-3 border ${p.key===key?'bg-charcoal-900 text-white border-charcoal-900':'bg-white hover:bg-olive-50'}"><i data-lucide="${p.icon}" style="width:17px;height:17px"></i><strong class="block text-xs mt-2">${esc(p.label)}</strong></button>`).join('')}</div>
      </section>

      <div class="grid xl:grid-cols-[1.25fr_.75fr] gap-4">
        <section class="bg-white rounded-2xl border overflow-hidden">
          <div class="p-5 border-b"><p class="text-[10px] font-bold tracking-widest text-olive-700">${esc(play.label.toUpperCase())}</p><h3 class="font-bold text-xl mt-1">Best accounts to work</h3><p class="text-xs text-gray-500 mt-1">${esc(play.objective)}</p></div>
          <div class="divide-y max-h-[760px] overflow-y-auto">${rows.length?rows.slice(0,25).map((row,i)=>`<article class="p-4 grid lg:grid-cols-[40px_1fr_auto] gap-3 items-start"><span class="w-9 h-9 rounded-full ${i<5?'bg-gold-500 text-white':'bg-olive-100 text-olive-700'} flex items-center justify-center font-bold">${i+1}</span><div><div class="flex items-center gap-2 flex-wrap"><strong>${esc(row.lead.companyName)}</strong><span class="badge ${salesLeadStatusColor(row.lead.status)}">${esc(row.lead.status)}</span><span class="badge bg-blue-100 text-blue-700">${row.score}/100 fit</span></div><p class="text-xs text-gray-500 mt-1">${esc(row.lead.businessType||'Sector missing')} · ${esc(row.lead.contactName||'Decision maker missing')} · ${SalesOS.money(row.lead.annualPotential||row.lead.potentialValue)} potential</p><div class="flex flex-wrap gap-1.5 mt-2">${row.reasons.map(r=>`<span class="px-2 py-1 rounded-full bg-gray-100 text-[9px] text-gray-600">${esc(r)}</span>`).join('')}</div></div><div class="flex lg:flex-col gap-2"><button onclick="SalesOS.openLiveCall('${row.lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-bold">Work</button><button onclick="SalesOS.openAccount360('${row.lead.id}','intelligence')" class="px-3 py-2 bg-olive-50 text-olive-800 rounded-lg text-xs font-bold">Account</button></div></article>`).join(''):'<div class="p-8 text-center text-gray-400">No existing accounts match this play yet. Use the target brief to build the database.</div>'}</div>
        </section>

        <div class="space-y-4">
          <section class="bg-charcoal-900 text-white rounded-2xl p-5"><p class="text-[10px] font-bold tracking-widest text-olive-200">TARGET PROFILE</p><h3 class="font-bold text-xl mt-1">${esc(play.label)}</h3><p class="text-sm text-white/70 mt-3">${esc(play.target)}</p><div class="rounded-xl bg-white/10 p-4 mt-4"><p class="text-[10px] font-bold text-gold-300">FIRST MOVE</p><p class="text-sm mt-1">${esc(play.firstMove)}</p></div></section>
          <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-olive-700">COVERAGE GAPS</p><h3 class="font-bold text-lg mt-1">Where the target list is thin</h3><div class="space-y-2 mt-3">${brief.coverage.length?brief.coverage.map(c=>`<div class="rounded-xl border p-3 ${c.count<3?'bg-amber-50 border-amber-200':'bg-green-50 border-green-200'}"><div class="flex justify-between gap-2"><strong class="text-xs">${esc(c.sector)}</strong><span class="text-xs">${c.count} target${c.count===1?'':'s'}</span></div><p class="text-[10px] text-gray-500 mt-1">${c.engaged} engaged · ${c.decisionMakers} decision makers · ${SalesOS.money(c.annual)} annual potential</p></div>`).join(''):'<p class="text-sm text-gray-400">No coverage data.</p>'}</div></section>
          <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-olive-700">WHAT TO LOOK FOR NEXT</p><p class="text-sm mt-2">${brief.thin.length?`Build more targets in ${brief.thin.map(x=>x.sector).join(', ')}. These sectors currently have fewer than three recorded targets.`:'Coverage exists across the selected sectors. Focus on progressing the accounts already recorded.'}</p></section>
        </div>
      </div>

      <section class="bg-white rounded-2xl border overflow-hidden"><div class="p-5 border-b"><p class="text-[10px] font-bold tracking-widest text-olive-700">ACCOUNT WHITESPACE</p><h3 class="font-bold text-xl">Existing relationships with untested revenue streams</h3><p class="text-xs text-gray-500 mt-1">These aren't cold targets — they're accounts where a relevant service has not yet been identified.</p></div><div class="grid md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">${white.slice(0,6).map(w=>`<div class="rounded-xl border p-4"><div class="flex justify-between gap-2"><strong>${esc(w.play.label)}</strong><span class="badge bg-olive-100 text-olive-800">${w.count}</span></div><p class="text-sm mt-2">${SalesOS.money(w.potential)} recorded potential across accounts where this service is still whitespace.</p><button onclick="SalesOS.setFinderPlay('${w.play.key}')" class="mt-3 text-xs font-bold text-olive-700">Explore accounts →</button></div>`).join('')}</div></section>
    </div>`;
  };

  // Intelligence now has three clearly defined modes rather than hidden standalone mini-apps.
  SalesOS.intelligenceMode=localStorage.getItem('windmill_sales_intelligence_mode')||'finder';
  SalesOS.setIntelligenceMode=function(mode){SalesOS.intelligenceMode=mode;localStorage.setItem('windmill_sales_intelligence_mode',mode);SalesOS.setView('intelligence');};

  SalesOS.renderIntelligence=function(){
    const mode=SalesOS.intelligenceMode;
    const nav=`<section class="bg-white border rounded-2xl p-2 mb-4"><div class="grid grid-cols-3 gap-1">${[
      ['finder','Opportunity Finder','crosshair'],
      ['market','Market Coverage','chart-no-axes-combined'],
      ['territory','Territory & Visits','map']
    ].map(([id,label,icon])=>`<button onclick="SalesOS.setIntelligenceMode('${id}')" class="px-3 py-2.5 rounded-xl text-xs font-bold ${mode===id?'bg-charcoal-900 text-white':'text-gray-600 hover:bg-olive-50'}"><i data-lucide="${icon}" style="width:15px;height:15px" class="inline mr-1"></i>${label}</button>`).join('')}</div></section>`;
    const body=mode==='market'?SalesOS.renderMarkets():mode==='territory'?SalesOS.renderTerritory():SalesOS.renderFinder();
    return nav+body;
  };
})();
