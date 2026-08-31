export type VenueSectionKey =
  | "profile"
  | "spaces"
  | "weddings"
  | "meetings"
  | "private-events"
  | "food-drink"
  | "accommodation"
  | "extras"
  | "policies"
  | "automation";

export type VenueProfileForm = {
  name: string;
  tradingName: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  heroImageUrl: string;
};

export type VenueSpace = {
  id: string;
  name: string;
  description: string;
  capacitySeated: number | null;
  capacityStanding: number | null;
  isActive: boolean;
};

export type VenueProduct = {
  id: string;
  category:
    | "wedding"
    | "meeting"
    | "private_event"
    | "christmas"
    | "food"
    | "drink"
    | "accommodation"
    | "extra";
  name: string;
  description: string;
  basePrice: number | null;
  priceType: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
};

export type VenuePolicy = {
  id: string;
  policyKey: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
};
