// variantes.cjs · cuántas variantes visuales distintas hay de botón, tarjeta, chip/etiqueta, pestaña y diálogo
// (firma = fondo, color, borde, radio, tamaño de letra, peso, familia, relleno, sombra), recorriendo las 31 vistas
// y abriendo los diálogos. Uso: node scripts/atlas/variantes.cjs [--base URL] --json <variantes.json>
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const { abrir, listo, VIEWPORTS, BASE } = require('./arnes.cjs');
const P = require('./pasos.cjs');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const RECOGER = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
  const firma = (e) => { const s = getComputedStyle(e); return [s.backgroundColor, s.color, s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor, s.borderTopLeftRadius, s.fontSize, s.fontWeight, s.fontFamily.split(',')[0].replace(/"/g, ''), s.paddingTop + ' ' + s.paddingLeft, s.boxShadow === 'none' ? '' : 'sombra', s.textTransform].join(' · '); };
  const tipos = {
    boton: 'button:not([role=tab]), [role=button], a.btn, a[class*="button"], a[class*="btn"]',
    tarjeta: '[class*="card"]:not(button), article',
    chip: '[class*="chip"], [class*="pill"], [class*="badge"], [class*="tag"]:not(svg *), [class*="evid"]',
    pestana: '[role=tab], [class*="tab-item"]',
    dialogo: '.modal-content, .detail-panel, .pres-overlay, .spl-dialog, .socratic-modal, .pb-v50-modal > *',
  };
  const out = {};
  for (const [t, sel] of Object.entries(tipos)) {
    const m = {};
    for (const e of document.querySelectorAll(sel)) {
      if (!vis(e)) continue;
      const f = firma(e);
      if (!m[f]) m[f] = { n: 0, ej: (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 30), cls: String(e.className).split(' ').slice(0, 2).join('.') };
      m[f].n++;
    }
    out[t] = m;
  }
  return out;
};
(async () => {
  const base = arg('--base', BASE);
  const b = await chromium.launch();
  const { page } = await abrir(b, { base, vp: VIEWPORTS.escritorio, timeout: 15000 });
  await page.goto(base + '/atlas/index.html'); await listo(page);
  const total = { boton: {}, tarjeta: {}, chip: {}, pestana: {}, dialogo: {} };
  const fusionar = (r, donde) => { for (const [t, m] of Object.entries(r)) for (const [f, v] of Object.entries(m)) { if (!total[t][f]) total[t][f] = { ...v, donde: [] }; else total[t][f].n += v.n; if (total[t][f].donde.length < 4 && !total[t][f].donde.includes(donde)) total[t][f].donde.push(donde); } };
  fusionar(await page.evaluate(RECOGER), 'portada');
  await P.entrar(page);
  fusionar(await page.evaluate(RECOGER), 'barra');
  for (const v of P.VISTAS) { await page.evaluate((v) => { try { window.switchView(v); } catch (e) {} }, v); await page.waitForTimeout(500); fusionar(await page.evaluate(RECOGER), v); }
  const abreDialogo = async (n, js) => { await page.evaluate(js); await page.waitForTimeout(700); fusionar(await page.evaluate(RECOGER), n); await page.keyboard.press('Escape'); await page.waitForTimeout(400); };
  await page.evaluate(() => window.switchView('timeline'));
  await abreDialogo('ficha', () => document.querySelector('#view-timeline [data-open-species="afarensis"]')?.click());
  for (const a of ['abrirBiblio', 'openGlossary']) await abreDialogo(a, (a) => document.querySelector(`#pbV50Blocks [data-pb-v50-action="${a}"]`)?.click(), a);
  for (const a of ['openCompare', 'startExam', 'openMatrix', 'abrirEstadisticas', 'openSessionSynthesis', 'openStudentGuide', 'openPresentation']) {
    await page.evaluate(() => { const t = document.getElementById('pb-mobile-tools-toggle'); if (t && t.getAttribute('aria-expanded') !== 'true') t.click(); });
    await page.waitForTimeout(300);
    await page.evaluate((a) => document.querySelector(`#pb-floating-tools [data-action="${a}"]`)?.click(), a); await page.waitForTimeout(700);
    fusionar(await page.evaluate(RECOGER), a); await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  }
  const res = {}; for (const [t, m] of Object.entries(total)) res[t] = { variantes: Object.keys(m).length, top: Object.entries(m).sort((a, b) => b[1].n - a[1].n).slice(0, 40).map(([f, v]) => ({ firma: f, ...v })) };
  fs.writeFileSync(arg('--json', 'variantes.json'), JSON.stringify(res, null, 1));
  console.log(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.variantes])));
  await b.close();
})();
