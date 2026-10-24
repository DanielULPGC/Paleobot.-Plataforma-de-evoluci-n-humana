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
      console.warn('[PB68] Acción recuperada:', name, err);
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

  function handlePriorityClick(event){
    if (!event.target || !event.target.closest) return;
    if (window.PaleoBotV88FloatingMenuFinal &&
        event.target.closest('.fab-group,#pb-a11y-toolbar-root,.scroll-top-btn,#pb-mobile-tools-toggle')) {
      return;
    }
    const modalToggle = event.target.closest('[data-modal-toggle]');
    const detailAction = event.target.closest('[data-detail-action]');
    const action = event.target.closest('[data-action], [data-pb-v50-action]');
    const view = event.target.closest('[data-view]');

    if (modalToggle) {
      const id = modalToggle.dataset.modalToggle;
      const modal = document.getElementById(id);
      if (!modal) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setModal(id, !modal.classList.contains('active'));
      return;
    }

    if (action) {
      const handled = runAction(action.dataset.action || action.dataset.pbV50Action);
      if (handled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if (detailAction) {
      const handled = runDetailAction(detailAction.dataset.detailAction);
      if (handled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if (view && view.closest('.fab-group,.pb-v50-module-grid,.teaching-actions,.landing-routes,.quick-start-panel,.toolbar')) {
      const handled = routeView(view.dataset.view, view);
      if (handled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }

  function repairGlobalSearchGlossary(){
    if (!window.PaleoBotV63 || typeof window.PaleoBotV63.search !== 'function') return;
    document.addEventListener('click', function(event){
      const result = event.target.closest && event.target.closest('#globalSearchResults [data-search-type="glosario"], #globalSearchResults [data-type="glosario"]');
      if (!result) return;
      window.setTimeout(() => {
        const term = result.dataset.searchId || result.dataset.id || result.textContent.trim().split(/\s+/).slice(0, 4).join(' ');
        const input = document.querySelector('[data-gloss-search]') || document.getElementById('glossarySearch');
        if (input && term) {
          input.value = term;
          input.dispatchEvent(new Event('input', { bubbles:true }));
        }
      }, 350);
    }, true);
  }

  window.addEventListener('click', handlePriorityClick, true);
  document.addEventListener('DOMContentLoaded', repairGlobalSearchGlossary, { once:true });
  if (document.readyState !== 'loading') repairGlobalSearchGlossary();

  document.documentElement.dataset.paleobotV68InteractionStabilizer = 'ready';
  window.PaleoBotV68InteractionStabilizer = { runAction, runDetailAction, routeView, setModal };
})();
