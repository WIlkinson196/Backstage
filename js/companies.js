// ===== COMPANY DATABASE =====
let companyTablesReady = true;

function companyRelationshipColor(value) {
  return {
    Cold: "bg-blue-100 text-blue-700",
    Warm: "bg-amber-100 text-amber-700",
    Strong: "bg-green-100 text-green-700",
    Customer: "bg-olive-100 text-olive-800",
    Dormant: "bg-gray-100 text-gray-600"
  }[value] || "bg-gray-100 text-gray-600";
}

function companyRelationships() {
  return ["Cold", "Warm", "Strong", "Customer", "Dormant"];
}

function companyServices() {
  return [
    "Meetings",
    "Conferences",
    "Christmas Parties",
    "Private Events",
    "Networking",
    "Hotel Rooms",
    "Private Dining",
    "Team Building"
  ];
}

async function loadCompaniesFromSupabase() {
  const { data, error } = await supabaseClient
    .from("companies")
    .select("*")
    .order("company_name", { ascending: true });

  if (error) {
    console.warn("Companies table is not ready:", error);
    companyTablesReady = false;
    DB.companies = [];
    DB.companyContacts = [];
    DB.companyActivities = [];
    return;
  }

  companyTablesReady = true;

  DB.companies = (data || []).map(row => ({
    id: row.id,
    name: row.company_name || "",
    industry: row.industry || "",
    address: row.address || "",
    postcode: row.postcode || "",
    website: row.website || "",
    phone: row.phone || "",
    email: row.email || "",
    assignedTo: row.assigned_to || "",
    relationship: row.relationship || "Cold",
    annualPotential: Number(row.annual_potential || 0),
    services: Array.isArray(row.services) ? row.services : [],
    currentCustomer: Boolean(row.current_customer),
    active: row.active !== false,
    lastContact: row.last_contact || "",
    nextFollowup: row.next_followup || "",
    notes: row.notes || "",
    createdAt: row.created_at || ""
  }));

  if (!DB.companies.length) {
    DB.companyContacts = [];
    DB.companyActivities = [];
    return;
  }

  const ids = DB.companies.map(company => company.id);

  const [contacts, activities] = await Promise.all([
    supabaseClient
      .from("company_contacts")
      .select("*")
      .in("company_id", ids)
      .order("created_at", { ascending: true }),
    supabaseClient
      .from("company_activities")
      .select("*")
      .in("company_id", ids)
      .order("activity_date", { ascending: false })
  ]);

  DB.companyContacts = contacts.error
    ? []
    : (contacts.data || []).map(row => ({
        id: row.id,
        companyId: row.company_id,
        name: row.contact_name || "",
        jobTitle: row.job_title || "",
        phone: row.phone || "",
        email: row.email || "",
        linkedin: row.linkedin || "",
        decisionMaker: Boolean(row.decision_maker),
        notes: row.notes || ""
      }));

  DB.companyActivities = activities.error
    ? []
    : (activities.data || []).map(row => ({
        id: row.id,
        companyId: row.company_id,
        type: row.activity_type || "Call",
        date: row.activity_date || "",
        staff: row.staff || "",
        outcome: row.outcome || "",
        notes: row.notes || ""
      }));
}

/*
 * IMPORTANT:
 * renderSection() expects renderCompanies() to RETURN HTML immediately.
 * It must not be async and must not write to a non-existent #app element.
 */
function renderCompanies() {
  return `
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <input
        id="company-search"
        type="text"
        placeholder="Search companies..."
        class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-olive-400 focus:outline-none text-sm"
        oninput="filterCompanies()"
      >

      <select
        id="company-relationship-filter"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm"
        onchange="filterCompanies()"
      >
        <option value="">All Relationships</option>
        ${companyRelationships().map(item => `<option>${esc(item)}</option>`).join("")}
      </select>

      <button
        type="button"
        onclick="openCompanyForm()"
        class="px-4 py-2 bg-olive-600 text-white rounded-lg font-medium text-sm hover:bg-olive-700 whitespace-nowrap"
      >
        + New Company
      </button>
    </div>

    ${
      !companyTablesReady
        ? `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
             The Companies database could not be loaded from Supabase.
           </div>`
        : `<div id="companies-list" class="space-y-3"></div>`
    }
  `;
}

function filterCompanies() {
  const listElement = document.getElementById("companies-list");
  if (!listElement) return;

  const search = (document.getElementById("company-search")?.value || "")
    .trim()
    .toLowerCase();

  const relationship =
    document.getElementById("company-relationship-filter")?.value || "";

  const companies = (DB.companies || [])
    .filter(company => {
      const haystack = [
        company.name,
        company.industry,
        company.email,
        company.phone,
        company.postcode,
        company.assignedTo
      ]
        .join(" ")
        .toLowerCase();

      if (search && !haystack.includes(search)) return false;
      if (relationship && company.relationship !== relationship) return false;
      return true;
    })
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  if (!companies.length) {
    listElement.innerHTML = `
      <div class="bg-white rounded-xl border border-olive-100 p-8 text-center text-gray-500">
        <p class="font-medium text-charcoal-900">No companies found</p>
        <p class="text-sm mt-1">Add a company or change the search filters.</p>
      </div>
    `;
    return;
  }

  listElement.innerHTML = companies
    .map(company => {
      const contacts = (DB.companyContacts || []).filter(
        contact => contact.companyId === company.id
      );
      const activities = (DB.companyActivities || []).filter(
        activity => activity.companyId === company.id
      );
      const primaryContact = contacts[0];
      const latestActivity = activities[0];

      return `
        <div class="bg-white rounded-xl p-4 border border-olive-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="font-semibold text-charcoal-900">${esc(company.name || "Unnamed Company")}</span>
                <span class="badge ${companyRelationshipColor(company.relationship)}">
                  ${esc(company.relationship || "Cold")}
                </span>
                ${
                  company.currentCustomer
                    ? `<span class="badge bg-green-100 text-green-700">Current Customer</span>`
                    : ""
                }
                ${
                  company.active === false
                    ? `<span class="badge bg-gray-100 text-gray-600">Inactive</span>`
                    : ""
                }
              </div>

              <div class="text-xs text-gray-500 flex flex-wrap gap-x-2 gap-y-1">
                <span>${esc(company.industry || "Industry not set")}</span>
                <span>·</span>
                <span>${esc(primaryContact?.name || "No contact added")}</span>
                <span>·</span>
                <span>${esc(company.assignedTo || "Unassigned")}</span>
                <span>·</span>
                <span class="font-medium text-gold-600">
                  £${Number(company.annualPotential || 0).toLocaleString("en-GB")} potential
                </span>
              </div>

              <p class="text-xs text-gray-500 mt-2">
                ${
                  latestActivity
                    ? `Last activity: ${esc(latestActivity.type)}${latestActivity.date ? ` · ${esc(latestActivity.date)}` : ""}`
                    : "No activity recorded"
                }
              </p>
            </div>

            <div class="flex gap-1.5 flex-shrink-0">
              <button
                type="button"
                onclick="viewCompany('${company.id}')"
                class="px-3 py-1.5 rounded-lg bg-olive-50 text-olive-700 text-xs font-medium hover:bg-olive-100"
              >
                View
              </button>

              <button
                type="button"
                onclick="openCompanyForm('${company.id}')"
                class="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  if (window.lucide) window.lucide.createIcons();
}

function viewCompany(id) {
  const company = (DB.companies || []).find(item => item.id === id);
  if (!company) return;

  const contacts = (DB.companyContacts || []).filter(
    contact => contact.companyId === id
  );
  const activities = (DB.companyActivities || []).filter(
    activity => activity.companyId === id
  );

  openModal(`
    <div class="p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start gap-3 mb-5">
        <div>
          <h2 class="text-xl font-bold text-charcoal-900">${esc(company.name)}</h2>
          <p class="text-sm text-gray-500">${esc(company.industry || "Industry not set")}</p>
        </div>
        <button type="button" onclick="closeModal()" class="p-1 hover:bg-gray-100 rounded">
          <i data-lucide="x" style="width:20px;height:20px"></i>
        </button>
      </div>

      <div class="grid sm:grid-cols-2 gap-3 text-sm mb-4">
        <div class="bg-cream-50 rounded-lg p-3">
          <p class="text-xs font-bold text-gray-500 uppercase">Relationship</p>
          <p class="mt-1">${esc(company.relationship)}</p>
        </div>
        <div class="bg-cream-50 rounded-lg p-3">
          <p class="text-xs font-bold text-gray-500 uppercase">Annual Potential</p>
          <p class="mt-1 font-semibold">£${Number(company.annualPotential || 0).toLocaleString("en-GB")}</p>
        </div>
        <div class="bg-cream-50 rounded-lg p-3">
          <p class="text-xs font-bold text-gray-500 uppercase">Contact</p>
          <p class="mt-1">${esc(company.email || "No email")}</p>
          <p>${esc(company.phone || "No telephone")}</p>
        </div>
        <div class="bg-cream-50 rounded-lg p-3">
          <p class="text-xs font-bold text-gray-500 uppercase">Owner</p>
          <p class="mt-1">${esc(company.assignedTo || "Unassigned")}</p>
        </div>
      </div>

      ${
        company.notes
          ? `<div class="bg-cream-50 rounded-lg p-3 text-sm mb-4">
               <p class="text-xs font-bold text-gray-500 uppercase">Notes</p>
               <p class="mt-1 whitespace-pre-line">${esc(company.notes)}</p>
             </div>`
          : ""
      }

      <div class="mb-4">
        <h3 class="font-bold text-charcoal-900 mb-2">Contacts (${contacts.length})</h3>
        ${
          contacts.length
            ? contacts
                .map(
                  contact => `
                    <div class="border border-gray-200 rounded-lg p-3 mb-2 text-sm">
                      <p class="font-semibold">${esc(contact.name || "Unnamed contact")}</p>
                      <p class="text-gray-500">${esc(contact.jobTitle || "")}</p>
                      <p class="text-gray-500">${esc(contact.email || "")}${contact.phone ? ` · ${esc(contact.phone)}` : ""}</p>
                    </div>
                  `
                )
                .join("")
            : `<p class="text-sm text-gray-400">No contacts recorded.</p>`
        }
      </div>

      <div>
        <h3 class="font-bold text-charcoal-900 mb-2">Recent Activity (${activities.length})</h3>
        ${
          activities.length
            ? activities
                .slice(0, 10)
                .map(
                  activity => `
                    <div class="border-l-2 border-olive-300 pl-3 py-1 mb-3 text-sm">
                      <p class="font-medium">${esc(activity.type)}${activity.outcome ? ` · ${esc(activity.outcome)}` : ""}</p>
                      <p class="text-xs text-gray-500">${esc(activity.date || "No date")}${activity.staff ? ` · ${esc(activity.staff)}` : ""}</p>
                      ${activity.notes ? `<p class="text-gray-600 mt-1">${esc(activity.notes)}</p>` : ""}
                    </div>
                  `
                )
                .join("")
            : `<p class="text-sm text-gray-400">No activities recorded.</p>`
        }
      </div>

      <div class="flex justify-end mt-5">
        <button
          type="button"
          onclick="closeModal(); openCompanyForm('${company.id}')"
          class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700"
        >
          Edit Company
        </button>
      </div>
    </div>
  `);

  if (window.lucide) window.lucide.createIcons();
}

function openCompanyForm(id = "") {
  const company = id
    ? (DB.companies || []).find(item => item.id === id)
    : null;

  openModal(`
    <div class="p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">${company ? "Edit" : "New"} Company</h2>
        <button type="button" onclick="closeModal()" class="p-1 hover:bg-gray-100 rounded">
          <i data-lucide="x" style="width:20px;height:20px"></i>
        </button>
      </div>

      <form onsubmit="saveCompanyForm(event, '${id}')" class="space-y-3">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-medium text-gray-600">Company Name *</label>
            <input name="company_name" required value="${esc(company?.name || "")}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Industry</label>
            <input name="industry" value="${esc(company?.industry || "")}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Email</label>
            <input name="email" type="email" value="${esc(company?.email || "")}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Telephone</label>
            <input name="phone" value="${esc(company?.phone || "")}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Website</label>
            <input name="website" value="${esc(company?.website || "")}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Postcode</label>
            <input name="postcode" value="${esc(company?.postcode || "")}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Relationship</label>
            <select name="relationship" class="w-full px-3 py-2 border rounded-lg text-sm">
              ${companyRelationships()
                .map(
                  item =>
                    `<option ${company?.relationship === item ? "selected" : ""}>${esc(item)}</option>`
                )
                .join("")}
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Annual Potential</label>
            <input name="annual_potential" type="number" min="0" step="0.01" value="${Number(company?.annualPotential || 0)}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Assigned To</label>
            <select name="assigned_to" class="w-full px-3 py-2 border rounded-lg text-sm">
              ${staffOptions(company?.assignedTo || "")}
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Next Follow-Up</label>
            <input name="next_followup" type="date" value="${company?.nextFollowup || ""}" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Address</label>
          <textarea name="address" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(company?.address || "")}</textarea>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Notes</label>
          <textarea name="notes" rows="4" class="w-full px-3 py-2 border rounded-lg text-sm">${esc(company?.notes || "")}</textarea>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input name="current_customer" type="checkbox" ${company?.currentCustomer ? "checked" : ""}>
          Current customer
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700">
            Save Company
          </button>
        </div>
      </form>
    </div>
  `);

  if (window.lucide) window.lucide.createIcons();
}

async function saveCompanyForm(event, id = "") {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const payload = {
    company_name: String(formData.get("company_name") || "").trim(),
    industry: String(formData.get("industry") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    website: String(formData.get("website") || "").trim() || null,
    postcode: String(formData.get("postcode") || "").trim() || null,
    address: String(formData.get("address") || "").trim() || null,
    relationship: String(formData.get("relationship") || "Cold"),
    annual_potential: Number(formData.get("annual_potential") || 0),
    assigned_to: String(formData.get("assigned_to") || "").trim() || null,
    next_followup: String(formData.get("next_followup") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
    current_customer: formData.get("current_customer") === "on",
    active: true,
    updated_at: new Date().toISOString()
  };

  let result;

  if (id) {
    result = await supabaseClient
      .from("companies")
      .update(payload)
      .eq("id", id);
  } else {
    result = await supabaseClient
      .from("companies")
      .insert(payload);
  }

  if (result.error) {
    console.error("Could not save company:", result.error);
    toast("Company could not be saved", "error");
    return;
  }

  closeModal();
  await loadCompaniesFromSupabase();
  renderSection();
  toast(id ? "Company updated" : "Company added");
}

window.renderCompanies = renderCompanies;
window.filterCompanies = filterCompanies;
window.viewCompany = viewCompany;
window.openCompanyForm = openCompanyForm;
window.saveCompanyForm = saveCompanyForm;
