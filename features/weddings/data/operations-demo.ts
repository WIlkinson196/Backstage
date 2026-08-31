import type { FunctionSheetSection, ReadinessCheck, RunningOrderItem, WeddingDocument } from "../types/operations";

export const documentsByWedding: Record<string, WeddingDocument[]> = {
  "wed-002": [
    { id:"doc-1", weddingId:"wed-002", type:"customer_pack", title:"Wedding Planning Pack", version:3, status:"issued", generatedAt:"2026-08-31T12:00:00Z", issuedAt:"2026-08-31T12:15:00Z" },
    { id:"doc-2", weddingId:"wed-002", type:"function_sheet", title:"Function Sheet", version:1, status:"draft" },
    { id:"doc-3", weddingId:"wed-002", type:"running_order", title:"Operational Running Order", version:1, status:"ready", generatedAt:"2026-08-31T14:00:00Z" },
    { id:"doc-4", weddingId:"wed-002", type:"kitchen_sheet", title:"Kitchen Wedding Sheet", version:1, status:"draft" },
    { id:"doc-5", weddingId:"wed-002", type:"handover", title:"Event Handover", version:1, status:"draft" }
  ]
};

export const runningOrderByWedding: Record<string, RunningOrderItem[]> = {
  "wed-002": [
    { id:"ro-1", time:"12:30", title:"Supplier access", owner:"Duty Manager", location:"The Granary", operationalNotes:"Décor and cake suppliers. Check access route remains clear.", status:"confirmed" },
    { id:"ro-2", time:"13:00", title:"Guest arrival", owner:"FOH Lead", location:"Entrance / Bar", operationalNotes:"Welcome drinks ready. Reception team aware of wedding bedrooms.", status:"confirmed" },
    { id:"ro-3", time:"14:15", title:"Ceremony call", owner:"Coordinator", location:"The Granary", operationalNotes:"Seat guests and confirm registrar ready.", status:"attention" },
    { id:"ro-4", time:"14:30", title:"Ceremony", owner:"Coordinator", location:"The Granary", operationalNotes:"Music selection still awaiting final confirmation.", status:"attention" },
    { id:"ro-5", time:"15:15", title:"Drinks & photographs", owner:"FOH Lead", location:"Event Garden", operationalNotes:"Turn room for wedding breakfast.", status:"planned" },
    { id:"ro-6", time:"16:30", title:"Wedding breakfast", owner:"Kitchen + FOH", location:"The Granary", operationalNotes:"Final dietary matrix to be attached to service brief.", status:"attention" },
    { id:"ro-7", time:"19:00", title:"Evening guests arrive", owner:"FOH Lead", location:"The Granary", status:"planned" },
    { id:"ro-8", time:"20:00", title:"BBQ service", owner:"Kitchen", location:"Event Garden", status:"planned" },
    { id:"ro-9", time:"00:00", title:"Event finish", owner:"Duty Manager", location:"The Granary", operationalNotes:"Close-down and handover.", status:"planned" }
  ]
};

export const functionSheetByWedding: Record<string, FunctionSheetSection[]> = {
  "wed-002": [
    {
      key:"event",
      title:"Event",
      status:"complete",
      rows:[
        {label:"Wedding",value:"Lucy & Connor"},
        {label:"Date",value:"6 November 2026"},
        {label:"Package",value:"Evergreen"},
        {label:"Coordinator",value:"Scott"}
      ]
    },
    {
      key:"numbers",
      title:"Guest Numbers",
      status:"complete",
      rows:[
        {label:"Day",value:"60"},
        {label:"Evening",value:"67"},
        {label:"Children",value:"13"}
      ]
    },
    {
      key:"ceremony",
      title:"Ceremony",
      status:"attention",
      rows:[
        {label:"Location",value:"The Granary"},
        {label:"Time",value:"14:30"},
        {label:"Music",value:"Awaiting final selection"}
      ]
    },
    {
      key:"food",
      title:"Food & Drink",
      status:"attention",
      rows:[
        {label:"Wedding breakfast",value:"Menu One"},
        {label:"Evening food",value:"BBQ"},
        {label:"Welcome drinks",value:"Prosecco"},
        {label:"Dietaries",value:"Final matrix requires review"}
      ]
    },
    {
      key:"suppliers",
      title:"Suppliers",
      status:"attention",
      rows:[
        {label:"Photographer",value:"TBC Photography"},
        {label:"DJ",value:"Not yet confirmed"},
        {label:"Décor",value:"Venue supplied"}
      ]
    },
    {
      key:"operations",
      title:"Operations",
      status:"attention",
      rows:[
        {label:"Supplier access",value:"12:30"},
        {label:"Guest arrival",value:"13:00"},
        {label:"Finish",value:"00:00"},
        {label:"Seating plan",value:"Awaiting final copy"}
      ]
    }
  ]
};

export const readinessByWedding: Record<string, ReadinessCheck[]> = {
  "wed-002": [
    { id:"ready-1", label:"Core event details", detail:"Date, guest numbers and package recorded.", status:"pass" },
    { id:"ready-2", label:"Final meeting", detail:"Final meeting still has outstanding fields.", status:"warning" },
    { id:"ready-3", label:"Supplier confirmation", detail:"DJ confirmation is missing.", status:"warning" },
    { id:"ready-4", label:"Dietary information", detail:"Final dietary matrix needs review before issue.", status:"warning" },
    { id:"ready-5", label:"Seating plan", detail:"Final seating plan has not been received.", status:"block" },
    { id:"ready-6", label:"Payment position", detail:"Payment schedule is currently on plan.", status:"pass" }
  ]
};
