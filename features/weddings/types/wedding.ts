export type WeddingStatus = "planning" | "finalising" | "ready" | "live" | "completed";

export type WeddingRecord = {
  id: string;
  couple: string;
  eventDate: string;
  packageName: string;
  dayGuests: number;
  eveningGuests: number;
  quotedValue: number;
  paidValue: number;
  coordinator: string;
  status: WeddingStatus;
  ceremonyType: "onsite" | "external" | "none";
  ceremonyTime?: string;
  arrivalTime?: string;
  readinessScore: number;
  planningScore: number;
  nextMilestone: string;
  nextMilestoneDate: string;
};

export type WeddingTask = {
  id: string;
  weddingId: string;
  title: string;
  category: "Immediate" | "Planning" | "Final Planning" | "Suppliers" | "Payments" | "Operations" | "Completion";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  completed: boolean;
};

export type WeddingMeeting = {
  id: string;
  weddingId: string;
  type: "first" | "halfway" | "final";
  label: string;
  eyebrow: string;
  completedFields: number;
  totalFields: number;
  status: "not_started" | "in_progress" | "complete";
  plannedDate?: string;
};

export type WeddingPayment = {
  id: string;
  weddingId: string;
  label: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: "paid" | "due" | "overdue" | "scheduled";
};

export type WeddingTimelineItem = {
  id: string;
  weddingId: string;
  time: string;
  title: string;
  detail?: string;
  category: "ceremony" | "food" | "entertainment" | "operations" | "guest";
};
