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
      motif: 'mandíbula y esmalte'
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
      title: 'Género Homo',
      motif: 'cráneo, cultura y dispersión'
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

  function fallbackSvg(sp, compact, map, context) {
    // A missing image has no substitute fossil and no inferred anatomy.
    /* R97: las imágenes que no son de un taxón (portadas de bloque, lecturas guiadas)
       mostraban «Taxón sin nombre»; ahora se rotulan con su propio texto alternativo. */
    const label = map ? 'MAPA NO DISPONIBLE' : (sp ? 'SIN IMAGEN VERIFICADA' : 'IMAGEN NO DISPONIBLE');
    const plainContext = String(context || '').replace(/^Portada visual del bloque\s*/i, 'Bloque: ').slice(0, 60);
    const name = map ? 'Contexto regional' : String(sp?.nombre || plainContext || 'Recurso visual');
    const xml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
    const svg = compact
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#f2f0ec"/><text x="10" y="42" font-size="12" fill="#23384b">'+xml(label)+'</text><text x="10" y="75" font-size="10" fill="#23384b" textLength="100" lengthAdjust="spacingAndGlyphs">'+xml(name)+'</text></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 430"><rect width="720" height="430" fill="#f2f0ec"/><text x="40" y="150" font-size="28" fill="#23384b">'+xml(label)+'</text><text x="40" y="235" font-size="22" fill="#23384b" textLength="630" lengthAdjust="spacingAndGlyphs">'+xml(name)+'</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
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
    const mediaMode = img.dataset.imageError || '';
    const relevant = force || mediaMode || img.classList.contains('species-header-image') || img.classList.contains('sp-img-thumb') || img.classList.contains('visual-evidence-img') || img.classList.contains('academic-img') || img.classList.contains('itin-card-img');
    if (!relevant) return false;
    if (img.dataset.v50FallbackApplied === '1' && !force) return false;
    const current = img.currentSrc || img.getAttribute('src') || '';
    if (!force && !isBadMediaUrl(current) && img.naturalWidth !== 0) return false;
    const sp = speciesFromImage(img);
    img.dataset.v50FallbackApplied = '1';
    img.classList.add('pb-v50-media-fallback-img');
    window.PaleoBotStyleState?.display(img, '');
    window.PaleoBotStyleState?.opacityZero(img, false);
    const map = img.dataset.visualRole === 'map';
    const originalAlt = img.dataset.pbR97OriginalAlt || img.getAttribute('alt') || '';
    img.dataset.pbR97OriginalAlt = originalAlt;
    img.alt = map ? 'Mapa de contexto no disponible'
      : (sp ? `Sin imagen verificada para ${text(sp?.nombre, 'este taxón')}`
            : `Imagen no disponible${originalAlt ? ': ' + originalAlt : ''}`);
    img.src = fallbackSvg(sp, img.classList.contains('sp-img-thumb'), map, originalAlt);
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
      /* R97: registro de fallos reales de carga (solo por evento error) para el diagnóstico. */
      const failedSrc = img.currentSrc || img.getAttribute('src') || '';
      if (/^https?:/i.test(failedSrc)) img.dataset.pbR97LoadFailed = failedSrc;
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
