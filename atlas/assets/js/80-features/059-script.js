// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot — DidacticActivationPanel
   ──────────────────────────────────────────────────────────────────────────
   Panel de activación didáctica completo, integrado con el hero existente.
   Sustituye y supera el banner prototipo de la Fase 1.

   Dependencias:
     · window.PB_DidacticSpec   (Fase 1)
     · VIEW_META, VIEW_HERO_META, VIEW_CONTEXT_NEXT
     · switchView(), escapeHtmlText(), getBloomLabel()
     · CustomEvent 'paleobot:viewchange' (disparado por switchView)
     · SafeStorage / sessionStorage
   ═══════════════════════════════════════════════════════════════════════════ */
(function PaleoBotV65_Phase2() {
  'use strict';

  const DEBUG = false;
  const log  = DEBUG ? console.log.bind(console,  '[PB65-P2]') : () => {};
  const warn = DEBUG ? console.warn.bind(console, '[PB65-P2]') : () => {};

  /* ── Guard: requiere Fase 1 ──────────────────────────────────────────── */
  function _waitForSpec(cb, tries) {
    if (window.PB_DidacticSpec) { cb(); return; }
    if ((tries || 0) > 30) { warn('PB_DidacticSpec no disponible tras 3s'); return; }
    setTimeout(() => _waitForSpec(cb, (tries || 0) + 1), 100);
  }

  /* ══════════════════════════════════════════════════════════════════════
     A. CONSTANTES Y ESTADO
     ══════════════════════════════════════════════════════════════════════ */

  /** Clave sessionStorage — vistas cuyo panel ya se mostró esta sesión */
  const SK_SHOWN    = 'pb_dap_shown';
  /** Clave sessionStorage — vistas visitadas (para suggestNextView) */
  const SK_VISITED  = 'pb_dap_visited';
  /** ms antes del auto-cierre del panel */
  const AUTO_CLOSE_MS = 14000;
  /** Colores por nivel de Bloom (codificación universal del proyecto) */
  const BLOOM_COLORS = {
    1: { bg:'#0e7f65', text:'#fff', label:'Recordar' },
    2: { bg:'#0e7f65', text:'#fff', label:'Comprender' },
    3: { bg:'#1a4fa0', text:'#fff', label:'Aplicar' },
    4: { bg:'#c07800', text:'#fff', label:'Analizar' },
    5: { bg:'#aa1f1f', text:'#fff', label:'Evaluar' },
    6: { bg:'#6b3faa', text:'#fff', label:'Crear' }
  };

  /* Estado de sesión en memoria (respaldo si sessionStorage falla) */
  let _shownInMemory   = new Set();
  let _visitedInMemory = new Set();

  /* ══════════════════════════════════════════════════════════════════════
     B. GESTIÓN DE SESIÓN
     ══════════════════════════════════════════════════════════════════════ */

  function _ssGet(key, fallback) {
    try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }
  function _ssSet(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* iOS privado */ }
  }

  function _getShown()   { return new Set(_ssGet(SK_SHOWN,   [])); }
  function _getVisited() { return new Set(_ssGet(SK_VISITED, [])); }

  function _markShown(viewId) {
    _shownInMemory.add(viewId);
    const s = _getShown(); s.add(viewId); _ssSet(SK_SHOWN, [...s]);
  }
  function _markVisited(viewId) {
    _visitedInMemory.add(viewId);
    const v = _getVisited(); v.add(viewId); _ssSet(SK_VISITED, [...v]);
  }
  function _hasBeenShown(viewId) {
    return _shownInMemory.has(viewId) || _getShown().has(viewId);
  }

  /* ══════════════════════════════════════════════════════════════════════
     C. CONSTRUCTOR DEL PANEL
     ──────────────────────────────────────────────────────────────────────
     El panel se inserta DENTRO del .view-hero existente, como una nueva
     sección inferior colapsable. No reemplaza el hero; lo enriquece.
     Si no hay .view-hero todavía, se inserta antes del primer hijo de
     la sección.
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * Construye y muestra el DidacticActivationPanel para una vista.
   * @param {string} viewId
   * @param {object} spec   — contrato de PB_DidacticSpec.getViewSpec()
   */
  function _buildPanel(viewId, spec) {
    const section = document.getElementById('view-' + viewId);
    if (!section) return;

    /* Limpiar panel previo */
    section.querySelector('.pb-dap')?.remove();

    const bloom = BLOOM_COLORS[spec.nivelBloom] || BLOOM_COLORS[1];

    /* ── Prerequisitos: estado de cada uno ───────────────────────────── */
    const visited = _getVisited();
    const prereqItems = spec.prerequisitos.map(pre => {
      const done   = visited.has(pre);
      const vMeta  = (typeof VIEW_META !== 'undefined' && VIEW_META[pre]) || {};
      const label  = vMeta.title || pre;
      return { id: pre, label, done };
    });

    /* ── Siguiente vista sugerida ──────────────────────────────────────── */
    const nivelActual = (typeof window.nivelActual !== 'undefined' && window.nivelActual) || 'universitario';
    const nextId = window.PB_DidacticSpec.suggestNextView(
      viewId, [...visited, viewId], nivelActual
    );
    const nextMeta = nextId && typeof VIEW_META !== 'undefined' ? VIEW_META[nextId] : null;

    /* ── Competencias LOMLOE (iconos) ─────────────────────────────────── */
    const COMP_ICONS = {
      CCL:   { emoji:'💬', full:'Competencia en Comunicación Lingüística' },
      STEM:  { emoji:'🔬', full:'Competencia Matemática, Ciencia y Tecnología' },
      CD:    { emoji:'💻', full:'Competencia Digital' },
      CPSAA: { emoji:'🧠', full:'Competencia Personal, Social y de Aprender a Aprender' },
      CC:    { emoji:'🌍', full:'Competencia Ciudadana' },
      CE:    { emoji:'⚡', full:'Competencia Emprendedora' },
      CCEC:  { emoji:'🎨', full:'Competencia en Conciencia y Expresión Culturales' }
    };

    /* ── Construir el DOM del panel ───────────────────────────────────── */
    const panel = document.createElement('div');
    panel.className = 'pb-dap';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'Panel de activación didáctica');

    /* Barra de color Bloom */
    const bloomBar = document.createElement('div');
    bloomBar.className = 'pb-dap-bloom-bar';
    bloomBar.style.background = bloom.bg;

    /* Fila de metadatos superiores */
    const metaRow = document.createElement('div');
    metaRow.className = 'pb-dap-meta-row';

    const bloomChip = _el('span', 'pb-dap-chip pb-dap-chip--bloom');
    bloomChip.style.background = bloom.bg;
    bloomChip.style.color      = bloom.text;
    bloomChip.setAttribute('title', 'Nivel de Bloom: ' + bloom.label);
    bloomChip.textContent = 'Bloom ' + spec.nivelBloom + ' · ' + bloom.label;

    const timeChip = _el('span', 'pb-dap-chip');
    timeChip.textContent = '⏱ ' + spec.tiempoEstimado + ' min';

    const odsChip = _el('span', 'pb-dap-chip');
    odsChip.textContent = spec.odsPrimario;

    const closeBtn = _el('button', 'pb-dap-close');
    closeBtn.setAttribute('aria-label', 'Cerrar panel de activación');
    closeBtn.setAttribute('type', 'button');
    closeBtn.textContent = '✕';

    metaRow.appendChild(bloomChip);
    metaRow.appendChild(timeChip);
    metaRow.appendChild(odsChip);
    metaRow.appendChild(closeBtn);

    /* Pregunta de activación */
    const question = _el('p', 'pb-dap-question');
    question.textContent = spec.preguntaActivacion;

    /* Grid inferior: prerequisitos + producto + siguiente */
    const grid = _el('div', 'pb-dap-grid');

    /* Columna A: prerequisitos */
    if (prereqItems.length > 0) {
      const prereqBlock = _el('div', 'pb-dap-block');
      const prereqTitle = _el('strong', 'pb-dap-block-title');
      prereqTitle.textContent = 'Antes de explorar esta vista';
      prereqBlock.appendChild(prereqTitle);

      prereqItems.forEach(({ id, label, done }) => {
        const item = _el('div', 'pb-dap-prereq-item' + (done ? ' pb-dap-prereq--done' : ''));
        const icon = _el('span', 'pb-dap-prereq-icon');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = done ? '✓' : '○';

        const itemLabel = _el('span', 'pb-dap-prereq-label');
        itemLabel.textContent = label;

        const goBtn = _el('button', 'pb-dap-prereq-go');
        goBtn.setAttribute('type', 'button');
        goBtn.setAttribute('aria-label', 'Ir a vista: ' + label);
        goBtn.textContent = done ? 'Revisitar' : 'Ir →';
        goBtn.dataset.targetView = id;

        item.appendChild(icon);
        item.appendChild(itemLabel);
        if (!done) item.appendChild(goBtn);
        prereqBlock.appendChild(item);
      });

      grid.appendChild(prereqBlock);
    }

    /* Columna B: producto esperado + criterio de éxito */
    const productBlock = _el('div', 'pb-dap-block');
    const productTitle = _el('strong', 'pb-dap-block-title');
    productTitle.textContent = 'Producto esperado';
    const productText = _el('p', 'pb-dap-block-text');
    productText.textContent = spec.productoEsperado;

    const criterioTitle = _el('strong', 'pb-dap-block-title');
    criterioTitle.textContent = 'Criterio de éxito';
    const criterioText = _el('p', 'pb-dap-block-text pb-dap-block-text--success');
    criterioText.textContent = spec.criterioExito;

    productBlock.appendChild(productTitle);
    productBlock.appendChild(productText);
    productBlock.appendChild(criterioTitle);
    productBlock.appendChild(criterioText);
    grid.appendChild(productBlock);

    /* Columna C: competencias LOMLOE + siguiente vista */
    const compBlock = _el('div', 'pb-dap-block');

    const compTitle = _el('strong', 'pb-dap-block-title');
    compTitle.textContent = 'Competencias LOMLOE';
    compBlock.appendChild(compTitle);

    const compRow = _el('div', 'pb-dap-comp-row');
    spec.competenciasLOMLOE.forEach(code => {
      const ci = COMP_ICONS[code] || { emoji:'📌', full: code };
      const chip = _el('span', 'pb-dap-comp-chip');
      chip.setAttribute('title', ci.full);
      chip.setAttribute('aria-label', ci.full);
      chip.textContent = ci.emoji + ' ' + code;
      compRow.appendChild(chip);
    });
    compBlock.appendChild(compRow);

    /* Siguiente vista sugerida */
    if (nextId && nextMeta) {
      const nextWrap = _el('div', 'pb-dap-next');
      const nextLabel = _el('span', 'pb-dap-next-label');
      nextLabel.textContent = 'Siguiente recomendado';
      const nextBtn = _el('button', 'pb-dap-next-btn');
      nextBtn.setAttribute('type', 'button');
      nextBtn.setAttribute('aria-label', 'Ir a vista recomendada: ' + nextMeta.title);
      nextBtn.dataset.targetView = nextId;
      nextBtn.textContent = '→ ' + nextMeta.title;
      nextWrap.appendChild(nextLabel);
      nextWrap.appendChild(nextBtn);
      compBlock.appendChild(nextWrap);
    }

    grid.appendChild(compBlock);

    /* Auto-cierre: barra de progreso visual */
    const progressBar = _el('div', 'pb-dap-progress');
    const progressFill = _el('div', 'pb-dap-progress-fill');
    progressFill.style.animationDuration = AUTO_CLOSE_MS + 'ms';
    progressBar.appendChild(progressFill);

    /* Ensamblar el panel */
    panel.appendChild(bloomBar);
    panel.appendChild(metaRow);
    panel.appendChild(question);
    panel.appendChild(grid);
    panel.appendChild(progressBar);

    /* ── Inserción en el DOM ────────────────────────────────────────── */
    const hero = section.querySelector('.view-hero');
    if (hero) {
      /* Insertar DESPUÉS del hero */
      hero.after(panel);
    } else {
      section.prepend(panel);
    }

    /* ── Eventos ────────────────────────────────────────────────────── */
    closeBtn.addEventListener('click', () => _dismissPanel(panel, viewId, 'manual'));

    panel.addEventListener('click', e => {
      const tgt = e.target.closest('[data-target-view]');
      if (!tgt) return;
      e.preventDefault();
      const targetView = tgt.dataset.targetView;
      if (!targetView) return;
      _dismissPanel(panel, viewId, 'navigate');
      try {
        if (window.PaleoBotV91FinalButtonActions && typeof window.PaleoBotV91FinalButtonActions.routeView === 'function') {
          window.PaleoBotV91FinalButtonActions.routeView(targetView);
          return;
        }
        if (typeof switchView === 'function') {
          const btn = typeof getViewButton === 'function' ? getViewButton(targetView) : null;
          switchView(targetView, btn);
        }
      } catch (navErr) {
        warn('Error al navegar:', navErr);
      }
    });

    /* Auto-cierre */
    const timer = setTimeout(() => _dismissPanel(panel, viewId, 'auto'), AUTO_CLOSE_MS);
    panel.dataset.timerId = String(timer);

    log('Panel mostrado para vista:', viewId);
  }

  /** Anima y elimina el panel */
  function _dismissPanel(panel, viewId, reason) {
    if (!panel || panel.dataset.dismissed) return;
    panel.dataset.dismissed = '1';
    clearTimeout(Number(panel.dataset.timerId));
    panel.classList?.add('pb-dap--exit');
    setTimeout(() => { if (panel.parentNode) panel.remove(); }, 400);
    log('Panel cerrado para', viewId, '— razón:', reason);
  }

  /* ── Utilidad: crear elemento con clase ──────────────────────────── */
  function _el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  /* ══════════════════════════════════════════════════════════════════════
     D. PUNTO DE ENTRADA: escucha paleobot:viewchange
     ══════════════════════════════════════════════════════════════════════ */

  function _onViewChange(viewId) {
    if (!viewId) return;

    /* Registrar visita siempre */
    _markVisited(viewId);

    /* Mostrar panel solo en primera visita de sesión */
    if (_hasBeenShown(viewId)) {
      log('Vista ya activada en esta sesión:', viewId);
      return;
    }

    const spec = window.PB_DidacticSpec.getViewSpec(viewId);
    if (!spec) {
      log('Sin spec para:', viewId);
      return;
    }

    /* Pequeño delay para que el hero esté en el DOM */
    setTimeout(() => {
      try {
        _buildPanel(viewId, spec);
        _markShown(viewId);
      } catch (err) {
        warn('Error al construir panel:', err);
      }
    }, 180);
  }

  /* ══════════════════════════════════════════════════════════════════════
     E. CSS DEL PANEL
     ══════════════════════════════════════════════════════════════════════ */

  function _injectStyles() {
    if (document.getElementById('pb-dap-style')) return;
    const s = document.createElement('style');
    s.id = 'pb-dap-style';
    s.textContent = `
/* ─── PaleoBot · DidacticActivationPanel ─────────────────────────────── */

/* Eliminar banner prototipo de Fase 1 si coexiste */
.pb-didactic-banner { display: none !important; }

.pb-dap {
  position: relative;
  margin: 0 0 20px;
  border-radius: 18px;
  border: 1px solid rgba(216,212,204,0.9);
  background: linear-gradient(135deg,#fafcfa 0%,#fffdf7 100%);
  box-shadow: 0 8px 24px rgba(28,43,58,0.07);
  overflow: hidden;
  animation: pbDapIn 0.34s cubic-bezier(.22,.68,0,1.15) both;
}
@keyframes pbDapIn {
  from { opacity:0; transform:translateY(-12px) scale(0.985); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.pb-dap--exit {
  animation: pbDapOut 0.38s ease forwards;
}
@keyframes pbDapOut {
  to { opacity:0; transform:translateY(-8px); max-height:0;
       margin:0; padding:0; border-width:0; }
}

/* Barra superior de color Bloom */
.pb-dap-bloom-bar {
  height: 4px;
  width: 100%;
}

/* Fila de metadatos */
.pb-dap-meta-row {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  padding: 12px 16px 0;
}
.pb-dap-chip {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(28,43,58,0.07);
  color: var(--text-sec, #4a5a6e);
  border: 1px solid rgba(28,43,58,0.1);
  white-space: nowrap;
}
.pb-dap-chip--bloom {
  border: none;
  color: #fff;
}

/* Botón de cierre */
.pb-dap-close {
  margin-left: auto;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(28,43,58,0.12);
  border-radius: 50%;
  background: transparent;
  color: var(--text-hint, #6b7a8d);
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.14s, color 0.14s, border-color 0.14s;
}
.pb-dap-close:hover { background:rgba(170,31,31,0.1); color:#aa1f1f; border-color:#aa1f1f; }
.pb-dap-close:focus-visible { outline:2px solid var(--accent,#0e7f65); outline-offset:2px; }

/* Pregunta de activación */
.pb-dap-question {
  margin: 10px 16px 12px;
  font-family: var(--font-serif, Georgia, serif);
  font-size: 1.04rem;
  font-weight: 600;
  color: var(--primary, #1c2b3a);
  line-height: 1.58;
}

/* Grid inferior de 3 columnas */
.pb-dap-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 1px;
  border-top: 1px solid rgba(216,212,204,0.7);
  background: rgba(216,212,204,0.5);
}

.pb-dap-block {
  padding: 12px 14px;
  background: rgba(250,249,247,0.97);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pb-dap-block-title {
  display: block;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-hint, #6b7a8d);
  margin-bottom: 2px;
}
.pb-dap-block-text {
  margin: 0;
  font-size: 0.83rem;
  color: var(--text-sec, #4a5a6e);
  line-height: 1.52;
}
.pb-dap-block-text--success {
  padding: 6px 9px;
  border-radius: 8px;
  background: rgba(14,127,101,0.07);
  border-left: 3px solid var(--accent, #0e7f65);
  color: var(--primary, #1c2b3a);
  font-size: 0.8rem;
}

/* Prerequisitos */
.pb-dap-prereq-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(216,212,204,0.5);
}
.pb-dap-prereq-item:last-child { border-bottom: none; }
.pb-dap-prereq-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(28,43,58,0.08);
  color: var(--text-hint, #6b7a8d);
}
.pb-dap-prereq--done .pb-dap-prereq-icon {
  background: rgba(14,127,101,0.14);
  color: var(--accent, #0e7f65);
}
.pb-dap-prereq-label {
  flex: 1;
  font-size: 0.82rem;
  color: var(--text-sec, #4a5a6e);
  line-height: 1.35;
}
.pb-dap-prereq--done .pb-dap-prereq-label {
  color: var(--text-hint, #6b7a8d);
  text-decoration: line-through;
  text-decoration-color: rgba(14,127,101,0.4);
}
.pb-dap-prereq-go {
  flex-shrink: 0;
  border: 1px solid rgba(28,43,58,0.14);
  border-radius: 999px;
  background: white;
  color: var(--primary, #1c2b3a);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  cursor: pointer;
  transition: background 0.14s, border-color 0.14s;
  font-family: var(--font-sans, sans-serif);
}
.pb-dap-prereq-go:hover { background: var(--accent-light, #e4f5ef); border-color: var(--accent, #0e7f65); color: var(--accent, #0e7f65); }
.pb-dap-prereq-go:focus-visible { outline:2px solid var(--accent,#0e7f65); outline-offset:2px; }

/* Competencias LOMLOE */
.pb-dap-comp-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 2px;
}
.pb-dap-comp-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(28,43,58,0.12);
  background: white;
  color: var(--text-sec, #4a5a6e);
  cursor: help;
  white-space: nowrap;
}

/* Siguiente vista sugerida */
.pb-dap-next {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(216,212,204,0.6);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.pb-dap-next-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-hint, #6b7a8d);
}
.pb-dap-next-btn {
  border: 1.5px solid rgba(14,127,101,0.3);
  border-radius: 999px;
  background: rgba(14,127,101,0.06);
  color: var(--accent, #0e7f65);
  font-size: 0.8rem;
  font-weight: 800;
  padding: 6px 13px;
  cursor: pointer;
  transition: background 0.14s, border-color 0.14s, transform 0.14s;
  font-family: var(--font-sans, sans-serif);
  text-align: left;
}
.pb-dap-next-btn:hover { background:rgba(14,127,101,0.12); border-color:var(--accent,#0e7f65); transform:translateX(3px); }
.pb-dap-next-btn:focus-visible { outline:2px solid var(--accent,#0e7f65); outline-offset:2px; }

/* Barra de progreso (auto-cierre) */
.pb-dap-progress {
  height: 3px;
  background: rgba(216,212,204,0.5);
  overflow: hidden;
}
.pb-dap-progress-fill {
  height: 100%;
  background: var(--accent, #0e7f65);
  border-radius: 999px;
  width: 100%;
  transform-origin: left;
  animation: pbDapProgress linear forwards;
  animation-play-state: running;
}
@keyframes pbDapProgress {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* ── Responsive ─────────────────────────────────────────────────────── */
@media (max-width: 820px) {
  .pb-dap-grid {
    grid-template-columns: 1fr;
  }
  .pb-dap-question { font-size: 0.96rem; }
}
@media (max-width: 480px) {
  .pb-dap { border-radius: 12px; }
  .pb-dap-question { font-size: 0.9rem; margin: 8px 12px 10px; }
  .pb-dap-block { padding: 10px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .pb-dap, .pb-dap--exit, .pb-dap-progress-fill {
    animation: none;
    transition: none;
  }
}
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════════════
     F. EXTENSIÓN DEL AUDIT REPORT
     ══════════════════════════════════════════════════════════════════════ */

  function _extendAudit() {
    if (typeof buildSelfAuditReport !== 'function') return;
    const _orig = buildSelfAuditReport;
    buildSelfAuditReport = function () {
      const report = _orig();
      try {
        const visited = [..._getVisited()];
        const shown   = [..._getShown()];
        const bloomSummary = window.PB_DidacticSpec.getSessionBloomSummary(visited);
        report.push({
          label: 'Panel didáctico (Fase 2 SDD)',
          status: 'ok',
          value: `Paneles mostrados: ${shown.length} · Vistas visitadas: ${visited.length} · Nivel Bloom máximo sesión: ${bloomSummary.maxBloom} (${bloomSummary.label})`
        });
      } catch (e) { /* silencioso */ }
      return report;
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     G. INICIALIZACIÓN
     ══════════════════════════════════════════════════════════════════════ */

  function _init() {
    _injectStyles();
    _extendAudit();

    /* Escuchar el evento central del router de vistas */
    document.addEventListener('paleobot:viewchange', e => {
      try {
        const viewId = e?.detail?.view;
        _onViewChange(viewId);
      } catch (err) {
        warn('Error en handler paleobot:viewchange:', err);
      }
    });

    /* Activación para la vista visible al cargar */
    setTimeout(() => {
      try {
        const active = document.querySelector('.view-section.active');
        if (active) {
          const id = active.id?.replace(/^view-/, '');
          if (id) _onViewChange(id);
        }
      } catch (err) {
        warn('Error en activación inicial:', err);
      }
    }, 700);

    log('Fase 2 SDD inicializada.');
  }

  /* Esperar a Fase 1 antes de arrancar */
  _waitForSpec(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _init);
    } else {
      _init();
    }
  });

})(); /* fin PaleoBotV65_Phase2 */
