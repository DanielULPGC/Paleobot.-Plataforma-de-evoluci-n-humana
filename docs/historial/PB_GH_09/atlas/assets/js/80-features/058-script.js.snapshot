// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot — Contratos pedagógicos por vista
   Módulo: VIEW_DIDACTIC_SPEC + DidacticActivationBanner (entrada no bloqueante)
   ═══════════════════════════════════════════════════════════════════════════ */
(function PaleoBotV65_Phase1() {
  'use strict';

  /* ── Debug condicional (heredado del patrón del proyecto) ─────────────── */
  const DEBUG = false;
  const log  = DEBUG ? console.log.bind(console,  '[PB65-P1]') : () => {};
  const warn = DEBUG ? console.warn.bind(console, '[PB65-P1]') : () => {};

  /* ══════════════════════════════════════════════════════════════════════
     A. VIEW_DIDACTIC_SPEC
     ───────────────────────────────────────────────────────────────────
     Contrato pedagógico declarativo para cada vista del atlas.
     Es el núcleo del Spec-Driven Development aplicado a PaleoBot:
     cada vista declara QUÉ activa cognitivamente, PARA QUIÉN, con
     QUÉ prerrequisitos y CON QUÉ producto observable de salida.

     Campos del contrato (todos obligatorios):
       preguntaActivacion  {string}   Pregunta visible al entrar. No tiene
                                      respuesta trivial; usa el atlas para
                                      responderla. Verbo interrogativo activo.
       objetivoCognitivo   {string}   Verbo de Bloom revisado + contenido
                                      disciplinar específico.
       nivelBloom          {1..6}     1=recordar, 2=comprender, 3=aplicar,
                                      4=analizar, 5=evaluar, 6=crear.
                                      (Anderson & Krathwohl, 2001)
       prerequisitos       {string[]} IDs de vistas recomendadas antes.
                                      Vacío = punto de entrada válido.
       productoEsperado    {string}   Qué puede generar el alumno al terminar.
                                      Observable, no vago.
       criterioExito       {string}   Criterio mínimo de logro. Debe poder
                                      verificarse sin corrección automática.
       tiempoEstimado      {number}   Minutos de trabajo activo con la vista.
       modoCompatible      {string[]} Modos COMPLEXITY_MODES en que es
                                      pedagógicamente adecuada.
       competenciasLOMLOE  {string[]} Códigos de competencia clave activados.
                                      CCL, STEM, CD, CPSAA, CC, CE, CCEC.
       odsPrimario         {string}   ODS principal vinculado.
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * @type {Object.<string, {
   *   preguntaActivacion: string,
   *   objetivoCognitivo: string,
   *   nivelBloom: number,
   *   prerequisitos: string[],
   *   productoEsperado: string,
   *   criterioExito: string,
   *   tiempoEstimado: number,
   *   modoCompatible: string[],
   *   competenciasLOMLOE: string[],
   *   odsPrimario: string
   * }>}
   *
   * Fuente de niveles de Bloom: Anderson & Krathwohl (2001, DOI:10.2307/1477405)
   * Fuente de competencias: LOMLOE BOE-A-2020-17264, Decreto 82-83/2022 Canarias
   */
  const VIEW_DIDACTIC_SPEC = {

    /* ─────────────────────────────────────────────────────────────────
       FAMILIA: EXPLORAR — vistas de orientación espacio-temporal
       ───────────────────────────────────────────────────────────────── */

    timeline: {
      preguntaActivacion: '¿Cuántas especies de homininos han existido de forma simultánea? Elige dos taxones del atlas y comprueba si realmente coincidieron en el tiempo.',
      objetivoCognitivo: 'Identificar y ordenar cronológicamente los principales taxones homininos situando apariciones, extinciones y solapamientos temporales',
      nivelBloom: 1, // Recordar → Comprender
      prerequisitos: [],
      productoEsperado: 'Una frase cronológica con dos taxones: qué aparece antes, cuánto se solapan y qué margen de incertidumbre tienen las dataciones.',
      criterioExito: 'El alumno sitúa correctamente cinco taxones en la escala temporal con margen ±0,5 Ma y nombra al menos un solapamiento documentado.',
      tiempoEstimado: 15,
      modoCompatible: ['basico', 'universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS4'
    },

    map: {
      preguntaActivacion: '¿Existe alguna región del mundo donde nunca se hayan encontrado restos de homininos anteriores a H. sapiens? ¿Qué explica esa distribución?',
      objetivoCognitivo: 'Relacionar la distribución geográfica de los taxones homininos con las condiciones ambientales y los límites del registro fósil',
      nivelBloom: 2, // Comprender
      prerequisitos: ['timeline'],
      productoEsperado: 'Una hipótesis espacial: qué región concentra más evidencia, qué yacimiento la sostiene y qué no puede concluirse solo por proximidad geográfica.',
      criterioExito: 'El alumno distingue presencia documentada de vacío del registro, y relaciona al menos un taxón con su región de hallazgo y su cronología.',
      tiempoEstimado: 15,
      modoCompatible: ['basico', 'universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CD'],
      odsPrimario: 'ODS4'
    },

    continentes: {
      preguntaActivacion: '¿Por qué el registro hominino de Asia no avanza al mismo ritmo que el de África? ¿Qué factores podrían explicar esas diferencias?',
      objetivoCognitivo: 'Comparar los ritmos de dispersión y diversificación hominina por continente identificando vacíos y asimetrías del registro fósil',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'map'],
      productoEsperado: 'Una comparación de dos continentes con una diferencia de ritmo, registro o tipo de evidencia, justificada con datos del atlas.',
      criterioExito: 'El alumno nombra al menos dos diferencias entre continentes y atribuye una de ellas a un factor metodológico (sesgo del registro) en lugar de a una ausencia real.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    africa: {
      preguntaActivacion: '¿Es África una unidad homogénea en el registro hominino, o hay regiones con patrones muy distintos? ¿Qué región del atlas tiene mayor densidad de yacimientos y por qué?',
      objetivoCognitivo: 'Analizar la heterogeneidad del registro africano distinguiendo regiones, métodos de datación y niveles de consenso científico',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'map'],
      productoEsperado: 'Un mapa mental región→yacimiento→método→cautela para explicar por qué África no es un bloque uniforme en el registro paleoantropológico.',
      criterioExito: 'El alumno identifica al menos tres regiones africanas con patrones distintos y señala el método de datación predominante en cada una.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    asia: {
      preguntaActivacion: '¿Qué evidencia tenemos de que Homo sapiens se mezcló con poblaciones arcaicas en Asia? ¿Esa evidencia viene del fósil, del ADN o de ambos?',
      objetivoCognitivo: 'Diferenciar tipos de evidencia (morfológica, genómica, proteómica) para evaluar hipótesis de dispersión y mezcla en Asia oriental e insular',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'map', 'genomica'],
      productoEsperado: 'Una explicación de la dispersión asiática con una ruta, un caso de evidencia biomolecular o fósil y una cautela explícita sobre taxonomía o mezcla.',
      criterioExito: 'El alumno diferencia ADN directo, inferencia poblacional y evidencia morfológica en al menos un caso asiático concreto.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    europe: {
      preguntaActivacion: '¿Qué hace de Atapuerca un yacimiento metodológicamente único? ¿Es la cantidad de fósiles, los métodos de datación, o ambos?',
      objetivoCognitivo: 'Analizar el registro europeo distinguiendo poblamientos, continuidad regional y mezcla genómica mediante evidencia estratigráfica y biomolecular',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'map', 'estratigrafia'],
      productoEsperado: 'Una explicación del registro europeo centrada en Atapuerca o los neandertales: evidencia, cronología, grado de consenso y una cautela sobre taxonomía u origen.',
      criterioExito: 'El alumno separa Pleistoceno inferior, medio y superior con al menos un yacimiento por período, y señala el método de datación de cada uno.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS4'
    },

    america: {
      preguntaActivacion: '¿Cómo se demuestra que los humanos llegaron a América antes de Clovis? ¿Qué tipo de evidencia sería suficiente para cambiar el consenso actual?',
      objetivoCognitivo: 'Evaluar hipótesis de poblamiento americano contrastando tipos de evidencia y niveles de consenso científico',
      nivelBloom: 5, // Evaluar
      prerequisitos: ['timeline', 'map', 'datacion'],
      productoEsperado: 'Un argumento sobre el poblamiento americano: pre-Clovis vs. Clovis, tipo de evidencia, grado de consenso y una cautela metodológica.',
      criterioExito: 'El alumno distingue qué evidencias son aceptadas por el consenso y cuáles siguen siendo objeto de debate, con al menos un caso documentado de cada categoría.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    /* ─────────────────────────────────────────────────────────────────
       FAMILIA: INTERPRETAR — vistas de análisis relacional
       ───────────────────────────────────────────────────────────────── */

    tree: {
      preguntaActivacion: '¿Qué diferencia hay entre un árbol genealógico y un árbol filogenético? ¿Por qué esa distinción importa cuando estudiamos homininos?',
      objetivoCognitivo: 'Interpretar las relaciones de ancestro-descendiente en un cladograma básico identificando clados mayores y sus rasgos compartidos',
      nivelBloom: 2, // Comprender
      prerequisitos: ['timeline'],
      productoEsperado: 'Una explicación de una rama del árbol: qué taxones agrupa, qué rasgo comparten y qué simplificación hay que evitar al leer el árbol.',
      criterioExito: 'El alumno identifica correctamente los cuatro clados principales (basal, australopitecos, parántropos, Homo) y nombra un rasgo diagnóstico de cada uno.',
      tiempoEstimado: 15,
      modoCompatible: ['basico', 'universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS4'
    },

    phylo: {
      preguntaActivacion: '¿Por qué los expertos no se ponen de acuerdo en el árbol filogenético de los homininos? ¿Es un problema de datos, de métodos, o de ambos?',
      objetivoCognitivo: 'Interpretar afinidades filogenéticas, discontinuidades y nodos inciertos en un cladograma analítico diferenciando sinapomorfías de plesiomorfías',
      nivelBloom: 3, // Aplicar → Analizar
      prerequisitos: ['tree', 'timeline'],
      productoEsperado: 'Una hipótesis filogenética justificada: dos afinidades argumentadas y una incertidumbre reconocida con su causa (datos fragmentarios, debate metodológico, etc.).',
      criterioExito: 'El alumno diferencia sinapomorfía de plesiomorfía en al menos un nodo y señala qué tipo de evidencia resolvería la incertidumbre identificada.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    biogeo: {
      preguntaActivacion: '¿Puede la distribución geográfica de un taxón extinción explicarse solo por el clima, o intervienen otros factores? Propón un ejemplo con datos del atlas.',
      objetivoCognitivo: 'Relacionar distribución espacial, cronología y persistencia regional de los taxones homininos en un marco biogeográfico',
      nivelBloom: 4, // Analizar
      prerequisitos: ['map', 'contexto', 'timeline'],
      productoEsperado: 'Una lectura espacio-tiempo: expansión, aislamiento o vacío del registro, con evidencia concreta y una distinción entre ausencia real y sesgo de muestreo.',
      criterioExito: 'El alumno cruza al menos dos variables (región, edad, taxón) y argumenta si la distribución observada refleja realidad paleoecológica o sesgo del registro.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS13'
    },

    contexto: {
      preguntaActivacion: '¿Cómo afecta un cambio climático brusco a la diversidad de especies homininas? ¿Podemos hablar de causalidad o solo de correlación?',
      objetivoCognitivo: 'Relacionar eventos ambientales con cambios en el registro hominino formulando hipótesis con grado de certeza explícito',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'africa'],
      productoEsperado: 'Una conexión ambiente-evolución formulada como hipótesis (no como causa automática): evento, taxón afectado, tipo de evidencia y nivel de certeza.',
      criterioExito: 'El alumno distingue correlación de causalidad en al menos un par evento-taxón y asigna un nivel de certeza (alta, media, especulativa) a su hipótesis.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS13'
    },

    clima: {
      preguntaActivacion: '¿Qué evento climático del Plio-Pleistoceno coincide con el mayor número de extinciones de homininos? ¿Es una coincidencia o hay mecanismo documentado?',
      objetivoCognitivo: 'Interpretar proxies climáticos (δ¹⁸O, series EPICA/CENOGRID) relacionando eventos con cambios en la diversidad hominina',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'africa', 'contexto'],
      productoEsperado: 'Una interpretación de un cambio climático y su posible relación con un taxón o coexistencia, con el nivel de certeza de la inferencia.',
      criterioExito: 'El alumno identifica correctamente la dirección del cambio climático (aridificación, enfriamiento) y lo vincula a al menos un taxón con justificación.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS13'
    },

    coexistencias: {
      preguntaActivacion: '¿Coexistir significa compartir el mismo espacio o solo el mismo período de tiempo? ¿Qué evidencia distinguiría contacto real de simple solapamiento cronológico?',
      objetivoCognitivo: 'Analizar patrones de coexistencia temporal y espacial distinguiendo solapamiento cronológico, contacto documentado y evidencia de interacción',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'map'],
      productoEsperado: 'Una respuesta a "¿convivieron?" distinguiendo solapamiento temporal, contacto probable y evidencia directa de interacción (genómica, artefactual o fósil).',
      criterioExito: 'El alumno diferencia tres niveles de certeza (solapamiento, contacto probable, interacción documentada) y aplica la distinción a al menos un par de taxones.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS4'
    },

    /* ─────────────────────────────────────────────────────────────────
       FAMILIA: INVESTIGAR — vistas de análisis especializado
       ───────────────────────────────────────────────────────────────── */

    revisiones: {
      preguntaActivacion: '¿Por qué cambia el nombre científico de una especie? ¿Es siempre porque se descubre un fósil nuevo, o pueden cambiar los métodos de análisis sin hallazgos nuevos?',
      objetivoCognitivo: 'Analizar revisiones taxonómicas identificando el tipo de evidencia que las motiva y su relación con el marco teórico vigente',
      nivelBloom: 4, // Analizar
      prerequisitos: ['phylo', 'debates'],
      productoEsperado: 'Una mini-historia de cambio científico: qué nombre cambió, por qué, con qué evidencia y qué debate permanece abierto.',
      criterioExito: 'El alumno distingue revisiones motivadas por nuevos fósiles, por análisis genómicos y por reinterpretación metodológica, con un ejemplo de cada tipo.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    genomica: {
      preguntaActivacion: '¿Qué porcentaje aproximado de ADN neandertal tiene la población europea actual? ¿Ese porcentaje convierte a los neandertales en "ancestros directos" o en algo más complejo?',
      objetivoCognitivo: 'Evaluar críticamente las implicaciones de la evidencia genómica para la definición de especie y la comprensión de la introgresión arcaica',
      nivelBloom: 5, // Evaluar
      prerequisitos: ['phylo', 'introgresion', 'coexistencias'],
      productoEsperado: 'Una conclusión sobre ADN antiguo o introgresión con una cautela explícita sobre lo que el genoma no puede mostrar por sí solo.',
      criterioExito: 'El alumno diferencia ADN directo de inferencia poblacional y explica por qué la presencia de ADN arcaico no equivale a "relación directa ancestro-descendiente".',
      tiempoEstimado: 30,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS10'
    },

    primatologia: {
      preguntaActivacion: '¿En qué se parece la conducta social de los chimpancés a la de los homininos extintos? ¿Qué problemas metodológicos tiene usar primates vivos como modelo del pasado?',
      objetivoCognitivo: 'Evaluar la validez y los límites metodológicos de los modelos comparativos basados en primates vivos para inferir conducta hominina',
      nivelBloom: 5, // Evaluar
      prerequisitos: ['tree', 'contexto'],
      productoEsperado: 'Una analogía comparativa válida y su límite: qué enseña el primate vivo sobre el pasado y qué no puede demostrar sin evidencia fósil directa.',
      criterioExito: 'El alumno distingue homología de analogía en al menos un rasgo conductual y especifica el puente metodológico necesario para extrapolar al registro fósil.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    datacion: {
      preguntaActivacion: '¿Qué método de datación usarías para fechar un yacimiento con material orgánico de 40.000 años? ¿Y para uno con basalto volcánico de 2 Ma? ¿Por qué no pueden intercambiarse?',
      objetivoCognitivo: 'Aplicar criterios de selección de métodos cronométricos según el material, el rango temporal y el margen de error admisible',
      nivelBloom: 3, // Aplicar
      prerequisitos: ['timeline'],
      productoEsperado: 'Una elección razonada de método: rango temporal cubierto, material fechable, margen de error y límite conocido del método.',
      criterioExito: 'El alumno selecciona correctamente el método para dos casos distintos y justifica por qué el método alternativo no es adecuado en cada caso.',
      tiempoEstimado: 20,
      modoCompatible: ['basico', 'universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS4'
    },

    debates: {
      preguntaActivacion: '¿Cuál es la diferencia entre una hipótesis fuerte y una especulación en ciencia? Elige una controversia del atlas y clasifica cada argumento.',
      objetivoCognitivo: 'Evaluar argumentos científicos distinguiendo consenso, hipótesis robusta y especulación según el tipo y la cantidad de evidencia disponible',
      nivelBloom: 5, // Evaluar
      prerequisitos: ['phylo', 'revisiones'],
      productoEsperado: 'Una tabla de dos tesis: evidencia a favor, evidencia en contra y estado actual del consenso según el atlas.',
      criterioExito: 'El alumno clasifica correctamente tres argumentos de una controversia en: dato, inferencia y especulación; y asigna nivel de consenso a cada tesis.',
      tiempoEstimado: 30,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    holotipos: {
      preguntaActivacion: '¿Qué es un ejemplar holotipo y qué ocurre si se destruye o se pierde? ¿Puede nombrarse una especie nueva sin uno?',
      objetivoCognitivo: 'Comprender la función nomenclatural de los holotipos y su relación con las instituciones de custodia y el código zoológico',
      nivelBloom: 2, // Comprender
      prerequisitos: ['revisiones'],
      productoEsperado: 'Una ficha de ejemplar tipo: institución custodio, material conservado, valor nomenclatural y límite de inferencia que impone la muestra.',
      criterioExito: 'El alumno identifica el holotipo de tres taxones, la institución que los custodia y explica por qué el material limita o amplía las inferencias posibles.',
      tiempoEstimado: 15,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS4'
    },

    yacimientos: {
      preguntaActivacion: '¿Por qué Olduvai Gorge o la cueva de Wonderwerk tienen más valor metodológico que muchos otros yacimientos con más fósiles? ¿Qué convierte un sitio en "referencia"?',
      objetivoCognitivo: 'Analizar el valor metodológico de los yacimientos homininos relacionando estratigrafía, técnicas de datación y taxones asociados',
      nivelBloom: 4, // Analizar
      prerequisitos: ['timeline', 'estratigrafia', 'datacion'],
      productoEsperado: 'Una ficha de yacimiento con hallazgo principal, perfil estratigráfico, método de datación y una pregunta que el yacimiento no puede responder todavía.',
      criterioExito: 'El alumno relaciona la estratigrafía del yacimiento con el método de datación aplicado y justifica por qué ese método es el más adecuado para ese caso.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    dispersal: {
      preguntaActivacion: '¿Las dispersiones de Homo fuera de África fueron un proceso continuo o episódico? ¿Qué evidencia del atlas apoya cada interpretación?',
      objetivoCognitivo: 'Interpretar patrones de dispersión hominina relacionando rutas, cronología y condiciones ambientales en una secuencia visual',
      nivelBloom: 3, // Aplicar
      prerequisitos: ['map', 'coexistencias', 'clima'],
      productoEsperado: 'Una explicación oral o escrita de una ruta de dispersión con su cronología, pausa en un momento clave y cautela sobre el grado de certeza.',
      criterioExito: 'El alumno describe una ruta con al menos tres hitos temporales y distingue qué está documentado de lo que es inferido a partir del modelo.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CD', 'CCL'],
      odsPrimario: 'ODS4'
    },

    constructor: {
      preguntaActivacion: '¿Podrías construir el árbol filogenético de los homininos usando solo datos morfológicos? ¿Qué cambiaría si usaras solo datos genómicos? ¿Coincidirían los árboles?',
      objetivoCognitivo: 'Construir y defender una hipótesis filogenética propia a partir de caracteres morfológicos seleccionados, comparándola con hipótesis publicadas',
      nivelBloom: 6, // Crear
      prerequisitos: ['phylo', 'coexistencias', 'debates'],
      productoEsperado: 'Un árbol hipotético propio con justificación escrita de tres decisiones de agrupamiento y una revisión crítica de sus puntos débiles.',
      criterioExito: 'El árbol tiene coherencia topológica (sin politomías sin justificar), el alumno defiende al menos dos nodos con evidencia y reconoce una incertidumbre.',
      tiempoEstimado: 40,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    estratigrafia: {
      preguntaActivacion: '¿Un perfil estratigráfico puede tener "páginas arrancadas"? ¿Qué significaría eso para las inferencias cronológicas que hacemos a partir de él?',
      objetivoCognitivo: 'Leer e interpretar perfiles estratigráficos como argumentos temporales distinguiendo datación absoluta, relativa y biocronología',
      nivelBloom: 3, // Aplicar → Analizar
      prerequisitos: ['datacion', 'timeline'],
      productoEsperado: 'Una lectura de perfil estratigráfico: capas ordenadas, método de datación de cada una y una pregunta que el registro no puede responder aún.',
      criterioExito: 'El alumno ordena correctamente cinco capas estratigráficas, asigna un método a cada una y señala un hiato estratigráfico con su implicación metodológica.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL'],
      odsPrimario: 'ODS4'
    },

    tafonomia: {
      preguntaActivacion: '¿Por qué encontramos tan pocos cráneos de homininos completos? Nombra tres factores que expliquen qué partes del esqueleto tienen mayor probabilidad de preservarse.',
      objetivoCognitivo: 'Comprender los sesgos tafonómicos del registro fósil y su impacto en la validez de las inferencias anatómicas y conductuales',
      nivelBloom: 2, // Comprender → Analizar
      prerequisitos: ['timeline'],
      productoEsperado: 'Un análisis de sesgo tafonómico: dadas unas condiciones, qué elementos esqueléticos sobrevivirían, qué inferencias serían válidas y qué quedaría fuera del alcance.',
      criterioExito: 'El alumno predice correctamente qué tres regiones esqueléticas tienen mayor tasa de supervivencia y justifica la predicción con factores tafonómicos específicos.',
      tiempoEstimado: 20,
      modoCompatible: ['basico', 'universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    introgresion: {
      preguntaActivacion: '¿Qué porcentaje de ADN neandertal o denisovano llevamos los humanos modernos? ¿Eso significa que los neandertales no se extinguieron del todo?',
      objetivoCognitivo: 'Evaluar evidencias de flujo génico entre linajes homininos distinguiendo eventos documentados de inferencias provisionales',
      nivelBloom: 5, // Evaluar
      prerequisitos: ['genomica', 'coexistencias'],
      productoEsperado: 'Una explicación de un evento de introgresión: linajes implicados, porcentaje de herencia, período estimado, rasgo adaptativo conocido y grado de certeza.',
      criterioExito: 'El alumno distingue introgresión documentada (DOI verificado, porcentaje con error) de hipótesis provisional, y explica al menos un rasgo adaptativo transmitido.',
      tiempoEstimado: 25,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS10'
    },

    paleoecologia: {
      preguntaActivacion: '¿Puede un hominino vivir en dos biomas distintos a lo largo de su rango temporal? ¿Qué evidencia necesitaríamos para demostrarlo?',
      objetivoCognitivo: 'Sintetizar datos de biomas, períodos MIS y taxones para construir hipótesis paleoambientales con grado de certeza explícito',
      nivelBloom: 6, // Crear → Evaluar
      prerequisitos: ['clima', 'contexto', 'africa'],
      productoEsperado: 'Una celda del matrix paleoecológico justificada: bioma, período MIS, taxón, yacimiento de referencia y nivel de certeza de la asignación.',
      criterioExito: 'El alumno elige una celda y defiende la asignación paleoambiental con al menos dos líneas de evidencia (proxy climático + registro fósil asociado).',
      tiempoEstimado: 30,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['STEM', 'CCL', 'CPSAA'],
      odsPrimario: 'ODS13'
    },

    /* ─────────────────────────────────────────────────────────────────
       FAMILIA: APRENDER — vistas de uso docente y argumentación
       ───────────────────────────────────────────────────────────────── */

    socratico: {
      preguntaActivacion: '¿Cuál es la diferencia entre afirmar "H. floresiensis era una especie distinta" y tener evidencia suficiente para sostener esa afirmación científicamente?',
      objetivoCognitivo: 'Formular argumentos científicos en formato AERC (afirmación, evidencia, razonamiento, cautela) y refutar posiciones contrarias con evidencia del atlas',
      nivelBloom: 5, // Evaluar
      prerequisitos: ['timeline', 'phylo', 'debates'],
      productoEsperado: 'Un argumento escrito en formato AERC: afirmación clara, evidencia citada, razonamiento explícito y cautela proporcional al grado de consenso.',
      criterioExito: 'El argumento diferencia dato de inferencia en al menos dos puntos y asigna un nivel de certeza (alto, medio, provisional) a su afirmación principal.',
      tiempoEstimado: 35,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['CCL', 'STEM', 'CPSAA', 'CC'],
      odsPrimario: 'ODS4'
    },

    aula: {
      preguntaActivacion: '¿Qué diferencia hay entre "usar PaleoBot en clase" y "diseñar una actividad evaluable con PaleoBot"? ¿Qué necesita el segundo para funcionar?',
      objetivoCognitivo: 'Diseñar secuencias de aprendizaje con el atlas que incluyan objetivo, recurso, actividad y criterio de evaluación competencial',
      nivelBloom: 6, // Crear
      prerequisitos: [],
      productoEsperado: 'Una secuencia de clase: objetivo de aprendizaje, vista del atlas utilizada, actividad propuesta y criterio de evaluación observable.',
      criterioExito: 'La secuencia incluye un objetivo con verbo de acción, una vista concreta del atlas, un producto del alumno y un criterio de éxito no subjetivo.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['CCL', 'STEM', 'CPSAA', 'CD'],
      odsPrimario: 'ODS4'
    },

    recursos: {
      preguntaActivacion: '¿Cuál de los recursos del atlas usarías para preparar un debate sobre la extinción de los neandertales? ¿Y para preparar una ficha de yacimiento evaluable?',
      objetivoCognitivo: 'Seleccionar y articular recursos del atlas con propósitos didácticos concretos diferenciando tipo de tarea y producto esperado',
      nivelBloom: 3, // Aplicar
      prerequisitos: ['aula'],
      productoEsperado: 'Un recurso elegido con uso concreto: para qué tarea específica sirve, qué competencia activa y qué producto genera en el alumno.',
      criterioExito: 'El alumno relaciona el recurso con un objetivo de aprendizaje concreto y propone un criterio de evaluación para el producto generado.',
      tiempoEstimado: 15,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['CCL', 'CD', 'CPSAA'],
      odsPrimario: 'ODS4'
    },

    itinerarios: {
      preguntaActivacion: '¿Qué diferencia hay entre navegar el atlas libremente y seguir un itinerario didáctico? ¿Cuándo es mejor cada enfoque?',
      objetivoCognitivo: 'Planificar y seguir rutas de aprendizaje estructuradas que combinen vistas del atlas en secuencia pedagógicamente justificada',
      nivelBloom: 3, // Aplicar
      prerequisitos: ['aula', 'timeline'],
      productoEsperado: 'Un recorrido de aprendizaje con inicio (vista y pregunta), dos paradas intermedias (vista + evidencia) y un producto final evaluable.',
      criterioExito: 'El itinerario conecta al menos tres vistas de forma justificada y el producto final es específico y evaluable con los criterios del atlas.',
      tiempoEstimado: 20,
      modoCompatible: ['universitario', 'doctorado'],
      competenciasLOMLOE: ['CCL', 'STEM', 'CPSAA'],
      odsPrimario: 'ODS4'
    }
  };

  /* ══════════════════════════════════════════════════════════════════
     B. FUNCIONES DE ACCESO AL SPEC
     ─────────────────────────────────────────────────────────────────
     API pública mínima para que las fases 2-4 consuman el spec
     sin acoplarse a la estructura interna del objeto.
     ══════════════════════════════════════════════════════════════════ */

  /**
   * Retorna el contrato pedagógico de una vista, o null si no existe.
   * @param {string} viewId - ID de la vista (e.g. 'timeline', 'genomica')
   * @returns {object|null}
   */
  function getViewSpec(viewId) {
    return VIEW_DIDACTIC_SPEC[viewId] || null;
  }

  /**
   * Retorna todas las vistas compatibles con un modo de complejidad dado.
   * Ordena por nivel de Bloom ascendente (camino natural de aprendizaje).
   * @param {string} modo - 'basico' | 'universitario' | 'doctorado'
   * @returns {Array.<{id:string, spec:object}>}
   */
  function getViewsByMode(modo) {
    return Object.entries(VIEW_DIDACTIC_SPEC)
      .filter(([, spec]) => spec.modoCompatible.includes(modo))
      .map(([id, spec]) => ({ id, spec }))
      .sort((a, b) => a.spec.nivelBloom - b.spec.nivelBloom);
  }

  /**
   * Retorna la etiqueta textual del nivel de Bloom de una vista.
   * @param {string} viewId
   * @returns {string}
   */
  function getBloomLabel(viewId) {
    const LABELS = {
      1: 'Recordar / Comprender',
      2: 'Comprender',
      3: 'Aplicar',
      4: 'Analizar',
      5: 'Evaluar',
      6: 'Crear'
    };
    const spec = getViewSpec(viewId);
    return spec ? (LABELS[spec.nivelBloom] || 'Recordar') : 'Sin especificar';
  }

  /**
   * Retorna el nivel de Bloom máximo alcanzado en un conjunto de vistas visitadas.
   * Usado por la Fase 3 (SessionSynthesisPanel) para construir el resumen.
   * @param {string[]} visitedViews - IDs de vistas visitadas en la sesión
   * @returns {{maxBloom: number, label: string, viewsContributing: string[]}}
   */
  function getSessionBloomSummary(visitedViews) {
    let maxBloom = 0;
    const contributing = [];
    visitedViews.forEach(id => {
      const spec = getViewSpec(id);
      if (spec && spec.nivelBloom > maxBloom) {
        maxBloom = spec.nivelBloom;
      }
      if (spec && spec.nivelBloom >= 4) contributing.push(id);
    });
    return {
      maxBloom,
      label: getBloomLabel(maxBloom > 0 ? visitedViews.find(id => getViewSpec(id)?.nivelBloom === maxBloom) : null) || 'Sin datos',
      viewsContributing: contributing
    };
  }

  /**
   * Sugiere la próxima vista en el camino de aprendizaje,
   * basándose en los prerequisitos no visitados del spec.
   * @param {string} currentView
   * @param {string[]} visitedViews
   * @param {string} modo - modo de complejidad activo
   * @returns {string|null} ID de la vista sugerida o null
   */
  function suggestNextView(currentView, visitedViews, modo) {
    // 1. Buscar vistas con prerequisitos cumplidos y no visitadas
    const visited = new Set(visitedViews);
    const candidates = Object.entries(VIEW_DIDACTIC_SPEC)
      .filter(([id, spec]) => {
        if (visited.has(id)) return false;
        if (!spec.modoCompatible.includes(modo)) return false;
        return spec.prerequisitos.every(pre => visited.has(pre));
      })
      .map(([id, spec]) => ({ id, bloom: spec.nivelBloom }))
      .sort((a, b) => a.bloom - b.bloom);

    if (candidates.length > 0) return candidates[0].id;

    // 2. Fallback: VIEW_CONTEXT_NEXT si existe
    if (typeof VIEW_CONTEXT_NEXT !== 'undefined' && VIEW_CONTEXT_NEXT[currentView]) {
      const fallbacks = VIEW_CONTEXT_NEXT[currentView].filter(id => !visited.has(id));
      if (fallbacks.length > 0) return fallbacks[0];
    }
    return null;
  }

  /* ══════════════════════════════════════════════════════════════════
     C. BANNER DE ACTIVACIÓN DIDÁCTICA (no bloqueante)
     ─────────────────────────────────────────────────────────────────
     Muestra la pregunta de activación al entrar en una vista por
     primera vez en la sesión. Desaparece sola (8s) o al cerrar.
     Diseño: strip superior dentro de la vista, sin modal.
     ══════════════════════════════════════════════════════════════════ */

  /** Clave de sessionStorage para vistas ya activadas */
  const SESSION_KEY = 'pb_didactic_activated';

  /** Obtiene el conjunto de vistas ya activadas en esta sesión */
  function _getActivatedViews() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  /** Marca una vista como activada en esta sesión */
  function _markViewActivated(viewId) {
    try {
      const set = _getActivatedViews();
      set.add(viewId);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
    } catch {
      /* Silencioso en iOS privado — no crítico */
    }
  }

  /**
   * Inyecta el banner de activación en la vista indicada si:
   *   a) La vista tiene spec definido
   *   b) No ha sido activada ya en esta sesión
   * @param {string} viewId
   */
  function injectActivationBanner(viewId) {
    const spec = getViewSpec(viewId);
    if (!spec) return;

    const activated = _getActivatedViews();
    if (activated.has(viewId)) return;

    const section = document.getElementById('view-' + viewId);
    if (!section) return;

    // Eliminar banner previo si existe (cambio de vista sin recarga)
    const old = section.querySelector('.pb-didactic-banner');
    if (old) old.remove();

    /* Construir el banner con textContent seguro (anti-XSS) */
    const banner = document.createElement('aside');
    banner.className = 'pb-didactic-banner';
    banner.setAttribute('role', 'note');
    banner.setAttribute('aria-label', 'Pregunta de activación didáctica');

    // Barra superior de color según nivel de Bloom
    const bloomColors = {
      1: '#0e7f65', // verde — recordar/comprender
      2: '#0e7f65',
      3: '#1a4fa0', // azul — aplicar
      4: '#c07800', // ámbar — analizar
      5: '#aa1f1f', // rojo — evaluar
      6: '#6b3faa'  // violeta — crear
    };
    const bloomColor = bloomColors[spec.nivelBloom] || '#1c2b3a';

    const metaRow = document.createElement('div');
    metaRow.className = 'pb-banner-meta';

    const bloomBadge = document.createElement('span');
    bloomBadge.className = 'pb-banner-bloom';
    bloomBadge.style.background = bloomColor;
    bloomBadge.textContent = 'Bloom ' + spec.nivelBloom + ' · ' + getBloomLabel(viewId);

    const timeBadge = document.createElement('span');
    timeBadge.className = 'pb-banner-time';
    timeBadge.textContent = '⏱ ' + spec.tiempoEstimado + ' min';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'pb-banner-close';
    closeBtn.setAttribute('aria-label', 'Cerrar pregunta de activación');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => _dismissBanner(banner, viewId));

    metaRow.appendChild(bloomBadge);
    metaRow.appendChild(timeBadge);
    metaRow.appendChild(closeBtn);

    const question = document.createElement('p');
    question.className = 'pb-banner-question';
    question.textContent = spec.preguntaActivacion;

    const productRow = document.createElement('div');
    productRow.className = 'pb-banner-product';
    const productLabel = document.createElement('strong');
    productLabel.textContent = 'Producto esperado: ';
    const productText = document.createTextNode(spec.productoEsperado);
    productRow.appendChild(productLabel);
    productRow.appendChild(productText);

    banner.style.borderTopColor = bloomColor;
    banner.appendChild(metaRow);
    banner.appendChild(question);
    banner.appendChild(productRow);

    // Insertar inmediatamente después del .view-hero si existe, o al inicio
    const hero = section.querySelector('.view-hero');
    if (hero && hero.nextSibling) {
      section.insertBefore(banner, hero.nextSibling);
    } else {
      section.prepend(banner);
    }

    // Auto-dismiss tras 12 segundos
    const timer = setTimeout(() => _dismissBanner(banner, viewId), 12000);
    banner.dataset.timerId = timer;

    _markViewActivated(viewId);
    log('Banner activado para vista:', viewId);
  }

  /** Anima y elimina el banner, registrando la activación */
  function _dismissBanner(banner, viewId) {
    if (!banner || banner.dataset.dismissed) return;
    banner.dataset.dismissed = '1';
    clearTimeout(Number(banner.dataset.timerId));
    banner.classList.add('pb-banner-exit');
    setTimeout(() => banner.remove(), 380);
  }

  /* ── CSS del banner (inyectado una sola vez) ─────────────────────── */
  function _injectBannerStyles() {
    if (document.getElementById('pb-didactic-spec-style')) return;
    const style = document.createElement('style');
    style.id = 'pb-didactic-spec-style';
    style.textContent = `
      /* ── PaleoBot · Panel de activación didáctica ───────────────── */
      .pb-didactic-banner {
        margin: 0 0 18px;
        padding: 14px 16px 12px;
        border-radius: 0 0 16px 16px;
        border: 1px solid rgba(216,212,204,0.9);
        border-top: 4px solid var(--accent);
        background: linear-gradient(135deg, #f8fcfa 0%, #fffdf5 100%);
        box-shadow: 0 6px 18px rgba(28,43,58,0.07);
        animation: pbBannerIn 0.32s cubic-bezier(.22,.68,0,1.2) both;
      }
      @keyframes pbBannerIn {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .pb-banner-exit {
        animation: pbBannerOut 0.36s ease forwards;
      }
      @keyframes pbBannerOut {
        to { opacity: 0; transform: translateY(-8px); max-height: 0; margin: 0; padding: 0; }
      }
      .pb-banner-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .pb-banner-bloom {
        display: inline-block;
        font-family: var(--font-mono, monospace);
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: white;
        padding: 3px 9px;
        border-radius: 999px;
      }
      .pb-banner-time {
        font-family: var(--font-mono, monospace);
        font-size: 0.7rem;
        color: var(--text-hint, #6b7a8d);
        background: rgba(28,43,58,0.06);
        border-radius: 999px;
        padding: 3px 9px;
        border: 1px solid rgba(28,43,58,0.1);
      }
      .pb-banner-close {
        margin-left: auto;
        border: none;
        background: transparent;
        color: var(--text-hint, #6b7a8d);
        font-size: 0.8rem;
        cursor: pointer;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.14s, color 0.14s;
        flex-shrink: 0;
      }
      .pb-banner-close:hover {
        background: rgba(170,31,31,0.1);
        color: #aa1f1f;
      }
      .pb-banner-close:focus-visible {
        outline: 2px solid var(--accent, #0e7f65);
        outline-offset: 2px;
      }
      .pb-banner-question {
        font-family: var(--font-serif, Georgia, serif);
        font-size: 1.02rem;
        font-weight: 600;
        color: var(--primary, #1c2b3a);
        line-height: 1.55;
        margin: 0 0 9px;
      }
      .pb-banner-product {
        font-size: 0.84rem;
        color: var(--text-sec, #4a5a6e);
        line-height: 1.5;
        padding: 8px 10px;
        background: rgba(14,127,101,0.07);
        border-radius: 8px;
        border-left: 3px solid var(--accent, #0e7f65);
      }
      .pb-banner-product strong {
        color: var(--primary, #1c2b3a);
      }
      @media (max-width: 480px) {
        .pb-banner-question { font-size: 0.93rem; }
      }
      @media (prefers-reduced-motion: reduce) {
        .pb-didactic-banner, .pb-banner-exit {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════════════════════
     D. INTEGRACIÓN CON EL ROUTER DE VISTAS
     ─────────────────────────────────────────────────────────────────
     Escucha el evento de cambio de vista del sistema existente.
     Patrón: MutationObserver sobre la clase 'active' en .view-section,
     compatible con la arquitectura de switchView() existente sin
     modificar su código (patrón no-destructivo del proyecto).
     ══════════════════════════════════════════════════════════════════ */

  let _currentObservedView = null;

  /** Manejador seguro de cambio de vista */
  function _onViewChange(viewId) {
    if (!viewId || viewId === _currentObservedView) return;
    _currentObservedView = viewId;
    log('Vista activa detectada:', viewId);
    try {
      injectActivationBanner(viewId);
    } catch (err) {
      warn('Error al inyectar banner:', err);
    }
  }

  /** Observa el atributo aria-hidden / clase visible en las secciones de vista */
  function _initViewObserver() {
    // Fase 1: NO usa MutationObserver (evita bucle de mutaciones sobre body).
    // La detección de cambio de vista la gestiona Fase 2 via 'paleobot:viewchange'.
    // Aquí solo hacemos la activación inicial de la vista cargada al inicio.
    const initial = document.querySelector('.view-section.active') ||
                    document.querySelector('.view-section:not([style*="display: none"]):not([hidden])');
    if (initial) {
      const id = initial.id?.replace(/^view-/, '');
      if (id) setTimeout(() => _onViewChange(id), 700);
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     E. EXTENSIÓN DEL AUDIT REPORT
     ─────────────────────────────────────────────────────────────────
     Extiende buildSelfAuditReport() con una verificación de cobertura
     del spec: qué vistas tienen contrato pedagógico y cuáles no.
     ══════════════════════════════════════════════════════════════════ */

  function _extendAuditReport() {
    if (typeof buildSelfAuditReport !== 'function') return;
    const _orig = buildSelfAuditReport;
    buildSelfAuditReport = function () {
      const report = _orig();
      try {
        // Vistas registradas en el sistema
        const allViews = typeof VIEW_META !== 'undefined'
          ? Object.keys(VIEW_META)
          : Object.keys(VIEW_HERO_META || {});
        const withSpec = allViews.filter(id => VIEW_DIDACTIC_SPEC[id]);
        const withoutSpec = allViews.filter(id => !VIEW_DIDACTIC_SPEC[id]);
        const pct = allViews.length > 0
          ? Math.round((withSpec.length / allViews.length) * 100)
          : 0;

        report.push({
          label: 'Spec didáctico (Fase 1 SDD)',
          status: withoutSpec.length === 0 ? 'ok' : 'warn',
          value: withoutSpec.length === 0
            ? `${withSpec.length}/${allViews.length} vistas con contrato pedagógico (100%)`
            : `${withSpec.length}/${allViews.length} vistas (${pct}%). Sin spec: ${withoutSpec.join(', ')}`
        });

        // Verificar coherencia de prerequisitos
        const badPrereqs = [];
        Object.entries(VIEW_DIDACTIC_SPEC).forEach(([id, spec]) => {
          spec.prerequisitos.forEach(pre => {
            if (!VIEW_DIDACTIC_SPEC[pre]) {
              badPrereqs.push(`${id}→${pre}`);
            }
          });
        });
        report.push({
          label: 'Prerequisitos spec (Fase 1)',
          status: badPrereqs.length === 0 ? 'ok' : 'warn',
          value: badPrereqs.length === 0
            ? 'Todos los prerequisitos referencian vistas existentes en el spec.'
            : 'Prerequisitos con referencia no resuelta: ' + badPrereqs.join(', ')
        });
      } catch (auditErr) {
        warn('Error en extensión de audit:', auditErr);
      }
      return report;
    };
    log('buildSelfAuditReport extendido con verificaciones de spec didáctico.');
  }

  /* ══════════════════════════════════════════════════════════════════
     F. EXPOSICIÓN DE API PÚBLICA
     ─────────────────────────────────────────────────────────────────
     Las fases 2, 3 y 4 consumen estas funciones desde window.
     ══════════════════════════════════════════════════════════════════ */

  window.PB_DidacticSpec = {
    /** Contrato pedagógico completo de una vista */
    getViewSpec,
    /** Vistas compatibles con un modo, ordenadas por Bloom */
    getViewsByMode,
    /** Etiqueta textual del nivel de Bloom */
    getBloomLabel,
    /** Resumen de nivel de Bloom alcanzado en una sesión */
    getSessionBloomSummary,
    /** Sugerencia de próxima vista según prerequisitos y modo */
    suggestNextView,
    /** Inyecta manualmente el banner en una vista */
    injectActivationBanner,
    /** Objeto spec completo (solo lectura, para debugging) */
    _spec: Object.freeze(VIEW_DIDACTIC_SPEC)
  };

  /* ══════════════════════════════════════════════════════════════════
     G. INICIALIZACIÓN
     ══════════════════════════════════════════════════════════════════ */

  function _init() {
    try {
      _injectBannerStyles();
      _initViewObserver();
      _extendAuditReport();
      log('Fase 1 SDD inicializada. Vistas con spec:', Object.keys(VIEW_DIDACTIC_SPEC).length);
    } catch (initErr) {
      warn('Error en inicialización de Fase 1:', initErr);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    // DOM ya listo (script insertado antes de </body>)
    _init();
  }

})(); /* fin PaleoBotV65_Phase1 */
