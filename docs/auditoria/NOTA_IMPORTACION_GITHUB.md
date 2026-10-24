# Importación portable de PB-AUD-01

Los dos inventarios mantienen 272 filas, nombres, fechas, cobertura y hashes.
Se han omitido únicamente `id_archivo` y `enlace`, que contenían identificadores
y enlaces privados de la plataforma de origen. Esta transformación afecta a la
portabilidad del expediente, no a los datos científicos del programa.

El manifiesto de la entrega original no se traslada porque esos dos archivos
tienen otros bytes. `provenance/importacion.json` conserva hashes de origen y
destino, y `provenance/AUDITORIA_SHA256.json` verifica los archivos importados.
Los resultados históricos siguen siendo resultados históricos. La preparación
para GitHub no los convierte en pruebas reejecutadas ni levanta el estado NO_GO.
