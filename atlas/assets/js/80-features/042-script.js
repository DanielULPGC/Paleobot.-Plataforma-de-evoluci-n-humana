// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════
   PaleoBot — Lazy View Renderer + requestIdleCallback scheduler
   ─────────────────────────────────────────────────────────────────────
   PROBLEMA: Las vistas pesadas (Leaflet, D3, Canvas) se renderizan al
   cargar aunque no sean visibles, aumentando el tiempo de bloqueo del
   hilo principal.

   SOLUCIÓN:
   1. IntersectionObserver: renderizar una vista solo cuando entra en
      el viewport por primera vez (threshold 10%).
   2. requestIdleCallback: diferir la indexación y pre-cómputos no
      críticos para los momentos de inactividad del hilo principal.
   3. Compatibilidad: fallback a setTimeout para Safari <12.6 y Firefox
      sin soporte de requestIdleCallback.
   ═══════════════════════════════════════════════════════════════════ */
(function PaleoBotLazyRenderer() {
  'use strict';

  const DEBUG = false;
  const log = DEBUG ? console.log.bind(console, '[PBLazy]') : () => {};

  /* ── Vistas que requieren renderizado costoso ───────────────────────
     Solo las que usan Canvas, Leaflet o D3 intensivo.
     Las demás se renderizan de forma síncrona sin coste apreciable.   */
  const HEAVY_VIEWS = {
    'view-map':           { fn: 'renderMapView',         label: 'Mapa Leaflet'      },
    'view-phylo':         { fn: 'renderPhyloView',       label: 'Filogenia D3'      },
    'view-tree':          { fn: 'renderTreeView',        label: 'Cladograma D3'     },
    'view-clima':         { fn: 'renderClimaView',       label: 'Clima PAGES2k'     },
    'view-coexistencias': { fn: 'renderCoexistenciaView',label: 'Coexistencias'     },
    'view-dispersal':     { fn: 'renderDispersalView',   label: 'Simulador'         },
    'view-estratigrafia': { fn: 'renderEstratigrafiaView',label: 'Estratigrafía'    },
    'view-introgresion':  { fn: 'renderIntrogresionView',label: 'Introgresión'      },
  };

  const _rendered = new Set();   // vistas ya renderizadas
  const _pending  = new Map();   // viewId → render function

  /* ── Función de renderizado seguro ─────────────────────────────── */
  function safeRender(viewId, fn, label) {
    if (_rendered.has(viewId)) return;
    _rendered.add(viewId);
    log(`Renderizando ${label} (${viewId})`);
    try {
      if (typeof window[fn] === 'function') {
        window[fn]();
      } else if (typeof window.renderActiveView === 'function') {
        // Fallback: usar renderActiveView con el id de la vista
        const id = viewId.replace('view-', '');
        window.renderActiveView(id);
      }
    } catch (err) {
      if (DEBUG) console.error('[PBLazy] Error renderizando', viewId, err);
    }
  }

  /* ── requestIdleCallback con fallback ───────────────────────────── */
  const scheduleIdle = typeof requestIdleCallback === 'function'
    ? (fn, opts) => requestIdleCallback(fn, opts || { timeout: 2000 })
    : (fn) => setTimeout(fn, 150);

  /* ── IntersectionObserver ─────────────────────────────────────── */
  function initLazyViews() {
    if (typeof IntersectionObserver === 'undefined') {
      // Sin IntersectionObserver: renderizar todas al inicio (comportamiento anterior)
      log('IntersectionObserver no disponible — renderizado síncrono');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const viewId = entry.target.id;
        const config = HEAVY_VIEWS[viewId];
        if (!config || _rendered.has(viewId)) return;

        // Vista visible: renderizar en el siguiente frame idle
        scheduleIdle(() => safeRender(viewId, config.fn, config.label), { timeout: 500 });
        observer.unobserve(entry.target); // solo observar hasta la primera vez
      });
    }, {
      root: null,       // viewport
      threshold: 0.10,  // 10% visible es suficiente para pre-renderizar
      rootMargin: '200px 0px'  // pre-cargar 200px antes de que sea visible
    });

    // Observar todas las vistas pesadas que existan en el DOM
    Object.keys(HEAVY_VIEWS).forEach(viewId => {
      const el = document.getElementById(viewId);
      if (el) {
        observer.observe(el);
        log(`Observando ${viewId}`);
      }
    });

    log(`LazyRenderer activo: ${Object.keys(HEAVY_VIEWS).length} vistas monitorizadas`);
    document.documentElement.dataset.paleobotLazyRenderer = 'active';
  }

  /* ── Tareas diferidas con requestIdleCallback ─────────────────── */
  function scheduleIdleTasks() {
    // Tarea 1: Pre-indexar el glosario (costoso, no crítico al inicio)
    scheduleIdle(() => {
      try {
        if (typeof window.buildGlossRegex === 'function' &&
            typeof window.glosario === 'object') {
          const terms = Object.keys(window.glosario);
          terms.forEach(t => window.buildGlossRegex(t)); // pre-caché de regex
          log(`Glosario pre-indexado: ${terms.length} términos`);
        }
      } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }, { timeout: 5000 });

    // Tarea 2: Pre-calcular DB_INDEX si no existe
    scheduleIdle(() => {
      try {
        if (Array.isArray(window.DB) && !window.DB_INDEX) {
          window.DB_INDEX = {};
          window.DB.forEach(sp => { if (sp.id) window.DB_INDEX[sp.id] = sp; });
          log(`DB_INDEX pre-calculado: ${window.DB.length} taxones`);
        }
      } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }, { timeout: 3000 });

    // Tarea 3: Registrar extensiones pendientes en PaleoBotBus
    scheduleIdle(() => {
      try {
        if (window.PaleoBotBus && typeof window.PaleoBotBus.registerActions === 'function') {
          window.PaleoBotBus.registerActions({
            exportQuizProgress: () => { if (typeof window.exportQuizProgress === 'function') window.exportQuizProgress(); },
            openStudentGuide:   () => { if (typeof window.openStudentGuide === 'function')   window.openStudentGuide(); },
          });
          log('Acciones idle registradas en PaleoBotBus');
        }
      } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }, { timeout: 1000 });
  }

  /* ── Interceptar switchView para marcar vistas ya activas ──────── */
  function patchSwitchView() {
    const orig = window.switchView;
    if (typeof orig !== 'function' || orig.__lazyPatched) return;
    window.switchView = function(viewId, ...args) {
      // Si es una vista pesada y no renderizada, renderizar antes de mostrar
      const config = HEAVY_VIEWS['view-' + viewId];
      if (config && !_rendered.has('view-' + viewId)) {
        safeRender('view-' + viewId, config.fn, config.label);
      }
      return orig.call(this, viewId, ...args);
    };
    window.switchView.__lazyPatched = true;
    log('switchView parchado para lazy render');
  }

  /* ── Inicialización ─────────────────────────────────────────────── */
  function init() {
    initLazyViews();
    scheduleIdleTasks();
    // Parchear switchView cuando esté disponible
    if (typeof window.switchView === 'function') {
      patchSwitchView();
    } else {
      // switchView puede no estar disponible aún: observar con MutationObserver
      let attempts = 0;
      const poller = setInterval(() => {
        if (typeof window.switchView === 'function' || ++attempts > 20) {
          clearInterval(poller);
          patchSwitchView();
        }
      }, 250);
    }
    document.documentElement.dataset.paleobotLazyRenderer = 'ready';
    log('PaleoBotLazyRenderer inicializado');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }

  window.PaleoBotLazyRenderer = { safeRender, scheduleIdle, getRendered: () => [..._rendered] };
})();
