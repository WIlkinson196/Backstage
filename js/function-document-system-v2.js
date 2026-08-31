// THE GRANARY — Function / Meeting / Conference Proposal
(function(){
  const D={};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=v=>'£'+Number(v||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
  const date=v=>{if(!v)return 'Date to be confirmed';const d=new Date(`${v}T12:00:00`);return Number.isNaN(d)?v:d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})};
  D.model=id=>{
    const fn=(DB.functions||[]).find(x=>x.id===id);if(!fn)return null;
    const q=fn.planning?.quoteBuilder||{},lines=Array.isArray(q.lines)&&q.lines.length?q.lines:(typeof functionQuoteLines==='function'?functionQuoteLines(fn):[]);
    const totals=typeof functionQuoteTotals==='function'?functionQuoteTotals(lines):{gross:Number(fn.quotedValue||0),net:Number(fn.quotedValue||0)/1.2,vat:Number(fn.quotedValue||0)/6};
    return {fn,q,lines,totals,meeting:typeof isMeetingFunction==='function'?isMeetingFunction(fn):/meeting|conference/i.test(fn.eventType||'')};
  };
  D.html=id=>{
    const m=D.model(id);if(!m)return '';
    const f=m.fn,p=f.planning||{},ro=p.runningOrder||{},food=p.food||{},room=p.roomSetup||{},meta=p.planMeta||{};
    const title=m.meeting?'Meeting & Conference Proposal':'Event Proposal';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(f.clientName)} · ${title}</title><style>
      :root{--forest:#273426;--olive:#5f7343;--ivory:#f7f3e8;--line:#dfdacd;--ink:#232721;--muted:#6d726a;--gold:#b69a55}
      *{box-sizing:border-box}body{margin:0;font-family:Arial;color:var(--ink);background:#eee;-webkit-print-color-adjust:exact}.doc{width:210mm;margin:auto;background:white}.page{width:210mm;min-height:297mm;padding:18mm;page-break-after:always;background:#fffdf8;display:flex;flex-direction:column}.page:last-child{page-break-after:auto}
      .cover{background:linear-gradient(145deg,#1f2a20,#48583a);color:white}.brand{font-size:8pt;letter-spacing:.22em;color:#d7c581;font-weight:bold}.cover h1{font:normal 38pt Georgia;margin:auto 0 5mm}.cover p{font:12pt Georgia;line-height:1.55;max-width:130mm;color:#edf0e9}.meta{border-top:1px solid #ffffff44;padding-top:6mm;display:grid;grid-template-columns:1fr 1fr;gap:8mm}
      .head{font-size:7pt;letter-spacing:.2em;color:var(--olive);font-weight:bold}.page h2{font:normal 25pt Georgia;margin:2mm 0 5mm}.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}.fact{border-top:2px solid var(--olive);padding-top:3mm}.fact small{font-size:6.5pt;color:var(--muted);text-transform:uppercase}.fact strong{display:block;font:normal 11pt Georgia;margin-top:1mm}.card{border:1px solid var(--line);padding:4mm;margin-top:4mm;background:white}.card.soft{background:var(--ivory)}table{width:100%;border-collapse:collapse;font-size:8.5pt}th{background:var(--forest);color:white;text-align:left;padding:2mm}td{padding:2mm;border-bottom:1px solid var(--line)}td:last-child{text-align:right}.total{background:var(--forest);color:white;padding:5mm;margin-top:5mm}.total div{display:flex;justify-content:space-between;padding:1mm 0}.grand{font:normal 18pt Georgia;border-top:1px solid #ffffff44;margin-top:2mm;padding-top:3mm!important}.footer{margin-top:auto;border-top:1px solid var(--line);padding-top:3mm;font-size:6.5pt;color:var(--muted)}
      @media print{body{background:white}.doc{width:auto}@page{size:A4;margin:0}}
    </style></head><body><main class="doc">
      <section class="page cover"><div class="brand">THE GRANARY AT WINDMILL FARM</div><h1>${esc(title)}</h1><p>A clear, professional proposal built from the same Function record used by our planning and operations teams.</p><div class="meta"><div><strong>Prepared for</strong><br>${esc(f.clientName)}</div><div><strong>Event date</strong><br>${esc(date(f.eventDate))}</div></div></section>
      <section class="page"><div class="head">YOUR EVENT</div><h2>${esc(f.clientName)}</h2><div class="facts"><div class="fact"><small>Event</small><strong>${esc(f.eventType)}</strong></div><div class="fact"><small>Date</small><strong>${esc(date(f.eventDate))}</strong></div><div class="fact"><small>Guests</small><strong>${Number(f.guests||0)}</strong></div><div class="fact"><small>Room</small><strong>${esc(f.room||'TBC')}</strong></div></div>
        <div class="card soft"><strong>Current plan</strong><p style="font-size:8.5pt;line-height:1.5">${esc([meta.organiser&&`Organiser: ${meta.organiser}`,room.layout&&`Layout: ${room.layout}`,food.catering&&`Catering: ${food.catering}`,ro.start&&`Start: ${ro.start}`,ro.finish&&`Finish: ${ro.finish}`].filter(Boolean).join(' · ')||'Planning details are still being confirmed.')}</p></div>
        ${m.q.customerNotes?`<div class="card"><strong>What we have agreed</strong><p style="font-size:8.5pt;line-height:1.5">${esc(m.q.customerNotes)}</p></div>`:''}<div class="footer">The Granary at Windmill Farm · Event Proposal</div></section>
      <section class="page"><div class="head">YOUR INVESTMENT</div><h2>Quote breakdown</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Price each</th><th>Total</th></tr></thead><tbody>${m.lines.map(x=>`<tr><td>${esc(x.description||x.category)}</td><td>${Number(x.quantity||0)}</td><td>${money(x.unitPrice)}</td><td>${money(Number(x.quantity||0)*Number(x.unitPrice||0))}</td></tr>`).join('')}</tbody></table>
        <div class="total"><div><span>Net</span><strong>${money(m.totals.net)}</strong></div><div><span>VAT @ 20%</span><strong>${money(m.totals.vat)}</strong></div><div class="grand"><span>Customer total</span><strong>${money(m.totals.gross)}</strong></div></div>
        <div class="card soft"><strong>Please check this proposal</strong><p style="font-size:8.5pt;line-height:1.5">If a quantity, price, room, catering item or requirement is not as expected, tell your coordinator so the Function quote can be corrected before confirmation.</p></div><div class="footer">Generated from the current Function Quote Builder · VAT inclusive</div></section>
    </main><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`;
  };
  D.print=id=>{const h=D.html(id);if(!h)return;const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print the proposal','error');return;}w.document.write(h);w.document.close();};
  window.GranaryFunctionDocumentsV2=D;
  window.printFunctionProposalV2=id=>D.print(id);
})();