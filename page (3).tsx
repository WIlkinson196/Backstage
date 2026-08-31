import { getGuestReadiness, getWeddingGuests, getWeddingTables } from "@/features/weddings/services/guest-repository";
import { GuestReadinessCards } from "@/features/weddings/components/guest-readiness-cards";
import { SeatingBoard } from "@/features/weddings/components/seating-board";
import { PortalHandoffCard } from "@/features/weddings/components/portal-handoff-card";

export default async function SeatingPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [guests, tables, readiness] = await Promise.all([
    getWeddingGuests(id),
    getWeddingTables(id),
    getGuestReadiness(id)
  ]);

  return (
    <div className="space-y-6">
      <GuestReadinessCards readiness={readiness}/>
      <SeatingBoard tables={tables} guests={guests} weddingId={id}/>
      <PortalHandoffCard/>
    </div>
  );
}
