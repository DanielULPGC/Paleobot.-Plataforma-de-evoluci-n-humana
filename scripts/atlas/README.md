# Arnés del atlas interactivo (`scripts/atlas/`)

Red de seguridad de la ronda PB-GH-11 para `atlas/index.html`: abre el atlas en Chromium (Playwright), ejerce
sus vistas y funciones con clics y teclado reales y deja resultados comparables. No forma parte del sitio
publicado ni de `scripts/verificar_repo.py` (necesita un navegador).

## Requisitos

- Node 20+ con el paquete `playwright` y su Chromium instalados (fuera del repositorio).
- Un servidor estático propio que sirva la **raíz del repositorio**, en un puerto libre:
  `python3 -m http.server 8991 --directory <repo>` (en segundo plano; guarde el PID y párelo con `kill <PID>`).
- Opcional, para simular la red de terceros que muchas aulas no alcanzan (no se guardan en el repositorio):
  `npm install --prefix local-results/atlas-terceros @fontsource/playfair-display@5.3.0 @fontsource/source-sans-3@5.3.1 @fontsource/jetbrains-mono@5.3.0`
  (`local-results/` está fuera de git). Sin ellos, use `--sin-terceros`. Desde la T2 el atlas sirve Leaflet desde
  `atlas/assets/vendor/leaflet/` y no pide Google Fonts: esos paquetes solo hacen falta para medir versiones
  anteriores (p. ej. la línea base sobre `c971001`), que aún los piden a cdnjs y a Google; para ellas instale también
  `leaflet@1.9.4`.
- Opcional, solo para `recorrido.cjs`: axe-core (p. ej. `axe-core@4.10.2`), indicado con `PB_AXE`.

## Parámetros (variables de entorno, con su valor por defecto)

| Variable | Para qué | Por defecto |
|---|---|---|
| `PB_BASE` | URL del servidor que sirve la raíz del repositorio (también `--base`) | `http://localhost:8991` |
| `PB_REPO` | raíz del repositorio (manifiesto de imágenes) | dos carpetas por encima de `scripts/atlas/` |
| `PB_TERCEROS` | `node_modules` con `@fontsource/*` (y `leaflet@1.9.4` solo para medir versiones anteriores a la T2) | `<repo>/local-results/atlas-terceros/node_modules` |
| `PB_AXE` | ruta de `axe.min.js` | `require.resolve('axe-core/axe.min.js')` si existe |

Simulación de terceros (`arnes.cjs`; desde la T2 solo afecta a versiones anteriores en Leaflet y fuentes): Leaflet 1.9.4 desde npm (el SRI de `index.html` es el del minificado de
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
- **Violaciones de CSP** (desde la T2): cada tarea cuenta los eventos `securitypolicyviolation`, también en las
  ventanas que abre el atlas (exportaciones), en `violacionesCSP` y `cspMuestras`; el total va en `resumen`. No
  cuentan como pérdida en `--comparar`: se revisan aparte.
- **Inestables**: claves listadas en el archivo `--inestables` (`{"claves": [...], "patrones": [expresiones regulares]}`), medidas como no
  deterministas en dos ejecuciones seguidas sin cambios; se informan aparte y no cuentan como pérdida.
- `inventarioAusente`: encabezados de `02_inventario.json` que no aparecen en B (y si ya faltaban en A).

Determinismo: dos ejecuciones seguidas sin cambios deben dar `perdidas`, `mejoras` y `otras` vacías. La línea base
y su prueba de determinismo están en `docs/diseno/atlas/linea-base/`.

## Medidas añadidas en la T3 (diálogos y navegación)

- `barra.vistas` (función): los 31 accesos desde la navegación con ratón (panel «Vistas» si existe; si no, la
  barra de bloques como en la línea base), alto de `#pbV50Blocks` y si queda fija arriba al desplazarse.
- `navegacion.teclado` (función): Intro en la pestaña de familia y en el chip de cuatro vistas; dónde queda el
  foco (debe ser el chip, no `<body>`) y `aria-current="page"`.
- `vistasMeta.reposo`: tras 6 s quieto, mutaciones del DOM durante 5 s (debe ser 0) y sus principales
  orígenes; `vistasMeta.barra.alto`.
- `datos.textoCabecera` por vista: texto alcanzable del hero y de la tarjeta de Bloom (`.pb-dap`) con los
  `<details>` abiertos. `--comparar` lo compara solo si A y B lo tienen (la línea base de la T1 no): menos
  caracteres en B cuenta como pérdida.
- `asegurarVistas(page, sel)` (en `pasos.cjs`): si un control de la barra no está a la vista y existe el
  botón «Vistas», abre el panel como lo haría el alumnado. Sin ese botón (línea base) no hace nada.
Las funciones nuevas no existen en la línea base: en `--comparar` aparecen como «otras» (no son pérdidas). La
línea base no se reescribe.

## Medidas añadidas en la T4 (rutas principales)

- `vista.posicion` (función): entra, elige Cronología, Mapa y África desde «Vistas» con el ratón, tras 2,5 s con
  el panel abierto (como quien lo lee; así se detectó un fallo que las pulsaciones inmediatas no veían), y mide la
  posición de la barra, del título de la vista y del primer dato (tarjeta, mapa) en «medidas». Items: barra
  arriba, título en el primer tercio de la pantalla y primer dato dentro del primer pantallazo.
- `mapa.costas` (función): fondo local de costas del mapa (número de trazados y de anillos) y puntos de control
  con la geometría pintada (`isPointInFill`): Dmanisi y Olduvai en tierra, golfo de Guinea y Pacífico en el mar,
  marcador de *georgicus* en tierra. Pensada para `--sin-terceros`.
- `buscador.intro` (función): Intro en `#searchInput` con una coincidencia («afarensis» abre la ficha) y con
  varias («homo» abre la búsqueda global con el término y su título visible).
- `ficha.manual` (función): cabecera (nombre, intervalo, estado), «Volver atrás», «‹ n/50 ›» y cerrar visibles,
  imagen principal local cargada y primera en «General», minimapa con alternativa textual y anchura del panel
  (≤ 52 rem en escritorio; pantalla completa en teléfono).
Como en la T3, no existen en la línea base: en `--comparar` salen como «otras». Los `items` usan
`Object.create(null)` (una clave «constructor» daría falsos positivos con `{}`). La línea base no se reescribe.

## Medidas añadidas en la T5 (resto de vistas y teléfono)

- `regiones.foco` (función): en Clima, Contexto, Coexistencias, Primatología, Centro docente, Constructor y
  Paleoecología, todo contenedor que se desplaza tiene foco (tabindex=0, o un control dentro) y nombre; en Clima,
  con el gráfico enfocado, la flecha derecha lo desplaza (filas 15 y 26).
- `flotantes.tapan` (función): número de trozos de texto bajo elementos fijos (salvo la barra, sus paneles y
  los diálogos) en seis vistas, en tres posiciones de desplazamiento cada una, y con la Bibliografía abierta.
  Debe ser 0 (fila 22).
- `sinjs` (función): abre el atlas en un contexto sin JavaScript: un solo h1 visible, aviso con enlaces a
  `../ligera/index.html` y `../dea/`, página visible (fila 24).
- `cls` (función): CLS de carga (entradas almacenadas desde el inicio) y CLS al cambiar a las once vistas que
  más saltaban en la línea base (fila 13); `hadRecentInput` excluido, como `recorrido.cjs`.
- `diagnostico` y `enlaces.profundos` ya existían: desde la T5 responden (informe visible fuera de Centro
  docente; `?view=` en las 31 vistas).
- `enlaces.profundos` (endurecida tras la verificación del director): además de activar las 31 vistas, en
  Cronología, África, Biogeografía y Constructor, con y sin `#main-content`, exige 4,5 s después de la carga el
  espacio de trabajo entrado, la barra arriba (±2 px) y el título de la vista entre 0 y 260 px del borde.
- `--comparar`: los encabezados se comparan sin pictogramas decorativos y por sus 80 primeros caracteres (igual
  en A, B y el inventario), porque la fila 34 retira el emoji de rótulos como «🌡 Línea de tiempo…».
Como las de la T3 y la T4, no existen en la línea base y en `--comparar` salen como «otras». `items` con
`Object.create(null)`. La línea base no se reescribe.

## Cuándo y cómo se ejecuta el humo (fuera del verificador)

`scripts/verificar_repo.py` **no** ejecuta el humo: necesita Chromium y tarda unos 10 min por condición
(escritorio o teléfono, con o sin terceros). El verificador cubre lo estático de la ronda (desde la T6): enlaces de
`95-sistema` con `?v=pbgh11` tras los importados y `carga-fin.css` como último `<link>`, CSP de `atlas/index.html`
idéntica a la vigente, `95-sistema` sin manejadores en línea, `eval`, `new Function`, escuchas en captura ni hosts
nuevos, lista blanca de `?view=` igual a las 31 secciones, y los dos generadores con `--check`
(`generar_imagenes_atlas.cjs`, `generar_costas_atlas.cjs`). Lo que solo se ve en el navegador (vistas que se activan,
funciones que responden, foco de los diálogos, violaciones de CSP en ejecución, posición de la vista) es del humo.

**Cuándo**: antes de dar por terminado cualquier cambio en `atlas/index.html`, `atlas/assets/` o `scripts/atlas/`, y
siempre antes de proponer una fusión. Mínimo, la condición más exigente con la red real de muchas aulas:
escritorio sin terceros; si el cambio afecta a menos de 48 rem (teléfono, tableta), también teléfono sin terceros.
Para cerrar una ronda, las cuatro condiciones.

**Cómo** (desde la raíz del repositorio; servidor propio en un puerto libre, parado al terminar con `kill <PID>`):

```
python3 -m http.server 8995 --bind 127.0.0.1 &        # anote el PID ($!)
export PB_BASE=http://127.0.0.1:8995
node scripts/atlas/humo.cjs --vp escritorio --sin-terceros --salida humo_escritorio_sinterceros.json
node scripts/atlas/humo.cjs --comparar docs/diseno/atlas/linea-base/humo_escritorio_sinterceros.json humo_escritorio_sinterceros.json \
     --inventario docs/diseno/atlas/linea-base/02_inventario.json --inestables docs/diseno/atlas/linea-base/inestables.json
kill <PID>
```

Criterio de aceptación: `--comparar` termina con código 0 (**0 pérdidas**), `inventarioAusente` sin pérdidas y
`resumen.violacionesCSP` solo con las de `img-src` de OpenTopoMap en `minimapa.capas` (capa «Topográfico», fuera de la
CSP desde siempre; decisión pendiente de la titular). Las «mejoras» y «otras» se revisan, no bloquean. Guarde los
JSON fuera del repositorio (p. ej. `local-results/`); la línea base de `docs/diseno/atlas/linea-base/` no se reescribe.
Además, tras tocar imágenes: `node scripts/atlas/tormenta.cjs --sin-terceros --ms 10000` (0 peticiones por segundo en
reposo y 0 reintentos de la misma imagen).
