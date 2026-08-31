"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, CalendarDays, Building2, MoreHorizontal } from "lucide-react";

const items = [
  ["/dashboard", "Home", LayoutDashboard],
  ["/enquiries", "Enquiries", Inbox],
  ["/calendar", "Calendar", CalendarDays],
  ["/my-venue", "Venue", Building2],
  ["/settings", "More", MoreHorizontal]
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-backstage-line bg-[#FFFCF8]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {items.map(([href, label, Icon]) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-1 text-[10px] ${active ? "text-backstage-gold" : "text-black/45"}`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
