/* =====================================================================================================
   95-sistema/ficha.js · ficha de especie como página de manual (PB-GH-11, tanda T4, L2; notas/05 § 9)
   -----------------------------------------------------------------------------------------------------
   La ficha (#detailView) la pinta 002 (showDetail) y la repintan varias capas; este archivo NO la recrea:
   tras cada apertura o repintado (observa la clase y los hijos de #detailView) hace estos ajustes idempotentes:
     1. marca el panel con .pb-ficha (ficha.css: panel lateral de unos 40 rem en escritorio, pantalla completa
        en teléfono, cabecera de manual). La clase «active» la siguen poniendo y quitando los módulos de
        siempre; el gestor de diálogos (dialogos.js) la observa igual que antes.
     2. lleva la figura de la imagen principal (.species-media-figure: copia local de img/taxones/ con su
        crédito y licencia) al principio de la pestaña «General», antes de «Preguntas para reflexionar»;
     3. da al minimapa una alternativa textual: nombre accesible con la región y las coordenadas, y un párrafo
        visible bajo el mapa que dice lo mismo y explica el fondo local de costas cuando no hay teselas;
     4. en teléfono, mide la fila de acciones (para fijar las pestañas debajo) y vuelve al principio al pasar a
        otra especie; al cambiar de pestaña con la ficha desplazada, deja las pestañas arriba.
   No cambia textos académicos ni de la ficha; una escucha de clic en burbuja sobre el panel, ninguna en captura. Revertir: quitar el archivo y
   ficha.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBFicha) return;
  var panel = null, programado = false, ultimoTitulo = '';
  var TELEFONO = window.matchMedia ? window.matchMedia('(max-width: 47.99rem)') : null;

  function imagenPrimero() {
    var gen = panel.querySelector('#pane-gen');
    var fig = gen && gen.querySelector(':scope > .species-media-figure');
    if (fig && gen.firstElementChild !== fig) gen.insertBefore(fig, gen.firstElementChild);
  }
  function alternativaMapa() {
    var card = panel.querySelector('.detail-map-card');
    if (!card) return;
    var mapa = card.querySelector('.detail-leaflet-map');
    if (!mapa) return;
    var h4 = card.querySelector('.detail-map-card-header h4');
    var region = h4 ? h4.textContent.replace(/\s+/g, ' ').replace(/^\s*Yacimiento:\s*/i, '').trim() : '';
    var c = card.querySelector('.detail-map-coords');
    var coords = c ? c.textContent.trim() : '';
    var id = mapa.id + '-alt';
    var p = document.getElementById(id);
    if (!p) {
      p = document.createElement('p');
      p.id = id;
      p.className = 'pb-ficha-mapa-alt';
      mapa.insertAdjacentElement('afterend', p);
    }
    var texto = 'Ubicación del yacimiento: ' + (region || 'sin región') + (coords ? ' · coordenadas ' + coords + ' (latitud, longitud)' : '') +
      '. Sin conexión con OpenStreetMap, el fondo es un contorno local de costas (Natural Earth, dominio público).';
    if (p.textContent !== texto) p.textContent = texto;
    var nombre = 'Minimapa del yacimiento: ' + (region || '') + (coords ? ', ' + coords : '');
    if (mapa.getAttribute('aria-label') !== nombre) mapa.setAttribute('aria-label', nombre);
    if (mapa.getAttribute('aria-describedby') !== id) mapa.setAttribute('aria-describedby', id);
    if (mapa.getAttribute('role') !== 'region') mapa.setAttribute('role', 'region');
  }
  // Teléfono: la ficha entera se desplaza (ficha.css). Las pestañas se fijan bajo la fila de acciones, cuya
  // altura cambia con el tamaño de letra; al pasar a otra especie («‹ n/50 ›») se vuelve al principio.
  function telefono() {
    if (!TELEFONO || !TELEFONO.matches) return;
    var acc = panel.querySelector('.panel-actions');
    if (acc) {
      var h = Math.ceil(acc.getBoundingClientRect().height) + 'px';
      if (panel.style.getPropertyValue('--pb-ficha-acciones') !== h) panel.style.setProperty('--pb-ficha-acciones', h);
    }
    var t = (document.getElementById('detailViewTitle') || {}).textContent || '';
    if (t !== ultimoTitulo) { ultimoTitulo = t; panel.scrollTop = 0; }
  }
  function ajustar() {
    programado = false;
    if (!panel || !panel.classList.contains('active')) { ultimoTitulo = ''; return; }
    if (!panel.classList.contains('pb-ficha')) panel.classList.add('pb-ficha');
    imagenPrimero();
    alternativaMapa();
    telefono();
  }
  function programar() {
    if (programado) return;
    programado = true;
    setTimeout(ajustar, 80);
  }
  function iniciar() {
    panel = document.getElementById('detailView');
    if (!panel) return;
    new MutationObserver(programar).observe(panel, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    // Teléfono: al cambiar de pestaña con la ficha desplazada, las pestañas quedan arriba y el contenido nuevo
    // empieza a la vista (burbuja; la pestaña la sigue cambiando 017).
    panel.addEventListener('click', function (e) {
      if (!TELEFONO || !TELEFONO.matches || !e.target.closest || !e.target.closest('[role="tab"], .tab-item')) return;
      var tabs = panel.querySelector('.tabs-container');
      var acc = panel.querySelector('.panel-actions');
      if (!tabs) return;
      var y = tabs.offsetTop - (acc ? acc.offsetHeight : 0);
      if (panel.scrollTop > y) panel.scrollTop = y;
    });
    programar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBFicha = { ajustar: ajustar };
})();
