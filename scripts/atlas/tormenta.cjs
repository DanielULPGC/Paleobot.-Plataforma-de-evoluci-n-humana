// tormenta.cjs · peticiones externas y errores de consola con una ficha abierta en reposo (bucle de reintentos de
// imágenes, 04 fila 1). Abre el atlas, entra, abre la ficha indicada y cuenta durante --ms milisegundos:
// peticiones por segundo, URL pedidas más de una vez y errores de consola. Aceptación de la fila 1:
// «urlsRepetidas» = 0 y sin tormenta de errores, con y sin terceros simulados.
// Uso: node scripts/atlas/tormenta.cjs [--base URL] [--sin-terceros] [--ficha afarensis] [--ms 10000] [--vp escritorio]
'use strict';
const { chromium } = require('playwright');
const { abrir, listo, VIEWPORTS, BASE, arg } = require('./arnes.cjs');
const P = require('./pasos.cjs');

(async () => {
  const base = arg('--base', BASE);
  const ms = +arg('--ms', 10000);
  const ficha = arg('--ficha', 'afarensis');
  const terceros = !process.argv.includes('--sin-terceros');
  const b = await chromium.launch();
  const { page, red } = await abrir(b, { base, vp: VIEWPORTS[arg('--vp', 'escritorio')], terceros, bypassCSP: false, timeout: 8000 });
  await page.goto(base + '/atlas/index.html'); await listo(page);
  const trasCarga = red.externas.length;
  await P.entrar(page);
  const n0 = red.externas.length; const c0 = page._consola.length;
  const abierta = await P.abrirFicha(page, ficha);
  // Las peticiones de la apertura cuentan: un recurso pedido una vez es normal; dos o más veces, un reintento.
  const porSegundo = [];
  for (let i = 0; i < Math.ceil(ms / 1000); i++) { const n = red.externas.length; await page.waitForTimeout(1000); porSegundo.push(red.externas.length - n); }
  const tras = red.externas.slice(n0);
  const cuenta = tras.reduce((m, u) => { m[u] = (m[u] || 0) + 1; return m; }, {});
  const repetidas = Object.entries(cuenta).filter(([, n]) => n > 1).sort((x, y) => y[1] - x[1]);
  const consola = page._consola.slice(c0);
  const out = {
    terceros, ficha, fichaAbierta: abierta, ms, peticionesTrasCarga: trasCarga, peticionesConFicha: tras.length, peticionesPorSegundo: porSegundo,
    urlsDistintas: Object.keys(cuenta).length, urlsRepetidas: repetidas.length, peorRepeticion: repetidas.slice(0, 5).map(([u, n]) => [u.slice(-90), n]),
    erroresConsola: consola.filter((c) => c.tipo === 'error').length, excepciones: [...new Set(consola.filter((c) => c.tipo === 'pageerror').map((c) => c.texto.slice(0, 140)))],
    ejemplosConsola: [...new Set(consola.filter((c) => c.tipo === 'error').map((c) => c.texto.slice(0, 120)))].slice(0, 5),
  };
  console.log(JSON.stringify(out, null, 1));
  await b.close();
  process.exit(repetidas.length ? 1 : 0);
})();
