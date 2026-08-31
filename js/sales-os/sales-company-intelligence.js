
// ============================================================================
// SALES OS PHASE 3 — COMPANY INTELLIGENCE
// ============================================================================

SalesOS.companyHealth = function(lead) {
  let score = 0;

  if (lead.contactName) score += 10;
  if (lead.decisionMaker) score += 15;
  if (lead.phone || lead.email) score += 8;
  if (lead.nextAction && lead.nextFollowup) score += 15;
  if (Number(lead.potentialValue || 0) > 0) score += 10;
  if (Number(lead.annualPotential || 0) > 0) score += 10;
  if (String(lead.servicesNeeded || '').trim()) score += 8;
  if (lead.relationship === 'Warm') score += 8;
  if (lead.relationship === 'Hot') score += 12;
  if (lead.relationship === 'Strategic') score += 15;
  if (['Meeting Booked','Proposal Required','Proposal Sent','Negotiation','Converted'].includes(lead.status)) score += 15;
  if (salesLeadOverdue(lead)) score -= 15;
  if (!lead.lastContact) score -= 8;

  return Math.max(0, Math.min(100, score));
};

SalesOS.companyLikelihood = function(lead) {
  const base = {
    'Prospect': 8,
    'Researching': 12,
    'First Contact Due': 15,
    'Attempting Contact': 18,
    'Conversation Started': 30,
    'Meeting Booked': 48,
    'Proposal Required': 60,
    'Proposal Sent': 70,
    'Negotiation': 84,
    'Converted': 100
  }[lead.status] || 8;

  let likelihood = base;
  if (lead.decisionMaker) likelihood += 6;
  if (lead.relationship === 'Warm') likelihood += 4;
  if (lead.relationship === 'Hot') likelihood += 8;
  if (lead.relationship === 'Strategic') likelihood += 10;
  if (salesLeadOverdue(lead)) likelihood -= 12;
  if (!lead.nextFollowup && activeSalesLead(lead)) likelihood -= 8;
  if (!lead.lastContact) likelihood -= 5;

  return Math.max(0, Math.min(100, likelihood));
};

SalesOS.companyActivityStats = function(leadId) {
  const activities = SalesOS.activitiesFor(leadId);
  return {
    total: activities.length,
    calls: activities.filter(SalesOS.isCall).length,
    meetings: activities.filter(SalesOS.isMeeting).length,
    emails: activities.filter(activity => /email/i.test(String(activity.type || ''))).length,
    visits: activities.filter(activity => /visit/i.test(String(activity.type || ''))).length,
    proposals: activities.filter(activity => /proposal/i.test(`${activity.type || ''} ${activity.outcome || ''}`)).length,
    positive: activities.filter(SalesOS.isPositive).length
  };
};

SalesOS.companyRecommendation = function(lead) {
  const days = SalesOS.daysSince(lead.lastContact);

  if (!lead.contactName) return 'Research and identify the person responsible for meetings, events or accommodation.';
  if (!lead.decisionMaker) return 'Confirm whether the current contact can approve a venue or identify the final decision maker.';
  if (salesLeadOverdue(lead)) return 'Recover the overdue follow-up today before the relationship weakens further.';
  if (lead.status === 'Proposal Sent') return 'Book a decision call and ask what is preventing approval.';
  if (lead.status === 'Negotiation') return 'Resolve the final objection and ask for the booking or deposit.';
  if (lead.status === 'Meeting Booked') return 'Prepare discovery questions and confirm the exact outcome required from the meeting.';
  if (days !== null && days >= 30) return 'Re-engage with a relevant offer, seasonal reason or venue invitation.';
  if (lead.relationship === 'Cold') return 'Move from general contact to a clear business need and secure a low-risk first meeting.';
  return salesLeadNextBestAction(lead);
};

SalesOS.companyCard = function(lead) {
  const health = SalesOS.companyHealth(lead);
  const likelihood = SalesOS.companyLikelihood(lead);
  const stats = SalesOS.companyActivityStats(lead.id);
  const services = String(lead.servicesNeeded || '').split(',').map(item => item.trim()).filter(Boolean);

  return `<article class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <div class="flex gap-2 flex-wrap items-center">
          <h3 class="text-xl font-bold">${esc(lead.companyName)}</h3>
          <span class="badge ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span>
          <span class="badge ${salesLeadRelationshipColor(lead.relationship)}">${esc(lead.relationship)}</span>
        </div>
        <p class="text-sm text-gray-500 mt-1">${esc(lead.contactName || 'Decision maker missing')} · ${esc(lead.businessType || 'Sector missing')} · ${esc(lead.postcode || 'Area missing')}</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button onclick="SalesOS.openLiveCall('${lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-sm font-semibold">Guided Call</button>
        <button onclick="viewSalesLead('${lead.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold">Open Record</button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5">
      <div class="rounded-xl bg-olive-50 p-4">
        <p class="text-xs text-gray-500">Commercial Health</p>
        <p class="text-2xl font-bold mt-1">${health}%</p>
      </div>
      <div class="rounded-xl bg-blue-50 p-4">
        <p class="text-xs text-gray-500">Likelihood</p>
        <p class="text-2xl font-bold mt-1">${likelihood}%</p>
      </div>
      <div class="rounded-xl bg-gold-50 p-4">
        <p class="text-xs text-gray-500">Potential</p>
        <p class="text-2xl font-bold mt-1">${SalesOS.money(lead.potentialValue)}</p>
      </div>
      <div class="rounded-xl bg-green-50 p-4">
        <p class="text-xs text-gray-500">Annual Potential</p>
        <p class="text-2xl font-bold mt-1">${SalesOS.money(lead.annualPotential)}</p>
      </div>
    </div>

    <div class="px-5 pb-5 grid lg:grid-cols-[1.2fr_.8fr] gap-4">
      <div class="rounded-xl border border-gray-200 p-4">
        <p class="text-xs font-bold tracking-widest text-olive-600">NEXT BEST ACTION</p>
        <p class="font-semibold mt-2">${esc(SalesOS.companyRecommendation(lead))}</p>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg bg-gray-50 p-3"><p class="text-[10px] text-gray-500">Calls</p><p class="font-bold">${stats.calls}</p></div>
        <div class="rounded-lg bg-gray-50 p-3"><p class="text-[10px] text-gray-500">Meetings</p><p class="font-bold">${stats.meetings}</p></div>
        <div class="rounded-lg bg-gray-50 p-3"><p class="text-[10px] text-gray-500">Proposals</p><p class="font-bold">${stats.proposals}</p></div>
      </div>
    </div>

    ${services.length ? `<div class="px-5 pb-5 flex flex-wrap gap-2">${services.map(item => `<span class="px-3 py-1.5 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold">${esc(item)}</span>`).join('')}</div>` : ''}
  </article>`;
};

SalesOS.renderCompanyIntelligence = function() {
  const leads = (DB.salesLeads || [])
    .filter(activeSalesLead)
    .sort((a, b) => SalesOS.companyHealth(b) - SalesOS.companyHealth(a));

  const averageHealth = leads.length
    ? Math.round(leads.reduce((sum, lead) => sum + SalesOS.companyHealth(lead), 0) / leads.length)
    : 0;

  return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
    ${SalesOS.kpi('Active Accounts', leads.length, 'Prospects currently in play', 'building-2')}
    ${SalesOS.kpi('Average Health', `${averageHealth}%`, 'Quality and control of active account data', 'heart-pulse', averageHealth >= 70 ? 'green' : 'gold')}
    ${SalesOS.kpi('Decision Makers Known', leads.filter(lead => lead.decisionMaker).length, 'Accounts with confirmed authority', 'user-check', 'blue')}
    ${SalesOS.kpi('High Likelihood', leads.filter(lead => SalesOS.companyLikelihood(lead) >= 65).length, 'Accounts with 65%+ estimated likelihood', 'flame', 'purple')}
  </div>
  <div class="space-y-4">${leads.map(SalesOS.companyCard).join('') || '<div class="bg-white rounded-2xl border p-8 text-center text-gray-400">No active prospects available.</div>'}</div>`;
};
