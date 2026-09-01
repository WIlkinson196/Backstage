import type { AgentSummary, AutomationRule, DraftCommunication, WeddingAutomationSignal } from "@/features/weddings/types/automation";

export const automationSignals: WeddingAutomationSignal[] = [
  { id:"sig-001", weddingId:"wed-002", severity:"critical", title:"Final planning is not yet complete", detail:"12 guided planning fields remain outstanding and the final meeting is approaching.", reason:"Incomplete final-planning data can block the function sheet, kitchen output and event-day pack.", owner:"Coordinator", dueLabel:"Action this week", actionLabel:"Review missing decisions", source:"Planning + Final Meeting", requiresApproval:false },
  { id:"sig-002", weddingId:"wed-002", severity:"attention", title:"DJ confirmation still missing", detail:"Supplier details have not been recorded for the evening entertainment.", reason:"The running order and supplier contact sheet cannot be considered final until the DJ details are confirmed.", owner:"Couple", dueLabel:"Suggested follow-up today", actionLabel:"Review follow-up draft", source:"Suppliers", requiresApproval:true },
  { id:"sig-003", weddingId:"wed-002", severity:"opportunity", title:"Accommodation upsell opportunity", detail:"The wedding has evening guests but no additional guest-room allocation recorded.", reason:"Similar weddings often convert additional rooms when the option is surfaced before final planning.", owner:"Coordinator", value:"Potential +£388", actionLabel:"Review opportunity", source:"Accommodation + Guest Count", requiresApproval:true },
  { id:"sig-004", weddingId:"wed-002", severity:"healthy", title:"Payment schedule is currently healthy", detail:"No overdue payment milestone is detected for this wedding.", reason:"The account is on plan and no finance intervention is currently required.", owner:"Backstage", actionLabel:"Open payments", source:"Payments", requiresApproval:false },
  { id:"sig-005", weddingId:"wed-002", severity:"attention", title:"Dietary information needs final confirmation", detail:"Guest dietary records exist but have not yet been marked as final for event-day production.", reason:"Final confirmation reduces discrepancies between guest records, kitchen output and the function sheet.", owner:"Coordinator", dueLabel:"Before pack issue", actionLabel:"Check dietary matrix", source:"Guests + Dietaries", requiresApproval:false }
];

export const automationRules: AutomationRule[] = [
  { id:"rule-001", weddingId:"wed-002", name:"Planning gap follow-up", description:"Surface missing customer decisions and prepare a follow-up draft before they become operational blockers.", trigger:"Required planning field is incomplete near its milestone", action:"Create an action and draft a customer follow-up", enabled:true, approvalMode:"customer_facing" },
  { id:"rule-002", weddingId:"wed-002", name:"Payment deadline watch", description:"Escalate payment milestones before they become overdue.", trigger:"Payment due date enters warning window", action:"Alert coordinator and prepare payment reminder", enabled:true, approvalMode:"customer_facing" },
  { id:"rule-003", weddingId:"wed-002", name:"Finalisation protection", description:"Protect issued operational documents when source planning data changes.", trigger:"Planning, guest, seating or timing data changes after pack issue", action:"Mark operational pack stale and request reissue", enabled:true, approvalMode:"never" },
  { id:"rule-004", weddingId:"wed-002", name:"Commercial opportunity scan", description:"Surface relevant upgrades without silently changing an accepted quote.", trigger:"Wedding profile matches a configured upsell opportunity", action:"Create a commercial suggestion for coordinator review", enabled:true, approvalMode:"always" }
];

export const automationDrafts: DraftCommunication[] = [
  { id:"draft-001", weddingId:"wed-002", subject:"A couple of final details for your wedding", channel:"email", recipient:"Lucy & Connor", reason:"DJ confirmation and final supplier details remain outstanding.", status:"draft", body:"Hi Lucy & Connor,\n\nWe’re getting everything beautifully lined up for your wedding and just have a couple of final details to confirm. Could you send over your DJ contact details and any remaining supplier information when you get a moment?\n\nOnce we have those, we can make sure the final running order and event-day paperwork are completely up to date.\n\nThanks,\nThe Granary team" }
];

export const agentSummary: AgentSummary = {
  weddingId:"wed-002", readinessScore:82, signals:5, critical:1, attention:2, opportunities:1, hoursSavedEstimate:3.5,
  nextBestAction:"Complete the final-planning gaps",
  nextBestReason:"This unlocks the cleanest path to finalising the operational pack and removes the largest current readiness risk."
};
