import type { PortalTask } from "@/features/portal/types/portal";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export function PortalTasks({tasks}:{tasks:PortalTask[]}) {
  return (
    <section className="rounded-3xl border border-[#E8E0D6] bg-[#FFFCF8] p-6">
      <div className="flex items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#A37E4B]">Your next steps</div><h2 className="mt-2 font-serif text-3xl">A few things to finish</h2></div><span className="text-xs text-black/35">{tasks.filter(t=>t.status!=="complete").length} outstanding</span></div>
      <div className="mt-5 divide-y divide-[#E8E0D6]">
        {tasks.map(t=><div key={t.id} className="flex gap-3 py-4">
          {t.status==="complete"?<CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#5D7A62]"/>:<Circle size={18} className="mt-0.5 shrink-0 text-[#B6915D]"/>}
          <div className="min-w-0 flex-1"><div className={`text-sm font-semibold ${t.status==="complete"?"text-black/35 line-through":""}`}>{t.title}</div><div className="mt-1 text-xs leading-5 text-black/40">{t.detail}</div><div className="mt-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#A37E4B]">{t.category} · {t.dueDate}</div></div>
          {t.status!=="complete"&&<ArrowRight size={15} className="mt-1 text-black/25"/>}
        </div>)}
      </div>
    </section>
  );
}
