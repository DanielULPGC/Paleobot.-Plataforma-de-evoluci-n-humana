# CAMBIOS v1.0

## Resumen

Version estable preparada para Moodle como paquete IMS. La entrega consolida el atlas interactivo, mantiene el contenido cientifico de base y anade documentacion docente para facilitar su uso en cursos virtuales.

## Mejoras principales

- Paquete IMS verificable mediante `imsmanifest.xml`.
- Empaquetado reproducible en `dist/` con nombre de version estable.
- Pruebas basicas de integridad para enlaces locales, recursos CSS/JS, sintaxis JavaScript, datos y manifiesto.
- Separacion inicial de datos cientificos en `data/taxones.json`.
- Capa didactica con itinerarios por perfil de usuario.
- PaleoLab 50: exploracion comparativa de taxones, evidencia, morfologia, progreso local y cinco accesos institucionales a modelos 3D.
- Mejoras de accesibilidad basica: foco visible, nombres accesibles y refuerzo de controles.
- Herramientas flotantes convertidas en un cajón accesible cerrado por defecto, sin rail permanente ni barra inferior superpuesta.
- Cabeceras didácticas, constructor de hipótesis y glosario compactados para Moodle y pantallas pequeñas.
- Glosario progresivo de 359 términos con búsqueda, filtros y bloques de 24 entradas.
- Corrección del destino Clima y de los controles cartográficos interceptados por capas históricas; el zoom regional automático queda limitado al 300 %.
- Auditoria y documentacion de privacidad educativa.
- Limpieza del ZIP final para no incluir auditorias, informes internos ni archivos de desarrollo innecesarios.

- Correccion de pulsacion real en herramientas flotantes, filtros globales, fichas y pestanas, bibliografia, cierres modales, autoevaluacion M13, Datacion, Constructor, Coexistencias, Presentacion y Dispersion.
- Filtros avanzados completos: el panel temporal vuelve a mostrarse y sus presets actualizan el conjunto visible.
- Proteccion contra doble respuesta en el cuestionario: cada eleccion avanza exactamente una pregunta.
- Imagenes biogeograficas diferenciadas mediante 14 medios de especimen con fuente y licencia; los casos sin imagen exacta muestran `N/D` en vez de repetir otro fosil.
- Asociaciones cientificas corregidas: Dali abre su ficha `Homo daliensis` y Maba ya no enlaza a Bodo.
- Enlaces de la hemeroteca protegidos desde `pointerdown`: `Abrir lectura` y `Fuente primaria` navegan al destino externo sin rebotar a Cronologia.
- Eliminada la tarjeta `Autoria / Proyecto / Sobre el autor y el proyecto` del corpus Nutcracker Man.

## Sistema visual final

- Paleta funcional, radios de 8 px, foco visible, portada contenida, cabeceras didacticas compactas y tarjetas consistentes.
- Orientacion contextual sincronizada con la vista realmente activa, incluso cuando una ruta heredada evita el enrutador principal.
- Renderizado diferido de tarjetas fuera del viewport mediante `content-visibility`, sin ocultar contenido cientifico.
- Modales limitados al viewport y correccion general de la superposicion entre `Volver`, el titulo y el cierre.
- Modo presentacion estabilizado: cada ficha comienza por su encabezado, los controles avanzan una sola especie y las herramientas globales no se superponen a la navegacion inferior.
- Paneles cientificos de presentacion sin estiramiento vertical; minimapa proporcionado y mapa completo disponible mediante Ampliar mapa.
- Router de eventos corregido para que el estado global `data-nav-family` no intercepte botones de otras herramientas.
- Secuencia de PaleoLab sincronizada: el control pulsado actualiza fila, lamina, inspector y posicion; se incorporan Anterior/Siguiente y comienzo coherente en Proconsul para sesiones nuevas.
- PaleoLab aislado de los buses globales: sus controles se ejecutan una sola vez en Firefox/Moodle; comparador, modos, filtros, busqueda, zoom y ficha completa quedan verificados mediante interaccion real.
- Visor PaleoLab estabilizado: reapertura al 100 % sin inclinacion, umbral contra arrastre accidental y aviso explicito `3D no disponible` cuando no existe modelo institucional curado.
- Imagenes PaleoLab contenidas sin recorte: el visor adopta la altura disponible y muestra completa cada fotografia vertical o apaisada en Firefox y Moodle.
- Cladograma reorganizado con 24 nodos compactos numerados, eje temporal escalonado y panel explicativo fijo, sin alterar las relaciones ni los tiempos cientificos.
- Glosario corregido: la busqueda textual ya no confunde etiquetas de categoria con contenido; Todos y las cinco disciplinas funcionan, y total, coincidencias, categoria y paginacion se presentan por separado.
- Propiedad unica del cajon flotante: Estadisticas, Bibliografia y Guia del alumnado ya no se ejecutan durante `pointerdown` ni se cierran antes de completar el clic.
- Control editorial de publicacion para UTF-8, CSP, secretos, ejecucion dinamica, accesibilidad estatica y limpieza del IMS.

## Documentacion docente incluida

- `LEEME-MOODLE.md`: instalacion y recomendaciones para Moodle.
- `PROPUESTA-DIDACTICA.md`: itinerarios, objetivos, actividades, preguntas, evidencias y criterios de evaluacion.
- `POLITICA-PRIVACIDAD-DOCENTE.md`: uso educativo, privacidad y servicios externos.

## Alcance de la version

Esta version no reescribe la arquitectura completa del aplicativo ni modifica la base cientifica de taxones. La prioridad ha sido estabilizar el paquete, comprobar rutas y preparar una entrega util para el profesorado.

## Verificacion realizada

- Trece pruebas de integridad superadas.
- XML del manifiesto y recursos locales comprobados.
- Las 31 vistas, los dialogos principales y el cajon flotante verificados en navegador.
- Responsive comprobado en movil, tableta, escritorio y proyeccion.
- ZIP IMS final generado de forma reproducible.
