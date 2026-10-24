/**
 * PaleoBot · R98 · Imágenes locales y sonda de carga
 * Versión: 1.0.0 (PaleoBot v69 · R98)
 *
 * Se carga de forma síncrona en <head>, antes que cualquier <img>.
 * 1) Sonda: registra infracciones de la política de seguridad (CSP) y errores de carga de
 *    imágenes desde el primer momento, para el panel «Diagnóstico técnico».
 * 2) Imágenes locales: si assets/img/manifest.js declara copias locales de ficheros de
 *    Wikimedia Commons, redirige a ellas cualquier <img> que apunte a ese fichero, con
 *    independencia del tamaño o de la forma de la URL (thumb, original, Special:FilePath).
 *    Con el manifiesto vacío (por defecto) no cambia nada.
 */
(function PaleoBotR98LocalImages() {
  'use strict';

  /* ── 1. Sonda ─────────────────────────────────────────────────────────── */
  var probe = window.__PB_R98_PROBE = window.__PB_R98_PROBE || { csp: [], imgErrors: [], mapped: 0 };
  try {
    document.addEventListener('securitypolicyviolation', function(e) {
      if (probe.csp.length > 200) return;
      var host = '';
      try { host = e.blockedURI && /^https?:/.test(e.blockedURI) ? new URL(e.blockedURI).hostname : String(e.blockedURI || ''); } catch (err) { host = ''; }
      probe.csp.push({
        directive: e.effectiveDirective || e.violatedDirective || '',
        host: host,
        policy: String(e.originalPolicy || '').slice(0, 300),
        disposition: e.disposition || ''
      });
    }, true);
    window.addEventListener('error', function(e) {
      var t = e.target;
      if (!t || t.tagName !== 'IMG' || probe.imgErrors.length > 500) return;
      var src = t.currentSrc || t.getAttribute('src') || '';
      if (/^https?:/i.test(src)) probe.imgErrors.push(src);
    }, true);
  } catch (err) { /* recuperable */ }

  /* ── 2. Imágenes locales ──────────────────────────────────────────────── */
  var manifest = (window.PB_IMG_MANIFEST && window.PB_IMG_MANIFEST.files) || {};
  var hasLocal = Object.keys(manifest).length > 0;

  /**
   * Nombre normalizado de un fichero de Wikimedia Commons a partir de cualquier URL.
   * @param {string} value URL absoluta o relativa
   * @returns {string|null} nombre con guiones bajos y primera letra en mayúscula
   */
  function commonsFileName(value) {
    try {
      var url = new URL(String(value || ''), document.baseURI);
      if (!/(^|\.)wikimedia\.org$/i.test(url.hostname)) return null;
      var path = decodeURIComponent(url.pathname);
      var m = path.match(/Special:(?:FilePath|Redirect\/file)\/(.+)$/);
      var name;
      if (m) name = m[1];
      else {
        var parts = path.split('/');
        var t = parts.indexOf('thumb');
        name = t >= 0 ? parts[t + 3] : parts[parts.length - 1];
      }
      if (!name) return null;
      name = name.replace(/^File:/i, '').replace(/ /g, '_');
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch (err) { return null; }
  }

  function localFor(value) {
    if (!hasLocal) return null;
    var name = commonsFileName(value);
    var entry = name && manifest[name];
    return entry && entry.path ? entry.path : null;
  }

  function mapImg(img, value) {
    var local = localFor(value);
    if (!local) return value;
    img.dataset.pbR98Origin = String(value);
    probe.mapped++;
    return local;
  }

  window.PaleoBotLocalImages = { commonsFileName: commonsFileName, localFor: localFor, active: hasLocal, probe: probe };
  if (!hasLocal) return;

  try {
    var desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (desc && desc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set: function(v) { desc.set.call(this, mapImg(this, v)); }
      });
    }
    var origSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (this.tagName === 'IMG' && String(name).toLowerCase() === 'src') value = mapImg(this, value);
      return origSetAttribute.call(this, name, value);
    };
    /* Imágenes creadas por el analizador o por innerHTML: no pasan por el setter. */
    var fix = function(img) {
      var src = img.getAttribute('src');
      var local = src && localFor(src);
      if (local && local !== src) {
        img.dataset.pbR98Origin = src;
        probe.mapped++;
        origSetAttribute.call(img, 'src', local);
      }
    };
    new MutationObserver(function(records) {
      records.forEach(function(r) {
        if (r.type === 'attributes') { if (r.target.tagName === 'IMG') fix(r.target); return; }
        r.addedNodes.forEach(function(n) {
          if (n.nodeType !== 1) return;
          if (n.tagName === 'IMG') fix(n);
          else if (n.querySelectorAll) n.querySelectorAll('img[src]').forEach(fix);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  } catch (err) { /* recuperable: sin redirección local */ }
})();
