import Link from "next/link";
import { AlertTriangle, Calculator, CheckCircle2, ClipboardCheck, Printer, Sparkles } from "lucide-react";
import type { WeddingPrepList } from "@/features/weddings/types/prep";

const order=["General","Ceremony","Room Setup","Decor","Restaurant","Bar","Evening Food","Kitchen","Housekeeping","Reception"];

export function PrepListWorkspace({prep}:{prep:WeddingPrepList}){
  const groups=order.map(d=>[d,prep.rows.filter(r=>r.department===d)] as const).filter(([,r])=>r.length);
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[32px] bg-backstage-ink p-7 text-white lg:p-9">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-backstage-gold"><ClipboardCheck size={16}/> Wedding Prep Engine</div>
      <h2 className="backstage-display mt-4 text-4xl lg:text-5xl">Generate the prep list from the wedding.</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">Cutlery, crockery, champagne flutes, tables, chairs, centrepieces, décor, ceremony equipment, evening food equipment and cross-department checks are calculated from the operational wedding record.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="./prep/print" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-backstage-ink"><Printer size={15}/> Open printable prep list</Link>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        <Metric label="Checklist items" value={prep.summary.checklistItems}/><Metric label="Departments" value={prep.summary.departments}/><Metric label="Day guests" value={prep.summary.dayGuests}/><Metric label="Tables" value={prep.summary.tables}/>
      </div>
    </section>

    {prep.warnings.length>0&&<section className="space-y-2">{prep.warnings.map(w=><div key={w.id} className={`flex gap-3 rounded-2xl border p-4 ${w.level==="blocker"?"border-[#C97868]/30 bg-[#C97868]/[.07]":"border-[#D2A85D]/30 bg-[#D2A85D]/[.07]"}`}><AlertTriangle size={17}/><div><div className="text-sm font-semibold">{w.level==="blocker"?"Final issue warning":"Prep check required"}</div><div className="mt-1 text-sm text-black/50">{w.message}</div></div></div>)}</section>}

    <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-4">
        {groups.map(([department,rows])=><section key={department} className="backstage-panel overflow-hidden rounded-3xl">
          <div className="flex items-end justify-between gap-4 bg-[#171A1F] px-5 py-4 text-white"><div><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#D5B16E]">Prep department</div><h3 className="backstage-display mt-1 text-2xl">{department}</h3></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{rows.length} items</span></div>
          <div className="divide-y divide-black/[.06]">{rows.map(r=><div key={r.id} className="grid gap-3 p-4 md:grid-cols-[1fr_100px_1.25fr]"><div><div className="font-semibold">{r.item}</div><div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[.08em] text-black/30">{r.calculated&&<Calculator size={11}/>} {r.source}</div></div><div><div className="text-xs text-black/35">Quantity</div><div className="mt-1 text-lg font-semibold">{r.quantity}</div></div><div className="text-sm leading-6 text-black/45">{r.notes||"—"}</div></div>)}</div>
        </section>)}
      </div>
      <div className="space-y-5">
        <section className="backstage-panel rounded-3xl p-6"><div className="flex items-center gap-2"><Sparkles size={17}/><div className="backstage-kicker">What is smarter now</div></div><div className="mt-4 space-y-3 text-sm text-black/55">
          {["Uses the higher of day/evening guests for room chairs.","Counts welcome AND toast flute services separately.","Centrepieces follow the table count rather than guest count.","Cutlery/crockery follows meal-service style.","Evening equipment follows final evening-food covers.","Dietary and accessibility checks are carried into operational prep.","Adds Housekeeping and Reception handover checks so prep is venue-wide, not just room dressing."].map(x=><div key={x} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0"/><span>{x}</span></div>)}
        </div></section>
      </div>
    </section>
  </div>
}
function Metric({label,value}:{label:string;value:string|number}){return <div className="rounded-3xl border border-white/10 bg-white/[.05] p-4"><div className="text-xs text-white/35">{label}</div><div className="backstage-display mt-1 text-3xl">{value}</div></div>}
