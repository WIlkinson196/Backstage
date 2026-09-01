export type CalendarStatus = "enquiry" | "provisional" | "confirmed" | "released" | "cancelled" | "blocked";

export type CalendarSpace = {
  id: string;
  name: string;
  capacity: number;
};

export type CalendarBooking = {
  id: string;
  eventId?: string;
  clientName: string;
  title: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  spaceId: string;
  spaceName: string;
  guestCount: number;
  status: CalendarStatus;
  quotedValue: number;
  setupMinutes: number;
  clearMinutes: number;
  holdExpiresAt?: string;
  notes?: string;
  advisory?: boolean;
};

export type CalendarWorkspaceData = {
  spaces: CalendarSpace[];
  bookings: CalendarBooking[];
  demoMode: boolean;
  defaultHoldDays: number;
  defaultSetupMinutes: number;
  defaultClearMinutes: number;
};

export type CalendarBookingInput = Omit<CalendarBooking, "id" | "eventId" | "spaceName" | "holdExpiresAt" | "advisory"> & {
  holdDays: number;
};

