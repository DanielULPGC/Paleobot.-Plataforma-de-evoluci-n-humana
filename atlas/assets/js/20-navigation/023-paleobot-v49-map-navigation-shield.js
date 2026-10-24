// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v49-map-navigation-shield
(function(){
  const VIEW_FAMILY = {
    timeline:'explorar', map:'explorar', continentes:'explorar', africa:'explorar', asia:'explorar', europe:'explorar',
    america:'explorar', yacimientos:'explorar', biogeo:'explorar', contexto:'explorar', paleoecologia:'explorar',
    tree:'interpretar', phylo:'interpretar', clima:'interpretar', coexistencias:'interpretar', primatologia:'interpretar',
    constructor:'interpretar',
    revisiones:'investigar', genomica:'investigar', paleoproteomica:'investigar', datacion:'investigar', debates:'investigar', socratico:'investigar',
    estratigrafia:'investigar', tafonomia:'investigar', introgresion:'investigar', holotipos:'investigar', dispersal:'investigar',
    aula:'aprender', recursos:'aprender', itinerarios:'aprender'
  };
  function ev(name){ return typeof window[name] !== 'undefined' ? window[name] : undefined; }
  function call(name, ...args){
    try {
      const fn = window[name] || ev(name);
      if (typeof fn === 'function') { fn.apply(window, args); return true; }
    } catch(err) {
      console.warn('v49 navegación mapa:', name, err);
    }
    return false;
  }
  function setPressed(selector, matcher){
    document.querySelectorAll(selector).forEach(btn => {
      const active = Boolean(matcher(btn));
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  function closePanels(){
    call('closeDetailPanel');
    document.querySelectorAll('#detailView,.detail-panel,.side-panel').forEach(panel => {
      panel.classList.remove('active','open','visible');
      panel.setAttribute('aria-hidden','true');
    });
  }
  function renderView(viewId){
    if (call('renderActiveView', viewId)) return true;
    if (viewId === 'map') return call('renderMapView');
    if (viewId === 'paleoecologia') return call('renderPaleoecologiaView') || call('renderM19PaleoecologiaView');
    if (viewId === 'recursos') return call('renderResourcesView');
    return false;
  }
  function activateView(viewId, trigger){
    const section = document.getElementById('view-' + viewId);
    if (!section) return false;
    closePanels();
    const family = VIEW_FAMILY[viewId] || 'explorar';
    document.body.dataset.navFamily = family;
    document.querySelectorAll('.view-section').forEach(el => {
      el.classList.toggle('active', el === section);
      el.setAttribute('aria-hidden', el === section ? 'false' : 'true');
    });
    document.querySelectorAll('.toolbar .view-btn[data-view]').forEach(btn => {
      const exists = Boolean(document.getElementById('view-' + btn.dataset.view));
      const belongs = (VIEW_FAMILY[btn.dataset.view] || 'explorar') === family;
      btn.hidden = !(exists && belongs);
      btn.disabled = !exists;
    });
    setPressed('[data-nav-family]', btn => btn.dataset.navFamily === family);
    setPressed('[data-view]', btn => btn.dataset.view === viewId);
    renderView(viewId);
    if (viewId === 'map') {
      call('renderMapView');
      document.body.dataset.v49MapRoute = 'view:' + viewId;
    }
    try {
      const main = document.getElementById('main-content') || section;
      if (trigger && !trigger.closest('.toolbar')) main.scrollIntoView({ behavior:'smooth', block:'start' });
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    document.body.dataset.v49ActiveView = viewId;
    document.dispatchEvent(new CustomEvent('paleobot:v49-viewchange', { detail:{ view:viewId, family } }));
    return true;
  }
  function toggleMapOverlay(btn){
    const mode = btn?.dataset.mapToggle;
    if (!mode) return false;
    if (mode === 'paleo') {
      if (!call('togglePaleoEnvironment', btn)) {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
      }
      document.body.dataset.v49MapToggle = 'paleo';
      return true;
    }
    if (mode === 'migrations') {
      if (!call('toggleMigrations', btn)) {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
        document.querySelectorAll('.mig-path').forEach(path => { path.style.display = on ? '' : 'none'; });
      }
      document.body.dataset.v49MapToggle = 'migrations';
      return true;
    }
    return false;
  }
  window.addEventListener('click', function(e){
    const view = e.target.closest('[data-view]');
    if (view && document.getElementById('view-' + view.dataset.view)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      activateView(view.dataset.view, view);
      return;
    }
    const mapToggle = e.target.closest('[data-map-toggle]');
    if (mapToggle) {
      e.preventDefault();
      e.stopImmediatePropagation();
      toggleMapOverlay(mapToggle);
      return;
    }
  }, true);
  window.PaleoBotV49MapNavigation = { activateView, toggleMapOverlay };
  document.body.dataset.v49MapNavigation = 'ready';
})();
