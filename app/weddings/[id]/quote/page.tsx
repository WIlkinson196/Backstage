import { getWeddingQuote } from "@/features/weddings/services/commercial-repository";
import { QuoteBuilder } from "@/features/weddings/components/quote-builder";

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getWeddingQuote(id);
  return <QuoteBuilder quote={quote}/>;
}
