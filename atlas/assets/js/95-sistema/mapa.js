/* =====================================================================================================
   95-sistema/mapa.js · Mapa y África: el mapa primero, controles con nombre, alternativa textual
   (PB-GH-11, tanda T4, L2; estrategia 06 § 3-F)
   -----------------------------------------------------------------------------------------------------
   Mapa (#view-map, marcado estático de index.html; 002 solo repinta el interior de cada bloque):
     · REUBICA, una vez: el mapa y su lista (.map-shell) pasan justo después de los controles y de las lentes
       regionales (#mapRegionGuide); las cuatro instrucciones de lectura (.map-reading-strip) se pliegan en un
       <details> «Cómo moverse por el mapa»; el laboratorio de lectura (#mapLearningLab) y las lentes
       sincronizadas quedan después. Nada se elimina.
     · Controles agrupados y con nombre: «Fondo» (#mapLayerSwitch), «Capas» (Paleoambiente y Dispersión, en
       un grupo nuevo que las envuelve), «Zoom» (.map-zoom-controls) y «Foco regional» (#mapRegionGuide):
       role="group", aria-label y un rótulo visible.
     · Alternativa textual: el contenedor del mapa pasa a region con nombre y aria-describedby a un párrafo
       visible bajo el mapa, que remite a la lista «Yacimientos visibles» (yacimientos con intervalo, ubicación
       y coordenadas, sincronizada con el mapa) y explica el fondo (relieve remoto o costas locales).
   África (#africaDashboard, repintado entero por 002 con innerHTML en cada cambio de región): tras cada
   repintado, el bloque del mapa (.africa-layout: mapa + detalle de región) pasa a ser el primero del panel;
   las cuatro pautas de lectura estáticas (.africa-reading-strip) se pliegan en «Cómo leer este módulo» y el
   mapa recibe un párrafo de alternativa textual (la lista de regiones que sigue al mapa).
   Teléfono: mapa.css reordena visualmente (order) para que el mapa entre en el primer pantallazo.
   Escuchas: ninguna nueva de eventos; un observador de hijos de #africaDashboard. Revertir: quitar el archivo
   y mapa.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBMapa) return;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function plegar(nodo, clase, titulo) {
    if (!nodo || nodo.closest('details.' + clase)) return null;
    var d = el('details', clase);
    var s = el('summary', '', titulo);
    d.appendChild(s);
    nodo.parentNode.insertBefore(d, nodo);
    d.appendChild(nodo);
    return d;
  }
  function grupo(nodo, nombre) {
    if (!nodo) return;
    nodo.setAttribute('role', 'group');
    nodo.setAttribute('aria-label', nombre);
    if (!nodo.querySelector(':scope > .pb-mapa-rotulo')) {
      var r = el('span', 'pb-mapa-rotulo', nombre);
      r.setAttribute('aria-hidden', 'true');
      nodo.insertBefore(r, nodo.firstChild);
    }
  }

  function mapa() {
    var outer = document.querySelector('#view-map > .map-outer');
    if (!outer || outer.dataset.pbMapa === '1') return;
    var controles = outer.querySelector(':scope > .map-controls');
    var guia = document.getElementById('mapRegionGuide');
    var shell = outer.querySelector(':scope > .map-shell');
    var tira = outer.querySelector(':scope > .map-reading-strip');
    var lab = document.getElementById('mapLearningLab');
    if (!controles || !guia || !shell) return;
    outer.dataset.pbMapa = '1';
    // Orden: controles · foco regional · mapa y lista · «Cómo moverse por el mapa» · laboratorio · lentes.
    controles.insertAdjacentElement('afterend', guia);
    guia.insertAdjacentElement('afterend', shell);
    if (tira) {
      shell.insertAdjacentElement('afterend', tira);
      var d = plegar(tira, 'pb-mapa-pautas', 'Cómo moverse por el mapa');
      if (d && lab) d.insertAdjacentElement('afterend', lab);
    }
    // Grupos con nombre.
    var derecha = controles.querySelector('.map-controls-right');
    grupo(document.getElementById('mapLayerSwitch'), 'Fondo');
    var capas = derecha ? derecha.querySelectorAll(':scope > .map-toggle') : [];
    if (capas.length) {
      var g = el('div', 'pb-mapa-capas');
      capas[0].parentNode.insertBefore(g, capas[0]);
      for (var i = 0; i < capas.length; i++) g.appendChild(capas[i]);
      grupo(g, 'Capas');
    }
    grupo(controles.querySelector('.map-zoom-controls'), 'Zoom');
    guia.setAttribute('role', 'group');
    guia.setAttribute('aria-label', 'Foco regional');
    // Alternativa textual.
    var cont = document.getElementById('mapContainer');
    if (cont && !document.getElementById('pbMapaAlt')) {
      var p = el('p', 'pb-mapa-alt', 'Alternativa textual: la lista «Yacimientos visibles» recoge los mismos yacimientos con su intervalo, ubicación y coordenadas; al elegir uno en la lista se señala en el mapa. Fondo: relieve remoto (ArcGIS) cuando hay conexión; sin ella, contorno local de costas (Natural Earth, dominio público).');
      p.id = 'pbMapaAlt';
      cont.insertAdjacentElement('afterend', p);
      cont.setAttribute('role', 'region');
      cont.setAttribute('aria-label', 'Mapa de yacimientos');
      cont.setAttribute('aria-describedby', 'pbMapaAlt');
    }
  }

  function africa() {
    var dash = document.getElementById('africaDashboard');
    if (!dash) return;
    var lay = dash.querySelector(':scope > .africa-layout');
    if (lay && dash.firstElementChild !== lay) dash.insertBefore(lay, dash.firstElementChild);
    var svg = lay && lay.querySelector('.africa-map-svg');
    var wrap = lay && lay.querySelector('.africa-map-wrap');
    if (svg && wrap && !lay.querySelector('.pb-africa-alt')) {
      var p = el('p', 'pb-africa-alt', 'Alternativa textual: cada marcador es una región fosilífera; la lista de regiones bajo el mapa da su nombre, su intervalo, su resumen y sus yacimientos, y elegir una abre su detalle. El mapa es esquemático: la forma del continente, el Rift y el Sahara son orientativos.');
      p.id = 'pbAfricaAlt';
      wrap.insertAdjacentElement('afterend', p);
      svg.setAttribute('aria-describedby', 'pbAfricaAlt');
    }
  }
  function africaEstatico() {
    var outer = document.querySelector('#view-africa > .africa-outer');
    var tira = outer && outer.querySelector(':scope > .africa-reading-strip');
    if (tira) plegar(tira, 'pb-africa-pautas', 'Cómo leer este módulo');
  }

  function iniciar() {
    mapa();
    africaEstatico();
    africa();
    var dash = document.getElementById('africaDashboard');
    if (dash) new MutationObserver(africa).observe(dash, { childList: true });
    if (!document.querySelector('#view-map > .map-outer[data-pb-mapa="1"]')) setTimeout(mapa, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBMapa = { mapa: mapa, africa: africa };
})();
