import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";
import { getEnquiry, getEnquiryActivities } from "@/features/enquiries/services/repository";
import { StagePill } from "@/features/enquiries/components/stage-pill";
import { AiScore } from "@/features/enquiries/components/ai-score";
import { ActivityTimeline } from "@/features/enquiries/components/activity-timeline";
import { ActionCentre } from "@/features/enquiries/components/action-centre";
import { AiDraftCard } from "@/features/enquiries/components/ai-draft-card";
import { ArrowLeft, CalendarDays, Users, PoundSterling, Mail, Phone, Sparkles, Clock3 } from "lucide-react";

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await getEnquiry(id);
  if (!enquiry) notFound();
  const activities = await getEnquiryActivities(id);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <Link href="/enquiries" className="inline-flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-black">
          <ArrowLeft size={14}/> Back to enquiries
        </Link>

        <section className="backstage-wedding-photo relative overflow-hidden rounded-[32px] text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/90 via-[#0B141E]/58 to-transparent" />
          <div className="relative grid min-h-[350px] gap-6 p-7 md:p-9 xl:grid-cols-[1fr_340px]">
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StagePill stage={enquiry.stage}/>
                  <AiScore score={enquiry.aiScore}/>
                </div>
                <h1 className="backstage-display mt-5 text-5xl">{enquiry.contactName}</h1>
                <div className="mt-3 text-lg text-white/70">{enquiry.eventType}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="backstage-glass rounded-2xl p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-white/40"><CalendarDays size={13}/> Event date</div><div className="mt-2 text-sm font-semibold">{enquiry.eventDate ?? "Not set"}</div></div>
                <div className="backstage-glass rounded-2xl p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-white/40"><Users size={13}/> Guests</div><div className="mt-2 text-sm font-semibold">{enquiry.guestCount ?? "—"}</div></div>
                <div className="backstage-glass rounded-2xl p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-white/40"><PoundSterling size={13}/> Est. value</div><div className="mt-2 text-sm font-semibold">£{enquiry.estimatedValue.toLocaleString("en-GB")}</div></div>
              </div>
            </div>

            <div className="backstage-glass self-end rounded-2xl p-5">
              <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#E2C69D]">Next best action</div>
              <div className="mt-3 backstage-display text-2xl">{enquiry.nextAction}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/45"><Clock3 size={13}/> Due {enquiry.nextActionDate}</div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_370px]">
          <div className="space-y-6">
            <section className="backstage-panel rounded-[28px] p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-backstage-gold"><Sparkles size={15}/> AI qualification</div>
              <h2 className="backstage-display mt-3 text-3xl">Why Backstage thinks this matters</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">{enquiry.aiSummary}</p>
              {enquiry.rawMessage && (
                <div className="mt-5 rounded-2xl bg-backstage-cream p-5">
                  <div className="text-[10px] font-bold uppercase tracking-[.12em] text-black/35">Original enquiry</div>
                  <p className="mt-3 text-sm leading-7 text-black/50">{enquiry.rawMessage}</p>
                </div>
              )}
            </section>

            <AiDraftCard contactName={enquiry.contactName} eventType={enquiry.eventType}/>

            <section className="backstage-panel rounded-[28px] p-6">
              <div className="backstage-kicker">Relationship history</div>
              <h2 className="backstage-display mt-2 text-3xl">Activity</h2>
              <div className="mt-6"><ActivityTimeline activities={activities}/></div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="backstage-panel rounded-[28px] p-5">
              <div className="backstage-kicker">Customer</div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 text-sm"><Mail size={15} className="text-backstage-gold"/>{enquiry.email}</div>
                {enquiry.phone && <div className="flex items-center gap-3 text-sm"><Phone size={15} className="text-backstage-gold"/>{enquiry.phone}</div>}
              </div>
              <div className="mt-5 border-t border-backstage-line pt-5">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><div className="text-black/35">Source</div><div className="mt-1 font-semibold">{enquiry.source}</div></div>
                  <div><div className="text-black/35">Owner</div><div className="mt-1 font-semibold">{enquiry.owner}</div></div>
                </div>
              </div>
            </section>

            <section className="backstage-panel rounded-[28px] p-5">
              <div className="backstage-kicker">Sales activity</div>
              <h3 className="backstage-display mt-2 text-2xl">Progress enquiry</h3>
              <div className="mt-5"><ActionCentre enquiryId={enquiry.id} currentStage={enquiry.stage} nextAction={enquiry.nextAction} nextActionDate={enquiry.nextActionDate}/></div>
            </section>

            <section className="rounded-[28px] bg-backstage-ink p-5 text-white">
              <div className="text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold">Pipeline health</div>
              <div className="mt-3 backstage-display text-3xl">Strong</div>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Recent activity and a future action are recorded. Keep the next move dated.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
