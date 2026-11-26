# Registro de cambios

## Legibilidad y objetivos táctiles · 26/11/2026

Tanda 4 del plan de acción (V-1, T-5, T-4, V-3). Nuevo `scripts/atlas/medidas-legibilidad.cjs` (letra menor de 12 px, objetivos menores de 24 px, `<h1>` visibles y enlaces al atlas sin ancla, a 390 y 1366 px).
- **Letra:** 37 elementos de la portada del atlas por debajo de 12 px pasan a 12 px (hoja aditiva `95-sistema/atlas-sistema.css` y dos rótulos en línea de `atlas/index.html`). Tras el cambio: 0.
- **Objetivos táctiles:** las seis casillas de sesión del DEA pasan de 20 a 24 px. Queda el enlace vertical «Cronología» de `portada-sylva.html` (15 px de ancho), página de diseño cerrado que no se modifica en esta tanda.
- **`<h1>`:** el recuento inicial (5 en el atlas, 10 en el DEA) contaba los ocultos; en pantalla solo hay uno visible por página, así que no se cambia el marcado.
- **Enlace:** «Atlas completo» de la entrada DEA lleva `#main-content`.
- **Barra del atlas en teléfono:** el nombre de la vista (p. ej. «Árbol consenso») se muestra bajo «Vistas» en lugar del truncado «Interp…»; en pantallas anchas no cambia.
- axe (WCAG 2.2 AA) 0 violaciones y sin desbordamiento horizontal en ocho páginas × 2 anchos. Estados previos en `docs/historial/PB_GH_11m/`.

## Peso de las imágenes de la portada del atlas · 26/11/2026

Tanda 3 del plan de acción (T-1). Los seis JPEG de `atlas/assets/media/landing/` se recomprimen sin cambiar dimensiones ni contenido: de ~4,1 MB a ~1,2 MB en total. La imagen principal admite `srcset` (`hero-800.jpg` 800 px y `hero.jpg` 1600 px, `sizes="100vw"`), de modo que el teléfono descarga ~72 KB en lugar de ~295 KB. Originales conservados en `docs/historial/BASE_4D320EE/`; procedencia registrada. Pendiente: carga diferida de terceros (D4) y compresión de JS/CSS, que depende del servidor (Pages ya sirve con gzip).

## Método de datación de *Homo naledi* · 26/11/2026

Propuesta P-1 de la tanda 2, aprobada por la titular. En el atlas, el método de *H. naledi* pasa de «OSL» a «Múltiples (ESR, U-Series, OSL, paleomagnetismo)» (Dirks et al., 2017, https://doi.org/10.7554/eLife.24231: US-ESR en dientes, U-Th y paleomagnetismo en flowstones, OSL en sedimentos; 335-236 ka). El panel de método muestra ahora cinco perfiles. Estado previo en `docs/historial/PB_GH_11k/`.

## Prueba de las cifras cronológicas de la consulta ligera · 26/11/2026

- Nueva `tests/test_cifras_cronologicas.py`: la consulta ligera toma sus cifras de `chronology.records`, no del campo heredado `anos` del catálogo original (cuya huella está protegida); falla si `build.py` o `interaccion.js` lo usan, si una ficha carece de cronología revisada o si dejan de mostrarse las cifras revisadas de Kabwe 1 (299 ± 25 ka), Omo I (233 ± 22 ka) y *H. floresiensis* (~100-60 ka).
- Sin cambios en datos ni en código de la aplicación.

## Sin etiquetas «Competencias LOMLOE» · 26/11/2026

Decisión de la titular: las etiquetas de competencias clave no son pertinentes para el alumnado universitario y eran una heurística sin respaldo curricular (auditoría didáctica A-3).
- `059-script.js`: el panel de activación de cada vista ya no muestra el bloque de competencias (queda «Siguiente recomendado»).
- `060-script.js`: la síntesis de sesión pierde el contador y la sección de competencias, la línea del .txt y la frase del diagnóstico.
- `007-paleobot-v34-layer.js`: la introducción del examen ya no menciona competencias LOMLOE.
- Sin cambios en Bloom, familias de vistas ni datos. El campo `competenciasLOMLOE` de `058-script.js` queda inactivo. Procedencia con estado previo en `docs/historial/PB_GH_11j/`.

## Retirada del código de la capa docente no universitaria · 26/11/2026

Continuación de la entrada siguiente: el código heredado deja de estar en el repositorio.
- `002-script.js`: se elimina el generador de situaciones de aprendizaje (bloque «MEJORA 5») y su llamada en la vista Aula; con él desaparecen las citas erróneas a los «Decretos 82/2022 y 83/2022».
- Se elimina `50-aula/064-paleobot-v66-sa-session.js` (sesión de SA) y se retira de `index.html` y del manifiesto IMS; se eliminan los estilos `.sa-gen-*` de `001-style.css`; los comentarios de `040` y `058` ya no citan decretos.
- Procedencia: estado previo en `docs/historial/PB_GH_11i/` y `BASE_4D320EE/`; entradas en `PB_GH_11_CORRECCIONES.json`.
- Quedan sin cambios `experimental/atlas-r98/` (evidencia histórica) y los scripts 044, 059 y 060 (sin citas normativas; las etiquetas «Competencias LOMLOE» de 059/060 siguen como pendiente).

## Sin «Modo clase» ni capa docente no universitaria · 26/11/2026

Decisión de la titular: el atlas no ofrece «Modo clase» ni contenidos dirigidos a Primaria y a ESO/Bachillerato.
- Nueva capa aditiva `95-sistema/sin-capa-no-universitaria.{js,css}`: retira los cinco botones «Modo clase» (la tarjeta «Enseñar» pasa a «Aula»), el generador de situaciones de aprendizaje de 4.º ESO y Bachillerato, la tarjeta «Educación Primaria» de los itinerarios, las tarjetas del centro docente dirigidas solo a ESO/Bachillerato, los rótulos de etapa en las mixtas y las líneas del diagnóstico que dependían de ello.
- `atlas/recorrido/aula.html`: se retiran el marco normativo, la situación de aprendizaje de Primaria y sus referencias; quedan las tres rutas universitarias y la autoevaluación.
- El código heredado no se edita (sigue en 002-script.js y 040-064, sin efecto visible); procedencia registrada con estado previo en `docs/historial/PB_GH_11h/`.
- Resuelve de paso los hallazgos A-1 a A-3 de la auditoría didáctica en lo que afecta al alumnado. Quedan prosa y datos con menciones sueltas a ESO/Bachillerato dentro de algunas tarjetas.

## Auditoría didáctica del conjunto · 26/11/2026

Se añade `docs/diseno/AUDITORIA_DIDACTICA_2026-11-26.md`: encuadre, lo que funciona y once hallazgos. Los tres de mayor gravedad son normativos: el atlas cita «Decreto 82/2022 y 83/2022 de Canarias» para ESO y Bachillerato (el currículo vigente es el Decreto 30/2023, por confirmar en el BOC); la situación de aprendizaje de Primaria sitúa en el tercer ciclo contenidos de Prehistoria, que el Decreto 211/2022 asigna al segundo; y el nivel de ESO/Bachillerato del generador se deduce de Bloom, no del currículo. Sin cambios de código: las correcciones quedan a la espera de decisión.

## Paleta «Azul profundo y arena» en todo el conjunto · 26/11/2026

Decisión de la titular: cambiar la paleta de atlas, recorrido, consulta ligera, entrada DEA y portada Sylva.
- `assets/paleobot-base.css`: tokens nuevos (claro: arena #f6f1e6, tinta #0d1b2e a 15,37:1, acento azul petróleo #0a5568; oscuro azul profundo #0f1a28; proyección; foco ocre oscuro #9a4f00 para distinguirlo del acento). Ocre solo para avisos de incertidumbre.
- Atlas: puente de tokens, pizarra y contrastes en `95-sistema`; nueva hoja aditiva `paleta.css` para la portada del atlas (botón, subtítulo, barra «Ir directamente») y colores en línea de `atlas/index.html`; costas del mapa.
- Recorrido: la pizarra pasa a azul profundo. Consulta ligera regenerada con el bloque de tokens sincronizado.
- `docs/diseno/SISTEMA.md` con los valores y contrastes calculados; pruebas de diseño actualizadas; correcciones de procedencia (`atlas/index.html`, `atlas/recorrido/integracion.css`, `ligera/index.html`, copias en `docs/historial/PB_GH_11g/`).
- Sin cambios de contenido, estructura ni scripts. Colores de clados y series sin tocar (pendiente de revisión visual por vista).

## Auditoría del estado final de `main` · 26/11/2026

Se añade `docs/diseno/AUDITORIA_MAIN_2026-11-26.md`: controles de gobernanza (91/91, 98 pruebas), humo con 0 pérdidas, axe sin violaciones en las 31 vistas del atlas, el recorrido, `ligera/`, `dea/` y la portada, y el hallazgo sobre el despliegue de Pages. Solo documentación. Retorno: revertir este commit.

## Franja «Consulta y filtros»: la búsqueda como única acción principal · 25/11/2026

Decisión de la titular. «Limpiar filtros» y «Filtros avanzados» pasan a acciones de texto (sin borde ni relleno, subrayadas, tinta secundaria 7,3:1) con el mismo
objetivo táctil de 44 px; «Filtros avanzados» abierto recupera su aspecto de acento. Cambio solo de CSS en `95-sistema/consulta.css`. Axe (WCAG 2 A/AA)
sin violaciones en la barra de Estratigrafía, Clima, Constructor y Aula a 390 y 1366 px. Retorno: revertir este commit.

## Partición de *H. erectus* incorporada a la consulta ligera · 25/11/2026

Decisión de la titular. `soloensis` (catálogo) y `erectus_soloensis` (atlas) son la misma entrada; las dos de diferencia eran `erectus_erectus` y `erectus_pekinensis`.
`ligera/` las lista ahora en la sección «Subespecies de *Homo erectus* sin ficha ampliada», con los datos del atlas (rango, región, cautela) y su fuente
(Wood y Boyle, 2016, https://doi.org/10.1002/ajpa.22902), y el resumen pasa a «52 entradas: 50 fichas + 2». `catalog.json` queda intacto. Sin imágenes ni descripciones nuevas.
Cambios: `src/entrada_ligera/build.py` (datos copiados del atlas), `ligera/index.html` regenerado, `tests/test_subespecies_ligera.py` (los datos siguen siendo los del atlas).
Retorno: revertir este commit.

## Manifiesto IMS completo y bien formado · 25/11/2026

`atlas/imsmanifest.xml` cerraba `</resource>` antes de las 10 entradas de la portada (fuera del recurso, no válido para IMS) y no listaba 66 ficheros de `atlas/`
(sistema `95-sistema`, Leaflet, guardas). Ahora hay un único recurso con 243 ficheros, todos existentes; se conservan el BOM y los saltos CRLF.
Alcance: solo el empaquetado. La subida a Moodle sigue sin probarse ni documentarse (decisión de PB-GH-06). Retorno: revertir este commit.

## Introducción: rótulos de los diagramas a 12 px o más en teléfono · 25/11/2026

En pantallas de menos de 40 rem los rótulos SVG (20 y 26 unidades de viewBox) pasan a 34 unidades por CSS, y el rótulo de escena tiene un suelo de .75 rem.
Medida a 390 px: ningún texto bajo 12 px; sin solapes. Retorno: revertir este commit.

## Portada Sylva: texto a 12 px o más · 25/11/2026

Rótulos del dock, lema, cifras y botón «Explorar el atlas» con suelo de 12 px (antes 8–11 px en teléfono). Medida a 390 y 1366 px: ninguno bajo 12 px.
Sin cambios en `cronologia.html` (los `button.barra-taxon` tienen `font-size: 0` a propósito, el texto lo da la etiqueta contigua). Pendiente:
los diagramas SVG de `introduccion.html` en teléfono (7,5–9,7 px por escalado del viewBox), por ser una narración a pantalla completa. Retorno: revertir este commit.

## Recorrido: identidad visual del sistema (pizarra) · 23/11/2026

Decisión de la titular (opción A): el recorrido deja su petróleo y su oro propios y adopta la pizarra del sistema (#161a19, tinta #ecebe6,
acento #f0a77c, foco #8ab4f8), los mismos valores que el oscuro de `assets/paleobot-base.css` y la barra de trabajo del atlas. Cambio en
`atlas/recorrido/integracion.css`; además, el rótulo «antiguo» del eje de Parentesco ya no se solapa con el encabezado de la primera columna.
Evidencia: axe (WCAG 2 A/AA) sin violaciones en las 11 páginas a 390 y 1366 px. Procedencia: `PB_GH_11_CORRECCIONES.json`, estados anteriores en
`docs/historial/PB_GH_11b/`. Quedan dos superficies con fondo propio (póster de la introducción y portada Sylva). Retorno: revertir este commit.

## Teléfono: «Pregunta guía» más compacta · 23/11/2026

Cambio: en pantallas de menos de 48 rem, la pregunta guía pasa de 17 a 15 px y de interlínea 1,6 a 1,5 (`cabecera.css`); no se quita texto.
Evidencia (`primer-dato.cjs`, teléfono): mediana 757 → 738 px y vistas con el primer dato bajo el pliegue 12 → 11. Humo de teléfono sin terceros:
0 pérdidas; axe (WCAG 2 A/AA) sin violaciones en Constructor, Estratigrafía, Clima, América y Aula a 390 y 1366 px.
Documentación: `docs/atlas-v1/README.md` explica la diferencia 52/50 (partición subespecífica de *H. erectus*; sigue pendiente decidir si el catálogo la incorpora).
Retorno: revertir este commit.

## Recorrido: rótulos de Parentesco y Territorio a 12 px o más · 23/11/2026

Motivo: 52 rótulos de Parentesco (11,7 px en escritorio, 3,8 px en teléfono) y la retícula de Territorio quedaban por debajo de 12 px.
Cambio: tamaños en unidades del viewBox y anchura mínima del lienzo (1 100 y 940 px) con desplazamiento horizontal propio en pantallas
estrechas. Evidencia: medida del tamaño renderizado; ningún rótulo bajo 12 px y sin desbordamiento de página. Procedencia:
`PB_GH_11_CORRECCIONES.json` con los estados anteriores en `docs/historial/PB_GH_11/`. Retorno: revertir este commit.
No tocado: el rótulo «antiguo» del eje de Parentesco se solapa con el encabezado de la primera columna (preexistente).

## Cabecera de vista: dos defectos de aplicación · 23/11/2026

Motivo: la medida del primer dato mostró cabeceras desmesuradas. Causas, ambas en `95-sistema/cabecera.{js,css}`:
(1) la vista «constructor» coincidía con `Object.prototype.constructor` en un mapa `{}` y su desplegable «Cómo usar esta vista»
se abría desde el principio (primer dato a 1 160 px); (2) la «Pregunta guía» recuperaba borde y relleno de tarjeta por una
regla posterior de igual especificidad. Cambio: `Object.create(null)` y `:not(.pb-cv-pregunta)`. No se elimina nada.
Evidencia (`primer-dato.cjs`): escritorio, mediana 543 → 512 px y vistas bajo el pliegue 7 → 4; teléfono, 796 → 757 px y 13 → 12;
Constructor 1 160 → ~330 px. Humo de escritorio sin terceros: 0 pérdidas frente a la línea base; `verificar_repo` 91/91; 96 pruebas OK.
Retorno: revertir este commit.

## Medida del primer dato de cada vista · 23/11/2026

Motivo: la ronda PB-GH-11 daba por resuelto que «el dato entra en el primer pantallazo» y el humo no lo medía.
Evidencia: `scripts/atlas/primer-dato.cjs` (mediana 543 px de 768 en escritorio y 796 px de 844 en teléfono; 7 de 30
y 13 de 30 vistas con el primer dato bajo el pliegue). Cambio: script informativo, nota en `AUDITORIA_PB_GH_11.md`
§ 10 y en `SISTEMA.md`. Impacto: solo documentación y arnés; no cambia el atlas. Retorno: revertir este commit.

## PB-GH-11 · Atlas interactivo: auditoría y rediseño · 13-19/11/2026

Ronda sobre `atlas/index.html` y `atlas/assets/` para el alumnado del Diploma de Estudios
Africanos, en la rama local `feat/pb-gh-11-atlas` (sin publicar; puerta en NO_GO). No se
elimina contenido, función ni vista: lo nuevo vive en `atlas/assets/{css,js}/95-sistema/`,
enlazado al final, y reubica o pliega lo existente; lo que cambiaría el modelo de
navegación queda como propuesta. Informe clasificado por impacto, con la tabla de corrección
(34 filas de partida y 28 hallazgos posteriores), evidencia y decisiones pendientes:
`docs/diseno/AUDITORIA_PB_GH_11.md`.

- Bloqueantes: sin red de Wikimedia, abrir una ficha ya no dispara un bucle de 120-209
  peticiones de imagen por segundo (respaldo local y un solo intento por imagen); el botón
  «Comenzar clásico» de la autoevaluación se ve (1,08:1 → 7,7:1); los diálogos dejan de
  abrirse con `aria-hidden="true"`.
- Navegación y lectura: barra de trabajo fija de 56 px (antes 950 px en el teléfono) con un
  panel «Vistas» que muestra las mismas 4 familias y 31 vistas; cabecera de vista con título
  y pregunta guía, y el resto plegado en «Cómo usar esta vista»; franja «Consulta y filtros»
  compacta; al elegir una vista, su título queda a 156-186 px del borde (antes 423-935 px).
  Ficha como página de manual, Cronología, Mapa y África, Comparador, Bibliografía y Glosario
  y vistas de gráficos reorganizados sin cambiar su contenido.
- Foco y accesibilidad: cada diálogo recibe el foco, lo retiene y lo devuelve; un solo anillo
  de foco azul (≥ 5,1:1); contraste de texto sin infracciones axe en las 31 vistas; regiones
  desplazables con foco; sin anidamiento interactivo; rótulos sin emoji (el texto se conserva);
  aviso y alternativas sin JavaScript; sin saltos de maquetación al cargar (CLS de carga 0,99-1,67 →
  0-0,05), a costa de un primer pintado unos 0,5 s más tardío en servidor local.
- Sin terceros de fuentes ni de scripts: Lexend local por `assets/paleobot-base.css` (el
  atlas ya consume el sistema «Papel y tierra»), Leaflet 1.9.4 alojado en
  `atlas/assets/vendor/leaflet/` con su procedencia, imagen principal de 47 taxones desde
  `img/taxones/` y fondo local de costas (Natural Earth, dominio público) para el mapa. CSP con
  `script-src 'self'`; `style-src` conserva `'unsafe-inline'` (propuesta).
- Funciones que fallaban desde la importación y ahora responden: simulador de dispersión,
  Banco de recursos, Diagnóstico, exportar SVG del constructor, lente «Todos los focos» y los
  enlaces `?view=` (31 vistas, y llevan a la vista, no a la portada).
- Red de seguridad: arnés del atlas en `scripts/atlas/` (humo comparable, tormenta de
  peticiones, recorrido, estados) y línea base de `c971001` en `docs/diseno/atlas/linea-base/`;
  cada tanda cerró con 0 pérdidas en escritorio y teléfono, con y sin terceros simulados.
- Verificador: 7 comprobaciones nuevas (enlaces de `95-sistema` y `carga-fin.css` último;
  CSP del atlas sin relajar; `95-sistema` sin manejadores en línea, `eval`, escuchas en
  captura ni hosts nuevos; lista blanca de `?view=`; imágenes locales y costas generadas),
  más la procedencia de los archivos de gobierno, con 21 pruebas. Procedencia en
  `provenance/PB_GH_11_CORRECCIONES.json`; `docs/diseno/SISTEMA.md` ampliado al atlas.
- Pendiente de la titular: capa «Topográfico» fuera de la CSP, QR de la ficha académica, MIS 8
  ausente en el simulador, mapa de África esquemático, nivel por defecto, lente inicial del
  mapa y la licencia de Leaflet, que la documentación describe como MIT y es BSD de 2 cláusulas
  (corregida en la T7).
- Tanda de arreglos tras la verificación independiente (T7, 20/11/2026): abrir y cerrar
  «Vistas» ya no desplaza la página (subía 388-426 px por vez); el salto al contenido deja la
  franja arriba y la vista debajo; Filogenia alcanzable en teléfono y tableta; regiones
  desplazables con foco y nombre en la ficha y los diálogos, orden de encabezados, ARIA de
  Síntesis, Guía, Matriz y Búsqueda global y dianas táctiles de 24 px en Clima
  (`accesibilidad-contenido.js`); contraste de Síntesis y de la pestaña «Clima» de la ficha por
  tokens. Tres pasos nuevos del humo (`panel.lectura`, `salto.destino`, `recortes.vistas`).
  Leaflet descrito con su licencia real (BSD de 2 cláusulas) y política de privacidad del atlas
  con una sección fechada de sus contactos de red actuales. Quedan 3 nodos ARIA del Comparador
  (exigen cambiar el marcado de `002`) y, para la titular, el pie de *afarensis* y los 20
  taxones con otra fotografía. Tras la reverificación: «Ver el gráfico entero» ya no baja los
  rótulos de 12 px (antes 1,2-2,6 px en teléfono) y se recorre en dos ejes; la sección de red
  de la política de privacidad dice en qué condiciones se midió; los rótulos del cladograma
  (< 12 px) quedan como propuesta, porque exigen cambiar su renderizador (resuelto en la T8).
- Decisiones de la titular (20/11/2026, tanda T8): el simulador de dispersión rotula MIS 8
  entre 300 y 243 ka (antes, «MIS 1 · Holoceno»), con los límites de la escala del propio
  atlas; la ficha académica imprimible ya no lleva la imagen QR rota ni pide nada a
  `api.qrserver.com` (la dirección se sigue imprimiendo); los 21 taxones cuya imagen local es
  otra fotografía tienen pie y texto alternativo que describen la que se ve; y los rótulos del
  cladograma miden 12 px o más, sin solapes ni nombres sobre ramas (cambio en `002`; el dibujo
  se ensancha y su caja se desplaza).
- Límites: medido en Chromium sin red de Wikimedia, teselas ni ArcGIS; sin lector de pantalla,
  Firefox, Safari ni dispositivos reales; solo modo claro; en 21 taxones la copia local es otra
  fotografía que la que citaba la ficha (desde la T8, con su propio pie). PB-01 sigue
  reproduciéndose.

## PB-GH-10 · Auditoría y rediseño de diseño de producto · 12-11-2026

Ronda de diseño para el alumnado del Diploma de Estudios Africanos. No se elimina contenido
ni función: los textos académicos (sesiones, fichas, glosario, citas, créditos y avisos) no
cambian; lo que alteraría el modelo de navegación queda como propuesta.

- Sistema común «Papel y tierra» en `assets/paleobot-base.css`: paleta clara, oscura, de
  proyección y de impresión; 7 tamaños de letra; 8 pasos de espaciado; radios 8/12/píldora;
  un solo anillo de foco; etiqueta única de incertidumbre. Titulares en Lexend local (copia
  idéntica de la que ya usaba la portada, con su licencia OFL 1.1). Descripción vigente en
  `docs/diseno/SISTEMA.md`.
- Entrada DEA: rejilla de página común; menú «Ajustes» en el teléfono; lista «Secciones»
  cuando no caben las diez pestañas; bloque «Continuar» con la sesión que toca; línea del
  tiempo como gráfico con rejilla y eje fijo; fichas en una columna que se abren como página
  de manual; mapa con puntos numerados y un recuadro ampliado del Rift; Comparar con un solo
  gráfico y la franja de coincidencia; modo proyección con más contraste (en claro y, desde
  las correcciones de la verificación, también en oscuro) y sin las notas personales a la
  vista; glosario por letras con índice. Aviso cuando no hay JavaScript o
  el navegador no permite guardar notas.
- Recorrido: la introducción ya no superpone texto bajo el póster y «Comenzar» se ve en el
  teléfono; la portada del recorrido y la página del mapa se leen sin JavaScript y al
  imprimir; Lexend local en lugar de Google Fonts; foco visible en todos los controles
  (en los nodos de los gráficos de parentesco y territorio, solo desde las correcciones de
  la verificación);
  «Atlas completo» como enlace secundario que no tapa el foco; gráficos de cronología
  legibles en el teléfono; estilos de impresión.
- Consulta ligera: los mismos tokens que la entrada DEA (sincronía comprobada por el
  verificador), foco visible y las 47 imágenes desde las copias locales de `img/taxones/`,
  con crédito y licencia íntegros.
- Portada 3D: los accesos del dock muestran su rótulo en el teléfono y la tableta (también
  «DEA») y ya no pisan el título. La escena no cambia.
- Atlas v1: tildes en dos etiquetas de la bibliografía, sin emoji en las etiquetas de la
  bibliografía ni en los chips de competencias, y un solo h1. Quedan emoji en la guía «Por
  dónde empezar», fuera del alcance de la ronda.
- Mediciones de cierre: axe-core sin infracciones en las diez vistas de DEA, las diez páginas
  del recorrido y la consulta ligera, en teléfono, tableta y escritorio; sin desbordamiento a
  320 px; ninguna petición a terceros en esas páginas. De la tabla de corrección de 40 filas,
  35 quedan hechas, 3 parciales y 2 sin hacer (`docs/diseno/AUDITORIA_PB_GH_10.md`).
- Correcciones tras la verificación independiente (13-11-2026; 2 hallazgos altos, 8 medios y
  10 bajos, todos resueltos o justificados en la § 1.1 de la auditoría): la proyección en
  oscuro dejaba el texto secundario a 1,74:1 (ahora 12,5:1); la documentación de reversión
  de los L2 era falsa para varios de ellos y se sustituye por lo comprobado (los L2 de DEA,
  salvo L2-8 y L2-9, solo se revierten en pila); el foco de las pestañas del teléfono quedaba
  bajo «Secciones»; vuelven tres frases informativas de Inicio; `#mapa/<región no africana>`
  ya no muestra «undefined»; la introducción, la consulta ligera y DEA no desbordan ni tapan
  texto con la letra al 200 % o a 320 px; la impresión del recorrido no deja texto negro
  sobre negro; y arreglos menores de foco, menús por teclado (que se cierran al salir con el
  tabulador en cualquier dirección), marcas de eje que no se pisan con la letra grande e
  índice del glosario.
- Verificador: 13 comprobaciones nuevas (sincronía de tokens, copia de Lexend, CSP y
  estructura de DEA, «solo tokens» en `dea/dea.css` (también colores con nombre, `hsl()`, el
  atajo `font:` y cualquier `color-mix()`), sin Google Fonts, imágenes locales de la ligera,
  acceso DEA de la portada, contraste de las parejas de tokens en los cuatro temas, «no se
  elimina nada» en datos, `dea/index.html` y textos informativos de `dea/dea.js`, huella de
  los archivos de `dea/` y lista cerrada de ocultaciones por CSS), con 33 pruebas.
  Procedencia en `provenance/PB_GH_10_CORRECCIONES.json`.
- Límite conocido: la consulta ligera abierta como archivo suelto, sin la carpeta `img/`,
  no muestra imágenes (copias locales por decisión de la titular); muestra en su lugar el
  texto alternativo y conserva crédito, licencia y enlace a la ficha de cada imagen.
- Límites: medido solo en Chromium con emulación de viewport y sin red de terceros. No se
  ha comprobado la portada completa con GPU real, las fuentes reales del atlas, lectores de
  pantalla, Firefox, Safari, dispositivos reales ni la pantalla completa del modo proyección
  en un proyector. Siguen pendientes, entre otros, el foco del diálogo Bibliografía del atlas
  y la inestabilidad de carga del atlas v1.

## PB-GH-09 · Fiabilidad de las fuentes: DOI y Patrimonio Mundial · 10-11-2026

Cambio aditivo: no se retira ninguna referencia.

- `scripts/comprobar_fuentes.py` y flujo manual `comprobar-fuentes.yml`: consultan Crossref,
  doi.org y las fichas de la UNESCO desde GitHub Actions (el entorno de trabajo no alcanza
  esos servicios) y dejan el resultado en `docs/fiabilidad/INFORME_FUENTES.json` y `.md`.
- Resultado: 248 DOI; 234 constan en Crossref, 1 resuelve en doi.org fuera de Crossref y
  13 no existen. Otro más (10.1002/ajpa.24122) existe, pero pertenece a un artículo
  distinto del citado. Ninguno de los 14 se usa en el recorrido ni en la entrada DEA, cuyas
  40 citas cuadran en año y primer apellido.
- `docs/fiabilidad/DOI_CORRESPONDENCIAS.json`: para 11 de los 13 DOI inexistentes, Crossref
  devuelve un registro que cuadra con la referencia (apellido, año y título); en Rendu et
  al. la fecha de Crossref es 2013 (en línea) y la cita da 2014. Quedan sin registro
  equivalente 10.2307/1477405, 10.2478/v10307-012-0015-4 y 10.1002/ajpa.24122.
- Consulta ligera y atlas: los cuatro DOI inexistentes que el alumnado llega a ver llevan
  detrás un aviso con el enlace al registro comprobado; el enlace original se mantiene. Los
  otros nueve solo figuran en comentarios del código y quedan documentados en la tabla.
- Patrimonio Mundial (sesión 5 de la entrada DEA): los años de inscripción y ampliación de
  los cinco sitios coinciden con las fichas de la UNESCO.
- Límites: es una comprobación automática de existencia y de metadatos básicos; no revisa
  que cada cita respalde lo que el texto afirma. Sigue pendiente la revisión experta.

## PB-GH-08 · Imágenes en copia local para la entrada DEA · 10-11-2026

Decisiones de la titular (10-11-2026): la raíz sigue abriendo la portada 3D y las imágenes
se alojan como copias en el sitio. Cambio aditivo.

- `img/taxones/`: 47 copias (2,7 MB) de las imágenes verificadas en
  `src/entrada_ligera/image_audit.json`, obtenidas de Wikimedia Commons como miniaturas de
  hasta 500 px. `MANIFIESTO.json` guarda huella SHA-256, tamaño, dimensiones, autoría,
  licencia y página de origen; `CREDITOS.md` lo presenta como tabla.
- `scripts/obtener_imagenes.py` (descarga y comprobación) y flujo manual
  `obtener-imagenes.yml`: el entorno de trabajo no alcanza Wikimedia, así que la descarga
  la hizo GitHub Actions en la rama y dejó las copias en un commit propio.
- Entrada DEA: cada ficha con imagen la muestra con un pie que dice qué es (molde, réplica,
  dibujo, mapa o fósil), su autoría, su licencia y su fuente; el comparador muestra las dos
  imágenes. 47 de 52 taxones tienen imagen; quedan sin ella *Anoiapithecus*,
  *Chororapithecus*, *H. gautengensis* y dos subespecies de *H. erectus*.
- `provenance/PB_GH_08_CORRESPONDENCIAS.json`: identificador del recorrido → clave del
  expediente visual (primer paso de la tabla de correspondencias entre catálogos).
- Las fichas y las sesiones abiertas por enlace ya no quedan bajo la barra de pestañas.
- Revisión: las 47 copias se miraron en hojas de contacto y coinciden con la descripción
  del expediente. Sigue sin haber peticiones a servicios externos en la entrada DEA.

## PB-GH-07 · Entrada DEA «África, cuna de la humanidad» (prototipo) · 09-11-2026

Segunda ampliación (09-11-2026, noche), sin eliminar nada:
- Uso en el teléfono: sesiones plegables con contador de progreso (la portada de la
  entrada pasa de 9,2 a 5,1 pantallas), puntos del mapa con área táctil de 24 px y rótulo
  de la región elegida, aviso de que hay más pestañas, enlaces «anterior/siguiente» e
  índice de secciones; el detalle de la región aparece junto al mapa.
- Cuaderno: cada paso tiene un espacio para notas, guardadas solo en el dispositivo, con
  descarga en un archivo de texto, borrado en dos pulsaciones e impresión.
- Repaso: ocho preguntas de autoevaluación generadas a partir de los datos (antigüedad,
  región, coincidencia en el tiempo, validez debatida), con explicación y enlace a la ficha.
- «Imagine un solo día»: equivalencia de los 7,2 Ma en 24 horas, calculada con los datos.
- Fichas con enlaces «Ver en el mapa» y «Comparar con otra especie».
- Corrección: la etiqueta «Hecha» se mostraba siempre; los destinos de las pestañas
  pasan a ser identificadores reales (axe `skip-link`).
- Portada Sylva: sexto enlace del menú, «DEA», hacia `dea/`; los cinco anteriores se conservan.
- Consulta ligera: la referencia con DOI 10.1002/ajpa.24122 se conserva y se marca como
  «no localizada; pendiente de verificación».
- Registro en `provenance/PB_GH_07_CORRECCIONES.json`.

Ampliación posterior el mismo día, también aditiva:
- Sesiones 5 («Patrimonio de la humanidad en África») y 6 («Imágenes de nuestros orígenes»)
  completas, con cinco sitios del Patrimonio Mundial, tres casos (Piltdown, Taung,
  investigación hecha desde África) y sus fuentes consultadas el 09-11-2026.
- Glosario de 359 términos, generado desde el del atlas (`scripts/generar_glosario_dea.cjs`)
  y comprobado por el verificador.
- Guía para el trabajo individual (pregunta, estructura, fuentes fiables, citas en APA 7,
  lista de comprobación) y botón «Imprimir».

Por indicación de la titular, la mejora didáctica se centra en el alumnado del Diploma
de Estudios Africanos (ULPGC), que usará el recurso en ordenador, tableta y teléfono,
con proyección opcional. Cambio aditivo: nuevo directorio `dea/`; no modifica el atlas,
la portada ni la consulta ligera.

- Inicio con seis sesiones (cuatro completas; «Patrimonio» e «Imágenes de nuestros
  orígenes» en preparación hasta comprobar sus datos), pasos enlazados, propuesta para
  el trabajo individual y marca local de «Sesión hecha».
- Línea del tiempo (solo África o todo; con o sin primates del Mioceno), mapa de África
  con Canarias (contorno Natural Earth, dominio público), fichas con fuentes y DOI,
  comparador de coexistencia, métodos y clima tomados de `atlas/recorrido/datos.js`.
- Letra ampliable, modo proyección con pantalla completa, impresión, tema oscuro,
  CSP estricta (`script-src 'self'`, `connect-src 'none'`) y ningún dato personal.
- Comprobado en Chromium a 390, 820 y 1366 px y al 200 % de zoom: axe-core sin
  infracciones A/AA, sin desbordamiento, sin errores JS ni peticiones externas.
  Pendiente: Safari/iOS, Firefox, lector de pantalla y prueba con el alumnado.

## PB-GH-06 · Sin Moodle ni IA · 01-11-2026

Por indicación de la titular se retiran las referencias a Moodle (subida e instalación)
y a la IA. Registro con motivo, evidencia, impacto, retorno y originales archivados en
`provenance/PB_GH_06_CORRECCIONES.json`.

- Atlas: fuera los botones «Preguntas con IA» (autoevaluación) y «Reconstrucción facial IA»
  (ficha); la nota «Modo offline: no usa IA ni conexión» pasa a «Funciona sin conexión».
- Atlas: las exportaciones TXT ya no mencionan Moodle.
- Consulta ligera: título «PaleoBot · Consulta ligera», sin el aviso de prueba en Moodle;
  el diagnóstico pasa a «Comprobar las imágenes».
- Documentación: se retira `atlas/LEEME-MOODLE.md` (y su entrada en el manifiesto); la
  política de privacidad pierde las secciones de IA; README, guía del atlas y protocolo
  de la portada sin instrucciones ni pruebas de Moodle.
- Se conservan: el código de las funciones generativas sin punto de entrada, la
  protección 079 que bloquea servicios externos, `CAMBIOS-v1.0.md` y las evidencias
  históricas. Sigue NO_GO (lector de pantalla y navegadores no Chromium).

## PB-GH-05 · Errores técnicos del sitio · 31-10-2026

Sin eliminar contenido, páginas ni imágenes; solo atributos, estilos de color, espacios
y manifiesto. Registro con motivo, evidencia, impacto, retorno y estados archivados en
`provenance/PB_GH_05_CORRECCIONES.json`.

- Portada Sylva: los cuatro enlaces del menú tienen nombre accesible también en móvil;
  la etiqueta del logotipo describe su destino real (recorrido guiado).
- Atlas v1.0: `body` deja de recibir `aria-selected` y la clase `active` (selector
  `[data-pb-v50-block]:not(body)` en seis módulos).
- Atlas v1.0: la limpieza de marca ya no pega palabras («comprender quiénes»,
  «de *Australopithecus*»).
- Atlas v1.0: contraste AA en 38 textos secundarios (reglas añadidas al final de
  `051-paleobot-landing-redesign.css`) y recarga forzada de los recursos cambiados.
- `imsmanifest.xml`: añade las 10 entradas de la portada Sylva (178, todas presentes).
- Resultado: axe-core 4.10.2 sin infracciones WCAG A/AA en la portada del atlas,
  la portada Sylva (1280 y 390 px), los diez documentos del recorrido y `ligera/`.
  Verificador 56/56; pruebas 20/20. Sigue NO_GO (Moodle, lector de pantalla,
  navegadores no Chromium y rendimiento en aula sin probar).

## PB-GH-04 · 25-10-2026

- Atlas v1.0, cronología heredada: ocho fichas contradecían la capa revisada o daban un
  método imposible. *H. floresiensis* «50 ka» → ~100–60 ka; neandertales «14C» para
  400–40 ka → métodos múltiples; *Au. prometheus* «U-Pb» → nucleidos cosmogénicos;
  *H. erectus* «1.5 Ma» → ~2.0 Ma–110 ka; *H. cepranensis* ~900–450 → ~430–385 ka;
  *Pierolapithecus* ~12.5 → ~11.9 Ma; *Sahelanthropus* «biocronología» → nucleidos
  cosmogénicos (7.2–6.8 Ma); *Au. africanus* «2.5 Ma» → 3.6–2.1 Ma (en debate).
- *Au. prometheus*: la ficha atribuía la edad de 3,67 Ma a U-Pb en 2022 e invertía las
  posturas (Berger como defensor de la especie). Se corrige con Granger et al. (2015),
  Walker et al. (2006), Kramers y Dirks (2017), Clarke y Kuman (2019), Berger y Hawks (2019)
  y Martin et al. (2025). Se retiran dos referencias no localizables («Berger et al., 2020»,
  DOI 10.1002/ajpa.24122, y «Sutton et al., 2023»). Año de descubrimiento: 1948 (Dart), no 2019.
- Siete taxones cuya ficha declara su validez discutida dejan de mostrarse como «aceptada»
  y pasan a «debatida».
- El formato conserva el punto decimal: `getTimeRange` no interpreta la coma.
- Estado PB-GH-03 archivado en `docs/historial/PB_GH_03/`; registro en
  `provenance/PB_GH_04_CORRECCIONES.json`. El verificador encadena las dos rondas de
  correcciones y añade 2 controles y 2 pruebas. Catálogo, capa revisada y entrada ligera sin
  cambios. Se mantiene NO_GO.

## PB-GH-03 · 25-10-2026

- Atlas v1.0: Chororapithecus deja de cargar la fotografía de la Universidad de Tokio,
  sin permiso explícito de reutilización (ya pendiente en `image_audit.json`). Se muestra
  una lámina neutra, no el sustituto por clado, que habría atribuido una foto de
  Proconsul a otro taxón.
- Atlas v1.0: la cita «Cohen et al. (2023), Episodes 46(2), DOI 10.18814/epiiugs/2023/023025»,
  no localizada, se sustituye por la que recomienda la propia tabla ICS: Cohen, Finney,
  Gibbard y Fan (2013; actualizada), Episodes 36(3), 199-204 (v2023/09). Los estadios
  isotópicos marinos se atribuyen a Railsback et al. (2015), no a la ICS.
- Los tres archivos corregidos se archivan en `docs/historial/BASE_4D320EE/`;
  `provenance/PB_GH_03_CORRECCIONES.json` recoge motivo, evidencia, impacto, retorno y
  huellas. El control del Atlas acepta solo correcciones documentadas con original
  archivado; se añaden 3 controles y 4 pruebas. Lógica, catálogo, cronología y entrada
  ligera sin cambios. Se mantiene NO_GO.

## PB-GH-02 · 24-10-2026

- Se contrasta af35a8e y se reconoce la evolución posterior hasta 4d320ee.
- Se conserva el portal Sylva, el Atlas, v11 en ligera/ y su corrección loading=eager.
- Se actualiza procedencia y se añaden pruebas de HTTP con prefijo y preservación.
- Se mantienen íntegros el Atlas v1.0 y sus 169 archivos; los documentos anteriores
  que cambian se archivan con sus hashes. Se mantiene NO_GO.


## Portada 3D Sylva del atlas · 24-10-2026

- Se incorpora `atlas/recorrido/portada-sylva.html` (escena Sylva de ThreeUI 1.2.0 adaptada
  al atlas: textos en español, cifras calculadas desde `datos.js`, botón de pausa,
  contrastes corregidos). Es aditiva: no sustituye ninguna página del atlas.
- Activos (`inner-green-assets/`) y licencias (`licencias/`) tomados del paquete npm
  `@designcodeio/threeui@1.2.0`; sus SHA-256 coinciden con el `SHA256SUMS` entregado.
- Se añade `atlas/recorrido/medir-rendimiento.html` y, en `docs/portada-sylva/`, el
  protocolo de medición, el registro CSV (vacío) y la lista de cambios recibida.
- La raíz del sitio redirige ahora a esa portada. Ruta de retorno: `atlas/` y `ligera/`.
- Pendiente: medir rendimiento en los equipos del aula (protocolo), zoom de texto
  (WCAG 1.4.4), Moodle y navegadores distintos de Chromium. Los ficheros nuevos no
  figuran en `imsmanifest.xml`; hay que añadirlos si se empaqueta para Moodle.

## La raíz abre el atlas interactivo · 24-10-2026

- `index.html` pasa a ser un portal que redirige a `atlas/` (landing interactivo v1.0).
- La entrada ligera v11 se traslada sin cambios a `ligera/index.html`; los scripts
  de verificación y construcción y las pruebas apuntan a la nueva ruta.
- Las anclas `#sp-…` de v11 pasan a `…/ligera/#sp-…`.

## Corrección: imágenes de las fichas no aparecían · 24-10-2026

- Defecto: las imágenes de la entrada v11 se cargan al abrir la ficha, pero estaban
  ocultas (`hidden`) con `loading=lazy`; Chromium no carga imágenes perezosas ocultas,
  de modo que quedaban en «cargando» sin mostrarse (reproducido en `#sp-penghu`).
- Corrección mínima: `interaccion.js` fija `img.loading = 'eager'` antes de asignar
  `src`; `index.html` se regenera con `scripts/construir.py` (única diferencia: esa línea).
- Comprobado en Chromium con la red simulada; la carga real desde Wikimedia Commons
  no se ha podido probar desde el entorno. No cambia el estado NO_GO.

## Integración del atlas v1.0 · 24-10-2026

- Se añade `atlas/` con el paquete Atlas-PaleoBot-v1.0-Moodle-IMS (169 archivos
  idénticos al ZIP recibido; huellas en `provenance/ATLAS_V1_IMPORT.json`).
- Se añade `docs/atlas-v1/` con guía visual, didáctica y científica, cuatro capturas
  y los hallazgos de la auditoría de integración.
- No se modifica el código del paquete, la entrada v11, el Atlas R98 ni la licencia.
- Sigue NO_GO para promoción docente; Moodle, lector de pantalla y navegadores
  distintos de Chromium sin ejecutar.

## PB-GH-01 · 24-10-2026

- Preparación del repositorio con entrada ligera v11 preservada, v9 de referencia
  y Atlas R98 experimental con sus fuentes.
- Importación de PB-AUD-01, 36 borradores de incidencias y decisiones de empaquetado.
- Exportación portable del inventario de 272 archivos, sin IDs/enlaces privados
  de la plataforma de origen. Se conservan sus filas y hashes disponibles.
- Construcción en carpetas temporales y comparación de los HTML generados.
- Verificación de datos, archivos, estructura, licencias de terceros y reproducción
  aislada del defecto PB-01.
- Preparación de flujo CI de solo lectura, plantillas de incidencia y revisión.

El código funcional de la aplicación se conserva. PB-01 sigue abierto. No se
ejecuta Moodle, no se valida la experiencia con lector de pantalla y no se levanta
NO_GO. La preparación de la subida no crea el repositorio remoto ni publica Pages.
