import { getWeddingMeetings } from "@/features/weddings/services/repository";
import { MeetingCards } from "@/features/weddings/components/meeting-cards";

export default async function PlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meetings = await getWeddingMeetings(id);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-backstage-ink p-7 text-white">
        <div className="backstage-kicker !text-backstage-gold">Guided planning</div>
        <h2 className="backstage-display mt-3 text-4xl">Ask the right questions at the right time.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">
          First meeting shapes the day. Halfway converts ideas into selections. Final meeting locks the operational detail.
        </p>
      </section>
      <MeetingCards meetings={meetings}/>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Profile & format","Ceremony","Reception & timings","Food & drinks","Suppliers","Décor","Music & entertainment","Bedrooms","Guest requirements"].map((x) => (
          <button key={x} className="backstage-panel rounded-2xl p-5 text-left">
            <div className="backstage-display text-xl">{x}</div>
            <div className="mt-2 text-sm text-black/40">Open planning section →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
