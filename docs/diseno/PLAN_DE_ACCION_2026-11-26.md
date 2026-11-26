# Plan de acción · PaleoBot · 26-11-2026

Deriva de `AUDITORIA_CUATRO_EJES_2026-11-26.md` y de los pendientes de `auditorias/paleobot-estado-2026-11-26.md`. Principios: cambios aditivos y reversibles; una PR por tanda; verificador 91/91, pruebas, axe y comprobación en navegador antes de cada fusión; lo dudoso se marca, no se afirma; no se cita ningún DOI sin resolverlo.

## Tanda 1 · Coherencia de cifras (C-1) · prioridad baja tras la reformulación · hecha (PR n.º 26)
- **Hallazgo corregido:** el campo `anos` de `catalog.json` es el original preservado (huella protegida) y no se muestra; la ligera usa `chronology.records`. No se edita `catalog.json`.
- **Hecho:** prueba `tests/test_cifras_cronologicas.py` que impide mostrar `anos` y fija las revisiones de Kabwe 1, Omo I y *H. floresiensis*.
- **Queda:** explicar al lector que la ligera da la edad del ejemplar de referencia y el atlas el rango del taxón.

## Tanda 2 · Rigor científico de las fichas (C-2, C-3, C-5) · alta · 1 jornada + revisión humana
- **Hacer:** corregir la localidad de *Dryopithecus* si la fuente lo confirma; sustituir el campo único `datacion` por la lista de métodos publicados en *H. erectus*, neandertales y *H. naledi*; revisar con el texto de cada ficha qué taxones llevan la etiqueta «debatida» o «revisión» (empezar por *H. bodoensis*, *H. cepranensis*, *H. georgicus*, *Au. prometheus*, *H. rhodesiensis*).
- **Decisión de la titular:** quién valida (D5, revisión experta de las fichas africanas) y si los criterios de «debatida» se fijan por escrito.
- **Aceptación:** cada cambio con fuente y DOI resuelto; procedencia registrada; texto y etiqueta coherentes.

## Tanda 3 · Peso y terceros del atlas (T-1, T-2) · media · 1 jornada
- **Hacer:** recomprimir y redimensionar los cinco JPEG de la portada del atlas (objetivo: menos de 1,2 MB en total, con `srcset` para móvil); carga diferida de las imágenes bajo el pliegue; no iniciar teselas ni imágenes de Wikimedia hasta abrir el mapa o la ficha.
- **Decisión de la titular:** D4 (consulta de protección de datos por terceros que reciben la IP) condiciona si las imágenes remotas pasan a copia local.
- **Aceptación:** carga inicial por debajo de 3 MB; sin peticiones externas antes de la interacción; axe y humo sin pérdidas.

## Tanda 4 · Legibilidad y accesibilidad táctil (V-1, T-5, T-4, T-7, V-3) · media · 1 jornada
- **Hacer:** medir el tamaño mínimo de letra y los objetivos táctiles con un script reproducible (en `scripts/atlas/`); fijar un suelo de 12-13 px en datos secundarios y 24 px de objetivo en la entrada DEA y la consulta ligera; un solo `<h1>` por página; enlaces de la entrada DEA al atlas con ancla; rótulo de vista sin recorte en teléfono.
- **Aceptación:** informe de medición antes y después; axe 0; humo sin pérdidas a 390 y 1366 px.

## Tanda 5 · Didáctica del DEA (D-1, D-2, M-1 a M-4) · media · 2 jornadas
- **Hacer:** limpiar la redacción de la vista Aula (sin «situaciones de aprendizaje» ni «preparar clase» sin generador); añadir al Repaso preguntas de interpretación («¿qué afirmaría y qué no con esta evidencia?»); rúbrica opcional de cuatro niveles alineada con el vocabulario de la Consejería, sin sustituir los criterios del profesorado; duración orientativa por sesión e itinerario rápido; unificar el trato en «usted».
- **Decisión de la titular:** registro de trato definitivo y si la rúbrica se ofrece como descarga.
- **Aceptación:** lectura de cada sesión por una persona ajena al desarrollo; sin regresiones de axe y humo.

## Tanda 6 · Validación con personas (D-4) · alta · 2-4 semanas
- **Hacer:** piloto con una cohorte del DEA (consentimiento informado, sin datos personales; SUS y tiempo en tarea en tres tareas); sesión con lector de pantalla (NVDA o VoiceOver), Safari, Firefox y un Android real; revisión experta humana de las fichas (S6).
- **Aceptación:** informe con resultados y limitaciones; sin él, el criterio de uso docente sigue en NO_GO.

## Pendientes menores (cuando haya hueco)
Aviso de «evidencia histórica» en `experimental/atlas-r98/` y `baselines/entrada-ligera-v9.html`; CSP en recorrido y consulta ligera; `style-src` sin `'unsafe-inline'` en el atlas; revisar los 232 `innerHTML`; rótulo «mapa esquemático» en el simulador; explicar o retirar el selector «Nivel Doctorado»; validar el paquete IMS; fuente única de datos (A5).

## Orden y dependencias
Tanda 1 → Tanda 2 (comparten datos) · Tandas 3 y 4 en paralelo (archivos distintos) · Tanda 5 tras 4 (misma entrada DEA) · Tanda 6 cuando 1, 2 y 5 estén fusionadas. Cada tanda termina con fusión explícita de la titular, comprobación del despliegue en Pages y actualización de `auditorias/paleobot-estado-*.md`.

## Decisiones que necesito de la titular
1. ¿Quién hace la revisión experta de las fichas (D5) y en qué plazo?
2. ¿Se mantienen las imágenes remotas de Wikimedia o pasan todas a copia local (D4)?
3. ¿Trato de «usted» en todo el recurso?
4. ¿Se abre el piloto con el DEA este curso, y con qué cohorte?
