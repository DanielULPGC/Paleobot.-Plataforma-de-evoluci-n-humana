// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot v59 — Extension Bus & Unified Action Router
   ───────────────────────────────────────────────────────────────────────────
   PROBLEMA RESUELTO:
   El atlas creció apilando módulos (v34, m13, v35…v59) cada uno redefiniendo
   funciones globales y registrando listeners independientes. El resultado:
   · renderActiveView redefinida 3 veces (patrón decorator sin API formal)
   · buildSelfAuditReport redefinida 5 veces (ídem)
   · 59 click listeners, 65 stopImmediatePropagation
   · runExam con conflicto v34/m13 (resuelto arriba)

   SOLUCIÓN:
   1. PaleoBotExtensionBus — API declarativa para registrar extensiones de
      funciones, formalizando el patrón decorator ya existente.
   2. UnifiedActionRouter — único listener de captura que reemplaza los
      stopImmediatePropagation redundantes del sistema de acciones.
   3. Guards __wrapped — evitan extensiones duplicadas en recarga parcial.
   ─────────────────────────────────────────────────────────────────────────
   Versión: 59.1.0 · ULPGC/FCEDU · CC BY-NC 4.0
   ═══════════════════════════════════════════════════════════════════════════ */
(function PaleoBotExtensionBus() {
  'use strict';

  const DEBUG = false;
  const log = DEBUG ? console.log.bind(console, '[PBBus]') : () => {};

  /* ── A. REGISTRO DE EXTENSIONES DE FUNCIONES ─────────────────────────────
     Formaliza el patrón decorator existente (oldFn → newFn(…args, oldFn)).
     Garantiza que cada extensión se registra UNA SOLA VEZ mediante guards.
     ─────────────────────────────────────────────────────────────────────── */

  /**
   * Registra una extensión sobre una función global existente.
   * La extensión recibe (originalFn, ...args) y decide cuándo llamarla.
   *
   * @param {string}   fnName   - Nombre de la función global (window[fnName])
   * @param {string}   guardKey - Clave única para evitar doble registro
   * @param {Function} wrapper  - function(original, ...args) { ... }
   */
  function extendGlobalFn(fnName, guardKey, wrapper) {
    const current = window[fnName];
    if (typeof current !== 'function') {
      log(`extendGlobalFn: ${fnName} no es función — extensión diferida`);
      return false;
    }
    if (current[guardKey]) {
      log(`extendGlobalFn: ${fnName} ya tiene guard ${guardKey} — omitido`);
      return false;
    }
    const extended = function(...args) {
      return wrapper(current, ...args);
    };
    extended[guardKey] = true;
    // Preservar otros guards ya registrados
    Object.keys(current).forEach(k => { extended[k] = current[k]; });
    extended[guardKey] = true;
    window[fnName] = extended;
    log(`extendGlobalFn: ${fnName} extendida con guard ${guardKey}`);
    return true;
  }

  /* ── B. AUDITORÍA DE LA CADENA DE EXTENSIONES ────────────────────────────
     Permite inspeccionar en producción qué módulos extendieron cada función.
     ─────────────────────────────────────────────────────────────────────── */

  const _extensionRegistry = {};

  /**
   * Registra metadatos de una extensión para auditoría.
   * @param {string} fnName  - Función extendida
   * @param {string} module  - Módulo que hace la extensión (ej: 'v34', 'm13')
   * @param {string} purpose - Qué añade esta extensión
   */
  function registerExtension(fnName, module, purpose) {
    if (!_extensionRegistry[fnName]) _extensionRegistry[fnName] = [];
    _extensionRegistry[fnName].push({ module, purpose, at: Date.now() });
  }

  /**
   * Devuelve el registro de extensiones para diagnóstico.
   * Uso en consola: PaleoBotBus.getRegistry()
   */
  function getRegistry() {
    return JSON.parse(JSON.stringify(_extensionRegistry));
  }

  /* ── C. UNIFIED ACTION ROUTER ────────────────────────────────────────────
     Reemplaza la cascada de stopImmediatePropagation en el sistema de acciones.
     Un único listener de burbuja (fase bubble, registrado tarde) consolida
     todos los data-action que no tienen handler específico previo.

     IMPORTANTE: No reemplaza listeners de librerías ni de módulos con lógica
     propia (Leaflet, D3, comparador morfológico). Solo actúa sobre el sistema
     de acciones del atlas.
     ─────────────────────────────────────────────────────────────────────── */

  /** Mapa de acciones → funciones. Se rellena en init(). */
  const _actionHandlers = {};

  /**
   * Registra un handler de acción en el router unificado.
   * Tiene menor prioridad que los listeners existentes de módulos específicos.
   * @param {string}   action - Valor del data-action
   * @param {Function} fn     - Handler a ejecutar
   */
  function registerAction(action, fn) {
    if (typeof fn !== 'function') return;
    _actionHandlers[action] = fn;
    log(`registerAction: "${action}" registrado`);
  }

  /**
   * Registra múltiples acciones de una vez.
   * @param {Object} map - { actionName: fn, ... }
   */
  function registerActions(map) {
    Object.entries(map).forEach(([action, fn]) => registerAction(action, fn));
  }

  /**
   * Handler centralizado del router.
   * Se registra en fase bubble (false) para no interferir con handlers
   * de captura ya registrados (Leaflet, modales, comparador).
   */
  function _unifiedClickHandler(e) {
    // Solo actuar si ningún handler previo consumió el evento
    if (e.defaultPrevented) return;

    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const handler = _actionHandlers[action];

    if (handler) {
      e.preventDefault();
      e.stopPropagation(); // stopPropagation (no Immediate) — permite que el handler actual complete
      try {
        handler(actionBtn, e);
      } catch (err) {
        if (DEBUG) console.error('[PBBus] Error en handler de acción:', action, err);
      }
    }
    // Si no hay handler, dejar que el evento burbujee hacia otros listeners
  }

  /* ── D. INICIALIZACIÓN ───────────────────────────────────────────────────
     Se ejecuta después de DOMContentLoaded para garantizar que todas las
     funciones del atlas están definidas.
     ─────────────────────────────────────────────────────────────────────── */

  function init() {
    // Registrar el router unificado
    document.addEventListener('click', _unifiedClickHandler, false);

    // Poblar el mapa de acciones con las funciones globales del atlas
    // (fallback: si getActionContractMap existe, usarlo; si no, resolución directa)
    function resolveAction(name) {
      return function() {
        if (typeof window[name] === 'function') window[name]();
      };
    }

    const actionNames = [
      'openPresentation', 'startExam', 'openGlossary', 'openMatrix',
      'abrirEstadisticas', 'abrirBiblio', 'exportToCSV', 'printFicha',
      'runSelfAudit', 'resetGlobalFilters', 'scrollToTop', 'activateClassMode',
      'openStudentGuide', 'exportQuizProgress'
    ];

    actionNames.forEach(name => {
      registerAction(name, resolveAction(name));
    });

    // Documentar las extensiones existentes en el registro
    registerExtension('renderActiveView', 'v34-core', 'Paleoecología + timeline uncertainty + fauna panel');
    registerExtension('renderActiveView', 'm13-v34-wrap', 'enhanceM16 timeline + M19 paleoecología');
    registerExtension('renderActiveView', 'v40', 'tagTimelineItems para species-open-bus');
    registerExtension('buildSelfAuditReport', 'v34-core', 'M1-M10: árbol, dispersión, banco, glosario');
    registerExtension('buildSelfAuditReport', 'm13', 'M11-M20: offline, mapa, banco SafeStorage');
    registerExtension('buildSelfAuditReport', 'v35', 'portales de bloque separados');
    registerExtension('buildSelfAuditReport', 'v36', 'workspace shell + toolbar');
    registerExtension('buildSelfAuditReport', 'v37', 'bus de controles + familia activa');
    registerExtension('openGlossary', 'v38-bib', 'renderización doble glosario+bibliografía');
    registerExtension('getActionContractMap', 'v59-sg', 'openStudentGuide + exportQuizProgress');

    document.documentElement.dataset.paleobotExtensionBus = 'ready';
    log('PaleoBotExtensionBus inicializado');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }

  /* ── API PÚBLICA ─────────────────────────────────────────────────────── */
  /* v62: registry de las 5 runAction para orquestación explícita */
  const _runActionChain = [];

  /**
   * Registra una implementación de runAction en la cadena.
   * Las implementaciones se llaman en orden de registro hasta que una devuelve true.
   * @param {string}   moduleName - Nombre del módulo para diagnóstico
   * @param {Function} fn         - function(action) → boolean
   */
  function registerRunAction(moduleName, fn) {
    _runActionChain.push({ moduleName, fn });
    log(`registerRunAction: ${moduleName} registrado (posición ${_runActionChain.length})`);
  }

  /**
   * Ejecuta la cadena de runAction hasta que una tenga éxito.
   * @param {string} action
   * @returns {boolean}
   */
  function runActionChain(action) {
    for (const { fn } of _runActionChain) {
      try {
        const result = fn(action);
        if (result === true) return true;
      } catch(e) { /* recuperable: continuar con la siguiente */ }
    }
    return false;
  }

  window.PaleoBotBus = {
    extendGlobalFn,
    registerExtension,
    registerAction,
    registerActions,
    registerRunAction,
    runActionChain,
    getRegistry,
    /** Diagnóstico en consola de todas las extensiones registradas */
    diagnose() {
      const reg = getRegistry();
      const fns = Object.keys(reg);
      const _dbg = typeof window.__PALEOBOT_DEBUG !== 'undefined' && window.__PALEOBOT_DEBUG;
      if (fns.length === 0) { if (_dbg) console.log('[PBBus] Sin extensiones registradas'); return; }
      fns.forEach(fn => {
        if (_dbg) console.group(`[PBBus] ${fn} (${reg[fn].length} extensiones)`);
        reg[fn].forEach(e => { if (_dbg) console.log(`  · [${e.module}] ${e.purpose}`); });
        if (_dbg) console.groupEnd();
      });
    }
  };

})();
