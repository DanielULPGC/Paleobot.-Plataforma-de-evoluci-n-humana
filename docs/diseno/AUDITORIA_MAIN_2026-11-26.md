# Auditoría del estado final de `main` · PaleoBot (26-11-2026)

Alcance: `main` en el commit 65f78c1 (fusión del PR n.º 19), tras la ronda PB-GH-11 y la auditoría de jerarquía y densidad del 23-11-2026 (PR n.º 11 a n.º 19; el n.º 7, obsoleto, se cerró sin fusionar). Método: ejecución local de los controles del repositorio y del atlas en Chromium con Playwright (390 y 1366 px), sin red externa.

## 1. Gobernanza del repositorio
| Control | Resultado |
|---|---|
| `verificar_repo.py` | 91/91 |
| `construir.py --check` | sin diferencias |
| `reproducir_pb01.cjs` | correcto |
| `generar_imagenes_atlas.cjs --check` y `generar_costas_atlas.cjs --check` | correctos |
| Pruebas unitarias | 98 OK (92 s) |
| `verificar_publicacion.py` | NO_GO (esperado: puerta de publicación docente sin cerrar) |

## 2. Atlas (31 vistas, escritorio y teléfono)
- Prueba de humo frente a la línea base (`--sin-terceros`): 0 pérdidas en escritorio y en teléfono.
- axe-core (WCAG 2 A/AA) sobre vista activa, contenido principal y barra: 0 violaciones en las 31 vistas a 390 y 1366 px; ningún desbordamiento horizontal.
- Primer dato tras la cabecera (`primer-dato.cjs`, aproximado): escritorio, mediana 512 px de 768 y 4 vistas bajo el pliegue (clima, asia, aula, recursos); teléfono, mediana 738 px de 844 y 11 vistas bajo el pliegue. Antes de la ronda: 543 px y 7 en escritorio; 796 px y 13 en teléfono.

## 3. Recorrido, consulta ligera, DEA y portada
- axe (WCAG 2 A/AA): 0 violaciones en las 11 páginas del recorrido, en `ligera/`, `dea/` y la portada raíz, a ambos anchos.
- Texto por debajo de 12 px: ninguno, salvo 52 botones `barra-taxon` de Cronología a 390 px con `font-size: 0` deliberado (su texto lo da la etiqueta contigua; axe no marca nombre de botón ausente).
- Enlaces locales: 370 comprobados, ninguno roto (dos coincidencias son plantillas JavaScript, no enlaces).
- `ligera/`: 50 fichas más 2 subespecies de *H. erectus* sin ficha ampliada (52 entradas), coherente con atlas y recorrido.

## 4. Despliegue
- Último despliegue de GitHub Pages con éxito: commit 5c56e51 (PR n.º 18).
- Hallazgo: no consta ejecución de «pages build and deployment» para el commit de fusión del PR n.º 19 (65f78c1; cambia `ligera/`, el generador, las pruebas y la procedencia). Hasta que se compruebe, el sitio publicado puede carecer de la sección de subespecies. No se pudo forzar una reconstrucción (la API de Pages no está permitida desde el entorno de la auditoría) ni abrir la URL pública.

## 5. Pendientes y limitaciones
- Decisiones de la titular abiertas: aviso de «evidencia histórica» en `experimental/atlas-r98/` y `baselines/entrada-ligera-v9.html`; JPEG pesadas de portada (registradas por hash); copias históricas de `002-script.js`.
- Sin validar: el paquete IMS contra el esquema oficial y su importación en Moodle; contraste y comportamiento con lectores de pantalla reales (axe automatizado cubre solo una parte de WCAG).
- Sin repetir en esta auditoría: humo con terceros (Leaflet/mapas) y propiedades visuales finas más allá de las capturas revisadas en las rondas anteriores.
