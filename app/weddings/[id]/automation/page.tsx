import { AutomationCommandCentre } from "@/features/weddings/components/automation-command-centre";
import { getWeddingAgentSummary, getWeddingAutomationDrafts, getWeddingAutomationRules, getWeddingAutomationSignals } from "@/features/weddings/services/automation-repository";

export default async function WeddingAutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [summary, signals, rules, drafts] = await Promise.all([
    getWeddingAgentSummary(id),
    getWeddingAutomationSignals(id),
    getWeddingAutomationRules(id),
    getWeddingAutomationDrafts(id)
  ]);
  return <AutomationCommandCentre summary={summary} signals={signals} rules={rules} drafts={drafts}/>;
}
