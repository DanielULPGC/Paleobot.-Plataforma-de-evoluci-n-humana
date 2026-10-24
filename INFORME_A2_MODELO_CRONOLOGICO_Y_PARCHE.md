# PaleoBot–Atlas · A2 — Modelo cronológico y parche científico controlado

**Fecha:** 7 de septiembre de 2026.  
**Dictamen:** `STATIC_MODEL_AND_NARRATIVE_PATCH_PASS__NO_RUNTIME_MERGE`.  
**Base protegida:** R92, SHA-256 `b5223e16a72ec3135c3770166b6a6717ecd2628f7cf31eca19248f8b579a22c8`. R93 permanece pendiente de ejecución auténtica en Moodle.

## 1. Alcance y resultados

A2 cualifica una representación cronológica separada y prepara modificaciones narrativas reversibles para las cinco fichas estudiadas en A1. No sustituye `anos` ni `val_time`, no instala el módulo, no modifica los 50 IDs ni fusiona Atlas con R92. La comprobación de fuentes y la prueba de funciones existentes se han realizado sobre el código real del candidato, pero no equivalen a pruebas de navegador o Moodle.

| Resultado | Valor |
|---|---:|
| JS de aplicación analizados por AST | 65/65 |
| Lecturas operativas de `anos` | 70 |
| Lecturas operativas de `val_time` | 34 |
| Llamadas a funciones temporales/filtros seleccionados | 39 |
| Usos de `rangoMa`, `rango_ma`, `timeMa`, `time_ma` | 0 |
| Workstreams de impacto identificados | 16 |
| Fichas del parche narrativo | 5 |
| Operaciones propuestas, con precondiciones | 20 |
| Pruebas del prototipo aislado | 26/26 PASS |
| Pruebas de funciones originales R92 | 12/12 PASS |
| Controles de integridad y parche | 39/39 PASS |
| Modificaciones del runtime | 0 |
| Ejecuciones de navegador/Moodle | 0/0 |

El inventario incluye referencias exactas de archivo y línea. Es una auditoría AST de propiedades identificables y de llamadas seleccionadas, no una demostración de que se hayan resuelto todas las propiedades dinámicas o posibles alias en tiempo de ejecución. Las menciones dentro del literal DB se excluyen de las lecturas operativas.

## 2. Fallos confirmados del modelo heredado

La función real `ComputedCache.getTimeRange()` (core 3761–3795) obtiene un único par `start/end` mediante expresiones regulares parciales. `getSpeciesTimeRange()` lo delega (4734–4736), mientras `getDetailTimeRange()` (8410–8431) implementa un segundo parser independiente. La caché del primero usa `tr:<id>` y no incorpora la revisión del registro.

Las pruebas aisladas de las funciones originales, no de una reimplementación, confirman lo siguiente:

- Penghu, con `190-10 ka`, se interpreta como un único intervalo de 190–10 ka. De ese modo supera indebidamente un filtro 120–80 ka y genera una intersección temporal ficticia en el vacío entre las ventanas alternativas publicadas.
- Si se sustituye el rótulo por `130–190 ka o 10–70 ka`, ambos parsers pueden interpretar solo 130–190 ka y devolver `start=0.13`, `end=0.19`, es decir, extremos invertidos respecto a la orientación del programa.
- Después de analizar el registro antiguo, la caché por ID puede devolver el rango anterior aunque se modifique el texto de la ficha.
- `val_time` sigue siendo un escalar para ordenación, gráficos y heurísticas. No representa incertidumbre, alternativas o un límite mínimo.

Estos resultados prueban una incompatibilidad de representación y, en los casos ensayados, errores lógicos concretos. No demuestran la frecuencia de esos errores en sesiones reales de alumnado.

## 3. Modelo cronológico tipado, aislado

Se entrega `patch/chronology-v1.cjs`, su esquema JSON y cinco registros de ejemplo. No están enlazados desde `index.html`.

El contrato diferencia la entidad (`specimen`, `population`, `taxon`, `lineage`, `archaeological_context`) y el tipo (`point_estimate`, `minimum_age`, `maximum_age`, `closed_interval`, `alternative_intervals`, `unknown`). Las unidades son ka BP, con incertidumbre y definición explícitas cuando se conocen. `legacy_visual_anchor_Ma` conserva el escalar previo únicamente como dato de compatibilidad; `legacy_projectable=false` bloquea su uso como rango científico.

El prototipo permite intersecciones de ventanas declaradas, pero devuelve una interpretación limitada: `POSSIBLE_REPORTED_SUPPORT_OVERLAP`, `NO_REPORTED_SUPPORT_OVERLAP` o `INDETERMINATE`. Su campo `biological_coexistence` permanece `NOT_ASSESSED`. Una edad mínima o puntual no se convierte en duración de taxón ni en un intervalo cerrado. La ausencia de soporte publicado en una ventana tampoco constituye ausencia histórica demostrada.

### Cinco registros cronológicos

| ID | Tipo | Evidencia conservada | Proyección heredada |
|---|---|---|---|
| `rhodesiensis` | Estimación de espécimen | Kabwe 1, 299 ± 25 ka (media ± 2σ) | Bloqueada |
| `omo_i` | Edad mínima inferida | 233 ± 22 ka; tefra suprayacente | Bloqueada |
| `penghu` | Ventanas alternativas | 10–70 ka; 130–190 ka | Bloqueada |
| `denisova` | Cronología de linaje no resuelta | Evidencias heterogéneas, sin rango inferido | Bloqueada |
| `longi` | Edad mínima de espécimen | Harbin, al menos 146 ka | Bloqueada |

Los valores 274–324 ka de Kabwe, que se obtendrían aritméticamente de 299 ± 25, no se convierten en una duración del individuo ni en límites absolutos de existencia. Tampoco se transforma la incertidumbre de Omo I en una frontera dura de 211 ka. Para Penghu, el soporte informado sigue siendo disjunto: el modelo no rellena el vacío de 70–130 ka.

## 4. Parche científico no aplicado

`patch/narrative-patch.json` contiene 20 operaciones con valores anteriores y precondiciones de SHA-256 de cada registro. `proposed-five-records.json` incluye las cinco fichas completas propuestas; `evidence/original-five-records.json` conserva los originales. El replay se ha probado contra los 50 registros extraídos del literal DB, con rechazo de bases o precondiciones alteradas.

El parche preserva `id`, `nombre`, `anos`, `val_time`, `ubicacion`, `holo`, `clado`, `estado` y `cc`, además de todos los demás campos no intervenidos. No elimina referencias bibliográficas originales y deduplica las nuevas por DOI. Los cambios se limitan a descripciones, apartados expertos y bibliografía.

- **Kabwe:** corrige la datación 299–124 ka, conserva los rasgos morfológicos relevantes y elimina afirmaciones superlativas no contrastadas sobre caries. Mantiene como cuestión abierta las atribuciones culturales directas.
- **Omo I:** incorpora la edad mínima inferida y preserva el detalle anatómico, el contexto y la bibliografía previa.
- **Penghu:** incorpora la identificación paleoproteómica y las ventanas alternativas en el texto, sin cambiar el campo temporal heredado.
- **Denisovanos:** actualiza Harbin/Penghu, corrige la regla nomenclatural del ICZN y las afirmaciones de ausencia de cráneo, conserva la evidencia genética y distingue atribuciones arqueológicas de asociaciones demostradas.
- **Harbin:** incorpora las evidencias de 2025, preserva la historia del hallazgo y la morfología, y deja explícitamente abierta la cuestión de nombres y sinonimias.

**Advertencia de integración:** incluso un parche narrativo correcto puede dejar incoherentes el texto actualizado y los rótulos/gráficos antiguos. Por ello se entrega como propuesta revisable, no como sustitución inmediata de DB. Los cambios de `nombre`, `holo`, `ubicacion`, `anos` y `val_time` deberán coordinarse con la capa de presentación y los consumidores en A3.

## 5. Matriz de impacto

La matriz completa tiene 16 workstreams y está disponible en JSON y CSV. Los principales bloqueantes son:

| Workstream | Problema | Puerta A3 |
|---|---|---|
| Parser/caché | Regex parciales y caché por ID | Fuente tipada única e invalidación por revisión |
| Filtros | Casco continuo y fallback escalar | Intersección de ventanas, semántica triestado |
| Coexistencias | Falsos positivos en huecos | No inferir coexistencia biológica de simple compatibilidad |
| Cladograma | Barras y anclas únicas | Mantener topología; separar layout de evidencia |
| Gráficos CC | Puntos sin incertidumbre | Errorbars/ventanas o exclusión justificada |
| Dispersión | `speciesAliveAt` infiere presencia | Evidencia de presencia posible, no ocupación demostrada |
| Mapas/sitios | Min/max de agregados | No fabricar duración de sitio o taxón |
| Pedagogía molecular | Umbrales por `val_time` | Contexto y tipo de evidencia, sin determinismo |
| Exportaciones | Rótulos y fechas duplicados | Formateador único, bibliografía íntegra |
| Moodle | Nueva capa puede reintroducir regresiones | CSP R89, storage R64, API, Leaflet y assets intactos |

## 6. Puertas y continuidad

A2 cierra la cualificación documental del problema y el prototipo aislado. No cierra la migración de consumidores ni autoriza el parche en producción.

**A3 — Integración científica en rama de ensayo y regresión de consumidores.** Crear una copia derivada de R92, introducir la fuente tipada y un adaptador de compatibilidad explícito, resolver los 16 workstreams y probar las cinco fichas y los 50 IDs. Los cambios narrativos se aplicarán solo después de verificar que ningún campo de fecha obsoleto puede contradecirlos. Mantener cladograma 46/50 y su cobertura pendiente, API canónica, medios, estado modal y seguridad Moodle. No fusionar las funcionalidades del Atlas ni declarar integración Moodle hasta superar sus puertas específicas.

R92 y R93 permanecen intactos. R93 continúa `AWAITING_TARGET_EXECUTION`; la ejecución real del Moodle objetivo sigue siendo una condición separada para el release.
