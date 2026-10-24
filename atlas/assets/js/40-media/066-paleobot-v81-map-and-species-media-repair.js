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
    const safe = sp || {};
    const name = String(safe.nombre || 'Taxon').replace(/[&<>"']/g, '');
    const years = String(safe.anos || '').replace(/[&<>"']/g, '');
    const clade = String(safe.clado || 'hominino').replace(/[&<>"']/g, '');
    const h = hash(safe.id || name);
    const hues = { basal:37, australo:158, paran:7, homo:216 };
    const hue = hues[safe.clado] ?? (h % 360);
    const cx = 42 + (h % 22);
    const cy = 34 + ((h >> 3) % 18);
    const jaw = 44 + ((h >> 5) % 28);
    const svg = compact
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Referencia visual unica de '+name+'">'+
          '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl('+hue+' 48% 34%)"/><stop offset="1" stop-color="hsl('+((hue+54)%360)+' 44% 58%)"/></linearGradient><filter id="n"><feTurbulence baseFrequency=".035" numOctaves="3" seed="'+(h%97)+'"/><feColorMatrix type="saturate" values=".2"/><feBlend mode="multiply" in2="SourceGraphic"/></filter></defs>'+
          '<rect width="120" height="120" rx="16" fill="#f2eee6"/><path d="M18 88 C20 40 42 18 '+cx+' 18 C88 18 104 40 100 66 C96 90 78 106 52 102 C34 100 20 96 18 88 Z" fill="url(#g)" opacity=".92" filter="url(#n)"/><path d="M58 '+jaw+' C78 '+(jaw+5)+' 92 '+(jaw+22)+' 88 '+(jaw+38)+' C70 '+(jaw+26)+' 48 '+(jaw+24)+' 32 '+(jaw+40)+'" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="5" stroke-linecap="round"/><circle cx="'+cx+'" cy="'+cy+'" r="6" fill="#172331" opacity=".55"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 430" role="img" aria-label="Referencia visual unica de '+name+'">'+
          '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8f4ec"/><stop offset="1" stop-color="hsl('+hue+' 38% 86%)"/></linearGradient><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl('+hue+' 48% 32%)"/><stop offset="1" stop-color="hsl('+((hue+54)%360)+' 44% 58%)"/></linearGradient><filter id="n"><feTurbulence baseFrequency=".018" numOctaves="4" seed="'+(h%97)+'"/><feColorMatrix type="saturate" values=".24"/><feBlend mode="multiply" in2="SourceGraphic"/></filter></defs>'+
          '<rect width="720" height="430" fill="url(#bg)"/><path d="M94 318 C100 150 188 70 300 70 C472 70 590 156 578 268 C566 360 454 404 292 382 C182 368 102 344 94 318 Z" fill="url(#g)" opacity=".9" filter="url(#n)"/><path d="M292 220 C394 226 490 276 538 344 C438 306 322 314 218 362" fill="none" stroke="#fff" stroke-opacity=".58" stroke-width="22" stroke-linecap="round"/><circle cx="'+(268+(h%70))+'" cy="'+(150+((h>>4)%48))+'" r="26" fill="#172331" opacity=".42"/><text x="42" y="54" font-family="Georgia,serif" font-size="30" font-weight="800" fill="#172331">'+name+'</text><text x="44" y="88" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#516477">'+years+' · '+clade+'</text><text x="44" y="384" font-family="Arial,sans-serif" font-size="14" fill="#6a5f4f">Lamina diferenciada de respaldo: no sustituye una fotografia curada.</text></svg>';
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

  function realSpeciesUrl(sp, img){
    if (!sp) return '';
    const direct = String(sp.imagen || '');
    if (!direct || /No_image_available/i.test(direct) || /^data:image\/svg/i.test(direct)) return '';
    const preferred = String(preferredUrl(sp, img) || direct);
    if (!/^https?:\/\//i.test(preferred) || /No_image_available/i.test(preferred)) return '';
    return preferred;
  }

  function shouldReplaceNow(img){
    const src = img.currentSrc || img.getAttribute('src') || '';
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
      if (img.dataset.specimenMedia === 'exact') return;
      if (img.classList.contains('map-lens-topo')) return;
      const sp = findSpeciesForImage(img, index);
      if (!sp) return;
      img.removeAttribute('data-image-error');
      img.removeAttribute('data-pb-v61-bound');
      img.dataset.pbV81SpeciesMedia = 'managed';
      img.dataset.pbV81SpeciesId = sp.id || '';
      const compact = img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb');
      const realUrl = realSpeciesUrl(sp, img);
      if (realUrl) {
        img.dataset.pbV81SpeciesMedia = 'real';
        img.classList.remove('pb-v50-media-fallback-img');
        img.removeAttribute('data-v50-fallback-applied');
        img.removeAttribute('data-pb-v61-fallback-applied');
        if ((img.getAttribute('src') || '') !== realUrl) img.src = realUrl;
      } else if (shouldReplaceNow(img)) {
        img.dataset.pbV81SpeciesMedia = 'unique';
        img.classList.remove('pb-v50-media-fallback-img');
        img.removeAttribute('data-v50-fallback-applied');
        img.removeAttribute('data-pb-v61-fallback-applied');
        img.src = uniqueSpeciesSvg(sp, compact);
      }
      img.onerror = function(){
        this.dataset.pbV81SpeciesMedia = 'unique';
        this.classList.remove('pb-v50-media-fallback-img');
        this.src = uniqueSpeciesSvg(sp, compact);
      };
    });
    document.documentElement.dataset.paleobotV81SpeciesMediaRepair = 'ready';
  }

  document.addEventListener('error', function(event){
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (!['managed', 'real', 'unique'].includes(img.dataset.pbV81SpeciesMedia)) return;
    event.stopImmediatePropagation();
    const index = speciesIndex();
    // FIX (Claude 2026-06): usar primero el id ya resuelto y guardado por
    // repairSpeciesImages (pbV81SpeciesId). findSpeciesForImage fallaba cuando el
    // alt llevaba sufijo ("Homo floresiensis, craneo LB1") o el nombre en DB era
    // abreviado ("H. neanderthalensis"), dejando la imagen rota sin SVG único.
    const sp = (img.dataset.pbV81SpeciesId && index[img.dataset.pbV81SpeciesId])
      || findSpeciesForImage(img, index);
    if (!sp) return;
    const compact = img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb');
    img.dataset.pbV81SpeciesMedia = 'unique';
    img.classList.remove('pb-v50-media-fallback-img');
    img.src = uniqueSpeciesSvg(sp, compact);
  }, true);

  function tuneMapModal(){
    const modal = document.getElementById('presMapModal');
    if (!modal) return;
    const svg = modal.querySelector('.pres-map-modal-body svg');
    if (svg) {
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.style.minHeight = '520px';
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

  window.PaleoBotV81MapAndSpeciesMediaRepair = { repairSpeciesImages, tuneMapModal, uniqueSpeciesSvg };
})();
