// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v81-map-and-species-media-repair
(function(){
  'use strict';

  const GENERIC_FALLBACK_RE = /(Australopithecus_africanus_%28Sts_5_cast%29|Australopithecus_africanus_|Homo_habilis-KNM_ER_1813|Proconsul_heseloni_Tubingen|Paranthropus_boisei_skull|Olduvai_Gorge_or_Oldupai_Gorge|Homo_sapiens_skull_-_Skhul_5|Homo_erectus\.JPG|Lucy%22_Australopithecus|No_image_available)/i;

  function speciesList(){
    try { if (Array.isArray(window.DB)) return window.DB; } catch(_){}
    try { if (typeof DB !== 'undefined' && Array.isArray(DB)) return DB; } catch(_){}
    try { if (window.DB_INDEX) return Object.values(window.DB_INDEX); } catch(_){}
    try { if (typeof DB_INDEX !== 'undefined') return Object.values(DB_INDEX); } catch(_){}
    return [];
  }

  function speciesIndex(){
    const out = {};
    speciesList().forEach(function(sp){
      if (!sp) return;
      out[sp.id] = sp;
      out[String(sp.nombre || '').toLowerCase()] = sp;
    });
    return out;
  }

  function findSpeciesForImage(img, index){
    const host = img.closest('[data-open-species], [data-id], [data-species-id], [data-show-map-species]');
    const id = host?.dataset?.openSpecies || host?.dataset?.id || host?.dataset?.speciesId || host?.dataset?.showMapSpecies || '';
    if (id && index[id]) return index[id];
    const alt = String(img.alt || '').toLowerCase().trim();
    if (alt && index[alt]) return index[alt];
    return speciesList().find(function(sp){
      const name = String(sp?.nombre || '').toLowerCase();
      return name && alt.includes(name);
    }) || null;
  }

  function hash(text){
    let n = 0;
    String(text || '').split('').forEach(function(ch){ n = ((n << 5) - n + ch.charCodeAt(0)) | 0; });
    return Math.abs(n);
  }

  function uniqueSpeciesSvg(sp, compact){
    // Text-only indication, never an invented specimen-specific morphology.
    const safe = sp || {};
    const xml = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
    const name = xml(safe.nombre || 'Taxón sin nombre');
    const svg = compact
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="12" fill="#f2f0ec"/><rect x="7" y="7" width="106" height="106" rx="9" fill="none" stroke="#596778"/><text x="12" y="48" font-family="sans-serif" font-size="12" fill="#23384b">SIN IMAGEN</text><text x="12" y="69" font-family="sans-serif" font-size="10" fill="#23384b" textLength="94" lengthAdjust="spacingAndGlyphs">'+name+'</text></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 430"><rect width="720" height="430" fill="#f2f0ec"/><rect x="30" y="30" width="660" height="370" rx="14" fill="none" stroke="#596778" stroke-width="2"/><text x="54" y="130" font-family="sans-serif" font-size="25" fill="#23384b">SIN IMAGEN VERIFICADA</text><text x="54" y="200" font-family="sans-serif" font-size="22" fill="#23384b" textLength="610" lengthAdjust="spacingAndGlyphs">'+name+'</text><text x="54" y="332" font-family="sans-serif" font-size="17" fill="#44586b">Esta tarjeta no representa un fósil ni una reconstrucción.</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function preferredUrl(sp, img){
    if (!sp) return '';
    try {
      if (typeof window.getSpeciesThumb === 'function' && (img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb'))) return window.getSpeciesThumb(sp, 160);
    } catch(_){}
    try {
      if (typeof getSpeciesThumb === 'function' && (img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb'))) return getSpeciesThumb(sp, 160);
    } catch(_){}
    try { if (typeof window.getSpeciesImage === 'function') return window.getSpeciesImage(sp); } catch(_){}
    try { if (typeof getSpeciesImage === 'function') return getSpeciesImage(sp); } catch(_){}
    return sp.imagen || '';
  }

  function shouldReplaceNow(img){
    /* R98: con imágenes locales, la URL original se conserva en data-pb-r98-origin; la
       comprobación de imagen genérica (fósil de otro taxón) debe hacerse sobre ella. */
    const src = img.dataset.pbR98Origin || img.currentSrc || img.getAttribute('src') || '';
    return img.dataset.v50FallbackApplied === '1' ||
      img.dataset.pbV61FallbackApplied === '1' ||
      img.classList.contains('pb-v50-media-fallback-img') ||
      /^data:image\/svg/i.test(src) ||
      GENERIC_FALLBACK_RE.test(src);
  }

  function repairSpeciesImages(){
    const index = speciesIndex();
    document.querySelectorAll('.sp-img-thumb, .biogeo-record-thumb, .species-header-image, .visual-evidence-img, .academic-img, .itin-card-img').forEach(function(img){
      if (!(img instanceof HTMLImageElement)) return;
      if (img.classList.contains('map-lens-topo') || img.dataset.visualRole === 'map') return;
      const sp = findSpeciesForImage(img, index);
      if (!sp) return;
      img.removeAttribute('data-image-error');
      img.removeAttribute('data-pb-v61-bound');
      img.dataset.pbV81SpeciesMedia = 'managed';
      img.dataset.pbV81SpeciesId = sp.id || '';
      const compact = img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb');
      if (shouldReplaceNow(img)) {
        img.dataset.pbV81SpeciesMedia = 'unique';
        img.classList.remove('pb-v50-media-fallback-img');
        img.removeAttribute('data-v50-fallback-applied');
        img.removeAttribute('data-pb-v61-fallback-applied');
        img.alt = 'Sin imagen verificada para ' + String(sp.nombre || 'este taxón');
        img.src = uniqueSpeciesSvg(sp, compact);
      } else {
        const url = preferredUrl(sp, img);
        if (url && !GENERIC_FALLBACK_RE.test(url) && !/^data:image\/svg/i.test(url)) {
          img.src = url;
        }
      }
      img.onerror = function(){
        this.dataset.pbV81SpeciesMedia = 'unique';
        this.classList.remove('pb-v50-media-fallback-img');
        this.alt = 'Sin imagen verificada para ' + String(sp.nombre || 'este taxón');
        this.src = uniqueSpeciesSvg(sp, compact);
      };
    });
    document.documentElement.dataset.paleobotV81SpeciesMediaRepair = 'ready';
  }

  document.addEventListener('error', function(event){
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.visualRole === 'map' || (img.dataset.pbV81SpeciesMedia !== 'managed' && img.dataset.pbV81SpeciesMedia !== 'unique')) return;

    // Reparación final diferida: v50 está registrado antes y programa su
    // fallback en setTimeout(0). v81 programa después su fallback taxonómico,
    // de modo que conserva la última palabra sin cancelar la cadena de error.
    window.setTimeout(function(){
      const index = speciesIndex();
      const sp = index[img.dataset.pbV81SpeciesId || ''] || findSpeciesForImage(img, index);
      if (!sp) return;
      const compact = img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb');
      img.dataset.pbV81SpeciesMedia = 'unique';
      img.classList.remove('pb-v50-media-fallback-img');
      img.removeAttribute('data-v50-fallback-applied');
      img.removeAttribute('data-pb-v61-fallback-applied');
      img.alt = 'Sin imagen verificada para ' + String(sp.nombre || 'este taxón');
        img.src = uniqueSpeciesSvg(sp, compact);
    }, 0);
  }, true);

  function tuneMapModal(){
    const modal = document.getElementById('presMapModal');
    if (!modal) return;
    const svg = modal.querySelector('.pres-map-modal-body svg');
    if (svg) {
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.classList.add('pb-r74-map-modal-minheight');
    }
    document.documentElement.dataset.paleobotV81MapModalRepair = 'ready';
  }

  const oldOpen = window.openPresMapModal;
  if (typeof oldOpen === 'function' && !oldOpen.__pbV81MapMediaRepair) {
    const wrapped = function(){
      const result = oldOpen.apply(this, arguments);
      window.setTimeout(tuneMapModal, 0);
      window.setTimeout(tuneMapModal, 120);
      return result;
    };
    wrapped.__pbV81MapMediaRepair = true;
    window.openPresMapModal = wrapped;
  }

  function schedule(){
    window.requestAnimationFrame(function(){
      repairSpeciesImages();
      tuneMapModal();
    });
    window.setTimeout(repairSpeciesImages, 250);
  }

  const observer = new MutationObserver(function(records){
    if (records.some(function(record){
      return Array.from(record.addedNodes).some(function(node){
        return node.nodeType === 1 && (node.matches?.('img,#presMapModal') || node.querySelector?.('img,#presMapModal'));
      });
    })) schedule();
  });

  function init(){
    observer.observe(document.documentElement, { childList:true, subtree:true });
    schedule();
    window.setTimeout(schedule, 900);
    window.setTimeout(schedule, 2400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.PaleoBotV81MapAndSpeciesMediaRepair = {
    repairSpeciesImages,
    tuneMapModal,
    uniqueSpeciesSvg,
    mode:'final-taxonomic-fallback'
  };
})();
