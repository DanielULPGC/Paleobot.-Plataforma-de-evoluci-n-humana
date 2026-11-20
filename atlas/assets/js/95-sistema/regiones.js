/* =====================================================================================================
   95-sistema/regiones.js · regiones desplazables alcanzables con el teclado (PB-GH-11, T5, filas 15 y 26)
   -----------------------------------------------------------------------------------------------------
   Antes: los gráficos y tablas anchos (#climaSvg, #contextSvg, coexistencias, matriz de primates, tablas de
   Centro docente, paneles del constructor) se desplazaban dentro de su contenedor, pero el contenedor no
   recibía el foco ni tenía nombre: con el teclado no se podía mover (axe scrollable-region-focusable, 4-9 por
   anchura). Ahora, en la vista activa, todo contenedor que de verdad se desplaza (overflow auto/scroll y
   contenido mayor que la caja) recibe tabindex="0", role="region" (si no tiene rol) y un nombre: el del mapa
   NOMBRES o, si no, «Contenido desplazable: <título más próximo>». Si deja de desplazarse (otra anchura), se
   retira lo que puso este módulo (marca data-pb-region). Nunca toca contenedores que ya tienen tabindex.
   Cuándo: tras paleobot:viewchange, al cambiar el tamaño de la ventana y cuando una vista se repinta
   (MutationObserver solo de childList en #main-content, con espera de 250 ms). Solo escribe un atributo si
   cambia: no provoca bucles. Sin escuchas en captura, red ni almacenamiento. Revertir: quitar el archivo.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBRegiones) return;
  var NOMBRES = [
    ['.coexist-scroll', null],                                   // ya tiene role="region" y nombre en 002
    ['#climaScroll, .clima-scroll', 'Gráfico climático: desplácese en horizontal con las flechas'],
    ['.context-scroll', 'Cronología comparada con el contexto geológico-climático: desplácese con las flechas'],
    ['.primate-matrix-wrap', 'Matriz comparada de primates: desplácese con las flechas'],
    ['.teaching-rubric-scroll', 'Rúbrica de evaluación: desplácese con las flechas'],
    ['.builder-reference-scroll', 'Cladograma de referencia: desplácese con las flechas'],
    ['.builder-reference-list', 'Aristas de referencia pendientes'],
  ];
  function desplaza(e) {
    var c = getComputedStyle(e);
    var x = /(auto|scroll)/.test(c.overflowX) && e.scrollWidth > e.clientWidth + 2;
    var y = /(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 2;
    return (x || y) && e.getClientRects().length > 0;
  }
  function tituloProximo(e) {
    for (var n = e; n && n.id !== 'main-content'; n = n.parentElement) {
      var h = n.querySelector && n.querySelector('h2, h3, h4, caption, strong');
      if (h && h !== e && !e.contains(h) && h.textContent.trim()) return h.textContent.replace(/\s+/g, ' ').trim().slice(0, 70);
      var p = n.previousElementSibling;
      while (p) { if (/^H[2-4]$/.test(p.tagName) && p.textContent.trim()) return p.textContent.replace(/\s+/g, ' ').trim().slice(0, 70); p = p.previousElementSibling; }
    }
    return 'vista';
  }
  function nombreDe(e) {
    for (var i = 0; i < NOMBRES.length; i++) if (e.matches(NOMBRES[i][0])) return NOMBRES[i][1];
    if (e.matches('.teaching-deep-audit-scroll')) {
      // Varias tablas comparten envoltorio y nota: se nombran por sus columnas (nombre único y descriptivo).
      var th = [].slice.call(e.querySelectorAll('thead th')).slice(0, 3).map(function (x) { return x.textContent.replace(/\s+/g, ' ').trim(); });
      return 'Tabla desplazable: ' + (th.length ? th.join(' · ') : tituloProximo(e));
    }
    return 'Contenido desplazable: ' + tituloProximo(e);
  }
  function poner(e, k, v) { if (e.getAttribute(k) !== v) e.setAttribute(k, v); }
  function revisar() {
    var vista = document.querySelector('#main-content .view-section.active');
    if (!vista) return;
    // Retirar lo propio donde ya no hace falta
    vista.querySelectorAll('[data-pb-region]').forEach(function (e) {
      if (desplaza(e)) return;
      var q = e.getAttribute('data-pb-region').split(' ');
      if (q.indexOf('tab') >= 0) e.removeAttribute('tabindex');
      if (q.indexOf('rol') >= 0) e.removeAttribute('role');
      if (q.indexOf('nom') >= 0) e.removeAttribute('aria-label');
      e.removeAttribute('data-pb-region');
    });
    var cand = vista.querySelectorAll('div, section, figure, aside, ul, ol, pre, table');
    for (var i = 0; i < cand.length; i++) {
      var e = cand[i];
      if (e.hasAttribute('data-pb-region') || !desplaza(e)) continue;
      if (e.hasAttribute('tabindex') || e.closest('.modal-overlay, .detail-panel')) continue;
      var marcas = ['tab'];
      e.setAttribute('tabindex', '0');
      if (!e.getAttribute('role')) { e.setAttribute('role', 'region'); marcas.push('rol'); }
      if (!e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')) {
        var n = nombreDe(e); if (n) { poner(e, 'aria-label', n); marcas.push('nom'); }
      }
      e.setAttribute('data-pb-region', marcas.join(' '));
    }
  }
  var t = null;
  function pronto(ms) { clearTimeout(t); t = setTimeout(revisar, ms || 250); }
  ['paleobot:viewchange', 'paleobot:v50-viewchange'].forEach(function (n) {
    document.addEventListener(n, function () { pronto(300); setTimeout(revisar, 1300); });
  });
  window.addEventListener('resize', function () { pronto(300); }, { passive: true });
  function iniciar() {
    var main = document.getElementById('main-content');
    if (main && window.MutationObserver) new MutationObserver(function (rs) {
      for (var i = 0; i < rs.length; i++) if (rs[i].addedNodes.length) { pronto(250); return; }
    }).observe(main, { childList: true, subtree: true });
    pronto(600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  window.PBRegiones = { revisar: revisar };
})();
