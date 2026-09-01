export type DataConfidence = "confirmed" | "provisional" | "missing";
export type OperationalAudience = "customer" | "foh" | "kitchen" | "management" | "supplier";

export type OperationalFact<T = string | number | boolean> = {
  key:string; label:string; value:T|null; confidence:DataConfidence; source:string; audiences:OperationalAudience[];
};
export type OperationalIssue = { id:string; level:"blocker"|"warning"|"info"; area:string; message:string; source:string; };
export type OperationalFoodService = {
  id:string; label:string; time:string|null; covers:number; menu:string;
  allocations:{label:string;covers:number}[]; dietaryNotes:string[]; confidence:DataConfidence;
};
export type OperationalGuestSummary = {
  ceremony:number; day:number; evening:number; adults:number; children:number; babies:number;
  dietaryGuests:number; accessibilityGuests:number;
};
export type OperationalRunningOrderItem = {
  id:string; time:string; title:string; owner:string; location:string; notes?:string;
  status:"planned"|"confirmed"|"attention";
};
export type OperationalSection = {
  key:string; title:string; status:"complete"|"attention";
  rows:{label:string;value:string}[];
};
export type OperationalReadinessCheck = {
  id:string; label:string; detail:string; status:"pass"|"warning"|"block";
};
export type WeddingOperationalModel = {
  weddingId:string; generatedAt:string; version:number; couple:string; eventDate:string; status:string;
  packageName:string; coordinator:string;
  commercial:{quoted:number;paid:number;balance:number};
  guestSummary:OperationalGuestSummary;
  facts:OperationalFact[];
  foodServices:OperationalFoodService[];
  runningOrder:OperationalRunningOrderItem[];
  functionSections:OperationalSection[];
  readinessChecks:OperationalReadinessCheck[];
  issues:OperationalIssue[];
  readiness:{score:number;blockers:number;warnings:number;canIssueOperationalPack:boolean};
  fingerprints:{planning:string;guests:string;timings:string;commercial:string;operations:string};
};
