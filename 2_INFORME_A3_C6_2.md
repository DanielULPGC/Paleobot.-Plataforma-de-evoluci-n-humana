# A3-C6.2 — Revisión científica de M16 y cierre de preparación externa

Fecha: 10 de septiembre de 2026.

## Dictamen

**R04/M16: CLOSED_SCIENTIFIC_REVIEW. A3: NO-GO.** No se ha recibido un retorno externo auténtico de navegador/accesibilidad/Moodle, por lo que C6.2 no adjudica esas puertas. La puerta A3 creada en C6.1 se conserva intacta. El trabajo sustantivo de este nodo es la revisión científica del indicador M16.

## Problema corregido

M16 heredaba un conjunto booleano de ocho taxones `M16_DEBATED`. Ese booleano mezclaba controversias distintas y podía interpretarse erróneamente como incertidumbre cronológica. C6.2 retira el booleano y lo sustituye por una revisión tipada, explícitamente separada de la cronología.

## Adjudicación de los ocho casos

- `naledi` — `PHYLOGENETIC_POSITION_UNRESOLVED`: diagnosis específica mantenida; posición filogenética no resuelta.
- `longi` — `MOLECULAR_DENISOVAN_AFFINITY__NOMENCLATURE_OPEN`: Harbin presenta afinidad molecular denisovana; la relación con el nombre específico permanece abierta.
- `luzon` — `SPECIES_DIAGNOSED__PHYLOGENETIC_POSITION_UNRESOLVED`: especie formalmente diagnosticada; relaciones filogenéticas abiertas.
- `flores` — `SPECIES_STATUS_SUPPORTED__PHYLOGENETIC_ORIGIN_UNRESOLVED`: estatus específico respaldado; origen/posición filogenética no cerrados.
- `habilis` — `EARLY_HOMO_DELIMITATION_DEBATED`: delimitación de Homo temprano debatida.
- `rudolfensis` — `EARLY_HOMO_DELIMITATION_DEBATED`: delimitación frente a H. habilis y definición de Homo temprano debatidas.
- `bodoensis` — `PROPOSED_TAXON__VALIDITY_CONTESTED`: propuesta taxonómica controvertida, sin tratarla como consenso.
- `heidelbergensis` — `TAXON_CONCEPT_HYPODIGM_UNSTABLE`: concepto e hipodigma usados de forma variable.

La evidencia estructurada completa está en `evidence/M16_SCIENTIFIC_REVIEW.json`.

## Fuentes académicas principales

- Berger et al., *eLife* (2015), DOI 10.7554/eLife.09560.
- Hawks et al., *eLife* (2017), DOI 10.7554/eLife.24234.
- Détroit et al., *Nature* (2019), DOI 10.1038/s41586-019-1067-9.
- Zanolli et al., *Journal of Human Evolution* (2022), DOI 10.1016/j.jhevol.2021.103124.
- Argue et al., *Journal of Human Evolution* (2017), DOI 10.1016/j.jhevol.2017.02.006.
- Emergence of the genus Homo: From concept to taxonomy (2022), DOI 10.1016/j.anthro.2022.103068.
- Roksandic et al., *Evolutionary Anthropology* (2022), DOI 10.1002/evan.21929.
- Delson et al., *Evolutionary Anthropology* (2022), DOI 10.1002/evan.21950.
- Harvati & Reyes-Centeno, *Journal of Human Evolution* (2022), DOI 10.1016/j.jhevol.2022.103279.
- Roksandic et al., *Quaternary International* (2018), DOI 10.1016/j.quaint.2017.10.013.
- Harbin mtDNA study, *Cell* (2025), DOI 10.1016/j.cell.2025.05.040.
- Ancient proteins/Denisovan record, *Nature* (2026), DOI 10.1038/s41586-026-10976-9.

## Superficie de cambio

El runtime conserva 160 archivos. Respecto de C6.1 cambia exactamente:

`assets/js/10-legacy-ui/008-paleobot-v34-m11m20-layer.js`

No se añaden ni eliminan archivos del runtime. No se modifica `index.html`, la CSP, almacenamiento, API, Leaflet, datos científicos de las 50 fichas ni topología.

## Regresiones

- 221/225 aserciones heredadas continúan pasando.
- Las 4 restantes son aserciones M16 históricas expresamente supersedidas por esta revisión; se conservan intactas.
- Nueva batería M16: 38/38 PASS + 1.000 sondas.
- Total vigente adjudicado: 259/259 controles activos + 7.000 sondas.
- 76/76 archivos JavaScript: sintaxis válida.
- Preflight estático de accesibilidad: 32/32 PASS.

## Puertas abiertas

1. R05: 45 fichas continúan `LEGACY_UNREVIEWED`; no se promueven mediante esta revisión.
2. Navegador HTTP real, lector de pantalla y Moodle: pendiente de retorno externo auténtico.
3. Suite histórica de 660 casos: continúa sin recuperarse como suite ejecutable.

## Estado

`A3_C6_2_M16_SCIENTIFIC_REVIEW_PASS__EXTERNAL_RETURN_ABSENT__R05_AND_EXTERNAL_GATES_OPEN__NO_GO`
