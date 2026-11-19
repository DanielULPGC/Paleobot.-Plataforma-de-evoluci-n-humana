/* =====================================================================================================
   95-sistema/desplazamiento.js · al elegir una vista, la vista arriba (PB-GH-11, tanda T4, L2)
   -----------------------------------------------------------------------------------------------------
   Antes: tras elegir una vista en «Vistas», la página se quedaba donde estaba (teléfono) o se detenía con
   la barra a 112-122 px del borde y un resto de la portada a la vista (escritorio): varios módulos
   importados lanzan sus propios desplazamientos suaves (main, #pbV50Blocks, la sección) y ninguno deja la
   vista arriba. Ahora, cuando la persona elige una vista (con puntero o teclado: hubo pointerdown o keydown
   en el último segundo y medio, o el panel «Vistas» estaba abierto), se espera a que esos desplazamientos terminen y se coloca la página de
   modo que la barra fija quede pegada arriba, la franja «Consulta y filtros» justo debajo y, a continuación,
   el título de la vista. No mueve el foco (lo gestiona navegacion.js): solo window.scrollTo.
   No actúa: si no hubo gesto reciente (switchView llamado por código), si hay un diálogo abierto, o si la
   persona se desplaza por su cuenta (rueda, toque, teclas de desplazamiento) mientras se espera.
   Escuchas en burbuja (pointerdown, keydown, wheel, touchmove, scroll pasivas). Revertir: quitar el archivo.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBDesplazamiento) return;
  var gesto = 0, propio = 0, pendiente = null, omitido = 0;
  var TECLAS = /^(PageUp|PageDown|Home|End|ArrowUp|ArrowDown| )$/;

  document.addEventListener('pointerdown', function () { gesto = Date.now(); }, { passive: true });
  document.addEventListener('keydown', function (e) {
    gesto = Date.now();
    if (pendiente && TECLAS.test(e.key) && !(e.target && e.target.closest && e.target.closest('#pbV50Blocks'))) cancelar();
  });
  ['wheel', 'touchmove'].forEach(function (n) { document.addEventListener(n, function () { if (pendiente) cancelar(); }, { passive: true }); });

  function cancelar() { if (pendiente) { clearTimeout(pendiente.t); pendiente = null; } }
  function dialogoAbierto() { return !!document.querySelector('.modal-overlay.active, .detail-panel.active, .pres-overlay.active, .socratic-overlay.active, dialog[open]'); }

  function destino() {
    var barra = document.getElementById('pbV50Blocks');
    var consulta = document.querySelector('.v36-workspace-shell > .toolbar') || document.getElementById('main-content');
    if (!barra || !consulta) return null;
    var franja = barra.querySelector('.pb-barra-franja') || barra;
    var alto = Math.round(franja.getBoundingClientRect().height);
    return Math.max(0, Math.round(consulta.getBoundingClientRect().top + window.scrollY - alto));
  }
  function colocar() {
    pendiente = null;
    if (dialogoAbierto()) return;
    var y = destino();
    if (y === null || Math.abs(window.scrollY - y) < 2) return;
    propio = Date.now();
    window.scrollTo({ top: y, left: window.scrollX, behavior: 'auto' });
  }
  // Espera a que acaben los desplazamientos de otros módulos: 160 ms sin eventos de desplazamiento (máximo 1,4 s).
  function esperar(inicio) {
    var ultimo = Date.now();
    function al() { ultimo = Date.now(); }
    window.addEventListener('scroll', al, { passive: true });
    function mirar() {
      if (!pendiente) { window.removeEventListener('scroll', al); return; }
      var ahora = Date.now();
      if (ahora - ultimo >= 160 || ahora - inicio > 1400) { window.removeEventListener('scroll', al); colocar(); return; }
      pendiente.t = setTimeout(mirar, 60);
    }
    pendiente = { t: setTimeout(mirar, 220) };
  }
  // PB-GH-11 (T4, corrección tras la verificación del director): el pointerdown y el click de los chips de
  // «Vistas» los detienen módulos importados en captura sobre window, así que no llegan aquí; si la persona
  // tardaba 1,5 s o más en elegir, el único gesto visto era el que abrió el panel y no se colocaba nada. Ahora
  // también cuenta como elección que el panel «Vistas» siga abierto al cambiar de vista (barra.js lo cierra
  // 80 ms después). switchView llamado por código, con el panel cerrado y sin gesto reciente, sigue sin actuar.
  function panelAbierto() { var p = document.getElementById('pbBarraPanel'); return !!(p && !p.hidden); }
  function trasCambio() {
    if (Date.now() - omitido < 2000) { omitido = 0; return; }   // T5: quien abre la vista la coloca (diagnóstico)
    if (Date.now() - gesto > 1500 && !panelAbierto()) return;      // solo si la persona eligió la vista
    cancelar();
    esperar(Date.now());
  }
  ['paleobot:viewchange', 'paleobot:v50-viewchange'].forEach(function (n) { document.addEventListener(n, trasCambio); });
  window.PBDesplazamiento = { destino: destino, colocar: colocar, ultimo: function () { return propio; },
    omitir: function () { omitido = Date.now(); cancelar(); } };
})();
