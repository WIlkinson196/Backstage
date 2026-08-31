import type { GuestReadiness } from "../types/guests";
import { Users, Armchair, ClipboardClock, TriangleAlert, Utensils } from "lucide-react";

export function GuestReadinessCards({ readiness }: { readiness: GuestReadiness }) {
  const cards = [
    ["Guests", readiness.totalGuests, Users],
    ["Unassigned", readiness.unassignedGuests, Armchair],
    ["Pending RSVPs", readiness.pendingRsvps, ClipboardClock],
    ["Dietary guests", readiness.dietaryGuests, Utensils],
    ["Critical", readiness.criticalDietaries, TriangleAlert]
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(([label,value,Icon]) => (
        <div key={label} className="backstage-panel rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-black/30">{label}</div>
            <Icon size={15} className="text-backstage-gold"/>
          </div>
          <div className="backstage-display mt-3 text-3xl">{value}</div>
        </div>
      ))}
    </div>
  );
}
