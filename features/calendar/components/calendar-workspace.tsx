"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Filter, LockKeyhole, Plus, Search, ShieldCheck, Users, X, CheckCircle2, RotateCcw, PoundSterling, AlertTriangle } from "lucide-react";
import { confirmCalendarBookingAction, createCalendarBookingAction, releaseCalendarBookingAction } from "../actions";
import { activeOccupancy, findConflicts, isoDate, minutes, parseDate } from "../lib/conflicts";
import type { CalendarBooking, CalendarBookingInput, CalendarStatus, CalendarWorkspaceData } from "../types/calendar";
import { demoEvents } from "@/features/events/data/demo";
import type { EventPlanKind, EventRecord } from "@/features/events/types/event";

type View = "month" | "week" | "list";
const STORAGE_KEY = "backstage-calendar-v017";
const FUNCTIONS_STORAGE_KEY = "backstage-functions-v018";
const statusLabels: Record<CalendarStatus, string> = { enquiry: "Enquiry demand", provisional: "Provisional", confirmed: "Confirmed", released: "Released", cancelled: "Cancelled", blocked: "Blocked" };
const statusClasses: Record<CalendarStatus, string> = {
  enquiry: "border-amber-300 bg-amber-50 text-amber-800",
  provisional: "border-[#DFC58F] bg-[#FBF3DF] text-[#806129]",
  confirmed: "border-[#B8D1BE] bg-[#E7F1E9] text-[#3F6848]",
  released: "border-slate-200 bg-slate-50 text-slate-500",
  cancelled: "border-red-200 bg-red-50 text-red-600",
  blocked: "border-slate-300 bg-slate-100 text-slate-700"
};

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return parseDate(value).toLocaleDateString("en-GB", options);
}

function monthDays(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start); date.setDate(start.getDate() + index); return date;
  });
}

function weekDays(cursor: Date) {
  const start = new Date(cursor);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
}

function expiryLabel(booking: CalendarBooking) {
  if (booking.status !== "provisional" || !booking.holdExpiresAt) return null;
  const days = Math.ceil((new Date(booking.holdExpiresAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

function emptyDraft(data: CalendarWorkspaceData, date: string) {
  return {
    clientName: "", eventType: "Private Event", date, startTime: "18:00", endTime: "23:30",
    spaceId: data.spaces[0]?.id || "", guestCount: 80, status: "provisional" as "provisional" | "confirmed",
    quotedValue: 0, setupMinutes: data.defaultSetupMinutes, clearMinutes: data.defaultClearMinutes,
    holdDays: data.defaultHoldDays, notes: ""
  };
}

function eventKind(eventType: string): EventPlanKind {
  const value = eventType.toLowerCase();
  if (value.includes("wedding")) return "wedding";
  if (value.includes("meeting") || value.includes("conference")) return "meeting";
  if (value.includes("wake")) return "wake";
  if (value.includes("party") || value.includes("celebration") || value.includes("christmas")) return "party";
  return "event";
}

export function CalendarWorkspace({ data }: { data: CalendarWorkspaceData }) {
  const router = useRouter();
  const today = isoDate(new Date());
  const [bookings, setBookings] = useState(data.bookings);
  const [hydrated, setHydrated] = useState(!data.demoMode);
  const [cursor, setCursor] = useState(() => parseDate(today));
  const [view, setView] = useState<View>("month");
  const [selectedDate, setSelectedDate] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(() => emptyDraft(data, today));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<CalendarStatus, boolean>>({ enquiry: true, provisional: true, confirmed: true, released: false, cancelled: false, blocked: true });

  useEffect(() => {
    if (!data.demoMode) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setBookings(JSON.parse(stored));
    } catch { /* use supplied demonstration data */ }
    setHydrated(true);
  }, [data.demoMode]);

  useEffect(() => {
    if (!data.demoMode || !hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings, data.demoMode, hydrated]);

  const visible = useMemo(() => bookings.filter((booking) => {
    if (!filters[booking.status]) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [booking.clientName, booking.title, booking.eventType, booking.spaceName].some((value) => value.toLowerCase().includes(needle));
  }).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)), [bookings, filters, query]);

  const selectedBookings = visible.filter((booking) => booking.date === selectedDate);
  const provisional = bookings.filter((booking) => booking.status === "provisional" && activeOccupancy(booking));
  const confirmed = bookings.filter((booking) => booking.status === "confirmed");
  const totalValue = bookings.filter((booking) => activeOccupancy(booking)).reduce((sum, booking) => sum + booking.quotedValue, 0);
  const expiring = provisional.filter((booking) => booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() - Date.now() <= 3 * 86400000).length;

  const candidate: CalendarBookingInput = {
    clientName: draft.clientName, title: `${draft.clientName || "New booking"} · ${draft.eventType}`, eventType: draft.eventType,
    date: draft.date, startTime: draft.startTime, endTime: draft.endTime, spaceId: draft.spaceId,
    guestCount: Number(draft.guestCount || 0), status: draft.status, quotedValue: Number(draft.quotedValue || 0),
    setupMinutes: Number(draft.setupMinutes || 0), clearMinutes: Number(draft.clearMinutes || 0), holdDays: Number(draft.holdDays || 14), notes: draft.notes
  };
  const draftConflicts = findConflicts(candidate, bookings);
  const selectedSpace = data.spaces.find((space) => space.id === draft.spaceId);
  const capacityExceeded = Boolean(selectedSpace?.capacity && candidate.guestCount > selectedSpace.capacity);

  function navigate(amount: number) {
    const next = new Date(cursor);
    if (view === "month") next.setMonth(next.getMonth() + amount);
    else next.setDate(next.getDate() + amount * (view === "week" ? 7 : 30));
    setCursor(next);
  }

  function openNew(date = selectedDate) {
    setSelectedDate(date);
    setDraft(emptyDraft(data, date));
    setError("");
    setShowForm(true);
  }

  async function createBooking(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!candidate.clientName.trim()) return setError("Enter the customer or event name.");
    if (minutes(candidate.endTime) <= minutes(candidate.startTime)) return setError("The finish time must be after the start time.");
    if (capacityExceeded) return setError(`${selectedSpace?.name} has a maximum listed capacity of ${selectedSpace?.capacity}.`);
    if (draftConflicts.length) return setError(`This clashes with ${draftConflicts.map((booking) => booking.title).join(", ")}. Choose another time or space.`);

    setBusy(true);
    let eventId: string | undefined;
    let allocationId: string | undefined;
    if (!data.demoMode) {
      const result = await createCalendarBookingAction(candidate);
      if (!result.ok) { setBusy(false); setError(result.error || "The booking could not be saved."); return; }
      eventId = result.eventId; allocationId = result.allocationId;
    }

    const holdExpiresAt = candidate.status === "provisional" ? new Date(Date.now() + candidate.holdDays * 86400000).toISOString() : undefined;
    const resolvedEventId = eventId || crypto.randomUUID();
    setBookings((current) => [...current, {
      ...candidate,
      id: allocationId || crypto.randomUUID(),
      eventId: resolvedEventId,
      spaceName: selectedSpace?.name || "Space",
      holdExpiresAt
    }]);
    if (data.demoMode) {
      let functions = demoEvents;
      try { functions = JSON.parse(window.localStorage.getItem(FUNCTIONS_STORAGE_KEY) || JSON.stringify(demoEvents)); } catch { /* use supplied functions */ }
      const functionRecord: EventRecord = {
        id: resolvedEventId, title: candidate.title, clientName: candidate.clientName, eventType: candidate.eventType,
        eventDate: candidate.date, startTime: candidate.startTime, endTime: candidate.endTime, guestCount: candidate.guestCount,
        status: candidate.status === "confirmed" ? "confirmed" : "provisional", quotedValue: candidate.quotedValue, paidValue: 0, owner: "Unassigned", room: selectedSpace?.name,
        createdAt: new Date().toISOString(), readinessScore: 20, nextAction: "Complete the operational plan",
        functionSheetStatus: "not_started", foodOrderStatus: "not_started",
        plan: { kind: eventKind(candidate.eventType), contact: { organiser: candidate.clientName }, room: { space: selectedSpace?.name }, food: {}, av: {}, entertainment: {}, accommodation: {}, customerRequirements: candidate.notes },
        tasks: [{ id: crypto.randomUUID(), title: "Complete the operational plan", category: "Planning", priority: "High", assignedTo: "Unassigned", completed: false }],
        runningOrder: [], payments: candidate.quotedValue ? [{ id: crypto.randomUUID(), label: "Booking value", amount: candidate.quotedValue, status: "scheduled" }] : [],
        integrations: demoEvents[0].integrations
      };
      window.localStorage.setItem(FUNCTIONS_STORAGE_KEY, JSON.stringify([...functions.filter((item) => item.id !== resolvedEventId), functionRecord]));
    }
    setBusy(false);
    setSelectedDate(candidate.date);
    setShowForm(false);
    router.refresh();
  }

  async function changeStatus(booking: CalendarBooking, status: "confirmed" | "released") {
    setBusy(true);
    if (!data.demoMode) {
      const result = status === "confirmed" ? await confirmCalendarBookingAction(booking.id) : await releaseCalendarBookingAction(booking.id);
      if (!result.ok) { setBusy(false); setError(result.error || "The booking could not be updated."); return; }
    }
    setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status, holdExpiresAt: undefined } : item));
    if (data.demoMode && booking.eventId) {
      try {
        const functions = JSON.parse(window.localStorage.getItem(FUNCTIONS_STORAGE_KEY) || JSON.stringify(demoEvents)) as EventRecord[];
        window.localStorage.setItem(FUNCTIONS_STORAGE_KEY, JSON.stringify(functions.map((item) => item.id === booking.eventId ? { ...item, status: status === "confirmed" ? "confirmed" : "cancelled" } : item)));
      } catch { /* calendar status remains updated */ }
    }
    setBusy(false);
    router.refresh();
  }

  function resetBuildData() {
    if (!data.demoMode) return;
    setBookings(data.bookings);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function bookingChip(booking: CalendarBooking) {
    return <button key={booking.id} onClick={(event) => { event.stopPropagation(); setSelectedDate(booking.date); }} className={`block w-full truncate rounded-lg border px-2 py-1.5 text-left text-[10px] font-semibold ${statusClasses[booking.status]}`}><span className="mr-1 opacity-60">{booking.advisory ? "" : booking.startTime}</span>{booking.clientName}</button>;
  }

  const month = monthDays(cursor);
  const week = weekDays(cursor);
  const listGroups = Array.from(new Set(visible.map((booking) => booking.date)));
  const title = view === "month" ? cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : view === "week" ? `${formatDate(isoDate(week[0]), { day: "numeric", month: "short" })} – ${formatDate(isoDate(week[6]), { day: "numeric", month: "short", year: "numeric" })}` : "Upcoming bookings";

  return (
    <div className="mx-auto max-w-[1700px] space-y-6">
      <section className="relative overflow-hidden rounded-[32px] bg-backstage-ink p-7 text-white shadow-soft md:p-9">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-backstage-gold/15 blur-3xl"/>
        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-backstage-gold"><CalendarDays size={14}/> Venue availability</div><h1 className="backstage-display mt-4 text-5xl md:text-6xl">Calendar Command Centre</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">Confirmed events, provisional holds and live enquiry demand—checked against spaces, times and turnaround.</p></div>
          <div className="flex flex-wrap gap-3"><button onClick={() => openNew()} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-backstage-ink"><Plus size={16}/>New booking</button>{data.demoMode && <button onClick={resetBuildData} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70"><RotateCcw size={15}/>Reset demo</button>}</div>
        </div>
        {data.demoMode && <div className="relative mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-backstage-gold/20 bg-white/[.05] p-4 text-xs leading-5 text-white/60"><LockKeyhole size={16} className="mt-0.5 shrink-0 text-backstage-gold"/><span><strong className="text-white">Build mode is active.</strong> No authentication setup is required. Calendar changes persist in this browser while we finish Backstage.</span></div>}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Confirmed bookings", value: confirmed.length, note: "Operational diary", icon: ShieldCheck }, { label: "Provisional holds", value: provisional.length, note: `${expiring} expiring soon`, icon: Clock3 }, { label: "Diary value", value: `£${totalValue.toLocaleString("en-GB")}`, note: "Active bookings", icon: PoundSterling }, { label: "Spaces", value: data.spaces.length, note: "Checked independently", icon: Users }].map(({ label, value, note, icon: Icon }) => <article key={label} className="backstage-panel rounded-3xl p-5"><div className="flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-black/35">{label}</div><div className="backstage-display mt-2 text-3xl">{value}</div><div className="mt-1 text-xs text-black/35">{note}</div></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-backstage-cream text-backstage-gold"><Icon size={17}/></div></div></article>)}
      </section>

      <section className="backstage-panel overflow-hidden rounded-[28px]">
        <div className="flex flex-col gap-4 border-b border-backstage-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2"><button onClick={() => navigate(-1)} className="rounded-xl border border-backstage-line bg-white p-2.5"><ChevronLeft size={16}/></button><button onClick={() => { const date = new Date(); setCursor(date); setSelectedDate(isoDate(date)); }} className="rounded-xl border border-backstage-line bg-white px-4 py-2.5 text-xs font-semibold">Today</button><button onClick={() => navigate(1)} className="rounded-xl border border-backstage-line bg-white p-2.5"><ChevronRight size={16}/></button><h2 className="backstage-display ml-2 text-2xl">{title}</h2></div>
          <div className="flex flex-wrap gap-2"><div className="flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-3"><Search size={14} className="text-black/30"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search diary…" className="w-36 bg-transparent py-2.5 text-xs outline-none"/></div><div className="flex rounded-xl bg-backstage-cream p-1">{(["month", "week", "list"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${view === item ? "bg-white text-backstage-ink shadow-sm" : "text-black/40"}`}>{item}</button>)}</div></div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-backstage-line bg-[#FBF9F5] px-4 py-3"><Filter size={14} className="text-black/30"/>{(["confirmed", "provisional", "enquiry", "blocked"] as CalendarStatus[]).map((status) => <label key={status} className="flex cursor-pointer items-center gap-2 text-xs text-black/50"><input type="checkbox" checked={filters[status]} onChange={(event) => setFilters((current) => ({ ...current, [status]: event.target.checked }))} className="accent-backstage-gold"/><span className={`h-2.5 w-2.5 rounded-full border ${statusClasses[status]}`}/>{statusLabels[status]}</label>)}</div>

        {view === "month" && <div className="overflow-x-auto"><div className="min-w-[850px]"><div className="grid grid-cols-7 border-b border-backstage-line bg-[#FBF9F5]">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-black/35">{day}</div>)}</div><div className="grid grid-cols-7">{month.map((date) => { const dateIso = isoDate(date); const dayBookings = visible.filter((booking) => booking.date === dateIso); return <button key={dateIso} onClick={() => setSelectedDate(dateIso)} className={`min-h-32 border-b border-r border-backstage-line p-2 text-left transition hover:bg-[#FBF9F5] ${date.getMonth() !== cursor.getMonth() ? "bg-black/[.015] text-black/25" : "bg-white"} ${dateIso === today ? "ring-2 ring-inset ring-backstage-gold/60" : ""} ${dateIso === selectedDate ? "bg-[#FBF7EF]" : ""}`}><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">{date.getDate()}</span>{dayBookings.length > 0 && <span className="rounded-full bg-backstage-cream px-1.5 py-0.5 text-[9px] text-black/35">{dayBookings.length}</span>}</div><div className="space-y-1">{dayBookings.slice(0, 3).map(bookingChip)}{dayBookings.length > 3 && <div className="px-1 text-[9px] text-black/35">+{dayBookings.length - 3} more</div>}</div></button>; })}</div></div></div>}

        {view === "week" && <div className="grid min-w-[850px] grid-cols-7 overflow-x-auto">{week.map((date) => { const dateIso = isoDate(date); const dayBookings = visible.filter((booking) => booking.date === dateIso); return <div key={dateIso} className={`min-h-[420px] border-r border-backstage-line p-3 last:border-0 ${dateIso === today ? "bg-[#FBF7EF]" : "bg-white"}`}><button onClick={() => setSelectedDate(dateIso)} className="mb-4 w-full text-left"><div className="text-[10px] uppercase text-black/35">{date.toLocaleDateString("en-GB", { weekday: "short" })}</div><div className="backstage-display text-2xl">{date.getDate()}</div></button><div className="space-y-2">{dayBookings.map(bookingChip)}{!dayBookings.length && <div className="rounded-xl border border-dashed border-backstage-line p-4 text-center text-[10px] text-black/25">Available</div>}</div></div>; })}</div>}

        {view === "list" && <div className="p-4">{listGroups.map((date) => <div key={date} className="border-b border-backstage-line py-4 last:border-0"><div className="mb-3 text-xs font-bold text-black/45">{formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div><div className="space-y-2">{visible.filter((booking) => booking.date === date).map((booking) => <button key={booking.id} onClick={() => setSelectedDate(date)} className="grid w-full grid-cols-[70px_1fr_auto] items-center gap-4 rounded-2xl border border-backstage-line bg-white p-4 text-left"><div className="text-sm font-semibold">{booking.advisory ? "Demand" : booking.startTime}</div><div><div className="text-sm font-semibold">{booking.clientName}</div><div className="mt-1 text-xs text-black/35">{booking.eventType} · {booking.spaceName} · {booking.guestCount} guests</div></div><span className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${statusClasses[booking.status]}`}>{statusLabels[booking.status]}</span></button>)}</div></div>)}{!listGroups.length && <div className="py-16 text-center text-sm text-black/30">No bookings match the current filters.</div>}</div>}
      </section>

      <section className="backstage-panel rounded-[28px] p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="backstage-kicker">Selected date</div><h2 className="backstage-display mt-2 text-3xl">{formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2></div><button onClick={() => openNew(selectedDate)} className="flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><Plus size={15}/>Add booking</button></div><div className="mt-6 grid gap-3 lg:grid-cols-2">{selectedBookings.map((booking) => <article key={booking.id} className="rounded-2xl border border-backstage-line bg-white p-4"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-backstage-gold">{booking.eventType}</div><h3 className="mt-1 text-base font-semibold">{booking.clientName}</h3><div className="mt-2 text-xs text-black/40">{booking.advisory ? "Preferred date—not blocking availability" : `${booking.startTime}–${booking.endTime} · ${booking.spaceName}`}</div></div><span className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${statusClasses[booking.status]}`}>{expiryLabel(booking) || statusLabels[booking.status]}</span></div><div className="mt-4 flex items-center gap-4 text-xs text-black/40"><span className="flex items-center gap-1"><Users size={13}/>{booking.guestCount}</span><span className="flex items-center gap-1"><PoundSterling size={13}/>{booking.quotedValue.toLocaleString("en-GB")}</span></div><div className="mt-4 flex flex-wrap gap-2">{booking.eventId && !booking.advisory && <Link href={`/events/${booking.eventId}`} className="rounded-xl bg-backstage-ink px-3 py-2 text-xs font-semibold text-white">Open function</Link>}{booking.status === "provisional" && <><button disabled={busy} onClick={() => changeStatus(booking, "confirmed")} className="flex items-center gap-2 rounded-xl bg-[#E7F1E9] px-3 py-2 text-xs font-semibold text-[#3F6848]"><CheckCircle2 size={14}/>Confirm</button><button disabled={busy} onClick={() => changeStatus(booking, "released")} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Release hold</button></>}</div></article>)}{!selectedBookings.length && <div className="col-span-full rounded-2xl border border-dashed border-backstage-line py-10 text-center text-sm text-black/30">No bookings or enquiry demand on this date.</div>}</div></section>

      {showForm && <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/35 backdrop-blur-sm md:p-4"><div className="h-full w-full overflow-y-auto bg-[#FFFCF8] p-5 shadow-2xl md:max-w-xl md:rounded-[28px] md:p-7"><div className="flex items-start justify-between"><div><div className="backstage-kicker">Availability protected</div><h2 className="backstage-display mt-2 text-4xl">New booking</h2></div><button onClick={() => setShowForm(false)} className="rounded-xl border border-backstage-line bg-white p-2"><X size={18}/></button></div><form onSubmit={createBooking} className="mt-7 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Customer / event name"><input required value={draft.clientName} onChange={(event) => setDraft({ ...draft, clientName: event.target.value })}/></Field><Field label="Event type"><select value={draft.eventType} onChange={(event) => setDraft({ ...draft, eventType: event.target.value })}><option>Wedding</option><option>Meeting</option><option>Conference</option><option>Private Event</option><option>Christmas</option><option>Celebration</option></select></Field><Field label="Date"><input type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })}/></Field><Field label="Space"><select required value={draft.spaceId} onChange={(event) => setDraft({ ...draft, spaceId: event.target.value })}>{data.spaces.map((space) => <option key={space.id} value={space.id}>{space.name} · max {space.capacity}</option>)}</select></Field><Field label="Start time"><input type="time" required value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })}/></Field><Field label="Finish time"><input type="time" required value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}/></Field><Field label="Guests"><input type="number" min="0" value={draft.guestCount} onChange={(event) => setDraft({ ...draft, guestCount: Number(event.target.value) })}/></Field><Field label="Estimated value (£)"><input type="number" min="0" step="0.01" value={draft.quotedValue} onChange={(event) => setDraft({ ...draft, quotedValue: Number(event.target.value) })}/></Field><Field label="Setup buffer (minutes)"><input type="number" min="0" value={draft.setupMinutes} onChange={(event) => setDraft({ ...draft, setupMinutes: Number(event.target.value) })}/></Field><Field label="Clear-down buffer (minutes)"><input type="number" min="0" value={draft.clearMinutes} onChange={(event) => setDraft({ ...draft, clearMinutes: Number(event.target.value) })}/></Field><Field label="Booking status"><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as "provisional" | "confirmed" })}><option value="provisional">Provisional hold</option><option value="confirmed">Confirmed booking</option></select></Field>{draft.status === "provisional" && <Field label="Hold for days"><input type="number" min="1" max="90" value={draft.holdDays} onChange={(event) => setDraft({ ...draft, holdDays: Number(event.target.value) })}/></Field>}</div><Field label="Notes"><textarea rows={4} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })}/></Field>{draftConflicts.length > 0 && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><div className="flex items-center gap-2 font-semibold"><AlertTriangle size={16}/>Conflict detected</div><div className="mt-2 text-xs leading-5">{draftConflicts.map((booking) => `${booking.title} (${booking.startTime}–${booking.endTime})`).join(", ")}</div></div>}{capacityExceeded && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Guest numbers exceed the listed capacity for {selectedSpace?.name}.</div>}{!draftConflicts.length && !capacityExceeded && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><ShieldCheck size={16}/>No space or time conflict found.</div>}{error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<button disabled={busy || draftConflicts.length > 0 || capacityExceeded} className="flex w-full items-center justify-center gap-2 rounded-xl bg-backstage-ink px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Saving…" : draft.status === "provisional" ? "Create provisional hold" : "Create confirmed booking"}</button></form></div></div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/40">{label}<div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-backstage-line [&_input]:bg-white [&_input]:px-3 [&_input]:py-3 [&_input]:text-sm [&_input]:font-normal [&_input]:normal-case [&_input]:tracking-normal [&_input]:text-black [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-backstage-line [&_select]:bg-white [&_select]:px-3 [&_select]:py-3 [&_select]:text-sm [&_select]:font-normal [&_select]:normal-case [&_select]:tracking-normal [&_select]:text-black [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-backstage-line [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-normal [&_textarea]:normal-case [&_textarea]:tracking-normal [&_textarea]:text-black">{children}</div></label>;
}
