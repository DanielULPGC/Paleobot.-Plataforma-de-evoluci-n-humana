# PaleoBot. Expediente PB-AUD-01

Fecha de corte: 24 de octubre de 2026.

Abra `PaleoBot_Informe_consolidado.md` para leer el informe sin Word.
`registro_decisiones.csv` y su JSON contienen 36 asuntos con sus motivos, pruebas,
pendientes, consecuencias de error y reversión propuesta. P0/P1/P2 son prioridades
de trabajo, no una declaración de que cada asunto sea un defecto confirmado.

`inventario_artefactos.csv` conserva 272 identidades. Solo 115 tienen bytes
recuperados y hash. Los restantes 157 son metadatos, no contenido revisado.
Los informes históricos se conservan como evidencia de lo registrado entonces;
sus resultados no se presentan como ejecutados de nuevo en esta sesión.

## Reproducir el conflicto de imágenes

Con Node instalado, desde esta carpeta:

```bash
node reproducir_colision_medios.cjs
```

El ensayo lee el módulo original 066 y 47 URL documentadas. Usa un DOM simulado,
sin red, sin navegador y sin Moodle. Debe reproducir tres sustituciones a SVG
(proconsul, boisei, soloensis), preservar las otras 44 URL y respetar un mapa de
control. Escribe `resultado_reproduccion_actual.json` sin alterar el programa.
La comprobación del hash impide confundir el módulo con otro no revisado.
`reproduccion_colision_medios.json` conserva el resultado original de esta revisión.
Una ejecución correcta de este ensayo demuestra el defecto aislado, no que se
haya corregido ni que el efecto final de todos los observadores esté validado.

## Resultados actuales

Los JSON de cotejo, integridad, estructura, sintaxis, genealogía y verificación
contienen las observaciones nuevas. Las fuentes del programa completo se
localizan desde el inventario; no se incluye aquí otro paquete de ejecución.
El manifiesto SHA-256 fija el contenido de esta entrega. Se excluye a sí mismo
para evitar autorreferencia.

## Fuentes primarias focales

- Rao et al. (2026): https://www.nature.com/articles/s41586-026-10976-9
- Ruan et al. (2026): https://www.nature.com/articles/s41586-026-10997-4
- ICZN, artículo 73: https://code.iczn.org/types-in-the-species-group/article-73-name-bearing-types-fixed-in-the-original-publication-holotypes-and-syntypes/

## Antecedentes de conversación

Se recuperaron resúmenes temáticos de los antecedentes de Paleobot, incluidos
los fallos comunicados el 20-23 de septiembre, la confirmación de la entrada
ligera hasta v9 y la propuesta de conexión con Habla con Lucy del 28 de
septiembre. No se dispone de una transcripción íntegra ni de los enlaces de
todos los chats; por ello no se declara cobertura conversacional exhaustiva.

No se modificó ni publicó Paleobot en esta revisión. Las retiradas, ampliaciones
y correcciones del registro son propuestas salvo donde se identifica un cambio
histórico ya documentado.
