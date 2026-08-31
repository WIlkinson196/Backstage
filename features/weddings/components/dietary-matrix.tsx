import type { DietarySummary, WeddingGuest } from "../types/guests";
import { ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";

export function DietaryMatrix({ guests, summary }: { guests: WeddingGuest[]; summary: DietarySummary[] }) {
  const dietaryGuests = guests.filter(g => Boolean(g.dietaryRequirements));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="backstage-panel rounded-3xl p-6">
        <div className="backstage-kicker">Service safety</div>
        <h2 className="backstage-display mt-2 text-4xl">Dietary Matrix</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-black/45">
          One operational view of dietary requirements, table location and menu choice.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-backstage-line">
          <div className="grid grid-cols-[1fr_140px_160px_1fr] gap-3 bg-backstage-cream px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-black/35">
            <div>Guest</div><div>Table</div><div>Menu</div><div>Requirement</div>
          </div>
          {dietaryGuests.map(g => (
            <div key={g.id} className="grid grid-cols-[1fr_140px_160px_1fr] gap-3 border-t border-backstage-line px-4 py-4 text-sm">
              <div className="font-semibold">{g.name}</div>
              <div className="text-black/50">{g.tableName ?? "Unassigned"}</div>
              <div className="text-black/50">{g.menuChoice ?? "—"}</div>
              <div className={`flex gap-2 ${g.dietarySeverity === "critical" ? "font-semibold text-[#8B4B45]" : "text-black/55"}`}>
                {g.dietarySeverity === "critical" ? <ShieldAlert size={16} className="shrink-0 text-[#B75E54]"/> : <TriangleAlert size={16} className="shrink-0 text-backstage-gold"/>}
                {g.dietaryRequirements}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-3xl bg-backstage-ink p-6 text-white">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold"><Sparkles size={14}/> Dietary intelligence</div>
          <h3 className="backstage-display mt-3 text-3xl">Cross-check before service.</h3>
          <p className="mt-3 text-sm leading-6 text-white/50">
            Backstage can later compare guest requirements against menu selections, table allocation and kitchen output before the event pack is finalised.
          </p>
        </section>

        <section className="backstage-panel rounded-3xl p-5">
          <div className="backstage-kicker">Summary</div>
          <div className="mt-4 space-y-3">
            {summary.map(item => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-backstage-cream px-3 py-3 text-sm">
                <span>{item.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.severity === "critical" ? "bg-[#F8E8E5] text-[#8B4B45]" :
                  item.severity === "allergy" ? "bg-[#F3E7D6] text-[#745A39]" :
                  "bg-backstage-sage text-[#44604B]"
                }`}>{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
