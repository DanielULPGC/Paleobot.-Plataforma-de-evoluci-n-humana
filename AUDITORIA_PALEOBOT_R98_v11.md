# PaleoBot · Auditoría focalizada del adjunto R98

**Fecha:** 28 de septiembre de 2026. **Material revisado:** `files (2).zip` (contiene `PaleoBot_Moodle_R98.zip`, `preparar-imagenes-paleobot.html` y `CHANGELOG_R98.md`). Comparación con la entrada ligera v10 y su expediente visual.

## Resultado y decisión

El paquete R98 aporta una **hipótesis útil sobre imágenes bloqueadas** y una sonda para registrar bloqueos de política y errores de carga. Esa parte se ha adaptado a la entrada ligera **v11** para recoger datos en el Moodle real. El paquete R98 adjunto **no se instala como sustituto de la entrada ligera**: requiere múltiples archivos, no incluye copias locales de las imágenes y su herramienta agrega materiales fuera del expediente visual revisado.

| Comprobación | Evidencia en el adjunto | Consecuencia |
|---|---|---|
| Estructura | El ZIP interior tiene 147 ficheros; `index.html` referencia 128 rutas locales de hoja de estilo o script y todas existen. | La mera integridad de rutas no verifica el arranque y la navegación en Moodle. |
| Imágenes locales | `assets/img/manifest.js` declara `files: {}`; no hay archivos bajo `assets/img/wm/`. | R98, tal como llega, sigue dependiendo de imágenes remotas. El nombre del paquete no acredita que estén incorporadas. |
| Datos científicos | El catálogo R98 conserva los mismos 50 identificadores y la misma sección de cronología que v10. Las diferencias en fichas comparadas son únicamente las URLs propuestas para imágenes a tamaños distintos. | No hay información cronológica nueva que incorporar. Se mantiene la fuente A3 de la entrada ligera. |
| Herramienta de descarga | `preparar-imagenes-paleobot.html` enumera 102 nombres únicos de Commons. Entre ellos aparecen `Anoiapithecus_brevirostris.png`, la miniatura `6a00d8341bf67c53ef01348157067b970c-320wi.jpg` y `Australopithecus_anamensis_skull.png`. | Dos corresponden a fichas pendientes de identificación o derechos y el tercero a una candidata previamente excluida; no debe interpretarse la lista entera como material acreditado. |
| Validación de descargas | La herramienta registra el texto de licencia y autoría si la API lo devuelve y permite generar el ZIP incluso cuando faltan imágenes. No bloquea expresamente licencias desconocidas o archivos sin datos suficientes. | El ZIP resultante puede tener cobertura parcial y necesita cotejo humano de cada crédito, identificación y permiso antes de presentarse como colección auditada. |
| Diagnóstico de política | El changelog describe un **simulador** de Moodle con `img-src 'self' data:` y advierte que no consultó el servidor institucional ni probó Wikimedia real. | Se puede afirmar que esa política reproduce el síntoma en el simulador; la causa concreta en Moodle sigue sin determinarse. |
| Experiencia de instalación | R98 requiere descomprimir y marcar `index.html` como entrada del recurso. En este curso ya hubo dificultades con ese flujo; la entrada ligera se ha usado como un único HTML. | Se prioriza la entrega directa de un archivo HTML hasta validar el procedimiento del curso. |

## Incorporación a v11

Se añade **«Comprobar las imágenes en Moodle»** al HTML directo. «Probar tres imágenes» comprueba un recurso antiguo y dos de los tres incorporados en v10. La página muestra cuatro cifras observadas durante la sesión: cargadas, fallidas, peticiones en curso y aún no solicitadas. Si el navegador emite una infracción `img-src`, `img-src-elem` o `default-src` ligada a Wikimedia, se indica que recibió un aviso de política. Cada ficha conserva la fuente accesible ante un error. Las 50 fichas, sus edades, referencias, localidades y 47 recursos documentados siguen en el mismo catálogo y expediente visual.

## Límites

Se validaron la sintaxis y la estructura de v11 de forma local. No se han descargado aquí las 102 imágenes de R98 ni se ha ejecutado su herramienta frente a Wikimedia real. Tampoco se ha accedido al Moodle institucional: solo una prueba allí permitirá observar si sus imágenes y scripts funcionan y, si fallan, si el navegador comunica un bloqueo de política. Los recursos visuales revisados en v10 incluyen figuras, mapas, dibujos y fotografías; su expediente de atribución no sustituye la revisión científica primaria de cada espécimen.

**Próxima prueba:** abrir el HTML v11 como archivo directo en Moodle; pulsar «Probar tres imágenes» y observar tanto el recuento como el aviso de seguridad. Si las tres cargan, comprobar un par de fichas adicionales. Si fallan, conservar el resultado antes de decidir cómo empaquetar imágenes locales sin ampliar la colección con materiales dudosos.
