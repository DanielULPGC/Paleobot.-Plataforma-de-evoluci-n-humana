# Evidencia visual de PB-GH-10

Pares antes/después reducidos (JPEG de calidad 80; 900 px de ancho en escritorio e impresión, 450 px en
teléfono, recortados a 2000 px de alto). Los originales, a doble densidad y con más estados (tableta, oscuro,
320 px, página completa), están en la carpeta de trabajo de la auditoría, fuera del repositorio. Todas las
capturas son de Chromium con emulación de viewport y sin acceso a recursos de terceros.

| Par | Qué muestra | Commit |
|---|---|---|
| `B1_introduccion_telefono_{antes,despues}` | Defecto bloqueante 1: introducción del recorrido a los 5 s. Antes, texto de la escena 0 bajo el póster, «Comenzar» recortado y el botón fijo amarillo encima; después, póster limpio y «Comenzar» visible. El «después» se tomó justo tras el arreglo, antes de C-1: todavía no lleva Lexend. | 18f8c58 |
| `B2_impresion_recorrido_index_{antes,despues}` | Defecto bloqueante 2: portada del recorrido al imprimir. Antes, la entradilla y las tres tarjetas de bloque no se imprimían; después, se imprimen en papel blanco. Tomada antes de C-1. | 4fd475a |
| `L2-1_rejilla_escritorio_*` | Cabecera, pestañas y contenido comparten los bordes de la rejilla. | e3e8003 |
| `L2-2_ajustes_telefono_*` | Cuatro botones de ajuste reunidos en el menú «Ajustes». | a334a5a |
| `L2-3_secciones_telefono_*` | Botón «Secciones» y pestañas sin palabras cortadas. | 2decc31 |
| `L2-4_continuar_telefono_*` | Bloque «Continuar» como único punto focal de Inicio. | dd4dee4 |
| `L2-5_tiempo_escritorio_*` | Línea del tiempo con rejilla por millón de años y eje fijo. | 52b808b |
| `L2-6_fichas_escritorio_*` | Fichas en una columna; la abierta, como página de manual. | b9a073c |
| `L2-7_mapa_escritorio_*` | Puntos numerados y recuadro ampliado del Rift. | 806e4c0 |
| `L2-8_comparar_telefono_*` | Comparar con un solo gráfico y la franja de coincidencia. | 37b2ed3 |
| `L2-9_proyeccion_escritorio_*` | Modo proyección: más ancho, más contraste y una sola salida. | fbde9e0 |
| `L2-10_glosario_telefono_*` | Glosario agrupado por letras con índice. | 505fc52 |
| `pulido_mapa_escritorio_*` | «Canarias» fuera de la costa y sin puntos medio tapados en el recuadro del Rift. | 4a8cb2a |
| `pulido_fichas_escritorio_*` | Resumen de ficha centrado abierto y cerrado; anillo de foco con aire alrededor del nombre. | 4a8cb2a |
