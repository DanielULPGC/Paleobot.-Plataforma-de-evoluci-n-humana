// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v73-itinerary-rubric-repair
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
      console.warn('[PB73] No se pudo enrutar vista:', viewId, err);
    }
    const section = document.getElementById('view-' + viewId);
    if (section) {
      document.querySelectorAll('.view-section').forEach(el => el.classList.toggle('active', el === section));
      section.scrollIntoView({ behavior:'smooth', block:'start' });
      return true;
    }
    return false;
  }

  function startItinerary(index){
    const idx = Number.isFinite(index) ? index : 0;
    routeView('itinerarios');
    window.setTimeout(() => {
      try {
        if (typeof window.selectItinerary === 'function') window.selectItinerary(idx);
        else if (typeof selectItinerary === 'function') selectItinerary(idx);
        else return;
        document.querySelectorAll('.itin-btn').forEach((btn, i) => {
          const active = i === idx;
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-pressed', String(active));
        });
        document.getElementById('itinBody')?.scrollIntoView({ behavior:'smooth', block:'nearest' });
      } catch(err) {
        console.warn('[PB73] No se pudo iniciar itinerario:', err);
      }
    }, 80);
  }

  function navigateItinerary(delta){
    try {
      if (typeof window.itinNav === 'function') window.itinNav(delta);
      else if (typeof itinNav === 'function') itinNav(delta);
      else return false;
      return true;
    } catch(err) {
      console.warn('[PB73] No se pudo avanzar itinerario:', err);
      return false;
    }
  }

  function renderRubricRows(){
    const body = document.getElementById('deaRubricBody');
    if (!body || body.children.length) return;
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
  }

  function toggleRubric(forceOpen){
    const panel = document.getElementById('deaRubricPanel');
    const btn = document.getElementById('deaRubricToggle') || document.querySelector('[data-dea-rubric-toggle]');
    if (!panel) return false;
    const open = forceOpen === undefined ? !panel.classList.contains('open') : Boolean(forceOpen);
    panel.classList.toggle('open', open);
    panel.hidden = false;
    panel.style.display = open ? 'block' : '';
    panel.setAttribute('aria-hidden', String(!open));
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (open) {
      renderRubricRows();
      window.setTimeout(() => panel.scrollIntoView({ behavior:'smooth', block:'nearest' }), 30);
    }
    return true;
  }

  document.addEventListener('pointerdown', function(event){
    const itinerary = event.target.closest && event.target.closest('[data-itinerary-select]');
    const rubric = event.target.closest && event.target.closest('[data-dea-rubric-toggle]');
    if (!itinerary && !rubric) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (itinerary) startItinerary(Number(itinerary.dataset.itinerarySelect || 0));
    if (rubric) toggleRubric();
  }, true);

  document.addEventListener('click', function(event){
    const itinerary = event.target.closest && event.target.closest('[data-itinerary-select]');
    if (itinerary) {
      event.preventDefault();
      event.stopImmediatePropagation();
      startItinerary(Number(itinerary.dataset.itinerarySelect || 0));
      return;
    }
    const nav = event.target.closest && event.target.closest('[data-itin-nav]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigateItinerary(Number(nav.dataset.itinNav || 0));
      return;
    }
    const rubric = event.target.closest && event.target.closest('[data-dea-rubric-toggle]');
    if (rubric) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleRubric();
    }
  }, true);

  document.addEventListener('keydown', function(event){
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const itinerary = event.target.closest && event.target.closest('[data-itinerary-select]');
    const nav = event.target.closest && event.target.closest('[data-itin-nav]');
    const rubric = event.target.closest && event.target.closest('[data-dea-rubric-toggle]');
    if (!itinerary && !nav && !rubric) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (itinerary) startItinerary(Number(itinerary.dataset.itinerarySelect || 0));
    if (nav) navigateItinerary(Number(nav.dataset.itinNav || 0));
    if (rubric) toggleRubric();
  }, true);

  window.PaleoBotV73ItineraryRubricRepair = { startItinerary, navigateItinerary, toggleRubric };
})();
