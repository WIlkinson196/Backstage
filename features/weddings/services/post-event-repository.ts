import { postEventRecordByWedding, postEventTasksByWedding, postEventTouchpointsByWedding } from "@/features/weddings/data/post-event-demo";

export async function getPostEventRecord(id: string) {
  return postEventRecordByWedding[id] ?? {
    weddingId: id,
    eventClosed: false,
    thankYouStatus: "not_sent" as const,
    reviewStatus: "not_requested" as const,
    testimonialPermission: "unknown" as const,
    mediaPermission: "unknown" as const,
    anniversaryStatus: "not_scheduled" as const
  };
}

export async function getPostEventTasks(id: string) {
  return postEventTasksByWedding[id] ?? [];
}

export async function getPostEventTouchpoints(id: string) {
  return postEventTouchpointsByWedding[id] ?? [];
}
