"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarHeart,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Gift,
  HeartHandshake,
  Image as ImageIcon,
  Mail,
  MessageSquareQuote,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  Trophy,
  UserRoundCheck,
  WalletCards
} from "lucide-react";
import type { WeddingRecord } from "@/features/weddings/types/wedding";
import type { PostEventRecord, PostEventTask, PostEventTouchpoint } from "@/features/weddings/types/post-event";

function statusPill(value: string) {
  if (["sent","received","granted","scheduled","done"].includes(value)) return "bg-backstage-sage text-[#45634d]";
  if (["drafted","requested","in_progress","recommended"].includes(value)) return "bg-backstage-blue text-[#435b78]";
  if (["declined"].includes(value)) return "bg-backstage-blush text-[#81575b]";
  return "bg-backstage-cream text-black/45";
}

function categoryIcon(category: PostEventTask["category"]) {
  if (category === "review") return Star;
  if (category === "testimonial") return MessageSquareQuote;
  if (category === "finance") return WalletCards;
  if (category === "marketing") return CalendarHeart;
  return CheckCircle2;
}

export function PostEventCommandCentre({
  wedding,
  initialRecord,
  initialTasks,
  touchpoints
}: {
  wedding: WeddingRecord;
  initialRecord: PostEventRecord;
  initialTasks: PostEventTask[];
  touchpoints: PostEventTouchpoint[];
}) {
  const [record, setRecord] = useState(initialRecord);
  const [tasks, setTasks] = useState(initialTasks);
  const [aiAnswer, setAiAnswer] = useState("I’m reading the wedding close-out record. I can surface the best next action, draft follow-up logic, and protect the relationship after the event.");

  const completedTasks = tasks.filter((x) => x.completed).length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const reviewComplete = record.reviewStatus === "received";
  const relationshipScore = useMemo(() => {
    let score = record.eventClosed ? 25 : 0;
    if (record.thankYouStatus === "sent") score += 20;
    if (reviewComplete) score += 20;
    if (record.testimonialPermission === "granted") score += 15;
    if (record.mediaPermission === "granted") score += 10;
    if (record.anniversaryStatus === "scheduled" || record.anniversaryStatus === "sent") score += 10;
    return score;
  }, [record, reviewComplete]);

  function toggleTask(id: string) {
    setTasks((items) => items.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  }

  function sendThankYou() {
    setRecord((r) => ({ ...r, thankYouStatus:"sent", thankYouSentAt:"Just now", reviewStatus:r.reviewStatus === "not_requested" ? "requested" : r.reviewStatus, reviewRequestedAt:r.reviewRequestedAt ?? "Just now" }));
    setAiAnswer(`Thank-you marked as sent. The review request is now active and Backstage will treat the next relationship step as ${record.testimonialPermission === "unknown" ? "testimonial permission" : "anniversary follow-up"}.`);
  }

  function scheduleAnniversary() {
    setRecord((r) => ({ ...r, anniversaryStatus:"scheduled", anniversarySendDate:r.anniversarySendDate ?? "1 year after wedding" }));
    setAiAnswer("The first-anniversary touchpoint is now scheduled against this wedding record. The offer can be personalised using the original wedding package, stay and celebration history.");
  }

  function askBackstage(question: "next" | "review" | "repeat" | "permission") {
    if (question === "next") {
      const open = tasks.find((x) => !x.completed);
      setAiAnswer(open ? `Best next action: ${open.label}. ${open.detail ?? "Complete this before moving the relationship forward."}` : "All post-event tasks are complete. Keep the anniversary campaign scheduled and watch for repeat-business signals.");
      return;
    }
    if (question === "review") {
      setAiAnswer(reviewComplete ? `${record.reviewRating ?? 5}★ ${record.reviewSource ?? "review"} received. Suggested next move: request permission to reuse the strongest quote in venue marketing.` : record.reviewStatus === "requested" ? "The review has been requested. Avoid sending another request immediately; the next useful action is to wait, then follow up once if needed." : "No review request has been sent yet. Pair it with a genuine thank-you rather than sending a standalone review demand.");
      return;
    }
    if (question === "repeat") {
      setAiAnswer(record.repeatOpportunity ? `Best repeat opportunity: ${record.repeatOpportunity}${record.estimatedRepeatValue ? `, currently worth about £${record.estimatedRepeatValue.toFixed(0)}.` : "."}` : "Create a one-year anniversary return offer first. Backstage can then branch into birthdays, christenings, private dining and future family celebrations based on engagement.");
      return;
    }
    setAiAnswer(record.mediaPermission === "granted" ? "Media permission is granted. The wedding can be surfaced to the marketing library with an audit trail back to this record." : "Media permission is not yet fully granted. Keep photos private until explicit permission is recorded.");
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] bg-backstage-ink text-white shadow-soft">
        <div className="grid lg:grid-cols-[1.35fr_.65fr]">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-backstage-gold">Post-event CRM</span>
              <span className="rounded-full bg-[#2b6a49] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]">Relationship continues</span>
            </div>
            <div className="mt-5 max-w-4xl">
              <div className="text-xs uppercase tracking-[.14em] text-white/45">After the wedding</div>
              <h2 className="backstage-display mt-2 text-4xl md:text-5xl">Turn a brilliant event into the next relationship.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Close the operation, thank the couple properly, capture advocacy, protect permissions and create a reason to come back — without moving their history into a separate marketing system.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {record.thankYouStatus !== "sent" && <button onClick={sendThankYou} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-backstage-gold px-4 text-xs font-bold text-backstage-ink"><Send size={15}/> Send thank-you + review request</button>}
              {record.anniversaryStatus === "not_scheduled" && <button onClick={scheduleAnniversary} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/[.05] px-4 text-xs font-bold text-white"><CalendarHeart size={15}/> Schedule anniversary</button>}
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[.04] p-6 lg:border-l lg:border-t-0 md:p-8">
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold">Relationship health</div>
            <div className="mt-3 text-5xl font-semibold">{relationshipScore}%</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-backstage-gold" style={{width:`${relationshipScore}%`}}/></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-white/[.06] p-3"><div className="text-white/40">Close-out</div><div className="mt-1 font-semibold">{record.eventClosed ? "Complete" : "Open"}</div></div>
              <div className="rounded-2xl bg-white/[.06] p-3"><div className="text-white/40">Tasks</div><div className="mt-1 font-semibold">{completedTasks}/{tasks.length}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          {label:"Event close-out", value:record.eventClosed ? "Complete" : "Open", icon:CheckCircle2, state:record.eventClosed ? "complete" : "open"},
          {label:"Thank-you", value:record.thankYouStatus.replaceAll("_"," "), icon:HeartHandshake, state:record.thankYouStatus},
          {label:"Review", value:record.reviewStatus.replaceAll("_"," "), icon:Star, state:record.reviewStatus},
          {label:"Media permission", value:record.mediaPermission, icon:ImageIcon, state:record.mediaPermission},
          {label:"Anniversary", value:record.anniversaryStatus.replaceAll("_"," "), icon:Gift, state:record.anniversaryStatus}
        ].map(({label,value,icon:Icon,state}) => <div key={label} className="backstage-panel rounded-3xl p-5"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-backstage-cream"><Icon size={16}/></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${statusPill(state)}`}>{value}</span></div><div className="mt-4 text-xs font-semibold text-black/45">{label}</div></div>)}
      </section>

      <div className="grid gap-6 2xl:grid-cols-[1fr_390px]">
        <main className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
            <div className="backstage-panel rounded-3xl p-5 md:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="backstage-kicker">Close-out workflow</div><h3 className="backstage-display mt-2 text-3xl">Finish the job properly</h3></div><span className="rounded-full bg-backstage-cream px-3 py-1 text-xs font-semibold">{progress}% complete</span></div>
              <div className="mt-5 space-y-2">
                {tasks.map((task) => {
                  const Icon = categoryIcon(task.category);
                  return <button key={task.id} onClick={() => toggleTask(task.id)} className="flex w-full gap-3 rounded-2xl border border-backstage-line bg-white p-4 text-left hover:border-backstage-gold/60"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${task.completed ? "bg-[#4f755b] text-white" : "bg-backstage-cream text-black/45"}`}>{task.completed ? <Check size={15}/> : <Icon size={15}/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{task.label}</span><span className="text-[10px] font-semibold text-black/35">{task.dueLabel}</span></div>{task.detail && <p className="mt-1 text-xs leading-5 text-black/40">{task.detail}</p>}<div className="mt-2 text-[9px] font-bold uppercase tracking-[.1em] text-black/30">{task.owner} · {task.category}</div></div></button>;
                })}
              </div>
            </div>

            <div className="backstage-panel rounded-3xl p-5 md:p-6">
              <div className="backstage-kicker">Review & advocacy</div><h3 className="backstage-display mt-2 text-3xl">Capture what they loved</h3>
              {reviewComplete ? <div className="mt-5 rounded-3xl bg-backstage-cream p-5"><div className="flex items-center gap-2 text-backstage-gold">{Array.from({length:record.reviewRating ?? 5}).map((_,i)=><Star key={i} size={17} fill="currentColor"/>)}</div><blockquote className="backstage-display mt-4 text-2xl leading-8 text-backstage-ink">“{record.reviewExcerpt}”</blockquote><div className="mt-4 flex items-center justify-between text-xs text-black/40"><span>{record.reviewSource ?? "Review"}</span><span>{record.reviewReceivedAt ?? "Received"}</span></div></div> : <div className="mt-5 rounded-3xl border border-dashed border-backstage-line bg-white p-6 text-center"><Star className="mx-auto text-backstage-gold" size={26}/><div className="mt-3 text-sm font-semibold">No review captured yet</div><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/40">Backstage keeps the request attached to the wedding so the team can follow up without losing context.</p></div>}
              <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-backstage-line bg-white p-4"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-black/30">Testimonial use</div><div className="mt-2 text-sm font-semibold capitalize">{record.testimonialPermission}</div></div><div className="rounded-2xl border border-backstage-line bg-white p-4"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-black/30">Photo / video use</div><div className="mt-2 text-sm font-semibold capitalize">{record.mediaPermission}</div></div></div>
            </div>
          </section>

          <section className="backstage-panel rounded-3xl p-5 md:p-6">
            <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
              <div><div className="backstage-kicker">Lifetime value</div><h3 className="backstage-display mt-2 text-3xl">The wedding is not the end.</h3><p className="mt-3 text-sm leading-6 text-black/45">Keep the original relationship warm for anniversaries, stays, private celebrations and future family events.</p>{record.repeatOpportunity && <div className="mt-5 rounded-2xl bg-backstage-sage p-4"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[#45634d]">Best current opportunity</div><div className="mt-2 text-sm font-semibold text-[#35513d]">{record.repeatOpportunity}</div>{record.estimatedRepeatValue && <div className="mt-2 text-xs text-[#45634d]">Estimated value £{record.estimatedRepeatValue.toFixed(0)}</div>}</div>}</div>
              <div className="space-y-3">{touchpoints.map((touch) => <div key={touch.id} className="rounded-2xl border border-backstage-line bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${statusPill(touch.status)}`}>{touch.status}</span><span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/30">{touch.channel}</span></div><div className="mt-2 text-sm font-semibold">{touch.label}</div></div><div className="flex items-center gap-1.5 text-xs text-black/35"><Clock3 size={13}/>{touch.dateLabel}</div></div><p className="mt-2 text-xs leading-5 text-black/40">{touch.detail}</p></div>)}</div>
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-backstage-ink p-5 text-white shadow-soft md:p-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold"><Sparkles size={14}/> Backstage Intelligence</div>
            <h3 className="backstage-display mt-3 text-3xl">Keep the relationship moving.</h3>
            <p className="mt-2 text-sm leading-6 text-white/50">Post-event intelligence reads the same wedding history rather than treating the couple like a brand-new lead.</p>
            <div className="mt-4 rounded-2xl bg-white/[.07] p-4 text-sm leading-6 text-white/75">{aiAnswer}</div>
            <div className="mt-4 grid gap-2">
              <button onClick={() => askBackstage("next")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>What should we do next?</span><ArrowRight size={14}/></button>
              <button onClick={() => askBackstage("review")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>What should we do with the review?</span><Star size={14}/></button>
              <button onClick={() => askBackstage("permission")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>Can marketing use their content?</span><UserRoundCheck size={14}/></button>
              <button onClick={() => askBackstage("repeat")} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/[.05]"><span>What can we sell next?</span><Trophy size={14}/></button>
            </div>
          </section>

          <section className="backstage-panel rounded-3xl p-5">
            <div className="backstage-kicker">Anniversary CRM</div><h3 className="backstage-display mt-2 text-2xl">Come back to where it started.</h3>
            <div className="mt-4 rounded-2xl bg-backstage-cream p-4"><CalendarHeart className="text-backstage-gold" size={21}/><div className="mt-3 text-sm font-semibold">{record.anniversaryStatus === "scheduled" ? "Campaign scheduled" : "No anniversary campaign yet"}</div><p className="mt-2 text-xs leading-5 text-black/40">{record.anniversarySendDate ? `Planned for ${record.anniversarySendDate}.` : "Create a personalised one-year touchpoint using the original wedding record."}</p></div>
            {record.anniversaryStatus !== "scheduled" && <button onClick={scheduleAnniversary} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-bold text-white"><RefreshCw size={14}/> Schedule anniversary</button>}
          </section>

          <section className="backstage-panel rounded-3xl p-5">
            <div className="backstage-kicker">Suggested thank-you</div>
            <div className="mt-3 rounded-2xl border border-backstage-line bg-white p-4 text-xs leading-6 text-black/55"><Mail className="mb-3 text-backstage-gold" size={18}/>Thank you for choosing us for such an important day. We hope you’re still on a high after the wedding. If you have a moment, we’d love to hear about your experience — and we’ll be in touch again when your first anniversary comes around.</div>
          </section>
        </aside>
      </div>
    </div>
  );
}
