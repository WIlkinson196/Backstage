import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";
import { getEvent } from "@/features/events/services/repository";
import { updateEventStatusAction } from "@/features/events/actions";
import { ArrowLeft, CalendarDays, Users, PoundSterling, UserRound, Save } from "lucide-react";

const statuses = ["draft", "provisional", "confirmed", "planning", "ready", "live", "completed", "cancelled"];

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const statusAction = updateEventStatusAction.bind(null, id);
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <Link href="/events" className="inline-flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ArrowLeft size={14}/> Back to events</Link>
        <section className="backstage-conference-photo relative overflow-hidden rounded-[32px] text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/92 via-[#0B141E]/60 to-transparent"/>
          <div className="relative min-h-[340px] p-8 md:p-10"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#E2C69D]">{event.eventType} · {event.status}</div><h1 className="backstage-display mt-5 text-5xl md:text-6xl">{event.clientName}</h1><p className="mt-4 max-w-2xl text-sm text-white/60">{event.title}</p>
            <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3"><div className="backstage-glass rounded-2xl p-4"><CalendarDays size={14} className="text-[#E2C69D]"/><div className="mt-2 text-sm font-semibold">{event.eventDate || "Date TBC"}</div></div><div className="backstage-glass rounded-2xl p-4"><Users size={14} className="text-[#E2C69D]"/><div className="mt-2 text-sm font-semibold">{event.guestCount ?? "—"} guests</div></div><div className="backstage-glass rounded-2xl p-4"><PoundSterling size={14} className="text-[#E2C69D]"/><div className="mt-2 text-sm font-semibold">£{event.quotedValue.toLocaleString("en-GB")}</div></div></div>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="backstage-panel rounded-[28px] p-6"><div className="backstage-kicker">Operational record</div><h2 className="backstage-display mt-2 text-3xl">The shared event workspace starts here.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-black/45">This record is now the parent for spaces, schedules, tasks, documents, payments and customer access. Event-type modules add specialist planning without creating separate disconnected CRMs.</p>{event.sourceEnquiryId && <Link href={`/enquiries/${event.sourceEnquiryId}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-backstage-gold">Open source enquiry</Link>}</section>
          <aside className="backstage-panel rounded-[28px] p-5"><div className="backstage-kicker">Event control</div><div className="mt-5 flex items-center gap-3 rounded-2xl bg-backstage-cream p-4"><UserRound size={16} className="text-backstage-gold"/><div><div className="text-[10px] uppercase tracking-[.1em] text-black/30">Owner</div><div className="mt-1 text-sm font-semibold">{event.owner}</div></div></div><form action={statusAction} className="mt-5 space-y-3"><label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/35">Event status<select name="status" defaultValue={event.status} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-3 py-3 text-sm capitalize normal-case tracking-normal text-black">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><button className="flex w-full items-center justify-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><Save size={15} className="text-backstage-gold"/>Save status</button></form></aside>
        </div>
      </div>
    </AppShell>
  );
}

