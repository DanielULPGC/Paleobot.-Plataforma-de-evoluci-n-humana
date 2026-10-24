// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v83-search-sa-final-repair
(function(){
  'use strict';

  function norm(value){
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function speciesRange(sp){
    try {
      if (typeof getSpeciesTimeRange === 'function') return getSpeciesTimeRange(sp);
    } catch(_){}
    const v = Number(sp?.val_time);
    return { start: Number.isFinite(v) ? v : 0, end: Number.isFinite(v) ? v : 0 };
  }

  function textCorpus(sp){
    const expert = sp?.experto || {};
    const refs = Array.isArray(expert.referencias) ? expert.referencias.map(function(r){ return [r.a,r.t,r.j,r.d].join(' '); }).join(' ') : '';
    return norm([
      sp?.id, sp?.nombre, sp?.nombreCorto, sp?.anos, sp?.ubicacion, sp?.holo, sp?.datacion,
      sp?.dieta, sp?.herramientas, sp?.estado, sp?.clado, sp?.descripcion,
      expert.descripcion_tecnica, expert.debate, expert.anatomia_craneal,
      expert.anatomia_postcraneal, expert.paleoecologia, expert.cultura, refs
    ].filter(Boolean).join(' | '));
  }

  function robustMatchesActiveFilters(sp){
    if (!sp) return false;
    try {
      if (typeof cladoFilter !== 'undefined' && cladoFilter !== 'all' && sp.clado !== cladoFilter) return false;
    } catch(_){}
    try {
      if (typeof timeFilter !== 'undefined') {
        const range = speciesRange(sp);
        if (!(range.start >= timeFilter.young && range.end <= timeFilter.old)) return false;
      }
    } catch(_){}
    const input = document.getElementById('searchInput') || document.querySelector('[data-search-input]');
    const term = norm(input?.value || '');
    if (!term) return true;
    const corpus = textCorpus(sp);
    return term.split(/\s+/).filter(Boolean).every(function(piece){ return corpus.includes(piece); });
  }

  function installSearchOverride(){
    try {
      matchesActiveFilters = robustMatchesActiveFilters;
      window.matchesActiveFilters = robustMatchesActiveFilters;
    } catch(_){
      window.matchesActiveFilters = robustMatchesActiveFilters;
    }
    document.documentElement.dataset.paleobotV83SearchOverride = 'ready';
  }

  function applySearchNow(){
    const search = document.getElementById('searchInput') || document.querySelector('[data-search-input]');
    const landing = document.getElementById('landingSearchInput');
    if (search && landing && landing.value !== search.value) landing.value = search.value;
    installSearchOverride();
    if (typeof applyFilters === 'function') {
      applyFilters();
    } else {
      document.querySelectorAll('#timelineList .species-item').forEach(function(el){
        const id = el.dataset.id || el.dataset.openSpecies;
        const sp = (window.DB_INDEX || {})[id] || (Array.isArray(window.DB) ? window.DB.find(function(item){ return item.id === id; }) : null);
        el.style.display = robustMatchesActiveFilters(sp) ? '' : 'none';
      });
      if (typeof updateCount === 'function') updateCount();
    }
  }

  let searchTimer = null;
  document.addEventListener('input', function(event){
    const field = event.target.closest?.('#searchInput,[data-search-input],#landingSearchInput');
    if (!field) return;
    const main = document.getElementById('searchInput') || document.querySelector('[data-search-input]');
    const landing = document.getElementById('landingSearchInput');
    if (field === landing && main && main.value !== field.value) main.value = field.value;
    if (field === main && landing && landing.value !== field.value) landing.value = field.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearchNow, 30);
  }, true);

  document.addEventListener('keydown', function(event){
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = event.target?.tagName;
    if (/INPUT|TEXTAREA|SELECT/.test(tag || '')) return;
    const input = document.getElementById('searchInput') || document.querySelector('[data-search-input]');
    if (!input) return;
    event.preventDefault();
    input.focus({ preventScroll:true });
  }, true);

  function selectedSaParams(){
    const get = function(id, fallback){
      const el = document.getElementById(id);
      return el ? el.value : fallback;
    };
    return {
      nivel: get('sa-nivel', '4eso'),
      taxonId: get('sa-taxon', ''),
      competencia: get('sa-cc', 'STEM'),
      duracion: Number(get('sa-dur', 3)) || 3,
      producto: get('sa-prod', 'informe')
    };
  }

  function renderSaFallback(doc){
    const esc = function(value){ return String(value ?? '').replace(/[&<>"']/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]; }); };
    const sessions = Array.isArray(doc.sesiones) ? doc.sesiones : [];
    return '<article class="sa-doc-card" data-pb-v83-sa-doc="1">' +
      '<h3>' + esc(doc.titulo || 'Situación de aprendizaje') + '</h3>' +
      '<p><strong>Nivel:</strong> ' + esc(doc.nivel) + ' · <strong>Materia:</strong> ' + esc(doc.materia) + '</p>' +
      '<p><strong>Pregunta motriz:</strong> ' + esc(doc.preguntaMotriz || '') + '</p>' +
      '<p><strong>Producto:</strong> ' + esc(doc.producto || '') + '</p>' +
      '<p><strong>Cautela científica:</strong> ' + esc(doc.cautelaCientifica || '') + '</p>' +
      '<h4>Secuencia</h4>' +
      '<ol>' + sessions.map(function(s){ return '<li><strong>' + esc(s.titulo || s.nombre || 'Sesión') + '</strong>: ' + esc(s.descripcion || s.actividad || s.foco || '') + '</li>'; }).join('') + '</ol>' +
      '</article>';
  }

  function generateSa(){
    const status = document.getElementById('saGenStatus');
    const panel = document.getElementById('saDocPanel');
    if (status) status.textContent = 'Generando...';
    try {
      installSearchOverride();
      const params = selectedSaParams();
      const rows = typeof buildTeachingDataset === 'function' ? buildTeachingDataset() : [];
      if (typeof buildSADocument !== 'function') throw new Error('buildSADocument no disponible');
      const doc = buildSADocument(params, rows);
      window.__pbV83SaDoc = doc;
      if (panel) {
        panel.innerHTML = typeof _renderSADoc === 'function' ? _renderSADoc(doc) : renderSaFallback(doc);
        panel.dataset.pbV83Generated = 'ready';
      }
      const exportBtn = document.getElementById('saExportBtn');
      const resetBtn = document.getElementById('saResetBtn');
      if (exportBtn) exportBtn.disabled = false;
      if (resetBtn) resetBtn.disabled = false;
      if (status) status.textContent = 'SA generada - ' + new Date().toLocaleTimeString('es-ES');
      document.documentElement.dataset.paleobotV83SaGenerator = 'ready';
      return doc;
    } catch(error) {
      console.error('[PB83] SA generator fallback error', error);
      if (status) status.textContent = 'Error al generar: ' + (error.message || 'revisa parámetros');
      return null;
    }
  }

  function exportSa(){
    const doc = window.__pbV83SaDoc;
    if (!doc) return;
    const text = typeof _buildSATextExport === 'function'
      ? _buildSATextExport(doc)
      : JSON.stringify(doc, null, 2);
    if (window.PaleoBot?.ExportManager?.downloadFile) {
      window.PaleoBot.ExportManager.downloadFile(text, 'paleobot_SA_' + new Date().toISOString().slice(0,10) + '.txt', 'text/plain;charset=utf-8;');
    } else {
      const blob = new Blob([text], { type:'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'paleobot_SA_' + new Date().toISOString().slice(0,10) + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }

  function resetSa(){
    window.__pbV83SaDoc = null;
    const panel = document.getElementById('saDocPanel');
    if (panel) panel.innerHTML = '<p style="font-size:0.83rem;color:var(--text-hint);font-family:var(--font-mono);padding:20px 0;text-align:center">Configure los parámetros y pulse «Generar SA» para producir el documento.</p>';
    const exportBtn = document.getElementById('saExportBtn');
    const resetBtn = document.getElementById('saResetBtn');
    const status = document.getElementById('saGenStatus');
    if (exportBtn) exportBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
    if (status) status.textContent = '';
  }

  document.addEventListener('click', function(event){
    if (event.target.closest?.('[data-sa-generate],#saGenBtn')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      generateSa();
      return;
    }
    if (event.target.closest?.('[data-sa-export],#saExportBtn')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      exportSa();
      return;
    }
    if (event.target.closest?.('[data-sa-reset],#saResetBtn')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      resetSa();
    }
  }, true);

  function init(){
    installSearchOverride();
    document.querySelectorAll('.v35-block-portal-kicker').forEach(function(el){ el.remove(); });
    document.documentElement.dataset.paleobotV83FinalRepair = 'ready';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.PaleoBotV83SearchSAFinalRepair = { applySearchNow, generateSa, resetSa, robustMatchesActiveFilters };
})();
