# PaleoBot A3 — fase 7b · puerta de navegador

**Decisión de publicación: NO_GO.** La fase 7b entrega un kit autocontenido para ejecutar y adjudicar una prueba local de navegador sobre el derivado exacto de fase 7. No acredita todavía que la interfaz funcione en un navegador real: aquí faltan Playwright y Chromium.

## Identidad del material

- `DUT/` contiene 137 archivos de ejecución copiados del derivado fase 7, después de contrastarlos con su manifiesto SHA-256. El árbol queda fijado por `BASELINE_LOCK.json` con huellas y tamaños de cada archivo.
- SHA-256 canónico del árbol: `4763aa4ad32c9f0aef46988db9a7cadda313eaded9f7491d0214d84b9fc4bec7`.
- `KIT_INTEGRITY.json` comprueba las huellas de los cinco archivos de soporte antes de abrir el navegador y al adjudicar el resultado. Una alteración del recurso produce `INVALID_DUT`; una alteración del kit produce `INVALID_KIT`.

## Verificación realizada aquí

Se aprobaron **11 de 11 comprobaciones** de estructura, sintaxis y comportamiento de las puertas, incluidas: integridad positiva del DUT; rechazo de un `index.html` alterado; rechazo de instrucciones modificadas; rechazo de un retorno que declara éxito sin casos; rechazo de una huella de árbol ajena; y adjudicación de un retorno bloqueado sin promoverlo a publicación. El detalle auditable se conserva en `PaleoBot_Fase7b_verificacion_kit_NO_GO.json`.

El intento real devolvió **`BLOCKED_BY_ENVIRONMENT`** con identidad del DUT correcta y cero casos ejecutados: `playwright` no está instalado y tampoco hay ejecutable Chromium/Chrome en este entorno. El estado y la adjudicación se conservan en `PaleoBot_Fase7b_resultado_entorno_NO_GO.json`. Las 11 comprobaciones aprobadas **no son 11 pruebas visuales**.

## Paso siguiente, en orden

1. Extraer el ZIP en un equipo con Python 3.10 o superior. Desde la carpeta del kit, instalar Playwright y Chromium y ejecutar `RUN_GATE.py` tal como indica `RUNBOOK.md`.
2. Devolver `retorno/browser-result.json`, las seis capturas PNG si se generan, y `retorno/adjudicacion.json` tras ejecutar `VERIFY_RETURN.py`. Un retorno válido debe acreditar tres escenarios: escritorio 1440×900, móvil 390×844 y movimiento reducido 1024×768, con las diez comprobaciones exigidas en cada uno.
3. Inspeccionar visualmente las capturas y corregir cualquier fallo reproducido sobre el recurso fuente; reconstruir y volver a sellar el derivado tras cada corrección. A continuación completar revisión manual de accesibilidad, medios externos y ejecución en Moodle/SCORM según los requisitos del curso.

**Límites de la prueba:** la adjudicación comprueba coherencia del JSON, identidad declarada y capturas, pero no puede autenticar por sí sola que un tercero haya ejecutado realmente el navegador. El runner comprueba los bytes antes de abrirlo. Las capturas exigen inspección humana. Las imágenes remotas se bloquean durante esta prueba y siguen pendientes de licencia, identificación y disponibilidad; Moodle, SCORM y lector de pantalla no se evalúan aquí. Ninguno de estos estados debe presentarse como aptitud para publicar.
