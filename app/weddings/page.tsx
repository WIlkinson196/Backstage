import Link from "next/link";
import { AppShell } from "@/components/navigation/app-shell";
import { getWeddings } from "@/features/weddings/services/repository";
import { Plus, Sparkles, CalendarDays, Users } from "lucide-react";

export default async function WeddingsPage() {
  const weddings = await getWeddings();

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="backstage-wedding-photo relative min-h-[360px] overflow-hidden rounded-[32px] text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/88 via-[#0B141E]/52 to-transparent" />
          <div className="relative flex min-h-[360px] flex-col justify-between p-8 md:p-10">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#E2C69D]"><Sparkles size={14}/> Weddings</div>
              <h1 className="backstage-display mt-4 max-w-3xl text-5xl md:text-6xl">Plan the emotion. Control the operation.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/65">
                Every couple, commercial commitment and operational detail in one deeply structured workspace.
              </p>
            </div>
            <div>
              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-backstage-ink"><Plus size={16}/> New wedding</button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weddings.map((w) => (
            <Link key={w.id} href={`/weddings/${w.id}`} className="backstage-panel group overflow-hidden rounded-3xl transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="h-40 backstage-wedding-photo"/>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="backstage-display text-2xl">{w.couple}</div>
                    <div className="mt-1 text-xs text-black/40">{w.packageName} · {w.coordinator}</div>
                  </div>
                  <div className="rounded-full bg-[#F2E9DC] px-3 py-1 text-xs font-semibold text-[#745A39]">{w.readinessScore}% ready</div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><CalendarDays size={14} className="text-backstage-gold"/>{w.eventDate}</div>
                  <div className="flex items-center gap-2"><Users size={14} className="text-backstage-gold"/>{w.dayGuests}/{w.eveningGuests}</div>
                </div>
                <div className="mt-5 border-t border-backstage-line pt-4">
                  <div className="text-[10px] uppercase tracking-[.12em] text-black/30">Next milestone</div>
                  <div className="mt-1 text-sm font-semibold">{w.nextMilestone}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
