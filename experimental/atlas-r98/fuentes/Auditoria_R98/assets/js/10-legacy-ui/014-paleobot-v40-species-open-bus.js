// Recovery R32 — v40 species service + local accessibility adapter
(function(){
  'use strict';

  function speciesById(id){
    if (!id) return null;
    try {
      if (typeof DB_INDEX !== 'undefined' && DB_INDEX[id]) return DB_INDEX[id];
      if (window.DB_INDEX?.[id]) return window.DB_INDEX[id];
      const db = Array.isArray(window.DB) ? window.DB : (typeof DB !== 'undefined' && Array.isArray(DB) ? DB : []);
      return db.find(sp => sp?.id === id) || null;
    } catch(_){
      return null;
    }
  }

  function fallbackDetail(sp){
    if (!sp) return false;
    try {
      if (typeof window.showDetail === 'function') {
        window.showDetail(sp);
        return true;
      }
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB40] fallback showDetail:', sp.id, err);
    }
    return false;
  }

  function openSpeciesById(id, source, options){
    const sp = speciesById(id);
    if (!sp) return false;
    const opts = Object.assign({ closeModal:true }, options || {});

    try {
      if (window.PaleoBot?.openSpecies) {
        const result = window.PaleoBot.openSpecies(sp.id, {
          source: source || 'v40-service',
          closeModal: opts.closeModal
        });
        if (result?.ok) return true;
      }
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB40] public openSpecies fallback:', id, err);
    }
    return fallbackDetail(sp);
  }

  function openTimelineSpeciesById(id, source){
    return openSpeciesById(id, source || 'timeline-v40-service');
  }

  function openTreeSpeciesById(id, source){
    return openSpeciesById(id, source || 'tree-v40-service');
  }

  function selectMapSpeciesById(id, source){
    const sp = speciesById(id);
    if (!sp) return false;

    try {
      if (window.PaleoBot?.selectMapSpecies) {
        const result = window.PaleoBot.selectMapSpecies(sp.id, {
          source: source || 'map-select-v40-service'
        });
        if (result?.ok) return true;
      }
      if (typeof window.selectMapSpecies === 'function') {
        window.selectMapSpecies(sp.id);
        return true;
      }
    } catch(err) {
      window.__PALEOBOT_DEBUG && console.warn('[PB40] map selection fallback:', id, err);
    }
    return false;
  }

  function openMapSpeciesById(id, source){
    return openSpeciesById(id, source || 'map-open-v40-service');
  }

  function openPhylogenySpeciesById(id, source){
    return openSpeciesById(id, source || 'phylogeny-v40-service');
  }

  function openCladogramSpeciesById(id, source){
    return openSpeciesById(id, source || 'cladogram-v40-service');
  }

  function openCoexistenceSpeciesById(id, source){
    return openSpeciesById(id, source || 'coexistence-v40-service');
  }

  function openMatrixSpeciesById(id, source){
    try {
      if (window.PaleoBot?.closeModal) window.PaleoBot.closeModal('matrixModal');
    } catch(_){}
    return openSpeciesById(
      id,
      source || 'matrix-v40-service',
      { closeModal:false }
    );
  }

  function openItinerarySpeciesById(id, source){
    try {
      if (window.PaleoBot?.itinerary?.openSpecies) {
        const result = window.PaleoBot.itinerary.openSpecies(id, {
          source: source || 'itinerary-v40-service'
        });
        if (result?.ok) return true;
      }
    } catch(_){}
    return openSpeciesById(id, source || 'itinerary-v40-service');
  }

  function tagTimelineItems(){
    document.querySelectorAll('#timelineList .species-item[data-id]').forEach(item => {
      if (!item.dataset.openSpecies) item.dataset.openSpecies = item.dataset.id;
      if (!item.getAttribute('role')) item.setAttribute('role','button');
      if (!item.getAttribute('tabindex')) item.setAttribute('tabindex','0');
    });
    return true;
  }

  function tagMapNodes(){
    const svg = document.getElementById('mapSvg');
    if (!svg) return false;
    svg.querySelectorAll('.map-node[data-id]').forEach(node => {
      const sp = speciesById(node.dataset.id);
      if (!node.getAttribute('role')) node.setAttribute('role','button');
      if (!node.getAttribute('tabindex')) node.setAttribute('tabindex','0');
      if (!node.getAttribute('aria-label')) {
        node.setAttribute(
          'aria-label',
          `Seleccionar en el mapa: ${sp?.nombre || node.dataset.nombre || node.dataset.id}`
        );
      }
    });
    return true;
  }

  function tagNonNativeSpeciesControls(root){
    const scope = root || document.getElementById('main-content');
    if (!scope?.querySelectorAll) return false;
    scope.querySelectorAll('[data-open-species][role="button"]').forEach(node => {
      if (!node.matches?.('button,a[href],input,select,textarea') &&
          !node.getAttribute('tabindex')) {
        node.setAttribute('tabindex','0');
      }
    });
    return true;
  }

  function isCoreOwnedKeyboardControl(node){
    return Boolean(node?.matches?.(
      '#timelineList .species-item[data-id], ' +
      '#view-tree .tree-item[data-id], ' +
      '.phylo-bar[data-id], ' +
      '.clado-leaf[data-id], ' +
      '.coexist-row-label[data-id], ' +
      '.matrix-row-clickable[data-open-species]'
    ));
  }

  function handleLocalSpeciesKeydown(event){
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const mapNode = event.target?.closest?.('.map-node[data-id]');
    if (mapNode) {
      event.preventDefault();
      selectMapSpeciesById(mapNode.dataset.id, 'map-node-keyboard-v40-a11y');
      return;
    }

    const trigger = event.target?.closest?.('[data-open-species][role="button"]');
    if (!trigger || isCoreOwnedKeyboardControl(trigger)) return;

    // Los controles nativos convierten Enter/Espacio en click; no duplicarlos.
    if (trigger.matches?.('button,a[href],input,select,textarea')) return;

    const id = trigger.dataset.openSpecies;
    if (!id || !speciesById(id)) return;

    event.preventDefault();
    openSpeciesById(id, 'non-native-keyboard-v40-a11y');
  }

  function refreshAccessibility(){
    tagTimelineItems();
    tagMapNodes();
    tagNonNativeSpeciesControls();
    return true;
  }

  function scheduleAccessibility(){
    window.setTimeout(refreshAccessibility, 0);
  }

  function installLocalAccessibility(){
    const main = document.getElementById('main-content');
    if (!main || main.dataset.v40SpeciesA11y === 'ready') return false;

    main.dataset.v40SpeciesA11y = 'ready';
    main.addEventListener('keydown', handleLocalSpeciesKeydown);
    return true;
  }

  function init(){
    document.body.dataset.v40SpeciesOpen = 'service-a11y-adapter';
    document.documentElement.dataset.paleobotV40Mode = 'service-a11y-adapter';
    installLocalAccessibility();
    scheduleAccessibility();
  }

  document.addEventListener('paleobot:viewchange', scheduleAccessibility);
  document.addEventListener('paleobot:v55-viewchange', scheduleAccessibility);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.PaleoBotV40SpeciesOpen = {
    openSpeciesById,
    openTimelineSpeciesById,
    openTreeSpeciesById,
    selectMapSpeciesById,
    openMapSpeciesById,
    openPhylogenySpeciesById,
    openCladogramSpeciesById,
    openCoexistenceSpeciesById,
    openMatrixSpeciesById,
    openItinerarySpeciesById,
    tagTimelineItems,
    tagMapNodes,
    tagNonNativeSpeciesControls,
    installLocalAccessibility,
    refreshAccessibility,
    mode:'service-a11y-adapter'
  };
})();
