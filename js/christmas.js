
// ============================================================================
// WINDMILL FARM CHRISTMAS COMMAND CENTRE
// Built from the operational structure of the 2025 Christmas planning files.
// Customer names and historic bookings are deliberately not imported.
// ============================================================================

window.ChristmasOS = window.ChristmasOS || {
  activeTab: 'overview',
  dayView: 'bookings',
  currentYear: new Date().getFullYear(),
  selectedBookingId: null,
  selectedEventId: null,
  eventWorkspaceTab: 'command'
};

ChristmasOS.uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

ChristmasOS.defaultMenu = () => ({
  starters: [
    'Spiced Winter Vegetable Soup',
    'Garlic Mushroom Bruschetta',
    'Chicken Liver Pâté',
    'Smoked Salmon & King Prawns',
    'Children’s Starter',
    'Dietary / Alternative Starter'
  ],
  mains: [
    'Festive Carvery',
    'Vegetarian Christmas Carvery',
    'Salmon with Chardonnay Sauce',
    'Vegan Nut Roast',
    'Winter Warmer Pie',
    'Children’s Festive Carvery',
    'Children’s Alternative Main',
    'Dietary / Alternative Main'
  ],
  desserts: [
    'Christmas Pudding',
    'Vegan Christmas Dessert',
    'Cheese & Biscuits',
    'Celebration Cake',
    'Carrot Cake',
    'Children’s Dessert',
    'Dietary / Alternative Dessert'
  ]
});

ChristmasOS.ensureData = function() {
  DB.christmasBookings = Array.isArray(DB.christmasBookings) ? DB.christmasBookings : [];
  DB.christmasEvents = Array.isArray(DB.christmasEvents) ? DB.christmasEvents : [];
  DB.christmasDates = Array.isArray(DB.christmasDates) ? DB.christmasDates : [];
  DB.christmasOperations = Array.isArray(DB.christmasOperations) ? DB.christmasOperations : [];
  DB.christmasConfig = DB.christmasConfig && typeof DB.christmasConfig === 'object' ? DB.christmasConfig : {};
  DB.christmasImports = Array.isArray(DB.christmasImports) ? DB.christmasImports : [];
  DB.christmasCampaigns = Array.isArray(DB.christmasCampaigns) ? DB.christmasCampaigns : [];
  DB.christmasArchives = Array.isArray(DB.christmasArchives) ? DB.christmasArchives : [];
  DB.christmasLeads = Array.isArray(DB.christmasLeads) ? DB.christmasLeads : [];
  DB.christmasAssets = Array.isArray(DB.christmasAssets) ? DB.christmasAssets : [];

  if (!DB.christmasConfig.year) DB.christmasConfig.year = ChristmasOS.currentYear;
  if (!DB.christmasConfig.salesTarget) DB.christmasConfig.salesTarget = 40000;
  if (!DB.christmasConfig.dayCapacity) DB.christmasConfig.dayCapacity = 600;
  if (!DB.christmasConfig.depositPerPerson) DB.christmasConfig.depositPerPerson = 10;
  if (!DB.christmasConfig.adultPrice) DB.christmasConfig.adultPrice = 0;
  if (!DB.christmasConfig.childPrice) DB.christmasConfig.childPrice = 0;
  if (!DB.christmasConfig.menu) DB.christmasConfig.menu = ChristmasOS.defaultMenu();

  if (!Array.isArray(DB.christmasConfig.dineInSlots) || !DB.christmasConfig.dineInSlots.length) {
    DB.christmasConfig.dineInSlots = [
      '11:45','12:00','12:15','12:30','13:00','13:15','13:30',
      '14:45','15:00','15:15','15:30'
    ].map(time => ({id:ChristmasOS.uid('slot'), time, capacity:60}));
  }

  if (!Array.isArray(DB.christmasConfig.collectionSlots) || !DB.christmasConfig.collectionSlots.length) {
    DB.christmasConfig.collectionSlots = ['11:15','11:30','11:45']
      .map(time => ({id:ChristmasOS.uid('collection'), time, capacity:30}));
  }

  if (!DB.christmasDates.length) {
    DB.christmasDates = [
      {id:ChristmasOS.uid('date'), title:'Christmas strategy and budget agreed', date:`${ChristmasOS.currentYear}-08-31`, owner:'Management', status:'Not Started', category:'Planning'},
      {id:ChristmasOS.uid('date'), title:'Menus, pricing and booking terms confirmed', date:`${ChristmasOS.currentYear}-09-15`, owner:'Management', status:'Not Started', category:'Commercial'},
      {id:ChristmasOS.uid('date'), title:'Christmas Day pre-order deadline', date:`${ChristmasOS.currentYear}-12-01`, owner:'Reception & Sales', status:'Not Started', category:'Christmas Day'},
      {id:ChristmasOS.uid('date'), title:'Christmas Day final-payment deadline', date:`${ChristmasOS.currentYear}-12-05`, owner:'Reception & Sales', status:'Not Started', category:'Finance'},
      {id:ChristmasOS.uid('date'), title:'Christmas Day final operational sign-off', date:`${ChristmasOS.currentYear}-12-20`, owner:'Management', status:'Not Started', category:'Operations'}
    ];
  }

  if (!DB.christmasOperations.length) {
    DB.christmasOperations = [
      {id:ChristmasOS.uid('op'), area:'Front of House', title:'Arrival and table-check process confirmed', owner:'', due:'', status:'Not Started', notes:''},
      {id:ChristmasOS.uid('op'), area:'Kitchen', title:'Menu totals and dietary requirements signed off', owner:'', due:'', status:'Not Started', notes:''},
      {id:ChristmasOS.uid('op'), area:'Finance', title:'Every guest payment checked against booking value', owner:'', due:'', status:'Not Started', notes:''},
      {id:ChristmasOS.uid('op'), area:'Click & Collect', title:'Collection point, boxing, quality check and bagging roles allocated', owner:'', due:'', status:'Not Started', notes:''},
      {id:ChristmasOS.uid('op'), area:'Staffing', title:'Shift brief and timed deployment plan completed', owner:'', due:'', status:'Not Started', notes:''},
      {id:ChristmasOS.uid('op'), area:'Service', title:'Time-slot covers checked against operational capacity', owner:'', due:'', status:'Not Started', notes:''}
    ];
  }

  saveDB();
};

ChristmasOS.money = value => `£${Number(value || 0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
ChristmasOS.bookingCovers = booking => (booking.guests || []).length || Number(booking.adults || 0) + Number(booking.children || 0);
ChristmasOS.bookingDue = booking => (booking.guests || []).reduce((sum,guest)=>sum+Number(guest.amountDue||0),0) || Number(booking.totalValue||0);
ChristmasOS.bookingPaid = booking => (booking.guests || []).reduce((sum,guest)=>sum+Number(guest.amountPaid||0),0) || Number(booking.amountPaid||0);
ChristmasOS.bookingBalance = booking => ChristmasOS.bookingDue(booking) - ChristmasOS.bookingPaid(booking);
ChristmasOS.menuComplete = booking => {
  const guests = booking.guests || [];
  return guests.length > 0 && guests.every(guest => guest.starter && guest.main && guest.dessert);
};
ChristmasOS.paymentComplete = booking => ChristmasOS.bookingBalance(booking) <= 0.009;

ChristmasOS.setTab = function(tab) {
  ChristmasOS.activeTab = tab;
  if(window.AppRouter)AppRouter.commit(`/christmas/${encodeURIComponent(tab)}`);
  renderSection();
};

ChristmasOS.setDayView = function(view) {
  ChristmasOS.dayView = view;
  renderSection();
};

ChristmasOS.summary = function() {
  const bookings = DB.christmasBookings || [];
  const covers = bookings.reduce((sum,booking)=>sum+ChristmasOS.bookingCovers(booking),0);
  const value = bookings.reduce((sum,booking)=>sum+ChristmasOS.bookingDue(booking),0);
  const paid = bookings.reduce((sum,booking)=>sum+ChristmasOS.bookingPaid(booking),0);
  const outstanding = value-paid;
  const menuComplete = bookings.filter(ChristmasOS.menuComplete).length;
  const paymentComplete = bookings.filter(ChristmasOS.paymentComplete).length;
  return {bookings,covers,value,paid,outstanding,menuComplete,paymentComplete};
};

ChristmasOS.openBooking = function(id='') {
  const existing = id ? DB.christmasBookings.find(item=>item.id===id) : null;
  const booking = existing ? JSON.parse(JSON.stringify(existing)) : {
    id:ChristmasOS.uid('xmas-booking'),
    leadName:'',
    phone:'',
    email:'',
    bookingType:'Dine In',
    timeSlot:DB.christmasConfig.dineInSlots[0]?.time || '',
    tableNumber:'',
    notes:'',
    guests:[]
  };
  ChristmasOS.bookingDraft = booking;
  ChristmasOS.renderBookingModal();
};

ChristmasOS.renderBookingModal = function() {
  const booking = ChristmasOS.bookingDraft;
  const dineSlots = DB.christmasConfig.dineInSlots || [];
  const collectionSlots = DB.christmasConfig.collectionSlots || [];
  const slots = booking.bookingType === 'Click & Collect' ? collectionSlots : dineSlots;

  openModal(`<div class="p-5 max-w-6xl">
    <div class="flex justify-between gap-4 items-start mb-5">
      <div>
        <p class="text-xs font-bold tracking-widest text-red-600">CHRISTMAS DAY BOOKING</p>
        <h2 class="text-2xl font-bold">${DB.christmasBookings.some(item=>item.id===booking.id)?'Edit Booking':'Add Booking'}</h2>
        <p class="text-sm text-gray-500 mt-1">Track every guest, menu choice and payment individually.</p>
      </div>
      <button onclick="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="x"></i></button>
    </div>

    <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
      <label class="text-xs text-gray-600">Lead guest / booking name
        <input id="xmas-lead-name" value="${esc(booking.leadName||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
      </label>
      <label class="text-xs text-gray-600">Telephone
        <input id="xmas-phone" value="${esc(booking.phone||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
      </label>
      <label class="text-xs text-gray-600">Email
        <input id="xmas-email" value="${esc(booking.email||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
      </label>
      <label class="text-xs text-gray-600">Booking type
        <select id="xmas-booking-type" onchange="ChristmasOS.bookingDraft.bookingType=this.value;ChristmasOS.renderBookingModal()" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
          ${['Dine In','Click & Collect'].map(value=>`<option ${booking.bookingType===value?'selected':''}>${value}</option>`).join('')}
        </select>
      </label>
      <label class="text-xs text-gray-600">Time slot
        <select id="xmas-time-slot" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
          ${slots.map(slot=>`<option value="${slot.time}" ${booking.timeSlot===slot.time?'selected':''}>${slot.time}</option>`).join('')}
        </select>
      </label>
      <label class="text-xs text-gray-600">Table / order number
        <input id="xmas-table" value="${esc(booking.tableNumber||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
      </label>
      <label class="text-xs text-gray-600 md:col-span-2">Booking notes / exceptions
        <input id="xmas-booking-notes" value="${esc(booking.notes||'')}" placeholder="Dietary notes, special collection instruction, table change..." class="mt-1 w-full px-3 py-2.5 border rounded-lg">
      </label>
    </div>

    <div class="mt-5 flex items-center justify-between gap-3">
      <div>
        <h3 class="font-bold text-lg">People on this booking</h3>
        <p class="text-xs text-gray-500">Payment is tracked against each person, not just the booking total.</p>
      </div>
      <button onclick="ChristmasOS.addGuestDraft()" class="px-4 py-2.5 rounded-lg bg-olive-700 text-white font-semibold">+ Add Person</button>
    </div>

    <div class="mt-3 overflow-x-auto border rounded-xl">
      <table class="w-full min-w-[1100px] text-sm">
        <thead class="bg-cream-50 text-xs text-gray-500">
          <tr>
            <th class="text-left px-3 py-3">Guest</th>
            <th class="text-left px-3 py-3">Type</th>
            <th class="text-left px-3 py-3">Starter</th>
            <th class="text-left px-3 py-3">Main</th>
            <th class="text-left px-3 py-3">Dessert</th>
            <th class="text-right px-3 py-3">Due</th>
            <th class="text-right px-3 py-3">Paid</th>
            <th class="text-center px-3 py-3">Status</th>
            <th class="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody id="xmas-guest-rows"></tbody>
      </table>
    </div>

    <div class="mt-5 flex justify-end gap-2">
      <button onclick="closeModal()" class="px-4 py-2.5 bg-gray-100 rounded-lg font-semibold">Cancel</button>
      <button onclick="ChristmasOS.saveBookingDraft()" class="px-5 py-2.5 bg-red-700 text-white rounded-lg font-semibold">Save Christmas Booking</button>
    </div>
  </div>`);
  ChristmasOS.renderGuestRows();
};

ChristmasOS.captureBookingHeader = function() {
  const booking = ChristmasOS.bookingDraft;
  booking.leadName = document.getElementById('xmas-lead-name')?.value.trim() || booking.leadName;
  booking.phone = document.getElementById('xmas-phone')?.value.trim() || '';
  booking.email = document.getElementById('xmas-email')?.value.trim() || '';
  booking.bookingType = document.getElementById('xmas-booking-type')?.value || booking.bookingType;
  booking.timeSlot = document.getElementById('xmas-time-slot')?.value || booking.timeSlot;
  booking.tableNumber = document.getElementById('xmas-table')?.value.trim() || '';
  booking.notes = document.getElementById('xmas-booking-notes')?.value.trim() || '';
};

ChristmasOS.addGuestDraft = function() {
  ChristmasOS.captureBookingHeader();
  const defaultDue = Number(DB.christmasConfig.adultPrice || 0);
  ChristmasOS.bookingDraft.guests.push({
    id:ChristmasOS.uid('xmas-guest'),
    name:'',
    guestType:'Adult',
    starter:'',
    main:'',
    dessert:'',
    dietary:'',
    amountDue:defaultDue,
    amountPaid:0
  });
  ChristmasOS.renderGuestRows();
};

ChristmasOS.removeGuestDraft = function(id) {
  ChristmasOS.bookingDraft.guests = ChristmasOS.bookingDraft.guests.filter(guest=>guest.id!==id);
  ChristmasOS.renderGuestRows();
};

ChristmasOS.updateGuestDraft = function(id,field,value) {
  const guest = ChristmasOS.bookingDraft.guests.find(item=>item.id===id);
  if (!guest) return;
  if (['amountDue','amountPaid'].includes(field)) value = Number(value||0);
  guest[field] = value;
  if (field === 'guestType' && Number(guest.amountDue||0) === 0) {
    guest.amountDue = value === 'Child' ? Number(DB.christmasConfig.childPrice||0) : Number(DB.christmasConfig.adultPrice||0);
  }
  ChristmasOS.renderGuestRows(false);
};

ChristmasOS.renderGuestRows = function(refreshIcons=true) {
  const host = document.getElementById('xmas-guest-rows');
  if (!host) return;
  const menu = DB.christmasConfig.menu || ChristmasOS.defaultMenu();

  const options = (values,selected) => `<option value="">Not selected</option>${values.map(value=>`<option value="${esc(value)}" ${selected===value?'selected':''}>${esc(value)}</option>`).join('')}`;

  host.innerHTML = ChristmasOS.bookingDraft.guests.length ? ChristmasOS.bookingDraft.guests.map(guest => {
    const balance = Number(guest.amountDue||0)-Number(guest.amountPaid||0);
    const status = balance <= .009 ? 'Paid' : guest.amountPaid > 0 ? 'Part Paid' : 'Unpaid';
    return `<tr class="border-t">
      <td class="px-3 py-2"><input value="${esc(guest.name||'')}" onchange="ChristmasOS.updateGuestDraft('${guest.id}','name',this.value)" class="w-40 px-2 py-2 border rounded-lg" placeholder="Guest name"></td>
      <td class="px-3 py-2"><select onchange="ChristmasOS.updateGuestDraft('${guest.id}','guestType',this.value)" class="px-2 py-2 border rounded-lg">${['Adult','Child'].map(value=>`<option ${guest.guestType===value?'selected':''}>${value}</option>`).join('')}</select></td>
      <td class="px-3 py-2"><select onchange="ChristmasOS.updateGuestDraft('${guest.id}','starter',this.value)" class="w-48 px-2 py-2 border rounded-lg">${options(menu.starters||[],guest.starter)}</select></td>
      <td class="px-3 py-2"><select onchange="ChristmasOS.updateGuestDraft('${guest.id}','main',this.value)" class="w-48 px-2 py-2 border rounded-lg">${options(menu.mains||[],guest.main)}</select></td>
      <td class="px-3 py-2"><select onchange="ChristmasOS.updateGuestDraft('${guest.id}','dessert',this.value)" class="w-48 px-2 py-2 border rounded-lg">${options(menu.desserts||[],guest.dessert)}</select></td>
      <td class="px-3 py-2"><input type="number" step="0.01" value="${Number(guest.amountDue||0)}" onchange="ChristmasOS.updateGuestDraft('${guest.id}','amountDue',this.value)" class="w-24 px-2 py-2 border rounded-lg text-right"></td>
      <td class="px-3 py-2"><input type="number" step="0.01" value="${Number(guest.amountPaid||0)}" onchange="ChristmasOS.updateGuestDraft('${guest.id}','amountPaid',this.value)" class="w-24 px-2 py-2 border rounded-lg text-right"></td>
      <td class="px-3 py-2 text-center"><span class="badge ${status==='Paid'?'bg-green-100 text-green-700':status==='Part Paid'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}">${status}<br>${balance>0?ChristmasOS.money(balance):''}</span></td>
      <td class="px-3 py-2"><button onclick="ChristmasOS.removeGuestDraft('${guest.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" style="width:15px;height:15px"></i></button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="9" class="p-8 text-center text-gray-400">Add each adult and child on the booking.</td></tr>`;

  if (refreshIcons && window.lucide) lucide.createIcons();
};

ChristmasOS.saveBookingDraft = function() {
  ChristmasOS.captureBookingHeader();
  const booking = ChristmasOS.bookingDraft;
  if (!booking.leadName) return toast('Enter the lead guest or booking name','error');
  if (!booking.guests.length) return toast('Add at least one person to the booking','error');
  if (booking.guests.some(guest=>!guest.name)) return toast('Every person needs a name','error');

  const index = DB.christmasBookings.findIndex(item=>item.id===booking.id);
  booking.updatedAt = new Date().toISOString();
  if (index >= 0) DB.christmasBookings[index] = booking;
  else DB.christmasBookings.push({...booking,createdAt:new Date().toISOString()});
  saveDB();
  closeModal();
  renderSection();
  toast(index>=0?'Christmas booking updated':'Christmas booking added');
};

ChristmasOS.deleteBooking = function(id) {
  if (!confirm('Delete this Christmas Day booking?')) return;
  DB.christmasBookings = DB.christmasBookings.filter(item=>item.id!==id);
  saveDB();
  renderSection();
};

ChristmasOS.menuTotals = function() {
  const map = {Starter:{},Main:{},Dessert:{}};
  (DB.christmasBookings||[]).forEach(booking=>(booking.guests||[]).forEach(guest=>{
    [['Starter',guest.starter],['Main',guest.main],['Dessert',guest.dessert]].forEach(([course,item])=>{
      if (!item) return;
      map[course][item]=(map[course][item]||0)+1;
    });
  }));
  return map;
};

ChristmasOS.slotRows = function(type) {
  const slots = type==='Click & Collect' ? DB.christmasConfig.collectionSlots : DB.christmasConfig.dineInSlots;
  return slots.map(slot=>{
    const covers=(DB.christmasBookings||[])
      .filter(booking=>booking.bookingType===type&&booking.timeSlot===slot.time)
      .reduce((sum,booking)=>sum+ChristmasOS.bookingCovers(booking),0);
    return {...slot,covers,remaining:Number(slot.capacity||0)-covers};
  });
};

ChristmasOS.openEvent = function(id='') {
  const item=id?DB.christmasEvents.find(event=>event.id===id):{
    id:ChristmasOS.uid('xmas-event'),title:'',date:'',startTime:'19:00',endTime:'23:30',format:'Party Night',room:'The Granary',
    capacity:0,minimumCovers:0,ticketPrice:0,bookedCovers:0,budget:0,actualCost:0,marketingBudget:0,marketingSpend:0,
    status:'Planning',audience:'',offer:'',message:'',channels:'Facebook, Email, In Venue',owner:'',entertainment:'',
    foodPlan:'',staffingPlan:'',setupPlan:'',salesNotes:'',notes:'',year:Number(DB.christmasConfig.year||ChristmasOS.currentYear)
  };
  openModal(`<div class="p-5 max-w-5xl">
    <div class="flex justify-between gap-4"><div><p class="text-xs font-bold tracking-widest text-red-700">WINDMILL FARM · CHRISTMAS EVENT 360</p><h2 class="text-2xl font-bold">${id?'Edit Event':'Create Christmas Event'}</h2><p class="text-sm text-gray-500 mt-1">Commercial plan, marketing brief and operational shell in one record. Saving it puts the event into the Master Calendar automatically.</p></div><button onclick="closeModal()" class="p-2"><i data-lucide="x"></i></button></div>
    <form onsubmit="ChristmasOS.saveEvent(event,'${item.id}')" class="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
      <label class="text-xs text-gray-600 xl:col-span-2">Event name<input name="title" required value="${esc(item.title||'')}" placeholder="Christmas Party Night" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600">Format<select name="format" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${['Party Night','Turkey & Tinsel','Murder Mystery','New Year’s Eve','Private Christmas Party','Christmas Day','Other'].map(v=>`<option ${item.format===v?'selected':''}>${v}</option>`).join('')}</select></label>
      <label class="text-xs text-gray-600">Status<select name="status" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${['Idea','Planning','On Sale','Selling Strongly','At Risk','Sold Out','Confirmed','Completed','Cancelled'].map(v=>`<option ${item.status===v?'selected':''}>${v}</option>`).join('')}</select></label>
      <label class="text-xs text-gray-600">Date<input name="date" type="date" required value="${item.date||''}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600">Start<input name="startTime" type="time" value="${item.startTime||''}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600">Finish<input name="endTime" type="time" value="${item.endTime||''}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600">Room<input name="room" value="${esc(item.room||'The Granary')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      ${[
        ['capacity','Capacity',item.capacity],['minimumCovers','Minimum viable covers',item.minimumCovers],
        ['ticketPrice','Selling price pp',item.ticketPrice],['bookedCovers','Covers sold',item.bookedCovers],
        ['budget','Event budget',item.budget],['actualCost','Actual event cost',item.actualCost],
        ['marketingBudget','Marketing budget',item.marketingBudget],['marketingSpend','Marketing spend',item.marketingSpend]
      ].map(([name,label,value])=>`<label class="text-xs text-gray-600">${label}<input name="${name}" type="number" step="0.01" value="${Number(value||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>`).join('')}
      <label class="text-xs text-gray-600 xl:col-span-2">Target audience<input name="audience" value="${esc(item.audience||'')}" placeholder="Local businesses, groups, couples, families..." class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600 xl:col-span-2">Offer / reason to book<input name="offer" value="${esc(item.offer||'')}" placeholder="What makes this worth choosing?" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600 xl:col-span-2">Marketing message<input name="message" value="${esc(item.message||'')}" placeholder="The one message every advert should land" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600 xl:col-span-2">Channels<input name="channels" value="${esc(item.channels||'')}" placeholder="Facebook, Email, Posters, Local Businesses..." class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600">Event owner<input name="owner" value="${esc(item.owner||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600">Entertainment / supplier<input name="entertainment" value="${esc(item.entertainment||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <label class="text-xs text-gray-600 xl:col-span-2">Food & drink plan<textarea name="foodPlan" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(item.foodPlan||'')}</textarea></label>
      <label class="text-xs text-gray-600 xl:col-span-2">Room setup / experience<textarea name="setupPlan" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(item.setupPlan||'')}</textarea></label>
      <label class="text-xs text-gray-600 xl:col-span-2">Staffing / execution<textarea name="staffingPlan" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(item.staffingPlan||'')}</textarea></label>
      <label class="text-xs text-gray-600 xl:col-span-2">Sales notes<textarea name="salesNotes" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(item.salesNotes||'')}</textarea></label>
      <label class="text-xs text-gray-600 xl:col-span-4">Event notes<textarea name="notes" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(item.notes||'')}</textarea></label>
      <div class="xl:col-span-4 flex justify-between gap-2 mt-2"><p class="text-xs text-gray-400 self-center">Master Calendar reads Christmas events directly — no duplicate calendar entry is created.</p><div class="flex gap-2"><button type="button" onclick="closeModal()" class="px-4 py-2.5 bg-gray-100 rounded-lg">Cancel</button><button class="px-5 py-2.5 bg-red-800 text-white rounded-lg font-semibold">Save Event 360</button></div></div>
    </form>
  </div>`);
};

ChristmasOS.saveEvent = function(event,id) {
  event.preventDefault();
  const data=new FormData(event.target);
  const previous=DB.christmasEvents.find(row=>row.id===id)||{};
  const item={...previous,id,...Object.fromEntries(data.entries())};
  ['capacity','minimumCovers','ticketPrice','bookedCovers','budget','actualCost','marketingBudget','marketingSpend'].forEach(field=>item[field]=Number(item[field]||0));
  item.year=Number(String(item.date||'').slice(0,4)||DB.christmasConfig.year||ChristmasOS.currentYear);
  const index=DB.christmasEvents.findIndex(row=>row.id===id);
  if(index>=0)DB.christmasEvents[index]=item;else DB.christmasEvents.push(item);
  ChristmasOS.seedEventCampaign(item);
  saveDB();closeModal();renderSection();toast('Christmas Event 360 saved and added to the Master Calendar');
};

ChristmasOS.deleteEvent = function(id) {
  if(!confirm('Delete this Christmas event?'))return;
  DB.christmasEvents=DB.christmasEvents.filter(item=>item.id!==id);saveDB();renderSection();
};

ChristmasOS.openDate = function(id='') {
  const item=id?DB.christmasDates.find(date=>date.id===id):{id:ChristmasOS.uid('xmas-date'),title:'',date:'',owner:'',status:'Not Started',category:'Planning'};
  openModal(`<div class="p-5 max-w-xl">
    <div class="flex justify-between"><h2 class="text-xl font-bold">${id?'Edit Key Date':'Add Key Date'}</h2><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <form onsubmit="ChristmasOS.saveDate(event,'${item.id}')" class="space-y-3 mt-5">
      <label class="text-xs text-gray-600 block">Milestone<input required name="title" value="${esc(item.title||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="text-xs text-gray-600">Date<input required type="date" name="date" value="${item.date||''}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Category<input name="category" value="${esc(item.category||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Owner<input name="owner" value="${esc(item.owner||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
        <label class="text-xs text-gray-600">Status<select name="status" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${['Not Started','In Progress','Completed','At Risk'].map(value=>`<option ${item.status===value?'selected':''}>${value}</option>`).join('')}</select></label>
      </div>
      <div class="flex justify-end gap-2"><button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button><button class="px-4 py-2 bg-red-700 text-white rounded-lg">Save</button></div>
    </form>
  </div>`);
};

ChristmasOS.saveDate = function(event,id) {
  event.preventDefault();const item={id,...Object.fromEntries(new FormData(event.target).entries())};
  const index=DB.christmasDates.findIndex(row=>row.id===id);if(index>=0)DB.christmasDates[index]=item;else DB.christmasDates.push(item);
  saveDB();closeModal();renderSection();
};

ChristmasOS.updateOperation = function(id,field,value) {
  const item=DB.christmasOperations.find(row=>row.id===id);if(!item)return;item[field]=value;saveDB();
};

ChristmasOS.saveSettings = function() {
  DB.christmasConfig.salesTarget=Number(document.getElementById('xmas-sales-target')?.value||0);
  DB.christmasConfig.dayCapacity=Number(document.getElementById('xmas-day-capacity')?.value||0);
  DB.christmasConfig.adultPrice=Number(document.getElementById('xmas-adult-price')?.value||0);
  DB.christmasConfig.childPrice=Number(document.getElementById('xmas-child-price')?.value||0);
  saveDB();renderSection();toast('Christmas settings saved');
};

ChristmasOS.printDayPack = function() {
  const summary=ChristmasOS.summary();
  const totals=ChristmasOS.menuTotals();
  const popup=window.open('','_blank','width=1100,height=800');
  if(!popup)return toast('Allow pop-ups to print the Christmas Day pack','error');

  const bookings=[...DB.christmasBookings].sort((a,b)=>String(a.timeSlot).localeCompare(String(b.timeSlot)));
  popup.document.write(`<!doctype html><html><head><title>Christmas Day Operations Pack</title><style>
    body{font-family:Arial,sans-serif;color:#17201d;margin:28px}h1,h2,h3{margin-bottom:6px}.box{border:1px solid #d7ddd0;border-radius:9px;padding:12px;margin:10px 0;break-inside:avoid}
    table{width:100%;border-collapse:collapse}th,td{padding:7px;border-bottom:1px solid #ddd;text-align:left}.money{text-align:right}
    .page{page-break-before:always}.warn{color:#b91c1c;font-weight:bold}@media print{button{display:none}}
  </style></head><body>
    <h1>Windmill Farm — Christmas Day Operations Pack</h1>
    <p>${DB.christmasConfig.year} · Created ${new Date().toLocaleString('en-GB')}</p>
    <div class="box"><strong>${summary.covers} covers</strong> · ${summary.bookings.length} bookings · ${ChristmasOS.money(summary.value)} booked · <span class="${summary.outstanding>0?'warn':''}">${ChristmasOS.money(summary.outstanding)} outstanding</span></div>
    <h2>Bookings by Arrival Time</h2>
    ${bookings.map(booking=>`<div class="box"><h3>${booking.timeSlot} — ${booking.leadName}</h3><p>${booking.bookingType} · Table/Order ${booking.tableNumber||'TBC'} · ${ChristmasOS.bookingCovers(booking)} people</p><table><tr><th>Guest</th><th>Type</th><th>Starter</th><th>Main</th><th>Dessert</th><th>Paid</th><th>Balance</th></tr>${(booking.guests||[]).map(guest=>`<tr><td>${guest.name}</td><td>${guest.guestType}</td><td>${guest.starter||'MISSING'}</td><td>${guest.main||'MISSING'}</td><td>${guest.dessert||'MISSING'}</td><td>${ChristmasOS.money(guest.amountPaid)}</td><td>${ChristmasOS.money(Number(guest.amountDue||0)-Number(guest.amountPaid||0))}</td></tr>`).join('')}</table>${booking.notes?`<p><strong>Notes:</strong> ${booking.notes}</p>`:''}</div>`).join('')}
    <section class="page"><h1>Menu Production Totals</h1>${Object.entries(totals).map(([course,items])=>`<h2>${course}</h2><table>${Object.entries(items).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<tr><td>${name}</td><td>${count}</td></tr>`).join('')}</table>`).join('')}</section>
    <section class="page"><h1>Operational Sign-Off</h1><table><tr><th>Area</th><th>Task</th><th>Owner</th><th>Status</th><th>Notes</th></tr>${DB.christmasOperations.map(item=>`<tr><td>${item.area}</td><td>${item.title}</td><td>${item.owner||''}</td><td>${item.status}</td><td>${item.notes||''}</td></tr>`).join('')}</table></section>
    <script>window.onload=()=>window.print()</script>
  </body></html>`);
  popup.document.close();
};

ChristmasOS.renderOverview = function() {
  const s=ChristmasOS.summary();
  const target=Number(DB.christmasConfig.salesTarget||0);
  const targetPercent=target?Math.round(s.value/target*100):0;
  const atRiskEvents=DB.christmasEvents.filter(event=>{
    const revenue=Number(event.bookedCovers||0)*Number(event.ticketPrice||0);
    const cost=Number(event.actualCost||0)||Number(event.budget||0);
    return Number(event.bookedCovers||0)<Number(event.minimumCovers||0)||revenue<cost;
  }).length;
  const overdueDates=DB.christmasDates.filter(item=>item.status!=='Completed'&&item.date<todayStr).length;

  return `<div class="grid grid-cols-2 xl:grid-cols-5 gap-3">
    ${[
      ['Christmas Day Covers',s.covers,'users','olive'],
      ['Booked Sales',ChristmasOS.money(s.value),'pound-sterling','gold'],
      ['Outstanding',ChristmasOS.money(s.outstanding),'circle-alert',s.outstanding?'red':'green'],
      ['Menu Completion',`${s.menuComplete}/${s.bookings.length}`,'utensils','teal'],
      ['Sales Target',`${targetPercent}%`,'target','olive']
    ].map(([label,value,icon,tone])=>kpi(label,value,icon,tone)).join('')}
  </div>

  <div class="grid xl:grid-cols-[1.25fr_.75fr] gap-4 mt-4">
    <section class="section-card">
      <div class="flex justify-between gap-3 items-start">
        <div><p class="text-xs font-bold tracking-widest text-red-600">SEASON COMMAND CENTRE</p><h3 class="text-xl font-bold mt-1">Christmas readiness</h3><p class="text-sm text-gray-500 mt-1">A single view of sales, finance, planning and operational risk.</p></div>
        <button onclick="ChristmasOS.setTab('christmas-day')" class="px-4 py-2.5 bg-red-700 text-white rounded-lg font-semibold">Open Christmas Day</button>
      </div>
      <div class="grid md:grid-cols-2 gap-3 mt-5">
        ${[
          ['Christmas Day bookings',`${s.bookings.length} bookings · ${s.covers} covers`,s.bookings.length?'On Track':'Not Started'],
          ['Guest payments',`${s.paymentComplete}/${s.bookings.length} bookings fully paid`,s.outstanding<=0&&s.bookings.length?'Complete':'Action Required'],
          ['Menu choices',`${s.menuComplete}/${s.bookings.length} bookings complete`,s.menuComplete===s.bookings.length&&s.bookings.length?'Complete':'Action Required'],
          ['Events & ROI',`${DB.christmasEvents.length} events · ${atRiskEvents} at risk`,atRiskEvents?'At Risk':DB.christmasEvents.length?'On Track':'Not Started'],
          ['Key dates',`${DB.christmasDates.length} milestones · ${overdueDates} overdue`,overdueDates?'At Risk':'On Track'],
          ['Operations',`${DB.christmasOperations.filter(item=>item.status==='Completed').length}/${DB.christmasOperations.length} tasks complete`,DB.christmasOperations.every(item=>item.status==='Completed')?'Complete':'In Progress']
        ].map(([title,detail,status])=>`<div class="rounded-xl border p-4"><div class="flex justify-between gap-3"><strong>${title}</strong><span class="badge ${status==='Complete'||status==='On Track'?'bg-green-100 text-green-700':status==='At Risk'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}">${status}</span></div><p class="text-sm text-gray-500 mt-2">${detail}</p></div>`).join('')}
      </div>
    </section>

    <section class="section-card">
      <p class="text-xs font-bold tracking-widest text-olive-600">KNOWLEDGE TRANSFER</p>
      <h3 class="text-xl font-bold mt-1">Built so the process survives staff changes</h3>
      <div class="space-y-3 mt-4 text-sm">
        <div class="p-3 bg-cream-50 rounded-xl"><strong>Commercial control</strong><p class="text-gray-500 mt-1">Targets, minimum numbers, break-even points, booked value and ROI.</p></div>
        <div class="p-3 bg-cream-50 rounded-xl"><strong>Christmas Day control</strong><p class="text-gray-500 mt-1">Every guest, payment, menu choice, time slot and exception.</p></div>
        <div class="p-3 bg-cream-50 rounded-xl"><strong>Operational control</strong><p class="text-gray-500 mt-1">Roles, run sheets, click-and-collect flow, kitchen totals and sign-off.</p></div>
        <div class="p-3 bg-cream-50 rounded-xl"><strong>Annual learning</strong><p class="text-gray-500 mt-1">Keep decisions and results structured so next year starts from evidence, not memory.</p></div>
      </div>
    </section>
  </div>`;
};

ChristmasOS.renderBookings = function() {
  const bookings=[...DB.christmasBookings].sort((a,b)=>String(a.timeSlot||'').localeCompare(String(b.timeSlot||'')));
  return `<section class="section-card">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div><h3 class="font-bold text-lg">Christmas Day Bookings</h3><p class="text-sm text-gray-500">Every person has an individual payment and menu record.</p></div>
      <button onclick="ChristmasOS.openBooking()" class="px-4 py-2.5 bg-red-700 text-white rounded-lg font-semibold">+ Add Booking</button>
    </div>
    <div class="overflow-x-auto mt-4">
      <table class="w-full text-sm min-w-[900px]">
        <thead class="bg-cream-50 text-xs text-gray-500"><tr><th class="text-left px-3 py-3">Time</th><th class="text-left px-3 py-3">Booking</th><th class="text-left px-3 py-3">Type</th><th class="text-center px-3 py-3">Covers</th><th class="text-right px-3 py-3">Value</th><th class="text-right px-3 py-3">Paid</th><th class="text-right px-3 py-3">Outstanding</th><th class="text-center px-3 py-3">Menu</th><th class="px-3 py-3"></th></tr></thead>
        <tbody>${bookings.length?bookings.map(booking=>`<tr class="border-t hover:bg-cream-50">
          <td class="px-3 py-3 font-bold text-red-700">${booking.timeSlot}</td>
          <td class="px-3 py-3"><strong>${esc(booking.leadName)}</strong><p class="text-xs text-gray-400">Table/Order ${esc(booking.tableNumber||'TBC')}</p></td>
          <td class="px-3 py-3">${booking.bookingType}</td>
          <td class="px-3 py-3 text-center">${ChristmasOS.bookingCovers(booking)}</td>
          <td class="px-3 py-3 text-right">${ChristmasOS.money(ChristmasOS.bookingDue(booking))}</td>
          <td class="px-3 py-3 text-right text-green-700">${ChristmasOS.money(ChristmasOS.bookingPaid(booking))}</td>
          <td class="px-3 py-3 text-right ${ChristmasOS.bookingBalance(booking)>0?'text-red-700 font-bold':''}">${ChristmasOS.money(ChristmasOS.bookingBalance(booking))}</td>
          <td class="px-3 py-3 text-center"><span class="badge ${ChristmasOS.menuComplete(booking)?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}">${ChristmasOS.menuComplete(booking)?'Complete':'Missing Choices'}</span></td>
          <td class="px-3 py-3 text-right"><button onclick="ChristmasOS.openBooking('${booking.id}')" class="px-3 py-2 bg-olive-100 text-olive-700 rounded-lg">Open</button> <button onclick="ChristmasOS.deleteBooking('${booking.id}')" class="px-3 py-2 bg-red-50 text-red-700 rounded-lg">Delete</button></td>
        </tr>`).join(''):`<tr><td colspan="9" class="p-10 text-center text-gray-400">No Christmas Day bookings have been added yet.</td></tr>`}</tbody>
      </table>
    </div>
  </section>`;
};

ChristmasOS.renderSlots = function() {
  const renderGroup=(title,type,rows)=>`<section class="section-card"><div><h3 class="font-bold text-lg">${title}</h3><p class="text-sm text-gray-500">Capacity is compared with booked covers automatically.</p></div><div class="space-y-2 mt-4">${rows.map(row=>{
    const percent=row.capacity?Math.round(row.covers/row.capacity*100):0;
    return `<div class="rounded-xl border p-3"><div class="flex justify-between gap-3"><div><strong>${row.time}</strong><p class="text-xs text-gray-500">${row.covers} booked · ${row.remaining} spaces remaining</p></div><span class="badge ${row.remaining<0?'bg-red-100 text-red-700':percent>=90?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${percent}% full</span></div><div class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden"><div class="h-full ${row.remaining<0?'bg-red-500':percent>=90?'bg-amber-500':'bg-olive-600'}" style="width:${Math.min(100,percent)}%"></div></div></div>`;
  }).join('')}</div></section>`;
  return `<div class="grid lg:grid-cols-2 gap-4">${renderGroup('Dine-In Time Slots','Dine In',ChristmasOS.slotRows('Dine In'))}${renderGroup('Click & Collect Slots','Click & Collect',ChristmasOS.slotRows('Click & Collect'))}</div>`;
};

ChristmasOS.renderPayments = function() {
  const rows=[];
  DB.christmasBookings.forEach(booking=>(booking.guests||[]).forEach(guest=>rows.push({booking,guest,balance:Number(guest.amountDue||0)-Number(guest.amountPaid||0)})));
  rows.sort((a,b)=>b.balance-a.balance);
  const outstanding=rows.reduce((sum,row)=>sum+Math.max(0,row.balance),0);
  return `<section class="section-card">
    <div class="flex justify-between gap-3"><div><h3 class="font-bold text-lg">Guest Payment Control</h3><p class="text-sm text-gray-500">This is deliberately per person so no unpaid guest is hidden within a group booking.</p></div><div class="text-right"><p class="text-xs text-gray-500">Total Outstanding</p><strong class="text-2xl ${outstanding?'text-red-700':'text-green-700'}">${ChristmasOS.money(outstanding)}</strong></div></div>
    <div class="overflow-x-auto mt-4"><table class="w-full text-sm min-w-[850px]"><thead class="bg-cream-50 text-xs text-gray-500"><tr><th class="text-left px-3 py-3">Booking</th><th class="text-left px-3 py-3">Guest</th><th class="text-left px-3 py-3">Time</th><th class="text-right px-3 py-3">Due</th><th class="text-right px-3 py-3">Paid</th><th class="text-right px-3 py-3">Balance</th><th class="text-center px-3 py-3">Status</th><th></th></tr></thead><tbody>${rows.length?rows.map(({booking,guest,balance})=>`<tr class="border-t"><td class="px-3 py-3">${esc(booking.leadName)}</td><td class="px-3 py-3 font-semibold">${esc(guest.name)}</td><td class="px-3 py-3">${booking.timeSlot}</td><td class="px-3 py-3 text-right">${ChristmasOS.money(guest.amountDue)}</td><td class="px-3 py-3 text-right">${ChristmasOS.money(guest.amountPaid)}</td><td class="px-3 py-3 text-right ${balance>0?'text-red-700 font-bold':'text-green-700'}">${ChristmasOS.money(balance)}</td><td class="px-3 py-3 text-center"><span class="badge ${balance<=.009?'bg-green-100 text-green-700':guest.amountPaid?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}">${balance<=.009?'Paid':guest.amountPaid?'Part Paid':'Unpaid'}</span></td><td class="px-3 py-3"><button onclick="ChristmasOS.openBooking('${booking.id}')" class="px-3 py-2 bg-olive-100 text-olive-700 rounded-lg">Update</button></td></tr>`).join(''):`<tr><td colspan="8" class="p-10 text-center text-gray-400">No guests have been added.</td></tr>`}</tbody></table></div>
  </section>`;
};

ChristmasOS.renderMenus = function() {
  const totals=ChristmasOS.menuTotals();
  const incomplete=DB.christmasBookings.filter(booking=>!ChristmasOS.menuComplete(booking));
  return `<div class="grid xl:grid-cols-[1fr_330px] gap-4">
    <section class="section-card"><div class="flex justify-between"><div><h3 class="font-bold text-lg">Menu Production Totals</h3><p class="text-sm text-gray-500">Automatically totalled from every person’s selected courses.</p></div><button onclick="ChristmasOS.printDayPack()" class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Print Day Pack</button></div>
      <div class="grid md:grid-cols-3 gap-4 mt-4">${Object.entries(totals).map(([course,items])=>`<div class="rounded-xl border overflow-hidden"><div class="px-4 py-3 ${course==='Starter'?'bg-orange-50':course==='Main'?'bg-yellow-50':'bg-green-50'} font-bold">${course}</div><div>${Object.entries(items).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="flex justify-between gap-3 px-4 py-2 border-t text-sm"><span>${esc(name)}</span><strong>${count}</strong></div>`).join('')||'<p class="p-4 text-sm text-gray-400">No choices entered.</p>'}</div></div>`).join('')}</div>
    </section>
    <section class="section-card"><h3 class="font-bold text-lg">Missing Menu Choices</h3><p class="text-sm text-gray-500 mt-1">${incomplete.length} booking${incomplete.length===1?'':'s'} still require attention.</p><div class="space-y-2 mt-4">${incomplete.map(booking=>`<button onclick="ChristmasOS.openBooking('${booking.id}')" class="w-full text-left p-3 rounded-xl bg-amber-50 border border-amber-200"><strong>${esc(booking.leadName)}</strong><p class="text-xs text-gray-500 mt-1">${booking.timeSlot} · ${ChristmasOS.bookingCovers(booking)} guests</p></button>`).join('')||'<div class="p-4 bg-green-50 text-green-700 rounded-xl">Every booking has complete menu choices.</div>'}</div></section>
  </div>`;
};

ChristmasOS.renderOperations = function() {
  return `<section class="section-card"><div class="flex justify-between gap-3"><div><h3 class="font-bold text-lg">Christmas Day Operational Sign-Off</h3><p class="text-sm text-gray-500">Turn the knowledge from previous years into a repeatable operating plan.</p></div><button onclick="ChristmasOS.printDayPack()" class="px-4 py-2.5 bg-red-700 text-white rounded-lg font-semibold">Print Full Day Pack</button></div>
    <div class="overflow-x-auto mt-4"><table class="w-full min-w-[950px] text-sm"><thead class="bg-cream-50 text-xs text-gray-500"><tr><th class="text-left px-3 py-3">Area</th><th class="text-left px-3 py-3">Control / Task</th><th class="text-left px-3 py-3">Owner</th><th class="text-left px-3 py-3">Due</th><th class="text-left px-3 py-3">Status</th><th class="text-left px-3 py-3">Notes</th></tr></thead><tbody>${DB.christmasOperations.map(item=>`<tr class="border-t"><td class="px-3 py-3 font-semibold">${item.area}</td><td class="px-3 py-3">${item.title}</td><td class="px-3 py-3"><input value="${esc(item.owner||'')}" onchange="ChristmasOS.updateOperation('${item.id}','owner',this.value)" class="w-32 px-2 py-2 border rounded-lg"></td><td class="px-3 py-3"><input type="date" value="${item.due||''}" onchange="ChristmasOS.updateOperation('${item.id}','due',this.value)" class="px-2 py-2 border rounded-lg"></td><td class="px-3 py-3"><select onchange="ChristmasOS.updateOperation('${item.id}','status',this.value)" class="px-2 py-2 border rounded-lg">${['Not Started','In Progress','Completed','At Risk'].map(value=>`<option ${item.status===value?'selected':''}>${value}</option>`).join('')}</select></td><td class="px-3 py-3"><input value="${esc(item.notes||'')}" onchange="ChristmasOS.updateOperation('${item.id}','notes',this.value)" class="w-64 px-2 py-2 border rounded-lg"></td></tr>`).join('')}</tbody></table></div>
    <div class="grid md:grid-cols-3 gap-3 mt-5">
      <div class="p-4 rounded-xl bg-cream-50"><strong>Arrival Process</strong><p class="text-sm text-gray-500 mt-2">Checkpoint arrival, confirm booking, direct to table/waiting point and trigger service team.</p></div>
      <div class="p-4 rounded-xl bg-cream-50"><strong>Click & Collect Flow</strong><p class="text-sm text-gray-500 mt-2">Arrival checkpoint → drinks/desserts → waiting area → food collection → quality check → bagging.</p></div>
      <div class="p-4 rounded-xl bg-cream-50"><strong>Exception Control</strong><p class="text-sm text-gray-500 mt-2">Keep every menu change, payment issue, refund, dietary need and collection change against the booking.</p></div>
    </div>
  </section>`;
};

ChristmasOS.renderChristmasDay = function() {
  const views=[['bookings','Bookings'],['payments','Payments'],['menus','Menu Totals'],['slots','Time Slots'],['operations','Operations']];
  const content=ChristmasOS.dayView==='payments'?ChristmasOS.renderPayments():ChristmasOS.dayView==='menus'?ChristmasOS.renderMenus():ChristmasOS.dayView==='slots'?ChristmasOS.renderSlots():ChristmasOS.dayView==='operations'?ChristmasOS.renderOperations():ChristmasOS.renderBookings();
  return `<div class="flex flex-wrap gap-2 mb-4">${views.map(([key,label])=>`<button onclick="ChristmasOS.setDayView('${key}')" class="px-4 py-2 rounded-lg text-sm font-semibold ${ChristmasOS.dayView===key?'bg-red-700 text-white':'bg-white border'}">${label}</button>`).join('')}</div>${content}`;
};


ChristmasOS.seedEventCampaign = function(event) {
  DB.christmasCampaigns = Array.isArray(DB.christmasCampaigns)?DB.christmasCampaigns:[];
  if(DB.christmasCampaigns.some(row=>row.eventId===event.id))return;
  const eventDate=event.date?new Date(event.date+'T12:00:00'):null;
  const minusDays=(days)=>{
    if(!eventDate)return '';
    const d=new Date(eventDate);d.setDate(d.getDate()-days);
    return d.toISOString().slice(0,10);
  };
  [
    ['Campaign launch','Launch event across chosen channels',84,'Marketing'],
    ['Early sales review','Check sales pace and strongest channel',56,'Sales'],
    ['Mid-campaign push','Refresh creative, social proof and direct outreach',35,'Marketing'],
    ['Recovery / scarcity decision','If behind pace, deploy recovery offer; if ahead, push scarcity',21,'Management'],
    ['Final availability push','Last major sales push and guest communication',10,'Sales'],
    ['Operational lock','Final numbers, supplier, food, staffing and room plan locked',5,'Operations']
  ].forEach(([title,action,days,owner])=>DB.christmasCampaigns.push({
    id:ChristmasOS.uid('xmas-campaign'),eventId:event.id,title,action,due:minusDays(days),owner,status:'Not Started',channel:'',spend:0,leads:0,sales:0,revenue:0,notes:''
  }));
};

ChristmasOS.eventMetrics = function(event) {
  const sold=Number(event.bookedCovers||0), capacity=Number(event.capacity||0), price=Number(event.ticketPrice||0);
  const revenue=sold*price;
  const eventCost=Number(event.actualCost||0)||Number(event.budget||0);
  const marketing=Number(event.marketingSpend||0);
  const totalCost=eventCost+marketing;
  const profit=revenue-totalCost;
  const occupancy=capacity?Math.round(sold/capacity*100):0;
  const breakEven=price?Math.ceil(totalCost/price):0;
  const roi=totalCost?Math.round(profit/totalCost*100):0;
  const gap=Math.max(0,Number(event.minimumCovers||0)-sold);
  return {sold,capacity,price,revenue,eventCost,marketing,totalCost,profit,occupancy,breakEven,roi,gap};
};

ChristmasOS.eventPace = function(event) {
  if(!event.date||!event.capacity)return {label:'No target',tone:'quiet',target:0};
  const now=new Date(), date=new Date(event.date+'T12:00:00');
  const days=Math.ceil((date-now)/86400000);
  let pct=100;
  if(days>84)pct=10; else if(days>56)pct=25; else if(days>35)pct=45; else if(days>21)pct=65; else if(days>10)pct=80; else if(days>3)pct=92;
  const target=Math.ceil(Number(event.capacity)*pct/100);
  const sold=Number(event.bookedCovers||0);
  return sold>=target?{label:'On pace',tone:'good',target}:{label:`${target-sold} behind pace`,tone:'risk',target};
};


ChristmasOS.openEventWorkspace=function(id,tab='command'){ChristmasOS.selectedEventId=id;ChristmasOS.eventWorkspaceTab=tab;ChristmasOS.activeTab='event-workspace';if(window.AppRouter)AppRouter.commit(`/christmas/event/${encodeURIComponent(id)}/${encodeURIComponent(tab)}`);renderSection();};
ChristmasOS.closeEventWorkspace=function(){ChristmasOS.selectedEventId=null;ChristmasOS.activeTab='events';if(window.AppRouter)AppRouter.commit('/christmas/events');renderSection();};
ChristmasOS.setEventWorkspaceTab=function(tab){ChristmasOS.eventWorkspaceTab=tab;if(window.AppRouter&&ChristmasOS.selectedEventId)AppRouter.commit(`/christmas/event/${encodeURIComponent(ChristmasOS.selectedEventId)}/${encodeURIComponent(tab)}`);renderSection();};
ChristmasOS.eventCampaigns=id=>(DB.christmasCampaigns||[]).filter(x=>x.eventId===id).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
ChristmasOS.eventHealth=function(e){const m=ChristmasOS.eventMetrics(e),pace=ChristmasOS.eventPace(e),a=ChristmasOS.eventCampaigns(e.id),overdue=a.filter(x=>x.status!=='Completed'&&x.due&&x.due<todayStr).length,missing=[!e.audience?'Audience':0,!e.offer?'Offer':0,!e.message?'Message':0,!e.channels?'Channels':0,!e.owner?'Owner':0,!e.foodPlan?'Food plan':0,!e.staffingPlan?'Staffing':0].filter(Boolean);let score=100-(pace.tone==='risk'?25:0)-Math.min(30,overdue*6)-Math.min(28,missing.length*4)-(m.profit<0?12:0);return{m,pace,overdue,missing,score:Math.max(0,score)}};
ChristmasOS.updateEventField=function(id,f,v){const e=(DB.christmasEvents||[]).find(x=>x.id===id);if(e){e[f]=v;saveDB();}};
ChristmasOS.updateCampaignField=function(id,f,v){const a=(DB.christmasCampaigns||[]).find(x=>x.id===id);if(a){a[f]=['spend','leads','sales','revenue'].includes(f)?Number(v||0):v;saveDB();}};
ChristmasOS.addCampaignAction=function(eventId){const e=(DB.christmasEvents||[]).find(x=>x.id===eventId);if(!e)return;openModal(`<div class="p-5 max-w-xl"><div class="flex justify-between"><div><p class="text-xs font-bold tracking-widest text-red-700">CAMPAIGN ACTION</p><h2 class="text-xl font-bold">Add action · ${esc(e.title)}</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div><form onsubmit="ChristmasOS.saveCampaignAction(event,'${eventId}')" class="space-y-3 mt-5"><label class="text-xs block">Action<input name="title" required class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label><label class="text-xs block">What needs doing<textarea name="action" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></textarea></label><div class="grid grid-cols-2 gap-3"><label class="text-xs">Due<input name="due" type="date" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label><label class="text-xs">Owner<input name="owner" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label><label class="text-xs">Channel<input name="channel" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label><label class="text-xs">Status<select name="status" class="mt-1 w-full px-3 py-2.5 border rounded-lg"><option>Not Started</option><option>In Progress</option><option>Completed</option></select></label></div><div class="flex justify-end gap-2"><button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button><button class="px-4 py-2 bg-red-800 text-white rounded-lg">Add Action</button></div></form></div>`)};
ChristmasOS.saveCampaignAction=function(ev,eventId){ev.preventDefault();DB.christmasCampaigns.push({id:ChristmasOS.uid('xmas-campaign'),eventId,spend:0,leads:0,sales:0,revenue:0,notes:'',...Object.fromEntries(new FormData(ev.target).entries())});saveDB();closeModal();renderSection();toast('Campaign action added')};
ChristmasOS.copyEventForward=function(id){const e=(DB.christmasEvents||[]).find(x=>x.id===id);if(!e)return;const next=Number(e.year||String(e.date).slice(0,4)||DB.christmasConfig.year)+1;if(!confirm(`Create a clean ${next} version of ${e.title}?`))return;const c={...JSON.parse(JSON.stringify(e)),id:ChristmasOS.uid('xmas-event'),year:next,bookedCovers:0,actualCost:0,marketingSpend:0,status:'Planning'};if(c.date)c.date=next+c.date.slice(4);DB.christmasEvents.push(c);ChristmasOS.seedEventCampaign(c);saveDB();toast(`${c.title} copied to Christmas ${next}`);renderSection();};
ChristmasOS.renderEventWorkspace=function(){const e=(DB.christmasEvents||[]).find(x=>x.id===ChristmasOS.selectedEventId);if(!e)return ChristmasOS.renderPortfolio();const h=ChristmasOS.eventHealth(e),m=h.m,a=ChristmasOS.eventCampaigns(e.id),tabs=[['command','Command'],['sales','Sales & ROI'],['marketing','Marketing'],['planning','Planning'],['debrief','Debrief']];
const command=`<div class="x360-grid"><main><div class="x360-callout ${h.pace.tone}"><span>COMMERCIAL POSITION</span><h4>${h.pace.tone==='risk'?h.pace.label:'Sales are on pace'}</h4><p>${m.sold}/${m.capacity} sold · minimum ${Number(e.minimumCovers||0)} · break even ${m.breakEven}.</p></div><section class="x360-section"><div class="x360-title"><div><span>NEXT BEST ACTIONS</span><h4>What should happen next?</h4></div><button onclick="ChristmasOS.addCampaignAction('${e.id}')">+ Add action</button></div>${a.filter(x=>x.status!=='Completed').map(x=>`<div class="x360-action ${x.due&&x.due<todayStr?'late':''}"><button onclick="ChristmasOS.toggleCampaign('${x.id}')"><i data-lucide="circle"></i></button><div><b>${esc(x.title)}</b><small>${x.due||'No date'} · ${esc(x.owner||'Unassigned')}</small><p>${esc(x.action||'')}</p></div></div>`).join('')||'<div class="xmas-empty">No outstanding actions.</div>'}</section></main><aside><div class="x360-health"><span>EVENT HEALTH</span><strong>${h.score}<small>/100</small></strong><div><i style="width:${h.score}%"></i></div><p>${h.overdue} overdue · ${h.missing.length} planning gaps</p></div><section class="x360-section"><span class="xmas-kicker">GAPS TO CLOSE</span>${h.missing.map(x=>`<p class="x360-gap">${x} not set</p>`).join('')||'<p class="x360-good">Core plan complete</p>'}</section></aside></div>`;
const sales=`<div class="x360-grid"><main><section class="xmas-metrics"><article><small>SOLD</small><strong>${m.sold}/${m.capacity}</strong><p>${m.occupancy}% full</p></article><article><small>REVENUE</small><strong>${ChristmasOS.money(m.revenue)}</strong></article><article><small>PROFIT</small><strong>${ChristmasOS.money(m.profit)}</strong></article><article><small>ROI</small><strong>${m.roi}%</strong></article></section><section class="x360-section"><span class="xmas-kicker">LIVE COMMERCIAL INPUTS</span><div class="x360-input-grid">${[['bookedCovers','Covers sold'],['capacity','Capacity'],['minimumCovers','Minimum covers'],['ticketPrice','Ticket price'],['budget','Event budget'],['actualCost','Actual cost'],['marketingBudget','Marketing budget'],['marketingSpend','Marketing spend']].map(([f,l])=>`<label>${l}<input type="number" step="0.01" value="${Number(e[f]||0)}" onchange="ChristmasOS.updateEventField('${e.id}','${f}',Number(this.value));renderSection()"></label>`).join('')}</div></section></main><aside><section class="x360-section"><span class="xmas-kicker">BREAK EVEN</span><h4>${m.breakEven} covers</h4><p>${m.sold>=m.breakEven?'Break-even passed.':`${m.breakEven-m.sold} more covers required.`}</p></section><section class="x360-section"><span class="xmas-kicker">SALES PACE</span><h4>${h.pace.label}</h4><p>Current pacing target: ${h.pace.target} covers.</p></section></aside></div>`;
const marketing=`<div class="x360-grid"><main><section class="x360-section"><div class="x360-title"><div><span>CAMPAIGN BOARD</span><h4>Turn attention into bookings</h4></div><button onclick="ChristmasOS.addCampaignAction('${e.id}')">+ Add action</button></div>${a.map(x=>`<div class="x360-campaign-row"><button onclick="ChristmasOS.toggleCampaign('${x.id}')"><i data-lucide="${x.status==='Completed'?'check-circle-2':'circle'}"></i></button><div><b>${esc(x.title)}</b><small>${x.due||'No date'} · ${esc(x.owner||'Unassigned')}</small></div><input placeholder="Channel" value="${esc(x.channel||'')}" onchange="ChristmasOS.updateCampaignField('${x.id}','channel',this.value)"><input type="number" placeholder="Spend" value="${Number(x.spend||0)}" onchange="ChristmasOS.updateCampaignField('${x.id}','spend',this.value)"><input type="number" placeholder="Sales" value="${Number(x.sales||0)}" onchange="ChristmasOS.updateCampaignField('${x.id}','sales',this.value)"></div>`).join('')}</section></main><aside><section class="x360-section"><span class="xmas-kicker">CAMPAIGN BRIEF</span>${[['Audience',e.audience],['Offer',e.offer],['Message',e.message],['Channels',e.channels]].map(([l,v])=>`<p class="x360-brief"><b>${l}</b>${esc(v||'Not defined')}</p>`).join('')}<button class="x360-edit" onclick="ChristmasOS.openEvent('${e.id}')">Edit brief</button></section></aside></div>`;
const planning=`<div class="x360-grid"><main><section class="x360-section"><span class="xmas-kicker">EVENT EXPERIENCE</span>${[['Food & drink',e.foodPlan],['Room setup',e.setupPlan],['Staffing & execution',e.staffingPlan],['Entertainment / supplier',e.entertainment],['Sales notes',e.salesNotes]].map(([l,v])=>`<div class="x360-plan"><b>${l}</b><p>${esc(v||'Not planned yet')}</p></div>`).join('')}<button class="x360-edit" onclick="ChristmasOS.openEvent('${e.id}')">Edit plan</button></section></main><aside><section class="x360-section"><span class="xmas-kicker">CONTROL</span>${[['Owner',e.owner],['Room',e.room],['Status',e.status]].map(([l,v])=>`<p class="x360-brief"><b>${l}</b>${esc(v||'TBC')}</p>`).join('')}</section></aside></div>`;
const debrief=`<div class="x360-grid"><main><section class="x360-section"><span class="xmas-kicker">POST-EVENT INTELLIGENCE</span><h4>Make next Christmas smarter</h4>${[['debriefWorked','What worked?'],['debriefChange','What would we change?'],['debriefFeedback','Customer / team feedback']].map(([f,l])=>`<label class="x360-textarea">${l}<textarea onchange="ChristmasOS.updateEventField('${e.id}','${f}',this.value)">${esc(e[f]||'')}</textarea></label>`).join('')}</section></main><aside><section class="x360-section"><span class="xmas-kicker">NEXT CHRISTMAS</span><h4>${m.profit>=0&&m.occupancy>=70?'Strong repeat candidate':'Review before repeating'}</h4><p>Occupancy ${m.occupancy}% · profit ${ChristmasOS.money(m.profit)} · ROI ${m.roi}%.</p><button class="x360-edit" onclick="ChristmasOS.copyEventForward('${e.id}')">Copy clean version forward</button></section></aside></div>`;
const body=ChristmasOS.eventWorkspaceTab==='sales'?sales:ChristmasOS.eventWorkspaceTab==='marketing'?marketing:ChristmasOS.eventWorkspaceTab==='planning'?planning:ChristmasOS.eventWorkspaceTab==='debrief'?debrief:command;return `<div class="x360"><section class="x360-hero"><button onclick="ChristmasOS.closeEventWorkspace()">← Portfolio</button><div><span>${esc(e.format||'CHRISTMAS EVENT')} · ${e.date}</span><h2>${esc(e.title)}</h2><p>${esc(e.room||'The Granary')} · ${m.sold}/${m.capacity} sold · ${ChristmasOS.money(m.revenue)}</p></div><div class="x360-hero-actions"><button onclick="ChristmasOS.openEvent('${e.id}')">Edit Event</button><button class="gold" onclick="ChristmasOS.setEventWorkspaceTab('marketing')">Drive Sales</button></div></section><nav class="x360-tabs">${tabs.map(([k,l])=>`<button class="${ChristmasOS.eventWorkspaceTab===k?'active':''}" onclick="ChristmasOS.setEventWorkspaceTab('${k}')">${l}</button>`).join('')}</nav>${body}</div>`};


ChristmasOS.portfolioEvents=function(){const y=Number(DB.christmasConfig.year);return (DB.christmasEvents||[]).filter(e=>Number(e.year||String(e.date||'').slice(0,4))===y)};
ChristmasOS.portfolioMetrics=function(){const es=ChristmasOS.portfolioEvents(),ms=es.map(e=>ChristmasOS.eventMetrics(e));return{events:es.length,capacity:ms.reduce((s,m)=>s+m.capacity,0),sold:ms.reduce((s,m)=>s+m.sold,0),revenue:ms.reduce((s,m)=>s+m.revenue,0),cost:ms.reduce((s,m)=>s+m.totalCost,0),profit:ms.reduce((s,m)=>s+m.profit,0)}};
ChristmasOS.channelMetrics=function(){const map={};(DB.christmasCampaigns||[]).forEach(a=>{const c=String(a.channel||'Unattributed').trim()||'Unattributed';map[c]=map[c]||{channel:c,spend:0,sales:0,leads:0,revenue:0};map[c].spend+=Number(a.spend||0);map[c].sales+=Number(a.sales||0);map[c].leads+=Number(a.leads||0);map[c].revenue+=Number(a.revenue||0)});return Object.values(map).map(x=>({...x,cpa:x.sales?x.spend/x.sales:0,roi:x.spend?((x.revenue-x.spend)/x.spend*100):0})).sort((a,b)=>b.sales-a.sales)};
ChristmasOS.salesRecommendations=function(){const out=[];ChristmasOS.portfolioEvents().forEach(e=>{const h=ChristmasOS.eventHealth(e),m=h.m;if(h.pace.tone==='risk')out.push({level:'critical',event:e,text:`${e.title} is ${h.pace.label}. Prioritise direct outreach, fresh creative and a clear booking deadline.`});if(m.capacity&&m.occupancy>=85&&m.occupancy<100)out.push({level:'good',event:e,text:`${e.title} is ${m.occupancy}% full. Switch messaging to scarcity and protect price.`});if(m.capacity&&m.occupancy===100)out.push({level:'good',event:e,text:`${e.title} is sold out. Build a waiting list and cross-sell another Christmas date.`});if(!e.audience||!e.offer||!e.message)out.push({level:'warn',event:e,text:`${e.title} has an incomplete campaign brief. Define audience, offer and message before spending more.`});if(m.marketing>0&&m.sold===0)out.push({level:'critical',event:e,text:`${e.title} has marketing spend but no recorded sales. Check attribution and campaign quality.`})});return out.slice(0,8)};
ChristmasOS.addLead=function(){openModal(`<div class="p-5 max-w-xl"><div class="flex justify-between"><div><p class="text-xs font-bold tracking-widest text-red-700">CHRISTMAS SALES</p><h2 class="text-xl font-bold">Add Christmas lead</h2></div><button onclick="closeModal()"><i data-lucide="x"></i></button></div><form onsubmit="ChristmasOS.saveLead(event)" class="grid grid-cols-2 gap-3 mt-5"><label class="text-xs col-span-2">Customer / organisation<input name="name" required class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs">Guests<input name="guests" type="number" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs">Potential value<input name="value" type="number" step="0.01" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs">Source<input name="source" placeholder="Facebook, Email, In venue..." class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs">Stage<select name="stage" class="mt-1 w-full px-3 py-2 border rounded-lg"><option>New</option><option>Contacted</option><option>Considering</option><option>Booked</option><option>Lost</option></select></label><label class="text-xs col-span-2">Next action<input name="nextAction" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs">Follow-up date<input name="followUp" type="date" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-xs">Event interest<select name="eventId" class="mt-1 w-full px-3 py-2 border rounded-lg"><option value="">General Christmas</option>${ChristmasOS.portfolioEvents().map(e=>`<option value="${e.id}">${esc(e.title)}</option>`).join('')}</select></label><div class="col-span-2 flex justify-end"><button class="px-4 py-2 bg-red-800 text-white rounded-lg">Save lead</button></div></form></div>`)};
ChristmasOS.saveLead=function(ev){ev.preventDefault();DB.christmasLeads.push({id:ChristmasOS.uid('xmas-lead'),createdAt:new Date().toISOString(),year:Number(DB.christmasConfig.year),...Object.fromEntries(new FormData(ev.target).entries())});saveDB();closeModal();renderSection();toast('Christmas lead added')};
ChristmasOS.updateLead=function(id,f,v){const x=(DB.christmasLeads||[]).find(a=>a.id===id);if(x){x[f]=v;saveDB();renderSection()}};
ChristmasOS.renderSalesControl=function(){const pm=ChristmasOS.portfolioMetrics(),recs=ChristmasOS.salesRecommendations(),channels=ChristmasOS.channelMetrics(),leads=(DB.christmasLeads||[]).filter(x=>Number(x.year||DB.christmasConfig.year)===Number(DB.christmasConfig.year)),pipe=leads.filter(x=>!['Booked','Lost'].includes(x.stage)).reduce((s,x)=>s+Number(x.value||0),0);return `<div class="xmas-stack"><section class="xcontrol-hero"><div><p class="xmas-kicker">CHRISTMAS SALES CONTROL ROOM</p><h3>Fill the room before discounting the room.</h3><p>One place to see portfolio pace, commercial risk, lead pipeline and where marketing is actually producing bookings.</p></div><button onclick="ChristmasOS.addLead()">+ Add Christmas Lead</button></section><section class="xmas-metrics"><article><small>PORTFOLIO SOLD</small><strong>${pm.sold}/${pm.capacity}</strong><p>${pm.capacity?Math.round(pm.sold/pm.capacity*100):0}% occupancy</p></article><article><small>EVENT REVENUE</small><strong>${ChristmasOS.money(pm.revenue)}</strong></article><article><small>ACTIVE LEAD VALUE</small><strong>${ChristmasOS.money(pipe)}</strong><p>${leads.filter(x=>!['Booked','Lost'].includes(x.stage)).length} open leads</p></article><article><small>PORTFOLIO PROFIT</small><strong>${ChristmasOS.money(pm.profit)}</strong></article></section><div class="xcontrol-grid"><section class="xmas-panel"><div class="xmas-panel-head"><div><p class="xmas-kicker">SALES DIRECTOR</p><h3>Where the team should intervene</h3></div></div><div class="xcontrol-recs">${recs.length?recs.map((r,i)=>`<button onclick="ChristmasOS.openEventWorkspace('${r.event.id}')" class="${r.level}"><b>${i+1}</b><span><strong>${esc(r.event.title)}</strong><small>${esc(r.text)}</small></span><i data-lucide="arrow-right"></i></button>`).join(''):'<div class="xmas-empty">No major portfolio interventions detected.</div>'}</div></section><section class="xmas-panel"><p class="xmas-kicker">CHANNEL PERFORMANCE</p><h3>What is earning attention?</h3><div class="xcontrol-channels">${channels.length?channels.map(c=>`<div><b>${esc(c.channel)}</b><span>${c.sales} sales</span><span>${ChristmasOS.money(c.spend)} spend</span><span>${c.sales?ChristmasOS.money(c.cpa)+' CPA':'No CPA'}</span></div>`).join(''):'<p class="xcontrol-muted">Record channel, spend and sales in Event 360 campaigns to build attribution.</p>'}</div></section></div><section class="xmas-panel"><div class="xmas-panel-head"><div><p class="xmas-kicker">CHRISTMAS LEAD PIPELINE</p><h3>Every enquiry needs a next action</h3></div><button class="xcontrol-add" onclick="ChristmasOS.addLead()">+ Lead</button></div><div class="xlead-table">${leads.length?leads.map(l=>`<div><div><b>${esc(l.name)}</b><small>${Number(l.guests||0)} guests · ${esc(l.source||'No source')}</small></div><strong>${ChristmasOS.money(Number(l.value||0))}</strong><select onchange="ChristmasOS.updateLead('${l.id}','stage',this.value)">${['New','Contacted','Considering','Booked','Lost'].map(v=>`<option ${l.stage===v?'selected':''}>${v}</option>`).join('')}</select><div><span>${esc(l.nextAction||'No next action')}</span><small>${l.followUp||'No follow-up date'}</small></div></div>`).join(''):'<div class="xmas-empty">No Christmas leads yet.</div>'}</div></section></div>`};
ChristmasOS.renderCampaignCalendar=function(){const rows=(DB.christmasCampaigns||[]).filter(a=>ChristmasOS.portfolioEvents().some(e=>e.id===a.eventId)).sort((a,b)=>String(a.due).localeCompare(String(b.due)));return `<div class="xmas-stack"><section class="xcontrol-hero"><div><p class="xmas-kicker">CHRISTMAS CAMPAIGN CALENDAR</p><h3>Market early. Push deliberately. Never realise too late.</h3><p>The combined promotional and sales-action timeline for every Windmill Farm Christmas event.</p></div></section><section class="xmas-panel"><div class="xcampaign-calendar">${rows.length?rows.map(a=>{const e=(DB.christmasEvents||[]).find(x=>x.id===a.eventId)||{};return `<div class="${a.status==='Completed'?'done':''}"><time>${a.due||'TBC'}</time><button onclick="ChristmasOS.toggleCampaign('${a.id}')"><i data-lucide="${a.status==='Completed'?'check-circle-2':'circle'}"></i></button><span><b>${esc(a.title)}</b><small>${esc(e.title||'Event')} · ${esc(a.channel||a.owner||'Unassigned')}</small></span><em>${a.status}</em></div>`}).join(''):'<div class="xmas-empty">Create events to generate the campaign calendar.</div>'}</div></section></div>`};
ChristmasOS.renderYearIntelligence=function(){const archives=DB.christmasArchives||[],current=ChristmasOS.portfolioMetrics();return `<div class="xmas-stack"><section class="xcontrol-hero"><div><p class="xmas-kicker">CHRISTMAS INTELLIGENCE</p><h3>Do not start from zero every January.</h3><p>Retain the commercial lessons while keeping each live Christmas workspace clean.</p></div></section><section class="xmas-panel"><p class="xmas-kicker">CURRENT YEAR</p><h3>Christmas ${DB.christmasConfig.year}</h3><div class="xmas-metrics intelligence"><article><small>EVENTS</small><strong>${current.events}</strong></article><article><small>REVENUE</small><strong>${ChristmasOS.money(current.revenue)}</strong></article><article><small>PROFIT</small><strong>${ChristmasOS.money(current.profit)}</strong></article><article><small>OCCUPANCY</small><strong>${current.capacity?Math.round(current.sold/current.capacity*100):0}%</strong></article></div></section><section class="xmas-panel"><p class="xmas-kicker">PREVIOUS CHRISTMASES</p><h3>What should we repeat?</h3><div class="xarchive-grid">${archives.length?archives.slice().reverse().map(a=>`<article><span>CHRISTMAS ${a.year}</span><h4>${a.events?.length||0} archived events</h4>${(a.summary||[]).slice(0,5).map(s=>`<p><b>${esc(s.title)}</b><small>${s.metrics?.occupancy||0}% full · ${ChristmasOS.money(s.metrics?.profit||0)} profit · ${s.metrics?.roi||0}% ROI</small></p>`).join('')}</article>`).join(''):'<div class="xmas-empty">Your first closed Christmas will appear here.</div>'}</div></section></div>`};
ChristmasOS.renderMarketing = function() {
  const events=(DB.christmasEvents||[]).filter(e=>Number(e.year||String(e.date||'').slice(0,4))===Number(DB.christmasConfig.year));
  const campaigns=DB.christmasCampaigns||[];
  return `<div class="xmas-stack">
    <section class="xmas-panel"><div class="xmas-panel-head"><div><p class="xmas-kicker">CHRISTMAS SALES ENGINE</p><h3>Marketing & Sales Studio</h3><p>Every event gets a campaign rhythm. The aim is not “post on Facebook”; it is to know the audience, launch, measure pace, intervene and fill the room.</p></div></div>
      <div class="xmas-event-campaigns">${events.length?events.map(event=>{const m=ChristmasOS.eventMetrics(event),pace=ChristmasOS.eventPace(event),actions=campaigns.filter(c=>c.eventId===event.id).sort((a,b)=>String(a.due).localeCompare(String(b.due)));return `<article class="xmas-campaign-card"><div class="xmas-campaign-top"><div><span>${esc(event.format||'Christmas Event')}</span><h4>${esc(event.title)}</h4><small>${event.date} · ${m.sold}/${m.capacity} sold · ${m.occupancy}% full</small></div><em class="${pace.tone}">${pace.label}</em></div><div class="xmas-campaign-brief"><p><b>Audience</b>${esc(event.audience||'Not defined')}</p><p><b>Offer</b>${esc(event.offer||'Not defined')}</p><p><b>Message</b>${esc(event.message||'Not defined')}</p><p><b>Channels</b>${esc(event.channels||'Not defined')}</p></div><div class="xmas-campaign-actions">${actions.map(a=>`<button onclick="ChristmasOS.toggleCampaign('${a.id}')"><i data-lucide="${a.status==='Completed'?'check-circle-2':'circle'}"></i><span><strong>${esc(a.title)}</strong><small>${a.due||'Date TBC'} · ${esc(a.owner)}</small></span></button>`).join('')}</div></article>`}).join(''):'<div class="xmas-empty">Create a Christmas event to generate its campaign plan.</div>'}</div>
    </section>
  </div>`;
};

ChristmasOS.toggleCampaign = function(id) {
  const row=(DB.christmasCampaigns||[]).find(x=>x.id===id);if(!row)return;
  row.status=row.status==='Completed'?'Not Started':'Completed';saveDB();renderSection();
};

ChristmasOS.renderPortfolio = function() {
  const events=(DB.christmasEvents||[]).filter(e=>Number(e.year||String(e.date||'').slice(0,4))===Number(DB.christmasConfig.year));
  const metrics=events.map(e=>({...e,m:ChristmasOS.eventMetrics(e),pace:ChristmasOS.eventPace(e)}));
  const revenue=metrics.reduce((s,e)=>s+e.m.revenue,0), profit=metrics.reduce((s,e)=>s+e.m.profit,0), sold=metrics.reduce((s,e)=>s+e.m.sold,0), capacity=metrics.reduce((s,e)=>s+e.m.capacity,0);
  return `<div class="xmas-stack"><section class="xmas-portfolio-hero"><div><p class="xmas-kicker">EVENT PORTFOLIO · ${DB.christmasConfig.year}</p><h3>Build events people want to book — then know if they are working.</h3></div><button onclick="ChristmasOS.openEvent()"><i data-lucide="plus"></i>Create Event 360</button></section>
    <section class="xmas-metrics"><article><small>EVENTS</small><strong>${events.length}</strong><p>live Christmas concepts</p></article><article><small>SOLD</small><strong>${sold}/${capacity}</strong><p>${capacity?Math.round(sold/capacity*100):0}% portfolio occupancy</p></article><article><small>EVENT REVENUE</small><strong>${ChristmasOS.money(revenue)}</strong><p>from covers sold</p></article><article><small>PROJECTED PROFIT</small><strong>${ChristmasOS.money(profit)}</strong><p>after event + marketing costs</p></article></section>
    <section class="xmas-event-grid">${metrics.length?metrics.map(event=>`<article class="xmas-event-card"><div class="xmas-event-head"><div><span>${esc(event.format||'Event')}</span><h4>${esc(event.title)}</h4><small>${event.date} · ${esc(event.room||'The Granary')}</small></div><em class="${event.pace.tone}">${event.pace.label}</em></div><div class="xmas-sales-bar"><i style="width:${Math.min(100,event.m.occupancy)}%"></i></div><div class="xmas-event-numbers"><p><b>${event.m.sold}/${event.m.capacity}</b><span>sold</span></p><p><b>${ChristmasOS.money(event.m.revenue)}</b><span>revenue</span></p><p><b>${ChristmasOS.money(event.m.profit)}</b><span>profit</span></p><p><b>${event.m.roi}%</b><span>ROI</span></p></div><div class="xmas-event-foot"><span>Break even: ${event.m.breakEven} covers</span><button onclick="ChristmasOS.openEventWorkspace('${event.id}')">Open Event 360 <i data-lucide="arrow-right"></i></button></div></article>`).join(''):'<div class="xmas-empty">No Windmill Farm Christmas events yet. Create Party Nights, Turkey & Tinsel, NYE or any other Christmas event here.</div>'}</section></div>`;
};

ChristmasOS.renderYearControl = function() {
  const year=Number(DB.christmasConfig.year||ChristmasOS.currentYear);
  return `<section class="xmas-year-control"><div><p class="xmas-kicker">ANNUAL CONTROL</p><h3>Christmas ${year}</h3><p>The live workspace stays clean. Previous Christmas years remain available as intelligence rather than being deleted.</p></div><div><button onclick="ChristmasOS.archiveYear()">Close & Archive ${year}</button></div></section>`;
};

ChristmasOS.archiveYear = function() {
  const year=Number(DB.christmasConfig.year||ChristmasOS.currentYear);
  if(!confirm(`Close Christmas ${year} and prepare a clean ${year+1} workspace? Historic results will be retained.`))return;
  const yearEvents=(DB.christmasEvents||[]).filter(e=>Number(e.year||String(e.date||'').slice(0,4))===year);
  DB.christmasArchives=Array.isArray(DB.christmasArchives)?DB.christmasArchives:[];
  DB.christmasArchives.push({id:ChristmasOS.uid('xmas-archive'),year,closedAt:new Date().toISOString(),events:JSON.parse(JSON.stringify(yearEvents)),summary:yearEvents.map(e=>({title:e.title,metrics:ChristmasOS.eventMetrics(e),notes:e.notes||''}))});
  DB.christmasConfig.year=year+1;
  DB.christmasDates=[];
  DB.christmasOperations=[];
  ChristmasOS.ensureData();
  saveDB();renderSection();toast(`Christmas ${year} archived. Christmas ${year+1} is ready.`);
};

ChristmasOS.renderEvents = function() { return ChristmasOS.renderPortfolio(); };

ChristmasOS.renderDates = function() {
  const dates=[...DB.christmasDates].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  return `<section class="section-card"><div class="flex justify-between gap-3"><div><h3 class="font-bold text-lg">Christmas Key Dates</h3><p class="text-sm text-gray-500">Deadlines, owners and risks remain visible instead of living in one manager’s memory.</p></div><button onclick="ChristmasOS.openDate()" class="px-4 py-2.5 bg-red-700 text-white rounded-lg font-semibold">+ Add Key Date</button></div><div class="space-y-2 mt-4">${dates.map(item=>`<button onclick="ChristmasOS.openDate('${item.id}')" class="w-full grid md:grid-cols-[110px_1fr_150px_120px] items-center gap-3 text-left rounded-xl border p-3 hover:bg-cream-50"><strong class="${item.date<todayStr&&item.status!=='Completed'?'text-red-700':'text-olive-700'}">${item.date}</strong><div><strong>${esc(item.title)}</strong><p class="text-xs text-gray-400">${esc(item.category||'')}</p></div><span class="text-sm">${esc(item.owner||'Unassigned')}</span><span class="badge justify-self-start ${item.status==='Completed'?'bg-green-100 text-green-700':item.status==='At Risk'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}">${item.status}</span></button>`).join('')}</div></section>`;
};

ChristmasOS.renderSettings = function() {
  return `${ChristmasOS.renderYearControl()}<section class="section-card"><h3 class="font-bold text-lg">Christmas Commercial Setup</h3><p class="text-sm text-gray-500">Set the controls once, then let the tab measure performance against them.</p><div class="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
    <label class="text-xs text-gray-600">Christmas sales target<input id="xmas-sales-target" type="number" step="0.01" value="${Number(DB.christmasConfig.salesTarget||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
    <label class="text-xs text-gray-600">Christmas Day total capacity<input id="xmas-day-capacity" type="number" value="${Number(DB.christmasConfig.dayCapacity||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
    <label class="text-xs text-gray-600">Adult Christmas Day price<input id="xmas-adult-price" type="number" step="0.01" value="${Number(DB.christmasConfig.adultPrice||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
    <label class="text-xs text-gray-600">Child Christmas Day price<input id="xmas-child-price" type="number" step="0.01" value="${Number(DB.christmasConfig.childPrice||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg"></label>
  </div><button onclick="ChristmasOS.saveSettings()" class="mt-4 px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Save Christmas Settings</button>
  <div class="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900"><strong>Designed for future expansion:</strong> the current version keeps Christmas Day, key dates, event ROI, menu totals, time slots and operational sign-off in structured data. Later, other function bookings can feed into it automatically without rebuilding the module.</div></section>`;
};

function renderChristmas() {
  ChristmasOS.ensureData();
  const tabs=[
    ['overview','Overview'],
    ['import','Import Reports'],
    ['christmas-day','Christmas Day'],
    ['events','Event Portfolio'],
    ['sales-control','Sales Control'],
    ['marketing','Marketing & Sales'],
    ['campaign-calendar','Campaign Calendar'],
    ['dates','Key Dates'],
    ['intelligence','Year Intelligence'],
    ['settings','Setup']
  ];

  const content=
    ChristmasOS.activeTab==='import' ? ChristmasOS.renderImportCentre() :
    ChristmasOS.activeTab==='christmas-day' ? ChristmasOS.renderChristmasDay() :
    ChristmasOS.activeTab==='events' ? ChristmasOS.renderEvents() :
    ChristmasOS.activeTab==='sales-control' ? ChristmasOS.renderSalesControl() :
    ChristmasOS.activeTab==='marketing' ? ChristmasOS.renderMarketing() :
    ChristmasOS.activeTab==='campaign-calendar' ? ChristmasOS.renderCampaignCalendar() :
    ChristmasOS.activeTab==='intelligence' ? ChristmasOS.renderYearIntelligence() :
    ChristmasOS.activeTab==='event-workspace' ? ChristmasOS.renderEventWorkspace() :
    ChristmasOS.activeTab==='dates' ? ChristmasOS.renderDates() :
    ChristmasOS.activeTab==='settings' ? ChristmasOS.renderSettings() :
    ChristmasOS.renderOverview();

  return `<div class="rounded-2xl overflow-hidden mb-4 border border-red-100 shadow-sm bg-white">
    <div class="p-5 bg-gradient-to-r from-[#8d1f2d] via-[#a52b37] to-[#465a2d] text-white">
      <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-[.2em] text-yellow-200">WINDMILL FARM CHRISTMAS</p>
          <h2 class="text-3xl font-bold mt-1">Christmas Command Centre</h2>
          <p class="text-sm text-white/75 mt-2 max-w-3xl">Plan, sell and execute Windmill Farm Christmas. Build public events, track sales pace and ROI, run marketing campaigns, control Christmas Day and carry the learning into next year.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="ChristmasOS.openEvent()" class="px-4 py-2.5 rounded-lg bg-yellow-300 text-charcoal-900 font-semibold">+ Christmas Event</button>
          <button onclick="ChristmasOS.setTab('sales-control')" class="px-4 py-2.5 rounded-lg bg-white text-red-800 font-semibold">Sales Control</button>
          <button onclick="ChristmasOS.setTab('christmas-day')" class="px-4 py-2.5 rounded-lg bg-white/15 border border-white/30 text-white font-semibold">Christmas Day</button>
        </div>
      </div>
    </div>
    <div class="p-3 flex flex-wrap gap-2 bg-white">
      ${tabs.map(([key,label])=>`<button onclick="ChristmasOS.setTab('${key}')" class="px-4 py-2 rounded-lg text-sm font-semibold ${ChristmasOS.activeTab===key?'bg-red-700 text-white':'bg-cream-50 text-gray-700 hover:bg-red-50'}">${label}</button>`).join('')}
    </div>
  </div>${content}`;
}


// ============================================================================
// CHRISTMAS REPORT IMPORT & RECONCILIATION CENTRE
// ============================================================================

ChristmasOS.importDraft = ChristmasOS.importDraft || {
  csvFileName:'',
  pdfFileName:'',
  csvBookings:[],
  chefBookings:[],
  rows:[],
  warnings:[],
  csvReady:false,
  pdfReady:false
};

ChristmasOS.normaliseName = function(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,' ')
    .replace(/\b(mr|mrs|miss|ms|dr)\b/g,' ')
    .replace(/\s+/g,' ')
    .trim();
};

ChristmasOS.normaliseTime = function(value) {
  const text=String(value||'').trim();
  const match=text.match(/(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2,'0')}:${match[2]}` : '';
};

ChristmasOS.parseCovers = function(value) {
  const text=String(value||'').replace(/\t/g,'').trim();
  const split=text.match(/(\d+)\s*\/\s*(\d+)/);
  if(split) return {adults:Number(split[1]),children:Number(split[2]),total:Number(split[1])+Number(split[2])};
  const number=Number((text.match(/\d+/)||[0])[0]);
  return {adults:number,children:0,total:number};
};

ChristmasOS.parseMoneyPair = function(...values) {
  for(const value of values){
    const matches=String(value||'').match(/£?\s*([\d,]+(?:\.\d{1,2})?)/g);
    if(matches && matches.length>=2){
      const nums=matches.map(item=>Number(item.replace(/[£,\s]/g,'')));
      // Exports differ by field. Treat the lower amount as paid only when clearly lower;
      // otherwise the common format is paid / required.
      return {paid:nums[0]||0,required:nums[1]||0,source:String(value||'')};
    }
  }
  return {paid:0,required:0,source:''};
};

ChristmasOS.parseCSVText = function(text) {
  const rows=[];
  let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(char==='"' && quoted && text[i+1]==='"'){field+='"';i++;continue;}
    if(char==='"'){quoted=!quoted;continue;}
    if(char===','&&!quoted){row.push(field);field='';continue;}
    if((char==='\n'||char==='\r')&&!quoted){
      if(char==='\r'&&text[i+1]==='\n')i++;
      row.push(field);field='';
      if(row.some(value=>String(value).trim()!==''))rows.push(row);
      row=[];continue;
    }
    field+=char;
  }
  if(field||row.length){row.push(field);rows.push(row);}
  if(!rows.length)return [];
  const headers=rows.shift().map(value=>String(value).trim());
  return rows.map(values=>Object.fromEntries(headers.map((header,index)=>[header,values[index]??''])));
};

ChristmasOS.mapCSVBooking = function(row) {
  const covers=ChristmasOS.parseCovers(row.Covers);
  const arrival=String(row.Arrival||'');
  const time=ChristmasOS.normaliseTime(arrival);
  const payment=ChristmasOS.parseMoneyPair(
    row['Total paid vs total required'],
    row.Deposit,
    row['Requested Payments'],
    row['Pre-payment']
  );
  const status=String(row['Booking Status']||'').trim();
  const bookingRef=String(row['Booking Ref']||'').trim();
  const leadName=String(row.Name||'').trim();
  return {
    source:'csv',
    bookingRef,
    leadName,
    normalisedLead:ChristmasOS.normaliseName(leadName),
    bookingStatus:status,
    arrival,
    timeSlot:time,
    date:(arrival.match(/(\d{2})\/(\d{2})\/(\d{4})/)||[]).slice(1).reverse().join('-'),
    adults:covers.adults,
    children:covers.children,
    covers:covers.total,
    bookingType:/click\s*&?\s*collect|takeaway/i.test(`${row.Occasion} ${row.Menu} ${row.Area}`)?'Click & Collect':'Dine In',
    occasion:String(row.Occasion||''),
    menu:String(row.Menu||''),
    area:String(row.Area||''),
    totalPaid:payment.paid,
    totalRequired:payment.required,
    paymentRaw:payment.source,
    specialRequest:String(row['Special request']||'').trim(),
    tags:String(row.Tags||'').trim(),
    reconfirmed:String(row.Reconfirmed||'').trim(),
    guestEdit:String(row['Guest Edit']||'').trim(),
    raw:row
  };
};

ChristmasOS.readCSVFile = async function(input) {
  const file=input.files?.[0];
  if(!file)return;
  try{
    const text=await file.text();
    const parsed=ChristmasOS.parseCSVText(text).map(ChristmasOS.mapCSVBooking);
    ChristmasOS.importDraft.csvFileName=file.name;
    ChristmasOS.importDraft.csvBookings=parsed;
    ChristmasOS.importDraft.csvReady=true;
    ChristmasOS.buildReconciliation();
    renderSection();
    toast(`${parsed.length} booking rows read from CSV`);
  }catch(error){
    console.error(error);
    toast('The booking CSV could not be read','error');
  }
};

ChristmasOS.pdfPageLines = function(items) {
  const rows=new Map();
  items.forEach(item=>{
    const y=Math.round(item.transform?.[5]||0);
    const x=item.transform?.[4]||0;
    if(!rows.has(y))rows.set(y,[]);
    rows.get(y).push({x,text:item.str||''});
  });
  return [...rows.entries()]
    .sort((a,b)=>b[0]-a[0])
    .map(([,parts])=>parts.sort((a,b)=>a.x-b.x).map(part=>part.text).join(' ').replace(/\s+/g,' ').trim())
    .filter(Boolean);
};

ChristmasOS.parseChefLines = function(lines) {
  const bookings=[];
  let booking=null;
  let guest=null;
  let currentSelection=null;

  const flushSelection=()=>{
    if(currentSelection&&guest){
      currentSelection.product=currentSelection.product.replace(/\s+/g,' ').trim();
      guest.selections.push(currentSelection);
    }
    currentSelection=null;
  };
  const flushGuest=()=>{
    flushSelection();
    if(guest&&booking)booking.guests.push(guest);
    guest=null;
  };
  const flushBooking=()=>{
    flushGuest();
    if(booking)bookings.push(booking);
    booking=null;
  };

  for(let rawLine of lines){
    const line=String(rawLine||'').replace(/\s+/g,' ').trim();
    if(!line)continue;

    const bookingHeader=line.match(/25\s+December\s+(\d{4})\s*-\s*(\d{1,2}:\d{2})\s*-\s*Christmas Day\s*-\s*(.*?)\s*-\s*(\d+)\s+covers/i);
    if(bookingHeader){
      flushBooking();
      booking={
        source:'chef',
        year:Number(bookingHeader[1]),
        timeSlot:ChristmasOS.normaliseTime(bookingHeader[2]),
        leadName:bookingHeader[3].trim(),
        normalisedLead:ChristmasOS.normaliseName(bookingHeader[3]),
        covers:Number(bookingHeader[4]),
        accountCreated:/account created on till/i.test(line),
        guests:[]
      };
      continue;
    }

    if(!booking)continue;
    if(/Chef Report for|Report generated|from \d{4}-/i.test(line))continue;

    const guestHeader=line.match(/^(.*?)\s+Menu\s+Group\s+Quantity\s+Product$/i);
    if(guestHeader){
      flushGuest();
      guest={name:guestHeader[1].trim(),menuType:'',selections:[]};
      continue;
    }

    if(!guest)continue;

    // Normal row: [menu group] [course] [quantity] [product].
    const rowMatch=line.match(/^(.*?)\s+(Starters|Mains|Desserts|Petit\s*Fours)\s+(\d+)\s+(.+)$/i);
    if(rowMatch){
      flushSelection();
      guest.menuType=rowMatch[1].trim();
      currentSelection={
        menuGroup:rowMatch[1].trim(),
        course:rowMatch[2].replace(/\s+/g,' '),
        quantity:Number(rowMatch[3]),
        product:rowMatch[4].trim()
      };
      continue;
    }

    // Some PDF rows break "Petit Fours" or a product across visual lines.
    const partialPetit=line.match(/^(.*?)\s+Petit$/i);
    if(partialPetit){
      flushSelection();
      guest.menuType=partialPetit[1].trim();
      currentSelection={menuGroup:partialPetit[1].trim(),course:'Petit Fours',quantity:1,product:''};
      continue;
    }
    if(currentSelection){
      if(/^Fours\s+\d+\s+/i.test(line)){
        currentSelection.product += ` ${line.replace(/^Fours\s+\d+\s+/i,'')}`;
      }else{
        currentSelection.product += ` ${line}`;
      }
    }
  }
  flushBooking();

  return bookings.map(item=>({
    ...item,
    guests:item.guests.map(person=>{
      const mapped={name:person.name,guestType:/kids/i.test(person.menuType)?'Child':'Adult',starter:'',main:'',dessert:'',petitFours:'',dietary:'',rawSelections:person.selections};
      person.selections.forEach(selection=>{
        const product=selection.product.trim();
        if(/^starters$/i.test(selection.course))mapped.starter=product;
        if(/^mains$/i.test(selection.course))mapped.main=product;
        if(/^desserts$/i.test(selection.course))mapped.dessert=product;
        if(/^petit/i.test(selection.course))mapped.petitFours=product;
        if(/no-gluten|gluten free|ngci|vegan|vegetarian/i.test(`${selection.menuGroup} ${product}`))mapped.dietary=[mapped.dietary,selection.menuGroup].filter(Boolean).join('; ');
      });
      return mapped;
    })
  }));
};

ChristmasOS.readChefPDF = async function(input) {
  const file=input.files?.[0];
  if(!file)return;

  const status=document.getElementById('xmas-pdf-import-status');
  const setStatus=(message,tone='amber')=>{
    if(!status)return;
    status.textContent=message;
    status.className=`text-xs font-semibold mt-3 ${
      tone==='green'?'text-green-700':
      tone==='red'?'text-red-700':
      tone==='olive'?'text-olive-700':'text-amber-700'
    }`;
  };

  setStatus('Uploading Chef Report securely for extraction…','amber');

  try{
    const response=await fetch('/api/parse-chef-report',{
      method:'POST',
      headers:{
        'Content-Type':'application/pdf',
        'X-Filename':encodeURIComponent(file.name)
      },
      body:file
    });

    let result=null;
    try{
      result=await response.json();
    }catch(parseError){
      throw new Error(`The PDF service returned an unreadable response (${response.status}).`);
    }

    if(!response.ok||!result?.ok){
      throw new Error(result?.error||`The PDF service failed (${response.status}).`);
    }

    setStatus(`PDF extracted. Matching ${result.pageCount||0} pages…`,'olive');

    const lines=Array.isArray(result.lines)?result.lines:[];
    const bookings=ChristmasOS.parseChefLines(lines);

    if(!bookings.length){
      throw new Error('The PDF opened, but no Christmas Day booking groups were recognised.');
    }

    ChristmasOS.importDraft.pdfFileName=file.name;
    ChristmasOS.importDraft.chefBookings=bookings;
    ChristmasOS.importDraft.pdfReady=true;
    ChristmasOS.buildReconciliation();
    renderSection();
    toast(`${bookings.length} Chef Report bookings extracted`);
  }catch(error){
    console.error('Chef Report import failed:',error);
    setStatus(error?.message||'The Chef Report could not be extracted.','red');
    toast(error?.message||'The Chef Report PDF could not be extracted','error');
    input.value='';
  }
};
ChristmasOS.existingImportKey = function(booking) {
  return booking.sourceBookingRef || booking.bookingRef || '';
};

ChristmasOS.compareExisting = function(csv,chef,existing) {
  if(!existing)return [];
  const changes=[];
  if(Number(existing.adults||0)!==Number(csv?.adults||0))changes.push(`Adults ${existing.adults||0} → ${csv?.adults||0}`);
  if(Number(existing.children||0)!==Number(csv?.children||0))changes.push(`Children ${existing.children||0} → ${csv?.children||0}`);
  if(String(existing.timeSlot||'')!==String(csv?.timeSlot||chef?.timeSlot||''))changes.push(`Time ${existing.timeSlot||'TBC'} → ${csv?.timeSlot||chef?.timeSlot||'TBC'}`);
  if(Number(existing.totalValue||0)!==Number(csv?.totalRequired||0))changes.push(`Value ${ChristmasOS.money(existing.totalValue)} → ${ChristmasOS.money(csv?.totalRequired)}`);
  if(Number(existing.amountPaid||0)!==Number(csv?.totalPaid||0))changes.push(`Paid ${ChristmasOS.money(existing.amountPaid)} → ${ChristmasOS.money(csv?.totalPaid)}`);
  if((existing.guests||[]).length!==Number(chef?.guests?.length||0)&&chef)changes.push(`Named guests ${(existing.guests||[]).length} → ${chef.guests.length}`);
  return changes;
};

ChristmasOS.findChefMatch = function(csv,usedChef) {
  const candidates=ChristmasOS.importDraft.chefBookings
    .map((chef,index)=>({chef,index}))
    .filter(item=>!usedChef.has(item.index))
    .map(item=>{
      let score=0;
      if(item.chef.normalisedLead===csv.normalisedLead)score+=60;
      else if(item.chef.normalisedLead.includes(csv.normalisedLead)||csv.normalisedLead.includes(item.chef.normalisedLead))score+=35;
      if(item.chef.timeSlot===csv.timeSlot)score+=25;
      if(item.chef.covers===csv.covers)score+=15;
      return {...item,score};
    })
    .filter(item=>item.score>=35)
    .sort((a,b)=>b.score-a.score);
  return candidates[0]||null;
};

ChristmasOS.buildReconciliation = function() {
  const csvRows=ChristmasOS.importDraft.csvBookings||[];
  const chefRows=ChristmasOS.importDraft.chefBookings||[];
  const usedChef=new Set();
  const rows=[];

  csvRows.forEach(csv=>{
    const chefMatch=ChristmasOS.findChefMatch(csv,usedChef);
    const chef=chefMatch?.chef||null;
    if(chefMatch)usedChef.add(chefMatch.index);

    const existing=(DB.christmasBookings||[]).find(item=>
      (csv.bookingRef&&ChristmasOS.existingImportKey(item)===csv.bookingRef) ||
      (ChristmasOS.normaliseName(item.leadName)===csv.normalisedLead&&item.timeSlot===csv.timeSlot)
    );

    const conflicts=[];
    if(chef&&csv.covers!==chef.covers)conflicts.push(`Cover count differs: CSV ${csv.covers}, Chef Report ${chef.covers}`);
    if(csv.bookingStatus&&!/^confirmed$/i.test(csv.bookingStatus))conflicts.push(`CSV status is ${csv.bookingStatus}`);
    if(!chef&&ChristmasOS.importDraft.pdfReady)conflicts.push('Missing from Chef Report');
    if(chef&&chef.guests.length!==chef.covers)conflicts.push(`Chef Report names ${chef.guests.length}/${chef.covers} guests`);
    if(csv.totalRequired&&csv.totalPaid>csv.totalRequired+.01)conflicts.push('Paid amount exceeds required amount');

    const changes=ChristmasOS.compareExisting(csv,chef,existing);
    let matchType='New Booking';
    if(existing&&changes.length)matchType='Changed Since Last Import';
    else if(existing)matchType='Already Up to Date';
    else if(chef&&chefMatch.score>=90&&!conflicts.length)matchType='Exact Match';
    else if(chef)matchType='Probable Match';
    else if(ChristmasOS.importDraft.pdfReady)matchType='CSV Only';

    let action='import';
    if(!/^confirmed$/i.test(csv.bookingStatus))action='ignore';
    else if(conflicts.length)action='review';
    else if(matchType==='Already Up to Date')action='ignore';

    rows.push({
      id:ChristmasOS.uid('reconcile'),
      csv,chef,existing,matchScore:chefMatch?.score||0,
      matchType,conflicts,changes,action
    });
  });

  chefRows.forEach((chef,index)=>{
    if(usedChef.has(index))return;
    const existing=(DB.christmasBookings||[]).find(item=>
      ChristmasOS.normaliseName(item.leadName)===chef.normalisedLead&&item.timeSlot===chef.timeSlot
    );
    rows.push({
      id:ChristmasOS.uid('reconcile'),
      csv:null,chef,existing,matchScore:0,
      matchType:'Chef Report Only',
      conflicts:['Missing from booking CSV'],
      changes:[],
      action:'review'
    });
  });

  ChristmasOS.importDraft.rows=rows;
};

ChristmasOS.setImportAction = function(id,value) {
  const row=ChristmasOS.importDraft.rows.find(item=>item.id===id);
  if(row)row.action=value;
};

ChristmasOS.importStats = function() {
  const rows=ChristmasOS.importDraft.rows||[];
  const csv=ChristmasOS.importDraft.csvBookings||[];
  const confirmed=csv.filter(item=>/^confirmed$/i.test(item.bookingStatus));
  return {
    csvRows:csv.length,
    confirmed:confirmed.length,
    excluded:csv.length-confirmed.length,
    covers:confirmed.reduce((sum,item)=>sum+item.covers,0),
    adults:confirmed.reduce((sum,item)=>sum+item.adults,0),
    children:confirmed.reduce((sum,item)=>sum+item.children,0),
    exact:rows.filter(item=>item.matchType==='Exact Match').length,
    probable:rows.filter(item=>item.matchType==='Probable Match').length,
    changed:rows.filter(item=>item.matchType==='Changed Since Last Import').length,
    conflicts:rows.filter(item=>item.conflicts.length).length,
    importable:rows.filter(item=>item.action==='import').length,
    review:rows.filter(item=>item.action==='review').length
  };
};

ChristmasOS.previewImportRow = function(id) {
  const row=ChristmasOS.importDraft.rows.find(item=>item.id===id);
  if(!row)return;
  const csv=row.csv,chef=row.chef;
  openModal(`<div class="p-5 max-w-5xl">
    <div class="flex justify-between gap-4">
      <div><p class="text-xs font-bold tracking-widest text-red-600">IMPORT REVIEW</p><h2 class="text-xl font-bold">${esc(csv?.leadName||chef?.leadName||'Unmatched record')}</h2><p class="text-sm text-gray-500 mt-1">${row.matchType} · score ${row.matchScore}</p></div>
      <button onclick="closeModal()" class="p-2"><i data-lucide="x"></i></button>
    </div>
    <div class="grid md:grid-cols-2 gap-4 mt-5">
      <section class="rounded-xl border p-4"><h3 class="font-bold">Booking CSV</h3>${csv?`
        <dl class="grid grid-cols-2 gap-2 mt-3 text-sm">
          <dt class="text-gray-500">Reference</dt><dd>${esc(csv.bookingRef||'None')}</dd>
          <dt class="text-gray-500">Status</dt><dd>${esc(csv.bookingStatus)}</dd>
          <dt class="text-gray-500">Time</dt><dd>${csv.timeSlot}</dd>
          <dt class="text-gray-500">Covers</dt><dd>${csv.adults} adults / ${csv.children} children</dd>
          <dt class="text-gray-500">Paid</dt><dd>${ChristmasOS.money(csv.totalPaid)}</dd>
          <dt class="text-gray-500">Required</dt><dd>${ChristmasOS.money(csv.totalRequired)}</dd>
          <dt class="text-gray-500">Request</dt><dd>${esc(csv.specialRequest||'None')}</dd>
        </dl>`:'<p class="text-sm text-gray-400 mt-3">Not present in CSV.</p>'}</section>
      <section class="rounded-xl border p-4"><h3 class="font-bold">Chef Report</h3>${chef?`
        <p class="text-sm text-gray-500 mt-2">${chef.timeSlot} · ${chef.covers} covers · ${chef.guests.length} named guests</p>
        <div class="space-y-2 mt-3 max-h-80 overflow-y-auto">${chef.guests.map(guest=>`<div class="rounded-lg bg-cream-50 p-3"><strong>${esc(guest.name)}</strong><p class="text-xs text-gray-500 mt-1">${esc(guest.guestType)} · ${esc(guest.starter||'No starter')} · ${esc(guest.main||'No main')} · ${esc(guest.dessert||'No dessert')}</p></div>`).join('')}</div>
        `:'<p class="text-sm text-gray-400 mt-3">Not present in Chef Report.</p>'}</section>
    </div>
    ${row.conflicts.length?`<section class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"><h3 class="font-bold text-red-800">Conflicts requiring judgement</h3><ul class="mt-2 text-sm text-red-700">${row.conflicts.map(item=>`<li>• ${esc(item)}</li>`).join('')}</ul></section>`:''}
    ${row.changes.length?`<section class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 class="font-bold text-amber-800">Changes since the last import</h3><ul class="mt-2 text-sm text-amber-700">${row.changes.map(item=>`<li>• ${esc(item)}</li>`).join('')}</ul></section>`:''}
    <div class="mt-5 flex justify-end gap-2">
      <button onclick="ChristmasOS.setImportAction('${row.id}','ignore');closeModal();renderSection()" class="px-4 py-2.5 bg-gray-100 rounded-lg font-semibold">Ignore</button>
      <button onclick="ChristmasOS.setImportAction('${row.id}','import');closeModal();renderSection()" class="px-4 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Approve Import</button>
    </div>
  </div>`);
};

ChristmasOS.applyImport = function() {
  const approved=ChristmasOS.importDraft.rows.filter(row=>row.action==='import');
  if(!approved.length)return toast('No records are approved for import','error');

  const snapshot={
    id:ChristmasOS.uid('xmas-import'),
    createdAt:new Date().toISOString(),
    csvFileName:ChristmasOS.importDraft.csvFileName,
    pdfFileName:ChristmasOS.importDraft.pdfFileName,
    rowsRead:ChristmasOS.importDraft.rows.length,
    imported:0,updated:0,ignored:ChristmasOS.importDraft.rows.length-approved.length,
    conflicts:ChristmasOS.importDraft.rows.filter(row=>row.conflicts.length).length,
    summary:[]
  };

  approved.forEach(row=>{
    const csv=row.csv||{};
    const chef=row.chef||null;
    const existing=row.existing||null;
    const booking=existing?JSON.parse(JSON.stringify(existing)):{
      id:ChristmasOS.uid('xmas-booking'),
      createdAt:new Date().toISOString()
    };

    booking.sourceBookingRef=csv.bookingRef||booking.sourceBookingRef||'';
    booking.leadName=csv.leadName||chef?.leadName||booking.leadName||'Unmatched Booking';
    booking.phone=booking.phone||'';
    booking.email=booking.email||'';
    booking.bookingType=csv.bookingType||booking.bookingType||'Dine In';
    booking.timeSlot=csv.timeSlot||chef?.timeSlot||booking.timeSlot||'';
    booking.tableNumber=booking.tableNumber||'';
    booking.notes=[csv.specialRequest,csv.tags].filter(Boolean).join(' · ')||booking.notes||'';
    booking.adults=Number(csv.adults||chef?.guests?.filter(item=>item.guestType==='Adult').length||0);
    booking.children=Number(csv.children||chef?.guests?.filter(item=>item.guestType==='Child').length||0);
    booking.totalValue=Number(csv.totalRequired||booking.totalValue||0);
    booking.amountPaid=Number(csv.totalPaid||booking.amountPaid||0);
    booking.paymentBasis='Booking total imported from booking export';
    booking.sourceStatus=csv.bookingStatus||booking.sourceStatus||'';
    booking.sourceArea=csv.area||booking.sourceArea||'';
    booking.importWarnings=row.conflicts;
    booking.lastImportId=snapshot.id;
    booking.updatedAt=new Date().toISOString();

    if(chef){
      booking.guests=chef.guests.map((guest,index)=>({
        id:booking.guests?.[index]?.id||ChristmasOS.uid('xmas-guest'),
        name:guest.name||`Guest ${index+1}`,
        guestType:guest.guestType||'Adult',
        starter:guest.starter||'',
        main:guest.main||'',
        dessert:guest.dessert||'',
        petitFours:guest.petitFours||'',
        dietary:guest.dietary||'',
        amountDue:0,
        amountPaid:0,
        paymentStatus:'Tracked at booking level',
        source:'Chef Report'
      }));
    }else if(!booking.guests){
      booking.guests=Array.from({length:Number(csv.covers||0)},(_,index)=>({
        id:ChristmasOS.uid('xmas-guest'),
        name:`Guest ${index+1}`,
        guestType:index<Number(csv.adults||0)?'Adult':'Child',
        starter:'',main:'',dessert:'',petitFours:'',dietary:'',
        amountDue:0,amountPaid:0,
        paymentStatus:'Tracked at booking level',
        source:'Booking CSV'
      }));
    }

    const index=DB.christmasBookings.findIndex(item=>item.id===booking.id);
    if(index>=0){
      DB.christmasBookings[index]=booking;
      snapshot.updated++;
    }else{
      DB.christmasBookings.push(booking);
      snapshot.imported++;
    }
    snapshot.summary.push({
      bookingRef:booking.sourceBookingRef,
      leadName:booking.leadName,
      action:index>=0?'Updated':'Imported',
      warnings:row.conflicts
    });
  });

  DB.christmasImports.unshift(snapshot);
  saveDB();
  ChristmasOS.importDraft={
    csvFileName:'',pdfFileName:'',csvBookings:[],chefBookings:[],rows:[],warnings:[],csvReady:false,pdfReady:false
  };
  ChristmasOS.activeTab='christmas-day';
  ChristmasOS.dayView='bookings';
  renderSection();
  toast(`${snapshot.imported} bookings imported and ${snapshot.updated} updated`);
};

ChristmasOS.clearImportDraft = function() {
  ChristmasOS.importDraft={csvFileName:'',pdfFileName:'',csvBookings:[],chefBookings:[],rows:[],warnings:[],csvReady:false,pdfReady:false};
  renderSection();
};

ChristmasOS.renderImportCentre = function() {
  const draft=ChristmasOS.importDraft;
  const stats=ChristmasOS.importStats();
  const history=DB.christmasImports||[];

  return `<div class="space-y-4">
    <section class="section-card">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-red-600">IMPORT & RECONCILIATION CENTRE</p>
          <h3 class="text-2xl font-bold mt-1">Turn the website reports into usable Christmas Day records</h3>
          <p class="text-sm text-gray-500 mt-2 max-w-3xl">Upload the latest booking CSV and Chef Report PDF. Nothing is applied automatically: the CRM matches records, highlights disagreements and asks the user to approve what should change.</p>
        </div>
        ${(draft.csvReady||draft.pdfReady)?`<button onclick="ChristmasOS.clearImportDraft()" class="px-4 py-2.5 bg-gray-100 rounded-lg font-semibold">Clear Current Import</button>`:''}
      </div>

      <div class="grid md:grid-cols-2 gap-4 mt-5">
        <label class="rounded-2xl border-2 border-dashed ${draft.csvReady?'border-green-300 bg-green-50':'border-gray-300 bg-cream-50'} p-6 cursor-pointer hover:border-red-300">
          <input type="file" accept=".csv,text/csv" class="hidden" onchange="ChristmasOS.readCSVFile(this)">
          <div class="flex items-start gap-4">
            <span class="w-12 h-12 rounded-xl bg-white border flex items-center justify-center text-olive-700"><i data-lucide="sheet"></i></span>
            <div><strong class="text-lg">1. Upload booking CSV</strong><p class="text-sm text-gray-500 mt-1">Booking reference, status, arrival time, adult/child covers, area, payment position and requests.</p><p class="text-xs font-semibold mt-3 ${draft.csvReady?'text-green-700':'text-red-700'}">${draft.csvReady?`${esc(draft.csvFileName)} · ${draft.csvBookings.length} rows read`:'Choose the downloaded CSV file'}</p></div>
          </div>
        </label>

        <label class="rounded-2xl border-2 border-dashed ${draft.pdfReady?'border-green-300 bg-green-50':'border-gray-300 bg-cream-50'} p-6 cursor-pointer hover:border-red-300">
          <input type="file" accept=".pdf,application/pdf" class="hidden" onchange="ChristmasOS.readChefPDF(this)">
          <div class="flex items-start gap-4">
            <span class="w-12 h-12 rounded-xl bg-white border flex items-center justify-center text-red-700"><i data-lucide="file-text"></i></span>
            <div><strong class="text-lg">2. Upload Chef Report PDF</strong><p class="text-sm text-gray-500 mt-1">Named guests, adult/kids menus, each course, product modifiers and till-account status.</p><p id="xmas-pdf-import-status" class="text-xs font-semibold mt-3 ${draft.pdfReady?'text-green-700':'text-red-700'}">${draft.pdfReady?`${esc(draft.pdfFileName)} · ${draft.chefBookings.length} bookings extracted`:'Choose the full Chef Report PDF'}</p></div>
          </div>
        </label>
      </div>

      <div class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>The reports are not assumed to be correct.</strong> Booking references are used where available. Chef records are matched using lead name, arrival time and covers. Differences remain visible until somebody approves or ignores them.
      </div>
    </section>

    ${(draft.csvReady||draft.pdfReady)?`
    <section class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      ${[
        ['CSV Rows',stats.csvRows],
        ['Confirmed',stats.confirmed],
        ['Excluded',stats.excluded],
        ['Confirmed Covers',stats.covers],
        ['Exact Matches',stats.exact],
        ['Changed',stats.changed],
        ['Conflicts',stats.conflicts],
        ['Approved',stats.importable]
      ].map(([label,value])=>`<div class="section-card"><p class="text-xs text-gray-500">${label}</p><strong class="text-2xl mt-1 block">${value}</strong></div>`).join('')}
    </section>

    <section class="section-card">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div><h3 class="font-bold text-lg">Reconciliation Review</h3><p class="text-sm text-gray-500">Approve clean records, open uncertain records and ignore rejected or duplicate rows.</p></div>
        <div class="flex gap-2"><span class="badge bg-amber-100 text-amber-700">${stats.review} require review</span><button onclick="ChristmasOS.applyImport()" class="px-4 py-2.5 bg-red-700 text-white rounded-lg font-semibold">Apply ${stats.importable} Approved Records</button></div>
      </div>
      <div class="overflow-x-auto mt-4">
        <table class="w-full min-w-[1180px] text-sm">
          <thead class="bg-cream-50 text-xs text-gray-500"><tr><th class="text-left px-3 py-3">Booking</th><th class="text-left px-3 py-3">Reference</th><th class="text-left px-3 py-3">Time</th><th class="text-center px-3 py-3">CSV Covers</th><th class="text-center px-3 py-3">Chef Covers</th><th class="text-left px-3 py-3">Match</th><th class="text-left px-3 py-3">Issues / Changes</th><th class="text-left px-3 py-3">Decision</th><th></th></tr></thead>
          <tbody>${draft.rows.length?draft.rows.map(row=>{
            const issues=[...row.conflicts,...row.changes];
            return `<tr class="border-t ${row.conflicts.length?'bg-red-50/40':''}">
              <td class="px-3 py-3"><strong>${esc(row.csv?.leadName||row.chef?.leadName||'Unknown')}</strong><p class="text-xs text-gray-400">${esc(row.csv?.bookingStatus||'Chef Report only')}</p></td>
              <td class="px-3 py-3 font-mono text-xs">${esc(row.csv?.bookingRef||'—')}</td>
              <td class="px-3 py-3">${row.csv?.timeSlot||row.chef?.timeSlot||'—'}</td>
              <td class="px-3 py-3 text-center">${row.csv?.covers??'—'}</td>
              <td class="px-3 py-3 text-center">${row.chef?.covers??'—'}</td>
              <td class="px-3 py-3"><span class="badge ${row.matchType==='Exact Match'||row.matchType==='Already Up to Date'?'bg-green-100 text-green-700':row.matchType==='New Booking'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}">${row.matchType}</span></td>
              <td class="px-3 py-3"><p class="max-w-md text-xs ${row.conflicts.length?'text-red-700':'text-gray-500'}">${issues.length?issues.map(esc).join(' · '):'No conflict detected'}</p></td>
              <td class="px-3 py-3"><select onchange="ChristmasOS.setImportAction('${row.id}',this.value)" class="px-2 py-2 border rounded-lg ${row.action==='review'?'border-amber-400 bg-amber-50':''}">
                <option value="import" ${row.action==='import'?'selected':''}>Approve Import</option>
                <option value="review" ${row.action==='review'?'selected':''}>Needs Review</option>
                <option value="ignore" ${row.action==='ignore'?'selected':''}>Ignore</option>
              </select></td>
              <td class="px-3 py-3"><button onclick="ChristmasOS.previewImportRow('${row.id}')" class="px-3 py-2 bg-olive-100 text-olive-700 rounded-lg">Open</button></td>
            </tr>`;
          }).join(''):`<tr><td colspan="9" class="p-10 text-center text-gray-400">Upload a report to begin reconciliation.</td></tr>`}</tbody>
        </table>
      </div>
    </section>`:''}

    <section class="section-card">
      <h3 class="font-bold text-lg">Import History</h3>
      <p class="text-sm text-gray-500 mt-1">Each approved upload is recorded so the team can see when the Christmas information was refreshed.</p>
      <div class="space-y-2 mt-4">${history.length?history.slice(0,10).map(item=>`<div class="rounded-xl border p-3 grid md:grid-cols-[180px_1fr_auto] gap-3 items-center"><div><strong>${new Date(item.createdAt).toLocaleDateString('en-GB')}</strong><p class="text-xs text-gray-400">${new Date(item.createdAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</p></div><div><p class="text-sm">${esc(item.csvFileName||'No CSV')} · ${esc(item.pdfFileName||'No PDF')}</p><p class="text-xs text-gray-500">${item.rowsRead} reviewed · ${item.imported} new · ${item.updated} updated · ${item.conflicts} conflicts</p></div><span class="badge bg-green-100 text-green-700">Applied</span></div>`).join(''):'<div class="rounded-xl border border-dashed p-8 text-center text-gray-400">No report imports have been applied yet.</div>'}</div>
    </section>
  </div>`;
};
