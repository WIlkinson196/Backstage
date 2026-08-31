import type { WeddingDocument } from "@/features/weddings/types/operations";
import { FileText, Download, Send, RefreshCw, TriangleAlert, CheckCircle2 } from "lucide-react";

export function DocumentCentre({ documents }: { documents: WeddingDocument[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {documents.map(doc => (
        <article key={doc.id} className="backstage-panel rounded-3xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2E9DC] text-[#765B39]"><FileText size={20}/></div>
            <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${
              doc.status === "issued" ? "bg-backstage-sage text-[#44604B]" :
              doc.status === "stale" ? "bg-backstage-blush text-[#7B5053]" :
              "bg-backstage-blue text-[#40516A]"
            }`}>{doc.status}</div>
          </div>
          <h3 className="backstage-display mt-5 text-2xl">{doc.title}</h3>
          <div className="mt-2 text-xs text-black/35">Version {doc.version}</div>

          {doc.changedSinceIssue && (
            <div className="mt-4 flex gap-2 rounded-xl bg-[#F8E8E5] p-3 text-xs text-[#7B5053]">
              <TriangleAlert size={14} className="shrink-0"/> Planning has changed since this was issued.
            </div>
          )}

          {!doc.changedSinceIssue && doc.status === "issued" && (
            <div className="mt-4 flex gap-2 rounded-xl bg-[#E7EFE8] p-3 text-xs text-[#44604B]">
              <CheckCircle2 size={14} className="shrink-0"/> Issued version matches current plan.
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-backstage-line bg-white"><Download size={14}/></button>
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-backstage-line bg-white"><RefreshCw size={14}/></button>
            <button className="grid h-9 w-9 place-items-center rounded-xl bg-backstage-ink text-white"><Send size={14}/></button>
          </div>
        </article>
      ))}
    </div>
  );
}
