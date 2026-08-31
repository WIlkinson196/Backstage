import { Sparkles, ArrowRight, TrendingUp, TriangleAlert } from "lucide-react";

export function IntelligencePanel() {
  return (
    <section className="rounded-[28px] bg-backstage-ink p-6 text-white">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-backstage-gold">
        <Sparkles size={15} /> Sales Intelligence
      </div>
      <h2 className="backstage-display mt-3 text-3xl">The pipeline is telling you something.</h2>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
          <div className="flex items-center gap-2 text-xs text-[#E2C69D]"><TrendingUp size={14}/> Buying signal</div>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Rebecca&apos;s wedding proposal is at a strong stage with no follow-up booked after recent engagement.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
          <div className="flex items-center gap-2 text-xs text-[#E2C69D]"><TriangleAlert size={14}/> Revenue at risk</div>
          <p className="mt-2 text-sm leading-6 text-white/65">
            A provisional corporate booking is close to expiry and needs a decision.
          </p>
        </div>
      </div>

      <button className="mt-5 flex items-center gap-2 text-sm font-semibold">
        Review recommended actions <ArrowRight size={15}/>
      </button>
    </section>
  );
}
