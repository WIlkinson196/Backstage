import { notFound } from "next/navigation";
import { buildWeddingOperationalModel } from "@/features/weddings/services/operational-model";
import { buildWeddingPrepList } from "@/features/weddings/services/prep-generator";
import { PrepListWorkspace } from "@/features/weddings/components/prep-list-workspace";

export default async function WeddingPrepPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const model=await buildWeddingOperationalModel(id);if(!model)notFound();
  const prep=await buildWeddingPrepList(model);return <PrepListWorkspace prep={prep}/>;
}
