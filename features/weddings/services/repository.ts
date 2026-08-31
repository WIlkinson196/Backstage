import { demoMeetings, demoPayments, demoTasks, demoTimeline, demoWeddings } from "../data/demo";

export async function getWeddings() {
  return demoWeddings;
}

export async function getWedding(id: string) {
  return demoWeddings.find((w) => w.id === id) ?? null;
}

export async function getWeddingTasks(id: string) {
  return demoTasks.filter((x) => x.weddingId === id);
}

export async function getWeddingMeetings(id: string) {
  return demoMeetings.filter((x) => x.weddingId === id);
}

export async function getWeddingPayments(id: string) {
  return demoPayments.filter((x) => x.weddingId === id);
}

export async function getWeddingTimeline(id: string) {
  return demoTimeline.filter((x) => x.weddingId === id);
}
