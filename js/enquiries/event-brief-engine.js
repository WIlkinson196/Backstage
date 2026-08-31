// ============================================================================
// ENQUIRIES REVAMP — PHASE 2
// INTELLIGENT EVENT BRIEFS
// Event-specific pre-booking qualification without duplicating confirmed-event
// operational planning. Stored in existing communications JSON; no migration.
// ============================================================================
(function(){
 const TYPE='__ENQUIRY_EVENT_BRIEF_V2__';
 const escx=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
 const norm=v=>String(v||'').toLowerCase();

 const configs={
  wake:{
   match:t=>/wake|funeral|celebration of life/.test(norm(t)),
   title:'Wake / Celebration of Life Brief', eyebrow:'WAKE SALES BRIEF', icon:'flower-2',
   intro:'Capture the service timing, expected arrival and hospitality requirements without asking the family unnecessary operational questions.',
   fields:[
    ['serviceTime','time','Service / funeral time'],['arrivalTime','time','Expected arrival at Windmill Farm'],
    ['adults','number','Adults'],['children','number','Children'],
    ['catering','select','Catering interest',['TBC','Finger Buffet','Breakfast Buffet','Afternoon Tea','Other']],
    ['teaCoffee','select','Tea & coffee',['TBC','Required','Not required']],
    ['privateRoom','select','Private room',['Required','TBC','Not required']],
    ['funeralDirector','text','Funeral director / service location'],
    ['dietary','textarea','Dietary / accessibility requirements'],['notes','textarea','Family wishes / useful notes']
   ]
  },
  corporate:{
   match:t=>/corporate|conference|meeting|training|network|business/.test(norm(t)),
   title:'Business Event Brief', eyebrow:'CORPORATE SALES BRIEF', icon:'presentation',
   intro:'Qualify the commercial opportunity: timings, delegates, room setup, AV, catering and whether this could become repeat business.',
   fields:[
    ['company','text','Company / organisation'],['delegates','number','Delegates'],
    ['startTime','time','Start time'],['finishTime','time','Finish time'],
    ['layout','select','Room layout',['TBC','Theatre','Boardroom','U-shape','Cabaret','Classroom','Informal networking']],
    ['av','select','AV requirement',['TBC','Projector / screens','Microphones','Full AV','None']],
    ['catering','select','Catering',['TBC','Tea & coffee','Buffet + tea & coffee','Breakfast + buffet + tea & coffee','Bespoke']],
    ['repeatPotential','select','Repeat potential',['One-off','Monthly','Quarterly','Annual','TBC']],
    ['annualValue','number','Potential annual value (£)'],['notes','textarea','Agenda / speaker / commercial notes']
   ]
  },
  party:{
   match:t=>/birthday|engagement|anniversary|baby shower|christening|party/.test(norm(t))&&!/christmas/.test(norm(t)),
   title:'Celebration Brief', eyebrow:'SOCIAL EVENT SALES BRIEF', icon:'party-popper',
   intro:'Capture the shape of the celebration quickly so the quote and follow-up are relevant from the first conversation.',
   fields:[
    ['occasion','text','Occasion / milestone'],['adults','number','Adults'],['children','number','Children'],
    ['arrivalTime','time','Guest arrival'],['finishTime','time','Expected finish'],
    ['food','select','Food interest',['TBC','Finger Buffet','Hog Roast','BBQ','Curry','Breakfast Rolls','Other']],
    ['dj','select','DJ / entertainment',['TBC','Venue DJ','Own entertainment','No DJ']],
    ['bar','select','Bar requirement',['Private bar','Main bar / TBC','Other']],
    ['accommodation','select','Bedrooms',['Interested','Not required','TBC']],
    ['theme','textarea','Theme / decoration ideas'],['notes','textarea','Entertainment / cake / accessibility / other notes']
   ]
  },
  christmas:{
   match:t=>/christmas|xmas|festive/.test(norm(t)),
   title:'Christmas Event Brief', eyebrow:'CHRISTMAS SALES BRIEF', icon:'gift',
   intro:'Qualify whether this is a private party, public party booking or bespoke festive event and capture the key commercial requirements.',
   fields:[
    ['format','select','Christmas format',['Private Party','Public Party Night','Turkey & Tinsel','Bespoke / TBC']],
    ['company','text','Company / group'],['adults','number','Adults'],['children','number','Children'],
    ['arrivalTime','time','Arrival time'],['finishTime','time','Finish time'],
    ['food','select','Food requirement',['TBC','Three-course meal','Buffet','Other']],
    ['entertainment','select','Entertainment',['Venue entertainment','Own entertainment','TBC']],
    ['welcomeDrink','select','Welcome drink',['Required','Not required','TBC']],
    ['accommodation','select','Bedrooms',['Interested','Not required','TBC']],
    ['notes','textarea','Festive requirements / dietary / other notes']
   ]
  },
  general:{
   match:t=>true,title:'Event Brief',eyebrow:'EVENT SALES BRIEF',icon:'clipboard-list',
   intro:'Capture the useful pre-booking detail needed to qualify and quote this event.',
   fields:[
    ['eventPurpose','text','Event purpose'],['adults','number','Adults'],['children','number','Children'],
    ['arrivalTime','time','Arrival time'],['finishTime','time','Finish time'],
    ['room','select','Room requirement',['Private room','Area / flexible','TBC']],
    ['food','textarea','Food / catering ideas'],['drinks','textarea','Drinks requirements'],
    ['accommodation','select','Bedrooms',['Interested','Not required','TBC']],['notes','textarea','Other requirements']
   ]
  }
 };

 function keyFor(enquiry){
  if(/wedding/i.test(enquiry?.eventType||''))return 'wedding';
  return Object.keys(configs).find(k=>configs[k].match(enquiry?.eventType||''))||'general';
 }
 function data(enquiry){
  const entry=[...(enquiry?.comms||[])].reverse().find(x=>x&&x.type===TYPE);
  return entry?.data&&typeof entry.data==='object'?entry.data:{};
 }
 function completion(enquiry){
  const key=keyFor(enquiry);if(key==='wedding')return {done:0,total:0,pct:0};
  const cfg=configs[key],d=data(enquiry);
  const meaningful=cfg.fields.filter(f=>!['notes','theme','dietary'].includes(f[0]));
  const done=meaningful.filter(([name])=>String(d[name]??'').trim()&&String(d[name])!=='0'&&String(d[name]).toLowerCase()!=='tbc').length;
  return {done,total:meaningful.length,pct:meaningful.length?Math.round(done/meaningful.length*100):100};
 }
 function field([name,type,label,options],d){
  const v=d[name]??'';
  if(type==='select')return `<label><span>${escx(label)}</span><select name="${name}"><option value="">Select…</option>${options.map(o=>`<option ${String(v)===o?'selected':''}>${escx(o)}</option>`).join('')}</select></label>`;
  if(type==='textarea')return `<label class="eqp2-wide"><span>${escx(label)}</span><textarea name="${name}" rows="3">${escx(v)}</textarea></label>`;
  return `<label><span>${escx(label)}</span><input name="${name}" type="${type}" ${type==='number'?'min="0"':''} value="${escx(v)}"></label>`;
 }
 function render(enquiry){
  const key=keyFor(enquiry);if(key==='wedding')return '';
  const cfg=configs[key],d=data(enquiry),c=completion(enquiry);
  return `<section class="eqv2-work-card eqp2-brief">
   <div class="eqv2-work-heading"><div><p class="eqv2-eyebrow olive">${cfg.eyebrow}</p><h3>${cfg.title}</h3></div><div class="eqp2-complete"><strong>${c.pct}%</strong><span>qualified</span></div></div>
   <p class="eqv2-work-copy">${cfg.intro}</p>
   <div class="eqp2-progress"><i style="width:${c.pct}%"></i></div>
   <form onsubmit="EnquiryEventBrief.save(event,'${enquiry.id}')" class="eqp2-form">${cfg.fields.map(f=>field(f,d)).join('')}<div class="eqp2-wide eqp2-actions"><button type="submit" class="eqv2-work-primary">Save ${cfg.title}</button></div></form>
  </section>`;
 }
 async function save(event,id){
  event.preventDefault();const enquiry=DB.enquiries.find(x=>x.id===id);if(!enquiry)return;
  const cfg=configs[keyFor(enquiry)],form=new FormData(event.target),d={};
  cfg.fields.forEach(([name])=>d[name]=form.get(name)||'');
  d.updatedAt=new Date().toISOString();
  const communications=(enquiry.comms||[]).filter(x=>x&&x.type!==TYPE);
  communications.push({date:new Date().toISOString(),type:TYPE,data:d});
  const updates={communications};
  // Keep shared source-of-truth fields in sync so existing Reports remains correct.
  const adults=Number(d.adults||d.delegates||0),children=Number(d.children||0);
  if(adults||children)updates.guests=adults+children;
  if(Number(d.annualValue||0)>0)updates.value=Number(d.annualValue);
  const {error}=await supabaseClient.from('enquiries').update(updates).eq('id',id);
  if(error){console.error(error);toast('Event brief could not be saved','error');return;}
  await loadEnquiriesFromSupabase();viewEnquiry(id);toast(`${cfg.title} saved`);
 }
 window.EnquiryEventBrief={TYPE,keyFor,data,completion,render,save,configs};
})();
