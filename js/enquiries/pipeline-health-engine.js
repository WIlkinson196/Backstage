// ENQUIRIES PHASE 4 — PIPELINE HEALTH & SALES AUTOMATION
(function(){
 const stages=['New Enquiry','Contacted','Brochure Sent','Viewing Booked','Viewing Completed','Quote Sent','Follow Up Later','Provisional Booking','Deposit Required'];
 const thresholds={'New Enquiry':1,'Contacted':4,'Brochure Sent':4,'Viewing Booked':14,'Viewing Completed':2,'Quote Sent':4,'Follow Up Later':7,'Provisional Booking':2,'Deposit Required':3};
 const today=()=>typeof todayStr!=='undefined'?todayStr:new Date().toISOString().slice(0,10);
 const age=e=>{const v=e.lastContact||e.enquiryDate;if(!v)return 0;return Math.max(0,Math.floor((new Date(today()+'T12:00:00')-new Date(v+'T12:00:00'))/86400000));};
 const open=e=>window.EnquiriesCentre?.isOpen?EnquiriesCentre.isOpen(e):!['Confirmed Booking','Lost Enquiry'].includes(e.status);
 function info(e){
   const a=age(e),limit=thresholds[e.status]??7;
   const activity=window.EnquiryActivity?.chaseReason?EnquiryActivity.chaseReason(e):[];
   const due=window.EnquirySalesCommand?.daysUntil?EnquirySalesCommand.daysUntil(e.nextFollowup):null;
   let key='healthy',label='On track',reason=`${a} day${a===1?'':'s'} in current activity window.`;
   if(due!==null&&due<0){key='urgent';label='Overdue';reason=`Next action overdue by ${Math.abs(due)} day${Math.abs(due)===1?'':'s'}.`;}
   else if(activity.length){key='urgent';label='Needs action';reason=activity[0];}
   else if(a>limit){key='stuck';label='Stuck';reason=`No recorded movement for ${a} days; target for ${e.status} is ${limit} days.`;}
   else if(a>=Math.max(1,limit-1)){key='watch';label='Watch';reason=`Approaching the ${limit}-day stage target.`;}
   return {key,label,reason,age:a,limit};
 }
 function summary(){
   const active=(DB.enquiries||[]).filter(open);
   const enriched=active.map(e=>({e,...info(e)}));
   return {
    active,
    urgent:enriched.filter(x=>x.key==='urgent'),
    stuck:enriched.filter(x=>x.key==='stuck'),
    watch:enriched.filter(x=>x.key==='watch'),
    healthy:enriched.filter(x=>x.key==='healthy'),
    pipelineValue:active.reduce((s,e)=>s+Number(e.value||0),0),
    weighted:Math.round(active.reduce((s,e)=>s+Number(e.value||0)*(Number(e.probability||0)/100),0))
   };
 }
 function stageSummary(){
   return stages.map(stage=>{
     const rows=(DB.enquiries||[]).filter(e=>open(e)&&e.status===stage);
     const value=rows.reduce((s,e)=>s+Number(e.value||0),0);
     const weighted=Math.round(rows.reduce((s,e)=>s+Number(e.value||0)*(Number(e.probability||0)/100),0));
     const stuck=rows.filter(e=>['urgent','stuck'].includes(info(e).key)).length;
     const avg=rows.length?Math.round(rows.reduce((s,e)=>s+age(e),0)/rows.length):0;
     return {stage,rows,value,weighted,stuck,avg,target:thresholds[stage]??7};
   });
 }
 function countdown(e){
   const st=window.EnquiryActivity?.state?EnquiryActivity.state(e):{};
   if(e.status==='Provisional Booking'&&st.provisionalExpiry){
     const d=Math.ceil((new Date(st.provisionalExpiry+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000);
     return d<0?`Expired ${Math.abs(d)}d ago`:d===0?'Expires today':`Expires in ${d}d`;
   }
   if(e.status==='Viewing Booked'&&st.viewingDate){
     const d=Math.ceil((new Date(st.viewingDate+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000);
     return d<0?`Viewing was ${Math.abs(d)}d ago`:d===0?'Viewing today':`Viewing in ${d}d`;
   }
   return '';
 }
 window.EnquiryPipelineHealth={stages,thresholds,age,info,summary,stageSummary,countdown};
})();
