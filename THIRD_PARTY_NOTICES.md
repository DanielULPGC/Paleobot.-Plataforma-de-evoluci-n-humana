# Componentes y recursos de terceros

| Componente | Versión/procedencia | Situación |
| --- | --- | --- |
| Leaflet | 1.9.4, incluida en las fuentes R98 | Licencia MIT y archivos originales conservados. |
| Imágenes de fichas | URLs del expediente visual v11 | Créditos/licencias por recurso; 47 documentados y 3 pendientes. No se incluyen descargas. |
| Teselas de mapa y fuentes web | Servicios referidos por el Atlas | Recursos externos; su presencia en código no implica autorización general ni funcionamiento sin conexión. |
| Atlas v1.0 (`atlas/`) | Paquete IMS recibido el 24-10-2026 | Código, datos y textos conservados sin cambios; sin licencia global asignada. Carga Leaflet 1.9.4 desde cdnjs (SRI), fuentes de Google, imágenes de Wikimedia Commons y teselas de mapa; los cinco modelos 3D se abren en Smithsonian 3D Digitization con sus condiciones propias. |
| Atlas v1.0 tras PB-GH-11 | Rama `feat/pb-gh-11-atlas` | Ya no carga Leaflet de cdnjs ni fuentes de Google: Leaflet 1.9.4 alojado en `atlas/assets/vendor/leaflet/` (copia del paquete npm, contrastada con la etiqueta oficial; `PROCEDENCIA.md`), con su `LICENSE`, que es la licencia BSD de 2 cláusulas (el mismo texto que `LICENSE.txt` de R98, descrito arriba como MIT); titulares en Lexend local. Siguen remotas las imágenes de Wikimedia sin copia local, las teselas y el relieve del mapa y los modelos del Smithsonian. |
| Natural Earth «Land» 1:110m v4.1.0 | Vía el paquete npm `world-atlas@2.0.2` (`land-110m.json`) | Datos de dominio público (empaquetado ISC), convertidos por `scripts/generar_costas_atlas.cjs` en `atlas/assets/js/95-sistema/costas-datos.js` (solo datos, sin código de terceros); integridad en la cabecera del script. |
| actions/checkout | v7.0.1, commit 3d3c42e5aac5ba805825da76410c181273ba90b1 | Dependencia del flujo de verificación, no del recurso docente. |

Se preservan los avisos incorporados en las fuentes. No se descarga código ni
activos de terceros durante los verificadores locales de este repositorio.
El flujo de GitHub descarga la acción oficial de checkout para obtener su código.

- Portada Sylva (`atlas/recorrido/portada-sylva.html`, `inner-green-assets/`): @designcodeio/threeui 1.2.0, MIT © 2026 Meng To; Lexend, SIL OFL 1.1; Three.js, MIT. Avisos en `atlas/recorrido/licencias/`.

- Imágenes de `img/taxones/` (47 copias): fotografías, dibujos y un mapa de Wikimedia Commons bajo licencias CC BY, CC BY-SA, CC0 o dominio público, según cada caso. La autoría, la licencia y la página de origen de cada una están en [`img/taxones/CREDITOS.md`](img/taxones/CREDITOS.md) y se muestran junto a la imagen en la entrada DEA. Son miniaturas de hasta 500 px de ancho, sin otros cambios.
