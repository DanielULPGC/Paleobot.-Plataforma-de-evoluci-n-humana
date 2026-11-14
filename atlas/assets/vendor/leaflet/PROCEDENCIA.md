# Leaflet 1.9.4 · procedencia de la copia alojada (PB-GH-11, T2)

Copia local de Leaflet para el atlas interactivo (`atlas/index.html`: minimapa de la ficha de especie). Sustituye
a la carga desde cdnjs. Licencia BSD 2-Clause (`LICENSE`, copia literal del paquete). No se ha modificado ningún
byte de los archivos alojados.

## Origen

- Paquete npm `leaflet@1.9.4`, tarball `https://registry.npmjs.org/leaflet/-/leaflet-1.9.4.tgz`, descargado el
  14-11-2026 con `npm pack leaflet@1.9.4 --ignore-scripts` (sin ejecutar scripts del paquete).
- Datos del registro (`npm view leaflet@1.9.4 dist`):
  - `shasum`: `23fae724e282fa25745aff82ca4d394748db7d8d`
  - `integrity`: `sha512-nxS1ynzJOmOlHp+iL3FyWqK89GtNL8U8rvlMOsQdTTssxZwCXh8N2NB3GDQOL+YR3XnWyZAxwQixURb+FA74PA==`
  - `fileCount` 106; firma del registro con `keyid` `SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA`
    (no se verificó criptográficamente la firma; sí la huella del tarball).
- Huella del tarball descargado, calculada localmente: SHA-1 `23fae724e282fa25745aff82ca4d394748db7d8d` y
  SHA-512 igual al `integrity` anterior: **coinciden con el registro**.

## Archivos alojados (SHA-256)

| Archivo | SHA-256 | Origen en el paquete |
|---|---|---|
| `leaflet.js` | `db49d009c841f5ca34a888c96511ae936fd9f5533e90d8b2c4d57596f4e5641a` | `package/dist/leaflet.js` |
| `leaflet.css` | `a7837102824184820dfa198d1ebcd109ff6d0ff9a2672a074b9a1b4d147d04c6` | `package/dist/leaflet.css` |
| `images/layers.png` | `1dbbe9d028e292f36fcba8f8b3a28d5e8932754fc2215b9ac69e4cdecf5107c6` | `package/dist/images/` |
| `images/layers-2x.png` | `066daca850d8ffbef007af00b06eac0015728dee279c51f3cb6c716df7c42edf` | `package/dist/images/` |
| `images/marker-icon.png` | `574c3a5cca85f4114085b6841596d62f00d7c892c7b03f28cbfa301deb1dc437` | `package/dist/images/` |
| `images/marker-icon-2x.png` | `00179c4c1ee830d3a108412ae0d294f55776cfeb085c60129a39aa6fc4ae2528` | `package/dist/images/` |
| `images/marker-shadow.png` | `264f5c640339f042dd729062cfc04c17f8ea0f29882b538e3848ed8f10edb4da` | `package/dist/images/` |
| `LICENSE` | `53e8dc25862014e4324741ca18fbe3611e11d42ef69f59f86ea8c5389647d4cb` | `package/LICENSE` (idéntico al `LICENSE` de la etiqueta v1.9.4) |

Integridad de subrecurso usada en `atlas/index.html`: `leaflet.js`
`sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH`; `leaflet.css`
`sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H`.

No se alojan `leaflet-src*.js` ni los mapas de fuente: `leaflet.js` termina con `//# sourceMappingURL=leaflet.js.map`,
que solo piden las herramientas de desarrollo del navegador (un 404 ahí no afecta al alumnado).

## Contraste con el repositorio oficial `Leaflet/Leaflet` (GitHub)

1. **Etiqueta `v1.9.4`** (`git clone --depth 1 --branch v1.9.4`, commit `d15112c9e8ac339f0f74f563959d0423d291308d`).
   Su `dist/` versionado solo contiene `leaflet.css` e `images/` (los JS se generan en la publicación).
   `leaflet.css` y las cinco imágenes: **idénticos byte a byte** a los del paquete npm. `LICENSE`: idéntico.
2. **Artefacto oficial de la release** `https://github.com/Leaflet/Leaflet/releases/download/v1.9.4/leaflet.zip`
   (714 593 bytes): `leaflet.css` e imágenes **idénticos**. `leaflet.js`, `leaflet-src.js` y `leaflet-src.esm.js`
   difieren del paquete npm **solo** en el número de versión: el artefacto lleva `1.9.4+v1.d15112c` (versión con el
   commit de la etiqueta) en una única aparición por archivo y el paquete lleva `1.9.4`. Quitando la cadena
   `+v1.d15112c` del artefacto, los tres archivos son **idénticos byte a byte** a los del paquete npm. La diferencia
   la explica `build/rollup-config.js` de la propia etiqueta:
   `const version = release ? pkg.version : \`${pkg.version}+${gitRev.branch()}.${gitRev.short()}\``
   (el zip se construyó sin la bandera de publicación).
3. Comprobación adicional: el `leaflet.js` del artefacto de la release coincide byte a byte con la copia que ya
   estaba en el repositorio (`experimental/atlas-r98/fuentes/Auditoria_R98/assets/vendor/leaflet/1.9.4/leaflet.js`,
   no publicada).

Conclusión: todo lo contrastable cuadra; la única diferencia está acotada a la cadena de versión y explicada por el
script de construcción oficial. No se pudo contrastar la recompilación desde el código fuente (no se ejecutó la
construcción de Leaflet).

## Auditoría de seguridad previa (14-11-2026)

Búsqueda estática en `leaflet.js`, `leaflet-src.js` (equivalente legible) y `leaflet.css`:

- Peticiones de red: ninguna llamada a `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource` ni
  `importScripts`. Las URL del código son comentarios de documentación (MDN, caniuse, bugzilla), el espacio de
  nombres SVG `http://www.w3.org/2000/svg` y el enlace «Leaflet» de la atribución (`https://leafletjs.com`, solo
  un enlace visible, sin petición). Las teselas solo se piden si el código del atlas crea capas `L.tileLayer`
  (lo hace `002-script.js` con OSM, OpenTopoMap y ArcGIS: dependencia del atlas, no de Leaflet).
- Ejecución dinámica: ningún `eval`, `new Function`, `Function(` ni temporizador con cadena (las dos apariciones de
  «Function(» son `sortFunction(`).
- Telemetría o huella del navegador: no hay. `navigator.userAgent` se lee solo para detectar el navegador
  (compatibilidad); `navigator.geolocation` solo se usa en `map.locate()`, que el atlas no llama.
- Ofuscación: no. `leaflet.js` es el minificado estándar con su banner; `leaflet-src.js` es legible y equivalente.
- CSS: `url()` solo a `images/*.png` locales y `url(#default#VML)` (comportamiento antiguo de IE, sin petición).
- Almacenamiento: ningún acceso a `document.cookie`, `localStorage`, `sessionStorage` ni `indexedDB`.

Resultado: apto para alojarse. No se añade ninguna otra biblioteca.
