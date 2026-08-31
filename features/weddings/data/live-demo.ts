import type { LiveChecklistItem, LiveContact, LiveNote, LiveTimelineItem } from "@/features/weddings/types/live";

export const liveTimelineByWedding: Record<string, LiveTimelineItem[]> = {
  "wed-002": [
    { id:"live-1", weddingId:"wed-002", time:"12:30", title:"Supplier access", owner:"Duty Manager", location:"The Granary", detail:"Décor and cake supplier access. Keep service route clear.", state:"complete" },
    { id:"live-2", weddingId:"wed-002", time:"13:00", title:"Guest arrival", owner:"FOH Lead", location:"Entrance / Bar", detail:"Welcome drinks available. Reception briefed on wedding bedrooms.", state:"complete" },
    { id:"live-3", weddingId:"wed-002", time:"14:15", title:"Ceremony call", owner:"Coordinator", location:"The Granary", detail:"Seat guests, check registrar and confirm ceremony music cue.", state:"current" },
    { id:"live-4", weddingId:"wed-002", time:"14:30", title:"Ceremony", owner:"Coordinator", location:"The Granary", detail:"Bride entrance cue remains the final pre-ceremony check.", state:"next" },
    { id:"live-5", weddingId:"wed-002", time:"15:15", title:"Drinks & photographs", owner:"FOH Lead", location:"Event Garden", detail:"Turn room for wedding breakfast while guests are outside.", state:"upcoming" },
    { id:"live-6", weddingId:"wed-002", time:"16:30", title:"Wedding breakfast", owner:"Kitchen + FOH", location:"The Granary", detail:"Dietary matrix must be with service lead before plates leave kitchen.", state:"attention" },
    { id:"live-7", weddingId:"wed-002", time:"19:00", title:"Evening guests arrive", owner:"FOH Lead", location:"The Granary", state:"upcoming" },
    { id:"live-8", weddingId:"wed-002", time:"20:00", title:"BBQ service", owner:"Kitchen", location:"Event Garden", state:"upcoming" },
    { id:"live-9", weddingId:"wed-002", time:"00:00", title:"Event finish", owner:"Duty Manager", location:"The Granary", detail:"Close-down, lost property sweep and final handover note.", state:"upcoming" }
  ]
};

export const liveChecklistByWedding: Record<string, LiveChecklistItem[]> = {
  "wed-002": [
    { id:"check-1", weddingId:"wed-002", category:"Room", label:"Ceremony room dressed and photographed", completed:true },
    { id:"check-2", weddingId:"wed-002", category:"Ceremony", label:"Registrar arrival confirmed", completed:true, critical:true },
    { id:"check-3", weddingId:"wed-002", category:"Ceremony", label:"Final ceremony music cue confirmed", detail:"Confirm bride entrance track with coordinator.", completed:false, critical:true },
    { id:"check-4", weddingId:"wed-002", category:"Food & Drink", label:"Welcome drinks station ready", completed:true },
    { id:"check-5", weddingId:"wed-002", category:"Food & Drink", label:"Dietary matrix handed to FOH service lead", detail:"One critical dietary requires verbal handover.", completed:false, critical:true },
    { id:"check-6", weddingId:"wed-002", category:"Suppliers", label:"DJ arrival / setup confirmed", completed:false },
    { id:"check-7", weddingId:"wed-002", category:"Guest Care", label:"Accessibility requirements briefed to team", completed:true },
    { id:"check-8", weddingId:"wed-002", category:"Close Down", label:"End-of-night handover completed", completed:false }
  ]
};

export const liveContactsByWedding: Record<string, LiveContact[]> = {
  "wed-002": [
    { id:"contact-1", weddingId:"wed-002", role:"Venue Coordinator", name:"Scott", status:"onsite" },
    { id:"contact-2", weddingId:"wed-002", role:"Photographer", name:"TBC Photography", arrivalTime:"13:15", status:"onsite" },
    { id:"contact-3", weddingId:"wed-002", role:"DJ", name:"Awaiting final supplier name", arrivalTime:"18:00", status:"unknown" },
    { id:"contact-4", weddingId:"wed-002", role:"Registrar", name:"Lincoln Registration Service", arrivalTime:"14:00", status:"confirmed" }
  ]
};

export const liveNotesByWedding: Record<string, LiveNote[]> = {
  "wed-002": [
    { id:"note-1", weddingId:"wed-002", createdAt:"13:08", author:"Scott", text:"Cake supplier finished setup. Cake table moved 40cm left to clear service route.", kind:"change" },
    { id:"note-2", weddingId:"wed-002", createdAt:"13:42", author:"FOH Lead", text:"Welcome drinks fully set. Two early evening guests have arrived with day party and are being looked after in the bar.", kind:"note" }
  ]
};
