// ===== WINDMILL INTELLIGENCE =====
function wiMoney(value){
  return '£'+Number(value||0).toLocaleString('en-GB',{maximumFractionDigits:0});
}
function wiFirstName(){
  const raw=String(window.currentUserProfile?.name||window.currentUserProfile?.full_name||document.getElementById('header-user-name')?.textContent||'Team').trim();
  return raw.split(/\s+/)[0]||'Team';
}
function wiOpenEnquiries(){
  return (DB.enquiries||[]).filter(e=>!['Confirmed Booking','Confirmed','Lost Enquiry','Lost'].includes(e.status));
}
function wiDueEnquiries(){
  return wiOpenEnquiries().filter(e=>e.nextFollowup&&(isOverdue(e.nextFollowup)||isDueToday(e.nextFollowup)));
}
function wiOverduePayments(){
  return (DB.payments||[]).filter(p=>p.deadline&&isOverdue(p.deadline)&&p.status!=='Paid in Full');
}
function wiUpcomingWeddings(days=42){
  const end=new Date(); end.setDate(end.getDate()+days);
  const endStr=end.toISOString().slice(0,10);
  return (DB.weddings||[]).filter(w=>w.date&&w.date>=todayStr&&w.date<=endStr&&!w.archivedAt).sort((a,b)=>a.date.localeCompare(b.date));
}
function wiWeddingRiskRows(){
  return wiUpcomingWeddings(42).map(w=>{
    let progress=0;
    try{progress=typeof weddingProgress==='function'?Number(weddingProgress(w)||0):0}catch(e){}
    const tasks=(w.tasks||[]).filter(t=>!['Completed','Done'].includes(t.status));
    const overdue=tasks.filter(t=>t.dueDate&&t.dueDate<todayStr).length;
    return {w,progress,tasks:tasks.length,overdue};
  }).filter(x=>x.overdue>0||x.progress<85);
}
function wiOperationsItems(){
  try{
    if(window.OperationsHub?.allItems)return OperationsHub.allItems().filter(x=>!OperationsHub.statusDone(x.status));
  }catch(e){}
  return (DB.tasks||[]).filter(t=>t.status!=='Completed').map(t=>({
    title:t.title,department:t.department||'Operations',owner:t.owner||t.staff||'Unassigned',
    due:t.due||t.dueDate||'',dateState:t.due&&isOverdue(t.due)?'overdue':t.due&&isDueToday(t.due)?'today':'open',
    value:Number(t.value||0)
  }));
}
function wiCommercialValue(item){
  return Number(item?.value||item?.potentialValue||item?.quotedValue||item?.finalBalance||item?.totalValue||0);
}
function wiContext(){
  const section=String(typeof currentSection!=='undefined'?currentSection:'dashboard');
  const map={
    dashboard:'Operations overview','sales-leads':'Sales workspace',sales:'Sales workspace',
    enquiries:'Enquiry conversion',weddings:'Wedding planning',functions:'Function delivery',
    kitchen:'Kitchen planning',christmas:'Christmas commercial',hotel:'Hotel performance',
    opportunities:'Opportunity pipeline',companies:'Company intelligence',calendar:'Calendar control',
    reports:'Performance reporting'
  };
  return {section,label:map[section]||'Venue overview'};
}
function wiSnapshot(){
  const dueEnquiries=wiDueEnquiries();
  const overduePayments=wiOverduePayments();
  const weddingRisks=wiWeddingRiskRows();
  const operations=wiOperationsItems();
  const dueOps=operations.filter(x=>x.dateState==='today');
  const overdueOps=operations.filter(x=>x.dateState==='overdue');

  const enquiryValue=dueEnquiries.reduce((s,e)=>s+wiCommercialValue(e),0);
  const paymentValue=overduePayments.reduce((s,p)=>s+Number(p.finalBalance||p.outstanding||0),0);
  const riskValue=enquiryValue+paymentValue;

  const priorityEnquiry=dueEnquiries.slice().sort((a,b)=>wiCommercialValue(b)-wiCommercialValue(a))[0]||null;
  const priorityPayment=overduePayments.slice().sort((a,b)=>Number(b.finalBalance||0)-Number(a.finalBalance||0))[0]||null;

  return {dueEnquiries,overduePayments,weddingRisks,operations,dueOps,overdueOps,enquiryValue,paymentValue,riskValue,priorityEnquiry,priorityPayment};
}
function toggleAI(){
  const p=document.getElementById('ai-panel');
  p.classList.toggle('open');
  if(p.classList.contains('open'))renderWindmillIntelligence();
  document.getElementById('notif-panel')?.classList.remove('open');
}
function renderWindmillIntelligence(){
  const s=wiSnapshot(),ctx=wiContext(),first=wiFirstName();
  const context=document.getElementById('wi-context-label');
  if(context)context.textContent=ctx.label;

  const welcome=document.getElementById('wi-welcome');
  if(welcome){
    welcome.innerHTML=`<p>Good ${new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, ${esc(first)}.</p>
      <h3>Here’s what needs your attention.</h3>
      <small>${ctx.label} · live CRM snapshot</small>`;
  }

  const cards=[];
  if(s.riskValue>0){
    cards.push({
      tone:'danger',icon:'pound-sterling',eyebrow:'COMMERCIAL VALUE NEEDING ACTION',
      title:`${wiMoney(s.riskValue)} needs attention`,
      detail:`${s.dueEnquiries.length} due enquiry follow-up${s.dueEnquiries.length===1?'':'s'} · ${s.overduePayments.length} overdue payment${s.overduePayments.length===1?'':'s'}`,
      action:'aiRevenueRisk()',button:'Show me why'
    });
  }else{
    cards.push({
      tone:'success',icon:'check-circle-2',eyebrow:'COMMERCIAL CONTROL',
      title:'No overdue payment or due-enquiry value detected',
      detail:'The currently loaded commercial records are under control.',
      action:'aiFollowups()',button:'Review sales'
    });
  }

  const priority=s.priorityPayment||s.priorityEnquiry;
  if(priority){
    const isPayment=!!s.priorityPayment;
    const title=isPayment?(priority.client||'Overdue payment'):(priority.name||'Enquiry follow-up');
    const value=isPayment?Number(priority.finalBalance||priority.outstanding||0):wiCommercialValue(priority);
    cards.push({
      tone:'gold',icon:'target',eyebrow:"TODAY'S PRIORITY",
      title:`${esc(title)}${value?` · ${wiMoney(value)}`:''}`,
      detail:isPayment?`Payment deadline ${esc(priority.deadline||'overdue')}`:`${esc(priority.status||'Open enquiry')} · follow-up ${esc(priority.nextFollowup||'due')}`,
      action:isPayment?'aiOverduePayments()':`wiOpenEnquiry('${priority.id}')`,
      button:isPayment?'Review payments':'Open enquiry'
    });
  }else if(s.dueOps.length){
    const op=s.dueOps[0];
    cards.push({tone:'gold',icon:'target',eyebrow:"TODAY'S PRIORITY",title:esc(op.title),detail:`${esc(op.department||'Operations')} · ${esc(op.owner||'Unassigned')}`,action:'wiShowToday()',button:'Review today'});
  }

  if(s.weddingRisks.length){
    cards.push({
      tone:'olive',icon:'heart',eyebrow:'PLANNING RISK',
      title:`${s.weddingRisks.length} upcoming wedding${s.weddingRisks.length===1?'':'s'} need planning attention`,
      detail:'Based on overdue wedding actions and current planning progress.',
      action:'aiWeddingRisks()',button:'Review weddings'
    });
  }else{
    const upcoming=wiUpcomingWeddings(42).length;
    cards.push({
      tone:'olive',icon:'calendar',eyebrow:'WEDDING CONTROL',
      title:upcoming?`${upcoming} wedding${upcoming===1?'':'s'} in the next 6 weeks`:'No weddings in the next 6 weeks',
      detail:upcoming?'No obvious overdue planning risk detected from the loaded records.':'The near-term wedding calendar is clear.',
      action:'aiUpcomingWeddings()',button:'View weddings'
    });
  }

  document.getElementById('wi-insights').innerHTML=cards.slice(0,3).map(c=>`
    <article class="wi-insight ${c.tone}">
      <span class="wi-insight-icon"><i data-lucide="${c.icon}"></i></span>
      <div class="wi-insight-copy">
        <small>${c.eyebrow}</small>
        <strong>${c.title}</strong>
        <p>${c.detail}</p>
      </div>
      <button onclick="${c.action}">${c.button}<i data-lucide="arrow-right"></i></button>
    </article>`).join('');

  renderAIPrompts();
  renderWIRecent();
  const result=document.getElementById('ai-result');
  if(result&&!result.dataset.keep)result.innerHTML='';
  if(window.lucide)lucide.createIcons();
}
function renderAIPrompts(){
  const prompts=[
    {label:"Today's priorities",icon:'target',q:'What should I focus on today?'},
    {label:'Protect revenue',icon:'shield',q:'What revenue needs protecting?'},
    {label:'Sales opportunities',icon:'pound-sterling',q:'Who needs following up today?'},
    {label:'Wedding risks',icon:'heart',q:'Which weddings need attention?'},
    {label:'This week',icon:'calendar',q:"Show this week's schedule"}
  ];
  const el=document.getElementById('ai-prompts');
  if(el)el.innerHTML=prompts.map(p=>`<button onclick="wiAskPreset('${p.q.replace(/'/g,"\\'")}')"><i data-lucide="${p.icon}"></i>${p.label}</button>`).join('');
}
function renderWIRecent(){
  const s=wiSnapshot();
  const rows=[
    s.riskValue?{icon:'alert-circle',tone:'danger',title:`${wiMoney(s.riskValue)} commercial value needs action`,sub:`${s.dueEnquiries.length+s.overduePayments.length} commercial records flagged`}:null,
    s.overdueOps.length?{icon:'clock',tone:'warn',title:`${s.overdueOps.length} operational actions are in backlog`,sub:'Use Operations Hub backlog recovery to work these separately'}:null,
    wiUpcomingWeddings(42).length?{icon:'heart',tone:'olive',title:`${wiUpcomingWeddings(42).length} weddings are inside the next 6 weeks`,sub:`${s.weddingRisks.length} currently show planning risk`}:null
  ].filter(Boolean);
  const el=document.getElementById('wi-recent-list');
  if(el)el.innerHTML=rows.length?rows.map(r=>`<div class="wi-recent-row ${r.tone}"><span><i data-lucide="${r.icon}"></i></span><div><strong>${r.title}</strong><small>${r.sub}</small></div></div>`).join(''):`<div class="wi-recent-empty">No high-priority intelligence to surface right now.</div>`;
}
function askWindmill(event){
  event.preventDefault();
  const input=document.getElementById('wi-question');
  const q=String(input?.value||'').trim();
  if(!q)return;
  wiHandleQuestion(q);
}
function wiAskPreset(q){
  const input=document.getElementById('wi-question');
  if(input)input.value=q;
  wiHandleQuestion(q);
}
function wiHandleQuestion(question){
  const q=String(question||'').toLowerCase();
  if(/revenue|money|commercial|protect|payment/.test(q))return aiRevenueRisk();
  if(/follow|enquir|sales|lead|opportun/.test(q))return aiFollowups();
  if(/wedding|bride|groom|planning risk/.test(q))return aiWeddingRisks();
  if(/meeting/.test(q))return aiTodayMeetings();
  if(/week|schedule|calendar/.test(q))return aiWeekSchedule();
  if(/today|focus|priority|first/.test(q))return wiShowToday();
  if(/email|draft/.test(q))return aiFollowupEmail();
  showAIResult('Windmill Intelligence',`<div class="wi-answer-copy"><p>I can currently analyse the CRM data for <strong>today’s priorities, revenue/payment risk, enquiry follow-ups, weddings, meetings and this week’s schedule</strong>.</p><p class="mt-2">Try asking “What should I focus on today?” or choose one of the shortcuts above.</p></div>`);
}
function wiOpenEnquiry(id){
  toggleAI();
  if(typeof viewEnquiry==='function')viewEnquiry(id);
}
function wiShowToday(){
  const s=wiSnapshot();
  const rows=[
    ...s.priorityPayment?[{title:`Payment: ${s.priorityPayment.client||'Customer'}`,sub:`${wiMoney(s.priorityPayment.finalBalance||0)} overdue · ${s.priorityPayment.deadline||''}`,value:Number(s.priorityPayment.finalBalance||0),type:'Payment'}]:[],
    ...s.dueEnquiries.map(e=>({title:e.name||'Enquiry',sub:`${e.status||'Enquiry'} · ${e.nextFollowup||'Due today'}`,value:wiCommercialValue(e),type:'Enquiry',id:e.id})),
    ...s.dueOps.slice(0,5).map(o=>({title:o.title,sub:`${o.department||'Operations'} · ${o.owner||'Unassigned'}`,value:Number(o.value||0),type:'Task'}))
  ].sort((a,b)=>b.value-a.value).slice(0,7);
  showAIResult("Today's recommended order",rows.length?rows.map((r,i)=>`<div class="wi-action-row"><b>${i+1}</b><div><strong>${esc(r.title)}</strong><small>${esc(r.sub)}</small></div>${r.value?`<em>${wiMoney(r.value)}</em>`:''}${r.type==='Enquiry'&&r.id?`<button onclick="wiOpenEnquiry('${r.id}')">Open</button>`:''}</div>`).join(''):`<div class="wi-answer-copy">No due commercial or operational work was found in the currently loaded records.</div>`);
}
function aiRevenueRisk(){
  const s=wiSnapshot();
  const rows=[
    ...s.overduePayments.map(p=>({type:'Payment',name:p.client||'Customer',sub:`Deadline ${p.deadline||'overdue'}`,value:Number(p.finalBalance||p.outstanding||0)})),
    ...s.dueEnquiries.map(e=>({type:'Enquiry',name:e.name||'Enquiry',sub:`${e.status||'Open'} · ${e.nextFollowup||'due'}`,value:wiCommercialValue(e),id:e.id}))
  ].sort((a,b)=>b.value-a.value);
  showAIResult('Commercial value needing action',rows.length?rows.map(r=>`<div class="wi-action-row"><span class="wi-type">${r.type}</span><div><strong>${esc(r.name)}</strong><small>${esc(r.sub)}</small></div><em>${wiMoney(r.value)}</em>${r.id?`<button onclick="wiOpenEnquiry('${r.id}')">Open</button>`:''}</div>`).join(''):`<div class="wi-answer-copy">No overdue payment or due-enquiry commercial value is currently flagged.</div>`);
}
function aiFollowups(){
  const items=wiDueEnquiries().sort((a,b)=>wiCommercialValue(b)-wiCommercialValue(a));
  showAIResult('Enquiry follow-ups due',items.length?items.map(e=>`<div class="wi-action-row"><span class="wi-type">Enquiry</span><div><strong>${esc(e.name)}</strong><small>${esc(e.nextFollowup||'Due')} · ${esc(e.status||'Open')} · ${esc(e.staff||e.owner||'Unassigned')}</small></div>${wiCommercialValue(e)?`<em>${wiMoney(wiCommercialValue(e))}</em>`:''}<button onclick="wiOpenEnquiry('${e.id}')">Open</button></div>`).join(''):'<div class="wi-answer-copy">No enquiry follow-ups are due today or overdue.</div>');
}
function aiOverduePayments(){
  const items=wiOverduePayments();
  showAIResult('Overdue payments',items.length?items.map(p=>`<div class="wi-action-row"><span class="wi-type">Payment</span><div><strong>${esc(p.client||'Customer')}</strong><small>Deadline ${esc(p.deadline||'overdue')}</small></div><em>${wiMoney(p.finalBalance||p.outstanding||0)}</em></div>`).join(''):'<div class="wi-answer-copy">No overdue payments are currently loaded.</div>');
}
function aiTodayMeetings(){
  const items=(DB.meetings||[]).filter(m=>m.date===todayStr);
  showAIResult("Today's meetings",items.length?items.map(m=>`<div class="wi-action-row"><span class="wi-type">Meeting</span><div><strong>${esc(m.client||m.title||'Meeting')}</strong><small>${esc(m.time||'')} · ${esc(m.type||'')} · ${esc(m.staff||'')}</small></div></div>`).join(''):'<div class="wi-answer-copy">No meetings are scheduled today in the currently loaded records.</div>');
}
function aiWeekSchedule(){
  const end=new Date();end.setDate(end.getDate()+7);const endStr=end.toISOString().slice(0,10);
  const events=(DB.events||[]).filter(e=>e.date>=todayStr&&e.date<=endStr).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  showAIResult('Next 7 days',events.length?events.map(e=>`<div class="wi-action-row"><span class="wi-type">${esc(e.date||'')}</span><div><strong>${esc(e.title||'Event')}</strong><small>${esc(e.time||'')} ${esc(e.type||'')}</small></div></div>`).join(''):'<div class="wi-answer-copy">Nothing is listed in the general events feed for the next 7 days.</div>');
}
function aiFollowupEmail(){
  const e=wiDueEnquiries()[0];
  if(!e)return showAIResult('Follow-up email','<div class="wi-answer-copy">No due enquiry is available to draft from.</div>');
  showAIResult(`Draft follow-up · ${esc(e.name)}`,`<div class="wi-email-draft"><small>TO</small><strong>${esc(e.email||'Email not recorded')}</strong><small>SUBJECT</small><strong>Following up on your ${esc(e.eventType||'event')} enquiry at Windmill Farm</strong><p>Hi ${esc(String(e.name||'there').split(' ')[0])},</p><p>I just wanted to follow up regarding your ${esc(e.eventType||'event')} enquiry${e.preferredDate?` for ${esc(e.preferredDate)}`:''}. We'd love to help with your plans and answer any questions you may have.</p><p>Would you like to arrange a viewing or have a quick chat about the options available?</p><p>Kind regards,<br>${esc(e.staff||wiFirstName())}<br>Windmill Farm</p></div>`);
}
function aiUpcomingWeddings(){
  const items=wiUpcomingWeddings(42);
  showAIResult('Weddings in the next 6 weeks',items.length?items.map(w=>`<div class="wi-action-row"><span class="wi-type">Wedding</span><div><strong>${esc(w.couple||'Wedding')}</strong><small>${esc(w.date||'')} · ${Number(w.dayGuests||0)} day guests · ${esc(w.package||'Package TBC')}</small></div><button onclick="toggleAI();openWeddingWorkspace('${w.id}')">Open</button></div>`).join(''):'<div class="wi-answer-copy">No weddings are currently listed in the next 6 weeks.</div>');
}
function aiWeddingRisks(){
  const items=wiWeddingRiskRows();
  showAIResult('Wedding planning risks',items.length?items.map(x=>`<div class="wi-action-row"><span class="wi-type">Wedding</span><div><strong>${esc(x.w.couple||'Wedding')}</strong><small>${esc(x.w.date||'')} · ${x.progress}% planning · ${x.overdue} overdue action${x.overdue===1?'':'s'}</small></div><button onclick="toggleAI();openWeddingWorkspace('${x.w.id}','planning')">Review</button></div>`).join(''):'<div class="wi-answer-copy">No obvious wedding planning risks were detected from the currently loaded records.</div>');
}
function showAIResult(title,html){
  const el=document.getElementById('ai-result');
  if(!el)return;
  el.dataset.keep='1';
  el.innerHTML=`<div class="wi-result-card"><div class="wi-result-head"><div><small>WINDMILL RESPONSE</small><h4>${title}</h4></div><button onclick="document.getElementById('ai-result').innerHTML='';delete document.getElementById('ai-result').dataset.keep"><i data-lucide="x"></i></button></div><div class="wi-result-body">${html}</div></div>`;
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
  if(window.lucide)lucide.createIcons();
}




// Force the dedicated implementation to own the panel after every legacy script loads.
window.addEventListener('load',()=>{
  setTimeout(()=>{
    const p=document.getElementById('ai-panel');
    if(p){
      p.classList.remove('translate-x-full');
      p.classList.add('wi-ready');
      // keep closed until user opens it
      p.classList.remove('open');
    }
    try{ renderAIPrompts(); }catch(e){ console.warn('Windmill Intelligence prompt init',e); }
    if(window.lucide)lucide.createIcons();
  },250);
});
