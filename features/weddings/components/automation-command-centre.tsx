import { AlertTriangle, ArrowRight, Bot, CheckCircle2, Clock3, FilePenLine, Lightbulb, LockKeyhole, Mail, ShieldCheck, Sparkles, WandSparkles, Zap } from "lucide-react";
import type { AgentSummary, AutomationRule, DraftCommunication, WeddingAutomationSignal } from "@/features/weddings/types/automation";

const severityStyle = {
  critical: "border-[#C97868]/25 bg-[#C97868]/[.07]",
  attention: "border-[#D2A85D]/25 bg-[#D2A85D]/[.08]",
  opportunity: "border-[#7E9B82]/25 bg-[#7E9B82]/[.08]",
  healthy: "border-black/10 bg-white"
};
const severityIcon = { critical: AlertTriangle, attention: Clock3, opportunity: Lightbulb, healthy: CheckCircle2 };
const severityLabel = { critical: "Critical", attention: "Needs attention", opportunity: "Opportunity", healthy: "Healthy" };

export function AutomationCommandCentre({ summary, signals, rules, drafts }:{
  summary:AgentSummary; signals:WeddingAutomationSignal[]; rules:AutomationRule[]; drafts:DraftCommunication[];
}) {
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[32px] bg-backstage-ink text-white">
      <div className="grid xl:grid-cols-[1.2fr_.8fr]">
        <div className="p-7 lg:p-9">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-backstage-gold"><Bot size={16}/> Backstage Planning Agent</div>
          <h2 className="backstage-display mt-4 max-w-3xl text-4xl lg:text-5xl">Backstage has already worked out what needs attention next.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">It continuously reads planning progress, payments, guests, suppliers and operational readiness — then turns gaps into suggested actions.</p>
          <div className="mt-7 rounded-3xl border border-white/10 bg-white/[.05] p-5">
            <div className="text-xs font-bold uppercase tracking-[.16em] text-white/40">Next best action</div>
            <div className="mt-2 text-xl font-semibold">{summary.nextBestAction}</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{summary.nextBestReason}</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-backstage-ink">Review action <ArrowRight size={15}/></button>
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/[.035] p-7 lg:p-9 xl:border-l xl:border-t-0">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Readiness" value={`${summary.readinessScore}%`}/>
            <Metric label="Signals" value={String(summary.signals)}/>
            <Metric label="Critical" value={String(summary.critical)}/>
            <Metric label="Potential time saved" value={`${summary.hoursSavedEstimate}h`}/>
          </div>
          <div className="mt-5 rounded-3xl border border-[#D5B16E]/20 bg-[#D5B16E]/[.08] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#E4C98F]"><ShieldCheck size={17}/> Human approval stays in control</div>
            <p className="mt-2 text-xs leading-5 text-white/50">Backstage can detect, prioritise and draft. Customer-facing messages and commercial changes stay approval-gated.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <div className="backstage-panel rounded-3xl p-6 lg:p-7">
        <div className="backstage-kicker">Action queue</div>
        <h3 className="backstage-display mt-2 text-3xl">What Backstage has found</h3>
        <div className="mt-5 space-y-3">
          {signals.map(signal => {
            const Icon = severityIcon[signal.severity];
            return <article key={signal.id} className={`rounded-3xl border p-5 ${severityStyle[signal.severity]}`}>
              <div className="flex gap-4">
                <div className="mt-0.5 rounded-2xl bg-white p-2.5 shadow-sm"><Icon size={18}/></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[.14em] text-black/40">{severityLabel[signal.severity]}</span>
                    <span className="text-black/20">•</span><span className="text-xs text-black/40">{signal.source}</span>
                    {signal.dueLabel && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-black/45">{signal.dueLabel}</span>}
                  </div>
                  <h4 className="mt-2 text-base font-semibold">{signal.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-black/50">{signal.detail}</p>
                  <div className="mt-3 rounded-2xl border border-black/[.06] bg-white/70 p-3 text-xs leading-5 text-black/45"><strong className="text-black/65">Why it matters:</strong> {signal.reason}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-full bg-backstage-ink px-4 py-2 text-xs font-semibold text-white">{signal.actionLabel} <ArrowRight size={13}/></button>
                    <span className="text-xs text-black/35">Owner: {signal.owner}</span>
                    {signal.value && <span className="text-xs font-semibold text-[#6E8A73]">{signal.value}</span>}
                    {signal.requiresApproval && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-black/40"><LockKeyhole size={12}/> Approval required</span>}
                  </div>
                </div>
              </div>
            </article>
          })}
        </div>
      </div>

      <div className="space-y-6">
        <section className="backstage-panel rounded-3xl p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-black/40"><Sparkles size={15}/> Ask Backstage</div>
          <h3 className="backstage-display mt-2 text-3xl">Wedding intelligence</h3>
          <div className="mt-4 rounded-3xl border border-black/10 bg-white p-4">
            <div className="text-sm text-black/35">Ask about this wedding…</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["What is blocking finalisation?","What should I chase today?","Any upsell opportunities?","Is the wedding event-ready?"].map(q =>
                <button key={q} className="rounded-full border border-black/10 px-3 py-2 text-left text-xs font-medium text-black/60">{q}</button>
              )}
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-backstage-ink px-4 py-3 text-sm font-semibold text-white"><WandSparkles size={15}/> Ask Backstage</button>
          </div>
        </section>
        <section className="backstage-panel rounded-3xl p-6">
          <div className="backstage-kicker">Agent guardrails</div>
          <div className="mt-4 space-y-3">
            <Guardrail icon={ShieldCheck} title="No silent commercial changes" body="Accepted pricing and package terms remain fixed unless a user explicitly approves a revision."/>
            <Guardrail icon={Mail} title="Customer messages stay drafts" body="Backstage prepares the response; the venue team decides when it is sent."/>
            <Guardrail icon={FilePenLine} title="Audit every action" body="Suggestions, approvals and automated actions are designed to leave an auditable trail."/>
          </div>
        </section>
      </div>
    </section>

    <section className="grid gap-6 xl:grid-cols-2">
      <div className="backstage-panel rounded-3xl p-6 lg:p-7">
        <div className="flex items-center gap-2"><Zap size={17}/><div><div className="backstage-kicker">Automation rules</div><h3 className="backstage-display mt-1 text-3xl">What Backstage watches for</h3></div></div>
        <div className="mt-5 space-y-3">
          {rules.map(rule => <div key={rule.id} className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div><div className="font-semibold">{rule.name}</div><p className="mt-1 text-sm leading-6 text-black/45">{rule.description}</p></div>
              <span className="rounded-full bg-[#E8F0E8] px-3 py-1 text-[11px] font-bold uppercase tracking-[.1em] text-[#617A66]">Active</span>
            </div>
            <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
              <div className="rounded-2xl bg-black/[.025] p-3"><div className="font-bold uppercase tracking-[.12em] text-black/30">When</div><div className="mt-1 leading-5 text-black/55">{rule.trigger}</div></div>
              <div className="rounded-2xl bg-black/[.025] p-3"><div className="font-bold uppercase tracking-[.12em] text-black/30">Backstage does</div><div className="mt-1 leading-5 text-black/55">{rule.action}</div></div>
            </div>
          </div>)}
        </div>
      </div>

      <div className="backstage-panel rounded-3xl p-6 lg:p-7">
        <div className="flex items-center gap-2"><Mail size={17}/><div><div className="backstage-kicker">Prepared for approval</div><h3 className="backstage-display mt-1 text-3xl">Draft communications</h3></div></div>
        <div className="mt-5 space-y-4">
          {drafts.map(draft => <article key={draft.id} className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="text-xs font-bold uppercase tracking-[.12em] text-black/30">{draft.channel} draft</div><div className="mt-1 font-semibold">{draft.subject}</div><div className="mt-1 text-xs text-black/40">To: {draft.recipient}</div></div>
              <span className="rounded-full bg-[#F3EADB] px-3 py-1 text-[11px] font-semibold text-[#8A6D3C]">Needs approval</span>
            </div>
            <div className="mt-4 whitespace-pre-line rounded-2xl bg-black/[.025] p-4 text-sm leading-6 text-black/55">{draft.body}</div>
            <div className="mt-4 flex flex-wrap gap-2"><button className="rounded-full bg-backstage-ink px-4 py-2 text-xs font-semibold text-white">Approve draft</button><button className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-black/55">Edit first</button></div>
          </article>)}
        </div>
      </div>
    </section>
  </div>
}

function Metric({label,value}:{label:string;value:string}) {
  return <div className="rounded-3xl border border-white/10 bg-white/[.05] p-4"><div className="text-xs font-medium text-white/35">{label}</div><div className="backstage-display mt-1 text-3xl">{value}</div></div>
}
function Guardrail({icon:Icon,title,body}:{icon:any;title:string;body:string}) {
  return <div className="flex gap-3 rounded-2xl bg-black/[.025] p-3"><Icon size={16} className="mt-0.5 shrink-0 text-black/45"/><div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-black/40">{body}</div></div></div>
}
