// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v50-media-guard
(function(){
  'use strict';

  const FALLBACK_BAD_URL_PATTERNS = [
    /No_image_available/i,
    /6a00d8341bf67c53ef01348157067b970c/i,
    /\/undefined(?:$|[?#])/i
  ];

  const CLADE_MEDIA_THEME = {
    basal: {
      accent: '#b86a00',
      soft: '#fff1d3',
      title: 'Primeros homininos',
      motif: 'mandibula y esmalte'
    },
    australo: {
      accent: '#087451',
      soft: '#ddf5ea',
      title: 'Australopitecinos',
      motif: 'bipedestacion y mosaico craneodental'
    },
    paran: {
      accent: '#a62626',
      soft: '#fde2df',
      title: 'Paranthropus',
      motif: 'robustez masticatoria'
    },
    homo: {
      accent: '#2258a8',
      soft: '#e4edff',
      title: 'Genero Homo',
      motif: 'craneo, cultura y dispersion'
    }
  };

  function text(value, fallback) {
    return String(value || fallback || '').replace(/[<>]/g, '').slice(0, 120);
  }

  function isBadMediaUrl(url) {
    const value = String(url || '').trim();
    return !value || FALLBACK_BAD_URL_PATTERNS.some(pattern => pattern.test(value));
  }

  function speciesList() {
    if (typeof DB !== 'undefined' && Array.isArray(DB)) return DB;
    if (typeof DB_INDEX !== 'undefined' && DB_INDEX) return Object.values(DB_INDEX);
    return [];
  }

  function speciesById(id) {
    if (!id) return null;
    if (typeof DB_INDEX !== 'undefined' && DB_INDEX && DB_INDEX[id]) return DB_INDEX[id];
    return speciesList().find(sp => sp && sp.id === id) || null;
  }

  function speciesFromImage(img) {
    const host = img.closest('[data-open-species], [data-id], [data-species-id], [data-show-map-species]');
    const id = host?.dataset?.openSpecies || host?.dataset?.id || host?.dataset?.speciesId || host?.dataset?.showMapSpecies || '';
    if (id) return speciesById(id);
    if (typeof currentSpecies !== 'undefined' && currentSpecies) return currentSpecies;
    const alt = String(img.alt || '').toLowerCase();
    return speciesList().find(sp => sp && sp.nombre && alt.includes(String(sp.nombre).toLowerCase())) || null;
  }

  function fallbackSvg(sp, compact) {
    const safeSp = sp || {};
    const realByClade = {
      basal:'https://commons.wikimedia.org/wiki/Special:FilePath/Proconsul_heseloni_Tubingen.jpg?width=900',
      australo:'https://commons.wikimedia.org/wiki/Special:FilePath/Australopithecus_africanus_%28Sts_5_cast%29_at_G%C3%B6teborgs_Naturhistoriska_Museum_8945.jpg?width=900',
      paran:'https://commons.wikimedia.org/wiki/Special:FilePath/Paranthropus_boisei_skull.jpg?width=900',
      homo:'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_habilis-KNM_ER_1813.jpg?width=900'
    };
    return realByClade[safeSp.clado] || realByClade.homo;
  }

  // PB-GH-11 (04, fila 1): respaldo LOCAL tras un fallo de carga. Antes, repairImage asignaba fallbackSvg(),
  // una URL REMOTA por clado; si esa URL tampoco cargaba (aula sin Wikimedia), el escuchador de 'error' volvía a
  // forzar la reparación con la misma URL: bucle de ~70-100 peticiones/s. Ahora el respaldo es un SVG data: neutro
  // con el texto alternativo (no hace peticiones, no puede fallar) y se aplica una sola vez por imagen.
  function respaldoLocal(img, sp) {
    const nombre = text(sp?.nombre || img.getAttribute('alt'), 'Imagen');
    const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">'
      + '<rect width="800" height="600" fill="#f4f1ea"/><rect x="24" y="24" width="752" height="552" fill="none" stroke="#9a8f7c" stroke-width="3" stroke-dasharray="14 10"/>'
      + '<text x="400" y="285" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="#3d382f">' + esc(nombre.slice(0, 48)) + '</text>'
      + '<text x="400" y="340" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#5c554a">Imagen no disponible sin conexión con la fuente</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function normalizeSpeciesImages() {
    let repaired = 0;
    speciesList().forEach(sp => {
      if (!sp) return;
      if (isBadMediaUrl(sp.imagen)) {
        sp.imagen = fallbackSvg(sp, false);
        sp.mediaFallback = 'v50-generated';
        repaired += 1;
      }
    });
    document.documentElement.dataset.paleobotV50MediaRepaired = String(repaired);
    return repaired;
  }

  function cleanLegacyPlaceholder(img) {
    const next = img.nextElementSibling;
    if (!next) return;
    const txt = (next.textContent || '').toLowerCase();
    if (txt.includes('imagen no disponible') || txt.includes('requiere conexión')) {
      next.remove();
    }
  }

  function repairImage(img, force) {
    if (!(img instanceof HTMLImageElement)) return false;
    if (img.dataset.specimenMedia === 'exact') return false;
    const mediaMode = img.dataset.imageError || '';
    const relevant = force || mediaMode || img.classList.contains('species-header-image') || img.classList.contains('sp-img-thumb') || img.classList.contains('visual-evidence-img') || img.classList.contains('academic-img') || img.classList.contains('itin-card-img');
    if (!relevant) return false;
    // PB-GH-11: tope duro, un solo respaldo por imagen aunque se fuerce (marca propia: 066 borra data-v50-…).
    if (img.dataset.pbRespaldoAplicado === '1') return false;
    if (img.dataset.v50FallbackApplied === '1' && !force) return false;
    const current = img.currentSrc || img.getAttribute('src') || '';
    if (!force && !isBadMediaUrl(current) && img.naturalWidth !== 0) return false;
    const sp = speciesFromImage(img);
    img.dataset.v50FallbackApplied = '1';
    img.dataset.pbRespaldoAplicado = '1';
    img.classList.add('pb-v50-media-fallback-img');
    img.style.display = '';
    img.style.opacity = '';
    img.style.visibility = '';
    img.alt = img.alt || `Lamina visual provisional de ${text(sp?.nombre, 'taxon')}`;
    img.src = respaldoLocal(img, sp);
    cleanLegacyPlaceholder(img);
    return true;
  }

  function scanRenderedImages() {
    document.querySelectorAll('img[data-image-error], .species-header-image, .visual-evidence-img, .academic-img, .itin-card-img, .sp-img-thumb, .biogeo-record-thumb').forEach(img => {
      const src = img.getAttribute('src') || '';
      const hidden = img.style.display === 'none' || img.style.opacity === '0';
      if (isBadMediaUrl(src) || hidden) repairImage(img, true);
    });
  }

  function installDomGuard() {
    document.addEventListener('error', event => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement)) return;
      setTimeout(() => repairImage(img, true), 0);
    }, true);

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(scanRenderedImages);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scanRenderedImages();
  }

  function patchAuditLabel() {
    const previous = typeof updateMediaAuditStatus === 'function' ? updateMediaAuditStatus : null;
    if (!previous || previous.__pbV50MediaGuard) return;
    const guarded = function() {
      normalizeSpeciesImages();
      return previous.apply(this, arguments);
    };
    guarded.__pbV50MediaGuard = true;
    window.updateMediaAuditStatus = guarded;
  }

  function init() {
    normalizeSpeciesImages();
    patchAuditLabel();
    installDomGuard();
    setTimeout(() => {
      normalizeSpeciesImages();
      scanRenderedImages();
    }, 350);
    document.documentElement.dataset.paleobotV50MediaGuard = 'ready';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
