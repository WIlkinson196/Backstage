import Link from "next/link";
<<<<<<< HEAD
import type { WeddingRecord } from "@/features/weddings/types/wedding";
=======
import type { WeddingRecord } from "../types/wedding";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { CalendarDays, Users, PoundSterling, Sparkles, ExternalLink } from "lucide-react";
import { ReadinessRing } from "./readiness-ring";

export function WeddingHero({ wedding }: { wedding: WeddingRecord }) {
  return (
    <section className="backstage-wedding-photo relative min-h-[390px] overflow-hidden rounded-[32px] text-white shadow-soft">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/90 via-[#0B141E]/62 to-[#0B141E]/15" />
      <div className="relative grid min-h-[390px] gap-8 p-7 md:p-9 xl:grid-cols-[1fr_330px]">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#E2C69D]">
                <Sparkles size={14}/> Wedding workspace
              </div>
              <Link href="/portal" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/15">
                Open Couple Portal <ExternalLink size={14}/>
              </Link>
            </div>
            <h1 className="backstage-display mt-4 text-5xl leading-none md:text-6xl">{wedding.couple}</h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span>{wedding.packageName}</span><span>•</span><span>Coordinator {wedding.coordinator}</span><span>•</span><span className="capitalize">{wedding.status}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="backstage-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-white/40"><CalendarDays size={13}/> Wedding</div>
              <div className="mt-2 text-sm font-semibold">{wedding.eventDate}</div>
            </div>
            <div className="backstage-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-white/40"><Users size={13}/> Guests</div>
              <div className="mt-2 text-sm font-semibold">{wedding.dayGuests} day · {wedding.eveningGuests} evening</div>
            </div>
            <div className="backstage-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-white/40"><PoundSterling size={13}/> Value</div>
              <div className="mt-2 text-sm font-semibold">£{wedding.quotedValue.toLocaleString("en-GB")}</div>
            </div>
          </div>
        </div>

        <div className="backstage-glass self-end rounded-3xl p-5">
          <div className="flex items-center justify-between gap-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#E2C69D]">Event readiness</div>
              <div className="mt-3 backstage-display text-2xl">{wedding.nextMilestone}</div>
              <div className="mt-2 text-xs text-white/40">Due {wedding.nextMilestoneDate}</div>
            </div>
            <ReadinessRing value={wedding.readinessScore}/>
          </div>
        </div>
      </div>
    </section>
  );
}
