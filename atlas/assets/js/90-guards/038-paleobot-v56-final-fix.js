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
    revisiones:'investigar', genomica:'investigar', paleoproteomica:'investigar', datacion:'investigar',
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

  /* ── Interceptar TODOS los viewchange espurios en capture ── */
  var EVENTS = [
    'paleobot:viewchange', 'paleobot:v37-viewchange',
    'paleobot:v49-viewchange', 'paleobot:v50-viewchange',
    'paleobot:v51-viewchange', 'paleobot:v55-viewchange',
    'paleobot:combined-viewchange'
  ];
  EVENTS.forEach(function(name) {
    document.addEventListener(name, function(ev) {
      if (!isLocked()) return;
      var v = ev.detail && ev.detail.view;
      if (v && v !== _intended) {
        ev.stopImmediatePropagation();
        setTimeout(function() { if (isLocked()) forceView(_intended); }, 0);
        setTimeout(function() { if (isLocked()) forceView(_intended); }, 40);
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
    if (!trigger) return;
    var viewId = trigger.dataset.view;
    if (!viewId || viewId.indexOf('${') !== -1) return;
    if (!document.getElementById('view-' + viewId)) return;

    _intended   = viewId;
    _intendedAt = Date.now();

    patchV37();
    forceView(viewId);
    setTimeout(function() { if (_intended === viewId) callRenderer(viewId); }, 0);
    setTimeout(function() {
      if (_intended === viewId) { _intended = null; }
    }, LOCK_MS);

  }, true);

  /* ── Init ── */
  function init() { installObs(); patchV37(); document.documentElement.dataset.paleobotV56 = 'ready'; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.PaleoBotV56 = { forceView: forceView, patchV37: patchV37 };
})();


// ── v58: módulos de sesión y bienvenida DEA ─────────────────
// ── PaleoBot: Pantalla de bienvenida DEA ────────────────────────
(function initDeaWelcome() {
  const welcome = document.getElementById('deaWelcome');
  const rubricToggle = document.getElementById('deaRubricToggle');
  const rubricPanel  = document.getElementById('deaRubricPanel');
  const rubricBody   = document.getElementById('deaRubricBody');
  const dismiss      = document.getElementById('deaDismiss');

  // Ocultar si ya fue descartada en esta sesión
  var _deaDismissed = false;
  try { _deaDismissed = sessionStorage.getItem('paleobot_dea_dismissed') === '1'; } catch (e) { /* recuperable */ }
  if (_deaDismissed && welcome) {
    welcome.style.display = 'none';
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
      welcome.style.display = 'none';
      try { sessionStorage.setItem('paleobot_dea_dismissed', '1'); } catch (e) { /* recuperable */ }
    });
  }
})();


// ── v58: Restaurar última vista al inicio de sesión ─────────────
(function restoreLastView() {
  try {
    const storedView = localStorage.getItem('paleobot_last_view');
    const candidate = String(storedView || '')
      .trim()
      .replace(/^vista[-_]?/i, '')
      .toLowerCase();
    const lastView = document.getElementById('view-' + candidate) ? candidate : '';
    if (!lastView || lastView === 'timeline') return; // no mostrar para la vista por defecto
    if (storedView !== lastView) localStorage.setItem('paleobot_last_view', lastView);
    const banner = document.createElement('div');
    banner.id = 'sessionRestoreBanner';
    banner.dataset.lastView = lastView;
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = [
      'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);',
      'background:var(--primary);color:white;border-radius:999px;',
      'padding:10px 20px;font-size:0.82rem;font-family:var(--font-sans);',
      'box-shadow:0 6px 22px rgba(28,43,58,0.28);z-index:490;',
      'display:flex;align-items:center;gap:12px;white-space:nowrap;',
      'animation:fadeIn 0.3s ease-out;'
    ].join('');
    const viewName = lastView.charAt(0).toUpperCase() + lastView.slice(1).replace(/-/g,' ');
    banner.innerHTML = `
      <span>Última sesión: vista <strong>${escapeHtmlText(viewName)}</strong></span>
      <button type="button" data-session-restore data-last-view="${escapeHtmlText(lastView)}"
        style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);color:white;border-radius:999px;padding:4px 12px;cursor:pointer;font-size:0.78rem;font-weight:700;font-family:var(--font-sans);">
        Continuar
      </button>
      <button type="button" data-session-dismiss
        style="background:transparent;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:1rem;line-height:1;padding:0 4px;" aria-label="Cerrar">✕</button>`;
    const landingHero = document.querySelector('#pb-hub .pb-landing-hero');
    if (landingHero && !document.body.classList.contains('pb-workspace-entered')) {
      banner.classList.add('is-inline');
      landingHero.insertAdjacentElement('afterend', banner);
    } else {
      document.body.appendChild(banner);
    }
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
      Object.keys(localStorage).filter(k => k.startsWith('paleobot_notes_')).forEach(k => {
        const note = JSON.parse(localStorage.getItem(k) || '{}');
        if (note && note.text) notes.push('Especie ' + k.replace('paleobot_notes_','') + ': ' + note.text);
      });
    } catch(e) { /* recuperable: suprimido intencionalmente */ }
    const lines = [
      'PALEOBOT — REGISTRO DE SESIÓN',
      'Fecha: ' + new Date().toLocaleString('es-ES'),
      'Última vista: ' + ((function(){ try { return localStorage.getItem('paleobot_last_view'); } catch (e) { return null; } })() || 'Cronología'),
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
