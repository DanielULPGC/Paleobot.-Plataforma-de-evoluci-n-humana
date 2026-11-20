# POLITICA-PRIVACIDAD-DOCENTE

## 1. Finalidad del documento

Este documento informa al profesorado sobre el uso de datos y servicios externos en PaleoBot, Atlas Paleoantropologico Interactivo. Esta pensado para su uso desde servidores web institucionales o en local.

La regla operativa recomendada es: **modo local por defecto e informacion previa al alumnado**.

## 2. Modo local por defecto

El aplicativo funciona como recurso web estatico. En modo local:

- no requiere cuenta de usuario propia;
- no envia respuestas del alumnado a un servidor del aplicativo;
- no necesita claves de API en el navegador;
- genera actividades, busquedas, comparaciones y exportaciones en el propio navegador.

## 3. Datos que pueden quedar en el navegador

El aplicativo puede usar `localStorage` y `sessionStorage` para mejorar la experiencia:

| Tipo de dato local | Finalidad | Alcance |
|---|---|---|
| ultima vista visitada | Restaurar navegacion o orientar la sesion | Navegador del usuario |
| vistas visitadas en la sesion | Sintesis didactica y recomendaciones locales | Sesion del navegador |
| preferencias visuales | Tamano de fuente, contraste o modo de color | Navegador del usuario |
| resultados o historial de actividades | Autoevaluacion o seguimiento local | Navegador del usuario |
| progreso de PaleoLab, taxones vistos y comparacion activa | Recuperar la exploracion del laboratorio | Navegador del usuario |
| notas introducidas por el usuario, si se usan | Exportacion o reflexion local | Navegador del usuario |

Estos datos no se envian automaticamente a terceros por el aplicativo. El usuario puede borrarlos desde las herramientas del navegador.

El servidor donde se aloje el recurso puede registrar accesos, IP, fecha, hora y actividad general conforme a su propia politica institucional. Eso queda fuera del control del paquete estatico.

## 4. Servicios externos identificados

El recurso contiene enlaces o referencias a servicios externos. Segun el uso y la politica CSP, pueden producirse solicitudes de red a:

| Servicio o dominio | Uso principal | Datos tecnicos que podrian salir |
|---|---|---|
| `cdnjs.cloudflare.com` | Leaflet CSS/JS | IP, agente de usuario, URL de referencia segun navegador |
| `fonts.googleapis.com` y `fonts.gstatic.com` | Fuentes web | IP, agente de usuario, familia tipografica solicitada |
| `upload.wikimedia.org`, `commons.wikimedia.org`, `maps.wikimedia.org` | Imagenes cientificas, mapas o recursos Wikimedia | IP, agente de usuario, recurso solicitado |
| `*.tile.openstreetmap.org`, `server.arcgisonline.com` | Teselas o mapas | IP, agente de usuario, zona/tesela consultada |
| `3d.si.edu` | Modelos 3D institucionales abiertos desde PaleoLab | Datos de navegacion al hacer clic; los modelos no se incrustan en el paquete |
| `doi.org`, BOE, BOC, Creative Commons y otros enlaces academicos | Enlaces bibliograficos o normativos abiertos por el usuario | Datos de navegacion al hacer clic |

La apertura de enlaces externos depende de la accion del usuario, salvo recursos visuales o tipograficos cargados por la pagina.

## 5. Modo sin envio de datos

Para un uso estrictamente local o en aula sin servicios externos:

1. Servir fuentes, bibliotecas e imagenes desde el propio paquete si se requiere aislamiento completo.
2. Usar las exportaciones locales del navegador para CSV, JSON, TXT, SVG o impresion.
3. Evitar que el alumnado escriba datos personales en notas o campos libres.

## 6. Responsabilidades docentes

Antes de usar el recurso con alumnado, el profesorado debe:

- informar de los servicios externos que se cargan o enlazan;
- decidir si el modo local es suficiente para la actividad;
- revisar la politica de privacidad del servidor donde se aloje el recurso.

## 7. Cambios tecnicos aplicados

Se ha anadido una proteccion especifica:

```text
assets/js/90-guards/079-paleobot-privacy-ai-guard.js
```

Tambien se ha endurecido la politica CSP del `index.html` (`connect-src 'self'`) para bloquear conexiones a servicios externos no previstos.
