# Auditoría y rediseño de diseño de producto · PB-GH-10

Ronda del 12-11-2026 sobre la rama `feat/pb-gh-10-diseno`, desde 693055f, con las correcciones de la verificación
independiente del 13-11-2026 (commits 222dd42 a 3354b55; la verificación rebajó a parcial las filas 20, 21, 31 y
36, puso reservas a las 1 y 38 y encontró 2 hallazgos altos, 8 medios y 10 bajos: § 1.1). Destinatario: alumnado del Diploma de
Estudios Africanos (ULPGC). Sin publicación: la puerta de publicación sigue en NO_GO.

Herramientas de medida: Playwright con Chromium (SwiftShader para la portada WebGL), axe-core 4.10.2 (wcag2a/aa,
21a/aa, 22aa y best-practice), scripts propios de piso (desbordamiento, objetivos táctiles, CLS, recorrido de
foco, inventario de tokens, contraste en píxeles) y de estados (sin JavaScript, sin almacenamiento, impresión,
imagen rota). Viewports: teléfono 390 × 844, tableta 820 × 1180, escritorio 1366 × 800, reflujo 320 × 640 y letra
al 200 %. Sistema resultante: `docs/diseno/SISTEMA.md`. Procedencia: `provenance/PB_GH_10_CORRECCIONES.json`.

## 1. Tabla de corrección (40 filas) con su estado final

Severidad: **bloqueante** (se pierde contenido o función en una ruta principal), **alta** (incumple WCAG 2.2 AA o
rompe la experiencia de forma visible), **media**, **baja**.

| # | Página | Viewport | Problema | Sev. | Estado final (commit · medición antes → después) |
|---|---|---|---|---|---|
| 1 | recorrido/introduccion.html | todos | Texto superpuesto bajo el póster; «Comenzar» solapa «Repetir»; entradilla a 1,74:1; en vertical el escenario (390 × 219 px) recorta «Comenzar» | bloqueante | **Hecho** · 18f8c58 y 74ecf70 · solapes en reposo y en las escenas 0, 2, 5 y 7 → 0 en cuatro anchos, con y sin movimiento reducido; entradilla 1,74 → 11,9:1. Reservas de la verificación resueltas en 74ecf70 (tarjeta y pie en el flujo cuando no caben): textos tapados / solapes a 320 px 1/1 → 0/0, con letra al 200 % a 390 px 4/9 → 0/0 y a 1366 px 3/2 → 0/0; h1 al 200 % en 390 px, 557 px desde x = −83 → 308 px dentro de la pantalla |
| 2 | recorrido/index.html | todos | Sin JavaScript y al imprimir, los cinco bloques `.revelar` quedan invisibles | bloqueante | **Hecho** · 4fd475a · invisibles sin JS 5 → 0; al imprimir 5 → 0 |
| 3 | dea/ | todos | Sin JavaScript solo se ven cabecera y entradilla; no hay `<noscript>` | alta | **Hecho** · c49cc12 · aviso `<noscript>` con salida a la consulta ligera (0 → 1) |
| 4 | dea/ | todos | Con almacenamiento bloqueado, notas y «Sesión hecha» se pierden sin aviso | alta | **Hecho** · c49cc12 · aviso visible si el navegador no permite guardar |
| 5 | recorrido (parentesco y todas) | teléfono, tableta | Foco tapado por el botón fijo «Laboratorio completo» | alta | **Hecho** · a0d30bb · focos tapados: parentesco 2 → 0, introducción 2-3 → 0 |
| 6 | recorrido/cronologia.html | teléfono | Etiquetas de la fila siguiente tapan la barra enfocada; barras reducidas a 1-2 letras | alta | **Hecho** · 68246c0 · focos tapados 15 → 0 (teléfono), 5 → 0 (tableta) |
| 7 | dea/ | 320 px | Desplazamiento horizontal (`scrollWidth` 339 > 320) por los ajustes | alta | **Hecho** · 31af692 (provisional) y a334a5a (L2-2) · sin desbordamiento; cabecera + pestañas 228 → 162 px a 320 px |
| 8 | dea/ | todos | Contorno de campos y botones a 1,54:1 | alta | **Hecho** · 31af692 · 1,54 → 3,65:1 (3,33:1 sobre papel) |
| 9 | ligera/ | todos | Foco #d39000 a 2,46:1 | alta | **Hecho** · 53708ef · 2,46 → 6,4:1 sobre blanco |
| 10 | portada-sylva.html | teléfono, tableta | El acceso DEA es un icono sin texto visible | alta | **Hecho** · acc7f7e · rótulos visibles bajo 900 px; dos filas de tres bajo 440 px |
| 11 | portada-sylva.html | teléfono | El dock pisa el h1 (5 px) | media | **Hecho** · acc7f7e · a 390 px dock en y 15-145 y título desde y 161 |
| 12 | dea/#inicio | escritorio | CLS de carga 0,136 | media | **Hecho** · c49cc12 y 31af692 · 0,136 → 0 (scripts con `defer` y contenido oculto hasta que termina el script, con salida a los 2 s) |
| 13 | recorrido/cronologia, metodos, clima | escritorio | CLS de carga 0,278 / 0,175 / 0,113 | media | **Hecho** · 68246c0 · las tres → 0 (con `datos.js` retrasado 400 ms) |
| 14 | atlas/index.html | tableta, escritorio | CLS de carga 1,19 / 1,67 | media | **No hecho** · solo diagnóstico: el atlas v1 queda fuera del rediseño; se anota como propuesta |
| 15 | recorrido/cronologia, territorio | teléfono | Tabla desplazable no alcanzable con teclado (axe `scrollable-region-focusable`) | media | **Hecho** · 68246c0 · `tabindex="0"` y `role="region"`; axe 0 |
| 16 | recorrido/territorio, parentesco | todos | `heading-order` (h1 → h3) | media | **Hecho** · 68246c0 · h3 → h2; axe 0 |
| 17 | recorrido (todas) | todos | axe `region`: enlaces fuera de puntos de referencia | baja | **Hecho** · a0d30bb y 68246c0 · axe 0 en 10 páginas × 3 viewports |
| 18 | recorrido/introduccion.html | teléfono, tableta | Sin `main` | baja | **Hecho** · 18f8c58 · `main` como escenario |
| 19 | recorrido (siete páginas) | movimiento reducido | `scroll-behavior: smooth` con `reduce` | media | **Hecho** · a0d30bb · 7 páginas → 0 |
| 20 | recorrido (todas) | todos | Enlaces con el anillo por defecto, poco visible | media | **Hecho** · a0d30bb y e76da61 · anillos < 3:1 por página 2-15 → 0 (#ffd166, ≥ 8:1). La verificación la rebajó a parcial porque los nodos SVG de parentesco (52) y territorio (24) no tenían el anillo del sistema y «Cuenca del lago Victoria» quedaba tapada (1,14:1); e76da61 pone el color de foco en el contorno del propio nodo (en píxeles de pantalla; halo continuo en parentesco) y atenúa los rótulos vecinos: fracción del contorno con color de foco (24 muestras por nodo) ≥ 0,67 en parentesco a 390 px y ≥ 0,88 en los demás casos; 0 nodos tapados |
| 21 | recorrido (todas) | teléfono | Controles de la barra de 24 px de alto | baja | **Hecho** · a0d30bb y e76da61 · 44 px bajo 720 px; el que quedaba («Ver la introducción» de atlas.html a 390 px, 24 px, señalado por la verificación) pasa a 44 px: controles de barra < 44 px en las diez páginas a 390 px 1 → 0 |
| 22 | recorrido/territorio, parentesco, cronologia | teléfono, tableta | Objetivos < 24 px dentro de los gráficos | media | **Parcial** · 68246c0 · parentesco en tableta 55 → 3; en teléfono siguen por debajo de 24 px, según la verificación, 53 objetivos en parentesco, 66 en cronología y 39 en territorio (32 en territorio en tableta). Cronología y territorio remiten a la tabla (cada táxon enlaza a su ficha); una zona circular en territorio se probó y se retiró porque aumentaba los focos tapados. No hay arreglo limpio que no toque la lógica de los gráficos: queda como propuesta L3 (§ 4, n.º 8) |
| 23 | dea/#mapa | teléfono | Seis puntos apilados en el Rift; 5 focos tapados; foco solo con cambio de trazo | media | **Hecho** · 806e4c0 (L2-7), 4a8cb2a y fb6ddb6 · foco sin indicador 12 → 0; focos tapados 5/5/4 → 0. El anillo cuadrado que pisaba a los marcadores vecinos y se recortaba en el borde del recuadro (B7 de la verificación) es ahora circular, sobre la zona del propio marcador |
| 24 | dea/#especies | todos | Etiqueta «Buscar» centrada; campo de 286 de 358 px | media | **Hecho** · 31af692 · campo a todo el ancho |
| 25 | dea/#especies | todos | Imagen que no carga: icono roto y alt sobre un cuadro vacío | media | **Hecho** · c49cc12 · aviso con el alt; crédito intacto |
| 26 | dea/#especies | todos | «1 fichas.» | baja | **Hecho** · c49cc12 |
| 27 | dea/#especies, #glosario | todos | Estado vacío sin salida | baja | **Hecho** · c49cc12 · «Borrar la búsqueda» y «Buscar también fuera de África» |
| 28 | atlas/index.html | escritorio | Diálogo Bibliografía: al cerrarse, el foco vuelve a `body` | media | **No hecho** · se deja como propuesta (§ 4); el atlas v1 solo recibió piso de bajo riesgo |
| 29 | atlas/index.html | todos | Interfaz sin tildes («actualizacion 3 anos», «Africa 2023-2026», «region»…) | media | **Parcial** · cb8dfe7 · corregidas «actualización 3 años» y «África 2023-2026» en contador y filtro; el título de grupo «Africa 2023-2026 · …» no se toca porque la búsqueda lo compara (`groupTitle.includes`); las demás palabras de la fila no se trataron |
| 30 | atlas/index.html | todos | Dos h1 visibles | baja | **Hecho** · cb8dfe7 · h1 accesibles 2 → 1 en tres viewports |
| 31 | atlas/index.html | todos | Emoji en la interfaz («🔗 Con DOI», «⏱ 15 min», 1,8:1) | baja | **Hecho** · cb8dfe7 y f11bf4b · «Con DOI», «N min»; los chips de competencias («🔬 STEM», «💬 CCL»), que la verificación encontró, muestran solo el código (el nombre completo sigue en `title` y `aria-label`; ningún módulo compara esas cadenas). Quedan emoji en la guía «Por dónde empezar» del atlas v1 (`040-script.js` y pestañas de `atlas/index.html`), que la fila no recogía: anotados en § 5 |
| 32 | ligera/ | todos | Imágenes remotas de Wikimedia aunque hay copias locales | media | **Hecho** · 77dbb7b · 47/47 imágenes locales; 0 peticiones fuera del origen |
| 33 | ligera/ | todos | Falta un punto en el pie de imagen fallida | baja | **Hecho** · 53708ef |
| 34 | ligera/ | todos | Salto h2 → h4 | baja | **Hecho** · 53708ef · h4 → h3 |
| 35 | recorrido (todas) y atlas | todos | Dependencia de Google Fonts (y en el atlas, Leaflet, teselas y Wikimedia) | media | **Parcial** · 0818e5f · recorrido: peticiones externas 1 → 0 por página y errores de consola 2 → 0; el atlas v1 sigue dependiendo de terceros (solo anotado) |
| 36 | recorrido (todas) | impresión | Sin estilos de impresión: fondo oscuro y botón fijo | media | **Hecho** · a0d30bb y e76da61 · fondo blanco y 0 fijos visibles en las 10 páginas. La verificación halló «Explorar el atlas» negro sobre negro; repasadas las diez páginas con fondos impresos, textos < 4,5:1 al imprimir 71 → 0 (el botón, el pie de crédito de la introducción y los rótulos SVG claros de territorio y parentesco) |
| 37 | dea/ | impresión | Se imprimen solo las sesiones abiertas, sin aviso | baja | **Hecho** · c49cc12 · nota impresa |
| 38 | dea/ (pestañas) | teléfono | Solo 4 de 10 pestañas visibles; única pista una máscara | media | **Hecho en su mínimo** · 2decc31 (L2-3) y fb6ddb6 · lista «Secciones» con las diez; el cambio de modelo (tres grupos, barra inferior) queda como propuesta. Regresión de la verificación corregida: al tabular, «Especies» y «Repaso» quedaban bajo la máscara junto a «Secciones» (indicador 1,99:1); ahora la pestaña enfocada se desplaza entera a la vista, sin máscara y con el anillo por dentro (5,8:1): pestañas cortadas al tabular, hacia delante y hacia atrás, 2 → 0 a 390 px y 10 → 0 a 320 px |
| 39 | dea/#tiempo | todos | Nombres enlazados de 20 px de alto | baja | **Hecho** · 31af692 · 24 px |
| 40 | recorrido/introduccion.html | todos | «Volver» de 49 × 36 px y recortado en escritorio (y = −4) | baja | **Hecho** · 18f8c58 · a 12 px del borde y 44 px de alto (49 × 44 en teléfono) |

Recuento: 35 hechas (la 38, en su mínimo L2), 3 parciales (22, 29 y 35) y 2 no hechas (14 y 28). Las filas 20, 21,
31 y 36, que la verificación rebajó a parcial, y las reservas de las 1 y 38 quedan resueltas con las mediciones de
la tabla.

### Defectos encontrados fuera de la tabla

| Página | Defecto | Estado |
|---|---|---|
| recorrido/atlas.html | El mismo defecto que la fila 2: 15 bloques invisibles sin JS y 6 al imprimir | **Hecho** · 4fd475a · 15 → 0 y 6 → 0 |
| recorrido/ficha.html | CLS de carga 0,125 | **Parcial** · 68246c0 · 0,125 → 0,048 |
| recorrido/introduccion.html | «Interpretación A» pintada en negro por una regla dentro de una @media mal cerrada; «Volver al atlas» sin relleno | **Hecho** · 18f8c58 |
| recorrido/introduccion.html | El crédito «CC BY-NC 4.0» no se veía nunca (`.overlay.oculto ~ .pie`) | **Hecho** · 31fdbbc · visible en las tarjetas a 12,2:1 |
| portada-sylva.html | La baldosa clara «Recorrido» pintaba su símbolo de blanco sobre #eef1e7 | **Hecho** · acc7f7e |
| dea/#mapa | «Canarias» montado sobre la costa y pegado al punto 1; puntos de posición medio tapados junto a los marcadores 9, 10 y 11 del recuadro del Rift | **Hecho** · 4a8cb2a |
| dea/#especies | Resumen de ficha abierta con el nombre arriba y un hueco debajo (2/15 px); anillo de foco rozando el nombre | **Hecho** · 4a8cb2a · 8/8 px en tableta y escritorio en los cuatro estados |
| dea/#comparar (tableta) | Piso marca un foco «tapado» en el pie de imagen | Falso positivo documentado en 37b2ed3 (el enlace parte en dos líneas y el centro de su caja cae sobre el enlace vecino) |

### 1.1. Hallazgos de la verificación independiente y su estado

Verificación externa del 13-11-2026 sobre 2efa4b5. Medición «antes» = la de la verificación; «después» = la propia
tras el arreglo, con los mismos scripts de la verificación (`piso_v.cjs`, axe-core 4.10.2) o con uno equivalente
citado en el commit.

| Hallazgo | Estado | Commit | Antes → después |
|---|---|---|---|
| A1 · Proyección + oscuro: `--tinta-2` heredada del claro | **Resuelto** | 222dd42 | axe `color-contrast` en las 10 vistas de DEA a 390 y 1366 px: 1-34 por vista → 0; `--tinta-2` 1,74:1 → 12,54:1 sobre papel. El verificador calcula ahora el contraste de las parejas de tokens en los cuatro temas |
| A2 · Órdenes de reversión falsos | **Resuelto en la documentación** (no se reescribe la historia) | este documento, § 2.1 | Órdenes comprobados de nuevo uno a uno en un worktree aparte |
| M1 · Foco de pestañas bajo «Secciones» (regresión) | **Resuelto** | fb6ddb6 | Pestañas cortadas al tabular: 2 → 0 (390 px), 10 → 0 (320 px); indicador 1,99:1 → 5,8:1 |
| M2 · Introducción a 320 px y al 200 % | **Resuelto** | 74ecf70 | Ver fila 1 |
| M3 · Ligera al 200 % en teléfono | **Resuelto** | 5b13e47 | `scrollWidth` a 390 px: 613 → 390 (también 320 px al 200 %: 358 → 320) |
| M4 · `#mapa/<región no africana>` con «undefined» | **Resuelto** | fb6ddb6 | `#mapa/europa`: «undefined Europa» → «Europa», aviso de región fuera del mapa, su lista y enlace de vuelta |
| M5 · Nodos SVG sin el foco del sistema | **Resuelto** | e76da61 | Ver fila 20 |
| M6 · Tres frases de Inicio retiradas sin reubicar | **Resuelto** | 6d7ab0f | Las tres vuelven a Inicio (entradilla y nota de privacidad) |
| M7 · Falsos negativos del verificador | **Resuelto** | 222dd42 y 81dbc61 | Colores con nombre, `hsl()`, `color-mix()` con literales, `font:` en bruto, bordes con color en bruto, línea borrada de «Su trabajo» y contraste de tokens: 0 → 9 pruebas negativas que fallan como deben |
| M8 · Documentación contradicha | **Resuelto** | este documento, SISTEMA y CHANGELOG | Filas, § 2, § 3, SISTEMA § 6 y CHANGELOG corregidos |
| B1 · «Explorar el atlas» negro sobre negro al imprimir | **Resuelto** | e76da61 | Ver fila 36 |
| B2 · «Atlas completo» fijo tapa «03 · Clima» al 200 % | **Resuelto** | e76da61 | Con la letra por encima de 20 px el enlace va en el flujo; piso de atlas.html a 1366 px al 200 %: 0 tapados |
| B3 · Mayús+Tab deja abierto «Ajustes» | **Resuelto** | fb6ddb6 | `aria-expanded` tras Mayús+Tab: `true` → `false` (también en «Secciones»); el clic sigue alternando |
| B4 · Recuento de regiones sin unidad | **Resuelto** | fb6ddb6 y 3354b55 | «6» → «6 especies» visible; con letra al 200 % pasa bajo el nombre (`scrollWidth` 469 → 390) |
| B5 · Intervalo completo de Tiempo ya no visible | **No procede como pérdida** (decisión del director: reubicado) | — | Visible en «Cuándo» de cada ficha y en el nombre accesible de cada barra; al imprimir Tiempo, 29 de 29 filas con nombre y rango legibles |
| B6 · `#tiempo/erectus` en carga directa: foco en `body` | **Resuelto** | fb6ddb6 | Foco en el nombre en 6 de 6 cargas (el contenido se mostraba después de enfocar, oculto) |
| B7 · Anillo del mapa cuadrado | **Resuelto** | fb6ddb6 | Ver fila 23 |
| B8 · Ligera suelta sin imágenes | **Límite conocido, degradación mejorada** | 5b13e47 | Consecuencia de la decisión de la titular (copias locales). Sin JavaScript, recuadro con el texto alternativo en lugar del icono roto; crédito, licencia y «Ficha de la imagen» intactos |
| B9 · Atlas v1: emoji en chips y contraste del diálogo Bibliografía | **Resuelto en los chips; contraste no procede en esta ronda** | f11bf4b | Ver fila 31. Los 140 nodos del diálogo con contraste insuficiente son anteriores a la ronda y están fuera de la tabla (atlas v1 solo con piso de bajo riesgo): § 5 |
| B10 · Dos `outline-offset: 3px` en bruto | **Resuelto** | fb6ddb6 | `calc(var(--foco-desfase) + var(--linea))` (mismo resultado, con tokens) |
| Juicio de diseño, L1 | **Hechos** | fb6ddb6 y 8164659 | Pestaña actual con subrayado de acento; tarjetas de Métodos y Clima a su medida; índice de letras sin borde; recuadro del Rift al ancho del mapa en teléfono; fechas y «Debatida» en una línea en Tiempo. Capturas `diseno/l2/V-3…V-6_*` |
| Juicio de diseño, L3 | **Solo propuesta** | — | Puerta DEA como punto focal de la portada y una sola familia visual en la ruta: § 4, n.os 11 y 12 |

Nuevo defecto hallado al cerrar: con la letra al 200 % en el teléfono, el recuento «6 especies» ensanchaba los
botones de región y las horas del «día de 24 horas» desbordaban Tiempo (469 y 437 px en 390). Resuelto en 3354b55.

## 2. Cambios L2 (reestructuras aisladas)

Cada uno es un commit propio. Capturas completas en la carpeta de trabajo de la auditoría (`diseno/l2/`); pares
reducidos en `docs/diseno/evidencia/`. **Los L2 de DEA no son independientes entre sí**: todos tocan
`dea/dea.css`, `dea/dea.js` o `dea/index.html`, y los commits posteriores (pulido, correcciones de la
verificación) tocan las mismas líneas. La columna «Reversión» dice lo comprobado (§ 2.1).

| L2 | Commit | Qué cambia | Reversión (comprobada sobre 3354b55) | Capturas |
|---|---|---|---|---|
| L2-1 | e3e8003 | Rejilla de página común para cabecera, pestañas, contenido y pie; resumen de ficha en dos líneas | Solo en pila: los 16 commits de DEA desde 3354b55 hasta él | `L2-1_{antes,despues}_*.png`; evidencia `L2-1_rejilla_escritorio_*` |
| L2-2 | a334a5a | Menú «Ajustes» en teléfono y ajustes fantasma en escritorio | Solo en pila: 15 commits, desde 3354b55 | `L2-2_*`; evidencia `L2-2_ajustes_telefono_*` |
| L2-3 | 2decc31 | Lista «Secciones» visible y pestañas sin palabras cortadas | Solo en pila: 14 commits, desde 3354b55 | `L2-3_*`; evidencia `L2-3_secciones_telefono_*` |
| L2-4 | dd4dee4 | Bloque «Continuar» como punto focal de Inicio | Solo en pila: 13 commits, desde 3354b55 | `L2-4_*`; evidencia `L2-4_continuar_telefono_*` |
| L2-5 | 52b808b | Línea del tiempo como gráfico: rejilla, eje fijo, barra elegida | Solo en pila: 12 commits, desde 3354b55 | `L2-5_*`; evidencia `L2-5_tiempo_escritorio_*` |
| L2-6 | b9a073c | Fichas en una columna que se abren como página de manual | Solo en pila: 11 commits, desde 3354b55 | `L2-6_*`; evidencia `L2-6_fichas_escritorio_*` |
| L2-7 | 806e4c0 | Mapa con puntos numerados, recuadro del Rift y regiones por zona | Solo en pila: 10 commits, desde 3354b55 | `L2-7_*`; evidencia `L2-7_mapa_escritorio_*` |
| L2-8 | 37b2ed3 | Comparar con un solo gráfico, franja de coincidencia y créditos completos | **Por sí solo** | `L2-8_*`; evidencia `L2-8_comparar_telefono_*` |
| L2-9 | fbde9e0 | Modo proyección: ancho, contraste y una sola salida | **Por sí solo** | `L2-9_*`; evidencia `L2-9_proyeccion_escritorio_*` |
| L2-10 | 505fc52 | Glosario agrupado por letras con índice | Solo en pila: 7 commits, desde 3354b55 | `L2-10_*`; evidencia `L2-10_glosario_telefono_*` |

Cambios C (fundamentos compartidos): C-1 0818e5f (recorrido con la tipografía y los fundamentos del sistema base),
C-2 3af6df4 (consulta ligera en papel y tierra), C-3 77dbb7b (consulta ligera con copias locales), C-4 acc7f7e
(dock de la portada). Pulido final: 4a8cb2a. Su reversión, en § 2.1.

### 2.1. Reversión: lo comprobado

Método: para cada commit de la ronda, un worktree desacoplado en 3354b55 (en la carpeta de trabajo, fuera del
repositorio), `git revert --no-commit <commit>`, comprobación de conflictos, de marcas `<<<<<<<` y de la sintaxis de
`dea/dea.js`, y retirada del worktree. Si no revierte solo, se prueba la pila mínima: él y todos los commits
posteriores que tocan, directa o transitivamente, sus mismos archivos, revertidos del más reciente al más antiguo.
Lo que se afirmó antes de la verificación («independiente», «revertir antes L2-9», «requiere L2-1») era falso para
L2-2, L2-3, L2-4, L2-5 y L2-6 y queda sustituido por esta sección.

**Revierten limpio por sí solos** (desde 3354b55): L2-8 37b2ed3, L2-9 fbde9e0, pulido 4a8cb2a, C-3 77dbb7b,
C-4 acc7f7e, pie de licencia 31fdbbc, atlas v1 cb8dfe7 y las correcciones de código de la verificación salvo
222dd42: 6d7ab0f, fb6ddb6, e76da61, 74ecf70, 5b13e47, f11bf4b, 8164659 y 3354b55. Comprobado de nuevo sobre el
commit final de documentación, con el mismo resultado para todos los commits de código. Los commits de gobierno
(procedencia, verificador y documentación: e9149ba, 0aa490b, 2efa4b5, 222dd42 y 81dbc61) solo revierten en pila
con el commit final de documentación por delante, que sí revierte solo.
Respecto a la verificación cambian dos: L2-10 505fc52 y el L1 de Clima 88c819a revertían solos sobre 2efa4b5 y ya
no (8164659 y 3354b55 tocan sus líneas).

**Solo revierten en pila inversa** (todas comprobadas sin conflicto y con `dea/dea.js` válido):

| Commit | Pila, del primero al último que se revierte |
|---|---|
| DEA: L2-1 a L2-7, L2-10, L1 de Clima, c49cc12 y 31af692 | 3354b55 → 8164659 → fb6ddb6 → 6d7ab0f → 4a8cb2a → 88c819a → 505fc52 → fbde9e0 → 37b2ed3 → 806e4c0 → b9a073c → 52b808b → dd4dee4 → 2decc31 → a334a5a → e3e8003 (y después 31af692 → c49cc12). Cada uno se deshace revirtiendo esta secuencia hasta él (L1 de Clima: 3354b55 → 8164659 → fb6ddb6 → 4a8cb2a → 88c819a) |
| C-1 0818e5f | 74ecf70 → e76da61 → 0818e5f |
| Recorrido: 18f8c58, 4fd475a, a0d30bb, 68246c0 | 74ecf70 → e76da61 → 0818e5f → 68246c0 → a0d30bb → 4fd475a → 31fdbbc → 18f8c58, hasta el commit buscado |
| C-2 3af6df4 y 53708ef | 81dbc61 → 5b13e47 → 222dd42 → 2efa4b5 → 0aa490b → e9149ba → 77dbb7b → 3af6df4 (→ 53708ef) |
| A1 222dd42 | 81dbc61 → 5b13e47 → 222dd42 |
| c0dc4c0 (hoja base) | toda la ronda en orden inverso (28 commits) |

**Parejas**: las dos que funcionaban sobre 2efa4b5 («pulido → L2-7» y «C-3 → C-2») ya no bastan sobre 3354b55
(conflicto en 806e4c0 y en 3af6df4); tampoco «L2-9 → L2-5» ni «L2-9 → L2-2». Solo valen las pilas de la tabla.

**Procedimiento seguro para deshacer UNA reestructura que no revierte sola** (p. ej. L2-5):
1. En una rama nueva, revertir la pila de la tabla hasta ella incluida, del más reciente al más antiguo
   (`git revert --no-commit` en ese orden y un solo commit al final).
2. Volver a aplicar, con `git cherry-pick`, los commits posteriores que se quieren conservar (en el ejemplo, de
   b9a073c en adelante), resolviendo a mano los conflictos que aparezcan.
3. O bien, si es un cambio pequeño, deshacerla a mano tomando como referencia `git show <commit>` y su diff, sin
   revertir nada más.
4. En todos los casos: comprobar las diez vistas de DEA (sin errores de página, axe 0) antes de dar la reversión
   por buena.

**Tras cualquier reversión, `scripts/verificar_repo.py` falla**, porque varias reglas están atadas al estado final:
- revertir cualquier commit que toque archivos de código (comprobado con L2-8 37b2ed3 y con la corrección
  74ecf70): 79 en verde y 2 en rojo, «Entradas actuales coinciden con su procedencia» y «169 archivos Atlas v1
  conservan las huellas importadas o una corrección documentada», porque la huella corregida de
  `provenance/PB_GH_10_CORRECCIONES.json` ya no coincide;
- revertir la pila de C-2: 67 y 4 en rojo (se suman las de archivos de base preservados, porque la pila incluye
  la procedencia y el verificador);
- según la verificación (sobre 2efa4b5), revertir C-1 hace fallar además «sin Google Fonts», revertir C-2 la
  sincronía de tokens, y revertir un L2 de DEA puede devolver a `dea/dea.css` tamaños que la lista cerrada de
  excepciones no admite (p. ej. `#mapa-svg text: 2.1px`).
Qué hay que actualizar entonces: `corrected_sha256`, `change`, `evidence` y `return` de cada archivo tocado en
`provenance/PB_GH_10_CORRECCIONES.json` (y, si se revierte una corrección de dea/index.html, su lista
`textos_interfaz_reubicados`), las excepciones de `excepciones_fs` en el verificador si cambia la hoja de DEA, la
copia sincronizada de `src/entrada_ligera/estilos.css` si cambia la hoja base, y este documento.

## 3. Mediciones de cierre

Estado final (3354b55), medido con `piso_v.cjs` de la verificación y axe-core 4.10.2 (wcag2a/aa, 21a/aa, 22aa y
best-practice), sin red de terceros:
- **DEA**: 10 vistas × 390/820/1366 px × claro, oscuro, proyección clara y proyección oscura (120 casos): 0
  infracciones de axe, 0 desbordamientos, 0 peticiones externas, 0 errores de consola o CSP. Antes de A1, la
  proyección oscura daba 1-34 infracciones `color-contrast` por vista.
- **DEA a 320 px y con la letra al 200 % a 390 px** (10 + 10 casos, con todo desplegado): 0 desbordamientos y
  axe 0 (Mapa y Tiempo desbordaban al 200 % hasta 3354b55).
- **Recorrido**: 10 páginas × 390/820/1366/320 px y al 200 % a 390 px (50 casos): axe 0, sin desbordamiento, 0
  peticiones externas, 0 errores.
- **Consulta ligera**: 390/820/1366/320 px y al 200 % a 390 px: axe 0, sin desbordamiento (al 200 % antes 613 px).
- **Impresión del recorrido**: textos < 4,5:1 con fondos impresos 71 → 0 en las diez páginas.
- Tamaños de letra: DEA y recorrido con los 7 pasos de la escala (más el «display» del recorrido); consulta
  ligera, 5.
- Verificador: 81 comprobaciones en verde (10 nuevas en esta ronda: contraste de tokens y textos de
  dea/index.html, tras la verificación); pruebas del sistema de diseño: 27 (18 + 9 negativas nuevas).

## 4. Propuestas L3 (no ejecutadas)

Cambian el modelo de navegación, quitan o reubican funciones o cambian el lenguaje de raíz: solo se proponen.

1. **Navegación de DEA en tres grupos y barra inferior en el teléfono** (Estudiar: Inicio, Tiempo, Mapa,
   Especies, Comparar; Entender: Métodos, Clima, Glosario; Practicar: Repaso, Su trabajo). Hoy se resuelve con
   la lista «Secciones» (L2-3).
2. **Comparar desde la línea del tiempo**: elegir dos barras en Tiempo y abrir Comparar con ellas, sin pasar
   por los selectores.
3. **Recuadro del Rift con cartografía real** (relieve o fallas del Rift en vez del mismo contorno ampliado) y
   un tratamiento propio de «Todo el continente», que hoy es un punto más en el centro del mapa.
4. **Recorrido en papel claro**, con los mismos tokens que DEA (hoy conserva su fondo oscuro por decisión del
   director).
5. **Serif de lectura alojada** (con licencia libre, en `assets/fuentes/`) para el cuerpo de fichas y sesiones.
6. **Unificar el trato** del recorrido («tú») con el de DEA y la consulta ligera («usted»).
7. **Foco y relieve de la portada 3D**: anillo de foco del sistema en el dock y menos relieve y vidrio,
   comprobado con GPU real.
8. **Objetivos táctiles de los gráficos del recorrido** (fila 22): zonas de al menos 24 px en territorio y
   cronología sin aumentar los focos tapados, o sacar del tabulado el SVG cuando la tabla equivalente esté junto
   a él.
9. **Diálogo Bibliografía del atlas v1**: al cerrarse, el foco vuelve a `body` (fila 28, medido), y los informes
   de la ronda señalan además que no entra en el diálogo al abrirse; debe entrar en el primer control y volver
   al botón que lo abrió.
10. **CLS del atlas v1** (fila 14): reservar la altura de las vistas al iniciar.
11. **La puerta DEA como punto focal de la portada 3D.** Qué cambiaría: en el dock de `portada-sylva.html`, «DEA»
    pasaría a ser la baldosa destacada (clara, con su rótulo completo «Diploma de Estudios Africanos») y
    «Recorrido» quedaría como una baldosa más; o bien un acceso propio a DEA fuera del dock. Qué se gana: el
    público para el que se hace la ronda llega a su entrada sin buscarla entre seis iconos (hoy la única baldosa
    clara es «Recorrido» y se lleva la mirada). Riesgo: cambia la jerarquía de la portada, que es la de todo el
    sitio y no solo del DEA; toca la escena WebGL de 200 kB, que solo se ha podido medir con SwiftShader.
12. **Una sola familia visual en la ruta portada → DEA → recorrido → consulta ligera.** Qué cambiaría: hoy conviven
    tres lenguajes (vidrio y verde oscuro en la portada, petróleo oscuro en el recorrido, papel en DEA y en la
    consulta ligera); se llevaría el recorrido a papel claro (n.º 4) y la portada al foco, los radios y la
    tipografía del sistema, sin vidrio (n.º 7). Qué se gana: que el alumnado perciba un solo producto y que los
    estados (foco, «Debatida», enlaces) se lean igual en todas partes. Riesgo: es un cambio de lenguaje de raíz;
    afecta a las diez páginas del recorrido (importadas, con procedencia propia) y a la portada 3D, y exige
    rehacer las mediciones de contraste, impresión y foco de todas ellas.

## 5. Lo que no se ha podido comprobar

- **Portada 3D completa con GPU real**: con SwiftShader la escena tarda más de lo que admiten las pasadas de
  piso; se midieron el dock, el solape con el título, axe y 320 px con una pasada ligera, no el piso completo.
- **Fuentes reales de terceros**: Google Fonts, Wikimedia y las teselas no se alcanzan desde el entorno; el
  aspecto del atlas v1 con sus fuentes no se ha visto.
- **Lectores de pantalla**: no se ha ejecutado ninguno (NVDA, JAWS, VoiceOver, TalkBack).
- **Firefox y Safari**: solo Chromium.
- **Dispositivos reales**: solo emulación de viewport en Chromium.
- **Pantalla completa real del modo proyección** y su lectura en un proyector de aula.
- **Consulta ligera abierta como archivo suelto** (límite conocido, no defecto): sin la carpeta `img/` junto a ella
  no muestra imágenes, consecuencia de la decisión de la titular de servir copias locales. Degrada a un recuadro
  con el texto alternativo y conserva crédito, licencia y enlace a la ficha de la imagen (comprobado sin
  JavaScript en Chromium; el `::after` de imagen no cargada no se ha comprobado en Firefox ni en Safari).
- **Atlas v1 fuera del alcance de la tabla**: el diálogo Bibliografía tiene 140 nodos con contraste insuficiente
  (sin cambios respecto a 693055f, según la verificación) y la guía «Por dónde empezar» conserva emoji en sus
  botones y pestañas (`040-script.js`, `atlas/index.html`). No se han tocado: el atlas v1 solo recibe piso de
  bajo riesgo y `040-script.js` nunca se ha corregido (abrir su procedencia queda para una ronda del atlas).
- **Foco de los nodos SVG del recorrido**: medido por muestreo de color en el contorno (24 puntos por nodo), no con
  un lector de pantalla; con el gráfico reducido en el teléfono, algunas líneas del diagrama cruzan el halo (mínimo
  0,67 del contorno con color de foco en parentesco a 390 px).
