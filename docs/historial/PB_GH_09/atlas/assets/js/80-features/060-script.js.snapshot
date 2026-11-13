// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot — SessionSynthesisPanel
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
          <span class="pb-ssm-kpi-value" style="color:${maxBloomColor}">
            ${bloomSummary.maxBloom}
          </span>
          <span class="pb-ssm-kpi-label">
            Nivel Bloom máximo<br>
            <strong style="color:${maxBloomColor}">${BLOOM_LABELS[bloomSummary.maxBloom] || ''}</strong>
          </span>
        </div>
        <div class="pb-ssm-kpi" role="listitem">
          <span class="pb-ssm-kpi-value">${competencias.length}</span>
          <span class="pb-ssm-kpi-label">Competencias LOMLOE<br>activadas</span>
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
                <div class="pb-ssm-family-header" style="border-color:${color}">
                  <span class="pb-ssm-family-name" style="color:${color}">${FAMILY_LABELS[fam] || fam}</span>
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
                              style="background:${bc}"
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

    /* ── Competencias LOMLOE activadas ────────────────────────────────── */
    const COMP_META = {
      CCL:   { emoji:'💬', full:'Comunicación Lingüística' },
      STEM:  { emoji:'🔬', full:'Matemática, Ciencia y Tecnología' },
      CD:    { emoji:'💻', full:'Competencia Digital' },
      CPSAA: { emoji:'🧠', full:'Personal, Social y de Aprender a Aprender' },
      CC:    { emoji:'🌍', full:'Ciudadana' },
      CE:    { emoji:'⚡', full:'Emprendedora' },
      CCEC:  { emoji:'🎨', full:'Conciencia y Expresión Culturales' }
    };
    const compHtml = `
      <section class="pb-ssm-section" aria-labelledby="ssm-comp-title">
        <h3 id="ssm-comp-title" class="pb-ssm-section-title">Competencias LOMLOE activadas</h3>
        <div class="pb-ssm-comp-grid" role="list">
          ${competencias.map(c => {
            const cm = COMP_META[c] || { emoji:'📌', full: c };
            return `<div class="pb-ssm-comp-item" role="listitem"
                         title="${_esc(cm.full)}">
              <span class="pb-ssm-comp-emoji" aria-hidden="true">${cm.emoji}</span>
              <span class="pb-ssm-comp-code">${_esc(c)}</span>
              <span class="pb-ssm-comp-full">${_esc(cm.full)}</span>
            </div>`;
          }).join('')}
        </div>
      </section>`;

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
                <span style="background:${BLOOM_COLORS[nextSpec.nivelBloom]||'#1c2b3a'}">
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
    <span class="pb-ssm-fab-badge" id="pb-ssm-fab-badge" aria-hidden="true"
          style="display:none">0</span>`;

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
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
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
    const s = document.createElement('style');
    s.id = 'pb-ssm-style';
    s.textContent = `
/* ─── PaleoBot · SessionSynthesisModal ───────────────────────────────── */

/* FAB */
.pb-ssm-fab {
  background: #2c4e6e;
  position: relative;
}
.pb-ssm-fab:hover { background: #1c2b3a; }
.pb-ssm-fab-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--accent, #0e7f65);
  color: white;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 900;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--bg, #f2f0eb);
  pointer-events: none;
}

/* Modal container */
.pb-ssm-content {
  max-width: 940px !important;
  max-height: 88vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* Header del modal */
.pb-ssm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(216,212,204,0.8);
}
.pb-ssm-header h2 {
  font-family: var(--font-serif, Georgia, serif);
  font-size: 1.5rem;
  color: var(--primary, #1c2b3a);
  margin: 0 0 4px;
}
.pb-ssm-subtitle {
  margin: 0;
  color: var(--text-sec, #4a5a6e);
  font-size: 0.88rem;
}
.pb-ssm-export-btn {
  flex-shrink: 0;
  border: 1.5px solid rgba(28,43,58,0.18);
  border-radius: 999px;
  background: white;
  color: var(--primary, #1c2b3a);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.14s, border-color 0.14s;
  font-family: var(--font-sans, sans-serif);
  white-space: nowrap;
}
.pb-ssm-export-btn:hover {
  background: var(--accent-light, #e4f5ef);
  border-color: var(--accent, #0e7f65);
  color: var(--accent, #0e7f65);
}
.pb-ssm-export-btn:focus-visible {
  outline: 2px solid var(--accent, #0e7f65);
  outline-offset: 2px;
}

/* KPI strip */
.pb-ssm-kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 10px;
  margin-bottom: 22px;
}
.pb-ssm-kpi {
  background: white;
  border: 1px solid rgba(216,212,204,0.9);
  border-radius: 14px;
  padding: 14px 12px;
  text-align: center;
}
.pb-ssm-kpi-value {
  display: block;
  font-family: var(--font-serif, Georgia, serif);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--primary, #1c2b3a);
}
.pb-ssm-kpi-label {
  display: block;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-hint, #6b7a8d);
  margin-top: 6px;
  line-height: 1.4;
}

/* Secciones */
.pb-ssm-section {
  margin-bottom: 20px;
  border: 1px solid rgba(216,212,204,0.9);
  border-radius: 18px;
  background: white;
  overflow: hidden;
}
.pb-ssm-section--accent {
  background: linear-gradient(135deg,#fafcfa,#fffdf5);
  border-color: rgba(14,127,101,0.25);
}
.pb-ssm-section--next {
  background: linear-gradient(135deg,#f5f8ff,#fafcff);
  border-color: rgba(26,79,160,0.2);
}
.pb-ssm-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-hint, #6b7a8d);
  padding: 12px 16px;
  margin: 0;
  border-bottom: 1px solid rgba(216,212,204,0.7);
  background: rgba(242,238,230,0.5);
}
.pb-ssm-section-badge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(14,127,101,0.12);
  color: var(--accent, #0e7f65);
  border: 1px solid rgba(14,127,101,0.2);
  letter-spacing: 0.03em;
}

/* Mapa de familias */
.pb-ssm-family-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 1px;
  background: rgba(216,212,204,0.5);
}
.pb-ssm-family-col {
  background: white;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 80px;
}
.pb-ssm-family-col--empty {
  background: rgba(242,238,230,0.3);
}
.pb-ssm-family-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
  margin-bottom: 2px;
}
.pb-ssm-family-name {
  font-family: var(--font-mono, monospace);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pb-ssm-family-count {
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(28,43,58,0.07);
  border-radius: 999px;
  padding: 1px 7px;
  color: var(--text-hint, #6b7a8d);
}
.pb-ssm-family-none {
  color: var(--text-hint, #6b7a8d);
  font-size: 0.75rem;
  margin: 0;
  padding-top: 4px;
  font-style: italic;
}
.pb-ssm-view-chip {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(216,212,204,0.8);
  background: rgba(250,249,247,0.9);
}
.pb-ssm-bloom-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 3px;
}
.pb-ssm-view-chip-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pb-ssm-view-chip-body strong {
  font-size: 0.8rem;
  color: var(--primary, #1c2b3a);
  line-height: 1.3;
}
.pb-ssm-view-obj {
  font-size: 0.7rem;
  color: var(--text-hint, #6b7a8d);
  line-height: 1.35;
}

/* Competencias */
.pb-ssm-comp-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
}
.pb-ssm-comp-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(216,212,204,0.9);
  background: white;
}
.pb-ssm-comp-emoji { font-size: 1.1rem; line-height: 1; }
.pb-ssm-comp-code {
  font-family: var(--font-mono, monospace);
  font-size: 0.76rem;
  font-weight: 900;
  color: var(--primary, #1c2b3a);
  letter-spacing: 0.04em;
}
.pb-ssm-comp-full {
  font-size: 0.76rem;
  color: var(--text-sec, #4a5a6e);
}

/* Pregunta de síntesis */
.pb-ssm-synthesis-q {
  margin: 0;
  padding: 14px 18px;
  font-family: var(--font-serif, Georgia, serif);
  font-size: 1.06rem;
  font-weight: 600;
  color: var(--primary, #1c2b3a);
  line-height: 1.62;
  border-left: 4px solid var(--accent, #0e7f65);
  background: rgba(14,127,101,0.04);
}
.pb-ssm-synthesis-hint {
  margin: 10px 16px 14px;
  font-size: 0.82rem;
  color: var(--text-hint, #6b7a8d);
  font-style: italic;
}

/* Siguiente vista */
.pb-ssm-next-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 16px;
  flex-wrap: wrap;
}
.pb-ssm-next-info { flex: 1; }
.pb-ssm-next-info strong {
  display: block;
  font-family: var(--font-serif, Georgia, serif);
  font-size: 1.08rem;
  color: var(--primary, #1c2b3a);
  margin-bottom: 5px;
}
.pb-ssm-next-info p {
  margin: 0 0 8px;
  font-size: 0.86rem;
  color: var(--text-sec, #4a5a6e);
  line-height: 1.55;
}
.pb-ssm-next-meta {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}
.pb-ssm-next-meta span {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  color: white;
}
.pb-ssm-next-meta span:last-child {
  background: rgba(28,43,58,0.1) !important;
  color: var(--text-sec, #4a5a6e);
}
.pb-ssm-goto-btn {
  flex-shrink: 0;
  border: 2px solid rgba(26,79,160,0.3);
  border-radius: 999px;
  background: rgba(26,79,160,0.07);
  color: #1a4fa0;
  font-size: 0.86rem;
  font-weight: 800;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.14s, border-color 0.14s, transform 0.14s;
  font-family: var(--font-sans, sans-serif);
  white-space: nowrap;
}
.pb-ssm-goto-btn:hover {
  background: rgba(26,79,160,0.14);
  border-color: #1a4fa0;
  transform: translateX(3px);
}
.pb-ssm-goto-btn:focus-visible {
  outline: 2px solid #1a4fa0;
  outline-offset: 2px;
}

/* Estado vacío */
.pb-ssm-empty {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-hint, #6b7a8d);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* ── Responsive ─────────────────────────────────────────────────────── */
@media (max-width: 760px) {
  .pb-ssm-kpi-strip { grid-template-columns: repeat(2,1fr); }
  .pb-ssm-family-grid { grid-template-columns: repeat(2,1fr); }
  .pb-ssm-content { max-height: 92vh; }
}
@media (max-width: 480px) {
  .pb-ssm-kpi-strip { grid-template-columns: repeat(2,1fr); }
  .pb-ssm-family-grid { grid-template-columns: 1fr; }
  .pb-ssm-header { flex-direction: column; }
  .pb-ssm-export-btn { width: 100%; text-align: center; }
}
@media (prefers-reduced-motion: reduce) {
  .pb-ssm-fab, .pb-ssm-goto-btn { transition: none; }
}
    `;
    document.head.appendChild(s);
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
            ? `Modal activo · ${visited.length} vistas · Bloom máx. ${bloom.maxBloom} · ${comps.length} competencias LOMLOE`
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
