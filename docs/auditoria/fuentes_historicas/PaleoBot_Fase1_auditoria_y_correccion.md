# PaleoBot · auditoría y corrección controlada · fase 1

**Fecha:** 22-09-2026. **Fuente inalterada:** A3-C6.3.5/R05-T5, ZIP SHA-256 `7e0190d008012203a2af116a6fe58433f761ec829e4ae2a4e69af2d68ec76d05`. **Estado del derivado:** `NO_GO`; no se ha probado Moodle institucional, navegador ni lector de pantalla con este derivado.

## Cobertura inspeccionada

- Inventario e integridad ZIP de cinco ramas: A3, Immersive v7, Atlas v1, R92 y kit Immersive P1.8b. Los cinco ZIP abrieron sin fallo CRC.
- Lectura de los 50 registros y los 50 contratos de cronología de A3; comprobación de correspondencia de identificadores y fuentes.
- Inspección de las rutas de imagen en la base, el adaptador de medios y la vista de evidencia visual; inspección de las 15 claves de fondo cartográfico y de su etiqueta en la ficha principal.
- No se ha inspeccionado exhaustivamente el comportamiento de todas las vistas ni la procedencia individual de las otras 49 imágenes. Esta fase no constituye auditoría científica total de los 50 textos.

## Hallazgos demostrados

| ID | Localización | Mecanismo y efecto | Estado |
|---|---|---|---|
| VIS-01 | `assets/js/00-core/002-script.js`, registro `kadabba`, y `science/catalog.json` | El campo primario `imagen` señalaba una reconstrucción de *A. ramidus*. `buildVisualEvidenceItems` utiliza ese campo como imagen secundaria incluso cuando `getSpeciesMedia` dispone de una fotografía de fósiles de *A. kadabba*. Una vista podía presentar como material de *kadabba* la imagen de otra especie. | Corregido en el derivado: la imagen primaria y la secundaria remiten a los fósiles atribuidos a *kadabba*. |
| MAP-01 | `assets/js/00-core/002-script.js`, bloque `MAPS` y ficha visual | Los 15 valores son mapas regionales de relieve o localización, sin los yacimientos del registro. La ficha los rotulaba «Distribución geográfica» y su texto alternativo afirmaba distribución del taxón. | Corregida la etiqueta y el texto alternativo; falta cartografía arqueológica basada en yacimientos y fechas verificadas. |
| VIS-02 | `science/catalog.json` y `assets/js/00-core/002-script.js` | Las 50 imágenes primarias son URLs remotas. La unicidad de la URL no acredita 50 imágenes identificadas, disponibles, licenciadas y diferenciadas; el paquete no incluye esas 50 imágenes localmente. | Abierto. El CSV identifica cada registro; por defecto todas las demás imágenes quedan pendientes de comprobación individual. |
| CRON-01 | `science/catalog.json` y `assets/js/00-core/002-script.js` | El núcleo conserva `anos` y `val_time` heredados mientras A3 dispone de 50 contratos cronológicos revisados. Es indispensable controlar que cada consumidor use los contratos y no interprete un punto como duración o presencia continua. | Auditoría de datos completa 50/50; auditoría de consumidores aún abierta. |
| DEP-01 | Integración | A3 y v7 siguen marcados `NO_GO`; el sistema no registra validación auténtica del Moodle de destino ni del lector de pantalla. | Abierto. |

## Corrección aplicada

Se ha modificado **solo el derivado** de los tres archivos que contienen la imagen primaria de *kadabba* y la ficha de mapa del núcleo. La página de [Wikimedia Commons de los fósiles de *A. kadabba*](https://commons.wikimedia.org/wiki/File:Ardipithecus_kadabba_fossils.jpg) identifica la imagen y acredita autoría Lucius y licencia CC BY-SA 3.0. El adaptador de medios ya contenía esa ficha de origen; la corrección elimina la divergencia entre rutas. En el mapa se indica explícitamente que el fondo regional actual no delimita distribución fósil.

## Criterios para los siguientes lotes

1. Para cada uno de los otros 49 medios: confirmar imagen realmente cargada, especie o espécimen mostrado, URL de descripción, autoría, licencia, cambios y texto alternativo; guardar copia local solo cuando el derecho lo permita. No sustituir un fósil por una reconstrucción de otro taxón.
2. Para mapas: inventario de localidades con fuente y coordenada, nivel de precisión, edad asociada y estado; generar capas de hallazgos y de hipótesis por separado. La ausencia de localidad georreferenciada no autoriza dibujar distribución.
3. Para la línea temporal: proyectar solo los tipos cronológicos compatibles; `unknown` sin barra, `minimum_age` con límite explícito y `alternative_intervals` como barras separadas. Mantener `anos`/`val_time` únicamente como herencia técnica aislada.
4. Integrar críticamente la publicación Rao et al. (2026, DOI `10.1038/s41586-026-10976-9`) sobre Bianfu en el dossier denisovano, sin inferir por ello un intervalo cerrado del linaje.
5. Validar la experiencia real en HTTPS y Moodle, navegación, imágenes, teclado, lector de pantalla, estados SCORM y exportaciones antes de cambiar `NO_GO`.

**Dictamen:** `REQUEST_CHANGES / NO_GO` para publicación docente. El ZIP adjunto es un derivado de trabajo apto para revisión y pruebas controladas, no un paquete SCORM verificado.
