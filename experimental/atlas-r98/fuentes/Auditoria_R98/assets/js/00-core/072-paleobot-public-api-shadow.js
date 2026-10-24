(function(){
  'use strict';

  /**
   * PaleoBot Public API — recovery R1 / shadow facade
   * -------------------------------------------------
   * Objetivo:
   * - ofrecer una única entrada estable para funciones de alto nivel;
   * - NO interceptar ni reemplazar handlers existentes todavía;
   * - delegar en APIs ya presentes y registrar diagnóstico.
   *
   * Esta capa es aditiva y no destructiva.
   */

  const previous = (window.PaleoBot && typeof window.PaleoBot === 'object') ? window.PaleoBot : {};
  const api = Object.assign({}, previous);

  function getDbIndex() {
    return (window.DB_INDEX && typeof window.DB_INDEX === 'object') ? window.DB_INDEX : {};
  }

  function getSpecies(idOrSpecies) {
    if (!idOrSpecies) return null;
    if (typeof idOrSpecies === 'object' && idOrSpecies.id) return idOrSpecies;
    return getDbIndex()[String(idOrSpecies)] || null;
  }

  function activeModalIds() {
    const selectors = [
      '.modal-overlay.active',
      '.pb-v50-modal.active',
      '.pres-overlay.active',
      '.pres-map-modal.active',
      '.lightbox.active',
      '.socratic-overlay.active',
      '[aria-modal="true"].active'
    ];
    const seen = new Set();
    const ids = [];
    document.querySelectorAll(selectors.join(',')).forEach(function(el){
      const key = el.id || el.getAttribute('data-modal-id') || el.className || el.tagName;
      if (!seen.has(key)) {
        seen.add(key);
        ids.push(el.id || null);
      }
    });
    return ids;
  }

  function closeModal(id, options) {
    const opts = options || {};
    if (!id) return opts.returnDetails ? { ok:false, id:null, reason:'missing-id' } : false;

    const modal = document.getElementById(id);
    if (!modal) {
      return opts.returnDetails ? { ok:false, id:id, reason:'modal-not-found' } : false;
    }

    const wasActive = modal.classList.contains('active');

    // Caso especializado: buscador global v86.
    if (id === 'globalSearchModal' &&
        window.PaleoBotV86GlobalSearchFinal &&
        typeof window.PaleoBotV86GlobalSearchFinal.closeModal === 'function') {
      try { window.PaleoBotV86GlobalSearchFinal.closeModal(); } catch (_) {}
    } else if (window.PaleoBotV68InteractionStabilizer &&
               typeof window.PaleoBotV68InteractionStabilizer.setModal === 'function') {
      try { window.PaleoBotV68InteractionStabilizer.setModal(id, false); } catch (_) {}
    } else if (wasActive && typeof window.toggleModal === 'function') {
      try { window.toggleModal(id); } catch (_) {}
    }

    // Fallback determinista si ninguna capa anterior cerró el modal.
    if (modal.classList.contains('active')) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }

    if (window.PaleoBotModalStateReconciler &&
        typeof window.PaleoBotModalStateReconciler.reconcile === 'function') {
      try { window.PaleoBotModalStateReconciler.reconcile(); } catch (_) {}
    }

    const ok = !modal.classList.contains('active');
    if (opts.returnDetails) return { ok:ok, id:id, wasActive:wasActive };
    return ok;
  }

  function closeActiveModal(options) {
    const opts = options || {};
    let closed = false;

    // Caso conocido: buscador global v86.
    const searchModal = document.getElementById('globalSearchModal');
    if (searchModal && searchModal.classList.contains('active') &&
        window.PaleoBotV86GlobalSearchFinal &&
        typeof window.PaleoBotV86GlobalSearchFinal.closeModal === 'function') {
      window.PaleoBotV86GlobalSearchFinal.closeModal();
      closed = true;
    }

    // Para otros modales, reutilizar el estabilizador v68 cuando exista.
    const ids = activeModalIds().filter(Boolean);
    if (ids.length && window.PaleoBotV68InteractionStabilizer &&
        typeof window.PaleoBotV68InteractionStabilizer.setModal === 'function') {
      ids.forEach(function(id){
        if (id !== 'globalSearchModal') {
          try {
            if (window.PaleoBotV68InteractionStabilizer.setModal(id, false)) closed = true;
          } catch (_) {}
        }
      });
    }

    if (window.PaleoBotModalStateReconciler &&
        typeof window.PaleoBotModalStateReconciler.reconcile === 'function') {
      try { window.PaleoBotModalStateReconciler.reconcile(); } catch (_) {}
    }

    if (opts.returnDetails) {
      return { closed: closed, remaining: activeModalIds() };
    }
    return closed;
  }

  function openSpecies(idOrSpecies, options) {
    const opts = Object.assign({ source: 'unknown', closeModal: true }, options || {});
    const sp = getSpecies(idOrSpecies);
    if (!sp) {
      return { ok: false, reason: 'species-not-found', id: String(idOrSpecies || '') };
    }

    if (opts.closeModal) closeActiveModal();

    if (typeof window.showDetail !== 'function') {
      return { ok: false, reason: 'showDetail-unavailable', id: sp.id };
    }

    try {
      window.showDetail(sp);
      document.documentElement.dataset.pbLastSpeciesSource = String(opts.source || 'unknown');
      document.documentElement.dataset.pbLastSpeciesId = String(sp.id);
      return { ok: true, id: sp.id, source: opts.source || 'unknown' };
    } catch (error) {
      console.error('[PaleoBot API] openSpecies failed', error);
      return { ok: false, reason: 'exception', id: sp.id, error: String(error && error.message || error) };
    }
  }

  function mediaForSpecies(idOrSpecies, options) {
    const opts = options || {};
    const sp = getSpecies(idOrSpecies);
    if (!sp) return null;

    if (typeof window.getSpeciesMedia === 'function') {
      const media = window.getSpeciesMedia(sp);
      if (opts.size && typeof window.getSpeciesThumb === 'function') {
        return Object.assign({}, media, { requestedUrl: window.getSpeciesThumb(sp, opts.size) });
      }
      return media;
    }

    return {
      url: sp.imagen || '',
      thumbUrl: sp.imagen || '',
      provisionalFallback: true
    };
  }

  function selectMapSpecies(idOrSpecies, options) {
    const opts = Object.assign({ source: 'unknown' }, options || {});
    const sp = getSpecies(idOrSpecies);
    if (!sp) {
      return { ok: false, reason: 'species-not-found', id: String(idOrSpecies || '') };
    }

    if (typeof window.selectMapSpecies !== 'function') {
      return { ok: false, reason: 'selectMapSpecies-unavailable', id: sp.id };
    }

    try {
      window.selectMapSpecies(sp.id);
      document.documentElement.dataset.pbLastMapSelectionSource = String(opts.source || 'unknown');
      document.documentElement.dataset.pbLastMapSelectionId = String(sp.id);
      return { ok: true, id: sp.id, source: opts.source || 'unknown' };
    } catch (error) {
      console.error('[PaleoBot API] selectMapSpecies failed', error);
      return { ok: false, reason: 'exception', id: sp.id, error: String(error && error.message || error) };
    }
  }

  function dispersalGetState() {
    if (typeof window.getDispersalStateSnapshot !== 'function') {
      return { ok:false, reason:'getDispersalStateSnapshot-unavailable' };
    }
    return { ok:true, state:window.getDispersalStateSnapshot() };
  }

  function dispersalGetRoutes() {
    if (typeof window.getDispersalRoutesSnapshot !== 'function') {
      return { ok:false, reason:'getDispersalRoutesSnapshot-unavailable' };
    }
    return { ok:true, routes:window.getDispersalRoutesSnapshot() };
  }

  function dispersalSetRoute(id, active) {
    if (typeof window.setDispersalRouteActive !== 'function') {
      return { ok:false, reason:'setDispersalRouteActive-unavailable', id:String(id || '') };
    }
    const ok = window.setDispersalRouteActive(id, active);
    return { ok:!!ok, id:String(id || ''), active:!!active };
  }

  function dispersalToggleRoute(id, button) {
    if (typeof window.toggleDispersalRoute !== 'function') {
      return { ok:false, reason:'toggleDispersalRoute-unavailable', id:String(id || '') };
    }
    const active = window.toggleDispersalRoute(id, button);
    if (active === null) return { ok:false, reason:'unknown-route', id:String(id || '') };
    return { ok:true, id:String(id), active:!!active };
  }

  function dispersalSetTime(value) {
    if (typeof window.setDispersalTime !== 'function') {
      return { ok:false, reason:'setDispersalTime-unavailable' };
    }
    return { ok:true, time:window.setDispersalTime(value) };
  }

  function dispersalSetSpeed(value) {
    if (typeof window.setDispersalSpeed !== 'function') {
      return { ok:false, reason:'setDispersalSpeed-unavailable' };
    }
    return { ok:true, speed:window.setDispersalSpeed(value) };
  }

  function dispersalSetPlaying(playing) {
    if (typeof window.setDispersalPlaying !== 'function') {
      return { ok:false, reason:'setDispersalPlaying-unavailable' };
    }
    return { ok:true, playing:window.setDispersalPlaying(playing) };
  }

  function dispersalTogglePlay() {
    if (typeof window.toggleDispersalPlay !== 'function') {
      return { ok:false, reason:'toggleDispersalPlay-unavailable' };
    }
    return { ok:true, playing:window.toggleDispersalPlay() };
  }

  function itineraryGetCatalog() {
    if (typeof window.getItineraryCatalogSnapshot !== 'function') {
      return { ok:false, reason:'getItineraryCatalogSnapshot-unavailable' };
    }
    return { ok:true, itineraries:window.getItineraryCatalogSnapshot() };
  }

  function itineraryGetState() {
    if (typeof window.getItineraryStateSnapshot !== 'function') {
      return { ok:false, reason:'getItineraryStateSnapshot-unavailable' };
    }
    return { ok:true, state:window.getItineraryStateSnapshot() };
  }

  function itinerarySelect(index) {
    if (typeof window.selectItinerary !== 'function') {
      return { ok:false, reason:'selectItinerary-unavailable', index:Number(index) };
    }
    const ok = window.selectItinerary(index);
    return { ok:!!ok, index:Number(index), state:typeof window.getItineraryStateSnapshot === 'function' ? window.getItineraryStateSnapshot() : null };
  }

  function itineraryNavigate(delta) {
    if (typeof window.itinNav !== 'function') {
      return { ok:false, reason:'itinNav-unavailable', delta:Number(delta) };
    }
    const ok = window.itinNav(delta);
    return { ok:!!ok, delta:Number(delta), state:typeof window.getItineraryStateSnapshot === 'function' ? window.getItineraryStateSnapshot() : null };
  }

  function itineraryOpenSpecies(idOrSpecies, options) {
    const opts = Object.assign({ source:'itinerary' }, options || {});
    return openSpecies(idOrSpecies, { source:opts.source, closeModal:true });
  }

  function itineraryOpenCurrentSpecies(options) {
    if (typeof window.getItineraryStateSnapshot !== 'function') {
      return { ok:false, reason:'getItineraryStateSnapshot-unavailable' };
    }
    const state = window.getItineraryStateSnapshot();
    if (!state || !state.currentSpeciesId) return { ok:false, reason:'no-current-species' };
    return itineraryOpenSpecies(state.currentSpeciesId, options);
  }

  function health() {
    const db = Array.isArray(window.DB) ? window.DB : [];
    const ids = db.map(function(sp){ return sp && sp.id; }).filter(Boolean);
    const duplicates = ids.filter(function(id, i){ return ids.indexOf(id) !== i; });

    return {
      apiVersion: 'recovery-r11-shadow',
      mode: 'shadow',
      coreBridge: !!window.__PB_CORE_BRIDGE_REACHED,
      taxonCount: db.length,
      duplicateIds: Array.from(new Set(duplicates)),
      showDetail: typeof window.showDetail === 'function',
      mediaApi: typeof window.getSpeciesMedia === 'function',
      mapSelectionApi: typeof window.selectMapSpecies === 'function',
      dispersalApi: typeof window.getDispersalStateSnapshot === 'function' &&
                    typeof window.setDispersalRouteActive === 'function',
      itineraryApi: typeof window.getItineraryStateSnapshot === 'function' &&
                    typeof window.selectItinerary === 'function' &&
                    typeof window.itinNav === 'function',
      modalReconciler: !!window.PaleoBotModalStateReconciler,
      interactionStabilizer: !!window.PaleoBotV68InteractionStabilizer,
      globalSearchV86: !!window.PaleoBotV86GlobalSearchFinal,
      activeModals: activeModalIds(),
      detailViewPresent: !!document.getElementById('detailView'),
      lazyLoaderState: document.documentElement.dataset.paleobotV69LazyLoader || 'not-started'
    };
  }

  function auditSpeciesOpen(id) {
    const sp = getSpecies(id);
    return {
      id: id,
      exists: !!sp,
      hasCanonicalMedia: !!(sp && mediaForSpecies(sp)),
      showDetailAvailable: typeof window.showDetail === 'function',
      activeModals: activeModalIds()
    };
  }

  api.version = 'recovery-r11-shadow';
  api.mode = 'shadow';
  api.getSpecies = getSpecies;
  api.openSpecies = openSpecies;
  api.closeModal = closeModal;
  api.closeActiveModal = closeActiveModal;
  api.mediaForSpecies = mediaForSpecies;
  api.selectMapSpecies = selectMapSpecies;
  api.activeModalIds = activeModalIds;
  api.health = health;
  api.auditSpeciesOpen = auditSpeciesOpen;
  api.dispersal = {
    getState: dispersalGetState,
    getRoutes: dispersalGetRoutes,
    setRoute: dispersalSetRoute,
    toggleRoute: dispersalToggleRoute,
    setTime: dispersalSetTime,
    setSpeed: dispersalSetSpeed,
    setPlaying: dispersalSetPlaying,
    togglePlay: dispersalTogglePlay
  };
  api.itinerary = {
    getCatalog: itineraryGetCatalog,
    getState: itineraryGetState,
    select: itinerarySelect,
    navigate: itineraryNavigate,
    openSpecies: itineraryOpenSpecies,
    openCurrentSpecies: itineraryOpenCurrentSpecies
  };

  window.PaleoBot = api;
  document.documentElement.dataset.paleobotPublicApi = api.version;

  window.__PALEOBOT_DEBUG && console.info('[PaleoBot] Public API shadow facade ready:', api.version);
})();
