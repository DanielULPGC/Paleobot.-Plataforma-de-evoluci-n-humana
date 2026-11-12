# Sistema de diseño «Papel y tierra» · estado vigente

Describe el sistema tal como ha quedado en el código al cerrar PB-GH-10 (12-11-2026, rama
`feat/pb-gh-10-diseno`), no la propuesta de partida. La fuente de verdad de los tokens es
`assets/paleobot-base.css`; si este documento y la hoja discrepan, manda la hoja.

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

## 3. Reglas

- **Solo tokens.** Las hojas de superficie no escriben colores ni tamaños de letra en bruto. Excepciones cerradas
  de `dea/dea.css` (comprobadas por `scripts/verificar_repo.py`): la escala raíz (`calc(100% * var(--escala))` y
  `calc(130% * var(--escala))` en proyección), el h1 de proyección (`calc(var(--t-3xl) * 1.25)`) y el texto de
  los dos SVG del mapa (`2.4px` en unidades del viewBox, en `.mapas .numero-punto` y `#mapa-svg .rotulo-mapa`).
- **Un punto focal**: decide los empates entre dos propuestas de composición.
- **La copia de interfaz ayuda a actuar**: se acortan rótulos y explicaciones de interfaz; toda afirmación
  informativa que se retira se reubica en la misma vista.
- **Sin gradientes decorativos, sin vidrio esmerilado, sin emoji y sin movimiento decorativo.** Se conservan tres
  gradientes funcionales: la máscara que avisa de que hay más pestañas a un lado, el rayado de
  las barras «debatida» y la rejilla de millones de años de la línea del tiempo y de Comparar. Los glifos tipográficos (←, →, ✓, ✗) se admiten porque se leen como texto.
- **Sombras**: ninguna, salvo los paneles flotantes («Ajustes», «Secciones»), con `--sombra-flotante`.
- **Recursos locales**: ninguna superficie carga Google Fonts ni otros recursos de terceros; la consulta ligera
  sirve las copias de `img/taxones/`. La entrada DEA mantiene su CSP estricta.

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
tinta #f7f6f2. Mínimos medidos iguales o mejores que en claro y oscuro.

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
- Puntos del mapa: contorno del propio grupo SVG en unidades del viewBox (≥ 3:1 sobre tierra y mar en claro y
  oscuro).
- Resumen de las fichas: relleno interior compensado, de modo que el anillo abraza todo el resumen sin rozar el
  nombre; el resumen mide lo mismo abierto y cerrado.
- Recorrido: anillo #ffd166 en enlaces, botones, `summary`, campos y elementos con `tabindex`.

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
| Pestañas + «Secciones» | DEA | actual con fondo suave y `aria-current`; panel «Secciones» cuando no caben |
| Bloque «Continuar» | DEA, Inicio | ninguna empezada / en curso / todas hechas |
| Ficha (`details.ficha`) | DEA, ligera | cerrada (nombre · fechas · «Debatida» en columnas alineadas desde 48 rem; dos líneas en teléfono) / abierta (texto y figura) / sin imagen / imagen que no carga |
| Etiqueta de incertidumbre | todas | una sola forma, siempre con texto |
| Barra de intervalo | DEA (Tiempo, Comparar) | normal, debatida (rayado), elegida (fondo suave y foco), franja de coincidencia |
| Punto del mapa | DEA | reposo, hover, foco, activo; recuadro del Rift con guía solo si el marcador se aleja de su posición |
| Respuesta del repaso | DEA | correcta / incorrecta, siempre con texto |
| Panel flotante | DEA | única superficie con sombra |
| Enlace «Atlas completo» | recorrido | secundario; en el flujo bajo 900 px, fijo y pequeño desde 900 px |

## 10. Qué superficie consume qué

| Superficie | Hoja base | Notas |
|---|---|---|
| `dea/` | `<link>` a `../assets/paleobot-base.css` antes de `dea.css` | `dea.css` solo con tokens (comprobado); CSP estricta |
| `atlas/recorrido/` (10 páginas) | `<link>` a `../../assets/paleobot-base.css` | colores propios en `integracion.css`; fondo oscuro |
| `ligera/index.html` | copia literal en el bloque «sincronizado con assets/paleobot-base.css» de `src/entrada_ligera/estilos.css` | archivo único; la única diferencia es la ruta de Lexend (comprobado) |
| Portada 3D (`portada-sylva.html`) | no la consume | conserva su lenguaje; solo se ajustó el dock (rótulos bajo 900 px) |
| Atlas v1 (`atlas/`) | no la consume | solo piso de corrección de bajo riesgo |

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

Las capturas citadas sin ruta del repositorio están en la carpeta de trabajo de la auditoría (fuera del
repositorio); una selección reducida está en `docs/diseno/evidencia/`.
