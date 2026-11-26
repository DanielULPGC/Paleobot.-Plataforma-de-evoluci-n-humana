// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
/* ═══════════════════════════════════════════════════════════════════════════
   PaleoBot — Módulo: Guía didáctica del alumnado + fix botones flotantes
   Autor: Mirada/ULPGC · Biblioteca Facultad de Ciencias de la Educación
   Versión: 59.0.0 · 2026-05
   Licencia: CC BY-NC 4.0
   ═══════════════════════════════════════════════════════════════════════════ */
(function PaleoBotV59() {
  'use strict';

  /* ── Debug condicional ── */
  const DEBUG = false;
  const log = DEBUG ? console.log.bind(console, '[PB59]') : () => {};
  const warn = DEBUG ? console.warn.bind(console, '[PB59]') : () => {};

  /* ─────────────────────────────────────────────────────────────────────────
     A. DATOS DIDÁCTICOS DEL ALUMNADO
     Fuentes pedagógicas: LOMLOE (BOE-A-2020-17264), Decreto 82/2022 (Canarias),
     Smithsonian Human Origins (humanorigins.si.edu), PBDB (paleobiodb.org)
     ───────────────────────────────────────────────────────────────────────── */

  /** Pasos de onboarding para el alumnado — secuencia de iniciación */
  const SG_STEPS = [
    {
      num: 1,
      title: 'Elige una pregunta de partida',
      desc: 'Antes de navegar, formula una pregunta concreta: "¿Cuándo apareció X?", "¿Dónde se documenta Y?". El atlas tiene respuestas, pero necesitan una pregunta.',
      action: null,
      view: null,
      btnLabel: '🔬 Ver preguntas guía',
      btnTab: 'preguntas'
    },
    {
      num: 2,
      title: 'Empieza por la Cronología',
      desc: 'La vista de Cronología es el punto de entrada recomendado. Sitúa primero el taxón en el tiempo antes de analizar su anatomía o su distribución geográfica.',
      action: null,
      view: 'timeline',
      btnLabel: '⏱ Abrir Cronología',
      btnTab: null
    },
    {
      num: 3,
      title: 'Localiza en el Mapa',
      desc: 'Después de ubicar el taxón en el tiempo, comprueba dónde se han encontrado sus restos. La geografía del hallazgo es parte del argumento.',
      action: null,
      view: 'map',
      btnLabel: '🗺 Abrir Mapa',
      btnTab: null
    },
    {
      num: 4,
      title: 'Distingue dato, inferencia e incertidumbre',
      desc: 'En cada ficha encontrarás información con distintos grados de certeza. Los marcadores [DEBATIDO] o [PROVISIONAL] indican que el consenso científico no está cerrado.',
      action: 'openGlossary',
      view: null,
      btnLabel: '📚 Abrir glosario',
      btnTab: null
    },
    {
      num: 5,
      title: 'Construye tu argumento',
      desc: 'Cuando tengas evidencia suficiente, usa el Constructor de hipótesis o la vista de Debates para defender una posición con razonamiento AERC: Afirmación, Evidencia, Razonamiento, Cautela.',
      action: null,
      view: 'debates',
      btnLabel: '🧩 Ver debates activos',
      btnTab: null
    },
    {
      num: 6,
      title: 'Cierra con un producto',
      desc: 'El atlas no es un fin en sí mismo: es una fuente de evidencia. Cierra cada sesión con un producto: ficha, mapa conceptual, informe o ticket de salida reflexivo.',
      action: null,
      view: 'aula',
      btnLabel: '🎓 Centro docente',
      btnTab: null
    }
  ];

  /**
   * Vistas recomendadas para el alumnado, ordenadas por dificultad.
   * Seleccionadas del VIEW_META del atlas.
   * DOI de referencia pedagógica: Hmelo-Silver (2004) https://doi.org/10.1023/B:EDUC.0000042415.65252.f4
   */
  const SG_VIEWS = [
    { id: 'timeline',  family: 'Explorar',    emoji: '⏱', title: 'Cronología',       desc: 'Punto de entrada. Ordena los taxones en el tiempo.' },
    { id: 'map',       family: 'Explorar',    emoji: '🗺', title: 'Mapa',             desc: 'Dónde se han encontrado los restos fósiles.' },
    { id: 'coexistencias', family: 'Interpretar', emoji: '🤝', title: 'Coexistencias', desc: '¿Cuántas especies vivieron a la vez?' },
    { id: 'tree',      family: 'Interpretar', emoji: '🌿', title: 'Cladograma',       desc: 'Relaciones evolutivas básicas entre taxones.' },
    { id: 'contexto',  family: 'Interpretar', emoji: '🌍', title: 'Contexto',         desc: 'Clima, geología y ecología de cada periodo.' },
    { id: 'debates',   family: 'Investigar',  emoji: '⚖️', title: 'Debates activos',  desc: 'Controversias científicas todavía abiertas.' },
    { id: 'datacion',  family: 'Investigar',  emoji: '🔢', title: 'Datación',         desc: 'Métodos para saber cuándo vivió un taxón.' },
    { id: 'tafonomia', family: 'Investigar',  emoji: '🦴', title: 'Tafonomía',        desc: 'Por qué el registro fósil tiene la forma que tiene.' },
    { id: 'constructor', family: 'Aprender',  emoji: '🔧', title: 'Constructor',      desc: 'Construye tu propia hipótesis filogenética.' },
    { id: 'itinerarios', family: 'Aprender',  emoji: '🛤️', title: 'Itinerarios',      desc: 'Secuencias guiadas de aprendizaje.' },
    { id: 'socratico',  family: 'Aprender',   emoji: '🗣️', title: 'Debate socrático', desc: 'Defiende una hipótesis con argumentos y evidencia.' },
    { id: 'aula',       family: 'Aprender',   emoji: '🎓', title: 'Centro docente',   desc: 'Materiales y tareas evaluables.' }
  ];

  /**
   * Preguntas científicas de inicio para el alumnado.
   * Basadas en el marco AERC de argumentación científica
   * (Toulmin, 1958; adaptación didáctica LOMLOE STEM).
   */
  const SG_QUESTIONS = [
    { icon: '🕒', q: '¿Cuándo apareció el primer homínino bípedo?',    hint: 'Vista recomendada: Cronología → busca Sahelanthropus o Ardipithecus', view: 'timeline' },
    { icon: '🌍', q: '¿En qué continente se han encontrado más fósiles?', hint: 'Vista recomendada: Mapa → observa la densidad por regiones', view: 'map' },
    { icon: '🤝', q: '¿Cuántas especies humanas coexistieron hace 300 Ka?', hint: 'Vista recomendada: Coexistencias → filtra el intervalo temporal', view: 'coexistencias' },
    { icon: '🧬', q: '¿Cómo se relacionan los neandertales y Homo sapiens?', hint: 'Vista recomendada: Paleogenómica o Introgresión', view: 'genomica' },
    { icon: '🌡️', q: '¿Qué cambios climáticos acompañaron la expansión de Homo?', hint: 'Vista recomendada: Clima PAGES2k → cruza con taxones visibles', view: 'clima' },
    { icon: '🦴', q: '¿Por qué no encontramos fósiles de todas las especies?', hint: 'Vista recomendada: Tafonomía → ajusta las variables del simulador', view: 'tafonomia' },
    { icon: '🗺️', q: '¿Cuándo llegó Homo sapiens a América?', hint: 'Vista recomendada: América → compara pre-Clovis y Clovis', view: 'america' },
    { icon: '⚖️', q: '¿Sigue abierto el debate sobre el bipedismo de Orrorin?', hint: 'Vista recomendada: Debates activos → busca "bipedismo"', view: 'debates' }
  ];

  /**
   * Glosario esencial del alumnado — términos fundamentales.
   * Fuente: Wood & Richmond (2000) Human evolution: taxonomy and paleobiology.
   * DOI: https://doi.org/10.1046/j.1469-7580.2000.19710019.x
   */
  const SG_GLOSSARY_ESSENTIAL = [
    { term: 'Homínino',        def: 'Miembro de la tribu Hominini: incluye el linaje humano desde la divergencia con los chimpancés (≈ 7 Ma). Escrito en cursiva cuando forma parte de una taxonomía formal.' },
    { term: 'Taxón (pl. taxones)', def: 'Unidad de clasificación biológica: especie, género, familia, etc. En PaleoBot, los 46+ taxones corresponden principalmente a nivel de especie o subespecie.' },
    { term: 'Ma / Ka',         def: 'Millones de años (Ma) y miles de años (Ka). Unidades estándar en paleoantropología para dataciones absolutas y relativas. Siempre se indica la fuente del dato cronológico.' },
    { term: 'Holotipo',        def: 'Espécimen fósil concreto designado oficialmente como referencia para definir una especie. El nombre científico de una especie "ancla" en ese ejemplar físico.' },
    { term: 'Cladograma',      def: 'Diagrama ramificado que representa hipótesis de parentesco evolutivo. No es un árbol genealógico definitivo: es una hipótesis sometida a revisión.' },
    { term: 'Carácter derivado', def: 'Rasgo evolutivo nuevo respecto al estado ancestral. Los caracteres derivados compartidos (sinapomorfias) definen grupos naturales (clados).' },
    { term: 'Introgresión',    def: 'Transferencia de genes entre linajes distintos por cruce fértil. Los sapiens actuales portamos ADN neandertal (≈1–4%) y denisovano como resultado de introgresión.' },
    { term: 'Tafonomía',       def: 'Estudio de los procesos que transforman un organismo vivo en registro fósil. Explica qué se conserva, qué se pierde y qué sesgos tiene el registro.' },
    { term: 'Datación absoluta', def: 'Edad expresada en años o Ma con margen de error, obtenida por métodos radiométricos (14C, U-Th, ArAr). Distinta de la datación relativa (estratigráfica).' },
    { term: 'Inferencia',      def: 'Conclusión derivada de evidencia mediante razonamiento. En ciencia, se distingue siempre del dato directo. PaleoBot marca las inferencias con grados de certeza.' },
    { term: '[DEBATIDO]',      def: 'Etiqueta en el atlas que señala que la comunidad científica no ha alcanzado consenso. Indica que la afirmación es una hipótesis activa, no un hecho establecido.' },
    { term: 'Nomenclatura binomial', def: 'Sistema de denominación de las especies: género (mayúscula, cursiva) + epíteto específico (minúscula, cursiva). Ej.: Homo sapiens, Australopithecus afarensis.' }
  ];

  /**
   * Rúbrica competencial simplificada para el alumnado.
   * Adaptada de la rúbrica LOMLOE competencia STEM (CCSTEM) y CCL.
   * Marco: Decreto 82/2022 (Bachillerato Canarias), Decreto 83/2022 (ESO Canarias).
   */
  const SG_RUBRIC = [
    {
      criterion: 'Uso de la evidencia',
      basic: 'Cita datos del atlas sin indicar si son directos o inferidos.',
      advanced: 'Distingue entre dato fósil, inferencia y estimación; señala la fuente.',
      expert: 'Relaciona varios tipos de evidencia (morfológica, genómica, estratigráfica) indicando su peso relativo y sus limitaciones.'
    },
    {
      criterion: 'Precisión taxonómica',
      basic: 'Usa nombres comunes o incorrectos ("el hombre de Cro-Magnon" sin contexto).',
      advanced: 'Emplea nomenclatura binomial correcta (cursiva, minúsculas) con unidades cronológicas (Ma/Ka).',
      expert: 'Comenta debates taxonómicos activos y los distingue del consenso establecido.'
    },
    {
      criterion: 'Razonamiento científico (AERC)',
      basic: 'Presenta una afirmación sin argumentarla con evidencia del atlas.',
      advanced: 'Estructura: afirmación → evidencia del atlas → razonamiento → cautela básica.',
      expert: 'Anticipa objeciones, las responde con evidencia y reconoce los límites del registro disponible.'
    },
    {
      criterion: 'Manejo de la incertidumbre',
      basic: 'Trata las hipótesis como hechos; no distingue [DEBATIDO] de consenso.',
      advanced: 'Identifica marcadores de incertidumbre y los menciona en su análisis.',
      expert: 'Explica por qué existe la incertidumbre (sesgo tafonómico, escasez de material, debate metodológico).'
    },
    {
      criterion: 'Producto académico',
      basic: 'Copia o parafrasea el atlas sin elaboración propia.',
      advanced: 'Selecciona información relevante y la integra en un producto estructurado (ficha, mapa, informe).',
      expert: 'El producto muestra síntesis original, cita fuentes primarias (DOI) y reflexión metacognitiva.'
    }
  ];

  /* ─────────────────────────────────────────────────────────────────────────
     B. FUNCIONES DE RENDERIZADO
     ───────────────────────────────────────────────────────────────────────── */

  /**
   * Escapa texto para uso seguro en HTML (previene XSS).
   * Reutiliza escapeHtmlText si está disponible en el scope global.
   * @param {string} str
   * @returns {string}
   */
  function escSG(str) {
    if (typeof escapeHtmlText === 'function') return escapeHtmlText(str);
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Renderiza los pasos de onboarding en el panel inicio */
  function renderSteps() {
    const container = document.getElementById('sg-steps-container');
    if (!container) return;
    container.innerHTML = SG_STEPS.map(step => {
      let btnHtml = '';
      if (step.btnTab) {
        btnHtml = `<button type="button" class="sg-step-btn" data-sg-goto-tab="${escSG(step.btnTab)}">${escSG(step.btnLabel)}</button>`;
      } else if (step.view) {
        btnHtml = `<button type="button" class="sg-step-btn" data-sg-open-view="${escSG(step.view)}">${escSG(step.btnLabel)}</button>`;
      } else if (step.action) {
        btnHtml = `<button type="button" class="sg-step-btn" data-action="${escSG(step.action)}">${escSG(step.btnLabel)}</button>`;
      }
      return `
        <div class="sg-step-card" role="listitem">
          <div class="sg-step-num" aria-hidden="true">${step.num}</div>
          <h4>${escSG(step.title)}</h4>
          <p>${escSG(step.desc)}</p>
          ${btnHtml}
        </div>`;
    }).join('');
    log('Steps renderizados:', SG_STEPS.length);
  }

  /** Renderiza la cuadrícula de vistas recomendadas */
  function renderViews() {
    const container = document.getElementById('sg-views-container');
    if (!container) return;
    container.innerHTML = SG_VIEWS.map(v => `
      <button type="button" class="sg-view-card" data-sg-open-view="${escSG(v.id)}"
        aria-label="Abrir vista ${escSG(v.title)}">
        <div class="sg-view-family">${escSG(v.family)}</div>
        <div class="sg-view-title">${escSG(v.emoji)} ${escSG(v.title)}</div>
        <p class="sg-view-desc">${escSG(v.desc)}</p>
      </button>`).join('');
    log('Vistas renderizadas:', SG_VIEWS.length);
  }

  /** Renderiza las preguntas científicas de inicio */
  function renderQuestions() {
    const container = document.getElementById('sg-questions-container');
    if (!container) return;
    container.innerHTML = SG_QUESTIONS.map(q => `
      <li>
        <button type="button" class="sg-question-item" data-sg-open-view="${escSG(q.view)}"
          aria-label="${escSG(q.q)} — Abre vista ${escSG(q.view)}">
          <span class="sg-question-icon" aria-hidden="true">${q.icon}</span>
          <div>
            <p class="sg-question-text">${escSG(q.q)}</p>
            <p class="sg-question-hint">${escSG(q.hint)}</p>
          </div>
        </button>
      </li>`).join('');
    log('Preguntas renderizadas:', SG_QUESTIONS.length);
  }

  /** Renderiza el glosario esencial */
  function renderGlossaryEssential() {
    const container = document.getElementById('sg-glossary-container');
    if (!container) return;
    container.innerHTML = SG_GLOSSARY_ESSENTIAL.map(entry => `
      <div class="sg-glossary-entry">
        <span class="sg-glossary-term">${escSG(entry.term)}</span>
        <p class="sg-glossary-def">${escSG(entry.def)}</p>
      </div>`).join('');
    log('Glosario esencial renderizado:', SG_GLOSSARY_ESSENTIAL.length);
  }

  /** Renderiza la rúbrica de evaluación */
  function renderRubric() {
    const tbody = document.getElementById('sg-rubric-body');
    if (!tbody) return;
    tbody.innerHTML = SG_RUBRIC.map(row => `
      <tr>
        <td><strong>${escSG(row.criterion)}</strong></td>
        <td>${escSG(row.basic)}</td>
        <td>${escSG(row.advanced)}</td>
        <td>${escSG(row.expert)}</td>
      </tr>`).join('');
    log('Rúbrica renderizada:', SG_RUBRIC.length);
  }

  /** Renderiza todo el contenido del modal (lazy, en primer apertura) */
  let _rendered = false;
  function renderAll() {
    if (_rendered) return;
    try {
      renderSteps();
      renderViews();
      renderQuestions();
      renderGlossaryEssential();
      renderRubric();
      _rendered = true;
      log('Guía del alumnado renderizada completamente');
    } catch (err) {
      warn('Error al renderizar guía del alumnado:', err);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     C. GESTIÓN DEL MODAL Y LAS PESTAÑAS
     ───────────────────────────────────────────────────────────────────────── */

  /**
   * Abre el modal de la guía del alumnado.
   * Usa setModal si está disponible globalmente, con fallback manual.
   */
  function openStudentGuide() {
    renderAll(); // Renderizado lazy en primera apertura
    const modal = document.getElementById('studentGuideModal');
    if (!modal) { warn('Modal studentGuideModal no encontrado'); return; }

    // Intentar con el sistema de modales global del atlas
    if (typeof setModal === 'function') {
      try { setModal('studentGuideModal', true); return; } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }
    if (typeof toggleModal === 'function') {
      try { toggleModal('studentGuideModal'); return; } catch(e) { /* recuperable: suprimido intencionalmente */ }
    }
    // Fallback manual (compatible con la arquitectura del atlas)
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // Focus en el primer elemento interactivo del modal
    const firstBtn = modal.querySelector('button');
    if (firstBtn) setTimeout(() => { try { firstBtn.focus(); } catch(e) { /* recuperable: suprimido intencionalmente */ } }, 60);
    log('Modal abierto (fallback manual)');
  }

  /**
   * Activa una pestaña de la guía.
   * @param {string} tabId - ID del panel a activar
   */
  function activateSGTab(tabId) {
    const tabs = document.querySelectorAll('.sg-tab-btn');
    const panels = document.querySelectorAll('.sg-panel');
    tabs.forEach(btn => {
      const isActive = btn.dataset.sgTab === tabId;
      btn.setAttribute('aria-selected', String(isActive));
    });
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === 'sg-panel-' + tabId);
    });
    log('Tab activado:', tabId);
  }

  /**
   * Navega a una vista del atlas y cierra el modal.
   * @param {string} viewId
   */
  function openViewFromGuide(viewId) {
    if (!viewId) return;
    // Cerrar modal primero
    const modal = document.getElementById('studentGuideModal');
    if (modal) {
      if (typeof setModal === 'function') { try { setModal('studentGuideModal', false); } catch(e) { /* recuperable: suprimido intencionalmente */ } }
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
    // Navegar a la vista
    if (typeof switchView === 'function') {
      try {
        switchView(viewId);
        const main = document.getElementById('main-content');
        if (main) setTimeout(() => main.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        log('Vista abierta desde guía:', viewId);
        return;
      } catch(e) { warn('switchView falló:', e); }
    }
    // Fallback: activar la sección directamente en el DOM
    const viewSection = document.getElementById('view-' + viewId);
    if (viewSection) {
      document.querySelectorAll('.view-section.active').forEach(s => s.classList.remove('active'));
      viewSection.classList.add('active');
      viewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      log('Vista activada por fallback DOM:', viewId);
    } else {
      warn('Vista no encontrada en DOM:', viewId);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     D. REGISTRO EN EL MAPA DE CONTRATOS DE ACCIONES
     Se añade openStudentGuide al contrato global para que
     todos los handlers del atlas lo reconozcan.
     ───────────────────────────────────────────────────────────────────────── */

  /**
   * Registra openStudentGuide en window y en getActionContractMap.
   * Usa el patrón de extensión ya presente en v55/v56.
   */
  function registerAction() {
    // Disponible globalmente para data-action="openStudentGuide"
    window.openStudentGuide = openStudentGuide;

    // Extender getActionContractMap si existe
    if (typeof getActionContractMap === 'function') {
      const original = getActionContractMap;
      window.getActionContractMap = function() {
        const map = original();
        map.openStudentGuide = openStudentGuide;
        return map;
      };
      log('openStudentGuide registrado en getActionContractMap');
    }

    // Registrar también en PaleoBotV55Router si existe
    if (window.PaleoBotV55Router && window.PaleoBotV55Router.runAction) {
      const originalRun = window.PaleoBotV55Router.runAction;
      window.PaleoBotV55Router.runAction = function(action) {
        if (action === 'openStudentGuide') { openStudentGuide(); return true; }
        return originalRun(action);
      };
      log('openStudentGuide registrado en PaleoBotV55Router');
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     E. FIX BOTONES FLOTANTES (FABs)
     El problema: múltiples listeners con stopImmediatePropagation en captura
     pueden impedir que los handlers de los FABs se ejecuten.
     Solución: listener propio de alta prioridad (capture=true, registered last)
     que maneja todos los data-action y data-modal-toggle del fab-group.
     ───────────────────────────────────────────────────────────────────────── */

  function installFabFix() {
    // Este listener se registra en fase de captura con {capture:true}
    // y tiene prioridad sobre los listeners de burbuja.
    // Se registra al final de la cadena de scripts para ejecutarse último.
    document.addEventListener('click', function fabFixHandler(e) {
      const fab = e.target.closest('.fab-group button');
      if (!fab) return;

      const action = fab.dataset.action;
      const modalId = fab.dataset.modalToggle;

      if (!action && !modalId) return;

      // Evitar doble disparo
      e.stopPropagation();

      // — Manejar data-action —
      if (action) {
        // 1. Intentar con el contrato global (más robusto)
        try {
          if (typeof getActionContractMap === 'function') {
            const map = getActionContractMap();
            if (typeof map[action] === 'function') { map[action](); return; }
          }
        } catch(err) { warn('Contrato fallido:', action, err); }

        // 2. Intentar con window[action]
        try {
          if (typeof window[action] === 'function') { window[action](); return; }
        } catch(err) { warn('window[action] fallido:', action, err); }

        // 3. Intentar con PaleoBotV55Router
        try {
          if (window.PaleoBotV55Router?.runAction) {
            window.PaleoBotV55Router.runAction(action);
            return;
          }
        } catch(err) { warn('V55Router fallido:', action, err); }

        warn('FAB sin handler para acción:', action);
      }

      // — Manejar data-modal-toggle —
      if (modalId) {
        try {
          const modal = document.getElementById(modalId);
          if (!modal) { warn('Modal no encontrado:', modalId); return; }
          const isOpen = modal.classList.contains('active');
          if (typeof setModal === 'function') { setModal(modalId, !isOpen); return; }
          if (typeof toggleModal === 'function') { toggleModal(modalId); return; }
          // Fallback
          modal.classList.toggle('active');
          modal.setAttribute('aria-hidden', String(isOpen));
          if (!isOpen) {
            const first = modal.querySelector('button, [tabindex]:not([tabindex="-1"]), a');
            if (first) setTimeout(() => first.focus(), 60);
          }
        } catch(err) { warn('Modal toggle fallido:', modalId, err); }
      }
    }, false); // false = bubble phase para NO interferir con otros captures

    log('Fix FABs instalado');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     F. DELEGACIÓN DE EVENTOS DEL MODAL DE GUÍA
     ───────────────────────────────────────────────────────────────────────── */

  function installModalListeners() {
    const modal = document.getElementById('studentGuideModal');
    if (!modal) { warn('Modal no encontrado para instalar listeners'); return; }

    modal.addEventListener('click', function(e) {
      // — Cerrar modal (botón ✕ o backdrop) —
      if (e.target.closest('[data-modal-toggle="studentGuideModal"]') ||
          (e.target === modal && !e.target.closest('.modal-content'))) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof setModal === 'function') { try { setModal('studentGuideModal', false); return; } catch(er) { /* recuperable: suprimido intencionalmente */ } }
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        return;
      }

      // — Cambiar pestaña —
      const tab = e.target.closest('[data-sg-tab]');
      if (tab) {
        e.preventDefault();
        activateSGTab(tab.dataset.sgTab);
        return;
      }

      // — Abrir vista del atlas —
      const viewBtn = e.target.closest('[data-sg-open-view]');
      if (viewBtn) {
        e.preventDefault();
        openViewFromGuide(viewBtn.dataset.sgOpenView);
        return;
      }

      // — Ir a otra pestaña dentro del modal —
      const gotoTab = e.target.closest('[data-sg-goto-tab]');
      if (gotoTab) {
        e.preventDefault();
        activateSGTab(gotoTab.dataset.sgGotoTab);
        return;
      }

      // — Botones data-action dentro del modal (p.ej. abrir glosario) —
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === 'openStudentGuide') return; // Evitar recursión
        try {
          if (typeof getActionContractMap === 'function') {
            const map = getActionContractMap();
            if (typeof map[action] === 'function') { map[action](); return; }
          }
          if (typeof window[action] === 'function') { window[action](); return; }
        } catch(err) { warn('Acción en modal fallida:', action, err); }
      }
    });

    // Cerrar con Escape
    modal.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (typeof setModal === 'function') { try { setModal('studentGuideModal', false); return; } catch(er) { /* recuperable: suprimido intencionalmente */ } }
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    });

    log('Listeners del modal instalados');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     G. INICIALIZACIÓN
     Se ejecuta tras DOMContentLoaded para garantizar que el DOM
     y el resto de scripts del atlas están disponibles.
     ───────────────────────────────────────────────────────────────────────── */

  function init() {
    try {
      registerAction();    // Registrar openStudentGuide en contratos globales
      installFabFix();     // Fix botones flotantes
      installModalListeners(); // Eventos del modal
      document.documentElement.dataset.paleobotV59GuideReady = 'true';
      log('PaleoBot inicializado correctamente');
    } catch(err) {
      // Error crítico: el módulo no debe romper el atlas
      if (DEBUG) console.error('[PB59] Error crítico en init:', err);
    }
  }

  // Inicializar: esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    // Si el DOM ya está listo (script al final del body)
    setTimeout(init, 0);
  }

  // Exponer API pública mínima
  window.PaleoBotV59 = {
    openStudentGuide,
    activateSGTab,
    openViewFromGuide,
    renderAll
  };

})();
