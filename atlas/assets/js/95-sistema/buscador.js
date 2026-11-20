/* =====================================================================================================
   95-sistema/buscador.js · Intro en el buscador de la franja y búsqueda global con título (PB-GH-11, T4;
   fila 18 de la tabla de corrección)
   -----------------------------------------------------------------------------------------------------
   1. #searchInput (franja «Consulta y filtros»): escribir sigue filtrando como siempre (lo hace 002). Ahora
      Intro también actúa, con la MISMA búsqueda que la búsqueda global (window.PaleoBotV86GlobalSearchFinal,
      069), para que lo que se abre coincida con lo que se lista:
        · una sola coincidencia  → se abre (ficha del taxón o vista), con la función activate de 069;
        · ninguna o varias        → se abre #globalSearchModal con el término ya escrito y su lista de resultados.
      Escape y el resto de teclas no cambian. El buscador único (fusionar ambos) es L3: no se hace aquí.
   2. #globalSearchModal no tenía título visible (solo una etiqueta oculta), así que quedó fuera del «diálogo
      único» de la T3. Se le añade un h2 visible «Buscar en todo el atlas» (aria-labelledby apunta a él; la
      etiqueta del campo se conserva) y su botón «✕ Cerrar» del pie, el que ya tenía, recibe la clase
      close-modal para que dialogo-unico.js lo lleve a la cabecera junto al título. Nada se borra.
   Escuchas: keydown en burbuja sobre document (no en captura). Un observador de la clase del diálogo.
   Revertir: quitar este archivo y buscador.css de atlas/index.html (y la exclusión vuelve a dialogo-unico.js).
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBBuscador) return;

  function api() { return window.PaleoBotV86GlobalSearchFinal; }

  function prepararModal() {
    var m = document.getElementById('globalSearchModal');
    if (!m) return null;
    var mc = m.querySelector(':scope > .modal-content');
    if (!mc) return m;
    if (!document.getElementById('pbBusquedaTitulo')) {
      var h = document.createElement('h2');
      h.id = 'pbBusquedaTitulo';
      h.className = 'pb-busqueda-titulo';
      h.textContent = 'Buscar en todo el atlas';
      mc.insertBefore(h, mc.firstChild);
    }
    if (m.getAttribute('aria-labelledby') !== 'pbBusquedaTitulo') m.setAttribute('aria-labelledby', 'pbBusquedaTitulo');
    var x = mc.querySelector('button[data-modal-toggle="globalSearchModal"]:not(.close-modal)');
    if (x) {
      x.classList.add('close-modal');
      if (!x.hasAttribute('aria-label')) x.setAttribute('aria-label', 'Cerrar la búsqueda');
    }
    if (window.PBDialogoUnico && typeof window.PBDialogoUnico.estructurar === 'function') window.PBDialogoUnico.estructurar(m);
    return m;
  }

  function abrirModal(termino) {
    var m = prepararModal();
    var a = api();
    var campo = document.getElementById('gsInput');
    if (campo) campo.value = termino;
    if (a && typeof a.openModal === 'function') return a.openModal();
    if (typeof window.openGlobalSearch === 'function') return window.openGlobalSearch();
    return !!m;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing || e.defaultPrevented) return;
    var t = e.target;
    if (!t || t.id !== 'searchInput') return;
    var termino = String(t.value || '').trim();
    if (!termino) return;
    var a = api();
    var res = a && typeof a.search === 'function' ? a.search(termino) : [];
    e.preventDefault();
    if (res.length === 1 && typeof a.activate === 'function') {
      window.__PB_V86_SEARCH_RESULTS = res;
      if (a.activate(0)) return;
    }
    abrirModal(termino);
  });

  function iniciar() {
    var m = prepararModal();
    if (m) new MutationObserver(function () { if (m.classList.contains('active')) prepararModal(); }).observe(m, { attributes: true, attributeFilter: ['class'] });
    else setTimeout(iniciar, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBBuscador = { abrirModal: abrirModal };
})();
