// cascada.cjs · qué hoja gana de verdad en los componentes principales del atlas (CDP CSS.getMatchedStylesForNode).
// Uso: node scripts/atlas/cascada.cjs [--base URL] --json <cascada.json>
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const { abrir, listo, VIEWPORTS, BASE } = require('./arnes.cjs');
const P = require('./pasos.cjs');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const PROPS = ['color', 'background-color', 'font-family', 'font-size', 'border-radius', 'box-shadow', 'padding-top', 'outline-color'];
const OBJETIVOS = {
  'body': 'body',
  'barra de bloques': '#pbV50Blocks',
  'pestaña de bloque activa': '#pbV50Blocks [data-pb-v50-block][aria-selected="true"], #pbV50Blocks [data-pb-v50-block].active',
  'chip de vista': '#pbV50Blocks [data-pb-v50-view]:not(.active)',
  'chip de vista activo': '#pbV50Blocks [data-pb-v50-view].active',
  'botón Bibliografía (barra)': '#pbV50Blocks [data-pb-v50-action="abrirBiblio"]',
  'buscador': '#searchInput',
  'botón Modo clase': '.v36-workspace-shell [data-action="activateClassMode"]',
  'cabecera de vista (h2)': '#view-timeline .view-hero h2, #view-timeline h2',
  'tarjeta de especie (cronología)': '#view-timeline [data-open-species]',
  'título de tarjeta (h3)': '#view-timeline [data-open-species] h3',
  'etiqueta de evidencia': '#view-timeline [class*="evidence"] , #view-timeline [class*="evid"]',
};
(async () => {
  const base = arg('--base', BASE);
  const b = await chromium.launch();
  const { page } = await abrir(b, { base, vp: VIEWPORTS.escritorio, timeout: 15000 });
  const cdp = await page.context().newCDPSession(page);
  const hojas = {};
  cdp.on('CSS.styleSheetAdded', (e) => { hojas[e.header.styleSheetId] = (e.header.sourceURL || (e.header.isInline ? 'inline:' + (e.header.ownerNode || '') : '?')).replace(/^.*\/assets\/css\//, '').replace(/\?.*$/, ''); });
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  await page.goto(base + '/atlas/index.html'); await listo(page); await P.entrar(page);
  const res = {};
  const doc = await cdp.send('DOM.getDocument', { depth: 0 });
  async function analizar(nombre, sel) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: sel }).catch(() => ({ nodeId: 0 }));
    if (!nodeId) return { error: 'sin nodo ' + sel };
    const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
    const comp = await cdp.send('CSS.getComputedStyleForNode', { nodeId });
    const cval = Object.fromEntries(comp.computedStyle.map((p) => [p.name, p.value]));
    const out = { reglasQueCoinciden: m.matchedCSSRules.length, hojasDistintas: new Set(m.matchedCSSRules.map((r) => hojas[r.rule.styleSheetId] || r.rule.origin)).size, propiedades: {} };
    for (const prop of PROPS) {
      let gana = null; let ganaImp = false; const pisan = [];
      for (const r of m.matchedCSSRules) {
        for (const d of r.rule.style.cssProperties) {
          const name = d.name; const coincide = name === prop || (prop === 'background-color' && name === 'background') || (prop === 'padding-top' && name === 'padding') || (prop === 'border-radius' && name === 'border-radius') || (prop === 'font-family' && name === 'font');
          if (!coincide || d.disabled || d.parsedOk === false) continue;
          const imp = !!d.important;
          const h = (hojas[r.rule.styleSheetId] || r.rule.origin) + ' «' + r.rule.selectorList.text.slice(0, 70) + '»' + (imp ? ' !important' : '');
          pisan.push(h);
          if (imp || !ganaImp) { gana = h; ganaImp = ganaImp || imp; }
        }
      }
      if (m.inlineStyle && m.inlineStyle.cssProperties.some((d) => d.name === prop && d.value)) { pisan.push('style= en línea'); if (!ganaImp) gana = 'style= en línea'; }
      out.propiedades[prop] = { valor: cval[prop], gana, declaraciones: pisan.length };
    }
    return out;
  }
  for (const [n, s] of Object.entries(OBJETIVOS)) { try { res[n] = await analizar(n, s); } catch (e) { res[n] = { error: String(e).slice(0, 120) }; } }
  // Ficha abierta
  await page.evaluate(() => document.querySelector('#view-timeline [data-open-species="afarensis"]').click()); await page.waitForTimeout(800);
  for (const [n, s] of Object.entries({ 'ficha (panel)': '#detailView', 'título de ficha': '#detailViewTitle', 'pestaña de ficha': '#detailView [role=tab]', 'cerrar ficha': '#detailView .close-btn, #detailView [aria-label^="Cerrar"]' })) {
    try { res[n] = await analizar(n, s); } catch (e) { res[n] = { error: String(e).slice(0, 120) }; }
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(() => { const b = document.querySelector('#pbV50Blocks [data-pb-v50-action="abrirBiblio"]'); b.click(); }); await page.waitForTimeout(800);
  for (const [n, s] of Object.entries({ 'diálogo (contenido)': '#biblioModal .modal-content', 'cerrar diálogo': '#biblioModal .close-modal' })) {
    try { res[n] = await analizar(n, s); } catch (e) { res[n] = { error: String(e).slice(0, 120) }; }
  }
  fs.writeFileSync(arg('--json', 'cascada.json'), JSON.stringify(res, null, 1));
  console.log(Object.keys(res).length);
  await b.close();
})();
