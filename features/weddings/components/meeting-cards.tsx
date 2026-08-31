<<<<<<< HEAD
import type { WeddingMeeting } from "@/features/weddings/types/wedding";
=======
import type { WeddingMeeting } from "../types/wedding";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function MeetingCards({ meetings }: { meetings: WeddingMeeting[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {meetings.map((m) => {
        const pct = Math.round((m.completedFields / Math.max(1, m.totalFields)) * 100);
        return (
          <article key={m.id} className="backstage-panel rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold">{m.eyebrow}</div>
                <div className="mt-2 backstage-display text-2xl">{m.label}</div>
              </div>
              {m.status === "complete" && <CheckCircle2 size={20} className="text-[#5B7A61]"/>}
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-backstage-line">
              <div className="h-full rounded-full bg-backstage-gold" style={{ width: `${pct}%` }}/>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-black/40">{m.completedFields}/{m.totalFields} fields</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <button className="mt-5 flex items-center gap-2 text-xs font-semibold text-backstage-gold">
              Open meeting <ArrowRight size={14}/>
            </button>
          </article>
        );
      })}
    </div>
  );
}
