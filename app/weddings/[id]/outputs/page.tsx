import { notFound } from "next/navigation";
import { buildWeddingOperationalModel } from "@/features/weddings/services/operational-model";
import { buildFunctionSheetDocument, buildMasterOperationalPack } from "@/features/weddings/services/output-generator";
import { FunctionSheetOutput } from "@/features/weddings/components/function-sheet-output";

export default async function WeddingOutputsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params; const model=await buildWeddingOperationalModel(id); if(!model)notFound();
  const sheet=buildFunctionSheetDocument(model); const pack=buildMasterOperationalPack(model);
  return <FunctionSheetOutput sheet={sheet} pack={pack}/>;
}
