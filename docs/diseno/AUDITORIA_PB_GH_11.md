# Auditoría y rediseño del atlas interactivo · PB-GH-11

Ronda del 13 al 19-11-2026 sobre la rama local `feat/pb-gh-11-atlas`, desde `c971001` (`main`, que ya incluye
PB-GH-10). Objeto: `atlas/index.html` y `atlas/assets/` («PaleoBot, Atlas Paleoantropológico Interactivo», 31 vistas).
Destinatario: alumnado del Diploma de Estudios Africanos (ULPGC), adulto y no especialista, en ordenador, tableta y
teléfono, con proyección ocasional. Decisiones vigentes de la titular: **no se elimina nada** (contenido, funciones,
vistas); fuera Moodle y fuera IA; imágenes en copia local; sin publicación (puerta en NO_GO; sin push, PR ni fusión).

Seis tandas en serie (T1 red de seguridad y bloqueantes; T2 fundamentos; T3 diálogos y navegación; T4 rutas
principales; T5 resto de vistas y teléfono; T6 cierre), cada una verificada por el director antes de la siguiente.
Medidas: Playwright con Chromium en un contenedor **sin red de Wikimedia, teselas ni ArcGIS**; axe-core 4.10.2;
arnés propio en `scripts/atlas/` (humo comparable, tormenta de peticiones, recorrido, estados). Viewports: teléfono
390 × 844, tableta 820 × 1180, escritorio 1366 × 800 (1366 × 768 en las medidas de posición), 320 × 640 y texto al
200 % (raíz forzada, porque el módulo 054 fija la raíz con `!important`). Sistema resultante:
`docs/diseno/SISTEMA.md` (ampliado al atlas). Procedencia: `provenance/PB_GH_11_CORRECCIONES.json`.

Las cifras salen de los informes de cada tanda y de las medidas de cierre de la T6 (§ 3); cuando una cifra es de una
tanda concreta, se indica. El material de trabajo (capturas completas, JSON de medida, scripts de sonda) está fuera
del repositorio, en la carpeta de la ronda (`scratchpad/atlas11/`: `antes/`, `despues/`, `piso/T1…T6/`,
`notas/informes/T1…T6.md`); aquí se cita por ruta relativa a esa carpeta. En el repositorio queda una selección
reducida en `docs/diseno/atlas/evidencia/PB_GH_11/` (8 pares antes/después, 0,6 MB).

## 0. Resumen por impacto

| Impacto | Qué cambia para el alumnado | Filas |
|---|---|---|
| **Bloqueante → resuelto** | Abrir una ficha sin acceso a Wikimedia ya no dispara un bucle de 120-209 peticiones por segundo; el botón «Comenzar clásico» de la autoevaluación se ve; los diálogos existen para un lector de pantalla | 1, 2, 3 |
| **Alto → resuelto** | ~~El dato entra en el primer pantallazo~~ (no se cumple del todo: corrección medida del 23-11-2026 en § 10); la navegación cabe en una franja de 56 px; cada diálogo recibe y devuelve el foco; el atlas funciona sin terceros (imagen principal local, Leaflet alojado, costas locales, sin Google Fonts); simulador y Recursos sin errores; foco visible en todo el atlas; contraste de texto: 0 infracciones en las 31 vistas (en los diálogos quedaban 4 nodos, Síntesis y la pestaña «Clima» de la ficha, corregidos en la T7; § 4.3) | 4-16 |
| **Medio → resuelto o parcial** | Intro en el buscador; Diagnóstico visible; «Contraste» y «Modo clase» efectivos; flotantes que no tapan; cajón con rótulos; aviso sin JavaScript; impresión limpia; terceros (parcial: imágenes secundarias y teselas siguen remotas); CSP de scripts sin `'unsafe-inline'` (`style-src`: L3) | 17-30 |
| **Bajo → resuelto o anotado** | Sin `sw.js` inexistente; encabezados; sin emoji de interfaz; hojas huérfanas anotadas (no se retiran: L3) | 31-34 |
| Funciones rotas desde la línea base | Las 57 funciones del humo responden por primera vez (antes fallaban `simulador`, `diagnostico`, `exportar.svg.constructor`, `mapa.lentes`, `enlaces.profundos` y, sin terceros, `minimapa.capas`) | hallazgos H1-H3 |

## 1. Línea base de gusto derivada (a)

La línea base de PB-GH-10 (`SISTEMA.md`) se escribió para páginas de lectura. La auditoría la leyó contra el atlas,
que es una **mesa de consulta** densa (mapas, gráficos, matrices, laboratorio), y derivó esta línea base (auditoría,
`notas/01_linea_base_atlas.md`; vinculante por `DIRECCION_ATLAS.md` § 0-2):

- **Intención**: el alumnado llega desde DEA o desde el recorrido cuando necesita *más* (ficha completa, mapa,
  fuentes, comparación, glosario). No es donde se aprende la secuencia: es donde se consulta y contrasta evidencia.
- **Carácter**: el mismo manual universitario sobrio de DEA, en versión de **gabinete de trabajo**: denso sin ser
  ruidoso, con la incertidumbre a la vista y cada dato a un clic de su fuente. «La misma casa»: Lexend en
  titulares, papel y tierra, el mismo anillo azul.
- **Principios** (matices incorporados a `SISTEMA.md` § 2): (1) un punto focal por región, y en cada vista **el
  dato**, no un bloque explicativo; (2) la ficha como página de manual; (3) un único código de incertidumbre
  (`.pb-etiqueta`); (4) la copia de interfaz ayuda a actuar; (5) escala 7 + 2 de dato y paso denso solo en tablas;
  (6) el mismo producto en todas las puertas; (7) nada se pierde al cambiar de condición, **también sin red de
  terceros**.
- **Decisiones de lenguaje** (DIRECCION § 2): «Papel y tierra»; contenido sobre papel; barra de navegación en
  subtema «pizarra» (oscuro con tokens propios; pasarla a papel claro es L3); **solo modo claro** en esta ronda;
  sin gradientes decorativos, vidrio, emoji ni movimiento decorativo.

Medido en `c971001` contra esa línea base: aterrizaje en una portada de 3 979 px con cinco entradas que compiten;
barra de 950 px en el teléfono (113 % del alto); cada vista abría con una cabecera petróleo de 588-1 005 px más la
tarjeta de Bloom en el teléfono; tres familias de Google Fonts; ocho familias de variables de color; 1 938
`!important`; CLS de carga 1,16-2,24; anillo de foco ámbar a 1,48-1,70:1 sobre fondos claros; 977-986 nodos con
contraste insuficiente por viewport; y el bucle de peticiones de imagen sin acceso a Wikimedia.

## 2. Qué se mejoró y por qué (b), por impacto

**Bloqueantes.** (1) El bucle de imágenes se debía a `025-…media-guard.js`: su escuchador de `error` reasignaba con
`force=true` una URL **remota** de respaldo por clado; si tampoco cargaba, el ciclo era cerrado (1 528 de 1 551
asignaciones de `src` en 6 s salían de esa línea). Ahora el respaldo es local (`data:`) y uno por imagen, con un
tope (`imagenes-tope.js`) que impide volver a pedir una URL que ya falló. (2) «Comenzar clásico» estaba a 1,08:1 por
una regla importada que forzaba el color de todos los botones de los diálogos. (3) Varios módulos escribían
`aria-hidden` sin coordinarse: el gestor común de diálogos lo fija al abrir y cerrar.

**Altos.** La navegación y la cabecera se reorganizaron sin cambiar el modelo (las mismas 4 familias, 31 vistas y
rótulos): franja fija de 56 px con panel «Vistas»; cabecera con título y «Pregunta guía» y el resto plegado en
«Cómo usar esta vista»; franja «Consulta y filtros» compacta; colocación de la vista bajo la barra al elegirla. Foco
de diálogos que entra, no sale y vuelve. Sin terceros: Lexend local por la hoja base, Leaflet 1.9.4 alojado tras
contraste con el registro de npm y la etiqueta oficial, imagen principal de cada taxón desde `img/taxones/` (47 de
50), fondo vectorial de costas de Natural Earth bajo el relieve remoto. El puente de las 90 variables del atlas a
los tokens corrigió de una vez el contraste (el 85 % de los nodos venía de `--text-hint`) y el anillo de foco.

**Medios y bajos.** Ver la tabla (§ 4). Lo que no se hizo es por decisión (L3: CSP de estilos, hojas huérfanas,
barra en papel claro) o queda para la titular (§ 6).

**Cómo se probó que no se eliminó nada.** Contrato: inventario de la auditoría (31 vistas, 14 diálogos, 214
funciones, 15 bloques ocultos) y humo comparable contra la línea base de `c971001`
(`docs/diseno/atlas/linea-base/`), con 0 pérdidas al final de cada tanda en las cuatro condiciones (escritorio y
teléfono, con y sin terceros simulados). Plegar bajo un desplegable o mover a un panel cuenta como conservar;
`display:none` sobre algo visible, solo para duplicados exactos listados en cada informe (p. ej., el «← Volver»
que duplicaba «✕» en 9 diálogos y sigue en el DOM). Textos académicos (fichas, glosario, bibliografía, citas,
créditos, avisos) sin recortar ni reescribir; los títulos de grupo de la Bibliografía y las definiciones del
glosario, que otros módulos comparan, intactos.

## 3. Evidencia de cada L2 (c)

Cada L2 es un commit propio con capturas antes/después (las de la tanda, en `antes/T<n>/` y `despues/T<n>/` de la
carpeta de la ronda; selección en el repositorio). «Antes» es el HEAD previo a la tanda (T3: `c35aca6`; T4:
`9d1eb7e`; T5: `71437b6`).

| L2 | Commit(s) | Qué cambia | Medida antes → después | Capturas |
|---|---|---|---|---|
| Diálogo único | `4b7fe93` | Lámina de ≤ 56 rem, cabecera fija con título y «Cerrar», cuerpo con desplazamiento propio; pantalla completa en teléfono (9 diálogos) | Guía en teléfono: rótulo sobre el título y dos salidas → rótulo en el flujo y una salida | repo `05_autoevaluacion_escritorio.jpg`; `despues/T3/dlg/` |
| Barra de trabajo y panel «Vistas» | `71f8198`, `52703e5` | Franja fija de 56 px (pizarra) con «Vistas»; panel con las 4 familias y 31 vistas; herramientas rápidas | `#pbV50Blocks` 470 px (escritorio) / 1 094 px (teléfono), no fija → 56 px y fija; 31/31 accesos con ratón; a 200 % de texto, 112 px sin desbordar | repo `01_cronologia_telefono.jpg`; `despues/T3/hoja_vistas_*.jpg` |
| Cabecera de vista | `e949737` | Título y «Pregunta guía» sobre papel; hero y tarjeta de Bloom en «Cómo usar esta vista» | Hero 588-1 005 px y Bloom 538-741 px (teléfono) → 237-265 px; texto de cabecera 35 446-39 350 → 40 542 car. (nada se pierde) | repo `01_cronologia_telefono.jpg`; `despues/T3/cap/` |
| Franja «Consulta y filtros» | `89ced69`, `d47f0c7`, `372fe3f` | Sobre papel; una fila en escritorio; «Más opciones» en teléfono | 198 → 61 px (escritorio); 369 → 91 px (teléfono) | repo `02_elegir_vista_telefono.jpg`; `despues/T4/b2_consulta/` |
| Colocación al elegir vista | `ff45575`, `71437b6` | Barra arriba, franja debajo y título a continuación | Título de Cronología, Mapa y África: 935 → 176 px (teléfono), 423 → 156 px (escritorio), 722-805 → 186 px (tableta); barra 385/116 → 0 px; con espera de 300 ms y de 2 500 ms (tras la corrección `71437b6`) | repo `02_elegir_vista_telefono.jpg`; `despues/T4/b3_desplazamiento/` |
| Ficha | `01a615b` | Página de manual: panel lateral en escritorio, imagen local primero, minimapa con alternativa textual | Ancho en escritorio 1 366 → 640 px; zona fija en teléfono 278 → 106 px | repo `03_ficha_telefono.jpg`; `despues/T4/b1_ficha/` |
| Cronología | `eccaa85` | Leyenda en «Qué significan las etiquetas»; ámbar solo para lo incierto | Primera tarjeta tras elegir la vista: 1 621 → 603 px (teléfono), 886 → 499 px (escritorio) | `despues/T4/b4_cronologia/` |
| Mapa y África | `c7c503c`, `63cb4cf` | Mapa primero, controles agrupados con rótulo, alternativa textual, estado vacío | Mapa tras elegir la vista: 3 599 → 626 px (teléfono); África 14 468 → 622 px (teléfono), 4 699 → 769 px (escritorio 1366 × 768: al borde) | repo `04_mapa_escritorio.jpg`; `despues/T4/b5_mapa/` |
| Comparador | `0e6a361` | Guía plegada; tablas en región con cabecera y primera columna fijas | `#compareResult` encogido a 80 px (teléfono) / 166 px (escritorio) → a su altura | `despues/T4/b6_comparador/` |
| Bibliografía y Glosario | `0a5a60a` | Índices (62 grupos; 23 letras); lista de lectura; diccionario | Elementos fuera de la lámina al 200 % (390 px) 801 → 0 | repo `06_bibliografia_telefono.jpg`; `despues/T5/b1/` |
| Vistas de gráficos | `1270f73` | Cabecera, ayuda de lectura, «Ver el gráfico entero», «Leer como tabla» | Clima, Contexto y Coexistencias se abrían por su borde izquierdo (1 520, 1 240 y 2 273 px en cajas de ~300) sin aviso → ayuda y vista entera; axe `scrollable-region-focusable` 9/8/4 → 0 | repo `07_grafico_clima_telefono.jpg`; `despues/T5/b2/` |

**Reversión: lo comprobado en la T6.** Los informes de las tandas decían que cada L2 se revierte con `git revert`
de su commit. **No es así sobre el HEAD final**: probado en un árbol de trabajo temporal, los 11 L2 dan conflicto
con `git revert --no-commit` (siempre en `atlas/index.html`, porque cada L2 añadió sus enlaces junto a los del
anterior, y en `provenance/PB_GH_11_CORRECCIONES.json`, regenerada en cada tanda; además en `dialogo-unico.css` para
`4b7fe93` y `0e6a361`, y en `desplazamiento.js` para `ff45575`). La vía que sí funciona, comprobada para los 11:
quitar de `atlas/index.html` las 2-3 líneas que añadió el L2 (siempre presentes, intactas) y sus archivos de
`95-sistema/`; tras ello las comprobaciones estáticas del atlas siguen en verde. *(Corrección de la T7, hallazgo
T7-06: esta enumeración estaba incompleta y «en verde» solo valía para las 7 comprobaciones nuevas; con solo esos
pasos, `verificar_repo.py` queda en 90/91 porque cambia la huella de `atlas/index.html`. Véase la lista y el
procedimiento completos tras este párrafo.)* Dependencias: `diagnostico.js` y
`enlace-vista.js` (y, desde la T7, `navegacion.js`) usan `PBDesplazamiento` solo si existe; `buscador.js` usa `PBDialogoUnico` solo si existe;
`herramientas.js` no hace nada sin la franja de `barra.js` (el conmutador y «Arriba» quedarían donde los deja 071).
Retirar `dialogo-unico.css` retira también reglas que añadieron después la T4 (comparador, 200 %) y la T5 (320 px).
Ninguna reversión se ha ejecutado con el humo: es una comprobación estática y de dependencias. *(T7: ya no es cierto para dos L2; véase más abajo.)*

**Conflictos de `git revert --no-commit` sobre el HEAD de la T7 (`aa58c8c`), lista completa.** Probado
en un árbol de trabajo temporal (`piso/T7/revert_conflictos.txt`), commit por commit:

| L2 | Commit | Archivos en conflicto |
|---|---|---|
| Diálogo único | `4b7fe93` | `atlas/index.html`, procedencia, `dialogo-unico.css`, `dialogo-unico.js` |
| Barra y panel «Vistas» | `71f8198` (+ `52703e5`, sin conflicto) | `atlas/index.html`, procedencia, `barra.css` |
| Cabecera de vista | `e949737` | `atlas/index.html`, procedencia |
| Franja «Consulta y filtros» | `89ced69` (+ `d47f0c7`, `372fe3f`, sin conflicto) | `atlas/index.html`, procedencia, `consulta.css` |
| Colocación al elegir vista | `ff45575` (+ `71437b6`) | `atlas/index.html`, procedencia, `desplazamiento.js`; `71437b6` también en `desplazamiento.js` |
| Ficha | `01a615b` | `atlas/index.html`, procedencia |
| Cronología | `eccaa85` | `atlas/index.html`, procedencia |
| Mapa y África | `c7c503c` (+ `63cb4cf`, sin conflicto) | `atlas/index.html`, procedencia, `mapa.css` |
| Comparador | `0e6a361` | `atlas/index.html`, procedencia, `dialogo-unico.css` |
| Bibliografía y Glosario | `0a5a60a` | `atlas/index.html`, procedencia |
| Vistas de gráficos | `1270f73` | `atlas/index.html`, procedencia, `graficos.css` |

Además, cuatro L2 editaron archivos de `95-sistema` que no son suyos: `4b7fe93` cambia `dialogos.css`; `0e6a361` y
`0a5a60a`, `dialogo-unico.css`. Y la T7 añadió reglas a `barra.css` (T7-01) y `graficos.css` (T7-05): retirar la barra
o los gráficos retira también esos arreglos.

**Retirada de un L2 (procedimiento de la T7, que deja el verificador en verde).** Sustituye a `git revert`:

1. En `atlas/index.html`, quitar las líneas que añadió el commit del L2 (`git show <commit> -- atlas/index.html`, líneas
   `+`; siguen presentes e idénticas en el HEAD): de cada una, solo su primera aparición exacta, sin cambiar los
   finales de línea del archivo.
2. Borrar los archivos de `95-sistema/` que creó ese commit (estado `A` en `git show --name-status <commit>`).
3. Deshacer, archivo por archivo, lo que el commit cambió en otros archivos de `95-sistema/` (estado `M`):
   `git show <commit> -- <archivo> | git apply -R`. Si no se aplica (porque una tanda posterior tocó las mismas líneas),
   hacerlo a mano.
4. Procedencia (`provenance/PB_GH_11_CORRECCIONES.json`): en la corrección de `atlas/index.html`, `corrected_sha256`
   pasa a la huella nueva del archivo (y se anota la retirada en `change` y `return`); de `new_paths` salen los
   archivos borrados.
5. Comprobar: `python3 scripts/verificar_repo.py` (91/91) y el humo en teléfono y escritorio sin terceros con
   `--comparar` contra la línea base. Los commits de seguimiento del L2 (los de la columna «+» de la tabla) se retiran
   con él, porque solo tocan sus archivos.

La T7 automatizó los pasos 1-4 en un script de trabajo (`piso/T7/retirar_l2.py`, fuera del repositorio; desde la
reverificación, R-04, quita solo la primera aparición exacta de cada línea y conserva los finales de línea) y lo probó en
dos L2, cada uno en su propio árbol de trabajo temporal sobre el HEAD, retirado después:

- **Cabecera de vista (`e949737`)**: 3 líneas quitadas, 2 archivos borrados; `verificar_repo.py` **91/91**. Humo de
  teléfono sin terceros contra la línea base: **2 pérdidas**, ambas en Cronología («texto alcanzable 4 727 → 4 427
  car.», «controles visibles 53 → 52»). Causa probable: sin `cabecera.js` vuelve el comportamiento de `059`, que
  retira la tarjeta de Bloom a los 14 s (§ 6, «Comportamiento de la T3»); la línea base la midió antes de que se
  retirara. Es decir, retirar este L2 devuelve también ese autocierre: la titular debe decidirlo junto con la
  retirada.
- **Diálogo único (`4b7fe93`)**: 3 líneas quitadas, 2 archivos borrados y `dialogos.css` devuelto a su estado anterior
  con `git apply -R` (se aplicó limpio); `verificar_repo.py` **91/91**. Humo de teléfono sin terceros contra la línea base: **0 pérdidas** (65 mejoras, 208
  «otras», 1 inestable). Sin la lámina común, los diálogos vuelven a su presentación importada; foco, Escape y retorno
  siguen a cargo de `dialogos.js`.

Los otros nueve L2 no se han retirado de verdad: el procedimiento es el mismo, pero no hay medida.

## 4. Tabla de corrección (e)

Severidad de la auditoría: **bloqueante** (impide una tarea de las rutas principales o daña el equipo o el aula),
**alta** (WCAG A/AA en ruta principal o función rota), **media**, **baja**. Recuento de partida: bloqueante 3 · alta
13 · media 14 · baja 4 (+1 medición no concluyente). Estado: **corregida**, **parcial**, **no corregida (decisión)**,
**pendiente de la titular**. Página: vista o diálogo de `atlas/index.html`.

### 4.1. Las 34 filas de partida (y la medición no concluyente)

| # | Página | Viewport | Problema | Severidad | Estado (commit · medida antes → después) |
|---|---|---|---|---|---|
| 1 | Ficha (y toda imagen con respaldo) | todos, sin Wikimedia | Bucle de peticiones de imagen: 120-209 pet./s y 2 926 errores en 10 s | bloqueante | **Corregida** · `a37bd31` (+ tope) · 0 pet./s en reposo y 0 reintentos de la misma imagen, con y sin terceros (tormenta, cierre de cada tanda) |
| 2 | Autoevaluación | todos | «Comenzar clásico» a 1,08:1 | bloqueante | **Corregida** · `47e5228` · 7,7:1; axe 0 en `#examModal` |
| 3 | Ficha, Bibliografía, Glosario, Matriz, Estadísticas, Síntesis, Socrático | todos | Diálogo abierto con `aria-hidden="true"`; Bibliografía sin nombre | bloqueante | **Corregida** · `e2bb595` · `aria-hidden` al abrir en 8 de 16 diálogos → 0 de 16; `aria-dialog-name` 0 |
| 4 | Simulador | todos | `ReferenceError` en `008`: vista rota | alta | **Corregida** · `6a27784` · anima (306 → 281 ka en 2,5 s). Error de contenido aparte: H4 |
| 5 | 13 diálogos | todos | Foco que no entra, no vuelve y sale con Tab | alta | **Corregida** · `e2bb595` (+ `016`, `018`, `002` para Escape) · `focoVuelve` 1/16 → 16/16; `tabFuera` hasta 25 → 0 |
| 6 | Barra | todos | Foco en `<body>` al elegir vista con el teclado | alta | **Corregida** · `e2bb595` · foco en el chip y `aria-current` en 4/4 |
| 7 | Todas | todos | Anillo ámbar a 1,48-1,70:1 sobre fondos claros | alta | **Corregida** · `ca6ce31` · 91/118 muestras < 3:1 → 0/119 (mínimo 5,1:1) |
| 8 | Mapa | todos, sin teselas | Sin geografía sin ArcGIS ni teselas | alta | **Corregida** · `da288a9` · costas locales (129 anillos; 6/6 puntos de control). África sigue esquemática y la capa «Topográfico» fuera de la CSP: § 6 |
| 9 | Ficha | todos, sin Wikimedia | 13 de 14 imágenes rotas; no se usaban las copias de `img/taxones/` | alta | **Corregida** · `a71b353` · imagen principal local en 47 de 50 taxones; las demás imágenes de la ficha siguen remotas con respaldo local. 21 copias son otra fotografía: § 7 |
| 10 | Banco de recursos | todos | Favicons de Google bloqueados por la CSP; 16 `TypeError` por visita | alta | **Corregida** · `78751c0` · iconos locales por tipo; 0 errores; 0 peticiones a Google |
| 11 | Guía del alumnado y diálogos con «Volver» | teléfono | Rótulo sobre el título; dos salidas | alta | **Corregida** · `e2bb595`, `4b7fe93` · una salida visible |
| 12 | Barra | teléfono, 320 px | 950 px (113 %) a 390 px y 1 090 px a 320 px; no fija | alta | **Corregida** · `71f8198`, `52703e5` · 56 px y fija en los tres anchos |
| 13 | Todas | todos | CLS de carga 2,12 / 2,24 / 1,16 (teléfono, tableta, escritorio) y al cambiar de vista hasta 3,37 | alta | **Corregida** · `257f4a7` · carga 1,174 / 0,993 / 1,673 (medido en `71437b6`) → 0,050 / 0,001 / 0,000; cambio de vista 0 en 11 vistas (humo `cls`). Con `recorrido.cjs` con capturas salen valores sueltos (0,2-0,56) que no se reproducen sin el paso de captura (§ 7). Coste: primer pintado 64-120 → 584-652 ms en servidor local |
| 14 | Paleoecología, Biogeografía, Recursos | todos | 115 objetivos < 24 px | alta | **Corregida** · `ca6ce31` · axe `target-size` 0 |
| 15 | Coexistencias | todos | 230 nodos con ARIA prohibido; región sin foco | alta | **Corregida** · `aef9ec4` · 0; región con foco y nombre |
| 16 | Todas (Bibliografía 142) | todos | 977-986 nodos de contraste por viewport | alta | **Corregida** · `ca6ce31`, `eb922b3` · 901/1 014/979 → 26 (T2; los 26 venían de `style=` de las plantillas) → 0 en las 31 vistas a 390, 820 y 1366 px (T4, que con su propio método partía de 16) |
| 17 | Portada / salto | todos | 45 tabulaciones de portada antes del atlas; el salto dejaba el foco en `<body>` | media | **Corregida** (salto) · `e2bb595` · Tab 1 + Intro → foco en «Vistas». Aterrizar en la herramienta: L3 |
| 18 | Buscador | todos | Intro no hacía nada | media | **Corregida** · `6f6e6c0` · una coincidencia abre la ficha; varias, la búsqueda global. Buscador único: L3 |
| 19 | «Diagnóstico» | todos | Sin efecto visible fuera de Centro docente | media | **Corregida** · `1a1b568` · abre Centro docente con el informe enfocado; humo `diagnostico` true |
| 20 | Selector «Nivel» | todos | Selector «Universitario» con `data-complexity="doctorado"` | media | **Parcial** · `adf225e` · selector y estado coinciden («Nivel Doctorado»); filtrar chips por nivel y nivel por defecto: § 6 |
| 21 | «Contraste» y «Modo clase» | todos | Efecto parcial o nulo | media | **Corregida** · `ca6ce31` · tokens de proyección; «Modo clase» +20 % de letra |
| 22 | Flotantes («↑», «⊞», insignia) | teléfono, tableta | Tapaban texto | media | **Corregida** · `71f8198` (insignia), `d6e4b01` · 19 solapamientos → 0 |
| 23 | Cajón de herramientas | todos | 11 botones de solo icono y 11 colores | media | **Corregida** · `d6e4b01`, `f54bcb7` · 11/11 con rótulo = `aria-label`, un color; Tab entra, Escape cierra |
| 24 | Sin JavaScript | teléfono | Sin `<noscript>`; 2 h1 visibles; 89 controles inertes | media | **Corregida** · `2052dbd` · aviso con enlaces a la consulta ligera y a DEA; 1 h1 |
| 25 | Mapa, África | 320 px | `.map-stage` 500 px fijos; tarjetas de 325-339 px recortadas | media | **Corregida** · `ca6ce31`, `c35aca6` · 0 elementos fuera; tarjetas de 230 px |
| 26 | Gráficos anchos | teléfono, tableta | Clima, Contexto, Coexistencias y tablas: 4-9 regiones desplazables sin foco | media | **Corregida** · `aef9ec4`, `1270f73` · 0; L2 de gráficos |
| 27 | Impresión (Cronología, Mapa, África) | impresión | Barra y 12-13 bloques oscuros impresos | media | **Corregida** · `ca6ce31` · sin barra; 1-2 bloques oscuros (tooltip y figura del cladograma). Papel real no probado |
| 28 | Filogenia, Contexto, Clima, África, Estratigrafía, Constructor | todos | `nested-interactive` 11, `aria-required-children` 1, `aria-allowed-role` 6 | media | **Corregida** · `aef9ec4` · 0, 0, 0 |
| 29 | Terceros | todos | Google Fonts, cdnjs, Wikimedia, OSM/ArcGIS, favicons de Google | media | **Parcial** · `c3f4a8e`, `60b1c8e`, `a71b353`, `78751c0`, `da288a9` · 0 peticiones a Google y cdnjs; imagen principal y costas locales. Siguen remotas las imágenes secundarias (galería, lentes) y las teselas/relieve (con respaldo local) |
| 30 | CSP | todos | `script-src` y `style-src` con `'unsafe-inline'` | media | **Parcial** · `60b1c8e` · `script-src 'self'`; 0 violaciones de `script-src` en el humo. `style-src 'unsafe-inline'` sigue (1 460 `style=` generados): L3 |
| 31 | `/atlas/sw.js` | todos | 404 en cada carga | baja | **Corregida** · `410df3e` · registro condicionado a una bandera |
| 32 | Hojas huérfanas | — | 4 hojas que no se cargan | baja | **No corregida (decisión)** · DIRECCION § 1.4: no se retiran; consolidar es L3 |
| 33 | Encabezados | todas | `heading-order` 1, `landmark-unique` 1, `landmark-complementary-is-top-level` 1 | baja | **Corregida** · `aef9ec4` · 0, 0, 0; 1 h1 visible |
| 34 | Emoji de interfaz | todos | 360 pictogramas en rótulos | baja | **Corregida** · `d9222a1` · 360 → 8 «↔» (glifo admitido); el texto se conserva |
| 35 | Teclado | escritorio | 41 de 45 elementos enfocados fuera de la ventana al medir (probable desplazamiento suave) | — | **No repetida**: la auditoría no la contó como defecto y ninguna tanda la volvió a medir |

### 4.2. Hallazgos posteriores (T1-T6 y verificaciones del director)

| # | Página | Viewport | Problema | Severidad | Estado |
|---|---|---|---|---|---|
| H1 | Constructor | todos | Exportar SVG rompía («Cannot access 'warn' before initialization») | alta | **Corregida** · `1a1b568` |
| H2 | Enlace `?view=` | todos | Solo 7 de 31 vistas | media | **Corregida** · `1a1b568` · 31/31 |
| H3 | Mapa | todos | La lente «Todos los focos» no quedaba pulsada | media | **Corregida** · `c45c7ef` · efecto: la lente inicial pasa a ser «Todos los focos» (§ 6) |
| H4 | Simulador | todos | Entre 243 y 300 ka rotula «MIS 1 · Holoceno»: falta MIS 8 en `008` | media (contenido) | **Corregida (decisión de la titular, 20-11-2026)** · `958170c` · MIS 8 con los límites de `006` (300-243 ka); fuera de tabla, «Sin estadio MIS». 244-299 ka: «MIS 1 · Holoceno» → «MIS 8 · glacial»; 279 ka → MIS 8; 0-315 ka sin huecos (§ 8.2) |
| H5 | Ficha (anoiapithecus, gautengensis) | sin red | El pie decía «Imagen abierta trazable · CC0» de una imagen remota sin copia | media | **Corregida** · `81c0ee2` · «Imagen remota sin copia local»; licencia «no verificada en este repositorio» |
| H6 | Minimapa de la ficha | todos | Capa «Topográfico» (OpenTopoMap) fuera de la CSP: 4-10 violaciones `img-src` por humo | media | **Pendiente de la titular** (§ 6) |
| H7 | Ficha académica impresa | impresión | QR pedido a `api.qrserver.com` (fuera de `img-src`): imagen rota; enviaría la URL a un tercero | media | **Corregida (decisión de la titular, 20-11-2026: eliminar)** · `e8129f3` · sin imagen QR ni petición a `api.qrserver.com` (1 → 0 peticiones y 1 → 0 infracciones de CSP al exportar); la dirección sigue impresa en «Recurso». Única eliminación autorizada de la T8 |
| H8 | Exportaciones de `008` y `021` | — | La plantilla escribía `<\/script>` y la impresión nunca se lanzaba | baja | **Corregida** · `60b1c8e` · ahora imprimen (§ 6) |
| H9 | Ficha con un diálogo encima; presentación | todos | Un Escape cerraba dos capas | alta | **Corregida** · `e2bb595` |
| H10 | Reposo | todos | `078` repintaba clases en bucle: ~240 mutaciones/s | media | **Corregida** · `e2bb595` · 1 037-1 163 → 6 mutaciones en 5 s (eventos únicos) |
| H11 | Bibliografía, Estadísticas | todos | `aria-labelledby` a ids inexistentes | alta | **Corregida** · `e2bb595` |
| H12 | Franja «Consulta y filtros» | teléfono, escritorio | Bloque oscuro entre la barra y el título: título a 447/419 px | alta | **Corregida** · `89ced69` |
| H13 | Elegir vista | escritorio | La página se detenía con la barra a 112 px y un resto de la portada | media | **Corregida** · `ff45575` |
| H14 | Elegir vista | todos | Con ≥ 1,5 s en el panel «Vistas», la vista no se colocaba | alta | **Corregida** · `71437b6` |
| H15 | Comparador | teléfono, escritorio | Resultados encogidos a 80/166 px | alta | **Corregida** · `0e6a361` |
| H16 | África | todos | Tab en una tarjeta de pregunta abría la región y dejaba el foco en `<body>` | alta | **Corregida** · `aef9ec4` (`057`) |
| H17 | Radar del comparador | teléfono | 4 rótulos cortados | baja | **Corregida** · `95197c8` · 6 enteros |
| H18 | Búsqueda global | todos | Rótulos sin tilde («Taxon») | baja | **Corregida** · `95197c8` |
| H19 | `?view=<id>` (también desde el recorrido) | todos | Activaba la vista pero dejaba en la portada | alta | **Corregida** · `fa7b614` · 0/24 → 24/24 posiciones |
| H20 | Paleoproteómica | todos | Única vista sin cabecera de vista | baja | **Propuesta L3** (§ 5) |
| H21 | Todas | 390 px | Texto < 12 px fuera de SVG: 2 963 elementos | media | **Parcial** · `c7df5a1` · 1 370 (celdas densas y textos sin clase) |
| H22 | Vistas con `style=` de color | todos | 171 elementos con colores literales en plantillas | baja | **No corregida** · los que no daban contraste se corrigieron (fila 16, `eb922b3`); el resto, L3-7 |
| H23 | Mapa con relieve de ArcGIS | escritorio | Posible desalineación relieve/marcadores (exportación −85°…85° estirada a ±90°) | baja | **No comprobado** (sin red de ArcGIS) |
| H24 | Título de diálogo | 320 px, 200 % | «Paleoantropológico» partido sin guion | baja | **Parcial** · `--t-m` bajo 22,5 rem; al 200 % depende del diccionario de guionado del sistema (no comprobado en Android/iOS) |
| H25 | `atlas/POLITICA-PRIVACIDAD-DOCENTE.md` | — | Sigue declarando que el atlas contacta con Google Fonts y cdnjs (ya no lo hace) | baja | **Pendiente de la titular** (§ 6; archivo importado, no se tocó) → **Corregida en la T7** (`aa58c8c`, T7-09): sección fechada al final con los contactos medidos; el texto recibido no cambia |
| H26 | `THIRD_PARTY_NOTICES.md`, `LICENSE_STATUS.md`, `README.md` | — | Describen la licencia de Leaflet como MIT; el `LICENSE` de 1.9.4 (también la copia de R98) es BSD de 2 cláusulas | baja | **Anotada** en `THIRD_PARTY_NOTICES.md` (fila nueva); las líneas previas no se cambiaron (§ 6) → **Corregida en la T7** (`ccb1cf0`, T7-08): «licencia BSD de 2 cláusulas» en las tres líneas |
| H27 | `atlas/imsmanifest.xml` | — | No enumera 53 rutas locales que referencia `index.html`: los 48 archivos de `95-sistema`, Leaflet alojado (2), `084` de PB-GH-09, la hoja base y el enlace a la consulta ligera | baja | **No se toca** (§ 6): el verificador solo exige que existan los listados y el paquete IMS es un artefacto de LMS fuera del proyecto |
| H28 | L2 de la ronda | — | Ningún L2 se revierte limpio con `git revert` sobre el HEAD final | media (gobierno) | **Documentada** la vía comprobada (§ 3); la T7 completó la lista de conflictos y el procedimiento (T7-06) |

### 4.3. Hallazgos de la verificación independiente (T7) y su estado tras la tanda de arreglos

La verificación independiente (informe `notas/informes/T7.md` de la carpeta de la ronda, veredicto «apto con reservas»)
encontró 13 hallazgos sobre `866581e`. La tanda de arreglos de la T7 los trató en commits propios; las cifras «antes»
son las del verificador y las «después», las de sus mismas sondas repetidas sobre el HEAD de la tanda
(`notas/informes/T7_arreglos.md`).

| # | Página | Viewport | Problema | Severidad | Estado |
|---|---|---|---|---|---|
| T7-01 | Panel «Vistas» (todas las vistas) | 390, 820, 1366 | Abrir el panel subía la página 426 / 388 px por vez y cerrarlo no la devolvía; cada consulta del Glosario desde el panel en teléfono devolvía a otra especie. Causa: la franja quedaba dentro del `scroll-padding-top` que ella misma fija y el navegador, al enfocarla, la creía tapada | media (regresión) | **Corregida** · `bfc349c` · 0 px al abrir, con Escape, con «Cerrar», con el foco devuelto y tras el Glosario, en los tres anchos |
| T7-02 | Portada → «Saltar al contenido principal» | 390, 1366 | La franja quedaba a 426 / 388 px con media pantalla de portada encima (`focus()` sin `preventScroll`) | media | **Corregida** · `89f8354` · franja a 0 px, consulta a 56 px, foco en «Vistas» |
| T7-03 | Ficha: «Comparación científica recomendada» y cuerpo de la ficha en otras pestañas | 390, 1366 | Regiones que se desplazan sin foco ni contenido enfocable (axe `scrollable-region-focusable`) | media | **Corregida** · `ebd503c` (`accesibilidad-contenido.js`) · 1 → 0 en «General»; 0 también en las demás pestañas (al medirlas en esta tanda, el cuerpo de la ficha daba 1 más en «Anatomía» y otra pestaña, que el verificador no había medido) |
| T7-04 | Ficha | 390, 820, 1366 | `heading-order` (h2 → h4) | baja (regresión) | **Corregida** · `ebd503c` · `aria-level` 3 en los encabezados que saltan nivel; texto y etiqueta intactos |
| T7-05 | Filogenia | 390 (y 820) | Cladograma, leyenda y titular recortados por `.phylo-outer` (`min-width: 860px`) sin región desplazable | media (preexistente) | **Corregida** · `f91e7bc` · recortes sin región desplazable 17 → 0 (390) y 8 → 0 (820); el cladograma se recorre en su región con foco y «Ver el gráfico entero». Efecto secundario sobre «Ver el gráfico entero»: R-01. Otra sonda en las 31 vistas solo halló, en Continentes, barras que se salen < 1 % de su pista con un texto que repite el del botón de su fila (anotado, sin cambio) |
| T7-06 | `AUDITORIA_PB_GH_11.md` § 3 | — | Lista de conflictos de reversión incompleta y «en verde» no cierto con la vía propuesta | baja (documental) | **Corregida** · § 3: lista completa y procedimiento de retirada probado en dos L2 (91/91; humo de teléfono: 2 pérdidas por el autocierre de `059` al retirar la cabecera, 0 al retirar el diálogo único) |
| T7-07 | Síntesis de sesión; resumen § 0 | 390, 820, 1366 | `color-contrast` 3,54:1 a 10,56 px; el resumen decía «0 infracciones» | baja | **Corregida** · `44e27c2` · token `--c-basal` (5,84:1); además, la pestaña «Clima» de la ficha (3 nodos, 3,13:1) pasa a `--tinta-2`; resumen § 0 corregido |
| T7-08 | `THIRD_PARTY_NOTICES.md`, `LICENSE_STATUS.md`, `README.md` | — | Leaflet descrito como MIT | baja | **Corregida** · `ccb1cf0` · «licencia BSD de 2 cláusulas», con `atlas/assets/vendor/leaflet/LICENSE` como evidencia |
| T7-09 | `atlas/POLITICA-PRIVACIDAD-DOCENTE.md` | — | Declaraba cdnjs y Google Fonts; no nombraba OpenTopoMap ni `api.qrserver.com` | baja | **Corregida** · `aa58c8c` · sección fechada al final con los contactos medidos (6 peticiones en la carga, 31 en el recorrido; OpenTopoMap y `api.qrserver.com` bloqueados por la CSP) |
| T7-10 | Arnés (`--comparar`) | — | No medía posición de lectura, destino del salto ni recortes | baja | **Corregida** · `2599440` · `panel.lectura`, `salto.destino`, `recortes.vistas`: fallan sobre `866581e` (0/5, 1/4 y 30/31 en teléfono) y pasan tras la T7 (5/5, 4/4, 31/31) |
| T7-11 | Ficha de *afarensis* (y 20 taxones con otra fotografía) | todos | El pie habla de la imagen anterior | baja | **Corregida (decisión de la titular, 20-11-2026)** · `929b786` · en los 21 taxones el pie y el texto alternativo describen la imagen que se ve (manifiesto y examen visual de cada copia), con su crédito y licencia; de la imagen anterior queda solo su título, rotulado. Tabla taxón por taxón en el informe T8 |
| T7-12 | Clima, marcadores SVG | 390, 820, 1366 | 29-53 barras «Ver ficha de …» de 12 × 18 px | baja | **Corregida** · `ebd503c` · diana transparente de ≥ 24 × 24 px bajo cada barra: 53/42/29 → 0. Quedan 3-6 enlaces de fuentes de 14 px de alto en el bloque de referencias de Clima (preexistentes, anotados como los DOI de África) |
| T7-13 | Matriz, Síntesis, Guía, Comparador, Búsqueda | todos | 96 nodos con infracciones ARIA | baja | **Parcial** · `ebd503c` · infracciones ARIA 93 → 3 y `heading-order` 2 → 0: Síntesis (31, `role="img"`), Guía (6, `role="list"`; y su `heading-order`), Matriz (50, «→» redundante `inert`), Búsqueda (1, `group` sin opciones), Comparador (2 de 5 ARIA, `role="list"` en los chips; y su `heading-order`). Quedan en el Comparador `aria-allowed-role` (2: `<article role="listitem">`) y `aria-required-children` (1: `role="table"` sin filas); corregirlos exige cambiar el marcado que pinta `002` (otra etiqueta o filas reales): propuesta, no ejecutada |

**Reverificación independiente de `c0cac07`** (informe `notas/informes/T7_reverificacion.md`, «apto con reservas»):
cuatro hallazgos nuevos, tratados en la última tanda corta.

| # | Página | Viewport | Problema | Severidad | Estado |
|---|---|---|---|---|---|
| R-01 | «Ver el gráfico entero» (Filogenia, Clima, Contexto, Coexistencias) | 390, 820, 1366 | El modo ajustaba el SVG al ancho de la caja sin límite: rótulos de 1,2-2,6 px en teléfono (Filogenia 1,6-2,6; Clima 1,6-2; Coexistencias 1,2-1,5) y 2,8-6,3 px a 820 | media | **Corregida** · `0356347` · escala mínima: ningún rótulo baja de 12 px en ese modo (rótulo mínimo medido 12,0 px en las 11 combinaciones de gráfico y anchura con botón; Filogenia a 1366 cabe y no lo muestra; antes 1,2-9,3 px); si no cabe, la caja (con foco y nombre) se recorre en los dos ejes con el alto limitado a la pantalla, y la ayuda lo dice. Como los rótulos de origen miden 8-13 unidades del SVG, en las anchuras medidas el modo muestra el gráfico mayor que en detalle (Filogenia 2 044 px; Clima 2 280; Contexto 1 572; Coexistencias 3 031), no una miniatura: si la titular prefiere una «vista de conjunto» sin rótulos legibles, es otra decisión |
| R-02 | Filogenia, cladograma | todos | 83 rótulos < 12 px (6,9-11,3 px) y 4 solapes | baja (preexistente) | **Corregida (decisión de la titular, 20-11-2026: tocar el programa original)** · `92f29a6` · el renderizador de `002` dibuja nombres, eje y códigos a 14 unidades, mide cada píldora con su texto, aparta los nombres de ramas y nodos, separa en vertical los nodos 12 y 14 y ensancha el lienzo, que absorbe la caja desplazable. En modo normal a 390, 820 y 1366 px: rótulos < 12 px 83 → 0 (mínimo 12,13 px); solapes de texto 4 → 0; nombres sobre ramas 26 → 0; texto fuera de su píldora 2 → 0. «Ver el gráfico entero»: mínimo 12,01 px, 0 solapes. Efecto: el dibujo pasa de 1 180 a 1 279 px y a 1366 px la caja se desplaza también en horizontal (y aparece «Ver el gráfico entero»). Antes, en la T7: probado por CSS: llevar nombres y eje a 14 unidades (≥ 12 px) deja 59 de 83 rótulos legibles sin solapes de texto nuevos, pero los nombres desbordan las píldoras de fondo que `002` dimensiona para el tamaño actual y quedan sobre las ramas; subir también los 24 códigos de nodo añade un solape (14 / 12). Exige que el renderizador de `002` dimensione píldoras y códigos (no aditivo): propuesta. En «Ver el gráfico entero» los rótulos ya llegan a 12 px (R-01) |
| R-03 | `atlas/POLITICA-PRIVACIDAD-DOCENTE.md`, sección de la T7 | — | Cifras medidas sin acceso real a los servicios; «6 infracciones» de OpenTopoMap valía solo en escritorio | baja | **Corregida** · `5098787` · la sección dice las condiciones de medida y da 6 (escritorio) y 4 (teléfono); el texto recibido sigue intacto (prefijo byte a byte) |
| R-04 | `piso/T7/retirar_l2.py` (fuera del repositorio) | — | Quitaba todas las apariciones de cada línea y normalizaba los finales de línea | baja | **Corregida** · quita solo la primera aparición exacta y conserva los finales de línea; sobre `e949737` da el mismo `index.html` que antes y `verificar_repo.py` 91/91; con un `index.html` en CRLF y una línea repetida, conserva CRLF y la repetición. § 3, paso 1, ajustado |

## 5. Propuestas L3 (solo propuestas) (d)

De DIRECCION § 5:

1. **Aterrizar en la herramienta** (portada opcional): con `?view=` o desde DEA, abrir directamente la vista; la
   portada `#pb-hub` se conserva como «Presentación del atlas». Hoy la portada mide 3 979 px y suma ~45 tabulaciones.
2. **Buscador único** con sugerencias (fusiona `#searchInput` y la búsqueda global; hoy Intro ya los enlaza).
3. **«Docencia» agrupada**: Centro docente, Recursos, Itinerarios, Modo clase, Nivel, Diagnóstico, Exportar y Síntesis
   bajo un menú propio, fuera de lo que ve primero el alumnado. Nada se retira.
4. **Barra y cabeceras en papel claro** (como DEA) en lugar del subtema «pizarra».
5. **Puerta DEA dentro del atlas**: reactivar `#deaWelcome` (objetivos, rúbrica, «Empezar por el Itinerario I»).
6. **Consolidar las 49 hojas** y retirar código muerto, las 4 hojas huérfanas, los bloques ocultos y el
   `.modal-back-btn` duplicado del DOM, con el humo como contrato. Incluye **mover 051-053 al `<head>`**, que
   quitaría la espera de `carga.css` en el primer pintado.
7. **`style-src` sin `'unsafe-inline'`**: exige sacar los `style=` de las plantillas de `002-script.js` (1 460
   generados; 171 con color en las vistas) y pasar sus colores a tokens.
8. **Trato de usted** también en el contenido (la interfaz nueva ya lo usa).
9. **Modo oscuro del atlas** (hoy solo claro).

Surgidas en T1-T5:

10. **Cabecera de vista para Paleoproteómica** (la única sin `.view-hero`; T3, T5).
11. **QR de la ficha académica** (resuelta por la titular el 20-11-2026 con la opción (a); hecha en la T8): (a) retirar el `<img>` y dejar la URL en texto (ya se imprime); (b) generar el QR en
    local con un codificador propio, sin dependencias (~300 líneas). La opción de ampliar la CSP queda descartada
    por DIRECCION § 4.
12. **Nivel de entrada**: filtrar los chips de «Vistas» por `COMPLEXITY_MODES[nivel]` (ocultar, no borrar) y decidir
    el nivel por defecto (§ 6).
13. **Mapa de África sobre costa real**, redibujando Rift y Sahara sobre ella (T4).
14. **Ficha**: dar otra función o retirar «Volver atrás», que también cierra y duplica a «Cerrar» (T4).
15. **Franja**: quitar `#viewOrientation`, que repite el título y la ubicación del botón «Vistas» (T4).
16. **Comparador**: radar en SVG con rótulos que quepan; resultados en pestañas (tabla, radar, cladística) (T4).
17. **Pie fijo en la autoevaluación** con la acción principal (T3).
18. **Zoom de texto del navegador**: que `054` deje de fijar la raíz con `!important` (T3); hoy el 200 % se ha medido
    forzando la raíz.

## 6. Decisiones pendientes de la titular (f)

El 20-11-2026 la titular resolvió cuatro, que se ejecutaron en la tanda T8 (§ 8.2): MIS 8 del simulador, QR de la
ficha académica y pies de las 21 imágenes con otra fotografía (filas de esta tabla) y los rótulos del cladograma
(R-02, § 4.3), para el que autorizó tocar el programa original. Las demás siguen pendientes.

| Decisión | Estado actual | Opciones |
|---|---|---|
| Capa «Topográfico» del minimapa (OpenTopoMap) | Fuera de la CSP desde siempre: no carga ni con red; 4-10 violaciones `img-src` por humo | Añadir el origen a `img-src` (amplía la CSP) o retirar la opción (elimina una función). Ninguna ejecutada |
| Exportaciones de `008` («Resultado examen offline») y `021` (ficha) | Ahora lanzan la impresión (antes no, por un error de plantilla); la ruta de `021` no se vio ejecutarse en las pruebas | Mantener o volver a no imprimir |
| Leaflet: paquete npm o zip de la release | Alojado el de npm 1.9.4; CSS, imágenes y `LICENSE` idénticos al repositorio oficial; los JS difieren de la release solo en la cadena de versión del banner | Mantener o alojar el JS del zip para identidad byte a byte |
| Comportamiento de la T3 | La tarjeta de Bloom ya no se retira sola a los 14 s mientras está plegada; en teléfono, Bibliografía, Glosario, Exportar y Diagnóstico pasan al panel «Vistas» (un toque más) | Mantener o revertir el autocierre (`cabecera.js`) |
| Lente inicial del mapa | «Todos los focos» (consecuencia de H3); antes, «África oriental» | Mantener o volver a África oriental (una línea) |
| Mapa de África | Silueta esquemática, rotulada como tal en su alternativa textual; algunos marcadores caen fuera | Mantener o costa real (L3-13) |
| Imágenes sin copia local (anoiapithecus, gautengensis; chororapithecus es lámina provisional) | Pie honesto: «licencia no verificada en este repositorio» | Conseguir copia y licencia comprobada |
| Nivel por defecto | «Nivel Doctorado» (lo que de verdad se muestra) | Arrancar en «Universitario» ocultaría `.expert-only` y varias vistas |
| Retraso del primer pintado | 64-120 → 584-652 ms en servidor local; con red lenta, hasta que llega la última hoja (máximo 4 s) a cambio de CLS de carga 0-0,05 | Mantener o L3-6 (hojas al `<head>`) |
| Rótulos de Biogeografía | «Edad: », «Lugar: », «Nota: » sustituyen a ⏱, 📍 y ⚠ | Mantener o elegir otras palabras |
| MIS 8 ausente en el simulador (`008`) | Entre 243 y 300 ka el simulador rotula «MIS 1 · Holoceno»; la escala del propio atlas (`006`, que cita a Lisiecki y Raymo, 2005, *Paleoceanography*, 20, PA1003, https://doi.org/10.1029/2004PA001071) sí tiene «MIS 8 · 300-243 ka», y los demás límites de `008` coinciden con ella. La tabla de límites LR04 de la fuente no se ha podido abrir en la ronda | Añadir `{mis:'MIS 8', start:300, end:243, climate:'glacial'}` y que `currentMis()` devuelva «sin estadio» en vez del último elemento · **Resuelta por la titular el 20-11-2026 («Corregir») y hecha en la T8** (`958170c`, pruebas `f6e84db`): exactamente esa fila y un respaldo neutro; los límites de 1 a 9 coinciden con `006` (ninguna discrepancia que anotar) |
| QR de la ficha académica | Imagen rota al imprimir | L3-11 (a) o (b) · **Resuelta por la titular el 20-11-2026 («ELIMINAR») y hecha en la T8** (`e8129f3`): se retira la imagen y el código que la pedía; la dirección se imprime como texto. Párrafo fechado en `atlas/POLITICA-PRIVACIDAD-DOCENTE.md` |
| `atlas/POLITICA-PRIVACIDAD-DOCENTE.md` | Declara contactos con Google Fonts y cdnjs que ya no ocurren (sobredeclara; no omite ninguno nuevo) | Actualizarla (archivo importado: exige procedencia) · **Hecho en la T7** por encargo del director: sección fechada añadida al final, sin reescribir ni borrar el texto recibido; procedencia en `PB_GH_11_CORRECCIONES.json` |
| Licencia de Leaflet en la documentación | `THIRD_PARTY_NOTICES.md`, `LICENSE_STATUS.md` y `README.md` dicen MIT; el texto conservado es BSD de 2 cláusulas | Corregir esas líneas (la T6 solo lo anota) · **Hecho en la T7** por encargo del director: corrección factual de la licencia de un tercero, con `atlas/assets/vendor/leaflet/LICENSE` como evidencia; ninguna otra decisión sobre licencias |
| Pie de *afarensis* y 20 taxones con otra fotografía (T7-11) | La copia local es otra imagen; el pie conserva el texto escrito para la anterior (en *afarensis*, «Sustituye una reconstrucción corporal…») | Reescribir los pies de esas fichas o mantenerlos · **Resuelta por la titular el 20-11-2026 («Corregir») y hecha en la T8** (`929b786`): pie y alternativo nuevos en `95-sistema/imagenes-locales.js`; ni `002` ni el manifiesto cambian |
| `atlas/imsmanifest.xml` | Incompleto desde PB-GH-09 (no lista `084`) y más tras la ronda; el verificador solo comprueba que existan los archivos listados | Dejarlo como está (el sitio no se distribuye como paquete para un LMS) o completarlo si alguna vez se necesitara el paquete IMS |

## 7. Límites honestos (g)

- **No probado**: lectores de pantalla reales; Firefox y Safari; dispositivos reales (el táctil es el clic de
  Playwright); proyector y papel reales (solo emulación `print` y PDF de Chromium); red real de Wikimedia, OSM,
  OpenTopoMap y ArcGIS (no alcanzables en el contenedor: no se ha visto la ficha con imágenes remotas reales, ni el
  relieve sobre las costas locales, ni el minimapa con teselas); red lenta (el primer pintado solo se midió en
  servidor local); **modo oscuro** (no existe en el atlas: solo claro); el **humo de tableta** (en ninguna tanda; la
  tableta se midió con axe, `recorrido.cjs` y capturas); el zoom de texto del navegador (el 200 % es la raíz forzada).
- **Imágenes**: 47 de 50 taxones tienen imagen principal local; en **21** (orrorin, ramidus, anamensis, afarensis,
  bahrelghazali, africanus, prometheus, sediba, boisei, habilis, georgicus, erectus, antecessor, cepranensis,
  heidelbergensis, rhodesiensis, naledi, idaltu, neander, luzon, sapiens) la copia local es **otra fotografía** que la
  remota que citaba la ficha (georgicus: la misma pieza con otro fondo); desde la T8, su pie y su texto alternativo
  describen la imagen que se ve y de la anterior solo queda el título, rotulado. Las páginas de Commons no pudieron
  abrirse en la T8: los pies se apoyan en el manifiesto y en el examen visual de cada copia. El resto de imágenes de la ficha (galería de evidencia, lentes)
  siguen remotas con respaldo local.
- **CLS por vista con capturas**: `recorrido.cjs` con capturas da valores sueltos (0,2-0,56) en tres vistas que no se
  reproducen sin el paso de captura (humo `cls`: 0 en 11 vistas y cuatro condiciones; `recorrido.cjs --sin-capturas`:
  máximo 0,009). La hipótesis (el estilo temporal de la captura de página entera) no está demostrada.
- **Arnés**: en las capturas de `recorrido.cjs` la franja fija tapa los primeros 56 px de cada vista (al navegar no
  ocurre); no se adaptó el script.
- **axe**: completo (todas las reglas) en las 31 vistas solo en la T5 (261/260/256 → 0 infracciones a 390/820/1366 px);
  en los diálogos, solo las reglas de nombre, `aria-hidden` y contraste. Un `color-contrast` en Síntesis que ya estaba
  antes de la T3 no se volvió a medir después. **T7**: axe completo también en nueve diálogos y en todas las pestañas de
  dos fichas a 390, 820 y 1366 px (§ 4.3 y § 8.1); quedan 3 nodos ARIA del Comparador (T7-13).
- **Reversión de los L2**: comprobada de forma estática (§ 3), no con el humo. **T7**: procedimiento de retirada
  probado en dos L2 con el verificador y el humo de teléfono (§ 3); los otros nueve, solo por analogía.
- **Determinismo**: la auditoría y la T2 vieron no determinismo en la condición teléfono con terceros de la línea
  base (Itinerarios y Biogeografía); no se añadió a `inestables.json`.
- **PB-01** sigue reproduciéndose (`node scripts/reproducir_pb01.cjs`): no era objeto de la ronda; `066` no se tocó.

## 8. Mediciones de cierre (T6)

Sobre el HEAD de la T6 (el código del atlas es el de `27ddc36`: la T6 solo cambia verificador, pruebas, procedencia y
documentación):

- `python3 scripts/verificar_repo.py`: **91/91** (84 + 7 comprobaciones nuevas, § 9).
- `python3 -m unittest discover -s tests`: 89 pruebas (68 + 21 nuevas), todas en verde.
- `python3 scripts/construir.py --check`: correcto. `python3 scripts/verificar_publicacion.py`: correcto, con la
  puerta en **NO_GO** (esperado). `node scripts/reproducir_pb01.cjs`: `known_defect_reproduced: true`.
- `node scripts/generar_imagenes_atlas.cjs --check` (47 con copia, 3 sin copia) y
  `node scripts/generar_costas_atlas.cjs --check` (SHA-256 `f701f887…a5c5`): correctos.
- Humo escritorio sin terceros (servidor local, 592 s) contra la línea base, con `--inventario` e `--inestables`:
  **0 pérdidas**, 60 mejoras, 156 «otras» (funciones nuevas de T3-T5), 1 inestable (patrón del simulador); 31/31
  vistas; 57/57 funciones; 6 violaciones de CSP, todas `img-src` de `tile.opentopomap.org` (capa «Topográfico»);
  reposo 6 mutaciones en 5 s; `inventarioAusente` solo «ESPECIES» de Constructor, ya ausente en la línea base. Las
  mismas cifras que el cierre de la T5 en esa condición. No se repitieron las otras tres condiciones.

Cierre de la T5 (cuatro condiciones, sobre `27ddc36`): 0 pérdidas; 60-65 mejoras; 31/31 vistas; 57/57 funciones;
violaciones de CSP solo `img-src` de OpenTopoMap (4-6); 6 mutaciones en 5 s de reposo; tormenta sin terceros con la
ficha abierta 10 s: 0 peticiones por segundo en reposo, 0 reintentos de la misma imagen, 0 excepciones.

### 8.1. Mediciones de cierre de la tanda de arreglos (T7)

Sobre el HEAD de la T7 (código del atlas de `2599440`; después solo cambian documentos y procedencia, y el archivo
importado `atlas/POLITICA-PRIVACIDAD-DOCENTE.md`, que el atlas no carga):

- Humo en las **cuatro condiciones** contra la línea base, con `--inventario` e `--inestables`: **0 pérdidas** en las
  cuatro (mejoras 60 / 63 / 65 / 64 en escritorio sin y con terceros y teléfono sin y con terceros); 31/31 vistas;
  60/60 funciones (las 57 anteriores y las 3 nuevas de la T7); violaciones de CSP solo `img-src` de
  `tile.opentopomap.org` (6 en escritorio, 4 en teléfono); reposo 6 mutaciones en 5 s; `inventarioAusente` solo
  «ESPECIES» de Constructor, ya ausente en la línea base.
- axe-core 4.10.2, todas las reglas, a 390, 820 y 1366 px: **0 infracciones** en la portada, las 31 vistas y el panel
  «Vistas»; en nueve diálogos y en todas las pestañas de dos fichas, solo las 3 del Comparador (T7-13).
- Las sondas del verificador, repetidas: panel «Vistas» y Glosario 0 px de desplazamiento; salto con la franja a 0 px;
  región de la comparación guiada con foco; Filogenia sin recortes; marcadores de Clima < 24 px 0; red 6 / 31
  peticiones a los mismos hosts; `?view=` hostil sin cambios.
- `verificar_repo.py`, `construir.py --check`, `verificar_publicacion.py` (NO_GO), `reproducir_pb01.cjs`, `unittest` y
  los dos generadores con `--check`: véase el informe de la T7 para las cifras exactas sobre el HEAD final.

### 8.2. Decisiones de la titular del 20-11-2026 (tanda T8)

Commits `958170c` (MIS 8), `e8129f3` (QR), `929b786` (pies), `92f29a6` (cladograma) y `f6e84db` (pruebas); informe
`notas/informes/T8.md` de la carpeta de la ronda, con la tabla taxón por taxón de los 21 pies. Medido sobre el código
del atlas de `92f29a6`:

- **Simulador** (sonda de 0 a 315 ka, de 1 en 1): 244-299 ka «MIS 1 · Holoceno» → «MIS 8 · glacial»; 279 ka → MIS 8;
  nueve tramos contiguos y 0 edades sin estadio. Los límites de MIS 1-9 de `008` coinciden con `006`.
- **Hoja académica** (exportación de la ficha de *afarensis* con terceros simulados): peticiones a `api.qrserver.com`
  1 → 0, infracciones de CSP 1 → 0, `.academic-qr` 1 → 0; «Recurso» conserva la dirección. El humo no ejercita esta
  exportación, de modo que la retirada no aparece en su comparación: es la única eliminación autorizada de la tanda.
- **Pies**: cambian los 21 taxones con otra fotografía y ninguno más (de 47 con copia local); ningún pie nuevo contiene
  la nota escrita para la imagen anterior. Las páginas de Commons no pudieron abrirse (no admitidas en la sesión).
- **Cladograma**, modo normal a 390, 820 y 1366 px: rótulos < 12 px 83 → 0 (mínimo 6,93 → 12,13 px en nombres, eje
  y códigos); solapes entre cajas de texto 4 → 0; nombres sobre ramas 26 → 0; texto fuera de su píldora 2 → 0;
  solapes entre píldoras 0 → 0. «Ver el gráfico entero»: mínimo 12,01 px, 0 solapes (antes, 4 solapes y 28 nombres
  sobre ramas; el modo mostraba 2 044 px y ahora 1 266).
- **axe-core 4.10.2**, todas las reglas, a 390, 820 y 1366 px: Filogenia (detalle y «entero»), fichas de *afarensis*,
  *erectus* y *orrorin* con todas sus pestañas y hoja académica: 0 infracciones, salvo `color-contrast` (3) en las
  píldoras `.known.fossil-pill` de la ficha de *orrorin* a 390 px (`#c07800`, 3,54:1), idéntico en `996a64d`:
  preexistente y ajeno a la T8; no se corrige (fuera de las cuatro decisiones).
- **Humo** en las cuatro condiciones contra la línea base, con `--inventario` e `--inestables`: 0 pérdidas (mejoras 60 /
  63 / 65 / 64); 31/31 vistas; 60/60 funciones; CSP solo OpenTopoMap (6 en escritorio, 4 en teléfono); 1 inestable (el
  del simulador); `inventarioAusente` solo «ESPECIES» de Constructor.
- `verificar_repo.py` 91/91; `unittest` 96 pruebas (89 + 7 nuevas); `construir.py --check`, `verificar_publicacion.py`
  (NO_GO), `reproducir_pb01.cjs` (defecto reproducido) y los dos generadores con `--check`: correctos.

## 9. Comprobaciones nuevas del verificador

Estáticas, sin navegador (`comprobaciones_atlas_pbgh11` en `scripts/verificar_repo.py`; pruebas en
`tests/test_atlas_pbgh11.py`, donde cada una pasa sobre el repositorio y falla con un caso preparado):

1. Hojas y scripts de `95-sistema` enlazados tras los importados, una vez cada uno, con `?v=pbgh11`, y `carga-fin.css`
   como último `<link>` (lista cerrada de los seis que van en su sitio: `carga.css`, `sin-js.css`, `en-linea-*.js`,
   `respaldo-portada.js`).
2. CSP de `atlas/index.html` idéntica a la vigente.
3. `95-sistema` sin manejadores en línea, `eval`, `new Function`, temporizadores con cadena, escuchas en captura,
   peticiones de red ni hosts fuera de los de `img-src` (más los enlaces de licencia y el espacio de nombres SVG). Los
   `en-linea-*.js` conservan sus escuchas en captura originales solo mientras sean literalmente el script del snapshot
   de `index.html`.
4. La lista blanca de `?view=` de `077` coincide con las 31 secciones `.view-section` (30 en el marcado y
   Paleoecología, que inserta `007`); `enlace-vista.js` solo acepta ids literales de una `.view-section` de
   `#main-content`.
5. `generar_imagenes_atlas.cjs --check`. 6. `generar_costas_atlas.cjs --check`.
7. Procedencia: estado anterior archivado, motivo, evidencia, impacto y retorno de cada archivo de gobierno modificado.

El humo no entra en el verificador (Chromium, ~10 min por condición): cuándo y cómo se ejecuta, en
`scripts/atlas/README.md`.

## 10. Corrección posterior: el dato no siempre entra en el primer pantallazo (23-11-2026)

Medida independiente, tras la fusión de la ronda (`main`, `58344bf`), con `scripts/atlas/primer-dato.cjs`
(Chromium sin red de terceros; `?view=<id>#main-content` y 4,2 s de espera; «primer dato» = primer bloque con
tarjeta, tabla, gráfico, lista o imagen tras la cabecera de la vista; medida aproximada):

| Viewport | Vistas medidas | Mediana del primer dato | Primer dato bajo el pliegue |
|---|---|---|---|
| 1366×768 | 30 de 31 | 543 px (71 % del alto) | 7: Clima, América, Asia, Europa, Constructor, Centro docente, Recursos |
| 390×844 | 30 de 31 | 796 px (94 % del alto) | 13: Clima, América, Asia, Europa, Estratigrafía, Tafonomía, Paleogenómica, Coexistencias, Constructor, Primatología, Centro docente, Recursos, Biogeografía |

No se mide Paleoproteómica (no tiene cabecera de vista, § 5). La causa en escritorio es la pila fija: barra de 56 px,
franja «Consulta y filtros» de 61 px y cabecera de vista de 187 px (el dato empieza a 359-501 px aun en las vistas
buenas); en Constructor la cabecera ocupa 988 px y el dato empieza a 1 160 px. Por tanto, la fila «El dato entra en
el primer pantallazo» de § 0 y la regla 1 de las vistas de datos de `SISTEMA.md` son un **objetivo parcialmente
cumplido**, no un resultado: el humo (`vista.posicion`) solo comprobaba barra y título. No se ha cambiado ningún
diseño por esta medida: reducir la pila es una decisión de diseño: queda como propuesta pendiente de la decisión de la titular.
La carga en frío de `atlas/index.html` en escritorio fue de 197 peticiones y 7,66 MB (4,08 MB de JPEG, 2,52 MB de
JavaScript, 0,74 MB de CSS), con 116 etiquetas `script` y `link` en el HTML.

