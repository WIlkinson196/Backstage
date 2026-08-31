import { AppShell } from "@/components/navigation/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { ArrowRight, Sparkles, CalendarDays, Clock3, CircleAlert } from "lucide-react";

const schedule = [
  ["09:00", "Conference", "Leadership Workshop", "The Granary"],
  ["12:30", "Private Event", "Celebration Lunch", "Restaurant"],
  ["16:00", "Wedding", "Emma & James — supplier access", "The Granary"],
  ["18:30", "Wedding", "Evening reception", "The Granary"]
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="backstage-photo relative min-h-[410px] overflow-hidden rounded-[32px] text-white shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B121B]/70 via-transparent to-transparent" />
          <div className="relative flex min-h-[410px] flex-col justify-between p-7 md:p-10">
            <div className="flex justify-between gap-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#E2C69D]">Backstage · Venue intelligence</div>
                <h1 className="backstage-display mt-4 max-w-3xl text-4xl leading-[1.02] md:text-6xl">
                  Good evening.<br/>Here&apos;s what matters.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-white/65">
                  A venue operating system should surface the work before you have to go looking for it.
                </p>
              </div>
              <div className="hidden rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs text-white/65 backdrop-blur md:block">
                The Granary
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="backstage-glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-[#E2C69D]"><Sparkles size={14}/> Backstage handled</div>
                <div className="mt-2 backstage-display text-3xl">14</div>
                <div className="mt-1 text-xs text-white/50">routine actions since yesterday</div>
              </div>
              <div className="backstage-glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-[#E2C69D]"><CircleAlert size={14}/> Needs you</div>
                <div className="mt-2 backstage-display text-3xl">7</div>
                <div className="mt-1 text-xs text-white/50">decisions requiring human approval</div>
              </div>
              <div className="backstage-glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-[#E2C69D]"><CalendarDays size={14}/> Today</div>
                <div className="mt-2 backstage-display text-3xl">4</div>
                <div className="mt-1 text-xs text-white/50">live venue movements</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="New enquiries" value="12" note="+3 this week" />
          <StatCard label="Proposals sent" value="8" note="+2 this week" />
          <StatCard label="Bookings this month" value="18" note="+6 this month" />
          <StatCard label="Revenue this month" value="£124,750" note="+12% vs last month" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <section className="backstage-panel rounded-[28px] p-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="backstage-kicker">Live operations</div>
                <h2 className="backstage-display mt-2 text-3xl">Today at the venue</h2>
              </div>
              <button className="text-xs font-semibold text-backstage-gold">Open diary</button>
            </div>
            <div className="mt-6">
              {schedule.map(([time,type,title,space], index) => (
                <div key={title} className="grid grid-cols-[55px_1fr] gap-4 border-b border-backstage-line py-4 last:border-0 md:grid-cols-[70px_120px_1fr_160px]">
                  <div className="text-xs font-semibold text-black/40">{time}</div>
                  <div className="hidden text-xs text-black/40 md:block">{type}</div>
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="hidden text-right text-xs text-black/40 md:block">{space}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-backstage-ink p-6 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-backstage-gold">
              <Sparkles size={15}/> Intelligence brief
            </div>
            <h2 className="backstage-display mt-3 text-3xl">Three things worth your attention.</h2>
            <div className="mt-6 space-y-3">
              {[
                "High-value August wedding enquiry matches an available Saturday.",
                "One upcoming function is missing final dietary information.",
                "Two proposals show strong engagement but have no follow-up booked."
              ].map((x,i) => (
                <div key={x} className="rounded-2xl border border-white/10 bg-white/[.05] p-4 text-sm leading-6 text-white/65">
                  <span className="mr-2 text-backstage-gold">0{i+1}</span>{x}
                </div>
              ))}
            </div>
            <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-white">
              Review all actions <ArrowRight size={15}/>
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
