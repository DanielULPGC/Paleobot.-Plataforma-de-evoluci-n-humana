// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v65-audit-fix
(function PaleoBotV65AuditFix() {
  'use strict';

  /* ── F02: Asegurar que runAdaptiveQuiz está en window ─────────────────── */
  /* Ya se registra en el módulo adaptativo, pero el guard defiende el caso  */
  /* de race condition donde el clic llega antes del módulo.                  */
  function _ensureAdaptiveQuiz() {
    if (typeof window.runAdaptiveQuiz === 'function') return; // ya OK
    // Fallback mínimo: abre el modal de examen en modo clásico
    window.runAdaptiveQuiz = function() {
      const examModal = document.getElementById('examModal');
      if (examModal && typeof window.startExam === 'function') {
        window.startExam();
      } else if (examModal) {
        examModal.classList.add('active');
        examModal.setAttribute('aria-hidden', 'false');
      }
    };
  }

  /* ── F03: setModal canónico final — consolida callbacks de render ──────── */
  /* Registrado al final: es la versión que gana. Incluye todos los efectos   */
  /* secundarios de las 4 versiones anteriores.                               */
  function _installCanonicalSetModal() {
    const _ACTION_TO_MODAL = {
      openGlossary:     'glossaryModal',
      openMatrix:       'matrixModal',
      startExam:        'examModal',
      abrirEstadisticas:'statsModal',
      abrirBiblio:      'biblioModal',
      openStudentGuide: 'studentGuideModal',
      openPresentation: null, // gestionado por su propio módulo
      runAdaptiveQuiz:  'examModal'  // F02: mapeo explícito
    };

    /**
     * setModal — versión canónica v65.1
     * @param {string} id   - ID del elemento modal
     * @param {boolean} open - true = abrir, false = cerrar
     */
    window.setModal = function setModal(id, open) {
      const modal = document.getElementById(id);
      if (!modal) return false;

      const wasOpen = modal.classList.contains('active');
      modal.classList.toggle('active', !!open);
      modal.setAttribute('aria-hidden', open ? 'false' : 'true');

      // Sincronizar body scroll-lock
      const anyOpen = Boolean(
        document.querySelector('.modal-overlay.active,.pb-v50-modal.active')
      );
      document.body.classList.toggle('modal-open', anyOpen);

      // Callbacks de render al abrir (F03: incluye todos los casos)
      if (open && !wasOpen) {
        if (id === 'matrixModal') {
          try { if (typeof window.renderMatrix === 'function') window.renderMatrix(); } catch(e) {}
        }
        if (id === 'statsModal') {
          try { if (typeof window.drawChart === 'function') window.drawChart(); } catch(e) {}
        }
        if (id === 'glossaryModal') {
          try { if (typeof window.renderGlossary === 'function') window.renderGlossary(); } catch(e) {}
        }
        if (id === 'biblioModal') {
          try { if (typeof window.renderBibliography === 'function') window.renderBibliography(); } catch(e) {}
        }
        if (id === 'examModal') {
          try { if (typeof window.startExam === 'function') window.startExam(); } catch(e) {}
        }
        // Focus al primer elemento interactivo
        window.setTimeout(function() {
          try {
            modal.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
              ?.focus?.({ preventScroll: true });
          } catch(e) {}
        }, 40);
      }

      return true;
    };

    // Exponer el mapa para que otros módulos lo usen
    window._PB_ACTION_TO_MODAL = _ACTION_TO_MODAL;
    return true;
  }

  /* ── F02: Añadir runAdaptiveQuiz al router v68 si está disponible ───────── */
  function _patchV68Router() {
    const v68 = window.PaleoBotV68InteractionStabilizer;
    if (!v68 || typeof v68.runAction !== 'function') return;

    const _orig = v68.runAction;
    v68.runAction = function runAction(action) {
      if (action === 'runAdaptiveQuiz') {
        try {
          if (typeof window.runAdaptiveQuiz === 'function') {
            window.runAdaptiveQuiz();
            return true;
          }
        } catch(e) {}
        // Fallback: abrir examModal directamente
        return window.setModal ? window.setModal('examModal', true) : false;
      }
      return _orig.call(this, action);
    };
  }

  /* ── F04: window.runAction siempre apunta a la versión canónica ──────────
     Usamos el mismo patrón de patch para garantizar que cualquier llamada
     externa a window.runAction() use la implementación más reciente.       */
  function _anchorWindowRunAction() {
    const v68 = window.PaleoBotV68InteractionStabilizer;
    if (v68 && typeof v68.runAction === 'function') {
      window.runAction = v68.runAction;
    }
  }

  /* ── F02b: Añadir runAdaptiveQuiz al router v55 ─────────────────────────── */
  function _patchV55Router() {
    const v55 = window.PaleoBotV55Router;
    if (!v55 || typeof v55.runAction !== 'function') return;

    const _orig55 = v55.runAction;
    v55.runAction = function runAction(action) {
      if (action === 'runAdaptiveQuiz') {
        try {
          if (typeof window.runAdaptiveQuiz === 'function') {
            window.runAdaptiveQuiz();
            return true;
          }
        } catch(e) {}
        return false;
      }
      return _orig55.call(this, action);
    };
  }

  /* ── Inicialización ─────────────────────────────────────────────────────── */
  function _init() {
    _ensureAdaptiveQuiz();
    _installCanonicalSetModal();
    _patchV68Router();
    _patchV55Router();
    _anchorWindowRunAction();
  }

  /* Ejecutar tras DOMContentLoaded o inmediatamente si ya cargó */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
