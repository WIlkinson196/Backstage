
// ============================================================================
// WINDMILL FARM — WEDDINGS / WORKSPACE
// Modular wedding workspace dispatcher.
// ============================================================================
window.WeddingWorkspace = window.WeddingWorkspace || {};

WeddingWorkspace.tabs = [
  ['overview','Overview','layout-dashboard'],
  ['quote','Quote','receipt'],
  ['pricing','Pricing','badge-pound-sterling'],
  ['planning','Planning','clipboard-check'],
  ['tasks','Tasks','list-checks'],
  ['payments','Payments','credit-card'],
  ['timeline','Timeline','history'],
  ['documents','Documents','files'],
  ['running-order','Running Order','clock-3'],
  ['seating','Seating','users'],
  ['floor-plan','Floor Plan','panels-top-left'],
  ['function-sheet','Function Sheet','file-text'],
  ['live','Live','radio']
];

WeddingWorkspace.renderTab=function(w,pct){
  if(activeWeddingTab==='pricing') return `<div class="bg-white rounded-xl border border-olive-100 p-5">${WeddingPricing.renderWeddingFinancialSummary(w)}</div>`;
  if(activeWeddingTab==='payments' && window.WeddingPayments) return WeddingPayments.render(w);
  if(activeWeddingTab==='timeline' && window.WeddingTimeline) return WeddingTimeline.render(w);
  if(activeWeddingTab==='documents' && window.WeddingDocuments) return WeddingDocuments.render(w);
  if(activeWeddingTab==='seating' && window.WeddingSeating) return WeddingSeating.render(w);
  return renderWeddingTab(w,pct);
};

window.renderWeddingWorkspace=function(){
  const w=DB.weddings.find(x=>x.id===activeWeddingId);
  const panel=document.getElementById('wedding-workspace-panel');
  if(!w||!panel)return;

  const pct=weddingProgress(w);
  panel.innerHTML=`<div class="min-h-full bg-[#f7f7f4]">
    <header class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div class="px-4 lg:px-7 py-3 flex flex-col gap-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <button onclick="closeWeddingWorkspace()" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium whitespace-nowrap">
              <i data-lucide="arrow-left" style="width:17px;height:17px"></i>Weddings
            </button>
            <div class="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap"><h1 class="text-xl lg:text-2xl font-bold text-charcoal-900 truncate">${esc(w.couple)}</h1><span class="badge ${weddingStatusColor(w.status)}">${esc(w.status)}</span></div>
              <p class="text-xs lg:text-sm text-gray-500 mt-0.5">${esc(w.date||'Date not set')} · ${weddingCountdown(w.date)} · ${esc(w.package)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <button onclick="WindmillComms.open('Wedding','${w.id}')" class="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"><i data-lucide="mail" style="width:16px;height:16px"></i>Communications</button>
            <button onclick="openWeddingRezlynxTransfer('${w.id}')" class="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"><i data-lucide="copy" style="width:16px;height:16px"></i>Copy to Rezlynx</button>
            <button onclick="openWeddingWorkspaceInNewWindow('${w.id}','${activeWeddingTab}')" class="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"><i data-lucide="external-link" style="width:16px;height:16px"></i>New Window</button>
            ${w.archivedAt
              ? `<button onclick="restoreWedding('${w.id}')" class="px-3 py-2 bg-olive-50 text-olive-700 rounded-lg text-sm font-medium">Restore</button>${isOwnerAccount()?`<button onclick="confirmPermanentWeddingDelete('${w.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">Delete Permanently</button>`:''}`
              : `<button onclick="openWeddingForm('${w.id}')" class="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">Edit Wedding</button><button onclick="openArchiveWeddingForm('${w.id}')" class="hidden lg:block px-3 py-2 bg-amber-50 text-amber-800 rounded-lg text-sm font-medium">Complete & Archive</button>`}
            <button onclick="closeWeddingWorkspace()" class="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close wedding"><i data-lucide="x"></i></button>
          </div>
        </div>
        <nav class="flex gap-1 overflow-x-auto -mx-1 px-1 pb-0.5">
          ${WeddingWorkspace.tabs.map(([id,label,icon])=>`<button onclick="setWeddingTab('${id}')" class="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition ${activeWeddingTab===id?'border-olive-700 text-olive-800 bg-olive-50/70':'border-transparent text-gray-500 hover:text-charcoal-900 hover:bg-gray-50'}"><i data-lucide="${icon}" style="width:15px;height:15px"></i>${label}</button>`).join('')}
        </nav>
      </div>
    </header>
    <div class="${activeWeddingTab==='floor-plan'?'p-3 lg:p-4':'p-4 lg:p-7'} max-w-[1800px] mx-auto">${WeddingWorkspace.renderTab(w,pct)}</div>
  </div>`;

  if(window.lucide)lucide.createIcons();
  if(activeWeddingTab==='timeline' && window.WeddingTimeline) WeddingTimeline.filter(w.id);
  if(activeWeddingTab==='documents' && window.WeddingDocuments) WeddingDocuments.filter(w.id);
  if(activeWeddingTab==='running-order') initialiseRunningOrderDrag(w.id);
  if(activeWeddingTab==='seating' && window.WeddingSeating) WeddingSeating.initialise(w.id);
  if(activeWeddingTab==='floor-plan') initialiseWeddingFloorPlanBuilder(w.id);
  if(activeWeddingTab==='live') initialiseWeddingLiveMode(w.id);
};
