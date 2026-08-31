// ============================================================================
// PHASE 9 — FINALISATION, ISSUE CONTROL & CHANGE TRACKING
// Turns readiness into a controlled "final issue" workflow without deleting
// or locking the existing editable planning system.
// ============================================================================
(function(){
  const escv=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
  const clean=v=>String(v||'').trim();

  function planningFingerprint(wedding){
    const sections=['profile','ceremony','reception','music','decor','suppliers','bedrooms'];
    const planning=Object.fromEntries(sections.map(s=>[s,typeof planningData==='function'?planningData(wedding.id,s):{}]));
    const guests=(typeof weddingGuestsFor==='function'?weddingGuestsFor(wedding.id):[]).map(g=>({
      id:g.id,name:g.guestName,tableId:g.tableId,starter:g.starterChoice,main:g.mainChoice,dessert:g.dessertChoice,
      evening:g.eveningFoodChoice,dietary:g.dietaryRequirements,access:g.accessibilityNotes
    })).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
    const tables=(typeof seatingTablesFor==='function'?seatingTablesFor(wedding.id):[]).map(t=>({id:t.id,name:t.tableName,capacity:t.capacity})).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
    const run=(typeof runningOrderFor==='function'?runningOrderFor(wedding.id):[]).map(x=>({time:x.startTime,title:x.title,responsible:x.responsible,location:x.location,notes:x.notes})).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
    return JSON.stringify({wedding:{date:wedding.date,dayGuests:wedding.dayGuests,eveningGuests:wedding.eveningGuests,package:wedding.package,coordinator:wedding.coordinator},planning,guests,tables,run});
  }

  function meta(weddingId){
    const sheet=typeof functionSheetFor==='function'?functionSheetFor(weddingId):null;
    let parsed={};
    try{
      const raw=sheet?.operationalNotes||'';
      const m=raw.match(/\n?\[\[PHASE9:(.*?)\]\]\s*$/s);
      if(m)parsed=JSON.parse(m[1]);
    }catch(e){}
    return {issuedAt:parsed.issuedAt||'',issuedBy:parsed.issuedBy||'',issuedVersion:Number(parsed.issuedVersion||0),fingerprint:parsed.fingerprint||'',issueNote:parsed.issueNote||''};
  }

  function visibleOperationalNotes(sheet){
    return String(sheet?.operationalNotes||'').replace(/\n?\[\[PHASE9:.*?\]\]\s*$/s,'').trim();
  }

  function state(wedding){
    const readiness=window.WeddingConsumptionRules?.readiness?WeddingConsumptionRules.readiness(wedding):{ready:false,pct:0,checks:[]};
    const m=meta(wedding.id);
    const current=planningFingerprint(wedding);
    const issued=!!m.issuedAt;
    const changed=issued&&!!m.fingerprint&&m.fingerprint!==current;
    return {readiness,meta:m,current,issued,changed,currentVersion:Number((typeof functionSheetFor==='function'?functionSheetFor(wedding.id):null)?.version||1)};
  }

  async function issue(weddingId){
    const wedding=(DB.weddings||[]).find(x=>x.id===weddingId);if(!wedding)return;
    const s=state(wedding);
    if(!s.readiness.ready){
      toast(`Cannot issue final sheets — readiness is ${s.readiness.pct}%`,'error');
      return;
    }
    const who=prompt('Who is issuing the final wedding sheets?',wedding.coordinator||'');
    if(who===null)return;
    const issueNote=prompt('Issue note (optional)',s.changed?'Re-issued after planning changes':'Final operational issue')??'';
    const sheet=typeof functionSheetFor==='function'?functionSheetFor(weddingId):null;
    const nextVersion=s.issued?Math.max(s.currentVersion+1,s.meta.issuedVersion+1):Math.max(1,s.currentVersion);
    const metadata={issuedAt:new Date().toISOString(),issuedBy:clean(who)||'Not recorded',issuedVersion:nextVersion,fingerprint:s.current,issueNote};
    const baseNotes=visibleOperationalNotes(sheet);
    const operational_notes=`${baseNotes}${baseNotes?'\n':''}[[PHASE9:${JSON.stringify(metadata)}]]`;
    const record={wedding_id:weddingId,version:nextVersion,prepared_by:sheet?.preparedBy||null,approved_by:sheet?.approvedBy||clean(who)||null,emergency_contact:sheet?.emergencyContact||null,operational_notes,updated_at:new Date().toISOString(),generated_at:new Date().toISOString()};
    const result=sheet?await supabaseClient.from('wedding_function_sheets').update(record).eq('id',sheet.id):await supabaseClient.from('wedding_function_sheets').insert(record);
    if(result.error){console.error(result.error);toast('Final issue could not be saved','error');return;}
    if(typeof addWeddingTimelineEntry==='function')await addWeddingTimelineEntry(weddingId,'Planning',s.issued?'Wedding sheets re-issued':'Wedding sheets issued',`Version ${nextVersion} · ${metadata.issuedBy}${issueNote?` · ${issueNote}`:''}`);
    await loadWeddingsFromSupabase();
    if(typeof renderWeddingWorkspace==='function')renderWeddingWorkspace();
    toast(`Final operational sheets issued as Version ${nextVersion}`);
  }

  function render(wedding){
    const s=state(wedding);
    const cls=!s.issued?'border-gray-200 bg-white':s.changed?'border-red-200 bg-red-50/40':'border-green-200 bg-green-50/40';
    const eyebrow=!s.issued?'NOT YET ISSUED':s.changed?'CHANGES SINCE LAST ISSUE':'CURRENT ISSUE CONTROLLED';
    const headline=!s.issued?'Final operational issue not created':s.changed?'Wedding has changed since sheets were issued':`Version ${s.meta.issuedVersion} is current`;
    const detail=!s.issued?'Complete readiness, then issue the final operational pack.':s.changed?'Re-check the highlighted planning information and re-issue before service.':`Issued ${new Date(s.meta.issuedAt).toLocaleString('en-GB')} by ${escv(s.meta.issuedBy)}.`;
    return `<section class="rounded-xl border ${cls} p-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div>
        <p class="text-xs font-bold tracking-widest ${s.changed?'text-red-700':s.issued?'text-green-700':'text-gray-500'}">PHASE 9 · ${eyebrow}</p>
        <h3 class="font-bold text-lg mt-1">${headline}</h3><p class="text-sm text-gray-600 mt-1">${detail}</p>
        ${s.meta.issueNote?`<p class="text-xs text-gray-500 mt-2"><strong>Issue note:</strong> ${escv(s.meta.issueNote)}</p>`:''}
      </div><div class="flex flex-wrap gap-2">
        <button onclick="WeddingFinalisation.issue('${wedding.id}')" ${!s.readiness.ready?'disabled':''} class="px-4 py-2 rounded-lg font-semibold text-sm ${s.readiness.ready?'bg-olive-600 text-white':'bg-gray-200 text-gray-400 cursor-not-allowed'}">${s.issued?'Re-issue Final Sheets':'Issue Final Sheets'}</button>
        ${s.issued?`<button onclick="printWeddingFunctionSheet('${wedding.id}','full')" class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold">Print Current Full Sheet</button>`:''}
      </div></div>
      ${s.changed?`<div class="mt-4 border border-red-200 bg-white rounded-lg p-3 text-sm text-red-800"><strong>Re-issue required.</strong> Planning, guest choices, seating, timings or another operational field has changed since Version ${s.meta.issuedVersion} was issued.</div>`:''}
    </section>`;
  }

  function issueStamp(wedding){
    const s=state(wedding);
    if(!s.issued)return '';
    return `<div class="box ${s.changed?'alert':'tint'}" style="margin-bottom:4mm"><strong>${s.changed?'SUPERSEDED / CHANGED SINCE ISSUE':'CONTROLLED OPERATIONAL ISSUE'}</strong><br><span class="small">Version ${s.meta.issuedVersion} · Issued ${new Date(s.meta.issuedAt).toLocaleString('en-GB')} · ${escv(s.meta.issuedBy)}</span></div>`;
  }

  window.WeddingFinalisation={state,meta,visibleOperationalNotes,issue,render,issueStamp};
})();
