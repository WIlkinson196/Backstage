export type PortalWedding = {
  id: string;
  couple: string;
  eventDate: string;
  venueName: string;
  heroImage: string;
  planningProgress: number;
  daysToGo: number;
  nextMilestone: string;
  outstandingBalance: number;
};

export type PortalTask = {
  id: string;
  title: string;
  detail: string;
  dueDate: string;
  status: "complete" | "due" | "overdue";
  category: "Planning" | "Guests" | "Music" | "Documents" | "Payment";
};

export type PortalDocument = {
  id: string;
  title: string;
  description: string;
  version: number;
  status: "available" | "awaiting";
};

export type PortalMessage = {
  id: string;
  sender: "venue" | "couple";
  senderName: string;
  body: string;
  sentAt: string;
};

export type PortalPayment = {
  id: string;
  label: string;
  amount: number;
  status: "paid" | "due" | "scheduled";
  date: string;
};
