# PaleoBot A3-C6.4.1 — transferencia a host autorizado para navegador real

Este paquete **no contiene un PASS de navegador**. Conserva el checkpoint científico y técnico cerrado A3-C6.3.5/R05-T5 y el expediente que demuestra que el host de origen bloquea Chromium con `ERR_BLOCKED_BY_ADMINISTRATOR` antes de cargar la aplicación.

## Objetivo único

Ejecutar y adjudicar **solo la puerta de navegador real** en un host autorizado donde Chromium/Chrome pueda navegar con sandbox real. El lector de pantalla manual y Moodle permanecen fuera de esta ceremonia y siguen pendientes.

## Identidades congeladas

- Payload: `PaleoBot_A3_C6_3_5_R05_T5_checkpoint_NO_GO.zip`
- SHA-256 payload: `7e0190d008012203a2af116a6fe58433f761ec829e4ae2a4e69af2d68ec76d05`
- Runtime tree del manifiesto de checkpoint: `d6ff84372b10e67aadac7c45882adc41585780dea8febd4c2ea493b4f816231e`
- Runtime tree usado por el browser gate (mapa de 160 archivos): `416912cbd047de711fa8519429784c9f9880fdd702004042efe85bb248b4db02`

Los dos hashes de runtime son deliberadamente distintos porque usan algoritmos de agregación diferentes. El browser gate y el contrato de retorno usan el segundo (`416912...`).

## Ceremonia

1. Verificar este paquete antes de extraer el payload:

```bash
python verify_transfer_package.py .
```

2. Copiar `environment.browser-only.template.json` a `environment.browser-only.json` y completar URL, navegador, versión y operador.

3. Ejecutar el preflight **sin navegar**:

```bash
python preflight_authorized_browser.py \
  --target-url https://HOST/RUTA/index.html \
  --browser /ruta/al/chromium \
  --output preflight-browser.json
```

4. Extraer el payload en un directorio limpio y entrar en su raíz `A3_C6_3_5_R05_T5_checkpoint_NO_GO/`.

5. Ejecutar el gate sellado. Para evidencia representativa **no usar `--allow-no-sandbox`**:

```bash
python return-kit/a3-browser-accessibility-gate.py \
  --url https://HOST/RUTA/index.html \
  --verify-all-files \
  --browser /ruta/al/chromium \
  --output evidence/browser-result.json
```

6. Volver a la raíz de esta transferencia y adjudicar únicamente la puerta de navegador:

```bash
python adjudicate_browser_result.py \
  --browser-result /RUTA/EXTRAIDA/A3_C6_3_5_R05_T5_checkpoint_NO_GO/evidence/browser-result.json \
  --environment environment.browser-only.json \
  --report browser-adjudication.json
```

7. Conservar `preflight-browser.json`, `environment.browser-only.json`, `browser-result.json`, `browser-adjudication.json` y una copia completada de `CHAIN_OF_CUSTODY.template.json` como retorno de esta ceremonia.

## Criterio de cierre

Solo se admite `ADJUDICATED_BROWSER_PASS__SCREEN_READER_AND_MOODLE_PENDING__A3_NO_GO` cuando el resultado procede de un objetivo HTTPS no reservado, Chromium se ejecutó **con sandbox**, los 160 archivos remotos coinciden con el runtime sellado y todos los controles del browser gate están en PASS. Cualquier `BLOCKED`, `FAIL`, ausencia de identidad remota o uso de `--no-sandbox` mantiene la puerta abierta.

A3 no se promociona en esta fase.
