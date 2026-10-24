// Recovery R37 — v42 passive detail-state / ARIA adapter
(function(){
  'use strict';

  let observer = null;

  function panel(){
    return document.getElementById('detailView');
  }

  function normalizeDetailPanel(){
    const p = panel();
    if (!p) return false;

    document.body.dataset.v42DetailRepair = 'passive-state-adapter';
    const active = p.classList.contains('active');

    // R90-P1: escritura idempotente. setAttribute con el mismo valor encola
    // igualmente un registro de mutación (DOM Standard, «change an attribute»)
    // y re-disparaba este mismo observador en bucle infinito de microtareas.
    const nextHidden = active ? 'false' : 'true';
    if (p.getAttribute('aria-hidden') !== nextHidden) p.setAttribute('aria-hidden', nextHidden);
    if (active) p.removeAttribute('inert');

    // Respetar el roving tabindex canónico de core/v43:
    // solo la pestaña activa/seleccionada queda en 0.
    p.querySelectorAll('[role="tab"], .tab-item').forEach(tab => {
      const selected = tab.classList.contains('active') ||
        tab.getAttribute('aria-selected') === 'true';
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      tab.dataset.v42Tab = 'ready';
    });

    p.querySelectorAll('[data-panel-close], .panel-close, .panel-back-btn').forEach(btn => {
      btn.dataset.v42Close = 'ready';
      btn.removeAttribute('disabled');
    });

    return true;
  }

  function installPassiveObserver(){
    const p = panel();
    if (!p || p.dataset.v42Observer === 'ready') return false;

    p.dataset.v42Observer = 'ready';

    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(() => normalizeDetailPanel());
      observer.observe(p, {
        attributes:true,
        attributeFilter:['class','aria-hidden']
      });
    }

    return true;
  }

  function init(){
    document.documentElement.dataset.paleobotV42Mode = 'passive-detail-state-adapter';
    installPassiveObserver();
    normalizeDetailPanel();
  }

  document.addEventListener('paleobot:species-opened', normalizeDetailPanel);
  document.addEventListener('paleobot:viewchange', normalizeDetailPanel);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.PaleoBotV42DetailRepair = {
    normalizeDetailPanel,
    installPassiveObserver,
    mode:'passive-detail-state-adapter'
  };
})();
