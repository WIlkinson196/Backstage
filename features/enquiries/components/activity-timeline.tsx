import type { EnquiryActivity } from "../types/enquiry";

export function ActivityTimeline({ activities }: { activities: EnquiryActivity[] }) {
  return (
    <div className="space-y-0">
      {activities.map((activity, index) => (
        <div key={activity.id} className="grid grid-cols-[22px_1fr] gap-3">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-backstage-gold" />
            {index !== activities.length - 1 && <div className="min-h-14 w-px flex-1 bg-backstage-line" />}
          </div>
          <div className="pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{activity.title}</div>
              <div className="text-[10px] text-black/35">{new Date(activity.createdAt).toLocaleString("en-GB")}</div>
            </div>
            <p className="mt-1 text-sm leading-6 text-black/45">{activity.detail}</p>
            <div className="mt-1 text-[10px] uppercase tracking-[.1em] text-backstage-gold">{activity.actor}</div>
          </div>
        </div>
      ))}
      {activities.length === 0 && <div className="text-sm text-black/35">No activity yet.</div>}
    </div>
  );
}
