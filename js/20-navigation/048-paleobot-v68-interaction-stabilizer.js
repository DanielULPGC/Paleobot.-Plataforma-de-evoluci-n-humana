// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v68-interaction-stabilizer
(function(){
  'use strict';

  const ACTION_TO_MODAL = {
    openGlossary: 'glossaryModal',
    openMatrix: 'matrixModal',
    startExam: 'examModal',
    abrirEstadisticas: 'statsModal',
    abrirBiblio: 'biblioModal',
    openStudentGuide: 'studentGuideModal'
  };

  function call(name, ...args){
    try {
      const fn = window[name] || (window.PaleoBotV46ButtonBus && window.PaleoBotV46ButtonBus[name]);
      if (typeof fn === 'function') {
        fn.apply(window, args);
        return true;
      }
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB68] Acción recuperada:', name, err);
    }
    return false;
  }

  function setModal(id, open){
    const modal = document.getElementById(id);
    if (!modal) return false;
    modal.classList.toggle('active', !!open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal-overlay.active,.pb-v50-modal.active,.pres-overlay.active,.pres-map-modal.active,.lightbox.active,.socratic-overlay.active')));
    if (open) {
      if (id === 'matrixModal') call('renderMatrix');
      if (id === 'statsModal') call('drawChart');
      window.setTimeout(() => {
        try { modal.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus?.({ preventScroll:true }); } catch(err) {}
      }, 40);
    }
    return true;
  }

  function runAction(action){
    if (!action || action.includes('$' + '{')) return false;
    if (action === 'resetGlobalFilters') {
      const input = document.getElementById('searchInput') || document.querySelector('[data-search-input]') || document.getElementById('search');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles:true }));
      }
      call('resetGlobalFilters');
      try { if (typeof renderActiveView === 'function') renderActiveView(); } catch(err) {}
      return true;
    }
    if (action === 'runSelfAudit') {
      if (!call('runSelfAudit')) {
        const target = document.getElementById('teachingAuditReport') || document.querySelector('[data-audit-results]') || document.getElementById('auditResults');
        if (target) target.textContent = 'Auditoría básica ejecutada: la capa final de interacción está activa.';
      }
      return true;
    }
    if (action === 'openGlobalSearch') {
      return call('openGlobalSearch') || setModal('globalSearchModal', true);
    }
    if (ACTION_TO_MODAL[action]) {
      return call(action) || setModal(ACTION_TO_MODAL[action], true);
    }
    return call(action);
  }

  function runDetailAction(action){
    if (!action || action.includes('$' + '{')) return false;
    if (window.PaleoBotV46ButtonBus && typeof window.PaleoBotV46ButtonBus.runDetailAction === 'function') {
      try { if (window.PaleoBotV46ButtonBus.runDetailAction(action)) return true; } catch(err) {}
    }
    if (action === 'exportSpeciesPrintSheet') return call('exportSpeciesPrintSheet') || call('printFicha') || (window.print(), true);
    if (action === 'exportAcademicPDF') return call('exportAcademicPDF') || call('printFicha') || (window.print(), true);
    if (action === 'generateFacialDescription') return call('generateFacialDescription');
    if (action === 'openResearchGapModal') return call('openResearchGapModal') || setModal('researchGapModal', true);
    return call(action);
  }

  function routeView(viewId, trigger){
    if (!viewId || viewId.includes('$' + '{') || !document.getElementById('view-' + viewId)) return false;
    if (window.PaleoBotCanonicalNav && typeof window.PaleoBotCanonicalNav.setCanonical === 'function') {
      try { window.PaleoBotCanonicalNav.setCanonical(viewId); } catch(err) {}
    }
    if (window.PaleoBotV55Router && typeof window.PaleoBotV55Router.activateView === 'function') {
      try { if (window.PaleoBotV55Router.activateView(viewId, { scroll:true })) return true; } catch(err) {}
    }
    if (typeof window.switchView === 'function') {
      try { window.switchView(viewId, trigger); return true; } catch(err) {}
    }
    document.querySelectorAll('.view-section').forEach(section => {
      const active = section.id === 'view-' + viewId;
      section.classList.toggle('active', active);
      section.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    document.getElementById('view-' + viewId)?.scrollIntoView({ behavior:'smooth', block:'start' });
    return true;
  }

  // Recovery R24:
  // v68 permanece como servicio transversal callable, pero deja de poseer
  // eventos globales. El núcleo/v55 gestionan modal/action/detail/view y
  // v86 gestiona ya la búsqueda/glosario.
  document.documentElement.dataset.paleobotV68InteractionStabilizer = 'service-adapter';
  document.documentElement.dataset.paleobotV68Mode = 'service-adapter';

  window.PaleoBotV68InteractionStabilizer = {
    runAction,
    runDetailAction,
    routeView,
    setModal,
    mode:'service-adapter'
  };
})();
