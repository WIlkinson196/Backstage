import { CheckCircle2, Save } from "lucide-react";
import { convertEnquiryToEventAction, progressEnquiryAction } from "../actions";
import type { EnquiryStage } from "../types/enquiry";

const stages: Array<[EnquiryStage, string]> = [
  ["new", "New enquiry"], ["contacted", "Contacted"], ["viewing_booked", "Viewing booked"],
  ["viewing_completed", "Viewing completed"], ["proposal_sent", "Proposal sent"],
  ["provisional", "Provisional"], ["follow_up_later", "Follow up later"], ["lost", "Lost"]
];

export function ActionCentre({ enquiryId, currentStage, nextAction, nextActionDate }: { enquiryId: string; currentStage: EnquiryStage; nextAction: string; nextActionDate: string }) {
  const progressAction = progressEnquiryAction.bind(null, enquiryId);
  const convertAction = convertEnquiryToEventAction.bind(null, enquiryId);
  return (
    <div className="space-y-4">
      <form action={progressAction} className="space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/35">Pipeline stage
          <select name="stage" defaultValue={currentStage} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-3 py-3 text-sm normal-case tracking-normal text-black">
            {stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/35">Next action<input name="nextAction" defaultValue={nextAction} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-3 py-3 text-sm normal-case tracking-normal text-black"/></label>
        <label className="block text-[10px] font-bold uppercase tracking-[.1em] text-black/35">Due date<input type="date" name="nextActionDate" defaultValue={nextActionDate} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-3 py-3 text-sm normal-case tracking-normal text-black"/></label>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-backstage-line bg-white px-3 py-3 text-xs font-semibold hover:border-backstage-gold/40"><Save size={15} className="text-backstage-gold"/>Save progress</button>
      </form>
      {currentStage !== "confirmed" && (
        <form action={convertAction}>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-backstage-ink px-3 py-3 text-xs font-semibold text-white"><CheckCircle2 size={15} className="text-backstage-gold"/>Confirm and create event</button>
        </form>
      )}
    </div>
  );
}

