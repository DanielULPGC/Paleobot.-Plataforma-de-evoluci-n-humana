// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v55-nav
/**
 * PaleoBot — Navegación por MutationObserver
 *
 * PROBLEMA RAÍZ (diagnosticado en v52-v54):
 * El router v49 usa stopImmediatePropagation en window capture.
 * Intentar reemplazarlo en <head> o con monkey-patch es frágil
 * porque la sincronización difiere entre jsdom y navegadores reales.
 *
 * SOLUCIÓN DEFINITIVA:
 * No intervenimos en el routing — dejamos que todos los routers hagan
 * lo que quieran. En cambio, vigilamos el resultado con un
 * MutationObserver y corregimos inmediatamente si es incorrecto.
 *
 * Flujo:
 *   1. pointerdown en window capture → registra la vista intencionada
 *   2. El evento se propaga → v49 y otros routers activan alguna vista
 *   3. MutationObserver detecta el cambio de clase .active
 *   4. Si la vista activa ≠ vista intencionada → corrección inmediata
 *   5. syncNav() actualiza pbV50Block, navFamily, aria-pressed
 */
(function PaleoBotV55Nav() {
  'use strict';

  var V2B = {
    timeline:'explorar', map:'explorar', continentes:'explorar', africa:'explorar',
    asia:'explorar', europe:'explorar', america:'explorar', yacimientos:'explorar',
    biogeo:'explorar', contexto:'explorar', paleoecologia:'explorar',
    tree:'interpretar', phylo:'interpretar', clima:'interpretar',
    coexistencias:'interpretar', primatologia:'interpretar', constructor:'interpretar',
    revisiones:'investigar', genomica:'investigar', paleoproteomica:'investigar', datacion:'investigar',
    debates:'investigar', estratigrafia:'investigar', tafonomia:'investigar',
    introgresion:'investigar', holotipos:'investigar', dispersal:'investigar',
    aula:'aprender', recursos:'aprender', itinerarios:'aprender', socratico:'aprender'
  };

  /* The view the user intended to navigate to */
  var _intended = null;
  var _intendedAt = 0;

  /* ── syncNav: update all UI state to reflect active view ──────────── */
  function syncNav(viewId) {
    var blockId = V2B[viewId] || 'explorar';
    document.body.dataset.pbV50Block       = blockId;
    /* Use pbV55NavBlock instead of navFamily to avoid matching [data-nav-family] selectors */
    document.body.dataset.pbV55NavBlock    = blockId;
    document.body.dataset.pbV55LastView    = viewId;
    document.body.dataset.pbV50UserNavigated = '1';

    /* Block tabs */
    /* Exclude body: body gets data-pb-v50-block dataset which matches this selector */
    document.querySelectorAll('[data-pb-v50-block]').forEach(function(b) {
      if (b === document.body || b === document.documentElement) return;
      var on = b.dataset.pbV50Block === blockId;
      b.classList.toggle('active', on);
      var roleAttr = b.getAttribute('role');
      if (roleAttr === 'tab') {
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.removeAttribute('aria-pressed');
      } else {
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.removeAttribute('aria-selected');
      }
    });
    /* navFamily buttons (exclude body element which also has this dataset key) */
    document.querySelectorAll('[data-nav-family]').forEach(function(b) {
      if (b === document.body) return; /* body must never get aria-pressed */
      var on = b.dataset.navFamily === blockId;
      b.classList.toggle('active', on);
      var roleAttr = b.getAttribute('role');
      if (roleAttr === 'tab') {
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.removeAttribute('aria-pressed');
      } else {
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    });
    /* view buttons */
    document.querySelectorAll('[data-view],[data-pb-v50-view]').forEach(function(b) {
      var v = b.dataset.view || b.dataset.pbV50View;
      if (!v) return;
      var on = v === viewId;
      b.classList.toggle('active', on);
      var roleAttr = b.getAttribute('role');
      if (roleAttr === 'tab') {
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.removeAttribute('aria-pressed');
      } else if (b.tagName === 'BUTTON' || roleAttr === 'button') {
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    });
  }

  /* ── enforceView: ensure the intended view is active ──────────────── */
  function enforceView(viewId) {
    var section = document.getElementById('view-' + viewId);
    if (!section) return;
    var isActive = section.classList.contains('active');
    if (!isActive) {
      /* Correct it */
      document.querySelectorAll('.view-section').forEach(function(s) {
        var on = s === section;
        s.classList.toggle('active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      /* Trigger render */
      try {
        if (window.PaleoBotV55Router && window.PaleoBotV55Router.activateView)
          window.PaleoBotV55Router.activateView(viewId, { scroll: false });
        else if (typeof window.renderActiveView === 'function')
          window.renderActiveView(viewId);
      } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }
    syncNav(viewId);
    /* Scroll to section (not toolbar) */
    setTimeout(function() {
      if (_intended && !_intendedFromToolbar) {
        var s2 = document.getElementById('view-' + viewId);
        if (s2) try { s2.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e) { /* recuperable: suprimido intencionalmente */ }
      }
    }, 40);
  }

  var _intendedFromToolbar = false;
  var _observer = null;
  var _enforcing = false;
  var _landingHidden = false;

  /* ── Hide landing page sections (they contain nav buttons mistaken for views) */
  function hideLandingAndScroll(viewId, inToolbar) {
    var main = document.getElementById('main-content');
    if (!main) return;

    /* Selectors for all landing/portada elements that appear BEFORE main-content */
    var LANDING_SELECTORS = [
      '.paleobot-cover-v45',
      '.atlas-workbench',
      '.design-entry-panel',
      '.visual-use-guide',
      '.quick-start-panel',
      '.landing-routes',
      '.learning-compass',
      '.persona-guide-panel',
      '.paleogenomics-entry-panel',
      '.v34-pro-dashboard',
      '.v35-block-portal-shell',
      '.v35-landing',
      '.pb-v50-hero',
      '.landing-evidence-strip',
      '.landing-search',
      '.landing-actions',
      '.home-visual-card',
      '.visual-learning-section',
      '[class*="landing"]',
      '[class*="portada"]'
    ];

    if (!_landingHidden) {
      LANDING_SELECTORS.forEach(function(sel) {
        try {
          document.querySelectorAll(sel).forEach(function(el) {
            /* Only hide elements that are OUTSIDE main-content */
            if (!main.contains(el) && el !== main) {
              el.style.display = 'none';
            }
          });
        } catch(e) { /* recuperable: suprimido intencionalmente */ }
      });
      _landingHidden = true;
    }

    /* Scroll to the active view-section */
    if (!inToolbar) {
      var section = document.getElementById('view-' + viewId);
      if (section) {
        try {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch(e) {
          try { window.scrollTo({ top: section.offsetTop - 96, behavior: 'smooth' }); }
          catch(e2) { /* recuperable: suprimido intencionalmente */ }
        }
      }
    }
  }

  /* ── MutationObserver: watch all view-section class changes ─────────── */
  function installObserver() {
    if (_observer) return;
    var viewSections = document.querySelectorAll('.view-section[id^="view-"]');
    if (!viewSections.length) { setTimeout(installObserver, 100); return; }

    _observer = new MutationObserver(function(mutations) {
      if (_enforcing) return;
      if (!_intended) return;
      /* Only react within 800ms of a pointerdown on a [data-view] button */
      if (Date.now() - _intendedAt > 800) { _intended = null; return; }

      /* Check if the currently active view matches the intended */
      var active = document.querySelector('.view-section.active');
      var activeId = active ? active.id.replace('view-', '') : null;

      if (activeId && activeId !== _intended) {
        _enforcing = true;
        enforceView(_intended);
        setTimeout(function() { _enforcing = false; }, 100);
      } else if (activeId === _intended) {
        /* Correct view is active — just sync nav state */
        syncNav(_intended);
        _intended = null;
      }
    });

    viewSections.forEach(function(section) {
      _observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ── pointerdown: activate view AND hide landing BEFORE click routers ── */
  window.addEventListener('pointerdown', function(e) {
    if (!e.target || !e.target.closest) return;
    var trigger = e.target.closest('[data-view]');
    if (!trigger) return;
    var viewId = trigger.dataset.view;
    if (!viewId || viewId.indexOf('${') !== -1) return;
    if (!document.getElementById('view-' + viewId)) return;

    var inToolbar = Boolean(trigger.closest('.toolbar, #pbV50Blocks, [id*="BlockPanel"]'));
    _intended = viewId;
    _intendedAt = Date.now();
    _intendedFromToolbar = inToolbar;

    /* 1. Activate section synchronously */
    var section = document.getElementById('view-' + viewId);
    if (section) {
      document.querySelectorAll('.view-section').forEach(function(s) {
        var on = s === section;
        s.classList.toggle('active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
    }

    /* 2. Sync all nav UI immediately */
    syncNav(viewId);

    /* 3. Hide landing page and scroll to active view.
     *    The landing page (before <main>) contains buttons labeled "Cronología",
     *    "Árbol", etc. which users mistake for the active view.
     *    We hide it and scroll to the real view-section. */
    setTimeout(function() {
      hideLandingAndScroll(viewId, inToolbar);
    }, 20);

  }, true); /* capture: fires before ALL click handlers */

  /* ── Guard: ensure body never has aria-selected or aria-pressed ─────── */
  (function installBodyAriaGuard() {
    var bodyGuard = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === 'attributes') {
          var attr = m.attributeName;
          if (attr === 'aria-selected' || attr === 'aria-pressed') {
            document.body.removeAttribute(attr);
          }
        }
      });
    });
    bodyGuard.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-selected', 'aria-pressed', 'aria-expanded']
    });
  })();

  /* ── Also sync after any viewchange event ─────────────────────────── */
  ['paleobot:viewchange','paleobot:v49-viewchange',
   'paleobot:v55-viewchange','paleobot:v51-viewchange'].forEach(function(name) {
    document.addEventListener(name, function(ev) {
      var v = ev.detail && ev.detail.view;
      if (!v) return;
      setTimeout(function() {
        /* Only sync if this matches our intent (or no intent recorded) */
        if (!_intended || _intended === v || Date.now() - _intendedAt > 800) {
          syncNav(v);
          _intended = null;
        }
      }, 0);
    });
  });

  /* ── WCAG 2.2 DOM patches ─────────────────────────────────────────── */
  function wcagPatches() {
    /* 1.1.1: aria-hidden on decorative SVGs in buttons */
    document.querySelectorAll(
      'button svg,[data-action] svg,[data-view] svg,[data-modal-toggle] svg,.nav-family-btn svg'
    ).forEach(function(svg) {
      if (!svg.hasAttribute('aria-label') && !svg.hasAttribute('role')) {
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
      }
    });
    /* 1.1.1: img without alt */
    document.querySelectorAll('img:not([alt])').forEach(function(img) {
      img.setAttribute('alt', '');
      img.setAttribute('role', 'presentation');
    });
    /* 4.1.2: role=dialog + aria-modal on modals */
    document.querySelectorAll('.modal-overlay').forEach(function(m) {
      if (!m.getAttribute('role')) m.setAttribute('role', 'dialog');
      if (!m.getAttribute('aria-modal')) m.setAttribute('aria-modal', 'true');
      if (!m.getAttribute('aria-labelledby') && !m.getAttribute('aria-label')) {
        var h = m.querySelector('h1,h2,h3,h4,h5,h6');
        if (h) {
          if (!h.id) h.id = 'mh-' + Math.random().toString(36).slice(2,7);
          m.setAttribute('aria-labelledby', h.id);
        }
      }
    });
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  function init() {
    installObserver();
    wcagPatches();
    /* Initial sync with active view */
    setTimeout(function() {
      var active = document.querySelector('.view-section.active');
      if (active) syncNav(active.id.replace('view-', ''));
    }, 300);
    document.documentElement.dataset.paleobotV55 = 'ready';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else { init(); }

  /* Re-run WCAG patches when views render */
  ['paleobot:viewchange','paleobot:v55-viewchange'].forEach(function(n) {
    document.addEventListener(n, function() { setTimeout(wcagPatches, 200); });
  });

  window.PaleoBotV55Nav = { syncNav: syncNav, enforceView: enforceView, V2B: V2B };
})();
