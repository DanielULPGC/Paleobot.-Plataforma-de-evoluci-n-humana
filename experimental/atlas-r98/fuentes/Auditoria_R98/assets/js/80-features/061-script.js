// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot v65 — Fase 4 SDD: InlineFormativeFeedback
   ──────────────────────────────────────────────────────────────────────────
   Ticket de salida interactivo integrado en la ficha de especie.

   QUÉ HACE:
     · Detecta cuando se abre una ficha de especie (CustomEvent o
       MutationObserver sobre #detailView.active)
     · Inyecta, AL FINAL del pane-gen activo, un bloque de respuesta
       libre (textarea) anclado al ticket de salida ya existente
     · Autoguarda en PaleoBotStorage con clave 'pb_iff_{spId}'
     · Marca la ficha como "respondida" con un badge visual
     · Extiende la exportación de síntesis de Fase 3 con las respuestas
     · Extiende buildSelfAuditReport() con cobertura de respuestas

   ARQUITECTURA:
     · Patrón no-destructivo: no modifica renderSpeciesExitTicket()
       ni renderStudentNotesPanel(); se añade DESPUÉS de ellos en el DOM
     · PaleoBotStorage persistente con fallback de sesión y memoria
     · MutationObserver sobre #detailView para detectar apertura de ficha
     · CustomEvent 'paleobot:speciesopen' (se dispara si existe en v65)

   DEPENDENCIAS:
     · window.PB_DidacticSpec  (Fase 1)
     · Fase 3 (enriquece _exportSessionSynthesis vía hook)
     · window.PaleoBotStorage (adaptador canónico R60)
     · escapeHtmlText(), safeDomIdPart() (funciones existentes)
     · CustomEvent 'paleobot:viewchange' ya existe
   ═══════════════════════════════════════════════════════════════════════════ */
(function PaleoBotV65_Phase4() {
  'use strict';

  const DEBUG = false;
  const log  = DEBUG ? console.log.bind(console,  '[PB65-P4]') : () => {};
  const warn = DEBUG ? console.warn.bind(console, '[PB65-P4]') : () => {};

  /* ── Guard ───────────────────────────────────────────────────────────── */
  function _waitForSpec(cb, tries) {
    if (window.PB_DidacticSpec) { cb(); return; }
    if ((tries || 0) > 40) { warn('Spec no disponible'); return; }
    setTimeout(() => _waitForSpec(cb, (tries || 0) + 1), 100);
  }

  /* ══════════════════════════════════════════════════════════════════════
     A. PERSISTENCIA — PaleoBotStorage local-only con degradación
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * Clave de almacenamiento para la respuesta del ticket de una especie.
   * @param {string} spId
   * @returns {string}
   */
  function _iffKey(spId) {
    return 'pb_iff_' + spId.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Guarda la respuesta del ticket de salida.
   * Cascada: PaleoBotStorage persistente → sesión → memoria gestionada por el adaptador.
   * @param {string} spId
   * @param {string} text
   * @param {string} level — nivel seleccionado ('sec'|'bach'|'uni')
   */
  function _saveTicket(spId, text, level) {
    const payload = JSON.stringify({
      text:    text,
      level:   level,
      spId:    spId,
      updated: new Date().toISOString()
    });
    const key = _iffKey(spId);
    const storage = window.PaleoBotStorage;
    if (!storage) return false;
    const persistent = storage.setPersistent(key, payload) === true;
    if (!persistent) storage.setSession(key, payload);
    log('Ticket guardado para:', spId, '| nivel:', level, '| chars:', text.length);
    return persistent;
  }

  /**
   * Carga la respuesta guardada.
   * @param {string} spId
   * @returns {{text:string, level:string, updated:string}|null}
   */
  function _loadTicket(spId) {
    const key = _iffKey(spId);
    try {
      const storage = window.PaleoBotStorage;
      if (!storage) return null;
      const raw = storage.getPersistent(key, null) || storage.getSession(key, null);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function _clearTicket(spId) {
    const key = _iffKey(spId);
    const storage = window.PaleoBotStorage;
    if (!storage) return;
    storage.removePersistent(key);
    storage.removeSession(key);
  }

  /**
   * Retorna todas las respuestas guardadas (para exportación en Fase 3).
   * @returns {Array.<{spId:string, text:string, level:string, updated:string}>}
   */
  function getAllTickets() {
    const results = [];
    try {
      const storage = window.PaleoBotStorage;
      if (!storage) return results;
      const keys = [...new Set([
        ...storage.persistentKeys('pb_iff_'),
        ...storage.sessionKeys('pb_iff_')
      ])];

      keys.forEach(k => {
        try {
          const raw = storage.getPersistent(k, null) || storage.getSession(k, null);
          if (raw) {
            const d = JSON.parse(raw);
            if (d && d.text && d.text.trim()) results.push(d);
          }
        } catch (_) { /* entrada corrupta — ignorar */ }
      });
    } catch (err) {
      warn('Error al recuperar todos los tickets:', err);
    }
    return results;
  }

  function _clearVisibleTickets() {
    document.querySelectorAll('.pb-iff-block').forEach(block => {
      const textarea = block.querySelector('.pb-iff-textarea');
      const charCount = block.querySelector('.pb-iff-char-count');
      const status = block.querySelector('.pb-iff-status');
      const title = block.querySelector('.pb-iff-title');
      if (textarea) textarea.value = '';
      if (charCount) charCount.textContent = '0 caracteres';
      if (status) status.textContent = '';
      title?.querySelector('.pb-iff-done-badge')?.remove();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     B. CONSTRUCCIÓN DEL BLOQUE DE RESPUESTA
     ══════════════════════════════════════════════════════════════════════ */

  const LEVEL_LABELS = {
    /* R93: niveles de Secundaria y Bachillerato retirados (atlas universitario). */
    uni:  { label: 'Universitario', color: '#6b3faa', hint: 'Comparación crítica con otro taxón: criterios equivalentes e incertidumbre.' }
  };

  /**
   * Inyecta el bloque de respuesta del ticket en el pane-gen de la ficha activa.
   * Si ya existe, lo actualiza.
   * @param {string} spId
   * @param {string} spNombre
   */
  function _injectTicketResponse(spId, spNombre) {
    const paneGen = document.getElementById('pane-gen');
    if (!paneGen) { warn('pane-gen no encontrado para:', spId); return; }

    /* Eliminar bloque anterior si existe */
    paneGen.querySelector('.pb-iff-block')?.remove();

    /* Cargar respuesta previa */
    const saved   = _loadTicket(spId);
    const text    = saved?.text  || '';
    const level   = LEVEL_LABELS[saved?.level] ? saved.level : 'uni';
    const updated = saved?.updated || null;
    const hasText = text.trim().length > 0;

    /* DOM id seguros */
    const domId = typeof safeDomIdPart === 'function'
      ? safeDomIdPart(spId) : spId.replace(/[^a-zA-Z0-9_-]/g, '_');

    const _esc = typeof escapeHtmlText === 'function' ? escapeHtmlText : s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    /* ── Construir bloque ──────────────────────────────────────────────── */
    const block = document.createElement('section');
    block.className = 'pb-iff-block data-section';
    block.setAttribute('aria-labelledby', `pb-iff-title-${domId}`);

    /* Cabecera */
    const header = document.createElement('div');
    header.className = 'pb-iff-header';

    const titleEl = document.createElement('h4');
    titleEl.id = `pb-iff-title-${domId}`;
    titleEl.className = 'pb-iff-title';
    titleEl.innerHTML = `
      <span aria-hidden="true">✏️</span>
      Mi respuesta al ticket de salida
      ${hasText ? `<span class="pb-iff-done-badge" aria-label="Respondido">✓ respondido</span>` : ''}`;

    const hintEl = document.createElement('p');
    hintEl.className = 'pb-iff-hint';
    hintEl.id = `pb-iff-hint-${domId}`;
    hintEl.textContent = LEVEL_LABELS[level]?.hint || LEVEL_LABELS.uni.hint;

    header.appendChild(titleEl);
    header.appendChild(hintEl);

    /* Selector de nivel */
    const levelRow = document.createElement('div');
    levelRow.className = 'pb-iff-level-row';
    levelRow.setAttribute('role', 'group');
    levelRow.setAttribute('aria-label', 'Selecciona el nivel del ticket de salida');

    Object.entries(LEVEL_LABELS).forEach(([key, meta]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pb-iff-level-btn' + (key === level ? ' pb-iff-level-btn--active' : '');
      btn.dataset.iffLevel = key;
      window.PaleoBotDynamicStyle.set(btn, `--iff-level-color:${meta.color}`, 'iff-level-color');
      if (key === level) {
        btn.setAttribute('aria-pressed', 'true');
        // R75: border/color derive from --iff-level-color + active class.
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
      btn.textContent = meta.label;
      levelRow.appendChild(btn);
    });

    /* Textarea */
    const textareaWrap = document.createElement('div');
    textareaWrap.className = 'pb-iff-textarea-wrap';

    const textarea = document.createElement('textarea');
    textarea.id = `pb-iff-textarea-${domId}`;
    textarea.className = 'pb-iff-textarea';
    textarea.setAttribute('aria-label', `Respuesta al ticket de salida para ${_esc(spNombre)}`);
    textarea.setAttribute('aria-describedby', `pb-iff-hint-${domId}`);
    textarea.setAttribute('placeholder', 'Escribe aquí tu respuesta al nivel seleccionado…\n\nRecuerda: usa datos del atlas, no opiniones. Distingue dato, inferencia y límite.');
    textarea.setAttribute('rows', '5');
    textarea.value = text;

    /* Barra de acciones */
    const actions = document.createElement('div');
    actions.className = 'pb-iff-actions';

    const charCount = document.createElement('span');
    charCount.className = 'pb-iff-char-count';
    charCount.id = `pb-iff-chars-${domId}`;
    charCount.setAttribute('aria-live', 'polite');
    charCount.setAttribute('aria-atomic', 'true');
    charCount.textContent = text.length + ' caracteres';

    const statusEl = document.createElement('span');
    statusEl.className = 'pb-iff-status';
    statusEl.id = `pb-iff-status-${domId}`;
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.textContent = updated
      ? '✓ guardado ' + new Date(updated).toLocaleDateString('es-ES', { day:'2-digit', month:'short' })
      : '';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'pb-iff-save-btn';
    saveBtn.dataset.iffSave = spId;
    saveBtn.setAttribute('aria-label', 'Guardar respuesta del ticket de salida');
    saveBtn.textContent = 'Guardar respuesta';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'pb-iff-clear-btn';
    clearBtn.dataset.iffClear = spId;
    clearBtn.setAttribute('aria-label', 'Borrar respuesta del ticket de salida');
    clearBtn.textContent = 'Borrar';

    actions.appendChild(charCount);
    actions.appendChild(statusEl);
    actions.appendChild(clearBtn);
    actions.appendChild(saveBtn);

    textareaWrap.appendChild(textarea);
    textareaWrap.appendChild(actions);

    /* Criterio de éxito desde el spec (si existe) */
    const currentView = _getCurrentViewId();
    const spec = currentView ? window.PB_DidacticSpec.getViewSpec(currentView) : null;
    let criterioEl = null;
    if (spec?.criterioExito) {
      criterioEl = document.createElement('div');
      criterioEl.className = 'pb-iff-criterio';
      const cLabel = document.createElement('strong');
      cLabel.textContent = 'Criterio de éxito de esta vista: ';
      const cText = document.createTextNode(spec.criterioExito);
      criterioEl.appendChild(cLabel);
      criterioEl.appendChild(cText);
    }

    /* Ensamblar */
    block.appendChild(header);
    block.appendChild(levelRow);
    block.appendChild(textareaWrap);
    if (criterioEl) block.appendChild(criterioEl);

    /* Insertar: al final del pane-gen, después de .species-exit-ticket si existe */
    const exitTicket = paneGen.querySelector('.species-exit-ticket');
    if (exitTicket && exitTicket.nextSibling) {
      paneGen.insertBefore(block, exitTicket.nextSibling);
    } else if (exitTicket) {
      paneGen.appendChild(block);
    } else {
      paneGen.appendChild(block);
    }

    /* ── Eventos del bloque ──────────────────────────────────────────── */
    let _currentLevel = level;
    let _autoSaveTimer = null;

    /* Selector de nivel */
    levelRow.addEventListener('click', e => {
      const btn = e.target.closest('[data-iff-level]');
      if (!btn) return;
      _currentLevel = btn.dataset.iffLevel;
      levelRow.querySelectorAll('[data-iff-level]').forEach(b => {
        const isActive = b.dataset.iffLevel === _currentLevel;
        b.classList.toggle('pb-iff-level-btn--active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
        // R75: the active class consumes the per-button --iff-level-color token.
      });
      hintEl.textContent = LEVEL_LABELS[_currentLevel]?.hint || '';
      /* Autoguardar al cambiar nivel si hay texto */
      if (textarea.value.trim()) {
        _autoSave();
      }
    });

    /* Textarea: actualizar contador + autoguardar */
    textarea.addEventListener('input', () => {
      charCount.textContent = textarea.value.length + ' caracteres';
      clearTimeout(_autoSaveTimer);
      _autoSaveTimer = setTimeout(() => _autoSave(), 1400);
    });

    /* Botón guardar */
    saveBtn.addEventListener('click', () => {
      _doSave(spId, domId, textarea, _currentLevel, statusEl, titleEl);
    });

    /* Botón borrar */
    clearBtn.addEventListener('click', () => {
      if (textarea.value.trim() === '') return;
      if (!confirm(`¿Borrar la respuesta guardada para ${spNombre}?`)) return;
      textarea.value = '';
      charCount.textContent = '0 caracteres';
      _clearTicket(spId);
      statusEl.textContent = 'Respuesta borrada.';
      /* Quitar badge */
      titleEl.querySelector('.pb-iff-done-badge')?.remove();
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    });

    function _autoSave() {
      if (!textarea.value.trim()) return;
      _doSave(spId, domId, textarea, _currentLevel, statusEl, titleEl, true);
    }

    log('Bloque de respuesta inyectado para:', spId);
  }

  /* ── Guarda y actualiza UI ─────────────────────────────────────────── */
  function _doSave(spId, domId, textarea, level, statusEl, titleEl, isAuto) {
    const text = textarea.value;
    _saveTicket(spId, text, level);

    /* Actualizar estado */
    statusEl.textContent = isAuto ? '✓ autoguardado' : '✓ guardado';
    window.PaleoBotStyleState.token(statusEl, 'pb-r69-status-success', true);
    setTimeout(() => { statusEl.textContent = ''; window.PaleoBotStyleState.token(statusEl, 'pb-r69-status-success', false); }, 2200);

    /* Añadir badge si hay texto */
    if (text.trim() && !titleEl.querySelector('.pb-iff-done-badge')) {
      const badge = document.createElement('span');
      badge.className = 'pb-iff-done-badge';
      badge.setAttribute('aria-label', 'Respondido');
      badge.textContent = '✓ respondido';
      titleEl.appendChild(badge);
    } else if (!text.trim()) {
      titleEl.querySelector('.pb-iff-done-badge')?.remove();
    }

    /* Notificar a Fase 3 para que actualice el badge del FAB si está activa */
    try {
      document.dispatchEvent(new CustomEvent('paleobot:iff:saved', {
        detail: { spId, level, chars: text.length }
      }));
    } catch (_) { /* Android WebView antiguo — silencioso */ }

    log('Guardado', isAuto ? '(auto)' : '(manual)', 'para:', spId, '| chars:', text.length);
  }

  /* ── Detecta la vista activa para extraer el criterioExito ─────────── */
  function _getCurrentViewId() {
    try {
      const active = document.querySelector('.view-section.active');
      return active?.id?.replace(/^view-/, '') || null;
    } catch (_) { return null; }
  }

  /* ══════════════════════════════════════════════════════════════════════
     C. DETECTOR DE APERTURA DE FICHA
     ──────────────────────────────────────────────────────────────────────
     Observa #detailView para detectar cuándo se activa una ficha y
     extrae el sp.id desde el panel o desde el evento.
     ══════════════════════════════════════════════════════════════════════ */

  let _lastInjectedSpId = null;
  let _observer         = null;

  function _extractCurrentSpId() {
    /* Método 1: data attribute en el detailView */
    const panel = document.getElementById('detailView');
    if (!panel) return null;
    if (panel.dataset.currentSp) return panel.dataset.currentSp;

    /* Método 2: currentSpecies global */
    if (typeof currentSpecies !== 'undefined' && currentSpecies?.id) {
      return currentSpecies.id;
    }

    /* Método 3: botón de cierre con data-sp */
    const closeBtn = panel.querySelector('[data-panel-close][data-sp]');
    if (closeBtn?.dataset.sp) return closeBtn.dataset.sp;

    /* Método 4: título h2 en el panel (último recurso) */
    const h2 = panel.querySelector('.panel-header h2, .panel-header-text h2');
    if (h2?.textContent) {
      /* Buscar por nombre en DB_INDEX */
      if (typeof DB_INDEX !== 'undefined') {
        const nombre = h2.textContent.trim();
        const sp = Object.values(DB_INDEX).find(s => s.nombre === nombre);
        if (sp) return sp.id;
      }
    }
    return null;
  }

  function _extractSpNombre(spId) {
    if (!spId) return spId;
    if (typeof DB_INDEX !== 'undefined' && DB_INDEX[spId]) {
      return DB_INDEX[spId].nombre || spId;
    }
    if (typeof currentSpecies !== 'undefined' && currentSpecies?.id === spId) {
      return currentSpecies.nombre || spId;
    }
    return spId;
  }

  function _onDetailPanelChange() {
    const panel = document.getElementById('detailView');
    if (!panel || !panel.classList.contains('active')) return;

    const spId = _extractCurrentSpId();
    if (!spId || spId === _lastInjectedSpId) return;

    /* Esperar al render completo del pane-gen */
    setTimeout(() => {
      try {
        const pane = document.getElementById('pane-gen');
        if (!pane) return;
        _lastInjectedSpId = spId;
        _injectTicketResponse(spId, _extractSpNombre(spId));
      } catch (err) {
        warn('Error al inyectar bloque de respuesta:', err);
      }
    }, 260);
  }

  function _initObserver() {
    const panel = document.getElementById('detailView');
    if (!panel) { warn('#detailView no encontrado'); return; }

    _observer = new MutationObserver(_onDetailPanelChange);
    _observer.observe(panel, {
      attributes: true,
      attributeFilter: ['class', 'data-current-sp']
    });

    /* También escuchar eventos de apertura si los hay */
    document.addEventListener('paleobot:speciesopen', e => {
      try {
        const spId   = e?.detail?.id;
        const nombre = e?.detail?.nombre || _extractSpNombre(spId);
        if (!spId) return;
        _lastInjectedSpId = null; /* forzar reinyección */
        setTimeout(() => {
          try { _injectTicketResponse(spId, nombre); }
          catch (err) { warn('Error en handler speciesopen:', err); }
        }, 300);
      } catch (err) { warn('Error en paleobot:speciesopen:', err); }
    });

    log('MutationObserver sobre #detailView inicializado.');
  }

  /* ══════════════════════════════════════════════════════════════════════
     D. HOOK EN FASE 3: enriquecer la exportación .txt
     ──────────────────────────────────────────────────────────────────────
     Si Fase 3 está activa, añade las respuestas de ticket a la
     exportación sin necesidad de modificar el código de Fase 3.
     Lo hace escuchando el evento 'paleobot:iff:saved' y también
     exponiendo getAllTickets() en window.PB_IFF para que Fase 3
     lo consuma en su próxima exportación.
     ══════════════════════════════════════════════════════════════════════ */

  function _hookPhase3Export() {
    /* Enriquecer _exportSessionSynthesis de Fase 3 si ya existe */
    if (window.PB_SSM_Export && typeof window.PB_SSM_Export.appendSection === 'function') {
      window.PB_SSM_Export.appendSection(() => {
        const tickets = getAllTickets();
        if (!tickets.length) return '';
        const lines = ['', '─'.repeat(52), 'TICKETS DE SALIDA RESPONDIDOS'];
        tickets.forEach(t => {
          const nombre = _extractSpNombre(t.spId);
          const levelLabel = LEVEL_LABELS[t.level]?.label || t.level;
          lines.push('');
          lines.push(`  Taxón: ${nombre}  [Nivel: ${levelLabel}]`);
          lines.push(`  Respondido: ${new Date(t.updated).toLocaleDateString('es-ES')}`);
          lines.push('  ' + t.text.replace(/\n/g, '\n  '));
        });
        return lines.join('\n');
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     E. EXTENSIÓN DEL AUDIT REPORT
     ══════════════════════════════════════════════════════════════════════ */

  function _extendAudit() {
    if (typeof buildSelfAuditReport !== 'function') return;
    const _orig = buildSelfAuditReport;
    buildSelfAuditReport = function () {
      const report = _orig();
      try {
        const tickets     = getAllTickets();
        const withContent = tickets.filter(t => t.text && t.text.trim().length >= 20);
        report.push({
          label: 'Tickets de salida (Fase 4 SDD)',
          status: 'ok',
          value: tickets.length
            ? `${tickets.length} respondidos · ${withContent.length} con respuesta sustancial (≥20 chars)`
            : 'Ningún ticket respondido aún en esta sesión'
        });
      } catch (_) { /* silencioso */ }
      return report;
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     F. CSS
     ══════════════════════════════════════════════════════════════════════ */

  function _injectStyles() {
    if (document.getElementById('pb-iff-style')) return;
    /* R67: CSS externalizado a assets/css/00-core/042-paleobot-r67-externalized-runtime-styles.css (pb-iff-style). */
  }

  /* ══════════════════════════════════════════════════════════════════════
     G. API PÚBLICA
     ══════════════════════════════════════════════════════════════════════ */

  window.PB_IFF = {
    /** Todas las respuestas guardadas (para Fase 3 y exportación) */
    getAllTickets,
    /** Carga la respuesta de un taxón concreto */
    loadTicket: _loadTicket,
    /** Borra la respuesta local de un taxón concreto */
    clearTicket: _clearTicket,
    /** Limpia el estado visible tras un borrado global */
    clearVisible: _clearVisibleTickets,
    /** Inyecta manualmente el bloque en una especie */
    injectFor:  _injectTicketResponse
  };

  document.addEventListener('paleobot:studentdata-cleared', _clearVisibleTickets);

  /* ══════════════════════════════════════════════════════════════════════
     H. INICIALIZACIÓN
     ══════════════════════════════════════════════════════════════════════ */

  function _init() {
    _injectStyles();
    _initObserver();
    _extendAudit();
    _hookPhase3Export();
    log('Fase 4 SDD inicializada.');
  }

  _waitForSpec(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _init);
    } else {
      _init();
    }
  });

})(); /* fin PaleoBotV65_Phase4 */
