
// ============================================================================
// SALES OS PHASE 3 — MANAGER DASHBOARD
// ============================================================================

SalesOS.managerRows = function() {
  const activities = DB.salesActivities || [];
  const leads = DB.salesLeads || [];
  const owners = [...new Set([...leads.map(lead => lead.assignedTo), ...activities.map(activity => activity.staff)].filter(Boolean))];

  return owners.map(owner => {
    const ownerLeads = leads.filter(lead => lead.assignedTo === owner);
    const ownerActivities = activities.filter(activity => activity.staff === owner);
    const calls = ownerActivities.filter(SalesOS.isCall).length;
    const meetings = ownerActivities.filter(SalesOS.isMeeting).length;
    const positives = ownerActivities.filter(SalesOS.isPositive).length;
    const converted = ownerLeads.filter(lead => lead.status === 'Converted').length;
    const overdue = ownerLeads.filter(salesLeadOverdue).length;
    const pipeline = ownerLeads.filter(activeSalesLead).reduce((sum, lead) => sum + Number(lead.potentialValue || 0), 0);
    const health = ownerLeads.length
      ? Math.round(ownerLeads.reduce((sum, lead) => sum + SalesOS.companyHealth(lead), 0) / ownerLeads.length)
      : 0;

    let coaching = 'Build a consistent prospecting rhythm.';
    if (calls >= 20 && meetings === 0) coaching = 'Improve discovery and ask directly for a meeting or venue visit.';
    if (meetings > 0 && converted === 0) coaching = 'Strengthen proposal follow-up and decision-date control.';
    if (overdue > 0) coaching = `Clear ${overdue} overdue account${overdue === 1 ? '' : 's'} before expanding the prospect list.`;
    if (converted > 0 && overdue === 0) coaching = 'Strong conversion and control. Increase strategic-account volume.';

    return { owner, calls, meetings, positives, converted, overdue, pipeline, health, coaching };
  }).sort((a, b) => b.converted - a.converted || b.pipeline - a.pipeline || b.calls - a.calls);
};

SalesOS.renderManager = function() {
  const rows = SalesOS.managerRows();

  return `<div class="bg-gradient-to-r from-charcoal-900 to-blue-900 text-white rounded-2xl p-5 lg:p-7 mb-4">
    <p class="text-xs font-bold tracking-widest text-blue-200">MANAGER DASHBOARD</p>
    <h2 class="text-2xl lg:text-4xl font-bold mt-1">See activity, progression, control and coaching needs.</h2>
  </div>

  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
    ${rows.length ? rows.map((row, index) => `<article class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div class="flex justify-between gap-3">
        <div>
          <p class="text-xs text-gray-500">TEAM MEMBER</p>
          <h3 class="text-xl font-bold">${esc(row.owner)}</h3>
        </div>
        <span class="w-10 h-10 rounded-full ${index === 0 ? 'bg-gold-500 text-white' : 'bg-olive-100 text-olive-700'} flex items-center justify-center font-bold">${index + 1}</span>
      </div>

      <div class="grid grid-cols-3 gap-2 mt-4 text-center">
        <div class="rounded-lg bg-cream-50 p-3"><p class="text-[10px] text-gray-500">Calls</p><p class="font-bold text-lg">${row.calls}</p></div>
        <div class="rounded-lg bg-cream-50 p-3"><p class="text-[10px] text-gray-500">Meetings</p><p class="font-bold text-lg">${row.meetings}</p></div>
        <div class="rounded-lg bg-cream-50 p-3"><p class="text-[10px] text-gray-500">Converted</p><p class="font-bold text-lg">${row.converted}</p></div>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-2 text-center">
        <div class="rounded-lg bg-green-50 p-3"><p class="text-[10px] text-gray-500">Pipeline</p><p class="font-bold">${SalesOS.money(row.pipeline)}</p></div>
        <div class="rounded-lg bg-blue-50 p-3"><p class="text-[10px] text-gray-500">Account Health</p><p class="font-bold">${row.health}%</p></div>
      </div>

      <div class="rounded-xl ${row.overdue ? 'bg-red-50 border-red-200' : 'bg-olive-50 border-olive-100'} border p-4 mt-4">
        <p class="text-[10px] font-bold tracking-widest ${row.overdue ? 'text-red-700' : 'text-olive-700'}">COACHING FOCUS</p>
        <p class="text-sm mt-2">${esc(row.coaching)}</p>
      </div>
    </article>`).join('') : '<div class="bg-white rounded-2xl border p-8 text-center text-gray-400">Assign owners and log activity to populate this dashboard.</div>'}
  </div>`;
};
