export type WeddingQuoteLine = {
  id: string;
  category: "Package" | "Food" | "Drinks" | "Accommodation" | "Décor" | "Entertainment" | "Hire" | "Other";
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  required?: boolean;
};

export type WeddingQuote = {
  weddingId: string;
  version: number;
  status: "draft" | "issued" | "accepted";
  expiresAt?: string;
  lines: WeddingQuoteLine[];
  discount: number;
  notes?: string;
};

export type PricingCatalogueItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  priceType: "fixed" | "per_person" | "per_table" | "per_room" | "from";
  active: boolean;
  source: "My Venue";
};

export type PlanningField = {
  key: string;
  label: string;
  value?: string;
  status: "complete" | "missing" | "review";
  customerVisible?: boolean;
};

export type PlanningSection = {
  key: string;
  title: string;
  description: string;
  owner: "Venue" | "Customer" | "Shared";
  progress: number;
  fields: PlanningField[];
};
