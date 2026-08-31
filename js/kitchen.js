
// ============================================================================
// WINDMILL FARM KITCHEN V2
// Menu-first weekly production and shopping-list builder.
// Weekly working data is intentionally temporary; recipe corrections persist.
// ============================================================================

window.KitchenApp = window.KitchenApp || {};
Object.assign(KitchenApp, {
  functions: [],
  adjustments: {},
  activeTab: 'builder',
  recipeOverrides: JSON.parse(localStorage.getItem('windmill_kitchen_recipe_overrides') || '{}')
});

KitchenApp.recipes = function() {
  return (window.KITCHEN_SPEC_RECIPES || []).map(recipe => {
    const override = KitchenApp.recipeOverrides[recipe.id];
    return override ? {...recipe, ...override} : recipe;
  });
};

KitchenApp.recipeById = id => KitchenApp.recipes().find(recipe => recipe.id === id);

// Short service labels are deliberately separate from the official specification name.
// Official names remain untouched for overall food totals, specification and ordering.
KitchenApp.defaultChefShortName=function(name){
  let s=String(name||'').trim();
  if(!s)return '';
  const exact={
    'Battered Chicken Strips':'Chicken Strips',
    'Triple-Chocolate Brownie with Clotted Cream Ice Cream':'Brownie',
    'Triple Chocolate Brownie with Clotted Cream Ice Cream':'Brownie',
    'Triple-Chocolate Brownie with Ice Cream':'Brownie',
    'Triple Chocolate Brownie with Ice Cream':'Brownie'
  };
  if(exact[s])return exact[s];

  // Keep dietary variants visible to chefs.
  const prefix=/^(NGC|NGCI)\b/i.test(s)?(s.match(/^(NGC|NGCI)\b/i)[0].toUpperCase()+' '):'';
  s=s.replace(/^(NGC|NGCI)\s+/i,'').replace(/\s*\((?:V|Ve|VE|v)\)\s*/g,' ').trim();

  if(/brownie/i.test(s))return prefix+'Brownie';
  if(/chicken\s+strips/i.test(s))return prefix+'Chicken Strips';
  if(/sirloin.*beef|roast.*beef|beef.*yorkshire/i.test(s))return prefix+'Beef Dinner';
  if(/roast.*chicken|chicken.*dinner/i.test(s))return prefix+'Chicken Dinner';
  if(/pork.*dinner|roast.*pork/i.test(s))return prefix+'Pork Dinner';
  if(/apple.*crumble|crumble/i.test(s))return prefix+'Crumble';
  if(/prawn.*cocktail/i.test(s))return prefix+'Prawn Cocktail';
  if(/chicken.*liver.*pate|liver.*pate/i.test(s))return prefix+'Chicken Liver Pate';
  if(/stilton.*mushroom|peppercorn.*mushroom/i.test(s))return prefix+'Stilton Mushrooms';
  if(/kofta/i.test(s))return prefix+'Koftas';

  // Generic fallback: strip long garnish/accompaniment wording but do not alter
  // the actual recipe name stored in the specification.
  s=s
    .replace(/\s+with\s+.*$/i,'')
    .replace(/\s+served\s+with\s+.*$/i,'')
    .replace(/\s+accompanied\s+by\s+.*$/i,'')
    .replace(/\s*[–—-]\s*.*$/,'')
    .trim();
  const words=s.split(/\s+/);
  if(words.length>4)s=words.slice(0,4).join(' ');
  return prefix+s;
};
KitchenApp.chefShortName=function(recipeOrName){
  const recipe=typeof recipeOrName==='object'&&recipeOrName
    ? recipeOrName
    : (KitchenApp.recipeMatch?KitchenApp.recipeMatch(recipeOrName):null);
  if(recipe)return String(recipe.chefShortName||KitchenApp.defaultChefShortName(recipe.name)).trim();
  return KitchenApp.defaultChefShortName(recipeOrName);
};
KitchenApp.uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

KitchenApp.escapeAttr = function(value) {
  return String(value ?? '')
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
};

KitchenApp.menuDefinitions = function() {
  const byCategory = category => KitchenApp.recipes().filter(r => r.category === category);

  const threeCourse = category => {
    const rows = byCategory(category);
    const ranges = {
      'Rose Menu': {starters:[19,25], mains:[26,38], desserts:[39,43]},
      'Peony Menu': {starters:[50,53], mains:[54,58], desserts:[62,65], shared:[59,61]},
      'Orchid Menu': {starters:[72,75], mains:[76,81], desserts:[85,88], shared:[82,84]}
    }[category];

    return {
      starters: rows.filter(r => r.page >= ranges.starters[0] && r.page <= ranges.starters[1]),
      mains: rows.filter(r => r.page >= ranges.mains[0] && r.page <= ranges.mains[1]),
      desserts: rows.filter(r => r.page >= ranges.desserts[0] && r.page <= ranges.desserts[1]),
      shared: ranges.shared ? rows.filter(r => r.page >= ranges.shared[0] && r.page <= ranges.shared[1]) : []
    };
  };

  return {
    threeCourse: {
      label: 'Three-Course Meal',
      type: 'allocated',
      menuGroups: ['Rose Menu','Peony Menu','Orchid Menu'],
      getCourses: threeCourse
    },
    fingerBuffet: {
      label: 'Finger Buffet',
      type: 'buffet',
      recipes: byCategory('Finger Buffet')
    },
    curry: {
      label: 'Curry Buffet',
      type: 'split',
      recipes: byCategory('Curry'),
      choices: [
        {id:'curry-tikka', name:'Chicken Tikka Masala', recipeId:'spec-112'},
        {id:'curry-korma', name:'Chicken Korma', recipeId:'spec-112'},
        {id:'curry-veggie', name:'Vegetarian Curry', recipeId:'spec-112'}
      ],
      accompaniments: ['spec-114']
    },
    bbq: {
      label: 'BBQ',
      type: 'split',
      recipes: byCategory('BBQ'),
      choices: byCategory('BBQ').filter(r => r.page >= 137),
      accompaniments: byCategory('BBQ').filter(r => r.page <= 136).map(r => r.id)
    },
    hogRoast: {
      label: 'Hog Roast',
      type: 'split',
      recipes: byCategory('Hog Roast'),
      choices: [
        {id:'hog-adult', name:'Hog Roast', recipeId:'spec-145'},
        {id:'hog-ngci', name:'NGCI Hog Roast', recipeId:'spec-146'}
      ],
      accompaniments: ['spec-147','spec-148','spec-149','spec-150']
    },
    breakfast: {
      label: 'Breakfast Rolls',
      type: 'split',
      recipes: byCategory('Breakfast Rolls'),
      choices: byCategory('Breakfast Rolls')
    },
    afternoonTea: {
      label: 'Afternoon Tea',
      type: 'selection',
      recipes: byCategory('Afternoon Tea')
    },
    platters: {
      label: 'Platters',
      type: 'selection',
      recipes: byCategory('Platters')
    },
    canapes: {
      label: 'Canapés',
      type: 'selection',
      recipes: byCategory('Canapes')
    },
    hotRolls: {
      label: 'Hot Rolls',
      type: 'split',
      recipes: byCategory('Hot Rolls'),
      choices: byCategory('Hot Rolls')
    },
    custom: {
      label: 'Custom / Other',
      type: 'custom'
    }
  };
};

KitchenApp.blankService = function() {
  return {
    id: KitchenApp.uid('service'),
    name: '',
    guests: 0,
    menuKey: '',
    menuGroup: '',
    notes: '',
    allocations: {},
    selectedIds: [],
    breadSplits: {},
    customRows: []
  };
};

KitchenApp.blankFunction = function() {
  return {
    id: KitchenApp.uid('function'),
    date: '',
    name: '',
    type: 'Wedding',
    notes: '',
    services: [KitchenApp.blankService()]
  };
};

KitchenApp.findFunction = id => KitchenApp.functions.find(fn => fn.id === id);

// ============================================================================
// UPDATE 4 — LIVE BOOKINGS -> KITCHEN
// Pulls Weddings + Functions into a date-range kitchen run. Imported records
// remain editable in the existing Kitchen wizard before the order is printed.
// ============================================================================
KitchenApp.importRange = KitchenApp.importRange || {start:'',end:''};

KitchenApp.isoToday = function(){
  const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
};
KitchenApp.addDays = function(date,days){
  const d=new Date((date||KitchenApp.isoToday())+'T12:00:00');d.setDate(d.getDate()+days);
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
};
KitchenApp.defaultRange = function(){
  const today=new Date(KitchenApp.isoToday()+'T12:00:00');
  const offset=(today.getDay()+6)%7;
  const start=KitchenApp.addDays(KitchenApp.isoToday(),-offset);
  return {start,end:KitchenApp.addDays(start,6)};
};
KitchenApp.inRange=(date,start,end)=>!!date&&date>=start&&date<=end;
KitchenApp.normaliseFoodName=value=>String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ').trim();
KitchenApp.recipeMatch=function(name){
  const wanted=KitchenApp.normaliseFoodName(name);if(!wanted)return null;
  const recipes=KitchenApp.recipes();
  return recipes.find(r=>KitchenApp.normaliseFoodName(r.name)===wanted) ||
    recipes.find(r=>{const n=KitchenApp.normaliseFoodName(r.name);return wanted.length>5&&(n.includes(wanted)||wanted.includes(n));}) || null;
};
KitchenApp.countValues=function(rows,key){
  const map=new Map();(rows||[]).forEach(row=>{const value=String(row?.[key]||'').trim();if(value)map.set(value,(map.get(value)||0)+1);});
  return [...map.entries()].map(([name,count])=>({name,count}));
};

KitchenApp.resolveRecipeRef=function(ref){
  if(!ref)return null;
  if(typeof ref==='object'){
    const id=ref.recipeId||ref.id||'';
    if(id){
      const direct=KitchenApp.recipeById(id);
      if(direct)return direct;
    }
    if(ref.name)return KitchenApp.recipeMatch(ref.name);
    return null;
  }
  const raw=String(ref).trim();if(!raw)return null;
  return KitchenApp.recipeById(raw)||KitchenApp.recipeMatch(raw)||null;
};
KitchenApp.serviceSelectedRecipes=function(service){
  const refs=[];
  (service.selectedIds||[]).forEach(x=>refs.push(x));
  (service.selectedRecipes||[]).forEach(x=>refs.push(x));
  (service.buffetOptions||[]).forEach(x=>refs.push(x));

  // Some older/third-party planning records stored selected recipe IDs as
  // allocation keys. Recover those if the key itself resolves to a recipe.
  Object.entries(service.allocations||{}).forEach(([key,value])=>{
    if(Number(value||0)<=0)return;
    const cleanKey=String(key).replace(/^(starter|main|dessert):/,'');
    if(KitchenApp.recipeById(cleanKey))refs.push(cleanKey);
  });

  const seen=new Set(),recipes=[];
  refs.forEach(ref=>{
    const recipe=KitchenApp.resolveRecipeRef(ref);
    if(recipe&&!seen.has(recipe.id)){seen.add(recipe.id);recipes.push(recipe);}
  });
  return recipes;
};
KitchenApp.buffetLinkStatus=function(service){
  const requested=[...(service.selectedIds||[]),...(service.selectedRecipes||[]),...(service.buffetOptions||[])];
  const linked=KitchenApp.serviceSelectedRecipes(service);
  const unresolved=requested.filter(ref=>!KitchenApp.resolveRecipeRef(ref));
  return {linked,unresolved};
};
KitchenApp.weddingMealService=function(wedding){
  try{if(typeof weddingPrepMealService==='function')return weddingPrepMealService(wedding)||'';}catch(e){}
  return '';
};
KitchenApp.weddingPlanningData=function(weddingId,section){
  return (DB.weddingPlanning||[]).find(row=>row.weddingId===weddingId&&row.section===section)?.data||{};
};
KitchenApp.weddingEveningMenuKey=function(name){
  const v=String(name||'').toLowerCase();
  if(v.includes('finger'))return 'fingerBuffet';
  if(v.includes('curry'))return 'curry';
  if(v.includes('barbecue')||v.includes('bbq'))return 'bbq';
  if(v.includes('hog'))return 'hogRoast';
  if(v.includes('breakfast'))return 'breakfast';
  if(v.includes('hot roll'))return 'hotRolls';
  return 'custom';
};
KitchenApp.weddingToKitchen=function(w){
  const guests=(DB.weddingGuests||[]).filter(g=>g.weddingId===w.id);
  const day=Number(w.dayGuests||guests.filter(g=>g.guestType!=='Evening').length||0);
  const reception=KitchenApp.weddingPlanningData(w.id,'reception');
  const foodData=KitchenApp.weddingPlanningData(w.id,'food');
  const recipeLinks=foodData.guestRecipeLinks||{};
  const evening=Number(reception.eveningFoodGuests||w.eveningGuests||0);
  const services=[];

  const courses=[['starterChoice','starter'],['mainChoice','main'],['dessertChoice','dessert']];
  const allocations={};let matched=0;const unmatched=[];
  courses.forEach(([field,prefix])=>guests.forEach(guest=>{
    const readable=String(guest[field]||'').trim(); if(!readable)return;
    const linkedId=recipeLinks?.[guest.id]?.[prefix]||'';
    const linkedRecipe=linkedId?KitchenApp.recipeById(linkedId):null;
    const recipe=linkedRecipe||KitchenApp.recipeMatch(readable);
    if(recipe){allocations[`${prefix}:${recipe.id}`]=(allocations[`${prefix}:${recipe.id}`]||0)+1;matched+=1;}
    else unmatched.push(readable);
  }));
  const unmatchedCounts=[...new Set(unmatched)].map(name=>({name,count:unmatched.filter(x=>x===name).length}));
  const plannedMenu=['Rose Menu','Peony Menu','Orchid Menu'].includes(reception.weddingBreakfastMenu)?reception.weddingBreakfastMenu:'';
  if(day||matched||unmatched.length){
    const dayShared=plannedMenu ? (KitchenApp.menuDefinitions().threeCourse.getCourses(plannedMenu)?.shared||[]).map(r=>r.id) : [];
    services.push({
      ...KitchenApp.blankService(),id:KitchenApp.uid('service'),name:'Wedding Breakfast',guests:day||guests.length,
      menuKey:(plannedMenu||matched)?'threeCourse':'custom',menuGroup:plannedMenu,allocations,selectedIds:dayShared,
      notes:[KitchenApp.weddingMealService(w),unmatchedCounts.length?`Unlinked legacy choices: ${unmatchedCounts.map(x=>`${x.count} × ${x.name}`).join('; ')}`:'',
        foodData.linkVersion?`Structured guest recipe links active`:'Legacy food choices imported'].filter(Boolean).join(' · ')
    });
  }

  // Phase 4R: multiple evening food services come directly from Wedding Planning.
  // Each service already uses Kitchen menu keys / recipe IDs, so there is no guessing.
  const plannedEveningServices=Array.isArray(reception.eveningFoodServices)?reception.eveningFoodServices.filter(x=>x&&x.menuKey):[];
  if(plannedEveningServices.length){
    plannedEveningServices.forEach((planned,index)=>{
      const def=KitchenApp.menuDefinitions()[planned.menuKey];
      services.push({
        ...KitchenApp.blankService(),
        id:planned.id||KitchenApp.uid('service'),
        name:`Evening Food${plannedEveningServices.length>1?` ${index+1}`:''}`,
        guests:Number(planned.guests||0),
        serviceTime:planned.time||'',
        menuKey:planned.menuKey||'custom',
        allocations:{...(planned.allocations||{})},
        selectedIds:[...(planned.selectedIds||planned.kitchenSelectedIds||[])],
        selectedRecipes:[...(planned.selectedRecipes||[])],
        buffetOptions:[...(planned.buffetOptions||[])],
        notes:[planned.menuLabel||def?.label||'Evening food',planned.notes||'','Kitchen-linked from Wedding Planning'].filter(Boolean).join(' · ')
      });
    });
  } else {
    // Legacy fallback for weddings saved before multi-service Kitchen linking existed.
    const eveningMenu=reception.eveningFoodMenu||'';
    const eveningMenuKey=KitchenApp.weddingEveningMenuKey(eveningMenu);
    const eveningAllocations={};
    const eveningUnmatched=[];
    guests.forEach(guest=>{
      const readable=String(guest.eveningFoodChoice||'').trim(); if(!readable)return;
      const linkedId=recipeLinks?.[guest.id]?.evening||'';
      const recipe=linkedId?KitchenApp.recipeById(linkedId):KitchenApp.recipeMatch(readable);
      if(recipe) eveningAllocations[recipe.id]=(eveningAllocations[recipe.id]||0)+1;
      else eveningUnmatched.push(readable);
    });
    if(eveningMenuKey!=='custom'||evening||Object.keys(eveningAllocations).length||eveningUnmatched.length){
      const notes=[eveningMenu||'Evening food',eveningUnmatched.length?`Unlinked choices: ${[...new Set(eveningUnmatched)].map(name=>`${eveningUnmatched.filter(x=>x===name).length} × ${name}`).join('; ')}`:'','Legacy single-service import'].filter(Boolean).join(' · ');
      const eveningDef=KitchenApp.menuDefinitions()[eveningMenuKey];
      const defaultAccompaniments=(eveningDef?.accompaniments||[]).slice();
      services.push({...KitchenApp.blankService(),id:KitchenApp.uid('service'),name:'Evening Food',guests:evening||Object.values(eveningAllocations).reduce((a,b)=>a+b,0),menuKey:eveningMenuKey,allocations:eveningAllocations,selectedIds:defaultAccompaniments,notes});
    }
  }

  const dietary=[...new Set(guests.map(g=>String(g.dietaryRequirements||'').trim()).filter(Boolean))];
  return {id:`wedding:${w.id}`,sourceType:'wedding',sourceId:w.id,date:w.date,name:w.couple||'Wedding',type:'Wedding',notes:dietary.length?`Dietary / allergens: ${dietary.join(' | ')}`:'',services:services.length?services:[{...KitchenApp.blankService(),name:'Food Service',guests:day||w.dayGuests||0,menuKey:'custom',notes:'No structured food choices found — review before ordering.'}]};
};
KitchenApp.functionMenuKey=function(text){
  const v=String(text||'').toLowerCase();
  if(v.includes('finger')||v.includes('buffet'))return 'fingerBuffet';
  if(v.includes('curry'))return 'curry'; if(v.includes('bbq')||v.includes('barbecue'))return 'bbq';
  if(v.includes('hog'))return 'hogRoast'; if(v.includes('breakfast')||v.includes('bacon roll'))return 'breakfast';
  if(v.includes('afternoon tea'))return 'afternoonTea'; if(v.includes('canap'))return 'canapes'; if(v.includes('platter'))return 'platters';
  return 'custom';
};
KitchenApp.functionToKitchen=function(fn){
  const p=fn.planning||{},food=p.food||{},run=p.runningOrder||{};
  const catering=food.catering||'Food / Catering';
  const menuKey=KitchenApp.functionMenuKey(catering);
  const notes=[catering,food.refreshments&&`Refreshments: ${food.refreshments}`,food.dietary&&`Dietary / allergens: ${food.dietary}`,food.drinks&&`Drinks: ${food.drinks}`].filter(Boolean).join(' · ');
  const kitchenSelectedIds=Array.isArray(food.kitchenSelectedIds)?food.kitchenSelectedIds:[];
  const kitchenSelectedNames=Array.isArray(food.kitchenSelectedNames)?food.kitchenSelectedNames:[];
  return {id:`function:${fn.id}`,sourceType:'function',sourceId:fn.id,date:fn.eventDate,name:fn.clientName||fn.eventType||'Function',type:fn.eventType||'Function',notes:'Imported from Function Plan',services:[{...KitchenApp.blankService(),id:KitchenApp.uid('service'),name:catering||'Food Service',guests:Number(fn.guests||0),menuKey,selectedIds:[...kitchenSelectedIds],selectedRecipes:[...kitchenSelectedNames],notes,serviceTime:run.food||''}]};
};
KitchenApp.rangeBookings=function(start,end){
  const rows=[];
  (DB.weddings||[]).filter(w=>!w.archivedAt&&String(w.status||'').toLowerCase()!=='cancelled'&&KitchenApp.inRange(w.date,start,end)).forEach(w=>rows.push(KitchenApp.weddingToKitchen(w)));
  (DB.functions||[]).filter(fn=>!fn.archivedAt&&String(fn.status||'').toLowerCase()!=='cancelled'&&KitchenApp.inRange(fn.eventDate,start,end)).forEach(fn=>rows.push(KitchenApp.functionToKitchen(fn)));
  return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
};
KitchenApp.openBookingPull=function(start='',end=''){
  const range=KitchenApp.defaultRange();start=start||KitchenApp.importRange.start||range.start;end=end||KitchenApp.importRange.end||range.end;
  KitchenApp.importRange={start,end};
  const rows=KitchenApp.rangeBookings(start,end);
  openModal(`<div class="p-6 max-w-5xl"><div class="flex justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">LIVE BOOKINGS → KITCHEN</p><h2 class="text-2xl font-bold mt-1">Pull Food Requirements</h2><p class="text-sm text-gray-500 mt-1">Weddings and Functions in the selected range. Existing imported bookings will be refreshed, not duplicated.</p></div><button onclick="closeModal()" class="p-2"><i data-lucide="x"></i></button></div>
    <div class="grid sm:grid-cols-2 gap-3 mt-5"><label class="text-xs font-medium">From<input id="kitchen-pull-start" type="date" value="${start}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label><label class="text-xs font-medium">To<input id="kitchen-pull-end" type="date" value="${end}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label></div>
    <button onclick="KitchenApp.refreshBookingPull()" class="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold">Refresh Preview</button>
    <div class="mt-5 max-h-[48vh] overflow-y-auto space-y-2">${rows.length?rows.map(row=>`<div class="rounded-xl border p-3 flex justify-between gap-4"><div><p class="text-xs font-bold text-olive-700">${new Date(row.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})} · ${esc(row.type)}</p><strong>${esc(row.name)}</strong><p class="text-xs text-gray-500 mt-1">${row.services.map(s=>`${s.guests} covers · ${KitchenApp.menuDefinitions()[s.menuKey]?.label||'Needs mapping'}`).join(' · ')}</p></div><span class="text-xs ${row.services.some(s=>s.menuKey==='custom')?'text-amber-700':'text-green-700'} font-semibold">${row.services.some(s=>s.menuKey==='custom')?'Review needed':'Spec-linked'}</span></div>`).join(''):'<div class="p-8 text-center text-gray-400 border border-dashed rounded-xl">No Weddings or Functions found in this date range.</div>'}</div>
    <div class="flex justify-end gap-2 mt-5"><button onclick="closeModal()" class="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button><button onclick="KitchenApp.importBookingRange()" ${rows.length?'':'disabled'} class="px-5 py-2 bg-olive-700 text-white rounded-lg font-semibold disabled:opacity-40">Pull ${rows.length} Booking${rows.length===1?'':'s'} into Kitchen</button></div></div>`);
};
KitchenApp.refreshBookingPull=function(){
  const start=document.getElementById('kitchen-pull-start')?.value||'',end=document.getElementById('kitchen-pull-end')?.value||'';
  if(!start||!end||end<start)return toast('Choose a valid date range','error');
  KitchenApp.importRange={start,end};closeModal();KitchenApp.openBookingPull(start,end);
};
KitchenApp.importBookingRange=function(){
  const start=document.getElementById('kitchen-pull-start')?.value||KitchenApp.importRange.start,end=document.getElementById('kitchen-pull-end')?.value||KitchenApp.importRange.end;
  const rows=KitchenApp.rangeBookings(start,end);if(!rows.length)return toast('No bookings found','error');
  rows.forEach(row=>{const i=KitchenApp.functions.findIndex(x=>x.id===row.id);if(i>=0)KitchenApp.functions[i]=row;else KitchenApp.functions.push(row);});
  KitchenApp.functions.sort((a,b)=>a.date.localeCompare(b.date));KitchenApp.importRange={start,end};closeModal();renderSection();toast(`${rows.length} live booking${rows.length===1?'':'s'} pulled into Kitchen`);
};


KitchenApp.setTab = function(tab) {
  KitchenApp.activeTab = tab;
  if(window.AppRouter)AppRouter.commit(`/kitchen/${encodeURIComponent(tab)}`);
  renderSection();
};

KitchenApp.addFunction = function(id = '') {
  const source = id ? KitchenApp.findFunction(id) : KitchenApp.blankFunction();
  if (!source) return;
  const draft = JSON.parse(JSON.stringify(source));
  KitchenApp.functionDraft = draft;
  KitchenApp.openFunctionWizard();
};

KitchenApp.applyFunctionModalSize = function() {
  const overlay=document.getElementById('modal-overlay');
  const content=document.getElementById('modal-content');
  if(!overlay||!content)return;

  overlay.classList.remove('p-4');
  overlay.classList.add('p-3','lg:p-6');

  content.className=[
    'bg-white',
    'rounded-3xl',
    'shadow-2xl',
    'w-[94vw]',
    'max-w-[1500px]',
    'h-[90vh]',
    'max-h-[90vh]',
    'overflow-hidden'
  ].join(' ');
};

KitchenApp.closeFunctionWizard = function() {
  const overlay=document.getElementById('modal-overlay');
  if(overlay){
    overlay.classList.remove('p-3','lg:p-6');
    overlay.classList.add('p-4');
  }
  closeModal();
};

KitchenApp.openFunctionWizard = function() {
  const fn = KitchenApp.functionDraft;
  openModal(`<div class="h-full min-h-0 flex flex-col p-6 lg:p-8">
    <div class="flex justify-between items-start gap-4 mb-5">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">KITCHEN WEEKLY BUILDER</p>
        <h2 class="text-2xl font-bold">${KitchenApp.functions.some(item=>item.id===fn.id) ? 'Edit Function' : 'Add Function'}</h2>
        <p class="text-sm text-gray-500 mt-1">Add each food service separately so day and evening guest numbers can differ.</p>
      </div>
      <button onclick="KitchenApp.closeFunctionWizard()" class="p-2 rounded-lg hover:bg-gray-100"><i data-lucide="x"></i></button>
    </div>

    <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
      <label class="text-sm font-medium text-gray-700">Date
        <input id="kitchen-fn-date" type="date" value="${KitchenApp.escapeAttr(fn.date)}" class="mt-1 w-full px-4 py-3 border rounded-xl text-base">
      </label>
      <label class="text-sm font-medium text-gray-700">Function / booking name
        <input id="kitchen-fn-name" value="${KitchenApp.escapeAttr(fn.name)}" placeholder="e.g. Smith Wedding" class="mt-1 w-full px-4 py-3 border rounded-xl text-base">
      </label>
      <label class="text-sm font-medium text-gray-700">Function type
        <select id="kitchen-fn-type" class="mt-1 w-full px-4 py-3 border rounded-xl text-base">
          ${['Wedding','Christening','Meeting','Wake','Birthday','Conference','Private Event','Other'].map(v=>`<option ${fn.type===v?'selected':''}>${v}</option>`).join('')}
        </select>
      </label>
      <label class="text-sm font-medium text-gray-700">General kitchen notes
        <input id="kitchen-fn-notes" value="${KitchenApp.escapeAttr(fn.notes)}" placeholder="General notes for the whole function" class="mt-1 w-full px-4 py-3 border rounded-xl text-base">
      </label>
    </div>

    <div class="mt-5 flex items-center justify-between gap-3">
      <div><h3 class="font-bold text-xl">Food services</h3><p class="text-xs text-gray-500">Select the menu first; its relevant choices will then appear.</p></div>
      <button onclick="KitchenApp.addDraftService()" class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">+ Add Food Service</button>
    </div>

    <div id="kitchen-service-list" class="mt-5 space-y-5 flex-1 min-h-0 overflow-y-auto pr-2"></div>

    <div class="flex justify-end gap-3 mt-5 pt-5 border-t bg-white flex-shrink-0">
      <button onclick="KitchenApp.closeFunctionWizard()" class="px-5 py-3 bg-gray-100 rounded-xl font-semibold">Cancel</button>
      <button onclick="KitchenApp.commitFunction()" class="px-6 py-3 bg-charcoal-900 text-white rounded-xl font-semibold">Add Function to Week</button>
    </div>
  </div>`);

  KitchenApp.applyFunctionModalSize();
  KitchenApp.renderDraftServices();
  if (window.lucide) lucide.createIcons();
};

KitchenApp.syncFunctionHeader = function() {
  const fn = KitchenApp.functionDraft;
  fn.date = document.getElementById('kitchen-fn-date')?.value || '';
  fn.name = document.getElementById('kitchen-fn-name')?.value.trim() || '';
  fn.type = document.getElementById('kitchen-fn-type')?.value || 'Other';
  fn.notes = document.getElementById('kitchen-fn-notes')?.value.trim() || '';
};

KitchenApp.addDraftService = function() {
  KitchenApp.syncFunctionHeader();
  KitchenApp.functionDraft.services.push(KitchenApp.blankService());
  KitchenApp.renderDraftServices();
};

KitchenApp.removeDraftService = function(id) {
  KitchenApp.functionDraft.services = KitchenApp.functionDraft.services.filter(s => s.id !== id);
  if (!KitchenApp.functionDraft.services.length) KitchenApp.functionDraft.services.push(KitchenApp.blankService());
  KitchenApp.renderDraftServices();
};

KitchenApp.updateServiceBase = function(id, field, value) {
  const service = KitchenApp.functionDraft.services.find(s => s.id === id);
  if (!service) return;

  service[field] = field === 'guests' ? Number(value || 0) : value;

  // Do not rebuild the entire service list while somebody is typing.
  // Re-rendering on every keypress replaces the input element and causes it
  // to lose focus after one character.
  if (field === 'menuKey') {
    service.menuGroup = '';
    service.allocations = {};
    service.selectedIds = [];
    service.breadSplits = {};
    service.customRows = [];
    KitchenApp.renderDraftServices();
    return;
  }

  if (field === 'menuGroup') {
    service.allocations = {};
    service.selectedIds = [];
    KitchenApp.renderDraftServices();
    return;
  }

  if (field === 'guests') {
    KitchenApp.updateServiceTotals(id);
  }
};

KitchenApp.setAllocation = function(serviceId, key, value) {
  const service = KitchenApp.functionDraft.services.find(s => s.id === serviceId);
  if (!service) return;
  service.allocations[key] = Math.max(0, Number(value || 0));
  KitchenApp.updateServiceTotals(serviceId);
};

KitchenApp.toggleSelection = function(serviceId, recipeId, checked) {
  const service = KitchenApp.functionDraft.services.find(s => s.id === serviceId);
  if (!service) return;
  const set = new Set(service.selectedIds || []);
  checked ? set.add(recipeId) : set.delete(recipeId);
  service.selectedIds = [...set];
  KitchenApp.updateServiceTotals(serviceId);
};

KitchenApp.setBread = function(serviceId, recipeId, bread, value) {
  const service = KitchenApp.functionDraft.services.find(s => s.id === serviceId);
  if (!service) return;
  service.breadSplits[recipeId] = service.breadSplits[recipeId] || {white:0,malted:0};
  service.breadSplits[recipeId][bread] = Math.max(0, Number(value || 0));
  KitchenApp.updateServiceTotals(serviceId);
};

KitchenApp.updateServiceTotals = function(serviceId) {
  const service = KitchenApp.functionDraft.services.find(s => s.id === serviceId);
  const target = document.getElementById(`service-totals-${serviceId}`);
  if (!service || !target) return;
  target.innerHTML = KitchenApp.serviceTotalsHTML(service);
};

KitchenApp.allocationTotal = function(service, prefix = '') {
  return Object.entries(service.allocations || {})
    .filter(([key]) => !prefix || key.startsWith(prefix))
    .reduce((sum,[,value])=>sum+Number(value||0),0);
};

KitchenApp.serviceTotalsHTML = function(service) {
  const guests = Number(service.guests || 0);
  if (service.menuKey === 'threeCourse') {
    return ['starter','main','dessert'].map(course => {
      const total = KitchenApp.allocationTotal(service, `${course}:`);
      const difference = guests - total;
      return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold ${difference===0?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}">${course[0].toUpperCase()+course.slice(1)} ${total}/${guests}${difference===0?' ✓':` · ${Math.abs(difference)} ${difference>0?'missing':'over'}`}</span>`;
    }).join(' ');
  }
  if (['curry','bbq','hogRoast','breakfast','hotRolls'].includes(service.menuKey)) {
    const total = KitchenApp.allocationTotal(service);
    const difference = guests - total;
    return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold ${difference===0?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}">Allocated ${total}/${guests}${difference===0?' ✓':` · ${Math.abs(difference)} ${difference>0?'missing':'over'}`}</span>`;
  }
  if (service.menuKey === 'fingerBuffet') {
    const total = Object.values(service.breadSplits || {}).reduce((sum,row)=>sum+Number(row.white||0)+Number(row.malted||0),0);
    const status=KitchenApp.buffetLinkStatus(service);
    return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Sandwich portions: ${total}</span>
      <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${status.linked.length?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}">${status.linked.length} buffet item${status.linked.length===1?'':'s'} → shopping list${status.linked.length?' ✓':''}</span>
      ${status.unresolved.length?`<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">${status.unresolved.length} unlinked item${status.unresolved.length===1?'':'s'}</span>`:''}`;
  }
  return '';
};

KitchenApp.renderDraftServices = function() {
  const host = document.getElementById('kitchen-service-list');
  if (!host) return;
  const menus = KitchenApp.menuDefinitions();

  host.innerHTML = KitchenApp.functionDraft.services.map((service,index) => `<article class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div class="px-6 py-5 bg-cream-50 border-b flex flex-col xl:flex-row xl:items-center gap-4">
      <span class="w-8 h-8 rounded-full bg-olive-700 text-white flex items-center justify-center font-bold flex-shrink-0">${index+1}</span>
      <input value="${KitchenApp.escapeAttr(service.name)}" oninput="KitchenApp.updateServiceBase('${service.id}','name',this.value)" placeholder="Service name, e.g. Wedding Breakfast or Evening Buffet" class="flex-1 px-4 py-3 border rounded-xl text-base">
      <input type="number" min="1" value="${service.guests||''}" onchange="KitchenApp.updateServiceBase('${service.id}','guests',this.value)" placeholder="Guests" class="w-32 px-4 py-3 border rounded-xl text-base">
      <select onchange="KitchenApp.updateServiceBase('${service.id}','menuKey',this.value)" class="min-w-64 px-4 py-3 border rounded-xl text-base">
        <option value="">Select menu first…</option>
        ${Object.entries(menus).map(([key,item])=>`<option value="${key}" ${service.menuKey===key?'selected':''}>${item.label}</option>`).join('')}
      </select>
      <button onclick="KitchenApp.removeDraftService('${service.id}')" class="px-3 py-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">Remove</button>
    </div>
    <div class="p-6">
      ${service.menuKey ? KitchenApp.menuEditorHTML(service) : '<div class="rounded-xl border border-dashed p-7 text-center text-gray-400">Select a menu to show its food choices.</div>'}
      <label class="text-xs text-gray-600 block mt-4">Service-specific kitchen notes
        <textarea rows="2" oninput="KitchenApp.updateServiceBase('${service.id}','notes',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Serving time, dietary split, separate plates, extra crackling...">${esc(service.notes||'')}</textarea>
      </label>
      <div id="service-totals-${service.id}" class="flex flex-wrap gap-2 mt-3">${KitchenApp.serviceTotalsHTML(service)}</div>
    </div>
  </article>`).join('');

  if (window.lucide) lucide.createIcons();
};

KitchenApp.quantityRowsHTML = function(service, rows, prefix = '') {
  return `<div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3">${rows.map(row => {
    const id = row.recipeId || row.id;
    const name = row.name;
    const key = `${prefix}${id}`;
    return `<label class="rounded-xl border border-gray-200 p-3 text-xs text-gray-600">${esc(name)}
      <input type="number" min="0" value="${Number(service.allocations[key]||0)||''}" oninput="KitchenApp.setAllocation('${service.id}','${key}',this.value)" placeholder="0 covers" class="mt-2 w-full px-3 py-2 border rounded-lg text-sm">
    </label>`;
  }).join('')}</div>`;
};

KitchenApp.menuEditorHTML = function(service) {
  const defs = KitchenApp.menuDefinitions();
  const def = defs[service.menuKey];

  if (service.menuKey === 'threeCourse') {
    const group = service.menuGroup || '';
    const courses = group ? def.getCourses(group) : null;
    return `<div>
      <label class="text-xs text-gray-600">Select three-course menu
        <select onchange="KitchenApp.updateServiceBase('${service.id}','menuGroup',this.value)" class="mt-1 w-full md:w-80 px-3 py-2.5 border rounded-lg text-sm">
          <option value="">Select Rose, Peony or Orchid…</option>
          ${def.menuGroups.map(v=>`<option ${group===v?'selected':''}>${v}</option>`).join('')}
        </select>
      </label>
      ${courses ? `<div class="space-y-5 mt-4">
        <section><h4 class="font-bold mb-2">Starters — enter actual covers</h4>${KitchenApp.quantityRowsHTML(service,courses.starters,'starter:')}</section>
        <section><h4 class="font-bold mb-2">Mains — enter actual covers</h4>${KitchenApp.quantityRowsHTML(service,courses.mains,'main:')}</section>
        <section><h4 class="font-bold mb-2">Desserts — enter actual covers</h4>${KitchenApp.quantityRowsHTML(service,courses.desserts,'dessert:')}</section>
        ${courses.shared.length ? `<section><h4 class="font-bold mb-2">Shared vegetables and potatoes</h4><div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3">${courses.shared.map(r=>`<label class="flex gap-3 p-3 border rounded-xl"><input type="checkbox" ${service.selectedIds.includes(r.id)?'checked':''} onchange="KitchenApp.toggleSelection('${service.id}','${r.id}',this.checked)"><span class="text-sm">${esc(r.name)}</span></label>`).join('')}</div></section>` : ''}
      </div>` : '<p class="text-sm text-gray-400 mt-4">Choose the menu to reveal starters, mains and desserts.</p>'}
    </div>`;
  }

  if (service.menuKey === 'fingerBuffet') {
    const sandwiches = def.recipes.filter(r=>r.name.startsWith('Sandwich -'));
    const other = def.recipes.filter(r=>!r.name.startsWith('Sandwich -') && !r.name.startsWith('Wrap -'));
    return `<div class="space-y-5">
      <section>
        <h4 class="font-bold">Sandwiches — enter White and Malted portions</h4>
        <p class="text-xs text-gray-500 mt-1">Enter the actual number of guest portions for each filling and bread type.</p>
        <div class="mt-3 space-y-2">${sandwiches.map(recipe => {
          const split = service.breadSplits[recipe.id] || {white:0,malted:0};
          return `<div class="grid grid-cols-[1fr_110px_110px] gap-2 items-end rounded-xl border p-3">
            <div><p class="text-sm font-semibold">${esc(recipe.name.replace('Sandwich - ',''))}</p><p class="text-[12px] text-gray-400">Spec page ${recipe.page}</p></div>
            <label class="text-[12px] text-gray-500">White<input type="number" min="0" value="${split.white||''}" oninput="KitchenApp.setBread('${service.id}','${recipe.id}','white',this.value)" class="mt-1 w-full px-2 py-2 border rounded-lg text-sm"></label>
            <label class="text-[12px] text-gray-500">Malted<input type="number" min="0" value="${split.malted||''}" oninput="KitchenApp.setBread('${service.id}','${recipe.id}','malted',this.value)" class="mt-1 w-full px-2 py-2 border rounded-lg text-sm"></label>
          </div>`;
        }).join('')}</div>
      </section>
      <section>
        <h4 class="font-bold">Savouries, salads and extras — select only what is being served</h4>
        <div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3 mt-3">${other.map(recipe=>`<label class="flex items-start gap-3 p-3 rounded-xl border hover:bg-olive-50"><input type="checkbox" ${service.selectedIds.includes(recipe.id)?'checked':''} onchange="KitchenApp.toggleSelection('${service.id}','${recipe.id}',this.checked)" class="mt-0.5"><span><span class="block text-sm font-semibold">${esc(recipe.name)}</span><span class="text-[12px] text-gray-400">Page ${recipe.page}</span></span></label>`).join('')}</div>
      </section>
    </div>`;
  }

  if (['curry','bbq','hogRoast','breakfast','hotRolls'].includes(service.menuKey)) {
    const choices = def.choices || [];
    const accompaniments = (def.accompaniments || []).map(id=>KitchenApp.recipeById(id)).filter(Boolean);
    return `<div class="space-y-5">
      <section><h4 class="font-bold mb-2">Enter actual covers for each choice</h4>${KitchenApp.quantityRowsHTML(service,choices)}</section>
      ${accompaniments.length ? `<section><h4 class="font-bold">Shared accompaniments</h4><p class="text-xs text-gray-500 mt-1">Selected accompaniments calculate against the total service guest count.</p><div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3 mt-3">${accompaniments.map(recipe=>`<label class="flex gap-3 p-3 rounded-xl border"><input type="checkbox" ${service.selectedIds.includes(recipe.id)?'checked':''} onchange="KitchenApp.toggleSelection('${service.id}','${recipe.id}',this.checked)"><span class="text-sm">${esc(recipe.name)}</span></label>`).join('')}</div></section>` : ''}
    </div>`;
  }

  if (['afternoonTea','platters','canapes'].includes(service.menuKey)) {
    return `<div><h4 class="font-bold">Select only the items being served</h4><div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3 mt-3">${def.recipes.map(recipe=>`<label class="flex gap-3 p-3 rounded-xl border"><input type="checkbox" ${service.selectedIds.includes(recipe.id)?'checked':''} onchange="KitchenApp.toggleSelection('${service.id}','${recipe.id}',this.checked)"><span class="text-sm">${esc(recipe.name)}</span></label>`).join('')}</div></div>`;
  }

  if (service.menuKey === 'custom') {
    return `<div class="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">Custom food can be recorded in the service notes. It will print on the function summary but cannot calculate ingredients until added to the Recipe Library.</div>`;
  }

  return '';
};

KitchenApp.commitFunction = function() {
  KitchenApp.syncFunctionHeader();
  const fn = KitchenApp.functionDraft;
  const warnings = [];

  if (!fn.date) warnings.push('Enter the function date.');
  if (!fn.name) warnings.push('Enter the function name.');
  if (!fn.services.length) warnings.push('Add at least one food service.');

  fn.services.forEach((service,index)=>{
    if (!service.name) warnings.push(`Service ${index+1}: enter a service name.`);
    if (!service.guests) warnings.push(`Service ${index+1}: enter guest numbers.`);
    if (!service.menuKey) warnings.push(`Service ${index+1}: select a menu.`);
  });

  if (warnings.length) {
    toast(warnings[0], 'error');
    return;
  }

  const existing = KitchenApp.functions.findIndex(item=>item.id===fn.id);
  if (existing >= 0) KitchenApp.functions[existing] = JSON.parse(JSON.stringify(fn));
  else KitchenApp.functions.push(JSON.parse(JSON.stringify(fn)));

  KitchenApp.functions.sort((a,b)=>a.date.localeCompare(b.date));
  KitchenApp.closeFunctionWizard();
  renderSection();
  toast(existing >= 0 ? 'Function updated' : 'Function added to kitchen week');
};

KitchenApp.removeFunction = function(id) {
  KitchenApp.functions = KitchenApp.functions.filter(fn=>fn.id!==id);
  renderSection();
};

KitchenApp.clearWeek = function() {
  if (!confirm('Clear every temporary function from this kitchen week?')) return;
  KitchenApp.functions = [];
  KitchenApp.adjustments = {};
  renderSection();
};

KitchenApp.normaliseIngredient = function(name) {
  return String(name||'').replace(/\s+/g,' ').replace(/\bPrep Multi\b/gi,'').trim();
};

KitchenApp.addIngredient = function(map, recipe, ingredient, multiplier, context) {
  let rows = [{
    name: KitchenApp.normaliseIngredient(ingredient.name),
    quantity: Number(ingredient.quantity||0)*multiplier,
    unit: ingredient.unit,
    page: recipe.page
  }];

  (recipe.expansions||[]).forEach(expansion=>{
    rows = rows.flatMap(row=>{
      if (!row.name.toLowerCase().includes(String(expansion.replace||'').toLowerCase()) || row.unit!==expansion.yieldUnit) return [row];
      const factor = row.quantity / Number(expansion.batchYield||1);
      return (expansion.ingredients||[]).map(component=>({
        name:KitchenApp.normaliseIngredient(component.name),
        quantity:Number(component.quantity||0)*factor,
        unit:component.unit,
        page:recipe.page
      }));
    });
  });

  rows.forEach(row=>{
    const key = `${row.name.toLowerCase()}|${row.unit}`;
    const current = map.get(key) || {name:row.name,unit:row.unit,quantity:0,pages:new Set(),contexts:new Set()};
    current.quantity += row.quantity;
    current.pages.add(row.page);
    current.contexts.add(context);
    map.set(key,current);
  });
};

KitchenApp.calculateRecipe = function(map, recipeId, covers, context) {
  const recipe = KitchenApp.recipeById(recipeId);
  if (!recipe || !covers) return;
  const multiplier = Number(covers||0) / Math.max(1,Number(recipe.serves||1));
  (recipe.ingredients||[]).forEach(ingredient=>KitchenApp.addIngredient(map,recipe,ingredient,multiplier,context));
};

KitchenApp.calculate = function() {
  const map = new Map();
  const summaries = [];

  KitchenApp.functions.forEach(fn=>{
    const serviceSummaries = [];
    fn.services.forEach(service=>{
      const context = `${fn.name} — ${service.name}`;
      const selected = [];

      if (service.menuKey === 'threeCourse') {
        Object.entries(service.allocations||{}).forEach(([key,covers])=>{
          const recipeId = key.split(':')[1];
          if (covers > 0) {
            KitchenApp.calculateRecipe(map,recipeId,covers,context);
            selected.push({name:KitchenApp.recipeById(recipeId)?.name||recipeId,covers});
          }
        });
        (service.selectedIds||[]).forEach(id=>{
          KitchenApp.calculateRecipe(map,id,service.guests,context);
          selected.push({name:KitchenApp.recipeById(id)?.name||id,covers:service.guests,shared:true});
        });
      } else if (service.menuKey === 'fingerBuffet') {
        Object.entries(service.breadSplits||{}).forEach(([recipeId,split])=>{
          const white = Number(split.white||0);
          const malted = Number(split.malted||0);
          const total = white+malted;
          if (!total) return;
          KitchenApp.calculateRecipe(map,recipeId,total,context);
          const recipe = KitchenApp.recipeById(recipeId);
          // Override the generic sliced bread line with explicit bread choice.
          const servingsPerRecipe = Math.max(1,Number(recipe?.serves||1));
          const breadPerServing = (recipe?.ingredients||[])
            .filter(i=>/bread/i.test(i.name) && i.unit==='each')
            .reduce((sum,i)=>sum+Number(i.quantity||0),0) / servingsPerRecipe;
          if (breadPerServing) {
            KitchenApp.addDirectIngredient(map,'White Bread',white*breadPerServing,'each',recipe.page,context);
            KitchenApp.addDirectIngredient(map,'Malted Bread',malted*breadPerServing,'each',recipe.page,context);
          }
          selected.push({name:recipe?.name||recipeId,covers:total,detail:`${white} white / ${malted} malted`});
        });
        const buffetRecipes=KitchenApp.serviceSelectedRecipes(service);
        buffetRecipes.forEach(recipe=>{
          KitchenApp.calculateRecipe(map,recipe.id,service.guests,context);
          selected.push({name:recipe.name,covers:service.guests,shared:true});
        });
      } else if (['curry','bbq','hogRoast','breakfast','hotRolls'].includes(service.menuKey)) {
        Object.entries(service.allocations||{}).forEach(([choiceId,covers])=>{
          if (!covers) return;
          const def = KitchenApp.menuDefinitions()[service.menuKey];
          const choice = (def.choices||[]).find(item=>(item.recipeId||item.id)===choiceId || item.id===choiceId);
          const recipeId = choice?.recipeId || choice?.id || choiceId;
          KitchenApp.calculateRecipe(map,recipeId,covers,context);
          selected.push({name:choice?.name||KitchenApp.recipeById(recipeId)?.name||recipeId,covers});
        });
        (service.selectedIds||[]).forEach(id=>{
          KitchenApp.calculateRecipe(map,id,service.guests,context);
          selected.push({name:KitchenApp.recipeById(id)?.name||id,covers:service.guests,shared:true});
        });
      } else {
        KitchenApp.serviceSelectedRecipes(service).forEach(recipe=>{
          KitchenApp.calculateRecipe(map,recipe.id,service.guests,context);
          selected.push({name:recipe.name,covers:service.guests,shared:true});
        });
      }

      serviceSummaries.push({service,selected});
    });
    summaries.push({fn,services:serviceSummaries});
  });

  const totals = [...map.values()].map(row=>({...row,pages:[...row.pages],contexts:[...row.contexts]})).sort((a,b)=>a.name.localeCompare(b.name));
  return {totals,summaries};
};

KitchenApp.addDirectIngredient = function(map,name,quantity,unit,page,context) {
  if (!quantity) return;
  const key = `${name.toLowerCase()}|${unit}`;
  const current = map.get(key) || {name,unit,quantity:0,pages:new Set(),contexts:new Set()};
  current.quantity += quantity;
  current.pages.add(page);
  current.contexts.add(context);
  map.set(key,current);
};

KitchenApp.formatQty = function(value,unit) {
  value = Number(value||0);
  if (unit==='g' && value>=1000) return `${Number((value/1000).toFixed(2))} kg`;
  if (unit==='ml' && value>=1000) return `${Number((value/1000).toFixed(2))} l`;
  if (['each','slice','portion','pack','pouch','head','rasher'].includes(unit)) return `${Math.ceil(value)} ${unit}${Math.ceil(value)===1||unit==='each'?'':'s'}`;
  return `${Number(value.toFixed(2))} ${unit}`;
};

KitchenApp.checkWeek = function() {
  const warnings = [];
  if (!KitchenApp.functions.length) warnings.push('No functions have been added.');

  KitchenApp.functions.forEach(fn=>fn.services.forEach(service=>{
    const guests = Number(service.guests||0);
    if (service.menuKey==='custom') warnings.push(`${fn.name} — ${service.name}: food is not linked to a Specification recipe yet; review before using the shopping list.`);
    if (!service.menuKey) warnings.push(`${fn.name} — ${service.name}: no menu selected.`);
    if (service.menuKey==='threeCourse') {
      ['starter','main','dessert'].forEach(course=>{
        const total=KitchenApp.allocationTotal(service,`${course}:`);
        if (total!==guests) warnings.push(`${fn.name} — ${service.name}: ${course} total is ${total}/${guests}.`);
      });
    }
    if (['curry','bbq','hogRoast','breakfast','hotRolls'].includes(service.menuKey)) {
      const total=KitchenApp.allocationTotal(service);
      if (total!==guests) warnings.push(`${fn.name} — ${service.name}: allocated choices total ${total}/${guests}.`);
    }
    if (service.menuKey==='fingerBuffet') {
      const sandwichTotal=Object.values(service.breadSplits||{}).reduce((sum,row)=>sum+Number(row.white||0)+Number(row.malted||0),0);
      const status=KitchenApp.buffetLinkStatus(service);
      if (!sandwichTotal && !status.linked.some(r=>/^Sandwich -/i.test(r.name))) warnings.push(`${fn.name} — ${service.name}: no sandwich portions or linked sandwich recipe selected.`);
      if (!status.linked.length) warnings.push(`${fn.name} — ${service.name}: Finger Buffet is selected but no exact Specification items are linked, so the shopping list cannot calculate the buffet.`);
      if (status.unresolved.length) warnings.push(`${fn.name} — ${service.name}: ${status.unresolved.length} buffet selection${status.unresolved.length===1?' is':'s are'} not linked to a Specification recipe.`);
    }
  }));

  openModal(`<div class="p-6">
    <div class="flex justify-between gap-3"><div><p class="text-xs font-bold tracking-widest text-olive-600">KITCHEN CHECK</p><h2 class="text-xl font-bold mt-1">${warnings.length?`${warnings.length} item${warnings.length===1?'':'s'} to review`:'Week ready to print'}</h2></div><button onclick="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="x"></i></button></div>
    <div class="mt-5 space-y-2">${warnings.length?warnings.map(w=>`<div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">⚠ ${esc(w)}</div>`).join(''):'<div class="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">All selected services match their guest totals and contain the required choices.</div>'}</div>
  </div>`);
};

KitchenApp.updateAdjustment = function(key,value) {
  KitchenApp.adjustments[key]=value;
};

KitchenApp.printWeek = function() {
  if (!KitchenApp.functions.length) return toast('Add at least one function before printing','error');
  const result=KitchenApp.calculate();
  const popup=window.open('','_blank','width=1100,height=800');
  if (!popup) return toast('Allow pop-ups to print the kitchen pack','error');

  const functions=result.summaries.map(({fn,services})=>`<section class="function"><h2>${new Date(fn.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})} — ${fn.name}</h2><p><strong>${fn.type}</strong>${fn.notes?` · ${fn.notes}`:''}</p>${services.map(({service,selected})=>`<div class="service"><h3>${service.name} — ${service.guests} guests — ${KitchenApp.menuDefinitions()[service.menuKey]?.label||service.menuKey}</h3>${service.notes?`<p class="note">${service.notes}</p>`:''}<ul>${selected.map(item=>`<li>${item.covers} × ${item.name}${item.detail?` (${item.detail})`:''}${item.shared?' — shared for full service':''}</li>`).join('')}</ul></div>`).join('')}</section>`).join('');

  const totals=result.totals.map(row=>{
    const key=`${row.name.toLowerCase()}|${row.unit}`;
    return `<tr><td>${row.name}</td><td>${KitchenApp.formatQty(row.quantity,row.unit)}</td><td>${esc(KitchenApp.adjustments[key]||KitchenApp.formatQty(row.quantity,row.unit))}</td><td>${row.pages.sort((a,b)=>a-b).join(', ')}</td></tr>`;
  }).join('');

  popup.document.write(`<!doctype html><html><head><title>Kitchen Pack</title><style>
    body{font-family:Arial,sans-serif;color:#111827;margin:28px}h1{margin:0}h2{font-size:19px;margin:0 0 5px}.function{border:1px solid #d1d5db;border-radius:10px;padding:14px;margin:12px 0;break-inside:avoid}.service{background:#f9fafb;border-radius:8px;padding:10px;margin-top:10px}.service h3{font-size:15px;margin:0}.note{background:#fffbeb;padding:7px;border-radius:6px}.order{page-break-before:always}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}.muted{color:#6b7280}@media print{button{display:none}}
  </style></head><body><h1>Windmill Farm — Weekly Kitchen Pack</h1><p class="muted">Created ${new Date().toLocaleString('en-GB')}</p>${functions}<section class="order"><h1>Combined Weekly Shopping List</h1><table><thead><tr><th>Ingredient / product</th><th>Calculated</th><th>Final order</th><th>Spec pages</th></tr></thead><tbody>${totals}</tbody></table></section><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
};

KitchenApp.renderBuilder = function() {
  const calc=KitchenApp.calculate();
  const services=KitchenApp.functions.reduce((sum,fn)=>sum+fn.services.length,0);
  const guests=KitchenApp.functions.reduce((sum,fn)=>sum+fn.services.reduce((s,x)=>s+Number(x.guests||0),0),0);

  return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
    <div class="section-card"><p class="text-xs text-gray-500">Functions</p><p class="text-2xl font-bold mt-1">${KitchenApp.functions.length}</p></div>
    <div class="section-card"><p class="text-xs text-gray-500">Food Services</p><p class="text-2xl font-bold mt-1">${services}</p></div>
    <div class="section-card"><p class="text-xs text-gray-500">Service Covers</p><p class="text-2xl font-bold mt-1">${guests}</p></div>
    <div class="section-card"><p class="text-xs text-gray-500">Order Lines</p><p class="text-2xl font-bold mt-1">${calc.totals.length}</p></div>
  </div>
  <div class="grid xl:grid-cols-[1fr_420px] gap-4">
    <section class="section-card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"><div><h3 class="font-bold text-lg">Functions added</h3><p class="text-xs text-gray-500">Pull live Weddings + Functions first, then review any unmatched menu choices before ordering.</p></div><div class="flex gap-2 flex-wrap"><button onclick="KitchenApp.openBookingPull()" class="px-4 py-2.5 bg-charcoal-900 text-white rounded-lg font-semibold">Pull Live Bookings</button><button onclick="KitchenApp.addFunction()" class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">+ Add Manually</button></div></div>
      <div class="space-y-3">${KitchenApp.functions.length?KitchenApp.functions.map(fn=>`<article class="rounded-xl border p-4"><div class="flex justify-between gap-3"><div><p class="text-xs font-bold tracking-widest text-olive-600">${new Date(fn.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'})}</p><h4 class="font-bold text-lg">${esc(fn.name)}</h4><p class="text-sm text-gray-500">${esc(fn.type)} · ${fn.services.length} food service${fn.services.length===1?'':'s'}</p></div><div class="flex gap-2"><button onclick="KitchenApp.addFunction('${fn.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold">Edit</button><button onclick="KitchenApp.removeFunction('${fn.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">Remove</button></div></div><div class="space-y-2 mt-3">${fn.services.map(service=>`<div class="rounded-lg bg-cream-50 border border-cream-200 p-3"><div class="flex justify-between gap-3"><strong class="text-sm">${esc(service.name)}</strong><span class="text-xs">${service.guests} guests</span></div><p class="text-xs text-gray-500 mt-1">${esc(KitchenApp.menuDefinitions()[service.menuKey]?.label||service.menuKey)}</p></div>`).join('')}</div></article>`).join(''):'<div class="rounded-xl border border-dashed p-10 text-center text-gray-400">Press Add Function to build the week.</div>'}</div>
    </section>
    <section class="section-card"><div class="flex justify-between items-center gap-3 mb-4"><div><h3 class="font-bold text-lg">Combined order preview</h3><p class="text-xs text-gray-500">Every selected service totalled together.</p></div><span class="badge bg-olive-100 text-olive-800">${calc.totals.length}</span></div><div class="space-y-2 max-h-[650px] overflow-y-auto">${calc.totals.length?calc.totals.map(row=>{const key=`${row.name.toLowerCase()}|${row.unit}`;return `<div class="rounded-lg border p-3"><div class="flex justify-between gap-3"><span class="text-sm font-semibold">${esc(row.name)}</span><strong class="text-sm">${KitchenApp.formatQty(row.quantity,row.unit)}</strong></div><input placeholder="Final order / kitchen adjustment" value="${esc(KitchenApp.adjustments[key]||'')}" onchange="KitchenApp.updateAdjustment('${KitchenApp.escapeAttr(key)}',this.value)" class="mt-2 w-full px-3 py-2 border rounded-lg text-xs"></div>`}).join(''):'<p class="text-sm text-gray-400">Totals appear after functions are added.</p>'}</div></section>
  </div>`;
};

KitchenApp.editRecipe = function(id) {
  const recipe=KitchenApp.recipeById(id);
  if (!recipe) return;
  openModal(`<div class="p-6 max-w-4xl"><div class="flex justify-between gap-3 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-600">RECIPE SETUP</p><h2 class="text-xl font-bold">${esc(recipe.name)}</h2><p class="text-xs text-gray-500">Spec page ${recipe.page}</p></div><button onclick="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="x"></i></button></div><form onsubmit="KitchenApp.saveRecipe(event,'${id}')"><div class="grid md:grid-cols-3 gap-3"><label class="text-xs text-gray-600">Official recipe name<input name="name" value="${KitchenApp.escapeAttr(recipe.name)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label><label class="text-xs text-gray-600">Chef short name<input name="chefShortName" value="${KitchenApp.escapeAttr(recipe.chefShortName||KitchenApp.defaultChefShortName(recipe.name))}" class="mt-1 w-full px-3 py-2.5 border rounded-lg" placeholder="e.g. Beef Dinner"><span class="block mt-1 text-[11px] text-gray-400">Used on table service sheets only.</span></label><label class="text-xs text-gray-600">People served by one recipe unit<input min="0.01" step="0.01" type="number" name="serves" value="${recipe.serves}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label></div><label class="text-xs text-gray-600 block mt-4">Ingredients — one per line: Name | Quantity | Unit<textarea name="ingredients" rows="14" class="mt-1 w-full px-3 py-2.5 border rounded-lg font-mono text-sm">${esc((recipe.ingredients||[]).map(i=>`${i.name} | ${i.quantity} | ${i.unit}`).join('\n'))}</textarea></label><div class="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 mt-3">Corrections save in this browser only.</div><div class="flex justify-end gap-2 mt-4"><button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button><button class="px-4 py-2 bg-olive-700 text-white rounded-lg font-semibold">Save Recipe</button></div></form></div>`);
};

KitchenApp.saveRecipe = function(event,id) {
  event.preventDefault();
  const data=new FormData(event.target);
  const ingredients=String(data.get('ingredients')||'').split('\n').map(line=>{const [name,quantity,unit]=line.split('|').map(v=>String(v||'').trim());return {name,quantity:Number(quantity||0),unit}}).filter(i=>i.name&&i.quantity&&i.unit);
  KitchenApp.recipeOverrides[id]={name:String(data.get('name')||'').trim(),chefShortName:String(data.get('chefShortName')||'').trim(),serves:Number(data.get('serves')||1),ingredients,needsReview:false};
  localStorage.setItem('windmill_kitchen_recipe_overrides',JSON.stringify(KitchenApp.recipeOverrides));
  closeModal();renderSection();toast('Recipe updated');
};

KitchenApp.renderRecipes = function() {
  const categories=[...new Set(KitchenApp.recipes().map(r=>r.category))];
  return `<section class="section-card"><div class="mb-4"><h3 class="font-bold text-lg">Specification Recipe Library</h3><p class="text-xs text-gray-500">${KitchenApp.recipes().length} food cards extracted from the uploaded specification.</p></div><div class="space-y-5">${categories.map(category=>`<section><h4 class="font-bold text-olive-800 mb-2">${esc(category)}</h4><div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3">${KitchenApp.recipes().filter(r=>r.category===category).map(recipe=>`<button onclick="KitchenApp.editRecipe('${recipe.id}')" class="text-left rounded-xl border p-3 hover:border-olive-400"><span class="block text-sm font-semibold">${esc(recipe.name)}</span><span class="block text-[11px] text-olive-600 mt-1">Chef sheet: ${esc(recipe.chefShortName||KitchenApp.defaultChefShortName(recipe.name))}</span><span class="block text-[12px] text-gray-400 mt-1">Page ${recipe.page} · ${recipe.ingredients.length} ingredient lines · serves ${recipe.serves}</span></button>`).join('')}</div></section>`).join('')}</div></section>`;
};


// KITCHEN PRINT STUDIO
KitchenApp.printStudioCategory=KitchenApp.printStudioCategory||'BBQ';KitchenApp.printStudioSelected=KitchenApp.printStudioSelected||[];
KitchenApp.printableCategories=function(){const p=['BBQ','Finger Buffet','Curry','Hog Roast','Breakfast Rolls','Afternoon Tea','Platters','Canapes','Hot Rolls','Rose Menu','Peony Menu','Orchid Menu'],h=[...new Set(KitchenApp.recipes().map(r=>r.category))];return p.filter(x=>h.includes(x)).concat(h.filter(x=>!p.includes(x)&&x!=='General'))};
KitchenApp.setPrintCategory=function(c){KitchenApp.printStudioCategory=c;KitchenApp.printStudioSelected=KitchenApp.recipes().filter(r=>r.category===c).map(r=>r.id);renderSection()};
KitchenApp.togglePrintRecipe=function(id,on){const s=new Set(KitchenApp.printStudioSelected);on?s.add(id):s.delete(id);KitchenApp.printStudioSelected=[...s]};
KitchenApp.selectAllPrintRecipes=function(on){KitchenApp.printStudioSelected=on?KitchenApp.recipes().filter(r=>r.category===KitchenApp.printStudioCategory).map(r=>r.id):[];renderSection()};
KitchenApp.customerFoodName=n=>String(n||'').replace(/\s*\((V|Ve|VE|v|NGCI)\)\s*/g,' ').replace(/\s+/g,' ').trim();
KitchenApp.dietaryTags=function(n){const a=[];if(/\(Ve\)|\(VE\)/.test(n))a.push('Vegan');else if(/\(V\)|\(v\)/.test(n))a.push('Vegetarian');if(/NGCI/i.test(n))a.push('Gluten-free option');return a};
KitchenApp.printWindow=function(title,body,extra=''){const w=window.open('','_blank','width=1200,height=850');if(!w)return toast('Allow pop-ups to open the print/PDF view','error');w.document.write(`<!doctype html><html><head><title>${title}</title><meta charset="utf-8"><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1d2924;margin:0;background:#eef0ec}.toolbar{position:sticky;top:0;z-index:5;background:#18231e;color:white;padding:12px 18px;display:flex;justify-content:space-between;align-items:center}.toolbar button{border:0;background:#d8bd68;border-radius:7px;padding:9px 14px;font-weight:700}${extra}@media print{body{background:#fff}.toolbar{display:none}}</style></head><body><div class="toolbar"><b>${title}</b><button onclick="window.print()">Print / Save as PDF</button></div>${body}</body></html>`);w.document.close()};

KitchenApp.specViewerQuery = KitchenApp.specViewerQuery || '';
KitchenApp.specViewerRecipeId = KitchenApp.specViewerRecipeId || '';

KitchenApp.specViewerRows=function(query=''){
  const q=String(query||'').trim().toLowerCase();
  const rows=KitchenApp.recipes();
  if(!q)return rows;
  return rows.filter(r=>{
    const hay=[
      r.name,
      r.category,
      r.page,
      ...(r.ingredients||[]).map(i=>i.name)
    ].join(' ').toLowerCase();
    return hay.includes(q);
  });
};

KitchenApp.specViewerSelect=function(id){
  KitchenApp.specViewerRecipeId=id;
  KitchenApp.renderSpecViewerBody();
};

KitchenApp.specViewerSearch=function(value){
  KitchenApp.specViewerQuery=value||'';
  const rows=KitchenApp.specViewerRows(value);
  if(rows.length && !rows.some(r=>r.id===KitchenApp.specViewerRecipeId)){
    KitchenApp.specViewerRecipeId=rows[0].id;
  }
  KitchenApp.renderSpecViewerBody();
};

KitchenApp.specViewerPage=function(recipe){
  if(!recipe)return `<div class="ksv-empty"><i data-lucide="search-x"></i><strong>No specification selected</strong><p>Search the specification book or select a result from the left.</p></div>`;
  return `<div class="ksv-paper">
    <header class="ksv-page-head">
      <div class="ksv-brand"><span>THE GRANARY</span><b>at Windmill Farm</b></div>
      <div class="ksv-page-ref"><span>SPECIFICATION</span><strong>${esc(recipe.page||'—')}</strong></div>
    </header>
    <section class="ksv-page-title">
      <p>${esc(recipe.category||'Kitchen Specification')}</p>
      <h1>${esc(KitchenApp.customerFoodName(recipe.name))}</h1>
      <div>
        <span>Serves ${esc(recipe.serves||'—')}</span>
        ${KitchenApp.dietaryTags(recipe.name).map(x=>`<span>${esc(x)}</span>`).join('')}
      </div>
    </section>
    <section class="ksv-page-section">
      <div class="ksv-section-label">INGREDIENT / PRODUCT SPECIFICATION</div>
      <table>
        <thead><tr><th>Ingredient / Product</th><th>Quantity</th><th>Unit</th></tr></thead>
        <tbody>${(recipe.ingredients||[]).map(i=>`<tr><td>${esc(i.name)}</td><td>${esc(i.quantity)}</td><td>${esc(i.unit)}</td></tr>`).join('')}</tbody>
      </table>
    </section>
    ${recipe.sourceNote?`<section class="ksv-source"><b>Source note</b><p>${esc(recipe.sourceNote)}</p></section>`:''}
    <footer class="ksv-page-footer">
      <span>The Granary at Windmill Farm · Kitchen Specification Book</span>
      <span>Spec ${esc(recipe.page||'—')}</span>
    </footer>
  </div>`;
};

KitchenApp.renderSpecViewerBody=function(){
  const host=document.getElementById('kitchen-spec-viewer-body');
  if(!host)return;
  const rows=KitchenApp.specViewerRows(KitchenApp.specViewerQuery);
  const selected=KitchenApp.recipeById(KitchenApp.specViewerRecipeId) || rows[0] || null;
  if(selected)KitchenApp.specViewerRecipeId=selected.id;

  host.innerHTML=`<aside class="ksv-sidebar">
    <div class="ksv-result-head">
      <strong>${rows.length} result${rows.length===1?'':'s'}</strong>
      <span>${KitchenApp.specViewerQuery?`for “${esc(KitchenApp.specViewerQuery)}”`:'all specifications'}</span>
    </div>
    <div class="ksv-results">
      ${rows.length?rows.map(r=>`<button onclick="KitchenApp.specViewerSelect('${r.id}')" class="${selected&&selected.id===r.id?'active':''}">
        <span class="ksv-result-page">${esc(r.page||'—')}</span>
        <span><b>${esc(KitchenApp.customerFoodName(r.name))}</b><small>${esc(r.category||'')}</small></span>
        <i data-lucide="chevron-right"></i>
      </button>`).join(''):`<div class="ksv-no-results"><i data-lucide="search-x"></i><strong>No match</strong><p>Try the food name, category, ingredient or spec number.</p></div>`}
    </div>
  </aside>
  <main class="ksv-preview">
    <div class="ksv-preview-toolbar">
      <div>
        ${selected?`<button onclick="KitchenApp.specViewerPrevious()"><i data-lucide="chevron-left"></i></button><span>${rows.findIndex(r=>r.id===selected.id)+1} / ${rows.length}</span><button onclick="KitchenApp.specViewerNext()"><i data-lucide="chevron-right"></i></button>`:''}
      </div>
      <button onclick="KitchenApp.printCurrentSpec()"><i data-lucide="printer"></i> Print this spec</button>
    </div>
    <div class="ksv-page-wrap">${KitchenApp.specViewerPage(selected)}</div>
  </main>`;
  if(window.lucide)lucide.createIcons();
};

KitchenApp.specViewerPrevious=function(){
  const rows=KitchenApp.specViewerRows(KitchenApp.specViewerQuery);
  const i=rows.findIndex(r=>r.id===KitchenApp.specViewerRecipeId);
  if(i>0){KitchenApp.specViewerRecipeId=rows[i-1].id;KitchenApp.renderSpecViewerBody();}
};
KitchenApp.specViewerNext=function(){
  const rows=KitchenApp.specViewerRows(KitchenApp.specViewerQuery);
  const i=rows.findIndex(r=>r.id===KitchenApp.specViewerRecipeId);
  if(i>=0&&i<rows.length-1){KitchenApp.specViewerRecipeId=rows[i+1].id;KitchenApp.renderSpecViewerBody();}
};

KitchenApp.viewSpecBook=function(){
  const all=KitchenApp.recipes();
  KitchenApp.specViewerQuery='';
  KitchenApp.specViewerRecipeId=all[0]?.id||'';
  const overlay=document.createElement('div');
  overlay.id='kitchen-spec-viewer';
  overlay.className='ksv-overlay';
  overlay.innerHTML=`<div class="ksv-shell">
    <header class="ksv-topbar">
      <div class="ksv-topbar-brand">
        <span>THE GRANARY</span>
        <b>Kitchen Specification Book</b>
      </div>
      <div class="ksv-search">
        <i data-lucide="search"></i>
        <input autofocus placeholder="Search Chicken Platter, BBQ, halloumi, spec 178..." oninput="KitchenApp.specViewerSearch(this.value)">
        <kbd>Search</kbd>
      </div>
      <div class="ksv-top-actions">
        <button onclick="KitchenApp.printFullSpecBook()"><i data-lucide="file-down"></i> Full PDF / Print</button>
        <button class="close" onclick="KitchenApp.closeSpecViewer()"><i data-lucide="x"></i></button>
      </div>
    </header>
    <div id="kitchen-spec-viewer-body" class="ksv-body"></div>
  </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow='hidden';
  KitchenApp.renderSpecViewerBody();
  if(window.lucide)lucide.createIcons();
};

KitchenApp.closeSpecViewer=function(){
  document.getElementById('kitchen-spec-viewer')?.remove();
  document.body.style.overflow='';
};

KitchenApp.printCurrentSpec=function(){
  const r=KitchenApp.recipeById(KitchenApp.specViewerRecipeId);
  if(!r)return;
  const body=`<main class="single-spec">${KitchenApp.specViewerPage(r)}</main>`;
  KitchenApp.printWindow(`${KitchenApp.customerFoodName(r.name)} — Spec ${r.page}`,body,`
    @page{size:A4;margin:12mm}.single-spec{max-width:186mm;margin:12mm auto}.ksv-paper{background:white;padding:14mm;border:1px solid #e1e4df}.ksv-page-head{display:flex;justify-content:space-between}.ksv-brand span{display:block;font-size:17px;letter-spacing:3px;font-weight:800;color:#435536}.ksv-brand b{font-family:Georgia,serif;color:#9c814d}.ksv-page-ref{text-align:right}.ksv-page-ref span{display:block;font-size:7px;letter-spacing:1.5px}.ksv-page-title{margin:18mm 0 8mm}.ksv-page-title>p{font-size:8px;letter-spacing:2px;color:#9c814d}.ksv-page-title h1{font-family:Georgia,serif;font-size:28px;color:#26362b}.ksv-page-title div{display:flex;gap:5px}.ksv-page-title div span{font-size:7px;border:1px solid #ccd1c8;border-radius:99px;padding:3px 6px}.ksv-section-label{font-size:7px;font-weight:800;letter-spacing:1.4px;color:#536a57;margin-bottom:4mm}.ksv-page-section table{width:100%;border-collapse:collapse;font-size:9px}.ksv-page-section th{text-align:left;background:#f1f3ef}.ksv-page-section th,.ksv-page-section td{padding:6px;border-bottom:1px solid #e5e7e3}.ksv-source{font-size:8px;margin-top:8mm}.ksv-page-footer{display:flex;justify-content:space-between;margin-top:15mm;padding-top:4mm;border-top:1px solid #e2e5df;font-size:7px;color:#8b928b}
  `);
};

KitchenApp.printFullSpecBook=function(){
  const cats=[...new Set(KitchenApp.recipes().map(r=>r.category))];
  const body=`<main class="specbook"><header><div class="brand"><span>THE GRANARY</span><b>at Windmill Farm</b></div><p>KITCHEN SPECIFICATION BOOK</p><h1>Events & Functions<br>Food Specification</h1><small>Controlled kitchen reference · ${new Date().toLocaleDateString('en-GB')}</small></header><section class="contents"><h2>Contents</h2>${cats.map(c=>`<div><b>${c}</b><span>${KitchenApp.recipes().filter(r=>r.category===c).length} specifications</span></div>`).join('')}</section>${cats.map(c=>`<section class="category"><h2>${c}</h2>${KitchenApp.recipes().filter(r=>r.category===c).map(r=>`<article><div class="rh"><div><small>SPEC ${r.page}</small><h3>${KitchenApp.customerFoodName(r.name)}</h3></div><strong>Serves ${r.serves}</strong></div><table><tr><th>Ingredient / Product</th><th>Quantity</th><th>Unit</th></tr>${(r.ingredients||[]).map(i=>`<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.unit}</td></tr>`).join('')}</table></article>`).join('')}</section>`).join('')}</main>`;
  KitchenApp.printWindow('The Granary — Kitchen Spec Book',body,`@page{size:A4;margin:12mm}.specbook{max-width:210mm;margin:auto;background:#fff}.specbook>header{min-height:270mm;padding:28mm 20mm;background:linear-gradient(145deg,#243027,#536548);color:#fff;display:flex;flex-direction:column;justify-content:center}.brand span{display:block;font-size:27px;letter-spacing:5px;font-weight:800}.brand b{font-family:Georgia,serif;color:#dccb92}.specbook header>p{margin-top:42px;font-size:11px;letter-spacing:3px;color:#dccb92}.specbook h1{font-family:Georgia,serif;font-size:42px}.contents,.category{padding:12mm 15mm}.contents{page-break-before:always}.contents h2,.category>h2{font-family:Georgia,serif;font-size:27px;color:#455a48;border-bottom:2px solid #c9b36d}.contents div{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7e3;font-size:12px}.category{page-break-before:always}.category article{border:1px solid #dfe3dd;border-radius:9px;padding:11px;margin:10px 0;break-inside:avoid}.rh{display:flex;justify-content:space-between}.rh small{font-size:8px;color:#8c7450}.rh h3{font-family:Georgia,serif;font-size:17px;margin:2px 0 8px}table{width:100%;border-collapse:collapse;font-size:9px}th{text-align:left;background:#f1f3ef}th,td{padding:5px;border-bottom:1px solid #e4e6e2}`);
};



KitchenApp.printFoodCards=function(){
  const recipes=(KitchenApp.printStudioSelected||[]).map(id=>KitchenApp.recipeById(id)).filter(Boolean);
  const category=KitchenApp.printStudioCategory;
  if(!recipes.length)return toast('Select at least one food option to print','error');

  const categoryLabel={
    'BBQ':'FROM THE BBQ',
    'Finger Buffet':'FINGER BUFFET',
    'Curry':'CURRY SELECTION',
    'Hog Roast':'HOG ROAST',
    'Breakfast Rolls':'BREAKFAST SELECTION',
    'Afternoon Tea':'AFTERNOON TEA',
    'Platters':'SHARING PLATTER',
    'Canapes':'CANAPÉ SELECTION',
    'Hot Rolls':'HOT ROLL SELECTION'
  }[category] || String(category||'MENU').toUpperCase();

  const sheets=[];
  for(let i=0;i<recipes.length;i+=4){
    const group=recipes.slice(i,i+4);
    while(group.length<4)group.push(null);
    sheets.push(`<section class="lux-sheet">${group.map(r=>{
      if(!r)return `<div class="lux-zone blank"></div>`;
      const tags=KitchenApp.dietaryTags(r.name);
      return `<div class="lux-zone">
        
        <div class="lux-support"><span>THE GRANARY · WINDMILL FARM</span></div>
        <div class="lux-face">
          <div class="lux-card">
            <i class="lux-corner tl"></i><i class="lux-corner tr"></i><i class="lux-corner bl"></i><i class="lux-corner br"></i>
            <div class="lux-monogram"><span>G</span></div>
            <div class="lux-brand"><strong>THE GRANARY</strong><span>AT WINDMILL FARM</span></div>
            <div class="lux-flourish"><i></i><b>◆</b><i></i></div>
            <div class="lux-category">${esc(categoryLabel)}</div>
            <h2>${esc(KitchenApp.customerFoodName(r.name))}</h2>
            ${tags.length?`<div class="lux-tags">${tags.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:`<div class="lux-tags spacer"></div>`}
            <div class="lux-foot"><span>LINCOLN</span><b>•</b><span>CELEBRATIONS AT THE GRANARY</span></div>
          </div>
        </div>
      </div>`;
    }).join('')}</section>`);
  }

  KitchenApp.printWindow(`${category} — The Granary Food Cards`,sheets.join(''),`
    @page{size:A4 portrait;margin:0}
    html,body{margin:0!important;padding:0!important;background:#fff!important}
    .lux-sheet{width:210mm;height:297mm;display:grid;grid-template-columns:105mm 105mm;grid-template-rows:148.5mm 148.5mm;page-break-after:always;overflow:hidden;background:#fff}
    .lux-sheet:last-child{page-break-after:auto}
    .lux-zone{position:relative;width:105mm;height:148.5mm;overflow:hidden;border-right:.22mm dashed #c7c9c3;border-bottom:.22mm dashed #c7c9c3;background:#fff}
    .lux-zone:nth-child(2n){border-right:0}.lux-zone:nth-child(n+3){border-bottom:0}.lux-zone.blank{background:#fff}
    .lux-support,.lux-face{position:absolute;left:0;width:100%;height:74.25mm}
    .lux-support{top:0;border-bottom:.12mm dotted #e3e5e0;background:#fff}
    .lux-support>span{position:absolute;top:8mm;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:4.3pt;letter-spacing:1.7pt;font-weight:700;color:#e0e1dc}
    
    .lux-face{bottom:0;padding:3.6mm;background:#f4f0e5}
    .lux-card{position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:5.5mm 7mm 4.5mm;background:
      radial-gradient(circle at 50% 45%,rgba(255,255,255,.98) 0 31%,rgba(250,248,240,.94) 72%),
      linear-gradient(135deg,#f7f3e8,#fff,#edf1e8);
      border:.35mm solid #bda55e;box-shadow:inset 0 0 0 .8mm #f9f7f0,inset 0 0 0 1.05mm rgba(67,83,62,.28)}
    .lux-card:before{content:"";position:absolute;inset:2.2mm;border:.16mm solid rgba(189,165,94,.52);pointer-events:none}
    .lux-corner{position:absolute;width:8mm;height:8mm;z-index:2}.lux-corner:before,.lux-corner:after{content:"";position:absolute;background:#596b58;opacity:.58}
    .lux-corner:before{width:7mm;height:.2mm}.lux-corner:after{height:7mm;width:.2mm}
    .lux-corner.tl{left:3.3mm;top:3.3mm}.lux-corner.tr{right:3.3mm;top:3.3mm;transform:rotate(90deg)}.lux-corner.br{right:3.3mm;bottom:3.3mm;transform:rotate(180deg)}.lux-corner.bl{left:3.3mm;bottom:3.3mm;transform:rotate(270deg)}
    .lux-monogram{width:9mm;height:9mm;border:.25mm solid #b99e51;border-radius:50%;display:grid;place-items:center;margin-bottom:1.6mm;color:#405444;background:#fffdf8}
    .lux-monogram span{font-family:Georgia,serif;font-size:9pt;font-style:italic;margin-left:-.4mm}
    .lux-brand strong{display:block;font-family:Georgia,serif;font-size:8.2pt;letter-spacing:2.15pt;font-weight:normal;color:#33483a}
    .lux-brand span{display:block;margin-top:.8mm;font-size:4.1pt;letter-spacing:2.1pt;font-weight:700;color:#9b8249}
    .lux-flourish{display:flex;align-items:center;gap:2mm;width:31mm;margin:2.7mm auto 2.3mm;color:#b4994f}.lux-flourish i{height:.18mm;background:#c8b77d;flex:1}.lux-flourish b{font-size:4.2pt;font-weight:normal}
    .lux-category{font-size:4.8pt;letter-spacing:1.9pt;font-weight:800;color:#788477}
    .lux-card h2{max-width:80mm;margin:1.7mm 0 1.7mm;font-family:Georgia,'Times New Roman',serif;font-size:15.8pt;line-height:1.02;font-weight:normal;color:#26392e}
    .lux-tags{height:5mm;display:flex;align-items:center;justify-content:center;gap:1.4mm}.lux-tags span{padding:.8mm 2mm;border:.18mm solid #b8beaF;border-radius:99px;font-size:4.3pt;letter-spacing:.55pt;text-transform:uppercase;color:#5d6d5d;background:#ffffff9c}.lux-tags.spacer{visibility:hidden}
    .lux-foot{position:absolute;bottom:4.2mm;left:8mm;right:8mm;display:flex;align-items:center;justify-content:center;gap:1.8mm;font-size:3.65pt;letter-spacing:.8pt;color:#9a9d95}.lux-foot b{font-size:3.2pt;color:#b79b4d}
    @media print{.lux-zone,.lux-card{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  `);
};
KitchenApp.renderPrintStudio=function(){const cats=KitchenApp.printableCategories();if(!cats.includes(KitchenApp.printStudioCategory))KitchenApp.printStudioCategory=cats[0]||'BBQ';const rows=KitchenApp.recipes().filter(r=>r.category===KitchenApp.printStudioCategory);if(!KitchenApp.printStudioSelected.length)KitchenApp.printStudioSelected=rows.map(r=>r.id);return `<div class="grid xl:grid-cols-[1fr_330px] gap-4"><section class="section-card"><div class="flex justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">CUSTOMER PRINT STUDIO</p><h3 class="text-xl font-bold">Customer Food Card Studio</h3><p class="text-sm text-gray-500">Create presentation-ready food cards for wedding meetings, buffets and event displays. Four premium cut-and-fold cards print on each A4 sheet.</p></div><button onclick="KitchenApp.printFoodCards()" class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Print Selected Cards</button></div><div class="flex flex-wrap gap-2 mt-5">${cats.map(c=>`<button onclick="KitchenApp.setPrintCategory('${KitchenApp.escapeAttr(c)}')" class="px-3 py-2 rounded-lg text-xs font-semibold ${KitchenApp.printStudioCategory===c?'bg-olive-700 text-white':'bg-cream-50 border'}">${esc(c)}</button>`).join('')}</div><div class="flex justify-between mt-5 pb-2 border-b"><b>${esc(KitchenApp.printStudioCategory)}</b><label class="text-xs"><input type="checkbox" checked onchange="KitchenApp.selectAllPrintRecipes(this.checked)"> Select all</label></div><div class="grid md:grid-cols-2 2xl:grid-cols-3 gap-3 mt-3">${rows.map(r=>`<label class="rounded-xl border p-3 flex gap-3"><input type="checkbox" ${KitchenApp.printStudioSelected.includes(r.id)?'checked':''} onchange="KitchenApp.togglePrintRecipe('${r.id}',this.checked)"><span><b class="block text-sm">${esc(KitchenApp.customerFoodName(r.name))}</b><small class="text-gray-400">Spec ${r.page}${KitchenApp.dietaryTags(r.name).length?' · '+KitchenApp.dietaryTags(r.name).join(' · '):''}</small></span></label>`).join('')}</div></section><aside class="space-y-4"><section class="section-card"><p class="text-xs font-bold tracking-widest text-gold-600">KITCHEN REFERENCE</p><h3 class="font-bold text-lg">Specification Book</h3><p class="text-xs text-gray-500 mt-2">Open the full specification as a clean A4 PDF-style document.</p><button onclick="KitchenApp.viewSpecBook()" class="mt-4 w-full px-4 py-2.5 bg-charcoal-900 text-white rounded-lg font-semibold">View / Save Spec Book PDF</button></section><section class="rounded-2xl p-5 bg-gradient-to-br from-olive-800 to-charcoal-900 text-white"><p class="text-xs font-bold text-gold-400">PREMIUM EVENT STATIONERY</p><p class="text-xs text-white/70 mt-2">Four professionally styled cards per A4. Cut on the discreet quarter guides and fold each card exactly in half. Designed to look like venue stationery — not a kitchen printout.</p></section></aside></div>`};
function renderKitchen() {
  return `<div class="bg-gradient-to-r from-charcoal-900 to-olive-800 text-white rounded-2xl p-5 mb-4"><div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-gold-400">KITCHEN</p><h2 class="text-2xl lg:text-3xl font-bold mt-1">Weekly Function & Order Builder</h2><p class="text-sm text-white/70 mt-2">Select the menu first, allocate actual covers, choose exact buffet items and print one combined weekly shopping list.</p></div><div class="flex gap-2 flex-wrap"><button onclick="KitchenApp.checkWeek()" class="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg font-semibold">Kitchen Check</button><button onclick="KitchenApp.printWeek()" class="px-4 py-2.5 bg-gold-500 text-white rounded-lg font-semibold">Print Kitchen Pack</button><button onclick="KitchenApp.clearWeek()" class="px-4 py-2.5 bg-red-500/20 border border-red-300/30 rounded-lg font-semibold">Clear Week</button></div></div></div><div class="flex gap-2 mb-4 flex-wrap"><button onclick="KitchenApp.setTab('builder')" class="px-4 py-2 rounded-lg text-sm font-semibold ${KitchenApp.activeTab==='builder'?'bg-olive-700 text-white':'bg-white border'}">Weekly Builder</button><button onclick="KitchenApp.setTab('recipes')" class="px-4 py-2 rounded-lg text-sm font-semibold ${KitchenApp.activeTab==='recipes'?'bg-olive-700 text-white':'bg-white border'}">Recipe Library</button><button onclick="KitchenApp.setTab('print-studio')" class="px-4 py-2 rounded-lg text-sm font-semibold ${KitchenApp.activeTab==='print-studio'?'bg-olive-700 text-white':'bg-white border'}">Print Studio</button></div>${KitchenApp.activeTab==='recipes'?KitchenApp.renderRecipes():KitchenApp.activeTab==='print-studio'?KitchenApp.renderPrintStudio():KitchenApp.renderBuilder()}`;
}
