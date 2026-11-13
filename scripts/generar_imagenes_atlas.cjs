#!/usr/bin/env node
// Genera atlas/assets/js/95-sistema/imagenes-locales-datos.js a partir del manifiesto de copias
// (img/taxones/MANIFIESTO.json): para cada taxón del atlas con copia local, la ruta (relativa a atlas/index.html),
// medidas, texto alternativo, objeto, autoría, licencia y página de origen en Wikimedia Commons.
// Mismo criterio que scripts/generar_imagenes_dea.cjs: los datos salen solo del manifiesto (no se editan a mano).
// Las claves del manifiesto son los identificadores del atlas (DB de atlas/assets/js/00-core/002-script.js).
// Uso: node scripts/generar_imagenes_atlas.cjs [--check]
'use strict';
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');
const manifiesto = JSON.parse(fs.readFileSync(path.join(raiz, 'img/taxones/MANIFIESTO.json'), 'utf8'));
const copias = manifiesto.images;

// Identificadores del atlas: se leen de la base de datos de 002-script.js (líneas «id: "…"» del array DB).
const nucleo = fs.readFileSync(path.join(raiz, 'atlas/assets/js/00-core/002-script.js'), 'utf8');
const inicioDB = nucleo.indexOf('const DB = [');
const idsAtlas = new Set(inicioDB >= 0 ? [...nucleo.slice(inicioDB, nucleo.indexOf('\n];', inicioDB)).matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]) : []);

const imagenes = {};
const sinTaxon = [];
for (const id of Object.keys(copias).sort()) {
  const m = copias[id];
  if (idsAtlas.size && !idsAtlas.has(id)) { sinTaxon.push(id); continue; }
  imagenes[id] = { src: '../img/taxones/' + m.file, w: m.width, h: m.height, alt: m.alt, objeto: m.object, credito: m.credit, licencia: m.license, licenciaUrl: m.license_url, fuente: m.source_page, sha256: m.sha256 };
}
const sinCopia = [...idsAtlas].filter((id) => !copias[id]).sort();

const salida = 'atlas/assets/js/95-sistema/imagenes-locales-datos.js';
const contenido = '/* Imagen principal local de cada taxón del atlas. GENERADO por scripts/generar_imagenes_atlas.cjs a partir de\n' +
  '   img/taxones/MANIFIESTO.json (copias de Wikimedia Commons con su autoría y licencia). No editar a mano.\n' +
  '   Taxones del atlas sin copia local: ' + (sinCopia.join(', ') || 'ninguno') + '. */\n' +
  'window.PB_ATLAS_IMAGENES_LOCALES = ' + JSON.stringify(imagenes) + ';\n';

const destino = path.join(raiz, salida);
let fallo = false;
if (process.argv.includes('--check')) {
  const actual = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : '';
  if (actual !== contenido) { console.error(salida + ' no coincide con el manifiesto'); fallo = true; }
} else {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido);
}
if (!idsAtlas.size) { console.error('No se encontró la base de datos del atlas (const DB = [ en 002-script.js)'); fallo = true; }
if (sinTaxon.length) { console.error('Copias sin taxón en el atlas: ' + sinTaxon.join(', ')); fallo = true; }
console.log(Object.keys(imagenes).length + ' taxones con copia local; ' + sinCopia.length + ' sin copia: ' + sinCopia.join(', '));
process.exit(fallo ? 1 : 0);
