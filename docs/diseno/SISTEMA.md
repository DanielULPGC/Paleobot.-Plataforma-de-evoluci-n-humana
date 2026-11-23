# Sistema de diseño «Papel y tierra» · estado vigente

Describe el sistema tal como ha quedado en el código al cerrar PB-GH-10 (12-11-2026, rama
`feat/pb-gh-10-diseno`) y su ampliación al atlas interactivo en PB-GH-11 (19-11-2026, rama
`feat/pb-gh-11-atlas`; tanda de arreglos tras la verificación independiente, T7, 20-11-2026), no la propuesta de partida. La fuente de verdad de los tokens es
`assets/paleobot-base.css` y, para el atlas, `atlas/assets/css/95-sistema/atlas-sistema.css`; si este documento y
las hojas discrepan, mandan las hojas. Las vistas y medidas citadas como «desencadenante» proceden de la auditoría
y de los informes de la ronda; el resumen y la evidencia están en `docs/diseno/AUDITORIA_PB_GH_11.md`.

## 1. Intención del producto

1. **Quién:** alumnado adulto del Diploma de Estudios Africanos (ULPGC), no especialista, que estudia en el
   ordenador, la tableta o el teléfono; a veces la docente lo proyecta en el aula.
2. **Para qué:** estudiar con método los orígenes de la humanidad: seguir sesiones guiadas, consultar fichas con
   fuentes, distinguir dato de interpretación y preparar un trabajo individual citando bien.
3. **Carácter:** herramienta de estudio con voz de manual universitario: sobria, fiable, trazable, con la
   incertidumbre a la vista. La credibilidad la dan la tipografía, el orden y las fuentes, no el efecto.

## 2. Principios operativos

Cada principio tiene una prueba que se puede repetir.

| # | Principio | Cómo se comprueba |
|---|---|---|
| 1 | **Un punto focal por pantalla.** | En el primer pantallazo de cada vista, un solo elemento usa el acento como relleno (en Inicio, el bloque «Continuar»; la pestaña activa usa fondo suave, no relleno). |
| 2 | **La ficha se lee como página de manual.** | Lista de definiciones con rótulos pequeños, texto ≤ 40 rem, fuentes al pie, un único borde por contenedor. |
| 3 | **La incertidumbre tiene un único código visual.** | «Debatida», «Cronología no determinada», «Imagen pendiente de revisión»: componente `.pb-etiqueta` (o `.etiqueta` de DEA, idéntico), siempre con texto; 6,8:1. |
| 4 | **La copia de interfaz ayuda a actuar.** | Ningún rótulo describe el sistema si no cambia lo que hace el alumnado; el contenido académico no se toca. |
| 5 | **Escalas cerradas.** | 7 tamaños de letra y 8 pasos de espaciado, tomados de tokens (el verificador lo exige en `dea/dea.css`). |
| 6 | **El mismo producto en todas las puertas.** | DEA, recorrido y consulta ligera comparten Lexend, foco, radios y escalas; el recorrido conserva su fondo oscuro con sus propios tokens de color. |
| 7 | **Nada se pierde al cambiar de condición.** | Sin JavaScript, sin almacenamiento, con movimiento reducido, al 200 %, a 320 px, al imprimir y al proyectar no desaparece contenido ni función. |

**Matices para el atlas (PB-GH-11).** El atlas es una herramienta de exploración densa (mapas, gráficos, matrices,
laboratorio), no una página de lectura; los principios se mantienen con estos matices:

| # | Matiz | Cómo se comprueba | Vista que lo desencadenó |
|---|---|---|---|
| 1 | En las vistas de datos el punto focal es **el dato** (gráfico, mapa, lista), y debe entrar en el primer pantallazo tras elegir la vista; la explicación de uso va plegada. | Humo `vista.posicion`: barra arriba, título en el primer tercio y primer dato dentro de la pantalla. **Medida del 23-11-2026 (`primer-dato.cjs`): el primer dato cae bajo el pliegue en 7 de 30 vistas en escritorio y en 13 de 30 en teléfono; la regla es un objetivo, no un resultado (AUDITORIA § 10).** | Cronología en teléfono: cabecera petróleo de 588-1 005 px más la tarjeta de Bloom (538-741 px); la primera tarjeta a 1 621 px (T3, T4). |
| 5 | Escala **7 + 2**: los 7 tamaños de lectura más dos de dato (`--t-dato` 12 px, mínimo de rótulos, ejes, leyendas y celdas; `--t-cifra` 32 px). Paso denso de espaciado (`--e-denso`, 2 px) **solo** en tablas y matrices. | Recuento de texto < 12 px fuera de SVG por vista (390 px). | Las 31 vistas a 390 px: 2 963 elementos de texto < 12 px fuera de SVG (píldoras, etiquetas y metadatos entre 9,28 y 11,84 px) (T5); paso denso: Matriz de caracteres (`#matrixModal`), tablas de Centro docente y de Tafonomía (`notas/06` § 3). |
| 7 | **Sin red de terceros** también es una condición: sin Wikimedia, teselas ni CDN el atlas carga, navega y muestra imagen principal, mapa y ficha. | Humo y `tormenta.cjs` con `--sin-terceros`: 0 pérdidas; 0 peticiones por segundo en reposo con la ficha abierta. | Ficha de *afarensis*: 13 de 14 imágenes rotas y un bucle de 120-209 peticiones por segundo (T1); mapa grande sin geografía (fila 8). |

## 3. Reglas

- **Solo tokens.** Las hojas de superficie no escriben colores ni tamaños de letra en bruto. Excepciones cerradas
  de `dea/dea.css` (comprobadas por `scripts/verificar_repo.py`): la escala raíz (`calc(100% * var(--escala))` y
  `calc(130% * var(--escala))` en proyección), el h1 de proyección (`calc(var(--t-3xl) * 1.25)`) y el texto de
  los dos SVG del mapa (`2.4px` en unidades del viewBox, en `.mapas .numero-punto` y `#mapa-svg .rotulo-mapa`).
  Cuenta como color en bruto cualquier hexadecimal, función de color (`rgb()`, `hsl()`, `color()`…), cualquier
  `color-mix()` o `light-dark()` (prohibidos en `dea/dea.css` aunque mezclen tokens: crean colores sin contraste
  medido; un color nuevo entra como token en la hoja base) o color con nombre (`red`, `black`…) en cualquier propiedad, también en `border`, `outline` y
  `background`; y como tamaño en bruto, el atajo `font:` sin un paso de la escala. Dos desfases de foco que eran
  `3px` son ahora `calc(var(--foco-desfase) + var(--linea))`.
- **Contraste comprobado desde la propia hoja base**: el verificador calcula las parejas de tokens (tintas y acento
  sobre papel, superficie y hundido; estados sobre su fondo; contorno de control y foco) en claro, oscuro,
  proyección clara y proyección oscura. Texto ≥ 4,5:1; contornos y foco ≥ 3:1.
- **Ocultar por CSS, solo en lista cerrada.** En `dea/dea.css`, `display: none` y `visibility: hidden` solo aparecen
  en los 24 selectores (con su contexto `@media`) que enumera `OCULTACIONES_DEA` en `scripts/verificar_repo.py`:
  paneles plegados («Ajustes», «Secciones»), estados vacíos (`:empty`), marcas de eje que no caben, impresión,
  proyección, sin JavaScript (`scripting: none`) y la espera de carga. Añadir una ocultación exige añadirla a esa
  lista con su motivo. Límite: la comprobación no ve `opacity`, `clip`, tamaño 0, posiciones fuera de pantalla ni el
  atributo `hidden` que pone `dea.js`.
- **Textos de interfaz protegidos.** Los bloques de texto de `dea/index.html` publicados en 693055f
  (`textos_interfaz_reubicados`) y 23 fragmentos informativos de `dea/dea.js` (`textos_obligatorios_dea_js`:
  rótulos de ficha y de tarjeta, avisos, estados vacíos) están registrados en
  `provenance/PB_GH_10_CORRECCIONES.json`; el verificador exige que sigan. Los tres archivos de `dea/` deben
  coincidir además con su huella registrada.
- **Un punto focal**: decide los empates entre dos propuestas de composición.
- **La copia de interfaz ayuda a actuar**: se acortan rótulos y explicaciones de interfaz; toda afirmación
  informativa que se retira se reubica en la misma vista.
- **Sin gradientes decorativos, sin vidrio esmerilado, sin emoji y sin movimiento decorativo.** Se conservan tres
  gradientes funcionales: la máscara que avisa de que hay más pestañas a un lado, el rayado de
  las barras «debatida» y la rejilla de millones de años de la línea del tiempo y de Comparar. Los glifos tipográficos (←, →, ✓, ✗) se admiten porque se leen como texto.
- **Sombras**: ninguna, salvo los paneles flotantes («Ajustes», «Secciones»), con `--sombra-flotante`.
- **Recursos locales**: ninguna superficie carga Google Fonts ni otros recursos de terceros; la consulta ligera
  sirve las copias de `img/taxones/`. La entrada DEA mantiene su CSP estricta.
- **Atlas (PB-GH-11)**: lo nuevo vive en `atlas/assets/{css,js}/95-sistema/` y se prefiere siempre un archivo nuevo a
  editar uno importado; no se renombra ni se borra ninguna clase, id, `data-*` ni regla importada. Sin terceros de
  fuentes ni de scripts (Lexend local, Leaflet 1.9.4 en `atlas/assets/vendor/leaflet/`); la imagen principal de cada
  taxón desde `img/taxones/` y un solo respaldo local por imagen; fondo local de costas para el mapa. La CSP solo se
  estrecha (`script-src 'self'`); `style-src 'unsafe-inline'` sigue mientras las plantillas de `002-script.js`
  generen `style=` (L3). Plegar bajo un desplegable o mover a un panel cuenta como conservar; `display:none` sobre algo
  visible, solo para duplicados exactos anotados en los informes de la ronda.

## 4. Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--f-titulo` | Lexend (local, `assets/fuentes/lexend-latin.woff2`, OFL 1.1) y pila del sistema | titulares, pestañas, botones, rótulos, etiquetas (peso 500-600) |
| `--f-lectura` | pila del sistema (`system-ui`, `-apple-system`, `Segoe UI`, Roboto…) | lectura |
| `--t-xs` | 0,8125 rem (13 px) | rótulos, etiquetas, eje, créditos |
| `--t-s` | 0,9375 rem (15 px) | resúmenes, pies, fuentes |
| `--t-m` | 1,0625 rem (17 px) | cuerpo |
| `--t-l` | 1,25 rem (20 px) | h3, veredictos |
| `--t-xl` | 1,5 rem (24 px) | h2 |
| `--t-2xl` | 1,875 rem (30 px) | h1 en teléfono |
| `--t-3xl` | 2,375 rem (38 px) | h1 desde 48 rem y en proyección |
| `--il-cuerpo` / `--il-titulo` | 1,6 / 1,25 | interlineado |
| `--medida` | 40 rem | medida de lectura |

**Atlas: tokens de dato** (`atlas-sistema.css`, PB-GH-11): `--t-dato` 0,75 rem (12 px), `--t-cifra` 2 rem (32 px) y
`--e-denso` 2 px. `vistas.css` lleva a `--t-dato` una lista cerrada de píldoras, etiquetas y metadatos de vista que
salían entre 9,28 y 11,84 px; las celdas de matrices densas no se tocan para no romper rejillas (quedan 1 370
elementos < 12 px a 390 px, frente a 2 963; T5). Paso denso solo en las tablas densas (`.matrix-table`, `.tapho-region-table`,
`.teaching-table`, `.data-table`, `.sa-table`), con letra de `--t-dato` como mínimo (capa 9.5 de `atlas-sistema.css`). Lexend en titulares y rótulos; pila del sistema en lectura y en todos los controles (antes Arial); las
familias que el atlas nombraba de Google («Playfair Display», «Source Sans 3», «JetBrains Mono») se resuelven en
local, sin descarga (T2).

El recorrido añade, sobre esta escala, un tamaño «display» para el título de la portada y el póster de la
introducción (`--t-display`: 30 px en teléfono, 56 px desde 48 rem, 72 px en pantallas anchas), definido en
`atlas/recorrido/integracion.css`. Los botones A− y A+ de DEA cambian `--escala`.

## 5. Espaciado, radios, líneas y controles

- **Espaciado (8 pasos):** `--e-1` 4 px · `--e-2` 8 · `--e-3` 12 · `--e-4` 16 · `--e-5` 24 · `--e-6` 32 ·
  `--e-7` 48 · `--e-8` 64.
- **Radios:** `--r-control` 8 px · `--r-contenedor` 12 px · `--r-pildora` 999 px.
- **Líneas:** `--linea` 1 px · `--linea-gruesa` 2 px (chevrons, subrayado) · `--linea-marca` 4 px (barra lateral
  de respuestas).
- **Objetivos táctiles:** `--control` 44 px (principal) · `--control-min` 24 px (mínimo WCAG 2.5.8).
- **Rejilla de página de DEA:** `--ancho-pagina` 64 rem (80 rem en proyección) y `--margen-pagina` 16/24 px,
  comunes a cabecera, pestañas, contenido y pie.

## 6. Color y contrastes medidos

Contrastes calculados con la fórmula WCAG 2.x sobre los valores de la hoja (script
`contrastes_tokens.py` de la auditoría) y confirmados con axe-core en el navegador. Mínimos: texto 4,5:1;
contornos de control, marcas y foco 3:1.

### Claro (por defecto)

| Token | Valor | Contraste medido |
|---|---|---|
| `--papel` | #f7f4ee | fondo de página |
| `--superficie` | #ffffff | fichas, tarjetas, campos |
| `--hundido` | #efe9de | bloques secundarios, pies |
| `--tinta` | #1f2422 | 14,34:1 sobre papel; 15,75:1 sobre superficie |
| `--tinta-2` | #4a524e | 7,33:1 sobre papel; 6,66:1 sobre hundido |
| `--tinta-3` | #5f6662 | 5,37:1 sobre papel; 4,88:1 sobre hundido (el más bajo de texto) |
| `--acento` | #8a3b12 | 7,05:1 sobre papel; 7,73:1 sobre superficie; 6,18:1 sobre `--acento-suave` |
| `--acento-fuerte` | #6e2e0c | 9,29:1 sobre papel (hover) |
| `--sobre-acento` | #ffffff | 7,73:1 sobre acento |
| `--acento-suave` | #f3e3d6 | fondos de resalte y pestaña activa |
| `--debatida` / `--debatida-fondo` | #6b4e00 / #fbf0cf | 6,8:1 |
| `--bien` / `--bien-fondo` | #2f6b3a / #e3efe3 | 5,39:1 |
| `--mal` / `--mal-fondo` | #a1281b / #f8e3df | 6,01:1 |
| `--borde` | #d6d0c4 | solo separadores decorativos (1,4:1, no se usa en controles) |
| `--borde-control` | #8c857a | 3,65:1 sobre superficie; 3,33:1 sobre papel; 3,02:1 sobre hundido |
| `--foco` | #0b57d0 | 5,82:1 sobre papel; 4,84:1 sobre `--tierra`; 5,11:1 sobre `--mar` |
| `--tierra` / `--mar` | #e9dfcd / #dce8ec | tierra y mar del mapa (marca de acento 5,86:1 y 6,19:1) |

### Oscuro (`prefers-color-scheme: dark`; se puede forzar el claro con `data-tema="claro"`)

Papel #161a19, superficie #1f2523, hundido #262d2a, tinta #ecebe6, tinta-2 #b9bfbb, tinta-3 #a3aaa6, acento
#f0a77c, sobre-acento #161a19, debatida #f4d27a sobre #3a3220, bien #8fd19e, mal #ff9d8f, borde-control #7d8681,
foco #8ab4f8, tierra #33392f, mar #18262b. Contraste más bajo medido: texto 5,94:1 (tinta-3 sobre hundido);
contorno de control 3,75:1 (sobre hundido). Ninguna pareja por debajo del mínimo.

### Proyección (clase `.proyeccion`)

Claro: papel #fbf9f4, tinta #111513 (17,5:1), tinta-2 #33403a (10,31:1), borde #8c857a. Oscuro: papel #0f1211,
tinta #f7f6f2, tinta-2 #cfd4d0 (12,54:1 sobre papel; 9,38:1 sobre hundido), tinta-3 #b6bcb8 (9,75:1; 7,29:1 sobre
hundido), borde #7d8681. Regla: **todo token que `.proyeccion` redefine para el claro se redefine también en su
bloque oscuro**; si no, el `<body>` en proyección hereda el del claro. Hasta 222dd42 el bloque oscuro no redefinía
`--tinta-2` y el texto secundario quedaba a 1,74:1 (axe: 1-34 infracciones por vista); la verificación
independiente lo detectó y ahora lo comprueba el verificador. Con esto, los mínimos en proyección son iguales o
mejores que en claro y oscuro en las cuatro combinaciones.

### Atlas: subtema «pizarra» (barra de trabajo)

La barra de trabajo del atlas (`#pbV50Blocks`, su franja fija y el panel «Vistas») conserva el fondo oscuro con
tokens propios, tomados del oscuro de la hoja base y declarados en `atlas-sistema.css`. Pasarla a papel claro es
una propuesta L3 que la titular no ha decidido. Contrastes calculados (WCAG 2.x):

| Token | Valor | Sobre `--pizarra` #161a19 | Sobre `--pizarra-2` #1f2523 | Sobre `--pizarra-3` #262d2a |
|---|---|---|---|---|
| `--sobre-pizarra` | #ecebe6 | 14,71:1 | 13,06:1 | 11,80:1 |
| `--sobre-pizarra-2` | #b9bfbb | 9,39:1 | 8,34:1 | 7,53:1 |
| `--pizarra-acento` | #f0a77c (pestaña y chip activos, con texto `--pizarra` encima: 8,80:1) | 8,80:1 | 7,81:1 | 7,06:1 |
| `--pizarra-borde-control` | #7d8681 | 4,68:1 | 4,16:1 | 3,75:1 |
| `--foco-pizarra` | #8ab4f8 | 8,33:1 | 7,40:1 | 6,68:1 |
| `--pizarra-borde` | #3a423f | solo separador decorativo (1,70:1), no en controles | | |

Desencadenante: la barra de bloques en teléfono (fila 12: 950 px, el 113 % del alto, a 390 px) y su pestaña activa
en oro #d6a84f; las variables `--v36-rail-*` y `--v50-*` de las hojas importadas apuntan ahora a estos tokens (T2).
En «Contraste» y en impresión la pizarra pasa a blanco y negro.

### Atlas: solo modo claro (pendiente)

En esta ronda el atlas **solo tiene modo claro**: `atlas-sistema.css` fija los valores claros de los tokens también
bajo `prefers-color-scheme: dark` y declara `color-scheme: light`. Motivo: el atlas genera unos 1 460 `style=` con
colores claros fijos (coexistencias, cladograma, clima…), y un modo oscuro a medias rompería el contraste. Con el
modo oscuro del sistema emulado, fondo y tinta son los del claro (T2). El modo oscuro del atlas queda **pendiente**
(propuesta L3), no hecho. «Contraste» (`html.pb-v74-high-contrast`) y «Modo clase» usan los tokens de proyección
clara de la hoja base («Modo clase» además agranda la letra un 20 %).

### Impresión

Tinta negra sobre blanco en todos los temas; acento negro; `.pb-etiqueta` gana un borde para no depender del
fondo.

### Recorrido (modo oscuro propio)

`atlas/recorrido/integracion.css` (`:root.pb-recorrido`, solo en pantalla) redefine el color: petróleo #0d2028,
superficie #16303c, tinta #f3efe7 (14,60:1), acento oro #d8a93a (7,70:1), borde-control #6f8a94 (4,58:1 / 3,77:1),
foco #ffd166 (11,61:1 / 9,57:1). Todas las parejas medidas cumplen (tabla completa en la auditoría).

## 7. Foco

- Regla común: `:focus-visible { outline: var(--foco-ancho) solid var(--foco); outline-offset: var(--foco-desfase) }`
  (3 px, desfase 2 px). Nunca `outline: none` sin sustituto.
- Dentro del bloque «Continuar» (fondo de acento) el anillo usa `--sobre-acento`.
- Puntos del mapa: anillo circular del color de foco sobre la zona del propio marcador (radio 2,7 en unidades del
  viewBox, separado de la marca), ≥ 3:1 sobre tierra y mar en claro y oscuro; no pisa a los vecinos ni se recorta
  en el borde del recuadro del Rift.
- Pestañas de DEA: con el teclado, la pestaña enfocada se desplaza entera a la vista, la máscara de «hay más» se
  retira mientras tiene el foco y el anillo va por dentro de la píldora (la pista recorta lo que sobresale).
- Pestaña actual: fondo suave y subrayado de acento de 2 px (no solo el fondo, que en escritorio era pálido).
- Resumen de las fichas: relleno interior compensado, de modo que el anillo abraza todo el resumen sin rozar el
  nombre; el resumen mide lo mismo abierto y cerrado.
- Recorrido: anillo #ffd166 en enlaces, botones, `summary`, campos y elementos con `tabindex`. En los nodos SVG de
  parentesco y territorio, el mismo color en el contorno del propio nodo, en píxeles de pantalla
  (`vector-effect: non-scaling-stroke` o halo con `drop-shadow`, que conserva el trazo discontinuo de «debatida»),
  distinto del blanco de «elegido»; los rótulos de los demás nodos se atenúan mientras uno tiene el foco.

### Foco y desplazamiento en el atlas (PB-GH-11)

| Regla | Dónde | Vista o medida que la desencadenó |
|---|---|---|
| Un solo anillo `--foco` en todo el atlas (`:root:root:root body :focus-visible`, con `!important` para ganar a 047, 053 y 025); dentro de contenedores oscuros (barra, presentación, imagen ampliada) se redefine `--foco` como `--foco-pizarra`, nunca la regla. | `atlas-sistema.css` capa 5 | Fila 7: anillo ámbar #f2bf52 de 1,70:1 sobre blanco; 91 de 118 muestras por debajo de 3:1 en escritorio → 0 de 119 (mínimo 5,1:1) (T2). |
| Diálogos: al abrir, `role="dialog"`, `aria-modal`, sin `aria-hidden` y con nombre; el foco **entra** (título con `tabindex="-1"` o primer control), Tab no sale, el fondo queda `inert`; Escape cierra **un** diálogo cada vez y el foco **vuelve** al disparador (o a su equivalente repintado). | `95-sistema/dialogos.js` | Filas 3 y 5: Bibliografía abierta con `aria-hidden="true"` y sin nombre; foco que volvía en 1 de 16 diálogos; hasta 25 de 25 tabulaciones fuera (T3). |
| Al elegir una vista con el teclado, el foco queda en el chip recién pintado y la vista lleva `aria-current="page"`; con puntero, en «Vistas». El enlace de salto conserva `#main-content` y lleva el foco a «Vistas». | `navegacion.js`, `barra.js` | Fila 6: foco en `<body>` en 4 de 4 elecciones; fila 17: el salto dejaba el foco en `<body>` (T3). |
| Al elegir una vista (gesto reciente o panel «Vistas» abierto), la página se coloca con la barra arriba, la franja «Consulta y filtros» debajo y el título a continuación, sin mover el foco. No actúa si `switchView` se llama por código, si hay un diálogo abierto o si la persona se desplaza. | `desplazamiento.js` | Mapa elegido desde «Vistas»: título a 935 px en teléfono y 423 px en escritorio, barra a 385/116 px → título a 176/156 px y barra a 0 (T4; corrección tras la verificación: con 1,5 s o más de espera la vista no se colocaba). |
| `?view=<id>` coloca la vista de golpe (sin animación) al terminar la carga, solo para ids literales de una `.view-section`, y deja de hacerlo en cuanto la persona toca o pulsa una tecla. | `enlace-vista.js` | Enlace `?view=timeline#main-content` desde el recorrido: la página se quedaba en la portada (título a 7 665 px en teléfono) (T5). |
| `scroll-padding-top` con el alto de la franja: anclas y `scrollIntoView` no quedan bajo la barra fija. | `barra.css` | Barra sticky de 56 px (T3). |
| La barra y su panel llevan un `scroll-margin-top` igual y de signo contrario a ese `scroll-padding-top`: enfocarlos (clic en «Vistas», Tab, el foco que devuelve un diálogo) **no desplaza la página**; abrir y cerrar el panel deja al alumnado donde leía (±4 px). | `barra.css` | T7-01: abrir «Vistas» en Cronología subía la página 426 px (teléfono) / 388 px (escritorio) por vez y el Glosario consultado desde el panel devolvía a otra especie (verificación T7). |
| El salto «Saltar al contenido principal» enfoca «Vistas» con `preventScroll` y coloca la página como al elegir una vista (franja a 0 px, consulta debajo). Todo `focus()` de `95-sistema` sobre la barra o en diálogos lleva `preventScroll`. | `navegacion.js` | T7-02: tras el salto, la franja quedaba a 426/388 px con media pantalla de portada encima (verificación T7). |
| Las regiones que se desplazan **dentro de diálogos y de la ficha** reciben también foco, rol `region` y nombre cuando no contienen nada enfocable a la vista; un marco de gráfico no impone un ancho mínimo mayor que su vista (el gráfico se recorre en su caja). | `accesibilidad-contenido.js`, `graficos.css` | T7-03: «Comparación científica recomendada» de la ficha (`.matrix-scroll`) y el cuerpo de la ficha en «Anatomía» y otras pestañas; T7-05: Filogenia recortada en teléfono por `.phylo-outer` de 860 px (verificación T7). |
| Toda región que se desplaza (gráfico o tabla ancha) recibe foco, rol `region` y nombre, y se mueve con las flechas; el anillo se dibuja por dentro. | `regiones.js`, `vistas.css` | Fila 26: 4-9 regiones desplazables sin foco por anchura (Clima, Contexto, Coexistencias, matriz de primates) (T5). |

## 8. Movimiento

`--m-rapido` 120 ms · `--m-medio` 180 ms · curva `cubic-bezier(.2, 0, 0, 1)`. Solo explica cambios de estado
(giro del chevron al abrir, cambio de pestaña, resaltado de una barra) y solo con
`prefers-reduced-motion: no-preference`. Con movimiento reducido, `scroll-behavior: auto` en todas las
superficies. Las apariciones del recorrido existen solo con JavaScript y sin movimiento reducido, y nunca al
imprimir.

## 9. Componentes y estados

| Componente | Dónde | Estados |
|---|---|---|
| Botón secundario (`.boton`) | DEA, ligera | reposo (borde de control), hover, foco, activo, deshabilitado |
| Botón primario | DEA | relleno de acento; uno por pantalla como máximo |
| Ajustes fantasma / menú «Ajustes» | DEA | ≥ 48 rem en línea sin fondo hasta hover, pulsado con fondo suave; < 48 rem menú flotante (Escape y clic fuera lo cierran y devuelven el foco) |
| Pestañas + «Secciones» | DEA | actual con fondo suave, subrayado de acento y `aria-current`; enfocada con el teclado, entera a la vista y sin máscara; panel «Secciones» cuando no caben (Escape, clic fuera y Tab o Mayús+Tab fuera lo cierran) |
| Bloque «Continuar» | DEA, Inicio | ninguna empezada / en curso / todas hechas |
| Ficha (`details.ficha`) | DEA, ligera | cerrada (nombre · fechas · «Debatida» en columnas alineadas desde 48 rem; dos líneas en teléfono) / abierta (texto y figura) / sin imagen / imagen que no carga (en la ligera sin JavaScript, recuadro con el texto alternativo en lugar del icono roto) |
| Etiqueta de incertidumbre | todas | una sola forma, siempre con texto |
| Barra de intervalo | DEA (Tiempo, Comparar) | normal, debatida (rayado), elegida (fondo suave y foco), franja de coincidencia |
| Punto del mapa | DEA | reposo, hover, foco, activo; recuadro del Rift con guía solo si el marcador se aleja de su posición |
| Respuesta del repaso | DEA | correcta / incorrecta, siempre con texto |
| Panel flotante | DEA | única superficie con sombra |
| Enlace «Atlas completo» | recorrido | secundario; en el flujo bajo 900 px o con la letra agrandada (> 20 px en la raíz), fijo y pequeño desde 900 px |
| Región del mapa fuera de África | DEA (`#mapa/<región>`) | título sin número, aviso «queda fuera del mapa de África», su lista de especies y vuelta a las regiones africanas |

### Componentes del atlas (`atlas/assets/{css,js}/95-sistema/`, PB-GH-11)

Regla común: **envolver y reubicar, no recrear**. Cada componente mueve o marca nodos existentes (mismos id, clases,
`data-*` y `data-action`), usa `window.switchView` y las API públicas de los módulos importados, no añade escuchas
en captura y sobrevive a las guardas que repintan (observadores de hijos, sin bucles en reposo). Se enlaza tras los
importados con `?v=pbgh11`; `carga-fin.css` es siempre el último `<link>`. El verificador lo comprueba.

| Componente | Archivos | Qué es y estados | Vista que lo desencadenó |
|---|---|---|---|
| Gestor de diálogos | `dialogos.js`, `dialogos.css` | Semántica, foco que entra, trampa de Tab, `inert`, retorno al disparador en 16 diálogos; una sola salida visible por diálogo | Bibliografía, Estadísticas, Glosario, Examen (filas 3, 5, 11) |
| Diálogo único | `dialogo-unico.js`, `.css` | Lámina de 56 rem como máximo (40 rem la búsqueda), cabecera fija con el h2 y «Cerrar» (el nombre accesible del «✕» no cambia), cuerpo con desplazamiento propio; pantalla completa en teléfono; título y «Cerrar» en dos filas al 200 % | Guía del alumnado en teléfono: rótulo sobre el título y dos salidas (fila 11) |
| Barra de trabajo y panel «Vistas» | `barra.js`, `barra.css`, `navegacion.js` | Franja fija de 56 px en pizarra: insignia «PaleoBot», «Vistas» con la ubicación («Explorar evidencias › Cronología»), herramientas rápidas desde 48 rem; panel con las mismas 4 familias y 31 vistas (desplegable; hoja inferior en teléfono). Escape, clic fuera o foco fuera lo cierran | Barra de bloques de 950 px en teléfono (fila 12) |
| Cabecera de vista plegable | `cabecera.js`, `cabecera.css` | Título con su insignia y «Pregunta guía» sobre papel; todo lo demás del hero y la tarjeta de Bloom en «Cómo usar esta vista» (`<details>`; texto ≥ 100 % del anterior). 30 vistas (Paleoproteómica no tiene hero) | Cronología en teléfono: el dato llegaba dos pantallas después |
| Franja «Consulta y filtros» | `consulta.js`, `consulta.css` | Sobre papel; escritorio en una fila; < 64 rem, buscador y «Más opciones» (`aria-expanded`), el resto desplegable; «· filtros activos» si los hay | Bloque oscuro de 198 px (escritorio) y 369 px (teléfono) entre la barra y el título (verificación de la T3) |
| Buscador | `buscador.js`, `.css` | Intro: una coincidencia abre su ficha; ninguna o varias, la búsqueda global con título visible | `#searchInput` sin efecto con Intro (fila 18) |
| Ficha de especie | `ficha.js`, `ficha.css` | Página de manual: panel lateral de 40-52 rem con velo en escritorio, pantalla completa en teléfono con solo acciones y pestañas fijas; imagen local con crédito al principio de «General»; minimapa con alternativa textual | Ficha a 1 366 px de ancho y 278 px fijos arriba en teléfono (T4) |
| Cronología | `cronologia.js`, `.css` | Leyenda metodológica en «Qué significan las etiquetas»; ámbar `.pb-etiqueta` solo para lo incierto; barra con tramo directo en tinta e inferido discontinuo | Seis variantes de etiqueta con colores distintos (Cronología) |
| Mapa y África | `mapa.js`, `mapa.css`, `costas*.js`, `costas.css` | Mapa primero; controles en grupos con rótulo («Fondo», «Capas», «Zoom», «Foco regional»); alternativa textual; estado vacío; fondo local de costas (Natural Earth) bajo el relieve remoto | Mapa sin geografía sin red de terceros (fila 8); África a 14 468 px en teléfono |
| Comparador | `comparador.js`, `.css` | Guía plegada; cada tabla en una región con nombre, foco y cabecera y primera columna fijas; resultados a su altura | `#compareResult` encogido a 80 px (teléfono) / 166 px (escritorio) |
| Consulta de manual (Bibliografía y Glosario) | `consulta-manual.js`, `.css` | Cifras en una línea; índice plegable de 62 grupos; referencias como lista de lectura (sangría francesa, DOI en su línea); glosario como diccionario con índice de 23 letras. Títulos de grupo y definiciones intactos | Bibliografía en teléfono: ocho cajas de cifras (~190 px); 801 elementos fuera de la lámina al 200 % |
| Gráficos | `graficos.js`, `.css`, `regiones.js` | Cabecera con título; si el gráfico es más ancho que su caja, cómo recorrerlo y «Ver el gráfico entero» (`aria-pressed`), con escala mínima legible: ningún rótulo por debajo de 12 px; si así no cabe, la caja se recorre en los dos ejes con el alto de la pantalla; «Leer como tabla» en Contexto y Coexistencias | Clima (1 520 px en una caja de 296), Contexto, Coexistencias, Primatología, Filogenia (fila 26); R-01: Filogenia «entero» en teléfono con rótulos de 1,6-2,6 px (reverificación T7) |
| Cladograma (Filogenia) | `002` (`renderPhyloTree`, comentarios PB-GH-11 (T8)) | También en modo normal, ningún rótulo (nombres, eje, códigos de nodo) por debajo de 12 px en pantalla: 14 unidades del SVG para un ancho mínimo que conserva la proporción 1 180 px / 1 360 unidades; cada píldora se mide con su texto; un nombre no se dibuja sobre una rama ni sobre un nodo (se desplaza a la derecha); dos nodos que se tocan se separan en vertical, nunca en el eje del tiempo; si los rótulos piden más ancho, se ensancha el lienzo y lo absorbe la caja desplazable | R-02: 83 rótulos de 6,9-11,3 px, 4 solapes y 26 nombres sobre ramas (decisión de la titular, 20-11-2026; T8) |
| Accesibilidad del contenido | `accesibilidad-contenido.js` | En diálogos abiertos y la ficha: regiones desplazables con foco y nombre; encabezados que saltan nivel reciben `aria-level` del nivel siguiente (texto y etiqueta intactos); `role="img"`/`"list"` donde faltaba; botón «→» redundante de la Matriz `inert`; `#gs-listbox` como `group` sin opciones. En Clima, diana transparente de 24 × 24 px como mínimo bajo cada barra de taxón | Ficha, Guía, Comparador, Síntesis, Matriz, Búsqueda global; marcadores de Clima de 12 × 18 px (T7-03, T7-04, T7-12, T7-13) |
| Herramientas | `herramientas.js`, `.css` | «Herramientas» y «Arriba» en la franja; cajón y tira de accesibilidad en un panel bajo la franja; 11 botones con rótulo visible igual a su `aria-label` y un solo color | Flotantes que tapaban texto (19 solapamientos en 390 px) y cajón de 11 iconos de colores (filas 22, 23) |
| Carga | `carga.css` (en `<head>`), `carga-fin.css` (último `<link>`) | `<body>` no se pinta hasta la última hoja (respaldo de 4 s, solo CSS) | CLS de carga 1,17 / 0,99 / 1,67 (teléfono, tableta, escritorio) por hojas al final de `<body>` (fila 13) |
| Sin JavaScript | `sin-js.css` y `<noscript>` | Aviso con enlaces a la consulta ligera y a DEA; un solo h1 | Dos h1 visibles y 89 controles inertes (fila 24) |
| Enlace a vista | `enlace-vista.js` | `?view=<id>` abre la vista con el espacio de trabajo entrado y el título a la vista | Enlace desde el recorrido que dejaba en la portada (T5) |
| Pictogramas e imágenes | `pictogramas.js`, `imagenes-*.js` | Sin emoji en rótulos (texto conservado; «Edad: », «Lugar: », «Nota: » donde eran la única marca); imagen principal local con un solo respaldo local por imagen | Fila 34 (360 pictogramas); filas 1 y 9 |

## 10. Qué superficie consume qué

| Superficie | Hoja base | Notas |
|---|---|---|
| `dea/` | `<link>` a `../assets/paleobot-base.css` antes de `dea.css` | `dea.css` solo con tokens (comprobado); CSP estricta |
| `atlas/recorrido/` (10 páginas) | `<link>` a `../../assets/paleobot-base.css` | colores propios en `integracion.css`; fondo oscuro |
| `ligera/index.html` | copia literal en el bloque «sincronizado con assets/paleobot-base.css» de `src/entrada_ligera/estilos.css` | archivo único; la única diferencia es la ruta de Lexend (comprobado) |
| Portada 3D (`portada-sylva.html`) | no la consume | conserva su lenguaje; solo se ajustó el dock (rótulos bajo 900 px) |
| Atlas v1 (`atlas/`) | `<link>` a `../assets/paleobot-base.css` antes de las hojas del atlas (PB-GH-11) | puente de las 90 variables del atlas a los tokens y componentes nuevos en `atlas/assets/css/95-sistema/` (`atlas-sistema.css` y siguientes, enlazados los últimos); subtema «pizarra»; solo modo claro; Leaflet alojado y sin Google Fonts; CSP con `script-src 'self'` (`style-src` conserva `'unsafe-inline'`: L3) |

## 11. Qué se revisó y qué página lo desencadenó

| Documento o tokens anteriores | Cambio | Página y captura que lo motivó |
|---|---|---|
| `dea/dea.css`: `--borde` #d6d0c4 en campos y botones (1,54:1) | Se separa `--borde-control` #8c857a (3,65:1) | `dea/#especies`, campo de búsqueda (`antes/dea_especies_ficha_telefono.png`; fila 8) |
| `dea/dea.css`: h1 25,6 px, h3 = cuerpo; 23 espaciados distintos | Escala de 7 tamaños con Lexend y 8 pasos de espaciado | `dea/#inicio` (`antes/dea_inicio_telefono_pantalla1.png`) |
| `dea/dea.css`: cuatro ajustes como segunda fila de cabecera; 323 px a 320 px | Menú «Ajustes» y ajustes fantasma (L2-2) | `dea/` a 320 px (`l2/L2-2_antes_320_estrecho.png`; fila 7) |
| `dea/dea.css`: pestañas cortadas y máscara de degradado como única pista | Lista «Secciones» (L2-3) | `dea/` en 390 px (`l2/L2-3_antes_telefono.png`; fila 38) |
| `dea/dea.css` `body.proyeccion`: crecía pero mostraba ajustes y notas | Tokens de proyección y una sola salida (L2-9) | `l2/L2-9_antes_escritorio.png` |
| Comentario de cabecera de `dea.css` («teléfono primero») | Se mantiene; cromado en teléfono 21,3 % → 14,5 % | `estados.json → pestanas.telefono.pctCromado` |
| `atlas/recorrido/*.html` `:root` (Playfair Display y Source Sans 3 de Google; 34 tamaños; radios 6-14 px) | Lexend local, escala del sistema, radios 8/12, foco #ffd166 (C-1) | las diez páginas (`l2/C-1_antes_*.png`; fila 35) |
| `atlas/recorrido/integracion.css` (`.pb-lab-link` amarillo, fijo, a todo el ancho) | «Atlas completo» secundario | `recorrido/parentesco.html`, foco tapado (fila 5) |
| Comentarios «respeta prefers-reduced-motion» del recorrido | `scroll-behavior` dentro de la media query | `piso` con movimiento reducido (fila 19) |
| `atlas/recorrido/index.html` `.revelar` | Ocultación solo con `.js`; visible al imprimir | `evidencia/B2_impresion_recorrido_index_*.jpg` (fila 2) |
| `src/entrada_ligera/estilos.css` (cinco verdes de texto, foco #d39000 a 2,46:1) | Tokens del sistema; foco #0b57d0 | `ligera/` (fila 9; `l2/C-2_antes_*.png`) |
| `src/entrada_ligera/build.py` (imágenes remotas) | Copias locales de `img/taxones/` | `antes/ligera_ficha_telefono.png` (fila 32) |
| `docs/portada-sylva/CAMBIOS.md` | Entrada nueva por los rótulos del dock | `l2/C-4_antes_*.png` (filas 10 y 11) |
| `atlas/recorrido/licencias/FONT-LICENSES.md` | Nota: Lexend también fuera de la portada | DIRECCION §2 |
| Ninguno (no había sistema común en `docs/`) | `assets/paleobot-base.css` y este documento | línea base de la auditoría (`notas/01_linea_base.md`) |

| `docs/diseno/SISTEMA.md` § 2 (principios 1, 5, 7) | Matices para el atlas: el dato como punto focal, escala 7 + 2, sin red de terceros | Cronología en teléfono (cabecera de 588-1 005 px); Primatología y Centro docente (texto < 12 px); ficha de *afarensis* sin Wikimedia |
| `docs/diseno/SISTEMA.md` § 6 | Subtema «pizarra» y «solo modo claro» (pendiente) | Barra `#pbV50Blocks` en teléfono (fila 12); 1 460 `style=` claros del atlas |
| `docs/diseno/SISTEMA.md` § 7 | Foco y desplazamiento del atlas | Filas 3, 5, 6, 7, 17, 26; Mapa elegido desde «Vistas»; enlace `?view=` |
| `docs/diseno/SISTEMA.md` § 9 | Componentes de `95-sistema` | Una fila por componente, con su vista |
| `docs/diseno/SISTEMA.md` § 10 | El atlas consume la hoja base | `atlas/index.html` (T2) |
| Atlas: anillo ámbar de 047/053 | `--foco` común; `--foco-pizarra` en contenedores oscuros | Portada y tarjetas claras: 1,49-1,70:1 (fila 7) |
| Atlas: `.modal-content button { color:#172436 !important }` (020) | Regla de mayor especificidad en `atlas-sistema.css` | Autoevaluación: «Comenzar clásico» a 1,08:1 (fila 2) |
| Atlas: `--text-hint` #6b7a8d forzado por 025 | Puente a `--tinta-3` | 901-1 014 nodos de contraste por anchura en las 31 vistas (fila 16) |
| Atlas (PB-GH-11, T7): `scroll-padding-top` de la franja aplicado también a la propia franja | `scroll-margin-top` negativo en `#pbV50Blocks` | Cronología, panel «Vistas» (T7-01; `despues/T7/T7-01_panel_390.jpg`) |
| Atlas (PB-GH-11, T7): marco `.phylo-outer` con `min-width: 860px` (001) | `min-width: min(860px, 100%)` | Filogenia a 390 px (T7-05; `antes/T7/T7-05_filogenia_390.jpg`) |
| Atlas (PB-GH-11, T7): ocre `#c07800` y azul `#6b93cf` en línea como texto pequeño (060, 001) | `--c-basal` (#8f5900) y `--tinta-2` | Síntesis de sesión (3,54:1) y pestaña «Clima» de la ficha (3,13:1) (T7-07) |
| Atlas (PB-GH-11, T8): rótulos del cladograma a 13, 11 y 8 unidades con píldoras de 132 de ancho fijo (001, 053, 002) | 14 unidades, píldora medida, nombres apartados de ramas y nodos | Filogenia a 390, 820 y 1366 px (R-02; `antes/T8/antes_*_filo_*.jpg`, `despues/T8/filo_svg_completo_1366.png`) |

Las capturas de PB-GH-11 citadas sin ruta del repositorio están en la carpeta de trabajo de la ronda (fuera del
repositorio); una selección reducida está en `docs/diseno/atlas/evidencia/PB_GH_11/`.

Las capturas citadas sin ruta del repositorio están en la carpeta de trabajo de la auditoría (fuera del
repositorio); una selección reducida está en `docs/diseno/evidencia/`.
