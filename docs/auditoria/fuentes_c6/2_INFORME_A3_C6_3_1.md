# A3-C6.3.1 — R05-T1: cierre técnico y sellado determinista

Fecha: 10 de septiembre de 2026.

## Dictamen antes del ZIP

**R05-T1: FORMAL_BATTERY_PASS. A3: NO-GO.** El árbol de contenido queda sellado para construcción y verificación externa del ZIP determinista. No se atribuye aquí validación de navegador real, lector de pantalla ni integración Moodle.

## Linaje

Padre inmediato: `PaleoBot_A3_C6_2_checkpoint_NO_GO.zip`, SHA-256 `89785b2cd5a2f822303a949c8e25ee5ffad97c313fd395cac7c0da4ee381cd91`. El paquete padre se incorpora en `inputs/` y la prueba de integridad C6.3.1 se ha hecho portable para validar el árbol extraído, no una ruta de trabajo externa.

## Puertas cerradas

1. Contratos cronológicos: 15 contratos revisados; batería formal 21/21.
2. No falsas ocupaciones/coexistencias: 31/31, 45 pares y 3.000 sondas.
3. Integridad científica: 33/33; 50/50 registros canónicos deep-equal y hash-equal contra C6.2.
4. Regresiones heredadas: 245/245 activas + 7.000 sondas; 18 expectativas supersedidas adjudicadas; 0 fallos inesperados.
5. Batería formal integrada: 453/453 controles + 10.000 sondas; 25/25 meta-controles. SHA-256 `0129c13b45cd0d58650c5960ef4811b0a3229112147e4157957edcbb1c87c1b0`.

## Correcciones previas al sellado

Se corrigieron superficies obsoletas de cobertura 5/45 a 15/35, procedencia de los diez registros R05-T1 y la portabilidad de la prueba de integridad. Ninguna de estas correcciones modifica los 50 registros científicos canónicos.

## Estado de liberación

C6.3.1 solo podrá considerarse cerrado cuando el ZIP construido desde este árbol sea reproducible byte a byte y un verificador independiente confirme manifiesto, hashes, rutas, metadatos ZIP, identidad del padre y reejecución de la batería formal sobre el árbol extraído. A3 continúa `NO_GO` por las puertas externas aún pendientes.
