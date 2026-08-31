import type { EnquiryStage } from "../types/enquiry";
import { stageMeta } from "../lib/stages";

export function StagePill({ stage }: { stage: EnquiryStage }) {
  const meta = stageMeta[stage];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.09em] ${meta.className}`}>
      {meta.label}
    </span>
  );
}
