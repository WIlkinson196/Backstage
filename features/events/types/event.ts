export type EventStatus = "draft" | "provisional" | "confirmed" | "planning" | "ready" | "live" | "completed" | "cancelled";

export type EventRecord = {
  id: string;
  title: string;
  clientName: string;
  eventType: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  status: EventStatus;
  quotedValue: number;
  paidValue: number;
  owner: string;
  notes?: string;
  sourceEnquiryId?: string;
  createdAt: string;
};

