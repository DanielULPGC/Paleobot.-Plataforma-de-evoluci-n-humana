// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot v65 — Fase 3 SDD: SessionSynthesisPanel
   ──────────────────────────────────────────────────────────────────────────
   Panel modal de síntesis de sesión, orientado pedagógicamente.
   Accesible desde:
     1. Un FAB dedicado (🧩) añadido al grupo de herramientas existente
     2. La exportación de progreso (enriquece el txt existente)

   Qué muestra:
     · Mapa de vistas exploradas agrupadas por familia, con nivel Bloom
     · Nivel Bloom máximo alcanzado en la sesión + etiqueta
     · Objetivos cognitivos activados (del VIEW_DIDACTIC_SPEC)
     · Pregunta de síntesis generada a partir de las vistas visitadas
     · Siguiente vista sugerida para completar el recorrido
     · Competencias LOMLOE activadas (unión de todas las vistas)
     · Exportación del resumen como .txt (Moodle-ready)

   Integración no destructiva:
     · Modal nuevo (id="sessionSynthesisModal") con patrón idéntico a
       studentGuideModal (aria-modal, focus trap via toggleModal)
     · FAB añadido al .fab-group existente
     · Extiende exportQuizProgress() con datos de síntesis SDD
     · Escucha 'paleobot:viewchange' para actualizar badge del FAB

   Dependencias:
     · window.PB_DidacticSpec   (Fase 1)
     · pb_dap_visited            (sessionStorage, escrito por Fase 2)
     · VIEW_META, toggleModal(), escapeHtmlText(), switchView()
     · QuizProgress (opcional — se degrada elegantemente sin él)
   ═══════════════════════════════════════════════════════════════════════════ */
(function PaleoBotV65_Phase3() {
  'use strict';

  const DEBUG = false;
  const log  = DEBUG ? console.log.bind(console,  '[PB65-P3]') : () => {};
  const warn = DEBUG ? console.warn.bind(console, '[PB65-P3]') : () => {};

  /* ── Guard: requiere Fase 1 ──────────────────────────────────────────── */
  function _waitForSpec(cb, tries) {
    if (window.PB_DidacticSpec) { cb(); return; }
    if ((tries || 0) > 40) { warn('PB_DidacticSpec no disponible'); return; }
    setTimeout(() => _waitForSpec(cb, (tries || 0) + 1), 100);
  }

  /* ══════════════════════════════════════════════════════════════════════
     A. CONSTANTES
     ══════════════════════════════════════════════════════════════════════ */

  const MODAL_ID     = 'sessionSynthesisModal';
  const SK_VISITED   = 'pb_dap_visited';   // escrito por Fase 2
  const BLOOM_LABELS = {
    1:'Recordar', 2:'Comprender', 3:'Aplicar',
    4:'Analizar', 5:'Evaluar', 6:'Crear'
  };
  const BLOOM_COLORS = {
    1:'#0e7f65', 2:'#0e7f65', 3:'#1a4fa0',
    4:'#c07800', 5:'#aa1f1f', 6:'#6b3faa'
  };
  const FAMILY_LABELS = {
    explorar:'Explorar', interpretar:'Interpretar',
    investigar:'Investigar', aprender:'Aprender'
  };
  const FAMILY_COLORS = {
    explorar:'#0e7f65', interpretar:'#1a4fa0',
    investigar:'#c07800', aprender:'#aa1f1f'
  };

  /* ══════════════════════════════════════════════════════════════════════
     B. LECTURA DE SESIÓN
     ══════════════════════════════════════════════════════════════════════ */

  /** Lee las vistas visitadas escritas por Fase 2 */
  function _getVisited() {
    try {
      const raw = sessionStorage.getItem(SK_VISITED);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  }

  /** Agrupa vistas visitadas por familia NAV */
  function _groupByFamily(visitedIds) {
    const groups = {};
    visitedIds.forEach(id => {
      const meta  = (typeof VIEW_META !== 'undefined') ? VIEW_META[id] : null;
      const spec  = window.PB_DidacticSpec.getViewSpec(id);
      const fam   = meta?.family || 'explorar';
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push({ id, meta, spec });
    });
    return groups;
  }

  /** Recopila todas las competencias LOMLOE activadas en la sesión */
  function _sessionCompetencias(visitedIds) {
    const set = new Set();
    visitedIds.forEach(id => {
      const spec = window.PB_DidacticSpec.getViewSpec(id);
      if (spec) spec.competenciasLOMLOE.forEach(c => set.add(c));
    });
    return [...set];
  }

  /**
   * Genera la pregunta de síntesis adaptada a las vistas visitadas.
   * Lógica: prioriza la vista de mayor nivel de Bloom;
   * si hay debate socrático, lo ancla; si hay clima, añade perspectiva;
   * fallback a pregunta genérica.
   */
  function _buildSynthesisQuestion(visitedIds) {
    const visited = [...visitedIds];
    // Pregunta por conjunto de vistas de mayor nivel
    if (visited.includes('constructor')) {
      return '¿Qué decisiones de agrupamiento de tu árbol hipotético cambiarías ahora que has explorado más vistas? ¿Qué evidencia haría falta para resolver las incertidumbres que identificaste?';
    }
    if (visited.includes('socratico') && visited.includes('debates')) {
      return '¿Ha cambiado tu argumento inicial tras explorar las vistas de debate y razonamiento socrático? Escribe tu posición final en formato AERC (afirmación, evidencia, razonamiento, cautela).';
    }
    if (visited.includes('genomica') && visited.includes('introgresion')) {
      return '¿Cómo combinarías la evidencia morfológica y la genómica para argumentar si neandertales y denisovanos eran "especies distintas" o "poblaciones diferenciadas"? ¿Qué criterio de especie usarías?';
    }
    if (visited.includes('clima') && visited.includes('coexistencias')) {
      return '¿Qué relación encuentras entre los cambios climáticos que exploraste y los patrones de coexistencia hominina? ¿Es esa relación una correlación, una causalidad, o algo intermedio?';
    }
    if (visited.includes('tafonomia') && visited.includes('estratigrafia')) {
      return '¿Qué inferencias de las que hiciste hoy podrían estar sesgadas por el registro fósil? Nombra dos y explica qué tipo de evidencia adicional las haría más robustas.';
    }
    if (visited.includes('phylo') || visited.includes('tree')) {
      return '¿Qué diferencia hay entre el árbol filogenético que ves en el atlas y lo que "realmente ocurrió" en la evolución hominina? ¿Qué parte de esa diferencia se debe a los datos y cuál al método?';
    }
    if (visited.includes('africa') || visited.includes('yacimientos')) {
      return '¿Qué sesgo geográfico o de muestreo podrías haber incorporado al explorar solo algunos yacimientos o regiones? ¿Cómo afecta ese sesgo a las conclusiones que extraíste?';
    }
    // Fallback genérico
    return '¿Qué pregunta científica no has podido responder con las vistas que exploraste hoy? ¿Qué evidencia o herramienta del atlas te haría falta para responderla?';
  }

  /* ══════════════════════════════════════════════════════════════════════
     C. CONSTRUCCIÓN DEL MODAL
     ══════════════════════════════════════════════════════════════════════ */

  /** Inyecta el modal en el DOM si no existe aún */
  function _ensureModal() {
    if (document.getElementById(MODAL_ID)) return;
    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'ssm-title');
    modal.innerHTML = `
      <div class="modal-content pb-ssm-content" role="document">
        <button type="button" class="close-modal" data-modal-toggle="${MODAL_ID}"
          aria-label="Cerrar síntesis de sesión">✕</button>
        <div class="pb-ssm-header">
          <div class="pb-ssm-header-text">
            <h2 id="ssm-title">Síntesis de sesión</h2>
            <p class="pb-ssm-subtitle">Resumen pedagógico de tu exploración en PaleoBot</p>
          </div>
          <button type="button" class="pb-ssm-export-btn" id="ssmExportBtn"
            aria-label="Exportar síntesis de sesión como archivo de texto">
            ⬇ Exportar síntesis (.txt)
          </button>
        </div>
        <div id="pb-ssm-body">
          <!-- Contenido generado dinámicamente en cada apertura -->
          <p class="pb-ssm-empty">Aún no hay vistas exploradas en esta sesión.<br>
            <small>Navega por el atlas y vuelve aquí para ver tu resumen.</small>
          </p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    log('Modal de síntesis creado.');
  }

  /** Renderiza el contenido del modal con los datos de sesión actuales */
  function _renderSynthesis() {
    const body = document.getElementById('pb-ssm-body');
    if (!body) return;

    const visited    = _getVisited();
    const visitedArr = [...visited];

    if (visitedArr.length === 0) {
      body.innerHTML = `<p class="pb-ssm-empty">
        Aún no has explorado ninguna vista en esta sesión.<br>
        <small>Navega por el atlas y vuelve aquí para ver tu resumen.</small>
      </p>`;
      return;
    }

    const bloomSummary = window.PB_DidacticSpec.getSessionBloomSummary(visitedArr);
    const groups       = _groupByFamily(visitedArr);
    const competencias = _sessionCompetencias(visitedArr);
    const synthesis    = _buildSynthesisQuestion(visited);
    const nivelActual  = (typeof window.nivelActual !== 'undefined' && window.nivelActual) || 'universitario';
    const nextId       = window.PB_DidacticSpec.suggestNextView(
      visitedArr[visitedArr.length - 1] || 'timeline', visitedArr, nivelActual
    );
    const nextMeta     = nextId && typeof VIEW_META !== 'undefined' ? VIEW_META[nextId] : null;
    const nextSpec     = nextId ? window.PB_DidacticSpec.getViewSpec(nextId) : null;

    /* ── KPI strip ───────────────────────────────────────────────────── */
    const maxBloomColor = BLOOM_COLORS[bloomSummary.maxBloom] || '#1c2b3a';
    const kpiHtml = `
      <div class="pb-ssm-kpi-strip" role="list" aria-label="Métricas de sesión">
        <div class="pb-ssm-kpi" role="listitem">
          <span class="pb-ssm-kpi-value">${visitedArr.length}</span>
          <span class="pb-ssm-kpi-label">Vistas exploradas</span>
        </div>
        <div class="pb-ssm-kpi" role="listitem">
          <span class="pb-ssm-kpi-value" data-pb-r71-style="color:${maxBloomColor}">
            ${bloomSummary.maxBloom}
          </span>
          <span class="pb-ssm-kpi-label">
            Nivel Bloom máximo<br>
            <strong data-pb-r71-style="color:${maxBloomColor}">${BLOOM_LABELS[bloomSummary.maxBloom] || ''}</strong>
          </span>
        </div>
        <div class="pb-ssm-kpi" role="listitem">
          <span class="pb-ssm-kpi-value">${Object.keys(groups).length}</span>
          <span class="pb-ssm-kpi-label">Familias de vistas<br>visitadas</span>
        </div>
      </div>`;

    /* ── Mapa de vistas por familia ───────────────────────────────────── */
    const familyOrder = ['explorar', 'interpretar', 'investigar', 'aprender'];
    const mapHtml = `
      <section class="pb-ssm-section" aria-labelledby="ssm-map-title">
        <h3 id="ssm-map-title" class="pb-ssm-section-title">Recorrido por vistas</h3>
        <div class="pb-ssm-family-grid">
          ${familyOrder.map(fam => {
            const items = groups[fam] || [];
            const color = FAMILY_COLORS[fam] || '#1c2b3a';
            return `
              <div class="pb-ssm-family-col${items.length ? '' : ' pb-ssm-family-col--empty'}">
                <div class="pb-ssm-family-header" data-pb-r71-style="border-color:${color}">
                  <span class="pb-ssm-family-name" data-pb-r71-style="color:${color}">${FAMILY_LABELS[fam] || fam}</span>
                  <span class="pb-ssm-family-count">${items.length}</span>
                </div>
                ${items.length === 0 ? '<p class="pb-ssm-family-none">No explorada</p>' :
                  items.map(({ id, meta, spec }) => {
                    const bloom = spec?.nivelBloom || 1;
                    const bc    = BLOOM_COLORS[bloom] || color;
                    const title = meta?.title || id;
                    const obj   = spec?.objetivoCognitivo || '';
                    return `
                      <div class="pb-ssm-view-chip" role="article"
                           aria-label="Vista ${title}, nivel Bloom ${bloom}">
                        <span class="pb-ssm-bloom-dot"
                              data-pb-r71-style="background:${bc}"
                              title="Bloom ${bloom}: ${BLOOM_LABELS[bloom] || ''}"
                              aria-label="Bloom ${bloom}"></span>
                        <div class="pb-ssm-view-chip-body">
                          <strong>${_esc(title)}</strong>
                          ${obj ? `<span class="pb-ssm-view-obj">${_esc(obj)}</span>` : ''}
                        </div>
                      </div>`;
                  }).join('')
                }
              </div>`;
          }).join('')}
        </div>
      </section>`;

    /* R93: sección de competencias clave LOMLOE retirada (atlas universitario). */
    const compHtml = '';

    /* ── Pregunta de síntesis ─────────────────────────────────────────── */
    const synthHtml = `
      <section class="pb-ssm-section pb-ssm-section--accent"
               aria-labelledby="ssm-synth-title">
        <h3 id="ssm-synth-title" class="pb-ssm-section-title">
          Pregunta de síntesis
          <span class="pb-ssm-section-badge">Para reflexionar antes de cerrar</span>
        </h3>
        <blockquote class="pb-ssm-synthesis-q">${_esc(synthesis)}</blockquote>
        <p class="pb-ssm-synthesis-hint">
          Escribe tu respuesta en tu cuaderno o en el campo de notas del atlas
          antes de exportar este resumen.
        </p>
      </section>`;

    /* ── Siguiente vista sugerida ─────────────────────────────────────── */
    const nextHtml = nextId && nextMeta ? `
      <section class="pb-ssm-section pb-ssm-section--next"
               aria-labelledby="ssm-next-title">
        <h3 id="ssm-next-title" class="pb-ssm-section-title">Siguiente paso sugerido</h3>
        <div class="pb-ssm-next-card">
          <div class="pb-ssm-next-info">
            <strong>${_esc(nextMeta.title || nextId)}</strong>
            ${nextSpec ? `<p>${_esc(nextSpec.preguntaActivacion)}</p>` : ''}
            ${nextSpec ? `
              <div class="pb-ssm-next-meta">
                <span data-pb-r71-style="background:${BLOOM_COLORS[nextSpec.nivelBloom]||'#1c2b3a'}">
                  Bloom ${nextSpec.nivelBloom} · ${BLOOM_LABELS[nextSpec.nivelBloom]||''}
                </span>
                <span>⏱ ${nextSpec.tiempoEstimado} min</span>
              </div>` : ''}
          </div>
          <button type="button" class="pb-ssm-goto-btn"
                  data-target-view="${_esc(nextId)}"
                  data-modal-close="${MODAL_ID}"
                  aria-label="Ir a vista: ${_esc(nextMeta.title || nextId)}">
            Explorar →
          </button>
        </div>
      </section>` : '';

    /* ── Ensamblar ────────────────────────────────────────────────────── */
    body.innerHTML = kpiHtml + mapHtml + compHtml + synthHtml + nextHtml;
  }

  /* ── Utilidad: escape HTML seguro ─────────────────────────────────── */
  function _esc(str) {
    if (typeof escapeHtmlText === 'function') return escapeHtmlText(str || '');
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ══════════════════════════════════════════════════════════════════════
     D. FAB DEDICADO
     ══════════════════════════════════════════════════════════════════════ */

  function _injectFab() {
    const fabGroup = document.querySelector('.fab-group');
    if (!fabGroup || document.getElementById('pb-ssm-fab')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'fab-wrapper';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id   = 'pb-ssm-fab';
    btn.className = 'fab pb-ssm-fab';
    btn.setAttribute('aria-label', 'Abrir síntesis de sesión');
    btn.setAttribute('data-action', 'openSessionSynthesis');
    btn.innerHTML = `<span class="ico" aria-hidden="true">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
           stroke-linejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    </span>
    <span class="pb-ssm-fab-badge pb-r70-gen-6aa34d7432" id="pb-ssm-fab-badge" aria-hidden="true"
          >0</span>`;

    const label = document.createElement('span');
    label.className = 'fab-label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = 'Mi sesión';

    wrapper.appendChild(btn);
    wrapper.appendChild(label);
    // Insertar antes del primer FAB (posición más visible)
    fabGroup.insertBefore(wrapper, fabGroup.firstChild);
    log('FAB de síntesis inyectado.');
  }

  /** Actualiza el badge numérico del FAB con el contador de vistas visitadas */
  function _updateFabBadge() {
    const badge = document.getElementById('pb-ssm-fab-badge');
    if (!badge) return;
    const count = _getVisited().size;
    if (count > 0) {
      badge.textContent = String(count);
      window.PaleoBotStyleState.display(badge, 'flex');
    } else {
      window.PaleoBotStyleState.display(badge, 'none');
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     E. EXPORTACIÓN ENRIQUECIDA
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * Genera y descarga un archivo .txt con el resumen SDD de la sesión.
   * Complementa (no reemplaza) el exportQuizProgress() existente.
   */
  function _exportSessionSynthesis() {
    try {
      const visited    = [..._getVisited()];
      const bloomSum   = window.PB_DidacticSpec.getSessionBloomSummary(visited);
      const groups     = _groupByFamily(new Set(visited));
      const competencias = _sessionCompetencias(new Set(visited));
      const synthesis  = _buildSynthesisQuestion(new Set(visited));

      const lines = [
        'PALEOBOT — SÍNTESIS DIDÁCTICA DE SESIÓN (Fase 3 SDD)',
        'Fecha: ' + new Date().toLocaleString('es-ES'),
        '─'.repeat(52),
        '',
        'MÉTRICAS DE SESIÓN',
        '  Vistas exploradas:        ' + visited.length,
        '  Nivel Bloom máximo:       ' + bloomSum.maxBloom + ' (' + (BLOOM_LABELS[bloomSum.maxBloom] || '') + ')',
        '  Familias visitadas:       ' + Object.keys(groups).join(', '),
        '  Competencias activadas:   ' + competencias.join(', '),
        '',
        'RECORRIDO POR VISTAS',
      ];

      const famOrder = ['explorar','interpretar','investigar','aprender'];
      famOrder.forEach(fam => {
        const items = groups[fam] || [];
        if (items.length === 0) return;
        lines.push('  [' + (FAMILY_LABELS[fam] || fam).toUpperCase() + ']');
        items.forEach(({ id, meta, spec }) => {
          const title = meta?.title || id;
          const bloom = spec?.nivelBloom || '?';
          lines.push('    · ' + title + ' (Bloom ' + bloom + ')');
          if (spec?.objetivoCognitivo) {
            lines.push('      Objetivo: ' + spec.objetivoCognitivo);
          }
        });
      });

      lines.push('', '─'.repeat(52));
      lines.push('PREGUNTA DE SÍNTESIS');
      lines.push('  ' + synthesis);
      lines.push('');
      lines.push('MI RESPUESTA (completar antes de entregar):');
      lines.push('  ');
      lines.push('');
      lines.push('─'.repeat(52));

      // Integrar datos de QuizProgress si están disponibles
      if (typeof QuizProgress !== 'undefined') {
        try {
          const st = QuizProgress.getStats();
          lines.push('AUTOEVALUACIÓN (banco de preguntas)');
          lines.push('  Total respondidas: ' + st.total);
          if (st.total > 0) {
            lines.push('  Correctas:         ' + st.ok + ' (' + st.pct + '%)');
            lines.push('  Incorrectas:       ' + st.fail);
          }
          lines.push('');
        } catch (_) { /* opcional, no crítico */ }
      }

      lines.push('(Este archivo puede entregarse como evidencia de trabajo.)');

      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = 'paleobot-sintesis-' + new Date().toISOString().slice(0, 10) + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
      log('Exportación de síntesis completada.');
    } catch (err) {
      warn('Error al exportar síntesis:', err);
      alert('No se pudo exportar el resumen. Por favor, inténtalo de nuevo.');
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     F. CSS
     ══════════════════════════════════════════════════════════════════════ */

  function _injectStyles() {
    if (document.getElementById('pb-ssm-style')) return;
    /* R67: CSS externalizado a assets/css/00-core/042-paleobot-r67-externalized-runtime-styles.css (pb-ssm-style). */
  }

  /* ══════════════════════════════════════════════════════════════════════
     G. MANEJADOR DE EVENTOS DEL MODAL
     ══════════════════════════════════════════════════════════════════════ */

  function _attachModalEvents() {
    document.addEventListener('click', e => {
      try {
        /* FAB o acción openSessionSynthesis */
        const fabBtn = e.target.closest('[data-action="openSessionSynthesis"]');
        if (fabBtn) {
          _renderSynthesis();
          if (typeof toggleModal === 'function') toggleModal(MODAL_ID);
          return;
        }
        /* Botón exportar dentro del modal */
        const exportBtn = e.target.closest('#ssmExportBtn');
        if (exportBtn) { _exportSessionSynthesis(); return; }

        /* Botón "Explorar →" (goto) */
        const gotoBtn = e.target.closest('.pb-ssm-goto-btn[data-target-view]');
        if (gotoBtn) {
          e.preventDefault();
          const targetView = gotoBtn.dataset.targetView;
          if (typeof toggleModal === 'function') toggleModal(MODAL_ID);
          setTimeout(() => {
            try {
              if (typeof switchView === 'function') {
                const btn = typeof getViewButton === 'function'
                  ? getViewButton(targetView) : null;
                switchView(targetView, btn);
              }
            } catch (navErr) { warn('Error al navegar:', navErr); }
          }, 320);
          return;
        }
      } catch (err) {
        warn('Error en manejador del modal:', err);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     H. EXTENSIÓN DEL AUDIT REPORT
     ══════════════════════════════════════════════════════════════════════ */

  function _extendAudit() {
    if (typeof buildSelfAuditReport !== 'function') return;
    const _orig = buildSelfAuditReport;
    buildSelfAuditReport = function () {
      const report = _orig();
      try {
        const visited = [..._getVisited()];
        const bloom   = window.PB_DidacticSpec.getSessionBloomSummary(visited);
        const comps   = _sessionCompetencias(new Set(visited));
        report.push({
          label: 'Síntesis de sesión (Fase 3 SDD)',
          status: document.getElementById(MODAL_ID) ? 'ok' : 'warn',
          value: visited.length
            ? `Modal activo · ${visited.length} vistas · Bloom máx. ${bloom.maxBloom}`
            : 'Modal activo · sin vistas exploradas aún en esta sesión'
        });
      } catch (_) { /* silencioso */ }
      return report;
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     I. INICIALIZACIÓN
     ══════════════════════════════════════════════════════════════════════ */

  function _init() {
    _injectStyles();
    _ensureModal();
    _injectFab();
    _attachModalEvents();
    _extendAudit();

    /* Actualizar badge cuando cambie la vista */
    document.addEventListener('paleobot:viewchange', () => {
      setTimeout(_updateFabBadge, 200);
    });

    /* Badge inicial */
    _updateFabBadge();
    log('Fase 3 SDD inicializada. Modal ID:', MODAL_ID);
  }

  _waitForSpec(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _init);
    } else {
      _init();
    }
  });


  /* ── Registro de openSessionSynthesis en el router global de acciones ── */
  (function _registerSessionSynthesisAction() {
    /* Función pública que abre el modal de síntesis */
    function openSessionSynthesis() {
      try {
        if (typeof _renderSynthesis === 'function') _renderSynthesis();
      } catch(_) {}
      if (typeof toggleModal === 'function') toggleModal('sessionSynthesisModal');
    }

    /* Registrar en window para que runFloatingPanelControl lo encuentre */
    window.openSessionSynthesis = openSessionSynthesis;

    /* Extender getActionContractMap con el patrón estándar del proyecto */
    function _extend() {
      if (typeof getActionContractMap !== 'function') return;
      const _orig = getActionContractMap;
      window.getActionContractMap = function() {
        const map = _orig();
        map.openSessionSynthesis = openSessionSynthesis;
        return map;
      };
    }

    /* PaleoBotV55Router si existe */
    function _extendRouter() {
      if (!window.PaleoBotV55Router || !window.PaleoBotV55Router.runAction) return;
      const _origRun = window.PaleoBotV55Router.runAction;
      window.PaleoBotV55Router.runAction = function(action) {
        if (action === 'openSessionSynthesis') { openSessionSynthesis(); return true; }
        return _origRun.apply(this, arguments);
      };
    }

    /* Ejecutar inmediatamente y también tras DOMContentLoaded por si el router
       aún no está disponible en el momento de la evaluación del script */
    _extend();
    _extendRouter();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { _extend(); _extendRouter(); });
    }
  })();

})(); /* fin PaleoBotV65_Phase3 */
