/* DEA · África, cuna de la humanidad.
   Usa los datos del recorrido del atlas (window.AtlasPaleo, ../atlas/recorrido/datos.js)
   y el contorno de window.DEA_MAPA. No hace peticiones de red ni guarda datos personales:
   solo recuerda, en este dispositivo, el tamaño de letra, el modo proyección, las sesiones hechas
   y las notas que escriba cada persona. */
(function () {
  'use strict';

  var A = window.AtlasPaleo;
  var MAPA = window.DEA_MAPA;
  if (!A || !A.taxones) {
    document.getElementById('aviso-error').hidden = false;
    document.documentElement.classList.add('dea-listo');
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
  // Recuentos en palabras para la prosa de la interfaz («Tres métodos…»); a partir de once, en cifras.
  function palabra(n, femenino) {
    var p = ['Ningún', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'];
    if (n > 10) return num(n, 0);
    if (n === 0) return femenino ? 'Ninguna' : 'Ningún';
    return n === 1 && femenino ? 'Una' : p[n];
  }
  function ponerRecuento(clave, texto) { document.querySelectorAll('[data-recuento="' + clave + '"]').forEach(function (n) { n.textContent = texto; }); }
  function region(t) { var r = A.regiones[t.region]; return r ? r.nombre : t.region; }
  function clado(t) { var c = A.clados[t.c]; return c ? c.nombre : t.c; }
  var almacen = {
    leer: function () { try { return JSON.parse(localStorage.getItem('dea-ajustes') || '{}'); } catch (e) { return {}; } },
    guardar: function (d) { try { localStorage.setItem('dea-ajustes', JSON.stringify(d)); } catch (e) { /* sin almacenamiento: el recurso sigue funcionando */ } }
  };
  // ¿Se puede guardar en este navegador? (navegación privada estricta o política del centro pueden impedirlo)
  var sinAlmacen = (function () { try { localStorage.setItem('dea-prueba', '1'); localStorage.removeItem('dea-prueba'); return false; } catch (e) { return true; } })();
  function avisoSinAlmacen() {
    if (!sinAlmacen) return;
    document.body.classList.add('sin-almacen');
    document.querySelectorAll('.acciones-notas').forEach(function (zona) {
      zona.parentNode.insertBefore(el('p', { clase: 'aviso aviso-almacen', role: 'note' }, [el('strong', { texto: 'Este navegador no permite guardar datos.' }), ' Sus notas y las marcas de «Sesión hecha» se perderán al cerrar la página: descargue sus notas antes de salir.']), zona);
    });
  }
  var ajustes = almacen.leer();
  ajustes.hechas = ajustes.hechas || {};
  var notas = (function () { try { return JSON.parse(localStorage.getItem('dea-notas') || '{}'); } catch (e) { return {}; } })();
  var temporizadorNotas = null;
  function guardarNotas() {
    clearTimeout(temporizadorNotas);
    temporizadorNotas = setTimeout(function () { try { localStorage.setItem('dea-notas', JSON.stringify(notas)); } catch (e) { /* sin almacenamiento */ } }, 400);
  }
  function textoPlano(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  var taxones = A.taxones.slice().sort(function (a, b) { return b.desde - a.desde || b.hasta - a.hasta; });

  /* ---------- Ajustes de lectura y proyección ---------- */
  function aplicarAjustes() {
    var i = Math.max(0, Math.min(ESCALAS.length - 1, ajustes.escala || 0));
    document.documentElement.style.setProperty('--escala', ESCALAS[i]);
    document.body.classList.toggle('proyeccion', !!ajustes.proyeccion);
    document.documentElement.classList.toggle('proyeccion', !!ajustes.proyeccion);
    // En proyección el botón cambia de nombre («Salir de la proyección») en vez de marcarse como pulsado.
    var bp = document.getElementById('boton-proyectar');
    bp.removeAttribute('aria-pressed');
    bp.textContent = ajustes.proyeccion ? 'Salir de la proyección' : 'Proyectar';
  }
  function alternarProyeccion(activar) {
    ajustes.proyeccion = activar;
    almacen.guardar(ajustes); aplicarAjustes();
    var d = document.documentElement;
    try {
      if (activar && d.requestFullscreen && !document.fullscreenElement) d.requestFullscreen().catch(function () {});
      if (!activar && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    } catch (e) { /* pantalla completa opcional */ }
  }
  document.querySelectorAll('[data-texto]').forEach(function (b) {
    b.addEventListener('click', function () {
      ajustes.escala = Math.max(0, Math.min(ESCALAS.length - 1, (ajustes.escala || 0) + Number(b.dataset.texto)));
      almacen.guardar(ajustes); aplicarAjustes();
    });
  });
  document.getElementById('boton-proyectar').addEventListener('click', function () {
    abrirAjustes(false, false);
    var salir = ajustes.proyeccion;
    alternarProyeccion(!ajustes.proyeccion);
    if (salir) focoTrasProyeccion();
  });
  // Escape también sale de la proyección (si no hay un panel abierto). En pantalla completa el navegador usa
  // Escape para salir de ella: al salir de la pantalla completa se sale también de la proyección.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !ajustes.proyeccion || e.defaultPrevented) return;
    if (document.querySelector('.ajustes.abierto, .panel-secciones.abierto')) return;
    alternarProyeccion(false); focoTrasProyeccion();
  });
  // Al salir, el foco vuelve a «Proyectar» o, si ese botón vuelve al menú plegado (teléfono), a «Ajustes».
  function focoTrasProyeccion() {
    var bp = document.getElementById('boton-proyectar');
    (bp.offsetParent ? bp : document.getElementById('boton-ajustes')).focus();
  }
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && ajustes.proyeccion) alternarProyeccion(false);
  });

  /* ---------- Menú «Ajustes» (teléfono y tableta estrecha): panel flotante accesible ---------- */
  var botonAjustes = document.getElementById('boton-ajustes'), panelAjustes = document.getElementById('panel-ajustes');
  function abrirAjustes(abrir, devolverFoco) {
    panelAjustes.classList.toggle('abierto', abrir);
    botonAjustes.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (!abrir && devolverFoco) botonAjustes.focus();
  }
  function ajustesAbiertos() { return botonAjustes.getAttribute('aria-expanded') === 'true'; }
  botonAjustes.addEventListener('click', function () { abrirAjustes(!ajustesAbiertos(), false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ajustesAbiertos()) { e.preventDefault(); abrirAjustes(false, true); }
  });
  document.addEventListener('click', function (e) {
    if (ajustesAbiertos() && !panelAjustes.contains(e.target) && !botonAjustes.contains(e.target)) abrirAjustes(false, false);
  });
  // Si el foco sale del menú con el tabulador, hacia delante o hacia atrás (Mayús+Tab vuelve al botón), se cierra.
  // Con el ratón, el clic en el propio botón ya alterna el menú: por eso el botón solo cierra cuando se tabula.
  var tabulando = false;
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') tabulando = true; }, true);
  document.addEventListener('mousedown', function () { tabulando = false; }, true);
  document.addEventListener('keyup', function (e) { if (e.key === 'Tab') tabulando = false; }, true);
  panelAjustes.addEventListener('focusout', function (e) {
    if (ajustesAbiertos() && e.relatedTarget && !panelAjustes.contains(e.relatedTarget) && (e.relatedTarget !== botonAjustes || tabulando)) abrirAjustes(false, false);
  });
  // Al pasar a ancho de escritorio el panel deja de existir como tal: se cierra.
  if (window.matchMedia) { var mqAncho = window.matchMedia('(min-width: 48rem)'); var alCambiar = function () { if (mqAncho.matches) abrirAjustes(false, false); }; if (mqAncho.addEventListener) mqAncho.addEventListener('change', alCambiar); }

  /* ---------- Navegación por secciones ---------- */
  var SECCIONES = ['inicio', 'tiempo', 'mapa', 'especies', 'comparar', 'metodos', 'clima', 'glosario', 'repaso', 'trabajo'];
  var DESCRIPCIONES = {
    tiempo: 'Qué especies vivieron y cuándo.',
    mapa: 'Dónde se han hallado, región a región.',
    especies: 'Una ficha breve de cada especie, con sus fuentes.',
    comparar: 'Si dos especies coincidieron en el tiempo.',
    metodos: 'Cómo se fechan y se estudian los fósiles.',
    clima: 'Qué relación hay entre ambiente y evolución.',
    glosario: 'El significado de los términos técnicos.',
    repaso: 'Preguntas para comprobar lo aprendido.',
    trabajo: 'Orientaciones para el trabajo individual.'
  };
  function nombreSeccion(id) { var a = document.querySelector('.pestanas-pista a[data-seccion="' + id + '"]'); return a ? a.textContent : id; }
  function avisoPestanas() {
    var n = document.querySelector('.pestanas-pista');
    var desborda = n.scrollWidth > n.clientWidth + 4;
    document.querySelector('.pestanas').classList.toggle('desborda', desborda);
    if (!desborda && seccionesAbiertas()) abrirSecciones(false, false);
    n.classList.toggle('hay-mas', n.scrollLeft + n.clientWidth < n.scrollWidth - 4);
    n.classList.toggle('hay-antes', n.scrollLeft > 4);
  }
  // Deja la pestaña actual entera a la vista (con la anterior como contexto si cabe), respetando el ajuste por pestañas.
  function verPestana(a) {
    var n = a.parentNode, pad = parseFloat(getComputedStyle(n).paddingLeft) || 0;
    var izq = a.getBoundingClientRect().left - n.getBoundingClientRect().left + n.scrollLeft;
    var previa = a.previousElementSibling;
    var objetivo = previa ? previa.getBoundingClientRect().left - n.getBoundingClientRect().left + n.scrollLeft : izq;
    var margen = parseFloat(getComputedStyle(document.documentElement).fontSize) * 3; // ancho de la máscara (--e-7)
    if (objetivo + n.clientWidth - margen < izq + a.offsetWidth) objetivo = izq;
    n.scrollLeft = Math.max(0, objetivo - pad);
  }
  /* «Secciones»: panel con las diez secciones (teléfono, o cuando las pestañas no caben). */
  var botonSecciones = document.getElementById('boton-secciones'), panelSecciones = document.getElementById('panel-secciones');
  function seccionesAbiertas() { return botonSecciones.getAttribute('aria-expanded') === 'true'; }
  function abrirSecciones(abrir, devolverFoco) {
    panelSecciones.classList.toggle('abierto', abrir);
    botonSecciones.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (!abrir && devolverFoco) botonSecciones.focus();
  }
  document.querySelectorAll('.pestanas-pista a').forEach(function (a) {
    var en = el('a', { href: a.getAttribute('href'), 'data-seccion': a.dataset.seccion, texto: a.textContent });
    en.addEventListener('click', function () { abrirSecciones(false, false); });
    panelSecciones.appendChild(el('li', null, [en]));
  });
  botonSecciones.addEventListener('click', function () { abrirSecciones(!seccionesAbiertas(), false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && seccionesAbiertas()) { e.preventDefault(); abrirSecciones(false, true); } });
  document.addEventListener('click', function (e) { if (seccionesAbiertas() && !panelSecciones.contains(e.target) && !botonSecciones.contains(e.target)) abrirSecciones(false, false); });
  panelSecciones.addEventListener('focusout', function (e) { if (seccionesAbiertas() && e.relatedTarget && !panelSecciones.contains(e.relatedTarget) && (e.relatedTarget !== botonSecciones || tabulando)) abrirSecciones(false, false); });
  // Pestaña que recibe el foco con el teclado: entera a la vista. Mientras una pestaña tiene el foco, la pista no
  // aplica la máscara de «hay más» (clase .con-foco) y el anillo va por dentro de la píldora: nada lo recorta ni lo
  // tapa el botón «Secciones», que queda fuera de la pista.
  function pestanaALaVista(a) {
    var n = a.parentNode, base = n.getBoundingClientRect().left;
    var izq = a.getBoundingClientRect().left - base, dch = izq + a.offsetWidth, margen = 2;
    n.classList.add('con-foco');
    n.style.scrollSnapType = 'none';
    if (izq < margen) n.scrollLeft += izq - margen;
    else if (dch > n.clientWidth - margen) n.scrollLeft += dch - n.clientWidth + margen;
    avisoPestanas();
  }
  document.querySelectorAll('.pestanas-pista a').forEach(function (a) {
    a.addEventListener('focus', function () { if (tabulando) pestanaALaVista(a); });
    a.addEventListener('blur', function () { a.parentNode.classList.remove('con-foco'); a.parentNode.style.scrollSnapType = ''; });
  });
  function pintarPasoSeccion(id) {
    var nav = document.getElementById('paso-seccion');
    nav.textContent = '';
    var i = SECCIONES.indexOf(id);
    if (i > 0) nav.appendChild(el('a', { href: '#' + SECCIONES[i - 1], clase: 'anterior' }, ['← ' + nombreSeccion(SECCIONES[i - 1])]));
    else nav.appendChild(el('span'));
    if (i < SECCIONES.length - 1) nav.appendChild(el('a', { href: '#' + SECCIONES[i + 1], clase: 'siguiente' }, [nombreSeccion(SECCIONES[i + 1]) + ' →']));
  }
  function mostrar(id, enfocar) {
    if (SECCIONES.indexOf(id) === -1) id = 'inicio';
    document.querySelectorAll('.seccion').forEach(function (s) { s.hidden = s.dataset.seccion !== id; });
    document.querySelectorAll('.pestanas a').forEach(function (a) {
      if (a.dataset.seccion === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    verPestana(document.querySelector('.pestanas-pista a[data-seccion="' + id + '"]'));
    avisoPestanas();
    pintarPasoSeccion(id);
    var titulo = document.getElementById(id).querySelector('h1');
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
    irADetalle(r);
  });
  function irADetalle(r) {
    if (!r.id) return;
    if (r.seccion === 'especies') abrirFicha(r.id);
    else if (r.seccion === 'mapa' && A.regiones[r.id]) elegirRegion(r.id);
    else if (r.seccion === 'tiempo') resaltarEnTiempo(r.id);
    else if (r.seccion === 'comparar') { var sel = document.getElementById('comparar-a'); sel.value = r.id; if (sel.value === r.id) pintarComparar(); }
    else if (r.seccion === 'inicio') { var d = document.getElementById('bloque-sesion-' + r.id); if (d) { d.open = true; d.scrollIntoView({ block: 'start' }); } }
  }

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
  // Bloque «Continuar»: la sesión que toca (o «Empezar por la sesión 1», o el repaso si todas están hechas).
  function pintarContinuar() {
    var caja = document.getElementById('continuar');
    var pendiente = SESIONES.filter(function (s) { return !ajustes.hechas[s.n]; })[0];
    var empezada = SESIONES.some(function (s) { return ajustes.hechas[s.n]; }) || Object.keys(notas).some(function (k) { return (notas[k] || '').trim(); });
    caja.textContent = '';
    if (!pendiente) {
      caja.appendChild(el('p', { clase: 'continuar-rotulo', texto: 'Sesiones completadas' }));
      caja.appendChild(el('p', { clase: 'continuar-titulo', texto: 'Ha completado las ' + palabra(SESIONES.length, true).toLowerCase() + ' sesiones' }));
      caja.appendChild(el('p', { texto: 'Compruebe lo aprendido con preguntas nuevas.' }));
      caja.appendChild(el('a', { clase: 'boton', href: '#repaso', texto: 'Ir al repaso' }));
    } else {
      caja.appendChild(el('p', { clase: 'continuar-rotulo', texto: (empezada ? 'Le toca · ' : 'Para empezar · ') + 'sesión ' + pendiente.n + ' de ' + SESIONES.length }));
      caja.appendChild(el('p', { clase: 'continuar-titulo', texto: pendiente.titulo }));
      caja.appendChild(el('p', { texto: pendiente.pregunta }));
      var ir = el('a', { clase: 'boton', href: '#inicio/' + pendiente.n, texto: empezada ? 'Continuar la sesión' : 'Empezar por la sesión 1' });
      ir.addEventListener('click', function (e) {
        e.preventDefault();
        var d = document.getElementById('bloque-sesion-' + pendiente.n);
        d.open = true; d.scrollIntoView({ block: 'start' });
        var su = d.querySelector('summary'); su.focus({ preventScroll: true });
      });
      caja.appendChild(ir);
    }
    caja.hidden = false;
  }
  function pintarProgreso() {
    pintarContinuar();
    var hechas = SESIONES.filter(function (s) { return ajustes.hechas[s.n]; }).length;
    document.getElementById('progreso-sesiones').textContent = hechas === 0
      ? SESIONES.length + ' sesiones · ninguna hecha'
      : 'Ha completado ' + hechas + ' de ' + SESIONES.length + ' sesiones.';
  }
  function pintarSesiones() {
    var cont = document.getElementById('lista-sesiones');
    var primeraPendiente = SESIONES.filter(function (s) { return !ajustes.hechas[s.n]; })[0];
    SESIONES.forEach(function (s) {
      var art = el('details', { clase: 'sesion chevron-sumario', id: 'bloque-sesion-' + s.n });
      if (primeraPendiente && primeraPendiente.n === s.n) art.open = true;
      var estado = el('span', { clase: 'etiqueta hecha', texto: 'Hecha' });
      estado.hidden = !ajustes.hechas[s.n];
      art.appendChild(el('summary', null, [
        el('span', { clase: 'numero', 'aria-hidden': 'true', texto: String(s.n) }),
        el('span', { clase: 'cabecera-sesion' }, [el('h3', { id: 'sesion-' + s.n, texto: 'Sesión ' + s.n + '. ' + s.titulo }), el('span', { clase: 'pregunta', texto: s.pregunta })]),
        estado
      ]));
      if (s.contenido) { var bloque = el('div', { clase: 'contenido' }); bloque.innerHTML = s.contenido; art.appendChild(bloque); }
      var ol = el('ol');
      s.pasos.forEach(function (p, i) {
        var li = el('li'); li.innerHTML = p;
        var clave = s.n + '-' + i, idNota = 'nota-' + clave;
        var area = el('textarea', { id: idNota, rows: '3', 'aria-label': 'Mis notas del paso ' + (i + 1) + ' de la sesión ' + s.n });
        area.value = notas[clave] || '';
        var impresa = el('div', { clase: 'nota-impresa', 'aria-hidden': 'true', texto: area.value });
        area.addEventListener('input', function () { notas[clave] = area.value; impresa.textContent = area.value; guardarNotas(); });
        li.appendChild(el('div', { clase: 'nota' }, [el('label', { for: idNota, texto: 'Mis notas' }), area, impresa]));
        ol.appendChild(li);
      });
      art.appendChild(ol);
      art.appendChild(el('p', { clase: 'trabajo' }, [el('strong', { texto: 'Para su trabajo: ' }), s.trabajo]));
      if (s.fuentes) {
        var uf = el('ul', { clase: 'fuentes-sesion' });
        s.fuentes.forEach(function (f) { uf.appendChild(el('li', null, [el('a', { href: f[1], rel: 'noopener noreferrer', texto: f[0] })])); });
        art.appendChild(el('details', { clase: 'fuentes-plegadas' }, [el('summary', { texto: 'Fuentes de esta sesión (consultadas el 9 de noviembre de 2026)' }), uf]));
      }
      var pie = el('div', { clase: 'pie-sesion' });
      var mas = el('span', null, ['Para profundizar: ']);
      s.mas.forEach(function (m, i) { if (i) mas.appendChild(document.createTextNode(' · ')); mas.appendChild(el('a', { href: m[0], texto: m[1] })); });
      var id = 'hecha-' + s.n;
      var caja = el('input', { type: 'checkbox', id: id });
      caja.checked = !!ajustes.hechas[s.n];
      caja.addEventListener('change', function () { ajustes.hechas[s.n] = caja.checked; estado.hidden = !caja.checked; almacen.guardar(ajustes); pintarProgreso(); });
      pie.appendChild(mas);
      pie.appendChild(el('label', { for: id }, [caja, ' Sesión hecha']));
      art.appendChild(pie);
      cont.appendChild(art);
    });
    pintarProgreso();
    var indice = document.getElementById('indice-secciones');
    SECCIONES.slice(1).forEach(function (id) {
      indice.appendChild(el('li', null, [el('a', { href: '#' + id }, [el('strong', { texto: nombreSeccion(id) }), el('span', { texto: DESCRIPCIONES[id] })])]));
    });
  }

  /* ---------- Notas: descarga y borrado (todo ocurre en el dispositivo) ---------- */
  function textoNotas() {
    var lineas = ['África, cuna de la humanidad · Diploma de Estudios Africanos (ULPGC)', 'Mis notas', ''];
    var hay = false;
    SESIONES.forEach(function (s) {
      var propias = s.pasos.map(function (p, i) { return (notas[s.n + '-' + i] || '').trim(); });
      if (!propias.some(Boolean)) return;
      hay = true;
      lineas.push('SESIÓN ' + s.n + '. ' + s.titulo.toUpperCase(), s.pregunta, '');
      s.pasos.forEach(function (p, i) {
        if (!propias[i]) return;
        lineas.push('Paso ' + (i + 1) + '. ' + textoPlano(p), propias[i], '');
      });
      lineas.push('Para su trabajo: ' + s.trabajo, '');
    });
    return hay ? lineas.join('\r\n') : '';
  }
  function avisarNotas(texto) { document.querySelectorAll('[data-estado-notas]').forEach(function (n) { n.textContent = texto; }); }
  document.querySelectorAll('[data-accion="descargar-notas"]').forEach(function (b) {
    b.addEventListener('click', function () {
      var texto = textoNotas();
      if (!texto) { avisarNotas('Todavía no ha escrito ninguna nota.'); return; }
      var url = URL.createObjectURL(new Blob(['\ufeff' + texto], { type: 'text/plain;charset=utf-8' }));
      var a = el('a', { href: url, download: 'mis-notas-africa-cuna-de-la-humanidad.txt' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      avisarNotas('Notas descargadas como archivo de texto.');
    });
  });
  document.querySelectorAll('[data-accion="borrar-notas"]').forEach(function (b) {
    var original = b.textContent, armado = false, reloj = null;
    b.addEventListener('click', function () {
      if (!armado) {
        armado = true; b.textContent = 'Pulse otra vez para borrar todas sus notas';
        reloj = setTimeout(function () { armado = false; b.textContent = original; }, 6000);
        return;
      }
      clearTimeout(reloj); armado = false; b.textContent = original;
      notas = {};
      try { localStorage.removeItem('dea-notas'); } catch (e) { /* sin almacenamiento */ }
      document.querySelectorAll('.nota textarea').forEach(function (t) { t.value = ''; });
      document.querySelectorAll('.nota-impresa').forEach(function (d) { d.textContent = ''; });
      avisarNotas('Notas borradas de este dispositivo.');
    });
  });

  /* ---------- Línea del tiempo ---------- */
  function pista(t, max) {
    var izq = (max - Math.min(t.desde, max)) / max * 100;
    var ancho = Math.max((Math.min(t.desde, max) - t.hasta) / max * 100, 0.6);
    var barra = el('span', { clase: 'barra' + (t.debatido ? ' debatida' : '') });
    barra.style.left = izq + '%'; barra.style.width = ancho + '%';
    return el('div', { clase: 'pista', 'aria-hidden': 'true' }, [barra]);
  }
  // Celda del gráfico de la línea del tiempo: la barra centrada sobre la rejilla de millones de años.
  function pistaTiempo(t, max) {
    var celda = pista(t, max);
    celda.className = 'pista-tiempo';
    return celda;
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
        // El nombre accesible del enlace lleva la frase completa (empieza por el nombre visible).
        el('a', { clase: 'nombre', href: '#especies/' + t.id, 'aria-label': t.n + ': ' + intervalo(t).toLowerCase() + (soloAfrica ? '' : ' · ' + region(t)) + (t.debatido ? ' · debatida' : '') }, [el('i', { texto: t.n })]),
        el('span', { clase: 'fechas', 'aria-hidden': 'true', texto: corto(t) }),
        soloAfrica ? null : el('span', { clase: 'region', 'aria-hidden': 'true', texto: region(t) }),
        t.debatido ? el('span', { clase: 'etiqueta', 'aria-hidden': 'true', texto: 'Debatida' }) : null
      ]);
      ol.appendChild(el('li', { 'data-id': t.id }, [texto, pistaTiempo(t, max)]));
    });
    // Rejilla y eje: una línea por millón de años; rótulos cada millón (cada cinco con el Mioceno).
    ol.style.setProperty('--paso', (100 / max) + '%');
    var paso = max > 10 ? 5 : 1, marcas = el('div', { clase: 'eje-tiempo' });
    for (var v = Math.floor(max / paso) * paso; v > 0; v -= paso) {
      var m = el('span', { texto: num(v, 0) + (v === Math.floor(max / paso) * paso ? ' Ma' : '') }); m.style.left = ((max - v) / max * 100) + '%'; marcas.appendChild(m);
    }
    var hoy = el('span', { texto: 'hoy' }); hoy.style.left = '100%'; marcas.appendChild(hoy);
    var eje = el('li', { clase: 'fila-eje', 'aria-hidden': 'true' }, [el('span', { clase: 'unidad-eje', texto: 'Millones de años' }), marcas]);
    ol.insertBefore(eje, ol.firstChild);
    document.getElementById('tiempo-resumen').textContent = lista.length + ' especies o poblaciones, de la más antigua a la más reciente (Ma: millones de años). Las barras rayadas y la etiqueta «Debatida» indican validez debatida.';
  }

  // Al llegar desde una ficha (#tiempo/<id>): se muestra su barra resaltada, centrada y con el foco en su nombre.
  function resaltarEnTiempo(id) {
    var t = taxones.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    var cambio = false;
    if (!esAfrica(t) && document.getElementById('tiempo-africa').checked) { document.getElementById('tiempo-africa').checked = false; cambio = true; }
    if (t.desde > LIMITE_MIOCENO && !document.getElementById('tiempo-mioceno').checked) { document.getElementById('tiempo-mioceno').checked = true; cambio = true; }
    if (cambio) pintarTiempo();
    var li = document.querySelector('#lista-tiempo li[data-id="' + id + '"]');
    if (!li) return;
    document.querySelectorAll('#lista-tiempo li.elegida').forEach(function (n) { n.classList.remove('elegida'); });
    li.classList.add('elegida');
    var a = li.querySelector('a.nombre');
    a.focus({ preventScroll: true });
    li.scrollIntoView({ block: 'center' });
  }
  function pintarDia() {
    var primero = taxones.filter(function (x) { return x.n === 'Sahelanthropus tchadensis'; })[0];
    var total = primero ? primero.desde : 7, ul = document.getElementById('lista-dia'), hitosDia = [];
    document.getElementById('dia-total').textContent = num(total, 1);
    function hora(ma) {
      var seg = Math.round((1 - ma / total) * 86400), h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60);
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }
    [['Sahelanthropus tchadensis', 'el hominino más antiguo propuesto'], ['Australopithecus afarensis', 'la especie de «Lucy»'], ['Homo erectus', null], ['Homo sapiens', 'nuestra especie']].forEach(function (par) {
      var t = taxones.filter(function (x) { return x.n === par[0]; })[0];
      if (!t || t.desde > total) return;
      hitosDia.push(t.desde);
      ul.appendChild(el('li', null, [el('strong', { texto: (t.desde === total ? 'A medianoche (00:00): ' : 'A las ' + hora(t.desde) + ': ') }), el('i', { texto: t.n }), (par[1] ? ', ' + par[1] : '') + ' (' + hace(t.desde) + ').']));
    });
    var segundos = Math.round(2000 / (total * 1e6) * 86400);
    ul.appendChild(el('li', null, [el('strong', { texto: 'En los últimos ' + segundos + ' segundos: ' }), 'los últimos 2000 años de historia.']));
    // Franja del día (decorativa para lectores de pantalla: la lista dice lo mismo). Hitos numerados como la lista.
    var posiciones = hitosDia.concat([2000 / 1e6]).map(function (ma) { return (1 - ma / total) * 100; });
    var franja = el('div', { clase: 'franja' }), nums = [];
    posiciones.forEach(function (x, i) {
      var h = el('span', { clase: 'hito' }); h.style.left = x + '%'; franja.appendChild(h);
      var n = el('span', { clase: 'num' + (i % 2 ? ' abajo' : ''), texto: String(i + 1) }); n.style.left = x + '%'; nums.push(n);
    });
    var horas = el('div', { clase: 'horas' }, ['00:00', '06:00', '12:00', '18:00', '24:00'].map(function (h) { return el('span', { texto: h }); }));
    ul.parentNode.insertBefore(el('div', { clase: 'reloj-dia', 'aria-hidden': 'true' }, [franja, horas].concat(nums)), ul);
  }

  /* ---------- Mapa ---------- */
  // Presentación (no son datos del atlas): zonas, orden y numeración de las regiones, igual en el mapa y en la lista.
  var ZONAS = [
    ['África septentrional', ['magreb']],
    ['África central', ['chad']],
    ['Todo el continente', ['africa']],
    ['África austral', ['sudafrica']],
    ['África oriental (Rift)', ['afar', 'chorora', 'omo', 'uganda', 'tugen', 'turkana', 'nakali', 'victoria']]
  ];
  var RIFT = ZONAS[4][1];
  // Recuadro ampliado del Rift: longitudes 33-42 E, latitudes 12,5 N-3,5 S, a escala ×2,5 (mismos datos que el mapa).
  var RECUADRO = { x0: 53, y0: 25.5, ancho: 9, alto: 16, k: 2.5 };
  var regionActiva = null, numeroDe = {};
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { var n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }
  function nombreRegion(clave) { return A.regiones[clave].nombre; }
  function recuento(clave) { return taxones.filter(function (t) { return t.region === clave; }).length; }
  // Punto pulsable y numerado; el foco es el contorno del propio grupo (ver dea.css).
  function puntoMapa(svg, clave, x, y) {
    var n = recuento(clave), num = numeroDe[clave];
    var etiqueta = num + '. ' + nombreRegion(clave) + ' (' + n + (n === 1 ? ' especie)' : ' especies)');
    var g = svgEl('g', { 'class': 'punto', tabindex: '0', role: 'button', 'aria-label': etiqueta, 'aria-pressed': 'false', 'data-region': clave });
    var tt = svgEl('title'); tt.textContent = etiqueta; g.appendChild(tt);
    g.appendChild(svgEl('circle', { cx: x, cy: y, r: '2.7', 'class': 'zona' }));
    g.appendChild(svgEl('circle', { cx: x, cy: y, r: '2.1', 'class': 'marca' }));
    var t = svgEl('text', { x: x, y: y, 'class': 'numero-punto', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'aria-hidden': 'true' }); t.textContent = String(num); g.appendChild(t);
    g.addEventListener('click', function () { elegirRegion(clave, true); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegirRegion(clave, true); } });
    return g;
  }
  // Separa los marcadores del recuadro que se solaparían; una línea guía los une con su posición real.
  function separar(pos, minimo) {
    for (var it = 0; it < 120; it++) {
      var movido = false;
      for (var a = 0; a < pos.length; a++) for (var b = a + 1; b < pos.length; b++) {
        var dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y, d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (d < minimo) { var m = (minimo - d) / 2, ux = dx / d, uy = dy / d; pos[a].x -= ux * m; pos[a].y -= uy * m; pos[b].x += ux * m; pos[b].y += uy * m; movido = true; }
      }
      if (!movido) break;
    }
  }
  function pintarMapa() {
    var svg = document.getElementById('mapa-svg'), rift = document.getElementById('mapa-rift');
    var n = 0; ZONAS.forEach(function (z) { z[1].forEach(function (c) { if (A.regiones[c]) numeroDe[c] = ++n; }); });
    svg.setAttribute('viewBox', MAPA ? MAPA.viewBox : '0 0 75 76');
    var R = RECUADRO;
    rift.setAttribute('viewBox', '0 0 ' + (R.ancho * R.k) + ' ' + (R.alto * R.k));
    if (MAPA) {
      ['africa', 'canarias'].forEach(function (k) {
        svg.appendChild(svgEl('path', { d: MAPA[k], 'class': 'tierra', 'aria-hidden': 'true' }));
        if (k === 'africa') { var g = svgEl('g', { transform: 'scale(' + R.k + ') translate(' + (-R.x0) + ' ' + (-R.y0) + ')', 'aria-hidden': 'true' }); g.appendChild(svgEl('path', { d: MAPA[k], 'class': 'tierra' })); rift.appendChild(g); }
      });
      // Rótulo de Canarias en el océano, por encima de las islas y lejos de la costa y del punto 1; una línea lo une con ellas.
      svg.appendChild(svgEl('line', { x1: '3.6', y1: '3.7', x2: '3.6', y2: '8.4', 'class': 'guia', 'aria-hidden': 'true' }));
      var tc = svgEl('text', { x: '0.6', y: '3', 'class': 'rotulo-mapa', 'aria-hidden': 'true' }); tc.textContent = 'Canarias'; svg.appendChild(tc);
    }
    // Recuadro del Rift señalado en el mapa general.
    svg.appendChild(svgEl('rect', { x: R.x0, y: R.y0, width: R.ancho, height: R.alto, 'class': 'marco-rift', 'aria-hidden': 'true' }));
    var posRift = [];
    ZONAS.forEach(function (z) {
      z[1].forEach(function (clave) {
        var r = A.regiones[clave]; if (!r) return;
        var x = r.lon + 20, y = 38 - r.lat;
        if (RIFT.indexOf(clave) === -1) svg.appendChild(puntoMapa(svg, clave, x.toFixed(2), y.toFixed(2)));
        else {
          svg.appendChild(svgEl('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: '.7', 'class': 'punto-rift', 'aria-hidden': 'true' }));
          posRift.push({ clave: clave, rx: (x - R.x0) * R.k, ry: (y - R.y0) * R.k, x: (x - R.x0) * R.k, y: (y - R.y0) * R.k });
        }
      });
    });
    separar(posRift, 5.8);
    // Que ningún marcador quede cortado por el borde del recuadro.
    posRift.forEach(function (p) { p.x = Math.min(Math.max(p.x, 3.2), R.ancho * R.k - 3.2); p.y = Math.min(Math.max(p.y, 3.2), R.alto * R.k - 3.2); });
    separar(posRift, 5.8);
    // Línea guía y punto de posición solo cuando la posición real queda claramente fuera del marcador (área 2,7 más
    // el diámetro del punto); si no, el propio marcador ya señala su posición aproximada y no quedan puntos a medio tapar
    // ni pegados a un marcador vecino. Con los datos actuales ningún marcador del recuadro se desplaza tanto.
    posRift.forEach(function (p) {
      var dx = p.x - p.rx, dy = p.y - p.ry, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 3.9) return;
      var bx = p.x - dx / d * 2.1, by = p.y - dy / d * 2.1;
      rift.appendChild(svgEl('line', { x1: p.rx.toFixed(2), y1: p.ry.toFixed(2), x2: bx.toFixed(2), y2: by.toFixed(2), 'class': 'guia', 'aria-hidden': 'true' }));
      rift.appendChild(svgEl('circle', { cx: p.rx.toFixed(2), cy: p.ry.toFixed(2), r: '.6', 'class': 'posicion', 'aria-hidden': 'true' }));
    });
    var riftDesc = document.getElementById('rift-desc');
    if (riftDesc) riftDesc.textContent = 'Ampliación de África oriental con las regiones del Rift, que en el mapa general se superponen. Cuando un número no cabe sobre su posición aproximada, una línea lo une con ella.';
    posRift.forEach(function (p) { rift.appendChild(puntoMapa(rift, p.clave, p.x.toFixed(2), p.y.toFixed(2))); });
    // Lista agrupada por zona, con el número del mapa y el recuento alineado.
    var cont = document.getElementById('lista-regiones');
    ZONAS.forEach(function (z) {
      var claves = z[1].filter(function (c) { return A.regiones[c]; });
      if (!claves.length) return;
      var ul = el('ul', { clase: 'regiones' });
      claves.forEach(function (clave) {
        var k = recuento(clave);
        var b = el('button', { type: 'button', 'aria-pressed': 'false', 'data-region': clave, 'aria-label': numeroDe[clave] + '. ' + nombreRegion(clave) + ', ' + k + (k === 1 ? ' especie' : ' especies') }, [
          el('span', { clase: 'numero-region', texto: String(numeroDe[clave]) }),
          el('span', { clase: 'nombre-region', texto: nombreRegion(clave) }),
          el('span', { clase: 'recuento', texto: k + (k === 1 ? ' especie' : ' especies') })
        ]);
        b.addEventListener('click', function () { elegirRegion(clave, true); });
        ul.appendChild(el('li', null, [b]));
      });
      cont.appendChild(el('div', { clase: 'zona-regiones' }, [el('h3', { texto: z[0] }), ul]));
    });
  }
  function elegirRegion(clave, porUsuario) {
    regionActiva = clave;
    document.querySelectorAll('.mapas .punto').forEach(function (c) { var si = c.dataset.region === clave; c.classList.toggle('activo', si); c.setAttribute('aria-pressed', si ? 'true' : 'false'); });
    document.querySelectorAll('#lista-regiones button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.region === clave ? 'true' : 'false'); });
    var r = A.regiones[clave];
    var det = document.getElementById('detalle-region');
    det.textContent = '';
    // Regiones del atlas fuera de África (#mapa/europa…): no tienen número ni punto en este mapa; se dice así.
    var enMapa = numeroDe[clave] !== undefined;
    var ul = el('ul');
    taxones.filter(function (t) { return t.region === clave; }).forEach(function (t) {
      ul.appendChild(el('li', null, [el('a', { href: '#especies/' + t.id }, [el('i', { texto: t.n })]), ' · ', el('span', { clase: 'fechas', texto: corto(t) }), t.debatido ? ' ' : null, t.debatido ? el('span', { clase: 'etiqueta', texto: 'Debatida' }) : null]));
    });
    var titulo = enMapa ? el('h2', null, [el('span', { clase: 'numero-region', 'aria-hidden': 'true', texto: String(numeroDe[clave]) }), ' ' + r.nombre]) : el('h2', { texto: r.nombre });
    var fuera = enMapa ? null : el('p', { clase: 'resumen' }, ['Esta región queda fuera del mapa de África, por eso no tiene número ni punto. ', el('a', { href: '#mapa', texto: 'Volver a las regiones africanas' })]);
    det.appendChild(el('div', { clase: 'tarjeta' }, [titulo, fuera, ul.childNodes.length ? ul : el('p', { clase: 'resumen', texto: 'No hay fichas de esta región en el recurso.' })]));
    // Que el detalle quede a la vista (en el teléfono queda debajo del mapa).
    if (porUsuario) det.scrollIntoView({ block: 'nearest' });
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
  var IMAGENES = window.DEA_IMAGENES || {};
  function figura(t, compacta) {
    var im = IMAGENES[t.id];
    if (!im) return null;
    var img = el('img', { src: im.src, width: String(im.w), height: String(im.h), alt: im.alt, loading: 'lazy', decoding: 'async' });
    var pie = el('figcaption', null, [im.objeto + '. ']);
    // Si la imagen no carga: aviso en lugar del icono roto; el pie, con su crédito, se conserva.
    img.addEventListener('error', function () {
      var fig = img.parentNode; if (!fig || fig.classList.contains('sin-imagen')) return;
      fig.classList.add('sin-imagen'); img.hidden = true;
      fig.insertBefore(el('p', { clase: 'aviso-imagen', texto: 'Imagen no disponible en este momento. Mostraba: ' + im.alt + '.' }), img);
    });
    if (!compacta) {
      pie.appendChild(el('span', { clase: 'credito' }, [im.credito + ' · ', el('a', { href: im.licenciaUrl, rel: 'noopener noreferrer license', texto: im.licencia }), ' · ', el('a', { href: im.fuente, rel: 'noopener noreferrer', texto: 'Wikimedia Commons' })]));
    }
    return el('figure', { clase: 'figura' + (compacta ? ' compacta' : '') }, [img, pie]);
  }
  function pintarEspecies() {
    var q = document.getElementById('buscar-especie').value.trim().toLowerCase();
    var soloAfrica = document.getElementById('especies-africa').checked;
    var coincide = function (t) { return !q || t.n.toLowerCase().indexOf(q) !== -1; };
    var lista = taxones.filter(function (t) { return (!soloAfrica || esAfrica(t)) && coincide(t); });
    var cont = document.getElementById('lista-especies');
    cont.textContent = '';
    lista.forEach(function (t) {
      var sum = el('summary', null, [el('span', { clase: 'cabeza-ficha' }, [
        el('span', { clase: 'nombre-cientifico', texto: t.n }),
        el('span', { clase: 'meta-ficha' }, [el('span', { clase: 'fechas', texto: corto(t) }), t.debatido ? el('span', { clase: 'etiqueta', texto: 'Debatida' }) : null])
      ])]);
      // Datos esenciales (Cuándo, Dónde, Grupo) en una franja; después la imagen y el resto de la ficha.
      var esenciales = el('dl', { clase: 'esenciales' }, [
        el('div', null, [el('dt', { texto: 'Cuándo' }), el('dd', { texto: intervalo(t) + ' (aproximado).' })]),
        el('div', t.geoNota ? { clase: 'ancho' } : null, [el('dt', { texto: 'Dónde' }), el('dd', { texto: region(t) + (t.geoNota ? '. ' + t.geoNota : '') })]),
        el('div', null, [el('dt', { texto: 'Grupo' }), el('dd', { texto: clado(t) })])
      ]);
      var dl = el('dl', { clase: 'texto-ficha' }, [
        el('dt', { texto: 'Qué se sabe' }), el('dd', { texto: t.nota || '' })
      ]);
      if (t.etimologia) { dl.appendChild(el('dt', { texto: 'Origen del nombre' })); dl.appendChild(el('dd', { texto: t.etimologia })); }
      dl.appendChild(el('dt', { texto: 'Fuentes' })); dl.appendChild(el('dd', null, [fuentesDe(t.fuentes)]));
      // Enlaces cruzados: acciones secundarias al pie de la ficha.
      var cruces = el('p', { clase: 'cruces' });
      if (esAfrica(t)) cruces.appendChild(el('a', { clase: 'boton', href: '#mapa/' + t.region, texto: 'Ver en el mapa' }));
      cruces.appendChild(el('a', { clase: 'boton', href: '#tiempo/' + t.id, texto: 'Ver en la línea del tiempo' }));
      cruces.appendChild(el('a', { clase: 'boton', href: '#comparar/' + t.id, texto: 'Comparar con otra especie' }));
      cont.appendChild(el('details', { clase: 'ficha chevron-sumario', id: 'ficha-' + t.id }, [sum, el('div', { clase: 'cuerpo-ficha' }, [esenciales, figura(t, false), dl, cruces])]));
    });
    document.getElementById('especies-resumen').textContent = lista.length === 0 ? 'Ninguna especie coincide con la búsqueda.' : lista.length + (lista.length === 1 ? ' ficha.' : ' fichas.');
    if (!lista.length) {
      // Estado vacío con salida: ampliar a fuera de África si allí hay coincidencias, o borrar la búsqueda.
      var fuera = soloAfrica ? taxones.filter(function (t) { return !esAfrica(t) && coincide(t); }).length : 0;
      var acciones = el('div', { clase: 'acciones' });
      var buscar = document.getElementById('buscar-especie');
      if (fuera) {
        var ampliar = el('button', { type: 'button', texto: 'Buscar también fuera de África' });
        ampliar.addEventListener('click', function () { document.getElementById('especies-africa').checked = false; pintarEspecies(); buscar.focus(); });
        acciones.appendChild(ampliar);
      }
      if (q) {
        var borrar = el('button', { type: 'button', texto: 'Borrar la búsqueda' });
        borrar.addEventListener('click', function () { buscar.value = ''; pintarEspecies(); buscar.focus(); });
        acciones.appendChild(borrar);
      }
      cont.appendChild(el('div', { clase: 'vacio' }, [
        fuera ? el('p', { texto: (fuera === 1 ? 'Hay 1 coincidencia' : 'Hay ' + fuera + ' coincidencias') + ' fuera de África («Solo África» está marcado).' }) : null,
        acciones
      ]));
    }
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
    sel.appendChild(el('option', { value: '', texto: 'Elija una especie' }));
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
  // Paso de la rejilla del gráfico según el intervalo que se muestra.
  function pasoEje(max) { return max <= 1 ? 0.1 : max <= 3 ? 0.5 : max <= 12 ? 1 : 5; }
  // Un único gráfico: las dos barras sobre el mismo eje, con la franja de coincidencia sombreada.
  function graficoComparar(lista, max, ini, fin) {
    var area = el('div', { clase: 'area-comparar' });
    area.style.setProperty('--paso', (pasoEje(max) / max * 100) + '%');
    if (ini !== null && ini > fin) {
      var f = el('div', { clase: 'franja-coincidencia' });
      f.style.left = ((max - ini) / max * 100) + '%'; f.style.width = ((ini - fin) / max * 100) + '%';
      area.appendChild(f);
    }
    lista.forEach(function (t) {
      var barra = el('span', { clase: 'barra' + (t.debatido ? ' debatida' : '') });
      barra.style.left = ((max - Math.min(t.desde, max)) / max * 100) + '%';
      barra.style.width = Math.max((Math.min(t.desde, max) - t.hasta) / max * 100, 0.6) + '%';
      area.appendChild(el('div', { clase: 'fila-grafico' }, [
        el('p', { clase: 'nombre-grafico' }, [el('i', { texto: t.n }), ' ', el('span', { clase: 'fechas', texto: corto(t) }), t.debatido ? ' ' : null, t.debatido ? el('span', { clase: 'etiqueta', texto: 'Debatida' }) : null]),
        el('div', { clase: 'carril', 'aria-hidden': 'true' }, [barra])
      ]));
    });
    var paso = pasoEje(max), eje = el('div', { clase: 'eje-tiempo eje-comparar', 'aria-hidden': 'true' });
    var dec = paso < 1 ? 1 : 0;
    for (var v = Math.floor(max / paso + 1e-9) * paso; v > 1e-9; v -= paso) {
      var m = el('span', { texto: num(+v.toFixed(2), dec) }); m.style.left = ((max - v) / max * 100) + '%';
      if (max - v < 1e-9) m.className = 'al-borde';
      eje.appendChild(m);
    }
    var hoy = el('span', { texto: 'hoy' }); hoy.style.left = '100%'; eje.appendChild(hoy);
    area.appendChild(eje);
    return el('div', { clase: 'grafico-comparar' }, [area, el('p', { clase: 'unidad-comparar', 'aria-hidden': 'true', texto: 'Millones de años (Ma) antes del presente' })]);
  }
  function pintarComparar() {
    var a = taxones.filter(function (t) { return t.id === document.getElementById('comparar-a').value; })[0];
    var b = taxones.filter(function (t) { return t.id === document.getElementById('comparar-b').value; })[0];
    var res = document.getElementById('resultado-comparar');
    res.textContent = '';
    if (!a || !b) {
      // Estado inicial: falta una de las dos especies.
      res.appendChild(el('div', { clase: 'vacio' }, [el('p', { texto: !a && !b ? 'Elija dos especies para compararlas.' : 'Elija también la ' + (!a ? 'primera' : 'segunda') + ' especie.' })]));
      return;
    }
    var max = Math.max(a.desde, b.desde); max = max < 1 ? Math.ceil(max * 10) / 10 + 0.1 : Math.ceil(max * 1.1);
    var frase, ini = null, fin = null, misma = a.id === b.id;
    if (misma) frase = 'Ha elegido dos veces la misma especie.';
    else {
      ini = Math.min(a.desde, b.desde); fin = Math.max(a.hasta, b.hasta);
      if (ini > fin) frase = 'Coincidieron en el tiempo, aproximadamente ' + (fin === 0 ? 'desde ' + hace(ini) + ' hasta hoy.' : 'entre ' + hace(ini) + ' y ' + hace(fin) + '.');
      else if (ini === fin) frase = 'Sus intervalos se tocan ' + hace(ini) + ': con las fechas actuales no puede afirmarse que convivieran.';
      else frase = 'No coincidieron en el tiempo: entre una y otra median unos ' + (fin - ini < 1 ? num(Math.round((fin - ini) * 1000) * 1000, 0) + ' años.' : num(fin - ini, 2) + ' millones de años.');
    }
    var hijos = [el('h2', { clase: 'veredicto', texto: frase })];
    if (misma) {
      var otra = el('button', { type: 'button', texto: 'Elegir otra segunda especie' });
      otra.addEventListener('click', function () { document.getElementById('comparar-b').focus(); });
      hijos.push(el('p', null, [el('i', { texto: a.n }), ' · ' + intervalo(a) + '. Se documenta en ' + region(a) + '.']));
      hijos.push(el('p', null, [otra]));
      hijos.push(graficoComparar([a], max, null, null));
    } else {
      var lugar = a.region === b.region ? 'Se documentan en la misma región: ' + region(a) + '.' : 'Se documentan en regiones distintas: ' + region(a) + ' y ' + region(b) + '.';
      hijos.push(el('p', { clase: 'lugar-comparar', texto: lugar }));
      hijos.push(graficoComparar([a, b], max, ini, fin));
      if (ini > fin) hijos.push(el('p', { clase: 'leyenda leyenda-coincidencia' }, [el('span', { clase: 'muestra', 'aria-hidden': 'true' }), 'Franja sombreada: intervalo en el que coinciden.']));
      // Frase completa de cada intervalo (la que antes acompañaba a cada barra).
      hijos.push(el('ul', { clase: 'intervalos-comparar' }, [a, b].map(function (t) { return el('li', null, [el('i', { texto: t.n }), ' · ' + intervalo(t)]); })));
    }
    hijos.push(el('p', { clase: 'resumen', texto: 'Coincidir en el tiempo no significa que se encontraran: también cuentan el lugar y lo incompleto del registro. Las fechas son aproximadas.' }));
    var figs = (misma ? [a] : [a, b]).map(function (t) { return figura(t, false); }).filter(Boolean);
    if (figs.length) { figs.forEach(function (f) { f.classList.add('miniatura'); }); hijos.push(el('div', { clase: 'miniaturas' }, figs)); }
    res.appendChild(el('div', { clase: 'tarjeta resultado-comparar' }, hijos));
  }

  /* ---------- Métodos y clima ---------- */
  function pintarMetodos() {
    var cont = document.getElementById('lista-metodos');
    ponerRecuento('metodos', palabra((A.metodos || []).length, false));
    (A.metodos || []).forEach(function (m) {
      cont.appendChild(el('article', { clase: 'tarjeta' }, [
        el('h2', { texto: m.nombre }),
        el('p', { clase: 'pregunta-metodo', texto: m.pregunta }),
        el('dl', null, [el('dt', { texto: 'Cómo funciona' }), el('dd', { texto: m.como }), el('dt', { texto: 'Qué aporta' }), el('dd', { texto: m.aporta }), el('dt', { texto: 'Qué límites tiene' }), el('dd', { texto: m.limita }), el('dt', { texto: 'Fuentes' }), el('dd', null, [fuentesDe(m.fuentes)])])
      ]));
    });
  }
  function pintarClima() {
    var cont = document.getElementById('lista-clima');
    ponerRecuento('clima', palabra((A.clima || []).length, true));
    (A.clima || []).forEach(function (c) {
      cont.appendChild(el('article', { clase: 'tarjeta' }, [el('h2', { texto: c.titulo }), el('p', { texto: c.idea }), el('p', { clase: 'rotulo-dato rotulo-fuentes', texto: 'Fuentes' }), fuentesDe(c.fuentes)]));
    });
  }

  /* ---------- Glosario ---------- */
  // Letra inicial para agrupar (sin tilde; la ñ se conserva).
  function inicial(t) { var c = t.charAt(0).toUpperCase(); return c === 'Ñ' ? c : c.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function pintarGlosario() {
    var datos = window.DEA_GLOSARIO || [];
    var q = document.getElementById('buscar-termino').value.trim().toLowerCase();
    var cont = document.getElementById('lista-glosario'), letras = document.getElementById('letras-glosario');
    cont.textContent = ''; letras.textContent = '';
    ponerRecuento('glosario', num(datos.length, 0));
    var n = 0, grupos = {}, orden = [];
    datos.forEach(function (e) {
      if (q && e[0].toLowerCase().indexOf(q) === -1 && e[1].toLowerCase().indexOf(q) === -1) return;
      var l = inicial(e[0]);
      if (!grupos[l]) { grupos[l] = el('dl'); orden.push(l); }
      grupos[l].appendChild(el('dt', { texto: e[0].charAt(0).toUpperCase() + e[0].slice(1) }));
      grupos[l].appendChild(el('dd', { texto: e[1] }));
      n++;
    });
    // Glosario agrupado por letras, con un índice de letras para saltar (botones: el hash está reservado a las secciones).
    orden.forEach(function (l) {
      var h = el('h2', { clase: 'letra-glosario', id: 'glosario-letra-' + l, tabindex: '-1', texto: l });
      cont.appendChild(el('section', { clase: 'grupo-glosario', 'aria-labelledby': 'glosario-letra-' + l }, [h, grupos[l]]));
      var b = el('button', { type: 'button', 'aria-label': 'Ir a la letra ' + l, texto: l });
      b.addEventListener('click', function () { h.scrollIntoView({ block: 'start' }); h.focus({ preventScroll: true }); });
      letras.appendChild(b);
    });
    letras.hidden = orden.length < 2;
    var resumen = document.getElementById('glosario-resumen');
    resumen.textContent = !q ? '' : n === 0 ? 'Ningún término coincide con la búsqueda.' : n + (n === 1 ? ' término coincide' : ' términos coinciden') + ' con la búsqueda.';
    var previo = document.getElementById('glosario-vacio'); if (previo) previo.remove();
    if (q && n === 0) {
      var buscar = document.getElementById('buscar-termino');
      var borrar = el('button', { type: 'button', texto: 'Borrar la búsqueda' });
      borrar.addEventListener('click', function () { buscar.value = ''; pintarGlosario(); buscar.focus(); });
      cont.parentNode.insertBefore(el('div', { clase: 'vacio', id: 'glosario-vacio' }, [el('div', { clase: 'acciones' }, [borrar])]), cont);
    }
  }

  /* ---------- Repaso: preguntas generadas a partir de los datos del recurso ---------- */
  function azar(n) { return Math.floor(Math.random() * n); }
  function barajar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = azar(i + 1), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  var africanos = taxones.filter(function (t) { return esAfrica(t) && t.desde <= LIMITE_MIOCENO; });
  function parDistinto(valido) {
    for (var k = 0; k < 200; k++) {
      var a = africanos[azar(africanos.length)], b = africanos[azar(africanos.length)];
      if (a.id !== b.id && valido(a, b)) return [a, b];
    }
    return null;
  }
  function cursiva(n) { return el('i', { texto: n }); }
  var GENERADORES = [
    function () { // ¿cuál es más antigua?
      var par = parDistinto(function (a, b) { return Math.abs(a.desde - b.desde) >= 0.5; });
      if (!par) return null;
      var vieja = par[0].desde > par[1].desde ? par[0] : par[1], otra = vieja === par[0] ? par[1] : par[0];
      return { texto: ['¿Cuál de estas dos especies aparece antes en el registro fósil?'], opciones: barajar(par).map(function (t) { return { nodo: cursiva(t.n), bien: t === vieja }; }),
        explica: [cursiva(vieja.n), ': ' + intervalo(vieja).toLowerCase() + '. ', cursiva(otra.n), ': ' + intervalo(otra).toLowerCase() + '.'], ficha: vieja.id };
    },
    function () { // ¿en qué región?
      var candidatos = africanos.filter(function (t) { return t.region !== 'africa'; });
      var t = candidatos[azar(candidatos.length)];
      var otras = barajar(REGIONES_AFRICA.filter(function (r) { return r !== t.region && r !== 'africa' && A.regiones[r]; })).slice(0, 2);
      return { texto: ['¿En qué región se documenta ', cursiva(t.n), '?'], opciones: barajar([t.region].concat(otras)).map(function (r) { return { nodo: A.regiones[r].nombre, bien: r === t.region }; }),
        explica: [cursiva(t.n), ' se documenta en ' + region(t) + '.' + (t.geoNota ? ' ' + t.geoNota : '')], ficha: t.id };
    },
    function () { // ¿coincidieron?
      var par = parDistinto(function (a, b) { var s = Math.min(a.desde, b.desde) - Math.max(a.hasta, b.hasta); return s >= 0.2 || s <= -0.3; });
      if (!par) return null;
      var solape = Math.min(par[0].desde, par[1].desde) - Math.max(par[0].hasta, par[1].hasta) > 0;
      return { texto: ['¿Coincidieron en el tiempo ', cursiva(par[0].n), ' y ', cursiva(par[1].n), '?'], opciones: [{ nodo: 'Sí', bien: solape }, { nodo: 'No', bien: !solape }],
        explica: [cursiva(par[0].n), ': ' + intervalo(par[0]).toLowerCase() + '. ', cursiva(par[1].n), ': ' + intervalo(par[1]).toLowerCase() + '.' + (solape ? ' Coincidir en el tiempo no implica que se encontraran.' : '')], ficha: par[0].id };
    },
    function () { // ¿debatida?
      var t = africanos[azar(africanos.length)];
      return { texto: ['En este recurso, ¿figura ', cursiva(t.n), ' como especie debatida?'], opciones: [{ nodo: 'Sí', bien: !!t.debatido }, { nodo: 'No', bien: !t.debatido }],
        explica: [t.debatido ? 'Sí: su validez o su posición se discuten. ' : 'No figura como debatida. ', t.nota || ''], ficha: t.id };
    }
  ];
  var repaso = { total: 0, respondidas: 0, aciertos: 0, falladas: [] };
  function marcadorRepaso() {
    document.getElementById('repaso-marcador').textContent = repaso.respondidas === repaso.total && repaso.total
      ? 'Ha acertado ' + repaso.aciertos + ' de ' + repaso.total + '. Puede pedir preguntas nuevas.'
      : 'Respondidas: ' + repaso.respondidas + ' de ' + repaso.total + '. Aciertos: ' + repaso.aciertos + '.';
  }
  // Al responder la última pregunta: tarjeta de resultado (punto focal) con las fichas falladas y «Nuevas preguntas».
  function resultadoRepaso() {
    var caja = document.getElementById('repaso-resultado'), boton = document.getElementById('repaso-nuevo');
    caja.textContent = '';
    caja.appendChild(el('h2', { texto: 'Ha acertado ' + repaso.aciertos + ' de ' + repaso.total }));
    var vistas = {}, falladas = repaso.falladas.filter(function (id) { if (vistas[id]) return false; vistas[id] = true; return true; });
    if (falladas.length) {
      caja.appendChild(el('p', { texto: falladas.length === 1 ? 'Repase esta ficha:' : 'Repase estas fichas:' }));
      var ul = el('ul');
      falladas.forEach(function (id) { var t = taxones.filter(function (x) { return x.id === id; })[0]; if (t) ul.appendChild(el('li', null, [el('a', { href: '#especies/' + id }, [el('i', { texto: t.n })])])); });
      caja.appendChild(ul);
    } else caja.appendChild(el('p', { texto: 'Todas las respuestas son correctas.' }));
    boton.classList.add('boton-primario');
    caja.appendChild(boton);
    caja.hidden = false;
    caja.focus();
  }
  function pintarRepaso() {
    var cont = document.getElementById('lista-repaso');
    cont.textContent = '';
    var caja = document.getElementById('repaso-resultado'), boton = document.getElementById('repaso-nuevo');
    caja.hidden = true; caja.textContent = '';
    boton.classList.remove('boton-primario'); document.getElementById('repaso-acciones').appendChild(boton);
    var preguntas = [];
    barajar([0, 1, 2, 3, 0, 1, 2, 3]).forEach(function (g) { var q = GENERADORES[g](); if (q) preguntas.push(q); });
    ponerRecuento('repaso', palabra(preguntas.length, true));
    repaso = { total: preguntas.length, respondidas: 0, aciertos: 0, falladas: [] };
    preguntas.forEach(function (q, i) {
      var nombre = 'repaso-' + i;
      var campo = el('fieldset', { clase: 'tarjeta pregunta-repaso' }, [el('legend', { texto: 'Pregunta ' + (i + 1) + ' de ' + preguntas.length })]);
      campo.appendChild(el('p', { clase: 'enunciado' }, q.texto));
      q.opciones.forEach(function (o, j) {
        var id = nombre + '-' + j;
        campo.appendChild(el('label', { clase: 'opcion', for: id }, [el('input', { type: 'radio', name: nombre, id: id, value: String(j) }), ' ', o.nodo]));
      });
      var boton = el('button', { type: 'button', texto: 'Comprobar' });
      var salida = el('div', { clase: 'respuesta', role: 'status' });
      boton.addEventListener('click', function () {
        var marcada = campo.querySelector('input:checked');
        if (!marcada) { salida.className = 'respuesta error'; salida.textContent = 'Elija una respuesta.'; return; }
        var elegida = q.opciones[Number(marcada.value)], correcta = q.opciones.filter(function (o) { return o.bien; })[0];
        campo.querySelectorAll('input').forEach(function (n) { n.disabled = true; });
        boton.disabled = true;
        repaso.respondidas++; if (elegida.bien) repaso.aciertos++; else repaso.falladas.push(q.ficha);
        salida.textContent = '';
        salida.className = 'respuesta ' + (elegida.bien ? 'bien' : 'mal');
        var veredicto = el('p', null, [el('strong', { clase: 'veredicto-repaso', texto: elegida.bien ? '✓ Correcto. ' : '✗ No es correcto. ' })]);
        if (!elegida.bien) { veredicto.appendChild(document.createTextNode('La respuesta es: ')); veredicto.appendChild(typeof correcta.nodo === 'string' ? document.createTextNode(correcta.nodo) : correcta.nodo.cloneNode(true)); veredicto.appendChild(document.createTextNode('.')); }
        salida.appendChild(veredicto);
        salida.appendChild(el('p', null, q.explica.concat([' ', el('a', { href: '#especies/' + q.ficha, texto: 'Ver la ficha' }), '.'])));
        marcadorRepaso();
        if (repaso.respondidas === repaso.total) resultadoRepaso();
      });
      campo.appendChild(boton); campo.appendChild(salida);
      cont.appendChild(campo);
    });
    marcadorRepaso();
  }

  /* ---------- Arranque ---------- */
  aplicarAjustes();
  avisoSinAlmacen();
  pintarSesiones();
  ['tiempo-africa', 'tiempo-mioceno'].forEach(function (id) { document.getElementById(id).addEventListener('change', pintarTiempo); });
  pintarTiempo();
  pintarDia();
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
  document.getElementById('boton-imprimir').addEventListener('click', function () { abrirAjustes(false, false); window.print(); });
  document.getElementById('nota-datos').textContent = (A.meta && A.meta.notaDatos) || '';
  pintarRepaso();
  document.getElementById('repaso-nuevo').addEventListener('click', function () { pintarRepaso(); var t = document.getElementById('t-repaso'); t.setAttribute('tabindex', '-1'); t.focus(); t.scrollIntoView({ block: 'start' }); });
  document.querySelector('.pestanas-pista').addEventListener('scroll', avisoPestanas, { passive: true });
  window.addEventListener('resize', avisoPestanas);
  var inicio = leerHash();
  mostrar(inicio.seccion, false);
  // Primero se muestra el contenido (oculto hasta aquí para evitar saltos de carga): un elemento oculto no recibe el foco.
  document.documentElement.classList.add('dea-listo');
  irADetalle(inicio);
})();
