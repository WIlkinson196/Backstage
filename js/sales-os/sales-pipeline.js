// SALES OS 2.0 FINAL — PIPELINE: TARGETS VS QUALIFIED OPPORTUNITIES
SalesOS.renderPipeline=function(){
  const leads=(DB.salesLeads||[]).filter(activeSalesLead);
  const opps=(DB.opportunities||[]).filter(o=>!['Won','Lost'].includes(o.stage));
  const targetPotential=leads.reduce((s,l)=>s+Number(l.potentialValue||0),0);
  const annualPotential=leads.reduce((s,l)=>s+Number(l.annualPotential||0),0);
  const qualified=opps.reduce((s,o)=>s+Number(o.value||0),0);
  const weighted=opps.reduce((s,o)=>s+Number(o.value||0)*Number(o.probability||0)/100,0);
  const oppStages=['Qualified','Meeting Booked','Proposal Required','Proposal Sent','Negotiation','Verbal Agreement','Deposit Required','On Hold'];
  const leadStages=salesLeadStatuses().filter(s=>!['Not Interested','Do Not Contact','Converted'].includes(s));
  const maxLead=Math.max(1,...leadStages.map(stage=>leads.filter(l=>l.status===stage).length));
  const risk=opps.filter(o=>!o.nextAction||!o.nextFollowup||(o.nextFollowup<currentDateStr()));
  return `<div class="space-y-4">
    <section class="rounded-3xl bg-gradient-to-r from-charcoal-900 via-[#34402b] to-olive-800 text-white p-5 lg:p-7"><p class="text-xs font-bold tracking-[.18em] text-gold-300">PIPELINE</p><h2 class="text-2xl lg:text-4xl font-bold mt-1">Separate prospect potential from qualified revenue.</h2><p class="text-sm text-white/70 mt-2">Targets show where business might exist. Formal Opportunities are the commercial pipeline and drive the weighted forecast.</p></section>
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      ${SalesOS.kpi('Active Targets',leads.length,'Accounts still being prospected','building-2','olive')}
      ${SalesOS.kpi('Target Potential',SalesOS.money(targetPotential),'Unqualified / developing prospect potential','crosshair','gold')}
      ${SalesOS.kpi('Qualified Pipeline',SalesOS.money(qualified),`${opps.length} formal opportunities`,'briefcase-business','green')}
      ${SalesOS.kpi('Weighted Forecast',SalesOS.money(weighted),'Evidence probability applied','chart-no-axes-combined','blue')}
      ${SalesOS.kpi('Revenue at Risk',SalesOS.money(risk.reduce((s,o)=>s+Number(o.value||0),0)),`${risk.length} opportunities need control`,'triangle-alert',risk.length?'red':'green')}
    </div>
    <div class="grid xl:grid-cols-[1.15fr_.85fr] gap-4">
      <section class="bg-white rounded-2xl border overflow-hidden"><div class="p-5 border-b"><p class="text-[10px] font-bold tracking-widest text-olive-700">QUALIFIED OPPORTUNITY PIPELINE</p><h3 class="font-bold text-xl">Revenue by real buying stage</h3></div><div class="divide-y">${oppStages.map(stage=>{const rows=opps.filter(o=>o.stage===stage),value=rows.reduce((s,o)=>s+Number(o.value||0),0),weightedValue=rows.reduce((s,o)=>s+Number(o.value||0)*Number(o.probability||0)/100,0);return `<div class="p-4"><div class="flex justify-between gap-3"><div><strong>${esc(stage)}</strong><p class="text-xs text-gray-500">${rows.length} opportunit${rows.length===1?'y':'ies'}</p></div><div class="text-right"><strong>${SalesOS.money(value)}</strong><p class="text-xs text-gray-500">${SalesOS.money(weightedValue)} weighted</p></div></div>${rows.length?`<div class="mt-3 space-y-1">${rows.slice(0,4).map(o=>{const h=window.SalesOS?.opportunityHealth?SalesOS.opportunityHealth(o):null;return `<button onclick="viewOpportunity('${o.id}')" class="w-full text-left rounded-lg bg-cream-50 p-2 flex justify-between gap-2"><span class="text-xs">${esc(o.title)}</span><span class="text-[10px] ${h&&h.strength.score<50?'text-red-600':'text-gray-500'}">${h?`${h.strength.score}/100 · `:''}${o.probability}%</span></button>`}).join('')}</div>`:''}</div>`}).join('')}</div></section>
      <div class="space-y-4">
        <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-olive-700">TARGET FUNNEL</p><h3 class="font-bold text-xl">Prospecting progression</h3><p class="text-xs text-gray-500 mt-1">This is not counted as qualified pipeline until a formal Opportunity exists.</p><div class="space-y-3 mt-4">${leadStages.map(stage=>{const rows=leads.filter(l=>l.status===stage);return `<div><div class="flex justify-between text-xs"><span>${esc(stage)}</span><strong>${rows.length}</strong></div><div class="h-2 bg-gray-100 rounded-full overflow-hidden mt-1"><div class="h-full bg-olive-600" style="width:${rows.length/maxLead*100}%"></div></div></div>`}).join('')}</div></section>
        <section class="bg-charcoal-900 text-white rounded-2xl p-5"><p class="text-[10px] font-bold tracking-widest text-olive-200">RECURRING POTENTIAL</p><strong class="text-3xl block mt-2">${SalesOS.money(annualPotential)}</strong><p class="text-xs text-white/60 mt-2">Account-level annual potential recorded across active targets. This remains potential until qualified into Opportunities.</p></section>
      </div>
    </div>
  </div>`;
};
