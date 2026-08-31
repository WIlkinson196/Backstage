// ============================================================================
// ENQUIRIES REVAMP — PHASE 1
// SALES COMMAND ENGINE: deal health, no-miss controls, priority queue,
// pipeline intelligence. Uses existing enquiry fields so Reports stays aligned.
// ============================================================================
(function(){
  const today=()=>typeof todayStr!=='undefined'?todayStr:new Date().toISOString().slice(0,10);
  const open=e=>window.EnquiriesCentre?.isOpen?EnquiriesCentre.isOpen(e):!['Confirmed Booking','Confirmed','Lost Enquiry','Lost'].includes(e.status);
  const daysSinceDate=v=>{if(!v)return null;const n=Math.floor((new Date(today()+'T12:00:00')-new Date(v+'T12:00:00'))/86400000);return Number.isFinite(n)?n:null;};
  const daysUntil=v=>{if(!v)return null;const n=Math.ceil((new Date(v+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000);return Number.isFinite(n)?n:null;};

  function health(e){
    if(!open(e))return {key:'closed',label:'Closed',score:99,reason:'This enquiry is no longer in the active sales pipeline.',className:'grey'};
    const since=daysSinceDate(e.lastContact||e.enquiryDate);
    const due=daysUntil(e.nextFollowup);
    const noAction=!String(e.nextAction||'').trim()||!e.nextFollowup;
    const activityReasons=window.EnquiryActivity?.chaseReason?EnquiryActivity.chaseReason(e):[];
    const provisional=e.status==='Provisional Booking';
    const deposit=e.status==='Deposit Required';
    if(due!==null&&due<0)return {key:'urgent',label:'Urgent',score:0,reason:`Next action is ${Math.abs(due)} day${Math.abs(due)===1?'':'s'} overdue.`,className:'red'};
    if(activityReasons.length)return {key:'urgent',label:'Needs Action',score:1,reason:activityReasons[0],className:'red'};
    if(noAction)return {key:'urgent',label:'No Next Action',score:1,reason:'This live enquiry does not have a complete future action scheduled.',className:'red'};
    if(provisional&&due!==null&&due<=2)return {key:'urgent',label:'Urgent',score:2,reason:'Provisional booking needs a decision/deposit follow-up within 48 hours.',className:'red'};
    if(deposit)return {key:'hot',label:'Deposit Pending',score:3,reason:'The customer is close to conversion and the deposit is still required.',className:'green'};
    if(['Viewing Completed','Quote Sent'].includes(e.status)&&since!==null&&since>=5)return {key:'risk',label:'At Risk',score:4,reason:`${e.status} but no recorded customer contact for ${since} days.`,className:'amber'};
    if(since!==null&&since>=7)return {key:'risk',label:'Stale',score:5,reason:`No recorded contact for ${since} days.`,className:'amber'};
    if((e.priority||'').toLowerCase()==='hot'||['Viewing Completed','Quote Sent','Provisional Booking'].includes(e.status))return {key:'hot',label:'Hot',score:6,reason:'This enquiry is at an advanced/high-priority sales stage.',className:'green'};
    return {key:'healthy',label:'Healthy',score:7,reason:'Recent activity and a future action are recorded.',className:'olive'};
  }

  function priorityScore(e){
    const h=health(e);
    const value=Number(e.value||0);
    const probability=Number(e.probability||0);
    return h.score*1000000 - Math.round(value*(Math.max(probability,10)/100));
  }

  function stats(){
    const all=Array.isArray(DB.enquiries)?DB.enquiries:[];
    const active=all.filter(open);
    const urgent=active.filter(e=>['urgent'].includes(health(e).key));
    const risk=active.filter(e=>health(e).key==='risk');
    const hot=active.filter(e=>health(e).key==='hot');
    const noAction=active.filter(e=>!String(e.nextAction||'').trim()||!e.nextFollowup);
    const overdue=active.filter(e=>{const d=daysUntil(e.nextFollowup);return d!==null&&d<0;});
    const dueToday=active.filter(e=>daysUntil(e.nextFollowup)===0);
    const weighted=Math.round(active.reduce((s,e)=>s+Number(e.value||0)*(Number(e.probability||0)/100),0));
    return {active,urgent,risk,hot,noAction,overdue,dueToday,weighted};
  }

  function priorityQueue(limit=8){
    return stats().active
      .filter(e=>health(e).key!=='healthy'||daysUntil(e.nextFollowup)===0)
      .sort((a,b)=>priorityScore(a)-priorityScore(b))
      .slice(0,limit);
  }

  function pipeline(){
    const stages=['New Enquiry','Contacted','Brochure Sent','Viewing Booked','Viewing Completed','Quote Sent','Follow Up Later','Provisional Booking','Deposit Required'];
    return stages.map(stage=>{
      const rows=stats().active.filter(e=>e.status===stage);
      const value=rows.reduce((s,e)=>s+Number(e.value||0),0);
      const weighted=Math.round(rows.reduce((s,e)=>s+Number(e.value||0)*(Number(e.probability||0)/100),0));
      const ages=rows.map(e=>daysSinceDate(e.lastContact||e.enquiryDate)).filter(Number.isFinite);
      return {stage,rows,count:rows.length,value,weighted,avgAge:ages.length?Math.round(ages.reduce((a,b)=>a+b,0)/ages.length):0};
    });
  }

  function explain(e){
    const h=health(e),since=daysSinceDate(e.lastContact||e.enquiryDate),due=daysUntil(e.nextFollowup);
    const reasons=[h.reason];
    if(Number(e.value||0)>0)reasons.push(`Potential value £${Number(e.value||0).toLocaleString()}.`);
    if(Number(e.probability||0)>0)reasons.push(`${Number(e.probability||0)}% probability.`);
    if(since!==null)reasons.push(since===0?'Customer activity recorded today.':`Last recorded contact ${since} day${since===1?'':'s'} ago.`);
    if(due!==null&&due>0)reasons.push(`Next action due in ${due} day${due===1?'':'s'}.`);
    return reasons;
  }

  window.EnquirySalesCommand={health,stats,priorityQueue,pipeline,explain,daysUntil,daysSinceDate};
})();
