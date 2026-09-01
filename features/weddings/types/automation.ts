export type AutomationSeverity = "critical" | "attention" | "opportunity" | "healthy";
export type AutomationOwner = "Backstage" | "Coordinator" | "Couple" | "Finance" | "Operations";

export type WeddingAutomationSignal = {
  id: string;
  weddingId: string;
  severity: AutomationSeverity;
  title: string;
  detail: string;
  reason: string;
  owner: AutomationOwner;
  dueLabel?: string;
  value?: string;
  actionLabel: string;
  source: string;
  requiresApproval: boolean;
};

export type AutomationRule = {
  id: string;
  weddingId: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  approvalMode: "always" | "customer_facing" | "never";
};

export type AgentSummary = {
  weddingId: string;
  readinessScore: number;
  signals: number;
  critical: number;
  attention: number;
  opportunities: number;
  hoursSavedEstimate: number;
  nextBestAction: string;
  nextBestReason: string;
};

export type DraftCommunication = {
  id: string;
  weddingId: string;
  subject: string;
  channel: "email" | "portal";
  recipient: string;
  body: string;
  reason: string;
  status: "draft" | "approved" | "sent";
};
