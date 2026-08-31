// ===== EVENT TYPE PERFORMANCE =====
const EVENT_TYPE_DATA=[
{type:'Wedding',events2025:29,revenue2025:93367,events2026:32,revenue2026:98468},
{type:'Christmas',events2025:13,revenue2025:17827,events2026:10,revenue2026:52723},
{type:'Meeting',events2025:71,revenue2025:32359,events2026:63,revenue2026:37985},
{type:'Event',events2025:18,revenue2025:14630,events2026:18,revenue2026:19422},
{type:'Birthday',events2025:10,revenue2025:11895,events2026:8,revenue2026:8231},
{type:'Wake',events2025:13,revenue2025:11251,events2026:7,revenue2026:6952},
{type:'Party',events2025:2,revenue2025:2564,events2026:3,revenue2026:4000},
{type:'Engagement',events2025:0,revenue2025:0,events2026:1,revenue2026:1149}
];
let eventTypeFilter='all',eventTypeMetric='revenue';
/* PHASE 1: superseded duplicate `eventTypeRows` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `renderEventTypePerformance` removed; active declaration retained later in this file. */


// ===== YEAR-ON-YEAR REPORTING =====
const REPORT_ANNUAL_BASE={2025:{events:159,revenue:192804},2026:{events:173,revenue:242564}};
const MONTHLY_REVENUE_DATA=[
{month:'January',events2025:6,revenue2025:6351.81,events2026:23,revenue2026:9990.20},
{month:'February',events2025:10,revenue2025:5368.85,events2026:15,revenue2026:15812.79},
{month:'March',events2025:8,revenue2025:3380.65,events2026:21,revenue2026:15100.65},
{month:'April',events2025:3,revenue2025:3924.50,events2026:14,revenue2026:17444.47},
{month:'May',events2025:16,revenue2025:21102.48,events2026:18,revenue2026:20388.70},
{month:'June',events2025:13,revenue2025:20475.04,events2026:19,revenue2026:15907.50},
{month:'July',events2025:14,revenue2025:23413.34,events2026:8,revenue2026:12856.56},
{month:'August',events2025:12,revenue2025:23292.34,events2026:11,revenue2026:29437.46},
{month:'September',events2025:13,revenue2025:20013.35,events2026:11,revenue2026:17219.87},
{month:'October',events2025:21,revenue2025:21244.90,events2026:12,revenue2026:17484.60},
{month:'November',events2025:19,revenue2025:17324.13,events2026:7,revenue2026:14043.00},
{month:'December',events2025:20,revenue2025:25167.05,events2026:17,revenue2026:54342.50}
];
let monthlyRevenueMode='revenue';
let yoyMode='ytd';
let yoyCustomStart='01-01',yoyCustomEnd='12-31';

function reportHistoricalRows(year,month=''){
const rows=historicalRecords().filter(r=>String(r.year)===String(year)&&(!month||String(r.month).toLowerCase()===String(month).toLowerCase()));
if(!month)return rows;
const split=rows.filter(r=>!/^all( event types)?$/i.test(String(r.eventType||'').trim()));
return split.length?split:rows;
}
function reportHistoricalTypeRows(year,type){return historicalRecords().filter(r=>String(r.year)===String(year)&&!/^all( event types)?$/i.test(String(r.eventType||'').trim())&&String(r.eventType||'').trim().toLowerCase()===String(type).toLowerCase());}
function reportHistoricalYearTotals(year){
const months=[...new Set(historicalRecords().filter(r=>String(r.year)===String(year)).map(r=>r.month))];
return months.reduce((total,month)=>{reportHistoricalRows(year,month).forEach(r=>{total.events+=Number(r.events)||0;total.revenue+=Number(r.revenue)||0;});return total;},{events:0,revenue:0});
}
function reportMonthHistorical(year,month){const rows=reportHistoricalRows(year,month);if(!rows.length)return null;return rows.reduce((t,r)=>({events:t.events+(Number(r.events)||0),revenue:t.revenue+(Number(r.revenue)||0)}),{events:0,revenue:0});}
/* PHASE 1: superseded duplicate `reportDynamicMonthlyData` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `reportDynamicEventTypeData` removed; active declaration retained later in this file. */


function reportYears(){
const years=new Set(Object.keys(REPORT_ANNUAL_BASE).map(Number));
[...DB.weddings,...DB.functions,...DB.payments,...DB.events].forEach(r=>{const d=r.date||r.deadline;if(d)years.add(Number(d.slice(0,4)));});
return [...years].sort((a,b)=>a-b);
}
function yoyRange(year){
const now=new Date(todayStr+'T12:00:00');
if(yoyMode==='custom')return [`${year}-${yoyCustomStart}`,`${year}-${yoyCustomEnd}`];
const end=yoyMode==='ytd'?`${year}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`:`${year}-12-31`;
return [`${year}-01-01`,end];
}
function reportYearFigures(year,mode=yoyMode){
const entered=reportHistoricalYearTotals(year),fallback=REPORT_ANNUAL_BASE[year]||{events:0,revenue:0},annual=(entered.events||entered.revenue)?entered:fallback;
if(mode==='ytd'||mode==='custom'){const [start,end]=yoyRange(year),startDate=new Date(`${year}-01-01`),endDate=new Date(end),yearEnd=new Date(`${year}-12-31`),ratio=Math.max(0,Math.min(1,(endDate-startDate)/(yearEnd-startDate)));return {events:Math.round(annual.events*ratio),revenue:annual.revenue*ratio};}
return annual;
}
function gbp(v){return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:2}).format(v||0);}
/* PHASE 1: superseded duplicate `yoyCard` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `renderMonthlyRevenueComparison` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `renderYearOnYear` removed; active declaration retained later in this file. */


// ===== CRM SALES PERFORMANCE =====
function reportEnquiryValue(enquiry){
return Number(enquiry.value||enquiry.estimatedValue||enquiry.estimated_value||enquiry.budget||0);
}
function reportEnquiryProbability(enquiry){
const explicit=Number(enquiry.probability);
if(Number.isFinite(explicit)&&explicit>=0)return Math.min(100,explicit);
const map={
'New Enquiry':15,
'Contacted':25,
'Brochure Sent':30,
'Viewing Offered':35,
'Viewing Booked':50,
'Viewing Completed':60,
'Quote Sent':65,
'Provisional Booking':80,
'Deposit Required':90,
'Follow Up Later':20,
'Confirmed Booking':100,
'Confirmed':100,
'Lost Enquiry':0,
'Lost':0
};
return map[enquiry.status]??25;
}
function reportEnquiryIsConfirmed(enquiry){
return ['Confirmed Booking','Confirmed'].includes(enquiry.status);
}
function reportEnquiryIsLost(enquiry){
return ['Lost Enquiry','Lost'].includes(enquiry.status);
}
function reportEnquiryIsLive(enquiry){
return !reportEnquiryIsConfirmed(enquiry)&&!reportEnquiryIsLost(enquiry)&&!['Archived','Cancelled'].includes(enquiry.status);
}
function reportLostAction(reason){
const actions={
'No Response':'Review whether every planned follow-up was completed and test another contact method.',
'Date Unavailable':'Offer alternative dates immediately and record whether flexibility was discussed.',
'Too Expensive':'Review value presentation, package alternatives and whether the budget was qualified early.',
'Booked Elsewhere':'Record the competing venue and identify what influenced the decision.',
'Venue Not Suitable':'Capture the missing requirement so future marketing and investment decisions use real evidence.',
'Event Cancelled':'Set a suitable future re-engagement date where appropriate.',
'Cancelled':'Set a suitable future re-engagement date where appropriate.'
};
return actions[reason]||'Review the enquiry notes and record a clearer, consistent lost reason.';
}
/* PHASE 1: superseded duplicate `renderCRMSalesPerformance` removed; active declaration retained later in this file. */


// ===== REPORTS =====
let reportTab='executive';
const REPORT_TABS=[
['executive','Executive Summary'],
['yoy','Year-on-Year'],
['revenue','Revenue Analysis'],
['types','Event Types'],
['crm','CRM Sales'],
['sources','Lead Sources'],
['lost','Lost Enquiries'],
['proactive','Proactive Sales'],
['oppipeline','Opportunity Pipeline'],
['team','Team Performance'],
['investment','Investment Case']
];
/* PHASE 1: superseded duplicate `renderRevenueAnalysisTab` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `renderLeadSourcesTab` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `renderLostEnquiriesTab` removed; active declaration retained later in this file. */

/* PHASE 1: superseded duplicate `renderExecutiveSummary` removed; active declaration retained later in this file. */


/* PHASE 1: superseded duplicate `renderReports` removed; final declaration retained. */

function renderLegacyReports(){
const eq=DB.enquiries;
const booked=eq.filter(e=>['Confirmed Booking','Provisional Booking'].includes(e.status)).length;
const convRate=eq.length?Math.round(booked/eq.length*100):0;
const weddingRev=DB.payments.filter(p=>p.event==='Wedding').reduce((a,p)=>a+p.totalValue,0);
const funcRev=DB.payments.filter(p=>p.event!=='Wedding').reduce((a,p)=>a+p.totalValue,0);
const avgSpend=eq.length?Math.round(eq.reduce((a,e)=>a+(e.value||0),0)/eq.length):0;
const avgGuests=eq.length?Math.round(eq.reduce((a,e)=>a+(e.guests||0),0)/eq.length):0;

return`${renderCRMSalesPerformance()}${renderExecutiveSummary()}${renderYearOnYear()}${renderEventTypePerformance()}<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Total Enquiries</p><p class="text-2xl font-bold">${eq.length}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Conversion</p><p class="text-2xl font-bold text-olive-700">${convRate}%</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Wedding Revenue</p><p class="text-2xl font-bold text-gold-500">£${weddingRev.toLocaleString()}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Function Revenue</p><p class="text-2xl font-bold text-olive-600">£${funcRev.toLocaleString()}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Average Spend</p><p class="text-2xl font-bold">£${avgSpend.toLocaleString()}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Avg Guests</p><p class="text-2xl font-bold">${avgGuests}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Lost Bookings</p><p class="text-2xl font-bold text-red-600">${eq.filter(e=>e.status==='Lost Enquiry').length}</p></div>
<div class="kpi-card text-center"><p class="text-xs text-gray-500">Total Revenue</p><p class="text-2xl font-bold text-charcoal-900">£${(weddingRev+funcRev).toLocaleString()}</p></div>
</div>
<div class="grid md:grid-cols-2 gap-4">
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">Enquiries by Month</h3>
<div class="flex items-end gap-2 h-28">${renderMonthlyEnqChart()}</div>
</div>
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">By Type</h3>
<div class="space-y-2">${Object.entries(eq.reduce((a,e)=>{a[e.eventType]=(a[e.eventType]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="flex justify-between items-center text-sm"><span>${k}</span><div class="flex items-center gap-2"><div class="w-16 bg-gray-200 rounded-full h-1.5"><div class="bg-olive-500 rounded-full h-1.5" style="width:${v/eq.length*100}%"></div></div><span class="font-medium text-xs">${v}</span></div></div>`).join('')}</div>
</div>
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">Lead Sources</h3>
<div class="space-y-2">${Object.entries(eq.reduce((a,e)=>{a[e.source]=(a[e.source]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="flex justify-between items-center text-sm"><span>${k}</span><span class="font-medium">${v}</span></div>`).join('')}</div>
</div>
<div class="section-card">
<h3 class="font-bold text-charcoal-900 mb-3">Pipeline Status</h3>
<div class="space-y-2">${Object.entries(eq.reduce((a,e)=>{a[e.status]=(a[e.status]||0)+1;return a;},{})).map(([k,v])=>`<div class="flex justify-between items-center text-sm"><span class="badge ${statusColor(k)}">${k}</span><span class="font-medium">${v}</span></div>`).join('')}</div>
</div>
</div>`;
}
function renderMonthlyEnqChart(){
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const counts=months.map((_,i)=>DB.enquiries.filter(e=>{const m=parseInt(e.enquiryDate.split('-')[1]);return m===i+1;}).length);
const max=Math.max(...counts)||1;
return months.map((m,i)=>`<div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t" style="height:${Math.max(counts[i]/max*80,2)}px;background:${counts[i]?'#5f7d34':'#dfe9c8'}"></div><span class="text-[12px] text-gray-500">${m}</span></div>`).join('');
}


// ============================================================================
// COMMERCIAL REPORTING EXTENSION
// Adds only reports not already covered by Revenue, YoY, Event Types,
// CRM Sales, Lead Sources and Lost Enquiries.
// ============================================================================

function commercialMoney(value){
return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number(value||0));
}
function commercialPct(numerator,denominator){
return denominator?`${(numerator/denominator*100).toFixed(1)}%`:'0.0%';
}
function commercialSafeDate(value){
if(!value)return '';
return String(value).slice(0,10);
}
function commercialMonthKey(value){
const date=commercialSafeDate(value);
return date?date.slice(0,7):'Unknown';
}
function commercialOwner(record){
return record.assignedTo||record.staff||record.coordinator||record.owner||'Unassigned';
}
function commercialActivityType(activity){
return String(activity.type||activity.activityType||'Other');
}
function commercialIsWonOpportunity(item){return item.stage==='Won';}
function commercialIsLostOpportunity(item){return item.stage==='Lost';}
function commercialIsOpenOpportunity(item){return !commercialIsWonOpportunity(item)&&!commercialIsLostOpportunity(item);}
function commercialOpportunityWeighted(item){
return Math.round(Number(item.value||0)*Number(item.probability||0)/100);
}
function commercialReportEmpty(title,message){
return `<div class="section-card"><h2 class="font-bold text-xl text-charcoal-900">${title}</h2><p class="text-sm text-gray-500 mt-2">${message}</p></div>`;
}
function commercialBar(label,value,max,display,sub=''){
const width=max?Math.max(value?3:0,value/max*100):0;
return `<div><div class="flex justify-between gap-3 text-sm mb-1"><span>${label}${sub?`<span class="block text-[12px] text-gray-400">${sub}</span>`:''}</span><strong>${display}</strong></div><div class="h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-2 bg-olive-600 rounded-full" style="width:${width}%"></div></div></div>`;
}

// ===== PROACTIVE SALES =====
/* PHASE 1: superseded duplicate `renderProactiveSalesReport` removed; active declaration retained later in this file. */


// ===== OPPORTUNITY PIPELINE =====
/* PHASE 1: superseded duplicate `renderOpportunityPipelineReport` removed; active declaration retained later in this file. */


// ===== TEAM PERFORMANCE =====
/* PHASE 1: superseded duplicate `renderSalesTeamPerformanceReport` removed; active declaration retained later in this file. */


// ===== AREA MANAGER / INVESTMENT CASE =====
/* PHASE 1: superseded duplicate `renderInvestmentCaseReport` removed; active declaration retained later in this file. */


// ============================================================================
// REPORTS DATA AUDIT — 30 JULY 2026
// Corrects field/status mismatches across every live commercial report.
// ============================================================================

function auditText(value){return String(value??'').trim();}
function auditLower(value){return auditText(value).toLowerCase();}
function auditNumber(...values){
for(const value of values){
const number=Number(value);
if(Number.isFinite(number)&&number!==0)return number;
}
return 0;
}
function auditEnquiryValue(record){
return auditNumber(record?.value,record?.estimatedValue,record?.estimated_value,record?.budget);
}
function auditLeadValue(record){
return auditNumber(record?.potentialValue,record?.potential_value,record?.annualPotential,record?.annual_potential,record?.value);
}
function auditOpportunityValue(record){
return auditNumber(record?.value,record?.estimatedValue,record?.estimated_value,record?.potentialValue);
}
function auditStatusMatches(value,aliases){
const status=auditLower(value);
return aliases.some(alias=>status===auditLower(alias));
}
function auditConfirmedEnquiry(record){
return auditStatusMatches(record?.status,['Confirmed Booking','Confirmed','Booking Confirmed','Won','Deposit Paid']);
}
function auditLostEnquiry(record){
return auditStatusMatches(record?.status,['Lost Enquiry','Lost','Not Proceeding','Declined']);
}
function auditLiveEnquiry(record){
return !auditConfirmedEnquiry(record)&&!auditLostEnquiry(record)&&!auditStatusMatches(record?.status,['Archived','Cancelled','Canceled']);
}
function auditConvertedLead(record){
return auditStatusMatches(record?.status,['Converted','Won','Booking Confirmed','Confirmed']);
}
function auditClosedLead(record){
return auditConvertedLead(record)||auditStatusMatches(record?.status,['Not Interested','Do Not Contact','Lost','Declined']);
}
function auditWonOpportunity(record){
return auditStatusMatches(record?.stage,['Won','Converted','Confirmed','Booking Confirmed']);
}
function auditLostOpportunity(record){
return auditStatusMatches(record?.stage,['Lost','Declined','Cancelled','Canceled']);
}
function auditOpenOpportunity(record){
return !auditWonOpportunity(record)&&!auditLostOpportunity(record);
}
function auditOwner(record){
return auditText(record?.assignedTo||record?.assigned_to||record?.staff||record?.coordinator||record?.owner)||'Unassigned';
}
function auditNextFollowup(record){
return auditText(record?.nextFollowup||record?.next_followup);
}
function auditNextAction(record){
return auditText(record?.nextAction||record?.next_action);
}
function auditProbability(record){
const explicit=Number(record?.probability);
if(Number.isFinite(explicit)&&explicit>=0)return Math.min(100,explicit);
const status=auditLower(record?.stage||record?.status);
const map=[
[['won','confirmed','converted'],100],
[['deposit required','verbal agreement'],90],
[['negotiation'],75],
[['quote sent','proposal sent'],65],
[['quote required','proposal required'],50],
[['meeting booked'],40],
[['qualified','interested'],35],
[['contact made','contacted','conversation started'],25],
[['prospecting','prospect','not contacted'],15],
[['lost','not interested','do not contact'],0]
];
for(const [aliases,value] of map){if(aliases.some(alias=>status===alias))return value;}
return 25;
}
function auditWeightedOpportunity(record){
return auditOpportunityValue(record)*auditProbability(record)/100;
}
function auditHistoricalAnnual(year){
const entered=typeof reportHistoricalYearTotals==='function'?reportHistoricalYearTotals(year):{events:0,revenue:0};
return (entered.events||entered.revenue)?entered:(REPORT_ANNUAL_BASE[year]||{events:0,revenue:0});
}
function auditDynamicMonths(){
return typeof reportDynamicMonthlyData==='function'?reportDynamicMonthlyData():MONTHLY_REVENUE_DATA;
}
function auditDynamicTypes(){
return typeof reportDynamicEventTypeData==='function'?reportDynamicEventTypeData():EVENT_TYPE_DATA;
}
function auditMoney(value){
return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number(value||0));
}
function auditPct(numerator,denominator){
return denominator?`${(numerator/denominator*100).toFixed(1)}%`:'0.0%';
}
function auditDataBadge(label,count){
return `<span class="badge bg-green-100 text-green-700">${label} · ${count} record${count===1?'':'s'}</span>`;
}
function auditBar(label,value,max,display,sub=''){
const width=max?Math.max(value?3:0,value/max*100):0;
return `<div><div class="flex justify-between gap-3 text-sm mb-1"><span>${esc(label)}${sub?`<span class="block text-[12px] text-gray-400">${esc(sub)}</span>`:''}</span><strong>${display}</strong></div><div class="h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-2 bg-olive-600 rounded-full" style="width:${width}%"></div></div></div>`;
}

// ----- EXECUTIVE SUMMARY: dynamic settings data throughout -----
/* PHASE 1: superseded duplicate `renderExecutiveSummary` removed; active declaration retained later in this file. */


// ----- REVENUE ANALYSIS: no static annual summary -----
/* PHASE 1: superseded duplicate `renderRevenueAnalysisTab` removed; final declaration retained. */


// ----- CRM SALES: current enquiries, with value fallback to budget -----
/* PHASE 1: superseded duplicate `renderCRMSalesPerformance` removed; final declaration retained. */


// ----- LEAD SOURCES: counts, confirmation and value -----
/* PHASE 1: superseded duplicate `renderLeadSourcesTab` removed; final declaration retained. */


// ----- LOST: both status aliases -----
/* PHASE 1: superseded duplicate `renderLostEnquiriesTab` removed; final declaration retained. */


// ----- PROACTIVE SALES: supports the actual current statuses -----
function renderProactiveSalesReport(){
const leads=DB.salesLeads||[];
const activities=DB.salesActivities||[];
const active=leads.filter(row=>!auditClosedLead(row));
const converted=leads.filter(auditConvertedLead);
const negative=leads.filter(row=>auditStatusMatches(row.status,['Not Interested','Do Not Contact','Lost','Declined']));
const pipeline=active.reduce((sum,row)=>sum+auditLeadValue(row),0);
const convertedValue=converted.reduce((sum,row)=>sum+auditLeadValue(row),0);
const activitiesByType=activities.reduce((map,row)=>{const type=auditText(row.type||row.activityType||row.activity_type)||'Other';map[type]=(map[type]||0)+1;return map;},{});
const statusRows=Object.entries(leads.reduce((map,row)=>{const status=auditText(row.status)||'Not Recorded';if(!map[status])map[status]={count:0,value:0};map[status].count++;map[status].value+=auditLeadValue(row);return map;},{})).sort((a,b)=>b[1].count-a[1].count);
const max=Math.max(...statusRows.map(([,data])=>data.count),1);
const overdue=active.filter(row=>auditNextFollowup(row)&&auditNextFollowup(row)<todayStr).length;
const noFollowup=active.filter(row=>!auditNextFollowup(row)).length;
return `<section class="section-card mb-5">
<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-600">PROACTIVE SALES PERFORMANCE</p><h2 class="font-bold text-2xl">Business development activity and return</h2><p class="text-sm text-gray-500 mt-1">Supports the current statuses: Not Contacted, Attempted Contact, Contacted, Interested, Follow Up, Meeting Booked, Quote Required and Converted.</p></div>${auditDataBadge('Sales leads',leads.length)}</div>
<div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">${[
['Businesses Added',leads.length],
['Active Prospects',active.length],
['Converted',converted.length],
['Converted Lead Value',auditMoney(convertedValue)],
['Active Pipeline',auditMoney(pipeline)],
['Activities Logged',activities.length],
['Overdue Actions',overdue],
['Conversion Rate',auditPct(converted.length,converted.length+negative.length)]
].map(([label,value])=>`<div class="kpi-card"><p class="text-xs text-gray-500">${label}</p><p class="text-xl font-bold mt-1">${value}</p></div>`).join('')}</div>
<div class="grid lg:grid-cols-2 gap-4"><div class="bg-white rounded-xl border border-gray-100 p-4"><h3 class="font-bold mb-4">Actual lead status funnel</h3><div class="space-y-3">${statusRows.map(([status,data])=>auditBar(status,data.count,max,`${data.count} · ${auditMoney(data.value)}`)).join('')||'<p class="text-sm text-gray-400">No sales leads.</p>'}</div></div>
<div class="bg-charcoal-900 text-white rounded-xl p-4"><h3 class="font-bold mb-4">Activity and control</h3><div class="space-y-2 text-sm">${Object.entries(activitiesByType).sort((a,b)=>b[1]-a[1]).map(([type,count])=>`<div class="flex justify-between"><span>${esc(type)}</span><strong>${count}</strong></div>`).join('')||'<p class="text-gray-400">No activities logged.</p>'}<div class="border-t border-white/15 pt-2 mt-2 flex justify-between"><span>No follow-up date</span><strong>${noFollowup}</strong></div><div class="flex justify-between"><span>Overdue follow-up</span><strong>${overdue}</strong></div></div></div></div>
</section>`;
}

// ----- OPPORTUNITIES: supports actual Quote stages and new Proposal aliases -----
function renderOpportunityPipelineReport(){
const opportunities=DB.opportunities||[];
const open=opportunities.filter(auditOpenOpportunity);
const won=opportunities.filter(auditWonOpportunity);
const lost=opportunities.filter(auditLostOpportunity);
const openValue=open.reduce((sum,row)=>sum+auditOpportunityValue(row),0);
const weighted=open.reduce((sum,row)=>sum+auditWeightedOpportunity(row),0);
const wonValue=won.reduce((sum,row)=>sum+auditOpportunityValue(row),0);
const lostValue=lost.reduce((sum,row)=>sum+auditOpportunityValue(row),0);
const stageRows=Object.entries(opportunities.reduce((map,row)=>{const stage=auditText(row.stage)||'Not Recorded';if(!map[stage])map[stage]={count:0,value:0,weighted:0};map[stage].count++;map[stage].value+=auditOpportunityValue(row);map[stage].weighted+=auditWeightedOpportunity(row);return map;},{})).sort((a,b)=>b[1].value-a[1].value);
const max=Math.max(...stageRows.map(([,data])=>data.value),1);
const overdue=open.filter(row=>auditNextFollowup(row)&&auditNextFollowup(row)<todayStr).length;
const noAction=open.filter(row=>!auditNextFollowup(row)||!auditNextAction(row)).length;
return `<section class="section-card mb-5">
<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5"><div><p class="text-xs font-bold tracking-widest text-olive-600">QUALIFIED REVENUE</p><h2 class="font-bold text-2xl">Opportunity pipeline performance</h2><p class="text-sm text-gray-500 mt-1">Reads the actual current stages including Prospecting, Contact Made, Quote Required and Quote Sent.</p></div>${auditDataBadge('Opportunities',opportunities.length)}</div>
<div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">${[
['Open Deals',open.length],
['Open Pipeline',auditMoney(openValue)],
['Weighted Forecast',auditMoney(weighted)],
['Won Deals',won.length],
['Won Revenue',auditMoney(wonValue)],
['Win Rate',auditPct(won.length,won.length+lost.length)],
['Lost Deals',lost.length],
['Lost Value',auditMoney(lostValue)]
].map(([label,value])=>`<div class="kpi-card"><p class="text-xs text-gray-500">${label}</p><p class="text-xl font-bold mt-1">${value}</p></div>`).join('')}</div>
<div class="grid lg:grid-cols-3 gap-4"><div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4"><h3 class="font-bold mb-4">Actual pipeline stages</h3><div class="space-y-3">${stageRows.map(([stage,data])=>auditBar(stage,data.value,max,auditMoney(data.value),`${data.count} deal${data.count===1?'':'s'} · weighted ${auditMoney(data.weighted)}`)).join('')||'<p class="text-sm text-gray-400">No opportunities.</p>'}</div></div>
<div class="bg-charcoal-900 text-white rounded-xl p-4"><h3 class="font-bold mb-4">Pipeline control</h3><div class="space-y-2 text-sm"><div class="flex justify-between"><span>Overdue follow-ups</span><strong>${overdue}</strong></div><div class="flex justify-between"><span>Missing action/follow-up</span><strong>${noAction}</strong></div><div class="flex justify-between"><span>Quote attention</span><strong>${open.filter(row=>auditStatusMatches(row.stage,['Quote Required','Quote Sent','Proposal Required','Proposal Sent','Negotiation'])).length}</strong></div></div></div></div>
</section>`;
}

// ----- TEAM: corrected values and aliases -----
/* PHASE 1: superseded duplicate `renderSalesTeamPerformanceReport` removed; final declaration retained. */


// ----- INVESTMENT CASE: corrected confirmed and proactive wins -----
/* PHASE 1: superseded duplicate `renderInvestmentCaseReport` removed; active declaration retained later in this file. */



// ============================================================================
// AUTOMATIC REPORTING YEAR COMPARISON
// On 1 January each year the reports automatically compare the new year
// against the immediately preceding year.
// ============================================================================

function reportComparisonYears() {
  const current = new Date().getFullYear();
  return { current, previous: current - 1 };
}

function reportBaseMonthlyValue(year, month) {
  const base = MONTHLY_REVENUE_DATA.find(row => row.month === month);
  if (!base) return { events: 0, revenue: 0 };

  if (Number(year) === 2025) {
    return {
      events: Number(base.events2025 || 0),
      revenue: Number(base.revenue2025 || 0)
    };
  }

  if (Number(year) === 2026) {
    return {
      events: Number(base.events2026 || 0),
      revenue: Number(base.revenue2026 || 0)
    };
  }

  return { events: 0, revenue: 0 };
}

function reportBaseEventTypeValue(year, type) {
  const base = EVENT_TYPE_DATA.find(row => row.type === type);
  if (!base) return { events: 0, revenue: 0 };

  if (Number(year) === 2025) {
    return {
      events: Number(base.events2025 || 0),
      revenue: Number(base.revenue2025 || 0)
    };
  }

  if (Number(year) === 2026) {
    return {
      events: Number(base.events2026 || 0),
      revenue: Number(base.revenue2026 || 0)
    };
  }

  return { events: 0, revenue: 0 };
}

function reportDynamicMonthlyData() {
  const { current, previous } = reportComparisonYears();

  return HISTORICAL_MONTHS.map(month => {
    const previousEntered = reportMonthHistorical(previous, month);
    const currentEntered = reportMonthHistorical(current, month);
    const previousFallback = reportBaseMonthlyValue(previous, month);
    const currentFallback = reportBaseMonthlyValue(current, month);

    return {
      month,
      previousYear: previous,
      currentYear: current,
      previousEvents: previousEntered?.events ?? previousFallback.events,
      previousRevenue: previousEntered?.revenue ?? previousFallback.revenue,
      currentEvents: currentEntered?.events ?? currentFallback.events,
      currentRevenue: currentEntered?.revenue ?? currentFallback.revenue
    };
  });
}

function reportDynamicEventTypeData() {
  const { current, previous } = reportComparisonYears();
  const types = [...new Set([
    ...EVENT_TYPE_DATA.map(row => row.type),
    ...historicalRecords()
      .filter(row => historicalNormalType(row.eventType) !== 'All')
      .map(row => historicalNormalType(row.eventType))
  ])];

  const total = rows => rows.reduce((sum, row) => ({
    events: sum.events + Number(row.events || 0),
    revenue: sum.revenue + Number(row.revenue || 0)
  }), { events: 0, revenue: 0 });

  const monthCoverage = rows => new Set(
    rows
      .map(row => String(row.month || '').trim().toLowerCase())
      .filter(month => HISTORICAL_MONTHS.some(name => name.toLowerCase() === month))
  ).size;

  const resolveYear = (year, type) => {
    const rows = reportHistoricalTypeRows(year, type);
    const entered = total(rows);
    const months = monthCoverage(rows);
    const fallback = reportBaseEventTypeValue(year, type);
    const hasFallback = fallback.events > 0 || fallback.revenue > 0;

    // Never allow a partial monthly split to replace a verified annual figure.
    if (months >= 12) {
      return {
        events: entered.events,
        revenue: entered.revenue,
        months,
        complete: true,
        source: 'Historical event-type split'
      };
    }

    if (hasFallback) {
      return {
        events: fallback.events,
        revenue: fallback.revenue,
        months: 12,
        complete: true,
        source: 'Verified annual base'
      };
    }

    if (rows.length) {
      return {
        events: entered.events,
        revenue: entered.revenue,
        months,
        complete: false,
        source: `Partial event-type data (${months}/12 months)`
      };
    }

    return {
      events: 0,
      revenue: 0,
      months: 0,
      complete: false,
      source: 'No event-type data'
    };
  };

  return types.map(type => {
    const previousValue = resolveYear(previous, type);
    const currentValue = resolveYear(current, type);

    return {
      type,
      previousYear: previous,
      currentYear: current,
      previousEvents: previousValue.events,
      previousRevenue: previousValue.revenue,
      currentEvents: currentValue.events,
      currentRevenue: currentValue.revenue,
      previousMonths: previousValue.months,
      currentMonths: currentValue.months,
      previousSource: previousValue.source,
      currentSource: currentValue.source,
      comparable: previousValue.complete && currentValue.complete
    };
  });
}
function eventTypeRows() {
  return reportDynamicEventTypeData()
    .filter(row =>
      eventTypeFilter === 'all' ||
      row.type === eventTypeFilter ||
      (
        eventTypeFilter === 'private' &&
        !['Wedding', 'Christmas', 'Meeting'].includes(row.type)
      )
    )
    .map(row => {
      const previousAverage = row.previousEvents
        ? row.previousRevenue / row.previousEvents
        : 0;
      const currentAverage = row.currentEvents
        ? row.currentRevenue / row.currentEvents
        : 0;
      const revenueDifference = row.currentRevenue - row.previousRevenue;

      return {
        ...row,
        previousAverage,
        currentAverage,
        eventDifference: row.currentEvents - row.previousEvents,
        revenueDifference,
        growth: row.previousRevenue
          ? revenueDifference / row.previousRevenue * 100
          : row.currentRevenue
            ? 100
            : 0
      };
    });
}

function yoyCard(label, previousValue, currentValue, format = 'number') {
  const { current, previous } = reportComparisonYears();
  const difference = currentValue - previousValue;
  const percentage = previousValue
    ? difference / previousValue * 100
    : currentValue
      ? 100
      : 0;
  const tone = difference > 0
    ? 'text-green-600'
    : difference < 0
      ? 'text-red-600'
      : 'text-gray-500';
  const arrow = difference > 0
    ? 'trending-up'
    : difference < 0
      ? 'trending-down'
      : 'minus';

  const formatValue = value => format === 'currency'
    ? gbp(value)
    : format === 'percent'
      ? `${Number(value || 0).toFixed(1)}%`
      : Math.round(Number(value || 0)).toLocaleString('en-GB');

  return `<div class="kpi-card">
    <p class="text-xs text-gray-500 mb-2">${label}</p>
    <div class="flex justify-between items-end gap-2">
      <div>
        <p class="text-[12px] text-gray-400">${previous}</p>
        <p class="font-bold text-charcoal-900">${formatValue(previousValue)}</p>
      </div>
      <div class="text-right">
        <p class="text-[12px] text-gray-400">${current}</p>
        <p class="font-bold text-charcoal-900">${formatValue(currentValue)}</p>
      </div>
    </div>
    <div class="mt-3 flex items-center justify-between text-xs ${tone}">
      <span>${difference >= 0 ? '+' : ''}${formatValue(difference)}</span>
      <span class="flex items-center gap-1">
        <i data-lucide="${arrow}" style="width:14px;height:14px"></i>
        ${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%
      </span>
    </div>
  </div>`;
}

function renderMonthlyRevenueComparison() {
  const { current, previous } = reportComparisonYears();
  const monthlyData = reportDynamicMonthlyData();

  const max = Math.max(
    ...monthlyData.flatMap(row =>
      monthlyRevenueMode === 'revenue'
        ? [row.previousRevenue, row.currentRevenue]
        : [row.previousEvents, row.currentEvents]
    ),
    1
  );

  const bars = monthlyData.map(row => {
    const previousValue = monthlyRevenueMode === 'revenue'
      ? row.previousRevenue
      : row.previousEvents;
    const currentValue = monthlyRevenueMode === 'revenue'
      ? row.currentRevenue
      : row.currentEvents;

    return `<div class="flex-1 flex items-end justify-center gap-1 h-40" title="${row.month}">
      <div class="w-1/3 bg-olive-300 rounded-t" style="height:${previousValue / max * 100}%"></div>
      <div class="w-1/3 bg-olive-700 rounded-t" style="height:${currentValue / max * 100}%"></div>
    </div>`;
  }).join('');

  const rows = monthlyData.map(row => {
    const difference = row.currentRevenue - row.previousRevenue;
    const percentage = row.previousRevenue === 0
      ? row.currentRevenue > 0 ? 'New' : '0%'
      : `${(difference / row.previousRevenue * 100).toFixed(1)}%`;
    const tone = difference > 0
      ? 'text-green-600'
      : difference < 0
        ? 'text-red-600'
        : 'text-gray-500';

    return `<tr class="border-t border-gray-100">
      <td class="py-2 font-medium">${row.month}</td>
      <td class="py-2 text-right">${row.previousEvents}</td>
      <td class="py-2 text-right">${gbp(row.previousRevenue)}</td>
      <td class="py-2 text-right">${row.currentEvents}</td>
      <td class="py-2 text-right">${gbp(row.currentRevenue)}</td>
      <td class="py-2 text-right ${tone}">${gbp(difference)}</td>
      <td class="py-2 text-right ${tone}">${percentage}</td>
      <td class="py-2 ${tone}">${difference > 0 ? 'Ahead' : difference < 0 ? 'Behind' : 'Equal'}</td>
    </tr>`;
  }).join('');

  return `<div class="section-card mt-4">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">MONTHLY REVENUE COMPARISON</p>
        <h3 class="font-bold text-lg text-charcoal-900">${previous} vs ${current}</h3>
      </div>
      <select aria-label="Monthly comparison metric"
        onchange="monthlyRevenueMode=this.value;renderSection()"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
        <option value="revenue" ${monthlyRevenueMode === 'revenue' ? 'selected' : ''}>Revenue</option>
        <option value="events" ${monthlyRevenueMode === 'events' ? 'selected' : ''}>Event Count</option>
      </select>
    </div>

    <div class="flex items-end gap-2 h-48 mb-2">${bars}</div>
    <div class="flex justify-between text-[12px] text-gray-500 mb-4">
      ${monthlyData.map(row => `<span class="flex-1 text-center">${row.month.slice(0,3)}</span>`).join('')}
    </div>
    <div class="flex gap-4 text-xs mb-4">
      <span><span class="inline-block w-3 h-3 rounded bg-olive-300 mr-1"></span>${previous}</span>
      <span><span class="inline-block w-3 h-3 rounded bg-olive-700 mr-1"></span>${current}</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-xs min-w-[900px]">
        <thead>
          <tr class="text-gray-500 text-left">
            <th class="py-2">Month</th>
            <th class="py-2 text-right">${previous} Events</th>
            <th class="py-2 text-right">${previous} Revenue</th>
            <th class="py-2 text-right">${current} Events</th>
            <th class="py-2 text-right">${current} Revenue</th>
            <th class="py-2 text-right">Revenue Difference</th>
            <th class="py-2 text-right">Revenue Difference %</th>
            <th class="py-2">Performance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function renderYearOnYear() {
  const { current, previous } = reportComparisonYears();
  const previousFigures = reportYearFigures(previous);
  const currentFigures = reportYearFigures(current);
  const growth = previousFigures.revenue
    ? (currentFigures.revenue - previousFigures.revenue) / previousFigures.revenue * 100
    : 0;
  const status = growth > 0
    ? 'Ahead of last year'
    : growth < 0
      ? 'Behind last year'
      : 'In line with last year';

  const now = new Date();
  const comparisonEnd = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

  return `<div class="section-card mb-4">
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
      <div>
        <p class="text-xs font-bold tracking-widest text-olive-600">YEAR-ON-YEAR PERFORMANCE</p>
        <h3 class="font-bold text-xl text-charcoal-900">${current} vs ${previous} Performance</h3>
        <p class="text-sm text-gray-500 mt-1">${status}</p>
      </div>
      <div>
        <label for="yoy-mode" class="block text-xs font-medium text-gray-500 mb-1">Comparison mode</label>
        <select id="yoy-mode" onchange="yoyMode=this.value;renderSection()"
          class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
          <option value="ytd" ${yoyMode === 'ytd' ? 'selected' : ''}>Year to Date</option>
          <option value="full" ${yoyMode === 'full' ? 'selected' : ''}>Full Year</option>
          <option value="custom" ${yoyMode === 'custom' ? 'selected' : ''}>Custom Date Range</option>
        </select>
      </div>
    </div>

    <p class="text-xs text-gray-400 mb-3">
      ${yoyMode === 'ytd'
        ? `01/01/${previous} to ${comparisonEnd}/${previous} compared with 01/01/${current} to ${comparisonEnd}/${current}`
        : yoyMode === 'full'
          ? `01/01/${previous} to 31/12/${previous} compared with 01/01/${current} to 31/12/${current}`
          : 'Same day/month window compared across years'}
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      ${yoyCard('Total Events', previousFigures.events, currentFigures.events)}
      ${yoyCard('Total Revenue', previousFigures.revenue, currentFigures.revenue, 'currency')}
      ${yoyCard(
        'Average Revenue Per Event',
        previousFigures.events ? previousFigures.revenue / previousFigures.events : 0,
        currentFigures.events ? currentFigures.revenue / currentFigures.events : 0,
        'currency'
      )}
      ${yoyCard('Revenue Growth Percentage', 0, growth, 'percent')}
    </div>
  </div>${renderMonthlyRevenueComparison()}`;
}

/* PHASE 1: superseded duplicate `renderEventTypePerformance` removed; final declaration retained. */


/* PHASE 1: superseded duplicate `renderExecutiveSummary` removed; final declaration retained. */


/* PHASE 1: superseded duplicate `renderInvestmentCaseReport` removed; final declaration retained. */




// ============================================================================
// WINDMILL OS — COMMERCIAL INTELLIGENCE REPORTS 2.0
// This extension deliberately overrides the earlier render functions.
// It keeps the existing historical data and automatic calendar-year rollover.
// ============================================================================

let intelligenceTargetRevenue = Number(localStorage.getItem('windmill_report_target_revenue') || 300000);
let intelligenceInvestmentCost = Number(localStorage.getItem('windmill_report_investment_cost') || 45000);
let intelligenceGrossMargin = Number(localStorage.getItem('windmill_report_gross_margin') || 65);
let intelligenceRecoveryRate = Number(localStorage.getItem('windmill_report_recovery_rate') || 10);

function ciArray(value){ return Array.isArray(value) ? value : []; }
function ciNum(value){ const n=Number(value); return Number.isFinite(n) ? n : 0; }
function ciMoney(value){ return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(ciNum(value)); }
function ciMoney2(value){ return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:2,maximumFractionDigits:2}).format(ciNum(value)); }
function ciPct(value,digits=1){ return `${ciNum(value).toFixed(digits)}%`; }
function ciSignedPct(value,digits=1){ return `${ciNum(value)>=0?'+':''}${ciNum(value).toFixed(digits)}%`; }
function ciSignedMoney(value){ return `${ciNum(value)>=0?'+':'-'}${ciMoney(Math.abs(ciNum(value)))}`; }
function ciDate(value){ return String(value||'').slice(0,10); }
function ciDateValue(value){ const d=new Date(ciDate(value)+'T12:00:00'); return Number.isNaN(d.getTime()) ? null : d; }
function ciDaysBetween(a,b){ const x=ciDateValue(a),y=ciDateValue(b); return x&&y?Math.round((y-x)/86400000):null; }
function ciOwner(record){ return record?.assignedTo||record?.staff||record?.coordinator||record?.owner||record?.createdBy||'Unassigned'; }
function ciEnquiryValue(row){ return ciNum(row?.value||row?.estimatedValue||row?.estimated_value||row?.budget); }
function ciLeadValue(row){ return ciNum(row?.potentialValue||row?.potential_value||row?.annualPotential||row?.annual_potential); }
function ciOpportunityValue(row){ return ciNum(row?.value||row?.estimatedValue||row?.estimated_value); }
function ciOpportunityProbability(row){ return Math.max(0,Math.min(100,ciNum(row?.probability))); }
function ciConfirmed(row){ return ['Confirmed Booking','Confirmed'].includes(row?.status); }
function ciLost(row){ return ['Lost Enquiry','Lost'].includes(row?.status); }
function ciLive(row){ return !ciConfirmed(row)&&!ciLost(row)&&!['Archived','Cancelled','Completed'].includes(row?.status); }
function ciOpenOpportunity(row){ return !['Won','Lost'].includes(row?.stage); }
function ciWonOpportunity(row){ return row?.stage==='Won'; }
function ciLostOpportunity(row){ return row?.stage==='Lost'; }
function ciCurrentYears(){ return reportComparisonYears ? reportComparisonYears() : {current:new Date().getFullYear(),previous:new Date().getFullYear()-1}; }
function ciYearLabel(){ const y=ciCurrentYears(); return `${y.current} vs ${y.previous}`; }
function ciEsc(value){ return typeof esc==='function' ? esc(String(value??'')) : String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function ciClamp(value,min,max){ return Math.max(min,Math.min(max,value)); }
function ciSum(rows,fn){ return ciArray(rows).reduce((sum,row)=>sum+ciNum(fn(row)),0); }
function ciAverage(rows,fn){ return rows.length ? ciSum(rows,fn)/rows.length : 0; }
function ciGroup(rows,keyFn,valueFn=()=>1){
  return ciArray(rows).reduce((map,row)=>{
    const key=String(keyFn(row)||'Not Recorded').trim()||'Not Recorded';
    if(!map[key]) map[key]={count:0,value:0,rows:[]};
    map[key].count+=1;
    map[key].value+=ciNum(valueFn(row));
    map[key].rows.push(row);
    return map;
  },{});
}
function ciTone(value,positive=true){
  if(value===0)return 'text-gray-500';
  return (positive?value>0:value<0)?'text-green-700':'text-red-700';
}
function ciBadge(label,tone='olive'){
  const classes={
    olive:'bg-olive-100 text-olive-800',green:'bg-green-100 text-green-800',
    amber:'bg-amber-100 text-amber-800',red:'bg-red-100 text-red-800',
    blue:'bg-blue-100 text-blue-800',purple:'bg-purple-100 text-purple-800',
    gray:'bg-gray-100 text-gray-700'
  };
  return `<span class="inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold ${classes[tone]||classes.olive}">${ciEsc(label)}</span>`;
}
function ciPanel(title,subtitle,content,extra=''){
  return `<section class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${extra}">
    <div class="px-5 py-4 border-b border-gray-100">
      <h3 class="font-bold text-charcoal-900">${ciEsc(title)}</h3>
      ${subtitle?`<p class="text-xs text-gray-500 mt-1">${ciEsc(subtitle)}</p>`:''}
    </div>
    <div class="p-5">${content}</div>
  </section>`;
}
function ciKpi(label,value,detail='',icon='activity',tone='olive'){
  const toneClass={olive:'text-olive-700',green:'text-green-700',red:'text-red-700',amber:'text-amber-700',blue:'text-blue-700',purple:'text-purple-700'}[tone]||'text-olive-700';
  return `<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 min-w-0">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs text-gray-500">${ciEsc(label)}</p>
      <i data-lucide="${icon}" class="${toneClass}" style="width:17px;height:17px"></i>
    </div>
    <p class="text-xl lg:text-2xl font-bold text-charcoal-900 mt-2 break-words">${value}</p>
    ${detail?`<p class="text-[12px] leading-snug text-gray-500 mt-2">${detail}</p>`:''}
  </div>`;
}
function ciBar(label,value,max,display='',detail='',tone='bg-olive-600'){
  const width=max?ciClamp(value/max*100,value?2:0,100):0;
  return `<div>
    <div class="flex justify-between items-end gap-3 text-sm mb-1">
      <span class="min-w-0">${ciEsc(label)}${detail?`<span class="block text-[12px] text-gray-400">${ciEsc(detail)}</span>`:''}</span>
      <strong class="whitespace-nowrap">${display||value}</strong>
    </div>
    <div class="h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-2 ${tone} rounded-full" style="width:${width}%"></div></div>
  </div>`;
}
function ciStatusCard(title,value,detail,tone='olive'){
  const cls={
    olive:'bg-olive-50 border-olive-200 text-olive-900',
    green:'bg-green-50 border-green-200 text-green-900',
    amber:'bg-amber-50 border-amber-200 text-amber-900',
    red:'bg-red-50 border-red-200 text-red-900',
    blue:'bg-blue-50 border-blue-200 text-blue-900'
  }[tone];
  return `<div class="rounded-xl border p-4 ${cls}">
    <p class="text-xs opacity-75">${ciEsc(title)}</p>
    <p class="font-bold text-lg mt-1">${value}</p>
    <p class="text-xs mt-2 opacity-80">${detail}</p>
  </div>`;
}

function ciDataset(){
  const enquiries=ciArray(DB.enquiries);
  const weddings=ciArray(DB.weddings);
  const leads=ciArray(DB.salesLeads);
  const salesActivities=ciArray(DB.salesActivities);
  const opportunities=ciArray(DB.opportunities);
  const opportunityActivities=ciArray(DB.opportunityActivities);
  const companies=ciArray(DB.companies);
  const functions=ciArray(DB.functions);
  const payments=ciArray(DB.payments);
  const live=enquiries.filter(ciLive);
  const confirmed=enquiries.filter(ciConfirmed);
  const lost=enquiries.filter(ciLost);
  const openOpps=opportunities.filter(ciOpenOpportunity);
  const wonOpps=opportunities.filter(ciWonOpportunity);
  const lostOpps=opportunities.filter(ciLostOpportunity);
  const activeLeads=leads.filter(row=>!['Converted','Not Interested','Do Not Contact'].includes(row.status));
  const today=typeof todayStr==='string'?todayStr:new Date().toISOString().slice(0,10);
  const overdueEnquiries=live.filter(e=>ciDate(e.nextFollowup||e.next_followup)&&ciDate(e.nextFollowup||e.next_followup)<today);
  const noFollowup=live.filter(e=>!ciDate(e.nextFollowup||e.next_followup));
  const noEnquiryValue=enquiries.filter(e=>!ciEnquiryValue(e));
  const overdueOpps=openOpps.filter(o=>ciDate(o.nextFollowup||o.next_followup)&&ciDate(o.nextFollowup||o.next_followup)<today);
  const noOppAction=openOpps.filter(o=>!ciDate(o.nextFollowup||o.next_followup)||!String(o.nextAction||o.next_action||'').trim());
  const openPipeline=ciSum(openOpps,ciOpportunityValue);
  const weightedPipeline=ciSum(openOpps,o=>ciOpportunityValue(o)*ciOpportunityProbability(o)/100);
  const proactivePipeline=ciSum(activeLeads,ciLeadValue);
  const confirmedCrm=ciSum(confirmed,ciEnquiryValue);
  const wonRevenue=ciSum(wonOpps,ciOpportunityValue);
  const decided=confirmed.length+lost.length;
  const conversion=decided?confirmed.length/decided*100:0;
  return {enquiries,weddings,leads,salesActivities,opportunities,opportunityActivities,companies,functions,payments,live,confirmed,lost,openOpps,wonOpps,lostOpps,activeLeads,today,overdueEnquiries,noFollowup,noEnquiryValue,overdueOpps,noOppAction,openPipeline,weightedPipeline,proactivePipeline,confirmedCrm,wonRevenue,conversion};
}
function ciAnnual(){
  const {current,previous}=ciCurrentYears();
  const currentFigures=typeof reportYearFigures==='function'?reportYearFigures(current,'full'):{events:0,revenue:0};
  const previousFigures=typeof reportYearFigures==='function'?reportYearFigures(previous,'full'):{events:0,revenue:0};
  const revenueDiff=currentFigures.revenue-previousFigures.revenue;
  const eventDiff=currentFigures.events-previousFigures.events;
  return {
    current,previous,currentFigures,previousFigures,revenueDiff,eventDiff,
    revenueGrowth:previousFigures.revenue?revenueDiff/previousFigures.revenue*100:0,
    eventGrowth:previousFigures.events?eventDiff/previousFigures.events*100:0,
    currentAverage:currentFigures.events?currentFigures.revenue/currentFigures.events:0,
    previousAverage:previousFigures.events?previousFigures.revenue/previousFigures.events:0
  };
}
function ciReportMonthData(){
  if(typeof reportDynamicMonthlyData==='function'){
    const rows=reportDynamicMonthlyData();
    return rows.map(row=>({
      month:row.month,
      previousEvents:ciNum(row.previousEvents??row.events2025),
      previousRevenue:ciNum(row.previousRevenue??row.revenue2025),
      currentEvents:ciNum(row.currentEvents??row.events2026),
      currentRevenue:ciNum(row.currentRevenue??row.revenue2026)
    }));
  }
  return [];
}
function ciReportTypeData(){
  if(typeof reportDynamicEventTypeData==='function'){
    return reportDynamicEventTypeData().map(row=>({
      type:row.type,
      previousEvents:ciNum(row.previousEvents??row.events2025),
      previousRevenue:ciNum(row.previousRevenue??row.revenue2025),
      currentEvents:ciNum(row.currentEvents??row.events2026),
      currentRevenue:ciNum(row.currentRevenue??row.revenue2026),
      previousMonths:ciNum(row.previousMonths||0),
      currentMonths:ciNum(row.currentMonths||0),
      previousSource:row.previousSource||'Unknown',
      currentSource:row.currentSource||'Unknown',
      comparable:row.comparable!==false
    }));
  }
  return [];
}
function ciCommercialHealth(){
  const d=ciDataset(),a=ciAnnual();
  const followupScore=d.live.length?100-((d.overdueEnquiries.length+d.noFollowup.length)/d.live.length*60):100;
  const dataScore=d.enquiries.length?100-(d.noEnquiryValue.length/d.enquiries.length*45):100;
  const pipelineScore=d.openOpps.length?100-(d.noOppAction.length/d.openOpps.length*55):d.live.length?55:35;
  const growthScore=ciClamp(55+a.revenueGrowth*1.5,0,100);
  const conversionScore=ciClamp(d.conversion*1.7,0,100);
  const score=Math.round(growthScore*.28+conversionScore*.20+followupScore*.22+pipelineScore*.18+dataScore*.12);
  const label=score>=85?'Strong':score>=70?'Healthy':score>=55?'Developing':score>=40?'At Risk':'Critical';
  const tone=score>=70?'green':score>=55?'amber':'red';
  return {score,label,tone,growthScore,conversionScore,followupScore,pipelineScore,dataScore};
}
function ciRisksAndActions(){
  const d=ciDataset(),a=ciAnnual();
  const risks=[],opportunities=[],actions=[];
  const lostValue=ciSum(d.lost,ciEnquiryValue);
  const proposalOpps=d.openOpps.filter(o=>['Proposal Required','Proposal Sent','Negotiation'].includes(o.stage));
  const depositOpps=d.openOpps.filter(o=>['Verbal Agreement','Deposit Required'].includes(o.stage));
  const noDecisionMaker=d.activeLeads.filter(l=>!l.decisionMaker&&!l.decisionMakerName&&!l.contactName);
  const typeData=ciReportTypeData();
  const comparableTypes=typeData.filter(r=>r.comparable);
  const declining=comparableTypes.filter(r=>r.currentRevenue<r.previousRevenue).sort((x,y)=>(x.currentRevenue-x.previousRevenue)-(y.currentRevenue-y.previousRevenue));
  const growing=comparableTypes.filter(r=>r.currentRevenue>r.previousRevenue).sort((x,y)=>(y.currentRevenue-y.previousRevenue)-(x.currentRevenue-x.previousRevenue));
  if(d.overdueEnquiries.length)risks.push({title:`${d.overdueEnquiries.length} overdue enquiry follow-up${d.overdueEnquiries.length===1?'':'s'}`,detail:'Delayed follow-up reduces conversion confidence and risks avoidable lost business.',severity:'red'});
  if(d.noFollowup.length)risks.push({title:`${d.noFollowup.length} live enquir${d.noFollowup.length===1?'y has':'ies have'} no next action`,detail:'Open enquiries without a dated action are not controlled pipeline.',severity:'red'});
  if(d.noOppAction.length)risks.push({title:`${d.noOppAction.length} qualified deal${d.noOppAction.length===1?'':'s'} lack control`,detail:'A next action and date are required before the opportunity can be treated as reliable forecast.',severity:'amber'});
  if(d.noEnquiryValue.length)risks.push({title:`${d.noEnquiryValue.length} enquir${d.noEnquiryValue.length===1?'y is':'ies are'} missing value`,detail:'Missing values understate pipeline, source quality and lost-revenue analysis.',severity:'amber'});
  if(declining[0])risks.push({title:`${declining[0].type} revenue is down ${ciMoney(Math.abs(declining[0].currentRevenue-declining[0].previousRevenue))}`,detail:'Review pricing, demand, availability and sales focus before the decline becomes structural.',severity:'amber'});
  if(a.revenueGrowth>0)opportunities.push({title:`Revenue is ${ciPct(a.revenueGrowth)} ahead`,detail:`Current-year reported revenue is ${ciMoney(a.currentFigures.revenue)} versus ${ciMoney(a.previousFigures.revenue)}.`,severity:'green'});
  if(d.weightedPipeline)opportunities.push({title:`${ciMoney(d.weightedPipeline)} probability-weighted opportunity`,detail:`Supported by ${d.openOpps.length} open qualified deal${d.openOpps.length===1?'':'s'}.`,severity:'green'});
  if(d.proactivePipeline)opportunities.push({title:`${ciMoney(d.proactivePipeline)} earlier-stage proactive potential`,detail:`There are ${d.activeLeads.length} active business-development prospect${d.activeLeads.length===1?'':'s'}.`,severity:'blue'});
  if(growing[0])opportunities.push({title:`${growing[0].type} is the strongest growth category`,detail:`Revenue increased by ${ciMoney(growing[0].currentRevenue-growing[0].previousRevenue)}.`,severity:'green'});
  if(proposalOpps.length)actions.push({priority:1,title:`Progress ${proposalOpps.length} proposal-stage deal${proposalOpps.length===1?'':'s'}`,detail:`Combined value ${ciMoney(ciSum(proposalOpps,ciOpportunityValue))}. Confirm decision date and next contact.`});
  if(depositOpps.length)actions.push({priority:2,title:`Secure ${depositOpps.length} verbal/deposit-stage deal${depositOpps.length===1?'':'s'}`,detail:`Combined value ${ciMoney(ciSum(depositOpps,ciOpportunityValue))}. Remove final booking barriers.`});
  if(d.overdueEnquiries.length)actions.push({priority:3,title:'Clear overdue enquiry follow-ups',detail:'Prioritise the oldest and highest-value enquiries first.'});
  if(d.noFollowup.length)actions.push({priority:4,title:'Assign next actions to every live enquiry',detail:'No live enquiry should remain without a dated owner action.'});
  if(noDecisionMaker.length)actions.push({priority:5,title:`Identify decision makers for ${noDecisionMaker.length} prospect${noDecisionMaker.length===1?'':'s'}`,detail:'Named contacts improve outbound conversion and account value.'});
  if(lostValue)actions.push({priority:6,title:'Review lost revenue, not only lost volume',detail:`Current recorded lost enquiry value is ${ciMoney(lostValue)}.`});
  if(!actions.length)actions.push({priority:1,title:'Protect current performance',detail:'Maintain follow-up discipline and continue building qualified opportunity data.'});
  return {risks:risks.slice(0,5),opportunities:opportunities.slice(0,5),actions:actions.sort((x,y)=>x.priority-y.priority).slice(0,5)};
}
function ciExecutiveNarrative(){
  const d=ciDataset(),a=ciAnnual(),health=ciCommercialHealth(),intelligence=ciRisksAndActions();
  const lines=[];
  lines.push(`${a.current} reported revenue is ${a.revenueGrowth>=0?`${ciPct(Math.abs(a.revenueGrowth))} ahead`:`${ciPct(Math.abs(a.revenueGrowth))} behind`} ${a.previous}, at ${ciMoney(a.currentFigures.revenue)}.`);
  lines.push(`Average revenue per event is ${ciMoney(a.currentAverage)}, ${a.currentAverage>=a.previousAverage?'higher':'lower'} than ${a.previous} by ${ciPct(Math.abs(a.previousAverage?(a.currentAverage-a.previousAverage)/a.previousAverage*100:0))}.`);
  if(d.openPipeline)lines.push(`The qualified pipeline contains ${ciMoney(d.openPipeline)}, of which ${ciMoney(d.weightedPipeline)} is probability weighted.`);
  if(d.overdueEnquiries.length||d.noFollowup.length)lines.push(`${d.overdueEnquiries.length+d.noFollowup.length} live enquiry control issue${d.overdueEnquiries.length+d.noFollowup.length===1?' requires':'s require'} action, reducing forecast confidence.`);
  else lines.push('Live enquiry follow-up control is currently strong.');
  if(intelligence.opportunities[0])lines.push(intelligence.opportunities[0].detail);
  return {headline:`Commercial health is ${health.label.toLowerCase()} at ${health.score}/100.`,lines};
}
function ciReportHeader(kicker,title,description,actions=''){
  return `<div class="bg-gradient-to-r from-charcoal-900 via-[#34402b] to-olive-800 text-white rounded-2xl p-5 lg:p-6 shadow-lg mb-5">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div>
        <p class="text-xs font-bold tracking-[.18em] text-olive-200">${ciEsc(kicker)}</p>
        <h2 class="font-bold text-2xl lg:text-3xl mt-1">${ciEsc(title)}</h2>
        <p class="text-sm text-white/70 mt-2 max-w-4xl">${ciEsc(description)}</p>
      </div>
      <div class="flex flex-wrap gap-2">${actions}</div>
    </div>
  </div>`;
}

function renderExecutiveSummary(){
  const d=ciDataset(),a=ciAnnual(),health=ciCommercialHealth(),narrative=ciExecutiveNarrative(),intel=ciRisksAndActions();
  const forecast=a.currentFigures.revenue+d.weightedPipeline;
  const targetGap=intelligenceTargetRevenue-a.currentFigures.revenue;
  const months=ciReportMonthData();
  const bestMonth=[...months].sort((x,y)=>y.currentRevenue-x.currentRevenue)[0];
  const weakestMonth=[...months].sort((x,y)=>x.currentRevenue-y.currentRevenue)[0];
  const tone=health.tone;
  return `${ciReportHeader('COMMERCIAL INTELLIGENCE',`${a.current} Executive Dashboard`,`Live management view using historical performance, enquiries, proactive sales and qualified opportunities.`)}
  <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
    ${ciKpi('Commercial Health',`${health.score}/100`,health.label,'gauge',tone)}
    ${ciKpi(`${a.current} Revenue`,ciMoney(a.currentFigures.revenue),`${ciSignedPct(a.revenueGrowth)} vs ${a.previous}`,'pound-sterling',a.revenueGrowth>=0?'green':'red')}
    ${ciKpi('Qualified Pipeline',ciMoney(d.openPipeline),`${d.openOpps.length} open deal${d.openOpps.length===1?'':'s'}`,'briefcase-business','blue')}
    ${ciKpi('Weighted Forecast',ciMoney(d.weightedPipeline),'Probability-adjusted opportunity value','chart-no-axes-combined','olive')}
    ${ciKpi('Forecast Revenue',ciMoney(forecast),`Reported revenue plus weighted pipeline`,'telescope',forecast>=intelligenceTargetRevenue?'green':'amber')}
    ${ciKpi('CRM Conversion',ciPct(d.conversion),`${d.confirmed.length} confirmed / ${d.lost.length} lost`,'percent','purple')}
    ${ciKpi('Follow-up Exceptions',d.overdueEnquiries.length+d.noFollowup.length,`${d.overdueEnquiries.length} overdue · ${d.noFollowup.length} missing`,'alert-triangle',d.overdueEnquiries.length+d.noFollowup.length?'red':'green')}
    ${ciKpi('Target Gap',targetGap>0?ciMoney(targetGap):'Target exceeded',targetGap>0?`Target ${ciMoney(intelligenceTargetRevenue)}`:`Ahead by ${ciMoney(Math.abs(targetGap))}`,'target',targetGap>0?'amber':'green')}
  </div>

  <div class="grid xl:grid-cols-[1.25fr_.75fr] gap-4 mb-5">
    <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-olive-100 text-olive-700 flex items-center justify-center flex-shrink-0"><i data-lucide="sparkles"></i></div>
        <div>
          <p class="text-xs font-bold tracking-widest text-olive-600">MANAGEMENT COMMENTARY</p>
          <h3 class="font-bold text-xl mt-1">${ciEsc(narrative.headline)}</h3>
          <div class="mt-3 space-y-2 text-sm text-gray-700">${narrative.lines.map(line=>`<p>${ciEsc(line)}</p>`).join('')}</div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border p-5 ${tone==='green'?'bg-green-50 border-green-200':tone==='amber'?'bg-amber-50 border-amber-200':'bg-red-50 border-red-200'}">
      <p class="text-xs font-bold tracking-widest opacity-70">PERFORMANCE STATUS</p>
      <p class="text-3xl font-bold mt-2">${health.label}</p>
      <div class="h-3 bg-white/70 rounded-full overflow-hidden mt-4"><div class="h-3 bg-olive-700 rounded-full" style="width:${health.score}%"></div></div>
      <div class="grid grid-cols-2 gap-2 mt-4 text-xs">
        <span>Growth ${Math.round(health.growthScore)}</span><span>Conversion ${Math.round(health.conversionScore)}</span>
        <span>Follow-up ${Math.round(health.followupScore)}</span><span>Pipeline ${Math.round(health.pipelineScore)}</span>
      </div>
    </section>
  </div>

  <div class="grid lg:grid-cols-3 gap-4 mb-5">
    ${ciPanel('Management priorities','Automatically selected from current risk and opportunity data',
      `<div class="space-y-3">${intel.actions.map((action,index)=>`<div class="flex gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200">
        <span class="w-7 h-7 rounded-full bg-olive-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">${index+1}</span>
        <div><p class="font-semibold text-sm">${ciEsc(action.title)}</p><p class="text-xs text-gray-500 mt-1">${ciEsc(action.detail)}</p></div>
      </div>`).join('')}</div>`,'lg:col-span-1')}
    ${ciPanel('Largest opportunities','Evidence that can support commercial decisions',
      `<div class="space-y-3">${intel.opportunities.length?intel.opportunities.map(item=>ciStatusCard(item.title,'',item.detail,item.severity)).join(''):'<p class="text-sm text-gray-400">More qualified data is needed before opportunities can be ranked.</p>'}</div>`)}
    ${ciPanel('Commercial risks','Issues that could weaken revenue or forecast confidence',
      `<div class="space-y-3">${intel.risks.length?intel.risks.map(item=>ciStatusCard(item.title,'',item.detail,item.severity)).join(''):'<div class="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">No significant live commercial exceptions detected.</div>'}</div>`)}
  </div>

  <div class="grid lg:grid-cols-2 gap-4">
    ${ciPanel('Performance context',ciYearLabel(),`
      <div class="grid grid-cols-2 gap-3">
        ${ciStatusCard('Best recorded month',bestMonth?.month||'—',bestMonth?ciMoney(bestMonth.currentRevenue):'No monthly data','green')}
        ${ciStatusCard('Lowest recorded month',weakestMonth?.month||'—',weakestMonth?ciMoney(weakestMonth.currentRevenue):'No monthly data','amber')}
        ${ciStatusCard('Event volume',Math.round(a.currentFigures.events),`${ciSignedPct(a.eventGrowth)} vs ${a.previous}`,a.eventGrowth>=0?'green':'amber')}
        ${ciStatusCard('Average event value',ciMoney(a.currentAverage),`${ciSignedPct(a.previousAverage?(a.currentAverage-a.previousAverage)/a.previousAverage*100:0)} vs ${a.previous}`,a.currentAverage>=a.previousAverage?'green':'amber')}
      </div>`)}
    ${ciPanel('Data confidence','How reliable the current management view is',`
      <div class="space-y-3">
        ${ciBar('Enquiries with values',d.enquiries.length-d.noEnquiryValue.length,Math.max(d.enquiries.length,1),`${d.enquiries.length-d.noEnquiryValue.length}/${d.enquiries.length}`)}
        ${ciBar('Live enquiries controlled',d.live.length-d.noFollowup.length-d.overdueEnquiries.length,Math.max(d.live.length,1),`${Math.max(0,d.live.length-d.noFollowup.length-d.overdueEnquiries.length)}/${d.live.length}`)}
        ${ciBar('Qualified opportunities controlled',d.openOpps.length-d.noOppAction.length,Math.max(d.openOpps.length,1),`${Math.max(0,d.openOpps.length-d.noOppAction.length)}/${d.openOpps.length}`)}
      </div>
      <p class="text-xs text-gray-500 mt-4">Forecasts become more reliable when values, next actions, probabilities and close dates are consistently recorded.</p>`)}
  </div>`;
}

function renderRevenueAnalysisTab(){
  const a=ciAnnual(),d=ciDataset(),months=ciReportMonthData();
  const target=intelligenceTargetRevenue;
  const confirmed=a.currentFigures.revenue;
  const weighted=d.weightedPipeline;
  const forecast=confirmed+weighted;
  const remaining=Math.max(0,target-confirmed);
  const avg=a.currentAverage||1;
  const bookingsNeeded=Math.ceil(remaining/avg);
  const currentMonth=new Date().getMonth()+1;
  const monthsRemaining=Math.max(1,12-currentMonth+1);
  const monthlyRunRate=remaining/monthsRemaining;
  const best=[...months].sort((x,y)=>y.currentRevenue-x.currentRevenue)[0];
  const decline=[...months].sort((x,y)=>(x.currentRevenue-x.previousRevenue)-(y.currentRevenue-y.previousRevenue))[0];
  const max=Math.max(...months.flatMap(m=>[m.previousRevenue,m.currentRevenue]),1);
  return `${ciReportHeader('REVENUE INTELLIGENCE','Revenue, pace and target control',`Tracks ${a.current} against ${a.previous}, current target and qualified forecast.`)}
  <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
    ${ciKpi('Reported Revenue',ciMoney(confirmed),`${ciSignedPct(a.revenueGrowth)} year on year`,'pound-sterling',a.revenueGrowth>=0?'green':'red')}
    ${ciKpi('Annual Target',ciMoney(target),'Editable within this report','target','blue')}
    ${ciKpi('Target Completion',ciPct(target?confirmed/target*100:0),`${ciMoney(remaining)} remaining`,'gauge','olive')}
    ${ciKpi('Weighted Pipeline',ciMoney(weighted),`${d.openOpps.length} qualified open deals`,'briefcase','purple')}
    ${ciKpi('Forecast Total',ciMoney(forecast),forecast>=target?'Above target forecast':'Below target forecast','telescope',forecast>=target?'green':'amber')}
    ${ciKpi('Bookings Required',bookingsNeeded,`At current average ${ciMoney(avg)}`,'calendar-plus','amber')}
    ${ciKpi('Monthly Run Rate Needed',ciMoney(monthlyRunRate),`${monthsRemaining} month${monthsRemaining===1?'':'s'} remaining`,'timer','blue')}
    ${ciKpi('Average Event Value',ciMoney(a.currentAverage),`${ciSignedPct(a.previousAverage?(a.currentAverage-a.previousAverage)/a.previousAverage*100:0)} vs ${a.previous}`,'circle-pound-sterling',a.currentAverage>=a.previousAverage?'green':'amber')}
  </div>

  <div class="grid xl:grid-cols-[1fr_340px] gap-4 mb-5">
    ${ciPanel('Monthly revenue comparison',ciYearLabel(),`
      <div class="h-64 flex items-end gap-2">
        ${months.map(m=>`<div class="flex-1 h-full flex items-end justify-center gap-1 group" title="${ciEsc(m.month)}">
          <div class="w-[38%] bg-olive-200 rounded-t" style="height:${m.previousRevenue/max*100}%"></div>
          <div class="w-[38%] ${m.currentRevenue>=m.previousRevenue?'bg-olive-700':'bg-red-400'} rounded-t" style="height:${m.currentRevenue/max*100}%"></div>
        </div>`).join('')}
      </div>
      <div class="flex gap-2 mt-2">${months.map(m=>`<span class="flex-1 text-center text-[12px] text-gray-500">${m.month.slice(0,3)}</span>`).join('')}</div>
      <div class="flex gap-4 text-xs mt-4"><span><i class="inline-block w-3 h-3 rounded bg-olive-200 mr-1"></i>${a.previous}</span><span><i class="inline-block w-3 h-3 rounded bg-olive-700 mr-1"></i>${a.current}</span></div>`)}
    <div class="space-y-4">
      ${ciPanel('Target assumptions','Adjust the planning scenario',`
        <label class="block text-xs font-medium text-gray-600">Annual revenue target
          <input type="number" value="${target}" onchange="intelligenceTargetRevenue=Number(this.value||0);localStorage.setItem('windmill_report_target_revenue',intelligenceTargetRevenue);renderSection()" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm">
        </label>`)}
      ${ciPanel('Management insight','Revenue focus',`
        <div class="space-y-3">
          ${ciStatusCard('Strongest month',best?.month||'—',best?ciMoney(best.currentRevenue):'No data','green')}
          ${ciStatusCard('Largest negative variance',decline?.month||'—',decline?ciSignedMoney(decline.currentRevenue-decline.previousRevenue):'No data',decline&&decline.currentRevenue<decline.previousRevenue?'red':'green')}
          ${ciStatusCard('Target position',forecast>=target?'Forecast to exceed target':'Further revenue required',forecast>=target?`Forecast headroom ${ciMoney(forecast-target)}`:`Forecast gap ${ciMoney(target-forecast)}`,forecast>=target?'green':'amber')}
        </div>`)}
    </div>
  </div>

  ${ciPanel('Monthly decision table','Revenue, event volume, average value and management interpretation',`
    <div class="overflow-x-auto"><table class="w-full text-xs min-w-[980px]">
      <thead><tr class="text-left text-gray-500"><th class="py-2">Month</th><th class="text-right">${a.previous} Revenue</th><th class="text-right">${a.current} Revenue</th><th class="text-right">Variance</th><th class="text-right">${a.current} Events</th><th class="text-right">Average Value</th><th class="pl-4">Recommended Focus</th></tr></thead>
      <tbody>${months.map(m=>{
        const variance=m.currentRevenue-m.previousRevenue;
        const average=m.currentEvents?m.currentRevenue/m.currentEvents:0;
        const recommendation=variance>5000?'Protect capacity and maintain pricing':variance< -3000?'Review demand, availability, pricing and sales activity':'Maintain and seek incremental growth';
        return `<tr class="border-t border-gray-100"><td class="py-2 font-medium">${ciEsc(m.month)}</td><td class="text-right">${ciMoney(m.previousRevenue)}</td><td class="text-right">${ciMoney(m.currentRevenue)}</td><td class="text-right ${ciTone(variance)}">${ciSignedMoney(variance)}</td><td class="text-right">${m.currentEvents}</td><td class="text-right">${ciMoney(average)}</td><td class="pl-4">${ciEsc(recommendation)}</td></tr>`;
      }).join('')}</tbody>
    </table></div>`)}
  `;
}

function renderEventTypePerformance(){
  const a=ciAnnual();
  const rows=ciReportTypeData().map(row=>{
    const variance=row.currentRevenue-row.previousRevenue;
    const growth=row.comparable
      ? (row.previousRevenue?variance/row.previousRevenue*100:row.currentRevenue?100:0)
      : 0;
    const avgCurrent=row.currentEvents?row.currentRevenue/row.currentEvents:0;
    const avgPrevious=row.previousEvents?row.previousRevenue/row.previousEvents:0;
    const volumeGrowth=row.comparable
      ? (row.previousEvents?(row.currentEvents-row.previousEvents)/row.previousEvents*100:row.currentEvents?100:0)
      : 0;
    let strategy='Maintain';
    let tone='blue';

    if(!row.comparable){strategy='Data incomplete';tone='amber';}
    else if(growth>=15&&avgCurrent>=avgPrevious){strategy='Grow';tone='green';}
    else if(growth< -10&&avgCurrent<avgPrevious){strategy='Review proposition';tone='red';}
    else if(row.currentEvents<row.previousEvents&&avgCurrent>avgPrevious){strategy='Protect value, rebuild volume';tone='amber';}
    else if(row.currentEvents>row.previousEvents&&avgCurrent<avgPrevious){strategy='Review pricing';tone='amber';}
    else if(row.currentRevenue>=50000){strategy='Protect';tone='green';}

    return {...row,variance,growth,avgCurrent,avgPrevious,volumeGrowth,strategy,tone};
  });
  const max=Math.max(...rows.map(r=>r.currentRevenue),1);
  return `${ciReportHeader('EVENT INTELLIGENCE','Event category performance',`Identifies which event types to grow, protect, reprice or review using ${ciYearLabel()} performance.`)}
  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
    ${rows.map(row=>`<article class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div class="flex justify-between gap-3"><div><p class="text-xs text-gray-500">EVENT TYPE</p><h3 class="font-bold text-xl mt-1">${ciEsc(row.type)}</h3></div>${ciBadge(row.strategy,row.tone)}</div>
      <p class="text-2xl font-bold mt-4">${ciMoney(row.currentRevenue)}</p>
      <div class="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden"><div class="h-2 bg-olive-700 rounded-full" style="width:${row.currentRevenue/max*100}%"></div></div>
      <div class="grid grid-cols-2 gap-3 mt-4 text-xs">
        <div><p class="text-gray-500">Bookings</p><p class="font-bold">${row.currentEvents} <span class="${ciTone(row.currentEvents-row.previousEvents)}">${row.currentEvents-row.previousEvents>=0?'+':''}${row.currentEvents-row.previousEvents}</span></p></div>
        <div><p class="text-gray-500">Average Value</p><p class="font-bold">${ciMoney(row.avgCurrent)}</p></div>
        <div><p class="text-gray-500">Revenue Growth</p><p class="font-bold ${ciTone(row.growth)}">${ciSignedPct(row.growth)}</p></div>
        <div><p class="text-gray-500">Volume Growth</p><p class="font-bold ${ciTone(row.volumeGrowth)}">${ciSignedPct(row.volumeGrowth)}</p></div>
      </div>
      <p class="text-xs text-gray-500 mt-4">${row.strategy==='Data incomplete'
        ? `A year-on-year judgement has been withheld. ${row.previousSource}; ${row.currentSource}.`
        : row.strategy==='Grow'?'Demand and value are both improving. Protect standards while increasing targeted sales activity.'
        : row.strategy==='Review proposition'?'Both revenue and average value are weakening. Review package, positioning and market demand.'
        : row.strategy==='Protect value, rebuild volume'?'Fewer bookings are being offset by stronger value. Retain pricing while rebuilding lead volume.'
        : row.strategy==='Review pricing'?'Booking volume is increasing but average value is falling. Check discounting and package mix.'
        :'Performance is stable; seek controlled incremental improvement.'}</p>
    </article>`).join('')}
  </div>
  ${ciPanel('Event type comparison',ciYearLabel(),`<div class="overflow-x-auto"><table class="w-full text-xs min-w-[1000px]"><thead><tr class="text-left text-gray-500"><th class="py-2">Type</th><th class="text-right">${a.previous} Events</th><th class="text-right">${a.current} Events</th><th class="text-right">${a.previous} Revenue</th><th class="text-right">${a.current} Revenue</th><th class="text-right">Revenue Variance</th><th class="text-right">Average Value</th><th class="pl-4">Strategy</th></tr></thead><tbody>${rows.map(row=>`<tr class="border-t border-gray-100"><td class="py-2 font-medium">${ciEsc(row.type)}<span class="block text-[12px] font-normal text-gray-400">${ciEsc(row.previousSource)} · ${ciEsc(row.currentSource)}</span></td><td class="text-right">${row.previousEvents}</td><td class="text-right">${row.currentEvents}</td><td class="text-right">${ciMoney(row.previousRevenue)}</td><td class="text-right">${ciMoney(row.currentRevenue)}</td><td class="text-right ${row.comparable?ciTone(row.variance):'text-gray-400'}">${row.comparable?ciSignedMoney(row.variance):'Not comparable'}</td><td class="text-right">${ciMoney(row.avgCurrent)}</td><td class="pl-4">${ciBadge(row.strategy,row.tone)}</td></tr>`).join('')}</tbody></table></div>`)}
  `;
}

function ciEnquiryStageOrder(){
  return ['New Enquiry','Contacted','Brochure Sent','Viewing Offered','Viewing Booked','Viewing Completed','Quote Sent','Provisional Booking','Deposit Required','Confirmed Booking'];
}
function renderCRMSalesPerformance(){
  const d=ciDataset();
  if(!d.enquiries.length)return commercialReportEmpty('Sales Intelligence','No enquiries have loaded yet.');
  const order=ciEnquiryStageOrder();
  const rows=order.map(status=>{
    const matches=d.enquiries.filter(e=>e.status===status);
    return {status,count:matches.length,value:ciSum(matches,ciEnquiryValue)};
  });
  const max=Math.max(...rows.map(r=>r.count),1);
  const leaks=[];
  for(let i=0;i<rows.length-1;i++){
    const from=rows[i],to=rows[i+1];
    if(from.count>0){
      const rate=to.count/from.count*100;
      leaks.push({from:from.status,to:to.status,rate,drop:from.count-to.count});
    }
  }
  const biggestLeak=[...leaks].sort((x,y)=>x.rate-y.rate)[0];
  const ageing=d.live.map(e=>({row:e,days:ciDaysBetween(e.enquiryDate||e.createdAt||e.created_at,d.today)})).filter(x=>x.days!==null);
  const oldest=[...ageing].sort((x,y)=>y.days-x.days).slice(0,5);
  return `${ciReportHeader('SALES INTELLIGENCE','Enquiry conversion and pipeline control','Shows funnel movement, current value, forecast confidence and the biggest conversion leak.')}
  <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
    ${ciKpi('Total Enquiries',d.enquiries.length,'All current records','inbox','blue')}
    ${ciKpi('Live Enquiries',d.live.length,ciMoney(ciSum(d.live,ciEnquiryValue))+' live value','activity','olive')}
    ${ciKpi('Confirmed',d.confirmed.length,ciMoney(d.confirmedCrm)+' CRM value','check-circle-2','green')}
    ${ciKpi('Lost',d.lost.length,ciMoney(ciSum(d.lost,ciEnquiryValue))+' recorded lost value','circle-x','red')}
    ${ciKpi('Conversion',ciPct(d.conversion),'Confirmed ÷ confirmed plus lost','percent','purple')}
    ${ciKpi('Overdue Follow-ups',d.overdueEnquiries.length,'Live enquiries past next-action date','clock-alert',d.overdueEnquiries.length?'red':'green')}
    ${ciKpi('No Next Action',d.noFollowup.length,'Live enquiries without follow-up date','calendar-x',d.noFollowup.length?'red':'green')}
    ${ciKpi('Missing Values',d.noEnquiryValue.length,'Weakens pipeline and loss reporting','badge-pound-sterling',d.noEnquiryValue.length?'amber':'green')}
  </div>
  <div class="grid xl:grid-cols-[1.3fr_.7fr] gap-4 mb-5">
    ${ciPanel('Enquiry funnel','Current records by status',`<div class="space-y-4">${rows.map(row=>ciBar(row.status,row.count,max,`${row.count}`,ciMoney(row.value))).join('')}</div>`)}
    <div class="space-y-4">
      ${ciPanel('Biggest funnel leak','Rule-based conversion diagnosis',biggestLeak?`
        <p class="text-2xl font-bold">${ciEsc(biggestLeak.from)} → ${ciEsc(biggestLeak.to)}</p>
        <p class="text-sm text-gray-600 mt-2">Observed stage ratio: <strong>${ciPct(biggestLeak.rate)}</strong>.</p>
        <div class="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          Confirm that records progress consistently through statuses before treating this as a true conversion rate. Where valid, introduce a defined follow-up standard at this stage.
        </div>`:'<p class="text-sm text-gray-400">More staged enquiry data is needed.</p>')}
      ${ciPanel('Forecast confidence','Operational controls',`
        <div class="space-y-3">
          ${ciBar('Follow-up coverage',d.live.length-d.noFollowup.length,Math.max(d.live.length,1),`${Math.max(0,d.live.length-d.noFollowup.length)}/${d.live.length}`)}
          ${ciBar('On-time follow-ups',d.live.length-d.overdueEnquiries.length,Math.max(d.live.length,1),`${Math.max(0,d.live.length-d.overdueEnquiries.length)}/${d.live.length}`)}
          ${ciBar('Value coverage',d.enquiries.length-d.noEnquiryValue.length,Math.max(d.enquiries.length,1),`${Math.max(0,d.enquiries.length-d.noEnquiryValue.length)}/${d.enquiries.length}`)}
        </div>`)}
    </div>
  </div>
  ${window.EnquiryReportingIntelligence?(()=>{
    const ri=EnquiryReportingIntelligence;
    const funnel=ri.funnel(d.enquiries);
    const response=ri.responseMetrics(d.enquiries);
    const stageHealth=ri.stageHealth(d.enquiries);
    const maxF=Math.max(...funnel.map(x=>x.count),1);
    const maxS=Math.max(...stageHealth.map(x=>x.stuckValue),1);
    return `<div class="grid xl:grid-cols-2 gap-4 mb-5">
      ${ciPanel('Milestone funnel','Based on actual activity/history and current stage',`<div class="space-y-4">${funnel.map((row,i)=>{
        const prev=i?funnel[i-1].count:null;
        const rate=prev?row.count/prev*100:100;
        return ciBar(row.label,row.count,maxF,`${row.count}`,i?`${ciPct(rate)} reached from prior milestone`:ciMoney(row.value));
      }).join('')}</div><p class="text-[11px] text-gray-400 mt-4">This is more reliable than comparing current-status column counts because it recognises milestones already reached in activity history.</p>`)}
      ${ciPanel('First-response discipline','Measures enquiry date to first recorded contact',`
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-cream-50 p-4"><p class="text-xs text-gray-500">Average response</p><p class="text-2xl font-bold mt-1">${response.average===null?'—':response.average.toFixed(1)+' days'}</p></div>
          <div class="rounded-xl bg-cream-50 p-4"><p class="text-xs text-gray-500">Within 1 day</p><p class="text-2xl font-bold mt-1">${ciPct(response.oneDayPct)}</p></div>
          <div class="rounded-xl bg-cream-50 p-4"><p class="text-xs text-gray-500">Same day</p><p class="text-2xl font-bold mt-1">${ciPct(response.sameDayPct)}</p></div>
          <div class="rounded-xl ${response.missing?'bg-red-50 border border-red-200':'bg-green-50 border border-green-200'} p-4"><p class="text-xs text-gray-500">Missing first-contact data</p><p class="text-2xl font-bold mt-1">${response.missing}</p></div>
        </div>
        <p class="text-[11px] text-gray-400 mt-4">${response.measured} of ${d.enquiries.length} enquiries currently have measurable first-contact timing.</p>`)}
    </div>
    ${ciPanel('Where pipeline is stalling','Open-stage risk ranked by potential value',stageHealth.length?`<div class="space-y-4">${stageHealth.map(r=>ciBar(r.stage,r.stuckValue,maxS,ciMoney(r.stuckValue),`${r.stuck}/${r.count} need movement${r.avgAge!==null?` · ${r.avgAge}d avg age`:''}`,r.stuck?'bg-amber-500':'bg-green-500')).join('')}</div>`:'<p class="text-sm text-gray-400">No live pipeline health data available.</p>')}
    `;
  })():''}
  ${ciPanel('Oldest live enquiries','Items most at risk of becoming dormant',oldest.length?`<div class="overflow-x-auto"><table class="w-full text-xs min-w-[760px]"><thead><tr class="text-left text-gray-500"><th class="py-2">Enquiry</th><th>Status</th><th class="text-right">Value</th><th class="text-right">Age</th><th>Owner</th><th>Next Follow-up</th></tr></thead><tbody>${oldest.map(({row,days})=>`<tr class="border-t border-gray-100"><td class="py-2 font-medium">${ciEsc(row.name||row.client||row.couple||'Unnamed')}</td><td>${ciEsc(row.status||'')}</td><td class="text-right">${ciMoney(ciEnquiryValue(row))}</td><td class="text-right">${days} days</td><td>${ciEsc(ciOwner(row))}</td><td>${ciEsc(ciDate(row.nextFollowup||row.next_followup)||'Missing')}</td></tr>`).join('')}</tbody></table></div>`:'<p class="text-sm text-gray-400">No age data available for live enquiries.</p>')}
  `;
}

function renderLeadSourcesTab(){
  const d=ciDataset();
  const groups=ciGroup(d.enquiries,e=>e.source||'Not Recorded',ciEnquiryValue);
  const rows=Object.entries(groups).map(([source,g])=>{
    const confirmed=g.rows.filter(ciConfirmed),lost=g.rows.filter(ciLost),decided=confirmed.length+lost.length;
    const response=window.EnquiryReportingIntelligence?EnquiryReportingIntelligence.responseMetrics(g.rows):{average:null,oneDayPct:0};
    const atRisk=window.EnquiryReportingIntelligence?g.rows.filter(e=>ciLive(e)&&['urgent','stuck','risk'].includes((window.EnquiryPipelineHealth?.info?EnquiryPipelineHealth.info(e):window.EnquirySalesCommand?.health?EnquirySalesCommand.health(e):{key:'healthy'}).key)).length:0;
    return {source,total:g.count,value:g.value,confirmed:confirmed.length,lost:lost.length,conversion:decided?confirmed.length/decided*100:0,confirmedValue:ciSum(confirmed,ciEnquiryValue),average:confirmed.length?ciSum(confirmed,ciEnquiryValue)/confirmed.length:0,responseDays:response.average,oneDayPct:response.oneDayPct,atRisk};
  }).sort((x,y)=>y.confirmedValue-x.confirmedValue||y.total-x.total);
  const max=Math.max(...rows.map(r=>r.confirmedValue),1);
  const bestQuality=[...rows].filter(r=>r.confirmed+r.lost>=3).sort((x,y)=>y.conversion-x.conversion)[0];
  const bestRevenue=rows[0];
  return `${ciReportHeader('LEAD INTELLIGENCE','Source quality and revenue contribution','Ranks sources by enquiry volume, conversion, confirmed value and average booking value.')}
  <div class="grid md:grid-cols-3 gap-4 mb-5">
    ${ciStatusCard('Highest confirmed revenue',bestRevenue?.source||'—',bestRevenue?`${ciMoney(bestRevenue.confirmedValue)} from ${bestRevenue.confirmed} booking${bestRevenue.confirmed===1?'':'s'}`:'No data','green')}
    ${ciStatusCard('Best conversion quality',bestQuality?.source||'Not enough decisions',bestQuality?`${ciPct(bestQuality.conversion)} conversion from decided enquiries`:'At least three decided enquiries are required','blue')}
    ${ciStatusCard('Sources tracked',rows.length,`${d.enquiries.length} enquiries analysed`,'olive')}
  </div>
  <div class="grid xl:grid-cols-[.8fr_1.2fr] gap-4">
    ${ciPanel('Confirmed revenue by source','Commercial contribution rather than enquiry count',`<div class="space-y-4">${rows.map(r=>ciBar(r.source,r.confirmedValue,max,ciMoney(r.confirmedValue),`${r.confirmed} confirmed · ${ciPct(r.conversion)} conversion`)).join('')||'<p class="text-sm text-gray-400">No source data available.</p>'}</div>`)}
    ${ciPanel('Source decision table','Use this to decide where marketing and sales time should be focused',`<div class="overflow-x-auto"><table class="w-full text-xs min-w-[880px]"><thead><tr class="text-left text-gray-500"><th class="py-2">Source</th><th class="text-right">Enquiries</th><th class="text-right">Confirmed</th><th class="text-right">Lost</th><th class="text-right">Conversion</th><th class="text-right">Confirmed Value</th><th class="text-right">Average Value</th><th class="text-right">Avg Response</th><th class="text-right">≤1 Day</th><th class="text-right">At Risk</th><th class="pl-4">Interpretation</th></tr></thead><tbody>${rows.map(r=>{
      const interpretation=r.confirmedValue===0?'Needs qualification or insufficient decisions':r.conversion>=40&&r.average>0?'High-quality source — protect and scale':r.conversion<20&&r.total>=5?'High volume but weak conversion — review targeting':r.average>0?'Develop and monitor':'Insufficient value data';
      return `<tr class="border-t border-gray-100"><td class="py-2 font-medium">${ciEsc(r.source)}</td><td class="text-right">${r.total}</td><td class="text-right">${r.confirmed}</td><td class="text-right">${r.lost}</td><td class="text-right">${ciPct(r.conversion)}</td><td class="text-right">${ciMoney(r.confirmedValue)}</td><td class="text-right">${ciMoney(r.average)}</td><td class="text-right">${r.responseDays===null?'—':r.responseDays.toFixed(1)+'d'}</td><td class="text-right">${ciPct(r.oneDayPct)}</td><td class="text-right ${r.atRisk?'text-amber-600 font-bold':''}">${r.atRisk}</td><td class="pl-4">${ciEsc(interpretation)}</td></tr>`;
    }).join('')}</tbody></table></div>`)}
  </div>`;
}

function renderLostEnquiriesTab(){
  const d=ciDataset();
  const groups=ciGroup(d.lost,e=>e.lostReason||e.lost_reason||'Other',ciEnquiryValue);
  const rows=Object.entries(groups).map(([reason,g])=>({reason,count:g.count,value:g.value,average:g.count?g.value/g.count:0,action:typeof reportLostAction==='function'?reportLostAction(reason):'Review recurring causes and define a response.'})).sort((x,y)=>y.value-x.value||y.count-x.count);
  const totalValue=ciSum(d.lost,ciEnquiryValue),totalCount=d.lost.length;
  const recoverable=totalValue*intelligenceRecoveryRate/100;
  const bookingsRecovered=rows.length&&rows[0].average?Math.round(recoverable/rows[0].average):0;
  const max=Math.max(...rows.map(r=>r.value),1);
  return `${ciReportHeader('LOST BUSINESS INTELLIGENCE','Lost value, objections and recovery opportunity','Focuses on the commercial value behind lost enquiries, not only the number of losses.')}
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
    ${ciKpi('Lost Enquiries',totalCount,'Current records marked lost','circle-x','red')}
    ${ciKpi('Recorded Lost Value',ciMoney(totalValue),'Only records with a value contribute','pound-sterling','red')}
    ${ciKpi('Average Lost Value',ciMoney(totalCount?totalValue/totalCount:0),'Average recorded value per lost enquiry','calculator','amber')}
    ${ciKpi(`${intelligenceRecoveryRate}% Recovery Scenario`,ciMoney(recoverable),`${bookingsRecovered||'—'} equivalent booking${bookingsRecovered===1?'':'s'}`,'rotate-ccw','green')}
  </div>
  <div class="grid xl:grid-cols-[.75fr_1.25fr] gap-4 mb-5">
    ${ciPanel('Lost value by reason','Prioritised by revenue value',`<div class="space-y-4">${rows.map(r=>ciBar(r.reason,r.value,max,ciMoney(r.value),`${r.count} loss${r.count===1?'':'es'}`,'bg-red-500')).join('')||'<p class="text-sm text-gray-400">No lost enquiries recorded.</p>'}</div>`)}
    ${ciPanel('Objection response plan','Suggested management response based on the recorded reason',`<div class="overflow-x-auto"><table class="w-full text-xs min-w-[800px]"><thead><tr class="text-left text-gray-500"><th class="py-2">Reason</th><th class="text-right">Count</th><th class="text-right">Value</th><th class="pl-4">Recommended Response</th></tr></thead><tbody>${rows.map(r=>`<tr class="border-t border-gray-100"><td class="py-2 font-medium">${ciEsc(r.reason)}</td><td class="text-right">${r.count}</td><td class="text-right">${ciMoney(r.value)}</td><td class="pl-4">${ciEsc(r.action)}</td></tr>`).join('')}</tbody></table></div>`)}
  </div>
  ${window.EnquiryReportingIntelligence?(()=>{
    const cross=EnquiryReportingIntelligence.lostCross(d.enquiries).slice(0,12);
    return ciPanel('Lost reasons by event type','Shows where objections are actually occurring',cross.length?`<div class="overflow-x-auto"><table class="w-full text-xs min-w-[760px]"><thead><tr class="text-left text-gray-500"><th class="py-2">Lost reason</th><th>Event type</th><th class="text-right">Count</th><th class="text-right">Lost value</th></tr></thead><tbody>${cross.map(r=>`<tr class="border-t border-gray-100"><td class="py-2 font-medium">${ciEsc(r.reason)}</td><td>${ciEsc(r.type)}</td><td class="text-right">${r.count}</td><td class="text-right">${ciMoney(r.value)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="text-sm text-gray-400">No cross-analysis available.</p>');
  })():''}
  ${ciPanel('Recovery sensitivity','Model a modest reduction in avoidable lost business',`
    <div class="grid md:grid-cols-[260px_1fr] gap-5 items-center">
      <label class="text-xs font-medium text-gray-600">Recovery assumption
        <input type="range" min="0" max="30" step="1" value="${intelligenceRecoveryRate}" oninput="this.nextElementSibling.textContent=this.value+'%'" onchange="intelligenceRecoveryRate=Number(this.value);localStorage.setItem('windmill_report_recovery_rate',intelligenceRecoveryRate);renderSection()" class="mt-3 w-full">
        <span class="block font-bold text-lg mt-2">${intelligenceRecoveryRate}%</span>
      </label>
      <div class="rounded-xl bg-green-50 border border-green-200 p-5">
        <p class="text-xs text-green-700">ILLUSTRATIVE REVENUE RECOVERY</p>
        <p class="text-3xl font-bold text-green-900 mt-1">${ciMoney(recoverable)}</p>
        <p class="text-sm text-green-800 mt-2">This is a sensitivity scenario, not a forecast. It assumes the selected share of currently recorded lost value could be prevented through availability alternatives, stronger objection handling or better follow-up.</p>
      </div>
    </div>`)}
  `;
}

function ciTeamRows(){
  const d=ciDataset(),owners=new Set();
  [...d.enquiries,...d.leads,...d.opportunities,...d.salesActivities,...d.opportunityActivities].forEach(row=>owners.add(ciOwner(row)));
  owners.delete('');
  return [...owners].map(owner=>{
    const enquiries=d.enquiries.filter(e=>ciOwner(e)===owner);
    const confirmed=enquiries.filter(ciConfirmed),lost=enquiries.filter(ciLost),live=enquiries.filter(ciLive);
    const leads=d.leads.filter(l=>ciOwner(l)===owner);
    const opps=d.opportunities.filter(o=>ciOwner(o)===owner);
    const open=opps.filter(ciOpenOpportunity),won=opps.filter(ciWonOpportunity);
    const activities=[...d.salesActivities,...d.opportunityActivities].filter(a=>ciOwner(a)===owner);
    const calls=activities.filter(a=>/call/i.test(String(a.type||a.activityType||''))).length;
    const meetings=activities.filter(a=>/meeting|visit/i.test(String(a.type||a.activityType||''))).length;
    const proposals=activities.filter(a=>/proposal/i.test(String(a.type||a.activityType||a.outcome||''))).length;
    const revenue=ciSum(confirmed,ciEnquiryValue)+ciSum(won,ciOpportunityValue);
    const decided=confirmed.length+lost.length;
    const conversion=decided?confirmed.length/decided*100:0;
    const overdue=live.filter(e=>ciDate(e.nextFollowup||e.next_followup)&&ciDate(e.nextFollowup||e.next_followup)<d.today).length+
      open.filter(o=>ciDate(o.nextFollowup||o.next_followup)&&ciDate(o.nextFollowup||o.next_followup)<d.today).length;
    let coaching='Build a consistent activity and data record.';
    if(revenue>0&&activities.length<10)coaching='Strong outcome value; increase recorded outbound activity to improve repeatability.';
    if(activities.length>=10&&conversion<25&&decided>=3)coaching='Activity is present but conversion is weak; review qualification and proposal follow-up.';
    if(conversion>=50&&activities.length>=5)coaching='Strong conversion; protect standards and increase quality pipeline volume.';
    if(overdue>0)coaching=`Clear ${overdue} overdue action${overdue===1?'':'s'} before adding more pipeline.`;
    return {owner,enquiries:enquiries.length,live:live.length,confirmed:confirmed.length,lost:lost.length,conversion,leads:leads.length,calls,meetings,proposals,activities:activities.length,revenue,pipeline:ciSum(open,ciOpportunityValue),won:won.length,overdue,coaching};
  }).sort((x,y)=>y.revenue-x.revenue||y.activities-x.activities);
}
function renderSalesTeamPerformanceReport(){
  const rows=ciTeamRows();
  if(!rows.length)return commercialReportEmpty('Team Intelligence','No staff-owned sales records exist yet.');
  const topRevenue=rows[0],topActivity=[...rows].sort((x,y)=>y.activities-x.activities)[0],topConversion=[...rows].filter(r=>r.confirmed+r.lost>=3).sort((x,y)=>y.conversion-x.conversion)[0];
  return `${ciReportHeader('TEAM INTELLIGENCE','Revenue ownership, activity and coaching','Designed to support capacity and coaching decisions rather than a simplistic league table.')}
  <div class="grid md:grid-cols-3 gap-4 mb-5">
    ${ciStatusCard('Highest attributed revenue',topRevenue.owner,ciMoney(topRevenue.revenue),'green')}
    ${ciStatusCard('Most recorded activity',topActivity.owner,`${topActivity.activities} actions`,'blue')}
    ${ciStatusCard('Strongest conversion',topConversion?.owner||'Insufficient decisions',topConversion?ciPct(topConversion.conversion):'At least three decided enquiries required','olive')}
  </div>
  <div class="grid xl:grid-cols-2 gap-4">
    ${rows.map(row=>`<article class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div class="flex justify-between gap-3"><div><p class="text-xs text-gray-500">TEAM MEMBER</p><h3 class="font-bold text-xl mt-1">${ciEsc(row.owner)}</h3></div>${row.overdue?ciBadge(`${row.overdue} overdue`,'red'):ciBadge('Controlled','green')}</div>
      <div class="grid grid-cols-3 gap-3 mt-4 text-center">
        <div class="rounded-lg bg-cream-50 p-3"><p class="text-[12px] text-gray-500">Revenue</p><p class="font-bold">${ciMoney(row.revenue)}</p></div>
        <div class="rounded-lg bg-cream-50 p-3"><p class="text-[12px] text-gray-500">Pipeline</p><p class="font-bold">${ciMoney(row.pipeline)}</p></div>
        <div class="rounded-lg bg-cream-50 p-3"><p class="text-[12px] text-gray-500">Conversion</p><p class="font-bold">${ciPct(row.conversion)}</p></div>
      </div>
      <div class="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
        <div><p class="text-gray-400">Calls</p><strong>${row.calls}</strong></div><div><p class="text-gray-400">Meetings</p><strong>${row.meetings}</strong></div><div><p class="text-gray-400">Proposals</p><strong>${row.proposals}</strong></div><div><p class="text-gray-400">Wins</p><strong>${row.won}</strong></div>
      </div>
      <div class="mt-4 rounded-xl bg-olive-50 border border-olive-100 p-4"><p class="text-[12px] font-bold tracking-widest text-olive-700">COACHING RECOMMENDATION</p><p class="text-sm mt-1">${ciEsc(row.coaching)}</p></div>
    </article>`).join('')}
  </div
  ${window.EnquiryReportingIntelligence?(()=>{
    const owners=EnquiryReportingIntelligence.ownerRows(ciDataset().enquiries);
    return ciPanel('Enquiry control by owner','Follow-up quality rather than a revenue league table',`<div class="overflow-x-auto"><table class="w-full text-xs min-w-[900px]"><thead><tr class="text-left text-gray-500"><th class="py-2">Owner</th><th class="text-right">Live</th><th class="text-right">Pipeline</th><th class="text-right">No next action</th><th class="text-right">Overdue</th><th class="text-right">At risk / stuck</th><th class="text-right">Avg response</th><th class="text-right">≤1 day</th></tr></thead><tbody>${owners.map(r=>`<tr class="border-t border-gray-100"><td class="py-2 font-medium">${ciEsc(r.name)}</td><td class="text-right">${r.live}</td><td class="text-right">${ciMoney(r.pipeline)}</td><td class="text-right ${r.noAction?'text-red-600 font-bold':''}">${r.noAction}</td><td class="text-right ${r.overdue?'text-red-600 font-bold':''}">${r.overdue}</td><td class="text-right ${r.atRisk?'text-amber-600 font-bold':''}">${r.atRisk}</td><td class="text-right">${r.averageResponse===null?'—':r.averageResponse.toFixed(1)+'d'}</td><td class="text-right">${ciPct(r.oneDayPct)}</td></tr>`).join('')}</tbody></table></div>`);
  })():''}`;
}

function renderCommercialForecast(){
  const d=ciDataset(),a=ciAnnual(),months=ciReportMonthData();
  const currentMonth=new Date().getMonth();
  const elapsed=Math.max(1,currentMonth+1);
  const annualised=a.currentFigures.revenue/elapsed*12;
  const pipelineForecast=a.currentFigures.revenue+d.weightedPipeline;
  const seasonality=months.reduce((sum,m)=>sum+m.currentRevenue,0)||1;
  const nextMonths=months.slice(currentMonth+1);
  const remainingSeasonalShare=nextMonths.reduce((sum,m)=>sum+m.currentRevenue,0)/seasonality;
  const seasonalForecast=a.currentFigures.revenue+(a.currentFigures.revenue/Math.max(0.01,1-remainingSeasonalShare))*remainingSeasonalShare;
  const expected=Math.max(a.currentFigures.revenue,Math.min(Math.max(annualised,pipelineForecast,seasonalForecast),a.currentFigures.revenue+d.openPipeline+d.proactivePipeline*.15));
  const low=a.currentFigures.revenue+d.weightedPipeline*.65;
  const high=a.currentFigures.revenue+d.weightedPipeline+d.proactivePipeline*.15;
  const confidence=ciCommercialHealth().score;
  return `${ciReportHeader('COMMERCIAL FORECAST','Scenario-based year-end outlook','Combines reported performance with probability-weighted opportunity data. Forecasts are directional management scenarios, not guaranteed revenue.')}
  <div class="grid md:grid-cols-3 gap-4 mb-5">
    ${ciStatusCard('Conservative',ciMoney(low),'Reported revenue plus 65% of weighted qualified pipeline','amber')}
    ${ciStatusCard('Expected',ciMoney(expected),'Blended pace, seasonality and qualified pipeline scenario','green')}
    ${ciStatusCard('Strong',ciMoney(high),'Reported revenue plus weighted pipeline and 15% of proactive potential','blue')}
  </div>
  <div class="grid xl:grid-cols-[1fr_360px] gap-4">
    ${ciPanel('Forecast bridge','How the expected scenario is constructed',`
      <div class="space-y-4">
        ${ciBar('Reported revenue',a.currentFigures.revenue,Math.max(expected,1),ciMoney(a.currentFigures.revenue),'Already recorded')}
        ${ciBar('Weighted qualified pipeline',d.weightedPipeline,Math.max(expected,1),ciMoney(d.weightedPipeline),`${d.openOpps.length} open opportunities`,'bg-blue-500')}
        ${ciBar('Proactive upside included',d.proactivePipeline*.15,Math.max(expected,1),ciMoney(d.proactivePipeline*.15),'15% of earlier-stage potential','bg-amber-500')}
      </div>
      <div class="mt-5 rounded-xl bg-charcoal-900 text-white p-5 flex justify-between items-end"><div><p class="text-xs text-gray-300">EXPECTED YEAR-END POSITION</p><p class="text-3xl font-bold mt-1">${ciMoney(expected)}</p></div><span>${ciBadge(`${confidence}% confidence`,confidence>=70?'green':'amber')}</span></div>`)}
    ${ciPanel('Forecast dependencies','Conditions that must hold',`
      <ul class="space-y-3 text-sm text-gray-700">
        <li class="flex gap-2"><i data-lucide="check-circle-2" class="text-green-600 flex-shrink-0" style="width:17px"></i>Opportunity probabilities and values remain current.</li>
        <li class="flex gap-2"><i data-lucide="check-circle-2" class="text-green-600 flex-shrink-0" style="width:17px"></i>Proposal and deposit-stage deals receive timely follow-up.</li>
        <li class="flex gap-2"><i data-lucide="alert-triangle" class="text-amber-600 flex-shrink-0" style="width:17px"></i>Historical figures may include full-year data rather than true YTD recognition.</li>
        <li class="flex gap-2"><i data-lucide="alert-triangle" class="text-amber-600 flex-shrink-0" style="width:17px"></i>Proactive potential is early stage and receives a deliberately low weighting.</li>
      </ul>`)}
  </div>`;
}

function renderInvestmentCaseReport(){
  const d=ciDataset(),a=ciAnnual(),health=ciCommercialHealth(),intel=ciRisksAndActions();
  const investment=intelligenceInvestmentCost;
  const margin=intelligenceGrossMargin/100;
  const qualified=d.openPipeline;
  const weighted=d.weightedPipeline;
  const addressable=weighted+d.proactivePipeline*.15+ciSum(d.lost,ciEnquiryValue)*.10;
  const scenarios=[
    {name:'Conservative',capture:5,tone:'amber'},
    {name:'Expected',capture:10,tone:'green'},
    {name:'Strong',capture:15,tone:'blue'}
  ].map(s=>{
    const revenue=addressable*s.capture/100;
    const contribution=revenue*margin;
    const net=contribution-investment;
    const roi=investment?net/investment*100:0;
    return {...s,revenue,contribution,net,roi};
  });
  const breakEvenRevenue=margin?investment/margin:0;
  const averageBooking=a.currentAverage||1;
  const breakEvenBookings=Math.ceil(breakEvenRevenue/averageBooking);
  const evidence=[
    {title:`${ciSignedPct(a.revenueGrowth)} revenue movement`,detail:`Reported revenue moved from ${ciMoney(a.previousFigures.revenue)} to ${ciMoney(a.currentFigures.revenue)}.`,support:a.revenueGrowth>0},
    {title:`${ciMoney(qualified)} qualified pipeline`,detail:`Across ${d.openOpps.length} open opportunity record${d.openOpps.length===1?'':'s'}.`,support:qualified>0},
    {title:`${ciMoney(d.proactivePipeline)} proactive potential`,detail:`Across ${d.activeLeads.length} active prospect${d.activeLeads.length===1?'':'s'}.`,support:d.proactivePipeline>0},
    {title:`${d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length} control exception${d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length===1?'':'s'}`,detail:'Indicates existing opportunity may not be receiving consistent capacity.',support:d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length>0}
  ];
  const confidence=health.score>=80&&d.openOpps.length>=5?'HIGH':health.score>=55&&(d.openOpps.length||d.activeLeads.length)?'MODERATE':'DEVELOPING';
  const recommendation=confidence==='HIGH'?'Approve a measured investment with quarterly ROI review.':confidence==='MODERATE'?'Approve a 90-day pilot with protected resource, activity targets and a formal review point.':'Improve opportunity values, activity recording and follow-up discipline before committing to a major permanent cost.';
  return `${ciReportHeader('BOARD-READY BUSINESS CASE','Commercial investment case',`Evidence, objections, risk, break-even and sensitivity model using live CRM data and ${ciYearLabel()} performance.`,
    `<button onclick="window.print()" class="px-4 py-2.5 bg-white text-charcoal-900 rounded-lg text-sm font-semibold">Print / Save PDF</button>`)}
  <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
    ${ciKpi('Investment Confidence',confidence,`${health.score}/100 commercial health`,'shield-check',confidence==='HIGH'?'green':confidence==='MODERATE'?'amber':'red')}
    ${ciKpi('Investment Cost',ciMoney(investment),'Editable assumption','wallet-cards','blue')}
    ${ciKpi('Addressable Opportunity',ciMoney(addressable),'Weighted qualified, proactive and recovery opportunity','scan-search','olive')}
    ${ciKpi('Qualified Pipeline',ciMoney(qualified),`${d.openOpps.length} open deals`,'briefcase-business','purple')}
    ${ciKpi('Break-even Revenue',ciMoney(breakEvenRevenue),`At ${ciPct(intelligenceGrossMargin,0)} gross contribution`,'scale','amber')}
    ${ciKpi('Break-even Bookings',breakEvenBookings,`At average ${ciMoney(averageBooking)}`,'calendar-check-2','amber')}
    ${ciKpi('Current Revenue Growth',ciSignedPct(a.revenueGrowth),ciYearLabel(),'trending-up',a.revenueGrowth>=0?'green':'red')}
    ${ciKpi('Control Exceptions',d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length,'Overdue or missing next actions','alert-triangle',d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length?'red':'green')}
  </div>

  <div class="grid xl:grid-cols-[1fr_360px] gap-4 mb-5">
    ${ciPanel('Executive recommendation','Decision supported by current evidence',`
      <div class="rounded-xl bg-charcoal-900 text-white p-5"><p class="text-xs text-olive-200 tracking-widest font-bold">RECOMMENDATION</p><p class="text-xl font-bold mt-2">${ciEsc(recommendation)}</p></div>
      <div class="grid md:grid-cols-2 gap-3 mt-4">${evidence.map(item=>ciStatusCard(item.title,'',item.detail,item.support?'green':'amber')).join('')}</div>`)}
    ${ciPanel('Scenario assumptions','Change these figures to test the case',`
      <div class="space-y-4">
        <label class="block text-xs font-medium text-gray-600">First-year investment cost
          <input type="number" value="${investment}" onchange="intelligenceInvestmentCost=Number(this.value||0);localStorage.setItem('windmill_report_investment_cost',intelligenceInvestmentCost);renderSection()" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm">
        </label>
        <label class="block text-xs font-medium text-gray-600">Gross contribution %
          <input type="number" min="1" max="100" value="${intelligenceGrossMargin}" onchange="intelligenceGrossMargin=Number(this.value||0);localStorage.setItem('windmill_report_gross_margin',intelligenceGrossMargin);renderSection()" class="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm">
        </label>
        <p class="text-xs text-gray-500">Use contribution rather than revenue alone when judging whether the investment pays back.</p>
      </div>`)}
  </div>

  ${ciPanel('Sensitivity and return','Illustrative share of addressable opportunity converted into incremental revenue',`
    <div class="overflow-x-auto"><table class="w-full text-sm min-w-[800px]"><thead><tr class="text-left text-gray-500"><th class="py-2">Scenario</th><th class="text-right">Opportunity Capture</th><th class="text-right">Incremental Revenue</th><th class="text-right">Gross Contribution</th><th class="text-right">Net After Investment</th><th class="text-right">ROI</th></tr></thead><tbody>${scenarios.map(s=>`<tr class="border-t border-gray-100"><td class="py-3">${ciBadge(s.name,s.tone)}</td><td class="text-right">${s.capture}%</td><td class="text-right">${ciMoney(s.revenue)}</td><td class="text-right">${ciMoney(s.contribution)}</td><td class="text-right ${ciTone(s.net)}">${ciSignedMoney(s.net)}</td><td class="text-right ${ciTone(s.roi)}">${ciSignedPct(s.roi)}</td></tr>`).join('')}</tbody></table></div>
    <p class="text-xs text-gray-500 mt-3">These scenarios are sensitivity tests. They do not claim that all pipeline will convert or that the investment is the only cause of additional revenue.</p>`,'mb-5')}

  <div class="grid xl:grid-cols-2 gap-4 mb-5">
    ${ciPanel('Likely objections and evidence-based responses','Use during an Area Manager or investment discussion',`
      <div class="space-y-3">
        ${[
          ['“The business is already growing.”',`Growth confirms demand, but ${d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length} current control exception${d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length===1?' suggests':'s suggest'} that performance may be constrained by available follow-up capacity.`],
          ['“Pipeline is not guaranteed revenue.”',`Correct. The report separates ${ciMoney(qualified)} raw qualified pipeline from ${ciMoney(weighted)} probability-weighted forecast and uses modest capture assumptions.`],
          ['“Can the current team absorb it?”',`${d.overdueEnquiries.length} overdue enquiries, ${d.noFollowup.length} live enquiries without follow-up and ${d.noOppAction.length} uncontrolled opportunities provide evidence to test the capacity question.`],
          ['“How will we prove the return?”','Track activity, meetings, proposals, weighted pipeline movement, won revenue and conversion before the pilot, then review at 30, 90, 180 and 365 days.'],
          ['“Why not just increase advertising?”','More leads do not solve delayed follow-up or weak opportunity control. Fix conversion capacity and lead quality alongside acquisition.']
        ].map(([q,r])=>`<details class="rounded-xl border border-gray-200 p-4"><summary class="font-semibold cursor-pointer">${ciEsc(q)}</summary><p class="text-sm text-gray-600 mt-3">${ciEsc(r)}</p></details>`).join('')}
      </div>`)}
    ${ciPanel('Balanced risk assessment','Evidence both for and against immediate approval',`
      <div class="grid md:grid-cols-2 gap-4">
        <div><p class="text-xs font-bold tracking-widest text-green-700 mb-3">SUPPORTING INVESTMENT</p><ul class="space-y-2 text-sm">${[
          a.revenueGrowth>0?`Revenue is ${ciPct(a.revenueGrowth)} ahead year on year.`:'Revenue performance does not currently support a growth argument.',
          qualified?`${ciMoney(qualified)} qualified opportunity is visible.`:'Qualified opportunity value is not yet established.',
          d.proactivePipeline?`${ciMoney(d.proactivePipeline)} proactive potential is recorded.`:'Proactive opportunity is not yet established.',
          d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length?`Control exceptions indicate a capacity or process constraint.`:'No major capacity evidence is currently visible.'
        ].map(item=>`<li class="flex gap-2"><i data-lucide="check" class="text-green-600 flex-shrink-0" style="width:16px"></i>${ciEsc(item)}</li>`).join('')}</ul></div>
        <div><p class="text-xs font-bold tracking-widest text-red-700 mb-3">LIMITATIONS / RISKS</p><ul class="space-y-2 text-sm">${[
          `${d.noEnquiryValue.length} enquiries are missing value.`,
          `${d.noOppAction.length} open opportunities lack a complete next action.`,
          'Historic revenue growth may include seasonality or changes unrelated to investment.',
          'Earlier-stage proactive potential is not equivalent to qualified pipeline.'
        ].map(item=>`<li class="flex gap-2"><i data-lucide="alert-triangle" class="text-red-600 flex-shrink-0" style="width:16px"></i>${ciEsc(item)}</li>`).join('')}</ul></div>
      </div>`)}
  </div>

  ${ciPanel('90-day pilot scorecard','Measures that should be agreed before approval',`
    <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      ${[
        ['Outbound activity','Calls, emails, visits and meetings'],
        ['Pipeline creation','New qualified opportunity value'],
        ['Pipeline movement','Proposal and deposit-stage progression'],
        ['Commercial outcomes','Won revenue and average booking value'],
        ['Process quality','Follow-up coverage and overdue actions']
      ].map(([title,detail])=>ciStatusCard(title,'Target to agree',detail,'blue')).join('')}
    </div>`)}
  `;
}

function renderCommercialAlerts(){
  const intel=ciRisksAndActions(),d=ciDataset(),a=ciAnnual();
  const alerts=[
    ...intel.risks.map(x=>({...x,type:'Risk'})),
    ...intel.opportunities.map(x=>({...x,type:'Opportunity'})),
    ...intel.actions.map(x=>({title:x.title,detail:x.detail,severity:'blue',type:'Action'}))
  ];
  return `${ciReportHeader('COMMERCIAL ALERTS','What management needs to know now','A prioritised action board generated from current performance, pipeline and data-control exceptions.')}
  <div class="grid md:grid-cols-3 gap-4 mb-5">
    ${ciStatusCard('Revenue position',ciSignedPct(a.revenueGrowth),`${ciMoney(a.currentFigures.revenue)} vs ${ciMoney(a.previousFigures.revenue)}`,a.revenueGrowth>=0?'green':'red')}
    ${ciStatusCard('Immediate exceptions',d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length,'Overdue or missing commercial actions',d.overdueEnquiries.length+d.noFollowup.length+d.noOppAction.length?'red':'green')}
    ${ciStatusCard('Qualified opportunity',ciMoney(d.openPipeline),`${ciMoney(d.weightedPipeline)} weighted`,'blue')}
  </div>
  <div class="grid lg:grid-cols-3 gap-4">${['Risk','Opportunity','Action'].map(type=>ciPanel(`${type}s`,type==='Risk'?'Threats to revenue or confidence':type==='Opportunity'?'Positive commercial signals':'Recommended next steps',`<div class="space-y-3">${alerts.filter(a=>a.type===type).map((item,index)=>`<div class="rounded-xl border p-4 ${item.severity==='red'?'bg-red-50 border-red-200':item.severity==='amber'?'bg-amber-50 border-amber-200':item.severity==='green'?'bg-green-50 border-green-200':'bg-blue-50 border-blue-200'}"><p class="font-semibold text-sm">${type==='Action'?`${index+1}. `:''}${ciEsc(item.title)}</p><p class="text-xs text-gray-600 mt-2">${ciEsc(item.detail)}</p></div>`).join('')||'<p class="text-sm text-gray-400">No items detected.</p>'}</div>`)).join('')}</div>`;
}

const REPORT_TABS_V2=[
  ['executive','Overview','layout-dashboard'],
  ['revenue','Revenue','pound-sterling'],
  ['crm','Sales','filter'],
  ['types','Events','calendar-range'],
  ['sources','Lead Sources','waypoints'],
  ['lost','Lost Business','circle-x'],
  ['proactive','Proactive','phone-outgoing'],
  ['oppipeline','Opportunities','briefcase-business'],
  ['team','Team','users'],
  ['forecast','Forecast','telescope'],
  ['investment','Investment','landmark'],
  ['alerts','Alerts','bell-ring']
];

function renderReports(){
  if(!REPORT_TABS_V2.some(([id])=>id===reportTab)) reportTab='executive';
  const tabs=REPORT_TABS_V2.map(([id,label,icon])=>`<button onclick="reportTab='${id}';renderSection()"
    class="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition
      ${reportTab===id?'bg-olive-700 text-white shadow-sm':'bg-white text-gray-600 hover:bg-olive-50'}">
      <i data-lucide="${icon}" style="width:15px;height:15px"></i>${label}
    </button>`).join('');
  let content=
    reportTab==='executive'?renderExecutiveSummary():
    reportTab==='revenue'?renderRevenueAnalysisTab():
    reportTab==='crm'?renderCRMSalesPerformance():
    reportTab==='types'?renderEventTypePerformance():
    reportTab==='sources'?renderLeadSourcesTab():
    reportTab==='lost'?renderLostEnquiriesTab():
    reportTab==='proactive'?renderProactiveSalesReport():
    reportTab==='oppipeline'?renderOpportunityPipelineReport():
    reportTab==='team'?renderSalesTeamPerformanceReport():
    reportTab==='forecast'?renderCommercialForecast():
    reportTab==='investment'?renderInvestmentCaseReport():
    renderCommercialAlerts();
  return `<div class="space-y-4">
    <div class="sticky top-0 z-20 bg-[#f7f7f4]/95 backdrop-blur py-2 -mx-1 px-1">
      <div class="overflow-x-auto"><div class="flex gap-2 min-w-max p-1.5 bg-olive-50 border border-olive-100 rounded-xl">${tabs}</div></div>
    </div>
    ${content}
  </div>`;
}
