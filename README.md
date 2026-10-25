# PaleoBot

Recurso educativo para consultar y comparar evidencias de la evolución humana.
Incluye un catálogo de 50 fichas, cronología tipada, referencias y recursos visuales
documentados, junto con las fuentes del Atlas y su expediente de revisión.

**Estado: contraste y regresiones, PB-GH-02, 24-10-2026.**
La raíz abre la portada Sylva del Atlas y la consulta ligera v11 está en `ligera/`. Su prueba institucional sigue
pendiente. A3 y el Atlas R98 conservan **NO_GO para promoción docente**. Las
comprobaciones de este repositorio no certifican navegador, lector de pantalla
ni Moodle. La confirmación de funcionamiento recuperada corresponde a v9,
sin atribuir ese resultado a v11.

PB-GH-02 contrasta la auditoría histórica de `af35a8e` con la base de trabajo
`4d320ee`, que ya incorpora la restauración, el Atlas v1.0, la carga inmediata de
imágenes en v11 y el portal de entrada y la portada Sylva. Se conservan esas incorporaciones.
Se actualiza la procedencia y se añaden pruebas de rutas bajo el prefijo Pages
con preservación de contenidos. Consulte [el informe](docs/PB_GH_02_INFORME.md).

## Atlas v1.0 (paquete IMS para Moodle)

[![Atlas PaleoBot v1.0](docs/atlas-v1/img/portada.png)](atlas/index.html)

Atlas interactivo de 52 entradas, 31 vistas de trabajo y 5 rutas didácticas, con
recorrido guiado, glosario de 359 términos y bibliografía con DOI. Se conserva en
[`atlas/`](atlas/index.html) tal como se recibió (169 archivos idénticos al ZIP;
huellas en `provenance/ATLAS_V1_IMPORT.json`).

- **Abrir:** `atlas/index.html` (atlas) y `atlas/recorrido/index.html` (recorrido guiado).
- **Entender y enseñar con él:** [`docs/atlas-v1/README.md`](docs/atlas-v1/README.md)
  (capturas, usos por perfil, rigor científico, límites).
- **Estado:** NO_GO para promoción docente. Pendientes Moodle, lector de pantalla
  y navegadores distintos de Chromium; la auditoría detecta 1 fallo crítico y 1 grave
  de accesibilidad y una CSP más laxa que la del resto del repositorio.

## Abrir PaleoBot

La raíz del sitio (`index.html`) redirige a la portada Sylva (`atlas/recorrido/portada-sylva.html`), que permite acceder al Atlas v1.0 (`atlas/`). La consulta ligera v11 está en `ligera/index.html`.

Abra `ligera/index.html` con un navegador para consultar las fichas. El contenido básico
usa HTML nativo. Los filtros y el diagnóstico de imágenes requieren JavaScript.
Las 47 imágenes documentadas siguen siendo remotas; hay tres fichas con recurso
visual pendiente. Abrir el archivo local es una consulta, no una prueba Moodle.

Para una comprobación HTTP de desarrollo, desde esta carpeta:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

En Windows puede emplear `py -m http.server 8000 --bind 127.0.0.1` si Python está
instalado. Abrir `http://127.0.0.1:8000/` tampoco valida la actividad institucional.
No se necesita instalar paquetes para construir o verificar el repositorio.

## Contenido

| Ruta | Función |
| --- | --- |
| `index.html` | Portal de entrada: redirige a `atlas/` y enlaza el recorrido y la consulta ligera. |
| `ligera/index.html` | Entrada ligera v11 (con la corrección de carga de imágenes). |
| `src/entrada_ligera/` | Generador, catálogo, expediente visual, estilos e interacción originales. |
| `baselines/entrada-ligera-v9.html` | Referencia recuperada para comparación y retorno. |
| `experimental/atlas-r98/` | Atlas piloto y fuentes, con limitaciones y defecto PB-01 abiertos. |
| `docs/auditoria/` | Informe, 36 decisiones, inventario de 272 archivos y evidencias. |
| `docs/incidencias/` | 36 borradores para convertir en incidencias de GitHub. |
| `docs/decisiones/` | Decisiones de empaquetado con alternativas y consecuencias. |
| `scripts/` | Construcción y verificación local, sin despliegue. |
| `provenance/` | Procedencia, hashes y transformación del inventario para GitHub. |

## Comprobar y construir

Requisitos de desarrollo: Python 3.10 o superior y Node 20 o superior.

```bash
python3 scripts/verificar_repo.py
python3 scripts/construir.py --check
python3 scripts/verificar_publicacion.py
python3 -m unittest discover -s tests -p "test_*.py"
node scripts/reproducir_pb01.cjs
```

En Windows sustituya `python3` por `py -3` cuando ese sea el lanzador instalado.
`--check` construye en una carpeta temporal y compara los dos HTML con las
entradas preservadas. No escribe sobre las fuentes ni cambia el estado docente.
Para generar otras copias en `dist/`, use `python3 scripts/construir.py`.

La reproducción PB-01 usa un DOM simulado y demuestra que el módulo 066 sustituye
tres URL documentadas por avisos de ausencia. Que la reproducción pase significa
que **el defecto conocido se reproduce**. No significa que esté corregido.

El flujo de GitHub Actions repite comprobaciones de estructura, construcción y
reproducción. No publica Pages, no sube releases y no crea incidencias.

## Próxima corrección

Revisar [PB-01](docs/incidencias/PB-01.md), fijar una copia de trabajo y preparar
una corrección que preserve las imágenes de su propia ficha y siga rechazando
reservas ajenas. Comprobar mapas, errores y las 47 fichas antes de evaluar Moodle.
La preparación PB-GH-01 conserva el código de aplicación; no incorpora ese arreglo.

## Subir a GitHub

El repositorio público es
[DanielULPGC/Paleobot.-Plataforma-de-evoluci-n-humana](https://github.com/DanielULPGC/Paleobot.-Plataforma-de-evoluci-n-humana).
Pages está habilitado. La propuesta PB-GH-02 se prepara en otra rama; consulte
[la guía de integración](docs/SUBIR_A_GITHUB.md). Un resultado correcto de CI no
acredita por sí solo funcionamiento docente ni permisos de reutilización.

## Derechos y fuentes

Véase [el estado de licencias](LICENSE_STATUS.md) y
[los avisos de terceros](THIRD_PARTY_NOTICES.md). No se impone una licencia global
a materiales cuya titularidad o permiso no constan. Se conserva la licencia MIT
de Leaflet y el expediente individual de imágenes. Las imágenes remotas no se
incluyen como archivos descargados en esta preparación.
