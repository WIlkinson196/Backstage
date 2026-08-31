import { getWeddingCatalogue } from "@/features/weddings/services/commercial-repository";
import { PricingCatalogue } from "@/features/weddings/components/pricing-catalogue";

export default async function PricingPage() {
  const catalogue = await getWeddingCatalogue();
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-backstage-ink p-7 text-white">
        <div className="backstage-kicker !text-backstage-gold">Pricing engine</div>
        <h2 className="backstage-display mt-3 text-4xl">Venue pricing, without hard-coded wedding maths.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">
          The wedding workspace consumes the price book from My Venue, so packages, food, décor and extras have one source of truth.
        </p>
      </section>
      <PricingCatalogue items={catalogue}/>
    </div>
  );
}
