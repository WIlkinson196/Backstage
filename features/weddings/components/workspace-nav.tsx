"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { weddingTabs } from "../lib/tabs";

export function WeddingWorkspaceNav({ weddingId }: { weddingId: string }) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-2xl border border-backstage-line bg-[#FFFCF8] p-1.5">
        {weddingTabs.map(([slug, label]) => {
          const href = `/weddings/${weddingId}/${slug}`;
          const active = pathname === href || (slug === "overview" && pathname === `/weddings/${weddingId}`);
          return (
            <Link
              key={slug}
              href={href}
              className={[
                "rounded-xl px-3.5 py-2.5 text-xs font-semibold transition",
                active ? "bg-backstage-ink text-white shadow-sm" : "text-black/45 hover:bg-backstage-cream hover:text-black"
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
