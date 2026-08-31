import type { PortalDocument, PortalMessage, PortalPayment, PortalTask, PortalWedding } from "../types/portal";

export const portalWedding: PortalWedding = {
  id:"wed-002",
  couple:"Lucy & Connor",
  eventDate:"6 November 2026",
  venueName:"The Granary",
  heroImage:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85",
  planningProgress:73,
  daysToGo:67,
  nextMilestone:"Final planning meeting",
  outstandingBalance:958.48
};

export const portalTasks: PortalTask[] = [
  {id:"pt-1",title:"Confirm your ceremony music",detail:"Add your entrance, signing and exit music.",dueDate:"25 Sep",status:"due",category:"Music"},
  {id:"pt-2",title:"Complete your guest list",detail:"We still need the final names and table allocation.",dueDate:"25 Sep",status:"due",category:"Guests"},
  {id:"pt-3",title:"Review dietary requirements",detail:"Check every dietary requirement is correct before final submission.",dueDate:"25 Sep",status:"due",category:"Guests"},
  {id:"pt-4",title:"Final balance",detail:"Your remaining wedding balance.",dueDate:"2 Oct",status:"due",category:"Payment"},
  {id:"pt-5",title:"First planning meeting",detail:"Completed with your coordinator.",dueDate:"27 Aug",status:"complete",category:"Planning"}
];

export const portalDocuments: PortalDocument[] = [
  {id:"pd-1",title:"Wedding Planning Pack",description:"Your latest wedding summary and planning information.",version:3,status:"available"},
  {id:"pd-2",title:"Latest Quote",description:"Your agreed wedding quotation.",version:4,status:"available"},
  {id:"pd-3",title:"Final Wedding Pack",description:"Available once final planning has been completed.",version:1,status:"awaiting"}
];

export const portalPayments: PortalPayment[] = [
  {id:"pp-1",label:"Booking deposit",amount:300,status:"paid",date:"10 Mar 2026"},
  {id:"pp-2",label:"Part payment",amount:1000,status:"paid",date:"27 Aug 2026"},
  {id:"pp-3",label:"Final balance",amount:958.48,status:"due",date:"2 Oct 2026"}
];

export const portalMessages: PortalMessage[] = [
  {id:"pm-1",sender:"venue",senderName:"Amber",body:"Hi Lucy & Connor — everything is looking great. The main things we need next are your final ceremony music and seating plan.",sentAt:"Today · 10:42"},
  {id:"pm-2",sender:"couple",senderName:"Lucy",body:"Perfect, thank you! We’re finishing the table plan this weekend and will upload it once it’s done.",sentAt:"Today · 11:06"}
];
