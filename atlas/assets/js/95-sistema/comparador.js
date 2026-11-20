/* =====================================================================================================
   95-sistema/comparador.js · Comparador legible en teléfono (PB-GH-11, tanda T4, L2; estrategia 06 § 3-G)
   -----------------------------------------------------------------------------------------------------
   El comparador (#compareModal) lo pinta 002 (cmp*): este archivo no cambia su lógica ni sus textos.
     1. La guía «Compara rasgos, no solo especies» (aside.cmp-method-guide, con la leyenda de estados) se pliega
        en un <details> «Cómo leer el comparador», donde estaba: en teléfono empujaba el selector fuera de la
        pantalla. Una sola vez (marcado estático).
     2. Tras cada repintado de #compareResult (002 lo rellena con innerHTML al elegir taxones), cada tabla de
        resultados se envuelve en un contenedor con desplazamiento propio (role="region", nombre, tabindex=0
        para poder desplazarlo con el teclado); comparador.css le da cabecera y primera columna fijas. Así la
        página nunca se desplaza en horizontal.
   Escuchas: ninguna; un observador de hijos de #compareResult. Revertir: quitar este archivo y comparador.css.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBComparador) return;
  function guia() {
    var a = document.querySelector('#compareModal .cmp-method-guide');
    if (!a || a.closest('details.pb-cmp-guia')) return;
    var d = document.createElement('details');
    d.className = 'pb-cmp-guia';
    var s = document.createElement('summary');
    s.textContent = 'Cómo leer el comparador';
    d.appendChild(s);
    a.parentNode.insertBefore(d, a);
    d.appendChild(a);
  }
  function tablas() {
    var r = document.getElementById('compareResult');
    if (!r) return;
    var l = r.querySelectorAll('table');
    for (var i = 0; i < l.length; i++) {
      var t = l[i];
      if (t.parentElement && t.parentElement.classList.contains('pb-cmp-tabla')) continue;
      if (t.parentElement && /scroll/.test(t.parentElement.className) && t.parentElement !== r) { t.parentElement.classList.add('pb-cmp-tabla'); continue; }
      var w = document.createElement('div');
      w.className = 'pb-cmp-tabla';
      w.setAttribute('role', 'region');
      w.setAttribute('tabindex', '0');
      w.setAttribute('aria-label', (t.getAttribute('aria-label') || 'Tabla comparativa') + ' (se desplaza dentro de su recuadro)');
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    }
  }
  function iniciar() {
    guia();
    tablas();
    var r = document.getElementById('compareResult');
    if (r) new MutationObserver(tablas).observe(r, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBComparador = { tablas: tablas };
})();
