
// ============================================================================
// SALES OS PHASE 3 — SHOWCASE CAMPAIGN BUILDER
// ============================================================================

SalesOS.showcaseSelectedIds = JSON.parse(
  localStorage.getItem('windmill_showcase_selected_ids') || '[]'
);

SalesOS.showcasePool = function() {
  return (DB.salesLeads || [])
    .filter(activeSalesLead)
    .map(lead => {
      const notes = `${lead.notes || ''} ${lead.outcome || ''}`.toLowerCase();
      let reason = 'Active prospect suitable for venue familiarisation';
      let score = SalesOS.priority(lead);

      if (/already have a venue|existing venue/.test(notes)) {
        reason = 'Already has a venue — ideal for a low-risk comparison visit';
        score += 25;
      } else if (/send information/.test(notes)) {
        reason = 'Information requested — seeing the venue may create stronger engagement';
        score += 18;
      } else if (/no events planned/.test(notes)) {
        reason = 'No immediate event — build familiarity before the next requirement';
        score += 12;
      } else if (lead.relationship === 'Warm' || lead.relationship === 'Hot') {
        reason = `${lead.relationship} prospect — suitable for a venue invitation`;
        score += 15;
      } else if (lead.status === 'Conversation Started') {
        reason = 'Conversation started — use the showcase to progress to a meeting';
        score += 12;
      } else if (!lead.lastContact) {
        reason = 'Uncontacted prospect — invitation creates a softer opening';
        score += 8;
      }

      return { lead, reason, score };
    })
    .sort((a, b) => b.score - a.score);
};

SalesOS.toggleShowcaseLead = function(leadId, checked) {
  const ids = new Set(SalesOS.showcaseSelectedIds);
  if (checked) ids.add(leadId);
  else ids.delete(leadId);

  SalesOS.showcaseSelectedIds = [...ids];
  localStorage.setItem('windmill_showcase_selected_ids', JSON.stringify(SalesOS.showcaseSelectedIds));
  SalesOS.refreshShowcaseSelection();
};

SalesOS.selectTopShowcaseLeads = function(count = 20) {
  SalesOS.showcaseSelectedIds = SalesOS.showcasePool().slice(0, count).map(item => item.lead.id);
  localStorage.setItem('windmill_showcase_selected_ids', JSON.stringify(SalesOS.showcaseSelectedIds));
  SalesOS.refreshShowcaseSelection();
};

SalesOS.clearShowcaseSelection = function() {
  SalesOS.showcaseSelectedIds = [];
  localStorage.setItem('windmill_showcase_selected_ids', '[]');
  SalesOS.refreshShowcaseSelection();
};

SalesOS.showcaseSelectedLeads = function() {
  const selected = new Set(SalesOS.showcaseSelectedIds);
  return SalesOS.showcasePool().filter(item => selected.has(item.lead.id));
};

SalesOS.refreshShowcaseSelection = function() {
  document.querySelectorAll('[data-showcase-checkbox]').forEach(input => {
    input.checked = SalesOS.showcaseSelectedIds.includes(input.value);
  });

  const selected = SalesOS.showcaseSelectedLeads();
  const count = document.getElementById('showcase-selected-count');
  const attendance = document.getElementById('showcase-attendance');
  const potential = document.getElementById('showcase-potential');

  if (count) count.textContent = selected.length;
  if (attendance) attendance.textContent = selected.length ? Math.max(1, Math.round(selected.length * 0.45)) : 0;
  if (potential) potential.textContent = SalesOS.money(
    selected.reduce((sum, item) => sum + Number(item.lead.annualPotential || item.lead.potentialValue || 0), 0)
  );
};

SalesOS.showcaseEmailSubject = function() {
  return 'Invitation: Windmill Farm Business Breakfast & Venue Showcase';
};

SalesOS.showcaseEmailBody = function(lead) {
  const name = lead.contactName ? lead.contactName.split(' ')[0] : 'there';
  return `Hi ${name},

We would love to invite you to a relaxed Business Breakfast and Venue Showcase at Windmill Farm.

It is an opportunity to:
- see our meeting and event spaces;
- view our flexible layouts and AV facilities;
- learn more about our catering and accommodation;
- meet the team who would look after your booking;
- experience the service before considering us for a larger event.

We are one of Lincoln's most competitively priced venue options, but we do not compromise on service or customer care.

There is no obligation to book. We would simply love the opportunity to show you what Windmill Farm can offer for a future meeting, training day, celebration or overnight requirement.

Kind regards,
The Windmill Farm Events Team`;
};

SalesOS.emailShowcaseLead = function(leadId) {
  const lead = (DB.salesLeads || []).find(item => item.id === leadId);
  if (!lead || !lead.email) {
    toast('This prospect does not have an email address', 'error');
    return;
  }

  const url = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(SalesOS.showcaseEmailSubject())}&body=${encodeURIComponent(SalesOS.showcaseEmailBody(lead))}`;
  window.location.href = url;
};

SalesOS.copyShowcaseInvite = async function(leadId) {
  const lead = (DB.salesLeads || []).find(item => item.id === leadId);
  if (!lead) return;

  try {
    await navigator.clipboard.writeText(SalesOS.showcaseEmailBody(lead));
    toast('Showcase invitation copied');
  } catch (error) {
    console.error(error);
    toast('Could not copy the invitation', 'error');
  }
};

SalesOS.renderShowcase = function() {
  const pool = SalesOS.showcasePool();
  const selected = SalesOS.showcaseSelectedLeads();
  const selectedPotential = selected.reduce(
    (sum, item) => sum + Number(item.lead.annualPotential || item.lead.potentialValue || 0),
    0
  );
  const expectedAttendance = selected.length ? Math.max(1, Math.round(selected.length * 0.45)) : 0;

  setTimeout(SalesOS.refreshShowcaseSelection, 0);

  return `<div class="bg-gradient-to-r from-amber-700 to-charcoal-900 text-white rounded-2xl p-4 lg:p-5 mb-4">
    <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-amber-200">SHOWCASE CAMPAIGN BUILDER</p>
        <h2 class="text-xl lg:text-3xl font-bold mt-1">Build an invite list and bring new businesses through the door.</h2>
        <p class="text-sm text-white/70 mt-2">Use this page to select prospects, invite them to experience the venue and turn hesitant contacts into trial meetings.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button onclick="SalesOS.selectTopShowcaseLeads(20)" class="px-4 py-2.5 bg-gold-500 text-white rounded-lg font-semibold">Select Top 20</button>
        <button onclick="SalesOS.clearShowcaseSelection()" class="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg font-semibold">Clear Selection</button>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
    ${SalesOS.kpi('Available Prospect Pool', pool.length, 'All active prospects can now be considered', 'users')}
    ${SalesOS.kpi('Selected Invitees', `<span id="showcase-selected-count">${selected.length}</span>`, 'Businesses chosen for this campaign', 'list-checks', 'blue')}
    ${SalesOS.kpi('Expected Attendance', `<span id="showcase-attendance">${expectedAttendance}</span>`, 'Estimated at 45% of selected invitees', 'user-check', 'green')}
    ${SalesOS.kpi('Selected Potential', `<span id="showcase-potential">${SalesOS.money(selectedPotential)}</span>`, 'Annual or immediate potential represented', 'badge-pound-sterling', 'gold')}
  </div>

  <div class="grid xl:grid-cols-[380px_1fr] gap-4">
    <div class="space-y-4">
      ${SalesOS.panel('Suggested event', 'A low-pressure way to demonstrate the venue',
        `<div class="rounded-xl bg-cream-50 border border-cream-200 p-4">
          <p class="text-xs font-bold tracking-widest text-olive-600">BUSINESS BREAKFAST & VENUE SHOWCASE</p>
          <p class="text-xl font-bold mt-2">Coffee, breakfast rolls and a 20-minute venue tour</p>
          <div class="space-y-2 text-sm mt-4">
            <p><strong>Audience:</strong> local organisers, office managers, HR teams and business owners</p>
            <p><strong>Length:</strong> 60–75 minutes</p>
            <p><strong>Purpose:</strong> demonstrate service, parking, layouts, catering, AV and bedrooms</p>
            <p><strong>Sales objective:</strong> secure one trial meeting or tailored follow-up from each attendee</p>
          </div>
        </div>`)}
      ${SalesOS.panel('Campaign message', 'Ready-to-use positioning',
        `<div class="rounded-xl bg-charcoal-900 text-white p-4">
          <p class="text-xs font-bold tracking-widest text-gold-300">KEY MESSAGE</p>
          <p class="text-sm leading-relaxed mt-2">“Come and experience Windmill Farm before moving any larger business. We are one of Lincoln’s most competitively priced venue options, without compromising service or customer care.”</p>
        </div>`)}
    </div>

    ${SalesOS.panel('Build the invite list', 'Select any active prospect; recommendations are ranked first',
      `<div class="space-y-3 max-h-[720px] overflow-y-auto pr-1">
        ${pool.map(item => {
          const lead = item.lead;
          const checked = SalesOS.showcaseSelectedIds.includes(lead.id);
          return `<div class="rounded-xl border ${checked ? 'border-gold-400 bg-gold-50' : 'border-gray-200 bg-white'} p-4">
            <div class="flex items-start gap-3">
              <input data-showcase-checkbox type="checkbox" value="${lead.id}" ${checked ? 'checked' : ''} onchange="SalesOS.toggleShowcaseLead('${lead.id}',this.checked)" class="mt-1">
              <div class="flex-1 min-w-0">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div class="flex gap-2 flex-wrap items-center">
                      <strong>${esc(lead.companyName)}</strong>
                      <span class="badge ${salesLeadStatusColor(lead.status)}">${esc(lead.status)}</span>
                      <span class="badge ${salesLeadRelationshipColor(lead.relationship)}">${esc(lead.relationship)}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${esc(lead.contactName || 'Decision maker missing')} · ${SalesOS.money(lead.annualPotential || lead.potentialValue)} potential</p>
                    <p class="text-sm text-gray-600 mt-2">${esc(item.reason)}</p>
                  </div>
                  <div class="flex gap-2 flex-wrap flex-shrink-0">
                    ${lead.email ? `<button onclick="SalesOS.emailShowcaseLead('${lead.id}')" class="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">Email Invite</button>` : ''}
                    <button onclick="SalesOS.copyShowcaseInvite('${lead.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold">Copy Invite</button>
                    <button onclick="SalesOS.openLiveCall('${lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-semibold">Call</button>
                    <button onclick="viewSalesLead('${lead.id}')" class="px-3 py-2 bg-olive-50 text-olive-700 rounded-lg text-xs font-semibold">Record</button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        }).join('') || '<div class="p-8 text-center text-gray-400">Add active prospects to build a showcase campaign.</div>'}
      </div>`)}
  </div>`;
};
