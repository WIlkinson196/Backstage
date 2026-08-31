import Link from "next/link";
import { Heart, Home, Users, FileText, CreditCard, MessageCircle } from "lucide-react";

export function PortalShell({children}:{children:React.ReactNode}) {
  const nav = [
    ["/portal","Home",Home],
    ["/portal/guests","Guests",Users],
    ["/portal/documents","Documents",FileText],
    ["/portal/payments","Payments",CreditCard],
    ["/portal/messages","Messages",MessageCircle]
  ] as const;
  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#17202A]">
      <header className="sticky top-0 z-30 border-b border-[#E8E0D6] bg-[#FFFCF8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#101822] text-[#D8B77D]"><Heart size={16}/></div>
            <div><div className="font-serif text-lg">The Granary</div><div className="text-[9px] uppercase tracking-[.18em] text-black/35">Your wedding</div></div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([href,label,Icon])=><Link key={href} href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-black/45 hover:bg-[#F1EBE2] hover:text-black"><Icon size={14}/>{label}</Link>)}
          </nav>
          <div className="rounded-full bg-[#EFE6D9] px-3 py-2 text-xs font-semibold">L & C</div>
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-2xl border border-[#E8E0D6] bg-[#FFFCF8]/95 p-1.5 shadow-xl backdrop-blur md:hidden">
        {nav.map(([href,label,Icon])=><Link key={href} href={href} className="grid min-w-14 place-items-center gap-1 rounded-xl px-2 py-2 text-[9px] font-semibold text-black/45"><Icon size={15}/>{label}</Link>)}
      </nav>
    </div>
  );
}
