
// ============================================================================
// WINDMILL FARM — REVENUE OPPORTUNITIES PIPELINE
// Tracks qualified revenue, forecasts income and tells the team what to do next.
// ============================================================================

let opportunityTablesReady = true;
let opportunityActiveView = 'pipeline';
let opportunityDisplayMode = 'board';

function opportunityToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function opportunityAddDays(dateString, days) {
  const date = new Date((dateString || opportunityToday()) + 'T12:00:00');
  date.setDate(date.getDate() + Number(days || 0));
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function opportunityFormatDate(value) {
  if (!value) return 'Not set';
  return new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function opportunityStages() {
  return [
    'Qualified',
    'Meeting Booked',
    'Proposal Required',
    'Proposal Sent',
    'Negotiation',
    'Verbal Agreement',
    'Deposit Required',
    'Won',
    'Lost',
    'On Hold'
  ];
}

function opportunityOpenStages() {
  return opportunityStages().filter(stage => !['Won', 'Lost'].includes(stage));
}

function opportunityTypes() {
  return [
    'Conference',
    'Corporate Meeting',
    'Christmas Party',
    'Private Event',
    'Networking Event',
    'Accommodation',
    'Private Dining',
    'Team Building',
    'Wedding Referral',
    'Funeral / Wake',
    'Other'
  ];
}

function opportunityStageColor(stage) {
  const map = {
    'Qualified': 'bg-indigo-100 text-indigo-800',
    'Meeting Booked': 'bg-purple-100 text-purple-800',
    'Proposal Required': 'bg-orange-100 text-orange-800',
    'Proposal Sent': 'bg-amber-100 text-amber-800',
    'Negotiation': 'bg-yellow-100 text-yellow-800',
    'Verbal Agreement': 'bg-cyan-100 text-cyan-800',
    'Deposit Required': 'bg-pink-100 text-pink-800',
    'Won': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800',
    'On Hold': 'bg-slate-100 text-slate-700'
  };
  return map[stage] || 'bg-gray-100 text-gray-700';
}

function opportunityProbabilityForStage(stage) {
  const map = {
    'Qualified': 25,
    'Meeting Booked': 40,
    'Proposal Required': 50,
    'Proposal Sent': 60,
    'Negotiation': 75,
    'Verbal Agreement': 90,
    'Deposit Required': 95,
    'Won': 100,
    'Lost': 0,
    'On Hold': 20
  };
  return map[stage] ?? 25;
}

function opportunityNextActionForStage(stage) {
  const map = {
    'Qualified': 'Book a meeting and fully qualify the requirement',
    'Meeting Booked': 'Prepare for the meeting and confirm attendance',
    'Proposal Required': 'Create and send the tailored proposal',
    'Proposal Sent': 'Follow up on the proposal',
    'Negotiation': 'Resolve objections and agree final terms',
    'Verbal Agreement': 'Send confirmation and request the deposit',
    'Deposit Required': 'Chase the deposit and secure the booking',
    'Won': null,
    'Lost': null,
    'On Hold': 'Review timing and agree when to recontact'
  };
  return map[stage] ?? 'Progress this revenue opportunity';
}

function opportunitySuggestedDays(stage) {
  const map = {
    'Qualified': 2,
    'Meeting Booked': 1,
    'Proposal Required': 1,
    'Proposal Sent': 3,
    'Negotiation': 2,
    'Verbal Agreement': 1,
    'Deposit Required': 2,
    'On Hold': 14
  };
  return map[stage] ?? 3;
}

function opportunityIsOpen(opportunity) {
  return !['Won', 'Lost'].includes(opportunity.stage);
}

function opportunityOverdue(opportunity) {
  return opportunityIsOpen(opportunity) &&
    opportunity.nextFollowup &&
    opportunity.nextFollowup < opportunityToday();
}

function opportunityDueToday(opportunity) {
  return opportunityIsOpen(opportunity) &&
    opportunity.nextFollowup === opportunityToday();
}

function opportunityAtRisk(opportunity) {
  if (!opportunityIsOpen(opportunity)) return false;
  if (opportunityOverdue(opportunity)) return true;
  if (!opportunity.nextFollowup) return true;
  if (opportunity.stage === 'Proposal Sent' && opportunity.lastActivity &&
      opportunityAddDays(opportunity.lastActivity, 7) < opportunityToday()) return true;
  return false;
}

function opportunityWeightedValue(opportunity) {
  return Math.round(Number(opportunity.value || 0) * Number(opportunity.probability || 0) / 100);
}

async function loadOpportunitiesFromSupabase() {
  const { data, error } = await supabaseClient
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Opportunities table is not ready:', error);
    opportunityTablesReady = false;
    DB.opportunities = [];
    DB.opportunityActivities = [];
    return;
  }

  opportunityTablesReady = true;
  DB.opportunities = (data || []).map(row => ({
    id: row.id,
    companyId: row.company_id,
    title: row.title || '',
    type: row.opportunity_type || 'Other',
    stage: row.stage || 'Qualified',
    value: Number(row.estimated_value || 0),
    probability: Number(row.probability ?? opportunityProbabilityForStage(row.stage || 'Qualified')),
    expectedClose: row.expected_close || '',
    eventDate: row.event_date || '',
    assignedTo: row.assigned_to || '',
    nextAction: row.next_action || '',
    nextFollowup: row.next_followup || '',
    proposalSentDate: row.proposal_sent_date || '',
    depositDueDate: row.deposit_due_date || '',
    competitor: row.competitor || '',
    lostReason: row.lost_reason || '',
    lostNotes: row.lost_notes || '',
    source: row.source || '',
    lastActivity: row.last_activity || '',
    wonDate: row.won_date || '',
    bookingReference: row.booking_reference || '',
    notes: row.notes || '',
    createdAt: row.created_at || ''
  }));

  if (!DB.opportunities.length) {
    DB.opportunityActivities = [];
    return;
  }

  const ids = DB.opportunities.map(item => item.id);
  const activityResult = await supabaseClient
    .from('opportunity_activities')
    .select('*')
    .in('opportunity_id', ids)
    .order('activity_date', { ascending: false });

  DB.opportunityActivities = activityResult.error ? [] : (activityResult.data || []).map(row => ({
    id: row.id,
    opportunityId: row.opportunity_id,
    type: row.activity_type || 'Follow-Up',
    date: row.activity_date || '',
    staff: row.staff || '',
    outcome: row.outcome || '',
    notes: row.notes || '',
    createdAt: row.created_at || ''
  }));
}

function renderOpportunities() {
  if (!opportunityTablesReady) {
    return `<div class="section-card max-w-3xl">
      <h3 class="font-bold text-charcoal-900">Opportunity setup required</h3>
      <p class="text-sm text-gray-600 mt-1">
        Run <strong>setup-revenue-opportunities-pipeline.sql</strong> in Supabase SQL Editor, then refresh.
      </p>
    </div>`;
  }

  const rows = DB.opportunities || [];
  const open = rows.filter(opportunityIsOpen);
  const won = rows.filter(item => item.stage === 'Won');
  const overdue = open.filter(opportunityOverdue);
  const atRisk = open.filter(opportunityAtRisk);
  const pipeline = open.reduce((sum, item) => sum + item.value, 0);
  const weighted = open.reduce((sum, item) => sum + opportunityWeightedValue(item), 0);
  const wonRevenue = won.reduce((sum, item) => sum + item.value, 0);

  if (window.innerWidth < 820 && opportunityDisplayMode === 'board') {
    opportunityDisplayMode = 'list';
  }

  setTimeout(() => {
    setOpportunityView(opportunityActiveView);
    setOpportunityDisplay(opportunityDisplayMode);
  }, 0);

  return `
    <div
      class="w-full min-w-0 overflow-x-hidden"
      style="max-width:calc(100vw - 245px);"
    >
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <div class="min-w-0">
          <p class="text-xs font-bold tracking-widest text-gold-600">REVENUE PIPELINE</p>
          <h2 class="text-xl font-bold text-charcoal-900">Opportunities</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage qualified revenue, next actions and expected bookings.
          </p>
        </div>

        <button onclick="openOpportunityForm()"
          class="px-4 py-2.5 bg-gold-500 text-white rounded-lg font-semibold whitespace-nowrap shadow-sm hover:bg-gold-600">
          + New Opportunity
        </button>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4 min-w-0">
        ${kpi('Open Deals', open.length, 'target', 'olive')}
        ${kpi('Pipeline', '£' + pipeline.toLocaleString(), 'trending-up', 'gold')}
        ${kpi('Weighted Forecast', '£' + weighted.toLocaleString(), 'calculator', 'teal')}
        ${kpi('Won Revenue', '£' + wonRevenue.toLocaleString(), 'badge-check', 'green')}
        ${kpi('Overdue', overdue.length, 'alert-triangle', 'red')}
        ${kpi('At Risk', atRisk.length, 'shield-alert', 'red')}
      </div>

      <div class="bg-charcoal-900 text-white rounded-xl p-4 mb-4">
        <p class="text-xs tracking-widest text-gold-400 font-bold">SALES CONTROL</p>
        <h3 class="text-base lg:text-lg font-bold mt-1">
          Every qualified opportunity needs a value, probability and next action.
        </h3>
      </div>

      <div class="section-card mb-4 min-w-0 overflow-hidden">
        <div class="flex flex-col gap-3 min-w-0">
          <div class="flex gap-2 overflow-x-auto pb-1 w-full">
            ${[
              ['pipeline', 'Open Pipeline'],
              ['today', 'Due Today'],
              ['overdue', 'Overdue'],
              ['risk', 'At Risk'],
              ['proposals', 'Proposals'],
              ['deposits', 'Deposits'],
              ['won', 'Won'],
              ['lost', 'Lost'],
              ['all', 'All']
            ].map(([view, label]) => `
              <button id="opportunity-view-${view}" onclick="setOpportunityView('${view}')"
                class="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 whitespace-nowrap flex-shrink-0">
                ${label}
              </button>
            `).join('')}
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_150px_180px_190px] gap-2 min-w-0">
            <input id="opportunity-search" oninput="filterOpportunities()"
              placeholder="Search opportunity, company, type or next action..."
              class="min-w-0 w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm">

            <select id="opportunity-owner" onchange="filterOpportunities()"
              class="min-w-0 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
              <option value="">All Team</option>
              ${activeStaff().map(staff => `<option>${esc(staff.name)}</option>`).join('')}
            </select>

            <select id="opportunity-type" onchange="filterOpportunities()"
              class="min-w-0 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
              <option value="">All Revenue Types</option>
              ${opportunityTypes().map(type => `<option>${type}</option>`).join('')}
            </select>

            <div class="flex rounded-lg bg-gray-100 p-1 min-w-0">
              <button id="opportunity-display-board" onclick="setOpportunityDisplay('board')"
                class="flex-1 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap">
                Board
              </button>
              <button id="opportunity-display-list" onclick="setOpportunityDisplay('list')"
                class="flex-1 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap">
                Action List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="opportunity-content"
        class="w-full min-w-0 overflow-hidden"
      ></div>
    </div>
  `;
}
function setOpportunityView(view) {
  opportunityActiveView = view || 'pipeline';
  if(window.AppRouter)AppRouter.commit(`/opportunities/${encodeURIComponent(opportunityActiveView)}`);
  document.querySelectorAll('[id^="opportunity-view-"]').forEach(button => {
    button.className = 'px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200';
  });
  const selected = document.getElementById(`opportunity-view-${opportunityActiveView}`);
  if (selected) selected.className = 'px-3 py-2 rounded-lg text-sm font-medium bg-olive-600 text-white border border-olive-600';
  filterOpportunities();
}

function setOpportunityDisplay(mode) {
  opportunityDisplayMode = mode || 'board';

  ['board', 'list'].forEach(value => {
    const button = document.getElementById(`opportunity-display-${value}`);
    if (!button) return;

    button.className = value === opportunityDisplayMode
      ? 'flex-1 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap bg-charcoal-900 text-white shadow-sm'
      : 'flex-1 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap text-gray-600';
  });

  filterOpportunities();
}

function opportunityFilteredRows() {
  const query = (document.getElementById('opportunity-search')?.value || '').toLowerCase();
  const owner = document.getElementById('opportunity-owner')?.value || '';
  const type = document.getElementById('opportunity-type')?.value || '';

  return (DB.opportunities || []).filter(opportunity => {
    const company = DB.companies.find(item => item.id === opportunity.companyId);
    const haystack = [
      opportunity.title,
      opportunity.type,
      company?.name,
      opportunity.nextAction,
      opportunity.competitor,
      opportunity.notes
    ].join(' ').toLowerCase();

    if (query && !haystack.includes(query)) return false;
    if (owner && opportunity.assignedTo !== owner) return false;
    if (type && opportunity.type !== type) return false;

    if (opportunityActiveView === 'pipeline' && !opportunityIsOpen(opportunity)) return false;
    if (opportunityActiveView === 'today' && !opportunityDueToday(opportunity)) return false;
    if (opportunityActiveView === 'overdue' && !opportunityOverdue(opportunity)) return false;
    if (opportunityActiveView === 'risk' && !opportunityAtRisk(opportunity)) return false;
    if (opportunityActiveView === 'proposals' && !['Proposal Required', 'Proposal Sent', 'Negotiation'].includes(opportunity.stage)) return false;
    if (opportunityActiveView === 'deposits' && !['Verbal Agreement', 'Deposit Required'].includes(opportunity.stage)) return false;
    if (opportunityActiveView === 'won' && opportunity.stage !== 'Won') return false;
    if (opportunityActiveView === 'lost' && opportunity.stage !== 'Lost') return false;

    return true;
  });
}

function filterOpportunities() {
  const rows = opportunityFilteredRows();
  const content = document.getElementById('opportunity-content');
  if (!content) return;

  if (opportunityDisplayMode === 'board' && ['pipeline', 'all'].includes(opportunityActiveView)) {
    content.innerHTML = renderOpportunityBoard(rows);
  } else {
    content.innerHTML = renderOpportunityList(rows);
  }

  lucide.createIcons();
}

function renderOpportunityBoard(rows) {
  const stages = opportunityActiveView === 'all'
    ? opportunityStages()
    : opportunityOpenStages();

  return `<div
    class="w-full max-w-full overflow-x-auto overscroll-x-contain pb-3"
    style="-webkit-overflow-scrolling:touch;max-width:100%;"
  >
    <div class="inline-flex gap-3 min-w-max pr-3">
      ${stages.map(stage => {
        const stageRows = rows.filter(item => item.stage === stage);
        const total = stageRows.reduce((sum, item) => sum + item.value, 0);
        return `<section class="w-64 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200">
          <div class="p-3 border-b border-gray-200 sticky top-0 bg-gray-50 rounded-t-xl">
            <div class="flex justify-between items-center gap-2">
              <span class="badge ${opportunityStageColor(stage)}">${stage}</span>
              <span class="text-xs font-semibold text-gray-600">${stageRows.length}</span>
            </div>
            <p class="text-sm font-bold text-charcoal-900 mt-2">£${total.toLocaleString()}</p>
          </div>
          <div class="p-2 space-y-2 min-h-24 max-h-[54vh] overflow-y-auto">
            ${stageRows.length ? stageRows
              .sort((a, b) => String(a.nextFollowup || '9999-12-31').localeCompare(String(b.nextFollowup || '9999-12-31')))
              .map(renderOpportunityBoardCard).join('') :
              '<p class="text-xs text-gray-400 text-center py-6">No opportunities</p>'}
          </div>
        </section>`;
      }).join('')}
    </div>
  </div>`;
}

function renderOpportunityBoardCard(opportunity) {
  const company = DB.companies.find(item => item.id === opportunity.companyId);
  return `<button onclick="viewOpportunity('${opportunity.id}')"
    class="w-full text-left bg-white rounded-lg border ${opportunityAtRisk(opportunity) ? 'border-red-200' : 'border-gray-100'} p-3 shadow-sm hover:shadow-md">
    <div class="flex justify-between gap-2">
      <p class="text-sm font-semibold text-charcoal-900">${esc(opportunity.title)}</p>
      ${opportunityAtRisk(opportunity) ? '<i data-lucide="alert-triangle" class="text-red-500 flex-shrink-0" style="width:15px;height:15px"></i>' : ''}
    </div>
    <p class="text-xs text-gray-500 mt-1">${esc(company?.name || 'Company missing')}</p>
    <div class="flex justify-between gap-2 mt-3">
      <span class="text-sm font-bold text-gold-600">£${opportunity.value.toLocaleString()}</span>
      <span class="text-xs text-gray-500">${opportunity.probability}%</span>
    </div>
    <p class="text-xs text-gray-600 mt-2 line-clamp-2">${esc(opportunity.nextAction || 'No next action')}</p>
    <p class="text-[11px] mt-2 ${opportunityOverdue(opportunity) ? 'text-red-700 font-semibold' : 'text-gray-500'}">
      ${opportunity.nextFollowup ? opportunityFormatDate(opportunity.nextFollowup) : 'No follow-up date'}
    </p>
  </button>`;
}

function renderOpportunityList(rows) {
  const sorted = [...rows].sort((a, b) => {
    const aRisk = opportunityAtRisk(a) ? 0 : 1;
    const bRisk = opportunityAtRisk(b) ? 0 : 1;
    if (aRisk !== bRisk) return aRisk - bRisk;
    return String(a.nextFollowup || '9999-12-31').localeCompare(String(b.nextFollowup || '9999-12-31'));
  });

  if (!sorted.length) {
    return '<div class="section-card text-center text-gray-400 py-10">No opportunities match this view.</div>';
  }

  return `<div class="space-y-2">${sorted.map(opportunity => {
    const company = DB.companies.find(item => item.id === opportunity.companyId);
    return `<div class="bg-white rounded-xl p-4 border ${opportunityAtRisk(opportunity) ? 'border-red-200' : 'border-olive-100'} shadow-sm">
      <div class="flex flex-col xl:flex-row xl:items-center gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-charcoal-900">${esc(opportunity.title)}</span>
            <span class="badge ${opportunityStageColor(opportunity.stage)}">${esc(opportunity.stage)}</span>
            ${opportunityOverdue(opportunity) ? '<span class="badge bg-red-100 text-red-700">Overdue</span>' : ''}
            ${opportunityDueToday(opportunity) ? '<span class="badge bg-amber-100 text-amber-800">Due today</span>' : ''}
            ${opportunityAtRisk(opportunity) && !opportunityOverdue(opportunity) ? '<span class="badge bg-red-50 text-red-700">At risk</span>' : ''}
          </div>

          <p class="text-xs text-gray-500 mt-1">
            ${esc(company?.name || 'Company missing')} · ${esc(opportunity.type)} · Owner: ${esc(opportunity.assignedTo || 'Unassigned')}
          </p>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3 text-xs">
            <div><span class="text-gray-500">Value</span><p class="font-bold text-gold-600">£${opportunity.value.toLocaleString()}</p></div>
            <div><span class="text-gray-500">Probability</span><p class="font-bold">${opportunity.probability}%</p></div>
            <div><span class="text-gray-500">Weighted</span><p class="font-bold">£${opportunityWeightedValue(opportunity).toLocaleString()}</p></div>
            <div><span class="text-gray-500">Expected Close</span><p class="font-bold">${opportunityFormatDate(opportunity.expectedClose)}</p></div>
          </div>

          ${opportunityIsOpen(opportunity) ? `<div class="mt-3 bg-cream-50 rounded-lg px-3 py-2">
            <p class="text-xs text-gray-500">Next action</p>
            <p class="text-sm font-semibold text-charcoal-900">${esc(opportunity.nextAction || opportunityNextActionForStage(opportunity.stage))}</p>
            <p class="text-xs mt-1 ${opportunityOverdue(opportunity) ? 'text-red-700 font-semibold' : 'text-gray-500'}">
              Due ${opportunityFormatDate(opportunity.nextFollowup)}
            </p>
          </div>` : ''}
        </div>

        <div class="flex xl:flex-col gap-2 flex-wrap">
          ${opportunityIsOpen(opportunity) ? `<button onclick="openOpportunityActivityForm('${opportunity.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-xs font-medium">Complete Next Action</button>` : ''}
          <button onclick="viewOpportunity('${opportunity.id}')" class="px-3 py-2 bg-olive-50 text-olive-700 rounded-lg text-xs font-medium">Open Full Opportunity</button>
          <button onclick="openOpportunityForm('${opportunity.id}')" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">Edit</button>
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function openOpportunityForm(id, companyId = '') {
  const opportunity = id ? DB.opportunities.find(item => item.id === id) : null;
  const selectedCompany = opportunity?.companyId || companyId;

  if (!DB.companies.length) {
    toast('Create or convert a company before adding an opportunity', 'error');
    return;
  }

  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">REVENUE OPPORTUNITY</p>
        <h2 class="text-lg font-bold">${id ? 'Edit' : 'New'} Opportunity</h2>
      </div>
      <button onclick="closeModal()"><i data-lucide="x" style="width:20px;height:20px"></i></button>
    </div>

    <form onsubmit="saveOpportunity(event,'${id || ''}')" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="sm:col-span-2">
          <label class="text-xs font-medium text-gray-600">Company *</label>
          <select name="companyId" required class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Select company</option>
            ${DB.companies.filter(company => company.active || company.id === selectedCompany)
              .map(company => `<option value="${company.id}" ${company.id === selectedCompany ? 'selected' : ''}>${esc(company.name)}</option>`).join('')}
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="text-xs font-medium text-gray-600">Opportunity Name *</label>
          <input name="title" required value="${esc(opportunity?.title || '')}"
            placeholder="Example: Lincoln College Christmas Party 2027"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Revenue Type</label>
          <select name="type" class="w-full px-3 py-2 border rounded-lg text-sm">
            ${opportunityTypes().map(type => `<option ${opportunity?.type === type ? 'selected' : ''}>${type}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Stage</label>
          <select name="stage" onchange="opportunityAutofillStage(this.form,this.value)"
            class="w-full px-3 py-2 border rounded-lg text-sm">
            ${opportunityStages().map(stage => `<option ${opportunity?.stage === stage ? 'selected' : ''}>${stage}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Estimated Value (£)</label>
          <input name="value" type="number" min="0" value="${opportunity?.value || ''}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Probability %</label>
          <input name="probability" type="number" min="0" max="100"
            value="${opportunity?.probability ?? 25}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Expected Close</label>
          <input name="expectedClose" type="date" value="${opportunity?.expectedClose || opportunityAddDays(opportunityToday(), 14)}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Event Date</label>
          <input name="eventDate" type="date" value="${opportunity?.eventDate || ''}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Assigned To</label>
          <select name="assignedTo" class="w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(opportunity?.assignedTo || '')}</select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Lead Source</label>
          <select name="source" class="w-full px-3 py-2 border rounded-lg text-sm">
            ${['Proactive Sales','Existing Company','Networking','Referral','Inbound Enquiry','Repeat Customer','Other']
              .map(source => `<option ${opportunity?.source === source ? 'selected' : ''}>${source}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Next Follow-Up</label>
          <input name="nextFollowup" type="date"
            value="${opportunity?.nextFollowup || opportunityAddDays(opportunityToday(), 2)}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Deposit Due Date</label>
          <input name="depositDueDate" type="date" value="${opportunity?.depositDueDate || ''}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Next Action</label>
        <input name="nextAction" value="${esc(opportunity?.nextAction || 'Book a meeting and fully qualify the requirement')}"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Competitor / Other Venue</label>
        <input name="competitor" value="${esc(opportunity?.competitor || '')}"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Notes</label>
        <textarea name="notes" rows="3" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(opportunity?.notes || '')}</textarea>
      </div>

      <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">
        Save Opportunity
      </button>
    </form>
  </div>`);
}

function opportunityAutofillStage(form, stage) {
  if (!form) return;
  form.probability.value = opportunityProbabilityForStage(stage);

  if (!['Won', 'Lost'].includes(stage)) {
    form.nextAction.value = opportunityNextActionForStage(stage) || '';
    form.nextFollowup.value = opportunityAddDays(opportunityToday(), opportunitySuggestedDays(stage));
  } else {
    form.nextAction.value = '';
    form.nextFollowup.value = '';
  }
}

async function saveOpportunity(event, id) {
  event.preventDefault();

  const form = new FormData(event.target);
  const stage = form.get('stage') || 'Qualified';

  if (stage === 'Lost') {
    openOpportunityLostForm(id, Object.fromEntries(form.entries()));
    return;
  }

  if (stage === 'Won') {
    openOpportunityWonForm(id, Object.fromEntries(form.entries()));
    return;
  }

  const record = {
    company_id: form.get('companyId'),
    title: form.get('title'),
    opportunity_type: form.get('type'),
    stage,
    estimated_value: Number(form.get('value')) || 0,
    probability: Number(form.get('probability')) || opportunityProbabilityForStage(stage),
    expected_close: form.get('expectedClose') || null,
    event_date: form.get('eventDate') || null,
    assigned_to: form.get('assignedTo') || null,
    next_action: form.get('nextAction') || opportunityNextActionForStage(stage),
    next_followup: form.get('nextFollowup') || opportunityAddDays(opportunityToday(), opportunitySuggestedDays(stage)),
    deposit_due_date: form.get('depositDueDate') || null,
    competitor: form.get('competitor') || null,
    source: form.get('source') || null,
    notes: form.get('notes') || null
  };

  if (stage === 'Proposal Sent' && !id) record.proposal_sent_date = opportunityToday();

  const query = id
    ? supabaseClient.from('opportunities').update(record).eq('id', id)
    : supabaseClient.from('opportunities').insert(record);

  const { error } = await query;
  if (error) {
    console.error(error);
    toast('Opportunity could not be saved', 'error');
    return;
  }

  closeModal();
  await loadOpportunitiesFromSupabase();
  renderSection();
  toast(id ? 'Opportunity updated' : 'Opportunity created');
}

function viewOpportunity(id) {
  const opportunity = DB.opportunities.find(item => item.id === id);
  if (!opportunity) return;

  const company = DB.companies.find(item => item.id === opportunity.companyId);
  const activities = (DB.opportunityActivities || [])
    .filter(item => item.opportunityId === id)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  openModal(`<div class="p-6">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">REVENUE OPPORTUNITY</p>
        <h2 class="text-xl font-bold">${esc(opportunity.title)}</h2>
        <button onclick="closeModal();navigate('companies');setTimeout(()=>viewCompany('${opportunity.companyId}'),80)"
          class="text-sm text-olive-700 mt-1">
          ${esc(company?.name || 'Company missing')}
        </button>
      </div>
      <button onclick="closeModal()"><i data-lucide="x" style="width:20px;height:20px"></i></button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Stage</p>
        <span class="badge mt-1 ${opportunityStageColor(opportunity.stage)}">${esc(opportunity.stage)}</span>
      </div>
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Value</p>
        <p class="font-bold text-gold-600">£${opportunity.value.toLocaleString()}</p>
      </div>
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Probability</p>
        <p class="font-bold">${opportunity.probability}%</p>
      </div>
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Weighted Forecast</p>
        <p class="font-bold">£${opportunityWeightedValue(opportunity).toLocaleString()}</p>
      </div>
    </div>

    ${opportunityIsOpen(opportunity) ? `<div class="rounded-xl border ${opportunityAtRisk(opportunity) ? 'border-red-200 bg-red-50' : 'border-olive-200 bg-olive-50'} p-4 mb-4">
      <p class="text-xs uppercase tracking-wide text-gray-500">Next revenue action</p>
      <p class="font-bold text-charcoal-900 mt-1">${esc(opportunity.nextAction || opportunityNextActionForStage(opportunity.stage))}</p>
      <p class="text-xs mt-2 ${opportunityOverdue(opportunity) ? 'text-red-700 font-semibold' : 'text-gray-600'}">
        Due ${opportunityFormatDate(opportunity.nextFollowup)}
      </p>
    </div>` : ''}

    <div class="grid sm:grid-cols-2 gap-3 text-sm mb-4">
      <p><span class="text-gray-500">Type:</span> ${esc(opportunity.type)}</p>
      <p><span class="text-gray-500">Owner:</span> ${esc(opportunity.assignedTo || 'Unassigned')}</p>
      <p><span class="text-gray-500">Expected close:</span> ${opportunityFormatDate(opportunity.expectedClose)}</p>
      <p><span class="text-gray-500">Event date:</span> ${opportunityFormatDate(opportunity.eventDate)}</p>
      <p><span class="text-gray-500">Proposal sent:</span> ${opportunityFormatDate(opportunity.proposalSentDate)}</p>
      <p><span class="text-gray-500">Deposit due:</span> ${opportunityFormatDate(opportunity.depositDueDate)}</p>
      <p><span class="text-gray-500">Source:</span> ${esc(opportunity.source || '—')}</p>
      <p><span class="text-gray-500">Competitor:</span> ${esc(opportunity.competitor || '—')}</p>
    </div>

    ${opportunity.stage === 'Lost' ? `<div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm">
      <strong>Lost reason:</strong> ${esc(opportunity.lostReason || 'Other')}
      ${opportunity.lostNotes ? `<p class="mt-1 text-gray-700">${esc(opportunity.lostNotes)}</p>` : ''}
    </div>` : ''}

    ${opportunity.notes ? `<div class="mb-4">
      <p class="text-xs text-gray-500">Opportunity notes</p>
      <p class="text-sm">${esc(opportunity.notes)}</p>
    </div>` : ''}

    <div class="flex gap-2 flex-wrap mb-5">
      ${opportunityIsOpen(opportunity) ? `<button onclick="openOpportunityActivityForm('${id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">Complete Next Action</button>` : ''}
      <button onclick="openOpportunityForm('${id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Edit Opportunity</button>
      ${opportunityIsOpen(opportunity) ? `<button onclick="openOpportunityWonForm('${id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">Mark Won</button>
      <button onclick="openOpportunityLostForm('${id}')" class="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">Mark Lost</button>` : ''}
    </div>

    <h3 class="font-bold mb-2">Opportunity Timeline</h3>
    <div class="space-y-2 max-h-72 overflow-y-auto">
      ${activities.length ? activities.map(activity => `<div class="p-3 border border-gray-100 rounded-lg">
        <div class="flex justify-between gap-2">
          <p class="text-sm font-semibold">${esc(activity.type)} · ${esc(activity.outcome || '')}</p>
          <span class="text-xs text-gray-500">${opportunityFormatDate(activity.date)}</span>
        </div>
        <p class="text-xs text-gray-500">${esc(activity.staff || 'Unassigned')}</p>
        ${activity.notes ? `<p class="text-sm mt-2">${esc(activity.notes)}</p>` : ''}
      </div>`).join('') : '<p class="text-sm text-gray-400">No opportunity activity logged yet.</p>'}
    </div>
  </div>`);
}

function openOpportunityActivityForm(id) {
  const opportunity = DB.opportunities.find(item => item.id === id);
  if (!opportunity) return;

  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">${esc(opportunity.title)}</p>
        <h2 class="text-lg font-bold">Complete Opportunity Action</h2>
      </div>
      <button onclick="viewOpportunity('${id}')"><i data-lucide="x" style="width:20px;height:20px"></i></button>
    </div>

    <form onsubmit="saveOpportunityActivity(event,'${id}')" class="space-y-4">
      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium text-gray-600">Activity *</label>
          <select name="type" required class="w-full px-3 py-2 border rounded-lg text-sm">
            ${['Call','Email','Meeting','Proposal','Site Visit','Negotiation','Deposit Chase','Other'].map(type => `<option>${type}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Outcome *</label>
          <select name="outcome" required onchange="opportunityOutcomeAutofill(this.form,this.value)"
            class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Select outcome</option>
            <option>Meeting Booked</option>
            <option>Proposal Required</option>
            <option>Proposal Sent</option>
            <option>Follow-Up Required</option>
            <option>Negotiating</option>
            <option>Verbal Agreement</option>
            <option>Deposit Requested</option>
            <option>Deposit Received</option>
            <option>Customer Delayed</option>
            <option>No Response</option>
            <option>Lost</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Activity Date</label>
          <input type="date" name="date" value="${opportunityToday()}" required
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Staff</label>
          <select name="staff" class="w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(opportunity.assignedTo || '', false)}</select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Move to Stage</label>
          <select name="stage" class="w-full px-3 py-2 border rounded-lg text-sm">
            ${opportunityStages().map(stage => `<option ${opportunity.stage === stage ? 'selected' : ''}>${stage}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Probability %</label>
          <input type="number" min="0" max="100" name="probability" value="${opportunity.probability}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Next Follow-Up</label>
          <input type="date" name="nextFollowup" value="${opportunity.nextFollowup || opportunityAddDays(opportunityToday(), 2)}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Expected Close</label>
          <input type="date" name="expectedClose" value="${opportunity.expectedClose || ''}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Next Action</label>
        <input name="nextAction" value="${esc(opportunity.nextAction || '')}"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Notes *</label>
        <textarea name="notes" required rows="4"
          placeholder="What happened, objections, buying signals and what was agreed?"
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">
        Save Outcome & Update Pipeline
      </button>
    </form>
  </div>`);
}

function opportunityOutcomeAutofill(form, outcome) {
  const map = {
    'Meeting Booked': 'Meeting Booked',
    'Proposal Required': 'Proposal Required',
    'Proposal Sent': 'Proposal Sent',
    'Follow-Up Required': form.stage.value,
    'Negotiating': 'Negotiation',
    'Verbal Agreement': 'Verbal Agreement',
    'Deposit Requested': 'Deposit Required',
    'Deposit Received': 'Won',
    'Customer Delayed': 'On Hold',
    'No Response': form.stage.value,
    'Lost': 'Lost',
    'Other': form.stage.value
  };

  const stage = map[outcome] || form.stage.value;
  form.stage.value = stage;
  form.probability.value = opportunityProbabilityForStage(stage);
  form.nextAction.value = opportunityNextActionForStage(stage) || '';
  form.nextFollowup.value = ['Won', 'Lost'].includes(stage)
    ? ''
    : opportunityAddDays(opportunityToday(), opportunitySuggestedDays(stage));
}

async function saveOpportunityActivity(event, id) {
  event.preventDefault();

  const opportunity = DB.opportunities.find(item => item.id === id);
  if (!opportunity) return;

  const form = new FormData(event.target);
  const outcome = form.get('outcome');
  const stage = form.get('stage');

  if (outcome === 'Lost' || stage === 'Lost') {
    openOpportunityLostForm(id, null, {
      activityType: form.get('type'),
      activityDate: form.get('date'),
      staff: form.get('staff'),
      notes: form.get('notes')
    });
    return;
  }

  if (outcome === 'Deposit Received' || stage === 'Won') {
    openOpportunityWonForm(id, null, {
      activityType: form.get('type'),
      activityDate: form.get('date'),
      staff: form.get('staff'),
      notes: form.get('notes')
    });
    return;
  }

  const activity = {
    opportunity_id: id,
    activity_type: form.get('type'),
    activity_date: form.get('date'),
    staff: form.get('staff') || null,
    outcome,
    notes: form.get('notes')
  };

  const { error } = await supabaseClient.from('opportunity_activities').insert(activity);
  if (error) {
    console.error(error);
    toast('Opportunity activity could not be saved', 'error');
    return;
  }

  const update = {
    stage,
    probability: Number(form.get('probability')) || opportunityProbabilityForStage(stage),
    next_followup: form.get('nextFollowup') || opportunityAddDays(opportunityToday(), opportunitySuggestedDays(stage)),
    next_action: form.get('nextAction') || opportunityNextActionForStage(stage),
    expected_close: form.get('expectedClose') || null,
    last_activity: form.get('date')
  };

  if (outcome === 'Proposal Sent') update.proposal_sent_date = form.get('date');
  if (outcome === 'Deposit Requested') update.deposit_due_date = opportunityAddDays(form.get('date'), 7);

  const opportunityUpdateResult=await supabaseClient.from('opportunities').update(update).eq('id', id);
  if(opportunityUpdateResult.error){
    console.error('Opportunity next-action update failed',opportunityUpdateResult.error);
    toast(`Activity logged, but Opportunity stage/next action was NOT updated. Re-open and retry${opportunityUpdateResult.error.message?`: ${opportunityUpdateResult.error.message}`:''}`,'error');
    await loadOpportunitiesFromSupabase().catch(()=>{});
    try{viewOpportunity(id);}catch(_){}
    return;
  }
  await loadOpportunitiesFromSupabase();
  viewOpportunity(id);
  toast('Opportunity updated and next action scheduled');
}


function opportunityEncodeHiddenJson(value){
  if(!value)return '';
  try{return encodeURIComponent(JSON.stringify(value));}catch(e){console.error('Opportunity hidden JSON encode failed',e);return '';}
}
function opportunityDecodeHiddenJson(value){
  const raw=String(value||'').trim();
  if(!raw)return null;
  try{return JSON.parse(decodeURIComponent(raw));}
  catch(firstError){
    // Backward compatibility with older forms that stored raw/escaped JSON.
    try{return JSON.parse(raw);}
    catch(secondError){
      console.error('Opportunity hidden JSON decode failed',{raw,firstError,secondError});
      return null;
    }
  }
}

function openOpportunityWonForm(id, draft = null, activityDraft = null) {
  const opportunity = DB.opportunities.find(item => item.id === id);
  const title = opportunity?.title || draft?.title || 'Opportunity';

  openModal(`<div class="p-6">
    <h2 class="text-lg font-bold text-green-700">Mark Opportunity as Won</h2>
    <p class="text-sm text-gray-500 mt-1 mb-4">${esc(title)}</p>

    <form onsubmit="saveOpportunityWon(event,'${id || ''}')" class="space-y-4">
      <input type="hidden" name="draft" value="${opportunityEncodeHiddenJson(draft)}">
      <input type="hidden" name="activityDraft" value="${opportunityEncodeHiddenJson(activityDraft)}">

      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium text-gray-600">Final Booking Value (£) *</label>
          <input name="value" type="number" min="0" required value="${opportunity?.value || draft?.value || ''}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Won Date *</label>
          <input name="wonDate" type="date" required value="${opportunityToday()}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Confirmed Event Date *</label>
        <input name="eventDate" type="date" required value="${opportunity?.eventDate || draft?.eventDate || ''}"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Rezlynx / Booking Reference *</label>
        <input name="bookingReference" required placeholder="BK123456" pattern="[Bb][Kk][A-Za-z0-9-]+"
          title="Enter the full BK reference, for example BK123456"
          class="w-full px-3 py-2 border rounded-lg text-sm uppercase">
        <p class="text-[11px] text-gray-400 mt-1">This becomes the permanent link between the won Opportunity and its Function record.</p>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Win Notes</label>
        <textarea name="notes" rows="3" class="w-full px-3 py-2 border rounded-lg text-sm"
          placeholder="What won the business and any next operational steps?"></textarea>
      </div>

      <button class="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium">
        Confirm Won Revenue
      </button>
    </form>
  </div>`);
}

async function saveOpportunityWon(event, id) {
  event.preventDefault();
  const form = new FormData(event.target);
  const draft = opportunityDecodeHiddenJson(form.get('draft'));
  const activityDraft = opportunityDecodeHiddenJson(form.get('activityDraft'));
  const bookingReference=String(form.get('bookingReference')||'').trim().toUpperCase();
  const eventDate=String(form.get('eventDate')||'').trim();
  if(!/^BK[A-Z0-9-]+$/.test(bookingReference)){
    toast('Enter a valid BK reference, for example BK123456','error');return;
  }
  if(!eventDate){toast('Enter the confirmed event date before marking this opportunity as Won','error');return;}
  const submit=event.target.querySelector('button[type="submit"],button:not([type])');
  const submitText=submit?.textContent;
  if(submit){submit.disabled=true;submit.textContent='Confirming & creating Function…';}

  let opportunityId = id;
  try{

  if (!opportunityId && draft) {
    const insert = {
      company_id: draft.companyId,
      title: draft.title,
      opportunity_type: draft.type,
      stage: 'Won',
      estimated_value: Number(form.get('value')) || 0,
      event_date: eventDate,
      probability: 100,
      expected_close: draft.expectedClose || null,
      assigned_to: draft.assignedTo || null,
      next_action: null,
      next_followup: null,
      deposit_due_date: draft.depositDueDate || null,
      competitor: draft.competitor || null,
      source: draft.source || null,
      notes: draft.notes || null,
      won_date: form.get('wonDate'),
      booking_reference: bookingReference
    };

    const result = await supabaseClient.from('opportunities').insert(insert).select().single();
    if (result.error) {
      toast('Won opportunity could not be saved', 'error');
      return;
    }
    opportunityId = result.data.id;
  } else {
    const { error } = await supabaseClient.from('opportunities').update({
      stage: 'Won',
      estimated_value: Number(form.get('value')) || 0,
      probability: 100,
      next_action: null,
      next_followup: null,
      won_date: form.get('wonDate'),
      booking_reference: bookingReference,
      event_date: eventDate,
      last_activity: form.get('wonDate')
    }).eq('id', opportunityId);

    if (error) {
      toast('Won opportunity could not be saved', 'error');
      return;
    }
  }

  const wonActivityResult=await supabaseClient.from('opportunity_activities').insert({
    opportunity_id: opportunityId,
    activity_type: activityDraft?.activityType || 'Booking',
    activity_date: activityDraft?.activityDate || form.get('wonDate'),
    staff: activityDraft?.staff || null,
    outcome: 'Won',
    notes: [activityDraft?.notes, form.get('notes')].filter(Boolean).join('\n') || 'Opportunity won'
  });
  if(wonActivityResult.error){
    console.error('Won opportunity activity history failed',wonActivityResult.error);
    // Do not undo a successfully won booking. Surface the partial failure and continue the
    // Function transfer so the operational booking is not lost.
    toast(`Opportunity is Won, but its activity-history entry could not be saved${wonActivityResult.error.message?`: ${wonActivityResult.error.message}`:''}`,'error');
  }

  await loadOpportunitiesFromSupabase();

  let wonOpportunity=DB.opportunities.find(item=>item.id===opportunityId);
  // Do not depend solely on the reload mapper before attempting the transfer.
  if(!wonOpportunity){
    const source=DB.opportunities.find(item=>item.id===id)||draft||{};
    wonOpportunity={
      ...source,id:opportunityId,stage:'Won',probability:100,
      bookingReference,eventDate,value:Number(form.get('value'))||0,
      wonDate:form.get('wonDate')
    };
  }
  let functionResult=null;
  const shouldCreateFunction=!['Accommodation','Wedding Referral'].includes(wonOpportunity.type);
  if(shouldCreateFunction){
    if(typeof window.ensureFunctionFromOpportunity!=='function'){
      toast('Revenue was saved, but the Function transfer engine is not loaded. Refresh and use Check Transfers.','error');
    }else{
      try{functionResult=await window.ensureFunctionFromOpportunity(wonOpportunity);}
      catch(error){console.error('Opportunity → Function transfer failed',error);}
    }
  }

  closeModal();
  renderSection();
  if(shouldCreateFunction){
    toast(functionResult?`Won confirmed · Function ${functionResult.bookingReference||bookingReference} created / linked`:'Won saved, but Function transfer needs attention — use Functions → Check Transfers',functionResult?'success':'error');
  }else toast('Revenue marked as won');
  } catch (error) {
    console.error('Confirm Won Revenue failed',error);
    toast(`Could not complete Won Opportunity${error?.message?`: ${error.message}`:''}`,'error');
  } finally {
    if(submit&&submit.isConnected){submit.disabled=false;submit.textContent=submitText||'Confirm Won Revenue';}
  }
}

function openOpportunityLostForm(id, draft = null, activityDraft = null) {
  const opportunity = DB.opportunities.find(item => item.id === id);
  const title = opportunity?.title || draft?.title || 'Opportunity';

  openModal(`<div class="p-6">
    <h2 class="text-lg font-bold text-red-700">Close Opportunity as Lost</h2>
    <p class="text-sm text-gray-500 mt-1 mb-4">${esc(title)}</p>

    <form onsubmit="saveOpportunityLost(event,'${id || ''}')" class="space-y-4">
      <input type="hidden" name="draft" value="${opportunityEncodeHiddenJson(draft)}">
      <input type="hidden" name="activityDraft" value="${opportunityEncodeHiddenJson(activityDraft)}">

      <div>
        <label class="text-xs font-medium text-gray-600">Lost Reason *</label>
        <select name="lostReason" required class="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="">Select reason</option>
          <option>Price</option>
          <option>Date Unavailable</option>
          <option>Booked Another Venue</option>
          <option>No Response</option>
          <option>Event Cancelled</option>
          <option>Requirements Not Suitable</option>
          <option>Decision Delayed</option>
          <option>Internal Venue Decision</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Competitor / Venue Chosen</label>
        <input name="competitor" value="${esc(opportunity?.competitor || draft?.competitor || '')}"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Lost Notes *</label>
        <textarea name="lostNotes" required rows="3"
          placeholder="Record what happened so the team can learn from it."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <button class="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium">
        Save Lost Opportunity
      </button>
    </form>
  </div>`);
}

async function saveOpportunityLost(event, id) {
  event.preventDefault();
  const form = new FormData(event.target);
  const draft = opportunityDecodeHiddenJson(form.get('draft'));
  const activityDraft = opportunityDecodeHiddenJson(form.get('activityDraft'));

  let opportunityId = id;
  const lostReason = form.get('lostReason');
  const lostNotes = form.get('lostNotes');
  const competitor = form.get('competitor') || null;

  if (!opportunityId && draft) {
    const result = await supabaseClient.from('opportunities').insert({
      company_id: draft.companyId,
      title: draft.title,
      opportunity_type: draft.type,
      stage: 'Lost',
      estimated_value: Number(draft.value) || 0,
      probability: 0,
      expected_close: draft.expectedClose || null,
      event_date: draft.eventDate || null,
      assigned_to: draft.assignedTo || null,
      next_action: null,
      next_followup: null,
      deposit_due_date: draft.depositDueDate || null,
      competitor,
      source: draft.source || null,
      notes: draft.notes || null,
      lost_reason: lostReason,
      lost_notes: lostNotes,
      lost_date: opportunityToday()
    }).select().single();

    if (result.error) {
      toast('Lost opportunity could not be saved', 'error');
      return;
    }
    opportunityId = result.data.id;
  } else {
    const { error } = await supabaseClient.from('opportunities').update({
      stage: 'Lost',
      probability: 0,
      next_action: null,
      next_followup: null,
      competitor,
      lost_reason: lostReason,
      lost_notes: lostNotes,
      lost_date: opportunityToday(),
      last_activity: opportunityToday()
    }).eq('id', opportunityId);

    if (error) {
      toast('Lost opportunity could not be saved', 'error');
      return;
    }
  }

  await supabaseClient.from('opportunity_activities').insert({
    opportunity_id: opportunityId,
    activity_type: activityDraft?.activityType || 'Closure',
    activity_date: activityDraft?.activityDate || opportunityToday(),
    staff: activityDraft?.staff || null,
    outcome: 'Lost',
    notes: [activityDraft?.notes, `${lostReason}: ${lostNotes}`].filter(Boolean).join('\n')
  });

  await loadOpportunitiesFromSupabase();
  closeModal();
  renderSection();
  toast('Lost reason recorded');
}

async function deleteOpportunity(id) {
  const { error } = await supabaseClient.from('opportunities').delete().eq('id', id);
  if (error) {
    toast('Opportunity could not be deleted', 'error');
    return;
  }
  await loadOpportunitiesFromSupabase();
  renderSection();
  toast('Opportunity deleted');
}
