# A3-C6.3.5 — retorno externo autorizado

Este kit está vinculado al runtime sellado de **A3-C6.3.5/R05-T5**. R05 está completo en 50/50 fichas revisadas; A3 continúa en **NO_GO** hasta cerrar las puertas externas de navegador real, lector de pantalla real y Moodle.

Identidad del runtime para esta ceremonia:

- `source_revision`: `A3-C6.3.5`
- `runtime_tree_sha256`: `416912cbd047de711fa8519429784c9f9880fdd702004042efe85bb248b4db02`
- archivos runtime esperados: 160

## 1. Navegador real

En un host autorizado, desde la raíz del paquete:

```bash
python return-kit/a3-browser-accessibility-gate.py \
  --url https://HOST/RUTA/index.html \
  --verify-all-files \
  --output evidence/browser-result.json
```

Para Moodle, añada `--parent-url` con la página autorizada que contiene el recurso/iframe. No use `--allow-no-sandbox` para evidencia representativa.

## 2. Lector de pantalla y teclado reales

Copie `manual-accessibility.template.json`, complete los ocho casos mediante tecnología de asistencia real y guárdelo como `manual-accessibility.json`. El árbol de accesibilidad del navegador no sustituye esta prueba.

## 3. Entorno y Moodle

Copie `environment.template.json` como `environment.json` y documente navegador, URL, operador y clase de destino. Para Moodle use `target_class = MOODLE_REAL_TARGET` y complete también `moodle-result.json`.

## 4. Preparación y adjudicación

```bash
python return-kit/a3-prepare-return.py evidence_dir A3_C6_3_5_return.zip
python return-kit/a3-intake-adjudicator.py A3_C6_3_5_return.zip --report adjudication.json
```

Un PASS parcial no autoriza el release A3. La promoción permanece bloqueada hasta que todos los gates externos requeridos estén admitidos y adjudicados.
