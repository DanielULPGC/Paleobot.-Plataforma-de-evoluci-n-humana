/* =====================================================================================================
   95-sistema/barra.js · barra de trabajo del atlas (PB-GH-11, tanda T3, L2; fila 12; estrategia 06 § 3-B)
   -----------------------------------------------------------------------------------------------------
   Otra PRESENTACIÓN del mismo modelo de navegación: las mismas 4 familias (pestañas de bloque), las mismas
   31 vistas (chips) y los mismos rótulos. No recrea ni renombra nada de 024/031: REUBICA dentro del propio
   #pbV50Blocks sus nodos (nav.pb-v50-tabs, #pbV50BlockPanel y .pb-v50-quick-tools) y la insignia
   flotante #pb-v55-badge, y añade solo cromado nuevo:
     · .pb-barra-franja: franja fija (sticky) de 56 px como máximo: insignia «PaleoBot» (reubicada), botón
       «Vistas» (con la ubicación actual: «Explorar evidencias › Cronología») y, desde 48 rem, las
       herramientas rápidas (Bibliografía, Glosario, Exportar, Diagnóstico);
     · #pbBarraPanel: panel «Vistas» (desplegable en escritorio y tableta, hoja inferior en teléfono) con las
       pestañas de familia, el panel del bloque con sus chips y, en teléfono, las herramientas rápidas.
   Comportamiento: «Vistas» abre y cierra el panel (aria-expanded, aria-controls). Al elegir una vista con el
   teclado el panel sigue abierto y el foco queda en el chip recién pintado (navegacion.js, fila 6; la
   vista activa lleva aria-current); al elegirla con ratón o dedo el panel se cierra y el foco pasa a
   «Vistas». Escape (con el foco en la barra) cierra y devuelve el foco a «Vistas»; un clic fuera o que el
   foco salga de la barra también lo cierran. Los clics siguen yendo a los manejadores de 024 (data-pb-v50-*),
   que usan window.switchView. Escuchas en fase de burbuja; un observador de hijos de #pbV50BlockPanel para
   rotular la ubicación (no observa atributos: lo que escribe este archivo no lo dispara).
   Revertir: quitar este archivo y barra.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBBarra) return;

  var TELEFONO = '(max-width: 47.99rem)';
  var mq = window.matchMedia ? window.matchMedia(TELEFONO) : null;
  var bar, franja, boton, donde, panel, zonaHerramientas, herramientas;

  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function abierto() { return !!panel && !panel.hidden; }

  function rotular() {
    if (!donde) return;
    var tab = bar.querySelector('.pb-v50-tabs [data-pb-v50-block].active strong') || bar.querySelector('.pb-v50-tabs [data-pb-v50-block][aria-selected="true"] strong');
    var s = document.querySelector('.view-section.active');
    var v = s ? s.id.replace(/^view-/, '') : '';
    var chip = v ? bar.querySelector('#pbV50BlockPanel [data-pb-v50-view="' + v + '"]') : null;
    var texto = (tab ? tab.textContent.trim() : '') + (chip ? ' › ' + chip.textContent.trim() : '');
    if (donde.textContent !== texto) donde.textContent = texto;
  }
  function colocarHerramientas() {
    if (!herramientas) return;
    var destino = mq && mq.matches ? zonaHerramientas : franja;
    if (herramientas.parentElement !== destino) destino.appendChild(herramientas);
  }

  function abrir(conTeclado) {
    if (abierto()) return;
    panel.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    bar.classList.add('pb-barra-abierta');
    if (conTeclado) {
      var c = panel.querySelector('#pbV50BlockPanel [aria-current="page"]') || panel.querySelector('.pb-v50-tabs [aria-selected="true"]');
      if (c) { try { c.focus({ preventScroll: true }); } catch (e) {} }
    }
  }
  function cerrar(devolverFoco) {
    if (!abierto()) return;
    panel.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    bar.classList.remove('pb-barra-abierta');
    if (devolverFoco) { try { boton.focus({ preventScroll: true }); } catch (e) {} }
  }

  function construir() {
    bar = document.getElementById('pbV50Blocks');
    if (!bar) return false;
    if (bar.querySelector(':scope > .pb-barra-franja')) return true;
    var tabs = bar.querySelector(':scope > .pb-v50-tabs');
    var bloque = document.getElementById('pbV50BlockPanel');
    herramientas = bar.querySelector(':scope > .pb-v50-quick-tools');
    if (!tabs || !bloque) return false;

    franja = el('div', 'pb-barra-franja');
    var insignia = document.getElementById('pb-v55-badge');
    if (insignia) franja.appendChild(insignia);          // reubicada, no oculta
    boton = el('button', 'pb-barra-vistas', { type: 'button', id: 'pbBarraVistasBoton', 'aria-expanded': 'false', 'aria-controls': 'pbBarraPanel' });
    var rotulo = el('span', 'pb-barra-vistas-rotulo');
    rotulo.textContent = 'Vistas';
    donde = el('span', 'pb-barra-donde', { id: 'pbBarraDonde' });
    boton.appendChild(rotulo);
    boton.appendChild(donde);
    franja.appendChild(boton);

    panel = el('div', 'pb-barra-panel', { id: 'pbBarraPanel', role: 'region', 'aria-label': 'Vistas del atlas' });
    panel.hidden = true;
    var cab = el('div', 'pb-barra-panel-cabecera');
    var titulo = el('p', 'pb-barra-panel-titulo');
    titulo.textContent = 'Vistas del atlas';
    var cerrarBtn = el('button', 'pb-barra-cerrar', { type: 'button', 'aria-label': 'Cerrar el panel de vistas' });
    cerrarBtn.textContent = 'Cerrar';
    cab.appendChild(titulo);
    cab.appendChild(cerrarBtn);
    panel.appendChild(cab);
    panel.appendChild(tabs);                              // reubicadas: mismas pestañas, mismos rótulos
    panel.appendChild(bloque);                            // reubicado: 024 y 031 lo siguen repintando por su id
    zonaHerramientas = el('div', 'pb-barra-panel-herramientas');
    panel.appendChild(zonaHerramientas);

    bar.insertBefore(franja, bar.firstChild);
    bar.appendChild(panel);
    if (!bar.classList.contains('pb-barra')) bar.classList.add('pb-barra');
    colocarHerramientas();
    rotular();

    boton.addEventListener('click', function (e) {
      if (abierto()) cerrar(false); else abrir(e.detail === 0);
    });
    cerrarBtn.addEventListener('click', function () { cerrar(true); });
    if (mq) {
      var cambio = function () { colocarHerramientas(); };
      if (mq.addEventListener) mq.addEventListener('change', cambio); else if (mq.addListener) mq.addListener(cambio);
    }
    new MutationObserver(rotular).observe(bloque, { childList: true });
    return true;
  }

  // Elegir con ratón o dedo cierra el panel (clic con detail ≥ 1); con teclado (detail 0) sigue abierto.
  // Elegir con ratón o dedo cierra el panel; con el teclado sigue abierto. Los clics y pointerdown de los
  // chips los detienen en captura módulos importados (no llegan a una escucha en burbuja), así que se decide
  // al cambiar la vista: si no hubo tecla reciente y el puntero no está sobre una pestaña de familia (que
  // también cambia la vista, a la predeterminada del bloque), fue una elección con puntero.
  var ultimaTecla = 0;
  document.addEventListener('keydown', function () { ultimaTecla = Date.now(); });
  function trasCambioDeVista() {
    setTimeout(rotular, 300);
    if (!abierto() || Date.now() - ultimaTecla < 1200) return;
    if (panel.querySelector('.pb-v50-tabs :hover')) return;
    setTimeout(function () { cerrar(true); }, 80);
  }
  document.addEventListener('click', function () { if (panel) setTimeout(rotular, 320); });
  // Lo que ocurre dentro de un diálogo abierto (p. ej. Bibliografía abierta desde el panel en teléfono) no
  // cierra el panel: al cerrar el diálogo, el gestor devuelve el foco al botón que lo abrió, que sigue ahí.
  function enDialogo(t) { return !!(t && t.closest && t.closest('[data-pb-dialogo], [aria-modal="true"]')); }
  document.addEventListener('keydown', function (e) {
    // Si el Escape ya lo atendió otro módulo (cerró un diálogo), no se cierra además el panel.
    if (e.key !== 'Escape' || e.defaultPrevented || !abierto()) return;
    if (bar.contains(document.activeElement) || document.activeElement === document.body) { cerrar(true); }
  });
  document.addEventListener('pointerdown', function (e) {
    if (abierto() && bar && !bar.contains(e.target) && !enDialogo(e.target)) cerrar(false);
  });
  document.addEventListener('focusin', function (e) {
    if (abierto() && bar && !bar.contains(e.target) && !enDialogo(e.target)) cerrar(false);
  });
  ['paleobot:viewchange', 'paleobot:v50-viewchange'].forEach(function (n) {
    document.addEventListener(n, trasCambioDeVista);
  });

  function iniciar() {
    if (!construir()) setTimeout(construir, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();

  window.PBBarra = { abrir: function () { abrir(false); }, cerrar: function () { cerrar(false); }, rotular: rotular };
})();
