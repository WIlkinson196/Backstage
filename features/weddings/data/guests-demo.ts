<<<<<<< HEAD
import type { DietarySummary, FloorPlanZone, WeddingGuest, WeddingTable } from "@/features/weddings/types/guests";
=======
import type { DietarySummary, FloorPlanZone, WeddingGuest, WeddingTable } from "../types/guests";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03

export const guestsByWedding: Record<string, WeddingGuest[]> = {
  "wed-002": [
    { id:"g-01", weddingId:"wed-002", name:"Lucy Miller", attendance:"both", rsvpStatus:"confirmed", tableId:"t-top", tableName:"Top Table", seatNumber:1, ageGroup:"adult", menuChoice:"Roast Beef", source:"Venue" },
    { id:"g-02", weddingId:"wed-002", name:"Connor James", attendance:"both", rsvpStatus:"confirmed", tableId:"t-top", tableName:"Top Table", seatNumber:2, ageGroup:"adult", menuChoice:"Roast Beef", source:"Venue" },
    { id:"g-03", weddingId:"wed-002", name:"Emily James", attendance:"both", rsvpStatus:"confirmed", tableId:"t-top", tableName:"Top Table", seatNumber:3, ageGroup:"adult", menuChoice:"Chicken", source:"Customer Portal" },
    { id:"g-04", weddingId:"wed-002", name:"Sarah Miller", attendance:"both", rsvpStatus:"confirmed", tableId:"t-top", tableName:"Top Table", seatNumber:4, ageGroup:"adult", menuChoice:"Vegetarian", dietaryRequirements:"Vegetarian", dietarySeverity:"info", source:"Customer Portal" },
    { id:"g-05", weddingId:"wed-002", name:"James Wilson", attendance:"both", rsvpStatus:"confirmed", tableId:"t-01", tableName:"Table 1", seatNumber:1, ageGroup:"adult", menuChoice:"Roast Beef", source:"Customer Portal" },
    { id:"g-06", weddingId:"wed-002", name:"Beth Wilson", attendance:"both", rsvpStatus:"confirmed", tableId:"t-01", tableName:"Table 1", seatNumber:2, ageGroup:"adult", menuChoice:"Chicken", dietaryRequirements:"Gluten free", dietarySeverity:"allergy", source:"Customer Portal" },
    { id:"g-07", weddingId:"wed-002", name:"Daniel Carter", attendance:"both", rsvpStatus:"confirmed", tableId:"t-01", tableName:"Table 1", seatNumber:3, ageGroup:"adult", menuChoice:"Roast Beef", source:"Customer Portal" },
    { id:"g-08", weddingId:"wed-002", name:"Sophie Carter", attendance:"both", rsvpStatus:"confirmed", tableId:"t-01", tableName:"Table 1", seatNumber:4, ageGroup:"adult", menuChoice:"Vegetarian", dietaryRequirements:"Nut allergy", dietarySeverity:"critical", source:"Customer Portal" },
    { id:"g-09", weddingId:"wed-002", name:"Oliver Carter", attendance:"day", rsvpStatus:"confirmed", tableId:"t-01", tableName:"Table 1", seatNumber:5, ageGroup:"child", menuChoice:"Children's meal", source:"Customer Portal" },
    { id:"g-10", weddingId:"wed-002", name:"Laura Green", attendance:"both", rsvpStatus:"confirmed", tableId:"t-02", tableName:"Table 2", seatNumber:1, ageGroup:"adult", menuChoice:"Chicken", source:"Customer Portal" },
    { id:"g-11", weddingId:"wed-002", name:"Michael Green", attendance:"both", rsvpStatus:"confirmed", tableId:"t-02", tableName:"Table 2", seatNumber:2, ageGroup:"adult", menuChoice:"Roast Beef", dietaryRequirements:"Dairy free", dietarySeverity:"allergy", source:"Customer Portal" },
    { id:"g-12", weddingId:"wed-002", name:"Ava Green", attendance:"day", rsvpStatus:"confirmed", tableId:"t-02", tableName:"Table 2", seatNumber:3, ageGroup:"child", menuChoice:"Children's meal", source:"Customer Portal" },
    { id:"g-13", weddingId:"wed-002", name:"Robert Hill", attendance:"both", rsvpStatus:"pending", ageGroup:"adult", source:"Customer Portal" },
    { id:"g-14", weddingId:"wed-002", name:"Helen Hill", attendance:"both", rsvpStatus:"pending", ageGroup:"adult", dietaryRequirements:"Coeliac", dietarySeverity:"critical", source:"Customer Portal" },
    { id:"g-15", weddingId:"wed-002", name:"Amy Shaw", attendance:"evening", rsvpStatus:"confirmed", ageGroup:"adult", source:"Customer Portal" }
  ]
};

export const tablesByWedding: Record<string, WeddingTable[]> = {
  "wed-002": [
    { id:"t-top", weddingId:"wed-002", name:"Top Table", shape:"top_table", capacity:8, assignedGuests:4, x:37, y:8, width:26, height:8, rotation:0 },
    { id:"t-01", weddingId:"wed-002", name:"Table 1", shape:"round", capacity:10, assignedGuests:5, x:18, y:31, width:13, height:13, rotation:0 },
    { id:"t-02", weddingId:"wed-002", name:"Table 2", shape:"round", capacity:10, assignedGuests:3, x:43, y:31, width:13, height:13, rotation:0 },
    { id:"t-03", weddingId:"wed-002", name:"Table 3", shape:"round", capacity:10, assignedGuests:0, x:68, y:31, width:13, height:13, rotation:0 },
    { id:"t-04", weddingId:"wed-002", name:"Table 4", shape:"round", capacity:10, assignedGuests:0, x:18, y:57, width:13, height:13, rotation:0 },
    { id:"t-05", weddingId:"wed-002", name:"Table 5", shape:"round", capacity:10, assignedGuests:0, x:43, y:57, width:13, height:13, rotation:0 },
    { id:"t-06", weddingId:"wed-002", name:"Table 6", shape:"round", capacity:10, assignedGuests:0, x:68, y:57, width:13, height:13, rotation:0 }
  ]
};

export const zonesByWedding: Record<string, FloorPlanZone[]> = {
  "wed-002": [
    { id:"z-dance", name:"Dance Floor", type:"dancefloor", x:33, y:77, width:34, height:13 },
    { id:"z-dj", name:"DJ", type:"dj", x:72, y:78, width:13, height:9 },
    { id:"z-buffet", name:"Evening Food", type:"buffet", x:5, y:77, width:18, height:9 },
    { id:"z-entrance", name:"Entrance", type:"entrance", x:44, y:94, width:12, height:4 }
  ]
};

export const dietarySummaryByWedding: Record<string, DietarySummary[]> = {
  "wed-002": [
    { label:"Vegetarian", count:1, severity:"info" },
    { label:"Gluten free", count:1, severity:"allergy" },
    { label:"Nut allergy", count:1, severity:"critical" },
    { label:"Dairy free", count:1, severity:"allergy" },
    { label:"Coeliac", count:1, severity:"critical" }
  ]
};
