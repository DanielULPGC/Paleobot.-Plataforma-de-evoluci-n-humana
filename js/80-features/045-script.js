// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot v63 — Accesibilidad visual + Buscador global
   ─────────────────────────────────────────────────────────────────────────
   Módulos:
   1. Modo daltonismo — filtros CSS SVG (deuteranopia, protanopia, achromatopsia)
   2. Control de tamaño de fuente — escala rem base [80%–140%]
   3. Buscador global cross-vistas — índice en memoria sobre DB + vistas
   ─────────────────────────────────────────────────────────────────────────
   WCAG: 1.4.1 (daltonismo), 1.4.4 (fuente redimensionable), 2.4.3 (búsqueda)
   Versión: 63.0.0 · ULPGC/FCEDU · CC BY-NC 4.0
   ═══════════════════════════════════════════════════════════════════════ */
(function PaleoBotV63() {
  'use strict';
  const DEBUG = false;
  const log = DEBUG ? console.log.bind(console, '[PB63]') : () => {};

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 1 — MODO DALTONISMO
     Implementa filtros de color CSS SVG en <defs> (no afecta al SVG real).
     WCAG 1.4.1: Use of Color — la información no depende solo del color.
     Ref: Machado et al. (2009) https://doi.org/10.1109/TVCG.2009.113
     ════════════════════════════════════════════════════════════════════ */

  const COLOR_MODES = {
    normal:         { label: 'Normal',          filter: 'none' },
    deuteranopia:   { label: 'Deuteranopia',    filter: 'url(#pb-deuteranopia)'   },
    protanopia:     { label: 'Protanopia',      filter: 'url(#pb-protanopia)'     },
    achromatopsia:  { label: 'Achromatopsia',   filter: 'url(#pb-achromatopsia)'  },
    highcontrast:   { label: 'Alto contraste',  filter: 'none' },
  };

  const SVG_FILTERS = `
    <svg class="pb-r70-gen-1d7a5db134" id="pb-colorblind-filters" aria-hidden="true"
          focusable="false">
      <defs>
        <!-- Deuteranopia (déficit de verde) — Machado et al. 2009 -->
        <filter id="pb-deuteranopia" color-interpolation-filters="linearRGB">
          <feColorMatrix type="matrix" values="
            0.367 0.861 -0.228 0 0
            0.280 0.673  0.047 0 0
           -0.012 0.043  0.969 0 0
            0     0      0     1 0"/>
        </filter>
        <!-- Protanopia (déficit de rojo) — Machado et al. 2009 -->
        <filter id="pb-protanopia" color-interpolation-filters="linearRGB">
          <feColorMatrix type="matrix" values="
            0.152 1.053 -0.205 0 0
            0.115 0.786  0.099 0 0
           -0.004 -0.048 1.052 0 0
            0      0     0     1 0"/>
        </filter>
        <!-- Achromatopsia (monocromática completa) -->
        <filter id="pb-achromatopsia" color-interpolation-filters="linearRGB">
          <feColorMatrix type="matrix" values="
            0.299 0.587 0.114 0 0
            0.299 0.587 0.114 0 0
            0.299 0.587 0.114 0 0
            0     0     0     1 0"/>
        </filter>
      </defs>
    </svg>`;

  let _currentColorMode = 'normal';

  /**
   * Aplica un modo de visión del color al body del documento.
   * @param {keyof COLOR_MODES} mode
   */
  function setColorMode(mode) {
    if (!COLOR_MODES[mode]) return;
    _currentColorMode = mode;

    // Eliminar clases de modo previo (legado + contrato común R77).
    Object.keys(COLOR_MODES).forEach(m => {
      document.body.classList.remove('pb-color-' + m);
    });
    document.body.classList.remove(
      'pb-v74-color-deuteranopia',
      'pb-v74-color-protanopia',
      'pb-v74-color-achromatopsia'
    );

    if (mode !== 'normal') {
      document.body.classList.add('pb-color-' + mode);
    }
    if (mode !== 'normal' && mode !== 'highcontrast') {
      document.body.classList.add('pb-v74-color-' + mode);
    }

    // Alto contraste: conservar ambas capas CSS históricas sincronizadas.
    const highContrast = mode === 'highcontrast';
    document.documentElement.classList.toggle('pb-high-contrast', highContrast);
    document.documentElement.classList.toggle('pb-v74-high-contrast', highContrast);

    // Persistir mediante el adaptador canónico.
    try {
      window.PaleoBotStorage?.setPersistent('paleobot_color_mode', mode);
    } catch(e) { /* recuperable */ }

    // Actualizar botones de la toolbar
    document.querySelectorAll('[data-color-mode]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.colorMode === mode));
      btn.classList.toggle('active', btn.dataset.colorMode === mode);
    });

    log(`Modo de color: ${mode}`);
  }

  /** Restaura el modo de color guardado en SafeStorage */
  function restoreColorMode() {
    try {
      const saved = window.PaleoBotStorage?.getPersistent('paleobot_color_mode', 'normal') || 'normal';
      if (saved && COLOR_MODES[saved] && saved !== 'normal') setColorMode(saved);
    } catch(e) { /* recuperable */ }
  }

  /** Inyecta los filtros SVG y el CSS del toolbar de accesibilidad */
  function injectColorFilters() {
    if (document.getElementById('pb-colorblind-filters')) return;
    document.body.insertAdjacentHTML('afterbegin', SVG_FILTERS);

    // CSS de alto contraste
    /* R67: CSS externalizado a assets/css/00-core/042-paleobot-r67-externalized-runtime-styles.css (pb-color-styles). */
    log('Filtros de color SVG inyectados');
  }

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 2 — CONTROL DE TAMAÑO DE FUENTE
     Ajusta html { font-size } en pasos del 10% entre 80% y 140%.
     Dado que el atlas usa rem mayoritariamente, esto escala todo el texto.
     WCAG 1.4.4: Resize text — el texto puede redimensionarse hasta 200%
     sin pérdida de contenido ni funcionalidad.
     ════════════════════════════════════════════════════════════════════ */

  const FONT_STEP    = 10;   // porcentaje por paso
  const FONT_MIN     = 80;
  const FONT_MAX     = 150;
  const FONT_DEFAULT = 100;
  const FONT_KEY     = 'paleobot_font_scale';

  let _currentFontPct = FONT_DEFAULT;

  /** Aplica la escala de fuente al elemento html */
  function applyFontScale(pct) {
    _currentFontPct = Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, Number(pct) || FONT_DEFAULT)));
    Array.from(document.documentElement.classList)
      .filter(cls => cls.startsWith('pb-r77-font-') || cls.startsWith('pb-v74-font-'))
      .forEach(cls => document.documentElement.classList.remove(cls));
    document.documentElement.classList.add('pb-r77-font-' + _currentFontPct);
    document.querySelectorAll('.pb-font-display').forEach(el => {
      el.textContent = _currentFontPct + '%';
    });
    try {
      window.PaleoBotStorage?.setPersistent(FONT_KEY, String(_currentFontPct));
    } catch(e) { /* recuperable */ }
    log(`Fuente: ${_currentFontPct}%`);
  }

  function increaseFontSize() { applyFontScale(_currentFontPct + FONT_STEP); }
  function decreaseFontSize() { applyFontScale(_currentFontPct - FONT_STEP); }
  function resetFontSize()    { applyFontScale(FONT_DEFAULT); }

  function restoreFontScale() {
    try {
      const saved = window.PaleoBotStorage?.getPersistent(FONT_KEY, null);
      if (saved) applyFontScale(parseInt(saved, 10));
    } catch(e) { /* recuperable */ }
  }

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 3 — BUSCADOR GLOBAL CROSS-VISTAS
     Construye un índice en memoria sobre:
     · DB: nombre, descripcion, cronologia con procedencia, clado y ubicacion de los 50 taxones
     · Vistas: títulos y keywords del VIEW_META
     · Glosario: términos y definiciones
     Interfaz: modal flotante activado con Ctrl+K / ⌘K o botón FAB.
     WCAG 2.4.3: Focus Order, 2.1.1: Keyboard.
     ════════════════════════════════════════════════════════════════════ */

  let _searchIndex   = null;  // índice construido lazy
  let _searchOpen    = false;

  /**
   * Construye el índice de búsqueda en memoria.
   * Se llama lazy en la primera apertura del buscador.
   * @returns {Array<{type, id, title, body, action}>}
   */
  function buildSearchIndex() {
    if (_searchIndex) return _searchIndex;
    const idx = [];

    // ── Taxones de la DB ──────────────────────────────────────────────
    const db = window.DB;
    if (Array.isArray(db)) {
      db.forEach(sp => {
        idx.push({
          type:   'taxon',
          id:     sp.id,
          title:  sp.nombre || sp.id,
          body:   [sp.descripcion, window.PaleoBotA3Temporal?.displayMetadata(sp)?.text, sp.clado, sp.ubicacion, sp.dieta].filter(Boolean).join(' ').toLowerCase(),
          action: () => {
            if (typeof window.switchView === 'function') window.switchView('timeline');
            setTimeout(() => {
              const btn = document.querySelector(`[data-open-species="${sp.id}"]`);
              if (btn) btn.click();
            }, 300);
          }
        });
      });
    }

    // ── Vistas del atlas (VIEW_META) ──────────────────────────────────
    const vm = window.VIEW_META || {};
    Object.entries(vm).forEach(([id, meta]) => {
      idx.push({
        type:   'vista',
        id,
        title:  meta.label || meta.title || id,
        /* R94: VIEW_META usa title/goal/audience/family (no label/desc/keywords). */
        body:   [meta.label, meta.title, meta.desc, meta.goal, meta.keywords, meta.family].filter(Boolean).join(' ').toLowerCase(),
        action: () => { if (typeof window.switchView === 'function') window.switchView(id); }
      });
    });

    // ── Glosario ─────────────────────────────────────────────────────
    const glos = window.glosario || {};
    Object.entries(glos).forEach(([term, entry]) => {
      const def = typeof entry === 'string' ? entry : (entry.def || entry.definition || '');
      idx.push({
        type:   'glosario',
        id:     term,
        title:  term,
        body:   def.toLowerCase(),
        action: () => {
          if (typeof window.openGlossary === 'function') window.openGlossary();
          setTimeout(() => {
            const input = document.querySelector('[data-gloss-search]') || document.getElementById('glossarySearch');
            if (input) { input.value = term; input.dispatchEvent(new Event('input', { bubbles:true })); }
          }, 300);
        }
      });
    });

    _searchIndex = idx;
    log(`Índice construido: ${idx.length} entradas (${db?.length||0} taxones, ${Object.keys(vm).length} vistas, ${Object.keys(glos).length} términos)`);
    return idx;
  }

  /**
   * Busca en el índice y devuelve los N mejores resultados.
   * Scoring: título exacto (10pts) > título parcial (5pts) > cuerpo (1pt).
   * @param {string} query
   * @param {number} [maxResults=8]
   */
  function search(query, maxResults = 8) {
    const idx = buildSearchIndex();
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    return idx.map(entry => {
      let score = 0;
      const titleL = entry.title.toLowerCase();
      terms.forEach(t => {
        if (titleL === t)              score += 10;
        else if (titleL.startsWith(t)) score += 7;
        else if (titleL.includes(t))   score += 5;
        if (entry.body.includes(t))    score += 1;
      });
      return { ...entry, score };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  }

  /** Tipo → etiqueta + color */
  const TYPE_META = {
    taxon:   { label: 'Taxón',   color: 'var(--primary)',           icon: '🦴' },
    vista:   { label: 'Vista',   color: 'var(--accent, #2c5f4a)',   icon: '🗂️' },
    glosario:{ label: 'Glosario',color: '#8b5e2a',                  icon: '📖' },
  };

  /** Renderiza los resultados de búsqueda */
  function renderSearchResults(results, query) {
    if (!results.length) {
      return `<div class="gs-empty">
        <span class="gs-empty-icon">🔍</span>
        <p>Sin resultados para <strong>${escSafe(query)}</strong></p>
        <p class="gs-hint">Prueba con el nombre del taxón, una vista o un término del glosario.</p>
      </div>`;
    }
    return results.map((r, i) => {
      const tm    = TYPE_META[r.type] || { label: r.type, color: '#666', icon: '•' };
      const title = highlightMatch(r.title, query);
      return `<button type="button" class="gs-result" data-gs-index="${i}"
                role="option" id="gs-opt-${i}" aria-selected="false">
        <span class="gs-type-badge" data-pb-r71-style="background:${tm.color};">${tm.icon} ${tm.label}</span>
        <span class="gs-result-title">${title}</span>
      </button>`;
    }).join('');
  }

  /** Resalta los términos buscados en el título */
  function highlightMatch(text, query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    let result = escSafe(text);
    terms.forEach(t => {
      const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      result = result.replace(re, '<mark class="gs-hl">$1</mark>');
    });
    return result;
  }

  function escSafe(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  /** Abre el modal del buscador global */
  function openGlobalSearch() {
    // Recovery R14: v86 es la autoridad de interacción si está disponible.
    if (window.PaleoBotV86GlobalSearchFinal &&
        typeof window.PaleoBotV86GlobalSearchFinal.openModal === 'function') {
      _searchOpen = true;
      return window.PaleoBotV86GlobalSearchFinal.openModal();
    }

    const modal = document.getElementById('globalSearchModal');
    if (!modal) return false;
    _searchOpen = true;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const input = document.getElementById('gsInput');
    if (input) setTimeout(() => { try { input.focus(); } catch(e) { /* recuperable */ } }, 60);
    log('Buscador global abierto');
    return true;
  }

  /** Cierra el modal del buscador global */
  function closeGlobalSearch() {
    // Recovery R14: cierre delegado a v86 para una sola fuente de verdad.
    if (window.PaleoBotV86GlobalSearchFinal &&
        typeof window.PaleoBotV86GlobalSearchFinal.closeModal === 'function') {
      _searchOpen = false;
      return window.PaleoBotV86GlobalSearchFinal.closeModal();
    }

    const modal = document.getElementById('globalSearchModal');
    if (!modal) return false;
    _searchOpen = false;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    const trigger = document.getElementById('gsOpenBtn');
    if (trigger) { try { trigger.focus(); } catch(e) { /* recuperable */ } }
    return true;
  }

  /* ══════════════════════════════════════════════════════════════════════
     MÓDULO 4 — TOOLBAR DE ACCESIBILIDAD
     Inserta controles de daltonismo + fuente en la barra de herramientas
     existente. No añade elementos al DOM principal — se inyectan en un
     contenedor ya visible (nav principal o zona de configuración).
     ════════════════════════════════════════════════════════════════════ */

  /**
   * Genera el HTML del toolbar de accesibilidad visual.
   * Se inserta en el nav principal del atlas.
   */
  function buildA11yToolbarHTML() {
    return `
      <div class="pb-a11y-toolbar" role="toolbar" aria-label="Accesibilidad visual">
        <!-- Modo de color -->
        <button type="button" class="pb-a11y-btn" data-color-mode="normal"
          aria-pressed="true" title="Colores normales">Normal</button>
        <button type="button" class="pb-a11y-btn" data-color-mode="deuteranopia"
          aria-pressed="false" title="Simular deuteranopia (déficit de verde)">Deut.</button>
        <button type="button" class="pb-a11y-btn" data-color-mode="protanopia"
          aria-pressed="false" title="Simular protanopia (déficit de rojo)">Prot.</button>
        <button type="button" class="pb-a11y-btn" data-color-mode="achromatopsia"
          aria-pressed="false" title="Simular achromatopsia (monocromático)">Achr.</button>
        <button type="button" class="pb-a11y-btn" data-color-mode="highcontrast"
          aria-pressed="false" title="Alto contraste WCAG AAA">⬛ Contraste</button>
        <!-- Control de fuente -->
        <div class="pb-font-controls" role="group" aria-label="Tamaño de fuente">
          <button type="button" class="pb-font-btn" data-font-action="decrease"
            aria-label="Reducir tamaño de fuente">A−</button>
          <span class="pb-font-display" aria-live="polite" aria-atomic="true">100%</span>
          <button type="button" class="pb-font-btn" data-font-action="increase"
            aria-label="Aumentar tamaño de fuente">A+</button>
          <button type="button" class="pb-font-btn" data-font-action="reset"
            aria-label="Restablecer tamaño de fuente" title="Restablecer">↺</button>
        </div>
        <!-- Buscador global -->
        <button type="button" class="pb-a11y-btn" id="gsOpenBtn"
          data-action="openGlobalSearch"
          aria-label="Buscador global (Ctrl+K)" title="Buscar en todo el atlas (Ctrl+K)">
          🔍 Buscar
        </button>
      </div>`;
  }

  /**
   * Inyecta el toolbar en el DOM. Busca el contenedor de configuración
   * (ya existente en el atlas) y lo añade al final.
   */
  function injectA11yToolbar() {
    if (document.getElementById('pb-a11y-toolbar-root')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'pb-a11y-toolbar-root';
    wrapper.classList.add('pb-r74-a11y-toolbar-root');
    wrapper.innerHTML = buildA11yToolbarHTML();
    document.body.appendChild(wrapper);
    log('Toolbar de accesibilidad inyectado');
  }

  /* ══════════════════════════════════════════════════════════════════════
     HTML DEL MODAL DE BÚSQUEDA GLOBAL
     ════════════════════════════════════════════════════════════════════ */
  const GLOBAL_SEARCH_MODAL_HTML = `
    <div id="globalSearchModal" class="modal-overlay" role="dialog" aria-modal="true"
         aria-labelledby="gs-modal-title" aria-hidden="true">
      <div class="modal-content pb-r70-gen-929d80f9da" >
        <div class="pb-r70-gen-0df5714428" >
          <label for="gsInput" id="gs-modal-title" class="sr-only">Buscar en todo el atlas</label>
          <div class="pb-r70-gen-381a6851c0" >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-sec)"
                 stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input class="pb-r70-gen-f8e2076ecf" type="search" id="gsInput" placeholder="Buscar taxón, vista, término del glosario…"
              autocomplete="off" spellcheck="false"
              
              role="combobox" aria-expanded="false" aria-controls="gs-listbox"
              aria-autocomplete="list">
            <kbd class="pb-r70-gen-bde3f2a0cd" >Esc</kbd>
          </div>
          <p class="pb-r70-gen-95eab2024f" id="gs-help" >
            Busca entre taxones, vistas y términos del glosario. ↑↓ para navegar · Enter para abrir.
          </p>
        </div>
        <div class="pb-r70-gen-87a405f50f" id="gs-listbox" role="listbox" aria-label="Resultados de búsqueda"
             >
          <div class="gs-empty pb-r70-gen-f39dbce771" >
            <span class="pb-r70-gen-09e09f26aa" >🔍</span>
            <p class="pb-r70-gen-d2bfa8a65d" >Empieza a escribir para buscar en el atlas</p>
          </div>
        </div>
        <div class="pb-r70-gen-d102e94ff8" >
          <span class="pb-r70-gen-03d0678928" >
            <kbd class="pb-r70-gen-559f0bfb01" >↑↓</kbd> navegar ·
            <kbd class="pb-r70-gen-559f0bfb01" >Enter</kbd> abrir
          </span>
          <button class="pb-r70-gen-28866fa8b7" type="button" data-modal-toggle="globalSearchModal"
            >✕ Cerrar</button>
        </div>
      </div>
    </div>
    <link rel="stylesheet" href="assets/css/00-core/026-style.css">`;

  /* ══════════════════════════════════════════════════════════════════════
     INICIALIZACIÓN Y EVENT LISTENERS
     ════════════════════════════════════════════════════════════════════ */

  let _gsResults = [];
  let _gsFocus   = -1;

  function initGlobalSearchEvents() {
    // Recovery R14: si v86 está cargado, v63 conserva UI, índice y fallback,
    // pero no registra listeners de resultados. Así evitamos doble activación.
    if (window.PaleoBotV86GlobalSearchFinal) {
      document.documentElement.dataset.paleobotSearchEventOwner = 'v86';
      return;
    }

    const input   = document.getElementById('gsInput');
    const listbox = document.getElementById('gs-listbox');
    if (!input || !listbox) return;

    let _debounce = null;
    input.addEventListener('input', () => {
      clearTimeout(_debounce);
      _debounce = setTimeout(() => {
        const q = input.value.trim();
        _gsResults = search(q);
        _gsFocus   = -1;
        input.setAttribute('aria-expanded', String(_gsResults.length > 0));
        listbox.innerHTML = q.length >= 2
          ? renderSearchResults(_gsResults, q)
          : listbox.innerHTML; // mantener estado vacío inicial
        if (q.length < 2) {
          listbox.innerHTML = `<div class="gs-empty pb-r70-gen-c65d995a9f" >
            <span class="pb-r70-gen-09e09f26aa" >🔍</span>
            <p class="pb-r70-gen-f04a70697f" >Sigue escribiendo…</p>
          </div>`;
        }
      }, 150);
    });

    // Navegación por teclado
    input.addEventListener('keydown', (e) => {
      const items = listbox.querySelectorAll('.gs-result');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        _gsFocus = Math.min(_gsFocus + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        _gsFocus = Math.max(_gsFocus - 1, 0);
      } else if (e.key === 'Enter' && _gsFocus >= 0 && _gsResults[_gsFocus]) {
        e.preventDefault();
        activateResult(_gsResults[_gsFocus]);
        return;
      } else if (e.key === 'Escape') {
        closeGlobalSearch(); return;
      } else { return; }
      // Actualizar aria-selected y foco visual
      items.forEach((item, i) => {
        const sel = i === _gsFocus;
        item.setAttribute('aria-selected', String(sel));
        if (sel) { item.scrollIntoView({ block: 'nearest' }); }
      });
    });

    // Clic en resultado
    listbox.addEventListener('click', (e) => {
      const btn = e.target.closest('.gs-result');
      if (!btn) return;
      const idx = parseInt(btn.dataset.gsIndex, 10);
      if (_gsResults[idx]) activateResult(_gsResults[idx]);
    });
  }

  function activateResult(result) {
    closeGlobalSearch();
    try { result.action(); } catch(e) { /* recuperable */ }
  }

  function init() {
    // Inyectar filtros SVG y estilos
    injectColorFilters();

    // Inyectar modal de búsqueda global
    if (!document.getElementById('globalSearchModal')) {
      document.body.insertAdjacentHTML('beforeend', GLOBAL_SEARCH_MODAL_HTML);
    }

    // Inyectar toolbar de accesibilidad
    injectA11yToolbar();

    // Inicializar eventos del buscador
    initGlobalSearchEvents();

    // Restaurar preferencias guardadas
    restoreColorMode();
    restoreFontScale();

    // Handler delegado para toolbar (color + fuente + buscador)
    document.addEventListener('click', (e) => {
      // Modo de color
      const colorBtn = e.target.closest('[data-color-mode]');
      if (colorBtn) { setColorMode(colorBtn.dataset.colorMode); return; }
      // Tamaño de fuente
      const fontBtn = e.target.closest('[data-font-action]');
      if (fontBtn) {
        const action = fontBtn.dataset.fontAction;
        if (action === 'increase') increaseFontSize();
        else if (action === 'decrease') decreaseFontSize();
        else if (action === 'reset') resetFontSize();
        return;
      }
      // Buscador global
      if (e.target.closest('[data-action="openGlobalSearch"]') ||
          e.target.closest('#gsOpenBtn')) {
        openGlobalSearch(); return;
      }
      // Cerrar buscador con backdrop
      const gsModal = document.getElementById('globalSearchModal');
      if (gsModal && e.target === gsModal) { closeGlobalSearch(); return; }
    }, false);

    // Ctrl+K / Cmd+K para abrir buscador
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        _searchOpen ? closeGlobalSearch() : openGlobalSearch();
      }
    });

    // Registrar acciones en PaleoBotBus
    if (window.PaleoBotBus) {
      window.PaleoBotBus.registerAction('openGlobalSearch', openGlobalSearch);
      window.PaleoBotBus.registerExtension('accessibility', 'v63',
        'Daltonismo (deuteranopia/protanopia/achromatopsia) · escala de fuente · buscador global Ctrl+K');
    }

    // Registrar openGlobalSearch en el contrato de acciones
    if (typeof window.getActionContractMap === 'function') {
      const orig = window.getActionContractMap;
      window.getActionContractMap = function() {
        const map = orig();
        map.openGlobalSearch = openGlobalSearch;
        return map;
      };
    }

    // Exponer API pública
    window.openGlobalSearch = openGlobalSearch;
    window.setColorMode     = setColorMode;
    window.increaseFontSize = increaseFontSize;
    window.decreaseFontSize = decreaseFontSize;
    window.resetFontSize    = resetFontSize;

    document.documentElement.dataset.paleobotV63 = 'ready';
    log('PaleoBot v63 inicializado: daltonismo · fuente · buscador global');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }

  window.PaleoBotV63 = {
    setColorMode, increaseFontSize, decreaseFontSize, resetFontSize,
    openGlobalSearch, closeGlobalSearch, search, buildSearchIndex,
    version: '63.0.0'
  };

})();
