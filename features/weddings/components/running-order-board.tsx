import type { RunningOrderItem } from "@/features/weddings/types/operations";
import { Clock3, UserRound, MapPin, TriangleAlert } from "lucide-react";

export function RunningOrderBoard({ items }: { items: RunningOrderItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <article key={item.id} className="backstage-panel grid gap-4 rounded-2xl p-4 md:grid-cols-[85px_1fr_170px] md:items-center">
          <div className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={15} className="text-backstage-gold"/>{item.time}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              {item.status === "attention" && <span className="inline-flex items-center gap-1 rounded-full bg-backstage-blush px-2 py-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#7B5053]"><TriangleAlert size={10}/> attention</span>}
            </div>
            {item.operationalNotes && <p className="mt-1 text-xs leading-5 text-black/40">{item.operationalNotes}</p>}
          </div>
          <div className="space-y-1 text-xs text-black/40">
            <div className="flex items-center gap-2"><UserRound size={13}/>{item.owner}</div>
            <div className="flex items-center gap-2"><MapPin size={13}/>{item.location}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
