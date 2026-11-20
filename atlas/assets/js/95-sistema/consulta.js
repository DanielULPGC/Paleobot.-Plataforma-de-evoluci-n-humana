/* =====================================================================================================
   95-sistema/consulta.js · franja «Consulta y filtros» compacta y sobre papel (PB-GH-11, tanda T4, L2)
   -----------------------------------------------------------------------------------------------------
   Entre la barra de 56 px y el título de cada vista seguía el bloque oscuro .toolbar (buscador, «Modo clase»,
   «Limpiar filtros», «Filtros avanzados», nivel con su consejo y #viewOrientation): 369 px en teléfono y
   198 px en escritorio. No se recrea ni se mueve nada: este archivo solo añade un botón de despliegue
   («Más opciones», aria-expanded, aria-controls) dentro de la fila principal, junto al buscador, y una clase
   en .toolbar (.pb-consulta / .pb-consulta-abierta). consulta.css decide qué se ve:
     · escritorio (≥ 64 rem): una sola fila (buscador, «Filtros avanzados», «Limpiar filtros», «Modo clase» y
       nivel); «Más opciones» despliega la orientación de la vista (#viewOrientation) y el consejo de nivel;
     · teléfono y tableta (< 64 rem): el buscador a la vista y «Más opciones» al lado; lo demás, desplegado.
   Si hay filtros activos (#activeFilterSummary sin .is-complete), el botón lo dice («· filtros activos»).
   Nada se elimina: lo plegado sigue en el DOM y aparece con el botón. Escuchas: un clic en el propio botón;
   un observador de la clase de #activeFilterSummary. Revertir: quitar este archivo y consulta.css.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBConsulta) return;
  var barra, boton, aviso;

  function abierta() { return !!barra && barra.classList.contains('pb-consulta-abierta'); }
  function poner(abrir) {
    barra.classList.toggle('pb-consulta-abierta', abrir);
    boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  }
  function filtrosActivos() {
    var s = document.getElementById('activeFilterSummary');
    var activos = !!s && !s.classList.contains('is-complete');
    if (aviso.hidden === activos) aviso.hidden = !activos;
    barra.classList.toggle('pb-consulta-con-filtros', activos);
  }

  function construir() {
    barra = document.querySelector('.v36-workspace-shell > .toolbar') || document.querySelector('.toolbar[role="navigation"]');
    var fila = barra && barra.querySelector('.toolbar-row-primary');
    var buscador = fila && fila.querySelector('.search-box');
    if (!fila || !buscador) return false;
    if (document.getElementById('pbConsultaMas')) return true;
    if (!barra.id) barra.id = 'pbConsulta';
    barra.classList.add('pb-consulta');
    boton = document.createElement('button');
    boton.type = 'button';
    boton.id = 'pbConsultaMas';
    boton.className = 'pb-consulta-mas';
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', barra.id);
    var rotulo = document.createElement('span');
    rotulo.textContent = 'Más opciones';
    aviso = document.createElement('span');
    aviso.className = 'pb-consulta-aviso';
    aviso.textContent = ' · filtros activos';
    aviso.hidden = true;
    boton.appendChild(rotulo);
    boton.appendChild(aviso);
    buscador.insertAdjacentElement('afterend', boton);
    boton.addEventListener('click', function () { poner(!abierta()); });
    var s = document.getElementById('activeFilterSummary');
    if (s) new MutationObserver(filtrosActivos).observe(s, { attributes: true, attributeFilter: ['class'] });
    filtrosActivos();
    return true;
  }

  function iniciar() { if (!construir()) setTimeout(construir, 1200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBConsulta = { abrir: function () { poner(true); }, cerrar: function () { poner(false); } };
})();
