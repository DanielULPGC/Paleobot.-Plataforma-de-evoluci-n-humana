# Entrada ligera y Atlas separado

Fecha: 24-10-2026. Estado: aplicada al empaquetado PB-GH-01.

## Decisión

Usar v11 como entrada principal y conservar v9 como referencia; el Atlas R98 permanece en experimental.

## Motivo

La consulta ligera reduce complejidad de instalación; el Atlas conserva funciones avanzadas con pendientes conocidos.

## Alternativas

Alternativas: sustituir todo por R98 o retirar las funciones avanzadas. Se mantienen ramas explícitas para no confundir validación y amplitud.

## Error, detección y retorno

Un error de selección puede presentar como validada una rama distinta. Se detecta por procedencia/hash y se restaura v9 o el candidato previo. Moodle sigue pendiente.
