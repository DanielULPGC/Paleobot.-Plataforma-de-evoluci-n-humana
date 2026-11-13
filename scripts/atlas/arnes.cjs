// Arnés común del atlas interactivo (PB-GH-11). Abre el atlas en Chromium (Playwright) servido en local y,
// si se pide, sirve en local los recursos de terceros que muchas aulas no alcanzan, para ver el atlas como el
// alumnado con red:
//  - Leaflet 1.9.4 (cdnjs) desde el paquete npm leaflet@1.9.4 (node_modules/leaflet/dist). El SRI de
//    atlas/index.html corresponde al minificado de cdnjs, no al de npm: en modo «terceros» el arnés quita los
//    atributos integrity SOLO de las dos etiquetas de Leaflet en la respuesta de atlas/index.html.
//  - Google Fonts (Playfair Display, Source Sans 3, JetBrains Mono) desde paquetes @fontsource de npm.
//  - Imágenes de Wikimedia desde img/taxones/ cuando el nombre de archivo de Commons coincide con el de
//    img/taxones/MANIFIESTO.json; si no hay copia, se aborta (y se cuenta).
//  - Teselas (OSM, ArcGIS, maps.wikimedia): no se simulan; se abortan y se cuentan.
// Todo lo demás externo se aborta. Ningún recurso de terceros se guarda en el repositorio.
//
// Parámetros (variables de entorno, con valor por defecto):
//   PB_REPO      raíz del repositorio            (por defecto: dos carpetas por encima de este archivo)
//   PB_BASE      URL del servidor local que sirve la raíz del repositorio (por defecto http://localhost:8991)
//   PB_TERCEROS  carpeta node_modules con leaflet@1.9.4 y @fontsource/* (por defecto
//                <repo>/local-results/atlas-terceros/node_modules; local-results/ está fuera de git)
// Uso: const {abrir, listo} = require('./arnes.cjs'); const {page, ctx, red} = await abrir(browser, opts)
// opts: base, vp ({width,height}), terceros (bool, por defecto true), js (bool), reducido (bool),
//       bypassCSP (bool, por defecto true: necesario para inyectar axe), almacen (bool), dpr, tactil, movil, timeout
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = process.env.PB_REPO || path.resolve(__dirname, '..', '..');
const BASE = process.env.PB_BASE || 'http://localhost:8991';
const TERCEROS = process.env.PB_TERCEROS || path.join(REPO, 'local-results', 'atlas-terceros', 'node_modules');

function mapaImagenes(repo) {
  const m = JSON.parse(fs.readFileSync(path.join(repo, 'img/taxones/MANIFIESTO.json'), 'utf8'));
  const out = {};
  for (const v of Object.values(m.images || {})) {
    const fn = decodeURIComponent((v.source_page || '').split('File:')[1] || '').replace(/ /g, '_').toLowerCase();
    if (fn) out[fn] = path.join(repo, 'img/taxones', v.file);
  }
  return out;
}

function nombreCommons(url) {
  try {
    const u = new URL(url);
    const p = decodeURIComponent(u.pathname);
    if (p.includes('Special:FilePath/')) return p.split('Special:FilePath/')[1].replace(/ /g, '_').toLowerCase();
    if (p.includes('Special:Redirect/file/')) return p.split('Special:Redirect/file/')[1].replace(/ /g, '_').toLowerCase();
    const parts = p.split('/');
    if (p.includes('/thumb/')) return parts[parts.indexOf('thumb') + 3].toLowerCase();
    return parts[parts.length - 1].toLowerCase();
  } catch (e) { return ''; }
}

function cssFuentes() {
  const fam = [
    ['Playfair Display', '@fontsource/playfair-display', [[500, 'normal'], [600, 'normal'], [700, 'normal'], [500, 'italic']]],
    ['Source Sans 3', '@fontsource/source-sans-3', [[400, 'normal'], [500, 'normal'], [600, 'normal']]],
    ['JetBrains Mono', '@fontsource/jetbrains-mono', [[400, 'normal'], [500, 'normal']]],
  ];
  let css = '';
  for (const [name, pkg, ws] of fam) {
    for (const [w, st] of ws) {
      const slug = pkg.split('/')[1];
      const file = `${slug}-latin-${w}-${st}.woff2`;
      css += `@font-face{font-family:'${name}';font-style:${st};font-weight:${w};font-display:swap;src:url(https://fonts.gstatic.com/__local/${slug}/${file}) format('woff2');}\n`;
    }
  }
  return css;
}

function comprobarTerceros() {
  const falta = ['leaflet/dist/leaflet.js', '@fontsource/source-sans-3', '@fontsource/playfair-display', '@fontsource/jetbrains-mono']
    .filter((p) => !fs.existsSync(path.join(TERCEROS, p)));
  if (falta.length) {
    throw new Error(`Faltan recursos de terceros en ${TERCEROS} (${falta.join(', ')}). Instálelos (véase scripts/atlas/README.md) ` +
      'o ejecute con --sin-terceros.');
  }
}

async function abrir(browser, o = {}) {
  const base = o.base || BASE;
  const vp = o.vp || { width: 1366, height: 800 };
  const red = { externas: [], servidas: [], abortadas: [], teselas: 0, imgSinCopia: [], localesFallidas: [] };
  const terceros = o.terceros !== false;
  if (terceros) comprobarTerceros();
  const ctx = await browser.newContext({
    viewport: vp, deviceScaleFactor: o.dpr || 1, bypassCSP: o.bypassCSP !== false,
    javaScriptEnabled: o.js !== false, reducedMotion: o.reducido ? 'reduce' : 'no-preference',
    hasTouch: !!o.tactil, isMobile: !!o.movil, acceptDownloads: true,
  });
  if (o.almacen === false) {
    await ctx.addInitScript(() => {
      const thrower = { get() { throw new DOMException('bloqueado', 'SecurityError'); } };
      try { Object.defineProperty(window, 'localStorage', thrower); } catch (e) {}
      try { Object.defineProperty(window, 'sessionStorage', thrower); } catch (e) {}
    });
  }
  const imgs = mapaImagenes(o.repo || REPO);
  await ctx.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, async (route) => {
    const url = route.request().url();
    red.externas.push(url);
    if (!terceros) { red.abortadas.push(url); return route.abort(); }
    if (/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/1\.9\.4\/leaflet\.min\.js/.test(url)) {
      red.servidas.push(url);
      return route.fulfill({ status: 200, contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(path.join(TERCEROS, 'leaflet/dist/leaflet.js')) });
    }
    if (/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/1\.9\.4\/leaflet\.min\.css/.test(url)) {
      red.servidas.push(url);
      return route.fulfill({ status: 200, contentType: 'text/css', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(path.join(TERCEROS, 'leaflet/dist/leaflet.css')) });
    }
    if (/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/1\.9\.4\/images\/(.+)$/.test(url)) {
      const f = url.match(/images\/([^?]+)/)[1];
      red.servidas.push(url);
      return route.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(path.join(TERCEROS, 'leaflet/dist/images', f)) });
    }
    if (/fonts\.googleapis\.com\/css2/.test(url)) {
      red.servidas.push(url);
      return route.fulfill({ status: 200, contentType: 'text/css', headers: { 'access-control-allow-origin': '*' }, body: cssFuentes() });
    }
    if (/fonts\.gstatic\.com\/__local\//.test(url)) {
      const m = url.match(/__local\/([^/]+)\/(.+)$/);
      red.servidas.push(url);
      return route.fulfill({ status: 200, contentType: 'font/woff2', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(path.join(TERCEROS, '@fontsource', m[1], 'files', m[2])) });
    }
    if (/tile\.openstreetmap\.org|arcgisonline\.com|maps\.wikimedia\.org|opentopomap\.org/.test(url)) { red.teselas++; red.abortadas.push(url); return route.abort(); }
    if (/wikimedia\.org/.test(url)) {
      const n = nombreCommons(url);
      if (imgs[n]) {
        red.servidas.push(url);
        const ext = path.extname(imgs[n]).toLowerCase();
        return route.fulfill({ status: 200, contentType: ext === '.png' ? 'image/png' : 'image/jpeg', body: fs.readFileSync(imgs[n]) });
      }
      red.imgSinCopia.push(url); red.abortadas.push(url); return route.abort();
    }
    red.abortadas.push(url);
    return route.abort();
  });
  if (terceros) {
    // Quitar SOLO el SRI de Leaflet (la copia de npm no es byte a byte la de cdnjs). Si el atlas ya aloja
    // Leaflet en local, la expresión no encuentra nada y la respuesta pasa intacta.
    await ctx.route(/\/atlas\/index\.html(\?.*)?$/, async (route) => {
      const resp = await route.fetch();
      let body = await resp.text();
      body = body.replace(/(cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/1\.9\.4\/leaflet\.min\.(?:css|js)"\s*\n?\s*)integrity="[^"]+"/g, '$1');
      return route.fulfill({ response: resp, body });
    });
  }
  const page = await ctx.newPage();
  page.setDefaultTimeout(o.timeout || 4000);
  page.setDefaultNavigationTimeout(60000);
  page._consola = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) page._consola.push({ tipo: m.type(), texto: m.text().slice(0, 300) }); });
  page.on('pageerror', (e) => page._consola.push({ tipo: 'pageerror', texto: String(e).slice(0, 300) }));
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() >= 400 && u.startsWith(base)) red.localesFallidas.push(u.slice(base.length).split('?')[0] + ' ' + r.status());
  });
  return { ctx, page, red, base };
}

// Espera a que el atlas termine de arrancar (cargador diferido listo o `ms`).
async function listo(page, ms = 6000) {
  try {
    await page.waitForFunction(() => document.documentElement.dataset.paleobotV69LazyLoader === 'ready', null, { timeout: ms });
  } catch (e) {}
  await page.waitForTimeout(400);
}

// Va a una vista por la API pública del atlas (window.switchView) y desplaza hasta <main>.
async function irVista(page, id) {
  return page.evaluate((id) => {
    if (typeof window.switchView !== 'function') return 'sin-switchView';
    let err = '';
    try { window.switchView(id); } catch (e) { err = 'excepcion: ' + String(e).slice(0, 160); }
    const s = document.getElementById('view-' + id);
    const act = s && s.classList.contains('active');
    const m = document.getElementById('main-content');
    if (m) m.scrollIntoView({ block: 'start' });
    return (act ? 'ok' : 'no-activa') + (err ? ' · ' + err : '');
  }, id);
}

const VIEWPORTS = {
  telefono: { width: 390, height: 844 },
  tableta: { width: 820, height: 1180 },
  escritorio: { width: 1366, height: 800 },
  estrecho: { width: 320, height: 640 },
};

// Argumento de línea de órdenes «--nombre valor».
function arg(n, d) { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; }

module.exports = { abrir, listo, irVista, VIEWPORTS, REPO, BASE, TERCEROS, arg, nombreCommons };
