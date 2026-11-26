# Auditoría didáctica del conjunto PaleoBot · 26-11-2026

Alcance: portada Sylva, atlas interactivo (31 vistas), recorrido (11 páginas), consulta ligera y entrada DEA. Destinatario principal: alumnado del Diploma de Estudios Africanos (DEA, ULPGC), en ordenador, tableta y teléfono. Método: lectura del contenido y de la estructura de cada superficie en `main` (`d103aa6`), contraste con el texto de los decretos y rúbricas incluidos en el proyecto y revisión de los datos de las sesiones (`dea/dea.js`). **No se ha realizado ninguna prueba con alumnado ni revisión experta**: lo que sigue es una evaluación de diseño didáctico, no una validación de resultados de aprendizaje.

## 1. Encuadre

- **Andragogía.** El DEA es un programa formativo para personas mayores. La literatura andragógica (Knowles, Holton y Swanson, *The Adult Learner*, Routledge; edición y DOI por comprobar antes de citarlos en un trabajo) subraya la orientación a tareas, el uso de la experiencia previa y la autonomía. Es un marco descriptivo, no una evidencia causal sobre la eficacia de un recurso concreto.
- **Carga cognitiva.** Sweller (1988), *Cognitive Science*, 12(2), 257-285, https://doi.org/10.1207/s15516709cog1202_4: la carga intrínseca y la extrínseca compiten por una memoria de trabajo limitada. En una interfaz con 31 vistas, la reducción de carga extrínseca (jerarquía, un único botón principal, orden de lectura) es un criterio razonable. El efecto de inversión de la pericia (Kalyuga, Ayres, Chandler y Sweller, 2003, *Educational Psychologist*, 38(1), 23-31; DOI por comprobar) advierte de que el andamiaje que ayuda al principiante puede estorbar al experto: de ahí el valor de los modos «ligero» y «completo».
- **Pensamiento histórico y tiempo.** Los materiales del proyecto (Comes y Trepat, *El tiempo y el espacio en la didáctica de las ciencias*; Cooper, *Didáctica de la historia en la educación infantil y primaria*, Morata, 2019; Arias Ferrer y Egea Vivancos, *Didáctica de la geografía y la historia en Educación Primaria*, Síntesis, 2023) sostienen que la noción de tiempo largo exige representaciones graduadas y ejercicios de ordenación y simultaneidad. Se usan aquí como criterio, sin trasladar cifras.
- **Marco normativo.** Primaria: Real Decreto 157/2022, de 1 de marzo, y Decreto 211/2022, de 10 de noviembre (Canarias); rúbricas de la Consejería (15-05-2025). ESO y Bachillerato en Canarias: véase el hallazgo A-1.

## 2. Qué funciona (conservar)

1. **Estructura por preguntas.** Cada sesión del DEA parte de una pregunta, da pasos con enlace directo a la vista y propone un producto («Para su trabajo»). Es coherente con el aprendizaje basado en tareas y con la autonomía del adulto.
2. **Distinción dato / inferencia / opinión** explícita en la sesión 2, en el lenguaje de las fichas («Debatida») y en la guía de trabajo individual («¿Distingue los datos de las interpretaciones?»).
3. **Honestidad epistémica visible**: etiquetas de incertidumbre siempre con texto, aviso de DOI no localizados, créditos y licencias de cada imagen, aviso de que algunas imágenes son moldes.
4. **Cuaderno propio y privado**: notas por paso, descarga y borrado; aviso de que no se envía nada (adecuado para población adulta y para el RGPD).
5. **Vía sin JavaScript y consulta ligera** para conexiones o equipos limitados; tamaño de letra y proyección configurables.
6. **Sesiones 5 y 6** abren la perspectiva (patrimonio de la UNESCO; Piltdown, Taung y la investigación hecha desde África): contextualizan el conocimiento y evitan una narrativa lineal y eurocéntrica.
7. **Glosario** alfabético propio (generado desde el del atlas) y búsqueda en términos y definiciones.

## 3. Hallazgos

Gravedad: **A** = corregir pronto; **M** = mejorar; **B** = opcional. «Evidencia» remite a archivo o texto comprobado.

| N.º | Gravedad | Hallazgo | Evidencia |
|---|---|---|---|
| A-1 | A | **Cita normativa errónea en el generador de situaciones de aprendizaje del atlas.** El atlas cita «Decreto 82/2022 (ESO) y 83/2022 (Bachillerato) de Canarias, de 30 de junio», y en otros archivos invierte la asignación (82 = Bachillerato; 83 = ESO). El currículo de ESO y Bachillerato de Canarias es el **Decreto 30/2023, de 16 de marzo**, que regula ambas etapas (título consultado en vLex y citado como tal en el BOC 2025/133). No he localizado ninguna norma canaria «82/2022» de ese contenido. | `atlas/assets/js/00-core/002-script.js` (líneas 13644, 19296-19298, 19320-19321, 19446-19447, 19629); `80-features/040-script.js` (18, 139); `80-features/058-script.js` (60) |
| A-2 | A | **Desajuste de etapa y ciclo en la situación de aprendizaje de Primaria.** `recorrido/aula.html` propone «tercer ciclo» para «¿Una sola humanidad?». En el Decreto 211/2022, el criterio 7.1 y 7.2 de *Conocimiento del Medio Natural, Social y Cultural* sitúa «Prehistoria y Edad Antigua» en el **segundo ciclo** y la Edad Media hasta la actualidad en el tercero (rúbricas de 2025 y saberes de «Sociedades en el tiempo»). El contenido de evolución humana encaja mejor en 3.º-4.º, o bien debe argumentarse su encaje en el tercer ciclo por otro saber (p. ej., cultura científica) en lugar de por 7.1/7.2. La propia página ya avisa de que falta concretar competencias, saberes y criterios. | `atlas/recorrido/aula.html`; Decreto 211/2022, Anexo 2 (BOC 231, pp. 45555 y 45599); rúbricas CMC 2.º y 3.er ciclo |
| A-3 | A | **Tres textos de la capa del atlas fijan niveles y competencias sin respaldo curricular visible**: se asignan 4.º ESO, 1.º y 2.º de Bachillerato a partir del nivel de Bloom máximo y se rotulan competencias «STEM, CCL, CPSAA…» como «LOMLOE activadas» sin indicar criterio de evaluación. Esa correspondencia es una heurística del código, no una relación curricular. | `50-aula/064-paleobot-v66-sa-session.js` (`BLOOM_TO_NIVEL`, `competenciasLOMLOE`) |
| M-1 | M | **El Repaso del DEA evalúa solo recuerdo.** Las ocho preguntas se generan a partir de fechas, regiones, coexistencia y «¿está debatida?». Hay explicación inmediata y enlace a la ficha (buena práctica), pero ninguna pregunta exige interpretar, comparar fuentes o justificar. No hay prueba previa. | `dea/dea.js` (líneas ~940-1030) |
| M-2 | M | **Falta una rúbrica para el alumnado del DEA.** El atlas incluye una rúbrica de «básico / avanzado / experto» y el trabajo individual cuenta con una lista de comprobación, pero no hay criterios de evaluación ligados a las cinco o seis sesiones ni ejemplos de buen trabajo. El profesorado del DEA los fija (la guía lo reconoce), por lo que conviene ofrecer una plantilla opcional, no impuesta. | `dea/index.html` § «Guía para su trabajo individual» |
| M-3 | M | **Progresión no declarada.** Las sesiones 1-4 son de escala creciente de abstracción (datos → método → coexistencia → ambiente) y las 5-6 contextualizan, pero el recurso no dice cuánto tiempo requiere cada sesión ni su orden recomendado para quien llega con experiencia previa (efecto de inversión de la pericia). | `dea/dea.js` (`SESIONES`) |
| M-4 | M | **Tres registros de tratamiento.** El DEA usa «usted»; el recorrido y el atlas, «tú» (p. ej. «a tu ritmo»). Para población adulta mayor, la coherencia de trato forma parte de la accesibilidad lingüística. Ya figuraba como propuesta D7/D8; esta auditoría la refuerza. | portada del recorrido frente a `dea/` |
| M-5 | M | **Atlas: densidad de la capa docente.** «Capa didáctica», itinerarios por perfil (Primaria, futuro docente, centro, universidad, general), tres itinerarios filogenéticos y el generador de SA conviven con la herramienta de consulta. Para el alumnado del DEA no son necesarios y añaden elección. La barra y las cabeceras ya lo atenúan; falta un modo «solo consulta» persistente para quien no enseña. | `atlas/index.html` (vista Aula/itinerarios) |
| M-6 | M | **Evidencia de eficacia ausente.** No hay pilotos ni medidas de uso (SUS, tiempo en tarea). Es la limitación principal: todas las valoraciones de este informe son de diseño. | `auditorias/paleobot-pendientes.md`, F5/F6 |
| B-1 | B | Ejemplos de la vida del alumnado africano o canario (p. ej. paisajes, lenguas, museos locales) ausentes en las tareas; las sesiones 5 y 6 abren la puerta. | `dea/dea.js` |
| B-2 | B | Audio o resumen oral para quien lee con dificultad (DUA, representación); la guía de la SA lo menciona, el recurso no lo ofrece. | `recorrido/aula.html` |

## 4. Implicaciones y orden recomendado

1. **Corregir A-1 ya**: sustituir las citas por «Decreto 30/2023, de 16 de marzo, por el que se establece la ordenación y el currículo de la ESO y del Bachillerato en la Comunidad Autónoma de Canarias», **comprobando antes en el BOC** el número de boletín y los anexos de las materias que se citan. Afecta a tres archivos del atlas con huella de importación (requiere entradas de procedencia y archivo del estado previo).
2. **Resolver A-2**: decidir si la SA se reubica en el segundo ciclo (7.1/7.2) o se reformula para el tercero; en cualquier caso, enlazar con el criterio concreto de las rúbricas.
3. **Etiquetar A-3** como «orientación automática, no equivalencia curricular».
4. **M-1 y M-2**: añadir al Repaso preguntas de interpretación («¿qué afirmaría y qué no, con esta evidencia?») y una rúbrica opcional de cuatro niveles alineada con el vocabulario de la Consejería, sin sustituir los criterios del profesorado.
5. **M-3**: indicar duración orientativa y un itinerario rápido para quien ya conoce el tema.

## 5. Limitaciones

- Sin datos de uso ni de aprendizaje; sin lector de pantalla, Safari, Firefox ni dispositivos reales.
- No se ha leído todo el texto de las 50 fichas ni de las 31 vistas: se han revisado estructura, enunciados guía, sesiones, glosario, Repaso, Aula y recorrido de Aula.
- La asignación de ciclo se ha comprobado en las rúbricas de 2025 y en el Anexo 2 del Decreto 211/2022 del proyecto; el Decreto 30/2023 se ha identificado por fuentes web secundarias y debe confirmarse en el BOC.
- DOI citados: solo se ofrece el de Sweller (1988), reconocido en el identificador de su PDF; los de Kalyuga et al. (2003) y Knowles et al. figuran sin DOI hasta comprobarlos.

## 6. Referencias

- Arias Ferrer, L., y Egea Vivancos, A. (2023). *Didáctica de la geografía y la historia en Educación Primaria*. Síntesis.
- Comes Solé, P., y Trepat Carbonell, C. A. *El tiempo y el espacio en la didáctica de las ciencias*. Materiales para la innovación educativa.
- Cooper, H. (2019). *Didáctica de la historia en la educación infantil y primaria*. Morata.
- Decreto 211/2022, de 10 de noviembre, por el que se establece la ordenación y el currículo de la Educación Primaria en la Comunidad Autónoma de Canarias (BOC n.º 231, de 23 de noviembre de 2022).
- Decreto 30/2023, de 16 de marzo, por el que se establece la ordenación y el currículo de la Educación Secundaria Obligatoria y del Bachillerato en la Comunidad Autónoma de Canarias (por confirmar en el BOC).
- Real Decreto 157/2022, de 1 de marzo, por el que se establecen la ordenación y las enseñanzas mínimas de la Educación Primaria.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2), 257-285. https://doi.org/10.1207/s15516709cog1202_4
