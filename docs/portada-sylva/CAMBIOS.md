# Portada alternativa del Atlas de paleoantropología (escena Sylva)

Prototipo aditivo: `portada-sylva.html` convive con el `index.html` del Atlas y no lo sustituye. Se copia en la raíz del Atlas, junto a `datos.js` y las vistas.

## Procedencia

| Elemento | Valor |
|---|---|
| Fuente | `@designcodeio/threeui` 1.2.0 (npm), fichero `lib-dist/assets/landing-pages/inner-green-3d.html` |
| SHA-256 del original | `69c3694bd63f44ef9f007ebe4dac57a83e4402e0cdf6b54dd10b96dd4f05e197` (coincide con el encargo de ThreeUI) |
| Integridad del paquete | SHA-1 y SHA-512 idénticos a los del registro npm |
| Procedencia | Atestación SLSA hacia `MengTo/threeui`, commit `68802d5`; la firma Sigstore **no** se verificó criptográficamente en el entorno de trabajo |
| Licencias | Código e imágenes: MIT (© 2026 Meng To). Lexend: SIL OFL 1.1. Three.js: MIT. Avisos en `licencias/` |
| Recursos | `inner-green-assets/` sin modificar; sumas en `SHA256SUMS.txt` |

## Método

`herramientas/aplicar_cambios.py` verifica el hash del original y aplica 38 sustituciones. Si alguna no coincide exactamente una vez, aborta. El resultado es, por tanto, reproducible y auditable línea a línea. **No se modifica ningún shader, geometría ni lógica de render.**

## Cambios

1. **Idioma y metadatos.** `lang="es"`, título y descripción en español.
2. **Textos.**
   - `h1`: «Atlas de paleoantropología».
   - Entradilla propia.
   - Rótulo decorativo «ATLAS».
   - Menú: Parentesco, Territorio, Fichas, Entrar.
   - Tarjetas: «Recursos de aula» y «Clima y ecología».
   - Textos alternativos traducidos fielmente a lo que muestran las fotografías.
   - Sin guiones largos en el texto visible.
3. **Cifras.** Se retiran las ficticias («282 ha», «43 mapped»). «Taxones» y «Profundidad temporal» se calculan al cargar desde `window.AtlasPaleo` (`datos.js`): número de taxones y valor máximo de `desde`, en Ma. Si `datos.js` no está disponible, ambas se ocultan.
4. **Destinos.**

   | Control | Destino |
   |---|---|
   | Marca del menú | `index.html` |
   | Parentesco | `parentesco.html` |
   | Territorio | `territorio.html` |
   | Fichas | `ficha.html` |
   | Entrar | `atlas.html` |
   | Explorar el atlas | `atlas.html` |
   | Reproducción | `introduccion.html` |
   | Tarjeta de aula | `aula.html` |
   | Tarjeta de clima | `clima.html` |
   | Indicador vertical | `cronologia.html` |

   Los botones que navegan llevan `role="link"`. El menú solo impide la navegación si el enlace carece de destino.
5. **Accesibilidad.**
   - Enlace de salto.
   - El `h1` se sitúa delante de los `h2` en el DOM. La posición es absoluta, así que la maqueta no cambia.
   - `aria-hidden` en el lienzo decorativo.
   - Etiquetas accesibles en español.
6. **Pausa (WCAG 2.2.2).** Un botón visible con `aria-pressed` retiene las peticiones de fotograma (`requestAnimationFrame`) y pausa las animaciones CSS. No edita los bucles de la escena, que acotan su paso temporal, de modo que al reanudar no hay saltos.
7. **Pie.** Licencia CC BY-NC 4.0 y atribución a la ULPGC. Atribución a ThreeUI, Lexend y Three.js. Advertencia didáctica: las fotografías muestran vegetación actual, no paisajes del pasado.
8. **Contraste (WCAG 1.4.3).** Varios textos secundarios de la fuente quedaban por debajo de 4,5:1. Axe-core no los detecta porque el fondo es un lienzo WebGL y el color real de fondo le resulta indeterminable.

   | Texto | Contraste original | Contraste corregido |
   |---|---|---|
   | Rótulos del menú | 3,64:1 | 6,1:1 (opacidad 0,66) |
   | Entradilla y rótulos de las cifras | 4,48:1 | 6,5:1, y 4,8:1 en la zona más iluminada (opacidad 0,82) |
   | Indicador vertical | 3,51:1 | 6,5:1 (opacidad 0,82) |
   | Etiquetas de tarjeta | 3,58:1 | 5,7:1 (`#5c6157`) |

   Son valores calculados sobre el tono base de la escena (`#4a4d44`), no medidos píxel a píxel.
9. **Foco no oculto (WCAG 2.4.11).** En la maqueta estrecha, el botón de pausa deja de ser fijo, porque tapaba las tarjetas al desplazarse, y se ancla sobre la franja de la escena.
10. **Desviación consciente de la configuración de ThreeUI.** En la maqueta de escritorio (≥ 901 px) el titular baja de 63 u a 54 u y la entradilla se desplaza de 520 u a 540 u, porque «paleoantropología» invadía la entradilla y el botón principal. La maqueta estrecha conserva sus valores. El resto de la tipografía configurada (Lexend 300, blanco, entradilla a 16,5 u) coincide con la de la fuente y no se altera.

11. **Degradación sin WebGL2.** En la fuente, si el navegador no ofrecía WebGL2, la rama de reserva del metal líquido vaciaba el contenedor de cada botón y lo sustituía por un aviso en inglés («WebGL2 is required for this page.»): desaparecían «Explorar el atlas» y la introducción, es decir, la acción principal de la portada. Ahora se conserva el botón sobre su placa y solo se oculta el lienzo del efecto. Es el único cambio en código de la fuente fuera del texto y los atributos, y afecta únicamente a esa rama de reserva, no al render. La batería lo verifica con un navegador sin WebGL (T23).

## Condiciones de uso (veredicto G0: adoptar con condiciones)

- Fijar la versión 1.2.0. Cualquier sustitución del HTML exige repetir la auditoría.
- Servir la portada desde el mismo paquete que el Atlas: ninguna petición sale del paquete.
- Conservar la carpeta `licencias/` y el pie de atribución.

## Problemas abiertos (no resueltos en este prototipo)

- **WCAG 1.4.4, Redimensionar el texto.** Toda la tipografía de la fuente escala con `100vw`, así que el zoom del navegador no la agranda. Corregirlo exige reescalar toda la maqueta.
- **Tamaño del menú.** El contraste ya está corregido, pero los rótulos siguen midiendo unos 9 px a 1280 px de ancho, consecuencia del mismo escalado con `vw`.
- **Límite de la auditoría automática.** Que axe-core no dé infracciones no acredita conformidad: no evalúa el contraste sobre lienzos, que ha habido que calcular aparte.
- **Móvil.** La maqueta estrecha oculta el botón de reproducción. La introducción audiovisual se alcanza desde `atlas.html`.
- **Coherencia temática.** La escena representa un sotobosque húmedo actual, no un hábitat de la evolución humana. La advertencia del pie lo mitiga, pero no lo resuelve.
- **Rendimiento en el aula.** No se ha medido. Las pruebas se hicieron con WebGL por software (SwiftShader), a unos 8 a 14 s por fotograma, lo que no representa ningún equipo real. Antes de usarla con alumnado, conviene medir el percentil 95 del tiempo de fotograma en los equipos del aula y con proyector.
- **Moodle.** No se ha probado dentro de un paquete IMS desplegado.

## Pruebas

`pruebas/test_portada.py` (Playwright y Chromium) sirve los ficheros localmente y comprueba lo siguiente:

- Carga, idioma, encabezados y ausencia de peticiones externas.
- Estadísticas, con `datos.js` y sin él.
- Pausa y reanudación.
- Teclado y navegación a cada vista.
- Análisis con axe-core (WCAG 2.x A/AA).
- Modo de movimiento reducido.

Resultado de la última ejecución: **30 de 30 pruebas superadas** (`pruebas/resultados.json`; análisis axe-core en `pruebas/axe.json`, sin infracciones). Capturas en `pruebas/capturas/`: escritorio (1600 y 1280), portátil (1366), móvil (390) y navegador sin WebGL.

**Límite de las capturas.** Con WebGL por software la escena se construye tan despacio que la raíz de musgo no llega a completarse: solo se ve su esbozo en alambre. La captura de control `05_control_original_frente_a_portada.png` muestra que el original sin modificar presenta exactamente el mismo estado en las mismas condiciones, de modo que no es efecto de los cambios. La apariencia final de la escena debe comprobarse en un equipo con GPU.

Para reejecutar: `pip install playwright numpy pillow`, `npx playwright install chromium`, `npm i axe-core@4` (o indicar su ruta en la variable `AXE_PATH`) y `python3 pruebas/test_portada.py <sitio con datos.js> <sitio sin datos.js> <carpeta de capturas>`. El sitio de prueba necesita stubs de las vistas y un `datos.js`; se recomienda usar la copia real del Atlas.

La batería tuvo además un falso positivo: la primera versión de T23 solo comprobaba los elementos presentes y no detectó que los botones de metal líquido habían desaparecido. Se reforzó para exigir su presencia y la ausencia del aviso en inglés; el defecto lo destapó T16.

Hubo un falso negativo de la propia batería: T16 comparaba rótulos distinguiendo mayúsculas, y `innerText` devuelve el texto ya transformado por CSS («PARENTESCO»). Se corrigió la comparación, no el producto. El `datos.js` de prueba contiene valores inventados y **no se entrega**.

## Nota lingüística sobre el Atlas

Algunas vistas del Atlas usan «táxones». El plural normativo es «taxones», que es palabra llana terminada en *-s* y, por tanto, no lleva tilde. La portada usa «taxones».
