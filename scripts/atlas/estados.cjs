// estados.cjs · condiciones degradadas del atlas (PB-GH-11): sin JavaScript, sin terceros, sin almacenamiento,
// 320 px, texto al 200 %, movimiento reducido, impresión, teclado desde la entrada.
// Uso: node scripts/atlas/estados.cjs [--base URL] --json <estados.json> --capturas <carpeta>
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const { abrir, listo, VIEWPORTS, BASE } = require('./arnes.cjs');
const P = require('./pasos.cjs');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };

async function resumen(page) {
  return page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
    return { alto: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, vw: innerWidth,
      texto: document.body.innerText.length, vistasVisibles: [...document.querySelectorAll('.view-section')].filter(vis).map((e) => e.id),
      controles: [...document.querySelectorAll('button,a[href],input,select')].filter(vis).length,
      h1: [...document.querySelectorAll('h1')].filter(vis).map((h) => h.innerText.trim().slice(0, 30)),
      vacias: [...document.querySelectorAll('.view-section')].filter(vis).filter((s) => s.innerText.trim().length < 60).map((s) => s.id) };
  });
}

(async () => {
  const base = arg('--base', BASE);
  const out = {}; const cap = arg('--capturas', '.');
  const b = await chromium.launch();
  const url = base + '/atlas/index.html';

  // 1 · Sin JavaScript
  { const { page, ctx } = await abrir(b, { base, vp: VIEWPORTS.telefono, js: false });
    await page.goto(url); await page.waitForTimeout(800);
    out.sinJS = await resumen(page);
    out.sinJS.noscript = await page.evaluate(() => [...document.querySelectorAll('noscript')].map((n) => n.textContent.trim().slice(0, 80)));
    await page.screenshot({ path: path.join(cap, 'estado_sinjs_telefono.png') });
    await page.evaluate(() => window.scrollTo(0, document.getElementById('main-content')?.getBoundingClientRect().top + scrollY));
    await page.screenshot({ path: path.join(cap, 'estado_sinjs_main_telefono.png') });
    await ctx.close(); }

  // 2 · Sin terceros (caso real de muchas aulas) vs con terceros: escritorio
  for (const t of [false, true]) {
    const { page, ctx, red } = await abrir(b, { base, vp: VIEWPORTS.escritorio, terceros: t });
    await page.goto(url); await listo(page);
    const k = t ? 'conTerceros' : 'sinTerceros';
    out[k] = { familias: await page.evaluate(() => [...new Set([...document.querySelectorAll('h1,h2,h3,p,button')].slice(0, 400).map((e) => getComputedStyle(e).fontFamily.split(',')[0]))]),
      fuentesCargadas: await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight)),
      leaflet: await page.evaluate(() => typeof window.L), externas: red.externas.length };
    await P.entrar(page);
    await page.evaluate(() => document.querySelector('#view-timeline [data-open-species="afarensis"]').click()); await page.waitForTimeout(1500);
    out[k].ficha = await page.evaluate(() => { const d = document.getElementById('detailView'); const imgs = [...d.querySelectorAll('img')].filter((i) => i.getBoundingClientRect().width > 0); return { imgs: imgs.length, rotas: imgs.filter((i) => i.complete && i.naturalWidth === 0).length, mapa: !!d.querySelector('.leaflet-container'), mapaTexto: (d.querySelector('[id*=leaflet], .detail-map, .leaflet-container')?.parentElement?.innerText || '').slice(0, 80) }; });
    await page.screenshot({ path: path.join(cap, `estado_${k}_ficha_escritorio.png`) });
    const n0 = red.externas.length; await page.waitForTimeout(5000); out[k].peticionesEn5sConFichaAbierta = red.externas.length - n0;
    await ctx.close();
  }

  // 3 · Sin almacenamiento
  { const { page, ctx } = await abrir(b, { base, vp: VIEWPORTS.escritorio, almacen: false });
    await page.goto(url); await listo(page);
    out.sinAlmacen = { ...(await resumen(page)), excepciones: page._consola.filter((c) => c.tipo === 'pageerror').map((c) => c.texto.slice(0, 120)).slice(0, 5) };
    await P.entrar(page); const r = await P.irVistaUI(page, 'map'); out.sinAlmacen.mapa = r.ok; await ctx.close(); }

  // 4 · 320 px y texto al 200 % (raíz 200 %) en entrada, cronología, mapa y ficha
  for (const [k, vp, zoom] of [['estrecho320', VIEWPORTS.estrecho, false], ['texto200_telefono', VIEWPORTS.telefono, true], ['texto200_escritorio', VIEWPORTS.escritorio, true]]) {
    const { page, ctx } = await abrir(b, { base, vp });
    await page.goto(url); await listo(page);
    if (zoom) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await page.waitForTimeout(300);
    out[k] = { portada: await resumen(page) };
    await page.screenshot({ path: path.join(cap, `estado_${k}_portada.png`) });
    await P.entrar(page);
    for (const v of ['timeline', 'map', 'africa']) {
      await page.evaluate((v) => { try { window.switchView(v); } catch (e) {} document.getElementById('main-content')?.scrollIntoView(); }, v); await page.waitForTimeout(700);
      out[k][v] = await page.evaluate((v) => { const s = document.getElementById('view-' + v); const vw = innerWidth; const cut = [...s.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > vw + 2 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 6).map((e) => (e.id || e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ':' + Math.round(e.getBoundingClientRect().right));
        const ov = [...s.querySelectorAll('h2,h3,p,button,li')].filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible').length; return { docW: document.documentElement.scrollWidth, vw, salen: cut, recortadosOverflow: ov }; }, v);
      await page.screenshot({ path: path.join(cap, `estado_${k}_${v}.png`) });
    }
    // barra de bloques + toolbar
    out[k].barra = await page.evaluate(() => { const b = document.getElementById('pbV50Blocks'); const r = b.getBoundingClientRect(); return { alto: Math.round(r.height), pctViewport: Math.round(100 * r.height / innerHeight) }; });
    await ctx.close();
  }

  // 5 · Movimiento reducido: animaciones/transiciones activas
  { const { page, ctx } = await abrir(b, { base, vp: VIEWPORTS.escritorio, reducido: true });
    await page.goto(url); await listo(page);
    out.movimientoReducido = await page.evaluate(() => { const els = [...document.querySelectorAll('*')]; const anim = els.filter((e) => { const s = getComputedStyle(e); return s.animationName !== 'none' && s.animationDuration !== '0s' && parseFloat(s.animationDuration) > 0.01 && s.animationPlayState === 'running'; });
      const trans = els.filter((e) => { const s = getComputedStyle(e); return s.transitionDuration.split(',').some((d) => parseFloat(d) > 0.01); }).length;
      return { animando: anim.length, ejemplos: anim.slice(0, 6).map((e) => (e.id || e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ' ' + getComputedStyle(e).animationName), conTransicion: trans, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }; });
    await ctx.close(); }

  // 6 · Impresión de vistas principales (emulateMedia print) → texto visible y fondos oscuros
  { const { page, ctx } = await abrir(b, { base, vp: VIEWPORTS.escritorio });
    await page.goto(url); await listo(page); await P.entrar(page);
    out.impresion = {};
    for (const v of ['timeline', 'map', 'africa']) {
      await page.evaluate((v) => window.switchView(v), v); await page.waitForTimeout(600);
      await page.emulateMedia({ media: 'print' });
      out.impresion[v] = await page.evaluate((v) => { const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
        const s = document.getElementById('view-' + v);
        const oscuros = [...document.querySelectorAll('body *')].filter(vis).filter((e) => { const c = getComputedStyle(e).backgroundColor.match(/\d+/g); return c && c.length >= 3 && (c[3] === undefined || +c[3] > 0.5) && (+c[0] + +c[1] + +c[2]) < 150 && e.getBoundingClientRect().height > 40; }).length;
        const fijos = [...document.querySelectorAll('body *')].filter(vis).filter((e) => getComputedStyle(e).position === 'fixed').map((e) => e.id || e.className).slice(0, 6);
        return { vistaVisible: vis(s), portadaVisible: vis(document.getElementById('pb-hub')), barraVisible: vis(document.getElementById('pbV50Blocks')), oscuros, fijos, altoDoc: document.documentElement.scrollHeight }; }, v);
      const pdf = await page.pdf({ format: 'A4' }).catch(() => null); if (pdf) out.impresion[v].pdfKB = Math.round(pdf.length / 1024);
      await page.screenshot({ path: path.join(cap, `estado_impresion_${v}.png`) });
      await page.emulateMedia({ media: 'screen' });
    }
    await ctx.close(); }

  // 7 · Teclado: primeras 40 tabulaciones desde la carga y tras entrar; foco visible (ancho de contorno)
  { const { page, ctx } = await abrir(b, { base, vp: VIEWPORTS.escritorio });
    await page.goto(url); await listo(page);
    const pasos = [];
    for (let i = 0; i < 45; i++) { await page.keyboard.press('Tab'); pasos.push(await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'body' }; const s = getComputedStyle(a); const r = a.getBoundingClientRect();
      return { el: (a.id || a.tagName.toLowerCase()) + '|' + (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 28), outline: s.outlineStyle !== 'none' ? s.outlineWidth + ' ' + s.outlineColor : 'none', sombra: s.boxShadow !== 'none', enPantalla: r.bottom > 0 && r.top < innerHeight, visible: r.width > 0 }; })); }
    out.teclado = { pasos, sinContorno: pasos.filter((p) => p.outline === 'none' && !p.sombra).length, fueraDePantalla: pasos.filter((p) => p.enPantalla === false).length, invisibles: pasos.filter((p) => p.visible === false).length };
    await ctx.close(); }

  fs.writeFileSync(arg('--json', path.join(cap, 'estados.json')), JSON.stringify(out, null, 1));
  await b.close();
  console.log('ok');
})();
