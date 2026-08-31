// SALES OS 2.0 — PHASE 1: simplified operating architecture
if (!localStorage.getItem('windmill_sales_os_view')) SalesOS.view = 'today';

if (!SalesOS.crmModalLayerPatched && typeof openModal === 'function') {
  SalesOS.crmModalLayerPatched = true; SalesOS.originalOpenModal = openModal;
  openModal = function(...args){ const result=SalesOS.originalOpenModal.apply(this,args); setTimeout(()=>{[...document.body.querySelectorAll('.fixed.inset-0,[role="dialog"],.modal-overlay,.modal')].filter(x=>x.id!=='sales-os-root'&&x.offsetParent!==null).forEach(x=>(x.closest('.fixed')||x).style.zIndex='10050'); if(window.lucide)lucide.createIcons();},0); return result; };
}
SalesOS.focusMode=false;
SalesOS.toggleFocusMode=function(){SalesOS.focusMode=!SalesOS.focusMode;document.body.style.overflow=SalesOS.focusMode?'hidden':'';renderSection();};
SalesOS.viewAliases={mission:'today',calls:'today',database:'prospects',companies:'prospects',territory:'intelligence',markets:'intelligence',coach:'performance',manager:'performance',academy:'performance',showcase:'prospects'};
SalesOS.normaliseView=function(v){return SalesOS.viewAliases[v]||v||'today';};
SalesOS.setView=function(view){SalesOS.view=SalesOS.normaliseView(view);localStorage.setItem('windmill_sales_os_view',SalesOS.view);renderSection();};
SalesOS.openSalesSession=function(){
  SalesOS.view='today';
  localStorage.setItem('windmill_sales_os_view','today');
  const queue=SalesOS.queue().filter(lead=>lead.phone||lead.email).slice(0,15);
  SalesOS.sessionQueue=queue.map(lead=>lead.id);
  SalesOS.activeLeadId=queue[0]?.id||null;
  SalesOS.sessionOpen=true;
  renderSection();
  setTimeout(()=>{const el=document.getElementById('sales-os-session');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},50);
};
SalesOS.tabs=function(){
 const tabs=[['today','Today','crosshair'],['prospects','Prospects','building-2'],['pipeline','Pipeline','filter'],['intelligence','Intelligence','brain-circuit'],['performance','Performance','trophy']];
 SalesOS.view=SalesOS.normaliseView(SalesOS.view);
 return `<div class="sticky top-0 z-20 bg-[#f7f7f4]/95 backdrop-blur py-2 mb-4"><div class="rounded-2xl bg-white border border-gray-200 shadow-sm p-2 flex flex-col lg:flex-row gap-2 lg:items-center"><div class="grid grid-cols-5 gap-1 flex-1">${tabs.map(([id,label,icon])=>`<button onclick="SalesOS.setView('${id}')" class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${SalesOS.view===id?'bg-charcoal-900 text-white':'text-gray-600 hover:bg-olive-50'}"><i data-lucide="${icon}" style="width:15px;height:15px"></i><span>${label}</span></button>`).join('')}</div><button onclick="SalesOS.toggleFocusMode()" class="px-3 py-2.5 rounded-xl bg-olive-50 text-olive-800 text-xs font-semibold">${SalesOS.focusMode?'Exit Full Screen':'Full Screen'}</button></div></div>`;
};
SalesOS.renderProspects=function(){return SalesOS.renderDatabase();};
SalesOS.renderPerformanceHub=function(){return window.SalesOS?.renderPerformanceHQ?SalesOS.renderPerformanceHQ():'<div class="bg-white rounded-2xl border p-8 text-center text-gray-400">Performance workspace is loading…</div>';};
SalesOS.render=function(){
 const v=SalesOS.normaliseView(SalesOS.view);
 const body=v==='today'?SalesOS.renderMission():v==='prospects'?SalesOS.renderProspects():v==='pipeline'?SalesOS.renderPipeline():v==='intelligence'?SalesOS.renderIntelligence():v==='performance'?SalesOS.renderPerformanceHub():SalesOS.renderMission();
 const shellClass=SalesOS.focusMode?'fixed inset-0 z-[9000] overflow-y-auto overflow-x-hidden bg-[#f7f7f4] p-3 lg:p-5':'w-full max-w-full min-w-0 overflow-x-hidden';
 return `<div id="sales-os-root" class="${shellClass}"><style>#sales-os-root,#sales-os-root *{box-sizing:border-box}#sales-os-root>*{min-width:0;max-width:100%}#sales-os-root section,#sales-os-root article,#sales-os-root main,#sales-os-root aside,#sales-os-root div{min-width:0}#sales-os-root table{width:100%}#sales-os-root .overflow-x-auto{max-width:100%}#sales-os-root h1,#sales-os-root h2,#sales-os-root h3,#sales-os-root p,#sales-os-root span{overflow-wrap:anywhere}</style><div class="w-full max-w-[1500px] mx-auto min-w-0">${SalesOS.tabs()}<div class="w-full min-w-0 overflow-x-hidden">${body}</div></div></div>`;
};
