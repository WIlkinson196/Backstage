<<<<<<< HEAD
import type { PortalDocument } from "@/features/portal/types/portal";
=======
import type { PortalDocument } from "../types/portal";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { FileText, Download, Clock3 } from "lucide-react";

export function PortalDocuments({documents}:{documents:PortalDocument[]}) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{documents.map(d=><article key={d.id} className="rounded-3xl border border-[#E8E0D6] bg-[#FFFCF8] p-5"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EFE6D9] text-[#765B39]"><FileText size={19}/></div><h3 className="mt-5 font-serif text-2xl">{d.title}</h3><p className="mt-2 text-sm leading-6 text-black/40">{d.description}</p><div className="mt-5 flex items-center justify-between"><span className="text-xs text-black/30">Version {d.version}</span>{d.status==="available"?<button className="inline-flex items-center gap-2 text-xs font-semibold text-[#A37E4B]"><Download size={14}/> Download</button>:<span className="inline-flex items-center gap-2 text-xs text-black/35"><Clock3 size={14}/> Awaiting finalisation</span>}</div></article>)}</div>
}
