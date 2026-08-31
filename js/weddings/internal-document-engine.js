// ============================================================================
// THE GRANARY AT WINDMILL FARM — INTERNAL WEDDING DOCUMENT ENGINE
// WEDDING V2 · PHASE 8
// Full Function Sheet + Kitchen + Bar + Coordinator.
// Overview + Planning + Quote + Guests + Running Order are the source data.
// ============================================================================
(function(){
  const escv=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=v=>'£'+Number(v||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fmtDate=v=>{
    if(!v)return 'DATE TBC';
    const d=new Date(`${v}T12:00:00`);
    return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  };
  const fmtTime=v=>{
    if(!v)return 'TBC';
    if(!/^\d{1,2}:\d{2}/.test(String(v)))return String(v);
    const [h,m]=String(v).slice(0,5).split(':').map(Number);
    return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'pm':'am'}`;
  };
  const selected=v=>{const x=String(v??'').trim();return x&&!['none','n/a','not required','no'].includes(x.toLowerCase())};
  const visibleRunNotes=v=>typeof runningOrderVisibleNotes==='function'?runningOrderVisibleNotes(v):String(v||'').replace(/\[WFPLAN:[^\]]+\]/g,'').replace(/\[WFPLAN-OVERRIDE\]/g,'').trim();

  function baseCss(){
    return `
    :root{--olive:#52663b;--olive2:#eef2e8;--ink:#20231f;--muted:#697066;--line:#d7dcd2;--cream:#f6f3e9;--amber:#fff7df;--red:#9f1d1d;--redbg:#fff0f0;--blue:#edf4f8;--gold:#b79b52}
    *{box-sizing:border-box}html,body{margin:0;padding:0;color:var(--ink);font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-size:9.5pt;background:#eee}.doc{width:210mm;margin:auto;background:white}
    .page{width:210mm;min-height:297mm;padding:11mm 12mm 9mm;page-break-after:always;background:#fff;display:flex;flex-direction:column}
    .page:last-child{page-break-after:auto}.content{flex:1}
    .mast{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid var(--olive);padding-bottom:4mm;margin-bottom:4mm}.brand{font-weight:800;letter-spacing:.08em;font-size:7.6pt;color:var(--olive)}.mast h1{font-size:20pt;margin:1mm 0}.copy{font-weight:800;font-size:11pt;text-transform:uppercase;color:var(--olive)}.meta{text-align:right;font-size:8pt;line-height:1.45}
    .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm;margin:0 0 4mm}.stat{border:1px solid var(--line);padding:2.5mm;background:var(--cream);break-inside:avoid}.stat small{display:block;color:var(--muted);font-size:6.7pt;text-transform:uppercase;letter-spacing:.05em}.stat strong{display:block;font-size:12.5pt;margin-top:1mm}
    h2{font-size:12.5pt;margin:4mm 0 2mm;border-bottom:2px solid var(--olive);padding-bottom:1.2mm;break-after:avoid-page}h3{font-size:10pt;margin:0 0 2mm;break-after:avoid-page}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm}
    .box{border:1px solid var(--line);padding:2.6mm;break-inside:avoid;page-break-inside:avoid}.box.tint{background:var(--cream)}.box.alert{background:var(--redbg);border-color:#e8b8b8}.box.info{background:var(--blue)}
    table{width:100%;border-collapse:collapse;font-size:8.5pt;break-inside:auto}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}th{background:var(--olive);color:#fff;text-align:left;padding:1.8mm;font-size:7.1pt;text-transform:uppercase;letter-spacing:.04em}td{padding:1.55mm 1.8mm;border-bottom:1px solid var(--line);vertical-align:top}tr:nth-child(even) td{background:#fafafa}
    .num{text-align:right;font-weight:800}.time{font-weight:800;white-space:nowrap}.danger{color:var(--red);font-weight:800}.muted{color:var(--muted)}.small{font-size:7.7pt}.note{white-space:pre-wrap;line-height:1.4;overflow-wrap:anywhere}
    .pill{display:inline-block;padding:.8mm 1.8mm;border-radius:10mm;background:var(--olive2);font-size:7.4pt;font-weight:700;margin:.4mm}.service{border-left:3px solid var(--olive);padding:2.2mm 2.6mm;margin:2mm 0;background:#fafbf8;break-inside:avoid}.service-head{display:flex;justify-content:space-between;gap:4mm}.service-head strong{font-size:10pt}.alloc{display:grid;grid-template-columns:1fr auto;gap:1mm 3mm;margin-top:2mm}
    .allergy-banner{background:var(--redbg);border:2px solid #c94b4b;padding:2.6mm;margin:3mm 0}.allergy-banner strong{color:var(--red);font-size:10pt}
    .commercial{background:#20231f;color:#fff;padding:3mm}.commercial table td{border-color:#ffffff25;background:transparent!important}.commercial strong{color:#fff}.commercial .muted{color:#d5d8d2}
    .source{font-size:6.7pt;color:var(--muted);margin-top:1mm}.footer{margin-top:auto;padding-top:3mm;border-top:1px solid var(--line);color:var(--muted);font-size:6.8pt;display:flex;justify-content:space-between;gap:5mm}
    .page-break{break-before:page;page-break-before:always}.avoid{break-inside:avoid;page-break-inside:avoid}
    @media print{body{background:white}.doc{margin:0;width:auto}.page{margin:0;box-shadow:none}@page{size:A4;margin:0}}
    `;
  }

  function ctx(weddingId){
    const w=(DB.weddings||[]).find(x=>x.id===weddingId);if(!w)return null;
    const plan=section=>typeof planningData==='function'?planningData(weddingId,section)||{}:{};
    const sheet=typeof functionSheetFor==='function'?functionSheetFor(weddingId):null;
    const guests=typeof weddingGuestsFor==='function'?weddingGuestsFor(weddingId):[];
    const tables=typeof seatingTablesFor==='function'?seatingTablesFor(weddingId):[];
    const run=typeof runningOrderFor==='function'?runningOrderFor(weddingId):[];
    const profile=typeof weddingProfile==='function'?weddingProfile(w):{};
    const reception=plan('reception'),ceremony=plan('ceremony'),suppliers=plan('suppliers'),music=plan('music'),decor=plan('decor'),bedrooms=plan('bedrooms'),layout=plan('layout');
    const tasks=(DB.weddingTasks||[]).filter(x=>x.weddingId===weddingId&&!x.completed);
    const payments=(DB.weddingPayments||[]).filter(x=>x.weddingId===weddingId);
    const dietary=guests.filter(g=>String(g.dietaryRequirements||'').trim()||String(g.accessibilityNotes||'').trim());
    const choices=k=>typeof countChoice==='function'?countChoice(guests,k):[];
    const quote=typeof latestWeddingQuote==='function'?latestWeddingQuote(weddingId):(DB.weddingQuotes||[]).filter(x=>x.weddingId===weddingId).sort((a,b)=>Number(b.version||0)-Number(a.version||0))[0]||null;
    const quoteLines=(quote?.items||[]).flat(Infinity).filter(x=>x&&typeof x==='object'&&x.type!=='meta');
    const quoteMeta=(quote?.items||[]).find(x=>x?.type==='meta')||{};
    const prep=typeof weddingPrepRows==='function'?weddingPrepRows(w):{rows:[],warnings:[]};
    const drinks=window.WeddingConsumptionRules?.drinksCalculation?WeddingConsumptionRules.drinksCalculation(w):null;
    let eveningServices=[];
    try{
      const raw=typeof ensureWeddingEveningServices==='function'?ensureWeddingEveningServices(w,reception):(reception.eveningFoodServices||[]);
      eveningServices=(raw||[]).map(s=>{
        const def=typeof weddingKitchenMenus==='function'?weddingKitchenMenus()[s.menuKey]:null;
        const selectedRows=(s.selectedIds||[]).map(id=>typeof kitchenSpecRecipeById==='function'?kitchenSpecRecipeById(id):null).filter(Boolean);
        return {...s,label:s.menuLabel||def?.label||s.menuKey||'Evening Food',selected:selectedRows};
      });
    }catch(e){eveningServices=reception.eveningFoodServices||[]}
    const netPaid=payments.filter(x=>x.status==='Paid').reduce((n,x)=>n+(x.type==='Refund'?-Math.abs(Number(x.amount||0)):Math.abs(Number(x.amount||0))),0);
    const total=Number(quote?.total??w.quotedValue??0),paid=payments.length?Math.max(0,netPaid):Number(w.paid||0),balance=Math.max(0,total-paid);
    return {w,sheet,guests,tables,run,profile,reception,ceremony,suppliers,music,decor,bedrooms,layout,tasks,payments,dietary,quote,quoteLines,quoteMeta,prep,drinks,eveningServices,total,paid,balance,
      starters:choices('starterChoice'),mains:choices('mainChoice'),desserts:choices('dessertChoice'),evening:choices('eveningFoodChoice')};
  }

  function mast(c,title){
    return `<div class="mast"><div><div class="brand">THE GRANARY AT WINDMILL FARM · WEDDING OPERATIONS</div><h1>${escv(c.w.couple||'Wedding')}</h1><div class="copy">${escv(title)}</div></div><div class="meta"><strong>${escv(fmtDate(c.w.date))}</strong><br>Function Sheet V${Number(c.sheet?.version||1)}<br>Coordinator: ${escv(c.w.coordinator||'Unassigned')}<br>Prepared by: ${escv(c.sheet?.preparedBy||'Not set')}</div></div>`;
  }
  function stats(c){
    return `<div class="stats"><div class="stat"><small>Day guests</small><strong>${Number(c.w.dayGuests||0)}</strong></div><div class="stat"><small>Evening guests</small><strong>${Number(c.w.eveningGuests||0)}</strong></div><div class="stat"><small>Package</small><strong style="font-size:9.5pt">${escv(c.quote?.packageName||c.w.package||'TBC')}</strong></div><div class="stat"><small>Quoted</small><strong style="font-size:10pt">${money(c.total)}</strong></div><div class="stat"><small>Balance</small><strong style="font-size:10pt">${money(c.balance)}</strong></div></div>`;
  }
  function footer(label,page=''){return `<div class="footer"><span>${escv(label)} · Internal use only · Overview + Planning + Quote</span><span>${page?`Page ${page} · `:''}Generated ${new Date().toLocaleString('en-GB')}</span></div>`}
  function page(c,title,content,label,pageNo=''){return `<section class="page">${mast(c,title)}<div class="content">${content}</div>${footer(label,pageNo)}</section>`}

  function keyTimings(c){
    const rows=typeof weddingMasterTimingRows==='function'?weddingMasterTimingRows(c.w):[];
    return rows.length?`<table><thead><tr><th>Moment</th><th>Time</th></tr></thead><tbody>${rows.map(([l,t])=>`<tr><td>${escv(l)}</td><td class="time">${escv(fmtTime(t))}</td></tr>`).join('')}</tbody></table>`:'<div class="muted">No master timings recorded.</div>';
  }
  function timeline(c,compact=false){
    if(!c.run.length)return `<div class="box muted">No Running Order has been created.</div>`;
    return `<table><thead><tr><th>Time</th><th>Event</th><th>Responsible</th><th>Location</th>${compact?'':'<th>Notes</th>'}</tr></thead><tbody>${c.run.map(x=>`<tr><td class="time">${escv(fmtTime(x.startTime))}</td><td><strong>${escv(x.title)}</strong></td><td>${escv(x.responsible||'—')}</td><td>${escv(x.location||'—')}</td>${compact?'':`<td>${escv(visibleRunNotes(x.notes)||'')}</td>`}</tr>`).join('')}</tbody></table>`;
  }
  function choiceTable(title,items){
    return `<div class="box"><h3>${escv(title)}</h3>${items.length?`<table><tbody>${items.map(([n,v])=>`<tr><td>${escv(n)}</td><td class="num">${Number(v)}</td></tr>`).join('')}</tbody></table>`:'<div class="muted small">None entered</div>'}</div>`;
  }
  function dietaryTable(c,includeChoices=true){
    if(!c.dietary.length)return `<div class="box"><strong>No dietary, allergy or accessibility notes recorded.</strong></div>`;
    return `<div class="allergy-banner"><strong>ALLERGY / DIETARY INFORMATION — CHECK BEFORE SERVICE</strong><div class="small">Follow the venue allergy process. Never rely on this sheet alone for allergen safety.</div></div><table><thead><tr><th>Guest</th><th>Table</th><th>Dietary / Allergy</th><th>Accessibility / Notes</th>${includeChoices?'<th>Food choice</th>':''}</tr></thead><tbody>${c.dietary.map(g=>{const t=c.tables.find(x=>x.id===g.tableId);return `<tr><td><strong>${escv(g.guestName)}</strong></td><td>${escv(t?.tableName||'Unassigned')}</td><td class="danger">${escv(g.dietaryRequirements||'—')}</td><td>${escv(g.accessibilityNotes||g.notes||'—')}</td>${includeChoices?`<td>${escv([g.starterChoice,g.mainChoice,g.dessertChoice].filter(Boolean).join(' / ')||'—')}</td>`:''}</tr>`}).join('')}</tbody></table>`;
  }
  function eveningServices(c){
    if(!c.eveningServices.length)return `<div class="box muted">No structured evening food service recorded.</div>`;
    return c.eveningServices.map(s=>{
      const fc=window.WeddingConsumptionRules?.foodServiceCalculation?WeddingConsumptionRules.foodServiceCalculation(s):null;
      const alloc=fc?.activeChoices?.length?fc.activeChoices.map(x=>[x.name,x.count]):Object.entries(s.allocations||{}).filter(([,v])=>Number(v)>0);
      return `<div class="service"><div class="service-head"><strong>${escv(s.label)}</strong><span><b>${Number(s.guests||0)}</b> covers · <b>${escv(fmtTime(s.time||c.reception.eveningFoodTime))}</b></span></div>${(s.selected||[]).length?`<div>${s.selected.map(r=>`<span class="pill">${escv(r.name||r.title||'Item')}</span>`).join('')}</div>`:''}${alloc.length?`<div class="alloc">${alloc.map(([k,v])=>`<span>${escv(k)}</span><strong>${Number(v)}</strong>`).join('')}</div>`:''}${fc&&!fc.complete?`<div class="small danger">${fc.issues.map(escv).join(' ')}</div>`:''}${s.notes?`<div class="small note">${escv(s.notes)}</div>`:''}</div>`;
    }).join('');
  }

  function ceremonySummary(c){
    if(c.profile.ceremonyLocationType==='external')return `<table><tbody><tr><td>Ceremony</td><td><strong>Elsewhere</strong></td></tr><tr><td>Venue</td><td>${escv(c.profile.externalCeremonyVenue||'TBC')}</td></tr><tr><td>Ceremony time</td><td class="time">${escv(fmtTime(c.profile.externalCeremonyTime))}</td></tr><tr><td>Expected Windmill arrival</td><td class="time">${escv(fmtTime(c.profile.venueArrivalTime||c.reception.arrivalTime))}</td></tr></tbody></table>`;
    if(typeof weddingHasOnsiteCeremony==='function'&&!weddingHasOnsiteCeremony(c.w))return `<div class="muted">No ceremony at Windmill Farm for this wedding format.</div>`;
    return `<table><tbody>${[['Ceremony time',fmtTime(c.ceremony.ceremonyTime)],['Location',c.ceremony.ceremonyLocation],['Registrar / celebrant',c.ceremony.registrarName],['Ceremony guests',c.ceremony.ceremonyGuests],['Groom registrar room',c.ceremony.groomRegistrarRoom],['Bride registrar room',c.ceremony.brideRegistrarRoom]].filter(([,v])=>selected(v)).map(([l,v])=>`<tr><td>${escv(l)}</td><td><strong>${escv(v)}</strong></td></tr>`).join('')}</tbody></table>${c.ceremony.ceremonyNotes?`<div class="note small">${escv(c.ceremony.ceremonyNotes)}</div>`:''}`;
  }
  function planningBlocks(c){
    const additional=(c.reception.additionalTimings||[]).filter(x=>x&&(x.label||x.time));
    const supplierLines=[['Photographer',c.suppliers.photographer],['Videographer',c.suppliers.videographer],['Florist',c.suppliers.florist],['Cake',c.suppliers.cakeSupplier],['DJ',c.suppliers.dj],['Entertainment',c.suppliers.entertainment],['Transport',c.suppliers.transport]].filter(([,v])=>selected(v));
    const musicLines=[['DJ setup',fmtTime(c.music.djSetupTime)],['DJ start',fmtTime(c.music.djStart)],['DJ finish',fmtTime(c.music.djFinish)],['Reception entrance',c.music.receptionEntranceSong],['Cake cutting',c.music.cakeCutSong],['First dance',c.music.firstDanceSong],['Father / daughter',c.music.fatherDaughterSong],['Must play',c.music.mustPlay],['Do not play',c.music.doNotPlay],['Music style',c.music.musicStyle],['Guest requests',c.music.guestRequests]].filter(([,v])=>selected(v)&&v!=='TBC');
    const decorLines=[['Colours',c.decor.colourScheme],['Chair covers / sashes',c.decor.chairCovers],['Centrepieces',c.decor.centrepieces],['Top table',c.decor.topTable],['Backdrop',c.decor.backdrop],['Welcome sign / table plan',c.decor.welcomeSign],['Décor notes',c.decor.decorNotes]].filter(([,v])=>selected(v));
    const layoutLines=[['Table shape',c.layout.tableShape],['Top table style',c.layout.topTableStyle],['Guest tables',c.layout.numberOfTables],['Guests per table',c.layout.guestsPerTable],['Dancefloor',c.layout.dancefloorPosition],['Cake table',c.layout.cakeTable],['Layout notes',c.layout.layoutNotes]].filter(([,v])=>selected(v));
    const bedLines=[['Rooms required',c.bedrooms.roomsRequired],['Bridal suite',c.bedrooms.bridalSuite],['Night-before rooms',c.bedrooms.nightBeforeRooms],['Release date',c.bedrooms.roomReleaseDate],['Breakfast',fmtTime(c.bedrooms.breakfastTime)],['Accessible rooms',c.bedrooms.accessibleRooms],['Bedroom notes',c.bedrooms.bedroomNotes]].filter(([,v])=>selected(v)&&v!=='TBC');
    const tbl=rows=>rows.length?`<table><tbody>${rows.map(([l,v])=>`<tr><td>${escv(l)}</td><td>${escv(v)}</td></tr>`).join('')}</tbody></table>`:'<div class="muted small">Nothing recorded.</div>';
    return `<div class="grid2"><div class="box"><h3>Suppliers</h3>${tbl(supplierLines)}${c.suppliers.supplierNotes?`<div class="note small">${escv(c.suppliers.supplierNotes)}</div>`:''}</div><div class="box"><h3>Music / DJ</h3>${tbl(musicLines)}${c.music.musicNotes?`<div class="note small">${escv(c.music.musicNotes)}</div>`:''}</div><div class="box"><h3>Décor / Styling</h3>${tbl(decorLines)}</div><div class="box"><h3>Room Layout</h3>${tbl(layoutLines)}</div><div class="box"><h3>Accommodation</h3>${tbl(bedLines)}</div><div class="box"><h3>Additional Reception Timings</h3>${additional.length?`<table><tbody>${additional.map(x=>`<tr><td class="time">${escv(fmtTime(x.time))}</td><td><strong>${escv(x.label||'Additional timing')}</strong>${x.notes?`<br><span class="small">${escv(x.notes)}</span>`:''}</td></tr>`).join('')}</tbody></table>`:'<div class="muted small">None recorded.</div>'}</div></div>`;
  }

  function drinksBlock(c){
    const dc=c.drinks,q=dc?.quantities,r=c.reception;
    if(!dc||!q)return `<div class="box"><strong>Drinks:</strong> ${escv(r.drinksPackage||'None / not recorded')}</div>`;
    if(dc.bespoke)return `<div class="box tint"><h3>Bespoke Welcome & Toast Drinks</h3><table><thead><tr><th>Occasion</th><th>Drink</th><th>Qty</th><th>Notes</th></tr></thead><tbody>${[...(q.welcomeRows||[]).map(x=>['Welcome',x.drink,x.quantity,x.notes]),...(q.toastRows||[]).map(x=>['Toast',x.drink,x.quantity,x.notes])].map(x=>`<tr><td>${x[0]}</td><td><strong>${escv(x[1])}</strong></td><td class="num">${Number(x[2]||0)}</td><td>${escv(x[3]||'')}</td></tr>`).join('')}</tbody></table><div class="grid3" style="margin-top:2mm"><div class="box"><strong>${q.welcomeFlutes}</strong><div class="small">Welcome flutes</div></div><div class="box"><strong>${q.toastFlutes}</strong><div class="small">Toast flutes</div></div><div class="box"><strong>${q.totalFluteServices}</strong><div class="small">Total flute services</div></div></div></div>`;
    return `<div class="box tint"><h3>${escv(dc.packageName)} Drinks Package</h3><table><tbody><tr><td>Adults / children</td><td class="num">${dc.adults} / ${dc.children}</td></tr><tr><td>Welcome ${escv(q.welcomeAlcoholName)}</td><td>${q.welcomeAlcoholBottles} bottles · ${q.welcomeAlcoholGlasses} alcohol / ${q.welcomeSoftGuests} OJ-soft</td></tr><tr><td>Toast ${escv(q.toastAlcoholName)}</td><td>${q.toastAlcoholBottles} bottles · ${q.toastAlcoholGlasses} alcohol / ${q.toastSoftGuests} OJ-soft</td></tr><tr><td>Flutes</td><td><strong>${q.totalFluteServices}</strong> services · ${q.welcomeFlutes} welcome + ${q.toastFlutes} toast</td></tr><tr><td>${escv(q.beerName)}</td><td>${q.beerBottles} bottles</td></tr><tr><td>Wine</td><td>${q.whiteWineBottles} white · ${q.redWineBottles} red · ${q.roseWineBottles} rosé bottles</td></tr><tr><td>Meal soft</td><td>${q.mealSoftGuests}</td></tr></tbody></table>${dc.children?`<div class="note small"><strong>Children:</strong> ${escv(r.childDrinkNotes||'Notes missing')}</div>`:''}${dc.issues?.length?`<div class="allergy-banner"><strong>DRINKS CHECK</strong><div>${dc.issues.map(escv).join('<br>')}</div></div>`:''}</div>`;
  }

  function commercialBlock(c){
    const lines=c.quoteLines.length?c.quoteLines:[{name:c.quote?.packageName||c.w.package||'Wedding',quantity:1,total:c.total}];
    return `<div class="commercial"><h3 style="color:#fff">Till / Commercial Breakdown</h3><table><thead><tr><th>Item</th><th>Qty</th><th>Value</th></tr></thead><tbody>${lines.map(x=>`<tr><td><strong>${escv(x.name||x.type||'Item')}</strong></td><td>${Number(x.quantity||1)}</td><td class="num">${money(x.total??(Number(x.quantity||1)*Number(x.unitPrice||0)))}</td></tr>`).join('')}</tbody></table><table style="margin-top:2mm"><tbody><tr><td>Quote total</td><td class="num">${money(c.total)}</td></tr><tr><td>Paid</td><td class="num">${money(c.paid)}</td></tr><tr><td>Balance</td><td class="num"><strong>${money(c.balance)}</strong></td></tr></tbody></table>${c.quote?.notes?`<div class="note small">${escv(c.quote.notes)}</div>`:''}</div>`;
  }
  function paymentTable(c){
    if(!c.payments.length)return `<div class="box muted">No payment ledger entries.</div>`;
    return `<table><thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Paid / Due</th><th>Reference</th></tr></thead><tbody>${c.payments.map(x=>`<tr><td>${escv(x.type)}</td><td class="num">${money(x.amount)}</td><td>${escv(x.status)}</td><td>${escv(x.paidDate||x.dueDate||'')}</td><td>${escv(x.reference||'')}</td></tr>`).join('')}</tbody></table>`;
  }
  function prepTable(c,department=''){
    const rows=(c.prep?.rows||[]).filter(x=>!department||x.department===department);
    return rows.length?`<table><thead><tr><th>Department</th><th>Prep / Equipment</th><th>Qty</th><th>Notes</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${escv(x.department)}</td><td><strong>${escv(x.item)}</strong></td><td>${escv(x.quantity)}</td><td>${escv(x.notes||'')}</td></tr>`).join('')}</tbody></table>`:'<div class="box muted">No prep rows calculated.</div>';
  }

  function tablePlan(c){
    if(!c.tables.length)return `<div class="box">No seating plan entered.</div>`;
    return `<div class="grid2">${c.tables.map(t=>{
      const gs=typeof guestsAtTable==='function'?guestsAtTable(t.id):c.guests.filter(g=>g.tableId===t.id);
      return `<div class="box"><h3>${escv(t.tableName)} · ${gs.length}/${Number(t.capacity||0)}</h3><table><tbody>${gs.sort((a,b)=>String(a.guestName).localeCompare(String(b.guestName))).map(g=>`<tr><td><strong>${escv(g.guestName)}</strong>${g.dietaryRequirements?`<br><span class="danger">${escv(g.dietaryRequirements)}</span>`:''}${g.accessibilityNotes?`<br><span class="small">${escv(g.accessibilityNotes)}</span>`:''}</td><td>${escv([g.starterChoice,g.mainChoice,g.dessertChoice].filter(Boolean).join(' / '))}</td></tr>`).join('')}</tbody></table></div>`;
    }).join('')}</div>`;
  }

  function full(c){
    const p1=`${stats(c)}${window.WeddingFinalisation?.issueStamp?WeddingFinalisation.issueStamp(c.w):''}<div class="grid2"><div class="box tint"><h3>Event Control</h3><table><tbody><tr><td>Wedding format</td><td><strong>${escv(typeof WEDDING_FORMATS!=='undefined'?WEDDING_FORMATS[c.profile.weddingFormat]?.label||c.profile.weddingFormat:'Wedding')}</strong></td></tr><tr><td>Approved by</td><td>${escv(c.sheet?.approvedBy||'Not set')}</td></tr><tr><td>Emergency contact</td><td>${escv(c.sheet?.emergencyContact||'Not set')}</td></tr><tr><td>Guest records / tables</td><td>${c.guests.length} / ${c.tables.length}</td></tr></tbody></table></div><div class="box"><h3>Master Day Timings</h3>${keyTimings(c)}</div></div><h2>Ceremony / Reception Format</h2><div class="grid2"><div class="box">${ceremonySummary(c)}</div>${drinksBlock(c)}</div><h2>Food Plan</h2><div class="grid3">${choiceTable('Starters',c.starters)}${choiceTable('Mains',c.mains)}${choiceTable('Desserts',c.desserts)}</div><h3 style="margin-top:3mm">Evening Food</h3>${eveningServices(c)}`;
    const p2=`<h2>Full Running Order</h2>${timeline(c,false)}<h2>Planning Detail</h2>${planningBlocks(c)}<h2>Operational Notes</h2><div class="box note">${escv(window.WeddingFinalisation?.visibleOperationalNotes?(WeddingFinalisation.visibleOperationalNotes(c.sheet)||'No operational notes added.'):(c.sheet?.operationalNotes||'No operational notes added.'))}</div>`;
    const p3=`<h2>Dietary / Allergy / Accessibility</h2>${dietaryTable(c,true)}<h2>Table Plan & Guest Service Detail</h2>${tablePlan(c)}`;
    const p4=`<h2>Commercial / Till Information</h2>${commercialBlock(c)}<h2>Payment Ledger</h2>${paymentTable(c)}<h2>Prep & Equipment</h2>${c.prep?.warnings?.length?`<div class="allergy-banner"><strong>PREP CHECKS REQUIRED</strong><div>${c.prep.warnings.map(escv).join('<br>')}</div></div>`:''}${prepTable(c)}<h2>Outstanding Operational Tasks</h2>${c.tasks.length?`<table><thead><tr><th>Task</th><th>Category</th><th>Due</th><th>Owner</th></tr></thead><tbody>${c.tasks.map(t=>`<tr><td>${escv(t.title)}</td><td>${escv(t.category||'')}</td><td>${escv(t.dueDate||'')}</td><td>${escv(t.assignedTo||t.assignee||'')}</td></tr>`).join('')}</tbody></table>`:'<div class="box"><strong>All applicable tasks complete.</strong></div>'}`;
    return page(c,'FULL FUNCTION SHEET',p1,'Full Function Sheet','1')+page(c,'FULL FUNCTION SHEET · RUNNING ORDER & PLANNING',p2,'Full Function Sheet','2')+page(c,'FULL FUNCTION SHEET · GUEST SERVICE',p3,'Full Function Sheet','3')+page(c,'FULL FUNCTION SHEET · COMMERCIAL & PREP',p4,'Full Function Sheet','4');
  }

  function kitchen(c){
    const p1=`${stats(c)}${window.WeddingFinalisation?.issueStamp?WeddingFinalisation.issueStamp(c.w):''}<div class="grid2"><div class="box tint"><h3>Service Control</h3><table><tbody><tr><td>Wedding breakfast</td><td class="time">${escv(fmtTime(c.reception.weddingBreakfastTime))}</td></tr><tr><td>Evening food</td><td class="time">${escv(fmtTime(c.reception.eveningFoodTime))}</td></tr><tr><td>Day covers</td><td class="num">${Number(c.w.dayGuests||0)}</td></tr><tr><td>Evening covers</td><td class="num">${Number(c.w.eveningGuests||0)}</td></tr></tbody></table></div><div class="box"><h3>Menu Control</h3><table><tbody><tr><td>Menu</td><td><strong>${escv(c.reception.weddingBreakfastMenu||c.quoteMeta.menu||'Not selected')}</strong></td></tr><tr><td>Service</td><td>${escv(c.reception.mealService||'Not set')}</td></tr><tr><td>Notes</td><td>${escv(c.reception.menuNotes||'—')}</td></tr></tbody></table></div></div><h2>Wedding Breakfast Counts</h2><div class="grid3">${choiceTable('Starters',c.starters)}${choiceTable('Mains',c.mains)}${choiceTable('Desserts',c.desserts)}</div><h2>Evening Food Services</h2>${eveningServices(c)}<h2>Dietary / Allergy Matrix</h2>${dietaryTable(c,true)}`;
    const p2=`<h2>Table-by-Table Food Service</h2>${tablePlan(c)}<h2>Kitchen Prep / Equipment</h2>${prepTable(c,'Restaurant')}${prepTable(c,'Evening Food')}<h2>Kitchen Operational Notes</h2><div class="box note">${escv(window.WeddingFinalisation?.visibleOperationalNotes?(WeddingFinalisation.visibleOperationalNotes(c.sheet)||'No additional operational notes.'):(c.sheet?.operationalNotes||'No additional operational notes.'))}</div>`;
    return page(c,'KITCHEN COPY',p1,'Kitchen Copy','1')+page(c,'KITCHEN COPY · SERVICE DETAIL',p2,'Kitchen Copy','2');
  }

  function bar(c){
    const p1=`${stats(c)}${window.WeddingFinalisation?.issueStamp?WeddingFinalisation.issueStamp(c.w):''}<div class="grid2">${drinksBlock(c)}<div class="box"><h3>Key Bar Timings</h3>${keyTimings(c)}</div></div><h2>Running Order</h2>${timeline(c,true)}<h2>Bar Prep / Glassware</h2>${prepTable(c,'Bar')}<h2>Music / Celebration Cues</h2><div class="grid2"><div class="box"><h3>DJ / Music</h3><div class="note">${escv([c.suppliers.dj&&`DJ: ${c.suppliers.dj}`,c.music.djSetupTime&&`Setup: ${fmtTime(c.music.djSetupTime)}`,c.music.djStart&&`Start: ${fmtTime(c.music.djStart)}`,c.music.djFinish&&`Finish: ${fmtTime(c.music.djFinish)}`,c.music.receptionEntranceSong&&`Entrance: ${c.music.receptionEntranceSong}`,c.music.cakeCutSong&&`Cake: ${c.music.cakeCutSong}`,c.music.firstDanceSong&&`First dance: ${c.music.firstDanceSong}`].filter(Boolean).join('\n')||'No music details recorded.')}</div></div><div class="box"><h3>Bar / Operational Notes</h3><div class="note">${escv(window.WeddingFinalisation?.visibleOperationalNotes?(WeddingFinalisation.visibleOperationalNotes(c.sheet)||'No operational notes added.'):(c.sheet?.operationalNotes||'No operational notes added.'))}</div></div></div><h2>Dietary / Accessibility Awareness</h2><div class="box">${c.dietary.length?`${c.dietary.length} guests have dietary/allergy/accessibility notes. Check coordinator/kitchen information before any food-related service.`:'No dietary/accessibility notes recorded.'}</div>`;
    return page(c,'BAR COPY',p1,'Bar Copy','1');
  }

  function coordinator(c){
    const p1=`${stats(c)}${window.WeddingFinalisation?.issueStamp?WeddingFinalisation.issueStamp(c.w):''}<div class="grid2"><div class="box tint"><h3>Master Day Timings</h3>${keyTimings(c)}</div><div class="box"><h3>Contacts / Control</h3><table><tbody><tr><td>Coordinator</td><td><strong>${escv(c.w.coordinator||'Unassigned')}</strong></td></tr><tr><td>Emergency contact</td><td><strong>${escv(c.sheet?.emergencyContact||'Not set')}</strong></td></tr><tr><td>Approved by</td><td>${escv(c.sheet?.approvedBy||'Not set')}</td></tr></tbody></table></div></div><h2>Ceremony / Reception</h2><div class="grid2"><div class="box">${ceremonySummary(c)}</div>${drinksBlock(c)}</div><h2>Running Order</h2>${timeline(c,false)}`;
    const p2=`<h2>Suppliers, Music, Décor, Layout & Accommodation</h2>${planningBlocks(c)}<h2>Dietary / Accessibility</h2>${dietaryTable(c,false)}<h2>Outstanding Tasks</h2>${c.tasks.length?`<table><thead><tr><th>Task</th><th>Due</th><th>Owner</th></tr></thead><tbody>${c.tasks.map(t=>`<tr><td>${escv(t.title)}</td><td>${escv(t.dueDate||'')}</td><td>${escv(t.assignedTo||t.assignee||'')}</td></tr>`).join('')}</tbody></table>`:'<div class="box"><strong>All applicable tasks complete.</strong></div>'}<h2>Coordinator Notes</h2><div class="box note">${escv(window.WeddingFinalisation?.visibleOperationalNotes?(WeddingFinalisation.visibleOperationalNotes(c.sheet)||'No operational notes added.'):(c.sheet?.operationalNotes||'No operational notes added.'))}</div>`;
    return page(c,'COORDINATOR COPY',p1,'Coordinator Copy','1')+page(c,'COORDINATOR COPY · DETAIL',p2,'Coordinator Copy','2');
  }

  function build(weddingId,copyType='full'){
    const c=ctx(weddingId);if(!c)return '<!doctype html><html><body>Wedding not found.</body></html>';
    const title={full:'Full Function Sheet',kitchen:'Kitchen Copy',bar:'Bar Copy',coordinator:'Coordinator Copy'}[copyType]||'Full Function Sheet';
    const body=copyType==='kitchen'?kitchen(c):copyType==='bar'?bar(c):copyType==='coordinator'?coordinator(c):full(c);
    return `<!doctype html><html><head><meta charset="utf-8"><title>${escv(c.w.couple)} · ${title}</title><style>${baseCss()}</style></head><body><div class="doc">${body}</div></body></html>`;
  }

  window.WeddingInternalDocumentEngine={build,ctx};
})();
