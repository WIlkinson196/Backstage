// ============================================================================
// WEDDING V2 · PHASE 6 — PREP, EQUIPMENT & CONSUMPTION RULES
// One source of truth for drinks entitlements, food split validation,
// operational prep quantities and final wedding readiness.
// ============================================================================
(function(){
  const n=v=>Math.max(0,Number(v||0));
  const ceil=v=>Math.ceil(Number(v||0));
  const clean=v=>String(v||'').trim();
  const escv=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');

  const DRINK_RULES={
    Silver:{welcome:'Prosecco',toast:'Prosecco',welcomeGlassesPerBottle:6,toastGlassesPerBottle:6,beerPerGuest:1,wineMode:'glass',wineGlassesPerBottle:4,wineGlassMl:175},
    Gold:{welcome:'Prosecco',toast:'Prosecco',welcomeGlassesPerBottle:6,toastGlassesPerBottle:6,beerPerGuest:2,wineMode:'halfBottle'},
    Platinum:{welcome:'Champagne',toast:'Champagne',welcomeGlassesPerBottle:6,toastGlassesPerBottle:6,beerPerGuest:2,wineMode:'halfBottle'}
  };

  function drinksData(wedding){
    const r=typeof planningData==='function'?planningData(wedding.id,'reception'):{};
    const day=n(wedding.dayGuests);
    const children=n(r.drinksChildGuests);
    const adults=clean(r.drinksAdultGuests)!==''?n(r.drinksAdultGuests):Math.max(0,day-children);
    return {r,day,children,adults,packageName:r.drinksPackage||'None'};
  }

  function drinkUsesFlute(name){
    return /prosecco|champagne|orange juice|\boj\b/i.test(clean(name));
  }
  function drinkUsesWineGlass(name){
    return /\bwine\b|ros[eé]/i.test(clean(name))&&!drinkUsesFlute(name);
  }
  function drinkUsesBeerGlass(name){
    return /beer|lager|peroni|sol|desperados/i.test(clean(name));
  }
  function bespokeDrinkRows(value){
    return (Array.isArray(value)?value:[])
      .filter(x=>x&&clean(x.drink))
      .map(x=>({drink:clean(x.drink),quantity:n(x.quantity),notes:clean(x.notes)}));
  }
  function bespokeOccasion(rows,label){
    const total=rows.reduce((s,x)=>s+n(x.quantity),0);
    const flutes=rows.filter(x=>drinkUsesFlute(x.drink)).reduce((s,x)=>s+n(x.quantity),0);
    const wineGlasses=rows.filter(x=>drinkUsesWineGlass(x.drink)).reduce((s,x)=>s+n(x.quantity),0);
    const beerGlasses=rows.filter(x=>drinkUsesBeerGlass(x.drink)).reduce((s,x)=>s+n(x.quantity),0);
    const unknown=rows.filter(x=>/other|bespoke/i.test(x.drink)&&!clean(x.notes));
    return {label,rows,total,flutes,wineGlasses,beerGlasses,unknown};
  }

  function drinksCalculation(wedding){
    const {r,day,children,adults,packageName}=drinksData(wedding);
    const rule=DRINK_RULES[packageName]||null;

    // Bespoke drinks use the structured Phase 2 welcome/toast selections.
    if(packageName==='Bespoke'){
      const welcome=bespokeOccasion(bespokeDrinkRows(r.bespokeWelcomeDrinks),'Welcome');
      const toast=bespokeOccasion(bespokeDrinkRows(r.bespokeToastDrinks),'Toast');
      const issues=[];
      if(day>0&&adults+children!==day)issues.push(`Adult (${adults}) + child (${children}) drinks headcount is ${adults+children}, but day guests are ${day}.`);
      if(adults>0&&welcome.total!==adults)issues.push(`Bespoke welcome drinks total ${welcome.total}/${adults} adults.`);
      if(adults>0&&toast.total!==adults)issues.push(`Bespoke toast drinks total ${toast.total}/${adults} adults.`);
      if(!welcome.rows.length)issues.push('No bespoke welcome drinks have been added.');
      if(!toast.rows.length)issues.push('No bespoke toast drinks have been added.');
      [...welcome.unknown,...toast.unknown].forEach(()=>issues.push('An Other / Bespoke drink needs a note so the correct glassware can be prepared.'));

      const quantities={
        bespoke:true,
        welcomeRows:welcome.rows,
        toastRows:toast.rows,
        welcomeFlutes:welcome.flutes,
        toastFlutes:toast.flutes,
        totalFluteServices:welcome.flutes+toast.flutes,
        welcomeWineGlasses:welcome.wineGlasses,
        toastWineGlasses:toast.wineGlasses,
        welcomeBeerGlasses:welcome.beerGlasses,
        toastBeerGlasses:toast.beerGlasses,
        totalWineGlassServices:welcome.wineGlasses+toast.wineGlasses,
        totalBeerGlassServices:welcome.beerGlasses+toast.beerGlasses
      };
      return {
        rule:null,bespoke:true,packageName,day,adults,children,headcountTotal:adults+children,
        welcomeTotal:welcome.total,toastTotal:toast.total,welcome,toast,quantities,issues,
        complete:issues.length===0
      };
    }

    const beer=n(r.beerGuests),white=n(r.whiteWineGuests),red=n(r.redWineGuests),rose=n(r.roseWineGuests),soft=n(r.softDrinkGuests);
    const wineGuests=white+red+rose;
    const mealAllocated=beer+wineGuests+soft;
    const welcomeAlcohol=n(r.welcomeAlcoholGuests),welcomeSoft=n(r.welcomeSoftGuests),welcomeTotal=welcomeAlcohol+welcomeSoft;
    const toastAlcohol=n(r.toastAlcoholGuests),toastSoft=n(r.toastSoftGuests),toastTotal=toastAlcohol+toastSoft;
    const headcountTotal=adults+children;

    const beerName=clean(r.beerChoice)||'Peroni';
    const wineBottleQty=(count)=>{
      if(!rule)return 0;
      if(rule.wineMode==='halfBottle')return ceil(count/2);
      if(rule.wineMode==='glass')return ceil(count/(rule.wineGlassesPerBottle||4));
      return 0;
    };
    const quantities=rule?{
      welcomeAlcoholName:rule.welcome,
      welcomeAlcoholGlasses:welcomeAlcohol,
      welcomeAlcoholBottles:ceil(welcomeAlcohol/rule.welcomeGlassesPerBottle),
      welcomeSoftGuests:welcomeSoft,
      welcomeFlutes:welcomeAlcohol+welcomeSoft, // Prosecco/Champagne + OJ are served in flutes.
      toastAlcoholName:rule.toast,
      toastAlcoholGlasses:toastAlcohol,
      toastAlcoholBottles:ceil(toastAlcohol/rule.toastGlassesPerBottle),
      toastSoftGuests:toastSoft,
      toastFlutes:toastAlcohol+toastSoft, // Prosecco/Champagne + OJ are served in flutes.
      totalFluteServices:welcomeAlcohol+welcomeSoft+toastAlcohol+toastSoft,
      beerName,beerBottles:beer*rule.beerPerGuest,
      whiteWineBottles:wineBottleQty(white),
      redWineBottles:wineBottleQty(red),
      roseWineBottles:wineBottleQty(rose),
      mealSoftGuests:soft
    }:null;

    const issues=[];
    if(rule){
      if(day>0 && headcountTotal!==day)issues.push(`Adult (${adults}) + child (${children}) drinks headcount is ${headcountTotal}, but day guests are ${day}.`);
      if(adults>0 && welcomeTotal!==adults)issues.push(`Welcome drink split is ${welcomeTotal}/${adults} adults.`);
      if(adults>0 && toastTotal!==adults)issues.push(`Toast drink split is ${toastTotal}/${adults} adults.`);
      if(adults>0 && mealAllocated!==adults)issues.push(`Meal drinks split is ${mealAllocated}/${adults} adults.`);
      if(children>0 && !clean(r.childDrinkNotes))issues.push(`${children} child drinks are recorded but the child drink notes are empty.`);
    }
    return {rule,bespoke:false,packageName,day,adults,children,headcountTotal,beer,white,red,rose,soft,wineGuests,mealAllocated,welcomeAlcohol,welcomeSoft,welcomeTotal,toastAlcohol,toastSoft,toastTotal,beerName,quantities,issues,complete:!!rule&&issues.length===0};
  }

  function menuAllocationRule(service){
    const key=service?.menuKey||'';
    if(key==='bbq')return {mode:'portions',perCover:2,label:'BBQ mains',target:n(service.guests)*2};
    if(key==='curry')return {mode:'covers',perCover:1,label:'Curry portions',target:n(service.guests)};
    if(key==='hogRoast')return {mode:'covers',perCover:1,label:'Hog roast portions',target:n(service.guests)};
    if(key==='breakfast'||key==='hotRolls')return {mode:'covers',perCover:1,label:'Rolls',target:n(service.guests)};
    if(['fingerBuffet','afternoonTea','platters','canapes'].includes(key))return {mode:'selection',label:'Selected Kitchen items',target:null};
    if(key==='custom')return {mode:'custom',label:'Bespoke service',target:null};
    return {mode:'none',label:'Food allocation',target:null};
  }

  function serviceChoices(service){
    const def=typeof weddingKitchenMenus==='function'?weddingKitchenMenus()[service.menuKey]:null;
    return def?.choices||def?.recipes||[];
  }

  function foodServiceCalculation(service){
    const rule=menuAllocationRule(service);
    const allocations=service?.allocations||{};
    const choices=serviceChoices(service);
    const allocated=Object.values(allocations).reduce((s,v)=>s+n(v),0);
    const selectedCount=(service?.selectedIds||[]).length;
    const activeChoices=choices.filter(c=>n(allocations[c.id])>0).map(c=>({id:c.id,name:c.name,count:n(allocations[c.id])}));
    const issues=[];
    if(!n(service?.guests))issues.push('Covers are missing.');
    if(rule.mode==='portions'||rule.mode==='covers'){
      if(allocated!==rule.target)issues.push(`${rule.label} allocation is ${allocated}/${rule.target}.`);
    } else if(rule.mode==='selection' && selectedCount===0){
      issues.push('No Kitchen Specification items have been selected.');
    } else if(rule.mode==='custom' && !clean(service?.notes)){
      issues.push('Bespoke food details are empty.');
    }
    return {...rule,allocated,selectedCount,activeChoices,issues,complete:issues.length===0};
  }

  function foodCalculation(wedding){
    const r=typeof planningData==='function'?planningData(wedding.id,'reception'):{};
    let services=[];
    try{services=typeof ensureWeddingEveningServices==='function'?ensureWeddingEveningServices(wedding,r):(r.eveningFoodServices||[]);}catch(e){services=r.eveningFoodServices||[];}
    const structured=(services||[]).filter(s=>s&&s.menuKey);
    const results=structured.map(s=>({service:s,calc:foodServiceCalculation(s)}));
    const issues=results.flatMap(({service,calc},i)=>calc.issues.map(x=>`${service.menuLabel||service.menuKey||`Service ${i+1}`}: ${x}`));
    const guests=typeof weddingGuestsFor==='function'?weddingGuestsFor(wedding.id):[];
    const vegetarianCount=guests.filter(g=>/vegetarian|vegan|meatless|veggie/i.test(`${g.dietaryRequirements||''} ${g.mainChoice||''}`)).length;
    if(vegetarianCount>=10){
      results.forEach(({service,calc})=>{
        if(!['bbq','hogRoast'].includes(service.menuKey))return;
        const hasVeg=calc.activeChoices.some(x=>/vegetarian|vegan|meatless|veggie|skewer/i.test(x.name));
        if(!hasVeg)issues.push(`${service.menuLabel||service.menuKey}: ${vegetarianCount} vegetarian/vegan guests are recorded; add a vegetarian production split.`);
      });
    }
    return {services:results,issues,vegetarianCount,complete:results.length?issues.length===0:true};
  }

  function serviceUtensilCount(service){
    const calc=foodServiceCalculation(service);
    if(calc.mode==='selection')return Math.max(1,calc.selectedCount);
    if(calc.mode==='portions'||calc.mode==='covers')return Math.max(1,calc.activeChoices.length + (service?.selectedIds||[]).length);
    return 1;
  }

  function readiness(wedding){
    const profile=typeof weddingProfile==='function'?weddingProfile(wedding):{};
    const ceremony=typeof planningData==='function'?planningData(wedding.id,'ceremony'):{};
    const reception=typeof planningData==='function'?planningData(wedding.id,'reception'):{};
    const suppliers=typeof planningData==='function'?planningData(wedding.id,'suppliers'):{};
    const decor=typeof planningData==='function'?planningData(wedding.id,'decor'):{};
    const guests=typeof weddingGuestsFor==='function'?weddingGuestsFor(wedding.id):[];
    const tables=typeof seatingTablesFor==='function'?seatingTablesFor(wedding.id):[];
    const applicableTasks=typeof weddingTasksFor==='function'?weddingTasksFor(wedding.id):[];
    const drinks=drinksCalculation(wedding),food=foodCalculation(wedding);
    const checks=[];
    const add=(key,label,ok,detail,level='required')=>checks.push({key,label,ok:!!ok,detail,level});

    add('date','Wedding date',!!clean(wedding.date),clean(wedding.date)||'Not set');
    add('guests','Guest numbers',n(wedding.dayGuests)>0||n(wedding.eveningGuests)>0,`${n(wedding.dayGuests)} day / ${n(wedding.eveningGuests)} evening`);
    if(typeof weddingHasOnsiteCeremony==='function'&&weddingHasOnsiteCeremony(wedding)) add('ceremony','Ceremony time',!!clean(ceremony.ceremonyTime),clean(ceremony.ceremonyTime)||'Missing');
    if(profile.dayMealRequired!==false){
      add('meal','Wedding breakfast',!!clean(reception.weddingBreakfastMenu)&&reception.weddingBreakfastMenu!=='None',reception.weddingBreakfastMenu||'Not selected');
      const dayGuests=n(wedding.dayGuests), completeMeals=guests.filter(g=>clean(g.mainChoice)).length;
      add('guestFood','Guest main choices',dayGuests===0||completeMeals>=dayGuests,`${completeMeals}/${dayGuests} main choices entered`);
    }
    if(reception.drinksPackage&&reception.drinksPackage!=='None') add('drinks','Drinks allocation',drinks.complete,drinks.complete?'All package splits balance':drinks.issues.join(' '));
    if(profile.eveningFoodRequired!==false) add('eveningFood','Evening food allocation',food.complete,food.complete?'Kitchen service allocations complete':food.issues.join(' '));
    add('timings','Master timings',typeof weddingMasterTimingRows!=='function'||weddingMasterTimingRows(wedding).filter(([,t])=>clean(t)).length>=Math.max(1,weddingMasterTimingRows(wedding).length-1),typeof weddingMasterTimingRows==='function'?`${weddingMasterTimingRows(wedding).filter(([,t])=>clean(t)).length}/${weddingMasterTimingRows(wedding).length} timings set`:'Timings unavailable');
    add('seating','Seating / tables',n(wedding.dayGuests)===0||tables.length>0,tables.length?`${tables.length} tables created`:'No tables created','recommended');
    const balanceTask=applicableTasks.find(t=>/final balance paid/i.test(t.title||'')) || (DB.weddingTasks||[]).find(t=>t.weddingId===wedding.id&&/final balance paid/i.test(t.title||''));
    add('balance','Final balance',!balanceTask||!!balanceTask.completed,balanceTask?(balanceTask.completed?'Paid / task complete':'Final balance task not complete'):'No final balance task found','recommended');
    add('tasks','Applicable tasks',applicableTasks.every(t=>t.completed),`${applicableTasks.filter(t=>t.completed).length}/${applicableTasks.length} complete`,'recommended');
    if(profile.djRequired!==false)add('dj','DJ / entertainment',!!clean(suppliers.dj)||!!clean(suppliers.entertainment),suppliers.dj||suppliers.entertainment||'Not recorded','recommended');
    add('decor','Décor / styling',!!clean(decor.colourScheme)||!!clean(decor.decorNotes),decor.colourScheme||decor.decorNotes||'Not recorded','recommended');

    const required=checks.filter(c=>c.level==='required');
    const passed=required.filter(c=>c.ok).length;
    const pct=required.length?Math.round(passed/required.length*100):100;
    return {checks,required,passed,pct,ready:required.every(c=>c.ok),drinks,food};
  }

  function renderDrinksPlanner(wedding){
    const r=typeof planningData==='function'?planningData(wedding.id,'reception'):{};
    const calc=drinksCalculation(wedding);
    const pkg=r.drinksPackage||'None';
    const packageField=typeof renderPlanningField==='function'?renderPlanningField(wedding.id,'reception',['drinksPackage','Drinks package','select:None|Silver|Gold|Platinum|Bespoke'],pkg):'';
    if(pkg==='None'||!pkg)return `<div class="grid sm:grid-cols-2 gap-4">${packageField}<div class="rounded-lg bg-gray-50 border p-3 text-sm text-gray-500">Select a package to enter its allocation.</div></div>`;
    if(pkg==='Bespoke'){
      const q=calc.quantities||{};
      return `<div class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">${packageField}<div class="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900"><strong>Bespoke welcome & toast drinks are entered in the section above.</strong><br><span class="text-xs">This panel calculates Prep glassware directly from those selections.</span></div></div>
        <div id="phase8-drink-headcount-${wedding.id}" class="text-xs">${renderDrinksStatus(wedding)}</div>
        <div id="phase8-drinks-quantities-${wedding.id}">${renderDrinksQuantities(wedding)}</div>
      </div>`;
    }
    const number=(key,label,val)=>`<label class="block"><span class="text-xs font-medium text-gray-600">${label}</span><input type="number" min="0" step="1" value="${escv(val||'')}" oninput="updatePlanningDraft('${wedding.id}','reception','${key}',this.value);refreshPhase8Drinks('${wedding.id}')" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>`;
    const text=(key,label,val,ph='')=>`<label class="block"><span class="text-xs font-medium text-gray-600">${label}</span><input value="${escv(val||'')}" placeholder="${escv(ph)}" oninput="updatePlanningDraft('${wedding.id}','reception','${key}',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label>`;
    return `<div class="space-y-5">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${packageField}${number('drinksAdultGuests','Adults on package',calc.adults)}${number('drinksChildGuests','Children',calc.children)}${text('beerChoice','Beer choice',r.beerChoice||'Peroni','Peroni / Desperados / Sol')}</div>
      <div id="phase8-drink-headcount-${wedding.id}" class="text-xs">${renderDrinksStatus(wedding)}</div>
      <div class="grid lg:grid-cols-2 gap-4">
       <div class="rounded-xl border p-4"><p class="text-xs font-bold tracking-widest text-olive-600">WELCOME DRINK</p><p class="text-sm text-gray-500 mt-1">${pkg==='Platinum'?'Champagne':'Prosecco'} or orange juice · 125ml alcohol serve.</p><div class="grid grid-cols-2 gap-3 mt-3">${number('welcomeAlcoholGuests',pkg==='Platinum'?'Champagne guests':'Prosecco guests',r.welcomeAlcoholGuests)}${number('welcomeSoftGuests','Orange juice / soft guests',r.welcomeSoftGuests)}</div></div>
       <div class="rounded-xl border p-4"><p class="text-xs font-bold tracking-widest text-olive-600">TOAST DRINK</p><p class="text-sm text-gray-500 mt-1">${pkg==='Platinum'?'Champagne':'Prosecco'} or orange juice · entered separately from welcome.</p><div class="grid grid-cols-2 gap-3 mt-3">${number('toastAlcoholGuests',pkg==='Platinum'?'Champagne guests':'Prosecco guests',r.toastAlcoholGuests)}${number('toastSoftGuests','Orange juice / soft guests',r.toastSoftGuests)}</div></div>
      </div>
      <div class="rounded-xl border p-4"><p class="text-xs font-bold tracking-widest text-olive-600">MEAL DRINKS</p><p class="text-sm text-gray-500 mt-1">${pkg==='Silver'?'Each adult: 1 beer OR one 175ml glass of wine.':'Each adult: 2 beers OR ½ bottle of wine.'}</p><div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">${number('beerGuests',`${calc.beerName} guests`,r.beerGuests)}${number('whiteWineGuests','White wine guests',r.whiteWineGuests)}${number('redWineGuests','Red wine guests',r.redWineGuests)}${number('roseWineGuests','Rosé wine guests',r.roseWineGuests)}${number('softDrinkGuests','Soft-drink guests',r.softDrinkGuests)}</div></div>
      <label class="block"><span class="text-xs font-medium text-gray-600">Children's drinks notes</span><textarea rows="2" oninput="updatePlanningDraft('${wedding.id}','reception','childDrinkNotes',this.value)" placeholder="e.g. 6 Coke, 4 lemonade, 2 orange juice" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${escv(r.childDrinkNotes||'')}</textarea></label>
      <div id="phase8-drinks-quantities-${wedding.id}">${renderDrinksQuantities(wedding)}</div>
    </div>`;
  }

  function renderDrinksStatus(wedding){
    const c=drinksCalculation(wedding);
    if(!c.rule&&!c.bespoke)return '';
    const ok=c.issues.length===0;
    return `<div class="${ok?'bg-green-50 border-green-200 text-green-800':'bg-amber-50 border-amber-200 text-amber-900'} border rounded-lg p-3"><strong>${ok?'Drinks allocation complete.':'Drinks allocation needs attention.'}</strong>${c.issues.length?`<ul class="mt-1 list-disc ml-5">${c.issues.map(x=>`<li>${escv(x)}</li>`).join('')}</ul>`:''}</div>`;
  }

  function renderDrinksQuantities(wedding){
    const c=drinksCalculation(wedding),q=c.quantities;if(!q)return '';
    if(c.bespoke){
      const drinkList=(rows)=>rows.length?rows.map(x=>`${escv(x.quantity)} × ${escv(x.drink)}${x.notes?` (${escv(x.notes)})`:''}`).join('<br>'):'None entered';
      return `<div class="rounded-xl bg-charcoal-900 text-white p-4">
        <p class="text-xs tracking-widest text-olive-300 font-bold">CALCULATED PREP REQUIREMENT</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 text-sm">
          <div><span class="text-gray-300">Welcome flutes</span><strong class="block text-lg">${q.welcomeFlutes}</strong><small>Prosecco / Champagne / NA Prosecco / OJ</small></div>
          <div><span class="text-gray-300">Toast flutes</span><strong class="block text-lg">${q.toastFlutes}</strong><small>Prosecco / Champagne / NA Prosecco / OJ</small></div>
          <div><span class="text-gray-300">Total flute services</span><strong class="block text-lg">${q.totalFluteServices}</strong><small>${q.welcomeFlutes} welcome + ${q.toastFlutes} toast</small></div>
          <div><span class="text-gray-300">Other glass services</span><strong class="block text-lg">${q.totalWineGlassServices+q.totalBeerGlassServices}</strong><small>${q.totalWineGlassServices} wine · ${q.totalBeerGlassServices} beer</small></div>
        </div>
        <div class="grid md:grid-cols-2 gap-3 mt-4 text-xs text-gray-200"><div class="bg-white/10 rounded-lg p-3"><strong class="text-white">Welcome</strong><div class="mt-1">${drinkList(q.welcomeRows)}</div></div><div class="bg-white/10 rounded-lg p-3"><strong class="text-white">Toast</strong><div class="mt-1">${drinkList(q.toastRows)}</div></div></div>
      </div>`;
    }
    return `<div class="rounded-xl bg-charcoal-900 text-white p-4">
      <p class="text-xs tracking-widest text-olive-300 font-bold">CALCULATED BAR & PREP REQUIREMENT</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3 text-sm">
        <div><span class="text-gray-300">Welcome ${escv(q.welcomeAlcoholName)}</span><strong class="block text-lg">${q.welcomeAlcoholBottles} bottles</strong><small>${q.welcomeAlcoholGlasses} alcoholic serves</small></div>
        <div><span class="text-gray-300">Toast ${escv(q.toastAlcoholName)}</span><strong class="block text-lg">${q.toastAlcoholBottles} bottles</strong><small>${q.toastAlcoholGlasses} alcoholic serves</small></div>
        <div><span class="text-gray-300">Flute services</span><strong class="block text-lg">${q.totalFluteServices}</strong><small>${q.welcomeFlutes} welcome + ${q.toastFlutes} toast</small></div>
        <div><span class="text-gray-300">${escv(q.beerName)}</span><strong class="block text-lg">${q.beerBottles} bottles</strong><small>${c.beer} guests</small></div>
        <div><span class="text-gray-300">Wine bottles</span><strong class="block text-lg">${q.whiteWineBottles+q.redWineBottles+q.roseWineBottles}</strong><small>${q.whiteWineBottles} white · ${q.redWineBottles} red · ${q.roseWineBottles} rosé</small></div>
      </div>
    </div>`;
  }

  function refreshPhase8Drinks(weddingId){
    const w=(DB.weddings||[]).find(x=>x.id===weddingId);if(!w)return;
    const a=document.getElementById(`phase8-drink-headcount-${weddingId}`),b=document.getElementById(`phase8-drinks-quantities-${weddingId}`);
    if(a)a.innerHTML=renderDrinksStatus(w);
    if(b)b.innerHTML=renderDrinksQuantities(w);
  }

  function renderFoodAllocationStatus(service){
    const c=foodServiceCalculation(service);
    const ok=c.complete;
    return `<div data-phase8-food-status="${escv(service.id||'')}" class="mt-3 ${ok?'bg-green-50 border-green-200 text-green-800':'bg-amber-50 border-amber-200 text-amber-900'} border rounded-lg p-3 text-sm"><strong>${ok?'Allocation complete':'Allocation required'}</strong> · ${c.mode==='portions'||c.mode==='covers'?`${c.allocated}/${c.target} ${escv(c.label).toLowerCase()}`:c.mode==='selection'?`${c.selectedCount} Kitchen items selected`:'Check service details'}${c.issues.length?`<div class="mt-1">${c.issues.map(escv).join(' ')}</div>`:''}</div>`;
  }

  function renderReadiness(wedding){
    const r=readiness(wedding);
    return `<section class="rounded-xl border ${r.ready?'border-green-200 bg-green-50/40':'border-amber-200 bg-amber-50/40'} overflow-hidden">
      <div class="p-5 flex flex-wrap items-start justify-between gap-4"><div><p class="text-xs font-bold tracking-widest ${r.ready?'text-green-700':'text-amber-700'}">PHASE 8 · WEDDING READINESS</p><h3 class="font-bold text-lg mt-1">${r.ready?'Operationally ready':'Final checks still required'}</h3><p class="text-sm text-gray-600 mt-1">One check across planning, drinks, food allocations, timings and applicable wedding information.</p></div><div class="text-right"><strong class="text-3xl ${r.ready?'text-green-700':'text-amber-700'}">${r.pct}%</strong><p class="text-xs text-gray-500">${r.passed}/${r.required.length} required checks</p></div></div>
      <div class="border-t p-4 grid md:grid-cols-2 gap-2">${r.checks.map(c=>`<div class="rounded-lg bg-white border p-3 flex gap-3"><span class="${c.ok?'text-green-600':'text-amber-600'} font-bold">${c.ok?'✓':'!'}</span><div><strong class="text-sm">${escv(c.label)}</strong><p class="text-xs text-gray-500 mt-1">${escv(c.detail)}</p>${c.level==='recommended'?'<span class="text-[10px] text-gray-400">Recommended check</span>':''}</div></div>`).join('')}</div>
    </section>`;
  }

  window.WeddingConsumptionRules={DRINK_RULES,drinksCalculation,drinkUsesFlute,drinkUsesWineGlass,drinkUsesBeerGlass,foodServiceCalculation,foodCalculation,serviceUtensilCount,readiness,renderDrinksPlanner,renderDrinksStatus,renderDrinksQuantities,renderFoodAllocationStatus,renderReadiness};
  window.refreshPhase8Drinks=refreshPhase8Drinks;
})();
