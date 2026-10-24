# PaleoBot · fase 4: características, nomenclatura y referencias

**Fecha:** 22-09-2026. **Base:** derivado de fase 3. **Dictamen:** `REQUEST_CHANGES / NO_GO`.

## Método y cobertura

Se inventariaron los 50 registros de `science/catalog.json` y sus 121 referencias base, y se localizaron las funciones que los convierten en etiquetas, preguntas, escalas de confianza y exportaciones. Este examen **no verifica individualmente las 50 descripciones anatómicas, dietas, asociaciones tecnológicas, capacidades craneales ni los 121 registros bibliográficos**. Los archivos CSV marcan expresamente esas comprobaciones como pendientes. La bibliografía complementaria declarada en `EXTRA_REFS` exige un inventario y contraste aparte.

## Hallazgos comprobados y tratamiento

| Código | Evidencia en el material | Corrección de presentación |
|---|---|---|
| NOM-01 | El campo `holo` se presentaba en fichas, comparadores, pruebas y exportaciones como holotipo de todos los registros. Sus valores incluyen `ADN` (*denisova*), `N/A` (*sapiens*), nombres de localidad y códigos de fósil sin expediente de tipificación enlazado. En nomenclatura zoológica, la condición de holotipo exige un ejemplar tipo fijado en la descripción original; no se deduce del contenido del campo. | Etiqueta «material / localidad» con condición de tipo pendiente de verificar; preguntas adaptadas y entradas `ADN`/`N/A` excluidas de las preguntas factuales. Se conserva el valor heredado para auditoría. |
| BIB-01 | `safeDoi` comprueba solo la expresión regular de un DOI. El código transformaba un DOI con formato válido o `status:'verified'` heredado en «DOI verificado». Entre las 121 referencias base, 110 tienen DOI con formato reconocible y 11 no lo consignan. | La interfaz y las exportaciones dicen «DOI consignado»; advierten que resolución, autoría, título y alcance están por contrastar. No se atribuye verificación externa al contador. |
| TAX-01 | Solo 7 fichas consignan `estado`; las otras 43 aparecían «Aceptada» por valor por defecto. | Cuando falta revisión individual aparece «Sin revisión individual» en el estado de presentación, el resumen didáctico y exportaciones tocadas. No se altera el campo científico. |
| EPI-01 | La «escala de confianza» infería alta confianza de la mera presencia de método, palabras clave, supuestos módulos anatómicos o número de referencias; esos criterios no prueban las afirmaciones. | Se marca «Por verificar» en los seis dominios de la escala hasta que exista vinculación verificable entre afirmación y fuente. |
| DIA-01 | La ficha denominaba «Dieta (Isótopos)» a todos los valores, sin registrar método isotópico por especie; una pregunta afirmaba que toda cifra de capacidad craneal procedía del holotipo. | Se retiran ambas atribuciones automáticas y se exige verificar método y ejemplar. Las cifras heredadas no se modifican. |

El [artículo 73 del Código Internacional de Nomenclatura Zoológica](https://code.iczn.org/types-in-the-species-group/article-73-name-bearing-types-fixed-in-the-original-publication-holotypes-and-syntypes/) establece cómo se fija el holotipo y recomienda no presumirlo en ciertos nombres anteriores a 2000.

## Actualización bibliográfica detectada; pendiente de integración científica

El [estudio primario de septiembre de 2026](https://www.nature.com/articles/s41586-026-10976-9) identifica mediante análisis proteómicos nuevos restos denisovanos en la cueva de Bianfu (Yunnan), incluyendo elementos del esqueleto poscraneal, y sitúa estratos con restos humanos en marcos temporales diferentes. Esto exige revisar la ficha denisovana, el mapa de localidades y la bibliografía **sin convertir automáticamente edades estratigráficas en duración del linaje**. Tampoco resuelve por sí mismo la nomenclatura propuesta para *H. longi* o *H. juluensis*. La fase 4 registra esta actualización y conserva las cronologías revisadas existentes hasta su evaluación formal.

## Verificación y límites

Las pruebas ejercitan la escala de confianza para 50 fichas, los cambios de etiquetas y la invariancia byte a byte del catálogo y su adaptador. La sintaxis JavaScript y la integridad del ZIP se comprueban de forma independiente. Persisten referencias adicionales no inventariadas, datos de comportamiento y morfología sin prueba primaria por afirmación, numerosas vistas heredadas y las puertas externas de navegador, accesibilidad y Moodle. El derivado es **un parche de revisión, no material docente autorizado para su publicación**.

**Siguiente paso:** adjudicar las referencias bibliográficas y las afirmaciones de alta prioridad una a una, empezando por atribuciones de ejemplar tipo, industrias y nuevas localidades denisovanas; después revisar de forma visual las 50 fichas y sus imágenes.
