export type PostEventStatus = "not_started" | "in_progress" | "complete";

export type PostEventRecord = {
  weddingId: string;
  eventClosed: boolean;
  closeoutCompletedAt?: string;
  thankYouStatus: "not_sent" | "drafted" | "sent";
  thankYouSentAt?: string;
  reviewStatus: "not_requested" | "requested" | "received";
  reviewRequestedAt?: string;
  reviewReceivedAt?: string;
  reviewRating?: number;
  reviewSource?: string;
  reviewExcerpt?: string;
  testimonialPermission: "unknown" | "requested" | "granted" | "declined";
  mediaPermission: "unknown" | "requested" | "granted" | "declined";
  anniversaryStatus: "not_scheduled" | "scheduled" | "sent";
  anniversarySendDate?: string;
  repeatOpportunity?: string;
  estimatedRepeatValue?: number;
};

export type PostEventTask = {
  id: string;
  weddingId: string;
  label: string;
  detail?: string;
  dueLabel: string;
  owner: string;
  completed: boolean;
  category: "closeout" | "review" | "testimonial" | "finance" | "marketing";
};

export type PostEventTouchpoint = {
  id: string;
  weddingId: string;
  label: string;
  dateLabel: string;
  channel: "email" | "call" | "internal" | "campaign";
  status: "done" | "scheduled" | "recommended";
  detail: string;
};
