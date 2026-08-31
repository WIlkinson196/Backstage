// ============================================================================
// ENQUIRIES REVAMP — PHASE 6
// REPORTING INTELLIGENCE BRIDGE
// Adds process-quality analytics to the existing Reports page without
// duplicating existing revenue/conversion/source/lost/team reporting.
// ============================================================================
(function(){
 const arr=v=>Array.isArray(v)?v:[];
 const dayDiff=(a,b)=>{
   if(!a||!b)return null;
   const x=new Date(String(a).slice(0,10)+'T12:00:00'),y=new Date(String(b).slice(0,10)+'T12:00:00');
   if(Number.isNaN(x.getTime())||Number.isNaN(y.getTime()))return null;
   return Math.round((y-x)/86400000);
 };
 const open=e=>window.EnquiriesCentre?.isOpen?EnquiriesCentre.isOpen(e):!['Confirmed Booking','Lost Enquiry','Confirmed','Lost'].includes(e.status);
 const owner=e=>String(e.staff||e.owner||'Unassigned').trim()||'Unassigned';
 const value=e=>Number(e.value||0);
 const comms=e=>arr(e.comms||e.communications).filter(x=>x&&typeof x==='object');

 const milestones=[
   ['enquiry','Enquiry'],
   ['contact','Contacted'],
   ['viewing','Viewing / Meeting'],
   ['proposal','Proposal Sent'],
   ['provisional','Provisional'],
   ['deposit','Deposit Required'],
   ['won','Confirmed']
 ];

 function activityTypes(e){
   return comms(e).map(x=>String(x.type||'').toLowerCase());
 }
 function reached(e,key){
   const status=String(e.status||'');
   const types=activityTypes(e);
   const statusIndex={
     'New Enquiry':0,'Contacted':1,'Brochure Sent':1,'Viewing Booked':2,'Viewing Completed':2,
     'Quote Sent':3,'Follow Up Later':3,'Provisional Booking':4,'Deposit Required':5,'Confirmed Booking':6
   }[status];
   const wanted={enquiry:0,contact:1,viewing:2,proposal:3,provisional:4,deposit:5,won:6}[key];
   if(Number.isFinite(statusIndex)&&statusIndex>=wanted)return true;
   if(key==='enquiry')return true;
   if(key==='contact')return !!e.firstContactedAt||types.some(t=>/call|email|customer replied|contact/.test(t));
   if(key==='viewing')return types.some(t=>/viewing|meeting/.test(t));
   if(key==='proposal')return types.some(t=>/proposal|quote sent/.test(t));
   if(key==='provisional')return types.some(t=>/provisional/.test(t));
   if(key==='deposit')return types.some(t=>/deposit/.test(t));
   if(key==='won')return ['Confirmed Booking','Confirmed'].includes(status);
   return false;
 }
 function funnel(enquiries){
   return milestones.map(([key,label])=>{
     const rows=enquiries.filter(e=>reached(e,key));
     return {key,label,count:rows.length,value:rows.reduce((s,e)=>s+value(e),0)};
   });
 }
 function responseDays(e){
   const first=e.firstContactedAt||e.first_contacted_at;
   return dayDiff(e.enquiryDate||e.enquiry_date,first);
 }
 function responseMetrics(enquiries){
   const vals=enquiries.map(responseDays).filter(x=>x!==null&&x>=0);
   const sameDay=vals.filter(x=>x===0).length;
   const oneDay=vals.filter(x=>x<=1).length;
   return {
     measured:vals.length,
     missing:enquiries.length-vals.length,
     average:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,
     sameDayPct:vals.length?sameDay/vals.length*100:0,
     oneDayPct:vals.length?oneDay/vals.length*100:0
   };
 }
 function health(e){
   if(window.EnquiryPipelineHealth?.info)return EnquiryPipelineHealth.info(e);
   if(window.EnquirySalesCommand?.health)return EnquirySalesCommand.health(e);
   return {key:'healthy',label:'On track',reason:''};
 }
 function ownerRows(enquiries){
   const map={};
   enquiries.forEach(e=>{
     const k=owner(e);if(!map[k])map[k]=[];
     map[k].push(e);
   });
   return Object.entries(map).map(([name,rows])=>{
     const live=rows.filter(open),resp=responseMetrics(rows);
     const noAction=live.filter(e=>!String(e.nextAction||'').trim()||!e.nextFollowup).length;
     const overdue=live.filter(e=>window.EnquirySalesCommand?.daysUntil?EnquirySalesCommand.daysUntil(e.nextFollowup)<0:false).length;
     const atRisk=live.filter(e=>['urgent','stuck','risk'].includes(health(e).key)).length;
     return {name,total:rows.length,live:live.length,noAction,overdue,atRisk,averageResponse:resp.average,oneDayPct:resp.oneDayPct,pipeline:live.reduce((s,e)=>s+value(e),0)};
   }).sort((a,b)=>b.atRisk-a.atRisk||b.pipeline-a.pipeline);
 }
 function stageHealth(enquiries){
   const map={};
   enquiries.filter(open).forEach(e=>{
     const stage=e.status||'Unknown';if(!map[stage])map[stage]=[];
     map[stage].push(e);
   });
   return Object.entries(map).map(([stage,rows])=>{
     const stuck=rows.filter(e=>['urgent','stuck','risk'].includes(health(e).key));
     const ages=rows.map(e=>window.EnquiryPipelineHealth?.age?EnquiryPipelineHealth.age(e):null).filter(Number.isFinite);
     return {stage,count:rows.length,stuck:stuck.length,stuckValue:stuck.reduce((s,e)=>s+value(e),0),avgAge:ages.length?Math.round(ages.reduce((a,b)=>a+b,0)/ages.length):null};
   }).sort((a,b)=>b.stuckValue-a.stuckValue);
 }
 function lostCross(enquiries){
   const lost=enquiries.filter(e=>['Lost Enquiry','Lost'].includes(e.status));
   const map={};
   lost.forEach(e=>{
     const reason=e.lostReason||e.lost_reason||'Other';
     const type=e.eventType||'Other';
     const k=`${reason}|||${type}`;
     if(!map[k])map[k]={reason,type,count:0,value:0};
     map[k].count++;map[k].value+=value(e);
   });
   return Object.values(map).sort((a,b)=>b.value-a.value||b.count-a.count);
 }
 window.EnquiryReportingIntelligence={milestones,reached,funnel,responseDays,responseMetrics,ownerRows,stageHealth,lostCross};
})();
