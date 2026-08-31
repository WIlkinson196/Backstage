
// ============================================================================
// WINDMILL FARM — OPERATIONS HUB V1
// Overrides the legacy dashboard with one unified daily operating view.
// ============================================================================

window.OperationsHub = window.OperationsHub || {
  scope: 'mine',
  statusFilter: 'open',
  departmentFilter: '',
  dayPart: 'all',
  plannerOpen:false,
  plannerWeek:'',
  plannerMode:'week',
  previewUser:''
};

OperationsHub.uid = function(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
};

OperationsHub.ensureData = function() {
  DB.operationsTasks = Array.isArray(DB.operationsTasks) ? DB.operationsTasks : [];
  DB.operationsTemplates = Array.isArray(DB.operationsTemplates) ? DB.operationsTemplates : [];
  DB.tasks = Array.isArray(DB.tasks) ? DB.tasks : [];
  saveDB();
};

OperationsHub.today = function() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,10);
};

OperationsHub.addDays = function(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,10);
};

OperationsHub.weekBounds = function() {
  const today = new Date(`${OperationsHub.today()}T12:00:00`);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const iso = date => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,10);
  return {start:iso(monday), end:iso(sunday)};
};

OperationsHub.actualUserName = function() {
  const profileName=String(window.currentUserProfile?.display_name||'').trim();
  if(profileName)return profileName;
  const profileEmail=String(window.currentUserProfile?.email||'').trim();
  if(profileEmail)return profileEmail.split('@')[0];
  return 'Team';
};

OperationsHub.currentName = function() {
  return OperationsHub.previewUser || OperationsHub.actualUserName();
};

OperationsHub.currentFirstName = function() {
  return String(OperationsHub.currentName()||'Team').trim().split(/\s+/)[0]||'Team';
};

OperationsHub.actualRole = function() {
  if(typeof currentUserRole==='function')return currentUserRole();
  return String(window.currentUserProfile?.role||'staff');
};

OperationsHub.actualJobTitle = function() {
  if(typeof currentUserJobTitle==='function')return currentUserJobTitle();
  return '';
};

OperationsHub.isManagerProfile = function() {
  const role=OperationsHub.actualRole();
  const title=OperationsHub.actualJobTitle().toLowerCase();
  return ['owner','admin','manager'].includes(role) ||
    /manager|deputy|general manager|m&e manager/.test(title);
};

OperationsHub.previewOptions = function() {
  const options=[...activeStaff().map(staff=>staff.name)];
  ['Duty Manager','Reception & Sales','Kitchen','Whole Team'].forEach(value=>{
    if(!options.includes(value))options.push(value);
  });
  return options;
};

OperationsHub.setPreviewUser = function(value) {
  OperationsHub.previewUser=value;
  OperationsHub.scope='mine';
  renderSection();
};

OperationsHub.ownerMatchesRoleGroup = function(owner) {
  const value=String(owner||'').trim().toLowerCase();
  const name=String(OperationsHub.currentName()||'').trim().toLowerCase();
  const actualName=String(OperationsHub.actualUserName()||'').trim().toLowerCase();
  const title=OperationsHub.actualJobTitle().toLowerCase();
  const role=OperationsHub.actualRole();

  // When previewing a role/team option, treat it as the selected identity.
  if(OperationsHub.previewUser){
    const preview=String(OperationsHub.previewUser).toLowerCase();
    if(value===preview)return true;
    if(preview==='duty manager'&&value==='duty manager')return true;
    if(preview==='reception & sales'&&value==='reception & sales')return true;
    if(preview==='kitchen'&&value==='kitchen')return true;
  }

  if(value==='duty manager'){
    return ['owner','admin','manager'].includes(role) ||
      /manager|deputy|general manager|m&e manager/.test(title);
  }

  if(value==='reception & sales'){
    return role==='sales' ||
      /reception|sales|m&e/.test(title) ||
      ['amber','harriet'].some(person=>name===person||name.startsWith(`${person} `));
  }

  if(value==='kitchen'){
    return role==='kitchen' || /kitchen|chef|cook/.test(title);
  }

  if(value==='management'){
    return OperationsHub.isManagerProfile();
  }

  return false;
};

OperationsHub.isMine = function(owner) {
  const value=String(owner||'').trim().toLowerCase();
  const full=String(OperationsHub.currentName()||'').trim().toLowerCase();
  const first=String(OperationsHub.currentFirstName()||'').trim().toLowerCase();

  if(!value||value==='whole team'||value==='all team')return true;
  if(value===full||value===first)return true;

  // Allows "Scott Wilkinson" to match "Scott" and vice versa without matching
  // unrelated names that merely contain the same letters.
  const ownerFirst=value.split(/\s+/)[0];
  const userFirst=full.split(/\s+/)[0];
  if(ownerFirst&&userFirst&&ownerFirst===userFirst)return true;

  return OperationsHub.ownerMatchesRoleGroup(owner);
};


OperationsHub.isReceptionProfile = function() {
  const role=OperationsHub.actualRole();
  const title=OperationsHub.actualJobTitle().toLowerCase();
  const name=OperationsHub.actualUserName().toLowerCase();
  return role==='sales' ||
    /reception|sales|m&e/.test(title) ||
    ['amber','harriet'].some(person=>name===person||name.startsWith(`${person} `));
};

OperationsHub.isKitchenProfile = function() {
  const role=OperationsHub.actualRole();
  const title=OperationsHub.actualJobTitle().toLowerCase();
  return role==='kitchen'||/kitchen|chef|cook/.test(title);
};

OperationsHub.canCreateTask = function() {
  return !OperationsHub.previewUser &&
    (OperationsHub.isManagerProfile()||OperationsHub.isReceptionProfile());
};

OperationsHub.taskCreatedByMe = function(task) {
  const created=String(task?.createdBy||'').trim().toLowerCase();
  const actual=String(OperationsHub.actualUserName()||'').trim().toLowerCase();
  const createdFirst=created.split(/\s+/)[0];
  const actualFirst=actual.split(/\s+/)[0];
  return Boolean(created&&actual&&(created===actual||(createdFirst&&createdFirst===actualFirst)));
};

OperationsHub.canEditTask = function(task) {
  if(OperationsHub.previewUser)return false;
  if(OperationsHub.isManagerProfile())return true;
  if(!task||OperationsHub.statusDone(task.status))return false;
  return OperationsHub.isReceptionProfile()&&OperationsHub.taskCreatedByMe(task);
};

OperationsHub.canDeleteTask = function(task) {
  if(OperationsHub.previewUser)return false;
  if(OperationsHub.isManagerProfile())return true;
  if(!task||OperationsHub.statusDone(task.status))return false;
  return OperationsHub.isReceptionProfile()&&OperationsHub.taskCreatedByMe(task);
};

OperationsHub.canCompleteTask = function(task) {
  if(OperationsHub.previewUser)return false;
  if(OperationsHub.isManagerProfile())return true;
  if(!task)return false;
  return OperationsHub.isMine(task.owner);
};

OperationsHub.canUsePlanner = function() {
  return !OperationsHub.previewUser&&OperationsHub.isManagerProfile();
};

OperationsHub.availableTaskOwners = function(task) {
  const options=[];
  const add=value=>{if(value&&!options.includes(value))options.push(value);};

  add('Whole Team');
  add('Duty Manager');
  add('Reception & Sales');

  if(OperationsHub.isManagerProfile())add('Kitchen');

  const current=OperationsHub.actualUserName();
  add(current);

  activeStaff().forEach(staff=>{
    if(OperationsHub.isManagerProfile()){
      add(staff.name);
      return;
    }

    // Reception can assign within Reception/Sales, to themselves, to a shared
    // team, or escalate the job to Duty Manager.
    const name=String(staff.name||'').toLowerCase();
    const job=String(staff.job_title||staff.jobTitle||'').toLowerCase();
    const role=String(staff.role||'').toLowerCase();
    if(
      staff.name===current ||
      role==='sales' ||
      /reception|sales|m&e/.test(job) ||
      ['amber','harriet'].some(person=>name===person||name.startsWith(`${person} `))
    ) add(staff.name);
  });

  if(task?.owner)add(task.owner);
  return options;
};

OperationsHub.guardPreview = function() {
  if(!OperationsHub.previewUser)return false;
  toast('Preview mode is read-only. Return to your real account to make changes.','error');
  return true;
};

OperationsHub.priorityWeight = function(priority) {
  return ({Critical:0,Urgent:0,High:1,Normal:2,Medium:2,Low:3})[priority] ?? 2;
};

OperationsHub.statusDone = function(status) {
  return ['Completed','Complete','Done'].includes(status);
};

OperationsHub.dateState = function(date, status) {
  if (OperationsHub.statusDone(status)) return 'complete';
  if (!date) return 'undated';
  if (date < OperationsHub.today()) return 'overdue';
  if (date === OperationsHub.today()) return 'today';
  return 'upcoming';
};

OperationsHub.manualTasks = function() {
  return (DB.operationsTasks || []).map(task => ({
    ...task,
    hubType:'manager',
    sourceLabel:'Manager Task',
    sourceIcon:'clipboard-check',
    action:`OperationsHub.openTask('${task.id}')`,
    completeAction:`OperationsHub.toggleTask('${task.id}')`,
    value:Number(task.commercialValue || 0),
    due:task.dueDate || '',
    status:task.status || 'Not Started'
  }));
};

OperationsHub.crmTasks = function() {
  return (DB.tasks || []).map(task => ({
    id:`crm-${task.id}`,
    originalId:task.id,
    title:task.title || 'CRM task',
    description:task.notes || task.client || '',
    department:task.category || 'General',
    owner:task.owner || '',
    priority:task.priority || 'Normal',
    due:task.due || '',
    status:task.status || 'Not Started',
    estimatedMinutes:Number(task.estimatedMinutes || 0),
    checklist:[],
    hubType:'crm-task',
    sourceLabel:'Follow-Up',
    sourceIcon:'check-square',
    action:`navigate('tasks')`,
    completeAction:`cycleTaskStatus('${task.id}')`,
    value:0
  }));
};

OperationsHub.enquiryTasks = function() {
  const closed = ['Confirmed','Confirmed Booking','Lost','Lost Enquiry','Archived','Cancelled'];
  return (DB.enquiries || [])
    .filter(item => !closed.includes(item.status))
    .filter(item => item.nextFollowup || !item.firstContactedAt)
    .map(item => {
      const newContact = item.status === 'New Enquiry' && !item.firstContactedAt;
      return {
        id:`enquiry-${item.id}`,
        title:newContact ? `Make first contact: ${item.name || 'New enquiry'}` : `${item.nextAction || 'Follow up'}: ${item.name || 'Enquiry'}`,
        description:`${item.eventType || 'Event'} · ${item.guests || 0} guests`,
        department:'Sales',
        owner:item.staff || '',
        priority:item.priority === 'Hot' ? 'High' : item.priority === 'Cold' ? 'Low' : 'Normal',
        due:item.nextFollowup || item.enquiryDate || OperationsHub.today(),
        status:'Not Started',
        hubType:'enquiry',
        sourceLabel:'Enquiry',
        sourceIcon:'inbox',
        action:`viewEnquiry('${item.id}')`,
        completeAction:`viewEnquiry('${item.id}')`,
        value:Number(item.value || item.estimatedValue || 0),
        checklist:[]
      };
    });
};

OperationsHub.weddingTasks = function() {
  const tasks = [];
  (DB.weddingTasks || []).filter(item => !OperationsHub.statusDone(item.status)).forEach(item => {
    tasks.push({
      id:`wedding-task-${item.id}`,
      title:item.title || item.task || 'Wedding action',
      description:item.notes || '',
      department:'Functions',
      owner:item.owner || item.assignedTo || '',
      priority:item.priority || 'Normal',
      due:item.due || item.dueDate || '',
      status:item.status || 'Not Started',
      hubType:'wedding',
      sourceLabel:'Wedding',
      sourceIcon:'heart',
      action:`navigate('weddings')`,
      completeAction:`navigate('weddings')`,
      value:0,
      checklist:[]
    });
  });
  (DB.weddings || []).forEach(wedding => {
    if (!wedding.date || wedding.date < OperationsHub.today()) return;
    const days = Math.ceil((new Date(wedding.date+'T12:00:00') - new Date(OperationsHub.today()+'T12:00:00')) / 86400000);
    if (days <= 14) {
      tasks.push({
        id:`wedding-review-${wedding.id}`,
        title:`Review upcoming wedding: ${wedding.coupleNames || wedding.couple || wedding.name || 'Wedding'}`,
        description:`${days} day${days===1?'':'s'} away · ${wedding.dayGuests || wedding.guests || 0} day guests`,
        department:'Functions',
        owner:wedding.coordinator || '',
        priority:days <= 7 ? 'High' : 'Normal',
        due:OperationsHub.today(),
        status:'Not Started',
        hubType:'wedding',
        sourceLabel:'Wedding',
        sourceIcon:'heart',
        action:`navigate('weddings')`,
        completeAction:`navigate('weddings')`,
        value:Number(wedding.value || wedding.quotedValue || 0),
        checklist:[]
      });
    }
  });
  return tasks;
};

OperationsHub.christmasTasks = function() {
  const tasks = [];
  (DB.christmasBookings || []).forEach(booking => {
    const guests = booking.guests || [];
    const due = guests.reduce((sum,g)=>sum+Number(g.amountDue||0),0) || Number(booking.totalValue||0);
    const paid = guests.reduce((sum,g)=>sum+Number(g.amountPaid||0),0) || Number(booking.amountPaid||0);
    if (due-paid > .01) {
      tasks.push({
        id:`christmas-pay-${booking.id}`,
        title:`Christmas payment outstanding: ${booking.leadName || 'Booking'}`,
        description:`£${(due-paid).toFixed(2)} outstanding`,
        department:'Christmas',
        owner:'Reception & Sales',
        priority:'High',
        due:'',
        status:'Not Started',
        hubType:'christmas',
        sourceLabel:'Christmas',
        sourceIcon:'gift',
        action:`navigate('christmas')`,
        completeAction:`navigate('christmas')`,
        value:due-paid,
        checklist:[]
      });
    }
    if (guests.length && guests.some(g=>!g.starter || !g.main || !g.dessert)) {
      tasks.push({
        id:`christmas-menu-${booking.id}`,
        title:`Christmas menu choices missing: ${booking.leadName || 'Booking'}`,
        description:`${guests.filter(g=>!g.starter||!g.main||!g.dessert).length} guest record(s) incomplete`,
        department:'Christmas',
        owner:'Reception & Sales',
        priority:'Normal',
        due:'',
        status:'Not Started',
        hubType:'christmas',
        sourceLabel:'Christmas',
        sourceIcon:'gift',
        action:`navigate('christmas')`,
        completeAction:`navigate('christmas')`,
        value:0,
        checklist:[]
      });
    }
  });
  return tasks;
};

OperationsHub.hotelTasks = function() {
  const today = new Date(`${OperationsHub.today()}T12:00:00`);
  const day = today.getDay();
  if (day !== 1) return [];
  const week = DB.hotelWeek || {};
  const hasPrices = Array.isArray(week.hotels) && week.hotels.some(hotel => (hotel.days||[]).some(cell=>cell.price || cell.soldOut));
  return [{
    id:'hotel-monday-review',
    title:hasPrices ? 'Review and confirm next week’s hotel pricing' : 'Complete next week’s hotel competitor review',
    description:'Enter public rates, sold-out hotels and key events.',
    department:'Hotel',
    owner:'Duty Manager',
    priority:'High',
    due:OperationsHub.today(),
    status:'Not Started',
    hubType:'hotel',
    sourceLabel:'Hotel',
    sourceIcon:'hotel',
    action:`navigate('hotel')`,
    completeAction:`navigate('hotel')`,
    value:0,
    checklist:[]
  }];
};

OperationsHub.kitchenTasks = function() {
  const day = new Date(`${OperationsHub.today()}T12:00:00`).getDay();
  if (day !== 1) return [];
  return [{
    id:'kitchen-weekly-order',
    title:'Prepare the weekly function-food order',
    description:'Add this week’s functions and print the combined shopping list.',
    department:'Kitchen',
    owner:'Kitchen',
    priority:'High',
    due:OperationsHub.today(),
    status:'Not Started',
    hubType:'kitchen',
    sourceLabel:'Kitchen',
    sourceIcon:'chef-hat',
    action:`navigate('kitchen')`,
    completeAction:`navigate('kitchen')`,
    value:0,
    checklist:[]
  }];
};

OperationsHub.allItems = function() {
  const items = [
    ...OperationsHub.manualTasks(),
    ...OperationsHub.crmTasks(),
    ...OperationsHub.enquiryTasks(),
    ...OperationsHub.weddingTasks(),
    ...OperationsHub.christmasTasks(),
    ...OperationsHub.hotelTasks(),
    ...OperationsHub.kitchenTasks()
  ];
  return items.map(item => ({
    ...item,
    dateState:OperationsHub.dateState(item.due, item.status)
  })).sort((a,b) => {
    const dateOrder = {overdue:0,today:1,undated:2,upcoming:3,complete:4};
    return (dateOrder[a.dateState]??3)-(dateOrder[b.dateState]??3)
      || OperationsHub.priorityWeight(a.priority)-OperationsHub.priorityWeight(b.priority)
      || String(a.due||'9999').localeCompare(String(b.due||'9999'));
  });
};

OperationsHub.filteredItems = function() {
  let items = OperationsHub.allItems();
  if (OperationsHub.scope === 'mine') items = items.filter(item => OperationsHub.isMine(item.owner));
  if (OperationsHub.scope === 'team') items = items.filter(item => !OperationsHub.isMine(item.owner));
  if (OperationsHub.statusFilter === 'open') items = items.filter(item => !OperationsHub.statusDone(item.status));
  if (OperationsHub.statusFilter === 'today') items = items.filter(item => !OperationsHub.statusDone(item.status) && item.dateState === 'today');
  if (OperationsHub.statusFilter === 'backlog') items = items.filter(item => !OperationsHub.statusDone(item.status) && item.dateState === 'overdue');
  if (OperationsHub.statusFilter === 'completed') items = items.filter(item => OperationsHub.statusDone(item.status));
  if (OperationsHub.departmentFilter) items = items.filter(item => item.department === OperationsHub.departmentFilter);
  return items;
};

OperationsHub.scrollToQueue = function() {
  setTimeout(()=>{
    const el=document.querySelector('.ops-work-panel');
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  },60);
};

OperationsHub.startMyDay = function() {
  OperationsHub.scope = OperationsHub.isManagerProfile() ? 'all' : 'mine';
  OperationsHub.statusFilter = 'today';
  OperationsHub.departmentFilter = '';
  renderSection();
  OperationsHub.scrollToQueue();
  if(typeof toast==='function') toast('Focus mode: showing only your work due today');
};

OperationsHub.reviewBacklog = function() {
  OperationsHub.scope = OperationsHub.isManagerProfile() ? 'all' : 'mine';
  OperationsHub.statusFilter = 'backlog';
  OperationsHub.departmentFilter = '';
  renderSection();
  OperationsHub.scrollToQueue();
  if(typeof toast==='function') toast('Backlog recovery: showing overdue work separately');
};

OperationsHub.setScope = function(value) {
  OperationsHub.scope = value;
  renderSection();
};

OperationsHub.setStatusFilter = function(value) {
  OperationsHub.statusFilter = value;
  renderSection();
};

OperationsHub.setDepartment = function(value) {
  OperationsHub.departmentFilter = value;
  renderSection();
};

OperationsHub.openTask = function(id='') {
  if(!id&&!OperationsHub.canCreateTask()){
    toast('Your account cannot create operational tasks.','error');
    return;
  }
  if(OperationsHub.guardPreview())return;

  const existing=id?DB.operationsTasks.find(item=>item.id===id):null;
  if(id&&!existing)return toast('This task could not be found.','error');

  const bounds=OperationsHub.weekBounds();
  const task=existing?JSON.parse(JSON.stringify(existing)):{
    id:OperationsHub.uid('ops-task'),
    title:'',
    description:'',
    department:'Reception',
    owner:OperationsHub.isManagerProfile()?'Whole Team':OperationsHub.actualUserName(),
    priority:'Normal',
    status:'Not Started',
    dueDate:OperationsHub.today(),
    dayPart:'Any Time',
    estimatedMinutes:30,
    commercialValue:0,
    createdBy:OperationsHub.actualUserName(),
    checklist:[],
    notes:''
  };

  const editable=!existing||OperationsHub.canEditTask(existing);
  const completable=existing&&OperationsHub.canCompleteTask(existing);
  const deletable=existing&&OperationsHub.canDeleteTask(existing);
  const completed=OperationsHub.statusDone(task.status);
  const ownerOptions=OperationsHub.availableTaskOwners(task);

  if(existing&&!editable){
    const doneCount=(task.checklist||[]).filter(item=>item.done).length;
    openModal(`<div class="p-5 max-w-3xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">OPERATIONAL TASK</p>
          <h2 class="text-2xl font-bold mt-1">${esc(task.title)}</h2>
          <p class="text-sm text-gray-500 mt-1">${esc(task.description||'No additional instructions were added.')}</p>
        </div>
        <button onclick="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="x"></i></button>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <div class="rounded-xl bg-cream-50 border p-3"><p class="text-xs text-gray-500">Assigned to</p><strong class="block mt-1">${esc(task.owner||'Unassigned')}</strong></div>
        <div class="rounded-xl bg-cream-50 border p-3"><p class="text-xs text-gray-500">Department</p><strong class="block mt-1">${esc(task.department||'General')}</strong></div>
        <div class="rounded-xl bg-cream-50 border p-3"><p class="text-xs text-gray-500">Due</p><strong class="block mt-1">${task.dueDate?new Date(task.dueDate+'T12:00:00').toLocaleDateString('en-GB'):'No date'}</strong></div>
        <div class="rounded-xl bg-cream-50 border p-3"><p class="text-xs text-gray-500">Status</p><strong class="block mt-1">${esc(task.status||'Not Started')}</strong></div>
      </div>

      ${(task.checklist||[]).length?`<section class="mt-5">
        <div class="flex justify-between gap-3"><h3 class="font-bold">Checklist</h3><span class="text-sm text-gray-500">${doneCount}/${task.checklist.length}</span></div>
        <div class="space-y-2 mt-3">${task.checklist.map(item=>`
          <button ${completable?'':'disabled'} onclick="${completable?`OperationsHub.toggleChecklist('${task.id}','${item.id}');closeModal()`:'void(0)'}" class="w-full flex items-start gap-3 text-left rounded-xl border p-3 ${item.done?'bg-green-50 border-green-200':'bg-white'}">
            <i data-lucide="${item.done?'check-square':'square'}" style="width:18px;height:18px" class="${item.done?'text-green-700':'text-gray-400'}"></i>
            <span class="${item.done?'line-through text-gray-500':''}">${esc(item.text)}</span>
          </button>`).join('')}</div>
      </section>`:''}

      ${task.notes?`<section class="mt-5 rounded-xl border p-4"><p class="text-xs font-bold tracking-widest text-gray-400">MANAGER NOTES</p><p class="text-sm mt-2">${esc(task.notes)}</p></section>`:''}

      <div class="mt-6 flex justify-end gap-2">
        <button onclick="closeModal()" class="px-4 py-2.5 bg-gray-100 rounded-lg font-semibold">Close</button>
        ${completable?`<button onclick="OperationsHub.toggleTask('${task.id}');closeModal()" class="px-5 py-2.5 ${completed?'bg-amber-100 text-amber-800':'bg-olive-700 text-white'} rounded-lg font-semibold">
          ${completed?'Reopen Task':'Complete Task'}
        </button>`:''}
      </div>
    </div>`);
    return;
  }

  openModal(`<div class="p-5 max-w-4xl">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">${OperationsHub.isManagerProfile()?'MANAGER TASK':'TEAM TASK'}</p>
        <h2 class="text-2xl font-bold mt-1">${existing?'Edit operational task':'Add operational task'}</h2>
        <p class="text-sm text-gray-500 mt-1">Add work that needs visibility alongside enquiries, weddings and daily operations.</p>
      </div>
      <button onclick="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg"><i data-lucide="x"></i></button>
    </div>

    <form onsubmit="OperationsHub.saveTask(event,'${task.id}')" class="mt-5 space-y-4">
      <div>
        <label class="text-xs font-medium text-gray-600">Task title *</label>
        <input name="title" required value="${esc(task.title||'')}" placeholder="Tidy behind reception, complete hotel audit..." class="mt-1 w-full px-3 py-2.5 border rounded-lg">
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">What does good look like?</label>
        <textarea name="description" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg" placeholder="Clear instruction so the task can be completed without asking a manager.">${esc(task.description||'')}</textarea>
      </div>

      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <label class="text-xs font-medium text-gray-600">Department
          <select name="department" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Reception','Sales','Functions','Kitchen','Hotel','Christmas','Management','General'].map(value=>`<option ${task.department===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Assigned to
          <select name="owner" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${ownerOptions.map(value=>`<option ${task.owner===value?'selected':''}>${esc(value)}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Priority
          <select name="priority" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Critical','High','Normal','Low'].map(value=>`<option ${task.priority===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Due date
          <input name="dueDate" type="date" value="${task.dueDate||''}" min="${bounds.start}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
        </label>
        <label class="text-xs font-medium text-gray-600">Best time
          <select name="dayPart" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Any Time','Morning','Afternoon','Evening'].map(value=>`<option ${task.dayPart===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Estimated minutes
          <input name="estimatedMinutes" type="number" min="0" step="5" value="${Number(task.estimatedMinutes||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
        </label>
        ${OperationsHub.isManagerProfile()?`<label class="text-xs font-medium text-gray-600">Commercial value
          <input name="commercialValue" type="number" min="0" step="1" value="${Number(task.commercialValue||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
        </label>`:`<input type="hidden" name="commercialValue" value="${Number(task.commercialValue||0)}">`}
        <label class="text-xs font-medium text-gray-600">Status
          <select name="status" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Not Started','In Progress','Blocked','Completed'].map(value=>`<option ${task.status===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Checklist</label>
        <p class="text-xs text-gray-400">One item per line.</p>
        <textarea name="checklistText" rows="5" class="mt-1 w-full px-3 py-2.5 border rounded-lg" placeholder="Check bedrooms 1–5&#10;Log maintenance issues&#10;Photograph completed area">${esc((task.checklist||[]).map(item=>item.text).join('\n'))}</textarea>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">${OperationsHub.isManagerProfile()?'Manager notes':'Task notes'}</label>
        <textarea name="notes" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(task.notes||'')}</textarea>
      </div>

      <div class="flex justify-between gap-3">
        <div>${deletable?`<button type="button" onclick="OperationsHub.deleteTask('${task.id}')" class="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg font-semibold">Delete</button>`:''}</div>
        <div class="flex flex-wrap justify-end gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2.5 bg-gray-100 rounded-lg font-semibold">Cancel</button>
          ${completable?`<button type="button" onclick="OperationsHub.toggleTask('${task.id}');closeModal()" class="px-4 py-2.5 ${completed?'bg-amber-100 text-amber-800':'bg-green-100 text-green-800'} rounded-lg font-semibold">${completed?'Reopen Task':'Complete Task'}</button>`:''}
          <button class="px-5 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Save Task</button>
        </div>
      </div>
    </form>
  </div>`);
};
OperationsHub.saveTask = function(event,id) {
  event.preventDefault();
  if(OperationsHub.guardPreview())return;
  const existingTask=DB.operationsTasks.find(item=>item.id===id);
  if(existingTask&&!OperationsHub.canEditTask(existingTask))return toast('You cannot edit this task.','error');
  if(!existingTask&&!OperationsHub.canCreateTask())return toast('You cannot create operational tasks.','error');
  const form = new FormData(event.target);
  const previous = DB.operationsTasks.find(item=>item.id===id);
  const lines = String(form.get('checklistText')||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const oldChecklist = previous?.checklist || [];
  const task = {
    id,
    title:form.get('title'),
    description:form.get('description'),
    department:form.get('department'),
    owner:form.get('owner'),
    priority:form.get('priority'),
    dueDate:form.get('dueDate'),
    dayPart:form.get('dayPart'),
    estimatedMinutes:Number(form.get('estimatedMinutes')||0),
    commercialValue:Number(form.get('commercialValue')||0),
    status:form.get('status'),
    checklist:lines.map((text,index)=>({
      id:oldChecklist[index]?.id || OperationsHub.uid('check'),
      text,
      done:oldChecklist[index]?.text===text ? Boolean(oldChecklist[index].done) : false
    })),
    notes:form.get('notes'),
    createdBy:previous?.createdBy || OperationsHub.actualUserName(),
    createdAt:previous?.createdAt || new Date().toISOString(),
    completedBy:form.get('status')==='Completed' ? (previous?.completedBy || OperationsHub.actualUserName()) : '',
    completedAt:form.get('status')==='Completed' ? (previous?.completedAt || new Date().toISOString()) : '',
    updatedAt:new Date().toISOString()
  };
  const index = DB.operationsTasks.findIndex(item=>item.id===id);
  if(index>=0) DB.operationsTasks[index]=task;
  else DB.operationsTasks.push(task);
  saveDB();
  closeModal();
  renderSection();
  toast(index>=0?'Task updated':'Task assigned');
};

OperationsHub.deleteTask = function(id) {
  if(OperationsHub.guardPreview())return;
  const task=DB.operationsTasks.find(item=>item.id===id);
  if(!OperationsHub.canDeleteTask(task))return toast('You can only delete your own open tasks.','error');
  if(!confirm('Delete this operational task?')) return;
  DB.operationsTasks = DB.operationsTasks.filter(item=>item.id!==id);
  saveDB();
  closeModal();
  renderSection();
};

OperationsHub.toggleTask = function(id) {
  if(OperationsHub.guardPreview())return;
  const task = DB.operationsTasks.find(item=>item.id===id);
  if(!task) return;
  if(!OperationsHub.canCompleteTask(task))return toast('This task is not assigned to you.','error');
  const complete = !OperationsHub.statusDone(task.status);
  task.status = complete ? 'Completed' : 'Not Started';
  task.completedBy = complete ? OperationsHub.actualUserName() : '';
  task.completedAt = complete ? new Date().toISOString() : '';
  task.updatedAt = new Date().toISOString();
  if(complete) (task.checklist||[]).forEach(item=>item.done=true);
  saveDB();
  renderSection();
  toast(complete?'Task completed':'Task reopened');
};

OperationsHub.toggleChecklist = function(taskId,itemId) {
  if(OperationsHub.guardPreview())return;
  const task = DB.operationsTasks.find(item=>item.id===taskId);
  if(!OperationsHub.canCompleteTask(task))return toast('This task is not assigned to you.','error');
  const item = task?.checklist?.find(entry=>entry.id===itemId);
  if(!item) return;
  item.done=!item.done;
  if((task.checklist||[]).length && task.checklist.every(entry=>entry.done)){
    task.status='Completed';
    task.completedBy=OperationsHub.actualUserName();
    task.completedAt=new Date().toISOString();
  } else if(task.status==='Completed') {
    task.status='In Progress';
    task.completedBy='';
    task.completedAt='';
  }
  saveDB();
  renderSection();
};

OperationsHub.departmentStats = function(items) {
  const departments=['Reception','Sales','Functions','Kitchen','Hotel','Christmas','Management','General'];
  return departments.map(department=>{
    const rows=items.filter(item=>item.department===department);
    const open=rows.filter(item=>!OperationsHub.statusDone(item.status));
    const overdue=open.filter(item=>item.dateState==='overdue');
    const complete=rows.length-open.length;
    const score=rows.length?Math.max(0,Math.round((complete/rows.length)*100)-(overdue.length*15)):100;
    return {department,total:rows.length,open:open.length,overdue:overdue.length,complete,score};
  }).filter(item=>item.total || ['Reception','Sales','Functions','Kitchen','Hotel'].includes(item.department));
};


OperationsHub.ensurePlannerWeek = function() {
  if (!OperationsHub.plannerWeek) {
    OperationsHub.plannerWeek = OperationsHub.weekBounds().start;
  }
  return OperationsHub.plannerWeek;
};

OperationsHub.weekDates = function(startDate=OperationsHub.ensurePlannerWeek()) {
  return Array.from({length:7},(_,index)=>{
    const date=OperationsHub.addDays(startDate,index);
    const object=new Date(`${date}T12:00:00`);
    return {
      date,
      index,
      short:object.toLocaleDateString('en-GB',{weekday:'short'}),
      label:object.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'})
    };
  });
};

OperationsHub.templateFrequencyLabel = function(template) {
  if(template.frequency==='Daily') return 'Every day';
  if(template.frequency==='Weekly') {
    const days=(template.weekdays||[]).join(', ');
    return `Weekly${days?` · ${days}`:''}`;
  }
  if(template.frequency==='Monthly') return `Monthly · day ${template.monthDay||1}`;
  return template.frequency||'One off';
};

OperationsHub.openPlanner = function() {
  if(!OperationsHub.canUsePlanner()){
    toast('The weekly planner is available to managers only.','error');
    return;
  }
  OperationsHub.ensurePlannerWeek();
  OperationsHub.plannerOpen=true;
  renderSection();
};

OperationsHub.closePlanner = function() {
  OperationsHub.plannerOpen=false;
  renderSection();
};

OperationsHub.changePlannerWeek = function(offset) {
  OperationsHub.ensurePlannerWeek();
  OperationsHub.plannerWeek=OperationsHub.addDays(OperationsHub.plannerWeek,offset*7);
  renderSection();
};

OperationsHub.openTemplate = function(id='') {
  const existing=id?DB.operationsTemplates.find(item=>item.id===id):null;
  const template=existing?JSON.parse(JSON.stringify(existing)):{
    id:OperationsHub.uid('ops-template'),
    title:'',
    description:'',
    department:'General',
    owner:'Whole Team',
    priority:'Normal',
    dayPart:'Any Time',
    estimatedMinutes:30,
    frequency:'Weekly',
    weekdays:['Monday'],
    monthDay:1,
    checklist:[],
    active:true
  };
  OperationsHub.templateDraft=template;

  openModal(`<div class="p-5 max-w-3xl">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">RECURRING TASK TEMPLATE</p>
        <h2 class="text-2xl font-bold mt-1">${existing?'Edit recurring task':'Create recurring task'}</h2>
        <p class="text-sm text-gray-500 mt-1">Set the standard once so the task can be generated automatically each week.</p>
      </div>
      <button onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100"><i data-lucide="x"></i></button>
    </div>

    <form onsubmit="OperationsHub.saveTemplate(event,'${template.id}')" class="mt-5 space-y-4">
      <div>
        <label class="text-xs font-medium text-gray-600">Task title *</label>
        <input name="title" required value="${esc(template.title||'')}" class="mt-1 w-full px-3 py-2.5 border rounded-lg" placeholder="Hotel pricing review, kitchen order, reception audit...">
      </div>
      <div>
        <label class="text-xs font-medium text-gray-600">Instructions</label>
        <textarea name="description" rows="2" class="mt-1 w-full px-3 py-2.5 border rounded-lg">${esc(template.description||'')}</textarea>
      </div>

      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <label class="text-xs font-medium text-gray-600">Department
          <select name="department" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Reception','Sales','Functions','Kitchen','Hotel','Christmas','Management','General'].map(value=>`<option ${template.department===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Assigned to
          <select name="owner" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            <option ${template.owner==='Whole Team'?'selected':''}>Whole Team</option>
            <option ${template.owner==='Duty Manager'?'selected':''}>Duty Manager</option>
            <option ${template.owner==='Reception & Sales'?'selected':''}>Reception & Sales</option>
            <option ${template.owner==='Kitchen'?'selected':''}>Kitchen</option>
            ${activeStaff().map(staff=>`<option ${template.owner===staff.name?'selected':''}>${esc(staff.name)}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Priority
          <select name="priority" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Critical','High','Normal','Low'].map(value=>`<option ${template.priority===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Best time
          <select name="dayPart" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Any Time','Morning','Afternoon','Evening'].map(value=>`<option ${template.dayPart===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="text-xs font-medium text-gray-600">Estimated minutes
          <input name="estimatedMinutes" type="number" min="0" step="5" value="${Number(template.estimatedMinutes||0)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
        </label>
        <label class="text-xs font-medium text-gray-600">Frequency
          <select name="frequency" onchange="OperationsHub.toggleTemplateFrequency(this.value)" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            ${['Daily','Weekly','Monthly'].map(value=>`<option ${template.frequency===value?'selected':''}>${value}</option>`).join('')}
          </select>
        </label>
        <label id="ops-template-month-day-wrap" class="text-xs font-medium text-gray-600 ${template.frequency==='Monthly'?'':'hidden'}">Month day
          <input name="monthDay" type="number" min="1" max="31" value="${Number(template.monthDay||1)}" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
        </label>
        <label class="text-xs font-medium text-gray-600">Template status
          <select name="active" class="mt-1 w-full px-3 py-2.5 border rounded-lg">
            <option value="true" ${template.active!==false?'selected':''}>Active</option>
            <option value="false" ${template.active===false?'selected':''}>Paused</option>
          </select>
        </label>
      </div>

      <div id="ops-template-weekdays-wrap" class="${template.frequency==='Weekly'?'':'hidden'}">
        <label class="text-xs font-medium text-gray-600">Repeat on</label>
        <div class="flex flex-wrap gap-2 mt-2">
          ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day=>`<label class="px-3 py-2 border rounded-lg text-sm bg-white"><input type="checkbox" name="weekdays" value="${day}" ${(template.weekdays||[]).includes(day)?'checked':''}> ${day.slice(0,3)}</label>`).join('')}
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-600">Checklist</label>
        <textarea name="checklistText" rows="4" class="mt-1 w-full px-3 py-2.5 border rounded-lg" placeholder="One item per line">${esc((template.checklist||[]).map(item=>item.text).join('\n'))}</textarea>
      </div>

      <div class="flex justify-between gap-3">
        <div>${existing?`<button type="button" onclick="OperationsHub.deleteTemplate('${template.id}')" class="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg font-semibold">Delete</button>`:''}</div>
        <div class="flex gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2.5 bg-gray-100 rounded-lg font-semibold">Cancel</button>
          <button class="px-5 py-2.5 bg-olive-700 text-white rounded-lg font-semibold">Save Template</button>
        </div>
      </div>
    </form>
  </div>`);
};

OperationsHub.toggleTemplateFrequency = function(value) {
  document.getElementById('ops-template-weekdays-wrap')?.classList.toggle('hidden',value!=='Weekly');
  document.getElementById('ops-template-month-day-wrap')?.classList.toggle('hidden',value!=='Monthly');
};

OperationsHub.saveTemplate = function(event,id) {
  event.preventDefault();
  const form=new FormData(event.target);
  const weekdays=form.getAll('weekdays');
  const lines=String(form.get('checklistText')||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const previous=DB.operationsTemplates.find(item=>item.id===id);
  const template={
    id,
    title:form.get('title'),
    description:form.get('description'),
    department:form.get('department'),
    owner:form.get('owner'),
    priority:form.get('priority'),
    dayPart:form.get('dayPart'),
    estimatedMinutes:Number(form.get('estimatedMinutes')||0),
    frequency:form.get('frequency'),
    weekdays,
    monthDay:Number(form.get('monthDay')||1),
    active:form.get('active')==='true',
    checklist:lines.map((text,index)=>({id:previous?.checklist?.[index]?.id||OperationsHub.uid('template-check'),text})),
    createdAt:previous?.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  const index=DB.operationsTemplates.findIndex(item=>item.id===id);
  if(index>=0)DB.operationsTemplates[index]=template;
  else DB.operationsTemplates.push(template);
  saveDB();
  closeModal();
  renderSection();
  toast(index>=0?'Recurring task updated':'Recurring task created');
};

OperationsHub.deleteTemplate = function(id) {
  if(!confirm('Delete this recurring task template?'))return;
  DB.operationsTemplates=DB.operationsTemplates.filter(item=>item.id!==id);
  saveDB();
  closeModal();
  renderSection();
};

OperationsHub.templateDatesForWeek = function(template,weekStart) {
  const dates=OperationsHub.weekDates(weekStart);
  if(template.frequency==='Daily')return dates.map(item=>item.date);
  if(template.frequency==='Weekly'){
    return dates.filter(item=>(template.weekdays||[]).includes(
      new Date(`${item.date}T12:00:00`).toLocaleDateString('en-GB',{weekday:'long'})
    )).map(item=>item.date);
  }
  if(template.frequency==='Monthly'){
    return dates.filter(item=>new Date(`${item.date}T12:00:00`).getDate()===Number(template.monthDay||1)).map(item=>item.date);
  }
  return [];
};

OperationsHub.generateRecurringForWeek = function(weekStart=OperationsHub.ensurePlannerWeek()) {
  const active=(DB.operationsTemplates||[]).filter(template=>template.active!==false);
  let created=0;
  active.forEach(template=>{
    OperationsHub.templateDatesForWeek(template,weekStart).forEach(date=>{
      const sourceKey=`${template.id}:${date}`;
      const exists=(DB.operationsTasks||[]).some(task=>task.templateInstanceKey===sourceKey);
      if(exists)return;
      DB.operationsTasks.push({
        id:OperationsHub.uid('ops-task'),
        templateId:template.id,
        templateInstanceKey:sourceKey,
        title:template.title,
        description:template.description,
        department:template.department,
        owner:template.owner,
        priority:template.priority,
        status:'Not Started',
        dueDate:date,
        dayPart:template.dayPart,
        estimatedMinutes:Number(template.estimatedMinutes||0),
        commercialValue:0,
        createdBy:OperationsHub.currentName(),
        createdAt:new Date().toISOString(),
        checklist:(template.checklist||[]).map(item=>({id:OperationsHub.uid('check'),text:item.text,done:false})),
        notes:'Generated from recurring task template',
        published:true
      });
      created++;
    });
  });
  saveDB();
  renderSection();
  toast(created?`${created} recurring task${created===1?'':'s'} added to the week`:'No new recurring tasks were needed');
};

OperationsHub.copyIncompleteFromPreviousWeek = function() {
  const current=OperationsHub.ensurePlannerWeek();
  const previousStart=OperationsHub.addDays(current,-7);
  const previousEnd=OperationsHub.addDays(previousStart,6);
  const incomplete=(DB.operationsTasks||[]).filter(task=>
    task.dueDate>=previousStart&&task.dueDate<=previousEnd&&!OperationsHub.statusDone(task.status)
  );
  if(!incomplete.length)return toast('There are no incomplete tasks to carry forward','error');
  if(!confirm(`Carry forward ${incomplete.length} incomplete task${incomplete.length===1?'':'s'}?`))return;
  incomplete.forEach((task,index)=>{
    DB.operationsTasks.push({
      ...JSON.parse(JSON.stringify(task)),
      id:OperationsHub.uid('ops-task'),
      dueDate:OperationsHub.addDays(current,Math.min(index,6)),
      status:'Not Started',
      completedBy:'',
      completedAt:'',
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      carriedFrom:task.id,
      checklist:(task.checklist||[]).map(item=>({...item,id:OperationsHub.uid('check'),done:false}))
    });
  });
  saveDB();
  renderSection();
  toast(`${incomplete.length} task${incomplete.length===1?'':'s'} carried forward`);
};

OperationsHub.publishWeek = function() {
  const start=OperationsHub.ensurePlannerWeek();
  const end=OperationsHub.addDays(start,6);
  const rows=(DB.operationsTasks||[]).filter(task=>task.dueDate>=start&&task.dueDate<=end);
  rows.forEach(task=>{
    task.published=true;
    task.publishedAt=task.publishedAt||new Date().toISOString();
    task.publishedBy=task.publishedBy||OperationsHub.currentName();
  });
  saveDB();
  renderSection();
  toast(`${rows.length} weekly task${rows.length===1?'':'s'} published`);
};

OperationsHub.weekWorkload = function(weekStart=OperationsHub.ensurePlannerWeek()) {
  const end=OperationsHub.addDays(weekStart,6);
  const tasks=(DB.operationsTasks||[]).filter(task=>task.dueDate>=weekStart&&task.dueDate<=end);
  const owners={};
  tasks.forEach(task=>{
    const owner=task.owner||'Unassigned';
    if(!owners[owner])owners[owner]={owner,tasks:0,minutes:0,complete:0};
    owners[owner].tasks++;
    owners[owner].minutes+=Number(task.estimatedMinutes||0);
    if(OperationsHub.statusDone(task.status))owners[owner].complete++;
  });
  return Object.values(owners).sort((a,b)=>b.minutes-a.minutes||b.tasks-a.tasks);
};

OperationsHub.addTaskForDate = function(date) {
  OperationsHub.openTask();
  setTimeout(()=>{
    const input=document.querySelector('input[name="dueDate"]');
    if(input)input.value=date;
  },50);
};

OperationsHub.renderPlanner = function() {
  const start=OperationsHub.ensurePlannerWeek();
  const dates=OperationsHub.weekDates(start);
  const end=OperationsHub.addDays(start,6);
  const tasks=(DB.operationsTasks||[]).filter(task=>task.dueDate>=start&&task.dueDate<=end);
  const workload=OperationsHub.weekWorkload(start);
  const templates=DB.operationsTemplates||[];
  const completed=tasks.filter(task=>OperationsHub.statusDone(task.status)).length;
  const published=tasks.filter(task=>task.published).length;

  return `<div class="ops-planner-shell">
    <section class="ops-planner-hero">
      <div>
        <p class="ops-eyebrow">WEEKLY MANAGER PLANNER</p>
        <h2>Plan, balance and publish the week</h2>
        <p>Create the standards, audits and improvement work the team must complete alongside normal CRM activity.</p>
      </div>
      <div class="ops-planner-actions">
        <button onclick="OperationsHub.closePlanner()" class="secondary"><i data-lucide="arrow-left"></i>Back to Operations Hub</button>
        <button onclick="OperationsHub.openTask()" class="primary"><i data-lucide="plus"></i>Add Weekly Task</button>
      </div>
    </section>

    <section class="ops-planner-toolbar">
      <button onclick="OperationsHub.changePlannerWeek(-1)"><i data-lucide="chevron-left"></i></button>
      <div><p>WEEK COMMENCING</p><strong>${new Date(start+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</strong></div>
      <button onclick="OperationsHub.changePlannerWeek(1)"><i data-lucide="chevron-right"></i></button>
      <span class="ops-planner-summary">${completed}/${tasks.length} completed · ${published}/${tasks.length} published</span>
      <button onclick="OperationsHub.copyIncompleteFromPreviousWeek()" class="text-btn">Carry Forward</button>
      <button onclick="OperationsHub.generateRecurringForWeek()" class="text-btn">Generate Recurring</button>
      <button onclick="OperationsHub.publishWeek()" class="publish-btn">Publish Weekly Plan</button>
    </section>

    <section class="ops-planner-grid">
      ${dates.map(day=>{
        const dayTasks=tasks.filter(task=>task.dueDate===day.date).sort((a,b)=>OperationsHub.priorityWeight(a.priority)-OperationsHub.priorityWeight(b.priority));
        return `<article class="ops-day-column">
          <div class="ops-day-header">
            <div><p>${day.short.toUpperCase()}</p><strong>${new Date(day.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</strong></div>
            <button onclick="OperationsHub.addTaskForDate('${day.date}')"><i data-lucide="plus"></i></button>
          </div>
          <div class="ops-day-tasks">
            ${dayTasks.length?dayTasks.map(task=>`<button onclick="OperationsHub.openTask('${task.id}')" class="ops-planner-task ${OperationsHub.statusDone(task.status)?'done':''}">
              <span class="priority ${task.priority.toLowerCase()}"></span>
              <strong>${esc(task.title)}</strong>
              <small>${esc(task.owner||'Unassigned')} · ${task.estimatedMinutes||0} min</small>
              <em>${esc(task.department)}</em>
            </button>`).join(''):`<div class="ops-day-empty">No manager tasks</div>`}
          </div>
        </article>`;
      }).join('')}
    </section>

    <section class="ops-planner-bottom">
      <article class="ops-planner-card">
        <div class="ops-card-title"><div><p class="ops-eyebrow olive">TEAM WORKLOAD</p><h3>Before publishing</h3></div></div>
        <div class="ops-workload-list">
          ${workload.length?workload.map(item=>`<div><span><strong>${esc(item.owner)}</strong><small>${item.tasks} tasks · ${Math.floor(item.minutes/60)}h ${item.minutes%60}m</small></span><em>${item.complete}/${item.tasks}</em></div>`).join(''):'<div class="ops-small-empty">Add tasks to see the workload balance.</div>'}
        </div>
      </article>

      <article class="ops-planner-card">
        <div class="ops-card-title"><div><p class="ops-eyebrow olive">RECURRING TASKS</p><h3>Reusable standards</h3></div><button onclick="OperationsHub.openTemplate()">Add</button></div>
        <div class="ops-template-list">
          ${templates.length?templates.map(template=>`<button onclick="OperationsHub.openTemplate('${template.id}')">
            <span><strong>${esc(template.title)}</strong><small>${esc(template.owner)} · ${OperationsHub.templateFrequencyLabel(template)}</small></span>
            <em class="${template.active===false?'paused':''}">${template.active===false?'Paused':'Active'}</em>
          </button>`).join(''):'<div class="ops-small-empty">Create templates for work that repeats every week or month.</div>'}
        </div>
      </article>
    </section>
  </div>`;
};

OperationsHub.taskCard = function(item) {
  const isManual=item.hubType==='manager';
  const completed=OperationsHub.statusDone(item.status);
  const checklist=item.checklist||[];
  const checklistDone=checklist.filter(entry=>entry.done).length;
  const dateText=item.due
    ? new Date(item.due+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
    : 'No fixed date';
  const priorityTone=item.priority==='Critical'||item.priority==='Urgent'
    ? 'danger'
    : item.priority==='High' ? 'warning' : item.priority==='Low' ? 'quiet' : 'normal';
  const stateLabel=item.dateState==='overdue'?'Overdue':item.dateState==='today'?'Today':'Open';
  const detailsId=`ops-details-${String(item.id).replace(/[^a-zA-Z0-9_-]/g,'')}`;
  return `<article class="ops-task-row ${completed?'complete':''} ${item.dateState==='overdue'?'overdue':''}">
    <button onclick="${item.hubType==='manager'&&!OperationsHub.canCompleteTask(item)?`toast('This task is not assigned to you.','error')`:item.completeAction}" class="ops-row-check ${completed?'complete':''} ${item.hubType==='manager'&&!OperationsHub.canCompleteTask(item)?'locked':''}" title="${item.hubType==='manager'&&!OperationsHub.canCompleteTask(item)?'Assigned to another person':completed?'Reopen':'Complete'}">
      <i data-lucide="${completed?'check':'circle'}"></i>
    </button>
    <button onclick="${item.action}" class="ops-row-main">
      <span class="ops-row-title ${completed?'line-through':''}">${esc(item.title)}</span>
      <span class="ops-row-meta">
        <em>${esc(item.sourceLabel)}</em><span>${esc(item.department||'General')}</span><span>${esc(item.owner||'Unassigned')}</span><span>${dateText}</span>
        ${item.estimatedMinutes?`<span>${item.estimatedMinutes} min</span>`:''}
      </span>
    </button>
    <div class="ops-row-signals">
      ${item.value?`<strong>£${Number(item.value).toLocaleString()}</strong>`:''}
      <span class="ops-row-priority ${priorityTone}">${esc(item.priority||'Normal')}</span>
      <span class="ops-row-state ${item.dateState||''}">${stateLabel}</span>
    </div>
    ${(item.description||checklist.length)?`<button class="ops-row-expand" onclick="const el=document.getElementById('${detailsId}');el.classList.toggle('open');this.classList.toggle('open')" title="Show details"><i data-lucide="chevron-down"></i></button>`:'<span class="ops-row-expand-spacer"></span>'}
    ${isManual?`<button onclick="OperationsHub.openTask('${item.id}')" class="ops-row-edit" title="${OperationsHub.canEditTask(item)?'Edit task':'Open task'}"><i data-lucide="${OperationsHub.canEditTask(item)?'pencil':'eye'}"></i></button>`:'<span class="ops-row-edit-spacer"></span>'}
    ${(item.description||checklist.length)?`<div id="${detailsId}" class="ops-row-details">
      ${item.description?`<p>${esc(item.description)}</p>`:''}
      ${checklist.length?`<div class="ops-row-checklist-head"><span>Checklist</span><strong>${checklistDone}/${checklist.length}</strong></div><div class="ops-row-checklist">${checklist.slice(0,6).map(entry=>`<button onclick="OperationsHub.toggleChecklist('${item.id}','${entry.id}')" class="${entry.done?'done':''}"><i data-lucide="${entry.done?'check-square':'square'}"></i><span>${esc(entry.text)}</span></button>`).join('')}</div>`:''}
    </div>`:''}
  </article>`;
};

OperationsHub.timeline = function() {
  const rows = [
    ...(DB.meetings||[]).filter(item=>item.date===OperationsHub.today()&&item.status!=='Completed').map(item=>({
      time:item.time||'All day',title:item.client||item.title||'Meeting',detail:item.type||'Meeting',icon:'calendar-days',action:`navigate('tasks')`
    })),
    ...(DB.events||[]).filter(item=>item.date===OperationsHub.today()).map(item=>({
      time:item.time||'All day',title:item.title||'Event',detail:item.type||'Event',icon:'party-popper',action:`navigate('weddings')`
    })),
    ...(DB.weddings||[]).filter(item=>item.date===OperationsHub.today()).map(item=>({
      time:item.ceremonyTime||item.startTime||'All day',title:item.coupleNames||item.couple||item.name||'Wedding',detail:'Wedding',icon:'heart',action:`navigate('weddings')`
    }))
  ].sort((a,b)=>String(a.time).localeCompare(String(b.time)));
  return rows;
};

function renderDashboard() {
  OperationsHub.ensureData();
  if(OperationsHub.plannerOpen) return OperationsHub.renderPlanner();

  const allItems=OperationsHub.allItems();
  const filtered=OperationsHub.filteredItems();
  const openItems=allItems.filter(item=>!OperationsHub.statusDone(item.status));
  const dueToday=openItems.filter(item=>item.dateState==='today');
  const overdueItems=openItems.filter(item=>item.dateState==='overdue');
  const todayItems=[...overdueItems,...dueToday];
  const completedToday=allItems.filter(item=>OperationsHub.statusDone(item.status)&&String(item.completedAt||'').slice(0,10)===OperationsHub.today()).length;
  const todayTotal=dueToday.length+completedToday;
  const progress=todayTotal?Math.round(completedToday/todayTotal*100):100;
  const overdue=overdueItems.length;
  const critical=openItems.filter(item=>['Critical','Urgent'].includes(item.priority)).length;
  const commercialValue=todayItems.reduce((sum,item)=>sum+Number(item.value||0),0);
  const departments=OperationsHub.departmentStats(allItems);
  const timeline=OperationsHub.timeline();
  const bounds=OperationsHub.weekBounds();
  const weeklyManual=(DB.operationsTasks||[]).filter(item=>item.dueDate>=bounds.start&&item.dueDate<=bounds.end);
  const weeklyDone=weeklyManual.filter(item=>OperationsHub.statusDone(item.status)).length;
  const firstName=OperationsHub.currentFirstName();
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const salesCount=todayItems.filter(item=>item.department==='Sales').length;
  const priorityItems=todayItems.filter(item=>['Critical','Urgent','High'].includes(item.priority)).slice(0,3);
  const workload=dueToday.length+critical;
  const mission=critical
    ? `${critical} critical priorit${critical===1?'y needs':'ies need'} control first.`
    : dueToday.length
      ? `${dueToday.length} action${dueToday.length===1?' is':'s are'} genuinely due today.`
      : `Today’s scheduled workload is under control.`;

  return `<div class="operations-hub ops-v2">
    <section class="ops-command">
      <div class="ops-command-copy">
        <p class="ops-eyebrow">WINDMILL FARM · OPERATIONS</p>
        <h2>${greeting}, ${esc(firstName)}</h2>
        <p class="ops-command-summary">${mission} ${salesCount?`${salesCount} sales action${salesCount===1?'':'s'} also need attention.`:''}</p>
        <div class="ops-command-signals">
          <span class="${critical?'danger':'good'}"><i data-lucide="${critical?'triangle-alert':'shield-check'}"></i><strong>${critical}</strong> critical</span>
          <span class="${dueToday.length?'today':'good'}"><i data-lucide="calendar-check"></i><strong>${dueToday.length}</strong> due today</span>
          <span class="${overdue?'warning':'good'}"><i data-lucide="history"></i><strong>${overdue}</strong> backlog</span>
          ${commercialValue?`<span class="commercial"><i data-lucide="pound-sterling"></i><strong>£${commercialValue.toLocaleString()}</strong> attached value</span>`:''}
        </div>
      </div>
      <div class="ops-command-actions">
        <button onclick="OperationsHub.startMyDay()" class="ops-start-day"><span><small>FOCUS MODE</small><strong>Start My Day</strong></span><i data-lucide="arrow-right"></i></button>
        <div>
          ${OperationsHub.canUsePlanner()?`<button onclick="OperationsHub.openPlanner()"><i data-lucide="calendar-range"></i>Plan week</button>`:''}
          ${OperationsHub.canCreateTask()?`<button onclick="OperationsHub.openTask()"><i data-lucide="plus"></i>Add task</button>`:''}
        </div>
      </div>
    </section>

    ${overdue>=10?`<section class="ops-backlog-banner">
      <div><span><i data-lucide="archive-restore"></i></span><div><p>BACKLOG RECOVERY</p><strong>${overdue} historical actions need review — they are not all treated as today’s workload.</strong><small>Work through overdue items separately so the live daily queue stays meaningful.</small></div></div>
      <button onclick="OperationsHub.reviewBacklog()">Review backlog <i data-lucide="arrow-right"></i></button>
    </section>`:''}

    <section class="ops-score-strip">
      <article><span class="olive"><i data-lucide="calendar-check"></i></span><div><small>DUE TODAY</small><strong>${dueToday.length}</strong><p>${completedToday} completed today</p></div></article>
      <article><span class="${critical?'red':'green'}"><i data-lucide="alert-triangle"></i></span><div><small>CRITICAL</small><strong>${critical}</strong><p>${critical?'Needs immediate ownership':'No blockers open'}</p></div></article>
      <article><span class="green"><i data-lucide="check-circle-2"></i></span><div><small>DAILY PROGRESS</small><strong>${progress}%</strong><p>${completedToday}/${todayTotal} scheduled actions</p></div></article>
      <article><span class="gold"><i data-lucide="pound-sterling"></i></span><div><small>COMMERCIAL VALUE</small><strong>£${commercialValue.toLocaleString()}</strong><p>Attached to due/backlog work</p></div></article>
      <article><span class="blue"><i data-lucide="calendar-range"></i></span><div><small>WEEKLY CONTROL</small><strong>${weeklyDone}/${weeklyManual.length}</strong><p>Manager tasks complete</p></div></article>
    </section>

    ${OperationsHub.previewUser?`<section class="ops-preview-banner"><div><i data-lucide="eye"></i><span>Previewing as <strong>${esc(OperationsHub.previewUser)}</strong></span></div><button onclick="OperationsHub.setPreviewUser('')">Return to my account</button></section>`:''}

    <section class="ops-main-grid">
      <main class="ops-work-panel">
        <div class="ops-panel-heading">
          <div><p class="ops-eyebrow olive">PRIORITY WORKSPACE</p><h3>What needs doing next</h3><p>One ranked operational queue. Expand a row only when you need its detail.</p></div>
          <div class="ops-panel-tools">
            <span>${filtered.length} item${filtered.length===1?'':'s'}</span>
            ${OperationsHub.canCreateTask()?`<button onclick="OperationsHub.openTask()" class="ops-add-task"><i data-lucide="plus"></i>Add Task</button>`:''}
          </div>
        </div>
        <div class="ops-controls">
          <div class="ops-segment">${[['mine','My Work'],['team','Other Team'],['all','All Work']].map(([value,label])=>`<button onclick="OperationsHub.setScope('${value}')" class="${OperationsHub.scope===value?'active':''}">${label}</button>`).join('')}</div>
          <div class="ops-segment">${[['open','Open'],['today','Today'],['backlog','Backlog'],['completed','Completed']].map(([value,label])=>`<button onclick="OperationsHub.setStatusFilter('${value}')" class="${OperationsHub.statusFilter===value?'active':''}">${label}</button>`).join('')}</div>
          <select onchange="OperationsHub.setDepartment(this.value)" class="ops-department-select"><option value="">All Departments</option>${['Reception','Sales','Functions','Kitchen','Hotel','Christmas','Management','General'].map(value=>`<option value="${value}" ${OperationsHub.departmentFilter===value?'selected':''}>${value}</option>`).join('')}</select>
          ${OperationsHub.isManagerProfile()?`<label class="ops-view-as"><span>Preview as</span><select onchange="OperationsHub.setPreviewUser(this.value)"><option value="">My real account</option>${OperationsHub.previewOptions().map(value=>`<option value="${esc(value)}" ${OperationsHub.previewUser===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label>`:''}
        </div>
        <div class="ops-queue-head"><span>Action</span><span>Signals</span></div>
        <div class="ops-task-list">${filtered.length?filtered.slice(0,40).map(OperationsHub.taskCard).join(''):`<div class="ops-empty"><i data-lucide="badge-check"></i><strong>No work matches this view</strong><p>Change the filters or assign a new manager task.</p></div>`}</div>
      </main>

      <aside class="ops-side-column">
        <section class="ops-side-card ops-focus-card">
          <div class="ops-card-title"><div><p class="ops-eyebrow olive">MANAGER FOCUS</p><h3>${priorityItems.length?'Control these first':'No urgent blockers'}</h3></div><span class="${priorityItems.length?'risk':'good'}">${priorityItems.length}</span></div>
          <div class="ops-focus-list">${priorityItems.length?priorityItems.map((item,i)=>`<button onclick="${item.action}"><b>${i+1}</b><span><strong>${esc(item.title)}</strong><small>${esc(item.department)} · ${esc(item.owner||'Unassigned')}</small></span><i data-lucide="arrow-up-right"></i></button>`).join(''):'<div class="ops-small-empty">Nothing is currently marked Critical, Urgent or High in today’s queue.</div>'}</div>
        </section>

        <section class="ops-side-card">
          <div class="ops-card-title"><div><p class="ops-eyebrow olive">TODAY</p><h3>Venue timeline</h3></div><i data-lucide="clock-3"></i></div>
          <div class="ops-timeline">${timeline.length?timeline.slice(0,7).map(item=>`<button onclick="${item.action}"><time>${esc(item.time)}</time><span><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></span><i data-lucide="${item.icon}"></i></button>`).join(''):'<div class="ops-small-empty">No meetings or functions are listed today.</div>'}</div>
        </section>

        <section class="ops-side-card">
          <div class="ops-card-title"><div><p class="ops-eyebrow olive">DEPARTMENT HEALTH</p><h3>Where management attention sits</h3></div></div>
          <div class="ops-department-list">${departments.map(item=>`<button onclick="OperationsHub.setDepartment('${item.department}')"><span><strong>${item.department}</strong><small>${item.open} open · ${item.overdue} backlog</small></span><em class="${item.score>=80?'good':item.score>=55?'watch':'risk'}">${item.score}%</em></button>`).join('')}</div>
        </section>

        <section class="ops-side-card">
          <div class="ops-card-title"><div><p class="ops-eyebrow olive">WEEKLY CONTROL</p><h3>Manager commitments</h3></div>${OperationsHub.canCreateTask()?`<button onclick="OperationsHub.openTask()">Add</button>`:''}</div>
          <div class="ops-weekly-list">${weeklyManual.length?weeklyManual.slice(0,5).map(task=>`<button onclick="OperationsHub.openTask('${task.id}')"><i data-lucide="${OperationsHub.statusDone(task.status)?'check-circle-2':'circle'}"></i><span><strong>${esc(task.title)}</strong><small>${esc(task.owner)} · ${task.dueDate}</small></span></button>`).join(''):'<div class="ops-small-empty">Add this week’s standards, audits and improvement jobs.</div>'}</div>
        </section>
      </aside>
    </section>
  </div>`;
}

(function injectOperationsHubStyles(){
  if(document.getElementById('operations-hub-styles')) return;
  const style=document.createElement('style');
  style.id='operations-hub-styles';
  style.textContent=`
  .operations-hub{display:flex;flex-direction:column;gap:14px;padding-bottom:20px}
  .ops-mission-hero{display:flex;justify-content:space-between;gap:28px;position:relative;overflow:hidden;padding:23px 25px;border-radius:22px;background:radial-gradient(circle at 90% 10%,rgba(212,168,67,.28),transparent 19rem),linear-gradient(135deg,#26352e,#405837 58%,#637b43);color:#fff;box-shadow:0 16px 34px rgba(29,45,34,.18)}
  .ops-mission-hero:after{content:"";position:absolute;right:-65px;bottom:-110px;width:260px;height:260px;border:42px solid rgba(255,255,255,.05);border-radius:50%}
  .ops-mission-copy{position:relative;z-index:1;min-width:0;max-width:880px}.ops-eyebrow{font-size:0.77rem;font-weight:900;letter-spacing:.17em;color:#f4d27d}.ops-eyebrow.olive{color:#647f42}.ops-mission-copy h2{font-size:1.9rem;font-weight:850;letter-spacing:-.04em;margin-top:4px}.ops-mission-label{font-size:0.81rem;font-weight:900;letter-spacing:.18em;color:#dce9c8;margin-top:15px}.ops-mission-text{font-size:.9rem;color:rgba(255,255,255,.82);margin-top:5px;line-height:1.5}
  .ops-priority-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.ops-priority-pills button{display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(255,255,255,.15);border-radius:999px;background:rgba(255,255,255,.09);font-size:0.77rem}.ops-priority-pills button strong{width:19px;height:19px;border-radius:50%;display:grid;place-items:center;background:#d4a843;color:#1f2d27}
  .ops-mission-actions{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:start;min-width:315px}.ops-mission-actions button{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 13px;border-radius:11px;font-size:0.84rem;font-weight:800}.ops-mission-actions svg{width:16px;height:16px}.ops-main-action{grid-column:1/-1;background:#fff;color:#435b34;box-shadow:0 8px 18px rgba(0,0,0,.13)}.ops-secondary-action{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:#fff}
  .ops-kpi-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.ops-kpi{display:flex;gap:11px;align-items:flex-start;padding:14px;border:1px solid #e4e9df;border-radius:16px;background:#fff;box-shadow:0 5px 16px rgba(35,50,38,.045)}.ops-kpi>span{width:39px;height:39px;display:grid;place-items:center;border-radius:12px;background:#e9f0dd;color:#5d773d;flex-shrink:0}.ops-kpi svg{width:18px;height:18px}.ops-kpi p{font-size:0.77rem;color:#657064;font-weight:700}.ops-kpi strong{display:block;font-size:1.28rem;line-height:1.1;margin-top:4px}.ops-kpi small{display:block;color:#90978e;font-size:0.61rem;margin-top:5px}
  
  .ops-view-as{display:flex;align-items:center;gap:7px;margin-left:auto;padding:4px 5px 4px 9px;border:1px solid #dfe5d7;border-radius:10px;background:#f7f9f4}.ops-view-as span{font-size:0.6rem;font-weight:850;color:#687362;white-space:nowrap}.ops-view-as select{padding:5px 7px;border:0;background:#fff;border-radius:7px;font-size:0.72rem;color:#45543f;outline:none}
  .ops-preview-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 13px;border:1px solid #e2c66e;border-radius:12px;background:#fff7d8;color:#74591b;font-size:0.77rem}.ops-preview-banner>div{display:flex;align-items:center;gap:7px}.ops-preview-banner svg{width:15px;height:15px}.ops-preview-banner button{padding:6px 9px;border-radius:8px;background:#fff;color:#74591b;font-weight:800}

  .ops-main-grid{display:grid;grid-template-columns:minmax(0,1fr) 335px;gap:14px;min-height:620px}.ops-work-panel,.ops-side-card{border:1px solid #e4e9df;border-radius:18px;background:#fff;box-shadow:0 6px 20px rgba(35,50,38,.05)}.ops-work-panel{display:flex;flex-direction:column;padding:17px;min-width:0}.ops-panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.ops-panel-heading h3{font-size:1.12rem;font-weight:850}.ops-panel-heading p:last-child{font-size:0.77rem;color:#7d867b;margin-top:3px}.ops-add-task{display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:10px;background:#5f7d34;color:#fff;font-size:0.79rem;font-weight:800}.ops-add-task svg{width:15px;height:15px}
  .ops-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0 10px}.ops-segment{display:flex;padding:3px;border-radius:10px;background:#f2f5ed}.ops-segment button{padding:6px 10px;border-radius:8px;color:#697365;font-size:0.72rem;font-weight:800}.ops-segment button.active{background:#fff;color:#4d6932;box-shadow:0 2px 7px rgba(38,55,40,.08)}.ops-department-select{margin-left:auto;padding:7px 9px;border:1px solid #dfe5d7;border-radius:9px;background:#fafbf8;font-size:0.75rem}
  .ops-task-list{display:flex;flex-direction:column;gap:8px;max-height:680px;overflow-y:auto;padding-right:3px}.ops-task-card{display:flex;align-items:flex-start;gap:11px;padding:13px;border:1px solid #e7ebe2;border-radius:14px;background:#fff;transition:.16s}.ops-task-card:hover{border-color:#cbd8bc;box-shadow:0 8px 18px rgba(35,50,38,.06)}.ops-task-overdue{border-left:4px solid #d85454;background:linear-gradient(90deg,#fff8f8,#fff 18%)}.ops-task-complete{opacity:.63}.ops-task-check{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;color:#9ba399;background:#f4f6f1;flex-shrink:0}.ops-task-check.complete{background:#5f7d34;color:#fff}.ops-task-check.locked{opacity:.35;cursor:not-allowed}.ops-source-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:999px;background:#eef3e7;color:#5e763f;font-size:0.6rem;font-weight:800}.ops-task-card h4{font-size:0.88rem}.ops-task-card .text-\[11px\] span{display:flex;align-items:center;gap:4px}.ops-task-card .text-\[11px\] svg{width:12px;height:12px}.ops-checklist-item{display:flex;gap:6px;align-items:flex-start;text-align:left;padding:5px 7px;border-radius:7px;background:#f7f8f5;color:#626d60;font-size:0.65rem}.ops-checklist-item svg{width:13px;height:13px;flex-shrink:0}.ops-checklist-item.done{text-decoration:line-through;color:#8b9388}
  .ops-side-column{display:flex;flex-direction:column;gap:11px}.ops-side-card{padding:14px}.ops-card-title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.ops-card-title h3{font-size:.87rem;font-weight:850;margin-top:2px}.ops-card-title>strong{font-size:1.25rem;color:#5f7d34}.ops-card-title>button{font-size:0.7rem;color:#5f7d34;font-weight:800}.ops-progress-track{height:9px;border-radius:999px;background:#edf1e8;overflow:hidden;margin-top:13px}.ops-progress-track i{display:block;height:100%;background:linear-gradient(90deg,#5f7d34,#8da662);border-radius:999px}.ops-progress-stats{display:flex;justify-content:space-between;margin-top:9px;color:#737c71;font-size:0.67rem}.ops-progress-stats strong{color:#283128}
  .ops-timeline,.ops-department-list,.ops-weekly-list{display:flex;flex-direction:column;margin-top:9px}.ops-timeline button{display:grid;grid-template-columns:49px minmax(0,1fr) 18px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #edf0ea;text-align:left}.ops-timeline time{font-size:0.66rem;font-weight:850;color:#5f7d34}.ops-timeline span{min-width:0}.ops-timeline strong,.ops-weekly-list strong{display:block;font-size:0.73rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ops-timeline small,.ops-weekly-list small{display:block;color:#8b9389;font-size:0.6rem;margin-top:1px}.ops-timeline>button>svg{width:14px;height:14px;color:#8da078}
  .ops-department-list button{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #edf0ea;text-align:left}.ops-department-list strong{font-size:0.75rem}.ops-department-list small{display:block;font-size:0.6rem;color:#8b9389;margin-top:1px}.ops-department-list em{font-style:normal;padding:4px 7px;border-radius:999px;font-size:0.6rem;font-weight:850}.ops-department-list em.good{background:#e5f2dc;color:#4e7938}.ops-department-list em.watch{background:#fff2d8;color:#9a6e18}.ops-department-list em.risk{background:#fae5e5;color:#ad4242}
  .ops-weekly-list button{display:grid;grid-template-columns:17px minmax(0,1fr);gap:7px;align-items:center;padding:7px 0;border-bottom:1px solid #edf0ea;text-align:left}.ops-weekly-list svg{width:14px;height:14px;color:#5f7d34}.ops-small-empty,.ops-empty{text-align:center;color:#929a90}.ops-small-empty{font-size:0.67rem;padding:18px 4px}.ops-empty{display:grid;place-items:center;min-height:260px}.ops-empty svg{width:34px;height:34px;color:#8ca078}.ops-empty strong{font-size:.85rem}.ops-empty p{font-size:0.7rem}
  
  .ops-planner-shell{display:flex;flex-direction:column;gap:14px;padding-bottom:20px}
  .ops-planner-hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 24px;border-radius:21px;background:linear-gradient(135deg,#27382f,#4f6940);color:#fff;box-shadow:0 14px 30px rgba(29,45,34,.16)}
  .ops-planner-hero h2{font-size:1.7rem;font-weight:850;letter-spacing:-.035em;margin-top:4px}.ops-planner-hero p:last-child{font-size:0.9rem;color:rgba(255,255,255,.75);margin-top:5px}
  .ops-planner-actions{display:flex;gap:8px;flex-wrap:wrap}.ops-planner-actions button{display:flex;align-items:center;gap:6px;padding:10px 13px;border-radius:10px;font-size:0.79rem;font-weight:800}.ops-planner-actions svg{width:15px;height:15px}.ops-planner-actions .primary{background:#fff;color:#4f6938}.ops-planner-actions .secondary{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18)}
  .ops-planner-toolbar{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid #e4e9df;border-radius:15px;background:#fff}.ops-planner-toolbar>button:first-child,.ops-planner-toolbar>button:nth-child(3){width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#f1f4ed;color:#5f7d34}.ops-planner-toolbar svg{width:16px;height:16px}.ops-planner-toolbar>div p{font-size:0.6rem;font-weight:900;letter-spacing:.15em;color:#7f887c}.ops-planner-toolbar>div strong{display:block;font-size:0.9rem;margin-top:2px}.ops-planner-summary{margin-left:auto;font-size:0.67rem;color:#788176}.ops-planner-toolbar .text-btn{padding:8px 10px;border-radius:9px;background:#f4f6f1;color:#5c6b55;font-size:0.7rem;font-weight:800}.ops-planner-toolbar .publish-btn{padding:9px 12px;border-radius:9px;background:#5f7d34;color:#fff;font-size:0.72rem;font-weight:850}
  .ops-planner-grid{display:grid;grid-template-columns:repeat(7,minmax(165px,1fr));gap:9px;overflow-x:auto}.ops-day-column{min-height:410px;border:1px solid #e4e9df;border-radius:15px;background:#fff;overflow:hidden}.ops-day-header{display:flex;align-items:center;justify-content:space-between;padding:12px;background:#f3f6ee;border-bottom:1px solid #e5e9df}.ops-day-header p{font-size:0.63rem;font-weight:900;color:#5f7d34}.ops-day-header strong{display:block;font-size:0.84rem;margin-top:2px}.ops-day-header button{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#fff;color:#5f7d34}.ops-day-header svg{width:14px;height:14px}.ops-day-tasks{display:flex;flex-direction:column;gap:7px;padding:9px}.ops-planner-task{position:relative;display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:10px;border:1px solid #e8ece4;border-radius:11px;background:#fff}.ops-planner-task:hover{border-color:#cbd8bc;box-shadow:0 6px 14px rgba(35,50,38,.06)}.ops-planner-task.done{opacity:.55;text-decoration:line-through}.ops-planner-task .priority{position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:11px 0 0 11px;background:#d4a843}.ops-planner-task .priority.critical{background:#d85454}.ops-planner-task .priority.high{background:#e58b45}.ops-planner-task .priority.low{background:#9aa49a}.ops-planner-task strong{font-size:0.71rem;padding-left:3px}.ops-planner-task small{font-size:0.6rem;color:#8c9489;margin-top:3px;padding-left:3px}.ops-planner-task em{font-style:normal;margin-top:7px;padding:3px 6px;border-radius:999px;background:#eef3e7;color:#607846;font-size:0.6rem;font-weight:800}.ops-day-empty{padding:22px 8px;text-align:center;color:#9ca39a;font-size:0.61rem}
  .ops-planner-bottom{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ops-planner-card{padding:15px;border:1px solid #e4e9df;border-radius:16px;background:#fff;box-shadow:0 5px 16px rgba(35,50,38,.045)}.ops-workload-list,.ops-template-list{display:flex;flex-direction:column;margin-top:10px}.ops-workload-list>div,.ops-template-list button{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #edf0ea;text-align:left}.ops-workload-list strong,.ops-template-list strong{display:block;font-size:0.75rem}.ops-workload-list small,.ops-template-list small{display:block;font-size:0.6rem;color:#8b9389;margin-top:1px}.ops-workload-list em{font-style:normal;font-size:0.7rem;font-weight:800;color:#5f7d34}.ops-template-list em{font-style:normal;padding:4px 7px;border-radius:999px;background:#e6f0dc;color:#52723a;font-size:0.6rem;font-weight:800}.ops-template-list em.paused{background:#f1f1ef;color:#7a8178}


  /* £50k UI Phase 2 — Operations Command Centre */
  .ops-v2{gap:12px}
  .ops-command{display:flex;justify-content:space-between;align-items:stretch;gap:28px;padding:23px 25px;border-radius:20px;background:linear-gradient(125deg,#17211d 0%,#293a2d 54%,#526a3c 100%);color:#fff;box-shadow:0 14px 34px rgba(20,29,24,.15);position:relative;overflow:hidden}
  .ops-command:after{content:"";position:absolute;inset:auto -90px -180px auto;width:360px;height:360px;border:1px solid rgba(255,255,255,.09);border-radius:50%;box-shadow:0 0 0 55px rgba(255,255,255,.025),0 0 0 110px rgba(255,255,255,.018)}
  .ops-command-copy{position:relative;z-index:1;min-width:0}.ops-command h2{font-size:1.8rem;font-weight:800;letter-spacing:-.045em;margin-top:3px}.ops-command-summary{font-size:.82rem;color:rgba(255,255,255,.72);margin-top:5px;max-width:720px}
  .ops-command-signals{display:flex;gap:7px;flex-wrap:wrap;margin-top:17px}.ops-command-signals>span{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.07);padding:6px 9px;border-radius:8px;font-size:.66rem;color:rgba(255,255,255,.76)}.ops-command-signals svg{width:13px;height:13px}.ops-command-signals strong{color:#fff}.ops-command-signals .danger{background:rgba(180,71,71,.2);border-color:rgba(242,170,170,.18)}.ops-command-signals .warning{background:rgba(197,162,83,.15)}.ops-command-signals .commercial{color:#f1d994}.ops-command-signals .commercial strong{color:#f5df9e}
  .ops-command-actions{position:relative;z-index:1;width:245px;display:flex;flex-direction:column;justify-content:center;gap:7px;flex-shrink:0}.ops-start-day{display:flex;align-items:center;justify-content:space-between;text-align:left;background:#fff;color:#243022;border-radius:11px;padding:11px 12px;box-shadow:0 7px 18px rgba(0,0,0,.13)}.ops-start-day small{display:block;font-size:.51rem;letter-spacing:.14em;color:#7c8b74}.ops-start-day strong{display:block;font-size:.83rem;margin-top:1px}.ops-start-day svg{width:17px}.ops-command-actions>div{display:grid;grid-template-columns:1fr 1fr;gap:6px}.ops-command-actions>div button{display:flex;justify-content:center;align-items:center;gap:5px;padding:7px 8px;border:1px solid rgba(255,255,255,.13);border-radius:8px;background:rgba(255,255,255,.07);font-size:.63rem;font-weight:700;color:#fff}.ops-command-actions>div svg{width:13px;height:13px}
  .ops-backlog-banner{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:10px 13px;border:1px solid #ead9af;background:#fffbef;border-radius:12px}.ops-backlog-banner>div{display:flex;align-items:center;gap:10px}.ops-backlog-banner>div>span{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:#f6e9c8;color:#936e22}.ops-backlog-banner svg{width:15px;height:15px}.ops-backlog-banner p{font-size:.52rem;font-weight:900;letter-spacing:.13em;color:#a07727}.ops-backlog-banner strong{display:block;font-size:.72rem;margin-top:1px}.ops-backlog-banner small{display:block;font-size:.61rem;color:#8b826d;margin-top:1px}.ops-backlog-banner>button{display:flex;align-items:center;gap:6px;white-space:nowrap;padding:7px 9px;border-radius:8px;background:#fff;border:1px solid #e5d5ae;color:#76591d;font-size:.63rem;font-weight:800}
  .ops-score-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid var(--wf-line,#e5e7e2);border-radius:15px;background:#fff;overflow:hidden;box-shadow:0 2px 8px rgba(18,24,39,.025)}.ops-score-strip article{display:flex;gap:10px;align-items:center;padding:12px 13px;border-right:1px solid #eceeea}.ops-score-strip article:last-child{border-right:0}.ops-score-strip article>span{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:#f1f4ef;color:#617255;flex-shrink:0}.ops-score-strip article>span.red{background:#fcecec;color:#b44747}.ops-score-strip article>span.green{background:#eaf6ef;color:#287a52}.ops-score-strip article>span.gold{background:#f8f0dc;color:#a07828}.ops-score-strip article>span.blue{background:#eaf1f8;color:#426d9c}.ops-score-strip svg{width:15px;height:15px}.ops-score-strip small{display:block;font-size:.5rem;font-weight:900;letter-spacing:.11em;color:#8b928b}.ops-score-strip strong{display:block;font-size:1.05rem;line-height:1.1;margin-top:2px}.ops-score-strip p{font-size:.55rem;color:#949b94;margin-top:2px}
  .ops-main-grid{grid-template-columns:minmax(0,1fr) 300px;gap:12px}.ops-work-panel,.ops-side-card{border-color:var(--wf-line,#e5e7e2);box-shadow:0 2px 9px rgba(18,24,39,.03)}.ops-work-panel{padding:15px}.ops-panel-heading h3{font-size:1.02rem}.ops-panel-heading p:last-child{font-size:.69rem}.ops-panel-tools{display:flex;align-items:center;gap:8px}.ops-panel-tools>span{font-size:.6rem;color:#8a928a}.ops-add-task{padding:7px 9px;font-size:.67rem;border-radius:8px}
  .ops-controls{padding:10px 0 9px;border-bottom:1px solid #edf0eb}.ops-segment{padding:2px;border-radius:8px}.ops-segment button{padding:5px 8px;border-radius:6px;font-size:.63rem}.ops-department-select{padding:6px 8px;font-size:.65rem}.ops-view-as{padding:3px 4px 3px 7px}.ops-view-as span{font-size:.52rem}.ops-view-as select{font-size:.62rem;padding:4px 6px}
  .ops-queue-head{display:grid;grid-template-columns:minmax(0,1fr) 225px;padding:7px 76px 5px 43px;font-size:.49rem;font-weight:900;letter-spacing:.12em;color:#9aa19a;text-transform:uppercase}.ops-queue-head span:last-child{text-align:right}
  .ops-task-list{gap:0;max-height:670px;border-top:1px solid #edf0eb;padding-right:0}.ops-task-row{display:grid;grid-template-columns:27px minmax(0,1fr) 225px 25px 25px;column-gap:8px;align-items:center;position:relative;padding:9px 5px;border-bottom:1px solid #edf0eb;background:#fff;transition:.12s}.ops-task-row:hover{background:#fafbf9}.ops-task-row.overdue{box-shadow:inset 2px 0 #c77855}.ops-task-row.complete{opacity:.58}.ops-row-check{width:24px;height:24px;display:grid;place-items:center;border-radius:50%;color:#a2aaa2;background:#f3f5f1}.ops-row-check svg{width:14px;height:14px}.ops-row-check.complete{background:#287a52;color:#fff}.ops-row-check.locked{opacity:.35}.ops-row-main{text-align:left;min-width:0}.ops-row-title{display:block;font-size:.74rem;font-weight:750;color:#202720;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ops-row-meta{display:flex;align-items:center;gap:0;margin-top:2px;color:#8b938b;font-size:.54rem;white-space:nowrap;overflow:hidden}.ops-row-meta>*{font-style:normal}.ops-row-meta>*+*:before{content:"·";padding:0 5px;color:#c1c6c1}.ops-row-meta em{color:#647b57;font-weight:700}.ops-row-signals{display:flex;align-items:center;justify-content:flex-end;gap:5px;white-space:nowrap}.ops-row-signals>strong{font-size:.62rem;color:#7d682d}.ops-row-priority,.ops-row-state{padding:3px 6px;border-radius:999px;font-size:.49rem;font-weight:850}.ops-row-priority.normal{background:#f3f4f2;color:#707970}.ops-row-priority.quiet{background:#f5f5f5;color:#8a908a}.ops-row-priority.warning{background:#fff4dc;color:#a46816}.ops-row-priority.danger{background:#fcecec;color:#b44747}.ops-row-state{background:#f3f4f2;color:#777f77}.ops-row-state.today{background:#edf2e9;color:#586d46}.ops-row-state.overdue{background:#fff0e9;color:#a85b3a}.ops-row-expand,.ops-row-edit{width:24px;height:24px;display:grid;place-items:center;border-radius:6px;color:#9aa19a}.ops-row-expand:hover,.ops-row-edit:hover{background:#eef2eb;color:#586d46}.ops-row-expand svg,.ops-row-edit svg{width:13px;height:13px}.ops-row-expand.open svg{transform:rotate(180deg)}.ops-row-expand-spacer,.ops-row-edit-spacer{width:24px}.ops-row-details{display:none;grid-column:2/-1;padding:8px 0 4px;font-size:.62rem;color:#6f776f}.ops-row-details.open{display:block}.ops-row-details>p{max-width:780px}.ops-row-checklist-head{display:flex;justify-content:space-between;margin-top:8px;max-width:780px;font-size:.55rem}.ops-row-checklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;max-width:780px;margin-top:4px}.ops-row-checklist button{display:flex;align-items:center;gap:5px;text-align:left;padding:5px 6px;border-radius:6px;background:#f6f7f5}.ops-row-checklist button.done{text-decoration:line-through;color:#9aa19a}.ops-row-checklist svg{width:12px;height:12px;flex-shrink:0}
  .ops-side-column{gap:9px}.ops-side-card{padding:12px;border-radius:14px}.ops-card-title h3{font-size:.78rem}.ops-card-title>span{min-width:26px;height:26px;display:grid;place-items:center;border-radius:8px;font-size:.63rem;font-weight:850}.ops-card-title>span.risk{background:#fcecec;color:#b44747}.ops-card-title>span.good{background:#eaf6ef;color:#287a52}.ops-focus-list{display:flex;flex-direction:column;margin-top:7px}.ops-focus-list button{display:grid;grid-template-columns:20px minmax(0,1fr) 14px;gap:7px;align-items:center;padding:8px 0;border-bottom:1px solid #edf0ea;text-align:left}.ops-focus-list b{width:20px;height:20px;display:grid;place-items:center;border-radius:6px;background:#f1eee4;color:#92732f;font-size:.55rem}.ops-focus-list strong{display:block;font-size:.67rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ops-focus-list small{display:block;font-size:.53rem;color:#929992;margin-top:1px}.ops-focus-list svg{width:12px;color:#8a9389}
  @media(max-width:1300px){.ops-score-strip{grid-template-columns:repeat(3,1fr)}.ops-score-strip article{border-bottom:1px solid #eceeea}.ops-main-grid{grid-template-columns:1fr}.ops-side-column{display:grid;grid-template-columns:repeat(2,1fr)}}@media(max-width:850px){.ops-command{flex-direction:column}.ops-command-actions{width:100%}.ops-score-strip{grid-template-columns:repeat(2,1fr)}.ops-backlog-banner{align-items:flex-start;flex-direction:column}.ops-side-column{grid-template-columns:1fr}.ops-queue-head{display:none}.ops-task-row{grid-template-columns:27px minmax(0,1fr) 25px 25px}.ops-row-signals{grid-column:2/3;justify-content:flex-start;margin-top:5px}.ops-row-details{grid-column:2/-1}.ops-row-meta{flex-wrap:wrap;white-space:normal}}

  @media(max-width:1300px){.ops-kpi-grid{grid-template-columns:repeat(3,1fr)}.ops-main-grid{grid-template-columns:1fr}.ops-side-column{display:grid;grid-template-columns:repeat(2,1fr)}}@media(max-width:800px){.ops-mission-hero{flex-direction:column}.ops-mission-actions{min-width:0;width:100%}.ops-kpi-grid{grid-template-columns:repeat(2,1fr)}.ops-side-column{grid-template-columns:1fr}.ops-controls{align-items:stretch}.ops-department-select{margin-left:0}.ops-panel-heading{flex-direction:column}}`;
  document.head.appendChild(style);
})();
