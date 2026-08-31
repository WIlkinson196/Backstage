// SALES OS 2.0 — PHASE 4: QUALIFICATION + OPPORTUNITY DISCIPLINE
(function(){
  const META_START='--- SALES OS OPPORTUNITY META ---';
  const META_END='--- END SALES OS OPPORTUNITY META ---';

  SalesOS.opportunityMeta=function(opportunity){
    const text=String(opportunity?.notes||'');
    const m=text.match(/--- SALES OS OPPORTUNITY META ---\s*([\s\S]*?)\s*--- END SALES OS OPPORTUNITY META ---/i);
    if(!m)return {};
    try{return JSON.parse(m[1])||{};}catch(_){return {};}
  };

  SalesOS.cleanOpportunityNotes=function(notes){
    return String(notes||'').replace(/--- SALES OS OPPORTUNITY META ---\s*[\s\S]*?\s*--- END SALES OS OPPORTUNITY META ---/ig,'').trim();
  };

  SalesOS.packOpportunityNotes=function(notes,meta){
    return [String(notes||'').trim(),META_START,JSON.stringify(meta),META_END].filter(Boolean).join('\n\n');
  };

  SalesOS.leadQualificationSnapshot=function(lead){
    const text=String(lead?.notes||'');
    const sessions=[...text.matchAll(/--- SALES OS 2 SESSION ---([\s\S]*?)--- END SALES OS 2 SESSION ---/gi)];
    const latest=sessions.length?sessions[sessions.length-1][1]:'';
    const getSection=name=>{
      if(!latest)return '';
      const re=new RegExp(`${name}\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z ]+\\n|$)`,'i');
      return latest.match(re)?.[1]?.trim()||'';
    };
    const qualification={};
    getSection('QUALIFICATION').split('\n').map(x=>x.replace(/^•\s*/,'').trim()).filter(Boolean).forEach(line=>{
      const i=line.indexOf(':');if(i<0)return;
      qualification[line.slice(0,i).trim()]=/yes/i.test(line.slice(i+1));
    });
    const discovery={};
    getSection('DISCOVERY ANSWERS').split('\n').map(x=>x.replace(/^•\s*/,'').trim()).filter(Boolean).forEach(line=>{
      const i=line.indexOf(':');if(i<0)return;
      discovery[line.slice(0,i).trim()]=line.slice(i+1).trim();
    });
    return {qualification,discovery};
  };

  SalesOS.frequencyMultiplier=function(freq){
    return {'One-off':1,'Monthly':12,'Every 6 weeks':8,'Quarterly':4,'Biannual':2,'Annual':1}[freq]||1;
  };

  SalesOS.annualise=function(value,frequency,eventsPerYear){
    const count=Number(eventsPerYear||0)||SalesOS.frequencyMultiplier(frequency);
    return Math.round(Number(value||0)*count);
  };

  SalesOS.opportunityStrength=function(opportunity,metaOverride=null){
    const meta=metaOverride||SalesOS.opportunityMeta(opportunity);
    const checks=[
      ['Need confirmed',!!String(meta.need||'').trim(),15],
      ['Decision maker known',!!String(meta.decisionMaker||'').trim(),15],
      ['Value evidenced',Number(opportunity?.value||0)>0,10],
      ['Decision timing known',!!String(meta.decisionDate||opportunity?.expectedClose||'').trim(),12],
      ['Current venue / situation known',!!String(meta.currentVenue||'').trim(),8],
      ['Reason to change known',!!String(meta.reasonToChange||'').trim(),15],
      ['Competition understood',!!String(meta.competition||opportunity?.competitor||'').trim(),8],
      ['Next action controlled',!!(opportunity?.nextAction&&opportunity?.nextFollowup),12],
      ['Buying process known',!!String(meta.buyingProcess||'').trim(),5]
    ];
    const score=checks.reduce((s,[,ok,w])=>s+(ok?w:0),0);
    return {
      score,
      checks,
      label:score>=85?'Strong':score>=70?'Healthy':score>=50?'Developing':score>=30?'Weak':'Unqualified',
      tone:score>=85?'green':score>=70?'olive':score>=50?'amber':'red'
    };
  };

  SalesOS.evidenceProbability=function(stage,strength){
    const base={
      'Qualified':20,'Meeting Booked':35,'Proposal Required':45,'Proposal Sent':55,
      'Negotiation':70,'Verbal Agreement':85,'Deposit Required':92,'Won':100,'Lost':0,'On Hold':15
    }[stage]??20;
    if(['Won','Lost'].includes(stage))return base;
    const adjustment=strength>=85?8:strength>=70?4:strength>=50?0:strength>=30?-8:-15;
    return Math.max(5,Math.min(95,base+adjustment));
  };

  SalesOS.opportunityHealth=function(opportunity){
    const strength=SalesOS.opportunityStrength(opportunity);
    const stored=Number(opportunity.probability||0);
    const evidence=SalesOS.evidenceProbability(opportunity.stage,strength.score);
    const annual=SalesOS.annualise(opportunity.value,SalesOS.opportunityMeta(opportunity).frequency,SalesOS.opportunityMeta(opportunity).eventsPerYear);
    return {strength,evidence,stored,annual};
  };

  SalesOS.renderQualificationFields=function(opportunity,meta={}){
    const lead=(DB.salesLeads||[]).find(l=>SalesOS.accountCompany(l)?.id===opportunity?.companyId);
    const snap=lead?SalesOS.leadQualificationSnapshot(lead):{discovery:{}};
    const d=snap.discovery||{};
    const val=(key,fallback='')=>esc(meta[key]??fallback??'');
    return `<section class="rounded-2xl border border-olive-200 bg-olive-50 p-4">
      <div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">THE WINDMILL 7 · COMMERCIAL QUALIFICATION</p><h3 class="font-bold text-lg mt-1">Evidence before probability</h3></div><span class="text-[10px] font-bold text-olive-700">PERSISTENT</span></div>
      <div class="grid md:grid-cols-2 gap-3 mt-4">
        <label class="text-xs text-gray-600">Need / requirement *<textarea name="qNeed" rows="2" class="mt-1 w-full px-3 py-2 border rounded-lg">${val('need',lead?.servicesNeeded||'')}</textarea></label>
        <label class="text-xs text-gray-600">Decision maker / approver *<input name="qDecisionMaker" value="${val('decisionMaker',lead?.decisionMaker?lead.contactName:'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Current venue / current situation<input name="qCurrentVenue" value="${val('currentVenue',d['Current venue']||d['Current strengths']||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Reason to change / pain *<textarea name="qReasonToChange" rows="2" class="mt-1 w-full px-3 py-2 border rounded-lg">${val('reasonToChange',d['Pain / improvement']||d['Pain / friction']||'')}</textarea></label>
        <label class="text-xs text-gray-600">Buying / approval process<textarea name="qBuyingProcess" rows="2" class="mt-1 w-full px-3 py-2 border rounded-lg">${val('buyingProcess')}</textarea></label>
        <label class="text-xs text-gray-600">Decision date<input type="date" name="qDecisionDate" value="${val('decisionDate',opportunity?.expectedClose||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Competition / other venue<input name="qCompetition" value="${val('competition',opportunity?.competitor||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Decision criteria<input name="qDecisionCriteria" value="${val('decisionCriteria')}" placeholder="Price, location, food, parking, bedrooms, availability…" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      </div>
    </section>`;
  };

  SalesOS.renderRecurringFields=function(opportunity,meta={}){
    return `<section class="rounded-2xl border border-gold-200 bg-gold-50 p-4">
      <p class="text-[10px] font-bold tracking-widest text-amber-700">RECURRING REVENUE</p><h3 class="font-bold text-lg mt-1">One event or a relationship?</h3>
      <div class="grid md:grid-cols-3 gap-3 mt-3">
        <label class="text-xs text-gray-600">Frequency<select name="qFrequency" class="mt-1 w-full px-3 py-2 border rounded-lg">${['One-off','Monthly','Every 6 weeks','Quarterly','Biannual','Annual','Custom'].map(x=>`<option ${meta.frequency===x?'selected':''}>${x}</option>`).join('')}</select></label>
        <label class="text-xs text-gray-600">Expected events / year<input type="number" min="1" max="100" name="qEventsPerYear" value="${Number(meta.eventsPerYear||SalesOS.frequencyMultiplier(meta.frequency||'One-off'))}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <div class="rounded-xl bg-white border p-3"><small class="text-gray-500">Annualised opportunity</small><strong id="sales-os-annualised-preview" class="block text-xl mt-1">${SalesOS.money(SalesOS.annualise(opportunity?.value||0,meta.frequency||'One-off',meta.eventsPerYear))}</strong><span class="text-[10px] text-gray-400">Based on event value × expected events/year</span></div>
      </div>
    </section>`;
  };

  SalesOS.readQualificationForm=function(form){
    const d=new FormData(form);
    return {
      need:String(d.get('qNeed')||'').trim(),
      decisionMaker:String(d.get('qDecisionMaker')||'').trim(),
      currentVenue:String(d.get('qCurrentVenue')||'').trim(),
      reasonToChange:String(d.get('qReasonToChange')||'').trim(),
      buyingProcess:String(d.get('qBuyingProcess')||'').trim(),
      decisionDate:String(d.get('qDecisionDate')||'').trim(),
      competition:String(d.get('qCompetition')||'').trim(),
      decisionCriteria:String(d.get('qDecisionCriteria')||'').trim(),
      frequency:String(d.get('qFrequency')||'One-off'),
      eventsPerYear:Number(d.get('qEventsPerYear')||1),
      updatedAt:new Date().toISOString()
    };
  };

  SalesOS.updateOpportunityEvidence=function(form){
    if(!form)return;
    const fake={
      value:Number(form.value?.value||0),
      stage:form.stage?.value||'Qualified',
      nextAction:form.nextAction?.value||'',
      nextFollowup:form.nextFollowup?.value||'',
      expectedClose:form.expectedClose?.value||'',
      competitor:form.competitor?.value||''
    };
    const meta=SalesOS.readQualificationForm(form);
    const strength=SalesOS.opportunityStrength(fake,meta);
    const probability=SalesOS.evidenceProbability(fake.stage,strength.score);
    if(form.probability)form.probability.value=probability;
    const score=document.getElementById('sales-os-opportunity-strength');
    if(score)score.innerHTML=`<strong class="text-2xl">${strength.score}/100</strong><span class="block text-xs">${strength.label} · evidence probability ${probability}%</span>`;
    const annual=document.getElementById('sales-os-annualised-preview');
    if(annual)annual.textContent=SalesOS.money(SalesOS.annualise(fake.value,meta.frequency,meta.eventsPerYear));
  };
})();


// ---------------------------------------------------------------------------
// Opportunity UI / save overrides
// ---------------------------------------------------------------------------
SalesOS.openQualifiedOpportunityForm=function(id,companyId=''){
  const opportunity=id?(DB.opportunities||[]).find(x=>x.id===id):null;
  const selectedCompany=opportunity?.companyId||companyId;
  if(!(DB.companies||[]).length){toast('Create or convert a company before adding an opportunity','error');return;}
  const meta=SalesOS.opportunityMeta(opportunity||{});
  const cleanNotes=SalesOS.cleanOpportunityNotes(opportunity?.notes||'');
  const strength=SalesOS.opportunityStrength(opportunity||{stage:'Qualified',value:0,nextAction:'',nextFollowup:''},meta);
  const evidence=SalesOS.evidenceProbability(opportunity?.stage||'Qualified',strength.score);
  openModal(`<div class="p-6 max-w-5xl max-h-[92vh] overflow-y-auto">
    <div class="flex justify-between items-start gap-4 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-600">REVENUE OPPORTUNITY</p><h2 class="text-xl font-bold">${id?'Edit':'Create'} Qualified Opportunity</h2><p class="text-sm text-gray-500 mt-1">Build believable pipeline from evidence, not optimism.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="SalesOS.saveQualifiedOpportunity(event,'${id||''}')" oninput="SalesOS.updateOpportunityEvidence(this)" class="space-y-4">
      <section class="bg-white rounded-2xl border p-4">
        <div class="grid md:grid-cols-2 gap-3">
          <label class="text-xs text-gray-600 md:col-span-2">Company *<select name="companyId" required class="mt-1 w-full px-3 py-2 border rounded-lg"><option value="">Select company</option>${(DB.companies||[]).filter(c=>c.active||c.id===selectedCompany).map(c=>`<option value="${c.id}" ${c.id===selectedCompany?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>
          <label class="text-xs text-gray-600 md:col-span-2">Opportunity name *<input name="title" required value="${esc(opportunity?.title||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
          <label class="text-xs text-gray-600">Revenue type<select name="type" class="mt-1 w-full px-3 py-2 border rounded-lg">${opportunityTypes().map(t=>`<option ${opportunity?.type===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label>
          <label class="text-xs text-gray-600">Stage<select name="stage" onchange="SalesOS.updateOpportunityEvidence(this.form)" class="mt-1 w-full px-3 py-2 border rounded-lg">${opportunityStages().map(s=>`<option ${opportunity?.stage===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>
          <label class="text-xs text-gray-600">Value per event / booking (£)<input name="value" type="number" min="0" value="${Number(opportunity?.value||0)||''}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
          <label class="text-xs text-gray-600">Evidence probability %<input name="probability" type="number" readonly value="${opportunity?.probability??evidence}" class="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-50"><small class="text-gray-400">Calculated from stage + Deal Strength.</small></label>
          <label class="text-xs text-gray-600">Expected decision / close<input name="expectedClose" type="date" value="${opportunity?.expectedClose||meta.decisionDate||opportunityAddDays(opportunityToday(),14)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
          <label class="text-xs text-gray-600">Event date<input name="eventDate" type="date" value="${opportunity?.eventDate||''}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
          <label class="text-xs text-gray-600">Assigned to<select name="assignedTo" class="mt-1 w-full px-3 py-2 border rounded-lg">${staffOptions(opportunity?.assignedTo||'')}</select></label>
          <label class="text-xs text-gray-600">Lead source<select name="source" class="mt-1 w-full px-3 py-2 border rounded-lg">${['Proactive Sales','Existing Company','Networking','Referral','Inbound Enquiry','Repeat Customer','Other'].map(s=>`<option ${opportunity?.source===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>
          <label class="text-xs text-gray-600">Next follow-up *<input name="nextFollowup" type="date" required value="${opportunity?.nextFollowup||opportunityAddDays(opportunityToday(),2)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
          <label class="text-xs text-gray-600">Next action *<input name="nextAction" required value="${esc(opportunity?.nextAction||'Book a meeting and fully qualify the requirement')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
          <label class="text-xs text-gray-600">Deposit due date<input name="depositDueDate" type="date" value="${opportunity?.depositDueDate||''}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
          <label class="text-xs text-gray-600">Competitor / other venue<input name="competitor" value="${esc(opportunity?.competitor||meta.competition||'')}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        </div>
      </section>
      ${SalesOS.renderQualificationFields(opportunity||{companyId:selectedCompany,value:0},meta)}
      ${SalesOS.renderRecurringFields(opportunity||{value:0},meta)}
      <section class="grid lg:grid-cols-[.7fr_1.3fr] gap-3">
        <div class="rounded-2xl bg-charcoal-900 text-white p-5"><p class="text-[10px] font-bold tracking-widest text-olive-200">DEAL STRENGTH</p><div id="sales-os-opportunity-strength" class="mt-2"><strong class="text-2xl">${strength.score}/100</strong><span class="block text-xs">${strength.label} · evidence probability ${evidence}%</span></div><p class="text-xs text-white/50 mt-3">Probability is calculated, not manually inflated.</p></div>
        <label class="text-xs text-gray-600 bg-white border rounded-2xl p-4">Opportunity notes<textarea name="notes" rows="6" class="mt-2 w-full px-3 py-2 border rounded-lg">${esc(cleanNotes)}</textarea></label>
      </section>
      <button class="w-full py-3 bg-olive-700 text-white rounded-xl font-bold">Save Qualified Opportunity</button>
    </form>
  </div>`);
  setTimeout(()=>SalesOS.updateOpportunityEvidence(document.querySelector('form[onsubmit^="SalesOS.saveQualifiedOpportunity"]')),0);
};

SalesOS.saveQualifiedOpportunity=async function(event,id){
  event.preventDefault();
  const form=event.target,d=new FormData(form),stage=String(d.get('stage')||'Qualified');
  const meta=SalesOS.readQualificationForm(form);
  if(stage==='Lost'||stage==='Won'){
    const draft=Object.fromEntries(d.entries());
    draft.notes=SalesOS.packOpportunityNotes(d.get('notes')||'',meta);
    draft.competitor=d.get('competitor')||meta.competition||'';
    draft.expectedClose=d.get('expectedClose')||meta.decisionDate||'';
    if(stage==='Lost'){openOpportunityLostForm(id,draft);return;}
    openOpportunityWonForm(id,draft);return;
  }
  const fake={
    value:Number(d.get('value')||0),stage,nextAction:String(d.get('nextAction')||'').trim(),
    nextFollowup:String(d.get('nextFollowup')||'').trim(),expectedClose:String(d.get('expectedClose')||'').trim(),
    competitor:String(d.get('competitor')||'').trim()
  };
  const strength=SalesOS.opportunityStrength(fake,meta);
  const probability=SalesOS.evidenceProbability(stage,strength.score);
  const record={
    company_id:d.get('companyId'),title:d.get('title'),opportunity_type:d.get('type'),stage,
    estimated_value:Number(d.get('value'))||0,probability,
    expected_close:d.get('expectedClose')||meta.decisionDate||null,event_date:d.get('eventDate')||null,
    assigned_to:d.get('assignedTo')||null,next_action:d.get('nextAction')||opportunityNextActionForStage(stage),
    next_followup:d.get('nextFollowup')||opportunityAddDays(opportunityToday(),opportunitySuggestedDays(stage)),
    deposit_due_date:d.get('depositDueDate')||null,competitor:d.get('competitor')||meta.competition||null,
    source:d.get('source')||null,notes:SalesOS.packOpportunityNotes(d.get('notes')||'',meta)
  };
  if(stage==='Proposal Sent'&&!id)record.proposal_sent_date=opportunityToday();
  const query=id?supabaseClient.from('opportunities').update(record).eq('id',id):supabaseClient.from('opportunities').insert(record);
  const {error}=await query;
  if(error){console.error(error);toast('Opportunity could not be saved','error');return;}
  closeModal();await loadOpportunitiesFromSupabase();renderSection();
  toast(`${id?'Opportunity updated':'Opportunity created'} · Deal Strength ${strength.score}/100`);
};

SalesOS.renderDealStrength=function(opportunity){
  const h=SalesOS.opportunityHealth(opportunity),meta=SalesOS.opportunityMeta(opportunity);
  return `<section class="rounded-2xl border ${h.strength.score>=70?'border-green-200 bg-green-50':h.strength.score>=50?'border-amber-200 bg-amber-50':'border-red-200 bg-red-50'} p-4 mb-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><p class="text-[10px] font-bold tracking-widest">DEAL STRENGTH</p><div class="flex items-end gap-2 mt-1"><strong class="text-3xl">${h.strength.score}/100</strong><span class="text-sm font-bold">${h.strength.label}</span></div></div><div class="grid grid-cols-2 gap-3 text-right"><div><small class="text-gray-500">Evidence probability</small><strong class="block">${h.evidence}%</strong></div><div><small class="text-gray-500">Annualised potential</small><strong class="block">${SalesOS.money(h.annual)}</strong></div></div></div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">${h.strength.checks.map(([label,ok])=>`<div class="rounded-lg bg-white/70 border p-2 text-xs flex gap-2"><span class="${ok?'text-green-700':'text-red-500'}">${ok?'✓':'○'}</span>${esc(label)}</div>`).join('')}</div>
    ${meta.frequency&&meta.frequency!=='One-off'?`<p class="text-xs mt-3"><strong>${esc(meta.frequency)}</strong> · ${Number(meta.eventsPerYear||0)||SalesOS.frequencyMultiplier(meta.frequency)} expected events/year</p>`:''}
  </section>`;
};

SalesOS.viewQualifiedOpportunity=function(id){
  const opportunity=(DB.opportunities||[]).find(x=>x.id===id);if(!opportunity)return;
  const company=(DB.companies||[]).find(x=>x.id===opportunity.companyId);
  const meta=SalesOS.opportunityMeta(opportunity),activities=(DB.opportunityActivities||[]).filter(x=>x.opportunityId===id).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const clean=SalesOS.cleanOpportunityNotes(opportunity.notes);
  openModal(`<div class="p-6 max-w-5xl max-h-[92vh] overflow-y-auto">
    <div class="flex justify-between items-start gap-4 mb-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">QUALIFIED REVENUE OPPORTUNITY</p><h2 class="text-2xl font-bold">${esc(opportunity.title)}</h2><p class="text-sm text-gray-500 mt-1">${esc(company?.name||'Company missing')}</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      <div class="bg-cream-50 rounded-xl p-3"><small class="text-gray-500">Stage</small><span class="badge block mt-1 ${opportunityStageColor(opportunity.stage)}">${esc(opportunity.stage)}</span></div>
      <div class="bg-cream-50 rounded-xl p-3"><small class="text-gray-500">Value / event</small><strong class="block text-lg">${SalesOS.money(opportunity.value)}</strong></div>
      <div class="bg-cream-50 rounded-xl p-3"><small class="text-gray-500">Probability</small><strong class="block text-lg">${opportunity.probability}%</strong></div>
      <div class="bg-cream-50 rounded-xl p-3"><small class="text-gray-500">Weighted</small><strong class="block text-lg">${SalesOS.money(opportunityWeightedValue(opportunity))}</strong></div>
    </div>
    ${SalesOS.renderDealStrength(opportunity)}
    <div class="grid lg:grid-cols-2 gap-4 mb-4">
      <section class="bg-white border rounded-2xl p-4"><p class="text-[10px] font-bold tracking-widest text-olive-700">BUYING PROCESS</p><div class="grid gap-3 mt-3 text-sm"><div><small class="text-gray-500">Need</small><strong class="block">${esc(meta.need||'Not confirmed')}</strong></div><div><small class="text-gray-500">Decision maker</small><strong class="block">${esc(meta.decisionMaker||'Unknown')}</strong></div><div><small class="text-gray-500">Reason to change</small><strong class="block">${esc(meta.reasonToChange||'Not established')}</strong></div><div><small class="text-gray-500">Decision process</small><strong class="block">${esc(meta.buyingProcess||'Not established')}</strong></div><div><small class="text-gray-500">Decision criteria</small><strong class="block">${esc(meta.decisionCriteria||'Not established')}</strong></div></div></section>
      <section class="bg-white border rounded-2xl p-4"><p class="text-[10px] font-bold tracking-widest text-olive-700">COMPETITIVE POSITION</p><div class="grid gap-3 mt-3 text-sm"><div><small class="text-gray-500">Current venue / situation</small><strong class="block">${esc(meta.currentVenue||'Unknown')}</strong></div><div><small class="text-gray-500">Competition</small><strong class="block">${esc(meta.competition||opportunity.competitor||'Unknown')}</strong></div><div><small class="text-gray-500">Decision date</small><strong class="block">${opportunityFormatDate(meta.decisionDate||opportunity.expectedClose)}</strong></div><div><small class="text-gray-500">Next action</small><strong class="block">${esc(opportunity.nextAction||'Not controlled')}</strong><span class="text-xs text-gray-500">${opportunityFormatDate(opportunity.nextFollowup)}</span></div></div></section>
    </div>
    ${clean?`<section class="bg-white border rounded-2xl p-4 mb-4"><p class="text-[10px] font-bold tracking-widest text-gray-500">NOTES</p><p class="text-sm whitespace-pre-wrap mt-2">${esc(clean)}</p></section>`:''}
    <div class="flex gap-2 flex-wrap mb-5">${opportunityIsOpen(opportunity)?`<button onclick="openOpportunityActivityForm('${id}')" class="px-4 py-2 bg-olive-700 text-white rounded-lg text-sm font-bold">Complete Next Action</button>`:''}<button onclick="SalesOS.openQualifiedOpportunityForm('${id}')" class="px-4 py-2 bg-charcoal-900 text-white rounded-lg text-sm font-bold">Edit Qualification</button>${opportunityIsOpen(opportunity)?`<button onclick="openOpportunityWonForm('${id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Mark Won</button><button onclick="openOpportunityLostForm('${id}')" class="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-bold">Mark Lost</button>`:''}</div>
    <section><div class="flex justify-between mb-2"><h3 class="font-bold">Opportunity Timeline</h3><span class="badge bg-gray-100 text-gray-700">${activities.length}</span></div><div class="space-y-2 max-h-72 overflow-y-auto">${activities.length?activities.map(a=>`<div class="p-3 border rounded-xl"><div class="flex justify-between gap-2"><strong class="text-sm">${esc(a.type)} · ${esc(a.outcome||'')}</strong><span class="text-xs text-gray-400">${opportunityFormatDate(a.date)}</span></div>${a.notes?`<p class="text-sm mt-2">${esc(a.notes)}</p>`:''}</div>`).join(''):'<p class="text-sm text-gray-400">No opportunity activity yet.</p>'}</div></section>
  </div>`);
  if(window.lucide)lucide.createIcons();
};

// Route existing opportunity actions into the evidence-led Phase 4 UI.
openOpportunityForm=function(id,companyId=''){SalesOS.openQualifiedOpportunityForm(id,companyId);};
viewOpportunity=function(id){SalesOS.viewQualifiedOpportunity(id);};

// Recalculate probability when an activity changes stage instead of accepting fantasy percentages.
const _salesOSLegacyOpportunityActivity=saveOpportunityActivity;
saveOpportunityActivity=async function(event,id){
  event.preventDefault();
  const opportunity=(DB.opportunities||[]).find(x=>x.id===id);if(!opportunity)return;
  const form=new FormData(event.target),outcome=form.get('outcome'),stage=form.get('stage');
  if(outcome==='Lost'||stage==='Lost'){openOpportunityLostForm(id,null,{activityType:form.get('type'),activityDate:form.get('date'),staff:form.get('staff'),notes:form.get('notes')});return;}
  if(outcome==='Deposit Received'||stage==='Won'){openOpportunityWonForm(id,null,{activityType:form.get('type'),activityDate:form.get('date'),staff:form.get('staff'),notes:form.get('notes')});return;}
  const activity={opportunity_id:id,activity_type:form.get('type'),activity_date:form.get('date'),staff:form.get('staff')||null,outcome,notes:form.get('notes')};
  const {error}=await supabaseClient.from('opportunity_activities').insert(activity);
  if(error){console.error(error);toast('Opportunity activity could not be saved','error');return;}
  const candidate={...opportunity,stage,nextAction:form.get('nextAction')||opportunityNextActionForStage(stage),nextFollowup:form.get('nextFollowup')||opportunityAddDays(opportunityToday(),opportunitySuggestedDays(stage)),expectedClose:form.get('expectedClose')||opportunity.expectedClose};
  const strength=SalesOS.opportunityStrength(candidate),probability=SalesOS.evidenceProbability(stage,strength.score);
  const update={stage,probability,next_followup:candidate.nextFollowup,next_action:candidate.nextAction,expected_close:candidate.expectedClose||null,last_activity:form.get('date')};
  if(outcome==='Proposal Sent')update.proposal_sent_date=form.get('date');
  if(outcome==='Deposit Requested')update.deposit_due_date=opportunityAddDays(form.get('date'),7);
  await supabaseClient.from('opportunities').update(update).eq('id',id);
  await loadOpportunitiesFromSupabase();viewOpportunity(id);toast(`Opportunity updated · probability ${probability}%`);
};


// ---------------------------------------------------------------------------
// Lead → Opportunity qualification handoff
// ---------------------------------------------------------------------------
SalesOS.leadToOpportunityMeta=function(lead){
  const snap=SalesOS.leadQualificationSnapshot(lead),d=snap.discovery||{};
  const find=(...keys)=>{for(const k of keys){if(d[k])return d[k];}return '';};
  return {
    need:String(lead.servicesNeeded||'').trim(),
    decisionMaker:lead.decisionMaker?String(lead.contactName||'').trim():'',
    currentVenue:find('Current venue','Current strengths'),
    reasonToChange:find('Pain / improvement','Pain / friction','Market gap'),
    buyingProcess:'',
    decisionDate:'',
    competition:'',
    decisionCriteria:'',
    frequency:'One-off',
    eventsPerYear:1,
    updatedAt:new Date().toISOString()
  };
};

openLeadOpportunityWizard=function(leadId){
  const lead=(DB.salesLeads||[]).find(x=>x.id===leadId);if(!lead)return;
  const existing=(DB.companies||[]).find(c=>SalesOS.normaliseCompanyName(c.name)===SalesOS.normaliseCompanyName(lead.companyName));
  if(existing){
    closeModal();
    SalesOS.openQualifiedOpportunityForm('',existing.id);
    return;
  }
  const meta=SalesOS.leadToOpportunityMeta(lead);
  const provisional={
    stage:'Qualified',value:Number(lead.potentialValue||0),
    nextAction:'Qualify requirements and progress the opportunity',
    nextFollowup:salesAddDays(currentDateStr(),3),
    expectedClose:'',competitor:''
  };
  const strength=SalesOS.opportunityStrength(provisional,meta);
  const probability=SalesOS.evidenceProbability('Qualified',strength.score);
  openModal(`<div class="p-6 max-w-3xl">
    <div class="flex justify-between items-start gap-3 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-600">CONVERT TO REVENUE OPPORTUNITY</p><h2 class="text-xl font-bold">${esc(lead.companyName)}</h2><p class="text-sm text-gray-500 mt-1">Create the permanent account, then continue qualification in Opportunity 360.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4"><div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Lead value</small><strong class="block">${SalesOS.money(lead.potentialValue)}</strong></div><div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Annual potential</small><strong class="block">${SalesOS.money(lead.annualPotential)}</strong></div><div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Deal Strength</small><strong class="block">${strength.score}/100</strong></div><div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Evidence probability</small><strong class="block">${probability}%</strong></div></div>
    <form onsubmit="SalesOS.createQualifiedOpportunityFromLead(event,'${leadId}')" class="space-y-3">
      <label class="block text-xs text-gray-600">Opportunity name *<input name="title" required value="${esc(lead.companyName)} – Corporate Event" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      <div class="grid sm:grid-cols-2 gap-3">
        <label class="text-xs text-gray-600">Opportunity type<select name="type" class="mt-1 w-full px-3 py-2 border rounded-lg">${opportunityTypes().map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>
        <label class="text-xs text-gray-600">Estimated value (£)<input name="value" type="number" min="0" value="${Number(lead.potentialValue||0)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Next follow-up<input name="nextFollowup" type="date" value="${salesAddDays(currentDateStr(),3)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Next action<input name="nextAction" value="Fully qualify the requirement and buying process" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
      </div>
      <div class="rounded-xl bg-olive-50 border border-olive-100 p-4"><p class="text-[10px] font-bold tracking-widest text-olive-700">QUALIFICATION CARRIED FORWARD</p><div class="grid sm:grid-cols-2 gap-2 mt-2 text-xs">${[['Need',meta.need],['Decision maker',meta.decisionMaker],['Current venue',meta.currentVenue],['Reason to change',meta.reasonToChange]].map(([l,v])=>`<div class="bg-white rounded-lg border p-2"><small class="text-gray-400">${l}</small><strong class="block">${esc(v||'Still missing')}</strong></div>`).join('')}</div></div>
      <button class="w-full py-3 bg-gold-500 text-white rounded-xl font-bold">Create Account & Qualified Opportunity</button>
    </form>
  </div>`);
};

SalesOS.createQualifiedOpportunityFromLead=async function(event,leadId){
  event.preventDefault();
  const lead=(DB.salesLeads||[]).find(x=>x.id===leadId);if(!lead)return;
  const f=new FormData(event.target);
  let company=(DB.companies||[]).find(c=>SalesOS.normaliseCompanyName(c.name)===SalesOS.normaliseCompanyName(lead.companyName));
  let companyId=company?.id||'';
  if(!companyId){
    const companyRecord={company_name:lead.companyName,industry:lead.businessType||null,postcode:lead.postcode||null,website:lead.website||null,phone:lead.phone||null,email:lead.email||null,assigned_to:lead.assignedTo||null,relationship:['Hot','Strategic'].includes(lead.relationship)?lead.relationship:'Warm',annual_potential:lead.annualPotential||lead.potentialValue||0,services:lead.servicesNeeded?lead.servicesNeeded.split(',').map(x=>x.trim()).filter(Boolean):[],current_customer:false,active:true,last_contact:lead.lastContact||null,next_followup:f.get('nextFollowup')||null,notes:[lead.outcome,lead.notes].filter(Boolean).join('\n')||null};
    const c=await supabaseClient.from('companies').insert(companyRecord).select().single();
    if(c.error){console.error(c.error);toast('Company could not be created','error');return;}
    companyId=c.data.id;
    if(lead.contactName)await supabaseClient.from('company_contacts').insert({company_id:companyId,contact_name:lead.contactName,job_title:lead.jobTitle||null,phone:lead.phone||null,email:lead.email||null,linkedin:lead.linkedin||null,decision_maker:lead.decisionMaker});
  }
  const meta=SalesOS.leadToOpportunityMeta(lead);
  const candidate={stage:'Qualified',value:Number(f.get('value')||0),nextAction:f.get('nextAction')||'',nextFollowup:f.get('nextFollowup')||'',expectedClose:'',competitor:''};
  const strength=SalesOS.opportunityStrength(candidate,meta),probability=SalesOS.evidenceProbability('Qualified',strength.score);
  const record={company_id:companyId,title:f.get('title'),opportunity_type:f.get('type'),stage:'Qualified',estimated_value:Number(f.get('value'))||0,probability,assigned_to:lead.assignedTo||null,next_action:f.get('nextAction')||'Fully qualify the requirement and buying process',next_followup:f.get('nextFollowup')||salesAddDays(currentDateStr(),3),source:'Proactive Sales',notes:SalesOS.packOpportunityNotes(`Created from proactive sales lead: ${lead.companyName}`,meta)};
  const o=await supabaseClient.from('opportunities').insert(record);
  if(o.error){console.error(o.error);toast('Opportunity could not be created','error');return;}
  await supabaseClient.from('sales_leads').update({status:'Converted',next_followup:null,next_action:null,outcome:'Converted to company and qualified revenue opportunity'}).eq('id',leadId);
  await Promise.all([loadSalesLeadsFromSupabase(),loadCompaniesFromSupabase(),loadOpportunitiesFromSupabase()]);
  closeModal();navigate('opportunities');toast(`Qualified opportunity created · Deal Strength ${strength.score}/100`);
};
