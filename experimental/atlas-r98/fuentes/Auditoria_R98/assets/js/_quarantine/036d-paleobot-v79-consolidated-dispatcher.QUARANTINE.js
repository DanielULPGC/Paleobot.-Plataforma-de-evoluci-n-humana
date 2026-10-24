// R91-P4 · CUARENTENA · NO ENLAZADO DESDE index.html.
// Restaurado de 036-style.css solo por trazabilidad. Registra un manejador de clic en fase de
// captura sobre window con stopImmediatePropagation: activarlo alteraría toda la navegación.
// Su única función no cubierta (repairFaunaReinjection) se integra en 036a-paleobot-v66-fauna.js.
(function(){
  'use strict';

  const MODAL_SELECTOR = '.modal-overlay.active,.pb-v50-modal.active,.pres-overlay.active,.pres-map-modal.active,.lightbox.active,.socratic-overlay.active';

  function syncModalState(){
    document.body.classList.toggle('modal-open', Boolean(document.querySelector(MODAL_SELECTOR)));
  }

  function call(name, ...args){
    try {
      const fn = window[name];
      if (typeof fn === 'function') {
        fn.apply(window, args);
        return true;
      }
    } catch(err) {
      console.warn('[PB79] Acción recuperada:', name, err);
    }
    return false;
  }

  function setModal(id, open){
    if (typeof window.setModal === 'function' && window.setModal !== setModal) {
      try {
        const ok = window.setModal(id, open);
        syncModalState();
        return ok;
      } catch(err) {}
    }
    const modal = document.getElementById(id);
    if (!modal) return false;
    const wasOpen = modal.classList.contains('active');
    modal.classList.toggle('active', !!open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    syncModalState();
    if (open && !wasOpen) {
      if (id === 'matrixModal') call('renderMatrix');
      if (id === 'statsModal') call('drawChart');
      if (id === 'glossaryModal') call('renderGlossary');
      if (id === 'biblioModal') call('renderBibliography');
      window.setTimeout(() => {
        try { modal.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus?.({ preventScroll:true }); } catch(err) {}
      }, 40);
    }
    return true;
  }

  function runAction(action){
    if (!action || action.includes('$' + '{')) return false;
    const v68 = window.PaleoBotV68InteractionStabilizer;
    if (v68 && typeof v68.runAction === 'function') {
      try { if (v68.runAction(action)) return true; } catch(err) {}
    }
    if (action === 'runAdaptiveQuiz') return call('runAdaptiveQuiz') || setModal('examModal', true);
    if (action === 'openGlobalSearch') return call('openGlobalSearch') || setModal('globalSearchModal', true);
    if (action === 'exportPhyloSvg') return call('exportPhyloSvg');
    if (action === 'exportBuilderSvg') return call('exportBuilderSvg');
    return call(action);
  }

  function runDetailAction(action){
    if (!action || action.includes('$' + '{')) return false;
    const v68 = window.PaleoBotV68InteractionStabilizer;
    if (v68 && typeof v68.runDetailAction === 'function') {
      try { if (v68.runDetailAction(action)) return true; } catch(err) {}
    }
    if (action === 'openResearchGapModal') return call('openResearchGapModal') || setModal('researchGapModal', true);
    if (action === 'exportAcademicPDF') return call('exportAcademicPDF') || call('printFicha') || (window.print(), true);
    if (action === 'exportSpeciesPrintSheet') return call('exportSpeciesPrintSheet') || call('printFicha') || (window.print(), true);
    return call(action);
  }

  function routeView(viewId, trigger){
    if (!viewId || viewId.includes('$' + '{') || !document.getElementById('view-' + viewId)) return false;
    const routers = [window.PaleoBotV68InteractionStabilizer, window.PaleoBotV55Router, window.PaleoBotCanonicalNav];
    for (const router of routers) {
      try {
        if (router?.routeView?.(viewId, trigger)) return true;
        if (router?.activateView?.(viewId, { scroll:true })) return true;
        if (router?.setCanonical) router.setCanonical(viewId);
      } catch(err) {}
    }
    try { if (typeof window.switchView === 'function') { window.switchView(viewId, trigger); return true; } } catch(err) {}
    document.querySelectorAll('.view-section').forEach(section => {
      const active = section.id === 'view-' + viewId;
      section.classList.toggle('active', active);
      section.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    document.getElementById('view-' + viewId)?.scrollIntoView({ behavior:'smooth', block:'start' });
    return true;
  }

  function quizNext(type){
    if (type === 'generative') return call('runGenerativeQuiz') || call('runAdaptiveQuiz') || setModal('examModal', true);
    const v69 = window.PaleoBotV69QuizStartRepair;
    if (v69?.startClassicQuiz) return v69.startClassicQuiz();
    return call('runExam') || setModal('examModal', true);
  }

  function quizBack(){
    const intro = document.getElementById('examIntro');
    const q = document.getElementById('examQ');
    if (intro) intro.style.display = '';
    if (q) q.style.display = 'none';
    return true;
  }

  function priorityClick(event){
    if (!event.target?.closest) return;
    const t = event.target;

    const modalToggle = t.closest('[data-modal-toggle]');
    if (modalToggle) {
      const id = modalToggle.dataset.modalToggle;
      const modal = document.getElementById(id);
      if (!modal) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setModal(id, !modal.classList.contains('active'));
      return;
    }

    const actionEl = t.closest('[data-action],[data-pb-v50-action]');
    if (actionEl) {
      const action = actionEl.dataset.action || actionEl.dataset.pbV50Action;
      if (runAction(action)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    const detailEl = t.closest('[data-detail-action]');
    if (detailEl) {
      if (runDetailAction(detailEl.dataset.detailAction)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    const quizNextEl = t.closest('[data-quiz-next]');
    if (quizNextEl) {
      event.preventDefault();
      event.stopImmediatePropagation();
      quizNext(quizNextEl.dataset.quizNext);
      return;
    }

    const quizBackEl = t.closest('[data-quiz-back]');
    if (quizBackEl) {
      event.preventDefault();
      event.stopImmediatePropagation();
      quizBack();
      return;
    }

    const viewEl = t.closest('[data-view]');
    if (viewEl && viewEl.closest('.toolbar,.nav-bar,.fab-group,.landing-routes,.quick-start-panel,.teaching-actions,.pb-v50-module-grid,.main-cover,.learning-compass,.paleobot-cover-v45,.atlas-workbench,.view-section-header')) {
      if (routeView(viewEl.dataset.view, viewEl)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }

  function repairFaunaReinjection(){
    const fauna = window.PaleoBotV66Fauna;
    if (!fauna || !fauna.faunaBlockHtml) return;
    const grid = document.getElementById('siteGrid');
    if (!grid || grid.dataset.pbV79FaunaObserver === 'ready') return;
    grid.dataset.pbV79FaunaObserver = 'ready';
    const inject = () => {
      grid.querySelectorAll('article.site-card').forEach(card => {
        if (card.dataset.pbFaunaInjected) return;
        const id = card.dataset.siteId || card.dataset.id || card.getAttribute('data-site');
        if (!id) return;
        const block = fauna.faunaBlockHtml(id);
        if (!block) return;
        const anchor = card.querySelector('.site-card-body,.site-meta,h3') || card;
        anchor.insertAdjacentHTML(anchor === card ? 'beforeend' : 'afterend', block);
        card.dataset.pbFaunaInjected = '1';
      });
    };
    new MutationObserver(() => window.requestAnimationFrame(inject)).observe(grid, { childList:true, subtree:true });
    window.requestAnimationFrame(inject);
  }

  window.addEventListener('click', priorityClick, true);
  document.addEventListener('DOMContentLoaded', repairFaunaReinjection, { once:true });
  document.addEventListener('paleobot:viewchange', event => {
    if (event.detail?.view === 'yacimientos') window.setTimeout(repairFaunaReinjection, 120);
  });
  if (document.readyState !== 'loading') repairFaunaReinjection();

  document.documentElement.dataset.paleobotV79ConsolidatedDispatcher = 'ready';
  window.PaleoBotV79ConsolidatedDispatcher = { runAction, runDetailAction, routeView, setModal, syncModalState, repairFaunaReinjection };
})();
