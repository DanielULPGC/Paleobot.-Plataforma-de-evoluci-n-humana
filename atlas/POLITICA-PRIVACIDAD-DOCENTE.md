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

## Actualización (PB-GH-11, noviembre de 2026)

Esta sección se añade al documento recibido sin modificar lo anterior. Describe los contactos de red del atlas tal
como quedan tras la ronda PB-GH-11 y sustituye, en lo que difiera, a la tabla del apartado 4.

Medición (20 de noviembre de 2026, Chromium, rama `feat/pb-gh-11-atlas`): carga de `atlas/index.html`, recorrido de
diez vistas (Cronología, Mapa, África, Filogenia, Clima, Recursos, Dispersión, Yacimientos, Genómica y Biogeografía),
ficha de *Australopithecus afarensis* con todas sus pestañas y Bibliografía; además, el cambio de capa del minimapa
de la ficha y la hoja académica de impresión. Se anotaron todas las peticiones que el navegador inicia fuera del
propio servidor y los eventos de infracción de la política de seguridad de contenidos (CSP). La medición se hizo en un
entorno **sin acceso real** a Wikimedia, a los servidores de teselas ni a ArcGIS: las peticiones se inician y se
cuentan, pero no reciben respuesta, de modo que no hay reintentos ni desplazamiento real del mapa. Con conexión real,
el número de peticiones puede variar; la lista de dominios es la del código y la de la CSP.

| Servicio o dominio | Cuándo se contacta | Datos técnicos que pueden salir |
|---|---|---|
| `upload.wikimedia.org`, `commons.wikimedia.org` | Al mostrar imágenes de taxones que no tienen copia local en `img/taxones/` (las principales de 47 de los 50 taxones se sirven desde el propio paquete) | IP, agente de usuario, imagen solicitada |
| `*.tile.openstreetmap.org`, `server.arcgisonline.com` | Al mostrar el minimapa de la ficha y el relieve del mapa (si no hay red, se ve el fondo local de costas) | IP, agente de usuario, zona o tesela consultada |
| `3d.si.edu`, `doi.org`, BOE, BOC, Creative Commons y otros enlaces académicos | Solo si la persona pulsa el enlace | Datos de navegación al hacer clic |

En esa medición (pantalla de escritorio), la carga hizo 6 peticiones externas y el recorrido completo 31, todas a los
dominios de la tabla.

Ya **no** se contacta con `cdnjs.cloudflare.com` (Leaflet se sirve desde `assets/vendor/leaflet/`) ni con
`fonts.googleapis.com` o `fonts.gstatic.com` (los titulares usan la fuente Lexend alojada en el repositorio y el
resto, las fuentes del sistema).

Dos servicios que el código todavía nombra quedan **bloqueados por la CSP** de `index.html`, que no los admite en
`img-src`: el navegador no llega a enviar la petición y registra una infracción de CSP.

- `*.tile.opentopomap.org`: capa «Topográfico» del minimapa de la ficha (al elegirla, 6 infracciones en pantalla de
  escritorio y 4 en teléfono, una por tesela pedida; la capa no se muestra).
- `api.qrserver.com`: código QR de la hoja académica de impresión de la ficha (la petición falla con motivo «csp»;
  la hoja se imprime con un recuadro neutro en lugar del QR).

El apartado 5 sigue vigente: para un aislamiento completo, sin imágenes de Wikimedia ni teselas, basta con usar el
atlas sin conexión a Internet; el fondo local de costas y las imágenes con copia local siguen disponibles.

**Actualización del 20 de noviembre de 2026.** Por decisión de la titular, la hoja académica de impresión de la ficha
ya no incluye el código QR: el atlas ya no pide nada a `api.qrserver.com` (medido: 0 peticiones y 0
infracciones de CSP al exportar la hoja). La dirección del recurso se sigue imprimiendo como texto en la sección
«Recurso». La entrada de `api.qrserver.com` de la lista anterior queda solo como registro de lo que ocurría hasta esa
fecha.
