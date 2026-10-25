# Registro de cambios

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
