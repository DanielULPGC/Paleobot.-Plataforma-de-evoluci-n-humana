// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot v65 — Fase 2 SDD: DidacticActivationPanel
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
    window.PaleoBotDynamicStyle.set(bloomBar, `background:${bloom.bg}`, 'bloom-bar');

    /* Fila de metadatos superiores */
    const metaRow = document.createElement('div');
    metaRow.className = 'pb-dap-meta-row';

    const bloomChip = _el('span', 'pb-dap-chip pb-dap-chip--bloom');
    window.PaleoBotDynamicStyle.set(
      bloomChip,
      `background:${bloom.bg};color:${bloom.text}`,
      'bloom-chip'
    );
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

    /* Columna C (R93): solo siguiente vista; se retiran las competencias clave LOMLOE,
       propias de la enseñanza no universitaria. */
    const compBlock = _el('div', 'pb-dap-block');

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
    window.PaleoBotDynamicStyle.set(progressFill, `--pb-r78-dap-auto-close:${AUTO_CLOSE_MS}ms`, 'dap-auto-close-duration');
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
    /* R67: CSS externalizado a assets/css/00-core/042-paleobot-r67-externalized-runtime-styles.css (pb-dap-style). */
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
