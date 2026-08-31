
// ============================================================================
// WINDMILL SALES INTELLIGENCE CENTRE
// A daily commercial action board built from live Sales OS data.
// ============================================================================

SalesOS.intelligenceSeasonalOpportunity = function(lead) {
  const month = new Date().getMonth() + 1;
  const services = String(lead.servicesNeeded || '').toLowerCase();
  const sector = String(lead.businessType || '').toLowerCase();

  if (month >= 8 && month <= 11) return 'Christmas parties, team meals and year-end events';
  if (month === 1 || month === 2) return 'Annual meetings, kick-offs, training and budget planning';
  if (month >= 3 && month <= 5) return 'Training days, recruitment, awards and summer-event planning';
  if (month >= 6 && month <= 7) return 'Summer socials, networking, staff events and accommodation';

  if (/wedding/.test(services)) return 'Wedding supplier collaboration';
  if (/education/.test(sector)) return 'INSET days, awards and staff celebrations';
  return 'Meetings, training, events and accommodation';
};

SalesOS.intelligenceExpectedClose = function(lead) {
  const base = new Date();
  const days = {
    'Prospect': 60,
    'Researching': 50,
    'First Contact Due': 45,
    'Attempting Contact': 40,
    'Conversation Started': 30,
    'Meeting Booked': 21,
    'Proposal Required': 14,
    'Proposal Sent': 10,
    'Negotiation': 7
  }[lead.status] || 45;

  base.setDate(base.getDate() + days);
  return base.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

SalesOS.intelligenceLossRisk = function(lead) {
  let risk = 0;
  const days = SalesOS.daysSince(lead.lastContact);

  if (salesLeadOverdue(lead)) risk += 35;
  if (!lead.nextFollowup && activeSalesLead(lead)) risk += 25;
  if (days !== null && days >= 21) risk += 20;
  if (days !== null && days >= 45) risk += 20;
  if (lead.status === 'Proposal Sent') risk += 10;
  if (!lead.contactName || !lead.decisionMaker) risk += 10;

  return Math.min(100, risk);
};

SalesOS.intelligencePriorityRows = function() {
  return (DB.salesLeads || [])
    .filter(activeSalesLead)
    .map(lead => {
      const likelihood = SalesOS.companyLikelihood ? SalesOS.companyLikelihood(lead) : Math.min(100, SalesOS.priority(lead));
      const risk = SalesOS.intelligenceLossRisk(lead);
      const value = Number(lead.potentialValue || 0);
      const annual = Number(lead.annualPotential || 0);
      const score = SalesOS.priority(lead) + Math.round(value / 1000) + Math.round(annual / 5000) + Math.round(risk / 4);

      return {
        lead,
        likelihood,
        risk,
        value,
        annual,
        score,
        expectedClose: SalesOS.intelligenceExpectedClose(lead),
        seasonal: SalesOS.intelligenceSeasonalOpportunity(lead),
        recommendation: SalesOS.companyRecommendation
          ? SalesOS.companyRecommendation(lead)
          : SalesOS.priorityReason(lead)
      };
    })
    .sort((a, b) => b.score - a.score);
};

SalesOS.intelligenceNearby = function(row) {
  const postcode = String(row.lead.postcode || '').toUpperCase().replace(/\s+/g, '');
  if (!postcode) return [];

  const area = postcode.slice(0, Math.max(2, postcode.length - 3));
  return SalesOS.intelligencePriorityRows()
    .filter(other => other.lead.id !== row.lead.id)
    .filter(other => String(other.lead.postcode || '').toUpperCase().replace(/\s+/g, '').startsWith(area))
    .slice(0, 3);
};

SalesOS.intelligenceRevenueAtRisk = function(rows) {
  return rows
    .filter(row => row.risk >= 50)
    .reduce((sum, row) => sum + row.value, 0);
};

SalesOS.intelligenceMission = function(rows) {
  const top = rows.slice(0, 20);
  const calls = top.filter(row => !['Meeting Booked','Proposal Sent','Negotiation'].includes(row.lead.status)).length;
  const meetings = top.filter(row => row.lead.status === 'Meeting Booked').length;
  const proposals = top.filter(row => ['Proposal Required','Proposal Sent'].includes(row.lead.status)).length;
  const visits = top.filter(row => !row.lead.lastContact || SalesOS.daysSince(row.lead.lastContact) >= 30).length;
  const value = top.reduce((sum, row) => sum + row.value, 0);

  return { calls, meetings, proposals, visits, value };
};

SalesOS.renderIntelligence = function() {
  const rows = SalesOS.intelligencePriorityRows();
  const mission = SalesOS.intelligenceMission(rows);
  const revenueAtRisk = SalesOS.intelligenceRevenueAtRisk(rows);
  const overdue = rows.filter(row => salesLeadOverdue(row.lead)).length;
  const noNextAction = rows.filter(row => !row.lead.nextFollowup || !row.lead.nextAction).length;
  const highLikelihood = rows.filter(row => row.likelihood >= 65).length;

  return `<div class="bg-gradient-to-r from-charcoal-900 via-olive-900 to-blue-900 text-white rounded-2xl p-4 lg:p-6 mb-4">
    <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-blue-200">SALES INTELLIGENCE CENTRE</p>
        <h2 class="text-xl lg:text-3xl font-bold mt-1">One screen for today’s best commercial actions.</h2>
        <p class="text-sm text-white/70 mt-2 max-w-4xl">Ranked using value, likelihood, stage, overdue risk, relationship strength and account control.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button onclick="SalesOS.setView('calls')" class="px-4 py-2.5 bg-gold-500 text-white rounded-lg font-semibold">Start Calls</button>
        <button onclick="SalesOS.setView('territory')" class="px-4 py-2.5 bg-white text-charcoal-900 rounded-lg font-semibold">Plan Visits</button>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">
    ${SalesOS.kpi('Priority Accounts', rows.length, 'Active proactive prospects', 'list-checks')}
    ${SalesOS.kpi('Top-20 Value', SalesOS.money(mission.value), 'Potential represented by today’s priority list', 'badge-pound-sterling', 'green')}
    ${SalesOS.kpi('Revenue at Risk', SalesOS.money(revenueAtRisk), 'Value attached to high-risk follow-up', 'alert-triangle', revenueAtRisk ? 'red' : 'green')}
    ${SalesOS.kpi('Overdue', overdue, 'Past-due actions', 'clock-alert', overdue ? 'red' : 'green')}
    ${SalesOS.kpi('No Next Action', noNextAction, 'Uncontrolled prospect records', 'circle-help', noNextAction ? 'gold' : 'green')}
    ${SalesOS.kpi('High Likelihood', highLikelihood, 'Accounts estimated at 65%+', 'flame', 'purple')}
    ${SalesOS.kpi('Calls Suggested', mission.calls, 'Priority calls from top 20', 'phone-call', 'blue')}
    ${SalesOS.kpi('Visits Suggested', mission.visits, 'Cold or long-inactive accounts', 'map-pin', 'gold')}
  </div>

  <div class="grid xl:grid-cols-[1fr_360px] gap-4 mb-4">
    ${SalesOS.panel('Today’s ranked action list', 'The strongest opportunities and risks, in working order',
      `<div class="space-y-3 max-h-[780px] overflow-y-auto pr-1">
        ${rows.slice(0, 20).map((row, index) => {
          const nearby = SalesOS.intelligenceNearby(row);
          return `<article class="rounded-2xl border ${row.risk >= 60 ? 'border-red-200 bg-red-50' : index < 5 ? 'border-gold-300 bg-gold-50' : 'border-gray-200 bg-white'} p-4">
            <div class="flex flex-col lg:flex-row lg:items-start gap-4">
              <span class="w-9 h-9 rounded-full ${index < 5 ? 'bg-gold-500 text-white' : 'bg-olive-100 text-olive-700'} flex items-center justify-center font-bold flex-shrink-0">${index + 1}</span>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <strong class="text-lg">${esc(row.lead.companyName)}</strong>
                  <span class="badge ${salesLeadStatusColor(row.lead.status)}">${esc(row.lead.status)}</span>
                  <span class="badge ${salesLeadRelationshipColor(row.lead.relationship)}">${esc(row.lead.relationship)}</span>
                  ${row.risk >= 60 ? '<span class="badge bg-red-100 text-red-700">High Risk</span>' : ''}
                </div>
                <p class="text-xs text-gray-500 mt-1">${esc(row.lead.contactName || 'Decision maker missing')} · ${esc(row.lead.businessType || 'Sector missing')} · ${esc(row.lead.postcode || 'Area missing')}</p>

                <div class="grid sm:grid-cols-2 xl:grid-cols-5 gap-2 mt-3">
                  <div class="rounded-lg bg-white/80 p-3"><p class="text-[10px] text-gray-500">Potential</p><p class="font-bold">${SalesOS.money(row.value)}</p></div>
                  <div class="rounded-lg bg-white/80 p-3"><p class="text-[10px] text-gray-500">Likelihood</p><p class="font-bold">${row.likelihood}%</p></div>
                  <div class="rounded-lg bg-white/80 p-3"><p class="text-[10px] text-gray-500">Risk</p><p class="font-bold">${row.risk}%</p></div>
                  <div class="rounded-lg bg-white/80 p-3"><p class="text-[10px] text-gray-500">Expected Close</p><p class="font-bold text-sm">${esc(row.expectedClose)}</p></div>
                  <div class="rounded-lg bg-white/80 p-3"><p class="text-[10px] text-gray-500">Seasonal Angle</p><p class="font-bold text-xs">${esc(row.seasonal)}</p></div>
                </div>

                <div class="rounded-xl bg-charcoal-900 text-white p-3 mt-3">
                  <p class="text-[10px] font-bold tracking-widest text-olive-200">RECOMMENDED NEXT MOVE</p>
                  <p class="text-sm mt-1">${esc(row.recommendation)}</p>
                </div>

                ${nearby.length ? `<div class="mt-3">
                  <p class="text-[10px] font-bold tracking-widest text-gray-500">NEARBY / SAME POSTCODE AREA</p>
                  <div class="flex flex-wrap gap-2 mt-2">${nearby.map(item => `<button onclick="SalesOS.openLiveCall('${item.lead.id}')" class="px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">${esc(item.lead.companyName)}</button>`).join('')}</div>
                </div>` : ''}
              </div>
              <div class="flex lg:flex-col gap-2 flex-wrap flex-shrink-0">
                <button onclick="SalesOS.openLiveCall('${row.lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-semibold">Guided Call</button>
                <button onclick="openSalesActivityForm('${row.lead.id}')" class="px-3 py-2 bg-olive-700 text-white rounded-lg text-xs font-semibold">Log Outcome</button>
                <button onclick="viewSalesLead('${row.lead.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold">Record</button>
              </div>
            </div>
          </article>`;
        }).join('') || '<div class="p-8 text-center text-gray-400">Add active prospects to generate the intelligence list.</div>'}
      </div>`)}
    <div class="space-y-4">
      ${SalesOS.panel('Today’s commercial mission', 'Suggested workload from the top 20 accounts',
        `<div class="grid grid-cols-2 gap-2 text-center">
          <div class="rounded-xl bg-blue-50 p-4"><p class="text-xs text-gray-500">Calls</p><p class="text-2xl font-bold">${mission.calls}</p></div>
          <div class="rounded-xl bg-green-50 p-4"><p class="text-xs text-gray-500">Meetings</p><p class="text-2xl font-bold">${mission.meetings}</p></div>
          <div class="rounded-xl bg-gold-50 p-4"><p class="text-xs text-gray-500">Proposals</p><p class="text-2xl font-bold">${mission.proposals}</p></div>
          <div class="rounded-xl bg-purple-50 p-4"><p class="text-xs text-gray-500">Visits</p><p class="text-2xl font-bold">${mission.visits}</p></div>
        </div>
        <div class="rounded-xl bg-charcoal-900 text-white p-4 mt-3">
          <p class="text-xs text-olive-200">Potential represented</p>
          <p class="text-3xl font-bold mt-1">${SalesOS.money(mission.value)}</p>
        </div>`)}
      ${SalesOS.panel('Management warnings', 'Commercial controls that need correcting',
        `<div class="space-y-3">
          <div class="rounded-xl ${overdue ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border p-4"><div class="flex justify-between"><span class="text-sm">Overdue actions</span><strong>${overdue}</strong></div></div>
          <div class="rounded-xl ${noNextAction ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} border p-4"><div class="flex justify-between"><span class="text-sm">Records with no next action</span><strong>${noNextAction}</strong></div></div>
          <div class="rounded-xl ${revenueAtRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border p-4"><div class="flex justify-between"><span class="text-sm">Revenue at risk</span><strong>${SalesOS.money(revenueAtRisk)}</strong></div></div>
        </div>`)}
      ${SalesOS.panel('What this page does', 'The daily working standard',
        `<div class="space-y-3 text-sm">
          ${['Start with account 1 and work down in order.','Use the recommended next move rather than a generic call.','Record every outcome and set a dated next action.','Use nearby accounts to combine calls with business visits.','Review revenue at risk before adding more cold prospects.'].map(item => `<div class="flex gap-2"><i data-lucide="check-circle-2" class="text-green-600 flex-shrink-0" style="width:17px;height:17px"></i>${esc(item)}</div>`).join('')}
        </div>`)}
    </div>
  </div>`;
};
