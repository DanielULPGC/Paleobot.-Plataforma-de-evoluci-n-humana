# PaleoBot · fase 3: galería, reserva visual, mapas y cronología

**Fecha:** 22-09-2026. **Base:** derivado de fase 2. **Estado:** `REQUEST_CHANGES / NO_GO`.

## Hallazgos y correcciones

| Ámbito | Hallazgo comprobado | Cambio en el derivado |
|---|---|---|
| Galería de fichas | `buildVisualEvidenceItems` añadía `sp.imagen` como «otra vista» aunque 34 de las 50 URLs heredadas divergen de la preferente. No había revisión individual de identidad ni derechos para esa segunda imagen. | Se suprime esa inclusión automática en las 50 fichas. La galería conserva la imagen preferente y el fondo regional. No se afirma haber verificado las imágenes preferentes. |
| Reserva de imágenes | `025-paleobot-v50-media-guard.js` todavía sustituía imágenes fallidas por fotografías de *Proconsul*, *Au. africanus*, *P. boisei* y *H. habilis* según clado. La fase 2 había corregido otros dos recorridos, pero este seguía activo. | Una tarjeta tipográfica identificada como ausencia de imagen o mapa sustituye la foto ajena; el texto alternativo corresponde a la reserva. |
| Mapa de galería | El reparador `066` trataba las tarjetas de mapa como imágenes de especie y podía reescribir el fondo geográfico con la imagen preferente. | Se marca el tipo de recurso y se excluyen explícitamente los mapas de ese reparador. El módulo `025` usa reserva cartográfica neutra cuando falla el fondo. |
| Mapas con marcador | El inventario `SITES` tiene 50 pares latitud/longitud con precisión irregular y sin fuente por coordenada; la ficha decía «Mapa real del yacimiento». Ejemplos explícitamente regionales: `dryopithecus` («Catalunya / Europa») y `graecopithecus` («Grecia / Bulgaria»). | La ficha rotula el marcador como referencia territorial orientativa y declara la falta de verificación individual. Los fondos regionales siguen presentados como contexto actual, sin afirmación de distribución fósil. |
| Cronología | `science/catalog.json` contiene 50 cronologías revisadas y campos heredados `anos` y `val_time`. La capa temporal utiliza `chronology` y deja los valores heredados como compatibilidad y trazabilidad. Hay lecturas de `anos` como campo `legacy_text`, `val_time` en validación estructural y un comentario heredado sobre el gráfico; el gráfico traza `A3Temporal.ccSeries`. | Sin modificación de fechas o intervalos: no se encontró en estas rutas una razón comprobada para cambiar la geometría científica. Se conserva la fuente byte a byte. |

## Verificación realizada

Comprobación de sintaxis de los tres JS modificados; prueba ejecutable de las 50 galerías con URL heredada simulada, reserva visual pequeña y grande, distinción entre imagen y mapa, invariancia del catálogo y de las 50 cronologías. El paquete contiene solo los tres JS modificados, el generador reproducible, prueba y dictamen; **no es un SCORM ni un curso publicable**. Se mantienen los informes y el inventario de medios de las fases 1 y 2 como referencia.

## Trabajo que sigue bloqueando la puesta en marcha

1. Identidad, archivo de origen, atribución, licencia y resolución de cada imagen preferente; resolver 34 divergencias y sustituir enlaces externos por activos autorizados y verificables. La fuente institucional de *Chororapithecus* requiere aclaración de permiso; Stw 53 tiene baja resolución.
2. Relacionar las 50 coordenadas con yacimientos y referencias primarias; distinguir localización aproximada, área de hallazgo y distribución temporal de un taxón. Revisar todos los mapas y marcadores en navegador.
3. Contrastar características y bibliografía registro a registro, y probar cronologías, rutas, teclado, lector de pantalla, carga sin conexión y Moodle real con alumnado y profesorado.

**Límite:** estas son verificaciones estáticas y de funciones aisladas. No se han verificado la carga remota de los 50 medios, el renderizado del sitio ni su comportamiento en Moodle.
