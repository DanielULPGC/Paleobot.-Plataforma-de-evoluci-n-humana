# PaleoBot A3-C6.4.2 — recepción y adjudicación del retorno de navegador real

Esta unidad **no ejecuta el navegador** y **no fabrica un PASS**. Recibe el retorno producido por la ceremonia A3-C6.4.1 en un host autorizado, verifica su identidad, consistencia y cadena de custodia, reejecuta el adjudicador sellado de C6.4.1 y clasifica el retorno de forma fail-closed.

## Estados posibles

- `AWAITING_AUTHENTIC_BROWSER_RETURN__SCREEN_READER_NOT_AUTHORIZED__A3_NO_GO`: no se recibió retorno.
- `QUARANTINED_BROWSER_RETURN__SCREEN_READER_NOT_AUTHORIZED__A3_NO_GO`: retorno incompleto, inconsistente, diagnóstico, alterado o no admisible.
- `ADMITTED_BROWSER_PASS__SCREEN_READER_GATE_AUTHORIZED__MOODLE_PENDING__A3_NO_GO`: retorno auténtico y coherente con `BROWSER_BASELINE_PASS`; **solo entonces** puede abrirse la puerta de lector de pantalla/accesibilidad manual.

## Retorno esperado

Un directorio con:

- `preflight-browser.json`
- `environment.browser-only.json`
- `browser-result.json`
- `browser-adjudication.json`
- una cadena de custodia completada: `CHAIN_OF_CUSTODY.json` o `CHAIN_OF_CUSTODY.completed.json`

El intake exige HTTPS no reservado, sandbox real (`no_sandbox=false`), los 22 checks sellados del browser gate en PASS, identidad del runtime de 160 archivos, payload exacto C6.3.5, coincidencia URL entorno↔resultado y SHA del browser-result enlazado desde la cadena de custodia.

## Uso

```bash
python verify_intake_package.py .
python intake_browser_return.py --return-dir /ruta/al/retorno --report evidence/intake-report.json
```

Si todavía no existe retorno, puede ejecutarse con un directorio vacío y devolverá `AWAITING_AUTHENTIC_BROWSER_RETURN...` sin inventar resultados.

## Identidades congeladas

- Transferencia C6.4.1: `2f7c4f6a5afa9d0b02199679c27567bdd91bff386581d67fce8124030c7f4e01`
- Payload C6.3.5: `7e0190d008012203a2af116a6fe58433f761ec829e4ae2a4e69af2d68ec76d05`
- Browser-runtime tree: `416912cbd047de711fa8519429784c9f9880fdd702004042efe85bb248b4db02`

El lector de pantalla y Moodle siguen fuera de esta unidad hasta que se admita un retorno real de navegador.
