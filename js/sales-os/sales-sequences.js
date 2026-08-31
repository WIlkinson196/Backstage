// SALES OS 2.0 — PHASE 5: SEQUENCES, NURTURE & REVIVE
(function(){
 const START='--- SALES OS AUTOMATION ---',END='--- END SALES OS AUTOMATION ---';
 const today=()=>currentDateStr();
 const add=(d,n)=>salesAddDays(d||today(),n);
 const templates={
   cold:{
     name:'New Target · Multi-touch',
     description:'Structured first-contact cadence without creating a pile of manual reminders.',
     steps:[
       ['Call','Call the prospect and identify the organiser / decision maker',0],
       ['Email','Send a short tailored introduction after the first call attempt',1],
       ['Call','Second call — reference the previous contact and seek a two-way conversation',3],
       ['Email','Send one useful, relevant venue example rather than a generic brochure',7],
       ['Call','Final active-sequence call and agree whether to progress or nurture',14]
     ],
     nurtureDays:30
   },
   decision:{
     name:'Decision Maker Hunt',
     description:'For accounts where the company is relevant but the right person is still unknown.',
     steps:[
       ['Research','Identify the person responsible for events, meetings, HR, office management or procurement',0],
       ['Call','Call reception / switchboard and verify the organiser or approver',1],
       ['LinkedIn / Email','Use available contact channels to reach the identified person',3],
       ['Call','Follow up the named decision maker',6]
     ],
     nurtureDays:30
   },
   warm:{
     name:'Warm Opportunity Follow-up',
     description:'For engaged accounts that are not yet formal opportunities.',
     steps:[
       ['Call','Progress the conversation to a meeting, venue visit or specific requirement',0],
       ['Email','Send only the information agreed in the conversation',1],
       ['Call','Follow up and secure a dated commitment',3]
     ],
     nurtureDays:14
   }
 };
 SalesOS.sequenceTemplates=templates;

 SalesOS.sequenceState=function(lead){
   const text=String(lead?.notes||''),m=text.match(/--- SALES OS AUTOMATION ---\s*([\s\S]*?)\s*--- END SALES OS AUTOMATION ---/i);
   if(!m)return {};
   try{return JSON.parse(m[1])||{};}catch(_){return {};}
 };
 SalesOS.cleanAutomationNotes=function(notes){
   return String(notes||'').replace(/--- SALES OS AUTOMATION ---\s*[\s\S]*?\s*--- END SALES OS AUTOMATION ---/ig,'').trim();
 };
 SalesOS.packAutomationNotes=function(notes,state){
   return [SalesOS.cleanAutomationNotes(notes),START,JSON.stringify(state),END].filter(Boolean).join('\n\n');
 };
 SalesOS.sequenceStep=function(lead){
   const s=SalesOS.sequenceState(lead),t=templates[s.template];
   if(!s.active||!t)return null;
   return t.steps[Math.min(Number(s.step||0),t.steps.length-1)]||null;
 };
 SalesOS.sequenceLabel=function(lead){
   const s=SalesOS.sequenceState(lead);
   if(s.nurtureUntil)return {label:`Nurture · ${SalesOS.date(s.nurtureUntil)}`,tone:'blue'};
   if(s.active&&templates[s.template]){
     const i=Number(s.step||0)+1,total=templates[s.template].steps.length;
     return {label:`${templates[s.template].name} · ${i}/${total}`,tone:'olive'};
   }
   if(s.completedAt)return {label:'Sequence complete',tone:'gray'};
   return null;
 };
 SalesOS.sequenceCandidates=function(){
   return (DB.salesLeads||[]).filter(lead=>{
     const s=SalesOS.sequenceState(lead),days=SalesOS.daysSince(lead.lastContact);
     return (s.nurtureUntil&&s.nurtureUntil<=today()) ||
       (activeSalesLead(lead)&&days!==null&&days>=45) ||
       (lead.status==='Converted'&&SalesOS.accountCompany?.(lead)?.currentCustomer&&days!==null&&days>=120);
   }).sort((a,b)=>{
     const aState=SalesOS.sequenceState(a),bState=SalesOS.sequenceState(b);
     const aDue=aState.nurtureUntil||a.lastContact||'1900-01-01',bDue=bState.nurtureUntil||b.lastContact||'1900-01-01';
     return String(aDue).localeCompare(String(bDue));
   });
 };
 SalesOS.openSequenceForm=function(id){
   const lead=(DB.salesLeads||[]).find(x=>x.id===id);if(!lead)return;
   const state=SalesOS.sequenceState(lead);
   openModal(`<div class="p-6 max-w-2xl"><div class="flex justify-between gap-3 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-700">SALES SEQUENCE</p><h2 class="text-xl font-bold">${esc(lead.companyName)}</h2><p class="text-sm text-gray-500 mt-1">Choose a repeatable cadence. It will stop when the prospect genuinely engages.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
   <form onsubmit="SalesOS.enrolSequence(event,'${id}')" class="space-y-4">
     <div class="grid gap-3">${Object.entries(templates).map(([key,t])=>`<label class="rounded-xl border p-4 flex gap-3 cursor-pointer hover:bg-olive-50"><input type="radio" name="template" value="${key}" ${state.template===key?'checked':''} required class="mt-1"><span><strong>${esc(t.name)}</strong><p class="text-xs text-gray-500 mt-1">${esc(t.description)}</p><small class="text-gray-400">${t.steps.length} active touches · then nurture</small></span></label>`).join('')}</div>
     <button class="w-full py-3 bg-olive-700 text-white rounded-xl font-bold">Start Sequence</button>
   </form></div>`);
 };
 SalesOS.enrolSequence=async function(event,id){
   event.preventDefault();const lead=(DB.salesLeads||[]).find(x=>x.id===id);if(!lead)return;
   const key=new FormData(event.target).get('template'),t=templates[key];if(!t)return;
   const first=t.steps[0],state={template:key,active:true,step:0,startedAt:new Date().toISOString(),lastAdvancedAt:new Date().toISOString(),nurtureUntil:'',completedAt:'',reason:''};
   const update={notes:SalesOS.packAutomationNotes(lead.notes,state),next_action:first[1],next_followup:add(today(),first[2]),status:lead.status==='Prospect'?'First Contact Due':lead.status};
   const {error}=await supabaseClient.from('sales_leads').update(update).eq('id',id);
   if(error){console.error(error);toast('Sequence could not be started','error');return;}
   await loadSalesLeadsFromSupabase();closeModal();renderSection();toast(`${t.name} started`);
 };
 SalesOS.nurtureLead=async function(id,days=30,reason='Future follow-up'){
   const lead=(DB.salesLeads||[]).find(x=>x.id===id);if(!lead)return;
   const state={...SalesOS.sequenceState(lead),active:false,nurtureUntil:add(today(),days),nurtureReason:reason,completedAt:'',reason:'Nurture'};
   const {error}=await supabaseClient.from('sales_leads').update({notes:SalesOS.packAutomationNotes(lead.notes,state),next_action:`Re-engage: ${reason}`,next_followup:state.nurtureUntil,status:'Researching'}).eq('id',id);
   if(error){console.error(error);toast('Nurture could not be scheduled','error');return;}
   await loadSalesLeadsFromSupabase();renderSection();toast(`Nurture scheduled for ${SalesOS.date(state.nurtureUntil)}`);
 };
 SalesOS.openNurtureForm=function(id){
   const lead=(DB.salesLeads||[]).find(x=>x.id===id);if(!lead)return;
   openModal(`<div class="p-6 max-w-lg"><p class="text-xs font-bold tracking-widest text-olive-700">NURTURE</p><h2 class="text-xl font-bold">${esc(lead.companyName)}</h2><form onsubmit="SalesOS.saveNurture(event,'${id}')" class="space-y-3 mt-4"><label class="block text-xs text-gray-600">Come back in<select name="days" class="mt-1 w-full px-3 py-2 border rounded-lg">${[[14,'2 weeks'],[30,'30 days'],[60,'60 days'],[90,'90 days'],[180,'6 months']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label class="block text-xs text-gray-600">Why / future trigger *<input name="reason" required placeholder="e.g. Contract renews in October / Christmas planning starts in August" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><button class="w-full py-3 bg-olive-700 text-white rounded-xl font-bold">Schedule Nurture</button></form></div>`);
 };
 SalesOS.saveNurture=function(event,id){event.preventDefault();const d=new FormData(event.target);closeModal();SalesOS.nurtureLead(id,Number(d.get('days')||30),String(d.get('reason')||'Future follow-up'));};

 SalesOS.sequenceAfterOutcome=async function(id,outcome){
   const lead=(DB.salesLeads||[]).find(x=>x.id===id);if(!lead)return;
   const s=SalesOS.sequenceState(lead),t=templates[s.template];
   if(!s.active||!t)return;
   const positive=/spoke to decision maker|information requested|interested|meeting booked|proposal required|proposal sent|negotiating|converted/i.test(outcome);
   const dead=/not interested/i.test(outcome);
   if(positive||dead){
     const state={...s,active:false,completedAt:new Date().toISOString(),reason:dead?'Closed':'Engaged'};
     await supabaseClient.from('sales_leads').update({notes:SalesOS.packAutomationNotes(lead.notes,state)}).eq('id',id);
     return;
   }
   const nextIndex=Number(s.step||0)+1;
   if(nextIndex>=t.steps.length){
     const nurture=add(today(),t.nurtureDays);
     const state={...s,active:false,step:nextIndex,completedAt:new Date().toISOString(),nurtureUntil:nurture,reason:'Sequence exhausted'};
     await supabaseClient.from('sales_leads').update({notes:SalesOS.packAutomationNotes(lead.notes,state),next_action:'Re-engage after active sequence',next_followup:nurture}).eq('id',id);
     return;
   }
   const step=t.steps[nextIndex],state={...s,step:nextIndex,lastAdvancedAt:new Date().toISOString()};
   await supabaseClient.from('sales_leads').update({notes:SalesOS.packAutomationNotes(lead.notes,state),next_action:step[1],next_followup:add(today(),step[2])}).eq('id',id);
 };
 SalesOS.reactivateLead=async function(id){
   const lead=(DB.salesLeads||[]).find(x=>x.id===id);if(!lead)return;
   const s=SalesOS.sequenceState(lead),customer=lead.status==='Converted'||SalesOS.accountCompany?.(lead)?.currentCustomer;
   const state={...s,active:false,nurtureUntil:'',completedAt:'',reason:'Reactivated',lastAdvancedAt:new Date().toISOString()};
   const update={notes:SalesOS.packAutomationNotes(lead.notes,state),status:'First Contact Due',relationship:customer?'Existing Customer':lead.relationship,next_action:customer?'Win-back / account expansion call':'Re-engage and establish the next live requirement',next_followup:today()};
   const {error}=await supabaseClient.from('sales_leads').update(update).eq('id',id);
   if(error){console.error(error);toast('Account could not be reactivated','error');return;}
   await loadSalesLeadsFromSupabase();renderSection();toast('Account reactivated into Today');
 };
 SalesOS.renderRevivePanel=function(){
   const rows=SalesOS.sequenceCandidates().slice(0,6);
   if(!rows.length)return '';
   return `<section class="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5"><div class="p-5 border-b flex justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-700">REVIVE</p><h3 class="font-bold text-xl">Revenue sleeping in the database</h3><p class="text-xs text-gray-500 mt-1">Nurture dates that have matured, dormant prospects and overdue customer win-backs.</p></div><span class="badge bg-gold-100 text-amber-800">${SalesOS.sequenceCandidates().length}</span></div><div class="divide-y">${rows.map(lead=>{const s=SalesOS.sequenceState(lead),days=SalesOS.daysSince(lead.lastContact),customer=lead.status==='Converted'||SalesOS.accountCompany?.(lead)?.currentCustomer;return `<article class="p-4 flex flex-col lg:flex-row lg:items-center gap-3"><div class="flex-1"><div class="flex gap-2 items-center flex-wrap"><strong>${esc(lead.companyName)}</strong><span class="badge ${customer?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}">${customer?'WIN BACK':'REVIVE'}</span></div><p class="text-xs text-gray-500 mt-1">${s.nurtureReason?esc(s.nurtureReason):days!==null?`${days} days since last contact`:'Future follow-up due'} · ${SalesOS.money(lead.annualPotential||lead.potentialValue)} potential</p></div><button onclick="SalesOS.reactivateLead('${lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-bold">Reactivate</button></article>`}).join('')}</div></section>`;
 };
})();
