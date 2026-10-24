// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v56-final-fix
(function PaleoBotV56FinalFix() {
  'use strict';

  /* Vista → bloque */
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

  /* Lock — 2500ms cubre el evento v37 que llega a ~1600ms */
  var LOCK_MS  = 2500;
  var _intended   = null;
  var _intendedAt = 0;

  function isLocked() {
    return _intended !== null && (Date.now() - _intendedAt) < LOCK_MS;
  }
  function activeViewId() {
    var s = document.querySelector('.view-section.active');
    return s ? s.id.replace('view-', '') : '';
  }

  /* ── Activar DOM + sincronizar botones ── */
  function forceView(viewId) {
    var section = document.getElementById('view-' + viewId);
    if (!section) return;
    var _guard = false;
    document.querySelectorAll('.view-section').forEach(function(s) {
      var on = s === section;
      s.classList.toggle('active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    syncButtons(viewId);
  }

  function syncButtons(viewId) {
    var blockId = V2B[viewId] || 'explorar';
    document.body.dataset.pbV50Block    = blockId;
    document.body.dataset.pbV55LastView = viewId;
    document.querySelectorAll('[data-view],[data-pb-v50-view]').forEach(function(b) {
      var v = b.dataset.view || b.dataset.pbV50View;
      if (!v) return;
      b.classList.toggle('active', v === viewId);
      if (b.tagName === 'BUTTON' || b.getAttribute('role') === 'button')
        b.setAttribute('aria-pressed', v === viewId ? 'true' : 'false');
    });
    document.querySelectorAll('[data-pb-v50-block]').forEach(function(b) {
      if (b === document.body || b === document.documentElement) return;
      var on = b.dataset.pbV50Block === blockId;
      b.classList.toggle('active', on);
      b.setAttribute(b.getAttribute('role') === 'tab' ? 'aria-selected' : 'aria-pressed',
                     on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-nav-family]').forEach(function(b) {
      if (b === document.body) return;
      var on = b.dataset.navFamily === blockId;
      b.classList.toggle('active', on);
      b.setAttribute(b.getAttribute('role') === 'tab' ? 'aria-selected' : 'aria-pressed',
                     on ? 'true' : 'false');
    });
  }

  function callRenderer(viewId) {
    try { if (typeof window.renderActiveView === 'function') window.renderActiveView(viewId); }
    catch(e) { /* recuperable: suprimido intencionalmente */ }
  }

  /* ── Monkey-patch de v37Controls ── */
  function patchV37() {
    var c = window.PaleoBotV37Controls;
    if (!c || c.__v56Patched) return;
    var _origSwitch = c.switchView;
    var _origFamily = c.setFamily;

    c.switchView = function(viewId) {
      if (isLocked() && viewId !== _intended) return false;
      return _origSwitch.apply(this, arguments);
    };

    c.setFamily = function(family, options) {
      if (isLocked()) {
        /* Solo actualizar botones de familia, nunca redirigir */
        var blockId = V2B[_intended] || 'explorar';
        if (family !== blockId) return;
        /* Misma familia: dejar pasar pero sin forceDefault */
        if (options && options.forceDefault) {
          options = Object.assign({}, options, { forceDefault: false });
        }
      }
      return _origFamily.apply(this, [family, options]);
    };

    c.__v56Patched = true;
  }

  patchV37();
  setTimeout(patchV37, 0);
  setTimeout(patchV37, 100);
  setTimeout(patchV37, 500);
  document.addEventListener('DOMContentLoaded', patchV37, { once: true });

  /* ── Viewchange espurio: reparación no cancelante ── */
  var EVENTS = [
    'paleobot:viewchange', 'paleobot:v37-viewchange',
    'paleobot:v49-viewchange', 'paleobot:v50-viewchange',
    'paleobot:v51-viewchange', 'paleobot:v55-viewchange',
    'paleobot:combined-viewchange'
  ];

  function repairIntendedState(sourceEvent) {
    if (!isLocked() || !_intended) return false;
    var intended = _intended;
    forceView(intended);

    try {
      if (window.PaleoBotCanonicalNav && typeof window.PaleoBotCanonicalNav.setCanonical === 'function') {
        window.PaleoBotCanonicalNav.setCanonical(intended);
      }
    } catch(e) { /* recuperable: suprimido intencionalmente */ }

    try {
      if (window.PaleoBotV55Nav && typeof window.PaleoBotV55Nav.syncNav === 'function') {
        window.PaleoBotV55Nav.syncNav(intended);
      }
    } catch(e) { /* recuperable: suprimido intencionalmente */ }

    if (sourceEvent !== 'paleobot:viewchange') {
      try {
        document.dispatchEvent(new CustomEvent('paleobot:viewchange', {
          detail:{ view:intended, source:'v56-intent-repair', repairedFrom:sourceEvent || '' }
        }));
      } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }
    return true;
  }

  function scheduleIntentRepair(sourceEvent) {
    setTimeout(function() { repairIntendedState(sourceEvent); }, 0);
    setTimeout(function() { repairIntendedState(sourceEvent); }, 40);
  }

  EVENTS.forEach(function(name) {
    document.addEventListener(name, function(ev) {
      if (!isLocked()) return;
      var v = ev.detail && ev.detail.view;
      if (v && v !== _intended) {
        // No cancelar: otros módulos legítimos deben seguir recibiendo viewchange.
        scheduleIntentRepair(name);
      }
    }, true);
  });

  /* ── MutationObserver — corrección inmediata ── */
  var _obs = null, _fixing = false;

  function installObs() {
    if (_obs) return;
    var secs = document.querySelectorAll('.view-section[id^="view-"]');
    if (!secs.length) { setTimeout(installObs, 100); return; }
    _obs = new MutationObserver(function() {
      if (_fixing || !isLocked()) return;
      var cur = activeViewId();
      if (cur && cur !== _intended) {
        _fixing = true;
        forceView(_intended);
        _fixing = false;
      }
    });
    secs.forEach(function(s) {
      _obs.observe(s, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ── pointerdown — registrar intención ── */
  window.addEventListener('pointerdown', function(ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var trigger = t.closest('[data-view]');
    if (!trigger) {
      /* R95: una pulsación en una pestaña de bloque o de familia es una intención de
         navegación nueva y anula el bloqueo de la vista anterior. <body> y <html> portan
         esos atributos como estado y se excluyen. */
      var blockTrigger = t.closest('[data-pb-v50-block],[data-pb-v50-open-block],[data-nav-family]');
      if (blockTrigger && blockTrigger !== document.body && blockTrigger !== document.documentElement) {
        _intended = null;
      }
      return;
    }
    var viewId = trigger.dataset.view;
    if (!viewId || viewId.indexOf('${') !== -1) return;
    if (!document.getElementById('view-' + viewId)) return;

    _intended   = viewId;
    _intendedAt = Date.now();
    /* R96 (de la variante recibida): token de la intención; un temporizador antiguo no
       puede liberar ni renderizar sobre una intención más reciente de la misma vista. */
    var intentAt = _intendedAt;

    patchV37();
    forceView(viewId);
    setTimeout(function() { if (_intended === viewId && _intendedAt === intentAt) callRenderer(viewId); }, 0);
    setTimeout(function() {
      if (_intended === viewId && _intendedAt === intentAt) { _intended = null; }
    }, LOCK_MS);

  }, true);

  /* R96 (de la variante recibida): activación por teclado (Intro/Espacio) de una pestaña
     de bloque o familia; no genera pointerdown y el bloqueo anterior seguía activo. */
  window.addEventListener('keydown', function(ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var b = ev.target && ev.target.closest && ev.target.closest('[data-pb-v50-block],[data-pb-v50-open-block],[data-nav-family]');
    if (b && b !== document.body && b !== document.documentElement) _intended = null;
  }, true);

  /* ── Init ── */
  function init() { installObs(); patchV37(); document.documentElement.dataset.paleobotV56 = 'ready'; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.PaleoBotV56 = { forceView: forceView, patchV37: patchV37 };
})();


// ── v58: módulos de sesión y bienvenida DEA ─────────────────
// ── PaleoBot v58: Pantalla de bienvenida DEA ────────────────────
(function initDeaWelcome() {
  const welcome = document.getElementById('deaWelcome');
  const rubricToggle = document.getElementById('deaRubricToggle');
  const rubricPanel  = document.getElementById('deaRubricPanel');
  const rubricBody   = document.getElementById('deaRubricBody');
  const dismiss      = document.getElementById('deaDismiss');

  // Ocultar si ya fue descartada en esta sesión
  if (window.PaleoBotStorage?.getSession('paleobot_dea_dismissed', null) === '1' && welcome) {
    window.PaleoBotStyleState.display(welcome, 'none');
  }

  // Toggle rúbrica
  if (rubricToggle && rubricPanel) {
    rubricToggle.addEventListener('click', function() {
      const open = rubricPanel.classList.toggle('open');
      rubricToggle.setAttribute('aria-expanded', String(open));
      if (open && rubricBody && typeof TEACHING_COMPETENCY_RUBRIC !== 'undefined') {
        // Renderizar rúbrica desde los datos del centro docente
        rubricBody.innerHTML = TEACHING_COMPETENCY_RUBRIC.map(item => `
          <tr>
            <td>${escapeHtmlText(item.criterion)}</td>
            <td>${escapeHtmlText(item.basic)}</td>
            <td>${escapeHtmlText(item.advanced)}</td>
            <td>${escapeHtmlText(item.expert)}</td>
          </tr>`).join('');
      }
    });
  }

  // Dismiss
  if (dismiss && welcome) {
    dismiss.addEventListener('click', function() {
      window.PaleoBotStyleState.display(welcome, 'none');
      window.PaleoBotStorage?.setSession('paleobot_dea_dismissed', '1');
    });
  }
})();


// ── v58: Restaurar última vista al inicio de sesión ─────────────
(function restoreLastView() {
  try {
    const lastView = window.PaleoBotStorage?.getPersistent('paleobot_last_view', null);
    if (!lastView || lastView === 'timeline') return; // no mostrar para la vista por defecto
    const banner = document.createElement('div');
    banner.id = 'sessionRestoreBanner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.classList.add('pb-r74-session-restore-banner');
    const viewName = lastView.charAt(0).toUpperCase() + lastView.slice(1).replace(/-/g,' ');
    banner.innerHTML = `
      <span>Última sesión: vista <strong>${escapeHtmlText(viewName)}</strong></span>
      <button class="pb-r70-gen-6916e01af6" type="button" data-session-restore data-last-view="${escapeHtmlText(lastView)}"
        >
        Continuar
      </button>
      <button class="pb-r70-gen-177b6a15ff" type="button" data-session-dismiss
         aria-label="Cerrar">✕</button>`;
    document.body.appendChild(banner);
    setTimeout(() => { if (banner.parentNode) banner.remove(); }, 8000);
  } catch(e) { /* recuperable: suprimido intencionalmente */ }
})();


// ── v58: Exportar progreso del quiz ─────────────────────────────
function exportQuizProgress() {
  try {
    const progress = QuizProgress.getAll ? QuizProgress.getAll() : {};
    const notes = [];
    try {
      // Recoger notas del cuaderno si existen
      window.PaleoBotStorage?.persistentKeys('paleobot_notes_').forEach(k => {
        const note = JSON.parse(window.PaleoBotStorage.getPersistent(k, '{}') || '{}');
        if (note && note.text) notes.push('Especie ' + k.replace('paleobot_notes_','') + ': ' + note.text);
      });
    } catch(e) { /* recuperable: suprimido intencionalmente */ }
    const lines = [
      'PALEOBOT — REGISTRO DE SESIÓN',
      'Fecha: ' + new Date().toLocaleString('es-ES'),
      'Última vista: ' + (window.PaleoBotStorage?.getPersistent('paleobot_last_view', null) || 'Cronología'),
      '',
      '═══ AUTOEVALUACIÓN ═══',
      'Preguntas respondidas: ' + (Object.keys(progress).length),
    ];
    Object.entries(progress).forEach(([id, data]) => {
      lines.push('  · ' + id + ': ' + (data.correct||0) + ' correctas / ' + (data.total||0) + ' intentos');
    });
    if (notes.length) {
      lines.push('');
      lines.push('═══ NOTAS DEL CUADERNO ═══');
      notes.forEach(n => lines.push(n));
    }
    lines.push('');
    lines.push('(Este archivo puede entregarse como evidencia de trabajo en Moodle.)');
    const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'paleobot-progreso-' + new Date().toISOString().slice(0,10) + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('No se pudo exportar el progreso.'); }
}
