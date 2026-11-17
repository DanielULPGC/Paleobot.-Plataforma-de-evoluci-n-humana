/* =====================================================================================================
   95-sistema/costas.js · fondo local de costas para los mapas del atlas (PB-GH-11, tanda T4; fila 8)
   -----------------------------------------------------------------------------------------------------
   Sin red de terceros (aulas con filtro, sin conexión) el mapa grande perdía la geografía: su fondo es una
   exportación de ArcGIS (#mapRasterBg) y el minimapa de la ficha usa teselas de OpenStreetMap/Esri. Este
   archivo dibuja, DEBAJO de esos fondos remotos, el contorno de las tierras emergidas que trae
   costas-datos.js (Natural Earth 1:110m, dominio público; generado por scripts/generar_costas_atlas.cjs).
   Cuando el fondo remoto carga, lo tapa; cuando no carga, se ven las costas. No pide nada a la red.
     · Mapa grande (#mapSvg, 1000 × 500, equirrectangular): un <path> antes de #mapRasterBg, proyectado con la
       MISMA fórmula que mapProject de 002-script.js (x = (lon + 180) / 360 · 1000; y = (90 − lat) / 180 · 500).
     · Lentes regionales (.map-lens-stage svg, mismas coordenadas con otro viewBox): un <path> al principio de
       cada SVG; se rellena solo si la imagen de relieve de la lente no cargó (025 le pone data-pb-respaldo-aplicado).
     · Minimapa de la ficha (Leaflet 1.9.4 alojado): un panel propio por debajo de las teselas con un
       L.geoJSON de solo datos; se añade envolviendo window.initDetailLeaflet (002), sin editarla.
   Escuchas: ninguna en captura. Un observador de hijos sobre #mapLensGrid (lo repinta 002 con innerHTML).
   Revertir: quitar este archivo, costas-datos.js y costas.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBCostas) return;
  var NS = 'http://www.w3.org/2000/svg';
  var datos = window.PB_COSTAS;
  if (!datos || !Array.isArray(datos.anillos)) return;

  // Proyección del mapa grande: idéntica a mapProject (002-script.js).
  function proyectar(lon, lat) { return [((lon + 180) / 360) * 1000, ((90 - lat) / 180) * 500]; }
  var trazado = null;
  function d() {
    if (trazado) return trazado;
    var partes = [];
    datos.anillos.forEach(function (a) {
      var s = '';
      for (var i = 0; i < a.length; i += 2) {
        var p = proyectar(a[i], a[i + 1]);
        s += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
      }
      partes.push(s + 'Z');
    });
    trazado = partes.join('');
    return trazado;
  }
  function camino(clase) {
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'pb-costas ' + clase);
    g.setAttribute('aria-hidden', 'true');
    g.setAttribute('data-pb-costas', datos.anillos.length);
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d());
    p.setAttribute('fill-rule', 'evenodd');
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    g.appendChild(p);
    return g;
  }

  function mapaGrande() {
    var svg = document.getElementById('mapSvg');
    if (!svg || svg.querySelector(':scope > .pb-costas')) return;
    var raster = document.getElementById('mapRasterBg');
    var g = camino('pb-costas-mundo');
    svg.insertBefore(g, raster && raster.parentNode === svg ? raster : svg.firstChild);
    var mar = document.createElementNS(NS, 'rect');
    mar.setAttribute('class', 'pb-costas-mar');
    mar.setAttribute('x', '-50'); mar.setAttribute('y', '-25');
    mar.setAttribute('width', '1100'); mar.setAttribute('height', '550');
    g.insertBefore(mar, g.firstChild);
  }

  function lentes() {
    var l = document.querySelectorAll('#mapLensGrid .map-lens-stage > svg');
    for (var i = 0; i < l.length; i++) {
      if (!l[i].querySelector(':scope > .pb-costas')) l[i].insertBefore(camino('pb-costas-lente'), l[i].firstChild);
    }
  }

  // Minimapa de la ficha: panel por debajo de las teselas (tilePane = 200).
  function geojson() {
    return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: datos.anillos.map(function (a) {
      var r = []; for (var i = 0; i < a.length; i += 2) r.push([a[i], a[i + 1]]); return [r];
    }) } };
  }
  function minimapa() {
    if (typeof L === 'undefined' || !L.geoJSON) return;
    var mapa = null;
    try { mapa = (typeof _activeLeafletMap !== 'undefined') ? _activeLeafletMap : null; } catch (e) { mapa = null; } // eslint-disable-line no-undef
    if (!mapa || mapa.__pbCostas) return;
    try {
      var panel = mapa.getPane('pbCostas') || mapa.createPane('pbCostas');
      panel.style.zIndex = 150;
      panel.style.pointerEvents = 'none';
      L.geoJSON(geojson(), { pane: 'pbCostas', interactive: false, style: { color: '#8c857a', weight: 1, fillColor: '#e9dfcd', fillOpacity: 1 } }).addTo(mapa);
      mapa.__pbCostas = true;
      var c = mapa.getContainer();
      if (c) c.classList.add('pb-costas-minimapa');
    } catch (e) { /* sin costas: el minimapa sigue igual que antes */ }
  }
  var original = window.initDetailLeaflet;
  if (typeof original === 'function' && !original.__pbCostas) {
    var envuelta = function () {
      var r = original.apply(this, arguments);
      minimapa();
      return r;
    };
    envuelta.__pbCostas = true;
    window.initDetailLeaflet = envuelta;
  }

  function iniciar() {
    mapaGrande();
    lentes();
    var grid = document.getElementById('mapLensGrid');
    if (grid) new MutationObserver(lentes).observe(grid, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBCostas = { anillos: datos.anillos.length, mapaGrande: mapaGrande, lentes: lentes, proyectar: proyectar };
})();
