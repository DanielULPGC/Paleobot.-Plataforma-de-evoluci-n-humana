# PaleoBot · fase 5: cotejo de dos ZIP v69 y decisión de integración

**Fecha:** 22-09-2026. **Destino cotejado:** derivado A3 de fase 4. **Dictamen:** conservar A3; incorporar el procedimiento de auditoría como **herramienta externa**, sin copiar el código histórico al producto. La puesta en marcha sigue en `NO_GO`.

## Identidad y diferencias

| Objeto | Resultado comprobado |
|---|---|
| `paleobot_modular_v69_lazy(1).zip` | 116 archivos; 70 JavaScript; ZIP íntegro, sin rutas peligrosas ni duplicados. |
| `OneDrive_2026-09-22.zip` | 118 archivos; contiene los 116 anteriores. Añade `AUDIT_SDD_UIUX.md` y `audit-harness.html`; solo dos archivos comunes tienen contenido distinto. |
| Cambios de código entre ZIP | `assets/js/00-core/002-script.js` publica `getSpeciesMedia`, `getSpeciesImage`, `getSpeciesThumb` y `auditSpeciesMedia` en `window`. `assets/js/30-search/069-paleobot-v86-global-search-final.js` cierra el modal del buscador antes de abrir ficha o navegar. |
| A3 fase 4 | 160 archivos. Las cuatro funciones multimedia ya están publicadas; el buscador tiene `closeModal` y abre mediante `PaleoBot.openSpecies`. De los 104 archivos de OneDrive que tienen ruta homóloga en A3, 55 son idénticos y 49 han cambiado. Otros 14 son documentos o módulos históricos que no forman parte de este derivado. |

Los dos cambios funcionales del ZIP de OneDrive **ya están integrados en una arquitectura posterior**. Sobrescribir módulos A3 con archivos v69 reintroduciría una ruta antigua de apertura directa y perdería trabajo posterior sobre imágenes, cronología, ciencia y navegación.

## Comprobaciones realizadas

- CRC de ambos ZIP, nombres duplicados, rutas de extracción y nombres peligrosos: sin incidencias detectadas.
- Sintaxis: 70 archivos JavaScript en cada v69 y 76 en A3 (incluidas herramientas de despliegue), sin errores en `node --check`.
- Referencias locales estáticas de `index.html`: 103 en cada v69 y 118 en A3, sin archivos ausentes.
- Catálogo actual: 50 fichas. Las correcciones de las fases 1 a 4 se mantienen porque **no se ha reemplazado ningún archivo del runtime**.
- Los ZIP v69 permiten `unsafe-inline` y `unsafe-eval` en su política del documento. A3 los excluye. El `audit-harness.html` aportado usa `win.eval()` y una espera fija de 4,5 s; su resultado no constituye prueba fiable del A3 actual. Su informe declara expresamente que no completó la validación visual en navegador.

## Aportación incorporada

La matriz de auditoría histórica identifica dos regresiones que conviene seguir vigilando: apertura de fichas desde el buscador y procedencia de la imagen canónica. Se incorpora como **prueba externa separada** `PaleoBot_A3_Fase5_browser_probe.cjs`: espera la inicialización efectiva, comprueba la ruta pública de apertura en 50 fichas, la transición buscador→ficha, la unicidad de 50 direcciones preferentes y el papel de cada imagen de la galería. Con `--images` también intenta cargar las 50 imágenes principales e informa de reservas y fallos de carga. No usa `eval`, no inyecta scripts en el producto y no convierte la carga de una URL en prueba de identidad o licencia.

Para ejecutarla desde un equipo con Playwright y Chromium instalados, y con PaleoBot servido en un origen autorizado:

```bash
node PaleoBot_A3_Fase5_browser_probe.cjs https://EJEMPLO-INSTITUCIONAL/ruta/index.html resultado-fase5.json
node PaleoBot_A3_Fase5_browser_probe.cjs https://EJEMPLO-INSTITUCIONAL/ruta/index.html resultado-imagenes.json --images
```

El valor `PASS_SCOPED` acredita **solo** las comprobaciones programadas. El operador debe examinar errores de página y peticiones fallidas, y comprobar manualmente las 50 imágenes, atribuciones, mapas, interacción por teclado, lector de pantalla y Moodle real. La prueba no debe incorporarse al ZIP productivo ni ejecutarse con `file://`.

## Pendiente y decisión

**No se ha ejecutado la prueba de navegador**: el entorno disponible tiene el paquete Playwright, pero no el binario Chromium, Firefox ni WebKit. Tampoco se ha probado el paquete en Moodle. Hasta recibir ese retorno, y hasta validar las identidades y derechos de las imágenes preferentes, no puede afirmarse que el material carezca de fallos o sea publicable. El JSON adjunto conserva hashes de entrada, diferencias y alcance de cada comprobación.
