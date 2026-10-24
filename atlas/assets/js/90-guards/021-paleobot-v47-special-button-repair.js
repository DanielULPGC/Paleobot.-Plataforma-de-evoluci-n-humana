// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v47-special-button-repair
(function(){
  function esc(v){
    try { if (typeof escapeHtmlText === 'function') return escapeHtmlText(v); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function ev(name){
    return typeof window[name] !== 'undefined' ? window[name] : undefined;
  }
  function call(name, ...args){
    try {
      const fn = window[name] || ev(name);
      if (typeof fn === 'function') {
        fn.apply(window, args);
        return true;
      }
    } catch(err) {
      console.warn('v47 recupera acción:', name, err);
    }
    return false;
  }
  function db(){
    return ev('DB') || window.DB || [];
  }
  function dbIndex(){
    return ev('DB_INDEX') || window.DB_INDEX || {};
  }
  function currentPresentationSpecies(){
    try {
      const list = ev('presSpecies');
      const index = ev('presIndex');
      if (Array.isArray(list) && list[index]) return list[index];
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    const name = document.getElementById('presName')?.textContent?.trim();
    if (name) {
      const found = db().find(sp => sp.nombre === name || sp.nombreCorto === name);
      if (found) return found;
    }
    return null;
  }
  function currentDetailSpecies(){
    try {
      const cs = ev('currentSpecies');
      if (cs) return cs;
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    const id = document.getElementById('detailView')?.dataset.v40LastSpecies || document.body.dataset.v40LastSpecies;
    if (id && dbIndex()[id]) return dbIndex()[id];
    const title = (document.getElementById('detailViewTitle') || document.querySelector('#detailView h2'))?.textContent?.trim();
    if (title) {
      const found = db().find(sp => sp.nombre === title || sp.nombreCorto === title);
      if (found) return found;
    }
    return null;
  }
  function currentSpecies(){
    return currentPresentationSpecies() || currentDetailSpecies() || db()[0] || null;
  }
  function getImage(sp){
    try {
      const fn = ev('getSpeciesImage');
      if (typeof fn === 'function') return fn(sp);
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return sp?.imagen || '';
  }
  function openPresentationMap(){
    if (call('openPresMapModal')) {
      document.body.dataset.v47MapExpand = 'native';
      return true;
    }
    const sp = currentPresentationSpecies() || currentSpecies();
    const modal = document.getElementById('presMapModal');
    const body = document.getElementById('presMapModalBody');
    const title = document.getElementById('presMapModalTitle');
    const sub = document.getElementById('presMapModalSub');
    const foot = document.getElementById('presMapModalFoot');
    if (!modal || !body) return false;
    const source = document.getElementById('presMapSvg');
    body.innerHTML = '';
    if (source) {
      const clone = source.cloneNode(true);
      clone.removeAttribute('id');
      clone.setAttribute('role','img');
      clone.setAttribute('aria-label','Mapa ampliado del yacimiento');
      body.appendChild(clone);
    } else {
      body.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:white;font-weight:800">Mapa no disponible en esta diapositiva.</div>';
    }
    if (title) title.textContent = 'Mapa ampliado: ' + (sp?.nombre || 'taxón seleccionado');
    if (sub) sub.textContent = sp?.ubicacion || 'Localización no indicada';
    if (foot) foot.innerHTML = '<strong>Lectura didáctica:</strong> ubica primero la región y después interpreta yacimiento, relieve y cautelas. La cercanía espacial no prueba parentesco directo.';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    document.body.dataset.v47MapExpand = 'fallback';
    return true;
  }
  function closePresentationMap(){
    if (call('closePresMapModal')) {
      document.body.dataset.v47MapClose = 'native';
      return true;
    }
    const modal = document.getElementById('presMapModal');
    if (!modal) return false;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
    const body = document.getElementById('presMapModalBody');
    if (body) body.innerHTML = '';
    document.body.dataset.v47MapClose = 'fallback';
    return true;
  }
  function buildFichaHtml(sp, mode){
    if (!sp) return '<h1>Ficha no disponible</h1><p>Abre una especie antes de exportar.</p>';
    const refs = (() => {
      try {
        const fn = ev('getSpeciesReferenceSet');
        if (typeof fn === 'function') return fn(sp).slice(0,5);
      } catch(err) { /* recuperable: err suprimido intencionalmente */ }
      return (sp.experto?.referencias || []).slice(0,5);
    })();
    return `<section class="v47-export-sheet-inner">
      <h1>${esc(sp.nombre || 'Taxón')}</h1>
      <p><strong>${esc(mode || 'Ficha exportable')}</strong></p>
      ${getImage(sp) ? `<img src="${esc(getImage(sp))}" alt="${esc(sp.nombre)}" style="max-width:100%;max-height:260px;object-fit:contain;border:1px solid #bbb;border-radius:10px;margin:0 0 12px">` : ''}
      <p>${esc(sp.descripcion || '')}</p>
      <div class="v47-kpis">
        <div><strong>Cronología</strong><br>${esc(sp.anos || 's/d')}</div>
        <div><strong>Localización</strong><br>${esc(sp.ubicacion || 's/d')}</div>
        <div><strong>Capacidad craneal</strong><br>${esc(sp.cc ? sp.cc + ' cc' : 's/d')}</div>
        <div><strong>Dieta / contexto</strong><br>${esc(sp.dieta || 's/d')}</div>
      </div>
      <h2>Rasgos y cautelas</h2>
      <p>${esc(sp.experto?.anatomia_craneal || sp.experto?.descripcion_tecnica || 'Sin rasgos ampliados cargados.')}</p>
      <p>${esc(sp.experto?.debate || 'Sin debate específico cargado.')}</p>
      <h2>Referencias</h2>
      <ul>${refs.length ? refs.map(r => `<li>${esc(r.a || 'Referencia')} (${esc(r.y || '')}). ${esc(r.t || '')}${r.d ? ' DOI: ' + esc(r.d) : ''}</li>`).join('') : '<li>Sin referencias específicas cargadas.</li>'}</ul>
    </section>`;
  }
  function exportFicha(sp, mode){
    sp = sp || currentSpecies();
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(sp?.nombre || 'Ficha PaleoBot')}</title><link rel="stylesheet" href="assets/css/00-core/015-style.css"></head><body>${buildFichaHtml(sp, mode)}<script>setTimeout(()=>print(),120)<\\/script></body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      document.body.dataset.v47Export = 'window';
      return true;
    }
    let sheet = document.getElementById('v47ExportSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'v47ExportSheet';
      sheet.className = 'v47-export-sheet';
      document.body.appendChild(sheet);
    }
    sheet.innerHTML = buildFichaHtml(sp, mode);
    document.body.classList.add('v47-print-export');
    setTimeout(() => {
      window.print();
      setTimeout(() => document.body.classList.remove('v47-print-export'), 300);
    }, 80);
    document.body.dataset.v47Export = 'print';
    return true;
  }
  function exportPresentation(){
    const sp = currentPresentationSpecies() || currentSpecies();
    if (call('exportPresentationTaxon')) {
      document.body.dataset.v47ExportPresentation = 'native';
      return true;
    }
    document.body.dataset.v47ExportPresentation = 'fallback';
    return exportFicha(sp, 'Ficha de presentación');
  }
  function exportDetail(){
    const sp = currentDetailSpecies() || currentSpecies();
    if (call('exportSpeciesPrintSheet')) {
      document.body.dataset.v47ExportDetail = 'native';
      return true;
    }
    document.body.dataset.v47ExportDetail = 'fallback';
    return exportFicha(sp, 'Ficha individual imprimible');
  }
  function exportAcademic(){
    const sp = currentDetailSpecies() || currentSpecies();
    if (call('exportAcademicPDF')) {
      document.body.dataset.v47ExportAcademic = 'native';
      return true;
    }
    document.body.dataset.v47ExportAcademic = 'fallback';
    return exportFicha(sp, 'Ficha académica');
  }
  function showPaleoCell(datasetName, value){
    if (!value) return false;
    const detail = document.getElementById('m19PaleoDetail') || document.getElementById('v34PaleoDetail');
    if (!detail) return false;
    const parts = String(value).split('|');
    detail.innerHTML = `<h3>${esc(parts[0] || 'Bioma')} · ${esc(parts[1] || 'MIS')}</h3><p>Condiciones paleoclimáticas simplificadas para discusión didáctica. Úsalo como contexto de nicho ecológico, no como reconstrucción fina.</p><p>Contrasta siempre con yacimientos, cronología, tafonomía y bibliografía.</p>`;
    document.body.dataset.v47LastPaleoCell = datasetName;
    return true;
  }
  document.addEventListener('click', function(e){
    const mapExpand = e.target.closest('[data-pres-map-expand]');
    if (mapExpand) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openPresentationMap();
      return;
    }
    const mapClose = e.target.closest('[data-pres-map-close]');
    if (mapClose) {
      e.preventDefault();
      e.stopImmediatePropagation();
      closePresentationMap();
      return;
    }
    if (e.target.closest('[data-pres-export]')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      exportPresentation();
      return;
    }
    const detail = e.target.closest('[data-detail-action]');
    if (detail?.dataset.detailAction === 'exportSpeciesPrintSheet') {
      e.preventDefault();
      e.stopImmediatePropagation();
      exportDetail();
      return;
    }
    if (detail?.dataset.detailAction === 'exportAcademicPDF') {
      e.preventDefault();
      e.stopImmediatePropagation();
      exportAcademic();
      return;
    }
    const m19 = e.target.closest('[data-m19-cell]');
    if (m19) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showPaleoCell('m19', m19.dataset.m19Cell);
      return;
    }
    const paleo = e.target.closest('[data-v34-paleo-cell]');
    if (paleo) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!call('renderPaleoDetail', paleo.dataset.v34PaleoCell)) showPaleoCell('v34', paleo.dataset.v34PaleoCell);
    }
  }, true);
  document.body.dataset.v47SpecialButtons = 'ready';
  window.PaleoBotV47SpecialButtons = { openPresentationMap, closePresentationMap, exportPresentation, exportDetail, exportAcademic, exportFicha };
})();
