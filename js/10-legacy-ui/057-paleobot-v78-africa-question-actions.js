// Recovery R25 — v78 Africa question local adapter
(function(){
  'use strict';

  function routeAfricaView(){
    const current = document.querySelector('.view-section.active')?.id;
    if (current === 'view-africa') return true;

    const routers = [
      window.PaleoBotV68InteractionStabilizer,
      window.PaleoBotV55Router,
      window.PaleoBotCanonicalNav
    ];

    for (const router of routers) {
      try {
        if (router?.routeView?.('africa')) return true;
        if (router?.activateView?.('africa', { scroll:true })) return true;
        if (router?.setCanonical) {
          router.setCanonical('africa');
          return true;
        }
      } catch(err) {}
    }

    try {
      if (typeof window.switchView === 'function') {
        window.switchView('africa');
        return true;
      }
    } catch(err) {}
    return false;
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
      const target =
        document.querySelector('.africa-layout') ||
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

  function handleDashboardClick(event){
    // Los chips regionales pertenecen al router del núcleo.
    if (event.target.closest?.('[data-africa-region]')) return;

    const direct = event.target.closest?.(
      '[data-africa-question-region], .africa-question-open'
    );
    if (direct) {
      activateAfricaRegion(direct.dataset.africaQuestionRegion);
      return;
    }

    const card = event.target.closest?.('.africa-question-card[role="button"]');
    if (!card) return;
    activateAfricaRegion(regionFromQuestionCard(card));
  }

  function handleDashboardKeydown(event){
    // Teclado de chips regionales: núcleo. Botones nativos: su click estándar.
    if (event.target.closest?.('[data-africa-region]')) return;
    if (event.target.closest?.('button,a,input,select,textarea')) return;

    const card = event.target.closest?.('.africa-question-card[role="button"]');
    if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;

    event.preventDefault(); // evita scroll con Espacio en role=button no nativo
    activateAfricaRegion(regionFromQuestionCard(card));
  }

  function installLocalQuestionActions(){
    const dashboard = document.getElementById('africaDashboard');
    if (!dashboard || dashboard.dataset.v78QuestionActions === 'ready') return false;

    dashboard.dataset.v78QuestionActions = 'ready';
    dashboard.addEventListener('click', handleDashboardClick);
    dashboard.addEventListener('keydown', handleDashboardKeydown);
    return true;
  }

  function init(){
    document.documentElement.dataset.paleobotV78Mode = 'local-question-adapter';
    installLocalQuestionActions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.PaleoBotV78AfricaQuestionActions = {
    routeAfricaView,
    activateAfricaRegion,
    regionFromQuestionCard,
    installLocalQuestionActions,
    mode:'local-question-adapter'
  };
})();
