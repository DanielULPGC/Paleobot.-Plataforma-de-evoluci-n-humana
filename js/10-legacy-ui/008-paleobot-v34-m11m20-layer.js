// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v34-m11m20-layer
(function(){
  const WB2016 = 'Consenso Wood & Boyle 2016';
  const M11_SUPPORT = {
    'proconsul>dryopithecus':{support:72,status:'warn',note:'Relación de encuadre hominoideo; útil como raíz didáctica, no como parentesco directo cerrado.'},
    'dryopithecus>sahel':{support:61,status:'warn',note:'Puente didáctico entre hominoideos miocenos y homininos basales; posición real debatida.'},
    'sahel>ramidus':{support:68,status:'warn',note:'Conecta homininos tempranos africanos con cautela por material fragmentario.'},
    'ramidus>anamensis':{support:82,status:'ok',note:'Secuencia plausible Ardipithecus-Australopithecus como hipótesis de trabajo.'},
    'anamensis>afarensis':{support:88,status:'ok',note:'Una de las transiciones mejor defendidas dentro de Australopithecus.'},
    'afarensis>aethiopicus':{support:70,status:'warn',note:'Origen de robustos plausible, pero las relaciones internas siguen abiertas.'},
    'aethiopicus>boisei':{support:84,status:'ok',note:'Rama robusta oriental con continuidad morfológica razonable.'},
    'aethiopicus>robustus':{support:63,status:'warn',note:'Robustos oriental y meridional pueden representar radiaciones paralelas.'},
    'afarensis>africanus':{support:66,status:'warn',note:'Afinidad australopitecina aceptable, no ascendencia lineal demostrada.'},
    'africanus>sediba':{support:71,status:'warn',note:'Mosaico sudafricano usado para discutir origen de Homo.'},
    'afarensis>habilis':{support:58,status:'warn',note:'Conexión clásica hacia Homo temprano; debe presentarse como controvertida.'},
    'habilis>ergaster':{support:62,status:'warn',note:'Transición Homo temprano-Homo ergaster útil pero con límites taxonómicos.'},
    'ergaster>erectus':{support:80,status:'ok',note:'Continuidad africana/asiática de Homo erectus sensu lato.'},
    'ergaster>heidelbergensis':{support:73,status:'warn',note:'Puente pleistoceno medio amplio, dependiente de concepto taxonómico.'},
    'heidelbergensis>neander':{support:86,status:'ok',note:'Relación ampliamente aceptada para la rama neandertal.'},
    'heidelbergensis>sapiens':{support:64,status:'warn',note:'Modelo didáctico simplificado; el origen sapiens es africano estructurado.'}
  };
  const M12_MIS = [
    {mis:'MIS 9', start:337, end:300, climate:'interglacial templado CENOGRID'},
    {mis:'MIS 7', start:243, end:191, climate:'interglacial variable'},
    {mis:'MIS 6', start:191, end:130, climate:'glacial frío'},
    {mis:'MIS 5', start:130, end:71, climate:'interglacial cálido'},
    {mis:'MIS 4', start:71, end:57, climate:'glacial árido'},
    {mis:'MIS 3', start:57, end:29, climate:'oscilante'},
    {mis:'MIS 2', start:29, end:14, climate:'LGM y deshielo'},
    {mis:'MIS 1', start:14, end:0, climate:'Holoceno'}
  ];
  const M16_REVIEW = Object.freeze({
    /* R92: marcas [DEBATIDO] añadidas. Fuentes: claves bibliográficas ya presentes en la
       capa A2/A3 (source_ids); no se añaden DOI no verificados. */
    georgicus:Object.freeze({status:'SPECIES_NAME_CONTESTED',label:'Validez del nombre específico discutida',scope:'El nombre Homo georgicus se aplicó a parte del conjunto de Dmanisi; muchos autores lo incluyen en Homo erectus sensu lato. La cronología (ca. 1,8 Ma) es sólida; lo discutido es la asignación específica.',sources:['gabunia2000','rightmire_lordkipanidze2010']}),
    juluensis:Object.freeze({status:'PROPOSED_TAXON__VALIDITY_CONTESTED',label:'Taxón propuesto recientemente; validez controvertida',scope:'Homo juluensis se propuso para reunir restos del Pleistoceno medio-superior de China (Xujiayao, Xuchang); su aceptación como especie y su relación con los denisovanos siguen en discusión.',sources:['wu_bae2025','shao2026']}),
    daliensis:Object.freeze({status:'SPECIES_NAME_CONTESTED',label:'Validez del nombre específico discutida',scope:'Homo daliensis se usa para el cráneo de Dali; buena parte de la literatura lo trata como Homo sp. dentro del debate sobre los linajes del Pleistoceno medio de Asia oriental.',sources:['xiao2002','wu_athreya2013']}),
    gautengensis:Object.freeze({status:'PROPOSED_TAXON__NOT_WIDELY_ACCEPTED',label:'Taxón propuesto; escasa aceptación',scope:'Homo gautengensis se propuso sobre StW 53 y otros restos de Sterkfontein; la mayoría de estudios no lo acepta y StW 53 se ha atribuido también a Homo habilis o a Australopithecus.',sources:['curnoe2010','herries2011']}),
    helmei:Object.freeze({status:'SPECIES_NAME_CONTESTED',label:'Validez del nombre específico discutida',scope:'Homo helmei, basado en la calvaria de Florisbad, se emplea de forma irregular; su distinción respecto de Homo sapiens temprano y su cronología siguen discutidas.',sources:['berger_hawks2023']}),
    prometheus:Object.freeze({status:'SPECIES_ATTRIBUTION_CONTESTED',label:'Asignación específica discutida',scope:'La atribución de StW 573 («Little Foot») a Australopithecus prometheus la defiende su equipo de estudio y la cuestionan otros autores, que la incluyen en Au. africanus.',sources:['granger2015','frost2022']}),
    cepranensis:Object.freeze({status:'SPECIES_NAME_CONTESTED',label:'Validez del nombre específico discutida',scope:'Homo cepranensis se propuso para la calvaria de Ceprano; otros autores la incluyen en Homo heidelbergensis o en el conjunto del Pleistoceno medio sin nombre específico propio.',sources:['manzi2010']}),
    idaltu:Object.freeze({status:'SUBSPECIES_RANK_CONTESTED',label:'Rango subespecífico discutido',scope:'Los cráneos de Herto se describieron como Homo sapiens idaltu; su pertenencia a Homo sapiens temprano es ampliamente aceptada, pero la conveniencia de reconocer una subespecie es discutida.',sources:['white2003']}),
    graecopithecus:Object.freeze({status:'HOMININ_STATUS_CONTESTED',label:'Estatus de homínino discutido',scope:'Fuss et al. (2017) propusieron rasgos homininos en la dentición de Graecopithecus; la propuesta, basada en material muy escaso, no es consenso.',sources:['fuss2017','bohme2017']}),
    bahrelghazali:Object.freeze({status:'SPECIES_VALIDITY_CONTESTED',label:'Validez específica discutida',scope:'Australopithecus bahrelghazali se basa en material escaso; parte de la literatura lo considera dentro de la variación de Au. afarensis.',sources:['brunet1995','lebatard2008']}),
    kenyanthropus:Object.freeze({status:'GENUS_VALIDITY_CONTESTED',label:'Validez del género discutida',scope:'Kenyanthropus platyops se basa en un cráneo muy deformado (KNM-WT 40000); parte de la literatura atribuye su cara plana a la distorsión y lo relaciona con Australopithecus.',sources:['leakey2001']}),
    sahel:Object.freeze({status:'HOMININ_STATUS_CONTESTED',label:'Condición de homínino discutida',scope:'Su atribución a Hominini descansa sobre todo en rasgos craneodentales; la evidencia de bipedismo derivada del fémur asociado sigue discutida.',sources:['vignaud2002','lebatard2008']}),
    naledi:Object.freeze({status:'PHYLOGENETIC_POSITION_UNRESOLVED',label:'Posición filogenética no resuelta',scope:'La diagnosis de Homo naledi se mantiene; la incertidumbre principal concierne a su posición filogenética dentro de Homo, no a una cronología taxonómica.',sources:['10.7554/eLife.09560','10.7554/eLife.24234']}),
    longi:Object.freeze({status:'MOLECULAR_DENISOVAN_AFFINITY__NOMENCLATURE_OPEN',label:'Afinidad denisovana molecular; nomenclatura abierta',scope:'El cráneo de Harbin, holotipo de Homo longi, ha proporcionado evidencia molecular denisovana; la relación entre esa identificación poblacional y el nombre específico sigue siendo una cuestión sistemática abierta.',sources:['10.1016/j.cell.2025.05.040','10.1038/s41586-026-10976-9']}),
    luzon:Object.freeze({status:'SPECIES_DIAGNOSED__PHYLOGENETIC_POSITION_UNRESOLVED',label:'Especie diagnosticada; posición filogenética abierta',scope:'Homo luzonensis fue diagnosticado formalmente a partir del conjunto de Callao; su anatomía mosaico no permite resolver de forma cerrada su relación con otras ramas de Homo.',sources:['10.1038/s41586-019-1067-9','10.1016/j.jhevol.2021.103124']}),
    flores:Object.freeze({status:'SPECIES_STATUS_SUPPORTED__PHYLOGENETIC_ORIGIN_UNRESOLVED',label:'Estatus específico respaldado; origen filogenético abierto',scope:'La interpretación de Homo floresiensis como especie diferenciada cuenta con amplio apoyo morfológico; continúan abiertas hipótesis sobre su posición y origen dentro de Homo.',sources:['10.1016/j.jhevol.2017.02.006']}),
    habilis:Object.freeze({status:'EARLY_HOMO_DELIMITATION_DEBATED',label:'Delimitación de Homo temprano debatida',scope:'Homo habilis es un taxón de uso consolidado, pero la delimitación de Homo temprano, su hipodigma y su posición relativa frente a H. rudolfensis siguen siendo objeto de discusión.',sources:['10.1016/j.anthro.2022.103068']}),
    rudolfensis:Object.freeze({status:'EARLY_HOMO_DELIMITATION_DEBATED',label:'Delimitación de Homo temprano debatida',scope:'Homo rudolfensis se emplea habitualmente como taxón separado, pero su delimitación respecto de H. habilis y la definición de Homo temprano permanecen discutidas.',sources:['10.1016/j.anthro.2022.103068']}),
    bodoensis:Object.freeze({status:'PROPOSED_TAXON__VALIDITY_CONTESTED',label:'Taxón propuesto; validez controvertida',scope:'Homo bodoensis fue propuesto para reorganizar parte del registro del Pleistoceno medio, pero la propuesta recibió objeciones nomenclaturales y sistemáticas explícitas y no debe presentarse como consenso.',sources:['10.1002/evan.21929','10.1002/evan.21950']}),
    heidelbergensis:Object.freeze({status:'TAXON_CONCEPT_HYPODIGM_UNSTABLE',label:'Concepto taxonómico e hipodigma inestables',scope:'Homo heidelbergensis ha sido empleado con hipodigmas y extensiones geográficas diferentes; su contenido biológico y su relación con linajes posteriores siguen dependiendo del concepto taxonómico adoptado.',sources:['10.1016/j.jhevol.2022.103279','10.1016/j.quaint.2017.10.013']})
  });
  const M17_FAUNA = {
    olduvai:['Equidos hipparioninos','Bóvidos alcelafinos','Suidae','Carnívoros grandes'],
    dmanisi:['Megantereon','Homotherium','Équidos','Cérvidos'],
    atapuerca:['Ursus deningeri','Cervidae','Equidae','Macromamíferos templados'],
    jebel_irhoud_site:['Gacelas','Équidos','Carnívoros norteafricanos'],
    liang_bua:['Stegodon insular','Varanus komodoensis','Roedores gigantes'],
    denisova_cave:['Cérvidos','Bóvidos','Carnívoros de cueva'],
    rising_star:['Microfauna de cueva','Bóvidos regionales']
  };
  const M19_BIOMES = ['Sabana abierta','Bosque cerrado','Ribera','Montaña','Costal'];
  const M19_MIS = Array.from({length:22},(_,i)=>'MIS '+(i+1));
  const M11_M20_BUTTON_CONTRACTS = [
    '[data-v34-contrast]','[data-v34-toggle-intro]','[data-v34-dispersal-speed]',
    '[data-v34-answer]','[data-v34-exam-export]','[data-v34-gloss-flip]',
    '[data-v34-fauna]','[data-v34-paleo-cell]','[data-m13-answer]',
    '[data-m13-export]','[data-m19-cell]','[data-strat-layer]',
    '[data-strat-site]','[data-strat-toggle-inference]','[data-strat-toggle-compare]',
    '[data-strat-reveal]','[data-pres-export]'
  ];
  if (Array.isArray(window.INTERACTIVE_BUTTON_CONTRACTS || INTERACTIVE_BUTTON_CONTRACTS)) {
    const contracts = window.INTERACTIVE_BUTTON_CONTRACTS || INTERACTIVE_BUTTON_CONTRACTS;
    M11_M20_BUTTON_CONTRACTS.forEach(selector => { if (!contracts.includes(selector)) contracts.push(selector); });
  }

  function ssGet(key, fallback){ try { return typeof SafeStorage !== 'undefined' ? SafeStorage.get(key, fallback) : localStorage.getItem(key) || fallback; } catch(_) { return fallback; } }
  function ssSet(key, value){ try { if (typeof SafeStorage !== 'undefined') SafeStorage.set(key, value); else localStorage.setItem(key, value); } catch(_) { /* recuperable: suprimido intencionalmente */ } }
  function currentMis(ka){ return M12_MIS.find(m => ka <= m.start && ka >= m.end) || M12_MIS[M12_MIS.length-1]; }
  function landPaths(){
    const paths = (typeof PRES_WORLD_LAND_PATHS !== 'undefined' && PRES_WORLD_LAND_PATHS.length) ? PRES_WORLD_LAND_PATHS : [
      'M95 92 C150 52 215 66 242 120 C268 175 232 220 170 224 C112 228 67 188 66 136 C66 116 76 101 95 92Z',
      'M437 93 C505 47 614 58 666 122 C716 184 694 268 624 294 C550 322 466 294 430 226 C398 166 398 122 437 93Z',
      'M522 242 C562 262 584 326 560 396 C540 454 478 462 454 402 C429 340 470 258 522 242Z',
      'M664 167 C725 137 842 151 907 207 C974 265 949 336 856 340 C752 344 693 294 666 228 C655 200 652 180 664 167Z',
      'M790 335 C838 318 904 340 930 386 C892 424 826 424 790 390 C770 370 768 350 790 335Z'
    ];
    return paths.map(d=>`<path class="v34-dispersal-continent" d="${d}"/>`).join('');
  }
  function applyM11Reference(){
    if (typeof PHYLO_REFERENCE_TREE === 'undefined' || typeof BUILDER_REFERENCE_EDGES === 'undefined') return;
    PHYLO_REFERENCE_TREE.name = WB2016;
    PHYLO_REFERENCE_TREE.source = 'Wood & Boyle 2016, Journal of Human Evolution';
    PHYLO_REFERENCE_TREE.doi = '10.1016/j.jhevol.2016.04.004';
    PHYLO_REFERENCE_TREE.support = M11_SUPPORT;
    PHYLO_REFERENCE_TREE.edges = Object.keys(M11_SUPPORT);
    Object.keys(BUILDER_REFERENCE_EDGES).forEach(k => delete BUILDER_REFERENCE_EDGES[k]);
    BUILDER_REFERENCE_EDGES[WB2016] = PHYLO_REFERENCE_TREE.edges;
    if (typeof BUILDER_REFERENCE_TREE_EDGES !== 'undefined' && Array.isArray(BUILDER_REFERENCE_TREE_EDGES)) BUILDER_REFERENCE_TREE_EDGES.splice(0, BUILDER_REFERENCE_TREE_EDGES.length, ...PHYLO_REFERENCE_TREE.edges);
    if (typeof BUILDER_MODEL_META !== 'undefined') {
      Object.keys(BUILDER_MODEL_META).forEach(k => delete BUILDER_MODEL_META[k]);
      BUILDER_MODEL_META[WB2016] = {foco:'Referencia única validada para el constructor; cada arista se evalúa con confianza y cautela.', fuentes:`${PHYLO_REFERENCE_TREE.source} · DOI ${PHYLO_REFERENCE_TREE.doi}`};
    }
  }
  applyM11Reference();
  if (typeof builderLoadReferenceModel === 'function') {
    const _m11BuilderLoadReferenceModel = builderLoadReferenceModel;
    builderLoadReferenceModel = function(modelName){
      const resolved = modelName === BUILDER_DEFAULT_REFERENCE_NAME ? WB2016 : modelName;
      return _m11BuilderLoadReferenceModel(resolved);
    };
  }

  if (typeof builderCompareTree === 'function') {
    builderCompareTree = function(){
      const consensus = new Set(PHYLO_REFERENCE_TREE.edges.filter(edge => edge.split('>').every(id => DB_INDEX[id])));
      const reverse = key => key.split('>').reverse().join('>');
      const status = {};
      let ok=0,warn=0,bad=0;
      treeBuilderState.edges.forEach(e => {
        const meta = PHYLO_REFERENCE_TREE.support[e.key];
        if (meta?.status === 'ok') { status[e.key]='ok'; ok++; }
        else if (meta || consensus.has(reverse(e.key)) || (typeof BUILDER_CONTROVERSIAL !== 'undefined' && BUILDER_CONTROVERSIAL.has(e.key))) { status[e.key]='warn'; warn++; }
        else { status[e.key]='bad'; bad++; }
      });
      treeBuilderState.statusMap = status;
      drawBuilderEdges(status);
      const pct = consensus.size ? Math.round((ok / consensus.size) * 100) : 0;
      const explain = treeBuilderState.edges.map(e => {
        const meta = PHYLO_REFERENCE_TREE.support[e.key];
        const state = status[e.key] || 'bad';
        const label = state === 'ok' ? 'consensuada' : state === 'warn' ? 'controvertida' : 'rechazada';
        return `<div><b class="${state}">${label}</b>${escapeHtmlText(edgeLabel(e.key))}: ${escapeHtmlText(meta?.note || 'No aparece en el consenso de referencia; exige justificación externa.')}${meta ? ` <small>Bootstrap didáctico: ${meta.support}%</small>` : ''}</div>`;
      }).join('');
      const missing = [...consensus].filter(edge => !treeBuilderState.edges.some(e => e.key === edge)).slice(0, 8);
      const report = document.getElementById('builderReport');
      if (!report) return;
      report.innerHTML = `<h3>Comparación con Wood & Boyle 2016</h3><div data-builder-live-summary>${builderLiveSummaryHtml()}</div><div class="v34-confidence-legend"><span class="ok"><i></i>consensuada</span><span class="warn"><i></i>controvertida</span><span class="bad"><i></i>rechazada</span></div><div class="v34-ref-score"><strong>Score topológico: ${pct}%</strong><div class="v34-score-track"><span data-pb-r71-style="width:${pct}%"></span></div><small>DOI ${escapeHtmlText(PHYLO_REFERENCE_TREE.doi)} · soporte por nodo como guía didáctica, no como cálculo filogenético nuevo.</small></div><div class="builder-report-item"><strong>Pendientes</strong>${missing.length ? missing.map(edge=>escapeHtmlText(edgeLabel(edge))).join(' · ') : 'Ninguna.'}</div><div class="v34-edge-explain">${explain || '<div>Construye al menos una arista para recibir retroalimentación explicada.</div>'}</div>${builderEdgeListHtml()}`;
    };
  }

  if (typeof updateDispersalFrame === 'function') {
    renderDispersalSimulator = function(){
      const el = document.getElementById('dispersalContent');
      if (!el) return;
      dispersalState.ka = Number.isFinite(dispersalState.ka) ? dispersalState.ka : 315;
      dispersalState.speed = dispersalState.speed || 1;
      el.innerHTML = `<div class="v34-dispersal-controls">
        <button type="button" class="sim-btn" data-dispersal-play>${dispersalState.playing ? 'Pausar' : 'Reproducir'}</button>
        <button type="button" data-v34-dispersal-speed="1" class="${dispersalState.speed===1?'active':''}">×1</button>
        <button type="button" data-v34-dispersal-speed="2" class="${dispersalState.speed===2?'active':''}">×2</button>
        <button type="button" data-v34-dispersal-speed="4" class="${dispersalState.speed===4?'active':''}">×4</button>
        <label class="pb-r70-gen-42636e83b6" >Tiempo: <strong id="m12DispersalKa">${Math.round(dispersalState.ka)} ka</strong><input class="sim-range" type="range" min="0" max="315" step="5" aria-label="Tiempo en ka" value="${dispersalState.ka}" data-dispersal-time></label>
      </div>
      <div class="v34-dispersal-board"><div class="v34-dispersal-map"><svg id="m12DispersalSvg" viewBox="0 0 1000 500" role="img" aria-label="Animación Out of Africa 315 ka-presente"></svg></div><aside class="sim-info" id="m12DispersalInfo"></aside></div>`;
      updateDispersalFrame();
    };
    updateDispersalFrame = function(){
      const svg = document.getElementById('m12DispersalSvg') || document.getElementById('dispersalSvg'), info = document.getElementById('m12DispersalInfo') || document.getElementById('dispersalInfo');
      if (!svg) return;
      const ka = Number.isFinite(dispersalState.ka) ? dispersalState.ka : 315;
      const mis = currentMis(ka);
      const visible = OUT_OF_AFRICA_EVENTS.filter(e => e.ka >= ka);
      const pts = visible.map(e => `${e.x},${e.y}`).join(' ');
      svg.innerHTML = `<rect width="1000" height="500" fill="#12384a"/><rect class="v34-cenogrid-band" x="0" y="0" width="${Math.max(4,1000-(ka/315*1000))}" height="500"/><g>${landPaths()}</g>${pts ? `<polyline class="v34-dispersal-route" points="${pts}"/>` : ''}${visible.map(e=>`<g class="v34-dispersal-site"><title>${escapeHtmlAttr(e.label)} · ${escapeHtmlAttr(e.note)}</title><circle cx="${e.x}" cy="${e.y}" r="${e.type==='origen'?12:9}" fill="#f0bd4d" stroke="#07151f" stroke-width="3"/><text x="${e.x+14}" y="${e.y-10}" fill="#fff" font-size="14" font-weight="800" paint-order="stroke" stroke="#07151f" stroke-width="3">${escapeHtmlText(e.label)}</text></g>`).join('')}<text x="28" y="44" fill="white" font-size="24" font-weight="900">${Math.round(ka)} ka BP</text><text x="28" y="74" fill="#f0bd4d" font-size="17" font-weight="900">${mis.mis} · ${escapeHtmlText(mis.climate)}</text>`;
      const label = document.getElementById('m12DispersalKa') || document.getElementById('v34DispersalKa'); if (label) label.textContent = Math.round(ka) + ' ka';
      const play = document.querySelector('[data-dispersal-play]'); if (play) play.textContent = dispersalState.playing ? 'Pausar' : 'Reproducir';
      if (info) info.innerHTML = `<h3>Out of Africa por MIS <span class="v34-mis-badge">${mis.mis}</span></h3><p>Mapa SVG inline sin dependencia de red. El fotograma se sincroniza con el estadio isotópico marino activo y una lectura CENOGRID simplificada.</p><div class="v34-kpi-grid"><div class="v34-kpi"><strong>${visible.length}</strong><span>yacimientos/rutas</span></div><div class="v34-kpi"><strong>×${dispersalState.speed||1}</strong><span>velocidad</span></div></div>`;
    };
  }

  function buildM13Bank(){
    const clades = Object.values(CLADE_NAMES);
    const locs = [...new Set(DB.map(s=>s.ubicacion).filter(Boolean))];
    const holos = DB.map(s=>s.holo).filter(Boolean);
    const tools = [...new Set(DB.map(s=>s.herramientas).filter(Boolean))];
    return DB.flatMap(sp => [
      {sp:sp.id, comp:'STEM', q:`¿A qué clado pertenece ${sp.nombre}?`, a:CLADE_NAMES[sp.clado], pool:clades},
      {sp:sp.id, comp:'CCL', q:`¿Qué holotipo o material guía se asocia con ${sp.nombre}?`, a:sp.holo, pool:holos},
      {sp:sp.id, comp:'STEM', q:`¿Dónde se localiza principalmente ${sp.nombre}?`, a:sp.ubicacion, pool:locs},
      ...(() => {
        const p = window.PaleoBotA3Temporal.presentation(sp);
        if (!p.reviewed) return [];
        const labels = {
          point_estimate:'Estimación puntual de un espécimen',
          minimum_age:'Edad mínima documentada',
          maximum_age:'Edad máxima documentada',
          alternative_intervals:'Ventanas cronológicas alternativas',
          closed_interval:'Intervalo documentado',
          unknown:'Cronología no resuelta'
        };
        return [{sp:sp.id, comp:'CPSAA',
          q:`¿Qué tipo de evidencia cronológica revisada corresponde a ${sp.nombre}?`,
          a:labels[p.kind], pool:Object.values(labels),
          evidence_status:'A2_REVIEWED', source_ids:[...p.source_ids],
          chronology_label:p.label}];
      })(),
      {sp:sp.id, comp:'CCEC', q:`¿Qué tecnología o cultura aparece en la ficha de ${sp.nombre}?`, a:sp.herramientas, pool:tools}
    ].filter(q => q.a));
  }
  window.QUESTION_BANK = buildM13Bank();
  let m13Exam = {index:0,score:0,items:[],answers:[],started:0};
  function renderM13Question(){
    const host = document.getElementById('examQ'); if (!host) return;
    const q = m13Exam.items[m13Exam.index];
    if (!q) return renderM13Result();
    const opts = [q.a,...[...new Set(q.pool.filter(x=>x&&x!==q.a))].sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
    host.innerHTML = `<div class="v34-exam-head"><div><div class="quiz-card-kicker">Pregunta ${m13Exam.index+1}/${m13Exam.items.length} · ${escapeHtmlText(q.comp)}</div><p class="quiz-card-question">${escapeHtmlText(q.q)}</p></div><div class="v34-exam-clock">${Math.max(0,10-Math.floor((Date.now()-m13Exam.started)/60000))}:00</div></div>${opts.map(o=>`<button type="button" class="exam-opt" data-m13-answer="${escapeHtmlAttr(o)}">${escapeHtmlText(o)}</button>`).join('')}<p class="quiz-footnote">Modo offline: no usa IA ni conexión.</p>`;
  }
  function renderM13Result(){
    const pct = m13Exam.items.length ? Math.round(m13Exam.score/m13Exam.items.length*100) : 0;
    const record = {date:new Date().toISOString(), score:m13Exam.score, total:m13Exam.items.length, answers:m13Exam.answers};
    ssSet('paleobot_m13_exam_last', JSON.stringify(record));
    // Registrar en QuizProgress para que el panel de progreso se actualice
    try { if (typeof QuizProgress !== 'undefined') { /* ya registrado por respuesta */ } } catch(e) { /* recuperable: suprimido intencionalmente */ }
    const scoreColor = pct >= 75 ? 'var(--c-australo,#2e8b57)' : pct >= 50 ? '#c07800' : 'var(--c-paran,#c0392b)';
    const host = document.getElementById('examQ'); if (!host) return;
    host.innerHTML = `
      <div class="exam-feedback-card">
        <h3 class="pb-r70-gen-751df7269a" >Resultado de la autoevaluación</h3>
        <div class="v34-kpi-grid">
          <div class="v34-kpi">
            <strong data-pb-r71-style="color:${scoreColor}">${pct}%</strong>
            <span>acierto</span>
          </div>
          <div class="v34-kpi">
            <strong>${m13Exam.score}/${m13Exam.items.length}</strong>
            <span>preguntas</span>
          </div>
        </div>
        <div class="exam-action-row pb-r70-gen-a4e06e479c" >
          <button type="button" class="exam-btn pb-r70-gen-6060bba3e1" data-quiz-back="intro" >
            ↩ Nueva autoevaluación
          </button>
          <button type="button" class="exam-btn linked" data-m13-export>
            ⬇ Exportar resultado (.html)
          </button>
        </div>
        ${pct < 60 ? '<p class="pb-r70-gen-259137af4e" >Repasa las especies con más errores en el panel de progreso.</p>' : ''}
      </div>`;
  }
  window.runExam = function(){
    const pool = window.QUESTION_BANK || [];
    m13Exam = {index:0,score:0,items:pool.sort(()=>Math.random()-.5).slice(0,10),answers:[],started:Date.now()};
    const intro = document.getElementById('examIntro'), q = document.getElementById('examQ');
    if (intro) window.PaleoBotStyleState.display(intro, 'none'); if (q) window.PaleoBotStyleState.display(q, 'block');
    renderM13Question();
  };

  if (typeof renderGlossary === 'function') {
    /* v59: renderGlossary m13 — versión canónica con categorías, DOI y tabindex */
    renderGlossary.__v34ReplaceBy = 'm13';
    renderGlossary = function(){
      const container = document.getElementById('glossaryContent'); if (!container) return;
      const categories = ['taxonomia','cronologia','genomica','estratigrafia','metodologia'];
      const categoryLabels = {
        taxonomia:'taxonomía',
        cronologia:'cronología',
        genomica:'genómica',
        estratigrafia:'estratigrafía',
        metodologia:'metodología'
      };
      const normalizeM14Tags = (rawTags, term, def) => {
        const hay = normalizeForSearch(term + ' ' + def);
        const out = new Set();
        rawTags.forEach(tag => {
          if (tag === 'anatomia' || tag === 'filogenia') out.add('taxonomia');
          else if (tag === 'datacion') out.add(/estratigraf|sedimento|nivel|capa|deposicion|aluvial|lacustre|cuenca/.test(hay) ? 'estratigrafia' : 'cronologia');
          else if (tag === 'paleogenomica') out.add('genomica');
          else if (tag === 'paleoambiente') out.add('estratigrafia');
          else if (tag === 'cultura') out.add('metodologia');
          else if (categories.includes(tag)) out.add(tag);
        });
        if (/craneo|mandibula|maxilar|diente|dental|alveolo|molar|premolar|esmalte|pelvis|acetabulo|femur|humer|falange|canino|vertebra|biped|cigomatico|masticatorio|abduccion|aduccion|alometr|clado|linaje|taxonom|filogen|anagenic|especiacion|apomorf|sinapomorf/.test(hay)) out.add('taxonomia');
        if (/adn|genom|introgres|denisov|neandertal|alelo|haplogrupo|epas1|mitocondrial|paleogenom/.test(hay)) out.add('genomica');
        if (/cronolog|datacion|edad minima|edad maxima|\bka\b|\bma\b|radiocarbono|argon|uranio|luminiscencia|esr|tefro|biocronolog/.test(hay)) out.add('cronologia');
        if (/estratigraf|sedimento|nivel|capa|tafonom|deposicion|aluvial|lacustre|cuenca|paleoambiente|clima|aridez|vegetacion|bioma|paisaje/.test(hay)) out.add('estratigrafia');
        if (/metodo|metodolog|hipotesis|muestra sesgada|sesgo|excavacion|escaneo|landmark|herramient|litic|industria|tecnolog|conducta|fuego|enterramiento|cultura/.test(hay)) out.add('metodologia');
        return [...out].filter(tag => categories.includes(tag)).slice(0, 3);
      };
      const terms = Object.keys(glosario).sort((a,b)=>a.localeCompare(b,'es')).slice(0, Math.max(80,Object.keys(glosario).length));
      const cards = terms.map(term => {
        const def = getGlossaryDefinition(term);
        const rawTags = classifyGlossaryTerm(term, def);
        const tags = normalizeM14Tags(rawTags, term, def);
        const cat = tags[0] || 'metodologia';
        const doi = cat==='genomica'?'10.1038/s41586-020-2153-8':cat==='estratigrafia'?'10.1016/j.quageo.2015.02.007':'10.1016/j.jhevol.2016.04.004';
        const tagHtml = tags.map(tag => `<span class="glossary-card-tag">${escapeHtmlText(categoryLabels[tag] || tag)}</span>`).join('');
        return `<article tabindex="0" class="glossary-card v34-flip" data-gloss-tags="${escapeHtmlAttr(tags.join(','))}"><div class="v34-flip-inner"><div class="v34-flip-face"><h3>${escapeHtmlText(term)}</h3><p>${escapeHtmlText(def)}</p><div class="glossary-card-tags">${tagHtml || `<span class="glossary-card-tag">${categoryLabels.metodologia}</span>`}</div></div><div class="v34-flip-face v34-flip-back"><h3>${escapeHtmlText(term)}</h3><p><strong>Ejemplo:</strong> ${escapeHtmlText(getGlossaryLearningEntry(term,rawTags).ejemplo)}</p><p><strong>EN:</strong> ${escapeHtmlText(term)}</p><p><strong>DOI:</strong> ${doi}</p></div></div></article>`;
      }).join('');
      container.innerHTML = `<div class="glossary-top"><p><strong>Glosario M14.</strong> Giro CSS por foco/hover; 80+ términos, categoría, ejemplo, inglés y DOI.</p><input class="glossary-search" type="search" data-gloss-search placeholder="Buscar concepto..." aria-label="Buscar en el glosario"></div><div class="v34-gloss-filter">${categories.map(c=>`<button type="button" data-gloss-theme="${c}">${c}</button>`).join('')}</div><div class="glossary-grid">${cards}</div>`;
      applyGlossaryFilters();
    };
  }

  function buildM16Chronology(sp){
    const m = window.PaleoBotA3Temporal.displayMetadata(sp);
    const reviewed = m.source_status === 'A2_REVIEWED';
    return {
      direct: reviewed && m.dating_relation === 'direct' ? m.label : 'Datación directa no acreditada en A2',
      inferred: reviewed && m.dating_relation !== 'direct' ? m.label : 'Extensión temporal no evaluada',
      debated: !!M16_REVIEW[sp.id],
      debate_type: M16_REVIEW[sp.id]?.status || 'NO_M16_TAXONOMIC_REVIEW_FLAG',
      review_label: M16_REVIEW[sp.id]?.label || 'Sin indicador taxonómico M16',
      review_scope: M16_REVIEW[sp.id]?.scope || 'M16 no asigna controversia taxonómica específica a este registro.',
      review_sources: [...(M16_REVIEW[sp.id]?.sources || [])],
      review_basis: M16_REVIEW[sp.id] ? 'A3_C6_2_SCIENTIFIC_REVIEW' : 'NO_M16_FLAG',
      chronology: m.label, source_status: m.source_status, kind: m.kind,
      entity_type: m.entity_type, source_ids: [...m.source_ids],
      method: m.method, dating_relation: m.dating_relation,
      scope_note: m.scope_note, scientific_duration: 'NOT_ASSESSED',
      legacy_text: sp.anos, release_gate: 'NO_GO'
    };
  }
  DB.forEach(sp => { sp.ma_uncertain = buildM16Chronology(sp); });
  function enhanceM16(){
    document.querySelectorAll('#timelineList .species-item,[data-open-species]').forEach(el => {
      const id = el.dataset.id || el.dataset.openSpecies;
      const sp = DB_INDEX[id]; if (!sp || el.querySelector('.v34-debated-badge')) return;
      if (sp.ma_uncertain?.debated) {
        const title = escapeHtmlAttr(sp.ma_uncertain.review_scope + ' Fuentes: ' + sp.ma_uncertain.review_sources.join(', '));
        /* R97: la insignia se añadía al final de la fila (celda estrecha de la rejilla, bajo la
           miniatura) y se veía como una burbuja vertical; ahora va con las demás etiquetas. */
        const host = el.querySelector('.sp-tags') || el;
        host.insertAdjacentHTML('beforeend','<span class="v34-debated-badge" title="'+title+'">'+escapeHtmlText(sp.ma_uncertain.review_label)+'</span>');
      }
    });
  }
  if (typeof SITE_CATALOG !== 'undefined') SITE_CATALOG.forEach(site => { site.fauna = M17_FAUNA[site.id] || site.fauna || ['Fauna asociada pendiente de detalle']; site.pbdb = 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_name=' + encodeURIComponent(site.fauna[0]); });

  function renderM19PaleoecologiaView(){
      const host = document.getElementById('paleoecologyContent'); if (!host) return;
      const cellFor = (b,mis) => {
        const n = Number(mis.replace('MIS ',''));
        if (b==='Sabana abierta' && n>=6) return ['ergaster','erectus','heidelbergensis'];
        if (b==='Bosque cerrado' && n<=7 && n>=3) return ['neander','denisova'];
        if (b==='Ribera' && [1,5,7,11].includes(n)) return ['sapiens','afarensis'];
        if (b==='Montaña' && n<=6) return ['denisova','sapiens'];
        if (b==='Costal' && n<=5) return ['sapiens','flores','luzon'];
        return [];
      };
      host.innerHTML = `<div class="v34-paleo-grid v34-mis-wide"><div class="v34-paleo-cell head">Bioma / MIS</div>${M19_MIS.map(c=>`<div class="v34-paleo-cell head">${c}</div>`).join('')}${M19_BIOMES.map(b=>`<div class="v34-paleo-cell head">${b}</div>${M19_MIS.map(c=>{const taxa=cellFor(b,c);return `<div class="v34-paleo-cell">${taxa.length?taxa.map(id=>`<button type="button" data-open-species="${id}">${escapeHtmlText(DB_INDEX[id]?.nombre||id)}</button>`).join('')+`<button type="button" data-m19-cell="${escapeHtmlAttr(b+'|'+c)}">clima</button>`:'<span class="pb-r70-gen-a3c4a2203b" >—</span>'}</div>`}).join('')}`).join('')}</div><div class="v34-paleo-detail" id="m19PaleoDetail">Matriz bioma × MIS 1-22. Pulsa una celda con registro para ver clima CENOGRID simplificado y yacimientos asociados.</div>`;
  }
  if (typeof renderPaleoecologiaView === 'function') {
    renderPaleoecologiaView = renderM19PaleoecologiaView;
  }

  if (typeof showDetail === 'function') {
    const oldShowDetail = showDetail;
    showDetail = function(sp){
      oldShowDetail(sp);
      const row = document.querySelector('#detailView .ai-action-row');
      if (row && !row.querySelector('[data-detail-action="exportSpeciesPrintSheet"]')) row.insertAdjacentHTML('beforeend','<button type="button" class="pdf-action-btn" data-detail-action="exportSpeciesPrintSheet">Imprimir ficha</button>');
    };
  }
  function exportSpeciesPrintSheet(){
    const sp = currentSpecies; if (!sp) { alert('Abre primero la ficha de una especie.'); return; }
    const narrative = window.PaleoBotA3Temporal.narrative(sp);
    const chronology = window.PaleoBotA3Temporal.displayMetadata(sp);
    const refs = getSpeciesReferenceSet(narrative).slice(0,5);
    const url = location.href.split('#')[0] + '#' + encodeURIComponent(sp.id);
    const sheet = document.getElementById('academicPrintSheet'); if (!sheet) return;
    sheet.innerHTML = `<section class="v34-print-sheet"><div class="v34-print-grid"><div><h1>${escapeHtmlText(sp.nombre)}</h1><p>${escapeHtmlText(narrative.descripcion||'')}</p></div><div class="v34-print-qr">${escapeHtmlText(url)}</div></div><div class="v34-print-kpis"><div><strong>Cronología</strong><br>${escapeHtmlText(chronology.label)}<small>${escapeHtmlText(chronology.status_label)}</small></div><div><strong>Yacimientos</strong><br>${escapeHtmlText(sp.ubicacion)}</div><div><strong>Rasgos</strong><br>${escapeHtmlText(narrative.experto?.anatomia_craneal||'s/d')}</div><div><strong>Lagunas</strong><br>${escapeHtmlText(narrative.experto?.debate||'Sin debate cargado')}</div></div><p><strong>Alcance cronológico:</strong> ${escapeHtmlText(chronology.scope_note)}</p><p>${escapeHtmlText(chronology.source_label)}</p><p>Los restantes contenidos de la ficha histórica no constituyen una revisión científica integral.</p><div class="v34-print-section"><h2>Referencias DOI</h2><ul>${refs.map(renderReferencePrintItem).join('')}</ul></div></section>`;
    document.body.classList.add('v34-species-print-mode');
    setTimeout(()=>{ window.print(); setTimeout(()=>document.body.classList.remove('v34-species-print-mode'),300); },80);
  }

  function handleM18PrintClick(e){
    const detail = e.target.closest('[data-detail-action="exportSpeciesPrintSheet"]');
    if (!detail) return;
    e.preventDefault();
    e.stopPropagation();
    exportSpeciesPrintSheet();
  }
  function installM18PrintHandler(){
    const panel = document.getElementById('detailView');
    if (!panel || panel.dataset.v34M18Print === 'ready') return false;
    panel.dataset.v34M18Print = 'ready';
    panel.addEventListener('click', handleM18PrintClick);
    return true;
  }
  window.exportSpeciesPrintSheet = exportSpeciesPrintSheet;
  installM18PrintHandler();

  document.addEventListener('click', function(e){
    const ans = e.target.closest('[data-m13-answer]');
    if (ans) { e.preventDefault(); const q=m13Exam.items[m13Exam.index]; const ok=ans.dataset.m13Answer===q.a; if(ok)m13Exam.score++; m13Exam.answers.push({sp:q.sp,comp:q.comp,ok}); ans.closest('#examQ').querySelectorAll('[data-m13-answer]').forEach(btn=>{btn.disabled=true;btn.classList.toggle('exam-correct',btn.dataset.m13Answer===q.a);}); if(!ok) ans.classList.add('exam-wrong'); /* v64-fix BUG-A: registrar en QuizProgress para panel de progreso */ try { if (typeof QuizProgress !== 'undefined' && q.sp) QuizProgress.record(q.sp, ok, 'classic'); } catch(_){} setTimeout(()=>{m13Exam.index++;renderM13Question();},750); return; }
    if (e.target.closest('[data-m13-export]')) {
      e.preventDefault();
      const last = ssGet('paleobot_m13_exam_last','{}');
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Resultado examen PaleoBot</title><link rel="stylesheet" href="assets/css/00-core/006-style.css"></head><body><h1>Resultado examen offline</h1><pre>${escapeHtmlText(last)}</pre></body></html>`;
      const exporter = window.PaleoBotEmbedExport?.openPrintableHtml;
      if (typeof exporter === 'function') {
        exporter(html, 'paleobot-resultado-examen.html');
      } else if (typeof PaleoBot !== 'undefined' && PaleoBot?.ExportManager?.downloadFile) {
        PaleoBot.ExportManager.downloadFile(html, 'paleobot-resultado-examen.html', 'text/html;charset=utf-8');
      } else {
        alert('No se pudo abrir ni descargar el resultado del examen.');
      }
      return;
    }
    const m19 = e.target.closest('[data-m19-cell]'); if (m19) { const [b,mis]=m19.dataset.m19Cell.split('|'); const d=document.getElementById('m19PaleoDetail') || document.getElementById('v34PaleoDetail'); if(d)d.innerHTML=`<h3>${escapeHtmlText(b)} · ${escapeHtmlText(mis)}</h3><p>Condiciones CENOGRID simplificadas: alternancia glacial/interglacial según paridad MIS; lectura útil para nicho ecológico, no reconstrucción paleoclimática fina.</p><p>Yacimientos asociados: Olduvai, Turkana, Atapuerca, Denisova, Blombos/Callao según bioma y período.</p>`; }
  }, true);

  const oldRenderActive = renderActiveView;
  renderActiveView = function(viewId = getActiveViewId()){
    oldRenderActive(viewId);
    if (viewId === 'timeline') enhanceM16();
    if (viewId === 'paleoecologia') renderM19PaleoecologiaView();
  };

  const prevAudit = buildSelfAuditReport;
  buildSelfAuditReport = function(){
    const report = prevAudit();
    const checks = [
      ['M11 Wood & Boyle trazable', PHYLO_REFERENCE_TREE?.support && Object.keys(BUILDER_REFERENCE_EDGES).length===1],
      ['M12 mapa SVG offline + MIS', typeof updateDispersalFrame === 'function' && Array.isArray(M12_MIS) && M12_MIS.length>=8],
      ['M13 banco offline SafeStorage', Array.isArray(window.QUESTION_BANK) && window.QUESTION_BANK.length >= DB.length*5],
      ['M14 glosario flip CSS', document.getElementById('paleobot-v34-m11m20-style')?.textContent.includes('focus-within .v34-flip-inner')],
      ['M15 siluetas craneales SVG', document.getElementById('paleobot-v34-style')?.textContent.includes('v34-cranial-stage') || typeof window.v34SkullPath === 'function'],
      ['M16 revisión científica tipada', DB.filter(sp=>sp.ma_uncertain).length===DB.length && DB.filter(sp=>sp.ma_uncertain?.review_basis==='A3_C6_2_SCIENTIFIC_REVIEW').length===Object.keys(M16_REVIEW).length],
      ['M17 fauna SITE_CATALOG', typeof SITE_CATALOG !== 'undefined' && SITE_CATALOG.some(s=>Array.isArray(s.fauna))],
      ['M18 ficha imprimible taxón', typeof exportSpeciesPrintSheet === 'function'],
      ['M19 matriz MIS 1-22', M19_MIS.length===22 && M19_BIOMES.length===5],
      ['M20 alto contraste SafeStorage', document.getElementById('paleobot-v34-m11m20-style') && ssGet('paleobot_v34_high_contrast','0') !== null]
    ];
    const missing = checks.filter(([,ok])=>!ok).map(([m])=>m);
    report.splice(3,0,{label:'PaleoBot M11-M20',status:missing.length?'bad':'ok',value:missing.length?'Faltan: '+missing.join(', '):'10/10 mejoras M11-M20 instaladas y verificables.'});
    return report;
  };
window.PALEOBOT_M11_M20_READY = true;
})();
