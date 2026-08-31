import type { PlanningSection } from "../types/commercial";
import { CheckCircle2, CircleAlert, ArrowRight } from "lucide-react";

export function PlanningSectionCard({ section }: { section: PlanningSection }) {
  const missing = section.fields.filter(f => f.status !== "complete").length;

  return (
    <article className="backstage-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.13em] text-backstage-gold">{section.owner}</div>
          <h3 className="backstage-display mt-2 text-2xl">{section.title}</h3>
          <p className="mt-2 text-xs leading-5 text-black/40">{section.description}</p>
        </div>
        <div className="text-right">
          <div className="backstage-display text-3xl">{section.progress}%</div>
          <div className="text-[10px] text-black/30">complete</div>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-backstage-line">
        <div className="h-full rounded-full bg-backstage-gold" style={{width:`${section.progress}%`}}/>
      </div>

      <div className="mt-5 space-y-2">
        {section.fields.slice(0,4).map(field => (
          <div key={field.key} className="flex items-center justify-between gap-3 rounded-xl bg-backstage-cream px-3 py-2.5 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              {field.status === "complete" ? <CheckCircle2 size={14} className="shrink-0 text-[#5B7A61]"/> : <CircleAlert size={14} className="shrink-0 text-backstage-gold"/>}
              <span className="truncate">{field.label}</span>
            </div>
            <span className="truncate text-black/35">{field.value ?? (field.status === "missing" ? "Missing" : "Review")}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs text-black/35">{missing ? `${missing} field${missing === 1 ? "" : "s"} need attention` : "Complete"}</div>
        <button className="inline-flex items-center gap-2 text-xs font-semibold text-backstage-gold">Open section <ArrowRight size={14}/></button>
      </div>
    </article>
  );
}
