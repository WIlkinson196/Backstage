import type { OperationalAudience } from "@/features/weddings/types/operational-model";
export type WeddingOutputDefinition={key:string;name:string;audience:OperationalAudience;purpose:string;requiredDomains:string[];status:"foundation"|"next"|"later";};
export const weddingOutputRegistry:WeddingOutputDefinition[]=[
 {key:"function-sheet",name:"Function Sheet",audience:"management",purpose:"Master operational truth for the venue team.",requiredDomains:["profile","guests","timings","food","drinks","setup","suppliers"],status:"next"},
 {key:"master-pack",name:"Master Operational Pack",audience:"management",purpose:"Controlled combined wedding execution pack.",requiredDomains:["function-sheet","running-order","dietaries","setup"],status:"next"},
 {key:"kitchen-prep",name:"Kitchen Prep Sheet",audience:"kitchen",purpose:"Actual covers, menu allocations, dietaries, quantities and prep requirements.",requiredDomains:["guests","food","dietaries","timings"],status:"later"},
 {key:"running-order",name:"Running Order",audience:"foh",purpose:"Event-day timing and responsibility view.",requiredDomains:["timings","suppliers","service"],status:"later"},
 {key:"customer-summary",name:"Customer Wedding Summary",audience:"customer",purpose:"Customer-safe confirmed planning summary.",requiredDomains:["profile","planning","commercial"],status:"later"},
 {key:"supplier-handover",name:"Supplier Handover",audience:"supplier",purpose:"Only access, timing and contact information relevant to suppliers.",requiredDomains:["suppliers","timings","access"],status:"later"}
];