/* PB-GH-11 · Imagen principal local de cada taxón (04, fila 9).
   La imagen principal de la ficha (y su miniatura) pasa a ser la copia local de img/taxones/ cuando existe, con el
   crédito y la licencia de img/taxones/MANIFIESTO.json (datos en imagenes-locales-datos.js, GENERADO por
   scripts/generar_imagenes_atlas.cjs). No edita 002-script.js: envuelve window.getSpeciesMedia, que es la única
   fuente de la imagen principal para la ficha, las miniaturas (getSpeciesThumb), getSpeciesImage y las capas que
   las consultan (066, 075, 081). El crédito visible es siempre el de la imagen que se muestra:
   - si la copia local es la misma obra que la imagen remota citada, se conservan tipo, título y nota;
   - si es otra obra, título = objeto de la copia y la nota conserva, rotulada, la referencia a la imagen remota.
   Las demás imágenes del atlas siguen siendo remotas; su respaldo sin red lo da 025 (un SVG local, sin reintentos). */
(function () {
  'use strict';
  var datos = window.PB_ATLAS_IMAGENES_LOCALES || {};
  var original = window.getSpeciesMedia;
  if (typeof original !== 'function' || original.__pbGh11Local) return;

  function absoluta(src) {
    try { return new URL(src, document.baseURI).href; } catch (e) { return src; }
  }
  // Nombre de archivo de Commons a partir de una URL (upload, thumb, Special:FilePath/Redirect o File:).
  function archivoCommons(url) {
    try {
      var p = decodeURIComponent(new URL(String(url || ''), document.baseURI).pathname);
      var n = '';
      if (p.indexOf('Special:FilePath/') >= 0) n = p.split('Special:FilePath/')[1];
      else if (p.indexOf('Special:Redirect/file/') >= 0) n = p.split('Special:Redirect/file/')[1];
      else if (p.indexOf('/wiki/File:') >= 0) n = p.split('/wiki/File:')[1];
      else { var partes = p.split('/'); var t = partes.indexOf('thumb'); n = t >= 0 ? partes[t + 3] : partes[partes.length - 1]; }
      return String(n || '').replace(/ /g, '_').toLowerCase();
    } catch (e) { return ''; }
  }

  // PB-GH-11 (T8): pie y texto alternativo de las 21 copias locales que son otra obra que la imagen remota citada por
  // la ficha (decisión de la titular, 20-11-2026). Antes, el pie conservaba la nota escrita para la imagen anterior.
  // titulo = rótulo del pie y texto alternativo (002 usa media.titulo como alt); nota = qué se ve y sus cautelas.
  // Fuente: img/taxones/MANIFIESTO.json (objeto, alt, crédito, licencia) y examen visual de cada copia local
  // (T8, 20-11-2026). Las páginas de Wikimedia Commons no pudieron abrirse en esta tanda: no se añade ningún dato que
  // no esté en el manifiesto o a la vista en la fotografía (p. ej., la cartela de erectus).
  var PIES = {
    afarensis: { titulo: 'Reconstrucción museística del cráneo de Lucy (Australopithecus afarensis), en vista frontal', nota: 'Fotografía de una reconstrucción del cráneo con la mandíbula; no es el fósil original.' },
    africanus: { titulo: 'Réplica del cráneo Sts 5 («Mrs Ples»), Australopithecus africanus, en el Museo de Prehistoria de Valencia', nota: 'Fotografía de una réplica expuesta en vitrina, no del fósil original; detrás, la cartela del museo rotula la pieza como STS-5, de Sterkfontein (Sudáfrica).' },
    anamensis: { titulo: 'Extremo distal del húmero derecho KNM-KP 271, atribuido a Australopithecus anamensis (Kanapoi)', nota: 'Fotografía de un fragmento de húmero sobre fondo negro, expuesto en Zúrich según su archivo de origen; no muestra el cráneo MRD. No se ha comprobado si la pieza es el fósil original o una réplica.' },
    antecessor: { titulo: 'Reconstrucción del cráneo de Homo antecessor en el Museo de Arqueología de Cataluña', nota: 'Fotografía de una reconstrucción, no del fósil original: alterna zonas modeladas en blanco y piezas de tono pardo.' },
    bahrelghazali: { titulo: 'Mapa esquemático de África con una marca en Chad, zona del hallazgo de Abel (Australopithecus bahrelghazali)', nota: 'No es una fotografía del fósil: el mapa solo sitúa el contexto regional, y la marca es aproximada y no aporta coordenadas verificadas.' },
    boisei: { titulo: 'Reproducción museística del cráneo y la mandíbula atribuidos a Paranthropus boisei, en San Diego', nota: 'Fotografía de una reproducción, no de los fósiles originales; el cráneo y la mandíbula se exponen separados.' },
    cepranensis: { titulo: 'Ilustración digital del cráneo de Ceprano', nota: 'Infografía artística, no fotografía del fósil. La denominación «Homo cepranensis» del catálogo exige cautela taxonómica.' },
    erectus: { titulo: 'Vaciado de una bóveda craneal rotulado «Homo erectus Pekingmänniska» (Hombre de Pekín)', nota: 'Fotografía de una pieza expuesta sobre un soporte; la cartela visible, en sueco, la describe como «Avgjutning skalltak» (vaciado de la bóveda craneal): es una reproducción, no el fósil original.' },
    georgicus: { titulo: 'Molde del cráneo MGL 95212 de Dmanisi, con la mandíbula, sobre fondo blanco', nota: 'Fotografía de un molde, no del fósil original. «Homo georgicus» es la etiqueta del catálogo; su delimitación taxonómica está discutida. Es la misma pieza que citaba la ficha, fotografiada sobre otro fondo.' },
    habilis: { titulo: 'Cráneo museístico rotulado Homo habilis en Augsburgo, en vista frontal', nota: 'Pieza expuesta en vitrina; la fuente no aclara si es el fósil original o una copia.' },
    heidelbergensis: { titulo: 'Cráneo 5 de la Sima de los Huesos (Atapuerca), en vista frontal', nota: 'Es un hallazgo distinto de la mandíbula de Mauer que fecha esta ficha; su atribución taxonómica está por revisar. No se ha comprobado si la pieza fotografiada es el fósil original o una réplica.' },
    idaltu: { titulo: 'Pieza craneal de Herto en el Museo Nacional de Adís Abeba, en vista lateral', nota: 'Commons la identifica como Homo sapiens idaltu y no aclara si es el fósil original o una reproducción.' },
    luzon: { titulo: 'Tercer metatarsiano CCH1 de Callao, atribuido a Homo luzonensis', nota: 'Hueso del pie sobre fondo negro, identificado en Commons como CCH1; el archivo no aclara si la pieza es el fósil original o una copia.' },
    naledi: { titulo: 'Reconstrucción del cráneo de Homo naledi compuesta con moldes de dos individuos, en vista frontal', nota: 'No es un cráneo fósil completo de un solo individuo; las zonas blancas forman parte de la reconstrucción.' },
    neander: { titulo: 'Cráneo museístico rotulado Homo neanderthalensis en Augsburgo', nota: 'Pieza expuesta en vitrina; la fuente no aclara si es el fósil original o una copia.' },
    orrorin: { titulo: 'Dibujo de restos fósiles atribuidos a Orrorin tugenensis, identificados con letras de la A a la G', nota: 'Lámina de dibujos de línea, no fotografía de los fósiles; no lleva escala.' },
    prometheus: { titulo: 'Molde del esqueleto StW 573 («Little Foot») en una vitrina del American Museum of Natural History', nota: 'Fotografía de un molde, no del fósil original. La atribución a Australopithecus prometheus está debatida.' },
    ramidus: { titulo: 'Cráneo expuesto como Ardipithecus ramidus en el Museo Nacional de Ciencias Naturales (Madrid), en vista frontal', nota: 'En la pieza se distinguen zonas pardas y zonas grises lisas; la ficha de origen no precisa si es original o reproducción.' },
    rhodesiensis: { titulo: 'Réplica del cráneo Kabwe 1 (Broken Hill) expuesta en Mauer, en vista frontal', nota: 'No es el fósil original; las atribuciones taxonómicas del cráneo son objeto de debate.' },
    sapiens: { titulo: 'Bóveda craneal calcolítica de Homo sapiens procedente de Sonseca (Laborcillas, Granada), en el Museo Arqueológico Nacional', nota: 'La fotografía muestra solo la bóveda del cráneo. Es del Calcolítico, mucho más reciente que las primeras evidencias de la especie: no ilustra su origen (véanse en el atlas Jebel Irhoud y Omo I).' },
    sediba: { titulo: 'Molde del cráneo de un individuo juvenil de Australopithecus sediba en el Smithsonian, en vista frontal', nota: 'Fotografía de un molde, no del fósil original.' }
  };

  function mismaObra(media, copia) {
    var a = archivoCommons(media.sourceUrl) || archivoCommons(media.url);
    return !!a && a === archivoCommons(copia.fuente);
  }

  var envuelta = function (sp) {
    var media = original.apply(this, arguments);
    var copia = sp && sp.id ? datos[sp.id] : null;
    // PB-GH-11 (T4): imagen principal remota y sin copia local (anoiapithecus, gautengensis): el pie dice lo que
    // se sabe (se carga de Wikimedia Commons; ni la imagen ni su licencia están verificadas en este repositorio)
    // y conserva, rotulada, la licencia que declara la ficha. No se inventa crédito ni licencia.
    if (!copia && media && /^https?:/i.test(String(media.url || '')) && !media.pbRemotaSinCopia) {
      var r = {};
      for (var q in media) if (Object.prototype.hasOwnProperty.call(media, q)) r[q] = media[q];
      r.pbRemotaSinCopia = true;
      r.fuente = (media.fuente || 'fuente remota') + ' (imagen remota; este repositorio no guarda copia)';
      r.licencia = 'no verificada en este repositorio' + (media.licencia ? ' (la ficha declara ' + media.licencia + ')' : '');
      return r;
    }
    if (!copia || !media) return media;
    var url = absoluta(copia.src);
    var igual = mismaObra(media, copia);
    var out = {};
    for (var k in media) if (Object.prototype.hasOwnProperty.call(media, k)) out[k] = media[k];
    out.url = url;
    out.thumbUrl = url;
    out.fuente = copia.credito + ' · Wikimedia Commons (copia local)';
    out.licencia = copia.licencia;
    out.sourceUrl = copia.fuente;
    out.pbCopiaLocal = true;
    out.pbMismaObra = igual;
    out.pbAlt = copia.alt;
    if (!igual) {
      // PB-GH-11 (T8): el pie describe la imagen que se ve (PIES) y ya no arrastra la nota de la imagen anterior; de
      // esta solo queda, rotulado, su título. Antes: titulo = copia.objeto; nota = 'Copia local de Wikimedia Commons.
      // Imagen remota que citaba antes esta ficha: «…». ' + nota anterior.
      var pie = PIES[sp.id];
      out.tipo = 'imagen de referencia';
      out.titulo = pie ? pie.titulo : copia.objeto;
      out.nota = (pie ? pie.nota + ' ' : '') + 'Copia local de Wikimedia Commons. Antes, esta ficha citaba la imagen remota «' + media.titulo + '».';
      out.pbAlt = out.titulo;
    }
    return out;
  };
  envuelta.__pbGh11Local = true;
  envuelta.__pbGh11Original = original;
  window.getSpeciesMedia = envuelta;

  // PB-GH-11 (T4): distintivo de licencia del pie para esas imágenes remotas sin copia (antes «Imagen abierta
  // trazable», que este repositorio no ha comprobado). getMediaLicenseProfile es global en 002.
  var perfil = window.getMediaLicenseProfile;
  if (typeof perfil === 'function' && !perfil.__pbGh11) {
    var perfilEnvuelto = function (media) {
      if (media && media.pbRemotaSinCopia) {
        return { level: 'caution', label: 'Imagen remota sin copia local', title: 'Se carga desde Wikimedia Commons cuando hay conexión; ni la imagen ni su licencia se han verificado en este repositorio.' };
      }
      return perfil.apply(this, arguments);
    };
    perfilEnvuelto.__pbGh11 = true;
    window.getMediaLicenseProfile = perfilEnvuelto;
  }
  document.documentElement.dataset.pbImagenesLocales = String(Object.keys(datos).length);
})();
