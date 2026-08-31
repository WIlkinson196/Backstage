import { dietarySummaryByWedding, guestsByWedding, tablesByWedding, zonesByWedding } from "../data/guests-demo";
import type { GuestReadiness } from "@/features/weddings/types/guests";

export async function getWeddingGuests(id: string) {
  return guestsByWedding[id] ?? [];
}

export async function getWeddingTables(id: string) {
  return tablesByWedding[id] ?? [];
}

export async function getWeddingFloorPlanZones(id: string) {
  return zonesByWedding[id] ?? [];
}

export async function getWeddingDietarySummary(id: string) {
  return dietarySummaryByWedding[id] ?? [];
}

export async function getGuestReadiness(id: string): Promise<GuestReadiness> {
  const guests = guestsByWedding[id] ?? [];
  const assigned = guests.filter(g => Boolean(g.tableId)).length;
  return {
    totalGuests: guests.length,
    assignedGuests: assigned,
    unassignedGuests: guests.filter(g => g.rsvpStatus !== "declined" && !g.tableId).length,
    dietaryGuests: guests.filter(g => Boolean(g.dietaryRequirements)).length,
    pendingRsvps: guests.filter(g => g.rsvpStatus === "pending").length,
    criticalDietaries: guests.filter(g => g.dietarySeverity === "critical").length
  };
}
