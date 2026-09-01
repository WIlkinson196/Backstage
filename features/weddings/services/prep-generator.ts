import type { WeddingOperationalModel } from "@/features/weddings/types/operational-model";
import type { PrepDepartment, PrepRow, PrepWarning, WeddingPrepList } from "@/features/weddings/types/prep";
import type { WeddingPrepInputs } from "@/features/weddings/data/prep-demo";
import { getWeddingPrepInputs } from "@/features/weddings/services/prep-repository";

const fluteDrinks=["Prosecco","Champagne","Orange juice"];
const whole=(n:number)=>String(Math.max(0,Math.ceil(n)));

export async function buildWeddingPrepList(model:WeddingOperationalModel):Promise<WeddingPrepList>{
  const input=(await getWeddingPrepInputs(model.weddingId))??fallbackInputs(model);
  const rows:PrepRow[]=[]; const warnings:PrepWarning[]=[];
  let seq=0;
  const add=(department:PrepDepartment,item:string,quantity:string|number,notes:string,source:string,priority:PrepRow["priority"]="standard",calculated=true)=>
    rows.push({id:`prep-${++seq}`,department,item,quantity:String(quantity),notes,source,priority,calculated});

  const day=model.guestSummary.day, evening=model.guestSummary.evening;
  const ceremony=model.guestSummary.ceremony||day;
  const fullRoom=Math.max(day,evening);
  const tables=input.tableCount+input.topTableCount;

  // GENERAL / MANAGEMENT - expanded from the old prep sheet.
  add("General","Cake knife",1,"Polish and place ready for cake cut.","Standard wedding equipment");
  add("General","Cake table",1,"Position to agreed floor plan.","Wedding planning");
  add("General","Gift / card table",1,"Position and dress before guest arrival.","Wedding planning");
  add("General","Printed Function Sheet",2,"Duty Manager + coordinator copies.","Operational output", "important");
  add("General","Printed Running Order",2,"Coordinator + operational lead copies.","Operational output");
  add("General","Dietary / allergy service copy",1,"Must reflect the latest guest record before service.","Guest data","critical");
  add("General","Supplier contact sheet",1,"Keep with operational pack.","Supplier planning");

  // CEREMONY
  if(input.ceremonyOnsite){
    add("Ceremony","Ceremony chairs",ceremony,"Set and align before final room check.","Ceremony guest count");
    add("Ceremony","Registrar table",1,"Dress and position to ceremony plan.","Ceremony setup");
    add("Ceremony","Registrar chairs",2,"Confirm registrar requirement on the day.","Ceremony setup");
    add("Ceremony","Reserved seating signs",input.reservedCeremonySeats||"As required","Front rows / accessibility / family as planned.","Ceremony planning");
    add("Ceremony","Ceremony music test",1,"Test entrance, signing and exit tracks with playback device.","Ceremony planning","important");
    add("Ceremony","Water for registrar / couple",4,"Prepare discreetly before ceremony.","Venue standard");
  }

  // ROOM SETUP / DECOR
  add("Room Setup","Chairs required",fullRoom,"Higher of day and evening guest numbers.","Guest counts");
  if(input.chairCovers){
    add("Room Setup","Fit chair covers",fullRoom,input.sashDetail,"Package / booked decor");
    add("Room Setup","Fit chair sashes",fullRoom,input.sashDetail,"Package / booked decor");
  }
  if(input.tableCount>0){
    add("Room Setup","Guest tables",input.tableCount,"Set to final floor plan.","Seating plan");
    add("Room Setup","Table numbers",input.tableCount,"One per guest table.","Table count");
  }else warnings.push({id:"tables",level:"warning",message:"Guest table count is missing, so table numbers and centrepieces cannot be trusted."});
  if(input.topTableCount>0)add("Room Setup","Top table",input.topTableCount,"Dress to agreed style and seating plan.","Wedding planning");

  if(input.centrepieces!=="none"){
    add("Decor",input.centrepieces==="venue"?"Make / set centrepieces":"Set out couple / supplier centrepieces",
      input.tableCount||"Check table plan",input.centrepieceDetail,"Table count + decor planning","important");
  }
  for(const decor of input.venueDecor){
    if(/love/i.test(decor)) add("Decor","Prepare LOVE letters",1,"Position and test before final room check.","Booked decor");
    else if(/light curtain/i.test(decor)) add("Decor","Prepare LED light curtain",1,"Install, test and conceal cabling.","Booked decor");
    else if(/welcome/i.test(decor)) add("Decor","Prepare welcome sign / table plan",1,"Place at agreed guest arrival point.","Booked decor");
  }

  // RESTAURANT - same calculation principle as old CRM, with sensible operational additions.
  if(day>0){
    if(input.mealService==="Three-course meal"){
      add("Restaurant","Polish table knives",day*2,"Two knives per day guest.","Day guests + meal service");
      add("Restaurant","Polish table forks",day*2,"Two forks per day guest.","Day guests + meal service");
      add("Restaurant","Polish dessert spoons",day,"One per day guest.","Day guests + meal service");
      add("Restaurant","Starter plates",day,"Service quantity.","Day guests + meal service");
      add("Restaurant","Main-course plates",day,"Service quantity.","Day guests + meal service");
      add("Restaurant","Dessert plates / bowls",day,"Service quantity.","Day guests + meal service");
    }else if(input.mealService==="Two-course meal"){
      add("Restaurant","Polish table knives",day,"Adjust if both selected courses need separate cutlery.","Day guests + meal service");
      add("Restaurant","Polish table forks",day,"Adjust if both selected courses need separate cutlery.","Day guests + meal service");
      add("Restaurant","Polish dessert spoons",day,"Only if selected course requires.","Day guests + meal service");
      add("Restaurant","Main / selected-course plates",day*2,"Two course services.","Day guests + meal service");
    }else if(input.mealService==="One-course meal"){
      add("Restaurant","Polish table knives",day,"One per day guest.","Day guests + meal service");
      add("Restaurant","Polish table forks",day,"One per day guest.","Day guests + meal service");
      add("Restaurant","Main-course plates",day,"One per day guest.","Day guests + meal service");
    }else{
      add("Restaurant","Day buffet plates",day,"One per day guest.","Day guests + meal service");
      add("Restaurant","Day buffet forks",day,"One per day guest.","Day guests + meal service");
      add("Restaurant","Day buffet napkins",day,"One per day guest.","Day guests + meal service");
    }
    add("Restaurant","Fold wedding breakfast napkins",day,"Complete before table dress sign-off.","Day guests");
    add("Restaurant","Water glasses to polish",day,"One per day guest.","Day guests");
    if(input.wineAtTable)add("Restaurant","Wine glasses to polish",day,"One per day guest; adjust for dual glass setup if required.","Day guests + drinks plan");
    add("Restaurant","Water jugs",Math.max(1,tables*input.waterJugsPerTable),`${input.waterJugsPerTable} per table including top table.`,"Table count");
    add("Restaurant","Salt & pepper sets",tables,"One set per table unless venue standard differs.","Table count");
  }

  // BAR - explicitly counts welcome + toast flute services, a key old-CRM rule.
  const welcomeFlutes=fluteDrinks.includes(input.welcomeDrink)?input.welcomeDrinkGuests:0;
  const toastFlutes=fluteDrinks.includes(input.toastDrink)?input.toastDrinkGuests:0;
  if(input.welcomeDrink!=="None"){
    add("Bar",`${input.welcomeDrink} - welcome serves`,input.welcomeDrinkGuests,"Prepare before guest arrival.","Drinks plan");
    add("Bar","Welcome flutes to polish / prepare",welcomeFlutes,"Flute-served welcome drinks.","Drinks plan");
  }
  if(input.toastDrink!=="None"){
    add("Bar",`${input.toastDrink} - toast serves`,input.toastDrinkGuests,"Stage for speeches / toast.","Drinks plan");
    add("Bar","Toast flutes to polish / prepare",toastFlutes,"Flute-served toast drinks.","Drinks plan");
  }
  if(welcomeFlutes+toastFlutes>0)add("Bar","TOTAL flute services",welcomeFlutes+toastFlutes,`${welcomeFlutes} welcome + ${toastFlutes} toast. This is service count, not necessarily unique physical glasses if washed/reused.`,"Calculated drinks plan","important");
  add("Bar","Water station / jugs ready",Math.max(1,tables),"Coordinate with wedding breakfast setup.","Table count");
  add("Bar","Ice buckets / wine coolers",Math.max(1,Math.ceil(input.tableCount/2)),"Operational starting point; venue rule can be configured later.","Table count");

  // EVENING FOOD / KITCHEN - prep/equipment, not ingredient shopping yet.
  if(input.eveningFood!=="None" && input.eveningFoodCovers>0){
    add("Evening Food",`${input.eveningFood} service covers`,input.eveningFoodCovers,"Final service covers.","Evening food plan","important");
    add("Evening Food","Evening food plates",input.eveningFoodCovers,"One per cover.","Evening food covers");
    add("Evening Food","Evening food forks",input.eveningFoodCovers,"One per cover where required.","Evening food covers");
    add("Evening Food","Evening food napkins",input.eveningFoodCovers,"One per cover.","Evening food covers");
    add("Evening Food","Serving tongs / utensils",Math.max(2,Math.ceil(input.eveningFoodCovers/25)),"Minimum working quantity; menu-specific utensil rules can override.","Evening food covers");
  }
  add("Kitchen","Dietary matrix checked",1,`${model.guestSummary.dietaryGuests} guest(s) currently flagged with dietary requirements.`,"Guest data","critical");
  add("Kitchen","Accessibility / service notes checked",1,`${model.guestSummary.accessibilityGuests} guest(s) currently flagged.`,"Guest data","important");

  // HOUSEKEEPING / RECEPTION additions for a genuinely operational prep list.
  add("Housekeeping","Function toilets final check",1,"Clean, stocked and signed off before guest arrival.","Venue standard");
  add("Housekeeping","Entrance / public areas presentation check",1,"Glass, floors and arrival route presentation.","Venue standard");
  add("Reception","Wedding bedroom / accommodation handover checked",1,"Reception briefed on wedding rooms and key contacts.","Wedding operations");
  add("Reception","Supplier / guest arrival briefing",1,"Reception knows where to direct suppliers and wedding guests.","Wedding operations");

  if(model.guestSummary.dietaryGuests===0) warnings.push({id:"dietary-confirm",level:"warning",message:"No dietary guests are recorded. Confirm this is intentional before issuing Kitchen / service prep."});
  if(model.readiness.blockers>0) warnings.push({id:"readiness",level:"blocker",message:`Wedding currently has ${model.readiness.blockers} finalisation blocker(s). Prep can be generated, but should not be treated as the final controlled issue.`});

  return {
    weddingId:model.weddingId,couple:model.couple,eventDate:model.eventDate,packageName:model.packageName,
    version:model.version,generatedAt:new Date().toISOString(),rows,warnings,
    summary:{checklistItems:rows.length,departments:new Set(rows.map(r=>r.department)).size,dayGuests:day,eveningGuests:evening,ceremonyGuests:ceremony,tables},
    fingerprints:model.fingerprints
  };
}

function fallbackInputs(model:WeddingOperationalModel):WeddingPrepInputs{
  return {
    mealService:"Three-course meal",tableCount:0,topTableCount:1,chairCovers:false,sashDetail:"",
    centrepieces:"none",centrepieceDetail:"",welcomeDrink:"None",toastDrink:"None",
    welcomeDrinkGuests:model.guestSummary.day,toastDrinkGuests:model.guestSummary.day,wineAtTable:false,
    waterJugsPerTable:1,eveningFood:"None",eveningFoodCovers:model.guestSummary.evening,
    ceremonyOnsite:true,reservedCeremonySeats:0,venueDecor:[]
  };
}
