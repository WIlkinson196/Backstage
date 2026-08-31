// Wedding System V2 — Phase 12 final non-destructive regression audit.
(function(){
  const V={build:'CRM-STABILISATION-P4-20260825'};
  const fn=name=>typeof window[name]==='function';
  const obj=name=>!!window[name];
  const check=(id,title,ok,detail,phase)=>({id,title,ok:!!ok,detail,phase});

  V.run=function(){
    const masterDocs=obj('GranaryDocumentSystemV2')&&typeof GranaryDocumentSystemV2.print==='function';
    const prepOperational=fn('printWeddingPrepList')&&fn('weddingPrepRows');
    const searchReady=obj('WindmillSearch')&&typeof WindmillSearch.find==='function'&&typeof WindmillSearch.open==='function';
    const checks=[
      check('planning','Planning & timing model',fn('weddingProfile')&&fn('planningData')&&fn('weddingMasterTimingRows'),'Wedding format, ceremony elsewhere and canonical reception timings are wired.',1),
      check('drinks','Drinks, music & consumption',obj('WeddingConsumptionRules')&&fn('renderMusicEntertainmentPlanningBody')&&fn('weddingPrepRows'),'Welcome/toast drinks, music and equipment calculations are loaded.',2),
      check('enquiry','Enquiry Lost workflow',fn('openLostReasonForm')&&obj('EnquiryActivity'),'Lost reason and enquiry activity engines are loaded.',3),
      check('calendar','Meeting/calendar clash guard',obj('WindmillCalendar')&&typeof WindmillCalendar.conflictSummary==='function','Calendar conflict detection and deliberate override are available.',4),
      check('running','Planning → Running Order',fn('syncWeddingRunningOrderFromPlanning')&&fn('weddingRunningOrderPlanSpecs'),'Planning-linked Running Order sync is available.',5),
      check('prep','Operational Prep List',prepOperational,'Prep calculations and the operational checklist renderer are available.',6),
      check('documents','Master wedding document route',masterDocs,'Customer/internal/handover documents have a master dispatch route.',7),
      check('customer','Customer Pack',obj('WeddingDocumentEngine')&&typeof WeddingDocumentEngine.printCustomerPack==='function','Customer Pack document engine is available.',8),
      check('internal','Internal documents',obj('WeddingInternalDocumentEngine'),'Full Function, Kitchen, Bar and Coordinator documents are loaded.',9),
      check('handover','DJ / Supplier handovers',obj('WeddingHandoverDocumentEngine'),'DJ and Supplier handover documents are loaded.',10),
      check('commercial','Opportunity → Function',fn('ensureFunctionFromOpportunity'),'Won Opportunity transfer engine is available.',11),
      check('closeout','Wedding closeout + archive',obj('WeddingCloseout')&&typeof WeddingCloseout.archiveAllowed==='function','Closeout gate controls archive.',12),
      check('kitchen','Kitchen calculation engine',obj('KitchenApp')&&typeof KitchenApp.calculate==='function'&&typeof KitchenApp.checkWeek==='function','Recipe, buffet and shopping-list calculation engine is available.',13),
      check('food','Wedding food service pack',fn('weddingFoodTotalsForTables')&&fn('weddingChefShortFoodName')&&fn('printWeddingFoodTotals'),'Table totals, chef aliases, overall totals and individual guest print are wired.',14),
      check('search','Global CRM search',searchReady,'Final live search owns lookup/navigation after legacy search code loads.',15),
      check('auth','Profile permission recovery',fn('retryCurrentUserProfile')&&fn('canAccessSettings'),'Profile retry and fail-closed Settings permissions are available.',16)
    ];
    const passed=checks.filter(x=>x.ok).length;
    return {build:V.build,checks,passed,total:checks.length,percent:Math.round(passed/checks.length*100),at:new Date().toISOString()};
  };

  V.wedding=function(weddingId){
    const w=(DB.weddings||[]).find(x=>x.id===weddingId);
    if(!w)return {checks:[],passed:0,total:0,percent:0};
    const p=fn('weddingProfile')?weddingProfile(w):{};
    const rows=fn('runningOrderFor')?runningOrderFor(weddingId):[];
    const quote=fn('latestWeddingQuote')?latestWeddingQuote(weddingId):null;
    const food=fn('weddingFoodChoiceTotals')?weddingFoodChoiceTotals(weddingId):{guests:0,dietary:0};
    const tables=fn('weddingFoodTotalsForTables')?weddingFoodTotalsForTables(weddingId):[];
    const closeout=obj('WeddingCloseout')?WeddingCloseout.status(w):null;
    const checks=[
      check('date','Wedding date',!!w.date,w.date||'Missing date',0),
      check('format','Wedding format',!!p.weddingFormat,p.weddingFormat||'Missing format',0),
      check('timings','Planning timings',fn('weddingMasterTimingRows')&&weddingMasterTimingRows(w).some(([,t])=>!!t),'At least one master timing recorded.',0),
      check('running','Running Order',rows.length>0,`${rows.length} Running Order items`,0),
      check('quote','Commercial quote',!!quote||Number(w.quotedValue||0)>0,quote?`Quote V${quote.version||1}`:`£${Number(w.quotedValue||0).toLocaleString()}`,0),
      check('food','Food/seating data',food.guests===0||tables.length>0,`${food.guests} guest records · ${tables.length} table groups · ${food.dietary} dietary notes`,0),
      check('documents','Document route',obj('GranaryDocumentSystemV2')&&typeof GranaryDocumentSystemV2.print==='function','Master wedding document route loaded.',0),
      check('closeout','Closeout engine',!!closeout,closeout?`${closeout.done}/${closeout.total} checks complete`:'Closeout unavailable',0)
    ];
    const passed=checks.filter(x=>x.ok).length;
    return {checks,passed,total:checks.length,percent:Math.round(passed/checks.length*100)};
  };

  V.render=function(){
    const r=V.run();
    return `<div class="space-y-4">
      <div class="rounded-xl bg-charcoal-900 text-white p-5 flex flex-wrap justify-between items-end gap-4"><div><p class="text-xs tracking-widest font-bold text-olive-300">CRM STABILISATION · FINAL QA</p><h3 class="text-xl font-bold mt-1">End-to-end wiring audit</h3><p class="text-sm text-gray-300 mt-1">Non-destructive system check covering wedding planning, documents, kitchen, sales transfer, search, permissions and closeout without changing bookings.</p></div><div class="text-right"><div class="text-3xl font-bold">${r.percent}%</div><div class="text-xs text-gray-300">${r.passed}/${r.total} system checks passing</div></div></div>
      <div class="grid md:grid-cols-2 gap-3">${r.checks.map(x=>`<div class="rounded-xl border ${x.ok?'border-green-200 bg-green-50':'border-red-200 bg-red-50'} p-4"><div class="flex gap-3"><span class="w-7 h-7 rounded-full ${x.ok?'bg-green-600':'bg-red-600'} text-white flex items-center justify-center font-bold text-xs">${x.phase}</span><div><strong class="text-sm">${x.title}</strong><p class="text-xs text-gray-600 mt-1">${x.detail}</p><p class="text-[11px] mt-2 font-bold ${x.ok?'text-green-700':'text-red-700'}">${x.ok?'PASS':'NEEDS ATTENTION'}</p></div></div></div>`).join('')}</div>
      <div class="rounded-xl border p-4 text-xs text-gray-500">Build: ${r.build} · Last run: ${new Date(r.at).toLocaleString('en-GB')} · This audit tests application wiring and data readiness. It does not perform destructive writes or report Supabase billing/quota.</div>
    </div>`;
  };
  V.refresh=function(){const el=document.getElementById('wedding-v2-regression');if(el){el.innerHTML=V.render();if(window.lucide)lucide.createIcons();}};
  window.WeddingV2Regression=V;
})();
// STABILISATION P4.1: ENQUIRY EVENT DATES ON CALENDAR — calendar.js now exposes active enquiry preferred dates with duplicate-demand warnings.
