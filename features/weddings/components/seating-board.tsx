import Link from "next/link";
<<<<<<< HEAD
import type { WeddingGuest, WeddingTable } from "@/features/weddings/types/guests";
=======
import type { WeddingGuest, WeddingTable } from "../types/guests";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { Users, Circle, Plus, UserRoundPlus, UtensilsCrossed } from "lucide-react";

export function SeatingBoard({ tables, guests, weddingId }: { tables: WeddingTable[]; guests: WeddingGuest[]; weddingId?: string }) {
  const unassigned = guests.filter(g => g.rsvpStatus !== "declined" && !g.tableId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="backstage-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="backstage-kicker">Table plan</div>
            <h2 className="backstage-display mt-2 text-4xl">Seating</h2>
            <p className="mt-3 text-sm text-black/45">Allocate guests once; table and dietary information follows them into operations.</p>
          </div>
          <div className="flex gap-2">
            {weddingId && <Link href={`/weddings/${weddingId}/seating/guests`} className="inline-flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3 text-xs font-semibold"><Users size={15}/> Guests</Link>}
            {weddingId && <Link href={`/weddings/${weddingId}/seating/dietaries`} className="inline-flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3 text-xs font-semibold"><UtensilsCrossed size={15}/> Dietaries</Link>}
            <button className="inline-flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><Plus size={15}/> Add table</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tables.map(table => {
            const seated = guests.filter(g => g.tableId === table.id);
            return (
              <article key={table.id} className="rounded-3xl border border-backstage-line bg-[#FFFCF8] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-backstage-gold">
                      <Circle size={10}/> {table.shape.replace("_"," ")}
                    </div>
                    <h3 className="backstage-display mt-2 text-2xl">{table.name}</h3>
                  </div>
                  <div className="rounded-full bg-backstage-cream px-3 py-1.5 text-xs font-semibold">{table.assignedGuests}/{table.capacity}</div>
                </div>

                <div className="mt-4 space-y-2">
                  {seated.slice(0,6).map(g => (
                    <div key={g.id} className="flex items-center justify-between rounded-xl bg-backstage-cream px-3 py-2 text-xs">
                      <span>{g.name}</span>
                      {g.dietaryRequirements && <span className="h-2 w-2 rounded-full bg-backstage-gold"/>}
                    </div>
                  ))}
                  {seated.length === 0 && <div className="py-4 text-center text-xs text-black/25">No guests assigned</div>}
                </div>

                <button className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-backstage-gold"><UserRoundPlus size={14}/> Assign guests</button>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="backstage-panel h-fit rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div><div className="backstage-kicker">Unassigned</div><h3 className="backstage-display mt-2 text-2xl">Guests</h3></div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F2E9DC] text-[#765B39]"><Users size={17}/></div>
        </div>
        <div className="mt-5 space-y-2">
          {unassigned.map(g => (
            <div key={g.id} className="rounded-xl border border-backstage-line bg-white p-3">
              <div className="text-sm font-semibold">{g.name}</div>
              <div className="mt-1 text-xs text-black/35">{g.attendance} · {g.rsvpStatus}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
