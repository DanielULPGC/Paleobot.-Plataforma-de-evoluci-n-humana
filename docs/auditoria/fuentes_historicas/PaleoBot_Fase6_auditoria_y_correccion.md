# PaleoBot · fase 6: reconciliación científica y Bianfu

**Fecha:** 22-09-2026. **Base:** derivado de fase 4. **Dictamen:** `NO_GO` para publicación docente.

## Resultado medible

Se compararon los **50 registros completos** de `science/catalog.json` con las 50 filas de `DB` en `assets/js/00-core/002-script.js`. Había cinco divergencias en `descripcion` y `experto`: `rhodesiensis`, `penghu`, `omo_i`, `denisova` y `longi`. Las cinco fichas de la interfaz se reconciliaron con el catálogo, cuya evidencia de 2025 ya era más reciente. El mapa en `DB` se conserva como URL obtenida de su clave regional en el catálogo. La prueba `test_fase6.cjs` ahora detecta cualquier nueva diferencia campo a campo entre las 50 fichas, verifica el catálogo incrustado y comprueba que la política temporal reconoce las 50 filas.

| Incidencia | Cambio aplicado | Límite |
|---|---|---|
| Fichas duplicadas | Las cinco descripciones y sus siete campos expertos se igualaron con el catálogo. | Los campos ya coincidentes de las otras 45 fichas no quedan por ello verificados frente a publicaciones originales. |
| Denisovanos | Nombre visible «Denisovanos (linaje)» y material «Denisova 3 (falange)», sin presentar *Homo denisova* como binomio establecido ni «ADN» como ejemplar. Se evita atribuirles objetos individuales por defecto. | Delimitación taxonómica y atribuciones arqueológicas siguen abiertas. |
| Bianfu, identificación | Se incorporan dos dientes, dos parietales y un radio proximal identificados mediante paleoproteómica, con referencia a Rao et al. (2026). | Los niveles con esos fósiles, aproximadamente 167–134 ka, no son una duración del linaje. No se cambia `anos`, `val_time` ni el modelo temporal. |
| Bianfu, arqueología | Se incorpora Ruan et al. (2026): propone la atribución más parsimoniosa de la secuencia cultural de aproximadamente 190–70 ka y estudia caza, talla lítica y uso de huesos. | Es una interpretación de conjunto, no la identificación molecular de cada ocupante u objeto. |
| Vistas auxiliares | Caso asiático, controversia denisovana, paleogenómica de Harbin, itinerario, tabla biogeográfica y resumen de lagunas actualizados para reflejar la identificación biomolecular de Harbin y Bianfu. | Deben contrastarse las demás afirmaciones heredadas de estas vistas. |
| Mapa | Se aclara que el marcador de la ficha denisovana señala la cueva de Denisova y se indica Bianfu como localidad confirmada en Yunnan. Los rótulos dejan de llamar exactas y verificadas a las coordenadas de los marcadores. | No se coloca un marcador preciso de Bianfu porque no se ha verificado su coordenada puntual. |
| Paquete | Los expedientes de operador R92 se conservaron dentro de `operator/historical_r92/`. Nuevo estado `NO_GO` y hashes de los archivos de ejecución del derivado. | Los controles de validación heredados de R92 no prueban este derivado. |

## Fuentes primarias empleadas

1. Rao, H. et al. (2026). [Ancient proteins identify various Denisovan remains from Southwest China](https://www.nature.com/articles/s41586-026-10976-9). *Nature*. DOI: `10.1038/s41586-026-10976-9`. Identificación biomolecular de los cinco fósiles especificados, cronología de sus niveles y distinción entre edades mínimas por series de uranio y modelo estratigráfico.
2. Ruan, Q. et al. (2026). [Denisovans from southwestern China and their subsistence strategies](https://www.nature.com/articles/s41586-026-10997-4). *Nature*. DOI: `10.1038/s41586-026-10997-4`. Interpretación arqueológica de la secuencia cultural y métodos de subsistencia. La atribución es «más parsimoniosa», no una identificación proteómica de cada nivel de la secuencia.
3. [ICZN, artículo 73](https://code.iczn.org/types-in-the-species-group/article-73-name-bearing-types-fixed-in-the-original-publication-holotypes-and-syntypes/). Condiciones para fijar un holotipo; la evidencia molecular y la disponibilidad nomenclatural requieren un tratamiento distinto de la definición de un linaje biológico.

## Comprobaciones y pendientes

- `node --check` superado para `002-script.js` y `078-paleobot-a3-catalog.js`.
- `test_fase6.cjs`: **PASS** en 50/50 registros, campos científicos, equivalencia del catálogo incrustado, identidad de la cronología y hashes publicados en `operator/CHECKSUMS_SHA256.txt`.
- La cronología revisada permanece idéntica a la de fase 4; no se han convertido fechas de niveles ni duración de secuencias arqueológicas en tiempo de existencia del linaje.
- **Pendientes:** auditar por afirmación la bibliografía de las 50 fichas y referencias adicionales, contrastar imágenes y licencias, revisar coordenadas individuales de los yacimientos, probar en navegador y con tecnologías de asistencia y ejecutar la integración Moodle. La fase no afirma ausencia total de fallos ni aptitud para publicar.

**Paso siguiente:** inventariar y contrastar las referencias de las cinco fichas priorizadas —sobre todo las atribuciones y los identificadores DOI— antes de ampliar la revisión a las otras 45.
