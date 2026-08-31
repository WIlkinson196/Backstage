// SALES OS 2.0 — PHASE 8 FINAL: INTEGRATION, REFRACTOR & NO-MISS QA
(function(){
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
  const phone=v=>String(v||'').replace(/\D/g,'');
  const ref=v=>String(v||'').trim().toUpperCase();

  // -------------------------------------------------------------------------
  // Stronger account resolution
  // Name matching remains the fallback, but email / phone evidence wins.
  // -------------------------------------------------------------------------
  SalesOS.findCompanyForLead=function(lead){
    if(!lead)return null;
    const em=norm(lead.email),ph=phone(lead.phone),name=SalesOS.normaliseCompanyName?SalesOS.normaliseCompanyName(lead.companyName):norm(lead.companyName);
    const contacts=DB.companyContacts||[];
    if(em){
      const contact=contacts.find(c=>norm(c.email)===em);
      if(contact)return (DB.companies||[]).find(c=>c.id===contact.companyId)||null;
      const company=(DB.companies||[]).find(c=>norm(c.email)===em);
      if(company)return company;
    }
    if(ph){
      const contact=contacts.find(c=>phone(c.phone)===ph);
      if(contact)return (DB.companies||[]).find(c=>c.id===contact.companyId)||null;
      const company=(DB.companies||[]).find(c=>phone(c.phone)===ph);
      if(company)return company;
    }
    return (DB.companies||[]).find(c=>(SalesOS.normaliseCompanyName?SalesOS.normaliseCompanyName(c.name):norm(c.name))===name)||null;
  };
  SalesOS.accountCompany=function(lead){return SalesOS.findCompanyForLead(lead);};

  // -------------------------------------------------------------------------
  // Cross-system booking attribution.
  // A Won Opportunity is linked only where a genuine shared BK reference exists.
  // -------------------------------------------------------------------------
  SalesOS.bookingAttribution=function(opportunity){
    const bookingRef=ref(opportunity?.bookingReference);
    if(!bookingRef)return {status:'unlinked',label:'BK reference not loaded',bookingRef:''};
    const enquiry=(DB.enquiries||[]).find(e=>ref(e.rezlynxReference)===bookingRef);
    const fn=(DB.functions||[]).find(f=>ref(f.bookingReference)===bookingRef||(enquiry&&f.enquiryId===enquiry.id));
    const wedding=enquiry?(DB.weddings||[]).find(w=>w.enquiryId===enquiry.id):null;
    if(wedding)return {status:'linked',type:'Wedding',record:wedding,enquiry,bookingRef,label:`Wedding · ${wedding.couple||enquiry?.name||bookingRef}`,value:Number(wedding.quotedValue||opportunity.value||0)};
    if(fn)return {status:'linked',type:'Function',record:fn,enquiry,bookingRef,label:`Function · ${fn.clientName||enquiry?.name||bookingRef}`,value:Number(fn.quotedValue||opportunity.value||0)};
    if(enquiry)return {status:'partial',type:enquiry.eventType||'Booking',enquiry,bookingRef,label:`Confirmed enquiry · ${enquiry.name||bookingRef}`,value:Number(enquiry.value||opportunity.value||0)};
    return {status:'unlinked',bookingRef,label:`No confirmed CRM booking found for ${bookingRef}`};
  };
  SalesOS.accountBookings=function(lead){
    return SalesOS.accountOpportunities(lead).filter(o=>o.stage==='Won').map(o=>({opportunity:o,attribution:SalesOS.bookingAttribution(o)}));
  };

  // -------------------------------------------------------------------------
  // Data quality / no-miss audit.
  // -------------------------------------------------------------------------
  SalesOS.salesAudit=function(){
    const leads=DB.salesLeads||[],companies=DB.companies||[],opps=DB.opportunities||[];
    const active=leads.filter(activeSalesLead);
    const unowned=active.filter(l=>!String(l.assignedTo||'').trim());
    const noNext=active.filter(l=>!String(l.nextAction||'').trim()||!l.nextFollowup);
    const unreachable=active.filter(l=>!String(l.phone||'').trim()&&!String(l.email||'').trim());
    const noDM=active.filter(l=>Number(l.annualPotential||l.potentialValue||0)>=5000&&!l.decisionMaker);
    const sequenceBroken=active.filter(l=>{
      const s=window.SalesOS?.sequenceState?SalesOS.sequenceState(l):{};
      return s.active&&(!l.nextAction||!l.nextFollowup);
    });

    const duplicateGroups=[],seen=new Set();
    leads.forEach(l=>{
      if(seen.has(l.id))return;
      const ln=norm(l.companyName),em=norm(l.email),ph=phone(l.phone);
      const matches=leads.filter(x=>x.id!==l.id&&(
        (ln&&norm(x.companyName)===ln)||
        (em&&norm(x.email)===em)||
        (ph&&phone(x.phone)===ph)
      ));
      if(matches.length){
        const group=[l,...matches.filter(x=>!seen.has(x.id))];
        group.forEach(x=>seen.add(x.id));duplicateGroups.push(group);
      }
    });

    const orphanOpps=opps.filter(o=>!(companies||[]).some(c=>c.id===o.companyId));
    const uncontrolledOpps=opps.filter(o=>!['Won','Lost'].includes(o.stage)&&(!o.nextAction||!o.nextFollowup));
    const probabilityDrift=opps.filter(o=>{
      if(['Won','Lost'].includes(o.stage)||!window.SalesOS?.opportunityStrength)return false;
      const strength=SalesOS.opportunityStrength(o),expected=SalesOS.evidenceProbability(o.stage,strength.score);
      return Math.abs(Number(o.probability||0)-expected)>=5;
    });
    const unlinkedWins=opps.filter(o=>o.stage==='Won'&&o.bookingReference&&SalesOS.bookingAttribution(o).status==='unlinked');
    const convertedWithoutCompany=leads.filter(l=>l.status==='Converted'&&!SalesOS.findCompanyForLead(l));
    const convertedWithoutOpp=leads.filter(l=>{
      if(l.status!=='Converted')return false;
      const company=SalesOS.findCompanyForLead(l);
      return !!company&&!opps.some(o=>o.companyId===company.id);
    });

    const critical=[
      ...unowned.map(x=>({type:'lead',id:x.id,label:`${x.companyName}: no owner`,detail:'A live proactive account has nobody accountable for it.'})),
      ...noNext.map(x=>({type:'lead',id:x.id,label:`${x.companyName}: no complete next action`,detail:'Live sales activity can disappear without a dated commitment.'})),
      ...uncontrolledOpps.map(x=>({type:'opportunity',id:x.id,label:`${x.title}: opportunity uncontrolled`,detail:'Open revenue opportunity has no complete next action.'})),
      ...orphanOpps.map(x=>({type:'opportunity',id:x.id,label:`${x.title}: company link missing`,detail:'Opportunity points to a company record that is not currently loaded.'}))
    ];
    return {unowned,noNext,unreachable,noDM,sequenceBroken,duplicateGroups,orphanOpps,uncontrolledOpps,probabilityDrift,unlinkedWins,convertedWithoutCompany,convertedWithoutOpp,critical};
  };

  SalesOS.auditCount=function(a=SalesOS.salesAudit()){
    return a.unowned.length+a.noNext.length+a.unreachable.length+a.sequenceBroken.length+
      a.duplicateGroups.length+a.orphanOpps.length+a.uncontrolledOpps.length+
      a.probabilityDrift.length+a.convertedWithoutCompany.length+a.convertedWithoutOpp.length;
  };

  SalesOS.renderAuditBanner=function(){
    const a=SalesOS.salesAudit(),n=SalesOS.auditCount(a);
    if(!n)return `<section class="rounded-2xl border border-green-200 bg-green-50 p-4 mb-4 flex items-center justify-between gap-4"><div><p class="text-[10px] font-bold tracking-widest text-green-700">SALES CONTROL AUDIT</p><strong class="text-sm">No structural no-miss issues detected.</strong></div><i data-lucide="shield-check" class="text-green-700"></i></section>`;
    return `<section class="rounded-2xl border border-red-200 bg-red-50 p-4 mb-4"><div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><p class="text-[10px] font-bold tracking-widest text-red-700">SALES CONTROL AUDIT</p><strong>${n} issue${n===1?'':'s'} could weaken sales control</strong><p class="text-xs text-red-800/70 mt-1">${a.unowned.length} unowned · ${a.noNext.length} lead actions missing · ${a.uncontrolledOpps.length} opportunity actions missing · ${a.duplicateGroups.length} duplicate groups · ${a.probabilityDrift.length} probability mismatches</p></div><button onclick="SalesOS.openAudit()" class="px-4 py-2.5 bg-charcoal-900 text-white rounded-lg text-xs font-bold">Review Audit</button></div></section>`;
  };

  SalesOS.openAudit=function(){
    const a=SalesOS.salesAudit();
    const sections=[
      ['Live account ownership',a.unowned,'lead','No unowned live accounts.'],
      ['Live accounts missing next action',a.noNext,'lead','Every live account has a controlled next step.'],
      ['Uncontactable live accounts',a.unreachable,'lead','Every live account has a phone or email.'],
      ['Active sequences with broken next step',a.sequenceBroken,'lead','All active sequences are controlled.'],
      ['Open opportunities missing next action',a.uncontrolledOpps,'opportunity','Every open opportunity has a controlled next step.'],
      ['Opportunity probability drift',a.probabilityDrift,'opportunity','Opportunity probabilities match the evidence model.'],
      ['Converted leads without Company',a.convertedWithoutCompany,'lead','Converted proactive leads are linked to Company records.'],
      ['Converted leads without Opportunity',a.convertedWithoutOpp,'lead','Converted proactive leads have formal revenue opportunities.'],
      ['Won opportunities without confirmed booking match',a.unlinkedWins,'opportunity','All BK-referenced wins match a confirmed booking record.']
    ];
    openModal(`<div class="p-5 lg:p-6 max-w-5xl max-h-[92vh] overflow-y-auto"><div class="flex justify-between gap-3 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-700">PHASE 8 · FINAL QA</p><h2 class="text-2xl font-bold">Sales Control Audit</h2><p class="text-sm text-gray-500 mt-1">This is a control report. It does not delete or merge records automatically.</p></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
      <div class="space-y-3">${sections.map(([title,rows,type,clear])=>`<section class="border rounded-2xl overflow-hidden"><div class="p-3 bg-gray-50 border-b flex justify-between"><strong class="text-sm">${title}</strong><span class="badge ${rows.length?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}">${rows.length}</span></div>${rows.length?`<div class="divide-y">${rows.slice(0,20).map(r=>`<button onclick="closeModal();${type==='opportunity'?`viewOpportunity('${r.id}')`:`SalesOS.openAccount360('${r.id}')`}" class="w-full p-3 text-left hover:bg-olive-50"><strong class="text-sm">${esc(type==='opportunity'?r.title:r.companyName)}</strong><p class="text-xs text-gray-500">${esc(type==='opportunity'?r.stage:(r.nextAction||r.status||''))}</p></button>`).join('')}</div>`:`<p class="p-4 text-sm text-green-700">${clear}</p>`}</section>`).join('')}
      ${a.duplicateGroups.length?`<section class="border border-amber-200 rounded-2xl overflow-hidden"><div class="p-3 bg-amber-50 border-b flex justify-between"><strong class="text-sm">Possible duplicate prospect groups</strong><span class="badge bg-amber-100 text-amber-800">${a.duplicateGroups.length}</span></div><div class="divide-y">${a.duplicateGroups.map(g=>`<div class="p-3"><strong class="text-sm">${esc(g.map(x=>x.companyName).join(' / '))}</strong><p class="text-xs text-gray-500 mt-1">${g.length} records · review manually before deleting or merging anything.</p></div>`).join('')}</div></section>`:''}
    </div></div>`);
  };

  // -------------------------------------------------------------------------
  // Final source-of-truth helpers.
  // -------------------------------------------------------------------------
  SalesOS.attributionSummary=function(){
    const won=(DB.opportunities||[]).filter(o=>o.stage==='Won');
    const linked=won.map(o=>({o,a:SalesOS.bookingAttribution(o)})).filter(x=>x.a.status==='linked');
    const partial=won.map(o=>({o,a:SalesOS.bookingAttribution(o)})).filter(x=>x.a.status==='partial');
    const withRef=won.filter(o=>o.bookingReference);
    return {won,linked,partial,withRef,unlinked:withRef.length-linked.length-partial.length};
  };

  SalesOS.renderAttributionControl=function(){
    const s=SalesOS.attributionSummary();
    return `<section class="bg-white rounded-2xl border p-5"><div class="flex justify-between gap-3"><div><p class="text-[10px] font-bold tracking-widest text-olive-700">BOOKING ATTRIBUTION</p><h3 class="font-bold text-xl">Can proactive wins be traced into confirmed delivery?</h3></div><span class="badge ${s.unlinked?'bg-amber-100 text-amber-800':'bg-green-100 text-green-700'}">${s.linked.length}/${s.withRef.length||0} linked</span></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4"><div class="rounded-xl bg-cream-50 p-3"><small class="text-gray-500">Won opportunities</small><strong class="block text-xl">${s.won.length}</strong></div><div class="rounded-xl bg-green-50 p-3"><small class="text-gray-500">Confirmed record linked</small><strong class="block text-xl">${s.linked.length}</strong></div><div class="rounded-xl bg-blue-50 p-3"><small class="text-gray-500">Confirmed enquiry only</small><strong class="block text-xl">${s.partial.length}</strong></div><div class="rounded-xl ${s.unlinked?'bg-amber-50':'bg-green-50'} p-3"><small class="text-gray-500">BK refs unmatched</small><strong class="block text-xl">${s.unlinked}</strong></div></div><p class="text-[11px] text-gray-400 mt-3">Linkage is only claimed where the same BK reference is present. No fuzzy revenue attribution is invented.</p></section>`;
  };
})();
