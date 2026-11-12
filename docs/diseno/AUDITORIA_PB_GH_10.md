# Auditoría y rediseño de diseño de producto · PB-GH-10

Ronda del 12-11-2026 sobre la rama `feat/pb-gh-10-diseno`, desde 693055f. Destinatario: alumnado del Diploma de
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
| 1 | recorrido/introduccion.html | todos | Texto superpuesto bajo el póster; «Comenzar» solapa «Repetir»; entradilla a 1,74:1; en vertical el escenario (390 × 219 px) recorta «Comenzar» | bloqueante | **Hecho** · 18f8c58 · solapes en reposo y en las escenas 0, 2, 5 y 7 → 0 en cuatro anchos, con y sin movimiento reducido; entradilla 1,74 → 11,9:1 |
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
| 20 | recorrido (todas) | todos | Enlaces con el anillo por defecto, poco visible | media | **Hecho** · a0d30bb · anillos < 3:1 por página 2-15 → 0 (#ffd166, ≥ 8:1) |
| 21 | recorrido (todas) | teléfono | Controles de la barra de 24 px de alto | baja | **Hecho** · a0d30bb · 44 px bajo 720 px |
| 22 | recorrido/territorio, parentesco, cronologia | teléfono, tableta | Objetivos < 24 px dentro de los gráficos | media | **Parcial** · 68246c0 · parentesco en tableta 55 → 3; cronología y territorio remiten a la tabla (cada táxon enlaza a su ficha); una zona circular en territorio se probó y se retiró porque aumentaba los focos tapados |
| 23 | dea/#mapa | teléfono | Seis puntos apilados en el Rift; 5 focos tapados; foco solo con cambio de trazo | media | **Hecho** · 806e4c0 (L2-7) y 4a8cb2a · foco sin indicador 12 → 0; focos tapados 5/5/4 → 0 |
| 24 | dea/#especies | todos | Etiqueta «Buscar» centrada; campo de 286 de 358 px | media | **Hecho** · 31af692 · campo a todo el ancho |
| 25 | dea/#especies | todos | Imagen que no carga: icono roto y alt sobre un cuadro vacío | media | **Hecho** · c49cc12 · aviso con el alt; crédito intacto |
| 26 | dea/#especies | todos | «1 fichas.» | baja | **Hecho** · c49cc12 |
| 27 | dea/#especies, #glosario | todos | Estado vacío sin salida | baja | **Hecho** · c49cc12 · «Borrar la búsqueda» y «Buscar también fuera de África» |
| 28 | atlas/index.html | escritorio | Diálogo Bibliografía: al cerrarse, el foco vuelve a `body` | media | **No hecho** · se deja como propuesta (§ 4); el atlas v1 solo recibió piso de bajo riesgo |
| 29 | atlas/index.html | todos | Interfaz sin tildes («actualizacion 3 anos», «Africa 2023-2026», «region»…) | media | **Parcial** · cb8dfe7 · corregidas «actualización 3 años» y «África 2023-2026» en contador y filtro; el título de grupo «Africa 2023-2026 · …» no se toca porque la búsqueda lo compara (`groupTitle.includes`); las demás palabras de la fila no se trataron |
| 30 | atlas/index.html | todos | Dos h1 visibles | baja | **Hecho** · cb8dfe7 · h1 accesibles 2 → 1 en tres viewports |
| 31 | atlas/index.html | todos | Emoji en la interfaz («🔗 Con DOI», «⏱ 15 min», 1,8:1) | baja | **Hecho** · cb8dfe7 · «Con DOI», «N min» |
| 32 | ligera/ | todos | Imágenes remotas de Wikimedia aunque hay copias locales | media | **Hecho** · 77dbb7b · 47/47 imágenes locales; 0 peticiones fuera del origen |
| 33 | ligera/ | todos | Falta un punto en el pie de imagen fallida | baja | **Hecho** · 53708ef |
| 34 | ligera/ | todos | Salto h2 → h4 | baja | **Hecho** · 53708ef · h4 → h3 |
| 35 | recorrido (todas) y atlas | todos | Dependencia de Google Fonts (y en el atlas, Leaflet, teselas y Wikimedia) | media | **Parcial** · 0818e5f · recorrido: peticiones externas 1 → 0 por página y errores de consola 2 → 0; el atlas v1 sigue dependiendo de terceros (solo anotado) |
| 36 | recorrido (todas) | impresión | Sin estilos de impresión: fondo oscuro y botón fijo | media | **Hecho** · a0d30bb · fondo blanco y 0 fijos visibles en las 10 páginas |
| 37 | dea/ | impresión | Se imprimen solo las sesiones abiertas, sin aviso | baja | **Hecho** · c49cc12 · nota impresa |
| 38 | dea/ (pestañas) | teléfono | Solo 4 de 10 pestañas visibles; única pista una máscara | media | **Hecho en su mínimo** · 2decc31 (L2-3) · lista «Secciones» con las diez; el cambio de modelo (tres grupos, barra inferior) queda como propuesta |
| 39 | dea/#tiempo | todos | Nombres enlazados de 20 px de alto | baja | **Hecho** · 31af692 · 24 px |
| 40 | recorrido/introduccion.html | todos | «Volver» de 49 × 36 px y recortado en escritorio (y = −4) | baja | **Hecho** · 18f8c58 · a 12 px del borde y 44 px de alto (49 × 44 en teléfono) |

Recuento: 35 hechas (la 38, en su mínimo L2), 3 parciales (22, 29 y 35) y 2 no hechas (14 y 28).

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

## 2. Cambios L2 (reestructuras aisladas)

Cada uno es un commit propio. Capturas completas en la carpeta de trabajo de la auditoría (`diseno/l2/`); pares
reducidos en `docs/diseno/evidencia/`.

| L2 | Commit | Qué cambia | Cómo revertirlo | Capturas |
|---|---|---|---|---|
| L2-1 | e3e8003 | Rejilla de página común para cabecera, pestañas, contenido y pie; resumen de ficha en dos líneas | `git revert`; antes hay que revertir L2-2 y L2-3, que tocan la cabecera y la pista | `L2-1_{antes,despues}_*.png`; evidencia `L2-1_rejilla_escritorio_*` |
| L2-2 | a334a5a | Menú «Ajustes» en teléfono y ajustes fantasma en escritorio | `git revert`; revertir antes L2-9, que reutiliza el estado de «Proyectar» | `L2-2_*`; evidencia `L2-2_ajustes_telefono_*` |
| L2-3 | 2decc31 | Lista «Secciones» visible y pestañas sin palabras cortadas | `git revert` (requiere L2-1) | `L2-3_*`; evidencia `L2-3_secciones_telefono_*` |
| L2-4 | dd4dee4 | Bloque «Continuar» como punto focal de Inicio | `git revert` | `L2-4_*`; evidencia `L2-4_continuar_telefono_*` |
| L2-5 | 52b808b | Línea del tiempo como gráfico: rejilla, eje fijo, barra elegida | `git revert`; antes revertir L2-9 | `L2-5_*`; evidencia `L2-5_tiempo_escritorio_*` |
| L2-6 | b9a073c | Fichas en una columna que se abren como página de manual | `git revert` (el enlace a la línea del tiempo nació en L2-5) | `L2-6_*`; evidencia `L2-6_fichas_escritorio_*` |
| L2-7 | 806e4c0 | Mapa con puntos numerados, recuadro del Rift y regiones por zona | `git revert`; revertir antes 4a8cb2a, que retoca el recuadro | `L2-7_*`; evidencia `L2-7_mapa_escritorio_*` |
| L2-8 | 37b2ed3 | Comparar con un solo gráfico, franja de coincidencia y créditos completos | `git revert` | `L2-8_*`; evidencia `L2-8_comparar_telefono_*` |
| L2-9 | fbde9e0 | Modo proyección: ancho, contraste y una sola salida | `git revert` (es el último L2 dependiente) | `L2-9_*`; evidencia `L2-9_proyeccion_escritorio_*` |
| L2-10 | 505fc52 | Glosario agrupado por letras con índice | `git revert` | `L2-10_*`; evidencia `L2-10_glosario_telefono_*` |

Cambios C (fundamentos compartidos, también aislados): C-1 0818e5f (recorrido con la tipografía y los fundamentos
del sistema base), C-2 3af6df4 (consulta ligera en papel y tierra), C-3 77dbb7b (consulta ligera con copias
locales), C-4 acc7f7e (dock de la portada). Pulido final: 4a8cb2a.

## 3. Mediciones de cierre

- axe-core: 0 infracciones en DEA (10 vistas × 3 viewports), recorrido (10 páginas × 3) y consulta ligera.
- Sin desbordamiento horizontal a 320 px en las mismas páginas.
- 0 peticiones externas en DEA, recorrido y consulta ligera.
- Tamaños de letra: DEA y recorrido con los 7 pasos de la escala (más el «display» del recorrido); consulta
  ligera, 5.
- Verificador: 79 comprobaciones en verde (8 nuevas en esta ronda); pruebas: 53 (18 nuevas).

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

## 5. Lo que no se ha podido comprobar

- **Portada 3D completa con GPU real**: con SwiftShader la escena tarda más de lo que admiten las pasadas de
  piso; se midieron el dock, el solape con el título, axe y 320 px con una pasada ligera, no el piso completo.
- **Fuentes reales de terceros**: Google Fonts, Wikimedia y las teselas no se alcanzan desde el entorno; el
  aspecto del atlas v1 con sus fuentes no se ha visto.
- **Lectores de pantalla**: no se ha ejecutado ninguno (NVDA, JAWS, VoiceOver, TalkBack).
- **Firefox y Safari**: solo Chromium.
- **Dispositivos reales**: solo emulación de viewport en Chromium.
- **Pantalla completa real del modo proyección** y su lectura en un proyector de aula.
