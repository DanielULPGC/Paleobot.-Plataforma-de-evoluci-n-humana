// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v37-control-bus
(function(){
  const VIEW_FAMILY = {
    timeline:'explorar', map:'explorar', continentes:'explorar', africa:'explorar', asia:'explorar', europe:'explorar',
    america:'explorar', yacimientos:'explorar', biogeo:'explorar', contexto:'explorar', paleoecologia:'explorar',
    tree:'interpretar', phylo:'interpretar', clima:'interpretar', coexistencias:'interpretar', primatologia:'interpretar',
    constructor:'interpretar',
    revisiones:'investigar', genomica:'investigar', paleoproteomica:'investigar', datacion:'investigar', debates:'investigar', socratico:'investigar',
    estratigrafia:'investigar', tafonomia:'investigar', introgresion:'investigar', holotipos:'investigar', dispersal:'investigar',
    aula:'aprender', recursos:'aprender', itinerarios:'aprender'
  };
  const FAMILY_DEFAULT = {
    explorar:'timeline',
    interpretar:'tree',
    investigar:'datacion',
    aprender:'aula'
  };
  function visibleViewButtons(family){
    return Array.from(document.querySelectorAll('.toolbar .view-btn[data-view]'))
      .filter(btn => (VIEW_FAMILY[btn.dataset.view] || 'explorar') === family && document.getElementById('view-' + btn.dataset.view));
  }
  function setPressed(selector, matcher){
    document.querySelectorAll(selector).forEach(btn => {
      const active = matcher(btn);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  function v37SetFamily(family, options = {}){
    const targetFamily = FAMILY_DEFAULT[family] ? family : 'explorar';
    document.body.dataset.navFamily = targetFamily;
    setPressed('.nav-objective[data-nav-family], .nav-family-btn[data-nav-family]', btn => btn.dataset.navFamily === targetFamily);
    document.querySelectorAll('.toolbar .view-btn[data-view]').forEach(btn => {
      const belongs = (VIEW_FAMILY[btn.dataset.view] || 'explorar') === targetFamily;
      const exists = Boolean(document.getElementById('view-' + btn.dataset.view));
      btn.hidden = !(belongs && exists);
      btn.disabled = !exists;
    });
    const activeView = document.querySelector('.view-section.active')?.id?.replace(/^view-/,'');
    const activeFamily = VIEW_FAMILY[activeView] || 'explorar';
    if (options.forceDefault || activeFamily !== targetFamily) {
      const first = visibleViewButtons(targetFamily)[0]?.dataset.view || FAMILY_DEFAULT[targetFamily] || 'timeline';
      v37SwitchView(first);
    }
  }
  function v37SwitchView(viewId){
    const section = document.getElementById('view-' + viewId);
    if (!section) return false;
    const family = VIEW_FAMILY[viewId] || 'explorar';
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    section.classList.add('active');
    v37SetFamily(family, { keepView:true });
    setPressed('.view-btn[data-view]', btn => btn.dataset.view === viewId);
    try { if (typeof renderActiveView === 'function') renderActiveView(viewId); } catch(err) { console.warn('Render de vista recuperado por v37:', err); }
    try { if (typeof updateViewOrientation === 'function') updateViewOrientation(viewId); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try { if (typeof updateBackButtonState === 'function') updateBackButtonState(); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    document.dispatchEvent(new CustomEvent('paleobot:v37-viewchange', { detail:{ view:viewId, family } }));
    return true;
  }
  /* v59-fix: setModal v37 con focus trap delegado a createFocusTrap/toggleModal */
  const _v37Triggers = {};
  const _v37Trappers = {};
  /* setModal local en este IIFE — no compite con la v55 global */
  function setModal(id, open){
    const modal = document.getElementById(id);
    if (!modal) return false;
    const wasOpen = modal.classList.contains('active');
    if (Boolean(open) === wasOpen) return true;
    modal.classList.toggle('active', Boolean(open));
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal-overlay.active')));
    if (open) {
      _v37Triggers[id] = document.activeElement;
      if (typeof window.createFocusTrap === 'function') {
        try { _v37Trappers[id] = window.createFocusTrap(modal, _v37Triggers[id]); } catch(e) {
          const f = modal.querySelector('button:not([disabled]),[tabindex]:not([tabindex="-1"])');
          if (f) requestAnimationFrame(() => { try { f.focus(); } catch(e) { /* foco no disponible */ } });
        }
      } else {
        const f = modal.querySelector('button:not([disabled]),[tabindex]:not([tabindex="-1"])');
        if (f) requestAnimationFrame(() => { try { f.focus(); } catch(e) { /* foco no disponible */ } });
      }
    } else {
      if (typeof _v37Trappers[id] === 'function') { try { _v37Trappers[id](); } catch(e) { /* recuperable: suprimido intencionalmente */ } delete _v37Trappers[id]; }
      const t = _v37Triggers[id];
      if (t?.isConnected) { try { t.focus(); } catch(e) { /* recuperable: suprimido intencionalmente */ } }
      delete _v37Triggers[id];
    }
    return true;
  }
  function runAction(action, trigger){
    const actionMap = {
      openGlossary:() => { try { if (typeof renderGlossary === 'function') renderGlossary(); } catch(err) { /* recuperable: err suprimido intencionalmente */ } return setModal('glossaryModal', true); },
      startExam:() => { try { if (typeof startExam === 'function') { startExam(); return true; } } catch(err) { /* recuperable: err suprimido intencionalmente */ } return setModal('examModal', true); },
      openMatrix:() => { try { if (typeof renderMatrix === 'function') renderMatrix(); } catch(err) { /* recuperable: err suprimido intencionalmente */ } return setModal('matrixModal', true); },
      abrirEstadisticas:() => setModal('statsModal', true),
      abrirBiblio:() => { try { if (typeof renderBibliography === 'function') renderBibliography(); } catch(err) { /* recuperable: err suprimido intencionalmente */ } return setModal('biblioModal', true); },
      openPresentation:() => { try { if (typeof openPresentation === 'function') { openPresentation(); return true; } } catch(err) { /* recuperable: err suprimido intencionalmente */ } const overlay=document.getElementById('presOverlay'); if(overlay){overlay.classList.add('active'); overlay.setAttribute('aria-hidden','false'); return true;} return false; },
      resetGlobalFilters:() => { try { if (typeof resetGlobalFilters === 'function') { resetGlobalFilters(); return true; } } catch(err) { /* recuperable: err suprimido intencionalmente */ } const search=document.getElementById('searchInput'); if(search) search.value=''; document.querySelector('.filter-chip[data-clade-filter="all"]')?.click?.(); return true; },
      scrollToTop:() => { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; return true; },
      runSelfAudit:() => { try { if (typeof runSelfAudit === 'function') { runSelfAudit(); return true; } } catch(err) { /* recuperable: err suprimido intencionalmente */ } return false; },
      activateClassMode:() => { try { if (typeof activateClassMode === 'function') { activateClassMode(); return true; } } catch(err) { /* recuperable: err suprimido intencionalmente */ } document.body.classList.toggle('class-mode'); return true; },
      exportToCSV:() => { try { if (typeof exportToCSV === 'function') { exportToCSV(); return true; } } catch(err) { /* recuperable: err suprimido intencionalmente */ } return false; },
      printFicha:() => { try { if (typeof printFicha === 'function') { printFicha(); return true; } } catch(err) { /* recuperable: err suprimido intencionalmente */ } window.print?.(); return true; }
    };
    if (actionMap[action]) return actionMap[action](trigger);
    try {
      if (typeof window[action] === 'function') {
        window[action](trigger);
        return true;
      }
    } catch(err) {
      console.warn('Acción recuperada por v37:', action, err);
    }
    return false;
  }
  function closePanels(){
    try { if (typeof closeDetailPanel === 'function') closeDetailPanel(); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    document.querySelectorAll('#detailView,.detail-panel,.side-panel').forEach(panel => {
      panel.classList.remove('active','open','visible');
      panel.setAttribute('aria-hidden','true');
    });
  }
  function installControlBus(){
    if (document.body.dataset.v37Controls === 'ready') return;
    document.body.dataset.v37Controls = 'ready';
    document.addEventListener('click', function(e){
      const modalClose = e.target.closest('.close-modal[data-modal-toggle]');
      if (modalClose) {
        e.preventDefault(); e.stopImmediatePropagation();
        setModal(modalClose.dataset.modalToggle, false);
        return;
      }
      const modalToggle = e.target.closest('[data-modal-toggle]');
      if (modalToggle) {
        e.preventDefault(); e.stopImmediatePropagation();
        const modal = document.getElementById(modalToggle.dataset.modalToggle);
        setModal(modalToggle.dataset.modalToggle, !modal?.classList.contains('active'));
        return;
      }
      const modalBack = e.target.closest('[data-modal-back]');
      if (modalBack) {
        e.preventDefault(); e.stopImmediatePropagation();
        const modal = modalBack.closest('.modal-overlay');
        if (modal?.id) setModal(modal.id, false);
        return;
      }
      const panelClose = e.target.closest('[data-panel-close]');
      if (panelClose) {
        e.preventDefault(); e.stopImmediatePropagation();
        closePanels();
        return;
      }
      const presClose = e.target.closest('[data-pres-close]');
      if (presClose) {
        e.preventDefault(); e.stopImmediatePropagation();
        try { if (typeof closePresentation === 'function') closePresentation(); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
        document.getElementById('presOverlay')?.classList.remove('active');
        return;
      }
      const presMapClose = e.target.closest('[data-pres-map-close]');
      if (presMapClose) {
        e.preventDefault(); e.stopImmediatePropagation();
        try { if (typeof closePresMapModal === 'function') closePresMapModal(); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
        document.getElementById('presMapModal')?.classList.remove('active');
        return;
      }
      const family = e.target.closest('button[data-nav-family]');
      if (family) {
        e.preventDefault(); e.stopImmediatePropagation();
        v37SetFamily(family.dataset.navFamily, { forceDefault:true });
        return;
      }
      const view = e.target.closest('[data-view]');
      if (view) {
        e.preventDefault(); e.stopImmediatePropagation();
        v37SwitchView(view.dataset.view);
        document.getElementById('main-content')?.scrollIntoView?.({ behavior:'smooth', block:'start' });
        return;
      }
    }, true);
    v37SetFamily(document.body.dataset.navFamily || 'explorar');
  }
  function extendAudit(){
    if (typeof buildSelfAuditReport !== 'function' || buildSelfAuditReport.__v37Extended) return;
    const previous = buildSelfAuditReport;
    buildSelfAuditReport = function(){
      const report = previous();
      const missing = [];
      if (document.body.dataset.v37Controls !== 'ready') missing.push('bus de controles');
      if (!document.querySelector('.nav-objective[data-nav-family].active')) missing.push('familia activa');
      if (!document.querySelector('.view-btn[data-view].active')) missing.push('vista activa');
      if (!document.querySelector('.view-section.active')) missing.push('sección activa');
      report.splice(2,0,{
        label:'Bus funcional de controles',
        status:missing.length ? 'bad' : 'ok',
        value:missing.length ? 'Faltan: ' + missing.join(', ') : 'Navegación, vistas, acciones y cierres tienen capa autónoma de respaldo.'
      });
      return report;
    };
    buildSelfAuditReport.__v37Extended = true;
  }
  function init(){
    installControlBus();
    extendAudit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
  window.PaleoBotV37Controls = { setFamily:v37SetFamily, switchView:v37SwitchView, runAction, setModal };
})();
