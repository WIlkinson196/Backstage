<<<<<<< HEAD
import type { ReadinessCheck } from "@/features/weddings/types/operations";
=======
import type { ReadinessCheck } from "../types/operations";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { CheckCircle2, TriangleAlert, OctagonAlert, Sparkles } from "lucide-react";

export function ReadinessGate({ checks }: { checks: ReadinessCheck[] }) {
  const blocks = checks.filter(x=>x.status==="block").length;
  const warnings = checks.filter(x=>x.status==="warning").length;

  return (
    <section className="rounded-3xl bg-backstage-ink p-6 text-white">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-backstage-gold"><Sparkles size={15}/> Finalisation gate</div>
      <h2 className="backstage-display mt-3 text-3xl">{blocks ? "Not ready to issue final pack." : "Ready for final review."}</h2>
      <p className="mt-2 text-sm text-white/45">{blocks} blocking · {warnings} warnings</p>

      <div className="mt-6 space-y-3">
        {checks.map(check => {
          const Icon = check.status==="pass" ? CheckCircle2 : check.status==="warning" ? TriangleAlert : OctagonAlert;
          return (
            <div key={check.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4">
              <Icon size={17} className={`mt-0.5 shrink-0 ${check.status==="pass" ? "text-[#91B69A]" : check.status==="warning" ? "text-[#E2C69D]" : "text-[#E5A29A]"}`}/>
              <div>
                <div className="text-sm font-semibold">{check.label}</div>
                <div className="mt-1 text-xs leading-5 text-white/45">{check.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
