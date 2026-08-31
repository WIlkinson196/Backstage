// ============================================================================
// PHASE 12 — WEDDING CLOSEOUT & FINAL QA
// Final Weddings-module phase: post-event closeout, handover checks and archive
// guard. Uses existing planning JSON and existing archive workflow.
// ============================================================================
(function(){
  const e=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
  const clean=v=>String(v||'').trim();

  const CHECKS=[
    ['eventDelivered','Wedding/event delivered'],
    ['finalBalanceChecked','Final balance checked / reconciled'],
    ['incidentChecked','Incidents / complaints recorded where applicable'],
    ['lostPropertyChecked','Lost property / couple belongings checked'],
    ['supplierItemsChecked','Supplier / décor items returned or collected'],
    ['documentsChecked','Final paperwork / documents reviewed'],
    ['followUpSent','Couple follow-up / thank-you sent'],
    ['reviewRequested','Review / feedback requested'],
    ['bedroomsChecked','Bedroom / accommodation follow-up checked'],
    ['handoverComplete','Internal handover and outstanding actions complete']
  ];

  function rec(weddingId){return typeof planningRecord==='function'?planningRecord(weddingId,'closeout'):null;}
  function data(weddingId){return typeof planningData==='function'?planningData(weddingId,'closeout'):{};}
  function applicable(wedding){
    const p=typeof weddingProfile==='function'?weddingProfile(wedding):{};
    return CHECKS.filter(([k])=>!(k==='bedroomsChecked'&&p.accommodationRequired===false));
  }
  function status(wedding){
    const d=data(wedding.id),checks=applicable(wedding);
    const done=checks.filter(([k])=>!!d[k]).length;
    const balance=typeof weddingBalance==='function'?Number(weddingBalance(wedding)||0):0;
    const incompleteRunning=typeof runningOrderFor==='function'?runningOrderFor(wedding.id).filter(x=>!x.completed):[];
    const outstandingTasks=(DB.weddingTasks||[]).filter(x=>x.weddingId===wedding.id&&!x.completed);
    const unresolvedFollowUp=!!clean(d.followUp);
    const requiredComplete=done===checks.length;
    return {
      data:d,checks,done,total:checks.length,
      pct:checks.length?Math.round(done/checks.length*100):100,
      balance,incompleteRunning,outstandingTasks,unresolvedFollowUp,
      ready:requiredComplete&&balance<=0&&!unresolvedFollowUp
    };
  }

  function render(wedding){
    const s=status(wedding);
    return `<div class="space-y-4">
      <section class="rounded-xl bg-charcoal-900 text-white p-6"><p class="text-xs font-bold tracking-widest text-olive-300">PHASE 12 · WEDDING CLOSEOUT</p><div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><h2 class="text-2xl font-bold mt-1">Finish the wedding properly.</h2><p class="text-sm text-gray-300 mt-2 max-w-3xl">A final post-event checklist before the wedding leaves the active pipeline. Nothing is deleted; archive remains the long-term record.</p></div><div class="text-right"><div class="text-3xl font-bold">${s.pct}%</div><div class="text-xs text-gray-300">${s.done}/${s.total} closeout checks</div></div></div></section>

      ${s.balance>0?`<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"><strong>Outstanding balance: £${s.balance.toLocaleString()}</strong><p class="text-sm mt-1">Closeout cannot be marked ready to archive while the wedding has an outstanding balance.</p></div>`:''}
      ${s.unresolvedFollowUp?`<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><strong>Outstanding follow-up is still recorded.</strong><p class="text-sm mt-1">Clear the Outstanding follow-up box once the action has genuinely been resolved. Closeout cannot complete while unresolved follow-up remains.</p></div>`:''}
      <section class="grid sm:grid-cols-3 gap-3">
        <div class="rounded-xl border p-4"><p class="text-xs text-gray-500">Running-order events</p><p class="text-2xl font-bold mt-1">${s.incompleteRunning.length}</p><p class="text-xs text-gray-400">still incomplete</p></div>
        <div class="rounded-xl border p-4"><p class="text-xs text-gray-500">Wedding tasks</p><p class="text-2xl font-bold mt-1">${s.outstandingTasks.length}</p><p class="text-xs text-gray-400">still outstanding</p></div>
        <div class="rounded-xl border p-4"><p class="text-xs text-gray-500">Archive status</p><p class="text-lg font-bold mt-1 ${s.ready?'text-green-700':'text-amber-700'}">${s.ready?'Ready after completion':'Not ready yet'}</p><p class="text-xs text-gray-400">closeout controls archive</p></div>
      </section>

      <form onsubmit="WeddingCloseout.save(event,'${wedding.id}')" class="bg-white rounded-xl border border-olive-100 p-5 space-y-5">
        <div><h3 class="font-bold text-lg">Post-event checks</h3><p class="text-sm text-gray-500 mt-1">Tick these after the event as each area has genuinely been checked.</p></div>
        <div class="grid md:grid-cols-2 gap-3">${s.checks.map(([k,label])=>`<label class="flex gap-3 items-start border rounded-lg p-3 ${s.data[k]?'bg-green-50 border-green-200':'bg-white'}"><input type="checkbox" name="${k}" ${s.data[k]?'checked':''} class="mt-1"><span><strong class="text-sm">${e(label)}</strong></span></label>`).join('')}</div>
        <div class="grid md:grid-cols-2 gap-4">
          <label class="block"><span class="text-xs font-medium text-gray-600">Post-wedding notes</span><textarea name="notes" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Anything worth retaining on the wedding record...">${e(s.data.notes||'')}</textarea></label>
          <label class="block"><span class="text-xs font-medium text-gray-600">Outstanding follow-up</span><textarea name="followUp" rows="5" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Refund, complaint, supplier collection, guest query, etc.">${e(s.data.followUp||'')}</textarea></label>
        </div>
        <div class="flex flex-wrap justify-between items-center gap-3 border-t pt-4"><p class="text-xs text-gray-500">${s.data.completedAt?`Closeout completed ${new Date(s.data.completedAt).toLocaleString('en-GB')} by ${e(s.data.completedBy||'Not recorded')}`:'Closeout not yet completed.'}</p><div class="flex gap-2"><button type="submit" name="action" value="save" class="px-4 py-2 bg-gray-100 rounded-lg font-medium">Save Closeout</button><button type="submit" name="action" value="complete" ${!s.ready?'disabled':''} class="px-4 py-2 rounded-lg font-semibold ${s.ready?'bg-olive-600 text-white':'bg-gray-200 text-gray-400 cursor-not-allowed'}">Complete Closeout</button></div></div>
      </form>

      <section class="rounded-xl border ${s.data.completedAt?'border-green-200 bg-green-50':'border-amber-200 bg-amber-50'} p-5"><p class="text-xs font-bold tracking-widest ${s.data.completedAt?'text-green-700':'text-amber-800'}">ARCHIVE HANDOVER</p><h3 class="font-bold text-lg mt-1">${s.data.completedAt?'Wedding is ready to archive':'Complete the closeout first'}</h3><p class="text-sm text-gray-600 mt-1">${s.data.completedAt?'The existing Complete & Archive workflow can now move this wedding out of the active pipeline while retaining its planning, payments, timeline and documents.':'The wedding stays fully active and editable until closeout is completed.'}</p>${s.data.completedAt?`<button onclick="openArchiveWeddingForm('${wedding.id}')" class="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold">Complete & Archive Wedding</button>`:''}</section>
    </div>`;
  }

  async function save(event,weddingId){
    event.preventDefault();
    const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);if(!wedding)return;
    const f=new FormData(event.target),existing=rec(weddingId),current={...(existing?.data||data(weddingId)||{})};
    const next={...current};
    applicable(wedding).forEach(([k])=>next[k]=f.get(k)==='on');
    next.notes=f.get('notes')||'';
    next.followUp=f.get('followUp')||'';
    next.updatedAt=new Date().toISOString();
    const action=f.get('action');
    const preview={...status(wedding),data:next};
    const allChecks=applicable(wedding).every(([k])=>next[k]);
    if(action==='complete'){
      const balance=typeof weddingBalance==='function'?Number(weddingBalance(wedding)||0):0;
      if(!allChecks||balance>0||clean(next.followUp)){toast('Closeout is not ready — complete all checks, clear any balance and resolve outstanding follow-up','error');return;}
      next.completedAt=new Date().toISOString();
      next.completedBy=wedding.coordinator||current.completedBy||'Not recorded';
    }
    const payload={wedding_id:weddingId,section:'closeout',data:next,updated_at:new Date().toISOString()};
    const result=existing?await supabaseClient.from('wedding_planning').update(payload).eq('id',existing.id):await supabaseClient.from('wedding_planning').insert(payload);
    if(result.error){console.error(result.error);toast('Wedding closeout could not be saved','error');return;}
    if(typeof addWeddingTimelineEntry==='function')await addWeddingTimelineEntry(weddingId,'Wedding',action==='complete'?'Wedding closeout completed':'Wedding closeout updated',next.followUp||next.notes||'');
    await loadWeddingsFromSupabase();renderWeddingWorkspace();toast(action==='complete'?'Wedding closeout completed':'Closeout saved');
  }

  function archiveAllowed(wedding){
    const s=status(wedding);
    return !!s.data.completedAt && s.balance<=0 && !s.unresolvedFollowUp;
  }
  function archiveBlockers(wedding){
    const s=status(wedding),blocks=[];
    if(!s.data.completedAt)blocks.push('Wedding Closeout has not been completed');
    if(s.balance>0)blocks.push(`Outstanding balance £${s.balance.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}`);
    if(s.unresolvedFollowUp)blocks.push('Outstanding follow-up is still recorded');
    return blocks;
  }

  window.WeddingCloseout={render,save,status,archiveAllowed,archiveBlockers};
})();
