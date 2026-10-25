# PaleoBot: instrucciones de trabajo

- Lea README.md, CHANGELOG.md, el asunto PB relevante y las instrucciones del usuario.
- Los archivos de aplicación importados conservan su lógica. La preparación
  PB-GH-01 no corrige PB-01 ni acredita Moodle.
- Preserve los 50 IDs, la cronología tipada, la incertidumbre, créditos y avisos.
- Use `src/entrada_ligera` como fuente de la entrada v11; `index.html` es generado.
- El Atlas y su generador están en `experimental/atlas-r98`.
- No edite evidencias históricas para conseguir PASS ni atribuya pruebas no ejecutadas.
- Mantenga un motivo, evidencia, impacto y retorno por cambio.
- Verifique con Python 3.10+ y Node 20+: `python3 scripts/verificar_repo.py`,
  `python3 scripts/construir.py --check`, `node scripts/reproducir_pb01.cjs`.
- Esa reproducción pasa si el defecto conocido se reproduce. No es una prueba
  de corrección ni una aprobación del programa.
- No adopte una licencia global, cambie la audiencia o publique por inferirlo
  de un resultado CI. Atienda las autorizaciones concretas del usuario.
