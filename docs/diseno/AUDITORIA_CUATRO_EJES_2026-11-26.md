# Auditoría científica, técnica, didáctica y visual · PaleoBot · 26-11-2026

Alcance: `main` en `d69c5ce` (tras las PR n.º 21 a n.º 24). Superficies: portada Sylva, atlas interactivo (31 vistas), recorrido (11 páginas), consulta ligera y entrada DEA, a 390 y 1366 px, en Chromium sin red externa. Destinatario principal: alumnado del Diploma de Estudios Africanos (DEA, ULPGC). Esta auditoría no modifica código.

**Limitaciones declaradas.** No se han hecho pruebas con alumnado, lector de pantalla, Safari, Firefox ni dispositivos reales. La red externa estaba bloqueada: no se comprobaron teselas, imágenes remotas ni la resolución de DOI en línea. Las afirmaciones científicas marcadas «por comprobar» proceden de conocimiento previo y no se han contrastado con la fuente primaria; las marcadas «comprobado» se verificaron mediante búsqueda de los registros editoriales. No sustituye la revisión experta humana.

Gravedad: **A** corregir pronto; **M** mejorar; **B** opcional.

## 1. Auditoría técnica

**Qué funciona.** Verificador del repositorio 91/91; 98 pruebas unitarias; `construir.py --check` correcto. Axe (wcag2a, wcag2aa, wcag21aa y buenas prácticas): 0 violaciones en las 16 páginas, a 390 y 1366 px. Ningún error de página ni de consola propio; `lang="es"` en todas; ninguna imagen sin `alt` ni rota; sin desbordamiento horizontal salvo una herramienta interna (T-6). Enlaces internos: 0 rotos reales (dos coincidencias son plantillas de JavaScript). La entrada DEA mantiene una CSP estricta (`script-src 'self'`, `connect-src 'none'`). Peso de las páginas del recorrido: 64-116 KB; consulta ligera 271 KB; DEA 382 KB.

| N.º | G. | Hallazgo | Evidencia |
|---|---|---|---|
| T-1 | M | **Carga inicial pesada del atlas**: 199 peticiones y unos 7,6 MB, de los cuales cerca de 3,5 MB son cinco JPEG de la portada del atlas (`climate.jpg` 1,65 MB, `hero.jpg` 0,86 MB, `classroom.jpg` 0,55 MB…) y `002-script.js` 1,27 MB. En red lenta o móvil de datos penaliza al alumnado del DEA. | Registro de respuestas de Chromium |
| T-2 | M | **El atlas intenta abrir terceros al cargar** (imágenes de Wikimedia y teselas de ArcGIS); con la red bloqueada produce cuatro errores de recurso. Sigue abierta la consulta de protección de datos (D4). | `atlas/index.html`; CSP `img-src` |
| T-3 | B | CSP del atlas con `style-src 'unsafe-inline'`; 232 usos de `innerHTML`; recorrido, consulta ligera y raíz sin CSP. | `atlas/index.html`; búsqueda en `assets/js` |
| T-4 | B | Varios `<h1>`: cinco en el atlas y diez en la entrada DEA. Axe no lo marca, pero afecta a la navegación por encabezados. | Recuento en el DOM |
| T-5 | M | Objetivos táctiles menores de 24 px (conteo indicativo, incluye enlaces en línea, que la norma exceptúa): consulta ligera 158-188; cronología del recorrido 63-66; territorio 32-51; DEA 29-39. | Medición con `getBoundingClientRect` |
| T-6 | B | `recorrido/medir-rendimiento.html` desborda a 390 px (`fieldset` y `select`). Es una herramienta interna. | Medición a 390 px |
| T-7 | B | El enlace profundo `atlas/index.html?view=<id>` coloca la vista solo con el ancla `#main-content`; sin ella queda la portada del atlas (no probado con todos los identificadores). | Prueba con `?view=africa` |

## 2. Auditoría visual

**Qué funciona.** La paleta «Azul profundo y arena» es coherente en todas las superficies: portada en gris oscuro, atlas en papel con barra azul profundo, recorrido en azul oscuro, DEA y consulta ligera en arena. Jerarquía clara (kicker, título, pregunta guía, contenido); etiquetas de incertidumbre siempre con texto; créditos visibles en la imagen principal. A 390 px la portada del atlas, la consulta ligera y la entrada DEA se reordenan a una columna sin solapes.

| N.º | G. | Hallazgo |
|---|---|---|
| V-1 | M | **Texto muy pequeño en tarjetas y metadatos del atlas** (rótulos y datos secundarios de tamaño estimado en 11-12 px en las capturas a 1366 px). Observado en capturas; no medido de forma sistemática. Es un riesgo para lectores de mayor edad. |
| V-2 | M | Un solo recorrido de unos 4200 px separa la portada del atlas de la primera vista de trabajo; para el DEA convendría enlazar siempre desde su entrada a la herramienta con ancla (ligado a T-7). |
| V-3 | B | A 390 px, el nombre de la vista en la barra superior del atlas se recorta («Vistas ▾ Explor…»), y la navegación de la entrada DEA oculta pestañas a la derecha (se desplaza horizontalmente). |
| V-4 | B | El simulador de dispersión dibuja continentes esquemáticos; conviene un rótulo visible de «mapa esquemático» para que no se lea como cartografía. |
| V-5 | B | El selector «Nivel Doctorado» del atlas no se explica y puede resultar ajeno al alumnado del DEA. |

## 3. Auditoría científica

Método: comparación de las cifras de cabecera del catálogo de la consulta ligera (`src/entrada_ligera/catalog.json`, 50 registros) con la base del atlas (`002-script.js`) y con el texto de las fichas; contraste de tres referencias con sus registros editoriales.

| N.º | G. | Hallazgo | Evidencia / estado |
|---|---|---|---|
| C-1 | A | **Fuente de datos divergente.** En 8 de 50 taxones, la cifra de cabecera de `catalog.json` es anterior a la que muestra el atlas: *Pierolapithecus* 12,5 Ma frente a ~11,9 Ma; *Sahelanthropus* 7,0 frente a 7,2-6,8 Ma; *Au. africanus* 2,5 Ma frente a 3,6-2,1 Ma (en debate); *H. erectus* 1,5 Ma frente a ~2,0 Ma-110 ka; *H. cepranensis* 900-450 frente a ~430-385 ka; *H. rhodesiensis* 400 frente a ~300 ka; Omo I 195 ka frente a ≥233 ka; *H. floresiensis* 50 frente a ~100-60 ka. Las superficies visibles ya usan los valores revisados y sus fichas citan Grün et al. (2020), https://doi.org/10.1038/s41586-020-2165-4 (299 ± 25 ka para Kabwe 1) y Vidal et al. (2022), https://doi.org/10.1038/s41586-021-04275-8 (edad mínima de Omo I); ambos registros **comprobados** por búsqueda. El riesgo es que una regeneración desde `catalog.json` reintroduzca los valores antiguos (pendiente A5, fuente única). | Comparación programática; no se verificó la cifra de *Pierolapithecus* ni la de *Sahelanthropus* en su fuente |
| C-2 | M | **Localidad de *Dryopithecus*: «África y Europa».** El holotipo es de Saint-Gaudens (Francia) y la propia ficha lo describe como europeo «con posibles vínculos africanos». No conozco un registro fósil africano de *Dryopithecus*; **por comprobar** y, si procede, corregir la localidad. | Ficha de la consulta ligera y `002-script.js` |
| C-3 | M | **Métodos de datación simplificados** (por comprobar): *H. erectus* «U-Series» (el rango largo se apoya en otras técnicas); neandertales «14C» para 400-40 ka (el radiocarbono solo cubre las fechas más recientes); *H. naledi* «OSL» (la datación publicada combina varias técnicas). Un único método por taxón induce a error. | Campo `datacion` del catálogo |
| C-4 | M | **Valores puntuales para rangos largos** (*rudolfensis* 2,4 Ma, *ergaster* 1,8 Ma, *robustus* 1,8 Ma, *boisei*). Ya figuraba como S2; las etiquetas de la consulta ligera («Ventana publicada», «Estimación puntual», «Edad mínima») mitigan el problema donde se muestran. | `catalog.json`, ligera |
| C-5 | M | **Etiqueta de debate incompleta.** Solo 5 taxones figuran como «debatida» y 2 como «revisión»; fichas como *H. bodoensis* (propuesta taxonómica de 2021 «no consenso cerrado» según su propio texto), *H. cepranensis*, *H. georgicus*, *Au. prometheus* o *H. rhodesiensis* describen controversia sin la etiqueta correspondiente en el catálogo. | `catalog.json`, textos de `experto.debate` |
| C-6 | M | Pendientes anteriores sin cambio: revisión experta humana de las fichas (S6, alta), DOI de *Au. prometheus* que corresponde a otro artículo (S7, marcado), vista climática con PAGES 2k a escala inadecuada (S4), comprobación de que cada cita respalda lo que afirma el texto (S1). **Hoy no se ha vuelto a resolver ningún DOI en línea.** | `auditorias/paleobot-pendientes.md` |

## 4. Auditoría didáctica

**Qué funciona.** Tras la retirada de la capa no universitaria y de las etiquetas LOMLOE, el recurso es coherente con su destinatario: preguntas guía en cada vista, sesiones del DEA con pregunta, pasos y producto («Para su trabajo»), distinción entre dato, inferencia y opinión, cuaderno privado y sin envío de datos, consulta ligera y vía sin JavaScript. El recorrido de Aula se limita ya a rutas universitarias.

| N.º | G. | Hallazgo |
|---|---|---|
| D-1 | B | **Restos de la capa docente en la vista Aula del atlas**: el texto del Centro docente aún dice «diseñar situaciones de aprendizaje» y «preparar clases» sin que exista el generador; quedan botones «Preparar clase» y «Exportar guía docente TXT». Conviene ajustar la redacción. |
| D-2 | M | Siguen abiertos M-1 a M-4 de la auditoría didáctica de esta mañana: Repaso que solo evalúa recuerdo; rúbrica opcional de cuatro niveles; duración orientativa e itinerario rápido; trato de «usted» frente a «tú». |
| D-3 | M | **Carga cognitiva de entrada al atlas**: portada de gran tamaño, 31 vistas, varios `<h1>` y datos secundarios en tipografía pequeña (T-4, V-1, V-2). Para el DEA, la entrada recomendada debe ser la propia entrada DEA y la consulta ligera, con enlaces profundos fiables. |
| D-4 | A | **Sigue sin haber evidencia de eficacia** (pilotos, SUS, tiempo en tarea) ni revisión experta. Todas las valoraciones de este informe son de diseño; el criterio de uso docente permanece en NO_GO hasta el piloto. |

## 5. Prioridades propuestas

1. **C-1:** alinear `catalog.json` con la base del atlas (o generar ambos desde una sola fuente) y añadir una comprobación al verificador que detecte divergencias de cifras de cabecera.
2. **C-2, C-3, C-5:** revisar localidad de *Dryopithecus*, métodos de datación y etiquetas de debate con la fuente primaria.
3. **T-1 y T-2:** reducir los JPEG de la portada del atlas (formatos y tamaños adaptados) y aplazar la carga de terceros hasta que se necesiten.
4. **V-1 y T-5:** medir el tamaño mínimo de letra y los objetivos táctiles, y corregir los más pequeños de la entrada DEA y la consulta ligera.
5. **D-1 y D-2:** limpiar la vista Aula; añadir preguntas de interpretación al Repaso y la rúbrica opcional.
6. **D-4:** piloto con alumnado del DEA y revisión experta de las fichas africanas.

## 6. Referencias comprobadas

- Grün, R. et al. (2020). Dating the skull from Broken Hill, Zambia, and its position in human evolution. *Nature*, 580, 372-375. https://doi.org/10.1038/s41586-020-2165-4 (registro editorial localizado por búsqueda).
- Vidal, C. M. et al. (2022). Age of the oldest known *Homo sapiens* from eastern Africa. *Nature*, 601, 579-583. https://doi.org/10.1038/s41586-021-04275-8 (registro localizado por búsqueda).
- Sutikna, T. et al. (2016). Revised stratigraphy and chronology for *Homo floresiensis* at Liang Bua in Indonesia. *Nature*, 532, 366-368 (registro localizado por búsqueda; DOI por comprobar antes de citarlo).
