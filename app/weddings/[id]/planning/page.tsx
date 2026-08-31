import { getWeddingPlanning } from "@/features/weddings/services/commercial-repository";
import { PlanningSectionCard } from "@/features/weddings/components/planning-section-card";
import { PlanningIntelligence } from "@/features/weddings/components/planning-intelligence";
import { MeetingWorkflow } from "@/features/weddings/components/meeting-workflow";

export default async function PlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sections = await getWeddingPlanning(id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="backstage-panel rounded-3xl p-7">
          <div className="backstage-kicker">Wedding planning</div>
          <h2 className="backstage-display mt-2 text-4xl">One plan. Every downstream document.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/45">
            Planning data is structured once and reused by the customer portal, quote, running order, function sheet, kitchen outputs and live event view.
          </p>
        </section>
        <PlanningIntelligence sections={sections}/>
      </div>

      <MeetingWorkflow sections={sections}/>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(section => <PlanningSectionCard key={section.key} section={section}/>)}
      </div>
    </div>
  );
}
