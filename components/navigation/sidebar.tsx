"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, HeartHandshake, CalendarDays, Building2, Settings2, Sparkles, BriefcaseBusiness } from "lucide-react";
import type { VenueContext } from "@/features/platform/types/context";

const items = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/enquiries", "Enquiries", Inbox],
  ["/events", "Functions", BriefcaseBusiness],
  ["/weddings", "Weddings", HeartHandshake],
  ["/calendar", "Calendar", CalendarDays],
  ["/my-venue", "My Venue", Building2]
] as const;

export function Sidebar({ context }: { context: VenueContext | null }) {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-backstage-ink text-white lg:flex lg:flex-col">
      <div className="px-7 py-8">
        <div className="backstage-display text-2xl">Backstage</div>
        <div className="text-[10px] uppercase tracking-[.22em] text-white/45">Venue OS</div>
      </div>
      <nav className="space-y-1 px-4">
        {items.map(([href, label, Icon]) => (
          <Link key={href} href={href} className={`${pathname.startsWith(href) ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"} flex items-center gap-3 rounded-xl px-4 py-3 text-sm`}>
            <Icon size={17}/>{label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="truncate text-sm font-semibold">{context?.venueName || "No venue access"}</div>
          <div className="mt-1 truncate text-[10px] uppercase tracking-[.12em] text-white/35">{context?.role || "Access required"}</div>
        </div>
        <div className="rounded-2xl border border-backstage-gold/20 bg-white/[.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-backstage-gold"><Sparkles size={14}/>Backstage Intelligence</div>
          <p className="text-xs leading-5 text-white/55">AI actions, recommendations and automation across the product.</p>
        </div>
        <Link href="/settings" className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/55"><Settings2 size={17}/>Settings</Link>
      </div>
    </aside>
  );
}
