import type {
  WeddingOperationalModel, OperationalFact, OperationalIssue, OperationalFoodService
} from "@/features/weddings/types/operational-model";
import { getWedding, getWeddingPayments } from "@/features/weddings/services/repository";
import { getWeddingGuests } from "@/features/weddings/services/guest-repository";
import { getFunctionSheet, getRunningOrder, getWeddingReadiness } from "@/features/weddings/services/operations-repository";

function fingerprint(value:unknown){
  const raw=JSON.stringify(value); let hash=0;
  for(let i=0;i<raw.length;i++) hash=((hash<<5)-hash+raw.charCodeAt(i))|0;
  return Math.abs(hash).toString(36);
}

export async function buildWeddingOperationalModel(weddingId:string):Promise<WeddingOperationalModel|null>{
  const wedding=await getWedding(weddingId); if(!wedding)return null;
  const [guests,payments,running,functionSections,readinessChecks]=await Promise.all([
    getWeddingGuests(weddingId), getWeddingPayments(weddingId), getRunningOrder(weddingId),
    getFunctionSheet(weddingId), getWeddingReadiness(weddingId)
  ]);
  const w=wedding as any;
  const day=Number(w.dayGuests??guests.filter((g:any)=>g.attendance_scope!=="evening").length);
  const evening=Number(w.eveningGuests??guests.length);
  const ceremony=Number(w.ceremonyGuests??day);
  const children=guests.filter((g:any)=>["child","children"].includes(String(g.age_group||"").toLowerCase())).length;
  const babies=guests.filter((g:any)=>["baby","infant"].includes(String(g.age_group||"").toLowerCase())).length;
  const dietaryGuests=guests.filter((g:any)=>String(g.dietary_requirements??g.dietaryRequirements??"").trim()).length;
  const accessibilityGuests=guests.filter((g:any)=>String(g.accessibility_requirements??g.accessibilityRequirements??"").trim()).length;
  const quoted=Number(w.quotedValue??0),paid=Number(w.paidValue??payments.filter((x:any)=>x.status==="paid").reduce((s:number,x:any)=>s+Number(x.amount||0),0));
  const balance=Math.max(0,quoted-paid);

  const facts:OperationalFact[]=[
    {key:"couple",label:"Couple",value:w.couple??"Wedding",confidence:"confirmed",source:"Wedding record",audiences:["customer","foh","kitchen","management","supplier"]},
    {key:"event_date",label:"Wedding date",value:w.eventDate??"",confidence:w.eventDate?"confirmed":"missing",source:"Wedding record",audiences:["customer","foh","kitchen","management","supplier"]},
    {key:"package",label:"Package",value:w.packageName??"",confidence:w.packageName?"confirmed":"missing",source:"Wedding record",audiences:["customer","foh","management"]},
    {key:"coordinator",label:"Coordinator",value:w.coordinator??"",confidence:w.coordinator?"confirmed":"missing",source:"Wedding record",audiences:["foh","management","supplier"]},
    {key:"ceremony_time",label:"Ceremony time",value:w.ceremonyTime??"",confidence:w.ceremonyTime?"confirmed":"missing",source:"Wedding record",audiences:["customer","foh","management","supplier"]},
    {key:"guest_arrival",label:"Guest arrival",value:w.arrivalTime??"",confidence:w.arrivalTime?"confirmed":"provisional",source:"Wedding record",audiences:["customer","foh","management"]},
    {key:"day_guests",label:"Day guests",value:day,confidence:day>0?"confirmed":"missing",source:"Wedding + guest list",audiences:["customer","foh","kitchen","management"]},
    {key:"evening_guests",label:"Evening guests",value:evening,confidence:evening>0?"confirmed":"missing",source:"Wedding + guest list",audiences:["customer","foh","kitchen","management"]},
    {key:"dietary_guests",label:"Guests with dietary requirements",value:dietaryGuests,confidence:guests.length?"confirmed":"provisional",source:"Guest list",audiences:["foh","kitchen","management"]},
    {key:"accessibility_guests",label:"Guests with accessibility requirements",value:accessibilityGuests,confidence:guests.length?"confirmed":"provisional",source:"Guest list",audiences:["foh","management"]}
  ];

  const issues:OperationalIssue[]=[];
  readinessChecks.filter((x:any)=>x.status==="block").forEach((x:any)=>issues.push({id:`ready-${x.id}`,level:"blocker",area:"Readiness",message:x.detail,source:x.label}));
  readinessChecks.filter((x:any)=>x.status==="warning").forEach((x:any)=>issues.push({id:`ready-${x.id}`,level:"warning",area:"Readiness",message:x.detail,source:x.label}));
  if(!day)issues.push({id:"guest-day",level:"blocker",area:"Guests",message:"Final day guest count is missing.",source:"Wedding record"});
  if(!w.eventDate)issues.push({id:"date",level:"blocker",area:"Profile",message:"Wedding date is missing.",source:"Wedding record"});
  if(!guests.length)issues.push({id:"guest-list",level:"warning",area:"Guests",message:"No structured guest list is available yet.",source:"Guest list"});

  const blockers=issues.filter(x=>x.level==="blocker").length;
  const warnings=issues.filter(x=>x.level==="warning").length;
  const score=Math.max(0,100-blockers*25-warnings*8);

  return {
    weddingId,generatedAt:new Date().toISOString(),version:1,couple:String(w.couple??"Wedding"),
    eventDate:String(w.eventDate??""),status:String(w.status??"planning"),packageName:String(w.packageName??""),
    coordinator:String(w.coordinator??""),commercial:{quoted,paid,balance},
    guestSummary:{ceremony,day,evening,adults:Math.max(0,day-children-babies),children,babies,dietaryGuests,accessibilityGuests},
    facts,foodServices:[] as OperationalFoodService[],
    runningOrder:running.map((x:any)=>({id:x.id,time:x.time,title:x.title,owner:x.owner,location:x.location,notes:x.operationalNotes,status:x.status})),
    functionSections:functionSections.map((x:any)=>({key:x.key,title:x.title,status:x.status,rows:x.rows})),
    readinessChecks:readinessChecks.map((x:any)=>({id:x.id,label:x.label,detail:x.detail,status:x.status})),
    issues,readiness:{score,blockers,warnings,canIssueOperationalPack:blockers===0},
    fingerprints:{
      planning:fingerprint({wedding,functionSections}),
      guests:fingerprint(guests),
      timings:fingerprint(running),
      commercial:fingerprint({quoted,paid,balance,payments}),
      operations:fingerprint({functionSections,running,readinessChecks})
    }
  };
}
export function factsForAudience(model:WeddingOperationalModel,audience:"customer"|"foh"|"kitchen"|"management"|"supplier"){
  return model.facts.filter(f=>f.audiences.includes(audience));
}
