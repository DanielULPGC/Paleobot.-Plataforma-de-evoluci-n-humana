// dialogos.cjs · capturas de diálogos, ficha y cajón (atlas_dlg-<nombre>_<viewport>.png, dpr 2).
// Uso: node scripts/atlas/dialogos.cjs [--base URL] --salida <carpeta> [--vps telefono,escritorio]
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { abrir, listo, VIEWPORTS, BASE } = require('./arnes.cjs');
const P = require('./pasos.cjs');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
(async () => {
  const base = arg('--base', BASE); const sal = arg('--salida', '.');
  const b = await chromium.launch();
  for (const vpn of arg('--vps', 'telefono,escritorio').split(',')) {
    const { page, ctx } = await abrir(b, { base, vp: VIEWPORTS[vpn], dpr: 2, timeout: 20000 });
    await page.goto(base + '/atlas/index.html'); await listo(page); await P.entrar(page);
    const shot = async (n) => { await page.waitForTimeout(900); await page.screenshot({ path: path.join(sal, `atlas_dlg-${n}_${vpn}.png`), timeout: 60000 }); };
    const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(500); };
    await page.evaluate(() => document.getElementById('main-content').scrollIntoView()); await shot('barra');
    await page.evaluate(() => document.querySelector('#view-timeline [data-open-species="afarensis"]').click()); await shot('ficha');
    await page.evaluate(() => document.querySelector('#detailView .detail-body, #detailView .panel-body, #detailView')?.scrollBy?.(0, 900)); await shot('ficha-abajo');
    await esc();
    await page.evaluate(() => document.querySelector('#pbV50Blocks [data-pb-v50-action="abrirBiblio"]')?.click()); await shot('bibliografia'); await esc();
    await page.evaluate(() => document.querySelector('#pbV50Blocks [data-pb-v50-action="openGlossary"]')?.click()); await shot('glosario'); await esc();
    await P.abrirCajon(page); await shot('cajon');
    for (const a of ['openCompare', 'openPresentation', 'openStudentGuide', 'startExam']) {
      await P.abrirCajon(page);
      await page.evaluate((a) => document.querySelector(`#pb-floating-tools [data-action="${a}"]`)?.click(), a); await shot(a.replace(/^open|^start/, '').toLowerCase()); await esc();
    }
    await P.abrirCajon(page); await page.evaluate(() => document.querySelector('#pb-a11y-toolbar-root [data-action="openGlobalSearch"]')?.click());
    await page.keyboard.type('Olduvai'); await shot('busqueda'); await esc();
    await page.evaluate(() => document.querySelector('[data-action="openPaleoLab"]')?.click()); await shot('paleolab'); await esc();
    await ctx.close();
  }
  await b.close(); console.log('ok');
})();
