import { getWedding, getWeddingMeetings, getWeddingPayments, getWeddingTasks, getWeddingTimeline } from "@/features/weddings/services/repository";
import { notFound } from "next/navigation";
import { MeetingCards } from "@/features/weddings/components/meeting-cards";
import { WeddingTaskList } from "@/features/weddings/components/task-list";
import { PaymentSummary } from "@/features/weddings/components/payment-summary";
import { WeddingTimeline } from "@/features/weddings/components/timeline";
import { AiPlanningPanel } from "@/features/weddings/components/ai-planning-panel";

export default async function WeddingOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wedding = await getWedding(id);
  if (!wedding) notFound();

  const [meetings, tasks, payments, timeline] = await Promise.all([
    getWeddingMeetings(id), getWeddingTasks(id), getWeddingPayments(id), getWeddingTimeline(id)
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="backstage-panel rounded-3xl p-6">
          <div className="backstage-kicker">Planning journey</div>
          <h2 className="backstage-display mt-2 text-3xl">Guided wedding meetings</h2>
          <p className="mt-2 text-sm leading-6 text-black/45">
            The first, halfway and final meetings deliberately reveal the right questions at the right point in the planning journey.
          </p>
          <div className="mt-6"><MeetingCards meetings={meetings}/></div>
        </section>
        <AiPlanningPanel/>
      </div>

      <section className="backstage-panel rounded-3xl p-6">
        <div className="flex items-end justify-between gap-4">
          <div><div className="backstage-kicker">Milestones</div><h2 className="backstage-display mt-2 text-3xl">Wedding tasks</h2></div>
          <div className="text-xs text-black/40">{tasks.filter(t => !t.completed).length} outstanding</div>
        </div>
        <div className="mt-4"><WeddingTaskList tasks={tasks.slice(0,7)}/></div>
      </section>

      <PaymentSummary wedding={wedding} payments={payments}/>

      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <section className="backstage-panel rounded-3xl p-6">
          <div className="backstage-kicker">Event day</div>
          <h2 className="backstage-display mt-2 text-3xl">Running timeline</h2>
          <div className="mt-6"><WeddingTimeline items={timeline}/></div>
        </section>

        <section className="backstage-panel rounded-3xl p-6">
          <div className="backstage-kicker">Recorded plan</div>
          <h2 className="backstage-display mt-2 text-3xl">Planning snapshot</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Ceremony", wedding.ceremonyType === "onsite" ? `On site · ${wedding.ceremonyTime ?? "TBC"}` : wedding.ceremonyType],
              ["Guest arrival", wedding.arrivalTime ?? "TBC"],
              ["Day guests", String(wedding.dayGuests)],
              ["Evening guests", String(wedding.eveningGuests)],
              ["Package", wedding.packageName],
              ["Coordinator", wedding.coordinator]
            ].map(([label,value]) => (
              <div key={label} className="rounded-2xl bg-backstage-cream p-4">
                <div className="text-[10px] font-bold uppercase tracking-[.12em] text-black/30">{label}</div>
                <div className="mt-2 text-sm font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
