import { documentsByWedding, functionSheetByWedding, readinessByWedding, runningOrderByWedding } from "../data/operations-demo";

export async function getWeddingDocuments(id: string) {
  return documentsByWedding[id] ?? [];
}

export async function getRunningOrder(id: string) {
  return runningOrderByWedding[id] ?? [];
}

export async function getFunctionSheet(id: string) {
  return functionSheetByWedding[id] ?? [];
}

export async function getWeddingReadiness(id: string) {
  return readinessByWedding[id] ?? [];
}
