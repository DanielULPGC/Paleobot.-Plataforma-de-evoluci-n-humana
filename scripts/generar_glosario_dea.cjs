#!/usr/bin/env node
// Genera dea/glosario.js a partir del glosario del Atlas v1 (atlas/assets/js/00-core/002-script.js).
// Uso: node scripts/generar_glosario_dea.cjs [--check]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.resolve(__dirname, '..');
const origen = path.join(raiz, 'atlas/assets/js/00-core/002-script.js');
const destino = path.join(raiz, 'dea/glosario.js');
const texto = fs.readFileSync(origen, 'utf8');
const ini = texto.indexOf('const glosario = {');
const fin = texto.indexOf('\n};', ini);
if (ini < 0 || fin < 0) throw new Error('No se encuentra el glosario del atlas');
const objeto = vm.runInNewContext('(' + texto.slice(ini + 'const glosario = '.length, fin + 2) + ')');
const entradas = Object.keys(objeto).sort((a, b) => a.localeCompare(b, 'es')).map((k) => [k, objeto[k]]);
const salida = '/* Glosario de la entrada DEA. GENERADO por scripts/generar_glosario_dea.cjs a partir del\n' +
  '   glosario del Atlas v1 (atlas/assets/js/00-core/002-script.js). No editar a mano. */\n' +
  'window.DEA_GLOSARIO = ' + JSON.stringify(entradas, null, 0) + ';\n';
if (process.argv.includes('--check')) {
  const actual = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : '';
  if (actual !== salida) { console.error('dea/glosario.js no coincide con el glosario del atlas'); process.exit(1); }
  console.log('dea/glosario.js coincide (' + entradas.length + ' términos)');
} else {
  fs.writeFileSync(destino, salida);
  console.log('dea/glosario.js: ' + entradas.length + ' términos');
}
