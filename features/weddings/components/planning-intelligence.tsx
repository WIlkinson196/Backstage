import type { PlanningSection } from "../types/commercial";
import { Sparkles, TriangleAlert, CheckCircle2, ArrowRight } from "lucide-react";

export function PlanningIntelligence({ sections }: { sections: PlanningSection[] }) {
  const missing = sections.flatMap(s => s.fields.filter(f => f.status === "missing").map(f => `${s.title}: ${f.label}`));
  const review = sections.flatMap(s => s.fields.filter(f => f.status === "review").map(f => `${s.title}: ${f.label}`));
  const avg = sections.length ? Math.round(sections.reduce((sum,s) => sum+s.progress,0)/sections.length) : 0;

  return (
    <section className="rounded-3xl bg-backstage-ink p-6 text-white">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-backstage-gold"><Sparkles size={15}/> Planning intelligence</div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div><h2 className="backstage-display text-3xl">The plan is {avg}% complete.</h2><p className="mt-2 text-sm text-white/45">Backstage is checking completeness across the same data used later by operations.</p></div>
        <div className="backstage-display text-5xl text-[#E2C69D]">{missing.length + review.length}</div>
      </div>
      <div className="mt-6 space-y-3">
        {missing.slice(0,3).map(x => (
          <div key={x} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-[#E2C69D]"/>
            <div className="text-sm text-white/65">{x}</div>
          </div>
        ))}
        {missing.length === 0 && review.length === 0 && (
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4">
            <CheckCircle2 size={16} className="text-[#91B69A]"/><div className="text-sm text-white/65">No planning gaps detected.</div>
          </div>
        )}
      </div>
      <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Open all gaps <ArrowRight size={15}/></button>
    </section>
  );
}
