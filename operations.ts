export type WeddingDocument = {
  id: string;
  weddingId: string;
  type: "customer_pack" | "function_sheet" | "running_order" | "kitchen_sheet" | "handover";
  title: string;
  version: number;
  status: "draft" | "ready" | "issued" | "stale";
  generatedAt?: string;
  issuedAt?: string;
  changedSinceIssue?: boolean;
};

export type RunningOrderItem = {
  id: string;
  time: string;
  title: string;
  owner: string;
  location: string;
  operationalNotes?: string;
  status: "planned" | "confirmed" | "attention";
};

export type FunctionSheetSection = {
  key: string;
  title: string;
  status: "complete" | "attention";
  rows: Array<{ label: string; value: string }>;
};

export type ReadinessCheck = {
  id: string;
  label: string;
  detail: string;
  status: "pass" | "warning" | "block";
};
