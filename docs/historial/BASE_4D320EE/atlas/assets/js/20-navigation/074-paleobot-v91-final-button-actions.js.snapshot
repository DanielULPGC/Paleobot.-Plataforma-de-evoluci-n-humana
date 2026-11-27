// PaleoBot: final button action repairs for audited interactive controls.
(function(){
  'use strict';

  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    });
  }

  function speciesPool(){
    return (Array.isArray(window.DB) ? window.DB : []).filter(function(sp){
      return sp && (sp.nombre || sp.nombreCorto);
    });
  }

  function chooseSpecies(){
    var pool = speciesPool();
    return pool[Math.floor(Math.random() * pool.length)] || pool[0] || null;
  }

  function buildClassicQuiz(sp){
    var pool = speciesPool();
    var clades = window.CLADE_NAMES || {};
    var answer = clades[sp.clado] || sp.ubicacion || sp.anos || sp.holo || 'dato disponible';
    var distractors = pool.map(function(item){
      return clades[item.clado] || item.ubicacion || item.anos || item.holo;
    }).filter(Boolean).filter(function(item, pos, arr){
      return item !== answer && arr.indexOf(item) === pos;
    }).sort(function(){ return Math.random() - 0.5; }).slice(0, 3);
    var options = [answer].concat(distractors).sort(function(){ return Math.random() - 0.5; });
    return [
      '<p class="exam-question-title">Que opcion se asocia mejor con <strong>' + escapeHtml(sp.nombre || sp.nombreCorto) + '</strong>?</p>',
      '<div class="exam-options">',
      options.map(function(opt){
        return '<button type="button" class="exam-opt" data-pb-v91-answer="' + (opt === answer ? '1' : '0') + '">' + escapeHtml(opt) + '</button>';
      }).join(''),
      '</div>',
      '<p class="exam-feedback" data-pb-v91-feedback aria-live="polite"></p>',
      '<div class="exam-action-row"><button type="button" class="exam-btn" data-quiz-back="intro">Volver</button></div>'
    ].join('');
  }

  function buildGenerativeFallback(sp){
    var name = sp.nombre || sp.nombreCorto || 'la especie seleccionada';
    var place = sp.ubicacion || 'su yacimiento';
    var age = sp.anos || sp.holo || 'su cronologia';
    return [
      '<p class="exam-question-title">Pregunta guiada local</p>',
      '<p><strong>' + escapeHtml(name) + '</strong>: formula una hipotesis breve que conecte <strong>' + escapeHtml(place) + '</strong> con <strong>' + escapeHtml(age) + '</strong>.</p>',
      '<label class="sr-only" for="pb-v91-free-answer">Respuesta del alumnado</label>',
      '<textarea id="pb-v91-free-answer" class="exam-free-answer" rows="4" placeholder="Dato observado, inferencia y cautela..."></textarea>',
      '<div class="exam-action-row">',
      '<button type="button" class="exam-btn accent" data-pb-v91-reveal>Ver orientacion</button>',
      '<button type="button" class="exam-btn" data-quiz-back="intro">Volver</button>',
      '</div>',
      '<p class="exam-feedback" data-pb-v91-feedback hidden>Una buena respuesta distingue localizacion, datacion y cautela: la proximidad geografica no demuestra parentesco directo.</p>'
    ].join('');
  }

  function startQuiz(mode){
    var q = document.getElementById('examQ');
    var intro = document.getElementById('examIntro');
    var sp = chooseSpecies();
    if (!q || !sp) return false;
    if (intro) {
      intro.style.display = 'none';
      intro.hidden = true;
    }
    q.hidden = false;
    q.style.display = 'block';
    q.classList.add('active');
    q.innerHTML = mode === 'generative' ? buildGenerativeFallback(sp) : buildClassicQuiz(sp);
    document.documentElement.dataset.paleobotV91Quiz = mode || 'classic';
    return true;
  }

  function resetQuiz(){
    var q = document.getElementById('examQ');
    var intro = document.getElementById('examIntro');
    if (q) {
      q.innerHTML = '';
      q.classList.remove('active');
      q.style.display = 'none';
      q.hidden = false;
    }
    if (intro) {
      intro.hidden = false;
      intro.style.display = '';
    }
    return true;
  }

  function answerQuiz(button){
    var host = button.closest('#examQ');
    var ok = button.dataset.pbV91Answer === '1';
    if (!host) return false;
    host.querySelectorAll('[data-pb-v91-answer]').forEach(function(opt){
      opt.disabled = true;
      opt.classList.toggle('exam-correct', opt.dataset.pbV91Answer === '1');
    });
    button.classList.toggle('exam-wrong', !ok);
    var feedback = host.querySelector('[data-pb-v91-feedback]');
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = ok ? 'Correcto: la asociacion es coherente con la ficha.' : 'Revisa la ficha y distingue dato observado de inferencia.';
    }
    return true;
  }

  function ensurePresentationReady(){
    var overlay = document.getElementById('presOverlay');
    if (overlay && !overlay.classList.contains('active') && typeof window.openPresentation === 'function') {
      try { window.openPresentation(); } catch(err) {}
    }
    if (overlay) {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
    }
  }

  function openPresentationMap(){
    ensurePresentationReady();
    var modal = document.getElementById('presMapModal');
    if (!modal) return false;
    try {
      if (typeof window.openPresMapModal === 'function') window.openPresMapModal();
    } catch(err) {}
    if (!modal.classList.contains('active')) {
      var body = document.getElementById('presMapModalBody');
      var source = document.getElementById('presMapSvg');
      var title = document.getElementById('presMapModalTitle');
      var sub = document.getElementById('presMapModalSub');
      var foot = document.getElementById('presMapModalFoot');
      if (title) title.textContent = 'Mapa ampliado';
      if (sub) sub.textContent = document.getElementById('presLocLabel')?.textContent || 'Contexto geografico del yacimiento';
      if (body) {
        body.innerHTML = '';
        if (source) {
          var clone = source.cloneNode(true);
          clone.removeAttribute('id');
          clone.classList.add('pres-map-dot-overlay-expanded');
          body.appendChild(clone);
        } else {
          body.innerHTML = '<div class="pres-map-fallback">Mapa ampliado disponible al abrir una ficha de presentacion.</div>';
        }
      }
      if (foot) foot.textContent = 'Lectura: localizar el yacimiento y contrastar region, relieve y proximidad.';
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('modal-open');
    document.documentElement.dataset.paleobotV91PresentationMap = 'open';
    return true;
  }

  function openStudentGuideModal(){
    var modal = document.getElementById('studentGuideModal');
    if (!modal) return false;
    try {
      if (window.PaleoBotV59 && typeof window.PaleoBotV59.renderAll === 'function') window.PaleoBotV59.renderAll();
    } catch(err) {}
    modal.classList.add('active');
    modal.hidden = false;
    modal.removeAttribute('inert');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    return true;
  }

  function activateStudentGuideTab(tabId){
    if (!tabId) return false;
    openStudentGuideModal();
    document.querySelectorAll('#studentGuideModal [data-sg-tab]').forEach(function(btn){
      var active = btn.dataset.sgTab === tabId;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.classList.toggle('active', active);
    });
    document.querySelectorAll('#studentGuideModal .sg-panel').forEach(function(panel){
      var active = panel.id === 'sg-panel-' + tabId;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
      panel.style.display = active ? 'block' : 'none';
    });
    document.documentElement.dataset.paleobotV91StudentGuideTab = tabId;
    return true;
  }

  function closeGenericModal(id){
    if (!id) return false;
    var modal = document.getElementById(id);
    if (!modal) return false;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = false;
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal-overlay.active,.pb-v50-modal.active,.pres-overlay.active,.pres-map-modal.active,.lightbox.active,.socratic-overlay.active')));
    document.documentElement.dataset.paleobotV91ClosedModal = id;
    return true;
  }

  function closeV50Map(){
    return closeGenericModal('pbV50MapModal');
  }

  function currentFontPercent(){
    var raw = String(document.documentElement.style.fontSize || '100').replace('%', '');
    var value = parseInt(raw, 10);
    return Number.isFinite(value) ? value : 100;
  }

  function runA11yColor(mode){
    if (window.PaleoBotV74FloatingA11yRepair && typeof window.PaleoBotV74FloatingA11yRepair.setColorMode === 'function') {
      window.PaleoBotV74FloatingA11yRepair.setColorMode(mode);
    } else {
      document.documentElement.dataset.pbColorMode = mode || 'normal';
      document.querySelectorAll('[data-color-mode]').forEach(function(btn){
        var active = btn.dataset.colorMode === mode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    document.documentElement.dataset.paleobotV91ColorMode = mode || 'normal';
    return true;
  }

  function runA11yFont(action){
    var next = currentFontPercent();
    if (action === 'increase') next += 10;
    if (action === 'decrease') next -= 10;
    if (action === 'reset') next = 100;
    next = Math.max(80, Math.min(150, Math.round(next / 10) * 10));
    if (window.PaleoBotV74FloatingA11yRepair && typeof window.PaleoBotV74FloatingA11yRepair.setFont === 'function') {
      window.PaleoBotV74FloatingA11yRepair.setFont(next);
    } else {
      document.documentElement.style.fontSize = next + '%';
      document.querySelectorAll('.pb-font-display').forEach(function(el){ el.textContent = next + '%'; });
    }
    document.documentElement.dataset.paleobotV91FontSize = String(next);
    return true;
  }

  function routeView(viewId){
    if (!viewId) return false;
    function isActive(){
      var target = document.getElementById('view-' + viewId);
      return !!(target && (target.classList.contains('active') || target.getAttribute('aria-hidden') === 'false'));
    }
    if (window.PaleoBotV68InteractionStabilizer && typeof window.PaleoBotV68InteractionStabilizer.routeView === 'function') {
      try { window.PaleoBotV68InteractionStabilizer.routeView(viewId); } catch(err) {}
      if (isActive()) return true;
    }
    if (typeof window.switchView === 'function') {
      try {
        window.switchView(viewId);
        if (isActive()) {
          document.documentElement.dataset.paleobotV91TargetView = viewId;
          return true;
        }
      } catch(err) {}
    }
    var target = document.getElementById('view-' + viewId);
    if (!target) return false;
    document.querySelectorAll('.view-section').forEach(function(section){
      var active = section === target;
      section.classList.toggle('active', active);
      section.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    document.documentElement.dataset.paleobotV91TargetView = viewId;
    return true;
  }

  function closeSoftPanel(button){
    var panel = button.closest('.pb-dap-panel,.pb-dap-card,.pb-dap-container,.pb-dap-banner,.pb-banner,.didactic-activation-panel,.activation-panel');
    if (panel && panel !== document.body) {
      panel.hidden = true;
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
    }
    document.documentElement.dataset.paleobotV91ClosedSoftPanel = 'true';
    return true;
  }

  function handleFinalButtons(event){
    if (!event.target || !event.target.closest) return;
    var modalBack = event.target.closest('[data-modal-back]');
    if (modalBack) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      closeGenericModal(modalBack.dataset.modalBack);
      return;
    }
    var v50MapClose = event.target.closest('[data-pb-v50-close-map]');
    if (v50MapClose) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      closeV50Map();
      return;
    }
    var targetView = event.target.closest('[data-target-view]');
    if (targetView) {
      event.preventDefault();
      document.body.dataset.v91TargetClick = targetView.dataset.targetView || '';
      routeView(targetView.dataset.targetView);
      window.setTimeout(function(){ routeView(targetView.dataset.targetView); }, 0);
      window.setTimeout(function(){ routeView(targetView.dataset.targetView); }, 40);
      return;
    }
    var backAction = event.target.closest('[data-back-action]');
    if (backAction) {
      // Los botones internos de una ficha cierran esa capa. El botón global
      // debe llegar al router principal para recuperar la vista anterior.
      if (backAction.matches('[data-panel-close],.panel-back-btn') ||
          backAction.closest('#detailView,.detail-panel,.side-panel')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        closeGenericModal('detailView');
        document.documentElement.dataset.paleobotV91BackAction = 'detail-closed';
      }
      return;
    }
    var softClose = event.target.closest('.pb-dap-close,.pb-banner-close');
    if (softClose) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      closeSoftPanel(softClose);
      return;
    }
    var quiz = event.target.closest('[data-quiz-next]');
    if (quiz) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      startQuiz(quiz.dataset.quizNext || 'classic');
      return;
    }
    var quizBack = event.target.closest('[data-quiz-back]');
    if (quizBack) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      resetQuiz();
      return;
    }
    var quizAnswer = event.target.closest('[data-pb-v91-answer]');
    if (quizAnswer) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      answerQuiz(quizAnswer);
      return;
    }
    var reveal = event.target.closest('[data-pb-v91-reveal]');
    if (reveal) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var feedback = document.querySelector('#examQ [data-pb-v91-feedback]');
      if (feedback) feedback.hidden = false;
      return;
    }
    var map = event.target.closest('[data-pres-map-expand]');
    if (map) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openPresentationMap();
      return;
    }
    var sgTab = event.target.closest('[data-sg-tab]');
    if (sgTab) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      activateStudentGuideTab(sgTab.dataset.sgTab);
      return;
    }
    var sgGoto = event.target.closest('[data-sg-goto-tab]');
    if (sgGoto) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      activateStudentGuideTab(sgGoto.dataset.sgGotoTab);
      return;
    }
    var color = event.target.closest('[data-color-mode]');
    if (color) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      runA11yColor(color.dataset.colorMode);
      return;
    }
    var font = event.target.closest('[data-font-action]');
    if (font) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      runA11yFont(font.dataset.fontAction);
    }
  }

  window.addEventListener('click', handleFinalButtons, true);
  window.PaleoBotV91FinalButtonActions = {
    startQuiz:startQuiz,
    resetQuiz:resetQuiz,
    openPresentationMap:openPresentationMap,
    activateStudentGuideTab:activateStudentGuideTab,
    closeGenericModal:closeGenericModal,
    closeV50Map:closeV50Map,
    runA11yColor:runA11yColor,
    runA11yFont:runA11yFont,
    routeView:routeView,
    closeSoftPanel:closeSoftPanel
  };
  document.documentElement.dataset.paleobotV91FinalButtonActions = 'ready';
})();
