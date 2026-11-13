// humo.cjs · red de seguridad del atlas (PB-GH-11). Abre las 31 vistas y ejerce cada función del inventario;
// deja un JSON comparable antes/después (sin capturas). Cada función corre en un contexto de navegador nuevo
// (página recién cargada, almacenamiento vacío) para que el resultado no dependa del orden ni de la anterior.
//
// Uso:
//   node scripts/atlas/humo.cjs [--base URL] [--vp escritorio|telefono|tableta] [--sin-terceros]
//        [--salida humo.json] [--paralelo 2] [--solo f1,f2] [--sin-vistas]
//   node scripts/atlas/humo.cjs --comparar A.json B.json [--inestables inestables.json] [--inventario 02_inventario.json]
// --comparar lista PÉRDIDAS (vista que deja de pintarse o de activarse, encabezado que desaparece, función o
// elemento de función que deja de responder, diálogo que deja de abrir o empeora en foco/Escape/aria-hidden,
// recurso local que deja de cargar), MEJORAS (lo inverso) y OTRAS diferencias; sale con código 1 si hay pérdidas.
// Los campos listados en --inestables ({claves: [exactas], patrones: [expresiones regulares]}) se separan como
// «inestable» y no cuentan.
'use strict';
const fs = require('fs');
const path = require('path');
const { abrir, listo, VIEWPORTS, BASE, arg } = require('./arnes.cjs');
const P = require('./pasos.cjs');

const CAMPOS_DIALOGO = ['abre', 'focoEntra', 'cierraConEscape', 'focoVuelve'];

// ---------- Firma estable (lo único que se compara) ----------
function firma(R) {
  const f = {};
  for (const [k, v] of Object.entries(R.vistas || {})) {
    f[`vista ${k}: activa`] = !!v.activa;
    f[`vista ${k}: sin excepciones`] = !v.excepciones;
    f[`vista ${k}: pintada`] = !!(v.datos && v.datos.pintada);
    for (const h of (v.datos && v.datos.encabezados) || []) f[`vista ${k}: encabezado «${h}»`] = true;
  }
  for (const [k, v] of Object.entries(R.funciones || {})) {
    f[`función ${k}: responde`] = !!v.ok;
    for (const c of CAMPOS_DIALOGO) if (c in v) f[`función ${k}: ${c}`] = !!v[c];
    if ('ariaHiddenAbierto' in v) f[`función ${k}: sin aria-hidden al abrir`] = !v.ariaHiddenAbierto;
    for (const [i, b] of Object.entries(v.items || {})) f[`función ${k} · ${i}`] = !!b;
  }
  for (const u of (R.red && R.red.localesFallidas) || []) f[`recurso local que falla: ${u}`] = true;
  return f;
}

function comparar(a, b, opts = {}) {
  const A = JSON.parse(fs.readFileSync(a, 'utf8')); const B = JSON.parse(fs.readFileSync(b, 'utf8'));
  const datosInest = opts.inestables ? JSON.parse(fs.readFileSync(opts.inestables, 'utf8')) : {};
  const clavesInest = new Set(datosInest.claves || []);
  const patrones = (datosInest.patrones || []).map((p) => new RegExp(p));
  const inest = { has: (k) => clavesInest.has(k) || patrones.some((r) => r.test(k)) };
  const fa = firma(A); const fb = firma(B);
  const perdidas = []; const mejoras = []; const otras = []; const inestables = [];
  const claves = [...new Set([...Object.keys(fa), ...Object.keys(fb)])].sort();
  for (const k of claves) {
    const x = fa[k]; const y = fb[k];
    if (x === y) continue;
    const esRecurso = k.startsWith('recurso local que falla');
    const esEnc = k.includes(': encabezado «');
    let tipo;
    if (esRecurso) tipo = x === undefined ? 'perdida' : 'mejora';
    else if (esEnc) tipo = y === undefined ? 'perdida' : 'otra';
    else if (x === true && y !== true) tipo = 'perdida';
    else if (x !== true && y === true) tipo = x === undefined ? 'otra' : 'mejora';
    else tipo = 'otra';
    const linea = `${k}: ${x === undefined ? '—' : x} → ${y === undefined ? '—' : y}`;
    if (inest.has(k)) inestables.push(linea);
    else if (tipo === 'perdida') perdidas.push(linea);
    else if (tipo === 'mejora') mejoras.push(linea);
    else otras.push(linea);
  }
  // Texto alcanzable y controles por vista (con desplegables abiertos): menos del 97 % del texto o menos
  // controles cuenta como pérdida.
  for (const [k, v] of Object.entries(A.vistas || {})) {
    const w = (B.vistas || {})[k]; if (!v.datos || !w || !w.datos) continue;
    const kt = `vista ${k}: texto alcanzable`; const kc = `vista ${k}: controles visibles`;
    if (w.datos.texto < v.datos.texto * 0.97) (inest.has(kt) ? inestables : perdidas).push(`${kt}: ${v.datos.texto} → ${w.datos.texto} car.`);
    else if (w.datos.texto > v.datos.texto * 1.03) otras.push(`${kt}: ${v.datos.texto} → ${w.datos.texto} car.`);
    if (w.datos.controles < v.datos.controles) (inest.has(kc) ? inestables : perdidas).push(`${kc}: ${v.datos.controles} → ${w.datos.controles}`);
    else if (w.datos.controles > v.datos.controles) otras.push(`${kc}: ${v.datos.controles} → ${w.datos.controles}`);
  }
  // Contrato del inventario: encabezados de 02_inventario.json presentes en A y ausentes en B (ya contados
  // arriba como pérdidas); se informa además de los que ya faltaban en A.
  const inventarioAusente = [];
  if (opts.inventario && fs.existsSync(opts.inventario)) {
    const inv = JSON.parse(fs.readFileSync(opts.inventario, 'utf8'));
    for (const v of inv.vistas || []) {
      for (const e of v.encabezados || []) {
        const t = e.replace(/^H\d:\s*/, '').replace(/\s+/g, ' ').trim().slice(0, 90); if (!t) continue;
        const enB = !!fb[`vista ${v.id}: encabezado «${t}»`]; const enA = !!fa[`vista ${v.id}: encabezado «${t}»`];
        if (!enB) inventarioAusente.push(`${v.id}: «${t}»${enA ? ' (PÉRDIDA)' : ' (ya ausente en A)'}`);
      }
    }
  }
  return { a, b, perdidas, mejoras, otras, inestables, inventarioAusente, resumen: { perdidas: perdidas.length, mejoras: mejoras.length, otras: otras.length, inestables: inestables.length } };
}

// ---------- Ejecución ----------
async function tarea(browser, nombre, fn, o) {
  const t0 = Date.now();
  const { page, red, ctx } = await abrir(browser, { base: o.base, vp: o.vp, terceros: o.terceros, bypassCSP: false, timeout: 4000 });
  let r;
  try {
    await page.goto(o.base + '/atlas/index.html', { waitUntil: 'load' });
    await listo(page);
    r = await fn(page, red);
  } catch (e) { r = { paso: nombre, ok: false, error: String(e).split('\n')[0].slice(0, 200) }; }
  r.ms = Date.now() - t0;
  r.excepcionesPagina = [...new Set(page._consola.filter((c) => c.tipo === 'pageerror').map((c) => c.texto.slice(0, 140)))];
  r.erroresConsola = page._consola.filter((c) => c.tipo === 'error').length;
  r.peticionesExternas = red.externas.length;
  r.localesFallidas = [...new Set(red.localesFallidas)];
  await ctx.close().catch(() => {});
  process.stderr.write(`${nombre} ${r.ms} ms ok=${r.ok}\n`);
  return r;
}

async function main() {
  if (process.argv.includes('--comparar')) {
    const i = process.argv.indexOf('--comparar');
    const res = comparar(process.argv[i + 1], process.argv[i + 2], { inestables: arg('--inestables'), inventario: arg('--inventario') });
    const sal = arg('--salida');
    if (sal) fs.writeFileSync(sal, JSON.stringify(res, null, 1));
    console.log(JSON.stringify(res, null, 1));
    process.exit(res.perdidas.length ? 1 : 0);
  }
  const { chromium } = require('playwright');
  const base = arg('--base', BASE);
  const salida = arg('--salida', 'humo.json');
  const vpn = arg('--vp', 'escritorio');
  const terceros = !process.argv.includes('--sin-terceros');
  const paralelo = Math.max(1, +arg('--paralelo', 2));
  const solo = arg('--solo') ? arg('--solo').split(',') : null;
  const o = { base, vp: VIEWPORTS[vpn], terceros };
  const b = await chromium.launch();
  const t0 = Date.now();
  const res = { fecha: new Date().toISOString(), base, viewport: vpn, terceros, vistas: {}, funciones: {} };

  const tareas = [];
  // 1 · Vistas: una sola página, como el alumnado (portada → entrar → chips de bloque)
  if (!process.argv.includes('--sin-vistas') && !solo) {
    tareas.push(['vistas', async () => tarea(b, 'vistas', async (page, red) => {
      const r = { paso: 'vistas', ok: true };
      r.entrar = await P.entrar(page);
      // Mutaciones del DOM en reposo (3 s) tras entrar: guardas que repintan (informativo).
      r.mutacionesReposo3s = await page.evaluate(() => new Promise((ok) => { let n = 0; const m = new MutationObserver((l) => { n += l.length; }); m.observe(document.documentElement, { childList: true, subtree: true, attributes: true }); setTimeout(() => { m.disconnect(); ok(n); }, 3000); }));
      for (const v of P.VISTAS) {
        try { const x = await P.irVistaUI(page, v, false); await P.barrerVista(page, v); await page.waitForTimeout(600); x.datos = await P.medirVista(page, v); res.vistas[v] = x; } catch (e) { res.vistas[v] = { vista: v, ok: false, error: String(e).split('\n')[0].slice(0, 200) }; }
      }
      r.localesFallidas = [...new Set(red.localesFallidas)];
      return r;
    }, o)]);
  }
  // 2 · Funciones, cada una en página nueva
  for (const [f, fn] of Object.entries(P.FUNCIONES)) {
    if (solo && !solo.includes(f)) continue;
    tareas.push([f, async () => tarea(b, f, async (page) => { if (!f.startsWith('portada.')) await P.entrar(page); return fn(page); }, o)]);
  }
  if (!solo || solo.includes('enlaces.profundos')) tareas.push(['enlaces.profundos', async () => tarea(b, 'enlaces.profundos', async (page) => P.enlacesProfundos(page, base, listo), o)]);

  let i = 0;
  async function trabajador() { while (i < tareas.length) { const [n, t] = tareas[i++]; const r = await t(); if (n === 'vistas') res.vistasMeta = r; else res.funciones[n] = r; } }
  await Promise.all(Array.from({ length: paralelo }, trabajador));

  // Orden estable de claves
  res.funciones = Object.fromEntries(Object.keys(res.funciones).sort().map((k) => [k, res.funciones[k]]));
  res.vistas = Object.fromEntries(P.VISTAS.filter((v) => res.vistas[v]).map((v) => [v, res.vistas[v]]));
  const fallidas = new Set([...(res.vistasMeta?.localesFallidas || []), ...Object.values(res.funciones).flatMap((f) => f.localesFallidas || [])]);
  res.red = { localesFallidas: [...fallidas].sort(), externasTotales: Object.values(res.funciones).reduce((s, f) => s + (f.peticionesExternas || 0), 0) + (res.vistasMeta?.peticionesExternas || 0) };
  res.duracionMs = Date.now() - t0;
  res.resumen = { vistasOk: Object.values(res.vistas).filter((v) => v.ok).length, vistas: Object.keys(res.vistas).length, funcionesOk: Object.values(res.funciones).filter((v) => v.ok).length, funciones: Object.keys(res.funciones).length };
  fs.mkdirSync(path.dirname(path.resolve(salida)), { recursive: true });
  fs.writeFileSync(salida, JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ ...res.resumen, duracionS: Math.round(res.duracionMs / 1000) }));
  await b.close();
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(2); });
module.exports = { comparar, firma };
