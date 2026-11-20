/* =====================================================================================================
   95-sistema/dialogos.js · gestor común de diálogos del atlas (PB-GH-11, tanda T3; filas 3, 5 y 11)
   -----------------------------------------------------------------------------------------------------
   ADITIVO: no recrea marcado ni sustituye los módulos que abren y cierran diálogos (setModal, 071, 016,
   021…). Observa el estado que ellos escriben (clase .active o atributo open) y, mientras un diálogo está
   abierto, garantiza:
     · semántica: role="dialog", aria-modal="true", sin aria-hidden="true" y con nombre accesible
       (aria-labelledby a su título visible; si la referencia apunta a un id inexistente, se da ese id al
       título visible, sin cambiar su texto);
     · foco: entra (si ningún módulo lo ha llevado dentro, al título con tabindex="-1" o al primer control),
       Tab y Mayús+Tab no salen del diálogo de arriba, y al cerrarse VUELVE al disparador (último control
       enfocado o pulsado antes de abrir). Si el disparador ya no existe (repintado), a su equivalente recién
       pintado (mismo id o mismo data-*); si estaba en el cajón de herramientas y se cerró con el teclado, se
       reabre el cajón con su API pública (PaleoBotV88FloatingMenuFinal.setMobileTools) para devolverlo; si no,
       a un punto estable (botón «Vistas» de la barra, título de la vista activa o #main-content);
     · fondo inerte: atributo inert en los hermanos del diálogo y de sus antecesores. Solo se quita el inert
       que pone este gestor. No toca lo que gestionan otros módulos: el cajón (#pb-floating-tools,
       #pb-a11y-toolbar-root, 071), las secciones de vista (.view-section, 078), otros diálogos cerrados ni
       las regiones vivas.
   Coordinación (sin bucles): el gestor solo observa class/open/aria-hidden de los diálogos y los hijos
   directos de body; escribe inert, aria-modal, role, aria-labelledby, tabindex e id, que no disparan su
   propio observador. Si otro módulo vuelve a poner aria-hidden="true" en un diálogo abierto, se corrige un
   máximo de 8 veces por apertura (y se anota en data-pb-dialogo-correcciones) para no pelear en bucle.
   Escuchas en fase de burbuja (ninguna en captura). Se carga lo último (defer) con ?v=pbgh11.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBDialogos) return;

  var SEL = '.modal-overlay, .detail-panel, .pres-overlay, .pres-map-modal, .socratic-overlay, .pb-v50-modal, .lightbox, dialog.spl-dialog';
  var FOCOS = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, [contenteditable="true"], [tabindex]';
  var CAJON = '#pb-floating-tools, #pb-a11y-toolbar-root';
  var NO_INERTE = 'script, style, link, template, noscript, [aria-live], [role="status"], [role="alert"], #pb-colorblind-filters, #pb-floating-tools, #pb-a11y-toolbar-root, .view-section';
  var ATRIBUTOS_EQUIVALENCIA = ['data-action', 'data-pb-v50-action', 'data-open-species', 'data-pb-v50-view', 'data-soc-open',
    'data-lightbox-open', 'data-detail-action', 'data-pres-map-expand', 'data-paleolab-open', 'data-modal-toggle',
    'data-target-view', 'data-view', 'data-id'];
  var MAX_CORRECCIONES = 8;

  var registrados = new Set();
  var pila = [];            // [{d, disparador, desc, correcciones, porTeclado}]
  var mios = new Set();     // elementos a los que ESTE gestor puso inert
  var historial = [];       // últimos controles enfocados o pulsados: {el, t}
  var modalidad = 'puntero';
  var pendiente = false;

  function visible(e) {
    if (!e || !e.isConnected) return false;
    if (!e.getClientRects().length) return false;
    var s = getComputedStyle(e);
    return s.visibility !== 'hidden' && s.display !== 'none';
  }
  function estaAbierto(d) {
    if (!d.isConnected) return false;
    var marcado = d.tagName === 'DIALOG' ? d.open : d.classList.contains('active');
    return marcado && visible(d);
  }
  function inerte(e) { return !!(e && e.closest && e.closest('[inert]')); }
  function enfocable(e) {
    if (!e || !e.isConnected || e === document.body || inerte(e) || !visible(e)) return false;
    if (e.disabled) return false;
    return e.matches(FOCOS) || e.tabIndex >= 0;
  }
  function tabulables(d) {
    return Array.prototype.filter.call(d.querySelectorAll(FOCOS), function (e) {
      if (e.tabIndex < 0 || e.disabled || inerte(e) || !visible(e)) return false;
      var det = e.parentElement && e.parentElement.closest('details:not([open])');
      if (det && !(e.tagName === 'SUMMARY' && e.parentElement === det)) return false;
      return d.contains(e);
    });
  }
  function arriba() { return pila.length ? pila[pila.length - 1].d : null; }

  /* -- Disparador ------------------------------------------------------------------------------------- */
  function anotar(el) {
    if (!el || el === document.body || el === document.documentElement) return;
    historial.push({ el: el, t: Date.now() });
    if (historial.length > 12) historial.shift();
  }
  document.addEventListener('focusin', function (e) { anotar(e.target); });
  document.addEventListener('pointerdown', function (e) {
    modalidad = 'puntero';
    var c = e.target && e.target.closest ? e.target.closest('button, a[href], summary, [role="button"], [tabindex]') : null;
    if (c && c.tabIndex >= 0) anotar(c);
  });
  document.addEventListener('keydown', function (e) { if (e.key !== 'Shift') modalidad = 'teclado'; });

  function descriptor(el) {
    if (!el) return null;
    var desc = { id: el.id || '', attr: null, val: null };
    for (var i = 0; i < ATRIBUTOS_EQUIVALENCIA.length; i++) {
      var a = ATRIBUTOS_EQUIVALENCIA[i];
      if (el.hasAttribute(a)) { desc.attr = a; desc.val = el.getAttribute(a); break; }
    }
    desc.cajon = !!(el.closest && el.closest(CAJON));
    return desc;
  }
  function elegirDisparador(d) {
    for (var i = historial.length - 1; i >= 0; i--) {
      var el = historial[i].el;
      if (el && el.isConnected && !d.contains(el)) return el;
    }
    return null;
  }
  function equivalente(desc) {
    if (!desc) return null;
    if (desc.id) { var porId = document.getElementById(desc.id); if (enfocable(porId)) return porId; }
    if (desc.attr) {
      var lista = document.querySelectorAll('[' + desc.attr + '="' + (window.CSS && CSS.escape ? CSS.escape(desc.val) : desc.val) + '"]');
      for (var i = 0; i < lista.length; i++) if (enfocable(lista[i])) return lista[i];
    }
    return null;
  }
  function puntoEstable() {
    var vistas = document.getElementById('pbBarraVistasBoton');
    if (enfocable(vistas)) return vistas;
    var activa = document.querySelector('.view-section.active');
    var h = activa && activa.querySelector('h2');
    if (h && visible(h)) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); return h; }
    var m = document.getElementById('main-content');
    if (m) { if (!m.hasAttribute('tabindex')) m.setAttribute('tabindex', '-1'); return m; }
    return null;
  }

  /* -- Semántica y nombre ----------------------------------------------------------------------------- */
  function titulo(d) {
    var ref = d.getAttribute('aria-labelledby');
    var t = ref ? document.getElementById(ref.split(/\s+/)[0]) : null;
    if (t && d.contains(t) && visible(t) && t.textContent.trim()) return t;
    var hs = d.querySelectorAll('h1, h2, h3, [data-modal-title]');
    for (var i = 0; i < hs.length; i++) if (visible(hs[i]) && hs[i].textContent.trim()) return hs[i];
    return t && d.contains(t) ? t : null;
  }
  function nombrar(d) {
    var ref = d.getAttribute('aria-labelledby');
    var id = ref ? ref.split(/\s+/)[0] : '';
    var actual = id ? document.getElementById(id) : null;
    if (actual && actual.textContent.trim()) return;
    var t = titulo(d);
    if (!t) return;
    if (id && !actual && !t.id) { t.id = id; return; }       // la referencia existente pasa a ser válida
    if (!t.id) t.id = (d.id || 'pb-dialogo') + '-titulo';
    d.setAttribute('aria-labelledby', t.id);
    if (d.getAttribute('aria-label') && /^Dialogo /.test(d.getAttribute('aria-label'))) d.removeAttribute('aria-label');
  }
  function preparar(d) {
    if (d.getAttribute('role') !== 'dialog' && d.getAttribute('role') !== 'alertdialog') d.setAttribute('role', 'dialog');
    if (d.getAttribute('aria-modal') !== 'true') d.setAttribute('aria-modal', 'true');
    if (d.getAttribute('aria-hidden') === 'true') d.setAttribute('aria-hidden', 'false');
    nombrar(d);
  }

  /* -- Fondo inerte ----------------------------------------------------------------------------------- */
  function aplicarInerte() {
    var top = arriba();
    var deseados = new Set();
    var modalNativo = top && top.tagName === 'DIALOG' && top.matches(':modal');
    if (top && !modalNativo) {
      for (var n = top; n && n.parentElement && n !== document.body; n = n.parentElement) {
        var hermanos = n.parentElement.children;
        for (var i = 0; i < hermanos.length; i++) {
          var h = hermanos[i];
          if (h === n || h.matches(NO_INERTE)) continue;
          if (h.matches(SEL) && !estaAbierto(h)) continue;      // diálogos cerrados: ya ocultos
          if (h.contains(top)) continue;
          deseados.add(h);
        }
      }
    }
    mios.forEach(function (e) {
      if (!deseados.has(e)) { e.removeAttribute('inert'); mios.delete(e); }
    });
    deseados.forEach(function (e) {
      if (!e.hasAttribute('inert')) { e.setAttribute('inert', ''); mios.add(e); }
    });
  }

  /* -- Foco ------------------------------------------------------------------------------------------- */
  function enfocar(el) {
    if (!el) return false;
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (e2) { return false; } }
    return document.activeElement === el;
  }
  function llevarDentro(d) {
    if (!estaAbierto(d) || d.contains(document.activeElement) || arriba() !== d) return;
    var t = titulo(d);
    if (t && visible(t)) {
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      if (enfocar(t)) return;
    }
    var l = tabulables(d);
    if (l.length) enfocar(l[0]);
  }
  function focoPerdido() {
    var a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement || !a.isConnected) return true;
    if (inerte(a) || !visible(a)) return true;
    var top = arriba();
    if (top && !top.contains(a)) return true;
    var cerrado = a.closest && a.closest(SEL);
    return !!(cerrado && !estaAbierto(cerrado));
  }
  // Con el teclado, si el disparador estaba en el cajón y un módulo dejó el foco en el botón del cajón (su
  // respaldo genérico), se considera perdido: se devuelve al control exacto que abrió el diálogo.
  function enRespaldoDelCajon(entrada) {
    var a = document.activeElement;
    return !!(entrada.desc && entrada.desc.cajon && modalidad === 'teclado' && a && a.id === 'pb-mobile-tools-toggle');
  }
  function devolver(entrada) {
    if (!focoPerdido() && !enRespaldoDelCajon(entrada)) return true;
    var top = arriba();
    if (top) { // queda otro diálogo abierto debajo: el foco vuelve a su disparador si está dentro
      if (entrada.disparador && top.contains(entrada.disparador) && enfocar(entrada.disparador)) return true;
      llevarDentro(top);
      return top.contains(document.activeElement);
    }
    var destino = enfocable(entrada.disparador) ? entrada.disparador : equivalente(entrada.desc);
    if (!destino && entrada.desc && entrada.desc.cajon) {
      var menu = window.PaleoBotV88FloatingMenuFinal;
      if (modalidad === 'teclado' && menu && typeof menu.setMobileTools === 'function') {
        try { menu.setMobileTools(true); } catch (e) {}
        destino = enfocable(entrada.disparador) ? entrada.disparador : equivalente(entrada.desc);
      }
      if (!destino) { var t = document.getElementById('pb-mobile-tools-toggle'); if (enfocable(t)) destino = t; }
    }
    if (!destino) destino = puntoEstable();
    return enfocar(destino);
  }

  /* -- Apertura y cierre ------------------------------------------------------------------------------ */
  function abrir(d) {
    var disp = elegirDisparador(d);
    var entrada = { d: d, disparador: disp, desc: descriptor(disp), correcciones: 0 };
    pila.push(entrada);
    preparar(d);
    d.setAttribute('data-pb-dialogo', 'abierto');
    // Los módulos llevan el foco con temporizadores (30-80 ms): se espera y solo se actúa si no lo hicieron.
    setTimeout(function () { llevarDentro(d); }, 90);
    setTimeout(function () { llevarDentro(d); }, 400);
  }
  function cerrar(entrada) {
    var ok = devolver(entrada);
    // Algún módulo puede mover o soltar el foco después de cerrar: dos comprobaciones acotadas.
    setTimeout(function () { if (focoPerdido() || enRespaldoDelCajon(entrada)) devolver(entrada); }, 120);
    setTimeout(function () { if (focoPerdido() || enRespaldoDelCajon(entrada)) devolver(entrada); }, 450);
    return ok;
  }
  function conciliar() {
    pendiente = false;
    var abiertos = [];
    registrados.forEach(function (d) { if (estaAbierto(d)) abiertos.push(d); });
    var cerradas = [];
    pila = pila.filter(function (e) {
      if (abiertos.indexOf(e.d) >= 0) return true;
      cerradas.push(e); return false;
    });
    abiertos.forEach(function (d) {
      if (!pila.some(function (e) { return e.d === d; })) abrir(d);
    });
    pila.forEach(function (e) { // vigilar aria-hidden en los abiertos (con tope)
      if (e.d.getAttribute('aria-hidden') === 'true' && e.correcciones < MAX_CORRECCIONES) {
        e.correcciones++; e.d.setAttribute('aria-hidden', 'false');
        e.d.setAttribute('data-pb-dialogo-correcciones', String(e.correcciones));
      }
    });
    aplicarInerte();
    // Si se cierran varios a la vez, el foco vuelve al disparador del más bajo (el de los de arriba suele
    // estar dentro de él y ya no está a la vista).
    cerradas.forEach(function (e) { e.d.removeAttribute('data-pb-dialogo'); });
    if (cerradas.length) cerrar(cerradas[0]);
  }
  function programar() {
    if (pendiente) return;
    pendiente = true;
    (window.queueMicrotask || function (f) { Promise.resolve().then(f); })(conciliar);
  }

  var obs = new MutationObserver(programar);
  function registrar(d) {
    if (registrados.has(d)) return;
    registrados.add(d);
    obs.observe(d, { attributes: true, attributeFilter: ['class', 'open', 'aria-hidden'] });
  }
  function descubrir() {
    var l = document.querySelectorAll(SEL);
    for (var i = 0; i < l.length; i++) registrar(l[i]);
    programar();
  }
  var obsCuerpo = new MutationObserver(function (rs) {
    var nuevo = false;
    rs.forEach(function (r) { r.addedNodes.forEach(function (n) { if (n.nodeType === 1 && (n.matches(SEL) || n.querySelector(SEL))) nuevo = true; }); });
    if (nuevo) descubrir();
  });

  /* -- Tab atrapado ----------------------------------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var d = arriba();
    if (!d || !estaAbierto(d)) return;
    var l = tabulables(d);
    var a = document.activeElement;
    if (!l.length) { e.preventDefault(); llevarDentro(d); return; }
    var i = l.indexOf(a);
    if (!d.contains(a)) { e.preventDefault(); enfocar(e.shiftKey ? l[l.length - 1] : l[0]); return; }
    if (e.shiftKey && (i === 0 || (i < 0 && a === titulo(d)))) { e.preventDefault(); enfocar(l[l.length - 1]); return; }
    if (!e.shiftKey && i === l.length - 1) { e.preventDefault(); enfocar(l[0]); }
  });
  // Red de seguridad: si el foco acaba fuera del diálogo de arriba (orden nativo distinto, módulo que
  // enfoca algo del fondo), se devuelve dentro. Solo si el diálogo sigue abierto un instante después.
  document.addEventListener('focusin', function (e) {
    var d = arriba();
    if (!d || d.contains(e.target)) return;
    setTimeout(function () {
      if (arriba() === d && estaAbierto(d) && !d.contains(document.activeElement)) llevarDentro(d);
    }, 0);
  });

  function iniciar() {
    descubrir();
    obsCuerpo.observe(document.body, { childList: true });
    setTimeout(descubrir, 1500);   // diálogos que crean los módulos diferidos (búsqueda global, mapa v50…)
    document.documentElement.setAttribute('data-pb-dialogos', 'listo');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();

  window.PBDialogos = {
    pila: function () { return pila.map(function (e) { return e.d.id || e.d.className; }); },
    conciliar: conciliar
  };
})();
