import { notFound } from "next/navigation";
import { buildWeddingOperationalModel } from "@/features/weddings/services/operational-model";
import { buildFunctionSheetDocument } from "@/features/weddings/services/output-generator";
import { PrintOutputButton } from "@/features/weddings/components/print-output-button";

function money(v:number){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(v)}
function date(v:string){if(!v)return "TBC";return new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(`${v}T12:00:00`))}

export default async function FunctionSheetPrintPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const model=await buildWeddingOperationalModel(id);if(!model)notFound();
  const doc=buildFunctionSheetDocument(model);
  return <main className="min-h-screen bg-[#ECEAE5] py-8 text-[#171A1F] print:bg-white print:py-0">
    <div className="print-hide mx-auto mb-4 flex max-w-[210mm] justify-end px-4"><PrintOutputButton/></div>
    <article className="mx-auto w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none">
      <header className="bg-[#171A1F] px-[14mm] py-[11mm] text-white">
        <div className="flex items-start justify-between gap-8"><div><div className="text-[10px] font-bold uppercase tracking-[.24em] text-[#D5B16E]">THE GRANARY AT WINDMILL FARM</div><h1 className="mt-3 text-[28px] font-semibold tracking-tight">Wedding Function Sheet</h1><div className="mt-2 text-sm text-white/55">Controlled operational copy · Version {doc.version}</div></div><div className="text-right text-xs leading-5 text-white/55"><strong className="text-white">{doc.couple}</strong><br/>{date(doc.eventDate)}<br/>Coordinator: {doc.coordinator}</div></div>
      </header>
      <section className="grid grid-cols-5 border-b border-black/10">
        <TopFact label="Package" value={doc.packageName}/><TopFact label="Ceremony" value={doc.guestNumbers.ceremony}/><TopFact label="Day" value={doc.guestNumbers.day}/><TopFact label="Evening" value={doc.guestNumbers.evening}/><TopFact label="Dietary" value={doc.guestNumbers.dietary}/>
      </section>
      <div className="px-[14mm] py-[10mm]">
        <div className="grid grid-cols-2 gap-[5mm]">
          {doc.sections.map(s=><section key={s.key} className="break-inside-avoid rounded-[4mm] border border-black/10 p-[5mm]">
            <div className="flex items-center justify-between gap-3"><h2 className="text-[13px] font-bold uppercase tracking-[.08em]">{s.title}</h2><span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase ${s.status==="complete"?"bg-[#E8F0E8] text-[#617A66]":"bg-[#F3EADB] text-[#8A6D3C]"}`}>{s.status}</span></div>
            <div className="mt-3">{s.rows.map(r=><div key={r.label} className="grid grid-cols-[.9fr_1.1fr] gap-3 border-t border-black/[.07] py-2 text-[10px] first:border-0"><span className="text-black/45">{r.label}</span><strong className="text-right font-semibold">{r.value}</strong></div>)}</div>
          </section>)}
        </div>

        <section className="mt-[7mm] break-before-page">
          <div className="flex items-end justify-between gap-4"><div><div className="text-[9px] font-bold uppercase tracking-[.18em] text-black/40">Event execution</div><h2 className="mt-1 text-[22px] font-semibold">Operational Running Order</h2></div><div className="text-right text-[9px] text-black/40">Generated {new Date(doc.generatedAt).toLocaleString("en-GB")}</div></div>
          <table className="mt-4 w-full border-collapse text-[9px]"><thead><tr className="bg-[#171A1F] text-left text-white"><Th>Time</Th><Th>Moment</Th><Th>Owner</Th><Th>Location</Th><Th>Operational notes</Th></tr></thead><tbody>{doc.runningOrder.map(r=><tr key={r.time+r.title} className="border-b border-black/10 align-top"><Td><strong>{r.time}</strong></Td><Td><strong>{r.title}</strong></Td><Td>{r.owner}</Td><Td>{r.location}</Td><Td>{r.notes||"—"}</Td></tr>)}</tbody></table>
        </section>

        <section className="mt-[7mm] grid grid-cols-2 gap-[5mm]">
          <div className="rounded-[4mm] border border-black/10 p-[5mm]"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-black/40">Commercial control</div><div className="mt-3 space-y-2 text-[10px]"><Row l="Quoted" v={money(doc.commercial.quoted)}/><Row l="Paid" v={money(doc.commercial.paid)}/><Row l="Balance" v={money(doc.commercial.balance)}/></div></div>
          <div className={`rounded-[4mm] border p-[5mm] ${doc.status==="blocked"?"border-[#C97868]/40 bg-[#C97868]/[.06]":"border-[#7E9B82]/40 bg-[#7E9B82]/[.06]"}`}><div className="text-[9px] font-bold uppercase tracking-[.14em]">Issue state</div><div className="mt-2 text-[17px] font-semibold">{doc.status==="blocked"?"NOT READY FOR FINAL ISSUE":"READY FOR CONTROLLED ISSUE"}</div><div className="mt-1 text-[9px] text-black/50">Readiness {doc.readiness.score}% · {doc.readiness.blockers} blockers · {doc.readiness.warnings} warnings</div></div>
        </section>
      </div>
      <footer className="border-t border-black/10 px-[14mm] py-[5mm] text-[8px] text-black/40">Backstage · Wedding Function Sheet · Version {doc.version} · Generated from the Wedding Operational Model</footer>
    </article>
  </main>
}
function TopFact({label,value}:{label:string;value:string|number}){return <div className="border-r border-black/10 px-[5mm] py-[4mm] last:border-0"><div className="text-[8px] font-bold uppercase tracking-[.12em] text-black/35">{label}</div><div className="mt-1 text-[15px] font-semibold">{value}</div></div>}
function Th({children}:{children:React.ReactNode}){return <th className="px-3 py-2 text-[8px] font-bold uppercase tracking-[.08em]">{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td className="px-3 py-2.5">{children}</td>}
function Row({l,v}:{l:string;v:string}){return <div className="flex justify-between gap-4 border-b border-black/[.07] pb-2 last:border-0"><span className="text-black/45">{l}</span><strong>{v}</strong></div>}
