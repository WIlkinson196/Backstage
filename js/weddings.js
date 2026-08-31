// ===== WEDDINGS MODULE =====
let weddingTablesReady = true;
let activeWeddingId = null;
let activeWeddingTab = 'overview';
let weddingListMode = 'active';
let weddingYearFilter = '';
let weddingMonthFilter = '';
let weddingCoordinatorFilter = '';
let weddingDisplayMode = 'compact';
const collapsedWeddingMonths = new Set();

let weddingQuoteTablesReady = true;
let weddingPlanningTablesReady = true;
let weddingPaymentTablesReady = true;
let weddingTimelineTablesReady = true;
let weddingDocumentTablesReady = true;
let weddingRunningOrderTablesReady = true;
let weddingLiveModeTablesReady = true;
let weddingSeatingTablesReady = true;
let weddingFunctionSheetTablesReady = true;
let weddingFloorPlanTablesReady = true;
let weddingFloorPlanMode = 'breakfast';
let weddingFloorPlanGuestView = false;
const weddingQuoteDrafts = {};
const weddingPlanningDrafts = {};
const openPlanningSections = new Set(['ceremony']);

const WEDDING_PRICING = {
  2027: {
    packages: {
      'Bespoke': {price:0, includedDay:0, includedEvening:0, extraDay:0, extraEvening:0},
      'Evergreen': {price:2995, includedDay:0, includedEvening:60, extraDay:0, extraEvening:19},
      'Blossom': {price:4995, includedDay:50, includedEvening:100, extraDay:49, extraEvening:17.5},
      'Willow': {price:7945, includedDay:50, includedEvening:100, extraDay:74, extraEvening:19}
    },
    menus: {'None':0,'Rose Menu':69,'Peony Menu':76,'Orchid Menu':81,'Afternoon Tea Breakfast':34},
    drinks: {'None':0,'Silver':19,'Gold':26,'Platinum':30},
    eveningFood: {'None':0,'Finger Buffet':16,'Hog Roast Buffet':24,'Hog Roast Bap':18,'Barbecue':22,'Curry':15},
    extras: {'Civil Ceremony':400,'Resident DJ':400,'Chair Covers & Sash':5,'Balloon Arch':240,'LED Light Curtain':175,'LOVE Letters (4ft)':180,'Table Centrepieces':20,'Aisle Décor':30,'Floral White Hexagon Backdrop':125,'Bride & Groom Throne Chairs':145,'Mood Lighting':15,'Canapés':13,'Tea / Coffee':4,'Hot Rolls':11,'Breakfast Rolls':8}
  },
  2028: {
    packages: {
      'Bespoke': {price:0, includedDay:0, includedEvening:0, extraDay:0, extraEvening:0},
      'Evergreen': {price:3195, includedDay:0, includedEvening:60, extraDay:0, extraEvening:22},
      'Blossom': {price:5345.5, includedDay:50, includedEvening:100, extraDay:51, extraEvening:18.5},
      'Willow': {price:8045, includedDay:50, includedEvening:100, extraDay:79, extraEvening:20}
    },
    menus: {'None':0,'Rose Menu':72,'Peony Menu':78,'Orchid Menu':83,'Afternoon Tea Breakfast':35},
    drinks: {'None':0,'Silver':20,'Gold':28,'Platinum':32},
    eveningFood: {'None':0,'Finger Buffet':17,'Hog Roast Buffet':25,'Hog Roast Bap':19,'Barbecue':23,'Curry':15},
    extras: {'Civil Ceremony':400,'Resident DJ':400,'Chair Covers & Sash':5,'Balloon Arch':240,'LED Light Curtain':175,'LOVE Letters (4ft)':180,'Table Centrepieces':20,'Aisle Décor':30,'Floral White Hexagon Backdrop':125,'Bride & Groom Throne Chairs':145,'Mood Lighting':15,'Canapés':13,'Tea / Coffee':4,'Hot Rolls':11,'Breakfast Rolls':8}
  },
  2029: {
    packages: {
      'Bespoke': {price:0, includedDay:0, includedEvening:0, extraDay:0, extraEvening:0},
      'Evergreen': {price:3245, includedDay:0, includedEvening:60, extraDay:0, extraEvening:24},
      'Blossom': {price:5495, includedDay:50, includedEvening:100, extraDay:55, extraEvening:19.5},
      'Willow': {price:8145, includedDay:50, includedEvening:100, extraDay:84, extraEvening:21}
    },
    menus: {'None':0,'Rose Menu':74,'Peony Menu':80,'Orchid Menu':85,'Afternoon Tea Breakfast':36},
    drinks: {'None':0,'Silver':21,'Gold':30,'Platinum':34},
    eveningFood: {'None':0,'Finger Buffet':17.5,'Hog Roast Buffet':25,'Hog Roast Bap':25,'Barbecue':23,'Curry':15.5},
    extras: {'Civil Ceremony':400,'Resident DJ':400,'Chair Covers & Sash':5,'Balloon Arch':240,'LED Light Curtain':175,'LOVE Letters (4ft)':180,'Table Centrepieces':20,'Aisle Décor':30,'Floral White Hexagon Backdrop':125,'Bride & Groom Throne Chairs':145,'Mood Lighting':15,'Canapés':13,'Tea / Coffee':4,'Hot Rolls':11,'Breakfast Rolls':8}
  }
};

const WEDDING_TASK_TEMPLATE = [
  {title:'Record quoted price', category:'Immediate', priority:'High', dueMode:'created'},
  {title:'Deposit paid', category:'Immediate', priority:'High', dueMode:'createdPlus', days:14},
  {title:'Signed terms and conditions', category:'Immediate', priority:'High', dueMode:'createdPlus', days:14},

  // These are reset automatically when "Deposit paid" is ticked complete.
  {title:'Book first meeting', category:'Immediate', priority:'Medium', dueMode:'createdPlus', days:7},
  {title:'Complete first meeting', category:'Planning', priority:'Medium', dueMode:'createdPlus', days:14},

  // Halfway is calculated from the CRM wedding creation date to the wedding date.
  {title:'Book halfway meeting', category:'Planning', priority:'Medium', dueMode:'midpointBefore', days:30},
  {title:'Complete halfway meeting', category:'Planning', priority:'Medium', dueMode:'midpoint'},

  {title:'Invite final meeting', category:'Final Planning', priority:'High', dueBefore:70},
  {title:'Complete final meeting', category:'Final Planning', priority:'High', dueBefore:56},
  {title:'Confirm DJ', category:'Suppliers', priority:'High', dueBefore:56},
  {title:'Confirm décor order', category:'Suppliers', priority:'Medium', dueBefore:56},
  {title:'Receive ceremony music', category:'Final Planning', priority:'Medium', dueBefore:42},
  {title:'Receive seating plan', category:'Final Planning', priority:'High', dueBefore:42},
  {title:'Confirm final guest numbers', category:'Final Planning', priority:'High', dueBefore:56},
  {title:'Final balance paid', category:'Payments', priority:'High', dueBefore:56},
  {title:'Complete function sheet', category:'Operations', priority:'High', dueBefore:42},
  {title:'Wedding delivered', category:'Completion', priority:'High', dueBefore:0},
  {title:'Request review', category:'Completion', priority:'Low', dueAfter:2}
];

function weddingStatusColor(status) {
  return {
    'Confirmed': 'bg-green-100 text-green-800',
    'Planning': 'bg-blue-100 text-blue-800',
    'Final Planning': 'bg-amber-100 text-amber-800',
    'Completed': 'bg-purple-100 text-purple-800',
    'Archived': 'bg-gray-100 text-gray-600'
  }[status] || 'bg-gray-100 text-gray-700';
}

async function loadWeddingsFromSupabase() {
  const { data, error } = await supabaseClient
    .from('weddings')
    .select('*')
    .order('wedding_date', { ascending: true });

  if (error) {
    console.warn('Weddings tables are not ready:', error);
    weddingTablesReady = false;
    DB.weddings = [];
    DB.weddingTasks = [];
    return;
  }

  weddingTablesReady = true;
  DB.weddings = (data || []).map(row => ({
    id: row.id,
    enquiryId: row.enquiry_id,
    couple: row.couple_names || '',
    date: row.wedding_date || '',
    status: row.status || 'Confirmed',
    coordinator: row.coordinator || '',
    package: row.package_name || 'TBC',
    dayGuests: Number(row.day_guests || 0),
    eveningGuests: Number(row.evening_guests || 0),
    quotedValue: Number(row.quoted_value || 0),
    paid: Number(row.amount_paid || 0),
    notes: row.notes || '',
    archivedAt: row.archived_at || '',
    retentionUntil: row.retention_until || '',
    completedAt: row.completed_at || '',
    createdAt: row.created_at || ''
  }));

  if (!DB.weddings.length) {
    DB.weddingTasks = [];
    return;
  }

  const ids = DB.weddings.map(w => w.id);
  const taskResult = await supabaseClient
    .from('wedding_tasks')
    .select('*')
    .in('wedding_id', ids)
    .order('sort_order', { ascending: true });

  DB.weddingTasks = taskResult.error ? [] : (taskResult.data || []).map(row => ({
    id: row.id,
    weddingId: row.wedding_id,
    title: row.title || '',
    category: row.category || 'Planning',
    dueDate: row.due_date || '',
    completed: !!row.completed,
    completedAt: row.completed_at || '',
    sortOrder: Number(row.sort_order || 0),
    assignedTo: row.assigned_to || '',
    priority: row.priority || 'Medium',
    notes: row.notes || ''
  }));


  const quoteResult = await supabaseClient
    .from('wedding_quotes')
    .select('*')
    .in('wedding_id', ids)
    .order('version', { ascending: false });
  if (quoteResult.error) {
    console.warn('Wedding quote table is not ready:', quoteResult.error);
    weddingQuoteTablesReady = false;
    DB.weddingQuotes = [];
  } else {
    weddingQuoteTablesReady = true;
    DB.weddingQuotes = (quoteResult.data || []).map(row => ({
      id: row.id, weddingId: row.wedding_id, version: Number(row.version || 1), status: row.status || 'Draft',
      priceYear: Number(row.price_year || 2027), packageName: row.package_name || 'Bespoke',
      dayGuests: Number(row.day_guests || 0), eveningGuests: Number(row.evening_guests || 0),
      items: Array.isArray(row.items) ? row.items : [], subtotal: Number(row.subtotal || 0),
      discount: Number(row.discount || 0), total: Number(row.total || 0), notes: row.notes || '',
      createdAt: row.created_at || '', updatedAt: row.updated_at || ''
    }));
  }

  const planningResult = await supabaseClient
    .from('wedding_planning')
    .select('*')
    .in('wedding_id', ids)
    .order('section', { ascending: true });
  if (planningResult.error) {
    console.warn('Wedding planning table is not ready:', planningResult.error);
    weddingPlanningTablesReady = false;
    DB.weddingPlanning = [];
  } else {
    weddingPlanningTablesReady = true;
    DB.weddingPlanning = (planningResult.data || []).map(row => ({
      id: row.id, weddingId: row.wedding_id, section: row.section,
      data: row.data && typeof row.data === 'object' ? row.data : {},
      updatedAt: row.updated_at || ''
    }));
  }


  const paymentResult = await supabaseClient
    .from('wedding_payments')
    .select('*')
    .in('wedding_id', ids)
    .order('due_date', { ascending: true });
  if (paymentResult.error) {
    console.warn('Wedding payment table is not ready:', paymentResult.error);
    weddingPaymentTablesReady = false;
    DB.weddingPayments = [];
  } else {
    weddingPaymentTablesReady = true;
    DB.weddingPayments = (paymentResult.data || []).map(row => ({
      id: row.id, weddingId: row.wedding_id, type: row.payment_type || 'Payment',
      amount: Number(row.amount || 0), dueDate: row.due_date || '', paidDate: row.paid_date || '',
      status: row.status || 'Scheduled', method: row.method || '', reference: row.reference || '',
      notes: row.notes || '', createdAt: row.created_at || ''
    }));
    DB.weddings.forEach(w => {
      const netPaid = DB.weddingPayments.filter(x => x.weddingId === w.id && x.status === 'Paid')
        .reduce((sum, x) => sum + (x.type === 'Refund' ? -Math.abs(x.amount) : Math.abs(x.amount)), 0);
      if (DB.weddingPayments.some(x => x.weddingId === w.id)) w.paid = Math.max(0, netPaid);
    });
  }

  const timelineResult = await supabaseClient
    .from('wedding_timeline')
    .select('*')
    .in('wedding_id', ids)
    .order('created_at', { ascending: false });
  if (timelineResult.error) {
    console.warn('Wedding timeline table is not ready:', timelineResult.error);
    weddingTimelineTablesReady = false;
    DB.weddingTimeline = [];
  } else {
    weddingTimelineTablesReady = true;
    DB.weddingTimeline = (timelineResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      type: row.entry_type || 'Note',
      title: row.title || '',
      details: row.details || '',
      createdBy: row.created_by || '',
      createdAt: row.created_at || ''
    }));
  }

  const documentResult = await supabaseClient
    .from('wedding_documents')
    .select('*')
    .in('wedding_id', ids)
    .order('created_at', { ascending: false });
  if (documentResult.error) {
    console.warn('Wedding documents table is not ready:', documentResult.error);
    weddingDocumentTablesReady = false;
    DB.weddingDocuments = [];
  } else {
    weddingDocumentTablesReady = true;
    DB.weddingDocuments = (documentResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      category: row.category || 'Other',
      title: row.title || '',
      fileName: row.file_name || '',
      filePath: row.file_path || '',
      fileType: row.file_type || '',
      fileSize: Number(row.file_size || 0),
      notes: row.notes || '',
      uploadedBy: row.uploaded_by || '',
      createdAt: row.created_at || ''
    }));
  }

  const runningOrderResult = await supabaseClient
    .from('wedding_running_order')
    .select('*')
    .in('wedding_id', ids)
    .order('sort_order', { ascending: true });

  if (runningOrderResult.error) {
    console.warn('Wedding running order table is not ready:', runningOrderResult.error);
    weddingRunningOrderTablesReady = false;
    DB.weddingRunningOrder = [];
  } else {
    weddingRunningOrderTablesReady = true;
    DB.weddingRunningOrder = (runningOrderResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      title: row.title || '',
      startTime: row.start_time || '',
      duration: Number(row.duration_minutes || 0),
      responsible: row.responsible || '',
      location: row.location || '',
      notes: row.notes || '',
      completed: !!row.completed,
      actualStart: row.actual_start || '',
      actualEnd: row.actual_end || '',
      sortOrder: Number(row.sort_order || 0),
      createdAt: row.created_at || ''
    }));
  }

  const liveNotesResult = await supabaseClient
    .from('wedding_live_notes')
    .select('*')
    .in('wedding_id', ids)
    .order('created_at', { ascending: false });

  if (liveNotesResult.error) {
    console.warn('Wedding live mode table is not ready:', liveNotesResult.error);
    weddingLiveModeTablesReady = false;
    DB.weddingLiveNotes = [];
  } else {
    weddingLiveModeTablesReady = true;
    DB.weddingLiveNotes = (liveNotesResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      note: row.note || '',
      createdBy: row.created_by || '',
      createdAt: row.created_at || ''
    }));
  }

  const seatingTablesResult = await supabaseClient
    .from('wedding_seating_tables')
    .select('*')
    .in('wedding_id', ids)
    .order('sort_order', { ascending: true });

  const weddingGuestsResult = await supabaseClient
    .from('wedding_guests')
    .select('*')
    .in('wedding_id', ids)
    .order('guest_name', { ascending: true });

  if (seatingTablesResult.error || weddingGuestsResult.error) {
    console.warn('Wedding seating planner tables are not ready:', seatingTablesResult.error || weddingGuestsResult.error);
    weddingSeatingTablesReady = false;
    DB.weddingSeatingTables = [];
    DB.weddingGuests = [];
  } else {
    weddingSeatingTablesReady = true;
    DB.weddingSeatingTables = (seatingTablesResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      tableName: row.table_name || '',
      tableType: row.table_type || 'Round',
      capacity: Number(row.capacity || 8),
      sortOrder: Number(row.sort_order || 0),
      notes: row.notes || '',
      positionX: Number(row.position_x ?? 50),
      positionY: Number(row.position_y ?? 50),
      rotation: Number(row.rotation ?? 0),
      locked: Boolean(row.locked),
      colour: row.colour || '',
      visualShape: row.visual_shape || row.table_type || 'Round'
    }));
    DB.weddingGuests = (weddingGuestsResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      guestName: row.guest_name || '',
      guestType: row.guest_type || 'Adult',
      tableId: row.table_id || '',
      starterChoice: row.starter_choice || '',
      mainChoice: row.main_choice || '',
      dessertChoice: row.dessert_choice || '',
      eveningFoodChoice: row.evening_food_choice || '',
      dietaryRequirements: row.dietary_requirements || '',
      accessibilityNotes: row.accessibility_notes || '',
      notes: row.notes || ''
    }));
  }

  const functionSheetResult = await supabaseClient
    .from('wedding_function_sheets')
    .select('*')
    .in('wedding_id', ids);

  if (functionSheetResult.error) {
    console.warn('Wedding function sheet table is not ready:', functionSheetResult.error);
    weddingFunctionSheetTablesReady = false;
    DB.weddingFunctionSheets = [];
  } else {
    weddingFunctionSheetTablesReady = true;
    DB.weddingFunctionSheets = (functionSheetResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      version: Number(row.version || 1),
      preparedBy: row.prepared_by || '',
      approvedBy: row.approved_by || '',
      operationalNotes: row.operational_notes || '',
      emergencyContact: row.emergency_contact || '',
      generatedAt: row.generated_at || '',
      updatedAt: row.updated_at || ''
    }));
  }

  const floorPlanResult = await supabaseClient
    .from('wedding_floor_plan_items')
    .select('*')
    .in('wedding_id', ids)
    .order('sort_order', { ascending: true });

  if (floorPlanResult.error) {
    console.warn('Wedding floor plan table is not ready:', floorPlanResult.error);
    weddingFloorPlanTablesReady = false;
    DB.weddingFloorPlanItems = [];
  } else {
    weddingFloorPlanTablesReady = true;
    DB.weddingFloorPlanItems = (floorPlanResult.data || []).map(row => ({
      id: row.id,
      weddingId: row.wedding_id,
      itemType: row.item_type || 'round-table',
      label: row.label || '',
      x: Number(row.x_percent || 5),
      y: Number(row.y_percent || 5),
      width: Number(row.width_percent || 14),
      height: Number(row.height_percent || 14),
      rotation: Number(row.rotation_degrees || 0),
      notes: row.notes || '',
      sortOrder: Number(row.sort_order || 0)
    }));
  }

  window.setTimeout(restoreWeddingWorkspaceFromHash, 0);
}

// ===== PHASE 2: WEDDING DATA MODEL =====
// New wedding-level settings are deliberately stored in the existing wedding_planning
// JSON table under the `profile` section. This keeps Phase 2 backwards-compatible and
// avoids requiring a destructive weddings-table migration.
const WEDDING_FORMATS = {
  ceremony_reception: {label:'Ceremony & Reception — at Windmill Farm', ceremonyMode:'onsite'},
  ceremony_elsewhere: {label:'Ceremony Elsewhere + Reception at Windmill Farm', ceremonyMode:'external'},
  reception_only: {label:'Reception Only — no ceremony details required', ceremonyMode:'none'},
  evening_only: {label:'Evening Wedding', ceremonyMode:'none'},
  twilight: {label:'Twilight Wedding', ceremonyMode:'onsite'}
};

const WEDDING_CEREMONY_LOCATIONS = {
  granary: 'The Granary at Windmill Farm',
  external: 'External ceremony / church / registry office',
  none: 'No ceremony at Windmill Farm'
};

function weddingProfile(weddingOrId) {
  const weddingId = typeof weddingOrId === 'string' ? weddingOrId : weddingOrId?.id;
  const saved = weddingId ? planningData(weddingId,'profile') : {};
  // Existing weddings pre-date Phase 2. Defaulting to Ceremony & Reception preserves
  // the exact planning behaviour they had before this update until a user changes it.
  const weddingFormat = saved.weddingFormat || 'ceremony_reception';
  const inferredCeremony = WEDDING_FORMATS[weddingFormat]?.ceremonyMode || 'onsite';
  return {
    weddingFormat,
    ceremonyLocationType: saved.ceremonyLocationType || (inferredCeremony === 'onsite' ? 'granary' : inferredCeremony === 'external' ? 'external' : 'none'),
    dayMealRequired: saved.dayMealRequired ?? (weddingFormat !== 'evening_only'),
    eveningFoodRequired: saved.eveningFoodRequired ?? true,
    accommodationRequired: saved.accommodationRequired ?? true,
    djRequired: saved.djRequired ?? true,
    externalCeremonyVenue: saved.externalCeremonyVenue || '',
    externalCeremonyTime: saved.externalCeremonyTime || '',
    venueArrivalTime: saved.venueArrivalTime || ''
  };
}

function weddingHasOnsiteCeremony(weddingOrId) {
  const profile = weddingProfile(weddingOrId);
  return profile.ceremonyLocationType === 'granary' && profile.weddingFormat !== 'reception_only' && profile.weddingFormat !== 'evening_only';
}

function weddingHasAnyCeremony(weddingOrId) {
  const profile = weddingProfile(weddingOrId);
  return profile.ceremonyLocationType !== 'none' && profile.weddingFormat !== 'reception_only' && profile.weddingFormat !== 'evening_only';
}

function weddingTaskApplies(task, wedding) {
  if (!wedding || !task) return true;
  const title = String(task.title || '').toLowerCase();
  const profile = weddingProfile(wedding);
  if (!weddingHasOnsiteCeremony(wedding) && (title.includes('ceremony music') || title.includes('registrar'))) return false;
  if (profile.djRequired === false && (title === 'confirm dj' || title.includes('confirm dj'))) return false;
  return true;
}

function weddingTasksFor(id) {
  const wedding = (DB.weddings || []).find(x => x.id === id);
  return (DB.weddingTasks || []).filter(task => task.weddingId === id && weddingTaskApplies(task,wedding));
}

function weddingProgress(wedding) {
  const tasks = weddingTasksFor(wedding.id);
  if (!tasks.length) return 0;
  return Math.round(tasks.filter(task => task.completed).length / tasks.length * 100);
}

function weddingBalance(wedding) {
  return Math.max(0, Number(wedding.quotedValue || 0) - Number(wedding.paid || 0));
}

function weddingCountdown(date) {
  if (!date) return 'Date not set';
  const ms = new Date(date + 'T12:00:00') - new Date();
  const days = Math.ceil(ms / 86400000);
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'Today';
  return `${days} days`;
}

function nextWeddingTask(weddingId) {
  return weddingTasksFor(weddingId).find(task => !task.completed) || null;
}

function availableWeddingYears() {
  return [...new Set(
    (DB.weddings || [])
      .map(wedding => String(wedding.date || '').slice(0,4))
      .filter(year => /^\d{4}$/.test(year))
  )].sort();
}

function defaultWeddingYear() {
  const currentYear = String(new Date().getFullYear());
  const years = availableWeddingYears();
  if (years.includes(currentYear)) return currentYear;
  return years.find(year => year >= currentYear) || years[0] || '';
}

function setWeddingYearFilter(year) {
  weddingYearFilter = year;
  weddingMonthFilter = '';
  renderSection();
}

function setWeddingDisplayMode(mode) {
  weddingDisplayMode = mode;
  renderSection();
}

function toggleWeddingMonth(monthKey) {
  if (collapsedWeddingMonths.has(monthKey)) collapsedWeddingMonths.delete(monthKey);
  else collapsedWeddingMonths.add(monthKey);
  filterWeddings();
}

function weddingMonthName(date) {
  if (!date) return 'Date TBC';
  const parsed = new Date(date + 'T12:00:00');
  if (Number.isNaN(parsed.getTime())) return 'Date TBC';
  return parsed.toLocaleDateString('en-GB', { month:'long', year:'numeric' });
}

function weddingMonthKey(date) {
  return date && /^\d{4}-\d{2}/.test(date) ? date.slice(0,7) : 'tbc';
}

function weddingWarningSummary(wedding) {
  const tasks = weddingTasksFor(wedding.id);
  const overdue = tasks.filter(task => !task.completed && task.dueDate && task.dueDate < currentDateStr()).length;
  const missingCoordinator = !wedding.coordinator;
  const outstanding = weddingBalance(wedding);

  if (overdue) return {label:`${overdue} overdue task${overdue === 1 ? '' : 's'}`, cls:'bg-red-50 text-red-700 border-red-100'};
  if (missingCoordinator) return {label:'No coordinator', cls:'bg-amber-50 text-amber-800 border-amber-100'};
  if (outstanding > 0) return {label:`£${outstanding.toLocaleString()} outstanding`, cls:'bg-orange-50 text-orange-700 border-orange-100'};
  return null;
}

function renderWeddingCard(wedding) {
  const pct = weddingProgress(wedding);
  const next = nextWeddingTask(wedding.id);
  const warning = weddingWarningSummary(wedding);

  return `<button onclick="openWeddingWorkspace('${wedding.id}')"
    class="w-full text-left bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="font-bold text-charcoal-900 text-lg">${esc(wedding.couple)}</h3>
          <span class="badge ${weddingStatusColor(wedding.status)}">${esc(wedding.status)}</span>
          ${warning ? `<span class="px-2 py-1 text-[12px] font-semibold rounded-full border ${warning.cls}">${esc(warning.label)}</span>` : ''}
        </div>
        <p class="text-sm text-gray-500 mt-1">
          ${esc(wedding.date || 'Date TBC')} · ${esc(wedding.package || 'Package TBC')} · ${esc(wedding.coordinator || 'Unassigned')}
        </p>
        <p class="text-xs text-gray-500 mt-2">
          ${wedding.dayGuests} day / ${wedding.eveningGuests} evening
        </p>
        <div class="mt-3 rounded-lg bg-cream-50 border border-cream-200 p-3">
          <p class="text-[12px] uppercase tracking-wider font-bold text-gray-500">Next action</p>
          <p class="text-sm font-semibold text-charcoal-900 mt-1">${esc(next?.title || 'No outstanding tasks')}</p>
          ${next?.dueDate ? `<p class="text-xs text-gray-500 mt-1">Due ${esc(next.dueDate)}</p>` : ''}
        </div>
      </div>

      <div class="lg:w-52 flex-shrink-0">
        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-500">Planning</span>
          <strong class="text-olive-700">${pct}%</strong>
        </div>
        <div class="bg-gray-200 rounded-full h-2.5">
          <div class="bg-olive-500 rounded-full h-2.5" style="width:${pct}%"></div>
        </div>
        <p class="text-xl font-bold mt-4">£${Number(wedding.quotedValue || 0).toLocaleString()}</p>
        <p class="text-xs ${weddingBalance(wedding) ? 'text-orange-600' : 'text-green-600'}">
          Outstanding: £${weddingBalance(wedding).toLocaleString()}
        </p>
        <p class="text-xs text-gray-400 mt-2">${weddingCountdown(wedding.date)}</p>
      </div>
    </div>
  </button>`;
}

function renderWeddingCompactRow(wedding) {
  const pct = weddingProgress(wedding);
  const next = nextWeddingTask(wedding.id);
  const warning = weddingWarningSummary(wedding);

  return `<button onclick="openWeddingWorkspace('${wedding.id}')"
    class="w-full text-left bg-white border-b border-gray-100 last:border-b-0 px-4 py-3 hover:bg-olive-50/40 transition">
    <div class="grid grid-cols-1 lg:grid-cols-[110px_minmax(180px,1.15fr)_130px_120px_90px_minmax(180px,1fr)_120px] gap-3 items-center">
      <div>
        <p class="font-bold text-sm text-charcoal-900">${esc(wedding.date || 'TBC')}</p>
        <p class="text-[12px] text-gray-400">${weddingCountdown(wedding.date)}</p>
      </div>

      <div class="min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="font-semibold text-charcoal-900 truncate">${esc(wedding.couple)}</p>
          ${warning ? `<span class="px-2 py-0.5 text-[12px] font-semibold rounded-full border ${warning.cls}">${esc(warning.label)}</span>` : ''}
        </div>
        <p class="text-xs text-gray-500 mt-1">${esc(wedding.package || 'Package TBC')}</p>
      </div>

      <p class="text-sm text-gray-600 truncate">${esc(wedding.coordinator || 'Unassigned')}</p>
      <p class="text-sm text-gray-600">${wedding.dayGuests} / ${wedding.eveningGuests}</p>

      <div>
        <div class="flex justify-between text-[12px] mb-1"><span>Progress</span><strong>${pct}%</strong></div>
        <div class="h-2 bg-gray-200 rounded-full"><div class="h-2 bg-olive-500 rounded-full" style="width:${pct}%"></div></div>
      </div>

      <div class="min-w-0">
        <p class="text-[12px] uppercase tracking-wide text-gray-400 font-bold">Next task</p>
        <p class="text-sm font-medium text-charcoal-900 truncate">${esc(next?.title || 'No outstanding tasks')}</p>
        ${next?.dueDate ? `<p class="text-[12px] text-gray-500">Due ${esc(next.dueDate)}</p>` : ''}
      </div>

      <div class="lg:text-right">
        <p class="font-bold text-charcoal-900">£${Number(wedding.quotedValue || 0).toLocaleString()}</p>
        <p class="text-[12px] ${weddingBalance(wedding) ? 'text-orange-600' : 'text-green-600'}">
          £${weddingBalance(wedding).toLocaleString()} due
        </p>
      </div>
    </div>
  </button>`;
}

function renderWeddings() {
  if (!weddingTablesReady) {
    return `<div class="section-card max-w-3xl">
      <div class="flex items-start gap-3">
        <i data-lucide="database" class="text-olive-600 mt-1" style="width:20px;height:20px"></i>
        <div>
          <h3 class="font-bold text-charcoal-900">Wedding setup required</h3>
          <p class="text-sm text-gray-600 mt-1">Run <strong>setup-weddings.sql</strong> in Supabase, then refresh the CRM.</p>
        </div>
      </div>
    </div>`;
  }

  if (!weddingYearFilter) weddingYearFilter = defaultWeddingYear();

  const allWeddings = [...(DB.weddings || [])];
  const activeWeddings = allWeddings.filter(item => weddingListMode === 'archived' ? !!item.archivedAt : !item.archivedAt);
  const selected = activeWeddings.filter(wedding => {
    const yearMatch =
      weddingYearFilter === 'all' ||
      !weddingYearFilter ||
      String(wedding.date || '').startsWith(weddingYearFilter);

    const monthMatch =
      !weddingMonthFilter ||
      String(wedding.date || '').slice(5,7) === weddingMonthFilter;

    const coordinatorMatch =
      !weddingCoordinatorFilter ||
      wedding.coordinator === weddingCoordinatorFilter;

    return yearMatch && monthMatch && coordinatorMatch;
  });

  const totalValue = selected.reduce((sum, wedding) => sum + Number(wedding.quotedValue || 0), 0);
  const outstanding = selected.reduce((sum, wedding) => sum + weddingBalance(wedding), 0);
  const overdueTasks = selected.reduce((sum, wedding) => sum + weddingTasksFor(wedding.id)
    .filter(task => !task.completed && task.dueDate && task.dueDate < currentDateStr()).length, 0);

  const monthCounts = {};
  selected.forEach(wedding => {
    const key = weddingMonthKey(wedding.date);
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });
  const busiest = Object.entries(monthCounts).sort((a,b) => b[1]-a[1])[0];

  const years = availableWeddingYears();
  const coordinators = [...new Set(activeWeddings.map(w => w.coordinator).filter(Boolean))].sort();

  return `<div class="space-y-4">
    <div class="bg-white rounded-xl border border-olive-100 p-4 shadow-sm">
      <div class="flex flex-col xl:flex-row xl:items-center gap-3">
        <div class="flex rounded-lg bg-olive-50 p-1">
          <button onclick="weddingListMode='active';renderSection()"
            class="px-3 py-2 rounded-md text-sm font-medium ${weddingListMode==='active'?'bg-white text-olive-700 shadow-sm':'text-gray-500'}">
            Active (${allWeddings.filter(x=>!x.archivedAt).length})
          </button>
          <button onclick="weddingListMode='archived';renderSection()"
            class="px-3 py-2 rounded-md text-sm font-medium ${weddingListMode==='archived'?'bg-white text-olive-700 shadow-sm':'text-gray-500'}">
            Archive (${allWeddings.filter(x=>x.archivedAt).length})
          </button>
        </div>

        <div class="flex flex-wrap gap-2 flex-1">
          <button onclick="setWeddingYearFilter('all')"
            class="px-3 py-2 rounded-lg text-sm font-semibold ${weddingYearFilter==='all'?'bg-olive-600 text-white':'bg-gray-100 text-gray-600'}">
            All (${activeWeddings.length})
          </button>
          ${years.map(year => {
            const yearCount = activeWeddings.filter(wedding =>
              String(wedding.date || '').startsWith(year)
            ).length;

            return `<button onclick="setWeddingYearFilter('${year}')"
              class="px-3 py-2 rounded-lg text-sm font-semibold ${weddingYearFilter===year?'bg-olive-600 text-white':'bg-gray-100 text-gray-600'}">
              ${year} (${yearCount})
            </button>`;
          }).join('')}
        </div>

        ${weddingListMode==='active' ? `<button onclick="openWeddingForm()"
          class="px-4 py-2.5 bg-olive-600 text-white rounded-lg font-medium text-sm whitespace-nowrap">+ New Wedding</button>` : ''}
      </div>

      <div class="grid md:grid-cols-2 xl:grid-cols-[1fr_180px_200px_180px_auto] gap-3 mt-4 pt-4 border-t border-gray-100">
        <input id="wedding-search" oninput="filterWeddings()"
          placeholder="Search couple, package or coordinator..."
          class="px-4 py-2.5 rounded-lg border border-gray-200 text-sm">

        <select id="wedding-month" onchange="weddingMonthFilter=this.value;filterWeddings()"
          class="px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
          <option value="">All months</option>
          ${Array.from({length:12},(_,i) => {
            const month = String(i+1).padStart(2,'0');
            const label = new Date(2026,i,1).toLocaleDateString('en-GB',{month:'long'});
            return `<option value="${month}" ${weddingMonthFilter===month?'selected':''}>${label}</option>`;
          }).join('')}
        </select>

        <select id="wedding-coordinator" onchange="weddingCoordinatorFilter=this.value;filterWeddings()"
          class="px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
          <option value="">All coordinators</option>
          ${coordinators.map(name => `<option ${weddingCoordinatorFilter===name?'selected':''}>${esc(name)}</option>`).join('')}
        </select>

        <select id="wedding-status" onchange="filterWeddings()"
          class="px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
          <option value="">All statuses</option>
          ${['Confirmed','Planning','Final Planning','Completed','Archived'].map(x => `<option>${x}</option>`).join('')}
        </select>

        <div class="flex rounded-lg bg-gray-100 p-1">
          <button onclick="setWeddingDisplayMode('compact')"
            class="px-3 py-1.5 rounded-md text-xs font-semibold ${weddingDisplayMode==='compact'?'bg-white shadow-sm text-olive-700':'text-gray-500'}">
            Compact
          </button>
          <button onclick="setWeddingDisplayMode('cards')"
            class="px-3 py-1.5 rounded-md text-xs font-semibold ${weddingDisplayMode==='cards'?'bg-white shadow-sm text-olive-700':'text-gray-500'}">
            Cards
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      ${kpi('Weddings', selected.length, 'heart', 'olive')}
      ${kpi('Confirmed Value', '£' + totalValue.toLocaleString(), 'pound-sterling', 'gold')}
      ${kpi('Outstanding', '£' + outstanding.toLocaleString(), 'credit-card', 'red')}
      ${kpi('Overdue Tasks', overdueTasks, 'triangle-alert', overdueTasks ? 'red' : 'green')}
      ${kpi('Busiest Month', busiest ? weddingMonthName(busiest[0] + '-01').replace(/\s\d{4}$/,'') + ` (${busiest[1]})` : '—', 'calendar-days', 'teal')}
    </div>

    <div id="wedding-list" class="space-y-4"></div>
  </div>`;
}

function filterWeddings() {
  const q = (document.getElementById('wedding-search')?.value || '').toLowerCase();
  const status = document.getElementById('wedding-status')?.value || '';
  const month = document.getElementById('wedding-month')?.value || weddingMonthFilter;
  const coordinator = document.getElementById('wedding-coordinator')?.value || weddingCoordinatorFilter;

  weddingMonthFilter = month;
  weddingCoordinatorFilter = coordinator;

  const list = (DB.weddings || []).filter(wedding => {
    const correctArchive = weddingListMode === 'archived' ? !!wedding.archivedAt : !wedding.archivedAt;
    const yearMatch =
      weddingYearFilter === 'all' ||
      !weddingYearFilter ||
      String(wedding.date || '').startsWith(weddingYearFilter);
    const monthMatch = !month || String(wedding.date || '').slice(5,7) === month;
    const coordinatorMatch = !coordinator || wedding.coordinator === coordinator;
    const statusMatch = !status || wedding.status === status;
    const hay = [wedding.couple, wedding.date, wedding.package, wedding.coordinator].join(' ').toLowerCase();

    return correctArchive && yearMatch && monthMatch && coordinatorMatch && statusMatch && (!q || hay.includes(q));
  }).sort((a,b) => (a.date || '9999-99-99').localeCompare(b.date || '9999-99-99'));

  const grouped = {};
  list.forEach(wedding => {
    const key = weddingMonthKey(wedding.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(wedding);
  });

  const el = document.getElementById('wedding-list');
  if (!el) return;

  const groups = Object.entries(grouped).sort(([a],[b]) => {
    if (a === 'tbc') return 1;
    if (b === 'tbc') return -1;
    return a.localeCompare(b);
  });

  el.innerHTML = groups.length ? groups.map(([monthKey, weddings]) => {
    const isCollapsed = collapsedWeddingMonths.has(monthKey);
    const label = monthKey === 'tbc' ? 'Date TBC' : weddingMonthName(monthKey + '-01');
    return `<section class="bg-white rounded-xl border border-olive-100 shadow-sm overflow-hidden">
      <button onclick="toggleWeddingMonth('${monthKey}')"
        class="w-full px-4 py-3 bg-olive-50/70 border-b border-olive-100 flex items-center justify-between text-left">
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">${esc(label.toUpperCase())}</p>
          <p class="text-sm text-gray-500">${weddings.length} wedding${weddings.length === 1 ? '' : 's'}</p>
        </div>
        <i data-lucide="${isCollapsed ? 'chevron-down' : 'chevron-up'}" class="text-olive-700"></i>
      </button>

      ${isCollapsed ? '' : weddingDisplayMode === 'compact'
        ? `<div>${weddings.map(renderWeddingCompactRow).join('')}</div>`
        : `<div class="p-3 space-y-3">${weddings.map(renderWeddingCard).join('')}</div>`}
    </section>`;
  }).join('') : `<div class="section-card text-center py-12">
    <p class="font-semibold text-gray-600">No weddings match these filters</p>
    <p class="text-sm text-gray-400 mt-1">Try another year, month, coordinator or search.</p>
  </div>`;

  lucide.createIcons();
}

function ensureWeddingPanel() {
  let panel = document.getElementById('wedding-workspace');
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'wedding-workspace';
  panel.className = 'fixed inset-0 z-[70] hidden bg-[#f7f7f4]';
  panel.innerHTML = `<main id="wedding-workspace-panel" class="absolute inset-0 bg-[#f7f7f4] overflow-y-auto"></main>`;
  document.body.appendChild(panel);
  return panel;
}

function openWeddingWorkspace(id, tab = 'overview') {
  activeWeddingId = id;
  activeWeddingTab = tab;
  const panel = ensureWeddingPanel();
  panel.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if(window.AppRouter)AppRouter.commit(`/weddings/${encodeURIComponent(id)}/${encodeURIComponent(tab)}`);
  renderWeddingWorkspace();
}
function closeWeddingWorkspace() {
  document.getElementById('wedding-workspace')?.classList.add('hidden');
  document.body.style.overflow = '';
  if(window.AppRouter)AppRouter.commit('/weddings');
}
function setWeddingTab(tab) {
  activeWeddingTab = tab;
  if (activeWeddingId) {
    if(window.AppRouter)AppRouter.commit(`/weddings/${encodeURIComponent(activeWeddingId)}/${encodeURIComponent(tab)}`);
  }
  renderWeddingWorkspace();
}
function openWeddingWorkspaceInNewWindow(id,tab='overview') {
  const url = `${location.origin}${location.pathname}${location.search}#/weddings/${encodeURIComponent(id)}/${encodeURIComponent(tab)}`;
  window.open(url,'_blank','noopener');
}
function restoreWeddingWorkspaceFromHash() {
  const match = location.hash.match(/^#wedding=([^&]+)(?:&tab=([^&]+))?/);
  if (!match) return;
  const weddingId = decodeURIComponent(match[1]);
  const tab = decodeURIComponent(match[2] || 'overview');
  if ((DB.weddings || []).some(w => w.id === weddingId)) {
    openWeddingWorkspace(weddingId,tab);
  }
}

function renderWeddingWorkspace() {
  const w = DB.weddings.find(x => x.id === activeWeddingId);
  const panel = document.getElementById('wedding-workspace-panel');
  if (!w || !panel) return;

  const pct = weddingProgress(w);
  const tabs = [
    ['overview','Overview','layout-dashboard'],
    ['quote','Quote','receipt'],
    ['planning','Planning','clipboard-check'],
    ['meetings','Meetings','messages-square'],
    ['tasks','Tasks','list-checks'],
    ['payments','Payments','credit-card'],
    ['timeline','Timeline','history'],
    ['documents','Documents','files'],
    ['running-order','Running Order','clock-3'],
    ['seating','Seating','users'],
    ['floor-plan','Floor Plan','panels-top-left'],
    ['function-sheet','Function Sheet','file-text'],
    ['live','Live','radio'],
    ['closeout','Closeout','check-circle-2-big']
  ];

  panel.innerHTML = `<div class="min-h-full bg-[#f7f7f4]">
    <header class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div class="px-4 lg:px-7 py-3 flex flex-col gap-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <button onclick="closeWeddingWorkspace()"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium whitespace-nowrap">
              <i data-lucide="arrow-left" style="width:17px;height:17px"></i>
              Weddings
            </button>

            <div class="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl lg:text-2xl font-bold text-charcoal-900 truncate">${esc(w.couple)}</h1>
                <span class="badge ${weddingStatusColor(w.status)}">${esc(w.status)}</span>
              </div>
              <p class="text-xs lg:text-sm text-gray-500 mt-0.5">
                ${esc(w.date || 'Date not set')} · ${weddingCountdown(w.date)} · ${esc(w.package)}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="WindmillComms.open('Wedding','${w.id}')" class="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"><i data-lucide="mail" style="width:16px;height:16px"></i>Communications</button>
            <button onclick="openWeddingWorkspaceInNewWindow('${w.id}','${activeWeddingTab}')"
              class="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              title="Open this wedding in a separate browser tab">
              <i data-lucide="external-link" style="width:16px;height:16px"></i>
              New Window
            </button>

            ${w.archivedAt
              ? `<button onclick="restoreWedding('${w.id}')" class="px-3 py-2 bg-olive-50 text-olive-700 rounded-lg text-sm font-medium">Restore</button>
                 ${isOwnerAccount()?`<button onclick="confirmPermanentWeddingDelete('${w.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">Delete Permanently</button>`:''}`
              : `<button onclick="openWeddingForm('${w.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">Edit Wedding</button>
                 <button onclick="${window.WeddingCloseout?.archiveAllowed&&WeddingCloseout.archiveAllowed(w)?`openArchiveWeddingForm('${w.id}')`:`setWeddingTab('closeout')`}" class="hidden lg:block px-3 py-2 bg-amber-50 text-amber-800 rounded-lg text-sm font-medium">${window.WeddingCloseout?.archiveAllowed&&WeddingCloseout.archiveAllowed(w)?'Complete & Archive':'Closeout Wedding'}</button>`}

            <button onclick="closeWeddingWorkspace()" class="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close wedding">
              <i data-lucide="x"></i>
            </button>
          </div>
        </div>

        <nav class="flex gap-1 overflow-x-auto -mx-1 px-1 pb-0.5">
          ${tabs.map(([id,label,icon]) => `<button onclick="setWeddingTab('${id}')"
            class="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition
              ${activeWeddingTab===id
                ? 'border-olive-700 text-olive-800 bg-olive-50/70'
                : 'border-transparent text-gray-500 hover:text-charcoal-900 hover:bg-gray-50'}">
              <i data-lucide="${icon}" style="width:15px;height:15px"></i>
              ${label}
            </button>`).join('')}
        </nav>
      </div>
    </header>

    <div class="${activeWeddingTab === 'floor-plan' ? 'p-3 lg:p-4' : 'p-4 lg:p-7'} max-w-[1800px] mx-auto">
      ${renderWeddingTab(w, pct)}
    </div>
  </div>`;

  lucide.createIcons();
  if(activeWeddingTab==='tasks') filterWeddingTasks(w.id);
  if(activeWeddingTab==='timeline') filterWeddingTimeline(w.id);
  if(activeWeddingTab==='documents') filterWeddingDocuments(w.id);
  if(activeWeddingTab==='running-order') initialiseRunningOrderDrag(w.id);
  if(activeWeddingTab==='seating') initialiseWeddingSeatingDrag(w.id);
  if(activeWeddingTab==='floor-plan') initialiseWeddingFloorPlanBuilder(w.id);
  if(activeWeddingTab==='live') initialiseWeddingLiveMode(w.id);
}
function renderWeddingTab(w, pct) {
  if (activeWeddingTab === 'overview') {
    const next = nextWeddingTask(w.id);
    return `<div class="grid lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-xl border border-olive-100 p-5"><div class="flex justify-between mb-2"><h3 class="font-bold">Planning Progress</h3><strong class="text-olive-700">${pct}%</strong></div><div class="bg-gray-200 rounded-full h-3"><div class="bg-olive-500 h-3 rounded-full" style="width:${pct}%"></div></div></div>
        <div class="grid sm:grid-cols-2 gap-3">${overviewCard('Wedding Date',w.date||'Not set','calendar')}${overviewCard('Wedding Format',WEDDING_FORMATS[weddingProfile(w).weddingFormat]?.label||'Ceremony & Reception','heart-handshake')}${overviewCard('Coordinator',w.coordinator||'Unassigned','user')}${overviewCard('Package',w.package||'TBC','package')}${overviewCard('Guests',`${w.dayGuests} day / ${w.eveningGuests} evening`,'users')}${overviewCard('Quoted Value','£'+w.quotedValue.toLocaleString(),'pound-sterling')}${overviewCard('Outstanding','£'+weddingBalance(w).toLocaleString(),'credit-card')}</div>
      </div><div class="space-y-4"><div class="bg-white rounded-xl border border-olive-100 p-5"><p class="text-xs text-gray-500">NEXT TASK</p><p class="font-bold mt-1">${esc(next?.title||'Everything currently complete')}</p><p class="text-xs text-gray-500 mt-2">${esc(next?.category||'')}</p></div><button onclick="setWeddingTab('meetings')" class="w-full text-left bg-charcoal-900 text-white rounded-xl p-5 hover:opacity-95"><p class="text-xs font-bold tracking-widest text-olive-300">GUIDED PLANNING</p><p class="font-bold text-lg mt-1">Open Wedding Meetings</p><p class="text-xs text-gray-300 mt-2">First, Halfway and Final Meeting workflows.</p></button><div class="bg-white rounded-xl border border-olive-100 p-5"><p class="text-xs text-gray-500">NOTES</p><p class="text-sm mt-2 whitespace-pre-line">${esc(w.notes||'No notes recorded.')}</p></div></div>
    </div>`;
  }
  if (activeWeddingTab === 'tasks') return renderWeddingTasks(w);
  if (activeWeddingTab === 'quote') return renderWeddingQuoteBuilder(w);
  if (activeWeddingTab === 'planning') return renderWeddingPlanning(w);
  if (activeWeddingTab === 'meetings') return window.WeddingMeetingEngine?.render ? WeddingMeetingEngine.render(w) : placeholderTab('Guided Meetings','Phase 10 meeting engine unavailable.','messages-square');
  if (activeWeddingTab === 'payments') return renderWeddingPayments(w);
  if (activeWeddingTab === 'timeline') return renderWeddingTimeline(w);
  if (activeWeddingTab === 'documents') return renderWeddingDocuments(w);
  if (activeWeddingTab === 'running-order') return renderWeddingRunningOrder(w);
  if (activeWeddingTab === 'seating') return renderWeddingSeatingPlanner(w);
  if (activeWeddingTab === 'floor-plan') return renderWeddingFloorPlanBuilder(w);
  if (activeWeddingTab === 'function-sheet') return renderWeddingFunctionSheet(w);
  if (activeWeddingTab === 'closeout') return window.WeddingCloseout?.render ? WeddingCloseout.render(w) : placeholderTab('Wedding Closeout','Phase 12 closeout engine unavailable.','check-circle-2-big');
  return renderWeddingLiveMode(w);
}



function weddingTimelineFor(weddingId) {
  return (DB.weddingTimeline || [])
    .filter(x => x.weddingId === weddingId)
    .sort((a,b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}
function timelineIcon(type) {
  return {
    'Wedding':'heart','Quote':'receipt','Planning':'clipboard-check','Task':'list-todo',
    'Payment':'credit-card','Meeting':'calendar-days','Document':'file-text','Note':'message-square'
  }[type] || 'history';
}
function timelineBadge(type) {
  return {
    'Wedding':'bg-pink-100 text-pink-700','Quote':'bg-amber-100 text-amber-800',
    'Planning':'bg-blue-100 text-blue-700','Task':'bg-purple-100 text-purple-700',
    'Payment':'bg-green-100 text-green-700','Meeting':'bg-indigo-100 text-indigo-700',
    'Document':'bg-gray-100 text-gray-700','Note':'bg-olive-100 text-olive-800'
  }[type] || 'bg-gray-100 text-gray-700';
}
function formatTimelineDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB', {
    day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
  });
}
function renderWeddingTimeline(w) {
  if (!weddingTimelineTablesReady) {
    return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h3 class="font-bold">Timeline setup required</h3>
      <p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-timeline.sql</strong> in Supabase, then refresh.</p>
    </div>`;
  }
  const rows = weddingTimelineFor(w.id);
  const filters = [...new Set(rows.map(x=>x.type).filter(Boolean))];
  return `<div class="space-y-4">
    <div class="bg-white rounded-xl border border-olive-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div><h3 class="font-bold text-lg">Wedding Timeline</h3><p class="text-sm text-gray-500">A permanent history of quotes, planning updates, tasks, payments and notes.</p></div>
      <div class="flex flex-wrap gap-2">
        <select id="timeline-filter" onchange="filterWeddingTimeline('${w.id}')" class="px-3 py-2 border rounded-lg text-sm">
          <option value="">All activity</option>${filters.map(x=>`<option>${esc(x)}</option>`).join('')}
        </select>
        <button onclick="openWeddingTimelineForm('${w.id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">+ Add Note</button>
      </div>
    </div>
    <div id="wedding-timeline-list" class="space-y-3"></div>
  </div>`;
}
function filterWeddingTimeline(weddingId) {
  const selected = document.getElementById('timeline-filter')?.value || '';
  const rows = weddingTimelineFor(weddingId).filter(x => !selected || x.type === selected);
  const el = document.getElementById('wedding-timeline-list');
  if (!el) return;
  el.innerHTML = rows.length ? rows.map(item => `
    <div class="bg-white rounded-xl border border-olive-100 p-4 flex gap-4">
      <div class="w-10 h-10 rounded-full bg-cream-100 text-olive-700 flex items-center justify-center flex-shrink-0">
        <i data-lucide="${timelineIcon(item.type)}" style="width:18px;height:18px"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <p class="font-bold text-charcoal-900">${esc(item.title)}</p>
          <span class="badge ${timelineBadge(item.type)}">${esc(item.type)}</span>
        </div>
        ${item.details ? `<p class="text-sm text-gray-600 mt-1 whitespace-pre-line">${esc(item.details)}</p>` : ''}
        <p class="text-xs text-gray-400 mt-2">${formatTimelineDate(item.createdAt)}${item.createdBy ? ` · ${esc(item.createdBy)}` : ''}</p>
      </div>
      ${item.type === 'Note' ? `<button onclick="deleteWeddingTimelineEntry('${item.id}')" class="p-2 text-gray-400 hover:text-red-600" title="Delete note"><i data-lucide="trash-2" style="width:16px"></i></button>` : ''}
    </div>`).join('') : '<div class="section-card text-center text-gray-400 py-10">No timeline activity recorded yet.</div>';
  lucide.createIcons();
}
function openWeddingTimelineForm(weddingId) {
  const w = DB.weddings.find(x=>x.id===weddingId);
  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">${esc(w?.couple||'WEDDING')}</p><h2 class="text-lg font-bold">Add Timeline Note</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="saveWeddingTimelineNote(event,'${weddingId}')" class="space-y-3">
      <label class="text-xs font-medium text-gray-600 block">Title *<input required name="title" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Meeting completed, couple called, menu confirmed..."></label>
      <label class="text-xs font-medium text-gray-600 block">Details<textarea name="details" rows="4" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></textarea></label>
      <label class="text-xs font-medium text-gray-600 block">Recorded By<select name="createdBy" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${staffOptions('',true)}</select></label>
      <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Add to Timeline</button>
    </form>
  </div>`);
}
async function addWeddingTimelineEntry(weddingId,type,title,details='',createdBy='') {
  if (!weddingTimelineTablesReady) return;
  const { error } = await supabaseClient.from('wedding_timeline').insert({
    wedding_id:weddingId, entry_type:type, title, details:details||null, created_by:createdBy||null
  });
  if (error) console.warn('Timeline entry could not be created:', error);
}
async function saveWeddingTimelineNote(ev,weddingId) {
  ev.preventDefault();
  const f = new FormData(ev.target);
  const { error } = await supabaseClient.from('wedding_timeline').insert({
    wedding_id:weddingId, entry_type:'Note', title:f.get('title'),
    details:f.get('details')||null, created_by:f.get('createdBy')||null
  });
  if (error) { console.error(error); toast('Timeline note could not be added','error'); return; }
  closeModal(); await loadWeddingsFromSupabase(); renderWeddingWorkspace(); toast('Timeline note added');
}
async function deleteWeddingTimelineEntry(id) {
  if (!confirm('Delete this timeline note?')) return;
  const { error } = await supabaseClient.from('wedding_timeline').delete().eq('id',id).eq('entry_type','Note');
  if (error) { toast('Timeline note could not be deleted','error'); return; }
  await loadWeddingsFromSupabase(); renderWeddingWorkspace(); toast('Timeline note deleted');
}



function weddingDocumentsFor(weddingId) {
  return (DB.weddingDocuments || [])
    .filter(x => x.weddingId === weddingId)
    .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
}
function weddingDocumentCategories() {
  return ['Contract','Quote','Menu','Seating Plan','Supplier Document','Bedroom List','Payment Document','Meeting Notes','Photo','Other'];
}
function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return 'Unknown size';
  if (value < 1024) return `${value} B`;
  if (value < 1024*1024) return `${(value/1024).toFixed(1)} KB`;
  return `${(value/(1024*1024)).toFixed(1)} MB`;
}
function documentIcon(type,name='') {
  const value=(type+' '+name).toLowerCase();
  if(value.includes('pdf')) return 'file-text';
  if(value.includes('image')||/\.(png|jpe?g|webp)$/i.test(name)) return 'image';
  if(value.includes('sheet')||/\.(csv|xlsx?)$/i.test(name)) return 'table-2';
  if(value.includes('word')||/\.(docx?)$/i.test(name)) return 'file-text';
  return 'file';
}
function renderWeddingDocuments(w) {
  if (!weddingDocumentTablesReady) {
    return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h3 class="font-bold">Documents setup required</h3>
      <p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-documents.sql</strong> in Supabase, then refresh.</p>
    </div>`;
  }
  const rows=weddingDocumentsFor(w.id);
  const categories=[...new Set(rows.map(x=>x.category).filter(Boolean))];
  return `<div class="space-y-4">
    <div class="bg-charcoal-900 text-white rounded-xl p-5">
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div><p class="text-xs font-bold tracking-widest text-olive-300">THE GRANARY · WEDDING DOCUMENTS</p><h3 class="font-bold text-xl mt-1">One wedding record. Every document.</h3><p class="text-sm text-gray-300 mt-1">Customer, commercial and operational documents all use the same cleaned Planning + Quote data.</p></div>
        <div class="flex flex-wrap gap-2">
          <button onclick="printWeddingCustomerPack('${w.id}')" class="px-4 py-2.5 bg-olive-500 text-white rounded-lg text-sm font-semibold">Customer Pack</button>
          <button onclick="printWeddingQuote('${w.id}')" class="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium">Wedding Proposal</button>
        </div>
      </div>
      <div class="border-t border-white/10 mt-4 pt-4">
        <p class="text-[11px] tracking-widest font-bold text-gray-400 mb-2">OPERATIONAL HANDOVERS</p>
        <div class="flex flex-wrap gap-2">
          <button onclick="printWeddingFunctionSheet('${w.id}','full')" class="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold">Full Function</button>
          <button onclick="printWeddingFunctionSheet('${w.id}','coordinator')" class="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold">Coordinator</button>
          <button onclick="printWeddingFunctionSheet('${w.id}','kitchen')" class="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold">Kitchen</button>
          <button onclick="printWeddingFunctionSheet('${w.id}','bar')" class="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold">Bar</button>
          <button onclick="printWeddingDjHandover('${w.id}')" class="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold">DJ</button>
          <button onclick="printWeddingSupplierHandover('${w.id}')" class="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold">Suppliers</button>
          <button onclick="printWeddingPrepList('${w.id}')" class="px-3 py-2 bg-white/10 rounded-lg text-xs font-bold">Prep & Equipment</button>
        </div>
      </div>
    </div>
    ${window.WeddingDocumentHistory?.render ? WeddingDocumentHistory.render(w) : ''}
    <div class="bg-white rounded-xl border border-olive-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div><h3 class="font-bold text-lg">Stored Wedding Documents</h3><p class="text-sm text-gray-500">Uploaded/source files live here: contracts, supplier paperwork, externally supplied plans, menus and meeting attachments.</p></div>
      <button onclick="openWeddingDocumentForm('${w.id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">+ Upload Document</button>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <input id="wedding-document-search" oninput="filterWeddingDocuments('${w.id}')" placeholder="Search title, file name or notes..." class="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm">
      <select id="wedding-document-category" onchange="filterWeddingDocuments('${w.id}')" class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
        <option value="">All categories</option>${categories.map(x=>`<option>${esc(x)}</option>`).join('')}
      </select>
    </div>
    <div id="wedding-document-list" class="grid md:grid-cols-2 gap-3"></div>
  </div>`;
}
function filterWeddingDocuments(weddingId) {
  const q=(document.getElementById('wedding-document-search')?.value||'').toLowerCase();
  const category=document.getElementById('wedding-document-category')?.value||'';
  const rows=weddingDocumentsFor(weddingId).filter(x=>{
    const hay=[x.title,x.fileName,x.notes,x.category,x.uploadedBy].join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(!category||x.category===category);
  });
  const el=document.getElementById('wedding-document-list');
  if(!el)return;
  el.innerHTML=rows.length?rows.map(doc=>`
    <div class="bg-white rounded-xl border border-olive-100 p-4">
      <div class="flex gap-3 items-start">
        <div class="w-10 h-10 rounded-lg bg-cream-100 text-olive-700 flex items-center justify-center flex-shrink-0">
          <i data-lucide="${documentIcon(doc.fileType,doc.fileName)}" style="width:18px;height:18px"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2"><p class="font-bold truncate">${esc(doc.title||doc.fileName)}</p><span class="badge bg-olive-100 text-olive-800">${esc(doc.category)}</span></div>
          <p class="text-xs text-gray-500 mt-1 truncate">${esc(doc.fileName)} · ${formatFileSize(doc.fileSize)}</p>
          ${doc.notes?`<p class="text-xs text-gray-500 mt-2 line-clamp-2">${esc(doc.notes)}</p>`:''}
          <p class="text-xs text-gray-400 mt-2">${formatTimelineDate(doc.createdAt)}${doc.uploadedBy?` · ${esc(doc.uploadedBy)}`:''}</p>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button onclick="downloadWeddingDocument('${doc.id}')" class="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">Open / Download</button>
        <button onclick="deleteWeddingDocument('${doc.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">Delete</button>
      </div>
    </div>`).join(''):'<div class="md:col-span-2 section-card text-center text-gray-400 py-10">No documents match these filters.</div>';
  lucide.createIcons();
}
function openWeddingDocumentForm(weddingId) {
  const w=DB.weddings.find(x=>x.id===weddingId);
  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">${esc(w?.couple||'WEDDING')}</p><h2 class="text-lg font-bold">Upload Wedding Document</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="saveWeddingDocument(event,'${weddingId}')" class="space-y-3">
      <label class="text-xs font-medium text-gray-600 block">Document Title *<input required name="title" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Signed contract, final seating plan..."></label>
      <label class="text-xs font-medium text-gray-600 block">Category<select name="category" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${weddingDocumentCategories().map(x=>`<option>${x}</option>`).join('')}</select></label>
      <label class="text-xs font-medium text-gray-600 block">File *<input required name="file" type="file" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm bg-white" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp"></label>
      <label class="text-xs font-medium text-gray-600 block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></textarea></label>
      <label class="text-xs font-medium text-gray-600 block">Uploaded By<select name="uploadedBy" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${staffOptions('',true)}</select></label>
      <p class="text-xs text-gray-500">Maximum file size: 15 MB.</p>
      <button id="wedding-document-submit" class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Upload Document</button>
    </form>
  </div>`);
}
async function saveWeddingDocument(ev,weddingId) {
  ev.preventDefault();
  const form=ev.target;
  const f=new FormData(form);
  const file=form.elements.file.files[0];
  if(!file){toast('Choose a file to upload','error');return;}
  if(file.size>15*1024*1024){toast('File is larger than 15 MB','error');return;}
  const button=document.getElementById('wedding-document-submit');
  if(button){button.disabled=true;button.textContent='Uploading...';}
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const path=`${weddingId}/${Date.now()}-${safeName}`;
  const upload=await supabaseClient.storage.from('wedding-documents').upload(path,file,{upsert:false,contentType:file.type||undefined});
  if(upload.error){
    console.error(upload.error);
    toast('Document could not be uploaded','error');
    if(button){button.disabled=false;button.textContent='Upload Document';}
    return;
  }
  const record={
    wedding_id:weddingId,category:f.get('category'),title:f.get('title'),
    file_name:file.name,file_path:path,file_type:file.type||'',file_size:file.size,
    notes:f.get('notes')||null,uploaded_by:f.get('uploadedBy')||null
  };
  const result=await supabaseClient.from('wedding_documents').insert(record);
  if(result.error){
    console.error(result.error);
    await supabaseClient.storage.from('wedding-documents').remove([path]);
    toast('Document record could not be saved','error');
    if(button){button.disabled=false;button.textContent='Upload Document';}
    return;
  }
  await addWeddingTimelineEntry(weddingId,'Document','Document uploaded',`${f.get('title')} · ${file.name}`);
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Document uploaded');
}
async function downloadWeddingDocument(documentId) {
  const doc=(DB.weddingDocuments||[]).find(x=>x.id===documentId);
  if(!doc)return;
  const result=await supabaseClient.storage.from('wedding-documents').createSignedUrl(doc.filePath,60);
  if(result.error||!result.data?.signedUrl){console.error(result.error);toast('Document could not be opened','error');return;}
  window.open(result.data.signedUrl,'_blank','noopener');
}
async function deleteWeddingDocument(documentId) {
  const doc=(DB.weddingDocuments||[]).find(x=>x.id===documentId);
  if(!doc||!confirm(`Delete "${doc.title||doc.fileName}"?`))return;
  const storageResult=await supabaseClient.storage.from('wedding-documents').remove([doc.filePath]);
  if(storageResult.error){console.error(storageResult.error);toast('Stored file could not be deleted','error');return;}
  const dbResult=await supabaseClient.from('wedding_documents').delete().eq('id',documentId);
  if(dbResult.error){console.error(dbResult.error);toast('Document record could not be deleted','error');return;}
  await addWeddingTimelineEntry(doc.weddingId,'Document','Document deleted',doc.title||doc.fileName);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Document deleted');
}



function defaultWeddingRetentionDate(weddingDate) {
  const date=new Date((weddingDate||currentDateStr())+'T12:00:00');
  if(Number.isNaN(date.getTime()))return '';
  date.setMonth(date.getMonth()+6);
  return date.toISOString().slice(0,10);
}
function openArchiveWeddingForm(weddingId) {
  const wedding=DB.weddings.find(x=>x.id===weddingId);if(!wedding)return;
  const allowed=!window.WeddingCloseout?.archiveAllowed||WeddingCloseout.archiveAllowed(wedding);
  const blockers=window.WeddingCloseout?.archiveBlockers?WeddingCloseout.archiveBlockers(wedding):[];
  if(!allowed){
    openModal(`<div class="p-6 max-w-lg"><div class="flex justify-between gap-3 items-start"><div><p class="text-xs font-bold tracking-widest text-amber-700">WEDDING CLOSEOUT REQUIRED</p><h2 class="text-xl font-bold mt-1">${esc(wedding.couple)}</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div><div class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><strong>Archive is currently blocked.</strong><div class="mt-2 space-y-1 text-sm">${blockers.map(x=>`<div>• ${esc(x)}</div>`).join('')||'<div>• Complete the Wedding Closeout workflow first.</div>'}</div></div><button onclick="closeModal();setWeddingTab('closeout')" class="mt-4 w-full py-2.5 bg-olive-600 text-white rounded-lg font-bold">Open Wedding Closeout</button></div>`);
    return;
  }
  openModal(`<div class="p-6 max-w-lg"><div class="flex justify-between items-center mb-4"><div><p class="text-xs font-bold tracking-widest text-green-700">CLOSEOUT COMPLETE</p><h2 class="text-lg font-bold">Archive ${esc(wedding.couple)}</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
  <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900 mb-3"><strong>Wedding Closeout is complete.</strong> Archiving removes this wedding from the active pipeline but retains its planning, quotes, payments, timeline, guests and documents.</div>
  <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 mb-4">Nothing is permanently deleted by this action.</div>
  <form onsubmit="archiveWedding(event,'${weddingId}')" class="space-y-3">
    <label class="text-xs font-medium text-gray-600 block">Completion Date<input name="completedAt" type="date" value="${wedding.date||currentDateStr()}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
    <label class="text-xs font-medium text-gray-600 block">Review for Deletion<input name="retentionUntil" type="date" value="${defaultWeddingRetentionDate(wedding.date)}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
    <p class="text-xs text-gray-500">The review date is for retention review only. Nothing deletes automatically.</p>
    <button class="w-full py-2.5 bg-amber-600 text-white rounded-lg font-medium">Archive Wedding</button>
  </form></div>`);
}
async function archiveWedding(ev,weddingId) {
  ev.preventDefault();
  const wedding=DB.weddings.find(x=>x.id===weddingId);
  if(window.WeddingCloseout?.archiveAllowed && wedding && !WeddingCloseout.archiveAllowed(wedding)){
    const blockers=WeddingCloseout.archiveBlockers?.(wedding)||[];
    closeModal();setWeddingTab('closeout');toast(`Archive blocked${blockers.length?`: ${blockers.join(' · ')}`:''}`,'error');return;
  }
  const f=new FormData(ev.target);
  const update={status:'Completed',completed_at:f.get('completedAt')||currentDateStr(),archived_at:new Date().toISOString(),retention_until:f.get('retentionUntil')||null};
  const {error}=await supabaseClient.from('weddings').update(update).eq('id',weddingId);
  if(error){console.error(error);toast('Wedding could not be archived','error');return;}
  await addWeddingTimelineEntry(weddingId,'Wedding','Wedding completed and archived',update.retention_until?`Deletion review: ${update.retention_until}`:'');
  closeModal();closeWeddingWorkspace();await loadWeddingsFromSupabase();renderSection();toast('Wedding archived');
}
async function restoreWedding(weddingId) {
  const {error}=await supabaseClient.from('weddings').update({archived_at:null,retention_until:null,status:'Confirmed'}).eq('id',weddingId);
  if(error){console.error(error);toast('Wedding could not be restored','error');return;}
  await addWeddingTimelineEntry(weddingId,'Wedding','Wedding restored from archive');
  closeWeddingWorkspace();weddingListMode='active';await loadWeddingsFromSupabase();renderSection();toast('Wedding restored');
}
function confirmPermanentWeddingDelete(weddingId) {
  if(!requireOwnerPermission('permanently delete weddings')) return;
  const wedding=DB.weddings.find(x=>x.id===weddingId);if(!wedding)return;
  openModal(`<div class="p-6"><h2 class="text-lg font-bold text-red-900">Permanently Delete Wedding?</h2><p class="text-sm text-gray-600 mt-1">${esc(wedding.couple)}</p><div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-900 my-4">This permanently removes the full wedding record, planning, quotes, tasks, payments, timeline and stored documents. It cannot be undone.</div><form onsubmit="permanentlyDeleteWedding(event,'${weddingId}')" class="space-y-3"><label class="text-xs font-medium text-gray-600 block">Type <strong>DELETE</strong> to confirm<input required name="confirmation" autocomplete="off" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><button class="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium">Delete Permanently</button><button type="button" onclick="closeModal()" class="w-full py-2.5 bg-gray-100 rounded-lg font-medium">Cancel</button></form></div>`);
}
async function permanentlyDeleteWedding(ev,weddingId) {
  ev.preventDefault();
  if(!requireOwnerPermission('permanently delete weddings')) return;const f=new FormData(ev.target);
  if(String(f.get('confirmation')||'').trim()!=='DELETE'){toast('Type DELETE exactly','error');return;}
  const documents=(DB.weddingDocuments||[]).filter(x=>x.weddingId===weddingId);
  if(documents.length){
    const storage=await supabaseClient.storage.from('wedding-documents').remove(documents.map(x=>x.filePath));
    if(storage.error){console.error(storage.error);toast('Stored documents could not be deleted','error');return;}
  }
  const {error}=await supabaseClient.from('weddings').delete().eq('id',weddingId);
  if(error){console.error(error);toast('Wedding could not be deleted','error');return;}
  closeModal();closeWeddingWorkspace();await loadWeddingsFromSupabase();renderSection();toast('Wedding permanently deleted');
}



const WEDDING_RUNNING_ORDER_TEMPLATES = {
  civil:{name:'Civil Ceremony',items:[
    ['09:00','Room Setup',120,'Events Team','The Granary'],['11:00','Florist / Decorator Arrival',60,'Supplier','The Granary'],
    ['12:00','Photographer Arrival',30,'Photographer','Venue'],['12:30','Groom Arrives',30,'Coordinator','Reception'],
    ['12:45','Guests Arrive',15,'Front of House','The Granary'],['13:00','Ceremony',30,'Coordinator','Ceremony Area'],
    ['13:30','Confetti & Group Photos',30,'Photographer','Event Garden'],['14:00','Reception Drinks',60,'Bar Team','Event Garden'],
    ['15:00','Wedding Breakfast',120,'Kitchen & Events Team','The Granary'],['17:00','Speeches',45,'Coordinator','The Granary'],
    ['17:45','Cake Cutting',15,'Coordinator','The Granary'],['18:00','Room Turnaround',60,'Events Team','The Granary'],
    ['19:00','Evening Guests Arrive',30,'Front of House','The Granary'],['19:30','First Dance',15,'DJ','Dance Floor'],
    ['20:30','Evening Food',45,'Kitchen & Events Team','The Granary'],['00:00','Wedding Finish',0,'Duty Manager','The Granary']]},
  twilight:{name:'Twilight Wedding',items:[
    ['12:00','Room Setup',180,'Events Team','The Granary'],['15:00','Suppliers Arrive',60,'Coordinator','Venue'],
    ['16:00','Couple & Wedding Party Arrive',30,'Coordinator','Reception'],['16:30','Guests Arrive',30,'Front of House','The Granary'],
    ['17:00','Ceremony',30,'Coordinator','Ceremony Area'],['17:30','Reception Drinks & Photos',60,'Bar Team','Event Garden'],
    ['18:30','Speeches',30,'Coordinator','The Granary'],['19:00','Evening Reception Opens',30,'Events Team','The Granary'],
    ['19:30','First Dance',15,'DJ','Dance Floor'],['20:30','Evening Food',45,'Kitchen & Events Team','The Granary'],
    ['00:00','Wedding Finish',0,'Duty Manager','The Granary']]},
  reception:{name:'Reception Only',items:[
    ['12:00','Room Setup',180,'Events Team','The Granary'],['15:00','Suppliers Arrive',60,'Coordinator','Venue'],
    ['16:00','Couple Arrives',30,'Coordinator','Reception'],['16:30','Reception Drinks',60,'Bar Team','Event Garden'],
    ['17:30','Wedding Breakfast',120,'Kitchen & Events Team','The Granary'],['19:30','Speeches & Cake Cutting',30,'Coordinator','The Granary'],
    ['20:00','Evening Guests Arrive',30,'Front of House','The Granary'],['20:30','First Dance',15,'DJ','Dance Floor'],
    ['21:00','Evening Food',45,'Kitchen & Events Team','The Granary'],['00:00','Wedding Finish',0,'Duty Manager','The Granary']]},
  church:{name:'Church Ceremony',items:[
    ['09:00','Venue Setup',180,'Events Team','The Granary'],['12:00','Suppliers Arrive',60,'Coordinator','Venue'],
    ['13:00','Church Ceremony Begins',60,'Wedding Party','Church'],['14:15','Couple Arrives at Venue',15,'Coordinator','Reception'],
    ['14:30','Reception Drinks & Photos',90,'Bar Team','Event Garden'],['16:00','Wedding Breakfast',120,'Kitchen & Events Team','The Granary'],
    ['18:00','Speeches',45,'Coordinator','The Granary'],['18:45','Cake Cutting',15,'Coordinator','The Granary'],
    ['19:00','Evening Guests Arrive',30,'Front of House','The Granary'],['19:30','First Dance',15,'DJ','Dance Floor'],
    ['20:30','Evening Food',45,'Kitchen & Events Team','The Granary'],['00:00','Wedding Finish',0,'Duty Manager','The Granary']]}
};


// ============================================================================
// WEDDING V2 · DOCUMENT SUITE V2 — PLANNING → RUNNING ORDER
// Standard timings are generated from Planning. Manual rows remain untouched.
// Linked rows can be deliberately detached/overridden without adding schema.
// ============================================================================
const WEDDING_RUNNING_ORDER_PLAN_MARKER='[WFPLAN:';
function runningOrderPlanKey(item){
  const match=String(item?.notes||'').match(/\[WFPLAN:([^\]]+)\]/);
  return match?match[1]:'';
}
function runningOrderIsPlanLinked(item){return !!runningOrderPlanKey(item)}
function runningOrderIsPlanOverride(item){return /\[WFPLAN-OVERRIDE\]/.test(String(item?.notes||''))}
function runningOrderVisibleNotes(notes){
  return String(notes||'')
    .replace(/\[WFPLAN:[^\]]+\]/g,'')
    .replace(/\[WFPLAN-OVERRIDE\]/g,'')
    .replace(/\s{2,}/g,' ')
    .trim();
}
function runningOrderPlanNotes(key,notes='',override=false){
  return [`[WFPLAN:${key}]`,override?'[WFPLAN-OVERRIDE]':'',String(notes||'').trim()].filter(Boolean).join(' ');
}
function weddingRunningOrderPlanSpecs(wedding){
  const profile=weddingProfile(wedding);
  const ceremony=planningData(wedding.id,'ceremony');
  const reception=planningData(wedding.id,'reception');
  const specs=[];
  const add=(key,title,time,duration,responsible,location,notes='')=>{
    if(!time)return;
    specs.push({key,title,time,duration,responsible,location,notes});
  };

  if(weddingHasOnsiteCeremony(wedding)){
    add('ceremony','Ceremony',ceremony.ceremonyTime,30,'Coordinator','The Granary','Planning-linked ceremony start');
  }else if(profile.ceremonyLocationType==='external'){
    add('external-ceremony','External Ceremony',profile.externalCeremonyTime,60,'Wedding Party',profile.externalCeremonyVenue||'External venue','Reference timing — ceremony takes place away from Windmill Farm');
    add('venue-arrival','Couple / Guests Arrive at Windmill Farm',profile.venueArrivalTime||reception.arrivalTime,30,'Coordinator','Reception','Reception begins at Windmill Farm');
  }else{
    add('arrival','Guest Arrival',reception.arrivalTime,30,'Front of House','Reception');
  }

  if(profile.dayMealRequired!==false){
    add('wedding-breakfast','Wedding Breakfast',reception.weddingBreakfastTime,120,'Kitchen & Events Team','The Granary');
  }
  add('speeches','Speeches',reception.speechesTime,30,'Coordinator','The Granary');
  add('cake-cut','Cake Cutting',reception.cakeCutTime,15,'Coordinator','The Granary');
  add('first-dance','First Dance',reception.firstDanceTime,15,'DJ','Dance Floor');
  if(profile.eveningFoodRequired!==false){
    add('evening-food','Evening Food',reception.eveningFoodTime,45,'Kitchen & Events Team','The Granary');
  }

  (Array.isArray(reception.additionalTimings)?reception.additionalTimings:[]).forEach((item,index)=>{
    if(!item||!item.time)return;
    const stable=String(item.id||`additional-${index}`);
    add(`additional:${stable}`,item.label||'Additional Timing',item.time,15,'Coordinator','The Granary',item.notes||'');
  });

  add('finish','Wedding Finish',reception.finishTime,0,'Duty Manager','The Granary');
  return specs.sort((a,b)=>String(a.time).localeCompare(String(b.time)));
}
function runningOrderTemplateAliasKey(item){
  const title=String(item?.title||'').trim().toLowerCase();
  const aliases={
    'ceremony begins':'ceremony','ceremony':'ceremony',
    'church ceremony begins':'external-ceremony','external ceremony':'external-ceremony',
    'couple arrives':'venue-arrival','couple arrives at venue':'venue-arrival','couple / guests arrive at windmill farm':'venue-arrival',
    'guest arrival':'arrival','guests arrive':'arrival',
    'wedding breakfast':'wedding-breakfast',
    'speeches':'speeches','speeches & cake cutting':'speeches',
    'cake cutting':'cake-cut',
    'first dance':'first-dance',
    'evening food':'evening-food',
    'wedding finish':'finish'
  };
  return aliases[title]||'';
}
function weddingRunningOrderSyncState(wedding){
  const specs=weddingRunningOrderPlanSpecs(wedding);
  const rows=runningOrderFor(wedding.id);
  const linked=rows.filter(r=>runningOrderIsPlanLinked(r));
  const overrides=linked.filter(r=>runningOrderIsPlanOverride(r));
  const linkedKeys=new Set(linked.map(r=>runningOrderPlanKey(r)));
  const missing=specs.filter(s=>!linkedKeys.has(s.key));
  return {specs,rows,linked,overrides,missing,manual:rows.filter(r=>!runningOrderIsPlanLinked(r))};
}
async function syncWeddingRunningOrderFromPlanning(weddingId,{silent=false,adoptTemplates=true}={}){
  if(!weddingRunningOrderTablesReady)return {ok:false,reason:'Running Order table unavailable'};
  const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);
  if(!wedding)return {ok:false,reason:'Wedding not found'};

  const specs=weddingRunningOrderPlanSpecs(wedding);
  const existing=runningOrderFor(weddingId);
  const activeKeys=new Set(specs.map(x=>x.key));
  let updated=0,inserted=0,removed=0,adopted=0,skippedOverrides=0;

  // Remove planning-generated items that are no longer relevant, but never
  // delete a deliberately overridden item or a manual item.
  for(const item of existing){
    const key=runningOrderPlanKey(item);
    if(key&&!activeKeys.has(key)&&!runningOrderIsPlanOverride(item)){
      const {error}=await supabaseClient.from('wedding_running_order').delete().eq('id',item.id);
      if(!error)removed++;
    }
  }

  for(let index=0;index<specs.length;index++){
    const spec=specs[index];
    let item=existing.find(r=>runningOrderPlanKey(r)===spec.key);

    // First V2 sync can adopt obvious rows created by the old built-in templates.
    // This prevents duplicate "Wedding Breakfast", "First Dance", etc.
    if(!item&&adoptTemplates){
      item=existing.find(r=>!runningOrderIsPlanLinked(r)&&runningOrderTemplateAliasKey(r)===spec.key);
      if(item){
        const notes=runningOrderPlanNotes(spec.key,runningOrderVisibleNotes(item.notes)||spec.notes,false);
        const {error}=await supabaseClient.from('wedding_running_order').update({notes}).eq('id',item.id);
        if(!error){item={...item,notes};adopted++;}
      }
    }

    if(item){
      if(runningOrderIsPlanOverride(item)){skippedOverrides++;continue;}
      const payload={
        title:spec.title,
        start_time:spec.time,
        duration_minutes:Number(item.duration||spec.duration||0) || Number(spec.duration||0),
        responsible:item.responsible||spec.responsible||null,
        location:item.location||spec.location||null,
        notes:runningOrderPlanNotes(spec.key,runningOrderVisibleNotes(item.notes)||spec.notes,false)
      };
      const {error}=await supabaseClient.from('wedding_running_order').update(payload).eq('id',item.id);
      if(error){console.error('Planning → Running Order update failed',error);return {ok:false,reason:error.message||'Update failed'};}
      updated++;
    }else{
      const payload={
        wedding_id:weddingId,
        title:spec.title,
        start_time:spec.time,
        duration_minutes:spec.duration,
        responsible:spec.responsible||null,
        location:spec.location||null,
        notes:runningOrderPlanNotes(spec.key,spec.notes,false),
        sort_order:index
      };
      const {error}=await supabaseClient.from('wedding_running_order').insert(payload);
      if(error){console.error('Planning → Running Order insert failed',error);return {ok:false,reason:error.message||'Insert failed'};}
      inserted++;
    }
  }

  if(!silent){
    toast(`Running Order synced from Planning · ${inserted} added · ${updated} updated${skippedOverrides?` · ${skippedOverrides} override${skippedOverrides===1?'':'s'} preserved`:''}`);
  }
  return {ok:true,inserted,updated,removed,adopted,skippedOverrides};
}
async function manuallySyncWeddingRunningOrder(weddingId){
  const result=await syncWeddingRunningOrderFromPlanning(weddingId,{silent:false,adoptTemplates:true});
  if(!result.ok){toast(`Running Order sync failed: ${result.reason}`,'error');return;}
  await loadWeddingsFromSupabase();renderWeddingWorkspace();
}
async function setRunningOrderPlanningLink(itemId,linked){
  const item=(DB.weddingRunningOrder||[]).find(x=>x.id===itemId);if(!item)return;
  const key=runningOrderPlanKey(item);
  if(!key)return;
  const visible=runningOrderVisibleNotes(item.notes);
  const notes=runningOrderPlanNotes(key,visible,!linked);
  const {error}=await supabaseClient.from('wedding_running_order').update({notes}).eq('id',itemId);
  if(error){toast('Planning link could not be changed','error');return;}
  await loadWeddingsFromSupabase();renderWeddingWorkspace();
  toast(linked?'Running Order item re-linked to Planning':'Manual override enabled for this item');
}

function runningOrderFor(weddingId){
  return (DB.weddingRunningOrder||[]).filter(x=>x.weddingId===weddingId)
    .sort((a,b)=>a.sortOrder-b.sortOrder||String(a.startTime).localeCompare(String(b.startTime)));
}
function runningOrderEndTime(item){
  if(!item.startTime||!item.duration)return '';
  const [h,m]=item.startTime.split(':').map(Number), total=h*60+m+Number(item.duration||0);
  return `${String(Math.floor(total/60)%24).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
function renderWeddingRunningOrder(wedding){
  if(!weddingRunningOrderTablesReady)return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5"><h3 class="font-bold">Running Order setup required</h3><p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-running-order.sql</strong> in Supabase, then refresh.</p></div>`;
  const rows=runningOrderFor(wedding.id),progress=rows.length?Math.round(rows.filter(x=>x.completed).length/rows.length*100):0;
  const sync=weddingRunningOrderSyncState(wedding);
  return `<div class="space-y-4">
    <div class="rounded-xl border ${sync.missing.length?'border-amber-200 bg-amber-50':'border-green-200 bg-green-50'} p-4 flex flex-wrap justify-between gap-3 items-center">
      <div><p class="text-xs font-bold tracking-widest ${sync.missing.length?'text-amber-700':'text-green-700'}">PLANNING SYNC</p><p class="font-bold mt-1">${sync.linked.length} linked · ${sync.manual.length} manual · ${sync.overrides.length} overridden</p><p class="text-xs text-gray-500 mt-1">${sync.missing.length?`${sync.missing.length} Planning timing${sync.missing.length===1?' is':'s are'} not yet linked.`:'Running Order is aligned with the current Planning timings.'}</p></div>
      <button onclick="manuallySyncWeddingRunningOrder('${wedding.id}')" class="px-4 py-2.5 ${sync.missing.length?'bg-amber-600':'bg-olive-600'} text-white rounded-lg text-sm font-bold"><i data-lucide="refresh-cw" class="inline mr-1" style="width:14px"></i> Sync from Planning</button>
    </div>
    <div class="bg-white rounded-xl border border-olive-100 p-5">
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4"><div><h3 class="font-bold text-lg">Wedding Running Order</h3><p class="text-sm text-gray-500">Planning controls standard timings. Manual events can still be added, reordered and deliberately overridden.</p></div>
    <div class="flex flex-wrap gap-2"><select id="running-order-template" class="px-3 py-2 border rounded-lg text-sm"><option value="">Choose template...</option>${Object.entries(WEDDING_RUNNING_ORDER_TEMPLATES).map(([id,t])=>`<option value="${id}">${esc(t.name)}</option>`).join('')}</select>
    <button onclick="applyWeddingRunningOrderTemplate('${wedding.id}')" class="px-3 py-2 bg-cream-100 text-olive-800 rounded-lg text-sm font-medium">Apply Template</button>
    <button onclick="recalculateWeddingRunningOrder('${wedding.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">Recalculate Times</button>
    <button onclick="printWeddingRunningOrder('${wedding.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">Print</button>
    <button onclick="openWeddingRunningOrderForm('${wedding.id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">+ Add Event</button></div></div>
    <div class="mt-4 flex items-center gap-3"><div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-olive-500 rounded-full" style="width:${progress}%"></div></div><strong class="text-sm text-olive-700">${progress}%</strong></div></div>
    ${rows.length?`<div class="bg-white rounded-xl border border-olive-100 overflow-hidden"><div id="running-order-list">${rows.map(renderRunningOrderRow).join('')}</div></div>`:`<div class="bg-white rounded-xl border border-dashed border-olive-200 p-10 text-center"><h3 class="font-bold">No running order yet</h3><p class="text-sm text-gray-500 mt-1">Choose a template or add the first event.</p></div>`}</div>`;
}
function renderRunningOrderRow(item){
  const end=runningOrderEndTime(item),linked=runningOrderIsPlanLinked(item),override=runningOrderIsPlanOverride(item),visibleNotes=runningOrderVisibleNotes(item.notes);
  return `<div draggable="true" data-running-order-id="${item.id}" class="running-order-row border-t border-gray-100 px-4 py-3 ${item.completed?'bg-green-50/50':''}">
  <div class="grid lg:grid-cols-[32px_90px_1fr_100px_150px_140px_120px] gap-3 items-center">
  <button class="cursor-grab text-gray-400"><i data-lucide="grip-vertical" style="width:18px"></i></button>
  <div><p class="font-bold">${esc(item.startTime||'--:--')}</p>${end?`<p class="text-xs text-gray-400">to ${esc(end)}</p>`:''}</div>
  <button onclick="openWeddingRunningOrderForm('${item.weddingId}','${item.id}')" class="text-left"><div class="flex items-center gap-2"><p class="font-bold ${item.completed?'line-through text-gray-500':''}">${esc(item.title)}</p>${linked?`<span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${override?'bg-amber-100 text-amber-800':'bg-olive-100 text-olive-800'}">${override?'MANUAL OVERRIDE':'PLANNING'}</span>`:'<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">MANUAL</span>'}</div>${visibleNotes?`<p class="text-xs text-gray-500 truncate">${esc(visibleNotes)}</p>`:''}</button>
  <p class="text-sm text-gray-600">${item.duration?`${item.duration} min`:'—'}</p><p class="text-sm text-gray-600 truncate">${esc(item.responsible||'—')}</p><p class="text-sm text-gray-600 truncate">${esc(item.location||'—')}</p>
  <div class="flex items-center justify-between gap-2"><button onclick="toggleRunningOrderComplete('${item.id}',${!item.completed})" class="px-2.5 py-1.5 rounded-lg text-xs font-bold ${item.completed?'bg-green-100 text-green-800':'bg-gray-100 text-gray-600'}">${item.completed?'Complete':'Pending'}</button><button onclick="deleteWeddingRunningOrderItem('${item.id}')" class="text-gray-400 hover:text-red-600"><i data-lucide="trash-2" style="width:15px"></i></button></div></div></div>`;
}
function openWeddingRunningOrderForm(weddingId,itemId=''){
  const item=(DB.weddingRunningOrder||[]).find(x=>x.id===itemId);
  const linked=item&&runningOrderIsPlanLinked(item),override=item&&runningOrderIsPlanOverride(item);
  openModal(`<div class="p-6 max-w-xl"><div class="flex justify-between items-center mb-4"><div><h2 class="text-lg font-bold">${item?'Edit Event':'Add Manual Event'}</h2>${linked?`<p class="text-xs mt-1 ${override?'text-amber-700':'text-olive-700'}">${override?'This item is deliberately overriding Planning.':'This standard timing is linked to Wedding Planning.'}</p>`:'<p class="text-xs text-gray-500 mt-1">Manual events are preserved when Planning is synced.</p>'}</div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
  <form onsubmit="saveWeddingRunningOrderItem(event,'${weddingId}','${itemId}')" class="space-y-3">
  <label class="text-xs font-medium block">Event *<input required name="title" value="${esc(item?.title||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
  <div class="grid grid-cols-2 gap-3"><label class="text-xs font-medium block">Start Time *<input required name="startTime" type="time" value="${esc(item?.startTime||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs font-medium block">Duration (minutes)<input name="duration" type="number" min="0" step="5" value="${item?.duration||0}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label></div>
  <div class="grid grid-cols-2 gap-3"><label class="text-xs font-medium block">Responsible<input name="responsible" value="${esc(item?.responsible||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs font-medium block">Location<input name="location" value="${esc(item?.location||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label></div>
  <label class="text-xs font-medium block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg">${esc(runningOrderVisibleNotes(item?.notes||''))}</textarea></label>
  ${linked?`<label class="flex items-start gap-3 rounded-lg border ${override?'border-amber-200 bg-amber-50':'border-olive-200 bg-olive-50'} p-3"><input name="planningLinked" type="checkbox" ${override?'':'checked'} class="mt-0.5"><span><strong class="block text-sm">Keep this timing linked to Planning</strong><span class="text-xs text-gray-500">Untick this only when the Running Order needs a deliberate different time. Future Planning syncs will then leave this row alone.</span></span></label>`:''}
  <input type="hidden" name="planKey" value="${esc(linked?runningOrderPlanKey(item):'')}">
  <input type="hidden" name="sortOrder" value="${item?.sortOrder??runningOrderFor(weddingId).length}"><button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">${item?'Save Changes':'Add Manual Event'}</button></form></div>`);
}
async function saveWeddingRunningOrderItem(ev,weddingId,itemId=''){
  ev.preventDefault();
  const f=new FormData(ev.target),planKey=String(f.get('planKey')||''),linked=!!planKey&&f.get('planningLinked')==='on';
  const visibleNotes=String(f.get('notes')||'').trim();
  const record={wedding_id:weddingId,title:String(f.get('title')||'').trim(),start_time:f.get('startTime'),duration_minutes:Number(f.get('duration')||0),responsible:f.get('responsible')||null,location:f.get('location')||null,notes:planKey?runningOrderPlanNotes(planKey,visibleNotes,!linked):(visibleNotes||null),sort_order:Number(f.get('sortOrder')||0)};
  const result=itemId?await supabaseClient.from('wedding_running_order').update(record).eq('id',itemId):await supabaseClient.from('wedding_running_order').insert(record);
  if(result.error){console.error(result.error);toast('Event could not be saved','error');return;}
  await addWeddingTimelineEntry(weddingId,'Planning',itemId?'Running order event updated':'Running order event added',`${record.start_time} · ${record.title}`);
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(itemId?'Event updated':'Event added');
}
async function deleteWeddingRunningOrderItem(id){
  const item=(DB.weddingRunningOrder||[]).find(x=>x.id===id);if(!item||!confirm(`Delete "${item.title}"?`))return;
  const {error}=await supabaseClient.from('wedding_running_order').delete().eq('id',id);if(error){toast('Event could not be deleted','error');return;}
  await addWeddingTimelineEntry(item.weddingId,'Planning','Running order event deleted',item.title);await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Event deleted');
}
async function toggleRunningOrderComplete(id,completed){
  const item=(DB.weddingRunningOrder||[]).find(x=>x.id===id);if(!item)return;
  const {error}=await supabaseClient.from('wedding_running_order').update({completed,actual_end:completed?new Date().toISOString():null}).eq('id',id);
  if(error){toast('Status could not be updated','error');return;}await loadWeddingsFromSupabase();renderWeddingWorkspace();
}
async function applyWeddingRunningOrderTemplate(weddingId){
  const template=WEDDING_RUNNING_ORDER_TEMPLATES[document.getElementById('running-order-template')?.value];
  if(!template){toast('Choose a template','error');return;}
  const existing=runningOrderFor(weddingId);
  if(!confirm(`Add ${template.name} operational template items? Planning-linked timings will NOT be deleted or overwritten.`))return;

  // First ensure Planning's authoritative standard timings exist.
  const synced=await syncWeddingRunningOrderFromPlanning(weddingId,{silent:true,adoptTemplates:true});
  if(!synced.ok){toast(`Planning could not sync first: ${synced.reason}`,'error');return;}
  await loadWeddingsFromSupabase();

  const current=runningOrderFor(weddingId);
  const existingTitles=new Set(current.map(x=>String(x.title||'').trim().toLowerCase()));
  const rows=template.items
    .filter(x=>{
      const key=runningOrderTemplateAliasKey({title:x[1]});
      // Standard timeline rows come from Planning; only add operational extras.
      if(key)return false;
      return !existingTitles.has(String(x[1]||'').trim().toLowerCase());
    })
    .map((x,i)=>({wedding_id:weddingId,start_time:x[0],title:x[1],duration_minutes:x[2],responsible:x[3],location:x[4],sort_order:current.length+i,notes:'Operational template item'}));

  if(rows.length){
    const {error}=await supabaseClient.from('wedding_running_order').insert(rows);
    if(error){console.error(error);toast('Operational template items could not be added','error');return;}
  }
  await addWeddingTimelineEntry(weddingId,'Planning','Running order operational template added',`${template.name} · ${rows.length} manual operational item${rows.length===1?'':'s'} added`);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();
  toast(rows.length?`${rows.length} operational template items added — Planning timings preserved`:'No new operational items were needed');
}
function timeToMinutes(v){const [h,m]=v.split(':').map(Number);return h*60+m}
function minutesToTime(v){v=((v%1440)+1440)%1440;return `${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`}
async function recalculateWeddingRunningOrder(weddingId){
  const rows=runningOrderFor(weddingId);if(rows.length<2){toast('Add at least two events','error');return;}if(!confirm('Recalculate all later start times?'))return;
  let next=timeToMinutes(rows[0].startTime);
  for(let i=0;i<rows.length;i++){const start=i===0?rows[i].startTime:minutesToTime(next);const {error}=await supabaseClient.from('wedding_running_order').update({start_time:start}).eq('id',rows[i].id);if(error){toast('Times could not be recalculated','error');return;}next=timeToMinutes(start)+Number(rows[i].duration||0)}
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Times recalculated');
}
function initialiseRunningOrderDrag(weddingId){
  const list=document.getElementById('running-order-list');if(!list)return;let dragged=null;
  list.querySelectorAll('.running-order-row').forEach(row=>{row.addEventListener('dragstart',()=>{dragged=row;row.classList.add('opacity-50')});row.addEventListener('dragend',()=>row.classList.remove('opacity-50'));row.addEventListener('dragover',e=>{e.preventDefault();if(!dragged||dragged===row)return;const b=row.getBoundingClientRect();list.insertBefore(dragged,e.clientY>b.top+b.height/2?row.nextSibling:row)});row.addEventListener('drop',async e=>{e.preventDefault();const ids=[...list.querySelectorAll('.running-order-row')].map(x=>x.dataset.runningOrderId);for(let i=0;i<ids.length;i++){await supabaseClient.from('wedding_running_order').update({sort_order:i}).eq('id',ids[i])}await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Order saved')})});
}
function printWeddingRunningOrder(weddingId){
  const wedding=DB.weddings.find(x=>x.id===weddingId),rows=runningOrderFor(weddingId);if(!rows.length){toast('No running order to print','error');return;}
  const html=`<!doctype html><html><head><title>Running Order</title><style>body{font-family:Arial;padding:30px;color:#222}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}th{background:#f4f2e8;font-size:12px}.small{font-size:12px;color:#666}</style></head><body><h1>${esc(wedding.couple)}</h1><p>${esc(wedding.date||'Date TBC')} · Wedding Running Order</p><table><tr><th>Time</th><th>Event</th><th>Duration</th><th>Responsible</th><th>Location</th></tr>${rows.map(x=>`<tr><td><strong>${esc(x.startTime)}</strong></td><td><strong>${esc(x.title)}</strong>${runningOrderVisibleNotes(x.notes)?`<div class="small">${esc(runningOrderVisibleNotes(x.notes))}</div>`:''}</td><td>${x.duration?`${x.duration} min`:'—'}</td><td>${esc(x.responsible||'—')}</td><td>${esc(x.location||'—')}</td></tr>`).join('')}</table></body></html>`;
  const win=window.open('','_blank');win.document.write(html);win.document.close();setTimeout(()=>win.print(),250);
}


let weddingLiveClockTimer = null;

function liveNotesFor(weddingId) {
  return (DB.weddingLiveNotes || [])
    .filter(x => x.weddingId === weddingId)
    .sort((a,b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}
function liveMinutesNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
function runningOrderItemStartMinutes(item) {
  if (!item?.startTime) return 0;
  return timeToMinutes(item.startTime);
}
function getLiveRunningOrderState(weddingId) {
  const rows = runningOrderFor(weddingId);
  if (!rows.length) return { rows, current:null, next:null, previous:null };
  const now = liveMinutesNow();
  let current = null;
  let next = null;
  let previous = null;

  for (const item of rows) {
    const start = runningOrderItemStartMinutes(item);
    const end = start + Math.max(Number(item.duration || 0), 1);
    if (now >= start && now < end && !item.completed) current = item;
    if (start > now && !item.completed && !next) next = item;
    if (start <= now || item.completed) previous = item;
  }

  if (!current) current = rows.find(x => !x.completed) || rows[rows.length - 1];
  if (current) {
    const currentIndex = rows.findIndex(x => x.id === current.id);
    next = rows.slice(currentIndex + 1).find(x => !x.completed) || null;
    previous = rows.slice(0, currentIndex).reverse().find(x => x.completed) || previous;
  }

  return { rows, current, next, previous };
}
function liveStatusForItem(item) {
  if (!item) return { label:'No Schedule', className:'bg-gray-100 text-gray-700' };
  if (item.completed) return { label:'Complete', className:'bg-green-100 text-green-800' };
  const now = liveMinutesNow();
  const start = runningOrderItemStartMinutes(item);
  if (now < start - 10) return { label:'Waiting', className:'bg-gray-100 text-gray-700' };
  if (now <= start + Math.max(Number(item.duration || 0), 1) + 10) return { label:'Running to Time', className:'bg-green-100 text-green-800' };
  return { label:'Behind Schedule', className:'bg-red-100 text-red-800' };
}
function liveTimeDifference(item) {
  if (!item) return '';
  const now = liveMinutesNow();
  const start = runningOrderItemStartMinutes(item);
  const end = start + Number(item.duration || 0);
  if (now < start) return `${start - now} min until start`;
  if (item.duration && now <= end) return `${Math.max(0,end-now)} min remaining`;
  if (now > end && !item.completed) return `${now-end} min overdue`;
  return '';
}
function renderWeddingLiveMode(wedding) {
  if (!weddingRunningOrderTablesReady || !weddingLiveModeTablesReady) {
    return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h3 class="font-bold">Live Mode setup required</h3>
      <p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-live-mode.sql</strong> in Supabase, then refresh.</p>
    </div>`;
  }

  const state = getLiveRunningOrderState(wedding.id);
  const rows = state.rows;
  const current = state.current;
  const next = state.next;
  const progress = rows.length ? Math.round(rows.filter(x => x.completed).length / rows.length * 100) : 0;
  const status = liveStatusForItem(current);
  const outstanding = (DB.weddingTasks || []).filter(x => x.weddingId === wedding.id && !x.completed).slice(0,8);
  const notes = liveNotesFor(wedding.id);

  return `<div class="space-y-4">
    <div class="rounded-2xl bg-charcoal-900 text-white p-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p class="text-xs tracking-[0.22em] text-olive-200 font-bold">WEDDING DAY LIVE</p>
          <h2 class="text-2xl font-bold mt-1">${esc(wedding.couple)}</h2>
          <p class="text-sm text-gray-300 mt-1">${esc(wedding.date || 'Date TBC')} · Coordinator: ${esc(wedding.coordinator || 'Unassigned')}</p>
        </div>
        <div class="lg:text-right">
          <p id="wedding-live-clock" class="text-4xl font-bold tabular-nums">${new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</p>
          <span class="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${status.className}">${status.label}</span>
        </div>
      </div>
      <div class="mt-5">
        <div class="flex justify-between text-xs text-gray-300 mb-2"><span>Wedding progress</span><strong>${progress}%</strong></div>
        <div class="h-3 bg-white/10 rounded-full overflow-hidden"><div class="h-full bg-olive-400 rounded-full" style="width:${progress}%"></div></div>
      </div>
    </div>

    ${rows.length ? `<div class="grid xl:grid-cols-[1.5fr_1fr] gap-4">
      <div class="space-y-4">
        <div class="bg-white border border-olive-100 rounded-2xl p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs tracking-widest text-olive-600 font-bold">NOW</p>
              <h3 class="text-2xl font-bold mt-1">${esc(current?.title || 'No active event')}</h3>
              <p class="text-sm text-gray-500 mt-1">${esc(current?.startTime || '--:--')}${runningOrderEndTime(current) ? `–${esc(runningOrderEndTime(current))}` : ''} · ${esc(current?.location || 'Location not set')}</p>
              ${current?.responsible ? `<p class="text-sm text-gray-600 mt-2"><strong>Responsible:</strong> ${esc(current.responsible)}</p>` : ''}
              ${current?.notes ? `<p class="text-sm text-gray-600 mt-2">${esc(current.notes)}</p>` : ''}
            </div>
            <div class="text-right">
              <p class="font-bold ${liveTimeDifference(current).includes('overdue')?'text-red-700':'text-olive-700'}">${esc(liveTimeDifference(current))}</p>
            </div>
          </div>
          <div class="grid sm:grid-cols-3 gap-2 mt-5">
            ${!current?.actualStart ? `<button onclick="startWeddingLiveItem('${current?.id || ''}')" class="py-3 bg-blue-600 text-white rounded-xl font-bold">Start Now</button>` : `<button disabled class="py-3 bg-blue-50 text-blue-700 rounded-xl font-bold">Started ${formatTimelineDate(current.actualStart).split(' ').slice(-1)}</button>`}
            <button onclick="completeWeddingLiveItem('${current?.id || ''}')" class="py-3 bg-green-600 text-white rounded-xl font-bold">Complete</button>
            <button onclick="openWeddingRunningOrderForm('${wedding.id}','${current?.id || ''}')" class="py-3 bg-gray-100 rounded-xl font-bold">Edit Event</button>
          </div>
        </div>

        <div class="bg-white border border-olive-100 rounded-2xl p-5">
          <p class="text-xs tracking-widest text-gray-500 font-bold">NEXT</p>
          ${next ? `<div class="flex items-center justify-between mt-2 gap-4"><div><h3 class="text-xl font-bold">${esc(next.title)}</h3><p class="text-sm text-gray-500">${esc(next.startTime)} · ${esc(next.location || 'Location not set')}</p></div><strong class="text-olive-700">${Math.max(0,runningOrderItemStartMinutes(next)-liveMinutesNow())} min</strong></div>` : `<p class="text-sm text-gray-500 mt-2">No further events.</p>`}
        </div>

        <div class="bg-white border border-olive-100 rounded-2xl overflow-hidden">
          <div class="p-5 border-b border-gray-100"><h3 class="font-bold">Full Running Order</h3></div>
          <div class="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            ${rows.map(item=>`<button onclick="openWeddingRunningOrderForm('${wedding.id}','${item.id}')" class="w-full p-4 text-left flex items-center gap-3 hover:bg-cream-50">
              <div class="w-8 h-8 rounded-full flex items-center justify-center ${item.completed?'bg-green-100 text-green-700':item.id===current?.id?'bg-olive-600 text-white':'bg-gray-100 text-gray-500'}">
                <i data-lucide="${item.completed?'check':'clock-3'}" style="width:16px"></i>
              </div>
              <div class="w-14 font-bold text-sm">${esc(item.startTime)}</div>
              <div class="flex-1"><p class="font-bold ${item.completed?'line-through text-gray-400':''}">${esc(item.title)}</p><p class="text-xs text-gray-500">${esc(item.responsible || '')}</p></div>
              ${item.id===current?.id?'<span class="badge bg-olive-100 text-olive-800">Now</span>':''}
            </button>`).join('')}
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white border border-olive-100 rounded-2xl p-5">
          <div class="flex items-center justify-between"><div><h3 class="font-bold">Live Notes</h3><p class="text-xs text-gray-500">Operational notes from the day.</p></div><button onclick="openWeddingLiveNoteForm('${wedding.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">+ Note</button></div>
          <div class="space-y-3 mt-4 max-h-72 overflow-y-auto">
            ${notes.length ? notes.map(note=>`<div class="border-l-2 border-olive-300 pl-3"><p class="text-sm">${esc(note.note)}</p><p class="text-xs text-gray-400 mt-1">${formatTimelineDate(note.createdAt)}${note.createdBy?` · ${esc(note.createdBy)}`:''}</p></div>`).join('') : '<p class="text-sm text-gray-400">No live notes yet.</p>'}
          </div>
        </div>

        <div class="bg-white border border-olive-100 rounded-2xl p-5">
          <div class="flex items-center justify-between"><h3 class="font-bold">Outstanding Tasks</h3><span class="badge ${outstanding.length?'bg-red-100 text-red-800':'bg-green-100 text-green-800'}">${outstanding.length}</span></div>
          <div class="space-y-2 mt-4">
            ${outstanding.length ? outstanding.map(task=>`<button onclick="toggleWeddingTask('${task.id}',true)" class="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"><span class="w-5 h-5 mt-0.5 rounded border border-gray-300"></span><span><strong class="text-sm">${esc(task.title)}</strong>${task.dueDate?`<span class="block text-xs text-gray-400">Due ${esc(task.dueDate)}</span>`:''}</span></button>`).join('') : '<p class="text-sm text-green-700">All wedding tasks are complete.</p>'}
          </div>
        </div>

        <div class="bg-white border border-olive-100 rounded-2xl p-5">
          <h3 class="font-bold">Wedding Controls</h3>
          <div class="grid gap-2 mt-4">
            <button onclick="markAllPreviousRunningOrderComplete('${wedding.id}')" class="py-2.5 bg-gray-100 rounded-lg text-sm font-medium">Complete All Earlier Events</button>
            <button onclick="finishWeddingLiveMode('${wedding.id}')" class="py-2.5 bg-charcoal-900 text-white rounded-lg text-sm font-bold">Finish Wedding</button>
          </div>
        </div>
      </div>
    </div>` : `<div class="bg-white border border-dashed border-olive-200 rounded-2xl p-10 text-center"><h3 class="font-bold">Running order required</h3><p class="text-sm text-gray-500 mt-1">Create a running order before using Live Mode.</p><button onclick="setWeddingTab('running-order')" class="mt-4 px-4 py-2 bg-olive-600 text-white rounded-lg font-medium">Open Running Order</button></div>`}
  </div>`;
}
function initialiseWeddingLiveMode(weddingId) {
  if (weddingLiveClockTimer) clearInterval(weddingLiveClockTimer);
  weddingLiveClockTimer = setInterval(() => {
    const clock = document.getElementById('wedding-live-clock');
    if (!clock) {
      clearInterval(weddingLiveClockTimer);
      weddingLiveClockTimer = null;
      return;
    }
    clock.textContent = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  }, 1000);
}
async function startWeddingLiveItem(itemId) {
  if (!itemId) return;
  const item=(DB.weddingRunningOrder||[]).find(x=>x.id===itemId);if(!item)return;
  const now=new Date().toISOString();
  const {error}=await supabaseClient.from('wedding_running_order').update({actual_start:now,completed:false}).eq('id',itemId);
  if(error){console.error(error);toast('Event could not be started','error');return;}
  await addWeddingTimelineEntry(item.weddingId,'Planning','Live event started',item.title);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(`${item.title} started`);
}
async function completeWeddingLiveItem(itemId) {
  if (!itemId) return;
  const item=(DB.weddingRunningOrder||[]).find(x=>x.id===itemId);if(!item)return;
  const now=new Date().toISOString();
  const update={completed:true,actual_end:now};
  if(!item.actualStart)update.actual_start=now;
  const {error}=await supabaseClient.from('wedding_running_order').update(update).eq('id',itemId);
  if(error){console.error(error);toast('Event could not be completed','error');return;}
  await addWeddingTimelineEntry(item.weddingId,'Planning','Live event completed',item.title);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(`${item.title} completed`);
}
function openWeddingLiveNoteForm(weddingId) {
  openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold">Add Live Note</h2><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
  <form onsubmit="saveWeddingLiveNote(event,'${weddingId}')" class="space-y-3">
    <label class="text-xs font-medium block">Note *<textarea required name="note" rows="4" class="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Kitchen running five minutes behind, florist arrived..."></textarea></label>
    <label class="text-xs font-medium block">Added By<select name="createdBy" class="mt-1 w-full px-3 py-2 border rounded-lg">${staffOptions('',true)}</select></label>
    <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Add Live Note</button>
  </form></div>`);
}
async function saveWeddingLiveNote(ev,weddingId) {
  ev.preventDefault();const f=new FormData(ev.target);
  const record={wedding_id:weddingId,note:String(f.get('note')||'').trim(),created_by:f.get('createdBy')||null};
  const {error}=await supabaseClient.from('wedding_live_notes').insert(record);
  if(error){console.error(error);toast('Live note could not be added','error');return;}
  await addWeddingTimelineEntry(weddingId,'Note','Wedding day live note',record.note,record.created_by||'');
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Live note added');
}
async function markAllPreviousRunningOrderComplete(weddingId) {
  const rows=runningOrderFor(weddingId),now=liveMinutesNow();
  const targets=rows.filter(x=>!x.completed&&runningOrderItemStartMinutes(x)<now);
  if(!targets.length){toast('No earlier events need completing');return;}
  if(!confirm(`Mark ${targets.length} earlier events as complete?`))return;
  const stamp=new Date().toISOString();
  for(const item of targets){
    const {error}=await supabaseClient.from('wedding_running_order').update({completed:true,actual_end:stamp,actual_start:item.actualStart||stamp}).eq('id',item.id);
    if(error){console.error(error);toast('Not every event could be updated','error');return;}
  }
  await addWeddingTimelineEntry(weddingId,'Planning','Earlier running order events completed',`${targets.length} events`);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Earlier events completed');
}
function finishWeddingLiveMode(weddingId) {
  const wedding=DB.weddings.find(x=>x.id===weddingId);
  const incomplete=runningOrderFor(weddingId).filter(x=>!x.completed);
  const tasks=(DB.weddingTasks||[]).filter(x=>x.weddingId===weddingId&&!x.completed);
  openModal(`<div class="p-6 max-w-lg"><div><p class="text-xs font-bold tracking-widest text-olive-600">END LIVE DAY</p><h2 class="text-lg font-bold mt-1">Finish Wedding Day</h2><p class="text-sm text-gray-500 mt-1">${esc(wedding?.couple||'Wedding')}</p></div>
  <div class="grid grid-cols-2 gap-3 my-4"><div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Incomplete events</p><p class="text-2xl font-bold">${incomplete.length}</p></div><div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Outstanding tasks</p><p class="text-2xl font-bold">${tasks.length}</p></div></div>
  <p class="text-sm text-gray-600">Ending Live Day does <strong>not</strong> archive the wedding. It completes any remaining Running Order events, then takes you to Wedding Closeout for the post-event checks.</p>
  <div class="grid gap-2 mt-5"><button onclick="completeWeddingLiveDayAndOpenCloseout('${weddingId}')" class="py-2.5 bg-charcoal-900 text-white rounded-lg font-bold">End Live Day & Open Closeout</button><button onclick="closeModal()" class="py-2.5 bg-gray-100 rounded-lg font-medium">Cancel</button></div></div>`);
}
async function completeWeddingLiveDayAndOpenCloseout(weddingId) {
  const rows=runningOrderFor(weddingId),stamp=new Date().toISOString();
  for(const item of rows.filter(x=>!x.completed)){
    const {error}=await supabaseClient.from('wedding_running_order').update({completed:true,actual_start:item.actualStart||stamp,actual_end:stamp}).eq('id',item.id);
    if(error){console.error(error);toast('Running Order could not be completed','error');return;}
  }
  await addWeddingTimelineEntry(weddingId,'Wedding','Wedding Live Day finished','Moved to Wedding Closeout');
  closeModal();await loadWeddingsFromSupabase();setWeddingTab('closeout');toast('Live Day finished — complete the post-event Closeout before archiving');
}



function seatingTablesFor(weddingId) {
  return (DB.weddingSeatingTables || [])
    .filter(x => x.weddingId === weddingId)
    .sort((a,b) => a.sortOrder - b.sortOrder || a.tableName.localeCompare(b.tableName));
}
function weddingGuestsFor(weddingId) {
  return (DB.weddingGuests || [])
    .filter(x => x.weddingId === weddingId)
    .sort((a,b) => a.guestName.localeCompare(b.guestName));
}
function guestsAtTable(tableId) {
  return (DB.weddingGuests || []).filter(x => x.tableId === tableId);
}
function unassignedWeddingGuests(weddingId) {
  return weddingGuestsFor(weddingId).filter(x => !x.tableId);
}
function seatingSummary(weddingId) {
  const guests = weddingGuestsFor(weddingId);
  const assigned = guests.filter(x => x.tableId).length;
  return { total: guests.length, assigned, unassigned: guests.length-assigned };
}
/* PHASE 1: superseded duplicate `renderWeddingSeatingPlanner` removed; active declaration retained later in this file. */

function renderWeddingSeatingTable(table) {
  const guests = guestsAtTable(table.id).sort((a,b)=>a.guestName.localeCompare(b.guestName));
  const isOver = guests.length > table.capacity;
  const isFull = guests.length === table.capacity;
  return `<div class="bg-white rounded-xl border ${isOver?'border-red-300':isFull?'border-green-300':'border-olive-100'} overflow-hidden">
    <div class="p-4 bg-cream-50 border-b border-gray-100">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-bold">${esc(table.tableName)}</h3>
          <p class="text-xs text-gray-500">${esc(table.tableType)} · Capacity ${table.capacity}</p>
        </div>
        <div class="flex items-center gap-1">
          <span class="badge ${isOver?'bg-red-100 text-red-800':isFull?'bg-green-100 text-green-800':'bg-gray-100 text-gray-700'}">${guests.length}/${table.capacity}</span>
          <button onclick="openWeddingSeatingTableForm('${table.weddingId}','${table.id}')" class="p-1.5 text-gray-500 hover:text-olive-700"><i data-lucide="pencil" style="width:15px"></i></button>
          <button onclick="deleteWeddingSeatingTable('${table.id}')" class="p-1.5 text-gray-500 hover:text-red-600"><i data-lucide="trash-2" style="width:15px"></i></button>
        </div>
      </div>
      ${table.notes?`<p class="text-xs text-gray-500 mt-2">${esc(table.notes)}</p>`:''}
      ${isOver?'<p class="text-xs font-bold text-red-700 mt-2">Table is over capacity.</p>':''}
    </div>
    <div data-table-id="${table.id}" class="seating-drop-zone p-3 min-h-[120px] space-y-2">
      ${guests.length ? guests.map(renderSeatingGuestCard).join('') : '<p class="text-xs text-gray-400 text-center py-6">Drop guests here</p>'}
    </div>
  </div>`;
}
function renderSeatingGuestCard(guest) {
  const dietary = guest.dietaryRequirements || guest.accessibilityNotes;
  return `<div draggable="true" data-guest-id="${guest.id}" data-guest-name="${esc(guest.guestName.toLowerCase())}" class="seating-guest-card bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-grab">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="font-bold text-sm truncate">${esc(guest.guestName)}</p>
        <p class="text-xs text-gray-500">${esc(guest.guestType)}${guest.mainChoice?` · ${esc(guest.mainChoice)}`:''}</p>
        ${dietary?`<p class="text-xs text-red-700 mt-1">${esc(guest.dietaryRequirements || guest.accessibilityNotes)}</p>`:''}
      </div>
      <button onclick="event.stopPropagation();openWeddingGuestForm('${guest.weddingId}','${guest.id}')" class="text-gray-400 hover:text-olive-700"><i data-lucide="pencil" style="width:14px"></i></button>
    </div>
  </div>`;
}
function openWeddingSeatingTableForm(weddingId,tableId='') {
  const table=(DB.weddingSeatingTables||[]).find(x=>x.id===tableId);
  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold">${table?'Edit Table':'Add Table'}</h2><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="saveWeddingSeatingTable(event,'${weddingId}','${tableId}')" class="space-y-3">
      <label class="text-xs font-medium block">Table Name *<input required name="tableName" value="${esc(table?.tableName||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Top Table, Table 1..."></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="text-xs font-medium block">Table Type<select name="tableType" class="mt-1 w-full px-3 py-2 border rounded-lg">${['Round','Rectangle','Top Table','Sweetheart'].map(x=>`<option ${table?.tableType===x?'selected':''}>${x}</option>`).join('')}</select></label>
        <label class="text-xs font-medium block">Capacity<input required name="capacity" type="number" min="1" max="30" value="${table?.capacity||8}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      </div>
      <label class="text-xs font-medium block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg">${esc(table?.notes||'')}</textarea></label>
      <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">${table?'Save Changes':'Add Table'}</button>
    </form>
  </div>`);
}
async function saveWeddingSeatingTable(ev,weddingId,tableId='') {
  ev.preventDefault();const f=new FormData(ev.target);
  const existingTable=(DB.weddingSeatingTables||[]).find(x=>x.id===tableId);
  const record={
    wedding_id:weddingId,
    table_name:String(f.get('tableName')||'').trim(),
    table_type:f.get('tableType'),
    capacity:Number(f.get('capacity')||8),
    notes:f.get('notes')||null,
    visual_shape:f.get('tableType'),
    position_x:existingTable?.positionX ?? (20 + (seatingTablesFor(weddingId).length%3)*30),
    position_y:existingTable?.positionY ?? (35 + Math.floor(seatingTablesFor(weddingId).length/3)*28),
    rotation:existingTable?.rotation ?? 0,
    locked:existingTable?.locked ?? false,
    colour:existingTable?.colour || null,
    sort_order:tableId?undefined:seatingTablesFor(weddingId).length
  };
  if(record.sort_order===undefined)delete record.sort_order;

  let result=tableId
    ? await supabaseClient.from('wedding_seating_tables').update(record).eq('id',tableId)
    : await supabaseClient.from('wedding_seating_tables').insert(record);

  // If the new visual columns have not been added yet, fall back to the
  // original seating-table schema so users can still add and edit tables.
  if(result.error && /position_x|position_y|rotation|locked|colour|visual_shape/i.test(
    String(result.error.message||result.error.details||result.error.hint||'')
  )){
    const legacyRecord={
      wedding_id:weddingId,
      table_name:record.table_name,
      table_type:record.table_type,
      capacity:record.capacity,
      notes:record.notes
    };
    if(!tableId)legacyRecord.sort_order=record.sort_order;

    result=tableId
      ? await supabaseClient.from('wedding_seating_tables').update(legacyRecord).eq('id',tableId)
      : await supabaseClient.from('wedding_seating_tables').insert(legacyRecord);
  }

  if(result.error){
    console.error('Wedding seating table save failed:',result.error);
    const message=String(result.error.message||'Table could not be saved');
    if(/row-level security|permission|policy/i.test(message)){
      toast('Supabase is blocking table changes. Run the seating permissions SQL.','error');
    }else{
      toast(`Table could not be saved: ${message}`,'error');
    }
    return;
  }
  await addWeddingTimelineEntry(weddingId,'Planning',tableId?'Seating table updated':'Seating table added',record.table_name);
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(tableId?'Table updated':'Table added');
}
async function deleteWeddingSeatingTable(tableId) {
  const table=(DB.weddingSeatingTables||[]).find(x=>x.id===tableId);if(!table)return;
  const count=guestsAtTable(tableId).length;
  if(!confirm(`Delete "${table.tableName}"? ${count?`${count} guests will become unassigned.`:''}`))return;
  if(count){
    const clear=await supabaseClient.from('wedding_guests').update({table_id:null}).eq('table_id',tableId);
    if(clear.error){toast('Guests could not be unassigned','error');return;}
  }
  const {error}=await supabaseClient.from('wedding_seating_tables').delete().eq('id',tableId);
  if(error){toast('Table could not be deleted','error');return;}
  await addWeddingTimelineEntry(table.weddingId,'Planning','Seating table deleted',table.tableName);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Table deleted');
}

// ===== PHASE 4: STRUCTURED FOOD / RECIPE LINKS =====
// Readable food names remain in wedding_guests for backwards compatibility.
// Stable Specification recipe IDs are stored in wedding_planning section "food".
function weddingFoodPlanningData(weddingId) {
  return planningData(weddingId,'food');
}
function kitchenSpecRecipes() {
  return Array.isArray(window.KITCHEN_SPEC_RECIPES) ? window.KITCHEN_SPEC_RECIPES : [];
}
function kitchenSpecRecipeById(id) {
  return kitchenSpecRecipes().find(recipe=>recipe.id===id) || null;
}
function normaliseWeddingFoodName(value) {
  return String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ').trim();
}
function kitchenSpecRecipeByName(name, allowedIds=[]) {
  const wanted=normaliseWeddingFoodName(name); if(!wanted) return null;
  let recipes=kitchenSpecRecipes();
  if(allowedIds.length) recipes=recipes.filter(r=>allowedIds.includes(r.id));
  return recipes.find(r=>normaliseWeddingFoodName(r.name)===wanted) || null;
}
function weddingBreakfastCourseRecipes(weddingId,course) {
  const reception=planningData(weddingId,'reception');
  const menu=reception.weddingBreakfastMenu||'';
  const ranges={
    'Rose Menu':{starter:[19,25],main:[26,38],dessert:[39,43]},
    'Peony Menu':{starter:[50,53],main:[54,58],dessert:[62,65]},
    'Orchid Menu':{starter:[72,75],main:[76,81],dessert:[85,88]}
  }[menu];
  if(!ranges || !ranges[course]) return [];
  const [from,to]=ranges[course];
  return kitchenSpecRecipes().filter(r=>r.category===menu && Number(r.page)>=from && Number(r.page)<=to);
}
function weddingEveningRecipeOptions(weddingId) {
  const menu=planningData(weddingId,'reception').eveningFoodMenu||'';
  const category={
    'Finger Buffet':'Finger Buffet','Hog Roast Buffet':'Hog Roast','Hog Roast Bap':'Hog Roast',
    'Barbecue':'BBQ','Curry':'Curry','Breakfast Rolls':'Breakfast Rolls','Hot Rolls':'Hot Rolls'
  }[menu];
  return category ? kitchenSpecRecipes().filter(r=>r.category===category) : [];
}
function weddingGuestRecipeLink(weddingId,guest,course,options=[]) {
  const food=weddingFoodPlanningData(weddingId);
  const linked=food.guestRecipeLinks?.[guest?.id]?.[course]||'';
  if(linked && kitchenSpecRecipeById(linked)) return linked;
  const field={starter:'starterChoice',main:'mainChoice',dessert:'dessertChoice',evening:'eveningFoodChoice'}[course];
  const existing=guest?.[field]||'';
  return kitchenSpecRecipeByName(existing,options.map(x=>x.id))?.id || '';
}
function weddingFoodChoiceControl(weddingId,guest,course,label) {
  const field={starter:'starterChoice',main:'mainChoice',dessert:'dessertChoice',evening:'eveningFoodChoice'}[course];
  const options=course==='evening' ? weddingEveningRecipeOptions(weddingId) : weddingBreakfastCourseRecipes(weddingId,course);
  const linked=weddingGuestRecipeLink(weddingId,guest,course,options);
  const current=guest?.[field]||'';
  const structuredName=linked ? (kitchenSpecRecipeById(linked)?.name||'') : '';
  const customValue=linked && normaliseWeddingFoodName(structuredName)===normaliseWeddingFoodName(current) ? '' : current;
  if(!options.length) return `<label class="text-xs font-medium block">${label}<input name="${course}ChoiceCustom" value="${esc(current)}" class="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Type ${label.toLowerCase()} choice"></label>`;
  return `<label class="text-xs font-medium block">${label}
    <select name="${course}RecipeId" class="mt-1 w-full px-3 py-2 border rounded-lg">
      <option value="">Select from ${course==='evening'?'evening menu':'wedding menu'}...</option>
      ${options.map(recipe=>`<option value="${recipe.id}" ${linked===recipe.id?'selected':''}>${esc(recipe.name)}</option>`).join('')}
    </select>
    <input name="${course}ChoiceCustom" value="${esc(customValue)}" class="mt-2 w-full px-3 py-2 border rounded-lg text-xs" placeholder="Bespoke / legacy choice only">
  </label>`;
}
async function saveWeddingGuestRecipeLinks(weddingId,guestId,links) {
  if(!guestId) return;
  const section='food';
  const existing=planningRecord(weddingId,section);
  const current={...(existing?.data||planningData(weddingId,section)||{})};
  const allLinks={...(current.guestRecipeLinks||{})};
  const clean={};
  ['starter','main','dessert','evening'].forEach(course=>{if(links[course]) clean[course]=links[course];});
  if(Object.keys(clean).length) allLinks[guestId]=clean; else delete allLinks[guestId];
  const data={...current,guestRecipeLinks:allLinks,linkVersion:1};
  const payload={wedding_id:weddingId,section,data,updated_at:new Date().toISOString()};
  const result=existing
    ? await supabaseClient.from('wedding_planning').update(payload).eq('id',existing.id)
    : await supabaseClient.from('wedding_planning').insert(payload);
  if(result.error) console.error('Wedding food recipe links could not be saved',result.error);
  delete weddingPlanningDrafts[`${weddingId}:${section}`];
}
async function removeWeddingGuestRecipeLinks(weddingId,guestId) {
  const existing=planningRecord(weddingId,'food'); if(!existing) return;
  const allLinks={...(existing.data?.guestRecipeLinks||{})};
  if(!(guestId in allLinks)) return;
  delete allLinks[guestId];
  await supabaseClient.from('wedding_planning').update({data:{...(existing.data||{}),guestRecipeLinks:allLinks},updated_at:new Date().toISOString()}).eq('id',existing.id);
  delete weddingPlanningDrafts[`${weddingId}:food`];
}

function openWeddingGuestForm(weddingId,guestId='') {
  const guest=(DB.weddingGuests||[]).find(x=>x.id===guestId);
  const tables=seatingTablesFor(weddingId);
  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold">${guest?'Edit Guest':'Add Guest'}</h2><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="saveWeddingGuest(event,'${weddingId}','${guestId}')" class="space-y-3">
      <label class="text-xs font-medium block">Guest Name *<input required name="guestName" value="${esc(guest?.guestName||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="text-xs font-medium block">Guest Type<select name="guestType" class="mt-1 w-full px-3 py-2 border rounded-lg">${['Adult','Child','Infant','Supplier'].map(x=>`<option ${guest?.guestType===x?'selected':''}>${x}</option>`).join('')}</select></label>
        <label class="text-xs font-medium block">Table<select name="tableId" class="mt-1 w-full px-3 py-2 border rounded-lg"><option value="">Unassigned</option>${tables.map(t=>`<option value="${t.id}" ${guest?.tableId===t.id?'selected':''}>${esc(t.tableName)}</option>`).join('')}</select></label>
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${weddingFoodChoiceControl(weddingId,guest,'starter','Starter')}
        ${weddingFoodChoiceControl(weddingId,guest,'main','Main Course')}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${weddingFoodChoiceControl(weddingId,guest,'dessert','Dessert')}
        ${weddingFoodChoiceControl(weddingId,guest,'evening','Evening Food')}
      </div>
      <div class="rounded-lg bg-olive-50 border border-olive-100 p-3 text-xs text-olive-800">Menu choices selected from the lists are linked directly to the Kitchen Specification. The smaller bespoke field keeps old or exceptional choices available.</div>
      <label class="text-xs font-medium block">Dietary Requirements<input name="dietaryRequirements" value="${esc(guest?.dietaryRequirements||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      <label class="text-xs font-medium block">Accessibility Notes<input name="accessibilityNotes" value="${esc(guest?.accessibilityNotes||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      <label class="text-xs font-medium block">Notes<textarea name="notes" rows="2" class="mt-1 w-full px-3 py-2 border rounded-lg">${esc(guest?.notes||'')}</textarea></label>
      <div class="grid ${guest?'grid-cols-2':'grid-cols-1'} gap-2">
        ${guest?`<button type="button" onclick="deleteWeddingGuest('${guest.id}')" class="py-2.5 bg-red-50 text-red-700 rounded-lg font-medium">Delete Guest</button>`:''}
        <button class="py-2.5 bg-olive-600 text-white rounded-lg font-medium">${guest?'Save Changes':'Add Guest'}</button>
      </div>
    </form>
  </div>`);
}
async function saveWeddingGuest(ev,weddingId,guestId='') {
  ev.preventDefault();const f=new FormData(ev.target);
  const recipeLinks={
    starter:String(f.get('starterRecipeId')||''),main:String(f.get('mainRecipeId')||''),
    dessert:String(f.get('dessertRecipeId')||''),evening:String(f.get('eveningRecipeId')||'')
  };
  const choice=(course)=>{
    const id=recipeLinks[course];
    if(id) return kitchenSpecRecipeById(id)?.name||String(f.get(`${course}ChoiceCustom`)||'').trim()||null;
    return String(f.get(`${course}ChoiceCustom`)||'').trim()||null;
  };
  const record={wedding_id:weddingId,guest_name:String(f.get('guestName')||'').trim(),guest_type:f.get('guestType'),table_id:f.get('tableId')||null,starter_choice:choice('starter'),main_choice:choice('main'),dessert_choice:choice('dessert'),evening_food_choice:choice('evening'),dietary_requirements:f.get('dietaryRequirements')||null,accessibility_notes:f.get('accessibilityNotes')||null,notes:f.get('notes')||null};
  let result,savedGuestId=guestId;
  if(guestId){
    result=await supabaseClient.from('wedding_guests').update(record).eq('id',guestId);
  }else{
    result=await supabaseClient.from('wedding_guests').insert(record).select('id').single();
    savedGuestId=result.data?.id||'';
  }
  if(result.error){console.error(result.error);toast('Guest could not be saved','error');return;}
  await saveWeddingGuestRecipeLinks(weddingId,savedGuestId,recipeLinks);
  await addWeddingTimelineEntry(weddingId,'Planning',guestId?'Wedding guest updated':'Wedding guest added',record.guest_name);
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(guestId?'Guest updated':'Guest added');
}
async function deleteWeddingGuest(guestId) {
  const guest=(DB.weddingGuests||[]).find(x=>x.id===guestId);if(!guest||!confirm(`Delete ${guest.guestName}?`))return;
  await removeWeddingGuestRecipeLinks(guest.weddingId,guestId);
  const {error}=await supabaseClient.from('wedding_guests').delete().eq('id',guestId);
  if(error){toast('Guest could not be deleted','error');return;}
  closeModal();await addWeddingTimelineEntry(guest.weddingId,'Planning','Wedding guest deleted',guest.guestName);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Guest deleted');
}
function initialiseWeddingSeatingDrag(weddingId) {
  let draggedGuestId='';
  document.querySelectorAll('.seating-guest-card').forEach(card=>{
    card.addEventListener('dragstart',()=>{draggedGuestId=card.dataset.guestId;card.classList.add('opacity-50')});
    card.addEventListener('dragend',()=>card.classList.remove('opacity-50'));
  });
  document.querySelectorAll('.seating-drop-zone').forEach(zone=>{
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('ring-2','ring-olive-300')});
    zone.addEventListener('dragleave',()=>zone.classList.remove('ring-2','ring-olive-300'));
    zone.addEventListener('drop',async e=>{
      e.preventDefault();zone.classList.remove('ring-2','ring-olive-300');
      if(!draggedGuestId)return;
      const tableId=zone.dataset.tableId||null;
      const targetTable=(DB.weddingSeatingTables||[]).find(x=>x.id===tableId);
      if(targetTable&&guestsAtTable(tableId).length>=targetTable.capacity){
        if(!confirm(`${targetTable.tableName} is at capacity. Add this guest anyway?`))return;
      }
      const {error}=await supabaseClient.from('wedding_guests').update({table_id:tableId}).eq('id',draggedGuestId);
      if(error){toast('Guest could not be moved','error');return;}
      await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Guest moved');
    });
  });
}
function filterWeddingSeatingGuests(weddingId) {
  const q=(document.getElementById('seating-guest-search')?.value||'').toLowerCase();
  document.querySelectorAll('#unassigned-guest-list .seating-guest-card').forEach(card=>{
    card.style.display=(card.dataset.guestName||'').includes(q)?'block':'none';
  });
}
/* PHASE 1: superseded duplicate `openWeddingGuestImport` removed; active declaration retained later in this file. */

async function importWeddingGuests(ev,weddingId) {
  ev.preventDefault();const f=new FormData(ev.target);
  const lines=String(f.get('guestList')||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const rows=lines.map(line=>{
    const [name,type,starter,main,dessert,evening,dietary]=line.split(',').map(x=>x?.trim());
    return {wedding_id:weddingId,guest_name:name,guest_type:type||'Adult',starter_choice:starter||null,main_choice:main||null,dessert_choice:dessert||null,evening_food_choice:evening||null,dietary_requirements:dietary||null};
  }).filter(x=>x.guest_name);
  if(!rows.length){toast('No valid guests found','error');return;}
  const {error}=await supabaseClient.from('wedding_guests').insert(rows);
  if(error){console.error(error);toast('Guests could not be imported','error');return;}
  await addWeddingTimelineEntry(weddingId,'Planning','Wedding guests imported',`${rows.length} guests`);
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(`${rows.length} guests imported`);
}
function printWeddingSeatingPlan(weddingId) {
  const wedding=DB.weddings.find(x=>x.id===weddingId);
  const tables=seatingTablesFor(weddingId);
  const unassigned=unassignedWeddingGuests(weddingId);
  if(!tables.length&&!unassigned.length){toast('There is no seating plan to print','error');return;}
  const html=`<!doctype html><html><head><title>Wedding Seating Plan</title><style>
    body{font-family:Arial;padding:30px;color:#222}h1{margin-bottom:4px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:24px}
    .table{border:1px solid #ccc;border-radius:10px;padding:16px;break-inside:avoid}.table h2{margin:0 0 4px}.meta{color:#666;font-size:12px}
    ol{padding-left:22px}li{margin:5px 0}.diet{font-size:11px;color:#9b1c1c;margin-left:6px}.small{font-size:11px;color:#555;margin-top:2px}@media print{.grid{grid-template-columns:repeat(2,1fr)}}
  </style></head><body><h1>${esc(wedding?.couple||'Wedding')}</h1><p>${esc(wedding?.date||'Date TBC')} · Seating Plan</p>
  <div class="grid">${tables.map(t=>{const gs=guestsAtTable(t.id).sort((a,b)=>a.guestName.localeCompare(b.guestName));return `<div class="table"><h2>${esc(t.tableName)}</h2><div class="meta">${esc(t.tableType)} · ${gs.length}/${t.capacity}</div><ol>${gs.map(g=>`<li><strong>${esc(g.guestName)}</strong>${g.starterChoice?`<div class="small">Starter: ${esc(g.starterChoice)}</div>`:''}${g.mainChoice?`<div class="small">Main: ${esc(g.mainChoice)}</div>`:''}${g.dessertChoice?`<div class="small">Dessert: ${esc(g.dessertChoice)}</div>`:''}${g.eveningFoodChoice?`<div class="small">Evening: ${esc(g.eveningFoodChoice)}</div>`:''}${g.dietaryRequirements?`<span class="diet">${esc(g.dietaryRequirements)}</span>`:''}</li>`).join('')}</ol></div>`}).join('')}</div>
  ${unassigned.length?`<div class="table" style="margin-top:18px"><h2>Unassigned Guests</h2><ol>${unassigned.map(g=>`<li>${esc(g.guestName)}</li>`).join('')}</ol></div>`:''}</body></html>`;
  const win=window.open('','_blank');win.document.write(html);win.document.close();setTimeout(()=>win.print(),250);
}


function functionSheetFor(weddingId) {
  return (DB.weddingFunctionSheets || []).find(x => x.weddingId === weddingId) || null;
}
function countChoice(items, key) {
  const counts = {};
  items.forEach(item => {
    const value = String(item[key] || '').trim();
    if (!value) return;
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.entries(counts).sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
function weddingSupplierSummary(weddingId) {
  const planning = (DB.weddingPlanning || []).filter(x => x.weddingId === weddingId);
  const suppliers = planning.filter(x => String(x.section || '').toLowerCase().includes('supplier'));
  return suppliers;
}
function renderWeddingFunctionSheet(wedding) {
  if (!weddingFunctionSheetTablesReady) {
    return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h3 class="font-bold">Function Sheet setup required</h3>
      <p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-function-sheet.sql</strong> in Supabase, then refresh.</p>
    </div>`;
  }

  const sheet = functionSheetFor(wedding.id);
  const runningOrder = runningOrderFor(wedding.id);
  const guests = weddingGuestsFor(wedding.id);
  const tables = seatingTablesFor(wedding.id);
  const tasks = (DB.weddingTasks || []).filter(x => x.weddingId === wedding.id);
  const payments = (DB.weddingPayments || []).filter(x => x.weddingId === wedding.id);
  const documents = (DB.weddingDocuments || []).filter(x => x.weddingId === wedding.id);
  const notes = (DB.weddingTimeline || []).filter(x => x.weddingId === wedding.id && (x.type === 'Note' || x.category === 'Note')).slice(0,8);
  const starters = countChoice(guests,'starterChoice');
  const mains = countChoice(guests,'mainChoice');
  const desserts = countChoice(guests,'dessertChoice');
  const evening = countChoice(guests,'eveningFoodChoice');
  const dietary = guests.filter(x => x.dietaryRequirements || x.accessibilityNotes);

  const totalPayments = payments.reduce((sum,p)=>sum+Number(p.amount||0),0);
  const completedTasks = tasks.filter(x=>x.completed).length;

  return `<div class="space-y-4">
    ${window.WeddingFinalisation?.render ? WeddingFinalisation.render(wedding) : ''}
    <div class="bg-white rounded-xl border border-olive-100 p-5">
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-lg">Wedding Function Sheet</h3>
          <p class="text-sm text-gray-500">One source of truth, with a full operational sheet plus role-specific Kitchen, Bar and Coordinator copies.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="openWeddingFunctionSheetSettings('${wedding.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">Edit Details</button>
          <button onclick="printWeddingPrepList('${wedding.id}')" class="px-3 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium">Generate Prep List</button>
          <button onclick="printWeddingFunctionSheet('${wedding.id}','full')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">Print Full Sheet</button>
          <button onclick="printWeddingFunctionSheet('${wedding.id}','kitchen')" class="px-3 py-2 bg-cream-100 text-olive-800 rounded-lg text-sm font-medium">Kitchen Copy</button>
          <button onclick="printWeddingFunctionSheet('${wedding.id}','bar')" class="px-3 py-2 bg-cream-100 text-olive-800 rounded-lg text-sm font-medium">Bar Copy</button>
          <button onclick="printWeddingFunctionSheet('${wedding.id}','coordinator')" class="px-3 py-2 bg-cream-100 text-olive-800 rounded-lg text-sm font-medium">Coordinator Copy</button>
        </div>
      </div>
      <div class="grid sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-5">
        <div class="bg-cream-50 rounded-xl p-4"><p class="text-xs text-gray-500">Guests</p><p class="text-2xl font-bold">${guests.length}</p></div>
        <div class="bg-cream-50 rounded-xl p-4"><p class="text-xs text-gray-500">Tables</p><p class="text-2xl font-bold">${tables.length}</p></div>
        <div class="bg-cream-50 rounded-xl p-4"><p class="text-xs text-gray-500">Running Order</p><p class="text-2xl font-bold">${runningOrder.length}</p></div>
        <div class="bg-cream-50 rounded-xl p-4"><p class="text-xs text-gray-500">Tasks Complete</p><p class="text-2xl font-bold">${completedTasks}/${tasks.length}</p></div>
        <div class="bg-cream-50 rounded-xl p-4"><p class="text-xs text-gray-500">Payments Logged</p><p class="text-2xl font-bold">£${totalPayments.toFixed(2)}</p></div>
      </div>
    </div>

    <div class="grid xl:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-olive-100 p-5">
        <h3 class="font-bold">Event Details</h3>
        <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div><p class="text-gray-500">Couple</p><p class="font-bold">${esc(wedding.couple || '')}</p></div>
          <div><p class="text-gray-500">Date</p><p class="font-bold">${esc(wedding.date || 'TBC')}</p></div>
          <div><p class="text-gray-500">Package</p><p class="font-bold">${esc(wedding.package || wedding.packageName || 'Not set')}</p></div>
          <div><p class="text-gray-500">Coordinator</p><p class="font-bold">${esc(wedding.coordinator || 'Unassigned')}</p></div>
          <div><p class="text-gray-500">Day Guests</p><p class="font-bold">${Number(wedding.dayGuests || wedding.day_guests || 0)}</p></div>
          <div><p class="text-gray-500">Evening Guests</p><p class="font-bold">${Number(wedding.eveningGuests || wedding.evening_guests || 0)}</p></div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-olive-100 p-5">
        <h3 class="font-bold">Function Sheet Control</h3>
        <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div><p class="text-gray-500">Version</p><p class="font-bold">${sheet?.version || 1}</p></div>
          <div><p class="text-gray-500">Prepared By</p><p class="font-bold">${esc(sheet?.preparedBy || 'Not set')}</p></div>
          <div><p class="text-gray-500">Approved By</p><p class="font-bold">${esc(sheet?.approvedBy || 'Not set')}</p></div>
          <div><p class="text-gray-500">Last Generated</p><p class="font-bold">${sheet?.generatedAt ? formatTimelineDate(sheet.generatedAt) : 'Not generated'}</p></div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-olive-100 p-5 xl:col-span-2">
        <h3 class="font-bold">Kitchen Summary</h3>
        <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
          ${renderFunctionSheetChoiceGroup('Starters',starters)}
          ${renderFunctionSheetChoiceGroup('Mains',mains)}
          ${renderFunctionSheetChoiceGroup('Desserts',desserts)}
          ${renderFunctionSheetChoiceGroup('Evening Food',evening)}
        </div>
        <div class="mt-5">
          <h4 class="font-bold text-sm">Dietary & Accessibility</h4>
          ${dietary.length ? `<div class="mt-2 divide-y divide-gray-100">${dietary.map(g=>`<div class="py-2 text-sm"><strong>${esc(g.guestName)}</strong>${g.dietaryRequirements?` · ${esc(g.dietaryRequirements)}`:''}${g.accessibilityNotes?` · ${esc(g.accessibilityNotes)}`:''}</div>`).join('')}</div>` : '<p class="text-sm text-gray-500 mt-2">No dietary or accessibility notes recorded.</p>'}
        </div>
      </div>

      <div class="bg-white rounded-xl border border-olive-100 p-5 xl:col-span-2">
        <h3 class="font-bold">Running Order</h3>
        ${runningOrder.length ? `<div class="mt-3 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-gray-500 border-b"><th class="py-2">Time</th><th>Event</th><th>Responsible</th><th>Location</th></tr></thead><tbody>${runningOrder.map(x=>`<tr class="border-b border-gray-100"><td class="py-2 font-bold">${esc(x.startTime)}</td><td>${esc(x.title)}</td><td>${esc(x.responsible||'—')}</td><td>${esc(x.location||'—')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-sm text-gray-500 mt-2">No running order created.</p>'}
      </div>

      <div class="bg-white rounded-xl border border-olive-100 p-5">
        <h3 class="font-bold">Outstanding Tasks</h3>
        <div class="mt-3 space-y-2">
          ${tasks.filter(x=>!x.completed).length ? tasks.filter(x=>!x.completed).slice(0,10).map(x=>`<div class="text-sm flex justify-between gap-3"><span>${esc(x.title)}</span><span class="text-gray-400">${esc(x.assignee||'')}</span></div>`).join('') : '<p class="text-sm text-green-700">All tasks complete.</p>'}
        </div>
      </div>

      <div class="bg-white rounded-xl border border-olive-100 p-5">
        <h3 class="font-bold">Documents</h3>
        <div class="mt-3 space-y-2">
          ${documents.length ? documents.slice(0,10).map(x=>`<div class="text-sm flex justify-between gap-3"><span>${esc(x.title||x.fileName)}</span><span class="text-gray-400">${esc(x.category||'')}</span></div>`).join('') : '<p class="text-sm text-gray-500">No documents uploaded.</p>'}
        </div>
      </div>

      <div class="bg-white rounded-xl border border-olive-100 p-5 xl:col-span-2">
        <h3 class="font-bold">Operational Notes</h3>
        <p class="text-sm text-gray-600 mt-2 whitespace-pre-wrap">${esc(window.WeddingFinalisation?.visibleOperationalNotes ? (WeddingFinalisation.visibleOperationalNotes(sheet)||'No operational notes added.') : (sheet?.operationalNotes || 'No operational notes added.'))}</p>
        ${sheet?.emergencyContact?`<p class="text-sm mt-4"><strong>Emergency Contact:</strong> ${esc(sheet.emergencyContact)}</p>`:''}
      </div>
    </div>
  </div>`;
}
function renderFunctionSheetChoiceGroup(title,items) {
  return `<div class="bg-cream-50 rounded-xl p-4"><h4 class="font-bold">${esc(title)}</h4><div class="mt-2 space-y-1">${items.length?items.map(([name,count])=>`<div class="flex justify-between text-sm gap-3"><span>${esc(name)}</span><strong>${count}</strong></div>`).join(''):'<p class="text-sm text-gray-400">None entered</p>'}</div></div>`;
}
function openWeddingFunctionSheetSettings(weddingId) {
  const sheet=functionSheetFor(weddingId);
  openModal(`<div class="p-6">
    <div class="flex justify-between items-center mb-4"><div><h2 class="text-lg font-bold">Function Sheet Details</h2><p class="text-xs text-gray-500">Control information shown on printed copies.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="saveWeddingFunctionSheet(event,'${weddingId}')" class="space-y-3">
      <div class="grid grid-cols-3 gap-3">
        <label class="text-xs font-medium block">Version<input name="version" type="number" min="1" value="${sheet?.version||1}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <label class="text-xs font-medium block">Prepared By<select name="preparedBy" class="mt-1 w-full px-3 py-2 border rounded-lg">${staffOptions(sheet?.preparedBy||'',true)}</select></label>
        <label class="text-xs font-medium block">Approved By<select name="approvedBy" class="mt-1 w-full px-3 py-2 border rounded-lg">${staffOptions(sheet?.approvedBy||'',true)}</select></label>
      </div>
      <label class="text-xs font-medium block">Emergency Contact<input name="emergencyContact" value="${esc(sheet?.emergencyContact||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      <label class="text-xs font-medium block">Operational Notes<textarea name="operationalNotes" rows="7" class="mt-1 w-full px-3 py-2 border rounded-lg">${esc(sheet?.operationalNotes||'')}</textarea></label>
      <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save Function Sheet Details</button>
    </form>
  </div>`);
}
async function saveWeddingFunctionSheet(ev,weddingId) {
  ev.preventDefault();const f=new FormData(ev.target);
  const existing=functionSheetFor(weddingId);
  const record={wedding_id:weddingId,version:Number(f.get('version')||1),prepared_by:f.get('preparedBy')||null,approved_by:f.get('approvedBy')||null,emergency_contact:f.get('emergencyContact')||null,operational_notes:f.get('operationalNotes')||null,updated_at:new Date().toISOString()};
  const result=existing?await supabaseClient.from('wedding_function_sheets').update(record).eq('id',existing.id):await supabaseClient.from('wedding_function_sheets').insert(record);
  if(result.error){console.error(result.error);toast('Function sheet details could not be saved','error');return;}
  await addWeddingTimelineEntry(weddingId,'Planning','Function sheet details saved',`Version ${record.version}`);
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Function sheet details saved');
}
async function recordWeddingFunctionSheetGeneration(weddingId,copyType) {
  const existing=functionSheetFor(weddingId);
  const stamp=new Date().toISOString();
  if(existing){
    await supabaseClient.from('wedding_function_sheets').update({generated_at:stamp,updated_at:stamp}).eq('id',existing.id);
  }else{
    await supabaseClient.from('wedding_function_sheets').insert({wedding_id:weddingId,version:1,generated_at:stamp,updated_at:stamp});
  }
  await addWeddingTimelineEntry(weddingId,'Planning','Function sheet generated',copyType);
}
function buildWeddingFunctionSheetHtml(weddingId,copyType='full') {
  if(window.WeddingInternalDocumentEngine?.build) return window.WeddingInternalDocumentEngine.build(weddingId,copyType);
  const wedding=DB.weddings.find(x=>x.id===weddingId);
  const sheet=functionSheetFor(weddingId);
  const rows=runningOrderFor(weddingId);
  const guests=weddingGuestsFor(weddingId);
  const tables=seatingTablesFor(weddingId);
  const tasks=(DB.weddingTasks||[]).filter(x=>x.weddingId===weddingId&&!x.completed);
  const docs=(DB.weddingDocuments||[]).filter(x=>x.weddingId===weddingId);
  const payments=(DB.weddingPayments||[]).filter(x=>x.weddingId===weddingId);
  const starters=countChoice(guests,'starterChoice'),mains=countChoice(guests,'mainChoice'),desserts=countChoice(guests,'dessertChoice'),evening=countChoice(guests,'eveningFoodChoice');
  const dietary=guests.filter(x=>x.dietaryRequirements||x.accessibilityNotes);
  const copyTitle={full:'Full Function Sheet',kitchen:'Kitchen Copy',bar:'Bar Copy',coordinator:'Coordinator Copy'}[copyType]||'Function Sheet';

  const showKitchen=copyType==='full'||copyType==='kitchen';
  const showRunning=copyType==='full'||copyType==='bar'||copyType==='coordinator';
  const showTables=copyType==='full'||copyType==='coordinator';
  const showAdmin=copyType==='full'||copyType==='coordinator';

  const choiceTable=(title,items)=>`<div class="box"><h3>${title}</h3>${items.length?`<table>${items.map(([n,c])=>`<tr><td>${esc(n)}</td><td class="count">${c}</td></tr>`).join('')}</table>`:'<p>None entered</p>'}</div>`;

  return `<!doctype html><html><head><title>${esc(wedding?.couple||'Wedding')} ${copyTitle}</title><style>
    body{font-family:Arial,sans-serif;color:#222;padding:28px;font-size:12px}h1{font-size:24px;margin:0}h2{font-size:16px;margin:0 0 8px}h3{font-size:13px;margin:0 0 8px}
    .header{display:flex;justify-content:space-between;border-bottom:3px solid #4f5f38;padding-bottom:14px}.muted{color:#666}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:14px}
    .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}.box{border:1px solid #ccc;border-radius:8px;padding:12px;break-inside:avoid}
    table{width:100%;border-collapse:collapse}th,td{padding:6px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}.count{text-align:right;font-weight:bold}
    .section{margin-top:16px;break-inside:avoid}.note{white-space:pre-wrap}.alert{color:#9b1c1c;font-weight:bold}
    @media print{body{padding:0}.page-break{page-break-before:always}}
  </style></head><body>
  <div class="header"><div><h1>${esc(wedding?.couple||'Wedding')}</h1><p class="muted">${esc(wedding?.date||'Date TBC')} · ${copyTitle}</p></div><div><strong>Version ${sheet?.version||1}</strong><br><span class="muted">Prepared: ${esc(sheet?.preparedBy||'Not set')}</span></div></div>

  <div class="grid">
    <div class="box"><h2>Event Details</h2><table>
      <tr><td>Package</td><td><strong>${esc(wedding?.package||wedding?.packageName||'Not set')}</strong></td></tr>
      <tr><td>Coordinator</td><td><strong>${esc(wedding?.coordinator||'Unassigned')}</strong></td></tr>
      <tr><td>Day Guests</td><td><strong>${Number(wedding?.dayGuests||wedding?.day_guests||0)}</strong></td></tr>
      <tr><td>Evening Guests</td><td><strong>${Number(wedding?.eveningGuests||wedding?.evening_guests||0)}</strong></td></tr>
    </table></div>
    <div class="box"><h2>Control</h2><table>
      <tr><td>Approved By</td><td><strong>${esc(sheet?.approvedBy||'Not set')}</strong></td></tr>
      <tr><td>Emergency Contact</td><td><strong>${esc(sheet?.emergencyContact||'Not set')}</strong></td></tr>
      <tr><td>Tables</td><td><strong>${tables.length}</strong></td></tr>
      <tr><td>Guest Records</td><td><strong>${guests.length}</strong></td></tr>
    </table></div>
  </div>

  ${showKitchen?`<div class="section"><h2>Kitchen Summary</h2><div class="grid4">${choiceTable('Starters',starters)}${choiceTable('Mains',mains)}${choiceTable('Desserts',desserts)}${choiceTable('Evening Food',evening)}</div></div>
  <div class="section"><h2>Dietary & Accessibility</h2>${dietary.length?`<table><tr><th>Guest</th><th>Requirements</th><th>Table</th></tr>${dietary.map(g=>{const table=tables.find(t=>t.id===g.tableId);return `<tr><td><strong>${esc(g.guestName)}</strong></td><td class="alert">${esc([g.dietaryRequirements,g.accessibilityNotes].filter(Boolean).join(' · '))}</td><td>${esc(table?.tableName||'Unassigned')}</td></tr>`}).join('')}</table>`:'<p>No dietary or accessibility notes recorded.</p>'}</div>`:''}

  ${showRunning?`<div class="section"><h2>Running Order</h2>${rows.length?`<table><tr><th>Time</th><th>Event</th><th>Responsible</th><th>Location</th><th>Notes</th></tr>${rows.map(x=>`<tr><td><strong>${esc(x.startTime)}</strong></td><td>${esc(x.title)}</td><td>${esc(x.responsible||'—')}</td><td>${esc(x.location||'—')}</td><td>${esc(x.notes||'')}</td></tr>`).join('')}</table>`:'<p>No running order created.</p>'}</div>`:''}

  ${showTables?`<div class="section"><h2>Table Plan</h2><div class="grid">${tables.map(t=>`<div class="box"><h3>${esc(t.tableName)} (${guestsAtTable(t.id).length}/${t.capacity})</h3><ol>${guestsAtTable(t.id).sort((a,b)=>a.guestName.localeCompare(b.guestName)).map(g=>`<li>${esc(g.guestName)}${g.mainChoice?` — ${esc(g.mainChoice)}`:''}${g.dietaryRequirements?` <span class="alert">(${esc(g.dietaryRequirements)})</span>`:''}</li>`).join('')}</ol></div>`).join('')}</div></div>`:''}

  ${showAdmin?`<div class="section"><h2>Outstanding Tasks</h2>${tasks.length?`<table>${tasks.map(t=>`<tr><td>${esc(t.title)}</td><td>${esc(t.assignee||'')}</td><td>${esc(t.dueDate||'')}</td></tr>`).join('')}</table>`:'<p>All tasks complete.</p>'}</div>
  <div class="section"><h2>Documents</h2>${docs.length?`<table>${docs.map(d=>`<tr><td>${esc(d.title||d.fileName)}</td><td>${esc(d.category||'')}</td></tr>`).join('')}</table>`:'<p>No documents uploaded.</p>'}</div>
  <div class="section"><h2>Payments</h2>${payments.length?`<table>${payments.map(p=>`<tr><td>${esc(p.type||p.paymentType||'Payment')}</td><td>£${Number(p.amount||0).toFixed(2)}</td><td>${esc(p.status||'')}</td></tr>`).join('')}</table>`:'<p>No payments recorded.</p>'}</div>`:''}

  <div class="section box"><h2>Operational Notes</h2><div class="note">${esc(sheet?.operationalNotes||'No operational notes added.')}</div></div>
  </body></html>`;
}
async function printWeddingFunctionSheet(weddingId,copyType='full') {
  const html=buildWeddingFunctionSheetHtml(weddingId,copyType);
  await recordWeddingFunctionSheetGeneration(weddingId,copyType);
  const win=window.open('','_blank');
  win.document.write(html);win.document.close();win.focus();setTimeout(()=>win.print(),250);
}




const FLOOR_PLAN_LIBRARY = [
  {type:'round-table-8',label:'Round Table (8)',icon:'circle',w:15,h:19,category:'Tables'},
  {type:'round-table-10',label:'Round Table (10)',icon:'circle',w:16,h:20,category:'Tables'},
  {type:'round-table-12',label:'Round Table (12)',icon:'circle',w:17,h:21,category:'Tables'},
  {type:'round-table',label:'Round Table (8)',icon:'circle',w:15,h:19,category:'Tables'},
  {type:'rectangle-table',label:'Rectangle Table',icon:'rectangle-horizontal',w:18,h:10,category:'Tables'},
  {type:'top-table',label:'Top Table',icon:'rectangle-horizontal',w:30,h:12,category:'Tables'},
  {type:'sweetheart-table',label:'Sweetheart Table',icon:'heart',w:15,h:10,category:'Tables'},
  {type:'cake-table',label:'Cake Table',icon:'cake-slice',w:11,h:13,category:'Features'},
  {type:'gift-table',label:'Gift Table',icon:'gift',w:15,h:9,category:'Features'},
  {type:'sweet-cart',label:'Sweet Cart',icon:'candy',w:13,h:10,category:'Features'},
  {type:'love-letters',label:'LOVE Letters',icon:'type',w:18,h:8,category:'Features'},
  {type:'photo-booth',label:'Photo Booth',icon:'camera',w:15,h:12,category:'Features'},
  {type:'photo-swing',label:'Photo Swing',icon:'image',w:15,h:11,category:'Features'},
  {type:'dj',label:'DJ / Band',icon:'music-2',w:16,h:10,category:'Evening'},
  {type:'stage',label:'Stage',icon:'panel-top',w:23,h:11,category:'Evening'},
  {type:'bar',label:'Bar',icon:'wine',w:22,h:9,category:'Evening'},
  {type:'buffet',label:'Buffet',icon:'utensils',w:24,h:9,category:'Evening'},
  {type:'ceremony-chairs',label:'Ceremony Chair Block',icon:'rows-3',w:21,h:25,category:'Ceremony'},
  {type:'aisle',label:'Aisle Runner',icon:'move-vertical',w:9,h:31,category:'Ceremony'},
  {type:'registrar-table',label:'Ceremony Table',icon:'clipboard-signature',w:16,h:9,category:'Ceremony'},
  {type:'floral-arch',label:'Floral Arch',icon:'flower-2',w:18,h:9,category:'Ceremony'},
  {type:'divider',label:'Divider Wall',icon:'panel-left',w:5,h:35,category:'Room'},
  {type:'door',label:'Door',icon:'door-open',w:8,h:5,category:'Room'},
  {type:'custom',label:'Custom Item',icon:'square-dashed',w:14,h:10,category:'Other'}
];

const FLOOR_PLAN_MODES = {
  ceremony: {label:'Ceremony',icon:'heart-handshake',description:'Guest arrival, aisle and ceremony seating'},
  breakfast: {label:'Wedding Breakfast',icon:'utensils',description:'Top table, dining tables and service layout'},
  evening: {label:'Evening Reception',icon:'party-popper',description:'Dancefloor, DJ, bar, buffet and evening features'}
};

function floorPlanMeta(notes='') {
  const value = String(notes || '');
  const plan = value.match(/\[\[plan:(ceremony|breakfast|evening)\]\]/i)?.[1]?.toLowerCase() || 'breakfast';
  const cleanNotes = value
    .replace(/\[\[plan:(ceremony|breakfast|evening)\]\]/ig,'')
    .replace(/\[\[seats:\d+\]\]/ig,'')
    .trim();
  return {plan,cleanNotes};
}
function floorPlanWithMeta(notes='',plan=weddingFloorPlanMode,seats='') {
  const clean = floorPlanMeta(notes).cleanNotes;
  return `${clean}${clean ? '\n' : ''}[[plan:${plan}]]${seats ? `[[seats:${seats}]]` : ''}`;
}
function floorPlanSeatCount(item) {
  const typeMatch = String(item?.itemType || '').match(/round-table-(8|10|12)/);
  if (typeMatch) return Number(typeMatch[1]);
  const noteMatch = String(item?.notes || '').match(/\[\[seats:(\d+)\]\]/i);
  return noteMatch ? Number(noteMatch[1]) : 8;
}
function floorPlanAllItemsFor(weddingId) {
  return (DB.weddingFloorPlanItems || [])
    .filter(x => x.weddingId === weddingId)
    .sort((a,b) => a.sortOrder - b.sortOrder);
}
function floorPlanItemsFor(weddingId,mode=weddingFloorPlanMode) {
  return floorPlanAllItemsFor(weddingId)
    .filter(item => floorPlanMeta(item.notes).plan === mode);
}
function floorPlanLibraryItem(type) {
  return FLOOR_PLAN_LIBRARY.find(x => x.type === type) ||
    (String(type).startsWith('round-table') ? FLOOR_PLAN_LIBRARY[0] : FLOOR_PLAN_LIBRARY[FLOOR_PLAN_LIBRARY.length-1]);
}
function setWeddingFloorPlanMode(weddingId,mode) {
  weddingFloorPlanMode = mode;
  weddingFloorPlanGuestView = false;
  renderWeddingWorkspace();
}
function floorPlanModeButton(weddingId,mode) {
  const config = FLOOR_PLAN_MODES[mode];
  const active = weddingFloorPlanMode === mode;
  return `<button onclick="setWeddingFloorPlanMode('${weddingId}','${mode}')"
    class="flex-1 min-w-[170px] px-4 py-3 rounded-xl border text-left transition ${active ? 'bg-olive-700 text-white border-olive-700 shadow-md' : 'bg-white text-charcoal-900 border-gray-200 hover:border-olive-300'}">
    <span class="flex items-center gap-2 font-semibold">
      <i data-lucide="${config.icon}" style="width:17px;height:17px"></i>${config.label}
    </span>
    <span class="block text-[12px] mt-1 ${active ? 'text-white/70' : 'text-gray-500'}">${config.description}</span>
  </button>`;
}
function floorPlanStats(wedding) {
  const items = floorPlanItemsFor(wedding.id);
  const tables = items.filter(item => String(item.itemType).startsWith('round-table') || ['rectangle-table','top-table','sweetheart-table'].includes(item.itemType));
  const seats = items.filter(item => String(item.itemType).startsWith('round-table')).reduce((sum,item)=>sum+floorPlanSeatCount(item),0);
  return {items:items.length,tables:tables.length,seats};
}
function floorPlanLibraryGroups() {
  return [...new Set(FLOOR_PLAN_LIBRARY.map(item=>item.category))];
}
function floorPlanToolPreview(item) {
  if (String(item.type).startsWith('round-table')) {
    const seats = Number(item.type.split('-').pop()) || 8;
    return `<span class="relative block w-9 h-9 mx-auto">
      <span class="absolute inset-[7px] rounded-full bg-white border-2 border-olive-500 shadow-sm"></span>
      ${Array.from({length:Math.min(seats,10)},(_,index)=>{
        const angle=(360/Math.min(seats,10))*index;
        return `<span class="absolute left-1/2 top-1/2 w-1.5 h-2 bg-cream-200 border border-olive-400 rounded-sm"
          style="transform:translate(-50%,-50%) rotate(${angle}deg) translateY(-17px)"></span>`;
      }).join('')}
    </span>`;
  }
  return `<span class="w-9 h-9 rounded-lg bg-cream-50 border border-olive-100 flex items-center justify-center mx-auto">
    <i data-lucide="${item.icon}" class="text-olive-700" style="width:18px;height:18px"></i>
  </span>`;
}
function renderGranaryRoomBackground() {
  return `
    <div class="absolute inset-[2.4%] rounded-[4px] bg-[#f8f3e9] border-[8px] border-[#171914] shadow-inner pointer-events-none overflow-hidden">
      <div class="absolute inset-0 opacity-45" style="background-image:
        radial-gradient(circle at 20% 15%,rgba(105,125,72,.10),transparent 21%),
        radial-gradient(circle at 84% 82%,rgba(183,144,72,.09),transparent 24%),
        linear-gradient(90deg,rgba(255,255,255,.45),rgba(245,237,222,.55));"></div>

      <div class="absolute left-[29%] top-[26%] w-[46%] h-[47%] rounded-sm border border-[#b78345] shadow-inner"
        style="background:
          repeating-linear-gradient(90deg,#bc844d 0,#bc844d 5px,#c9955e 5px,#c9955e 10px);
          box-shadow:0 0 0 4px rgba(212,164,92,.20),inset 0 0 28px rgba(92,48,15,.20);">
        <div class="absolute inset-0 flex items-center justify-center text-white/90 text-xl font-bold tracking-wider text-center">DANCE<br>FLOOR</div>
        <div class="absolute inset-0 border-2 border-amber-200/70"></div>
      </div>

      ${[
        ['27.8%','24.5%'],['73.4%','24.5%'],['27.8%','72%'],['73.4%','72%']
      ].map(([left,top])=>`<div class="absolute w-[3.1%] aspect-square bg-[#11130f] border border-black shadow-lg" style="left:${left};top:${top}"></div>`).join('')}

      <div class="absolute left-[-9px] top-[43%] w-[9px] h-[17%] bg-[#f8f3e9]"></div>
      <div class="absolute -left-[3px] top-[46%] -rotate-90 origin-center text-[12px] font-bold tracking-widest text-olive-800 bg-olive-100 px-2 py-1 rounded">ENTRANCE</div>

      <div class="absolute top-[-9px] left-[41%] w-[18%] h-[9px] bg-[#f8f3e9]"></div>
      <div class="absolute -top-[1px] left-1/2 -translate-x-1/2 text-[12px] font-bold tracking-widest text-olive-800 bg-olive-100 px-3 py-1 rounded-b-lg">GARDEN ENTRANCE</div>

      <div class="absolute top-[0.8%] left-[46.5%] w-[7%] h-[8%] border-x border-b border-gray-500 bg-white/45"></div>
      <div class="absolute left-[0.7%] top-[44%] w-[5%] h-[12%] border-y border-r border-gray-500 bg-white/45"></div>

      <div class="absolute inset-x-2 top-2 h-[2px] bg-amber-200/70 shadow-[0_0_8px_2px_rgba(251,191,36,.35)]"></div>
      <div class="absolute inset-x-2 bottom-2 h-[2px] bg-amber-200/70 shadow-[0_0_8px_2px_rgba(251,191,36,.35)]"></div>
      <div class="absolute inset-y-2 left-2 w-[2px] bg-amber-200/70 shadow-[0_0_8px_2px_rgba(251,191,36,.35)]"></div>
      <div class="absolute inset-y-2 right-2 w-[2px] bg-amber-200/70 shadow-[0_0_8px_2px_rgba(251,191,36,.35)]"></div>
    </div>`;
}
function roundTableVisual(item) {
  const seats = floorPlanSeatCount(item);
  const visibleSeats = Math.min(seats,12);
  return `<div class="relative w-full h-full">
    ${Array.from({length:visibleSeats},(_,index)=>{
      const angle=(360/visibleSeats)*index;
      return `<span class="absolute left-1/2 top-1/2 w-[12%] h-[16%] bg-[#f3eadb] border border-[#9f8b70] rounded-[35%] shadow-sm"
        style="transform:translate(-50%,-50%) rotate(${angle}deg) translateY(-260%)"></span>`;
    }).join('')}
    <div class="absolute left-1/2 top-1/2 w-[63%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white to-[#eee4d3] border border-[#aa9b85] shadow-lg flex flex-col items-center justify-center">
      <span class="w-7 h-7 rounded-full bg-olive-700 text-white flex items-center justify-center text-[12px] font-bold shadow">${esc(item.label || 'Table')}</span>
      <span class="mt-1 text-[12px] text-gray-500">${seats} seats</span>
      <span class="mt-1 text-[12px]">🌿</span>
    </div>
  </div>`;
}
function rectangleTableVisual(item,topTable=false) {
  return `<div class="relative w-full h-full flex items-center justify-center">
    <div class="absolute inset-[13%_4%] rounded-md bg-gradient-to-b from-white to-[#eee5d7] border border-[#a99982] shadow-lg"></div>
    ${Array.from({length:topTable ? 7 : 4},(_,index)=>{
      const count=topTable?7:4;
      const left=10+(80/(count-1))*index;
      return `<span class="absolute top-[1%] w-[8%] h-[18%] rounded-t bg-[#f3eadb] border border-[#9f8b70]" style="left:${left}%"></span>`;
    }).join('')}
    <span class="relative z-10 text-[12px] font-bold tracking-wide">${esc(item.label || (topTable?'TOP TABLE':'TABLE'))}</span>
    ${topTable?'<span class="absolute bottom-[10%] left-[8%] right-[8%] h-[10%] rounded-full bg-gradient-to-r from-olive-200 via-white to-olive-200"></span>':''}
  </div>`;
}
function ceremonyChairBlockVisual(item) {
  return `<div class="w-full h-full grid grid-cols-4 gap-[5%] p-[8%] rounded-lg bg-white/35 border border-dashed border-olive-400">
    ${Array.from({length:20},()=>'<span class="rounded-t-md bg-[#f3eadb] border border-[#9f8b70] shadow-sm"></span>').join('')}
  </div>`;
}
function floorPlanItemVisual(item) {
  const lib=floorPlanLibraryItem(item.itemType);
  const type=item.itemType;
  if(String(type).startsWith('round-table')) return roundTableVisual(item);
  if(type==='top-table') return rectangleTableVisual(item,true);
  if(['rectangle-table','sweetheart-table','registrar-table','gift-table','buffet','bar'].includes(type)) return rectangleTableVisual(item,false);
  if(type==='ceremony-chairs') return ceremonyChairBlockVisual(item);
  if(type==='aisle') {
    const horizontal=Number(item.width||0) >= Number(item.height||0);
    return `<div class="w-full h-full rounded-full border border-amber-300 ${horizontal?'bg-gradient-to-r':'bg-gradient-to-b'} from-white via-amber-50 to-white shadow-inner flex items-center justify-center">
      <span class="text-[12px] font-bold text-amber-800 whitespace-nowrap ${horizontal?'':'-rotate-90'}">${esc(item.label||'AISLE')}</span>
    </div>`;
  }
  if(type==='floral-arch') return `<div class="w-full h-full rounded-t-full border-[5px] border-olive-400 border-b-0 flex items-end justify-center text-lg">🌿🌸🌿</div>`;
  if(type==='dj') return `<div class="w-full h-full rounded-lg bg-[#242821] border-2 border-[#111] text-white shadow-lg flex flex-col items-center justify-center"><span class="text-lg">🎧</span><span class="text-[12px] font-bold">${esc(item.label||'DJ')}</span></div>`;
  if(type==='love-letters') return `<div class="w-full h-full flex items-center justify-center text-[clamp(12px,2vw,28px)] font-black tracking-wider text-amber-500 drop-shadow">LOVE</div>`;
  if(type==='cake-table') return `<div class="w-full h-full rounded-full bg-white border border-[#aa9b85] shadow-lg flex flex-col items-center justify-center"><span class="text-xl">🎂</span><span class="text-[12px] font-bold">${esc(item.label||'CAKE')}</span></div>`;
  if(type==='sweet-cart') return `<div class="w-full h-full rounded-lg bg-[#f9eadf] border-2 border-[#ad7654] shadow flex flex-col items-center justify-center"><span class="text-lg">🍬</span><span class="text-[12px] font-bold">${esc(item.label||'SWEET CART')}</span></div>`;
  if(type==='photo-booth'||type==='photo-swing') return `<div class="w-full h-full rounded-lg bg-gray-800 text-white border-2 border-gray-950 shadow-lg flex flex-col items-center justify-center"><i data-lucide="${lib.icon}" style="width:19px;height:19px"></i><span class="text-[12px] font-bold mt-1">${esc(item.label||lib.label)}</span></div>`;
  if(type==='divider') return `<div class="w-full h-full bg-gray-700 border-x-2 border-gray-950 shadow-lg"></div>`;
  if(type==='door') return `<div class="w-full h-full border-2 border-gray-700 border-b-0 rounded-t-full bg-white/50"></div>`;
  return `<div class="w-full h-full rounded-lg border-2 border-olive-500 bg-white/95 shadow-sm flex flex-col items-center justify-center text-center p-1">
    <i data-lucide="${lib.icon}" class="text-olive-700" style="width:18px;height:18px"></i>
    <span class="block text-[12px] font-bold mt-1 leading-tight">${esc(item.label || lib.label)}</span>
  </div>`;
}
function renderWeddingFloorPlanBuilder(wedding) {
  if (!weddingFloorPlanTablesReady) {
    return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h3 class="font-bold">Floor Plan setup required</h3>
      <p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-floor-plan.sql</strong> in Supabase, then refresh.</p>
    </div>`;
  }

  const items = floorPlanItemsFor(wedding.id);
  const stats = floorPlanStats(wedding);
  const mode = FLOOR_PLAN_MODES[weddingFloorPlanMode];

  return `<div class="space-y-4">
    <div class="bg-white rounded-xl border border-olive-100 p-4 shadow-sm">
      <div class="flex flex-col 2xl:flex-row 2xl:items-center gap-4">
        <div class="flex-1">
          <p class="text-xs font-bold tracking-widest text-olive-600">THE GRANARY EXPERIENCE</p>
          <h3 class="font-bold text-xl text-charcoal-900">Visual Wedding Floor Plan</h3>
          <p class="text-sm text-gray-500 mt-1">Build each part of the day so the couple can picture how their wedding will look.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="generateWeddingFloorPlanLayout('${wedding.id}','${weddingFloorPlanMode}')"
            class="px-4 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-semibold shadow-sm">
            ✦ Generate ${mode.label}
          </button>
          <button onclick="openWeddingFloorPlanGuestView('${wedding.id}')"
            class="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold">
            <span class="inline-flex items-center gap-2"><i data-lucide="eye" style="width:16px;height:16px"></i>Guest View</span>
          </button>
          <button onclick="printWeddingFloorPlan('${wedding.id}')"
            class="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold">
            <span class="inline-flex items-center gap-2"><i data-lucide="printer" style="width:16px;height:16px"></i>Print</span>
          </button>
          <button onclick="saveWeddingFloorPlanSnapshot('${wedding.id}')"
            class="px-4 py-2.5 bg-olive-700 text-white rounded-lg text-sm font-semibold">Save Plan</button>
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto mt-4 pt-4 border-t border-gray-100">
        ${Object.keys(FLOOR_PLAN_MODES).map(modeName=>floorPlanModeButton(wedding.id,modeName)).join('')}
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="kpi-card"><p class="text-xs text-gray-500">Day Guests</p><p class="text-2xl font-bold mt-1">${Number(wedding.dayGuests||0)}</p></div>
      <div class="kpi-card"><p class="text-xs text-gray-500">Evening Guests</p><p class="text-2xl font-bold mt-1">${Number(wedding.eveningGuests||0)}</p></div>
      <div class="kpi-card"><p class="text-xs text-gray-500">Tables</p><p class="text-2xl font-bold mt-1">${stats.tables}</p></div>
      <div class="kpi-card"><p class="text-xs text-gray-500">Seated Capacity</p><p class="text-2xl font-bold mt-1">${stats.seats}</p></div>
    </div>

    <div id="floor-plan-workspace-shell" class="grid xl:grid-cols-[190px_minmax(720px,1fr)_250px] gap-3 min-w-0">
      <aside id="floor-plan-library-panel" class="bg-white rounded-xl border border-olive-100 overflow-hidden shadow-sm">
        <div class="p-4 border-b border-gray-100">
          <p class="text-xs font-bold tracking-widest text-olive-600">ADD ITEMS</p>
          <p class="text-xs text-gray-500 mt-1">Drag onto the room or click to add.</p>
        </div>
        <div class="max-h-[680px] overflow-y-auto p-2">
          ${floorPlanLibraryGroups().map(group=>`
            <div class="mb-3">
              <p class="px-2 py-1 text-[12px] font-bold tracking-widest text-gray-400">${group.toUpperCase()}</p>
              <div class="space-y-1">
                ${FLOOR_PLAN_LIBRARY.filter(item=>item.category===group).map(item=>`
                  <button draggable="true" data-library-type="${item.type}"
                    onclick="addWeddingFloorPlanItem('${wedding.id}','${item.type}',7,8)"
                    class="floor-library-item w-full flex items-center gap-3 px-2 py-2.5 border border-transparent rounded-lg hover:border-olive-200 hover:bg-cream-50 text-left">
                    ${floorPlanToolPreview(item)}
                    <span class="text-xs font-medium">${esc(item.label)}</span>
                  </button>`).join('')}
              </div>
            </div>`).join('')}
          <button onclick="clearWeddingFloorPlan('${wedding.id}')" class="w-full px-3 py-2 mt-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg">Clear ${mode.label}</button>
        </div>
      </aside>

      <main class="bg-white rounded-xl border border-olive-100 p-3 shadow-sm overflow-auto min-w-0">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p class="text-xs font-bold tracking-widest text-olive-600">${mode.label.toUpperCase()}</p>
            <h3 class="font-bold text-charcoal-900">The Granary</h3>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="toggleFloorPlanLibrary()" class="px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-medium">Items</button>
            <button onclick="toggleFloorPlanInspector()" class="px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-medium">Details</button>
            <button onclick="toggleWeddingFloorPlanWorkspace('${wedding.id}',true)" class="px-3 py-1.5 bg-charcoal-900 text-white rounded-lg text-xs font-medium">Full Screen</button>
            <button id="floor-plan-close-workspace" onclick="toggleWeddingFloorPlanWorkspace('${wedding.id}',false)" class="hidden px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">Close</button>
          </div>
        </div>

        <div id="wedding-floor-plan-canvas" data-wedding-id="${wedding.id}"
          class="relative min-w-[980px] overflow-hidden rounded-xl bg-[#ede7da]"
          style="aspect-ratio:16/10;min-height:610px;touch-action:none;">
          ${renderGranaryRoomBackground()}
          ${items.map(renderFloorPlanItem).join('')}
          ${items.length ? '' : `<div id="floor-plan-empty-state" class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div class="text-center bg-white/90 border border-white shadow-xl rounded-2xl px-6 py-5">
              <i data-lucide="${mode.icon}" class="mx-auto text-olive-700" style="width:34px;height:34px"></i>
              <p class="font-bold mt-2">Create the ${mode.label}</p>
              <p class="text-xs text-gray-500 mt-1">Use Generate Layout or drag items from the left.</p>
            </div>
          </div>`}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
          <p class="text-xs text-gray-500">Drag to move · Select to edit · Resize from the green corner · Changes autosave</p>
          <div class="flex items-center gap-3 text-[12px] text-gray-500">
            <span><span class="inline-block w-3 h-3 bg-[#bc844d] mr-1"></span>Dancefloor</span>
            <span><span class="inline-block w-3 h-3 bg-[#11130f] mr-1"></span>Fixed pillars</span>
            <span><span class="inline-block w-3 h-3 bg-olive-100 mr-1"></span>Entrances</span>
          </div>
        </div>
      </main>

      <aside id="floor-plan-inspector-panel" class="bg-white rounded-xl border border-olive-100 overflow-hidden shadow-sm">
        <div class="p-4 border-b border-gray-100">
          <p class="text-xs font-bold tracking-widest text-olive-600">ITEM DETAILS</p>
          <p class="text-xs text-gray-500 mt-1">Choose an item on the plan.</p>
        </div>
        <div id="floor-plan-inspector" class="p-4">
          <div class="text-center py-8 text-gray-400">
            <i data-lucide="mouse-pointer-2" class="mx-auto" style="width:28px;height:28px"></i>
            <p class="text-sm mt-2">No item selected</p>
          </div>
        </div>
      </aside>
    </div>
  </div>`;
}
function renderFloorPlanItem(item) {
  return `<div class="floor-plan-item absolute cursor-move select-none group"
    data-item-id="${item.id}"
    style="left:${item.x}%;top:${item.y}%;width:${item.width}%;height:${item.height}%;transform:rotate(${item.rotation}deg);z-index:${20+item.sortOrder};touch-action:none;">
      ${floorPlanItemVisual(item)}
      <div class="floor-plan-selection absolute -inset-1 rounded-xl border-2 border-transparent group-hover:border-olive-400 pointer-events-none"></div>
      <div class="floor-plan-resize-handle absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-olive-700 border-2 border-white rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 shadow"></div>
    </div>`;
}
function toggleWeddingFloorPlanWorkspace(weddingId,open) {
  const shell=document.getElementById('floor-plan-workspace-shell');
  const closeBtn=document.getElementById('floor-plan-close-workspace');
  if(!shell)return;

  if(open){
    shell.classList.add('fixed','inset-0','z-[9999]','bg-[#f6f4ef]','p-3');
    shell.classList.remove('xl:grid-cols-[190px_minmax(720px,1fr)_250px]');
    shell.style.gridTemplateColumns='190px minmax(0,1fr) 260px';
    shell.style.height='100vh';
    shell.style.overflow='hidden';
    document.body.style.overflow='hidden';
    closeBtn?.classList.remove('hidden');

    const canvas=document.getElementById('wedding-floor-plan-canvas');
    if(canvas){
      canvas.style.minWidth='0';
      canvas.style.width='100%';
      canvas.style.height='calc(100vh - 104px)';
      canvas.style.minHeight='0';
      canvas.style.aspectRatio='auto';
    }
  }else{
    shell.classList.remove('fixed','inset-0','z-[9999]','bg-[#f6f4ef]','p-3');
    shell.classList.add('xl:grid-cols-[190px_minmax(720px,1fr)_250px]');
    shell.style.gridTemplateColumns='';
    shell.style.height='';
    shell.style.overflow='';
    document.body.style.overflow='';
    closeBtn?.classList.add('hidden');

    const canvas=document.getElementById('wedding-floor-plan-canvas');
    if(canvas){
      canvas.style.minWidth='980px';
      canvas.style.width='';
      canvas.style.height='';
      canvas.style.minHeight='610px';
      canvas.style.aspectRatio='16 / 10';
    }
  }
}
function toggleFloorPlanLibrary(){
  const panel=document.getElementById('floor-plan-library-panel');
  if(!panel)return;
  panel.classList.toggle('hidden');
  updateFloorPlanWorkspaceColumns();
}
function toggleFloorPlanInspector(){
  const panel=document.getElementById('floor-plan-inspector-panel');
  if(!panel)return;
  panel.classList.toggle('hidden');
  updateFloorPlanWorkspaceColumns();
}
function updateFloorPlanWorkspaceColumns(){
  const shell=document.getElementById('floor-plan-workspace-shell');
  const left=document.getElementById('floor-plan-library-panel');
  const right=document.getElementById('floor-plan-inspector-panel');
  if(!shell||!shell.classList.contains('fixed'))return;
  const cols=[];
  if(left&&!left.classList.contains('hidden'))cols.push('190px');
  cols.push('minmax(0,1fr)');
  if(right&&!right.classList.contains('hidden'))cols.push('260px');
  shell.style.gridTemplateColumns=cols.join(' ');
}
function initialiseWeddingFloorPlanBuilder(weddingId) {
  const canvas=document.getElementById('wedding-floor-plan-canvas');
  if(!canvas)return;

  let draggedLibraryType='';
  document.querySelectorAll('.floor-library-item').forEach(item=>{
    item.addEventListener('dragstart',e=>{
      draggedLibraryType=item.dataset.libraryType;
      e.dataTransfer.setData('text/plain',draggedLibraryType);
    });
  });

  canvas.addEventListener('dragover',e=>e.preventDefault());
  canvas.addEventListener('drop',async e=>{
    e.preventDefault();
    const type=e.dataTransfer.getData('text/plain')||draggedLibraryType;
    if(!type)return;
    const rect=canvas.getBoundingClientRect();
    const lib=floorPlanLibraryItem(type);
    const x=Math.max(4,Math.min(96-lib.w,((e.clientX-rect.left)/rect.width*100)-(lib.w/2)));
    const y=Math.max(4,Math.min(96-lib.h,((e.clientY-rect.top)/rect.height*100)-(lib.h/2)));
    await addWeddingFloorPlanItem(weddingId,type,x,y);
  });

  document.querySelectorAll('.floor-plan-item').forEach(el=>{
    const itemId=el.dataset.itemId;
    el.addEventListener('click',e=>{
      e.stopPropagation();
      selectWeddingFloorPlanItem(itemId);
    });
    makeFloorPlanItemDraggable(el,weddingId);
    const handle=el.querySelector('.floor-plan-resize-handle');
    if(handle)makeFloorPlanItemResizable(el,handle,weddingId);
  });

  canvas.addEventListener('click',()=>{
    document.querySelectorAll('.floor-plan-item').forEach(x=>x.classList.remove('ring-4','ring-amber-300'));
    const inspector=document.getElementById('floor-plan-inspector');
    if(inspector)inspector.innerHTML='<div class="text-center py-8 text-gray-400"><p class="text-sm">No item selected</p></div>';
  });
}
async function addWeddingFloorPlanItem(weddingId,type,x=5,y=5) {
  const lib=floorPlanLibraryItem(type);
  const label=type==='custom' ? prompt('What should this item be called?','Custom Item') : lib.label;
  if(type==='custom'&&!label)return;
  const seats=String(type).startsWith('round-table') ? floorPlanSeatCount({itemType:type,notes:''}) : '';
  const record={
    wedding_id:weddingId,
    item_type:type,
    label:label||lib.label,
    x_percent:Number(x.toFixed(2)),
    y_percent:Number(y.toFixed(2)),
    width_percent:lib.w,
    height_percent:lib.h,
    rotation_degrees:0,
    notes:floorPlanWithMeta('',weddingFloorPlanMode,seats),
    sort_order:floorPlanAllItemsFor(weddingId).length
  };
  const {error}=await supabaseClient.from('wedding_floor_plan_items').insert(record);
  if(error){console.error(error);toast('Item could not be added','error');return;}
  await addWeddingTimelineEntry(weddingId,'Planning','Floor plan item added',`${FLOOR_PLAN_MODES[weddingFloorPlanMode].label}: ${record.label}`);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(`${record.label} added`);
}
function makeFloorPlanItemDraggable(el,weddingId) {
  let startX=0,startY=0,startLeft=0,startTop=0,moved=false;
  el.addEventListener('pointerdown',e=>{
    if(e.target.classList.contains('floor-plan-resize-handle'))return;
    e.preventDefault();el.setPointerCapture(e.pointerId);
    const canvas=document.getElementById('wedding-floor-plan-canvas');
    const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===el.dataset.itemId);
    if(!canvas||!item)return;
    startX=e.clientX;startY=e.clientY;startLeft=item.x;startTop=item.y;moved=false;
    const move=ev=>{
      moved=true;
      const rect=canvas.getBoundingClientRect();
      const dx=(ev.clientX-startX)/rect.width*100;
      const dy=(ev.clientY-startY)/rect.height*100;
      const left=Math.max(3,Math.min(97-item.width,startLeft+dx));
      const top=Math.max(3,Math.min(97-item.height,startTop+dy));
      el.style.left=`${left}%`;el.style.top=`${top}%`;
    };
    const up=async()=>{
      el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);
      if(moved){
        await updateWeddingFloorPlanItemPosition(el.dataset.itemId,{
          x_percent:parseFloat(el.style.left),
          y_percent:parseFloat(el.style.top)
        });
      }
    };
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);
  });
}
function makeFloorPlanItemResizable(el,handle,weddingId) {
  handle.addEventListener('pointerdown',e=>{
    e.stopPropagation();e.preventDefault();handle.setPointerCapture(e.pointerId);
    const canvas=document.getElementById('wedding-floor-plan-canvas');
    const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===el.dataset.itemId);
    if(!canvas||!item)return;
    const startX=e.clientX,startY=e.clientY,startW=item.width,startH=item.height;
    const move=ev=>{
      const rect=canvas.getBoundingClientRect();
      let width=Math.max(6,Math.min(45,startW+(ev.clientX-startX)/rect.width*100));
      let height=Math.max(6,Math.min(45,startH+(ev.clientY-startY)/rect.height*100));
      if(String(item.itemType).startsWith('round-table')){
        const ratio=startW/startH;
        height=width/ratio;
      }
      el.style.width=`${width}%`;el.style.height=`${height}%`;
    };
    const up=async()=>{
      handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);
      await updateWeddingFloorPlanItemPosition(el.dataset.itemId,{
        width_percent:parseFloat(el.style.width),
        height_percent:parseFloat(el.style.height)
      });
    };
    handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);
  });
}
async function updateWeddingFloorPlanItemPosition(itemId,changes) {
  const {error}=await supabaseClient.from('wedding_floor_plan_items').update(changes).eq('id',itemId);
  if(error){console.error(error);toast('Floor plan could not be saved','error');return;}
  const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===itemId);
  if(item){
    if(changes.x_percent!==undefined)item.x=changes.x_percent;
    if(changes.y_percent!==undefined)item.y=changes.y_percent;
    if(changes.width_percent!==undefined)item.width=changes.width_percent;
    if(changes.height_percent!==undefined)item.height=changes.height_percent;
  }
}
function selectWeddingFloorPlanItem(itemId) {
  const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===itemId);if(!item)return;
  document.querySelectorAll('.floor-plan-item').forEach(x=>x.classList.remove('ring-4','ring-amber-300'));
  document.querySelector(`[data-item-id="${itemId}"]`)?.classList.add('ring-4','ring-amber-300');
  const lib=floorPlanLibraryItem(item.itemType);
  const meta=floorPlanMeta(item.notes);
  const inspector=document.getElementById('floor-plan-inspector');
  if(!inspector)return;
  const isRound=String(item.itemType).startsWith('round-table');
  inspector.innerHTML=`<form onsubmit="saveWeddingFloorPlanItem(event,'${itemId}')" class="space-y-4">
    <div class="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200">
      ${floorPlanToolPreview(lib)}
      <div><p class="font-bold">${esc(lib.label)}</p><p class="text-xs text-gray-500">${esc(FLOOR_PLAN_MODES[meta.plan].label)}</p></div>
    </div>
    <label class="text-xs font-medium block">Display Label
      <input name="label" value="${esc(item.label)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm">
    </label>
    ${isRound?`<label class="text-xs font-medium block">Seats
      <select name="seats" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm">
        ${[8,10,12].map(count=>`<option value="${count}" ${floorPlanSeatCount(item)===count?'selected':''}>${count}</option>`).join('')}
      </select>
    </label>`:''}
    <label class="text-xs font-medium block">Rotation
      <div class="flex items-center gap-2 mt-1">
        <input name="rotation" type="range" min="-180" max="180" step="5" value="${item.rotation}"
          oninput="previewFloorPlanRotation('${itemId}',this.value);this.nextElementSibling.textContent=this.value+'°'"
          onchange="saveWeddingFloorPlanRotation('${itemId}',this.value)"
          class="flex-1">
        <span class="text-xs w-10 text-right">${item.rotation}°</span>
      </div>
    </label>
    <label class="text-xs font-medium block">Setup Notes
      <textarea name="notes" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(meta.cleanNotes)}</textarea>
    </label>
    <div class="grid grid-cols-2 gap-2">
      <button type="button" onclick="duplicateWeddingFloorPlanItem('${itemId}')" class="py-2.5 bg-gray-100 rounded-lg text-sm font-medium">Duplicate</button>
      <button type="button" onclick="deleteWeddingFloorPlanItem('${itemId}')" class="py-2.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">Delete</button>
    </div>
    <button class="w-full py-2.5 bg-olive-700 text-white rounded-lg font-medium">Save Item</button>
  </form>`;
  if(window.lucide)lucide.createIcons();
}
function previewFloorPlanRotation(itemId,value) {
  const el=document.querySelector(`[data-item-id="${itemId}"]`);
  if(el)el.style.transform=`rotate(${Number(value)}deg)`;
}
async function saveWeddingFloorPlanRotation(itemId,value) {
  const rotation=Number(value||0);
  const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===itemId);
  if(item)item.rotation=rotation;

  const {error}=await supabaseClient
    .from('wedding_floor_plan_items')
    .update({rotation_degrees:rotation})
    .eq('id',itemId);

  if(error){
    console.error(error);
    toast('Rotation could not be saved','error');
    return;
  }
}
async function saveWeddingFloorPlanItem(ev,itemId) {
  ev.preventDefault();
  const f=new FormData(ev.target);
  const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===itemId);if(!item)return;
  const meta=floorPlanMeta(item.notes);
  const seats=Number(f.get('seats')||floorPlanSeatCount(item));
  const itemType=String(item.itemType).startsWith('round-table') ? `round-table-${seats}` : item.itemType;
  const record={
    label:String(f.get('label')||'').trim(),
    item_type:itemType,
    rotation_degrees:Number(f.get('rotation')||0),
    notes:floorPlanWithMeta(f.get('notes')||'',meta.plan,String(itemType).startsWith('round-table')?seats:'')
  };
  const {error}=await supabaseClient.from('wedding_floor_plan_items').update(record).eq('id',itemId);
  if(error){toast('Item could not be saved','error');return;}
  await addWeddingTimelineEntry(item.weddingId,'Planning','Floor plan item updated',record.label);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Floor plan item saved');
}
async function duplicateWeddingFloorPlanItem(itemId) {
  const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===itemId);if(!item)return;
  const record={
    wedding_id:item.weddingId,item_type:item.itemType,label:`${item.label} Copy`,
    x_percent:Math.min(90,item.x+3),y_percent:Math.min(90,item.y+3),
    width_percent:item.width,height_percent:item.height,rotation_degrees:item.rotation,
    notes:item.notes||floorPlanWithMeta('',weddingFloorPlanMode),
    sort_order:floorPlanAllItemsFor(item.weddingId).length
  };
  const {error}=await supabaseClient.from('wedding_floor_plan_items').insert(record);
  if(error){toast('Item could not be duplicated','error');return;}
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Item duplicated');
}
async function deleteWeddingFloorPlanItem(itemId) {
  const item=(DB.weddingFloorPlanItems||[]).find(x=>x.id===itemId);if(!item||!confirm(`Delete ${item.label}?`))return;
  const {error}=await supabaseClient.from('wedding_floor_plan_items').delete().eq('id',itemId);
  if(error){toast('Item could not be deleted','error');return;}
  await addWeddingTimelineEntry(item.weddingId,'Planning','Floor plan item deleted',item.label);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Item deleted');
}
async function clearWeddingFloorPlan(weddingId) {
  const items=floorPlanItemsFor(weddingId);if(!items.length)return;
  if(!confirm(`Clear the ${FLOOR_PLAN_MODES[weddingFloorPlanMode].label} plan? This cannot be undone.`))return;
  const ids=items.map(item=>item.id);
  const {error}=await supabaseClient.from('wedding_floor_plan_items').delete().in('id',ids);
  if(error){toast('Floor plan could not be cleared','error');return;}
  await addWeddingTimelineEntry(weddingId,'Planning',`${FLOOR_PLAN_MODES[weddingFloorPlanMode].label} plan cleared`,`${items.length} items removed`);
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Floor plan cleared');
}
async function saveWeddingFloorPlanSnapshot(weddingId) {
  const items=floorPlanItemsFor(weddingId);
  if(!items.length){toast('Add some items before saving the plan','error');return;}
  await addWeddingTimelineEntry(weddingId,'Planning',`${FLOOR_PLAN_MODES[weddingFloorPlanMode].label} floor plan saved`,`${items.length} room items`);
  toast('Floor plan saved');
}
function floorPlanPresetItems(wedding,mode) {
  const day=Math.max(1,Number(wedding.dayGuests||0));
  const evening=Math.max(day,Number(wedding.eveningGuests||0));
  if(mode==='ceremony'){
    return [
      // The main entrance is on the left. The bride enters from the left and
      // walks across the room from left to right towards the ceremony table.
      ['aisle','Aisle Runner',8,45,62,9],
      ['ceremony-chairs','Front Seating',17,16,43,25],
      ['ceremony-chairs','Rear Seating',17,60,43,25],
      ['floral-arch','Ceremony Backdrop',73,30,18,12],
      ['registrar-table','Ceremony Table',74,46,16,10]
    ];
  }
  if(mode==='evening'){
    return [
      ['dj','DJ / Band',8,76,17,11],
      ['bar','Bar',77,31,15,30],
      ['buffet','Evening Food',53,80,22,9],
      ['cake-table','Cake Table',35,79,11,13],
      ['gift-table','Gift Table',25,81,12,8],
      ['love-letters','LOVE Letters',75,81,18,8],
      ['round-table-10','Table 1',10,16,15,19],
      ['round-table-10','Table 2',10,48,15,19],
      ['round-table-10','Table 3',75,16,15,19],
      ['round-table-10','Table 4',75,48,15,19]
    ];
  }

  const tableCount=Math.max(1,Math.ceil(day/8));
  const positions=[
    [8,12],[8,42],[8,68],
    [26,68],[59,68],[77,68],
    [77,42],[77,12],[26,10],[59,10],
    [25,45],[60,45]
  ];
  const tables=Array.from({length:Math.min(tableCount,positions.length)},(_,index)=>{
    const [x,y]=positions[index];
    return ['round-table-8',`Table ${index+1}`,x,y,15,19];
  });
  return [
    ['top-table','Top Table',34,9,32,12],
    ...tables,
    ['dj','DJ',7,80,16,10],
    ['cake-table','Cake Table',39,81,11,13],
    ['gift-table','Gift Table',52,82,13,8],
    ['love-letters','LOVE Letters',76,82,18,8]
  ];
}
async function generateWeddingFloorPlanLayout(weddingId,mode) {
  const wedding=DB.weddings.find(item=>item.id===weddingId);if(!wedding)return;
  const existing=floorPlanItemsFor(weddingId,mode);
  if(existing.length&&!confirm(`Replace the current ${FLOOR_PLAN_MODES[mode].label} plan with a generated layout?`))return;

  if(existing.length){
    const deletion=await supabaseClient.from('wedding_floor_plan_items').delete().in('id',existing.map(item=>item.id));
    if(deletion.error){toast('Existing layout could not be replaced','error');return;}
  }

  const baseSort=floorPlanAllItemsFor(weddingId).length;
  const records=floorPlanPresetItems(wedding,mode).map((row,index)=>{
    const [type,label,x,y,width,height]=row;
    const seats=String(type).startsWith('round-table') ? floorPlanSeatCount({itemType:type,notes:''}) : '';
    return {
      wedding_id:weddingId,item_type:type,label,x_percent:x,y_percent:y,
      width_percent:width,height_percent:height,rotation_degrees:0,
      notes:floorPlanWithMeta('',mode,seats),sort_order:baseSort+index
    };
  });
  const {error}=await supabaseClient.from('wedding_floor_plan_items').insert(records);
  if(error){console.error(error);toast('Layout could not be generated','error');return;}
  await addWeddingTimelineEntry(weddingId,'Planning',`${FLOOR_PLAN_MODES[mode].label} layout generated`,`${records.length} room items`);
  weddingFloorPlanMode=mode;
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(`${FLOOR_PLAN_MODES[mode].label} layout generated`);
}
function floorPlanPrintableItem(item) {
  const type=item.itemType;
  const seats=floorPlanSeatCount(item);
  const round=String(type).startsWith('round-table');
  const radius=round?'50%':'8px';
  const bg=type==='dj'?'#262a23':type==='love-letters'?'transparent':'#fffaf1';
  const color=type==='dj'?'white':type==='love-letters'?'#d69c20':'#222';
  return `<div style="position:absolute;left:${item.x}%;top:${item.y}%;width:${item.width}%;height:${item.height}%;transform:rotate(${item.rotation}deg);border:${type==='love-letters'?'0':'1.5px solid #756b5a'};background:${bg};color:${color};border-radius:${radius};display:flex;align-items:center;justify-content:center;text-align:center;font-size:${type==='love-letters'?'18px':'9px'};font-weight:bold;box-sizing:border-box;padding:3px;box-shadow:0 2px 5px rgba(0,0,0,.15)">
    ${esc(item.label||floorPlanLibraryItem(type).label)}${round?`<br><span style="font-size:7px;font-weight:normal">${seats} seats</span>`:''}
  </div>`;
}
function buildFloorPlanGuestHtml(weddingId,autoPrint=false) {
  const wedding=DB.weddings.find(x=>x.id===weddingId);
  const items=floorPlanItemsFor(weddingId);
  const mode=FLOOR_PLAN_MODES[weddingFloorPlanMode];
  return `<!doctype html><html><head><title>${esc(wedding?.couple||'Wedding')} — ${mode.label}</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;background:#f4f1eb;color:#20221d;padding:22px}
    .head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;max-width:1400px;margin:0 auto 16px}
    h1{margin:0;font-size:28px}.sub{color:#657054;margin-top:4px}.badge{background:#e4ecd8;color:#43522e;border-radius:999px;padding:7px 12px;font-weight:bold;font-size:12px}
    .plan{position:relative;max-width:1400px;margin:auto;aspect-ratio:16/10;background:#ede7da;border-radius:14px;overflow:hidden;box-shadow:0 14px 40px rgba(33,35,27,.15)}
    .room{position:absolute;inset:2.4%;background:#f8f3e9;border:8px solid #171914;overflow:hidden}
    .dance{position:absolute;left:29%;top:26%;width:46%;height:47%;border:1px solid #9b6636;background:repeating-linear-gradient(90deg,#bc844d 0,#bc844d 5px,#c9955e 5px,#c9955e 10px);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:bold;text-align:center}
    .pillar{position:absolute;width:3.1%;aspect-ratio:1;background:#11130f}.garden{position:absolute;top:1.6%;left:50%;transform:translateX(-50%);font-size:10px;font-weight:bold;background:#e4ecd8;color:#43522e;padding:5px 12px;border-radius:0 0 8px 8px}.entrance{position:absolute;left:1.3%;top:49%;font-size:9px;font-weight:bold;background:#e4ecd8;color:#43522e;padding:5px;transform:rotate(-90deg);transform-origin:left center}
    .footer{max-width:1400px;margin:12px auto 0;color:#6b6f65;font-size:11px;display:flex;justify-content:space-between}
    @media print{body{padding:0;background:white}.plan{box-shadow:none}.head,.footer{max-width:none}.plan{max-width:none;break-inside:avoid}}
  </style></head><body>
    <div class="head"><div><span class="badge">${mode.label}</span><h1>${esc(wedding?.couple||'Wedding')}</h1><p class="sub">${esc(wedding?.date||'Date TBC')} · The Granary</p></div><div style="text-align:right"><strong>${Number(wedding?.dayGuests||0)} day guests</strong><br><span style="color:#777">${Number(wedding?.eveningGuests||0)} evening guests</span></div></div>
    <div class="plan"><div class="room">
      <div class="dance">DANCE<br>FLOOR</div>
      <div class="pillar" style="left:27.8%;top:24.5%"></div><div class="pillar" style="left:73.4%;top:24.5%"></div>
      <div class="pillar" style="left:27.8%;top:72%"></div><div class="pillar" style="left:73.4%;top:72%"></div>
    </div><div class="garden">GARDEN ENTRANCE</div><div class="entrance">ENTRANCE</div>
    ${items.map(floorPlanPrintableItem).join('')}</div>
    <div class="footer"><span>Visual layout for planning purposes. Final operational positioning may be adjusted by the venue.</span><span>Windmill Farm · The Granary</span></div>
    ${autoPrint?'<script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script>':''}
  </body></html>`;
}
function openWeddingFloorPlanGuestView(weddingId) {
  const win=window.open('','_blank');
  if(!win){toast('Allow pop-ups to open Guest View','error');return;}
  win.document.write(buildFloorPlanGuestHtml(weddingId,false));win.document.close();
}
function printWeddingFloorPlan(weddingId) {
  const items=floorPlanItemsFor(weddingId);
  if(!items.length){toast('There is no floor plan to print','error');return;}
  const win=window.open('','_blank');
  if(!win){toast('Allow pop-ups to print the floor plan','error');return;}
  win.document.write(buildFloorPlanGuestHtml(weddingId,true));win.document.close();
}

const WEDDING_PLANNING_SECTIONS = [
  {id:'package', title:'Package Details', icon:'badge-check', fields:[
    ['eveningFoodPackageChoice','Included evening food choice','select:Hog Roast|Evening Buffet|To be confirmed'],
    ['welcomeProseccoDetails','Welcome drinks — Prosecco / non-alcoholic split or notes','textarea'],
    ['hexagonDetails','Floral wooden hexagon — use / position / styling','textarea'],
    ['centrepieceDetails','Centre pieces — included design / own / bespoke arrangement','textarea'],
    ['lightCurtainDetails','Light curtain — use / position','textarea'],
    ['loveLettersPosition','LOVE Letters — use / position','text'],
    ['postboxDetails','Postbox — included postbox / own / not required','textarea'],
    ['canapesTime','Canapés service time','time'],
    ['canapesDetails','Canapés — selection / service notes','textarea'],
    ['moodLightingDetails','Mood lighting — colour / preference','textarea'],
    ['weddingCakeDetails','Wedding cake — included cake details or own cake arrangement','textarea']
  ]},
  {id:'ceremony', title:'Ceremony', icon:'heart-handshake', fields:[
    ['ceremonyTime','Ceremony time','time'],
    ['ceremonyLocation','Ceremony location','text'],
    ['registrarName','Registrar / celebrant','text'],
    ['ceremonyGuests','Ceremony guests','number'],
    ['groomRegistrarRoom','Groom registrar room / allocated hotel room','text'],
    ['brideRegistrarRoom','Bride registrar room / allocated hotel room','text'],
    ['guestArrivalSong1','Guest arrival song 1','text'],
    ['guestArrivalSong2','Guest arrival song 2','text'],
    ['guestArrivalSong3','Guest arrival song 3','text'],
    ['guestArrivalSong4','Guest arrival song 4','text'],
    ['guestArrivalSong5','Guest arrival song 5','text'],
    ['bridesmaidsEntranceSong','Bridesmaids entrance song (optional)','text'],
    ['brideEntranceSong','Bride entrance song','text'],
    ['signingSong1','Signing the register song 1','text'],
    ['signingSong2','Signing the register song 2','text'],
    ['signingSong3','Signing the register song 3','text'],
    ['exitSong','Exit song','text'],
    ['ceremonyReadings','Readings / speakers','textarea'],
    ['ceremonyNotes','Ceremony notes','textarea']
  ]},
  {id:'reception', title:'Reception & Food', icon:'utensils', fields:[
    ['arrivalTime','Guest arrival time','time'],
    ['weddingBreakfastTime','Wedding breakfast time','time'],
    ['mealService','Day meal service','select:Three-course meal|Two-course meal|One-course meal|Buffet / informal food|No day meal'],
    ['weddingBreakfastMenu','Wedding breakfast menu','select:None|Rose Menu|Peony Menu|Orchid Menu|Afternoon Tea Breakfast|Bespoke / Other'],
    ['drinksPackage','Drinks package','select:None|Silver|Gold|Platinum|Bespoke'],
    ['beerGuests','Peroni guests','number'],
    ['whiteWineGuests','White wine guests','number'],
    ['redWineGuests','Red wine guests','number'],
    ['roseWineGuests','Rosé wine guests','number'],
    ['softDrinkGuests','Soft drink guests','number'],
    ['speechesTime','Speeches time','time'],
    ['cakeCutTime','Cake cutting time','time'],
    ['firstDanceTime','First dance time','time'],
    ['eveningFoodMenu','Evening food','select:None|Finger Buffet|Hog Roast Buffet|Hog Roast Bap|Barbecue|Curry|Breakfast Rolls|Hot Rolls|Bespoke / Other'],
    ['eveningFoodGuests','Evening food guests','number'],
    ['eveningFoodTime','Evening food time','time'],
    ['finishTime','Finish time','time'],
    ['menuNotes','Menu choices / dietary notes','textarea']
  ]},
  {id:'suppliers', title:'Suppliers', icon:'truck', fields:[
    ['photographer','Photographer','text'],['videographer','Videographer','text'],['florist','Florist','text'],['cakeSupplier','Cake supplier','text'],['entertainment','Entertainment / band','text'],['dj','DJ','text'],['transport','Transport','text'],['supplierNotes','Supplier contact details / notes','textarea']
  ]},
  {id:'bedrooms', title:'Bedrooms', icon:'bed-double', fields:[
    ['roomsRequired','Rooms required','number'],['bridalSuite','Bridal suite','text'],['nightBeforeRooms','Night-before rooms','number'],['roomReleaseDate','Room release date','date'],['breakfastTime','Breakfast time','time'],['roomingListDue','Rooming list due','date'],['accessibleRooms','Accessible room requirements','text'],['bedroomNotes','Bedroom notes','textarea']
  ]},
  {id:'decor', title:'Décor', icon:'sparkles', fields:[
    ['colourScheme','Colour scheme','text'],['chairCovers','Chair covers / sash colour','text'],['centrepieces','Centrepieces','text'],['topTable','Top table décor','text'],['backdrop','Backdrop / light curtain','text'],['welcomeSign','Welcome sign / table plan','text'],['setupDate','Decor setup date','date'],['decorNotes','Décor notes','textarea']
  ]},
  {id:'music', title:'Music & Entertainment', icon:'music', fields:[
    ['djSetupTime','DJ setup / access time','time'],
    ['djStart','DJ start time','time'],
    ['djFinish','DJ finish time','time'],
    ['receptionEntranceSong','Reception entrance song','text'],
    ['cakeCutSong','Cake cutting song','text'],
    ['firstDanceSong','First dance song','text'],
    ['fatherDaughterSong','Father / daughter dance','text'],
    ['mustPlay','Must-play songs','textarea'],
    ['doNotPlay','Do-not-play songs','textarea'],
    ['musicStyle','Music style / set preferences','textarea'],
    ['guestRequests','Guest requests / request policy','textarea'],
    ['liveActRequirements','Live act requirements','textarea'],
    ['musicNotes','Music / DJ notes','textarea']
  ]},
  {id:'layout', title:'Room Layout', icon:'layout-template', fields:[
    ['tableShape','Table shape','select:Round tables|Rectangular tables|Mixed layout'],['topTableStyle','Top table style','select:Traditional top table|Sweetheart table|No top table'],['numberOfTables','Number of guest tables','number'],['guestsPerTable','Guests per table','number'],['dancefloorPosition','Dancefloor position','text'],['giftTable','Gift / card table','text'],['cakeTable','Cake table position','text'],['layoutNotes','Room layout notes','textarea']
  ]}
];

function planningRecord(weddingId, section) {
  return (DB.weddingPlanning || []).find(x => x.weddingId === weddingId && x.section === section) || null;
}
function planningData(weddingId, section) {
  const key = `${weddingId}:${section}`;
  if (!weddingPlanningDrafts[key]) weddingPlanningDrafts[key] = {...(planningRecord(weddingId, section)?.data || {})};
  return weddingPlanningDrafts[key];
}
function weddingSelectedPackage(w){
  try{
    const q=typeof latestWeddingQuote==='function'?latestWeddingQuote(w.id):null;
    const d=typeof activeQuoteDraft==='function'?activeQuoteDraft(w):null;
    return String(d?.packageName||q?.packageName||w.package||'Bespoke').trim();
  }catch(error){return String(w.package||'Bespoke').trim();}
}
// ===== PHASE 3: CONDITIONAL PLANNING RULES =====
// Fields are filtered for display/progress only. Saved values are never deleted when a
// condition changes, so switching a wedding format back on restores the previous data.
function planningFieldsForSection(w, sectionDef) {
  const profile = weddingProfile(w);
  const data = planningData(w.id, sectionDef.id);
  return sectionDef.fields.filter(([key]) => {
    if(sectionDef.id==='package' && window.WeddingPackageGuide){
      const allowed=new Set(WeddingPackageGuide.planningFields(weddingSelectedPackage(w)).map(x=>x[0]));
      if(!allowed.has(key))return false;
    }
    if (sectionDef.id === 'reception') {
      if (profile.dayMealRequired === false && ['weddingBreakfastTime','mealService','weddingBreakfastMenu'].includes(key)) return false;
      if (data.mealService === 'No day meal' && ['weddingBreakfastTime','weddingBreakfastMenu'].includes(key)) return false;
      if (profile.eveningFoodRequired === false && ['eveningFoodMenu','eveningFoodGuests','eveningFoodTime'].includes(key)) return false;
      if ((!data.drinksPackage || data.drinksPackage === 'None' || data.drinksPackage === 'Bespoke') && ['beerGuests','whiteWineGuests','redWineGuests','roseWineGuests','softDrinkGuests'].includes(key)) return false;
    }
    if (sectionDef.id === 'suppliers' && profile.djRequired === false && key === 'dj') return false;
    if (sectionDef.id === 'music' && profile.djRequired === false && ['djSetupTime','djStart','djFinish'].includes(key)) return false;
    return true;
  });
}
function planningSectionProgress(weddingId, sectionDef) {
  const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);
  const data = planningData(weddingId, sectionDef.id);
  const fields = wedding ? planningFieldsForSection(wedding,sectionDef) : sectionDef.fields;
  const total = fields.length;
  const complete = fields.filter(([key]) => String(data[key] ?? '').trim() !== '').length;
  return {complete,total,pct:total ? Math.round(complete/total*100) : 0};
}
function relevantWeddingPlanningSections(w) {
  const profile = weddingProfile(w);
  return WEDDING_PLANNING_SECTIONS.filter(section => {
    if (section.id === 'ceremony' && !weddingHasOnsiteCeremony(w)) return false;
    if (section.id === 'bedrooms' && profile.accommodationRequired === false) return false;
    return true;
  });
}
function planningOverallProgress(weddingId) {
  const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);
  let complete=0,total=0;
  relevantWeddingPlanningSections(wedding).forEach(section=>{const x=planningSectionProgress(weddingId,section);complete+=x.complete;total+=x.total;});
  return {complete,total,pct:total?Math.round(complete/total*100):0};
}
function togglePlanningSection(id) {
  openPlanningSections.has(id) ? openPlanningSections.delete(id) : openPlanningSections.add(id);
  renderWeddingWorkspace();
}
function renderWeddingPlanning(w) {
  if (!weddingPlanningTablesReady) return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5"><h3 class="font-bold">Planning setup required</h3><p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-planning.sql</strong> in Supabase, then refresh.</p></div>`;
  const overall=planningOverallProgress(w.id);
  const sections=relevantWeddingPlanningSections(w);
  return `<div class="space-y-4">
    ${renderWeddingProfileCard(w)}
    ${renderWeddingMasterTimings(w)}
    ${window.WeddingConsumptionRules?.renderReadiness ? WeddingConsumptionRules.renderReadiness(w) : ''}
    ${window.WeddingFinalisation?.render ? WeddingFinalisation.render(w) : ''}
    <div class="bg-white rounded-xl border border-olive-100 p-5"><div class="flex flex-wrap justify-between gap-3 mb-2"><div><h3 class="font-bold text-lg">Wedding Planning</h3><p class="text-sm text-gray-500">Only the sections relevant to this wedding are counted below.</p></div><div class="text-right"><strong class="text-2xl text-olive-700">${overall.pct}%</strong><p class="text-xs text-gray-500">${overall.complete} of ${overall.total} relevant fields complete</p></div></div><div class="bg-gray-200 rounded-full h-3"><div class="bg-olive-500 h-3 rounded-full" style="width:${overall.pct}%"></div></div></div>
    ${sections.map(section=>renderPlanningSection(w,section)).join('')}
  </div>`;
}
function weddingFormatDescription(profile) {
  if (profile.weddingFormat === 'ceremony_elsewhere' || profile.ceremonyLocationType === 'external') return 'The ceremony takes place elsewhere. Windmill Farm planning begins with the couple/guest arrival and reception timings.';
  if (profile.weddingFormat === 'evening_only') return 'Evening celebration only — ceremony and daytime meal planning are not required.';
  if (profile.weddingFormat === 'reception_only') return profile.ceremonyLocationType === 'external'
    ? 'The ceremony takes place elsewhere; Windmill Farm planning begins with the reception.'
    : 'Reception at Windmill Farm with no onsite ceremony.';
  if (profile.weddingFormat === 'twilight') return 'Later ceremony and evening-led wedding format.';
  return 'Full ceremony and reception planning at Windmill Farm.';
}

function renderWeddingProfileCard(w) {
  const data=planningData(w.id,'profile');
  const profile=weddingProfile(w);
  const formatOptions=Object.entries(WEDDING_FORMATS).map(([value,x])=>`<option value="${value}" ${profile.weddingFormat===value?'selected':''}>${esc(x.label)}</option>`).join('');
  const ceremonyOptions=Object.entries(WEDDING_CEREMONY_LOCATIONS).map(([value,label])=>`<option value="${value}" ${profile.ceremonyLocationType===value?'selected':''}>${esc(label)}</option>`).join('');
  return `<div class="bg-white rounded-xl border border-olive-100 overflow-hidden">
    <div class="p-5 border-b border-olive-100 flex flex-wrap items-start justify-between gap-3">
      <div><p class="text-xs font-bold tracking-widest text-olive-600">WEDDING V2 · PHASE 5</p><h3 class="font-bold text-lg mt-1">Wedding Format</h3><p class="text-sm text-gray-500 mt-1">Controls which planning sections and standard tasks apply to this wedding.</p></div>
      <span class="badge bg-olive-100 text-olive-800">${esc(WEDDING_FORMATS[profile.weddingFormat]?.label||'Ceremony & Reception')}</span>
    </div>
    <div class="p-5 grid md:grid-cols-2 gap-4">
      <label class="text-xs font-medium text-gray-600">Wedding format
        <select onchange="updateWeddingProfileDraft('${w.id}','weddingFormat',this.value,true)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${formatOptions}</select>
      </label>
      <label class="text-xs font-medium text-gray-600">Ceremony arrangement
        <select onchange="updateWeddingProfileDraft('${w.id}','ceremonyLocationType',this.value,true)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${ceremonyOptions}</select>
      </label>
      <label class="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm"><input type="checkbox" ${profile.dayMealRequired?'checked':''} onchange="updateWeddingProfileDraft('${w.id}','dayMealRequired',this.checked,true)"><span><strong class="block">Day meal required</strong><span class="text-xs text-gray-500">Show daytime food planning as part of the wedding.</span></span></label>
      <label class="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm"><input type="checkbox" ${profile.eveningFoodRequired?'checked':''} onchange="updateWeddingProfileDraft('${w.id}','eveningFoodRequired',this.checked,true)"><span><strong class="block">Evening food required</strong><span class="text-xs text-gray-500">Keeps evening food in the operational plan.</span></span></label>
      <label class="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm"><input type="checkbox" ${profile.accommodationRequired?'checked':''} onchange="updateWeddingProfileDraft('${w.id}','accommodationRequired',this.checked,true)"><span><strong class="block">Accommodation required</strong><span class="text-xs text-gray-500">Show the Bedrooms planning section.</span></span></label>
      <label class="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm"><input type="checkbox" ${profile.djRequired?'checked':''} onchange="updateWeddingProfileDraft('${w.id}','djRequired',this.checked,true)"><span><strong class="block">DJ / evening entertainment required</strong><span class="text-xs text-gray-500">Hides DJ-specific supplier and music fields when not required.</span></span></label>
      ${profile.ceremonyLocationType==='external' ? `<div class="md:col-span-2 rounded-xl border border-olive-100 bg-cream-50/50 p-4">
        <p class="text-xs font-bold tracking-widest text-olive-600">EXTERNAL CEREMONY</p>
        <div class="grid md:grid-cols-3 gap-3 mt-3">
          <label class="text-xs font-medium text-gray-600">Ceremony venue<input value="${esc(data.externalCeremonyVenue||'')}" oninput="updateWeddingProfileDraft('${w.id}','externalCeremonyVenue',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Church, registry office or venue"></label>
          <label class="text-xs font-medium text-gray-600">Ceremony time<input type="time" value="${esc(data.externalCeremonyTime||'')}" oninput="updateWeddingProfileDraft('${w.id}','externalCeremonyTime',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
          <label class="text-xs font-medium text-gray-600">Expected arrival at Windmill Farm<input type="time" value="${esc(data.venueArrivalTime||'')}" oninput="updateWeddingProfileDraft('${w.id}','venueArrivalTime',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
        </div>
      </div>` : ''}
      <div class="md:col-span-2 bg-cream-50 rounded-lg p-3 text-sm text-gray-600">${esc(weddingFormatDescription(profile))}</div>
      <div class="md:col-span-2 flex justify-end"><button onclick="saveWeddingProfile('${w.id}')" class="px-5 py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save Wedding Format</button></div>
    </div>
  </div>`;
}

function updateWeddingProfileDraft(weddingId,key,value,rerender=false) {
  planningData(weddingId,'profile')[key]=value;
  if(key==='weddingFormat') {
    const draft=planningData(weddingId,'profile');
    if(value==='ceremony_elsewhere') draft.ceremonyLocationType='external';
    else if(value==='reception_only' || value==='evening_only') draft.ceremonyLocationType='none';
    else if(!draft.ceremonyLocationType || draft.ceremonyLocationType==='none' || draft.ceremonyLocationType==='external') draft.ceremonyLocationType='granary';
    if(value==='evening_only') draft.dayMealRequired=false;
  }
  if(key==='ceremonyLocationType'){
    const draft=planningData(weddingId,'profile');
    if(value==='external' && draft.weddingFormat!=='ceremony_elsewhere') draft.weddingFormat='ceremony_elsewhere';
    if(value==='granary' && ['ceremony_elsewhere','reception_only','evening_only'].includes(draft.weddingFormat)) draft.weddingFormat='ceremony_reception';
    if(value==='none' && draft.weddingFormat==='ceremony_elsewhere') draft.weddingFormat='reception_only';
  }
  if(rerender) renderWeddingWorkspace();
}

async function saveWeddingProfile(weddingId) {
  await savePlanningSection(weddingId,'profile');
}

function weddingMasterTimingRows(w) {
  const profile=weddingProfile(w);
  const ceremony=planningData(w.id,'ceremony');
  const reception=planningData(w.id,'reception');
  const rows=[];
  if (weddingHasOnsiteCeremony(w)) rows.push(['Ceremony',ceremony.ceremonyTime||'']);
  else if (profile.ceremonyLocationType==='external') {
    rows.push(['External ceremony',profile.externalCeremonyTime||'']);
    rows.push(['Arrive at Windmill Farm',profile.venueArrivalTime||reception.arrivalTime||'']);
  }
  else rows.push(['Guest arrival',reception.arrivalTime||'']);
  if(profile.dayMealRequired!==false) rows.push(['Wedding breakfast',reception.weddingBreakfastTime||'']);
  rows.push(['Speeches',reception.speechesTime||'']);
  rows.push(['Cake cutting',reception.cakeCutTime||'']);
  rows.push(['First dance',reception.firstDanceTime||'']);
  if(profile.eveningFoodRequired!==false) rows.push(['Evening food',reception.eveningFoodTime||'']);
  (Array.isArray(reception.additionalTimings)?reception.additionalTimings:[]).forEach(item=>{
    if(item && (item.label || item.time)) rows.push([item.label||'Additional timing',item.time||'']);
  });
  rows.push(['Finish',reception.finishTime||'']);
  return rows.sort((a,b)=>{
    const ta=/^\d{2}:\d{2}$/.test(a[1])?a[1]:'99:99', tb=/^\d{2}:\d{2}$/.test(b[1])?b[1]:'99:99';
    return ta.localeCompare(tb);
  });
}

function renderWeddingMasterTimings(w) {
  const rows=weddingMasterTimingRows(w);
  const completed=rows.filter(([,time])=>time).length;
  return `<div class="bg-charcoal-900 text-white rounded-xl p-5">
    <div class="flex flex-wrap justify-between gap-3 items-start"><div><p class="text-xs font-bold tracking-widest text-olive-300">MASTER DAY TIMINGS</p><h3 class="font-bold text-lg mt-1">One timeline, used across wedding planning</h3><p class="text-sm text-gray-300 mt-1">These values come from Planning and now drive the standard Wedding Running Order. Deliberate Running Order overrides are preserved.</p></div><span class="text-sm font-bold text-olive-200">${completed}/${rows.length} set</span></div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">${rows.map(([label,time])=>`<div class="rounded-lg bg-white/10 p-3"><p class="text-[11px] text-gray-300">${esc(label)}</p><p class="font-bold mt-1 ${time?'':'text-gray-400'}">${esc(time||'Not set')}</p></div>`).join('')}</div>
  </div>`;
}


function packageInclusionStatus(w,item){
  const p=planningData(w.id,'package'),r=planningData(w.id,'reception'),d=planningData(w.id,'decor'),
        s=planningData(w.id,'suppliers'),b=planningData(w.id,'bedrooms'),m=planningData(w.id,'music');
  const map={
    privateBar:()=>p.privateBarNotes,
    masterOfCeremonies:()=>p.masterOfCeremoniesNotes,
    cakeStandKnife:()=>p.cakeStandKnifeNotes,
    chairCovers:()=>d.chairCovers,
    tableNumbers:()=>p.tableNumbersNotes,
    tableLinen:()=>p.linenNotes,
    linenNapkins:()=>p.linenNotes,
    discountedRooms:()=>b.roomsRequired||b.bridalSuite,
    loveLetters:()=>p.loveLettersPosition,
    residentDj:()=>s.dj||m.djStart||p.residentDjNotes,
    eveningBuffet:()=>r.eveningFoodMenu||p.eveningFoodPackageChoice,
    welcomeProsecco:()=>p.welcomeProseccoDetails||r.drinksPackage,
    hexagon:()=>p.hexagonDetails||d.backdrop,
    centrepieces:()=>p.centrepieceDetails||d.centrepieces,
    lightCurtain:()=>p.lightCurtainDetails||d.backdrop,
    bridalSuite:()=>p.bridalSuiteDetails||b.bridalSuite,
    breakfastFollowing:()=>p.breakfastFollowingDetails||b.breakfastTime,
    twoCourse:()=>p.twoCourseDetails||r.mealService,
    silverDrinks:()=>p.silverDrinksDetails||r.drinksPackage,
    postbox:()=>p.postboxDetails,
    allDayRoomHire:()=>p.allDayRoomHireDetails,
    civilCeremony:()=>p.civilCeremonyDetails||planningData(w.id,'ceremony').ceremonyTime,
    threeCourse:()=>p.threeCourseDetails||r.mealService,
    goldDrinks:()=>p.goldDrinksDetails||r.drinksPackage,
    canapes:()=>p.canapesDetails||p.canapesTime,
    moodLighting:()=>p.moodLightingDetails,
    weddingCake:()=>p.weddingCakeDetails||s.cakeSupplier,
    allDayRoomHireWillow:()=>p.allDayRoomHireDetails
  };
  return String((map[item.key]?.()||'')).trim();
}
function renderPackagePlanningDecisionField(weddingId,field,value){
  const [key,label,type]=field;
  const guide=window.WeddingPackageGuide;
  const presets=guide?.planningPresets?.[key]||[];
  if(!presets.length)return renderPlanningField(weddingId,'package',field,value);
  const current=String(value||'').trim();
  const active=preset=>current===preset.value || current.startsWith(`${preset.value} —`) || current.startsWith(`${preset.value}\n`);
  return `<div class="sm:col-span-2 rounded-xl border border-olive-100 bg-cream-50/30 p-4" data-package-preset-field="${esc(key)}">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div><p class="text-sm font-bold text-charcoal-900">${esc(label)}</p><p class="text-xs text-gray-500 mt-0.5">Choose the closest option, then only edit the wording if this wedding needs something different.</p></div>
      ${current?'<span class="text-[10px] uppercase tracking-wider font-bold text-olive-700 bg-olive-100 rounded-full px-2 py-1">Recorded</span>':''}
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
      ${presets.map(p=>{const encoded=encodeURIComponent(p.value);return `<button type="button" data-preset-value="${esc(encoded)}" onclick="applyPackagePlanningPreset('${weddingId}','${key}','${encoded}',this)" class="text-left rounded-lg border px-3 py-2.5 text-sm transition ${active(p)?'border-olive-600 bg-olive-50 ring-1 ring-olive-300 font-semibold':'border-gray-200 bg-white hover:border-olive-300'}">${esc(p.label)}</button>`}).join('')}
    </div>
    <label class="block text-xs font-medium text-gray-600 mt-3">Edit / add wedding-specific detail
      <textarea rows="2" data-package-custom-input="${esc(key)}" oninput="updatePlanningDraft('${weddingId}','package','${key}',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm bg-white" placeholder="Only add detail if needed…">${esc(current)}</textarea>
    </label>
  </div>`;
}
function applyPackagePlanningPreset(weddingId,key,encodedValue,button){
  const value=decodeURIComponent(encodedValue||'');
  updatePlanningDraft(weddingId,'package',key,value);
  const wrap=button?.closest?.('[data-package-preset-field]');
  if(!wrap)return;
  wrap.querySelectorAll('[data-preset-value]').forEach(btn=>{
    const isActive=decodeURIComponent(btn.dataset.presetValue||'')===value;
    btn.classList.toggle('border-olive-600',isActive);
    btn.classList.toggle('bg-olive-50',isActive);
    btn.classList.toggle('ring-1',isActive);
    btn.classList.toggle('ring-olive-300',isActive);
    btn.classList.toggle('font-semibold',isActive);
    btn.classList.toggle('border-gray-200',!isActive);
    btn.classList.toggle('bg-white',!isActive);
  });
  const input=wrap.querySelector(`[data-package-custom-input="${CSS.escape(key)}"]`);
  if(input)input.value=value;
}

function renderWeddingPackagePlanningBody(w,section,data){
  const pkg=weddingSelectedPackage(w);
  const guide=window.WeddingPackageGuide;
  if(!guide||!guide.info(pkg)){
    return `<div class="rounded-xl border border-gray-200 bg-gray-50 p-4"><strong>Bespoke package</strong><p class="text-sm text-gray-500 mt-1">Package-specific decisions are recorded in the relevant Planning sections.</p></div>`;
  }
  const info=guide.info(pkg),fields=guide.planningFields(pkg);
  return `<div class="space-y-5">
    <section class="rounded-xl bg-charcoal-900 text-white p-5">
      <p class="text-xs tracking-widest font-bold text-olive-300">${esc(pkg.toUpperCase())} PACKAGE</p>
      <h3 class="text-xl font-bold mt-1">${esc(info.subtitle)}</h3>
      <p class="text-sm text-gray-300 mt-1">Only decisions that need wedding-specific input appear here. Standard package provisions are handled automatically, while food, drinks, ceremony, music and accommodation stay in their own Planning sections.</p>
    </section>
    ${fields.length?`<section>
      <p class="text-xs font-bold tracking-widest text-olive-600 mb-2">PACKAGE-SPECIFIC DECISIONS</p>
      <div class="grid sm:grid-cols-2 gap-4">${fields.map(field=>renderPackagePlanningDecisionField(w.id,field,data[field[0]]||'')).join('')}</div>
    </section>`:`<div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">There are no additional package-specific decisions to record here.</div>`}
  </div>`;
}
function renderPlanningSection(w, section) {
  const open=openPlanningSections.has(section.id), progress=planningSectionProgress(w.id,section), data=planningData(w.id,section.id);
  const relevantFields=planningFieldsForSection(w,section);
  const body = section.id === 'package'
    ? renderWeddingPackagePlanningBody(w, section, data)
    : section.id === 'ceremony'
    ? renderCeremonyPlanningBody(w, section, data)
    : section.id === 'reception'
      ? renderReceptionPlanningBody(w, section, data)
      : section.id === 'music'
        ? renderMusicEntertainmentPlanningBody(w, section, data)
        : `<div class="grid sm:grid-cols-2 gap-4">${relevantFields.map(field=>renderPlanningField(w.id,section.id,field,data[field[0]]||'')).join('')}</div>`;

  return `<div class="bg-white rounded-xl border border-olive-100 overflow-hidden">
    <button onclick="togglePlanningSection('${section.id}')" class="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-cream-50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-olive-100 text-olive-700 flex items-center justify-center"><i data-lucide="${section.icon}" style="width:19px"></i></div>
        <div><h4 class="font-bold">${section.title}</h4><p class="text-xs text-gray-500">${progress.complete} of ${progress.total} complete</p></div>
      </div>
      <div class="flex items-center gap-3"><span class="text-sm font-bold ${progress.pct===100?'text-green-700':'text-olive-700'}">${progress.pct}%</span><i data-lucide="${open?'chevron-up':'chevron-down'}"></i></div>
    </button>
    ${open?`<div class="border-t border-olive-100 p-5">${body}<div class="mt-5 flex justify-end"><button onclick="savePlanningSection('${w.id}','${section.id}')" class="px-5 py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save ${section.title}</button></div></div>`:''}
  </div>`;
}

const CEREMONY_CHECKLIST = [
  ['roomReady','Ceremony room checked and ready'],
  ['reservedSeats','Reserved seats arranged'],
  ['musicTested','Ceremony music tested'],
  ['registrarsArrived','Registrars arrived'],
  ['keyCardGiven','Key card given to registrars'],
  ['extraChairReady','Extra chair placed in registrar room'],
  ['registrarTableReady','Registrar table and paperwork area ready'],
  ['registrarRoomsConfirmed','Bride and groom registrar rooms confirmed'],
  ['groomInRoom','Groom taken to allocated registrar room'],
  ['brideBedroomDoorClosed','Bride’s hotel bedroom door closed before moving groom'],
  ['groomRouteChecked','Groom route checked so couple do not see each other'],
  ['brideInRoom','Bride taken to allocated registrar room'],
  ['brideRouteChecked','Bride route checked so couple remain separate'],
  ['guestsSeated','Guests invited into ceremony room'],
  ['drinksStopped','No drinks taken into ceremony room'],
  ['ceremonyDoorsClosed','Ceremony doors closed'],
  ['phonesSilent','Guests reminded to silence phones'],
  ['registrarReady','Registrar has confirmed they are ready'],
  ['entranceMusicReady','Entrance music queued'],
  ['exitMusicReady','Exit music queued'],
  ['drinksReceptionReady','Post-ceremony drinks ready']
];

function ceremonyTimeMinutes(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function ceremonyDisplayTime(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return 'Set ceremony time';
  const normalised = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalised / 60);
  const minutes = normalised % 60;
  const suffix = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2,'0')} ${suffix}`;
}

function ceremonyOperationsTimeline(ceremonyTime, groomRoom = '', brideRoom = '') {
  const start = ceremonyTimeMinutes(ceremonyTime);
  if (start === null) return [];

  const groomRoomLabel = groomRoom ? `Groom to ${groomRoom}` : 'Groom to allocated registrar room';
  const brideRoomLabel = brideRoom ? `Bride to ${brideRoom}` : 'Bride to allocated registrar room';

  return [
    {time:`${ceremonyDisplayTime(start - 120)}–${ceremonyDisplayTime(start - 60)}`, title:'Guests begin arriving', detail:'Welcome guests and direct them to the bar/reception area.'},
    {time:ceremonyDisplayTime(start - 60), title:'Registrars arrive', detail:'Give the registrars their key card and confirm the extra chair and private room are ready.'},
    {time:ceremonyDisplayTime(start - 30), title:groomRoomLabel, detail:'Before moving the groom, confirm the bride’s hotel bedroom door is closed and use the agreed route so the couple do not see each other.'},
    {time:ceremonyDisplayTime(start - 20), title:brideRoomLabel, detail:'Use the agreed separate route and confirm the entrance order and music.'},
    {time:ceremonyDisplayTime(start - 15), title:'Seat guests and stop drinks', detail:'Invite guests into the ceremony room, do not allow drinks inside, and close the ceremony doors.'},
    {time:ceremonyDisplayTime(start - 5), title:'Final readiness check', detail:'Registrar ready, bridal party ready, entrance music queued and doors controlled.'},
    {time:ceremonyDisplayTime(start), title:'Ceremony begins', detail:'Start the agreed entrance sequence and music.'},
    {time:ceremonyDisplayTime(start + 30), title:'Ceremony expected to finish', detail:'Play exit music and move guests into the drinks reception.'}
  ];
}

function renderCeremonyTimeline(ceremonyTime, groomRoom = '', brideRoom = '') {
  const timeline = ceremonyOperationsTimeline(ceremonyTime, groomRoom, brideRoom);
  if (!timeline.length) {
    return `<div class="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
      Set the <strong>Ceremony time</strong> above and the Windmill operational timings will calculate automatically.
    </div>`;
  }

  return `<div class="space-y-2">
    ${timeline.map((item,index)=>`<div class="grid grid-cols-[105px_24px_1fr] gap-3 items-start">
      <p class="text-sm font-bold text-olive-700">${esc(item.time)}</p>
      <div class="flex flex-col items-center">
        <span class="w-3 h-3 rounded-full ${index===timeline.length-1?'bg-gold-500':'bg-olive-600'} mt-1"></span>
        ${index<timeline.length-1?'<span class="w-px h-12 bg-olive-200"></span>':''}
      </div>
      <div class="pb-3">
        <p class="font-semibold text-charcoal-900">${esc(item.title)}</p>
        <p class="text-xs text-gray-500 mt-1">${esc(item.detail)}</p>
      </div>
    </div>`).join('')}
  </div>`;
}

function refreshCeremonyOperations(weddingId, ceremonyTime = '') {
  const data = planningData(weddingId,'ceremony');
  const time = ceremonyTime || data.ceremonyTime || '';
  const element = document.getElementById(`ceremony-operations-${weddingId}`);
  if (element) {
    element.innerHTML = renderCeremonyTimeline(
      time,
      data.groomRegistrarRoom || '',
      data.brideRegistrarRoom || ''
    );
  }
}

function renderCeremonyMusicInput(weddingId, key, label, value='', hint='') {
  return `<label class="block">
    <span class="text-xs font-medium text-gray-600">${label}</span>
    ${hint?`<span class="block text-[12px] text-gray-400 mt-0.5">${hint}</span>`:''}
    <input type="text" value="${esc(value)}"
      oninput="updatePlanningDraft('${weddingId}','ceremony','${key}',this.value)"
      class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
      placeholder="Song title and artist">
  </label>`;
}

function renderCeremonyChecklist(weddingId, data) {
  return `<div class="grid md:grid-cols-2 gap-2">
    ${CEREMONY_CHECKLIST.map(([key,label])=>`<label class="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 hover:bg-cream-50">
      <input type="checkbox" ${data[key]===true?'checked':''}
        onchange="updatePlanningDraft('${weddingId}','ceremony','${key}',this.checked)"
        class="mt-0.5 w-4 h-4 rounded border-gray-300 text-olive-600">
      <span class="text-sm text-gray-700">${esc(label)}</span>
    </label>`).join('')}
  </div>`;
}

function renderCeremonyPlanningBody(w, section, data) {
  // Carry forward data entered through the previous simpler fields.
  if (!data.brideEntranceSong && data.entranceMusic) data.brideEntranceSong = data.entranceMusic;
  if (!data.signingSong1 && data.signingMusic) data.signingSong1 = data.signingMusic;
  if (!data.exitSong && data.exitMusic) data.exitSong = data.exitMusic;

  return `<div class="space-y-5">
    <section class="rounded-xl border border-olive-100 bg-cream-50/40 p-4">
      <div class="mb-4">
        <p class="text-xs font-bold tracking-widest text-olive-600">COUPLE INFORMATION</p>
        <h5 class="font-bold text-lg text-charcoal-900">Ceremony details</h5>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <label class="block"><span class="text-xs font-medium text-gray-600">Ceremony time</span>
          <input type="time" value="${esc(data.ceremonyTime||'')}"
            oninput="updatePlanningDraft('${w.id}','ceremony','ceremonyTime',this.value);refreshCeremonyOperations('${w.id}',this.value)"
            class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
        </label>
        ${renderPlanningField(w.id,'ceremony',['ceremonyLocation','Ceremony location','text'],data.ceremonyLocation||'')}
        ${renderPlanningField(w.id,'ceremony',['registrarName','Registrar / celebrant','text'],data.registrarName||'')}
        ${renderPlanningField(w.id,'ceremony',['ceremonyGuests','Ceremony guests','number'],data.ceremonyGuests||'')}
        <label class="block"><span class="text-xs font-medium text-gray-600">Groom registrar room / allocated hotel room</span>
          <input type="text" value="${esc(data.groomRegistrarRoom||'')}"
            oninput="updatePlanningDraft('${w.id}','ceremony','groomRegistrarRoom',this.value);refreshCeremonyOperations('${w.id}')"
            class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Example: Room 12">
        </label>
        <label class="block"><span class="text-xs font-medium text-gray-600">Bride registrar room / allocated hotel room</span>
          <input type="text" value="${esc(data.brideRegistrarRoom||'')}"
            oninput="updatePlanningDraft('${w.id}','ceremony','brideRegistrarRoom',this.value);refreshCeremonyOperations('${w.id}')"
            class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Example: Room 7">
        </label>
      </div>
    </section>

    <section class="rounded-xl border border-olive-100 p-4">
      <div class="mb-4">
        <p class="text-xs font-bold tracking-widest text-olive-600">CEREMONY MUSIC</p>
        <h5 class="font-bold text-lg text-charcoal-900">Music running order</h5>
        <p class="text-sm text-gray-500 mt-1">Enter the song title and artist in each space.</p>
      </div>

      <div class="space-y-5">
        <div>
          <h6 class="font-semibold text-charcoal-900">Guest waiting music</h6>
          <p class="text-xs text-gray-500 mb-3">Usually 3–5 songs while guests take their seats.</p>
          <div class="grid sm:grid-cols-2 gap-3">
            ${[1,2,3,4,5].map(number=>renderCeremonyMusicInput(w.id,`guestArrivalSong${number}`,`Song ${number}`,data[`guestArrivalSong${number}`]||'')).join('')}
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <h6 class="font-semibold text-charcoal-900">Aisle entrance</h6>
          <p class="text-xs text-gray-500 mb-3">Use one song for everyone, or separate songs for bridesmaids and the bride.</p>
          <div class="grid sm:grid-cols-2 gap-3">
            ${renderCeremonyMusicInput(w.id,'bridesmaidsEntranceSong','Bridesmaids entrance song',data.bridesmaidsEntranceSong||'','Optional')}
            ${renderCeremonyMusicInput(w.id,'brideEntranceSong','Bride entrance song',data.brideEntranceSong||'')}
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <h6 class="font-semibold text-charcoal-900">Signing the register</h6>
          <p class="text-xs text-gray-500 mb-3">Usually 2–3 songs.</p>
          <div class="grid sm:grid-cols-2 gap-3">
            ${[1,2,3].map(number=>renderCeremonyMusicInput(w.id,`signingSong${number}`,`Song ${number}`,data[`signingSong${number}`]||'')).join('')}
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <h6 class="font-semibold text-charcoal-900">Exit music</h6>
          <div class="mt-3 max-w-xl">
            ${renderCeremonyMusicInput(w.id,'exitSong','Exit song',data.exitSong||'')}
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-olive-200 bg-olive-50/40 p-4">
      <div class="mb-4">
        <p class="text-xs font-bold tracking-widest text-olive-600">WINDMILL OPERATIONS</p>
        <h5 class="font-bold text-lg text-charcoal-900">Automatically calculated ceremony timeline</h5>
        <p class="text-sm text-gray-500 mt-1">These timings are calculated from the ceremony time entered above.</p>
      </div>
      <div id="ceremony-operations-${w.id}">
        ${renderCeremonyTimeline(data.ceremonyTime||'',data.groomRegistrarRoom||'',data.brideRegistrarRoom||'')}
      </div>
    </section>

    <section class="rounded-xl border border-gray-200 p-4">
      <div class="mb-4">
        <p class="text-xs font-bold tracking-widest text-olive-600">TEAM CHECKLIST</p>
        <h5 class="font-bold text-lg text-charcoal-900">Ceremony delivery checklist</h5>
        <p class="text-sm text-gray-500 mt-1">Tick items as they are confirmed or completed. The checklist saves with the ceremony planning.</p>
      </div>
      ${renderCeremonyChecklist(w.id,data)}
    </section>

    <section class="rounded-xl border border-gold-200 bg-gold-50/50 p-4">
      <p class="text-xs font-bold tracking-widest text-gold-700">WINDMILL STANDARD</p>
      <div class="grid md:grid-cols-2 gap-4 mt-3 text-sm text-gray-700">
        <div>
          <p class="font-semibold text-charcoal-900">Registrars</p>
          <p class="mt-1">Registrars usually arrive one hour before the ceremony. Give them their key card and make sure the extra chair and private room are ready.</p>
        </div>
        <div>
          <p class="font-semibold text-charcoal-900">Groom</p>
          <p class="mt-1">Take the groom to the allocated registrar interview room around 30 minutes before the ceremony. Before moving him, make sure the bride’s hotel bedroom door is closed and the agreed route keeps the couple apart.</p>
        </div>
        <div>
          <p class="font-semibold text-charcoal-900">Bride</p>
          <p class="mt-1">Take the bride to her allocated registrar interview room around 20 minutes before the ceremony using a separate route, then confirm the entrance order and songs.</p>
        </div>
        <div>
          <p class="font-semibold text-charcoal-900">Guests</p>
          <p class="mt-1">Around 15 minutes before, stop drinks, seat guests, close the ceremony doors and prepare the entrance music.</p>
        </div>
      </div>
    </section>

    <section class="grid sm:grid-cols-2 gap-4">
      ${renderPlanningField(w.id,'ceremony',['ceremonyReadings','Readings / speakers','textarea'],data.ceremonyReadings||'')}
      ${renderPlanningField(w.id,'ceremony',['ceremonyNotes','Ceremony notes / unusual requirements','textarea'],data.ceremonyNotes||'')}
    </section>
  </div>`;
}


function receptionDrinkSplitTotal(data) {
  return ['beerGuests','whiteWineGuests','redWineGuests','roseWineGuests','softDrinkGuests']
    .reduce((sum,key)=>sum+Number(data[key]||0),0);
}

function renderReceptionDrinkSplitStatus(wedding, data) {
  const dayGuests = Number(wedding.dayGuests || 0);
  const total = receptionDrinkSplitTotal(data);
  const packageSelected = data.drinksPackage && data.drinksPackage !== 'None';

  if (!packageSelected) {
    return `<div class="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-500">
      Select Silver, Gold or Platinum to enter the welcome-drink split.
    </div>`;
  }

  if (!dayGuests) {
    return `<div class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
      <strong>Day guest number missing.</strong> Add the day guests before completing the drinks split.
    </div>`;
  }

  const difference = dayGuests - total;
  if (difference === 0) {
    return `<div class="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
      <strong>${total} of ${dayGuests} guests allocated.</strong> The drinks split balances correctly.
    </div>`;
  }

  return `<div class="rounded-lg ${difference > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-800'} border p-3 text-sm">
    <strong>${total} of ${dayGuests} guests allocated.</strong>
    ${difference > 0 ? `${difference} guest${difference===1?' is':'s are'} still unallocated.` : `${Math.abs(difference)} too many drinks have been allocated.`}
  </div>`;
}

function refreshReceptionDrinkSplit(weddingId) {
  const wedding = DB.weddings.find(item=>item.id===weddingId);
  const data = planningData(weddingId,'reception');
  const element = document.getElementById(`reception-drink-status-${weddingId}`);
  if (element && wedding) element.innerHTML = renderReceptionDrinkSplitStatus(wedding,data);
}

function receptionNumberInput(weddingId,key,label,value) {
  return `<label class="block">
    <span class="text-xs font-medium text-gray-600">${label}</span>
    <input type="number" min="0" step="1" value="${esc(value||'')}"
      oninput="updatePlanningDraft('${weddingId}','reception','${key}',this.value);refreshReceptionDrinkSplit('${weddingId}')"
      class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
  </label>`;
}


// ===== PHASE 4R: KITCHEN-MASTER EVENING FOOD SERVICES =====
// Weddings consume the live Kitchen menu catalogue. Multiple services can be added.
// Legacy single-menu fields are mirrored from the first service for compatibility.
function weddingKitchenMenus() {
  try {
    if (window.KitchenApp && typeof KitchenApp.menuDefinitions === 'function') return KitchenApp.menuDefinitions();
  } catch (e) {}
  return {};
}
function weddingKitchenMenuOptions() {
  const defs=weddingKitchenMenus();
  return Object.entries(defs).filter(([key])=>key!=='threeCourse').map(([key,def])=>({key,label:def.label||key,type:def.type||'custom'}));
}
function weddingEveningMenuKeyFromLegacy(name) {
  const v=String(name||'').toLowerCase();
  if(v.includes('finger'))return 'fingerBuffet';
  if(v.includes('curry'))return 'curry';
  if(v.includes('barbecue')||v.includes('bbq'))return 'bbq';
  if(v.includes('hog'))return 'hogRoast';
  if(v.includes('breakfast'))return 'breakfast';
  if(v.includes('hot roll'))return 'hotRolls';
  if(v.includes('afternoon tea'))return 'afternoonTea';
  if(v.includes('platter'))return 'platters';
  if(v.includes('canap'))return 'canapes';
  return name ? 'custom' : '';
}
function ensureWeddingEveningServices(w,data) {
  if(!Array.isArray(data.eveningFoodServices)) data.eveningFoodServices=[];
  // One-time in-memory migration of the legacy single evening food selection.
  if(!data.eveningFoodServices.length && data.eveningFoodMenu && data.eveningFoodMenu!=='None') {
    const key=weddingEveningMenuKeyFromLegacy(data.eveningFoodMenu);
    const def=weddingKitchenMenus()[key];
    data.eveningFoodServices=[{
      id:`evening-${Date.now()}-legacy`, menuKey:key, menuLabel:def?.label||data.eveningFoodMenu,
      guests:Number(data.eveningFoodGuests||w.eveningGuests||0), time:data.eveningFoodTime||'',
      selectedIds:[], allocations:{}, notes:'', legacyImported:true
    }];
  }
  return data.eveningFoodServices;
}
function syncWeddingEveningLegacyFields(weddingId) {
  const data=planningData(weddingId,'reception');
  const services=Array.isArray(data.eveningFoodServices)?data.eveningFoodServices:[];
  const first=services[0];
  if(first){
    const def=weddingKitchenMenus()[first.menuKey];
    data.eveningFoodMenu=first.menuLabel||def?.label||first.menuKey||'';
    data.eveningFoodGuests=String(Number(first.guests||0)||'');
    data.eveningFoodTime=first.time||'';
  } else {
    data.eveningFoodMenu='None'; data.eveningFoodGuests=''; data.eveningFoodTime='';
  }
}
function addWeddingEveningService(weddingId) {
  const w=DB.weddings.find(x=>x.id===weddingId); if(!w)return;
  const data=planningData(weddingId,'reception'); const services=ensureWeddingEveningServices(w,data);
  services.push({id:`evening-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,menuKey:'',menuLabel:'',guests:Number(w.eveningGuests||0),time:data.eveningFoodTime||'',selectedIds:[],allocations:{},notes:''});
  syncWeddingEveningLegacyFields(weddingId); renderWeddingWorkspace();
}
function removeWeddingEveningService(weddingId,serviceId) {
  const data=planningData(weddingId,'reception');
  data.eveningFoodServices=(data.eveningFoodServices||[]).filter(x=>x.id!==serviceId);
  syncWeddingEveningLegacyFields(weddingId); renderWeddingWorkspace();
}
function updateWeddingEveningService(weddingId,serviceId,key,value,rerender=false) {
  const w=DB.weddings.find(x=>x.id===weddingId); if(!w)return;
  const data=planningData(weddingId,'reception'); const services=ensureWeddingEveningServices(w,data);
  const service=services.find(x=>x.id===serviceId); if(!service)return;
  service[key]=key==='guests'?Math.max(0,Number(value||0)):value;
  if(key==='menuKey'){
    const def=weddingKitchenMenus()[value]; service.menuLabel=def?.label||value;
    service.selectedIds=[]; service.allocations={};
  }
  syncWeddingEveningLegacyFields(weddingId); if(rerender)renderWeddingWorkspace();
}
function toggleWeddingEveningRecipe(weddingId,serviceId,recipeId,checked) {
  const data=planningData(weddingId,'reception'); const service=(data.eveningFoodServices||[]).find(x=>x.id===serviceId); if(!service)return;
  const set=new Set(service.selectedIds||[]); checked?set.add(recipeId):set.delete(recipeId); service.selectedIds=[...set]; syncWeddingEveningLegacyFields(weddingId);
  const host=document.querySelector(`[data-phase8-food-status="${serviceId}"]`);
  if(host&&window.WeddingConsumptionRules?.renderFoodAllocationStatus)host.innerHTML=WeddingConsumptionRules.renderFoodAllocationStatus(service);
}
function setWeddingEveningAllocation(weddingId,serviceId,key,value) {
  const data=planningData(weddingId,'reception'); const service=(data.eveningFoodServices||[]).find(x=>x.id===serviceId); if(!service)return;
  service.allocations=service.allocations||{}; service.allocations[key]=Math.max(0,Number(value||0)); syncWeddingEveningLegacyFields(weddingId);
  const host=document.querySelector(`[data-phase8-food-status="${serviceId}"]`);
  if(host&&window.WeddingConsumptionRules?.renderFoodAllocationStatus)host.innerHTML=WeddingConsumptionRules.renderFoodAllocationStatus(service);
}
function renderWeddingEveningMenuEditor(weddingId,service) {
  const defs=weddingKitchenMenus(),def=defs[service.menuKey]; if(!def)return '<div class="rounded-lg border border-dashed p-4 text-sm text-gray-400">Choose a Kitchen menu to show its food options.</div>';
  const selected=new Set(service.selectedIds||[]),alloc=service.allocations||{};
  const recipeCheck=recipe=>`<label class="flex gap-3 p-3 rounded-lg border bg-white"><input type="checkbox" ${selected.has(recipe.id)?'checked':''} onchange="toggleWeddingEveningRecipe('${weddingId}','${service.id}','${recipe.id}',this.checked)"><span class="text-sm"><strong>${esc(recipe.name)}</strong><span class="block text-[11px] text-gray-400">Kitchen Specification · Page ${recipe.page||'-'}</span></span></label>`;
  if(service.menuKey==='fingerBuffet' || ['afternoonTea','platters','canapes'].includes(service.menuKey)){
    const recipes=def.recipes||[];
    return `<div><p class="text-xs font-semibold text-gray-600 mb-2">Select the exact Kitchen items being served</p><div class="grid md:grid-cols-2 gap-2">${recipes.map(recipeCheck).join('')}</div>${window.WeddingConsumptionRules?.renderFoodAllocationStatus ? WeddingConsumptionRules.renderFoodAllocationStatus(service) : ''}</div>`;
  }
  if(['curry','bbq','hogRoast','breakfast','hotRolls'].includes(service.menuKey)){
    const choices=def.choices||def.recipes||[];
    const accomp=(def.accompaniments||[]).map(id=>(window.KitchenApp&&KitchenApp.recipeById)?KitchenApp.recipeById(id):null).filter(Boolean);
    return `<div class="space-y-4">
      <div><p class="text-xs font-semibold text-gray-600 mb-2">Kitchen food split</p><div class="grid md:grid-cols-2 gap-2">${choices.map(choice=>{const recipeId=choice.recipeId||choice.id;return `<label class="block rounded-lg border bg-white p-3"><span class="text-sm font-semibold">${esc(choice.name)}</span><input type="number" min="0" value="${Number(alloc[choice.id]||0)||''}" oninput="setWeddingEveningAllocation('${weddingId}','${service.id}','${choice.id}',this.value)" placeholder="0 covers" class="mt-2 w-full px-3 py-2 border rounded-lg text-sm"></label>`}).join('')}</div></div>
      ${accomp.length?`<div><p class="text-xs font-semibold text-gray-600 mb-2">Shared accompaniments</p><div class="grid md:grid-cols-2 gap-2">${accomp.map(recipeCheck).join('')}</div></div>`:''}
      ${window.WeddingConsumptionRules?.renderFoodAllocationStatus ? WeddingConsumptionRules.renderFoodAllocationStatus(service) : ''}
    </div>`;
  }
  if(service.menuKey==='custom') return `<label class="block text-xs font-medium text-gray-600">Bespoke food details<textarea rows="3" oninput="updateWeddingEveningService('${weddingId}','${service.id}','notes',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(service.notes||'')}</textarea></label>`;
  return '<div class="text-sm text-gray-500">This Kitchen menu has no additional selectable items.</div>';
}
function renderWeddingEveningServices(w,data) {
  const services=ensureWeddingEveningServices(w,data), menus=weddingKitchenMenuOptions();
  return `<div class="space-y-4">
    ${services.length?services.map((service,index)=>`<article class="rounded-xl border border-olive-200 bg-cream-50/30 p-4">
      <div class="flex items-center justify-between gap-3"><div><p class="text-[11px] font-bold tracking-widest text-olive-600">FOOD SERVICE ${index+1}</p><h6 class="font-bold text-charcoal-900">${esc(service.menuLabel||weddingKitchenMenus()[service.menuKey]?.label||'Choose food')}</h6></div><button type="button" onclick="removeWeddingEveningService('${w.id}','${service.id}')" class="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold">Remove</button></div>
      <div class="grid sm:grid-cols-3 gap-3 mt-4">
        <label class="text-xs font-medium text-gray-600">Kitchen menu<select onchange="updateWeddingEveningService('${w.id}','${service.id}','menuKey',this.value,true)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select...</option>${menus.map(m=>`<option value="${m.key}" ${service.menuKey===m.key?'selected':''}>${esc(m.label)}</option>`).join('')}</select></label>
        <label class="text-xs font-medium text-gray-600">Covers<input type="number" min="0" value="${Number(service.guests||0)||''}" oninput="updateWeddingEveningService('${w.id}','${service.id}','guests',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
        <label class="text-xs font-medium text-gray-600">Service time<input type="time" value="${esc(service.time||'')}" oninput="updateWeddingEveningService('${w.id}','${service.id}','time',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      </div>
      <div class="mt-4">${renderWeddingEveningMenuEditor(w.id,service)}</div>
      ${service.menuKey!=='custom'?`<label class="block text-xs font-medium text-gray-600 mt-4">Service notes<textarea rows="2" oninput="updateWeddingEveningService('${w.id}','${service.id}','notes',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(service.notes||'')}</textarea></label>`:''}
    </article>`).join(''):'<div class="rounded-xl border border-dashed p-5 text-center text-sm text-gray-400">No evening food services added yet.</div>'}
    <button type="button" onclick="addWeddingEveningService('${w.id}')" class="w-full sm:w-auto px-4 py-2 rounded-lg bg-olive-700 text-white text-sm font-semibold">+ Add Food Option</button>
    <p class="text-xs text-gray-500">Menus and food items are read directly from the Kitchen tab. Add as many services as needed — for example Finger Buffet plus Hog Roast.</p>
  </div>`;
}


function weddingAdditionalReceptionTimings(weddingId) {
  const data=planningData(weddingId,'reception');
  if(!Array.isArray(data.additionalTimings)) data.additionalTimings=[];
  return data.additionalTimings;
}
function addWeddingReceptionTiming(weddingId) {
  weddingAdditionalReceptionTimings(weddingId).push({id:`rt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,label:'',time:'',notes:''});
  renderWeddingWorkspace();
}
function updateWeddingReceptionTiming(weddingId,index,key,value) {
  const rows=weddingAdditionalReceptionTimings(weddingId);
  if(!rows[index])return;
  rows[index][key]=value;
}
function removeWeddingReceptionTiming(weddingId,index) {
  weddingAdditionalReceptionTimings(weddingId).splice(index,1);
  renderWeddingWorkspace();
}
function renderAdditionalReceptionTimings(w,data) {
  const rows=weddingAdditionalReceptionTimings(w.id);
  return `<section class="rounded-xl border border-olive-100 p-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div><p class="text-xs font-bold tracking-widest text-olive-600">ADDITIONAL RECEPTION TIMINGS</p><h5 class="font-bold text-lg text-charcoal-900 mt-1">Anything else happening on the day</h5><p class="text-xs text-gray-500 mt-1">Add as many extra timings as required — photos, room turnaround, confetti, receiving line, buffet opening, sparkler exit, entertainment and more.</p></div>
      <button type="button" onclick="addWeddingReceptionTiming('${w.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">+ Add Timing</button>
    </div>
    <div class="space-y-2 mt-4">
      ${rows.length?rows.map((row,index)=>`<div class="grid md:grid-cols-[150px_1fr_1.3fr_38px] gap-2 items-center rounded-lg bg-cream-50/60 border border-cream-200 p-2">
        <input type="time" value="${esc(row.time||'')}" oninput="updateWeddingReceptionTiming('${w.id}',${index},'time',this.value)" class="px-3 py-2 border rounded-lg text-sm">
        <input value="${esc(row.label||'')}" oninput="updateWeddingReceptionTiming('${w.id}',${index},'label',this.value)" class="px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Couple photos">
        <input value="${esc(row.notes||'')}" oninput="updateWeddingReceptionTiming('${w.id}',${index},'notes',this.value)" class="px-3 py-2 border rounded-lg text-sm" placeholder="Optional operational note">
        <button type="button" onclick="removeWeddingReceptionTiming('${w.id}',${index})" class="p-2 text-red-600" title="Remove timing"><i data-lucide="trash-2" style="width:16px"></i></button>
      </div>`).join(''):'<div class="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-400 text-center">No additional reception timings yet.</div>'}
    </div>
    <p class="text-[12px] text-gray-400 mt-3">These are saved with Reception & Food and are part of the Phase 1 canonical wedding timing data.</p>
  </section>`;
}

const WEDDING_BESPOKE_DRINK_OPTIONS=[
  'Prosecco','Non-alcoholic Prosecco','Orange Juice','Bottled Beer','Peroni',
  'House White Wine','House Red Wine','House Rosé Wine','Soft Drink','Other / Bespoke'
];
function bespokeDrinkOptions(selected=''){
  const values=[...WEDDING_BESPOKE_DRINK_OPTIONS];
  if(selected && !values.includes(selected)) values.push(selected);
  return `<option value="">Select drink...</option>${values.map(x=>`<option value="${esc(x)}" ${selected===x?'selected':''}>${esc(x)}</option>`).join('')}`;
}
function renderBespokeDrinksPlanning(w,data){
  if(data.drinksPackage!=='Bespoke')return '';
  const welcome=Array.isArray(data.bespokeWelcomeDrinks)?data.bespokeWelcomeDrinks:[];
  const toast=Array.isArray(data.bespokeToastDrinks)?data.bespokeToastDrinks:[];
  const rows=(key,label,items)=>`<div class="rounded-xl border border-olive-100 p-4">
    <div class="flex justify-between gap-3 items-start"><div><p class="text-xs font-bold tracking-widest text-olive-600">${label.toUpperCase()}</p><p class="text-xs text-gray-500 mt-1">Choose the drinks and quantity required for this part of the wedding.</p></div><button type="button" onclick="addBespokeWeddingDrink('${w.id}','${key}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-xs font-bold">+ Add drink</button></div>
    <div class="space-y-2 mt-3">${items.length?items.map((item,i)=>`<div class="grid md:grid-cols-[1fr_105px_1fr_38px] gap-2 items-center">
      <select onchange="updateBespokeWeddingDrink('${w.id}','${key}',${i},'drink',this.value)" class="px-3 py-2 border rounded-lg text-sm">${bespokeDrinkOptions(item.drink||'')}</select>
      <input type="number" min="0" value="${esc(item.quantity??'')}" oninput="updateBespokeWeddingDrink('${w.id}','${key}',${i},'quantity',this.value)" class="px-3 py-2 border rounded-lg text-sm" placeholder="Qty">
      <input value="${esc(item.notes||'')}" oninput="updateBespokeWeddingDrink('${w.id}','${key}',${i},'notes',this.value)" class="px-3 py-2 border rounded-lg text-sm" placeholder="Optional note / bespoke drink">
      <button type="button" onclick="removeBespokeWeddingDrink('${w.id}','${key}',${i})" class="p-2 text-red-600"><i data-lucide="trash-2" style="width:16px"></i></button>
    </div>`).join(''):'<div class="rounded-lg border border-dashed p-3 text-xs text-gray-400 text-center">No drinks added yet.</div>'}</div>
  </div>`;
  return `<section class="rounded-xl border border-gold-200 bg-amber-50/30 p-4">
    <div class="mb-4"><p class="text-xs font-bold tracking-widest text-gold-700">BESPOKE DRINKS</p><h5 class="font-bold text-lg">Welcome & toast drinks</h5><p class="text-xs text-gray-500 mt-1">These quantities become the authoritative bespoke drinks plan. Prep & Equipment now uses these quantities directly for glassware calculations.</p></div>
    <div class="grid xl:grid-cols-2 gap-3">${rows('bespokeWelcomeDrinks','Welcome drinks',welcome)}${rows('bespokeToastDrinks','Toast drinks',toast)}</div>
  </section>`;
}
function addBespokeWeddingDrink(weddingId,key){
  const data=planningData(weddingId,'reception');if(!Array.isArray(data[key]))data[key]=[];
  data[key].push({drink:'',quantity:'',notes:''});renderWeddingWorkspace();
}
function updateBespokeWeddingDrink(weddingId,key,index,field,value){
  const data=planningData(weddingId,'reception');if(!Array.isArray(data[key]))data[key]=[];
  if(!data[key][index])return;data[key][index][field]=field==='quantity'?(value===''?'':Number(value)):value;
}
function removeBespokeWeddingDrink(weddingId,key,index){
  const data=planningData(weddingId,'reception');if(Array.isArray(data[key]))data[key].splice(index,1);renderWeddingWorkspace();
}
function renderReceptionPlanningBody(w, section, data) {
  const profile=weddingProfile(w);
  const quoteMeta=weddingPrepQuoteMeta(w.id);
  // Carry existing saved quote selections forward as defaults, without deleting or overwriting old planning data.
  if(!data.weddingBreakfastMenu && quoteMeta.menu && quoteMeta.menu!=='None') data.weddingBreakfastMenu=quoteMeta.menu;
  if(!data.eveningFoodMenu && quoteMeta.eveningFood && quoteMeta.eveningFood!=='None') data.eveningFoodMenu=quoteMeta.eveningFood;
  const timingFields = [
    ['arrivalTime',weddingHasOnsiteCeremony(w)?'Reception / drinks arrival time':'Guest arrival time','time'],
    ...(profile.dayMealRequired!==false && data.mealService!=='No day meal' ? [['weddingBreakfastTime','Wedding breakfast time','time']] : []),
    ['speechesTime','Speeches time','time'],
    ['cakeCutTime','Cake cutting time','time'],
    ['firstDanceTime','First dance time','time'],
    ...(profile.eveningFoodRequired!==false ? [['eveningFoodTime','Evening food time','time']] : []),
    ['finishTime','Finish time','time']
  ];

  return `<div class="space-y-5">
    <section class="rounded-xl border border-olive-100 bg-cream-50/40 p-4">
      <p class="text-xs font-bold tracking-widest text-olive-600">TIMINGS</p>
      <h5 class="font-bold text-lg text-charcoal-900 mt-1">Reception timings</h5>
      <p class="text-xs text-gray-500 mt-1">These feed the Master Day Timings summary above.</p>
      <div class="grid sm:grid-cols-2 gap-4 mt-4">
        ${timingFields.map(field=>renderPlanningField(w.id,'reception',field,data[field[0]]||'')).join('')}
      </div>
    </section>

    ${renderAdditionalReceptionTimings(w,data)}

    ${renderBespokeDrinksPlanning(w,data)}

    ${profile.dayMealRequired!==false ? `<section class="rounded-xl border border-olive-100 p-4">
      <p class="text-xs font-bold tracking-widest text-olive-600">WEDDING BREAKFAST</p>
      <h5 class="font-bold text-lg text-charcoal-900 mt-1">Day food</h5>
      <div class="grid sm:grid-cols-2 gap-4 mt-4">
        ${renderPlanningField(w.id,'reception',['mealService','Day meal service','select:Three-course meal|Two-course meal|One-course meal|Buffet / informal food|No day meal'],data.mealService||'')}
        ${data.mealService!=='No day meal' ? renderPlanningField(w.id,'reception',['weddingBreakfastMenu','Wedding breakfast menu','select:None|Rose Menu|Peony Menu|Orchid Menu|Afternoon Tea Breakfast|Bespoke / Other'],data.weddingBreakfastMenu||'') : ''}
      </div>
      <p class="text-xs text-gray-500 mt-3">The selected wedding menu now controls the structured dish lists shown against each guest. Menu-linked guest choices feed Kitchen using Specification recipe IDs.</p>
    </section>`:''}

    <section class="rounded-xl border border-gold-200 bg-gold-50/40 p-4">
      <p class="text-xs font-bold tracking-widest text-gold-700">DRINKS PACKAGE</p>
      <h5 class="font-bold text-lg text-charcoal-900 mt-1">Package allocation & bar requirement</h5>
      <p class="text-sm text-gray-500 mt-1">Adults and children are separated. Welcome, toast and meal drinks are allocated independently and calculated into whole bottles for Bar and Prep.</p>
      <div class="mt-4">${window.WeddingConsumptionRules?.renderDrinksPlanner ? WeddingConsumptionRules.renderDrinksPlanner(w) : '<div class="text-sm text-gray-500">Drinks & equipment engine unavailable.</div>'}</div>
    </section>

    ${profile.eveningFoodRequired!==false ? `<section class="rounded-xl border border-olive-100 p-4">
      <p class="text-xs font-bold tracking-widest text-olive-600">EVENING FOOD</p>
      <h5 class="font-bold text-lg text-charcoal-900 mt-1">Kitchen-linked evening food</h5>
      <div class="mt-4">${renderWeddingEveningServices(w,data)}</div>
    </section>`:''}

    <section class="rounded-xl border border-gray-200 p-4">
      ${renderPlanningField(w.id,'reception',['menuNotes','Menu choices / dietary notes','textarea'],data.menuNotes||'')}
    </section>
  </div>`;
}

function weddingPrepPlanning(weddingId, section) {
  return planningRecord(weddingId,section)?.data || planningData(weddingId,section) || {};
}

function weddingPrepQuoteMeta(weddingId) {
  const quote = latestWeddingQuote(weddingId);
  return (quote?.items || []).find(item=>item.type==='meta') || {};
}

function weddingPrepMealService(wedding) {
  const reception = weddingPrepPlanning(wedding.id,'reception');
  if (reception.mealService) return reception.mealService;

  const meta = weddingPrepQuoteMeta(wedding.id);
  if (meta.menu && meta.menu !== 'None') return 'Three-course meal';
  return '';
}

function weddingPrepDrinksPackage(wedding) {
  const reception = weddingPrepPlanning(wedding.id,'reception');
  if (reception.drinksPackage) return reception.drinksPackage;

  const meta = weddingPrepQuoteMeta(wedding.id);
  return meta.drinks || 'None';
}

function weddingPrepQuoteLines(weddingId) {
  const quote = latestWeddingQuote(weddingId);
  if (!quote || !Array.isArray(quote.items)) return [];

  return quote.items
    .flat(Infinity)
    .filter(item => item && typeof item === 'object' && item.type !== 'meta');
}

function weddingPrepBookedQuoteItem(weddingId, names) {
  const wanted = (Array.isArray(names) ? names : [names])
    .map(name => String(name || '').trim().toLowerCase());

  return weddingPrepQuoteLines(weddingId).find(line => {
    const lineName = String(line.name || '').trim().toLowerCase();
    return wanted.some(name => lineName === name || lineName.includes(name));
  }) || null;
}

function weddingPrepRows(wedding) {
  const day = Number(wedding.dayGuests || 0);
  const evening = Number(wedding.eveningGuests || 0);
  const fullRoomChairs = Math.max(day, evening);

  const reception = weddingPrepPlanning(wedding.id,'reception');
  const profile = weddingProfile(wedding);
  const packagePlanning = weddingPrepPlanning(wedding.id,'package');
  const decor = weddingPrepPlanning(wedding.id,'decor');
  const layout = weddingPrepPlanning(wedding.id,'layout');
  const ceremony = weddingPrepPlanning(wedding.id,'ceremony');
  const mealService = weddingPrepMealService(wedding);
  const drinksPackage = weddingPrepDrinksPackage(wedding);
  const tableCount = Number(layout.numberOfTables || 0);
  const packageName = String(wedding.package || '').trim();
  const isPackageWedding = !!packageName &&
    !['bespoke','tbc','none'].includes(packageName.toLowerCase());

  const rows = [];
  const warnings = [];
  const add = (department,item,quantity='',notes='') =>
    rows.push({department,item,quantity,notes});

  if (!day && evening && profile.dayMealRequired !== false && profile.weddingFormat !== 'evening_only') {
    warnings.push('This wedding expects daytime service but the day guest number is empty.');
  }
  if (profile.dayMealRequired !== false && !day && mealService && mealService !== 'No day meal') {
    warnings.push('A day meal is selected but no day guest number has been entered.');
  }

  // Wedding breakfast preparation uses day guests only.
  if (profile.dayMealRequired !== false && day > 0) {
    if (mealService === 'Three-course meal') {
      add('Restaurant','Polish table knives',day*2,'Two knives per day guest');
      add('Restaurant','Polish table forks',day*2,'Two forks per day guest');
      add('Restaurant','Polish dessert spoons',day,'One per day guest');
      add('Restaurant','Starter plates',day);
      add('Restaurant','Main-course plates',day);
      add('Restaurant','Dessert plates / bowls',day);
    } else if (mealService === 'Two-course meal') {
      add('Restaurant','Polish table knives',day);
      add('Restaurant','Polish table forks',day);
      add('Restaurant','Polish dessert spoons',day,'Adjust if the selected courses do not require spoons');
      add('Restaurant','Main-course plates',day);
      add('Restaurant','Dessert plates / bowls',day);
    } else if (mealService === 'One-course meal') {
      add('Restaurant','Polish table knives',day);
      add('Restaurant','Polish table forks',day);
      add('Restaurant','Main-course plates',day);
    } else if (mealService === 'Buffet / informal food') {
      add('Restaurant','Day buffet plates',day);
      add('Restaurant','Day buffet forks',day);
      add('Restaurant','Day buffet napkins',day);
    } else if (!mealService) {
      warnings.push('Day meal service has not been selected, so cutlery and crockery could not be calculated.');
    }

    add('Restaurant','Fold heart napkins',day,'Wedding breakfast only');
    add('Restaurant','Water glasses to polish',day);
    add('Restaurant','Wine glasses to polish',day);
  }

  if (drinksPackage && drinksPackage !== 'None') {
    const drinkCalc=window.WeddingConsumptionRules?.drinksCalculation ? WeddingConsumptionRules.drinksCalculation(wedding) : null;
    add('Bar','Drinks package',drinksPackage);
    if(drinkCalc?.quantities){
      const q=drinkCalc.quantities;

      if(drinkCalc.bespoke){
        (q.welcomeRows||[]).forEach(row=>add('Bar',`${row.drink} — welcome`,row.quantity,row.notes||'Bespoke welcome drink'));
        (q.toastRows||[]).forEach(row=>add('Bar',`${row.drink} — toast`,row.quantity,row.notes||'Bespoke toast drink'));

        // Operational glassware: prosecco/champagne/non-alcoholic prosecco/OJ are all flute serves.
        add('Bar','Welcome flutes to polish / prepare',q.welcomeFlutes,'Prosecco, Champagne, non-alcoholic Prosecco and orange juice only');
        add('Bar','Toast flutes to polish / prepare',q.toastFlutes,'Prosecco, Champagne, non-alcoholic Prosecco and orange juice only');
        add('Bar','TOTAL flute services',q.totalFluteServices,`${q.welcomeFlutes} welcome + ${q.toastFlutes} toast`);
        if(q.totalWineGlassServices)add('Bar','Additional wine glasses for bespoke drinks',q.totalWineGlassServices,'Welcome + toast bespoke wine serves');
        if(q.totalBeerGlassServices)add('Bar','Beer glasses for bespoke drinks',q.totalBeerGlassServices,'Only where the bespoke selection is served in a glass');
      }else{
        add('Bar',`${q.welcomeAlcoholName} — welcome`,`${q.welcomeAlcoholBottles} bottles`,`${q.welcomeAlcoholGlasses} × 125ml alcoholic serves · always rounded up`);
        add('Bar','Orange juice / soft — welcome',q.welcomeSoftGuests,'Adult non-alcoholic welcome drinks');
        add('Bar',`${q.toastAlcoholName} — toast`,`${q.toastAlcoholBottles} bottles`,`${q.toastAlcoholGlasses} × 125ml alcoholic serves · always rounded up`);
        add('Bar','Orange juice / soft — toast',q.toastSoftGuests,'Adult non-alcoholic toast drinks');
        add('Bar',`${q.beerName} — meal drinks`,`${q.beerBottles} bottles`,`${drinkCalc.beer} adult guests`);
        add('Bar','White wine — meal drinks',`${q.whiteWineBottles} bottles`,`${drinkCalc.white} adult guests`);
        add('Bar','Red wine — meal drinks',`${q.redWineBottles} bottles`,`${drinkCalc.red} adult guests`);
        add('Bar','Rosé wine — meal drinks',`${q.roseWineBottles} bottles`,`${drinkCalc.rose} adult guests`);
        add('Bar','Soft drinks — meal drinks',q.mealSoftGuests,'Adult soft-drink allocation');
        if(drinkCalc.children>0)add('Bar','Children drinks',drinkCalc.children,reception.childDrinkNotes||'Child drinks note required');

        // This is the Phase 6 fix: BOTH welcome and toast need flutes when the serve is Prosecco/Champagne/OJ.
        add('Bar','Welcome flutes to polish / prepare',q.welcomeFlutes,`${q.welcomeAlcoholName} + orange juice / soft flute serves`);
        add('Bar','Toast flutes to polish / prepare',q.toastFlutes,`${q.toastAlcoholName} + orange juice / soft flute serves`);
        add('Bar','TOTAL flute services',q.totalFluteServices,`${q.welcomeFlutes} welcome + ${q.toastFlutes} toast`);
      }

      if(!drinkCalc.complete) drinkCalc.issues.forEach(x=>warnings.push(x));
    } else {
      warnings.push('Drinks package selected but its allocation is incomplete.');
    }
  }

  if (profile.eveningFoodRequired !== false) {
    const plannedServices=Array.isArray(reception.eveningFoodServices)?reception.eveningFoodServices.filter(x=>x&&x.menuKey):[];
    if(plannedServices.length){
      plannedServices.forEach((service,index)=>{
        const covers=Number(service.guests||0);
        const label=service.menuLabel||weddingKitchenMenus()[service.menuKey]?.label||service.menuKey||'Food service';
        add('Evening Food',`Evening food service ${index+1}`,`${label}${service.time?` · ${service.time}`:''}`);
        if(covers){
          add('Evening Food',`${label} plates`,covers);
          add('Evening Food',`${label} forks`,covers);
          add('Evening Food',`${label} napkins`,covers);
          const tongCount=window.WeddingConsumptionRules?.serviceUtensilCount ? WeddingConsumptionRules.serviceUtensilCount(service) : 1;
          add('Evening Food',`${label} serving tongs / utensils`,tongCount,'One per selected or allocated food option');
          const foodCalc=window.WeddingConsumptionRules?.foodServiceCalculation ? WeddingConsumptionRules.foodServiceCalculation(service) : null;
          if(foodCalc&&!foodCalc.complete) foodCalc.issues.forEach(issue=>warnings.push(`${label}: ${issue}`));
        }
      });
    } else if(evening>0){
      const eveningFoodGuests = Number(reception.eveningFoodGuests || evening);
      add('Evening Food','Evening food service',reception.eveningFoodMenu || 'Menu not selected');
      add('Evening Food','Evening buffet plates',eveningFoodGuests);
      add('Evening Food','Evening buffet forks',eveningFoodGuests);
      add('Evening Food','Evening buffet napkins',eveningFoodGuests);
    }
  }

  // Chairs stay in the room for the full wedding, so use whichever guest
  // number is larger rather than day guests alone.
  if (fullRoomChairs > 0) {
    add('Room Setup','Chairs required',fullRoomChairs,'Higher of day and evening guest numbers');
  }

  // Package weddings include chair covers. Bespoke weddings include them only
  // where Chair Covers & Sash appears as a booked line on the latest quote.
  const chairCoverQuoteLine = weddingPrepBookedQuoteItem(
    wedding.id,
    ['Chair Covers & Sash','Chair Covers','Chair Cover','Sashes']
  );
  const chairCoversBooked = isPackageWedding || !!chairCoverQuoteLine;

  if (chairCoversBooked && fullRoomChairs > 0) {
    const sashDetails = String(decor.chairCovers || '').trim();
    const source = isPackageWedding
      ? `${packageName} package inclusion`
      : 'Booked bespoke quote extra';

    add('Room Setup','Fit chair covers',fullRoomChairs,
      [source,sashDetails].filter(Boolean).join(' · '));
    add('Room Setup','Fit chair sashes',fullRoomChairs,
      sashDetails || source);
  }

  if (tableCount > 0) {
    add('Room Setup','Guest tables',tableCount);
    add('Room Setup','Table numbers',tableCount);
  } else if (day > 0) {
    warnings.push('Number of guest tables is empty, so table numbers and centrepieces could not be calculated.');
  }

  // Centrepieces are included in Evergreen, Blossom and Willow packages.
  // Pull the wedding-specific design/ownership instruction directly from Planning.
  // Bespoke weddings still require a booked quote line before venue prep is generated.
  const centrepiecePlan=String(packagePlanning.centrepieceDetails||decor.centrepieces||'').trim();
  const centrepiecesIncludedByPackage=Boolean(
    isPackageWedding &&
    window.WeddingPackageGuide?.allIncluded?.(packageName)?.some(item=>item.key==='centrepieces')
  );
  const centrepieceQuoteLine=weddingPrepBookedQuoteItem(wedding.id,['Table Centrepieces','Centrepieces']);
  const ownCentrepieces=/\b(bride'?s? own|couple'?s? own|own centre|own decor|own décor|florist|external|supplier|providing their own)\b/i.test(centrepiecePlan);
  const noCentrepieces=/\b(none|not required|no centre|without centre)\b/i.test(centrepiecePlan);
  const additionalCentrepiece=/additional centrepiece/i.test(centrepiecePlan)?1:0;

  if(!noCentrepieces && (centrepiecesIncludedByPackage || centrepieceQuoteLine)){
    const baseQty=tableCount || Number(centrepieceQuoteLine?.quantity||0) || '';
    const source=centrepiecesIncludedByPackage
      ? `${packageName} package inclusion`
      : 'Booked bespoke quote extra';

    if(ownCentrepieces){
      add('Décor','Set out couple / supplier centrepieces',
        baseQty || 'As supplied',
        [source,centrepiecePlan].filter(Boolean).join(' · '));
    }else{
      let quantity=baseQty || 'Check table plan';
      if(additionalCentrepiece && Number(baseQty)>0){
        quantity=`${baseQty} guest tables + 1 additional`;
      }
      add('Décor','Make centrepieces',quantity,
        [source,centrepiecePlan].filter(Boolean).join(' · '));
    }
  }

  // Other bespoke décor is printed only when it is present on the latest saved quote.
  // Planning supplies the style/colour description but does not itself sell the item.
  const decorRules = [
    {
      quoteNames:['LED Light Curtain','Light Curtain'],
      item:'Prepare LED light curtain',
      quantity:1,
      notes:decor.backdrop || ''
    },
    {
      quoteNames:['LOVE Letters (4ft)','LOVE Letters'],
      item:'Prepare LOVE letters',
      quantity:1,
      notes:''
    },
    {
      quoteNames:['Floral White Hexagon Backdrop','Hexagon Backdrop','Backdrop'],
      item:'Prepare floral backdrop',
      quantity:1,
      notes:decor.backdrop || ''
    },
    {
      quoteNames:['Aisle Décor','Aisle Decor'],
      item:'Prepare aisle décor',
      quantity:'As booked',
      notes:decor.aisleDecor || decor.ceremonyDecor || ''
    },
    {
      quoteNames:['Balloon Arch'],
      item:'Prepare balloon arch',
      quantity:1,
      notes:decor.backdrop || ''
    },
    {
      quoteNames:['Bride & Groom Throne Chairs','Throne Chairs'],
      item:'Prepare bride and groom throne chairs',
      quantity:2,
      notes:''
    }
  ];

  decorRules.forEach(rule => {
    const bookedLine = weddingPrepBookedQuoteItem(wedding.id,rule.quoteNames);
    if (!bookedLine) return;

    let quantity = rule.quantity;
    if (quantity === 'As booked' && Number(bookedLine.quantity || 0) > 0) {
      quantity = Number(bookedLine.quantity);
    }

    add('Décor',rule.item,quantity,
      [rule.notes,bookedLine.name].filter(Boolean).join(' · '));
  });

  // Package-specific décor can still be added here later when the exact
  // inclusions for Evergreen, Blossom and Willow are confirmed.
  if (String(decor.topTable||'').trim()) {
    add('Décor','Prepare top table layout',1,decor.topTable);
  }
  if (String(decor.welcomeSign||'').trim()) {
    add('Décor','Prepare welcome sign / table plan',1,decor.welcomeSign);
  }

  if (weddingHasOnsiteCeremony(wedding) && ceremony.ceremonyTime) {
    add('Ceremony','Registrar table',1);
    add('Ceremony','Registrar chairs',2,'Check final registrar requirement');
    add('Ceremony','Reserved seating signs','As required');
    add('Ceremony','Test ceremony music','Complete');
    add('Ceremony','Registrar rooms confirmed','Complete',
      [ceremony.groomRegistrarRoom,ceremony.brideRegistrarRoom].filter(Boolean).join(' / '));
  }

  add('General','Cake knife',1);
  add('General','Gift / card table',1);
  add('General','Cake table',1);

  return {
    rows,
    warnings,
    mealService,
    drinksPackage,
    packageName,
    chairCoversBooked
  };
}

function printWeddingPrepList(weddingId) {
  const wedding = DB.weddings.find(item=>item.id===weddingId);
  if (!wedding) return;

  const prep = weddingPrepRows(wedding);
  const preferredOrder=['General','Ceremony','Room Setup','Décor','Restaurant','Bar','Evening Food'];
  const found=[...new Set(prep.rows.map(row=>row.department))];
  const departments=[...preferredOrder.filter(x=>found.includes(x)),...found.filter(x=>!preferredOrder.includes(x))];

  const sectionMeta={
    'General':['Final venue checks','Complete these before the room is signed off.'],
    'Ceremony':['Ceremony preparation','Only shown where the wedding ceremony is taking place at Windmill Farm.'],
    'Room Setup':['Room setup','Physical room, chairs, tables and covers.'],
    'Décor':['Décor & finishing touches','Booked décor and confirmed styling requirements.'],
    'Restaurant':['Wedding breakfast','Crockery, cutlery, glassware and table preparation.'],
    'Bar':['Drinks & glassware','Calculated from the latest drinks plan and guest numbers.'],
    'Evening Food':['Evening food service','Service equipment calculated from the planned evening food.']
  };

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(wedding.couple)} Prep List</title>
  <style>
    *{box-sizing:border-box}
    @page{size:A4;margin:11mm 12mm}
    body{font-family:Arial,sans-serif;color:#20251f;margin:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    h1,h2,h3,p{margin:0}
    .header{display:grid;grid-template-columns:1fr 52mm;gap:12mm;border-bottom:2.5px solid #52613d;padding-bottom:8mm;margin-bottom:5mm}
    .eyebrow{font-size:8pt;font-weight:800;letter-spacing:.16em;color:#65764b}
    h1{font-family:Georgia,serif;font-size:24pt;font-weight:400;margin-top:1.5mm}
    .meta{display:flex;flex-wrap:wrap;gap:2mm 5mm;font-size:8.2pt;line-height:1.45;margin-top:3mm;color:#596057}
    .meta strong{color:#222820}
    .signoff{border:1px solid #d9ded4;border-radius:3mm;padding:4mm;font-size:7.5pt;line-height:1.5;background:#fafbf8}
    .sign-line{display:block;border-bottom:1px solid #9ca396;height:7mm;margin-bottom:2mm}
    .warning{border:1px solid #d48b69;border-left:4px solid #b4532f;background:#fff7f2;color:#72361f;padding:3mm 3.5mm;margin:3mm 0;font-size:7.5pt;font-weight:700;break-inside:avoid}
    .department{margin-top:4.5mm;break-inside:auto}
    .department-head{display:flex;justify-content:space-between;align-items:end;gap:4mm;background:#52613d;color:white;padding:2.8mm 3.2mm;border-radius:2mm 2mm 0 0}
    .department-head h2{font-family:Georgia,serif;font-size:12.5pt;font-weight:400}
    .department-head p{font-size:6.3pt;color:#e7ecdf;margin-top:.6mm}
    .count{font-size:6.5pt;font-weight:800;white-space:nowrap;background:rgba(255,255,255,.13);padding:1.2mm 2mm;border-radius:10mm}
    table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:7.5pt}
    thead{display:table-header-group}
    tr{break-inside:avoid;page-break-inside:avoid}
    th,td{border-bottom:1px solid #e0e4dd;padding:2.4mm 2mm;text-align:left;vertical-align:middle}
    th{background:#f3f5ef;font-size:6.2pt;text-transform:uppercase;letter-spacing:.08em;color:#687164}
    .check-col{width:11mm;text-align:center}.qty-col{width:25mm;text-align:center}.notes-col{width:64mm}
    .check-box{display:inline-block;width:5.6mm;height:5.6mm;border:1.5px solid #4b5447;border-radius:.7mm;background:#fff;vertical-align:middle}
    .item{font-weight:750;font-size:7.8pt}.qty{font-weight:850;font-size:8pt;text-align:center}.notes{font-size:6.8pt;color:#697168;line-height:1.35}
    .department tbody tr:nth-child(even){background:#fbfcfa}
    .summary{margin-top:5mm;display:grid;grid-template-columns:repeat(4,1fr);gap:2.5mm;break-inside:avoid}
    .summary-box{border:1px solid #dce1d7;background:#fafbf8;border-radius:2mm;padding:2.5mm}
    .summary-box small{display:block;font-size:5.8pt;text-transform:uppercase;letter-spacing:.08em;color:#747d70}
    .summary-box strong{display:block;font-size:8.5pt;margin-top:.8mm}
    .final-signoff{margin-top:5mm;border:1px solid #ccd3c7;border-radius:2mm;padding:3.5mm;display:grid;grid-template-columns:1fr 1fr;gap:5mm;break-inside:avoid}
    .final-signoff h3{grid-column:1/-1;font-family:Georgia,serif;font-size:11pt;font-weight:400}
    .footer{margin-top:5mm;border-top:1px solid #ccd1c9;padding-top:2.5mm;font-size:6.1pt;color:#777f74;display:flex;justify-content:space-between;gap:4mm}
    @media print{body{background:white}.department-head{background:#52613d!important;color:#fff!important}.check-box{background:#fff!important}}
  </style></head><body>
    <header class="header">
      <div>
        <div class="eyebrow">THE GRANARY AT WINDMILL FARM · WEDDING PREP LIST</div>
        <h1>${esc(wedding.couple)}</h1>
        <div class="meta">
          <span>${esc(wedding.date||'Date TBC')}</span>
          <span>Package <strong>${esc(wedding.package||'TBC')}</strong></span>
          <span>Day <strong>${Number(wedding.dayGuests||0)}</strong></span>
          <span>Evening <strong>${Number(wedding.eveningGuests||0)}</strong></span>
          <span>Meal <strong>${esc(prep.mealService||'Not selected')}</strong></span>
          <span>Drinks <strong>${esc(prep.drinksPackage||'None')}</strong></span>
        </div>
      </div>
      <div class="signoff"><strong>PREP OWNER</strong><span class="sign-line"></span><strong>PREP DATE</strong><span class="sign-line"></span><strong>FINAL CHECK</strong><span class="sign-line"></span></div>
    </header>

    ${prep.warnings.map(warning=>`<div class="warning">⚠ ACTION REQUIRED · ${esc(warning)}</div>`).join('')}

    <div class="summary">
      <div class="summary-box"><small>Checklist items</small><strong>${prep.rows.length}</strong></div>
      <div class="summary-box"><small>Departments</small><strong>${departments.length}</strong></div>
      <div class="summary-box"><small>Day guests</small><strong>${Number(wedding.dayGuests||0)}</strong></div>
      <div class="summary-box"><small>Evening guests</small><strong>${Number(wedding.eveningGuests||0)}</strong></div>
    </div>

    ${departments.map(department=>{
      const rows=prep.rows.filter(row=>row.department===department);
      const meta=sectionMeta[department]||[department,'Operational preparation items.'];
      return `<section class="department">
        <div class="department-head"><div><h2>${esc(meta[0])}</h2><p>${esc(meta[1])}</p></div><span class="count">${rows.length} item${rows.length===1?'':'s'}</span></div>
        <table>
          <thead><tr><th class="check-col">Done</th><th>Prep item</th><th class="qty-col">Qty</th><th class="notes-col">Operational note</th></tr></thead>
          <tbody>${rows.map(row=>`<tr>
            <td class="check-col"><span class="check-box" aria-hidden="true"></span></td>
            <td class="item">${esc(row.item)}</td>
            <td class="qty">${esc(String(row.quantity ?? ''))}</td>
            <td class="notes">${esc(row.notes||'')}</td>
          </tr>`).join('')}</tbody>
        </table>
      </section>`;
    }).join('')}

    <section class="final-signoff"><h3>Final room & service sign-off</h3><div><strong style="font-size:7pt">Prep completed by</strong><span class="sign-line"></span></div><div><strong style="font-size:7pt">Checked by manager / coordinator</strong><span class="sign-line"></span></div></section>

    <footer class="footer"><span>Generated from the latest Wedding Planning, quote and calculated preparation logic.</span><span>Print date: ${new Date().toLocaleDateString('en-GB')}</span></footer>
  </body></html>`;

  const win = window.open('','_blank');
  if (!win) { toast('Allow pop-ups to generate the prep list','error'); return; }
  win.document.write(html);win.document.close();win.focus();setTimeout(()=>win.print(),250);
}

function planningFieldNeedsRerender(sectionId,key) {
  return sectionId==='reception' && ['mealService','drinksPackage'].includes(key);
}

function renderMusicEntertainmentPlanningBody(w,section,data){
  const fields=planningFieldsForSection(w,section);
  const byKey=Object.fromEntries(fields.map(f=>[f[0],f]));
  const renderKeys=keys=>keys.filter(k=>byKey[k]).map(k=>renderPlanningField(w.id,'music',byKey[k],data[k]||'')).join('');
  return `<div class="space-y-5">
    ${weddingProfile(w).djRequired!==false?`<section class="rounded-xl border border-olive-100 bg-cream-50/40 p-4"><p class="text-xs font-bold tracking-widest text-olive-600">DJ HANDOVER FOUNDATION</p><h5 class="font-bold text-lg mt-1">Setup & performance times</h5><p class="text-xs text-gray-500 mt-1 mb-4">Capture this once in Planning. Phase 9 will turn the same information into the DJ handover PDF.</p><div class="grid sm:grid-cols-3 gap-4">${renderKeys(['djSetupTime','djStart','djFinish'])}</div></section>`:''}
    <section class="rounded-xl border border-olive-100 p-4"><p class="text-xs font-bold tracking-widest text-olive-600">KEY MOMENTS</p><h5 class="font-bold text-lg mt-1 mb-4">Songs the couple has specifically chosen</h5><div class="grid sm:grid-cols-2 gap-4">${renderKeys(['receptionEntranceSong','cakeCutSong','firstDanceSong','fatherDaughterSong'])}</div></section>
    <section class="rounded-xl border border-olive-100 p-4"><p class="text-xs font-bold tracking-widest text-olive-600">DJ / ENTERTAINMENT BRIEF</p><h5 class="font-bold text-lg mt-1 mb-4">What the evening should feel like</h5><div class="grid sm:grid-cols-2 gap-4">${renderKeys(['mustPlay','doNotPlay','musicStyle','guestRequests','liveActRequirements','musicNotes'])}</div></section>
  </div>`;
}
function renderPlanningField(weddingId, sectionId, field, value) {
  const [key,label,type]=field;
  const inputHandler=`oninput="updatePlanningDraft('${weddingId}','${sectionId}','${key}',this.value)"`;
  const selectHandler=planningFieldNeedsRerender(sectionId,key)
    ? `onchange="updatePlanningDraft('${weddingId}','${sectionId}','${key}',this.value);renderWeddingWorkspace()"`
    : `onchange="updatePlanningDraft('${weddingId}','${sectionId}','${key}',this.value)"`;
  const css=`class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"`;
  if(type==='textarea') return `<label class="text-xs font-medium text-gray-600 sm:col-span-2">${label}<textarea rows="3" ${inputHandler} ${css}>${esc(value)}</textarea></label>`;
  if(type.startsWith('select:')) { const opts=type.split(':')[1].split('|'); return `<label class="text-xs font-medium text-gray-600">${label}<select ${selectHandler} ${css}><option value="">Select...</option>${opts.map(x=>`<option ${value===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`; }
  return `<label class="text-xs font-medium text-gray-600">${label}<input type="${type}" value="${esc(value)}" ${inputHandler} ${css}></label>`;
}
function updatePlanningDraft(weddingId, sectionId, key, value) {
  planningData(weddingId,sectionId)[key]=value;
}
async function savePlanningSection(weddingId, sectionId) {
  const key=`${weddingId}:${sectionId}`, data=planningData(weddingId,sectionId);
  const existing=planningRecord(weddingId,sectionId);
  const payload={wedding_id:weddingId,section:sectionId,data,updated_at:new Date().toISOString()};
  const result=existing ? await supabaseClient.from('wedding_planning').update(payload).eq('id',existing.id) : await supabaseClient.from('wedding_planning').insert(payload);
  if(result.error){
    try{localStorage.setItem('wf_health_last_error',JSON.stringify({at:new Date().toISOString(),message:result.error.message||String(result.error)}))}catch(e){}
    console.error(result.error);toast('Planning section could not be saved','error');return;
  }
  try{localStorage.setItem('wf_health_last_save',JSON.stringify({at:new Date().toISOString(),area:`Wedding Planning · ${sectionId}`}));localStorage.removeItem('wf_health_last_error')}catch(e){}
  await addWeddingTimelineEntry(weddingId,'Planning',`${sectionId==='profile'?'Wedding format':(WEDDING_PLANNING_SECTIONS.find(x=>x.id===sectionId)?.title||'Planning')} updated`);
  if(['profile','ceremony','reception'].includes(sectionId)&&weddingRunningOrderTablesReady){
    const syncResult=await syncWeddingRunningOrderFromPlanning(weddingId,{silent:true,adoptTemplates:true});
    if(!syncResult.ok)console.warn('Planning saved but Running Order sync did not complete:',syncResult.reason);
  }
  delete weddingPlanningDrafts[key];
  await loadWeddingsFromSupabase();
  renderWeddingWorkspace();
  toast(`${sectionId==='profile'?'Wedding format':(WEDDING_PLANNING_SECTIONS.find(x=>x.id===sectionId)?.title||'Planning')} saved`);
}

function overviewCard(label, value, icon) { return `<div class="bg-white rounded-xl border border-olive-100 p-4"><div class="flex gap-3"><i data-lucide="${icon}" class="text-olive-600" style="width:18px"></i><div><p class="text-xs text-gray-500">${label}</p><p class="font-bold mt-1">${esc(String(value))}</p></div></div></div>`; }
function placeholderTab(title, text, icon) { return `<div class="bg-white rounded-xl border border-olive-100 p-10 text-center"><i data-lucide="${icon}" class="mx-auto text-olive-600 mb-3" style="width:30px;height:30px"></i><h3 class="font-bold text-lg">${title}</h3><p class="text-sm text-gray-500 mt-2 max-w-xl mx-auto">${text}</p></div>`; }


function quoteYearForWedding(w) {
  const year = Number((w.date || '').slice(0,4));
  return WEDDING_PRICING[year] ? year : 2027;
}
function quotesForWedding(id) { return (DB.weddingQuotes || []).filter(q => q.weddingId === id).sort((a,b) => b.version-a.version); }
function latestWeddingQuote(id) { return quotesForWedding(id)[0] || null; }
function money(value) { return '£' + Number(value || 0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function defaultQuoteDraft(w) {
  const year=quoteYearForWedding(w), packageName=WEDDING_PRICING[year].packages[w.package] ? w.package : 'Bespoke';
  const dayTotal=Number(w.dayGuests||0), eveningTotal=Number(w.eveningGuests||0);
  return {
    priceYear:year,packageName,
    dayAdults:dayTotal,dayChildren:0,dayGuests:dayTotal,
    eveningAdults:eveningTotal,eveningChildren:0,eveningGuests:eveningTotal,
    menu:'None',menuIncluded:packageName!=='Bespoke',
    drinks:'None',drinksIncluded:packageName!=='Bespoke',
    eveningFood:'None',eveningFoodIncluded:packageName!=='Bespoke',
    extras:[],customItems:[],discount:0,notes:''
  };
}
function quoteDraftFromSaved(q,w) {
  if(!q)return defaultQuoteDraft(w);
  const meta=(q.items||[]).find(x=>x.type==='meta')||{};
  const savedDayTotal=Number(q.dayGuests||0), savedEveningTotal=Number(q.eveningGuests||0);
  const hasDaySplit=meta.dayAdults!==undefined||meta.dayChildren!==undefined;
  const hasEveningSplit=meta.eveningAdults!==undefined||meta.eveningChildren!==undefined;
  const dayAdults=hasDaySplit?Number(meta.dayAdults||0):savedDayTotal;
  const dayChildren=hasDaySplit?Number(meta.dayChildren||0):0;
  const eveningAdults=hasEveningSplit?Number(meta.eveningAdults||0):savedEveningTotal;
  const eveningChildren=hasEveningSplit?Number(meta.eveningChildren||0):0;
  return {
    priceYear:q.priceYear,packageName:q.packageName,
    dayAdults,dayChildren,dayGuests:dayAdults+dayChildren,
    eveningAdults,eveningChildren,eveningGuests:eveningAdults+eveningChildren,
    menu:meta.menu||'None',menuIncluded:!!meta.menuIncluded,
    drinks:meta.drinks||'None',drinksIncluded:!!meta.drinksIncluded,
    eveningFood:meta.eveningFood||'None',eveningFoodIncluded:!!meta.eveningFoodIncluded,
    extras:(q.items||[]).filter(x=>x.type==='extra').map(x=>({name:x.name,quantity:Number(x.quantity||1),unitPrice:Number(x.unitPrice||0)})),
    customItems:(q.items||[]).filter(x=>x.type==='custom').map(x=>({name:x.name,quantity:Number(x.quantity||1),unitPrice:Number(x.unitPrice||0)})),
    discount:q.discount||0,notes:q.notes||''
  };
}
function activeQuoteDraft(w) {
  if(!weddingQuoteDrafts[w.id]) weddingQuoteDrafts[w.id]=quoteDraftFromSaved(latestWeddingQuote(w.id),w);
  return weddingQuoteDrafts[w.id];
}
function quoteGuestChargeBreakdown(adults,children,included,adultRate,childRate,label){
  adults=Math.max(0,Number(adults||0));
  children=Math.max(0,Number(children||0));
  included=Math.max(0,Number(included||0));
  adultRate=Math.max(0,Number(adultRate||0));
  const total=adults+children;
  const extraTotal=Math.max(0,total-included);
  // Customer-favourable allocation: charge children first because their
  // additional-guest rate is cheaper, then charge adults for any remainder.
  const chargeChildren=Math.min(children,extraTotal);
  const chargeAdults=Math.max(0,extraTotal-chargeChildren);
  const childRateNumber=Number(childRate);
  const childRateReady=Number.isFinite(childRateNumber) && (childRateNumber>0 || adultRate===0);
  const effectiveChildRate=childRateReady?Math.max(0,childRateNumber):adultRate;
  const warnings=[];
  if(chargeChildren>0 && adultRate>0 && !childRateReady){
    warnings.push(`${label} child additional-guest rate is not set. Set it in Wedding Pricing before saving this quote.`);
  }
  return {label,adults,children,total,included,extraTotal,chargeAdults,chargeChildren,adultRate,childRate:effectiveChildRate,childRateReady,warnings};
}
function calculateWeddingQuote(draft) {
  const pricing=WEDDING_PRICING[draft.priceYear]||WEDDING_PRICING[2027], pkg=pricing.packages[draft.packageName]||pricing.packages.Bespoke;
  const dayAdults=Math.max(0,Number(draft.dayAdults ?? draft.dayGuests ?? 0));
  const dayChildren=Math.max(0,Number(draft.dayChildren||0));
  const eveningAdults=Math.max(0,Number(draft.eveningAdults ?? draft.eveningGuests ?? 0));
  const eveningChildren=Math.max(0,Number(draft.eveningChildren||0));
  draft.dayGuests=dayAdults+dayChildren;
  draft.eveningGuests=eveningAdults+eveningChildren;

  const day=quoteGuestChargeBreakdown(dayAdults,dayChildren,pkg.includedDay,pkg.extraDay,pkg.extraDayChild,'Day');
  const evening=quoteGuestChargeBreakdown(eveningAdults,eveningChildren,pkg.includedEvening,pkg.extraEvening,pkg.extraEveningChild,'Evening');
  const lines=[{type:'package',name:draft.packageName+' Package',quantity:1,unitPrice:pkg.price,total:pkg.price}];

  // Children deliberately appear first: package guest allowances are neutral,
  // so the chargeable overage uses the cheaper child rate before adult rate.
  if(day.chargeChildren)lines.push({type:'guest-child',name:'Additional Day Children',quantity:day.chargeChildren,unitPrice:day.childRate,total:day.chargeChildren*day.childRate});
  if(day.chargeAdults&&pkg.extraDay)lines.push({type:'guest-adult',name:'Additional Day Adults',quantity:day.chargeAdults,unitPrice:pkg.extraDay,total:day.chargeAdults*pkg.extraDay});
  if(evening.chargeChildren)lines.push({type:'guest-child',name:'Additional Evening Children',quantity:evening.chargeChildren,unitPrice:evening.childRate,total:evening.chargeChildren*evening.childRate});
  if(evening.chargeAdults&&pkg.extraEvening)lines.push({type:'guest-adult',name:'Additional Evening Adults',quantity:evening.chargeAdults,unitPrice:pkg.extraEvening,total:evening.chargeAdults*pkg.extraEvening});

  if(draft.menu!=='None'&&!draft.menuIncluded){const rate=pricing.menus[draft.menu]||0;lines.push({type:'menu',name:draft.menu,quantity:Number(draft.dayGuests||0),unitPrice:rate,total:Number(draft.dayGuests||0)*rate});}
  if(draft.drinks!=='None'&&!draft.drinksIncluded){const rate=pricing.drinks[draft.drinks]||0;lines.push({type:'drinks',name:draft.drinks+' Drinks Package',quantity:Number(draft.dayGuests||0),unitPrice:rate,total:Number(draft.dayGuests||0)*rate});}
  if(draft.eveningFood!=='None'&&!draft.eveningFoodIncluded){const rate=pricing.eveningFood[draft.eveningFood]||0;lines.push({type:'eveningFood',name:draft.eveningFood,quantity:Number(draft.eveningGuests||0),unitPrice:rate,total:Number(draft.eveningGuests||0)*rate});}
  (draft.extras||[]).forEach(x=>lines.push({type:'extra',name:x.name,quantity:Number(x.quantity||0),unitPrice:Number(x.unitPrice||0),total:Number(x.quantity||0)*Number(x.unitPrice||0)}));
  (draft.customItems||[]).forEach(x=>lines.push({type:'custom',name:x.name,quantity:Number(x.quantity||0),unitPrice:Number(x.unitPrice||0),total:Number(x.quantity||0)*Number(x.unitPrice||0)}));
  const subtotal=lines.reduce((n,x)=>n+Number(x.total||0),0),discount=Math.max(0,Number(draft.discount||0));
  const warnings=[...day.warnings,...evening.warnings];
  return {lines,subtotal,discount,total:Math.max(0,subtotal-discount),pkg,guestBreakdown:{day,evening},warnings,blockingWarnings:warnings};
}
function quoteSelectOptions(obj,selected){return Object.keys(obj).map(x=>`<option value="${esc(x)}" ${selected===x?'selected':''}>${esc(x)}</option>`).join('');}
function renderWeddingQuoteBuilder(w) {
  if(!weddingQuoteTablesReady)return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5"><h3 class="font-bold">Quote Builder setup required</h3><p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-quotes.sql</strong> in Supabase, then refresh.</p></div>`;
  const d=activeQuoteDraft(w),pricing=WEDDING_PRICING[d.priceYear],calc=calculateWeddingQuote(d),history=quotesForWedding(w.id);
  return `<div class="grid xl:grid-cols-[1fr_340px] gap-5"><div class="space-y-4">
    <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="flex justify-between items-start gap-3 mb-4"><div><h3 class="font-bold text-lg">Quote Builder</h3><p class="text-sm text-gray-500">Prices default to the wedding year and can be adjusted with custom lines.</p></div><span class="badge bg-olive-100 text-olive-800">${d.priceYear} prices</span></div>
    <div class="grid sm:grid-cols-2 gap-3"><label class="text-xs font-medium text-gray-600">Price Year<select id="quote-year" onchange="updateQuoteField('priceYear',Number(this.value),true)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${[2027,2028,2029].map(y=>`<option ${d.priceYear===y?'selected':''}>${y}</option>`).join('')}</select></label><label class="text-xs font-medium text-gray-600">Package<select id="quote-package" onchange="updateQuoteField('packageName',this.value,true)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${quoteSelectOptions(pricing.packages,d.packageName)}</select></label></div>
    <div class="grid lg:grid-cols-2 gap-3 mt-4">${quoteGuestSplitCard('day',d,calc.pkg)}${quoteGuestSplitCard('evening',d,calc.pkg)}</div></div>
    ${quoteChoiceCard('Wedding Breakfast','menu',pricing.menus,d.menu,d.menuIncluded,'day guests')}
    ${quoteChoiceCard('Drinks Package','drinks',pricing.drinks,d.drinks,d.drinksIncluded,'day guests')}
    ${quoteChoiceCard('Evening Food','eveningFood',pricing.eveningFood,d.eveningFood,d.eveningFoodIncluded,'evening guests')}
    <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="flex justify-between items-center mb-3"><div><h3 class="font-bold">Décor & Extras</h3><p class="text-xs text-gray-500">Add a priced item, then set its quantity.</p></div><select id="quote-extra-select" class="px-3 py-2 border rounded-lg text-sm"><option value="">Choose extra...</option>${Object.entries(pricing.extras).map(([n,v])=>`<option value="${esc(n)}">${esc(n)} — ${money(v)}</option>`).join('')}</select><button onclick="addQuoteExtra()" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm">Add</button></div>${renderQuoteEditableLines(d.extras,'extra')}</div>
    <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="flex justify-between items-center mb-3"><div><h3 class="font-bold">Custom Items</h3><p class="text-xs text-gray-500">For one-off charges, credits or anything not on the standard list.</p></div><button onclick="addCustomQuoteItem()" class="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm">+ Custom Line</button></div>${renderQuoteEditableLines(d.customItems,'custom')}</div>
    <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="grid sm:grid-cols-2 gap-3"><label class="text-xs font-medium text-gray-600">Discount (£)<input type="number" min="0" step="0.01" value="${d.discount}" oninput="updateQuoteField('discount',Number(this.value))" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><label class="text-xs font-medium text-gray-600">Internal / Customer Notes<textarea rows="2" oninput="updateQuoteField('notes',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(d.notes)}</textarea></label></div></div>
  </div><div class="space-y-4"><div class="bg-charcoal-900 text-white rounded-xl p-5 sticky top-32"><p class="text-xs tracking-widest text-olive-300 font-bold">LIVE TOTAL</p><p id="quote-live-total" class="text-3xl font-bold mt-1">${money(calc.total)}</p><div id="quote-summary" class="mt-4 space-y-2 text-sm">${renderQuoteSummary(calc)}</div><div class="border-t border-white/20 mt-4 pt-4 space-y-2"><button onclick="saveWeddingQuote('${w.id}')" class="w-full py-2.5 bg-olive-500 rounded-lg font-semibold">Save New Quote Version</button><button onclick="printWeddingQuote('${w.id}')" class="w-full py-2.5 bg-white/10 rounded-lg font-medium">Wedding Proposal PDF</button><button onclick="printWeddingCustomerPack('${w.id}')" class="w-full py-2.5 bg-white/10 rounded-lg font-medium">Full Customer Pack</button><p class="text-[11px] text-gray-400 leading-relaxed">Phase 10 print engine uses dynamic quote/planning pagination to prevent A4 clipping and footer overlap.</p><button onclick="resetWeddingQuoteDraft('${w.id}')" class="w-full py-2 text-xs text-gray-300">Reset to latest saved quote</button></div></div>
  <div class="bg-white border border-olive-100 rounded-xl p-4"><h3 class="font-bold">Quote History</h3><div class="mt-3 space-y-2">${history.length?history.map(q=>`<button onclick="loadQuoteVersion('${w.id}','${q.id}')" class="w-full text-left p-3 rounded-lg bg-cream-50 hover:bg-cream-100"><div class="flex justify-between"><span class="font-medium text-sm">Version ${q.version}</span><strong class="text-sm">${money(q.total)}</strong></div><p class="text-xs text-gray-500 mt-1">${new Date(q.createdAt).toLocaleString('en-GB')} · ${esc(q.packageName)}</p></button>`).join(''):'<p class="text-sm text-gray-400">No saved quote versions yet.</p>'}</div></div></div></div>`;
}
function quoteGuestSplitCard(period,draft,pkg){
  const isDay=period==='day';
  const title=isDay?'Day Guests':'Evening Guests';
  const adultField=isDay?'dayAdults':'eveningAdults';
  const childField=isDay?'dayChildren':'eveningChildren';
  const total=Number(draft[adultField]||0)+Number(draft[childField]||0);
  const included=Number(isDay?pkg.includedDay:pkg.includedEvening)||0;
  const adultRate=Number(isDay?pkg.extraDay:pkg.extraEvening)||0;
  const rawChildRate=isDay?pkg.extraDayChild:pkg.extraEveningChild;
  const childReady=Number(rawChildRate)>0||adultRate===0;
  return `<div class="rounded-xl border border-olive-100 bg-cream-50/40 p-4">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div><p class="text-xs font-bold tracking-widest text-olive-600">${title.toUpperCase()}</p><h4 class="font-bold mt-1">Adult / child split</h4></div>
      <div class="text-right"><strong id="quote-${period}-total" class="text-xl">${total}</strong><span class="block text-[10px] text-gray-500">total guests · ${included} included</span></div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <label class="text-xs font-medium text-gray-600">Adults<input type="number" min="0" step="1" value="${Number(draft[adultField]||0)}" oninput="updateQuoteGuestField('${adultField}',Number(this.value))" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm bg-white"></label>
      <label class="text-xs font-medium text-gray-600">Children<input type="number" min="0" step="1" value="${Number(draft[childField]||0)}" oninput="updateQuoteGuestField('${childField}',Number(this.value))" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm bg-white"></label>
    </div>
    <div class="mt-3 grid grid-cols-2 gap-2 text-[11px]">
      <div class="rounded-lg bg-white border px-3 py-2"><span class="text-gray-500">Adult extra</span><strong class="block mt-0.5">${money(adultRate)}</strong></div>
      <div class="rounded-lg bg-white border px-3 py-2 ${childReady?'':'border-amber-300 bg-amber-50'}"><span class="text-gray-500">Child extra</span><strong class="block mt-0.5">${childReady?money(Number(rawChildRate||0)):'Rate not set'}</strong></div>
    </div>
    <p class="text-[11px] text-gray-500 mt-2">If the package allowance is exceeded, children are allocated to the chargeable extras first, then adults, so the customer receives the cheaper valid split.</p>
  </div>`;
}
function quoteChoiceCard(title,field,options,selected,included,basis){return `<div class="bg-white border border-olive-100 rounded-xl p-5"><div class="grid sm:grid-cols-[1fr_180px] gap-3 items-end"><label class="text-xs font-medium text-gray-600">${title}<select onchange="updateQuoteField('${field}',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${quoteSelectOptions(options,selected)}</select></label><label class="flex items-center gap-2 text-sm pb-2"><input type="checkbox" ${included?'checked':''} onchange="updateQuoteField('${field}Included',this.checked)"> Included in package</label></div><p class="text-xs text-gray-400 mt-2">When not included, this is charged per ${basis}.</p></div>`;}
function renderQuoteEditableLines(lines,type){return lines.length?`<div class="space-y-2">${lines.map((x,i)=>`<div class="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center"><input value="${esc(x.name)}" oninput="updateQuoteLine('${type}',${i},'name',this.value)" class="px-3 py-2 border rounded-lg text-sm"><input type="number" min="0" step="1" value="${x.quantity}" oninput="updateQuoteLine('${type}',${i},'quantity',Number(this.value))" class="px-2 py-2 border rounded-lg text-sm"><input type="number" min="0" step="0.01" value="${x.unitPrice}" oninput="updateQuoteLine('${type}',${i},'unitPrice',Number(this.value))" class="px-2 py-2 border rounded-lg text-sm"><button onclick="removeQuoteLine('${type}',${i})" class="p-2 text-red-600"><i data-lucide="trash-2" style="width:16px"></i></button></div>`).join('')}</div>`:'<p class="text-sm text-gray-400">Nothing added.</p>';}
function renderQuoteSummary(calc){return `${calc.lines.map(x=>`<div class="flex justify-between gap-3"><span>${esc(x.name)}${x.quantity!==1?' × '+x.quantity:''}${x.unitPrice?` <small class="opacity-60">@ ${money(x.unitPrice)}</small>`:''}</span><span>${money(x.total)}</span></div>`).join('')}<div class="flex justify-between pt-2 border-t border-white/20"><span>Subtotal</span><span>${money(calc.subtotal)}</span></div>${calc.discount?`<div class="flex justify-between text-amber-300"><span>Discount</span><span>-${money(calc.discount)}</span></div>`:''}<div class="flex justify-between font-bold text-lg"><span>Total</span><span>${money(calc.total)}</span></div>${calc.warnings?.length?`<div class="mt-3 rounded-lg bg-amber-400/15 border border-amber-300/30 p-2.5 text-[11px] leading-relaxed text-amber-100">${calc.warnings.map(x=>`⚠ ${esc(x)}`).join('<br>')}</div>`:''}`;}
function updateQuoteField(field,value,rerender=false){const w=DB.weddings.find(x=>x.id===activeWeddingId);if(!w)return;activeQuoteDraft(w)[field]=value;if(rerender)renderWeddingWorkspace();else refreshQuoteTotals();}
function updateQuoteGuestField(field,value){
  const w=DB.weddings.find(x=>x.id===activeWeddingId);if(!w)return;
  const d=activeQuoteDraft(w);d[field]=Math.max(0,Math.floor(Number(value||0)));
  d.dayGuests=Math.max(0,Number(d.dayAdults||0))+Math.max(0,Number(d.dayChildren||0));
  d.eveningGuests=Math.max(0,Number(d.eveningAdults||0))+Math.max(0,Number(d.eveningChildren||0));
  const dayEl=document.getElementById('quote-day-total'),eveEl=document.getElementById('quote-evening-total');
  if(dayEl)dayEl.textContent=String(d.dayGuests);if(eveEl)eveEl.textContent=String(d.eveningGuests);
  refreshQuoteTotals();
}
function refreshQuoteTotals(){const w=DB.weddings.find(x=>x.id===activeWeddingId);if(!w)return;const calc=calculateWeddingQuote(activeQuoteDraft(w));const total=document.getElementById('quote-live-total'),summary=document.getElementById('quote-summary');if(total)total.textContent=money(calc.total);if(summary)summary.innerHTML=renderQuoteSummary(calc);}
function addQuoteExtra(){const w=DB.weddings.find(x=>x.id===activeWeddingId),select=document.getElementById('quote-extra-select');if(!w||!select?.value)return;const d=activeQuoteDraft(w),price=WEDDING_PRICING[d.priceYear].extras[select.value]||0;d.extras.push({name:select.value,quantity:1,unitPrice:price});renderWeddingWorkspace();}
function addCustomQuoteItem(){const w=DB.weddings.find(x=>x.id===activeWeddingId);if(!w)return;activeQuoteDraft(w).customItems.push({name:'Custom item',quantity:1,unitPrice:0});renderWeddingWorkspace();}
function updateQuoteLine(type,index,field,value){const w=DB.weddings.find(x=>x.id===activeWeddingId);if(!w)return;const key=type==='extra'?'extras':'customItems';activeQuoteDraft(w)[key][index][field]=value;refreshQuoteTotals();}
function removeQuoteLine(type,index){const w=DB.weddings.find(x=>x.id===activeWeddingId);if(!w)return;const key=type==='extra'?'extras':'customItems';activeQuoteDraft(w)[key].splice(index,1);renderWeddingWorkspace();}
async function saveWeddingQuote(weddingId){
  const w=DB.weddings.find(x=>x.id===weddingId);if(!w)return;
  const d=activeQuoteDraft(w),calc=calculateWeddingQuote(d);
  if(calc.blockingWarnings?.length){toast('Set the missing child additional-guest rate in Wedding Pricing before saving this quote','error');return;}
  const version=(quotesForWedding(weddingId)[0]?.version||0)+1;
  const items=[{
    type:'meta',menu:d.menu,menuIncluded:d.menuIncluded,drinks:d.drinks,drinksIncluded:d.drinksIncluded,
    eveningFood:d.eveningFood,eveningFoodIncluded:d.eveningFoodIncluded,
    dayAdults:Number(d.dayAdults||0),dayChildren:Number(d.dayChildren||0),
    eveningAdults:Number(d.eveningAdults||0),eveningChildren:Number(d.eveningChildren||0)
  },...calc.lines];
  const record={wedding_id:weddingId,version,status:'Saved',price_year:d.priceYear,package_name:d.packageName,day_guests:d.dayGuests,evening_guests:d.eveningGuests,items,subtotal:calc.subtotal,discount:calc.discount,total:calc.total,notes:d.notes||null};
  const {error}=await supabaseClient.from('wedding_quotes').insert(record);
  if(error){console.error(error);toast('Quote could not be saved','error');return;}
  await supabaseClient.from('weddings').update({package_name:d.packageName,day_guests:d.dayGuests,evening_guests:d.eveningGuests,quoted_value:calc.total}).eq('id',weddingId);
  await addWeddingTimelineEntry(weddingId,'Quote',`Quote version ${version} saved`,`${d.packageName} package · ${money(calc.total)}`);
  delete weddingQuoteDrafts[weddingId];await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(`Quote version ${version} saved`);
}
function loadQuoteVersion(weddingId,quoteId){const w=DB.weddings.find(x=>x.id===weddingId),q=DB.weddingQuotes.find(x=>x.id===quoteId);if(!w||!q)return;weddingQuoteDrafts[weddingId]=quoteDraftFromSaved(q,w);renderWeddingWorkspace();toast(`Loaded quote version ${q.version}`);}
function resetWeddingQuoteDraft(weddingId){delete weddingQuoteDrafts[weddingId];renderWeddingWorkspace();}
function printWeddingQuote(weddingId){
  const w=DB.weddings.find(x=>x.id===weddingId);if(!w)return;
  const d=activeQuoteDraft(w),calc=calculateWeddingQuote(d);
  if(calc.blockingWarnings?.length){toast('Set the missing child additional-guest rate before printing this quote','error');return;}
  const win=window.open('','_blank');if(!win){toast('Allow pop-ups to print the quote','error');return;}
  const guestMeta=`Day: ${Number(d.dayAdults||0)} adults + ${Number(d.dayChildren||0)} children (${Number(d.dayGuests||0)} total) · Evening: ${Number(d.eveningAdults||0)} adults + ${Number(d.eveningChildren||0)} children (${Number(d.eveningGuests||0)} total)`;
  win.document.write(`<!doctype html><html><head><title>Wedding Quote - ${esc(w.couple)}</title><style>body{font-family:Arial,sans-serif;color:#1f2937;max-width:820px;margin:40px auto;padding:0 24px}h1{margin-bottom:4px}.brand{color:#5f7d34;font-weight:bold;letter-spacing:2px}.meta{color:#6b7280;margin-bottom:8px}.guests{font-size:13px;color:#4b5563;margin-bottom:28px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;border-bottom:1px solid #e5e7eb;text-align:left}th:last-child,td:last-child{text-align:right}.total{font-size:20px;font-weight:bold}.notes{margin-top:24px;padding:16px;background:#fafdf5}.footer{margin-top:40px;color:#6b7280;font-size:12px}@media print{body{margin:0}}</style></head><body><div class="brand">WINDMILL FARM · THE GRANARY</div><h1>Wedding Proposal</h1><div class="meta">${esc(w.couple)} · ${esc(w.date)} · ${esc(d.packageName)} Package</div><div class="guests">${esc(guestMeta)}</div><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${calc.lines.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.quantity}</td><td>${money(x.total)}</td></tr>`).join('')}<tr><td colspan="2">Subtotal</td><td>${money(calc.subtotal)}</td></tr>${calc.discount?`<tr><td colspan="2">Discount</td><td>-${money(calc.discount)}</td></tr>`:''}<tr class="total"><td colspan="2">Total</td><td>${money(calc.total)}</td></tr></tbody></table>${d.notes?`<div class="notes"><strong>Notes</strong><p>${esc(d.notes)}</p></div>`:''}<div class="footer">This proposal is subject to availability, signed terms and conditions, and the required non-refundable deposit. Prices shown use the ${d.priceYear} wedding price list.</div><script>window.onload=()=>window.print()<\/script></body></html>`);win.document.close();
}

function taskDateState(task) {
  if (task.completed || !task.dueDate) return '';
  const today = currentDateStr();
  if (task.dueDate < today) return 'overdue';
  const soon = new Date(); soon.setDate(soon.getDate() + 14);
  if (task.dueDate <= soon.toISOString().slice(0,10)) return 'soon';
  return 'upcoming';
}
function taskPriorityBadge(priority) {
  return {'High':'bg-red-100 text-red-700','Medium':'bg-amber-100 text-amber-700','Low':'bg-gray-100 text-gray-600'}[priority] || 'bg-gray-100 text-gray-600';
}

function weddingTaskRowsHtml(weddingId,{q='',category='',status='outstanding'}={}) {
  q=String(q||'').toLowerCase();
  let tasks=weddingTasksFor(weddingId).filter(t=>{
    const hay=[t.title,t.notes,t.assignedTo,t.category].join(' ').toLowerCase();
    const state=taskDateState(t);
    const statusMatch=status==='all'||(status==='outstanding'&&!t.completed)||(status==='completed'&&t.completed)||(status==='overdue'&&state==='overdue')||(status==='soon'&&state==='soon');
    return (!q||hay.includes(q))&&(!category||t.category===category)&&statusMatch;
  }).sort((a,b)=>{
    const rank=t=>taskDateState(t)==='overdue'?0:(!t.completed?1:2);
    return rank(a)-rank(b)||(a.completed-b.completed)||((a.dueDate||'9999-12-31').localeCompare(b.dueDate||'9999-12-31'))||(a.sortOrder-b.sortOrder);
  });

  return tasks.length?tasks.map(task=>{
    const state=taskDateState(task);
    const dateClass=state==='overdue'?'text-red-600 font-bold':state==='soon'?'text-amber-600 font-medium':'text-gray-500';
    return `<div class="bg-white border ${state==='overdue'?'border-red-200':'border-olive-100'} rounded-xl p-4 flex gap-3 items-start">
      <input type="checkbox" ${task.completed?'checked':''} onchange="toggleWeddingTask('${task.id}',this.checked)" class="mt-1">
      <button onclick="openWeddingTaskForm('${weddingId}','${task.id}')" class="flex-1 text-left min-w-0">
        <div class="flex items-center gap-2 flex-wrap"><p class="font-medium ${task.completed?'line-through text-gray-400':''}">${esc(task.title)}</p><span class="badge ${taskPriorityBadge(task.priority)}">${esc(task.priority)}</span>${state==='overdue'?'<span class="badge bg-red-100 text-red-700">Overdue</span>':''}</div>
        <p class="text-xs mt-1 ${dateClass}">${esc(task.category)}${task.dueDate?' · Due '+esc(task.dueDate):' · No due date'}${task.assignedTo?' · '+esc(task.assignedTo):''}</p>
        ${task.notes?`<p class="text-xs text-gray-500 mt-2 line-clamp-2">${esc(task.notes)}</p>`:''}
      </button>
      <button onclick="deleteWeddingTask('${task.id}')" class="p-2 text-gray-400 hover:text-red-600" title="Delete"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button>
    </div>`;
  }).join(''):'<div class="section-card text-center text-gray-400 py-8">No tasks match these filters.</div>';
}

function renderWeddingTasks(w) {
  const all = weddingTasksFor(w.id);
  const overdue = all.filter(t => taskDateState(t)==='overdue').length;
  const dueSoon = all.filter(t => taskDateState(t)==='soon').length;
  const completed = all.filter(t => t.completed).length;
  const categories = [...new Set(all.map(t=>t.category).filter(Boolean))];
  return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
    ${overviewCard('Outstanding',String(all.length-completed),'list-todo')}
    ${overviewCard('Overdue',String(overdue),'alert-triangle')}
    ${overviewCard('Due in 14 Days',String(dueSoon),'clock-3')}
    ${overviewCard('Completed',`${completed}/${all.length}`,'badge-check')}
  </div>
  <div class="flex flex-col lg:flex-row gap-3 mb-4">
    <input id="wedding-task-search" oninput="filterWeddingTasks('${w.id}')" placeholder="Search tasks, notes or assignee..." class="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm">
    <select id="wedding-task-category" onchange="filterWeddingTasks('${w.id}')" class="px-3 py-2 rounded-lg border border-gray-200 text-sm"><option value="">All categories</option>${categories.map(x=>`<option>${esc(x)}</option>`).join('')}</select>
    <select id="wedding-task-status" onchange="filterWeddingTasks('${w.id}')" class="px-3 py-2 rounded-lg border border-gray-200 text-sm"><option value="outstanding" selected>Outstanding</option><option value="all">All tasks</option><option value="overdue">Overdue</option><option value="soon">Due soon</option><option value="completed">Completed</option></select>
    <button onclick="openWeddingTaskForm('${w.id}')" class="px-4 py-2 bg-olive-600 text-white rounded-lg font-medium text-sm whitespace-nowrap">+ Add Task</button>
  </div>
  <div id="wedding-task-list" class="space-y-2">${weddingTaskRowsHtml(w.id,{status:'outstanding'})}</div>`;
}
function filterWeddingTasks(weddingId) {
  const q=(document.getElementById('wedding-task-search')?.value||'').toLowerCase();
  const category=document.getElementById('wedding-task-category')?.value||'';
  const status=document.getElementById('wedding-task-status')?.value||'outstanding';
  const el=document.getElementById('wedding-task-list');
  if(!el)return;
  el.innerHTML=weddingTaskRowsHtml(weddingId,{q,category,status});
  lucide.createIcons();
}
function openWeddingTaskForm(weddingId, taskId='') {
  const task=taskId?(DB.weddingTasks||[]).find(t=>t.id===taskId):null;
  const wedding=DB.weddings.find(w=>w.id===weddingId);
  openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">${esc(wedding?.couple||'WEDDING')}</p><h2 class="text-lg font-bold">${task?'Edit':'Add'} Task</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
  <form onsubmit="saveWeddingTask(event,'${weddingId}','${taskId}')" class="space-y-3">
    <label class="text-xs font-medium text-gray-600 block">Task *<input required name="title" value="${esc(task?.title||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
    <div class="grid sm:grid-cols-2 gap-3">
      <label class="text-xs font-medium text-gray-600">Category<select name="category" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${['Immediate','Planning','Final Planning','Suppliers','Payments','Operations','Completion','Other'].map(x=>`<option ${task?.category===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label class="text-xs font-medium text-gray-600">Priority<select name="priority" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${['High','Medium','Low'].map(x=>`<option ${task?.priority===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label class="text-xs font-medium text-gray-600">Due Date<input type="date" name="dueDate" value="${task?.dueDate||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Assigned To<select name="assignedTo" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"><option value="">Unassigned</option>${staffOptions(task?.assignedTo||'')}</select></label>
    </div>
    <label class="text-xs font-medium text-gray-600 block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(task?.notes||'')}</textarea></label>
    <button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save Task</button>
  </form></div>`);
}
async function saveWeddingTask(ev,weddingId,taskId='') {
  ev.preventDefault(); const f=new FormData(ev.target);
  const record={wedding_id:weddingId,title:f.get('title'),category:f.get('category'),priority:f.get('priority'),due_date:f.get('dueDate')||null,assigned_to:f.get('assignedTo')||null,notes:f.get('notes')||null};
  const result=taskId?await supabaseClient.from('wedding_tasks').update(record).eq('id',taskId):await supabaseClient.from('wedding_tasks').insert({...record,sort_order:weddingTasksFor(weddingId).length+1});
  if(result.error){console.error(result.error);toast('Task could not be saved','error');return;}
  await addWeddingTimelineEntry(weddingId,'Task',taskId?'Task updated':'Task added',String(f.get('title')||'')); closeModal(); await loadWeddingsFromSupabase(); renderWeddingWorkspace(); toast(taskId?'Task updated':'Task added');
}
async function toggleWeddingTask(id, completed) {
  const completedAt = completed ? new Date().toISOString() : null;
  const task = (DB.weddingTasks || []).find(x => x.id === id);

  const { error } = await supabaseClient
    .from('wedding_tasks')
    .update({completed, completed_at:completedAt})
    .eq('id',id);

  if (error) {
    toast('Task could not be updated','error');
    return;
  }

  if (task) {
    await addWeddingTimelineEntry(
      task.weddingId,
      'Task',
      completed ? 'Task completed' : 'Task reopened',
      task.title
    );

    // Deposit completion becomes the real anchor for the first meeting.
    if (completed && task.title === 'Deposit paid') {
      await updateFirstMeetingDatesFromDeposit(task.weddingId, completedAt);
    }
  }

  await loadWeddingsFromSupabase();
  renderWeddingWorkspace();
}
async function deleteWeddingTask(id) {
  if(!confirm('Delete this wedding task?'))return;
  const {error}=await supabaseClient.from('wedding_tasks').delete().eq('id',id);
  if(error){toast('Task could not be deleted','error');return;}
  await loadWeddingsFromSupabase();renderWeddingWorkspace();toast('Task deleted');
}


function weddingPaymentsFor(weddingId) {
  return (DB.weddingPayments || []).filter(x => x.weddingId === weddingId);
}
function paymentStatusClass(status) {
  return {
    Paid:'bg-green-100 text-green-800', Scheduled:'bg-blue-100 text-blue-800',
    Overdue:'bg-red-100 text-red-800', Cancelled:'bg-gray-100 text-gray-600'
  }[status] || 'bg-gray-100 text-gray-700';
}
function effectivePaymentStatus(payment) {
  if (payment.status === 'Scheduled' && payment.dueDate && payment.dueDate < currentDateStr()) return 'Overdue';
  return payment.status;
}
function renderWeddingPayments(w) {
  if (!weddingPaymentTablesReady) return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5"><h3 class="font-bold">Payments setup required</h3><p class="text-sm text-gray-600 mt-1">Run <strong>setup-wedding-payments.sql</strong> in Supabase, then refresh.</p></div>`;
  const payments = weddingPaymentsFor(w.id);
  const paid = payments.filter(x=>x.status==='Paid').reduce((sum,x)=>sum+(x.type==='Refund'?-Math.abs(x.amount):Math.abs(x.amount)),0);
  const scheduled = payments.filter(x=>x.status==='Scheduled').reduce((sum,x)=>sum+Math.abs(x.amount),0);
  const overdue = payments.filter(x=>effectivePaymentStatus(x)==='Overdue').reduce((sum,x)=>sum+Math.abs(x.amount),0);
  const next = payments.filter(x=>x.status==='Scheduled' && x.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0];
  const rows = payments.length ? payments.map(p=>{
    const status=effectivePaymentStatus(p);
    return `<div class="bg-white rounded-xl border border-olive-100 p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div class="flex-1 min-w-0"><div class="flex flex-wrap items-center gap-2"><p class="font-bold">${esc(p.type)}</p><span class="px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusClass(status)}">${status}</span></div>
      <p class="text-xs text-gray-500 mt-1">Due ${esc(p.dueDate||'not set')}${p.paidDate?' · Paid '+esc(p.paidDate):''}${p.method?' · '+esc(p.method):''}${p.reference?' · Ref '+esc(p.reference):''}</p>${p.notes?`<p class="text-xs text-gray-500 mt-2">${esc(p.notes)}</p>`:''}</div>
      <p class="text-xl font-bold ${p.type==='Refund'?'text-red-600':'text-charcoal-900'}">${p.type==='Refund'?'-':''}£${Math.abs(p.amount).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
      <div class="flex gap-1"><button onclick="openWeddingPaymentForm('${w.id}','${p.id}')" class="p-2 rounded-lg hover:bg-gray-100" title="Edit"><i data-lucide="pencil" style="width:16px;height:16px"></i></button><button onclick="deleteWeddingPayment('${p.id}')" class="p-2 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button></div>
    </div>`;
  }).join('') : '<div class="section-card text-center text-gray-400 py-8">No payment schedule or transactions recorded yet.</div>';
  setTimeout(()=>lucide.createIcons(),0);
  return `<div class="grid sm:grid-cols-4 gap-3 mb-4">${overviewCard('Quoted','£'+Number(w.quotedValue||0).toLocaleString(),'receipt')}${overviewCard('Paid','£'+Math.max(0,paid).toLocaleString(),'badge-check')}${overviewCard('Outstanding','£'+Math.max(0,Number(w.quotedValue||0)-paid).toLocaleString(),'credit-card')}${overviewCard('Overdue','£'+overdue.toLocaleString(),'alert-triangle')}</div>
    <div class="bg-white rounded-xl border border-olive-100 p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 class="font-bold">Payment Schedule</h3><p class="text-sm text-gray-500">${next?`Next: ${esc(next.type)} — £${next.amount.toLocaleString()} due ${esc(next.dueDate)}`:`Scheduled total: £${scheduled.toLocaleString()}`}</p></div><div class="flex flex-wrap gap-2"><button onclick="createStandardPaymentSchedule('${w.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">Create Standard Schedule</button><button onclick="openWeddingPaymentForm('${w.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium">+ Add Payment</button></div></div>
    <div class="space-y-3">${rows}</div>`;
}
function openWeddingPaymentForm(weddingId,paymentId='') {
  const p=paymentId?weddingPaymentsFor(weddingId).find(x=>x.id===paymentId):null;
  const w=DB.weddings.find(x=>x.id===weddingId);
  openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">${esc(w?.couple||'WEDDING')}</p><h2 class="text-lg font-bold">${p?'Edit':'Add'} Payment</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
  <form onsubmit="saveWeddingPayment(event,'${weddingId}','${paymentId}')" class="space-y-3"><div class="grid sm:grid-cols-2 gap-3">
    <label class="text-xs font-medium text-gray-600">Type<select name="type" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${['Deposit','Interim Payment','Final Balance','Additional Payment','Refund'].map(x=>`<option ${p?.type===x?'selected':''}>${x}</option>`).join('')}</select></label>
    <label class="text-xs font-medium text-gray-600">Amount (£) *<input required name="amount" type="number" min="0" step="0.01" value="${p?.amount||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
    <label class="text-xs font-medium text-gray-600">Due Date<input name="dueDate" type="date" value="${p?.dueDate||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
    <label class="text-xs font-medium text-gray-600">Status<select name="status" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${['Scheduled','Paid','Cancelled'].map(x=>`<option ${p?.status===x?'selected':''}>${x}</option>`).join('')}</select></label>
    <label class="text-xs font-medium text-gray-600">Paid Date<input name="paidDate" type="date" value="${p?.paidDate||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
    <label class="text-xs font-medium text-gray-600">Method<select name="method" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"><option value="">Not recorded</option>${['Card','Bank Transfer','Cash','Online Link','Other'].map(x=>`<option ${p?.method===x?'selected':''}>${x}</option>`).join('')}</select></label>
    <label class="text-xs font-medium text-gray-600 sm:col-span-2">Reference<input name="reference" value="${esc(p?.reference||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
  </div><label class="text-xs font-medium text-gray-600 block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(p?.notes||'')}</textarea></label><button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save Payment</button></form></div>`);
}
async function saveWeddingPayment(ev,weddingId,paymentId='') {
  ev.preventDefault(); const f=new FormData(ev.target); const status=f.get('status');
  const record={wedding_id:weddingId,payment_type:f.get('type'),amount:Number(f.get('amount'))||0,due_date:f.get('dueDate')||null,status,paid_date:status==='Paid'?(f.get('paidDate')||currentDateStr()):(f.get('paidDate')||null),method:f.get('method')||null,reference:f.get('reference')||null,notes:f.get('notes')||null};
  const result=paymentId?await supabaseClient.from('wedding_payments').update(record).eq('id',paymentId):await supabaseClient.from('wedding_payments').insert(record);
  if(result.error){console.error(result.error);toast('Payment could not be saved','error');return;}
  await syncWeddingAmountPaid(weddingId); await addWeddingTimelineEntry(weddingId,'Payment',paymentId?'Payment updated':'Payment added',`${f.get('type')} · £${Number(f.get('amount')||0).toFixed(2)} · ${status}`); closeModal(); await loadWeddingsFromSupabase(); renderWeddingWorkspace(); toast(paymentId?'Payment updated':'Payment added');
}
async function syncWeddingAmountPaid(weddingId) {
  const {data,error}=await supabaseClient.from('wedding_payments').select('payment_type,amount,status').eq('wedding_id',weddingId);
  if(error)return;
  const total=(data||[]).filter(x=>x.status==='Paid').reduce((sum,x)=>sum+(x.payment_type==='Refund'?-Math.abs(Number(x.amount||0)):Math.abs(Number(x.amount||0))),0);
  await supabaseClient.from('weddings').update({amount_paid:Math.max(0,total)}).eq('id',weddingId);
}
async function deleteWeddingPayment(id) {
  if(!confirm('Delete this payment entry?'))return;
  const payment=(DB.weddingPayments||[]).find(x=>x.id===id); const {error}=await supabaseClient.from('wedding_payments').delete().eq('id',id);
  if(error){toast('Payment could not be deleted','error');return;}
  if(payment)await syncWeddingAmountPaid(payment.weddingId); await loadWeddingsFromSupabase(); renderWeddingWorkspace(); toast('Payment deleted');
}
function dateBefore(dateStr,days) { const d=new Date((dateStr||currentDateStr())+'T12:00:00'); d.setDate(d.getDate()-days); return d.toISOString().slice(0,10); }
async function createStandardPaymentSchedule(weddingId) {
  if(weddingPaymentsFor(weddingId).length && !confirm('This wedding already has payment entries. Add the standard schedule as well?'))return;
  const w=DB.weddings.find(x=>x.id===weddingId); if(!w)return;
  const total=Number(w.quotedValue||0), deposit=Math.min(300,total), interim=Math.max(0,total*0.5-deposit), final=Math.max(0,total-deposit-interim);
  const rows=[
    {wedding_id:weddingId,payment_type:'Deposit',amount:deposit,due_date:currentDateStr(),status:'Scheduled'},
    ...(interim>0?[{wedding_id:weddingId,payment_type:'Interim Payment',amount:interim,due_date:dateBefore(w.date,180),status:'Scheduled'}]:[]),
    ...(final>0?[{wedding_id:weddingId,payment_type:'Final Balance',amount:final,due_date:dateBefore(w.date,56),status:'Scheduled'}]:[])
  ];
  const {error}=await supabaseClient.from('wedding_payments').insert(rows); if(error){console.error(error);toast('Schedule could not be created','error');return;}
  await addWeddingTimelineEntry(weddingId,'Payment','Standard payment schedule created',`${rows.length} payment stages added`); await loadWeddingsFromSupabase(); renderWeddingWorkspace(); toast('Standard payment schedule created');
}

function openWeddingForm(id = '') {
  const w = id ? DB.weddings.find(x => x.id === id) : null;
  openModal(`<div class="p-6"><div class="flex justify-between items-center mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">WEDDINGS</p><h2 class="text-lg font-bold">${id?'Edit':'New'} Wedding</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="saveWeddingForm(event,'${id}')" class="space-y-3"><div class="grid sm:grid-cols-2 gap-3">
      <label class="text-xs font-medium text-gray-600">Couple Names *<input name="couple" required value="${esc(w?.couple||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Wedding Date *<input name="date" required type="date" value="${w?.date||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Status<select name="status" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${['Confirmed','Planning','Final Planning','Completed','Archived'].map(x=>`<option ${w?.status===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label class="text-xs font-medium text-gray-600">Coordinator<select name="coordinator" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${staffOptions(w?.coordinator||'')}</select></label>
      <label class="text-xs font-medium text-gray-600">Package<input name="package" value="${esc(w?.package||'')}" placeholder="Evergreen, Blossom, Willow or Bespoke" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Quoted Value (£) *<input name="quotedValue" required type="number" min="0" step="0.01" value="${w?.quotedValue||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Day Guests<input name="dayGuests" type="number" min="0" value="${w?.dayGuests||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600">Evening Guests<input name="eveningGuests" type="number" min="0" value="${w?.eveningGuests||''}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>
      <label class="text-xs font-medium text-gray-600 sm:col-span-2">Amount Paid (£)<input name="paid" type="number" min="0" step="0.01" value="${w?.paid||0}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><div class="sm:col-span-2 rounded-lg bg-cream-50 border border-olive-100 p-3 text-xs text-gray-600"><strong>Wedding format:</strong> ceremony/reception type is now managed in the <strong>Planning</strong> tab so existing wedding records stay fully backwards-compatible.</div>
    </div><label class="text-xs font-medium text-gray-600 block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(w?.notes||'')}</textarea></label><button class="w-full py-2.5 bg-olive-600 text-white rounded-lg font-medium">Save Wedding</button></form></div>`);
}

async function saveWeddingForm(ev, id) {
  ev.preventDefault();
  const f = new FormData(ev.target);
  const record = {
    couple_names: f.get('couple'),
    wedding_date: String(f.get('date') || '').trim() || null,
    status: f.get('status'),
    coordinator: f.get('coordinator') || null,
    package_name: f.get('package') || null,
    quoted_value: Number(f.get('quotedValue')) || 0,
    day_guests: Number(f.get('dayGuests')) || 0,
    evening_guests: Number(f.get('eveningGuests')) || 0,
    amount_paid: Number(f.get('paid')) || 0,
    notes: f.get('notes') || null
  };
  const result = id ? await supabaseClient.from('weddings').update(record).eq('id',id).select().single() : await supabaseClient.from('weddings').insert(record).select().single();
  if (result.error) { console.error(result.error); toast('Wedding could not be saved','error'); return; }
  if (!id) {
    await generateWeddingTasks(
      result.data.id,
      result.data.wedding_date,
      result.data.created_at
    );
    await addWeddingTimelineEntry(
      result.data.id,
      'Wedding',
      'Wedding record created',
      `${record.couple_names} · ${record.wedding_date || 'Date TBC'}`
    );
  } else {
    await addWeddingTimelineEntry(id,'Wedding','Wedding details updated');
  }
  closeModal(); await loadWeddingsFromSupabase(); renderSection();
  if (id && activeWeddingId === id) renderWeddingWorkspace();
  toast(id?'Wedding updated':'Wedding created');
}

function safeWeddingDate(value, fallback = currentDateStr()) {
  const date = new Date((value || fallback) + (String(value || fallback).includes('T') ? '' : 'T12:00:00'));
  return Number.isNaN(date.getTime()) ? new Date(fallback + 'T12:00:00') : date;
}

function weddingMidpointDate(createdAt, weddingDate) {
  const start = safeWeddingDate(createdAt);
  const end = safeWeddingDate(weddingDate);
  return new Date(start.getTime() + ((end.getTime() - start.getTime()) / 2));
}

function weddingTaskDueDate(template, weddingDate, createdAt) {
  const created = safeWeddingDate(createdAt);
  const wedding = safeWeddingDate(weddingDate);
  let base;

  if (template.dueMode === 'created' || template.dueMode === 'createdPlus') {
    base = new Date(created);
  } else if (template.dueMode === 'midpoint' || template.dueMode === 'midpointBefore') {
    base = weddingMidpointDate(createdAt, weddingDate);
  } else {
    base = new Date(wedding);
  }

  if (template.dueMode === 'createdPlus') {
    base.setDate(base.getDate() + Number(template.days || 0));
  }
  if (template.dueMode === 'midpointBefore') {
    base.setDate(base.getDate() - Number(template.days || 0));
  }
  if (Number.isFinite(template.dueBefore)) {
    base.setDate(base.getDate() - Number(template.dueBefore));
  }
  if (Number.isFinite(template.dueAfter)) {
    base.setDate(base.getDate() + Number(template.dueAfter));
  }

  return base.toISOString().slice(0,10);
}

async function generateWeddingTasks(weddingId, weddingDate, createdAt) {
  const rows = WEDDING_TASK_TEMPLATE.map((item,index) => ({
    wedding_id:weddingId,
    title:item.title,
    category:item.category,
    priority:item.priority,
    due_date:weddingTaskDueDate(item,weddingDate,createdAt),
    sort_order:index+1
  }));

  const { error } = await supabaseClient.from('wedding_tasks').insert(rows);
  if (error) console.error('Could not generate wedding tasks:',error);
}

async function updateFirstMeetingDatesFromDeposit(weddingId, depositCompletedAt) {
  const depositDate = safeWeddingDate(depositCompletedAt);
  const bookDate = new Date(depositDate);
  const completeDate = new Date(depositDate);

  bookDate.setDate(bookDate.getDate() + 7);
  completeDate.setDate(completeDate.getDate() + 14);

  const tasks = weddingTasksFor(weddingId);
  const bookTask = tasks.find(x => x.title === 'Book first meeting' && !x.completed);
  const completeTask = tasks.find(x => x.title === 'Complete first meeting' && !x.completed);

  if (bookTask) {
    await supabaseClient.from('wedding_tasks')
      .update({due_date:bookDate.toISOString().slice(0,10)})
      .eq('id',bookTask.id);
  }

  if (completeTask) {
    await supabaseClient.from('wedding_tasks')
      .update({due_date:completeDate.toISOString().slice(0,10)})
      .eq('id',completeTask.id);
  }
}


async function transferPreBookingWeddingData(enquiry,weddingId){
  if(typeof enquiryWeddingData!=='function')return;
  const pre=enquiryWeddingData(enquiry);
  if(!pre)return;
  const b=pre.brief||{}, q=pre.quote||{};
  // Seed the real Wedding Planning profile/brief using the same post-booking structure.
  if(weddingPlanningTablesReady){
    try{
      const seedSection=async(section,data)=>{const existing=planningRecord(weddingId,section);const payload={wedding_id:weddingId,section,data,updated_at:new Date().toISOString()};return existing?supabaseClient.from('wedding_planning').update(payload).eq('id',existing.id):supabaseClient.from('wedding_planning').insert(payload);};
      await seedSection('profile',{
        weddingFormat:b.weddingFormat||'ceremony_reception',
        ceremonyLocationType:b.ceremonyLocation==='windmill_farm'?'granary':(['external','church','registry','other'].includes(b.ceremonyLocation)?'external':'none'),
        dayMealRequired:b.weddingFormat!=='evening_only',
        eveningFoodRequired:!!(q.eveningFood&&q.eveningFood!=='None'),
        accommodationRequired:b.accommodation!=='no',
        djRequired:/dj/i.test(b.entertainment||'') || true,
        externalCeremonyVenue:['external','church','registry','other'].includes(b.ceremonyLocation)?(b.ceremonyLocation==='church'?'Church':b.ceremonyLocation==='registry'?'Registry Office':'External venue'):'',
        externalCeremonyTime:b.ceremonyTime||'',
        venueArrivalTime:b.arrivalTime||''
      });
      await seedSection('reception',{
        weddingBreakfastMenu:q.menu||'None',
        weddingBreakfastTime:b.weddingBreakfastTime||'',
        drinksPackage:q.drinks||'None',
        eveningFoodMenu:q.eveningFood||'None',
        eveningFoodGuests:Number(q.eveningGuests||0),
        eveningFoodTime:b.eveningStartTime||'',
        preBookingFoodIdeas:b.foodIdeas||'',
        preBookingDrinksIdeas:b.drinksIdeas||''
      });
      await seedSection('ceremony',{
        ceremonyTime:b.ceremonyTime||'',
        arrivalTime:b.arrivalTime||'',
        preBookingStyleVision:b.styleVision||'',
        preBookingSpecialRequirements:b.specialRequirements||''
      });
      await seedSection('music',{
        preBookingEntertainment:b.entertainment||''
      });
    }catch(error){console.warn('Pre-booking wedding brief transfer partially failed',error);}
  }
  // Create Quote Version 1 from the enquiry quote if the quote table is available.
  if(weddingQuoteTablesReady && q.packageName){
    try{
      const calc=calculateWeddingQuote(q);
      const items=[
        {type:'meta',menu:q.menu||'None',menuIncluded:!!q.menuIncluded,drinks:q.drinks||'None',drinksIncluded:!!q.drinksIncluded,eveningFood:q.eveningFood||'None',eveningFoodIncluded:!!q.eveningFoodIncluded,dayAdults:Number(q.dayAdults??q.dayGuests??0),dayChildren:Number(q.dayChildren||0),eveningAdults:Number(q.eveningAdults??q.eveningGuests??0),eveningChildren:Number(q.eveningChildren||0)},
        ...(q.extras||[]).map(x=>({...x,type:'extra'})),
        ...(q.customItems||[]).map(x=>({...x,type:'custom'}))
      ];
      const existing=quotesForWedding(weddingId);
      if(!existing.length){
        await supabaseClient.from('wedding_quotes').insert({
          wedding_id:weddingId,version:1,status:'Draft',price_year:Number(q.priceYear||2027),
          package_name:q.packageName||'Bespoke',day_guests:Number(q.dayGuests||0),evening_guests:Number(q.eveningGuests||0),
          items,subtotal:Number(calc.subtotal||0),discount:Number(q.discount||0),total:Number(calc.total||0),
          notes:q.notes||''
        });
      }
    }catch(error){console.warn('Pre-booking quote transfer failed',error);}
  }
}

async function ensureWeddingFromEnquiry(enquiry) {
  if (
    !enquiry ||
    enquiry.eventType !== 'Wedding' ||
    enquiry.status !== 'Confirmed Booking'
  ) return;

  const existing = DB.weddings.find(w => w.enquiryId === enquiry.id);
  if (existing) return;

  const record = {
    enquiry_id: enquiry.id,
    couple_names: enquiry.name,
    wedding_date: String(enquiry.preferredDate || '').trim() || null,
    status: 'Confirmed',
    coordinator: enquiry.staff || null,
    package_name: enquiry.package || 'TBC',
    day_guests: Number(enquiry.guests) || 0,
    evening_guests: Number(enquiry.guests) || 0,
    quoted_value: Number(enquiry.value) || 0,
    amount_paid: 0,
    notes: enquiry.notes || null
  };

  const { data, error } = await supabaseClient
    .from('weddings')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Could not create wedding from enquiry:', error);
    toast('Enquiry saved, but wedding record was not created', 'error');
    return;
  }

  await generateWeddingTasks(
    data.id,
    data.wedding_date,
    data.created_at
  );

  await transferPreBookingWeddingData(enquiry,data.id);
  await loadWeddingsFromSupabase();
  toast('Wedding workspace created automatically');
}


// ============================================================================
// WINDMILL FARM — VISUAL WEDDING SEATING V1
// Drag tables around the room, drag guests onto tables, and flexibly map CSVs.
// ============================================================================

window.WeddingVisualSeating = window.WeddingVisualSeating || {
  guestFilter:'all',
  guestSearch:'',
  zoom:100,
  grid:true,
  snap:true,
  selectedTableId:'',
  importRows:[],
  importHeaders:[],
  importMapping:{},
  importWeddingId:'',
  draggingTableId:'',
  dragOffsetX:0,
  dragOffsetY:0
};

WeddingVisualSeating.colours=['#F2E9DE','#E8E4F4','#E7EFDC','#DDEDEA','#DDEAF1','#F5E3DD','#F1E6D9','#E7E7E7'];

WeddingVisualSeating.tableColour=function(table,index=0){
  return table.colour||WeddingVisualSeating.colours[index%WeddingVisualSeating.colours.length];
};

WeddingVisualSeating.shape=function(table){
  const value=String(table.visualShape||table.tableType||'Round').toLowerCase();
  if(value.includes('top'))return 'top';
  if(value.includes('rectangle'))return 'rectangle';
  if(value.includes('sweetheart'))return 'sweetheart';
  return 'round';
};

WeddingVisualSeating.setGuestFilter=function(value,weddingId){
  WeddingVisualSeating.guestFilter=value;
  renderWeddingWorkspace();
};

WeddingVisualSeating.setSearch=function(value,weddingId){
  WeddingVisualSeating.guestSearch=String(value||'').toLowerCase();
  WeddingVisualSeating.refreshGuestPanel(weddingId);
};

WeddingVisualSeating.filteredGuests=function(weddingId){
  const guests=weddingGuestsFor(weddingId);
  const search=WeddingVisualSeating.guestSearch;
  return guests.filter(guest=>{
    if(search&&!`${guest.guestName} ${guest.dietaryRequirements||''} ${guest.guestType||''}`.toLowerCase().includes(search))return false;
    if(WeddingVisualSeating.guestFilter==='unassigned'&&guest.tableId)return false;
    if(WeddingVisualSeating.guestFilter==='seated'&&!guest.tableId)return false;
    if(WeddingVisualSeating.guestFilter==='dietary'&&!guest.dietaryRequirements)return false;
    if(WeddingVisualSeating.guestFilter==='children'&&!['Child','Infant'].includes(guest.guestType))return false;
    return true;
  });
};

WeddingVisualSeating.refreshGuestPanel=function(weddingId){
  const host=document.getElementById('visual-seating-guest-list');
  if(!host)return;
  const tables=seatingTablesFor(weddingId);
  const rows=WeddingVisualSeating.filteredGuests(weddingId);
  host.innerHTML=rows.length?rows.map(guest=>{
    const table=tables.find(t=>t.id===guest.tableId);
    return `<div draggable="true" data-guest-id="${guest.id}" class="wvs-guest-row">
      <span class="wvs-drag-handle"><i data-lucide="grip-vertical"></i></span>
      <span class="wvs-guest-avatar"><i data-lucide="user-round"></i></span>
      <button onclick="openWeddingGuestForm('${weddingId}','${guest.id}')" class="min-w-0 flex-1 text-left">
        <strong>${esc(guest.guestName)}</strong>
        <small>${esc(guest.guestType||'Adult')}${guest.dietaryRequirements?` · ⚠ ${esc(guest.dietaryRequirements)}`:''}</small>
      </button>
      <select onchange="WeddingVisualSeating.assignGuest('${guest.id}',this.value,'${weddingId}')" class="wvs-table-select">
        <option value="">Unassigned</option>
        ${tables.map(t=>`<option value="${t.id}" ${guest.tableId===t.id?'selected':''}>${esc(t.tableName)}</option>`).join('')}
      </select>
    </div>`;
  }).join(''):'<div class="wvs-empty">No guests match this view.</div>';
  WeddingVisualSeating.initialiseGuestDragging(weddingId);
  if(window.lucide)lucide.createIcons();
};

WeddingVisualSeating.assignGuest=async function(guestId,tableId,weddingId){
  const target=(DB.weddingSeatingTables||[]).find(t=>t.id===tableId);
  if(target&&guestsAtTable(tableId).length>=target.capacity){
    if(!confirm(`${target.tableName} is at capacity. Seat this guest there anyway?`))return renderWeddingWorkspace();
  }
  const {error}=await supabaseClient.from('wedding_guests').update({table_id:tableId||null}).eq('id',guestId);
  if(error){console.error(error);toast('Guest could not be moved','error');return;}
  await loadWeddingsFromSupabase();
  renderWeddingWorkspace();
  toast('Guest seating updated');
};

WeddingVisualSeating.initialiseGuestDragging=function(weddingId){
  let guestId='';
  document.querySelectorAll('[data-guest-id]').forEach(row=>{
    row.addEventListener('dragstart',event=>{
      guestId=row.dataset.guestId;
      event.dataTransfer.setData('text/wedding-guest',guestId);
      event.dataTransfer.effectAllowed='move';
      row.classList.add('opacity-50');
    });
    row.addEventListener('dragend',()=>row.classList.remove('opacity-50'));
  });
  document.querySelectorAll('.wvs-table-drop').forEach(zone=>{
    zone.addEventListener('dragover',event=>{
      if(!event.dataTransfer.types.includes('text/wedding-guest'))return;
      event.preventDefault();
      zone.classList.add('guest-over');
    });
    zone.addEventListener('dragleave',()=>zone.classList.remove('guest-over'));
    zone.addEventListener('drop',event=>{
      if(!event.dataTransfer.types.includes('text/wedding-guest'))return;
      event.preventDefault();
      zone.classList.remove('guest-over');
      WeddingVisualSeating.assignGuest(event.dataTransfer.getData('text/wedding-guest')||guestId,zone.dataset.tableId,weddingId);
    });
  });
  const unassigned=document.getElementById('wvs-unassigned-drop');
  if(unassigned){
    unassigned.addEventListener('dragover',event=>event.preventDefault());
    unassigned.addEventListener('drop',event=>{
      event.preventDefault();
      WeddingVisualSeating.assignGuest(event.dataTransfer.getData('text/wedding-guest'),'',weddingId);
    });
  }
};

WeddingVisualSeating.initialiseTableDragging=function(weddingId){
  const canvas=document.getElementById('wvs-room-canvas');
  if(!canvas)return;

  canvas.querySelectorAll('.wvs-table-object').forEach(object=>{
    const handle=object.querySelector('.wvs-table-move-handle')||object;
    handle.addEventListener('pointerdown',event=>{
      const table=(DB.weddingSeatingTables||[]).find(t=>t.id===object.dataset.tableId);
      if(table?.locked)return;
      if(event.target.closest('button')||event.target.closest('.wvs-seat'))return;
      event.preventDefault();
      WeddingVisualSeating.draggingTableId=object.dataset.tableId;
      const canvasRect=canvas.getBoundingClientRect();
      const rect=object.getBoundingClientRect();
      WeddingVisualSeating.dragOffsetX=event.clientX-rect.left;
      WeddingVisualSeating.dragOffsetY=event.clientY-rect.top;
      object.setPointerCapture?.(event.pointerId);
      object.classList.add('dragging');
    });

    object.addEventListener('pointermove',event=>{
      if(WeddingVisualSeating.draggingTableId!==object.dataset.tableId)return;
      const canvasRect=canvas.getBoundingClientRect();
      let x=((event.clientX-canvasRect.left-WeddingVisualSeating.dragOffsetX+object.offsetWidth/2)/canvasRect.width)*100;
      let y=((event.clientY-canvasRect.top-WeddingVisualSeating.dragOffsetY+object.offsetHeight/2)/canvasRect.height)*100;
      if(WeddingVisualSeating.snap){
        x=Math.round(x/2)*2;y=Math.round(y/2)*2;
      }
      x=Math.max(6,Math.min(94,x));y=Math.max(8,Math.min(92,y));
      object.style.left=`${x}%`;object.style.top=`${y}%`;
      object.dataset.positionX=x;object.dataset.positionY=y;
    });

    const finish=async event=>{
      if(WeddingVisualSeating.draggingTableId!==object.dataset.tableId)return;
      WeddingVisualSeating.draggingTableId='';
      object.classList.remove('dragging');
      const x=Number(object.dataset.positionX||50),y=Number(object.dataset.positionY||50);
      const table=(DB.weddingSeatingTables||[]).find(t=>t.id===object.dataset.tableId);
      if(table){table.positionX=x;table.positionY=y;}
      const {error}=await supabaseClient.from('wedding_seating_tables').update({position_x:x,position_y:y}).eq('id',object.dataset.tableId);
      if(error)console.warn('Visual table position was not saved. Run the seating migration SQL.',error);
    };
    object.addEventListener('pointerup',finish);
    object.addEventListener('pointercancel',finish);
  });
};

WeddingVisualSeating.toggleGrid=function(weddingId){
  WeddingVisualSeating.grid=!WeddingVisualSeating.grid;
  renderWeddingWorkspace();
};
WeddingVisualSeating.toggleSnap=function(weddingId){
  WeddingVisualSeating.snap=!WeddingVisualSeating.snap;
  renderWeddingWorkspace();
};
WeddingVisualSeating.changeZoom=function(amount,weddingId){
  WeddingVisualSeating.zoom=Math.max(70,Math.min(135,WeddingVisualSeating.zoom+amount));
  const room=document.getElementById('wvs-room');
  if(room)room.style.transform=`scale(${WeddingVisualSeating.zoom/100})`;
  const label=document.getElementById('wvs-zoom-label');
  if(label)label.textContent=`${WeddingVisualSeating.zoom}%`;
};

WeddingVisualSeating.toggleLock=async function(tableId,weddingId){
  const table=(DB.weddingSeatingTables||[]).find(t=>t.id===tableId);
  if(!table)return;
  table.locked=!table.locked;
  const {error}=await supabaseClient.from('wedding_seating_tables').update({locked:table.locked}).eq('id',tableId);
  if(error)console.warn(error);
  renderWeddingWorkspace();
};

WeddingVisualSeating.rotateTable=async function(tableId,weddingId){
  const table=(DB.weddingSeatingTables||[]).find(t=>t.id===tableId);
  if(!table)return;
  table.rotation=(Number(table.rotation||0)+90)%360;
  const {error}=await supabaseClient.from('wedding_seating_tables').update({rotation:table.rotation}).eq('id',tableId);
  if(error)console.warn(error);
  renderWeddingWorkspace();
};

WeddingVisualSeating.seatPositions=function(capacity,shape){
  const count=Math.max(1,Math.min(20,Number(capacity||8)));
  if(shape==='top'||shape==='rectangle'){
    return Array.from({length:count},(_,index)=>{
      const top=index<Math.ceil(count/2);
      const rowIndex=top?index:index-Math.ceil(count/2);
      const rowCount=top?Math.ceil(count/2):Math.floor(count/2);
      return {left:((rowIndex+1)/(rowCount+1))*100,top:top?3:97};
    });
  }
  return Array.from({length:count},(_,index)=>{
    const angle=(Math.PI*2*index/count)-Math.PI/2;
    return {left:50+47*Math.cos(angle),top:50+47*Math.sin(angle)};
  });
};

WeddingVisualSeating.renderTable=function(table,index,weddingId){
  const guests=guestsAtTable(table.id);
  const shape=WeddingVisualSeating.shape(table);
  const positions=WeddingVisualSeating.seatPositions(table.capacity,shape);
  const colour=WeddingVisualSeating.tableColour(table,index);
  const x=Number.isFinite(Number(table.positionX))?Number(table.positionX):(20+(index%3)*30);
  const y=Number.isFinite(Number(table.positionY))?Number(table.positionY):(30+Math.floor(index/3)*28);
  const isOver=guests.length>table.capacity;
  const sizeClass=shape==='top'?'top':shape==='rectangle'?'rectangle':shape==='sweetheart'?'sweetheart':'round';
  return `<div class="wvs-table-object ${sizeClass} ${table.locked?'locked':''} ${isOver?'over':''}" data-table-id="${table.id}" data-position-x="${x}" data-position-y="${y}" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${Number(table.rotation||0)}deg);--table-colour:${colour}">
    <div class="wvs-table-toolbar">
      <button onclick="event.stopPropagation();WeddingVisualSeating.toggleLock('${table.id}','${weddingId}')" title="${table.locked?'Unlock':'Lock'}"><i data-lucide="${table.locked?'lock':'unlock'}"></i></button>
      <button onclick="event.stopPropagation();WeddingVisualSeating.rotateTable('${table.id}','${weddingId}')" title="Rotate 90°"><i data-lucide="rotate-cw"></i></button>
      <button onclick="event.stopPropagation();openWeddingSeatingTableForm('${weddingId}','${table.id}')" title="Edit"><i data-lucide="pencil"></i></button>
      <button onclick="event.stopPropagation();deleteWeddingSeatingTable('${table.id}')" title="Delete table" class="text-red-600"><i data-lucide="trash-2"></i></button>
    </div>
    <div class="wvs-table-move-handle wvs-table-drop" data-table-id="${table.id}">
      <strong>${esc(table.tableName)}</strong>
      <span>${guests.length}/${table.capacity}</span>
      ${(()=>{
        const ft=weddingFoodChoiceTotals(weddingId,guests);
        const s=ft.starter.reduce((n,x)=>n+x[1],0),m=ft.main.reduce((n,x)=>n+x[1],0),d=ft.dessert.reduce((n,x)=>n+x[1],0);
        return (s||m||d)?`<small class="wvs-table-meal-mini">S ${s} · M ${m} · D ${d}</small>`:'';
      })()}
      ${isOver?'<small>Over capacity</small>':''}
    </div>
    ${positions.map((position,seatIndex)=>{
      const guest=guests[seatIndex];
      return `<button class="wvs-seat ${guest?'occupied':''}" data-seat="${seatIndex+1}" style="left:${position.left}%;top:${position.top}%;" title="${guest?esc(guest.guestName):`Seat ${seatIndex+1}`}">
        ${guest?`<span>${esc(guest.guestName.split(/\s+/)[0])}</span>`:''}
      </button>`;
    }).join('')}
  </div>`;
};



function weddingChefShortFoodName(value){
  const text=String(value||'').trim();if(!text)return '';
  if(window.KitchenApp?.recipeMatch){
    const recipe=KitchenApp.recipeMatch(text);
    if(recipe)return KitchenApp.chefShortName?KitchenApp.chefShortName(recipe):text;
  }
  return window.KitchenApp?.defaultChefShortName?KitchenApp.defaultChefShortName(text):text;
}
function weddingShortFoodTotals(items){
  const grouped=new Map();
  (items||[]).forEach(([fullName,count])=>{
    const shortName=weddingChefShortFoodName(fullName)||fullName;
    grouped.set(shortName,(grouped.get(shortName)||0)+Number(count||0));
  });
  return [...grouped.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
}
function weddingTableSortKey(table){
  const name=String(table?.tableName||'').trim();
  // Top Table always wins, irrespective of table creation order or coordinates.
  if(/^top\s*table$/i.test(name)||/\btop\s*table\b/i.test(name))return [-10000,name];
  const match=name.match(/(\d+(?:\.\d+)?)/);
  if(match)return [Number(match[1]),name];
  return [9000,name];
}
function weddingFoodChoiceTotals(weddingId,guestsOverride=null){
  const guests=guestsOverride||weddingGuestsFor(weddingId);
  const countField=field=>{
    const map=new Map();
    guests.forEach(g=>{
      const value=String(g[field]||'').trim();
      if(!value)return;
      map.set(value,(map.get(value)||0)+1);
    });
    return [...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  };
  return {
    starter:countField('starterChoice'),
    main:countField('mainChoice'),
    dessert:countField('dessertChoice'),
    evening:countField('eveningFoodChoice'),
    dietary:guests.filter(g=>String(g.dietaryRequirements||'').trim()).length,
    guests:guests.length
  };
}
function weddingFoodTotalsForTables(weddingId){
  const tables=seatingTablesFor(weddingId);
  const guests=weddingGuestsFor(weddingId);
  const results=tables
    .slice()
    .sort((a,b)=>{
      const ak=weddingTableSortKey(a),bk=weddingTableSortKey(b);
      return ak[0]-bk[0]||ak[1].localeCompare(bk[1]);
    })
    .map(table=>{
      const tableGuests=guests
        .filter(g=>String(g.tableId||'')===String(table.id||''))
        .sort((a,b)=>String(a.guestName||'').localeCompare(String(b.guestName||'')));
      const dietaryGuests=tableGuests.filter(g=>String(g.dietaryRequirements||'').trim()||String(g.accessibilityNotes||'').trim());
      return {table,guests:tableGuests,dietaryGuests,totals:weddingFoodChoiceTotals(weddingId,tableGuests)};
    });
  const unassigned=guests.filter(g=>!g.tableId).sort((a,b)=>String(a.guestName||'').localeCompare(String(b.guestName||'')));
  if(unassigned.length)results.push({
    table:{id:'unassigned',tableName:'Unassigned Guests'},
    guests:unassigned,
    dietaryGuests:unassigned.filter(g=>String(g.dietaryRequirements||'').trim()||String(g.accessibilityNotes||'').trim()),
    totals:weddingFoodChoiceTotals(weddingId,unassigned)
  });
  return results;
}
function renderFoodCountList(items){
  if(!items.length)return '<span class="wvs-food-empty">No choices recorded</span>';
  return items.map(([name,count])=>`<div class="wvs-food-count"><span>${esc(name)}</span><strong>${count}</strong></div>`).join('');
}

function weddingGuestCardRole(guest){
  const type=String(guest?.guestType||'').trim();
  return type&&type.toLowerCase()!=='adult'?type:'';
}
function openWeddingGuestCardStudio(weddingId){
  const wedding=DB.weddings.find(x=>x.id===weddingId);if(!wedding)return;
  const guests=weddingFoodTotalsForTables(weddingId).flatMap(x=>x.guests.map(g=>({...g,_tableName:x.table.tableName})));
  if(!guests.length){toast('Add guests to the seating plan before printing place cards','error');return;}
  const logoUrl=new URL('assets/granary-logo.png',window.location.href).href;

  const styles=[
    ['champagne','Champagne Romance','Warm ivory, champagne detailing and the real Granary logo. Designed to feel like wedding stationery, not a function sheet.','Most versatile'],
    ['botanical','Garden Romance','Soft sage botanical linework around the actual Granary logo with a relaxed country-wedding feel.','Romantic'],
    ['pearl','Pearl & Taupe','Clean pearl paper, taupe typography and delicate rules. Elegant without looking corporate.','Contemporary']
  ];

  openModal(`<div class="p-6 max-w-6xl max-h-[94vh] overflow-y-auto">
    <div class="flex justify-between gap-4 items-start">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">PERSONALISED WEDDING STATIONERY</p>
        <h2 class="text-2xl font-bold">Guest Place Card Studio</h2>
        <p class="text-sm text-gray-500 mt-1">${esc(wedding.couple)} · ${guests.length} personalised cards · names, tables and menus are pulled automatically from Seating.</p>
      </div>
      <button onclick="closeModal()"><i data-lucide="x"></i></button>
    </div>

    <div class="mt-5 rounded-2xl border bg-[#faf8f3] p-4 flex items-center justify-center">
      <img src="${logoUrl}" alt="The Granary at Windmill Farm" class="max-h-20 max-w-[360px] object-contain">
    </div>

    <div class="grid md:grid-cols-3 gap-3 mt-4">
      ${styles.map(([id,title,desc,badge],i)=>`<label class="relative border rounded-2xl p-4 cursor-pointer bg-white hover:border-olive-300 transition">
        <input type="radio" name="wedding-card-style" value="${id}" ${i===0?'checked':''} class="absolute right-4 top-4">
        <div class="h-28 rounded-xl mb-3 overflow-hidden border relative ${id==='botanical'?'bg-[#f8f7f0]':id==='pearl'?'bg-[#fbfaf7]':'bg-[#fcf8ef]'}">
          <div class="h-full flex flex-col items-center justify-center px-4 text-center">
            <img src="${logoUrl}" class="h-8 max-w-[150px] object-contain opacity-90 mb-2">
            <strong class="font-serif text-lg text-[#493e35]">Alex Morgan</strong>
            <span class="text-[9px] uppercase tracking-[.2em] mt-1 text-[#8b745f]">Table Five</span>
            <span class="text-[9px] font-serif italic mt-2 text-[#85786c]">Rosalynde & Craig</span>
          </div>
        </div>
        <span class="text-[10px] uppercase tracking-wider text-olive-600 font-bold">${badge}</span>
        <strong class="block mt-1">${title}</strong>
        <p class="text-xs text-gray-500 mt-1 leading-relaxed">${desc}</p>
      </label>`).join('')}
    </div>

    <div class="grid md:grid-cols-2 gap-3 mt-4">
      <label class="border rounded-2xl p-4 bg-white">
        <strong>Card format</strong>
        <select id="wedding-card-format" class="mt-2 w-full px-3 py-2 border rounded-lg">
          <option value="tent">Folded place card · 4 per full A4 portrait sheet</option>
          <option value="menu">Tall wedding menu · 3 per full A4 landscape sheet</option>
        </select>
        <p class="text-xs text-gray-500 mt-2">The sheet is planned first: 4mm printer-safe outer margin, small cutting gaps, then the cards use everything left.</p>
      </label>
      <label class="border rounded-2xl p-4 bg-white">
        <strong>Menu wording</strong>
        <select id="wedding-card-food-mode" class="mt-2 w-full px-3 py-2 border rounded-lg">
          <option value="short">Elegant service names</option>
          <option value="full">Full official menu names</option>
        </select>
        <p class="text-xs text-gray-500 mt-2">Long names and dishes step down automatically without changing the A4 card geometry.</p>
      </label>
    </div>

    <div class="rounded-2xl border border-[#ddcfbc] bg-[#fbf7ef] p-4 mt-4 flex gap-3 items-start">
      <div class="w-9 h-9 rounded-full bg-[#8e755d] text-white grid place-items-center flex-none"><i data-lucide="sparkles"></i></div>
      <div>
        <strong>Wedding stationery first. Operational information second.</strong>
        <p class="text-xs text-gray-600 mt-1">Dietary information is shown once as an elegant footnote — no red warning box and no duplicated Evening Food wording.</p>
      </div>
    </div>

    <button onclick="printWeddingGuestCards('${weddingId}')" class="mt-5 w-full py-3.5 bg-charcoal-900 text-white rounded-xl font-bold text-base">
      Preview & Print ${guests.length} Wedding Place Cards
    </button>
  </div>`);
  if(window.lucide)lucide.createIcons();
}

function weddingPlannedEveningFoodLabel(weddingId){
  const reception=planningData(weddingId,'reception')||{};
  const services=Array.isArray(reception.eveningFoodServices)?reception.eveningFoodServices:[];
  const labels=services.map(service=>{
    const def=typeof weddingKitchenMenus==='function'?weddingKitchenMenus()[service.menuKey]:null;
    const label=String(service.menuLabel||def?.label||service.menuKey||'').trim();
    if(!label||/^none$/i.test(label))return '';
    if(service.menuKey==='custom'&&String(service.notes||'').trim())return String(service.notes).trim();
    return label;
  }).filter(Boolean);
  if(!labels.length){
    const legacy=String(reception.eveningFoodMenu||'').trim();
    if(legacy&&!/^none$/i.test(legacy))labels.push(legacy);
  }
  return [...new Set(labels)].join(' + ');
}

function weddingGuestPlannedEveningFood(weddingId,guest){
  const planned=weddingPlannedEveningFoodLabel(weddingId);
  if(!planned)return '';
  const dietary=String(guest?.dietaryRequirements||'').trim();
  return dietary?`${planned} · ⚠ Adapt for: ${dietary}`:planned;
}

function weddingPlannedEveningFoodTotals(weddingId){
  const wedding=(DB.weddings||[]).find(x=>String(x.id)===String(weddingId));
  const reception=planningData(weddingId,'reception')||{};
  const services=Array.isArray(reception.eveningFoodServices)?reception.eveningFoodServices:[];

  const rows=services.map(service=>{
    const def=typeof weddingKitchenMenus==='function'?weddingKitchenMenus()[service.menuKey]:null;
    let label=String(service.menuLabel||def?.label||service.menuKey||'').trim();
    if(service.menuKey==='custom'&&String(service.notes||'').trim())label=String(service.notes).trim();
    if(!label||/^none$/i.test(label))return null;
    const covers=Math.max(0,Number(service.guests||0))||Math.max(0,Number(reception.eveningFoodGuests||0))||Math.max(0,Number(wedding?.eveningGuests||0));
    return [label,covers];
  }).filter(Boolean);

  if(!rows.length){
    const label=String(reception.eveningFoodMenu||'').trim();
    if(label&&!/^none$/i.test(label)){
      const covers=Math.max(0,Number(reception.eveningFoodGuests||0))||Math.max(0,Number(wedding?.eveningGuests||0));
      rows.push([label,covers]);
    }
  }

  const combined={};
  rows.forEach(([label,covers])=>{combined[label]=(combined[label]||0)+Number(covers||0);});
  return Object.entries(combined);
}

function weddingEveningDietaryNotes(weddingId){
  const guests=weddingGuestsFor(weddingId);
  const notes=guests.map(g=>String(g.dietaryRequirements||'').trim()).filter(Boolean);
  return [...new Set(notes)];
}

function renderWeddingEveningAllergySummary(weddingId,mode='screen'){
  const notes=weddingEveningDietaryNotes(weddingId);
  if(!notes.length)return '';
  if(mode==='print')return `<div class="overall-evening-allergies"><strong>⚠ ALLERGIES / DIETARY TO CHECK</strong>${notes.map(note=>`<div>⚠ ${esc(note)}</div>`).join('')}</div>`;
  return `<div class="wvs-evening-allergies"><strong>⚠ ALLERGIES / DIETARY TO CHECK</strong>${notes.map(note=>`<div>⚠ ${esc(note)}</div>`).join('')}</div>`;
}

function printWeddingGuestCards(weddingId){
  const wedding=DB.weddings.find(x=>x.id===weddingId);if(!wedding)return;
  const style=document.querySelector('input[name="wedding-card-style"]:checked')?.value||'champagne';
  const format=document.getElementById('wedding-card-format')?.value||'tent';
  const foodMode=document.getElementById('wedding-card-food-mode')?.value||'short';
  const groups=weddingFoodTotalsForTables(weddingId);
  const guests=groups.flatMap(group=>group.guests.map(g=>({...g,_tableName:group.table.tableName})));
  if(!guests.length)return toast('No seated guests are available to print','error');

  const logoUrl=new URL('assets/granary-logo.png',window.location.href).href;
  const rawFood=value=>foodMode==='full'
    ?(String(value||'').trim()||'—')
    :(weddingChefShortFoodName(value)||'—');
  const dietary=g=>String(g.dietaryRequirements||'').trim();
  const accessibility=g=>String(g.accessibilityNotes||'').trim();
  const eveningBase=weddingPlannedEveningFoodLabel(weddingId);
  const role=g=>weddingGuestCardRole(g);
  const styleClass=`style-${style}`;
  const coupleNames=String(wedding.couple||'').trim();
  const weddingDate=String(wedding.date||'');
  const dateLabel=(()=>{
    if(!weddingDate)return '';
    const d=new Date(`${weddingDate}T12:00:00`);
    return Number.isNaN(d.getTime())?weddingDate:d.toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'});
  })();

  const lengthClass=(value,mid=34,long=58)=>{
    const n=String(value||'').length;
    return n>long?'very-long':n>mid?'long':'';
  };
  const nameClass=g=>lengthClass(g.guestName,20,30);
  const logo=(cls='')=>`<img class="granary-logo ${cls}" src="${logoUrl}" alt="The Granary at Windmill Farm">`;

  const menuCourse=(label,value,star=false)=>{
    const v=String(value||'—').trim()||'—';
    const cls=lengthClass(v,34,62);
    return `<div class="course ${cls}">
      <div class="course-label">${label}</div>
      <div class="course-dish">${esc(v)}${star?'<sup>*</sup>':''}</div>
    </div>`;
  };

  const dietaryNote=g=>{
    const diet=dietary(g), access=accessibility(g);
    if(!diet&&!access)return '';
    const text=[diet?`Dietary adaptation: ${diet}`:'',access?`Service note: ${access}`:''].filter(Boolean).join(' · ');
    return `<div class="wedding-note ${lengthClass(text,70,115)}">* ${esc(text)}</div>`;
  };

  const tentFront=g=>`<div class="tent-front-inner">
    ${logo('front-logo')}
    <div class="front-name-wrap">
      <h2 class="guest-name script-name ${nameClass(g)}">${esc(g.guestName||'Guest')}</h2>
      <div class="heart">♡</div>
      <div class="table-name">${esc(g._tableName||'Table TBC')}</div>
      ${role(g)?`<div class="guest-role">${esc(role(g))}</div>`:''}
    </div>
  </div>`;

  const tentMenu=g=>`<div class="tent-menu-inner">
    ${logo('menu-logo')}
    <div class="reverse-title">Your Menu</div>
    <div class="stacked-courses">
      ${menuCourse('Starter',rawFood(g.starterChoice))}
      ${menuCourse('Main',rawFood(g.mainChoice))}
      ${menuCourse('Dessert',rawFood(g.dessertChoice))}
      ${menuCourse('Evening',eveningBase||'—',Boolean(dietary(g)))}
    </div>
    ${dietaryNote(g)}
  </div>`;

  const tentCard=g=>`<article class="tent-card stationery-card ${styleClass}">
    <section class="tent-half tent-front">${tentFront(g)}</section>
    <section class="tent-half tent-menu">${tentMenu(g)}</section>
    <div class="fold-rule"></div>
  </article>`;

  const tallCard=g=>`<article class="tall-card stationery-card ${styleClass}">
    <div class="tall-inner">
      ${logo('tall-logo')}
      <div class="tall-name-block">
        <h2 class="guest-name tall-name ${nameClass(g)}">${esc(g.guestName||'Guest')}</h2>
        <div class="heart small-heart">♥</div>
        <div class="table-name">${esc(g._tableName||'Table TBC')}</div>
        ${role(g)?`<div class="guest-role">${esc(role(g))}</div>`:''}
      </div>

      <div class="lets-eat">
        <span class="lets">LET'S</span>
        <span class="eat">eat</span>
      </div>

      <div class="tall-courses">
        ${menuCourse('Starter',rawFood(g.starterChoice))}
        ${menuCourse('Main Course',rawFood(g.mainChoice))}
        ${menuCourse('Dessert',rawFood(g.dessertChoice))}
        ${menuCourse('Evening Food',eveningBase||'—',Boolean(dietary(g)))}
      </div>

      ${dietaryNote(g)}
      <div class="tall-footer">
        <div class="heart footer-heart">♥</div>
        <div class="couple-script">${esc(coupleNames)}</div>
        <div class="date-line">${esc(dateLabel)}</div>
      </div>
    </div>
  </article>`;

  const chunk=(items,size)=>Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,i*size+size));
  const pages=format==='tent'
    ?chunk(guests,4).map(page=>`<section class="print-sheet tent-sheet">${page.map(tentCard).join('')}</section>`).join('')
    :chunk(guests,3).map(page=>`<section class="print-sheet menu-sheet">${page.map(tallCard).join('')}</section>`).join('');

  const win=window.open('','_blank');
  if(!win)return toast('Allow pop-ups to preview guest cards','error');

  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
  <title>Wedding Place Cards · ${esc(wedding.couple||'Wedding')}</title>
  <style>
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#ece9e4;color:#2d2926;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .print-sheet{background:#fff;margin:6mm auto;display:grid;overflow:hidden;break-after:page;page-break-after:always}
    .print-sheet:last-child{break-after:auto;page-break-after:auto}
    .stationery-card{position:relative;overflow:hidden;break-inside:avoid;background:var(--paper);color:var(--ink);border:.15mm solid var(--cut)}
    .style-champagne{--paper:#fffdf9;--ink:#292522;--accent:#8e715d;--muted:#82766d;--cut:#d4c8bb;--rule:#d9d0c7}
    .style-botanical{--paper:#fdfcf7;--ink:#30342e;--accent:#77806a;--muted:#7c8176;--cut:#cbd0c5;--rule:#d9ddd4}
    .style-pearl{--paper:#fffefe;--ink:#2e2926;--accent:#8c7c72;--muted:#817872;--cut:#d6d0cb;--rule:#ded8d4}

    .granary-logo{display:block;object-fit:contain;max-width:100%;height:auto}
    .guest-name{margin:0;color:var(--ink);font-weight:400}
    .script-name,.couple-script,.eat{
      font-family:"Segoe Script","Brush Script MT","Snell Roundhand","URW Chancery L",cursive;
      font-weight:400
    }
    .tall-name,.course-dish,.reverse-title{
      font-family:"Baskerville","Iowan Old Style","Palatino Linotype","Book Antiqua",Georgia,serif
    }
    .table-name,.course-label{
      font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.22em;font-weight:600;color:var(--accent)
    }
    .guest-role{font-family:Georgia,serif;font-style:italic;color:var(--muted)}
    .heart{font-family:Georgia,serif;color:var(--ink);line-height:1}

    /* A4 sheet geometry is fixed — content flexes inside only */
    .tent-sheet{width:210mm;height:297mm;padding:4mm;gap:2mm;grid-template-columns:100mm 100mm;grid-template-rows:143.5mm 143.5mm}
    .tent-card{width:100mm;height:143.5mm}
    .tent-half{position:absolute;left:0;width:100mm;height:71.75mm;overflow:hidden}
    .tent-front{top:0;transform:rotate(180deg)}
    .tent-menu{bottom:0}
    .fold-rule{position:absolute;left:3mm;right:3mm;top:71.75mm;border-top:.16mm dashed #cfc6bd}

    /* TENT FRONT — intentionally simple */
    .tent-front-inner{height:100%;padding:6mm 9mm 5mm;display:flex;flex-direction:column;align-items:center;text-align:center}
    .front-logo{width:42mm;max-height:14mm;margin:0 auto 4mm}
    .front-name-wrap{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}
    .tent-front .script-name{font-size:25pt;line-height:1.02;max-width:82mm}
    .tent-front .script-name.long{font-size:21pt}.tent-front .script-name.very-long{font-size:18pt}
    .tent-front .heart{font-size:13pt;margin-top:2.2mm}
    .tent-front .table-name{font-size:5.8pt;margin-top:1.8mm}
    .tent-front .guest-role{font-size:6.3pt;margin-top:1mm}

    /* TENT REVERSE — stacked Starter / Main / Dessert / Evening */
    .tent-menu-inner{height:100%;padding:4mm 8mm 4mm;display:flex;flex-direction:column;text-align:center}
    .menu-logo{width:31mm;max-height:10mm;margin:0 auto 1.4mm}
    .reverse-title{font-size:9.2pt;font-style:italic;margin-bottom:1mm}
    .stacked-courses{flex:1;display:grid;grid-template-rows:repeat(4,minmax(0,1fr));align-items:stretch}
    .stacked-courses .course{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1mm 0;border-top:.12mm solid var(--rule)}
    .stacked-courses .course:first-child{border-top:0}
    .stacked-courses .course-label{font-size:4.3pt;margin-bottom:.55mm}
    .stacked-courses .course-dish{font-size:7.4pt;line-height:1.12;max-width:78mm;overflow-wrap:anywhere}
    .stacked-courses .course.long .course-dish{font-size:6.5pt}.stacked-courses .course.very-long .course-dish{font-size:5.7pt}
    .course-dish sup{font-size:5pt;color:var(--accent);font-weight:700;margin-left:.4mm}
    .wedding-note{font:italic 5pt/1.18 Georgia,serif;color:var(--muted);margin-top:1mm;overflow-wrap:anywhere}
    .wedding-note.long{font-size:4.6pt}.wedding-note.very-long{font-size:4.2pt}

    /* TALL MENU — reference-led wedding stationery */
    .menu-sheet{width:297mm;height:210mm;padding:4mm;gap:2mm;grid-template-columns:95mm 95mm 95mm;grid-template-rows:202mm}
    .tall-card{width:95mm;height:202mm}
    .tall-inner{height:100%;padding:7mm 8mm 6mm;display:flex;flex-direction:column;align-items:center;text-align:center}
    .tall-logo{width:46mm;max-height:16mm;margin:0 auto 3.5mm}
    .tall-name-block{width:100%}
    .tall-name{font-size:19pt;line-height:1.04;letter-spacing:-.02em;max-width:78mm;margin:0 auto}
    .tall-name.long{font-size:16pt}.tall-name.very-long{font-size:14pt}
    .small-heart{font-size:11pt;margin-top:2mm}
    .tall-card .table-name{font-size:5.4pt;margin-top:1.6mm}
    .tall-card .guest-role{font-size:6.3pt;margin-top:.8mm}

    .lets-eat{position:relative;width:58mm;height:24mm;margin:5mm auto 3mm;display:flex;align-items:center;justify-content:center}
    .lets{position:absolute;left:2mm;top:2.2mm;font-family:"Baskerville","Iowan Old Style",Georgia,serif;font-size:19pt;letter-spacing:.08em}
    .lets:after{content:"";position:absolute;width:20mm;height:.35mm;background:var(--ink);left:39mm;top:8mm}
    .eat{position:absolute;left:34mm;top:6.8mm;font-size:23pt;transform:rotate(-4deg);background:var(--paper);padding:0 1mm;line-height:1}

    .tall-courses{width:100%;flex:1;display:grid;grid-template-rows:repeat(4,minmax(0,1fr));align-items:stretch}
    .tall-courses .course{display:flex;flex-direction:column;align-items:center;justify-content:center;border-top:.12mm solid var(--rule);padding:1.5mm 0}
    .tall-courses .course:first-child{border-top:0}
    .tall-courses .course-label{font-size:5pt;margin-bottom:1mm}
    .tall-courses .course-dish{font-family:Arial,sans-serif;font-size:9pt;line-height:1.2;max-width:76mm;overflow-wrap:anywhere}
    .tall-courses .course.long .course-dish{font-size:8pt}.tall-courses .course.very-long .course-dish{font-size:7pt}
    .tall-card .wedding-note{width:100%;font-size:5.2pt;margin-top:2mm;padding-top:1.5mm;border-top:.12mm solid var(--rule)}
    .tall-card .wedding-note.long{font-size:4.8pt}.tall-card .wedding-note.very-long{font-size:4.4pt}

    .tall-footer{margin-top:3mm}
    .footer-heart{font-size:10pt}
    .couple-script{font-size:11pt;line-height:1.1;margin-top:1mm}
    .date-line{font:5.5pt Arial,sans-serif;letter-spacing:.18em;margin-top:.8mm;color:var(--muted)}

    @media print{
      html,body{background:#fff}
      .print-sheet{margin:0}
      ${format==='tent'?'@page{size:A4 portrait;margin:0}':'@page{size:A4 landscape;margin:0}'}
    }
  </style></head><body>${pages}
  <script>
    window.onload=()=>{
      const images=[...document.images];
      Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;})))
        .then(()=>setTimeout(()=>window.print(),220));
    };
  <\/script></body></html>`);
  win.document.close();
}
window.openWeddingGuestCardStudio=openWeddingGuestCardStudio;
window.printWeddingGuestCards=printWeddingGuestCards;

function renderWeddingFoodTotals(weddingId){
  const overall=weddingFoodChoiceTotals(weddingId);
  const plannedEvening=weddingPlannedEveningFoodTotals(weddingId);
  const byTable=weddingFoodTotalsForTables(weddingId);
  return `<section class="wvs-food-totals">
    <div class="wvs-food-head">
      <div><p class="text-xs font-bold tracking-widest text-olive-600">CHEF TABLE SHEETS</p><h4>Meal choices and allergens by table</h4><p>Table sheets use short service names for speed; the overall totals at the back retain the full official menu names.</p></div>
      <div class="flex gap-2 flex-wrap"><button onclick="openWeddingGuestCardStudio('${weddingId}')" class="secondary"><i data-lucide="badge"></i>Guest Place Cards</button><button onclick="printWeddingFoodTotals('${weddingId}')" class="secondary"><i data-lucide="printer"></i>Print Kitchen Service Pack</button></div>
    </div>
    <div class="wvs-table-food-details">
      <div class="wvs-table-food-section-head">
        <div><p class="text-xs font-bold tracking-widest text-olive-600">TABLE FOOD TOTALS</p><h5>Chef table sheets</h5></div>
        <span>${byTable.length} table group${byTable.length===1?'':'s'}</span>
      </div>
      <div class="wvs-table-food-grid">${byTable.map(item=>`<article class="wvs-table-food-card ${item.dietaryGuests?.length?'has-allergens':''}">
        <div class="wvs-table-food-title">
          <div><strong>${esc(item.table.tableName)}</strong><small>${item.guests.length} guest${item.guests.length===1?'':'s'}</small></div>
          <span>S ${item.totals.starter.reduce((n,x)=>n+x[1],0)} · M ${item.totals.main.reduce((n,x)=>n+x[1],0)} · D ${item.totals.dessert.reduce((n,x)=>n+x[1],0)}</span>
        </div>
        <div class="wvs-chef-course-list">
          <section><h6>Starters</h6>${renderFoodCountList(weddingShortFoodTotals(item.totals.starter))}</section>
          <section><h6>Mains</h6>${renderFoodCountList(weddingShortFoodTotals(item.totals.main))}</section>
          <section><h6>Desserts</h6>${renderFoodCountList(weddingShortFoodTotals(item.totals.dessert))}</section>
          ${item.totals.evening.length?`<section><h6>Evening Food</h6>${renderFoodCountList(weddingShortFoodTotals(item.totals.evening))}</section>`:''}
        </div>
        ${item.dietaryGuests?.length?`<div class="wvs-table-allergen-block">
          <div class="wvs-table-allergen-title">⚠ ALLERGENS / DIETARY ON THIS TABLE</div>
          ${item.dietaryGuests.map(g=>`<div class="wvs-table-allergen-row"><strong>${esc(g.guestName||'Guest')}</strong><span>${esc([g.dietaryRequirements,g.accessibilityNotes].filter(Boolean).join(' · '))}</span></div>`).join('')}
        </div>`:`<div class="wvs-table-clear">✓ No dietary / allergy notes recorded</div>`}
      </article>`).join('')}</div>
    </div>
    <div class="wvs-overall-back-sheet">
      <div class="wvs-table-food-section-head"><div><p class="text-xs font-bold tracking-widest text-olive-600">OVERALL FOOD TOTALS</p><h5>Final kitchen check</h5></div><span>${overall.guests} guests · ${overall.dietary} dietary/allergy notes</span></div>
      <div class="wvs-food-overall">
        <div class="wvs-food-course"><h5>Starters</h5>${renderFoodCountList(overall.starter)}</div>
        <div class="wvs-food-course"><h5>Mains</h5>${renderFoodCountList(overall.main)}</div>
        <div class="wvs-food-course"><h5>Desserts</h5>${renderFoodCountList(overall.dessert)}</div>
        <div class="wvs-food-course"><h5>Evening Buffet</h5>${renderFoodCountList(plannedEvening)}${renderWeddingEveningAllergySummary(weddingId,'screen')}</div>
      </div>
    </div>
  </section>`;
}
function printWeddingFoodTotals(weddingId){
  const wedding=DB.weddings.find(x=>x.id===weddingId);
  const overall=weddingFoodChoiceTotals(weddingId);
  const plannedEvening=weddingPlannedEveningFoodTotals(weddingId);
  const byTable=weddingFoodTotalsForTables(weddingId);
  const list=items=>items.length?items.map(([name,count])=>`<tr><td>${esc(name)}</td><td>${count}</td></tr>`).join(''):'<tr><td colspan="2">No choices recorded</td></tr>';

  const shortList=items=>list(weddingShortFoodTotals(items));
  const guestShort=value=>esc(weddingChefShortFoodName(value)||'—');
  const guestEveningFood=g=>esc(weddingGuestPlannedEveningFood(weddingId,g)||'—');

  const tableCard=item=>`<section class="table-card ${item.dietaryGuests?.length?'alert-table':''}">
    <div class="table-title"><h3>${esc(item.table.tableName)}</h3><strong>${item.guests.length} guests</strong></div>
    <div class="courses">
      <div><strong>Starters</strong><table>${shortList(item.totals.starter)}</table></div>
      <div><strong>Mains</strong><table>${shortList(item.totals.main)}</table></div>
      <div><strong>Desserts</strong><table>${shortList(item.totals.dessert)}</table></div>
    </div>
    ${item.totals.evening.length?`<div class="evening"><strong>Evening Food</strong><table>${shortList(item.totals.evening)}</table></div>`:''}
    ${item.dietaryGuests?.length?`<div class="dietary"><strong>⚠ ALLERGENS / DIETARY</strong>${item.dietaryGuests.map(g=>`<div class="diet-row"><b>${esc(g.guestName||'Guest')}</b><span>${esc([g.dietaryRequirements,g.accessibilityNotes].filter(Boolean).join(' · '))}</span></div>`).join('')}</div>`:'<div class="clear">✓ No dietary / allergy notes recorded</div>'}
  </section>`;

  const individualTable=item=>`<section class="individual-table">
    <div class="individual-title">
      <div><span>TABLE</span><h3>${esc(item.table.tableName)}</h3></div>
      <strong>${item.guests.length} guests</strong>
    </div>
    <table class="guest-choice-table">
      <thead><tr><th>Guest</th><th>Starter</th><th>Main</th><th>Dessert</th><th>Evening Food</th><th>Allergens / Dietary</th></tr></thead>
      <tbody>
        ${item.guests.map(g=>{
          const dietary=[g.dietaryRequirements,g.accessibilityNotes].filter(Boolean).join(' · ');
          return `<tr class="${dietary?'guest-alert':''}">
            <td><strong>${esc(g.guestName||'Guest')}</strong>${g.guestType&&g.guestType!=='Adult'?`<small>${esc(g.guestType)}</small>`:''}</td>
            <td>${guestShort(g.starterChoice)}</td>
            <td>${guestShort(g.mainChoice)}</td>
            <td>${guestShort(g.dessertChoice)}</td>
            <td class="${g.dietaryRequirements?'evening-food-alert':''}">${guestEveningFood(g)}</td>
            <td>${dietary?`<strong class="allergen-text">⚠ ${esc(dietary)}</strong>`:'—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </section>`;

  // First two pages are always the table-total service sheets.
  const split=Math.ceil(byTable.length/2);
  const firstHalf=byTable.slice(0,split),secondHalf=byTable.slice(split);

  // Individual guest sheets are grouped two tables per page for easy kitchen/service use.
  const individualPages=[];
  for(let i=0;i<byTable.length;i+=2)individualPages.push(byTable.slice(i,i+2));

  const overallPage=`<section class="page overall-page">
    <div class="top"><div><div class="brand">THE GRANARY AT WINDMILL FARM · KITCHEN SERVICE PACK</div><h1>${esc(wedding?.couple||'Wedding')}</h1><div class="section-label">OVERALL FOOD TOTALS</div></div><div class="meta">${esc(wedding?.date||'')}<br>${overall.guests} guests<br>Kitchen summary</div></div>
    <div class="overall-intro">Full official menu names are retained on this page for the final kitchen check.</div>
    <div class="overall-main-grid">
      <div class="overall-large"><h2>Starters</h2><table>${list(overall.starter)}</table></div>
      <div class="overall-large"><h2>Mains</h2><table>${list(overall.main)}</table></div>
      <div class="overall-large"><h2>Desserts</h2><table>${list(overall.dessert)}</table></div>
      <div class="overall-large evening-summary-box"><h2>Evening Buffet</h2><table>${list(plannedEvening)}</table>${renderWeddingEveningAllergySummary(weddingId,'print')}</div>
    </div>
    <div class="overall-summary"><strong>${overall.guests} guests</strong><span>${overall.dietary} dietary / allergy notes</span><span>${byTable.filter(x=>x.table.id!=='unassigned').length} tables</span></div>
    <div class="footer"><span>Overall food totals · official menu names</span><span>Kitchen Service Pack</span></div>
  </section>`;

  const individualHtml=individualPages.map((group,index)=>`<section class="page individual-page">
    <div class="top"><div><div class="brand">THE GRANARY AT WINDMILL FARM · KITCHEN SERVICE PACK</div><h1>${esc(wedding?.couple||'Wedding')}</h1><div class="section-label">INDIVIDUAL GUEST FOOD CHOICES</div></div><div class="meta">${esc(wedding?.date||'')}<br>Tables in service order<br>Guest sheet ${index+1} of ${individualPages.length}</div></div>
    <div class="individual-stack">${group.map(individualTable).join('')}</div>
    <div class="footer"><span>Starter / main / dessert are guest choices · evening food inherited from Wedding Planning · allergens shown per guest</span><span>Guest sheet ${index+1} of ${individualPages.length}</span></div>
  </section>`).join('');

  const win=window.open('','_blank');
  if(!win)return toast('Allow pop-ups to print kitchen service pack','error');
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Kitchen Service Pack - ${esc(wedding?.couple||'Wedding')}</title><style>
    *{box-sizing:border-box}body{font-family:Arial;margin:0;color:#242a23;background:#eee}.page{width:210mm;height:297mm;padding:10mm 12mm 8mm;margin:auto;background:white;page-break-after:always;overflow:hidden;display:flex;flex-direction:column}.page:last-child{page-break-after:auto}
    .brand{font-size:7pt;letter-spacing:.18em;color:#5f793f;font-weight:800}.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #dfe4da;padding-bottom:2.5mm;margin-bottom:3mm}.top h1{font-family:Georgia;font-weight:400;font-size:19pt;margin:1mm 0 0}.top .meta{text-align:right;font-size:7pt;color:#667064;line-height:1.35}.section-label{font-size:6.5pt;letter-spacing:.16em;font-weight:900;color:#5f793f;margin-top:1.5mm}
    .table-stack{display:grid;grid-template-columns:1fr 1fr;gap:3mm;align-content:start}.table-card{border:1px solid #dfe4da;border-left:4px solid #5f793f;border-radius:5px;padding:2.7mm;break-inside:avoid}.table-card.alert-table{border-left-color:#b33a2f}.table-title{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e3e6df;padding-bottom:1.4mm;margin-bottom:1.8mm}.table-title h3{font:400 11pt Georgia;margin:0}.table-title>strong{font-size:7pt}.courses{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm}.courses>div>strong,.evening>strong{font-size:6.2pt;text-transform:uppercase;letter-spacing:.04em;color:#5b6658}table{width:100%;border-collapse:collapse;font-size:6.5pt}td{padding:.8mm 0;border-bottom:1px solid #ecefe9;vertical-align:top}td:last-child{text-align:right;font-weight:800;width:7mm}.evening{margin-top:1.6mm;padding-top:1.3mm;border-top:1px solid #e6e8e3}.dietary{margin-top:2mm;padding:1.7mm;background:#fff0ed;border:1px solid #e4b3aa;font-size:6.3pt}.dietary>strong{display:block;color:#922f27;margin-bottom:.8mm}.diet-row{display:grid;grid-template-columns:25mm 1fr;gap:1.6mm;padding:.7mm 0;border-top:1px solid #efd0ca}.diet-row:first-of-type{border-top:0}.diet-row b{color:#7d2922}.clear{margin-top:1.7mm;padding:1.5mm;background:#eef6eb;color:#3d6236;font-size:6.1pt}
    .overall-intro{font-size:8pt;color:#687167;margin-bottom:4mm}.overall-main-grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm;align-content:start}.overall-large{border:1px solid #dfe4da;border-radius:6px;padding:4mm;break-inside:avoid}.overall-large h2{font:400 14pt Georgia;margin:0 0 2.5mm}.overall-large table{font-size:8.2pt}.overall-large td{padding:1.5mm 0}.overall-evening-allergies{margin-top:4mm;padding-top:3mm;border-top:1px solid #e4bbb3;color:#8f3027;font-size:7pt;line-height:1.45}.overall-evening-allergies>strong{display:block;font-size:6.3pt;letter-spacing:.05em;margin-bottom:1.5mm}.overall-evening-allergies>div{padding:.7mm 0}.overall-summary{margin-top:5mm;padding:3mm 4mm;background:#f3f6ef;border:1px solid #dce4d7;border-radius:6px;display:flex;justify-content:flex-end;gap:7mm;font-size:7.5pt;color:#687167}.overall-summary strong{color:#34402f}
    .individual-stack{display:flex;flex-direction:column;gap:5mm;min-height:0}.individual-table{border:1px solid #d8dfd4;border-left:4px solid #5f793f;border-radius:6px;padding:3.5mm;break-inside:avoid}.individual-title{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid #e1e6de;padding-bottom:2mm;margin-bottom:2mm}.individual-title span{font-size:5.8pt;letter-spacing:.15em;color:#5f793f;font-weight:900}.individual-title h3{font:400 14pt Georgia;margin:.5mm 0 0}.individual-title>strong{font-size:7pt}.guest-choice-table{font-size:7.4pt;table-layout:fixed}.guest-choice-table th{text-align:left;font-size:5.8pt;text-transform:uppercase;letter-spacing:.05em;color:#687167;padding:1.5mm 1mm;border-bottom:1px solid #cfd7cb}.guest-choice-table th:nth-child(1){width:17%}.guest-choice-table th:nth-child(2),.guest-choice-table th:nth-child(3),.guest-choice-table th:nth-child(4){width:13%}.guest-choice-table th:nth-child(5){width:22%}.guest-choice-table th:nth-child(6){width:22%}.guest-choice-table td{padding:1.5mm 1mm;border-bottom:1px solid #e7ebe4;text-align:left!important;font-weight:400!important;width:auto!important;line-height:1.25}.guest-choice-table td strong{font-weight:800}.guest-choice-table td small{display:block;font-size:5.6pt;color:#7c8479;margin-top:.4mm}.guest-choice-table tr.guest-alert{background:#fff4f1}.allergen-text{color:#8f3027;font-size:6.7pt}.evening-food-alert{color:#8f3027;font-weight:800!important}
    .footer{margin-top:auto;border-top:1px solid #ddd;padding-top:1.8mm;font-size:6pt;color:#777;display:flex;justify-content:space-between}
    @media print{body{background:white}.page{margin:0}@page{size:A4;margin:0}}
  </style></head><body>
    <section class="page">
      <div class="top"><div><div class="brand">THE GRANARY AT WINDMILL FARM · KITCHEN SERVICE PACK</div><h1>${esc(wedding?.couple||'Wedding')}</h1><div class="section-label">TABLE FOOD TOTALS</div></div><div class="meta">${esc(wedding?.date||'')}<br>${overall.guests} guests<br>Page 1 of 2</div></div>
      <div class="table-stack">${firstHalf.map(tableCard).join('')}</div>
      <div class="footer"><span>Table totals · short chef names · allergens by table</span><span>Table totals 1 of 2</span></div>
    </section>
    <section class="page">
      <div class="top"><div><div class="brand">THE GRANARY AT WINDMILL FARM · KITCHEN SERVICE PACK</div><h1>${esc(wedding?.couple||'Wedding')}</h1><div class="section-label">TABLE FOOD TOTALS</div></div><div class="meta">${esc(wedding?.date||'')}<br>${overall.guests} guests<br>Page 2 of 2</div></div>
      <div class="table-stack">${secondHalf.map(tableCard).join('')}</div>
      <div class="footer"><span>Table totals · short chef names · allergens by table</span><span>Table totals 2 of 2</span></div>
    </section>
    ${overallPage}
    ${individualHtml}
    <script>window.onload=()=>setTimeout(()=>window.print(),200)<\/script>
  </body></html>`);
  win.document.close();
}
window.printWeddingFoodTotals=printWeddingFoodTotals;

function renderWeddingSeatingPlanner(wedding){
  if(!weddingSeatingTablesReady){
    return `<div class="bg-amber-50 border border-amber-200 rounded-xl p-5"><h3 class="font-bold">Seating Planner setup required</h3><p class="text-sm text-gray-600 mt-1">Run the seating planner SQL in Supabase, then refresh.</p></div>`;
  }
  const tables=seatingTablesFor(wedding.id);
  const guests=weddingGuestsFor(wedding.id);
  const summary=seatingSummary(wedding.id);
  const filters=[
    ['all','All',guests.length],['unassigned','Unassigned',summary.unassigned],
    ['seated','Seated',summary.assigned],['dietary','Dietary',guests.filter(g=>g.dietaryRequirements).length],
    ['children','Children',guests.filter(g=>['Child','Infant'].includes(g.guestType)).length]
  ];
  setTimeout(()=>{
    WeddingVisualSeating.initialiseTableDragging(wedding.id);
    WeddingVisualSeating.refreshGuestPanel(wedding.id);
  },0);

  return `<div class="wvs-shell">
    <section class="wvs-header">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">VISUAL SEATING PLAN</p>
        <h3>Build the room by dragging guests and tables</h3>
        <p>Use the visual plan for seating, and keep the guest list for checking meals and dietary requirements.</p>
      </div>
      <div class="wvs-header-actions">
        <button onclick="openWeddingGuestImport('${wedding.id}')" class="secondary"><i data-lucide="file-up"></i>Import CSV</button>
        <button onclick="printWeddingSeatingPlan('${wedding.id}')" class="secondary"><i data-lucide="printer"></i>Print</button>
        <button onclick="openWeddingGuestForm('${wedding.id}')" class="secondary"><i data-lucide="user-plus"></i>Add Guest Manually</button>
        <button onclick="openWeddingSeatingTableForm('${wedding.id}')" class="primary"><i data-lucide="plus"></i>Add Table</button>
      </div>
    </section>

    <section class="wvs-quick-add">
      <div class="wvs-quick-add-heading">
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">QUICK MANUAL ENTRY</p>
          <h4>Add one guest without uploading a file</h4>
        </div>
        <button onclick="openWeddingGuestImport('${wedding.id}')" class="wvs-import-link"><i data-lucide="file-up"></i>Import a full CSV instead</button>
      </div>
      <form onsubmit="WeddingVisualSeating.quickAddGuest(event,'${wedding.id}')" class="wvs-quick-add-grid">
        <label class="guest-name"><span>Guest name *</span><input required name="guestName" placeholder="e.g. James Smith"></label>
        <label><span>Guest type</span><select name="guestType">${['Adult','Child','Infant','Supplier'].map(value=>`<option>${value}</option>`).join('')}</select></label>
        <label><span>Table</span><select name="tableId"><option value="">Unassigned</option>${tables.map(table=>`<option value="${table.id}">${esc(table.tableName)}</option>`).join('')}</select></label>
        <label><span>Starter</span><input name="starterChoice" placeholder="Starter choice"></label>
        <label><span>Main</span><input name="mainChoice" placeholder="Main choice"></label>
        <label><span>Dessert</span><input name="dessertChoice" placeholder="Dessert choice"></label>
        <label class="dietary"><span>Allergies / dietary</span><input name="dietaryRequirements" placeholder="e.g. NGCI, nut allergy"></label>
        <button class="wvs-quick-add-button"><i data-lucide="plus"></i>Add Guest</button>
      </form>
      <p class="wvs-quick-add-note">For evening food, accessibility or extra notes, use <strong>Add Guest Manually</strong> above to open the full form.</p>
    </section>

    <section class="wvs-controls">
      <div class="wvs-zoom">
        <button onclick="WeddingVisualSeating.changeZoom(-10,'${wedding.id}')"><i data-lucide="minus"></i></button>
        <span id="wvs-zoom-label">${WeddingVisualSeating.zoom}%</span>
        <button onclick="WeddingVisualSeating.changeZoom(10,'${wedding.id}')"><i data-lucide="plus"></i></button>
      </div>
      <button onclick="WeddingVisualSeating.toggleGrid('${wedding.id}')" class="${WeddingVisualSeating.grid?'active':''}"><i data-lucide="grid-3x3"></i>Grid</button>
      <button onclick="WeddingVisualSeating.toggleSnap('${wedding.id}')" class="${WeddingVisualSeating.snap?'active':''}"><i data-lucide="magnet"></i>Snap</button>
      <span class="wvs-control-help"><i data-lucide="mouse-pointer-2"></i>Drag a guest onto a table; drag the table centre to reposition it.</span>
    </section>

    <section class="wvs-layout">
      <div class="wvs-room-window">
        <div id="wvs-room-canvas" class="wvs-room-canvas ${WeddingVisualSeating.grid?'grid-on':''}">
          <div id="wvs-room" class="wvs-room" style="transform:scale(${WeddingVisualSeating.zoom/100})">
            <div class="wvs-room-label kitchen">KITCHEN</div>
            <div class="wvs-room-label bar">BAR</div>
            <div class="wvs-room-label cake">CAKE</div>
            <div class="wvs-room-label entrance">ENTRANCE</div>
            <div class="wvs-dance-floor"><span>DANCE FLOOR</span></div>
            ${tables.map((table,index)=>WeddingVisualSeating.renderTable(table,index,wedding.id)).join('')}
            ${!tables.length?`<button onclick="openWeddingSeatingTableForm('${wedding.id}')" class="wvs-add-first"><i data-lucide="plus-circle"></i><strong>Add your first table</strong><span>Then drag it into position.</span></button>`:''}
          </div>
        </div>
        <div class="wvs-summary">
          <div><i data-lucide="users"></i><strong>${summary.total}</strong><span>Total Guests</span></div>
          <div><i data-lucide="user-check"></i><strong>${summary.assigned}</strong><span>Seated</span></div>
          <div><i data-lucide="user-x"></i><strong>${summary.unassigned}</strong><span>Unassigned</span></div>
          <div><i data-lucide="utensils"></i><strong>${guests.filter(g=>g.dietaryRequirements).length}</strong><span>Dietary</span></div>
          <div><i data-lucide="armchair"></i><strong>${tables.length}</strong><span>Tables</span></div>
        </div>
      </div>

      <aside class="wvs-guests">
        <div class="wvs-guest-tabs"><strong>Guests</strong><button onclick="openWeddingSeatingTableForm('${wedding.id}')">Tables</button></div>
        <div class="wvs-guest-search"><i data-lucide="search"></i><input oninput="WeddingVisualSeating.setSearch(this.value,'${wedding.id}')" placeholder="Search guests…" value="${esc(WeddingVisualSeating.guestSearch)}"></div>
        <div class="wvs-filter-pills">${filters.map(([id,label,count])=>`<button onclick="WeddingVisualSeating.setGuestFilter('${id}','${wedding.id}')" class="${WeddingVisualSeating.guestFilter===id?'active':''}">${label}<span>${count}</span></button>`).join('')}</div>
        <div id="visual-seating-guest-list" class="wvs-guest-list"></div>
        <div id="wvs-unassigned-drop" class="wvs-unassigned-drop"><i data-lucide="user-minus"></i>Drop here to unassign a guest</div>
      </aside>
    </section>
    ${renderWeddingFoodTotals(wedding.id)}
  </div>`;
}


WeddingVisualSeating.quickAddGuest=async function(event,weddingId){
  event.preventDefault();
  const form=event.currentTarget;
  const data=new FormData(form);
  const record={
    wedding_id:weddingId,
    guest_name:String(data.get('guestName')||'').trim(),
    guest_type:data.get('guestType')||'Adult',
    table_id:data.get('tableId')||null,
    starter_choice:String(data.get('starterChoice')||'').trim()||null,
    main_choice:String(data.get('mainChoice')||'').trim()||null,
    dessert_choice:String(data.get('dessertChoice')||'').trim()||null,
    dietary_requirements:String(data.get('dietaryRequirements')||'').trim()||null
  };
  if(!record.guest_name)return toast('Enter the guest name','error');

  if(record.table_id){
    const table=(DB.weddingSeatingTables||[]).find(item=>item.id===record.table_id);
    if(table&&guestsAtTable(table.id).length>=Number(table.capacity||0)){
      if(!confirm(`${table.tableName} is at capacity. Add this guest anyway?`))return;
    }
  }

  const {error}=await supabaseClient.from('wedding_guests').insert(record);
  if(error){
    console.error('Quick guest add failed:',error);
    toast(`Guest could not be added: ${error.message||'Unknown error'}`,'error');
    return;
  }

  await addWeddingTimelineEntry(weddingId,'Planning','Wedding guest added manually',record.guest_name);
  form.reset();
  await loadWeddingsFromSupabase();
  renderWeddingWorkspace();
  toast(`${record.guest_name} added`);
};

WeddingVisualSeating.parseCSV=function(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let index=0;index<text.length;index++){
    const char=text[index],next=text[index+1];
    if(char==='"'){
      if(quoted&&next==='"'){field+='"';index++;}
      else quoted=!quoted;
    }else if(char===','&&!quoted){row.push(field);field='';}
    else if((char==='\n'||char==='\r')&&!quoted){
      if(char==='\r'&&next==='\n')index++;
      row.push(field);field='';
      if(row.some(cell=>String(cell).trim()!==''))rows.push(row);
      row=[];
    }else field+=char;
  }
  row.push(field);if(row.some(cell=>String(cell).trim()!==''))rows.push(row);
  return rows;
};

WeddingVisualSeating.normaliseHeader=function(value){
  return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
};

WeddingVisualSeating.suggestField=function(header){
  const value=WeddingVisualSeating.normaliseHeader(header);
  const rules=[
    ['guestName',/^(guest|guest name|name|full name|attendee|person|customer)$/],
    ['firstName',/first name|forename/],['lastName',/last name|surname|family name/],
    ['guestType',/guest type|type|adult child|age group/],
    ['tableName',/table|table name|table number|seating group/],
    ['starterChoice',/starter/],['mainChoice',/main|main course|meal choice/],
    ['dessertChoice',/dessert|pudding/],['eveningFoodChoice',/evening food|evening meal/],
    ['dietaryRequirements',/diet|allerg|intolerance|food requirement/],
    ['accessibilityNotes',/access|wheelchair|mobility/],['notes',/note|comment|additional/]
  ];
  return rules.find(([,pattern])=>pattern.test(value))?.[0]||'ignore';
};

WeddingVisualSeating.fieldOptions=[
  ['ignore','Do not import'],['guestName','Full Name'],['firstName','First Name'],['lastName','Last Name'],
  ['guestType','Guest Type'],['tableName','Assigned Table'],['starterChoice','Starter'],
  ['mainChoice','Main Course'],['dessertChoice','Dessert'],['eveningFoodChoice','Evening Food'],
  ['dietaryRequirements','Dietary / Allergies'],['accessibilityNotes','Accessibility'],['notes','Notes']
];


WeddingVisualSeating.setImportFullscreen=function(){
  const overlay=document.getElementById('modal-overlay');
  const content=document.getElementById('modal-content');
  if(overlay){
    overlay.classList.remove('p-4');
    overlay.classList.add('p-2','md:p-4');
  }
  if(content){
    content.className='bg-white rounded-2xl shadow-2xl w-[98vw] h-[96vh] max-w-none max-h-none overflow-y-auto';
    content.style.width='98vw';
    content.style.height='96vh';
    content.style.maxWidth='98vw';
    content.style.maxHeight='96vh';
  }
};
function openWeddingGuestImport(weddingId){
  WeddingVisualSeating.importWeddingId=weddingId;
  WeddingVisualSeating.importRows=[];WeddingVisualSeating.importHeaders=[];WeddingVisualSeating.importMapping={};
  openModal(`<div class="p-6 w-full">
    <div class="flex justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">FLEXIBLE CSV IMPORT</p><h2 class="text-xl font-bold mt-1">Upload Wedding Guest List</h2><p class="text-sm text-gray-500 mt-1">The file does not need to use the same headings each time. You will map the columns before importing.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <label class="wvs-upload-zone mt-5"><i data-lucide="file-spreadsheet"></i><strong>Choose CSV file</strong><span>CSV exported from Bridebook, Excel, Google Sheets or another system</span><input type="file" accept=".csv,text/csv" onchange="WeddingVisualSeating.readCSVFile(this.files[0])"></label>
    <div class="mt-4 text-xs text-gray-500">You can also export an Excel file as CSV before uploading. The importer supports quoted commas and varied column names.</div>
  </div>`);
  WeddingVisualSeating.setImportFullscreen();
}

WeddingVisualSeating.readCSVFile=function(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    const rows=WeddingVisualSeating.parseCSV(String(reader.result||''));
    if(rows.length<2)return toast('The CSV does not contain guest rows','error');
    WeddingVisualSeating.importHeaders=rows[0].map((cell,index)=>String(cell||`Column ${index+1}`).trim()||`Column ${index+1}`);
    WeddingVisualSeating.importRows=rows.slice(1);
    WeddingVisualSeating.importMapping={};
    WeddingVisualSeating.importHeaders.forEach((header,index)=>WeddingVisualSeating.importMapping[index]=WeddingVisualSeating.suggestField(header));
    WeddingVisualSeating.renderMapping();
  };
  reader.readAsText(file);
};

WeddingVisualSeating.renderMapping=function(){
  const headers=WeddingVisualSeating.importHeaders,rows=WeddingVisualSeating.importRows;
  const preview=rows.slice(0,5);
  const suggestedName=Object.values(WeddingVisualSeating.importMapping).includes('guestName')||
    (Object.values(WeddingVisualSeating.importMapping).includes('firstName')&&Object.values(WeddingVisualSeating.importMapping).includes('lastName'));
  const content=document.getElementById('modal-content');
  if(!content)return;
  content.innerHTML=`<div class="p-6 w-full min-w-0">
    <div class="flex justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">STEP 2 OF 3</p><h2 class="text-xl font-bold mt-1">Match the CSV columns</h2><p class="text-sm text-gray-500 mt-1">${rows.length} data rows detected. Confirm what each column means.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <div class="wvs-mapping-grid mt-5">${headers.map((header,index)=>`<label><span>CSV: ${esc(header)}</span><select onchange="WeddingVisualSeating.importMapping[${index}]=this.value;WeddingVisualSeating.updateImportReadiness()">${WeddingVisualSeating.fieldOptions.map(([value,label])=>`<option value="${value}" ${WeddingVisualSeating.importMapping[index]===value?'selected':''}>${label}</option>`).join('')}</select><small>${esc(preview.map(row=>row[index]||'').filter(Boolean).slice(0,2).join(' · ')||'No sample data')}</small></label>`).join('')}</div>
    <div class="overflow-x-auto mt-5"><table class="wvs-preview-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${preview.map(row=>`<tr>${headers.map((_,index)=>`<td>${esc(row[index]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="flex items-center justify-between gap-3 mt-5"><p id="wvs-import-readiness" class="${suggestedName?'text-green-700':'text-red-700'} text-sm font-semibold">${suggestedName?'Ready to preview':'Map a full name, or both first and last name.'}</p><button id="wvs-preview-import" onclick="WeddingVisualSeating.previewImport()" ${suggestedName?'':'disabled'} class="px-5 py-2.5 bg-olive-700 text-white rounded-lg font-semibold disabled:opacity-40">Preview Import</button></div>
  </div>`;
  WeddingVisualSeating.setImportFullscreen();
  if(window.lucide)lucide.createIcons();
};

WeddingVisualSeating.updateImportReadiness=function(){
  const values=Object.values(WeddingVisualSeating.importMapping);
  const ready=values.includes('guestName')||(values.includes('firstName')&&values.includes('lastName'));
  const message=document.getElementById('wvs-import-readiness'),button=document.getElementById('wvs-preview-import');
  if(message){message.textContent=ready?'Ready to preview':'Map a full name, or both first and last name.';message.className=`${ready?'text-green-700':'text-red-700'} text-sm font-semibold`;}
  if(button)button.disabled=!ready;
};

WeddingVisualSeating.mappedRows=function(){
  const tables=seatingTablesFor(WeddingVisualSeating.importWeddingId);
  return WeddingVisualSeating.importRows.map((source,rowIndex)=>{
    const item={source,rowIndex,guestName:'',firstName:'',lastName:'',guestType:'Adult',tableName:'',starterChoice:'',mainChoice:'',dessertChoice:'',eveningFoodChoice:'',dietaryRequirements:'',accessibilityNotes:'',notes:''};
    Object.entries(WeddingVisualSeating.importMapping).forEach(([index,field])=>{
      if(field==='ignore')return;
      item[field]=String(source[Number(index)]||'').trim();
    });
    if(!item.guestName)item.guestName=`${item.firstName} ${item.lastName}`.trim();
    item.table=tables.find(t=>WeddingVisualSeating.normaliseHeader(t.tableName)===WeddingVisualSeating.normaliseHeader(item.tableName));
    return item;
  });
};

WeddingVisualSeating.previewImport=function(){
  const rows=WeddingVisualSeating.mappedRows();
  const existing=weddingGuestsFor(WeddingVisualSeating.importWeddingId).map(g=>WeddingVisualSeating.normaliseHeader(g.guestName));
  rows.forEach(row=>row.duplicate=existing.includes(WeddingVisualSeating.normaliseHeader(row.guestName)));
  const valid=rows.filter(r=>r.guestName),duplicates=rows.filter(r=>r.duplicate),missing=rows.filter(r=>!r.guestName);
  const unmapped=rows.filter(r=>r.tableName&&!r.table);
  const content=document.getElementById('modal-content');
  content.innerHTML=`<div class="p-6 w-full min-w-0">
    <div class="flex justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">STEP 3 OF 3</p><h2 class="text-xl font-bold mt-1">Check before importing</h2><p class="text-sm text-gray-500 mt-1">Nothing has been saved yet.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <div class="grid sm:grid-cols-4 gap-3 mt-5">
      <div class="wvs-import-stat"><strong>${valid.length}</strong><span>Ready</span></div>
      <div class="wvs-import-stat amber"><strong>${duplicates.length}</strong><span>Possible duplicates</span></div>
      <div class="wvs-import-stat red"><strong>${missing.length}</strong><span>Missing names</span></div>
      <div class="wvs-import-stat amber"><strong>${unmapped.length}</strong><span>Unknown tables</span></div>
    </div>
    <div class="wvs-import-preview-list mt-5">${rows.slice(0,100).map((row,index)=>`<label class="${!row.guestName?'invalid':row.duplicate?'duplicate':''}"><input type="checkbox" data-import-row="${index}" ${row.guestName&&!row.duplicate?'checked':''} ${!row.guestName?'disabled':''}><span><strong>${esc(row.guestName||'Missing guest name')}</strong><small>${esc(row.guestType||'Adult')}${row.tableName?` · ${esc(row.tableName)}${row.table?'':' (table not found)'}`:''}${row.dietaryRequirements?` · ⚠ ${esc(row.dietaryRequirements)}`:''}</small></span><em>${row.duplicate?'Possible duplicate':!row.guestName?'Invalid':'Ready'}</em></label>`).join('')}</div>
    <div class="flex justify-end gap-2 mt-5"><button onclick="WeddingVisualSeating.renderMapping()" class="px-4 py-2.5 bg-gray-100 rounded-lg font-semibold">Back</button><button onclick="WeddingVisualSeating.commitImport()" class="px-5 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Import Selected Guests</button></div>
  </div>`;
  WeddingVisualSeating.setImportFullscreen();
  if(window.lucide)lucide.createIcons();
};

WeddingVisualSeating.commitImport=async function(){
  const mapped=WeddingVisualSeating.mappedRows();
  const selected=[...document.querySelectorAll('[data-import-row]:checked')].map(input=>mapped[Number(input.dataset.importRow)]).filter(Boolean);
  if(!selected.length)return toast('Select at least one guest','error');
  const records=selected.map(row=>({
    wedding_id:WeddingVisualSeating.importWeddingId,
    guest_name:row.guestName,
    guest_type:row.guestType||'Adult',
    table_id:row.table?.id||null,
    starter_choice:row.starterChoice||null,
    main_choice:row.mainChoice||null,
    dessert_choice:row.dessertChoice||null,
    evening_food_choice:row.eveningFoodChoice||null,
    dietary_requirements:row.dietaryRequirements||null,
    accessibility_notes:row.accessibilityNotes||null,
    notes:row.notes||null
  }));
  const {error}=await supabaseClient.from('wedding_guests').insert(records);
  if(error){console.error(error);toast('Guests could not be imported','error');return;}
  await addWeddingTimelineEntry(WeddingVisualSeating.importWeddingId,'Planning','Wedding CSV guest list imported',`${records.length} guests`);
  closeModal();await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(`${records.length} guests imported`);
};

(function injectWeddingVisualSeatingStyles(){
  if(document.getElementById('wedding-visual-seating-styles'))return;
  const style=document.createElement('style');
  style.id='wedding-visual-seating-styles';
  style.textContent=`
  .wvs-shell{display:flex;flex-direction:column;gap:12px}.wvs-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;padding:17px;border:1px solid #e2e8de;border-radius:16px;background:#fff}.wvs-header h3{font-size:1.25rem;font-weight:850}.wvs-header p:last-child{font-size:.76rem;color:#778175;margin-top:3px}.wvs-header-actions{display:flex;gap:7px;flex-wrap:wrap}.wvs-header-actions button{display:flex;align-items:center;gap:6px;padding:9px 11px;border-radius:9px;font-size:.69rem;font-weight:800}.wvs-header-actions svg{width:15px;height:15px}.wvs-header-actions .secondary{background:#f0f3ed;color:#52654b}.wvs-header-actions .primary{background:#5e793e;color:#fff}
  .wvs-controls{display:flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid #e2e8de;border-radius:13px;background:#fff}.wvs-controls>button,.wvs-zoom{display:flex;align-items:center;gap:6px;height:34px;padding:0 9px;border-radius:8px;background:#f1f4ee;color:#606c5d;font-size:.63rem;font-weight:800}.wvs-controls>button.active{background:#5f793f;color:#fff}.wvs-controls svg{width:14px;height:14px}.wvs-zoom button{width:23px;height:23px;display:grid;place-items:center}.wvs-control-help{margin-left:auto;display:flex;align-items:center;gap:5px;font-size:.58rem;color:#858e82}
  .wvs-layout{display:grid;grid-template-columns:minmax(0,1fr) 350px;gap:12px;min-height:680px}.wvs-room-window,.wvs-guests{border:1px solid #e1e7dd;border-radius:16px;background:#fff;overflow:hidden}.wvs-room-window{display:flex;flex-direction:column}.wvs-room-canvas{position:relative;flex:1;min-height:590px;overflow:auto;background:#f7f8f6}.wvs-room-canvas.grid-on{background-image:radial-gradient(#d1d8cb 1px,transparent 1px);background-size:18px 18px}.wvs-room{position:relative;width:100%;height:590px;transform-origin:center center;transition:transform .15s}.wvs-room:before{content:"";position:absolute;inset:26px;border:4px solid #9aa39a;border-radius:3px;pointer-events:none}.wvs-room-label{position:absolute;z-index:2;padding:7px 9px;background:#abb0aa;color:#fff;font-size:.58rem;font-weight:850;letter-spacing:.08em}.wvs-room-label.kitchen{top:26px;left:36%;right:36%;text-align:center}.wvs-room-label.bar{left:26px;top:40%;writing-mode:vertical-rl}.wvs-room-label.cake{right:26px;top:40%;writing-mode:vertical-rl}.wvs-room-label.entrance{bottom:26px;left:43%;right:43%;text-align:center}.wvs-dance-floor{position:absolute;left:36%;top:42%;width:28%;height:27%;border:2px dashed #c5ccc0;border-radius:8px;background:rgba(255,255,255,.65);display:grid;place-items:center;color:#899186;font-size:.65rem;font-weight:850;letter-spacing:.1em}
  .wvs-table-object{position:absolute;z-index:5;width:122px;height:122px;touch-action:none;user-select:none}.wvs-table-object.rectangle{width:155px;height:105px}.wvs-table-object.top{width:310px;height:92px}.wvs-table-object.sweetheart{width:110px;height:88px}.wvs-table-object.dragging{z-index:30;filter:drop-shadow(0 14px 12px rgba(0,0,0,.18))}.wvs-table-object.locked{opacity:.88}.wvs-table-object.over .wvs-table-move-handle{box-shadow:0 0 0 3px #efb0b0}.wvs-table-move-handle{position:absolute;inset:18px;border:2px solid color-mix(in srgb,var(--table-colour),#999 25%);background:var(--table-colour);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:grab;text-align:center}.wvs-table-object.rectangle .wvs-table-move-handle,.wvs-table-object.top .wvs-table-move-handle,.wvs-table-object.sweetheart .wvs-table-move-handle{border-radius:12px}.wvs-table-move-handle strong{font-size:.65rem}.wvs-table-move-handle span{font-size:.74rem;font-weight:900;margin-top:2px}.wvs-table-move-handle small{font-size:.45rem;color:#a33b3b}.wvs-table-toolbar{position:absolute;top:-18px;left:50%;transform:translateX(-50%);display:flex;gap:3px;opacity:0;transition:.15s;z-index:20}.wvs-table-object:hover .wvs-table-toolbar{opacity:1}.wvs-table-toolbar button{width:24px;height:24px;display:grid;place-items:center;border-radius:6px;background:#fff;border:1px solid #dde3d8;box-shadow:0 3px 7px rgba(0,0,0,.08)}.wvs-table-toolbar svg{width:12px;height:12px}.wvs-seat{position:absolute;transform:translate(-50%,-50%);width:20px;height:20px;border:1px solid #aeb7aa;border-radius:50%;background:#fff;z-index:8}.wvs-seat.occupied{background:color-mix(in srgb,var(--table-colour),white 20%);border-color:#82927b}.wvs-seat span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:57px;padding:3px 5px;border-radius:7px;background:#5f793f;color:#fff;font-size:.42rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;pointer-events:none}.wvs-seat:hover span{opacity:1}.wvs-table-drop.guest-over{box-shadow:0 0 0 4px #a9c987}
  .wvs-add-first{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;color:#668046}.wvs-add-first svg{width:32px;height:32px}.wvs-add-first strong{font-size:.78rem}.wvs-add-first span{font-size:.58rem;color:#8c9489}.wvs-summary{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;border-top:1px solid #e3e8df;background:#e3e8df}.wvs-summary div{display:grid;grid-template-columns:30px 1fr;grid-template-rows:auto auto;align-items:center;padding:10px;background:#fff}.wvs-summary svg{grid-row:1/3;width:19px;height:19px;color:#647e45}.wvs-summary strong{font-size:.82rem}.wvs-summary span{font-size:.49rem;color:#879084}
  .wvs-guests{display:flex;flex-direction:column}
  @media(min-width:1201px){.wvs-guests{height:680px;max-height:calc(100vh - 165px);min-height:520px;position:sticky;top:10px}.wvs-guest-list{scrollbar-width:thin;scrollbar-color:#b8c2b1 transparent}.wvs-guest-list::-webkit-scrollbar{width:7px}.wvs-guest-list::-webkit-scrollbar-thumb{background:#b8c2b1;border-radius:999px}.wvs-guest-list::-webkit-scrollbar-track{background:transparent}}
  .wvs-guest-tabs{display:flex;align-items:center;gap:14px;padding:14px;border-bottom:1px solid #e6eae3}.wvs-guest-tabs strong{font-size:.83rem;border-bottom:3px solid #5f793f;padding-bottom:8px}.wvs-guest-tabs button{font-size:.65rem;color:#727c70}.wvs-guest-search{display:flex;align-items:center;gap:7px;margin:12px;border:1px solid #dde3d8;border-radius:9px;padding:0 10px;height:39px}.wvs-guest-search svg{width:15px;height:15px;color:#899287}.wvs-guest-search input{width:100%;border:0;outline:0;font-size:.68rem}.wvs-filter-pills{display:flex;gap:5px;flex-wrap:wrap;padding:0 12px 10px}.wvs-filter-pills button{display:flex;gap:5px;align-items:center;padding:6px 8px;border-radius:999px;background:#f2f4ef;color:#6c7669;font-size:.52rem;font-weight:800}.wvs-filter-pills button.active{background:#5f793f;color:#fff}.wvs-filter-pills span{opacity:.75}.wvs-guest-list{flex:1;min-height:0;overflow-y:auto;padding:0 11px 11px}.wvs-guest-row{display:grid;grid-template-columns:18px 28px minmax(0,1fr) 95px;gap:6px;align-items:center;padding:9px 4px;border-bottom:1px solid #ebeee8;background:#fff}.wvs-drag-handle{color:#98a095;cursor:grab}.wvs-drag-handle svg{width:14px}.wvs-guest-avatar{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:#edf3e7;color:#5f793f}.wvs-guest-avatar svg{width:14px}.wvs-guest-row strong{display:block;font-size:.61rem}.wvs-guest-row small{display:block;font-size:.47rem;color:#858e82;margin-top:1px}.wvs-table-select{max-width:95px;padding:5px;border:1px solid #dfe5da;border-radius:7px;font-size:.49rem}.wvs-unassigned-drop{display:flex;align-items:center;justify-content:center;gap:6px;margin:10px;padding:10px;border:1px dashed #d7ddd3;border-radius:9px;color:#8b9388;font-size:.55rem}.wvs-unassigned-drop svg{width:14px}.wvs-empty{text-align:center;padding:28px;color:#969d94;font-size:.62rem}
  .wvs-upload-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-height:190px;border:2px dashed #ccd7c2;border-radius:15px;background:#f7faf4;cursor:pointer;color:#5b733f}.wvs-upload-zone svg{width:32px;height:32px}.wvs-upload-zone strong{font-size:.82rem}.wvs-upload-zone span{font-size:.58rem;color:#7c8777}.wvs-upload-zone input{display:none}.wvs-mapping-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.wvs-mapping-grid label{display:flex;flex-direction:column;padding:10px;border:1px solid #e1e6dd;border-radius:10px;background:#fafbf9}.wvs-mapping-grid label>span{font-size:.55rem;font-weight:850}.wvs-mapping-grid select{margin-top:6px;padding:7px;border:1px solid #d7ddd2;border-radius:7px;font-size:.6rem}.wvs-mapping-grid small{margin-top:5px;color:#8c9489;font-size:.47rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wvs-preview-table{width:100%;border-collapse:collapse;font-size:.54rem}.wvs-preview-table th,.wvs-preview-table td{padding:7px;border:1px solid #e4e8e1;text-align:left}.wvs-preview-table th{background:#f0f4eb}.wvs-import-stat{padding:13px;border:1px solid #d9e5d2;border-radius:11px;background:#f2f8ee}.wvs-import-stat.amber{background:#fff8e8;border-color:#ead9aa}.wvs-import-stat.red{background:#fff1f1;border-color:#efcaca}.wvs-import-stat strong{display:block;font-size:1.2rem}.wvs-import-stat span{font-size:.54rem}.wvs-import-preview-list{max-height:430px;overflow-y:auto;border:1px solid #e1e6dd;border-radius:11px}.wvs-import-preview-list label{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:9px;align-items:center;padding:9px 11px;border-bottom:1px solid #eaede7}.wvs-import-preview-list label:last-child{border-bottom:0}.wvs-import-preview-list label.duplicate{background:#fff9e8}.wvs-import-preview-list label.invalid{background:#fff1f1}.wvs-import-preview-list strong{display:block;font-size:.61rem}.wvs-import-preview-list small{display:block;font-size:.49rem;color:#828b7f}.wvs-import-preview-list em{font-style:normal;font-size:.48rem;color:#8a6820}

  .wvs-food-totals{padding:18px;border:1px solid #dfe5db;border-radius:16px;background:#fff}.wvs-food-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px}.wvs-food-head h4{font-size:1rem;font-weight:850;margin-top:2px}.wvs-food-head p:last-child{font-size:.6rem;color:#7b8478;margin-top:3px}.wvs-food-head .secondary{display:flex;align-items:center;gap:6px;padding:9px 12px;border:1px solid #dce3d8;border-radius:9px;font-size:.58rem;font-weight:850}.wvs-food-head svg{width:14px}.wvs-food-overall{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}.wvs-food-course{border:1px solid #e2e7de;border-radius:11px;padding:12px;background:#fafbf8}.wvs-food-course h5{font-size:.65rem;font-weight:900;margin-bottom:7px;color:#566d3d}.wvs-food-count{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid #e7ebe4;font-size:.56rem}.wvs-food-count:last-child{border-bottom:0}.wvs-food-count strong{font-size:.65rem}.wvs-food-empty{font-size:.52rem;color:#969e93}.wvs-food-meta{display:flex;gap:16px;flex-wrap:wrap;padding:10px 2px 0;font-size:.55rem;color:#737c70}.wvs-overall-back-sheet{margin-top:18px;padding-top:14px;border-top:2px solid #6b7f4d}.wvs-table-food-details{margin-top:16px;border-top:1px solid #e4e8e1;padding-top:14px}.wvs-table-food-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px}.wvs-table-food-section-head h5{font-size:.78rem;font-weight:900;margin-top:2px}.wvs-table-food-section-head>span{font-size:.52rem;color:#7d867a;background:#f3f6ef;border:1px solid #dde4d8;padding:5px 8px;border-radius:20px}.wvs-table-food-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:11px}.wvs-table-food-card{border:1px solid #e0e5dc;border-left:4px solid #6b7f4d;border-radius:11px;padding:12px;background:#fff}.wvs-table-food-card.has-allergens{border-left-color:#b8463a;background:#fffdfc}.wvs-table-food-title{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;padding-bottom:8px;border-bottom:1px solid #e8ece5;margin-bottom:8px}.wvs-table-food-title strong{font-size:.72rem}.wvs-table-food-title small{display:block;font-size:.48rem;color:#80887e;margin-top:2px}.wvs-table-food-title>span{font-size:.49rem;font-weight:850;color:#57713e;background:#eef4e8;padding:4px 6px;border-radius:6px}.wvs-chef-course-list{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.wvs-chef-course-list section{background:#fafbf8;border:1px solid #ecefe8;border-radius:8px;padding:8px}.wvs-table-allergen-block{margin-top:10px;background:#fff0ed;border:1px solid #e7bbb3;border-radius:8px;padding:9px}.wvs-table-allergen-title{font-size:.52rem;font-weight:950;color:#952f27;letter-spacing:.04em;margin-bottom:5px}.wvs-table-allergen-row{display:grid;grid-template-columns:minmax(90px,.7fr) 1.5fr;gap:8px;border-top:1px solid #efd0ca;padding:5px 0;font-size:.51rem}.wvs-table-allergen-row:first-of-type{border-top:0}.wvs-table-allergen-row strong{color:#7f2a23}.wvs-table-clear{margin-top:9px;background:#eef6eb;color:#42663b;padding:7px;border-radius:7px;font-size:.49rem;font-weight:750}.wvs-table-evening{margin-top:8px;padding-top:7px;border-top:1px solid #e8ece5}.wvs-table-meal-mini{font-size:.42rem!important;color:#58713f!important;font-weight:900!important;white-space:nowrap}.wvs-table-food-card h6{font-size:.49rem;text-transform:uppercase;letter-spacing:.08em;color:#7b8477;margin:7px 0 2px}.wvs-food-dietary{margin-top:7px;padding:6px;background:#fff5e5;border-radius:7px;font-size:.5rem;color:#8c6421}.wvs-evening-allergies{margin-top:10px;padding-top:9px;border-top:1px solid #ecd0c9;color:#8f3027;font-size:.52rem;line-height:1.45}.wvs-evening-allergies>strong{display:block;font-size:.5rem;letter-spacing:.05em;margin-bottom:5px}.wvs-evening-allergies>div{padding:2px 0}
  .wvs-quick-add{padding:14px 16px;border:1px solid #e1e7dd;border-radius:15px;background:#fff}.wvs-quick-add-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}.wvs-quick-add-heading h4{font-size:.9rem;font-weight:850;margin-top:2px}.wvs-import-link{display:flex;align-items:center;gap:5px;padding:7px 9px;border-radius:8px;background:#eef3e8;color:#58733d;font-size:.57rem;font-weight:850}.wvs-import-link svg{width:13px;height:13px}.wvs-quick-add-grid{display:grid;grid-template-columns:1.5fr .75fr 1fr repeat(3,1fr) 1.3fr auto;gap:8px;align-items:end;margin-top:12px}.wvs-quick-add-grid label{display:flex;flex-direction:column;min-width:0}.wvs-quick-add-grid label span{font-size:.52rem;font-weight:800;color:#667160;margin-bottom:4px}.wvs-quick-add-grid input,.wvs-quick-add-grid select{height:38px;width:100%;padding:0 9px;border:1px solid #dce3d8;border-radius:8px;background:#fff;font-size:.59rem;outline:none}.wvs-quick-add-grid input:focus,.wvs-quick-add-grid select:focus{border-color:#78945a;box-shadow:0 0 0 3px rgba(95,121,63,.1)}.wvs-quick-add-button{display:flex;align-items:center;justify-content:center;gap:5px;height:38px;padding:0 13px;border-radius:8px;background:#5f793f;color:#fff;font-size:.59rem;font-weight:850;white-space:nowrap}.wvs-quick-add-button svg{width:14px;height:14px}.wvs-quick-add-note{font-size:.49rem;color:#8a9387;margin-top:7px}

    @media(max-width:1450px){.wvs-quick-add-grid{grid-template-columns:repeat(4,1fr)}.wvs-quick-add-button{grid-column:4}.wvs-layout{grid-template-columns:minmax(0,1fr) 330px}}@media(max-width:1200px){.wvs-food-overall{grid-template-columns:1fr 1fr}.wvs-table-food-grid{grid-template-columns:1fr 1fr}.wvs-layout{grid-template-columns:1fr}.wvs-guests{max-height:500px}.wvs-mapping-grid{grid-template-columns:repeat(2,1fr)}.wvs-quick-add-grid{grid-template-columns:repeat(3,1fr)}.wvs-quick-add-button{grid-column:auto}}@media(max-width:700px){.wvs-food-head{align-items:flex-start;flex-direction:column}.wvs-food-overall,.wvs-table-food-grid{grid-template-columns:1fr}.wvs-chef-course-list{grid-template-columns:1fr}.wvs-header{align-items:flex-start;flex-direction:column}.wvs-quick-add-heading{align-items:flex-start;flex-direction:column}.wvs-quick-add-grid{grid-template-columns:1fr 1fr}.wvs-quick-add-grid .guest-name,.wvs-quick-add-grid .dietary,.wvs-quick-add-button{grid-column:1/-1}.wvs-controls{flex-wrap:wrap}.wvs-control-help{margin-left:0;width:100%}.wvs-summary{grid-template-columns:repeat(2,1fr)}.wvs-mapping-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
})();

function weddingRezlynxSections(w){
  const get=section=>typeof planningData==='function'?planningData(w.id,section)||{}:{};
  const profile=typeof weddingProfile==='function'?weddingProfile(w):get('profile');
  const ceremony=get('ceremony'),reception=get('reception'),decor=get('decor'),
        layout=get('layout'),music=get('music'),suppliers=get('suppliers'),bedrooms=get('bedrooms');
  const payments=(DB.weddingPayments||[]).filter(x=>x.weddingId===w.id);
  const running=(DB.weddingRunningOrder||[]).filter(x=>x.weddingId===w.id).slice().sort((a,b)=>String(a.startTime||'').localeCompare(String(b.startTime||'')));
  const line=(label,value)=>value!==undefined&&value!==null&&String(value).trim()!==''?`${label}: ${value}`:'';
  const t=v=>v?(typeof timePretty==='function'?timePretty(v):v):'';
  const money=v=>`£${Number(v||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const booking=[
    line('Couple',w.couple),line('Date',w.date),line('Package',w.package),
    line('Wedding Format',typeof WEDDING_FORMATS!=='undefined'?WEDDING_FORMATS[profile.weddingFormat]?.label||profile.weddingFormat:profile.weddingFormat),
    line('Day Guests',Number(w.dayGuests||0)),line('Evening Guests',Number(w.eveningGuests||0)),line('Coordinator',w.coordinator),w.notes||''
  ].filter(Boolean).join('\n');

  const room=[
    profile.ceremonyLocationType==='external'?line('Ceremony Elsewhere',profile.externalCeremonyVenue):line('Ceremony Location',ceremony.ceremonyLocation),
    line('Ceremony Time',t(profile.externalCeremonyTime||ceremony.ceremonyTime)),
    line('Expected Windmill Arrival',t(profile.venueArrivalTime||reception.arrivalTime)),
    line('Colour Scheme',decor.colourScheme),line('Chair Covers / Sashes',decor.chairCovers),line('Centrepieces',decor.centrepieces),
    line('Top Table',decor.topTable),line('Backdrop',decor.backdrop),line('Table Shape',layout.tableShape),
    line('Top Table Style',layout.topTableStyle),line('Guest Tables',layout.numberOfTables),line('Dancefloor',layout.dancefloorPosition),
    layout.layoutNotes||''
  ].filter(Boolean).join('\n');

  const equipment=[
    line('DJ',suppliers.dj),line('DJ Setup',t(music.djSetupTime)),line('DJ Start',t(music.djStart)),line('DJ Finish',t(music.djFinish)),
    line('Entertainment',suppliers.entertainment),line('First Dance',music.firstDanceSong),line('Cake Cutting Song',music.cakeCutSong),
    music.mustPlay?`Must Play: ${music.mustPlay}`:'',music.doNotPlay?`Do Not Play: ${music.doNotPlay}`:'',music.musicNotes||''
  ].filter(Boolean).join('\n');

  const bespokeWelcome=Array.isArray(reception.bespokeWelcomeDrinks)?reception.bespokeWelcomeDrinks.filter(x=>x?.drink).map(x=>`${x.quantity||0} x ${x.drink}`).join(', '):'';
  const bespokeToast=Array.isArray(reception.bespokeToastDrinks)?reception.bespokeToastDrinks.filter(x=>x?.drink).map(x=>`${x.quantity||0} x ${x.drink}`).join(', '):'';
  const food=[
    line('Wedding Breakfast Menu',reception.weddingBreakfastMenu),line('Meal Service',reception.mealService),line('Drinks Package',reception.drinksPackage),
    bespokeWelcome?`Welcome Drinks: ${bespokeWelcome}`:'',bespokeToast?`Toast Drinks: ${bespokeToast}`:'',
    reception.menuNotes||''
  ].filter(Boolean).join('\n');

  const timetable=running.map(x=>`${t(x.startTime)||'TBC'} - ${x.title||''}${x.location?` · ${x.location}`:''}`).join('\n');
  const notes=[
    line('Photographer',suppliers.photographer),line('Videographer',suppliers.videographer),line('Florist',suppliers.florist),
    line('Cake Supplier',suppliers.cakeSupplier),line('Transport',suppliers.transport),suppliers.supplierNotes||'',
    ...(Array.isArray(reception.additionalTimings)?reception.additionalTimings.filter(x=>x&&(x.label||x.time)).map(x=>`${t(x.time)||'TBC'} - ${x.label||'Additional timing'}${x.notes?` · ${x.notes}`:''}`):[])
  ].filter(Boolean).join('\n');

  const total=Number(w.quotedValue||0);
  const paid=payments.filter(x=>x.status==='Paid').reduce((s,p)=>s+Number(p.amount||0),0);
  const billing=[`Quoted Value: ${money(total)}`,`Paid: ${money(paid)}`,`Outstanding: ${money(Math.max(0,total-paid))}`].join('\n');
  const accommodation=[
    line('Rooms Required',bedrooms.roomsRequired),line('Bridal Suite',bedrooms.bridalSuite),line('Night-before Rooms',bedrooms.nightBeforeRooms),
    line('Room Release Date',bedrooms.roomReleaseDate),line('Breakfast Time',t(bedrooms.breakfastTime)),line('Accessible Rooms',bedrooms.accessibleRooms),
    bedrooms.bedroomNotes||''
  ].filter(Boolean).join('\n');

  return [
    ['Booking Description',booking],['Room Setup',room],['Equipment',equipment],['Food and Drink',food],
    ['Order of Events / Timetable',timetable],['Other Notes',notes],['Prices & Billing Instructions',billing],['Accommodation',accommodation]
  ];
}

function openWeddingRezlynxTransfer(id){
  const w=(DB.weddings||[]).find(x=>x.id===id);if(!w)return;
  const sections=weddingRezlynxSections(w);
  const modal=document.createElement('div');
  modal.id='weddingRezlynxTransferModal';
  modal.className='fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4';
  modal.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
      <div class="p-5 border-b flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">REZLYNX TRANSFER</p>
          <h2 class="text-xl font-bold mt-1">${esc(w.couple||'Wedding')}</h2>
          <p class="text-sm text-gray-500 mt-1">Same boxes as the Rezlynx Function Sheet, now mapped directly from Wedding Overview + Planning.</p>
        </div>
        <button onclick="document.getElementById('weddingRezlynxTransferModal').remove()" class="text-2xl px-2">×</button>
      </div>
      <div class="p-5 overflow-auto space-y-4">
        ${sections.map(([title,body],index)=>`
          <section class="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div class="px-4 py-2.5 bg-gray-100 border-b font-bold text-sm">${title}</div>
            <textarea data-wedding-rezlynx-box="${index}" class="w-full min-h-[125px] p-4 text-sm leading-6 border-0 outline-none resize-y" placeholder="Nothing recorded yet.">${esc(body||'')}</textarea>
          </section>`).join('')}
      </div>
      <div class="p-5 border-t flex justify-end gap-3">
        <button onclick="document.getElementById('weddingRezlynxTransferModal').remove()" class="px-4 py-2 border rounded-lg font-semibold">Close</button>
        <button onclick="copyWeddingForRezlynx('${w.id}')" class="px-5 py-2 bg-olive-600 text-white rounded-lg font-semibold">Copy for Rezlynx</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

async function copyWeddingForRezlynx(id){
  const w=(DB.weddings||[]).find(x=>x.id===id);if(!w)return;
  const sections=weddingRezlynxSections(w);
  const boxes=[...document.querySelectorAll('[data-wedding-rezlynx-box]')];
  const copyText=boxes.map((box,index)=>`${sections[index][0].toUpperCase()}\n${box.value.trim()}`).join('\n\n');
  try{
    await navigator.clipboard.writeText(copyText);
    toast('Wedding Rezlynx notes copied — mapped from Planning');
  }catch(error){
    console.error(error);
    toast('Copy failed — select and copy manually','error');
  }
}


