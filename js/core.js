// ===== SEED =====
function seedData(){
DB={enquiries:[],weddings:[],functions:[],meetings:[],tasks:[],payments:[],marketing:[],events:[]};
return;
DB.enquiries=[
{id:'eq1',name:'Sophie & James Taylor',eventType:'Wedding',email:'sophie.taylor@email.com',phone:'07891 234567',enquiryDate:'2026-07-10',preferredDate:'2027-06-15',altDates:'2027-06-22, 2027-07-06',guests:120,budget:18000,source:'Instagram',package:'Gold',food:'Vegetarian options needed',accommodation:'15 rooms',staff:'Emma',lastContact:'2026-07-18',nextFollowup:'2026-07-23',notes:'Very keen, visited another venue last week',value:18000,status:'Viewing Completed',priority:'Hot',probability:75,comms:[{date:'2026-07-10',note:'Initial enquiry via Instagram'},{date:'2026-07-12',note:'Brochure sent via email'},{date:'2026-07-15',note:'Viewing booked for 18th'},{date:'2026-07-18',note:'Viewing completed - loved the barn'}]},
{id:'eq2',name:'Rachel & Tom Bennett',eventType:'Wedding',email:'rachel.b@email.com',phone:'07900 111222',enquiryDate:'2026-07-05',preferredDate:'2027-09-20',altDates:'',guests:80,budget:14000,source:'Wedding Fayre',package:'Silver',food:'None',accommodation:'8 rooms',staff:'Sarah',lastContact:'2026-07-20',nextFollowup:'2026-07-25',notes:'Waiting on quote response',value:14000,status:'Quote Sent',priority:'Warm',probability:50,comms:[{date:'2026-07-05',note:'Met at summer wedding fayre'},{date:'2026-07-08',note:'Viewing completed'},{date:'2026-07-20',note:'Detailed quote emailed'}]},
{id:'eq3',name:'David & Claire Morris',eventType:'Wedding',email:'d.morris@work.com',phone:'07700 333444',enquiryDate:'2026-06-28',preferredDate:'2027-05-10',altDates:'2027-05-17',guests:150,budget:22000,source:'Google',package:'Platinum',food:'Halal options',accommodation:'20 rooms',staff:'Emma',lastContact:'2026-07-15',nextFollowup:'2026-07-22',notes:'Deposit due - sent reminder',value:22000,status:'Deposit Required',priority:'Hot',probability:80,comms:[{date:'2026-06-28',note:'Website enquiry'},{date:'2026-07-01',note:'Called and booked viewing'},{date:'2026-07-05',note:'Viewing done - provisional booked'},{date:'2026-07-15',note:'Deposit reminder sent'}]},
{id:'eq4',name:'Mark Johnson',eventType:'Birthday Party',email:'mark.j@email.com',phone:'07555 666777',enquiryDate:'2026-07-18',preferredDate:'2026-09-12',altDates:'',guests:60,budget:3000,source:'Referral',package:'Function Room',food:'Buffet',accommodation:'None',staff:'Sarah',lastContact:'2026-07-18',nextFollowup:'2026-07-24',notes:'50th birthday, wants DJ and buffet',value:3000,status:'New Enquiry',priority:'Warm',probability:40,comms:[{date:'2026-07-18',note:'Phone call - referred by previous client'}]},
{id:'eq5',name:'Amanda & Pete Wilson',eventType:'Wedding',email:'amanda.w@email.com',phone:'07888 999000',enquiryDate:'2026-07-20',preferredDate:'2028-03-21',altDates:'2028-04-04',guests:100,budget:16000,source:'Facebook',package:'Gold',food:'Vegan options',accommodation:'12 rooms',staff:'Emma',lastContact:'2026-07-20',nextFollowup:'2026-07-27',notes:'Early planning stage',value:16000,status:'Brochure Sent',priority:'Cold',probability:25,comms:[{date:'2026-07-20',note:'Facebook message enquiry'},{date:'2026-07-20',note:'Brochure and pricing sent'}]},
{id:'eq6',name:'Corporate Solutions Ltd',eventType:'Conference',email:'events@corpsol.com',phone:'0161 234 5678',enquiryDate:'2026-07-15',preferredDate:'2026-10-05',altDates:'2026-10-12',guests:40,budget:5000,source:'Google',package:'Conference',food:'Working lunch',accommodation:'10 rooms',staff:'Sarah',lastContact:'2026-07-19',nextFollowup:'2026-07-22',notes:'Need projector, flip charts, breakout rooms',value:5000,status:'Viewing Booked',priority:'Warm',probability:55,comms:[{date:'2026-07-15',note:'Email enquiry for conference'},{date:'2026-07-19',note:'Viewing booked for 24th'}]},
{id:'eq7',name:'Lisa Green',eventType:'Christening',email:'lisa.g@email.com',phone:'07444 555666',enquiryDate:'2026-07-01',preferredDate:'2026-08-30',altDates:'',guests:35,budget:1500,source:'Referral',package:'Small Function',food:'Afternoon tea',accommodation:'None',staff:'Sarah',lastContact:'2026-07-10',nextFollowup:'2026-07-20',notes:'Confirmed - deposit paid',value:1500,status:'Confirmed Booking',priority:'Hot',probability:100,comms:[{date:'2026-07-01',note:'Referred by sister'},{date:'2026-07-05',note:'Viewing and booking confirmed'},{date:'2026-07-10',note:'£300 deposit received'}]},
{id:'eq8',name:'Paul & Kate Adams',eventType:'Wedding',email:'kate.adams@email.com',phone:'07333 222111',enquiryDate:'2026-06-15',preferredDate:'2027-08-14',altDates:'',guests:90,budget:15000,source:'Website',package:'Gold',food:'None',accommodation:'10 rooms',staff:'Emma',lastContact:'2026-07-01',nextFollowup:'2026-07-15',notes:'Gone quiet after quote - chase',value:15000,status:'Follow Up Later',priority:'Cold',probability:20,comms:[{date:'2026-06-15',note:'Website form'},{date:'2026-06-20',note:'Viewing completed'},{date:'2026-07-01',note:'Quote sent - no response yet'}]},
{id:'eq9',name:'Jane Mitchell',eventType:'Wake',email:'j.mitchell@email.com',phone:'07666 777888',enquiryDate:'2026-07-21',preferredDate:'2026-07-28',altDates:'',guests:50,budget:1200,source:'Phone',package:'Small Function',food:'Sandwiches and hot buffet',accommodation:'None',staff:'Sarah',lastContact:'2026-07-21',nextFollowup:'2026-07-23',notes:'Sensitive - bereaved family',value:1200,status:'Provisional Booking',priority:'Hot',probability:90,comms:[{date:'2026-07-21',note:'Compassionate call - provisional held'}]}
];

DB.weddings=[
{id:'w1',couple:'Sophie & James Taylor',date:'2027-06-15',ceremonyTime:'13:00',dayGuests:120,eveningGuests:180,package:'Gold',menu:'3 Course',drinks:'Premium',eveningFood:'Hog Roast',dj:'Yes',ceremony:'Civil in Barn',chairs:'Yes - Ivory & Sage',centrepieces:'Greenery runners',layout:'Round tables x12',accommodation:'15 rooms',suppliers:'Florist: Bloom & Wild, Photographer: James Chen',totalValue:18000,paid:0,balance:18000,coordinator:'Emma',notes:'Barn ceremony, outdoor drinks reception',checklist:{enquiry:true,brochure:true,viewingArranged:true,viewingDone:true,provisional:false,deposit:false,terms:false,meeting1:false,meetingMid:false,meetingFinal:false,guestNumbers:false,menuConfirmed:false,suppliers:false,finalPaid:false,functionSheet:false,finalChecks:false,delivered:false,review:false}},
{id:'w2',couple:'Rachel & Tom Bennett',date:'2027-09-20',ceremonyTime:'14:00',dayGuests:80,eveningGuests:120,package:'Silver',menu:'2 Course',drinks:'Standard',eveningFood:'Pizza Van',dj:'Yes',ceremony:'Outdoor gazebo',chairs:'No',centrepieces:'Candles',layout:'Round tables x8',accommodation:'8 rooms',suppliers:'',totalValue:14000,paid:0,balance:14000,coordinator:'Sarah',notes:'Relaxed rustic theme',checklist:{enquiry:true,brochure:true,viewingArranged:true,viewingDone:true,provisional:false,deposit:false,terms:false,meeting1:false,meetingMid:false,meetingFinal:false,guestNumbers:false,menuConfirmed:false,suppliers:false,finalPaid:false,functionSheet:false,finalChecks:false,delivered:false,review:false}},
{id:'w3',couple:'Lisa & Mark Thompson',date:'2026-09-06',ceremonyTime:'12:00',dayGuests:100,eveningGuests:150,package:'Platinum',menu:'5 Course',drinks:'Premium Plus',eveningFood:'Fish & Chips',dj:'Yes + Band',ceremony:'Church nearby + Reception',chairs:'Yes - Gold & Blush',centrepieces:'Tall floral arrangements',layout:'Round tables x10',accommodation:'20 rooms',suppliers:'Florist: Petal Perfect, Photo: Studio Nine, Band: The Highlights',totalValue:24000,paid:12300,balance:11700,coordinator:'Emma',notes:'Final meeting needed - 8 weeks out soon',checklist:{enquiry:true,brochure:true,viewingArranged:true,viewingDone:true,provisional:true,deposit:true,terms:true,meeting1:true,meetingMid:true,meetingFinal:false,guestNumbers:false,menuConfirmed:false,suppliers:true,finalPaid:false,functionSheet:false,finalChecks:false,delivered:false,review:false}}
];

DB.functions=[
{id:'f1',client:'Mark Johnson',date:'2026-09-12',start:'19:00',finish:'00:00',occasion:'50th Birthday',guests:60,room:'Main Barn',setup:'Disco layout with dance floor',equipment:'DJ booth, lighting rig',food:'Hot & cold buffet',beverage:'Bar tab £500',accommodation:'None',timetable:'19:00 Arrival, 19:30 Buffet, 20:30 Speeches, 21:00 DJ',billing:'£3000 total',notes:'Surprise party - liaise with wife Karen',status:'Provisional Booking',paymentStatus:'Deposit Due',coordinator:'Sarah'},
{id:'f2',client:'Corporate Solutions Ltd',date:'2026-10-05',start:'09:00',finish:'17:00',occasion:'Annual Conference',guests:40,room:'Conference Suite',setup:'Theatre style + 2 breakout rooms',equipment:'Projector, flip charts, microphone',food:'Arrival coffee, working lunch, afternoon tea',beverage:'Unlimited tea/coffee, water',accommodation:'10 rooms',timetable:'09:00 Registration, 09:30 Keynote, 11:00 Break, 11:15 Workshops, 13:00 Lunch, 14:00 Panels, 16:00 Close',billing:'£5000 total',notes:'Need AV tech support all day',status:'Viewing Booked',paymentStatus:'No Payment Received',coordinator:'Sarah'},
{id:'f3',client:'Lisa Green',date:'2026-08-30',start:'13:00',finish:'17:00',occasion:'Christening',guests:35,room:'Garden Room',setup:'Informal seating with play area',equipment:'High chairs x3',food:'Afternoon tea with cake',beverage:'Prosecco toast, soft drinks',accommodation:'None',timetable:'13:00 Arrive from church, 13:30 Prosecco, 14:00 Afternoon tea, 15:30 Cake cutting',billing:'£1500 total',notes:'Baby boy - blue theme, balloon arch at entrance',status:'Confirmed Booking',paymentStatus:'Deposit Paid',coordinator:'Sarah'}
];

DB.meetings=[
{id:'m1',client:'Sophie & James Taylor',date:'2026-07-18',time:'14:00',type:'Wedding Viewing',staff:'Emma',notes:'Showed barn, grounds, bridal suite. Very positive.',actions:'Send quote within 48hrs',followup:'2026-07-23',status:'Completed'},
{id:'m2',client:'Corporate Solutions Ltd',date:'2026-07-24',time:'10:00',type:'Function Planning Meeting',staff:'Sarah',notes:'',actions:'Show conference suite, discuss AV needs',followup:'2026-07-28',status:'Outstanding'},
{id:'m3',client:'Lisa & Mark Thompson',date:'2026-07-25',time:'15:00',type:'Final Meeting',staff:'Emma',notes:'',actions:'Confirm final numbers, menu, seating plan, timeline',followup:'',status:'Outstanding'},
{id:'m4',client:'Rachel & Tom Bennett',date:'2026-07-30',time:'11:00',type:'First Wedding Meeting',staff:'Sarah',notes:'',actions:'Discuss package options, view rooms, initial timeline',followup:'2026-08-05',status:'Outstanding'}
];

DB.tasks=[
{id:'t1',title:'Chase deposit - David & Claire Morris',client:'David & Claire Morris',category:'Payments',owner:'Emma',due:'2026-07-22',priority:'Urgent',status:'Overdue',notes:'£300 deposit reminder sent 15th - no response'},
{id:'t2',title:'Send quote to Sophie & James',client:'Sophie & James Taylor',category:'Weddings',owner:'Emma',due:'2026-07-23',priority:'High',status:'In Progress',notes:'Gold package quote with accommodation'},
{id:'t3',title:'Prepare function sheet - Lisa Green christening',client:'Lisa Green',category:'Functions',owner:'Sarah',due:'2026-07-25',priority:'Medium',status:'Not Started',notes:'6 weeks before event'},
{id:'t4',title:'Follow up Mark Johnson birthday',client:'Mark Johnson',category:'Functions',owner:'Sarah',due:'2026-07-24',priority:'Medium',status:'Not Started',notes:'Confirm DJ and buffet choices'},
{id:'t5',title:'Book photographer meeting - Thompson wedding',client:'Lisa & Mark Thompson',category:'Weddings',owner:'Emma',due:'2026-07-23',priority:'High',status:'In Progress',notes:'Studio Nine availability check'},
{id:'t6',title:'Update social media - venue photos',client:'',category:'Marketing',owner:'Sarah',due:'2026-07-26',priority:'Low',status:'Not Started',notes:'Post summer garden photos'},
{id:'t7',title:'Chase Paul & Kate Adams',client:'Paul & Kate Adams',category:'Weddings',owner:'Emma',due:'2026-07-22',priority:'High',status:'Overdue',notes:'No response since quote sent July 1st'},
{id:'t8',title:'Confirm hotel allocation - Thompson',client:'Lisa & Mark Thompson',category:'Weddings',owner:'Emma',due:'2026-07-25',priority:'High',status:'Not Started',notes:'Review 8 weeks before wedding'}
];

DB.payments=[
{id:'p1',client:'Lisa & Mark Thompson',event:'Wedding',date:'2026-09-06',totalValue:24000,depositReq:300,depositPaid:true,plan:'50% at 3 months, balance at final meeting',finalBalance:11700,deadline:'2026-07-25',status:'Final Balance Due',notes:'Final meeting 25th - balance due then'},
{id:'p2',client:'David & Claire Morris',event:'Wedding',date:'2027-05-10',totalValue:22000,depositReq:300,depositPaid:false,plan:'Deposit then 3 instalments',finalBalance:22000,deadline:'2026-07-22',status:'Deposit Due',notes:'Overdue - chasing'},
{id:'p3',client:'Lisa Green',event:'Christening',date:'2026-08-30',totalValue:1500,depositReq:300,depositPaid:true,plan:'Balance 2 weeks before',finalBalance:1200,deadline:'2026-08-16',status:'Deposit Paid',notes:'On track'},
{id:'p4',client:'Mark Johnson',event:'50th Birthday',date:'2026-09-12',totalValue:3000,depositReq:300,depositPaid:false,plan:'Deposit + balance 4 weeks before',finalBalance:3000,deadline:'2026-07-28',status:'Deposit Due',notes:'Provisional - awaiting deposit'},
{id:'p5',client:'Sophie & James Taylor',event:'Wedding',date:'2027-06-15',totalValue:18000,depositReq:300,depositPaid:false,plan:'TBC',finalBalance:18000,deadline:'',status:'No Payment Received',notes:'Quote stage'}
];

DB.marketing=[
{id:'mk1',type:'Wedding Fayre',title:'Autumn Wedding Fayre',date:'2026-09-14',status:'Planned',notes:'Local hotel ballroom, stand booked'},
{id:'mk2',type:'Social Media',title:'Summer garden reel series',date:'2026-07-25',status:'In Progress',notes:'3 reels showing venue setup'},
{id:'mk3',type:'Email Campaign',title:'2028 Early Bird Offer',date:'2026-08-01',status:'Planned',notes:'10% off for bookings before Sept'},
{id:'mk4',type:'Local Outreach',title:'Meet local florists',date:'2026-07-30',status:'Not Started',notes:'Build supplier referral network'}
];

DB.events=[
{id:'ev1',title:'Thompson Final Meeting',date:'2026-07-25',time:'15:00',type:'meeting',color:'#8b5cf6'},
{id:'ev2',title:'Corp Solutions Viewing',date:'2026-07-24',time:'10:00',type:'viewing',color:'#3b82f6'},
{id:'ev3',title:'Green Christening',date:'2026-08-30',time:'13:00',type:'function',color:'#f97316'},
{id:'ev4',title:'Johnson 50th Birthday',date:'2026-09-12',time:'19:00',type:'function',color:'#f97316'},
{id:'ev5',title:'Thompson Wedding',date:'2026-09-06',time:'12:00',type:'wedding',color:'#16a34a'},
{id:'ev6',title:'Morris Deposit Deadline',date:'2026-07-22',time:'',type:'payment',color:'#dc2626'},
{id:'ev7',title:'Bennett First Meeting',date:'2026-07-30',time:'11:00',type:'meeting',color:'#8b5cf6'},
{id:'ev8',title:'Autumn Wedding Fayre',date:'2026-09-14',time:'10:00',type:'staff',color:'#6b7280'}
];
}

// ===== INIT =====
if(!loadDB()){seedData();saveDB();}
if(DB.enquiries.some(e=>['eq1','eq2','eq3','eq4','eq5','eq6','eq7','eq8','eq9'].includes(e.id))){seedData();saveDB();}
staffRecords();
migrateLegacyStaffNames();
saveDB();
const HISTORICAL_SAMPLE_RECORDS=[
{year:'2025',month:'January',eventType:'All Events',events:6,revenue:6351.81},{year:'2025',month:'February',eventType:'All Events',events:10,revenue:5368.85},{year:'2025',month:'March',eventType:'All Events',events:8,revenue:3380.65},{year:'2025',month:'April',eventType:'All Events',events:3,revenue:3924.50},{year:'2025',month:'May',eventType:'All Events',events:16,revenue:21102.48},{year:'2025',month:'June',eventType:'All Events',events:13,revenue:20475.04},{year:'2025',month:'July',eventType:'All Events',events:14,revenue:23413.34},{year:'2025',month:'August',eventType:'All Events',events:12,revenue:23292.34},{year:'2025',month:'September',eventType:'All Events',events:13,revenue:20013.35},{year:'2025',month:'October',eventType:'All Events',events:21,revenue:21244.90},{year:'2025',month:'November',eventType:'All Events',events:19,revenue:17324.13},{year:'2025',month:'December',eventType:'All Events',events:20,revenue:25167.05},
{year:'2026',month:'January',eventType:'All Events',events:23,revenue:9990.20},{year:'2026',month:'February',eventType:'All Events',events:15,revenue:15812.79},{year:'2026',month:'March',eventType:'All Events',events:21,revenue:15100.65},{year:'2026',month:'April',eventType:'All Events',events:14,revenue:17444.47},{year:'2026',month:'May',eventType:'All Events',events:18,revenue:20388.70},{year:'2026',month:'June',eventType:'All Events',events:19,revenue:15907.50},{year:'2026',month:'July',eventType:'All Events',events:8,revenue:12856.56},{year:'2026',month:'August',eventType:'All Events',events:11,revenue:29437.46},{year:'2026',month:'September',eventType:'All Events',events:11,revenue:17219.87},{year:'2026',month:'October',eventType:'All Events',events:12,revenue:17484.60},{year:'2026',month:'November',eventType:'All Events',events:7,revenue:14043.00},{year:'2026',month:'December',eventType:'All Events',events:17,revenue:54342.50}
];
if(!Array.isArray(DB.historical)||!DB.historical.length){DB.historical=HISTORICAL_SAMPLE_RECORDS.map((r,i)=>({...r,id:'sample-hr-'+i}));saveDB();}
const todayStr = (() => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
})();
document.getElementById('today-display').textContent =
  new Date(todayStr + 'T12:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

// ===== NAV =====
function visibleSections(){
  return SECTIONS.map((section,index)=>({section,index})).filter(item => item.section !== 'settings' || (typeof canAccessSettings === 'function' && canAccessSettings()));
}

function buildNav(){
const nav=document.getElementById('nav-items');
nav.innerHTML=visibleSections().map(({section:s,index:i})=>`<button onclick="navigate('${s}')" id="nav-${s}" class="sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 ${currentSection===s?'active':''}"><i data-lucide="${SECTION_ICONS[i]}" style="width:16px;height:16px"></i>${SECTION_LABELS[i]}</button>`).join('');
lucide.createIcons();
}

function navigate(section){
if(section==='settings' && !(typeof canAccessSettings === 'function' && canAccessSettings())){
  toast('You do not have permission to access Settings.', 'error');
  section='dashboard';
}
currentSection=section;
buildNav();
document.getElementById('page-heading').textContent=SECTION_LABELS[SECTIONS.indexOf(section)];
renderSection();
// Close mobile sidebar
document.getElementById('sidebar').classList.add('-translate-x-full');
setTimeout(()=>document.getElementById('sidebar').classList.remove('-translate-x-full'),10);
}

// ===== TOAST =====
function toast(msg,type='success'){
const c=document.getElementById('toast-container');
const t=document.createElement('div');
t.className=`toast px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${type==='success'?'bg-olive-700 text-white':'bg-red-600 text-white'}`;
t.innerHTML=`<i data-lucide="${type==='success'?'check-circle':'alert-circle'}" style="width:16px;height:16px"></i>${msg}`;
c.appendChild(t);
lucide.createIcons();
setTimeout(()=>t.remove(),3000);
}

// ===== MODAL =====
function openModal(html){
  const content=document.getElementById('modal-content');
  // Always begin from the standard modal shell. Individual modules can enlarge
  // it after opening without affecting the next modal.
  content.className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto';
  content.innerHTML=html;
  document.getElementById('modal-overlay').classList.remove('hidden');
  lucide.createIcons();
}
function closeModal(){
  const overlay=document.getElementById('modal-overlay');
  const content=document.getElementById('modal-content');
  overlay.classList.add('hidden');
  content.className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto';
  content.innerHTML='';
}

// ===== DELETE =====
function promptDelete(msg,cb){document.getElementById('delete-msg').textContent=msg;deleteCallback=cb;document.getElementById('delete-overlay').classList.remove('hidden');}
function confirmDelete(){if(deleteCallback)deleteCallback();deleteCallback=null;document.getElementById('delete-overlay').classList.add('hidden');}
function cancelDelete(){deleteCallback=null;document.getElementById('delete-overlay').classList.add('hidden');}

// ===== HELPERS =====
function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML;}
function statusColor(s){
const map={'New Enquiry':'bg-blue-100 text-blue-800','Contacted':'bg-yellow-100 text-yellow-800','Brochure Sent':'bg-purple-100 text-purple-800','Viewing Offered':'bg-indigo-100 text-indigo-800','Viewing Booked':'bg-indigo-100 text-indigo-800','Viewing Completed':'bg-teal-100 text-teal-800','Quote Sent':'bg-orange-100 text-orange-800','Provisional Booking':'bg-amber-100 text-amber-800','Deposit Required':'bg-red-100 text-red-800','Confirmed Booking':'bg-green-100 text-green-800','Lost Enquiry':'bg-gray-100 text-gray-600','Follow Up Later':'bg-gray-100 text-gray-700'};
return map[s]||'bg-gray-100 text-gray-700';
}
function priorityColor(p){return{'Low':'bg-gray-100 text-gray-600','Medium':'bg-blue-100 text-blue-700','High':'bg-orange-100 text-orange-800','Urgent':'bg-red-100 text-red-800'}[p]||'bg-gray-100 text-gray-600';}
function priorityBadge(p){return{'Hot':'bg-red-100 text-red-700','Warm':'bg-amber-100 text-amber-700','Cold':'bg-blue-100 text-blue-700'}[p]||'bg-gray-100 text-gray-600';}
function payStatusColor(s){return{'No Payment Received':'bg-gray-100 text-gray-600','Deposit Due':'bg-yellow-100 text-yellow-800','Deposit Paid':'bg-blue-100 text-blue-800','Part Paid':'bg-indigo-100 text-indigo-800','Final Balance Due':'bg-orange-100 text-orange-800','Paid in Full':'bg-green-100 text-green-800','Overdue':'bg-red-100 text-red-800'}[s]||'bg-gray-100 text-gray-600';}
function isOverdue(d){return d&&d<todayStr;}
function isDueToday(d){return d===todayStr;}
function daysSince(d){if(!d)return 999;const diff=Math.floor((new Date(todayStr)-new Date(d))/(1000*60*60*24));return diff;}

// ===== GLOBAL SEARCH =====
function handleGlobalSearch(ev){
const q=ev.target.value.toLowerCase().trim();
const el=document.getElementById('search-results');
if(!q){el.classList.add('hidden');return;}
let results=[];
DB.enquiries.forEach(e=>{
if(e.name.toLowerCase().includes(q)||e.email.toLowerCase().includes(q)||e.phone.includes(q)||(e.preferredDate||'').includes(q)||e.status.toLowerCase().includes(q))
results.push({type:'Enquiry',name:e.name,sub:e.eventType+' · '+e.status,id:e.id});
});
(DB.salesLeads||[]).forEach(l=>{if([l.companyName,l.contactName,l.email,l.phone,l.postcode].join(' ').toLowerCase().includes(q))results.push({type:'Sales Lead',name:l.companyName,sub:(l.contactName||'No contact')+' · '+l.status,id:l.id});});
(DB.companies||[]).forEach(c=>{if([c.name,c.industry,c.postcode,c.phone,c.email].join(' ').toLowerCase().includes(q))results.push({type:'Company',name:c.name,sub:(c.industry||'Company')+' · '+c.relationship,id:c.id});});
(DB.opportunities||[]).forEach(o=>{const c=DB.companies.find(x=>x.id===o.companyId);if([o.title,o.type,o.stage,c?.name].join(' ').toLowerCase().includes(q))results.push({type:'Opportunity',name:o.title,sub:(c?.name||'No company')+' · '+o.stage,id:o.id});});
(DB.companies||[]).forEach(c=>{if([c.name,c.industry,c.phone,c.email,c.postcode,c.website].join(' ').toLowerCase().includes(q))results.push({type:'Company',name:c.name,sub:(c.industry||'No industry')+' · '+c.relationship,id:c.id});});
DB.weddings.forEach(w=>{if(w.couple.toLowerCase().includes(q)||w.date.includes(q))results.push({type:'Wedding',name:w.couple,sub:w.date,id:w.id});});
DB.functions.forEach(f=>{if(f.client.toLowerCase().includes(q)||f.occasion.toLowerCase().includes(q))results.push({type:'Function',name:f.client,sub:f.occasion+' · '+f.date,id:f.id});});
if(!results.length){el.innerHTML='<p class="p-4 text-sm text-gray-400">No results found</p>';el.classList.remove('hidden');return;}
el.innerHTML=results.slice(0,8).map(r=>`<button onclick="openSearchResult('${r.type}','${r.id}')" class="w-full text-left px-4 py-3 hover:bg-olive-50 flex items-center gap-3 border-b border-gray-50"><span class="badge bg-olive-100 text-olive-700">${r.type}</span><div><p class="text-sm font-medium text-charcoal-900">${esc(r.name)}</p><p class="text-xs text-gray-500">${esc(r.sub)}</p></div></button>`).join('');
el.classList.remove('hidden');
}
function openSearchResult(type,id){
document.getElementById('search-results').classList.add('hidden');
document.getElementById('global-search').value='';
if(type==='Sales Lead'){navigate('sales-leads');setTimeout(()=>viewSalesLead(id),50);}
else if(type==='Company'){navigate('companies');setTimeout(()=>viewCompany(id),50);}
else if(type==='Enquiry')viewEnquiry(id);
else if(type==='Wedding')viewWedding(id);
else if(type==='Function')viewFunction(id);
}
document.addEventListener('click',e=>{if(!e.target.closest('#global-search')&&!e.target.closest('#search-results'))document.getElementById('search-results').classList.add('hidden');});

// ===== NOTIFICATIONS =====
function toggleNotifications(){
const p=document.getElementById('notif-panel');
p.classList.toggle('open');
if(p.classList.contains('open'))renderNotifications();
document.getElementById('ai-panel').classList.remove('open');
}
function renderNotifications(){
const items=[];
DB.payments.filter(p=>isOverdue(p.deadline)&&p.status!=='Paid in Full').forEach(p=>items.push({icon:'credit-card',color:'text-red-600',text:`Payment overdue: ${p.client}`,sub:p.status}));
DB.meetings.filter(m=>m.date===todayStr&&m.status==='Outstanding').forEach(m=>items.push({icon:'users',color:'text-purple-600',text:`Meeting today: ${m.client}`,sub:m.time+' · '+m.type}));
DB.tasks.filter(t=>(isOverdue(t.due)||isDueToday(t.due))&&t.status!=='Completed').forEach(t=>items.push({icon:'check-square',color:'text-orange-600',text:t.title,sub:'Due: '+t.due}));
DB.enquiries.filter(e=>isOverdue(e.nextFollowup)&&!['Confirmed Booking','Lost Enquiry'].includes(e.status)).forEach(e=>items.push({icon:'inbox',color:'text-blue-600',text:`Follow-up overdue: ${e.name}`,sub:e.nextFollowup}));
const el=document.getElementById('notif-list');
el.innerHTML=items.length?items.map(i=>`<div class="flex items-start gap-3 p-3 rounded-lg bg-cream-50 border border-cream-200"><i data-lucide="${i.icon}" style="width:16px;height:16px" class="${i.color} mt-0.5"></i><div><p class="text-sm font-medium text-charcoal-900">${esc(i.text)}</p><p class="text-xs text-gray-500">${esc(i.sub)}</p></div></div>`).join(''):'<p class="text-sm text-gray-400 text-center py-8">All clear! No notifications.</p>';
lucide.createIcons();
const dot=document.getElementById('notif-dot');
if(items.length)dot.classList.remove('hidden');else dot.classList.add('hidden');
}

// ===== WINDMILL INTELLIGENCE =====
function wiMoney(value){
  return '£'+Number(value||0).toLocaleString('en-GB',{maximumFractionDigits:0});
}
function wiFirstName(){
  const raw=String(window.currentUserProfile?.name||window.currentUserProfile?.full_name||document.getElementById('header-user-name')?.textContent||'Team').trim();
  return raw.split(/\s+/)[0]||'Team';
}
function wiOpenEnquiries(){
  return (DB.enquiries||[]).filter(e=>!['Confirmed Booking','Confirmed','Lost Enquiry','Lost'].includes(e.status));
}
function wiDueEnquiries(){
  return wiOpenEnquiries().filter(e=>e.nextFollowup&&(isOverdue(e.nextFollowup)||isDueToday(e.nextFollowup)));
}
function wiOverduePayments(){
  return (DB.payments||[]).filter(p=>p.deadline&&isOverdue(p.deadline)&&p.status!=='Paid in Full');
}
function wiUpcomingWeddings(days=42){
  const end=new Date(); end.setDate(end.getDate()+days);
  const endStr=end.toISOString().slice(0,10);
  return (DB.weddings||[]).filter(w=>w.date&&w.date>=todayStr&&w.date<=endStr&&!w.archivedAt).sort((a,b)=>a.date.localeCompare(b.date));
}
function wiWeddingRiskRows(){
  return wiUpcomingWeddings(42).map(w=>{
    let progress=0;
    try{progress=typeof weddingProgress==='function'?Number(weddingProgress(w)||0):0}catch(e){}
    const tasks=(w.tasks||[]).filter(t=>!['Completed','Done'].includes(t.status));
    const overdue=tasks.filter(t=>t.dueDate&&t.dueDate<todayStr).length;
    return {w,progress,tasks:tasks.length,overdue};
  }).filter(x=>x.overdue>0||x.progress<85);
}
function wiOperationsItems(){
  try{
    if(window.OperationsHub?.allItems)return OperationsHub.allItems().filter(x=>!OperationsHub.statusDone(x.status));
  }catch(e){}
  return (DB.tasks||[]).filter(t=>t.status!=='Completed').map(t=>({
    title:t.title,department:t.department||'Operations',owner:t.owner||t.staff||'Unassigned',
    due:t.due||t.dueDate||'',dateState:t.due&&isOverdue(t.due)?'overdue':t.due&&isDueToday(t.due)?'today':'open',
    value:Number(t.value||0)
  }));
}
function wiCommercialValue(item){
  return Number(item?.value||item?.potentialValue||item?.quotedValue||item?.finalBalance||item?.totalValue||0);
}
function wiContext(){
  const section=String(typeof currentSection!=='undefined'?currentSection:'dashboard');
  const map={
    dashboard:'Operations overview','sales-leads':'Sales workspace',sales:'Sales workspace',
    enquiries:'Enquiry conversion',weddings:'Wedding planning',functions:'Function delivery',
    kitchen:'Kitchen planning',christmas:'Christmas commercial',hotel:'Hotel performance',
    opportunities:'Opportunity pipeline',companies:'Company intelligence',calendar:'Calendar control',
    reports:'Performance reporting'
  };
  return {section,label:map[section]||'Venue overview'};
}
function wiSnapshot(){
  const dueEnquiries=wiDueEnquiries();
  const overduePayments=wiOverduePayments();
  const weddingRisks=wiWeddingRiskRows();
  const operations=wiOperationsItems();
  const dueOps=operations.filter(x=>x.dateState==='today');
  const overdueOps=operations.filter(x=>x.dateState==='overdue');

  const enquiryValue=dueEnquiries.reduce((s,e)=>s+wiCommercialValue(e),0);
  const paymentValue=overduePayments.reduce((s,p)=>s+Number(p.finalBalance||p.outstanding||0),0);
  const riskValue=enquiryValue+paymentValue;

  const priorityEnquiry=dueEnquiries.slice().sort((a,b)=>wiCommercialValue(b)-wiCommercialValue(a))[0]||null;
  const priorityPayment=overduePayments.slice().sort((a,b)=>Number(b.finalBalance||0)-Number(a.finalBalance||0))[0]||null;

  return {dueEnquiries,overduePayments,weddingRisks,operations,dueOps,overdueOps,enquiryValue,paymentValue,riskValue,priorityEnquiry,priorityPayment};
}
function toggleAI(){
  const p=document.getElementById('ai-panel');
  p.classList.toggle('open');
  if(p.classList.contains('open'))renderWindmillIntelligence();
  document.getElementById('notif-panel')?.classList.remove('open');
}
function renderWindmillIntelligence(){
  const s=wiSnapshot(),ctx=wiContext(),first=wiFirstName();
  const context=document.getElementById('wi-context-label');
  if(context)context.textContent=ctx.label;

  const welcome=document.getElementById('wi-welcome');
  if(welcome){
    welcome.innerHTML=`<p>Good ${new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, ${esc(first)}.</p>
      <h3>Here’s what needs your attention.</h3>
      <small>${ctx.label} · live CRM snapshot</small>`;
  }

  const cards=[];
  if(s.riskValue>0){
    cards.push({
      tone:'danger',icon:'pound-sterling',eyebrow:'COMMERCIAL VALUE NEEDING ACTION',
      title:`${wiMoney(s.riskValue)} needs attention`,
      detail:`${s.dueEnquiries.length} due enquiry follow-up${s.dueEnquiries.length===1?'':'s'} · ${s.overduePayments.length} overdue payment${s.overduePayments.length===1?'':'s'}`,
      action:'aiRevenueRisk()',button:'Show me why'
    });
  }else{
    cards.push({
      tone:'success',icon:'check-circle-2',eyebrow:'COMMERCIAL CONTROL',
      title:'No overdue payment or due-enquiry value detected',
      detail:'The currently loaded commercial records are under control.',
      action:'aiFollowups()',button:'Review sales'
    });
  }

  const priority=s.priorityPayment||s.priorityEnquiry;
  if(priority){
    const isPayment=!!s.priorityPayment;
    const title=isPayment?(priority.client||'Overdue payment'):(priority.name||'Enquiry follow-up');
    const value=isPayment?Number(priority.finalBalance||priority.outstanding||0):wiCommercialValue(priority);
    cards.push({
      tone:'gold',icon:'target',eyebrow:"TODAY'S PRIORITY",
      title:`${esc(title)}${value?` · ${wiMoney(value)}`:''}`,
      detail:isPayment?`Payment deadline ${esc(priority.deadline||'overdue')}`:`${esc(priority.status||'Open enquiry')} · follow-up ${esc(priority.nextFollowup||'due')}`,
      action:isPayment?'aiOverduePayments()':`wiOpenEnquiry('${priority.id}')`,
      button:isPayment?'Review payments':'Open enquiry'
    });
  }else if(s.dueOps.length){
    const op=s.dueOps[0];
    cards.push({tone:'gold',icon:'target',eyebrow:"TODAY'S PRIORITY",title:esc(op.title),detail:`${esc(op.department||'Operations')} · ${esc(op.owner||'Unassigned')}`,action:'wiShowToday()',button:'Review today'});
  }

  if(s.weddingRisks.length){
    cards.push({
      tone:'olive',icon:'heart',eyebrow:'PLANNING RISK',
      title:`${s.weddingRisks.length} upcoming wedding${s.weddingRisks.length===1?'':'s'} need planning attention`,
      detail:'Based on overdue wedding actions and current planning progress.',
      action:'aiWeddingRisks()',button:'Review weddings'
    });
  }else{
    const upcoming=wiUpcomingWeddings(42).length;
    cards.push({
      tone:'olive',icon:'calendar',eyebrow:'WEDDING CONTROL',
      title:upcoming?`${upcoming} wedding${upcoming===1?'':'s'} in the next 6 weeks`:'No weddings in the next 6 weeks',
      detail:upcoming?'No obvious overdue planning risk detected from the loaded records.':'The near-term wedding calendar is clear.',
      action:'aiUpcomingWeddings()',button:'View weddings'
    });
  }

  document.getElementById('wi-insights').innerHTML=cards.slice(0,3).map(c=>`
    <article class="wi-insight ${c.tone}">
      <span class="wi-insight-icon"><i data-lucide="${c.icon}"></i></span>
      <div class="wi-insight-copy">
        <small>${c.eyebrow}</small>
        <strong>${c.title}</strong>
        <p>${c.detail}</p>
      </div>
      <button onclick="${c.action}">${c.button}<i data-lucide="arrow-right"></i></button>
    </article>`).join('');

  renderAIPrompts();
  renderWIRecent();
  const result=document.getElementById('ai-result');
  if(result&&!result.dataset.keep)result.innerHTML='';
  if(window.lucide)lucide.createIcons();
}
function renderAIPrompts(){
  const prompts=[
    {label:"Today's priorities",icon:'target',q:'What should I focus on today?'},
    {label:'Protect revenue',icon:'shield',q:'What revenue needs protecting?'},
    {label:'Sales opportunities',icon:'pound-sterling',q:'Who needs following up today?'},
    {label:'Wedding risks',icon:'heart',q:'Which weddings need attention?'},
    {label:'This week',icon:'calendar',q:"Show this week's schedule"}
  ];
  const el=document.getElementById('ai-prompts');
  if(el)el.innerHTML=prompts.map(p=>`<button onclick="wiAskPreset('${p.q.replace(/'/g,"\\'")}')"><i data-lucide="${p.icon}"></i>${p.label}</button>`).join('');
}
function renderWIRecent(){
  const s=wiSnapshot();
  const rows=[
    s.riskValue?{icon:'alert-circle',tone:'danger',title:`${wiMoney(s.riskValue)} commercial value needs action`,sub:`${s.dueEnquiries.length+s.overduePayments.length} commercial records flagged`}:null,
    s.overdueOps.length?{icon:'clock',tone:'warn',title:`${s.overdueOps.length} operational actions are in backlog`,sub:'Use Operations Hub backlog recovery to work these separately'}:null,
    wiUpcomingWeddings(42).length?{icon:'heart',tone:'olive',title:`${wiUpcomingWeddings(42).length} weddings are inside the next 6 weeks`,sub:`${s.weddingRisks.length} currently show planning risk`}:null
  ].filter(Boolean);
  const el=document.getElementById('wi-recent-list');
  if(el)el.innerHTML=rows.length?rows.map(r=>`<div class="wi-recent-row ${r.tone}"><span><i data-lucide="${r.icon}"></i></span><div><strong>${r.title}</strong><small>${r.sub}</small></div></div>`).join(''):`<div class="wi-recent-empty">No high-priority intelligence to surface right now.</div>`;
}
function askWindmill(event){
  event.preventDefault();
  const input=document.getElementById('wi-question');
  const q=String(input?.value||'').trim();
  if(!q)return;
  wiHandleQuestion(q);
}
function wiAskPreset(q){
  const input=document.getElementById('wi-question');
  if(input)input.value=q;
  wiHandleQuestion(q);
}
function wiHandleQuestion(question){
  const q=String(question||'').toLowerCase();
  if(/revenue|money|commercial|protect|payment/.test(q))return aiRevenueRisk();
  if(/follow|enquir|sales|lead|opportun/.test(q))return aiFollowups();
  if(/wedding|bride|groom|planning risk/.test(q))return aiWeddingRisks();
  if(/meeting/.test(q))return aiTodayMeetings();
  if(/week|schedule|calendar/.test(q))return aiWeekSchedule();
  if(/today|focus|priority|first/.test(q))return wiShowToday();
  if(/email|draft/.test(q))return aiFollowupEmail();
  showAIResult('Windmill Intelligence',`<div class="wi-answer-copy"><p>I can currently analyse the CRM data for <strong>today’s priorities, revenue/payment risk, enquiry follow-ups, weddings, meetings and this week’s schedule</strong>.</p><p class="mt-2">Try asking “What should I focus on today?” or choose one of the shortcuts above.</p></div>`);
}
function wiOpenEnquiry(id){
  toggleAI();
  if(typeof viewEnquiry==='function')viewEnquiry(id);
}
function wiShowToday(){
  const s=wiSnapshot();
  const rows=[
    ...s.priorityPayment?[{title:`Payment: ${s.priorityPayment.client||'Customer'}`,sub:`${wiMoney(s.priorityPayment.finalBalance||0)} overdue · ${s.priorityPayment.deadline||''}`,value:Number(s.priorityPayment.finalBalance||0),type:'Payment'}]:[],
    ...s.dueEnquiries.map(e=>({title:e.name||'Enquiry',sub:`${e.status||'Enquiry'} · ${e.nextFollowup||'Due today'}`,value:wiCommercialValue(e),type:'Enquiry',id:e.id})),
    ...s.dueOps.slice(0,5).map(o=>({title:o.title,sub:`${o.department||'Operations'} · ${o.owner||'Unassigned'}`,value:Number(o.value||0),type:'Task'}))
  ].sort((a,b)=>b.value-a.value).slice(0,7);
  showAIResult("Today's recommended order",rows.length?rows.map((r,i)=>`<div class="wi-action-row"><b>${i+1}</b><div><strong>${esc(r.title)}</strong><small>${esc(r.sub)}</small></div>${r.value?`<em>${wiMoney(r.value)}</em>`:''}${r.type==='Enquiry'&&r.id?`<button onclick="wiOpenEnquiry('${r.id}')">Open</button>`:''}</div>`).join(''):`<div class="wi-answer-copy">No due commercial or operational work was found in the currently loaded records.</div>`);
}
function aiRevenueRisk(){
  const s=wiSnapshot();
  const rows=[
    ...s.overduePayments.map(p=>({type:'Payment',name:p.client||'Customer',sub:`Deadline ${p.deadline||'overdue'}`,value:Number(p.finalBalance||p.outstanding||0)})),
    ...s.dueEnquiries.map(e=>({type:'Enquiry',name:e.name||'Enquiry',sub:`${e.status||'Open'} · ${e.nextFollowup||'due'}`,value:wiCommercialValue(e),id:e.id}))
  ].sort((a,b)=>b.value-a.value);
  showAIResult('Commercial value needing action',rows.length?rows.map(r=>`<div class="wi-action-row"><span class="wi-type">${r.type}</span><div><strong>${esc(r.name)}</strong><small>${esc(r.sub)}</small></div><em>${wiMoney(r.value)}</em>${r.id?`<button onclick="wiOpenEnquiry('${r.id}')">Open</button>`:''}</div>`).join(''):`<div class="wi-answer-copy">No overdue payment or due-enquiry commercial value is currently flagged.</div>`);
}
function aiFollowups(){
  const items=wiDueEnquiries().sort((a,b)=>wiCommercialValue(b)-wiCommercialValue(a));
  showAIResult('Enquiry follow-ups due',items.length?items.map(e=>`<div class="wi-action-row"><span class="wi-type">Enquiry</span><div><strong>${esc(e.name)}</strong><small>${esc(e.nextFollowup||'Due')} · ${esc(e.status||'Open')} · ${esc(e.staff||e.owner||'Unassigned')}</small></div>${wiCommercialValue(e)?`<em>${wiMoney(wiCommercialValue(e))}</em>`:''}<button onclick="wiOpenEnquiry('${e.id}')">Open</button></div>`).join(''):'<div class="wi-answer-copy">No enquiry follow-ups are due today or overdue.</div>');
}
function aiOverduePayments(){
  const items=wiOverduePayments();
  showAIResult('Overdue payments',items.length?items.map(p=>`<div class="wi-action-row"><span class="wi-type">Payment</span><div><strong>${esc(p.client||'Customer')}</strong><small>Deadline ${esc(p.deadline||'overdue')}</small></div><em>${wiMoney(p.finalBalance||p.outstanding||0)}</em></div>`).join(''):'<div class="wi-answer-copy">No overdue payments are currently loaded.</div>');
}
function aiTodayMeetings(){
  const items=(DB.meetings||[]).filter(m=>m.date===todayStr);
  showAIResult("Today's meetings",items.length?items.map(m=>`<div class="wi-action-row"><span class="wi-type">Meeting</span><div><strong>${esc(m.client||m.title||'Meeting')}</strong><small>${esc(m.time||'')} · ${esc(m.type||'')} · ${esc(m.staff||'')}</small></div></div>`).join(''):'<div class="wi-answer-copy">No meetings are scheduled today in the currently loaded records.</div>');
}
function aiWeekSchedule(){
  const end=new Date();end.setDate(end.getDate()+7);const endStr=end.toISOString().slice(0,10);
  const events=(DB.events||[]).filter(e=>e.date>=todayStr&&e.date<=endStr).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  showAIResult('Next 7 days',events.length?events.map(e=>`<div class="wi-action-row"><span class="wi-type">${esc(e.date||'')}</span><div><strong>${esc(e.title||'Event')}</strong><small>${esc(e.time||'')} ${esc(e.type||'')}</small></div></div>`).join(''):'<div class="wi-answer-copy">Nothing is listed in the general events feed for the next 7 days.</div>');
}
function aiFollowupEmail(){
  const e=wiDueEnquiries()[0];
  if(!e)return showAIResult('Follow-up email','<div class="wi-answer-copy">No due enquiry is available to draft from.</div>');
  showAIResult(`Draft follow-up · ${esc(e.name)}`,`<div class="wi-email-draft"><small>TO</small><strong>${esc(e.email||'Email not recorded')}</strong><small>SUBJECT</small><strong>Following up on your ${esc(e.eventType||'event')} enquiry at Windmill Farm</strong><p>Hi ${esc(String(e.name||'there').split(' ')[0])},</p><p>I just wanted to follow up regarding your ${esc(e.eventType||'event')} enquiry${e.preferredDate?` for ${esc(e.preferredDate)}`:''}. We'd love to help with your plans and answer any questions you may have.</p><p>Would you like to arrange a viewing or have a quick chat about the options available?</p><p>Kind regards,<br>${esc(e.staff||wiFirstName())}<br>Windmill Farm</p></div>`);
}
function aiUpcomingWeddings(){
  const items=wiUpcomingWeddings(42);
  showAIResult('Weddings in the next 6 weeks',items.length?items.map(w=>`<div class="wi-action-row"><span class="wi-type">Wedding</span><div><strong>${esc(w.couple||'Wedding')}</strong><small>${esc(w.date||'')} · ${Number(w.dayGuests||0)} day guests · ${esc(w.package||'Package TBC')}</small></div><button onclick="toggleAI();openWeddingWorkspace('${w.id}')">Open</button></div>`).join(''):'<div class="wi-answer-copy">No weddings are currently listed in the next 6 weeks.</div>');
}
function aiWeddingRisks(){
  const items=wiWeddingRiskRows();
  showAIResult('Wedding planning risks',items.length?items.map(x=>`<div class="wi-action-row"><span class="wi-type">Wedding</span><div><strong>${esc(x.w.couple||'Wedding')}</strong><small>${esc(x.w.date||'')} · ${x.progress}% planning · ${x.overdue} overdue action${x.overdue===1?'':'s'}</small></div><button onclick="toggleAI();openWeddingWorkspace('${x.w.id}','planning')">Review</button></div>`).join(''):'<div class="wi-answer-copy">No obvious wedding planning risks were detected from the currently loaded records.</div>');
}
function showAIResult(title,html){
  const el=document.getElementById('ai-result');
  if(!el)return;
  el.dataset.keep='1';
  el.innerHTML=`<div class="wi-result-card"><div class="wi-result-head"><div><small>WINDMILL RESPONSE</small><h4>${title}</h4></div><button onclick="document.getElementById('ai-result').innerHTML='';delete document.getElementById('ai-result').dataset.keep"><i data-lucide="x"></i></button></div><div class="wi-result-body">${html}</div></div>`;
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
  if(window.lucide)lucide.createIcons();
}


