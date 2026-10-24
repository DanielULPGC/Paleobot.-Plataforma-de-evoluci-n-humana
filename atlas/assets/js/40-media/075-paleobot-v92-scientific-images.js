// PaleoBot: laminas cientificas diferenciadas para medios locales/fallback.
(function(){
  'use strict';

  const GENERIC_RE = /(No_image_available|fallback|Australopithecus_africanus_%28Sts_5_cast%29|Proconsul_heseloni_Tubingen|Paranthropus_boisei_skull|Olduvai_Gorge_or_Oldupai_Gorge|Homo_sapiens_skull_-_Skhul_5|data:image\/svg)/i;
  const INTRO = {
    nea_to_eur_asia: ['Neandertal -> Eurasia', 'ADN antiguo', 'Europa occidental', 'senal 1-2%'],
    den_to_melanesia: ['Denisova -> Oceania', 'genomas comparados', 'Altai / Melanesia', 'senal elevada'],
    den_to_tibet: ['EPAS1 tibetano', 'adaptacion', 'meseta tibetana', 'hipoxia'],
    nea_to_africa: ['Retorno a Africa', 'inferencia poblacional', 'norte de Africa', 'cautela'],
    arcaic_afr_to_afr: ['Linajes africanos', 'estructura profunda', 'Africa subsahariana', 'registro incompleto']
  };

  function esc(value){
    return String(value || '').replace(/[&<>"']/g, function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function hash(text){
    let n = 2166136261;
    String(text || '').split('').forEach(function(ch){
      n ^= ch.charCodeAt(0);
      n = Math.imul(n, 16777619);
    });
    return Math.abs(n >>> 0);
  }

  function db(){
    try { if (Array.isArray(window.DB)) return window.DB; } catch(_){}
    try { if (typeof DB !== 'undefined' && Array.isArray(DB)) return DB; } catch(_){}
    return [];
  }

  function index(){
    const out = {};
    db().forEach(function(sp){
      if (!sp) return;
      out[sp.id] = sp;
      out[String(sp.nombre || '').toLowerCase()] = sp;
    });
    return out;
  }

  function findSpecies(img, idx){
    const host = img.closest('[data-open-species], [data-id], [data-species-id], [data-show-map-species]');
    const id = host?.dataset?.openSpecies || host?.dataset?.id || host?.dataset?.speciesId || host?.dataset?.showMapSpecies || img.dataset.pbV81SpeciesId || '';
    if (id && idx[id]) return idx[id];
    const alt = String(img.alt || '').toLowerCase();
    return db().find(function(sp){
      const name = String(sp.nombre || '').toLowerCase();
      return name && alt.includes(name.replace(/^h\.\s*/, 'homo ').replace(/^au\.\s*/, 'australopithecus '));
    }) || null;
  }

  function cladeHue(clade, h){
    if (clade === 'homo') return 207;
    if (clade === 'australo') return 154;
    if (clade === 'paran') return 18;
    if (clade === 'basal') return 43;
    return h % 360;
  }

  function plateSvg(sp, compact){
    const safe = sp || {};
    const name = esc(safe.nombre || 'Taxon hominino');
    const years = esc(safe.anos || 'rango pendiente');
    const site = esc(safe.holo || safe.ubicacion || 'registro fragmentario');
    const method = esc(safe.datacion || 'contexto estratigrafico');
    const location = esc(safe.ubicacion || 'localizacion discutida');
    const h = hash((safe.id || name) + years);
    const hue = cladeHue(safe.clado, h);
    const brow = 168 + (h % 60);
    const face = 54 + ((h >> 9) % 34);
    const jaw = 46 + ((h >> 13) % 34);
    const cc = safe.cc ? esc(String(safe.cc) + ' cc') : 'sin estimacion craneal';
    const caution = safe.estado ? esc('taxon ' + safe.estado) : 'evidencia contextual';
    const w = compact ? 240 : 920;
    const vh = compact ? 240 : 560;
    const titleSize = compact ? 22 : 36;
    const labelSize = compact ? 10 : 15;
    const skullTransform = compact ? 'translate(34 52) scale(.55)' : 'translate(80 88) scale(1.16)';
    const textBlock = compact ? '' :
      '<g font-family="Arial,sans-serif">'+
        '<text x="46" y="55" font-size="'+titleSize+'" font-weight="800" fill="#102027">'+name+'</text>'+
        '<text x="48" y="84" font-size="16" font-weight="700" fill="#53645f">'+years+' - '+location+'</text>'+
        '<rect x="588" y="58" width="286" height="116" rx="8" fill="#102027" opacity=".92"/>'+
        '<text x="610" y="88" font-size="13" font-weight="800" fill="#efc36b">EVIDENCIA</text>'+
        '<text x="610" y="118" font-size="15" fill="#f7f1e4">'+site+'</text>'+
        '<text x="610" y="146" font-size="15" fill="#cfe2dc">'+method+'</text>'+
        '<rect x="588" y="194" width="286" height="138" rx="8" fill="#fffaf0" stroke="#d9ccb5"/>'+
        '<text x="610" y="225" font-size="13" font-weight="800" fill="#7a5330">LECTURA</text>'+
        '<text x="610" y="256" font-size="15" fill="#102027">'+cc+'</text>'+
        '<text x="610" y="285" font-size="15" fill="#102027">'+caution+'</text>'+
        '<text x="610" y="313" font-size="13" fill="#53645f">lamina generada desde datos del atlas</text>'+
      '</g>';
    const compactText = compact ?
      '<text x="18" y="28" font-family="Arial,sans-serif" font-size="'+titleSize+'" font-weight="800" fill="#102027">'+name+'</text>'+
      '<text x="18" y="48" font-family="Arial,sans-serif" font-size="'+labelSize+'" font-weight="700" fill="#53645f">'+years+'</text>' : '';

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+vh+'" role="img" aria-label="Lamina cientifica de '+name+'">'+
      '<defs>'+
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbf6ea"/><stop offset=".54" stop-color="hsl('+hue+' 34% 88%)"/><stop offset="1" stop-color="#e3d2b8"/></linearGradient>'+
      '<linearGradient id="bone" x1=".1" y1=".1" x2=".95" y2=".95"><stop stop-color="#fff4d8"/><stop offset=".52" stop-color="hsl('+hue+' 34% 62%)"/><stop offset="1" stop-color="#6c593e"/></linearGradient>'+
      '<filter id="grain"><feTurbulence baseFrequency=".026" numOctaves="4" seed="'+(h%89)+'"/><feColorMatrix type="saturate" values=".18"/><feBlend mode="multiply" in2="SourceGraphic"/></filter>'+
      '</defs>'+
      '<rect width="'+w+'" height="'+vh+'" fill="url(#bg)"/>'+
      '<g opacity=".18" stroke="#102027" stroke-width="1">'+
      '<path d="M0 '+(vh*.68)+' H'+w+'"/><path d="M0 '+(vh*.82)+' H'+w+'"/><path d="M'+(w*.16)+' 0 V'+vh+'"/><path d="M'+(w*.34)+' 0 V'+vh+'"/><path d="M'+(w*.52)+' 0 V'+vh+'"/><path d="M'+(w*.70)+' 0 V'+vh+'"/>'+
      '</g>'+
      compactText+
      '<g transform="'+skullTransform+'">'+
      '<path d="M72 266 C82 118 164 34 248 34 C330 34 420 118 414 232 C408 350 288 420 142 396 C92 388 68 340 72 266 Z" fill="url(#bone)" filter="url(#grain)" opacity=".95"/>'+
      '<path d="M120 256 C196 '+(220 + face)+' 294 '+(218 + face)+' 378 274 C316 318 206 334 112 328" fill="none" stroke="#fff7df" stroke-width="18" stroke-linecap="round" opacity=".52"/>'+
      '<path d="M318 220 C382 224 434 270 452 340 C378 316 322 318 258 346" fill="none" stroke="#755b3e" stroke-width="'+jaw+'" stroke-linecap="round" opacity=".58"/>'+
      '<circle cx="'+brow+'" cy="170" r="28" fill="#102027" opacity=".42"/>'+
      '<path d="M102 150 C150 68 248 38 356 86" fill="none" stroke="#fff8e6" stroke-width="7" stroke-linecap="round" opacity=".48"/>'+
      '<path d="M78 290 C178 306 286 298 380 256" fill="none" stroke="#102027" stroke-width="4" opacity=".22"/>'+
      '</g>'+
      (compact ? '<text x="18" y="218" font-family="Arial,sans-serif" font-size="10" fill="#53645f">'+method+'</text>' : textBlock)+
      '<rect x="'+(compact ? 18 : 48)+'" y="'+(compact ? 198 : 492)+'" width="'+(compact ? 204 : 824)+'" height="8" rx="4" fill="#102027" opacity=".18"/>'+
      '<rect x="'+(compact ? 18 : 48)+'" y="'+(compact ? 198 : 492)+'" width="'+(compact ? 88 + (h%90) : 320 + (h%330))+'" height="8" rx="4" fill="hsl('+hue+' 48% 42%)"/>'+
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function shouldUsePlate(img){
    const src = img.currentSrc || img.getAttribute('src') || '';
    return img.dataset.pbV81SpeciesMedia === 'unique' ||
      img.classList.contains('pb-v50-media-fallback-img') ||
      img.dataset.v50FallbackApplied === '1' ||
      img.dataset.pbV61FallbackApplied === '1' ||
      GENERIC_RE.test(src);
  }

  function realSpeciesUrl(sp, img){
    if (!sp) return '';
    const direct = String(sp.imagen || '');
    if (!direct || /No_image_available/i.test(direct) || /^data:image\/svg/i.test(direct)) return '';
    let preferred = direct;
    try {
      if (typeof getSpeciesThumb === 'function' &&
          (img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb'))) {
        preferred = getSpeciesThumb(sp, 250) || direct;
      } else if (typeof getSpeciesImage === 'function') {
        preferred = getSpeciesImage(sp) || direct;
      }
    } catch(_){}
    preferred = String(preferred || '');
    return /^https?:\/\//i.test(preferred) && !/No_image_available/i.test(preferred) ? preferred : '';
  }

  function repairSpecies(){
    const idx = index();
    document.querySelectorAll('.sp-img-thumb, .biogeo-record-thumb, .species-header-image, .visual-evidence-img, .academic-img, .itin-card-img').forEach(function(img){
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.specimenMedia === 'exact') return;
      const sp = findSpecies(img, idx);
      if (!sp) return;
      img.dataset.pbV92Species = sp.id || '';
      const compact = img.classList.contains('sp-img-thumb') || img.classList.contains('biogeo-record-thumb');
      const realUrl = realSpeciesUrl(sp, img);
      if (realUrl) {
        if ((img.getAttribute('src') || '') !== realUrl) img.src = realUrl;
        img.dataset.pbV92SciencePlate = '0';
        img.dataset.pbV92ScientificPhoto = '1';
        img.dataset.pbV81SpeciesMedia = 'real';
        img.classList.remove('pb-v50-media-fallback-img');
      } else if (shouldUsePlate(img)) {
        img.src = plateSvg(sp, compact);
        img.dataset.pbV92SciencePlate = '1';
        img.dataset.pbV92ScientificPhoto = '0';
        img.classList.remove('pb-v50-media-fallback-img');
      }
      if (img.dataset.pbV92Bound !== '1') {
        img.dataset.pbV92Bound = '1';
        img.onerror = function(){
          this.src = plateSvg(sp, compact);
          this.dataset.pbV92SciencePlate = '1';
          this.dataset.pbV92ScientificPhoto = '0';
          this.dataset.pbV81SpeciesMedia = 'unique';
        };
      }
    });
    document.documentElement.dataset.paleobotV92ScientificImages = 'ready';
  }

  function introgPlate(id){
    const meta = INTRO[id] || ['Evento de introgresion', 'evidencia comparada', 'registro disperso', 'hipotesis'];
    const h = hash(id);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 405" role="img" aria-label="'+esc(meta[0])+'">'+
      '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071015"/><stop offset=".62" stop-color="#173936"/><stop offset="1" stop-color="#efe6d3"/></linearGradient></defs>'+
      '<rect width="720" height="405" fill="url(#bg)"/>'+
      '<g opacity=".18" stroke="#f7f1e4"><path d="M52 82 H666"/><path d="M52 162 H666"/><path d="M52 242 H666"/><path d="M52 322 H666"/><path d="M142 44 V356"/><path d="M284 44 V356"/><path d="M426 44 V356"/><path d="M568 44 V356"/></g>'+
      '<path d="M92 270 C188 116 318 114 430 206 C520 280 588 250 650 166" fill="none" stroke="#efc36b" stroke-width="9" stroke-linecap="round"/>'+
      '<path d="M92 148 C188 254 318 270 430 176 C520 96 588 126 650 234" fill="none" stroke="#66c2a8" stroke-width="9" stroke-linecap="round"/>'+
      '<circle cx="'+(150 + h%80)+'" cy="150" r="32" fill="#f7f1e4" opacity=".88"/><circle cx="'+(420 + h%90)+'" cy="224" r="25" fill="#efc36b" opacity=".9"/><circle cx="'+(560 + h%70)+'" cy="154" r="18" fill="#66c2a8" opacity=".9"/>'+
      '<text x="44" y="56" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#f7f1e4">'+esc(meta[0])+'</text>'+
      '<text x="46" y="356" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#102027">'+esc(meta[1])+' - '+esc(meta[2])+'</text>'+
      '<text x="46" y="382" font-family="Arial,sans-serif" font-size="14" fill="#102027">'+esc(meta[3])+'; lectura probabilistica, no flecha literal.</text>'+
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function repairIntrogression(){
    document.querySelectorAll('.introg-photo-card[data-introg-event] img').forEach(function(img){
      const card = img.closest('.introg-photo-card[data-introg-event]');
      const id = card?.dataset?.introgEvent || '';
      if (!id || img.dataset.pbV92SciencePlate === '1') return;
      img.src = introgPlate(id);
      img.dataset.pbV92SciencePlate = '1';
      img.alt = (INTRO[id] && INTRO[id][0]) || img.alt || 'Evento de introgresion';
    });
  }

  function schedule(){
    window.requestAnimationFrame(function(){
      repairSpecies();
      repairIntrogression();
    });
    window.setTimeout(function(){ repairSpecies(); repairIntrogression(); }, 280);
  }

  const observer = new MutationObserver(function(records){
    if (records.some(function(record){
      return Array.from(record.addedNodes).some(function(node){
        return node.nodeType === 1 && (node.matches?.('img,.introg-photo-card') || node.querySelector?.('img,.introg-photo-card'));
      });
    })) schedule();
  });

  function init(){
    observer.observe(document.documentElement, { childList:true, subtree:true });
    schedule();
    window.setTimeout(schedule, 1000);
    window.setTimeout(schedule, 2600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.PaleoBotV92ScientificImagesReady = true;
  window.PaleoBotV92ScientificImages = { repairSpecies, repairIntrogression, plateSvg };
})();
