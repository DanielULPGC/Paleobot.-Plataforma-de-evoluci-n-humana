/* ══════════════════════════════════════════════════════════════════════
   Atlas de paleoantropología · Fuente única de datos (datos.js)

   Corpus centralizado y reutilizable por todas las vistas del atlas (línea del
   tiempo, cladograma, fichas, etc.). Las referencias están NORMALIZADAS: cada
   táxon apunta a identificadores de la tabla `fuentes`, de modo que una cita se
   corrige en un único lugar y la trazabilidad queda garantizada.

   RIGOR DE DATOS. Los rangos temporales (en millones de años, Ma) son
   APROXIMADOS, están redondeados y son revisables: dependen del yacimiento, del
   método de datación y de hallazgos futuros. Proceden de la compilación
   revisada por pares de Wood y Boyle (2016); las anclas de mayor carga
   probatoria se remiten además a su estudio primario con DOI verificado en
   fuente original. No se presentan como valores definitivos.

   Licencia CC BY-NC 4.0 · Facultad de Ciencias de la Educación · ULPGC.
   ══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // Referencias bibliográficas (DOI verificado en fuente primaria).
  var fuentes = {
    woodBoyle2016: {
      cita: 'Wood, B., y Boyle, E. K. (2016). Hominin taxic diversity: Fact or fantasy? American Journal of Physical Anthropology, 159(S61), S37-S78.',
      doi: '10.1002/ajpa.22902'
    },
    brunet2002: {
      cita: 'Brunet, M., et al. (2002). A new hominid from the Upper Miocene of Chad, Central Africa. Nature, 418(6894), 145-151.',
      doi: '10.1038/nature00879'
    },
    white2009: {
      cita: 'White, T. D., et al. (2009). Ardipithecus ramidus and the paleobiology of early hominids. Science, 326(5949), 75-86.',
      doi: '10.1126/science.1175802'
    },
    woldegabriel2009: {
      cita: 'WoldeGabriel, G., et al. (2009). The geological, isotopic, botanical, invertebrate, and lower vertebrate surroundings of Ardipithecus ramidus. Science, 326(5949), 65e1-65e5.',
      doi: '10.1126/science.1175817'
    },
    green2010: {
      cita: 'Green, R. E., et al. (2010). A draft sequence of the Neandertal genome. Science, 328(5979), 710-722.',
      doi: '10.1126/science.1188021'
    },
    deinoRenneSwisher1998: {
      cita: 'Deino, A. L., Renne, P. R., y Swisher, C. C. (1998). 40Ar/39Ar dating in paleoanthropology and archeology. Evolutionary Anthropology, 6(2), 63-75.',
      doi: '10.1002/(SICI)1520-6505(1998)6:2<63::AID-EVAN4>3.0.CO;2-X'
    },
    blasco2022: {
      cita: 'Blasco, R. (2022). Quaternary taphonomy: understanding the past through traces. Scientific Reports, 12, 7112.',
      doi: '10.1038/s41598-022-10473-9'
    },
    potts1998ea: {
      cita: 'Potts, R. (1998). Variability selection in hominid evolution. Evolutionary Anthropology, 7(3), 81-96.',
      doi: '10.1002/(SICI)1520-6505(1998)7:3<81::AID-EVAN3>3.0.CO;2-A'
    },
    potts1998ajpa: {
      cita: 'Potts, R. (1998). Environmental hypotheses of hominin evolution. American Journal of Physical Anthropology, 107(S27), 93-136.',
      doi: '10.1002/(SICI)1096-8644(1998)107:27+<93::AID-AJPA5>3.0.CO;2-X'
    },
    pottsFaith2015: {
      cita: 'Potts, R., y Faith, J. T. (2015). Alternating high and low climate variability: the context of natural selection and speciation in Plio-Pleistocene hominin evolution. Journal of Human Evolution, 87, 5-20.',
      doi: '10.1016/j.jhevol.2015.06.014'
    },
    hublin2017: {
      cita: 'Hublin, J.-J., et al. (2017). New fossils from Jebel Irhoud, Morocco and the pan-African origin of Homo sapiens. Nature, 546(7657), 289-292.',
      doi: '10.1038/nature22336'
    },
    richter2017: {
      cita: 'Richter, D., et al. (2017). The age of the hominin fossils from Jebel Irhoud, Morocco, and the origins of the Middle Stone Age. Nature, 546(7657), 293-296.',
      doi: '10.1038/nature22335'
    },
    dirks2017: {
      cita: 'Dirks, P. H. G. M., et al. (2017). The age of Homo naledi and associated sediments in the Rising Star Cave, South Africa. eLife, 6, e24231.',
      doi: '10.7554/eLife.24231'
    },
    sutikna2016: {
      cita: 'Sutikna, T., et al. (2016). Revised stratigraphy and chronology for Homo floresiensis at Liang Bua in Indonesia. Nature, 532(7599), 366-369.',
      doi: '10.1038/nature17179'
    },
    martinonTorres2023: {
      cita: 'Martinón-Torres, M., Garate, D., Herries, A. I. R., y Petraglia, M. D. (2023). No scientific evidence that Homo naledi buried their dead and produced rock art. Journal of Human Evolution, 103464.',
      doi: '10.1016/j.jhevol.2023.103464'
    },
    veatch2026: {
      cita: 'Veatch, E. G., et al. (2026). Taphonomic analysis at Liang Bua reveals the behavioral and technological capabilities of Homo floresiensis. Science Advances.',
      doi: '10.1126/sciadv.aeb7219'
    },
    detroit2019: {
      cita: 'Détroit, F., Mijares, A. S., Corny, J., Daver, G., Zanolli, C., Dizon, E., Robles, E., Grün, R., y Piper, P. J. (2019). A new species of Homo from the Late Pleistocene of the Philippines. Nature, 568(7751), 181-186.',
      doi: '10.1038/s41586-019-1067-9'
    },
    ji2021: {
      cita: 'Ji, Q., Wu, W., Ji, Y., Li, Q., y Ni, X. (2021). Late Middle Pleistocene Harbin cranium represents a new Homo species. The Innovation, 2(3), 100132.',
      doi: '10.1016/j.xinn.2021.100132'
    },
    white2003idaltu: {
      cita: 'White, T. D., Asfaw, B., DeGusta, D., Gilbert, H., Richards, G. D., Suwa, G., y Howell, F. C. (2003). Pleistocene Homo sapiens from Middle Awash, Ethiopia. Nature, 423(6941), 742-747.',
      doi: '10.1038/nature01669'
    },
    roksandic2022: {
      cita: 'Roksandic, M., Radović, P., Wu, X.-J., y Bae, C. J. (2022). Resolving the muddle in the middle: the case for Homo bodoensis sp. nov. Evolutionary Anthropology, 31(1), 20-29.',
      doi: '10.1002/evan.21929'
    },
    gebo1997: {
      cita: 'Gebo, D. L., et al. (1997). A hominoid genus from the early Miocene of Uganda. Science, 276(5311), 401-404.',
      doi: '10.1126/science.276.5311.401'
    },
    maclatchy2000: {
      cita: 'MacLatchy, L., et al. (2000). The positional behavior of Morotopithecus bishopi. Journal of Human Evolution, 39(2), 159-183.',
      doi: '10.1006/jhev.2000.0407'
    },
    moyaSola2004: {
      cita: 'Moyà-Solà, S., et al. (2004). Pierolapithecus catalaunicus, a new Middle Miocene great ape from Spain. Science, 306(5700), 1339-1344.',
      doi: '10.1126/science.1103094'
    },
    alba2012: {
      cita: 'Alba, D. M. (2012). Fossil apes from the Vallès-Penedès Basin. Evolutionary Anthropology, 21(6), 254-269.',
      doi: '10.1002/evan.21312'
    },
    moyaSola2009: {
      cita: 'Moyà-Solà, S., et al. (2009). A unique Middle Miocene European hominoid and the origins of the great ape and human clade. PNAS, 106(24), 9601-9606.',
      doi: '10.1073/pnas.0811730106'
    },
    kunimatsu2007: {
      cita: 'Kunimatsu, Y., et al. (2007). A new Late Miocene great ape from Kenya and its implications for the origins of African great apes and humans. PNAS, 104(49), 19220-19225.',
      doi: '10.1073/pnas.0706190104'
    },
    suwa2007: {
      cita: 'Suwa, G., et al. (2007). A new species of great ape from the late Miocene epoch in Ethiopia. Nature, 448, 921-924.',
      doi: '10.1038/nature06113'
    },
    katoh2016: {
      cita: 'Katoh, S., et al. (2016). New geological and palaeontological age constraint for the gorilla-human lineage split. Nature, 530, 215-218.',
      doi: '10.1038/nature16510'
    },
    bohme2017: {
      cita: 'Böhme, M., et al. (2017). Messinian age and savannah environment of the possible hominin Graecopithecus from Europe. PLOS ONE, 12(5), e0177347.',
      doi: '10.1371/journal.pone.0177347'
    },
    fuss2017: {
      cita: 'Fuss, J., et al. (2017). Potential hominin affinities of Graecopithecus from the Late Miocene of Europe. PLOS ONE, 12(5), e0177127.',
      doi: '10.1371/journal.pone.0177127'
    },
    wuAthreya2013: {
      cita: 'Wu, X.-J., y Athreya, S. (2013). A description of the geological context, discrete traits, and linear morphometrics of the Middle Pleistocene hominin from Dali, Shaanxi Province, China. American Journal of Physical Anthropology, 150(1), 141-157.',
      doi: '10.1002/ajpa.22188'
    },
    athreyaWu2017: {
      cita: 'Athreya, S., y Wu, X.-J. (2017). A multivariate assessment of the Dali hominin cranium from China. American Journal of Physical Anthropology, 164(4), 679-701.',
      doi: '10.1002/ajpa.23305'
    },
    wuBae2025: {
      cita: 'Wu, X.-J., y Bae, C. J. (2025). The Xujiayao hominin: a new form of large brained hominin in eastern Asia. PaleoAnthropology, 2025(2), 1011.',
      doi: '10.48738/2025.iss2.1011'
    },
    chang2015: {
      cita: 'Chang, C.-H., et al. (2015). The first archaic Homo from Taiwan. Nature Communications, 6, 6037.',
      doi: '10.1038/ncomms7037'
    },
    tsutaya2025: {
      cita: 'Tsutaya, T., et al. (2025). A male Denisovan mandible from Pleistocene Taiwan. Science.',
      doi: '10.1126/science.ads3888'
    },
    mcdougall2005: {
      cita: 'McDougall, I., Brown, F. H., y Fleagle, J. G. (2005). Stratigraphic placement and age of modern humans from Kibish, Ethiopia. Nature, 433, 733-736.',
      doi: '10.1038/nature03258'
    },
    vidal2022: {
      cita: 'Vidal, C. M., et al. (2022). Age of the oldest known Homo sapiens from eastern Africa. Nature, 601, 579-583.',
      doi: '10.1038/s41586-021-04275-8'
    },
    krause2010: {
      cita: 'Krause, J., et al. (2010). The complete mitochondrial DNA genome of an unknown hominin from southern Siberia. Nature, 464, 894-897.',
      doi: '10.1038/nature08976'
    },
    reich2010: {
      cita: 'Reich, D., et al. (2010). Genetic history of an archaic hominin group from Denisova Cave in Siberia. Nature, 468, 1053-1060.',
      doi: '10.1038/nature09710'
    },
    chen2019: {
      cita: 'Chen, F., et al. (2019). A late Middle Pleistocene Denisovan mandible from the Tibetan Plateau. Nature, 569, 409-412.',
      doi: '10.1038/s41586-019-1139-x'
    }
  };

  // Clados. El color se expresa como token CSS para preservar el tema.
  var clados = {
    basales: { nombre: 'Hominoideos miocenos y formas basales', color: 'var(--c-basales)' },
    austra:  { nombre: 'Australopithecus', color: 'var(--c-austra)' },
    kenya:   { nombre: 'Kenyanthropus', color: '#7d8fb3' },
    paran:   { nombre: 'Paranthropus', color: 'var(--c-paran)' },
    homo:    { nombre: 'Homo', color: 'var(--c-homo)' }
  };

  // Táxones. desde = límite más antiguo; hasta = más reciente (0 = presente).
  // fuentes = lista de identificadores de la tabla `fuentes`.
  var taxones = [
    { id:'proconsul', n:'Proconsul', c:'basales', desde:23.0, hasta:14.0, debatido:true,
      nota:'Hominoideo africano del Mioceno temprano y medio incluido como contexto evolutivo. No es un hominino y su posición interna varía entre análisis.',
      fuentes:['woodBoyle2016'] },
    { id:'morotopithecus', n:'Morotopithecus bishopi', c:'basales', desde:20.6, hasta:20.0, debatido:true,
      nota:'Hominoideo del Mioceno temprano de Uganda. Su anatomía axial ha sido relevante para discutir el origen de la postura ortógrada, pero su posición filogenética sigue debatida.',
      fuentes:['gebo1997','maclatchy2000'] },
    { id:'dryopithecus', n:'Dryopithecus', c:'basales', desde:12.0, hasta:9.0, debatido:true,
      nota:'Género de grandes simios europeos del Mioceno. Se incorpora como contexto de la radiación de hominoideos, no como antepasado humano directo demostrado.',
      fuentes:['woodBoyle2016','alba2012'] },
    { id:'pierolapithecus', n:'Pierolapithecus catalaunicus', c:'basales', desde:12.5, hasta:11.9, debatido:true,
      nota:'Hominoideo del Mioceno medio de Cataluña con un mosaico de rasgos asociados a la locomoción ortógrada. Su relación con los grandes simios actuales es discutida.',
      fuentes:['moyaSola2004','alba2012'] },
    { id:'anoiapithecus', n:'Anoiapithecus brevirostris', c:'basales', desde:11.9, hasta:11.8, debatido:true,
      nota:'Hominoideo del Vallès-Penedès con rostro muy corto. Su interpretación filogenética y su valor como género diferenciado permanecen en discusión.',
      fuentes:['moyaSola2009','alba2012'] },
    { id:'nakalipithecus', n:'Nakalipithecus nakayamai', c:'basales', desde:9.9, hasta:9.8, debatido:true,
      nota:'Gran simio del Mioceno tardío de Kenia. Aporta evidencia africana al debate sobre el origen de los grandes simios africanos y humanos.',
      fuentes:['kunimatsu2007'] },
    { id:'chororapithecus', n:'Chororapithecus abyssinicus', c:'basales', desde:8.0, hasta:7.8, debatido:true,
      nota:'Hominoideo etíope conocido principalmente por dientes. Se ha propuesto una afinidad con el linaje de los gorilas, interpretación todavía controvertida.',
      fuentes:['suwa2007','katoh2016'] },
    { id:'graecopithecus', n:'Graecopithecus freybergi', c:'basales', desde:7.24, hasta:7.18, debatido:true,
      nota:'Hominoideo del Mioceno final de Grecia y Bulgaria. Su propuesta como posible hominino es muy discutida y no constituye un consenso.',
      fuentes:['bohme2017','fuss2017'] },
    { id:'sahelanthropus', n:'Sahelanthropus tchadensis', c:'basales', desde:7.2, hasta:6.8, debatido:true,
      nota:'Uno de los táxones más antiguos atribuidos a la línea humana. Su condición de hominino es objeto de debate.',
      fuentes:['brunet2002'] },
    { id:'orrorin', n:'Orrorin tugenensis', c:'basales', desde:6.1, hasta:5.7,
      nota:'Restos del Mioceno superior de Kenia, con indicios de bipedismo temprano.',
      fuentes:['woodBoyle2016'] },
    { id:'ardipithecus', n:'Ardipithecus ramidus', c:'basales', desde:4.5, hasta:4.3,
      nota:'Esqueleto parcial (Ardi) del Afar etíope, datado por 40Ar/39Ar en 4,4 Ma. Ilumina la paleobiología previa a Australopithecus.',
      fuentes:['white2009','woldegabriel2009'] },
    { id:'anamensis', n:'Australopithecus anamensis', c:'austra', desde:4.2, hasta:3.8,
      nota:'Considerado ancestro probable de A. afarensis.',
      fuentes:['woodBoyle2016'] },
    { id:'afarensis', n:'Australopithecus afarensis', c:'austra', desde:3.9, hasta:2.9,
      nota:'Especie de Lucy. Bipedismo consolidado con capacidades arbóreas.',
      fuentes:['woodBoyle2016'] },
    { id:'africanus', n:'Australopithecus africanus', c:'austra', desde:3.3, hasta:2.1,
      nota:'Primer australopiteco descrito (Taung, Sudáfrica).',
      fuentes:['woodBoyle2016'] },
    { id:'boisei', n:'Paranthropus boisei', c:'paran', desde:2.3, hasta:1.2,
      nota:'Robusto, con gran aparato masticatorio adaptado a dietas duras.',
      fuentes:['woodBoyle2016'] },
    { id:'robustus', n:'Paranthropus robustus', c:'paran', desde:2.0, hasta:1.2,
      nota:'Forma robusta sudafricana, coetánea de los primeros Homo.',
      fuentes:['woodBoyle2016'] },
    { id:'habilis', n:'Homo habilis', c:'homo', desde:2.4, hasta:1.5,
      nota:'Asociado a las primeras industrias líticas olduvayenses.',
      fuentes:['woodBoyle2016'] },
    { id:'erectus', n:'Homo erectus', c:'homo', desde:1.9, hasta:0.1,
      nota:'Amplia distribución y larga persistencia; primera salida sostenida de África.',
      fuentes:['woodBoyle2016'] },
    { id:'heidelbergensis', n:'Homo heidelbergensis', c:'homo', desde:0.7, hasta:0.2,
      nota:'Forma del Pleistoceno medio, vinculada al origen de neandertales y sapiens según distintas hipótesis.',
      fuentes:['woodBoyle2016'] },
    { id:'naledi', n:'Homo naledi', c:'homo', desde:0.335, hasta:0.236, debatido:true,
      nota:'Hallado en la cámara de Dinaledi (Sudáfrica); mosaico de rasgos primitivos y derivados. Su datación en 236-335 ka revela que un homínino de morfología primitiva persistió hasta el Pleistoceno tardío. El equipo de Rising Star le ha atribuido enterramientos deliberados y grabados, afirmaciones fuertemente contestadas en la literatura revisada por pares.',
      fuentes:['dirks2017','martinonTorres2023'] },
    { id:'neanderthalensis', n:'Homo neanderthalensis', c:'homo', desde:0.43, hasta:0.04,
      nota:'Neandertales. El ADN antiguo documenta flujo génico con poblaciones de sapiens no africanas.',
      fuentes:['green2010'] },
    { id:'floresiensis', n:'Homo floresiensis', c:'homo', desde:0.10, hasta:0.06, debatido:true,
      nota:'Forma de talla reducida de la isla de Flores. Su cronología fue revisada a 100-60 ka para los restos esqueléticos. Un estudio tafonómico de 2026 atribuye a los dragones de Komodo el acceso primario a los grandes herbívoros del yacimiento, lo que matiza las conductas avanzadas que antes se le suponían.',
      fuentes:['sutikna2016','veatch2026'] },
    { id:'sapiens', n:'Homo sapiens', c:'homo', desde:0.3, hasta:0.0,
      nota:'Nuestra especie. Los fósiles más antiguos conocidos, como los de Jebel Irhoud (Marruecos), se sitúan hacia 0,3 Ma, lo que apunta a un origen panafricano.',
      fuentes:['hublin2017','richter2017'] },
    { id:'kadabba', n:'Ardipithecus kadabba', c:'basales', desde:5.8, hasta:5.2,
      nota:'Del Mioceno final del Afar etíope; conocido sobre todo por dientes y fragmentos poscraneales. A veces se considera subespecie de Ar. ramidus.',
      fuentes:['woodBoyle2016'] },
    { id:'platyops', n:'Kenyanthropus platyops', c:'kenya', desde:3.5, hasta:3.3, debatido:true,
      nota:'Cráneo de rostro plano del oeste de Turkana. Su validez como género propio está discutida: podría ser una variante de A. afarensis o reflejar distorsión tafonómica.',
      fuentes:['woodBoyle2016'] },
    { id:'bahrelghazali', n:'Australopithecus bahrelghazali', c:'austra', desde:3.6, hasta:3.0, debatido:true,
      nota:'Hallado en Chad (Abel), lejos del Rift, lo que amplía la distribución de los australopitecos hacia el centro de África. Su validez específica es discutida.',
      fuentes:['woodBoyle2016'] },
    { id:'garhi', n:'Australopithecus garhi', c:'austra', desde:2.6, hasta:2.5,
      nota:'Del Awash medio (Etiopía); se ha relacionado con las primeras evidencias de uso de herramientas y procesamiento de carcasas.',
      fuentes:['woodBoyle2016'] },
    { id:'sediba', n:'Australopithecus sediba', c:'austra', desde:2.0, hasta:1.95,
      nota:'De Malapa (Sudáfrica); mosaico de rasgos de Australopithecus y de Homo, con datación en torno a 1,98 Ma.',
      fuentes:['woodBoyle2016'] },
    { id:'aethiopicus', n:'Paranthropus aethiopicus', c:'paran', desde:2.7, hasta:2.3,
      nota:'Forma robusta más antigua, representada por el «cráneo negro» (KNM-WT 17000) del oeste de Turkana.',
      fuentes:['woodBoyle2016'] },
    { id:'rudolfensis', n:'Homo rudolfensis', c:'homo', desde:2.4, hasta:1.8,
      nota:'Homo temprano de rostro ancho (KNM-ER 1470); su distinción respecto de H. habilis es objeto de debate.',
      fuentes:['woodBoyle2016'] },
    { id:'ergaster', n:'Homo ergaster', c:'homo', desde:1.9, hasta:1.4,
      nota:'Homo temprano africano de cuerpo moderno; con frecuencia se considera la forma africana de H. erectus.',
      fuentes:['woodBoyle2016'] },
    { id:'antecessor', n:'Homo antecessor', c:'homo', desde:1.2, hasta:0.8,
      nota:'Del Pleistoceno inferior de Atapuerca (Gran Dolina, España); primer hominino europeo bien documentado, con evidencias de canibalismo.',
      fuentes:['woodBoyle2016'] },
    { id:'luzonensis', n:'Homo luzonensis', c:'homo', desde:0.067, hasta:0.05,
      nota:'Descrito en 2019 a partir de restos de la cueva de Callao (Luzón, Filipinas), datados hacia 67 ka. Combina rasgos primitivos y derivados y refuerza el papel del sudeste asiático insular.',
      fuentes:['detroit2019'] },
    { id:'longi', n:'Homo longi', c:'homo', desde:0.309, hasta:0.146, debatido:true,
      nota:'Propuesto en 2021 sobre el cráneo de Harbin (China), datado en al menos 146 ka. Su denominación es discutida y se ha planteado su vínculo con los denisovanos.',
      fuentes:['ji2021'] },
    { id:'daliensis', n:'Homo daliensis', c:'homo', desde:0.30, hasta:0.25, debatido:true,
      nota:'Nombre propuesto para el cráneo de Dali (China). Su combinación de rasgos arcaicos y derivados es informativa, pero Homo daliensis no cuenta con aceptación taxonómica general.',
      fuentes:['wuAthreya2013','athreyaWu2017'] },
    { id:'juluensis', n:'Homo juluensis', c:'homo', desde:0.22, hasta:0.10, debatido:true,
      nota:'Hipótesis taxonómica reciente para agrupar fósiles del Pleistoceno medio y tardío de Asia oriental, incluidos los de Xujiayao. Se presenta como propuesta en revisión, no como especie consensuada.',
      fuentes:['wuBae2025'] },
    { id:'penghu', n:'Homo sp. (Penghu 1)', c:'homo', desde:0.19, hasta:0.01, debatido:true,
      nota:'Mandíbula fósil recuperada en el canal de Penghu, Taiwán. La paleoproteómica la relaciona con el linaje denisovano; Homo sp. indica que no se asigna aquí a una especie formal.',
      fuentes:['chang2015','tsutaya2025'] },
    { id:'deyiremeda', n:'Australopithecus deyiremeda', c:'austra', desde:3.5, hasta:3.3, debatido:true,
      nota:'Descrito en 2015 a partir de restos mandibulares del Afar; sugiere la coexistencia de varias especies de australopitecos. Su validez es debatida.',
      fuentes:['woodBoyle2016'] },
    { id:'prometheus', n:'Australopithecus prometheus', c:'austra', desde:3.7, hasta:3.3, debatido:true,
      nota:'Nombre aplicado al esqueleto de Little Foot (Sterkfontein, Sudáfrica). Su reconocimiento como especie distinta de A. africanus es objeto de fuerte controversia.',
      fuentes:['woodBoyle2016'] },
    { id:'gautengensis', n:'Homo gautengensis', c:'homo', desde:2.0, hasta:0.8, debatido:true,
      nota:'Propuesto en 2010 para restos sudafricanos atribuidos antes a Homo habilis; su validez está discutida.',
      fuentes:['woodBoyle2016'] },
    { id:'georgicus', n:'Homo georgicus', c:'homo', desde:1.85, hasta:1.77, debatido:true,
      nota:'Nombre aplicado a los fósiles de Dmanisi (Georgia), la salida más temprana de África documentada. Con frecuencia se incluye en un Homo erectus de sentido amplio.',
      fuentes:['woodBoyle2016'] },
    { id:'rhodesiensis', n:'Homo rhodesiensis', c:'homo', desde:0.6, hasta:0.3, debatido:true,
      nota:'Nombre del cráneo de Kabwe (Zambia). Su uso está en revisión: se ha propuesto abandonarlo, en parte por su asociación colonial, en favor de otras denominaciones.',
      fuentes:['woodBoyle2016'] },
    { id:'bodoensis', n:'Homo bodoensis', c:'homo', desde:0.77, hasta:0.13, debatido:true,
      nota:'Propuesto en 2021 como especie del Pleistoceno medio de distribución panafricana, para sustituir usos problemáticos de H. heidelbergensis y H. rhodesiensis. Su validez es contestada.',
      fuentes:['roksandic2022'] },
    { id:'cepranensis', n:'Homo cepranensis', c:'homo', desde:0.45, hasta:0.35, debatido:true,
      nota:'Nombre aplicado a un calvario del Pleistoceno medio de Ceprano (Italia); su estatus específico es discutido.',
      fuentes:['woodBoyle2016'] },
    { id:'helmei', n:'Homo helmei', c:'homo', desde:0.26, hasta:0.26, debatido:true,
      nota:'Nombre asociado al cráneo de Florisbad (Sudáfrica), a veces vinculado al origen de H. sapiens. Su validez es debatida.',
      fuentes:['woodBoyle2016'] },
    { id:'idaltu', n:'Homo sapiens idaltu', c:'homo', desde:0.16, hasta:0.154,
      nota:'Subespecie descrita en 2003 sobre cráneos de Herto (Afar, Etiopía), datados en 160-154 ka; considerada antecesora inmediata de los humanos anatómicamente modernos.',
      fuentes:['white2003idaltu'] },
    { id:'jebel_irhoud', n:'H. sapiens (Jebel Irhoud)', c:'homo', desde:0.315, hasta:0.300,
      nota:'Serie fósil marroquí fundamental para investigar las fases tempranas de Homo sapiens. Es una entrada paleopoblacional y no una especie distinta.',
      fuentes:['hublin2017','richter2017'] },
    { id:'omo_i', n:'H. sapiens (Omo I)', c:'homo', desde:0.233, hasta:0.200,
      nota:'Esqueleto parcial de Kibish, Etiopía, con una edad mínima revisada de unos 233 ka. Es un espécimen de Homo sapiens, no un taxón separado.',
      fuentes:['mcdougall2005','vidal2022'] },
    { id:'denisovanos', n:'Linaje denisovano', c:'homo', desde:0.20, hasta:0.05, debatido:true,
      nota:'Linaje humano arcaico identificado inicialmente por ADN antiguo y ampliado mediante fósiles y paleoproteómica. No se presenta como una especie formal ni bajo el nombre no consensuado Homo denisova.',
      fuentes:['krause2010','reich2010','chen2019'] },
    { id:'erectus_erectus', n:'Homo erectus erectus', c:'homo', desde:1.0, hasta:0.5,
      nota:'Subespecie nominal de Java (Trinil, Sangiran), sobre la que Dubois fundó en 1894 el género Pithecanthropus, hoy incluido en Homo erectus.',
      fuentes:['woodBoyle2016'] },
    { id:'erectus_pekinensis', n:'Homo erectus pekinensis', c:'homo', desde:0.78, hasta:0.4,
      nota:'Subespecie del este de Asia (Zhoukoudian, China), descrita por Black en 1927 como Sinanthropus pekinensis, hoy incluida en Homo erectus.',
      fuentes:['woodBoyle2016'] },
    { id:'erectus_soloensis', n:'Homo erectus soloensis', c:'homo', desde:0.14, hasta:0.10,
      nota:'Subespecie tardía de Ngandong (río Solo, Java), descrita por Oppenoorth en 1932; representa una persistencia tardía de Homo erectus en el sudeste asiático.',
      fuentes:['woodBoyle2016'] }
  ];

  var meta = {
    ejeMaxMa: 23.0,
    notaDatos: 'El atlas integra cincuenta y dos entradas taxonómicas y paleopoblacionales procedentes de sus dos recorridos. El corpus distingue especies y subespecies de hominoideos miocenos contextuales, linajes genéticos y series fósiles; por tanto, no todas las entradas equivalen a especies formales. El número de especies homininas es objeto de debate y depende de posturas más agrupadoras o más divisoras. Los rangos son aproximados, están redondeados en millones de años (Ma) y son revisables. Las propuestas controvertidas se marcan expresamente como debatidas y se anclan a bibliografía primaria.'
  };

  // Dimensión geográfica. ESCALA REGIONAL, no de yacimiento: las coordenadas son
  // centroides aproximados de la región principal de cada táxon, no ubicaciones
  // de excavación. Sirven para orientar, no como dato posicional preciso.
  var regiones = {
    victoria:  { nombre: 'Cuenca del lago Victoria, Kenia', lat: -0.5, lon: 34.5 },
    uganda:    { nombre: 'Moroto, Uganda', lat: 2.5, lon: 34.7 },
    cataluna:  { nombre: 'Vallès-Penedès, Cataluña', lat: 41.5, lon: 2.0 },
    nakali:    { nombre: 'Nakuru y Nakali, Kenia', lat: -0.4, lon: 36.2 },
    chorora:   { nombre: 'Chorora, Etiopía', lat: 9.5, lon: 40.2 },
    balcanes:  { nombre: 'Grecia y Bulgaria', lat: 41.5, lon: 24.0 },
    chad:      { nombre: 'Djurab, Chad', lat: 17, lon: 18 },
    tugen:     { nombre: 'Colinas Tugen, Kenia', lat: 1, lon: 36 },
    turkana:   { nombre: 'Rift oriental (Turkana y Olduvai)', lat: -1, lon: 36 },
    afar:      { nombre: 'Afar, Etiopía', lat: 11, lon: 40 },
    sudafrica: { nombre: 'Cuna de la Humanidad, Sudáfrica', lat: -26, lon: 28 },
    europa:    { nombre: 'Europa', lat: 47, lon: 8 },
    flores:    { nombre: 'Flores, Indonesia', lat: -8.6, lon: 121 },
    filipinas: { nombre: 'Luzón, Filipinas', lat: 17.7, lon: 121.8 },
    china:     { nombre: 'Harbin y China oriental', lat: 45.8, lon: 126.5 },
    shaanxi:   { nombre: 'Dali, Shaanxi, China', lat: 34.8, lon: 109.9 },
    xujiayao:  { nombre: 'Xujiayao, norte de China', lat: 40.1, lon: 113.9 },
    taiwan:    { nombre: 'Canal de Penghu, Taiwán', lat: 23.6, lon: 119.6 },
    magreb:    { nombre: 'Jebel Irhoud, Marruecos', lat: 31.9, lon: -8.9 },
    omo:       { nombre: 'Kibish, valle del Omo, Etiopía', lat: 5.4, lon: 35.9 },
    altai:     { nombre: 'Denisova y Asia interior', lat: 51.4, lon: 84.7 },
    java:      { nombre: 'Java, Indonesia', lat: -7.4, lon: 111 },
    caucaso:   { nombre: 'Dmanisi, Cáucaso (Georgia)', lat: 41.3, lon: 44.3 },
    africa:    { nombre: 'África (origen de H. sapiens)', lat: 6, lon: 20 }
  };
  var regionDe = {
    proconsul:'victoria', morotopithecus:'uganda', dryopithecus:'europa',
    pierolapithecus:'cataluna', anoiapithecus:'cataluna', nakalipithecus:'nakali',
    chororapithecus:'chorora', graecopithecus:'balcanes',
    sahelanthropus:'chad', orrorin:'tugen', ardipithecus:'afar', anamensis:'turkana',
    afarensis:'afar', africanus:'sudafrica', boisei:'turkana', robustus:'sudafrica',
    habilis:'turkana', erectus:'turkana', heidelbergensis:'europa', naledi:'sudafrica',
    neanderthalensis:'europa', floresiensis:'flores', sapiens:'africa',
    kadabba:'afar', platyops:'turkana', bahrelghazali:'chad', garhi:'afar', sediba:'sudafrica',
    aethiopicus:'turkana', rudolfensis:'turkana', ergaster:'turkana', antecessor:'europa',
    luzonensis:'filipinas', longi:'china', daliensis:'shaanxi', juluensis:'xujiayao',
    penghu:'taiwan', jebel_irhoud:'magreb', omo_i:'omo', denisovanos:'altai',
    deyiremeda:'afar', prometheus:'sudafrica', gautengensis:'sudafrica', georgicus:'caucaso',
    rhodesiensis:'africa', bodoensis:'africa', cepranensis:'europa', helmei:'sudafrica',
    idaltu:'afar', erectus_erectus:'java', erectus_pekinensis:'china', erectus_soloensis:'java'
  };
  var geoNota = {
    proconsul:'Género documentado en varios yacimientos del África oriental; el punto representa una región orientativa.',
    dryopithecus:'El género reúne material de distintos yacimientos europeos; la coordenada es regional.',
    graecopithecus:'Material atribuido en Grecia y Bulgaria; su afinidad hominina está fuertemente debatida.',
    juluensis:'Agrupación propuesta para material del este de Asia; no representa una distribución taxonómica consensuada.',
    penghu:'La mandíbula fue recuperada del fondo marino; la coordenada es aproximada.',
    denisovanos:'Linaje documentado genéticamente en Siberia y relacionado con fósiles de otras regiones de Asia.',
    afarensis:'Documentado también en Laetoli (Tanzania).',
    erectus:'De origen africano, se dispersó por Eurasia (por ejemplo, Dmanisi, en el Cáucaso, y Java).',
    heidelbergensis:'Registrado tanto en Europa como en África, según distintas interpretaciones.',
    neanderthalensis:'Presente también en Asia occidental.',
    sapiens:'Origen africano y posterior distribución mundial.',
    antecessor:'Documentado en el yacimiento de la Gran Dolina, sierra de Atapuerca (Burgos).',
    ergaster:'Representado también por fósiles del Rift oriental, como el niño de Turkana.'
  };
  taxones.forEach(function (t) { t.region = regionDe[t.id]; if (geoNota[t.id]) t.geoNota = geoNota[t.id]; });

  // Etimología del nombre (glosa filológica). Los nombres binomiales latinizan
  // raíces griegas, latinas, geográficas o patronímicas; su significado consta
  // en las descripciones originales y en la literatura de referencia.
  var etimologia = {
    proconsul: 'Nombre creado en referencia al célebre chimpancé de exhibición Consul; pro- indica anterioridad.',
    morotopithecus: '«Mono de Moroto», por el distrito ugandés y el griego píthēkos, «mono»; bishopi honra a W. W. Bishop.',
    dryopithecus: 'Del griego drýs, «roble», y píthēkos, «mono»: «mono de los robles».',
    pierolapithecus: '«Mono de Pierola», por Els Hostalets de Pierola; catalaunicus alude a Cataluña.',
    anoiapithecus: '«Mono de Anoia», por la comarca catalana; brevirostris significa «de rostro corto».',
    nakalipithecus: '«Mono de Nakali», por la localidad keniana; nakayamai honra al geólogo E. Nakayama.',
    chororapithecus: '«Mono de Chorora», por la formación etíope; abyssinicus remite a Abisinia.',
    graecopithecus: '«Mono griego»; freybergi honra a Bruno von Freyberg.',
    sahelanthropus: '«Hombre del Sahel» (del árabe sāḥil, "orilla", y el griego ánthropos, "hombre"); el epíteto tchadensis remite a Chad.',
    orrorin: '«Hombre original» en lengua tugen; el epíteto tugenensis alude a las colinas Tugen (Kenia).',
    ardipithecus: 'Del afar ardi, "suelo" o "raíz", y el griego píthēkos, "mono"; ramidus procede de ramid, "raíz" en afar.',
    anamensis: 'Del griego, «mono austral» (Australopithecus); anamensis deriva de anam, "lago" en lengua turkana, por el lago Turkana.',
    afarensis: '«Mono austral del Afar», por la depresión del Afar (Etiopía).',
    africanus: '«Mono austral africano», por el continente donde se halló.',
    boisei: 'Paranthropus, «junto al hombre» (griego pará y ánthropos); boisei honra al mecenas Charles Boise.',
    robustus: 'Paranthropus robustus, «robusto», por su morfología masticatoria recia.',
    habilis: 'Homo, «hombre»; habilis, «hábil», por su asociación con las primeras herramientas.',
    erectus: 'Homo erectus, «hombre erguido», por su postura bípeda plenamente establecida.',
    heidelbergensis: '«De Heidelberg», por la mandíbula de Mauer hallada cerca de esa ciudad alemana.',
    naledi: 'Homo naledi; naledi significa "estrella" en sesotho, por la cueva Rising Star (Sudáfrica).',
    neanderthalensis: '«Del valle de Neander» (Neandertal), en Alemania, donde se describió por primera vez.',
    floresiensis: '«De Flores», por la isla indonesia donde se descubrió.',
    sapiens: 'Homo sapiens, «hombre sabio» o «que sabe», del latín sapere, "saber".',
    kadabba: 'Del afar kadabba, "ancestro basal de una familia"; el género Ardipithecus combina ardi, "suelo", y el griego píthēkos, "mono".',
    platyops: 'Del griego platys, "plano", y óps, "rostro" (Kenyanthropus, «hombre de Kenia»), por su cara plana.',
    bahrelghazali: 'Por el Bahr el Ghazal, río estacional del Chad próximo al hallazgo.',
    garhi: 'Del afar garhi, "sorpresa", por lo inesperado del descubrimiento.',
    sediba: 'Del sesotho sediba, "manantial" o "fuente", por el yacimiento de Malapa.',
    aethiopicus: 'Paranthropus aethiopicus, «de Etiopía», región de procedencia de los primeros restos.',
    rudolfensis: 'Por el lago Rodolfo, nombre histórico del lago Turkana (Kenia).',
    ergaster: 'Del griego ergastḗs, "trabajador", en alusión a la fabricación de herramientas.',
    antecessor: 'Del latín antecessor, "explorador" o "el que va delante", como posible antepasado europeo.',
    luzonensis: '«De Luzón», por la isla filipina donde se descubrió.',
    longi: 'Del chino lóng, "dragón", por la provincia de Heilongjiang («río del dragón negro»); de ahí el apodo «hombre dragón».',
    daliensis: '«De Dali», por el condado de la provincia china de Shaanxi donde apareció el cráneo.',
    juluensis: 'Del chino jùlù, «cabeza enorme», en referencia a la gran capacidad craneal del material agrupado en la propuesta.',
    penghu: 'Penghu 1 es la designación del espécimen recuperado cerca del archipiélago taiwanés de Penghu; Homo sp. mantiene abierta su asignación específica.',
    deyiremeda: 'Del afar deyi, "cercano", y remeda, "pariente": «pariente cercano».',
    prometheus: 'Por Prometeo, el titán del fuego, en alusión a un supuesto uso temprano del fuego planteado al describir el material.',
    gautengensis: 'Por la provincia de Gauteng (Sudáfrica), donde se sitúan los yacimientos.',
    georgicus: 'Por Georgia, país donde se halla el yacimiento de Dmanisi.',
    rhodesiensis: 'Por Rhodesia del Norte, nombre colonial de Zambia; denominación hoy en revisión por su carga histórica.',
    bodoensis: 'Por Bodo (Etiopía), yacimiento del holotipo.',
    cepranensis: 'Por Ceprano (Italia), localidad del hallazgo.',
    helmei: 'En honor de A. Helme, vinculado al hallazgo de Florisbad (Sudáfrica).',
    idaltu: 'Del afar idaltu, "el mayor" o "anciano" o "primogénito", por su carácter ancestral.',
    jebel_irhoud: 'Designación geográfica de una serie de Homo sapiens procedente del yacimiento marroquí de Jebel Irhoud.',
    omo_i: 'Designación del primer individuo reconocido en la Formación Kibish, junto al río Omo, Etiopía.',
    denisovanos: 'Nombre informal derivado de la cueva de Denisova, en el macizo de Altái, donde se identificó genéticamente el linaje.',
    erectus_erectus: 'Homo erectus, «hombre erguido»; la repetición del epíteto marca la subespecie nominal de Java.',
    erectus_pekinensis: '«De Pekín», por el yacimiento de Zhoukoudian, próximo a esa ciudad; descrita como Sinanthropus, «hombre de China».',
    erectus_soloensis: '«Del Solo», por el río Solo (Java), junto al que se halló en Ngandong.'
  };
  taxones.forEach(function (t) { if (etimologia[t.id]) t.etimologia = etimologia[t.id]; });

  // Nombres históricos y sinónimos menores. La historia de la disciplina ha
  // propuesto numerosos géneros y especies hoy considerados sinónimos de táxones
  // válidos. Se recogen aquí, con su equivalencia actual, por su valor histórico
  // y para explicar por qué el recuento de "nombres" supera al de táxones válidos.
  var sinonimos = [
    { nombre: 'Pithecanthropus erectus', autor: 'Dubois, 1894', equivale: 'Homo erectus' },
    { nombre: 'Sinanthropus pekinensis', autor: 'Black, 1927', equivale: 'Homo erectus pekinensis' },
    { nombre: 'Javanthropus soloensis', autor: 'Oppenoorth, 1932', equivale: 'Homo erectus soloensis' },
    { nombre: 'Meganthropus palaeojavanicus', autor: 'von Koenigswald, 1950', equivale: 'Homo erectus (atribución discutida)' },
    { nombre: 'Atlanthropus mauritanicus', autor: 'Arambourg, 1954', equivale: 'Homo erectus' },
    { nombre: 'Telanthropus capensis', autor: 'Broom y Robinson, 1949', equivale: 'Homo ergaster / Homo erectus' },
    { nombre: 'Zinjanthropus boisei', autor: 'Leakey, 1959', equivale: 'Paranthropus boisei' },
    { nombre: 'Paraustralopithecus aethiopicus', autor: 'Arambourg y Coppens, 1968', equivale: 'Paranthropus aethiopicus' },
    { nombre: 'Praeanthropus africanus', autor: 'Weinert, 1950', equivale: 'Australopithecus afarensis' },
    { nombre: 'Cyphanthropus rhodesiensis', autor: 'Pycraft, 1928', equivale: 'Homo rhodesiensis' },
    { nombre: 'Plesianthropus transvaalensis', autor: 'Broom, 1936', equivale: 'Australopithecus africanus' },
    { nombre: 'Palaeoanthropus', autor: 'diversos autores', equivale: 'Homo neanderthalensis y formas afines' }
  ];



  // Métodos inferenciales de la disciplina. Cada uno con la pregunta que responde,
  // su fundamento, su aportación y sus límites, anclado a su referencia primaria.
  var metodos = [
    {
      id: 'datacion',
      nombre: 'Datación radiométrica',
      pregunta: '¿Cuántos años tiene?',
      como: 'Ciertos isótopos radiactivos se desintegran a un ritmo constante y conocido. Midiendo la proporción entre el isótopo original y el resultante se estima el tiempo transcurrido. En paleoantropología, los métodos de potasio-argón (K-Ar) y argón-argón (40Ar/39Ar) datan los minerales de las rocas volcánicas que envuelven los yacimientos del Rift.',
      aporta: 'Un marco cronológico absoluto que ordena el registro y permite comparar yacimientos distantes, condición sin la cual no hay línea del tiempo posible.',
      limita: 'Requiere materiales datables, como niveles volcánicos, próximos al fósil; cada método tiene un rango de aplicación y un margen de error, y fecha la roca asociada, no directamente el hueso.',
      fuentes: ['deinoRenneSwisher1998', 'woldegabriel2009']
    },
    {
      id: 'tafonomia',
      nombre: 'Tafonomía',
      pregunta: '¿Qué le ocurrió al resto entre la muerte y el hallazgo?',
      como: 'Estudia los procesos de descomposición, transporte, enterramiento, fosilización y alteración. Distingue las marcas de origen biológico o humano, como cortes o mordeduras, de las producidas por procesos físicos, químicos o geológicos posteriores.',
      aporta: 'Permite separar la señal, lo que el resto dice del organismo y de su conducta, del ruido introducido por el azar y el tiempo; es el paso previo para interpretar cualquier conjunto fósil.',
      limita: 'La reconstrucción es inferencial y a veces ambigua: procesos distintos pueden dejar marcas semejantes, un problema conocido como equifinalidad.',
      fuentes: ['blasco2022']
    },
    {
      id: 'adn',
      nombre: 'ADN antiguo (paleogenómica)',
      pregunta: '¿Qué relaciones genéticas hubo entre las poblaciones?',
      como: 'Recupera y secuencia fragmentos degradados de ADN conservados en restos antiguos y los compara con genomas actuales y de otros fósiles.',
      aporta: 'Documenta parentescos, mestizajes y flujo génico invisibles para la morfología; así se estableció el flujo génico entre neandertales y poblaciones de Homo sapiens no africanas.',
      limita: 'La conservación del ADN depende del clima y decae con el tiempo, lo que restringe su alcance a contextos favorables y a los últimos cientos de miles de años; además, existe riesgo de contaminación con material moderno.',
      fuentes: ['green2010']
    }
  ];

  // Bloque de clima y ecología. Ideas clave sobre el contexto paleoambiental de
  // la evolución humana, ancladas a estudios revisados por pares. La relación
  // clima-evolución se presenta como contexto y correlación, no como causa lineal.
  var clima = [
    {
      id: 'variabilidad',
      titulo: 'De un paisaje fijo a la variabilidad',
      idea: 'Las hipótesis clásicas explicaban la evolución humana por un hábitat concreto, como la sabana o el bosque, o por una tendencia única, como el enfriamiento o la aridez. Frente a ellas, la hipótesis de la selección por variabilidad sostiene que fue la propia inestabilidad ambiental, y no un entorno fijo, la que favoreció rasgos de versatilidad adaptativa, como la flexibilidad de la dieta, la movilidad y el aumento del cerebro.',
      fuentes: ['potts1998ea', 'potts1998ajpa']
    },
    {
      id: 'pulsos',
      titulo: 'Variabilidad alternante y ciclos orbitales',
      idea: 'Los registros del Rift oriental de África, como los isótopos de sedimentos marinos, el flujo de polvo, los sedimentos lacustres y los paleosuelos, muestran una alternancia de fases de alta y baja variabilidad, modulada por los ciclos orbitales de la insolación. Las apariciones y desapariciones de linajes y las innovaciones técnicas tienden a concentrarse en los intervalos de mayor variabilidad.',
      fuentes: ['pottsFaith2015']
    },
    {
      id: 'sesgo',
      titulo: 'El ambiente condiciona lo que se conserva',
      idea: 'El contexto ecológico no solo influyó en la evolución: también determina qué restos se conservan. Ciertos ambientes favorecen la fosilización, lo que introduce un sesgo en el registro y obliga a la cautela tafonómica. Por eso el clima se estudia junto con los métodos de datación y de análisis del contexto.',
      fuentes: ['potts1998ajpa']
    }
  ];

  global.AtlasPaleo = { meta: meta, clados: clados, fuentes: fuentes, regiones: regiones, taxones: taxones, sinonimos: sinonimos, metodos: metodos, clima: clima };
})(window);
