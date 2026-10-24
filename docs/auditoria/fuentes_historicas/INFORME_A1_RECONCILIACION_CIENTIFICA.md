# PaleoBot–Atlas | Reconciliación A1
## Auditoría científica y taxonómica de datos

**Fecha:** 7 de septiembre de 2026  
**Estado:** `A1_STATIC_RECONCILIATION_PASS__NO_RUNTIME_MERGE`  
**Base protegida:** candidato Moodle R92; puerta de integración R93 sin cambios.

### Alcance y resultado

Se han comparado los dos arrays `DB` de 50 fichas, el JSON externo de 52 registros y los nueve bloques compartidos de datos/orden. La auditoría de contenido se concentra en las cinco fichas que difieren, sus afirmaciones heredadas relacionadas y las equivalencias del JSON piloto. No constituye una revisión científica exhaustiva de las otras 45 fichas.

| Comprobación | Resultado |
|---|---|
| IDs del núcleo Atlas y R92 | 50/50, conjuntos idénticos |
| Fichas literalmente idénticas | 45 |
| Fichas modificadas | 5 |
| Registros del JSON externo | 52 |
| Correspondencias literales | 42 |
| Alias de fichas existentes | 7 |
| Subdivisiones/registros regionales | 3 |
| IDs canónicos nuevos necesarios | 0 |
| Bloques compartidos idénticos | 9/9 |
| Comprobaciones A1 | 20/20 PASS |
| Cambios de runtime | 0 |

**Regla:** una ficha docente no es necesariamente una especie. El núcleo incluye especies, linajes, especímenes y agrupaciones de interés didáctico. El recuento 50 no debe presentarse como 50 especies taxonómicas aceptadas.

### 1. Equivalencias de los diez IDs externos no literales

| ID externo | ID R92 | Resolución |
|---|---|---|
| `sahelanthropus` | `sahel` | Alias de Sahelanthropus tchadensis |
| `ardipithecus` | `ramidus` | Alias de A. ramidus; no representa todo el género |
| `platyops` | `kenyanthropus` | Alias de Kenyanthropus platyops |
| `neanderthalensis` | `neander` | Alias |
| `floresiensis` | `flores` | Alias |
| `luzonensis` | `luzon` | Alias |
| `denisovanos` | `denisova` | Alias de linaje; no binomio formal |
| `erectus_erectus` | `erectus` | Subdivisión nominal de Java |
| `erectus_pekinensis` | `erectus` | Subdivisión histórica de Zhoukoudian |
| `erectus_soloensis` | `soloensis` | Subdivisión de Ngandong; conservar parent=`erectus` |

La matriz completa de 52 filas está en JSON y CSV. Ninguna equivalencia autoriza fusionar taxones controvertidos ni alterar automáticamente el cladograma. El JSON piloto declara expresamente que no lo consume el runtime y que sus indicadores de consenso requieren validación. Se preserva ese estado.

### 2. Kabwe — `rhodesiensis`

**Dictamen: incorporable con corrección.** La datación directa publicada por Grün et al. (2020) ofrece una estimación de **299 ± 25 ka (media ± 2σ)**. Es la edad estimada del cráneo Kabwe 1, no la duración de H. rhodesiensis.

R92 conserva `anos=400 ka`; Atlas propone `~300 ka`. Ambas ramas contienen además una descripción con el intervalo 299–124 ka, que no debe mantenerse como resultado de la datación directa citada.

Se propone actualizar el rótulo a `~299 ± 25 ka (Kabwe 1)`, usar 0.299 Ma únicamente como ancla gráfica del espécimen y corregir las descripciones. La clasificación frente a H. heidelbergensis y H. bodoensis sigue abierta. Las afirmaciones superlativas sobre caries y asociaciones culturales requieren revisión independiente antes de conservarse como hechos.

**Fuente:** Grün et al. (2020). Nature. DOI: 10.1038/s41586-020-2165-4.

### 3. Omo I — `omo_i`

**Dictamen: incorporable con corrección.** Vidal et al. (2022) relacionaron el tefra KHS suprayacente con una erupción de Shala y obtuvieron una edad mínima inferida de **233 ± 22 ka**. No es una datación directa de los huesos ni una fecha exacta del individuo.

Se propone `anos=≥233 ka (edad mínima inferida; ±22 ka)` y 0.233 Ma como referencia gráfica provisional. El modelo temporal deberá representar explícitamente el límite mínimo y la incertidumbre. Omo I continúa siendo un espécimen de H. sapiens, no un taxón adicional.

**Fuente:** Vidal et al. (2022). Nature. DOI: 10.1038/s41586-021-04275-8.

### 4. Penghu 1 — `penghu`

**Dictamen: identificación incorporable; migración temporal bloqueada.** Tsutaya et al. (2025) identificaron la mandíbula como perteneciente a un varón denisovano mediante proteínas antiguas. La publicación recupera 4.241 residuos aminoacídicos y dos variantes específicas denisovanas.

La cronología mantiene dos alternativas: **130–190 ka o 10–70 ka**. No deben unirse en un intervalo continuo de 190–10 ka. Tampoco debe fabricarse una fecha central para sustituir el `val_time` heredado.

La atribución al linaje puede actualizarse. El valor temporal escalar queda en `HOLD_UNTIL_MULTI_INTERVAL_SUPPORT` hasta que filtros, gráficos y comparadores admitan intervalos alternativos.

**Fuente:** Tsutaya et al. (2025). Science. DOI: 10.1126/science.ads3888.

### 5. Denisovanos — `denisova`

**Dictamen: incorporar evidencias y corregir nomenclatura.** Las identificaciones de Penghu y Harbin amplían el registro biomolecular y morfológico del linaje. El nombre docente propuesto es `Linaje denisovano`, conservando el ID histórico.

Debe eliminarse la afirmación heredada según la cual el ICZN prohíbe describir especies a partir de ADN sin holotipo morfológico. El ICZN admite caracteres moleculares para la descripción bajo sus requisitos; la disponibilidad de un nombre, la delimitación de especies y la sinonimia son problemas diferentes.

No corresponde fusionar automáticamente denisova, longi, juluensis o daliensis. Las propuestas filogenéticas y nomenclaturales deben quedar vinculadas a sus autores y fechas.

**Fuentes:** Tsutaya et al. (2025); Fu et al. (2025, Science y Cell); Feng et al. (2025); ICZN, FAQ y Declaración 45.

### 6. Harbin — `longi`

**Dictamen: incorporar identificación, mantener nomenclatura abierta.** La proteómica recuperó 95 proteínas endógenas y tres variantes derivadas denisovanas. El ADN mitocondrial del cálculo dental también se sitúa dentro de la variación denisovana. La edad publicada es de al menos 146 ka.

La expresión Atlas `RESUELTO EN 2025` es demasiado amplia: la atribución del individuo está respaldada, pero la delimitación del clado y la sinonimia de los nombres siguen en discusión. Los análisis de Yunxian publicados en septiembre de 2025 y la revisión de 2026 amplían este debate.

Se propone actualizar el texto de la ficha sin retirar `longi`, sin asignar automáticamente el nombre a todos los denisovanos y sin fusionar los registros de Dali, Xujiayao u otros fósiles.

**Fuentes:** Fu et al. (2025). Science, DOI: 10.1126/science.adu9677; Cell, DOI: 10.1016/j.cell.2025.05.040; Feng et al. (2025), DOI: 10.1126/science.ado9202; Ran et al. (2026), DOI: 10.1016/j.scib.2025.11.059.

### 7. Hallazgos transversales del JSON piloto

El registro `erectus_pekinensis` utiliza una etiqueta regional de Harbin que no es adecuada para la agrupación de Zhoukoudian. Debe corregirse antes de migrar geografía. El registro `erectus_soloensis` presenta un rango piloto 140–100 ka; para el lecho de Ngandong debe conservarse la cronología modelada de 117–108 ka, distinguiéndola de la duración de una subespecie.

Los campos `gradoConsenso` y `nivelEvidencia` no se trasladarán como si fueran resultados de una rúbrica científica validada. La revisión de H. juluensis debe considerar la propuesta de Bae y Wu (2024), su corrección publicada y la evidencia filogenética posterior, sin resolver sinonimias automáticamente.

### 8. Contrato cronológico antes de migrar código

El campo `val_time` es una coordenada escalar. No puede representar por sí solo una edad mínima, una distribución de incertidumbre ni ventanas disjuntas. El próximo nodo debe cualificar una estructura tipada que distinga espécimen/taxón, relación cronológica, incertidumbre, método y alternativas, con consumidores explícitos.

Para Penghu se exige que las dos ventanas permanezcan separadas. Los cambios textuales y bibliográficos pueden prepararse independientemente del cambio de representación temporal, pero no deben generar una aplicación con rótulos y gráficos contradictorios.

### 9. Límites de la auditoría

No se han ejecutado tests de navegador, no se ha modificado el runtime y no se ha efectuado una nueva integración Moodle. Los 20/20 controles son verificaciones de reconciliación, integridad y trazabilidad, no pruebas conductuales. Los nueve bloques compartidos son idénticos a nivel de literal fuente; ello no acredita por sí solo su exactitud científica.

Se conservan íntegramente los ZIP Atlas, R92 y R93. Las propuestas de edición son datos para revisión y no un parche aplicado.

### 10. Siguiente nodo exacto

**A2 — Cualificación del modelo cronológico y parche científico controlado.** Revisar consumidores de `anos`, `val_time` y `rangoMa`, separar el soporte de incertidumbre/alternativas y preparar un parche mínimo de las cinco fichas. No promoverlo a runtime hasta demostrar que no altera los 50 IDs, el orden del cladograma, la navegación canónica, los medios ni las garantías Moodle. R93 continuará pendiente de retorno auténtico.
