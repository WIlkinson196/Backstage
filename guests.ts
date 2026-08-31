export type GuestAttendance = "day" | "evening" | "both";
export type GuestRsvpStatus = "confirmed" | "pending" | "declined";
export type DietarySeverity = "info" | "allergy" | "critical";

export type WeddingGuest = {
  id: string;
  weddingId: string;
  name: string;
  attendance: GuestAttendance;
  rsvpStatus: GuestRsvpStatus;
  tableId?: string;
  tableName?: string;
  seatNumber?: number;
  ageGroup: "adult" | "child" | "baby";
  menuChoice?: string;
  dietaryRequirements?: string;
  dietarySeverity?: DietarySeverity;
  accessibilityRequirements?: string;
  notes?: string;
  source: "Venue" | "Customer Portal";
};

export type WeddingTable = {
  id: string;
  weddingId: string;
  name: string;
  shape: "round" | "rectangle" | "top_table";
  capacity: number;
  assignedGuests: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type DietarySummary = {
  label: string;
  count: number;
  severity: DietarySeverity;
};

export type FloorPlanZone = {
  id: string;
  name: string;
  type: "dancefloor" | "dj" | "buffet" | "bar" | "cake" | "ceremony" | "entrance" | "other";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GuestReadiness = {
  totalGuests: number;
  assignedGuests: number;
  unassignedGuests: number;
  dietaryGuests: number;
  pendingRsvps: number;
  criticalDietaries: number;
};
