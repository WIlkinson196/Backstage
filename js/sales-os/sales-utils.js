
window.SalesOS = window.SalesOS || {};

SalesOS.money = function(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
};

SalesOS.date = function(value) {
  return value ? salesFormatDate(String(value).slice(0, 10)) : 'Not set';
};

SalesOS.activitiesFor = function(leadId) {
  return (DB.salesActivities || []).filter(activity => activity.leadId === leadId);
};

SalesOS.latestActivity = function(leadId) {
  return [...SalesOS.activitiesFor(leadId)]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0] || null;
};

SalesOS.daysSince = function(value) {
  if (!value) return null;
  const from = new Date(String(value).slice(0, 10) + 'T12:00:00');
  const to = new Date(currentDateStr() + 'T12:00:00');
  if (Number.isNaN(from.getTime())) return null;
  return Math.max(0, Math.round((to - from) / 86400000));
};

SalesOS.activityToday = activity => String(activity.date || '').slice(0, 10) === currentDateStr();
SalesOS.isCall = activity => /call/i.test(String(activity.type || ''));
SalesOS.isMeeting = activity => /meeting|visit/i.test(String(activity.type || ''));
SalesOS.isPositive = activity => /decision maker|information requested|interested|meeting booked|proposal required|proposal sent|negotiating|converted/i.test(String(activity.outcome || ''));

SalesOS.priority = function(lead) {
  let score = salesLeadScore(lead);
  if (salesLeadOverdue(lead)) score += 30;
  if (lead.nextFollowup === currentDateStr()) score += 20;
  if (!lead.nextFollowup && activeSalesLead(lead)) score += 22;
  if (lead.relationship === 'Strategic') score += 18;
  if (lead.relationship === 'Hot') score += 14;
  if (lead.status === 'Negotiation') score += 24;
  if (lead.status === 'Proposal Sent') score += 20;
  if (lead.status === 'Proposal Required') score += 18;
  if (lead.status === 'Meeting Booked') score += 15;
  if (Number(lead.potentialValue || 0) >= 10000) score += 15;
  if (!lead.contactName) score -= 10;
  if (!lead.phone && !lead.email) score -= 20;
  return Math.max(0, Math.min(160, score));
};

SalesOS.priorityReason = function(lead) {
  if (salesLeadOverdue(lead)) return 'Overdue: recover this prospect before it goes cold.';
  if (!lead.nextFollowup && activeSalesLead(lead)) return 'No next action is set. The opportunity is uncontrolled.';
  if (lead.status === 'Negotiation') return 'A live negotiation is close to revenue.';
  if (lead.status === 'Proposal Sent') return 'A proposal is waiting for a decision.';
  if (lead.status === 'Proposal Required') return 'The buyer is waiting for a tailored proposal.';
  if (lead.status === 'Meeting Booked') return 'Confirm the meeting and prepare a strong discovery plan.';
  if (lead.relationship === 'Strategic') return 'Strategic local account with repeat-business potential.';
  if (lead.relationship === 'Hot') return 'Strong buying signal: advance to a meeting or proposal.';
  if (!lead.contactName) return 'Identify the organiser or decision maker before the first call.';
  return 'Create a meaningful conversation and secure a dated next step.';
};

SalesOS.todayStats = function() {
  const activities = (DB.salesActivities || []).filter(SalesOS.activityToday);
  const createdToday = (DB.salesLeads || []).filter(lead => String(lead.createdAt || '').slice(0, 10) === currentDateStr());
  const opportunitiesToday=(DB.opportunities||[]).filter(o=>String(o.createdAt||'').slice(0,10)===currentDateStr());
  return {
    calls: activities.filter(SalesOS.isCall).length,
    meetings: activities.filter(SalesOS.isMeeting).length,
    positive: activities.filter(SalesOS.isPositive).length,
    activities: activities.length,
    prospects: createdToday.length,
    pipeline: opportunitiesToday.reduce((sum,o)=>sum+Number(o.value||0),0)
  };
};

SalesOS.pipelineHealth = function() {
  const leads = (DB.salesLeads || []).filter(activeSalesLead);
  const controlled = leads.filter(lead => lead.nextAction && lead.nextFollowup);
  const overdue = leads.filter(salesLeadOverdue);
  const decisionMakers = leads.filter(lead => lead.contactName && lead.decisionMaker);
  const valued = leads.filter(lead => Number(lead.potentialValue || 0) > 0);
  const score = leads.length ? Math.round(
    controlled.length / leads.length * 35 +
    (leads.length - overdue.length) / leads.length * 25 +
    decisionMakers.length / leads.length * 20 +
    valued.length / leads.length * 20
  ) : 0;
  return { leads, controlled, overdue, decisionMakers, valued, score,
    label: score >= 85 ? 'Strong' : score >= 65 ? 'Developing' : score >= 45 ? 'Weak' : 'Critical' };
};

SalesOS.progress = (value, target) => target ? Math.min(100, Math.round(Number(value || 0) / Number(target) * 100)) : 0;

SalesOS.progressCard = function(label, value, target, icon, money = false) {
  const progress = SalesOS.progress(value, target);
  return `<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
    <div class="flex justify-between gap-3">
      <div><p class="text-xs text-gray-500">${label}</p><p class="text-2xl font-bold mt-1">${money ? SalesOS.money(value) : Number(value || 0)}</p></div>
      <div class="w-10 h-10 rounded-xl bg-olive-100 text-olive-700 flex items-center justify-center"><i data-lucide="${icon}" style="width:19px;height:19px"></i></div>
    </div>
    <div class="h-2 rounded-full bg-gray-100 overflow-hidden mt-4"><div class="h-2 rounded-full ${progress >= 100 ? 'bg-green-600' : progress >= 60 ? 'bg-olive-600' : 'bg-amber-500'}" style="width:${progress}%"></div></div>
    <div class="flex justify-between text-[10px] text-gray-500 mt-2"><span>Target: ${money ? SalesOS.money(target) : target}</span><strong>${progress}%</strong></div>
  </div>`;
};

SalesOS.kpi = function(label, value, detail, icon, tone = 'olive') {
  const toneClass = {
    olive: 'text-olive-700 bg-olive-100', green: 'text-green-700 bg-green-100',
    red: 'text-red-700 bg-red-100', gold: 'text-amber-700 bg-amber-100',
    blue: 'text-blue-700 bg-blue-100', purple: 'text-purple-700 bg-purple-100'
  }[tone] || 'text-olive-700 bg-olive-100';
  return `<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
    <div class="flex items-start justify-between gap-3"><p class="text-xs text-gray-500">${label}</p><span class="w-9 h-9 rounded-lg ${toneClass} flex items-center justify-center"><i data-lucide="${icon}" style="width:17px;height:17px"></i></span></div>
    <p class="text-xl lg:text-2xl font-bold mt-2">${value}</p><p class="text-[11px] text-gray-500 mt-2">${detail}</p>
  </div>`;
};

SalesOS.panel = function(title, subtitle, content, extra = '') {
  return `<section class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${extra}">
    <div class="px-5 py-4 border-b border-gray-100"><h3 class="font-bold text-charcoal-900">${title}</h3>${subtitle ? `<p class="text-xs text-gray-500 mt-1">${subtitle}</p>` : ''}</div>
    <div class="p-5">${content}</div>
  </section>`;
};

SalesOS.queue = function() {
  return (DB.salesLeads || []).filter(activeSalesLead).sort((a, b) => SalesOS.priority(b) - SalesOS.priority(a));
};

SalesOS.advantages = function() {
  return [
    ['Lowest-priced venue option in Lincoln', 'Exceptional value without reducing service or customer care.'],
    ['Free parking', 'Removes cost and friction for delegates and guests.'],
    ['20 hotel rooms', 'Meetings, events and accommodation can stay under one roof.'],
    ['Flexible function suite', 'Suitable for meetings, training, celebrations and private events.'],
    ['Air conditioning', 'Comfortable throughout the year.'],
    ['AV support', 'Projector, televisions and microphones available.'],
    ['Dedicated event support', 'One team coordinates the booking and delivery.'],
    ['Greene King operation', 'Established standards, systems and food operation.'],
    ['Carvery and catering options', 'Flexible packages for different budgets and formats.'],
    ['Easy access from the A46', 'Convenient for Lincoln and surrounding businesses.']
  ];
};

SalesOS.firstMeetingOffer = function() {
  return {
    title: `${SalesOS.firstMeetingDiscount}% off their first meeting`,
    detail: 'A low-risk trial that lets the client experience the room, service, catering, parking and team before moving larger events.',
    script: `Rather than asking you to change everything, let us host your next meeting. We can offer ${SalesOS.firstMeetingDiscount}% off your first meeting so you can experience the venue and our service for yourself.`
  };
};

SalesOS.setView = function(view) {
  SalesOS.view = view;
  localStorage.setItem('windmill_sales_os_view', view);
  renderSection();
};
