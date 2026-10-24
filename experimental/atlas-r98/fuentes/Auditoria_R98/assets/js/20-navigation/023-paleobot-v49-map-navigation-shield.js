// Recovery R31 — v49 map pre-navigation adapter
(function(){
  'use strict';

  function call(name, ...args){
    try {
      const fn = window[name];
      if (typeof fn === 'function') {
        fn.apply(window, args);
        return true;
      }
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB49] compatibilidad:', name, err);
    }
    return false;
  }

  function closePanels(){
    call('closeDetailPanel');
    document.querySelectorAll('#detailView,.detail-panel,.side-panel').forEach(panel => {
      panel.classList.remove('active','open','visible');
      panel.setAttribute('aria-hidden','true');
    });
    document.body.classList.remove('detail-open','panel-open');
    return true;
  }

  function activateView(viewId, trigger){
    if (!viewId || !document.getElementById('view-' + viewId)) return false;

    closePanels();

    try {
      if (window.PaleoBotV55Router?.activateView?.(viewId, {
        scroll: Boolean(trigger && !trigger.closest?.('.toolbar'))
      })) return true;
    } catch(_){}

    try {
      if (typeof window.switchView === 'function') {
        window.switchView(viewId, trigger || null);
        return true;
      }
    } catch(_){}

    return false;
  }

  function toggleMapOverlay(btn){
    const mode = btn?.dataset?.mapToggle;
    if (mode === 'paleo') return call('togglePaleoEnvironment', btn);
    if (mode === 'migrations') return call('toggleMigrations', btn);
    return false;
  }

  function prepareViewNavigation(event){
    const trigger = event.target?.closest?.('[data-view]');
    if (!trigger) return false;
    const viewId = trigger.dataset.view;
    if (!viewId || !document.getElementById('view-' + viewId)) return false;

    // Solo limpieza previa: no preventDefault, no stopPropagation,
    // no activación de vista. El click posterior pertenece al núcleo/v55.
    closePanels();
    document.body.dataset.v49PreparedView = viewId;
    return true;
  }

  function installPreNavigation(){
    if (document.documentElement.dataset.paleobotV49PreNavigation === 'ready') return false;
    document.documentElement.dataset.paleobotV49PreNavigation = 'ready';
    document.addEventListener('pointerdown', prepareViewNavigation, true);
    return true;
  }

  function init(){
    document.body.dataset.v49MapNavigation = 'pre-navigation-adapter';
    document.documentElement.dataset.paleobotV49Mode = 'pre-navigation-adapter';
    installPreNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.PaleoBotV49MapNavigation = {
    activateView,
    toggleMapOverlay,
    closePanels,
    prepareViewNavigation,
    installPreNavigation,
    mode:'pre-navigation-adapter'
  };
})();
