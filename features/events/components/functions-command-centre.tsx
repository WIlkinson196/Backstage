"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, Filter, HeartHandshake, LockKeyhole, PoundSterling, RotateCcw, Search, Users } from "lucide-react";
import type { EventRecord, EventsWorkspaceData } from "../types/event";

export const EVENTS_STORAGE_KEY = "backstage-functions-v018";
const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function dateValue(value?: string) {
  if (!value) return Number.POSITIVE_INFINITY;
  return new Date(`${value}T12:00:00`).getTime();
}

function formatDate(value?: string) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Date TBC";
}

function attention(event: EventRecord) {
  const outstanding = Math.max(0, event.quotedValue - event.paidValue);
  if (event.status === "provisional" && event.paidValue === 0) return { label: "Deposit needed", tone: "red" };
  if (event.readinessScore < 50) return { label: "Needs attention", tone: "red" };
  if (outstanding > 0 || event.readinessScore < 80) return { label: event.nextAction || "Planning open", tone: "amber" };
  return { label: "On track", tone: "green" };
}

const toneClass = { red: "bg-red-50 text-red-700 border-red-200", amber: "bg-amber-50 text-amber-700 border-amber-200", green: "bg-[#E7F1E9] text-[#3F6848] border-[#B8D1BE]" };

export function FunctionsCommandCentre({ data }: { data: EventsWorkspaceData }) {
  const [events, setEvents] = useState(data.events);
  const [hydrated, setHydrated] = useState(!data.demoMode);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!data.demoMode) return;
    try {
      const stored = window.localStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) setEvents(JSON.parse(stored));
    } catch { /* keep supplied data */ }
    setHydrated(true);
  }, [data.demoMode]);

  const active = events.filter((event) => event.status !== "cancelled" && event.status !== "completed");
  const confirmedValue = active.filter((event) => event.status !== "draft").reduce((sum, event) => sum + event.quotedValue, 0);
  const outstanding = active.reduce((sum, event) => sum + Math.max(0, event.quotedValue - event.paidValue), 0);
  const needsAttention = active.filter((event) => attention(event).tone === "red");
  const finalMeetings = active.filter((event) => event.finalMeetingAt);

  const visible = useMemo(() => events.filter((event) => {
    if (status === "active" && ["cancelled", "completed"].includes(event.status)) return false;
    if (status === "provisional" && event.status !== "provisional") return false;
    if (status === "ready" && event.status !== "ready") return false;
    if (status === "archive" && !["cancelled", "completed"].includes(event.status)) return false;
    if (kind !== "all" && event.plan.kind !== kind) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [event.clientName, event.title, event.eventType, event.bookingReference, event.room, event.owner].some((value) => value?.toLowerCase().includes(needle));
  }).sort((a, b) => dateValue(a.eventDate) - dateValue(b.eventDate)), [events, kind, query, status]);

  function resetData() {
    if (!data.demoMode) return;
    window.localStorage.removeItem(EVENTS_STORAGE_KEY);
    setEvents(data.events);
  }

  return (
    <div className="mx-auto max-w-[1700px] space-y-6">
      <section className="backstage-conference-photo relative min-h-[360px] overflow-hidden rounded-[32px] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/95 via-[#0B141E]/72 to-[#0B141E]/20"/>
        <div className="relative flex min-h-[360px] flex-col justify-between p-8 md:p-10">
          <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-start">
            <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#E2C69D]"><BriefcaseBusiness size={14}/> Operations command centre</div><h1 className="backstage-display mt-4 max-w-4xl text-5xl md:text-6xl">Functions & Weddings</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-white/65">The live operational register—from confirmed booking through planning, payment, kitchen handover and delivery.</p></div>
            <div className="flex flex-wrap gap-2"><Link href="/calendar" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-backstage-ink">Book in calendar</Link>{data.demoMode && <button onClick={resetData} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70"><RotateCcw size={15}/>Reset build data</button>}</div>
          </div>
          {data.demoMode && <div className="flex max-w-3xl items-start gap-3 rounded-2xl border border-[#E2C69D]/20 bg-white/[.06] p-4 text-xs leading-5 text-white/65"><LockKeyhole size={16} className="mt-0.5 shrink-0 text-[#E2C69D]"/><span><strong className="text-white">Build mode.</strong> No authentication is needed. Your planning changes persist in this browser while integrations remain safely disconnected.</span></div>}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Upcoming", value: active.length, note: "Live operational records", icon: CalendarDays },
          { label: "Needs attention", value: needsAttention.length, note: "Priority actions", icon: AlertTriangle },
          { label: "Booked value", value: money.format(confirmedValue), note: "Active functions", icon: PoundSterling },
          { label: "Outstanding", value: money.format(outstanding), note: "Still to collect", icon: Clock3 },
          { label: "Final meetings", value: finalMeetings.length, note: "Booked or due", icon: Users }
        ].map(({ label, value, note, icon: Icon }) => <article key={label} className="backstage-panel rounded-3xl p-5"><div className="flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-black/35">{label}</div><div className="backstage-display mt-2 text-3xl">{value}</div><div className="mt-1 text-xs text-black/35">{note}</div></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-backstage-cream text-backstage-gold"><Icon size={17}/></div></div></article>)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="backstage-panel rounded-[28px] p-5 md:p-6"><div className="flex items-end justify-between gap-4"><div><div className="backstage-kicker">Today actions</div><h2 className="backstage-display mt-2 text-3xl">What needs moving?</h2></div><span className="text-xs text-black/35">{needsAttention.length} priority</span></div><div className="mt-5 space-y-3">{active.sort((a, b) => dateValue(a.nextActionDue) - dateValue(b.nextActionDue)).slice(0, 5).map((event) => { const state = attention(event); return <Link key={event.id} href={`/events/${event.id}`} className="flex items-center gap-4 rounded-2xl border border-backstage-line bg-white p-4 transition hover:bg-[#FBF9F5]"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${toneClass[state.tone as keyof typeof toneClass]}`}>{state.tone === "green" ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{event.nextAction}</div><div className="mt-1 text-xs text-black/35">{event.clientName} · {event.nextActionDue ? `Due ${formatDate(event.nextActionDue)}` : "No date set"}</div></div><ArrowRight size={15} className="text-backstage-gold"/></Link>})}</div></div>
        <div className="backstage-panel rounded-[28px] p-5 md:p-6"><div className="backstage-kicker">Connected workflow</div><h2 className="backstage-display mt-2 text-3xl">One record, every team.</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{[{ label: "Sales", note: "Enquiry and booking handover", icon: BriefcaseBusiness }, { label: "Weddings", note: "Guided meetings and planning", icon: HeartHandshake }, { label: "Operations", note: "Room, AV and running order", icon: CalendarDays }, { label: "Finance", note: "Deposits, invoices and balances", icon: PoundSterling }].map(({ label, note, icon: Icon }) => <div key={label} className="rounded-2xl bg-backstage-cream p-4"><Icon size={17} className="text-backstage-gold"/><div className="mt-3 text-sm font-semibold">{label}</div><div className="mt-1 text-xs leading-5 text-black/40">{note}</div></div>)}</div></div>
      </section>

      <section className="backstage-panel overflow-hidden rounded-[28px]">
        <div className="flex flex-col gap-4 border-b border-backstage-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div><div className="backstage-kicker">Function register</div><h2 className="backstage-display mt-1 text-3xl">All booked events</h2></div>
          <div className="flex flex-wrap gap-2"><div className="flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-3"><Search size={14} className="text-black/30"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search client, BK, room…" className="w-48 bg-transparent py-2.5 text-xs outline-none"/></div><label className="flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-3 text-xs text-black/45"><Filter size={14}/><select value={kind} onChange={(event) => setKind(event.target.value)} className="bg-transparent py-2.5 outline-none"><option value="all">All types</option><option value="meeting">Meetings</option><option value="party">Parties</option><option value="wake">Wakes</option><option value="wedding">Weddings</option><option value="event">Other events</option></select></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-backstage-line bg-white px-3 py-2.5 text-xs outline-none"><option value="active">Active</option><option value="provisional">Provisional</option><option value="ready">Ready</option><option value="archive">Archive</option></select></div>
        </div>
        <div className="overflow-x-auto"><div className="min-w-[1000px]">
          <div className="grid grid-cols-[110px_1.5fr_110px_120px_130px_125px_40px] gap-4 border-b border-backstage-line bg-[#FBF9F5] px-5 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-black/30"><span>Date</span><span>Function</span><span>Readiness</span><span>Guests / room</span><span>Value</span><span>Attention</span><span/></div>
          {hydrated && visible.map((event) => { const state = attention(event); const outstandingValue = Math.max(0, event.quotedValue - event.paidValue); return <Link key={event.id} href={`/events/${event.id}`} className="grid grid-cols-[110px_1.5fr_110px_120px_130px_125px_40px] items-center gap-4 border-b border-backstage-line px-5 py-4 transition last:border-0 hover:bg-[#FBF9F5]"><div className="text-xs font-semibold">{formatDate(event.eventDate).replace(/,? 2026|,? 2027/, "")}</div><div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{event.clientName}</span><span className="rounded-full bg-backstage-cream px-2 py-0.5 text-[9px] text-black/40">{event.eventType}</span></div><div className="mt-1 text-xs text-black/35">{event.bookingReference || "Provisional — no BK yet"} · {event.owner}</div></div><div><div className="text-xs font-semibold">{event.readinessScore}%</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-backstage-gold" style={{ width: `${event.readinessScore}%` }}/></div></div><div className="text-xs"><div>{event.guestCount || "—"} guests</div><div className="mt-1 truncate text-black/35">{event.room || "Room TBC"}</div></div><div className="text-xs"><div className="font-semibold">{money.format(event.quotedValue)}</div><div className="mt-1 text-black/35">{money.format(outstandingValue)} due</div></div><span className={`w-fit rounded-full border px-2.5 py-1 text-[9px] font-semibold ${toneClass[state.tone as keyof typeof toneClass]}`}>{state.label}</span><ArrowRight size={16} className="text-backstage-gold"/></Link>; })}
          {!visible.length && <div className="py-16 text-center text-sm text-black/35">No functions match these filters.</div>}
        </div></div>
      </section>
    </div>
  );
}
