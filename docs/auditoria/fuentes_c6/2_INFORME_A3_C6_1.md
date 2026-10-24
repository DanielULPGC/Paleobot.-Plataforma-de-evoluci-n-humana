# PaleoBot A3-C6.1 — Puerta externa de navegador, accesibilidad e integración

**Fecha:** 10 de septiembre de 2026  
**Estado:** `A3_C6_1_STATIC_ACCESSIBILITY_REPAIR_PASS__EXTERNAL_GATE_READY__LOCAL_NETWORK_NAVIGATION_BLOCKED__R93_PRESERVED_NOT_REUSED__SCIENTIFIC_AND_EXTERNAL_GATES_OPEN__NO_GO`  
**Padre inmediato:** A3-C5.3, SHA-256 `3f7b3542723dd0421b2a9dab876da02cb4f76c55089e4812b0b8fe5dbe76cba8`.

## 1. Resultado del nodo

C6.1 prepara una puerta externa vinculada al runtime A3 actual y corrige un hallazgo estructural de accesibilidad detectado durante el preflight. No declara navegador, lector de pantalla ni Moodle como superados.

La auditoría estática inicial obtuvo 31/32 controles: dos tablas del `index.html` carecían de nombre accesible. Se añadieron exclusivamente:

- `aria-label="Rúbrica de competencia docente"` a `.dea-rubric-table`;
- `aria-label="Matriz de caracteres anatómicos comparados"` a `#matrixTableContent`.

Después de la corrección, el preflight obtiene 32/32. Este resultado es una comprobación estructural de fuente; **no equivale a conformidad WCAG 2.2**, porque no evalúa de forma suficiente contraste calculado, orden dinámico de foco, trampas de teclado, reflow completo ni experiencia con tecnologías de asistencia.

## 2. Superficie de cambio

El runtime conserva 160 archivos. Respecto de C5.3 cambia exactamente un archivo: `index.html`. El delta es reproducible mediante dos sustituciones textuales y no altera datos, JavaScript, CSS, almacenamiento, rutas, API, topología, cronología ni políticas CSP.

- `index.html` C5.3: `c3d47a198ecd110f484afb9ba1cf9db6b1aa71c52fe164f3eb57901728b6ead7`.
- `index.html` C6.1: `48aee37e49304a9db84f229558f1b0e430c9ea8472e564f656ca976357cb10b0`.
- árbol runtime C6.1: `05120c45cede3a9870d4e18106105bfc3e40e921dc50447d5f3f5d69ce2ccfe1`.

## 3. Regresiones locales

Las ocho baterías vigentes se han ejecutado de nuevo sobre C6.1:

| Batería | Resultado |
|---|---:|
| Núcleo temporal | 47/47 + 1.000 sondas |
| Adaptador científico | 32/32 + 1.000 sondas |
| Gráfico/layout | 51/51 + 1.000 sondas |
| DOM consulta | 13/13 |
| DOM evidencias | 12/12 |
| Banco docente C5 | 15/15 + 1.000 sondas |
| Exportaciones C5.2 | 26/26 + 1.000 sondas |
| Rótulos C5.3 | 29/29 + 1.000 sondas |
| **Total** | **225/225 + 6.000 sondas** |

El verificador local C6.1 obtiene 33/33 controles, incluida la identidad de los paquetes padre, el delta exacto de `index.html`, la preservación de CSP, la repetición funcional y la separación explícita de las puertas no ejecutadas.

## 4. Diagnóstico del navegador local

Chromium está instalado y puede arrancar, crear una página mediante `set_content` y ejecutar JavaScript interno. Sin embargo, las navegaciones a `http://127.0.0.1/...` y `file://...` devuelven `ERR_BLOCKED_BY_ADMINISTRATOR` en este entorno.

Por tanto, el bloqueo no demuestra un fallo de PaleoBot. A la vez, tampoco permite declarar superada la puerta HTTP: las aserciones de CSP de respuesta, almacenamiento con origen real, rutas, recursos y comportamiento dentro de iframe no llegan a ejecutarse.

El ensayo del índice completo mediante `set_content` tampoco se utiliza como sustituto: sin un origen real, `sessionStorage` queda denegado y la inicialización no reproduce las condiciones de despliegue. Ese intento se conserva como evidencia de limitación del arnés.

## 5. Incompatibilidad de R93 con el runtime A3

Se ha verificado el paquete original R93, SHA-256 `333100e8b1126e18ebb88f8326fd5f11c19a6e5542fd5aa9d15fb7244c80c0af`; su arnés sintético continúa pasando 15/15.

No obstante, el manifiesto de retorno R93 está vinculado al candidato R92, SHA-256 `b5223e16a72ec3135c3770166b6a6717ecd2628f7cf31eca19248f8b579a22c8`, y presupone un runtime idéntico a R92. A3 modifica ese runtime. En consecuencia, **R93 no puede adjudicar directamente A3-C6.1 sin romper su propia cadena de identidad**.

C6.1 no modifica R93. En su lugar crea una puerta A3 específica, inspirada en sus principios fail-closed, pero ligada al árbol `05120c45...` del runtime A3-C6.1. Un eventual resultado Moodle de esta puerta no se denominará `R93 PASS`.

## 6. Puerta externa A3-C6.1

El kit de retorno incluye:

- un ejecutor Playwright que exige una URL autorizada, conserva CSP, comprueba API y cronología crítica, realiza rondas de almacenamiento descartables, inspecciona errores JS/CSP, nombres accesibles, IDs, `alt`, skip-link y árbol de accesibilidad; opcionalmente verifica byte a byte los 160 archivos remotos;
- una plantilla de ocho pruebas manuales con lector de pantalla, teclado, zoom, reflow, alto contraste/forced colors y reduced motion;
- una plantilla de entorno;
- una plantilla Moodle separada para iframe, aislamiento de curso, scope de almacenamiento, estabilidad de rutas, `frame-ancestors`, XFO y medios;
- preparador de retorno con escaneo de secretos y rechazo de placeholders;
- adjudicador fail-closed vinculado al árbol C6.1.

El arnés sintético de esta nueva admisión supera 16/16 casos: espera sin retorno, PASS web, rechazo sintético en modo real, identidad errónea, FAIL/BLOCKED de navegador, FAIL/BLOCKED manual, PASS/FAIL Moodle, ausencia de evidencia Moodle, exigencia de identidad completa de 160 archivos, manipulación de hash, path traversal, secretos y placeholders.

Un PASS de navegador/accesibilidad o Moodle **no promueve automáticamente A3**: R04 (revisión científica de M16) y R05 (revisión de las 45 fichas heredadas) permanecen abiertas.

## 7. Puertas abiertas

Permanecen pendientes:

1. ejecución del browser gate contra una URL A3-C6.1 realmente autorizada, con `--verify-all-files`;
2. prueba manual con lector de pantalla y teclado en entorno representativo;
3. prueba Moodle A3 mediante la nueva identidad, no mediante una falsa reutilización de R93;
4. revisión científica independiente de M16;
5. revisión científica de las 45 fichas `LEGACY_UNREVIEWED`;
6. recuperación de la suite histórica ejecutable de 660 casos o definición transparente de una cobertura sustitutiva, sin declararla equivalente.

## 8. Dictamen

**C6.1 pasa como preparación y reparación local, pero A3 sigue en NO-GO.**

`A3_C6_1_STATIC_ACCESSIBILITY_REPAIR_PASS__LOCAL_REGRESSIONS_PASS__A3_EXTERNAL_RETURN_GATE_READY__BROWSER_NETWORK_BLOCKED_LOCALLY__R93_PRESERVED_NOT_DIRECTLY_APPLICABLE__SCIENTIFIC_AND_EXTERNAL_VALIDATION_PENDING__NO_GO`

El siguiente nodo secuencial es **A3-C6.2 — adjudicación de retorno externo auténtico si existe; en ausencia de retorno, cierre de la preparación externa y paso a las revisiones científicas R04/R05 sin fabricar resultados**.

## 9. Verificación de distribución y pruebas negativas

La distribución se verifica en modo rápido mediante extracción independiente, manifiesto exacto, hashes/tamaños, identidades C5.3/R93, evidencias de regresión y estados NO-GO. La reproducción profunda permanece disponible mediante `tools/verify-package.py --full`, pero no se usa como requisito de la comprobación rápida porque repite las 225 pruebas y puede exceder los límites de algunos entornos.

El verificador se somete además a cinco pruebas negativas: manipulación de `runtime/index.html`, promoción del manifiesto a `GO`, eliminación del paquete R93, adición de un archivo inesperado y path traversal ZIP. Todas deben ser rechazadas. La evidencia negativa se conserva fuera del ZIP final para evitar un ciclo de autorreferencia de empaquetado.
