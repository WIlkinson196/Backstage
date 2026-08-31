import Link from "next/link";
import { pipelineStages, stageMeta } from "../lib/stages";
import type { EnquiryRecord } from "../types/enquiry";
import { AiScore } from "./ai-score";

export function PipelineBoard({ enquiries }: { enquiries: EnquiryRecord[] }) {
  return (
    <div className="grid gap-4 overflow-x-auto xl:grid-cols-6">
      {pipelineStages.map((stage) => {
        const items = enquiries.filter((item) => item.stage === stage);
        const value = items.reduce((sum, item) => sum + item.estimatedValue, 0);
        return (
          <section key={stage} className="min-w-[260px] rounded-3xl border border-backstage-line bg-[#EEEAE4]/55 p-3 xl:min-w-0">
            <div className="px-2 pb-3 pt-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-[.12em] text-black/55">
                  {stageMeta[stage].label}
                </h3>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] text-black/40">{items.length}</span>
              </div>
              <div className="mt-1 text-[11px] text-black/35">
                {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value)}
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <Link key={item.id} href={`/enquiries/${item.id}`} className="block rounded-2xl border border-backstage-line bg-[#FFFCF8] p-4 shadow-[0_8px_25px_rgba(16,24,34,.035)] transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{item.contactName}</div>
                      <div className="mt-1 text-xs text-black/40">{item.eventType}</div>
                    </div>
                    <AiScore score={item.aiScore} />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[.1em] text-black/30">Value</div>
                      <div className="mt-1 text-sm font-semibold">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(item.estimatedValue)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[.1em] text-black/30">Next</div>
                      <div className="mt-1 max-w-[120px] text-xs text-black/45">{item.nextActionDate}</div>
                    </div>
                  </div>
                </Link>
              ))}
              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-backstage-line p-5 text-center text-xs text-black/30">
                  No enquiries
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
