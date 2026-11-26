# Propuesta de la tanda 2 · revisión científica de fichas · 26-11-2026

Documento para validación humana. **No se ha cambiado ningún dato ni código.** Cada propuesta indica qué se observa, qué fuente lo respalda, el estado de la comprobación y qué cambiaría. Estados: **comprobado** (leído en la fuente o en el registro editorial durante esta sesión), **secundario** (solo fuente de segunda mano), **por validar** (conocimiento previo, sin contraste).

**Corrección respecto a la auditoría de esta mañana.** Al contrastar el código, parte de C-3 ya estaba resuelta: en el atlas, *H. erectus* figura como «Múltiples (según yacimiento)» y los neandertales como «Múltiples (14C solo para los últimos ~50 ka)», y la consulta ligera muestra por ficha el método y el ejemplar fechado (`chronology.records`). Quedan las propuestas siguientes.

## P-1 · *Homo naledi*: método de datación en el atlas
- **Observado:** el atlas muestra «OSL» como método único (`datacion: "OSL"` en `002-script.js`). La consulta ligera ya describe la combinación correcta.
- **Fuente (comprobado):** Dirks, P. H. G. M. et al. (2017). The age of *Homo naledi* and associated sediments in the Rising Star Cave, South Africa. *eLife*, 6, e24231. https://doi.org/10.7554/eLife.24231. Datación U-Th de flowstones, US-ESR en tres dientes de *H. naledi* y uno de babuino, OSL en sedimentos de la Unidad 1 y paleomagnetismo del Flowstone 1a; intervalo deposicional 335-236 ka.
- **Propuesta:** `datacion: "Múltiples (US-ESR en dientes, U-Th y paleomagnetismo en flowstones, OSL en sedimentos)"`.
- **Efecto:** solo el rótulo de método de la ficha del atlas. Requiere entrada de procedencia en `002-script.js`.

## P-2 · *Dryopithecus*: localidad «África y Europa»
- **Observado:** el atlas y la consulta ligera muestran «África y Europa» («Localidad del catálogo»); el holotipo es de Saint-Gaudens (Francia) y la propia ficha lo describe como europeo «con posibles vínculos africanos».
- **Fuente (secundario):** Wikipedia (*Dryopithecus*) enumera como localidades Saint-Gaudens y Saint-Alban-de-Roche (Francia), Vallès Penedès (Cataluña), St. Stefan (Austria) y cita Rudabánya (Hungría) para una especie hoy asignada a *Rudapithecus*; no atribuye registros africanos y señala que *Proconsul* fue subgénero histórico y ya no lo es. **Falta contraste con una fuente primaria o de síntesis**; las referencias de la ficha (Begun, 2001; Casanovas-Vilar et al., 2011) son el punto de partida.
- **Propuesta (tras validar):** «Europa (Francia, España, Austria)» y, en la descripción, sustituir «con posibles vínculos africanos» por «con relaciones filogenéticas discutidas con los grandes simios africanos».
- **Efecto y coste:** en el atlas, un campo de datos; en la consulta ligera, el texto sale del catálogo original protegido, así que haría falta una capa de revisión en `build.py` como la de las cronologías.

## P-3 · Neandertales: respaldo del texto sobre el radiocarbono
- **Observado:** el rótulo ya es correcto («14C solo para los últimos ~50 ka»).
- **Fuente (comprobado):** Higham, T. et al. (2014). The timing and spatiotemporal patterning of Neanderthal disappearance. *Nature*, 512, 306-309. https://doi.org/10.1038/nature13621. Radiocarbono por AMS con pretratamiento mejorado; fin del Musteriense hacia 41,0-39,3 ka cal BP (95,4 %) y solapamiento con humanos modernos de unos 2,6-5,4 milenios.
- **Propuesta:** ninguna sobre el rótulo; comprobar que la ficha cita esta referencia con su DOI.

## P-4 · Etiqueta «debatida» o «revisión» (propuesta para decisión de la persona experta)
Hoy son 5 «debatida» y 2 «revisión» entre 50 registros. El texto de debate de la propia ficha describe controversia en estos taxones, que no llevan la etiqueta:

| Taxón | Qué dice la ficha (debate) | Propuesta |
|---|---|---|
| *H. bodoensis* | Propuesta de 2021 «útil pero no consenso cerrado» | «Revisión» |
| *H. cepranensis* | Incertidumbre cronológica (~900 frente a ~450 ka) | «Revisión» |
| *H. georgicus* | Frente a *H. erectus* temprano; escepticismo ante la lectura de una sola especie | «Debatida» |
| *Au. prometheus* | Validez abierta; datación cuestionada (Sutton et al., 2023) | «Debatida» (DOI de Sutton por comprobar) |
| *H. rhodesiensis* | ¿Sinónimo de *heidelbergensis*, de *bodoensis* o especie autónoma? | «Debatida» |

**Decisión necesaria:** el criterio de cada etiqueta («debatida» = validez de la especie discutida; «revisión» = datación o diagnóstico en revisión) debe fijarlo la persona experta y quedar escrito en el sistema de diseño, para aplicarlo igual a los 50 registros.

## P-5 · Pendientes de datos sin tocar hoy
*H. rudolfensis* (2,4 Ma), *H. ergaster* (1,8 Ma), *P. robustus* (1,8 Ma) y *P. boisei* aparecen con un valor puntual en el rango de taxón (S2); la ligera ya muestra el ejemplar y el atlas el rango, pero conviene revisar el valor puntual. DOI de *Au. prometheus* que corresponde a otro artículo (S7) y vista climática con PAGES 2k (S4).

## Cómo aplicarlo (tras la validación)
1. Una PR por propuesta aprobada, con entrada de procedencia y estado previo archivado.
2. Verificador 91/91, pruebas y comprobación en navegador (texto visible de la ficha, atlas y ligera).
3. Actualizar `auditorias/paleobot-estado-*.md`.

## Decisiones solicitadas
- ¿Se aprueban P-1 y P-2 (con contraste previo de P-2 en una fuente de síntesis)?
- ¿Qué criterio fija las etiquetas «debatida» y «revisión», y quién lo valida (P-4)?
- ¿Quién revisa las fichas africanas y en qué plazo (D5)?
