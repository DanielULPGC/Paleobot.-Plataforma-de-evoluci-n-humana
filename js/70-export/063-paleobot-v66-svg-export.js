// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v66-svg-export
(function PaleoBotV66SvgExport() {
  'use strict';

  const DEBUG = typeof window.__PALEOBOT_DEBUG !== 'undefined' && window.__PALEOBOT_DEBUG;
  const log   = DEBUG ? console.log.bind(console,  '[PB66-SVG]') : () => {};
  const warn  = DEBUG ? console.warn.bind(console, '[PB66-SVG]') : () => {};

  /* ── Paleta de colores por clado (sincronizada con CLADE_COLORS) ──────── */
  const EXPORT_COLORS = {
    basal:    '#6b8fa3',
    australo: '#2e8b57',
    paran:    '#c0392b',
    homo:     '#1a4fa0',
    node:     '#5c4f3a',
    edge_ok:  '#2e8b57',
    edge_warn:'#c07800',
    edge_bad: '#c0392b',
    edge_def: '#8f8174',
    bg:       '#faf8f4',
    text:     '#1c2b3a',
    axis:     '#6b5f4e'
  };

  /* ── Fuente embed para SVG standalone (sans-serif segura) ────────────── */
  const FONT_STACK = '"Source Sans 3", "Segoe UI", Arial, sans-serif';
  const temporal = window.PaleoBotA3Temporal;
  if (!temporal || typeof temporal.displayMetadata !== 'function') throw new TypeError('A3 chronology unavailable');
  function _chrono(sp) { return temporal.displayMetadata(sp); }
  function _metadata(sp) {
    const m = _chrono(sp);
    return {id:m.id,source_status:m.source_status,kind:m.kind,entity_type:m.entity_type,
      dating_relation:m.dating_relation,source_ids:m.source_ids,scope_note:m.scope_note,
      scientific_duration:'NOT_ASSESSED'};
  }
  function _metadataBlock(rows) {
    return `<metadata>${_esc(JSON.stringify({schema:'paleobot-a3-c5.2-svg-metadata-v1',release_gate:'NO_GO',chronology:rows}))}</metadata>`;
  }

  /* ── Cabecera de metadatos SVG ───────────────────────────────────────── */
  function _svgHeader(title, subtitle, w, h) {
    const date = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
    return `<g class="pb-export-header" font-family="${_esc(FONT_STACK)}">
      <rect x="0" y="0" width="${w}" height="${h}" fill="${EXPORT_COLORS.bg}"/>
      <text x="${w/2}" y="26" text-anchor="middle" font-size="15" font-weight="700"
            fill="${EXPORT_COLORS.text}">${_esc(title)}</text>
      <text x="${w/2}" y="42" text-anchor="middle" font-size="10.5" fill="${EXPORT_COLORS.axis}">
        ${_esc(subtitle)} · PaleoBot v66 · ULPGC · ${_esc(date)}</text>
    </g>`;
  }

  /* ── Leyenda de clados (para constructor) ────────────────────────────── */
  function _cladeLegendsVg(x, y) {
    const CLADE_NAMES_LOCAL = window.CLADE_NAMES || {
      basal:'Mioceno/Basales', australo:'Australopithecus',
      paran:'Paranthropus', homo:'Homo'
    };
    return Object.entries(EXPORT_COLORS)
      .filter(([k]) => ['basal','australo','paran','homo'].includes(k))
      .map(([k, col], i) => {
        const lx = x + i * 130;
        return `<g>
          <rect x="${lx}" y="${y}" width="12" height="12" rx="3" fill="${col}"/>
          <text x="${lx+16}" y="${y+10}" font-size="10" fill="${EXPORT_COLORS.text}"
                font-family="${_esc(FONT_STACK)}">${_esc(CLADE_NAMES_LOCAL[k] || k)}</text>
        </g>`;
      }).join('');
  }

  /* ── Escape XML ──────────────────────────────────────────────────────── */
  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Descarga un string SVG como fichero ─────────────────────────────── */
  function _download(svgString, filename) {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  /* ── Flash de confirmación ───────────────────────────────────────────── */
  function _flash(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.classList.add('pb-r79-export-flash');
    document.body.appendChild(el);
    setTimeout(() => { window.PaleoBotStyleState.opacityZero(el, true); }, 1800);
    setTimeout(() => el.remove(), 2300);
  }

  /* ════════════════════════════════════════════════════════════════════════
     A. EXPORTAR CLADOGRAMA (vista phylo)
     ════════════════════════════════════════════════════════════════════════ */
  /**
   * Exporta el SVG del cladograma de #phyloSvgContainer como fichero .svg.
   * Añade fondo, cabecera de metadatos y nota de advertencia científica.
   */
  function exportPhyloSvg() {
    const container = document.getElementById('phyloSvgContainer');
    const srcSvg    = container?.querySelector('svg');
    if (!srcSvg) {
      warn('SVG del cladograma no encontrado — ¿está renderizado?');
      _flash('⚠ Primero navega a la vista Cladograma para generarlo.');
      return;
    }

    /* Serializar el SVG original */
    const serializer = new XMLSerializer();
    let   svgStr     = serializer.serializeToString(srcSvg);

    /* Leer dimensiones del viewBox */
    const vb = srcSvg.getAttribute('viewBox')?.split(/\s+/).map(Number) || [0, 0, 1240, 800];
    const W  = vb[2] || 1240;
    const H  = vb[3] || 800;

    /* Nota científica inferior */
    const NOTE_H = 56;
    const totalH = H + NOTE_H;
    const NOTE_TEXT = 'Hipótesis didáctica; disposición no cronológica. Las edades de especímenes no son duraciones taxonómicas. ' +
      'Las 45 cronologías heredadas no están revisadas. La atribución de fuentes filogenéticas requiere revisión independiente.';

    /* Construir SVG wrapper con metadatos */
    const out = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
      `     viewBox="0 0 ${W} ${totalH}" width="${W}" height="${totalH}"`,
      `     role="img" aria-label="Cladograma filogenético homininos — PaleoBot v66">`,
      `  <title>Cladograma filogenético homininos — PaleoBot v66</title>`,
      `  <desc>Hipótesis didáctica. Disposición no cronológica; las edades de especímenes no representan duraciones taxonómicas.</desc>`,
      _metadataBlock((window.DB || []).map(sp => _metadata(sp))),
      /* Fondo */
      `  <rect width="${W}" height="${totalH}" fill="${EXPORT_COLORS.bg}"/>`,
      /* Contenido original del SVG (children, no el wrapper) */
      `  <g transform="translate(0,0)">`,
      ...Array.from(srcSvg.children).map(c => serializer.serializeToString(c)),
      `  </g>`,
      /* Nota inferior */
      `  <rect x="0" y="${H}" width="${W}" height="${NOTE_H}" fill="#e8e4dc"/>`,
      `  <text x="12" y="${H + NOTE_H/2 + 4}" font-size="9.5" fill="${EXPORT_COLORS.axis}"`,
      `        font-family="${_esc(FONT_STACK)}" font-style="italic">${_esc(NOTE_TEXT)}</text>`,
      `</svg>`
    ].join('\n');

    const date     = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const filename = `paleobot-cladograma-${date}.svg`;
    _download(out, filename);
    _flash(`✓ Cladograma exportado: ${filename}`);
    log('Exportado cladograma SVG', filename);
  }

  /* ════════════════════════════════════════════════════════════════════════
     B. EXPORTAR ÁRBOL CONSTRUIDO (vista constructor)
     ════════════════════════════════════════════════════════════════════════ */
  /**
   * Sintetiza un SVG standalone a partir de los nodos div y las aristas SVG
   * del constructor de hipótesis filogenéticas.
   *
   * Algoritmo:
   *   1. Lee treeBuilderState.nodes → posiciones y metadatos de cada taxón
   *   2. Lee treeBuilderState.edges + treeBuilderState.statusMap → aristas
   *   3. Construye los paths de aristas con colores de estado
   *   4. Construye rect+text para cada nodo
   *   5. Añade leyenda, metadatos y nota metodológica
   */
  function exportBuilderSvg() {
    /* R94: treeBuilderState se declara con «let» en el ámbito global de 002 y no es propiedad
       de window; la lectura anterior devolvía siempre undefined y la exportación no hacía nada. */
    const state = window.treeBuilderState ||
      (typeof treeBuilderState !== 'undefined' ? treeBuilderState : null);
    if (!state) { warn('treeBuilderState no disponible'); _flash('No se pudo acceder al estado del constructor.'); return; }

    if (!state.nodes || state.nodes.length === 0) {
      _flash('⚠ El lienzo está vacío. Añade taxones antes de exportar.');
      return;
    }

    /* ── Dimensiones del lienzo ──────────────────────────────────────── */
    const CANVAS_EL  = document.getElementById('builderCanvas');
    const RAW_W      = CANVAS_EL?.offsetWidth  || 820;
    const RAW_H      = CANVAS_EL?.offsetHeight || 560;
    const PAD        = 60;   // padding alrededor del lienzo
    const HEADER_H   = 64;   // cabecera con título
    const LEGEND_H   = 32;   // fila de leyenda
    const NOTE_H     = 48;   // nota inferior
    const NODE_W     = 118;  // ancho de tarjeta de nodo (min-width en CSS)
    const NODE_H     = 44;   // alto estimado de tarjeta de nodo
    const SVG_W      = RAW_W + PAD * 2;
    const SVG_H      = HEADER_H + LEGEND_H + RAW_H + PAD + NOTE_H;
    const OFFSET_X   = PAD;
    const OFFSET_Y   = HEADER_H + LEGEND_H;

    /* ── Funciones de color ──────────────────────────────────────────── */
    const CLADE_COLORS_LOCAL = window.CLADE_COLORS || {
      basal: EXPORT_COLORS.basal, australo: EXPORT_COLORS.australo,
      paran:  EXPORT_COLORS.paran, homo:    EXPORT_COLORS.homo
    };
    const DB_IDX = window.DB_INDEX || {};

    function _nodeColor(id) {
      const sp = DB_IDX[id];
      return CLADE_COLORS_LOCAL[sp?.clado] || '#888888';
    }

    function _edgeColor(status) {
      if (status === 'ok')   return EXPORT_COLORS.edge_ok;
      if (status === 'warn') return EXPORT_COLORS.edge_warn;
      if (status === 'bad')  return EXPORT_COLORS.edge_bad;
      return EXPORT_COLORS.edge_def;
    }

    function _edgeLabel(status) {
      if (status === 'ok')   return 'consenso';
      if (status === 'warn') return 'debatida';
      if (status === 'bad')  return 'no documentada';
      return '';
    }

    /* ── Aristas ─────────────────────────────────────────────────────── */
    const byId = Object.fromEntries(state.nodes.map(n => [n.id, n]));
    const statusMap = state.statusMap || {};

    const edgeParts = (state.edges || []).map(e => {
      const a = byId[e.from], b = byId[e.to];
      if (!a || !b) return '';
      // Centro de cada nodo (mismo cálculo que drawBuilderEdges)
      const ax = a.x + 59 + OFFSET_X, ay = a.y + 22 + OFFSET_Y;
      const bx = b.x + 59 + OFFSET_X, by = b.y + 22 + OFFSET_Y;
      const mx = (ax + bx) / 2, my = Math.min(ay, by) - 28;
      const status = statusMap[e.key] || '';
      const col    = _edgeColor(status);
      const lbl    = _edgeLabel(status);
      const strokeW = status === 'ok' ? '2.4' : '1.8';
      const dash    = status === 'bad' ? 'stroke-dasharray="5,4"' : '';
      return [
        `<path d="M${ax},${ay} Q${mx},${my} ${bx},${by}"`,
        `  fill="none" stroke="${col}" stroke-width="${strokeW}" ${dash}`,
        `  stroke-linecap="round" opacity="0.85"/>`,
        lbl ? `<text x="${mx}" y="${my-6}" text-anchor="middle" font-size="9"` +
              `  fill="${col}" font-family="${_esc(FONT_STACK)}" font-style="italic">${_esc(lbl)}</text>` : ''
      ].join(' ');
    }).join('\n');

    /* ── Nodos ───────────────────────────────────────────────────────── */
    const CLADE_NAMES_LOCAL = window.CLADE_NAMES || {};
    const shortName = window.shortTaxonName || (n => n);

    const nodeParts = state.nodes.map(n => {
      const sp    = DB_IDX[n.id];
      const col   = _nodeColor(n.id);
      const x     = n.x + OFFSET_X;
      const y     = n.y + OFFSET_Y;
      const label = sp ? shortName(sp.nombre) : n.id;
      const clade = sp ? (CLADE_NAMES_LOCAL[sp.clado] || sp.clado || '') : '';
      const cm = sp ? _chrono(sp) : null;
      const anios = !cm ? 'Sin ficha' : cm.source_status !== 'A2_REVIEWED' ? 'Sin revisar' :
        cm.kind === 'alternative_intervals' ? '2 ventanas · A2' :
        cm.kind === 'minimum_age' ? 'Edad mínima · A2' :
        cm.kind === 'point_estimate' ? 'Edad puntual · A2' : 'Cronología ND';
      const isSelected = state.selected === n.id;
      return [
        `<g>`,
        cm ? `<title>${_esc(cm.text + '; ' + cm.scope_note + '; ' + cm.source_label)}</title>` : '',
        /* Sombra */
        `  <rect x="${x+2}" y="${y+2}" width="${NODE_W}" height="${NODE_H}" rx="10"`,
        `    fill="rgba(0,0,0,0.08)"/>`,
        /* Fondo de tarjeta */
        `  <rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="10"`,
        `    fill="white" stroke="${col}" stroke-width="${isSelected ? '3' : '1.5'}"/>`,
        /* Banda de color superior */
        `  <rect x="${x}" y="${y}" width="${NODE_W}" height="6" rx="10" fill="${col}"/>`,
        `  <rect x="${x}" y="${y+4}" width="${NODE_W}" height="2" fill="${col}"/>`,
        /* Nombre del taxón */
        `  <text x="${x + NODE_W/2}" y="${y+22}" text-anchor="middle" font-size="11"`,
        `    font-weight="700" fill="${EXPORT_COLORS.text}"`,
        `    font-family="${_esc(FONT_STACK)}" font-style="italic">${_esc(label)}</text>`,
        /* Clado + tiempo */
        `  <text x="${x + NODE_W/2}" y="${y+35}" text-anchor="middle" font-size="8.5"`,
        `    fill="${EXPORT_COLORS.axis}" font-family="${_esc(FONT_STACK)}">`,
        `    ${_esc(clade)}${anios ? ' · ' + anios : ''}</text>`,
        `</g>`
      ].join('\n');
    }).join('\n');

    /* ── Resumen de comparación (si existe) ──────────────────────────── */
    const ok   = Object.values(statusMap).filter(s => s === 'ok').length;
    const warn = Object.values(statusMap).filter(s => s === 'warn').length;
    const bad  = Object.values(statusMap).filter(s => s === 'bad').length;
    const hasStatus = ok + warn + bad > 0;
    const summaryText = hasStatus
      ? `Comparación: ${ok} consenso · ${warn} debatidas · ${bad} no documentadas`
      : 'Sin comparación — pulsa "Comparar hipótesis" en el lienzo para añadir valoración';

    /* ── Ensamblado final ────────────────────────────────────────────── */
    const out = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg"`,
      `     viewBox="0 0 ${SVG_W} ${SVG_H}" width="${SVG_W}" height="${SVG_H}"`,
      `     role="img" aria-label="Hipótesis filogenética construida — PaleoBot v66">`,
      `  <title>Hipótesis filogenética — PaleoBot v66</title>`,
      `  <desc>${state.nodes.length} registros · ${(state.edges||[]).length} conexiones. Hipótesis didáctica, no árbol temporal validado.</desc>`,
      _metadataBlock(state.nodes.map(n => n.id in DB_IDX ? _metadata(DB_IDX[n.id]) : {id:n.id,source_status:'UNKNOWN',scientific_duration:'NOT_ASSESSED'})),

      /* Fondo general */
      `  <rect width="${SVG_W}" height="${SVG_H}" fill="${EXPORT_COLORS.bg}"/>`,

      /* Cabecera */
      `  <rect x="0" y="0" width="${SVG_W}" height="${HEADER_H}" fill="${EXPORT_COLORS.text}"/>`,
      `  <text x="${SVG_W/2}" y="28" text-anchor="middle" font-size="16" font-weight="700"`,
      `    fill="white" font-family="${_esc(FONT_STACK)}">Hipótesis filogenética propia</text>`,
      `  <text x="${SVG_W/2}" y="46" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.75)"`,
      `    font-family="${_esc(FONT_STACK)}">`,
      `    ${state.nodes.length} taxones · ${(state.edges||[]).length} conexiones · PaleoBot v66 · ULPGC</text>`,
      `  <text x="${SVG_W/2}" y="${HEADER_H - 6}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)"`,
      `    font-family="${_esc(FONT_STACK)}">${_esc(new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'}))}</text>`,

      /* Leyenda de clados */
      `  <g transform="translate(${PAD}, ${HEADER_H + 8})">`,
      _cladeLegendsVg(0, 0),
      /* Leyenda de aristas si hay comparación */
      hasStatus ? [
        `<rect x="530" y="0" width="10" height="10" rx="2" fill="${EXPORT_COLORS.edge_ok}"/>`,
        `<text x="544" y="9" font-size="9" fill="${EXPORT_COLORS.text}" font-family="${_esc(FONT_STACK)}">Consenso</text>`,
        `<rect x="608" y="0" width="10" height="10" rx="2" fill="${EXPORT_COLORS.edge_warn}"/>`,
        `<text x="622" y="9" font-size="9" fill="${EXPORT_COLORS.text}" font-family="${_esc(FONT_STACK)}">Debatida</text>`,
        `<rect x="676" y="0" width="10" height="10" rx="2" fill="${EXPORT_COLORS.edge_bad}"/>`,
        `<text x="690" y="9" font-size="9" fill="${EXPORT_COLORS.text}" font-family="${_esc(FONT_STACK)}">No documentada</text>`,
      ].join('\n') : '',
      `  </g>`,

      /* Área del lienzo — fondo blanco sutil */
      `  <rect x="${OFFSET_X - 8}" y="${OFFSET_Y - 8}"`,
      `    width="${RAW_W + 16}" height="${RAW_H + 16}"`,
      `    rx="12" fill="white" stroke="#e0dbd4" stroke-width="1"/>`,

      /* Aristas (debajo de los nodos) */
      edgeParts,

      /* Nodos */
      nodeParts,

      /* Nota de resumen de comparación */
      `  <rect x="0" y="${OFFSET_Y + RAW_H + PAD - 4}" width="${SVG_W}" height="${NOTE_H}"`,
      `    fill="#e8e4dc"/>`,
      `  <text x="12" y="${OFFSET_Y + RAW_H + PAD + NOTE_H/2 + 2}"`,
      `    font-size="9.5" fill="${EXPORT_COLORS.axis}" font-style="italic"`,
      `    font-family="${_esc(FONT_STACK)}">${_esc(summaryText)}</text>`,

      /* Nota metodológica inferior */
      `  <rect x="0" y="${SVG_H - NOTE_H}" width="${SVG_W}" height="${NOTE_H}" fill="#d8d4cc"/>`,
      `  <text x="12" y="${SVG_H - NOTE_H/2 + 4}" font-size="9" fill="${EXPORT_COLORS.axis}"`,
      `    font-family="${_esc(FONT_STACK)}" font-style="italic">`,
      `    Hipótesis didáctica. Las fechas no son duraciones taxonómicas; 45 cronologías heredadas sin revisión A2.</text>`,

      `</svg>`
    ].join('\n');

    const date     = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const filename = `paleobot-arbol-hipotesis-${date}.svg`;
    _download(out, filename);
    _flash(`✓ Hipótesis exportada: ${filename}`);
    log('Exportado árbol constructor SVG', filename);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INYECCIÓN DE BOTONES EN EL DOM
     ════════════════════════════════════════════════════════════════════════ */

  /** SVG icon descargar */
  const ICON_DL = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>`;

  /**
   * Añade el botón de exportación al footer del cladograma.
   * Se llama tras renderPhyloTree() — el footer ya existe en el DOM estático.
   */
  function _injectPhyloButton() {
    const footer = document.querySelector('#view-phylo .phylo-footer');
    if (!footer || footer.querySelector('[data-action="exportPhyloSvg"]')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'builder-btn';
    btn.setAttribute('data-action', 'exportPhyloSvg');
    btn.setAttribute('aria-label', 'Descargar cladograma como SVG');
    btn.innerHTML = `${ICON_DL} Descargar SVG`;
    btn.classList.add('pb-r79-export-phylo-btn');
    footer.appendChild(btn);
    log('Botón exportPhyloSvg inyectado');
  }

  /**
   * Añade el botón de exportación a la barra de controles del constructor.
   * Se llama cuando la vista 'constructor' se activa y el DOM ya existe.
   */
  function _injectBuilderButton() {
    const controls = document.querySelector('.builder-controls');
    if (!controls || controls.querySelector('[data-action="exportBuilderSvg"]')) return;
    /* Insertar antes del botón "Limpiar lienzo" */
    const clearBtn = controls.querySelector('[data-builder-action="clear"]');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'builder-btn';
    btn.setAttribute('data-action', 'exportBuilderSvg');
    btn.setAttribute('aria-label', 'Descargar árbol construido como SVG');
    btn.innerHTML = `${ICON_DL} Exportar SVG`;
    if (clearBtn) {
      controls.insertBefore(btn, clearBtn);
    } else {
      controls.appendChild(btn);
    }
    log('Botón exportBuilderSvg inyectado');
  }

  /* ── Registro en el sistema de acciones canónico ─────────────────────── */
  function _registerActions() {
    /* Router v65.1 audit-fix */
    if (window.setModal && window._PB_ACTION_TO_MODAL) {
      // No es un modal — se gestiona vía call() fallback de v68
    }

    /* window global (para call() de v68) */
    window.exportPhyloSvg    = exportPhyloSvg;
    window.exportBuilderSvg  = exportBuilderSvg;

    /* getActionContractMap si existe */
    if (typeof window.getActionContractMap === 'function') {
      try {
        const map = window.getActionContractMap();
        if (map) {
          map.exportPhyloSvg   = exportPhyloSvg;
          map.exportBuilderSvg = exportBuilderSvg;
        }
      } catch(e) {}
    }

    /* PaleoBotBus si existe */
    if (window.PaleoBotBus?.registerAction) {
      try {
        window.PaleoBotBus.registerAction('exportPhyloSvg',   exportPhyloSvg);
        window.PaleoBotBus.registerAction('exportBuilderSvg', exportBuilderSvg);
      } catch(e) {}
    }

    log('Acciones exportPhyloSvg + exportBuilderSvg registradas');
  }

  /* ── Observar cambios de vista para inyectar botones bajo demanda ─────── */
  function _watchViews() {
    /* Inyección inmediata si la vista ya está activa */
    if (document.getElementById('view-phylo')?.classList.contains('active')) {
      window.setTimeout(_injectPhyloButton, 200);
    }
    if (document.getElementById('view-constructor')?.classList.contains('active')) {
      window.setTimeout(_injectBuilderButton, 200);
    }

    /* Escuchar evento de cambio de vista del sistema canónico */
    ['paleobot:viewchange', 'paleobot:v55-viewchange', 'paleobot:combined-viewchange'].forEach(evt => {
      document.addEventListener(evt, function(e) {
        const view = e.detail?.view || e.detail?.viewId || '';
        if (view === 'phylo') window.setTimeout(_injectPhyloButton, 250);
        if (view === 'constructor') window.setTimeout(_injectBuilderButton, 250);
      });
    });

    /* Fallback: MutationObserver en la vista phylo para detectar cuando
       renderPhyloTree() puebla #phyloSvgContainer */
    const phyloContainer = document.getElementById('phyloSvgContainer');
    if (phyloContainer && window.MutationObserver) {
      const obs = new MutationObserver(() => {
        if (phyloContainer.querySelector('svg')) {
          _injectPhyloButton();
          obs.disconnect();
        }
      });
      obs.observe(phyloContainer, { childList: true });
    }

    /* Fallback para constructor: MutationObserver en .builder-controls */
    function _watchBuilderControls() {
      const ctrl = document.querySelector('.builder-controls');
      if (!ctrl) return;
      _injectBuilderButton();
    }
    document.addEventListener('paleobot:viewchange', e => {
      if ((e.detail?.view || '') === 'constructor') {
        window.setTimeout(_watchBuilderControls, 300);
      }
    });
  }

  /* ── Inicialización ───────────────────────────────────────────────────── */
  function _init() {
    _registerActions();
    _watchViews();
    window.PaleoBotV66SvgExport = { exportPhyloSvg, exportBuilderSvg };
    log('M2 SVG Export listo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init, { once: true });
  } else {
    _init();
  }

})();
