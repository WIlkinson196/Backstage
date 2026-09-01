import { notFound } from "next/navigation";
import { buildWeddingOperationalModel } from "@/features/weddings/services/operational-model";
import { buildWeddingPrepList } from "@/features/weddings/services/prep-generator";
import { PrintOutputButton } from "@/features/weddings/components/print-output-button";

const order=["General","Ceremony","Room Setup","Decor","Restaurant","Bar","Evening Food","Kitchen","Housekeeping","Reception"];
const descriptions:Record<string,string>={
 General:"Final venue checks and operational documents.",Ceremony:"Ceremony preparation and registrar setup.",
 "Room Setup":"Physical room, chairs, tables and covers.",Decor:"Booked decor and finishing touches.",
 Restaurant:"Wedding breakfast crockery, cutlery, glassware and table prep.",Bar:"Drinks and glassware preparation.",
 "Evening Food":"Equipment for evening food service.",Kitchen:"Final kitchen service-control checks.",
 Housekeeping:"Guest-facing presentation and facilities.",Reception:"Hotel / supplier / guest arrival handover."
};
function fmtDate(v:string){if(!v)return"Date TBC";return new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(`${v}T12:00:00`))}
export default async function PrepPrintPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const model=await buildWeddingOperationalModel(id);if(!model)notFound();const prep=await buildWeddingPrepList(model);
 const groups=order.map(d=>[d,prep.rows.filter(r=>r.department===d)] as const).filter(([,r])=>r.length);
 return <main className="min-h-screen bg-[#ECEAE5] py-8 text-[#20251F] print:bg-white print:py-0">
  <div className="print-hide mx-auto mb-4 flex max-w-[210mm] justify-end px-4"><PrintOutputButton label="Print / Save Prep List PDF"/></div>
  <article className="mx-auto w-[210mm] min-h-[297mm] bg-white px-[12mm] py-[11mm] shadow-xl print:shadow-none">
   <header className="grid grid-cols-[1fr_52mm] gap-[12mm] border-b-[2.5px] border-[#52613D] pb-[8mm]">
    <div><div className="text-[8px] font-extrabold uppercase tracking-[.16em] text-[#65764B]">THE GRANARY AT WINDMILL FARM · WEDDING PREP LIST</div><h1 className="mt-[2mm] text-[30px] font-medium">{prep.couple}</h1><div className="mt-[3mm] flex flex-wrap gap-x-[5mm] gap-y-[2mm] text-[9px] text-black/55"><span>{fmtDate(prep.eventDate)}</span><span>Package <strong className="text-black">{prep.packageName}</strong></span><span>Day <strong className="text-black">{prep.summary.dayGuests}</strong></span><span>Evening <strong className="text-black">{prep.summary.eveningGuests}</strong></span><span>Tables <strong className="text-black">{prep.summary.tables}</strong></span></div></div>
    <div className="rounded-[3mm] border border-black/10 bg-black/[.02] p-[4mm] text-[8px] leading-5"><strong>PREP OWNER</strong><Line/><strong>PREP DATE</strong><Line/><strong>FINAL CHECK</strong><Line/></div>
   </header>
   {prep.warnings.map(w=><div key={w.id} className="mt-[3mm] break-inside-avoid border border-[#D48B69] border-l-[4px] bg-[#FFF7F2] p-[3mm] text-[8px] font-bold text-[#72361F]">ACTION REQUIRED · {w.message}</div>)}
   <div className="mt-[5mm] grid grid-cols-4 gap-[2.5mm]"><Summary l="Checklist items" v={prep.summary.checklistItems}/><Summary l="Departments" v={prep.summary.departments}/><Summary l="Day guests" v={prep.summary.dayGuests}/><Summary l="Evening guests" v={prep.summary.eveningGuests}/></div>
   {groups.map(([department,rows])=><section key={department} className="mt-[4.5mm]">
    <div className="flex items-end justify-between gap-[4mm] rounded-t-[2mm] bg-[#52613D] px-[3.2mm] py-[2.8mm] text-white"><div><h2 className="text-[15px] font-medium">{department}</h2><p className="mt-[.6mm] text-[7px] text-white/80">{descriptions[department]}</p></div><span className="rounded-full bg-white/10 px-[2mm] py-[1mm] text-[7px] font-bold">{rows.length} items</span></div>
    <table className="w-full table-fixed border-collapse text-[8px]"><thead><tr className="bg-[#F3F5EF] text-[7px] uppercase tracking-[.08em] text-black/45"><Th cls="w-[11mm] text-center">Done</Th><Th>Prep item</Th><Th cls="w-[25mm] text-center">Qty</Th><Th cls="w-[64mm]">Operational note</Th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="break-inside-avoid border-b border-black/10 even:bg-black/[.012]"><td className="p-[2mm] text-center"><span className="inline-block h-[5.6mm] w-[5.6mm] rounded-[.7mm] border-[1.5px] border-[#4B5447]"/></td><td className="p-[2mm] font-bold">{r.item}<div className="mt-1 text-[6px] font-normal uppercase tracking-[.06em] text-black/30">{r.source}</div></td><td className="p-[2mm] text-center text-[9px] font-extrabold">{r.quantity}</td><td className="p-[2mm] text-[7px] leading-[1.35] text-black/55">{r.notes||"—"}</td></tr>)}</tbody></table>
   </section>)}
   <section className="mt-[6mm] grid break-inside-avoid grid-cols-2 gap-[5mm] rounded-[2mm] border border-black/15 p-[4mm]"><h3 className="col-span-2 text-[13px] font-medium">Final room & prep sign-off</h3><Sign l="Prepared by"/><Sign l="Checked by"/></section>
   <footer className="mt-[5mm] flex justify-between gap-4 border-t border-black/15 pt-[2.5mm] text-[6.5px] text-black/45"><span>Backstage · Wedding Prep List · Controlled operational output</span><span>Version {prep.version} · Generated {new Date(prep.generatedAt).toLocaleString("en-GB")}</span></footer>
  </article>
 </main>
}
function Line(){return <span className="mb-[2mm] block h-[7mm] border-b border-black/30"/>}
function Summary({l,v}:{l:string;v:string|number}){return <div className="rounded-[2mm] border border-black/10 bg-black/[.02] p-[2.5mm]"><small className="block text-[6px] uppercase tracking-[.08em] text-black/45">{l}</small><strong className="mt-1 block text-[10px]">{v}</strong></div>}
function Th({children,cls=""}:{children:React.ReactNode;cls?:string}){return <th className={`p-[2mm] text-left ${cls}`}>{children}</th>}
function Sign({l}:{l:string}){return <div className="text-[8px] font-bold">{l}<span className="mt-[2mm] block h-[8mm] border-b border-black/30"/></div>}
