# POLITICA-PRIVACIDAD-DOCENTE

## 1. Finalidad del documento

Este documento informa al profesorado sobre el uso de datos, servicios externos e inteligencia artificial en PaleoBot, Atlas Paleoantropologico Interactivo. Esta pensado para despliegues docentes en Moodle, paquetes IMS, servidores web institucionales o uso local.

La regla operativa recomendada es: **modo local por defecto; IA externa solo mediante proxy institucional y con informacion previa al alumnado**.

## 2. Modo local por defecto

El aplicativo funciona como recurso web estatico. En modo local:

- no requiere cuenta de usuario propia;
- no envia respuestas del alumnado a un servidor del aplicativo;
- no necesita claves de API en el navegador;
- no activa llamadas de IA externa por defecto;
- genera actividades, busquedas, comparaciones y exportaciones en el propio navegador.

Las funciones generativas del aplicativo tienen alternativa local. Si no existe un endpoint institucional configurado, el recurso usa datos internos y plantillas locales.

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

El entorno Moodle o el servidor donde se aloje el IMS puede registrar accesos, IP, fecha, hora y actividad general conforme a su propia politica institucional. Eso queda fuera del control del paquete estatico.

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

## 5. Inteligencia artificial externa

Las funciones de IA no son imprescindibles para usar el atlas. El aplicativo conserva esas funciones, pero quedan desactivadas por defecto:

- la CSP usa `connect-src 'self'`;
- el guard `PaleoBotPrivacy` bloquea por defecto proveedores IA directos como `api.anthropic.com`, `generativelanguage.googleapis.com` y `api.openai.com`;
- si no se configura un endpoint, la aplicacion usa modo local.

Si se activa IA externa, podrian salir del navegador:

- identificador del taxon seleccionado;
- nivel de lectura o dificultad;
- texto de la ficha cientifica usada como contexto;
- lista resumida de taxones visibles para generar preguntas;
- debate cientifico o informacion de la ficha cuando se use como entrada del prompt.

No debe pedirse al alumnado que introduzca datos personales, identificadores, calificaciones, informacion sensible ni datos de salud en campos que puedan enviarse a IA externa.

## 6. Modo institucional con proxy

Si una institucion decide activar IA externa, se recomienda un proxy institucional de mismo origen, por ejemplo:

```js
window.PaleoBotPrivacy.configureInstitutionalProxy('/paleobot-ai-proxy');
```

Requisitos minimos recomendados para ese proxy:

- las claves de proveedor nunca deben estar en el navegador;
- el proxy debe estar bajo dominio institucional o mismo origen del recurso;
- debe minimizar y depurar el contenido enviado;
- no debe enviar nombres, correos, identificadores ni calificaciones del alumnado;
- debe registrar solo lo imprescindible para seguridad y auditoria;
- debe aplicar limites de uso, control de errores y revision docente;
- debe existir informacion previa al alumnado y al profesorado;
- debe existir base juridica y acuerdo institucional adecuado antes de tratar datos personales.

La CSP actual permite ese modelo porque autoriza `connect-src 'self'`. Para proveedores externos directos seria necesario modificar conscientemente CSP y configuracion, lo cual no se recomienda para uso docente ordinario.

## 7. Modo sin envio de datos

Para un uso estrictamente local o en aula sin servicios externos:

1. Mantener sin definir `window.PALEOBOT_CLAUDE_ENDPOINT`.
2. No activar `window.PALEOBOT_EXTERNAL_AI_ENABLED`.
3. Servir fuentes, bibliotecas e imagenes desde el propio paquete si se requiere aislamiento completo.
4. Usar las exportaciones locales del navegador para CSV, JSON, TXT, SVG o impresion.
5. Evitar que el alumnado escriba datos personales en notas o campos libres.

## 8. Responsabilidades docentes

Antes de usar el recurso con alumnado, el profesorado debe:

- informar de los servicios externos que se cargan o enlazan;
- decidir si el modo local es suficiente para la actividad;
- no activar IA externa sin autorizacion institucional;
- revisar manualmente cualquier salida generada por IA;
- recordar que las respuestas generadas son apoyo didactico, no fuente cientifica primaria;
- revisar la politica de privacidad del Moodle o servidor donde se despliegue el paquete.

## 9. Cambios tecnicos aplicados

Se ha anadido una proteccion especifica:

```text
assets/js/90-guards/079-paleobot-privacy-ai-guard.js
```

Tambien se ha endurecido la politica CSP del `index.html` para bloquear conexiones directas a proveedores IA. El modo recomendado para IA externa es proxy institucional de mismo origen.
