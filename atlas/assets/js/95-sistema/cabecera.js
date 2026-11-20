/* =====================================================================================================
   95-sistema/cabecera.js · cabecera de vista (PB-GH-11, tanda T3, L2; estrategia 06 § 3-C; DIRECCION § 2.2)
   -----------------------------------------------------------------------------------------------------
   Contenido sobre papel y el dato en el primer pantallazo. En cada .view-hero (30 vistas; Paleoproteómica
   no tiene) quedan a la vista el título (h2 con su insignia) y UNA línea de pregunta (la tarjeta «Pregunta
   guía» existente); TODO lo demás del hero (rótulo superior, descripción, píldoras, portada del bloque y
   las tarjetas «Cómo leer esta vista» y «Producto evaluable») y la tarjeta de Bloom (.pb-dap, panel de
   activación didáctica de 059) pasan a un desplegable nativo <details> «Cómo usar esta vista». Nada se
   borra ni se reescribe: se REUBICAN nodos dentro del propio hero (los módulos que leen el hero con
   querySelector —083 orientación, 007 portada del bloque, 036 insignias— siguen encontrándolos).
   Repintados: ensureViewHero (002) reescribe hero.innerHTML en cada switchView; un observador de hijos de
   cada hero vuelve a envolver el contenido recién pintado (solo entonces: no hay mutaciones en reposo).
   Tarjeta de Bloom: 059 la inserta tras el hero (hero.after) y la retira a los 14 s. Aquí se mueve dentro
   del desplegable y se cancela su retirada automática (clearTimeout del temporizador que el propio panel
   guarda en data-timer-id), para que su contenido siga alcanzable mientras dure la visita; su «✕» sigue
   cerrándola. Si un repintado del hero se la lleva, se reinserta.
   El estado abierto/cerrado del desplegable se recuerda por vista durante la sesión (en memoria).
   Revertir: quitar este archivo y cabecera.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBCabecera) return;

  var abiertos = {};           // vista → true si el alumnado abrió «Cómo usar esta vista»
  var vigilados = new WeakSet();

  function vistaDe(hero) {
    var s = hero.closest('.view-section');
    return s ? s.id.replace(/^view-/, '') : '';
  }
  function cuerpoDe(hero) { return hero.querySelector('.pb-cv-cuerpo'); }

  function adoptarDap(dap, hero) {
    var cuerpo = cuerpoDe(hero);
    if (!cuerpo || !dap) return;
    var t = Number(dap.getAttribute('data-timer-id'));
    if (t && !dap.hasAttribute('data-pb-cv-adoptada')) { clearTimeout(t); dap.setAttribute('data-pb-cv-adoptada', ''); }
    if (dap.parentElement !== cuerpo) cuerpo.appendChild(dap);
  }

  function envolver(hero) {
    var grid = hero.querySelector(':scope > .view-hero-grid');
    if (!grid || grid.hasAttribute('data-pb-cv')) return false;
    var izq = grid.firstElementChild;
    var lado = grid.querySelector(':scope > .view-hero-side');
    var fila = izq && izq.querySelector('.view-hero-title-row');
    if (!izq || !fila) return false;
    var pregunta = lado ? lado.querySelector(':scope > .view-hero-card') : null;   // «Pregunta guía»

    var det = document.createElement('details');
    det.className = 'pb-cv-uso';
    var sum = document.createElement('summary');
    sum.className = 'pb-cv-resumen';
    sum.textContent = 'Cómo usar esta vista';
    var cuerpo = document.createElement('div');
    cuerpo.className = 'pb-cv-cuerpo';
    det.appendChild(sum);
    det.appendChild(cuerpo);

    Array.prototype.slice.call(izq.children).forEach(function (n) { if (n !== fila) cuerpo.appendChild(n); });
    if (pregunta) {
      pregunta.classList.add('pb-cv-pregunta');
      izq.appendChild(pregunta);
    }
    if (lado) cuerpo.appendChild(lado);
    grid.appendChild(det);
    grid.setAttribute('data-pb-cv', '');
    if (!hero.classList.contains('pb-cv')) hero.classList.add('pb-cv');

    var v = vistaDe(hero);
    if (abiertos[v]) det.open = true;
    det.addEventListener('toggle', function () { abiertos[v] = det.open; });
    return true;
  }

  function vigilar(seccion) {
    if (vigilados.has(seccion)) return;
    vigilados.add(seccion);
    // Tarjeta de Bloom insertada como hija directa de la sección (059: hero.after(panel)).
    new MutationObserver(function (rs) {
      var hero = seccion.querySelector(':scope > .view-hero');
      if (!hero) return;
      rs.forEach(function (r) {
        r.addedNodes.forEach(function (n) {
          if (n.nodeType === 1 && n.classList.contains('pb-dap')) adoptarDap(n, hero);
          if (n.nodeType === 1 && n.classList.contains('view-hero')) { vigilarHero(n); envolver(n); }
        });
      });
    }).observe(seccion, { childList: true });
    var hero = seccion.querySelector(':scope > .view-hero');
    if (hero) { vigilarHero(hero); envolver(hero); var dap = seccion.querySelector(':scope > .pb-dap'); if (dap) adoptarDap(dap, hero); }
  }
  function vigilarHero(hero) {
    if (vigilados.has(hero)) return;
    vigilados.add(hero);
    new MutationObserver(function (rs) {
      var daps = [];
      rs.forEach(function (r) {
        r.removedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          var d = n.classList.contains('pb-dap') ? n : n.querySelector && n.querySelector('.pb-dap');
          if (d && !d.hasAttribute('data-dismissed')) daps.push(d);
        });
      });
      envolver(hero);
      daps.forEach(function (d) { adoptarDap(d, hero); });
    }).observe(hero, { childList: true });
  }

  function iniciar() {
    var ss = document.querySelectorAll('.view-section');
    for (var i = 0; i < ss.length; i++) vigilar(ss[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  // Las vistas pintan su hero al visitarse por primera vez: comprobación barata en cada cambio de vista.
  ['paleobot:viewchange', 'paleobot:v50-viewchange'].forEach(function (n) {
    document.addEventListener(n, function () { setTimeout(iniciar, 0); });
  });

  window.PBCabecera = { envolver: envolver };
})();
