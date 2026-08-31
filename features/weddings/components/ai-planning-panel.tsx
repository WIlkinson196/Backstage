import { Sparkles, TriangleAlert, CheckCircle2, ArrowRight } from "lucide-react";

export function AiPlanningPanel() {
  return (
    <section className="rounded-3xl bg-backstage-ink p-6 text-white">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-backstage-gold">
        <Sparkles size={15}/> Backstage Wedding Intelligence
      </div>
      <h2 className="backstage-display mt-3 text-3xl">Three planning checks need attention.</h2>
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
          <div className="flex gap-3"><TriangleAlert size={16} className="mt-1 shrink-0 text-[#E2C69D]"/><div><div className="text-sm font-semibold">Final meeting incomplete</div><p className="mt-1 text-xs leading-5 text-white/50">12 guided fields are still outstanding before finalisation.</p></div></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
          <div className="flex gap-3"><TriangleAlert size={16} className="mt-1 shrink-0 text-[#E2C69D]"/><div><div className="text-sm font-semibold">Supplier information missing</div><p className="mt-1 text-xs leading-5 text-white/50">DJ confirmation has not yet been recorded.</p></div></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
          <div className="flex gap-3"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#91B69A]"/><div><div className="text-sm font-semibold">Payments currently on plan</div><p className="mt-1 text-xs leading-5 text-white/50">No overdue payment milestone is detected.</p></div></div>
        </div>
      </div>
      <button className="mt-5 flex items-center gap-2 text-sm font-semibold">Review planning gaps <ArrowRight size={15}/></button>
    </section>
  );
}
