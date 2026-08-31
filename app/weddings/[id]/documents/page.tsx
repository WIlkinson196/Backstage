import { getWeddingDocuments, getWeddingReadiness } from "@/features/weddings/services/operations-repository";
import { DocumentCentre } from "@/features/weddings/components/document-centre";
import { ReadinessGate } from "@/features/weddings/components/readiness-gate";

export default async function DocumentsPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [documents, checks] = await Promise.all([getWeddingDocuments(id), getWeddingReadiness(id)]);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="backstage-panel rounded-3xl p-7">
          <div className="backstage-kicker">Document centre</div>
          <h2 className="backstage-display mt-2 text-4xl">Generate once. Know when it&apos;s stale.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/45">
            Customer and operational documents are generated from the live wedding record, versioned, and checked against later planning changes.
          </p>
        </section>
        <ReadinessGate checks={checks}/>
      </div>
      <DocumentCentre documents={documents}/>
    </div>
  );
}
