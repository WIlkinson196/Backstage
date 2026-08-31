import { liveChecklistByWedding, liveContactsByWedding, liveNotesByWedding, liveTimelineByWedding } from "@/features/weddings/data/live-demo";

export async function getLiveTimeline(id: string) {
  return liveTimelineByWedding[id] ?? [];
}

export async function getLiveChecklist(id: string) {
  return liveChecklistByWedding[id] ?? [];
}

export async function getLiveContacts(id: string) {
  return liveContactsByWedding[id] ?? [];
}

export async function getLiveNotes(id: string) {
  return liveNotesByWedding[id] ?? [];
}
