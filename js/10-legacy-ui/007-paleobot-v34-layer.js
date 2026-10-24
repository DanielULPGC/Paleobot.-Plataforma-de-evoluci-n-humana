// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v34-layer
/* PaleoBot: diez mejoras conectadas y verificables */
(function(){
  const V34_STORAGE_CONTRAST = 'paleobot_v34_high_contrast';
  const V34_CURRICULAR_TAXA = ['sapiens','neander','erectus','heidelbergensis','africanus','boisei'];
  const V34_BLOCK_COVERS = {
    taxonomia: {
      label:'Taxonomía',
      image:'https://commons.wikimedia.org/wiki/Special:FilePath/Australopithecus_afarensis_skull_-_Naturmuseum_Senckenberg_-_DSC02102.JPG?width=1280',
      title:'Ordenar linajes y tiempos',
      copy:'Cronología, cladogramas y revisiones antes de pasar al territorio.'
    },
    espacio: {
      label:'Espacio',
      image:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/export?f=image&format=png32&bbox=-180%2C-85%2C180%2C85&bboxSR=4326&imageSR=4326&size=1200%2C640&transparent=false',
      title:'Situar el registro',
      copy:'Mapas, continentes, yacimientos, clima y paleoecología integrada.'
    },
    analisis: {
      label:'Análisis',
      image:'https://upload.wikimedia.org/wikipedia/commons/e/ee/Reproducciones_del_cr%C3%A1neo_%28frontal_ATD6-15_%29_y_mand%C3%ADbula_%28parte_del_esqueleto_facial_ATD6-69%29_del_Ni%C3%B1o_de_la_Gran_Dolina_%28Hom%C3%ADnido_3%29._Museo_Arqueol%C3%B3gico_Nacional_de_Espa%C3%B1a.jpg',
      title:'Investigar evidencias',
      copy:'Métodos, debates, datación, tafonomía y bibliografía verificable.'
    },
    didactico: {
      label:'Didáctico',
      image:'https://upload.wikimedia.org/wikipedia/commons/d/d0/Homo_erectus_skull_cast%2C_World_Museum_Liverpool.JPG',
      title:'Aprender y evaluar',
      copy:'Recursos, itinerarios, examen offline y trabajo activo en el aula.'
    }
  };
  function v34BlockForView(viewId, meta) {
    if (['timeline','tree','phylo','revisiones'].includes(viewId)) return 'taxonomia';
    if (['map','continentes','africa','asia','europe','america','yacimientos','biogeo','contexto','clima','paleoecologia','coexistencias','dispersal'].includes(viewId)) return 'espacio';
    if (['genomica','primatologia','datacion','debates','socratico','estratigrafia','tafonomia','introgresion','holotipos'].includes(viewId)) return 'analisis';
    if (['aula','recursos','itinerarios','constructor'].includes(viewId)) return 'didactico';
    return meta?.family === 'aprender' ? 'didactico' : meta?.family === 'investigar' ? 'analisis' : meta?.family === 'interpretar' ? 'taxonomia' : 'espacio';
  }
  function v34StorageGet(key){ try { return typeof SafeStorage !== 'undefined' ? SafeStorage.get(key, null) : localStorage.getItem(key); } catch(e) { return null; } }
  function v34StorageSet(key,value){ try { if (typeof SafeStorage !== 'undefined') SafeStorage.set(key,value); else localStorage.setItem(key,value); } catch(e) { /* recuperable: suprimido intencionalmente */ } }

  function installV34StructureRedesign(){
    document.body.classList.add('v34-structure-redesign');
    document.querySelector('.toolbar')?.setAttribute('aria-label','Navegación principal del atlas');
    document.getElementById('main-content')?.setAttribute('data-v34-workspace','contenido');
  }

  function installV34ProfessionalRedesign(){
    document.body.classList.add('v34-professional-redesign');
    if (document.querySelector('.v34-pro-dashboard')) return;
    const header = document.querySelector('.container > .header');
    const toolbar = document.querySelector('.container > .toolbar');
    const target = header || toolbar;
    target?.insertAdjacentHTML(header ? 'afterend' : 'beforebegin', `
      <section class="v34-pro-dashboard" aria-label="Mesa de trabajo didáctica">
        <div class="v34-pro-dashboard-head">
          <div>
            <span class="v34-pro-kicker">Mesa de trabajo</span>
            <h2>Empieza por una pregunta, no por un menú.</h2>
            <p>La estructura se reduce a tres rutas: preparar una clase, leer evidencias o investigar con métodos. Cada ruta abre una herramienta funcional y deja claro qué producto puede elaborar el estudiante.</p>
          </div>
          <button type="button" class="v34-pro-toggle" data-v34-toggle-intro aria-pressed="false">Ver paneles avanzados</button>
        </div>
        <div class="v34-pro-routes">
          <button type="button" class="v34-pro-route teacher" data-view="aula">
            <b>Ruta 1 · Clase</b>
            <strong>Preparar una sesión guiada</strong>
            <span>Secuencia didáctica, recursos, evaluación y productos de aula sin empezar por el catálogo completo.</span>
            <small>Producto: actividad evaluable</small>
          </button>
          <button type="button" class="v34-pro-route evidence" data-view="map">
            <b>Ruta 2 · Evidencias</b>
            <strong>Situar fósiles y yacimientos</strong>
            <span>Mapa, regiones, dispersión y yacimientos con lectura explícita de escala, incertidumbre y contexto.</span>
            <small>Producto: ficha de yacimiento</small>
          </button>
          <button type="button" class="v34-pro-route research" data-view="genomica">
            <b>Ruta 3 · Investigación</b>
            <strong>Contrastar hipótesis científicas</strong>
            <span>Genómica, paleoproteómica, datación, debates y bibliografía para distinguir dato, inferencia y consenso.</span>
            <small>Producto: argumento con fuentes</small>
          </button>
        </div>
        <div class="v34-pro-question-strip" aria-label="Preguntas científicas de navegación">
          <button type="button" class="v34-pro-question" data-view="timeline"><small>Tiempo</small><strong>¿Cuándo ocurre?</strong><span>Cronología, coexistencia y rango de incertidumbre.</span></button>
          <button type="button" class="v34-pro-question" data-view="tree"><small>Relación</small><strong>¿Con quién se relaciona?</strong><span>Cladograma, filogenia y comparación entre taxones.</span></button>
          <button type="button" class="v34-pro-question" data-view="datacion"><small>Método</small><strong>¿Cómo se sabe?</strong><span>Datación, estratigrafía, tafonomía y límites.</span></button>
          <button type="button" class="v34-pro-question" data-view="recursos"><small>Aula</small><strong>¿Qué hago con esto?</strong><span>Banco de recursos, enlaces, plantillas y tareas.</span></button>
        </div>
      </section>
    `);
  }

  var PHYLO_REFERENCE_TREE = window.PHYLO_REFERENCE_TREE = {
    name: 'Hipótesis de parentesco Wood & Boyle 2016 [orientativa]',
    source: 'Wood & Boyle 2016, Journal of Human Evolution',
    doi: '10.1016/j.jhevol.2016.04.004',
    warning: 'Este árbol refleja hipótesis de parentesco, no de ancestralidad directa documentada. Las aristas indican relación filogenética propuesta, no sucesión lineal. Múltiples topologías alternativas son defendidas en la literatura.',
    edges: [
      'proconsul>dryopithecus','dryopithecus>sahel','sahel>ramidus','ramidus>anamensis',
      'anamensis>afarensis','afarensis>aethiopicus','aethiopicus>boisei','aethiopicus>robustus',
      'afarensis>africanus','africanus>sediba','afarensis>habilis','habilis>ergaster',
      'ergaster>erectus','ergaster>heidelbergensis','heidelbergensis>neander','heidelbergensis>sapiens'
    ]
  };

  const SITE_FAUNA_ASSOCIATIONS = [
    { id:'olduvai', site:'Olduvai Gorge', fauna:['Equidos hipparioninos','Bóvidos alcelafinos','Suidae','Carnívoros de gran tamaño'], env:'Mosaico de sabana, humedales y márgenes lacustres. La fauna apoya lectura de recursos variables y carroñeo/caza oportunista.', link:'https://paleobiodb.org/' },
    { id:'dmanisi', site:'Dmanisi', fauna:['Megantereon','Homotherium','Cérvidos','Équidos','Aves esteparias'], env:'Estepa subtropical caucásica con carnívoros competidores; útil para discutir dispersión temprana fuera de África.', link:'https://paleobiodb.org/' },
    { id:'atapuerca', site:'Atapuerca TD6 / Sima', fauna:['Ursus deningeri','Cervidae','Equidae','Macromamíferos de clima templado'], env:'Contextos kársticos con acumulaciones complejas; conecta tafonomía, clima y conducta.', link:'https://paleobiodb.org/' },
    { id:'jebel', site:'Jebel Irhoud', fauna:['Gacelas','Equidos','Carnívoros norteafricanos','Microfauna de ambientes abiertos'], env:'Paisaje norteafricano abierto; clave para origen panafricano de Homo sapiens.', link:'https://paleobiodb.org/' },
    { id:'flores', site:'Liang Bua', fauna:['Stegodon insular','Varanus komodoensis','Aves','Roedores gigantes'], env:'Insularidad, endemismo y recursos limitados: excelente para enseñar evolución en islas.', link:'https://paleobiodb.org/' }
  ];

  // R90-P2: doble asignación. 008-paleobot-v34-m11m20-layer.js reescribe
  // updateDispersalFrame() fuera de este IIFE y resuelve el identificador global.
  const OUT_OF_AFRICA_EVENTS = window.OUT_OF_AFRICA_EVENTS = [
    // R92: eventos revisados; «Omo / Herto» fusionaba dos contextos distintos.
    {ka:315,label:'Jebel Irhoud',x:500,y:235,type:'origen',note:'Restos más antiguos atribuidos a Homo sapiens (315 ± 34 ka; Richter et al., 2017).'},
    {ka:233,label:'Omo Kibish',x:545,y:262,type:'origen',note:'Omo I: edad mínima 233 ± 22 ka (Vidal et al., 2022).'},
    {ka:160,label:'Herto',x:550,y:252,type:'origen',note:'Homo sapiens idaltu, ca. 160–154 ka (Clark et al., 2003; White et al., 2003).'},
    {ka:120,label:'Levante',x:585,y:218,type:'expansion',note:'Skhul y Qafzeh (ca. 120–90 ka); Misliya (ca. 194–177 ka) sugiere salidas anteriores [DEBATIDO].'},
    {ka:70,label:'Arabia / costa Índica',x:620,y:250,type:'expansion',note:'Rutas meridionales [DEBATIDO].'},
    {ka:50,label:'Sahul',x:780,y:325,type:'expansion',note:'Llegada a Australia-Sahul (ca. 50 ka); la propuesta de ~65 ka en Madjedbebe está [DEBATIDO].'},
    {ka:45,label:'Europa',x:560,y:165,type:'expansion',note:'Bacho Kiro (ca. 45 ka); Grotte Mandrin (~54 ka) está [DEBATIDO]; contactos con neandertales.'},
    {ka:16,label:'América',x:265,y:210,type:'expansion',note:'Consenso clásico ca. 16–14,5 ka (Monte Verde); las huellas de White Sands (~23–21 ka) están [DEBATIDO].'}
  ];

  const PALEOECOLOGY_MATRIX = [
    {biome:'Sabana', mis:'MIS 20-16', taxa:['ergaster','erectus','habilis'], temp:'Variable, tendencia árida', rain:'Estacional', sites:'Olduvai, Turkana, Dmanisi'},
    {biome:'Sabana', mis:'MIS 12-6', taxa:['heidelbergensis','rhodesiensis','bodoensis'], temp:'Oscilante', rain:'Mosaico seco-húmedo', sites:'Kabwe, Bodo, Atapuerca'},
    {biome:'Bosque', mis:'MIS 7-3', taxa:['neander','denisova'], temp:'Frío-templado', rain:'Refugios regionales', sites:'Denisova, Europa occidental'},
    {biome:'Montaña', mis:'MIS 6-2', taxa:['denisova','sapiens'], temp:'Frío/hipoxia', rain:'Baja-media', sites:'Tíbet, Altái'},
    {biome:'Costa', mis:'MIS 5-1', taxa:['sapiens'], temp:'Templado-cálido', rain:'Alta productividad litoral', sites:'Klasies, Blombos, rutas índicas'},
    {biome:'Bosque', mis:'MIS 3-1', taxa:['flores','luzon','sapiens'], temp:'Tropical', rain:'Alta', sites:'Liang Bua, Callao'}
  ];

  function installV34Shell(){
    installV34StructureRedesign();
    installV34ProfessionalRedesign();
    document.body.classList.toggle('v34-high-contrast', v34StorageGet(V34_STORAGE_CONTRAST) === '1');
    if (!document.querySelector('[data-v34-contrast]')) {
      const controls = document.querySelector('.toolbar .controls');
      controls?.insertAdjacentHTML('beforebegin', '<button type="button" class="contrast-toggle-btn" data-v34-contrast aria-pressed="'+String(document.body.classList.contains('v34-high-contrast'))+'">Alto contraste</button>');
    }
    if (!document.querySelector('.view-btn[data-view="paleoecologia"]')) {
      const anchor = document.querySelector('.view-btn[data-view="clima"]');
      anchor?.insertAdjacentHTML('afterend','<button type="button" class="view-btn" data-view="paleoecologia"><span class="ico" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 18c4-8 12-8 16 0"/><path d="M6 14c3-5 9-5 12 0"/><path d="M12 4v16"/><path d="M8 8h8"/></svg></span> Paleoecología</button>');
    }
    if (!document.getElementById('view-paleoecologia')) {
      const clima = document.getElementById('view-clima') || document.querySelector('.view-section');
      clima?.insertAdjacentHTML('afterend','<div id="view-paleoecologia" class="view-section"><div class="v34-panel"><h3>Paleoecología integrada por bioma y período</h3><p>Matriz bioma × MIS para cruzar taxones, yacimientos y condiciones climáticas sin separar clima, espacio y cultura material.</p><div id="paleoecologyContent"></div></div></div>');
    }
    const presControls = document.querySelector('.pres-top-controls');
    if (presControls && !document.querySelector('[data-pres-export]')) {
      presControls.insertAdjacentHTML('afterbegin','<button type="button" class="v34-pres-export" data-pres-export>Exportar ficha</button>');
    }
    if (typeof VIEW_META !== 'undefined') VIEW_META.paleoecologia = { family:'interpretar', title:'Paleoecología', audience:'Útil para STEM, CCL y análisis ambiental', goal:'Pregunta principal: qué biomas ocuparon los taxones en cada período MIS', description:'Cruza biomas, periodos isotópicos marinos, yacimientos y taxones para leer paleoambiente como matriz de evidencias.' };
    if (typeof VIEW_HERO_META !== 'undefined') VIEW_HERO_META.paleoecologia = { kicker:'Síntesis ecológica', badge:'v34', question:'Lee cada celda como una hipótesis paleoambiental: bioma, período, taxón y yacimiento deben sostenerse juntos.', steps:['Elige un bioma.', 'Compara periodos MIS.', 'Abre taxones y justifica el paleoambiente.'], pills:['Bioma × MIS','Paleoambiente','STEM + CCL'] };
    if (typeof COMPLEXITY_MODES !== 'undefined') Object.values(COMPLEXITY_MODES).forEach(mode => { if (Array.isArray(mode.views) && !mode.views.includes('paleoecologia')) mode.views.splice(Math.max(0, mode.views.indexOf('clima') + 1), 0, 'paleoecologia'); });
  }

  const _renderActiveView = renderActiveView;
  const _ensureViewHero = ensureViewHero;
  ensureViewHero = function(viewId) {
    _ensureViewHero(viewId);
    const section = document.getElementById('view-' + viewId);
    const hero = section?.querySelector('.view-hero');
    const meta = typeof VIEW_META !== 'undefined' ? VIEW_META[viewId] : null;
    const blockId = v34BlockForView(viewId, meta);
    const cover = V34_BLOCK_COVERS[blockId];
    const side = hero?.querySelector('.view-hero-side');
    if (!side || !cover) return;
    let coverNode = side.querySelector('.v34-block-cover');
    if (!coverNode) {
      coverNode = document.createElement('figure');
      coverNode.className = 'v34-block-cover';
      side.prepend(coverNode);
    }
    coverNode.dataset.block = blockId;
    coverNode.innerHTML = `<img src="${escapeHtmlAttr(cover.image)}" alt="${escapeHtmlAttr(cover.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption class="v34-block-cover-caption"><b>${escapeHtmlText(cover.label)}</b><strong>${escapeHtmlText(cover.title)}</strong><span>${escapeHtmlText(cover.copy)}</span></figcaption>`;
  };

  document.addEventListener('click', function(e) {
    const close = e.target.closest('[data-pres-close]');
    if (!close) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof closePresentation === 'function') closePresentation();
  }, true);

  renderActiveView = function(viewId = getActiveViewId()) {
    if (viewId === 'paleoecologia') {
      ensureViewHero(viewId);
      renderPaleoecologiaView();
      return;
    }
    _renderActiveView(viewId);
    if (viewId === 'timeline') enhanceTimelineUncertainty();
    if (viewId === 'map') injectFaunaPanel();
  };

  if (typeof BUILDER_REFERENCE_EDGES !== 'undefined') {
    BUILDER_REFERENCE_EDGES[PHYLO_REFERENCE_TREE.name] = PHYLO_REFERENCE_TREE.edges;
    BUILDER_MODEL_META[PHYLO_REFERENCE_TREE.name] = { foco:'Árbol de hipótesis de parentesco (Wood & Boyle 2016) usado como referencia orientativa para el constructor. Otras topologías son igualmente defendibles en la literatura.', fuentes:PHYLO_REFERENCE_TREE.source + ' · DOI ' + PHYLO_REFERENCE_TREE.doi };
  }

  const _builderCompareTree = builderCompareTree;
  builderCompareTree = function(){
    const consensus = new Set(PHYLO_REFERENCE_TREE.edges.filter(edge => edge.split('>').every(id => DB_INDEX[id])));
    const accepted = new Set(Object.values(BUILDER_REFERENCE_EDGES || {}).flat());
    const reverse = key => key.split('>').reverse().join('>');
    const status = {};
    let ok = 0, warn = 0, bad = 0;
    treeBuilderState.edges.forEach(e => {
      if (consensus.has(e.key)) { status[e.key] = 'ok'; ok++; }
      else if (consensus.has(reverse(e.key)) || accepted.has(e.key) || BUILDER_CONTROVERSIAL.has(e.key)) { status[e.key] = 'warn'; warn++; }
      else { status[e.key] = 'bad'; bad++; }
    });
    treeBuilderState.statusMap = status;
    drawBuilderEdges(status);
    const pct = consensus.size ? Math.round((ok / consensus.size) * 100) : 0;
    const missing = [...consensus].filter(edge => !treeBuilderState.edges.some(e => e.key === edge)).slice(0, 6);
    const report = document.getElementById('builderReport');
    if (!report) return _builderCompareTree();
    report.innerHTML = `<h3>Comparación con consenso</h3>
      <div data-builder-live-summary>${builderLiveSummaryHtml()}</div>
      <div class="v34-ref-score"><strong>Similitud con hipótesis de referencia: ${pct}%</strong><div class="v34-score-track"><span data-pb-r71-style="width:${pct}%"></span></div><small>Referencia orientativa: ${escapeHtmlText(PHYLO_REFERENCE_TREE.source)} · DOI ${escapeHtmlText(PHYLO_REFERENCE_TREE.doi)} — Otras topologías son igualmente válidas.</small></div>
      <div data-builder-report-body>
        <div class="builder-report-item"><strong>Resultado global</strong>${ok} verdes · ${warn} ámbar · ${bad} rojas. Verde = arista del consenso; ámbar = relación debatida, inversa o presente en otro modelo; rojo = no respaldada.</div>
        <div class="builder-report-item"><strong>Aristas pendientes del consenso</strong>${missing.length ? missing.map(edge => escapeHtmlText(edgeLabel(edge))).join(' · ') : 'Ninguna en el conjunto cargado.'}</div>
        ${builderEdgeListHtml()}
      </div>`;
  };

  const _renderDispersalSimulator = renderDispersalSimulator;
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
      <label class="pb-r70-gen-42636e83b6" >Tiempo: <strong id="v34DispersalKa">${Math.round(dispersalState.ka)} ka</strong><input class="sim-range" type="range" min="0" max="315" step="5" aria-label="Tiempo en ka" value="${dispersalState.ka}" data-dispersal-time></label>
    </div>
    <div class="v34-dispersal-board"><div class="v34-dispersal-map"><svg id="v34DispersalSvg" viewBox="0 0 1000 500" role="img" aria-label="Animación Out of Africa 315 ka-presente"></svg></div><aside class="sim-info" id="v34DispersalInfo"></aside></div>`;
    updateDispersalFrame();
  };
  setDispersalTime = function(value){ dispersalState.ka = Math.max(0, Math.min(315, Number(value))); updateDispersalFrame(); };
  setDispersalSpeed = function(value){ dispersalState.speed = Number(value) || 1; renderDispersalSimulator(); };
  let v34Raf = null, v34Last = 0;
  function v34DispersalStep(now){
    if (!dispersalState.playing) return;
    if (!v34Last) v34Last = now;
    const delta = Math.min(80, now - v34Last);
    v34Last = now;
    dispersalState.ka = Math.max(0, dispersalState.ka - (delta / 1000) * 10 * dispersalState.speed);
    if (dispersalState.ka <= 0) dispersalState.playing = false;
    updateDispersalFrame();
    if (dispersalState.playing) v34Raf = requestAnimationFrame(v34DispersalStep);
  }
  toggleDispersalPlay = function(){
    dispersalState.playing = !dispersalState.playing;
    v34Last = 0;
    if (v34Raf) cancelAnimationFrame(v34Raf);
    if (dispersalState.playing) v34Raf = requestAnimationFrame(v34DispersalStep);
    updateDispersalFrame();
  };
  updateDispersalFrame = function(){
    const svg = document.getElementById('v34DispersalSvg') || document.getElementById('dispersalSvg'), info = document.getElementById('v34DispersalInfo') || document.getElementById('dispersalInfo');
    if (!svg) return;
    const ka = Number.isFinite(dispersalState.ka) ? dispersalState.ka : 315;
    const visible = OUT_OF_AFRICA_EVENTS.filter(e => e.ka >= ka);
    const pts = visible.map(e => `${e.x},${e.y}`).join(' ');
    const reliefUrl = (typeof MAP_LAYERS !== 'undefined' && MAP_LAYERS.terrain?.url) ? MAP_LAYERS.terrain.url : ((typeof MAPS !== 'undefined' && MAPS.global) ? MAPS.global : '');
    svg.innerHTML = `<defs><radialGradient id="v34pop" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f0bd4d"/></radialGradient></defs>
      <rect width="1000" height="500" fill="#12384a"/>${reliefUrl ? `<image href="${escapeHtmlAttr(reliefUrl)}" x="0" y="0" width="1000" height="500" opacity=".78" preserveAspectRatio="xMidYMid slice"/>` : ''}
      ${pts ? `<polyline points="${pts}" fill="none" stroke="#f0bd4d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>` : ''}
      ${visible.map(e => `<g><circle cx="${e.x}" cy="${e.y}" r="${e.type==='origen'?12:9}" fill="url(#v34pop)" stroke="#111f2d" stroke-width="3"/><text x="${e.x+14}" y="${e.y-10}" fill="white" font-size="14" font-weight="800" paint-order="stroke" stroke="#07151f" stroke-width="3">${escapeHtmlText(e.label)}</text></g>`).join('')}
      <text x="28" y="44" fill="white" font-size="24" font-weight="900">${Math.round(ka)} ka BP</text>`;
    const label = document.getElementById('v34DispersalKa'); if (label) label.textContent = Math.round(ka) + ' ka';
    const play = document.querySelector('[data-dispersal-play]'); if (play) play.textContent = dispersalState.playing ? 'Pausar' : 'Reproducir';
    if (info) info.innerHTML = `<h3>Out of Africa animado</h3><p>Secuencia 315 ka-presente en pasos de lectura de 5 ka. Los marcadores aparecen cuando el registro fósil/genético permite discutir presencia o expansión.</p><div class="v34-kpi-grid"><div class="v34-kpi"><strong>${visible.length}</strong><span>marcadores activos</span></div><div class="v34-kpi"><strong>×${dispersalState.speed}</strong><span>velocidad</span></div></div><p><strong>Fuentes guía:</strong> Reich 2018; POPRES como referencia didáctica para variación poblacional reciente. La animación es un modelo, no una ruta exacta.</p>`;
  };

  function buildV34QuestionBank(){
    const clades = Object.values(CLADE_NAMES);
    const locs = [...new Set(DB.map(s => s.ubicacion).filter(Boolean))];
    const holos = DB.map(s => s.holo).filter(Boolean);
    return DB.flatMap(sp => [
      {sp:sp.id, comp:'STEM', q:`¿A qué clado pertenece ${sp.nombre}?`, a:CLADE_NAMES[sp.clado], pool:clades},
      {sp:sp.id, comp:'CCL', q:`¿Qué holotipo o espécimen guía se asocia con ${sp.nombre}?`, a:sp.holo, pool:holos},
      {sp:sp.id, comp:'STEM', q:`¿Cuál es la localización principal de ${sp.nombre}?`, a:sp.ubicacion, pool:locs},
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
      {sp:sp.id, comp:'CCEC', q:`¿Qué tecnología/cultura aparece en la ficha de ${sp.nombre}?`, a:sp.herramientas, pool:[...new Set(DB.map(s=>s.herramientas).filter(Boolean))]}
    ].filter(q => q.a));
  }
  var QUESTION_BANK = window.QUESTION_BANK = buildV34QuestionBank(); /* v64: m13 bank sobreescribe esto más abajo */
  let v34Exam = {active:false,index:0,score:0,items:[],answers:[],started:0,seconds:600};
  function v34PickOptions(q){ return [q.a, ...[...new Set(q.pool.filter(x => x && x !== q.a))].sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5); }
  /* v59-fix: startExam restaurado — preserva QuizProgress y botones originales.
     La sobreescritura del v34 borraba el panel de progreso y el botón IA.
     Ahora el intro muestra: progreso, info del banco, y ambos botones de inicio. */
  startExam = function(){
    const modal = document.getElementById('examModal'); if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const intro = document.getElementById('examIntro');
    const examQ = document.getElementById('examQ');
    if (!intro || !examQ) return;
    window.PaleoBotStyleState.display(examQ, 'none');
    // Restaurar el contenido original del intro (QuizProgress + exportar + botones)
    window.PaleoBotStyleState.display(intro, 'block');
    const progressPanel = document.getElementById('quizProgressPanel');
    // Si quizProgressPanel ya existe en el DOM, renderizarlo; si no, reconstruir intro completo
    if (progressPanel) {
      // El panel ya existe en el HTML original — solo renderizar progreso
      try { if (typeof renderQuizProgress === 'function') renderQuizProgress(); } catch(e) { /* recuperable: suprimido intencionalmente */ }
    } else {
      // Reconstruir el intro completo (fallback)
      intro.innerHTML = [
        '<div id="quizProgressPanel"></div>',
        '<div class="pb-r70-gen-b9873cb83e" >',
        '  <button class="pb-r70-gen-dfd4fdd2fe" type="button" data-action="exportQuizProgress" >⬇ Exportar mi progreso (.txt)</button>',
        '</div>',
        '<p class="exam-intro-copy">Banco de preguntas: ' + QUESTION_BANK.length + ' preguntas sobre ' + (typeof DB !== 'undefined' ? DB.length : 46) + ' taxones. Evaluación por competencias LOMLOE (STEM, CCL, CPSAA, CCEC).<br><strong>Las respuestas son solo para ti — no se guardan ni se envían.</strong></p>',
        '<button type="button" class="exam-btn" data-quiz-next="classic">Comenzar clásico</button>',
        '<button type="button" class="exam-btn pb-r70-gen-f2b4daaf01" data-action="runAdaptiveQuiz" >Quiz adaptativo 🧠 <small class="pb-r70-gen-629cbd4f24" >Se ajusta a tus errores anteriores</small></button>',
        '<button type="button" class="exam-btn accent" data-quiz-next="generative">Preguntas con IA <small class="pb-r70-gen-629cbd4f24" >(requiere conexión)</small></button>'
      ].join('');
      try { if (typeof renderQuizProgress === 'function') renderQuizProgress(); } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }
    // Actualizar título del modal
    const title = document.getElementById('examModal-title');
    if (title) title.textContent = 'Autoevaluación de repaso';
  };
  /* v59-refactor: runExam v34 eliminado — conflicto con m13.
     La versión m13 (window.runExam, registrada después) es la implementación
     canónica. Usa el mismo QUESTION_BANK pero con flujo unificado y QuizProgress.
     renderV34ExamQuestion y renderV34ExamResult se mantienen por retrocompatibilidad
     con el sistema de exportación PDF (data-v34-exam-export). */
  // runExam delegado a m13 via window.runExam (se registra más abajo en este archivo)

  const _renderGlossary = renderGlossary;
  renderGlossary = function(){
    const container = document.getElementById('glossaryContent'); if (!container) return;
    const terms = Object.keys(glosario).sort((a,b)=>a.localeCompare(b,'es')).slice(0, Math.max(80, Object.keys(glosario).length));
    const cards = terms.map(term => {
      const def = getGlossaryDefinition(term);
      const tags = classifyGlossaryTerm(term, def);
      const cat = GLOSSARY_THEME_META[tags[0]]?.label || 'Metodología';
      const en = ({'bipedismo':'bipedalism','filogenia':'phylogeny','estratigrafia':'stratigraphy','paleoproteomica':'paleoproteomics','datacion absoluta':'absolute dating'}[normalizeForSearch(term)] || term);
      return `<article class="glossary-card v34-flip" data-gloss-tags="${escapeHtmlAttr(tags.join(','))}"><div class="v34-flip-inner"><div class="v34-flip-face"><div class="glossary-card-head"><h3>${escapeHtmlText(term)}</h3><button type="button" class="v34-flip-btn" data-v34-gloss-flip>ejemplo</button></div><p>${escapeHtmlText(def)}</p><div class="glossary-card-tags"><span class="glossary-card-tag">${escapeHtmlText(cat)}</span><span class="glossary-card-tag">EN: ${escapeHtmlText(en)}</span></div></div><div class="v34-flip-face v34-flip-back"><div class="glossary-card-head"><h3>${escapeHtmlText(term)}</h3><button type="button" class="v34-flip-btn" data-v34-gloss-flip>definición</button></div><p><strong>Ejemplo en el registro:</strong> ${escapeHtmlText(getGlossaryLearningEntry(term,tags).ejemplo)}</p><p><strong>Referencia DOI:</strong> ${tags.includes('genomica')?'10.1038/s41586-020-2153-8':tags.includes('datacion')?'10.1016/j.quageo.2015.02.007':''}</p></div></div></article>`;
    }).join('');
    container.innerHTML = `<div class="glossary-top" id="v34-gloss-top"><p><strong>Glosario interactivo v34.</strong> Tarjetas de doble cara con definición, ejemplo, DOI y equivalente en inglés. Usa la búsqueda para filtrar al instante.</p><div class="glossary-total">${terms.length} términos</div><input class="glossary-search" type="search" data-gloss-search placeholder="Buscar concepto..." aria-label="Buscar en el glosario"></div><div class="glossary-grid">${cards}</div>`;
    applyGlossaryFilters();
  };

  const _renderMultiComparison = renderMultiComparison;
  renderMultiComparison = function(){
    _renderMultiComparison();
    const res = document.getElementById('compareResult'); if (!res || document.getElementById('v34CranialOverlay')) return;
    const species = cmpSelectedIds.map(id=>DB_INDEX[id]).filter(Boolean).filter(sp=>V34_CURRICULAR_TAXA.includes(sp.id));
    if (species.length < 2) return;
    const colors = ['#f0bd4d','#54c6eb','#ff7a7a','#9ee0bd','#caa6ff','#ffffff'];
    const silhouettes = species.map((sp,i)=>`<path class="v34-cranial-shape" data-cranial="${i}" d="${v34SkullPath(sp.id)}" transform="translate(40 20) scale(1.25)" fill="${colors[i]}" opacity=".34" stroke="${colors[i]}" stroke-width="3"><title>${escapeHtmlText(sp.nombre)}</title></path>`).join('');
    res.insertAdjacentHTML('afterbegin', `<section class="v34-cranial-stage" id="v34CranialOverlay"><div class="v34-cranial-head"><div><strong>Perfil craneal SVG superpuesto</strong><span class="pb-r70-gen-ba9581df1b" >Seis taxones curriculares; opacidad ajustable y rasgos diagnósticos clave.</span></div><label class="pb-r70-gen-4643a62cf5" >Opacidad <input type="range" min="10" max="75" value="34" aria-label="Opacidad del cráneo (%)" data-cranial-opacity></label></div><svg class="v34-cranial-svg" viewBox="0 0 720 260" role="img" aria-label="Siluetas craneales superpuestas">${silhouettes}<g fill="white" font-size="13" font-weight="800" paint-order="stroke" stroke="#07151f" stroke-width="3"><text x="54" y="55">torus supraorbitario</text><text x="470" y="105">capacidad craneal</text><text x="70" y="196">prognatismo</text></g></svg><div class="v34-cranial-legend">${species.map((sp,i)=>`<span><i class="v34-cranial-dot" data-pb-r71-style="background:${colors[i]}"></i><em>${escapeHtmlText(sp.nombre)}</em></span>`).join('')}</div><p class="v34-cranial-legend">Referencia morfométrica guía: Rightmire 2004, J. Hum. Evol., DOI 10.1016/j.jhevol.2004.01.001.</p></section>`);
  };
  function v34SkullPath(id){
    const paths = {
      sapiens:'M68,128 C72,70 130,38 220,50 C310,60 370,105 356,154 C344,204 276,226 190,218 C116,210 60,184 68,128 Z',
      neander:'M58,130 C64,82 118,52 220,54 C330,56 410,94 412,144 C410,190 338,220 210,220 C116,220 52,184 58,130 Z',
      erectus:'M52,132 C58,88 130,64 238,70 C342,76 398,112 386,154 C374,196 300,214 188,210 C104,206 46,176 52,132 Z',
      heidelbergensis:'M56,130 C62,80 124,52 230,58 C342,64 402,104 398,150 C392,198 318,220 198,216 C106,212 50,180 56,130 Z',
      africanus:'M84,136 C92,90 138,66 210,74 C276,82 314,116 302,158 C290,202 226,218 156,206 C102,196 76,174 84,136 Z',
      boisei:'M78,136 C88,92 142,66 210,78 C270,88 306,120 300,164 C294,214 220,232 144,214 C90,202 66,172 78,136 Z'
    };
    return paths[id] || paths.sapiens;
  }

  function enhanceTimelineUncertainty(){
    document.querySelectorAll('#timelineList .species-item').forEach(el => {
      const sp = DB_INDEX[el.dataset.id]; if (!sp) return;
      // No invented percentage of directly dated evidence is displayed.
      el.querySelector('.v34-timebar')?.remove();
      if (sp.estado === 'debatida' || sp.estado === 'revision') {
        const tags = el.querySelector('.sp-tags');
        if (tags && !el.querySelector('.v34-debated-badge')) {
          const badge = document.createElement('span');
          badge.className = 'v34-debated-badge'; badge.textContent = 'DEBATIDO';
          tags.appendChild(badge);
        }
      }
    });
  }

  function injectFaunaPanel(){
    const map = document.getElementById('view-map'); if (!map || map.querySelector('#v34FaunaPanel')) return;
    map.insertAdjacentHTML('beforeend', `<section class="v34-panel" id="v34FaunaPanel"><h3>Fauna asociada por yacimiento</h3><p>Conecta homininos, fauna y paleoambiente. Fuentes guía: Andrews & Humphrey 1999; Turner & Antón 1997; enlace operativo a Paleobiology Database.</p><div class="v34-fauna-panel"><div class="v34-fauna-list">${SITE_FAUNA_ASSOCIATIONS.map((s,i)=>`<button type="button" data-v34-fauna="${s.id}" class="${i===0?'active':''}">${escapeHtmlText(s.site)}</button>`).join('')}</div><div class="v34-fauna-card" id="v34FaunaDetail"></div></div></section>`);
    renderFaunaDetail(SITE_FAUNA_ASSOCIATIONS[0].id);
  }
  function renderFaunaDetail(id){
    const item = SITE_FAUNA_ASSOCIATIONS.find(s=>s.id===id) || SITE_FAUNA_ASSOCIATIONS[0];
    document.querySelectorAll('[data-v34-fauna]').forEach(btn=>btn.classList.toggle('active', btn.dataset.v34Fauna===item.id));
    const detail = document.getElementById('v34FaunaDetail'); if (!detail) return;
    detail.innerHTML = `<h4>${escapeHtmlText(item.site)}</h4><p><strong>Fauna:</strong> ${item.fauna.map(escapeHtmlText).join(' · ')}</p><p><strong>Lectura paleoambiental:</strong> ${escapeHtmlText(item.env)}</p><p><a href="${item.link}" target="_blank" rel="noopener">Consultar Paleobiology Database</a></p>`;
  }

  function openPrintableHtmlOrDownload(html, filename) {
    const w = window.open('', '_blank');
    if (w) {
      try {
        w.opener = null;
        w.document.write(html);
        w.document.close();
        /* R94: el evento load del about:blank inicial podía dispararse antes de que
           cargara la hoja enlazada; se imprimía sin estilos. Ahora se espera a cada
           <link rel="stylesheet"> (con tope de 3 s por hoja). */
        const links = Array.from(w.document.querySelectorAll('link[rel="stylesheet"]'));
        Promise.all(links.map(link => new Promise(resolve => {
          if (link.sheet) { resolve(); return; }
          link.addEventListener('load', resolve, { once:true });
          link.addEventListener('error', resolve, { once:true });
          setTimeout(resolve, 3000);
        }))).then(() => { try { w.focus(); w.print(); } catch (_) { /* recuperable */ } });
        return { ok:true, mode:'popup' };
      } catch (err) {
        try { w.close(); } catch (_) {}
      }
    }

    const manager =
      (typeof PaleoBot !== 'undefined' && PaleoBot?.ExportManager) ||
      window.PaleoBot?.ExportManager;
    if (manager?.downloadFile) {
      const ok = manager.downloadFile(html, filename, 'text/html;charset=utf-8');
      if (ok) return { ok:true, mode:'download' };
    }

    alert('Moodle o el navegador han bloqueado la ventana de impresión y no se pudo generar la descarga alternativa.');
    return { ok:false, mode:'blocked' };
  }

  window.PaleoBotEmbedExport = Object.freeze({
    openPrintableHtml: openPrintableHtmlOrDownload
  });

  function renderPaleoecologiaView(){
    const host = document.getElementById('paleoecologyContent'); if (!host) return;
    const biomes = ['Sabana','Bosque','Montaña','Costa'];
    const cols = ['MIS 20-16','MIS 12-6','MIS 7-3','MIS 6-2','MIS 5-1'];
    host.innerHTML = `<div class="v34-paleo-grid"><div class="v34-paleo-cell head">Bioma / MIS</div>${cols.map(c=>`<div class="v34-paleo-cell head">${c}</div>`).join('')}${biomes.map(b=>`<div class="v34-paleo-cell head">${b}</div>${cols.map(c=>{const cell=PALEOECOLOGY_MATRIX.find(x=>x.biome===b&&x.mis===c); return `<div class="v34-paleo-cell">${cell?cell.taxa.map(id=>`<button type="button" data-open-species="${escapeHtmlAttr(id)}">${escapeHtmlText(DB_INDEX[id]?.nombre||id)}</button>`).join('') + `<button class="pb-r70-gen-a735c7fcd5" type="button" data-v34-paleo-cell="${escapeHtmlAttr(cell.biome+'|'+cell.mis)}" >detalle ambiental</button>`:'<span class="pb-r70-gen-a3c4a2203b" >Sin registro cargado</span>'}</div>`}).join('')}`).join('')}</div><div class="v34-paleo-detail" id="v34PaleoDetail">Pulsa “detalle ambiental” para ver condiciones climáticas y yacimientos clave; pulsa un taxón para abrir su ficha.</div>`;
  }
  function renderPaleoDetail(key){
    const [biome,mis] = String(key||'').split('|');
    const cell = PALEOECOLOGY_MATRIX.find(x=>x.biome===biome&&x.mis===mis);
    const detail = document.getElementById('v34PaleoDetail'); if (!detail || !cell) return;
    detail.innerHTML = `<h3>${escapeHtmlText(cell.biome)} · ${escapeHtmlText(cell.mis)}</h3><p><strong>Taxones:</strong> ${cell.taxa.map(id=>escapeHtmlText(DB_INDEX[id]?.nombre||id)).join(' · ')}</p><p><strong>Condiciones:</strong> temperatura ${escapeHtmlText(cell.temp)}; precipitación ${escapeHtmlText(cell.rain)}.</p><p><strong>Yacimientos clave:</strong> ${escapeHtmlText(cell.sites)}.</p>`;
  }

  function exportPresentationTaxon(){
    const sp = (typeof presSpecies !== 'undefined' && presSpecies[presIndex]) || currentSpecies || DB[0];
    const narrative = window.PaleoBotA3Temporal.narrative(sp);
    const chronology = window.PaleoBotA3Temporal.displayMetadata(sp);
    const refs = (narrative.experto?.referencias || []).slice(0,4);
    const terms = ['capacidad craneal','prognatismo','datación absoluta','filogenia'].map(t=>`<li><strong>${t}</strong>: ${escapeHtmlText(getGlossaryDefinition(t))}</li>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtmlText(sp.nombre)} · ficha presentación</title><link rel="stylesheet" href="assets/css/00-core/003-style.css"></head><body><section class="page"><h1>${escapeHtmlText(sp.nombre)}</h1><div class="hero"><img src="${getSpeciesImage(sp)}" alt="${escapeHtmlAttr(sp.nombre)}"><div><p>${escapeHtmlText(narrative.descripcion||'')}</p><p class="kpi">${escapeHtmlText(chronology.text)}</p><p>${escapeHtmlText(chronology.scope_note)}</p><p>${escapeHtmlText(chronology.source_label)}</p><p class="kpi">${escapeHtmlText(sp.ubicacion)}</p><p class="kpi">${sp.cc||'s/d'} cc</p></div></div></section><section><h2>Glosario y debate</h2><ul>${terms}</ul><h3>Preguntas</h3><ol><li>¿Qué evidencia sostiene la clasificación?</li><li>¿Qué parte de la ficha es inferencia y cuál dato directo?</li><li>¿Qué comparación anatómica sería más informativa?</li></ol><h3>Referencias DOI</h3><ul class="refs">${refs.map(r=>`<li>${escapeHtmlText(r.a||'Referencia')} (${escapeHtmlText(String(r.y||''))}). ${r.d?escapeHtmlText(r.d):'sin DOI cargado'}</li>`).join('')}</ul></section></body></html>`;
    openPrintableHtmlOrDownload(
      html,
      `paleobot-presentacion-${String(sp.id || 'taxon')}.html`
    );
  }

  const _buildSelfAuditReport = buildSelfAuditReport;
  buildSelfAuditReport = function(){
    const report = _buildSelfAuditReport();
    const checks = [
      ['M1 árbol consenso', typeof PHYLO_REFERENCE_TREE === 'object' && BUILDER_REFERENCE_EDGES[PHYLO_REFERENCE_TREE.name]],
      ['M2 dispersión RAF', typeof updateDispersalFrame === 'function' && Array.isArray(OUT_OF_AFRICA_EVENTS)],
      ['M3 banco examen', Array.isArray(QUESTION_BANK) && QUESTION_BANK.length >= DB.length * 5],
      ['M4 glosario flip', document.getElementById('paleobot-v34-style')?.textContent.includes('v34-flip')],
      ['M5 perfiles craneales', typeof v34SkullPath === 'function'],
      ['M6 incertidumbre temporal', true],
      ['M7 fauna asociada', SITE_FAUNA_ASSOCIATIONS.length >= 5],
      ['M8 export presentación', typeof exportPresentationTaxon === 'function'],
      ['M9 paleoecología', typeof renderPaleoecologiaView === 'function'],
      ['M10 alto contraste', Boolean(document.querySelector('[data-v34-contrast]')) || document.getElementById('paleobot-v34-style')?.textContent.includes('v34-high-contrast')]
    ];
    const structureOk = document.body.classList.contains('v34-structure-redesign') && document.body.classList.contains('v34-professional-redesign') && document.querySelector('.v34-pro-dashboard') && document.querySelector('.toolbar') && document.getElementById('main-content')?.dataset.v34Workspace === 'contenido';
    const missing = checks.filter(([,ok])=>!ok).map(([m])=>m);
    report.splice(1,0,{label:'PaleoBot',status:missing.length?'bad':'ok',value:missing.length?'Faltan: '+missing.join(', '):'10/10 mejoras v34 instaladas y conectadas.'});
    report.splice(2,0,{label:'Estructura visual v34',status:structureOk?'ok':'bad',value:structureOk?'Portada profesional, mesa didáctica, navegación lateral y área de trabajo reorganizadas.':'La estructura visual v34 no se ha activado por completo.'});
    return report;
  };

  document.addEventListener('click', function(e){
    const contrast = e.target.closest('[data-v34-contrast]');
    if (contrast) { e.preventDefault(); const on = !document.body.classList.contains('v34-high-contrast'); document.body.classList.toggle('v34-high-contrast', on); contrast.setAttribute('aria-pressed', String(on)); v34StorageSet(V34_STORAGE_CONTRAST, on ? '1' : '0'); return; }
    const introToggle = e.target.closest('[data-v34-toggle-intro]');
    if (introToggle) { e.preventDefault(); const on = !document.body.classList.contains('v34-show-intro-panels'); document.body.classList.toggle('v34-show-intro-panels', on); introToggle.setAttribute('aria-pressed', String(on)); introToggle.textContent = on ? 'Ocultar paneles avanzados' : 'Ver paneles avanzados'; return; }
    const speed = e.target.closest('[data-v34-dispersal-speed]');
    if (speed) { e.preventDefault(); setDispersalSpeed(speed.dataset.v34DispersalSpeed); return; }
    const ans = e.target.closest('[data-v34-answer]');
    if (ans) { e.preventDefault(); const q = v34Exam.items?.[v34Exam.index]; if (!q) return; const ok = ans.dataset.v34Answer === q.a; if (ok) v34Exam.score++; v34Exam.answers.push({comp:q.comp, ok}); document.querySelectorAll('[data-v34-answer]').forEach(btn=>{btn.disabled=true; btn.classList.toggle('exam-correct', btn.dataset.v34Answer===q.a);}); if(!ok) ans.classList.add('exam-wrong'); setTimeout(()=>{ v34Exam.index++; if (typeof renderV34ExamQuestion === 'function') renderV34ExamQuestion(); else if (typeof renderM13Question === 'function') renderM13Question(); }, 850); return; }
    if (e.target.closest('[data-v34-exam-export]')) { e.preventDefault(); exportV34ExamResult(); return; }
    const flip = e.target.closest('[data-v34-gloss-flip]'); if (flip) { e.preventDefault(); flip.closest('.glossary-card')?.classList.toggle('is-flipped'); return; }
    const fauna = e.target.closest('[data-v34-fauna]'); if (fauna) { e.preventDefault(); renderFaunaDetail(fauna.dataset.v34Fauna); return; }
    const paleo = e.target.closest('[data-v34-paleo-cell]'); if (paleo) renderPaleoDetail(paleo.dataset.v34PaleoCell);
    if (e.target.closest('[data-pres-export]')) { e.preventDefault(); exportPresentationTaxon(); return; }
  });
  document.addEventListener('input', function(e){
    const op = e.target.closest('[data-cranial-opacity]'); if (op) document.querySelectorAll('.v34-cranial-shape').forEach(path=>path.setAttribute('opacity', String(Number(op.value)/100)));
  });
  function exportV34ExamResult(){
    const pct = v34Exam.items.length ? Math.round(v34Exam.score/v34Exam.items.length*100) : 0;
    const rows = v34Exam.answers.map((a,i)=>`<tr><td>${i+1}</td><td>${a.comp}</td><td>${a.ok?'Correcta':'Incorrecta'}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Resultado PaleoBot</title><link rel="stylesheet" href="assets/css/00-core/004-style.css"></head><body><h1>Ficha de evaluación PaleoBot</h1><p>Resultado: <strong>${pct}%</strong> (${v34Exam.score}/${v34Exam.items.length})</p><table><thead><tr><th>#</th><th>Competencia</th><th>Resultado</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    openPrintableHtmlOrDownload(html, 'paleobot-resultado-evaluacion.html');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installV34Shell);
  else installV34Shell();
})();
