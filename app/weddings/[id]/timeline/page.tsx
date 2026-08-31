import { getWeddingTimeline } from "@/features/weddings/services/repository";
import { WeddingTimeline } from "@/features/weddings/components/timeline";

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await getWeddingTimeline(id);
  return (
    <section className="backstage-panel rounded-3xl p-6">
      <div className="backstage-kicker">Event journey</div>
      <h2 className="backstage-display mt-2 text-4xl">Wedding timeline</h2>
      <div className="mt-7 max-w-3xl"><WeddingTimeline items={items}/></div>
    </section>
  );
}
