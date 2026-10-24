// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v78-africa-question-actions
(function(){
  'use strict';

  function routeAfricaView(){
    const current = document.querySelector('.view-section.active')?.id;
    if (current === 'view-africa') return;
    const routers = [window.PaleoBotV68InteractionStabilizer, window.PaleoBotV55Router, window.PaleoBotCanonicalNav];
    for (const router of routers) {
      try {
        if (router?.routeView?.('africa')) return;
        if (router?.activateView?.('africa', { scroll:true })) return;
        if (router?.setCanonical) { router.setCanonical('africa'); return; }
      } catch(err) {}
    }
    try { if (typeof window.switchView === 'function') window.switchView('africa'); } catch(err) {}
  }

  function activateAfricaRegion(regionId){
    if (!regionId) return false;
    routeAfricaView();
    try {
      if (typeof window.selectAfricaRegion === 'function') {
        window.selectAfricaRegion(regionId);
      } else if (typeof selectAfricaRegion === 'function') {
        selectAfricaRegion(regionId);
      } else {
        window.africaActiveRegionId = regionId;
        if (typeof window.renderAfricaView === 'function') window.renderAfricaView();
      }
    } catch(err) {
      try {
        window.africaActiveRegionId = regionId;
        if (typeof renderAfricaView === 'function') renderAfricaView();
      } catch(_) {}
    }
    window.setTimeout(() => {
      const target = document.querySelector('.africa-layout') ||
        document.querySelector('.africa-region-card.active') ||
        document.getElementById('africaDashboard');
      target?.scrollIntoView?.({ behavior:'smooth', block:'start' });
    }, 80);
    return true;
  }

  function regionFromQuestionCard(card){
    if (!card) return '';
    const explicit = card.dataset.africaQuestionRegion;
    if (explicit) return explicit;
    const chip = card.querySelector('[data-africa-region]');
    return chip?.dataset.africaRegion || '';
  }

  function handle(event){
    const regionChip = event.target.closest?.('[data-africa-region]');
    if (regionChip) {
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      activateAfricaRegion(regionChip.dataset.africaRegion);
      return;
    }
    const direct = event.target.closest?.('[data-africa-question-region], .africa-question-open');
    if (direct) {
      event.preventDefault();
      event.stopImmediatePropagation();
      activateAfricaRegion(direct.dataset.africaQuestionRegion);
      return;
    }
    const card = event.target.closest?.('.africa-question-card[role="button"]');
    if (!card) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activateAfricaRegion(regionFromQuestionCard(card));
  }

  window.addEventListener('click', handle, true);
  window.addEventListener('keydown', handle, true);
  window.PaleoBotV78AfricaQuestionActions = { activateAfricaRegion };
})();
