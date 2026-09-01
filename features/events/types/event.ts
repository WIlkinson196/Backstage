export type EventStatus = "draft" | "provisional" | "confirmed" | "planning" | "ready" | "live" | "completed" | "cancelled";
export type EventPlanKind = "meeting" | "party" | "wake" | "wedding" | "event";

export type EventTask = {
  id: string;
  title: string;
  category: "Planning" | "Food & Drink" | "Room Setup" | "AV & Equipment" | "Entertainment" | "Payments" | "Operations";
  priority: "High" | "Medium" | "Low";
  dueDate?: string;
  assignedTo?: string;
  completed: boolean;
};

export type EventRunningOrderItem = {
  id: string;
  time: string;
  title: string;
  detail?: string;
  category: "arrival" | "meeting" | "food" | "entertainment" | "operations";
  completed: boolean;
};

export type EventPayment = {
  id: string;
  label: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: "paid" | "due" | "overdue" | "scheduled";
};

export type EventPlan = {
  kind: EventPlanKind;
  contact: { organiser?: string; email?: string; phone?: string; company?: string; poNumber?: string };
  room: { space?: string; layout?: string; tables?: string; breakouts?: string; registration?: string; signage?: string; parking?: string; accessTime?: string; resetTime?: string };
  food: { catering?: string; refreshments?: string; dietary?: string; drinks?: string; serviceTime?: string };
  av: { projector?: boolean; tv1?: boolean; tv2?: boolean; pa?: boolean; lectern?: boolean; flipchart?: boolean; welcomeSlide?: boolean; stage?: boolean; wifi?: boolean; notes?: string };
  entertainment: { dj?: string; cake?: string; decor?: string; lighting?: string; extras?: string };
  accommodation: { required?: boolean; rooms?: string; notes?: string };
  customerRequirements?: string;
  internalNotes?: string;
};

export type EventIntegration = {
  key: "payments" | "email" | "ai" | "documents" | "portal";
  label: string;
  status: "prepared" | "connected";
  description: string;
};

export type EventRecord = {
  id: string;
  title: string;
  clientName: string;
  eventType: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  dayGuests?: number;
  eveningGuests?: number;
  status: EventStatus;
  bookingReference?: string;
  quotedValue: number;
  paidValue: number;
  owner: string;
  room?: string;
  packageName?: string;
  notes?: string;
  sourceEnquiryId?: string;
  linkedWeddingId?: string;
  createdAt: string;
  readinessScore: number;
  nextAction: string;
  nextActionDue?: string;
  finalMeetingAt?: string;
  functionSheetStatus: "not_started" | "draft" | "issued";
  foodOrderStatus: "not_started" | "draft" | "sent";
  plan: EventPlan;
  tasks: EventTask[];
  runningOrder: EventRunningOrderItem[];
  payments: EventPayment[];
  integrations: EventIntegration[];
};

export type EventsWorkspaceData = { events: EventRecord[]; demoMode: boolean };
