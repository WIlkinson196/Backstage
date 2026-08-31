import type { WeddingMeeting, WeddingPayment, WeddingRecord, WeddingTask, WeddingTimelineItem } from "@/features/weddings/types/wedding";

export const demoWeddings: WeddingRecord[] = [
  {
    id: "wed-001",
    couple: "Mollie & Daniel",
    eventDate: "2026-09-23",
    packageName: "Willow",
    dayGuests: 82,
    eveningGuests: 120,
    quotedValue: 6907.45,
    paidValue: 6907.45,
    coordinator: "Amber",
    status: "finalising",
    ceremonyType: "onsite",
    ceremonyTime: "14:00",
    arrivalTime: "12:30",
    readinessScore: 86,
    planningScore: 92,
    nextMilestone: "Issue final operational pack",
    nextMilestoneDate: "2026-09-09"
  },
  {
    id: "wed-002",
    couple: "Lucy & Connor",
    eventDate: "2026-11-06",
    packageName: "Evergreen",
    dayGuests: 60,
    eveningGuests: 67,
    quotedValue: 2258.48,
    paidValue: 1300,
    coordinator: "Scott",
    status: "planning",
    ceremonyType: "onsite",
    ceremonyTime: "14:30",
    arrivalTime: "13:00",
    readinessScore: 61,
    planningScore: 73,
    nextMilestone: "Complete final meeting",
    nextMilestoneDate: "2026-09-11"
  },
  {
    id: "wed-003",
    couple: "Jessica & Shaun",
    eventDate: "2026-10-17",
    packageName: "Bespoke",
    dayGuests: 27,
    eveningGuests: 48,
    quotedValue: 2920.22,
    paidValue: 2920.22,
    coordinator: "Amber",
    status: "ready",
    ceremonyType: "onsite",
    ceremonyTime: "15:00",
    arrivalTime: "13:30",
    readinessScore: 96,
    planningScore: 100,
    nextMilestone: "Wedding day",
    nextMilestoneDate: "2026-10-17"
  }
];

export const demoTasks: WeddingTask[] = [
  { id:"task-01", weddingId:"wed-002", title:"Book first meeting", category:"Immediate", priority:"Medium", dueDate:"2026-08-20", completed:true },
  { id:"task-02", weddingId:"wed-002", title:"Complete first meeting", category:"Planning", priority:"Medium", dueDate:"2026-08-27", completed:true },
  { id:"task-03", weddingId:"wed-002", title:"Book halfway meeting", category:"Planning", priority:"Medium", dueDate:"2026-08-28", completed:true },
  { id:"task-04", weddingId:"wed-002", title:"Complete halfway meeting", category:"Planning", priority:"Medium", dueDate:"2026-08-31", completed:true },
  { id:"task-05", weddingId:"wed-002", title:"Invite final meeting", category:"Final Planning", priority:"High", dueDate:"2026-09-01", completed:true },
  { id:"task-06", weddingId:"wed-002", title:"Complete final meeting", category:"Final Planning", priority:"High", dueDate:"2026-09-11", completed:false },
  { id:"task-07", weddingId:"wed-002", title:"Confirm DJ", category:"Suppliers", priority:"High", dueDate:"2026-09-11", completed:false },
  { id:"task-08", weddingId:"wed-002", title:"Receive ceremony music", category:"Final Planning", priority:"Medium", dueDate:"2026-09-25", completed:false },
  { id:"task-09", weddingId:"wed-002", title:"Receive seating plan", category:"Final Planning", priority:"High", dueDate:"2026-09-25", completed:false },
  { id:"task-10", weddingId:"wed-002", title:"Final balance paid", category:"Payments", priority:"High", dueDate:"2026-10-02", completed:false },
  { id:"task-11", weddingId:"wed-002", title:"Complete function sheet", category:"Operations", priority:"High", dueDate:"2026-09-25", completed:false }
];

export const demoMeetings: WeddingMeeting[] = [
  { id:"meet-01", weddingId:"wed-002", type:"first", label:"First Meeting", eyebrow:"Shape the day", completedFields:18, totalFields:18, status:"complete", plannedDate:"2026-08-27" },
  { id:"meet-02", weddingId:"wed-002", type:"halfway", label:"Halfway Meeting", eyebrow:"Turn plans into selections", completedFields:16, totalFields:18, status:"complete", plannedDate:"2026-08-31" },
  { id:"meet-03", weddingId:"wed-002", type:"final", label:"Final Meeting", eyebrow:"Lock the operation", completedFields:12, totalFields:24, status:"in_progress", plannedDate:"2026-09-11" }
];

export const demoPayments: WeddingPayment[] = [
  { id:"pay-01", weddingId:"wed-002", label:"Booking deposit", amount:300, paidDate:"2026-03-10", status:"paid" },
  { id:"pay-02", weddingId:"wed-002", label:"Part payment", amount:1000, paidDate:"2026-08-27", status:"paid" },
  { id:"pay-03", weddingId:"wed-002", label:"Final balance", amount:958.48, dueDate:"2026-10-02", status:"scheduled" }
];

export const demoTimeline: WeddingTimelineItem[] = [
  { id:"time-01", weddingId:"wed-002", time:"12:30", title:"Supplier access", detail:"Décor and cake suppliers", category:"operations" },
  { id:"time-02", weddingId:"wed-002", time:"13:00", title:"Guest arrival", detail:"Welcome drinks available", category:"guest" },
  { id:"time-03", weddingId:"wed-002", time:"14:30", title:"Ceremony", detail:"The Granary", category:"ceremony" },
  { id:"time-04", weddingId:"wed-002", time:"15:15", title:"Drinks & photographs", detail:"Event garden", category:"guest" },
  { id:"time-05", weddingId:"wed-002", time:"16:30", title:"Wedding breakfast", detail:"Main function room", category:"food" },
  { id:"time-06", weddingId:"wed-002", time:"19:00", title:"Evening guests arrive", category:"guest" },
  { id:"time-07", weddingId:"wed-002", time:"20:00", title:"Evening food", detail:"BBQ service", category:"food" },
  { id:"time-08", weddingId:"wed-002", time:"00:00", title:"Event finish", category:"operations" }
];
