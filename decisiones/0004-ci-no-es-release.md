# Separar CI y validación docente

Fecha: 24-10-2026. Estado: aplicada al empaquetado PB-GH-01.

## Decisión

El flujo CI verifica estructura/construcción y reproduce PB-01; no despliega ni promueve A3.

## Motivo

La prueba de un defecto conocido puede pasar precisamente porque el defecto sigue presente.

## Alternativas

Alternativas: marcar toda la aplicación como apta o bloquear cualquier preparación. Se mantiene un resultado de alcance explícito.

## Error, detección y retorno

Un PASS mal interpretado puede promover material sin navegador/Moodle. README, estado y resultados mantienen NO_GO y las puertas pendientes.
