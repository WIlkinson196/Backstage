import type { WeddingTimelineItem } from "../types/wedding";

export function WeddingTimeline({ items }: { items: WeddingTimelineItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-[70px_24px_1fr] gap-3">
          <div className="pt-1 text-right text-sm font-semibold">{item.time}</div>
          <div className="flex flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full border-2 border-backstage-gold bg-[#FFFCF8]"/>
            {index !== items.length - 1 && <div className="min-h-14 w-px flex-1 bg-backstage-line"/>}
          </div>
          <div className="pb-5">
            <div className="text-sm font-semibold">{item.title}</div>
            {item.detail && <div className="mt-1 text-xs text-black/40">{item.detail}</div>}
            <div className="mt-2 text-[9px] font-bold uppercase tracking-[.12em] text-backstage-gold">{item.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
