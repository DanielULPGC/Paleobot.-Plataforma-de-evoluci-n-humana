// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v48-map-controls-repair
(function(){
  function ev(name){ return typeof window[name] !== 'undefined' ? window[name] : undefined; }
  function call(name, ...args){
    try {
      const fn = window[name] || ev(name);
      if (typeof fn === 'function') { fn.apply(window, args); return true; }
    } catch(err) {
      console.warn('v48 recupera mapa:', name, err);
    }
    return false;
  }
  function setReadout(text){
    const ro = document.getElementById('mapZoomReadout');
    if (ro) ro.textContent = text;
  }
  function fallbackZoom(mode){
    const svg = document.getElementById('mapSvg');
    if (!svg) return false;
    const current = (svg.getAttribute('viewBox') || '0 0 1000 500').split(/\s+/).map(Number);
    let [x,y,w,h] = current.length === 4 && current.every(Number.isFinite) ? current : [0,0,1000,500];
    const cx = x + w / 2, cy = y + h / 2;
    if (mode === 'reset') { x = 0; y = 0; w = 1000; h = 500; }
    if (mode === 'in') { w = Math.max(125, w / 1.35); h = w / 2; x = cx - w / 2; y = cy - h / 2; }
    if (mode === 'out') { w = Math.min(1000, w * 1.35); h = w / 2; x = Math.max(0, cx - w / 2); y = Math.max(0, cy - h / 2); }
    svg.setAttribute('viewBox', `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
    setReadout(`${Math.round(1000 / w * 100)}%`);
    document.body.dataset.v48MapZoom = mode;
    return true;
  }
  function mapZoom(mode){
    if (!mode) return false;
    if (call('setMapZoom', mode)) { document.body.dataset.v48MapZoom = 'native:' + mode; return true; }
    return fallbackZoom(mode);
  }
  function mapLayer(layer){
    if (!layer) return false;
    if (call('switchMapLayer', layer)) { document.body.dataset.v48MapLayer = 'native:' + layer; return true; }
    document.querySelectorAll('[data-map-layer]').forEach(btn => {
      const active = btn.dataset.mapLayer === layer;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    document.body.dataset.v48MapLayer = 'fallback:' + layer;
    return true;
  }
  function mapLens(lens){
    if (!lens) return false;
    if (call('setMapLensFocus', lens)) { document.body.dataset.v48MapLens = 'native:' + lens; return true; }
    document.querySelectorAll('[data-map-lens]').forEach(btn => btn.classList.toggle('active', btn.dataset.mapLens === lens));
    if (lens === 'all') fallbackZoom('reset');
    document.body.dataset.v48MapLens = 'fallback:' + lens;
    return true;
  }
  function mapSelect(id){
    if (!id) return false;
    if (call('selectMapSpecies', id)) { document.body.dataset.v48MapSelect = 'native:' + id; return true; }
    if (window.PaleoBotV40SpeciesOpen?.openSpeciesById) {
      window.PaleoBotV40SpeciesOpen.openSpeciesById(id, 'map-v48');
      document.body.dataset.v48MapSelect = 'species:' + id;
      return true;
    }
    document.body.dataset.v48MapSelect = 'missing:' + id;
    return false;
  }
  function closeDetailIfOpen(){
    const panel = document.getElementById('detailView');
    if (!panel || !panel.classList.contains('active')) return true;
    if (call('closeDetailPanel')) return true;
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    return true;
  }
  function activateMapView(){
    const btn = document.querySelector('.view-btn[data-view="map"]') || document.querySelector('[data-view="map"]');
    if (call('switchView', 'map', btn)) return true;
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.toggle('active', section.id === 'view-map');
    });
    document.querySelectorAll('[data-view]').forEach(trigger => {
      const active = trigger.dataset.view === 'map';
      trigger.classList.toggle('active', active);
      trigger.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    call('renderActiveView', 'map');
    return Boolean(document.getElementById('view-map'));
  }
  function showSpeciesOnMap(id){
    if (!id) return false;
    closeDetailIfOpen();
    activateMapView();
    window.setTimeout(() => {
      if (!call('selectMapSpecies', id)) {
        document.body.dataset.v48MapSelect = 'map-view-missing:' + id;
      }
      const mapView = document.getElementById('view-map');
      mapView?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 80);
    document.body.dataset.v48ShowMapSpecies = id;
    return true;
  }
  function openLightboxFallback(trigger){
    const src = trigger?.currentSrc || trigger?.src || trigger?.dataset.lightboxOpen;
    if (!src) return false;
    if (call('openLightbox', src)) return true;
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lbImage');
    if (!box || !img) return false;
    img.src = src;
    box.classList.add('active');
    document.body.dataset.v48Lightbox = 'fallback';
    return true;
  }
  document.addEventListener('click', function(e){
    const zoom = e.target.closest('[data-map-zoom]');
    if (zoom) {
      e.preventDefault();
      e.stopImmediatePropagation();
      mapZoom(zoom.dataset.mapZoom);
      return;
    }
    const layer = e.target.closest('[data-map-layer]');
    if (layer) {
      e.preventDefault();
      e.stopImmediatePropagation();
      mapLayer(layer.dataset.mapLayer);
      return;
    }
    const lens = e.target.closest('[data-map-lens]');
    if (lens) {
      e.preventDefault();
      e.stopImmediatePropagation();
      mapLens(lens.dataset.mapLens);
      return;
    }
    const showOnMap = e.target.closest('[data-show-map-species]');
    if (showOnMap) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showSpeciesOnMap(showOnMap.dataset.showMapSpecies);
      return;
    }
    const select = e.target.closest('[data-map-select]');
    if (select) {
      e.preventDefault();
      e.stopImmediatePropagation();
      mapSelect(select.dataset.mapSelect);
      return;
    }
    const lightboxOpen = e.target.closest('[data-lightbox-open]');
    if (lightboxOpen) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openLightboxFallback(lightboxOpen);
      return;
    }
    const lightboxClose = e.target.closest('[data-lightbox-close]');
    if (lightboxClose && e.target === lightboxClose) {
      e.preventDefault();
      e.stopImmediatePropagation();
      lightboxClose.classList.remove('active');
    }
  }, true);
  document.body.dataset.v48MapControls = 'ready';
  window.PaleoBotV48MapControls = { mapZoom, mapLayer, mapLens, mapSelect, showSpeciesOnMap, openLightboxFallback };
})();
