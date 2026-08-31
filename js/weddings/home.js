
// ============================================================================
// WINDMILL FARM — WEDDINGS / HOME
// This module deliberately overrides renderWeddings() from js/weddings.js.
// Core wedding CRUD and workspace logic remains in the legacy file for now.
// Future wedding modules can live beside this file.
// ============================================================================

window.WeddingCentreHome = window.WeddingCentreHome || {
  listExpanded: true,
  attentionLimit: 6,
  upcomingLimit: 6
};

WeddingCentreHome.active = function(){
  return (DB.weddings || []).filter(w => !w.archivedAt);
};

WeddingCentreHome.overdueTasks = function(wedding){
  return weddingTasksFor(wedding.id).filter(task =>
    !task.completed && task.dueDate && task.dueDate < currentDateStr()
  );
};

WeddingCentreHome.dueSoonTasks = function(wedding){
  const today = new Date(currentDateStr() + 'T12:00:00');
  return weddingTasksFor(wedding.id).filter(task => {
    if(task.completed || !task.dueDate) return false;
    const due = new Date(task.dueDate + 'T12:00:00');
    const days = Math.ceil((due - today) / 86400000);
    return days >= 0 && days <= 7;
  });
};

WeddingCentreHome.daysTo = function(date){
  if(!date) return null;
  const today = new Date(currentDateStr() + 'T12:00:00');
  const target = new Date(date + 'T12:00:00');
  return Math.ceil((target - today) / 86400000);
};

WeddingCentreHome.upcoming = function(){
  return WeddingCentreHome.active()
    .filter(w => {
      const d = WeddingCentreHome.daysTo(w.date);
      return d !== null && d >= 0;
    })
    .sort((a,b) => String(a.date).localeCompare(String(b.date)));
};

WeddingCentreHome.attentionScore = function(wedding){
  const overdue = WeddingCentreHome.overdueTasks(wedding).length;
  const dueSoon = WeddingCentreHome.dueSoonTasks(wedding).length;
  const days = WeddingCentreHome.daysTo(wedding.date);
  const noCoordinator = !wedding.coordinator ? 1 : 0;
  const noTasks = weddingTasksFor(wedding.id).filter(t => !t.completed).length === 0 ? 1 : 0;
  let score = overdue * 20 + dueSoon * 5 + noCoordinator * 12 + noTasks * 2;
  if(days !== null && days >= 0 && days <= 30) score += 10;
  if(days !== null && days >= 0 && days <= 14) score += 10;
  return score;
};

WeddingCentreHome.attentionReason = function(wedding){
  const overdue = WeddingCentreHome.overdueTasks(wedding);
  if(overdue.length) return {
    tone:'red',
    icon:'alert-circle',
    title:`${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
    detail: overdue[0]?.title || 'Planning action overdue'
  };
  if(!wedding.coordinator) return {
    tone:'amber', icon:'user-plus', title:'Coordinator required',
    detail:'Assign somebody to own this wedding.'
  };
  const dueSoon = WeddingCentreHome.dueSoonTasks(wedding);
  if(dueSoon.length) return {
    tone:'amber', icon:'clock', title:`${dueSoon.length} task${dueSoon.length === 1 ? '' : 's'} due this week`,
    detail: dueSoon[0]?.title || 'Planning action due soon'
  };
  const days = WeddingCentreHome.daysTo(wedding.date);
  if(days !== null && days >= 0 && days <= 30) return {
    tone:'gold', icon:'calendar', title:`Wedding in ${days === 0 ? 'today' : days + ' days'}`,
    detail:'Final checks and operational readiness.'
  };
  return {
    tone:'olive', icon:'heart', title:'Planning progressing',
    detail: `${weddingProgress(wedding)}% planning complete`
  };
};

WeddingCentreHome.formatDate = function(date){
  if(!date) return 'Date TBC';
  try{
    return new Date(date + 'T12:00:00').toLocaleDateString('en-GB',{
      weekday:'short', day:'numeric', month:'short', year:'numeric'
    });
  }catch{ return date; }
};

WeddingCentreHome.money = function(value){
  return '£' + Number(value || 0).toLocaleString('en-GB',{maximumFractionDigits:2});
};

WeddingCentreHome.openNext = function(){
  const next = WeddingCentreHome.upcoming()[0];
  if(!next) return toast('No upcoming weddings found','error');
  openWeddingWorkspace(next.id);
};

WeddingCentreHome.setListExpanded = function(value){
  WeddingCentreHome.listExpanded = value;
  renderSection();
};

WeddingCentreHome.kpis = function(){
  const active = WeddingCentreHome.active();
  const upcoming = WeddingCentreHome.upcoming();
  const next30 = upcoming.filter(w => {
    const d = WeddingCentreHome.daysTo(w.date);
    return d !== null && d <= 30;
  }).length;
  const booked = active.reduce((sum,w) => sum + Number(w.quotedValue || 0),0);
  const outstanding = active.reduce((sum,w) => sum + Number(weddingBalance(w) || 0),0);
  const overdue = active.reduce((sum,w) => sum + WeddingCentreHome.overdueTasks(w).length,0);
  const avgProgress = active.length
    ? Math.round(active.reduce((sum,w) => sum + Number(weddingProgress(w) || 0),0) / active.length)
    : 0;
  return {active:active.length,next30,booked,outstanding,overdue,avgProgress};
};

WeddingCentreHome.yearSummary = function(){
  const rows = {};
  WeddingCentreHome.active().forEach(w => {
    const year = String(w.date || '').slice(0,4) || 'TBC';
    if(!rows[year]) rows[year] = {year,count:0,value:0,outstanding:0};
    rows[year].count++;
    rows[year].value += Number(w.quotedValue || 0);
    rows[year].outstanding += Number(weddingBalance(w) || 0);
  });
  return Object.values(rows).sort((a,b) => String(a.year).localeCompare(String(b.year)));
};

WeddingCentreHome.teamSummary = function(){
  const rows = {};
  WeddingCentreHome.active().forEach(w => {
    const name = w.coordinator || 'Unassigned';
    if(!rows[name]) rows[name] = {name,count:0,overdue:0,next90:0};
    rows[name].count++;
    rows[name].overdue += WeddingCentreHome.overdueTasks(w).length;
    const days = WeddingCentreHome.daysTo(w.date);
    if(days !== null && days >= 0 && days <= 90) rows[name].next90++;
  });
  return Object.values(rows).sort((a,b) => b.count-a.count || a.name.localeCompare(b.name));
};

WeddingCentreHome.renderAttention = function(){
  const items = WeddingCentreHome.active()
    .map(w => ({w,score:WeddingCentreHome.attentionScore(w),reason:WeddingCentreHome.attentionReason(w)}))
    .filter(item => item.score > 0)
    .sort((a,b) => b.score-a.score)
    .slice(0,WeddingCentreHome.attentionLimit);

  if(!items.length){
    return `<div class="wch-empty"><i data-lucide="check-circle"></i><strong>Nothing urgent</strong><span>There are no wedding records requiring immediate attention.</span></div>`;
  }

  return items.map(({w,reason}) => `
    <button onclick="openWeddingWorkspace('${w.id}')" class="wch-attention-row ${reason.tone}">
      <span class="wch-attention-icon"><i data-lucide="${reason.icon}"></i></span>
      <span class="wch-attention-main">
        <strong>${esc(w.couple)}</strong>
        <small>${esc(reason.title)} · ${esc(reason.detail)}</small>
      </span>
      <span class="wch-attention-meta">
        <strong>${WeddingCentreHome.formatDate(w.date)}</strong>
        <small>${esc(w.coordinator || 'Unassigned')}</small>
      </span>
      <i data-lucide="chevron-right" class="wch-arrow"></i>
    </button>
  `).join('');
};

WeddingCentreHome.renderUpcoming = function(){
  const rows = WeddingCentreHome.upcoming().slice(0,WeddingCentreHome.upcomingLimit);
  if(!rows.length) return `<div class="wch-empty"><i data-lucide="calendar"></i><strong>No upcoming weddings</strong></div>`;

  return rows.map(w => {
    const days = WeddingCentreHome.daysTo(w.date);
    const progress = weddingProgress(w);
    return `<button onclick="openWeddingWorkspace('${w.id}')" class="wch-upcoming-row">
      <div class="wch-date-block">
        <strong>${new Date(w.date+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit'})}</strong>
        <span>${new Date(w.date+'T12:00:00').toLocaleDateString('en-GB',{month:'short'}).toUpperCase()}</span>
      </div>
      <div class="wch-upcoming-main">
        <div><strong>${esc(w.couple)}</strong><span class="badge ${weddingStatusColor(w.status)}">${esc(w.status)}</span></div>
        <small>${esc(w.package || 'Package TBC')} · ${Number(w.dayGuests||0)} day / ${Number(w.eveningGuests||0)} evening</small>
        <div class="wch-mini-progress"><span style="width:${progress}%"></span></div>
      </div>
      <div class="wch-upcoming-value">
        <strong>${WeddingCentreHome.money(w.quotedValue)}</strong>
        <small>${days === 0 ? 'Today' : `${days} days`}</small>
      </div>
    </button>`;
  }).join('');
};

WeddingCentreHome.renderYearSummary = function(){
  const rows = WeddingCentreHome.yearSummary();
  if(!rows.length) return `<div class="wch-empty compact"><strong>No wedding data</strong></div>`;
  const max = Math.max(...rows.map(row => row.count),1);
  return rows.map(row => `<button onclick="setWeddingYearFilter('${row.year}');document.getElementById('wch-all-weddings')?.scrollIntoView({behavior:'smooth'})" class="wch-year-row">
    <div><strong>${esc(row.year)}</strong><span>${row.count} wedding${row.count===1?'':'s'}</span></div>
    <div class="wch-year-bar"><span style="width:${Math.max(8,row.count/max*100)}%"></span></div>
    <div><strong>${WeddingCentreHome.money(row.value)}</strong><span>${WeddingCentreHome.money(row.outstanding)} outstanding</span></div>
  </button>`).join('');
};

WeddingCentreHome.renderTeam = function(){
  const rows = WeddingCentreHome.teamSummary().slice(0,7);
  if(!rows.length) return `<div class="wch-empty compact"><strong>No coordinators assigned</strong></div>`;
  return rows.map(row => `<button onclick="weddingCoordinatorFilter='${esc(row.name)}';renderSection()" class="wch-team-row">
    <span class="wch-avatar">${esc(row.name.split(/\s+/).map(p=>p[0]).join('').slice(0,2).toUpperCase())}</span>
    <span><strong>${esc(row.name)}</strong><small>${row.count} wedding${row.count===1?'':'s'} · ${row.next90} in next 90 days</small></span>
    <em class="${row.overdue?'bad':'good'}">${row.overdue ? row.overdue+' overdue' : 'On track'}</em>
  </button>`).join('');
};

function renderWeddings(){
  if(!weddingTablesReady){
    return `<div class="section-card max-w-3xl">
      <div class="flex items-start gap-3">
        <i data-lucide="database" class="text-olive-600 mt-1" style="width:20px;height:20px"></i>
        <div><h3 class="font-bold text-charcoal-900">Wedding setup required</h3><p class="text-sm text-gray-600 mt-1">Run <strong>setup-weddings.sql</strong> in Supabase, then refresh the CRM.</p></div>
      </div>
    </div>`;
  }

  if(!weddingYearFilter) weddingYearFilter = defaultWeddingYear();

  const all = DB.weddings || [];
  const active = WeddingCentreHome.active();
  const k = WeddingCentreHome.kpis();
  const next = WeddingCentreHome.upcoming()[0];
  const years = availableWeddingYears();
  const coordinators = [...new Set(active.map(w=>w.coordinator).filter(Boolean))].sort();

  setTimeout(()=>filterWeddings(),0);

  return `<div class="wedding-centre-home">
    <section class="wch-hero">
      <div>
        <p class="wch-eyebrow">WINDMILL FARM WEDDINGS</p>
        <h2>Wedding Centre</h2>
        <p>Every wedding, planning action, payment and upcoming date in one operational view.</p>
        ${next ? `<div class="wch-next-chip"><i data-lucide="calendar"></i><span>Next wedding</span><strong>${esc(next.couple)}</strong><span>${WeddingCentreHome.formatDate(next.date)}</span></div>` : ''}
      </div>
      <div class="wch-hero-actions">
        <button onclick="WeddingPricing.openManager()" class="secondary"><i data-lucide="badge-pound-sterling"></i>Pricing Manager</button>
        ${next ? `<button onclick="WeddingCentreHome.openNext()" class="secondary"><i data-lucide="folder-open"></i>Open Next Wedding</button>` : ''}
        <button onclick="openWeddingForm()" class="primary"><i data-lucide="plus"></i>New Wedding</button>
      </div>
    </section>

    <section class="wch-kpis">
      <article><span class="olive"><i data-lucide="heart"></i></span><div><small>Active Weddings</small><strong>${k.active}</strong><p>${k.next30} in the next 30 days</p></div></article>
      <article><span class="gold"><i data-lucide="pound-sterling"></i></span><div><small>Booked Value</small><strong>${WeddingCentreHome.money(k.booked)}</strong><p>Across all active weddings</p></div></article>
      <article><span class="red"><i data-lucide="credit-card"></i></span><div><small>Outstanding</small><strong>${WeddingCentreHome.money(k.outstanding)}</strong><p>Remaining against wedding values</p></div></article>
      <article><span class="${k.overdue?'red':'green'}"><i data-lucide="alert-circle"></i></span><div><small>Overdue Actions</small><strong>${k.overdue}</strong><p>${k.overdue?'Needs management attention':'No overdue wedding tasks'}</p></div></article>
      <article><span class="teal"><i data-lucide="trending-up"></i></span><div><small>Planning Health</small><strong>${k.avgProgress}%</strong><p>Average completion across active weddings</p></div></article>
    </section>

    <section class="wch-main-grid">
      <article class="wch-panel attention">
        <div class="wch-panel-head">
          <div><p class="wch-eyebrow olive">CONTROL CENTRE</p><h3>Needs Attention</h3><span>Wedding records ranked by urgency.</span></div>
          <button onclick="document.getElementById('wch-all-weddings')?.scrollIntoView({behavior:'smooth'})">View all</button>
        </div>
        <div class="wch-attention-list">${WeddingCentreHome.renderAttention()}</div>
      </article>

      <article class="wch-panel upcoming">
        <div class="wch-panel-head">
          <div><p class="wch-eyebrow olive">FORWARD LOOK</p><h3>Upcoming Weddings</h3><span>Your next confirmed wedding dates.</span></div>
        </div>
        <div>${WeddingCentreHome.renderUpcoming()}</div>
      </article>
    </section>

    <section class="wch-secondary-grid">
      <article class="wch-panel">
        <div class="wch-panel-head"><div><p class="wch-eyebrow olive">BOOKINGS</p><h3>Wedding Pipeline by Year</h3><span>Volume, booked value and outstanding value.</span></div></div>
        <div class="wch-year-list">${WeddingCentreHome.renderYearSummary()}</div>
      </article>
      <article class="wch-panel">
        <div class="wch-panel-head"><div><p class="wch-eyebrow olive">TEAM</p><h3>Coordinator Workload</h3><span>See who owns what and where support is needed.</span></div></div>
        <div class="wch-team-list">${WeddingCentreHome.renderTeam()}</div>
      </article>
    </section>

    <section id="wch-all-weddings" class="wch-panel wch-all-panel">
      <div class="wch-panel-head all">
        <div><p class="wch-eyebrow olive">WEDDING RECORDS</p><h3>All Weddings</h3><span>Search, filter and open the full wedding workspace.</span></div>
        <div class="wch-all-actions">
          <div class="flex rounded-lg bg-olive-50 p-1">
            <button onclick="weddingListMode='active';renderSection()" class="px-3 py-2 rounded-md text-xs font-semibold ${weddingListMode==='active'?'bg-white text-olive-700 shadow-sm':'text-gray-500'}">Active (${all.filter(x=>!x.archivedAt).length})</button>
            <button onclick="weddingListMode='archived';renderSection()" class="px-3 py-2 rounded-md text-xs font-semibold ${weddingListMode==='archived'?'bg-white text-olive-700 shadow-sm':'text-gray-500'}">Archive (${all.filter(x=>x.archivedAt).length})</button>
          </div>
          <button onclick="WeddingCentreHome.setListExpanded(!WeddingCentreHome.listExpanded)" class="wch-collapse"><i data-lucide="${WeddingCentreHome.listExpanded?'chevron-up':'chevron-down'}"></i>${WeddingCentreHome.listExpanded?'Hide':'Show'} list</button>
        </div>
      </div>

      ${WeddingCentreHome.listExpanded ? `
      <div class="wch-filters">
        <div class="wch-search"><i data-lucide="search"></i><input id="wedding-search" oninput="filterWeddings()" placeholder="Search couple, package or coordinator…"></div>
        <select id="wedding-month" onchange="weddingMonthFilter=this.value;filterWeddings()">
          <option value="">All months</option>
          ${Array.from({length:12},(_,i)=>{const m=String(i+1).padStart(2,'0');const label=new Date(2026,i,1).toLocaleDateString('en-GB',{month:'long'});return `<option value="${m}" ${weddingMonthFilter===m?'selected':''}>${label}</option>`}).join('')}
        </select>
        <select id="wedding-coordinator" onchange="weddingCoordinatorFilter=this.value;filterWeddings()">
          <option value="">All coordinators</option>
          ${coordinators.map(name=>`<option ${weddingCoordinatorFilter===name?'selected':''}>${esc(name)}</option>`).join('')}
        </select>
        <select id="wedding-status" onchange="filterWeddings()">
          <option value="">All statuses</option>
          ${['Confirmed','Planning','Final Planning','Completed','Archived'].map(x=>`<option>${x}</option>`).join('')}
        </select>
      </div>

      <div class="wch-year-pills">
        <button onclick="setWeddingYearFilter('all')" class="${weddingYearFilter==='all'?'active':''}">All <span>${active.length}</span></button>
        ${years.map(year=>`<button onclick="setWeddingYearFilter('${year}')" class="${weddingYearFilter===year?'active':''}">${year}<span>${active.filter(w=>String(w.date||'').startsWith(year)).length}</span></button>`).join('')}
        <div class="wch-display-toggle">
          <button onclick="setWeddingDisplayMode('compact')" class="${weddingDisplayMode==='compact'?'active':''}"><i data-lucide="list"></i>List</button>
          <button onclick="setWeddingDisplayMode('cards')" class="${weddingDisplayMode==='cards'?'active':''}"><i data-lucide="layout-grid"></i>Cards</button>
        </div>
      </div>

      <div id="wedding-list" class="space-y-3"></div>
      ` : ''}
    </section>
  </div>`;
}

(function injectWeddingCentreHomeStyles(){
  if(document.getElementById('wedding-centre-home-styles')) return;
  const style = document.createElement('style');
  style.id='wedding-centre-home-styles';
  style.textContent=`
  .wedding-centre-home{display:flex;flex-direction:column;gap:14px;padding-bottom:20px}.wch-eyebrow{font-size:.68rem;font-weight:900;letter-spacing:.17em;color:#dfbd65}.wch-eyebrow.olive{color:#69824b}
  .wch-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;padding:25px 27px;border-radius:21px;background:radial-gradient(circle at 86% 12%,rgba(211,172,72,.24),transparent 25rem),linear-gradient(135deg,#25382e,#48603b 62%,#71884d);color:#fff;box-shadow:0 15px 34px rgba(35,52,39,.14)}.wch-hero h2{font-size:2.15rem;line-height:1.05;font-weight:850;letter-spacing:-.04em;margin-top:5px}.wch-hero>div>p:nth-of-type(2){font-size:.82rem;color:rgba(255,255,255,.78);margin-top:7px}.wch-next-chip{display:inline-flex;align-items:center;gap:7px;margin-top:16px;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.11);font-size:.59rem}.wch-next-chip svg{width:14px;height:14px}.wch-next-chip strong{font-size:.64rem}.wch-hero-actions{display:flex;gap:8px;flex-wrap:wrap}.wch-hero-actions button{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 14px;border-radius:10px;font-size:.67rem;font-weight:850;white-space:nowrap}.wch-hero-actions svg{width:16px;height:16px}.wch-hero-actions .primary{background:#d6ad4a;color:#263229}.wch-hero-actions .secondary{background:#fff;color:#435b39}
  .wch-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.wch-kpis article{display:flex;align-items:flex-start;gap:11px;padding:15px;border:1px solid #e1e8dd;border-radius:16px;background:#fff;box-shadow:0 5px 16px rgba(35,50,38,.04)}.wch-kpis article>span{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;flex-shrink:0}.wch-kpis span svg{width:19px;height:19px}.wch-kpis .olive{background:#edf3e5;color:#617b43}.wch-kpis .gold{background:#fff5d9;color:#ac7d1b}.wch-kpis .red{background:#fff0f0;color:#bd4848}.wch-kpis .green{background:#eaf7ed;color:#438250}.wch-kpis .teal{background:#e8f5f2;color:#3f8176}.wch-kpis small{display:block;font-size:.61rem;color:#747e71;font-weight:750}.wch-kpis strong{display:block;font-size:1.34rem;line-height:1.1;margin-top:3px;letter-spacing:-.02em}.wch-kpis p{font-size:.5rem;color:#969d94;margin-top:5px}
  .wch-main-grid{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(0,.82fr);gap:12px}.wch-secondary-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.wch-panel{border:1px solid #e1e7dd;border-radius:17px;background:#fff;box-shadow:0 5px 18px rgba(35,50,38,.04);overflow:hidden}.wch-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 17px 12px}.wch-panel-head h3{font-size:1.05rem;font-weight:850;letter-spacing:-.015em;margin-top:2px}.wch-panel-head span{display:block;font-size:.61rem;color:#828b7f;margin-top:3px}.wch-panel-head>button{font-size:.55rem;font-weight:850;color:#607b41;padding:6px 8px;border-radius:7px;background:#eff4ea}
  .wch-attention-list{padding:0 10px 12px}.wch-attention-row{display:grid;grid-template-columns:38px minmax(0,1fr) 125px 18px;gap:10px;align-items:center;width:100%;padding:10px 8px;border-top:1px solid #edf0eb;text-align:left}.wch-attention-row:first-child{border-top:0}.wch-attention-icon{width:35px;height:35px;display:grid;place-items:center;border-radius:10px}.wch-attention-icon svg{width:16px;height:16px}.wch-attention-row.red .wch-attention-icon{background:#fff0f0;color:#b84545}.wch-attention-row.amber .wch-attention-icon{background:#fff7e4;color:#9a711c}.wch-attention-row.gold .wch-attention-icon{background:#fff3d4;color:#a67a20}.wch-attention-row.olive .wch-attention-icon{background:#edf3e6;color:#5f793f}.wch-attention-main strong{display:block;font-size:.67rem}.wch-attention-main small,.wch-attention-meta small{display:block;font-size:.5rem;color:#879084;margin-top:2px}.wch-attention-meta{text-align:right}.wch-attention-meta strong{font-size:.54rem}.wch-arrow{width:14px;height:14px;color:#98a095}
  .wch-upcoming>div:last-child{padding:0 11px 12px}.wch-upcoming-row{display:grid;grid-template-columns:45px minmax(0,1fr) 80px;gap:9px;align-items:center;width:100%;padding:9px 4px;border-top:1px solid #edf0eb;text-align:left}.wch-upcoming-row:first-child{border-top:0}.wch-date-block{width:43px;height:43px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:10px;background:#edf3e6;color:#526b39}.wch-date-block strong{font-size:.82rem}.wch-date-block span{font-size:.46rem;font-weight:850}.wch-upcoming-main>div:first-child{display:flex;align-items:center;gap:5px;flex-wrap:wrap}.wch-upcoming-main strong{font-size:.64rem}.wch-upcoming-main small{display:block;font-size:.49rem;color:#879084;margin-top:2px}.wch-mini-progress{height:4px;border-radius:999px;background:#edf0eb;margin-top:6px;overflow:hidden}.wch-mini-progress span{display:block;height:100%;background:#718b51;border-radius:999px}.wch-upcoming-value{text-align:right}.wch-upcoming-value strong{display:block;font-size:.62rem}.wch-upcoming-value small{font-size:.49rem;color:#818b7e}
  .wch-year-list,.wch-team-list{padding:0 13px 13px}.wch-year-row{display:grid;grid-template-columns:82px minmax(90px,1fr) 145px;gap:12px;align-items:center;width:100%;padding:9px 3px;border-top:1px solid #edf0eb;text-align:left}.wch-year-row:first-child{border-top:0}.wch-year-row>div:first-child strong,.wch-year-row>div:last-child strong{display:block;font-size:.62rem}.wch-year-row span{display:block;font-size:.48rem;color:#8c9489;margin-top:1px}.wch-year-row>div:last-child{text-align:right}.wch-year-bar{height:6px;border-radius:999px;background:#eef1ec;overflow:hidden}.wch-year-bar span{display:block;height:100%;margin:0;background:#728b53;border-radius:999px}
  .wch-team-row{display:grid;grid-template-columns:35px minmax(0,1fr) auto;gap:9px;align-items:center;width:100%;padding:8px 3px;border-top:1px solid #edf0eb;text-align:left}.wch-team-row:first-child{border-top:0}.wch-avatar{width:33px;height:33px;display:grid;place-items:center;border-radius:50%;background:#edf3e6;color:#607b41;font-size:.53rem;font-weight:900}.wch-team-row strong{display:block;font-size:.61rem}.wch-team-row small{display:block;font-size:.48rem;color:#899287;margin-top:1px}.wch-team-row em{font-style:normal;font-size:.48rem;font-weight:850;padding:4px 6px;border-radius:999px}.wch-team-row em.good{background:#edf7ee;color:#4f8156}.wch-team-row em.bad{background:#fff0f0;color:#ae4444}
  .wch-empty{min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#8c958a;gap:5px}.wch-empty.compact{min-height:100px}.wch-empty svg{width:25px;height:25px;color:#78915b}.wch-empty strong{font-size:.7rem}.wch-empty span{font-size:.52rem}
  .wch-all-panel{overflow:visible}.wch-panel-head.all{align-items:center;border-bottom:1px solid #edf0eb}.wch-all-actions{display:flex;align-items:center;gap:8px}.wch-collapse{display:flex;align-items:center;gap:5px;padding:7px 9px;border-radius:8px;background:#f0f3ed;color:#62715d;font-size:.55rem;font-weight:850}.wch-collapse svg{width:13px;height:13px}.wch-filters{display:grid;grid-template-columns:minmax(260px,1fr) repeat(3,180px);gap:8px;padding:12px 14px}.wch-filters select,.wch-search{height:40px;border:1px solid #dfe5da;border-radius:9px;background:#fff}.wch-filters select{padding:0 10px;font-size:.62rem}.wch-search{display:flex;align-items:center;gap:7px;padding:0 10px}.wch-search svg{width:14px;height:14px;color:#8b9588}.wch-search input{width:100%;border:0;outline:0;font-size:.64rem}.wch-year-pills{display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:0 14px 13px}.wch-year-pills>button{display:flex;align-items:center;gap:5px;padding:7px 9px;border-radius:8px;background:#f0f3ed;color:#697465;font-size:.56rem;font-weight:850}.wch-year-pills>button.active{background:#5f793f;color:#fff}.wch-year-pills>button span{opacity:.72}.wch-display-toggle{margin-left:auto;display:flex;gap:3px;padding:3px;border-radius:8px;background:#f0f3ed}.wch-display-toggle button{display:flex;align-items:center;gap:4px;padding:6px 8px;border-radius:6px;font-size:.52rem;font-weight:800;color:#7a8477}.wch-display-toggle button.active{background:#fff;color:#5d783f;box-shadow:0 2px 5px rgba(0,0,0,.05)}.wch-display-toggle svg{width:12px;height:12px}#wedding-list{padding:0 14px 14px}
  @media(max-width:1250px){.wch-kpis{grid-template-columns:repeat(3,1fr)}.wch-main-grid{grid-template-columns:1fr}.wch-filters{grid-template-columns:1fr 1fr}.wch-search{grid-column:1/-1}}@media(max-width:900px){.wch-hero{align-items:flex-start;flex-direction:column}.wch-secondary-grid{grid-template-columns:1fr}.wch-kpis{grid-template-columns:repeat(2,1fr)}.wch-attention-row{grid-template-columns:38px minmax(0,1fr) 18px}.wch-attention-meta{display:none}.wch-year-row{grid-template-columns:70px 1fr 125px}}@media(max-width:620px){.wch-kpis{grid-template-columns:1fr}.wch-filters{grid-template-columns:1fr}.wch-search{grid-column:auto}.wch-year-row{grid-template-columns:65px 1fr}.wch-year-row>div:last-child{grid-column:1/-1;text-align:left}.wch-all-actions{align-items:flex-end;flex-direction:column}.wch-panel-head.all{align-items:flex-start}.wch-display-toggle{margin-left:0}}
  `;
  document.head.appendChild(style);
})();
