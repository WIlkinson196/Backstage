// ============================================================================
// THE GRANARY AT WINDMILL FARM — CUSTOMER DOCUMENT ENGINE · WEDDING V2 PHASE 10
// Customer-facing print/PDF templates with personalised wedding content.
// Internal operational sheets remain separate so presentation stays premium.
// ============================================================================
(function(){
  const BRAND = {
    venue: 'The Granary',
    parent: 'at Windmill Farm',
    address: 'Whisby Road, Lincoln, Lincolnshire, LN6 3QZ',
    olive: '#566a3a',
    deepOlive: '#39472b',
    cream: '#f7f3e8',
    champagne: '#c9ad76',
    ink: '#252821',
    softInk: '#676b61'
  };

  const e = value => (typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])));
  const moneyFmt = value => typeof money === 'function' ? money(Number(value||0)) : `£${Number(value||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  function dateLong(value){
    if(!value) return 'Date to be confirmed';
    const d = new Date(`${value}T12:00:00`);
    if(Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  function timePretty(value){
    if(!value || !/^\d{2}:\d{2}$/.test(value)) return '';
    const [h,m]=value.split(':').map(Number);
    const suffix=h>=12?'pm':'am';
    return `${h%12||12}:${String(m).padStart(2,'0')} ${suffix}`;
  }

  function wordmark(){
    return `<div class="granary-wordmark" aria-label="The Granary at Windmill Farm">
      <div class="granary-mark"><span>G</span></div>
      <div class="granary-name"><strong>THE GRANARY</strong><span>at Windmill Farm</span></div>
    </div>`;
  }

  function baseCss(){ return `
    :root{--olive:${BRAND.olive};--deep:${BRAND.deepOlive};--cream:${BRAND.cream};--gold:${BRAND.champagne};--ink:${BRAND.ink};--muted:${BRAND.softInk}}
    *{box-sizing:border-box} html,body{margin:0;padding:0;background:#d8d8d4;color:var(--ink);font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{padding:28px 0}.document{width:210mm;margin:0 auto;box-shadow:0 10px 35px rgba(0,0,0,.16);background:white}
    .page{width:210mm;height:297mm;max-height:297mm;background:#fff;padding:14mm 17mm 10mm;page-break-after:always;break-after:page;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;box-sizing:border-box}
    .page:last-child{page-break-after:auto;break-after:auto}.page.cover{height:297mm;max-height:297mm;padding:0;background:var(--deep);color:white;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}
    .cover-art{position:absolute;inset:0;overflow:hidden}.cover-art:before,.cover-art:after{content:"";position:absolute;border:1px solid rgba(201,173,118,.32);border-radius:50%}
    .cover-art:before{width:145mm;height:145mm;right:-60mm;top:-35mm}.cover-art:after{width:105mm;height:105mm;left:-52mm;bottom:-25mm}
    .cover-inner{position:relative;z-index:2;padding:26mm 20mm 18mm;height:297mm;display:flex;flex-direction:column}
    .granary-wordmark{display:flex;align-items:center;gap:11px}.granary-mark{width:42px;height:42px;border:1.5px solid var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Georgia,'Times New Roman',serif;font-size:25px;color:var(--gold)}
    .granary-name{display:flex;flex-direction:column;line-height:1}.granary-name strong{font-size:14px;letter-spacing:3.2px;font-weight:600}.granary-name span{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:12px;margin-top:5px;opacity:.86}
    .cover .granary-name strong{color:white}.cover .granary-name span{color:#ede7d8}.cover-rule{width:35mm;height:1px;background:var(--gold);margin:8mm 0}
    h1,h2,h3{font-family:Georgia,'Times New Roman',serif;font-weight:normal;margin:0}h1{font-size:38pt;line-height:1.03}h2{font-size:24pt;line-height:1.15;color:var(--deep)}h3{font-size:15pt;color:var(--deep)}
    .cover-kicker,.eyebrow{font-size:8.5pt;font-weight:700;letter-spacing:2.6px;text-transform:uppercase}.cover-kicker{color:#d9c69d}.eyebrow{color:var(--olive);margin-bottom:3mm}
    .cover-couple{margin-top:auto;margin-bottom:auto;max-width:150mm}.cover-couple p{font-size:11pt;color:#ede7d8;line-height:1.65;max-width:120mm}.cover-meta{display:flex;justify-content:space-between;gap:12mm;padding-top:7mm;border-top:1px solid rgba(255,255,255,.22);font-size:9pt;color:#ede7d8}.cover-meta strong{display:block;color:white;font-size:10pt;margin-bottom:2px}
    .page-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:4mm;border-bottom:1px solid #e8e3d7;margin-bottom:7mm;flex:none}.page-header .granary-mark{width:30px;height:30px;font-size:18px}.page-header .granary-name strong{font-size:9px;letter-spacing:2.2px;color:var(--deep)}.page-header .granary-name span{font-size:9px}.page-no{font-size:8pt;color:#8a8c83}
    .lead{font-family:Georgia,'Times New Roman',serif;font-size:13pt;line-height:1.65;color:#50554a;max-width:165mm}.body-copy{font-size:9.5pt;line-height:1.65;color:#565a52}
    .hero-band{background:var(--cream);margin:8mm -18mm 10mm;padding:9mm 18mm;border-top:1px solid #ece4d1;border-bottom:1px solid #ece4d1}.hero-band h2{font-size:22pt}
    .facts{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin:8mm 0}.fact{border:1px solid #e5dfd1;border-radius:7px;padding:4mm;background:#fff}.fact span{display:block;text-transform:uppercase;letter-spacing:1.2px;font-size:6.8pt;color:#8a8c83;margin-bottom:2mm}.fact strong{font-family:Georgia,'Times New Roman',serif;font-size:11pt;color:var(--deep);font-weight:normal}
    .feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.feature{border-top:2px solid var(--gold);padding:5mm 5mm 4mm;background:#fbfaf6;min-height:36mm}.feature h3{font-size:13pt;margin-bottom:2mm}.feature p{margin:0;font-size:8.8pt;line-height:1.55;color:#676b61}
    .timeline{margin:8mm 0 0;position:relative}.timeline:before{content:"";position:absolute;left:21mm;top:4mm;bottom:4mm;width:1px;background:#ddd2b9}.timeline-row{display:grid;grid-template-columns:16mm 1fr;gap:10mm;position:relative;padding:0 0 6mm}.timeline-time{font-size:8.5pt;font-weight:700;color:var(--olive);text-align:right;padding-top:1mm}.timeline-dot{position:absolute;left:19.4mm;top:2.3mm;width:3.4mm;height:3.4mm;border-radius:50%;background:var(--gold);border:1.1mm solid white}.timeline-row h3{font-size:12.5pt}.timeline-row p{font-size:8.5pt;color:#777a72;margin:1mm 0 0;line-height:1.45}
    .quote-table{width:100%;border-collapse:collapse;margin-top:7mm;font-size:9pt}.quote-table th{text-align:left;color:#7b7d75;text-transform:uppercase;letter-spacing:1.1px;font-size:7pt;border-bottom:1px solid #dcd7cc;padding:0 0 3mm}.quote-table th:last-child,.quote-table td:last-child{text-align:right}.quote-table td{padding:3.3mm 0;border-bottom:1px solid #efebe3;vertical-align:top}.quote-table .qty{color:#84877f;width:18mm}.quote-total{margin-top:7mm;margin-left:auto;width:78mm;background:var(--deep);color:white;padding:6mm;border-radius:6px}.quote-total-row{display:flex;justify-content:space-between;font-size:8.8pt;margin:1.5mm 0}.quote-total-row.grand{font-family:Georgia,'Times New Roman',serif;font-size:17pt;padding-top:4mm;margin-top:4mm;border-top:1px solid rgba(255,255,255,.25)}
    .note-card{padding:5mm;border:1px solid #e5dfd1;background:#fbfaf6;border-radius:6px;font-size:8.7pt;line-height:1.55;color:#64675f;margin-top:7mm}.note-card strong{color:var(--deep)}
    .journey{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:8mm}.journey-step{position:relative;padding:5mm 5mm 5mm 14mm;background:var(--cream);min-height:31mm;border-radius:6px}.journey-step .num{position:absolute;left:5mm;top:5mm;width:6mm;height:6mm;border-radius:50%;background:var(--olive);color:#fff;font-size:7pt;display:flex;align-items:center;justify-content:center;font-weight:bold}.journey-step strong{font-family:Georgia,'Times New Roman',serif;color:var(--deep);font-weight:normal;font-size:11pt}.journey-step p{font-size:8pt;line-height:1.45;color:#72756d;margin:1.5mm 0 0}
    .next-box{margin-top:9mm;background:var(--deep);color:white;padding:8mm;border-radius:7px}.next-box h2{color:white;font-size:20pt}.next-box p{font-size:9pt;line-height:1.6;color:#ecebe5}.next-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:5mm}.next-action{padding:4mm;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);font-size:8.2pt;line-height:1.4}.next-action strong{display:block;color:#e1c892;margin-bottom:1.5mm}
    .signature-line{margin-top:8mm;padding-top:5mm;border-top:1px solid #dfd9ca;display:flex;justify-content:space-between;gap:10mm;color:#72756d;font-size:8.3pt}.footer{display:flex;justify-content:space-between;gap:8mm;border-top:1px solid #eee9df;padding-top:3mm;font-size:6.8pt;color:#989a93;align-self:end}.footer strong{color:#6d7068}
    .avoid{break-inside:avoid;page-break-inside:avoid}.muted{color:#777b72}.gold{color:var(--gold)}
    .section-grid{display:grid;grid-template-columns:1fr 1fr;gap:3.2mm;margin-top:5mm}.detail-card{border:1px solid #e5dfd1;border-radius:7px;padding:4mm;background:#fff;break-inside:avoid;page-break-inside:avoid}.detail-card.wide{grid-column:1/-1}.detail-card h3{font-size:13pt;margin-bottom:2.5mm}.detail-card p{font-size:8.4pt;line-height:1.55;color:#686c63;margin:1mm 0}.detail-list{list-style:none;padding:0;margin:2mm 0 0}.detail-list li{position:relative;padding:1.5mm 0 1.5mm 5mm;border-bottom:1px solid #f0ece4;font-size:8.6pt;line-height:1.45;color:#555950}.detail-list li:last-child{border-bottom:0}.detail-list li:before{content:"";position:absolute;left:0;top:3mm;width:1.8mm;height:1.8mm;border-radius:50%;background:var(--gold)}
    .pill-row{display:flex;flex-wrap:wrap;gap:2mm;margin-top:3mm}.pill{display:inline-flex;align-items:center;padding:1.8mm 3mm;border-radius:999px;background:var(--cream);border:1px solid #e8dfca;font-size:7.6pt;color:#555950}.pill strong{color:var(--deep);font-weight:600}.subtle-title{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:1.4px;color:#909289;margin-bottom:2mm}.decision-list{margin-top:7mm;display:grid;grid-template-columns:1fr 1fr;gap:3mm}.decision{padding:4mm;border-radius:6px;background:#fbfaf6;border-left:2px solid var(--gold);font-size:8.3pt;line-height:1.45;color:#5d6158}.decision strong{display:block;color:var(--deep);font-family:Georgia,'Times New Roman',serif;font-size:10.5pt;font-weight:normal;margin-bottom:1mm}.complete-card{padding:6mm;border-radius:7px;background:var(--deep);color:white;margin-top:7mm}.complete-card strong{font-family:Georgia,'Times New Roman',serif;font-size:16pt;font-weight:normal}.complete-card p{font-size:8.4pt;line-height:1.55;color:#ecebe5;margin:2mm 0 0}.mini-table{width:100%;border-collapse:collapse;margin-top:2mm;font-size:7.9pt}.mini-table td{padding:1.45mm 0;border-bottom:1px solid #efebe3;vertical-align:top;overflow-wrap:anywhere}.mini-table td:first-child{color:#7a7e74;width:35%}.mini-table td:last-child{font-weight:600;color:#3e433a}.selection-heading{font-family:Georgia,'Times New Roman',serif;font-size:11pt;color:var(--deep);margin:4mm 0 1mm}.soft-panel{background:var(--cream);border:1px solid #e9e0ca;border-radius:7px;padding:5mm;margin-top:5mm}.soft-panel p{font-size:8.4pt;line-height:1.55;color:#65695f;margin:0}

    .recorded-plan{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:5mm;align-items:start}.recorded-section{border:1px solid #e5dfd1;border-radius:6px;padding:3.5mm;break-inside:avoid;page-break-inside:avoid;min-width:0}.recorded-section h3{font-size:11.5pt;border-bottom:1px solid #eee8dc;padding-bottom:2mm;margin-bottom:1mm}.check-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:6mm}.check-item{display:flex;align-items:flex-start;gap:3mm;padding:3.5mm;border:1px solid #e5dfd1;border-radius:6px;background:#fff;font-size:8.5pt}.check-item span{font-size:12pt;color:var(--olive);line-height:1}.check-item strong{font-weight:600;color:var(--deep)}.detail-card,.soft-panel,.note-card,.quote-total,.decision,.check-item,.recorded-section,.journey-step{break-inside:avoid;page-break-inside:avoid}
    .pack-warning{padding:3mm 4mm;background:#fff7e6;border:1px solid #ead39b;border-radius:6px;font-size:7.8pt;line-height:1.45;color:#6f5b2c}
    .page-body{min-height:0;overflow:hidden}.customer-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm;align-items:start}.customer-card{border:1px solid #e5dfd1;border-radius:7px;padding:3.5mm;background:#fff;break-inside:avoid;page-break-inside:avoid}
    @media print{html,body{background:white;width:210mm;margin:0!important;padding:0!important}.document{box-shadow:none;width:210mm;margin:0}.page{width:210mm;min-height:297mm;margin:0!important;box-shadow:none;page-break-inside:avoid}.page.cover{height:297mm}@page{size:A4 portrait;margin:0}}
  `; }

  function pageHeader(page,total){return `<div class="page-header">${wordmark()}<span class="page-no">${page} / ${total}</span></div>`;}
  function footer(label='Wedding Proposal'){return `<div class="footer"><span><strong>${BRAND.venue}</strong> ${BRAND.parent} · ${BRAND.address}</span><span>${e(label)}</span></div>`;}

  function openDocument(title, pages, autoPrint=true){
    const win=window.open('','_blank');
    if(!win){ if(typeof toast==='function') toast('Allow pop-ups to open the customer document','error'); return; }
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${e(title)}</title><style>${baseCss()}</style></head><body><main class="document">${pages}</main>${autoPrint?'<script>window.onload=()=>setTimeout(()=>window.print(),350)<\/script>':''}</body></html>`);
    win.document.close();
  }

  function profileOf(w){
    if(String(w?.id||'').startsWith('enquiry-')){
      const b=w.preBookingBrief||{}, fmt=b.weddingFormat||'ceremony_reception';
      return {weddingFormat:fmt,ceremonyLocationType:b.ceremonyLocation==='windmill_farm'?'granary':(['external','church','registry','other'].includes(b.ceremonyLocation)?'external':'none'),dayMealRequired:fmt!=='evening_only',eveningFoodRequired:true,accommodationRequired:b.accommodation!=='no',djRequired:true,externalCeremonyVenue:b.ceremonyLocation==='church'?'Church':b.ceremonyLocation==='registry'?'Registry Office':'your chosen ceremony venue'};
    }
    return typeof weddingProfile==='function' ? weddingProfile(w) : {};
  }
  function formatLabel(w){ const p=profileOf(w); return (window.WEDDING_FORMATS && WEDDING_FORMATS[p.weddingFormat]?.label) || ({full:'Ceremony & Reception',twilight:'Twilight Wedding',reception_only:'Reception Only',evening_only:'Evening Wedding'}[p.weddingFormat]) || 'Ceremony & Reception'; }

  function suspiciousWeddingTime(label,time){
    if(!time)return false;
    const t=String(time).slice(0,5);
    return (/first dance|cake cutting|speeches/i.test(label) && ['00:00','00:01'].includes(t));
  }

  function indicativeTimeline(w){
    const isProspective=String(w?.id||'').startsWith('enquiry-');
    const p=profileOf(w), known = typeof weddingMasterTimingRows==='function' && !isProspective ? weddingMasterTimingRows(w) : [];
    const saved=Object.fromEntries(known.map(([label,time])=>[label,time]));
    const fallback=(value,illustrative)=>value||(isProspective?illustrative:'TBC');
    const pb=w.preBookingBrief||{};
    if(pb.ceremonyTime) saved['Ceremony']=pb.ceremonyTime;
    if(pb.ceremonyTime) saved['External ceremony']=pb.ceremonyTime;
    if(pb.arrivalTime){ saved['Guest arrival']=pb.arrivalTime; saved['Arrive at Windmill Farm']=pb.arrivalTime; }
    if(pb.weddingBreakfastTime) saved['Wedding breakfast']=pb.weddingBreakfastTime;
    if(pb.eveningStartTime) saved['First dance']=pb.eveningStartTime;
    const rows=[];
    if(p.weddingFormat==='evening_only'){
      rows.push(['Guest arrival',fallback(saved['Guest arrival'],'18:30'),'Your evening celebration begins at The Granary.']);
      rows.push(['Welcome & drinks','19:00','Time to settle in, meet friends and enjoy the room.']);
      rows.push(['First dance',fallback(saved['First dance'],'19:30'),'A special moment before the dancefloor opens.']);
      if(p.eveningFoodRequired!==false) rows.push(['Evening food',fallback(saved['Evening food'],'20:30'),'Your selected evening food service is served.']);
      rows.push(['Finish',fallback(saved['Finish'],'00:00'),'Last dances and a wonderful end to the celebration.']);
      return rows;
    }
    if(p.ceremonyLocationType==='external'){
      rows.push(['Ceremony',fallback(saved['External ceremony'],'13:30'),`Your ceremony takes place at ${p.externalCeremonyVenue||'your chosen ceremony venue'}.`]);
      rows.push(['Arrival',fallback(saved['Arrive at Windmill Farm'],'15:00'),'Arrive at The Granary for drinks, photographs and celebrations.']);
    }else if(p.weddingFormat==='reception_only'){
      rows.push(['Arrival',fallback(saved['Guest arrival'],'15:00'),'Your reception begins at The Granary.']);
    }else{
      rows.push(['Guest arrival',fallback(saved['Guest arrival'],'12:30'),'Guests arrive, settle in and enjoy the anticipation.']);
      rows.push(['Ceremony',fallback(saved['Ceremony'],'14:00'),'Say “I do” in The Granary.']);
      rows.push(['Drinks & photographs','14:30','Celebrate, mingle and capture the just-married moments.']);
    }
    if(p.dayMealRequired!==false) rows.push(['Wedding breakfast',fallback(saved['Wedding breakfast'],'16:00'),'Your wedding breakfast is served.']);
    if(saved['Speeches'] || p.dayMealRequired!==false) rows.push(['Speeches',fallback(saved['Speeches'],'18:00'),'Raise a glass and enjoy the words that make the day personal.']);
    rows.push(['Evening celebration',fallback(saved['First dance'],'19:30'),'Cake, first dance and the evening celebration begin.']);
    if(p.eveningFoodRequired!==false) rows.push(['Evening food',fallback(saved['Evening food'],'20:30'),'Your selected evening food service is served.']);
    rows.push(['Finish',fallback(saved['Finish'],'00:00'),'The last dance — and the beginning of married life.']);
    return rows;
  }

  function isIndicative(w){
    if(!String(w?.id||'').startsWith('enquiry-')) return false;
    const rows = typeof weddingMasterTimingRows==='function' ? weddingMasterTimingRows(w) : [];
    return rows.some(([,time])=>!time);
  }

  function plan(w,section){
    try{
      if(typeof weddingPrepPlanning==='function') return weddingPrepPlanning(w.id,section)||{};
      if(typeof planningData==='function') return planningData(w.id,section)||{};
    }catch(err){}
    return {};
  }

  function clean(value){ return String(value??'').trim(); }
  function customerValue(value){
    const v=clean(value);
    if(!v)return '';
    if(['none','no','n/a','not required','-','--','unknown','tbc','null','undefined','yeso','o','non'].includes(v.toLowerCase()))return '';
    return v;
  }
  function selected(value){ return !!customerValue(value); }
  function customerText(value){
    const v=customerValue(value); if(!v)return '';
    return v.replace(/\bspec-\d+\b/gi,'').replace(/\s{2,}/g,' ').trim();
  }

  function quoteExtras(d,calc){
    return (calc.lines||[]).filter(x=>!['package','guest'].includes(x.type));
  }

  function packageSnapshot(w,d,calc){
    const lines=[];
    lines.push(`${d.packageName||w.package||'Bespoke'} wedding package`);
    if(Number(d.dayGuests||w.dayGuests||0)) lines.push(`${Number(d.dayGuests||w.dayGuests||0)} day guests planned`);
    if(Number(d.eveningGuests||w.eveningGuests||0)) lines.push(`${Number(d.eveningGuests||w.eveningGuests||0)} evening guests planned`);
    if(selected(d.menu)) lines.push(`${d.menu}${d.menuIncluded?' · included in package':''}`);
    if(selected(d.drinks)) lines.push(`${d.drinks} drinks package${d.drinksIncluded?' · included in package':''}`);
    if(selected(d.eveningFood)) lines.push(`${d.eveningFood}${d.eveningFoodIncluded?' · included in package':''}`);
    weddingPackageConfirmedInclusions(w,d,calc).forEach(x=>{if(!lines.includes(x))lines.push(x);});
    quoteExtras(d,calc).forEach(x=>lines.push(`${x.name}${Number(x.quantity||0)>1?` × ${Number(x.quantity)}`:''}`));
    if(d.packageName!=='Bespoke' && !weddingPackageConfirmedInclusions(w,d,calc).length){
      lines.push('Full package inclusions: awaiting authoritative brochure configuration');
    }
    return lines;
  }

  function foodSummary(w,d){
    const reception=plan(w,'reception');
    const services=Array.isArray(reception.eveningFoodServices)?reception.eveningFoodServices.filter(x=>x&&x.menuKey):[];
    const guests=(DB.weddingGuests||[]).filter(g=>g.weddingId===w.id);
    const counts=key=>{
      const map={}; guests.forEach(g=>{const v=clean(g[key]);if(v)map[v]=(map[v]||0)+1;});
      return Object.entries(map).sort((a,b)=>b[1]-a[1]);
    };
    const kitchenName=id=>{
      try{return window.KitchenApp&&typeof KitchenApp.recipeById==='function'?(KitchenApp.recipeById(id)?.name||id):id;}catch(err){return id;}
    };
    const serviceRows=services.map(service=>{
      const selectedItems=(service.selectedIds||[]).map(kitchenName).filter(Boolean);
      const allocations=Object.entries(service.allocations||{}).filter(([,n])=>Number(n)>0).map(([key,n])=>`${key}: ${Number(n)} covers`);
      return {name:service.menuLabel||service.menuKey||'Evening food',covers:Number(service.guests||0),time:service.time||'',items:[...selectedItems,...allocations],notes:service.notes||''};
    });
    return {
      breakfast: reception.weddingBreakfastMenu||d.menu||'None',
      mealService: reception.mealService||'',
      menuNotes: reception.menuNotes||'',
      starterCounts:counts('starterChoice'), mainCounts:counts('mainChoice'), dessertCounts:counts('dessertChoice'),
      services:serviceRows
    };
  }

  function drinksSummary(w,d){
    const r=plan(w,'reception'),pkg=r.drinksPackage||d.drinks||'None';
    const split=pkg==='Bespoke'?[...bespokeDrinkSummaryRows(r,'bespokeWelcomeDrinks','Welcome'),...bespokeDrinkSummaryRows(r,'bespokeToastDrinks','Toast')].map(([name,value])=>[`${name} — ${value}`,1]):[['Peroni',r.beerGuests],['White wine',r.whiteWineGuests],['Red wine',r.redWineGuests],['Rosé wine',r.roseWineGuests],['Soft drinks',r.softDrinkGuests]].filter(([,n])=>Number(n)>0);
    return {packageName:pkg,split};
  }

  function decorSummary(w,d,calc){
    const decor=plan(w,'decor');
    const quoteDecor=quoteExtras(d,calc).filter(x=>/chair|sash|balloon|curtain|love|mr & mrs|centrepiece|aisle|hexagon|throne|mood|swing|swag|sweet cart|background|decor/i.test(x.name||''));
    const details=[
      ['Colour scheme',decor.colourScheme],['Chair covers / sash',decor.chairCovers],['Centrepieces',decor.centrepieces],['Top table',decor.topTable],['Backdrop',decor.backdrop],['Welcome sign / table plan',decor.welcomeSign]
    ].filter(([,v])=>selected(v));
    return {details,quoteDecor};
  }

  function accommodationSummary(w){
    const p=profileOf(w), b=plan(w,'bedrooms');
    if(p.accommodationRequired===false) return {required:false,details:[]};
    const details=[['Rooms required',b.roomsRequired],['Bridal suite',b.bridalSuite],['Night-before rooms',b.nightBeforeRooms],['Room release date',b.roomReleaseDate?dateLong(b.roomReleaseDate):''],['Breakfast time',timePretty(b.breakfastTime)||b.breakfastTime],['Accessible requirements',b.accessibleRooms]].filter(([,v])=>selected(v));
    return {required:true,details,notes:b.bedroomNotes||''};
  }

  function supplierSummary(w){
    const s=plan(w,'suppliers');
    return [['Photographer',s.photographer],['Videographer',s.videographer],['Florist',s.florist],['Cake',s.cakeSupplier],['Entertainment',s.entertainment],['DJ',s.dj],['Transport',s.transport]].filter(([,v])=>selected(v));
  }

  function musicSummary(w){
    const m=plan(w,'music');
    return [['DJ setup / access',m.djSetupTime?timePretty(m.djSetupTime):m.djSetupTime],['DJ start',m.djStart?timePretty(m.djStart):m.djStart],['DJ finish',m.djFinish?timePretty(m.djFinish):m.djFinish],['Reception entrance',m.receptionEntranceSong],['Cake cutting',m.cakeCutSong],['First dance',m.firstDanceSong],['Father / daughter dance',m.fatherDaughterSong],['Must-play songs',m.mustPlay],['Do-not-play songs',m.doNotPlay],['Music style / preferences',m.musicStyle],['Guest request policy',m.guestRequests],['Live act',m.liveActRequirements],['Music / DJ notes',m.musicNotes]].filter(([,v])=>selected(v));
  }


  function weddingCustomerPackUpdatedAt(w){
    const stamps=[];
    if(w?.updatedAt)stamps.push(w.updatedAt);
    try{
      (DB.weddingPlanning||[]).filter(x=>x.weddingId===w.id).forEach(x=>{if(x.updatedAt)stamps.push(x.updatedAt);});
      (DB.weddingQuotes||[]).filter(x=>x.weddingId===w.id).forEach(x=>{if(x.createdAt)stamps.push(x.createdAt);});
    }catch(err){}
    const valid=stamps.map(x=>new Date(x)).filter(x=>!Number.isNaN(x.getTime())).sort((a,b)=>b-a);
    return valid[0]||new Date();
  }
  function customerPackOverviewRows(w,d,calc){
    const p=profileOf(w),r=plan(w,'reception'),rows=[
      ['Couple',w.couple||'TBC'],['Wedding date',w.date?dateLong(w.date):'TBC'],['Wedding format',formatLabel(w)],
      ['Package',d.packageName||w.package||'TBC'],['Day guests',Number(d.dayGuests||w.dayGuests||0)||'TBC'],
      ['Evening guests',Number(d.eveningGuests||w.eveningGuests||0)||'TBC'],['Coordinator',w.coordinator||'TBC']
    ];
    if(p.ceremonyLocationType==='external'){
      rows.push(['Ceremony location',p.externalCeremonyVenue||'TBC']);
      rows.push(['External ceremony time',p.externalCeremonyTime?timePretty(p.externalCeremonyTime):'TBC']);
      rows.push(['Arrival at Windmill Farm',(p.venueArrivalTime||r.arrivalTime)?timePretty(p.venueArrivalTime||r.arrivalTime):'TBC']);
    }else if(typeof weddingHasOnsiteCeremony==='function'&&weddingHasOnsiteCeremony(w)){
      const c=plan(w,'ceremony'); rows.push(['Ceremony at Windmill Farm',c.ceremonyTime?timePretty(c.ceremonyTime):'TBC']);
    }
    rows.push(['Current quoted total',moneyFmt(calc.total)]);
    if(Number(w.paid||0)>0)rows.push(['Payments recorded',moneyFmt(w.paid)]);
    if(Number(w.balance||0)>=0)rows.push(['Balance on wedding record',moneyFmt(w.balance||0)]);
    return rows;
  }
  function bespokeDrinkSummaryRows(r,key,label){
    return (Array.isArray(r?.[key])?r[key]:[]).filter(x=>x&&selected(x.drink)&&Number(x.quantity||0)>0)
      .map(x=>[`${label} · ${x.drink}`,`${Number(x.quantity)}${x.notes?` · ${x.notes}`:''}`]);
  }
  function customerPackPlanningRows(w){
    const p=profileOf(w),r=plan(w,'reception'),c=plan(w,'ceremony'),decor=plan(w,'decor'),layout=plan(w,'layout'),music=plan(w,'music'),sup=plan(w,'suppliers'),bed=plan(w,'bedrooms');
    const rows=[],add=(section,label,value)=>{if(selected(value)||value===0)rows.push({section,label,value:String(value)})};
    if(p.ceremonyLocationType==='external'){
      add('Ceremony','Ceremony venue',p.externalCeremonyVenue);add('Ceremony','Ceremony time',timePretty(p.externalCeremonyTime)||p.externalCeremonyTime);add('Ceremony','Expected arrival at Windmill Farm',timePretty(p.venueArrivalTime||r.arrivalTime)||p.venueArrivalTime||r.arrivalTime);
    }else if(typeof weddingHasOnsiteCeremony==='function'&&weddingHasOnsiteCeremony(w)){
      [['Ceremony time',timePretty(c.ceremonyTime)||c.ceremonyTime],['Ceremony location',c.ceremonyLocation],['Registrar / celebrant',c.registrarName],['Ceremony guests',c.ceremonyGuests],['Groom registrar room',c.groomRegistrarRoom],['Bride registrar room',c.brideRegistrarRoom],['Ceremony notes',c.ceremonyNotes]].forEach(([l,v])=>add('Ceremony',l,v));
    }
    [['Arrival / reception time',timePretty(r.arrivalTime)||r.arrivalTime],['Wedding breakfast time',timePretty(r.weddingBreakfastTime)||r.weddingBreakfastTime],['Speeches time',timePretty(r.speechesTime)||r.speechesTime],['Cake cutting time',timePretty(r.cakeCutTime)||r.cakeCutTime],['First dance time',timePretty(r.firstDanceTime)||r.firstDanceTime],['Evening food time',timePretty(r.eveningFoodTime)||r.eveningFoodTime],['Finish time',timePretty(r.finishTime)||r.finishTime]].forEach(([l,v])=>add('Reception',l,v));
    (Array.isArray(r.additionalTimings)?r.additionalTimings:[]).forEach(x=>{if(x&&(x.label||x.time))add('Additional timings',x.label||'Additional timing',`${timePretty(x.time)||x.time||'TBC'}${x.notes?` · ${x.notes}`:''}`)});
    [['Day meal service',r.mealService],['Wedding breakfast menu',r.weddingBreakfastMenu],['Menu / dietary notes',r.menuNotes]].forEach(([l,v])=>add('Food',l,v));
    (Array.isArray(r.eveningFoodServices)?r.eveningFoodServices:[]).forEach((x,i)=>{if(x)add('Food',`Evening food ${i+1}`,`${x.menuLabel||x.menuKey||'TBC'}${x.guests?` · ${Number(x.guests)} covers`:''}${x.time?` · ${timePretty(x.time)}`:''}${x.notes?` · ${x.notes}`:''}`)});
    add('Drinks','Drinks package',r.drinksPackage);
    if(r.drinksPackage==='Bespoke'){
      bespokeDrinkSummaryRows(r,'bespokeWelcomeDrinks','Welcome').forEach(([l,v])=>add('Drinks',l,v));
      bespokeDrinkSummaryRows(r,'bespokeToastDrinks','Toast').forEach(([l,v])=>add('Drinks',l,v));
    }
    [['Colour scheme',decor.colourScheme],['Chair covers / sash',decor.chairCovers],['Centrepieces',decor.centrepieces],['Top table',decor.topTable],['Backdrop',decor.backdrop],['Welcome sign / table plan',decor.welcomeSign],['Décor notes',decor.decorNotes]].forEach(([l,v])=>add('Décor',l,v));
    [['Table style',layout.tableShape],['Top table style',layout.topTableStyle],['Number of guest tables',layout.numberOfTables],['Guests per table',layout.guestsPerTable],['Dancefloor position',layout.dancefloorPosition],['Cake table',layout.cakeTable],['Layout notes',layout.layoutNotes]].forEach(([l,v])=>add('Room layout',l,v));
    [['DJ setup / access',music.djSetupTime?timePretty(music.djSetupTime):music.djSetupTime],['DJ start',music.djStart?timePretty(music.djStart):music.djStart],['DJ finish',music.djFinish?timePretty(music.djFinish):music.djFinish],['Reception entrance song',music.receptionEntranceSong],['Cake cutting song',music.cakeCutSong],['First dance',music.firstDanceSong],['Father / daughter dance',music.fatherDaughterSong],['Must-play songs',music.mustPlay],['Do-not-play songs',music.doNotPlay],['Music style / preferences',music.musicStyle],['Guest request policy',music.guestRequests],['Live act requirements',music.liveActRequirements],['Music / DJ notes',music.musicNotes]].forEach(([l,v])=>add('Music & entertainment',l,v));
    [['Photographer',sup.photographer],['Videographer',sup.videographer],['Florist',sup.florist],['Cake supplier',sup.cakeSupplier],['Entertainment',sup.entertainment],['DJ',sup.dj],['Transport',sup.transport],['Supplier notes',sup.supplierNotes]].forEach(([l,v])=>add('Suppliers',l,v));
    [['Rooms required',bed.roomsRequired],['Bridal suite',bed.bridalSuite],['Night-before rooms',bed.nightBeforeRooms],['Room release date',bed.roomReleaseDate?dateLong(bed.roomReleaseDate):bed.roomReleaseDate],['Breakfast time',bed.breakfastTime?timePretty(bed.breakfastTime):bed.breakfastTime],['Accessible requirements',bed.accessibleRooms],['Bedroom notes',bed.bedroomNotes]].forEach(([l,v])=>add('Accommodation',l,v));
    return rows;
  }
  function customerPlanningSummaryPage(w,page,totalPages){
    const rows=customerPackPlanningRows(w)
      .map(x=>({...x,value:customerText(x.value)}))
      .filter(x=>selected(x.value));
    const covered=new Set([
      'Reception|Arrival / reception time','Reception|Wedding breakfast time','Reception|Speeches time',
      'Reception|Cake cutting time','Reception|First dance time','Reception|Evening food time','Reception|Finish time',
      'Food|Day meal service','Food|Wedding breakfast menu','Food|Menu / dietary notes','Drinks|Drinks package',
      'Music & entertainment|DJ setup / access','Music & entertainment|DJ start','Music & entertainment|DJ finish',
      'Music & entertainment|Reception entrance song','Music & entertainment|Cake cutting song',
      'Music & entertainment|First dance','Music & entertainment|Father / daughter dance'
    ]);
    const extra=rows.filter(x=>!covered.has(`${x.section}|${x.label}`));
    const sections=[...new Set(extra.map(x=>x.section))];
    return `<section class="page">${pageHeader(page,totalPages)}<div class="page-body">
      <div class="eyebrow">The finer details</div><h2>Everything else we currently have recorded.</h2>
      <p class="body-copy" style="margin-top:3mm">This page avoids repeating information already shown elsewhere in your pack and only includes extra details that help us deliver the day.</p>
      <div class="customer-grid" style="margin-top:5mm">${sections.length?sections.map(section=>`<div class="customer-card"><h3>${e(section)}</h3>${detailTable(extra.filter(x=>x.section===section).slice(0,8).map(x=>[x.label,x.value]))}</div>`).join(''):'<div class="note-card">No additional planning details need adding to this pack yet.</div>'}</div>
    </div>${footer('Wedding Customer Pack')}</section>`;
  }

  function customerCheckPage(w,d,calc,page,totalPages){
    const decisions=decisionsToFinalise(w,d),overview=customerPackOverviewRows(w,d,calc),updated=weddingCustomerPackUpdatedAt(w);
    const checks=['Names, wedding date and guest numbers','Ceremony location and all timings','Food choices, covers and dietary information','Welcome, toast and other drinks arrangements','Décor, colour scheme and room layout','Music, DJ and entertainment details','Suppliers and their arrangements','Bedrooms / accommodation','Package, extras, prices, payments and balance shown'];
    return `<section class="page">${pageHeader(page,totalPages)}<div class="eyebrow">Please check & confirm</div><h2>This pack is here to be challenged.</h2><p class="lead" style="margin-top:4mm">Please read the information in this pack carefully. If anything is wrong, missing or has changed, tell your wedding coordinator so we can correct the wedding record before the day.</p><div class="soft-panel"><div class="subtle-title">Current booking snapshot</div>${detailTable(overview)}</div><div class="check-grid">${checks.map(x=>`<div class="check-item"><span>□</span><strong>${e(x)}</strong></div>`).join('')}</div>${decisions.length?`<div class="note-card"><strong>Still marked TBC / awaiting confirmation</strong><br>${decisions.map(x=>`• ${e(x.title)} — ${e(x.detail)}`).join('<br>')}</div>`:`<div class="complete-card"><strong>No key TBC items identified.</strong><p>Please still check the pack against your own notes and tell us about any changes.</p></div>`}<div class="signature-line"><span>Pack last updated <strong>${e(updated.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}))}</strong></span><span>Prepared for <strong>${e(w.couple||'you')}</strong></span></div>${footer('Wedding Customer Pack')}</section>`;
  }

  function decisionsToFinalise(w,d){
    const p=profileOf(w), r=plan(w,'reception'), c=plan(w,'ceremony'), decor=plan(w,'decor'), music=plan(w,'music'), suppliers=plan(w,'suppliers'), b=plan(w,'bedrooms');
    const out=[];
    const add=(title,detail)=>out.push({title,detail});
    if(p.ceremonyLocationType==='external' && !selected(p.externalCeremonyVenue)) add('Ceremony venue','Confirm the external ceremony location and expected arrival at The Granary.');
    if((p.ceremonyLocationType!=='external' && p.weddingFormat!=='reception_only' && p.weddingFormat!=='evening_only') && !selected(c.ceremonyTime)) add('Ceremony timing','Confirm the ceremony time so the rest of the day can be locked around it.');
    if(p.dayMealRequired!==false && (!selected(r.weddingBreakfastMenu) || r.weddingBreakfastMenu==='None')) add('Wedding breakfast','Choose the wedding breakfast menu and final dish selections.');
    if(p.eveningFoodRequired!==false && !(Array.isArray(r.eveningFoodServices)&&r.eveningFoodServices.some(x=>x&&x.menuKey))) add('Evening food','Choose the evening food service, covers and serving time.');
    if(!selected(r.drinksPackage) && !selected(d.drinks)) add('Drinks','Confirm the drinks package or alternative drinks arrangements.');
    if(!selected(decor.colourScheme)) add('Look & feel','Confirm your colour scheme so décor and room styling can be brought together.');
    if(p.djRequired!==false && !selected(suppliers.dj)) add('DJ / entertainment','Confirm the DJ or entertainment arrangements.');
    if(!selected(music.firstDanceSong)) add('Music','Add the first-dance song when you are ready.');
    if(p.accommodationRequired!==false && !selected(b.roomsRequired)) add('Bedrooms','Confirm how many hotel rooms you would like us to plan around.');
    return out.slice(0,8);
  }

  function bookingSecured(w){
    // PHASE 6.1: a record in Weddings exists only after the enquiry is confirmed/transferred.
    // Prospective documents are generated from Enquiries, never from Weddings.
    if(w && !String(w.id||'').startsWith('enquiry-')) return true;
    return false;
  }

  function summaryList(items){
    if(!items.length) return '<p class="muted" style="font-size:8.5pt">Nothing has been selected here yet — this can be built with your coordinator.</p>';
    return `<ul class="detail-list">${items.map(item=>`<li>${e(item)}</li>`).join('')}</ul>`;
  }

  function detailTable(rows){
    if(!rows.length) return '<p class="muted" style="font-size:8.5pt">To be confirmed during planning.</p>';
    return `<table class="mini-table">${rows.map(([a,b])=>`<tr><td>${e(a)}</td><td>${e(b)}</td></tr>`).join('')}</table>`;
  }

  function choiceCounts(title,rows){
    if(!rows.length)return '';
    return `<div class="selection-heading">${e(title)}</div><div class="pill-row">${rows.slice(0,10).map(([name,n])=>`<span class="pill"><strong>${Number(n)}</strong>&nbsp; ${e(name)}</span>`).join('')}</div>`;
  }

  function celebrationDetailsPage(w,d,calc,page,totalPages){
    const food=foodSummary(w,d),drinks=drinksSummary(w,d),decor=decorSummary(w,d,calc),acc=accommodationSummary(w);
    const packageItems=packageSnapshot(w,d,calc);
    const eveningItems=food.services.map(s=>`${s.name}${s.covers?` · ${s.covers} covers`:''}${s.time?` · ${timePretty(s.time)}`:''}`);
    return `<section class="page">${pageHeader(page,totalPages)}<div class="eyebrow">Your wedding, brought together</div><h2>The choices shaping your celebration.</h2><p class="body-copy" style="margin-top:4mm">This page reflects the information currently held in your wedding plan. It will develop with you as menus, styling and suppliers are confirmed.</p>
      <div class="section-grid">
        <div class="detail-card"><h3>Your package</h3>${summaryList(packageItems)}</div>
        <div class="detail-card"><h3>Food & drinks</h3>${summaryList([...(selected(food.breakfast)&&food.breakfast!=='None'?[`${food.breakfast}${food.mealService?` · ${food.mealService}`:''}`]:[]),...eveningItems,...(selected(drinks.packageName)&&drinks.packageName!=='None'?[`${drinks.packageName} drinks package`]:[])])}</div>
        <div class="detail-card"><h3>Décor & styling</h3>${detailTable(decor.details)}${decor.quoteDecor.length?`<div class="pill-row">${decor.quoteDecor.map(x=>`<span class="pill">${e(customerText(x.name))}${Number(x.quantity||0)>1?` × ${Number(x.quantity)}`:''}</span>`).join('')}</div>`:''}</div>
        <div class="detail-card"><h3>Accommodation</h3>${acc.required?detailTable(acc.details):'<p class="muted" style="font-size:8.5pt">No accommodation is currently required.</p>'}${acc.notes?`<p>${e(acc.notes)}</p>`:''}</div>
      </div>${footer('Wedding Customer Pack')}</section>`;
  }

  function foodDetailsPage(w,d,page,totalPages){
    const food=foodSummary(w,d),drinks=drinksSummary(w,d);
    const services=food.services;
    return `<section class="page">${pageHeader(page,totalPages)}<div class="eyebrow">Food & drink</div><h2>A celebration planned right through to the kitchen.</h2><p class="body-copy" style="margin-top:4mm">Your food selections are linked to the same Kitchen specifications used by our venue team, helping the details agreed in planning carry through into service.</p>
      <div class="soft-panel"><div class="subtle-title">Wedding breakfast</div><h3>${e(selected(food.breakfast)&&food.breakfast!=='None'?food.breakfast:'Menu to be confirmed')}</h3>${food.mealService?`<p>${e(food.mealService)}</p>`:''}${choiceCounts('Starter choices currently recorded',food.starterCounts)}${choiceCounts('Main choices currently recorded',food.mainCounts)}${choiceCounts('Dessert choices currently recorded',food.dessertCounts)}${food.menuNotes?`<p style="margin-top:4mm"><strong>Menu notes:</strong> ${e(food.menuNotes)}</p>`:''}</div>
      <div style="margin-top:7mm"><div class="subtle-title">Evening food</div>${services.length?services.map(s=>`<div class="detail-card" style="margin-top:3mm"><h3>${e(s.name)}</h3><p>${s.covers?`${Number(s.covers)} covers`:''}${s.time?`${s.covers?' · ':''}${e(timePretty(s.time))}`:''}</p>${s.items.length?summaryList(s.items):'<p class="muted">Exact Kitchen items can be selected during planning.</p>'}${s.notes?`<p><strong>Notes:</strong> ${e(s.notes)}</p>`:''}</div>`).join(''):'<div class="detail-card"><p class="muted">Evening food is still to be selected.</p></div>'}</div>
      <div style="margin-top:7mm"><div class="subtle-title">Drinks</div><div class="detail-card"><h3>${e(selected(drinks.packageName)&&drinks.packageName!=='None'?`${drinks.packageName} drinks package`:'Drinks arrangements to be confirmed')}</h3>${drinks.split.length?`<div class="pill-row">${drinks.split.map(([name,n])=>`<span class="pill"><strong>${Number(n)}</strong>&nbsp; ${e(name)}</span>`).join('')}</div>`:'<p class="muted">The guest drinks allocation can be completed later in planning.</p>'}</div></div>
      ${footer('Wedding Customer Pack')}</section>`;
  }

  function peopleAndDetailsPage(w,page,totalPages){
    const p=profileOf(w),suppliers=supplierSummary(w),music=musicSummary(w),layout=plan(w,'layout'),ceremony=plan(w,'ceremony'),reception=plan(w,'reception');
    const isEvening=p.weddingFormat==='evening_only';
    const layoutRows=[['Table style',layout.tableShape],['Top table',layout.topTableStyle],['Guest tables',layout.numberOfTables],['Guests per table',layout.guestsPerTable],['Dancefloor',layout.dancefloorPosition],['Cake table',layout.cakeTable],['Layout notes',layout.layoutNotes]].map(([a,b])=>[a,customerText(b)]).filter(([,v])=>selected(v));
    let ceremonyRows=[];
    if(p.ceremonyLocationType==='external'||(isEvening&&selected(p.externalCeremonyVenue||ceremony.ceremonyLocation))){
      const venue=customerText(p.externalCeremonyVenue||ceremony.ceremonyLocation);
      const ct=customerText(p.externalCeremonyTime||ceremony.ceremonyTime);
      const arr=customerText(p.venueArrivalTime||reception.arrivalTime);
      if(venue)ceremonyRows.push(['Ceremony away from Windmill Farm',venue]);
      if(ct)ceremonyRows.push(['Ceremony time',timePretty(ct)||ct]);
      if(arr)ceremonyRows.push(['Expected arrival at Windmill Farm',timePretty(arr)||arr]);
    }else if(typeof weddingHasOnsiteCeremony==='function'&&weddingHasOnsiteCeremony(w)){
      ceremonyRows=[['Ceremony time',timePretty(ceremony.ceremonyTime)||ceremony.ceremonyTime],['Ceremony location',ceremony.ceremonyLocation],['Registrar / celebrant',ceremony.registrarName],['Ceremony guests',Number(ceremony.ceremonyGuests)>0?ceremony.ceremonyGuests:''],['Ceremony notes',ceremony.ceremonyNotes]].map(([a,b])=>[a,customerText(b)]).filter(([,v])=>selected(v));
    }
    const supplierRows=suppliers.map(([a,b])=>[a,customerText(b)]).filter(([,v])=>selected(v));
    const musicRows=music.map(([a,b])=>[a,customerText(b)]).filter(([,v])=>selected(v));
    return `<section class="page">${pageHeader(page,totalPages)}<div class="page-body"><div class="eyebrow">The personal details</div><h2>The people, music and room around your day.</h2><div class="section-grid">${ceremonyRows.length?`<div class="detail-card"><h3>Your ceremony</h3>${detailTable(ceremonyRows)}</div>`:''}<div class="detail-card"><h3>Your suppliers</h3>${supplierRows.length?detailTable(supplierRows):'<p class="muted">Supplier details are still being confirmed.</p>'}</div><div class="detail-card"><h3>Music & moments</h3>${musicRows.length?detailTable(musicRows):'<p class="muted">Music details are still being confirmed.</p>'}</div><div class="detail-card"><h3>Room layout</h3>${layoutRows.length?detailTable(layoutRows):'<p class="muted">Room layout details are still being confirmed.</p>'}</div></div><div class="note-card"><strong>Please check these details</strong><br>Blank placeholders and internal system codes are hidden from this customer pack.</div></div>${footer('Wedding Customer Pack')}</section>`;
  }

  function decisionsPage(w,d,page,totalPages){
    const decisions=decisionsToFinalise(w,d);
    let progress=0;
    try{progress=typeof planningOverallProgress==='function'?Number(planningOverallProgress(w.id)?.pct||0):0;}catch(err){}
    return `<section class="page">${pageHeader(page,totalPages)}<div class="eyebrow">Your next planning steps</div><h2>${decisions.length?'A few details we will shape together.':'Your plan is taking shape beautifully.'}</h2><p class="lead" style="margin-top:4mm">Nothing here is designed to create pressure. It is simply a clear view of the decisions still available to make, so you always know what comes next.</p>
      ${decisions.length?`<div class="decision-list">${decisions.map(x=>`<div class="decision"><strong>${e(x.title)}</strong>${e(x.detail)}</div>`).join('')}</div>`:`<div class="complete-card"><strong>Your key planning choices are recorded.</strong><p>We will continue checking the detail with you as the wedding approaches and turn the final plan into the operational information used by our teams.</p></div>`}
      ${progress?`<div class="soft-panel"><div class="subtle-title">Planning progress</div><h3>${progress}% of currently relevant planning fields completed</h3><p>This percentage adapts to your wedding format, so irrelevant ceremony, bedroom, DJ or food questions do not count against your plan.</p></div>`:''}
      ${footer('Wedding Customer Pack')}</section>`;
  }

  function customerQuoteChunks(calc){
    const lines=Array.isArray(calc?.lines)?calc.lines:[];
    const size=8;
    const chunks=[];
    for(let i=0;i<lines.length;i+=size)chunks.push(lines.slice(i,i+size));
    return chunks.length?chunks:[[]];
  }
  function customerQuotePages(w,d,calc,startPage,totalPages){
    const chunks=customerQuoteChunks(calc);
    return chunks.map((lines,index)=>{
      const final=index===chunks.length-1,page=startPage+index;
      return `<section class="page">${pageHeader(page,totalPages)}
        <div class="eyebrow">Your personalised proposal${index?' · continued':''}</div>
        <h2>${e(d.packageName||w.package||'Bespoke')} wedding</h2>
        ${index===0?`<p class="body-copy" style="margin-top:3mm">Based on ${Number(d.dayGuests||0)} day guests and ${Number(d.eveningGuests||0)} evening guests. This section reflects the current Quote record.</p>`:''}
        <table class="quote-table"><thead><tr><th>Included / selected</th><th class="qty">Qty</th><th>Investment</th></tr></thead><tbody>${lines.map(x=>`<tr><td><strong>${e(customerText(x.name))}</strong></td><td class="qty">${Number(x.quantity||1)}</td><td>${e(moneyFmt(x.total))}</td></tr>`).join('')}</tbody></table>
        ${final?`<div class="quote-total"><div class="quote-total-row"><span>Subtotal</span><span>${moneyFmt(calc.subtotal)}</span></div>${calc.discount?`<div class="quote-total-row"><span>Discount</span><span>-${moneyFmt(calc.discount)}</span></div>`:''}<div class="quote-total-row grand"><span>Total</span><span>${moneyFmt(calc.total)}</span></div>${Number(w.paid||0)>0?`<div class="quote-total-row"><span>Payments recorded</span><span>${moneyFmt(w.paid)}</span></div>`:''}<div class="quote-total-row"><span>Balance on wedding record</span><span>${moneyFmt(w.balance||0)}</span></div></div>${d.notes?`<div class="note-card"><strong>A note about your proposal</strong><br>${e(d.notes).replace(/\n/g,'<br>')}</div>`:''}<div class="note-card"><strong>Please check the commercial detail</strong><br>If a package, quantity, price, payment or agreed extra does not look right, please tell your wedding coordinator so the wedding record can be corrected.</div>`:`<div class="pack-warning" style="margin-top:6mm">More quote items continue on the next page.</div>`}
        ${footer('Wedding Customer Pack')}</section>`;
    }).join('');
  }

  function weddingPackageConfirmedInclusions(w,d,calc){
    // Only state inclusions explicitly evidenced by the saved quote/quote selections.
    // Brochure-level inclusions are intentionally not invented.
    const items=[];
    if(d.menuIncluded && selected(d.menu))items.push(`${d.menu} - included`);
    if(d.drinksIncluded && selected(d.drinks))items.push(`${d.drinks} drinks package - included`);
    if(d.eveningFoodIncluded && selected(d.eveningFood))items.push(`${d.eveningFood} - included`);
    (calc.lines||[]).filter(x=>x.type==='extra' && Number(x.total||0)===0).forEach(x=>items.push(`${x.name} - included`));
    return [...new Set(items)];
  }

  function proposalPages(w,d,calc,mode='quote'){
    const profile=profileOf(w), timeline=indicativeTimeline(w), indicative=isIndicative(w);
    const planningPageCount=mode==='pack'?1:0;
    const quotePageCount=mode==='pack'?customerQuoteChunks(calc).length:1;
    const totalPages = mode==='pack' ? (9 + planningPageCount + quotePageCount) : 4;
    const coverTitle = mode==='pack' ? 'Your Wedding\nat The Granary' : 'Your Wedding\nProposal';
    const intro = mode==='pack'
      ? 'Your current wedding plan, brought together from Overview, Planning and Quote so you can check every important detail with us.'
      : 'A personalised proposal created for your celebration at The Granary at Windmill Farm.';
    let pages=`<section class="page cover"><div class="cover-art"></div><div class="cover-inner">
      ${wordmark()}<div class="cover-couple"><div class="cover-kicker">PERSONALISED WEDDING ${mode==='pack'?'PACK':'PROPOSAL'}</div><div class="cover-rule"></div><h1>${e(coverTitle).replace(/\n/g,'<br>')}</h1><p>${e(intro)}</p></div>
      <div class="cover-meta"><div><strong>${e(w.couple||'Your Wedding')}</strong>${e(dateLong(w.date))}</div><div><strong>${e(formatLabel(w))}</strong>${e(d.packageName||w.package||'Bespoke')} package</div></div>
    </div></section>`;

    pages += `<section class="page">${pageHeader(2,totalPages)}<div class="eyebrow">Your celebration</div><h2>Made personal. Planned properly.</h2>
      <p class="lead" style="margin-top:4mm">Your wedding should feel unmistakably yours. Our role is to give you a flexible setting, a clear planning journey and a team that knows the detail - so when the day arrives, you can simply enjoy it.${w.coordinator?` Your wedding coordinator is <strong>${e(w.coordinator)}</strong>, who will help keep those details moving with you.`:''}</p>
      <div class="facts"><div class="fact"><span>Date</span><strong>${e(dateLong(w.date))}</strong></div><div class="fact"><span>Wedding style</span><strong>${e(formatLabel(w))}</strong></div><div class="fact"><span>Day guests</span><strong>${Number(d.dayGuests||w.dayGuests||0) || 'TBC'}</strong></div><div class="fact"><span>Evening guests</span><strong>${Number(d.eveningGuests||w.eveningGuests||0) || 'TBC'}</strong></div></div>
      <div class="note-card"><strong>Current record</strong><br>This pack was generated from the latest wedding Overview, Planning and Quote information held by Windmill Farm. Last updated: ${e(weddingCustomerPackUpdatedAt(w).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}))}. Please tell us if anything in this pack is incorrect.</div>
      <div class="hero-band"><div class="eyebrow">The Granary experience</div><h2>Everything in one place, with a team beside you.</h2></div>
      <div class="feature-grid"><div class="feature"><h3>Your own celebration space</h3><p>A flexible private function space that can move with your day.</p></div><div class="feature"><h3>Dedicated planning support</h3><p>Regular touchpoints and a clear operational handover so important details do not get lost.</p></div><div class="feature"><h3>Food made part of the plan</h3><p>Your selected menus and guest choices feed into the same planning system used by our kitchen team.</p></div><div class="feature"><h3>Stay together</h3><p>On-site accommodation means family and friends can make a full occasion of it.</p></div></div>
      ${footer(mode==='pack'?'Wedding Customer Pack':'Wedding Proposal')}</section>`;

    pages += `<section class="page">${pageHeader(3,totalPages)}<div class="eyebrow">How your day could flow</div><h2>${indicative?'An indicative shape for your wedding day':'Your planned wedding day'}</h2><p class="body-copy" style="margin-top:3mm">${indicative?'Some timings are not confirmed yet, so the schedule below uses sensible illustrative timings alongside anything you have already planned.':'These timings are drawn directly from your current wedding plan. Any timing not yet recorded is shown as TBC rather than being guessed.'}</p>
      <div class="timeline">${timeline.map(([label,time,desc])=>`<div class="timeline-row"><div class="timeline-time">${e(suspiciousWeddingTime(label,time)?'Please confirm':(timePretty(time)||time||'TBC'))}</div><span class="timeline-dot"></span><div><h3>${e(label)}</h3><p>${e(suspiciousWeddingTime(label,time)?'This timing looks unusual in the current plan and should be checked before the pack is confirmed.':(desc||''))}</p></div></div>`).join('')}</div>
      ${footer(mode==='pack'?'Wedding Customer Pack':'Wedding Proposal')}</section>`;

    if(mode==='pack'){
      pages += celebrationDetailsPage(w,d,calc,4,totalPages);
      pages += foodDetailsPage(w,d,5,totalPages);
      pages += peopleAndDetailsPage(w,6,totalPages);

      let pageNo=7;
      pages += customerQuotePages(w,d,calc,pageNo,totalPages);
      pageNo += quotePageCount;

      pages += decisionsPage(w,d,pageNo,totalPages); pageNo++;
      pages += customerPlanningSummaryPage(w,pageNo,totalPages); pageNo += 1;
      pages += customerCheckPage(w,d,calc,pageNo,totalPages); pageNo++;

      pages += `<section class="page">${pageHeader(pageNo,totalPages)}<div class="eyebrow">Your planning journey</div><h2>We keep the process clear from "yes" to "I do".</h2><p class="lead" style="margin-top:4mm">Wedding planning has lots of moving parts. We break it into manageable stages, keep the key information together and make sure the venue team has what it needs to deliver your day.</p>
        <div class="journey"><div class="journey-step"><span class="num">1</span><strong>Your date is secured</strong><p>Your booking has been confirmed and your wedding is now in The Granary diary.</p></div><div class="journey-step"><span class="num">2</span><strong>Build the detail</strong><p>Menus, drinks, decor, entertainment, bedrooms and the feel of the day all begin to take shape.</p></div><div class="journey-step"><span class="num">3</span><strong>Planning meetings</strong><p>We work through the important decisions with you and keep your wedding plan updated.</p></div><div class="journey-step"><span class="num">4</span><strong>Final details</strong><p>Guest numbers, food choices, suppliers, timings and room setup are brought together.</p></div><div class="journey-step"><span class="num">5</span><strong>Wedding week</strong><p>Our teams receive the final information they need across coordination, kitchen, bar, hotel and setup.</p></div><div class="journey-step"><span class="num">6</span><strong>Your wedding day</strong><p>You arrive knowing the details have already been worked through.</p></div></div>
        ${footer('Wedding Customer Pack')}</section>`; pageNo++;

      pages += `<section class="page">${pageHeader(pageNo,totalPages)}<div class="eyebrow">What happens next?</div><h2>${bookingSecured(w)?'Your date is secured. Now we make it yours.':'Ready when you are.'}</h2><p class="lead" style="margin-top:4mm">${bookingSecured(w)?'Your wedding is now part of our diary. From here, the focus moves from booking the venue to shaping the detail.':'If The Granary feels like the right place for your wedding, the next steps are deliberately simple.'}</p>
        <div class="next-box"><h2>${bookingSecured(w)?'The planning journey continues.':'Let us make it yours.'}</h2><p>${bookingSecured(w)?'Keep sending us the ideas and decisions as they develop. Your wedding plan stays together here and is turned into the information our venue teams use to deliver the day.':'Your date is only secured once the required booking steps are complete and remains subject to availability until then.'}</p><div class="next-actions">${bookingSecured(w)?`<div class="next-action"><strong>01 · Shape</strong>Menus, styling, music, suppliers and accommodation continue to take form.</div><div class="next-action"><strong>02 · Confirm</strong>We work through the key details at your planning and final meetings.</div><div class="next-action"><strong>03 · Enjoy</strong>We turn the final plan into the operational detail used by the team.</div>`:`<div class="next-action"><strong>01 · Tell us</strong>Let your wedding coordinator know you would like to proceed.</div><div class="next-action"><strong>02 · Confirm</strong>Review and sign the wedding booking terms and conditions.</div><div class="next-action"><strong>03 · Secure</strong>Pay the required non-refundable booking deposit to secure your date.</div>`}</div></div>
        <div style="margin-top:10mm"><div class="eyebrow">Your venue team</div><h3 style="font-size:18pt">The Granary at Windmill Farm</h3><p class="body-copy" style="max-width:130mm">${w.coordinator?`Your wedding coordinator: <strong>${e(w.coordinator)}</strong><br>`:''}Whisby Road, Lincoln, Lincolnshire, LN6 3QZ<br>We look forward to helping turn the information in this pack into your wedding day.</p></div>
        <div class="signature-line"><span>Prepared for <strong>${e(w.couple||'you')}</strong></span><span>${e(dateLong(new Date().toISOString().slice(0,10)))}</span></div>
        ${footer('Wedding Customer Pack')}</section>`;
    }else{
      pages += quotePage(w,d,calc,4,totalPages,'Wedding Proposal',true);
    }
    return pages;
  }

  function quotePage(w,d,calc,page,totalPages,label,isFinal=false){
    return `<section class="page">${pageHeader(page,totalPages)}<div class="eyebrow">Your personalised proposal</div><h2>${e(d.packageName||w.package||'Bespoke')} wedding</h2><p class="body-copy" style="margin-top:4mm">Based on ${Number(d.dayGuests||0)} day guests and ${Number(d.eveningGuests||0)} evening guests. This proposal brings together the package and enhancements currently selected for your celebration.</p>
      <table class="quote-table"><thead><tr><th>Included / selected</th><th class="qty">Qty</th><th>Investment</th></tr></thead><tbody>${(calc.lines||[]).map(x=>`<tr><td><strong>${e(customerText(x.name))}</strong></td><td class="qty">${Number(x.quantity||1)}</td><td>${e(moneyFmt(x.total))}</td></tr>`).join('')}</tbody></table>
      <div class="quote-total"><div class="quote-total-row"><span>Subtotal</span><span>${moneyFmt(calc.subtotal)}</span></div>${calc.discount?`<div class="quote-total-row"><span>Discount</span><span>−${moneyFmt(calc.discount)}</span></div>`:''}<div class="quote-total-row grand"><span>Total</span><span>${moneyFmt(calc.total)}</span></div>${label==='Wedding Customer Pack'&&Number(w.paid||0)>0?`<div class="quote-total-row"><span>Payments recorded</span><span>${moneyFmt(w.paid)}</span></div>`:''}${label==='Wedding Customer Pack'?`<div class="quote-total-row"><span>Balance on wedding record</span><span>${moneyFmt(w.balance||0)}</span></div>`:''}</div>
      ${d.notes?`<div class="note-card"><strong>A note about your proposal</strong><br>${e(d.notes).replace(/\n/g,'<br>')}</div>`:''}
      <div class="note-card"><strong>Proposal information</strong><br>This proposal is subject to availability, signed booking terms and conditions, and the required non-refundable booking deposit. Pricing shown uses the ${e(d.priceYear)} wedding price list. Any details not yet confirmed can be refined with your wedding coordinator.</div>
      ${isFinal?`<div class="next-box"><h2>Your day, brought together.</h2><p>We would be delighted to host your wedding at The Granary. When you are ready to proceed, speak to the wedding team and we will guide you through securing your date.</p></div>`:''}
      ${footer(label)}</section>`;
  }

  function quoteData(w){
    const d = typeof activeQuoteDraft==='function' ? activeQuoteDraft(w) : {packageName:w.package,dayGuests:w.dayGuests,eveningGuests:w.eveningGuests,priceYear:new Date(w.date||Date.now()).getFullYear(),notes:''};
    const calc = typeof calculateWeddingQuote==='function' ? calculateWeddingQuote(d) : {lines:[],subtotal:w.quotedValue||0,discount:0,total:w.quotedValue||0};
    return {d,calc};
  }

  function printQuote(weddingId){
    const w=(DB.weddings||[]).find(x=>x.id===weddingId); if(!w)return;
    const {d,calc}=quoteData(w);
    openDocument(`Wedding Proposal - ${w.couple}`,proposalPages(w,d,calc,'quote'));
  }

  function printCustomerPack(weddingId){
    const w=(DB.weddings||[]).find(x=>x.id===weddingId); if(!w)return;
    const {d,calc}=quoteData(w);
    openDocument(`Wedding Pack - ${w.couple}`,proposalPages(w,d,calc,'pack'));
  }

  
  // PHASE 6.1 — Enquiries own the prospective/viewing proposal journey.
  function enquiryProposalData(enquiry){
    const pre=typeof enquiryWeddingData==='function'?enquiryWeddingData(enquiry):null;
    const brief=pre?.brief||{};
    const q=pre?.quote||{};
    const guests=Number(q.dayGuests??brief.dayGuests??enquiry.guests??0);
    const eveningGuests=Number(q.eveningGuests??brief.eveningGuests??enquiry.guests??0);
    const packageName=String(q.packageName||enquiry.package||'Bespoke').trim()||'Bespoke';
    const year=Number(q.priceYear||String(enquiry.preferredDate||'').slice(0,4))||2027;
    const pseudoWedding={
      id:`enquiry-${enquiry.id}`, couple:enquiry.name||'Your Wedding', date:enquiry.preferredDate||'',
      coordinator:enquiry.staff||'', package:packageName, dayGuests:guests, eveningGuests,
      quotedValue:Number(enquiry.value||0), status:'Prospective', enquiryId:enquiry.id,
      planning:{weddingProfile:{format:brief.weddingFormat||'ceremony_reception',ceremonyLocation:brief.ceremonyLocation||'windmill_farm',hasDayMeal:(brief.weddingFormat||'')!=='evening_only',hasEveningFood:(q.eveningFood||'None')!=='None',hasAccommodation:brief.accommodation!=='no'}},
      preBookingBrief:brief
    };
    const draft={
      priceYear:year,packageName,dayGuests:guests,eveningGuests,
      menu:q.menu||'None',menuIncluded:!!q.menuIncluded,drinks:q.drinks||'None',drinksIncluded:!!q.drinksIncluded,
      eveningFood:q.eveningFood||'None',eveningFoodIncluded:!!q.eveningFoodIncluded,
      extras:Array.isArray(q.extras)?q.extras:[],customItems:Array.isArray(q.customItems)?q.customItems:[],
      discount:Number(q.discount||0),notes:q.notes||enquiry.notes||''
    };
    let calc={lines:[],subtotal:Number(enquiry.value||0),discount:0,total:Number(enquiry.value||0),pkg:null};
    try{ if(typeof calculateWeddingQuote==='function') calc=calculateWeddingQuote(draft); }catch(error){console.warn('Enquiry proposal pricing fallback used',error);}
    return {w:pseudoWedding,d:draft,calc};
  }

  function printEnquiryWeddingProposal(enquiryId){
    const enquiry=(DB.enquiries||[]).find(x=>x.id===enquiryId);
    if(!enquiry || !/wedding/i.test(String(enquiry.eventType||''))) return;
    if(['Confirmed Booking','Confirmed'].includes(enquiry.status)){
      if(typeof toast==='function') toast('This wedding is confirmed — open it in Weddings for customer documents');
      return;
    }
    const {w,d,calc}=enquiryProposalData(enquiry);
    openDocument(`Wedding Viewing Proposal - ${enquiry.name}`,proposalPages(w,d,calc,'quote'));
  }

window.WeddingDocumentEngine={printQuote,printCustomerPack,printEnquiryWeddingProposal,wordmark,customerPackPlanningRows,decisionsToFinalise};
  window.printWeddingQuote=printQuote;
  window.printWeddingCustomerPack=printCustomerPack;
  window.printEnquiryWeddingProposal=printEnquiryWeddingProposal;
})();
