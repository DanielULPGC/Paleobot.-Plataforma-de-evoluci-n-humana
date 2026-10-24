# PaleoBot · fase 7: comprobación funcional local

**Fecha:** 23-09-2026. **Base:** derivado científico de fase 6. **Estado:** `NO_GO` para publicación o importación como SCORM.

## Correcciones realizadas

| Hallazgo demostrado | Recorrido afectado | Corrección y prueba |
|---|---|---|
| El cargador diferido resolvía `onerror` como éxito y marcaba `ready` aunque uno de sus dos módulos fallase. | `assets/js/00-core/071-paleobot-v69-lazy-loader.js` | Ahora distingue `ready` de `failed`, conserva la carga secuencial y registra los módulos fallidos. Una simulación funcional comprueba un caso de dos cargas correctas y otro con fallo del segundo módulo. |
| El estado ausente de 43/50 fichas desaparecía en algunos resúmenes o se mostraba como la clave interna `sin_revision`. | `assets/js/00-core/002-script.js`: ficha experta, historial, mapa, presentación y cautela para actividades. | Esas superficies dicen «Sin revisión individual»; la métrica del mapa cuenta también las fichas sin aceptación individual verificada. Las pruebas ejercitan una ficha sin estado y otra aceptada. |

No se modificaron las 50 fichas científicas, el catálogo incrustado ni las cronologías de fase 6. Los expedientes anteriores permanecen archivados bajo `operator/historical_fase6/` y `operator/historical_r92/`. El estado y los hashes vigentes corresponden a fase 7.

## Verificación ejecutada

| Prueba | Resultado | Alcance exacto |
|---|---|---|
| Coincidencia de datos | **PASS** | 50/50 fichas comparadas campo a campo con el catálogo; el mapa usa una URL derivada de la clave regional. |
| Estados y cargador | **PASS** | 43 fichas sin estado, una aceptada, carga diferida completa y error simulado. |
| Sintaxis JavaScript | **PASS** | 71 archivos `.js` del árbol de ejecución. |
| Servidor HTTP local | **PASS** | 120 referencias internas desde las dos páginas HTML comprobadas; 137 archivos de ejecución devueltos con HTTP 200, bytes idénticos al disco y `nosniff`. |
| Identidad de archivos | **PASS** | SHA-256 de los 137 archivos de ejecución publicados en `operator/CHECKSUMS_SHA256.txt`. |
| Navegador real | **BLOQUEADO POR EL ENTORNO** | No hay un ejecutable Chromium instalado. El intento se registra en `PaleoBot_Fase7_intento_navegador.json`; se entrega `prueba_navegador_fase7.py` para ejecutar escritorio, móvil y movimiento reducido en un equipo con Chromium. |

## Condiciones de uso todavía abiertas

1. La verificación HTTP prueba disponibilidad de archivos y coincidencia de bytes, **no la ejecución del DOM, la apariencia, los clics reales, WCAG ni la integración Moodle**. El guion de navegador preparado inspecciona cronología, marcadores, ficha denisovana, cuestionario, desbordamiento y errores de JavaScript; su ejecución sigue pendiente.
2. Las 50 imágenes de ficha se sirven desde direcciones externas, con autoría y licencias individuales todavía no contrastadas en la mayor parte del corpus. Su carga real y la respuesta ante bloqueos de red requieren pruebas en el destino. Los fondos cartográficos también dependen de un servicio externo.
3. El árbol no incluye `imsmanifest.xml`: **no constituye un paquete SCORM 1.2 importable**. La prueba HTTP local tampoco reproduce cabeceras, iframe, CSP, persistencia ni accesibilidad en Moodle.
4. Una interfaz que declara la ausencia de revisión de 43 estados taxonómicos evita una atribución engañosa; no suple la revisión científica individual de esas 43 fichas.

**Dictamen:** el conjunto está mejor documentado y dos fallos visibles de integridad están corregidos. La evidencia actual no permite asegurar que todas las funciones sean operativas para el curso. Antes de autorizarlo, deben ejecutarse la prueba de navegador y las puertas de Moodle/SCORM correspondientes al formato de publicación elegido.
