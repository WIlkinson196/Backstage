// ============================================================================
// THE GRANARY DOCUMENT SYSTEM V2
// One wedding data model -> customer, commercial and operational documents.
// 2026-08-24
// ============================================================================
(function(){
  const DS={version:'DOCUMENT-SYSTEM-STABILISED-20260825',historyManaged:true};
  // Preserve the operational checklist renderer defined in weddings.js before this master dispatcher takes ownership.
  const operationalPrepPrinter=typeof window.printWeddingPrepList==='function'?window.printWeddingPrepList:null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const clean=v=>String(v??'').trim();
  const money=v=>'£'+Number(v||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
  const good=v=>{
    const s=clean(v);
    if(!s)return '';
    const low=s.toLowerCase();
    if(['-','--','unknown','tbc','n/a','na','none','null','undefined','yeso','o','non','0'].includes(low))return '';
    return s.replace(/\bspec-\d+\b/gi,'').replace(/\s{2,}/g,' ').trim();
  };
  const time=v=>{
    const s=good(v); if(!s)return '';
    if(!/^\d{1,2}:\d{2}/.test(s))return s;
    const [h,m]=s.slice(0,5).split(':').map(Number);
    return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'pm':'am'}`;
  };
  const dateLong=v=>{
    if(!v)return '';
    const d=new Date(`${String(v).slice(0,10)}T12:00:00`);
    return Number.isNaN(d.getTime())?clean(v):d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  };
  const fmtDateShort=v=>{
    if(!v)return '';
    const d=new Date(`${String(v).slice(0,10)}T12:00:00`);
    return Number.isNaN(d.getTime())?clean(v):d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  };
  const arr=v=>Array.isArray(v)?v:[];
  const row=(label,value)=>good(value)?[label,good(value)]:null;
  const rows=list=>list.filter(Boolean);
  const visibleRunNotes=v=>typeof runningOrderVisibleNotes==='function'?runningOrderVisibleNotes(v):clean(v).replace(/\[WFPLAN:[^\]]+\]/g,'').replace(/\[WFPLAN-OVERRIDE\]/g,'').trim();

  DS.model=function(weddingId){
    const w=(DB.weddings||[]).find(x=>x.id===weddingId); if(!w)return null;
    const plan=section=>typeof planningData==='function'?planningData(weddingId,section)||{}:{};
    const profile=typeof weddingProfile==='function'?weddingProfile(w):plan('profile');
    const reception=plan('reception'), ceremony=plan('ceremony'), decor=plan('decor'), layout=plan('layout'),
          music=plan('music'), suppliers=plan('suppliers'), bedrooms=plan('bedrooms');
    const guests=typeof weddingGuestsFor==='function'?weddingGuestsFor(weddingId):(DB.weddingGuests||[]).filter(x=>x.weddingId===weddingId);
    const tables=typeof seatingTablesFor==='function'?seatingTablesFor(weddingId):(DB.weddingSeatingTables||[]).filter(x=>x.weddingId===weddingId);
    const running=typeof runningOrderFor==='function'?runningOrderFor(weddingId):(DB.weddingRunningOrder||[]).filter(x=>x.weddingId===weddingId);
    const tasks=(DB.weddingTasks||[]).filter(x=>x.weddingId===weddingId);
    const payments=(DB.weddingPayments||[]).filter(x=>x.weddingId===weddingId);
    const quote=typeof latestWeddingQuote==='function'?latestWeddingQuote(weddingId):(DB.weddingQuotes||[]).filter(x=>x.weddingId===weddingId).sort((a,b)=>Number(b.version||0)-Number(a.version||0))[0]||null;
    const draft=typeof activeQuoteDraft==='function'?activeQuoteDraft(w):null;
    const calc=draft&&typeof calculateWeddingQuote==='function'?calculateWeddingQuote(draft):{
      lines:(quote?.items||[]).filter(x=>x&&x.type!=='meta'),subtotal:Number(quote?.subtotal||w.quotedValue||0),
      discount:Number(quote?.discount||0),total:Number(quote?.total||w.quotedValue||0)
    };
    const quoteMeta=(quote?.items||[]).find(x=>x?.type==='meta')||{};
    const paidLedger=payments.filter(x=>x.status==='Paid').reduce((n,p)=>n+(p.type==='Refund'?-Math.abs(Number(p.amount||0)):Math.abs(Number(p.amount||0))),0);
    const paid=payments.length?Math.max(0,paidLedger):Number(w.paid||0);
    const total=Number(calc.total||quote?.total||w.quotedValue||0);
    const balance=Math.max(0,total-paid);
    const dietary=guests.filter(g=>good(g.dietaryRequirements)||good(g.accessibilityNotes));
    const dayGuests=Number(quote?.dayGuests||w.dayGuests||0), eveningGuests=Number(quote?.eveningGuests||w.eveningGuests||0);
    const today=new Date(); today.setHours(0,0,0,0);
    const eventDate=w.date?new Date(`${w.date}T12:00:00`):null;
    const daysUntil=eventDate&&!Number.isNaN(eventDate.getTime())?Math.ceil((eventDate-today)/86400000):null;
    const lifecycle=daysUntil===null?'planning':daysUntil<0?'post':daysUntil<=14?'final':daysUntil<=90?'final-planning':'planning';

    const onsite=typeof weddingHasOnsiteCeremony==='function'?weddingHasOnsiteCeremony(w):profile.ceremonyLocationType!=='external';
    const ceremonyElsewhere=profile.ceremonyLocationType==='external'||(!onsite&&good(profile.externalCeremonyVenue||ceremony.ceremonyLocation));
    const ceremonyVenue=ceremonyElsewhere?good(profile.externalCeremonyVenue||ceremony.ceremonyLocation):good(ceremony.ceremonyLocation)||'The Granary at Windmill Farm';
    const ceremonyTime=good(profile.externalCeremonyTime||ceremony.ceremonyTime);
    const arrivalTime=good(profile.venueArrivalTime||reception.arrivalTime);

    const additionalTimings=arr(reception.additionalTimings).filter(x=>x&&(good(x.label)||good(x.time)));
    let timeline=[];
    if(typeof weddingMasterTimingRows==='function'){
      timeline=weddingMasterTimingRows(w).filter(([,t])=>good(t)).map(([label,t])=>({label,time:t,notes:''}));
    }
    if(!timeline.length){
      if(ceremonyTime)timeline.push({label:ceremonyElsewhere?'Ceremony':'Ceremony at Windmill Farm',time:ceremonyTime});
      if(arrivalTime)timeline.push({label:'Arrival at Windmill Farm',time:arrivalTime});
      [['Wedding Breakfast',reception.weddingBreakfastTime],['Speeches',reception.speechesTime],['Cake Cutting',reception.cakeCutTime],
       ['First Dance',reception.firstDanceTime],['Evening Food',reception.eveningFoodTime],['Finish',reception.finishTime]].forEach(([label,t])=>{if(good(t))timeline.push({label,time:t})});
      additionalTimings.forEach(x=>timeline.push({label:good(x.label)||'Additional timing',time:x.time,notes:good(x.notes)}));
      timeline.sort((a,b)=>clean(a.time).localeCompare(clean(b.time)));
    }

    const bespokeWelcome=arr(reception.bespokeWelcomeDrinks).filter(x=>good(x?.drink)&&Number(x.quantity||0)>0);
    const bespokeToast=arr(reception.bespokeToastDrinks).filter(x=>good(x?.drink)&&Number(x.quantity||0)>0);
    const eveningServices=arr(reception.eveningFoodServices).filter(Boolean);
    const prep=typeof weddingPrepRows==='function'?weddingPrepRows(w):{rows:[],warnings:[]};
    const drinksCalc=window.WeddingConsumptionRules?.drinksCalculation?WeddingConsumptionRules.drinksCalculation(w):null;

    const packageName=good(draft?.packageName||quote?.packageName||w.package)||'Bespoke';
    const included=[];
    if(draft){
      if(draft.menuIncluded&&good(draft.menu))included.push(good(draft.menu));
      if(draft.drinksIncluded&&good(draft.drinks))included.push(`${good(draft.drinks)} drinks package`);
      if(draft.eveningFoodIncluded&&good(draft.eveningFood))included.push(good(draft.eveningFood));
    }else{
      if(quoteMeta.menuIncluded&&good(quoteMeta.menu))included.push(good(quoteMeta.menu));
      if(quoteMeta.drinksIncluded&&good(quoteMeta.drinks))included.push(`${good(quoteMeta.drinks)} drinks package`);
      if(quoteMeta.eveningFoodIncluded&&good(quoteMeta.eveningFood))included.push(good(quoteMeta.eveningFood));
    }
    (calc.lines||[]).filter(x=>x.type==='extra'&&Number(x.total||0)===0&&good(x.name)).forEach(x=>included.push(good(x.name)));

    const customerOutstanding=[];
    const req=(title,value)=>{if(!good(value))customerOutstanding.push(title)};
    req('Wedding day timings',timeline.length?timeline[0]?.time:'');
    if(onsite||ceremonyElsewhere){req('Ceremony details',ceremonyVenue);req('Ceremony time',ceremonyTime);}
    if(dayGuests>0)req('Wedding breakfast / day food',reception.weddingBreakfastMenu||draft?.menu);
    if(eveningGuests>0)req('Evening food',eveningServices.length?eveningServices[0]?.menuLabel||eveningServices[0]?.menuKey:draft?.eveningFood);
    req('Music / first dance',music.firstDanceSong);
    if(profile.hasAccommodation!==false&&Number(bedrooms.roomsRequired||0)>0===false&&good(bedrooms.bridalSuite)==='')customerOutstanding.push('Accommodation requirements');

    return {
      w,profile,reception,ceremony,decor,layout,music,suppliers,bedrooms,guests,tables,running,tasks,payments,
      quote,draft,calc,total,paid,balance,dietary,dayGuests,eveningGuests,lifecycle,daysUntil,
      onsite,ceremonyElsewhere,ceremonyVenue,ceremonyTime,arrivalTime,timeline,additionalTimings,
      bespokeWelcome,bespokeToast,eveningServices,prep,drinksCalc,packageName,
      brochureIncluded:(window.WeddingPackageGuide?.allIncluded(packageName)||[]).map(x=>x.label),
      included:[
        ...(window.WeddingPackageGuide?.allIncluded(packageName)||[]).map(x=>x.label)
      ].filter((x,i,a)=>x&&a.indexOf(x)===i),
      selectedArrangements:window.WeddingPackageGuide?.selectedArrangements(packageName,draft,reception)||[],
      packageInfo:window.WeddingPackageGuide?.info(packageName)||null,
      packagePlanning:plan('package'),
      customerOutstanding
    };
  };

  function baseCss(customer=true){
    return `
      :root{--forest:#273426;--olive:#5f7343;--sage:#a8b28d;--ivory:#f7f3e8;--paper:#fffdf8;--ink:#232721;--muted:#6f746b;--gold:#b69a55;--line:#e2ddd0;--red:#a33d35;--redbg:#fff3f0;--green:#4e6f43;--greenbg:#eef5eb}
      *{box-sizing:border-box}html,body{margin:0;padding:0;color:var(--ink);font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{background:#e7e7e2}.document{width:210mm;margin:auto;background:white}
      .page{width:210mm;min-height:297mm;background:var(--paper);padding:15mm 17mm 11mm;page-break-after:always;break-after:page;display:flex;flex-direction:column}
      .page:last-child{page-break-after:auto;break-after:auto}
      .cover{height:297mm;min-height:297mm;padding:0;background:linear-gradient(155deg,#1f2b20 0%,#31402d 58%,#55643d 100%);color:#fff;overflow:hidden;position:relative}
      .cover:before{content:"";position:absolute;width:135mm;height:135mm;border:1px solid rgba(255,255,255,.08);border-radius:50%;right:-45mm;top:-25mm;box-shadow:0 0 0 22mm rgba(255,255,255,.018),0 0 0 44mm rgba(255,255,255,.012)}
      .cover-inner{height:100%;padding:22mm 20mm 18mm;display:flex;flex-direction:column;position:relative;z-index:2}
      .brand{font-size:7.5pt;letter-spacing:.25em;font-weight:800;color:${customer?'#d8c582':'#b7c49f'};text-transform:uppercase}
      .wordmark{font-family:Georgia,'Times New Roman',serif;font-size:17pt;letter-spacing:.22em;margin-top:2mm}
      .cover-main{margin:auto 0}.cover-kicker{font-size:8pt;letter-spacing:.24em;color:#d8c582;font-weight:800;text-transform:uppercase}.cover h1{font-family:Georgia,'Times New Roman',serif;font-size:38pt;line-height:1.05;font-weight:normal;margin:5mm 0}.cover p{max-width:120mm;font-family:Georgia,'Times New Roman',serif;font-size:13pt;line-height:1.55;color:#edf0e8}
      .cover-meta{display:grid;grid-template-columns:1fr 1fr;gap:10mm;border-top:1px solid rgba(255,255,255,.25);padding-top:6mm;font-size:9pt}.cover-meta strong{display:block;color:#d8c582;text-transform:uppercase;letter-spacing:.12em;font-size:6.8pt;margin-bottom:1mm}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:4mm;margin-bottom:7mm}.header .mark{font-family:Georgia,'Times New Roman',serif;font-size:11pt;letter-spacing:.18em}.header .page-no{font-size:7pt;color:var(--muted);letter-spacing:.1em}
      .eyebrow{font-size:7pt;letter-spacing:.22em;font-weight:800;color:var(--olive);text-transform:uppercase}.page h2{font-family:Georgia,'Times New Roman',serif;font-size:25pt;line-height:1.15;font-weight:normal;margin:2mm 0 4mm}.lead{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.55;color:#4a5047;max-width:155mm}
      .facts{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin:6mm 0}.fact{border-top:2px solid var(--olive);padding:3mm 0}.fact small{display:block;font-size:6.6pt;letter-spacing:.12em;color:var(--muted);text-transform:uppercase}.fact strong{display:block;font-family:Georgia,'Times New Roman',serif;font-size:12pt;font-weight:normal;margin-top:1mm}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.card{border:1px solid var(--line);border-radius:5px;padding:4mm;background:#fff;break-inside:avoid;page-break-inside:avoid}.card.soft{background:var(--ivory)}.card h3{font-family:Georgia,'Times New Roman',serif;font-size:13pt;font-weight:normal;margin:0 0 2mm}
      .detail{width:100%;border-collapse:collapse;font-size:8.3pt}.detail td{padding:1.7mm 0;border-bottom:1px solid #eee9df;vertical-align:top}.detail td:first-child{width:39%;color:var(--muted);padding-right:4mm}.detail td:last-child{font-weight:600;overflow-wrap:anywhere}
      .timeline{margin-top:5mm}.timeline-row{display:grid;grid-template-columns:28mm 8mm 1fr;min-height:16mm;break-inside:avoid}.timeline-time{font-family:Georgia,'Times New Roman',serif;font-size:12pt}.timeline-line{position:relative}.timeline-line:before{content:"";position:absolute;left:3.2mm;top:5mm;bottom:-5mm;border-left:1px solid #c8cdbf}.timeline-row:last-child .timeline-line:before{display:none}.timeline-dot{width:6.5mm;height:6.5mm;border:1.5px solid var(--olive);border-radius:50%;background:var(--paper)}.timeline-row h3{font-size:10pt;margin:0 0 1mm}.timeline-row p{font-size:8pt;color:var(--muted);margin:0;line-height:1.4}
      .hero-panel{background:var(--forest);color:white;padding:7mm;border-radius:6px;margin:5mm 0}.hero-panel .eyebrow{color:#d8c582}.hero-panel h3{font-family:Georgia,'Times New Roman',serif;font-size:20pt;font-weight:normal;margin:2mm 0}.hero-panel p{color:#e4e8df;font-size:8.5pt;line-height:1.5;margin:0}
      .money-lines{margin-top:4mm}.money-row{display:grid;grid-template-columns:1fr 28mm 38mm;gap:3mm;padding:2.4mm 0;border-bottom:1px solid var(--line);font-size:8.5pt}.money-row.head{font-size:6.8pt;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}.money-row strong:last-child{text-align:right}.total-box{margin-top:5mm;background:var(--forest);color:white;padding:5mm;border-radius:5px}.total-line{display:flex;justify-content:space-between;padding:1.5mm 0}.total-line.grand{font-family:Georgia,'Times New Roman',serif;font-size:18pt;border-top:1px solid rgba(255,255,255,.25);padding-top:3mm;margin-top:2mm}.paid{margin-top:4mm;background:var(--greenbg);border:1px solid #cadcc3;padding:4mm;border-radius:5px;color:#35502f}
      .pill{display:inline-block;border:1px solid #d8d2c2;background:#fff;padding:1.6mm 2.5mm;border-radius:20mm;font-size:7.6pt;margin:1mm 1mm 0 0}.check{display:grid;grid-template-columns:6mm 1fr;gap:2mm;padding:2.3mm 0;border-bottom:1px solid var(--line);font-size:8.5pt}.check span:first-child{font-size:12pt;color:var(--olive)}
      .warning{background:#fff6e5;border-left:4px solid var(--gold);padding:4mm;font-size:8.3pt;line-height:1.5;margin:4mm 0}.danger{background:var(--redbg);border:1px solid #e5bbb5;padding:4mm;color:#7a302b;font-size:8pt;line-height:1.5}.note{white-space:pre-wrap;line-height:1.45;overflow-wrap:anywhere}
      .footer{margin-top:auto;border-top:1px solid var(--line);padding-top:3mm;display:flex;justify-content:space-between;color:var(--muted);font-size:6.5pt;gap:6mm}
      .dynamic-pack-page{height:297mm;min-height:297mm;max-height:297mm;overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr) auto}
      .dynamic-page-content{min-height:0;overflow:hidden}
      .pack-flow-block{padding-bottom:7mm;margin-bottom:6mm;border-bottom:1px solid #ece7dc;break-inside:avoid;page-break-inside:avoid}
      .pack-flow-block:last-child{border-bottom:0;margin-bottom:0}
      .pack-flow-block+.pack-flow-block{padding-top:1mm}
      .pack-flow-block h2{font-size:21pt;margin-bottom:3mm}
      .pack-flow-block .lead{font-size:10pt}
      .pack-oversize{break-inside:auto;page-break-inside:auto}
      .pack-oversize .card,.pack-oversize .money-row{break-inside:avoid;page-break-inside:avoid}
      table.ops{width:100%;border-collapse:collapse;font-size:8pt}table.ops thead{display:table-header-group}table.ops tr{break-inside:avoid;page-break-inside:avoid}table.ops th{background:var(--forest);color:white;text-align:left;padding:2mm;font-size:6.7pt;text-transform:uppercase;letter-spacing:.06em}table.ops td{padding:1.7mm 2mm;border-bottom:1px solid var(--line);vertical-align:top}
      .internal-title{font-family:Georgia,'Times New Roman',serif;font-size:22pt;margin:1mm 0}.internal-banner{background:var(--forest);color:#fff;padding:4mm;margin-bottom:4mm;display:flex;justify-content:space-between;gap:6mm}.internal-banner strong{font-size:13pt}.internal-banner small{display:block;color:#d6ddcf;margin-top:1mm}
      @media print{html,body{background:#fff}.document{width:auto;margin:0}.page{margin:0;box-shadow:none}@page{size:A4 portrait;margin:0}}
    `;
  }

  function header(page,total,label='WEDDING PLAN'){return `<div class="header"><div class="mark">THE GRANARY <span style="font-family:Arial;font-size:6pt;color:var(--muted)">AT WINDMILL FARM</span></div><div class="page-no">${esc(label)} · ${page} / ${total}</div></div>`}
  function footer(label){return `<div class="footer"><span>The Granary at Windmill Farm · Whisby Road, Lincoln, Lincolnshire, LN6 3QZ</span><span>${esc(label)}</span></div>`}
  function details(r){return r.length?`<table class="detail">${r.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</table>`:`<p style="font-size:8pt;color:var(--muted)">Still to be confirmed.</p>`}
  function page(body,pageNo,total,label='Wedding Customer Pack'){return `<section class="page">${header(pageNo,total,label)}<div>${body}</div>${footer(label)}</section>`}
  function cover(m,title,subtitle,label){
    return `<section class="page cover"><div class="cover-inner"><div><div class="brand">The Granary at Windmill Farm</div><div class="wordmark">THE GRANARY</div></div><div class="cover-main"><div class="cover-kicker">${esc(label)}</div><h1>${esc(title).replace(/\n/g,'<br>')}</h1><p>${esc(subtitle)}</p></div><div class="cover-meta"><div><strong>Prepared for</strong>${esc(m.w.couple||'Your Wedding')}</div><div><strong>Wedding date</strong>${esc(dateLong(m.w.date)||'To be confirmed')}</div></div></div></section>`;
  }

  function openPrint(title,body,customer=true){
    const win=window.open('','_blank');
    if(!win){if(typeof toast==='function')toast('Allow pop-ups to open the document','error');return;}
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${baseCss(customer)}</style></head><body><main class="document">${body}</main><script>window.onload=()=>{const wait=()=>{if(document.getElementById('granary-pack-source')&&!document.body.dataset.packPaginated){setTimeout(wait,60);return;}setTimeout(()=>window.print(),180);};wait();};<\/script></body></html>`);
    win.document.close();win.focus();
  }

  function lifecycleIntro(m){
    if(m.lifecycle==='final')return {
      kicker:'YOUR FINAL WEDDING PLAN',
      title:'Your Wedding\nIs Almost Here',
      text:'Your confirmed wedding arrangements, brought together in one final plan for you to review before the day.'
    };
    if(m.lifecycle==='post')return {
      kicker:'YOUR WEDDING RECORD',
      title:'Your Wedding\nat The Granary',
      text:'A beautifully presented record of the key details held for your wedding at The Granary.'
    };
    return {
      kicker:'YOUR WEDDING PLAN',
      title:'Your Wedding\nat The Granary',
      text:'Your current wedding arrangements, including timings, food, styling, music, suppliers and wedding investment.'
    };
  }

  function suspiciousTiming(label,t){
    const s=clean(t).slice(0,5);
    return /first dance|cake|speech/i.test(label)&&['00:00','00:01'].includes(s);
  }

  function customerPack(m){
    const intro=lifecycleIntro(m);
    const quoteLines=(m.calc.lines||[]).filter(x=>good(x.name));
    const ceremonyRows=rows([
      row('Ceremony',m.ceremonyElsewhere?'Away from Windmill Farm':'At Windmill Farm'),
      row('Venue',m.ceremonyVenue),row('Time',time(m.ceremonyTime)),
      m.ceremonyElsewhere?row('Expected arrival at Windmill Farm',time(m.arrivalTime)):null,
      row('Registrar / celebrant',m.ceremony.registrarName)
    ]);
    const foodRows=rows([
      row('Wedding breakfast',m.reception.weddingBreakfastMenu||m.draft?.menu),
      row('Wedding breakfast time',time(m.reception.weddingBreakfastTime)),
      row('Service style',m.reception.mealService),
      row('Evening food',m.eveningServices[0]?.menuLabel||m.eveningServices[0]?.menuKey||m.draft?.eveningFood),
      row('Evening food time',time(m.reception.eveningFoodTime))
    ]);
    const drinkRows=rows([
      row('Drinks package',m.reception.drinksPackage||m.draft?.drinks),
      m.bespokeWelcome.length?['Welcome drinks',m.bespokeWelcome.map(x=>`${x.quantity} × ${good(x.drink)}`).join(' · ')]:null,
      m.bespokeToast.length?['Toast drinks',m.bespokeToast.map(x=>`${x.quantity} × ${good(x.drink)}`).join(' · ')]:null
    ]);
    const decorRows=rows([
      row('Colour scheme',m.decor.colourScheme),row('Chair covers / sashes',m.decor.chairCovers),
      row('Centrepieces',m.decor.centrepieces),row('Top table',m.decor.topTable),row('Backdrop',m.decor.backdrop),
      row('Welcome sign / table plan',m.decor.welcomeSign)
    ]);
    const layoutRows=rows([
      row('Table style',m.layout.tableShape),row('Top table style',m.layout.topTableStyle),
      row('Guest tables',m.layout.numberOfTables),row('Guests per table',m.layout.guestsPerTable),
      row('Dancefloor',m.layout.dancefloorPosition),row('Cake table',m.layout.cakeTable)
    ]);
    const musicRows=rows([
      row('DJ',m.suppliers.dj),row('DJ start',time(m.music.djStart)),row('DJ finish',time(m.music.djFinish)),
      row('Reception entrance',m.music.receptionEntranceSong),row('Cake cutting',m.music.cakeCutSong),
      row('First dance',m.music.firstDanceSong),row('Father / daughter dance',m.music.fatherDaughterSong),
      row('Music style',m.music.musicStyle)
    ]);
    const supplierRows=rows([
      row('Photographer',m.suppliers.photographer),row('Videographer',m.suppliers.videographer),
      row('Florist',m.suppliers.florist),row('Cake supplier',m.suppliers.cakeSupplier),
      row('Entertainment',m.suppliers.entertainment),row('Transport',m.suppliers.transport)
    ]);
    const roomRows=rows([
      row('Rooms required',m.bedrooms.roomsRequired),row('Bridal suite',m.bedrooms.bridalSuite),
      row('Night-before rooms',m.bedrooms.nightBeforeRooms),row('Room release date',fmtDateShort(m.bedrooms.roomReleaseDate)),
      row('Breakfast',time(m.bedrooms.breakfastTime)),row('Accessible accommodation',m.bedrooms.accessibleRooms)
    ]);
    const customerNotes=rows([
      row('Ceremony notes',m.ceremony.ceremonyNotes),row('Décor notes',m.decor.decorNotes),
      row('Room layout notes',m.layout.layoutNotes),row('Music notes',m.music.musicNotes)
    ]).filter(([,v])=>v.length<500);

    const block=(id,html,opts={})=>`<section class="pack-flow-block${opts.keep?' pack-keep':''}" data-pack-id="${esc(id)}">${html}</section>`;
    const flow=[];

    flow.push(block('overview',`<div class="eyebrow">Your wedding at a glance</div><h2>${esc(m.w.couple||'Your Wedding')}</h2>
      <p class="lead">${m.lifecycle==='final'?'Your wedding is nearly here. This is the version of your plan we currently hold — please check it carefully and tell us if anything is not exactly as you expect.':'A clear snapshot of the celebration we are planning together.'}</p>
      <div class="facts"><div class="fact"><small>Date</small><strong>${esc(dateLong(m.w.date)||'To be confirmed')}</strong></div><div class="fact"><small>Package</small><strong>${esc(m.packageName)}</strong></div><div class="fact"><small>Day guests</small><strong>${m.dayGuests||'—'}</strong></div><div class="fact"><small>Evening guests</small><strong>${m.eveningGuests||'—'}</strong></div></div>
      <div class="hero-panel"><div class="eyebrow">Your Granary team</div><h3>${esc(m.w.coordinator||'Your Wedding Coordinator')}</h3><p>Your coordinator will use the confirmed details in your wedding plan to brief the venue team and help ensure everyone is working to the same arrangements on the day.</p></div>
      <div class="grid2"><div class="card"><h3>Wedding style</h3>${details(rows([row('Format',typeof WEDDING_FORMATS!=='undefined'?WEDDING_FORMATS[m.profile.weddingFormat]?.label||m.profile.weddingFormat:m.profile.weddingFormat),row('Ceremony',m.ceremonyElsewhere?'Elsewhere + reception at Windmill Farm':'At Windmill Farm')]))}</div><div class="card soft"><h3>Your wedding plan</h3><p style="font-size:8.5pt;line-height:1.55;margin:0">This pack brings together the arrangements currently confirmed for your wedding. Please review each section and let your wedding coordinator know if anything needs updating.</p></div></div>`,{keep:true}));

    flow.push(block('timeline',`<div class="eyebrow">Your wedding day</div><h2>Your confirmed wedding-day timings.</h2><p class="lead">The timings below reflect the wedding plan currently held by The Granary.</p>
      <div class="timeline">${m.timeline.length?m.timeline.map(x=>`<div class="timeline-row"><div class="timeline-time">${esc(suspiciousTiming(x.label,x.time)?'Please confirm':time(x.time))}</div><div class="timeline-line"><div class="timeline-dot"></div></div><div><h3>${esc(good(x.label)||'Wedding moment')}</h3><p>${esc(suspiciousTiming(x.label,x.time)?'This timing looks unusual in the current plan and should be checked.':good(x.notes))}</p></div></div>`).join(''):'<div class="warning">Your main timings are still being confirmed.</div>'}</div>`,{keep:true}));

    if(ceremonyRows.length)flow.push(block('ceremony',`<div class="eyebrow">Your ceremony</div><h2>Your ceremony arrangements.</h2><p class="lead">${m.ceremonyElsewhere?'Your ceremony takes place away from Windmill Farm; the details below are held so our reception team knows how the day connects.':'The ceremony details we currently have confirmed.'}</p>
      <div class="grid2"><div class="card soft"><h3>Ceremony details</h3>${details(ceremonyRows)}</div><div class="card"><h3>Music & ceremony notes</h3>${details(rows([row('Bride entrance',m.ceremony.brideEntranceSong),row('Bridesmaids',m.ceremony.bridesmaidsEntranceSong),row('Ceremony exit',m.ceremony.exitSong),row('Notes',m.ceremony.ceremonyNotes)]))}</div></div>`));

    flow.push(block('food',`<div class="eyebrow">Dining & drinks</div><h2>Your confirmed menu, drinks package and service timings.</h2>
      <div class="grid2"><div class="card"><h3>Your food</h3>${details(foodRows)}</div><div class="card soft"><h3>Your drinks</h3>${details(drinkRows)}</div></div>
      ${good(m.reception.menuNotes)?`<div class="warning"><strong>Customer food note</strong><br>${esc(good(m.reception.menuNotes))}</div>`:''}
      ${m.eveningServices.length>1?`<h3 style="font-family:Georgia;margin-top:6mm">Evening food services</h3>${m.eveningServices.map((s,i)=>`<span class="pill">${esc(good(s.menuLabel||s.menuKey)||`Service ${i+1}`)}${s.guests?` · ${Number(s.guests)} covers`:''}${s.time?` · ${time(s.time)}`:''}</span>`).join('')}`:''}`));

    if(decorRows.length||layoutRows.length)flow.push(block('style',`<div class="eyebrow">Styling The Granary</div><h2>Your agreed room styling and décor.</h2><p class="lead">The room styling, décor and layout currently agreed for your wedding.</p>
      <div class="grid2"><div class="card soft"><h3>Styling & décor</h3>${details(decorRows)}</div><div class="card"><h3>Room layout</h3>${details(layoutRows)}</div></div>
      ${customerNotes.filter(([k])=>/Décor|layout/i.test(k)).length?`<div class="warning">${details(customerNotes.filter(([k])=>/Décor|layout/i.test(k)))}</div>`:''}`));

    if(musicRows.length||supplierRows.length)flow.push(block('people',`<div class="eyebrow">Music, entertainment & suppliers</div><h2>Your music choices, entertainment and supplier arrangements.</h2>
      <div class="grid2"><div class="card"><h3>Music & entertainment</h3>${details(musicRows)}</div><div class="card soft"><h3>Your suppliers</h3>${details(supplierRows)}</div></div>
      ${good(m.music.mustPlay)?`<div class="card" style="margin-top:4mm"><h3>Must-play favourites</h3><div class="note" style="font-size:8pt">${esc(good(m.music.mustPlay))}</div></div>`:''}`));

    if(roomRows.length)flow.push(block('stay',`<div class="eyebrow">Your stay</div><h2>Your accommodation arrangements.</h2><p class="lead">The bedroom arrangements currently held for your wedding.</p>
      <div class="grid2"><div class="card soft"><h3>Bedrooms</h3>${details(roomRows)}</div><div class="card"><h3>Accommodation notes</h3><div class="note" style="font-size:8.5pt">${esc(good(m.bedrooms.bedroomNotes)||'No additional accommodation notes are currently recorded.')}</div></div></div>`));

    // Investment is split into logical blocks so actual quote length controls pagination.
    flow.push(block('investment-head',`<div class="eyebrow">Your wedding investment</div><h2>Your current wedding investment and payment position.</h2><p class="lead">This summary reflects your latest wedding quotation, payments received and current balance.</p>
      ${m.brochureIncluded.length?`<div class="card soft"><h3>Included within your ${esc(m.packageName)} package</h3>${m.brochureIncluded.map(x=>`<span class="pill">${esc(x)}</span>`).join('')}<p style="font-size:7pt;color:var(--muted);margin:3mm 0 0">These are the package entitlements from the current Granary Wedding Brochure.</p></div>`:''}
      ${m.selectedArrangements.length?`<div class="card" style="margin-top:4mm"><h3>Your selected arrangements</h3>${details(m.selectedArrangements.map(x=>[x.label,x.value]))}<p style="font-size:7pt;color:var(--muted);margin:3mm 0 0">These are your actual selections against the package entitlement — for example the chosen menu, drinks arrangement and evening food.</p></div>`:''}`,{keep:true}));

    if(quoteLines.length){
      const chunkSize=7;
      for(let i=0;i<quoteLines.length;i+=chunkSize){
        const chunk=quoteLines.slice(i,i+chunkSize);
        flow.push(block(`investment-lines-${i/chunkSize}`,`${i===0?`<div class="money-lines"><div class="money-row head"><strong>Selected item</strong><strong>Qty</strong><strong style="text-align:right">Investment</strong></div>`:`<div class="money-lines"><div class="money-row head"><strong>Selected item · continued</strong><strong>Qty</strong><strong style="text-align:right">Investment</strong></div>`}${chunk.map(x=>`<div class="money-row"><strong>${esc(good(x.name))}</strong><span>${Number(x.quantity||1)}</span><strong>${money(x.total)}</strong></div>`).join('')}</div>`,{keep:true}));
      }
    }
    flow.push(block('investment-total',`<div class="total-box"><div class="total-line"><span>Subtotal</span><strong>${money(m.calc.subtotal)}</strong></div>${Number(m.calc.discount||0)>0?`<div class="total-line"><span>Discount</span><strong>−${money(m.calc.discount)}</strong></div>`:''}<div class="total-line grand"><span>Total wedding investment</span><strong>${money(m.total)}</strong></div></div>
      <div class="paid"><strong>${m.balance<=0?'✓ Your wedding is currently shown as fully paid':'Current payment position'}</strong><div style="display:flex;justify-content:space-between;margin-top:2mm"><span>Payments received: ${money(m.paid)}</span><span><strong>Balance: ${money(m.balance)}</strong></span></div></div>`,{keep:true}));

    if(m.customerOutstanding.length)flow.push(block('outstanding',`<div class="eyebrow">Final details to confirm</div><h2>A few details still need your attention.</h2><p class="lead">These are customer-facing items that currently look incomplete in the wedding record. They are here to make final checking easier, not to create pressure.</p>
      <div class="card soft">${m.customerOutstanding.map(x=>`<div class="check"><span>□</span><strong>${esc(x)}</strong></div>`).join('')}</div>
      <div class="warning">If you have already supplied any of these details, please tell your coordinator and we will make sure the wedding record is updated.</div>`));

    flow.push(block('confirm',`<div class="eyebrow">Please check & confirm</div><h2>Please check your wedding details carefully.</h2><p class="lead">Please review the details in this pack and let your wedding coordinator know if anything is incorrect, missing or has changed.</p>
      <div class="grid2"><div class="card">${['Names, date & guest numbers','Ceremony & timings','Food & drinks','Styling & room layout','Music & suppliers','Accommodation','Wedding investment & balance'].map(x=>`<div class="check"><span>□</span><strong>${x}</strong></div>`).join('')}</div><div class="hero-panel" style="margin:0"><div class="eyebrow">Your coordinator</div><h3>${esc(m.w.coordinator||'The Granary Team')}</h3><p>${m.lifecycle==='final'?'Your wedding is almost here. Once you are happy with these details, your coordinator will use the confirmed plan to brief the team for your wedding day.':'Please keep your coordinator updated as your plans develop so your wedding pack always reflects the latest arrangements.'}</p></div></div>
      <div style="margin-top:8mm;border-top:1px solid var(--line);padding-top:5mm;display:flex;justify-content:space-between;font-size:8pt;color:var(--muted)"><span>Prepared for <strong style="color:var(--ink)">${esc(m.w.couple)}</strong></span><span>Generated ${esc(new Date().toLocaleDateString('en-GB'))}</span></div>`,{keep:true}));

    // Actual browser measurement controls pagination. No "one section = one page".
    const dynamicShell=`<div id="granary-pack-pages"></div><div id="granary-pack-source" style="position:absolute;left:-10000px;top:0;width:176mm;visibility:hidden">${flow.join('')}</div>
    <script>
    (function(){
      function paginate(){
        const source=document.getElementById('granary-pack-source');
        const target=document.getElementById('granary-pack-pages');
        if(!source||!target)return;
        const blocks=[...source.children];
        target.innerHTML='';
        const pages=[];
        function createPage(){
          const s=document.createElement('section');
          s.className='page dynamic-pack-page';
          s.innerHTML='<div class="header"><div class="mark">THE GRANARY <span style="font-family:Arial;font-size:6pt;color:var(--muted)">AT WINDMILL FARM</span></div><div class="page-no"></div></div><div class="dynamic-page-content"></div><div class="footer"><span>The Granary at Windmill Farm · Whisby Road, Lincoln, Lincolnshire, LN6 3QZ</span><span>Wedding Customer Pack</span></div>';
          target.appendChild(s);pages.push(s);return s;
        }
        let current=createPage();
        let content=current.querySelector('.dynamic-page-content');
        const maxHeight=content.getBoundingClientRect().height||910;
        blocks.forEach((original,index)=>{
          const block=original.cloneNode(true);
          content.appendChild(block);
          // Use real rendered height. If this block causes overflow, move the whole block.
          if(content.scrollHeight>content.clientHeight+2 && content.children.length>1){
            content.removeChild(block);
            current=createPage();content=current.querySelector('.dynamic-page-content');
            content.appendChild(block);
          }
          // If a single block itself is taller than a page, mark it to allow natural internal split.
          if(content.scrollHeight>content.clientHeight+2 && content.children.length===1){
            block.classList.add('pack-oversize');
          }
        });
        source.remove();
        const total=1+pages.length;
        pages.forEach((pg,i)=>{
          const el=pg.querySelector('.page-no');
          if(el)el.textContent='Wedding Customer Pack · '+(i+2)+' / '+total;
        });
        document.body.dataset.packPaginated='true';
      }
      window.paginateGranaryCustomerPack=paginate;
      if(document.fonts&&document.fonts.ready){document.fonts.ready.then(()=>requestAnimationFrame(()=>requestAnimationFrame(paginate)));}
      else window.addEventListener('load',()=>setTimeout(paginate,50));
    })();
    <\/script>`;
    return cover(m,intro.title,intro.text,intro.kicker)+dynamicShell;
  }

  function quoteDoc(m){
    const lines=(m.calc.lines||[]).filter(x=>good(x.name));
    const inclusions=m.brochureIncluded;
    const total=4;
    let p=1;
    let html=cover(m,`${m.packageName}\nWedding Proposal`,'A clear, beautifully presented breakdown of the wedding package and selections currently quoted for your celebration.','PERSONALISED WEDDING PROPOSAL'); p++;
    html+=page(`<div class="eyebrow">Your proposal</div><h2>${esc(m.packageName)} at The Granary</h2><p class="lead">Prepared specifically for ${esc(m.w.couple)} for ${esc(dateLong(m.w.date)||'your chosen wedding date')}.</p>
      <div class="facts"><div class="fact"><small>Package</small><strong>${esc(m.packageName)}</strong></div><div class="fact"><small>Day guests</small><strong>${m.dayGuests}</strong></div><div class="fact"><small>Evening guests</small><strong>${m.eveningGuests}</strong></div><div class="fact"><small>Price year</small><strong>${esc(m.draft?.priceYear||m.quote?.priceYear||new Date(m.w.date||Date.now()).getFullYear())}</strong></div></div>
      <div class="hero-panel"><div class="eyebrow">Your selected package</div><h3>${esc(m.packageName)}</h3><p>${inclusions.length?'The inclusions below are taken from the current Granary Wedding Brochure package structure, with any additional saved quote selections added alongside them.':'This is a bespoke quote; inclusions are defined by the saved quote and agreed notes.'}</p></div>
      ${inclusions.length?`<div class="card soft"><h3>Included within your ${esc(m.packageName)} package</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 5mm">${inclusions.map(x=>`<div class="check"><span>✓</span><strong>${esc(x)}</strong></div>`).join('')}</div>${m.packageInfo?.notes?.length?`<div class="warning" style="margin-bottom:0">${m.packageInfo.notes.map(esc).join('<br>')}</div>`:''}</div>`:''}${m.selectedArrangements.length?`<div class="card" style="margin-top:4mm"><h3>Your selected arrangements</h3>${details(m.selectedArrangements.map(x=>[x.label,x.value]))}</div>`:''}`,p++,total,'Wedding Proposal');

    html+=page(`<div class="eyebrow">Your wedding investment</div><h2>Everything currently selected.</h2>
      <div class="money-lines"><div class="money-row head"><strong>Item</strong><strong>Qty</strong><strong style="text-align:right">Investment</strong></div>${lines.map(x=>`<div class="money-row"><strong>${esc(good(x.name))}</strong><span>${Number(x.quantity||1)}</span><strong>${money(x.total)}</strong></div>`).join('')}</div>
      <div class="total-box"><div class="total-line"><span>Subtotal</span><strong>${money(m.calc.subtotal)}</strong></div>${Number(m.calc.discount||0)>0?`<div class="total-line"><span>Discount</span><strong>−${money(m.calc.discount)}</strong></div>`:''}<div class="total-line grand"><span>Total</span><strong>${money(m.total)}</strong></div></div>
      ${good(m.draft?.notes||m.quote?.notes)?`<div class="card" style="margin-top:5mm"><h3>Notes on your proposal</h3><div class="note" style="font-size:8pt">${esc(good(m.draft?.notes||m.quote?.notes))}</div></div>`:''}`,p++,total,'Wedding Proposal');

    html+=page(`<div class="eyebrow">Proposal summary</div><h2>Clear, simple and ready to check.</h2><div class="grid2"><div class="card soft"><h3>Payment position</h3>${details([['Total wedding investment',money(m.total)],['Payments recorded',money(m.paid)],['Balance shown',money(m.balance)]])}</div><div class="card"><h3>Booking record</h3>${details(rows([row('Couple',m.w.couple),row('Wedding date',dateLong(m.w.date)),row('Package',m.packageName),row('Coordinator',m.w.coordinator)]))}</div></div>
      <div class="warning"><strong>Please check your quotation.</strong><br>If a package, quantity, price, discount or agreed extra does not look right, contact your wedding coordinator so the saved quote can be corrected. This proposal is generated from the current CRM quote record.</div>
      <div class="hero-panel"><div class="eyebrow">The Granary at Windmill Farm</div><h3>Your wedding. Planned properly.</h3><p>This proposal is subject to the venue's booking terms, availability and payment schedule. Your latest saved quote remains the commercial source of truth.</p></div>`,p++,total,'Wedding Proposal');
    return html;
  }

  function internalHeader(m,title){
    return `<div class="internal-banner"><div><strong>${esc(m.w.couple)}</strong><small>${esc(dateLong(m.w.date))} · ${esc(title)}</small></div><div style="text-align:right"><strong>${m.dayGuests} / ${m.eveningGuests}</strong><small>day / evening guests</small></div></div>`;
  }
  function opsTable(heads,rowsData){
    return `<table class="ops"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rowsData.map(r=>`<tr>${r.map(c=>`<td>${c??''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function internalPage(m,title,body,label,pageNo,total){
    return `<section class="page">${header(pageNo,total,label)}<div>${internalHeader(m,title)}${body}</div>${footer(label)}</section>`;
  }
  function dietaryTable(m){
    return m.dietary.length?opsTable(['Guest','Dietary / Allergy','Accessibility / Notes'],m.dietary.map(g=>[
      `<strong>${esc(g.guestName||'Guest')}</strong>`, `<strong style="color:var(--red)">${esc(good(g.dietaryRequirements)||'—')}</strong>`, esc(good(g.accessibilityNotes)||'—')
    ])):`<div class="card">No named dietary, allergy or accessibility notes are currently recorded.</div>`;
  }
  function runningTable(m){
    return m.running.length?opsTable(['Time','Event','Responsible','Location','Notes'],m.running.map(x=>[
      `<strong>${esc(time(x.startTime))}</strong>`,`<strong>${esc(good(x.title))}</strong>`,esc(good(x.responsible)||'—'),esc(good(x.location)||'—'),esc(good(visibleRunNotes(x.notes))||'')
    ])):`<div class="card">No Running Order is currently recorded.</div>`;
  }
  function prepRows(m,dept){
    return arr(m.prep?.rows).filter(x=>!dept||x.department===dept);
  }
  function prepTable(m,dept){
    const rs=prepRows(m,dept);
    return rs.length?opsTable(['Department','Prep / Equipment','Qty','Notes'],rs.map(x=>[
      esc(good(x.department)),`<strong>${esc(good(x.item))}</strong>`,esc(x.quantity),esc(good(x.notes))
    ])):`<div class="card">No calculated prep rows.</div>`;
  }

  function internalDoc(m,type){
    if(type==='kitchen'){
      return internalPage(m,'Kitchen Copy',`<div class="grid2"><div class="card soft"><h3>Service timings</h3>${details(rows([row('Wedding breakfast',time(m.reception.weddingBreakfastTime)),row('Evening food',time(m.reception.eveningFoodTime)),row('Day covers',m.dayGuests),row('Evening covers',m.eveningGuests)]))}</div><div class="card"><h3>Menu</h3>${details(rows([row('Wedding breakfast',m.reception.weddingBreakfastMenu||m.draft?.menu),row('Service style',m.reception.mealService),row('Evening food',m.eveningServices[0]?.menuLabel||m.eveningServices[0]?.menuKey||m.draft?.eveningFood)]))}</div></div>
        <h2 class="internal-title">Dietary & allergen matrix</h2>${dietaryTable(m)}
        <h2 class="internal-title">Kitchen prep</h2>${prepTable(m,'Restaurant')}${prepRows(m,'Evening Food').length?`<div style="margin-top:4mm">${prepTable(m,'Evening Food')}</div>`:''}`, 'Kitchen Copy',1,1);
    }
    if(type==='bar'){
      const q=m.drinksCalc?.quantities;
      return internalPage(m,'Bar Copy',`<div class="grid2"><div class="card soft"><h3>Drinks plan</h3>${details(rows([row('Package',m.reception.drinksPackage||m.draft?.drinks),q?row('Welcome flutes',q.welcomeFlutes):null,q?row('Toast flutes',q.toastFlutes):null,q?row('Total flute services',q.totalFluteServices):null]))}</div><div class="card"><h3>Key timings</h3>${details(m.timeline.slice(0,8).map(x=>[x.label,time(x.time)]))}</div></div><h2 class="internal-title">Bar prep & glassware</h2>${prepTable(m,'Bar')}
        <h2 class="internal-title">Music cues useful to bar / duty team</h2>${details(rows([row('DJ start',time(m.music.djStart)),row('First dance',m.music.firstDanceSong),row('Evening food',time(m.reception.eveningFoodTime)),row('Finish',time(m.reception.finishTime))]))}`, 'Bar Copy',1,1);
    }
    if(type==='coordinator'){
      let html=internalPage(m,'Coordinator Copy',`<div class="grid2"><div class="card soft"><h3>Wedding control</h3>${details(rows([row('Coordinator',m.w.coordinator),row('Package',m.packageName),row('Ceremony',m.ceremonyElsewhere?m.ceremonyVenue:'Windmill Farm'),row('Day guests',m.dayGuests),row('Evening guests',m.eveningGuests)]))}</div><div class="card"><h3>Key suppliers</h3>${details(rows([row('Photographer',m.suppliers.photographer),row('DJ',m.suppliers.dj),row('Cake',m.suppliers.cakeSupplier),row('Entertainment',m.suppliers.entertainment)]))}</div></div><h2 class="internal-title">Running Order</h2>${runningTable(m)}`, 'Coordinator Copy',1,2);
      html+=internalPage(m,'Coordinator Detail',`<div class="grid2"><div class="card"><h3>Styling & layout</h3>${details(rows([row('Colours',m.decor.colourScheme),row('Chair covers / sashes',m.decor.chairCovers),row('Centrepieces',m.decor.centrepieces),row('Backdrop',m.decor.backdrop),row('Layout notes',m.layout.layoutNotes)]))}</div><div class="card soft"><h3>Music & suppliers</h3>${details(rows([row('DJ setup',time(m.music.djSetupTime)),row('DJ start',time(m.music.djStart)),row('First dance',m.music.firstDanceSong),row('Photographer',m.suppliers.photographer),row('Supplier notes',m.suppliers.supplierNotes)]))}</div></div><h2 class="internal-title">Dietary / accessibility awareness</h2>${dietaryTable(m)}<h2 class="internal-title">Outstanding wedding tasks</h2>${m.tasks.filter(x=>!x.completed).length?opsTable(['Task','Due','Owner'],m.tasks.filter(x=>!x.completed).map(x=>[esc(good(x.title)),esc(x.dueDate||''),esc(good(x.assignedTo)||'—')])):'<div class="card">No outstanding wedding tasks.</div>'}`, 'Coordinator Copy',2,2);
      return html;
    }
    // Full function sheet
    let html=internalPage(m,'Full Function Sheet',`<div class="grid2"><div class="card soft"><h3>Event control</h3>${details(rows([row('Package',m.packageName),row('Coordinator',m.w.coordinator),row('Ceremony venue',m.ceremonyVenue),row('Day guests',m.dayGuests),row('Evening guests',m.eveningGuests),row('Quoted total',money(m.total)),row('Balance',money(m.balance))]))}</div><div class="card"><h3>Master timings</h3>${details(m.timeline.slice(0,10).map(x=>[x.label,time(x.time)]))}</div></div><h2 class="internal-title">Running Order</h2>${runningTable(m)}`, 'Full Function Sheet',1,3);
    html+=internalPage(m,'Food, Drinks & Guests',`<div class="grid2"><div class="card"><h3>Food</h3>${details(rows([row('Wedding breakfast',m.reception.weddingBreakfastMenu||m.draft?.menu),row('Breakfast time',time(m.reception.weddingBreakfastTime)),row('Evening food',m.eveningServices[0]?.menuLabel||m.draft?.eveningFood),row('Evening time',time(m.reception.eveningFoodTime))]))}</div><div class="card soft"><h3>Drinks</h3>${details(rows([row('Package',m.reception.drinksPackage||m.draft?.drinks),m.drinksCalc?.quantities?row('Total flute services',m.drinksCalc.quantities.totalFluteServices):null]))}</div></div><h2 class="internal-title">Dietary / allergen / accessibility</h2>${dietaryTable(m)}<h2 class="internal-title">Prep & equipment</h2>${prepTable(m)}`, 'Full Function Sheet',2,3);
    html+=internalPage(m,'Commercial, Suppliers & Setup',`<div class="grid2"><div class="card soft"><h3>Commercial</h3>${details([['Total',money(m.total)],['Paid',money(m.paid)],['Balance',money(m.balance)]])}</div><div class="card"><h3>Suppliers</h3>${details(rows([row('Photographer',m.suppliers.photographer),row('DJ',m.suppliers.dj),row('Entertainment',m.suppliers.entertainment),row('Cake',m.suppliers.cakeSupplier),row('Transport',m.suppliers.transport)]))}</div><div class="card"><h3>Styling</h3>${details(rows([row('Colours',m.decor.colourScheme),row('Chair covers / sashes',m.decor.chairCovers),row('Centrepieces',m.decor.centrepieces),row('Backdrop',m.decor.backdrop)]))}</div><div class="card soft"><h3>Accommodation</h3>${details(rows([row('Rooms',m.bedrooms.roomsRequired),row('Bridal suite',m.bedrooms.bridalSuite),row('Night-before rooms',m.bedrooms.nightBeforeRooms),row('Notes',m.bedrooms.bedroomNotes)]))}</div></div>`, 'Full Function Sheet',3,3);
    return html;
  }

  function djDoc(m){
    let html=internalPage(m,'DJ Handover',`<div class="grid2"><div class="card soft"><h3>Access & performance</h3>${details(rows([row('DJ',m.suppliers.dj),row('Setup / access',time(m.music.djSetupTime)),row('Start',time(m.music.djStart)),row('Finish',time(m.music.djFinish)),row('Evening guests',m.eveningGuests)]))}</div><div class="card"><h3>Key music cues</h3>${details(rows([row('Reception entrance',m.music.receptionEntranceSong),row('Cake cutting',m.music.cakeCutSong),row('First dance',m.music.firstDanceSong),row('Father / daughter',m.music.fatherDaughterSong)]))}</div></div>
      <h2 class="internal-title">Music brief</h2><div class="grid2"><div class="card"><h3>Must play</h3><div class="note">${esc(good(m.music.mustPlay)||'None recorded')}</div></div><div class="card"><h3>Do not play</h3><div class="note">${esc(good(m.music.doNotPlay)||'None recorded')}</div></div><div class="card"><h3>Style / set preferences</h3><div class="note">${esc(good(m.music.musicStyle)||'None recorded')}</div></div><div class="card"><h3>Guest requests</h3><div class="note">${esc(good(m.music.guestRequests)||'No policy recorded')}</div></div></div>
      <h2 class="internal-title">Relevant Running Order</h2>${opsTable(['Time','Moment','Location'],m.running.filter(x=>/arrival|cake|dance|evening|dj|finish/i.test(`${x.title} ${x.responsible}`)).map(x=>[esc(time(x.startTime)),`<strong>${esc(good(x.title))}</strong>`,esc(good(x.location)||'—')]))}`,'DJ Handover',1,1);
    return html;
  }

  function supplierDoc(m){
    return internalPage(m,'Supplier Handover',`<div class="grid2"><div class="card soft"><h3>Supplier register</h3>${details(rows([row('Photographer',m.suppliers.photographer),row('Videographer',m.suppliers.videographer),row('Florist',m.suppliers.florist),row('Cake supplier',m.suppliers.cakeSupplier),row('DJ',m.suppliers.dj),row('Entertainment',m.suppliers.entertainment),row('Transport',m.suppliers.transport)]))}</div><div class="card"><h3>Venue context</h3>${details(rows([row('Coordinator',m.w.coordinator),row('Ceremony',m.ceremonyVenue),row('Day guests',m.dayGuests),row('Evening guests',m.eveningGuests),row('Colours',m.decor.colourScheme),row('Backdrop',m.decor.backdrop)]))}</div></div>
      <h2 class="internal-title">Relevant timings</h2>${opsTable(['Time','Event','Responsible','Location'],m.running.filter(x=>/arrival|ceremony|breakfast|cake|dance|evening|finish|supplier|dj/i.test(`${x.title} ${x.responsible}`)).map(x=>[esc(time(x.startTime)),`<strong>${esc(good(x.title))}</strong>`,esc(good(x.responsible)||'—'),esc(good(x.location)||'—')]))}
      ${good(m.suppliers.supplierNotes)?`<h2 class="internal-title">Supplier notes</h2><div class="card note">${esc(good(m.suppliers.supplierNotes))}</div>`:''}`,'Supplier Handover',1,1);
  }

  function prepDoc(m){
    return internalPage(m,'Prep & Equipment Sheet',`${m.prep?.warnings?.length?`<div class="danger"><strong>Prep checks required</strong><br>${m.prep.warnings.map(esc).join('<br>')}</div>`:''}<h2 class="internal-title">Calculated prep requirements</h2>${prepTable(m)}
      <div class="grid2" style="margin-top:5mm"><div class="card soft"><h3>Drinks / glassware</h3>${m.drinksCalc?.quantities?details(rows([row('Welcome flutes',m.drinksCalc.quantities.welcomeFlutes),row('Toast flutes',m.drinksCalc.quantities.toastFlutes),row('Total flute services',m.drinksCalc.quantities.totalFluteServices)])):'<p>No calculated drinks requirements.</p>'}</div><div class="card"><h3>Event context</h3>${details(rows([row('Day guests',m.dayGuests),row('Evening guests',m.eveningGuests),row('Package',m.packageName),row('Coordinator',m.w.coordinator)]))}</div></div>`, 'Prep & Equipment',1,1);
  }

  function recordHistory(weddingId,type){
    const history=window.WeddingDocumentHistory;
    if(!history||typeof history.add!=='function')return;
    const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);
    const finalState=wedding&&window.WeddingFinalisation?.state?WeddingFinalisation.state(wedding):null;
    const mapped=type==='customer'?'customerPack':type==='quote'?'proposal':type;
    const extra={};
    if(type==='quote'&&typeof quotesForWedding==='function')extra.version=Number(quotesForWedding(weddingId)?.[0]?.version||1);
    if(['full','kitchen','bar','coordinator'].includes(type)){
      extra.controlled=!!finalState?.issued;
      extra.issueVersion=Number(finalState?.meta?.issuedVersion||finalState?.currentVersion||1);
    }
    // Do not delay the browser print window while Supabase records the audit trail.
    Promise.resolve(history.add(weddingId,mapped,extra)).catch(error=>console.warn('Document history record failed',error));
  }

  DS.print=function(weddingId,type='customer'){
    const m=DS.model(weddingId); if(!m){if(typeof toast==='function')toast('Wedding not found','error');return;}
    recordHistory(weddingId,type);
    if(type==='customer')return openPrint(`Wedding Pack - ${m.w.couple}`,customerPack(m),true);
    if(type==='quote')return openPrint(`Wedding Proposal - ${m.w.couple}`,quoteDoc(m),true);
    if(['full','kitchen','bar','coordinator'].includes(type))return openPrint(`${type} - ${m.w.couple}`,internalDoc(m,type),false);
    if(type==='dj')return openPrint(`DJ Handover - ${m.w.couple}`,djDoc(m),false);
    if(type==='supplier')return openPrint(`Supplier Handover - ${m.w.couple}`,supplierDoc(m),false);
    // The operational Prep List is intentionally NOT the generic document-system table.
    // It retains the improved weddingPrepRows() logic plus printable checkboxes and sign-off fields.
    if(type==='prep')return operationalPrepPrinter?operationalPrepPrinter(weddingId):openPrint(`Prep Sheet - ${m.w.couple}`,prepDoc(m),false);
  };

  DS.audit=function(weddingId){
    const m=DS.model(weddingId); if(!m)return null;
    return {
      wedding:m.w.couple,version:DS.version,
      documents:['Customer Wedding Pack','Wedding Proposal / Quote','Full Function Sheet','Coordinator Copy','Kitchen Copy','Bar Copy','DJ Handover','Supplier Handover','Wedding Prep List'],
      customerOutstanding:m.customerOutstanding,
      quote:{total:m.total,paid:m.paid,balance:m.balance,lines:(m.calc.lines||[]).length},
      sources:{planning:true,quote:!!m.quote||!!m.draft,guests:m.guests.length,runningOrder:m.running.length,prepRows:arr(m.prep?.rows).length}
    };
  };

  window.GranaryDocumentSystemV2=DS;

  // Authoritative print entry points. Every current wedding document button routes through this dispatcher.
  window.printWeddingCustomerPack=id=>DS.print(id,'customer');
  window.printWeddingQuote=id=>DS.print(id,'quote');
  window.printWeddingFunctionSheet=(id,type='full')=>DS.print(id,type);
  window.printWeddingDjHandover=id=>DS.print(id,'dj');
  window.printWeddingSupplierHandover=id=>DS.print(id,'supplier');
  window.printWeddingPrepList=id=>DS.print(id,'prep');

  // Also replace the document engines used internally by existing functions.
  window.WeddingDocumentEngine={...(window.WeddingDocumentEngine||{}),printCustomerPack:id=>DS.print(id,'customer'),printQuote:id=>DS.print(id,'quote'),systemVersion:DS.version};
  window.WeddingInternalDocumentEngine={...(window.WeddingInternalDocumentEngine||{}),build:(id,type='full')=>{
    const m=DS.model(id);return m?`<!doctype html><html><head><meta charset="utf-8"><style>${baseCss(false)}</style></head><body><main class="document">${internalDoc(m,type)}</main></body></html>`:'Wedding not found';
  },systemVersion:DS.version};
  window.WeddingHandoverDocumentEngine={...(window.WeddingHandoverDocumentEngine||{}),print:(id,type='dj')=>DS.print(id,type),systemVersion:DS.version};
})();
