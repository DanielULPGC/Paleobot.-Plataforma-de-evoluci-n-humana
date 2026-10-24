# PaleoBot · auditoría de medios y comportamiento de reserva · fase 2

**Fecha:** 22-09-2026. **Base:** derivado de fase 1. **Estado:** `NO_GO`.

Se han cotejado las 50 fichas con las 50 entradas finales del adaptador `MEDIA_OVERRIDES`. Hay 50 direcciones efectivas diferentes, todas externas, pero **34 fichas conservan una URL heredada distinta** en el campo `imagen`. La prioridad de medios funciona en `getSpeciesMedia`; el campo heredado también alimenta `buildVisualEvidenceItems` como imagen secundaria. Por ello cada discrepancia exige comprobación de identidad, no solo carga técnica. Identificadores discrepantes: sahel, orrorin, ramidus, anamensis, afarensis, deyiremeda, bahrelghazali, kenyanthropus, africanus, prometheus, garhi, sediba, aethiopicus, boisei, robustus, habilis, rudolfensis, ergaster, georgicus, erectus, antecessor, cepranensis, heidelbergensis, bodoensis, rhodesiensis, helmei, naledi, idaltu, neander, denisova, flores, luzon, longi, sapiens.

Solo se han contrastado manualmente las fichas de Commons de *A. kadabba*, *Proconsul* y Stw 53 (*Homo gautengensis*): ofrecen atribución y licencia declarada. La última imagen tiene solo 240 × 247 píxeles, insuficiente como principal a gran tamaño. Las otras 47 licencias del código permanecen **declaradas, no verificadas individualmente**. La fuente de *Chororapithecus* es institucional y el propio código pide verificar permisos de reutilización. No se han descargado imágenes ni se ha comprobado su carga en Moodle.

## Corrección aplicada

El fallback heredado usaba fotografías de *Proconsul*, *Australopithecus africanus*, *Paranthropus boisei* o *Homo habilis* como sustituto para taxones sin imagen. También construía una silueta diferente por hash del nombre, sin base anatómica. En el derivado de fase 2 ambos recorridos generan una tarjeta tipográfica que indica **«Sin imagen verificada»**; no representan un fósil ni una anatomía inventada. El texto alternativo del recurso reemplazado declara la ausencia de imagen. Los 50 registros científicos y sus cronologías permanecen byte a byte iguales respecto de la fase 1.

## Pendiente para convertir imágenes en material docente

Verificar por ficha archivo, identidad de espécimen, autoría, licencia y condiciones de redistribución; resolver las divergencias entre imagen heredada y preferente, incorporar únicamente las imágenes autorizadas al paquete y comprobar visualmente cada una a tamaño de ficha. Una tarjeta de reserva evita la atribución falsa, pero no satisface la exigencia de una imagen diferenciada para cada registro.

**Dictamen:** `REQUEST_CHANGES / NO_GO`. La carpeta derivada es un punto de trabajo para comprobaciones, no una versión publicable en Moodle.
