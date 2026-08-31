// SALES OS 2.0 — PHASE 7: PERFORMANCE, COACHING & GAMIFICATION
(function(){
  SalesOS.performanceMode=localStorage.getItem('windmill_sales_performance_mode')||'results';
  SalesOS.performancePeriod=localStorage.getItem('windmill_sales_performance_period')||'week';

  SalesOS.setPerformanceMode=function(mode){
    SalesOS.performanceMode=mode;
    localStorage.setItem('windmill_sales_performance_mode',mode);
    SalesOS.setView('performance');
  };
  SalesOS.setPerformancePeriod=function(period){
    SalesOS.performancePeriod=period;
    localStorage.setItem('windmill_sales_performance_period',period);
    SalesOS.setView('performance');
  };

  SalesOS.startOfWeek=function(){
    const d=new Date(currentDateStr()+'T12:00:00'),day=(d.getDay()+6)%7;
    d.setDate(d.getDate()-day);
    return d.toISOString().slice(0,10);
  };
  SalesOS.periodStart=function(period=SalesOS.performancePeriod){
    if(period==='all')return '1900-01-01';
    if(period==='30')return salesAddDays(currentDateStr(),-29);
    return SalesOS.startOfWeek();
  };
  SalesOS.withinPerformancePeriod=function(date,period=SalesOS.performancePeriod){
    const d=String(date||'').slice(0,10);
    return !!d&&d>=SalesOS.periodStart(period)&&d<=currentDateStr();
  };
  SalesOS.ownerNames=function(){
    return [...new Set([
      ...(DB.salesLeads||[]).map(x=>x.assignedTo),
      ...(DB.salesActivities||[]).map(x=>x.staff),
      ...(DB.opportunities||[]).map(x=>x.assignedTo),
      ...(DB.opportunityActivities||[]).map(x=>x.staff)
    ].filter(Boolean))].sort();
  };
  SalesOS.isConversation=function(a){
    return /spoke to reception|found decision maker|spoke to decision maker|information requested|interested|meeting booked|proposal required|proposal sent|negotiating|converted/i.test(String(a?.outcome||''));
  };
  SalesOS.isDecisionMakerReached=function(a){
    return /found decision maker|spoke to decision maker|information requested|interested|meeting booked|proposal required|proposal sent|negotiating|converted/i.test(String(a?.outcome||''));
  };
  SalesOS.isMeetingCreated=function(a){
    return /meeting booked/i.test(String(a?.outcome||''))||/meeting|visit/i.test(String(a?.type||''));
  };
  SalesOS.isProposalCreated=function(a){
    return /proposal required|proposal sent/i.test(String(a?.outcome||''));
  };

  SalesOS.performanceOwner=function(owner,period=SalesOS.performancePeriod){
    const leadActs=(DB.salesActivities||[]).filter(a=>a.staff===owner&&SalesOS.withinPerformancePeriod(a.date,period));
    const oppActs=(DB.opportunityActivities||[]).filter(a=>a.staff===owner&&SalesOS.withinPerformancePeriod(a.date,period));
    const leads=(DB.salesLeads||[]).filter(l=>l.assignedTo===owner);
    const opps=(DB.opportunities||[]).filter(o=>o.assignedTo===owner);
    const createdOpps=opps.filter(o=>SalesOS.withinPerformancePeriod(o.createdAt,period));
    const calls=leadActs.filter(SalesOS.isCall).length;
    const conversations=leadActs.filter(SalesOS.isConversation).length;
    const decisionMakers=leadActs.filter(SalesOS.isDecisionMakerReached).length;
    const meetings=leadActs.filter(SalesOS.isMeetingCreated).length;
    const proposals=leadActs.filter(SalesOS.isProposalCreated).length+
      oppActs.filter(a=>/proposal sent/i.test(String(a.outcome||''))).length;
    const wins=opps.filter(o=>o.stage==='Won'&&SalesOS.withinPerformancePeriod(o.wonDate||o.lastActivity||o.createdAt,period));
    const pipelineCreated=createdOpps.reduce((s,o)=>s+Number(o.value||0),0);
    const revenueWon=wins.reduce((s,o)=>s+Number(o.value||0),0);
    const activePipeline=opps.filter(o=>!['Won','Lost'].includes(o.stage)).reduce((s,o)=>s+Number(o.value||0),0);
    const overdue=leads.filter(l=>activeSalesLead(l)&&salesLeadOverdue(l)).length+
      opps.filter(o=>!['Won','Lost'].includes(o.stage)&&o.nextFollowup&&o.nextFollowup<currentDateStr()).length;
    const noAction=leads.filter(l=>activeSalesLead(l)&&(!l.nextAction||!l.nextFollowup)).length+
      opps.filter(o=>!['Won','Lost'].includes(o.stage)&&(!o.nextAction||!o.nextFollowup)).length;
    const callToConversation=calls?conversations/calls*100:0;
    const conversationToDM=conversations?decisionMakers/conversations*100:0;
    const dmToMeeting=decisionMakers?meetings/decisionMakers*100:0;
    const meetingToProposal=meetings?proposals/meetings*100:0;
    const proposalToWin=proposals?wins.length/proposals*100:0;
    const points=
      calls*1+
      conversations*3+
      decisionMakers*5+
      meetings*10+
      proposals*15+
      wins.length*25+
      Math.min(40,Math.floor(pipelineCreated/1000)*2);
    return {
      owner,leadActs,oppActs,leads,opps,calls,conversations,decisionMakers,meetings,proposals,
      wins:wins.length,pipelineCreated,revenueWon,activePipeline,overdue,noAction,
      callToConversation,conversationToDM,dmToMeeting,meetingToProposal,proposalToWin,points
    };
  };

  SalesOS.performanceRows=function(period=SalesOS.performancePeriod){
    return SalesOS.ownerNames().map(o=>SalesOS.performanceOwner(o,period))
      .sort((a,b)=>b.revenueWon-a.revenueWon||b.pipelineCreated-a.pipelineCreated||b.points-a.points);
  };

  SalesOS.performanceTotals=function(rows){
    const keys=['calls','conversations','decisionMakers','meetings','proposals','wins','pipelineCreated','revenueWon','activePipeline','overdue','noAction'];
    const t={};keys.forEach(k=>t[k]=rows.reduce((s,r)=>s+Number(r[k]||0),0));
    return t;
  };

  SalesOS.coachingForRow=function(r){
    const strengths=[],focus=[];
    if(r.calls>=5&&r.callToConversation>=40)strengths.push('Strong call → conversation conversion');
    if(r.conversations>=3&&r.conversationToDM>=60)strengths.push('Good decision-maker penetration');
    if(r.decisionMakers>=2&&r.dmToMeeting>=40)strengths.push('Converts authority into meetings');
    if(r.meetings>=2&&r.meetingToProposal>=50)strengths.push('Good meeting → proposal progression');
    if(r.proposals>=1&&r.proposalToWin>=30)strengths.push('Strong closing performance');
    if(r.pipelineCreated>=5000)strengths.push('Creating meaningful pipeline');

    if(r.calls>=8&&r.callToConversation<25)focus.push('Call quality / targeting: too many attempts are not becoming conversations.');
    if(r.conversations>=3&&r.conversationToDM<40)focus.push('Authority: too many conversations stop before reaching the decision maker.');
    if(r.decisionMakers>=2&&r.dmToMeeting<30)focus.push('Advance the sale: ask more directly for a venue visit, trial or meeting.');
    if(r.meetings>=2&&r.meetingToProposal<40)focus.push('Qualification: meetings are not becoming commercial proposals.');
    if(r.proposals>=2&&r.proposalToWin<25)focus.push('Closing: agree decision dates and diagnose proposal blockers earlier.');
    if(r.overdue>0)focus.push(`Control: clear ${r.overdue} overdue item${r.overdue===1?'':'s'} before creating more low-quality activity.`);
    if(r.noAction>0)focus.push(`Discipline: ${r.noAction} live item${r.noAction===1?' has':'s have'} no complete next action.`);
    if(!strengths.length)strengths.push('Insufficient evidence yet — build a consistent activity sample.');
    if(!focus.length)focus.push('Maintain quality and increase the volume of strategic accounts worked.');
    return {strengths,focus};
  };

  SalesOS.managerInterventions=function(){
    const interventions=[];
    (DB.salesLeads||[]).filter(activeSalesLead).forEach(lead=>{
      const value=Number(lead.annualPotential||lead.potentialValue||0);
      if(value>=5000&&salesLeadOverdue(lead))
        interventions.push({severity:3,value,title:`${lead.companyName}: high-value relationship overdue`,detail:`${SalesOS.money(value)} potential needs immediate recovery.`,leadId:lead.id});
      if(value>=5000&&!lead.decisionMaker)
        interventions.push({severity:2,value,title:`${lead.companyName}: value without authority`,detail:'High potential is recorded but no decision maker is confirmed.',leadId:lead.id});
      if(['Hot','Strategic'].includes(lead.relationship)&&(!lead.nextAction||!lead.nextFollowup))
        interventions.push({severity:3,value,title:`${lead.companyName}: hot account uncontrolled`,detail:'Momentum can disappear because no dated next commitment is recorded.',leadId:lead.id});
    });
    (DB.opportunities||[]).filter(o=>!['Won','Lost'].includes(o.stage)).forEach(o=>{
      const strength=window.SalesOS?.opportunityStrength?SalesOS.opportunityStrength(o):{score:0,label:'Unknown'};
      if(Number(o.value||0)>=5000&&strength.score<50)
        interventions.push({severity:3,value:Number(o.value||0),title:`${o.title}: weak evidence behind the pipeline`,detail:`${SalesOS.money(o.value)} opportunity has Deal Strength ${strength.score}/100.`,opportunityId:o.id});
      if(o.stage==='Proposal Sent'&&o.nextFollowup&&o.nextFollowup<currentDateStr())
        interventions.push({severity:3,value:Number(o.value||0),title:`${o.title}: proposal follow-up overdue`,detail:'A proposal is waiting without controlled progression.',opportunityId:o.id});
    });
    return interventions.sort((a,b)=>b.severity-a.severity||b.value-a.value);
  };

  SalesOS.badgesForRow=function(r,rows){
    const badges=[];
    const max=(key)=>Math.max(0,...rows.map(x=>Number(x[key]||0)));
    if(r.pipelineCreated>0&&r.pipelineCreated===max('pipelineCreated'))badges.push(['Pipeline Creator','trending-up','Created the most qualified pipeline']);
    if(r.meetings>0&&r.meetings===max('meetings'))badges.push(['Meeting Machine','calendar-check','Created the most meetings / visits']);
    if(r.decisionMakers>0&&r.decisionMakers===max('decisionMakers'))badges.push(['Authority Hunter','user-check','Reached the most decision makers']);
    if(r.revenueWon>0&&r.revenueWon===max('revenueWon'))badges.push(['Closer','trophy','Won the most opportunity value']);
    if(r.overdue===0&&r.noAction===0&&(r.calls+r.conversations+r.meetings)>0)badges.push(['Controlled','shield-check','No overdue or uncontrolled live items']);
    return badges;
  };

  SalesOS.renderPerformanceResults=function(){
    const rows=SalesOS.performanceRows(),t=SalesOS.performanceTotals(rows);
    const funnel=[
      ['Calls',t.calls],['Conversations',t.conversations],['Decision Makers',t.decisionMakers],
      ['Meetings',t.meetings],['Proposals',t.proposals],['Wins',t.wins]
    ];
    const max=Math.max(1,...funnel.map(x=>x[1]));
    return `<div class="space-y-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${SalesOS.kpi('Pipeline Created',SalesOS.money(t.pipelineCreated),'Created in selected period','trending-up','green')}
        ${SalesOS.kpi('Revenue Won',SalesOS.money(t.revenueWon),'Formal opportunities recorded Won','trophy','gold')}
        ${SalesOS.kpi('Active Pipeline',SalesOS.money(t.activePipeline),'Current owned opportunities','chart-no-axes-combined','blue')}
        ${SalesOS.kpi('Control Issues',t.overdue+t.noAction,`${t.overdue} overdue · ${t.noAction} no next action`,'shield-alert',t.overdue+t.noAction?'red':'green')}
      </div>
      <section class="bg-white rounded-2xl border p-5"><div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">SALES FUNNEL</p><h3 class="font-bold text-xl">Are activities becoming revenue?</h3></div></div>
        <div class="grid md:grid-cols-6 gap-2 mt-4">${funnel.map(([label,count],i)=>{const prev=i?funnel[i-1][1]:null;const conv=prev?Math.round(count/prev*100):100;return `<div class="rounded-xl border p-3"><p class="text-[10px] text-gray-500">${label}</p><strong class="text-2xl block">${count}</strong>${i?`<span class="text-[10px] ${conv>=40?'text-green-700':'text-amber-700'}">${conv}% from prior</span>`:'<span class="text-[10px] text-gray-400">Top of funnel</span>'}<div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2"><div class="h-full bg-olive-600" style="width:${count/max*100}%"></div></div></div>`}).join('')}</div>
      </section>
      <section class="bg-white rounded-2xl border overflow-hidden"><div class="p-5 border-b"><p class="text-[10px] font-bold tracking-widest text-olive-700">TEAM CONVERSION</p><h3 class="font-bold text-xl">Quality, not just call volume</h3></div>
        <div class="overflow-x-auto"><table class="w-full text-xs min-w-[1100px]"><thead><tr class="text-left text-gray-500"><th class="p-3">Team member</th><th class="text-right">Calls</th><th class="text-right">Conversations</th><th class="text-right">DM reached</th><th class="text-right">Meetings</th><th class="text-right">Proposals</th><th class="text-right">Wins</th><th class="text-right">Pipeline</th><th class="text-right">Won</th><th class="text-right">Points</th></tr></thead><tbody>${rows.map(r=>`<tr class="border-t"><td class="p-3 font-bold">${esc(r.owner)}</td><td class="text-right">${r.calls}</td><td class="text-right">${r.conversations}<small class="block text-gray-400">${Math.round(r.callToConversation)}%</small></td><td class="text-right">${r.decisionMakers}<small class="block text-gray-400">${Math.round(r.conversationToDM)}%</small></td><td class="text-right">${r.meetings}<small class="block text-gray-400">${Math.round(r.dmToMeeting)}%</small></td><td class="text-right">${r.proposals}<small class="block text-gray-400">${Math.round(r.meetingToProposal)}%</small></td><td class="text-right">${r.wins}<small class="block text-gray-400">${Math.round(r.proposalToWin)}%</small></td><td class="text-right">${SalesOS.money(r.pipelineCreated)}</td><td class="text-right font-bold">${SalesOS.money(r.revenueWon)}</td><td class="text-right font-bold">${r.points}</td></tr>`).join('')}</tbody></table></div>
      </section>
    </div>`;
  };

  SalesOS.renderPerformanceCoaching=function(){
    const rows=SalesOS.performanceRows(),interventions=SalesOS.managerInterventions();
    return `<div class="grid xl:grid-cols-[1fr_.9fr] gap-4">
      <div class="space-y-4">${rows.map(r=>{const c=SalesOS.coachingForRow(r);return `<section class="bg-white rounded-2xl border p-5"><div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">COACHING · ${esc(r.owner).toUpperCase()}</p><h3 class="font-bold text-xl">${SalesOS.money(r.pipelineCreated)} pipeline created</h3></div><span class="badge ${r.overdue||r.noAction?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}">${r.overdue+r.noAction?'Needs control':'Controlled'}</span></div><div class="grid md:grid-cols-2 gap-3 mt-4"><div class="rounded-xl bg-green-50 border border-green-100 p-4"><p class="text-[10px] font-bold text-green-700">STRENGTHS</p><ul class="text-sm mt-2 space-y-2">${c.strengths.map(x=>`<li>✓ ${esc(x)}</li>`).join('')}</ul></div><div class="rounded-xl bg-amber-50 border border-amber-100 p-4"><p class="text-[10px] font-bold text-amber-700">COACH NEXT</p><ul class="text-sm mt-2 space-y-2">${c.focus.map(x=>`<li>→ ${esc(x)}</li>`).join('')}</ul></div></div></section>`}).join('')||'<div class="bg-white border rounded-2xl p-8 text-center text-gray-400">No owned sales activity yet.</div>'}</div>
      <div class="space-y-4"><section class="bg-charcoal-900 text-white rounded-2xl p-5"><p class="text-[10px] font-bold tracking-widest text-red-200">MANAGER INTERVENTION</p><h3 class="font-bold text-xl mt-1">${interventions.length} items deserve management attention</h3><p class="text-xs text-white/60 mt-2">These are high-value or high-risk situations where coaching or direct support may materially improve the outcome.</p></section>
      <div class="space-y-2">${interventions.slice(0,12).map(i=>`<article class="bg-white border ${i.severity===3?'border-red-200':'border-amber-200'} rounded-xl p-4"><strong class="text-sm">${esc(i.title)}</strong><p class="text-xs text-gray-500 mt-1">${esc(i.detail)}</p><button onclick="${i.leadId?`SalesOS.openAccount360('${i.leadId}')`:`viewOpportunity('${i.opportunityId}')`}" class="mt-3 text-xs font-bold text-olive-700">Open →</button></article>`).join('')||'<div class="bg-green-50 border border-green-200 rounded-xl p-5 text-green-800">No immediate management interventions found.</div>'}</div></div>
    </div>`;
  };

  SalesOS.renderPerformanceGame=function(){
    const rows=SalesOS.performanceRows();
    return `<div class="space-y-4"><section class="rounded-2xl bg-gradient-to-r from-charcoal-900 to-amber-800 text-white p-5"><p class="text-[10px] font-bold tracking-widest text-gold-200">COMMERCIAL SCOREBOARD</p><h3 class="text-2xl font-bold mt-1">Reward outcomes, not pointless activity.</h3><p class="text-sm text-white/70 mt-2">Points recognise conversations, decision makers, meetings, proposals, wins and qualified pipeline. Calls alone are deliberately worth very little.</p></section>
      <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">${rows.map((r,i)=>{const badges=SalesOS.badgesForRow(r,rows);return `<article class="bg-white rounded-2xl border p-5"><div class="flex justify-between"><div><p class="text-xs text-gray-500">#${i+1}</p><h3 class="font-bold text-xl">${esc(r.owner)}</h3></div><div class="w-14 h-14 rounded-full ${i===0?'bg-gold-500 text-white':'bg-olive-100 text-olive-800'} flex items-center justify-center font-bold">${r.points}</div></div><p class="text-xs text-gray-500 mt-3">${SalesOS.money(r.pipelineCreated)} pipeline · ${SalesOS.money(r.revenueWon)} won</p><div class="flex flex-wrap gap-2 mt-4">${badges.length?badges.map(([name,icon,detail])=>`<span title="${esc(detail)}" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold-50 text-amber-800 text-[10px] font-bold"><i data-lucide="${icon}" style="width:12px;height:12px"></i>${esc(name)}</span>`).join(''):'<span class="text-xs text-gray-400">Build outcomes to unlock achievements.</span>'}</div></article>`}).join('')||'<div class="bg-white rounded-2xl border p-8 text-center text-gray-400">No scoreboard data yet.</div>'}</div>
      <section class="bg-white border rounded-2xl p-5"><p class="text-[10px] font-bold tracking-widest text-olive-700">POINTS LOGIC</p><div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 mt-3">${[['Call','+1'],['Conversation','+3'],['Decision Maker','+5'],['Meeting','+10'],['Proposal','+15'],['Win','+25'],['Pipeline','+2 / £1k']].map(([a,b])=>`<div class="rounded-xl bg-cream-50 p-3 text-center"><small class="text-gray-500">${a}</small><strong class="block">${b}</strong></div>`).join('')}</div><p class="text-[11px] text-gray-400 mt-3">Pipeline points are capped so one large speculative deal cannot dominate the board.</p></section>
    </div>`;
  };

  SalesOS.renderWeeklyReview=function(){
    const rows=SalesOS.performanceRows('week'),t=SalesOS.performanceTotals(rows),interventions=SalesOS.managerInterventions();
    const wins=(DB.opportunities||[]).filter(o=>o.stage==='Won'&&SalesOS.withinPerformancePeriod(o.wonDate||o.lastActivity||o.createdAt,'week'));
    const created=(DB.opportunities||[]).filter(o=>SalesOS.withinPerformancePeriod(o.createdAt,'week'));
    const weakest=[
      ['Call → conversation',t.calls?Math.round(t.conversations/t.calls*100):0],
      ['Conversation → decision maker',t.conversations?Math.round(t.decisionMakers/t.conversations*100):0],
      ['Decision maker → meeting',t.decisionMakers?Math.round(t.meetings/t.decisionMakers*100):0],
      ['Meeting → proposal',t.meetings?Math.round(t.proposals/t.meetings*100):0],
      ['Proposal → win',t.proposals?Math.round(t.wins/t.proposals*100):0]
    ].sort((a,b)=>a[1]-b[1])[0];
    return `<div class="space-y-4">
      <section class="bg-charcoal-900 text-white rounded-2xl p-5 lg:p-7"><p class="text-[10px] font-bold tracking-widest text-olive-200">WEEKLY SALES REVIEW</p><h2 class="text-3xl font-bold mt-1">What did we create, move, win and nearly lose?</h2><p class="text-sm text-white/60 mt-2">Use this in the management review. It is designed to create coaching actions, not just admire numbers.</p></section>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${SalesOS.kpi('Pipeline Created',SalesOS.money(t.pipelineCreated),`${created.length} opportunities created`,'trending-up','green')}${SalesOS.kpi('Revenue Won',SalesOS.money(t.revenueWon),`${wins.length} formal wins`,'trophy','gold')}${SalesOS.kpi('Meetings',t.meetings,'Created from proactive activity','calendar-check','blue')}${SalesOS.kpi('Interventions',interventions.length,'Current management risks','shield-alert',interventions.length?'red':'green')}</div>
      <div class="grid xl:grid-cols-2 gap-4">
        <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-green-700">THIS WEEK'S WINS</p><div class="space-y-2 mt-3">${wins.length?wins.map(o=>`<div class="rounded-xl bg-green-50 border border-green-100 p-3 flex justify-between gap-3"><span><strong>${esc(o.title)}</strong><small class="block text-gray-500">${esc(o.assignedTo||'Unassigned')}</small></span><strong>${SalesOS.money(o.value)}</strong></div>`).join(''):'<p class="text-sm text-gray-400">No formal opportunity wins recorded this week.</p>'}</div></section>
        <section class="bg-white rounded-2xl border p-5"><p class="text-[10px] font-bold tracking-widest text-amber-700">COACHING QUESTION</p><h3 class="font-bold text-xl mt-2">Weakest funnel step: ${esc(weakest[0])}</h3><p class="text-3xl font-bold mt-2">${weakest[1]}%</p><p class="text-sm text-gray-500 mt-3">Ask the team why prospects are falling out at this exact point. Review one or two real accounts rather than giving generic sales advice.</p></section>
      </div>
      ${window.SalesOS?.renderAttributionControl?SalesOS.renderAttributionControl():''}
      <section class="bg-white rounded-2xl border overflow-hidden"><div class="p-5 border-b"><p class="text-[10px] font-bold tracking-widest text-olive-700">NEXT WEEK'S MANAGEMENT FOCUS</p><h3 class="font-bold text-xl">The actions worth discussing</h3></div><div class="divide-y">${interventions.slice(0,8).map(i=>`<div class="p-4 flex justify-between gap-4"><div><strong>${esc(i.title)}</strong><p class="text-xs text-gray-500 mt-1">${esc(i.detail)}</p></div><button onclick="${i.leadId?`SalesOS.openAccount360('${i.leadId}')`:`viewOpportunity('${i.opportunityId}')`}" class="text-xs font-bold text-olive-700">Review</button></div>`).join('')||'<div class="p-6 text-center text-green-700">No high-priority intervention items.</div>'}</div></section>
    </div>`;
  };

  SalesOS.renderPerformanceHQ=function(){
    const mode=SalesOS.performanceMode;
    const modes=[['results','Results','chart-no-axes-combined'],['coaching','Coaching','messages-square'],['scoreboard','Scoreboard','medal'],['review','Weekly Review','clipboard-check'],['playbooks','Playbooks','graduation-cap']];
    const periodButtons=['review','playbooks'].includes(mode)?'':`<div class="flex gap-1">${[['week','This Week'],['30','30 Days'],['all','All Time']].map(([id,label])=>`<button onclick="SalesOS.setPerformancePeriod('${id}')" class="px-3 py-2 rounded-lg text-xs font-bold ${SalesOS.performancePeriod===id?'bg-olive-700 text-white':'bg-gray-100 text-gray-600'}">${label}</button>`).join('')}</div>`;
    const body=mode==='coaching'?SalesOS.renderPerformanceCoaching():mode==='scoreboard'?SalesOS.renderPerformanceGame():mode==='review'?SalesOS.renderWeeklyReview():mode==='playbooks'?SalesOS.renderAcademy():SalesOS.renderPerformanceResults();
    return `<div class="space-y-4"><section class="rounded-3xl bg-gradient-to-r from-charcoal-900 via-[#35412f] to-olive-800 text-white p-5 lg:p-7"><div class="flex flex-col xl:flex-row xl:items-end justify-between gap-4"><div><p class="text-xs font-bold tracking-[.18em] text-gold-300">PERFORMANCE · SALES COACH</p><h2 class="text-2xl lg:text-4xl font-bold mt-1">Make the team better every week.</h2><p class="text-sm text-white/70 mt-2">Measure the chain from activity to revenue, then coach the weakest conversion point.</p></div>${periodButtons}</div></section><section class="bg-white border rounded-2xl p-2 overflow-x-auto"><div class="flex min-w-max gap-1">${modes.map(([id,label,icon])=>`<button onclick="SalesOS.setPerformanceMode('${id}')" class="px-3 py-2.5 rounded-xl text-xs font-bold ${mode===id?'bg-charcoal-900 text-white':'text-gray-600 hover:bg-olive-50'}"><i data-lucide="${icon}" style="width:15px;height:15px" class="inline mr-1"></i>${label}</button>`).join('')}</div></section>${body}</div>`;
  };
})();
