/* =====================================================================================================
   95-sistema/diagnostico.js · «Diagnóstico» produce algo visible desde cualquier vista (PB-GH-11, T5, fila 19)
   -----------------------------------------------------------------------------------------------------
   Antes: runSelfAudit() (002) pintaba el informe en #teachingAuditReport, que vive en Centro docente; desde
   otra vista el informe quedaba oculto (o salía un alert si Centro docente no se había pintado nunca).
   Ahora 002 delega aquí cuando el contenedor no está a la vista: se abre Centro docente con window.switchView,
   se espera a que exista el contenedor, se pinta el MISMO informe (renderSelfAuditReport de 002), se coloca a
   la vista bajo la barra fija y recibe el foco (tabindex=-1) para que el teclado y los lectores lo encuentren.
   Se pide a desplazamiento.js que no recoloque la página en ese cambio de vista. Sin escuchas en captura,
   sin red ni almacenamiento. Revertir: quitar el archivo (002 vuelve a su comportamiento anterior).
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBDiagnostico) return;
  function visible(e) { return !!(e && e.getClientRects().length); }
  function mostrar(report, pintar) {
    if (typeof window.switchView !== 'function' || typeof pintar !== 'function') return false;
    try { if (window.PBDesplazamiento && window.PBDesplazamiento.omitir) window.PBDesplazamiento.omitir(); } catch (e) {}
    try { window.switchView('aula'); } catch (e) { return false; }
    var n = 0;
    (function mirar() {
      var host = document.getElementById('teachingAuditReport');
      if (!visible(host)) { if (++n < 40) setTimeout(mirar, 100); return; }
      host.innerHTML = pintar(report);
      host.setAttribute('tabindex', '-1');
      if (!host.getAttribute('aria-label')) host.setAttribute('aria-label', 'Informe del diagnóstico técnico');
      // Los módulos importados lanzan sus propios desplazamientos al cambiar de vista: se coloca tras ellos.
      var veces = 0;
      (function colocar() {
        host.scrollIntoView({ block: 'start', behavior: 'auto' });
        try { host.focus({ preventScroll: true }); } catch (e) {}
        if (++veces < 4) setTimeout(colocar, 250);
      })();
    })();
    return true;
  }
  window.PBDiagnostico = { mostrar: mostrar };
})();
