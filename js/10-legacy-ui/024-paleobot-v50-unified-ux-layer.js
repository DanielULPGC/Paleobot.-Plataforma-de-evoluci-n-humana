// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v50-unified-ux-layer
(function(){
  'use strict';
  const BLOCKS = {
    explorar:{
      index:'01',
      title:'Explorar evidencias',
      short:'Tiempo, mapa y regiones',
      summary:'Entrada operativa para ordenar fósiles, yacimientos, regiones y contexto antes de interpretar hipótesis.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Olduvai_Gorge_or_Oldupai_Gorge.jpg?width=1920',
      coverAlt:'Paisaje de la Garganta de Olduvai, yacimiento clave del registro paleoantropológico',
      caption:'Portada: yacimientos, cronología y contexto territorial.',
      defaultView:'timeline',
      views:['timeline','map','continentes','africa','asia','europe','america','yacimientos','biogeo','contexto','paleoecologia']
    },
    interpretar:{
      index:'02',
      title:'Interpretar relaciones',
      short:'Árboles, comparación y clima',
      summary:'Herramientas para comparar rasgos, parentescos, coexistencias e hipótesis sin confundir semejanza con ascendencia directa.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_sapiens_and_Neanderthal_skulls.jpg?width=1920',
      coverAlt:'Cráneos humanos comparados como punto de partida para interpretar relaciones evolutivas',
      caption:'Portada: comparar formas, parentescos e hipótesis.',
      defaultView:'tree',
      views:['tree','phylo','clima','coexistencias','primatologia','constructor']
    },
    investigar:{
      index:'03',
      title:'Investigar método',
      short:'Datación, tafonomía y debate',
      summary:'Bloque para revisar cómo se sabe lo que se afirma: estratigrafía, datación, tafonomía, holotipos, revisiones y debates.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Atapuerca_-_Sima_del_Elefante_-_2006.jpg?width=1920',
      coverAlt:'Excavación en Atapuerca como contexto de investigación paleoantropológica',
      caption:'Portada: método, estratigrafía, debate y control de evidencias.',
      defaultView:'revisiones',
      views:['revisiones','genomica','datacion','debates','estratigrafia','tafonomia','introgresion','holotipos','dispersal']
    },
    aprender:{
      index:'04',
      title:'Aprender y evaluar',
      short:'Aula, recursos e itinerarios',
      summary:'Centro didáctico para convertir el atlas en actividad: rutas de clase, recursos externos, plantillas y productos evaluables.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Museo_de_la_Evoluci%C3%B3n_Humana%2C_Burgos.jpg?width=1920',
      coverAlt:'Esquema visual de evolución humana para uso educativo',
      caption:'Portada: transformar el atlas en actividad y evaluación.',
      defaultView:'aula',
      views:['aula','recursos','itinerarios','socratico']
    }
  };
  const labels = {
    timeline:'Cronología', map:'Mapa', continentes:'Continentes', africa:'África', asia:'Asia', europe:'Europa', america:'América',
    yacimientos:'Yacimientos', biogeo:'Biogeografía', contexto:'Contexto', paleoecologia:'Paleoecología', tree:'Árbol consenso',
    phylo:'Filogenia', clima:'Clima PAGES2k', coexistencias:'Coexistencias', primatologia:'Primatología', constructor:'Constructor',
    revisiones:'Revisiones', genomica:'Biomoléculas', datacion:'Datación', debates:'Debates', socratico:'Socrático',
    estratigrafia:'Estratigrafía', tafonomia:'Tafonomía', introgresion:'Introgresión', holotipos:'Holotipos',
    dispersal:'Dispersión', aula:'Aula', recursos:'Recursos', itinerarios:'Itinerarios'
  };
  let activeBlock = 'explorar';
  function hasView(viewId){
    return !!document.getElementById('view-' + viewId);
  }
  function visibleViews(blockId){
    return (BLOCKS[blockId]?.views || []).filter(hasView);
  }
  function label(viewId){
    return labels[viewId] || viewId;
  }
  function switchAppView(viewId, trigger){
    if (!hasView(viewId)) return false;
    try {
      if (window.PaleoBotV37Controls?.switchView?.(viewId, trigger)) return true;
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try {
      const legacySwitch = typeof window.switchView === 'function'
        ? window.switchView
        : (typeof window.switchView === 'function' ? window.switchView : null);
      if (typeof legacySwitch === 'function') {
        legacySwitch(viewId, trigger);
        return true;
      }
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    document.querySelectorAll('.view-section').forEach(section => section.classList.toggle('active', section.id === 'view-' + viewId));
    document.querySelectorAll('[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));
    // v58: Persistir la última vista visitada para retomar sesión
    window.PaleoBotStorage?.setPersistent('paleobot_last_view', viewId);
    // v58-fix: marcar navegación de usuario para evitar resets de shells
    document.body.dataset.pbV50UserNavigated = '1';
    document.dispatchEvent(new CustomEvent('paleobot:v50-viewchange', { detail:{ view:viewId } }));
    return true;
  }
  function blockForView(viewId){
    return Object.entries(BLOCKS).find(([,block]) => block.views.includes(viewId))?.[0] || activeBlock;
  }
  function applyVisibility(blockId){
    const allowed = new Set(visibleViews(blockId));
    document.querySelectorAll('.view-btn[data-view], .toolbar [data-view], [data-pb-v50-view]').forEach(btn => {
      const viewId = btn.dataset.view || btn.dataset.pbV50View;
      const show = !viewId || allowed.has(viewId);
      btn.hidden = !show;
      btn.disabled = !show;
      btn.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  }
  function renderBlock(blockId){
    const block = BLOCKS[blockId] || BLOCKS.explorar;
    const panel = document.getElementById('pbV50BlockPanel');
    if (!panel) return;
    const activeView = document.querySelector('.view-section.active')?.id?.replace(/^view-/,'');
    const views = visibleViews(blockId);
    panel.innerHTML = `
      <figure class="pb-v50-cover">
        <img src="${block.cover}" alt="${block.coverAlt}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <figcaption>${block.caption}</figcaption>
      </figure>
      <div class="pb-v50-block-copy">
        <h2>${block.title}</h2>
        <p>${block.summary}</p>
        <div class="pb-v50-module-grid" aria-label="Herramientas del bloque ${block.title}">
          ${views.map(view => `<button type="button" class="pb-v50-module${view === activeView ? ' active' : ''}" data-pb-v50-view="${view}" data-view="${view}">${label(view)}</button>`).join('')}
        </div>
      </div>`;
  }
  function setBlock(blockId, viewId){
    activeBlock = BLOCKS[blockId] ? blockId : 'explorar';
    document.body.dataset.pbV50Block = activeBlock;
    document.querySelectorAll('[data-pb-v50-block]').forEach(btn => {
      const active = btn.dataset.pbV50Block === activeBlock;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    const views = visibleViews(activeBlock);
    const current = document.querySelector('.view-section.active')?.id?.replace(/^view-/,'');
    const target = viewId || (views.includes(current) ? current : (BLOCKS[activeBlock].defaultView || views[0]));
    applyVisibility(activeBlock);
    if (target) switchAppView(target, 'v50-block');
    applyVisibility(activeBlock);
    renderBlock(activeBlock);
  }
  function ensureHero(){
    if (document.getElementById('pbV50Hero')) return;
    const hero = document.createElement('section');
    hero.id = 'pbV50Hero';
    hero.className = 'pb-v50-hero';
    hero.setAttribute('aria-label','Portada reunificada de PaleoBot v50');
    hero.innerHTML = `
      <div class="pb-v50-hero-inner">
        <picture class="pb-v50-hero-media" aria-hidden="true">
          <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Australopithecus_afarensis_skull_-_Naturmuseum_Senckenberg_-_DSC02102.JPG?width=1920" alt="" loading="eager" decoding="async" referrerpolicy="no-referrer">
        </picture>
        <div class="pb-v50-hero-copy">
          <span class="pb-v50-kicker">PaleoBot v50 reunificado</span>
          <h1>Paleo<em>Bot</em></h1>
          <p>La potencia científica de v34 reunida con una experiencia de estudio más clara, cinematográfica y organizada por tareas independientes.</p>
          <div class="pb-v50-hero-actions">
            <button type="button" class="pb-v50-action primary" data-pb-v50-jump="workspace">Entrar al laboratorio</button>
            <button type="button" class="pb-v50-action" data-pb-v50-open-block="explorar">Explorar evidencias</button>
            <button type="button" class="pb-v50-action" data-pb-v50-open-block="aprender">Preparar clase</button>
          </div>
        </div>
        <div class="pb-v50-hero-card" role="note">
          <div>
            <strong>De la pieza al argumento</strong>
            <span>Fósiles, mapas, biomoléculas, debate y aula en una misma arquitectura de lectura.</span>
          </div>
          <div class="pb-v50-metrics">
            <div class="pb-v50-metric"><b>50</b><small>taxones</small></div>
            <div class="pb-v50-metric"><b>4</b><small>bloques</small></div>
            <div class="pb-v50-metric"><b>DOI</b><small>fuentes</small></div>
          </div>
        </aside>
      </div>`;
    document.body.insertBefore(hero, document.querySelector('.container'));
  }
  function ensureBlocks(){
    if (document.getElementById('pbV50Blocks')) return;
    const container = document.querySelector('.container');
    const workspace = document.querySelector('.v36-workspace-shell') || document.getElementById('main-content');
    if (!container || !workspace) return;
    const hub = document.createElement('section');
    hub.id = 'pbV50Blocks';
    hub.className = 'pb-v50-blocks';
    hub.setAttribute('aria-label','Bloques independientes de trabajo');
    hub.innerHTML = `
      <nav class="pb-v50-tabs" role="tablist" aria-label="Seleccionar bloque de trabajo">
        ${Object.entries(BLOCKS).map(([id, block]) => `<button type="button" class="pb-v50-tab" data-pb-v50-block="${id}" role="tab" aria-selected="false"><b>${block.index}</b><strong>${block.title}</strong><span>${block.short}</span></button>`).join('')}
      </nav>
      <div class="pb-v50-quick-tools" role="group" aria-label="Herramientas rápidas">
        <button type="button" class="pb-v50-tool primary" data-pb-v50-action="abrirBiblio">Bibliografía</button>
        <button type="button" class="pb-v50-tool" data-pb-v50-action="openGlossary">Glosario</button>
        <button type="button" class="pb-v50-tool" data-pb-v50-action="exportToCSV">Exportar</button>
        <button type="button" class="pb-v50-tool" data-pb-v50-action="runSelfAudit">Diagnóstico</button>
      </div>
      <div id="pbV50BlockPanel" class="pb-v50-block-panel"></div>`;
    container.insertBefore(hub, workspace);
  }
  function ensureFilterToggle(){
    const primary = document.querySelector('.toolbar-row-primary');
    if (!primary || primary.querySelector('[data-pb-v50-filter-toggle]')) return;
    const reset = primary.querySelector('[data-action="resetGlobalFilters"]');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pb-v50-filter-toggle';
    button.dataset.pbV50FilterToggle = 'true';
    button.setAttribute('aria-expanded','false');
    button.textContent = 'Filtros avanzados';
    if (reset) reset.insertAdjacentElement('afterend', button);
    else primary.appendChild(button);
  }
  function ensureMapModal(){
    let modal = document.getElementById('pbV50MapModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'pbV50MapModal';
    modal.className = 'pb-v50-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML = `
      <div class="pb-v50-modal-card">
        <div class="pb-v50-modal-head"><strong>Mapa ampliado</strong><button type="button" class="pb-v50-modal-close" data-pb-v50-close-map>Cerrar</button></div>
        <div class="pb-v50-modal-body" id="pbV50MapBody"></div>
        <div class="pb-v50-modal-foot"><button type="button" class="pb-v50-modal-close" data-pb-v50-close-map>Cerrar mapa</button></div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }
  function ensureMapExpand(){
    const controls = document.querySelector('#view-map .map-controls-right') || document.querySelector('#view-map .map-controls') || document.querySelector('#view-map');
    if (controls && !controls.querySelector('[data-pb-v50-map-expand]')) {
      controls.insertAdjacentHTML('afterbegin','<button type="button" class="pb-v50-map-expand" data-pb-v50-map-expand>Ampliar mapa</button>');
    }
  }
  function openMapModal(){
    const modal = ensureMapModal();
    const body = document.getElementById('pbV50MapBody');
    const svg = document.getElementById('mapSvg') || document.querySelector('#view-map svg');
    if (body) {
      body.innerHTML = '';
      if (svg) body.appendChild(svg.cloneNode(true));
      else body.innerHTML = '<p class="pb-r70-gen-37025f8f89" >No se encontró un mapa SVG para ampliar.</p>';
    }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
  }
  function closeMapModal(){
    const modal = document.getElementById('pbV50MapModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
  }
  function bind(){
    document.addEventListener('click', event => {
      const heroBlock = event.target.closest('[data-pb-v50-open-block]');
      if (heroBlock) {
        event.preventDefault();
        document.body.dataset.pbV50UserNavigated = '1';
        setBlock(heroBlock.dataset.pbV50OpenBlock);
        document.getElementById('pbV50Blocks')?.scrollIntoView({ behavior:'smooth', block:'start' });
        return;
      }
      const jump = event.target.closest('[data-pb-v50-jump]');
      if (jump) {
        event.preventDefault();
        document.getElementById('pbV50Blocks')?.scrollIntoView({ behavior:'smooth', block:'start' });
        return;
      }
      const block = event.target.closest('button[data-pb-v50-block], [role="tab"][data-pb-v50-block]');
      if (block) {
        event.preventDefault();
        document.body.dataset.pbV50UserNavigated = '1';
        setBlock(block.dataset.pbV50Block, BLOCKS[block.dataset.pbV50Block]?.defaultView);
        return;
      }
      const module = event.target.closest('[data-pb-v50-view]');
      if (module) {
        event.preventDefault();
        document.body.dataset.pbV50UserNavigated = '1';
        const viewId = module.dataset.pbV50View;
        setBlock(blockForView(viewId), viewId);
        return;
      }
      const mapExpand = event.target.closest('[data-pb-v50-map-expand]');
      if (mapExpand) {
        event.preventDefault();
        openMapModal();
        return;
      }
      const filterToggle = event.target.closest('[data-pb-v50-filter-toggle]');
      if (filterToggle) {
        event.preventDefault();
        const open = !document.body.classList.contains('pb-v50-filters-open');
        document.body.classList.toggle('pb-v50-filters-open', open);
        filterToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        filterToggle.textContent = open ? 'Ocultar filtros' : 'Filtros avanzados';
        return;
      }
      const quickTool = event.target.closest('[data-pb-v50-action]');
      if (quickTool) {
        event.preventDefault();
        const action = quickTool.dataset.pbV50Action;
        const proxy = document.querySelector(`[data-action="${CSS.escape(action)}"]`);
        if (proxy) proxy.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true }));
        return;
      }
      if (event.target.closest('[data-pb-v50-close-map]') || event.target.id === 'pbV50MapModal') {
        event.preventDefault();
        closeMapModal();
      }
    }, true);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMapModal();
    }, true);
    ['paleobot:viewchange','paleobot:v37-viewchange','paleobot:combined-viewchange','paleobot:v50-viewchange'].forEach(name => {
      document.addEventListener(name, event => {
        const view = event.detail?.view;
        if (!view) return;
        activeBlock = blockForView(view);
        applyVisibility(activeBlock);
        renderBlock(activeBlock);
      });
    });
  }
  function init(){
    document.body.classList.add('pb-v50-unified');
    ensureHero();
    ensureBlocks();
    ensureFilterToggle();
    ensureMapModal();
    ensureMapExpand();
    bind();
    // v58-fix: sincronizar bloque sin forzar navegación a timeline
    (function syncBlockOnly(){
      const cur = document.querySelector('.view-section.active')?.id?.replace(/^view-/,'') || activeBlock;
      const block = blockForView(cur);
      activeBlock = block;
      document.body.dataset.pbV50Block = block;
      document.querySelectorAll('[data-pb-v50-block]').forEach(btn => {
        const active = btn.dataset.pbV50Block === block;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      applyVisibility(block);
      renderBlock(block);
    })();
    setTimeout(() => {
      ensureMapExpand();
      ensureFilterToggle();
      // v58-fix: no resetear la vista activa en el timeout de 250ms
    }, 250);
    document.documentElement.dataset.paleobotV50Unified = 'ready';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
