export type WeddingPrepInputs = {
  mealService:"Three-course meal"|"Two-course meal"|"One-course meal"|"Buffet / informal food";
  tableCount:number;
  topTableCount:number;
  chairCovers:boolean;
  sashDetail:string;
  centrepieces:"venue"|"couple"|"none";
  centrepieceDetail:string;
  welcomeDrink:"Prosecco"|"Champagne"|"Orange juice"|"None";
  toastDrink:"Prosecco"|"Champagne"|"Orange juice"|"None";
  welcomeDrinkGuests:number;
  toastDrinkGuests:number;
  wineAtTable:boolean;
  waterJugsPerTable:number;
  eveningFood:"BBQ"|"Hog Roast"|"Buffet"|"None";
  eveningFoodCovers:number;
  ceremonyOnsite:boolean;
  reservedCeremonySeats:number;
  venueDecor:string[];
};

export const prepInputsByWedding:Record<string,WeddingPrepInputs>={
  "wed-002":{
    mealService:"Three-course meal",
    tableCount:6,
    topTableCount:1,
    chairCovers:true,
    sashDetail:"Venue chair covers and sash",
    centrepieces:"venue",
    centrepieceDetail:"One venue centrepiece per guest table",
    welcomeDrink:"Prosecco",
    toastDrink:"Prosecco",
    welcomeDrinkGuests:60,
    toastDrinkGuests:60,
    wineAtTable:true,
    waterJugsPerTable:1,
    eveningFood:"BBQ",
    eveningFoodCovers:67,
    ceremonyOnsite:true,
    reservedCeremonySeats:8,
    venueDecor:["LOVE letters","Light curtain","Welcome sign","Cake table","Gift / card table"]
  }
};
