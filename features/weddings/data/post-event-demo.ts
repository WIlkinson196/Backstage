import type { PostEventRecord, PostEventTask, PostEventTouchpoint } from "@/features/weddings/types/post-event";

export const postEventRecordByWedding: Record<string, PostEventRecord> = {
  "wed-001": {
    weddingId: "wed-001",
    eventClosed: true,
    closeoutCompletedAt: "24 Sep 2026 · 10:15",
    thankYouStatus: "sent",
    thankYouSentAt: "24 Sep 2026 · 11:05",
    reviewStatus: "received",
    reviewRequestedAt: "24 Sep 2026 · 11:05",
    reviewReceivedAt: "27 Sep 2026 · 18:42",
    reviewRating: 5,
    reviewSource: "Google",
    reviewExcerpt: "The team made the whole day feel effortless and nothing was too much trouble.",
    testimonialPermission: "granted",
    mediaPermission: "requested",
    anniversaryStatus: "scheduled",
    anniversarySendDate: "23 Sep 2027",
    repeatOpportunity: "First anniversary stay + private dining",
    estimatedRepeatValue: 220
  },
  "wed-002": {
    weddingId: "wed-002",
    eventClosed: false,
    thankYouStatus: "not_sent",
    reviewStatus: "not_requested",
    testimonialPermission: "unknown",
    mediaPermission: "unknown",
    anniversaryStatus: "not_scheduled"
  },
  "wed-003": {
    weddingId: "wed-003",
    eventClosed: true,
    closeoutCompletedAt: "18 Oct 2026 · 09:40",
    thankYouStatus: "drafted",
    reviewStatus: "not_requested",
    testimonialPermission: "unknown",
    mediaPermission: "granted",
    anniversaryStatus: "not_scheduled",
    repeatOpportunity: "Anniversary bedroom + dinner"
  }
};

export const postEventTasksByWedding: Record<string, PostEventTask[]> = {
  "wed-001": [
    { id:"pe-task-01", weddingId:"wed-001", label:"Complete event close-out", detail:"Confirm incidents, lost property and operational notes are closed.", dueLabel:"Done", owner:"Duty Manager", completed:true, category:"closeout" },
    { id:"pe-task-02", weddingId:"wed-001", label:"Send couple thank-you", detail:"Personal thank-you with review link and anniversary invitation.", dueLabel:"Done", owner:"Wedding Team", completed:true, category:"review" },
    { id:"pe-task-03", weddingId:"wed-001", label:"Request photo / video permission", detail:"Ask to use selected wedding content across venue marketing.", dueLabel:"Awaiting reply", owner:"Marketing", completed:false, category:"testimonial" },
    { id:"pe-task-04", weddingId:"wed-001", label:"Close final finance check", detail:"Confirm no credits, refunds or supplier charges remain open.", dueLabel:"Today", owner:"Finance", completed:false, category:"finance" },
    { id:"pe-task-05", weddingId:"wed-001", label:"Schedule first anniversary campaign", detail:"Offer a return stay and celebration experience one year on.", dueLabel:"Scheduled", owner:"Backstage", completed:true, category:"marketing" }
  ],
  "wed-002": [
    { id:"pe-task-06", weddingId:"wed-002", label:"Complete event close-out", dueLabel:"After wedding", owner:"Duty Manager", completed:false, category:"closeout" },
    { id:"pe-task-07", weddingId:"wed-002", label:"Send couple thank-you", dueLabel:"Day +1", owner:"Wedding Team", completed:false, category:"review" },
    { id:"pe-task-08", weddingId:"wed-002", label:"Request review", dueLabel:"Day +1", owner:"Backstage", completed:false, category:"review" },
    { id:"pe-task-09", weddingId:"wed-002", label:"Schedule anniversary follow-up", dueLabel:"Day +2", owner:"Backstage", completed:false, category:"marketing" }
  ],
  "wed-003": [
    { id:"pe-task-10", weddingId:"wed-003", label:"Complete event close-out", dueLabel:"Done", owner:"Duty Manager", completed:true, category:"closeout" },
    { id:"pe-task-11", weddingId:"wed-003", label:"Approve thank-you email", detail:"Draft prepared from event record.", dueLabel:"Today", owner:"Wedding Team", completed:false, category:"review" },
    { id:"pe-task-12", weddingId:"wed-003", label:"Schedule anniversary follow-up", dueLabel:"Tomorrow", owner:"Backstage", completed:false, category:"marketing" }
  ]
};

export const postEventTouchpointsByWedding: Record<string, PostEventTouchpoint[]> = {
  "wed-001": [
    { id:"touch-01", weddingId:"wed-001", label:"Thank-you + review request", dateLabel:"24 Sep · 11:05", channel:"email", status:"done", detail:"Sent to both members of the couple with personalised close-out message." },
    { id:"touch-02", weddingId:"wed-001", label:"5★ review received", dateLabel:"27 Sep · 18:42", channel:"internal", status:"done", detail:"Review attached to the wedding account and surfaced for marketing approval." },
    { id:"touch-03", weddingId:"wed-001", label:"Media permission follow-up", dateLabel:"30 Sep", channel:"email", status:"scheduled", detail:"Follow up only if image/video permission is still unanswered." },
    { id:"touch-04", weddingId:"wed-001", label:"First anniversary experience", dateLabel:"23 Sep 2027", channel:"campaign", status:"scheduled", detail:"Return stay + celebration offer using the couple's original wedding context." }
  ],
  "wed-002": [
    { id:"touch-05", weddingId:"wed-002", label:"Post-wedding thank-you", dateLabel:"Day +1", channel:"email", status:"recommended", detail:"Draft from the final event record and include review request." },
    { id:"touch-06", weddingId:"wed-002", label:"First anniversary experience", dateLabel:"1 year", channel:"campaign", status:"recommended", detail:"Schedule once the wedding is completed." }
  ],
  "wed-003": [
    { id:"touch-07", weddingId:"wed-003", label:"Thank-you awaiting approval", dateLabel:"Today", channel:"email", status:"recommended", detail:"Backstage has prepared the post-event message from the wedding record." },
    { id:"touch-08", weddingId:"wed-003", label:"Anniversary campaign", dateLabel:"17 Oct 2027", channel:"campaign", status:"recommended", detail:"Suggested return stay + dinner offer." }
  ]
};
