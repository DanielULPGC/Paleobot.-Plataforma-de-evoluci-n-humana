// primer-dato.cjs · mide en qué punto de la pantalla empieza el dato de cada vista del atlas.
// Motivo: SISTEMA.md (regla 1 de la sección de vistas de datos) exige que el dato entre en el primer pantallazo; el humo
// (vista.posicion) solo comprueba la barra y el título, así que esa regla no tenía medida. Este script la mide; no
// forma parte del humo ni del verificador y no falla: informa. Es una medida aproximada (el «primer dato» es el
// primer bloque con tarjeta, tabla, gráfico, lista o imagen que aparece tras la cabecera de la vista).
// Uso: node scripts/atlas/primer-dato.cjs [--vp escritorio|telefono] [--salida x.json]
// Necesita un servidor local que sirva la raíz del repositorio (PB_BASE, por defecto http://localhost:8991).
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..', '..');
const BASE = process.env.PB_BASE || 'http://localhost:8991';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const VPS = {
  escritorio: { viewport: { width: 1366, height: 768 } },
  telefono: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

// Las 30 vistas con id estático en atlas/index.html más «paleoecologia», que crea 007 al cargar.
const html = fs.readFileSync(path.join(REPO, 'atlas/index.html'), 'utf8');
const VISTAS = [...new Set([...html.matchAll(/id="view-([a-z0-9-]+)"/g)].map((m) => m[1]))];
if (!VISTAS.includes('paleoecologia')) VISTAS.push('paleoecologia');

function medir(v) {
  const s = document.getElementById('view-' + v);
  if (!s) return null;
  const hero = s.querySelector('.view-hero, .pb-cabecera-vista');
  const hb = hero ? hero.getBoundingClientRect().bottom : null;
  const cand = [...s.querySelectorAll('canvas,svg,table,img,.card,.panel,[class*=card],[class*=grid],[class*=chart],[class*=list]')]
    .filter((e) => { const b = e.getBoundingClientRect(); return b.width > 120 && b.height > 60 && (!hero || !hero.contains(e)) && b.top >= (hb || 0) - 2; })
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  const first = cand[0];
  return {
    cabeceraFin: hb == null ? null : Math.round(hb),
    cabeceraAlto: hero ? Math.round(hero.getBoundingClientRect().height) : null,
    primerDato: first ? Math.round(first.getBoundingClientRect().top) : null,
    alto: innerHeight,
  };
}

(async () => {
  const vp = arg('--vp', 'escritorio');
  const browser = await chromium.launch();
  const ctx = await browser.newContext(VPS[vp]);
  const filas = [];
  for (const v of VISTAS) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/atlas/index.html?view=${v}#main-content`, { waitUntil: 'load' });
    await p.waitForTimeout(4200);
    const r = await p.evaluate(medir, v).catch(() => null);
    filas.push({ vista: v, ...(r || { primerDato: null }) });
    await p.close();
  }
  await browser.close();
  const ok = filas.filter((f) => f.primerDato != null);
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const alto = ok[0] ? ok[0].alto : 0;
  const bajo = ok.filter((f) => f.primerDato >= alto);
  const resumen = {
    viewport: vp, medidas: ok.length, de: filas.length,
    medianaPrimerDato: med(ok.map((f) => f.primerDato)), alto,
    bajoElPliegue: bajo.length, bajoElPliegueVistas: bajo.map((f) => f.vista),
    sinMedida: filas.filter((f) => f.primerDato == null).map((f) => f.vista),
  };
  console.log(JSON.stringify(resumen));
  const salida = arg('--salida', '');
  if (salida) fs.writeFileSync(salida, JSON.stringify({ resumen, filas }, null, 1));
})();
