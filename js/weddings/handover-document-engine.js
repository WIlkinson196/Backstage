// ============================================================================
// WEDDING V2 · PHASE 9 — DJ & SUPPLIER HANDOVER DOCUMENTS
// Generated directly from Wedding Planning + Overview + Running Order.
// ============================================================================
(function(){
  const escv=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
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
  const selected=v=>{const s=String(v??'').trim();return s&&!['none','n/a','not required','no'].includes(s.toLowerCase())};

  function context(weddingId){
    const w=(DB.weddings||[]).find(x=>x.id===weddingId);if(!w)return null;
    const plan=section=>typeof planningData==='function'?planningData(weddingId,section)||{}:{};
    return {
      w,
      profile:typeof weddingProfile==='function'?weddingProfile(w):{},
      ceremony:plan('ceremony'),
      reception:plan('reception'),
      music:plan('music'),
      suppliers:plan('suppliers'),
      decor:plan('decor'),
      layout:plan('layout'),
      run:typeof runningOrderFor==='function'?runningOrderFor(weddingId):[]
    };
  }

  function css(){
    return `
    :root{--olive:#52663b;--deep:#262e27;--gold:#b79b52;--cream:#f7f3e8;--line:#dedfd9;--muted:#697068}
    *{box-sizing:border-box}html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:var(--deep);-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{background:#eee}.doc{width:210mm;margin:auto;background:white}.page{width:210mm;min-height:297mm;padding:14mm 16mm 10mm;display:flex;flex-direction:column;page-break-after:always}.page:last-child{page-break-after:auto}
    .top{border-bottom:3px solid var(--olive);padding-bottom:5mm;margin-bottom:6mm;display:flex;justify-content:space-between;gap:12mm}.brand{font-size:7.5pt;letter-spacing:.14em;font-weight:800;color:var(--olive)}h1{font-family:Georgia,'Times New Roman',serif;font-size:25pt;font-weight:normal;margin:1.5mm 0 0}h2{font-family:Georgia,'Times New Roman',serif;font-size:16pt;font-weight:normal;margin:6mm 0 2.5mm;border-bottom:1px solid var(--line);padding-bottom:2mm;break-after:avoid-page}h3{font-size:10pt;margin:0 0 2mm}
    .meta{text-align:right;font-size:8.5pt;line-height:1.5}.hero{background:var(--deep);color:white;border-radius:5px;padding:5mm;margin-bottom:5mm}.hero small{display:block;color:#d7c892;font-weight:800;letter-spacing:.1em;font-size:7pt}.hero strong{display:block;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:18pt;margin-top:1.5mm}
    .facts{display:grid;grid-template-columns:repeat(4,1fr);gap:2.5mm}.fact{border:1px solid var(--line);background:var(--cream);padding:3mm;break-inside:avoid}.fact small{display:block;color:var(--muted);font-size:6.7pt;text-transform:uppercase;letter-spacing:.07em}.fact strong{display:block;margin-top:1mm;font-size:10pt}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.card{border:1px solid var(--line);padding:4mm;break-inside:avoid;page-break-inside:avoid}.card.tint{background:var(--cream)}.card strong.big{font-family:Georgia,'Times New Roman',serif;font-size:15pt;font-weight:normal}
    table{width:100%;border-collapse:collapse;font-size:8.8pt}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}th{text-align:left;background:var(--olive);color:#fff;padding:2mm;font-size:7.2pt;text-transform:uppercase;letter-spacing:.05em}td{padding:1.8mm 2mm;border-bottom:1px solid var(--line);vertical-align:top}td:first-child{color:var(--muted);width:34%}.time{font-weight:800;white-space:nowrap}.note{white-space:pre-wrap;line-height:1.5;overflow-wrap:anywhere}.pill{display:inline-block;background:var(--cream);border:1px solid #e7dfcb;border-radius:20mm;padding:1.4mm 2.5mm;margin:1mm 1mm 0 0;font-size:7.8pt}
    .callout{background:#fff8e7;border-left:4px solid var(--gold);padding:3.5mm;font-size:8.5pt;line-height:1.5;break-inside:avoid}.footer{margin-top:auto;padding-top:3mm;border-top:1px solid var(--line);font-size:6.8pt;color:var(--muted);display:flex;justify-content:space-between;gap:5mm}
    @media print{body{background:white}.doc{width:auto;margin:0}@page{size:A4;margin:0}}
    `;
  }
  function top(c,title){
    return `<div class="top"><div><div class="brand">THE GRANARY AT WINDMILL FARM · SUPPLIER HANDOVER</div><h1>${escv(c.w.couple||'Wedding')}</h1></div><div class="meta"><strong>${escv(fmtDate(c.w.date))}</strong><br>${escv(title)}<br>Coordinator: ${escv(c.w.coordinator||'TBC')}</div></div>`;
  }
  function footer(label){return `<div class="footer"><span>${escv(label)} · Supplier handover</span><span>Generated ${new Date().toLocaleString('en-GB')}</span></div>`}
  function page(c,title,body,label){return `<section class="page">${top(c,title)}<div>${body}</div>${footer(label)}</section>`}

  function importantRunRows(c){
    const wanted=/arrival|ceremony|reception|breakfast|speech|cake|first dance|evening food|finish|dj|band|entertainment/i;
    return c.run.filter(x=>wanted.test(`${x.title} ${x.responsible} ${x.location}`));
  }

  function ceremonyMusicRows(c){
    const x=c.ceremony,rows=[];
    [
      ['Guest arrival 1',x.guestArrivalSong1],['Guest arrival 2',x.guestArrivalSong2],['Guest arrival 3',x.guestArrivalSong3],
      ['Guest arrival 4',x.guestArrivalSong4],['Guest arrival 5',x.guestArrivalSong5],
      ['Bridesmaids entrance',x.bridesmaidsEntranceSong],['Bride entrance',x.brideEntranceSong],
      ['Signing 1',x.signingSong1],['Signing 2',x.signingSong2],['Signing 3',x.signingSong3],['Ceremony exit',x.exitSong]
    ].forEach(([label,value])=>{if(selected(value))rows.push([label,value])});
    return rows;
  }

  function djHandover(c){
    const m=c.music,s=c.suppliers,p=c.profile,r=c.reception;
    const ceremonyRows=ceremonyMusicRows(c);
    const keyRows=[
      ['DJ / Supplier',s.dj||'TBC'],
      ['Setup / access time',fmtTime(m.djSetupTime)],
      ['DJ start time',fmtTime(m.djStart)],
      ['DJ finish time',fmtTime(m.djFinish)],
      ['Reception entrance song',m.receptionEntranceSong||'TBC'],
      ['Cake cutting song',m.cakeCutSong||'TBC'],
      ['First dance',m.firstDanceSong||'TBC'],
      ['Father / daughter dance',m.fatherDaughterSong||'TBC']
    ];
    const prefs=[
      ['Must-play',m.mustPlay],['Do-not-play',m.doNotPlay],['Music style / set preferences',m.musicStyle],
      ['Guest request policy',m.guestRequests],['Live act requirements',m.liveActRequirements],['DJ / music notes',m.musicNotes]
    ].filter(([,v])=>selected(v));
    const moments=importantRunRows(c);

    let p1=`<div class="hero"><small>DJ HANDOVER</small><strong>Everything currently recorded for the music & evening entertainment.</strong></div>
      <div class="facts"><div class="fact"><small>Wedding date</small><strong>${escv(fmtDate(c.w.date))}</strong></div><div class="fact"><small>Day guests</small><strong>${Number(c.w.dayGuests||0)}</strong></div><div class="fact"><small>Evening guests</small><strong>${Number(c.w.eveningGuests||0)}</strong></div><div class="fact"><small>Coordinator</small><strong>${escv(c.w.coordinator||'TBC')}</strong></div></div>
      <h2>DJ setup & key music cues</h2><table><tbody>${keyRows.map(([l,v])=>`<tr><td>${escv(l)}</td><td><strong>${escv(v)}</strong></td></tr>`).join('')}</tbody></table>
      <h2>Music brief</h2>${prefs.length?`<div class="grid2">${prefs.map(([l,v])=>`<div class="card"><h3>${escv(l)}</h3><div class="note">${escv(v)}</div></div>`).join('')}</div>`:'<div class="callout">No additional music preferences have been recorded yet.</div>'}
      <h2>Important day timings</h2>${moments.length?`<table><thead><tr><th>Time</th><th>Event</th><th>Location</th></tr></thead><tbody>${moments.map(x=>`<tr><td class="time">${escv(fmtTime(x.startTime))}</td><td><strong>${escv(x.title)}</strong></td><td>${escv(x.location||'—')}</td></tr>`).join('')}</tbody></table>`:'<div class="callout">No relevant Running Order items are currently recorded.</div>'}`;

    let pages=page(c,'DJ HANDOVER',p1,'DJ Handover');

    if(ceremonyRows.length || selected(c.ceremony.ceremonyNotes) || selected(c.ceremony.ceremonyReadings)){
      const p2=`<div class="hero"><small>CEREMONY MUSIC</small><strong>${p.ceremonyLocationType==='external'?'Reference only — ceremony is away from Windmill Farm.':'Ceremony cues currently recorded in Planning.'}</strong></div>
        ${ceremonyRows.length?`<table><thead><tr><th>Moment</th><th>Track</th></tr></thead><tbody>${ceremonyRows.map(([l,v])=>`<tr><td>${escv(l)}</td><td><strong>${escv(v)}</strong></td></tr>`).join('')}</tbody></table>`:'<div class="callout">No ceremony music tracks recorded.</div>'}
        ${selected(c.ceremony.ceremonyReadings)?`<h2>Readings / speakers</h2><div class="card note">${escv(c.ceremony.ceremonyReadings)}</div>`:''}
        ${selected(c.ceremony.ceremonyNotes)?`<h2>Ceremony notes</h2><div class="card note">${escv(c.ceremony.ceremonyNotes)}</div>`:''}
        <div class="callout" style="margin-top:6mm"><strong>Check before issue:</strong> this handover is generated from the current Wedding Planning record. Any TBC item should be confirmed before sending to the DJ.</div>`;
      pages+=page(c,'DJ HANDOVER · CEREMONY MUSIC',p2,'DJ Handover');
    }
    return pages;
  }

  function supplierRows(c){
    const s=c.suppliers;
    return [
      ['Photographer',s.photographer],['Videographer',s.videographer],['Florist',s.florist],
      ['Cake supplier',s.cakeSupplier],['DJ',s.dj],['Entertainment / band',s.entertainment],['Transport',s.transport]
    ].filter(([,v])=>selected(v));
  }

  function supplierHandover(c){
    const rows=supplierRows(c),run=importantRunRows(c);
    const additional=(c.reception.additionalTimings||[]).filter(x=>x&&(x.label||x.time));
    const p1=`<div class="hero"><small>SUPPLIER HANDOVER</small><strong>One summary of the suppliers and operational timings currently held for this wedding.</strong></div>
      <div class="facts"><div class="fact"><small>Date</small><strong>${escv(fmtDate(c.w.date))}</strong></div><div class="fact"><small>Coordinator</small><strong>${escv(c.w.coordinator||'TBC')}</strong></div><div class="fact"><small>Day guests</small><strong>${Number(c.w.dayGuests||0)}</strong></div><div class="fact"><small>Evening guests</small><strong>${Number(c.w.eveningGuests||0)}</strong></div></div>
      <h2>Supplier register</h2>${rows.length?`<table><thead><tr><th>Supplier type</th><th>Supplier / details</th></tr></thead><tbody>${rows.map(([l,v])=>`<tr><td>${escv(l)}</td><td><strong>${escv(v)}</strong></td></tr>`).join('')}</tbody></table>`:'<div class="callout">No supplier names have been recorded yet.</div>'}
      ${selected(c.suppliers.supplierNotes)?`<h2>Supplier contact details / notes</h2><div class="card note">${escv(c.suppliers.supplierNotes)}</div>`:''}
      <h2>Operational timeline</h2>${run.length?`<table><thead><tr><th>Time</th><th>Event</th><th>Responsible</th><th>Location</th></tr></thead><tbody>${run.map(x=>`<tr><td class="time">${escv(fmtTime(x.startTime))}</td><td><strong>${escv(x.title)}</strong></td><td>${escv(x.responsible||'—')}</td><td>${escv(x.location||'—')}</td></tr>`).join('')}</tbody></table>`:'<div class="callout">No relevant Running Order items recorded.</div>'}
      ${additional.length?`<h2>Additional reception timings</h2><table><tbody>${additional.map(x=>`<tr><td class="time">${escv(fmtTime(x.time))}</td><td><strong>${escv(x.label||'Additional timing')}</strong>${x.notes?`<br>${escv(x.notes)}`:''}</td></tr>`).join('')}</tbody></table>`:''}
      <h2>Venue setup context</h2><div class="grid2"><div class="card"><h3>Décor / styling</h3><div class="note">${escv([c.decor.colourScheme&&`Colours: ${c.decor.colourScheme}`,c.decor.chairCovers&&`Chair covers / sashes: ${c.decor.chairCovers}`,c.decor.centrepieces&&`Centrepieces: ${c.decor.centrepieces}`,c.decor.backdrop&&`Backdrop: ${c.decor.backdrop}`,c.decor.decorNotes].filter(Boolean).join('\n')||'No styling notes recorded.')}</div></div><div class="card"><h3>Room layout</h3><div class="note">${escv([c.layout.tableShape&&`Tables: ${c.layout.tableShape}`,c.layout.topTableStyle&&`Top table: ${c.layout.topTableStyle}`,c.layout.dancefloorPosition&&`Dancefloor: ${c.layout.dancefloorPosition}`,c.layout.cakeTable&&`Cake table: ${c.layout.cakeTable}`,c.layout.layoutNotes].filter(Boolean).join('\n')||'No room-layout notes recorded.')}</div></div></div>
      <div class="callout" style="margin-top:6mm"><strong>Supplier check:</strong> this document reflects the current CRM Planning record only. Confirm access, arrival, power/space requirements and contact numbers before issue where those details are not explicitly recorded.</div>`;
    return page(c,'SUPPLIER HANDOVER',p1,'Supplier Handover');
  }

  function build(weddingId,type='dj'){
    const c=context(weddingId);if(!c)return '<!doctype html><html><body>Wedding not found.</body></html>';
    const label=type==='supplier'?'Supplier Handover':'DJ Handover';
    const body=type==='supplier'?supplierHandover(c):djHandover(c);
    return `<!doctype html><html><head><meta charset="utf-8"><title>${escv(c.w.couple)} · ${label}</title><style>${css()}</style></head><body><main class="doc">${body}</main></body></html>`;
  }

  function print(weddingId,type='dj'){
    const html=build(weddingId,type);
    const win=window.open('','_blank');
    if(!win){if(typeof toast==='function')toast('Allow pop-ups to open the handover document','error');return;}
    win.document.write(html);win.document.close();win.focus();setTimeout(()=>win.print(),250);
  }

  window.WeddingHandoverDocumentEngine={build,print,context};
  window.printWeddingDjHandover=id=>print(id,'dj');
  window.printWeddingSupplierHandover=id=>print(id,'supplier');
})();
