import { prepInputsByWedding } from "@/features/weddings/data/prep-demo";
export async function getWeddingPrepInputs(id:string){return prepInputsByWedding[id]??null;}
