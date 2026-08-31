import { Sparkles, Zap, Mail, Clock3, ShieldCheck } from "lucide-react";

const rules = [
  ["New enquiry triage", "Extract event details, score intent and prepare a reply.", "AI + Sales", Sparkles],
  ["No-response follow-up", "Prepare a follow-up when an enquiry has gone quiet.", "Sales automation", Clock3],
  ["Planning deadline watch", "Flag missing final details before an event becomes operationally risky.", "Operations", ShieldCheck],
  ["Proposal engagement", "Surface high-intent leads when proposal activity suggests a buying signal.", "Revenue", Zap],
  ["Customer communications", "Draft venue-approved messages using My Venue knowledge.", "Comms", Mail]
];

export default function AutomationPage() {
  return (
    <>
      <div>
        <div className="backstage-kicker">Backstage Intelligence</div>
        <h2 className="backstage-display mt-2 text-4xl">Automation Rules</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/45">
          Configure what Backstage may monitor, recommend, draft or eventually handle automatically.
          High-impact actions will still require deliberate approval until permissions are introduced.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {rules.map(([title, desc, tag, Icon]) => (
          <article key={title as string} className="backstage-panel rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#F2E9DC] p-3 text-backstage-gold">
                <Icon size={18} />
              </div>
              <div>
                <div className="backstage-display text-xl">{title as string}</div>
                <p className="mt-2 text-sm leading-6 text-black/45">{desc as string}</p>
                <div className="mt-4 text-[10px] font-semibold uppercase tracking-[.13em] text-backstage-gold">{tag as string}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
