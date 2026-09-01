import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, LockKeyhole, ShieldAlert } from "lucide-react";
import type { FunctionSheetDocument, MasterOperationalPack } from "@/features/weddings/types/output-document";

export function FunctionSheetOutput({sheet,pack}:{sheet:FunctionSheetDocument;pack:MasterOperationalPack}){
  const blocked=sheet.status==="blocked";
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[32px] bg-backstage-ink text-white">
      <div className="grid xl:grid-cols-[1.15fr_.85fr]">
        <div className="p-7 lg:p-9">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-backstage-gold"><FileText size={16}/> Operational Output Engine</div>
          <h2 className="backstage-display mt-4 text-4xl lg:text-5xl">Function Sheet + Master Operational Pack</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">Generated from the Wedding Operational Model. The document itself does not recalculate guest numbers, timings or commercial values.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`./outputs/function-sheet/print`} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${blocked?"pointer-events-none bg-white/10 text-white/35":"bg-white text-backstage-ink"}`}>Open Function Sheet <ArrowRight size={15}/></Link>
            <Link href={`./outputs/master-pack/print`} className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold ${blocked?"pointer-events-none text-white/30":"text-white"}`}>Open Master Pack <ArrowRight size={15}/></Link>
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/[.035] p-7 lg:p-9 xl:border-l xl:border-t-0">
          <div className={`rounded-3xl border p-5 ${blocked?"border-[#C97868]/30 bg-[#C97868]/[.08]":"border-[#7E9B82]/30 bg-[#7E9B82]/[.08]"}`}>
            <div className="flex items-center gap-2 font-semibold">{blocked?<ShieldAlert size={18}/>:<CheckCircle2 size={18}/>} {blocked?"Issue blocked":"Ready to issue"}</div>
            <p className="mt-2 text-sm leading-6 text-white/55">{blocked?`${sheet.readiness.blockers} blocker(s) must be resolved before this becomes a controlled final issue.`:"No blocking readiness checks are currently preventing issue."}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Metric label="Readiness" value={`${sheet.readiness.score}%`}/>
            <Metric label="Warnings" value={String(sheet.readiness.warnings)}/>
            <Metric label="Version" value={`v${sheet.version}`}/>
          </div>
        </div>
      </div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <div className="backstage-panel rounded-3xl p-6 lg:p-7">
        <div className="backstage-kicker">Function sheet preview</div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div><h3 className="backstage-display text-3xl">{sheet.couple}</h3><p className="mt-1 text-sm text-black/40">{sheet.eventDate} · {sheet.packageName} · Coordinator {sheet.coordinator}</p></div>
          <span className="rounded-full bg-black/[.05] px-3 py-1.5 text-xs font-semibold text-black/45">{sheet.status.toUpperCase()}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Fact label="Day" value={sheet.guestNumbers.day}/>
          <Fact label="Evening" value={sheet.guestNumbers.evening}/>
          <Fact label="Dietary" value={sheet.guestNumbers.dietary}/>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sheet.sections.map(s=><section key={s.key} className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between gap-3"><h4 className="font-semibold">{s.title}</h4><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${s.status==="complete"?"bg-[#E8F0E8] text-[#617A66]":"bg-[#F3EADB] text-[#8A6D3C]"}`}>{s.status}</span></div>
            <div className="mt-4 space-y-2">{s.rows.map(r=><div key={`${s.key}-${r.label}`} className="flex justify-between gap-5 border-b border-black/[.06] pb-2 text-sm last:border-0"><span className="text-black/40">{r.label}</span><span className="text-right font-medium">{r.value}</span></div>)}</div>
          </section>)}
        </div>
      </div>

      <div className="space-y-6">
        <section className="backstage-panel rounded-3xl p-6">
          <div className="backstage-kicker">Issue control</div>
          <h3 className="backstage-display mt-2 text-3xl">Controlled output</h3>
          <div className="mt-4 space-y-3 text-sm">
            <Control title="Version stamped" body={`Current generated version: ${sheet.version}`}/>
            <Control title="Source fingerprints" body="Planning, guests, timings, commercial and operations are fingerprinted."/>
            <Control title="Change protection" body="A later source-data change can mark the issued snapshot stale / reissue required."/>
            <Control title="No silent issue" body="Final issue remains a deliberate venue-team action."/>
          </div>
        </section>
        <section className="backstage-panel rounded-3xl p-6">
          <div className="backstage-kicker">Master pack contents</div>
          <div className="mt-4 space-y-2 text-sm text-black/55">
            {["Controlled cover & issue state","Full Function Sheet","Operational Running Order","Readiness / finalisation checks","Issue warnings & blockers"].map(x=><div key={x} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0"/>{x}</div>)}
          </div>
        </section>
      </div>
    </section>

    {blocked&&<section className="rounded-3xl border border-[#C97868]/25 bg-[#C97868]/[.07] p-6">
      <div className="flex gap-3"><AlertTriangle size={19}/><div><div className="font-semibold">Final issue is deliberately blocked</div><p className="mt-1 text-sm text-black/50">Backstage can preview the underlying data, but the controlled print links are disabled until blocking readiness items are resolved.</p></div></div>
    </section>}
  </div>
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.05] p-3"><div className="text-[11px] text-white/35">{label}</div><div className="backstage-display mt-1 text-2xl">{value}</div></div>}
function Fact({label,value}:{label:string;value:string|number}){return <div className="rounded-2xl bg-black/[.025] p-4"><div className="text-xs text-black/35">{label}</div><div className="backstage-display mt-1 text-3xl">{value}</div></div>}
function Control({title,body}:{title:string;body:string}){return <div className="flex gap-3 rounded-2xl bg-black/[.025] p-3"><LockKeyhole size={15} className="mt-0.5 shrink-0"/><div><div className="font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-black/40">{body}</div></div></div>}
