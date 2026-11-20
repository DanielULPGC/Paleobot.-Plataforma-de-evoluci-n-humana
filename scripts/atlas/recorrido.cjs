// recorrido.cjs · capturas «antes/después» y medición del piso por vista y viewport (PB-GH-11).
// Uso: node scripts/atlas/recorrido.cjs [--base URL] --salida <carpeta capturas> --json <piso.json>
//        [--vps telefono,tableta,escritorio] [--sin-capturas] [--sin-axe] [--vistas timeline,map]
// Capturas: atlas_<vista>_<viewport>.png (deviceScaleFactor 2), recorte de la vista desde su inicio con
// alto máx. = 2,2 × alto del viewport. Además portada, portada-bloque, entrada (llegada al área de trabajo).
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { abrir, listo, VIEWPORTS, BASE } = require('./arnes.cjs');
const P = require('./pasos.cjs');
// axe-core (no se guarda en el repositorio): PB_AXE o, si no, el paquete axe-core resoluble desde aquí.
const AXE = process.env.PB_AXE || (() => { try { return require.resolve('axe-core/axe.min.js'); } catch (e) { return ''; } })();

function arg(n, d) { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; }

// Medidas del piso sobre un contenedor (selector) en el estado actual.
async function medir(page, sel) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel) || document.body;
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05; };
    const all = [...root.querySelectorAll('*')].filter(vis);
    const cnt = (f) => { const m = {}; for (const e of all) { const v = f(e); if (v) m[v] = (m[v] || 0) + 1; } return m; };
    const txtEls = all.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
    const cntT = (f) => { const m = {}; for (const e of txtEls) { const v = f(e); if (v) m[v] = (m[v] || 0) + 1; } return m; };
    const cs = (e) => getComputedStyle(e);
    const sp = {}; for (const e of all) { const s = cs(e); for (const p of ['marginTop', 'marginBottom', 'paddingTop', 'paddingLeft', 'gap']) { const v = s[p]; if (v && v !== '0px' && v !== 'normal') sp[v] = (sp[v] || 0) + 1; } }
    const ctl = [...root.querySelectorAll('button,a[href],input,select,summary,[role=button],[role=tab],[tabindex="0"]')].filter(vis);
    const peq = ctl.map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || e.tagName).replace(/\s+/g, ' ').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height), inline: e.tagName === 'A' && cs(e).display === 'inline' }; });
    const docW = document.documentElement.scrollWidth, vw = innerWidth;
    const anchos = all.filter((e) => e.getBoundingClientRect().right > vw + 1 && cs(e).position !== 'fixed').slice(0, 8).map((e) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ' r=' + Math.round(e.getBoundingClientRect().right));
    const hs = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map((h) => +h.tagName[1]);
    let saltos = 0; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) saltos++;
    const emoji = (root.innerText.match(/\p{Extended_Pictographic}/gu) || []).length;
    const inlineStyle = root.querySelectorAll('[style]').length;
    return {
      docW, vw, desbordaX: docW > vw + 1, anchos,
      fuentes: cntT((e) => cs(e).fontSize), familias: cntT((e) => cs(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()),
      colores: cntT((e) => cs(e).color), fondos: cnt((e) => { const b = cs(e).backgroundColor; return b === 'rgba(0, 0, 0, 0)' ? null : b; }),
      radios: cnt((e) => { const r = cs(e).borderRadius; return r === '0px' ? null : r; }), sombras: cnt((e) => { const s = cs(e).boxShadow; return s === 'none' ? null : s.slice(0, 60); }),
      gradientes: all.filter((e) => cs(e).backgroundImage.includes('gradient')).length,
      espaciados: sp, controles: ctl.length,
      menor24: peq.filter((p) => !p.inline && (p.w < 24 || p.h < 24)).length, menor44: peq.filter((p) => !p.inline && (p.w < 44 || p.h < 44)).length,
      ejemplosMenor24: peq.filter((p) => !p.inline && (p.w < 24 || p.h < 24)).slice(0, 5),
      h1: [...document.querySelectorAll('h1')].filter(vis).length, encabezados: hs.length, saltosEncabezado: saltos,
      emoji, inlineStyle, textoTotal: root.innerText.length,
      bordeSombraFondo: all.filter((e) => { const s = cs(e); return s.boxShadow !== 'none' && parseFloat(s.borderTopWidth) > 0 && s.backgroundColor !== 'rgba(0, 0, 0, 0)'; }).length,
    };
  }, sel);
}

async function axeEn(page, include) {
  const ok = await page.evaluate(() => !!window.axe);
  if (!ok) await page.addScriptTag({ path: AXE });
  return page.evaluate(async (inc) => {
    const r = await window.axe.run(inc ? { include: [inc] } : document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ej: v.nodes.slice(0, 2).map((n) => n.target.join(' ').slice(0, 90)) }));
  }, include);
}

async function cls(page, fn) {
  await page.evaluate(() => { window.__cls = 0; window.__clsObs?.disconnect(); window.__clsObs = new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }); window.__clsObs.observe({ type: 'layout-shift', buffered: false }); });
  await fn();
  await page.waitForTimeout(600);
  return page.evaluate(() => +(window.__cls || 0).toFixed(3));
}

(async () => {
  const base = arg('--base', BASE);
  const salida = arg('--salida', 'capturas');
  const json = arg('--json', 'piso_vistas.json');
  const vps = arg('--vps', 'telefono,tableta,escritorio').split(',');
  const vistas = arg('--vistas', P.VISTAS.join(',')).split(',');
  const capturas = !process.argv.includes('--sin-capturas');
  const conAxe = !process.argv.includes('--sin-axe');
  if (conAxe && !AXE) throw new Error('Falta axe-core: defina PB_AXE con la ruta de axe.min.js o use --sin-axe');
  fs.mkdirSync(salida, { recursive: true });
  const b = await chromium.launch();
  const res = {};
  for (const vpn of vps) {
    const vp = VIEWPORTS[vpn];
    const { page, ctx } = await abrir(b, { base, vp, dpr: capturas ? 2 : 1, timeout: 8000 });
    await page.addInitScript(() => { window.__clsCarga = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__clsCarga += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
    const t0 = Date.now();
    await page.goto(base + '/atlas/index.html', { waitUntil: 'load' });
    const tLoad = Date.now() - t0;
    await listo(page);
    const r = res[vpn] = { cargaMs: tLoad, listoMs: Date.now() - t0, vistas: {} };
    r.clsCarga = await page.evaluate(() => +window.__clsCarga.toFixed(3));
    r.peso = await page.evaluate(() => { const e = performance.getEntriesByType('resource'); const n = performance.getEntriesByType('navigation')[0]; return { recursos: e.length, kB: Math.round((e.reduce((s, x) => s + (x.transferSize || x.encodedBodySize || 0), 0) + (n ? n.transferSize || n.encodedBodySize : 0)) / 1024) }; });
    if (capturas) await page.screenshot({ path: path.join(salida, `atlas_portada_${vpn}.png`), timeout: 60000 });
    r.portada = await medir(page, '#pb-hub');
    if (conAxe) r.portadaAxe = await axeEn(page, '#pb-hub');
    await P.FUNCIONES['portada.bloque'](page).catch(() => {});
    await page.click('.pb-hub-card[data-hub-block="territorio"]').catch(() => {});
    await page.waitForTimeout(400);
    if (capturas) { await page.locator('#pb-hub-tools').screenshot({ path: path.join(salida, `atlas_portada-bloque_${vpn}.png`) }).catch(() => {}); }
    await page.click('#pb-hub-back').catch(() => {});
    r.entrar = await P.entrar(page);
    if (capturas) await page.screenshot({ path: path.join(salida, `atlas_entrada_${vpn}.png`), timeout: 60000 });
    // Barra de bloques (navegación) y documento entero
    r.navegacion = await medir(page, '#pbV50Blocks');
    r.areaTrabajo = await medir(page, '.v36-workspace-shell');
    if (conAxe) r.documentoAxe = await axeEn(page, null);
    for (const v of vistas) {
      const o = {};
      try {
        o.cls = await cls(page, async () => { Object.assign(o, await P.irVistaUI(page, v)); });
        await P.barrerVista(page, v);
        await page.evaluate((v) => { const s = document.getElementById('view-' + v); if (s) window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 8); }, v);
        await page.waitForTimeout(250);
        o.piso = await medir(page, '#view-' + v);
        if (conAxe) o.axe = await axeEn(page, '#view-' + v);
        if (capturas) {
          const box = await page.evaluate((v) => { const s = document.getElementById('view-' + v); const r = s.getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top + scrollY - 8), h: r.height }; }, v);
          const h = Math.min(box.h + 16, Math.round(vp.height * 2.2));
          // content-visibility:auto (041-speed-guard) deja en blanco lo que no está en pantalla en una captura
          // recortada; solo para la captura se fuerza su pintado (no altera la medición, ya hecha).
          await page.evaluate(() => { const s = document.createElement('style'); s.id = '__cv'; s.textContent = '*{content-visibility:visible!important}'; document.head.appendChild(s); });
          await page.waitForTimeout(200);
          await page.screenshot({ path: path.join(salida, `atlas_${v}_${vpn}.png`), timeout: 60000, fullPage: true, clip: { x: 0, y: box.y, width: vp.width, height: Math.max(200, h) } });
          await page.evaluate(() => document.getElementById('__cv')?.remove());
        }
      } catch (e) { o.error = String(e).slice(0, 200); }
      r.vistas[v] = o;
      process.stderr.write(`${vpn} ${v} ${o.error ? 'ERR ' + o.error : 'ok'}\n`);
    }
    // 320 px y 200 % en la vista principal (cronología) y el área de trabajo
    await ctx.close();
  }
  fs.mkdirSync(path.dirname(json), { recursive: true });
  fs.writeFileSync(json, JSON.stringify(res, null, 1));
  await b.close();
})();
