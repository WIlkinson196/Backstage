import { Search, Bell, Sparkles, Building2 } from "lucide-react";
import type { VenueContext } from "@/features/platform/types/context";

export function Topbar({ context }: { context: VenueContext | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-backstage-line/80 bg-backstage-cream/90 backdrop-blur">
      <div className="flex h-20 items-center gap-4 px-6 lg:px-8">
        <div className="hidden max-w-xl flex-1 items-center gap-3 rounded-xl border border-backstage-line bg-white px-4 py-2.5 md:flex">
          <Search size={16} className="text-black/35"/><input className="w-full bg-transparent text-sm outline-none" placeholder="Search enquiries, events, contacts..."/>
        </div>
        <div className="ml-auto hidden items-center gap-2 text-right sm:flex">
          <Building2 size={15} className="text-backstage-gold"/>
          <div><div className="text-xs font-semibold">{context?.venueName || "Venue access required"}</div><div className="text-[10px] capitalize text-black/35">{context?.role || "Signed out"}{context?.demoMode ? " · demo" : ""}</div></div>
        </div>
        <button aria-label="Notifications" className="rounded-xl border border-backstage-line bg-white p-2.5"><Bell size={18}/></button>
        <button className="flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-2.5 text-sm text-white"><Sparkles size={15} className="text-backstage-gold"/><span className="hidden sm:inline">Ask Backstage</span></button>
      </div>
    </header>
  );
}
