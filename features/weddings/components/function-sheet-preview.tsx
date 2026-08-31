import type { FunctionSheetSection } from "@/features/weddings/types/operations";
import { TriangleAlert, CheckCircle2, Printer, FileDown } from "lucide-react";

export function FunctionSheetPreview({ sections }: { sections: FunctionSheetSection[] }) {
  const attention = sections.filter(x => x.status === "attention").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="backstage-panel rounded-3xl p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="backstage-kicker">Operational document</div>
            <h2 className="backstage-display mt-2 text-4xl">Function Sheet</h2>
            <p className="mt-2 text-sm text-black/40">Generated from the live wedding record — not maintained as a second copy.</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3 text-xs font-semibold"><Printer size={14}/> Print</button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><FileDown size={14}/> Generate PDF</button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {sections.map(section => (
            <article key={section.key} className="rounded-2xl border border-backstage-line bg-[#FFFCF8] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="backstage-display text-xl">{section.title}</h3>
                {section.status === "complete" ? <CheckCircle2 size={17} className="text-[#5B7A61]"/> : <TriangleAlert size={17} className="text-backstage-gold"/>}
              </div>
              <div className="mt-4 divide-y divide-backstage-line">
                {section.rows.map(row => (
                  <div key={row.label} className="grid grid-cols-[120px_1fr] gap-3 py-2.5 text-xs">
                    <div className="text-black/35">{row.label}</div>
                    <div className="font-medium">{row.value}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-3xl bg-backstage-ink p-6 text-white">
        <div className="text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold">Issue control</div>
        <div className="mt-3 backstage-display text-4xl">{attention}</div>
        <div className="mt-1 text-sm text-white/45">sections still need attention</div>
        <p className="mt-5 text-sm leading-6 text-white/55">
          Backstage should prevent a document being treated as final while blocking information is missing, and flag it for re-issue if source planning changes later.
        </p>
      </aside>
    </div>
  );
}
