/* =====================================================================================================
   95-sistema/enlace-vista.js · el enlace profundo ?view=<id> lleva a la vista (PB-GH-11, tanda T5,
   corrección tras la verificación del director)
   -----------------------------------------------------------------------------------------------------
   Antes (medido también en c971001 y 71437b6): con ?view=<id> o ?view=<id>#main-content (la forma que usa
   atlas/recorrido/integracion.js) 077 activaba la vista, pero la página se quedaba en la portada (scrollY 0-38,
   título a 4 300-7 700 px). Causa medida (piso/T5/js/deep_traza.cjs): el único desplazamiento lo pide 077 con
   main.scrollIntoView({block:'start'}) a los ~1,5 s; html tiene scroll-behavior:smooth, así que es animado, y
   el repintado de las vistas que sigue a la carga lo interrumpe a los pocos píxeles (0-2 px). El mismo
   desplazamiento hecho de golpe a partir de ~1,7 s se mantiene. Sin el ancla, además, el espacio de trabajo
   no se daba por entrado (071 solo mira el hash #main-content).
   Ahora: si ?view= nombra una vista que existe (id literal de una .view-section dentro de #main-content; nada
   más se acepta), al terminar la carga se da por entrado el espacio de trabajo (la misma clase que pone el
   enlace «Ir directamente al atlas») y se coloca la página como desplazamiento.js tras elegir una vista: barra
   arriba, franja de consulta debajo y el título a continuación. Siempre sin animación (también con movimiento
   reducido). Se recoloca unas pocas veces mientras la página se asienta (hasta ~3,5 s) y se deja de hacer en
   cuanto la persona toca, desplaza o pulsa una tecla. Escuchas pasivas en burbuja; sin red ni almacenamiento.
   Revertir: quitar este archivo de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBEnlaceVista) return;
  var pedida = '';
  try { pedida = new URLSearchParams(window.location.search).get('view') || ''; } catch (e) { pedida = ''; }
  if (!/^[a-z]+$/.test(pedida)) return;
  var parado = false;
  function parar() { parado = true; }
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (n) { window.addEventListener(n, parar, { passive: true, once: true }); });

  function seccion() {
    var s = document.getElementById('view-' + pedida);
    return s && s.classList.contains('view-section') && s.closest('#main-content') ? s : null;
  }
  function colocar() {
    if (parado) return;
    var s = seccion();
    if (!s || !s.classList.contains('active')) return;
    if (document.querySelector('.modal-overlay.active, .detail-panel.active, dialog[open]')) return;
    document.body.classList.add('pb-workspace-entered');
    var y = null;
    if (window.PBDesplazamiento && typeof window.PBDesplazamiento.destino === 'function') y = window.PBDesplazamiento.destino();
    if (y === null) {
      var barra = document.getElementById('pbV50Blocks');
      y = Math.max(0, Math.round(s.getBoundingClientRect().top + window.scrollY - (barra ? barra.getBoundingClientRect().height : 0)));
    }
    if (Math.abs(window.scrollY - y) <= 2) return;
    // scroll-behavior:smooth en html haría animado incluso «auto»: se anula solo durante este desplazamiento.
    var h = document.documentElement, antes = h.style.scrollBehavior;
    h.style.scrollBehavior = 'auto';
    window.scrollTo(window.scrollX, y);
    h.style.scrollBehavior = antes;
  }
  function iniciar() {
    if (!seccion()) return;
    [200, 900, 1800, 2600, 3500].forEach(function (ms) { setTimeout(colocar, ms); });
  }
  if (document.readyState === 'complete') iniciar(); else window.addEventListener('load', iniciar, { once: true });
  window.PBEnlaceVista = { colocar: colocar, vista: function () { return pedida; } };
})();
