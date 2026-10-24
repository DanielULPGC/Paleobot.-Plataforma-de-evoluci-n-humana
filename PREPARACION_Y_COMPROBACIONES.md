# Preparación PB-GH-01

## Cambios realizados

- Se organizó el repositorio sin modificar la lógica de v11, v9 o R98.
- Se conservó PB-AUD-01 y se prepararon 36 borradores de incidencias.
- El inventario para GitHub omite dos campos de IDs y enlaces privados de la
  plataforma. Su transformación y los hashes de importación están documentados.
- Se añadieron construcción temporal, verificadores, plantillas y un flujo CI
  de lectura. La construcción normal solo escribe copias en `dist/`.
- Se preservan las licencias de terceros; la licencia global está pendiente.

## Comprobación de construcción

Los dos generadores originales ejecutados en carpetas temporales producen HTML
byte a byte iguales a las entradas preservadas:

- Entrada v11: 217.992 bytes.
- Atlas R98 piloto: 3.395.289 bytes.

Se conservan sus hashes completos en los resultados y la procedencia. El ensayo
no abre un navegador ni cambia la actividad institucional.

## Corrección del propio verificador

La primera comprobación de cuarentena buscaba el texto `_quarantine` en todo el
índice. Rechazó un comentario que decía expresamente que el módulo no estaba
enlazado. Ese resultado era un falso positivo del verificador, no una ejecución
del módulo ni un defecto del programa.

Se cambió la comprobación para examinar los atributos de recursos realmente
referidos por el HTML. La condición de preservación sigue siendo que el módulo
en cuarentena no se cargue. También se cierra cada archivo temporal antes de
entregarlo a Node para permitir su lectura en Windows.

Un segundo falso positivo apareció al incluir bytecode temporal de las propias
pruebas en el barrido de identificadores. Ese archivo contenía el identificador
sintético usado por el control negativo. Se delimitó el barrido al árbol de
entrega, excluyendo `__pycache__`, resultados y metadatos Git. El control que
introduce un identificador en un archivo de entrega sigue exigiendo su rechazo.

## Interpretación de resultados

La reproducción PB-01 ejecuta el módulo importado con 47 URL documentadas y un
mapa de control. Confirma tres sustituciones, preserva 44 URL y respeta el mapa.
Un resultado correcto de esta reproducción significa que el defecto permanece
reproducible. No se ha aplicado la corrección científica o funcional del Atlas.

No se ha ejecutado el flujo en GitHub antes de subir el repositorio. Los
resultados locales no se presentan como ejecución de GitHub Actions, navegador,
lector de pantalla o Moodle.

## Controles negativos

Ocho casos usan copias temporales: rechazo de promoción GO sin prueba, evidencia
alterada, ID científico duplicado, recurso local ausente, identificador privado,
comentario de cuarentena que no debe confundirse con carga, HTML divergente y
construcción normal que preserva las fuentes. Estos casos no repiten las 159
unidades sintácticas sin cambios; la comprobación normal las mantiene activas.
