import type { CalendarBooking, CalendarBookingInput } from "../types/calendar";

export function minutes(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function activeOccupancy(booking: CalendarBooking, now = new Date()) {
  if (["released", "cancelled", "enquiry"].includes(booking.status)) return false;
  if (booking.status === "provisional" && booking.holdExpiresAt && new Date(booking.holdExpiresAt) <= now) return false;
  return true;
}

export function findConflicts(candidate: CalendarBookingInput, bookings: CalendarBooking[], ignoreId?: string) {
  const candidateStart = minutes(candidate.startTime) - candidate.setupMinutes;
  const candidateEnd = minutes(candidate.endTime) + candidate.clearMinutes;
  return bookings.filter((booking) => {
    if (booking.id === ignoreId || booking.date !== candidate.date || booking.spaceId !== candidate.spaceId) return false;
    if (!activeOccupancy(booking)) return false;
    const start = minutes(booking.startTime) - booking.setupMinutes;
    const end = minutes(booking.endTime) + booking.clearMinutes;
    return candidateStart < end && start < candidateEnd;
  });
}

export function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
