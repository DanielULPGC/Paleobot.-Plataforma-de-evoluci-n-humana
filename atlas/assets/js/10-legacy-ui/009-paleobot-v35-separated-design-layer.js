// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v35-separated-design-layer
(function(){
  const esc = typeof escapeHtmlText === 'function' ? escapeHtmlText : value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const escAttr = typeof escapeHtmlAttr === 'function' ? escapeHtmlAttr : esc;
  const byName = needle => Array.isArray(window.DB || DB)
    ? (window.DB || DB).find(sp => String(sp.nombre || '').toLowerCase().includes(needle))
    : null;
  function speciesImage(needles){
    for (const needle of needles) {
      const sp = byName(needle);
      if (sp && typeof getSpeciesImage === 'function') return getSpeciesImage(sp);
    }
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Olduvai_Gorge_or_Oldupai_Gorge.jpg/1280px-Olduvai_Gorge_or_Oldupai_Gorge.jpg';
  }
  const blocks = [
    {
      key:'tiempo',
      label:'Bloque 01',
      title:'Evolución y parentesco',
      cover:'Lectura temporal y filogenética',
      caption:'Taxones, cronología, consenso y controversia se trabajan como una secuencia, no como piezas sueltas.',
      summary:'Reúne línea de tiempo, árbol, constructor filogenético y comparador morfológico. Es la entrada adecuada para explicar qué cambia, cuándo cambia y con qué grado de certeza.',
      views:[['timeline','Línea de tiempo'],['tree','Árbol'],['phylo','Filogenia'],['constructor','Constructor']],
      proof:['Cronología directa/inferida','Consenso de referencia','Comparación anatómica'],
      images:['neanderthalensis','erectus','afarensis']
    },
    {
      key:'territorio',
      label:'Bloque 02',
      title:'Territorio, rutas y yacimientos',
      cover:'Mapas con propósito didáctico',
      caption:'El mapa deja de ser decoración: ubica, amplía, compara y conecta yacimiento con ambiente.',
      summary:'Agrupa mapa global, África, Asia, América y paleoecología. Cada entrada separa localización, escala regional y evidencias asociadas para no saturar al estudiante.',
      views:[['map','Mapa global'],['africa','África'],['asia','Asia'],['america','América'],['paleoecologia','Paleoecología']],
      proof:['Escala mundial/regional','Rutas de dispersión','Fauna y bioma'],
      images:['heidelbergensis','naledi','floresiensis']
    },
    {
      key:'laboratorio',
      label:'Bloque 03',
      title:'Laboratorio y método científico',
      cover:'Cómo sabemos lo que sabemos',
      caption:'Datación, estratigrafía, paleoproteómica y paleogenómica aparecen como herramientas de validación.',
      summary:'Separa las técnicas de análisis para que el alumno distinga dato, inferencia, incertidumbre y debate científico actualizado.',
      views:[['datacion','Datación'],['estratigrafia','Estratigrafía'],['genomica','Genómica'],['paleoproteomica','Paleoproteómica'],['introgresion','Introgresión'],['tafonomia','Tafonomía'],['debates','Debates']],
      proof:['Métodos de datación','Evidencia molecular','Riesgo de afirmación'],
      images:['denisova','longi','antecessor']
    },
    {
      key:'aula',
      label:'Bloque 04',
      title:'Aula, evaluación y recursos',
      cover:'Uso docente y aprendizaje autónomo',
      caption:'Glosario, banco de preguntas, recursos y fichas imprimibles quedan en una zona de trabajo propia.',
      summary:'Centraliza las herramientas para clase: glosario, examen, banco de recursos, bibliografía y guía visual. Así se evita que los materiales docentes compitan con el atlas científico.',
      views:[['aula','Guía de aula'],['recursos','Recursos'],['itinerarios','Itinerarios']],
      actions:[['openGlossary','Glosario'],['startExam','Examen'],['abrirBiblio','Bibliografía']],
      proof:['Niveles diferenciados','Evaluación offline','Recursos verificados'],
      images:['sapiens','boisei','africanus']
    }
  ];
  function renderBlock(block){
    const viewButtons = (block.views || []).map(([view,label], index) => `<button type="button" class="${index ? 'secondary' : ''}" data-view="${escAttr(view)}">${esc(label)}</button>`).join('');
    const actionButtons = (block.actions || []).map(([action,label]) => `<button type="button" class="secondary" data-action="${escAttr(action)}">${esc(label)}</button>`).join('');
    return `<article class="v35-block-portal" data-block-cover="${escAttr(block.key)}">
      <div class="v35-block-cover">
        <img src="${escAttr(speciesImage(block.images || []))}" alt="Portada visual del bloque ${escAttr(block.title)}" loading="lazy">
        <div class="v35-block-cover-caption"><strong>${esc(block.cover)}</strong><span>${esc(block.caption)}</span></div>
      </div>
      <div class="v35-block-content">
        <p class="v35-block-label">${esc(block.label)}</p>
        <h3 class="v35-block-title">${esc(block.title)}</h3>
        <p class="v35-block-summary">${esc(block.summary)}</p>
        <div class="v35-block-actions">${viewButtons}${actionButtons}</div>
        <div class="v35-block-proof">${(block.proof || []).map(item => `<span>${esc(item)}</span>`).join('')}</div>
      </div>
    </article>`;
  }
  function installSeparatedBlocks(){
    document.body.classList.add('v35-separated-blocks');
    if (document.querySelector('.v35-block-portal-shell')) return;
    const anchor = document.querySelector('.main-cover') || document.querySelector('.container > .header') || document.querySelector('.toolbar');
    if (!anchor) return;
    const shell = document.createElement('section');
    shell.className = 'v35-block-portal-shell';
    shell.setAttribute('aria-label','Bloques principales del atlas');
    shell.innerHTML = `<div class="v35-block-portal-head">
      <div>
        <h2 class="v35-block-portal-title">Cuatro entradas, cuatro portadas, una ruta clara.</h2>
      </div>
      <p class="v35-block-portal-lead">El atlas queda dividido por uso real: interpretar parentesco, leer territorio, validar con método y trabajar en el aula. Cada bloque tiene portada propia y conduce a herramientas concretas.</p>
    </div>
    <div class="v35-block-portal-grid">${blocks.map(renderBlock).join('')}</div>`;
    anchor.insertAdjacentElement('afterend', shell);
  }
  function setModalOpen(id, open){
    const modal = id ? document.getElementById(id) : null;
    if (!modal) return false;
    modal.classList.toggle('active', Boolean(open));
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal-overlay.active')));
    return true;
  }
  function closeDetailFallback(trigger){
    let ok = false;
    if (typeof closeDetailPanel === 'function') {
      try { closeDetailPanel(); ok = true; } catch(err) { console.warn('Cierre de ficha recuperado por v35:', err); }
    }
    const panel = trigger?.closest('.detail-panel,.side-panel,#detailView') || document.getElementById('detailView') || document.querySelector('.detail-panel.active,.side-panel.active');
    if (panel) {
      panel.classList.remove('active','open','visible');
      panel.setAttribute('aria-hidden','true');
      ok = true;
    }
    return ok;
  }
  function closePresentationFallback(){
    let ok = false;
    if (typeof closePresentation === 'function') {
      try { closePresentation(); ok = true; } catch(err) { console.warn('Cierre de presentación recuperado por v35:', err); }
    }
    const overlay = document.getElementById('presOverlay') || document.querySelector('.pres-overlay');
    if (overlay) {
      overlay.classList.remove('active','open');
      overlay.setAttribute('aria-hidden','true');
      document.body.classList.remove('presentation-open','pres-open','no-scroll');
      ok = true;
    }
    return ok;
  }
  function closePresMapFallback(){
    let ok = false;
    if (typeof closePresMapModal === 'function') {
      try { ok = closePresMapModal() !== false || ok; } catch(err) { console.warn('Cierre de mapa recuperado por v35:', err); }
    }
    const modal = document.getElementById('presMapModal') || document.querySelector('.pres-map-modal.active');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden','true');
      ok = true;
    }
    return ok;
  }
  function runNamedAction(action, trigger){
    const fallback = {
      scrollToTop:() => window.scrollTo({top:0,behavior:'smooth'}),
      openPresentation:() => typeof openPresentation === 'function' && openPresentation(),
      startExam:() => typeof startExam === 'function' && startExam(),
      openGlossary:() => typeof openGlossary === 'function' && openGlossary(),
      openMatrix:() => typeof openMatrix === 'function' && openMatrix(),
      abrirEstadisticas:() => typeof abrirEstadisticas === 'function' && abrirEstadisticas(),
      abrirBiblio:() => typeof abrirBiblio === 'function' && abrirBiblio(),
      exportToCSV:() => typeof exportToCSV === 'function' && exportToCSV(),
      printFicha:() => typeof printFicha === 'function' && printFicha(),
      resetGlobalFilters:() => typeof resetGlobalFilters === 'function' && resetGlobalFilters(),
      activateClassMode:() => typeof activateClassMode === 'function' && activateClassMode(),
      runSelfAudit:() => typeof runSelfAudit === 'function' && runSelfAudit()
    };
    if (fallback[action]) {
      fallback[action]();
      return true;
    }
    if (typeof window[action] === 'function') {
      window[action](trigger);
      return true;
    }
    if (typeof getActionContractMap === 'function') {
      const map = getActionContractMap();
      if (typeof map?.[action] === 'function') {
        map[action](trigger);
        return true;
      }
    }
    return false;
  }
  function installInteractionGuards(){
    if (window.PALEOBOT_V35_CLOSE_READY) return;
    window.PALEOBOT_V35_CLOSE_READY = true;
    window.addEventListener('click', function(e){
      const v35View = e.target.closest('.v35-block-portal [data-view]');
      if (v35View) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (typeof switchView === 'function') switchView(v35View.dataset.view, v35View);
        document.getElementById('main-content')?.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      const modalClose = e.target.closest('.close-modal[data-modal-toggle]');
      if (modalClose) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setModalOpen(modalClose.dataset.modalToggle, false);
        return;
      }
      const modalBack = e.target.closest('[data-modal-back]');
      if (modalBack) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const modal = modalBack.closest('.modal-overlay');
        if (modal?.id) setModalOpen(modal.id, false);
        return;
      }
      const panelClose = e.target.closest('[data-panel-close]');
      if (panelClose) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeDetailFallback(panelClose);
        return;
      }
      if (e.target.closest('[data-pres-map-close]')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closePresMapFallback();
        return;
      }
      if (e.target.closest('[data-pres-close]')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closePresentationFallback();
        return;
      }
      const floating = e.target.closest('.fab-group button[data-modal-toggle]');
      if (floating) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (floating.dataset.modalToggle) {
          const modal = document.getElementById(floating.dataset.modalToggle);
          setModalOpen(floating.dataset.modalToggle, !modal?.classList.contains('active'));
          return;
        }
        runNamedAction(floating.dataset.action, floating);
      }
    }, true);
  }
  function extendAudit(){
    if (typeof buildSelfAuditReport !== 'function' || buildSelfAuditReport.__v35Extended) return;
    const previous = buildSelfAuditReport;
    buildSelfAuditReport = function(){
      const report = previous();
      const portals = Array.from(document.querySelectorAll('.v35-block-portal'));
      const missing = [];
      if (!document.body.classList.contains('v35-separated-blocks')) missing.push('modo visual separado');
      if (portals.length < 4) missing.push('cuatro bloques con portada');
      if (portals.some(portal => !portal.querySelector('.v35-block-cover img'))) missing.push('imagenes de portada');
      if (!window.PALEOBOT_V35_CLOSE_READY) missing.push('guardas de cierre');
      report.splice(3,0,{
        label:'Estructura visual profesional',
        status:missing.length ? 'bad' : 'ok',
        value:missing.length ? 'Faltan: ' + missing.join(', ') : '4 bloques separados, cada uno con portada independiente y botones de entrada conectados.'
      });
      return report;
    };
    buildSelfAuditReport.__v35Extended = true;
  }
  function init(){
    installSeparatedBlocks();
    installInteractionGuards();
    extendAudit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.PALEOBOT_V35_SEPARATED_DESIGN_READY = true;
})();
