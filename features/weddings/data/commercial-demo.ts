import type { PlanningSection, PricingCatalogueItem, WeddingQuote } from "../types/commercial";

export const weddingCatalogue: PricingCatalogueItem[] = [
  {
    id: "cat-evergreen",
    category: "Wedding Package",
    name: "Evergreen",
    description: "Core wedding package",
    price: 1995,
    priceType: "fixed",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-blossom",
    category: "Wedding Package",
    name: "Blossom",
    description: "Enhanced wedding package",
    price: 3999,
    priceType: "fixed",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-willow",
    category: "Wedding Package",
    name: "Willow",
    description: "Premium wedding package",
    price: 4495.95,
    priceType: "fixed",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-finger",
    category: "Food",
    name: "Finger Buffet",
    description: "Evening buffet",
    price: 14,
    priceType: "per_person",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-hog",
    category: "Food",
    name: "Hog Roast",
    description: "Evening hog roast",
    price: 16,
    priceType: "per_person",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-bbq",
    category: "Food",
    name: "BBQ",
    description: "Evening BBQ",
    price: 15,
    priceType: "per_person",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-dj",
    category: "Entertainment",
    name: "DJ",
    description: "Evening DJ package",
    price: 400,
    priceType: "fixed",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-love",
    category: "Décor",
    name: "LOVE Letters",
    description: "Illuminated LOVE letters",
    price: 180,
    priceType: "fixed",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-ceremony",
    category: "Hire",
    name: "Ceremony Hire",
    description: "On-site ceremony",
    price: 200,
    priceType: "fixed",
    active: true,
    source: "My Venue"
  },
  {
    id: "cat-room",
    category: "Hire",
    name: "Full Day Room Hire",
    description: "Full day function room hire",
    price: 700,
    priceType: "fixed",
    active: true,
    source: "My Venue"
  }
];

export const quoteByWedding: Record<string, WeddingQuote> = {
  "wed-002": {
    weddingId: "wed-002",
    version: 4,
    status: "draft",
    expiresAt: "2026-09-15",
    discount: 0,
    notes: "Final guest numbers may alter catering totals.",
    lines: [
      { id:"ql-1", category:"Package", name:"Evergreen Wedding Package", description:"Core package", quantity:1, unitPrice:1995, required:true },
      { id:"ql-2", category:"Accommodation", name:"Bridal Suite — night before", quantity:1, unitPrice:47.50 },
      { id:"ql-3", category:"Other", name:"Additional agreed items", quantity:1, unitPrice:215.98 }
    ]
  }
};

export const planningByWedding: Record<string, PlanningSection[]> = {
  "wed-002": [
    {
      key:"profile",
      title:"Wedding profile",
      description:"Core shape of the wedding and guest numbers.",
      owner:"Shared",
      progress:100,
      fields:[
        {key:"day_guests",label:"Day guests",value:"60",status:"complete",customerVisible:true},
        {key:"evening_guests",label:"Evening guests",value:"67",status:"complete",customerVisible:true},
        {key:"package",label:"Package",value:"Evergreen",status:"complete",customerVisible:true},
        {key:"coordinator",label:"Coordinator",value:"Scott",status:"complete"}
      ]
    },
    {
      key:"ceremony",
      title:"Ceremony",
      description:"Ceremony format, timings and music.",
      owner:"Shared",
      progress:75,
      fields:[
        {key:"ceremony_type",label:"Ceremony",value:"On site",status:"complete",customerVisible:true},
        {key:"ceremony_time",label:"Ceremony time",value:"14:30",status:"complete",customerVisible:true},
        {key:"ceremony_music",label:"Ceremony music",status:"missing",customerVisible:true},
        {key:"registrar",label:"Registrar confirmed",value:"Yes",status:"complete"}
      ]
    },
    {
      key:"food_drink",
      title:"Food & drink",
      description:"Wedding breakfast, evening food and drinks.",
      owner:"Shared",
      progress:70,
      fields:[
        {key:"day_menu",label:"Wedding breakfast",value:"Menu One",status:"complete",customerVisible:true},
        {key:"evening_food",label:"Evening food",value:"BBQ",status:"complete",customerVisible:true},
        {key:"welcome_drinks",label:"Welcome drinks",value:"Prosecco",status:"complete",customerVisible:true},
        {key:"wine",label:"Table wine",status:"review",customerVisible:true},
        {key:"toast",label:"Toast drink",status:"missing",customerVisible:true}
      ]
    },
    {
      key:"suppliers",
      title:"Suppliers",
      description:"External suppliers and venue requirements.",
      owner:"Customer",
      progress:45,
      fields:[
        {key:"dj",label:"DJ",status:"missing",customerVisible:true},
        {key:"photographer",label:"Photographer",value:"TBC Photography",status:"complete",customerVisible:true},
        {key:"cake",label:"Cake supplier",status:"review",customerVisible:true},
        {key:"decor",label:"Décor supplier",value:"Venue supplied",status:"complete",customerVisible:true}
      ]
    },
    {
      key:"guest_requirements",
      title:"Guest requirements",
      description:"Dietary, accessibility, children and special arrangements.",
      owner:"Shared",
      progress:55,
      fields:[
        {key:"dietary",label:"Dietary requirements",status:"review",customerVisible:true},
        {key:"accessibility",label:"Accessibility",value:"None currently recorded",status:"complete",customerVisible:true},
        {key:"children",label:"Children",value:"13",status:"complete",customerVisible:true},
        {key:"high_chairs",label:"High chairs",status:"missing",customerVisible:true}
      ]
    },
    {
      key:"operations",
      title:"Operations",
      description:"Timings, room turn, layout and final operational details.",
      owner:"Venue",
      progress:60,
      fields:[
        {key:"supplier_access",label:"Supplier access",value:"12:30",status:"complete"},
        {key:"room_layout",label:"Room layout",status:"review"},
        {key:"seating_plan",label:"Seating plan",status:"missing",customerVisible:true},
        {key:"finish_time",label:"Finish time",value:"00:00",status:"complete"}
      ]
    }
  ]
};
