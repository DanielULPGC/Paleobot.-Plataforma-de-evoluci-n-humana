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
| **Alto → resuelto** | El dato entra en el primer pantallazo; la navegación cabe en una franja de 56 px; cada diálogo recibe y devuelve el foco; el atlas funciona sin terceros (imagen principal local, Leaflet alojado, costas locales, sin Google Fonts); simulador y Recursos sin errores; foco visible en todo el atlas; contraste de texto 0 infracciones | 4-16 |
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
`95-sistema/`; tras ello las comprobaciones estáticas del atlas siguen en verde. Dependencias: `diagnostico.js` y
`enlace-vista.js` usan `PBDesplazamiento` solo si existe; `buscador.js` usa `PBDialogoUnico` solo si existe;
`herramientas.js` no hace nada sin la franja de `barra.js` (el conmutador y «Arriba» quedarían donde los deja 071).
Retirar `dialogo-unico.css` retira también reglas que añadieron después la T4 (comparador, 200 %) y la T5 (320 px).
Ninguna reversión se ha ejecutado con el humo: es una comprobación estática y de dependencias.

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
| H4 | Simulador | todos | Entre 243 y 300 ka rotula «MIS 1 · Holoceno»: falta MIS 8 en `008` | media (contenido) | **Pendiente de la titular** (§ 6) |
| H5 | Ficha (anoiapithecus, gautengensis) | sin red | El pie decía «Imagen abierta trazable · CC0» de una imagen remota sin copia | media | **Corregida** · `81c0ee2` · «Imagen remota sin copia local»; licencia «no verificada en este repositorio» |
| H6 | Minimapa de la ficha | todos | Capa «Topográfico» (OpenTopoMap) fuera de la CSP: 4-10 violaciones `img-src` por humo | media | **Pendiente de la titular** (§ 6) |
| H7 | Ficha académica impresa | impresión | QR pedido a `api.qrserver.com` (fuera de `img-src`): imagen rota; enviaría la URL a un tercero | media | **Pendiente de la titular** (§ 6) |
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
| H25 | `atlas/POLITICA-PRIVACIDAD-DOCENTE.md` | — | Sigue declarando que el atlas contacta con Google Fonts y cdnjs (ya no lo hace) | baja | **Pendiente de la titular** (§ 6; archivo importado, no se tocó) |
| H26 | `THIRD_PARTY_NOTICES.md`, `LICENSE_STATUS.md`, `README.md` | — | Describen la licencia de Leaflet como MIT; el `LICENSE` de 1.9.4 (también la copia de R98) es BSD de 2 cláusulas | baja | **Anotada** en `THIRD_PARTY_NOTICES.md` (fila nueva); las líneas previas no se cambiaron (§ 6) |
| H27 | `atlas/imsmanifest.xml` | — | No enumera 53 rutas locales que referencia `index.html`: los 48 archivos de `95-sistema`, Leaflet alojado (2), `084` de PB-GH-09, la hoja base y el enlace a la consulta ligera | baja | **No se toca** (§ 6): el verificador solo exige que existan los listados y el paquete IMS es un artefacto de LMS fuera del proyecto |
| H28 | L2 de la ronda | — | Ningún L2 se revierte limpio con `git revert` sobre el HEAD final | media (gobierno) | **Documentada** la vía comprobada (§ 3) |

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
11. **QR de la ficha académica**: (a) retirar el `<img>` y dejar la URL en texto (ya se imprime); (b) generar el QR en
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
| MIS 8 ausente en el simulador (`008`) | Entre 243 y 300 ka el simulador rotula «MIS 1 · Holoceno»; la escala del propio atlas (`006`, que cita a Lisiecki y Raymo, 2005, *Paleoceanography*, 20, PA1003, https://doi.org/10.1029/2004PA001071) sí tiene «MIS 8 · 300-243 ka», y los demás límites de `008` coinciden con ella. La tabla de límites LR04 de la fuente no se ha podido abrir en la ronda | Añadir `{mis:'MIS 8', start:300, end:243, climate:'glacial'}` y que `currentMis()` devuelva «sin estadio» en vez del último elemento (no ejecutado: es contenido) |
| QR de la ficha académica | Imagen rota al imprimir | L3-11 (a) o (b) |
| `atlas/POLITICA-PRIVACIDAD-DOCENTE.md` | Declara contactos con Google Fonts y cdnjs que ya no ocurren (sobredeclara; no omite ninguno nuevo) | Actualizarla (archivo importado: exige procedencia) |
| Licencia de Leaflet en la documentación | `THIRD_PARTY_NOTICES.md`, `LICENSE_STATUS.md` y `README.md` dicen MIT; el texto conservado es BSD de 2 cláusulas | Corregir esas líneas (la T6 solo lo anota) |
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
  remota que citaba la ficha (georgicus: la misma pieza con otro fondo); el título pasa al objeto de la copia y la
  nota conserva, rotulada, la referencia anterior. El resto de imágenes de la ficha (galería de evidencia, lentes)
  siguen remotas con respaldo local.
- **CLS por vista con capturas**: `recorrido.cjs` con capturas da valores sueltos (0,2-0,56) en tres vistas que no se
  reproducen sin el paso de captura (humo `cls`: 0 en 11 vistas y cuatro condiciones; `recorrido.cjs --sin-capturas`:
  máximo 0,009). La hipótesis (el estilo temporal de la captura de página entera) no está demostrada.
- **Arnés**: en las capturas de `recorrido.cjs` la franja fija tapa los primeros 56 px de cada vista (al navegar no
  ocurre); no se adaptó el script.
- **axe**: completo (todas las reglas) en las 31 vistas solo en la T5 (261/260/256 → 0 infracciones a 390/820/1366 px);
  en los diálogos, solo las reglas de nombre, `aria-hidden` y contraste. Un `color-contrast` en Síntesis que ya estaba
  antes de la T3 no se volvió a medir después.
- **Reversión de los L2**: comprobada de forma estática (§ 3), no con el humo.
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
- Humo escritorio sin terceros contra la línea base: resultado en el informe T6 (`notas/informes/T6.md`).

Cierre de la T5 (cuatro condiciones, sobre `27ddc36`): 0 pérdidas; 60-65 mejoras; 31/31 vistas; 57/57 funciones;
violaciones de CSP solo `img-src` de OpenTopoMap (4-6); 6 mutaciones en 5 s de reposo; tormenta sin terceros con la
ficha abierta 10 s: 0 peticiones por segundo en reposo, 0 reintentos de la misma imagen, 0 excepciones.

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
