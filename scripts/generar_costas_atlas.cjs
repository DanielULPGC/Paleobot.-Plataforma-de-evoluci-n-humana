#!/usr/bin/env node
// Genera atlas/assets/js/95-sistema/costas-datos.js: contorno de tierras emergidas para el fondo local de los mapas
// del atlas (fila 8 de la tabla de corrección de PB-GH-11: el mapa sin teselas de terceros).
//
// Procedencia de los datos (solo datos; ningún código de terceros llega al sitio):
//   - Natural Earth, «Land» 1:110m, versión 4.1.0 (https://www.naturalearthdata.com/). Natural Earth declara sus
//     datos de DOMINIO PÚBLICO («All versions of Natural Earth raster + vector map data found on this website are
//     in the public domain»; https://www.naturalearthdata.com/about/terms-of-use/).
//   - Redistribuido como TopoJSON por el paquete npm world-atlas@2.0.2 (archivo land-110m.json), de Mike Bostock;
//     el empaquetado lleva licencia ISC (su LICENSE); los datos son los de Natural Earth.
//   - Integridad del paquete según el registro de npm (`npm view world-atlas@2.0.2 dist`):
//       shasum (SHA-1)  4bca4a578f3a413bd409c3f07f2054fe7375824f
//       integrity       sha512-IXfV0qwlKXpckz1FhwXVwKRjiIhOnWttOskm5CtxMsjgE/MXAYRHWJqgXOpM8IkcPBoXnyTU5lFHcYa5ChG0LQ==
//     Comprobado en PB-GH-11 (T4) sobre el tarball descargado con `npm pack world-atlas@2.0.2` (SHA-1 y SHA-512
//     coinciden con el registro).
//   - SHA-256 del archivo de entrada land-110m.json (55 207 bytes): ENTRADA_SHA256, abajo.
//   - SHA-256 del resultado (costas-datos.js): RESULTADO_SHA256, abajo; `--check` lo comprueba sin red.
//
// Transformación: se decodifica la topología (arcos cuantizados con codificación delta, transformación
// scale/translate de la propia topología), se reconstruyen los anillos de los polígonos de «land» y se redondean
// las coordenadas a 2 decimales (≈ 1 km; la generalización 1:110m ya es mucho más gruesa); los anillos que cruzan
// el antimeridiano se cierran por el borde del mapa o se duplican al otro lado (véase generar()). No se proyecta: los
// datos quedan en grados (longitud, latitud). Cada vista los proyecta con su propia función (002-script.js:
// mapProject para el mapa mundial; Leaflet para el minimapa de la ficha).
//
// Uso:
//   npm pack world-atlas@2.0.2 (en una carpeta fuera del repositorio) y descomprimir el tarball;
//   node scripts/generar_costas_atlas.cjs --entrada <carpeta>/package/land-110m.json   # genera
//   node scripts/generar_costas_atlas.cjs --check                                        # comprueba la huella
//   node scripts/generar_costas_atlas.cjs --check --entrada <…>/land-110m.json            # y además regenera y compara
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENTRADA_SHA256 = 'ead5f68119c49a9250902e7da303bcb209341bbb8fefe7369a439b48b704658a';
const RESULTADO_SHA256 = 'f701f887bb971507aef536aef7e0a575daa75d9692815bcfa52d7f5c13dba5c5';
const raiz = path.resolve(__dirname, '..');
const salida = 'atlas/assets/js/95-sistema/costas-datos.js';
const destino = path.join(raiz, salida);
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };

function generar(rutaEntrada) {
  const bruto = fs.readFileSync(rutaEntrada);
  if (sha256(bruto) !== ENTRADA_SHA256) throw new Error('land-110m.json no es el de world-atlas@2.0.2 (SHA-256 distinto)');
  const topo = JSON.parse(bruto.toString('utf8'));
  const [sx, sy] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;
  // Arcos: posiciones absolutas a partir de la codificación delta.
  const arcos = topo.arcs.map((arco) => {
    let x = 0; let y = 0;
    return arco.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
  });
  const anillo = (indices) => {
    const pts = [];
    indices.forEach((i, k) => {
      const a = i >= 0 ? arcos[i] : arcos[~i].slice().reverse();
      a.forEach((p, j) => { if (k > 0 && j === 0) return; pts.push(p); });
    });
    return pts;
  };
  const anillos = [];
  for (const g of topo.objects.land.geometries) {
    const polis = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
    for (const poli of polis) for (const r of poli) anillos.push(anillo(r));
  }
  // Antimeridiano (±180°): Natural Earth parte ahí los polígonos y, en un plano equirrectangular, el salto de
  // longitud dibujaría una línea de lado a lado del mapa. Se corrige sin inventar costa:
  //  - anillo con DOS saltos (Fiyi, Chukotka, isla de Wrangel): se desenvuelve la longitud para que sea continua
  //    (puede pasar de 180) y se añade una copia desplazada 360° para la parte que cae al otro lado;
  //  - anillo con UN salto (Antártida, que cierra por el polo): el salto se sustituye por el borde del mapa
  //    (por el antimeridiano hasta −90° y por el polo al otro lado), que es como se cierra ese polígono.
  const corregidos = [];
  for (const pts of anillos) {
    const saltos = [];
    for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i][0] - pts[i - 1][0]) > 180) saltos.push(i);
    if (saltos.length === 1) {
      const i = saltos[0]; const a = pts[i - 1]; const b = pts[i];
      const sa = Math.sign(a[0]) || 1; const sb = Math.sign(b[0]) || -1;
      const polo = a[1] < 0 ? -90 : 90;
      corregidos.push([...pts.slice(0, i), [180 * sa, a[1]], [180 * sa, polo], [180 * sb, polo], [180 * sb, b[1]], ...pts.slice(i)]);
    } else if (saltos.length >= 2) {
      const cont = [pts[0].slice()]; let desplaz = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0] - pts[i - 1][0];
        if (dx > 180) desplaz -= 360; else if (dx < -180) desplaz += 360;
        cont.push([pts[i][0] + desplaz, pts[i][1]]);
      }
      corregidos.push(cont);
      const xs = cont.map((p) => p[0]);
      if (Math.max(...xs) > 180) corregidos.push(cont.map(([x, y]) => [x - 360, y]));
      if (Math.min(...xs) < -180) corregidos.push(cont.map(([x, y]) => [x + 360, y]));
    } else corregidos.push(pts);
  }
  const r2 = (v) => Math.round(v * 100) / 100;
  const plano = corregidos.map((pts) => {
    const out = []; let ant = '';
    for (const [x, y] of pts) { const k = r2(x) + ',' + r2(y); if (k === ant) continue; ant = k; out.push(r2(x), r2(y)); }
    return out;
  }).filter((a) => a.length >= 8);
  const puntos = plano.reduce((n, a) => n + a.length / 2, 0);
  return '/* Tierras emergidas para el fondo local de los mapas del atlas. GENERADO por scripts/generar_costas_atlas.cjs.\n' +
    '   No editar a mano. Datos: Natural Earth «Land» 1:110m v4.1.0 (dominio público), vía el paquete npm\n' +
    '   world-atlas@2.0.2 (land-110m.json, SHA-256 ' + ENTRADA_SHA256 + ').\n' +
    '   Formato: anillos de polígonos como listas planas [lon, lat, lon, lat, …] en grados (WGS84), 2 decimales.\n' +
    '   ' + plano.length + ' anillos, ' + puntos + ' puntos. Solo datos: no ejecuta nada al cargarse salvo esta asignación. */\n' +
    'window.PB_COSTAS = {fuente:"Natural Earth 1:110m (dominio público) · world-atlas@2.0.2",anillos:' + JSON.stringify(plano) + '};\n';
}

const entrada = arg('--entrada');
let fallo = false;
if (process.argv.includes('--check')) {
  const actual = fs.existsSync(destino) ? fs.readFileSync(destino) : Buffer.alloc(0);
  if (sha256(actual) !== RESULTADO_SHA256) { console.error(salida + ': SHA-256 distinto del registrado (' + sha256(actual) + ')'); fallo = true; }
  if (entrada) {
    const nuevo = generar(entrada);
    if (nuevo !== actual.toString('utf8')) { console.error(salida + ' no coincide con lo que genera la entrada'); fallo = true; }
  }
  if (!fallo) console.log('OK ' + salida + ' (' + actual.length + ' bytes, SHA-256 ' + RESULTADO_SHA256 + ')' + (entrada ? '; regenerado y comparado' : ''));
} else {
  if (!entrada) { console.error('Falta --entrada <ruta a land-110m.json de world-atlas@2.0.2>'); process.exit(2); }
  const contenido = generar(entrada);
  fs.writeFileSync(destino, contenido);
  console.log('Escrito ' + salida + ' (' + Buffer.byteLength(contenido) + ' bytes, SHA-256 ' + sha256(contenido) + ')');
}
process.exit(fallo ? 1 : 0);
