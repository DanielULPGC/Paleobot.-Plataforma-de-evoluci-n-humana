// R91-P4: restaurado de assets/css/00-core/036-style.css (extracción errónea del monolito,
// #paleobot-v66-cranial-norma, v66 M5). Adaptado a la CSP: sin <style> inyectado ni atributos style=.
(function PaleoBotV66CranialNorma() {
  'use strict';

  /** R91-P4: ids de taxones del último render del comparador (orden de tarjetas). */
  let _lastSpeciesIds = [];

  const DEBUG = typeof window.__PALEOBOT_DEBUG !== 'undefined' && window.__PALEOBOT_DEBUG;
  const log   = DEBUG ? console.log.bind(console,  '[PB66-Cran]') : () => {};

  /* ════════════════════════════════════════════════════════════════════════
     A. MÉTRICAS PARA NORMA SUPERIOR
     Extiende _cmp3DMetricProfile con índice cefálico e índices occipitales.
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Calcula el perfil de norma superior para un taxón.
   * @param {object} sp — objeto especie del DB
   * @returns {{ width, length, bun, zygo, sagittal, crestWidth }}
   *   width, length: semiejes del elipsoide craneal (px en viewBox 200×160)
   *   bun: proyección occipital (0–1)
   *   zygo: anchura del arco cigomático (factor)
   *   sagittal: boolean (cresta sagital)
   *   crestWidth: grosor de la cresta sagital
   */
  function _superiorProfile(sp) {
    // Acceder a _cmp3DMetricProfile si está disponible
    const base = (typeof window._cmp3DMetricProfile === 'function' ||
                  typeof _cmp3DMetricProfile === 'function')
      ? (window._cmp3DMetricProfile || _cmp3DMetricProfile)(sp)
      : null;

    const vault = base?.vault ?? 50;
    const jaw   = base?.jaw   ?? 30;
    const prog  = base?.prognathism ?? 40;

    // Corpus textual para inferencias
    const txt = (sp.descripcion || '') + ' ' +
                (sp.experto?.descripcion_tecnica || '') + ' ' +
                (sp.experto?.anatomia_craneal || '');
    const txtN = txt.toLowerCase();

    // Índice cefálico: dolicocéfalo (largo-estrecho) vs braquicéfalo (corto-ancho)
    // Neandertales y erectus: dolicocéfalos; sapiens modernos: mesocéfalos-braquicéfalos
    // Paranthropus: muy ancho por cigomáticos
    let breadthFactor = 0.72; // mesocéfalo por defecto
    if (/neandertal|neanderthal|dolicocefal|cráneo alargado|neurocrá.*alarg/.test(txtN)) breadthFactor = 0.62;
    if (/braquicefal|cráneo redondeado|globular|neurocrá.*globular/.test(txtN)) breadthFactor = 0.84;
    if (sp.clado === 'paran') breadthFactor = 0.88; // cigomáticos muy prominentes
    if (sp.clado === 'basal') breadthFactor = 0.68;

    // Proyección occipital (bun occipital)
    const bun = /chignon occipital|bun occipital|protuberancia occipital|occipital muy proyectado/.test(txtN)
      ? 0.85 : /occipital.*redondeado|occipital liso/.test(txtN) ? 0.25 : 0.45;

    // Anchura cigomática relativa al vault (en norma superior se ve la anchura)
    const zygoFactor = 0.9 + (jaw / 100) * 0.35 + (prog / 100) * 0.12;

    // Longitud y anchura del elipsoide (semiejes, px sobre viewBox 200×160)
    const length = 52 + vault * 0.22;      // eje anteroposterior
    const width  = length * breadthFactor; // eje mediolateral

    // Cresta sagital
    const sagittal = base?.sagittal ?? /cresta sagital|quilla sagital/.test(txtN);
    const crestWidth = sp.clado === 'paran' ? 5 : 3;

    return { width, length, bun, zygoFactor, sagittal, crestWidth, breadthFactor };
  }

  /* ════════════════════════════════════════════════════════════════════════
     B. SVG DE NORMA SUPERIOR
     ════════════════════════════════════════════════════════════════════════ */

  function _esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /**
   * Genera el SVG de norma superior para un taxón.
   * @param {object} sp — objeto especie
   * @param {string} color — color de serie
   * @returns {string} SVG string
   */
  function _superiorSvg(sp, color) {
    const p = _superiorProfile(sp);

    // Centro del viewBox
    const cx = 100, cy = 82;
    // Elipsoide principal (neurocráneo en plano horizontal)
    const rx = p.width;
    const ry = p.length;

    // Polo anterior (frontal) y posterior (occipital)
    const frontY  = cy - ry;
    const backY   = cy + ry;
    // Anchura máxima (parietales)
    const maxX    = cx + rx;

    // Arcos cigomáticos (laterales, en norma superior se ven como protuberancias)
    const zygoRx  = rx * p.zygoFactor;
    const zygoY   = cy + ry * 0.12; // a la altura de los temporales

    // Proyección del occipital (bun)
    const bunExt  = ry * p.bun * 0.18; // extensión extra del polo posterior

    // Colores
    const fillStop1 = color || '#8a96a6';

    return `<svg class="cmp-3d-model cmp-superior-model"
      viewBox="0 0 200 164"
      role="img"
      aria-label="Norma superior (vista desde arriba) de ${_esc(sp.nombre)}: esquema ilustrativo, no métrico">
      <defs>
        <radialGradient id="supGrad-${_esc(sp.id)}" cx="42%" cy="35%" r="68%">
          <stop offset="0" stop-color="#fff" stop-opacity="0.72"/>
          <stop offset="0.55" stop-color="${_esc(fillStop1)}" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#1c2b3a" stop-opacity="0.82"/>
        </radialGradient>
        <filter id="supShadow-${_esc(sp.id)}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#00000044"/>
        </filter>
      </defs>

      <!-- Neurocráneo — elipsoide principal -->
      <ellipse
        cx="${cx}" cy="${cy}"
        rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
        fill="url(#supGrad-${_esc(sp.id)})"
        stroke="${_esc(fillStop1)}" stroke-width="1.8"
        filter="url(#supShadow-${_esc(sp.id)})"/>

      <!-- Proyección occipital (bun) si presente -->
      ${p.bun > 0.55 ? `
      <ellipse
        cx="${cx}" cy="${(backY + bunExt * 0.5).toFixed(1)}"
        rx="${(rx * 0.42).toFixed(1)}" ry="${(bunExt * 0.9).toFixed(1)}"
        fill="${_esc(fillStop1)}" opacity="0.45"/>
      ` : ''}

      <!-- Arcos cigomáticos (protuberancias laterales) -->
      <ellipse
        cx="${(cx + zygoRx).toFixed(1)}" cy="${zygoY.toFixed(1)}"
        rx="${(rx * 0.22).toFixed(1)}" ry="${(ry * 0.12).toFixed(1)}"
        fill="${_esc(fillStop1)}" opacity="0.38" stroke="${_esc(fillStop1)}" stroke-width="1"/>
      <ellipse
        cx="${(cx - zygoRx).toFixed(1)}" cy="${zygoY.toFixed(1)}"
        rx="${(rx * 0.22).toFixed(1)}" ry="${(ry * 0.12).toFixed(1)}"
        fill="${_esc(fillStop1)}" opacity="0.38" stroke="${_esc(fillStop1)}" stroke-width="1"/>

      <!-- Sutura metópica / glabela (polo anterior) -->
      <line
        x1="${cx}" y1="${frontY.toFixed(1)}"
        x2="${cx}" y2="${(frontY + ry * 0.22).toFixed(1)}"
        stroke="rgba(255,255,255,0.55)" stroke-width="1.2" stroke-dasharray="3,3"/>

      <!-- Cresta sagital (si presente) -->
      ${p.sagittal ? `
      <path
        d="M${cx} ${(frontY + 4).toFixed(1)} L${cx} ${(backY - 4).toFixed(1)}"
        fill="none"
        stroke="rgba(255,255,255,0.88)"
        stroke-width="${p.crestWidth}"
        stroke-linecap="round"/>
      <text x="${cx + 7}" y="${(cy - ry * 0.3).toFixed(1)}"
        font-size="8" fill="rgba(255,255,255,0.72)"
        font-family="sans-serif" font-style="italic">cresta</text>
      ` : ''}

      <!-- Suturas parietales (líneas transversales indicativas) -->
      <path
        d="M${(cx - rx * 0.7).toFixed(1)} ${cy.toFixed(1)} Q${cx} ${(cy - ry * 0.12).toFixed(1)} ${(cx + rx * 0.7).toFixed(1)} ${cy.toFixed(1)}"
        fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1"/>

      <!-- Etiquetas de orientación -->
      <text x="${cx}" y="${(frontY - 6).toFixed(1)}" text-anchor="middle"
        font-size="8.5" fill="rgba(255,255,255,0.65)" font-family="sans-serif">frontal</text>
      <text x="${cx}" y="${(backY + bunExt + 13).toFixed(1)}" text-anchor="middle"
        font-size="8.5" fill="rgba(255,255,255,0.65)" font-family="sans-serif">occipital</text>

      <!-- R91-P4: se retira la etiqueta dolico/meso/braquicéfalo. El modelo es un esquema
           paramétrico inferido del texto descriptivo, no una medición craneométrica; la
           advertencia se muestra una sola vez junto al selector (.pb-norma-note). -->
    </svg>`;
  }

  /* ════════════════════════════════════════════════════════════════════════
     C. SELECTOR DE VISTA (lateral / frontal / superior)
     ════════════════════════════════════════════════════════════════════════ */

  const VIEWS = ['lateral', 'frontal', 'superior'];
  const VIEW_LABELS = {
    lateral:  'Lateral',
    frontal:  'Frontal',
    superior: 'Superior'
  };
  const VIEW_ARIA = {
    lateral:  'Vista lateral del modelo craneal',
    frontal:  'Vista frontal del modelo craneal',
    superior: 'Vista superior (norma superius) del modelo craneal'
  };

  /** HTML del selector de normas */
  function _selectorHtml() {
    return `
      <div class="pb-norma-selector" role="group" aria-label="Seleccionar vista craneal">
        <span class="pb-norma-label">Vista:</span>
        ${VIEWS.map(v => `
          <button type="button"
            class="pb-norma-btn${v === 'lateral' ? ' active' : ''}"
            data-pb-norma="${v}"
            aria-pressed="${v === 'lateral' ? 'true' : 'false'}"
            aria-label="${VIEW_ARIA[v]}">
            ${VIEW_LABELS[v]}
          </button>`).join('')}
        <span class="pb-norma-note">Norma superior: esquema ilustrativo inferido de la descripción, no métrico <strong>[PROVISIONAL]</strong>.</span>
      </div>`;
  }

  /* ════════════════════════════════════════════════════════════════════════
     D. INYECCIÓN EN EL COMPARADOR 3D
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Envuelve _cmpRender3DComparativeViewer para añadir selector y norma superior.
   * El resultado es el HTML del comparador original + selector + SVGs superiores cacheados
   * en data-attributes para conmutación CSS.
   */
  function _wrapComparativeViewer() {
    const origFn = window._cmpRender3DComparativeViewer ||
                   (typeof _cmpRender3DComparativeViewer === 'function' ? _cmpRender3DComparativeViewer : null);
    if (!origFn) { log('_cmpRender3DComparativeViewer no encontrada, omitiendo wrap'); return; }

    const wrapped = function(species, seriesColors) {
      const originalHtml = origFn(species, seriesColors);
      /* R91-P4: orden de taxones del último render; las tarjetas del visor original
         se generan en el mismo orden, lo que permite un emparejamiento exacto. */
      _lastSpeciesIds = Array.isArray(species) ? species.map(sp => sp && sp.id) : [];

      if (!species || species.length === 0) return originalHtml;

      // Los SVGs de norma superior, un fragmento HTML oculto por cada tarjeta
      // Se insertarán en el DOM tras renderizar el HTML original
      // Los almacenamos en un div#pb-norma-cache con data-id
      const superiorCache = species.map(sp => {
        const col = (seriesColors && seriesColors[sp.id]) ||
                    (window.CLADE_COLORS && window.CLADE_COLORS[sp.clado]) || '#8a96a6';
        return `<div class="pb-norma-cache-item" data-norma-id="${_esc(sp.id)}">
          ${_superiorSvg(sp, col)}
        </div>`;
      }).join('');

      return `
        ${_selectorHtml()}
        <div id="pb-norma-cache" hidden aria-hidden="true">${superiorCache}</div>
        ${originalHtml}`;
    };

    window._cmpRender3DComparativeViewer = wrapped;
    log('_cmpRender3DComparativeViewer envuelta con norma superior');
  }

  /* ════════════════════════════════════════════════════════════════════════
     E. CONTROLADOR DE EVENTOS DEL SELECTOR
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Activa la vista seleccionada en todas las tarjetas del comparador.
   * Para lateral/frontal: muestra el SVG original (.cmp-3d-model).
   * Para superior: sustituye el SVG por el de norma superior desde el cache.
   */
  function _activateView(view) {
    const stage = document.querySelector('.cmp-3d-stage');
    if (!stage) return;

    // Actualizar botones
    stage.querySelectorAll('[data-pb-norma]').forEach(btn => {
      const isActive = btn.dataset.pbNorma === view;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Actualizar etiqueta de eje en cada escena
    stage.querySelectorAll('.cmp-3d-axis').forEach(axis => {
      if (view === 'lateral') axis.innerHTML = '<i></i> lateral + frontal';
      else if (view === 'frontal') axis.innerHTML = '<i></i> vista frontal';
      else axis.innerHTML = '<i></i> norma superior (superius)';
    });

    // Conmutar SVG en cada tarjeta
    const cards = stage.querySelectorAll('.cmp-3d-card');
    cards.forEach(card => {
      const scene = card.querySelector('.cmp-3d-scene');
      if (!scene) return;

      if (view === 'superior') {
        // Buscar SVG de norma superior para este taxón
        const titleEl = card.querySelector('.cmp-3d-title');
        // El id del taxón está en el data-cranial o en el aria-label del SVG original
        const origSvg = scene.querySelector('.cmp-3d-model:not(.cmp-superior-model)');
        if (!origSvg) return;

        // Extraer id del taxón desde aria-label del SVG original
        const ariaLabel = origSvg.getAttribute('aria-label') || '';
        // Buscar en el cache por texto coincidente del nombre del taxón
        const cache = document.getElementById('pb-norma-cache');
        if (!cache) return;

        // Intentar match por id del SVG (data-norma-id)
        const cacheItems = cache.querySelectorAll('[data-norma-id]');
        let supSvg = null;
        cacheItems.forEach(item => {
          // Comparar con aria-label del SVG original (contiene el nombre del taxón)
          const supModel = item.querySelector('.cmp-superior-model');
          if (supModel && ariaLabel.includes(supModel.getAttribute('aria-label')?.split('de ')[1] || '__NO__')) {
            supSvg = supModel.cloneNode(true);
          }
        });
        // Fallback: primer item del cache si solo hay un taxón
        if (!supSvg && cacheItems.length === 1) {
          supSvg = cacheItems[0].querySelector('.cmp-superior-model')?.cloneNode(true);
        }

        if (supSvg) {
          origSvg.style.display = 'none';
          const existing = scene.querySelector('.cmp-superior-model.active-norma');
          if (existing) existing.remove();
          supSvg.classList.add('active-norma');
          scene.insertBefore(supSvg, scene.querySelector('.cmp-3d-axis'));
        }
      } else {
        // Restaurar SVG original
        const origSvg = scene.querySelector('.cmp-3d-model:not(.cmp-superior-model)');
        const supSvg  = scene.querySelector('.active-norma');
        if (origSvg) origSvg.style.display = '';
        if (supSvg)  supSvg.remove();

        // Para frontal: aplicar transform adicional al SVG original
        if (origSvg) {
          origSvg.style.transform = view === 'frontal'
            ? 'none'   // El SVG ya tiene la vista frontal como segundo grupo
            : '';      // lateral: CSS por defecto
        }
      }
    });

    log('Vista craneal activada:', view);
  }

  /* ════════════════════════════════════════════════════════════════════════
     F. MATCH PRECISO POR ESPECIE para la conmutación
     El sistema anterior usa aria-label para el match, lo que es frágil.
     Esta versión inyecta data-sp-id directamente en cada card al renderizar.
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Tras renderizar el comparador, añade data-sp-id a cada .cmp-3d-card
   * leyendo el nombre del taxón y cruzándolo con el DB.
   */
  function _tagCardsWithSpId() {
    const stage = document.querySelector('.cmp-3d-stage');
    if (!stage) return;
    const db = window.DB_INDEX || {};
    const cards = stage.querySelectorAll('.cmp-3d-card');
    /* R91-P4: el emparejamiento anterior por prefijo («Au.», «H.») asignaba a cada
       tarjeta el PRIMER taxón del género abreviado (p. ej. Au. afarensis → anamensis),
       de modo que la norma superior mostraba otro taxón. Ahora: 1) orden del render
       cuando coincide el número de tarjetas; 2) nombre exacto; 3) sin etiqueta
       (la tarjeta conserva su modelo original en lugar de uno erróneo). */
    const byOrder = _lastSpeciesIds.length === cards.length;
    cards.forEach((card, idx) => {
      if (card.dataset.spId) return;
      if (byOrder && _lastSpeciesIds[idx]) { card.dataset.spId = _lastSpeciesIds[idx]; return; }
      const nameEl = card.querySelector('.cmp-3d-title [lang="la"], .cmp-3d-title');
      const name = nameEl?.textContent?.trim() || '';
      const match = Object.values(db).find(sp => sp.nombre === name);
      if (match) card.dataset.spId = match.id;
    });
  }

  /** R91-P4: renombra los id internos del clon (gradientes) para no duplicar id
      y para que url(#…) no apunte a la copia oculta de la caché. */
  function _dedupeCloneIds(clone) {
    const map = {};
    clone.querySelectorAll('[id]').forEach(el => {
      const next = el.id + '-vis';
      map[el.id] = next;
      el.id = next;
    });
    if (!Object.keys(map).length) return clone;
    clone.querySelectorAll('*').forEach(el => {
      ['fill', 'stroke', 'filter', 'clip-path', 'mask'].forEach(attr => {
        const v = el.getAttribute(attr);
        if (!v || v.indexOf('url(#') === -1) return;
        el.setAttribute(attr, v.replace(/url\(#([^)]+)\)/g, (m, id) => map[id] ? `url(#${map[id]})` : m));
      });
    });
    return clone;
  }

  /**
   * Versión mejorada de _activateView que usa data-sp-id para match preciso.
   */
  function _activateViewPrecise(view) {
    const stage = document.querySelector('.cmp-3d-stage');
    if (!stage) return;

    _tagCardsWithSpId();

    // Actualizar botones del selector
    // R91-P4: el selector se renderiza fuera de .cmp-3d-stage (hermano previo).
    (stage.closest('#compareModal') || document).querySelectorAll('.pb-norma-selector [data-pb-norma]').forEach(btn => {
      const isActive = btn.dataset.pbNorma === view;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Actualizar etiqueta de eje
    stage.querySelectorAll('.cmp-3d-axis').forEach(axis => {
      axis.innerHTML = {
        lateral:  '<i></i> lateral + frontal',
        frontal:  '<i></i> vista frontal',
        superior: '<i></i> norma superior (superius)'
      }[view] || '<i></i>';
    });

    const cache = document.getElementById('pb-norma-cache');

    stage.querySelectorAll('.cmp-3d-card').forEach(card => {
      const scene  = card.querySelector('.cmp-3d-scene');
      if (!scene) return;
      const spId   = card.dataset.spId || '';
      const origSvg = scene.querySelector('.cmp-3d-model:not(.cmp-superior-model):not(.active-norma)');
      const activeSup = scene.querySelector('.active-norma');

      if (view === 'superior') {
        // Buscar en cache por spId
        const cacheItem = cache?.querySelector(`[data-norma-id="${CSS.escape(spId)}"]`);
        const supModel  = cacheItem?.querySelector('.cmp-superior-model');
        if (supModel) {
          const clone = _dedupeCloneIds(supModel.cloneNode(true));
          clone.classList.add('active-norma');
          if (origSvg) origSvg.style.display = 'none';
          if (activeSup) activeSup.remove();
          scene.insertBefore(clone, scene.querySelector('.cmp-3d-axis'));
        }
      } else {
        // Restaurar original
        if (activeSup) activeSup.remove();
        if (origSvg) origSvg.style.display = '';
      }
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     G. CSS DEL SELECTOR DE NORMAS
     ════════════════════════════════════════════════════════════════════════ */

  function _injectStyles() {
    /* R91-P4: CSS externalizado en assets/css/60-science/036b-paleobot-v66-cranial-norma.css
       (id pb-m5-cranial-styles); la CSP bloquea <style> inyectados. */
    if (!document.getElementById('pb-m5-cranial-styles')) log('Hoja de estilos craneal no enlazada');
  }

  /* ════════════════════════════════════════════════════════════════════════
     H. DELEGACIÓN DE EVENTOS
     ════════════════════════════════════════════════════════════════════════ */

  function _attachEvents() {
    // Usar event delegation en el compareModal para los botones de selector
    const modal = document.getElementById('compareModal');
    if (!modal) return;

    modal.addEventListener('click', function(e) {
      const btn = e.target.closest('[data-pb-norma]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      _activateViewPrecise(btn.dataset.pbNorma);
    });

    log('Delegación de eventos del selector de normas instalada');
  }

  /* ════════════════════════════════════════════════════════════════════════
     I. INICIALIZACIÓN
     ════════════════════════════════════════════════════════════════════════ */

  function _init() {
    _injectStyles();

    // El wrap debe ocurrir antes de que se llame a _cmpRender3DComparativeViewer
    // Intentamos inmediatamente y también con un retry si la función aún no existe
    function _tryWrap(tries) {
      const fn = window._cmpRender3DComparativeViewer ||
                 (typeof _cmpRender3DComparativeViewer !== 'undefined' ? _cmpRender3DComparativeViewer : null);
      if (fn && fn._isM5Wrapped !== true) {
        _wrapComparativeViewer();
        if (window._cmpRender3DComparativeViewer) {
          window._cmpRender3DComparativeViewer._isM5Wrapped = true;
        }
      } else if (!fn && (tries || 0) < 30) {
        setTimeout(() => _tryWrap((tries || 0) + 1), 100);
      }
    }
    _tryWrap(0);

    _attachEvents();

    // Re-etiquetar tarjetas cuando el comparador se re-renderiza
    ['paleobot:viewchange','paleobot:v55-viewchange'].forEach(evt => {
      document.addEventListener(evt, () => {
        setTimeout(_tagCardsWithSpId, 300);
      });
    });

    // MutationObserver en compareResult para detectar re-renders
    const compResult = document.getElementById('compareResult');
    if (compResult && window.MutationObserver) {
      const obs = new MutationObserver(() => {
        setTimeout(_tagCardsWithSpId, 100);
      });
      obs.observe(compResult, { childList: true, subtree: false });
    }

    window.PaleoBotV66CranialNorma = {
      superiorSvg: _superiorSvg,
      activateView: _activateViewPrecise
    };
    log('M5 Viewer craneal multi-norma listo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init, { once: true });
  } else {
    _init();
  }

})();
