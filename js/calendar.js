
// ============================================================================
// WINDMILL FARM — MASTER CALENDAR
// Weddings + Functions + Christmas in one read-through operational calendar.
// This module deliberately self-registers with the existing navigation so
// state.js/dashboard.js do not need to be replaced.
// ============================================================================

window.WindmillCalendar = window.WindmillCalendar || {
  view:'month',
  cursor:(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)})(),
  filters:{wedding:true,function:true,enquiry:true,christmas:true,meeting:true,milestone:true},
  selectedDate:'',
  showPastCancelled:false
};

WindmillCalendar.pad=n=>String(n).padStart(2,'0');
WindmillCalendar.iso=function(date){
  return `${date.getFullYear()}-${WindmillCalendar.pad(date.getMonth()+1)}-${WindmillCalendar.pad(date.getDate())}`;
};
WindmillCalendar.parse=function(value){
  if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return null;
  const [y,m,d]=String(value).split('-').map(Number);
  return new Date(y,m-1,d,12,0,0);
};
WindmillCalendar.today=function(){
  const d=new Date();
  return WindmillCalendar.iso(d);
};
WindmillCalendar.escape=function(v){
  if(typeof esc==='function')return esc(String(v??''));
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
};


// ---- Phase 4: enquiry meetings + shared calendar conflict engine ------------
WindmillCalendar.enquiryActivityState=function(enquiry){
  if(window.EnquiryActivity?.state){
    try{return EnquiryActivity.state(enquiry)||{}}catch(e){}
  }
  const entry=[...(enquiry?.comms||[])].reverse().find(x=>x?.type==='__ENQUIRY_SALES_ACTIVITY_STATE_V3__');
  return entry?.data&&typeof entry.data==='object'?entry.data:{};
};
WindmillCalendar.timeMinutes=function(value){
  if(!value||!/^\d{1,2}:\d{2}$/.test(String(value)))return null;
  const [h,m]=String(value).split(':').map(Number);
  return h*60+m;
};
WindmillCalendar.normaliseRange=function(event){
  let start=WindmillCalendar.timeMinutes(event.time||event.startTime||'');
  let end=WindmillCalendar.timeMinutes(event.endTime||'');
  if(start===null){
    // Events without a usable time are treated as date blockers.
    return {start:0,end:1440,allDay:true};
  }
  if(end===null){
    const duration=Number(event.durationMinutes||event.duration||0);
    end=start+(duration>0?duration:(event.source==='meeting'?60:120));
  }
  if(end<=start)end=Math.min(1440,start+60);
  return {start,end,allDay:false};
};
WindmillCalendar.conflicts=function(candidate,ignore={}){
  if(!candidate?.date)return [];
  const cand={...candidate};
  const cr=WindmillCalendar.normaliseRange(cand);
  return WindmillCalendar.getEvents().filter(existing=>{
    if(existing.date!==cand.date)return false;
    if(ignore.source&&ignore.id&&existing.source===ignore.source&&String(existing.id)===String(ignore.id))return false;
    if(cand.source&&cand.id&&existing.source===cand.source&&String(existing.id)===String(cand.id))return false;
    // Milestones and enquiry preferred dates are advisory, not confirmed venue occupancy.
    // Enquiries remain visible on the Master Calendar so duplicate demand is obvious,
    // but they do not hard-block a confirmed booking or meeting.
    if(existing.source==='milestone'||existing.source==='enquiry')return false;
    const er=WindmillCalendar.normaliseRange(existing);
    return cr.start<er.end&&er.start<cr.end;
  });
};
WindmillCalendar.conflictSummary=function(candidate,ignore={}){
  const conflicts=WindmillCalendar.conflicts(candidate,ignore);
  return {
    conflicts,
    blocked:conflicts.length>0,
    html:conflicts.map(e=>`<div class="wmc-conflict-item"><span class="wmc-list-icon ${WindmillCalendar.sourceClass(e.source)}"><i data-lucide="${WindmillCalendar.sourceIcon(e.source)}"></i></span><span><strong>${WindmillCalendar.escape(e.title)}</strong><small>${WindmillCalendar.escape([e.time||'All day',WindmillCalendar.sourceLabel(e.source),e.subtitle].filter(Boolean).join(' · '))}</small></span></div>`).join('')
  };
};

WindmillCalendar.getEvents=function(){
  const events=[];

  (DB.weddings||[]).forEach(w=>{
    if(!w.date||w.archivedAt)return;
    events.push({
      id:w.id,
      source:'wedding',
      date:w.date,
      time:(w.ceremonyTime||w.startTime||''),
      title:w.couple||'Wedding',
      subtitle:[w.package,Number(w.dayGuests||0)?`${Number(w.dayGuests||0)} day guests`:null,w.coordinator].filter(Boolean).join(' · '),
      status:w.status||'Planning',
      value:Number(w.quotedValue||0),
      raw:w
    });
  });

  (DB.functions||[]).forEach(fn=>{
    if(!fn.eventDate||fn.archivedAt)return;
    if(!WindmillCalendar.showPastCancelled&&fn.status==='Cancelled')return;
    events.push({
      id:fn.id,
      source:'function',
      date:fn.eventDate,
      time:fn.startTime||'',
      title:fn.clientName||'Function',
      subtitle:[fn.eventType,fn.room,Number(fn.guests||0)?`${Number(fn.guests||0)} guests`:null,fn.bookingReference].filter(Boolean).join(' · '),
      status:fn.status||'Planning',
      value:Number(fn.quotedValue||0),
      raw:fn
    });
  });

  const xmasYear=Number(DB.christmasConfig?.year||new Date().getFullYear());
  (DB.christmasBookings||[]).forEach(b=>{
    const date=b.date||b.eventDate||`${xmasYear}-12-25`;
    events.push({
      id:b.id,
      source:'christmas',
      date,
      time:b.timeSlot||'',
      title:b.leadName||'Christmas Booking',
      subtitle:[b.bookingType,b.tableNumber?`Table ${b.tableNumber}`:null,typeof ChristmasOS!=='undefined'&&ChristmasOS.bookingCovers?`${ChristmasOS.bookingCovers(b)} guests`:null].filter(Boolean).join(' · '),
      status:'Christmas Booking',
      value:typeof ChristmasOS!=='undefined'&&ChristmasOS.bookingDue?ChristmasOS.bookingDue(b):Number(b.totalValue||0),
      raw:b
    });
  });

  (DB.christmasEvents||[]).forEach(e=>{
    const date=e.date||e.eventDate;
    if(!date)return;
    events.push({
      id:e.id,
      source:'christmas',
      date,
      time:e.time||e.startTime||'',
      title:e.title||e.name||'Christmas Event',
      subtitle:[e.format,e.room,Number(e.bookedCovers||0)?`${Number(e.bookedCovers)} sold`:null,Number(e.capacity||0)?`${Number(e.capacity)} capacity`:null].filter(Boolean).join(' · '),
      status:e.status||'Christmas Event',
      value:Number(e.bookedCovers||0)*Number(e.ticketPrice||0),
      raw:e
    });
  });

  (DB.christmasDates||[]).forEach(e=>{
    if(!e.date)return;
    events.push({
      id:e.id,
      source:'milestone',
      date:e.date,
      time:'',
      title:e.title||'Christmas Milestone',
      subtitle:[e.category,e.owner].filter(Boolean).join(' · '),
      status:e.status||'Not Started',
      value:0,
      raw:e
    });
  });

  // Active enquiry preferred EVENT dates belong on the Master Calendar as advisory date demand.
  // Suppress converted/linked records so confirmed Weddings/Functions do not appear twice.
  const liveEnquiries=(DB.enquiries||[]).filter(enquiry=>{
    if(!enquiry.preferredDate)return false;
    if(['Lost Enquiry','Lost'].includes(enquiry.status))return false;
    const linkedWedding=(DB.weddings||[]).some(w=>String(w.enquiryId||'')===String(enquiry.id||''));
    const linkedFunction=(DB.functions||[]).some(fn=>String(fn.enquiryId||'')===String(enquiry.id||''));
    if(linkedWedding||linkedFunction)return false;
    return true;
  });
  const enquiryDateCounts=liveEnquiries.reduce((map,enquiry)=>{
    const date=String(enquiry.preferredDate||'');
    if(date)map[date]=(map[date]||0)+1;
    return map;
  },{});

  liveEnquiries.forEach(enquiry=>{
    const duplicateCount=Number(enquiryDateCounts[enquiry.preferredDate]||0);
    events.push({
      id:`enquiry-date-${enquiry.id}`,
      recordId:enquiry.id,
      source:'enquiry',
      date:enquiry.preferredDate,
      time:'',
      title:`${enquiry.name||'Enquiry'} — ${enquiry.eventType||'Event'} Enquiry`,
      subtitle:[
        enquiry.status,
        Number(enquiry.guests||0)?`${Number(enquiry.guests)} guests`:null,
        enquiry.staff,
        duplicateCount>1?`⚠ ${duplicateCount} live enquiries want this date`:null
      ].filter(Boolean).join(' · '),
      status:duplicateCount>1?'Duplicate Date Demand':(enquiry.status||'Live Enquiry'),
      value:Number(enquiry.value||enquiry.budget||0),
      raw:enquiry,
      duplicateCount,
      advisory:true
    });
  });

  // Enquiry viewings / meetings are derived from the activity state saved on the enquiry.
  (DB.enquiries||[]).forEach(enquiry=>{
    const st=WindmillCalendar.enquiryActivityState(enquiry);
    if(!st.viewingDate||!st.viewingTime)return;
    if(['Lost Enquiry','Lost','Confirmed Booking'].includes(enquiry.status)&&st.lastOutcome!=='viewing_booked')return;
    events.push({
      id:`enquiry-${enquiry.id}`,
      recordId:enquiry.id,
      source:'meeting',
      date:st.viewingDate,
      time:st.viewingTime,
      endTime:'',
      durationMinutes:60,
      title:`${enquiry.name||'Enquiry'} — Viewing / Meeting`,
      subtitle:[enquiry.eventType,enquiry.staff,enquiry.status].filter(Boolean).join(' · '),
      status:'Enquiry Meeting',
      value:Number(enquiry.value||0),
      raw:enquiry,
      meetingKind:'enquiry'
    });
  });

  // Existing CRM meeting records also belong on the Master Calendar.
  (DB.meetings||[]).forEach(meeting=>{
    if(!meeting.date)return;
    events.push({
      id:`meeting-${meeting.id}`,
      recordId:meeting.id,
      source:'meeting',
      date:meeting.date,
      time:meeting.time||'',
      endTime:meeting.endTime||meeting.finish||'',
      durationMinutes:Number(meeting.durationMinutes||60),
      title:meeting.client||meeting.title||meeting.type||'Meeting',
      subtitle:[meeting.type,meeting.staff,meeting.status].filter(Boolean).join(' · '),
      status:meeting.status||'Meeting',
      value:0,
      raw:meeting,
      meetingKind:'crm'
    });
  });

  return events.sort((a,b)=>
    String(a.date).localeCompare(String(b.date)) ||
    String(a.time||'99:99').localeCompare(String(b.time||'99:99')) ||
    String(a.title).localeCompare(String(b.title))
  );
};

WindmillCalendar.visibleEvents=function(){
  return WindmillCalendar.getEvents().filter(e=>WindmillCalendar.filters[e.source]!==false);
};

WindmillCalendar.sourceLabel=function(source){
  return source==='wedding'?'Wedding':source==='function'?'Function':source==='enquiry'?'Live Enquiry':source==='christmas'?'Christmas':source==='meeting'?'Meeting / Viewing':'Christmas Milestone';
};
WindmillCalendar.sourceIcon=function(source){
  return source==='wedding'?'heart':source==='function'?'calendar-range':source==='enquiry'?'inbox':source==='christmas'?'gift':source==='meeting'?'users-round':'flag';
};
WindmillCalendar.sourceClass=function(source){
  return `wmc-${source}`;
};
WindmillCalendar.formatDate=function(date,opts={weekday:'short',day:'numeric',month:'short'}){
  const d=WindmillCalendar.parse(date);
  return d?d.toLocaleDateString('en-GB',opts):date||'Date TBC';
};
WindmillCalendar.money=function(v){
  return '£'+Number(v||0).toLocaleString('en-GB',{maximumFractionDigits:0});
};

WindmillCalendar.openEvent=function(source,id){
  if(source==='enquiry'){
    const event=WindmillCalendar.getEvents().find(x=>x.source==='enquiry'&&String(x.id)===String(id));
    if(event?.recordId){
      navigate('enquiries');
      setTimeout(()=>typeof viewEnquiry==='function'&&viewEnquiry(event.recordId),120);
    }
    return;
  }
  if(source==='meeting'){
    const event=WindmillCalendar.getEvents().find(x=>x.source==='meeting'&&String(x.id)===String(id));
    if(event?.meetingKind==='enquiry'&&event.recordId){
      navigate('enquiries');
      setTimeout(()=>typeof viewEnquiry==='function'&&viewEnquiry(event.recordId),120);
      return;
    }
    // Generic meeting records fall back to the Meetings area where available.
    if(typeof navigate==='function')navigate('meetings');
    return;
  }
  if(source==='wedding'){
    navigate('weddings');
    setTimeout(()=>typeof openWeddingWorkspace==='function'&&openWeddingWorkspace(id),120);
    return;
  }
  if(source==='function'){
    navigate('functions');
    setTimeout(()=>typeof openFunctionWorkspace==='function'&&openFunctionWorkspace(id),120);
    return;
  }
  if(source==='christmas'){
    navigate('christmas');
    setTimeout(()=>{
      if(typeof ChristmasOS!=='undefined'){
        if(typeof ChristmasOS.openBooking==='function'&&(DB.christmasBookings||[]).some(x=>x.id===id)){
          ChristmasOS.openBooking(id);
        }else if(typeof ChristmasOS.openEventWorkspace==='function'&&(DB.christmasEvents||[]).some(x=>x.id===id)){
          ChristmasOS.openEventWorkspace(id);
        }
      }
    },120);
    return;
  }
  navigate('christmas');
};

WindmillCalendar.setView=function(view){
  WindmillCalendar.view=view;
  if(window.AppRouter)AppRouter.commit(`/calendar/${encodeURIComponent(view)}${WindmillCalendar.selectedDate?'/'+encodeURIComponent(WindmillCalendar.selectedDate):''}`);
  renderCalendarCentre();
};
WindmillCalendar.move=function(amount){
  const c=WindmillCalendar.cursor;
  if(WindmillCalendar.view==='week'){
    c.setDate(c.getDate()+amount*7);
  }else{
    c.setMonth(c.getMonth()+amount);
    c.setDate(1);
  }
  renderCalendarCentre();
};
WindmillCalendar.goToday=function(){
  const d=new Date();
  WindmillCalendar.cursor=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);
  renderCalendarCentre();
};
WindmillCalendar.toggle=function(source,value){
  WindmillCalendar.filters[source]=value;
  renderCalendarCentre();
};
WindmillCalendar.selectDate=function(date){
  WindmillCalendar.selectedDate=date;
  if(window.AppRouter)AppRouter.commit(`/calendar/${encodeURIComponent(WindmillCalendar.view||'month')}/${encodeURIComponent(date)}`);
  renderCalendarCentre();
  setTimeout(()=>document.getElementById('wmc-day-drawer')?.scrollIntoView({behavior:'smooth',block:'nearest'}),20);
};

WindmillCalendar.monthDays=function(){
  const c=WindmillCalendar.cursor;
  const first=new Date(c.getFullYear(),c.getMonth(),1,12);
  const start=new Date(first);
  const mondayIndex=(first.getDay()+6)%7;
  start.setDate(first.getDate()-mondayIndex);
  return Array.from({length:42},(_,i)=>{
    const d=new Date(start);
    d.setDate(start.getDate()+i);
    return d;
  });
};

WindmillCalendar.weekDays=function(){
  const c=new Date(WindmillCalendar.cursor);
  const idx=(c.getDay()+6)%7;
  c.setDate(c.getDate()-idx);
  return Array.from({length:7},(_,i)=>{
    const d=new Date(c);d.setDate(c.getDate()+i);return d;
  });
};

WindmillCalendar.eventChip=function(e,compact=false){
  return `<button onclick="event.stopPropagation();WindmillCalendar.openEvent('${e.source}','${e.id}')" class="wmc-event ${WindmillCalendar.sourceClass(e.source)} ${Number(e.duplicateCount||0)>1?'wmc-duplicate-demand':''} ${compact?'compact':''}" title="${WindmillCalendar.escape(e.title)}${Number(e.duplicateCount||0)>1?` · ${Number(e.duplicateCount)} live enquiries want this date`:''}">
    <span class="wmc-dot"></span>
    <span class="wmc-event-time">${WindmillCalendar.escape(e.time||'')}</span>
    <strong>${WindmillCalendar.escape(e.title)}</strong>
  </button>`;
};

WindmillCalendar.renderMonth=function(events){
  const days=WindmillCalendar.monthDays();
  const cursorMonth=WindmillCalendar.cursor.getMonth();
  const today=WindmillCalendar.today();
  const byDate={};
  events.forEach(e=>(byDate[e.date]||(byDate[e.date]=[])).push(e));

  return `<div class="wmc-month">
    <div class="wmc-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<div>${x}</div>`).join('')}</div>
    <div class="wmc-month-grid">
      ${days.map(d=>{
        const iso=WindmillCalendar.iso(d),list=byDate[iso]||[];
        return `<div class="wmc-day ${d.getMonth()!==cursorMonth?'outside':''} ${iso===today?'today':''} ${WindmillCalendar.selectedDate===iso?'selected':''}" role="button" tabindex="0" onclick="WindmillCalendar.selectDate('${iso}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();WindmillCalendar.selectDate('${iso}')}">
          <div class="wmc-day-top"><span>${d.getDate()}</span>${list.length?`<em>${list.length}</em>`:''}</div>
          <div class="wmc-day-events">${list.slice(0,4).map(e=>WindmillCalendar.eventChip(e,true)).join('')}${list.length>4?`<button type="button" onclick="event.stopPropagation();WindmillCalendar.selectDate('${iso}')" class="wmc-more">+${list.length-4} more</button>`:''}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
};

WindmillCalendar.renderWeek=function(events){
  const days=WindmillCalendar.weekDays();
  const today=WindmillCalendar.today();
  return `<div class="wmc-week-grid">
    ${days.map(d=>{
      const iso=WindmillCalendar.iso(d),list=events.filter(e=>e.date===iso);
      return `<section class="wmc-week-day ${iso===today?'today':''}">
        <button onclick="WindmillCalendar.selectDate('${iso}')" class="wmc-week-head"><span>${d.toLocaleDateString('en-GB',{weekday:'short'})}</span><strong>${d.getDate()}</strong><small>${d.toLocaleDateString('en-GB',{month:'short'})}</small></button>
        <div class="wmc-week-events">${list.length?list.map(e=>WindmillCalendar.eventChip(e)).join(''):'<span class="wmc-no-events">No bookings</span>'}</div>
      </section>`;
    }).join('')}
  </div>`;
};

WindmillCalendar.renderList=function(events){
  const c=WindmillCalendar.cursor;
  const month=events.filter(e=>{
    const d=WindmillCalendar.parse(e.date);
    return d&&d.getFullYear()===c.getFullYear()&&d.getMonth()===c.getMonth();
  });
  const groups={};
  month.forEach(e=>(groups[e.date]||(groups[e.date]=[])).push(e));
  return `<div class="wmc-list">
    ${Object.keys(groups).length?Object.entries(groups).map(([date,list])=>`
      <section class="wmc-list-day">
        <div class="wmc-list-date"><strong>${WindmillCalendar.formatDate(date,{weekday:'long',day:'numeric',month:'long'})}</strong><span>${list.length} booking${list.length===1?'':'s'}</span></div>
        <div>${list.map(e=>`<button onclick="WindmillCalendar.openEvent('${e.source}','${e.id}')" class="wmc-list-event">
          <span class="wmc-list-icon ${WindmillCalendar.sourceClass(e.source)}"><i data-lucide="${WindmillCalendar.sourceIcon(e.source)}"></i></span>
          <span class="wmc-list-main"><strong>${WindmillCalendar.escape(e.title)}</strong><small>${WindmillCalendar.escape([e.time,e.subtitle].filter(Boolean).join(' · '))}</small></span>
          <span class="wmc-list-type">${WindmillCalendar.sourceLabel(e.source)}</span>
          <span class="wmc-list-status">${WindmillCalendar.escape(e.status||'')}</span>
          <i data-lucide="chevron-right"></i>
        </button>`).join('')}</div>
      </section>`).join(''):'<div class="wmc-empty">No bookings in this month.</div>'}
  </div>`;
};

WindmillCalendar.renderDayDrawer=function(events){
  const date=WindmillCalendar.selectedDate;
  if(!date)return '';
  const list=events.filter(e=>e.date===date);
  return `<section id="wmc-day-drawer" class="wmc-day-drawer">
    <div class="wmc-drawer-head"><div><p class="wmc-eyebrow">DAY VIEW</p><h3>${WindmillCalendar.formatDate(date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3><span>${list.length} item${list.length===1?'':'s'}</span></div><button onclick="WindmillCalendar.selectedDate='';renderCalendarCentre()"><i data-lucide="x"></i></button></div>
    <div class="wmc-drawer-list">
      ${list.length?list.map(e=>`<button onclick="WindmillCalendar.openEvent('${e.source}','${e.id}')" class="wmc-drawer-event">
        <span class="wmc-list-icon ${WindmillCalendar.sourceClass(e.source)}"><i data-lucide="${WindmillCalendar.sourceIcon(e.source)}"></i></span>
        <span><strong>${WindmillCalendar.escape(e.title)}</strong><small>${WindmillCalendar.escape([e.time,e.subtitle,e.status].filter(Boolean).join(' · '))}</small></span>
        <em>${e.value?WindmillCalendar.money(e.value):''}</em>
        <i data-lucide="chevron-right"></i>
      </button>`).join(''):'<div class="wmc-empty compact">Nothing booked on this date.</div>'}
    </div>
  </section>`;
};

function renderCalendarCentre(){
  const mc=document.getElementById('main-content');
  if(!mc)return;
  const events=WindmillCalendar.visibleEvents();
  const today=WindmillCalendar.today();
  const next7=new Date();next7.setDate(next7.getDate()+7);
  const next7iso=WindmillCalendar.iso(next7);
  const upcoming7=events.filter(e=>e.date>=today&&e.date<=next7iso);
  const future=events.filter(e=>e.date>=today);
  const next=future[0];

  const c=WindmillCalendar.cursor;
  const title=WindmillCalendar.view==='week'
    ? `${WindmillCalendar.formatDate(WindmillCalendar.iso(WindmillCalendar.weekDays()[0]),{day:'numeric',month:'short'})} – ${WindmillCalendar.formatDate(WindmillCalendar.iso(WindmillCalendar.weekDays()[6]),{day:'numeric',month:'short',year:'numeric'})}`
    : c.toLocaleDateString('en-GB',{month:'long',year:'numeric'});

  mc.innerHTML=`<div class="wmc-shell">
    <section class="wmc-hero">
      <div><p class="wmc-eyebrow">WINDMILL FARM OPERATIONS</p><h2>Master Calendar</h2><p>Weddings, functions, live enquiry event dates, enquiry meetings/viewings and Christmas bookings in one operational view.</p>${next?`<button onclick="WindmillCalendar.openEvent('${next.source}','${next.id}')" class="wmc-next"><i data-lucide="${WindmillCalendar.sourceIcon(next.source)}"></i><span>Next:</span><strong>${WindmillCalendar.escape(next.title)}</strong><span>${WindmillCalendar.formatDate(next.date)}</span></button>`:''}</div>
      <div class="wmc-hero-stats"><div><small>Next 7 Days</small><strong>${upcoming7.length}</strong></div><div><small>Future Bookings</small><strong>${future.filter(e=>e.source!=='milestone').length}</strong></div></div>
    </section>

    <section class="wmc-summary">
      <article><span class="wmc-wedding"><i data-lucide="heart"></i></span><div><small>Weddings</small><strong>${events.filter(e=>e.source==='wedding'&&e.date>=today).length}</strong><p>Upcoming</p></div></article>
      <article><span class="wmc-function"><i data-lucide="calendar-range"></i></span><div><small>Functions</small><strong>${events.filter(e=>e.source==='function'&&e.date>=today).length}</strong><p>Upcoming</p></div></article>
      <article><span class="wmc-enquiry"><i data-lucide="inbox"></i></span><div><small>Live Enquiries</small><strong>${events.filter(e=>e.source==='enquiry'&&e.date>=today).length}</strong><p>Preferred dates</p></div></article>
      <article><span class="wmc-meeting"><i data-lucide="users-round"></i></span><div><small>Meetings / Viewings</small><strong>${events.filter(e=>e.source==='meeting'&&e.date>=today).length}</strong><p>Upcoming</p></div></article>
      <article><span class="wmc-christmas"><i data-lucide="gift"></i></span><div><small>Christmas</small><strong>${events.filter(e=>e.source==='christmas'&&e.date>=today).length}</strong><p>Bookings & events</p></div></article>
      <article><span class="wmc-all"><i data-lucide="calendar-days"></i></span><div><small>This Week</small><strong>${upcoming7.filter(e=>e.source!=='milestone').length}</strong><p>Operational items</p></div></article>
    </section>

    <section class="wmc-panel">
      <div class="wmc-toolbar">
        <div class="wmc-nav-controls"><button onclick="WindmillCalendar.move(-1)"><i data-lucide="chevron-left"></i></button><button onclick="WindmillCalendar.goToday()" class="today-btn">Today</button><button onclick="WindmillCalendar.move(1)"><i data-lucide="chevron-right"></i></button><h3>${title}</h3></div>
        <div class="wmc-view-toggle">${['month','week','list'].map(v=>`<button onclick="WindmillCalendar.setView('${v}')" class="${WindmillCalendar.view===v?'active':''}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div>
      </div>

      <div class="wmc-filterbar">
        <label><input type="checkbox" ${WindmillCalendar.filters.wedding?'checked':''} onchange="WindmillCalendar.toggle('wedding',this.checked)"><span class="wmc-filter-dot wmc-wedding"></span>Weddings</label>
        <label><input type="checkbox" ${WindmillCalendar.filters.function?'checked':''} onchange="WindmillCalendar.toggle('function',this.checked)"><span class="wmc-filter-dot wmc-function"></span>Functions</label>
        <label><input type="checkbox" ${WindmillCalendar.filters.enquiry?'checked':''} onchange="WindmillCalendar.toggle('enquiry',this.checked)"><span class="wmc-filter-dot wmc-enquiry"></span>Live Enquiries</label>
        <label><input type="checkbox" ${WindmillCalendar.filters.meeting?'checked':''} onchange="WindmillCalendar.toggle('meeting',this.checked)"><span class="wmc-filter-dot wmc-meeting"></span>Meetings / Viewings</label>
        <label><input type="checkbox" ${WindmillCalendar.filters.christmas?'checked':''} onchange="WindmillCalendar.toggle('christmas',this.checked)"><span class="wmc-filter-dot wmc-christmas"></span>Christmas</label>
        <label><input type="checkbox" ${WindmillCalendar.filters.milestone?'checked':''} onchange="WindmillCalendar.toggle('milestone',this.checked)"><span class="wmc-filter-dot wmc-milestone"></span>Christmas deadlines</label>
      </div>

      <div class="wmc-calendar-body">
        ${WindmillCalendar.view==='month'?WindmillCalendar.renderMonth(events):WindmillCalendar.view==='week'?WindmillCalendar.renderWeek(events):WindmillCalendar.renderList(events)}
      </div>
    </section>

    ${WindmillCalendar.renderDayDrawer(events)}
  </div>`;

  if(window.lucide)lucide.createIcons();
}

// ---- Navigation integration -------------------------------------------------
(function installCalendarNavigation(){
  if(window.__windmillCalendarInstalled)return;
  window.__windmillCalendarInstalled=true;

  if(typeof buildNav!=='function'||typeof navigate!=='function'||typeof renderSection!=='function'){
    console.error('Master Calendar could not attach: core navigation has not loaded.');
    return;
  }

  const originalBuildNav=buildNav;
  const originalNavigate=navigate;
  const originalRenderSection=renderSection;

  buildNav=function(){
    originalBuildNav();
    const nav=document.getElementById('nav-items');
    if(!nav||document.getElementById('nav-calendar'))return;
    const button=document.createElement('button');
    button.id='nav-calendar';
    button.onclick=()=>navigate('calendar');
    button.className=`sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 ${currentSection==='calendar'?'active':''}`;
    button.innerHTML='<i data-lucide="calendar-days" style="width:16px;height:16px"></i>Calendar';

    // Place immediately after Functions when possible.
    const fn=document.getElementById('nav-functions');
    if(fn&&fn.nextSibling)nav.insertBefore(button,fn.nextSibling);
    else if(fn)fn.after(button);
    else nav.appendChild(button);
    if(window.lucide)lucide.createIcons();
  };

  navigate=function(section){
    if(section!=='calendar')return originalNavigate(section);
    currentSection='calendar';
    buildNav();
    const heading=document.getElementById('page-heading');
    if(heading)heading.textContent='Calendar';
    renderCalendarCentre();
    const sidebar=document.getElementById('sidebar');
    if(sidebar){
      sidebar.classList.add('-translate-x-full');
      setTimeout(()=>sidebar.classList.remove('-translate-x-full'),10);
    }
  };

  renderSection=function(){
    if(currentSection==='calendar')return renderCalendarCentre();
    return originalRenderSection.apply(this,arguments);
  };

  buildNav();
})();

(function injectCalendarStyles(){
  if(document.getElementById('windmill-calendar-styles'))return;
  const style=document.createElement('style');
  style.id='windmill-calendar-styles';
  style.textContent=`
  .wmc-shell{display:flex;flex-direction:column;gap:14px}.wmc-eyebrow{font-size:.66rem;font-weight:900;letter-spacing:.17em;color:#d8b34b}
  .wmc-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding:23px 25px;border-radius:20px;background:radial-gradient(circle at 87% 12%,rgba(218,181,73,.26),transparent 24rem),linear-gradient(135deg,#26382f,#4f6740 67%,#778d50);color:#fff}.wmc-hero h2{font-size:2rem;font-weight:850;line-height:1}.wmc-hero>div>p:last-of-type{font-size:.78rem;color:rgba(255,255,255,.77);margin-top:7px}.wmc-next{display:inline-flex;align-items:center;gap:6px;margin-top:14px;padding:7px 10px;background:rgba(255,255,255,.12);border-radius:999px;font-size:.54rem}.wmc-next svg{width:13px}.wmc-next strong{font-size:.59rem}.wmc-hero-stats{display:flex;gap:8px}.wmc-hero-stats>div{min-width:100px;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,.1);text-align:center}.wmc-hero-stats small{display:block;font-size:.48rem;color:rgba(255,255,255,.7)}.wmc-hero-stats strong{font-size:1.2rem}
  .wmc-summary{display:grid;grid-template-columns:repeat(6,1fr);gap:9px}.wmc-summary article{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid #e0e6dc;border-radius:14px;background:#fff}.wmc-summary article>span{width:39px;height:39px;display:grid;place-items:center;border-radius:10px}.wmc-summary svg{width:17px}.wmc-summary small{display:block;font-size:.54rem;color:#768173}.wmc-summary strong{font-size:1.08rem}.wmc-summary p{font-size:.46rem;color:#929a8f}.wmc-wedding{background:#f5eaf0!important;color:#9d5276!important}.wmc-function{background:#e8f3e9!important;color:#4e7a55!important}.wmc-enquiry{background:#fff2dc!important;color:#9b6924!important}.wmc-meeting{background:#e9eefb!important;color:#526fa8!important}.wmc-christmas{background:#fbe9e9!important;color:#a84c4c!important}.wmc-milestone{background:#fff4d9!important;color:#9d751d!important}.wmc-all{background:#edf1e8!important;color:#5d7544!important}
  .wmc-panel{border:1px solid #dfe5dc;border-radius:16px;background:#fff;overflow:hidden}.wmc-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid #edf0eb}.wmc-nav-controls{display:flex;align-items:center;gap:6px}.wmc-nav-controls button{height:34px;min-width:34px;display:grid;place-items:center;border-radius:7px;background:#f1f4ef;color:#5d6b59}.wmc-nav-controls .today-btn{padding:0 10px;font-size:.55rem;font-weight:850}.wmc-nav-controls svg{width:14px}.wmc-nav-controls h3{font-size:.93rem;font-weight:850;margin-left:7px;min-width:170px}.wmc-view-toggle{display:flex;gap:3px;padding:3px;border-radius:8px;background:#f0f3ed}.wmc-view-toggle button{padding:6px 9px;border-radius:6px;font-size:.52rem;font-weight:800;color:#737e70}.wmc-view-toggle button.active{background:#fff;color:#5c773e;box-shadow:0 2px 5px rgba(0,0,0,.06)}
  .wmc-filterbar{display:flex;gap:15px;align-items:center;flex-wrap:wrap;padding:9px 14px;border-bottom:1px solid #edf0eb;background:#fbfcfa}.wmc-filterbar label{display:flex;align-items:center;gap:5px;font-size:.52rem;font-weight:750;color:#697466}.wmc-filterbar input{accent-color:#5f793f}.wmc-filter-dot{width:9px;height:9px;border-radius:50%;display:inline-block;padding:0}.wmc-calendar-body{padding:0;min-width:0}
  .wmc-weekdays{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid #e6ebe3;background:#fafbf9}.wmc-weekdays div{padding:8px 9px;font-size:.5rem;font-weight:850;color:#788274;text-transform:uppercase}.wmc-month-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-auto-rows:minmax(122px,auto)}.wmc-day{min-width:0;min-height:122px;padding:7px;border-right:1px solid #e7ebe5;border-bottom:1px solid #e7ebe5;text-align:left;background:#fff;overflow:hidden;cursor:pointer}.wmc-day:nth-child(7n){border-right:0}.wmc-day.outside{background:#fafbfa;color:#a8afa5}.wmc-day.today{box-shadow:inset 0 0 0 2px #6c874d}.wmc-day.selected{background:#f5f8f1}.wmc-day:focus-visible{outline:2px solid #6c874d;outline-offset:-2px}.wmc-day:hover{background:#fbfcfa}.wmc-day-top{display:flex;align-items:center;justify-content:space-between;height:20px}.wmc-day-top>span{font-size:.58rem;font-weight:850}.wmc-day-top em{font-size:.43rem;font-style:normal;background:#eef2eb;padding:2px 5px;border-radius:999px;color:#677261}.wmc-day-events{display:flex;flex-direction:column;gap:3px;margin-top:4px}
  .wmc-event{display:flex;align-items:center;gap:4px;width:100%;padding:5px 6px;border-radius:6px;text-align:left;min-width:0;font-size:.48rem;border:0}.wmc-event.compact{padding:4px 5px;min-height:24px}.wmc-event .wmc-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}.wmc-event-time{font-size:.43rem;opacity:.7;flex-shrink:0}.wmc-event strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.49rem}.wmc-event.wmc-wedding{background:#f7edf2!important;color:#8a4868!important}.wmc-event.wmc-function{background:#edf6ee!important;color:#477250!important}.wmc-event.wmc-enquiry{background:#fff5e5!important;color:#8d6024!important;border:1px dashed #d8a95e}.wmc-event.wmc-enquiry .wmc-dot{background:#c58a35}.wmc-event.wmc-enquiry.wmc-duplicate-demand{background:#fff0ed!important;color:#963f34!important;border:1px solid #d77c70;font-weight:850}.wmc-event.wmc-enquiry.wmc-duplicate-demand .wmc-dot{background:#b9493c}.wmc-event.wmc-christmas{background:#fceded!important;color:#974747!important}.wmc-event.wmc-milestone{background:#fff5dc!important;color:#89691e!important}.wmc-event.wmc-wedding .wmc-dot{background:#a55279}.wmc-event.wmc-function .wmc-dot{background:#54805b}.wmc-event.wmc-christmas .wmc-dot{background:#aa4f4f}.wmc-event.wmc-milestone .wmc-dot{background:#ac8328}.wmc-more{font-size:.44rem;color:#687563;padding:2px 5px;border:0;background:transparent;text-align:left;font-weight:700}
  .wmc-week-grid{display:grid;grid-template-columns:repeat(7,minmax(130px,1fr));overflow-x:auto}.wmc-week-day{min-height:400px;border-right:1px solid #e7ebe5}.wmc-week-day:last-child{border-right:0}.wmc-week-day.today{background:#f7faf4}.wmc-week-head{width:100%;display:flex;align-items:center;gap:4px;padding:10px;border-bottom:1px solid #edf0eb}.wmc-week-head span,.wmc-week-head small{font-size:.48rem;color:#7f887b}.wmc-week-head strong{font-size:.8rem}.wmc-week-events{display:flex;flex-direction:column;gap:5px;padding:7px}.wmc-no-events{font-size:.48rem;color:#a0a79d;padding:5px}
  .wmc-list{padding:0 14px 14px}.wmc-list-day{padding-top:12px}.wmc-list-date{display:flex;align-items:center;justify-content:space-between;padding:7px 2px}.wmc-list-date strong{font-size:.63rem}.wmc-list-date span{font-size:.47rem;color:#8a9387}.wmc-list-event{display:grid;grid-template-columns:34px minmax(0,1fr) 105px 110px 16px;gap:8px;align-items:center;width:100%;padding:9px 5px;border-top:1px solid #edf0eb;text-align:left}.wmc-list-icon{width:31px;height:31px;display:grid;place-items:center;border-radius:8px}.wmc-list-icon svg{width:14px}.wmc-list-main strong{display:block;font-size:.58rem}.wmc-list-main small{display:block;font-size:.46rem;color:#879084;margin-top:2px}.wmc-list-type,.wmc-list-status{font-size:.47rem;color:#737d70}.wmc-list-event>svg{width:13px;color:#949c91}
  .wmc-day-drawer{border:1px solid #dfe5dc;border-radius:16px;background:#fff;overflow:hidden}.wmc-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;padding:13px 15px;border-bottom:1px solid #edf0eb}.wmc-drawer-head h3{font-size:.88rem;font-weight:850}.wmc-drawer-head span{font-size:.5rem;color:#818b7e}.wmc-drawer-head button{width:30px;height:30px;display:grid;place-items:center;border-radius:7px;background:#f1f3ef}.wmc-drawer-head svg{width:14px}.wmc-drawer-list{padding:0 13px 13px}.wmc-drawer-event{display:grid;grid-template-columns:34px minmax(0,1fr) auto 16px;gap:8px;align-items:center;width:100%;padding:9px 3px;border-top:1px solid #edf0eb;text-align:left}.wmc-drawer-event:first-child{border-top:0}.wmc-drawer-event strong{display:block;font-size:.6rem}.wmc-drawer-event small{display:block;font-size:.47rem;color:#858e82;margin-top:2px}.wmc-drawer-event em{font-size:.53rem;font-style:normal;font-weight:850}.wmc-drawer-event>svg{width:13px}.wmc-empty{padding:40px;text-align:center;color:#8c958a;font-size:.58rem}.wmc-empty.compact{padding:20px}
  @media(max-width:1100px){.wmc-summary{grid-template-columns:repeat(2,1fr)}.wmc-day{min-height:110px}.wmc-list-event{grid-template-columns:34px minmax(0,1fr) 90px 16px}.wmc-list-status{display:none}}@media(max-width:750px){.wmc-hero{align-items:flex-start;flex-direction:column}.wmc-hero-stats{width:100%}.wmc-hero-stats>div{flex:1}.wmc-toolbar{align-items:flex-start;flex-direction:column}.wmc-nav-controls{flex-wrap:wrap}.wmc-filterbar{gap:9px}.wmc-month{overflow-x:auto}.wmc-weekdays,.wmc-month-grid{min-width:760px;width:100%}.wmc-summary{grid-template-columns:1fr 1fr}}@media(max-width:480px){.wmc-summary{grid-template-columns:1fr}.wmc-view-toggle{width:100%}.wmc-view-toggle button{flex:1}.wmc-list-event{grid-template-columns:34px minmax(0,1fr) 16px}.wmc-list-type{display:none}}

  .wmc-conflict-box{margin-top:12px;padding:12px;border:1px solid #f0b9ae;border-radius:12px;background:#fff3f0}.wmc-conflict-box h4{font-size:.78rem;font-weight:850;color:#9b3d33}.wmc-conflict-box>p{font-size:.62rem;color:#8e625d;margin-top:3px}.wmc-conflict-item{display:grid;grid-template-columns:34px 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f1d8d3}.wmc-conflict-item:last-child{border-bottom:0}.wmc-conflict-item strong{display:block;font-size:.68rem}.wmc-conflict-item small{display:block;font-size:.55rem;color:#81736f}.wmc-conflict-override{margin-top:10px}.wmc-conflict-override label{display:block;font-size:.6rem;font-weight:800;color:#7a4b45}.wmc-conflict-override textarea{width:100%;margin-top:4px;padding:8px;border:1px solid #e1b9b2;border-radius:8px;font-size:.7rem}.wmc-conflict-override button{margin-top:7px;width:100%;padding:8px;border-radius:8px;background:#9f443a;color:#fff;font-size:.7rem;font-weight:800}
  `;
  document.head.appendChild(style);
})();
