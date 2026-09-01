"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Bot, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChefHat, CircleDollarSign, Clock3, Cloud, FileText, HeartHandshake, Hotel, LayoutTemplate, LockKeyhole, Mail, MessageSquareText, MonitorUp, Plus, PoundSterling, Save, ShieldCheck, Sparkles, Trash2, Users } from "lucide-react";
import { saveEventWorkspaceAction } from "../actions";
import type { EventPlan, EventRecord, EventRunningOrderItem, EventStatus, EventTask, EventsWorkspaceData } from "../types/event";
import { EVENTS_STORAGE_KEY } from "./functions-command-centre";

type Tab = "overview" | "plan" | "tasks" | "running" | "finance" | "outputs";
const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

function formatDate(value?: string) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date TBC";
}

function calculateReadiness(event: EventRecord) {
  const plan = event.plan;
  const common = [event.eventDate, event.guestCount, event.room || plan.room.space, plan.room.layout, plan.food.catering, plan.food.dietary, event.startTime, event.endTime, plan.customerRequirements];
  const specific = plan.kind === "meeting"
    ? [event.packageName, plan.food.refreshments, plan.contact.organiser, plan.av.projector !== undefined]
    : plan.kind === "party"
      ? [plan.food.drinks, plan.entertainment.dj, plan.entertainment.cake]
      : [plan.contact.organiser];
  const taskGate = event.tasks.length > 0 && event.tasks.every((task) => task.completed);
  const checks = [...common, ...specific, event.runningOrder.length > 0, taskGate, event.functionSheetStatus !== "not_started"];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value?: string | number; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/35">{label}<input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal text-black outline-none focus:border-backstage-gold"/></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/35">{label}<select value={value || ""} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal text-black outline-none focus:border-backstage-gold"><option value="">Select…</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/35">{label}<textarea rows={4} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-3 py-3 text-sm font-normal leading-6 normal-case tracking-normal text-black outline-none focus:border-backstage-gold"/></label>;
}

function Section({ eyebrow, title, icon: Icon, children }: { eyebrow: string; title: string; icon: typeof CalendarDays; children: React.ReactNode }) {
  return <section className="backstage-panel rounded-[26px] p-5 md:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-backstage-cream text-backstage-gold"><Icon size={17}/></div><div><div className="backstage-kicker">{eyebrow}</div><h2 className="backstage-display mt-1 text-2xl">{title}</h2></div></div><div className="mt-6">{children}</div></section>;
}

export function FunctionWorkspace({ data, eventId }: { data: EventsWorkspaceData; eventId: string }) {
  const supplied = data.events.find((item) => item.id === eventId)!;
  const [event, setEvent] = useState(supplied);
  const [tab, setTab] = useState<Tab>("overview");
  const [hydrated, setHydrated] = useState(!data.demoMode);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", dueDate: "", category: "Planning" as EventTask["category"] });
  const [newOrder, setNewOrder] = useState({ time: "", title: "" });

  useEffect(() => {
    if (!data.demoMode) return;
    try {
      const stored = window.localStorage.getItem(EVENTS_STORAGE_KEY);
      const found = stored ? (JSON.parse(stored) as EventRecord[]).find((item) => item.id === eventId) : null;
      if (found) setEvent(found);
    } catch { /* keep supplied event */ }
    setHydrated(true);
  }, [data.demoMode, eventId]);

  const outstanding = Math.max(0, event.quotedValue - event.paidValue);
  const openTasks = event.tasks.filter((task) => !task.completed);
  const readiness = calculateReadiness(event);
  const missing = useMemo(() => {
    const items: string[] = [];
    if (!event.guestCount) items.push("guest numbers");
    if (!event.room && !event.plan.room.space) items.push("room");
    if (!event.plan.room.layout) items.push("room layout");
    if (!event.plan.food.catering) items.push("food choice");
    if (!event.plan.food.dietary) items.push("dietary check");
    if (!event.runningOrder.length) items.push("running order");
    if (event.functionSheetStatus === "not_started") items.push("function sheet");
    if (event.plan.kind === "meeting" && event.plan.av.projector === undefined) items.push("projector decision");
    if (event.plan.kind === "party" && !event.plan.entertainment.dj) items.push("entertainment decision");
    return items;
  }, [event]);

  function update(patch: Partial<EventRecord>) {
    setEvent((current) => ({ ...current, ...patch }));
    setDirty(true);
    setMessage("");
  }

  function updatePlan<K extends keyof EventPlan>(section: K, patch: Partial<EventPlan[K]>) {
    setEvent((current) => ({ ...current, plan: { ...current.plan, [section]: typeof current.plan[section] === "object" ? { ...current.plan[section], ...patch } : patch } } as EventRecord));
    setDirty(true);
    setMessage("");
  }

  function updatePlanText(key: "customerRequirements" | "internalNotes", value: string) {
    setEvent((current) => ({ ...current, plan: { ...current.plan, [key]: value } }));
    setDirty(true);
    setMessage("");
  }

  async function persist(next = event, note = "Function record saved") {
    const withReadiness = { ...next, readinessScore: calculateReadiness(next) };
    setEvent(withReadiness);
    setBusy(true);
    if (data.demoMode) {
      let all = data.events;
      try { all = JSON.parse(window.localStorage.getItem(EVENTS_STORAGE_KEY) || JSON.stringify(data.events)); } catch { /* use supplied list */ }
      window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(all.map((item: EventRecord) => item.id === withReadiness.id ? withReadiness : item)));
    } else {
      const result = await saveEventWorkspaceAction(withReadiness);
      if (!result.ok) { setBusy(false); setMessage(result.error || "This record could not be saved."); return; }
    }
    setDirty(false);
    setBusy(false);
    setMessage(note);
  }

  function toggleTask(id: string) {
    const next = { ...event, tasks: event.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) };
    void persist(next, "Checklist updated");
  }

  function addTask(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!newTask.title.trim()) return;
    const next = { ...event, tasks: [...event.tasks, { id: crypto.randomUUID(), title: newTask.title.trim(), dueDate: newTask.dueDate || undefined, category: newTask.category, priority: "Medium" as const, assignedTo: event.owner, completed: false }] };
    setNewTask({ title: "", dueDate: "", category: "Planning" });
    void persist(next, "Task added");
  }

  function addRunningItem(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!newOrder.time || !newOrder.title.trim()) return;
    const item: EventRunningOrderItem = { id: crypto.randomUUID(), time: newOrder.time, title: newOrder.title.trim(), category: "operations", completed: false };
    const next = { ...event, runningOrder: [...event.runningOrder, item].sort((a, b) => a.time.localeCompare(b.time)) };
    setNewOrder({ time: "", title: "" });
    void persist(next, "Running order updated");
  }

  function markPaymentPaid(id: string) {
    const target = event.payments.find((payment) => payment.id === id);
    if (!target || target.status === "paid") return;
    const next = { ...event, paidValue: Math.min(event.quotedValue, event.paidValue + target.amount), payments: event.payments.map((payment) => payment.id === id ? { ...payment, status: "paid" as const, paidDate: new Date().toISOString().slice(0, 10) } : payment) };
    void persist(next, "Payment position updated");
  }

  const tabs: Array<[Tab, string]> = [["overview", "Overview"], ["plan", "Plan Function"], ["tasks", `Checklist (${openTasks.length})`], ["running", "Running Order"], ["finance", "Payments"], ["outputs", "Outputs & Integrations"]];

  if (!hydrated) return <div className="backstage-panel rounded-3xl p-10 text-sm text-black/40">Loading function workspace…</div>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="print:hidden"><Link href="/events" className="inline-flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ArrowLeft size={14}/> Back to Functions</Link></div>
      <section className="backstage-conference-photo relative overflow-hidden rounded-[32px] text-white print:hidden"><div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/95 via-[#0B141E]/78 to-[#0B141E]/30"/><div className="relative p-7 md:p-9">
        <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-start"><div><div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#E2C69D]"><span>{event.eventType}</span><span>·</span><span>{event.status}</span>{event.bookingReference && <span>· {event.bookingReference}</span>}</div><h1 className="backstage-display mt-4 text-5xl md:text-6xl">{event.clientName}</h1><p className="mt-4 max-w-2xl text-sm text-white/60">{event.title}</p></div><div className="flex flex-wrap gap-2">{event.linkedWeddingId && <Link href={`/weddings/${event.linkedWeddingId}`} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-backstage-ink"><HeartHandshake size={16}/>Open Wedding workspace</Link>}<button disabled={busy || !dirty} onClick={() => persist()} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold disabled:opacity-40"><Save size={15}/>{busy ? "Saving…" : dirty ? "Save changes" : "Saved"}</button></div></div>
        <div className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Date", formatDate(event.eventDate), CalendarDays], ["Guests", event.dayGuests ? `${event.dayGuests} day / ${event.eveningGuests} evening` : `${event.guestCount || "—"}`, Users], ["Room", event.room || "TBC", LayoutTemplate], ["Value", money.format(event.quotedValue), PoundSterling], ["Readiness", `${readiness}%`, ShieldCheck]].map(([label, value, Icon]) => <div key={String(label)} className="backstage-glass rounded-2xl p-4"><Icon size={14} className="text-[#E2C69D]"/><div className="mt-2 text-[10px] uppercase tracking-[.1em] text-white/35">{String(label)}</div><div className="mt-1 truncate text-sm font-semibold">{String(value)}</div></div>)}</div>
        {data.demoMode && <div className="mt-5 flex items-center gap-2 text-[11px] text-white/45"><LockKeyhole size={13} className="text-[#E2C69D]"/>Build-mode changes stay in this browser; no account setup is required.</div>}
      </div></section>

      <nav className="print:hidden overflow-x-auto"><div className="flex min-w-max gap-1 rounded-2xl border border-backstage-line bg-[#FFFCF8] p-1.5">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${tab === id ? "bg-backstage-ink text-white shadow-sm" : "text-black/45 hover:bg-backstage-cream hover:text-black"}`}>{label}</button>)}</div></nav>
      {message && <div className={`print:hidden rounded-2xl border px-4 py-3 text-xs ${message.includes("could not") ? "border-red-200 bg-red-50 text-red-700" : "border-[#B8D1BE] bg-[#E7F1E9] text-[#3F6848]"}`}>{message}</div>}

      {tab === "overview" && <div className="print:hidden grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-6"><Section eyebrow="Next move" title={event.nextAction} icon={AlertTriangle}><div className="grid gap-4 md:grid-cols-[1fr_220px]"><div><p className="text-sm leading-6 text-black/50">This is the next operational action recorded against the booking. Update it as the function moves through planning.</p><Field label="Next action" value={event.nextAction} onChange={(value) => update({ nextAction: value })}/></div><Field label="Due date" type="date" value={event.nextActionDue} onChange={(value) => update({ nextActionDue: value })}/></div></Section>
          <Section eyebrow="Operational snapshot" title="The function at a glance" icon={LayoutTemplate}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[["Package", event.packageName || "Not selected"], ["Room setup", event.plan.room.layout || "Not confirmed"], ["Food", event.plan.food.catering || "Not confirmed"], ["Dietaries", event.plan.food.dietary || "Not confirmed"], ["Arrival", event.startTime || "TBC"], ["Finish", event.endTime || "TBC"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-backstage-cream p-4"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-black/30">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>)}</div></Section>
          <Section eyebrow="Open checklist" title={`${openTasks.length} actions outstanding`} icon={CheckCircle2}><div className="space-y-2">{openTasks.slice(0, 5).map((task) => <button key={task.id} onClick={() => toggleTask(task.id)} className="flex w-full items-start gap-3 rounded-2xl border border-backstage-line bg-white p-4 text-left"><span className="mt-0.5 h-4 w-4 rounded border border-black/20"/><div className="flex-1"><div className="text-sm font-semibold">{task.title}</div><div className="mt-1 text-xs text-black/35">{task.category}{task.dueDate ? ` · due ${formatDate(task.dueDate)}` : ""}</div></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${task.priority === "High" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{task.priority}</span></button>)}</div></Section></div>
        <aside className="space-y-6"><Section eyebrow="Readiness" title={`${readiness}% complete`} icon={ShieldCheck}><div className="h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-backstage-gold" style={{ width: `${readiness}%` }}/></div>{missing.length ? <div className="mt-5"><div className="text-xs font-semibold text-red-700">Still required</div><div className="mt-3 flex flex-wrap gap-2">{missing.map((item) => <span key={item} className="rounded-full bg-red-50 px-3 py-1.5 text-[10px] text-red-700">{item}</span>)}</div></div> : <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#3F6848]"><CheckCircle2 size={16}/>Core plan ready</div>}</Section>
          <Section eyebrow="Financial position" title={money.format(outstanding)} icon={CircleDollarSign}><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-black/40">Agreed value</span><strong>{money.format(event.quotedValue)}</strong></div><div className="flex justify-between"><span className="text-black/40">Paid</span><strong className="text-[#3F6848]">{money.format(event.paidValue)}</strong></div><div className="flex justify-between border-t border-backstage-line pt-3"><span className="text-black/40">Outstanding</span><strong className={outstanding ? "text-red-700" : "text-[#3F6848]"}>{money.format(outstanding)}</strong></div></div></Section>
          <Section eyebrow="Outputs" title="Team handover" icon={FileText}><div className="space-y-3">{[["Function sheet", event.functionSheetStatus], ["Food order", event.foodOrderStatus]].map(([label, state]) => <div key={label} className="flex items-center justify-between rounded-2xl bg-backstage-cream p-4"><span className="text-sm font-semibold">{label}</span><span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold capitalize text-black/45">{state.replace("_", " ")}</span></div>)}</div></Section></aside>
      </div>}

      {tab === "plan" && <div className="print:hidden space-y-6">
        {event.plan.kind === "wedding" && event.linkedWeddingId && <div className="flex flex-col justify-between gap-4 rounded-[26px] border border-[#E2C69D]/40 bg-[#FBF3E7] p-5 md:flex-row md:items-center"><div><div className="backstage-kicker">Specialist workflow</div><div className="mt-2 text-lg font-semibold">This booking has a full Wedding workspace.</div><p className="mt-1 text-xs text-black/45">Guided meetings, guests, seating, music, décor, suppliers and wedding-day operations live there.</p></div><Link href={`/weddings/${event.linkedWeddingId}`} className="flex items-center justify-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><HeartHandshake size={15}/>Open Wedding workspace</Link></div>}
        <Section eyebrow="Core booking" title="Function details" icon={BriefcaseBusiness}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="Client / function name" value={event.clientName} onChange={(value) => update({ clientName: value })}/><Field label="BK reference" value={event.bookingReference} onChange={(value) => update({ bookingReference: value.toUpperCase() })} placeholder="BK…"/><Field label="Event date" type="date" value={event.eventDate} onChange={(value) => update({ eventDate: value })}/><Field label="Coordinator" value={event.owner} onChange={(value) => update({ owner: value })}/><Field label="Guests / delegates" type="number" value={event.guestCount} onChange={(value) => update({ guestCount: Number(value) })}/><Field label="Package" value={event.packageName} onChange={(value) => update({ packageName: value })}/><SelectField label="Booking status" value={event.status} options={["draft", "provisional", "confirmed", "planning", "ready", "live", "completed", "cancelled"]} onChange={(value) => update({ status: value as EventStatus })}/><Field label="Start" type="time" value={event.startTime} onChange={(value) => update({ startTime: value })}/><Field label="Finish" type="time" value={event.endTime} onChange={(value) => update({ endTime: value })}/></div></Section>
        <Section eyebrow="Customer" title="Organiser & billing" icon={Users}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><Field label="Organiser" value={event.plan.contact.organiser} onChange={(value) => updatePlan("contact", { organiser: value })}/><Field label="Company" value={event.plan.contact.company} onChange={(value) => updatePlan("contact", { company: value })}/><Field label="Email" type="email" value={event.plan.contact.email} onChange={(value) => updatePlan("contact", { email: value })}/><Field label="Phone" value={event.plan.contact.phone} onChange={(value) => updatePlan("contact", { phone: value })}/><Field label="PO / billing reference" value={event.plan.contact.poNumber} onChange={(value) => updatePlan("contact", { poNumber: value })}/></div></Section>
        <Section eyebrow="Room" title="Setup & arrival" icon={LayoutTemplate}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="Room / space" value={event.room || event.plan.room.space} onChange={(value) => { update({ room: value }); updatePlan("room", { space: value }); }}/><SelectField label="Layout" value={event.plan.room.layout} options={["Boardroom", "Theatre", "Classroom", "U-Shape", "Cabaret", "Banquet / Rounds", "Party / Open Floor", "Mixed seating", "Bespoke"]} onChange={(value) => updatePlan("room", { layout: value })}/><Field label="Tables / seating" value={event.plan.room.tables} onChange={(value) => updatePlan("room", { tables: value })}/><Field label="Breakout rooms" value={event.plan.room.breakouts} onChange={(value) => updatePlan("room", { breakouts: value })}/><Field label="Registration / welcome" value={event.plan.room.registration} onChange={(value) => updatePlan("room", { registration: value })}/><Field label="Signage wording" value={event.plan.room.signage} onChange={(value) => updatePlan("room", { signage: value })}/><Field label="Venue access" type="time" value={event.plan.room.accessTime} onChange={(value) => updatePlan("room", { accessTime: value })}/><Field label="Room clear / reset" value={event.plan.room.resetTime} onChange={(value) => updatePlan("room", { resetTime: value })}/></div></Section>
        <Section eyebrow="Catering" title="Food, drink & dietaries" icon={ChefHat}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="Food / menu" value={event.plan.food.catering} onChange={(value) => updatePlan("food", { catering: value })}/><Field label="Refreshments" value={event.plan.food.refreshments} onChange={(value) => updatePlan("food", { refreshments: value })}/><Field label="Bar / drinks" value={event.plan.food.drinks} onChange={(value) => updatePlan("food", { drinks: value })}/><Field label="Food service time" type="time" value={event.plan.food.serviceTime} onChange={(value) => updatePlan("food", { serviceTime: value })}/><div className="md:col-span-2 xl:col-span-4"><TextArea label="Dietary & allergen requirements" value={event.plan.food.dietary} onChange={(value) => updatePlan("food", { dietary: value })} placeholder="If none, record ‘None confirmed’."/></div></div></Section>
        {event.plan.kind === "meeting" && <Section eyebrow="Equipment" title="AV requirements" icon={MonitorUp}><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{([ ["projector", "Projector"], ["tv1", "TV 1"], ["tv2", "TV 2"], ["pa", "PA / microphones"], ["lectern", "Lectern"], ["flipchart", "Flipchart & pens"], ["welcomeSlide", "Welcome slide"], ["stage", "Stage"], ["wifi", "Wi-Fi"] ] as Array<[keyof EventPlan["av"], string]>).map(([key, label]) => <button key={key} type="button" onClick={() => updatePlan("av", { [key]: !event.plan.av[key] })} className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-xs font-semibold ${event.plan.av[key] ? "border-[#B8D1BE] bg-[#E7F1E9] text-[#3F6848]" : "border-backstage-line bg-white text-black/50"}`}><span className={`grid h-5 w-5 place-items-center rounded-md border ${event.plan.av[key] ? "border-[#3F6848] bg-[#3F6848] text-white" : "border-black/15"}`}>{event.plan.av[key] && <Check size={12}/>}</span>{label}</button>)}</div><div className="mt-4"><TextArea label="AV notes" value={event.plan.av.notes} onChange={(value) => updatePlan("av", { notes: value })}/></div></Section>}
        {(event.plan.kind === "party" || event.plan.kind === "wedding") && <Section eyebrow="Experience" title="Entertainment & décor" icon={Sparkles}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="DJ / entertainment" value={event.plan.entertainment.dj} onChange={(value) => updatePlan("entertainment", { dj: value })}/><Field label="Cake" value={event.plan.entertainment.cake} onChange={(value) => updatePlan("entertainment", { cake: value })}/><Field label="Decorations" value={event.plan.entertainment.decor} onChange={(value) => updatePlan("entertainment", { decor: value })}/><Field label="Lighting" value={event.plan.entertainment.lighting} onChange={(value) => updatePlan("entertainment", { lighting: value })}/><div className="md:col-span-2 xl:col-span-4"><TextArea label="Entertainment / décor notes" value={event.plan.entertainment.extras} onChange={(value) => updatePlan("entertainment", { extras: value })}/></div></div></Section>}
        <Section eyebrow="Bedrooms" title="Accommodation" icon={Hotel}><div className="grid gap-4 md:grid-cols-[220px_1fr_1fr]"><label className="flex items-center gap-3 rounded-2xl border border-backstage-line bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={Boolean(event.plan.accommodation.required)} onChange={(change) => updatePlan("accommodation", { required: change.target.checked })} className="accent-backstage-gold"/>Accommodation required</label><Field label="Rooms / room block" value={event.plan.accommodation.rooms} onChange={(value) => updatePlan("accommodation", { rooms: value })}/><Field label="Accommodation notes" value={event.plan.accommodation.notes} onChange={(value) => updatePlan("accommodation", { notes: value })}/></div></Section>
        <Section eyebrow="Handover" title="Requirements & internal notes" icon={MessageSquareText}><div className="grid gap-4 md:grid-cols-2"><TextArea label="Customer requirements" value={event.plan.customerRequirements} onChange={(value) => updatePlanText("customerRequirements", value)}/><TextArea label="Internal operational notes" value={event.plan.internalNotes} onChange={(value) => updatePlanText("internalNotes", value)}/></div><button disabled={busy || !dirty} onClick={() => persist()} className="mt-5 flex items-center gap-2 rounded-xl bg-backstage-ink px-5 py-3 text-xs font-semibold text-white disabled:opacity-40"><Save size={15}/>{busy ? "Saving…" : "Save function plan"}</button></Section>
      </div>}

      {tab === "tasks" && <div className="print:hidden grid gap-6 xl:grid-cols-[1fr_380px]"><Section eyebrow="Planning checklist" title={`${openTasks.length} outstanding actions`} icon={CheckCircle2}><div className="space-y-2">{event.tasks.map((task) => <button key={task.id} onClick={() => toggleTask(task.id)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left ${task.completed ? "border-[#B8D1BE] bg-[#E7F1E9]/60" : "border-backstage-line bg-white"}`}><span className={`mt-0.5 grid h-5 w-5 place-items-center rounded-md border ${task.completed ? "border-[#3F6848] bg-[#3F6848] text-white" : "border-black/20"}`}>{task.completed && <Check size={12}/>}</span><div className="flex-1"><div className={`text-sm font-semibold ${task.completed ? "text-black/40 line-through" : ""}`}>{task.title}</div><div className="mt-1 text-xs text-black/35">{task.category}{task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}{task.assignedTo ? ` · ${task.assignedTo}` : ""}</div></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${task.priority === "High" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{task.priority}</span></button>)}</div></Section><Section eyebrow="New action" title="Add checklist item" icon={Plus}><form onSubmit={addTask} className="space-y-4"><Field label="Task" value={newTask.title} onChange={(value) => setNewTask((current) => ({ ...current, title: value }))}/><Field label="Due date" type="date" value={newTask.dueDate} onChange={(value) => setNewTask((current) => ({ ...current, dueDate: value }))}/><SelectField label="Category" value={newTask.category} options={["Planning", "Food & Drink", "Room Setup", "AV & Equipment", "Entertainment", "Payments", "Operations"]} onChange={(value) => setNewTask((current) => ({ ...current, category: value as EventTask["category"] }))}/><button className="flex w-full items-center justify-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><Plus size={15}/>Add task</button></form></Section></div>}

      {tab === "running" && <div className="print:hidden grid gap-6 xl:grid-cols-[1fr_380px]"><Section eyebrow="Event day" title="Minute-by-minute running order" icon={Clock3}><div className="space-y-2">{event.runningOrder.map((item) => <div key={item.id} className={`grid grid-cols-[72px_28px_1fr_34px] items-center gap-3 rounded-2xl border p-4 ${item.completed ? "border-[#B8D1BE] bg-[#E7F1E9]/60" : "border-backstage-line bg-white"}`}><div className="text-sm font-semibold">{item.time}</div><button onClick={() => { const next = { ...event, runningOrder: event.runningOrder.map((entry) => entry.id === item.id ? { ...entry, completed: !entry.completed } : entry) }; void persist(next, "Running order updated"); }} className={`grid h-5 w-5 place-items-center rounded-md border ${item.completed ? "border-[#3F6848] bg-[#3F6848] text-white" : "border-black/20"}`}>{item.completed && <Check size={12}/>}</button><div><div className={`text-sm font-semibold ${item.completed ? "line-through text-black/40" : ""}`}>{item.title}</div>{item.detail && <div className="mt-1 text-xs text-black/35">{item.detail}</div>}</div><button onClick={() => { const next = { ...event, runningOrder: event.runningOrder.filter((entry) => entry.id !== item.id) }; void persist(next, "Running order item removed"); }} className="text-black/25 hover:text-red-600"><Trash2 size={15}/></button></div>)}{!event.runningOrder.length && <div className="rounded-2xl border border-dashed border-backstage-line p-10 text-center text-sm text-black/30">No running-order items yet.</div>}</div></Section><Section eyebrow="New moment" title="Add to running order" icon={Plus}><form onSubmit={addRunningItem} className="space-y-4"><Field label="Time" type="time" value={newOrder.time} onChange={(value) => setNewOrder((current) => ({ ...current, time: value }))}/><Field label="What happens?" value={newOrder.title} onChange={(value) => setNewOrder((current) => ({ ...current, title: value }))}/><button className="flex w-full items-center justify-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><Plus size={15}/>Add moment</button></form></Section></div>}

      {tab === "finance" && <div className="print:hidden space-y-6"><section className="grid gap-4 md:grid-cols-3">{[["Agreed value", money.format(event.quotedValue), PoundSterling], ["Paid", money.format(event.paidValue), CheckCircle2], ["Outstanding", money.format(outstanding), AlertTriangle]].map(([label, value, Icon]) => <div key={String(label)} className="backstage-panel rounded-3xl p-5"><Icon size={18} className="text-backstage-gold"/><div className="mt-4 text-[10px] font-bold uppercase tracking-[.1em] text-black/35">{String(label)}</div><div className="backstage-display mt-2 text-3xl">{String(value)}</div></div>)}</section><Section eyebrow="Payment schedule" title="Deposits, invoices & balances" icon={CircleDollarSign}><div className="space-y-3">{event.payments.map((payment) => <div key={payment.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-backstage-line bg-white p-4 sm:flex-row sm:items-center"><div><div className="text-sm font-semibold">{payment.label}</div><div className="mt-1 text-xs text-black/35">{payment.paidDate ? `Paid ${formatDate(payment.paidDate)}` : payment.dueDate ? `Due ${formatDate(payment.dueDate)}` : "No date"}</div></div><div className="flex items-center gap-3"><strong>{money.format(payment.amount)}</strong><span className={`rounded-full px-3 py-1 text-[10px] font-semibold capitalize ${payment.status === "paid" ? "bg-[#E7F1E9] text-[#3F6848]" : "bg-amber-50 text-amber-700"}`}>{payment.status}</span>{payment.status !== "paid" && <button onClick={() => markPaymentPaid(payment.id)} className="rounded-xl bg-backstage-ink px-3 py-2 text-[10px] font-semibold text-white">Mark paid</button>}</div></div>)}</div><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Agreed value (£)" type="number" value={event.quotedValue} onChange={(value) => update({ quotedValue: Number(value) })}/><Field label="Paid value (£)" type="number" value={event.paidValue} onChange={(value) => update({ paidValue: Number(value) })}/></div><button disabled={busy || !dirty} onClick={() => persist()} className="mt-4 flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white disabled:opacity-40"><Save size={15}/>Save financial position</button></Section></div>}

      {tab === "outputs" && <div className="space-y-6"><div className="print:hidden grid gap-6 xl:grid-cols-[1fr_.85fr]"><Section eyebrow="Operational outputs" title="One record, multiple team packs" icon={FileText}><div className="grid gap-3 sm:grid-cols-2">{[["Function sheet", "Front-of-house master handover", event.functionSheetStatus, FileText], ["Kitchen sheet", "Food, timings and dietaries", event.foodOrderStatus, ChefHat], ["Running order", "Minute-by-minute delivery", event.runningOrder.length ? "ready" : "not started", Clock3], ["Customer confirmation", "Agreed customer-facing plan", "prepared", MessageSquareText]].map(([label, note, state, Icon]) => <div key={String(label)} className="rounded-2xl border border-backstage-line bg-white p-4"><Icon size={17} className="text-backstage-gold"/><div className="mt-3 text-sm font-semibold">{String(label)}</div><div className="mt-1 text-xs text-black/35">{String(note)}</div><div className="mt-4 flex items-center justify-between"><span className="rounded-full bg-backstage-cream px-2.5 py-1 text-[9px] font-semibold capitalize text-black/45">{String(state).replace("_", " ")}</span>{label === "Function sheet" && <button onClick={() => { update({ functionSheetStatus: "draft" }); window.setTimeout(() => window.print(), 50); }} className="text-[10px] font-semibold text-backstage-gold">Print preview</button>}</div></div>)}</div></Section><Section eyebrow="Integration runway" title="Prepared, not connected" icon={Cloud}><p className="text-xs leading-5 text-black/40">These connections are deliberately waiting until authentication and live venue onboarding are switched on.</p><div className="mt-5 space-y-3">{event.integrations.map((integration) => { const icons = { payments: CircleDollarSign, email: Mail, ai: Bot, documents: Cloud, portal: Users }; const Icon = icons[integration.key]; return <div key={integration.key} className="flex gap-3 rounded-2xl bg-backstage-cream p-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-backstage-gold"><Icon size={16}/></div><div><div className="flex items-center gap-2"><span className="text-sm font-semibold">{integration.label}</span><span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.08em] text-black/35">{integration.status}</span></div><p className="mt-1 text-xs leading-5 text-black/40">{integration.description}</p></div></div>})}</div></Section></div>
        <section className="bg-white p-8 text-black shadow-soft print:shadow-none" id="function-sheet"><div className="mx-auto max-w-5xl"><div className="flex items-start justify-between border-b-2 border-backstage-ink pb-5"><div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-backstage-gold">Backstage · Function Sheet</div><h2 className="backstage-display mt-2 text-4xl">{event.clientName}</h2><p className="mt-2 text-sm text-black/45">{event.eventType} · {event.bookingReference || "Provisional"}</p></div><div className="text-right"><div className="text-sm font-semibold">{formatDate(event.eventDate)}</div><div className="mt-1 text-xs text-black/40">{event.startTime || "TBC"}–{event.endTime || "TBC"}</div></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Guests", event.dayGuests ? `${event.dayGuests} day / ${event.eveningGuests} evening` : String(event.guestCount || "TBC")], ["Room", event.room || "TBC"], ["Coordinator", event.owner], ["Package", event.packageName || "Bespoke"]].map(([label, value]) => <div key={label} className="rounded-xl border border-backstage-line p-4"><div className="text-[9px] font-bold uppercase tracking-[.1em] text-black/30">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>)}</div><div className="mt-6 grid gap-5 md:grid-cols-2"><div className="space-y-4">{[["Room setup", `${event.plan.room.layout || "TBC"}${event.plan.room.tables ? ` · ${event.plan.room.tables}` : ""}`], ["Food & refreshments", [event.plan.food.refreshments, event.plan.food.catering, event.plan.food.serviceTime && `Service ${event.plan.food.serviceTime}`].filter(Boolean).join(" · ") || "TBC"], ["Dietary & allergens", event.plan.food.dietary || "Not confirmed"], ["Drinks / bar", event.plan.food.drinks || "Not confirmed"]].map(([label, value]) => <div key={label}><div className="text-[10px] font-bold uppercase tracking-[.1em] text-backstage-gold">{label}</div><p className="mt-1 text-sm leading-6">{value}</p></div>)}</div><div><div className="text-[10px] font-bold uppercase tracking-[.1em] text-backstage-gold">Running order</div><div className="mt-3 space-y-2">{event.runningOrder.map((item) => <div key={item.id} className="grid grid-cols-[55px_1fr] gap-3 border-b border-backstage-line pb-2 text-sm"><strong>{item.time}</strong><span>{item.title}</span></div>)}</div></div></div><div className="mt-6 grid gap-5 border-t border-backstage-line pt-5 md:grid-cols-2"><div><div className="text-[10px] font-bold uppercase tracking-[.1em] text-backstage-gold">Customer requirements</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{event.plan.customerRequirements || "None recorded."}</p></div><div><div className="text-[10px] font-bold uppercase tracking-[.1em] text-backstage-gold">Internal handover</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{event.plan.internalNotes || "None recorded."}</p></div></div></div></section>
      </div>}
    </div>
  );
}
