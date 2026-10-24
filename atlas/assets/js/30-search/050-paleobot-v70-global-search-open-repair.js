// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v70-global-search-open-repair
(function(){
  'use strict';

  function closeSearchModal(){
    const modal = document.getElementById('globalSearchModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.toggle('modal-open', Boolean(document.querySelector(
      '.modal-overlay.active,.pb-v50-modal.active,.pres-overlay.active,.pres-map-modal.active,.lightbox.active,.socratic-overlay.active'
    )));
  }

  function routeView(viewId){
    if (!viewId) return false;
    const router = window.PaleoBotV68InteractionStabilizer || window.PaleoBotV55Router || window.PaleoBotCanonicalNav;
    try {
      if (router && typeof router.routeView === 'function' && router.routeView(viewId)) return true;
      if (router && typeof router.activateView === 'function' && router.activateView(viewId, { scroll:true })) return true;
      if (router && typeof router.setCanonical === 'function') router.setCanonical(viewId);
      if (typeof window.switchView === 'function') { window.switchView(viewId); return true; }
      if (typeof window.renderActiveView === 'function') { window.renderActiveView(viewId); return true; }
    } catch(err) {
      console.warn('[PB70] No se pudo enrutar vista:', viewId, err);
    }
    return false;
  }

  function openTaxon(id){
    const sp = (window.DB_INDEX && window.DB_INDEX[id]) ||
      (Array.isArray(window.DB) ? window.DB.find(item => item && item.id === id) : null);
    if (!sp) return false;
    closeSearchModal();
    if (typeof window.showDetail === 'function') {
      try {
        window.showDetail(sp);
        return true;
      } catch(err) {
        console.warn('[PB70] showDetail fallo, intentando disparador DOM:', err);
      }
    }
    routeView('timeline');
    window.setTimeout(() => {
      const selector = [
        `[data-open-species="${CSS.escape(id)}"]`,
        `#timelineList .species-item[data-id="${CSS.escape(id)}"]`,
        `.species-item[data-id="${CSS.escape(id)}"]`,
        `[data-id="${CSS.escape(id)}"]`
      ].join(',');
      document.querySelector(selector)?.click?.();
    }, 120);
    return true;
  }

  function openGlossaryTerm(term){
    closeSearchModal();
    try {
      if (typeof window.openGlossary === 'function') window.openGlossary();
      else if (window.PaleoBotV68InteractionStabilizer?.setModal) window.PaleoBotV68InteractionStabilizer.setModal('glossaryModal', true);
    } catch(err) {}
    window.setTimeout(() => {
      const input = document.querySelector('[data-gloss-search]') || document.getElementById('glossarySearch');
      if (input) {
        input.value = term;
        input.dispatchEvent(new Event('input', { bubbles:true }));
      }
    }, 160);
    return true;
  }

  function getCurrentResults(){
    const input = document.getElementById('gsInput');
    const query = input ? input.value.trim() : '';
    if (!query || !window.PaleoBotV63 || typeof window.PaleoBotV63.search !== 'function') return [];
    try { return window.PaleoBotV63.search(query, 12) || []; }
    catch(err) { return []; }
  }

  function activateSearchResult(index){
    const result = getCurrentResults()[index];
    if (!result) return false;
    if (result.type === 'taxon') return openTaxon(result.id);
    if (result.type === 'vista') {
      closeSearchModal();
      return routeView(result.id);
    }
    if (result.type === 'glosario') return openGlossaryTerm(result.id || result.title);
    closeSearchModal();
    try {
      if (typeof result.action === 'function') result.action();
      return true;
    } catch(err) {
      console.warn('[PB70] Resultado de busqueda no activable:', err);
      return false;
    }
  }

  document.addEventListener('click', function(event){
    const resultButton = event.target.closest && event.target.closest('#globalSearchModal .gs-result');
    if (!resultButton) return;
    const index = Number(resultButton.dataset.gsIndex || 0);
    event.preventDefault();
    event.stopImmediatePropagation();
    activateSearchResult(index);
  }, true);

  document.addEventListener('keydown', function(event){
    const input = event.target && event.target.id === 'gsInput' ? event.target : null;
    if (!input) return;
    if (event.key === 'Enter') {
      const selected = document.querySelector('#globalSearchModal .gs-result[aria-selected="true"]');
      const index = selected ? Number(selected.dataset.gsIndex || 0) : 0;
      event.preventDefault();
      event.stopImmediatePropagation();
      activateSearchResult(index);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeSearchModal();
    }
  }, true);

  window.PaleoBotV70GlobalSearchOpenRepair = { activateSearchResult, openTaxon, routeView, closeSearchModal };
})();
