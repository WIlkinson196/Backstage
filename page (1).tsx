import { getWeddingDietarySummary, getWeddingGuests } from "@/features/weddings/services/guest-repository";
import { DietaryMatrix } from "@/features/weddings/components/dietary-matrix";

export default async function DietariesPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [guests, summary] = await Promise.all([getWeddingGuests(id), getWeddingDietarySummary(id)]);
  return <DietaryMatrix guests={guests} summary={summary}/>;
}
