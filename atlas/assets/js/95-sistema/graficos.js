/* =====================================================================================================
   95-sistema/graficos.js · vistas de gráficos: cabecera, ayuda de lectura, «Ver entero» y tabla alternativa
   (PB-GH-11, tanda T5, L2; estrategia 06 § 3-I; fila 26)
   -----------------------------------------------------------------------------------------------------
   Vistas: Clima (#climaSvg), Contexto (#contextSvg), Coexistencias (.coexist-svg), Primatología
   (table.primate-matrix) y Filogenia (.phylo-cladogram-svg). Estratigrafía no: su perfil cabe en la caja.
   Antes: en teléfono y tableta el gráfico se abría por su borde izquierdo (Clima 1 567 px, Contexto 1 283 px,
   Coexistencias 2 318 px de ancho) sin decir que seguía a la derecha; nada lo leía de otra forma.
   Ahora, sin tocar el gráfico ni su JavaScript (002/006 lo siguen pintando):
     · una cabecera .pb-graf-cabecera sobre su contenedor: título (el nombre accesible del gráfico) y, solo
       cuando el gráfico es más ancho que su caja, la indicación de cómo recorrerlo (dedo, rueda o flechas con
       el gráfico enfocado; regiones.js le da foco) y el botón «Ver el gráfico entero» (aria-pressed), que lo
       ajusta al ancho de la caja mientras se pulsa (es el mismo SVG escalado; vuelve al detalle con otro clic);
     · en Contexto y Coexistencias, un desplegable «Leer como tabla» con los mismos datos que el gráfico (los
       taxones que dejan pasar los filtros activos, con su intervalo, su clado y, en Coexistencias, con cuántos
       otros taxones visibles coincide en el tiempo). Se calcula al abrirlo, con las funciones de 002
       (DB, matchesActiveFilters, getSpeciesTimeRange, formatTimePoint, CLADE_NAMES), sin red.
   Se monta tras cada paleobot:viewchange y cuando la vista se repinta (MutationObserver de childList con
   espera). No reescribe nada: si la cabecera ya existe, solo la actualiza. Sin escuchas en captura.
   Revertir: quitar este archivo y graficos.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBGraficos) return;
  var GRAF = [
    { vista: 'clima', caja: '#climaScroll', svg: '#climaSvg', titulo: 'Clima y homininos en el tiempo' },
    { vista: 'contexto', caja: '.context-scroll', svg: '#contextSvg', titulo: 'Homininos y contexto geológico-climático', tabla: 'rango' },
    { vista: 'coexistencias', caja: '.coexist-scroll', svg: '.coexist-svg', titulo: 'Coexistencias por intervalos de 100 ka', tabla: 'coexistencia' },
    { vista: 'primatologia', caja: '.primate-matrix-wrap', svg: null, titulo: '' },   // ya tiene su título encima
    { vista: 'phylo', caja: '.phylo-scroll', svg: '.phylo-cladogram-svg', titulo: 'Cladograma' }
  ];
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function datos() {
    // Enlaces léxicos globales de 002 (const/function en un script clásico): se leen por su nombre.
    /* global DB, matchesActiveFilters, getSpeciesTimeRange, formatTimePoint, CLADE_NAMES */
    if (typeof DB === 'undefined' || typeof getSpeciesTimeRange !== 'function') return null;
    var vis = DB.filter(function (sp) { try { return typeof matchesActiveFilters === 'function' ? matchesActiveFilters(sp) : true; } catch (e) { return true; } });
    return vis.map(function (sp) { var r = getSpeciesTimeRange(sp) || {}; return { sp: sp, ini: Number(r.start), fin: Number(r.end) }; })
      .filter(function (x) { return isFinite(x.ini) && isFinite(x.fin); })
      .sort(function (a, b) { return b.ini - a.ini || b.fin - a.fin; });
  }
  function fmt(ma) { return typeof formatTimePoint === 'function' ? formatTimePoint(ma) : ma + ' Ma'; }
  function clado(sp) { return (typeof CLADE_NAMES !== 'undefined' && CLADE_NAMES[sp.clado]) || sp.clado || ''; }
  function tabla(tipo) {
    var d = datos();
    if (!d) return el('p', 'pb-graf-vacio', 'No se pudieron leer los datos del gráfico.');
    if (!d.length) return el('p', 'pb-graf-vacio', 'Sin taxones visibles con los filtros activos.');
    var t = el('table', 'pb-graf-tabla-datos');
    var cap = el('caption', null, d.length + ' taxones visibles con los filtros activos, del más antiguo al más reciente');
    t.appendChild(cap);
    var cab = ['Taxón', 'Desde', 'Hasta', 'Clado'];
    if (tipo === 'coexistencia') cab.push('Coincide en el tiempo con');
    var thead = el('thead'), tr = el('tr');
    cab.forEach(function (c) { var th = el('th', null, c); th.scope = 'col'; tr.appendChild(th); });
    thead.appendChild(tr); t.appendChild(thead);
    var tb = el('tbody');
    d.forEach(function (x) {
      var f = el('tr');
      var th = el('th'); th.scope = 'row';
      var b = el('button', 'pb-graf-taxon', x.sp.nombre); b.type = 'button'; b.setAttribute('data-open-species', x.sp.id);
      th.appendChild(b); f.appendChild(th);
      f.appendChild(el('td', null, fmt(x.ini))); f.appendChild(el('td', null, fmt(x.fin))); f.appendChild(el('td', null, clado(x.sp)));
      if (tipo === 'coexistencia') {
        var n = d.filter(function (y) { return y !== x && y.ini > x.fin && x.ini > y.fin; }).length;
        f.appendChild(el('td', null, n === 1 ? '1 taxón' : n + ' taxones'));
      }
      tb.appendChild(f);
    });
    t.appendChild(tb);
    var envoltura = el('div', 'pb-graf-tabla-caja');
    envoltura.appendChild(t);
    return envoltura;
  }

  function montar(cfg) {
    var vista = document.getElementById('view-' + cfg.vista);
    if (!vista || !vista.classList.contains('active')) return;
    var caja = vista.querySelector(cfg.caja);
    if (!caja) return;
    var cab = caja.previousElementSibling && caja.previousElementSibling.classList.contains('pb-graf-cabecera') ? caja.previousElementSibling : null;
    if (!cab) {
      cab = el('div', 'pb-graf-cabecera');
      cab.setAttribute('data-pb-graf', cfg.vista);
      var tit = cfg.titulo ? el('p', 'pb-graf-titulo', cfg.titulo) : null;
      var ayuda = el('p', 'pb-graf-ayuda', AYUDA);
      ayuda.hidden = true;
      if (tit) cab.appendChild(tit);
      cab.appendChild(ayuda);
      if (cfg.svg) {
        var b = el('button', 'pb-graf-entero', 'Ver el gráfico entero'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.hidden = true;
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') !== 'true';
          var c = cab.nextElementSibling;
          if (on && c) medirNatural(cfg, c);          // antes de ajustar: tamaño y rótulo más pequeño en detalle
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.textContent = on ? 'Volver al detalle' : 'Ver el gráfico entero';
          if (c) c.classList.toggle('pb-graf-ajustado', on);
          escalar(cfg, c, on);
          revisarAncho(cfg);
        });
        cab.appendChild(b);
      }
      caja.parentNode.insertBefore(cab, caja);
    }
    if (cfg.tabla) {
      var det = vista.querySelector('details.pb-graf-tabla[data-pb-graf="' + cfg.vista + '"]');
      if (!det || det.previousElementSibling !== caja) {
        if (det) det.remove();
        det = el('details', 'pb-graf-tabla'); det.setAttribute('data-pb-graf', cfg.vista);
        det.appendChild(el('summary', null, 'Leer como tabla'));
        det.addEventListener('toggle', function () {
          if (!det.open) return;
          var vieja = det.querySelector('.pb-graf-tabla-caja, .pb-graf-vacio'); if (vieja) vieja.remove();
          det.appendChild(tabla(cfg.tabla));
        });
        caja.parentNode.insertBefore(det, caja.nextSibling);
      } else if (det.open) {
        var vieja = det.querySelector('.pb-graf-tabla-caja, .pb-graf-vacio'); if (vieja) vieja.remove();
        det.appendChild(tabla(cfg.tabla));
      }
    }
    revisarAncho(cfg);
  }
  // PB-GH-11 (T7, R-01): «Ver el gráfico entero» ajustaba el SVG al ancho de su caja sin límite: en teléfono los
  // rótulos del cladograma quedaban en 1,6-2,6 px y los de Clima, Contexto y Coexistencias en 1,2-2,5 px. Ahora el
  // ajuste tiene una escala mínima: ningún rótulo baja de 12 px de pantalla (MIN_ROTULO). Si a esa escala el gráfico
  // no cabe, se muestra a la escala mínima legible dentro de su caja, que se desplaza en los dos ejes (alto limitado
  // a la pantalla; regiones.js le da foco y nombre) y la ayuda lo dice. Con los rótulos actuales (8-13 unidades del
  // SVG), en las anchuras medidas la escala mínima legible es mayor que la de detalle: el modo enseña el gráfico
  // entero recorriéndolo, no en miniatura.
  var MIN_ROTULO = 12;
  var AYUDA = 'El gráfico es más ancho que la pantalla: desplácelo en horizontal (con el teclado, enfóquelo y use las flechas) o véalo entero.';
  var AYUDA_LEGIBLE = 'Para que los rótulos se lean (12 px como mínimo), el gráfico no cabe entero en esta pantalla: desplácelo en horizontal y en vertical dentro de su caja (con el teclado, enfóquelo y use las flechas).';
  function svgDe(cfg, caja) { return cfg.svg ? caja.querySelector(cfg.svg) || (caja.matches(cfg.svg) ? caja : null) : null; }
  function medirNatural(cfg, caja) {
    var svg = svgDe(cfg, caja); if (!svg || !svg.getScreenCTM) return;
    var m = svg.getScreenCTM(); var k = m ? Math.abs(m.a) : 1;
    var min = Infinity;
    svg.querySelectorAll('text').forEach(function (t) {
      if (!t.getClientRects().length || !t.textContent.trim()) return;
      var f = parseFloat(getComputedStyle(t).fontSize) * k; if (f > 0 && f < min) min = f;
    });
    var w = svg.getBoundingClientRect().width;
    if (isFinite(min) && w > 0) { caja.setAttribute('data-pb-graf-ancho', String(Math.round(w))); caja.setAttribute('data-pb-graf-rotulo', min.toFixed(2)); }
  }
  function escalar(cfg, caja, on) {
    var svg = caja && svgDe(cfg, caja); if (!svg) return;
    var ayuda = document.querySelector('.pb-graf-cabecera[data-pb-graf="' + cfg.vista + '"] .pb-graf-ayuda');
    if (!on) {
      ['width', 'max-width', 'min-width', 'height'].forEach(function (p) { svg.style.removeProperty(p); });
      caja.classList.remove('pb-graf-legible');
      if (ayuda && ayuda.textContent !== AYUDA) ayuda.textContent = AYUDA;
      return;
    }
    var w0 = +caja.getAttribute('data-pb-graf-ancho'), r0 = +caja.getAttribute('data-pb-graf-rotulo');
    var cabe = caja.clientWidth;
    var ancho = cabe;
    if (w0 > 0 && r0 > 0) ancho = Math.max(cabe, Math.ceil(w0 * MIN_ROTULO / r0));
    var legible = ancho > cabe + 1;
    svg.style.setProperty('width', ancho + 'px', 'important');
    svg.style.setProperty('max-width', 'none', 'important');
    svg.style.setProperty('min-width', '0', 'important');
    svg.style.setProperty('height', 'auto', 'important');
    caja.classList.toggle('pb-graf-legible', legible);
    var txt = legible ? AYUDA_LEGIBLE : AYUDA;
    if (ayuda && ayuda.textContent !== txt) ayuda.textContent = txt;
  }
  function revisarAncho(cfg) {
    var vista = document.getElementById('view-' + cfg.vista);
    var cab = vista && vista.querySelector('.pb-graf-cabecera[data-pb-graf="' + cfg.vista + '"]');
    if (!cab) return;
    var caja = cab.nextElementSibling;
    var ajustado = caja && caja.classList.contains('pb-graf-ajustado');
    var ancho = !!caja && (ajustado || caja.scrollWidth > caja.clientWidth + 2);
    if (ajustado) escalar(cfg, caja, true);
    var ayuda = cab.querySelector('.pb-graf-ayuda'), b = cab.querySelector('.pb-graf-entero');
    if (ayuda && ayuda.hidden !== !ancho) ayuda.hidden = !ancho;
    if (b && b.hidden !== !ancho) b.hidden = !ancho;
  }
  var t = null;
  function revisar() { t = null; GRAF.forEach(montar); }
  function pronto(ms) { if (t) clearTimeout(t); t = setTimeout(revisar, ms || 250); }
  ['paleobot:viewchange', 'paleobot:v50-viewchange'].forEach(function (n) { document.addEventListener(n, function () { pronto(350); setTimeout(revisar, 1400); }); });
  window.addEventListener('resize', function () { pronto(300); }, { passive: true });
  function iniciar() {
    GRAF.forEach(function (cfg) {
      var v = document.getElementById('view-' + cfg.vista);
      if (v && window.MutationObserver) new MutationObserver(function (rs) {
        for (var i = 0; i < rs.length; i++) { var n = rs[i].target; if (rs[i].addedNodes.length && !(n.closest && n.closest('.pb-graf-cabecera, .pb-graf-tabla'))) { pronto(250); return; } }
      }).observe(v, { childList: true, subtree: true });
    });
    pronto(700);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  window.PBGraficos = { revisar: revisar };
})();
