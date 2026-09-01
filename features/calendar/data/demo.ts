import type { CalendarBooking, CalendarSpace } from "../types/calendar";

export const demoCalendarSpaces: CalendarSpace[] = [
  { id: "space-granary", name: "The Granary", capacity: 200 },
  { id: "space-garden", name: "Event Garden", capacity: 120 },
  { id: "space-restaurant", name: "Restaurant Area", capacity: 80 }
];

export const demoCalendarBookings: CalendarBooking[] = [
  { id: "cal-001", eventId: "event-001", clientName: "Ruth", title: "Ruth · Evening Meeting", eventType: "Meeting", date: "2026-09-23", startTime: "18:00", endTime: "21:30", spaceId: "space-granary", spaceName: "The Granary", guestCount: 29, status: "confirmed", quotedValue: 435, setupMinutes: 60, clearMinutes: 30 },
  { id: "cal-002", eventId: "event-002", clientName: "Julia", title: "Julia · Conference", eventType: "Conference", date: "2026-10-15", startTime: "08:30", endTime: "17:00", spaceId: "space-granary", spaceName: "The Granary", guestCount: 30, status: "confirmed", quotedValue: 750, setupMinutes: 90, clearMinutes: 45 },
  { id: "cal-003", eventId: "event-003", clientName: "Christmas Party", title: "Windmill Farm Party Night", eventType: "Christmas", date: "2026-12-18", startTime: "18:00", endTime: "23:59", spaceId: "space-granary", spaceName: "The Granary", guestCount: 120, status: "confirmed", quotedValue: 4200, setupMinutes: 180, clearMinutes: 120 },
  { id: "cal-004", eventId: "event-004", clientName: "Claire Loynes", title: "Club Celebration Evening", eventType: "Private Event", date: "2027-01-23", startTime: "18:00", endTime: "23:30", spaceId: "space-granary", spaceName: "The Granary", guestCount: 150, status: "provisional", quotedValue: 3000, setupMinutes: 120, clearMinutes: 90, holdExpiresAt: "2026-09-15T17:00:00Z" },
  { id: "demand-001", clientName: "Sharon Limb", title: "Sharon Limb · Wedding Enquiry", eventType: "Wedding", date: "2027-07-31", startTime: "00:00", endTime: "23:59", spaceId: "space-granary", spaceName: "The Granary", guestCount: 70, status: "enquiry", quotedValue: 2995, setupMinutes: 0, clearMinutes: 0, advisory: true }
];

