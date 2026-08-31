// ============================================================================
// ENQUIRIES REVAMP — PHASE 5
// PROPOSALS, VERSION CONTROL & CONVERSION
// Premium pre-booking proposals + auditable proposal versions + conversion
// handoff helpers. No new Supabase schema.
// ============================================================================
(function(){
 const TYPE='__ENQUIRY_PROPOSAL_STATE_V5__';
 const e=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
 const money=v=>`£${Number(v||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
 const visibleType=t=>!String(t||'').startsWith('__ENQUIRY_')&&!String(t||'').startsWith('__WEDDING_');

 function state(enquiry){
   const entry=[...(enquiry?.comms||[])].reverse().find(x=>x&&x.type===TYPE);
   const d=entry?.data&&typeof entry.data==='object'?entry.data:{};
   return {versions:Array.isArray(d.versions)?d.versions:[],lastGeneratedAt:d.lastGeneratedAt||'',lastSentAt:d.lastSentAt||''};
 }
 function nextVersion(enquiry){const vs=state(enquiry).versions;return vs.length?Math.max(...vs.map(x=>Number(x.version||0)))+1:1;}
 function eventBrief(enquiry){return window.EnquiryEventBrief?.data?EnquiryEventBrief.data(enquiry):{};}
 function rowsForBrief(enquiry){
   const key=window.EnquiryEventBrief?.keyFor?EnquiryEventBrief.keyFor(enquiry):'general';
   const cfg=window.EnquiryEventBrief?.configs?.[key];
   const d=eventBrief(enquiry);
   if(!cfg)return [];
   return cfg.fields.filter(([name,type])=>!['textarea'].includes(type)&&String(d[name]??'').trim()).map(([name,,label])=>[label,d[name]]);
 }
 function narrative(enquiry){
   const key=window.EnquiryEventBrief?.keyFor?EnquiryEventBrief.keyFor(enquiry):'general';
   const d=eventBrief(enquiry);
   if(key==='wake')return 'A calm, private and flexible setting for family and friends to come together after the service.';
   if(key==='corporate')return d.repeatPotential&&d.repeatPotential!=='One-off'?'A professional event solution designed around both this booking and the potential for an ongoing venue partnership.':'A professional, flexible event setup built around your delegates, timings and meeting requirements.';
   if(key==='christmas')return 'A festive event built around your group, hospitality requirements and the atmosphere you want to create.';
   if(key==='party')return 'A relaxed celebration shaped around your guest numbers, food, entertainment and the way you want the event to feel.';
   return 'A flexible event proposal shaped around the details discussed with our team.';
 }
 function proposalHtml(enquiry,version){
   const key=window.EnquiryEventBrief?.keyFor?EnquiryEventBrief.keyFor(enquiry):'general';
   const cfg=window.EnquiryEventBrief?.configs?.[key];
   const d=eventBrief(enquiry),details=rowsForBrief(enquiry);
   const notes=[d.notes,d.theme,d.dietary].filter(Boolean).join('\n');
   const value=Number(enquiry.value||0);
   return `<!doctype html><html><head><meta charset="utf-8"><title>${e(enquiry.name)} · Event Proposal V${version}</title><style>
   *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#252b25;background:#eee;-webkit-print-color-adjust:exact;print-color-adjust:exact}.doc{width:210mm;margin:auto;background:#fff}.page{min-height:297mm;padding:18mm 17mm;position:relative;background:#fff}.brand{font-size:9pt;font-weight:800;letter-spacing:.13em;color:#667b58}.hero{background:#253029;color:#fff;padding:16mm;border-radius:5mm;margin-top:7mm}.hero small{font-size:9pt;letter-spacing:.12em;color:#c9d4c5}.hero h1{font-size:28pt;margin:4mm 0 2mm}.hero p{font-size:12pt;line-height:1.55;color:#e5ebe3;max-width:145mm}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:5mm}.meta div{border:1px solid #dfe4dc;background:#f7f8f4;padding:4mm}.meta small{display:block;color:#788176;font-size:8pt;text-transform:uppercase;letter-spacing:.06em}.meta strong{display:block;font-size:12pt;margin-top:1.5mm}.section{margin-top:8mm}.section h2{font-size:16pt;border-bottom:2px solid #687e5b;padding-bottom:2mm;margin:0 0 4mm}.grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.detail{border:1px solid #e0e4de;border-radius:2mm;padding:3mm}.detail small{display:block;font-size:8pt;color:#7c847d}.detail strong{display:block;margin-top:1mm}.investment{background:#f2eee4;border-left:5px solid #b49a5a;padding:6mm;margin-top:7mm}.investment small{display:block;font-size:9pt;color:#766b53;text-transform:uppercase;letter-spacing:.08em}.investment strong{display:block;font-size:27pt;margin-top:2mm}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.step{border:1px solid #e0e4de;padding:4mm}.step b{color:#657957}.step p{font-size:9pt;line-height:1.45;color:#667067}.note{white-space:pre-wrap;border:1px solid #e1e5df;background:#fafbf9;padding:4mm;font-size:9.5pt;line-height:1.5}.footer{position:absolute;bottom:8mm;left:17mm;right:17mm;border-top:1px solid #ddd;padding-top:2mm;font-size:7.5pt;color:#858c86;display:flex;justify-content:space-between}@media print{body{background:#fff}.doc{margin:0}}
   </style></head><body><div class="doc"><section class="page">
   <div class="brand">THE GRANARY AT WINDMILL FARM · LINCOLN</div>
   <div class="hero"><small>${e((cfg?.title||'EVENT PROPOSAL').toUpperCase())}</small><h1>${e(enquiry.name)}</h1><p>${e(narrative(enquiry))}</p></div>
   <div class="meta"><div><small>Preferred date</small><strong>${enquiry.preferredDate?new Date(enquiry.preferredDate+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'To be confirmed'}</strong></div><div><small>Guests</small><strong>${Number(enquiry.guests||0)||'TBC'}</strong></div><div><small>Proposal</small><strong>Version ${version}</strong></div></div>
   <div class="section"><h2>Your Event</h2><div class="grid">${details.length?details.map(([l,v])=>`<div class="detail"><small>${e(l)}</small><strong>${e(v)}</strong></div>`).join(''):`<div class="detail"><small>Event</small><strong>${e(enquiry.eventType||'Event')}</strong></div>`}</div></div>
   ${notes?`<div class="section"><h2>What We Discussed</h2><div class="note">${e(notes)}</div></div>`:''}
   <div class="investment"><small>Indicative investment</small><strong>${value?money(value):'To be confirmed'}</strong><p style="font-size:9pt;margin:2mm 0 0;color:#746c5a">This proposal reflects the information currently discussed and may change if guest numbers, timings, catering or requirements change.</p></div>
   <div class="section"><h2>What Happens Next</h2><div class="steps"><div class="step"><b>01 · Refine</b><p>We can adjust the event details, package and timings around your plans.</p></div><div class="step"><b>02 · Hold</b><p>If you would like to proceed, speak to the team about availability and a provisional date hold.</p></div><div class="step"><b>03 · Confirm</b><p>Once the booking requirements are completed, your event moves into our confirmed planning system.</p></div></div></div>
   <div class="footer"><span>The Granary at Windmill Farm · Customer Proposal</span><span>Version ${version}</span></div>
   </section></div></body></html>`;
 }
 function openDoc(title,html){
   const w=window.open('','_blank');
   if(!w){toast('Pop-up blocked — allow pop-ups to print proposals','error');return;}
   w.document.open();w.document.write(html);w.document.close();w.document.title=title;setTimeout(()=>w.print(),350);
 }
 async function record(enquiry,version,sent=false){
   const current=state(enquiry),versions=[...current.versions,{version,generatedAt:new Date().toISOString(),sentAt:sent?new Date().toISOString():'',value:Number(enquiry.value||0),status:enquiry.status}];
   const data={versions:versions.slice(-50),lastGeneratedAt:new Date().toISOString(),lastSentAt:sent?new Date().toISOString():current.lastSentAt};
   const communications=(enquiry.comms||[]).filter(x=>x&&x.type!==TYPE);
   communications.push({date:new Date().toISOString(),type:TYPE,data});
   if(sent)communications.push({date:new Date().toISOString(),type:'Proposal sent',note:`Proposal Version ${version} · ${money(enquiry.value||0)}`});
   const updates={communications};
   if(sent){
     updates.status='Quote Sent';updates.last_contact=typeof todayStr!=='undefined'?todayStr:new Date().toISOString().slice(0,10);
     updates.next_action='Follow up proposal';updates.next_followup=typeof addDaysToDate==='function'?addDaysToDate(updates.last_contact,3):'';
     updates.followup_stage='proposal_sent';updates.contact_attempts=Number(enquiry.contactAttempts||0)+1;
   }
   const {error}=await supabaseClient.from('enquiries').update(updates).eq('id',enquiry.id);
   if(error){console.error(error);toast('Proposal history could not be saved','error');return false;}
   await loadEnquiriesFromSupabase();return true;
 }
 async function generate(id,{sent=false}={}){
   const enquiry=DB.enquiries.find(x=>x.id===id);if(!enquiry)return;
   if(/wedding/i.test(enquiry.eventType||'')){
     if(sent){
       const v=nextVersion(enquiry);await record(enquiry,v,true);
       if(typeof printEnquiryWeddingProposal==='function')printEnquiryWeddingProposal(id);
       toast(`Wedding proposal Version ${v} logged as sent`);
     }else{
       const v=nextVersion(enquiry);await record(enquiry,v,false);
       if(typeof printEnquiryWeddingProposal==='function')printEnquiryWeddingProposal(id);
     }
     return;
   }
   const v=nextVersion(enquiry);
   if(!await record(enquiry,v,sent))return;
   openDoc(`${enquiry.name} · Event Proposal V${v}`,proposalHtml(enquiry,v));
   if(sent)toast(`Proposal Version ${v} generated and logged as sent`);
 }
 function render(enquiry){
   const s=state(enquiry),latest=s.versions.length?[...s.versions].sort((a,b)=>Number(b.version)-Number(a.version))[0]:null;
   return `<section class="eqv2-work-card">
     <div class="eqv2-work-heading"><div><p class="eqv2-eyebrow olive">CUSTOMER PROPOSAL</p><h3>Proposal & conversion control</h3></div><span class="badge bg-olive-100 text-olive-800">${latest?`Version ${latest.version}`:'Not generated'}</span></div>
     <p class="eqv2-work-copy">Generate a customer-facing Granary proposal from the information already held on this enquiry. Logging it as sent moves the enquiry into Quote Sent and schedules the chase automatically.</p>
     <div class="eqp5-proposal-actions"><button onclick="EnquiryProposal.generate('${enquiry.id}')" class="secondary"><i data-lucide="file-text"></i>Generate Preview</button><button onclick="EnquiryProposal.generate('${enquiry.id}',{sent:true})" class="primary"><i data-lucide="send"></i>Generate & Log Sent</button></div>
     ${latest?`<div class="eqp5-history"><div><small>Latest version</small><strong>V${latest.version}</strong></div><div><small>Generated</small><strong>${new Date(latest.generatedAt).toLocaleString('en-GB')}</strong></div><div><small>Value at generation</small><strong>${money(latest.value)}</strong></div><div><small>Sent</small><strong>${latest.sentAt?new Date(latest.sentAt).toLocaleString('en-GB'):'Not logged sent'}</strong></div></div>`:''}
     ${s.versions.length>1?`<details class="eqp5-versions"><summary>View ${s.versions.length} proposal versions</summary>${[...s.versions].reverse().map(v=>`<p><strong>V${v.version}</strong> · ${new Date(v.generatedAt).toLocaleString('en-GB')} · ${money(v.value)}${v.sentAt?' · sent':''}</p>`).join('')}</details>`:''}
   </section>`;
 }
 function conversionSummary(enquiry){
   const brief=window.EnquiryEventBrief?.data?EnquiryEventBrief.data(enquiry):{};
   const wedding=/wedding/i.test(enquiry.eventType||'');
   const destination=wedding?'Weddings':'Functions';
   const items=[
     ['Customer',enquiry.name],['Event',enquiry.eventType||'Other'],['Date',enquiry.preferredDate||'TBC'],
     ['Guests',Number(enquiry.guests||0)],['Value',money(enquiry.value||0)],['Owner',enquiry.staff||'Unassigned']
   ];
   if(!wedding&&brief.startTime)items.push(['Start',brief.startTime]);
   if(!wedding&&brief.finishTime)items.push(['Finish',brief.finishTime]);
   return {destination,items,brief};
 }
 window.EnquiryProposal={TYPE,state,nextVersion,generate,render,conversionSummary};
})();
