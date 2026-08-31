
// ============================================================================
// WINDMILL FARM HOTEL REVENUE CENTRE
// A focused Monday planning tool for next week's competitor prices.
// No guest or reservation data is duplicated from Rezlynx.
// ============================================================================

window.HotelOS = window.HotelOS || {
  activeTab:'overview',
  selectedDay:0
};

HotelOS.uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

HotelOS.defaultCompetitors = function() {
  return [
    {id:'our-hotel',name:'Windmill Farm',isOurs:true},
    {id:'woodcocks',name:'Woodcocks',isOurs:false},
    {id:'ihg',name:'Holiday Inn Lincoln',isOurs:false},
    {id:'bentley',name:'Best Western Plus Bentley',isOurs:false},
    {id:'damons',name:"Damon's Hotel",isOurs:false},
    {id:'premier',name:'Premier Inn Lincoln',isOurs:false},
    {id:'travelodge',name:'Travelodge Lincoln',isOurs:false},
    {id:'doubletree',name:'DoubleTree by Hilton Lincoln',isOurs:false},
    {id:'white-hart',name:'White Hart Hotel',isOurs:false}
  ];
};

HotelOS.nextMonday = function() {
  const today=new Date();
  today.setHours(12,0,0,0);
  const day=today.getDay();
  const daysUntil=((8-day)%7)||7;
  today.setDate(today.getDate()+daysUntil);
  return today.toISOString().slice(0,10);
};

HotelOS.addDays = function(dateString,days) {
  const date=new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate()+days);
  return date.toISOString().slice(0,10);
};

HotelOS.ensureData = function() {
  DB.hotelEvents=Array.isArray(DB.hotelEvents)?DB.hotelEvents:[];
  DB.hotelHistory=Array.isArray(DB.hotelHistory)?DB.hotelHistory:[];
  DB.hotelWeek=DB.hotelWeek&&typeof DB.hotelWeek==='object'?DB.hotelWeek:{};

  if(!DB.hotelWeek.weekCommencing)DB.hotelWeek.weekCommencing=HotelOS.nextMonday();
  if(!Array.isArray(DB.hotelWeek.hotels)||!DB.hotelWeek.hotels.length){
    DB.hotelWeek.hotels=HotelOS.defaultCompetitors().map(hotel=>({
      ...hotel,
      days:Array.from({length:7},()=>({price:'',soldOut:false}))
    }));
  }
  DB.hotelWeek.hotels.forEach(hotel=>{
    if(!Array.isArray(hotel.days)||hotel.days.length!==7){
      hotel.days=Array.from({length:7},(_,index)=>hotel.days?.[index]||{price:'',soldOut:false,occupancy:''});
    }
    hotel.days.forEach(day=>{
      if(typeof day.occupancy==='undefined')day.occupancy='';
    });
  });
  if(!DB.hotelWeek.notes)DB.hotelWeek.notes='';
  saveDB();
};

HotelOS.setTab = function(tab) {
  HotelOS.activeTab=tab;
  if(window.AppRouter)AppRouter.commit(`/hotel/${encodeURIComponent(tab)}/${Number(HotelOS.selectedDay||0)}`);
  renderSection();
};

HotelOS.setSelectedDay = function(index) {
  HotelOS.selectedDay=Number(index||0);
  if(window.AppRouter)AppRouter.commit(`/hotel/${encodeURIComponent(HotelOS.activeTab||'overview')}/${HotelOS.selectedDay}`);
  renderSection();
};

HotelOS.ourHotel = function() {
  return DB.hotelWeek.hotels.find(hotel=>hotel.isOurs)||DB.hotelWeek.hotels[0];
};

HotelOS.competitors = function() {
  return DB.hotelWeek.hotels.filter(hotel=>!hotel.isOurs);
};

HotelOS.dayDate = index => HotelOS.addDays(DB.hotelWeek.weekCommencing,index);

HotelOS.dayEvents = function(index) {
  const date=HotelOS.dayDate(index);
  return DB.hotelEvents.filter(event=>event.date===date);
};

HotelOS.dayAnalysis = function(index) {
  const ours=HotelOS.ourHotel()?.days?.[index]||{};
  const ourPrice=Number(ours.price||0);
  const occupancy=ours.occupancy===''||typeof ours.occupancy==='undefined'?null:Number(ours.occupancy||0);
  const available=HotelOS.competitors()
    .map(hotel=>({hotel,day:hotel.days[index]||{}}))
    .filter(item=>!item.day.soldOut&&Number(item.day.price||0)>0);
  const soldOut=HotelOS.competitors().filter(hotel=>hotel.days[index]?.soldOut).length;
  const prices=available.map(item=>Number(item.day.price));
  const average=prices.length?prices.reduce((sum,value)=>sum+value,0)/prices.length:0;
  const low=prices.length?Math.min(...prices):0;
  const high=prices.length?Math.max(...prices):0;
  const ranked=ourPrice?[...prices,ourPrice].sort((a,b)=>a-b):prices;
  const position=ourPrice?ranked.indexOf(ourPrice)+1:0;
  const difference=ourPrice&&average?ourPrice-average:0;
  const events=HotelOS.dayEvents(index);
  const eventUplift=events.reduce((max,event)=>Math.max(max,Number(event.suggestedIncrease||0)),0);

  let recommendation=ourPrice;
  let positionLabel='Enter our price';
  let confidence='Low';
  let reason='Enter Windmill and competitor prices to generate guidance.';
  let tone='neutral';

  if(ourPrice&&prices.length>=3){
    if(position===1)positionLabel='Cheapest';
    else if(position===2)positionLabel='2nd Cheapest';
    else if(position===ranked.length)positionLabel='Most Expensive';
    else positionLabel=`${position}${position===3?'rd':'th'} Cheapest`;

    if(difference<=-12){
      recommendation=Math.round(Math.min(average-4,ourPrice+8));
      reason=`You are £${Math.abs(Math.round(difference))} below the available market average. A measured increase still keeps a value position.`;
      confidence=prices.length>=6?'High':'Medium';
      tone='under';
    }else if(difference<=-5){
      recommendation=Math.round(Math.min(average-2,ourPrice+5));
      reason=`You are £${Math.abs(Math.round(difference))} below the market average. There is room for a small increase while remaining competitive.`;
      confidence=prices.length>=5?'High':'Medium';
      tone='under';
    }else if(difference>=12){
      recommendation=Math.round(Math.max(low+2,average+4));
      reason=`You are £${Math.round(difference)} above the market average. Without occupancy information, this premium should be checked before keeping the rate.`;
      confidence=prices.length>=5?'High':'Medium';
      tone='over';
    }else if(difference>=6){
      recommendation=Math.round(Math.max(low+2,average+2));
      reason=`You are £${Math.round(difference)} above the market average. Review whether the room offer justifies the premium.`;
      confidence='Medium';
      tone='over';
    }else{
      recommendation=Math.round(ourPrice);
      reason='Your rate is broadly aligned with the available competitor market.';
      confidence=prices.length>=5?'High':'Medium';
      tone='market';
    }

    if(soldOut>=2){
      const soldOutLift=Math.min(10,soldOut*3);
      recommendation=Math.max(recommendation,Math.round(ourPrice+soldOutLift));
      reason+= ` ${soldOut} competitors are sold out, indicating stronger demand.`;
      confidence='High';
    }

    if(eventUplift>0){
      recommendation=Math.max(recommendation,Math.round(ourPrice+eventUplift));
      reason+= ` A key event suggests reviewing an uplift of up to £${eventUplift}.`;
      confidence='High';
    }
  }

  // Occupancy changes the interpretation of price. Competitor price alone is
  // not enough to tell us whether a premium is working.
  if(ourPrice&&occupancy!==null){
    if(occupancy<40&&difference>=5){
      recommendation=Math.min(recommendation||ourPrice,Math.round(Math.max(low||0,average||ourPrice)));
      reason=`Occupancy is only ${Math.round(occupancy)}% and Windmill is £${Math.round(Math.max(0,difference))} above the market average. Price is a likely barrier, so review the rate before protecting the premium.`;
      tone='over'; confidence=prices.length>=4?'High':'Medium';
    }else if(occupancy<50&&difference>-3){
      recommendation=Math.min(recommendation||ourPrice,Math.round(average?Math.max(low||0,average-2):ourPrice));
      reason=`Occupancy is ${Math.round(occupancy)}%. With Windmill not materially cheaper than the market, there is a clear case to review price and demand strategy.`;
      tone='over'; confidence=prices.length>=4?'High':'Medium';
    }else if(occupancy>=85&&difference<=8){
      recommendation=Math.max(recommendation||ourPrice,Math.round(ourPrice+5));
      reason=`Occupancy is strong at ${Math.round(occupancy)}%. The current rate is being accepted by the market, so there may be room to test a higher price rather than discount.`;
      tone='under'; confidence='High';
    }else if(occupancy>=90&&difference>8){
      recommendation=Math.max(recommendation||ourPrice,ourPrice);
      reason=`Occupancy is very strong at ${Math.round(occupancy)}% even though Windmill is above the market. The premium appears to be holding, so avoid unnecessary discounting.`;
      tone='market'; confidence='High';
    }else if(occupancy>=60&&occupancy<85&&Math.abs(difference)<8){
      reason=`Occupancy is ${Math.round(occupancy)}% and the rate is broadly aligned with the market. Pricing looks balanced; keep watching pickup and competitor movement.`;
      tone='market';
    }
  }

  recommendation=Math.max(0,recommendation||0);
  const rateOpportunity=ourPrice?recommendation-ourPrice:0;
  const occupancyTone=HotelOS.occupancyTone(occupancy);

  return {
    index,date:HotelOS.dayDate(index),ourPrice,occupancy,occupancyTone,average,low,high,position,positionLabel,
    difference,soldOut,competitorCount:prices.length,recommendation,rateOpportunity,
    confidence,reason,tone,events,available
  };
};

HotelOS.weekAnalysis = function() {
  const days=Array.from({length:7},(_,index)=>HotelOS.dayAnalysis(index));
  const withOurs=days.filter(day=>day.ourPrice>0);
  const withMarket=days.filter(day=>day.average>0);
  const ourAverage=withOurs.length?withOurs.reduce((sum,day)=>sum+day.ourPrice,0)/withOurs.length:0;
  const marketAverage=withMarket.length?withMarket.reduce((sum,day)=>sum+day.average,0)/withMarket.length:0;
  const recommendationAverage=withOurs.length?withOurs.reduce((sum,day)=>sum+day.recommendation,0)/withOurs.length:0;
  const opportunityPerRoom=withOurs.reduce((sum,day)=>sum+Math.max(0,day.rateOpportunity),0);
  const below=days.filter(day=>day.tone==='under').length;
  const above=days.filter(day=>day.tone==='over').length;
  const withOccupancy=days.filter(day=>day.occupancy!==null);
  const averageOccupancy=withOccupancy.length?withOccupancy.reduce((sum,day)=>sum+day.occupancy,0)/withOccupancy.length:0;
  const lowOccupancyDays=days.filter(day=>day.occupancy!==null&&day.occupancy<50).length;
  const priceRiskDays=days.filter(day=>day.occupancy!==null&&day.occupancy<50&&day.difference>=5).length;
  let position='Incomplete';
  if(ourAverage&&marketAverage){
    const difference=ourAverage-marketAverage;
    position=difference<=-8?'Well Below Market':difference<=-3?'Below Market':difference>=8?'Well Above Market':difference>=3?'Above Market':'At Market';
  }
  return {days,ourAverage,marketAverage,recommendationAverage,opportunityPerRoom,below,above,position,averageOccupancy,lowOccupancyDays,priceRiskDays};
};

HotelOS.updateWeekDate = function(value) {
  DB.hotelWeek.weekCommencing=value;
  saveDB();
  renderSection();
};

HotelOS.updatePrice = function(hotelId,index,value) {
  const hotel=DB.hotelWeek.hotels.find(item=>item.id===hotelId);
  if(!hotel)return;
  hotel.days[index].price=value===''?'':Math.max(0,Number(value||0));
  if(value!=='')hotel.days[index].soldOut=false;
  saveDB();
  HotelOS.refreshGridAnalysis();
};


HotelOS.updateOccupancy = function(index,value) {
  const hotel=HotelOS.ourHotel();
  if(!hotel?.days?.[index])return;
  hotel.days[index].occupancy=value===''?'':Math.max(0,Math.min(100,Number(value||0)));
  saveDB();
  HotelOS.refreshGridAnalysis();
};

HotelOS.occupancyTone = function(value) {
  const occ=Number(value||0);
  if(!occ)return 'missing';
  if(occ<40)return 'critical';
  if(occ<60)return 'low';
  if(occ<80)return 'healthy';
  return 'strong';
};

HotelOS.updateSoldOut = function(hotelId,index,checked) {
  const hotel=DB.hotelWeek.hotels.find(item=>item.id===hotelId);
  if(!hotel)return;
  hotel.days[index].soldOut=Boolean(checked);
  if(checked)hotel.days[index].price='';
  saveDB();
  renderSection();
};

HotelOS.updateHotelName = function(id,value) {
  const hotel=DB.hotelWeek.hotels.find(item=>item.id===id);
  if(!hotel)return;
  hotel.name=value.trim()||hotel.name;
  saveDB();
};

HotelOS.refreshGridAnalysis = function() {
  const host=document.getElementById('hotel-live-analysis');
  if(host)host.innerHTML=HotelOS.renderLiveAnalysis();
  const summary=document.getElementById('hotel-grid-summary');
  if(summary)summary.innerHTML=HotelOS.renderGridSummary();
  if(window.lucide)lucide.createIcons();
};

HotelOS.copyPreviousWeek = function() {
  const latest=DB.hotelHistory[0];
  if(!latest?.snapshot)return toast('There is no archived week to copy','error');
  if(!confirm(`Copy competitor prices from week commencing ${latest.weekCommencing}?`))return;
  const newWeek=HotelOS.nextMonday();
  DB.hotelWeek={
    ...JSON.parse(JSON.stringify(latest.snapshot)),
    weekCommencing:newWeek,
    notes:''
  };
  saveDB();
  renderSection();
  toast('Previous week copied');
};

HotelOS.startNewWeek = function() {
  const analysis=HotelOS.weekAnalysis();
  const hasData=DB.hotelWeek.hotels.some(hotel=>hotel.days.some(day=>day.price||day.soldOut));
  if(hasData){
    const archive=confirm('Archive a short summary of the current week before clearing it?');
    if(archive)HotelOS.archiveWeek(false);
  }
  DB.hotelWeek={
    weekCommencing:HotelOS.nextMonday(),
    notes:'',
    hotels:HotelOS.defaultCompetitors().map(hotel=>({
      ...hotel,days:Array.from({length:7},()=>({price:'',soldOut:false}))
    }))
  };
  saveDB();
  renderSection();
  toast('New planning week ready');
};

HotelOS.archiveWeek = function(showToast=true) {
  const analysis=HotelOS.weekAnalysis();
  const item={
    id:HotelOS.uid('hotel-history'),
    weekCommencing:DB.hotelWeek.weekCommencing,
    ourAverage:analysis.ourAverage,
    marketAverage:analysis.marketAverage,
    recommendedAverage:analysis.recommendationAverage,
    position:analysis.position,
    rateOpportunityPerRoom:analysis.opportunityPerRoom,
    notes:DB.hotelWeek.notes||'',
    createdAt:new Date().toISOString(),
    snapshot:JSON.parse(JSON.stringify(DB.hotelWeek))
  };
  DB.hotelHistory=DB.hotelHistory.filter(row=>row.weekCommencing!==item.weekCommencing);
  DB.hotelHistory.unshift(item);
  DB.hotelHistory=DB.hotelHistory.slice(0,20);
  saveDB();
  if(showToast){renderSection();toast('Weekly summary archived');}
};

HotelOS.openEvent = function(id='') {
  const item=id?DB.hotelEvents.find(event=>event.id===id):{
    id:HotelOS.uid('hotel-event'),title:'',date:'',impact:'High',suggestedIncrease:10,notes:''
  };
  openModal(`<div class="p-5 max-w-xl">
    <div class="flex justify-between items-start gap-3">
      <div><p class="text-xs font-bold tracking-widest text-olive-600">HOTEL MARKET EVENT</p><h2 class="text-xl font-bold">${id?'Edit Event':'Add Event'}</h2></div>
      <button onclick="closeModal()" class="p-2"><i data-lucide="x"></i></button>
    </div>
    <form onsubmit="HotelOS.saveEvent(event,'${item.id}')" class="space-y-3 mt-5">
      <label class="text-xs text-gray-600 block">Event name<input name="title" required value="${esc(item.title||'')}" placeholder="Concert, Lincoln Show, graduation..." class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="text-xs text-gray-600">Date<input name="date" required type="date" value="${item.date||''}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Expected impact<select name="impact" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${['Low','Medium','High','Very High'].map(value=>`<option ${item.impact===value?'selected':''}>${value}</option>`).join('')}</select></label>
        <label class="text-xs text-gray-600 col-span-2">Suggested rate increase<input name="suggestedIncrease" type="number" min="0" step="1" value="${Number(item.suggestedIncrease||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      </div>
      <label class="text-xs text-gray-600 block">Notes<textarea name="notes" rows="3" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(item.notes||'')}</textarea></label>
      <div class="flex justify-end gap-2"><button type="button" onclick="closeModal()" class="px-4 py-2.5 bg-gray-100 rounded-lg">Cancel</button><button class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Save Event</button></div>
    </form>
  </div>`);
};

HotelOS.saveEvent = function(event,id) {
  event.preventDefault();
  const values=Object.fromEntries(new FormData(event.target).entries());
  const item={id,...values,suggestedIncrease:Number(values.suggestedIncrease||0)};
  const index=DB.hotelEvents.findIndex(event=>event.id===id);
  if(index>=0)DB.hotelEvents[index]=item;else DB.hotelEvents.push(item);
  saveDB();closeModal();renderSection();toast('Market event saved');
};

HotelOS.deleteEvent = function(id) {
  if(!confirm('Delete this market event?'))return;
  DB.hotelEvents=DB.hotelEvents.filter(item=>item.id!==id);
  saveDB();renderSection();
};

HotelOS.money = value => value?`£${Math.round(Number(value)).toLocaleString()}`:'—';

HotelOS.renderGridSummary = function() {
  const analysis=HotelOS.weekAnalysis();
  return `<div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
    ${[
      ['Average Occupancy',analysis.averageOccupancy?`${Math.round(analysis.averageOccupancy)}%`:'—'],
      ['Our Average Rate',HotelOS.money(analysis.ourAverage)],
      ['Competitor Average',HotelOS.money(analysis.marketAverage)],
      ['Market Position',analysis.position],
      ['Low Occupancy Days',String(analysis.lowOccupancyDays)],
      ['Price Risk Days',String(analysis.priceRiskDays)]
    ].map(([label,value])=>`<div class="rounded-xl bg-cream-50 border p-3"><p class="text-xs text-gray-500">${label}</p><strong class="text-lg mt-1 block">${value}</strong></div>`).join('')}
  </div>`;
};

HotelOS.renderLiveAnalysis = function() {
  const day=HotelOS.dayAnalysis(HotelOS.selectedDay);
  const date=new Date(`${day.date}T12:00:00`);
  return `<div class="rounded-2xl border ${day.tone==='over'?'border-red-200 bg-red-50':day.tone==='under'?'border-green-200 bg-green-50':'border-olive-200 bg-olive-50'} p-5">
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-widest ${day.tone==='over'?'text-red-600':'text-olive-600'}">${date.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase()}</p>
        <h3 class="text-2xl font-bold mt-1">${day.ourPrice?`Recommended rate: ${HotelOS.money(day.recommendation)}`:'Enter prices to generate guidance'}</h3>
        <p class="text-sm text-gray-600 mt-2 max-w-3xl">${day.reason}</p>
      </div>
      <div class="grid grid-cols-2 gap-2 min-w-[280px]">
        <div class="bg-white/80 rounded-xl p-3"><p class="text-xs text-gray-500">Our Rate</p><strong>${HotelOS.money(day.ourPrice)}</strong></div>
        <div class="bg-white/80 rounded-xl p-3"><p class="text-xs text-gray-500">Occupancy</p><strong>${day.occupancy===null?'—':`${Math.round(day.occupancy)}%`}</strong></div>
        <div class="bg-white/80 rounded-xl p-3"><p class="text-xs text-gray-500">Market Average</p><strong>${HotelOS.money(day.average)}</strong></div>
        <div class="bg-white/80 rounded-xl p-3"><p class="text-xs text-gray-500">Position</p><strong>${day.positionLabel}</strong></div>
        <div class="bg-white/80 rounded-xl p-3"><p class="text-xs text-gray-500">Confidence</p><strong>${day.confidence}</strong></div>
      </div>
    </div>
    ${day.events.length?`<div class="mt-4 flex flex-wrap gap-2">${day.events.map(event=>`<span class="badge bg-gold-100 text-gold-700">Event: ${esc(event.title)} · +£${Number(event.suggestedIncrease||0)}</span>`).join('')}</div>`:''}
    ${day.soldOut?`<p class="text-xs font-semibold text-red-700 mt-3">${day.soldOut} competitor${day.soldOut===1?' is':'s are'} sold out.</p>`:''}
  </div>`;
};


HotelOS.previousSnapshot = function() {
  return DB.hotelHistory?.[0]?.snapshot || null;
};

HotelOS.weekChanges = function() {
  const previous=HotelOS.previousSnapshot();
  if(!previous?.hotels)return [];
  const changes=[];
  DB.hotelWeek.hotels.forEach(hotel=>{
    const oldHotel=previous.hotels.find(item=>item.id===hotel.id)||previous.hotels.find(item=>item.name===hotel.name);
    if(!oldHotel)return;
    hotel.days.forEach((day,index)=>{
      const oldDay=oldHotel.days?.[index]||{};
      if(Boolean(day.soldOut)!==Boolean(oldDay.soldOut)){
        changes.push({hotel:hotel.name,index,type:'availability',from:oldDay.soldOut?'Sold Out':'Available',to:day.soldOut?'Sold Out':'Available'});
      }else if(!day.soldOut&&Number(day.price||0)!==Number(oldDay.price||0)){
        changes.push({hotel:hotel.name,index,type:'price',from:Number(oldDay.price||0),to:Number(day.price||0),difference:Number(day.price||0)-Number(oldDay.price||0)});
      }
    });
  });
  return changes.filter(item=>item.to||item.from).sort((a,b)=>Math.abs(Number(b.difference||0))-Math.abs(Number(a.difference||0)));
};

HotelOS.healthScore = function() {
  const analysis=HotelOS.weekAnalysis();
  let score=100;
  const reasons=[];
  analysis.days.forEach(day=>{
    if(day.competitorCount<5){score-=6;reasons.push(`${new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'})}: fewer than 5 competitor rates`);}
    if(!day.ourPrice){score-=8;reasons.push(`${new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'})}: Windmill rate missing`);}
    if(Math.abs(day.difference)>=15){score-=4;reasons.push(`${new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'})}: large market gap`);}
  });
  if(DB.hotelEvents.some(event=>event.date>=DB.hotelWeek.weekCommencing&&event.date<=HotelOS.addDays(DB.hotelWeek.weekCommencing,6))===false)reasons.push('No key events recorded for the week');
  score=Math.max(0,Math.min(100,score));
  const label=score>=90?'Excellent':score>=75?'Good':score>=60?'Needs Review':'Incomplete';
  return {score,label,reasons:[...new Set(reasons)].slice(0,4)};
};

HotelOS.smartAlerts = function() {
  const alerts=[];
  HotelOS.weekAnalysis().days.forEach(day=>{
    const label=new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long'});
    if(day.tone==='under'&&day.rateOpportunity>=5)alerts.push({tone:'green',title:`${label}: pricing opportunity`,detail:`Windmill is £${Math.abs(Math.round(day.difference))} below the market. Suggested ${HotelOS.money(day.recommendation)}.`});
    if(day.tone==='over')alerts.push({tone:'red',title:`${label}: above market`,detail:`Windmill is £${Math.round(day.difference)} above the market average. Review the premium.`});
    if(day.soldOut>=2)alerts.push({tone:'gold',title:`${label}: market tightening`,detail:`${day.soldOut} competitors are sold out.`});
    day.events.forEach(event=>alerts.push({tone:'gold',title:`${label}: ${event.title}`,detail:`Key event recorded with suggested uplift of £${Number(event.suggestedIncrease||0)}.`}));
  });
  return alerts.slice(0,14);
};

HotelOS.weeklyBrief = function() {
  const a=HotelOS.weekAnalysis();
  const complete=a.days.filter(day=>day.ourPrice&&day.average).length;
  if(!complete)return 'Enter Windmill and competitor prices for the following week to create the revenue briefing.';
  const opportunities=a.days.filter(day=>day.rateOpportunity>=5).map(day=>new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long'}));
  const warnings=a.days.filter(day=>day.tone==='over').map(day=>new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long'}));
  let brief=`Windmill is ${a.position.toLowerCase()}, averaging ${HotelOS.money(a.ourAverage)} against a competitor average of ${HotelOS.money(a.marketAverage)}.`;
  if(opportunities.length)brief+=` The strongest rate opportunities are ${opportunities.join(', ')}, with a combined gain of up to £${Math.round(a.opportunityPerRoom)} per room sold across the week.`;
  if(warnings.length)brief+=` ${warnings.join(', ')} ${warnings.length===1?'is':'are'} currently above the local market and should be reviewed.`;
  const soldOut=a.days.reduce((sum,day)=>sum+day.soldOut,0);
  if(soldOut)brief+=` There are ${soldOut} competitor sold-out indicators across the week, showing pockets of stronger demand.`;
  return brief;
};

HotelOS.positionVisual = function(index) {
  const day=HotelOS.dayAnalysis(index);
  const rows=[];
  const ours=HotelOS.ourHotel();

  if(day.ourPrice){
    rows.push({
      name:ours.name,
      price:day.ourPrice,
      isOurs:true,
      soldOut:false
    });
  }

  day.available.forEach(item=>rows.push({
    name:item.hotel.name,
    price:Number(item.day.price),
    isOurs:false,
    soldOut:false
  }));

  rows.sort((a,b)=>a.price-b.price);

  if(!rows.length){
    return `<div class="mt-4 rounded-xl border border-dashed p-8 text-center text-gray-400">
      Enter Windmill and competitor rates to see the market position.
    </div>`;
  }

  const marketLow=rows[0]?.price||0;
  const marketHigh=rows[rows.length-1]?.price||0;
  const marketSpan=Math.max(1,marketHigh-marketLow);
  const ourRank=rows.findIndex(row=>row.isOurs)+1;

  return `<div class="mt-5">
    <div class="flex items-center justify-between gap-3 text-[12px] font-bold tracking-wide text-gray-400">
      <span>CHEAPEST</span>
      <span>MOST EXPENSIVE</span>
    </div>

    <div class="relative mt-3 h-3 rounded-full bg-gradient-to-r from-green-300 via-amber-300 to-red-300 overflow-visible">
      ${rows.map(row=>{
        const left=((row.price-marketLow)/marketSpan)*100;
        return `<span
          title="${esc(row.name)} — £${row.price}"
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${row.isOurs?'w-5 h-5 bg-olive-700 border-white shadow-lg':'w-3.5 h-3.5 bg-white border-gray-500'}"
          style="left:${Math.max(1,Math.min(99,left))}%">
        </span>`;
      }).join('')}
    </div>

    <div class="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
      ${rows.map((row,rank)=>`
        <div class="rounded-xl border p-3 ${row.isOurs?'border-olive-500 bg-olive-50 ring-2 ring-olive-100':'border-gray-200 bg-white'}">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[12px] font-bold tracking-widest ${row.isOurs?'text-olive-700':'text-gray-400'}">
                ${rank===0?'CHEAPEST':`RANK ${rank+1}`}
              </p>
              <strong class="block mt-1 text-sm leading-snug break-words">${esc(row.name)}</strong>
            </div>
            <strong class="text-lg whitespace-nowrap ${row.isOurs?'text-olive-800':'text-charcoal-900'}">£${row.price}</strong>
          </div>
          ${row.isOurs?`<div class="mt-2 flex items-center justify-between gap-2">
            <span class="badge bg-olive-700 text-white">WINDMILL</span>
            <span class="text-xs font-semibold text-olive-700">${ourRank===1?'Cheapest':ourRank===2?'2nd cheapest':`Rank ${ourRank}`}</span>
          </div>`:''}
        </div>
      `).join('')}
    </div>
  </div>`;
};
HotelOS.printWeeklyReport = function() {
  const a=HotelOS.weekAnalysis(),alerts=HotelOS.smartAlerts(),health=HotelOS.healthScore();
  const popup=window.open('','_blank','width=1100,height=800');
  if(!popup)return toast('Allow pop-ups to print the hotel report','error');
  popup.document.write(`<!doctype html><html><head><title>Hotel Revenue Review</title><style>body{font-family:Arial;margin:30px;color:#17201d}h1,h2{margin-bottom:6px}.box{border:1px solid #dfe5d7;border-radius:10px;padding:14px;margin:12px 0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.kpi{background:#f4f7ef;padding:12px;border-radius:8px}.kpi span{display:block;color:#667;font-size:12px}.kpi strong{display:block;margin-top:4px;font-size:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}.right{text-align:right}@media print{button{display:none}}</style></head><body><h1>Windmill Farm — Hotel Revenue Review</h1><p>Week commencing ${DB.hotelWeek.weekCommencing}</p><div class="grid"><div class="kpi"><span>Windmill Average</span><strong>${HotelOS.money(a.ourAverage)}</strong></div><div class="kpi"><span>Market Average</span><strong>${HotelOS.money(a.marketAverage)}</strong></div><div class="kpi"><span>Position</span><strong>${a.position}</strong></div><div class="kpi"><span>Pricing Health</span><strong>${health.score}/100</strong></div></div><div class="box"><h2>Weekly Brief</h2><p>${HotelOS.weeklyBrief()}</p></div><h2>Daily Recommendations</h2><table><tr><th>Day</th><th class="right">Our Rate</th><th class="right">Market</th><th>Position</th><th class="right">Recommended</th><th>Reason</th></tr>${a.days.map(day=>`<tr><td>${new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'})}</td><td class="right">${HotelOS.money(day.ourPrice)}</td><td class="right">${HotelOS.money(day.average)}</td><td>${day.positionLabel}</td><td class="right">${HotelOS.money(day.recommendation)}</td><td>${day.reason}</td></tr>`).join('')}</table><h2>Alerts</h2>${alerts.map(x=>`<div class="box"><strong>${x.title}</strong><p>${x.detail}</p></div>`).join('')||'<p>No major alerts.</p>'}<script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
};

HotelOS.renderOverview = function() {
  const analysis=HotelOS.weekAnalysis();
  const health=HotelOS.healthScore();
  const alerts=HotelOS.smartAlerts();
  const changes=HotelOS.weekChanges();
  return `<div class="space-y-4">
    <section class="rounded-2xl border border-olive-200 bg-gradient-to-r from-olive-50 to-white p-5 shadow-sm">
      <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-olive-600">WEEKLY REVENUE BRIEF</p><h3 class="text-2xl font-bold mt-1">What the market is telling us</h3><p class="text-sm text-gray-600 mt-3 max-w-4xl leading-relaxed">${HotelOS.weeklyBrief()}</p></div><div class="flex gap-2"><button onclick="HotelOS.printWeeklyReport()" class="px-4 py-2.5 bg-white border rounded-lg font-semibold">Print Weekly Report</button><button onclick="HotelOS.setTab('intelligence')" class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Enter Weekly Prices</button></div></div>
    </section>
    <section class="grid grid-cols-2 xl:grid-cols-5 gap-3">${[
      ['Average Occupancy',analysis.averageOccupancy?`${Math.round(analysis.averageOccupancy)}%`:'—','percent','olive'],['Our Average Rate',HotelOS.money(analysis.ourAverage),'bed-double','olive'],['Competitor Average',HotelOS.money(analysis.marketAverage),'building-2','gold'],['Price Risk Days',String(analysis.priceRiskDays),'triangle-alert',analysis.priceRiskDays?'red':'green'],['Pricing Health',`${health.score}/100`,'heart-pulse',health.score>=75?'green':'red']
    ].map(([label,value,icon,tone])=>kpi(label,value,icon,tone)).join('')}</section>
    <div class="grid xl:grid-cols-[1fr_340px] gap-4">
      <section class="section-card">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 class="font-bold text-lg">Smart Alert Centre</h3>
            <p class="text-sm text-gray-500">Every material pricing opportunity, event and sold-out signal for this week.</p>
          </div>
          <span class="badge bg-olive-100 text-olive-700 self-start">${alerts.length} alert${alerts.length===1?'':'s'}</span>
        </div>
        <div class="grid md:grid-cols-2 2xl:grid-cols-3 gap-3 mt-4">
          ${alerts.length?alerts.map((x,alertIndex)=>`
            <div class="rounded-xl border p-4 min-h-[102px] flex gap-3 ${
              x.tone==='red'?'border-red-200 bg-red-50':
              x.tone==='gold'?'border-gold-200 bg-gold-50':
              'border-green-200 bg-green-50'
            }">
              <span class="mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                x.tone==='red'?'bg-red-100 text-red-700':
                x.tone==='gold'?'bg-gold-100 text-gold-700':
                'bg-green-100 text-green-700'
              }">
                <i data-lucide="${x.tone==='red'?'alert-triangle':x.tone==='gold'?'calendar-days':'trending-up'}" style="width:16px;height:16px"></i>
              </span>
              <div class="min-w-0">
                <strong class="block text-sm leading-snug">${esc(x.title)}</strong>
                <p class="text-xs leading-relaxed text-gray-600 mt-1.5 break-words">${esc(x.detail)}</p>
              </div>
            </div>
          `).join(''):'<div class="p-6 text-center text-gray-400 border border-dashed rounded-xl md:col-span-2 2xl:col-span-3">Complete the weekly price grid to generate alerts.</div>'}
        </div>
      </section>
      <section class="section-card"><h3 class="font-bold text-lg">Pricing Health</h3><div class="flex items-center gap-4 mt-4"><div class="w-20 h-20 rounded-full grid place-items-center border-[8px] ${health.score>=75?'border-green-200 text-green-700':'border-amber-200 text-amber-700'}"><strong class="text-xl">${health.score}</strong></div><div><strong>${health.label}</strong><p class="text-xs text-gray-500 mt-1">Based on completeness, competitor coverage and pricing anomalies.</p></div></div><div class="space-y-2 mt-4">${health.reasons.length?health.reasons.map(x=>`<p class="text-xs p-2 rounded-lg bg-cream-50">• ${esc(x)}</p>`).join(''):'<p class="text-xs text-green-700">The weekly review is complete and well supported.</p>'}</div></section>
    </div>
    <section class="section-card"><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"><div><h3 class="font-bold text-lg">Daily Revenue Opportunities</h3><p class="text-sm text-gray-500">Current rate, recommendation and gain per room sold.</p></div></div><div class="grid md:grid-cols-2 xl:grid-cols-7 gap-2 mt-4">${analysis.days.map(day=>{const d=new Date(day.date+'T12:00:00');return `<button onclick="HotelOS.setSelectedDay(${day.index})" class="text-left rounded-xl border p-3 ${HotelOS.selectedDay===day.index?'border-olive-600 ring-2 ring-olive-100':''}"><p class="text-xs font-bold text-olive-700">${d.toLocaleDateString('en-GB',{weekday:'short'}).toUpperCase()}</p><p class="text-xs text-gray-400">${d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p><div class="mt-3 flex justify-between text-xs"><span>Occupancy</span><strong class="${day.occupancy!==null&&day.occupancy<50?'text-red-700':day.occupancy!==null&&day.occupancy>=80?'text-green-700':''}">${day.occupancy===null?'—':`${Math.round(day.occupancy)}%`}</strong></div><div class="mt-1 flex justify-between text-xs"><span>Current</span><strong>${HotelOS.money(day.ourPrice)}</strong></div><div class="mt-1 flex justify-between text-xs"><span>Suggested</span><strong class="text-olive-700">${HotelOS.money(day.recommendation)}</strong></div><div class="mt-3 text-center rounded-lg ${day.rateOpportunity>0?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'} py-1.5 text-xs font-bold">${day.rateOpportunity>0?`+£${Math.round(day.rateOpportunity)} per room`:'No uplift'}</div></button>`}).join('')}</div></section>
    <section class="section-card"><div class="flex justify-between"><div><h3 class="font-bold text-lg">Daily Market Position</h3><p class="text-sm text-gray-500">Select a day to see Windmill ranked against available competitors.</p></div><select onchange="HotelOS.setSelectedDay(this.value)" class="px-3 py-2 border rounded-lg">${analysis.days.map(day=>`<option value="${day.index}" ${HotelOS.selectedDay===day.index?'selected':''}>${new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long'})}</option>`).join('')}</select></div>${HotelOS.positionVisual(HotelOS.selectedDay)}</section>
    ${changes.length?`<section class="section-card"><h3 class="font-bold text-lg">What Changed Since Last Monday?</h3><p class="text-sm text-gray-500 mt-1">Compared with the latest archived competitor snapshot.</p><div class="grid md:grid-cols-2 xl:grid-cols-3 gap-2 mt-4">${changes.slice(0,9).map(change=>`<div class="rounded-xl border p-3"><strong class="text-sm">${esc(change.hotel)} · ${new Date(HotelOS.dayDate(change.index)+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'})}</strong><p class="text-xs mt-2 ${change.type==='availability'?'text-red-700':change.difference>0?'text-green-700':'text-red-700'}">${change.type==='availability'?`${change.from} → ${change.to}`:`£${change.from} → £${change.to} (${change.difference>0?'+':''}£${change.difference})`}</p></div>`).join('')}</div></section>`:''}
  </div>`;
};
HotelOS.renderIntelligence = function() {
  const days=Array.from({length:7},(_,index)=>{
    const date=new Date(HotelOS.dayDate(index)+'T12:00:00');
    return {index,label:date.toLocaleDateString('en-GB',{weekday:'short'}),date:date.toLocaleDateString('en-GB',{day:'numeric',month:'short'})};
  });

  return `<div class="space-y-4">
    <section class="section-card">
      <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">MONDAY PRICING REVIEW</p>
          <h3 class="text-2xl font-bold mt-1">Market Intelligence</h3>
          <p class="text-sm text-gray-500 mt-1">Enter next week's public room-only rates and Windmill occupancy. Tick Sold Out where a competitor has no room available.</p>
        </div>
        <div class="flex flex-wrap gap-2 items-end">
          <label class="text-xs text-gray-600">Week commencing
            <input type="date" value="${DB.hotelWeek.weekCommencing}" onchange="HotelOS.updateWeekDate(this.value)" class="mt-1 px-3 py-2.5 border rounded-lg">
          </label>
          <button onclick="HotelOS.copyPreviousWeek()" class="px-4 py-2.5 bg-white border rounded-lg font-semibold">Copy Previous Week</button>
          <button onclick="HotelOS.printWeeklyReport()" class="px-4 py-2.5 bg-white border rounded-lg font-semibold">Print Report</button><button onclick="HotelOS.archiveWeek()" class="px-4 py-2.5 bg-gold-500 text-white rounded-lg font-semibold">Archive Summary</button>
          <button onclick="HotelOS.startNewWeek()" class="px-4 py-2.5 bg-charcoal-900 text-white rounded-lg font-semibold">Start New Week</button>
        </div>
      </div>

      <div class="overflow-x-auto mt-5 border rounded-xl">
        <table class="w-full min-w-[1300px] text-sm">
          <thead class="bg-cream-50">
            <tr>
              <th class="text-left px-3 py-3 sticky left-0 bg-cream-50 z-10 min-w-[230px]">Hotel</th>
              ${days.map(day=>`<th class="text-center px-2 py-3 min-w-[135px]"><strong>${day.label}</strong><span class="block text-[12px] text-gray-400">${day.date}</span></th>`).join('')}
            </tr>
          </thead>
          <tbody>${DB.hotelWeek.hotels.map(hotel=>`<tr class="border-t ${hotel.isOurs?'bg-olive-50':''}">
            <td class="px-3 py-3 sticky left-0 ${hotel.isOurs?'bg-olive-50':'bg-white'} z-10">
              ${hotel.isOurs?`<strong class="text-olive-800">${esc(hotel.name)}</strong><span class="block text-xs text-gray-400">Our public rate</span>`:`<input value="${esc(hotel.name)}" onchange="HotelOS.updateHotelName('${hotel.id}',this.value)" class="w-full px-2 py-2 border rounded-lg font-semibold">`}
            </td>
            ${hotel.days.map((day,index)=>`<td class="px-2 py-2 align-top">
              <div class="rounded-lg border bg-white p-2">
                <label class="text-[12px] text-gray-500">Price
                  <div class="relative mt-1"><span class="absolute left-2 top-2 text-gray-400">£</span><input type="number" min="0" step="1" value="${day.price}" ${day.soldOut?'disabled':''} oninput="HotelOS.updatePrice('${hotel.id}',${index},this.value)" class="w-full pl-6 pr-2 py-1.5 border rounded-lg ${day.soldOut?'bg-gray-100':''}"></div>
                </label>
                ${hotel.isOurs?`<label class="text-[12px] text-gray-500 block mt-2">Occupancy
                  <div class="relative mt-1"><input type="number" min="0" max="100" step="1" value="${day.occupancy??''}" oninput="HotelOS.updateOccupancy(${index},this.value)" placeholder="%" class="w-full pr-7 pl-2 py-1.5 border rounded-lg"><span class="absolute right-2 top-2 text-gray-400">%</span></div>
                </label>`:`<label class="flex items-center gap-2 mt-2 text-[12px] text-gray-500"><input type="checkbox" ${day.soldOut?'checked':''} onchange="HotelOS.updateSoldOut('${hotel.id}',${index},this.checked)">Sold Out</label>`}
              </div>
            </td>`).join('')}
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </section>

    <section class="section-card" id="hotel-grid-summary">${HotelOS.renderGridSummary()}</section>

    <section class="section-card">
      <h3 class="font-bold text-lg">Daily Recommendations</h3>
      <p class="text-sm text-gray-500 mt-1">Recommendations now combine Windmill occupancy with competitor rates, sold-out indicators and key-event uplifts. This helps distinguish a genuine pricing problem from strong demand.</p>
      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">${HotelOS.weekAnalysis().days.map(day=>{
        const date=new Date(day.date+'T12:00:00');
        return `<div class="rounded-xl border p-4 ${day.tone==='over'?'border-red-200 bg-red-50/50':day.tone==='under'?'border-green-200 bg-green-50/50':''}">
          <div class="flex justify-between gap-2"><div><strong>${date.toLocaleDateString('en-GB',{weekday:'long'})}</strong><p class="text-xs text-gray-400">${date.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p></div><span class="badge bg-olive-100 text-olive-700">${day.confidence}</span></div>
          <div class="grid grid-cols-2 gap-2 mt-3"><div><p class="text-xs text-gray-500">Occupancy</p><p class="font-bold ${day.occupancy!==null&&day.occupancy<50?'text-red-700':day.occupancy!==null&&day.occupancy>=80?'text-green-700':''}">${day.occupancy===null?'—':`${Math.round(day.occupancy)}%`}</p></div><div><p class="text-xs text-gray-500">Our / Market</p><p class="font-bold">${HotelOS.money(day.ourPrice)} / ${HotelOS.money(day.average)}</p></div></div>
          <p class="text-xs text-gray-500 mt-3">Recommendation</p><p class="text-xl font-bold text-olive-800">${HotelOS.money(day.recommendation)}</p>
          <p class="text-xs text-gray-600 mt-2 leading-relaxed">${day.reason}</p>
        </div>`;
      }).join('')}</div>
    </section>
  </div>`;
};

HotelOS.renderEvents = function() {
  const events=[...DB.hotelEvents].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  return `<section class="section-card">
    <div class="flex justify-between gap-3 items-start">
      <div><h3 class="text-xl font-bold">Key Market Events</h3><p class="text-sm text-gray-500 mt-1">Record concerts, shows, graduations and other dates that may support a higher room rate.</p></div>
      <button onclick="HotelOS.openEvent()" class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">+ Add Event</button>
    </div>
    <div class="space-y-2 mt-4">${events.length?events.map(event=>`<div class="rounded-xl border p-4 grid md:grid-cols-[120px_1fr_120px_130px_auto] items-center gap-3">
      <strong class="text-olive-700">${new Date(event.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</strong>
      <div><strong>${esc(event.title)}</strong><p class="text-xs text-gray-500 mt-1">${esc(event.notes||'')}</p></div>
      <span class="badge bg-gold-100 text-gold-700">${esc(event.impact)}</span>
      <strong>Suggested +£${Number(event.suggestedIncrease||0)}</strong>
      <div><button onclick="HotelOS.openEvent('${event.id}')" class="px-3 py-2 bg-olive-100 text-olive-700 rounded-lg">Edit</button> <button onclick="HotelOS.deleteEvent('${event.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg">Delete</button></div>
    </div>`).join(''):`<div class="rounded-xl border border-dashed p-10 text-center text-gray-400">No key events added yet.</div>`}</div>
  </section>`;
};

HotelOS.renderHistory = function() {
  return `<section class="section-card">
    <div><h3 class="text-xl font-bold">Weekly Summary History</h3><p class="text-sm text-gray-500 mt-1">Only the latest 20 summaries are retained. Detailed competitor rows are kept inside the snapshot so Copy Previous Week can work.</p></div>
    <div class="overflow-x-auto mt-4"><table class="w-full min-w-[900px] text-sm"><thead class="bg-cream-50 text-xs text-gray-500"><tr><th class="text-left px-3 py-3">Week</th><th class="text-right px-3 py-3">Our Average</th><th class="text-right px-3 py-3">Market Average</th><th class="text-left px-3 py-3">Position</th><th class="text-right px-3 py-3">Recommended Average</th><th class="text-right px-3 py-3">Rate Gain / Room</th><th class="text-left px-3 py-3">Notes</th></tr></thead><tbody>${DB.hotelHistory.length?DB.hotelHistory.map(item=>`<tr class="border-t"><td class="px-3 py-3 font-semibold">${item.weekCommencing}</td><td class="px-3 py-3 text-right">${HotelOS.money(item.ourAverage)}</td><td class="px-3 py-3 text-right">${HotelOS.money(item.marketAverage)}</td><td class="px-3 py-3">${esc(item.position)}</td><td class="px-3 py-3 text-right">${HotelOS.money(item.recommendedAverage)}</td><td class="px-3 py-3 text-right">${item.rateOpportunityPerRoom>0?`+£${Math.round(item.rateOpportunityPerRoom)}`:'£0'}</td><td class="px-3 py-3">${esc(item.notes||'')}</td></tr>`).join(''):`<tr><td colspan="7" class="p-10 text-center text-gray-400">Archive the first completed Monday review to begin the history.</td></tr>`}</tbody></table></div>
  </section>`;
};

function renderHotel() {
  HotelOS.ensureData();
  const tabs=[['overview','Overview'],['intelligence','Market Intelligence'],['events','Key Events'],['history','History']];
  const content=HotelOS.activeTab==='intelligence'?HotelOS.renderIntelligence():HotelOS.activeTab==='events'?HotelOS.renderEvents():HotelOS.activeTab==='history'?HotelOS.renderHistory():HotelOS.renderOverview();

  return `<div class="rounded-2xl overflow-hidden mb-4 border border-olive-100 shadow-sm bg-white">
    <div class="p-5 bg-gradient-to-r from-[#27382f] via-[#45613b] to-[#798f4f] text-white">
      <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div><p class="text-xs font-bold tracking-[.2em] text-gold-300">WINDMILL FARM HOTEL</p><h2 class="text-3xl font-bold mt-1">Hotel Revenue Centre</h2><p class="text-sm text-white/75 mt-2 max-w-3xl">One view of Windmill occupancy and market pricing: see when low occupancy may be linked to price, when demand supports a premium, and where the week needs action.</p></div>
        <div class="flex flex-wrap gap-2"><button onclick="HotelOS.setTab('intelligence')" class="px-4 py-2.5 rounded-lg bg-white text-olive-800 font-semibold">Enter Weekly Prices</button><button onclick="HotelOS.openEvent()" class="px-4 py-2.5 rounded-lg bg-gold-400 text-charcoal-900 font-semibold">+ Key Event</button></div>
      </div>
    </div>
    <div class="p-3 flex flex-wrap gap-2 bg-white">${tabs.map(([key,label])=>`<button onclick="HotelOS.setTab('${key}')" class="px-4 py-2 rounded-lg text-sm font-semibold ${HotelOS.activeTab===key?'bg-olive-700 text-white':'bg-cream-50 text-gray-700 hover:bg-olive-50'}">${label}</button>`).join('')}</div>
  </div>${content}`;
}
