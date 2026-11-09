/* DEA · África, cuna de la humanidad.
   Usa los datos del recorrido del atlas (window.AtlasPaleo, ../atlas/recorrido/datos.js)
   y el contorno de window.DEA_MAPA. No hace peticiones de red ni guarda datos personales:
   solo recuerda, en este dispositivo, el tamaño de letra, el modo proyección y las sesiones hechas. */
(function () {
  'use strict';

  var A = window.AtlasPaleo;
  var MAPA = window.DEA_MAPA;
  if (!A || !A.taxones) {
    document.getElementById('aviso-error').hidden = false;
    return;
  }

  var REGIONES_AFRICA = ['victoria', 'uganda', 'nakali', 'chorora', 'chad', 'tugen', 'turkana', 'afar', 'sudafrica', 'africa', 'magreb', 'omo'];
  var LIMITE_MIOCENO = 7.5; // Ma: por encima solo hay primates del Mioceno, no homininos
  var ESCALAS = [1, 1.15, 1.3, 1.5, 1.75];

  /* ---------- Utilidades ---------- */
  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'texto') n.textContent = attrs[k];
      else if (k === 'clase') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h != null) n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h); });
    return n;
  }
  function esAfrica(t) { return REGIONES_AFRICA.indexOf(t.region) !== -1; }
  // Cifras según la norma académica: coma decimal y espacio fino irrompible en grupos de tres desde 10 000.
  function num(v, dec) {
    var p = (+v.toFixed(dec)).toString().split('.');
    var ent = p[0].length > 4 ? p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') : p[0];
    return p[1] ? ent + ',' + p[1] : ent;
  }
  function hace(ma) {
    if (ma === 0) return 'hoy';
    if (ma < 1) return 'hace ' + num(Math.round(ma * 1000) * 1000, 0) + ' años';
    return 'hace ' + num(ma, 2) + ' millones de años';
  }
  function intervalo(t) {
    if (t.desde === t.hasta) return 'Hace unos ' + hace(t.desde).replace('hace ', '');
    if (t.hasta === 0) return 'Desde ' + hace(t.desde) + ' hasta hoy';
    return 'Desde ' + hace(t.desde) + ' hasta ' + hace(t.hasta);
  }
  function corto(t) {
    var f = function (v) { return v === 0 ? '0' : num(v, 3); };
    return t.desde === t.hasta ? f(t.desde) + ' Ma' : f(t.desde) + '–' + f(t.hasta) + ' Ma';
  }
  function region(t) { var r = A.regiones[t.region]; return r ? r.nombre : t.region; }
  function clado(t) { var c = A.clados[t.c]; return c ? c.nombre : t.c; }
  var almacen = {
    leer: function () { try { return JSON.parse(localStorage.getItem('dea-ajustes') || '{}'); } catch (e) { return {}; } },
    guardar: function (d) { try { localStorage.setItem('dea-ajustes', JSON.stringify(d)); } catch (e) { /* sin almacenamiento: el recurso sigue funcionando */ } }
  };
  var ajustes = almacen.leer();
  ajustes.hechas = ajustes.hechas || {};

  var taxones = A.taxones.slice().sort(function (a, b) { return b.desde - a.desde || b.hasta - a.hasta; });

  /* ---------- Ajustes de lectura y proyección ---------- */
  function aplicarAjustes() {
    var i = Math.max(0, Math.min(ESCALAS.length - 1, ajustes.escala || 0));
    document.documentElement.style.setProperty('--escala', ESCALAS[i]);
    document.body.classList.toggle('proyeccion', !!ajustes.proyeccion);
    document.documentElement.classList.toggle('proyeccion', !!ajustes.proyeccion);
    document.getElementById('boton-proyectar').setAttribute('aria-pressed', ajustes.proyeccion ? 'true' : 'false');
  }
  document.querySelectorAll('[data-texto]').forEach(function (b) {
    b.addEventListener('click', function () {
      ajustes.escala = Math.max(0, Math.min(ESCALAS.length - 1, (ajustes.escala || 0) + Number(b.dataset.texto)));
      almacen.guardar(ajustes); aplicarAjustes();
    });
  });
  document.getElementById('boton-proyectar').addEventListener('click', function () {
    ajustes.proyeccion = !ajustes.proyeccion;
    almacen.guardar(ajustes); aplicarAjustes();
    var d = document.documentElement;
    try {
      if (ajustes.proyeccion && d.requestFullscreen && !document.fullscreenElement) d.requestFullscreen().catch(function () {});
      if (!ajustes.proyeccion && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    } catch (e) { /* pantalla completa opcional */ }
  });

  /* ---------- Navegación por secciones ---------- */
  var SECCIONES = ['inicio', 'tiempo', 'mapa', 'especies', 'comparar', 'metodos', 'clima', 'glosario', 'trabajo'];
  function mostrar(id, enfocar) {
    if (SECCIONES.indexOf(id) === -1) id = 'inicio';
    document.querySelectorAll('.seccion').forEach(function (s) { s.hidden = s.dataset.seccion !== id; });
    document.querySelectorAll('.pestanas a').forEach(function (a) {
      if (a.dataset.seccion === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var titulo = document.querySelector('#seccion-' + id + ' h1');
    document.title = (id === 'inicio' ? 'África, cuna de la humanidad' : titulo.textContent) + ' · DEA';
    if (enfocar) { titulo.setAttribute('tabindex', '-1'); titulo.focus(); window.scrollTo(0, 0); }
  }
  function leerHash() {
    var h = decodeURIComponent(location.hash.replace('#', ''));
    var partes = h.split('/');
    return { seccion: partes[0] || 'inicio', id: partes[1] || '' };
  }
  window.addEventListener('hashchange', function () {
    var r = leerHash(); mostrar(r.seccion, true);
    if (r.seccion === 'especies' && r.id) abrirFicha(r.id);
  });

  /* ---------- Sesiones ---------- */
  function enlace(seccion, texto) { return '<a href="#' + seccion + '">' + texto + '</a>'; }
  var SESIONES = [
    { n: 1, titulo: 'Seis millones de años en África', pregunta: '¿Dónde y cuándo vivieron los primeros homininos?',
      pasos: [
        'En ' + enlace('tiempo', 'Tiempo') + ', con «Solo África» marcado, busque la especie más antigua de la lista y anote su intervalo.',
        'En ' + enlace('mapa', 'Mapa') + ', localice las regiones del Chad, el Afar, Turkana y Sudáfrica. ¿Qué especies se documentan en cada una?',
        'En ' + enlace('especies', 'Especies') + ', abra dos fichas y anote su región, sus fechas y si su validez está debatida.'
      ],
      trabajo: 'Elabore una línea del tiempo con cinco especies africanas, con el lugar de hallazgo y las fechas aproximadas.',
      mas: [['../atlas/recorrido/cronologia.html', 'Cronología del recorrido'], ['../atlas/recorrido/territorio.html', 'Territorio del recorrido']] },
    { n: 2, titulo: '¿Cómo lo sabemos?', pregunta: '¿Cómo se sabe la edad de un fósil y qué se puede afirmar a partir de él?',
      pasos: [
        'En ' + enlace('metodos', 'Métodos') + ', lea las tres tarjetas y anote qué aporta y qué limita cada método.',
        'En ' + enlace('especies', 'Especies') + ', busque una ficha marcada como «Debatida» y explique con sus palabras por qué se discute.',
        'En cualquier ficha, separe lo que es un dato (lugar, fechas) de lo que es una interpretación.'
      ],
      trabajo: 'Explique con un ejemplo la diferencia entre un dato y una interpretación en el estudio de los orígenes humanos.',
      mas: [['../atlas/recorrido/metodos.html', 'Métodos del recorrido']] },
    { n: 3, titulo: 'Muchos parientes, una sola humanidad', pregunta: '¿Ha existido siempre una sola especie humana a la vez?',
      pasos: [
        'En ' + enlace('tiempo', 'Tiempo') + ', observe el periodo entre hace 2,5 y 1,5 millones de años. ¿Cuántas especies africanas se superponen?',
        'En ' + enlace('comparar', 'Comparar') + ', elija <i>Paranthropus boisei</i> y <i>Homo erectus</i>. ¿Coincidieron en el tiempo?',
        'Compare después <i>Homo sapiens</i> y <i>Homo naledi</i>. ¿Qué dice el resultado sobre la idea de una «escalera» evolutiva?'
      ],
      trabajo: 'Argumente por qué se habla de un árbol, y no de una escalera, para explicar la evolución humana.',
      mas: [['../atlas/recorrido/parentesco.html', 'Parentesco del recorrido']] },
    { n: 4, titulo: 'Paisajes y climas del origen', pregunta: '¿Influyó el ambiente en la evolución humana? ¿De qué manera?',
      pasos: [
        'En ' + enlace('clima', 'Clima') + ', lea las tres ideas y resuma cada una en una frase.',
        'En ' + enlace('mapa', 'Mapa') + ', observe en qué partes de África se concentran las regiones de hallazgos.',
        'Relacione la tercera idea («El ambiente condiciona lo que se conserva») con el mapa: ¿por qué hay muchos hallazgos en unas zonas y pocos en otras?'
      ],
      trabajo: 'Comente cómo el clima y el paisaje condicionan tanto la evolución humana como lo que hoy podemos encontrar. Puede relacionarlo con la materia de Geografía africana.',
      mas: [['../atlas/recorrido/clima.html', 'Clima del recorrido']] },
    { n: 5, titulo: 'Patrimonio de la humanidad en África', pregunta: '¿Quién conserva, estudia y cuenta hoy esta historia?',
      contenido: '<p><strong>Cinco sitios del Patrimonio Mundial (UNESCO) ligados a los orígenes humanos</strong></p><ul>' +
        '<li><strong>Bajo valle del Awash</strong> (Etiopía), inscrito en 1980. Allí apareció en 1974 «Lucy», un esqueleto parcial de <i>Australopithecus afarensis</i>.</li>' +
        '<li><strong>Bajo valle del Omo</strong> (Etiopía), inscrito en 1980. Según la UNESCO, conserva fósiles de <i>Australopithecus</i> y de <i>Homo</i>, y herramientas de piedra de hace unos 2,4 millones de años.</li>' +
        '<li><strong>Parques nacionales del lago Turkana</strong> (Kenia), inscritos en 1997. Incluyen los depósitos de Koobi Fora, con fósiles de homininos.</li>' +
        '<li><strong>Área de conservación del Ngorongoro</strong> (Tanzania), inscrita en 1979 por su naturaleza y ampliada en 2010 por sus valores culturales. Comprende la garganta de Olduvai y las huellas de Laetoli.</li>' +
        '<li><strong>Sitios de homínidos fósiles de Sudáfrica</strong>, inscritos en 1999 (Sterkfontein, Swartkrans, Kromdraai y alrededores) y ampliados en 2005 con el valle de Makapan y el yacimiento del cráneo de Taung.</li></ul>' +
        '<p>Los nombres en español son traducciones; los oficiales están en inglés y en francés.</p>',
      pasos: [
        'En ' + enlace('mapa', 'Mapa') + ', localice las regiones del Afar, el Omo, Turkana y Sudáfrica. ¿Qué sitio de la lista corresponde a cada una?',
        'En ' + enlace('especies', 'Especies') + ', anote qué especies del recurso se documentan en dos de esas regiones.',
        'Piense quién estudia, conserva y explica hoy estos fósiles: museos, universidades, investigadores africanos y extranjeros, comunidades locales. ¿Qué papel debería tener cada uno?'
      ],
      trabajo: 'Elija uno de los cinco sitios y elabore una ficha: país, año de inscripción, qué se encontró allí y por qué es patrimonio de toda la humanidad. Consulte su página oficial en la web de la UNESCO.',
      fuentes: [['Lista del Patrimonio Mundial de la UNESCO', 'https://whc.unesco.org/es/list/'], ['Lower Valley of the Awash (worldheritagesite.org)', 'https://www.worldheritagesite.org/list/id/10'], ['Lower Valley of the Omo (worldheritagesite.org)', 'https://www.worldheritagesite.org/list/id/17'], ['Lake Turkana National Parks (worldheritagesite.org)', 'https://www.worldheritagesite.org/list/id/801'], ['Ngorongoro Conservation Area (worldheritagesite.org)', 'https://www.worldheritagesite.org/list/id/39'], ['Fossil Hominid Sites of South Africa (worldheritagesite.org)', 'https://www.worldheritagesite.org/list/id/915']],
      mas: [['../atlas/recorrido/territorio.html', 'Territorio del recorrido']] },
    { n: 6, titulo: 'Imágenes de nuestros orígenes', pregunta: '¿Cómo se ha representado el origen humano y qué imagen de África ha transmitido?',
      contenido: '<p><strong>Tres casos para pensar</strong></p><ul>' +
        '<li><strong>Piltdown (Inglaterra).</strong> Presentado en 1912 como el «eslabón perdido», en 1953 se demostró que era una falsificación: un cráneo humano combinado con la mandíbula de un simio moderno, probablemente un orangután.</li>' +
        '<li><strong>El niño de Taung (Sudáfrica).</strong> Raymond Dart lo describió en <i>Nature</i> en 1925 como <i>Australopithecus africanus</i>: un ser bípedo de cerebro pequeño que situaba el origen humano en África. Muchos colegas lo rechazaron, porque se buscaba ese origen en Asia o en Europa y porque Piltdown parecía confirmarlo. Su interpretación solo se aceptó de forma general décadas después.</li>' +
        '<li><strong>Investigación hecha desde África.</strong> El niño de Turkana, un esqueleto de <i>Homo erectus</i> (o <i>H. ergaster</i>) de hace 1,5-1,6 millones de años, fue hallado en 1984 por el keniano Kamoya Kimeu en Nariokotome (Kenia). Selam, una niña de <i>Australopithecus afarensis</i> de hace unos 3,3 millones de años, la halló en 2000 en Dikika (Etiopía) el equipo del etíope Zeresenay Alemseged, que la publicó en 2006.</li></ul>',
      pasos: [
        'En ' + enlace('especies', 'Especies') + ', busque <i>Australopithecus africanus</i> y <i>Homo erectus</i>: ¿qué dicen sus fichas?',
        'En ' + enlace('tiempo', 'Tiempo') + ', compare la línea del tiempo con la imagen de la «marcha del progreso» (una fila de figuras cada vez más erguidas). ¿En qué se diferencian?',
        'Busque en un libro de texto, un periódico o un documental una imagen del origen humano y analice qué idea transmite sobre África.'
      ],
      trabajo: 'Analice, con un caso concreto, cómo ha cambiado la imagen de África en la investigación sobre los orígenes humanos. Puede relacionarlo con la materia El imaginario africano.',
      fuentes: [['Piltdown Man forgery (British Geological Survey)', 'https://earthwise.bgs.ac.uk/index.php/Piltdown_Man_forgery'], ['The discovery of Australopithecus and its implications (Leakey Foundation)', 'https://leakeyfoundation.org/the-discovery-of-australopithecus-and-its-implications/'], ['KNM-WT 15000, Turkana Boy (Smithsonian)', 'https://si.edu/object/knm-wt-15000a-knm-wt-15000-turkana-boy-human-fossil:nmnheducation_13109587'], ['Zeresenay Alemseged y Selam (Universidad de Chicago)', 'https://news.uchicago.edu/story/paleoanthropologist-explores-roots-evolution']],
      mas: [['../atlas/recorrido/parentesco.html', 'Parentesco del recorrido']] }
  ];
  function pintarSesiones() {
    var cont = document.getElementById('lista-sesiones');
    SESIONES.forEach(function (s) {
      var art = el('article', { clase: 'sesion' + (s.preparacion ? ' preparacion' : ''), 'aria-labelledby': 'sesion-' + s.n });
      var cab = el('header', null, [el('span', { clase: 'numero', 'aria-hidden': 'true', texto: String(s.n) }), el('h3', { id: 'sesion-' + s.n, texto: 'Sesión ' + s.n + '. ' + s.titulo })]);
      art.appendChild(cab);
      art.appendChild(el('p', { clase: 'pregunta', texto: s.pregunta }));
      if (s.preparacion) {
        art.appendChild(el('p', null, [el('span', { clase: 'etiqueta', texto: 'En preparación' }), ' Sus contenidos se publicarán cuando estén comprobados en las fuentes.']));
      } else {
        if (s.contenido) { var bloque = el('div', { clase: 'contenido' }); bloque.innerHTML = s.contenido; art.appendChild(bloque); }
        var ol = el('ol');
        s.pasos.forEach(function (p) { var li = el('li'); li.innerHTML = p; ol.appendChild(li); });
        art.appendChild(ol);
        art.appendChild(el('p', { clase: 'trabajo' }, [el('strong', { texto: 'Para su trabajo: ' }), s.trabajo]));
        if (s.fuentes) {
          var uf = el('ul', { clase: 'fuentes-sesion' });
          s.fuentes.forEach(function (f) { uf.appendChild(el('li', null, [el('a', { href: f[1], rel: 'noopener noreferrer', texto: f[0] })])); });
          art.appendChild(el('details', null, [el('summary', { texto: 'Fuentes de esta sesión (consultadas el 9 de noviembre de 2026)' }), uf]));
        }
        var pie = el('div', { clase: 'pie-sesion' });
        var mas = el('span', null, ['Para profundizar: ']);
        s.mas.forEach(function (m, i) { if (i) mas.appendChild(document.createTextNode(' · ')); mas.appendChild(el('a', { href: m[0], texto: m[1] })); });
        var id = 'hecha-' + s.n;
        var caja = el('input', { type: 'checkbox', id: id });
        caja.checked = !!ajustes.hechas[s.n];
        caja.addEventListener('change', function () { ajustes.hechas[s.n] = caja.checked; almacen.guardar(ajustes); });
        pie.appendChild(mas);
        pie.appendChild(el('label', { for: id }, [caja, ' Sesión hecha']));
        art.appendChild(pie);
      }
      cont.appendChild(art);
    });
  }

  /* ---------- Línea del tiempo ---------- */
  function pista(t, max) {
    var izq = (max - Math.min(t.desde, max)) / max * 100;
    var ancho = Math.max((Math.min(t.desde, max) - t.hasta) / max * 100, 0.6);
    var barra = el('span', { clase: 'barra' + (t.debatido ? ' debatida' : '') });
    barra.style.left = izq + '%'; barra.style.width = ancho + '%';
    return el('div', { clase: 'pista', 'aria-hidden': 'true' }, [barra]);
  }
  function pintarTiempo() {
    var soloAfrica = document.getElementById('tiempo-africa').checked;
    var mioceno = document.getElementById('tiempo-mioceno').checked;
    var lista = taxones.filter(function (t) { return (!soloAfrica || esAfrica(t)) && (mioceno || t.desde <= LIMITE_MIOCENO); });
    var max = mioceno ? 23 : LIMITE_MIOCENO;
    var ol = document.getElementById('lista-tiempo');
    ol.textContent = '';
    lista.forEach(function (t) {
      var texto = el('div', { clase: 'texto' }, [
        el('a', { clase: 'nombre', href: '#especies/' + t.id }, [el('i', { texto: t.n })]),
        el('div', { clase: 'fechas', texto: intervalo(t) + (soloAfrica ? '' : ' · ' + region(t)) + (t.debatido ? ' · debatida' : '') })
      ]);
      ol.appendChild(el('li', null, [texto, pista(t, max)]));
    });
    var eje = el('li', { 'aria-hidden': 'true' }, [el('span'), el('div', { clase: 'eje' }, [el('span', { texto: num(max, 1) + ' Ma' }), el('span', { texto: num(max / 2, 2) + ' Ma' }), el('span', { texto: 'hoy' })])]);
    ol.insertBefore(eje, ol.firstChild);
    document.getElementById('tiempo-resumen').textContent = lista.length + ' especies o poblaciones, de la más antigua a la más reciente. Las barras rayadas indican validez debatida.';
  }

  /* ---------- Mapa ---------- */
  var regionActiva = null;
  function pintarMapa() {
    var svg = document.getElementById('mapa-svg');
    var ns = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', MAPA ? MAPA.viewBox : '0 0 75 76');
    if (MAPA) {
      ['africa', 'canarias'].forEach(function (k) {
        var p = document.createElementNS(ns, 'path'); p.setAttribute('d', MAPA[k]); p.setAttribute('class', 'tierra'); p.setAttribute('aria-hidden', 'true'); svg.appendChild(p);
      });
      var tc = document.createElementNS(ns, 'text'); tc.setAttribute('x', '0.8'); tc.setAttribute('y', '13'); tc.setAttribute('aria-hidden', 'true'); tc.textContent = 'Canarias'; svg.appendChild(tc);
    }
    var lista = document.getElementById('lista-regiones');
    REGIONES_AFRICA.forEach(function (clave) {
      var r = A.regiones[clave]; if (!r) return;
      var n = taxones.filter(function (t) { return t.region === clave; }).length;
      var etiqueta = r.nombre + ' (' + n + (n === 1 ? ' especie)' : ' especies)');
      var c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', (r.lon + 20).toFixed(2)); c.setAttribute('cy', (38 - r.lat).toFixed(2)); c.setAttribute('r', '1.15');
      c.setAttribute('class', 'punto'); c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button'); c.setAttribute('aria-label', etiqueta); c.dataset.region = clave;
      var tt = document.createElementNS(ns, 'title'); tt.textContent = etiqueta; c.appendChild(tt);
      c.addEventListener('click', function () { elegirRegion(clave); });
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegirRegion(clave); } });
      svg.appendChild(c);
      var b = el('button', { type: 'button', 'aria-pressed': 'false', 'data-region': clave, texto: etiqueta });
      b.addEventListener('click', function () { elegirRegion(clave); });
      lista.appendChild(el('li', null, [b]));
    });
  }
  function elegirRegion(clave) {
    regionActiva = clave;
    document.querySelectorAll('#mapa-svg .punto').forEach(function (c) { c.classList.toggle('activo', c.dataset.region === clave); });
    document.querySelectorAll('#lista-regiones button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.region === clave ? 'true' : 'false'); });
    var r = A.regiones[clave];
    var det = document.getElementById('detalle-region');
    det.textContent = '';
    var ul = el('ul');
    taxones.filter(function (t) { return t.region === clave; }).forEach(function (t) {
      ul.appendChild(el('li', null, [el('a', { href: '#especies/' + t.id }, [el('i', { texto: t.n })]), ' · ' + corto(t) + (t.debatido ? ' · debatida' : '')]));
    });
    det.appendChild(el('div', { clase: 'tarjeta' }, [el('h2', { texto: r.nombre }), ul]));
  }

  /* ---------- Especies ---------- */
  function fuentesDe(ids) {
    var ul = el('ul', { clase: 'fuentes' });
    (ids || []).forEach(function (id) {
      var f = A.fuentes[id]; if (!f) return;
      var li = el('li', null, [f.cita + ' ']);
      if (f.doi) li.appendChild(el('a', { href: 'https://doi.org/' + f.doi, rel: 'noopener noreferrer', texto: 'https://doi.org/' + f.doi }));
      ul.appendChild(li);
    });
    return ul;
  }
  function pintarEspecies() {
    var q = document.getElementById('buscar-especie').value.trim().toLowerCase();
    var soloAfrica = document.getElementById('especies-africa').checked;
    var lista = taxones.filter(function (t) { return (!soloAfrica || esAfrica(t)) && (!q || t.n.toLowerCase().indexOf(q) !== -1); });
    var cont = document.getElementById('lista-especies');
    cont.textContent = '';
    lista.forEach(function (t) {
      var sum = el('summary', null, [el('span', { clase: 'nombre-cientifico', texto: t.n }), el('span', { clase: 'fechas', texto: corto(t) })]);
      if (t.debatido) sum.appendChild(el('span', { clase: 'etiqueta', texto: 'Debatida' }));
      var dl = el('dl', null, [
        el('dt', { texto: 'Cuándo' }), el('dd', { texto: intervalo(t) + ' (aproximado).' }),
        el('dt', { texto: 'Dónde' }), el('dd', { texto: region(t) + (t.geoNota ? '. ' + t.geoNota : '') }),
        el('dt', { texto: 'Grupo' }), el('dd', { texto: clado(t) }),
        el('dt', { texto: 'Qué se sabe' }), el('dd', { texto: t.nota || '' })
      ]);
      if (t.etimologia) { dl.appendChild(el('dt', { texto: 'Origen del nombre' })); dl.appendChild(el('dd', { texto: t.etimologia })); }
      dl.appendChild(el('dt', { texto: 'Fuentes' })); dl.appendChild(el('dd', null, [fuentesDe(t.fuentes)]));
      cont.appendChild(el('details', { clase: 'ficha', id: 'ficha-' + t.id }, [sum, dl]));
    });
    document.getElementById('especies-resumen').textContent = lista.length === 0 ? 'Ninguna especie coincide con la búsqueda.' : lista.length + ' fichas.';
  }
  function abrirFicha(id) {
    var t = taxones.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    if (!esAfrica(t)) document.getElementById('especies-africa').checked = false;
    document.getElementById('buscar-especie').value = '';
    pintarEspecies();
    var f = document.getElementById('ficha-' + id);
    if (f) { f.open = true; f.querySelector('summary').focus(); f.scrollIntoView({ block: 'start' }); }
  }

  /* ---------- Comparar ---------- */
  function rellenarSelect(sel, porDefecto) {
    [['África', true], ['Fuera de África', false]].forEach(function (g) {
      var og = el('optgroup', { label: g[0] });
      taxones.filter(function (t) { return esAfrica(t) === g[1]; }).forEach(function (t) {
        var o = el('option', { value: t.id, texto: t.n + ' (' + corto(t) + ')' });
        if (t.id === porDefecto) o.selected = true;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
  }
  function porNombre(n) { var t = taxones.filter(function (x) { return x.n === n; })[0]; return t ? t.id : taxones[0].id; }
  function pintarComparar() {
    var a = taxones.filter(function (t) { return t.id === document.getElementById('comparar-a').value; })[0];
    var b = taxones.filter(function (t) { return t.id === document.getElementById('comparar-b').value; })[0];
    var res = document.getElementById('resultado-comparar');
    res.textContent = '';
    if (!a || !b) return;
    var max = Math.max(a.desde, b.desde); max = max < 1 ? Math.ceil(max * 10) / 10 + 0.1 : Math.ceil(max * 1.1);
    var frase;
    if (a.id === b.id) frase = 'Ha elegido dos veces la misma especie.';
    else {
      var ini = Math.min(a.desde, b.desde), fin = Math.max(a.hasta, b.hasta);
      if (ini > fin) frase = 'Coincidieron en el tiempo, aproximadamente ' + (fin === 0 ? 'desde ' + hace(ini) + ' hasta hoy.' : 'entre ' + hace(ini) + ' y ' + hace(fin) + '.');
      else if (ini === fin) frase = 'Sus intervalos se tocan ' + hace(ini) + ': con las fechas actuales no puede afirmarse que convivieran.';
      else frase = 'No coincidieron en el tiempo: entre una y otra median unos ' + (fin - ini < 1 ? num(Math.round((fin - ini) * 1000) * 1000, 0) + ' años.' : num(fin - ini, 2) + ' millones de años.');
    }
    var lugar = a.region === b.region ? 'Se documentan en la misma región: ' + region(a) + '.' : 'Se documentan en regiones distintas: ' + region(a) + ' y ' + region(b) + '.';
    var filas = [a, b].map(function (t) {
      return el('div', null, [el('p', null, [el('i', { texto: t.n }), ' · ' + intervalo(t)]), pista(t, max)]);
    });
    res.appendChild(el('div', { clase: 'tarjeta' }, filas.concat([
      el('div', { clase: 'eje', 'aria-hidden': 'true' }, [el('span', { texto: num(max, 2) + ' Ma' }), el('span', { texto: 'hoy' })]),
      el('p', null, [el('strong', { texto: frase })]),
      el('p', { texto: lugar }),
      el('p', { clase: 'resumen', texto: 'Coincidir en el tiempo no significa que se encontraran: también cuentan el lugar y lo incompleto del registro. Las fechas son aproximadas.' })
    ])));
  }

  /* ---------- Métodos y clima ---------- */
  function pintarMetodos() {
    var cont = document.getElementById('lista-metodos');
    (A.metodos || []).forEach(function (m) {
      cont.appendChild(el('article', { clase: 'tarjeta' }, [
        el('h2', { texto: m.nombre }),
        el('p', null, [el('strong', { texto: m.pregunta })]),
        el('dl', null, [el('dt', { texto: 'Cómo funciona' }), el('dd', { texto: m.como }), el('dt', { texto: 'Qué aporta' }), el('dd', { texto: m.aporta }), el('dt', { texto: 'Qué límites tiene' }), el('dd', { texto: m.limita }), el('dt', { texto: 'Fuentes' }), el('dd', null, [fuentesDe(m.fuentes)])])
      ]));
    });
  }
  function pintarClima() {
    var cont = document.getElementById('lista-clima');
    (A.clima || []).forEach(function (c) {
      cont.appendChild(el('article', { clase: 'tarjeta' }, [el('h2', { texto: c.titulo }), el('p', { texto: c.idea }), el('p', { clase: 'resumen', texto: 'Fuentes:' }), fuentesDe(c.fuentes)]));
    });
  }

  /* ---------- Glosario ---------- */
  function pintarGlosario() {
    var datos = window.DEA_GLOSARIO || [];
    var q = document.getElementById('buscar-termino').value.trim().toLowerCase();
    var dl = document.getElementById('lista-glosario');
    dl.textContent = '';
    var n = 0;
    datos.forEach(function (e) {
      if (q && e[0].toLowerCase().indexOf(q) === -1 && e[1].toLowerCase().indexOf(q) === -1) return;
      dl.appendChild(el('dt', { texto: e[0].charAt(0).toUpperCase() + e[0].slice(1) }));
      dl.appendChild(el('dd', { texto: e[1] }));
      n++;
    });
    document.getElementById('glosario-resumen').textContent = n === 0 ? 'Ningún término coincide con la búsqueda.' : n + (n === 1 ? ' término.' : ' términos.');
  }

  /* ---------- Arranque ---------- */
  aplicarAjustes();
  pintarSesiones();
  ['tiempo-africa', 'tiempo-mioceno'].forEach(function (id) { document.getElementById(id).addEventListener('change', pintarTiempo); });
  pintarTiempo();
  pintarMapa();
  document.getElementById('buscar-especie').addEventListener('input', pintarEspecies);
  document.getElementById('especies-africa').addEventListener('change', pintarEspecies);
  pintarEspecies();
  rellenarSelect(document.getElementById('comparar-a'), porNombre('Paranthropus boisei'));
  rellenarSelect(document.getElementById('comparar-b'), porNombre('Homo erectus'));
  ['comparar-a', 'comparar-b'].forEach(function (id) { document.getElementById(id).addEventListener('change', pintarComparar); });
  pintarComparar();
  pintarMetodos();
  pintarClima();
  document.getElementById('buscar-termino').addEventListener('input', pintarGlosario);
  pintarGlosario();
  document.getElementById('boton-imprimir').addEventListener('click', function () { window.print(); });
  document.getElementById('nota-datos').textContent = (A.meta && A.meta.notaDatos) || '';
  var inicio = leerHash();
  mostrar(inicio.seccion, false);
  if (inicio.seccion === 'especies' && inicio.id) abrirFicha(inicio.id);
})();
