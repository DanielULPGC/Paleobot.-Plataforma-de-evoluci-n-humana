# Línea base del atlas interactivo (PB-GH-11, medida sobre `c971001`)

Contrato de «no se elimina nada» para las tandas de la ronda. Medido el 2026-11-13 con `scripts/atlas/` en
Chromium (Playwright), servidor local, antes de tocar el atlas, **con el bucle de peticiones de imagen aún activo**
(04, fila 1): por eso el humo tarda 7-10 min por viewport.

| Archivo | Qué es |
|---|---|
| `02_inventario.json` | Inventario de la auditoría: 31 vistas, 14 diálogos, funciones, bloques ocultos (copia de `notas/02_inventario.json`) |
| `humo_{escritorio,telefono}_{terceros,sinterceros}.json` | `humo.cjs` en escritorio 1366×800 y teléfono 390×844, con terceros simulados y sin ellos |
| `determinismo_escritorio*.json` | `--comparar` de dos ejecuciones seguidas sin cambios (escritorio, terceros): sin marcar, 4 diferencias; con `inestables.json`, 0 pérdidas, 0 mejoras, 0 otras, 4 inestables |
| `inestables.json` | Las 4 claves no deterministas (foco y `aria-hidden` de Bibliografía, Examen y Síntesis) y su causa |
| `tormenta_{terceros,sinterceros}.json` | `tormenta.cjs`: ficha de *afarensis* abierta 10 s |
| `piso_resumen_{telefono,tableta,escritorio}.json` | Resumen por vista del piso medido por la auditoría (`recorrido.cjs`; no se repitió) |
| `hoja_*.jpg` | Hojas de contacto reducidas de las capturas de la auditoría (< 300 kB) |

Lo que ya falla en la línea base (no son pérdidas futuras): vistas `dispersal` (ReferenceError) y `recursos`
(TypeError de los favicons); funciones `simulador`, `diagnostico` (solo produce algo dentro de Centro docente),
`exportar.svg.constructor` (TDZ de `warn` en `70-export/063-…svg-export.js:281`), `mapa.lentes · all` (la lente
«Todos los focos» no queda pulsada), `enlaces.profundos` (el puente `077` solo admite 7 de las 31 vistas en
`?view=`) y, sin terceros, `minimapa.capas` (sin Leaflet).

Comparar: `node scripts/atlas/humo.cjs --comparar docs/diseno/atlas/linea-base/humo_escritorio_terceros.json <nuevo>.json --inventario docs/diseno/atlas/linea-base/02_inventario.json --inestables docs/diseno/atlas/linea-base/inestables.json`
