// Opens a requested advanced view when returning from the essential route.
(function(){
  'use strict';
  const allowed = new Set(['timeline','phylo','map','clima','datacion','aula','recursos']);
  function requestedView(){
    try {
      const value = new URLSearchParams(window.location.search).get('view') || '';
      return allowed.has(value) ? value : '';
    } catch(_){ return ''; }
  }
  function activate(view){
    if (!view) return false;
    let active = false;
    try { window.PaleoBotCanonicalNav?.setCanonical?.(view); } catch(_){}
    try {
      if (window.PaleoBotV55Router?.activateView) {
        window.PaleoBotV55Router.activateView(view,{scroll:false});
        active = true;
      } else if (typeof window.renderActiveView === 'function') {
        window.renderActiveView(view);
        active = true;
      }
    } catch(_){}
    if (document.getElementById('view-'+view)?.classList.contains('active')) active = true;
    return active;
  }
  function settle(){
    const view = requestedView();
    if (!view) return;
    let attempt = 0;
    const timer = window.setInterval(function(){
      activate(view);
      attempt += 1;
      const section = document.getElementById('view-'+view);
      if (section?.classList.contains('active') || attempt >= 12) {
        window.clearInterval(timer);
        const main = document.getElementById('main-content');
        if (main) window.requestAnimationFrame(function(){ main.scrollIntoView({block:'start'}); });
      }
    },120);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',settle,{once:true});
  else settle();
})();
