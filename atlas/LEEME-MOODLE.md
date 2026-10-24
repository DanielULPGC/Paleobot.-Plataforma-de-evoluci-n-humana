# LEEME MOODLE

## Paquete

Archivo final previsto: `Atlas-PaleoBot-v1.0-Moodle-IMS.zip`.

Este ZIP esta preparado como paquete IMS Content Package para importarse en Moodle. El punto de entrada declarado en `imsmanifest.xml` es `index.html`.

## Como incorporarlo a Moodle

1. Entrar en el curso de Moodle con permisos de edicion.
2. Activar el modo de edicion.
3. Anadir una actividad o recurso.
4. Seleccionar "Paquete IMS" o "IMS content package", segun la traduccion instalada.
5. Subir `Atlas-PaleoBot-v1.0-Moodle-IMS.zip`.
6. Guardar y comprobar que el recurso abre `index.html`.

## Uso docente recomendado

- Primera exploracion: comenzar por la cronologia, el mapa y las fichas de taxones.
- Trabajo guiado: usar la seccion "Itinerarios didacticos" para adaptar el recurso a Educacion Primaria, futuro profesorado, profesorado universitario o publico general.
- Comparacion cientifica: abrir "PaleoLab 50" desde "Aula y recursos" para contrastar cronologia, region, morfologia, cobertura fosil y confianza de hasta tres taxones.
- Trabajo metodologico: emplear las vistas de datacion, tafonomia, debates, filogenia y glosario para diferenciar datos, inferencias, modelos e incertidumbres.
- Evaluacion formativa: pedir al alumnado una evidencia breve de aprendizaje, por ejemplo una comparacion de taxones, una ruta justificada o una respuesta apoyada en datos del atlas.

## Accesibilidad

El aplicativo incluye mejoras de navegacion por teclado, foco visible y nombres accesibles en controles principales. La revision automatizada no sustituye una prueba humana con lector de pantalla ni una comprobacion contextual en el curso Moodle real.

## Privacidad y servicios externos

El paquete contiene recursos locales y tambien puede cargar recursos externos declarados en el propio HTML, como fuentes, Leaflet, mapas, imagenes Wikimedia, enlaces DOI o los modelos 3D de Smithsonian abiertos voluntariamente desde PaleoLab. Revise `POLITICA-PRIVACIDAD-DOCENTE.md` antes de usarlo en entornos con politicas restrictivas de red.

## Recomendacion tecnica

- Subir el ZIP sin descomprimirlo manualmente.
- No cambiar nombres de carpetas internas.
- Probar el recurso en el mismo tema visual de Moodle en el que lo vera el alumnado.
- Si Moodle bloquea recursos externos, el aplicativo debe seguir cargando su estructura local, aunque algunos elementos visuales remotos pueden no aparecer.
- Las herramientas flotantes se abren desde el botón de cuadrícula situado en la esquina inferior derecha. Permanecen cerradas por defecto para no cubrir las actividades.
- En el mapa, los focos regionales aplican un acercamiento automático limitado; el control con icono de globo restablece la vista global.

## Comprobacion visual rapida

- La barra oscura de consulta indica la vista activa. Al abrir `Clima` debe mostrar `Clima PAGES2k`, no `Cronologia`.
- Los dialogos contienen su propio desplazamiento. `Volver` cierra el dialogo y devuelve el foco al control que lo abrio.
- Las herramientas flotantes deben desaparecer mientras un dialogo esta abierto.
- `Estadisticas`, `Bibliografia` y `Guia del alumnado` deben permanecer abiertas despues de completar un solo clic.

## Documentos incluidos

- `LEEME-MOODLE.md`: instrucciones docentes y de instalacion.
- `CAMBIOS-v1.0.md`: resumen de mejoras de esta version estable.
- `PROPUESTA-DIDACTICA.md`: propuesta pedagogica por perfiles de usuario.
- `POLITICA-PRIVACIDAD-DOCENTE.md`: orientaciones sobre privacidad y servicios externos.
