import { getGuestReadiness, getWeddingGuests } from "@/features/weddings/services/guest-repository";
import { GuestTable } from "@/features/weddings/components/guest-table";
import { GuestReadinessCards } from "@/features/weddings/components/guest-readiness-cards";

export default async function GuestsPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [guests, readiness] = await Promise.all([getWeddingGuests(id), getGuestReadiness(id)]);
  return (
    <div className="space-y-6">
      <GuestReadinessCards readiness={readiness}/>
      <GuestTable guests={guests}/>
    </div>
  );
}
