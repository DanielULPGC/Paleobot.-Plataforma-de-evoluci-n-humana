/* =====================================================================================================
   95-sistema/accesibilidad-contenido.js · semántica y teclado dentro de diálogos, ficha y gráfico de Clima
   (PB-GH-11, tanda de arreglos tras la verificación independiente T7; L1, aditivo)
   -----------------------------------------------------------------------------------------------------
   No recrea marcado ni cambia textos: solo añade atributos (y, en Clima, una diana transparente) sobre lo que
   pintan los módulos importados, y solo escribe si el valor cambia. Marca lo suyo para poder retirarlo.
   1 · T7-03 · Regiones desplazables sin foco en diálogos abiertos y en la ficha (#detailView): todo contenedor
       que de verdad se desplaza y no contiene nada enfocable recibe tabindex="0", role="region" (si no tiene
       rol) y nombre («Tabla desplazable: <sección>» o «Contenido desplazable: <título>»), igual que
       regiones.js en las vistas (data-pb-region). Si deja de desplazarse, se retira lo puesto.
   2 · T7-04 y T7-13 (heading-order) · En un diálogo abierto, si un encabezado salta niveles respecto del
       anterior visible (h2 → h4 en la ficha, la Guía y el Comparador), recibe aria-level con el nivel
       siguiente; sus hermanos del mismo nivel, también. No cambia la etiqueta ni el texto
       (data-pb-nivel guarda el nivel original).
   3 · T7-13 (ARIA) · Síntesis: los puntos de Bloom (span con aria-label y title, sin rol) reciben role="img".
       Guía (y cualquier caso igual): un contenedor sin rol cuyos hijos son todos role="listitem" recibe
       role="list". Matriz: el botón «→» de cada fila, redundante con la fila (role="button", mismo
       data-open-species) y ya fuera del orden de tabulación (tabindex="-1"), pasa a inert (data-pb-inerte): sale
       del árbol de accesibilidad y del foco; sigue visible y un clic sobre él llega a la fila, que abre la misma
       ficha. Búsqueda global: mientras #gs-listbox no tiene opciones (solo el mensaje «Empieza a escribir…» o
       «Sin resultados»), su rol pasa de listbox a group (mismo nombre); con resultados vuelve a listbox
       (data-pb-rol).
   4 · T7-12 · Clima: cada barra de taxón (g[role=button] «Ver ficha de …», 12-18 px) recibe como primer hijo
       un rectángulo transparente de al menos 24 × 24 px centrado en la barra (rect.pb-diana): amplía el área
       de pulsación sin cambiar el dibujo; el clic sube al g y lo atiende 006 como siempre.
   Cuándo: tras clic, pulsación, tecla, entrada de texto, foco, cambio de vista o de tamaño, y al abrirse o
   cerrarse un diálogo (observador de class/open de cada diálogo, sin subárbol): dos pasadas, a 250 y 1 200 ms.
   Mientras haya diálogos abiertos, también cuando cambian (un observador solo sobre ellos, que se suelta al
   cerrarse).
   Escuchas en burbuja; sin red, almacenamiento ni temporizadores en reposo.
   Revertir: quitar este archivo de atlas/index.html (lo puesto se queda inerte: atributos estándar).
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBAccesibilidadContenido) return;

  var DIALOGOS = '.modal-overlay, .detail-panel, .pres-overlay, .pres-map-modal, .socratic-overlay, .pb-v50-modal, .lightbox, dialog';
  var FOCOS = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, [contenteditable="true"], [tabindex]';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function poner(e, k, v) { if (e.getAttribute(k) !== v) e.setAttribute(k, v); }
  function abierto(d) {
    if (!d.isConnected) return false;
    var marcado = d.tagName === 'DIALOG' ? d.open : d.classList.contains('active');
    return marcado && d.getClientRects().length > 0;
  }
  function abiertos() { return [].slice.call(document.querySelectorAll(DIALOGOS)).filter(abierto); }
  function visible(e) { return e.checkVisibility ? e.checkVisibility() : e.getClientRects().length > 0; }
  function limpio(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }

  // 1 · Regiones desplazables
  function desplaza(e) {
    var c = getComputedStyle(e);
    var x = /(auto|scroll)/.test(c.overflowX) && e.scrollWidth > e.clientWidth + 2;
    var y = /(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 2;
    return (x || y) && e.getClientRects().length > 0;
  }
  // ¿Tiene dentro algo que se alcance con Tab y esté a la vista? (lo de pestañas ocultas no cuenta)
  function conFoco(e) {
    var l = e.querySelectorAll(FOCOS);
    for (var i = 0; i < l.length; i++) {
      var f = l[i];
      if (f.disabled || f.getAttribute('tabindex') === '-1' || (f.closest && f.closest('[inert]'))) continue;
      if (visible(f)) return true;
    }
    return false;
  }
  function nombreRegion(e, raiz) {
    var base = '';
    for (var n = e.parentElement; n && n !== raiz.parentElement && !base; n = n.parentElement) {
      if (n.getAttribute('aria-label')) base = n.getAttribute('aria-label');
      else {
        var h = n.querySelector(':scope > h2, :scope > h3, :scope > h4, :scope > h5');
        if (h && !e.contains(h)) base = h.textContent;
      }
    }
    base = limpio(base).slice(0, 70) || 'diálogo';
    return (e.querySelector('table') || e.tagName === 'TABLE' ? 'Tabla desplazable: ' : 'Contenido desplazable: ') + base;
  }
  function regiones(raiz) {
    raiz.querySelectorAll('[data-pb-region]').forEach(function (e) {
      if (desplaza(e)) return;
      var q = e.getAttribute('data-pb-region').split(' ');
      if (q.indexOf('tab') >= 0) e.removeAttribute('tabindex');
      if (q.indexOf('rol') >= 0) e.removeAttribute('role');
      if (q.indexOf('nom') >= 0) e.removeAttribute('aria-label');
      e.removeAttribute('data-pb-region');
    });
    var cand = raiz.querySelectorAll('div, section, figure, aside, ul, ol, pre, table');
    for (var i = 0; i < cand.length; i++) {
      var e = cand[i];
      if (e.hasAttribute('data-pb-region') || e.hasAttribute('tabindex') || !desplaza(e)) continue;
      if (conFoco(e)) continue;                       // ya alcanzable con el teclado por su contenido
      var marcas = ['tab'];
      e.setAttribute('tabindex', '0');
      if (!e.getAttribute('role')) { e.setAttribute('role', 'region'); marcas.push('rol'); }
      if (!e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')) { poner(e, 'aria-label', nombreRegion(e, raiz)); marcas.push('nom'); }
      e.setAttribute('data-pb-region', marcas.join(' '));
    }
  }

  // 2 · Orden de encabezados
  function nivelPropio(h) {
    if (h.hasAttribute('data-pb-nivel')) return +h.getAttribute('data-pb-nivel');
    var m = /^H([1-6])$/.exec(h.tagName);
    if (h.getAttribute('aria-level')) return +h.getAttribute('aria-level');
    return m ? +m[1] : 2;
  }
  function encabezados(raiz) {
    var hs = [].slice.call(raiz.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'));
    var prev = null, mapa = {};
    hs.forEach(function (h) {
      if (!visible(h)) return;
      var orig = nivelPropio(h);
      Object.keys(mapa).forEach(function (k) { if (+k > orig && !(orig in mapa)) delete mapa[k]; });
      var ef = orig in mapa ? mapa[orig] : orig;
      if (prev !== null && ef > prev + 1) { ef = prev + 1; mapa[orig] = ef; }
      if (ef !== orig) {
        if (!h.hasAttribute('data-pb-nivel')) h.setAttribute('data-pb-nivel', String(orig));
        poner(h, 'aria-level', String(ef));
      } else if (h.hasAttribute('data-pb-nivel')) {
        h.removeAttribute('aria-level'); h.removeAttribute('data-pb-nivel');
      }
      prev = ef;
    });
  }

  // 3 · ARIA puntual
  function aria(raiz) {
    raiz.querySelectorAll('span.pb-ssm-bloom-dot[aria-label]:not([role])').forEach(function (e) { e.setAttribute('role', 'img'); e.setAttribute('data-pb-rol', 'img'); });
    raiz.querySelectorAll('[role="listitem"]').forEach(function (li) {
      var p = li.parentElement;
      if (!p || p.getAttribute('role') || /^(UL|OL|MENU)$/.test(p.tagName)) return;
      var hijos = [].slice.call(p.children);
      if (hijos.every(function (c) { return c.getAttribute('role') === 'listitem'; })) { p.setAttribute('role', 'list'); p.setAttribute('data-pb-rol', 'list'); }
    });
    raiz.querySelectorAll('tr.matrix-row-clickable[role="button"] .matrix-open-btn[tabindex="-1"]').forEach(function (b) {
      if (!b.hasAttribute('inert')) { b.setAttribute('inert', ''); b.setAttribute('data-pb-inerte', 'redundante'); }
    });
    var lb = raiz.querySelector('#gs-listbox');
    if (lb && (lb.getAttribute('role') === 'listbox' || lb.getAttribute('data-pb-rol') === 'group')) {
      var conOpciones = !!lb.querySelector('[role="option"]');
      if (conOpciones) { poner(lb, 'role', 'listbox'); lb.removeAttribute('data-pb-rol'); }
      else { poner(lb, 'role', 'group'); poner(lb, 'data-pb-rol', 'group'); }
    }
  }

  // 4 · Dianas de Clima
  function dianas() {
    var svg = document.getElementById('climaSvg');
    if (!svg || !visible(svg) || !svg.getScreenCTM) return;
    var m = svg.getScreenCTM();
    if (!m || !m.a) return;
    var u = 24 / Math.abs(m.a), v = 24 / Math.abs(m.d || m.a);   // 24 px de pantalla en unidades del SVG
    svg.querySelectorAll('g[role="button"][data-open-species]').forEach(function (g) {
      var dib = g.querySelector(':scope > rect:not(.pb-diana)');
      if (!dib) return;
      var x = +dib.getAttribute('x'), y = +dib.getAttribute('y'), w = +dib.getAttribute('width'), h = +dib.getAttribute('height');
      if (!isFinite(x + y + w + h)) return;
      var W = Math.max(w, u), H = Math.max(h, v);
      var d = g.querySelector(':scope > rect.pb-diana');
      if (!d) {
        d = document.createElementNS(SVG_NS, 'rect');
        d.setAttribute('class', 'pb-diana');
        d.setAttribute('fill', 'transparent');
        d.setAttribute('pointer-events', 'all');
        d.setAttribute('aria-hidden', 'true');
        g.insertBefore(d, g.firstChild);
      }
      poner(d, 'x', String(+(x + w / 2 - W / 2).toFixed(2)));
      poner(d, 'y', String(+(y + h / 2 - H / 2).toFixed(2)));
      poner(d, 'width', String(+W.toFixed(2)));
      poner(d, 'height', String(+H.toFixed(2)));
    });
  }

  // Mientras haya un diálogo abierto, se observan sus cambios (pestañas de la ficha, resultados de la búsqueda,
  // contenido que llega tarde). Solo hijos y class/hidden/aria-selected: lo que escribe este archivo no lo dispara.
  var vigilados = new Set();
  var tObs = null;   // sin reiniciar la espera: aunque el diálogo cambie sin parar, se revisa como mucho cada 250 ms
  var obs = window.MutationObserver ? new MutationObserver(function () {
    if (!tObs) tObs = setTimeout(function () { tObs = null; revisar(); }, 250);
  }) : null;
  function vigilar(lista) {
    if (!obs) return;
    var mismos = lista.length === vigilados.size && lista.every(function (d) { return vigilados.has(d); });
    if (mismos) return;
    obs.disconnect(); vigilados.clear();
    lista.forEach(function (d) {
      vigilados.add(d);
      obs.observe(d, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-selected'] });
    });
  }
  // Apertura y cierre: algunos módulos detienen el clic en captura (no llega a document), así que además se
  // observa la clase y el atributo open de cada diálogo (sin subárbol), como hace el gestor de diálogos.
  var raices = new WeakSet();
  var obsRaiz = window.MutationObserver ? new MutationObserver(function () { pronto(); }) : null;
  function descubrir() {
    if (!obsRaiz) return;
    document.querySelectorAll(DIALOGOS).forEach(function (d) {
      if (raices.has(d)) return;
      raices.add(d);
      obsRaiz.observe(d, { attributes: true, attributeFilter: ['class', 'open'] });
    });
  }
  function revisar() {
    descubrir();
    var lista = abiertos();
    lista.forEach(function (d) { regiones(d); encabezados(d); aria(d); });
    vigilar(lista);
    dianas();
  }
  var t1 = null, t2 = null;
  function pronto() {
    clearTimeout(t1); clearTimeout(t2);
    t1 = setTimeout(revisar, 250);
    t2 = setTimeout(revisar, 1200);
  }
  ['click', 'pointerup', 'keyup', 'input', 'focusin'].forEach(function (n) { document.addEventListener(n, pronto); });
  ['paleobot:viewchange', 'paleobot:v50-viewchange'].forEach(function (n) { document.addEventListener(n, pronto); });
  window.addEventListener('resize', pronto, { passive: true });
  function iniciar() { pronto(); setTimeout(descubrir, 1500); }   // diálogos que crean los módulos diferidos
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true }); else iniciar();

  window.PBAccesibilidadContenido = { revisar: revisar };
})();
