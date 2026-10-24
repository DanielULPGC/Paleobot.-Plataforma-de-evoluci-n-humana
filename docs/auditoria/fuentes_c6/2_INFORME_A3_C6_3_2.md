# A3-C6.3.2 — R05-T2: cierre técnico y sellado determinista

Fecha: 10 de septiembre de 2026.

## Dictamen antes del ZIP

**R05-T2: FORMAL_BATTERY_PASS. A3: NO-GO.** El árbol de contenido queda sellado para construcción y verificación independiente del ZIP determinista. No se atribuye validación de navegador real, lector de pantalla ni integración Moodle.

## Linaje

Padre inmediato: `PaleoBot_A3_C6_3_1_R05_T1_checkpoint_NO_GO.zip`, SHA-256 `4c5f75c1572b4eeff5da2ffc82c52b45ef2e3b060257b2c458ef74e86f64b6e2`. Su verificación independiente, SHA-256 `5a27be47f18205f34ee5db4ec9b76614ee936ac3db57ca15446feadf1fd5e45c`, se conserva en `inputs/`.

## Puertas cerradas

1. Contratos cronológicos R05-T2: cobertura total 25 revisados / 25 pendientes; 24/24 controles.
2. No falsas ocupaciones/coexistencias: 36/36, 45 pares y 4.000 sondas; el solapamiento temporal `afarensis–deyiremeda` no se eleva a coexistencia biológica.
3. Integridad científica: 37/37; 50/50 registros canónicos deep-equal y hash-equal contra C6.3.1; 160 archivos runtime, 155 byte-identical y 5 cambios autorizados.
4. Regresiones heredadas: 244/244 invariantes históricos activos + 7.000 sondas; frente a la batería formal del padre, 440 controles sobreviven y 13 expectativas quedan explícitamente supersedidas; 0 fallos inesperados.
5. Batería formal integrada R05-T2: 466/466 controles activos + 11.000 sondas deterministas; 29/29 meta-controles. SHA-256 `dcc405c49e0c83d6427efac378c331101d32814f1c06692c1e901363abe93f1a`.

## Estado de liberación

C6.3.2 solo se considerará cerrado cuando dos construcciones del ZIP sean byte-identical y una verificación independiente confirme manifiesto, hashes, seguridad de rutas, metadatos deterministas, identidad del padre y reejecución de la batería formal sobre el árbol extraído. A3 continúa `NO_GO`; quedan 25 fichas R05 sin revisión y las puertas externas continúan pendientes.
