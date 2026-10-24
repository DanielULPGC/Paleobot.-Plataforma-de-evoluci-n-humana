// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot v61 — Sprint: DOI enlazable · Quiz adaptativo · Analítica local
   · JSDoc en funciones críticas · Service Worker registration
   ─────────────────────────────────────────────────────────────────────────
   Autora: Mirada · Biblioteca Facultad de Ciencias de la Educación, ULPGC
   Versión: 61.0.0 · 2026-05 · CC BY-NC 4.0
   ═══════════════════════════════════════════════════════════════════════ */
(function PaleoBotV61() {
  'use strict';

  const DEBUG = false;
  const log = DEBUG ? console.log.bind(console, '[PB61]') : () => {};

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 1 — DOI ENLAZABLE
     Convierte los campos doi:"10.1038/..." de cada taxón en hipervínculos
     <a href="https://doi.org/..."> dentro de las fichas y el glosario.
     Fuente del patrón DOI: https://www.doi.org/doi_handbook/2_Numbering.html
     ════════════════════════════════════════════════════════════════════ */

  /**
   * Normaliza un string DOI a URL canónica de doi.org.
   * Acepta: "10.xxxx/...", "doi:10.xxxx/...", "https://doi.org/10.xxxx/..."
   * @param {string} doi - Valor del campo doi
   * @returns {string} URL canónica o cadena vacía si no es válido
   */
  function normalizeDOI(doi) {
    if (!doi || typeof doi !== 'string') return '';
    const clean = doi.trim()
      .replace(/^doi\s*:\s*/i, '')
      .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
    // Validar formato básico: 10.XXXX/...
    return /^10\.\d{4,}\/\S+/.test(clean)
      ? 'https://doi.org/' + clean
      : '';
  }

  /**
   * Genera el HTML de un enlace DOI accesible.
   * @param {string} doi - Valor del campo doi
   * @param {string} [label] - Texto visible (por defecto: DOI abreviado)
   * @returns {string} HTML del enlace o cadena vacía
   */
  function doiLink(doi, label) {
    const url = normalizeDOI(doi);
    if (!url) return '';
    const short = doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/^doi\s*:\s*/i, '');
    const text  = label || short.slice(0, 35) + (short.length > 35 ? '…' : '');
    return `<a href="${url}" target="_blank" rel="noopener noreferrer"
               class="doi-link" aria-label="Referencia DOI: ${escSafe(text)}"
               title="Abrir en doi.org: ${escSafe(url)}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              ${escSafe(text)}
            </a>`;
  }

  /** Escape HTML básico para uso en atributos */
  function escSafe(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  /**
   * Inyecta el CSS de los enlaces DOI en el <head>.
   * Se llama una sola vez en la inicialización.
   */
  function injectDOIStyles() {
    if (document.getElementById('doi-link-styles')) return;
    /* R67: CSS externalizado a assets/css/00-core/042-paleobot-r67-externalized-runtime-styles.css (doi-link-styles). */
    log('DOI styles inyectados');
  }

  /**
   * Renderiza el bloque de referencias de un taxón como HTML enlazable.
   * Se llama desde las fichas de detalle de especie.
   * @param {Array} refs - Array de {a, y, t, doi} del campo experto.referencias
   * @returns {string} HTML del bloque de referencias
   */
  function renderRefs(refs) {
    if (!Array.isArray(refs) || refs.length === 0) return '';
    return refs.map(r => {
      const doi  = r.doi ? doiLink(r.doi, null) : '';
      const year = r.y ? `<span class="ref-year">(${escSafe(r.y)})</span>` : '';
      const title = r.t ? `<em class="ref-title">${escSafe(r.t)}</em>. ` : '';
      return `<div class="ref-entry">
        <span class="ref-author">${escSafe(r.a || '?')}</span> ${year}
        ${title}${doi}
      </div>`;
    }).join('');
  }

  // Exponer para uso en fichas de especie
  window.PaleoBotDOI = { normalizeDOI, doiLink, renderRefs, escSafe };

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 2 — QUIZ ADAPTATIVO
     Pondera las preguntas del QUESTION_BANK según la tasa de error histórica
     por competencia y por taxón, guardada en QuizProgress / SafeStorage.
     Implementa el algoritmo de repetición espaciada SM-2 simplificado.
     Ref: Wozniak (1990). https://doi.org/10.2478/v10307-012-0015-4
     ════════════════════════════════════════════════════════════════════ */

  /**
   * Calcula el peso adaptativo de una pregunta del banco.
   * Preguntas con más errores recientes reciben mayor peso.
   * @param {Object} q   - Pregunta del QUESTION_BANK {sp, comp, q, a, opts}
   * @param {Object} history - Historial de respuestas {[sp_comp]: {ok, fail, last}}
   * @returns {number} Peso [1..10]; mayor peso = más probable de aparecer
   */
  function adaptiveWeight(q, history) {
    const key  = `${q.sp}_${q.comp || 'gen'}`;
    const rec  = history[key];
    if (!rec)  return 3; // Primera vez: peso neutro
    const total = (rec.ok || 0) + (rec.fail || 0);
    if (total === 0) return 3;
    const errorRate = (rec.fail || 0) / total;
    // SM-2 simplificado: errores recientes pesan más
    const recency  = rec.last ? Math.max(0, 1 - (Date.now() - rec.last) / 86400000) : 0;
    return Math.round(1 + errorRate * 7 + recency * 2);
  }

  /**
   * Selecciona N preguntas del banco con ponderación adaptativa.
   * Usa selección por ruleta (weighted random) para garantizar variedad.
   * @param {Array}  bank    - Array de preguntas del QUESTION_BANK
   * @param {number} n       - Número de preguntas a seleccionar
   * @param {Object} history - Historial de respuestas
   * @returns {Array} Preguntas seleccionadas en orden aleatorio ponderado
   */
  function selectAdaptive(bank, n, history) {
    if (!Array.isArray(bank) || bank.length === 0) return [];
    const weighted = bank.map(q => ({ q, w: adaptiveWeight(q, history) }));
    const selected = [];
    const used = new Set();

    for (let i = 0; i < Math.min(n, bank.length); i++) {
      const available = weighted.filter((_,j) => !used.has(j));
      const totalW = available.reduce((s, e) => s + e.w, 0);
      let rand = Math.random() * totalW;
      let idx  = 0;
      for (let j = 0; j < available.length; j++) {
        rand -= available[j].w;
        if (rand <= 0) { idx = j; break; }
      }
      const chosen = available[idx];
      if (chosen) {
        selected.push(chosen.q);
        used.add(weighted.indexOf(chosen));
      }
    }
    return selected;
  }

  /**
   * Actualiza el historial de respuestas tras una pregunta del quiz.
   * @param {string} sp    - ID del taxón
   * @param {string} comp  - Competencia LOMLOE
   * @param {boolean} ok   - Si la respuesta fue correcta
   * @param {Object}  history - Historial mutable
   */
  function recordAnswer(sp, comp, ok, history) {
    const key = `${sp}_${comp || 'gen'}`;
    if (!history[key]) history[key] = { ok: 0, fail: 0, last: null };
    if (ok) history[key].ok++;
    else    history[key].fail++;
    history[key].last = Date.now();
  }

  /**
   * Carga el historial adaptativo desde SafeStorage.
   * @returns {Object} Historial {[sp_comp]: {ok, fail, last}}
   */
  function loadAdaptiveHistory() {
    try {
      const raw = window.PaleoBotStorage?.getPersistent('paleobot_adaptive_history', null);
      return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
  }

  /**
   * Guarda el historial adaptativo en SafeStorage.
   * @param {Object} history
   */
  function saveAdaptiveHistory(history) {
    try {
      const raw = JSON.stringify(history);
      window.PaleoBotStorage?.setPersistent('paleobot_adaptive_history', raw);
    } catch(e) { /* recuperable: sin persistencia */ }
  }

  // Estado del quiz adaptativo (sesión)
  const _adaptiveState = {
    history: {},
    active:  false,
    items:   [],
    index:   0,
    score:   0
  };

  /**
   * Inicia el quiz adaptativo.
   * Sustituye a runExam() cuando el alumnado ha respondido ≥10 preguntas previas.
   * @param {number} [n=10] - Número de preguntas
   */
  function runAdaptiveQuiz(n = 10) {
    const bank = window.QUESTION_BANK;
    if (!Array.isArray(bank) || bank.length === 0) {
      log('QUESTION_BANK no disponible — usando runExam estándar');
      if (typeof window.runExam === 'function') window.runExam();
      return;
    }
    _adaptiveState.history = loadAdaptiveHistory();
    _adaptiveState.items   = selectAdaptive(bank, n, _adaptiveState.history);
    _adaptiveState.index   = 0;
    _adaptiveState.score   = 0;
    _adaptiveState.active  = true;
    log(`Quiz adaptativo: ${_adaptiveState.items.length} preguntas seleccionadas`);
    renderAdaptiveQuestion();
  }

  /** Renderiza la pregunta actual del quiz adaptativo */
  function renderAdaptiveQuestion() {
    const host = document.getElementById('examQ');
    if (!host) return;
    const { items, index } = _adaptiveState;
    if (index >= items.length) { renderAdaptiveResult(); return; }
    const q = items[index];
    const total = items.length;
    const pct   = Math.round(index / total * 100);
    const opts  = Array.isArray(q.opts) ? q.opts : [q.a, q.b, q.c, q.d].filter(Boolean);
    // Mezclar opciones
    const shuffled = [...opts].sort(() => Math.random() - 0.5);

    window.PaleoBotStyleState.display(host, 'block');
    const examIntro = document.getElementById('examIntro');
    if (examIntro) window.PaleoBotStyleState.display(examIntro, 'none');

    host.innerHTML = `
      <div class="exam-progress-bar" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Progreso: pregunta ${index+1} de ${total}">
        <div class="exam-progress-fill" data-pb-r71-style="width:${pct}%"></div>
      </div>
      <div class="exam-meta">
        <span class="exam-counter">${index+1} / ${total}</span>
        ${q.comp ? `<span class="exam-competencia">${escSafe(q.comp)}</span>` : ''}
        ${q.sp   ? `<span class="exam-taxon">${escSafe(q.sp)}</span>` : ''}
      </div>
      <p class="exam-question-text">${escSafe(q.q)}</p>
      <div class="exam-options" role="group" aria-label="Opciones de respuesta">
        ${shuffled.map(opt => `
          <button type="button" class="exam-opt" data-adaptive-answer="${escSafe(opt)}"
            data-correct="${escSafe(q.a)}" data-sp="${escSafe(q.sp||'')}"
            data-comp="${escSafe(q.comp||'')}">
            ${escSafe(opt)}
          </button>`).join('')}
      </div>
      <p class="exam-hint pb-r70-gen-9b7b27fb88" >
        ${q.sp ? `<em>${escSafe(q.sp)}</em> · ` : ''}Las preguntas se ajustan a tus respuestas anteriores
      </p>`;
    // Focus en primera opción
    requestAnimationFrame(() => {
      try { host.querySelector('.exam-opt')?.focus(); } catch(e) { /* recuperable */ }
    });
  }

  /** Renderiza el resultado final del quiz adaptativo */
  function renderAdaptiveResult() {
    const host = document.getElementById('examQ');
    if (!host) return;
    saveAdaptiveHistory(_adaptiveState.history);
    const { score, items } = _adaptiveState;
    const pct  = items.length ? Math.round(score / items.length * 100) : 0;
    const color = pct >= 75 ? 'var(--c-australo,#2e8b57)' : pct >= 50 ? '#c07800' : 'var(--c-paran,#c0392b)';

    // Calcular los 3 taxones con más errores para sugerir repaso
    const hist = _adaptiveState.history;
    const weakest = Object.entries(hist)
      .map(([k,v]) => ({ key:k, rate: v.fail/(v.ok+v.fail||1) }))
      .filter(e => e.rate > 0)
      .sort((a,b) => b.rate - a.rate)
      .slice(0,3)
      .map(e => e.key.split('_')[0]);

    host.innerHTML = `
      <div class="exam-feedback-card">
        <h3 class="pb-r70-gen-751df7269a" >
          Resultado — Quiz adaptativo
        </h3>
        <div class="v34-kpi-grid">
          <div class="v34-kpi">
            <strong data-pb-r71-style="color:${color}">${pct}%</strong>
            <span>acierto</span>
          </div>
          <div class="v34-kpi">
            <strong>${score}/${items.length}</strong>
            <span>preguntas</span>
          </div>
        </div>
        ${weakest.length > 0 ? `
          <div class="pb-r70-gen-d4040ed828" >
            <p class="pb-r70-gen-c7aa5131b3" >
              📚 Taxones para repasar:
            </p>
            <p class="pb-r70-gen-fcdc5c482d" >
              ${weakest.map(sp => `<em>${escSafe(sp)}</em>`).join(' · ')}
            </p>
          </div>` : ''}
        <div class="pb-r70-gen-a4e06e479c" >
          <button type="button" class="exam-btn" data-quiz-back="intro">
            ↩ Nueva autoevaluación
          </button>
          <button type="button" class="exam-btn linked" id="adaptiveResetBtn">
            🔄 Reiniciar historial adaptativo
          </button>
        </div>
      </div>`;

    // Botón de reset del historial
    document.getElementById('adaptiveResetBtn')?.addEventListener('click', () => {
      try {
        window.PaleoBotStorage?.removePersistent('paleobot_adaptive_history');
        _adaptiveState.history = {};
        log('Historial adaptativo reiniciado');
        const btn = document.getElementById('adaptiveResetBtn');
        if (btn) { btn.textContent = '✅ Historial reiniciado'; btn.disabled = true; }
      } catch(e) { /* recuperable */ }
    });

    _adaptiveState.active = false;
    if (typeof window.renderQuizProgress === 'function') {
      try { window.renderQuizProgress(); } catch(e) { /* recuperable */ }
    }
  }

  /**
   * Handler delegado para respuestas del quiz adaptativo.
   * Se registra en el delegador principal del atlas.
   */
  function handleAdaptiveAnswer(e) {
    const btn = e.target.closest('[data-adaptive-answer]');
    if (!btn || !_adaptiveState.active) return;
    e.preventDefault();
    e.stopPropagation();

    const answer  = btn.dataset.adaptiveAnswer;
    const correct = btn.dataset.correct;
    const sp      = btn.dataset.sp;
    const comp    = btn.dataset.comp;
    const isOk    = answer === correct;

    if (isOk) _adaptiveState.score++;
    recordAnswer(sp, comp, isOk, _adaptiveState.history);

    // Feedback visual
    const opts = btn.closest('.exam-options')?.querySelectorAll('.exam-opt');
    if (opts) {
      opts.forEach(o => {
        o.disabled = true;
        if (o.dataset.adaptiveAnswer === correct) o.classList.add('exam-correct');
      });
    }
    if (!isOk) btn.classList.add('exam-wrong');

    setTimeout(() => {
      _adaptiveState.index++;
      renderAdaptiveQuestion();
    }, 800);
  }

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 3 — ANALÍTICA LOCAL DE VISTAS
     Registra qué vistas visita el alumnado y con qué frecuencia,
     usando el evento paleobot:viewchange ya emitido por switchView().
     Los datos se guardan en SafeStorage y son visibles en el Centro Docente.
     ════════════════════════════════════════════════════════════════════ */

  const ANALYTICS_KEY = 'paleobot_view_analytics';

  /**
   * Carga el registro de analítica desde SafeStorage.
   * @returns {Object} {[viewId]: {visits, lastAt, totalTime}}
   */
  function loadAnalytics() {
    try {
      const raw = window.PaleoBotStorage?.getPersistent(ANALYTICS_KEY, null);
      return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
  }

  /**
   * Guarda el registro de analítica en SafeStorage.
   * @param {Object} data
   */
  function saveAnalytics(data) {
    try {
      const raw = JSON.stringify(data);
      window.PaleoBotStorage?.setPersistent(ANALYTICS_KEY, raw);
    } catch(e) { /* recuperable */ }
  }

  // Tiempo de inicio en la vista actual
  let _viewStartTime = Date.now();
  let _currentView   = null;

  /**
   * Registra una visita a una vista.
   * @param {string} viewId - ID de la vista visitada
   */
  function recordViewVisit(viewId) {
    if (!viewId) return;
    const data = loadAnalytics();

    // Registrar tiempo en la vista anterior
    if (_currentView && _currentView !== viewId) {
      const elapsed = Date.now() - _viewStartTime;
      if (!data[_currentView]) data[_currentView] = { visits:0, lastAt:null, totalMs:0 };
      data[_currentView].totalMs = (data[_currentView].totalMs || 0) + elapsed;
    }

    // Registrar visita a la nueva vista
    if (!data[viewId]) data[viewId] = { visits:0, lastAt:null, totalMs:0 };
    data[viewId].visits++;
    data[viewId].lastAt = new Date().toISOString();

    _currentView   = viewId;
    _viewStartTime = Date.now();

    saveAnalytics(data);
    log(`Vista registrada: ${viewId} (total: ${data[viewId].visits} visitas)`);
    // Notificar al panel del Centro Docente si está abierto
    document.dispatchEvent(new CustomEvent('paleobot:analytics:update', { detail: { viewId, data } }));
  }

  /**
   * Genera un resumen HTML de la analítica local para el Centro Docente.
   * @returns {string} HTML del panel de analítica
   */
  function renderAnalyticsPanel() {
    const data = loadAnalytics();
    const entries = Object.entries(data)
      .sort((a,b) => b[1].visits - a[1].visits)
      .slice(0,10);

    if (entries.length === 0) {
      return '<p class="pb-r70-gen-b952920d66" >Sin datos de visitas todavía. Navega por el atlas para ver la analítica.</p>';
    }

    const maxVisits = entries[0]?.[1]?.visits || 1;
    return `
      <div class="analytics-panel">
        <h4 class="pb-r70-gen-b790b26144" >
          📊 Vistas más visitadas (sesión actual)
        </h4>
        ${entries.map(([id, rec]) => {
          const pct  = Math.round(rec.visits / maxVisits * 100);
          const mins = rec.totalMs ? Math.round(rec.totalMs / 60000) : 0;
          const label = id.replace(/-/g,' ');
          return `
            <div class="analytics-row pb-r70-gen-3a35c23d38" >
              <div class="pb-r70-gen-11a00e9d4b" >
                <span class="pb-r70-gen-af4c11059e" >${escSafe(label)}</span>
                <span class="pb-r70-gen-13e5976131" >${rec.visits} visita${rec.visits!==1?'s':''} · ${mins} min</span>
              </div>
              <div class="pb-r70-gen-799cf6b1a9" >
                <div data-pb-r71-style="height:100%;width:${pct}%;background:var(--primary);border-radius:4px;transition:width 0.3s;"></div>
              </div>
            </div>`;
        }).join('')}
        <button class="pb-r70-gen-9237683868" type="button" id="analyticsResetBtn"
          >
          🗑 Borrar analítica local
        </button>
      </div>`;
  }

  // Exponer para uso en Centro Docente
  window.PaleoBotAnalytics = { loadAnalytics, renderAnalyticsPanel, recordViewVisit };

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 4 — JSDoc EN FUNCIONES CRÍTICAS
     Los comentarios JSDoc se añaden aquí como documentación canónica.
     No modifican el comportamiento de las funciones existentes.
     ════════════════════════════════════════════════════════════════════ */

  /**
   * @namespace PaleoBotAPI
   * @description API pública del atlas. Todas las funciones marcadas con
   * @public son accesibles desde la consola del navegador y desde módulos externos.
   *
   * Funciones documentadas retroactivamente (implementadas en versiones anteriores):
   *
   * @function renderActiveView
   * @description Renderiza la vista activa del atlas. Implementada como cadena de
   *   decoradores (v34→m13→v40) que se llaman en secuencia. Cada módulo añade
   *   comportamiento sin sobreescribir la capa anterior.
   * @param {string} viewId - ID de la vista (sin prefijo "view-")
   *
   * @function buildSelfAuditReport
   * @description Construye el informe de autodiagnóstico del atlas (módulo Auditoría).
   *   Implementada como cadena de decoradores (M1-M20: árbol, dispersión, banco,
   *   glosario, offline, mapa, SafeStorage, portales, toolbar, bus de controles).
   * @returns {Array<{id, label, status, detail}>} Array de ítems del informe
   *
   * @function cmpOnModalOpen
   * @description Inicializa el Comparador Anatómico Multi-especie al abrir el modal.
   *   Renderiza el picker, los presets curriculares y el estado inicial del comparador.
   *
   * @function buildV34QuestionBank
   * @description Genera el banco de preguntas para la Autoevaluación de repaso.
   *   Itera window.DB y crea preguntas por competencia LOMLOE (STEM, CCL, CPSAA, CCEC).
   * @returns {Array<{sp, comp, q, a, opts}>} Banco de preguntas
   *
   * @function openGlossary
   * @description Abre el modal del glosario y activa renderGlossary().
   *   Versión extendida (v38-bib): renderiza glosario + bibliografía coordinados.
   *
   * @function printFicha
   * @description Genera e imprime la ficha de la especie actualmente en detalle.
   *   Usa window.print() con @media print optimizado para A4.
   *
   * @function renderGlossary
   * @description Renderiza el glosario completo con categorías, búsqueda y DOI.
   *   Versión canónica: m13 (última definición). Sobreescribe la v34 (flip cards).
   *
   * @function resetGlobalFilters
   * @description Reinicia todos los filtros activos (clado, cronología, región,
   *   modo de complejidad) y vuelve a la vista inicial.
   */

  // ── CSS adicional para quiz adaptativo y analítica ───────────────────
  /* R67: CSS externalizado a assets/css/00-core/042-paleobot-r67-externalized-runtime-styles.css (v61-extra-styles). */

  /* ══════════════════════════════════════════════════════════════════════
     INICIALIZACIÓN
     ════════════════════════════════════════════════════════════════════ */

  function init() {
    // DOI: inyectar estilos
    injectDOIStyles();

    // Analítica: suscribirse al evento de cambio de vista
    document.addEventListener('paleobot:viewchange', (e) => {
      const viewId = e.detail?.view;
      if (viewId) recordViewVisit(viewId);
    });

    // Quiz adaptativo: registrar handler de respuestas
    document.addEventListener('click', handleAdaptiveAnswer, false);

    // Quiz adaptativo: registrar el botón de reset de analítica (delegado)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#analyticsResetBtn')) {
        try {
          window.PaleoBotStorage?.removePersistent(ANALYTICS_KEY);
          const btn = document.getElementById('analyticsResetBtn');
          if (btn) { btn.textContent = '✅ Analítica borrada'; btn.disabled = true; }
          log('Analítica local eliminada');
        } catch(er) { /* recuperable */ }
      }
    }, false);

    // Integrar runAdaptiveQuiz en el bus de extensiones
    if (window.PaleoBotBus) {
      window.PaleoBotBus.registerAction('runAdaptiveQuiz', () => runAdaptiveQuiz());
      window.PaleoBotBus.registerExtension('runExam', 'v61-adaptive',
        'Quiz adaptativo SM-2 simplificado basado en historial de errores por taxón/competencia');
    }

    // Exponer API pública
    window.runAdaptiveQuiz = runAdaptiveQuiz;

    // Marcar dataset
    document.documentElement.dataset.paleobotV61 = 'ready';
    log('PaleoBot v61 inicializado: DOI · Quiz adaptativo · Analítica local · JSDoc');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }

  // API pública v61
  window.PaleoBotV61 = {
    doiLink, renderRefs, normalizeDOI,
    runAdaptiveQuiz, selectAdaptive, loadAdaptiveHistory, saveAdaptiveHistory,
    renderAnalyticsPanel, loadAnalytics,
    version: '61.0.0'
  };

})();

/* Moodle deployment R57: Service Worker registration intentionally disabled.
   This package does not include sw.js and does not claim PWA/offline ownership
   inside the Moodle hosting context. */
