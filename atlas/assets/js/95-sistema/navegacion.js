/* =====================================================================================================
   95-sistema/navegacion.js · foco y anuncio de la navegación del atlas (PB-GH-11, tanda T3, L1; filas 6 y 17)
   -----------------------------------------------------------------------------------------------------
   ADITIVO: no recrea marcado ni cambia el modelo de navegación (4 bloques, 31 vistas, window.switchView).
   1 · Fila 6. Al elegir una vista con un chip de #pbV50Blocks, 024 y 031 vuelven a pintar #pbV50BlockPanel
       (innerHTML, hasta cuatro veces en 250 ms) y el chip pulsado queda desconectado: el foco caía en <body>.
       Aquí, tras cada repintado y solo si el foco se ha perdido (body, nodo desconectado o inerte), se enfoca
       el chip de la vista activa recién pintado. Ventana: 1,5 s desde la elección.
   2 · La vista activa se anuncia: aria-current="page" en su chip (además del aria-pressed que ya pone 031).
   3 · Fila 17. El enlace de salto («Saltar al contenido principal», href="#main-content", que usan otros
       módulos) conserva su destino y su efecto, y después lleva el foco a la navegación del atlas: el botón
       «Vistas» de la barra (si existe, L2) o la pestaña del bloque activo. Así no se salta la barra.
   Escuchas en fase de burbuja; un observador de hijos directos de #pbV50BlockPanel (no de atributos): las
   escrituras de este archivo (aria-current, foco) no lo disparan. Sin temporizadores en reposo.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBNavegacion) return;

  var eleccion = null;   // { t } desde un chip o una pestaña de bloque

  function vistaActiva() {
    var s = document.querySelector('.view-section.active');
    return s ? s.id.replace(/^view-/, '') : '';
  }
  function perdido() {
    var a = document.activeElement;
    return !a || a === document.body || a === document.documentElement || !a.isConnected || !!(a.closest && a.closest('[inert]'));
  }
  function chipActivo() {
    var v = vistaActiva();
    if (!v) return null;
    return document.querySelector('#pbV50BlockPanel [data-pb-v50-view="' + v + '"]');
  }
  function marcarActual() {
    var v = vistaActiva();
    var chips = document.querySelectorAll('#pbV50BlockPanel [data-pb-v50-view]');
    for (var i = 0; i < chips.length; i++) {
      var es = chips[i].getAttribute('data-pb-v50-view') === v;
      if (es) { if (chips[i].getAttribute('aria-current') !== 'page') chips[i].setAttribute('aria-current', 'page'); }
      else if (chips[i].hasAttribute('aria-current')) chips[i].removeAttribute('aria-current');
    }
  }
  function recolocar() {
    if (!eleccion || Date.now() - eleccion.t > 1500 || !perdido()) return;
    var c = chipActivo();
    if (c && c.getClientRects().length) { try { c.focus({ preventScroll: true }); } catch (e) {} }
  }

  // Se anota la elección en pointerdown, Intro/Espacio y clic (algún módulo detiene el clic en captura).
  function anotar(e) {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target && e.target.closest ? e.target.closest('#pbV50Blocks [data-pb-v50-view], #pbV50Blocks [data-pb-v50-block]') : null;
    if (!t) return;
    eleccion = { t: Date.now() };
    // Si no hay repintado (misma vista), comprobación única al asentarse.
    setTimeout(function () { marcarActual(); recolocar(); }, 320);
  }
  document.addEventListener('pointerdown', anotar);
  document.addEventListener('keydown', anotar);
  document.addEventListener('click', anotar);

  var obs = new MutationObserver(function () { marcarActual(); recolocar(); });
  function vigilarPanel() {
    var p = document.getElementById('pbV50BlockPanel');
    if (!p || p.__pbNavegacion) return !!p;
    p.__pbNavegacion = true;
    obs.observe(p, { childList: true });
    marcarActual();
    return true;
  }

  // Fila 17: el salto lleva a la navegación del atlas.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a.skip-link') : null;
    if (!a || e.button) return;
    setTimeout(function () {
      var destino = document.getElementById('pbBarraVistasBoton');
      if (!destino || !destino.getClientRects().length) destino = document.querySelector('#pbV50Blocks [data-pb-v50-block][aria-selected="true"]') || document.querySelector('#pbV50Blocks [data-pb-v50-block]');
      if (destino) { try { destino.focus(); } catch (err) {} }
    }, 0);
  });

  function iniciar() {
    if (!vigilarPanel()) setTimeout(vigilarPanel, 1200);
    ['paleobot:viewchange', 'paleobot:v50-viewchange'].forEach(function (n) {
      document.addEventListener(n, function () { setTimeout(marcarActual, 260); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();

  window.PBNavegacion = { marcarActual: marcarActual };
})();
