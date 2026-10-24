(function(){
  'use strict';

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function dbFind(id) {
    const db = Array.isArray(window.DB) ? window.DB : [];
    return db.find(function(sp){
      return sp && (sp.id === id || sp.slug === id || sp.nombre === id || sp.nombreCorto === id);
    }) || null;
  }

  function getSpeciesId(trigger) {
    if (!trigger) return '';
    return trigger.dataset.openSpecies ||
      trigger.dataset.id ||
      trigger.dataset.speciesId ||
      trigger.getAttribute('data-open-detail') ||
      '';
  }

  function normalizeDetailPanel(id) {
    const panel = document.getElementById('detailView');
    if (!panel) return;
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    if (id) {
      panel.dataset.v87LastSpecies = id;
      panel.dataset.v40LastSpecies = id;
      document.body.dataset.v40LastSpecies = id;
    }
  }

  function openSpecies(id, source) {
    if (!id) return false;
    const sp = dbFind(id);
    if (!sp) return false;
    try {
      if (typeof window.showDetail === 'function') {
        window.showDetail(sp);
        normalizeDetailPanel(sp.id || id);
        document.documentElement.dataset.paleobotV87DetailOpen = sp.id || id;
        return true;
      }
    } catch (error) {
      console.warn('[PB87] showDetail falló; intentando clic fallback', error);
    }
    const fallback = document.querySelector('[data-id="' + cssEscape(id) + '"],[data-open-species="' + cssEscape(id) + '"]');
    if (fallback && fallback !== source) {
      fallback.click();
      normalizeDetailPanel(id);
      return true;
    }
    return false;
  }

  function triggerFrom(target) {
    return target && target.closest && target.closest([
      '[data-open-species]',
      '.species-item[data-id]',
      '.tree-item[data-id]',
      '[data-open-detail]',
      '[data-quiz-open-species]',
      '[data-show-map-species]'
    ].join(','));
  }

  function handlePointerOpen(event) {
    const trigger = triggerFrom(event.target);
    if (!trigger) return;
    const id = getSpeciesId(trigger) || trigger.dataset.quizOpenSpecies || trigger.dataset.showMapSpecies;
    if (!id) return;
    if (openSpecies(id, trigger)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function handleKeyOpen(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = triggerFrom(event.target);
    if (!trigger) return;
    const id = getSpeciesId(trigger) || trigger.dataset.quizOpenSpecies || trigger.dataset.showMapSpecies;
    if (!id) return;
    if (openSpecies(id, trigger)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  window.addEventListener('click', handlePointerOpen, true);
  window.addEventListener('keydown', handleKeyOpen, true);
  document.addEventListener('click', handlePointerOpen, true);
  document.addEventListener('keydown', handleKeyOpen, true);

  window.PaleoBotV87DetailCardOpenFinal = { openSpecies: openSpecies, normalizeDetailPanel: normalizeDetailPanel };
  document.documentElement.dataset.paleobotV87DetailCardOpenFinal = 'ready';
})();
