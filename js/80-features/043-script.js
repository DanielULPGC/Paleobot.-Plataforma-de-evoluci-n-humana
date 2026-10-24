// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════
   PaleoBot v60 — Onboarding automático en primera visita
   ────────────────────────────────────────────────────────────────────
   Abre studentGuideModal automáticamente la primera vez que el alumnado
   accede al atlas. Una clave SafeStorage evita que vuelva a aparecer.
   El docente puede resetear el onboarding en Configuración (futura).

   Fuente pedagógica: Sweller (1988) Cognitive load theory.
   DOI: https://doi.org/10.1207/s15516709cog1202_4
   ═══════════════════════════════════════════════════════════════════ */
(function PaleoBotOnboarding() {
  'use strict';

  const STORAGE_KEY   = 'paleobot_onboarding_done';
  const DELAY_MS      = 900;   // Esperar a que el atlas termine de renderizar
  const DEBUG         = false;
  const log = DEBUG ? console.log.bind(console, '[PBOnboarding]') : () => {};

  /**
   * Lee la clave de onboarding mediante el adaptador canónico.
   * Si el adaptador no estuviera disponible, falla cerrado y no fuerza el modal.
   */
  function isOnboardingDone() {
    try {
      return window.PaleoBotStorage?.getPersistent(STORAGE_KEY, null) !== null;
    } catch(e) {
      return true; // En caso de error, no mostrar onboarding
    }
  }

  /**
   * Marca el onboarding como completado.
   */
  function markDone() {
    try {
      window.PaleoBotStorage?.setPersistent(STORAGE_KEY, '1');
      log('Onboarding marcado como completado');
    } catch(e) { /* sin persistencia — no crítico */ }
  }

  /**
   * Abre la guía del alumnado usando el sistema de modales del atlas.
   */
  function showGuide() {
    // Intentar con openStudentGuide (registrada en PaleoBotV59)
    if (typeof window.openStudentGuide === 'function') {
      try { window.openStudentGuide(); markDone(); return; } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }
    // Fallback: abrir el modal directamente
    const modal = document.getElementById('studentGuideModal');
    if (!modal) { log('studentGuideModal no encontrado'); return; }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // Renderizar contenido si PaleoBotV59 está disponible
    if (window.PaleoBotV59?.renderAll) {
      try { window.PaleoBotV59.renderAll(); } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }
    // Focus al primer elemento
    const firstFocusable = modal.querySelector('button:not([disabled])');
    if (firstFocusable) setTimeout(() => { try { firstFocusable.focus(); } catch(e) { /* recuperable: suprimido intencionalmente */ } }, 80);
    markDone();
    log('Guía del alumnado abierta en primera visita');
  }

  /**
   * Lógica principal: comprobar si es primera visita y mostrar guía.
   */
  function init() {
    if (isOnboardingDone()) {
      log('Onboarding ya completado — omitiendo');
      return;
    }
    log('Primera visita detectada — programando apertura de guía');
    setTimeout(showGuide, DELAY_MS);
    document.documentElement.dataset.paleobotOnboarding = 'pending';
  }

  // Ejecutar tras DOMContentLoaded (el atlas necesita estar listo)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }

  // API pública — permite al docente resetear el onboarding desde consola:
  // PaleoBotOnboarding.reset()
  window.PaleoBotOnboarding = {
    reset() {
      try {
        window.PaleoBotStorage?.removePersistent(STORAGE_KEY);
        if (typeof window.__PALEOBOT_DEBUG !== 'undefined' && window.__PALEOBOT_DEBUG) {
          window.__PALEOBOT_DEBUG && console.log('[PaleoBotOnboarding] Resetado — se mostrará en la próxima carga.');
        }
      } catch(e) { /* recuperable: suprimido intencionalmente */ }
    },
    isDone: isOnboardingDone,
    showNow: showGuide
  };

})();
