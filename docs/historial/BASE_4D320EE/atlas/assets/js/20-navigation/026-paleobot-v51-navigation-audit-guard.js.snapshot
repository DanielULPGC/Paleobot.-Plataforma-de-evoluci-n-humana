// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v51-navigation-audit-guard
(function(){
  'use strict';

  const BLOCKS = {
    explorar: {
      defaultView: 'timeline',
      title: 'Explorar evidencias',
      views: ['timeline','map','continentes','africa','asia','europe','america','yacimientos','biogeo','contexto','paleoecologia']
    },
    interpretar: {
      defaultView: 'tree',
      title: 'Interpretar relaciones',
      views: ['tree','phylo','clima','coexistencias','primatologia','constructor']
    },
    investigar: {
      defaultView: 'revisiones',
      title: 'Investigar método',
      views: ['revisiones','genomica','paleoproteomica','datacion','debates','estratigrafia','tafonomia','introgresion','holotipos','dispersal']
    },
    aprender: {
      defaultView: 'aula',
      title: 'Aprender y evaluar',
      views: ['aula','recursos','itinerarios','socratico']
    }
  };

  const LABELS = {
    timeline:'Cronología', map:'Mapa', continentes:'Continentes', africa:'África', asia:'Asia', europe:'Europa', america:'América',
    yacimientos:'Yacimientos', biogeo:'Biogeografía', contexto:'Contexto', paleoecologia:'Paleoecología', tree:'Árbol consenso',
    phylo:'Filogenia', clima:'Clima PAGES2k', coexistencias:'Coexistencias', primatologia:'Primatología', constructor:'Constructor',
    revisiones:'Revisiones', genomica:'Biomoléculas', paleoproteomica:'Paleoproteómica', datacion:'Datación', debates:'Debates', socratico:'Socrático',
    estratigrafia:'Estratigrafía', tafonomia:'Tafonomía', introgresion:'Introgresión', holotipos:'Holotipos',
    dispersal:'Dispersión', aula:'Aula', recursos:'Recursos', itinerarios:'Itinerarios'
  };

  function globalFn(name) {
    try {
      if (typeof window[name] === 'function') return window[name];
      if (typeof eval === 'function') {
        const fn = window[name];
        if (typeof fn === 'function') return fn;
      }
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return null;
  }

  function hasView(viewId) {
    return !!document.getElementById('view-' + viewId);
  }

  function isAvailableForCurrentLevel(viewId) {
    const check = globalFn('isViewAvailableForLevel');
    try {
      return !check || check(viewId);
    } catch(err) {
      return true;
    }
  }

  function currentView() {
    return document.querySelector('.view-section.active')?.id?.replace(/^view-/, '') || '';
  }

  function visibleViews(blockId) {
    return (BLOCKS[blockId]?.views || []).filter(viewId => hasView(viewId) && isAvailableForCurrentLevel(viewId));
  }

  function blockForView(viewId) {
    return Object.entries(BLOCKS).find(([, block]) => block.views.includes(viewId))?.[0] || 'explorar';
  }

  function setButtonsForView(viewId) {
    document.querySelectorAll('[data-view], [data-pb-v50-view]').forEach(btn => {
      const btnView = btn.dataset.view || btn.dataset.pbV50View;
      if (!btnView) return;
      const active = btnView === viewId;
      btn.classList.toggle('active', active);
      if (btn.matches('button')) btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function activateView(viewId, trigger) {
    if (!hasView(viewId)) return false;
    let routed = false;
    try {
      routed = !!window.PaleoBotV37Controls?.switchView?.(viewId, trigger || null);
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    if (!routed || currentView() !== viewId) {
      const legacySwitch = globalFn('switchView');
      if (legacySwitch && legacySwitch !== activateView) {
        try {
          legacySwitch(viewId, trigger || null);
          routed = currentView() === viewId;
        } catch(err) { /* recuperable: err suprimido intencionalmente */ }
      }
    }
    if (!routed || currentView() !== viewId) {
      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.toggle('active', section.id === 'view-' + viewId);
      });
      const render = globalFn('renderActiveView');
      try { render?.(viewId); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.toggle('active', section.id === 'view-' + viewId);
      });
      routed = true;
    }
    setButtonsForView(viewId);
    document.dispatchEvent(new CustomEvent('paleobot:v51-viewchange', { detail: { view: viewId } }));
    return routed;
  }

  function applyBlockVisibility(blockId) {
    const allowed = new Set(visibleViews(blockId));
    document.querySelectorAll('.view-btn[data-view], .toolbar [data-view], [data-pb-v50-view]').forEach(btn => {
      const viewId = btn.dataset.view || btn.dataset.pbV50View;
      if (!viewId) return;
      const show = allowed.has(viewId);
      btn.hidden = !show;
      btn.disabled = !show;
      btn.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  }

  function paintBlockPanel(blockId) {
    const panel = document.getElementById('pbV50BlockPanel');
    if (!panel) return;
    const block = BLOCKS[blockId] || BLOCKS.explorar;
    const active = currentView();
    const allowed = new Set(visibleViews(blockId));
    panel.querySelectorAll('[data-pb-v50-view]').forEach(btn => {
      const show = allowed.has(btn.dataset.pbV50View);
      btn.hidden = !show;
      btn.disabled = !show;
      btn.setAttribute('aria-hidden', show ? 'false' : 'true');
      const isActive = btn.dataset.pbV50View === active;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    panel.setAttribute('aria-label', `Herramientas del bloque ${block.title}`);
    if (!panel.getAttribute('role')) panel.setAttribute('role', 'group');
  }

  function activateBlock(blockId, viewId) {
    const safeBlock = BLOCKS[blockId] ? blockId : 'explorar';
    const views = visibleViews(safeBlock);
    const target = viewId && views.includes(viewId)
      ? viewId
      : (views.includes(currentView()) ? currentView() : (BLOCKS[safeBlock].defaultView || views[0]));
    document.body.dataset.pbV50Block = safeBlock;
    document.querySelectorAll('[data-pb-v50-block]').forEach(btn => {
      const active = btn.dataset.pbV50Block === safeBlock;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    applyBlockVisibility(safeBlock);
    if (target) activateView(target, document.querySelector(`[data-pb-v50-view="${CSS.escape(target)}"]`) || null);
    applyBlockVisibility(safeBlock);
    paintBlockPanel(safeBlock);
    return true;
  }

  function runAction(action) {
    if (!action) return false;
    try {
      if (window.PaleoBotV46ButtonBus?.runAction?.(action)) return true;
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    const contract = globalFn('getActionContractMap');
    try {
      const actions = contract?.();
      if (typeof actions?.[action] === 'function') {
        actions[action]();
        return true;
      }
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    const direct = globalFn(action);
    try {
      if (direct) {
        direct();
        return true;
      }
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return false;
  }

  function ensureMapModal() {
    let modal = document.getElementById('pbV50MapModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'pbV50MapModal';
    modal.className = 'pb-v50-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="pb-v50-modal-card">
        <div class="pb-v50-modal-head"><strong>Mapa ampliado</strong><button type="button" class="pb-v50-modal-close" data-pb-v50-close-map>Cerrar</button></div>
        <div class="pb-v50-modal-body" id="pbV50MapBody2"></div>
        <div class="pb-v50-modal-foot"><button type="button" class="pb-v50-modal-close" data-pb-v50-close-map>Cerrar mapa</button></div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function openMapModal() {
    activateBlock('explorar', 'map');
    window.setTimeout(() => {
      const modal = ensureMapModal();
      const body = document.getElementById('pbV50MapBody');
      const svg = document.getElementById('mapSvg') || document.querySelector('#view-map svg');
      if (body) {
        body.innerHTML = '';
        if (svg) body.appendChild(svg.cloneNode(true));
        else body.innerHTML = '<p style="color:white;padding:18px">No se encontró un mapa SVG para ampliar.</p>';
      }
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }, 80);
    return true;
  }

  function closeMapModal() {
    const modal = document.getElementById('pbV50MapModal');
    if (!modal) return false;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    return true;
  }

  function auditNavigation() {
    const v50Views = [...document.querySelectorAll('[data-pb-v50-view]')]
      .map(btn => btn.dataset.pbV50View)
      .filter(Boolean);
    const missingViews = [...new Set(v50Views)].filter(view => !hasView(view));
    const missingActions = [...document.querySelectorAll('[data-pb-v50-action]')]
      .map(btn => btn.dataset.pbV50Action)
      .filter(Boolean)
      .filter((action, index, arr) => arr.indexOf(action) === index)
      .filter(action => !window.PaleoBotV46ButtonBus?.runAction && !globalFn(action));
    return { missingViews, missingActions, block: document.body.dataset.pbV50Block || '', view: currentView() };
  }

  document.addEventListener('click', event => {
    const mapExpand = event.target.closest('[data-pb-v50-map-expand]');
    if (mapExpand) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openMapModal();
      return;
    }

    if (event.target.closest('[data-pb-v50-close-map]') || event.target.id === 'pbV50MapModal') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeMapModal();
      return;
    }

    const openBlock = event.target.closest('[data-pb-v50-open-block]');
    if (openBlock) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.body.dataset.pbV50UserNavigated = '1';
      activateBlock(openBlock.dataset.pbV50OpenBlock);
      document.getElementById('pbV50Blocks')?.scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }

    const block = event.target.closest('button[data-pb-v50-block], [role="tab"][data-pb-v50-block]');
    if (block) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.body.dataset.pbV50UserNavigated = '1';
      activateBlock(block.dataset.pbV50Block, BLOCKS[block.dataset.pbV50Block]?.defaultView);
      return;
    }

    const module = event.target.closest('[data-pb-v50-view]');
    if (module) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.body.dataset.pbV50UserNavigated = '1';
      const viewId = module.dataset.pbV50View;
      activateBlock(blockForView(viewId), viewId);
      return;
    }

    const action = event.target.closest('[data-pb-v50-action]');
    if (action) {
      event.preventDefault();
      event.stopImmediatePropagation();
      runAction(action.dataset.pbV50Action);
    }
  }, true);

  ['paleobot:viewchange','paleobot:v37-viewchange','paleobot:combined-viewchange','paleobot:v50-viewchange','paleobot:v51-viewchange'].forEach(name => {
    document.addEventListener(name, event => {
      const view = event.detail?.view;
      if (!view) return;
      const block = blockForView(view);
      document.body.dataset.pbV50Block = block;
      applyBlockVisibility(block);
      paintBlockPanel(block);
    });
  });

  function init() {
    // v58-fix: no forzar navegación en init(); solo sincronizar visibilidad de botones
    const view = currentView() || BLOCKS.explorar.defaultView;
    const block = blockForView(view);
    document.body.dataset.pbV50Block = block;
    document.querySelectorAll('[data-pb-v50-block]').forEach(btn => {
      const active = btn.dataset.pbV50Block === block;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    applyBlockVisibility(block);
    paintBlockPanel(block);
    document.documentElement.dataset.paleobotV51NavigationGuard = 'ready';
    document.documentElement.dataset.paleobotV51NavigationAudit = JSON.stringify(auditNavigation());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.PaleoBotV51Navigation = { activateBlock, activateView, runAction, auditNavigation, openMapModal, closeMapModal };
})();
