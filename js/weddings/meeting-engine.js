// ============================================================================
// PHASE 10 — GUIDED WEDDING MEETINGS
// First, halfway and final meeting workflows. Answers feed the existing
// Wedding Planning data; meeting-only notes/status live in planning:meetings.
// ============================================================================
(function(){
  const e=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
  const clean=v=>String(v??'').trim();

  const MEETINGS={
    first:{
      label:'First Meeting',
      eyebrow:'START THE PLAN',
      intro:'Capture the shape of the day, priorities and early decisions. This meeting should establish direction without forcing final answers too early.',
      sections:['profile','ceremony','reception','decor','music','bedrooms'],
      fields:[
        ['profile','weddingFormat','Wedding format','select'],
        ['profile','ceremonyLocationType','Ceremony location','select'],
        ['ceremony','ceremonyTime','Ceremony time','time'],
        ['reception','arrivalTime','Guest / reception arrival','time'],
        ['reception','mealService','Wedding breakfast service','select'],
        ['reception','weddingBreakfastMenu','Wedding breakfast menu','select'],
        ['reception','drinksPackage','Drinks package','select'],
        ['decor','colourScheme','Colour scheme / style','text'],
        ['decor','chairCovers','Chair covers / sash colour','text'],
        ['music','firstDanceSong','First dance song / idea','text'],
        ['bedrooms','roomsRequired','Approx. rooms required','number']
      ]
    },
    halfway:{
      label:'Halfway Meeting',
      eyebrow:'BUILD THE DETAIL',
      intro:'Turn the early plan into real selections: menus, timings, suppliers, décor, bedrooms and entertainment.',
      sections:['ceremony','reception','suppliers','decor','music','bedrooms'],
      fields:[
        ['ceremony','ceremonyTime','Ceremony time','time'],
        ['ceremony','registrarName','Registrar / celebrant','text'],
        ['reception','weddingBreakfastTime','Wedding breakfast time','time'],
        ['reception','weddingBreakfastMenu','Wedding breakfast menu','select'],
        ['reception','drinksPackage','Drinks package','select'],
        ['reception','speechesTime','Speeches time','time'],
        ['reception','cakeCutTime','Cake cutting time','time'],
        ['reception','firstDanceTime','First dance time','time'],
        ['suppliers','photographer','Photographer','text'],
        ['suppliers','cakeSupplier','Cake supplier','text'],
        ['suppliers','dj','DJ','text'],
        ['decor','centrepieces','Centrepieces','text'],
        ['decor','backdrop','Backdrop / light curtain','text'],
        ['music','firstDanceSong','First dance song','text'],
        ['bedrooms','roomsRequired','Rooms required','number']
      ]
    },
    final:{
      label:'Final Meeting',
      eyebrow:'LOCK THE DAY',
      intro:'Work through the operational details that must be right before the final wedding sheets are issued.',
      sections:['profile','ceremony','reception','suppliers','decor','music','bedrooms'],
      fields:[
        ['ceremony','ceremonyTime','Ceremony time','time'],
        ['ceremony','ceremonyGuests','Ceremony guests','number'],
        ['ceremony','brideEntranceSong','Bride entrance song','text'],
        ['ceremony','exitSong','Ceremony exit song','text'],
        ['reception','arrivalTime','Arrival / reception time','time'],
        ['reception','weddingBreakfastTime','Wedding breakfast time','time'],
        ['reception','weddingBreakfastMenu','Wedding breakfast menu','select'],
        ['reception','drinksPackage','Drinks package','select'],
        ['reception','speechesTime','Speeches time','time'],
        ['reception','cakeCutTime','Cake cutting time','time'],
        ['reception','firstDanceTime','First dance time','time'],
        ['reception','finishTime','Finish time','time'],
        ['suppliers','photographer','Photographer','text'],
        ['suppliers','videographer','Videographer','text'],
        ['suppliers','florist','Florist','text'],
        ['suppliers','cakeSupplier','Cake supplier','text'],
        ['suppliers','dj','DJ','text'],
        ['suppliers','transport','Transport','text'],
        ['decor','colourScheme','Colour scheme','text'],
        ['decor','chairCovers','Chair covers / sash','text'],
        ['decor','centrepieces','Centrepieces','text'],
        ['decor','topTable','Top table décor','text'],
        ['decor','backdrop','Backdrop / light curtain','text'],
        ['music','firstDanceSong','First dance song','text'],
        ['bedrooms','roomsRequired','Rooms required','number'],
        ['bedrooms','nightBeforeRooms','Night-before rooms','number'],
        ['bedrooms','accessibleRooms','Accessible-room requirements','text']
      ]
    }
  };

  function meetingsData(weddingId){
    return typeof planningData==='function'?planningData(weddingId,'meetings'):{};
  }
  function meetingState(weddingId,key){
    const all=meetingsData(weddingId);
    return all[key]&&typeof all[key]==='object'?all[key]:{};
  }
  function profile(wedding){return typeof weddingProfile==='function'?weddingProfile(wedding):{};}

  function applies(wedding,section,key){
    const p=profile(wedding);
    if(section==='ceremony' && typeof weddingHasOnsiteCeremony==='function' && !weddingHasOnsiteCeremony(wedding)) return false;
    if(section==='bedrooms' && p.accommodationRequired===false)return false;
    if(section==='suppliers' && key==='dj' && p.djRequired===false)return false;
    if(section==='music' && key==='firstDanceSong' && p.djRequired===false)return false;
    if(section==='reception' && ['weddingBreakfastTime','weddingBreakfastMenu'].includes(key) && p.dayMealRequired===false)return false;
    return true;
  }

  function value(wedding,section,key){
    if(section==='profile'){
      const p=profile(wedding);
      return p[key]??'';
    }
    return typeof planningData==='function'?(planningData(wedding.id,section)[key]??''):'';
  }

  function options(section,key){
    if(section==='profile'&&key==='weddingFormat')return Object.entries(typeof WEDDING_FORMATS!=='undefined'?WEDDING_FORMATS:{}).map(([v,x])=>[v,x.label||v]);
    if(section==='profile'&&key==='ceremonyLocationType')return Object.entries(typeof WEDDING_CEREMONY_LOCATIONS!=='undefined'?WEDDING_CEREMONY_LOCATIONS:{}).map(([v,l])=>[v,l]);
    if(section==='reception'&&key==='mealService')return ['Three-course meal','Two-course meal','One-course meal','Buffet / informal food','No day meal'].map(v=>[v,v]);
    if(section==='reception'&&key==='weddingBreakfastMenu')return ['None','Rose Menu','Peony Menu','Orchid Menu','Afternoon Tea Breakfast','Bespoke / Other'].map(v=>[v,v]);
    if(section==='reception'&&key==='drinksPackage')return ['None','Silver','Gold','Platinum'].map(v=>[v,v]);
    return [];
  }

  function field(wedding,meetingKey,[section,key,label,type]){
    if(!applies(wedding,section,key))return '';
    const v=value(wedding,section,key);
    const name=`m_${section}_${key}`;
    if(type==='select'){
      const opts=options(section,key);
      return `<label class="block"><span class="text-xs font-medium text-gray-600">${e(label)}</span><select name="${name}" data-section="${section}" data-key="${key}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select...</option>${opts.map(([ov,ol])=>`<option value="${e(ov)}" ${String(v)===String(ov)?'selected':''}>${e(ol)}</option>`).join('')}</select></label>`;
    }
    if(type==='number')return `<label class="block"><span class="text-xs font-medium text-gray-600">${e(label)}</span><input name="${name}" data-section="${section}" data-key="${key}" type="number" min="0" value="${e(v)}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>`;
    if(type==='time')return `<label class="block"><span class="text-xs font-medium text-gray-600">${e(label)}</span><input name="${name}" data-section="${section}" data-key="${key}" type="time" value="${e(v)}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>`;
    return `<label class="block"><span class="text-xs font-medium text-gray-600">${e(label)}</span><input name="${name}" data-section="${section}" data-key="${key}" value="${e(v)}" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>`;
  }

  function completion(wedding,key){
    const def=MEETINGS[key];
    const relevant=def.fields.filter(f=>applies(wedding,f[0],f[1]));
    const complete=relevant.filter(([s,k])=>clean(value(wedding,s,k))!=='').length;
    return {complete,total:relevant.length,pct:relevant.length?Math.round(complete/relevant.length*100):100};
  }

  function card(wedding,key){
    const def=MEETINGS[key],state=meetingState(wedding.id,key),c=completion(wedding,key);
    const done=!!state.completedAt;
    return `<button onclick="WeddingMeetingEngine.open('${wedding.id}','${key}')" class="text-left rounded-xl border ${done?'border-green-200 bg-green-50/50':'border-olive-100 bg-white'} p-5 hover:shadow-sm transition">
      <div class="flex items-start justify-between gap-3"><div><p class="text-xs font-bold tracking-widest ${done?'text-green-700':'text-olive-600'}">${e(def.eyebrow)}</p><h3 class="font-bold text-lg mt-1">${e(def.label)}</h3></div><span class="text-lg font-bold ${c.pct===100?'text-green-700':'text-olive-700'}">${c.pct}%</span></div>
      <p class="text-sm text-gray-500 mt-2">${done?`Completed ${new Date(state.completedAt).toLocaleDateString('en-GB')}`:`${c.complete}/${c.total} guided answers currently populated`}</p>
      ${state.nextActions?`<p class="text-xs text-gray-500 mt-3 line-clamp-2"><strong>Follow-up:</strong> ${e(state.nextActions)}</p>`:''}
    </button>`;
  }

  function render(wedding){
    const timeline=(DB.weddingTimeline||[]).filter(x=>x.weddingId===wedding.id&&/Meeting/.test(x.title||x.description||'')).slice(-6).reverse();
    return `<div class="space-y-4">
      <section class="rounded-xl bg-charcoal-900 text-white p-6"><p class="text-xs font-bold tracking-widest text-olive-300">GUIDED WEDDING MEETINGS</p><h2 class="text-2xl font-bold mt-1">Keep every planning conversation structured.</h2><p class="text-sm text-gray-300 mt-2 max-w-3xl">Use these modes while sitting with the couple. Answers update the normal Wedding Planning sections, so there is no second set of wedding details to maintain.</p></section>
      <div class="grid md:grid-cols-3 gap-4">${Object.keys(MEETINGS).map(k=>card(wedding,k)).join('')}</div>
      <section class="bg-white border border-olive-100 rounded-xl p-5"><div class="flex justify-between gap-3"><div><h3 class="font-bold">How this works</h3><p class="text-sm text-gray-500 mt-1">Meeting fields are deliberately staged. First Meeting establishes the shape, Halfway builds detail, Final Meeting locks operational information.</p></div><button onclick="setWeddingTab('planning')" class="px-3 py-2 bg-olive-50 text-olive-800 rounded-lg text-sm">Open Full Planning</button></div>
      <div class="grid sm:grid-cols-3 gap-3 mt-4"><div class="rounded-lg bg-cream-50 p-3 text-sm"><strong>First</strong><p class="text-gray-500 mt-1">Shape, style, initial timings, food/drinks direction and bedrooms.</p></div><div class="rounded-lg bg-cream-50 p-3 text-sm"><strong>Halfway</strong><p class="text-gray-500 mt-1">Menus, suppliers, décor, entertainment and concrete timings.</p></div><div class="rounded-lg bg-cream-50 p-3 text-sm"><strong>Final</strong><p class="text-gray-500 mt-1">Operational confirmation before readiness/final issue.</p></div></div></section>
    </div>`;
  }

  function open(weddingId,key){
    const wedding=(DB.weddings||[]).find(x=>x.id===weddingId),def=MEETINGS[key];if(!wedding||!def)return;
    const state=meetingState(weddingId,key),c=completion(wedding,key);
    const relevantFields=def.fields.filter(f=>applies(wedding,f[0],f[1]));
    openModal(`<div class="p-6 max-w-5xl mx-auto">
      <div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">${e(def.eyebrow)}</p><h2 class="text-2xl font-bold mt-1">${e(def.label)} · ${e(wedding.couple)}</h2><p class="text-sm text-gray-500 mt-2 max-w-3xl">${e(def.intro)}</p></div><button onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100"><i data-lucide="x"></i></button></div>
      <div class="mt-5 rounded-xl ${c.pct===100?'bg-green-50 border-green-200':'bg-olive-50 border-olive-200'} border p-4 flex justify-between"><div><strong>${c.complete}/${c.total} guided fields populated</strong><p class="text-xs text-gray-500 mt-1">Blank fields are not automatically wrong — this is a conversation guide, not the final readiness check.</p></div><strong class="text-xl">${c.pct}%</strong></div>
      <form onsubmit="WeddingMeetingEngine.save(event,'${weddingId}','${key}')" class="mt-5 space-y-5">
        <section><h3 class="font-bold">Wedding details</h3><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">${relevantFields.map(f=>field(wedding,key,f)).join('')}</div></section>
        ${key==='final'&&window.WeddingConsumptionRules?.renderReadiness?`<section><h3 class="font-bold mb-3">Current operational readiness</h3>${WeddingConsumptionRules.renderReadiness(wedding)}</section>`:''}
        <section class="grid sm:grid-cols-2 gap-4"><label class="block"><span class="text-xs font-medium text-gray-600">Meeting notes</span><textarea name="meetingNotes" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="What was discussed, couple preferences, concerns, decisions...">${e(state.notes||'')}</textarea></label><label class="block"><span class="text-xs font-medium text-gray-600">Actions / follow-up</span><textarea name="nextActions" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="What do we or the couple need to do next?">${e(state.nextActions||'')}</textarea></label></section>
        <div class="flex flex-wrap justify-between gap-3 border-t pt-4"><div class="text-xs text-gray-500">${state.completedAt?`Previously completed ${new Date(state.completedAt).toLocaleString('en-GB')} by ${e(state.completedBy||'Not recorded')}`:'Not yet marked complete'}</div><div class="flex gap-2"><button type="submit" name="action" value="save" class="px-4 py-2 bg-gray-100 rounded-lg font-medium">Save Progress</button><button type="submit" name="action" value="complete" class="px-4 py-2 bg-olive-600 text-white rounded-lg font-semibold">${state.completedAt?'Update Completed Meeting':'Complete Meeting'}</button></div></div>
      </form>
    </div>`);
    if(window.lucide)lucide.createIcons();
  }

  async function upsertSection(weddingId,section,changes){
    const existing=typeof planningRecord==='function'?planningRecord(weddingId,section):null;
    const current={...(existing?.data||(typeof planningData==='function'?planningData(weddingId,section):{})||{})};
    const data={...current,...changes};
    const payload={wedding_id:weddingId,section,data,updated_at:new Date().toISOString()};
    return existing?supabaseClient.from('wedding_planning').update(payload).eq('id',existing.id):supabaseClient.from('wedding_planning').insert(payload);
  }

  async function save(event,weddingId,key){
    event.preventDefault();
    const wedding=(DB.weddings||[]).find(x=>x.id===weddingId),def=MEETINGS[key];if(!wedding||!def)return;
    const form=new FormData(event.target),sectionChanges={};
    event.target.querySelectorAll('[data-section][data-key]').forEach(el=>{
      const section=el.dataset.section,k=el.dataset.key;
      sectionChanges[section]=sectionChanges[section]||{};
      let v=el.value;
      if(el.type==='number')v=v===''?'':Number(v);
      sectionChanges[section][k]=v;
    });
    for(const [section,changes] of Object.entries(sectionChanges)){
      const result=await upsertSection(weddingId,section,changes);
      if(result.error){console.error(result.error);toast(`${def.label} could not save ${section}`,'error');return;}
    }
    const existingMeetings=typeof planningRecord==='function'?planningRecord(weddingId,'meetings'):null;
    const all={...(existingMeetings?.data||(typeof planningData==='function'?planningData(weddingId,'meetings'):{})||{})};
    const prior=all[key]||{};
    const action=form.get('action');
    all[key]={...prior,notes:form.get('meetingNotes')||'',nextActions:form.get('nextActions')||'',updatedAt:new Date().toISOString()};
    if(action==='complete'){
      all[key].completedAt=new Date().toISOString();
      all[key].completedBy=wedding.coordinator||prior.completedBy||'Not recorded';
    }
    const payload={wedding_id:weddingId,section:'meetings',data:all,updated_at:new Date().toISOString()};
    const result=existingMeetings?await supabaseClient.from('wedding_planning').update(payload).eq('id',existingMeetings.id):await supabaseClient.from('wedding_planning').insert(payload);
    if(result.error){console.error(result.error);toast('Meeting record could not be saved','error');return;}
    if(action==='complete'){
      const taskTitle={first:'Complete first meeting',halfway:'Complete halfway meeting',final:'Complete final meeting'}[key];
      const task=(DB.weddingTasks||[]).find(t=>t.weddingId===weddingId&&String(t.title||'').toLowerCase()===String(taskTitle||'').toLowerCase());
      if(task&&!task.completed){
        const taskResult=await supabaseClient.from('wedding_tasks').update({completed:true,completed_at:new Date().toISOString()}).eq('id',task.id);
        if(taskResult.error)console.warn('Meeting completed but linked Wedding task could not be ticked',taskResult.error);
      }
    }
    if(typeof addWeddingTimelineEntry==='function')await addWeddingTimelineEntry(weddingId,'Planning',`${def.label} ${action==='complete'?'completed':'updated'}`,form.get('nextActions')||'');
    await loadWeddingsFromSupabase();
    closeModal();
    renderWeddingWorkspace();
    toast(`${def.label} ${action==='complete'?'completed':'saved'}`);
  }

  window.WeddingMeetingEngine={MEETINGS,render,open,save,completion};
})();
