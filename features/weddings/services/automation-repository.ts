import { agentSummary, automationDrafts, automationRules, automationSignals } from "@/features/weddings/data/automation-demo";

export async function getWeddingAutomationSignals(weddingId: string) {
  return automationSignals.filter(item => item.weddingId === weddingId);
}
export async function getWeddingAutomationRules(weddingId: string) {
  return automationRules.filter(item => item.weddingId === weddingId);
}
export async function getWeddingAutomationDrafts(weddingId: string) {
  return automationDrafts.filter(item => item.weddingId === weddingId);
}
export async function getWeddingAgentSummary(weddingId: string) {
  return agentSummary.weddingId === weddingId ? agentSummary : { ...agentSummary, weddingId };
}
