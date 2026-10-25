# Registro de cambios

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
