# PaleoBot · Atlas original en un archivo directo para Moodle (piloto)

**Origen:** `PaleoBot_Moodle_R98.zip`, adjuntado el 28 de septiembre de 2026. **Estado:** candidato de prueba, **sin validación de funcionamiento en el Moodle de la ULPGC** y sin promoción de la puerta científica A3. La entrada ligera v11 queda disponible como recurso comprobado por el usuario.

## Qué conserva

La estructura de navegación y las vistas del atlas R98, sus mapas, filogenia, comparadores, bibliografía y herramientas docentes. Se han incluido en un único HTML 74 módulos JavaScript originales: el cargador diferido se sustituyó por los dos módulos que cargaba. También se incluyen 55 hojas CSS y la hoja de la cronología A3. Los archivos de imagen propios de Leaflet se han insertado dentro del CSS. La consulta «Cronología crítica · A3», antes situada en `science/chronology.html`, aparece dentro del atlas con su catálogo A3 y su advertencia experimental.

Las 50 fichas y sus evidencias cronológicas proceden del mismo catálogo A3 utilizado en la entrada ligera. En la capa visual de las especies se usan los 47 recursos documentados en el expediente de la v10/v11. *Anoiapithecus*, *Chororapithecus* y *Homo gautengensis* muestran avisos tipográficos explícitos porque no se confirmó una imagen reutilizable en el expediente. Los créditos y enlaces de los recursos documentados se incorporaron a los metadatos de las fichas. Sus identificaciones siguen sujetas a la cautela de cada fuente.

## Para probar en Moodle

1. Subir **`PaleoBot_Atlas_Original_Directo_R98_PILOTO.html`** como un recurso Archivo nuevo y abrirlo en ventana nueva. El ZIP de fuentes sirve para reproducir el piloto, no para instalarlo en el curso.
2. Abrir «Entrar al atlas» y comprobar que cambian las vistas «Cronología», «Mapas» y «Filogenia».
3. Abrir una ficha de especie y comprobar imagen, características, edad, procedencia y fuente. Revisar también una de las tres fichas con imagen pendiente.
4. Comprobar «Bibliografía» y «Modo clase»; seguir el enlace «Cronología crítica · A3» desde la portada.
5. Si una imagen o una tesela cartográfica falla, comprobar el panel «Diagnóstico técnico» del atlas: el contenido visual externo sigue requiriendo acceso de red o una política de imágenes que lo permita.

## Evidencia y límites

Se verificaron **77 bloques JavaScript** con el analizador de Node y los hashes de **77 scripts y 56 hojas CSS** incorporados; todos los enlaces internos presentes en el HTML tienen destino, y la página no depende de rutas CSS o JS externas. La misma política de contenido del atlas se adaptó mediante hashes para permitir esos bloques; una cabecera de Moodle podría imponer restricciones adicionales. La vista «Cronología crítica» ya no solicita `catalog.json` por red. Las imágenes de Commons, otras imágenes temáticas, las fuentes web y las teselas de mapa siguen siendo externas. No se ha podido ejecutar esta versión en el navegador o el Moodle institucional desde este entorno; **no se puede dar por validado ningún botón por una inspección estática**.

Este HTML **no sustituye una certificación científica** de las vistas heredadas: algunas muestran intervalos antiguos con semánticas distintas de los contratos de cronología A3. La cronología A3 describe la edad y el tipo de evidencia publicada; no demuestra la duración de los taxones. La capa completa conserva el estado experimental y el SCORM 1.2 no forma parte de esta prueba.
