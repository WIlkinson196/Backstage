import type { WeddingOperationalModel, OperationalFact, OperationalIssue, OperationalFoodService } from "@/features/weddings/types/operational-model";
import { getWedding } from "@/features/weddings/services/repository";
import { getWeddingGuests } from "@/features/weddings/services/guest-repository";
function fingerprint(value:unknown){const raw=JSON.stringify(value);let hash=0;for(let i=0;i<raw.length;i++)hash=((hash<<5)-hash+raw.charCodeAt(i))|0;return Math.abs(hash).toString(36);}
export async function buildWeddingOperationalModel(weddingId:string):Promise<WeddingOperationalModel|null>{
 const wedding=await getWedding(weddingId); if(!wedding)return null; const guests=await getWeddingGuests(weddingId);
 const w=wedding as any;
 const ceremony=Number(w.ceremonyGuests??w.dayGuests??guests.filter((g:any)=>g.attendance_scope!=="evening").length);
 const day=Number(w.dayGuests??guests.filter((g:any)=>g.attendance_scope!=="evening").length);
 const evening=Number(w.eveningGuests??guests.length);
 const children=guests.filter((g:any)=>["child","children"].includes(String(g.age_group||"").toLowerCase())).length;
 const babies=guests.filter((g:any)=>["baby","infant"].includes(String(g.age_group||"").toLowerCase())).length;
 const dietaryGuests=guests.filter((g:any)=>String(g.dietary_requirements??g.dietaryRequirements??"").trim()).length;
 const accessibilityGuests=guests.filter((g:any)=>String(g.accessibility_requirements??g.accessibilityRequirements??"").trim()).length;
 const facts:OperationalFact[]=[
  {key:"couple",label:"Couple",value:w.couple??w.coupleNames??"Wedding",confidence:"confirmed",source:"Wedding record",audiences:["customer","foh","kitchen","management","supplier"]},
  {key:"event_date",label:"Wedding date",value:w.date??w.eventDate??"",confidence:(w.date??w.eventDate)?"confirmed":"missing",source:"Wedding record",audiences:["customer","foh","kitchen","management","supplier"]},
  {key:"day_guests",label:"Day guests",value:day,confidence:day>0?"confirmed":"missing",source:"Wedding + guest list",audiences:["customer","foh","kitchen","management"]},
  {key:"evening_guests",label:"Evening guests",value:evening,confidence:evening>0?"confirmed":"missing",source:"Wedding + guest list",audiences:["customer","foh","kitchen","management"]},
  {key:"dietary_guests",label:"Guests with dietary requirements",value:dietaryGuests,confidence:guests.length?"confirmed":"provisional",source:"Guest list",audiences:["foh","kitchen","management"]},
  {key:"accessibility_guests",label:"Guests with accessibility requirements",value:accessibilityGuests,confidence:guests.length?"confirmed":"provisional",source:"Guest list",audiences:["foh","management"]}
 ];
 const issues:OperationalIssue[]=[];
 if(!day)issues.push({id:"guest-day",level:"blocker",area:"Guests",message:"Final day guest count is missing.",source:"Wedding record"});
 if(!(w.date??w.eventDate))issues.push({id:"date",level:"blocker",area:"Profile",message:"Wedding date is missing.",source:"Wedding record"});
 if(!guests.length)issues.push({id:"guest-list",level:"warning",area:"Guests",message:"No structured guest list is available yet.",source:"Guest list"});
 if(guests.length&&dietaryGuests===0)issues.push({id:"dietary-check",level:"info",area:"Dietaries",message:"No dietary requirements are recorded; confirm this is intentional before kitchen issue.",source:"Guest list"});
 const foodServices:OperationalFoodService[]=[];
 const blockers=issues.filter(x=>x.level==="blocker").length,warnings=issues.filter(x=>x.level==="warning").length,score=Math.max(0,100-blockers*30-warnings*10);
 const guestSummary={ceremony,day,evening,adults:Math.max(0,day-children-babies),children,babies,dietaryGuests,accessibilityGuests};
 return {weddingId,generatedAt:new Date().toISOString(),version:1,couple:String(w.couple??w.coupleNames??"Wedding"),eventDate:String(w.date??w.eventDate??""),status:String(w.status??"planning"),guestSummary,facts,foodServices,issues,readiness:{score,blockers,warnings,canIssueOperationalPack:blockers===0},fingerprints:{planning:fingerprint(wedding),guests:fingerprint(guests),timings:fingerprint({date:w.date??w.eventDate}),commercial:fingerprint({status:w.status,total:w.totalValue})}};
}
export function factsForAudience(model:WeddingOperationalModel,audience:"customer"|"foh"|"kitchen"|"management"|"supplier"){return model.facts.filter(f=>f.audiences.includes(audience));}