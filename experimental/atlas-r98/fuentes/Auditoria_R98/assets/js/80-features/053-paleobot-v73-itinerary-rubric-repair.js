// Recovery R22 — v73 itinerary/didactic adapter
(function(){
  'use strict';

  function routeView(viewId){
    if (!viewId) return false;
    try {
      if (window.PaleoBotV68InteractionStabilizer?.routeView?.(viewId)) return true;
      if (window.PaleoBotV55Router?.activateView?.(viewId, { scroll:true })) return true;
      if (window.PaleoBotCanonicalNav?.setCanonical) window.PaleoBotCanonicalNav.setCanonical(viewId);
      if (typeof window.switchView === 'function') { window.switchView(viewId); return true; }
      if (typeof switchView === 'function') { switchView(viewId); return true; }
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB73] No se pudo enrutar vista:', viewId, err);
    }
    const section = document.getElementById('view-' + viewId);
    if (section) {
      document.querySelectorAll('.view-section').forEach(el => el.classList.toggle('active', el === section));
      section.scrollIntoView({ behavior:'smooth', block:'start' });
      return true;
    }
    return false;
  }

  function selectItinerary(index){
    const idx = Number(index);
    if (!Number.isInteger(idx) || idx < 0) return false;
    try {
      if (window.PaleoBot?.itinerary?.select) {
        const result = window.PaleoBot.itinerary.select(idx);
        return !!(result && result.ok);
      }
      if (typeof window.selectItinerary === 'function') return !!window.selectItinerary(idx);
      if (typeof selectItinerary === 'function') return !!selectItinerary(idx);
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB73] No se pudo seleccionar itinerario:', err);
    }
    return false;
  }

  function startItinerary(index){
    const idx = Number.isInteger(Number(index)) ? Number(index) : 0;
    const routed = routeView('itinerarios');
    const selected = selectItinerary(idx);
    if (selected) {
      document.querySelectorAll('.itin-btn').forEach((btn, i) => {
        const active = i === idx;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      window.setTimeout(() => {
        document.getElementById('itinBody')?.scrollIntoView({ behavior:'smooth', block:'nearest' });
      }, 0);
    }
    return routed && selected;
  }

  function navigateItinerary(delta){
    try {
      if (window.PaleoBot?.itinerary?.navigate) {
        const result = window.PaleoBot.itinerary.navigate(delta);
        return !!(result && result.ok);
      }
      if (typeof window.itinNav === 'function') return !!window.itinNav(delta);
      if (typeof itinNav === 'function') return !!itinNav(delta);
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB73] No se pudo navegar itinerario:', err);
    }
    return false;
  }

  function renderRubricRows(){
    const body = document.getElementById('deaRubricBody');
    if (!body || body.children.length) return false;
    const rows = Array.isArray(window.TEACHING_COMPETENCY_RUBRIC)
      ? window.TEACHING_COMPETENCY_RUBRIC
      : (typeof TEACHING_COMPETENCY_RUBRIC !== 'undefined' ? TEACHING_COMPETENCY_RUBRIC : []);
    body.innerHTML = rows.map(item => `
      <tr>
        <td>${escapeHtmlText(item.criterion || '')}</td>
        <td>${escapeHtmlText(item.basic || '')}</td>
        <td>${escapeHtmlText(item.advanced || '')}</td>
        <td>${escapeHtmlText(item.expert || '')}</td>
      </tr>`).join('');
    return true;
  }

  function toggleRubric(forceOpen){
    const panel = document.getElementById('deaRubricPanel');
    const btn = document.getElementById('deaRubricToggle') || document.querySelector('[data-dea-rubric-toggle]');
    if (!panel) return false;
    const open = forceOpen === undefined ? !panel.classList.contains('open') : Boolean(forceOpen);
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (open) renderRubricRows();
    return true;
  }

  function installDeaStartBridge(){
    // El CTA DEA combina data-view + data-itinerary-select.
    // El router central procesa data-view primero; este listener LOCAL
    // selecciona el itinerario sin impedir que el click burbujee al router.
    const trigger = document.querySelector(
      '#deaWelcome .dea-start-btn[data-itinerary-select][data-view="itinerarios"]'
    );
    if (!trigger || trigger.dataset.v73Bridge === 'ready') return false;

    trigger.dataset.v73Bridge = 'ready';
    trigger.addEventListener('click', function(){
      const index = Number(trigger.dataset.itinerarySelect || 0);
      selectItinerary(index);
    });
    return true;
  }

  function init(){
    document.documentElement.dataset.paleobotV73Mode = 'didactic-local-adapter';
    installDeaStartBridge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.PaleoBotV73ItineraryRubricRepair = {
    routeView,
    selectItinerary,
    startItinerary,
    navigateItinerary,
    renderRubricRows,
    toggleRubric,
    installDeaStartBridge,
    mode:'didactic-local-adapter'
  };
})();
