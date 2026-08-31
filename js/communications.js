
// ============================================================================
// WINDMILL FARM — COMMUNICATIONS CENTRE V1
// Shared approved email templates for Enquiries, Functions and Weddings.
// Local CRM storage only: no email is sent automatically.
// ============================================================================

window.WindmillComms = window.WindmillComms || {};
const WindmillComms=window.WindmillComms;
WindmillComms.storageKey='wfcrm_email_templates_v1';
WindmillComms.context=null;
WindmillComms.selectedTemplate='';
WindmillComms.escape=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
WindmillComms.date=v=>{
  if(!v)return 'TBC';
  const d=new Date(String(v).length===10?v+'T12:00:00':v);
  return isNaN(d)?v:d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
};
WindmillComms.defaultTemplates=()=>[
 {id:'enq-initial',category:'Enquiry',name:'Initial enquiry response',purpose:'First response',subject:'Your {{event_type}} enquiry at Windmill Farm — {{event_date}}',body:`Hi {{first_name}},

Thank you for getting in touch with Windmill Farm about your {{event_type_lower}}.

I have your enquiry noted for {{event_date}} for approximately {{guest_count}} guests.

We would be very happy to talk through the options with you and make sure the event works around what you actually need. The useful next step is normally to discuss timings, food and drink, room setup and any accommodation or equipment requirements.

If you would like to arrange a call or visit, just reply with a couple of suitable times and we will get that organised.

Kind regards,

{{coordinator}}
Windmill Farm
01522 686878`},
 {id:'enq-followup',category:'Enquiry',name:'Follow-up — gentle chase',purpose:'Chase',subject:'Following up on your Windmill Farm enquiry',body:`Hi {{first_name}},

I just wanted to follow up on your enquiry for {{event_date}}.

I know plans can take a little while to come together, so there is no pressure — I simply wanted to make sure you had everything you needed from us.

At the moment we have you down for a {{event_type_lower}} for around {{guest_count}} guests.

If you would like me to check availability, talk through pricing or arrange a visit, just let me know and I can take care of it.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'enq-final-chase',category:'Enquiry',name:'Follow-up — final chase',purpose:'Chase',subject:'Are you still looking at Windmill Farm?',body:`Hi {{first_name}},

I wanted to make one final check-in regarding your {{event_type_lower}} enquiry for {{event_date}}.

If you are still considering Windmill Farm, I am very happy to keep the enquiry open and help with the next steps.

If your plans have changed or you have booked elsewhere, that is absolutely fine too — a quick reply would just help us keep our availability accurate.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'enq-viewing',category:'Enquiry',name:'Viewing / appointment confirmation',purpose:'Meeting',subject:'Your appointment at Windmill Farm',body:`Hi {{first_name}},

Just confirming your appointment with us at Windmill Farm.

Event: {{event_type}}
Proposed event date: {{event_date}}
Guests: {{guest_count}}
Your contact: {{coordinator}}

When you arrive, please come into the main reception and ask for {{coordinator}}.

If there is anything specific you would like us to prepare or show you during the visit, reply beforehand and I will make sure we cover it.

We look forward to meeting you.

Kind regards,

{{coordinator}}
Windmill Farm
Whisby Road, Lincoln, LN6 3QZ`},
 {id:'function-provisional',category:'Function',name:'Provisional booking confirmation',purpose:'Booking',subject:'Provisional booking at Windmill Farm — {{event_date}}',body:`Hi {{first_name}},

Thank you for choosing Windmill Farm for your {{event_type_lower}}.

I have provisionally held the following details for you:

Event: {{event_type}}
Date: {{event_date}}
Time: {{event_time}}
Room: {{room}}
Guests / delegates: {{guest_count}}
Package: {{package}}

This is currently provisional, so please let me know as soon as you are ready to confirm.

If any of the details above need changing, simply reply and I will update the booking.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'function-confirmation',category:'Function',name:'Confirmed booking',purpose:'Booking',subject:'Booking confirmed — {{bk_reference}} — Windmill Farm',body:`Hi {{first_name}},

I am pleased to confirm your booking at Windmill Farm.

Booking reference: {{bk_reference}}
Event: {{event_type}}
Date: {{event_date}}
Time: {{event_time}}
Room: {{room}}
Guests / delegates: {{guest_count}}
Package: {{package}}

We will continue to build the final requirements with you as the date approaches.

Please keep {{bk_reference}} as your booking reference and quote it if you contact us about the event.

If anything changes in the meantime, reply to this email and we will update the booking.

Kind regards,

{{coordinator}}
Windmill Farm
01522 686878`},
 {id:'function-meeting-invite',category:'Function',name:'Planning meeting invite',purpose:'Meeting',subject:'Planning meeting — {{client_name}} — Windmill Farm',body:`Hi {{first_name}},

I would like to arrange a planning meeting for your booking at Windmill Farm so we can go through the final arrangements together.

Booking reference: {{bk_reference}}
Event: {{event_type}}
Event date: {{event_date}}
Current room: {{room}}
Guests / delegates: {{guest_count}}

During the meeting we can cover:

• Timings and running order
• Room layout and seating
• Food, refreshments and dietary requirements
• Projector, TVs, microphones and other AV requirements
• Signage, registration and arrival arrangements
• Accommodation, if required
• Any outstanding billing or PO information

Please let me know a suitable date and time and I will get it booked in.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'function-final-details',category:'Function',name:'Final details request',purpose:'Final details',subject:'Final details required — {{bk_reference}}',body:`Hi {{first_name}},

We are now preparing the final operational details for your {{event_type_lower}} on {{event_date}}.

Could you please send through any outstanding information below:

• Final guest / delegate numbers
• Confirmed arrival and finish times
• Room layout
• Catering and refreshment timings
• Dietary requirements and allergens
• Projector / screen / TV requirements
• Microphones, lectern or flipcharts
• Registration table or signage requirements
• Any breakout rooms
• Accommodation requirements
• Final PO or billing instructions

Booking reference: {{bk_reference}}

If something does not apply, you can simply leave it out. Once I have the final information, I will update the function plan for the team.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'function-invoice',category:'Function',name:'Invoice email',purpose:'Finance',subject:'Invoice — {{bk_reference}} — Windmill Farm',body:`Hi {{first_name}},

Please find the invoice for your booking at Windmill Farm.

Booking reference: {{bk_reference}}
Event: {{event_type}}
Event date: {{event_date}}

Please ensure the booking reference is included with any payment or correspondence.

If your accounts team needs any additional information, or if a PO number needs adding or changing, please let me know.

Kind regards,

{{coordinator}}
Windmill Farm
01522 686878`},
 {id:'function-payment',category:'Function',name:'Payment / PO reminder',purpose:'Finance',subject:'Payment information required — {{bk_reference}}',body:`Hi {{first_name}},

I am just checking the payment information for your upcoming booking at Windmill Farm.

Booking reference: {{bk_reference}}
Event date: {{event_date}}

Could you please confirm any outstanding PO number, billing contact or payment information so we can make sure the account is correct before the event?

If this has already been sent, please ignore this message and I will match it to the booking.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'function-thanks',category:'Function',name:'Post-event thank you',purpose:'After event',subject:'Thank you for choosing Windmill Farm',body:`Hi {{first_name}},

Thank you for choosing Windmill Farm for your {{event_type_lower}}.

I hope the event went smoothly and that you and your guests were well looked after.

We really appreciate your business. If there is any feedback you would like to share with us — good or bad — I would genuinely appreciate hearing it.

We would be delighted to welcome you back for a future meeting or event.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'wedding-followup',category:'Wedding',name:'Wedding planning check-in',purpose:'Planning',subject:'Your wedding at Windmill Farm — {{event_date}}',body:`Hi {{first_name}},

I hope you are both well.

I wanted to check in regarding your wedding at Windmill Farm on {{event_date}}.

We currently have:

Package: {{package}}
Day guests: {{day_guests}}
Evening guests: {{evening_guests}}
Coordinator: {{coordinator}}

There is nothing you need to panic about — this is simply a chance to make sure we are working from the latest information.

If guest numbers, timings, suppliers or any of your plans have changed, just send the updates through and we will add them to your wedding file.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'wedding-meeting',category:'Wedding',name:'Wedding planning meeting',purpose:'Meeting',subject:'Wedding planning meeting — Windmill Farm',body:`Hi {{first_name}},

It is time for us to start bringing together the detailed plan for your wedding at Windmill Farm.

Wedding date: {{event_date}}
Package: {{package}}
Current day guests: {{day_guests}}
Current evening guests: {{evening_guests}}

At the meeting we can work through the running order, food and drink, room setup, suppliers, seating, accommodation and anything else that matters to you.

If you already have supplier details, timings, seating information or questions, feel free to send them before the meeting so I can have everything ready.

Please let me know what dates work for you both.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'wedding-final',category:'Wedding',name:'Wedding final details request',purpose:'Final details',subject:'Final wedding details — {{event_date}}',body:`Hi {{first_name}},

Your wedding is getting closer, so we are now bringing together the final information for the operational team.

Could you please check that we have the latest details for:

• Final day and evening guest numbers
• Menu choices and dietary requirements
• Ceremony and reception timings
• Table plan and seating
• Speeches and key moments
• DJ / entertainment
• Cake arrangements
• Decorations and room setup
• Photographer and other suppliers
• Accommodation
• Any accessibility requirements
• Anything unusual that the team needs to know

Wedding date: {{event_date}}

Once everything is in, we can make sure the final function sheet accurately reflects your day.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'wedding-payment',category:'Wedding',name:'Wedding payment reminder',purpose:'Finance',subject:'Wedding payment reminder — {{event_date}}',body:`Hi {{first_name}},

I am getting in touch regarding the payment schedule for your wedding on {{event_date}}.

Please could you check whether there is anything outstanding at your end and let me know if you need a copy of the latest payment breakdown.

If payment has already been made, please ignore this message and we will reconcile it against your booking.

Kind regards,

{{coordinator}}
Windmill Farm`},
 {id:'generic-chase',category:'General',name:'Friendly follow-up',purpose:'Chase',subject:'Following up — Windmill Farm',body:`Hi {{first_name}},

I just wanted to follow up on my previous message and make sure it had reached you.

There is no rush if you are still getting things organised — I simply wanted to make sure you were not waiting on anything from us.

If there is anything you need, just reply and I will help where I can.

Kind regards,

{{coordinator}}
Windmill Farm`}
];

WindmillComms.templates=function(){
  try{
    const saved=JSON.parse(localStorage.getItem(WindmillComms.storageKey)||'null');
    return Array.isArray(saved)&&saved.length?saved:WindmillComms.defaultTemplates();
  }catch(_){return WindmillComms.defaultTemplates();}
};
WindmillComms.saveTemplates=function(list){
  localStorage.setItem(WindmillComms.storageKey,JSON.stringify(list));
};
WindmillComms.resetTemplates=function(){
  if(!confirm('Reset all email templates back to the Windmill defaults?'))return;
  localStorage.removeItem(WindmillComms.storageKey);
  WindmillComms.renderManager();
  if(typeof toast==='function')toast('Email templates reset');
};
WindmillComms.firstName=function(name){
  return String(name||'').trim().split(/\s+/)[0]||'there';
};
WindmillComms.merge=function(text,data){
  return String(text||'').replace(/\{\{([a-z0-9_]+)\}\}/gi,(_,key)=>data[key]??'');
};
WindmillComms.findEnquiry=function(id){return (DB.enquiries||[]).find(x=>x.id===id);};
WindmillComms.contextFromEnquiry=function(id){
  const e=WindmillComms.findEnquiry(id); if(!e)return null;
  return {kind:'Enquiry',id:e.id,title:e.name||'Enquiry',email:e.email||'',data:{
    first_name:WindmillComms.firstName(e.name),client_name:e.name||'',event_type:e.eventType||'Event',
    event_type_lower:String(e.eventType||'event').toLowerCase(),event_date:WindmillComms.date(e.preferredDate),
    guest_count:Number(e.guests||0)||'TBC',coordinator:e.staff||'Windmill Farm Team',
    bk_reference:e.rezlynxReference||'',room:'',event_time:'',package:e.package||'',
    day_guests:'',evening_guests:''
  }};
};
WindmillComms.contextFromFunction=function(id){
  const f=(DB.functions||[]).find(x=>x.id===id); if(!f)return null;
  const e=WindmillComms.findEnquiry(f.enquiryId);
  const email=e?.email||f.planning?.enquirySnapshot?.email||'';
  const name=f.clientName||e?.name||'Customer';
  return {kind:'Function',id:f.id,title:name,email,data:{
    first_name:WindmillComms.firstName(name),client_name:name,event_type:f.eventType||'Function',
    event_type_lower:String(f.eventType||'function').toLowerCase(),event_date:WindmillComms.date(f.eventDate),
    event_time:[f.startTime,f.endTime].filter(Boolean).join(' – ')||'TBC',guest_count:Number(f.guests||0)||'TBC',
    coordinator:f.coordinator||e?.staff||'Windmill Farm Team',bk_reference:f.bookingReference||'',
    room:f.room||'TBC',package:f.packageName||'',day_guests:'',evening_guests:''
  }};
};
WindmillComms.contextFromWedding=function(id){
  const w=(DB.weddings||[]).find(x=>x.id===id); if(!w)return null;
  const e=WindmillComms.findEnquiry(w.enquiryId);
  const name=w.couple||e?.name||'Couple';
  return {kind:'Wedding',id:w.id,title:name,email:e?.email||'',data:{
    first_name:WindmillComms.firstName(name.replace(/\s*&\s*|\s+and\s+/i,' ')),client_name:name,event_type:'Wedding',
    event_type_lower:'wedding',event_date:WindmillComms.date(w.date),event_time:'',guest_count:Number(w.dayGuests||0)||'TBC',
    coordinator:w.coordinator||e?.staff||'Windmill Farm Team',bk_reference:e?.rezlynxReference||'',room:'',
    package:w.package||'',day_guests:Number(w.dayGuests||0)||'TBC',evening_guests:Number(w.eveningGuests||0)||'TBC'
  }};
};
WindmillComms.relevant=function(ctx){
  const templates=WindmillComms.templates();
  return templates.filter(t=>t.category===ctx.kind||t.category==='General');
};
WindmillComms.open=function(kind,id){
  const ctx=kind==='Wedding'?WindmillComms.contextFromWedding(id):kind==='Function'?WindmillComms.contextFromFunction(id):WindmillComms.contextFromEnquiry(id);
  if(!ctx){if(typeof toast==='function')toast('Booking could not be found','error');return;}
  WindmillComms.context=ctx;
  const templates=WindmillComms.relevant(ctx);
  WindmillComms.selectedTemplate=templates[0]?.id||'';
  WindmillComms.renderComposer();
};
WindmillComms.renderComposer=function(){
  const ctx=WindmillComms.context;if(!ctx)return;
  const templates=WindmillComms.relevant(ctx);
  const t=templates.find(x=>x.id===WindmillComms.selectedTemplate)||templates[0];
  const subject=WindmillComms.merge(t?.subject||'',ctx.data);
  const body=WindmillComms.merge(t?.body||'',ctx.data);
  openModal(`<div class="p-0 overflow-hidden">
    <div class="px-6 py-5 bg-gradient-to-r from-[#293b31] to-[#627a46] text-white flex items-start justify-between gap-4">
      <div><p class="text-[11px] font-bold tracking-[.18em] text-[#e4c45f]">COMMUNICATIONS CENTRE</p><h2 class="text-2xl font-bold mt-1">Prepare Email</h2><p class="text-sm text-white/70 mt-1">${WindmillComms.escape(ctx.title)} · ${ctx.kind}</p></div>
      <button onclick="closeModal()" class="p-2 rounded-lg bg-white/10"><i data-lucide="x"></i></button>
    </div>
    <div class="grid lg:grid-cols-[280px_1fr] min-h-[620px]">
      <aside class="border-r bg-[#f7f8f4] p-4">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Approved templates</p>
        <div class="space-y-2">${templates.map(x=>`<button onclick="WindmillComms.selectedTemplate='${x.id}';WindmillComms.renderComposer()" class="w-full text-left p-3 rounded-xl border ${x.id===t?.id?'bg-white border-olive-400 shadow-sm':'bg-transparent border-transparent hover:bg-white'}"><strong class="text-sm block">${WindmillComms.escape(x.name)}</strong><small class="text-gray-500">${WindmillComms.escape(x.category)}</small></button>`).join('')}</div>
        <div class="mt-5 p-3 rounded-xl bg-olive-50 border border-olive-100 text-xs text-olive-800"><strong>Team rule</strong><p class="mt-1">Choose the approved template, then personalise the generated copy. Editing here never changes the master template.</p></div>
      </aside>
      <main class="p-5 lg:p-6">
        <div class="grid sm:grid-cols-2 gap-3 mb-4">
          <label class="text-xs font-medium text-gray-600">To<input id="wc-to" value="${WindmillComms.escape(ctx.email)}" placeholder="customer@email.com" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm"></label>
          <label class="text-xs font-medium text-gray-600">Template<input value="${WindmillComms.escape(t?.name||'')}" readonly class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm bg-gray-50"></label>
        </div>
        <label class="text-xs font-medium text-gray-600 block">Subject<input id="wc-subject" value="${WindmillComms.escape(subject)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-medium"></label>
        <label class="text-xs font-medium text-gray-600 block mt-4">Email<textarea id="wc-body" rows="17" class="mt-1 w-full px-3 py-3 border rounded-xl text-sm leading-6 resize-y">${WindmillComms.escape(body)}</textarea></label>
        <div class="flex flex-wrap justify-between gap-3 mt-4">
          <div class="text-xs text-gray-500">This prepares the message only — it does not send email automatically.</div>
          <div class="flex gap-2"><button onclick="WindmillComms.copySubject()" class="px-3 py-2 border rounded-lg text-sm font-medium">Copy Subject</button><button onclick="WindmillComms.copyEmail()" class="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-semibold"><i data-lucide="copy" class="inline mr-1"></i>Copy Email</button></div>
        </div>
      </main>
    </div>
  </div>`);
  if(window.lucide)lucide.createIcons();
};
WindmillComms.copy=function(value,label){
  navigator.clipboard?.writeText(value).then(()=>typeof toast==='function'&&toast(label+' copied')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();if(typeof toast==='function')toast(label+' copied');
  });
};
WindmillComms.copySubject=function(){WindmillComms.copy(document.getElementById('wc-subject')?.value||'','Subject');};
WindmillComms.copyEmail=function(){
  const to=document.getElementById('wc-to')?.value||'';
  const subject=document.getElementById('wc-subject')?.value||'';
  const body=document.getElementById('wc-body')?.value||'';
  WindmillComms.copy(`To: ${to}\nSubject: ${subject}\n\n${body}`,'Email');
};
WindmillComms.openManager=function(){WindmillComms.renderManager();};
WindmillComms.renderManager=function(){
  const list=WindmillComms.templates();
  openModal(`<div class="p-0 overflow-hidden">
    <div class="px-6 py-5 bg-[#293b31] text-white flex justify-between gap-4"><div><p class="text-[11px] font-bold tracking-[.18em] text-[#e4c45f]">SETTINGS</p><h2 class="text-2xl font-bold mt-1">Email Templates</h2><p class="text-sm text-white/70 mt-1">One approved library for the whole team.</p></div><button onclick="closeModal()" class="p-2"><i data-lucide="x"></i></button></div>
    <div class="p-5 max-h-[72vh] overflow-y-auto">
      <div class="flex justify-between items-center gap-3 mb-4"><p class="text-sm text-gray-600">${list.length} master templates</p><div class="flex gap-2"><button onclick="WindmillComms.resetTemplates()" class="px-3 py-2 border rounded-lg text-sm">Reset Defaults</button><button onclick="WindmillComms.editTemplate('')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm font-semibold">+ New Template</button></div></div>
      <div class="space-y-2">${list.map(t=>`<div class="flex items-center justify-between gap-3 p-4 border rounded-xl"><div><span class="text-[10px] font-bold uppercase tracking-wider text-olive-600">${WindmillComms.escape(t.category)}</span><strong class="block text-sm mt-1">${WindmillComms.escape(t.name)}</strong><small class="text-gray-500">${WindmillComms.escape(t.purpose?`${t.purpose} · ${t.subject}`:t.subject)}</small></div><div class="flex gap-2"><button onclick="WindmillComms.editTemplate('${t.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium">Edit</button><button onclick="WindmillComms.deleteTemplate('${t.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium">Delete</button></div></div>`).join('')}</div>
    </div>
  </div>`);
  if(window.lucide)lucide.createIcons();
};
WindmillComms.editTemplate=function(id){
  const t=WindmillComms.templates().find(x=>x.id===id)||{id:'',category:'General',name:'',subject:'',body:''};
  openModal(`<div class="p-6"><h2 class="text-xl font-bold">${id?'Edit':'New'} Email Template</h2><form onsubmit="WindmillComms.saveTemplate(event,'${id}')" class="space-y-4 mt-5">
    <div class="grid sm:grid-cols-2 gap-3"><label class="text-xs font-medium text-gray-600">Category<select name="category" class="mt-1 w-full px-3 py-2 border rounded-lg">${['Enquiry','Function','Wedding','General'].map(x=>`<option ${t.category===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="text-xs font-medium text-gray-600">Template name<input required name="name" value="${WindmillComms.escape(t.name)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label></div>
    <label class="text-xs font-medium text-gray-600 block">Subject<input required name="subject" value="${WindmillComms.escape(t.subject)}" class="mt-1 w-full px-3 py-2 border rounded-lg"></label>
    <label class="text-xs font-medium text-gray-600 block">Body<textarea required name="body" rows="14" class="mt-1 w-full px-3 py-3 border rounded-lg leading-6">${WindmillComms.escape(t.body)}</textarea></label>
    <div class="p-3 bg-cream-50 rounded-lg text-xs text-gray-600"><strong>Merge fields:</strong> {{first_name}}, {{client_name}}, {{event_type}}, {{event_date}}, {{event_time}}, {{guest_count}}, {{coordinator}}, {{bk_reference}}, {{room}}, {{package}}, {{day_guests}}, {{evening_guests}}</div>
    <div class="flex justify-end gap-2"><button type="button" onclick="WindmillComms.renderManager()" class="px-4 py-2 border rounded-lg">Back</button><button class="px-4 py-2 bg-olive-600 text-white rounded-lg font-semibold">Save Template</button></div>
  </form></div>`);
};
WindmillComms.saveTemplate=function(event,id){
  event.preventDefault();const f=new FormData(event.target),list=WindmillComms.templates();
  const record={id:id||('tmpl-'+Date.now()),category:f.get('category'),name:f.get('name'),subject:f.get('subject'),body:f.get('body')};
  const index=list.findIndex(x=>x.id===id);if(index>=0)list[index]=record;else list.push(record);
  WindmillComms.saveTemplates(list);WindmillComms.renderManager();if(typeof toast==='function')toast('Email template saved');
};
WindmillComms.deleteTemplate=function(id){
  if(!confirm('Delete this email template?'))return;
  WindmillComms.saveTemplates(WindmillComms.templates().filter(x=>x.id!==id));WindmillComms.renderManager();
};


// ===== COMMUNICATIONS CENTRE PAGE ===========================================
WindmillComms.allContexts=function(){
  const items=[];
  (DB.enquiries||[]).forEach(e=>{const c=WindmillComms.contextFromEnquiry(e.id);if(c)items.push(c);});
  (DB.functions||[]).filter(f=>!f.archivedAt).forEach(f=>{const c=WindmillComms.contextFromFunction(f.id);if(c)items.push(c);});
  (DB.weddings||[]).filter(w=>!w.archivedAt).forEach(w=>{const c=WindmillComms.contextFromWedding(w.id);if(c)items.push(c);});
  return items;
};

WindmillComms.renderCentre=function(){
  const mc=document.getElementById('main-content');if(!mc)return;
  const contexts=WindmillComms.allContexts();
  mc.innerHTML=`<div class="space-y-4">
    <section class="rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-5" style="background:linear-gradient(135deg,#293b31,#617846)">
      <div><p class="text-[11px] font-bold tracking-[.18em] text-[#e4c45f]">WINDMILL FARM COMMUNICATIONS</p><h2 class="text-3xl font-bold mt-1">Communications Centre</h2><p class="text-sm text-white/70 mt-2">One approved email library across Enquiries, Functions and Weddings.</p></div>
      <button onclick="WindmillComms.openManager()" class="px-4 py-2.5 bg-white text-gray-800 rounded-lg text-sm font-semibold">Manage Templates</button>
    </section>
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      ${[['Templates',WindmillComms.templates().length],['Enquiries',contexts.filter(x=>x.kind==='Enquiry').length],['Functions',contexts.filter(x=>x.kind==='Function').length],['Weddings',contexts.filter(x=>x.kind==='Wedding').length]].map(([a,b])=>`<div class="bg-white border rounded-xl p-4"><small class="text-gray-500">${a}</small><strong class="block text-2xl mt-1">${b}</strong></div>`).join('')}
    </section>
    <section class="bg-white border rounded-xl overflow-hidden">
      <div class="p-4 border-b"><h3 class="font-bold">Choose a booking</h3><p class="text-xs text-gray-500 mt-1">Open the customer and choose the approved email you need.</p></div>
      ${contexts.length?contexts.map(ctx=>`<div class="px-4 py-3 border-b last:border-0 flex items-center gap-3">
        <span class="w-9 h-9 rounded-lg bg-olive-50 text-olive-700 grid place-items-center"><i data-lucide="${ctx.kind==='Wedding'?'heart':ctx.kind==='Function'?'calendar-range':'inbox'}" style="width:16px"></i></span>
        <div class="min-w-0 flex-1"><strong class="text-sm block truncate">${WindmillComms.escape(ctx.title)}</strong><small class="text-gray-500">${ctx.kind}${ctx.data.event_date?` · ${WindmillComms.escape(ctx.data.event_date)}`:''}${ctx.email?` · ${WindmillComms.escape(ctx.email)}`:''}</small></div>
        <button onclick="WindmillComms.open('${ctx.kind}','${ctx.id}')" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-xs font-semibold">Prepare Email</button>
      </div>`).join(''):'<div class="p-8 text-center text-sm text-gray-500">No bookings available.</div>'}
    </section>
  </div>`;
  if(window.lucide)lucide.createIcons();
};

(function installCommunicationsNav(){
  if(window.__windmillCommsNavInstalled)return;
  window.__windmillCommsNavInstalled=true;
  if(typeof buildNav!=='function'||typeof navigate!=='function'||typeof renderSection!=='function')return;

  const oldBuildNav=buildNav,oldNavigate=navigate,oldRenderSection=renderSection;

  buildNav=function(){
    oldBuildNav();
    const nav=document.getElementById('nav-items');if(!nav)return;
    let btn=document.getElementById('nav-communications');
    if(!btn){
      btn=document.createElement('button');btn.id='nav-communications';btn.onclick=()=>navigate('communications');
      const enq=document.getElementById('nav-enquiries');enq?enq.after(btn):nav.appendChild(btn);
    }
    btn.className=`sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 ${currentSection==='communications'?'active':''}`;
    btn.innerHTML='<i data-lucide="messages-square" style="width:16px;height:16px"></i>Communications';
    if(window.lucide)lucide.createIcons();
  };

  navigate=function(section){
    if(section!=='communications')return oldNavigate(section);
    currentSection='communications';buildNav();
    const h=document.getElementById('page-heading');if(h)h.textContent='Communications';
    WindmillComms.renderCentre();
  };

  renderSection=function(){
    if(currentSection==='communications')return WindmillComms.renderCentre();
    return oldRenderSection.apply(this,arguments);
  };

  buildNav();
})();

WindmillComms.copyMeetingInvite=function(){
  const ctx=WindmillComms.context;if(!ctx)return;
  const subject=document.getElementById('wc-subject')?.value||'';
  const body=document.getElementById('wc-body')?.value||'';
  WindmillComms.copy([
    `TITLE: ${subject}`,
    `ATTENDEE: ${document.getElementById('wc-to')?.value||''}`,
    `DATE / EVENT: ${ctx.data.event_date||''}`,
    `TIME: ${ctx.data.event_time||''}`,
    'LOCATION: Windmill Farm, Whisby Road, Lincoln, LN6 3QZ',
    '',
    body
  ].join('\n'),'Meeting invite');
};
