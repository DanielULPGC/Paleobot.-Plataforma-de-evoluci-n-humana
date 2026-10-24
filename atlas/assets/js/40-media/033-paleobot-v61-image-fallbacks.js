// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v61-image-fallbacks
(function(){
  'use strict';
  function esc(value){
    return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function labelFor(img){
    const fromAlt = img.getAttribute('alt') || '';
    const card = img.closest('[data-open-species], .species-card, .pb-v50-cover, .main-cover, .module-card, .timeline-card');
    const fromCard = card?.querySelector('h2,h3,h4,.species-name,.card-title')?.textContent || '';
    return (fromAlt || fromCard || 'Imagen no disponible').trim();
  }
  // FIX imágenes únicas (Claude 2026-06): el fallback anterior sustituía las
  // imágenes fallidas por OTRAS fotos remotas de Wikimedia según palabras clave,
  // de modo que decenas de fichas colapsaban a la MISMA imagen (y esas URLs de
  // respaldo también podían fallar). Ahora se genera un SVG ÚNICO por especie
  // (data-URI, sin red): color del clado + iniciales + nombre + época + cc, con
  // aviso de que es un marcador. Garantiza cero repetición y funciona sin
  // conexión. Las fotos reales siguen mostrándose cuando cargan.
  var CLADE_COL = { basal:'#c07800', australo:'#0a6b49', paran:'#aa1f1f', homo:'#1a4fa0' };
  var CLADE_LBL = { basal:'Basal · Mioceno', australo:'Australopithecus', paran:'Paranthropus', homo:'Homo' };
  function darken(hex, f){
    var n = parseInt(hex.slice(1),16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    r=Math.round(r*f); g=Math.round(g*f); b=Math.round(b*f);
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }
  function findSpecies(img, label){
    var DB = window.DB || [];
    var card = img.closest && img.closest('[data-open-species],[data-id],[data-species-id]');
    var id = card && (card.getAttribute('data-open-species') || card.getAttribute('data-id') || card.getAttribute('data-species-id'));
    if (id){ var s = DB.find(function(x){ return x.id === id; }); if (s) return s; }
    var L = String(label||'').toLowerCase(); var best=null, bestLen=0;
    DB.forEach(function(x){ var n=String(x.nombre||'').toLowerCase(); if (n && L.indexOf(n)>=0 && n.length>bestLen){ best=x; bestLen=n.length; } });
    return best;
  }
  function initialsOf(name){
    var clean = String(name||'').replace(/[()]/g,'').replace(/\b(sp|cf|s|au|h|p)\.?\b/gi,' ').trim();
    var parts = clean.split(/\s+/).filter(Boolean);
    var ini = parts.slice(0,2).map(function(w){ return w.charAt(0).toUpperCase(); }).join('');
    return ini || String(name||'?').charAt(0).toUpperCase();
  }
  function wrapName(name){
    var words = String(name||'').split(/\s+/); var lines=[], cur='';
    words.forEach(function(w){ if ((cur+' '+w).trim().length<=18){ cur=(cur+' '+w).trim(); } else { if(cur) lines.push(cur); cur=w; } });
    if (cur) lines.push(cur);
    return lines.slice(0,2);
  }
  function esc2(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function specimenMarkerSvg(img, label){
    var specimen = String(img.dataset.specimenLabel || label || 'Espécimen').trim();
    var site = String(img.dataset.specimenSite || 'Yacimiento no indicado').trim();
    var key = String(img.dataset.specimenMediaKey || specimen);
    var hash = 0;
    for (var i=0; i<key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    var accent = ['#0b6b57','#315f8a','#8a5a18','#7b3f4d'][Math.abs(hash) % 4];
    var initials = specimen.split(/\s+/).filter(Boolean).slice(0,2).map(function(part){ return part.charAt(0).toUpperCase(); }).join('') || 'ND';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="Imagen especifica no disponible para '+esc2(specimen)+'">'
      + '<rect width="800" height="600" fill="#f4efe5"/>'
      + '<rect width="22" height="600" fill="'+accent+'"/>'
      + '<circle cx="400" cy="218" r="136" fill="#e1d7c5" stroke="'+accent+'" stroke-width="8"/>'
      + '<text x="400" y="250" text-anchor="middle" font-family="Georgia,serif" font-size="104" font-weight="700" fill="#263b3a">'+esc2(initials)+'</text>'
      + '<text x="400" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#172a2a">'+esc2(specimen)+'</text>'
      + '<text x="400" y="462" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" fill="#53645f">'+esc2(site)+'</text>'
      + '<text x="400" y="538" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#6c746f">Sin imagen específica abierta verificada</text>'
      + '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  function makeSvg(img, label){
    if (img.dataset.specimenMedia === 'exact') return specimenMarkerSvg(img, label);
    var sp = findSpecies(img, label);
    // Coherencia visual: si la capa v81 (lámina única por especie) está cargada,
    // delegar en su generador para que TODOS los marcadores tengan el mismo estilo.
    try {
      var v81 = window.PaleoBotV81MapAndSpeciesMediaRepair;
      if (sp && v81 && typeof v81.uniqueSpeciesSvg === 'function') {
        var compactV81 = !!(img.closest && img.closest('.sp-img-thumb, .biogeo-record-thumb'));
        return v81.uniqueSpeciesSvg(sp, compactV81);
      }
    } catch (_) {}
    var name = (sp && sp.nombre) || label || 'Taxón';
    var clado = sp && sp.clado;
    var base = CLADE_COL[clado] || '#5d6b63';
    var kicker = CLADE_LBL[clado] || 'Homínino';
    var meta = [sp && sp.anos, (sp && sp.cc) ? sp.cc+' cc' : ''].filter(Boolean).join('   ·   ');
    var ini = initialsOf(name);
    var lines = wrapName(name);
    var nameFs = name.length>20 ? 40 : (name.length>14 ? 48 : 56);
    var top = base, bot = darken(base, 0.62);
    var nameSvg = lines.map(function(l,i){
      return '<text x="60" y="'+(470 + i*(nameFs+8))+'" font-family="Georgia,serif" font-size="'+nameFs+'" font-style="italic" font-weight="700" fill="#ffffff">'+esc2(l)+'</text>';
    }).join('');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">'
      + '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="'+top+'"/><stop offset="1" stop-color="'+bot+'"/></linearGradient></defs>'
      + '<rect width="800" height="600" fill="url(#g)"/>'
      + '<circle cx="560" cy="235" r="150" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="3"/>'
      + '<text x="560" y="235" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-weight="700" font-size="150" fill="#ffffff" fill-opacity="0.20">'+esc2(ini)+'</text>'
      + '<rect x="0" y="360" width="800" height="240" fill="#000000" fill-opacity="0.22"/>'
      + '<rect x="60" y="392" width="54" height="5" rx="2.5" fill="#d8a93a"/>'
      + '<text x="60" y="432" font-family="Arial,Helvetica,sans-serif" font-size="24" letter-spacing="2" font-weight="700" fill="#d8a93a">'+esc2(kicker.toUpperCase())+'</text>'
      + nameSvg
      + (meta ? '<text x="60" y="'+(470 + lines.length*(nameFs+8) + 18)+'" font-family="Arial,Helvetica,sans-serif" font-size="26" fill="#ffffff" fill-opacity="0.92">'+esc2(meta)+'</text>' : '')
      + '<text x="60" y="576" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#ffffff" fill-opacity="0.62">Imagen no disponible · marcador ilustrativo</text>'
      + '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  function applyFallback(img, reason){
    if (!img || img.dataset.pbV61FallbackApplied === '1') return;
    const rect = img.getBoundingClientRect();
    const label = labelFor(img);
    const fallback = makeSvg(img, label);
    img.dataset.pbV61OriginalSrc = img.currentSrc || img.src || '';
    img.dataset.pbV61FallbackApplied = '1';
    img.dataset.pbV61FallbackReason = reason || 'load-failed';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.backgroundImage = '';
    img.style.backgroundSize = '';
    img.style.backgroundPosition = '';
    img.style.backgroundColor = '#f0ede8';
    img.style.display = '';
    img.style.opacity = '';
    img.style.visibility = '';
    img.src = fallback;
  }
  function inspectImage(img){
    if (!img || img.dataset.pbV61FallbackApplied === '1') return;
    const visible = !!img.offsetParent || img.closest('#pbV50BlockPanel,.view-section.active,.main-cover');
    if (!visible) return;
    // Una imagen lazy fuera del viewport puede seguir incompleta durante varios
    // segundos sin estar rota. El evento error gestiona los fallos reales.
    if (!img.complete) return;
    if (img.naturalWidth > 16 && img.naturalHeight > 16) return;
    applyFallback(img, 'timeout');
  }
  function bind(img){
    if (!img || img.dataset.pbV61Bound === '1') return;
    img.dataset.pbV61Bound = '1';
    img.addEventListener('error', () => applyFallback(img, 'error'), { once:true });
    window.setTimeout(() => inspectImage(img), 2600);
    window.setTimeout(() => inspectImage(img), 5200);
  }
  function scan(){
    document.querySelectorAll('img').forEach(bind);
    document.documentElement.dataset.paleobotV61ImageFallbacks = 'ready';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once:true });
  else scan();
  window.setTimeout(scan, 900);
  window.setTimeout(scan, 2200);
  window.setTimeout(scan, 4800);
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches?.('img') || node.querySelector?.('img'))))) {
      window.setTimeout(scan, 80);
    }
  }).observe(document.documentElement, { childList:true, subtree:true });
  ['paleobot:v55-viewchange','paleobot:v59-render','paleobot:viewchange'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(scan, 80));
  });
  window.PaleoBotV61ImageFallbacks = { scan };
})();
