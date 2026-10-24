# Construir fuera de las fuentes

Fecha: 24-10-2026. Estado: aplicada al empaquetado PB-GH-01.

## Decisión

Ejecutar los generadores originales en carpetas temporales y comparar los HTML resultantes.

## Motivo

Evita que una comprobación cambie silenciosamente el material cuya identidad se está verificando.

## Alternativas

Alternativa: ejecutar los generadores sobre las fuentes. Se descarta para el modo --check por sus escrituras laterales.

## Error, detección y retorno

Si el wrapper apunta al archivo equivocado, compara un artefacto ajeno. Sus rutas y hashes se comprueban y el modo normal solo escribe en dist.
