import { notFound } from "next/navigation";
import { OutputFoundation } from "@/features/weddings/components/output-foundation";
import { buildWeddingOperationalModel } from "@/features/weddings/services/operational-model";
export default async function WeddingOutputsPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const model=await buildWeddingOperationalModel(id);if(!model)notFound();return <OutputFoundation model={model}/>;}