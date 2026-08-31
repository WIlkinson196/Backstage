import { getFunctionSheet, getWeddingReadiness } from "@/features/weddings/services/operations-repository";
import { FunctionSheetPreview } from "@/features/weddings/components/function-sheet-preview";
import { ReadinessGate } from "@/features/weddings/components/readiness-gate";

export default async function FunctionSheetPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [sections, checks] = await Promise.all([getFunctionSheet(id), getWeddingReadiness(id)]);
  return (
    <div className="space-y-6">
      <FunctionSheetPreview sections={sections}/>
      <ReadinessGate checks={checks}/>
    </div>
  );
}
