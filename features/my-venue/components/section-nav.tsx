"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["profile", "Venue Profile"],
  ["spaces", "Spaces"],
  ["weddings", "Weddings"],
  ["meetings", "Meetings"],
  ["private-events", "Private Events"],
  ["food-drink", "Food & Drink"],
  ["accommodation", "Accommodation"],
  ["extras", "Décor & Extras"],
  ["policies", "Terms & Policies"],
  ["automation", "Automation Rules"]
];

export function MyVenueSectionNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {items.map(([slug, label]) => {
        const href = `/my-venue/${slug}`;
        const active = pathname === href;
        return (
          <Link
            key={slug}
            href={href}
            className={[
              "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition",
              active
                ? "border-backstage-ink bg-backstage-ink text-white"
                : "border-backstage-line bg-white text-black/55 hover:border-backstage-gold/50"
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
