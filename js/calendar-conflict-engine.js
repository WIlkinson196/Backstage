// Wedding System V2 Phase 4 — shared calendar conflict guard.
(function(){
  const G=window.CalendarConflictGuard={};
  G.check=function({date,startTime,endTime='',durationMinutes=60,source='other',id='',title='New calendar item'}={}){
    if(!window.WindmillCalendar?.conflictSummary)return {blocked:false,conflicts:[],engine:false};
    return {...WindmillCalendar.conflictSummary({date,time:startTime,endTime,durationMinutes,source,id,title},{source,id}),engine:true};
  };
  G.requireOverride=function(candidate,overrideReason=''){
    const result=G.check(candidate);
    return {ok:!result.blocked||!!String(overrideReason||'').trim(),...result};
  };
})();