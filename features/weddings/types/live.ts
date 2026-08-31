export type LiveTimelineState = "complete" | "current" | "next" | "upcoming" | "late" | "attention";

export type LiveTimelineItem = {
  id: string;
  weddingId: string;
  time: string;
  title: string;
  owner: string;
  location: string;
  detail?: string;
  state: LiveTimelineState;
};

export type LiveChecklistItem = {
  id: string;
  weddingId: string;
  category: "Ceremony" | "Room" | "Food & Drink" | "Suppliers" | "Guest Care" | "Close Down";
  label: string;
  detail?: string;
  completed: boolean;
  critical?: boolean;
};

export type LiveContact = {
  id: string;
  weddingId: string;
  role: string;
  name: string;
  phone?: string;
  arrivalTime?: string;
  status: "onsite" | "due" | "confirmed" | "unknown";
};

export type LiveNote = {
  id: string;
  weddingId: string;
  createdAt: string;
  author: string;
  text: string;
  kind: "note" | "change" | "incident";
};
