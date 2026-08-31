export type EnquiryStage =
  | "new"
  | "contacted"
  | "viewing_booked"
  | "viewing_completed"
  | "proposal_sent"
  | "provisional"
  | "confirmed"
  | "lost"
  | "follow_up_later";

export type EnquiryPriority = "hot" | "warm" | "normal";

export type EnquiryRecord = {
  id: string;
  contactName: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate?: string;
  guestCount?: number;
  estimatedValue: number;
  stage: EnquiryStage;
  priority: EnquiryPriority;
  source: string;
  owner: string;
  aiScore: number;
  aiSummary: string;
  nextAction: string;
  nextActionDate: string;
  createdAt: string;
  proposalSentAt?: string;
  viewingDate?: string;
  provisionalExpiry?: string;
  lostReason?: string;
  rawMessage?: string;
};

export type EnquiryActivity = {
  id: string;
  enquiryId: string;
  type:
    | "created"
    | "call_connected"
    | "call_no_answer"
    | "email_sent"
    | "viewing_booked"
    | "viewing_completed"
    | "proposal_sent"
    | "follow_up"
    | "provisional"
    | "note";
  title: string;
  detail: string;
  createdAt: string;
  actor: string;
};
