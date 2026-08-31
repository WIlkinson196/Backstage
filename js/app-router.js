// WINDMILL FARM CRM — APP ROUTER / BROWSER HISTORY
(function(){
  const Router={
    suppress:false,
    restoring:false,
    initialised:false,
    baseNavigate:null,

    clean(path){
      path=String(path||'').replace(/^#?/,'');
      if(!path.startsWith('/'))path='/'+path;
      return path.replace(/\/+/g,'/');
    },

    current(){
      return Router.clean(location.hash.replace(/^#/,'')||'/dashboard');
    },

    commit(path,{replace=false}={}){
      if(Router.suppress||Router.restoring)return;
      path=Router.clean(path);
      const hash='#'+path;
      if(location.hash===hash)return;
      const state={windmillRoute:path,at:Date.now()};
      if(replace)history.replaceState(state,'',hash);
      else history.pushState(state,'',hash);
    },

    sectionRoute(section){
      return '/'+encodeURIComponent(section||'dashboard');
    },

    closeTransientWorkspaces(){
      const fw=document.getElementById('function-workspace-panel');
      if(fw)fw.remove();
      const ww=document.getElementById('wedding-workspace');
      if(ww)ww.classList.add('hidden');
      document.body.style.overflow='';
    },

    async restore(path){
      path=Router.clean(path);
      Router.restoring=true;
      Router.suppress=true;
      try{
        const parts=path.split('/').filter(Boolean).map(decodeURIComponent);
        const section=parts[0]||'dashboard';

        // Always navigate the main shell first.
        if(typeof Router.baseNavigate==='function'){
          Router.baseNavigate(section);
        }else if(typeof window.navigate==='function'){
          window.navigate(section);
        }

        // Deeper module routes.
        if(section==='weddings'&&parts[1]&&typeof openWeddingWorkspace==='function'){
          setTimeout(()=>openWeddingWorkspace(parts[1],parts[2]||'overview'),0);
        }else if(section==='functions'&&parts[1]&&typeof openFunctionWorkspace==='function'){
          setTimeout(()=>{
            openFunctionWorkspace(parts[1]);
            if(parts[2]&&typeof setFunctionTab==='function')setFunctionTab(parts[2]);
          },0);
        }else if(section==='kitchen'&&parts[1]&&window.KitchenApp){
          setTimeout(()=>{KitchenApp.activeTab=parts[1];renderSection();},0);
        }else if(section==='christmas'&&parts[1]==='event'&&parts[2]&&window.ChristmasOS){
          setTimeout(()=>ChristmasOS.openEventWorkspace(parts[2],parts[3]||'command'),0);
        }else if(section==='christmas'&&parts[1]&&window.ChristmasOS){
          setTimeout(()=>{ChristmasOS.activeTab=parts[1];renderSection();},0);
        }else if(section==='hotel'&&parts[1]&&window.HotelOS){
          setTimeout(()=>{
            HotelOS.activeTab=parts[1];
            if(parts[2]!==undefined)HotelOS.selectedDay=Number(parts[2]||0);
            renderSection();
          },0);
        }else if((section==='sales-leads'||section==='sales')&&parts[1]&&typeof setSalesLeadView==='function'){
          setTimeout(()=>setSalesLeadView(parts[1]),0);
        }else if(section==='opportunities'&&parts[1]&&typeof setOpportunityView==='function'){
          setTimeout(()=>setOpportunityView(parts[1]),0);
        }else if(section==='enquiries'&&parts[1]&&window.EnquiriesCentre){
          setTimeout(()=>EnquiriesCentre.setView(parts[1]),0);
        }else if(section==='calendar'&&window.WindmillCalendar){
          setTimeout(()=>{
            if(parts[1])WindmillCalendar.view=parts[1];
            if(parts[2])WindmillCalendar.selectedDate=parts[2];
            if(typeof renderCalendarCentre==='function')renderCalendarCentre();
          },0);
        }
      }finally{
        setTimeout(()=>{Router.suppress=false;Router.restoring=false;},40);
      }
    },

    initialise(){
      if(Router.initialised)return;
      Router.initialised=true;
      Router.baseNavigate=window.navigate;

      // Wrap the final navigate implementation after all module overrides.
      window.navigate=function(section){
        const result=Router.baseNavigate(section);
        if(!Router.suppress&&!Router.restoring)Router.commit(Router.sectionRoute(section));
        return result;
      };

      window.addEventListener('popstate',()=>Router.restore(Router.current()));

      // Old builds sometimes used #wedding=... links. Keep them working.
      if(/^#wedding=/.test(location.hash)){
        const m=location.hash.match(/^#wedding=([^&]+)(?:&tab=([^&]+))?/);
        if(m){
          const id=decodeURIComponent(m[1]),tab=decodeURIComponent(m[2]||'overview');
          history.replaceState({windmillRoute:`/weddings/${id}/${tab}`},'',`#/weddings/${encodeURIComponent(id)}/${encodeURIComponent(tab)}`);
        }
      }

      if(location.hash&&location.hash!=='#'){
        setTimeout(()=>Router.restore(Router.current()),350);
      }else{
        const section=typeof currentSection!=='undefined'&&currentSection?currentSection:'dashboard';
        Router.commit(Router.sectionRoute(section),{replace:true});
      }
    }
  };

  window.AppRouter=Router;
  window.addEventListener('load',()=>setTimeout(()=>Router.initialise(),250));
})();
