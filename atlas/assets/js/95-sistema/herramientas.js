/* =====================================================================================================
   95-sistema/herramientas.js · «Herramientas» y «Arriba» en la barra; cajón con rótulos (PB-GH-11, T5,
   filas 22 y 23)
   -----------------------------------------------------------------------------------------------------
   Antes: «⊞» (#pb-mobile-tools-toggle, de 071) y «↑» (.scroll-top-btn) flotaban abajo a la derecha y tapaban
   texto en todas las vistas y en los diálogos de la T3; el cajón (#pb-floating-tools, .fab-group) eran 11
   cuadrados de 11 colores con el nombre solo en aria-label, más la tira de accesibilidad
   (#pb-a11y-toolbar-root) en otra capa flotante.
   Ahora (REUBICA, no recrea; mismos nodos, mismas clases, mismos data-action):
     · el conmutador y «↑» pasan al final de la franja fija de la barra (.pb-barra-franja, de barra.js), en
       un grupo .pb-barra-flotantes: ya no hay botones flotando sobre el contenido;
     · el cajón y la tira de accesibilidad pasan a un panel #pbHerramientasPanel, bajo la franja, que se ve
       cuando 071 abre el cajón (body.pb-mobile-tools-open, su API y su aria-expanded no cambian);
     · cada botón del cajón recibe un <span class="pb-fab-rotulo"> con el texto exacto de su aria-label
       (rótulo visible = nombre accesible; WCAG 2.5.3) y el conmutador, el rótulo «Herramientas».
   Los clics siguen yendo a los manejadores de 071/028/020 (escuchas en captura sobre window, que no dependen
   de la posición). Se revisa tras cada paleobot:viewchange por si algún módulo devuelve un nodo a <body>.
   Sin escuchas en captura, red ni almacenamiento. Revertir: quitar este archivo y herramientas.css.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBHerramientas) return;
  var panel = null;

  function rotular(btn, texto, cls) {
    if (!btn || !texto) return;
    var s = btn.querySelector(':scope > .' + cls);
    if (!s) { s = document.createElement('span'); s.className = cls; btn.appendChild(s); }
    if (s.textContent !== texto) s.textContent = texto;
  }
  function colocar() {
    var franja = document.querySelector('#pbV50Blocks > .pb-barra-franja');
    var toggle = document.getElementById('pb-mobile-tools-toggle');
    var arriba = document.querySelector('.scroll-top-btn');
    var cajon = document.querySelector('.fab-group');
    var a11y = document.getElementById('pb-a11y-toolbar-root');
    if (!franja || !toggle) return false;
    var grupo = franja.querySelector(':scope > .pb-barra-flotantes');
    if (!grupo) {
      grupo = document.createElement('div');
      grupo.className = 'pb-barra-flotantes';
      franja.appendChild(grupo);
    }
    if (arriba && arriba.parentElement !== grupo) grupo.appendChild(arriba);
    if (toggle.parentElement !== grupo) grupo.appendChild(toggle);
    rotular(toggle, 'Herramientas', 'pb-herramientas-rotulo');
    rotular(arriba, 'Arriba', 'pb-arriba-rotulo');
    if (!panel) {
      panel = document.getElementById('pbHerramientasPanel');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'pbHerramientasPanel';
        panel.className = 'pb-herramientas-panel';
        var t = document.createElement('p');
        t.className = 'pb-herramientas-titulo';
        t.textContent = 'Herramientas';
        panel.appendChild(t);
        document.body.appendChild(panel);
      }
    }
    if (cajon && cajon.parentElement !== panel) panel.appendChild(cajon);
    if (a11y && a11y.parentElement !== panel) panel.appendChild(a11y);
    if (cajon) cajon.querySelectorAll('button').forEach(function (b) {
      rotular(b, (b.getAttribute('aria-label') || b.getAttribute('title') || '').trim(), 'pb-fab-rotulo');
    });
    return !!(cajon && a11y);
  }
  var intentos = 0;
  (function esperar() {
    if (colocar() || ++intentos > 60) return;
    setTimeout(esperar, 250);
  })();
  ['paleobot:viewchange', 'paleobot:v55-viewchange'].forEach(function (n) {
    document.addEventListener(n, function () { setTimeout(colocar, 200); });
  });
  window.PBHerramientas = { colocar: colocar };
})();
