
// ============================================================================
// SALES OS PHASE 3 — SALES COACH
// ============================================================================

SalesOS.coachMessages = function() {
  const leads = (DB.salesLeads || []).filter(activeSalesLead);
  const messages = [];

  leads.forEach(lead => {
    const stats = SalesOS.companyActivityStats(lead.id);
    const days = SalesOS.daysSince(lead.lastContact);

    if (stats.calls >= 2 && stats.meetings === 0) {
      messages.push({
        tone: 'amber',
        title: `${lead.companyName}: calls are not creating meetings`,
        detail: 'Change the objective. Invite them for coffee, a venue tour or a discounted first meeting instead of making another general sales call.',
        lead
      });
    }

    if (days !== null && days >= 21) {
      messages.push({
        tone: 'red',
        title: `${lead.companyName}: no contact for ${days} days`,
        detail: 'The relationship is cooling. Re-engage with a relevant seasonal reason or low-risk first event.',
        lead
      });
    }

    if (!lead.contactName || !lead.decisionMaker) {
      messages.push({
        tone: 'blue',
        title: `${lead.companyName}: authority is unclear`,
        detail: 'Research the organiser and confirm who can approve meetings, events or accommodation.',
        lead
      });
    }

    if (lead.status === 'Proposal Sent') {
      messages.push({
        tone: 'purple',
        title: `${lead.companyName}: proposal requires a decision date`,
        detail: 'Do not send another generic follow-up. Ask what is preventing approval and agree when a decision will be made.',
        lead
      });
    }

    if (lead.relationship === 'Hot' && !lead.nextFollowup) {
      messages.push({
        tone: 'red',
        title: `${lead.companyName}: hot prospect has no next action`,
        detail: 'Set a dated action immediately so momentum is not lost.',
        lead
      });
    }
  });

  return messages.sort((a, b) => SalesOS.priority(b.lead) - SalesOS.priority(a.lead));
};

SalesOS.renderCoach = function() {
  const messages = SalesOS.coachMessages();
  const tones = {
    red: 'border-red-200 bg-red-50 text-red-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900'
  };

  return `<div class="bg-gradient-to-r from-charcoal-900 to-purple-900 text-white rounded-2xl p-5 lg:p-7 mb-4">
    <p class="text-xs font-bold tracking-widest text-purple-200">SALES COACH</p>
    <h2 class="text-2xl lg:text-4xl font-bold mt-1">Turn activity into better commercial decisions.</h2>
    <p class="text-sm text-white/70 mt-2">The coach looks for stalled accounts, weak follow-up, missing authority and poor progression.</p>
  </div>

  <div class="grid lg:grid-cols-3 gap-4 mb-4">
    ${SalesOS.kpi('Coaching Actions', messages.length, 'Current recommendations generated from live CRM data', 'sparkles', messages.length ? 'gold' : 'green')}
    ${SalesOS.kpi('Stalled Accounts', messages.filter(item => /no contact|not creating meetings/i.test(item.title)).length, 'Accounts requiring a different approach', 'pause-circle', 'red')}
    ${SalesOS.kpi('Authority Missing', messages.filter(item => /authority is unclear/i.test(item.title)).length, 'Accounts without a confirmed decision maker', 'user-search', 'blue')}
  </div>

  <div class="space-y-3">
    ${messages.length ? messages.map(item => `<article class="rounded-2xl border p-5 ${tones[item.tone]}">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p class="font-bold text-lg">${esc(item.title)}</p>
          <p class="text-sm mt-2 opacity-85">${esc(item.detail)}</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button onclick="SalesOS.openLiveCall('${item.lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-sm font-semibold">Work Account</button>
          <button onclick="viewSalesLead('${item.lead.id}')" class="px-3 py-2 bg-white/70 rounded-lg text-sm font-semibold">Open Record</button>
        </div>
      </div>
    </article>`).join('') : '<div class="rounded-2xl border border-green-200 bg-green-50 p-8 text-center text-green-800">No immediate coaching risks found.</div>'}
  </div>`;
};
