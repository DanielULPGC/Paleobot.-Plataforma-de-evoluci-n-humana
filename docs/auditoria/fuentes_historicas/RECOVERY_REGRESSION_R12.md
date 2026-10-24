# PaleoBot — Recovery R12
## Regresión integral y puerta previa a poda de guards

### Estado
`STATIC_AND_CONTRACT_PASS__BROWSER_BLOCKED`

### Regla de esta fase
R12 no modifica el runtime de R11. Los 153 archivos originales del paquete fuente se verificaron por SHA-256 y permanecen:
`UNCHANGED`.

### Sintaxis
- JavaScript runtime: 71
- PASS: 71
- FAIL: 0

### Datos científicos y cobertura
- DB: 50 taxones.
- IDs duplicados: 0.
- incidencias en campos requeridos: 0.
- imágenes vacías: 0.
- placeholders detectados en `imagen`: 0.
- URLs de imagen exactas duplicadas: 0.
- SITES: 50; mismo conjunto que DB: True.
- Cladograma: 46/50.
- Taxones DB fuera del cladograma: juluensis, soloensis, penghu, gautengensis.
- Itinerarios: 3; paradas: 10 + 8 + 3 = 21.
- Paradas inválidas: 0.
- Rutas de dispersión: 4 (ergaster, erectus, sapiens, denisova).

### Regresión contractual integral
- casos ejecutados: 660
- PASS: 660
- FAIL: 0

La prueba integra API pública, buscador, cronología, árbol, mapa, filogenia,
cladograma, coexistencia, matriz, itinerarios, medios y dispersión mediante
contratos browserless.

### Navegador real
Se intentó ejecutar Chromium mediante Playwright. El entorno bloqueó tanto
`http://127.0.0.1/...` como `file://...` con `ERR_BLOCKED_BY_ADMINISTRATOR`.

Clasificación:
`ENVIRONMENT_BLOCKED_NOT_APPLICATION_FAILURE`

Por tanto:
`STATIC/CONTRACT PASS != FULL VISUAL BROWSER PASS`.

Se incluye `audit-harness-r12.html` para ejecutar la comprobación en un entorno
que permita cargar la aplicación localmente.

### Deuda técnica residual
- llamadas directas `showDetail(...)`: 23 en 8 archivos.
- `stopImmediatePropagation`: 117 en 38 archivos.

Los mayores focos de `stopImmediatePropagation` son:

- 12: `assets/js/30-search/056-paleobot-v77-search-guard.js`
- 8: `assets/js/10-legacy-ui/011-paleobot-v37-control-bus.js`
- 7: `assets/js/10-legacy-ui/009-paleobot-v35-separated-design-layer.js`
- 7: `assets/js/40-media/022-paleobot-v48-map-controls-repair.js`
- 7: `assets/js/90-guards/021-paleobot-v47-special-button-repair.js`
- 6: `assets/js/20-navigation/026-paleobot-v51-navigation-audit-guard.js`
- 6: `assets/js/80-features/051-paleobot-v71-compare-picker-repair.js`
- 5: `assets/js/80-features/053-paleobot-v73-itinerary-rubric-repair.js`
- 4: `assets/js/20-navigation/046-paleobot-v66-student-guide-router-repair.js`
- 4: `assets/js/20-navigation/048-paleobot-v68-interaction-stabilizer.js`

### Hallazgo abierto
El cladograma continúa con 46/50 taxones. Permanecen fuera:
`juluensis, soloensis, penghu, gautengensis`.

No se corrige en R12 porque requiere revisión científica/funcional.

### Decisión
La migración funcional puede considerarse cerrada a nivel estático/contractual.
La siguiente fase puede iniciar una **poda controlada de guards**, pero debe
hacerlo por lotes pequeños y con regresión R12 después de cada retirada.
