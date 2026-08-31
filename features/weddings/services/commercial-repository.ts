import { planningByWedding, quoteByWedding, weddingCatalogue } from "../data/commercial-demo";

export async function getWeddingCatalogue() {
  return weddingCatalogue.filter((x) => x.active);
}

export async function getWeddingQuote(id: string) {
  return quoteByWedding[id] ?? {
    weddingId: id,
    version: 1,
    status: "draft" as const,
    discount: 0,
    lines: []
  };
}

export async function getWeddingPlanning(id: string) {
  return planningByWedding[id] ?? [];
}
