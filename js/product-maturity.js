
// ============================================================================
// WINDMILL FARM CRM — PRODUCT MATURITY RELEASE
// Global Search · Command Palette · Customer 360 · Communications Intelligence
// Data Quality · Profitability · Product Audit
// ============================================================================
(function(){
  const P=window.WindmillProduct={
    lastSearch:[],
    panelMode:'',
    version:'2026.08-product-maturity'
  };

  P.getDB=()=>{try{if(typeof DB!=='undefined'&&DB)return DB}catch(e){}return window.DB||{}};
  P.arr=k=>{const db=P.getDB();return Array.isArray(db?.[k])?db[k]:[]};
  P.money=v=>'£'+Number(v||0).toLocaleString('en-GB',{maximumFractionDigits:0});
  P.norm=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  P.text=v=>String(v??'').trim();
  P.date=v=>{
    if(!v)return '';
    try{return new Date(v+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}catch(e){return v}
  };
  P.esc=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  P.today=()=>typeof todayStr!=='undefined'?todayStr:new Date().toISOString().slice(0,10);

  P.records=function(){
    const out=[];
    P.arr('enquiries').forEach(x=>out.push({
      kind:'Enquiry',id:x.id,title:x.name||x.client||'Unnamed enquiry',
      subtitle:`${x.eventType||x.type||'Event'} · ${x.status||'Open'}`,
      date:x.preferredDate||x.eventDate||x.enquiryDate||'',email:x.email||'',phone:x.phone||'',
      value:Number(x.value||x.quotedValue||x.budget||0),raw:x
    }));
    P.arr('weddings').forEach(x=>out.push({
      kind:'Wedding',id:x.id,title:x.couple||x.name||'Wedding',
      subtitle:`${x.package||'Package TBC'} · ${Number(x.dayGuests||0)} day guests`,
      date:x.date||'',email:x.email||'',phone:x.phone||'',
      value:Number(x.totalValue||x.value||x.finalPrice||0),raw:x
    }));
    P.arr('functions').forEach(x=>out.push({
      kind:'Function',id:x.id,title:x.client||x.name||'Function',
      subtitle:`${x.occasion||x.eventType||'Function'} · ${Number(x.guests||x.delegateCount||0)} guests`,
      date:x.date||'',email:x.email||'',phone:x.phone||'',
      value:Number(x.totalValue||x.value||String(x.billing||'').replace(/[^\d.]/g,'')||0),raw:x
    }));
    P.arr('companies').forEach(x=>out.push({
      kind:'Company',id:x.id,title:x.name||'Company',
      subtitle:`${x.industry||'Company'} · ${x.relationship||x.status||'Prospect'}`,
      date:'',email:x.email||'',phone:x.phone||'',value:Number(x.annualValue||x.value||0),raw:x
    }));
    P.arr('opportunities').forEach(x=>out.push({
      kind:'Opportunity',id:x.id,title:x.title||x.name||'Opportunity',
      subtitle:`${x.stage||'Pipeline'} · ${x.type||'Opportunity'}`,
      date:x.expectedCloseDate||x.closeDate||'',email:'',phone:'',
      value:Number(x.value||x.annualValue||0),raw:x
    }));
    P.arr('salesLeads').forEach(x=>out.push({
      kind:'Sales Lead',id:x.id,title:x.companyName||x.contactName||x.name||'Sales lead',
      subtitle:`${x.contactName||'No contact'} · ${x.status||x.stage||'Prospect'}`,
      date:x.nextActionDate||x.nextFollowup||'',email:x.email||'',phone:x.phone||'',
      value:Number(x.annualValue||x.value||0),raw:x
    }));
    return out;
  };

  P.openRecord=function(kind,id){
    P.closeCommand();P.closePanel();
    if(kind==='Enquiry'&&typeof viewEnquiry==='function')return viewEnquiry(id);
    if(kind==='Wedding'&&typeof openWeddingWorkspace==='function')return openWeddingWorkspace(id);
    if(kind==='Function'&&typeof openFunctionWorkspace==='function')return openFunctionWorkspace(id);
    if(kind==='Company'){
      if(typeof navigate==='function')navigate('companies');
      return setTimeout(()=>typeof viewCompany==='function'&&viewCompany(id),80);
    }
    if(kind==='Opportunity'){
      if(typeof navigate==='function')navigate('opportunities');
      return setTimeout(()=>typeof viewOpportunity==='function'&&viewOpportunity(id),80);
    }
    if(kind==='Sales Lead'){
      if(typeof navigate==='function')navigate('sales-leads');
      return setTimeout(()=>typeof viewSalesLead==='function'&&viewSalesLead(id),80);
    }
  };

  // --------------------------------------------------------------------------
  // GLOBAL SEARCH + COMMAND PALETTE
  // --------------------------------------------------------------------------
  P.commands=function(){
    const nav=[
      ['Operations Hub','dashboard','layout-dashboard'],
      ['Sales Leads','sales-leads','phone-call'],['Companies','companies','building-2'],
      ['Opportunities','opportunities','target'],['Enquiries','enquiries','inbox'],
      ['Communications','communications','messages-square'],['Weddings','weddings','heart'],
      ['Functions','functions','calendar-range'],['Calendar','calendar','calendar'],
      ['Kitchen','kitchen','chef-hat'],['Christmas','christmas','gift'],
      ['Hotel','hotel','building'],['Reports','reports','bar-chart-3']
    ].map(([name,section,icon])=>({
      type:'command',title:`Go to ${name}`,subtitle:'Navigation',icon,
      run:()=>typeof navigate==='function'&&navigate(section)
    }));

    return [
      {type:'command',title:'Customer 360',subtitle:'Relationship intelligence',icon:'contact-round',run:()=>P.openCustomerPicker()},
      {type:'command',title:'Data Quality Centre',subtitle:'Find incomplete CRM records',icon:'shield-check',run:()=>P.openDataQuality()},
      {type:'command',title:'Event Profitability',subtitle:'Revenue, cost capture and contribution',icon:'badge-pound-sterling',run:()=>P.openProfitability()},
      {type:'command',title:'Product Audit',subtitle:'Review every CRM module',icon:'scan-search',run:()=>P.openAudit()},
      {type:'command',title:'Windmill Intelligence',subtitle:'Management copilot',icon:'sparkles',run:()=>typeof toggleAI==='function'&&toggleAI()},
      ...nav
    ];
  };

  P.deepText=function(record){
    const vals=[];
    const walk=(obj,depth=0)=>{
      if(depth>3||obj===null||obj===undefined)return;
      if(Array.isArray(obj)){obj.slice(0,60).forEach(v=>walk(v,depth+1));return;}
      if(typeof obj==='object'){
        Object.entries(obj).forEach(([k,v])=>{
          vals.push(k);
          if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')vals.push(String(v));
          else walk(v,depth+1);
        });
        return;
      }
      vals.push(String(obj));
    };
    walk(record);
    return vals.join(' ');
  };

  P.recordSearchBlob=function(r){
    return P.norm([
      r.kind,r.title,r.subtitle,r.date,r.email,r.phone,
      P.deepText(r.raw||{})
    ].join(' '));
  };

  P.recordScore=function(r,q){
    const title=P.norm(r.title),email=P.norm(r.email),phone=P.norm(r.phone),date=P.norm(r.date);
    const raw=P.recordSearchBlob(r);
    if(!raw.includes(q))return -1;
    let score=1;
    if(title===q)score+=120;
    else if(title.startsWith(q))score+=90;
    else if(title.includes(q))score+=60;
    if(email===q)score+=120; else if(email.includes(q))score+=70;
    if(phone===q)score+=110; else if(phone.includes(q))score+=60;
    if(date===q)score+=80; else if(date.includes(q))score+=35;

    // Strong boost for common booking/reference fields.
    const rawObj=r.raw||{};
    const refs=[
      rawObj.reference,rawObj.bookingReference,rawObj.bookingRef,rawObj.booking_reference,
      rawObj.ref,rawObj.referenceNumber,rawObj.bookingNumber,rawObj.bookingId,
      rawObj.confirmationNumber,rawObj.eventReference,rawObj.crmReference
    ].filter(Boolean).map(P.norm);
    refs.forEach(ref=>{
      if(ref===q)score+=150;
      else if(ref.includes(q))score+=100;
    });
    return score;
  };

  P.search=function(query){
    const q=P.norm(query);
    if(!q)return P.commands().slice(0,12);

    const records=P.records().map(r=>({...r,_score:P.recordScore(r,q)}))
      .filter(r=>r._score>=0)
      .sort((a,b)=>b._score-a._score||(b.value||0)-(a.value||0))
      .slice(0,22);

    const commands=P.commands()
      .filter(x=>P.norm(`${x.title} ${x.subtitle}`).includes(q))
      .slice(0,8);

    // Actual CRM records come first. Navigation/commands appear below them.
    return [...records,...commands];
  };

  P.renderCommand=function(q=''){
    const rows=P.search(q);P.lastSearch=rows;
    const el=document.getElementById('wf-command-results');if(!el)return;
    el.innerHTML=rows.length?rows.map((r,i)=>r.type==='command'?`
      <button class="wf-command-row" onclick="WindmillProduct.runCommand(${i})">
        <span class="wf-command-icon"><i data-lucide="${r.icon}"></i></span>
        <span><strong>${P.esc(r.title)}</strong><small>${P.esc(r.subtitle)}</small></span>
        <em>↵</em>
      </button>`:`
      <button class="wf-command-row" onclick="WindmillProduct.openRecord('${r.kind}','${r.id}')">
        <span class="wf-kind">${P.esc(r.kind)}</span>
        <span><strong>${P.esc(r.title)}</strong><small>${P.esc(r.subtitle)}${r.date?' · '+P.esc(P.date(r.date)):''}</small></span>
        ${r.value?`<b>${P.money(r.value)}</b>`:''}
      </button>`).join(''):`<div class="wf-empty">No CRM records or commands match “${P.esc(q)}”.</div>`;
    if(window.lucide)lucide.createIcons();
  };

  P.runCommand=i=>{
    const item=P.lastSearch[i];
    if(item?.run){P.closeCommand();item.run();}
  };
  P.openCommand=function(prefill=''){
    const o=document.getElementById('wf-command-overlay'),i=document.getElementById('wf-command-input');
    if(!o||!i)return;
    o.classList.remove('hidden');i.value=prefill;P.renderCommand(prefill);
    setTimeout(()=>i.focus(),20);
  };
  P.closeCommand=()=>document.getElementById('wf-command-overlay')?.classList.add('hidden');

  // --------------------------------------------------------------------------
  // CUSTOMER 360
  // --------------------------------------------------------------------------
  P.customerGroups=function(){
    const groups=new Map();
    P.records().filter(r=>['Enquiry','Wedding','Function'].includes(r.kind)).forEach(r=>{
      // Name-based linking is intentionally conservative. We show linked records,
      // never silently merge the underlying data.
      const key=P.norm(r.title);
      if(!key)return;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(r);
    });
    return [...groups.values()].map(records=>({
      title:records[0]?.title||'Customer',
      records,
      value:records.reduce((s,r)=>s+Number(r.value||0),0)
    })).sort((a,b)=>b.value-a.value);
  };

  P.openCustomerPicker=function(){
    const groups=P.customerGroups();
    P.showPanel('CUSTOMER 360','One customer. One history.','Relationships joined across Enquiries, Weddings and Functions without altering the source records.',`
      <div class="wf-customer-list">${groups.length?groups.slice(0,80).map((g,i)=>`
        <button onclick="WindmillProduct.openCustomer(${i})">
          <span><strong>${P.esc(g.title)}</strong><small>${g.records.length} linked CRM record${g.records.length===1?'':'s'} · ${[...new Set(g.records.map(x=>x.kind))].join(' · ')}</small></span>
          <em>${P.money(g.value)}</em><i data-lucide="chevron-right"></i>
        </button>`).join(''):'<div class="wf-empty">No customer/event records are loaded.</div>'}</div>
    `);
  };

  P.openCustomer=function(index){
    const g=P.customerGroups()[index];if(!g)return;
    const emails=[...new Set(g.records.map(r=>r.email).filter(Boolean))];
    const phones=[...new Set(g.records.map(r=>r.phone).filter(Boolean))];
    const timeline=g.records.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    P.showPanel('CUSTOMER 360',g.title,
      [emails.join(' · '),phones.join(' · ')].filter(Boolean).join(' · ')||'Relationship history from venue records.',`
      <div class="wf-kpis">
        <article><small>Linked value</small><strong>${P.money(g.value)}</strong></article>
        <article><small>CRM records</small><strong>${g.records.length}</strong></article>
        <article><small>Relationship types</small><strong>${new Set(g.records.map(r=>r.kind)).size}</strong></article>
      </div>
      <section class="wf-card"><label>RELATIONSHIP TIMELINE</label>
        ${timeline.map(r=>`<button class="wf-line" onclick="WindmillProduct.openRecord('${r.kind}','${r.id}')">
          <span class="wf-kind">${P.esc(r.kind)}</span>
          <span><strong>${P.esc(r.subtitle)}</strong><small>${P.esc(P.date(r.date)||'Date not recorded')}</small></span>
          ${r.value?`<em>${P.money(r.value)}</em>`:''}
        </button>`).join('')}
      </section>`);
  };

  // --------------------------------------------------------------------------
  // DATA QUALITY
  // --------------------------------------------------------------------------
  P.qualityIssues=function(){
    const issues=[];
    P.arr('enquiries').forEach(e=>{
      const label=e.name||e.client||'Unnamed enquiry';
      if(!e.name&&!e.client)issues.push({sev:'Critical',kind:'Enquiry',id:e.id,msg:'Enquiry is missing a customer name'});
      if(!e.email&&!e.phone)issues.push({sev:'Critical',kind:'Enquiry',id:e.id,msg:`${label} has no email or phone number`});
      if(!e.nextFollowup&&!e.nextActionDate&&!['Confirmed Booking','Confirmed','Lost Enquiry','Lost'].includes(e.status))
        issues.push({sev:'High',kind:'Enquiry',id:e.id,msg:`${label} has no next action`});
      if(!e.preferredDate&&!e.eventDate)issues.push({sev:'Medium',kind:'Enquiry',id:e.id,msg:`${label} has no preferred event date`});
      if(!Number(e.value||e.quotedValue||e.budget||0))issues.push({sev:'Medium',kind:'Enquiry',id:e.id,msg:`${label} has no commercial value`});
    });
    P.arr('weddings').forEach(w=>{
      const label=w.couple||w.name||'Wedding';
      if(!w.coordinator&&!w.owner&&!w.planner)issues.push({sev:'High',kind:'Wedding',id:w.id,msg:`${label} has no assigned owner`});
      if(!Number(w.dayGuests||0))issues.push({sev:'Medium',kind:'Wedding',id:w.id,msg:`${label} has no day guest count`});
      if(!w.date)issues.push({sev:'Critical',kind:'Wedding',id:w.id,msg:`${label} has no wedding date`});
    });
    P.arr('functions').forEach(f=>{
      const label=f.client||f.name||'Function';
      if(!f.coordinator&&!f.owner)issues.push({sev:'High',kind:'Function',id:f.id,msg:`${label} has no assigned owner`});
      if(!Number(f.guests||f.delegateCount||0))issues.push({sev:'Medium',kind:'Function',id:f.id,msg:`${label} has no guest/delegate count`});
    });
    P.arr('opportunities').forEach(o=>{
      const label=o.title||o.name||'Opportunity';
      if(!Number(o.value||0))issues.push({sev:'Medium',kind:'Opportunity',id:o.id,msg:`${label} has no opportunity value`});
      if(!o.expectedCloseDate&&!o.closeDate)issues.push({sev:'Medium',kind:'Opportunity',id:o.id,msg:`${label} has no expected close date`});
    });
    return issues;
  };

  P.openDataQuality=function(){
    const issues=P.qualityIssues();
    const groups=['Critical','High','Medium'].map(sev=>[sev,issues.filter(x=>x.sev===sev).length]);
    P.showPanel('DATA QUALITY CENTRE','Keep the CRM trustworthy.',
      'These checks do not alter records automatically. They surface gaps for staff to correct at source.',`
      <div class="wf-kpis">
        <article><small>Total issues</small><strong>${issues.length}</strong></article>
        <article><small>Critical</small><strong>${groups[0][1]}</strong></article>
        <article><small>High priority</small><strong>${groups[1][1]}</strong></article>
      </div>
      <section class="wf-card"><label>FIX THESE FIRST</label>
        ${issues.length?issues.slice(0,100).map(x=>`<button class="wf-line wf-quality" onclick="WindmillProduct.openRecord('${x.kind}','${x.id}')">
          <span class="wf-severity ${x.sev.toLowerCase()}">${x.sev}</span>
          <span><strong>${P.esc(x.msg)}</strong><small>${x.kind} · open the source record to correct it</small></span>
          <i data-lucide="arrow-up-right"></i>
        </button>`).join(''):'<div class="wf-good">✓ No obvious data-quality gaps detected.</div>'}
      </section>`);
  };

  // --------------------------------------------------------------------------
  // EVENT PROFITABILITY
  // --------------------------------------------------------------------------
  P.profitRows=function(){
    return P.records().filter(r=>['Wedding','Function'].includes(r.kind)).map(r=>{
      const x=r.raw,revenue=Number(r.value||0);
      const food=Number(x.foodCost||x.estimatedFoodCost||0);
      const labour=Number(x.labourCost||x.estimatedLabourCost||0);
      const suppliers=Number(x.supplierCost||x.entertainmentCost||x.externalCost||0);
      const other=Number(x.otherCost||x.miscCost||0);
      const cost=food+labour+suppliers+other;
      return {...r,revenue,cost,contribution:revenue-cost,margin:revenue&&cost?((revenue-cost)/revenue*100):null,hasCosts:cost>0};
    }).sort((a,b)=>b.revenue-a.revenue);
  };

  P.openProfitability=function(){
    const rows=P.profitRows();
    const revenue=rows.reduce((s,x)=>s+x.revenue,0),cost=rows.reduce((s,x)=>s+x.cost,0),complete=rows.filter(x=>x.hasCosts).length;
    P.showPanel('EVENT PROFITABILITY','Revenue is only half the story.',
      'Costs are only used when they already exist in the event record. Missing costs are shown clearly — the CRM does not invent margins.',`
      <div class="wf-kpis">
        <article><small>Event revenue</small><strong>${P.money(revenue)}</strong></article>
        <article><small>Recorded costs</small><strong>${P.money(cost)}</strong></article>
        <article><small>Cost-complete events</small><strong>${complete}/${rows.length}</strong></article>
      </div>
      <section class="wf-card"><label>EVENT COMMERCIAL POSITION</label>
        ${rows.length?rows.map(r=>`<button class="wf-profit" onclick="WindmillProduct.openRecord('${r.kind}','${r.id}')">
          <span><strong>${P.esc(r.title)}</strong><small>${r.kind} · ${P.esc(P.date(r.date)||'Date TBC')}</small></span>
          <span><small>Revenue</small><b>${P.money(r.revenue)}</b></span>
          <span><small>${r.hasCosts?'Contribution':'Cost data'}</small><b>${r.hasCosts?P.money(r.contribution):'Not recorded'}</b></span>
          <span><small>Margin</small><b>${r.margin!==null?r.margin.toFixed(1)+'%':'—'}</b></span>
        </button>`).join(''):'<div class="wf-empty">No Weddings or Functions with commercial values are currently loaded.</div>'}
      </section>`);
  };

  // --------------------------------------------------------------------------
  // PRODUCT AUDIT
  // --------------------------------------------------------------------------
  P.auditRows=function(){
    const defs=[
      ['Operations Hub','dashboard','Manager control and daily execution'],
      ['Sales Leads','sales-leads','Outbound/business development'],
      ['Companies','companies','Account intelligence'],
      ['Opportunities','opportunities','Commercial pipeline'],
      ['Enquiries','enquiries','Inbound conversion'],
      ['Communications','communications','Customer outreach'],
      ['Weddings','weddings','Wedding planning and delivery'],
      ['Functions','functions','Non-wedding event delivery'],
      ['Calendar','calendar','Cross-venue date visibility'],
      ['Kitchen','kitchen','Food specification and production'],
      ['Christmas','christmas','Seasonal commercial/event control'],
      ['Hotel','hotel','Bedroom operation'],
      ['Reports','reports','Performance intelligence']
    ];
    return defs.map(([name,section,purpose])=>({
      name,section,purpose,
      status:'KEEP',
      review:name==='Communications'?'IMPROVE':name==='Reports'?'REVIEW':'KEEP'
    }));
  };
  P.openAudit=function(){
    const rows=P.auditRows();
    P.showPanel('PRODUCT AUDIT','What should stay, improve, merge or disappear?',
      'A lightweight live inventory of the current operating system. This phase deliberately consolidates around existing modules instead of adding more sidebar clutter.',`
      <section class="wf-card"><label>MODULE INVENTORY</label>
        ${rows.map(r=>`<button class="wf-audit" onclick="WindmillProduct.closePanel();navigate('${r.section}')">
          <span><strong>${r.name}</strong><small>${r.purpose}</small></span>
          <em class="${r.review.toLowerCase()}">${r.review}</em>
        </button>`).join('')}
      </section>
      <section class="wf-card wf-audit-note"><label>PRODUCT DIRECTION</label>
        <p><b>Keep:</b> strong specialist modules with a clear job.</p>
        <p><b>Improve:</b> Communications into an action-led outreach workspace.</p>
        <p><b>Consolidate:</b> global search, Customer 360, Data Quality and profitability live as cross-app tools rather than new permanent sidebar modules.</p>
      </section>`);
  };

  // --------------------------------------------------------------------------
  // COMMUNICATIONS ACTION LAYER
  // --------------------------------------------------------------------------
  P.dueOutreach=function(){
    const today=P.today();
    return P.arr('enquiries').filter(e=>{
      const due=e.nextFollowup||e.nextActionDate;
      return due&&due<=today&&!['Confirmed Booking','Confirmed','Lost Enquiry','Lost'].includes(e.status);
    }).sort((a,b)=>Number(b.value||b.quotedValue||0)-Number(a.value||a.quotedValue||0));
  };

  P.injectCommunications=function(){
    if(typeof currentSection!=='undefined'&&currentSection!=='communications')return;
    const main=document.getElementById('main-content');if(!main||main.querySelector('.wf-outreach'))return;
    const due=P.dueOutreach(),value=due.reduce((s,e)=>s+Number(e.value||e.quotedValue||0),0);
    const block=document.createElement('section');
    block.className='wf-outreach';
    block.innerHTML=`<div class="wf-outreach-head">
      <div><small>TODAY'S OUTREACH</small><h2>${due.length} customer${due.length===1?'':'s'} need contact</h2><p>Due or overdue enquiry actions, ranked by commercial value.</p></div>
      <strong>${P.money(value)}<small>value attached</small></strong>
    </div>
    <div class="wf-outreach-list">${due.length?due.slice(0,10).map(e=>`
      <article>
        <span class="wf-kind">Enquiry</span>
        <span><strong>${P.esc(e.name||e.client||'Enquiry')}</strong><small>${P.esc(e.eventType||'Event')} · ${P.esc(e.status||'Open')} · ${P.esc(P.date(e.nextFollowup||e.nextActionDate))}</small></span>
        ${Number(e.value||e.quotedValue||0)?`<em>${P.money(e.value||e.quotedValue)}</em>`:''}
        <button onclick="WindmillProduct.openRecord('Enquiry','${e.id}')">Open</button>
        <button onclick="if(window.WindmillComms?.open)WindmillComms.open('Enquiry','${e.id}')">Prepare email</button>
      </article>`).join(''):'<div class="wf-good">✓ No enquiry follow-ups are due or overdue.</div>'}</div>`;
    main.prepend(block);
    if(window.lucide)lucide.createIcons();
  };

  // --------------------------------------------------------------------------
  // PANEL
  // --------------------------------------------------------------------------
  P.showPanel=function(kicker,title,subtitle,body){
    const overlay=document.getElementById('wf-product-panel'),panel=document.getElementById('wf-product-panel-body');
    if(!overlay||!panel)return;
    panel.innerHTML=`<header class="wf-panel-head"><div><small>${P.esc(kicker)}</small><h2>${P.esc(title)}</h2><p>${P.esc(subtitle)}</p></div><button onclick="WindmillProduct.closePanel()"><i data-lucide="x"></i></button></header>${body}`;
    overlay.classList.remove('hidden');
    if(window.lucide)lucide.createIcons();
  };
  P.closePanel=()=>document.getElementById('wf-product-panel')?.classList.add('hidden');

  P.init=function(){
    const search=document.getElementById('global-search');
    if(search){
      search.removeAttribute('onkeyup');
      search.placeholder='Search anything…  Ctrl + K';
      search.addEventListener('focus',()=>P.openCommand(search.value));
      search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();P.openCommand(search.value)}});
    }
    document.getElementById('wf-command-input')?.addEventListener('input',e=>P.renderCommand(e.target.value));
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();P.openCommand();}
      if(e.key==='Escape'){P.closeCommand();P.closePanel();}
    });
    // Watch navigation; Communications gets the outreach layer when rendered.
    const target=document.getElementById('main-content');
    if(target){
      new MutationObserver(()=>setTimeout(P.injectCommunications,20)).observe(target,{childList:true,subtree:false});
      setTimeout(P.injectCommunications,100);
    }
  };
  window.addEventListener('load',()=>setTimeout(P.init,500));
})();
