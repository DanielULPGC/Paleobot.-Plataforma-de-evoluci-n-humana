# Contribuir a PaleoBot

1. Abra una rama por corrección. Vincule la incidencia PB correspondiente.
2. Identifique versión, archivo y condición que activa el fallo.
3. Registre el motivo, las alternativas, los archivos cambiados y las dependencias.
4. Añada una prueba que distinga el defecto de la solución y verifique las
   funciones que deban preservarse. Los datos científicos requieren fuente y
   alcance de cada afirmación.
5. Ejecute las verificaciones del README. Si cambia una fuente, reconstruya el
   HTML correspondiente y revise su diferencia. No modifique una evidencia
   histórica para hacer pasar una prueba actual.
6. Registre qué se comprobó, qué se reutilizó y qué sigue pendiente, además del
   efecto de un error y el procedimiento de retorno.
7. Abra una propuesta de cambio revisable. Un resultado CI correcto no equivale
   a aprobación científica o de Moodle.

Conserve los IDs de las 50 fichas, las ventanas cronológicas alternativas y la
distinción entre entidad, evidencia e interpretación. La base v9 y el expediente
PB-AUD-01 son referencias históricas; sus hashes no deben actualizarse para
ocultar modificaciones. El código de trabajo vive en `src` y `experimental`.

La dirección actual conserva HTML/JavaScript y el desarrollo incremental. No se
ha autorizado una reconstrucción en React/Vite ni una fusión automática con Lucy.
