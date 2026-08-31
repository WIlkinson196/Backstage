// Wedding System V2 — Phase 3: Enquiry Reliability
(function(){
  const V={build:'WEDDING-V2-P3-20260824'};
  V.audit=function(){
    const rows=Array.isArray(window.DB?.enquiries)?window.DB.enquiries:(typeof DB!=='undefined'&&Array.isArray(DB.enquiries)?DB.enquiries:[]);
    const lost=rows.filter(e=>e.status==='Lost Enquiry');
    const lostMissingReason=lost.filter(e=>!String(e.lostReason||e.lost_reason||'').trim());
    const activity=window.EnquiryActivity;
    return {build:V.build,enquiries:rows.length,lost:lost.length,lostMissingReason:lostMissingReason.length,activityEngine:!!activity};
  };
  window.EnquiryReliabilityV2=V;
})();