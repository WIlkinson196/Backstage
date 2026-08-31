"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChefHat,
  Circle,
  Clock3,
  FileText,
  LayoutGrid,
  MapPinned,
  MessageSquareText,
  Phone,
  Play,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Users,
  UtensilsCrossed
} from "lucide-react";
import type { WeddingRecord, WeddingPayment } from "@/features/weddings/types/wedding";
import type { WeddingGuest, DietarySummary } from "@/features/weddings/types/guests";
import type { WeddingDocument } from "@/features/weddings/types/operations";
import type { LiveChecklistItem, LiveContact, LiveNote, LiveTimelineItem, LiveTimelineState } from "@/features/weddings/types/live";

function stateClasses(state: LiveTimelineState) {
  if (state === "complete") return "bg-backstage-sage text-[#45634d]";
  if (state === "current") return "bg-backstage-ink text-white";
  if (state === "next") return "bg-backstage-blue text-[#435b78]";
  if (state === "late" || state === "attention") return "bg-backstage-blush text-[#81575b]";
  return "bg-backstage-cream text-black/45";
}

function contactClasses(status: LiveContact["status"]) {
  if (status === "onsite") return "bg-backstage-sage text-[#45634d]";
  if (status === "confirmed") return "bg-backstage-blue text-[#435b78]";
  if (status === "unknown") return "bg-backstage-blush text-[#81575b]";
  return "bg-backstage-cream text-black/45";
}

export function LiveCommandCentre({
  wedding,
  timeline: initialTimeline,
  checklist: initialChecklist,
  contacts,
  notes: initialNotes,
  guests,
  dietarySummary,
  payments,
  documents
}: {
  wedding: WeddingRecord;
  timeline: LiveTimelineItem[];
  checklist: LiveChecklistItem[];
  contacts: LiveContact[];
  notes: LiveNote[];
  guests: WeddingGuest[];
  dietarySummary: DietarySummary[];
  payments: WeddingPayment[];
  documents: WeddingDocument[];
}) {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [notes, setNotes] = useState(initialNotes);
  const [noteText, setNoteText] = useState("");
  const [noteKind, setNoteKind] = useState<LiveNote["kind"]>("note");
  const [aiAnswer, setAiAnswer] = useState("I’m reading the live wedding record. Ask what matters now, what is missing, or what changed.");

  const current = timeline.find((x) => x.state === "current") ?? timeline.find((x) => x.state !== "complete");
  const next = timeline.find((x) => x.state === "next") ?? timeline.find((x) => x.state === "upcoming");
  const completeChecks = checklist.filter((x) => x.completed).length;
  const criticalOutstanding = checklist.filter((x) => x.critical && !x.completed);
  const criticalDietaryGuests = guests.filter((x) => x.dietarySeverity === "critical");
  const outstandingBalance = payments.filter((p) => p.status !== "paid").reduce((sum, p) => sum + p.amount, 0);
  const staleDocs = documents.filter((d) => d.status === "stale" || d.changedSinceIssue);

  const progress = checklist.length ? Math.round((completeChecks / checklist.length) * 100) : 0;

  const intelligentAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (criticalOutstanding.length) alerts.push(`${criticalOutstanding.length} critical event-day check${criticalOutstanding.length === 1 ? "" : "s"} still open.`);
    if (criticalDietaryGuests.length) alerts.push(`${criticalDietaryGuests.length} guest${criticalDietaryGuests.length === 1 ? " has" : "s have"} a critical dietary flag.`);
    if (contacts.some((x) => x.status === "unknown")) alerts.push("At least one supplier is not fully confirmed in the live contact list.");
    if (staleDocs.length) alerts.push(`${staleDocs.length} issued document${staleDocs.length === 1 ? " is" : "s are"} stale and should be reissued.`);
    return alerts;
  }, [contacts, criticalDietaryGuests.length, criticalOutstanding.length, staleDocs.length]);

  function completeCurrent() {
    if (!current) return;
    const currentIndex = timeline.findIndex((x) => x.id === current.id);
    setTimeline((items) => items.map((item, index) => {
      if (index === currentIndex) return { ...item, state: "complete" };
      if (index === currentIndex + 1) return { ...item, state: "current" };
      if (index === currentIndex + 2 && item.state === "upcoming") return { ...item, state: "next" };
      return item.state === "next" && index !== currentIndex + 1 ? { ...item, state: "upcoming" } : item;
    }));
  }

  function toggleCheck(id: string) {
    setChecklist((items) => items.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  }

  function addNote() {
    const clean = noteText.trim();
    if (!clean) return;
    const now = new Date();
    const createdAt = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setNotes((items) => [{ id:`local-${Date.now()}`, weddingId:wedding.id, createdAt, author:"Venue Team", text:clean, kind:noteKind }, ...items]);
    setNoteText("");
  }

  function askBackstage(prompt: string) {
    if (prompt.includes("next")) {
      setAiAnswer(current ? `Right now: ${current.time} — ${current.title} in ${current.location}. ${next ? `Next is ${next.time} — ${next.title}.` : "There is no later milestone in the live order."}` : "There is no active running-order item.");
      return;
    }
    if (prompt.includes("dietary")) {
      setAiAnswer(criticalDietaryGuests.length ? `${criticalDietaryGuests.length} critical dietary flag${criticalDietaryGuests.length === 1 ? "" : "s"}: ${criticalDietaryGuests.map((g) => `${g.name} — ${g.dietaryRequirements || "check dietary record"}`).join("; ")}.` : "There are no guests marked with a critical dietary severity in the current guest record.");
      return;
    }
    if (prompt.includes("ceremony")) {
      const ceremonyOpen = checklist.filter((x) => x.category === "Ceremony" && !x.completed);
      setAiAnswer(ceremonyOpen.length ? `Ceremony is not fully ready. ${ceremonyOpen.map((x) => x.label).join("; ")}.` : "All ceremony checks in Live Mode are currently complete.");
      return;
    }
    if (prompt.includes("changed")) {
      const changes = notes.filter((n) => n.kind === "change");
      setAiAnswer(changes.length ? `Latest recorded change: ${changes[0].createdAt} — ${changes[0].text}` : "No event-day changes have been recorded yet.");
      return;
    }
    setAiAnswer(intelligentAlerts.length ? intelligentAlerts.join(" ") : "No critical operational alerts are currently being surfaced by Live Mode.");
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] bg-backstage-ink text-white shadow-soft">
        <div className="grid lg:grid-cols-[1.35fr_.65fr]">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-backstage-gold">Wedding Live Mode</span>
              <span className="rounded-full bg-[#2b6a49] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]">Event command centre</span>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
              <div>
                <div className="text-xs uppercase tracking-[.14em] text-white/45">Right now</div>
                <h2 className="backstage-display mt-2 text-4xl md:text-5xl">{current ? current.title : "Event handover"}</h2>
                {current && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60"><span className="flex items-center gap-2"><Clock3 size={15}/>{current.time}</span><span className="flex items-center gap-2"><MapPinned size={15}/>{current.location}</span><span>{current.owner}</span></div>}
                {current?.detail && <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{current.detail}</p>}
              </div>
              <button onClick={completeCurrent} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-backstage-gold px-5 text-sm font-bold text-backstage-ink transition hover:brightness-105"><CheckCircle2 size={17}/> Mark complete</button>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[.04] p-6 lg:border-l lg:border-t-0 md:p-8">
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold">Next milestone</div>
            <div className="mt-3 text-3xl font-semibold">{next?.time ?? "—"}</div>
            <div className="mt-1 text-sm font-semibold">{next?.title ?? "No next item"}</div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-backstage-gold" style={{width:`${progress}%`}}/></div>
            <div className="mt-2 flex justify-between text-xs text-white/45"><span>Event checks</span><span>{completeChecks}/{checklist.length} complete</span></div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[1fr_390px]">
        <main className="space-y-6">
          <section className="backstage-panel rounded-3xl p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><div className="backstage-kicker">Live running order</div><h3 className="backstage-display mt-2 text-3xl">Run the day from here</h3></div>
              <div className="text-xs text-black/40">Tap a milestone to advance the event</div>
            </div>
            <div className="mt-5 space-y-2">
              {timeline.map((item) => (
                <button key={item.id} onClick={() => setTimeline((items) => items.map((x) => x.id === item.id ? {...x, state:x.state === "complete" ? "current" : "complete"} : x))} className={`grid w-full gap-3 rounded-2xl border p-4 text-left transition md:grid-cols-[72px_120px_1fr_160px] md:items-center ${item.state === "current" ? "border-backstage-ink bg-backstage-ink text-white shadow-soft" : "border-backstage-line bg-white hover:border-backstage-gold/60"}`}>
                  <div className="text-sm font-bold">{item.time}</div>
                  <div><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${stateClasses(item.state)}`}>{item.state}</span></div>
                  <div><div className="text-sm font-semibold">{item.title}</div>{item.detail && <div className={`mt-1 text-xs leading-5 ${item.state === "current" ? "text-white/50" : "text-black/40"}`}>{item.detail}</div>}</div>
                  <div className={`text-xs ${item.state === "current" ? "text-white/55" : "text-black/40"}`}><div>{item.owner}</div><div className="mt-1">{item.location}</div></div>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="backstage-panel rounded-3xl p-5 md:p-6">
              <div className="flex items-center justify-between"><div><div className="backstage-kicker">Event checks</div><h3 className="backstage-display mt-2 text-3xl">Nothing gets missed</h3></div><div className="rounded-full bg-backstage-cream px-3 py-1 text-xs font-semibold">{progress}%</div></div>
              <div className="mt-5 space-y-2">
                {checklist.map((item) => (
                  <button key={item.id} onClick={() => toggleCheck(item.id)} className="flex w-full gap-3 rounded-2xl border border-backstage-line bg-white p-3 text-left hover:border-backstage-gold/60">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.completed ? "bg-[#4f755b] text-white" : item.critical ? "bg-backstage-blush text-[#81575b]" : "bg-backstage-cream text-black/35"}`}>{item.completed ? <Check size={14}/> : <Circle size={13}/>}</div>
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{item.label}</span>{item.critical && !item.completed && <span className="rounded-full bg-backstage-blush px-2 py-0.5 text-[9px] font-bold uppercase text-[#81575b]">critical</span>}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-black/30">{item.category}</div>{item.detail && <p className="mt-1 text-xs leading-5 text-black/40">{item.detail}</p>}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="backstage-panel rounded-3xl p-5 md:p-6">
              <div className="backstage-kicker">Key contacts</div><h3 className="backstage-display mt-2 text-3xl">Who is where</h3>
              <div className="mt-5 space-y-3">
                {contacts.map((contact) => <div key={contact.id} className="rounded-2xl border border-backstage-line bg-white p-4"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[.1em] text-black/35">{contact.role}</div><div className="mt-1 text-sm font-semibold">{contact.name}</div></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${contactClasses(contact.status)}`}>{contact.status}</span></div>{(contact.arrivalTime || contact.phone) && <div className="mt-3 flex flex-wrap gap-4 text-xs text-black/40">{contact.arrivalTime && <span className="flex items-center gap-1.5"><Clock3 size={13}/> {contact.arrivalTime}</span>}{contact.phone && <span className="flex items-center gap-1.5"><Phone size={13}/> {contact.phone}</span>}</div>}</div>)}
              </div>
            </div>
          </section>

          <section className="backstage-panel rounded-3xl p-5 md:p-6">
            <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
              <div>
                <div className="backstage-kicker">Event log</div><h3 className="backstage-display mt-2 text-3xl">Notes, changes & incidents</h3>
                <div className="mt-5 grid grid-cols-3 gap-2">{(["note","change","incident"] as const).map((kind) => <button key={kind} onClick={() => setNoteKind(kind)} className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize ${noteKind === kind ? "bg-backstage-ink text-white" : "bg-backstage-cream text-black/45"}`}>{kind}</button>)}</div>
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Record something the next manager needs to know…" className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-backstage-line bg-white p-3 text-sm outline-none focus:border-backstage-gold"/>
                <button onClick={addNote} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-2.5 text-xs font-bold text-white"><Plus size={14}/> Add to live log</button>
              </div>
              <div className="space-y-2">
                {notes.map((note) => <div key={note.id} className="rounded-2xl border border-backstage-line bg-white p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${note.kind === "incident" ? "bg-backstage-blush text-[#81575b]" : note.kind === "change" ? "bg-backstage-blue text-[#435b78]" : "bg-backstage-cream text-black/45"}`}>{note.kind}</span><span className="text-xs text-black/35">{note.author}</span></div><span className="text-xs font-semibold text-black/35">{note.createdAt}</span></div><p className="mt-2 text-sm leading-6 text-black/65">{note.text}</p></div>)}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-backstage-ink p-5 text-white shadow-soft md:p-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold"><Sparkles size={14}/> Backstage Intelligence</div>
            <h3 className="backstage-display mt-3 text-3xl">Ask the event.</h3>
            <p className="mt-2 text-sm leading-6 text-white/50">Live Mode reads the same wedding, guests, dietaries, payments and operational record.</p>
            {intelligentAlerts.length > 0 && <div className="mt-4 space-y-2">{intelligentAlerts.map((alert) => <div key={alert} className="flex gap-2 rounded-2xl border border-white/10 bg-white/[.05] p-3 text-xs leading-5 text-white/70"><AlertTriangle className="mt-0.5 shrink-0 text-backstage-gold" size={14}/>{alert}</div>)}</div>}
            <div className="mt-4 rounded-2xl bg-white/[.07] p-4 text-sm leading-6 text-white/75">{aiAnswer}</div>
            <div className="mt-4 grid gap-2">
              <button onClick={() => askBackstage("what is next")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>What happens next?</span><ArrowRight size={14}/></button>
              <button onClick={() => askBackstage("dietary")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>Show critical dietaries</span><UtensilsCrossed size={14}/></button>
              <button onClick={() => askBackstage("ceremony")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>Is ceremony ready?</span><Play size={14}/></button>
              <button onClick={() => askBackstage("changed")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>What changed today?</span><MessageSquareText size={14}/></button>
            </div>
          </section>

          <section className="backstage-panel rounded-3xl p-5">
            <div className="backstage-kicker">Live snapshot</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-backstage-cream p-3"><Users size={16} className="text-backstage-gold"/><div className="mt-3 text-2xl font-semibold">{wedding.dayGuests}</div><div className="text-xs text-black/40">day guests</div></div>
              <div className="rounded-2xl bg-backstage-cream p-3"><ChefHat size={16} className="text-backstage-gold"/><div className="mt-3 text-2xl font-semibold">{dietarySummary.reduce((sum, x) => sum + x.count, 0)}</div><div className="text-xs text-black/40">dietary flags</div></div>
              <div className="rounded-2xl bg-backstage-cream p-3"><ShieldAlert size={16} className="text-backstage-gold"/><div className="mt-3 text-2xl font-semibold">{criticalDietaryGuests.length}</div><div className="text-xs text-black/40">critical dietaries</div></div>
              <div className="rounded-2xl bg-backstage-cream p-3"><FileText size={16} className="text-backstage-gold"/><div className="mt-3 text-2xl font-semibold">£{outstandingBalance.toLocaleString("en-GB", {maximumFractionDigits:2})}</div><div className="text-xs text-black/40">scheduled balance</div></div>
            </div>
          </section>

          <section className="backstage-panel rounded-3xl p-5">
            <div className="backstage-kicker">Jump to source</div><h3 className="backstage-display mt-2 text-2xl">Operational record</h3>
            <div className="mt-4 grid gap-2">
              <Link href={`/weddings/${wedding.id}/function-sheet`} className="flex items-center justify-between rounded-xl border border-backstage-line bg-white px-3 py-3 text-xs font-semibold hover:border-backstage-gold"><span className="flex items-center gap-2"><FileText size={14}/> Function Sheet</span><ArrowRight size={14}/></Link>
              <Link href={`/weddings/${wedding.id}/seating`} className="flex items-center justify-between rounded-xl border border-backstage-line bg-white px-3 py-3 text-xs font-semibold hover:border-backstage-gold"><span className="flex items-center gap-2"><Users size={14}/> Seating & Guests</span><ArrowRight size={14}/></Link>
              <Link href={`/weddings/${wedding.id}/floor-plan`} className="flex items-center justify-between rounded-xl border border-backstage-line bg-white px-3 py-3 text-xs font-semibold hover:border-backstage-gold"><span className="flex items-center gap-2"><LayoutGrid size={14}/> Floor Plan</span><ArrowRight size={14}/></Link>
              <Link href={`/weddings/${wedding.id}/documents`} className="flex items-center justify-between rounded-xl border border-backstage-line bg-white px-3 py-3 text-xs font-semibold hover:border-backstage-gold"><span className="flex items-center gap-2"><FileText size={14}/> Documents</span><ArrowRight size={14}/></Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
