import type { WeddingOperationalModel } from "@/features/weddings/types/operational-model";
import type { FunctionSheetDocument, MasterOperationalPack, OutputDocumentStatus } from "@/features/weddings/types/output-document";

function statusFor(model:WeddingOperationalModel):OutputDocumentStatus{
  if(model.readiness.blockers>0)return "blocked";
  return "issuable";
}
export function buildFunctionSheetDocument(model:WeddingOperationalModel):FunctionSheetDocument{
  return {
    key:"function-sheet",title:"Wedding Function Sheet",subtitle:"Controlled operational copy",
    version:model.version,status:statusFor(model),generatedAt:model.generatedAt,weddingId:model.weddingId,
    couple:model.couple,eventDate:model.eventDate,coordinator:model.coordinator,packageName:model.packageName,
    guestNumbers:{ceremony:model.guestSummary.ceremony,day:model.guestSummary.day,evening:model.guestSummary.evening,
      children:model.guestSummary.children,dietary:model.guestSummary.dietaryGuests,accessibility:model.guestSummary.accessibilityGuests},
    commercial:model.commercial,sections:model.functionSections,runningOrder:model.runningOrder,
    readiness:{score:model.readiness.score,blockers:model.readiness.blockers,warnings:model.readiness.warnings},
    fingerprints:model.fingerprints
  };
}
export function buildMasterOperationalPack(model:WeddingOperationalModel):MasterOperationalPack{
  const fs=buildFunctionSheetDocument(model);
  return {
    key:"master-pack",title:"Wedding Master Operational Pack",version:model.version,status:fs.status,generatedAt:model.generatedAt,
    functionSheet:fs,checks:model.readinessChecks,
    issueWarnings:model.issues.filter(x=>x.level!=="info").map(x=>`${x.area}: ${x.message}`)
  };
}
