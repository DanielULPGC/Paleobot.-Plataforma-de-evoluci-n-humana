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
      out.tipo = 'imagen de referencia';
      out.titulo = copia.objeto;
      out.nota = 'Copia local de Wikimedia Commons. Imagen remota que citaba antes esta ficha: «' + media.titulo + '». ' + (media.nota || '');
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
