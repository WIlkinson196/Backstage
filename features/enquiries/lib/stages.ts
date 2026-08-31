import type { EnquiryStage } from "../types/enquiry";

export const stageMeta: Record<EnquiryStage, { label: string; className: string }> = {
  new: { label: "New", className: "bg-[#F3E7D6] text-[#745A39]" },
  contacted: { label: "Contacted", className: "bg-backstage-blue text-[#40516A]" },
  viewing_booked: { label: "Viewing booked", className: "bg-[#E6E0F0] text-[#5A4C75]" },
  viewing_completed: { label: "Viewing completed", className: "bg-[#E4E8F2] text-[#48566F]" },
  proposal_sent: { label: "Proposal sent", className: "bg-backstage-blush text-[#7B5053]" },
  provisional: { label: "Provisional", className: "bg-[#F1E7CF] text-[#715B31]" },
  confirmed: { label: "Confirmed", className: "bg-backstage-sage text-[#44604B]" },
  lost: { label: "Lost", className: "bg-[#EEEAE5] text-[#6F6963]" },
  follow_up_later: { label: "Follow up later", className: "bg-[#E8EDF1] text-[#53606B]" }
};

export const pipelineStages: EnquiryStage[] = [
  "new",
  "contacted",
  "viewing_booked",
  "viewing_completed",
  "proposal_sent",
  "provisional"
];
