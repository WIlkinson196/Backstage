import Link from "next/link";
import { AppShell } from "@/components/navigation/app-shell";
import { getEvents } from "@/features/events/services/repository";
import { CalendarDays, Users, ArrowRight, BriefcaseBusiness } from "lucide-react";

const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export default async function EventsPage() {
  const events = await getEvents();
  const confirmedValue = events.filter((event) => !["cancelled", "draft"].includes(event.status)).reduce((sum, event) => sum + event.quotedValue, 0);
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="backstage-conference-photo relative min-h-[330px] overflow-hidden rounded-[32px] text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/90 via-[#0B141E]/58 to-transparent"/>
          <div className="relative flex min-h-[330px] flex-col justify-between p-8 md:p-10">
            <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#E2C69D]"><BriefcaseBusiness size={14}/> Shared event engine</div><h1 className="backstage-display mt-4 text-5xl md:text-6xl">Events</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">Every confirmed booking, regardless of event type, enters one operational diary.</p></div>
            <div className="backstage-glass w-fit rounded-2xl px-5 py-4"><div className="text-[10px] uppercase tracking-[.12em] text-white/40">Live event value</div><div className="mt-1 text-2xl font-semibold">{money.format(confirmedValue)}</div></div>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="backstage-panel rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-backstage-gold">{event.eventType}</div><h2 className="backstage-display mt-2 text-2xl">{event.clientName}</h2></div><span className="rounded-full bg-[#F2E9DC] px-3 py-1 text-[10px] font-semibold capitalize text-[#745A39]">{event.status}</span></div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-black/45"><div className="flex items-center gap-2"><CalendarDays size={14} className="text-backstage-gold"/>{event.eventDate || "Date TBC"}</div><div className="flex items-center gap-2"><Users size={14} className="text-backstage-gold"/>{event.guestCount ?? "—"} guests</div></div>
              <div className="mt-5 flex items-center justify-between border-t border-backstage-line pt-4"><div><div className="text-[10px] uppercase tracking-[.1em] text-black/30">Quoted</div><div className="mt-1 text-sm font-semibold">{money.format(event.quotedValue)}</div></div><ArrowRight size={16} className="text-backstage-gold"/></div>
            </Link>
          ))}
          {!events.length && <div className="backstage-panel rounded-3xl border-dashed p-8 text-center text-sm text-black/40">No events yet. Confirm an enquiry to create the first one.</div>}
        </section>
      </div>
    </AppShell>
  );
}

