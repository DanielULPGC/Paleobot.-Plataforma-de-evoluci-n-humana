/**
 * PaleoBot · R93 · Panel de diagnóstico simplificado
 * Versión: 1.0.0 (PaleoBot v69 · R93)
 *
 * Sustituye la presentación del «Diagnóstico técnico rápido» (26 tarjetas) por seis
 * grupos de comprobaciones medidas en ejecución. Reutiliza los indicadores fiables del
 * informe heredado (buildSelfAuditReport) y descarta:
 *   · indicadores de mera presencia de clases o capas (v34, v35, v36, v37, «20/20 mejoras»);
 *   · falsas alarmas de la modularización (M4, M14 y M15 buscaban CSS en <style> en línea);
 *   · el contraste con un registro de contratos obsoleto («Botones funcionales»);
 *   · «Estados pulsados», que exigía aria-pressed a pestañas (role="tab" usa aria-selected).
 * Integración no destructiva: redefine window.renderSelfAuditReport; el informe heredado
 * sigue disponible en window.buildSelfAuditReport.
 */
(function PaleoBotR93DiagnosticPanel() {
  'use strict';

  const STATUS_TEXT = { ok: 'Correcto', warn: 'Aviso', bad: 'Fallo', info: 'Informativo' };
  const STATUS_ICON = { ok: '✓', warn: '!', bad: '✕', info: 'i' };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  /** Devuelve el elemento del informe heredado con esa etiqueta, o null. */
  function legacyItem(report, label) {
    return (report || []).find(item => item && item.label === label) || null;
  }

  function fromLegacy(report, label, name) {
    const item = legacyItem(report, label);
    if (!item) return { name, status: 'warn', value: 'Comprobación heredada no disponible.' };
    return { name, status: item.status === 'bad' ? 'bad' : item.status === 'warn' ? 'warn' : 'ok', value: item.value };
  }

  function safe(fn, name) {
    try { return fn(); }
    catch (err) { return { name, status: 'warn', value: 'No se pudo ejecutar la comprobación.' }; }
  }

  /* ── Comprobaciones propias ─────────────────────────────────────────── */

  function checkBoot() {
    const errors = Array.isArray(window.__PB_BOOT_ERRORS) ? window.__PB_BOOT_ERRORS.length : 0;
    return {
      name: 'Errores de ejecución capturados',
      status: errors ? 'bad' : 'ok',
      value: errors ? `${errors} error(es) registrados desde la carga.` : 'Ningún error capturado desde la carga.'
    };
  }

  function checkNavCoherence() {
    const tab = document.querySelector('.pb-v50-tab[aria-selected="true"]');
    const family = document.body.dataset.navFamily || '';
    if (!tab || !family) {
      return { name: 'Coherencia de la navegación por bloques', status: 'info', value: 'Sin pestaña de bloque o familia activa que comparar.' };
    }
    const block = tab.dataset.pbV50Block || '';
    return {
      name: 'Coherencia de la navegación por bloques',
      status: block === family ? 'ok' : 'warn',
      value: block === family
        ? `Pestaña y familia activas coinciden (${block}).`
        : `La pestaña marcada (${block}) no coincide con la familia activa (${family}). Defecto conocido de la navegación heredada.`
    };
  }

  function checkStateAttributes() {
    const active = Array.from(document.querySelectorAll('button.active, [role="button"].active, [role="tab"].active'))
      .filter(el => el.offsetParent !== null);
    const wrong = active.filter(el => {
      const role = el.getAttribute('role');
      if (role === 'tab') return el.getAttribute('aria-selected') !== 'true';
      return !el.hasAttribute('aria-pressed') && !el.hasAttribute('aria-selected') && !el.hasAttribute('aria-current') && !el.hasAttribute('aria-expanded');
    });
    return {
      name: 'Estado accesible de controles activos',
      status: wrong.length ? 'warn' : 'ok',
      value: wrong.length
        ? `${wrong.length}/${active.length} controles activos sin estado ARIA acorde a su rol.`
        : `${active.length} controles activos con estado ARIA acorde a su rol (pestañas con aria-selected).`
    };
  }

  function checkAccessibleNames() {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], a[href]'))
      .filter(el => el.offsetParent !== null);
    const unnamed = buttons.filter(el => !((el.textContent || '').trim()
      || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')));
    return {
      name: 'Nombre accesible de controles visibles',
      status: unnamed.length ? 'warn' : 'ok',
      value: unnamed.length
        ? `${unnamed.length}/${buttons.length} controles visibles sin nombre accesible.`
        : `${buttons.length} controles visibles con nombre accesible.`
    };
  }

  function checkLang() {
    const lang = document.documentElement.getAttribute('lang');
    return { name: 'Idioma del documento', status: lang ? 'ok' : 'bad', value: lang ? `lang="${lang}".` : 'Falta el atributo lang.' };
  }

  function checkReviewedChronology() {
    const db = Array.isArray(window.DB) ? window.DB : [];
    const reviewed = db.filter(sp => /REVIEWED/.test(sp?.ma_uncertain?.source_status || '')).length;
    return {
      name: 'Cronologías con revisión documental',
      status: reviewed ? 'ok' : 'warn',
      value: `${reviewed}/${db.length} taxones con cronología revisada en la capa A2/A3.`
    };
  }

  function checkDebated() {
    const db = Array.isArray(window.DB) ? window.DB : [];
    const debated = db.filter(sp => sp?.ma_uncertain?.debated).length;
    return {
      name: 'Controversias señaladas',
      status: 'info',
      value: `${debated} taxones con marca [DEBATIDO] en la revisión taxonómica.`
    };
  }

  /* R97: evidencia de carga de imágenes en el entorno real (p. ej., Moodle de la ULPGC). */
  var WM_STEPS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840];
  function checkExternalImages() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('img'));
    var failed = imgs.filter(function(i) {
      var orig = i.dataset.pbR97LoadFailed ||
        (/^error/.test(i.dataset.pbV61FallbackReason || '') ? (i.dataset.pbV61OriginalSrc || '') : '');
      return /^https?:/i.test(orig);
    });
    var hosts = {};
    failed.forEach(function(i) {
      try { var h = new URL(i.dataset.pbR97LoadFailed || i.dataset.pbV61OriginalSrc).hostname; hosts[h] = (hosts[h] || 0) + 1; } catch (e) { /* recuperable */ }
    });
    var loaded = imgs.filter(function(i) {
      var cs = i.currentSrc || '';
      var external = false;
      try { external = /^https?:/i.test(cs) && new URL(cs).origin !== location.origin; } catch (e) { external = false; }
      return external && i.complete && i.naturalWidth > 0;
    }).length;
    var hostText = Object.keys(hosts).map(function(h) { return h + ' (' + hosts[h] + ')'; }).join(', ');
    return {
      name: 'Imágenes externas',
      status: failed.length ? 'warn' : 'ok',
      value: failed.length
        ? loaded + ' cargadas; ' + failed.length + ' no cargaron y muestran respaldo: ' + hostText + '. Si son todas, revise la política de seguridad del servidor o la red.'
        : loaded + ' imágenes externas cargadas; ninguna con fallo registrado.'
    };
  }
  function checkThumbSteps() {
    var bad = Array.prototype.slice.call(document.querySelectorAll('img')).map(function(i) { return i.getAttribute('src') || ''; })
      .filter(function(src) {
        var m = src.match(/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/.+\/(\d+)px-/) || src.match(/Special:(?:FilePath|Redirect\/file)\/[^?]+\?width=(\d+)/);
        return m && WM_STEPS.indexOf(Number(m[1])) === -1;
      });
    return {
      name: 'Miniaturas de Wikimedia',
      status: bad.length ? 'bad' : 'ok',
      value: bad.length ? bad.length + ' con tamaño no estándar (Wikimedia las rechaza con HTTP 429).' : 'Todas usan tamaños estándar de Wikimedia.'
    };
  }

  /* R98: sonda temprana (000-paleobot-r98-local-images.js). */
  function checkCspProbe() {
    var probe = window.__PB_R98_PROBE || { csp: [] };
    var meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    var own = meta ? String(meta.getAttribute('content') || '').replace(/\s+/g, ' ').trim() : '';
    var imgs = probe.csp.filter(function(v) { return /img-src|default-src/.test(v.directive); });
    if (!probe.csp.length) return { name: 'Política de seguridad (CSP)', status: 'ok', value: 'Ninguna infracción registrada desde la carga.' };
    /* Una política es ajena si no coincide íntegramente con la meta del atlas (la del
       servidor puede ser una subcadena de la nuestra, p. ej. «img-src 'self' data:»). */
    var norm = function(t) { return String(t || '').replace(/\s+/g, ' ').replace(/;\s*$/, '').trim(); };
    var foreign = probe.csp.filter(function(v) { return v.policy && norm(v.policy) !== norm(own); });
    var hosts = {};
    imgs.forEach(function(v) { if (v.host) hosts[v.host] = (hosts[v.host] || 0) + 1; });
    var hostText = Object.keys(hosts).map(function(h) { return h + ' (' + hosts[h] + ')'; }).join(', ');
    return {
      name: 'Política de seguridad (CSP)',
      status: 'bad',
      value: probe.csp.length + ' bloqueos; imágenes: ' + (imgs.length ? hostText : 'ninguna') + '. ' +
        (foreign.length ? 'Proceden de una política del SERVIDOR (no del atlas): «' + foreign[0].policy.slice(0, 140) + '…».' : 'Proceden de la política del propio atlas.')
    };
  }
  function checkLocalImages() {
    var m = window.PB_IMG_MANIFEST || {};
    var n = Object.keys(m.files || {}).length;
    var probe = window.__PB_R98_PROBE || {};
    return {
      name: 'Imágenes locales',
      status: n ? 'ok' : 'info',
      value: n ? n + ' ficheros incluidos en el paquete' + (m.generated ? ' (' + m.generated + ')' : '') + '; ' + document.querySelectorAll('img[data-pb-r98-origin]').length + ' imágenes de la página servidas desde el paquete.'
               : 'Paquete sin imágenes locales: se usan las de Wikimedia Commons. Si no cargan en Moodle, genere el paquete con imágenes (herramienta «preparar-imagenes-paleobot.html»).'
    };
  }

  function sessionSummary(report) {
    const panel = legacyItem(report, 'Panel didáctico (Fase 2 SDD)');
    const tickets = legacyItem(report, 'Tickets de salida (Fase 4 SDD)');
    const parts = [panel?.value, tickets?.value].filter(Boolean);
    return { name: 'Actividad de esta sesión', status: 'info', value: parts.length ? parts.join(' · ') : 'Sin actividad registrada.' };
  }

  /* ── Construcción del informe agrupado ──────────────────────────────── */

  function buildGroups() {
    let legacy = [];
    try { legacy = typeof window.buildSelfAuditReport === 'function' ? window.buildSelfAuditReport() : []; }
    catch (err) { legacy = []; }

    const doi = fromLegacy(legacy, 'DOI trazables', 'DOI consignados');
    doi.value = String(doi.value || '').replace('asociados al conjunto de fichas y referencias.',
      'con formato válido; su correspondencia bibliográfica no se verifica automáticamente.');

    return [
      { title: 'Carga y navegación', checks: [
        safe(checkBoot, 'Errores de ejecución capturados'),
        fromLegacy(legacy, 'Vistas navegables', 'Vistas con sección'),
        safe(checkNavCoherence, 'Coherencia de la navegación por bloques')
      ] },
      { title: 'Controles', checks: [
        fromLegacy(legacy, 'Botones interconectados', 'Destino de los botones'),
        fromLegacy(legacy, 'Panel flotante', 'Botones flotantes'),
        fromLegacy(legacy, 'Tipos de botón', 'Tipo de botón declarado'),
        fromLegacy(legacy, 'Identificadores DOM', 'Identificadores únicos')
      ] },
      { title: 'Accesibilidad', checks: [
        safe(checkLang, 'Idioma del documento'),
        safe(checkAccessibleNames, 'Nombre accesible de controles visibles'),
        safe(checkStateAttributes, 'Estado accesible de controles activos'),
        fromLegacy(legacy, 'Texto alternativo', 'Texto alternativo')
      ] },
      { title: 'Datos y fuentes', checks: [
        fromLegacy(legacy, 'IDs de datos', 'Identificadores de taxón'),
        safe(checkReviewedChronology, 'Cronologías con revisión documental'),
        safe(checkDebated, 'Controversias señaladas'),
        doi,
        fromLegacy(legacy, 'Paleogenómica', 'Lectura paleogenómica')
      ] },
      { title: 'Medios y licencias', checks: [
        safe(checkLocalImages, 'Imágenes locales'),
        safe(checkCspProbe, 'Política de seguridad (CSP)'),
        safe(checkExternalImages, 'Imágenes externas'),
        safe(checkThumbSteps, 'Miniaturas de Wikimedia'),
        fromLegacy(legacy, 'Imágenes de fichas', 'Imágenes de fichas'),
        fromLegacy(legacy, 'Licencias visuales', 'Licencias visuales'),
        fromLegacy(legacy, 'Plantillas docentes', 'Plantillas docentes')
      ] },
      { title: 'Sesión didáctica', checks: [sessionSummary(legacy)] }
    ];
  }

  function worst(checks) {
    if (checks.some(c => c.status === 'bad')) return 'bad';
    if (checks.some(c => c.status === 'warn')) return 'warn';
    if (checks.every(c => c.status === 'info')) return 'info';
    return 'ok';
  }

  function renderPanel() {
    const groups = buildGroups();
    const all = groups.flatMap(g => g.checks);
    const count = s => all.filter(c => c.status === s).length;
    const summary = `${all.length} comprobaciones · ${count('ok')} correctas · ${count('warn')} avisos · ${count('bad')} fallos`;
    const groupHtml = groups.map(group => {
      const status = worst(group.checks);
      const open = status === 'bad' || status === 'warn' ? ' open' : '';
      const rows = group.checks.map(c => `<li class="pb-r93-diag-check pb-r93-diag-${esc(c.status)}">
          <span class="pb-r93-diag-badge" aria-hidden="true">${esc(STATUS_ICON[c.status] || '·')}</span>
          <span class="pb-r93-diag-name">${esc(c.name)}<span class="pb-r93-sr"> (${esc(STATUS_TEXT[c.status] || '')})</span></span>
          <span class="pb-r93-diag-value">${esc(c.value)}</span>
        </li>`).join('');
      return `<details class="pb-r93-diag-group pb-r93-diag-${esc(status)}"${open}>
        <summary><span class="pb-r93-diag-badge" aria-hidden="true">${esc(STATUS_ICON[status])}</span>
          <strong>${esc(group.title)}</strong><span class="pb-r93-diag-state">${esc(STATUS_TEXT[status])}</span></summary>
        <ul class="pb-r93-diag-list">${rows}</ul>
      </details>`;
    }).join('');
    return `<section class="teaching-audit-panel pb-r93-diag" aria-labelledby="pbR93DiagTitle">
      <h4 id="pbR93DiagTitle">Diagnóstico técnico</h4>
      <p class="pb-r93-diag-summary" role="status">${esc(summary)}</p>
      <p class="pb-r93-diag-note">Comprobaciones automáticas en este navegador. No sustituyen la revisión manual ni la validación en otros navegadores.</p>
      ${groupHtml}
    </section>`;
  }

  window.renderSelfAuditReport = function renderSelfAuditReportR93() { return renderPanel(); };
  window.PaleoBotR93Diagnostic = { buildGroups, renderPanel, version: '1.0.0' };

  /* Si el centro docente ya se renderizó con el panel antiguo, sustituirlo. */
  function refresh() {
    const host = document.getElementById('teachingAuditReport');
    if (host && !host.querySelector('.pb-r93-diag')) host.innerHTML = renderPanel();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();

  /* R94: señal de arranque completo; oculta el aviso #pb-boot-fallback. Solo se marca si el
     núcleo (DB, switchView) está disponible, de modo que un fallo parcial siga siendo visible. */
  function markBooted() {
    if (Array.isArray(window.DB) && typeof window.switchView === 'function') {
      document.documentElement.classList.add('pb-booted');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markBooted, { once: true });
  else markBooted();
})();
