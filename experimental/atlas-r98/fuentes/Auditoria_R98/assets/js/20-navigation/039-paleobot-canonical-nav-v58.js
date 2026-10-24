// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-canonical-nav-v58
/**
 * PaleoBot v58 — Controlador canónico de navegación
 * 
 * Se instala DESPUÉS de todos los shells (v34–v56).
 * Mantiene un registro autoritativo de la vista deseada en
 * sessionStorage y lo restaura cada vez que el DOM diverge.
 * 
 * Principio: un único MutationObserver permanente + un único
 * pointerdown en capture que registra la intención y la persiste.
 * No expira. No se puede sobrescribir por shells anteriores.
 */
(function PaleoBotCanonicalNav() {
  'use strict';

  var SESSION_KEY = 'paleobot_canonical_view';
  var LS_KEY      = 'paleobot_last_view';
  var V2B = {
    timeline:'explorar', map:'explorar', continentes:'explorar', africa:'explorar',
    asia:'explorar', europe:'explorar', america:'explorar', yacimientos:'explorar',
    biogeo:'explorar', contexto:'explorar', paleoecologia:'explorar',
    tree:'interpretar', phylo:'interpretar', clima:'interpretar',
    coexistencias:'interpretar', primatologia:'interpretar', constructor:'interpretar',
    revisiones:'investigar', genomica:'investigar', datacion:'investigar',
    debates:'investigar', estratigrafia:'investigar', tafonomia:'investigar',
    introgresion:'investigar', holotipos:'investigar', dispersal:'investigar',
    aula:'aprender', recursos:'aprender', itinerarios:'aprender', socratico:'aprender'
  };

  /* ── Estado canónico ─────────────────────────────────────── */
  var _canonical = null;   // vista que el usuario realmente quiere
  var _restoring = false;  // guard anti-recursión

  function getCanonical() {
    return _canonical || window.PaleoBotStorage?.getSession(SESSION_KEY, null) || 'timeline';
  }

  function setCanonical(viewId) {
    if (!viewId || !document.getElementById('view-' + viewId)) return;
    _canonical = viewId;
    window.PaleoBotStorage?.setSession(SESSION_KEY, viewId);
    window.PaleoBotStorage?.setPersistent(LS_KEY, viewId);
    document.body.dataset.pbV50UserNavigated = '1';
    document.body.dataset.pbV55LastView      = viewId;
    document.body.dataset.pbV50Block         = V2B[viewId] || 'explorar';
  }

  /* ── Activar DOM sin llamar a ningún shell ───────────────── */
  /* R95: sincroniza pestañas de bloque y familia con una vista activada por programa
     (búsqueda global, enlaces «→ Mapa», itinerarios), que no pasan por las pestañas v50. */
  function syncBlockUi(viewId) {
    var blockId = V2B[viewId];
    if (!blockId) return;
    document.querySelectorAll('[data-pb-v50-block]').forEach(function(b) {
      if (b === document.body || b === document.documentElement) return;
      var on = b.dataset.pbV50Block === blockId;
      b.classList.toggle('active', on);
      b.setAttribute(b.getAttribute('role') === 'tab' ? 'aria-selected' : 'aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-nav-family]').forEach(function(b) {
      if (b === document.body) return;
      b.classList.toggle('active', b.dataset.navFamily === blockId);
    });
    document.body.dataset.navFamily = blockId;
  }

  function domActivate(viewId) {
    var section = document.getElementById('view-' + viewId);
    if (!section) return false;
    document.querySelectorAll('.view-section').forEach(function(s) {
      var on = s === section;
      s.classList.toggle('active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    /* Sincronizar botones */
    var blockId = V2B[viewId] || 'explorar';
    document.querySelectorAll('[data-view],[data-pb-v50-view]').forEach(function(b) {
      var v = b.dataset.view || b.dataset.pbV50View;
      if (!v) return;
      var on = v === viewId;
      b.classList.toggle('active', on);
      if (b.tagName === 'BUTTON' || b.getAttribute('role') === 'button' || b.getAttribute('role') === 'tab')
        b.setAttribute(b.getAttribute('role') === 'tab' ? 'aria-selected' : 'aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-pb-v50-block]').forEach(function(b) {
      if (b === document.body || b === document.documentElement) return;
      var on = b.dataset.pbV50Block === blockId;
      b.classList.toggle('active', on);
      b.setAttribute(b.getAttribute('role') === 'tab' ? 'aria-selected' : 'aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-nav-family]').forEach(function(b) {
      if (b === document.body) return;
      b.classList.toggle('active', b.dataset.navFamily === blockId);
    });
    /* R95: la familia de navegación del documento sigue al bloque de la vista activada;
       antes podía quedar desfasada (p. ej., vista de «explorar» con familia «interpretar»). */
    document.body.dataset.navFamily = blockId;
    return true;
  }

  /* ── Restaurar la vista canónica si el DOM diverge ──────── */
  function maybeRestore() {
    if (_restoring) return;
    var desired = getCanonical();
    if (!desired) return;
    var current = (document.querySelector('.view-section.active') || {}).id;
    if (current === 'view-' + desired) return;  // ya está bien
    _restoring = true;
    domActivate(desired);
    /* Pedir render sin forzar navegación */
    setTimeout(function() {
      /* R95: si entre tanto el usuario eligió otra vista (su pointerdown llega después de
         este observador), no se reactiva la anterior: evitaba que el router v55 emitiera
         un cambio de vista obsoleto que volvía a fijarla como canónica. */
      if (_canonical !== desired) { _restoring = false; return; }
      try {
        if (window.PaleoBotV55Router && window.PaleoBotV55Router.activateView)
          window.PaleoBotV55Router.activateView(desired, { scroll: false });
        else if (typeof window.renderActiveView === 'function')
          window.renderActiveView(desired);
      } catch(e) { /* recuperable: suprimido intencionalmente */ }
      _restoring = false;
    }, 0);
  }

  /* ── MutationObserver permanente ────────────────────────── */
  var _obs = null;
  function installObs() {
    if (_obs) return;
    var secs = document.querySelectorAll('.view-section[id^="view-"]');
    if (!secs.length) { setTimeout(installObs, 150); return; }
    _obs = new MutationObserver(function() {
      if (_restoring) return;
      /* Solo corregir si hay intención canónica registrada */
      if (_canonical) maybeRestore();
    });
    secs.forEach(function(s) {
      _obs.observe(s, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ── pointerdown en capture: registrar intención ─────────── */
  window.addEventListener('pointerdown', function(e) {
    if (!e.target || !e.target.closest) return;
    /* Ignorar clicks dentro de modales y paneles flotantes */
    if (e.target.closest('.modal-overlay,.detail-panel,.side-panel,#detailView,.lightbox')) return;
    var trigger = e.target.closest('[data-view]');
    if (!trigger) {
      /* R95: una pestaña de bloque o de familia es una navegación nueva: se olvida la vista
         canónica anterior para que el observador no devuelva al usuario a ella
         («eliges un apartado y salta a otro»). La siguiente vista elegida o el siguiente
         evento de cambio de vista vuelven a fijarla. <body>/<html> portan estos atributos
         como estado y se excluyen. */
      var blockTrigger = e.target.closest('[data-pb-v50-block],[data-pb-v50-open-block],[data-nav-family]');
      if (blockTrigger && blockTrigger !== document.body && blockTrigger !== document.documentElement) {
        _canonical = null;
      }
      return;
    }
    var viewId = trigger.dataset.view;
    if (!viewId || viewId.indexOf('${') !== -1) return;
    if (!document.getElementById('view-' + viewId)) return;
    setCanonical(viewId);
    domActivate(viewId);
  }, true);

  /* R96: el olvido de la vista canónica al elegir bloque se aplica también a la activación
     por teclado (Intro/Espacio) y a clics programáticos, que no generan pointerdown.
     (Idea tomada de la variante recibida; aquí se olvida la vista en lugar de fijar la
     vista por defecto del bloque, para no forzar un salto si la vista actual ya pertenece
     al bloque.) */
  function forgetOnBlockTarget(target) {
    var b = target && target.closest && target.closest('[data-pb-v50-block],[data-pb-v50-open-block],[data-nav-family]');
    if (b && b !== document.body && b !== document.documentElement && !target.closest('[data-view]')) _canonical = null;
  }
  window.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    forgetOnBlockTarget(e.target);
  }, true);
  document.addEventListener('click', function(e) { forgetOnBlockTarget(e.target); }, true);

  /* ── Escuchar todos los eventos de cambio de vista ──────── */
  ['paleobot:viewchange','paleobot:v55-viewchange',
   'paleobot:v51-viewchange','paleobot:v50-viewchange'].forEach(function(name) {
    document.addEventListener(name, function(ev) {
      var v = ev.detail && ev.detail.view;
      if (!v || !document.getElementById('view-' + v)) return;
      /* Si el evento refleja una vista válida, actualizarla como canónica */
      if (!_canonical || v !== 'timeline' || _canonical === 'timeline') {
        setCanonical(v);
        syncBlockUi(v);
      }
    });
  });

  /* ── Botón "Volver atrás" del atlas: actualizar canónico ── */
  document.addEventListener('click', function(e) {
    var backBtn = e.target.closest('[data-back-action]');
    if (!backBtn) return;
    /* Después de navigateBack() el DOM cambiará → el observer lo captura */
    setTimeout(function() {
      var cur = (document.querySelector('.view-section.active') || {}).id;
      if (cur) setCanonical(cur.replace('view-', ''));
    }, 50);
  });

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    installObs();
    /* Sincronizar con la vista activa inicial (timeline) */
    setTimeout(function() {
      var active = document.querySelector('.view-section.active');
      if (active && !_canonical) {
        var v = active.id.replace('view-', '');
        /* Solo guardar si no es timeline — la portada inicial no debe bloquear */
        /* la primera navegación real del usuario */
        if (v && v !== 'timeline') setCanonical(v);
      }
    }, 500);
    document.documentElement.dataset.paleobotCanonicalNav = 'ready';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else { init(); }

  window.PaleoBotCanonicalNav = {
    setCanonical: setCanonical,
    getCanonical: getCanonical,
    domActivate: domActivate,
    maybeRestore: maybeRestore
  };
})();
