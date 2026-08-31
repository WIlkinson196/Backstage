import { notFound } from "next/navigation";
import { getWedding, getWeddingPayments } from "@/features/weddings/services/repository";
import { getWeddingDietarySummary, getWeddingGuests } from "@/features/weddings/services/guest-repository";
import { getWeddingDocuments } from "@/features/weddings/services/operations-repository";
import { getLiveChecklist, getLiveContacts, getLiveNotes, getLiveTimeline } from "@/features/weddings/services/live-repository";
import { LiveCommandCentre } from "@/features/weddings/components/live-command-centre";

export default async function LiveWeddingPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [wedding, timeline, checklist, contacts, notes, guests, dietarySummary, payments, documents] = await Promise.all([
    getWedding(id),
    getLiveTimeline(id),
    getLiveChecklist(id),
    getLiveContacts(id),
    getLiveNotes(id),
    getWeddingGuests(id),
    getWeddingDietarySummary(id),
    getWeddingPayments(id),
    getWeddingDocuments(id)
  ]);

  if (!wedding) notFound();

  return <LiveCommandCentre wedding={wedding} timeline={timeline} checklist={checklist} contacts={contacts} notes={notes} guests={guests} dietarySummary={dietarySummary} payments={payments} documents={documents}/>;
}
