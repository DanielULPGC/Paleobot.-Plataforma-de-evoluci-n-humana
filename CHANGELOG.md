# Registro de cambios

## PB-GH-08 · Imágenes en copia local para la entrada DEA · 10-11-2026

Decisiones de la titular (10-11-2026): la raíz sigue abriendo la portada 3D y las imágenes
se alojan como copias en el sitio. Cambio aditivo.

- `img/taxones/`: 47 copias (2,7 MB) de las imágenes verificadas en
  `src/entrada_ligera/image_audit.json`, obtenidas de Wikimedia Commons como miniaturas de
  hasta 500 px. `MANIFIESTO.json` guarda huella SHA-256, tamaño, dimensiones, autoría,
  licencia y página de origen; `CREDITOS.md` lo presenta como tabla.
- `scripts/obtener_imagenes.py` (descarga y comprobación) y flujo manual
  `obtener-imagenes.yml`: el entorno de trabajo no alcanza Wikimedia, así que la descarga
  la hizo GitHub Actions en la rama y dejó las copias en un commit propio.
- Entrada DEA: cada ficha con imagen la muestra con un pie que dice qué es (molde, réplica,
  dibujo, mapa o fósil), su autoría, su licencia y su fuente; el comparador muestra las dos
  imágenes. 47 de 52 taxones tienen imagen; quedan sin ella *Anoiapithecus*,
  *Chororapithecus*, *H. gautengensis* y dos subespecies de *H. erectus*.
- `provenance/PB_GH_08_CORRESPONDENCIAS.json`: identificador del recorrido → clave del
  expediente visual (primer paso de la tabla de correspondencias entre catálogos).
- Las fichas y las sesiones abiertas por enlace ya no quedan bajo la barra de pestañas.
- Revisión: las 47 copias se miraron en hojas de contacto y coinciden con la descripción
  del expediente. Sigue sin haber peticiones a servicios externos en la entrada DEA.

## PB-GH-07 · Entrada DEA «África, cuna de la humanidad» (prototipo) · 09-11-2026

Segunda ampliación (09-11-2026, noche), sin eliminar nada:
- Uso en el teléfono: sesiones plegables con contador de progreso (la portada de la
  entrada pasa de 9,2 a 5,1 pantallas), puntos del mapa con área táctil de 24 px y rótulo
  de la región elegida, aviso de que hay más pestañas, enlaces «anterior/siguiente» e
  índice de secciones; el detalle de la región aparece junto al mapa.
- Cuaderno: cada paso tiene un espacio para notas, guardadas solo en el dispositivo, con
  descarga en un archivo de texto, borrado en dos pulsaciones e impresión.
- Repaso: ocho preguntas de autoevaluación generadas a partir de los datos (antigüedad,
  región, coincidencia en el tiempo, validez debatida), con explicación y enlace a la ficha.
- «Imagine un solo día»: equivalencia de los 7,2 Ma en 24 horas, calculada con los datos.
- Fichas con enlaces «Ver en el mapa» y «Comparar con otra especie».
- Corrección: la etiqueta «Hecha» se mostraba siempre; los destinos de las pestañas
  pasan a ser identificadores reales (axe `skip-link`).
- Portada Sylva: sexto enlace del menú, «DEA», hacia `dea/`; los cinco anteriores se conservan.
- Consulta ligera: la referencia con DOI 10.1002/ajpa.24122 se conserva y se marca como
  «no localizada; pendiente de verificación».
- Registro en `provenance/PB_GH_07_CORRECCIONES.json`.

Ampliación posterior el mismo día, también aditiva:
- Sesiones 5 («Patrimonio de la humanidad en África») y 6 («Imágenes de nuestros orígenes»)
  completas, con cinco sitios del Patrimonio Mundial, tres casos (Piltdown, Taung,
  investigación hecha desde África) y sus fuentes consultadas el 09-11-2026.
- Glosario de 359 términos, generado desde el del atlas (`scripts/generar_glosario_dea.cjs`)
  y comprobado por el verificador.
- Guía para el trabajo individual (pregunta, estructura, fuentes fiables, citas en APA 7,
  lista de comprobación) y botón «Imprimir».

Por indicación de la titular, la mejora didáctica se centra en el alumnado del Diploma
de Estudios Africanos (ULPGC), que usará el recurso en ordenador, tableta y teléfono,
con proyección opcional. Cambio aditivo: nuevo directorio `dea/`; no modifica el atlas,
la portada ni la consulta ligera.

- Inicio con seis sesiones (cuatro completas; «Patrimonio» e «Imágenes de nuestros
  orígenes» en preparación hasta comprobar sus datos), pasos enlazados, propuesta para
  el trabajo individual y marca local de «Sesión hecha».
- Línea del tiempo (solo África o todo; con o sin primates del Mioceno), mapa de África
  con Canarias (contorno Natural Earth, dominio público), fichas con fuentes y DOI,
  comparador de coexistencia, métodos y clima tomados de `atlas/recorrido/datos.js`.
- Letra ampliable, modo proyección con pantalla completa, impresión, tema oscuro,
  CSP estricta (`script-src 'self'`, `connect-src 'none'`) y ningún dato personal.
- Comprobado en Chromium a 390, 820 y 1366 px y al 200 % de zoom: axe-core sin
  infracciones A/AA, sin desbordamiento, sin errores JS ni peticiones externas.
  Pendiente: Safari/iOS, Firefox, lector de pantalla y prueba con el alumnado.

## PB-GH-06 · Sin Moodle ni IA · 01-11-2026

Por indicación de la titular se retiran las referencias a Moodle (subida e instalación)
y a la IA. Registro con motivo, evidencia, impacto, retorno y originales archivados en
`provenance/PB_GH_06_CORRECCIONES.json`.

- Atlas: fuera los botones «Preguntas con IA» (autoevaluación) y «Reconstrucción facial IA»
  (ficha); la nota «Modo offline: no usa IA ni conexión» pasa a «Funciona sin conexión».
- Atlas: las exportaciones TXT ya no mencionan Moodle.
- Consulta ligera: título «PaleoBot · Consulta ligera», sin el aviso de prueba en Moodle;
  el diagnóstico pasa a «Comprobar las imágenes».
- Documentación: se retira `atlas/LEEME-MOODLE.md` (y su entrada en el manifiesto); la
  política de privacidad pierde las secciones de IA; README, guía del atlas y protocolo
  de la portada sin instrucciones ni pruebas de Moodle.
- Se conservan: el código de las funciones generativas sin punto de entrada, la
  protección 079 que bloquea servicios externos, `CAMBIOS-v1.0.md` y las evidencias
  históricas. Sigue NO_GO (lector de pantalla y navegadores no Chromium).

## PB-GH-05 · Errores técnicos del sitio · 31-10-2026

Sin eliminar contenido, páginas ni imágenes; solo atributos, estilos de color, espacios
y manifiesto. Registro con motivo, evidencia, impacto, retorno y estados archivados en
`provenance/PB_GH_05_CORRECCIONES.json`.

- Portada Sylva: los cuatro enlaces del menú tienen nombre accesible también en móvil;
  la etiqueta del logotipo describe su destino real (recorrido guiado).
- Atlas v1.0: `body` deja de recibir `aria-selected` y la clase `active` (selector
  `[data-pb-v50-block]:not(body)` en seis módulos).
- Atlas v1.0: la limpieza de marca ya no pega palabras («comprender quiénes»,
  «de *Australopithecus*»).
- Atlas v1.0: contraste AA en 38 textos secundarios (reglas añadidas al final de
  `051-paleobot-landing-redesign.css`) y recarga forzada de los recursos cambiados.
- `imsmanifest.xml`: añade las 10 entradas de la portada Sylva (178, todas presentes).
- Resultado: axe-core 4.10.2 sin infracciones WCAG A/AA en la portada del atlas,
  la portada Sylva (1280 y 390 px), los diez documentos del recorrido y `ligera/`.
  Verificador 56/56; pruebas 20/20. Sigue NO_GO (Moodle, lector de pantalla,
  navegadores no Chromium y rendimiento en aula sin probar).

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
