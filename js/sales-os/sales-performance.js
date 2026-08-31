
SalesOS.renderPerformance = function() {
  const activities=DB.salesActivities||[];
  const leads=DB.salesLeads||[];
  const owners=[...new Set([...leads.map(l=>l.assignedTo),...activities.map(a=>a.staff)].filter(Boolean))];
  const rows=owners.map(owner=>{
    const ownerActivities=activities.filter(a=>a.staff===owner);
    const ownerLeads=leads.filter(l=>l.assignedTo===owner);
    const calls=ownerActivities.filter(SalesOS.isCall).length;
    const meetings=ownerActivities.filter(SalesOS.isMeeting).length;
    const positive=ownerActivities.filter(SalesOS.isPositive).length;
    const converted=ownerLeads.filter(l=>l.status==='Converted').length;
    const pipeline=ownerLeads.filter(activeSalesLead).reduce((s,l)=>s+Number(l.potentialValue||0),0);
    const overdue=ownerLeads.filter(salesLeadOverdue).length;
    let coaching='Build a consistent prospecting rhythm and record every outcome.';
    if(calls>=20&&meetings===0)coaching='Strong activity but no meetings: improve discovery questions and ask for a clear next step.';
    if(meetings>0&&converted===0)coaching='Meetings are being created; focus on proposals, decision dates and follow-up.';
    if(converted>0&&overdue===0)coaching='Strong control and conversion. Increase target-account volume without reducing quality.';
    if(overdue>0)coaching=`Clear ${overdue} overdue prospect${overdue===1?'':'s'} before expanding the call list.`;
    return {owner,calls,meetings,positive,converted,pipeline,overdue,coaching};
  }).sort((a,b)=>b.converted-a.converted||b.pipeline-a.pipeline||b.calls-a.calls);
  return `<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">${rows.length?rows.map((row,index)=>`<article class="bg-white rounded-2xl border shadow-sm p-5"><div class="flex justify-between gap-3"><div><p class="text-xs text-gray-500">TEAM MEMBER</p><h3 class="font-bold text-xl">${esc(row.owner)}</h3></div><span class="w-9 h-9 rounded-full ${index===0?'bg-gold-500 text-white':'bg-olive-100 text-olive-700'} flex items-center justify-center font-bold">${index+1}</span></div><div class="grid grid-cols-3 gap-2 mt-4 text-center"><div class="rounded-lg bg-cream-50 p-3"><p class="text-[10px] text-gray-500">Calls</p><p class="font-bold text-lg">${row.calls}</p></div><div class="rounded-lg bg-cream-50 p-3"><p class="text-[10px] text-gray-500">Meetings</p><p class="font-bold text-lg">${row.meetings}</p></div><div class="rounded-lg bg-cream-50 p-3"><p class="text-[10px] text-gray-500">Converted</p><p class="font-bold text-lg">${row.converted}</p></div></div><div class="grid grid-cols-2 gap-2 mt-2 text-center"><div class="rounded-lg bg-blue-50 p-3"><p class="text-[10px] text-gray-500">Positive Outcomes</p><p class="font-bold">${row.positive}</p></div><div class="rounded-lg bg-green-50 p-3"><p class="text-[10px] text-gray-500">Pipeline</p><p class="font-bold">${SalesOS.money(row.pipeline)}</p></div></div><div class="rounded-xl bg-olive-50 border border-olive-100 p-4 mt-4"><p class="text-[10px] font-bold tracking-widest text-olive-700">COACHING FOCUS</p><p class="text-sm mt-2">${esc(row.coaching)}</p></div></article>`).join(''):'<div class="bg-white rounded-2xl border p-8 text-center text-gray-400">Assign prospects and log activity to populate team performance.</div>'}</div>`;
};
