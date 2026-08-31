<<<<<<< HEAD
import type { FloorPlanZone, WeddingTable } from "@/features/weddings/types/guests";
=======
import type { FloorPlanZone, WeddingTable } from "../types/guests";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { Move, Plus, Sparkles } from "lucide-react";

export function FloorPlanCanvas({ tables, zones }: { tables: WeddingTable[]; zones: FloorPlanZone[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="backstage-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="backstage-kicker">Room design</div>
            <h2 className="backstage-display mt-2 text-4xl">Floor Plan</h2>
            <p className="mt-3 text-sm text-black/45">Tables and operational zones share the same wedding layout.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3 text-xs font-semibold"><Plus size={15}/> Add object</button>
        </div>

        <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-3xl border border-backstage-line bg-[#F3EFE8]">
          <div className="absolute inset-5 rounded-2xl border-2 border-[#D8CEC1] bg-[#FBF8F3]">
            {tables.map(table => (
              <div
                key={table.id}
                className={`absolute grid place-items-center border-2 border-[#C8B79E] bg-white text-center shadow-sm ${table.shape === "round" ? "rounded-full" : "rounded-xl"}`}
                style={{
                  left:`${table.x}%`, top:`${table.y}%`,
                  width:`${table.width}%`, height:`${table.height}%`,
                  transform:`rotate(${table.rotation}deg)`
                }}
              >
                <div>
                  <div className="text-[10px] font-semibold">{table.name}</div>
                  <div className="mt-0.5 text-[9px] text-black/35">{table.assignedGuests}/{table.capacity}</div>
                </div>
              </div>
            ))}
            {zones.map(zone => (
              <div
                key={zone.id}
                className="absolute grid place-items-center rounded-xl border border-dashed border-[#B9AA95] bg-[#EEE5D8]/75 text-[9px] font-bold uppercase tracking-[.08em] text-[#6B5A45]"
                style={{left:`${zone.x}%`,top:`${zone.y}%`,width:`${zone.width}%`,height:`${zone.height}%`}}
              >
                {zone.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-3xl bg-backstage-ink p-6 text-white">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold"><Sparkles size={14}/> Layout intelligence</div>
          <h3 className="backstage-display mt-3 text-3xl">Room plan meets operations.</h3>
          <p className="mt-3 text-sm leading-6 text-white/50">
            Future checks can flag capacity issues, blocked service routes, missing DJ/buffet zones and table-count mismatches before the event.
          </p>
        </section>

        <section className="backstage-panel rounded-3xl p-5">
          <div className="backstage-kicker">Objects</div>
          <div className="mt-4 space-y-2 text-sm">
            {[...tables.map(t=>t.name), ...zones.map(z=>z.name)].map(name => (
              <div key={name} className="flex items-center gap-2 rounded-xl bg-backstage-cream px-3 py-3"><Move size={14} className="text-backstage-gold"/>{name}</div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
