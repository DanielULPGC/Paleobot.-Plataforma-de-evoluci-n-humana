// medidas-legibilidad.cjs · mide, en páginas públicas, (1) letra menor de 12 px en texto visible,
// (2) objetivos interactivos visibles menores de 24 × 24 px (WCAG 2.2, 2.5.8), (3) número de <h1>,
// (4) enlaces al atlas sin ancla «#main-content».
// Uso: node scripts/atlas/medidas-legibilidad.cjs [--base URL] [--salida medidas.json]
// Requiere un servidor estático sobre la raíz del repositorio (véase README) y Playwright.
'use strict';
const fs = require('fs');
const { chromium } = require('playwright');
const a = process.argv.slice(2);
const val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const BASE = val('--base', 'http://127.0.0.1:8951');
const SALIDA = val('--salida', '');
const PAGINAS = ['atlas/recorrido/portada-sylva.html', 'atlas/index.html', 'dea/index.html', 'ligera/index.html'];
const VPS = [[390, 844], [1366, 768]];

function medir() {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const ruta = (el) => { let t = el.tagName.toLowerCase(); if (el.id) t += '#' + el.id; else if (el.className && typeof el.className === 'string') t += '.' + el.className.trim().split(/\s+/)[0]; return t; };
  const pequenas = {}; let nTexto = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) { const n = w.currentNode; if (!n.nodeValue.trim()) continue; const el = n.parentElement;
    if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || !vis(el)) continue; nTexto++;
    const px = parseFloat(getComputedStyle(el).fontSize); if (px < 12) { const k = ruta(el) + '@' + px; pequenas[k] = (pequenas[k] || 0) + 1; } }
  const objetivos = [];
  document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab]').forEach((el) => {
    if (!vis(el)) return; const r = el.getBoundingClientRect();
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') return; // excepción 2.5.8: enlace en línea
    if (r.width < 24 || r.height < 24) objetivos.push(ruta(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); });
  const enlacesAtlas = [...document.querySelectorAll('a[href*="atlas/"]')].map((x) => x.getAttribute('href')).filter((h) => !/#/.test(h));
  return { h1: [...document.querySelectorAll('h1')].filter((h) => vis(h) && !h.closest('[aria-hidden=true]')).length, nTexto, pequenas, nPequenas: Object.values(pequenas).reduce((x, y) => x + y, 0),
    objetivosPequenos: objetivos.length, objetivosEjemplos: objetivos.slice(0, 15), enlacesAtlasSinAncla: enlacesAtlas };
}

(async () => {
  const b = await chromium.launch(); const out = {};
  for (const pg of PAGINAS) for (const [w, h] of VPS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    await p.route(/.*/, (r) => (new URL(r.request().url()).origin === new URL(BASE).origin ? r.continue() : r.abort()));
    try { await p.goto(`${BASE}/${pg}`, { waitUntil: 'load' }); await p.waitForTimeout(2500); out[`${pg}@${w}`] = await p.evaluate(medir); }
    catch (e) { out[`${pg}@${w}`] = { error: String(e).slice(0, 120) }; }
    await ctx.close(); }
  await b.close();
  for (const k in out) { const m = out[k]; console.log(k, m.error || `h1=${m.h1} letra<12px=${m.nPequenas} objetivos<24px=${m.objetivosPequenos} enlacesAtlasSinAncla=${m.enlacesAtlasSinAncla.length}`); }
  if (SALIDA) fs.writeFileSync(SALIDA, JSON.stringify(out, null, 1));
})();
