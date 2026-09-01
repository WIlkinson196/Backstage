export type DataConfidence = "confirmed" | "provisional" | "missing";
export type OperationalAudience = "customer" | "foh" | "kitchen" | "management" | "supplier";
export type OperationalFact<T = string | number | boolean> = { key:string; label:string; value:T|null; confidence:DataConfidence; source:string; audiences:OperationalAudience[]; };
export type OperationalIssue = { id:string; level:"blocker"|"warning"|"info"; area:string; message:string; source:string; };
export type OperationalFoodService = { id:string; label:string; time:string|null; covers:number; menu:string; allocations:{label:string;covers:number}[]; dietaryNotes:string[]; confidence:DataConfidence; };
export type OperationalGuestSummary = { ceremony:number; day:number; evening:number; adults:number; children:number; babies:number; dietaryGuests:number; accessibilityGuests:number; };
export type WeddingOperationalModel = {
 weddingId:string; generatedAt:string; version:number; couple:string; eventDate:string; status:string;
 guestSummary:OperationalGuestSummary; facts:OperationalFact[]; foodServices:OperationalFoodService[]; issues:OperationalIssue[];
 readiness:{score:number;blockers:number;warnings:number;canIssueOperationalPack:boolean};
 fingerprints:{planning:string;guests:string;timings:string;commercial:string};
};