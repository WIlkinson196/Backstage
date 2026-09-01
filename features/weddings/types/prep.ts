export type PrepDepartment =
  | "General" | "Ceremony" | "Room Setup" | "Decor" | "Restaurant"
  | "Bar" | "Evening Food" | "Kitchen" | "Housekeeping" | "Reception";

export type PrepRow = {
  id:string;
  department:PrepDepartment;
  item:string;
  quantity:string;
  notes?:string;
  source:string;
  priority:"standard"|"important"|"critical";
  calculated:boolean;
};

export type PrepWarning = {
  id:string;
  level:"warning"|"blocker";
  message:string;
};

export type WeddingPrepList = {
  weddingId:string;
  couple:string;
  eventDate:string;
  packageName:string;
  version:number;
  generatedAt:string;
  rows:PrepRow[];
  warnings:PrepWarning[];
  summary:{
    checklistItems:number;
    departments:number;
    dayGuests:number;
    eveningGuests:number;
    ceremonyGuests:number;
    tables:number;
  };
  fingerprints:Record<string,string>;
};
