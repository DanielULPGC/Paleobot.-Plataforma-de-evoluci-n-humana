# Comparativa técnica: Atlas-PaleoBot v1.0 IMS frente a PaleoBot R92/R93

**Fecha:** 7 de septiembre de 2026. **Alcance:** análisis de los dos paquetes recibidos, sin modificarlos ni fusionarlos. **Dictamen:** conservar R92 como base técnica y R93 como puerta de integración; tratar el Atlas como una rama funcional y científica con mejoras seleccionables, no como reemplazo directo.

## Identidad y límites

- Atlas: `Atlas-PaleoBot-v1.0-Moodle-IMS.zip`, SHA-256 `776ebfbfbbe86993c2853f75ec5af54f2e38d9fb84cff0a9f5c4e99a4ba25165`.
- R92: `PaleoBot_MOODLE_DEPLOYMENT_CANDIDATE_R92_READY_FOR_TARGET_VALIDATION.zip`, SHA-256 `b5223e16a72ec3135c3770166b6a6717ecd2628f7cf31eca19248f8b579a22c8`.
- R93 no es otro runtime: mantiene R92 y añade recepción/adjudicación del retorno Moodle. El proyecto sigue en `AWAITING_TARGET_EXECUTION`.
- Se validaron rutas, XML y sintaxis; no se ejecutó una importación en el Moodle institucional, ni una regresión visual/lector de pantalla. Las pruebas de navegador y estabilidad descritas en el changelog del Atlas son declaraciones del paquete, no pruebas reproducidas en esta auditoría.

## 1. Estructura y procedencia

| Indicador | Atlas | R92 |
|---|---:|---:|
| Archivos del ZIP | 169 | 149 |
| Tamaño ZIP aproximado | 5,1 MB | 844 KB |
| JavaScript de aplicación | 83 | 65 |
| CSS propio | 53 | 52 |
| Manifiesto IMS | Sí | No |
| Bundle de operación/validación | Documentación docente y recorrido | 17 archivos R91 + 6 operator |
| Leaflet | CDN | Local 1.9.4 + licencia |
| Archivos `RECOVERY_*` en candidato | 0 | 0 |

El diff por rutas identifica **48 archivos idénticos, 56 compartidos modificados, 65 exclusivos del Atlas y 45 exclusivos de R92**. Los CSS 043–052 contienen funciones diferentes en cada rama; no deben mezclarse por nombre o numeración.

## 2. IMS/Moodle

El manifiesto XML del Atlas se parsea correctamente, contiene una organización, un recurso `webcontent` y declara `index.html` como entrada. Sus 168 referencias de archivo son únicas, existen y cubren todos los archivos salvo el propio manifiesto. Es una mejora material frente al ZIP R92, que no es todavía un IMS nativo. No se ha validado contra un XSD oficial ni se ha importado en Moodle.

Un IMS Content Package sirve contenido en Moodle; no equivale automáticamente a SCORM ni acredita integración con calificaciones, progreso institucional o finalización. Si se requiere esa funcionalidad, debe diseñarse y probarse expresamente. Véase MoodleDocs: https://docs.moodle.org/405/en/IMS_package

## 3. Arquitectura, CSP y portabilidad

| Aspecto | Atlas | R92 | Juicio |
|---|---|---|---|
| `script-src` | `unsafe-inline` + CDN | `self` | Conservar R92 |
| `style-src-attr` | Fallback a `style-src` con `unsafe-inline` | `none` | Conservar R92 |
| Inline HTML | 3 scripts, 1 style, 166 style attrs, 2 handlers | 0 en estas categorías | Migración necesaria |
| Eventos | 150 llamadas AST a `stopImmediatePropagation` | 0 | No reintroducir |
| Escrituras directas de estilo JS | 163 asignaciones AST | 0 | Migrar a owners R92 |
| API canónica | Sin fachada R92 | `PaleoBot.openSpecies`, etc. | Conservar R92 |
| Almacenamiento | Claves directas globales | `PaleoBotStorage` con scope | Adaptar Atlas |
| CSSOM | Sin owners R71/R81 | Registros externos acotados | Conservar R92 |
| Leaflet | Dependencia CDN | Vendorizado | Conservar R92 |
| Navegación a `window.top` | Un script inline intenta modificarla | No existe | Reconciliar |

Los recuentos AST corresponden al JS propio de `assets/js`, sin contar los scripts inline del HTML. En R92 hay exactamente cinco llamadas AST a `showDetail` y 0 asignaciones directas de estilo. En Atlas hay 26 llamadas AST a `showDetail`; no son automáticamente 26 regresiones funcionales, pero evidencian que no se ha incorporado la convergencia R50–R55.

El Atlas incluye una capa de navegación que ejecuta `window.top.location.assign(target)` y `stopImmediatePropagation()` desde `pointerdown`, además de otra captura de clic para rutas. Esto puede desplazar al usuario fuera del iframe Moodle, perder contexto o entrar en conflicto con los buses canónicos. Su comportamiento debe rediseñarse y probarse, no trasladarse sin cambios.

### Red y privacidad

El Atlas mantiene `connect-src 'self'` y añade `PaleoBotPrivacy`, que representa una mejora de intención y protección de IA. Sin embargo, su documentación reconoce cargas automáticas de CDN, fuentes, teselas e imágenes externas. **Modo local de IA no significa modo sin red**. R92 tampoco es totalmente offline: conserva imágenes, fuentes y mapas externos autorizados. La diferencia es que R92 ya no depende de CDN para el motor Leaflet.

La política de privacidad del Atlas sirve como borrador docente, pero no constituye una evaluación jurídica, un acuerdo de tratamiento ni una validación institucional. Las licencias de los medios locales y de los cinco enlaces 3D deben verificarse individualmente.

## 4. Mejoras del Atlas que conviene integrar

**Prioridad alta: IMS nativo y capa didáctica.** Adaptar el `imsmanifest.xml` al runtime R92 y conservar rutas, propuestas para Primaria, futuros docentes, universidad y público general. Añadir evidencias y criterios de evaluación sin asumir seguimiento LMS.

**Prioridad alta: actualizaciones científicas.** Integrar por campos las cinco fichas modificadas después de verificar fuentes. No reemplazar la base completa.

**Prioridad media-alta: PaleoLab 50.** Su secuenciador, comparación de hasta tres taxones, inspector, progreso, vistas de evidencia y cinco enlaces institucionales a modelos 3D son una ampliación relevante. Los modelos se abren en origen; no hay geometrías 3D descargadas dentro del ZIP. Su progreso usa `localStorage` con la clave global `paleobot_species_lab_v1`: debe migrarse al scope R92.

**Prioridad media-alta: recorrido y accesibilidad.** El recorrido didáctico, orientación contextual, cajón flotante, glosario progresivo y mejoras de foco son candidatos valiosos. Deben reconciliarse con el router, el estado modal y los owners CSS de R92; las etiquetas WCAG no prueban por sí mismas conformidad WCAG 2.2.

**Prioridad media: archivo Nutcracker y medios.** El corpus aporta una vía de divulgación, pero sus estadísticas y referencias requieren revisión de procedencia. Las imágenes locales son útiles, siempre que se preserven licencia, atribución, identidad de espécimen y prioridad del contrato canónico `getSpeciesMedia`.

## 5. Riesgos concretos de integración

1. **Colisión CSS:** los ficheros R92 043–052 no equivalen a los CSS con esos números del Atlas. Copiarlos encima destruiría contratos de estilos y registros CSSOM.
2. **Regresión de eventos:** 150 llamadas AST ejecutables a `stopImmediatePropagation` en Atlas frente a 0 en R92. La navegación/cierre debe migrarse a las API canónicas.
3. **CSP:** no trasladar `unsafe-inline`, Leaflet CDN, generación de `<style>` ni atributos de estilo. El Atlas conserva también formas de escritura `cssText` y `Object.assign(...style...)` que R92 había retirado.
4. **Storage:** migrar PaleoLab y demás claves nuevas al namespace `paleobot:<scope>:<logical-key>`. Validar recursos/cursos distintos y persistencia real en iframe.
5. **Media:** `075-paleobot-v92-scientific-images.js` consulta `sp.imagen`, `getSpeciesThumb` y `getSpeciesImage`; debe adaptarse a `getSpeciesMedia` y preservar overrides y medios exactos.
6. **Navegación:** eliminar la dependencia de `window.top.location.assign`; distinguir enlaces externos voluntarios, rutas internas y apertura de fichas.
7. **Taxonomía:** no sumar 52 registros externos a los 50 del núcleo. El JSON externo comparte 42 identificadores con la DB y contiene alias/subdivisiones. Requiere tabla de equivalencia y gobierno de datos.
8. **Privacidad/licencias:** comprobar imágenes institucionales, condiciones de medios 3D, servicios externos, política real de Moodle y cualquier activación de IA.
9. **Validación:** los 13 tests y 31 vistas que declara el changelog no sustituyen los contratos R92/R93 ni el ensayo real en Moodle.

## 6. Reconciliación científica exacta

Las dos DB del núcleo tienen 50 registros y los mismos IDs. **45 objetos son idénticos y 5 difieren**; hay 13 diferencias de campo/elemento. Los otros nueve bloques examinados (SITES, itinerarios, dispersión, rúbrica, cuatro conjuntos África y orden del cladograma) son byte a byte idénticos. No puede afirmarse que toda la base científica sea idéntica.

| Taxón | Cambio del Atlas | Dictamen |
|---|---|---|
| Kabwe / rhodesiensis | 400 ka → ~300 ka; val_time 0,4→0,3 | Revisión de datación y representación, sin convertir un rango en fecha puntual segura. |
| Omo I | 195 ka → ≥233 ka; val_time 0,195→0,233 | Actualización respaldada por Vidal et al. (2022). |
| Penghu 1 | Identificación biomolecular masculina denisovana y referencia Tsutaya et al. (2025) | Actualización respaldada; preservar intervalo cronológico y cautela nomenclatural. |
| Denisovanos | Nombre y ámbito ampliados; Harbin 2025 | Incorporar evidencia biomolecular, no inferir una nueva especie nominal automáticamente. |
| Harbin / longi | Proteómica y ADN mitocondrial 2025 | Sustituir “resuelto” por una formulación que distinga identificación poblacional y debate nomenclatural. |

Fuentes primarias contrastadas:
- Vidal et al. (2022): https://doi.org/10.1038/s41586-021-04275-8
- Tsutaya et al. (2025): https://doi.org/10.1126/science.ads3888
- Fu et al. (2025), proteómica de Harbin: https://doi.org/10.1126/science.adu9677
- Fu et al. (2025), ADN mitocondrial de Harbin: https://doi.org/10.1016/j.cell.2025.05.040

El JSON externo `data/taxones.json` contiene 52 registros; 42 IDs coinciden con el núcleo y diez no coinciden literalmente, mientras ocho IDs del núcleo no aparecen literalmente en el externo. Incluye alias como `sahelanthropus`/`sahel`, `neanderthalensis`/`neander` y subdivisiones de H. erectus. Su metadato `estadoMigracion: piloto_compatible_no_runtime` en las fichas inspeccionadas es coherente con tratarlo como dataset de migración, no como autoridad que sustituya a la DB.

## 7. Propuesta de conciliación secuencial

**C0 — Congelar ambas procedencias.** Conservar ZIP y SHA-256 originales. No mezclar archivos por nombres numéricos.

**C1 — Reconciliar datos.** Crear tabla de equivalencia 52→50, identificar alias/subtaxones, decidir representación canónica y validar los cinco cambios científicos. No añadir automáticamente taxones al cladograma ni modificar rutas científicas sin evidencia.

**C2 — Portar el recorrido y la documentación.** Añadir IMS, itinerarios y guías a R92, manteniendo rutas relativas y permisos CSP. No importar el runtime antiguo.

**C3 — Portar PaleoLab y Nutcracker.** Adaptar estado, almacenamiento, apertura de fichas, medios, exportación y accesibilidad a las API R92. Conservar licencia/atribución y registrar pruebas de cada capacidad.

**C4 — Reconciliar visual y navegación.** Migrar reglas CSS con nuevos nombres/owners, sin sobrescribir 042–052 de R92; retirar guards redundantes y navegación `window.top`.

**C5 — Validar.** Ejecutar contratos actuales R92, regresiones funcionales nuevas, pruebas accesibles y en navegador, generar IMS limpio y completar la puerta R93 con el Moodle real.

**Estado recomendado:** `ATLAS_BRANCH_REVIEWED__SELECTIVE_INTEGRATION_REQUIRED__R92_RUNTIME_RETAINED__R93_TARGET_VALIDATION_PENDING`.

## 8. Qué se ha comprobado y qué no

Comprobado: integridad ZIP y hashes; inventario de rutas; XML del manifiesto y cobertura de archivos; sintaxis JS 85/85 Atlas y 65/65 R92; AST de eventos/estilos; presencia de APIs; nueve bloques científicos y diferencias de DB; estructura de datasets y documentación. No comprobado: importación Moodle, ejecución visual de las 31 vistas declaradas, cumplimiento WCAG 2.2, disponibilidad remota de todos los medios/DOI, licencia individual de todos los archivos, equivalencia conductual completa, ni funcionamiento de IA/proxy en el entorno real. El nombre “v1.0 estable” se considera una declaración del paquete, no una certificación de esta revisión.
