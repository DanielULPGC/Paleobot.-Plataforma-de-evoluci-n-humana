# PaleoBot

Recurso educativo para consultar y comparar evidencias de la evolución humana.
Incluye un catálogo de 50 fichas, cronología tipada, referencias y recursos visuales
documentados, junto con las fuentes del Atlas y su expediente de revisión.

**Estado: preparación para revisión en GitHub, PB-GH-01, 24-10-2026.**
La entrada principal es la consulta ligera v11. Su prueba institucional sigue
pendiente. A3 y el Atlas R98 conservan **NO_GO para promoción docente**. Las
comprobaciones de este repositorio no certifican navegador, lector de pantalla
ni Moodle. La confirmación de funcionamiento recuperada corresponde a v9,
sin atribuir ese resultado a v11.

## Abrir PaleoBot

Abra `index.html` con un navegador para consultar las fichas. El contenido básico
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
| `index.html` | Entrada ligera v11, preservada byte a byte. |
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

Siga [la guía de subida](docs/SUBIR_A_GITHUB.md). El paquete no está vinculado a
un repositorio remoto ni presupone que exista `paleobot` en una cuenta concreta.
GitHub Desktop es la vía recomendada para subir el árbol completo y conservar
las carpetas de configuración. Para empezar, se propone un repositorio privado
mientras se adjudica la licencia global y la revisión de materiales.

## Derechos y fuentes

Véase [el estado de licencias](LICENSE_STATUS.md) y
[los avisos de terceros](THIRD_PARTY_NOTICES.md). No se impone una licencia global
a materiales cuya titularidad o permiso no constan. Se conserva la licencia MIT
de Leaflet y el expediente individual de imágenes. Las imágenes remotas no se
incluyen como archivos descargados en esta preparación.
