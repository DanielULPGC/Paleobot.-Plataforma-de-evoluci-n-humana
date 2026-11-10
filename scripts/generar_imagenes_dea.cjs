#!/usr/bin/env node
// Genera, a partir del manifiesto de copias (img/taxones/MANIFIESTO.json):
//   - dea/imagenes.js: imagen, texto alternativo y atribución de cada taxón del recorrido;
//   - img/taxones/CREDITOS.md: tabla legible de autoría y licencias;
//   - provenance/PB_GH_08_CORRESPONDENCIAS.json: identificador del recorrido → clave del expediente visual.
// Uso: node scripts/generar_imagenes_dea.cjs [--check]
'use strict';
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');
const leer = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');

global.window = {};
require(path.join(raiz, 'atlas/recorrido/datos.js'));
const taxones = global.window.AtlasPaleo.taxones;
const manifiesto = JSON.parse(leer('img/taxones/MANIFIESTO.json'));
const copias = manifiesto.images;
const catalogoBruto = JSON.parse(leer('src/entrada_ligera/catalog.json'));
const catalogo = Array.isArray(catalogoBruto) ? catalogoBruto : Object.values(catalogoBruto).find(Array.isArray);
const porNombre = new Map(catalogo.map((s) => [s.nombre.toLowerCase(), s.id]));

// Identificadores que difieren entre el recorrido y el catálogo y cuyo nombre tampoco coincide.
const EXPLICITAS = { neanderthalensis: 'neander', denisovanos: 'denisova', erectus_soloensis: 'soloensis' };

const correspondencias = {};
const sinImagen = [];
for (const t of taxones) {
  let clave = null, regla = null;
  if (copias[t.id]) { clave = t.id; regla = 'mismo identificador'; }
  else if (porNombre.has(t.n.toLowerCase()) && copias[porNombre.get(t.n.toLowerCase())]) { clave = porNombre.get(t.n.toLowerCase()); regla = 'mismo nombre científico'; }
  else if (EXPLICITAS[t.id] && copias[EXPLICITAS[t.id]]) { clave = EXPLICITAS[t.id]; regla = 'correspondencia explícita'; }
  if (clave) correspondencias[t.id] = { clave, regla, nombre: t.n };
  else sinImagen.push({ id: t.id, nombre: t.n });
}

const imagenes = {};
for (const [id, c] of Object.entries(correspondencias)) {
  const m = copias[c.clave];
  imagenes[id] = { src: '../img/taxones/' + m.file, w: m.width, h: m.height, alt: m.alt, objeto: m.object, credito: m.credit, licencia: m.license, licenciaUrl: m.license_url, fuente: m.source_page };
}

const salidas = {
  'dea/imagenes.js': '/* Imágenes de las fichas de la entrada DEA. GENERADO por scripts/generar_imagenes_dea.cjs a partir de\n' +
    '   img/taxones/MANIFIESTO.json (copias de Wikimedia Commons con su autoría y licencia). No editar a mano. */\n' +
    'window.DEA_IMAGENES = ' + JSON.stringify(imagenes) + ';\n',
  'img/taxones/CREDITOS.md': '# Créditos de las imágenes\n\n' +
    'Copias de Wikimedia Commons obtenidas el ' + manifiesto.retrieved + ' con `scripts/obtener_imagenes.py`. ' +
    'Son miniaturas de hasta ' + manifiesto.width_requested + ' px de ancho, sin otros cambios. ' +
    'Cada imagen conserva la licencia que se indica; las huellas SHA-256 están en `MANIFIESTO.json`.\n\n' +
    '| Fichero | Qué muestra | Autoría | Licencia | Fuente |\n| --- | --- | --- | --- | --- |\n' +
    Object.keys(copias).sort().map((k) => { const m = copias[k]; return `| \`${m.file}\` | ${m.object.replace(/\|/g, '/')} | ${m.credit.replace(/\|/g, '/')} | [${m.license}](${m.license_url}) | [Wikimedia Commons](${m.source_page}) |`; }).join('\n') + '\n',
  'provenance/PB_GH_08_CORRESPONDENCIAS.json': JSON.stringify({
    descripcion: 'Correspondencia entre los identificadores del recorrido (atlas/recorrido/datos.js) y las claves del expediente visual (src/entrada_ligera/image_audit.json).',
    reglas: ['mismo identificador', 'mismo nombre científico', 'correspondencia explícita'],
    correspondencias, sin_imagen: sinImagen,
  }, null, 2) + '\n',
};

let fallo = false;
for (const [ruta, contenido] of Object.entries(salidas)) {
  const destino = path.join(raiz, ruta);
  if (process.argv.includes('--check')) {
    const actual = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : '';
    if (actual !== contenido) { console.error(ruta + ' no coincide con el manifiesto'); fallo = true; }
  } else fs.writeFileSync(destino, contenido);
}
console.log(Object.keys(imagenes).length + ' taxones con imagen; ' + sinImagen.length + ' sin imagen: ' + sinImagen.map((s) => s.id).join(', '));
process.exit(fallo ? 1 : 0);
