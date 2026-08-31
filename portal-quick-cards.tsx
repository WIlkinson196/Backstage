import Link from "next/link";
import { Users, FileText, CreditCard, MessageCircle, ArrowUpRight } from "lucide-react";

export function PortalQuickCards({balance}:{balance:number}) {
  const cards = [
    ["/portal/guests","Guests","Manage names, RSVPs, menu choices and dietaries.",Users,"Guest list"],
    ["/portal/documents","Documents","Your latest wedding documents in one place.",FileText,"View documents"],
    ["/portal/payments","Payments",`£${balance.toLocaleString("en-GB",{minimumFractionDigits:2})} remaining.`,CreditCard,"View payments"],
    ["/portal/messages","Messages","Ask your venue team a question without losing the thread.",MessageCircle,"Open messages"]
  ] as const;
  return <div className="grid gap-4 md:grid-cols-2">{cards.map(([href,title,desc,Icon,cta])=><Link key={href} href={href} className="group rounded-3xl border border-[#E8E0D6] bg-[#FFFCF8] p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EFE6D9] text-[#765B39]"><Icon size={19}/></div><ArrowUpRight size={16} className="text-black/20 group-hover:text-[#A37E4B]"/></div><h3 className="mt-5 font-serif text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-black/45">{desc}</p><div className="mt-4 text-xs font-semibold text-[#A37E4B]">{cta}</div></Link>)}</div>
}
