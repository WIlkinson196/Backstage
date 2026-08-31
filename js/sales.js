
// ============================================================================
// WINDMILL FARM — PROACTIVE SALES HUB
// Sales Leads are organisations we proactively target, not inbound enquiries.
// ============================================================================

let salesLeadTablesReady = true;
let salesLeadActiveView = 'today';

function currentDateStr() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function salesAddDays(dateString, days) {
  const date = new Date((dateString || currentDateStr()) + 'T12:00:00');
  date.setDate(date.getDate() + Number(days || 0));
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function salesFormatDate(value) {
  if (!value) return 'Not set';
  return new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function salesLeadStatuses() {
  return [
    'Prospect',
    'Researching',
    'First Contact Due',
    'Attempting Contact',
    'Conversation Started',
    'Meeting Booked',
    'Proposal Required',
    'Proposal Sent',
    'Negotiation',
    'Converted',
    'Not Interested',
    'Do Not Contact'
  ];
}

function salesLeadStatusColor(status) {
  const map = {
    'Prospect': 'bg-gray-100 text-gray-700',
    'Researching': 'bg-slate-100 text-slate-700',
    'First Contact Due': 'bg-yellow-100 text-yellow-800',
    'Attempting Contact': 'bg-amber-100 text-amber-800',
    'Conversation Started': 'bg-blue-100 text-blue-800',
    'Meeting Booked': 'bg-indigo-100 text-indigo-800',
    'Proposal Required': 'bg-orange-100 text-orange-800',
    'Proposal Sent': 'bg-purple-100 text-purple-800',
    'Negotiation': 'bg-fuchsia-100 text-fuchsia-800',
    'Converted': 'bg-green-100 text-green-800',
    'Not Interested': 'bg-red-100 text-red-700',
    'Do Not Contact': 'bg-red-100 text-red-800'
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

function salesLeadRelationshipColor(relationship) {
  const map = {
    'Cold': 'bg-gray-100 text-gray-700',
    'Warm': 'bg-amber-100 text-amber-800',
    'Hot': 'bg-red-100 text-red-700',
    'Strategic': 'bg-purple-100 text-purple-800',
    'Existing Customer': 'bg-green-100 text-green-800'
  };
  return map[relationship] || 'bg-gray-100 text-gray-700';
}

function activeSalesLead(lead) {
  return !['Converted', 'Not Interested', 'Do Not Contact'].includes(lead.status);
}

function salesLeadDue(lead) {
  return activeSalesLead(lead) && lead.nextFollowup && lead.nextFollowup <= currentDateStr();
}

function salesLeadOverdue(lead) {
  return activeSalesLead(lead) && lead.nextFollowup && lead.nextFollowup < currentDateStr();
}

function salesLeadScore(lead) {
  let score = 10;

  if (lead.contactName) score += 8;
  if (lead.phone) score += 6;
  if (lead.email) score += 6;
  if (lead.jobTitle) score += 4;
  if (lead.decisionMaker) score += 12;
  if (lead.potentialValue >= 10000) score += 15;
  else if (lead.potentialValue >= 5000) score += 10;
  else if (lead.potentialValue >= 2000) score += 5;

  const stageScores = {
    'Prospect': 0,
    'Researching': 4,
    'First Contact Due': 5,
    'Attempting Contact': 8,
    'Conversation Started': 18,
    'Meeting Booked': 28,
    'Proposal Required': 34,
    'Proposal Sent': 40,
    'Negotiation': 45,
    'Converted': 50
  };
  score += stageScores[lead.status] || 0;

  if (lead.relationship === 'Warm') score += 5;
  if (lead.relationship === 'Hot') score += 10;
  if (lead.relationship === 'Strategic') score += 12;
  if (lead.lastContact && salesAddDays(lead.lastContact, 7) >= currentDateStr()) score += 5;
  if (salesLeadOverdue(lead)) score -= 12;
  if (!lead.nextFollowup && activeSalesLead(lead)) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function salesLeadNextBestAction(lead) {
  if (lead.nextAction) return lead.nextAction;

  const actions = {
    'Prospect': 'Research the company and identify the best decision maker',
    'Researching': 'Find a named contact and direct phone number',
    'First Contact Due': 'Make the first outbound call',
    'Attempting Contact': 'Call again and follow up by email',
    'Conversation Started': 'Qualify their event needs and book a meeting',
    'Meeting Booked': 'Prepare for the meeting and confirm attendance',
    'Proposal Required': 'Create and send the tailored proposal',
    'Proposal Sent': 'Follow up on the proposal',
    'Negotiation': 'Resolve objections and agree next steps',
    'Converted': 'Create the company record and revenue opportunity',
    'Not Interested': 'No action required',
    'Do Not Contact': 'Do not contact'
  };
  return actions[lead.status] || 'Review this sales lead';
}

function salesLeadSuggestedDate(status) {
  const days = {
    'Prospect': 1,
    'Researching': 1,
    'First Contact Due': 1,
    'Attempting Contact': 2,
    'Conversation Started': 3,
    'Meeting Booked': 1,
    'Proposal Required': 1,
    'Proposal Sent': 3,
    'Negotiation': 2
  };
  return salesAddDays(currentDateStr(), days[status] ?? 3);
}

async function loadSalesLeadsFromSupabase() {
  const { data, error } = await supabaseClient
    .from('sales_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Sales leads table is not ready:', error);
    salesLeadTablesReady = false;
    DB.salesLeads = [];
    DB.salesActivities = [];
    return;
  }

  salesLeadTablesReady = true;
  DB.salesLeads = (data || []).map(row => ({
    id: row.id,
    companyName: row.company_name || '',
    contactName: row.contact_name || '',
    jobTitle: row.job_title || '',
    decisionMaker: Boolean(row.decision_maker),
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    linkedin: row.linkedin || '',
    businessType: row.business_type || '',
    postcode: row.postcode || '',
    leadSource: row.lead_source || '',
    assignedTo: row.assigned_to || '',
    status: row.status || 'Prospect',
    relationship: row.relationship || 'Cold',
    servicesNeeded: row.services_needed || '',
    potentialValue: Number(row.potential_value || 0),
    annualPotential: Number(row.annual_potential || row.potential_value || 0),
    lastContact: row.last_contact || '',
    nextFollowup: row.next_followup || '',
    nextAction: row.next_action || '',
    outcome: row.outcome || '',
    notes: row.notes || '',
    lostReason: row.lost_reason || '',
    contactAttempts: Number(row.contact_attempts || 0),
    createdAt: row.created_at || ''
  }));

  if (!DB.salesLeads.length) {
    DB.salesActivities = [];
    return;
  }

  const ids = DB.salesLeads.map(lead => lead.id);
  const activityResult = await supabaseClient
    .from('sales_lead_activities')
    .select('*')
    .in('sales_lead_id', ids)
    .order('activity_date', { ascending: false });

  if (activityResult.error) {
    console.warn('Could not load sales activity:', activityResult.error);
    DB.salesActivities = [];
    return;
  }

  DB.salesActivities = (activityResult.data || []).map(row => ({
    id: row.id,
    leadId: row.sales_lead_id,
    type: row.activity_type || 'Outbound Call',
    date: row.activity_date || '',
    staff: row.staff || '',
    outcome: row.outcome || '',
    notes: row.notes || '',
    createdAt: row.created_at || ''
  }));
}

function renderSalesLeads() {
  if (!salesLeadTablesReady) {
    return `<div class="section-card max-w-3xl">
      <div class="flex items-start gap-3">
        <i data-lucide="database" class="text-olive-600 mt-1" style="width:20px;height:20px"></i>
        <div>
          <h3 class="font-bold text-charcoal-900">Supabase setup required</h3>
          <p class="text-sm text-gray-600 mt-1">
            Run <strong>setup-proactive-sales-hub.sql</strong> in Supabase SQL Editor, then refresh.
          </p>
        </div>
      </div>
    </div>`;
  }

  const leads = DB.salesLeads || [];
  const live = leads.filter(activeSalesLead);
  const due = live.filter(salesLeadDue);
  const overdue = live.filter(salesLeadOverdue);
  const meetings = live.filter(lead => lead.status === 'Meeting Booked');
  const proposals = live.filter(lead => ['Proposal Required', 'Proposal Sent', 'Negotiation'].includes(lead.status));
  const pipeline = live.reduce((sum, lead) => sum + Number(lead.potentialValue || 0), 0);

  setTimeout(() => setSalesLeadView(salesLeadActiveView), 0);

  return `
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
      ${kpi('Live Prospects', live.length, 'building-2', 'olive')}
      ${kpi('Calls Due', due.length, 'phone-call', 'red')}
      ${kpi('Overdue', overdue.length, 'alert-triangle', 'red')}
      ${kpi('Meetings', meetings.length, 'calendar-check', 'teal')}
      ${kpi('Proposals', proposals.length, 'file-text', 'gold')}
      ${kpi('Pipeline', '£' + pipeline.toLocaleString(), 'trending-up', 'green')}
    </div>

    <div class="bg-charcoal-900 text-white rounded-xl p-4 mb-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-3">
        <div class="flex-1">
          <p class="text-xs tracking-widest text-gold-400 font-bold">TODAY'S BUSINESS DEVELOPMENT</p>
          <h3 class="text-lg font-bold mt-1">Work the call list, log every outcome and always set the next action.</h3>
          <p class="text-sm text-gray-300 mt-1">
            This module is for proactive selling: local businesses, schools, clubs, suppliers, care homes and organisations that have not enquired yet.
          </p>
        </div>
        <button onclick="openSalesLeadForm()" class="px-4 py-2.5 bg-gold-500 text-white rounded-lg font-semibold whitespace-nowrap">
          + Add Prospect
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      ${[
        ['today', 'Today’s Call List'],
        ['overdue', 'Overdue'],
        ['uncontacted', 'Not Contacted'],
        ['meetings', 'Meetings'],
        ['proposals', 'Proposals'],
        ['hot', 'Hot / Strategic'],
        ['all', 'All Prospects']
      ].map(([view, label]) => `
        <button id="sales-view-${view}" onclick="setSalesLeadView('${view}')"
          class="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200">
          ${label}
        </button>
      `).join('')}
    </div>

    <div class="flex flex-col xl:flex-row gap-3 mb-4">
      <input id="sales-search" oninput="filterSalesLeads()"
        placeholder="Search company, decision maker, phone, email, industry or area..."
        class="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm">

      <select id="sales-status" onchange="filterSalesLeads()" class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
        <option value="">All Stages</option>
        ${salesLeadStatuses().map(status => `<option>${status}</option>`).join('')}
      </select>

      <select id="sales-owner" onchange="filterSalesLeads()" class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
        <option value="">All Team</option>
        ${activeStaff().map(staff => `<option>${esc(staff.name)}</option>`).join('')}
      </select>

      <select id="sales-industry" onchange="filterSalesLeads()" class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
        <option value="">All Industries</option>
        ${[...new Set(leads.map(lead => lead.businessType).filter(Boolean))].sort().map(value => `<option>${esc(value)}</option>`).join('')}
      </select>
    </div>

    <div id="sales-lead-list" class="space-y-2"></div>
  `;
}

function setSalesLeadView(view) {
  salesLeadActiveView = view || 'today';
  if(window.AppRouter)AppRouter.commit(`/sales-leads/${encodeURIComponent(salesLeadActiveView)}`);

  document.querySelectorAll('[id^="sales-view-"]').forEach(button => {
    button.className = 'px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200';
  });
  const active = document.getElementById(`sales-view-${salesLeadActiveView}`);
  if (active) active.className = 'px-3 py-2 rounded-lg text-sm font-medium bg-olive-600 text-white border border-olive-600';

  filterSalesLeads();
}

function filterSalesLeads() {
  const query = (document.getElementById('sales-search')?.value || '').toLowerCase();
  const status = document.getElementById('sales-status')?.value || '';
  const owner = document.getElementById('sales-owner')?.value || '';
  const industry = document.getElementById('sales-industry')?.value || '';

  let list = (DB.salesLeads || []).filter(lead => {
    const haystack = [
      lead.companyName,
      lead.contactName,
      lead.jobTitle,
      lead.phone,
      lead.email,
      lead.postcode,
      lead.businessType,
      lead.servicesNeeded,
      lead.nextAction
    ].join(' ').toLowerCase();

    if (query && !haystack.includes(query)) return false;
    if (status && lead.status !== status) return false;
    if (owner && lead.assignedTo !== owner) return false;
    if (industry && lead.businessType !== industry) return false;

    if (salesLeadActiveView === 'today' && !salesLeadDue(lead)) return false;
    if (salesLeadActiveView === 'overdue' && !salesLeadOverdue(lead)) return false;
    if (salesLeadActiveView === 'uncontacted' && !['Prospect', 'Researching', 'First Contact Due'].includes(lead.status)) return false;
    if (salesLeadActiveView === 'meetings' && lead.status !== 'Meeting Booked') return false;
    if (salesLeadActiveView === 'proposals' && !['Proposal Required', 'Proposal Sent', 'Negotiation'].includes(lead.status)) return false;
    if (salesLeadActiveView === 'hot' && !['Hot', 'Strategic'].includes(lead.relationship)) return false;

    return true;
  });

  list.sort((a, b) => {
    const dueCompare = String(a.nextFollowup || '9999-12-31').localeCompare(String(b.nextFollowup || '9999-12-31'));
    if (dueCompare !== 0) return dueCompare;
    return salesLeadScore(b) - salesLeadScore(a);
  });

  const element = document.getElementById('sales-lead-list');
  if (!element) return;

  element.innerHTML = list.length ? list.map(renderSalesLeadCard).join('') : `
    <div class="section-card text-center text-gray-400 py-10">
      No prospects match this view.
    </div>
  `;

  lucide.createIcons();
}

function renderSalesLeadCard(lead) {
  const activities = (DB.salesActivities || []).filter(activity => activity.leadId === lead.id);
  const score = salesLeadScore(lead);
  const nextAction = salesLeadNextBestAction(lead);
  const scoreLabel = score >= 75 ? 'High priority' : score >= 50 ? 'Worth pursuing' : 'Build the relationship';

  return `<div class="bg-white rounded-xl p-4 border ${salesLeadOverdue(lead) ? 'border-red-200' : 'border-olive-100'} shadow-sm hover:shadow-md transition-shadow">
    <div class="flex flex-col xl:flex-row xl:items-center gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-semibold text-charcoal-900">${esc(lead.companyName)}</span>
          <span class="badge ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span>
          <span class="badge ${salesLeadRelationshipColor(lead.relationship)}">${esc(lead.relationship)}</span>
          ${salesLeadOverdue(lead) ? '<span class="badge bg-red-100 text-red-700">Overdue</span>' : ''}
          ${lead.nextFollowup === currentDateStr() ? '<span class="badge bg-amber-100 text-amber-800">Due today</span>' : ''}
        </div>

        <p class="text-xs text-gray-500 mt-1">
          ${esc(lead.contactName || 'Decision maker not identified')}
          ${lead.jobTitle ? ' · ' + esc(lead.jobTitle) : ''}
          ${lead.decisionMaker ? ' · Decision maker' : ''}
        </p>

        <p class="text-xs text-gray-500 mt-1">
          ${esc(lead.businessType || 'Industry not set')} · ${esc(lead.postcode || 'Area not set')} ·
          Owner: ${esc(lead.assignedTo || 'Unassigned')} · ${activities.length} activit${activities.length === 1 ? 'y' : 'ies'}
        </p>

        <div class="mt-3 bg-cream-50 rounded-lg px-3 py-2">
          <p class="text-xs text-gray-500">Next best action</p>
          <p class="text-sm font-semibold text-charcoal-900">${esc(nextAction)}</p>
          <p class="text-xs mt-1 ${salesLeadOverdue(lead) ? 'text-red-700 font-semibold' : 'text-gray-500'}">
            Due: ${salesFormatDate(lead.nextFollowup)} · Potential: £${Number(lead.potentialValue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div class="xl:w-36 bg-gray-50 rounded-xl p-3 text-center">
        <p class="text-xs text-gray-500">Sales score</p>
        <p class="text-3xl font-bold ${score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-gray-600'}">${score}</p>
        <p class="text-[12px] text-gray-500">${scoreLabel}</p>
      </div>

      <div class="flex xl:flex-col gap-2 flex-wrap">
        ${activeSalesLead(lead) ? `<button onclick="openSalesActivityForm('${lead.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-xs font-medium">Complete Next Action</button>` : ''}
        <button onclick="viewSalesLead('${lead.id}')" class="px-3 py-2 bg-olive-50 text-olive-700 rounded-lg text-xs font-medium">Open Full Prospect</button>
        <button onclick="openSalesLeadForm('${lead.id}')" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">Edit</button>
      </div>
    </div>
  </div>`;
}

function openSalesLeadForm(id) {
  const lead = id ? DB.salesLeads.find(item => item.id === id) : null;
  const industries = [
    'Accountancy', 'Care Home', 'Charity', 'Construction', 'Education', 'Estate Agent',
    'Funeral Director', 'Healthcare', 'Hotel', 'Legal', 'Manufacturer', 'Networking Group',
    'Public Sector', 'Retail', 'Sports Club', 'Wedding Supplier', 'Other'
  ];

  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">PROACTIVE SALES</p>
        <h2 class="text-lg font-bold">${id ? 'Edit' : 'New'} Prospect</h2>
      </div>
      <button onclick="closeModal()"><i data-lucide="x" style="width:20px;height:20px"></i></button>
    </div>

    <form onsubmit="saveSalesLead(event,'${id || ''}')" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium text-gray-600">Business Name *</label>
          <input name="companyName" required value="${esc(lead?.companyName || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Industry</label>
          <select name="businessType" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Select industry</option>
            ${industries.map(value => `<option ${lead?.businessType === value ? 'selected' : ''}>${value}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Contact Name</label>
          <input name="contactName" value="${esc(lead?.contactName || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Job Title</label>
          <input name="jobTitle" value="${esc(lead?.jobTitle || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <label class="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="decisionMaker" ${lead?.decisionMaker ? 'checked' : ''}>
          This person is a decision maker
        </label>

        <div>
          <label class="text-xs font-medium text-gray-600">Phone</label>
          <input name="phone" value="${esc(lead?.phone || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Email</label>
          <input type="email" name="email" value="${esc(lead?.email || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Website</label>
          <input name="website" value="${esc(lead?.website || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">LinkedIn</label>
          <input name="linkedin" value="${esc(lead?.linkedin || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Postcode / Area</label>
          <input name="postcode" value="${esc(lead?.postcode || '')}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Lead Source</label>
          <select name="leadSource" class="w-full px-3 py-2 border rounded-lg text-sm">
            ${['Prospecting','Google Search','LinkedIn','Networking Event','Referral','Existing Customer','Walk-in','Other'].map(value => `<option ${lead?.leadSource === value ? 'selected' : ''}>${value}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Assigned To</label>
          <select name="assignedTo" required class="w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(lead?.assignedTo || '')}</select>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Stage</label>
          <select name="status" class="w-full px-3 py-2 border rounded-lg text-sm">
            ${salesLeadStatuses().map(value => `<option ${lead?.status === value ? 'selected' : ''}>${value}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Relationship</label>
          <select name="relationship" class="w-full px-3 py-2 border rounded-lg text-sm">
            ${['Cold','Warm','Hot','Strategic','Existing Customer'].map(value => `<option ${lead?.relationship === value ? 'selected' : ''}>${value}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Potential Value (£)</label>
          <input type="number" min="0" name="potentialValue" value="${lead?.potentialValue || ''}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Estimated Annual Value (£)</label>
          <input type="number" min="0" name="annualPotential" value="${lead?.annualPotential || ''}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Next Follow-Up</label>
          <input type="date" name="nextFollowup" value="${lead?.nextFollowup || salesAddDays(currentDateStr(), 1)}" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Services / Revenue Opportunities</label>
        <input name="servicesNeeded" value="${esc(lead?.servicesNeeded || '')}"
          placeholder="Christmas parties, conferences, accommodation, private dining..."
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Next Action</label>
        <input name="nextAction" value="${esc(lead?.nextAction || 'Research the company and identify the best decision maker')}"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Current Position</label>
        <textarea name="outcome" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(lead?.outcome || '')}</textarea>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">General Notes</label>
        <textarea name="notes" rows="3" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(lead?.notes || '')}</textarea>
      </div>

      <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save Prospect</button>
    </form>
  </div>`);
}

async function saveSalesLead(event, id) {
  event.preventDefault();

  const form = new FormData(event.target);
  const companyName = String(form.get('companyName') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const phone = String(form.get('phone') || '').replace(/\s+/g, '');

  const duplicate = (DB.salesLeads || []).find(lead =>
    lead.id !== id && (
      lead.companyName.toLowerCase() === companyName.toLowerCase() ||
      (email && lead.email.toLowerCase() === email) ||
      (phone && String(lead.phone || '').replace(/\s+/g, '') === phone)
    )
  );

  if (duplicate) {
    toast(`Possible duplicate: ${duplicate.companyName}`, 'error');
    return;
  }

  const status = form.get('status') || 'Prospect';
  if(activeSalesLead({status})&&!String(form.get('assignedTo')||'').trim()){
    toast('Assign an owner before saving a live prospect','error');
    return;
  }
  if(activeSalesLead({status})&&(!String(form.get('nextAction')||'').trim()||!String(form.get('nextFollowup')||'').trim())){
    toast('Every live prospect needs a next action and follow-up date','error');
    return;
  }
  const record = {
    company_name: companyName,
    contact_name: form.get('contactName') || null,
    job_title: form.get('jobTitle') || null,
    decision_maker: form.has('decisionMaker'),
    phone: form.get('phone') || null,
    email: email || null,
    website: form.get('website') || null,
    linkedin: form.get('linkedin') || null,
    business_type: form.get('businessType') || null,
    postcode: form.get('postcode') || null,
    lead_source: form.get('leadSource') || null,
    assigned_to: form.get('assignedTo') || null,
    status,
    relationship: form.get('relationship') || 'Cold',
    services_needed: form.get('servicesNeeded') || null,
    potential_value: Number(form.get('potentialValue')) || 0,
    annual_potential: Number(form.get('annualPotential')) || 0,
    next_followup: activeSalesLead({ status }) ? (form.get('nextFollowup') || salesLeadSuggestedDate(status)) : null,
    next_action: activeSalesLead({ status }) ? (form.get('nextAction') || salesLeadNextBestAction({ status })) : null,
    outcome: form.get('outcome') || null,
    notes: form.get('notes') || null
  };

  const query = id
    ? supabaseClient.from('sales_leads').update(record).eq('id', id)
    : supabaseClient.from('sales_leads').insert(record);

  const { error } = await query;

  if (error) {
    console.error(error);
    toast('Prospect could not be saved', 'error');
    return;
  }

  closeModal();
  await loadSalesLeadsFromSupabase();
  renderSection();
  toast(id ? 'Prospect updated' : 'Prospect created and added to the call plan');
}

function viewSalesLead(id) {
  const lead = DB.salesLeads.find(item => item.id === id);
  if (!lead) return;

  const activities = (DB.salesActivities || [])
    .filter(activity => activity.leadId === id)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const score = salesLeadScore(lead);

  openModal(`<div class="p-6">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">PROACTIVE SALES PROSPECT</p>
        <h2 class="text-xl font-bold">${esc(lead.companyName)}</h2>
        <p class="text-sm text-gray-500">
          ${esc(lead.contactName || 'Decision maker not identified')}
          ${lead.jobTitle ? ' · ' + esc(lead.jobTitle) : ''}
        </p>
      </div>
      <button onclick="closeModal()"><i data-lucide="x" style="width:20px;height:20px"></i></button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Stage</p>
        <span class="badge mt-1 ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span>
      </div>
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Relationship</p>
        <span class="badge mt-1 ${salesLeadRelationshipColor(lead.relationship)}">${esc(lead.relationship)}</span>
      </div>
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Potential</p>
        <p class="font-bold text-gold-600">£${Number(lead.potentialValue || 0).toLocaleString()}</p>
      </div>
      <div class="bg-cream-50 rounded-lg p-3">
        <p class="text-xs text-gray-500">Sales Score</p>
        <p class="font-bold">${score}/100</p>
      </div>
    </div>

    ${activeSalesLead(lead) ? `<div class="rounded-xl border ${salesLeadOverdue(lead) ? 'border-red-200 bg-red-50' : 'border-olive-200 bg-olive-50'} p-4 mb-4">
      <p class="text-xs uppercase tracking-wide text-gray-500">Next best action</p>
      <p class="font-bold text-charcoal-900 mt-1">${esc(salesLeadNextBestAction(lead))}</p>
      <p class="text-xs mt-2 ${salesLeadOverdue(lead) ? 'text-red-700 font-semibold' : 'text-gray-600'}">
        Due ${salesFormatDate(lead.nextFollowup)}
      </p>
    </div>` : ''}

    <div class="grid sm:grid-cols-2 gap-3 text-sm mb-4">
      <div><span class="text-gray-500">Phone:</span> ${esc(lead.phone || '—')}</div>
      <div><span class="text-gray-500">Email:</span> ${esc(lead.email || '—')}</div>
      <div><span class="text-gray-500">Industry:</span> ${esc(lead.businessType || '—')}</div>
      <div><span class="text-gray-500">Area:</span> ${esc(lead.postcode || '—')}</div>
      <div><span class="text-gray-500">Owner:</span> ${esc(lead.assignedTo || 'Unassigned')}</div>
      <div><span class="text-gray-500">Contact attempts:</span> ${lead.contactAttempts || 0}</div>
      <div><span class="text-gray-500">Annual potential:</span> £${Number(lead.annualPotential || 0).toLocaleString()}</div>
      <div><span class="text-gray-500">Last contact:</span> ${salesFormatDate(lead.lastContact)}</div>
    </div>

    ${lead.servicesNeeded ? `<div class="mb-4"><p class="text-xs text-gray-500">Potential services</p><p class="text-sm">${esc(lead.servicesNeeded)}</p></div>` : ''}
    ${lead.outcome ? `<div class="mb-4"><p class="text-xs text-gray-500">Current position</p><p class="text-sm">${esc(lead.outcome)}</p></div>` : ''}
    ${lead.notes ? `<div class="mb-4"><p class="text-xs text-gray-500">Notes</p><p class="text-sm">${esc(lead.notes)}</p></div>` : ''}

    <div class="flex gap-2 flex-wrap mb-5">
      ${activeSalesLead(lead) ? `<button onclick="openSalesActivityForm('${id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">Complete Next Action</button>` : ''}
      <button onclick="openLeadOpportunityWizard('${id}')" class="px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium">Create Opportunity</button>
      <button onclick="convertSalesLeadToCompany('${id}')" class="px-4 py-2 bg-charcoal-900 text-white rounded-lg text-sm font-medium">Create Company</button>
      <button onclick="openSalesLeadForm('${id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Edit</button>
    </div>

    <h3 class="font-bold mb-2">Contact Timeline</h3>
    <div class="space-y-2 max-h-72 overflow-y-auto">
      ${activities.length ? activities.map(activity => `<div class="p-3 border border-gray-100 rounded-lg">
        <div class="flex justify-between gap-2">
          <p class="text-sm font-semibold">${esc(activity.type)} · ${esc(activity.outcome || 'No outcome')}</p>
          <span class="text-xs text-gray-500">${salesFormatDate(activity.date)}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">${esc(activity.staff || 'Unassigned')}</p>
        ${activity.notes ? `<p class="text-sm mt-2">${esc(activity.notes)}</p>` : ''}
      </div>`).join('') : '<p class="text-sm text-gray-400">No sales activity logged yet.</p>'}
    </div>
  </div>`);
}

function openSalesActivityForm(leadId) {
  const lead = DB.salesLeads.find(item => item.id === leadId);
  if (!lead) return;

  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">${esc(lead.companyName)}</p>
        <h2 class="text-lg font-bold">Complete Sales Action</h2>
      </div>
      <button onclick="viewSalesLead('${leadId}')"><i data-lucide="x" style="width:20px;height:20px"></i></button>
    </div>

    <form id="sales-activity-form-${leadId}" onsubmit="return window.saveSalesActivity(event,'${leadId}')" class="space-y-4">
      <div>
        <label class="text-xs font-medium text-gray-600">What did you do? *</label>
        <select name="type" required class="w-full px-3 py-2 border rounded-lg text-sm mt-1">
          ${['Outbound Call','Email Sent','LinkedIn Message','Visit','Meeting','Proposal Sent','Inbound Call','Email Received','Other'].map(value => `<option>${value}</option>`).join('')}
        </select>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Outcome *</label>
        <select name="outcome" required class="w-full px-3 py-2 border rounded-lg text-sm mt-1">
          <option value="">Select outcome</option>
          <option>No Answer</option>
          <option>Left Voicemail</option>
          <option>Spoke to Reception</option>
          <option>Found Decision Maker</option>
          <option>Spoke to Decision Maker</option>
          <option>Information Requested</option>
          <option>Interested</option>
          <option>Meeting Booked</option>
          <option>Proposal Required</option>
          <option>Proposal Sent</option>
          <option>Negotiating</option>
          <option>Converted</option>
          <option>Not Interested</option>
          <option>Wrong Details</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Notes *</label>
        <textarea name="notes" required rows="4"
          placeholder="Who you spoke to, what they need, objections, timing and the agreed next step..."
          class="w-full px-3 py-2 border rounded-lg text-sm mt-1"></textarea>
      </div>

      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium text-gray-600">Activity Date</label>
          <input type="date" name="date" value="${currentDateStr()}" required class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Staff Member</label>
          <select name="staff" class="w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(lead.assignedTo || '', false)}</select>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Custom Next Follow-Up</label>
          <input type="date" name="nextFollowup" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Custom Next Action</label>
          <input name="nextAction" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
      </div>

      <p class="text-[12px] text-gray-500">
        Leave the custom fields blank and the CRM will choose the next stage, action and follow-up date automatically.
      </p>

      <div id="sales-activity-status-${leadId}" class="hidden rounded-lg border px-3 py-2 text-xs"></div>
      <button type="submit" id="sales-activity-submit-${leadId}" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">
        Save Activity & Schedule Next Action
      </button>
    </form>
  </div>`);
}

function salesOutcomeWorkflow(outcome) {
  const map = {
    'No Answer': ['Attempting Contact', 'Call again and follow up by email', 2],
    'Left Voicemail': ['Attempting Contact', 'Send a short follow-up email', 1],
    'Spoke to Reception': ['Researching', 'Find and contact the decision maker', 2],
    'Found Decision Maker': ['First Contact Due', 'Call the identified decision maker', 1],
    'Spoke to Decision Maker': ['Conversation Started', 'Qualify requirements and book a meeting', 3],
    'Information Requested': ['Conversation Started', 'Send the requested brochure or information', 1],
    'Interested': ['Conversation Started', 'Book a meeting or venue visit', 2],
    'Meeting Booked': ['Meeting Booked', 'Prepare for and attend the meeting', 1],
    'Proposal Required': ['Proposal Required', 'Create and send a tailored proposal', 1],
    'Proposal Sent': ['Proposal Sent', 'Follow up on the proposal', 3],
    'Negotiating': ['Negotiation', 'Resolve objections and agree the booking', 2],
    'Converted': ['Converted', null, null],
    'Not Interested': ['Not Interested', null, null],
    'Wrong Details': ['Researching', 'Find accurate contact details', 2],
    'Other': ['Conversation Started', 'Complete the agreed next action', 3]
  };
  return map[outcome] || ['Conversation Started', 'Complete the agreed next action', 3];
}

async function saveSalesActivity(event, leadId) {
  if(event?.preventDefault)event.preventDefault();

  const statusEl=document.getElementById(`sales-activity-status-${leadId}`);
  const setStatus=(message,type='info')=>{
    if(!statusEl)return;
    statusEl.classList.remove('hidden','bg-red-50','border-red-200','text-red-700','bg-olive-50','border-olive-200','text-olive-800','bg-blue-50','border-blue-200','text-blue-700');
    const classes=type==='error'
      ?['bg-red-50','border-red-200','text-red-700']
      :type==='success'
        ?['bg-olive-50','border-olive-200','text-olive-800']
        :['bg-blue-50','border-blue-200','text-blue-700'];
    statusEl.classList.add(...classes);
    statusEl.textContent=message;
  };

  const button=document.getElementById(`sales-activity-submit-${leadId}`)
    ||event?.submitter
    ||event?.currentTarget?.querySelector?.('button[type="submit"]');
  const originalText=button?.textContent;

  try{
    const formEl=document.getElementById(`sales-activity-form-${leadId}`)
      ||event?.currentTarget?.closest?.('form')
      ||(event?.currentTarget?.tagName==='FORM'?event.currentTarget:null)
      ||event?.target?.closest?.('form')
      ||(event?.target?.tagName==='FORM'?event.target:null);

    if(!formEl){
      throw new Error('The sales activity form could not be found. Refresh this lead and try again.');
    }

    if(typeof formEl.reportValidity==='function'&&!formEl.reportValidity()){
      setStatus('Complete the required fields before saving.','error');
      return false;
    }

    const lead=(DB.salesLeads||[]).find(item=>String(item.id)===String(leadId));
    if(!lead){
      throw new Error('This sales lead is no longer loaded. Refresh the CRM and try again.');
    }

    const form=new FormData(formEl);
    const outcome=String(form.get('outcome')||'').trim();
    const activityDate=String(form.get('date')||'').trim();
    const notes=String(form.get('notes')||'').trim();

    if(!outcome||!activityDate||!notes){
      setStatus('Complete the outcome, notes and activity date before saving.','error');
      return false;
    }

    const [status,suggestedAction,suggestedDays]=salesOutcomeWorkflow(outcome);
    const nextAction=String(form.get('nextAction')||suggestedAction||'').trim()||null;
    const nextFollowup=String(form.get('nextFollowup')||'').trim()
      ||(suggestedDays!==null?salesAddDays(activityDate,suggestedDays):null);

    if(!['Converted','Not Interested'].includes(outcome)&&(!nextAction||!nextFollowup)){
      setStatus('A live prospect must have both a next action and follow-up date.','error');
      return false;
    }

    if(button){
      button.disabled=true;
      button.textContent='Saving activity…';
    }
    setStatus('Saving activity history…');

    const activity={
      sales_lead_id:lead.id,
      activity_type:String(form.get('type')||'Outbound Call'),
      activity_date:activityDate,
      staff:String(form.get('staff')||'').trim()||null,
      outcome,
      notes
    };

    const activityResult=await supabaseClient.from('sales_lead_activities').insert(activity);
    if(activityResult.error){
      console.error('Sales activity insert failed',activityResult.error);
      throw new Error(`Activity history could not be saved${activityResult.error.message?`: ${activityResult.error.message}`:''}`);
    }

    setStatus('Activity saved. Updating lead and next action…');

    const update={
      status,
      next_followup:nextFollowup,
      next_action:nextAction,
      last_contact:activityDate,
      contact_attempts:Number(lead.contactAttempts||0)+1,
      outcome:notes
    };
    const leadResult=await supabaseClient.from('sales_leads').update(update).eq('id',lead.id);

    if(leadResult.error){
      console.error('Sales lead next-action update failed',leadResult.error);
      await loadSalesLeadsFromSupabase().catch(()=>{});
      setStatus(`Activity WAS logged, but the lead/next action was not updated${leadResult.error.message?`: ${leadResult.error.message}`:''}. Retry the next action before closing this lead.`,'error');
      toast('Activity logged, but next action update failed','error');
      return false;
    }

    await loadSalesLeadsFromSupabase();

    setStatus(
      outcome==='Converted'
        ?'Saved. Prospect converted — create the revenue opportunity.'
        :`Saved. Next action: ${nextAction||'Closed'}${nextFollowup?` · ${salesFormatDate(nextFollowup)}`:''}`,
      'success'
    );

    if(outcome==='Converted'){
      setTimeout(()=>openLeadOpportunityWizard(lead.id),250);
      toast('Prospect converted — create the revenue opportunity');
      return false;
    }

    toast('Sales activity saved — next action scheduled');
    // Keep success visible briefly, then return to the refreshed lead.
    setTimeout(()=>{try{viewSalesLead(lead.id);}catch(_){}},500);
    return false;
  }catch(error){
    console.error('Save Sales Activity failed',error);
    const message=String(error?.message||error||'Unknown error');
    setStatus(message,'error');
    toast(`Sales activity could not be saved: ${message}`,'error');
    return false;
  }finally{
    if(button&&button.isConnected){
      button.disabled=false;
      button.textContent=originalText||'Save Activity & Schedule Next Action';
    }
  }
}
window.saveSalesActivity=saveSalesActivity;

function openLeadOpportunityWizard(leadId) {
  const lead = DB.salesLeads.find(item => item.id === leadId);
  if (!lead) return;

  const existingCompany = DB.companies.find(company =>
    company.name.toLowerCase() === lead.companyName.toLowerCase()
  );

  openModal(`<div class="p-6">
    <h2 class="text-lg font-bold mb-1">Create Revenue Opportunity</h2>
    <p class="text-sm text-gray-500 mb-4">${esc(lead.companyName)}</p>

    <form onsubmit="createOpportunityFromLead(event,'${leadId}')" class="space-y-3">
      <div>
        <label class="text-xs font-medium text-gray-600">Opportunity Name *</label>
        <input name="title" required value="${esc(lead.companyName)} – Corporate Event"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium text-gray-600">Opportunity Type</label>
          <select name="type" class="w-full px-3 py-2 border rounded-lg text-sm">
            ${opportunityTypes().map(value => `<option>${value}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Estimated Value (£)</label>
          <input type="number" min="0" name="value" value="${lead.potentialValue || ''}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Probability %</label>
          <input type="number" min="0" max="100" name="probability" value="40"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Next Follow-Up</label>
          <input type="date" name="nextFollowup" value="${salesAddDays(currentDateStr(), 3)}"
            class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Next Action</label>
        <input name="nextAction" value="Qualify requirements and progress the opportunity"
          class="w-full px-3 py-2 border rounded-lg text-sm">
      </div>

      <input type="hidden" name="existingCompanyId" value="${existingCompany?.id || ''}">

      <button class="w-full py-2.5 bg-gold-500 text-white rounded-lg font-medium">
        Create Company & Opportunity
      </button>
    </form>
  </div>`);
}

async function createOpportunityFromLead(event, leadId) {
  event.preventDefault();

  const lead = DB.salesLeads.find(item => item.id === leadId);
  if (!lead) return;

  const form = new FormData(event.target);
  let companyId = form.get('existingCompanyId') || '';

  if (!companyId) {
    const companyRecord = {
      company_name: lead.companyName,
      industry: lead.businessType || null,
      postcode: lead.postcode || null,
      website: lead.website || null,
      phone: lead.phone || null,
      email: lead.email || null,
      assigned_to: lead.assignedTo || null,
      relationship: ['Hot', 'Strategic'].includes(lead.relationship) ? lead.relationship : 'Warm',
      annual_potential: lead.annualPotential || lead.potentialValue || 0,
      services: lead.servicesNeeded ? lead.servicesNeeded.split(',').map(value => value.trim()).filter(Boolean) : [],
      current_customer: false,
      active: true,
      last_contact: lead.lastContact || null,
      next_followup: form.get('nextFollowup') || null,
      notes: [lead.outcome, lead.notes].filter(Boolean).join('\n') || null
    };

    const companyResult = await supabaseClient.from('companies').insert(companyRecord).select().single();
    if (companyResult.error) {
      console.error(companyResult.error);
      toast('Company could not be created', 'error');
      return;
    }

    companyId = companyResult.data.id;

    if (lead.contactName) {
      await supabaseClient.from('company_contacts').insert({
        company_id: companyId,
        contact_name: lead.contactName,
        job_title: lead.jobTitle || null,
        phone: lead.phone || null,
        email: lead.email || null,
        linkedin: lead.linkedin || null,
        decision_maker: lead.decisionMaker
      });
    }
  }

  const opportunityRecord = {
    company_id: companyId,
    title: form.get('title'),
    opportunity_type: form.get('type'),
    stage: 'Qualified',
    estimated_value: Number(form.get('value')) || 0,
    probability: Number(form.get('probability')) || 40,
    assigned_to: lead.assignedTo || null,
    next_action: form.get('nextAction') || null,
    next_followup: form.get('nextFollowup') || null,
    notes: `Created from proactive sales lead: ${lead.companyName}`
  };

  const opportunityResult = await supabaseClient.from('opportunities').insert(opportunityRecord);
  if (opportunityResult.error) {
    console.error(opportunityResult.error);
    toast('Opportunity could not be created', 'error');
    return;
  }

  await supabaseClient.from('sales_leads').update({
    status: 'Converted',
    next_followup: null,
    next_action: null,
    outcome: 'Converted to company and revenue opportunity'
  }).eq('id', leadId);

  await Promise.all([
    loadSalesLeadsFromSupabase(),
    loadCompaniesFromSupabase(),
    loadOpportunitiesFromSupabase()
  ]);

  closeModal();
  navigate('opportunities');
  toast('Company and opportunity created');
}

async function convertSalesLeadToCompany(leadId) {
  const lead = DB.salesLeads.find(item => item.id === leadId);
  if (!lead) return;

  const duplicate = DB.companies.find(company =>
    company.name.toLowerCase() === lead.companyName.toLowerCase()
  );

  if (duplicate) {
    closeModal();
    navigate('companies');
    setTimeout(() => viewCompany(duplicate.id), 80);
    toast('A company record already exists', 'error');
    return;
  }

  const company = {
    company_name: lead.companyName,
    industry: lead.businessType || null,
    postcode: lead.postcode || null,
    website: lead.website || null,
    phone: lead.phone || null,
    email: lead.email || null,
    assigned_to: lead.assignedTo || null,
    relationship: ['Hot','Strategic'].includes(lead.relationship) ? lead.relationship : 'Warm',
    annual_potential: lead.annualPotential || lead.potentialValue || 0,
    services: lead.servicesNeeded ? lead.servicesNeeded.split(',').map(value => value.trim()).filter(Boolean) : [],
    current_customer: lead.status === 'Converted',
    active: true,
    last_contact: lead.lastContact || null,
    next_followup: lead.nextFollowup || null,
    notes: [lead.outcome, lead.notes].filter(Boolean).join('\n') || null
  };

  const { data, error } = await supabaseClient.from('companies').insert(company).select().single();
  if (error) {
    console.error(error);
    toast('Company record could not be created', 'error');
    return;
  }

  if (lead.contactName) {
    await supabaseClient.from('company_contacts').insert({
      company_id: data.id,
      contact_name: lead.contactName,
      job_title: lead.jobTitle || null,
      phone: lead.phone || null,
      email: lead.email || null,
      linkedin: lead.linkedin || null,
      decision_maker: lead.decisionMaker
    });
  }

  for (const activity of DB.salesActivities.filter(item => item.leadId === leadId)) {
    await supabaseClient.from('company_activities').insert({
      company_id: data.id,
      activity_type: activity.type,
      activity_date: activity.date,
      staff: activity.staff || null,
      outcome: activity.outcome || null,
      notes: activity.notes || null
    });
  }

  await supabaseClient.from('sales_leads').update({
    status: 'Converted',
    next_followup: null,
    next_action: null,
    outcome: 'Converted to permanent company record'
  }).eq('id', leadId);

  await Promise.all([loadSalesLeadsFromSupabase(), loadCompaniesFromSupabase()]);
  closeModal();
  navigate('companies');
  setTimeout(() => viewCompany(data.id), 80);
  toast('Prospect converted to company');
}

async function deleteSalesLead(id) {
  const { error } = await supabaseClient.from('sales_leads').delete().eq('id', id);
  if (error) {
    toast('Prospect could not be deleted', 'error');
    return;
  }
  await loadSalesLeadsFromSupabase();
  renderSection();
  toast('Prospect deleted');
}



// ============================================================================
// WINDMILL SALES OS — MODULAR LOADER
// Core CRUD remains in this file. The visual workspaces are loaded separately.
// ============================================================================

window.SalesOS = window.SalesOS || {
  ready: false,
  view: localStorage.getItem('windmill_sales_os_view') || 'today',
  activeLeadId: '',
  activeObjection: '',
  callGoal: localStorage.getItem('windmill_sales_call_goal') || 'Book a meeting or venue visit',
  dailyCallTarget: Number(localStorage.getItem('windmill_sales_daily_calls') || 35),
  dailyMeetingTarget: Number(localStorage.getItem('windmill_sales_daily_meetings') || 3),
  dailyProspectTarget: Number(localStorage.getItem('windmill_sales_daily_prospects') || 10),
  dailyPipelineTarget: Number(localStorage.getItem('windmill_sales_daily_pipeline') || 10000),
  firstMeetingDiscount: Number(localStorage.getItem('windmill_sales_first_meeting_discount') || 15),
  loadedModules: []
};

function salesOSModuleBasePath() {
  const current = document.currentScript?.src || '';
  if (current) return current.replace(/sales\.js(?:\?.*)?$/, 'sales-os/');
  return 'js/sales-os/';
}

function salesOSLoadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const separator = src.includes('?') ? '&' : '?';
    script.src = `${src}${separator}v=20260820-sales-os-final`;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

async function initialiseSalesOSModules() {
  if (SalesOS.ready || SalesOS.loading) return;
  SalesOS.loading = true;

  const basePath = salesOSModuleBasePath();
  const modules = [
    'sales-utils.js',
    'sales-mission.js',
    'sales-call-session.js',
    'sales-market.js',
    'sales-territory.js',
    'sales-pipeline.js',
    'sales-academy.js',
    'sales-company-intelligence.js',
    'sales-account-360.js',
    'sales-qualification.js',
    'sales-sequences.js',
    'sales-performance-engine.js',
    'sales-showcase.js',
    'sales-intelligence.js',
    'sales-opportunity-finder.js',
    'sales-database.js',
    'sales-final-qa.js',
    'sales-shell.js'
  ];

  try {
    for (const file of modules) {
      await salesOSLoadScript(basePath + file);
      SalesOS.loadedModules.push(file);
    }
    SalesOS.ready = true;
    SalesOS.loading = false;
    if (typeof renderSection === 'function' && (typeof currentSection === 'undefined' || currentSection === 'sales' || currentSection === 'sales-leads')) {
      renderSection();
    }
  } catch (error) {
    console.error('Windmill Sales OS could not be loaded:', error);
    SalesOS.loading = false;
    SalesOS.error = error.message;
    if (typeof renderSection === 'function') renderSection();
  }
}

const legacyRenderSalesLeads = renderSalesLeads;
renderSalesLeads = function renderSalesLeadsModular() {
  if (!SalesOS.ready) {
    initialiseSalesOSModules();

    return `<div class="space-y-4">
      <div class="bg-gradient-to-r from-charcoal-900 to-olive-800 text-white rounded-2xl p-6">
        <p class="text-xs font-bold tracking-widest text-gold-300">WINDMILL SALES OS</p>
        <h2 class="text-2xl font-bold mt-1">Loading proactive sales workspaces…</h2>
        <p class="text-sm text-white/70 mt-2">Today, Prospects, Pipeline, Intelligence and Performance are loading as one connected sales operating system.</p>
      </div>
      ${SalesOS.error ? `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">${esc(SalesOS.error)}</div>` : ''}
    </div>`;
  }

  return SalesOS.render();
};

initialiseSalesOSModules();



// ============================================================================
// PROSPECT RECORD — READABLE CALL HISTORY
// Converts live-call note dumps into structured, scannable session cards.
// ============================================================================

function salesProspectSplitLegacyDiscovery(text) {
  const rows = [];
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  const pattern = /([^?]+?\?):\s*(.*?)(?=\s+[^?]+?\?:|$)/g;
  let match;

  while ((match = pattern.exec(cleaned)) !== null) {
    rows.push({
      question: String(match[1] || '').trim(),
      answer: String(match[2] || '').trim()
    });
  }

  return rows;
}

function salesProspectParseStructuredSessions(notes) {
  const source = String(notes || '');
  const sessions = [];
  const marker = /--- (?:LIVE CALL SESSION|SALES OS 2 SESSION) ---([\s\S]*?)--- (?:END LIVE CALL SESSION|END SALES OS 2 SESSION) ---/gi;
  let match;

  while ((match = marker.exec(source)) !== null) {
    const body = String(match[1] || '').trim();
    const date = body.match(/^Date:\s*(.+)$/mi)?.[1]?.trim() || 'Live call';
    const section = name => {
      const regex = new RegExp(`${name}\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z ]+\\n|$)`, 'i');
      return body.match(regex)?.[1]?.trim() || '';
    };

    const discoveryText = section('DISCOVERY ANSWERS');
    const opportunitiesText = section('OPPORTUNITIES DISCUSSED');

    sessions.push({
      type: 'structured',
      date,
      callNotes: section('CALL NOTES'),
      discovery: discoveryText
        .split('\n')
        .map(line => line.replace(/^•\s*/, '').trim())
        .filter(Boolean)
        .map(line => {
          const index = line.indexOf(':');
          return index >= 0
            ? { question: line.slice(0, index).trim(), answer: line.slice(index + 1).trim() }
            : { question: '', answer: line };
        }),
      opportunities: opportunitiesText
        .split('\n')
        .map(line => line.replace(/^•\s*/, '').trim())
        .filter(Boolean),
      currentPosition: section('CURRENT POSITION')
    });
  }

  return sessions;
}

function salesProspectParseLegacySessions(notes) {
  const source = String(notes || '');
  const tokenPattern = /\[(Live call|Discovery)\s+([^\]]+)\]/gi;
  const tokens = [];
  let match;

  while ((match = tokenPattern.exec(source)) !== null) {
    tokens.push({
      type: String(match[1] || '').toLowerCase(),
      date: String(match[2] || '').trim(),
      start: tokenPattern.lastIndex,
      markerStart: match.index
    });
  }

  const sessions = [];
  tokens.forEach((token, index) => {
    const content = source
      .slice(token.start, tokens[index + 1]?.markerStart ?? source.length)
      .trim();

    if (!content) return;

    const last = sessions[sessions.length - 1];
    const sameSession = last && last.date === token.date;

    if (token.type === 'live call') {
      sessions.push({
        type: 'legacy',
        date: token.date,
        callNotes: content,
        discovery: [],
        opportunities: [],
        currentPosition: ''
      });
    } else if (sameSession) {
      last.discovery.push(...salesProspectSplitLegacyDiscovery(content));
    } else {
      sessions.push({
        type: 'legacy',
        date: token.date,
        callNotes: '',
        discovery: salesProspectSplitLegacyDiscovery(content),
        opportunities: [],
        currentPosition: ''
      });
    }
  });

  // Remove exact duplicate sessions caused by repeatedly saving the same test call.
  const seen = new Set();
  return sessions.filter(session => {
    const key = JSON.stringify({
      callNotes: session.callNotes,
      discovery: session.discovery,
      currentPosition: session.currentPosition
    }).toLowerCase();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function salesProspectNotesHTML(notes) {
  const source = String(notes || '').replace(/--- SALES OS AUTOMATION ---\s*[\s\S]*?\s*--- END SALES OS AUTOMATION ---/ig,'').trim();
  if (!source) return '';

  const structured = salesProspectParseStructuredSessions(source);
  const legacy = salesProspectParseLegacySessions(source);
  const sessions = structured.length ? structured : legacy;

  if (!sessions.length) {
    return `<section class="mb-5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-charcoal-900">Account Notes</h3>
      </div>
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 max-h-64 overflow-y-auto">
        <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">${esc(source)}</p>
      </div>
    </section>`;
  }

  return `<section class="mb-5">
    <div class="flex items-center justify-between gap-3 mb-3">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">CALL INTELLIGENCE</p>
        <h3 class="font-bold text-lg text-charcoal-900">Recorded call sessions</h3>
      </div>
      <span class="badge bg-olive-100 text-olive-800">${sessions.length} session${sessions.length === 1 ? '' : 's'}</span>
    </div>

    <div class="space-y-3 max-h-[460px] overflow-y-auto pr-1">
      ${sessions.map((session, index) => {
        const callNotes = String(session.callNotes || '').trim();
        const discovery = Array.isArray(session.discovery) ? session.discovery.filter(row => row.question || row.answer) : [];
        const opportunities = Array.isArray(session.opportunities) ? session.opportunities : [];
        const currentPosition = String(session.currentPosition || '').trim();

        return `<article class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="px-4 py-3 bg-charcoal-900 text-white flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-olive-600 flex items-center justify-center">
                <i data-lucide="phone-call" style="width:16px;height:16px"></i>
              </span>
              <div>
                <p class="font-semibold">Live Sales Call</p>
                <p class="text-[12px] text-white/65">${esc(session.date || `Session ${index + 1}`)}</p>
              </div>
            </div>
            <span class="text-xs text-white/60">#${index + 1}</span>
          </div>

          <div class="p-4 space-y-4">
            ${currentPosition ? `<div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p class="text-[12px] font-bold tracking-widest text-blue-700">CURRENT POSITION</p>
              <p class="text-sm leading-relaxed text-blue-950 mt-2 whitespace-pre-wrap">${esc(currentPosition)}</p>
            </div>` : ''}

            ${callNotes ? `<div>
              <p class="text-[12px] font-bold tracking-widest text-gray-500">CALL NOTES</p>
              <p class="text-sm leading-relaxed mt-2 whitespace-pre-wrap break-words">${esc(callNotes)}</p>
            </div>` : ''}

            ${opportunities.length ? `<div>
              <p class="text-[12px] font-bold tracking-widest text-gray-500 mb-2">OPPORTUNITIES DISCUSSED</p>
              <div class="flex flex-wrap gap-2">
                ${opportunities.map(item => `<span class="px-2.5 py-1 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold">${esc(item)}</span>`).join('')}
              </div>
            </div>` : ''}

            ${discovery.length ? `<div>
              <p class="text-[12px] font-bold tracking-widest text-gray-500 mb-2">DISCOVERY ANSWERS</p>
              <div class="grid md:grid-cols-2 gap-2">
                ${discovery.map(row => `<div class="rounded-xl bg-cream-50 border border-cream-200 p-3">
                  ${row.question ? `<p class="text-[12px] font-semibold text-gray-600">${esc(row.question)}</p>` : ''}
                  <p class="text-sm text-charcoal-900 mt-1 whitespace-pre-wrap break-words">${esc(row.answer || 'No answer recorded')}</p>
                </div>`).join('')}
              </div>
            </div>` : ''}
          </div>
        </article>`;
      }).join('')}
    </div>
  </section>`;
}

function salesProspectServicesHTML(value) {
  const services = String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  if (!services.length) return '';

  return `<section class="mb-5">
    <p class="text-xs font-bold tracking-widest text-olive-600 mb-2">POTENTIAL SERVICES</p>
    <div class="flex flex-wrap gap-2">
      ${services.map(item => `<span class="px-3 py-1.5 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold">${esc(item)}</span>`).join('')}
    </div>
  </section>`;
}

viewSalesLead = function viewSalesLeadReadable(id) {
  const lead = DB.salesLeads.find(item => item.id === id);
  if (!lead) return;

  const activities = (DB.salesActivities || [])
    .filter(activity => activity.leadId === id)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const score = salesLeadScore(lead);

  openModal(`<div class="p-6 max-w-4xl">
    <div class="flex justify-between items-start mb-5">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">PROACTIVE SALES PROSPECT</p>
        <h2 class="text-2xl font-bold">${esc(lead.companyName)}</h2>
        <p class="text-sm text-gray-500">
          ${esc(lead.contactName || 'Decision maker not identified')}
          ${lead.jobTitle ? ' · ' + esc(lead.jobTitle) : ''}
        </p>
      </div>
      <button onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100"><i data-lucide="x" style="width:20px;height:20px"></i></button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      <div class="bg-cream-50 rounded-lg p-3"><p class="text-xs text-gray-500">Stage</p><span class="badge mt-1 ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span></div>
      <div class="bg-cream-50 rounded-lg p-3"><p class="text-xs text-gray-500">Relationship</p><span class="badge mt-1 ${salesLeadRelationshipColor(lead.relationship)}">${esc(lead.relationship)}</span></div>
      <div class="bg-cream-50 rounded-lg p-3"><p class="text-xs text-gray-500">Potential</p><p class="font-bold text-gold-600">£${Number(lead.potentialValue || 0).toLocaleString()}</p></div>
      <div class="bg-cream-50 rounded-lg p-3"><p class="text-xs text-gray-500">Sales Score</p><p class="font-bold">${score}/100</p></div>
    </div>

    ${activeSalesLead(lead) ? `<div class="rounded-xl border ${salesLeadOverdue(lead) ? 'border-red-200 bg-red-50' : 'border-olive-200 bg-olive-50'} p-4 mb-5">
      <p class="text-xs uppercase tracking-wide text-gray-500">Next best action</p>
      <p class="font-bold text-charcoal-900 mt-1">${esc(salesLeadNextBestAction(lead))}</p>
      <p class="text-xs mt-2 ${salesLeadOverdue(lead) ? 'text-red-700 font-semibold' : 'text-gray-600'}">Due ${salesFormatDate(lead.nextFollowup)}</p>
    </div>` : ''}

    <div class="grid sm:grid-cols-2 gap-3 text-sm mb-5 rounded-xl border border-gray-200 p-4 bg-gray-50">
      <div><span class="text-gray-500">Phone:</span> ${esc(lead.phone || '—')}</div>
      <div><span class="text-gray-500">Email:</span> ${esc(lead.email || '—')}</div>
      <div><span class="text-gray-500">Industry:</span> ${esc(lead.businessType || '—')}</div>
      <div><span class="text-gray-500">Area:</span> ${esc(lead.postcode || '—')}</div>
      <div><span class="text-gray-500">Owner:</span> ${esc(lead.assignedTo || 'Unassigned')}</div>
      <div><span class="text-gray-500">Contact attempts:</span> ${lead.contactAttempts || 0}</div>
      <div><span class="text-gray-500">Annual potential:</span> £${Number(lead.annualPotential || 0).toLocaleString()}</div>
      <div><span class="text-gray-500">Last contact:</span> ${salesFormatDate(lead.lastContact)}</div>
    </div>

    ${salesProspectServicesHTML(lead.servicesNeeded)}

    ${lead.outcome ? `<section class="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p class="text-xs font-bold tracking-widest text-blue-700">CURRENT COMMERCIAL POSITION</p>
      <p class="text-sm leading-relaxed text-blue-950 mt-2 whitespace-pre-wrap break-words">${esc(lead.outcome)}</p>
    </section>` : ''}

    ${salesProspectNotesHTML(lead.notes)}

    <div class="flex gap-2 flex-wrap mb-6">
      ${activeSalesLead(lead) ? `<button onclick="openSalesActivityForm('${id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">Complete Next Action</button>` : ''}
      <button onclick="openLeadOpportunityWizard('${id}')" class="px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium">Create Opportunity</button>
      <button onclick="convertSalesLeadToCompany('${id}')" class="px-4 py-2 bg-charcoal-900 text-white rounded-lg text-sm font-medium">Create Company</button>
      <button onclick="openSalesLeadForm('${id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Edit</button>
    </div>

    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">CONTACT TIMELINE</p>
        <h3 class="font-bold text-lg">Logged sales activity</h3>
      </div>
      <span class="badge bg-gray-100 text-gray-700">${activities.length}</span>
    </div>

    <div class="space-y-3 max-h-80 overflow-y-auto">
      ${activities.length ? activities.map(activity => `<div class="p-4 border border-gray-200 rounded-xl bg-white">
        <div class="flex justify-between gap-3">
          <div class="flex gap-3">
            <span class="w-8 h-8 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center flex-shrink-0"><i data-lucide="${/visit/i.test(activity.type || '') ? 'map-pin' : /email/i.test(activity.type || '') ? 'mail' : 'phone-call'}" style="width:15px;height:15px"></i></span>
            <div><p class="text-sm font-semibold">${esc(activity.type)} · ${esc(activity.outcome || 'No outcome')}</p><p class="text-xs text-gray-500 mt-1">${esc(activity.staff || 'Unassigned')}</p></div>
          </div>
          <span class="text-xs text-gray-500 whitespace-nowrap">${salesFormatDate(activity.date)}</span>
        </div>
        ${activity.notes ? `<p class="text-sm leading-relaxed mt-3 pl-11 whitespace-pre-wrap break-words">${esc(activity.notes)}</p>` : ''}
      </div>`).join('') : '<div class="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">No sales activity logged yet.</div>'}
    </div>
  </div>`);

  if (window.lucide) lucide.createIcons();
};
