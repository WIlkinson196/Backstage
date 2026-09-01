import type { EventIntegration, EventRecord } from "../types/event";

const integrations: EventIntegration[] = [
  { key: "payments", label: "Stripe Connect", status: "prepared", description: "Payment links, deposits and automatic reconciliation." },
  { key: "email", label: "Venue email", status: "prepared", description: "Approved reminders, confirmations and follow-ups." },
  { key: "ai", label: "OpenAI", status: "prepared", description: "Drafting, missing-detail checks and event summaries." },
  { key: "documents", label: "Document storage", status: "prepared", description: "Versioned packs, contracts and customer uploads." },
  { key: "portal", label: "Customer portal", status: "prepared", description: "Secure planning, messages, files and payments." }
];

export const demoEvents: EventRecord[] = [
  {
    id: "event-001", title: "Ruth · Evening Meeting", clientName: "Ruth", eventType: "Evening Meeting", eventDate: "2026-09-23", startTime: "18:00", endTime: "21:30", guestCount: 29,
    status: "planning", bookingReference: "BK-RUTH-2309", quotedValue: 435, paidValue: 0, owner: "Amber", room: "The Granary", packageName: "Evening Meeting", createdAt: "2026-08-28T10:00:00Z",
    readinessScore: 72, nextAction: "Confirm final numbers and dietary requirements", nextActionDue: "2026-09-09", finalMeetingAt: "2026-09-09T16:00:00Z", functionSheetStatus: "draft", foodOrderStatus: "not_started",
    plan: { kind: "meeting", contact: { organiser: "Ruth" }, room: { space: "The Granary", layout: "Cabaret", registration: "Welcome desk", accessTime: "17:00", resetTime: "22:00" }, food: { catering: "Finger buffet", refreshments: "Tea & coffee on arrival", dietary: "Awaiting final confirmation", drinks: "Normal bar service", serviceTime: "19:30" }, av: { projector: true, wifi: true, flipchart: true, notes: "Presentation source to be confirmed." }, entertainment: {}, accommodation: { required: false }, customerRequirements: "Final delegate count expected by 9 September.", internalNotes: "Prepare an accurate quotation once numbers are confirmed." },
    tasks: [
      { id: "ruth-t1", title: "Confirm final delegate numbers", category: "Planning", priority: "High", dueDate: "2026-09-09", assignedTo: "Amber", completed: false },
      { id: "ruth-t2", title: "Confirm dietary requirements", category: "Food & Drink", priority: "High", dueDate: "2026-09-09", assignedTo: "Amber", completed: false },
      { id: "ruth-t3", title: "Test projector connection", category: "AV & Equipment", priority: "Medium", dueDate: "2026-09-22", assignedTo: "Operations", completed: false },
      { id: "ruth-t4", title: "Complete function sheet", category: "Operations", priority: "High", dueDate: "2026-09-16", assignedTo: "Amber", completed: false }
    ],
    runningOrder: [
      { id: "ruth-r1", time: "17:00", title: "Room access and setup", category: "operations", completed: false },
      { id: "ruth-r2", time: "18:00", title: "Delegates arrive", category: "arrival", completed: false },
      { id: "ruth-r3", time: "18:15", title: "Meeting starts", category: "meeting", completed: false },
      { id: "ruth-r4", time: "19:30", title: "Finger buffet", category: "food", completed: false },
      { id: "ruth-r5", time: "21:30", title: "Meeting finishes", category: "operations", completed: false }
    ],
    payments: [{ id: "ruth-p1", label: "Final invoice", amount: 435, dueDate: "2026-09-23", status: "scheduled" }], integrations
  },
  {
    id: "event-002", title: "Julia · Conference", clientName: "Julia", eventType: "Conference", eventDate: "2026-10-15", startTime: "08:30", endTime: "17:00", guestCount: 30,
    status: "planning", bookingReference: "BK-JULIA-1510", quotedValue: 750, paidValue: 0, owner: "Scott", room: "The Granary", packageName: "Standard Day Delegate Package", createdAt: "2026-08-21T10:00:00Z",
    readinessScore: 82, nextAction: "Confirm final numbers for invoice", nextActionDue: "2026-10-01", functionSheetStatus: "draft", foodOrderStatus: "draft",
    plan: { kind: "meeting", contact: { organiser: "Julia", company: "Corporate Client", poNumber: "Awaiting PO" }, room: { space: "The Granary", layout: "Cabaret", tables: "Cabaret rounds for 30", registration: "Welcome desk", signage: "Company welcome slide", accessTime: "07:45", resetTime: "17:30" }, food: { catering: "Buffet lunch", refreshments: "Unlimited tea & coffee", dietary: "Awaiting final delegate list", drinks: "Bottled water", serviceTime: "12:45" }, av: { projector: true, wifi: true, flipchart: true, welcomeSlide: true, notes: "Projector required. Confirm laptop connection." }, entertainment: {}, accommodation: { required: false }, customerRequirements: "DDR £25 per delegate. Lunch around 12:45–13:00.", internalNotes: "Invoice once final numbers and PO are received." },
    tasks: [
      { id: "julia-t1", title: "Receive final delegate numbers", category: "Planning", priority: "High", dueDate: "2026-10-01", assignedTo: "Scott", completed: false },
      { id: "julia-t2", title: "Receive PO number", category: "Payments", priority: "High", dueDate: "2026-10-01", assignedTo: "Scott", completed: false },
      { id: "julia-t3", title: "Confirm dietary requirements", category: "Food & Drink", priority: "High", dueDate: "2026-10-05", assignedTo: "Scott", completed: false },
      { id: "julia-t4", title: "Prepare welcome slide", category: "AV & Equipment", priority: "Medium", dueDate: "2026-10-14", assignedTo: "Operations", completed: false }
    ],
    runningOrder: [
      { id: "julia-r1", time: "07:45", title: "Venue access and AV setup", category: "operations", completed: false },
      { id: "julia-r2", time: "08:30", title: "Delegate arrival and refreshments", category: "arrival", completed: false },
      { id: "julia-r3", time: "09:00", title: "Conference starts", category: "meeting", completed: false },
      { id: "julia-r4", time: "12:45", title: "Buffet lunch", category: "food", completed: false },
      { id: "julia-r5", time: "17:00", title: "Conference ends", category: "operations", completed: false }
    ],
    payments: [{ id: "julia-p1", label: "Conference invoice", amount: 750, dueDate: "2026-10-15", status: "scheduled" }], integrations
  },
  {
    id: "event-005", title: "Council · Training Morning", clientName: "Council Training Team", eventType: "Conference", eventDate: "2026-11-18", startTime: "08:30", endTime: "13:00", guestCount: 50,
    status: "confirmed", bookingReference: "BK-COUNCIL-1811", quotedValue: 625, paidValue: 0, owner: "Scott", room: "The Granary", packageName: "Bespoke DDR £12.50", createdAt: "2026-08-21T11:00:00Z",
    readinessScore: 76, nextAction: "Confirm delegate numbers", nextActionDue: "2026-11-04", functionSheetStatus: "not_started", foodOrderStatus: "draft",
    plan: { kind: "meeting", contact: { organiser: "Council Training Team" }, room: { space: "The Granary", layout: "Cabaret", accessTime: "08:00", resetTime: "13:30" }, food: { catering: "No lunch", refreshments: "Tea, coffee & water at 09:00 and 11:00", dietary: "None confirmed", serviceTime: "11:00" }, av: { projector: true, flipchart: true, wifi: true }, entertainment: {}, accommodation: { required: false }, customerRequirements: "Cabaret layout. Refreshment stations at 09:00 and 11:00.", internalNotes: "DDR agreed at £12.50." },
    tasks: [{ id: "council-t1", title: "Confirm delegate numbers", category: "Planning", priority: "High", dueDate: "2026-11-04", assignedTo: "Scott", completed: false }, { id: "council-t2", title: "Complete function sheet", category: "Operations", priority: "High", dueDate: "2026-11-11", assignedTo: "Scott", completed: false }],
    runningOrder: [{ id: "council-r1", time: "08:00", title: "Room setup", category: "operations", completed: false }, { id: "council-r2", time: "08:30", title: "Delegate arrival", category: "arrival", completed: false }, { id: "council-r3", time: "09:00", title: "Training starts and first refreshments", category: "meeting", completed: false }, { id: "council-r4", time: "11:00", title: "Refreshment break", category: "food", completed: false }, { id: "council-r5", time: "13:00", title: "Finish", category: "operations", completed: false }],
    payments: [{ id: "council-p1", label: "Final invoice", amount: 625, dueDate: "2026-11-18", status: "scheduled" }], integrations
  },
  {
    id: "event-003", title: "Windmill Farm Party Night", clientName: "Christmas Party Night", eventType: "Christmas Party", eventDate: "2026-12-18", startTime: "18:00", endTime: "23:59", guestCount: 120,
    status: "planning", bookingReference: "BK-XMAS-1812", quotedValue: 4200, paidValue: 1500, owner: "Amber", room: "The Granary", packageName: "Party Night £35", createdAt: "2026-08-01T10:00:00Z",
    readinessScore: 68, nextAction: "Close remaining places and collect balances", nextActionDue: "2026-11-20", finalMeetingAt: "2026-11-27T15:00:00Z", functionSheetStatus: "not_started", foodOrderStatus: "not_started",
    plan: { kind: "party", contact: { organiser: "Internal public event" }, room: { space: "The Granary", layout: "Banquet / Rounds", tables: "12 tables of 10", accessTime: "12:00", resetTime: "10:00 next day" }, food: { catering: "Christmas three-course menu", refreshments: "Arrival drink", dietary: "Guest list pending", drinks: "Private function bar", serviceTime: "19:30" }, av: { pa: true, welcomeSlide: true }, entertainment: { dj: "Éclat Entertainment", cake: "No cake", decor: "Christmas venue dressing", lighting: "Party lighting" }, accommodation: { required: true, rooms: "Guest rooms sold individually", notes: "Link rooms to party bookings." }, customerRequirements: "Public party night. Minimum 60, maximum 150 guests.", internalNotes: "Final food order and table plan after balance deadline." },
    tasks: [{ id: "xmas-t1", title: "Collect all guest balances", category: "Payments", priority: "High", dueDate: "2026-11-20", assignedTo: "Amber", completed: false }, { id: "xmas-t2", title: "Receive dietary list", category: "Food & Drink", priority: "High", dueDate: "2026-12-04", assignedTo: "Amber", completed: false }, { id: "xmas-t3", title: "Issue final table plan", category: "Room Setup", priority: "High", dueDate: "2026-12-11", assignedTo: "Operations", completed: false }],
    runningOrder: [{ id: "xmas-r1", time: "12:00", title: "Venue dressing and table setup", category: "operations", completed: false }, { id: "xmas-r2", time: "18:00", title: "Doors and arrival drinks", category: "arrival", completed: false }, { id: "xmas-r3", time: "19:30", title: "Dinner service", category: "food", completed: false }, { id: "xmas-r4", time: "21:30", title: "DJ and dancing", category: "entertainment", completed: false }, { id: "xmas-r5", time: "23:59", title: "Event finish", category: "operations", completed: false }],
    payments: [{ id: "xmas-p1", label: "Deposits collected", amount: 1500, paidDate: "2026-08-31", status: "paid" }, { id: "xmas-p2", label: "Remaining guest balances", amount: 2700, dueDate: "2026-11-20", status: "scheduled" }], integrations
  },
  {
    id: "event-004", title: "Claire Loynes · Club Celebration", clientName: "Claire Loynes", eventType: "Celebration", eventDate: "2027-01-23", startTime: "18:00", endTime: "23:30", guestCount: 150,
    status: "provisional", quotedValue: 3000, paidValue: 0, owner: "Amber", room: "The Granary", createdAt: "2026-02-01T10:00:00Z",
    readinessScore: 18, nextAction: "Collect £300 deposit to secure the date", nextActionDue: "2026-09-03", functionSheetStatus: "not_started", foodOrderStatus: "not_started",
    plan: { kind: "party", contact: { organiser: "Claire Loynes" }, room: { space: "The Granary" }, food: {}, av: {}, entertainment: {}, accommodation: {}, customerRequirements: "Club celebration evening. Communications not yet sent until the booking is secured.", internalNotes: "No deposit was received when the enquiry was made earlier in the year." },
    tasks: [{ id: "claire-t1", title: "Collect booking deposit", category: "Payments", priority: "High", dueDate: "2026-09-03", assignedTo: "Amber", completed: false }, { id: "claire-t2", title: "Confirm final guest format", category: "Planning", priority: "High", assignedTo: "Amber", completed: false }],
    runningOrder: [], payments: [{ id: "claire-p1", label: "Booking deposit", amount: 300, dueDate: "2026-09-03", status: "due" }], integrations
  },
  {
    id: "event-wed-002", title: "Lucy & Connor · Wedding", clientName: "Lucy & Connor", eventType: "Wedding", eventDate: "2026-11-06", startTime: "13:00", endTime: "23:59", guestCount: 67, dayGuests: 60, eveningGuests: 67,
    status: "planning", bookingReference: "BK-LUCY-CONNOR", quotedValue: 2258.48, paidValue: 1300, owner: "Scott", room: "The Granary", packageName: "Evergreen", linkedWeddingId: "wed-002", createdAt: "2026-03-10T10:00:00Z",
    readinessScore: 61, nextAction: "Complete final wedding meeting", nextActionDue: "2026-09-11", finalMeetingAt: "2026-09-11T16:00:00Z", functionSheetStatus: "not_started", foodOrderStatus: "not_started",
    plan: { kind: "wedding", contact: { organiser: "Lucy & Connor" }, room: { space: "The Granary", layout: "Ceremony then wedding breakfast", accessTime: "12:30" }, food: { catering: "Evening BBQ", dietary: "Awaiting final confirmation", serviceTime: "20:00" }, av: { pa: true }, entertainment: { dj: "Venue DJ", decor: "Customer items arriving the day before" }, accommodation: { required: true, rooms: "Bridal suite", notes: "Wedding-night bridal suite included." }, customerRequirements: "60 day guests, 67 evening guests and 13 children. Four babies are not catered.", internalNotes: "Remaining balance due 2 October." },
    tasks: [{ id: "lucy-t1", title: "Complete final wedding meeting", category: "Planning", priority: "High", dueDate: "2026-09-11", assignedTo: "Scott", completed: false }, { id: "lucy-t2", title: "Receive seating plan", category: "Room Setup", priority: "High", dueDate: "2026-09-25", assignedTo: "Scott", completed: false }, { id: "lucy-t3", title: "Collect final balance", category: "Payments", priority: "High", dueDate: "2026-10-02", assignedTo: "Scott", completed: false }],
    runningOrder: [{ id: "lucy-r1", time: "12:30", title: "Supplier access", category: "operations", completed: false }, { id: "lucy-r2", time: "13:00", title: "Guest arrival", category: "arrival", completed: false }, { id: "lucy-r3", time: "14:30", title: "Ceremony", category: "meeting", completed: false }, { id: "lucy-r4", time: "20:00", title: "Evening BBQ", category: "food", completed: false }, { id: "lucy-r5", time: "23:59", title: "Wedding finish", category: "operations", completed: false }],
    payments: [{ id: "lucy-p1", label: "Booking deposit and part payment", amount: 1300, paidDate: "2026-08-27", status: "paid" }, { id: "lucy-p2", label: "Final balance", amount: 958.48, dueDate: "2026-10-02", status: "scheduled" }], integrations
  }
];
