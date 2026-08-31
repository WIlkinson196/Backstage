
// ============================================================================
// WINDMILL FARM — GLOBAL SEARCH FIX
// Top search = live CRM search. Ctrl/Cmd+K = command palette.
// ============================================================================
(function(){
  const S=window.WindmillSearch={};

  S.escape=function(v){
    if(typeof esc==='function')return esc(v);
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  };
  S.norm=v=>String(v??'').toLowerCase().replace(/\s+/g,' ').trim();

  S.records=function(){
    if(window.WindmillProduct?.records){
      try{return WindmillProduct.records()}catch(e){console.warn('Product records unavailable',e)}
    }
    const rows=[];
    const getDB=()=>{try{if(typeof DB!=='undefined'&&DB)return DB}catch(e){}return window.DB||{}};
    const a=k=>{const db=getDB();return Array.isArray(db?.[k])?db[k]:[]};
    a('enquiries').forEach(x=>rows.push({kind:'Enquiry',id:x.id,title:x.name||'Unnamed enquiry',subtitle:`${x.eventType||'Event'} · ${x.status||'Open'}`,date:x.preferredDate||'',email:x.email||'',phone:x.phone||'',value:Number(x.value||x.budget||0),raw:x}));
    a('weddings').forEach(x=>rows.push({kind:'Wedding',id:x.id,title:x.couple||'Wedding',subtitle:`${x.package||'Package TBC'} · ${x.dayGuests||0} day guests`,date:x.date||'',email:x.email||'',phone:x.phone||'',reference:x.bookingReference||x.booking_reference||x.bkReference||'',value:Number(x.totalValue||0),raw:x}));
    a('functions').forEach(x=>rows.push({kind:'Function',id:x.id,title:x.client||'Function',subtitle:`${x.occasion||'Function'} · ${x.guests||0} guests`,date:x.date||'',email:x.email||'',phone:x.phone||'',reference:x.bookingReference||x.booking_reference||x.bkReference||'',value:Number(x.totalValue||0),raw:x}));
    a('companies').forEach(x=>rows.push({kind:'Company',id:x.id,title:x.name||'Company',subtitle:`${x.industry||'Company'} · ${x.relationship||''}`,date:'',email:x.email||'',phone:x.phone||'',value:Number(x.annualValue||0),raw:x}));
    a('opportunities').forEach(x=>rows.push({kind:'Opportunity',id:x.id,title:x.title||'Opportunity',subtitle:`${x.stage||'Pipeline'} · ${x.type||''}`,date:x.expectedCloseDate||x.eventDate||'',email:'',phone:'',reference:x.bookingReference||x.booking_reference||'',value:Number(x.value||0),raw:x}));
    a('salesLeads').forEach(x=>rows.push({kind:'Sales Lead',id:x.id,title:x.companyName||x.contactName||'Sales lead',subtitle:`${x.contactName||'No contact'} · ${x.status||''}`,date:x.nextActionDate||'',email:x.email||'',phone:x.phone||'',value:Number(x.value||x.annualValue||0),raw:x}));
    return rows;
  };


  S.build='SEARCH-GS3-20260820';
  S.indexCount=function(){
    try{return S.records().length}catch(e){return 0}
  };
  S.dbStatus=function(){
    try{
      const db=(typeof DB!=='undefined'&&DB)?DB:(window.DB||{});
      const keys=['enquiries','weddings','functions','companies','opportunities','salesLeads'];
      return keys.map(k=>`${k}:${Array.isArray(db[k])?db[k].length:'—'}`).join(' · ');
    }catch(e){return 'DB unavailable'}
  };
  S.find=function(query){
    const q=S.norm(query);
    if(!q)return [];

    // Use the Product Maturity deep index where available so top-search and
    // Ctrl/Cmd+K return the same CRM records.
    if(window.WindmillProduct?.records&&window.WindmillProduct?.recordScore){
      try{
        return WindmillProduct.records()
          .map(r=>({...r,score:WindmillProduct.recordScore(r,q)}))
          .filter(r=>r.score>=0)
          .sort((a,b)=>b.score-a.score||(b.value||0)-(a.value||0))
          .slice(0,15);
      }catch(e){console.warn('Deep search fallback',e)}
    }

    const deep=(obj)=>{
      const vals=[];
      const walk=(v,d=0)=>{
        if(d>3||v===null||v===undefined)return;
        if(Array.isArray(v)){v.slice(0,50).forEach(x=>walk(x,d+1));return;}
        if(typeof v==='object'){Object.entries(v).forEach(([k,x])=>{vals.push(k);if(['string','number','boolean'].includes(typeof x))vals.push(String(x));else walk(x,d+1)});return;}
        vals.push(String(v));
      };
      walk(obj);return S.norm(vals.join(' '));
    };

    return S.records().map(r=>{
      const hay=S.norm([r.kind,r.title,r.subtitle,r.date,r.email,r.phone,r.reference,deep(r.raw||{})].join(' '));
      if(!hay.includes(q))return null;
      let score=1;
      if(S.norm(r.title)===q)score+=100;
      else if(S.norm(r.title).startsWith(q))score+=70;
      else if(S.norm(r.title).includes(q))score+=45;
      if(S.norm(r.email).includes(q))score+=70;
      if(S.norm(r.phone).includes(q))score+=60;
      if(S.norm(r.reference).includes(q))score+=90;
      if(S.norm(r.date).includes(q))score+=30;
      return {...r,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||(b.value||0)-(a.value||0)).slice(0,15);
  };

  S.open=function(kind,id){
    S.close();
    const input=document.getElementById('global-search');
    if(input)input.value='';
    if(window.WindmillProduct?.openRecord)return WindmillProduct.openRecord(kind,id);
    if(kind==='Enquiry'&&typeof viewEnquiry==='function')return viewEnquiry(id);
    if(kind==='Wedding'&&typeof openWeddingWorkspace==='function')return openWeddingWorkspace(id);
    if(kind==='Function'&&typeof openFunctionWorkspace==='function')return openFunctionWorkspace(id);
  };

  S.render=function(query){
    const el=document.getElementById('search-results');if(!el)return;
    const q=String(query||'').trim();
    if(!q){S.close();return;}
    const rows=S.find(q);
    el.innerHTML=rows.length?`
      <div class="wf-live-search-head">
        <span>SEARCH RESULTS</span>
        <small>${rows.length} match${rows.length===1?'':'es'} · ${S.indexCount()} records indexed · ${S.build}</small>
      </div>
      ${rows.map(r=>`<button class="wf-live-search-row" onclick="WindmillSearch.open('${r.kind}','${r.id}')">
        <span class="wf-live-kind">${S.escape(r.kind)}</span>
        <span class="wf-live-copy"><strong>${S.escape(r.title)}</strong><small>${S.escape(r.subtitle)}${r.date?' · '+S.escape(r.date):''}</small></span>
        ${r.value?`<em>£${Number(r.value).toLocaleString('en-GB',{maximumFractionDigits:0})}</em>`:''}
        <i data-lucide="arrow-up-right"></i>
      </button>`).join('')}
      <button class="wf-search-command" onclick="WindmillSearch.openCommandFromSearch()"><i data-lucide="command"></i><span><strong>Open command palette</strong><small>Navigate or open cross-app tools</small></span><kbd>Ctrl K</kbd></button>
    `:`<div class="wf-live-no-results"><i data-lucide="search-x"></i><strong>No results for “${S.escape(q)}”</strong><small>Try a customer name, booking reference, date, email, phone number, company or event type.</small><code>${S.indexCount()} indexed · ${S.dbStatus()}</code><button onclick="WindmillSearch.openCommandFromSearch()">Search commands instead</button></div>`;
    el.classList.remove('hidden');
    if(window.lucide)lucide.createIcons();
  };

  S.close=function(){document.getElementById('search-results')?.classList.add('hidden')};
  S.openCommandFromSearch=function(){
    const q=document.getElementById('global-search')?.value||'';
    S.close();
    if(window.WindmillProduct?.openCommand)WindmillProduct.openCommand(q);
  };

  // Replace legacy global search function so the original inline handler is safe too.
  window.handleGlobalSearch=function(ev){
    S.render(ev?.target?.value||'');
  };

  S.init=function(){
    const input=document.getElementById('global-search');
    if(!input)return;

    // Clone removes all listeners previously attached by Product Maturity / old search code,
    // while preserving the visible element and its ID/classes.
    const fresh=input.cloneNode(true);
    input.parentNode.replaceChild(fresh,input);
    fresh.removeAttribute('onkeyup');
    fresh.placeholder='Search customers, dates, emails, companies…';
    fresh.setAttribute('autocomplete','off');

    fresh.addEventListener('input',e=>S.render(e.target.value));
    fresh.addEventListener('focus',e=>{if(e.target.value.trim())S.render(e.target.value)});
    fresh.addEventListener('keydown',e=>{
      if(e.key==='Escape'){S.close();fresh.blur()}
      if(e.key==='Enter'){
        const first=S.find(fresh.value)[0];
        if(first){e.preventDefault();S.open(first.kind,first.id)}
      }
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();
        S.openCommandFromSearch();
      }
    });

    // Rebuild outside-click behaviour safely.
    document.addEventListener('click',e=>{
      if(!e.target.closest('#global-search')&&!e.target.closest('#search-results'))S.close();
    });

    // Ctrl/Cmd+K always opens the command palette, regardless of search focus.
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();
        S.openCommandFromSearch();
      }
    });
  };

  window.addEventListener('load',()=>setTimeout(S.init,750));
})();

