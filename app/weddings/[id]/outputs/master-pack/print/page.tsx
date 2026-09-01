import { notFound } from "next/navigation";
import { buildWeddingOperationalModel } from "@/features/weddings/services/operational-model";
import { buildMasterOperationalPack } from "@/features/weddings/services/output-generator";
import { PrintOutputButton } from "@/features/weddings/components/print-output-button";

function date(v:string){if(!v)return "TBC";return new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(`${v}T12:00:00`))}

export default async function MasterPackPrintPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const model=await buildWeddingOperationalModel(id);if(!model)notFound();const pack=buildMasterOperationalPack(model),doc=pack.functionSheet;
 return <main className="min-h-screen bg-[#ECEAE5] py-8 text-[#171A1F] print:bg-white print:py-0">
  <div className="print-hide mx-auto mb-4 flex max-w-[210mm] justify-end px-4"><PrintOutputButton label="Print / Save Master Pack PDF"/></div>
  <div className="mx-auto w-[210mm] bg-white shadow-xl print:shadow-none">
   <section className="flex min-h-[297mm] flex-col justify-between bg-[#171A1F] px-[18mm] py-[18mm] text-white">
    <div><div className="text-[11px] font-bold uppercase tracking-[.26em] text-[#D5B16E]">THE GRANARY AT WINDMILL FARM</div><div className="mt-[38mm] text-[10px] font-bold uppercase tracking-[.2em] text-white/40">CONTROLLED EVENT DOCUMENT</div><h1 className="mt-4 max-w-[150mm] text-[44px] font-semibold leading-[1.04]">Wedding Master<br/>Operational Pack</h1><div className="mt-[12mm] text-[22px]">{doc.couple}</div><div className="mt-2 text-[14px] text-white/55">{date(doc.eventDate)}</div></div>
    <div><div className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] ${pack.status==="blocked"?"border-[#D68778] text-[#E4A496]":"border-[#8EAA92] text-[#AFC7B2]"}`}>{pack.status==="blocked"?"NOT READY FOR FINAL ISSUE":"READY FOR CONTROLLED ISSUE"}</div><div className="mt-5 grid grid-cols-3 gap-3 text-[10px] text-white/45"><div>Version<br/><strong className="text-white">{pack.version}</strong></div><div>Coordinator<br/><strong className="text-white">{doc.coordinator}</strong></div><div>Package<br/><strong className="text-white">{doc.packageName}</strong></div></div></div>
   </section>

   <section className="min-h-[297mm] break-before-page px-[14mm] py-[12mm]">
    <div className="text-[9px] font-bold uppercase tracking-[.18em] text-black/40">Pack control</div><h2 className="mt-2 text-[28px] font-semibold">Finalisation & readiness</h2>
    <div className="mt-6 grid grid-cols-4 gap-3"><Card l="Readiness" v={`${doc.readiness.score}%`}/><Card l="Blockers" v={doc.readiness.blockers}/><Card l="Warnings" v={doc.readiness.warnings}/><Card l="Version" v={pack.version}/></div>
    <div className="mt-7 space-y-3">{pack.checks.map(c=><div key={c.id} className={`rounded-[4mm] border p-[4mm] ${c.status==="block"?"border-[#C97868]/35 bg-[#C97868]/[.05]":c.status==="warning"?"border-[#D2A85D]/35 bg-[#D2A85D]/[.05]":"border-[#7E9B82]/30 bg-[#7E9B82]/[.04]"}`}><div className="flex justify-between gap-4"><strong className="text-[11px]">{c.label}</strong><span className="text-[8px] font-bold uppercase tracking-[.1em]">{c.status}</span></div><p className="mt-1 text-[9px] leading-4 text-black/50">{c.detail}</p></div>)}</div>
    {pack.issueWarnings.length>0&&<div className="mt-7 rounded-[4mm] border border-[#C97868]/35 bg-[#C97868]/[.05] p-[5mm]"><div className="text-[9px] font-bold uppercase tracking-[.14em]">Issue warnings</div><ul className="mt-3 space-y-2 text-[10px]">{pack.issueWarnings.map(x=><li key={x}>• {x}</li>)}</ul></div>}
   </section>

   <section className="min-h-[297mm] break-before-page px-[14mm] py-[12mm]">
    <div className="text-[9px] font-bold uppercase tracking-[.18em] text-black/40">Function sheet</div><h2 className="mt-2 text-[28px] font-semibold">{doc.couple}</h2><div className="mt-1 text-[11px] text-black/45">{date(doc.eventDate)} · {doc.packageName}</div>
    <div className="mt-5 grid grid-cols-4 gap-3"><Card l="Ceremony" v={doc.guestNumbers.ceremony}/><Card l="Day" v={doc.guestNumbers.day}/><Card l="Evening" v={doc.guestNumbers.evening}/><Card l="Dietary" v={doc.guestNumbers.dietary}/></div>
    <div className="mt-6 grid grid-cols-2 gap-[5mm]">{doc.sections.map(s=><section key={s.key} className="break-inside-avoid rounded-[4mm] border border-black/10 p-[5mm]"><h3 className="text-[11px] font-bold uppercase tracking-[.08em]">{s.title}</h3><div className="mt-3">{s.rows.map(r=><div key={r.label} className="grid grid-cols-[.9fr_1.1fr] gap-3 border-t border-black/[.07] py-2 text-[9px] first:border-0"><span className="text-black/45">{r.label}</span><strong className="text-right">{r.value}</strong></div>)}</div></section>)}</div>
   </section>

   <section className="min-h-[297mm] break-before-page px-[14mm] py-[12mm]">
    <div className="text-[9px] font-bold uppercase tracking-[.18em] text-black/40">Live event execution</div><h2 className="mt-2 text-[28px] font-semibold">Operational Running Order</h2>
    <table className="mt-5 w-full border-collapse text-[9px]"><thead><tr className="bg-[#171A1F] text-left text-white"><Th>Time</Th><Th>Moment</Th><Th>Owner</Th><Th>Location</Th><Th>Notes</Th></tr></thead><tbody>{doc.runningOrder.map(r=><tr key={r.time+r.title} className="border-b border-black/10 align-top"><Td><strong>{r.time}</strong></Td><Td><strong>{r.title}</strong></Td><Td>{r.owner}</Td><Td>{r.location}</Td><Td>{r.notes||"—"}</Td></tr>)}</tbody></table>
   </section>
   <footer className="border-t border-black/10 px-[14mm] py-[5mm] text-[8px] text-black/40">Backstage · Wedding Master Operational Pack · Version {pack.version} · Generated {new Date(pack.generatedAt).toLocaleString("en-GB")}</footer>
  </div>
 </main>
}
function Card({l,v}:{l:string;v:string|number}){return <div className="rounded-[4mm] bg-black/[.035] p-[4mm]"><div className="text-[8px] font-bold uppercase tracking-[.1em] text-black/35">{l}</div><div className="mt-1 text-[20px] font-semibold">{v}</div></div>}
function Th({children}:{children:React.ReactNode}){return <th className="px-3 py-2 text-[8px] font-bold uppercase tracking-[.08em]">{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td className="px-3 py-2.5">{children}</td>}
