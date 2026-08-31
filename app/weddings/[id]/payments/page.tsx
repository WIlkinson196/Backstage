import { notFound } from "next/navigation";
import { getWedding, getWeddingPayments } from "@/features/weddings/services/repository";
import { PaymentSummary } from "@/features/weddings/components/payment-summary";

export default async function PaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wedding = await getWedding(id);
  if (!wedding) notFound();
  const payments = await getWeddingPayments(id);
  return <PaymentSummary wedding={wedding} payments={payments}/>;
}
