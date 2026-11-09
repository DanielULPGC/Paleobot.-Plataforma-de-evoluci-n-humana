// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v66-sa-session
(function PaleoBotV66SASession() {
  'use strict';

  const DEBUG = typeof window.__PALEOBOT_DEBUG !== 'undefined' && window.__PALEOBOT_DEBUG;
  const log   = DEBUG ? console.log.bind(console,  '[PB66-SA]') : () => {};
  const warn  = DEBUG ? console.warn.bind(console, '[PB66-SA]') : () => {};

  const SK_VISITED = 'pb_dap_visited';  // escrito por PaleoBotV65_Phase2

  /* ── Bloom labels (sincronizados con PaleoBotV65_Phase3) ─────────────── */
  const BLOOM_LABELS = { 1:'Recordar', 2:'Comprender', 3:'Aplicar', 4:'Analizar', 5:'Evaluar', 6:'Crear' };
  const BLOOM_COLORS = { 1:'#0e7f65', 2:'#0e7f65', 3:'#1a4fa0', 4:'#c07800', 5:'#aa1f1f', 6:'#6b3faa' };

  /* ── Mapeo Bloom → nivel educativo sugerido ──────────────────────────── */
  const BLOOM_TO_NIVEL = { 1:'4eso', 2:'4eso', 3:'1bach', 4:'1bach', 5:'2bach', 6:'2bach' };

  /* ── Mapeo Bloom → producto sugerido ─────────────────────────────────── */
  const BLOOM_TO_PRODUCTO = {
    1: 'ficha',
    2: 'mapa',
    3: 'informe',
    4: 'debate',
    5: 'presentacion',
    6: 'portfolio'
  };

  /* ════════════════════════════════════════════════════════════════════════
     A. LECTURA DE SESIÓN
     ════════════════════════════════════════════════════════════════════════ */

  /** Lee el conjunto de vistas visitadas desde sessionStorage */
  function _getVisited() {
    try {
      const raw = sessionStorage.getItem(SK_VISITED);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  }

  /**
   * Calcula el perfil de sesión a partir de las vistas visitadas.
   * @returns {{ visited: string[], bloomMax: number, competencias: string[], suggestedNivel: string, suggestedProducto: string, suggestedCompetencia: string }}
   */
  function _buildSessionProfile() {
    const visited    = [..._getVisited()];
    const spec       = window.PB_DidacticSpec;
    const viewMeta   = window.VIEW_META || {};

    let bloomMax     = 0;
    const compSet    = new Set();

    visited.forEach(id => {
      const vs = spec?.getViewSpec(id);
      if (vs) {
        if (vs.nivelBloom > bloomMax) bloomMax = vs.nivelBloom;
        (vs.competenciasLOMLOE || []).forEach(c => compSet.add(c));
      }
    });

    // Competencia más frecuente como sugerida para el generador
    const compCount = {};
    visited.forEach(id => {
      const vs = spec?.getViewSpec(id);
      (vs?.competenciasLOMLOE || []).forEach(c => { compCount[c] = (compCount[c] || 0) + 1; });
    });
    const topComp = Object.entries(compCount).sort((a,b) => b[1]-a[1])[0]?.[0] || 'STEM';

    return {
      visited,
      bloomMax: bloomMax || 1,
      competencias: [...compSet],
      suggestedNivel:       BLOOM_TO_NIVEL[bloomMax]     || '4eso',
      suggestedProducto:    BLOOM_TO_PRODUCTO[bloomMax]  || 'informe',
      suggestedCompetencia: topComp
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     B. PANEL DE PERFIL DE SESIÓN
     ════════════════════════════════════════════════════════════════════════ */

  function _esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /**
   * Construye el HTML del panel de perfil de sesión.
   */
  function _buildProfilePanelHtml(profile) {
    const viewMeta  = window.VIEW_META || {};
    const bloomCol  = BLOOM_COLORS[profile.bloomMax] || '#0e7f65';
    const bloomLbl  = BLOOM_LABELS[profile.bloomMax]  || 'Recordar';
    const nivelLbl  = { '4eso':'4.º ESO', '1bach':'1.º Bachillerato', '2bach':'2.º Bachillerato' }[profile.suggestedNivel] || profile.suggestedNivel;

    if (profile.visited.length === 0) {
      return `<div class="pb-m3-profile pb-m3-empty" role="status">
        <span class="pb-m3-empty-icon" aria-hidden="true">🗂</span>
        <p><strong>Aún no hay vistas exploradas en esta sesión.</strong><br>
           Navega por el atlas y vuelve aquí para generar una SA personalizada.</p>
      </div>`;
    }

    const chips = profile.visited
      .map(id => {
        const title = viewMeta[id]?.title || id;
        const spec  = window.PB_DidacticSpec?.getViewSpec(id);
        const bloom = spec?.nivelBloom || 1;
        return `<span class="pb-m3-chip" title="Nivel Bloom: ${_esc(BLOOM_LABELS[bloom] || '')}"
                  style="border-color:${BLOOM_COLORS[bloom] || '#aaa'}">${_esc(title)}</span>`;
      }).join('');

    const compChips = profile.competencias
      .map(c => `<span class="pb-m3-chip-cc">${_esc(c)}</span>`).join('');

    return `
      <div class="pb-m3-profile" role="region" aria-label="Perfil pedagógico de la sesión actual">
        <div class="pb-m3-profile-header">
          <div>
            <span class="pb-m3-kicker">Perfil pedagógico de tu sesión</span>
            <strong class="pb-m3-bloom-badge" style="background:${bloomCol}">
              Bloom máx: ${_esc(bloomLbl)}
            </strong>
          </div>
          <button type="button" class="pb-m3-from-session-btn" id="pbM3FromSessionBtn"
                  aria-label="Preconfigurar el generador de SA a partir de las vistas visitadas">
            ✦ Desde mi sesión
          </button>
        </div>

        <div class="pb-m3-stats-row">
          <div class="pb-m3-stat">
            <strong>${profile.visited.length}</strong>
            <span>vistas exploradas</span>
          </div>
          <div class="pb-m3-stat">
            <strong>${profile.competencias.length}</strong>
            <span>competencias activadas</span>
          </div>
          <div class="pb-m3-stat">
            <strong>${_esc(nivelLbl)}</strong>
            <span>nivel sugerido</span>
          </div>
        </div>

        <div class="pb-m3-section">
          <span class="pb-m3-label">Vistas visitadas</span>
          <div class="pb-m3-chips">${chips}</div>
        </div>

        ${compChips ? `<div class="pb-m3-section">
          <span class="pb-m3-label">Competencias LOMLOE activadas</span>
          <div class="pb-m3-chips">${compChips}</div>
        </div>` : ''}

        <p class="pb-m3-hint">
          Pulsa <strong>"✦ Desde mi sesión"</strong> para preconfigurar automáticamente el nivel,
          la competencia prioritaria y el producto según lo que has explorado.
        </p>
      </div>`;
  }

  /* ════════════════════════════════════════════════════════════════════════
     C. APLICAR PERFIL DE SESIÓN AL FORMULARIO SA
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Preconfigura los selectores del generador SA con los valores inferidos
   * de la sesión y lanza la generación automática.
   */
  function _applySessionToSA() {
    const profile = _buildSessionProfile();
    if (profile.visited.length === 0) {
      const status = document.getElementById('saGenStatus');
      if (status) {
        status.textContent = 'Sin vistas visitadas — explora el atlas primero.';
        status.setAttribute('aria-live', 'assertive');
      }
      return;
    }

    log('Aplicando perfil de sesión al generador SA:', profile);

    /* Actualizar los selectores del formulario */
    const selectors = {
      'sa-nivel':  profile.suggestedNivel,
      'sa-cc':     profile.suggestedCompetencia,
      'sa-prod':   profile.suggestedProducto
    };

    Object.entries(selectors).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (!el) return;
      // Buscar la opción más cercana al valor
      const opt = el.querySelector(`option[value="${CSS.escape(value)}"]`);
      if (opt) {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    /* Actualizar _saState en el generador existente */
    if (window._saState !== undefined) {
      try {
        window._saState.nivel       = profile.suggestedNivel;
        window._saState.competencia = profile.suggestedCompetencia;
        window._saState.producto    = profile.suggestedProducto;
      } catch(e) {}
    }

    /* Disparar generación automática */
    window.setTimeout(() => {
      const genBtn = document.getElementById('saGenBtn');
      if (genBtn) {
        genBtn.click();
        const status = document.getElementById('saGenStatus');
        if (status) status.textContent = `SA generada desde sesión (${profile.visited.length} vistas · Bloom ${BLOOM_LABELS[profile.bloomMax]})`;
      }
    }, 80);
  }

  /* ════════════════════════════════════════════════════════════════════════
     D. MEJORA DEL TEXTO DE EXPORTACIÓN (Moodle-ready)
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Envuelve _buildSATextExport para añadir:
   *   1. Sección "Vistas del atlas exploradas en la sesión"
   *   2. Rúbrica en formato tabulado (compatible con Moodle Assignment import)
   *   3. Pasos H5P-ready para el alumno
   */
  function _wrapTextExport() {
    const orig = window._buildSATextExport;
    if (typeof orig !== 'function') return;

    window._buildSATextExport = function(doc) {
      let base = orig(doc);

      const profile  = _buildSessionProfile();
      const viewMeta = window.VIEW_META || {};

      /* ── Sección de sesión ── */
      if (profile.visited.length > 0) {
        const visitedSection = [
          '',
          '═'.repeat(70),
          'VISTAS DEL ATLAS EXPLORADAS EN ESTA SESIÓN',
          '═'.repeat(70),
          `Vistas (${profile.visited.length}): ` + profile.visited
            .map(id => viewMeta[id]?.title || id).join(' · '),
          `Nivel Bloom máximo alcanzado: ${BLOOM_LABELS[profile.bloomMax] || '—'} (${profile.bloomMax}/6)`,
          `Competencias LOMLOE activadas: ${profile.competencias.join(', ') || '—'}`,
          `Nivel sugerido para la SA: ${{ '4eso':'4.º ESO','1bach':'1.º Bachillerato','2bach':'2.º Bachillerato' }[profile.suggestedNivel] || profile.suggestedNivel}`,
        ].join('\n');
        base += visitedSection;
      }

      /* ── Rúbrica tabulada Moodle ── */
      const rubrHeader = 'CRITERIO\tINICIAL (1)\tEN PROCESO (2)\tSATISFACTORIO (3)\tEXCELENTE (4)';
      const rubrRows = (doc.criterios || []).slice(0, 4).map((c, i) => {
        const desc = [
          ['Descripción incompleta sin fuentes.', 'Descripción con imprecisiones.', 'Descripción precisa con fuentes.', 'Descripción rigurosa y contrastada.'],
          ['No diferencia evidencia de opinión.', 'Diferencia con apoyo externo.', 'Diferencia evidencia e inferencia.', 'Usa tipos de evidencia con precisión.'],
          ['No reconoce incertidumbre.', 'Menciona incertidumbre vagamente.', 'Formula cautelas específicas.', 'Evalúa grados de certeza científica.'],
          ['Producto sin estructura.', 'Producto incompleto.', 'Producto claro y completo.', 'Producto riguroso y original.']
        ][i] || ['—', '—', '—', '—'];
        return `${c.split('—')[0].trim()}\t${desc.join('\t')}`;
      });
      const rubrSection = [
        '',
        '═'.repeat(70),
        'RÚBRICA — FORMATO MOODLE (separado por tabulaciones)',
        '═'.repeat(70),
        rubrHeader,
        ...rubrRows
      ].join('\n');
      base += rubrSection;

      /* ── Pasos para el alumno (H5P Course Presentation-ready) ── */
      const stepsSection = [
        '',
        '═'.repeat(70),
        'SECUENCIA DE PASOS PARA EL ALUMNADO (H5P-ready)',
        '═'.repeat(70),
        'Paso 1 · Activación: Responde a la pregunta motriz en tu cuaderno (5 min).',
        `Paso 2 · Exploración: Navega por los módulos recomendados del atlas: ${(doc.vistas || []).join(', ')}.`,
        'Paso 3 · Registro: Anota al menos 3 evidencias y 1 incertidumbre en cada vista.',
        `Paso 4 · Producto: Elabora ${doc.producto || 'el producto acordado'} con las evidencias recogidas.`,
        'Paso 5 · Defensa: Presenta o entrega el producto e identifica una pregunta que aún no puedes responder.',
        'Paso 6 · Metacognición: Completa el ticket de salida: ¿qué has aprendido? ¿qué evidencia te ha sorprendido? ¿qué falta?'
      ].join('\n');
      base += stepsSection;

      return base;
    };

    log('_buildSATextExport envuelto con secciones Moodle y H5P');
  }

  /* ════════════════════════════════════════════════════════════════════════
     E. ESTILOS CSS DEL PANEL DE SESIÓN
     ════════════════════════════════════════════════════════════════════════ */

  function _injectStyles() {
    if (document.getElementById('pb-m3-styles')) return;
    const style = document.createElement('style');
    style.id = 'pb-m3-styles';
    style.textContent = `
      /* ── Panel de perfil de sesión ──────────────────────────────── */
      .pb-m3-profile {
        background: #f5f2ec;
        border: 1.5px solid #d8d4cc;
        border-radius: 14px;
        padding: 18px 20px 14px;
        margin-bottom: 20px;
        font-family: var(--font-sans, sans-serif);
      }
      .pb-m3-empty {
        display: flex;
        align-items: center;
        gap: 14px;
        color: var(--text-sec, #6b5f4e);
        font-size: 0.85rem;
        padding: 14px 18px;
      }
      .pb-m3-empty-icon { font-size: 1.6rem; }
      .pb-m3-profile-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .pb-m3-kicker {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent, #0e7f65);
        margin-bottom: 4px;
      }
      .pb-m3-bloom-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        color: white;
        padding: 3px 10px;
        border-radius: 999px;
        margin-left: 6px;
        vertical-align: middle;
      }
      .pb-m3-from-session-btn {
        background: var(--primary, #1c2b3a);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        font-family: var(--font-sans, sans-serif);
        transition: background 0.18s;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .pb-m3-from-session-btn:hover {
        background: var(--primary-mid, #2e4257);
      }
      .pb-m3-from-session-btn:focus-visible {
        outline: 3px solid var(--accent, #0e7f65);
        outline-offset: 2px;
      }
      .pb-m3-stats-row {
        display: flex;
        gap: 20px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .pb-m3-stat {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .pb-m3-stat strong {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary, #1c2b3a);
        line-height: 1;
      }
      .pb-m3-stat span {
        font-size: 0.72rem;
        color: var(--text-sec, #6b5f4e);
      }
      .pb-m3-section { margin-bottom: 10px; }
      .pb-m3-label {
        display: block;
        font-size: 0.71rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-sec, #6b5f4e);
        margin-bottom: 5px;
      }
      .pb-m3-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .pb-m3-chip {
        display: inline-block;
        font-size: 0.76rem;
        padding: 3px 9px;
        border-radius: 999px;
        border: 1.5px solid #aaa;
        background: white;
        color: var(--primary, #1c2b3a);
        font-family: var(--font-sans, sans-serif);
      }
      .pb-m3-chip-cc {
        display: inline-block;
        font-size: 0.73rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 5px;
        background: var(--accent, #0e7f65);
        color: white;
        font-family: var(--font-mono, monospace);
      }
      .pb-m3-hint {
        font-size: 0.78rem;
        color: var(--text-sec, #6b5f4e);
        margin-top: 10px;
        line-height: 1.5;
      }
      @media (prefers-reduced-motion: reduce) {
        .pb-m3-from-session-btn { transition: none; }
      }
      @media (max-width: 600px) {
        .pb-m3-profile { padding: 14px 12px 12px; }
        .pb-m3-stats-row { gap: 14px; }
        .pb-m3-profile-header { flex-direction: column; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════════════════════
     F. INYECCIÓN EN EL DOM DEL CENTRO DOCENTE
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Inyecta el panel de perfil de sesión encima del formulario SA.
   * Se llama cuando #teachingCenterContent ya contiene el generador SA.
   */
  function _injectProfilePanel() {
    const wrap = document.querySelector('.sa-gen-wrap');
    if (!wrap || wrap.querySelector('.pb-m3-profile')) return;

    const profile = _buildSessionProfile();
    const panelHtml = _buildProfilePanelHtml(profile);

    const panelDiv = document.createElement('div');
    panelDiv.innerHTML = panelHtml;
    const panel = panelDiv.firstElementChild;
    wrap.insertBefore(panel, wrap.firstElementChild);

    /* Botón "Desde mi sesión" */
    const btn = document.getElementById('pbM3FromSessionBtn');
    if (btn) {
      btn.addEventListener('click', function() {
        _applySessionToSA();
        /* Actualizar el panel tras generación */
        window.setTimeout(_refreshProfilePanel, 600);
      });
    }

    log('Panel de perfil de sesión inyectado. Vistas:', profile.visited.length);
  }

  /** Actualiza el panel de sesión sin recrearlo completo */
  function _refreshProfilePanel() {
    const oldPanel = document.querySelector('.pb-m3-profile');
    if (!oldPanel) return;
    const profile = _buildSessionProfile();
    const tmpDiv  = document.createElement('div');
    tmpDiv.innerHTML = _buildProfilePanelHtml(profile);
    const newPanel = tmpDiv.firstElementChild;
    oldPanel.replaceWith(newPanel);
    /* Re-enlazar botón */
    const btn = document.getElementById('pbM3FromSessionBtn');
    if (btn) {
      btn.addEventListener('click', function() {
        _applySessionToSA();
        window.setTimeout(_refreshProfilePanel, 600);
      });
    }
  }

  /* ── Observar cuando el Centro Docente se renderiza ──────────────────── */
  function _watchTeachingCenter() {
    const container = document.getElementById('teachingCenterContent');
    if (!container) return;

    /* Si ya tiene contenido, inyectar inmediatamente */
    if (container.querySelector('.sa-gen-wrap')) {
      _injectProfilePanel();
      return;
    }

    /* MutationObserver para detectar renderTeachingCenter() */
    if (!window.MutationObserver) return;
    const obs = new MutationObserver(() => {
      if (container.querySelector('.sa-gen-wrap')) {
        _injectProfilePanel();
        obs.disconnect();
      }
    });
    obs.observe(container, { childList: true, subtree: true });
  }

  /* Escuchar cambios de vista para activar el observer cuando se navega a 'aula' */
  function _listenViewChanges() {
    ['paleobot:viewchange','paleobot:v55-viewchange','paleobot:combined-viewchange'].forEach(evt => {
      document.addEventListener(evt, function(e) {
        const view = e.detail?.view || e.detail?.viewId || '';
        if (view === 'aula') {
          window.setTimeout(_watchTeachingCenter, 200);
        }
      });
    });

    /* También actualizamos el panel cuando la sesión cambia de vistas */
    document.addEventListener('paleobot:viewchange', function() {
      const panel = document.querySelector('.pb-m3-profile');
      if (panel) window.setTimeout(_refreshProfilePanel, 400);
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     G. INICIALIZACIÓN
     ════════════════════════════════════════════════════════════════════════ */

  function _init() {
    _injectStyles();
    _wrapTextExport();
    _watchTeachingCenter();
    _listenViewChanges();
    window.PaleoBotV66SASession = { buildSessionProfile: _buildSessionProfile, refreshPanel: _refreshProfilePanel };
    log('M3 SA-Session listo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init, { once: true });
  } else {
    _init();
  }

})();
