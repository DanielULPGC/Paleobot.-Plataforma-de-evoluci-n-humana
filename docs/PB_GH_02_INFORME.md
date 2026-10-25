# PaleoBot · Contraste de auditoría y corrección PB-GH-02

Fecha: 24-10-2026. Repositorio: DanielULPGC/Paleobot.-Plataforma-de-evoluci-n-humana.
Base de esta propuesta: `4d320ee6126c8857a8d4b53daa932d547188a906`.
Auditoría aportada: commit histórico `af35a8e56cd9c995ff3636c41e3409a5184c48a4`.

## 1. Dictamen

Actualización final: se conserva también `4d320ee`, que incorpora la portada 3D
Sylva y la selecciona desde la raíz. La propuesta se actualiza localmente a ese
commit. La portada 3D mantiene pendientes sus pruebas de interacción, rendimiento
y accesibilidad; no se infieren del resultado de recursos estáticos.


C1-C3 se confirman en el commit histórico auditado. El repositorio evolucionó
durante la revisión: esos defectos estructurales ya habían sido corregidos y la
entrada principal cambió de forma expresa. Esta propuesta conserva la evolución
hasta 4d320ee y añade procedencia, preservación y regresiones. Está preparada
para revisión; **NO_GO para promoción docente se mantiene**.

## 2. Versiones, alcance y cobertura

| Commit | Cambio observado |
| --- | --- |
| af35a8e | Árbol de 330 archivos con rutas incompletas e índice modular en la raíz. |
| bbe2f59 | Restauración del árbol y de la entrada ligera v11. |
| 7f67616 | Incorporación de Atlas v1.0: 169 archivos y guía visual. |
| 2d7983a | Corrección de carga de imágenes de v11: `loading=eager`. |
| f09a07b | Portal Atlas en la raíz; v11 pasa a `ligera/index.html`. |
| 4d320ee | Portada 3D Sylva y actualización del portal de entrada. |

Se cotejó el árbol remoto y se reconstruyó af35a8e mediante bytes coincidentes
con sus 330 objetos Git. Se reprodujeron sus cuatro comprobaciones fallidas.
La propuesta final se actualiza a la base 4d320ee: **531 archivos**, todos con
una copia idéntica identificada por SHA-256. Los documentos que se actualizan se
archivan; no se cambia la lógica de las aplicaciones ni el expediente histórico.

`PB_GH_02_MIGRACION.json` conserva la relación de los 330 archivos históricos.
`PB_GH_02_BASE_ACTUAL.json` conserva la de los 531 archivos de la base de trabajo.
`PB_GH_02_ENTRADAS.json` fija las huellas del portal, v11 y su interacción.
La comparación por bytes y rutas no equivale a una lectura semántica integral de
cada línea ni a una validación científica. Los 50 registros de la consulta ligera
y el Atlas v1.0 son componentes distintos; no se igualan sus conteos por inferencia.

## 3. Hallazgos y cambios

**C1 — recursos ausentes en af35a8e. Gravedad alta; confianza alta.** Las 128
referencias locales de recursos extraídas de `script`, `link` e `img` del índice
apuntan a archivos ausentes. El informe aportado cuenta además el enlace a la
cronología: 129 enlaces locales, 128 fallidos. Nuestra extracción de la cronología
encuentra 4 recursos ausentes. La restauración ya integrada devuelve los recursos
a `assets/`, con Leaflet y su licencia. No se atribuye a esta propuesta esa
restauración. Se añade una prueba HTTP bajo el prefijo del proyecto y `.nojekyll`.
La causa concreta del aplanamiento de la subida no se ha demostrado.

**C2 — entrada y procedencia contradictorias en af35a8e. Gravedad alta; confianza
alta.** El índice modular tenía 179.250 bytes y SHA-256 `c82a5e1d…`, frente a la
v11 de 217.992 bytes y `812c6de5…` documentada en PB-GH-01. Después se restauró
v11, se corrigió su carga de imágenes y se trasladó a `ligera/`. La raíz de f09a07b
es un portal de 846 bytes que abre el Atlas. Esta propuesta conserva esas
entradas y actualiza README, AGENTS y ESTADO para describirlas. Las huellas de
PB-GH-01 se mantienen como referencia histórica, no como huella de la entrada actual.

**C3 — controles y flujo incompletos en af35a8e. Gravedad alta; confianza alta.**
El verificador, constructor y reproducción PB-01 fallaban por archivos ausentes.
Se repiten 6 errores y 1 fallo en 8 pruebas. El flujo estaba en `workflows/` y no
en `.github/workflows/`. Esas ubicaciones ya están restauradas. Se añade a CI el
control HTTP y tres regresiones: rutas servidas con prefijo, rechazo de otra
entrada colocada en la raíz y rechazo de rutas absolutas que salen del proyecto.

Se corrige también el control que exigía declarar que no existía publicación.
Ahora separa publicación observada, evidencia de despliegue y validación docente.
Los 169 archivos del Atlas v1.0 mantienen las huellas de su importación. No se
asigna una licencia global ni se modifican sus contenidos por extrapolar los
hallazgos de otra versión.

## 4. Pendientes y afirmaciones matizadas

| Tema | Resultado y pendiente |
| --- | --- |
| 47 imágenes / 50 URL | Son recursos documentados y valores heredados del catálogo, respectivamente; hay 3 recursos pendientes. No es un único denominador. |
| Universidad de Tokio | La URL está vinculada a chororapithecus, ya pendiente en el expediente visual. Su presencia en datos no acredita permiso de reutilización. |
| Accesibilidad | Los resultados axe aportados se refieren al Atlas modular con rutas corregidas. No se han repetido aquí ni se transfieren a v11 o al Atlas v1.0. |
| Cronología | Se conservan campos heredados y contratos tipados. Debe contrastarse qué consume cada vista antes de adjudicar su exactitud. |
| Clima y DOI | Se mantienen los problemas reportados como pendientes de fuentes primarias; no se afirma haber resuelto los 257 DOI citados por el informe. |
| Privacidad y seguridad | La conservación del código no acredita una auditoría completa de solicitudes externas, inserciones DOM ni permisos. |
| Enlaces profundos | Comprobar en navegador los enlaces antiguos `#sp-…` y sus destinos en `ligera/`. |
| PB-01 | Sigue reproducible en el R98 histórico; ese resultado no adjudica el comportamiento del módulo distinto del Atlas v1.0. |

## 5. Comprobaciones

Se ejecutan Python 3.12.14 y Node 24.22.1. Los resultados completos están en
`provenance/PB_GH_02_RESULTADOS.json`.

| Comando | Resultado |
| --- | --- |
| `python3 scripts/verificar_repo.py` | 47 controles superados; 245 unidades JavaScript con sintaxis válida. |
| `python3 scripts/construir.py --check` | v11 de 218.019 bytes y piloto R98 de 3.395.289 bytes idénticos a sus referencias de trabajo. |
| `python3 scripts/verificar_publicacion.py` | 9 entradas inspeccionadas; 105 CSS; 296 respuestas HTTP correctas y bytes idénticos; 0 fallos locales. |
| `python3 -m unittest discover -s tests -p "test_*.py"` | 11 pruebas superadas. |
| `node scripts/reproducir_pb01.cjs` | Reproduce 3 sustituciones incorrectas; preserva 44 de 47 URL y el mapa de control. |

La prueba HTTP usa exclusivamente `127.0.0.1` bajo el prefijo del proyecto.
No solicita recursos externos ni ejecuta JavaScript. Incluye portal, Atlas v1.0,
recorrido, consulta ligera, v9, piloto R98, índice modular y cronología. Que las
rutas respondan no demuestra que todas las interacciones funcionen.

No hay un ejecutable de navegador instalado en este entorno. No se ha ejecutado
axe, lector de pantalla ni Moodle. El intento de obtener el HTML del dominio
Pages con la herramienta web falló; no se interpreta como caída del sitio.
Las ejecuciones previas de GitHub para 7f67616 figuraban correctas; son evidencia
de esa versión, no de la nueva propuesta ni de la validación docente.

## 6. Decisión, consecuencias y retorno

La rama es `fix/pb-gh-02-verificacion`. La base 4d320ee se conserva aunque la rama
principal siga recibiendo cambios. La propuesta permite revisar y fusionar las
diferencias sin forzar el historial ni reemplazar la rama principal.

| Error posible | Efecto | Protección y retorno |
| --- | --- | --- |
| Omitir recursos o usar rutas desde la raíz del dominio | 404 en el proyecto Pages; interfaz incompleta. | HTTP con prefijo, recursos CSS y prueba negativa. |
| Sustituir el portal por una entrada de otra versión | Navegación y procedencia contradictorias. | Huellas de entradas y regresión específica. |
| Perder contenidos al integrar | Pérdida de datos, créditos, evidencia o correcciones recientes. | Copias por hash de 330 y 531 archivos; Atlas v1.0 íntegro. |
| Confundir PASS con autorización docente | Uso con defectos y pruebas institucionales pendientes. | NO_GO y límites expresos por componente. |
| Integrar sobre cambios ajenos sin revisar | Conflictos o regresiones. | Revisión de la propuesta y del estado de la rama principal. |

Descartar la propuesta deja intacta la rama principal. Después de integrar, un
commit de reversión permite volver al padre conservando historial. No se propone
volver automáticamente a af35a8e, que contiene los fallos históricos. Debe
comprobarse la configuración Pages antes de integrar: la fusión puede actualizar
el sitio si el servicio toma la rama principal.

## 7. Límites y criterio de cierre

Preparación cerrada cuando el cambio es revisable y pasan preservación,
construcción, regresiones y HTTP local. Despliegue e interacción reales requieren
comprobación posterior. Los hallazgos científicos, de derechos, accesibilidad y
Moodle permanecen abiertos hasta disponer de sus evidencias. La reproducción
correcta de PB-01 acredita que el defecto continúa, no que se haya corregido.


La escritura remota quedó bloqueada por la revisión automática de aprobación:
se consideró autorizada la preparación, pero no su publicación en GitHub, y se
señaló que la base anterior había avanzado. La propuesta se actualizó localmente
a 4d320ee. No se creó rama remota ni propuesta de integración. La entrega es un
parche revisable; publicar la rama requiere autorización explícita.
