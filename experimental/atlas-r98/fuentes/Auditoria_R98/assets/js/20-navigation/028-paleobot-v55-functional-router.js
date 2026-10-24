// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v55-functional-router
(function(){
  'use strict';
  const VIEW_TO_BLOCK = {
    timeline:'explorar', map:'explorar', continentes:'explorar', africa:'explorar', asia:'explorar', europe:'explorar', america:'explorar',
    yacimientos:'explorar', biogeo:'explorar', contexto:'explorar', paleoecologia:'explorar',
    tree:'interpretar', phylo:'interpretar', clima:'interpretar', coexistencias:'interpretar', primatologia:'interpretar', constructor:'interpretar',
    revisiones:'investigar', genomica:'investigar', datacion:'investigar', debates:'investigar', estratigrafia:'investigar',
    tafonomia:'investigar', introgresion:'investigar', holotipos:'investigar', dispersal:'investigar',
    aula:'aprender', recursos:'aprender', itinerarios:'aprender', socratico:'aprender'
  };
  const BLOCK_VIEWS = {
    explorar:['timeline','map','continentes','africa','asia','europe','america','yacimientos','biogeo','contexto','paleoecologia'],
    interpretar:['tree','phylo','clima','coexistencias','primatologia','constructor'],
    investigar:['revisiones','genomica','datacion','debates','estratigrafia','tafonomia','introgresion','holotipos','dispersal'],
    aprender:['aula','recursos','itinerarios','socratico']
  };
  const BLOCK_DEFAULT = { explorar:'timeline', interpretar:'tree', investigar:'revisiones', aprender:'aula' };
  const ACTION_MODAL = { openGlossary:'glossaryModal', openMatrix:'matrixModal', startExam:'examModal', abrirEstadisticas:'statsModal', abrirBiblio:'biblioModal', openStudentGuide:'studentGuideModal' };

  function call(name, ...args){
    try { if (typeof window[name] === 'function') return { ok:true, value:window[name](...args) }; } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try {
      if (typeof eval === 'function') {
        const fn = window[name];
        if (typeof fn === 'function') return { ok:true, value:fn(...args) };
      }
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return { ok:false };
  }
  function existingViews(blockId){
    return (BLOCK_VIEWS[blockId] || []).filter(view => document.getElementById('view-' + view));
  }
  function setPressed(selector, check){
    document.querySelectorAll(selector).forEach(btn => {
      const active = check(btn);
      btn.classList.toggle('active', active);
      if (btn.matches('button')) {
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (btn.hasAttribute('role') && btn.getAttribute('role') === 'tab') btn.setAttribute('aria-selected', active ? 'true' : 'false');
      }
    });
  }
  function render(viewId){
    call('renderActiveView', viewId);
    if (viewId === 'map') call('renderMapView');
    if (viewId === 'recursos') call('renderResourcesView');
    if (viewId === 'paleoecologia') call('renderPaleoecologiaView');
  }
  function closePanels(){
    call('closeDetailPanel');
    document.querySelectorAll('#detailView,.detail-panel,.side-panel').forEach(panel => {
      panel.classList.remove('active','open','visible');
      panel.setAttribute('aria-hidden','true');
    });
    document.body.classList.remove('detail-open','panel-open');
  }
  function activateView(viewId, opts){
    const section = document.getElementById('view-' + viewId);
    if (!section) return false;
    const blockId = VIEW_TO_BLOCK[viewId] || document.body.dataset.pbV50Block || 'explorar';
    closePanels();
    document.body.dataset.pbV50Block = blockId;
    document.body.dataset.pbV55LastView = viewId;
    document.querySelectorAll('.view-section').forEach(item => {
      const active = item === section;
      item.classList.toggle('active', active);
      item.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    setPressed('button[data-pb-v50-block], [role="tab"][data-pb-v50-block]', btn => btn.dataset.pbV50Block === blockId);
    setPressed('[data-view], [data-pb-v50-view]', btn => (btn.dataset.view || btn.dataset.pbV50View) === viewId);
    render(viewId);
    document.querySelectorAll('.view-section').forEach(item => item.classList.toggle('active', item === section));
    if (opts?.scroll) {
      try { (document.getElementById('main-content') || section).scrollIntoView({ behavior:'smooth', block:'start' }); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    }
    document.dispatchEvent(new CustomEvent('paleobot:v55-viewchange', { detail:{ view:viewId, block:blockId } }));
    return true;
  }
  function activateBlock(blockId, requestedView, opts){
    const safeBlock = BLOCK_VIEWS[blockId] ? blockId : 'explorar';
    const views = existingViews(safeBlock);
    const current = document.querySelector('.view-section.active')?.id?.replace(/^view-/,'') || '';
    const target = requestedView && views.includes(requestedView)
      ? requestedView
      : (views.includes(current) ? current : (BLOCK_DEFAULT[safeBlock] || views[0]));
    document.body.dataset.pbV50Block = safeBlock;
    setPressed('button[data-pb-v50-block], [role="tab"][data-pb-v50-block]', btn => btn.dataset.pbV50Block === safeBlock);
    if (target) activateView(target, opts);
    return true;
  }
  /* v59-fix: setModal con focus trap (WCAG 2.1 §2.1.2) y restauración de foco */
  const _v55ModalTrapRemovers = {};
  const _v55ModalTriggers = {};
  function setModal(id, open){
    const modal = document.getElementById(id);
    if (!modal) return false;
    const wasOpen = modal.classList.contains('active');
    if (Boolean(open) === wasOpen) return true; // sin cambio
    modal.classList.toggle('active', Boolean(open));
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      // Guardar elemento que tenía el foco
      _v55ModalTriggers[id] = document.activeElement;
      // Renderizar contenido
      if (id === 'matrixModal') call('renderMatrix');
      if (id === 'compareModal') call('cmpOnModalOpen');
      if (id === 'statsModal') call('drawChart');
      // Focus trap — preferir createFocusTrap si está disponible, si no: foco manual
      if (typeof window.createFocusTrap === 'function') {
        try {
          _v55ModalTrapRemovers[id] = window.createFocusTrap(modal, _v55ModalTriggers[id]);
        } catch(err) {
          // Fallback: mover foco al primer elemento focusable
          const firstFocusable = modal.querySelector(
            'button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"]),a[href]'
          );
          if (firstFocusable) requestAnimationFrame(() => { try { firstFocusable.focus(); } catch(e) { /* foco no disponible */ } });
        }
      } else {
        const firstFocusable = modal.querySelector(
          'button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"]),a[href]'
        );
        if (firstFocusable) requestAnimationFrame(() => { try { firstFocusable.focus(); } catch(e) { /* foco no disponible */ } });
      }
    } else {
      // Liberar trap y restaurar foco al disparador
      if (typeof _v55ModalTrapRemovers[id] === 'function') {
        try { _v55ModalTrapRemovers[id](); } catch(e) { /* recuperable: suprimido intencionalmente */ }
        delete _v55ModalTrapRemovers[id];
      } else {
        // Fallback: restaurar foco manualmente
        const trigger = _v55ModalTriggers[id];
        if (trigger?.isConnected && typeof trigger.focus === 'function') {
          try { trigger.focus(); } catch(e) { /* recuperable: suprimido intencionalmente */ }
        }
      }
      delete _v55ModalTriggers[id];
    }
    return true;
  }
  function runAction(action){
    if (!action) return false;
    document.body.dataset.pbV55LastAction = action;
    if (action !== 'printFicha' && action !== 'exportToCSV') closePanels();
    if (action === 'scrollToTop') { window.scrollTo({ top:0, behavior:'smooth' }); return true; }
    if (action === 'resetGlobalFilters') {
      if (!call('resetGlobalFilters').ok) {
        const search = document.getElementById('searchInput') || document.getElementById('search');
        if (search) search.value = '';
      }
      return true;
    }
    if (action === 'activateClassMode') { if (!call('activateClassMode').ok) document.body.classList.toggle('class-mode'); return true; }
    if (action === 'exportToCSV') { call('exportToCSV'); return true; }
    if (action === 'printFicha') { if (!call('printFicha').ok) window.print(); return true; }
    if (action === 'runSelfAudit') { call('runSelfAudit'); return true; }
    if (action === 'openPresentation') {
      call('openPresentation');
      const overlay = document.getElementById('presOverlay');
      if (overlay && !overlay.classList.contains('active')) {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden','false');
        document.body.classList.add('presentation-open');
      }
      return Boolean(overlay);
    }
    if (action === 'exportQuizProgress') { call('exportQuizProgress'); return true; }
    if (ACTION_MODAL[action]) {
      call(action);
      if (!document.getElementById(ACTION_MODAL[action])?.classList.contains('active')) setModal(ACTION_MODAL[action], true);
      return true;
    }
    return call(action).ok;
  }
  function openMapModal(){
    activateView('map', { scroll:true });
    window.setTimeout(() => {
      let modal = document.getElementById('pbV50MapModal');
      if (!modal && typeof window.PaleoBotV51Navigation?.openMapModal === 'function') {
        window.PaleoBotV51Navigation.openMapModal();
        return;
      }
      if (!modal) return;
      const body = modal.querySelector('[data-pb-v50-map-body]') || document.getElementById('pbV50MapBody');
      const svg = document.getElementById('mapSvg') || document.querySelector('#view-map svg');
      if (body) {
        body.innerHTML = '';
        if (svg) body.appendChild(svg.cloneNode(true));
        else body.innerHTML = '<p class="pb-r70-gen-37025f8f89" >No se encontró un mapa SVG para ampliar.</p>';
      }
      modal.classList.add('active');
      modal.setAttribute('aria-hidden','false');
    }, 60);
    return true;
  }
  function closeMapModal(){
    const modal = document.getElementById('pbV50MapModal');
    if (!modal) return false;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
    return true;
  }
  // Recovery R33:
  // El routing interactivo v50/core ya posee los eventos ordinarios.
  // v55 conserva únicamente su API callable y la inicialización pasiva.
  document.documentElement.dataset.paleobotV55Mode = 'functional-service-adapter';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.setTimeout(closePanels, 120), { once:true });
  } else {
    window.setTimeout(closePanels, 120);
  }
  window.PaleoBotV55Router = {
    activateView,
    activateBlock,
    runAction,
    setModal,
    openMapModal,
    closeMapModal,
    closePanels,
    mode:'functional-service-adapter'
  };
  document.documentElement.dataset.paleobotV55FunctionalRouter = 'service-adapter';
})();
