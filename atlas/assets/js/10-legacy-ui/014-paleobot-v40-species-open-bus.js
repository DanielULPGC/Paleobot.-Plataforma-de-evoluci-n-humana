// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v40-species-open-bus
(function(){
  const SPECIES_OPEN_SELECTOR = [
    '[data-open-species]',
    '#timelineList .species-item[data-id]',
    '#view-tree .tree-item[data-id]',
    '.phylo-bar[data-id]',
    '.clado-leaf[data-id]',
    '.map-node[data-id]',
    '.coexist-row-label[data-id]'
  ].join(',');
  function speciesById(id){
    if (!id) return null;
    try {
      if (typeof DB_INDEX !== 'undefined' && DB_INDEX[id]) return DB_INDEX[id];
      if (Array.isArray(DB)) return DB.find(sp => sp.id === id) || null;
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return null;
  }
  function fallbackDetail(sp){
    const panel = document.getElementById('detailView');
    if (!panel || !sp) return false;
    panel.classList.add('active');
    panel.setAttribute('aria-labelledby','detailViewTitle');
    panel.setAttribute('aria-hidden','false');
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-header-text">
          <h2 id="detailViewTitle">${escapeHtmlText(sp.nombre || 'Ficha')}</h2>
          <div class="panel-header-meta">
            <span class="sp-tag">${escapeHtmlText(sp.anos || '')}</span>
            <span class="sp-tag detail-location-tag">${escapeHtmlText(sp.ubicacion || '')}</span>
          </div>
        </div>
        <div class="panel-actions">
          <button type="button" class="panel-close" data-panel-close aria-label="Cerrar" title="Cerrar">✕</button>
        </div>
      </div>
      <div class="panel-content">
        <div class="data-section">
          <h4>Resumen</h4>
          <p>${escapeHtmlText(sp.descripcion || 'Ficha disponible, pero la plantilla completa no pudo renderizarse.')}</p>
        </div>
      </div>`;
    return true;
  }
  function openSpeciesById(id, source){
    const sp = speciesById(id);
    if (!sp) {
      console.warn('Ficha no encontrada para taxón:', id);
      return false;
    }
    const matrixModal = document.getElementById('matrixModal');
    if (matrixModal?.classList.contains('active')) matrixModal.classList.remove('active');
    try {
      if (typeof showDetail === 'function') {
        showDetail(sp);
      } else {
        fallbackDetail(sp);
      }
    } catch(err) {
      console.warn('Apertura de ficha recuperada por v40:', id, err);
      fallbackDetail(sp);
    }
    const panel = document.getElementById('detailView');
    if (panel) {
      panel.classList.add('active');
      panel.setAttribute('aria-hidden','false');
      panel.dataset.v40LastSpecies = id;
    }
    document.body.dataset.v40LastSpecies = id;
    document.dispatchEvent(new CustomEvent('paleobot:species-opened', { detail:{ id, source: source || 'v40' } }));
    return true;
  }
  function installSpeciesOpenBus(){
    if (document.body.dataset.v40SpeciesOpen === 'ready') return;
    document.body.dataset.v40SpeciesOpen = 'ready';
    document.addEventListener('click', function(e){
      const trigger = e.target.closest(SPECIES_OPEN_SELECTOR);
      if (!trigger) return;
      const id = trigger.dataset.openSpecies || trigger.dataset.id;
      if (!id || !speciesById(id)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      openSpeciesById(id, 'click');
    }, true);
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const trigger = e.target.closest(SPECIES_OPEN_SELECTOR);
      if (!trigger) return;
      const id = trigger.dataset.openSpecies || trigger.dataset.id;
      if (!id || !speciesById(id)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      openSpeciesById(id, 'keyboard');
    }, true);
  }
  function tagTimelineItems(){
    document.querySelectorAll('#timelineList .species-item[data-id]').forEach(item => {
      if (!item.dataset.openSpecies) item.dataset.openSpecies = item.dataset.id;
      if (!item.getAttribute('role')) item.setAttribute('role','button');
      if (!item.getAttribute('tabindex')) item.setAttribute('tabindex','0');
    });
  }
  document.addEventListener('paleobot:viewchange', tagTimelineItems);
  document.addEventListener('paleobot:v37-viewchange', tagTimelineItems);
  const oldRenderActiveView = typeof renderActiveView === 'function' ? renderActiveView : null;
  if (oldRenderActiveView && !oldRenderActiveView.__v40SpeciesWrapped) {
    renderActiveView = function(){
      const result = oldRenderActiveView.apply(this, arguments);
      tagTimelineItems();
      return result;
    };
    renderActiveView.__v40SpeciesWrapped = true;
  }
  installSpeciesOpenBus();
  tagTimelineItems();
  window.PaleoBotV40SpeciesOpen = { openSpeciesById, tagTimelineItems };
})();
