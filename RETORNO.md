# Retorno ante una regresión

1. Identificar la versión, commit, archivo y condición del fallo.
2. Conservar el resultado antes de cambiar la actividad Moodle.
3. En GitHub, preparar un commit de reversión de la corrección afectada; no usar
   force push para borrar el error del historial.
4. Si afecta a un HTML generado, restaurar el archivo y las fuentes de la misma
   revisión. No mezclar versiones del catálogo, generador y módulos.
5. Si afecta a almacenamiento, preservar las claves y exportaciones necesarias;
   no limpiar datos de otras actividades como parte de la reversión.
6. Repetir el caso del fallo y las funciones dependientes. Reabrir el asunto PB.

La v9 se conserva como referencia recuperada, sin atribuirle una certificación
completa. La reversión de una interfaz no transforma el destino en validado.
