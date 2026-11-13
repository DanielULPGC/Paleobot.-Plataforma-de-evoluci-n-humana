# Arnés del atlas interactivo (`scripts/atlas/`)

Red de seguridad de la ronda PB-GH-11 para `atlas/index.html`: abre el atlas en Chromium (Playwright), ejerce
sus vistas y funciones con clics y teclado reales y deja resultados comparables. No forma parte del sitio
publicado ni de `scripts/verificar_repo.py` (necesita un navegador).

## Requisitos

- Node 20+ con el paquete `playwright` y su Chromium instalados (fuera del repositorio).
- Un servidor estático propio que sirva la **raíz del repositorio**, en un puerto libre:
  `python3 -m http.server 8991 --directory <repo>` (en segundo plano; guarde el PID y párelo con `kill <PID>`).
- Opcional, para simular la red de terceros que muchas aulas no alcanzan (no se guardan en el repositorio):
  `npm install --prefix local-results/atlas-terceros leaflet@1.9.4 @fontsource/playfair-display@5.3.0 @fontsource/source-sans-3@5.3.1 @fontsource/jetbrains-mono@5.3.0`
  (`local-results/` está fuera de git). Sin ellos, use `--sin-terceros`.
- Opcional, solo para `recorrido.cjs`: axe-core (p. ej. `axe-core@4.10.2`), indicado con `PB_AXE`.

## Parámetros (variables de entorno, con su valor por defecto)

| Variable | Para qué | Por defecto |
|---|---|---|
| `PB_BASE` | URL del servidor que sirve la raíz del repositorio (también `--base`) | `http://localhost:8991` |
| `PB_REPO` | raíz del repositorio (manifiesto de imágenes) | dos carpetas por encima de `scripts/atlas/` |
| `PB_TERCEROS` | `node_modules` con `leaflet@1.9.4` y `@fontsource/*` | `<repo>/local-results/atlas-terceros/node_modules` |
| `PB_AXE` | ruta de `axe.min.js` | `require.resolve('axe-core/axe.min.js')` si existe |

Simulación de terceros (`arnes.cjs`): Leaflet 1.9.4 desde npm (el SRI de `index.html` es el del minificado de
cdnjs, así que el arnés quita `integrity` solo de esas dos etiquetas en la respuesta), Google Fonts desde
`@fontsource`, imágenes de Wikimedia desde `img/taxones/` cuando el nombre de archivo de Commons coincide con
`MANIFIESTO.json`. Las teselas (OSM, ArcGIS, OpenTopoMap, maps.wikimedia) **no se simulan**: se abortan y se
cuentan. Todo lo demás externo se aborta.

## Scripts

| Script | Qué hace | Ejemplo |
|---|---|---|
| `arnes.cjs` | Común: contexto de navegador, simulación de terceros, espera de arranque, viewports | (módulo) |
| `pasos.cjs` | Pasos reutilizables: 31 vistas, diálogos (abre, foco entra, trampa de Tab, Escape, foco vuelve, `aria-hidden`) y ~50 funciones | (módulo) |
| `humo.cjs` | Humo comparable: 31 vistas en una página y cada función en un contexto nuevo; `--comparar` lista pérdidas | ver abajo |
| `tormenta.cjs` | Peticiones externas, URL repetidas y errores de consola con una ficha abierta en reposo (fila 1 de la tabla de corrección) | `node scripts/atlas/tormenta.cjs --sin-terceros --ms 10000` |
| `recorrido.cjs` | Capturas por vista y viewport y medidas de piso (CLS, tamaños, objetivos, axe) | `node scripts/atlas/recorrido.cjs --salida cap --json piso.json --vps telefono` |
| `estados.cjs` | Condiciones degradadas: sin JS, sin terceros, sin almacenamiento, 320 px, texto al 200 %, movimiento reducido, impresión, teclado | `node scripts/atlas/estados.cjs --json estados.json --capturas cap` |
| `cascada.cjs` | Qué hoja gana de verdad en los componentes principales (CDP) | `node scripts/atlas/cascada.cjs --json cascada.json` |
| `variantes.cjs` | Variantes visuales de botón, tarjeta, chip, pestaña y diálogo | `node scripts/atlas/variantes.cjs --json variantes.json` |
| `dialogos.cjs` | Capturas de diálogos, ficha y cajón | `node scripts/atlas/dialogos.cjs --salida cap` |
| `hoja_contacto.py` | Hoja de contacto reducida de las capturas de un viewport | `python3 -I scripts/atlas/hoja_contacto.py cap telefono hoja.png 120 8` |
| `resumir_piso.py` | Resumen legible de un `piso_<vp>.json` | `python3 -I scripts/atlas/resumir_piso.py piso.json` |
| `generar_inventario.py` | Reconstruye `02_inventario.json` desde el inventario en bruto, `meta.json` y un humo | `python3 -I scripts/atlas/generar_inventario.py <carpeta> salida.json` |

## Humo y comparación («no se elimina nada»)

```
node scripts/atlas/humo.cjs --vp escritorio --salida humo_escritorio.json            # con terceros simulados
node scripts/atlas/humo.cjs --vp telefono --sin-terceros --salida humo_telefono.json  # sin red de terceros
node scripts/atlas/humo.cjs --comparar docs/diseno/atlas/linea-base/humo_escritorio_terceros.json humo_escritorio.json \
     --inventario docs/diseno/atlas/linea-base/02_inventario.json --inestables docs/diseno/atlas/linea-base/inestables.json
```

Opciones: `--paralelo N` (contextos simultáneos; 2 por defecto), `--solo f1,f2` (solo esas funciones),
`--sin-vistas`. Duración orientativa con 2 CPU: 5-10 min por viewport.

`--comparar A B` compara solo campos estables y clasifica cada diferencia:

- **Pérdidas** (código de salida 1): vista que deja de activarse, de pintarse o lanza excepciones; encabezado de
  vista (h2-h4) presente en A y ausente en B; menos del 97 % del texto alcanzable de la vista o menos controles
  visibles (los `<details>` de la vista se abren para medir: plegar cuenta como conservar, `display:none` no);
  función o elemento de función (`items`) que deja de responder; diálogo que deja de abrir o empeora en foco que
  entra, Escape, foco que vuelve o `aria-hidden` al abrir; recurso local que empieza a fallar (4xx/5xx).
- **Mejoras**: lo inverso. **Otras**: diferencias neutras (encabezado nuevo, más texto o controles).
- **Inestables**: claves listadas en el archivo `--inestables` (`{"claves": [...], "patrones": [expresiones regulares]}`), medidas como no
  deterministas en dos ejecuciones seguidas sin cambios; se informan aparte y no cuentan como pérdida.
- `inventarioAusente`: encabezados de `02_inventario.json` que no aparecen en B (y si ya faltaban en A).

Determinismo: dos ejecuciones seguidas sin cambios deben dar `perdidas`, `mejoras` y `otras` vacías. La línea base
y su prueba de determinismo están en `docs/diseno/atlas/linea-base/`.
