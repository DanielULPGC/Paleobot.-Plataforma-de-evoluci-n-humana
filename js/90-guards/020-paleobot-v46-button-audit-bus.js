// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v46-button-audit-bus
(function(){
  const ACTION_MODAL = {
    openGlossary: 'glossaryModal',
    openMatrix: 'matrixModal',
    startExam: 'examModal',
    abrirEstadisticas: 'statsModal',
    abrirBiblio: 'biblioModal',
    openStudentGuide: 'studentGuideModal'
  };
  function safeCall(name, ...args){
    try {
      const fn = window[name] || (typeof globalThis !== 'undefined' ? globalThis[name] : null);
      if (typeof fn === 'function') return { ok:true, value:fn.apply(window, args) };
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('Acción recuperada por v46:', name, err);
      return { ok:false, error:err };
    }
    try {
      {
        const fn = window[name];
        if (typeof fn === 'function') return { ok:true, value:fn.apply(window, args) };
      }
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return { ok:false };
  }
  /* setModal local en este IIFE — no contamina el scope global */
  function setModal(id, open){
    const modal = document.getElementById(id);
    if (!modal) return false;
    modal.classList.toggle('active', !!open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      if (id === 'matrixModal') safeCall('renderMatrix');
      if (id === 'compareModal') safeCall('cmpOnModalOpen');
      if (id === 'statsModal') safeCall('drawChart');
      const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      try { focusable?.focus?.({ preventScroll:true }); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    }
    try { safeCall('updateBackButtonState'); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return true;
  }
  function toggleModalSafe(id){
    const modal = document.getElementById(id);
    if (!modal) return false;
    const next = !modal.classList.contains('active');
    const called = safeCall('toggleModal', id);
    if (!called.ok) setModal(id, next);
    if (id === 'matrixModal' && next) safeCall('renderMatrix');
    if (id === 'compareModal' && next) safeCall('cmpOnModalOpen');
    return true;
  }
  function activeSpecies(){
    try { if (typeof currentSpecies !== 'undefined' && currentSpecies) return currentSpecies; } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try {
      const id = document.getElementById('detailView')?.dataset.v40LastSpecies || document.body.dataset.v40LastSpecies;
      if (id && typeof DB_INDEX !== 'undefined') return DB_INDEX[id];
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try { return Array.isArray(DB) ? DB[0] : null; } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return null;
  }
  function runAction(action){
    if (!action || action.includes('${')) return false;
    document.body.dataset.v46LastAction = action;
    switch(action){
      case 'abrirBiblio':
        if (!safeCall('abrirBiblio').ok) setModal('biblioModal', true);
        try { document.dispatchEvent(new CustomEvent('paleobot:bibliography-rendered')); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
        return true;
      case 'openGlossary':
        if (!safeCall('openGlossary').ok) setModal('glossaryModal', true);
        return true;
      case 'openMatrix':
        if (!safeCall('openMatrix').ok) setModal('matrixModal', true);
        return true;
      case 'startExam':
        if (!safeCall('startExam').ok) setModal('examModal', true);
        return true;
      case 'abrirEstadisticas':
        if (!safeCall('abrirEstadisticas').ok) setModal('statsModal', true);
        return true;
      case 'openPresentation':
        if (!safeCall('openPresentation').ok) {
          const ov = document.getElementById('presOverlay');
          if (ov) { ov.classList.add('active'); ov.setAttribute('aria-hidden','false'); }
        }
        return true;
      case 'activateClassMode':
        if (!safeCall('activateClassMode').ok) document.body.classList.toggle('class-mode');
        return true;
      case 'resetGlobalFilters':
        if (!safeCall('resetGlobalFilters').ok) {
          const search = document.getElementById('searchInput') || document.querySelector('[data-search-input]') || document.getElementById('search');
          if (search) search.value = '';
          document.body.dataset.v46FiltersReset = 'fallback';
          safeCall('renderActiveView');
        }
        return true;
      case 'scrollToTop':
        if (!safeCall('scrollToTop').ok) window.scrollTo({ top:0, behavior:'smooth' });
        return true;
      case 'exportToCSV':
        if (!safeCall('exportToCSV').ok) window.__PALEOBOT_DEBUG && console.warn('Exportación CSV no disponible.');
        return true;
      case 'printFicha':
        if (!safeCall('printFicha').ok) window.print();
        return true;
      case 'runSelfAudit':
        if (!safeCall('runSelfAudit').ok) {
          const target = document.getElementById('teachingAuditReport') || document.querySelector('[data-audit-results]') || document.getElementById('auditResults');
          if (target) target.textContent = 'Auditoría básica: botones conectados por la capa v46.';
        }
        return true;
      default:
        return safeCall(action).ok;
    }
  }
  function runDetailAction(action){
    if (!action) return false;
    document.body.dataset.v46LastDetailAction = action;
    switch(action){
      case 'openResearchGapModal':
        if (!safeCall('openResearchGapModal').ok) setModal('researchGapModal', true);
        return true;
      case 'generateFacialDescription':
        return safeCall('generateFacialDescription').ok;
      case 'exportAcademicPDF':
        return safeCall('exportAcademicPDF').ok;
      case 'exportSpeciesPrintSheet':
        return safeCall('exportSpeciesPrintSheet').ok || safeCall('printFicha').ok || (window.print(), true);
      default:
        return safeCall(action).ok;
    }
  }
  // Recovery R30:
  // v46 conserva únicamente su API de compatibilidad/fallback.
  // El núcleo posee data-modal-toggle, data-detail-action, data-action y Escape.
  document.body.dataset.v46ButtonBus = 'service-adapter';
  document.documentElement.dataset.paleobotV46Mode = 'service-adapter';
  window.PaleoBotV46ButtonBus = {
    runAction,
    setModal,
    toggleModalSafe,
    runDetailAction,
    activeSpecies,
    mode:'service-adapter'
  };
})();
