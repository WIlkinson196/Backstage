import type { WeddingGuest } from "@/features/weddings/types/guests";
import { Search, UserPlus, TriangleAlert, UtensilsCrossed } from "lucide-react";

export function GuestTable({ guests }: { guests: WeddingGuest[] }) {
  return (
    <section className="backstage-panel overflow-hidden rounded-3xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-backstage-line p-5">
        <div className="flex min-w-[230px] flex-1 items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3">
          <Search size={15} className="text-black/30"/>
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Search guests..." />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white">
          <UserPlus size={15}/> Add guest
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[940px]">
          <div className="grid grid-cols-[1.4fr_110px_130px_120px_160px_1fr] gap-3 bg-backstage-cream px-5 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-black/35">
            <div>Guest</div><div>Attendance</div><div>RSVP</div><div>Table</div><div>Menu</div><div>Dietary / requirements</div>
          </div>
          {guests.map(g => (
            <div key={g.id} className="grid grid-cols-[1.4fr_110px_130px_120px_160px_1fr] gap-3 border-t border-backstage-line px-5 py-4 text-sm">
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[.08em] text-black/30">{g.ageGroup} · {g.source}</div>
              </div>
              <div className="capitalize text-black/55">{g.attendance}</div>
              <div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${
                  g.rsvpStatus === "confirmed" ? "bg-backstage-sage text-[#44604B]" :
                  g.rsvpStatus === "pending" ? "bg-[#F1E7CF] text-[#715B31]" :
                  "bg-[#EEEAE5] text-[#6F6963]"
                }`}>{g.rsvpStatus}</span>
              </div>
              <div className="text-black/55">{g.tableName ?? "Unassigned"}</div>
              <div className="flex items-start gap-2 text-black/55">
                {g.menuChoice && <UtensilsCrossed size={13} className="mt-0.5 shrink-0 text-backstage-gold"/>}
                <span>{g.menuChoice ?? "—"}</span>
              </div>
              <div>
                {g.dietaryRequirements ? (
                  <div className={`flex gap-2 text-xs leading-5 ${g.dietarySeverity === "critical" ? "font-semibold text-[#8B4B45]" : "text-black/55"}`}>
                    <TriangleAlert size={14} className="mt-0.5 shrink-0 text-backstage-gold"/>
                    <span>{g.dietaryRequirements}</span>
                  </div>
                ) : <span className="text-black/25">None recorded</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
