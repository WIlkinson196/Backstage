// ============================================================================
// PHASE 11 — GENERATED DOCUMENT HISTORY & VERSION REGISTER
// Records CRM-generated customer/operational documents in existing
// wedding_planning JSON. Uploaded source documents remain in wedding_documents.
// ============================================================================
(function(){
  const e=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
  const clean=v=>String(v||'').trim();

  const LABELS={
    proposal:'Wedding Proposal',
    customerPack:'Customer Wedding Pack',
    full:'Full Function Sheet',
    kitchen:'Kitchen Copy',
    bar:'Bar Copy',
    coordinator:'Coordinator Copy',
    prep:'Wedding Prep List',
    dj:'DJ Handover',
    supplier:'Supplier Handover'
  };

  function record(weddingId){
    return typeof planningRecord==='function'?planningRecord(weddingId,'documentHistory'):null;
  }
  function history(weddingId){
    const data=typeof planningData==='function'?planningData(weddingId,'documentHistory'):{};
    return Array.isArray(data.entries)?[...data.entries].sort((a,b)=>String(b.generatedAt||'').localeCompare(String(a.generatedAt||''))):[];
  }
  function nextVersion(weddingId,type){
    const rows=history(weddingId).filter(x=>x.type===type);
    return rows.length?Math.max(...rows.map(x=>Number(x.version||0)))+1:1;
  }
  function currentIssueVersion(weddingId){
    const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);
    if(!wedding)return 1;
    const s=window.WeddingFinalisation?.state?WeddingFinalisation.state(wedding):null;
    return Number(s?.meta?.issuedVersion||s?.currentVersion||1);
  }
  function latestQuoteVersion(weddingId){
    if(typeof quotesForWedding!=='function')return 1;
    const rows=quotesForWedding(weddingId);
    return Number(rows?.[0]?.version||1);
  }

  async function add(weddingId,type,extra={}){
    const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);if(!wedding)return;
    const existing=record(weddingId);
    const current={...(existing?.data||(typeof planningData==='function'?planningData(weddingId,'documentHistory'):{})||{})};
    const entries=Array.isArray(current.entries)?[...current.entries]:[];
    const version=extra.version||(
      type==='proposal'?latestQuoteVersion(weddingId):
      ['full','kitchen','bar','coordinator'].includes(type)?currentIssueVersion(weddingId):
      nextVersion(weddingId,type)
    );
    const finalState=window.WeddingFinalisation?.state?WeddingFinalisation.state(wedding):null;
    entries.push({
      id:`doc-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      type,
      label:LABELS[type]||type,
      version:Number(version||1),
      generatedAt:new Date().toISOString(),
      generatedBy:clean(wedding.coordinator)||clean(extra.generatedBy)||'Not recorded',
      controlled:!!extra.controlled,
      issueVersion:extra.issueVersion||(['full','kitchen','bar','coordinator'].includes(type)?currentIssueVersion(weddingId):null),
      issueCurrent:extra.controlled?!!(finalState?.issued&&!finalState?.changed):null,
      note:extra.note||''
    });
    // Keep a useful audit trail without unbounded JSON growth.
    const data={...current,entries:entries.slice(-250),updatedAt:new Date().toISOString()};
    const payload={wedding_id:weddingId,section:'documentHistory',data,updated_at:new Date().toISOString()};
    const result=existing
      ? await supabaseClient.from('wedding_planning').update(payload).eq('id',existing.id)
      : await supabaseClient.from('wedding_planning').insert(payload);
    if(result.error){console.warn('Document history could not be recorded',result.error);return;}
    if(typeof addWeddingTimelineEntry==='function'){
      await addWeddingTimelineEntry(weddingId,'Document',`${LABELS[type]||type} generated`,`Version ${version}`);
    }
    // Keep local planning cache usable without forcing a full reload before print.
    if(typeof weddingPlanningDrafts!=='undefined')delete weddingPlanningDrafts[`${weddingId}:documentHistory`];
  }

  function controlledCurrent(row,wedding){
    if(!row.controlled)return null;
    const s=window.WeddingFinalisation?.state?WeddingFinalisation.state(wedding):null;
    if(!s?.issued)return false;
    return Number(row.issueVersion||row.version||0)===Number(s.meta?.issuedVersion||0) && !s.changed;
  }
  function typeBadge(row,wedding){
    if(row.controlled){
      const current=controlledCurrent(row,wedding);
      const cls=current?'bg-green-100 text-green-800':'bg-red-100 text-red-800';
      return `<span class="badge ${cls}">${current?'Controlled issue':'Superseded issue'}</span>`;
    }
    return `<span class="badge bg-olive-100 text-olive-800">Generated</span>`;
  }

  function render(wedding){
    const rows=history(wedding.id);
    const byType={};
    rows.forEach(r=>{byType[r.type]=byType[r.type]||[];byType[r.type].push(r);});
    const latest=Object.values(byType).map(arr=>arr[0]).sort((a,b)=>String(b.generatedAt).localeCompare(String(a.generatedAt)));
    return `<section class="bg-white rounded-xl border border-olive-100 overflow-hidden">
      <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-olive-100">
        <div><p class="text-xs font-bold tracking-widest text-olive-600">PHASE 11 · DOCUMENT REGISTER</p><h3 class="font-bold text-lg mt-1">Generated Document History</h3><p class="text-sm text-gray-500 mt-1">An audit trail of proposals, customer packs and operational sheets generated from this wedding.</p></div>
        <span class="badge bg-gray-100 text-gray-700">${rows.length} generation${rows.length===1?'':'s'} logged</span>
      </div>
      ${latest.length?`<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-3 p-5">${latest.map(row=>{
        const count=byType[row.type].length;
        return `<div class="rounded-xl border p-4"><div class="flex items-start justify-between gap-3"><div><strong>${e(row.label)}</strong><p class="text-xs text-gray-500 mt-1">Latest: Version ${Number(row.version||1)}</p></div>${typeBadge(row,wedding)}</div>
        <p class="text-xs text-gray-500 mt-3">${new Date(row.generatedAt).toLocaleString('en-GB')} · ${e(row.generatedBy)}</p><p class="text-[11px] text-gray-400 mt-1">${count} recorded generation${count===1?'':'s'}</p></div>`;
      }).join('')}</div>`:'<div class="p-6 text-sm text-gray-500">No CRM-generated documents have been logged yet. Printing a proposal, customer pack or operational sheet will create the first history entry.</div>'}
      ${rows.length?`<details class="border-t"><summary class="cursor-pointer p-4 text-sm font-semibold hover:bg-gray-50">View full generation history</summary><div class="overflow-x-auto px-5 pb-5"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-gray-500 border-b"><th class="py-2">Document</th><th>Version</th><th>Generated</th><th>By</th><th>Status</th></tr></thead><tbody>${rows.map(row=>`<tr class="border-b border-gray-100"><td class="py-2 font-medium">${e(row.label)}</td><td>V${Number(row.version||1)}</td><td>${new Date(row.generatedAt).toLocaleString('en-GB')}</td><td>${e(row.generatedBy)}</td><td>${typeBadge(row,wedding)}</td></tr>`).join('')}</tbody></table></div></details>`:''}
    </section>`;
  }

  function wrap(){
    if(window.__phase11DocumentHistoryWrapped)return;
    window.__phase11DocumentHistoryWrapped=true;

    // The stabilised Granary Document System records history centrally inside DS.print().
    // Do not wrap its final entry points again or each print would be logged twice.
    if(window.GranaryDocumentSystemV2?.historyManaged)return;

    const proposal=window.printWeddingQuote;
    if(typeof proposal==='function')window.printWeddingQuote=function(weddingId){
      add(weddingId,'proposal',{version:latestQuoteVersion(weddingId)});
      return proposal.apply(this,arguments);
    };

    const pack=window.printWeddingCustomerPack;
    if(typeof pack==='function')window.printWeddingCustomerPack=function(weddingId){
      add(weddingId,'customerPack');
      return pack.apply(this,arguments);
    };

    const sheet=window.printWeddingFunctionSheet;
    if(typeof sheet==='function')window.printWeddingFunctionSheet=function(weddingId,copyType='full'){
      const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);
      const finalState=wedding&&window.WeddingFinalisation?.state?WeddingFinalisation.state(wedding):null;
      add(weddingId,copyType,{controlled:!!finalState?.issued,issueVersion:currentIssueVersion(weddingId)});
      return sheet.apply(this,arguments);
    };

    const prep=window.printWeddingPrepList;
    if(typeof prep==='function')window.printWeddingPrepList=function(weddingId){
      add(weddingId,'prep');
      return prep.apply(this,arguments);
    };
  }

  window.WeddingDocumentHistory={history,add,render,wrap};
  // Loaded after the final wedding document dispatcher; wrap() remains as a legacy fallback only.
  wrap();
})();
