/* PB-GH-11 · Script que estaba en línea en atlas/index.html (línea 114 en c971001, tras #pb-skip-intro-bar).
   Movido sin cambios a un archivo propio para retirar 'unsafe-inline' de script-src (fila 30).
   Se carga síncrono (sin defer) en la misma posición: conserva el orden de ejecución. */
  /* Handler en captura (registrado durante el parseo, antes que los guards defer/lazy)
     para que el salto al atlas no lo intercepte ningún guard de clic en captura. */
  (function(){
    function protectNutcrackerExternal(ev){
      var link = ev.target && ev.target.closest && ev.target.closest('[data-pbnm-external]');
      if(!link) return;
      if(ev.button && ev.button !== 0) return;
      if(ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
      var target = link.getAttribute('data-pbnm-external') || link.href || link.getAttribute('href') || '';
      if(!/^https?:\/\//i.test(target)) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      document.documentElement.dataset.pbnmExternalNav = target;
      try {
        if(window.top && window.top !== window){
          window.top.location.assign(target);
          return;
        }
      } catch(_){ }
      window.location.assign(target);
    }
    window.addEventListener('pointerdown', protectNutcrackerExternal, true);
    window.addEventListener('click', protectNutcrackerExternal, true);

    window.addEventListener('click', function(ev){
      var bar = ev.target && ev.target.closest && ev.target.closest('#pb-skip-intro-bar');
      if(!bar) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      var m = document.getElementById('main-content');
      if(m){
        document.body.classList.add('pb-workspace-entered');
        window.scrollTo(0, m.getBoundingClientRect().top + window.pageYOffset - 8);
        m.setAttribute('tabindex','-1');
        try { m.focus({ preventScroll:true }); } catch(_){}
      }
    }, true);

    /* FIX (Claude 2026-06): clic en tarjetas de introgresión. Resiliente a la
       caché: una versión antigua de la capa v64 (035) puede quedar cacheada en el
       navegador; secuestraba el clic e impedía que el panel de detalle se
       rellenara. Este handler en window-capture se ejecuta ANTES que cualquier
       handler en document-capture (incluido el v64 viejo), llama a la API del
       núcleo window.selectIntrogEvent (que sí rellena el panel) y detiene la
       cadena para que el v64 viejo no rebote ni fije pbV50Block='investigar'. */
    window.addEventListener('click', function(ev){
      var card = ev.target && ev.target.closest && ev.target.closest('.introg-photo-card[data-introg-event]');
      if(!card) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(typeof window.selectIntrogEvent === 'function'){
        window.selectIntrogEvent(card.dataset.introgEvent || '');
      }
    }, true);

    window.addEventListener('click', function(ev){
      var toggle = ev.target && ev.target.closest && ev.target.closest('#pb-mobile-tools-toggle');
      if(!toggle) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      var open = !document.body.classList.contains('pb-mobile-tools-open');
      document.body.classList.toggle('pb-mobile-tools-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar herramientas' : 'Abrir herramientas');
      [document.getElementById('pb-floating-tools'), document.getElementById('pb-a11y-toolbar-root')].forEach(function(panel){
        if(!panel) return;
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
        if(open) panel.removeAttribute('inert'); else panel.setAttribute('inert','');
      });
      document.documentElement.dataset.pbMobileTools = open ? 'open' : 'closed';
    }, true);

    var protectedBibPointerAt = 0;
    function protectBibliographyFilter(ev){
      var filter = ev.target && ev.target.closest && ev.target.closest('[data-bib-filter]');
      if(!filter) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(ev.type === 'click' && Date.now() - protectedBibPointerAt < 500) return;
      if(ev.type === 'pointerdown') protectedBibPointerAt = Date.now();
      var key = filter.getAttribute('data-bib-filter') || 'all';
      if(window.PaleoBotV38Bibliography && typeof window.PaleoBotV38Bibliography.setBibliographyFilter === 'function') {
        window.PaleoBotV38Bibliography.setBibliographyFilter(key, filter);
      } else {
        document.querySelectorAll('[data-bib-filter]').forEach(function(button){
          var active = button === filter;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }
      document.body.dataset.pbProtectedBibFilter = key;
    }
    window.addEventListener('pointerdown', protectBibliographyFilter, true);
    window.addEventListener('click', protectBibliographyFilter, true);

    var protectedModalPointerAt = 0;
    function protectModalToggle(ev){
      var trigger = ev.target && ev.target.closest && ev.target.closest('[data-modal-toggle]');
      var modalId = trigger && trigger.getAttribute('data-modal-toggle');
      var modal = modalId && document.getElementById(modalId);
      if(!modal) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(ev.type === 'click' && Date.now() - protectedModalPointerAt < 500) return;
      if(ev.type === 'pointerdown') protectedModalPointerAt = Date.now();
      if(window.PaleoBotV88FloatingMenuFinal && typeof window.PaleoBotV88FloatingMenuFinal.toggleModal === 'function') {
        window.PaleoBotV88FloatingMenuFinal.toggleModal(modalId);
      } else {
        var open = !modal.classList.contains('active');
        modal.classList.toggle('active', open);
        modal.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
      document.body.dataset.pbProtectedModal = modalId;
    }
    window.addEventListener('pointerdown', protectModalToggle, true);
    window.addEventListener('click', protectModalToggle, true);

    var protectedQuizPointerAt = 0;
    function protectClassicQuizStart(ev){
      var trigger = ev.target && ev.target.closest && ev.target.closest('[data-quiz-next="classic"]');
      if(!trigger) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(ev.type === 'click' && Date.now() - protectedQuizPointerAt < 500) return;
      if(ev.type === 'pointerdown') protectedQuizPointerAt = Date.now();
      if(typeof window.runExam === 'function') window.runExam();
      document.body.dataset.pbProtectedQuiz = 'classic';
    }
    window.addEventListener('pointerdown', protectClassicQuizStart, true);
    window.addEventListener('click', protectClassicQuizStart, true);

    var protectedAnswerPointerAt = 0;
    function protectM13Answer(ev){
      var answer = ev.target && ev.target.closest && ev.target.closest('[data-m13-answer]');
      if(!answer) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(ev.type === 'click' && Date.now() - protectedAnswerPointerAt < 500) return;
      if(ev.type === 'pointerdown') protectedAnswerPointerAt = Date.now();
      if(window.PaleoBotM13Quiz && typeof window.PaleoBotM13Quiz.answer === 'function') {
        window.PaleoBotM13Quiz.answer(answer);
      }
      document.body.dataset.pbProtectedQuizAnswer = answer.getAttribute('data-m13-answer') || 'answer';
    }
    window.addEventListener('pointerdown', protectM13Answer, true);
    window.addEventListener('click', protectM13Answer, true);

    var protectedModalActions = {
      abrirBiblio:'biblioModal',
      openGlossary:'glossaryModal',
      startExam:'examModal',
      openMatrix:'matrixModal',
      abrirEstadisticas:'statsModal',
      openStudentGuide:'studentGuideModal',
      openSessionSynthesis:'sessionSynthesisModal',
      openCompare:'compareModal'
    };
    window.addEventListener('click', function(ev){
      var trigger = ev.target && ev.target.closest && ev.target.closest('[data-action]');
      var action = trigger && trigger.getAttribute('data-action');
      var modalId = protectedModalActions[action];
      if(!modalId) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(typeof window[action] === 'function') {
        window[action](trigger, ev);
      } else if(window.PaleoBotV68InteractionStabilizer && typeof window.PaleoBotV68InteractionStabilizer.runAction === 'function') {
        window.PaleoBotV68InteractionStabilizer.runAction(action);
      } else {
        var modal = document.getElementById(modalId);
        if(modal){ modal.classList.add('active'); modal.setAttribute('aria-hidden','false'); }
      }
      document.body.dataset.pbProtectedAction = action;
    }, true);
  })();
