export type OutputDocumentStatus = "draft" | "issuable" | "blocked" | "issued" | "stale";
export type FunctionSheetDocument = {
  key:"function-sheet"; title:string; subtitle:string; version:number; status:OutputDocumentStatus;
  generatedAt:string; weddingId:string; couple:string; eventDate:string; coordinator:string; packageName:string;
  guestNumbers:{ceremony:number;day:number;evening:number;children:number;dietary:number;accessibility:number};
  commercial:{quoted:number;paid:number;balance:number};
  sections:{key:string;title:string;status:"complete"|"attention";rows:{label:string;value:string}[]}[];
  runningOrder:{time:string;title:string;owner:string;location:string;notes?:string;status:string}[];
  readiness:{score:number;blockers:number;warnings:number};
  fingerprints:Record<string,string>;
};
export type MasterOperationalPack = {
  key:"master-pack"; title:string; version:number; status:OutputDocumentStatus; generatedAt:string;
  functionSheet:FunctionSheetDocument;
  checks:{label:string;detail:string;status:string}[];
  issueWarnings:string[];
};
