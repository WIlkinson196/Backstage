import type { PortalWedding } from "../types/portal";
import { CalendarDays, Sparkles } from "lucide-react";

export function PortalHero({wedding}:{wedding:PortalWedding}) {
  return (
    <section className="relative min-h-[510px] overflow-hidden rounded-[34px] text-white shadow-xl" style={{backgroundImage:`url("${wedding.heroImage}")`,backgroundSize:"cover",backgroundPosition:"center"}}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D1620]/88 via-[#0D1620]/48 to-[#0D1620]/15"/>
      <div className="relative flex min-h-[510px] flex-col justify-between p-7 md:p-10">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#E4C89C]"><Sparkles size={14}/> Your wedding at {wedding.venueName}</div>
        <div>
          <div className="font-serif text-5xl leading-none md:text-7xl">{wedding.couple}</div>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/65">
            <span className="flex items-center gap-2"><CalendarDays size={15}/>{wedding.eventDate}</span>
            <span>•</span><span>{wedding.daysToGo} days to go</span>
          </div>
          <div className="mt-8 max-w-xl rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-end justify-between gap-4"><div><div className="text-[10px] uppercase tracking-[.14em] text-white/40">Planning progress</div><div className="mt-2 font-serif text-3xl">{wedding.planningProgress}% complete</div></div><div className="text-right text-xs text-white/45">Next<br/><span className="font-semibold text-white/80">{wedding.nextMilestone}</span></div></div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#D8B77D]" style={{width:`${wedding.planningProgress}%`}}/></div>
          </div>
        </div>
      </div>
    </section>
  );
}
