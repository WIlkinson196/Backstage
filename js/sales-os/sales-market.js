
SalesOS.sectorData = function() {
  const sectors = {};
  (DB.salesLeads || []).forEach(lead => {
    const name = lead.businessType || 'Not Recorded';
    if (!sectors[name]) sectors[name] = {name,total:0,active:0,meetings:0,proposals:0,converted:0,pipeline:0,annual:0};
    const row = sectors[name];
    row.total++;
    if (activeSalesLead(lead)) row.active++;
    if (lead.status === 'Meeting Booked') row.meetings++;
    if (['Proposal Required','Proposal Sent','Negotiation'].includes(lead.status)) row.proposals++;
    if (lead.status === 'Converted') row.converted++;
    row.pipeline += Number(lead.potentialValue || 0);
    row.annual += Number(lead.annualPotential || 0);
  });
  return Object.values(sectors).sort((a,b)=>b.pipeline-a.pipeline||b.total-a.total);
};

SalesOS.marketGaps = function() {
  const desired = [
    ['Care Home','Wakes, family gatherings, staff training, Christmas lunches and accommodation'],
    ['Construction','Training, recruitment, awards, Christmas parties and accommodation'],
    ['Education','INSET days, governor meetings, proms, awards and staff celebrations'],
    ['Funeral Director','Wake referrals, family catering and accommodation'],
    ['Healthcare','Training, interviews, meetings, celebrations and accommodation'],
    ['Legal','Client meetings, private dining, team days and Christmas parties'],
    ['Manufacturer','Training, conferences, recruitment, awards and accommodation'],
    ['Networking Group','Breakfasts, recurring meetings, showcases and member events'],
    ['Public Sector','Training, interviews, conferences and meetings'],
    ['Sports Club','Awards nights, dinners, meetings and accommodation'],
    ['Wedding Supplier','Referrals, showcases, styled shoots and supplier events']
  ];
  return desired.map(([sector,opportunity])=>{
    const matches=(DB.salesLeads||[]).filter(lead=>lead.businessType===sector);
    const active=matches.filter(activeSalesLead);
    return {sector,opportunity,count:matches.length,active:active.length,pipeline:active.reduce((s,l)=>s+Number(l.potentialValue||0),0),gap:matches.length<3};
  }).sort((a,b)=>Number(b.gap)-Number(a.gap)||a.count-b.count);
};

SalesOS.renderMarkets = function() {
  const sectors=SalesOS.sectorData();
  const gaps=SalesOS.marketGaps();
  const max=Math.max(...sectors.map(r=>r.pipeline),1);
  return `<div class="grid xl:grid-cols-[1.15fr_.85fr] gap-4 mb-4">${SalesOS.panel('Sector performance','Where proactive activity is creating value',`<div class="space-y-4">${sectors.length?sectors.map(row=>`<div><div class="flex justify-between gap-3 text-sm mb-1"><span>${esc(row.name)}<span class="block text-[10px] text-gray-400">${row.active} active · ${row.meetings} meeting · ${row.proposals} proposal · ${row.converted} converted</span></span><strong>${SalesOS.money(row.pipeline)}</strong></div><div class="h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-2 bg-olive-600 rounded-full" style="width:${row.pipeline/max*100}%"></div></div></div>`).join(''):'<p class="text-sm text-gray-400">No sector data has been recorded.</p>'}</div>`)}${SalesOS.panel('Market coverage gaps','Sectors where too few target businesses are recorded',`<div class="space-y-3">${gaps.map(row=>`<div class="rounded-xl border ${row.gap?'border-amber-200 bg-amber-50':'border-green-200 bg-green-50'} p-4"><div class="flex justify-between gap-3"><strong>${esc(row.sector)}</strong><span class="text-xs">${row.count} target${row.count===1?'':'s'}</span></div><p class="text-xs text-gray-600 mt-2">${esc(row.opportunity)}</p><p class="text-xs font-semibold mt-2 ${row.gap?'text-amber-800':'text-green-800'}">${row.gap?'Build a target list in this sector.':'Coverage established: progress existing accounts.'}</p></div>`).join('')}</div>`)}</div>${SalesOS.panel('How Windmill Farm should win','Commercial positioning that supports proactive selling',`<div class="grid md:grid-cols-2 xl:grid-cols-5 gap-3">${SalesOS.advantages().map(([title,detail])=>`<div class="rounded-xl bg-cream-50 border border-cream-200 p-4"><i data-lucide="badge-check" class="text-olive-700" style="width:20px;height:20px"></i><p class="font-semibold mt-2">${esc(title)}</p><p class="text-xs text-gray-500 mt-2">${esc(detail)}</p></div>`).join('')}</div>`)}`;
};
