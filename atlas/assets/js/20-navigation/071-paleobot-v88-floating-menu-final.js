(function(){
  'use strict';

  const MODAL_BY_ACTION = {
    startExam: 'examModal',
    openGlossary: 'glossaryModal',
    openMatrix: 'matrixModal',
    abrirEstadisticas: 'statsModal',
    abrirBiblio: 'biblioModal',
    openStudentGuide: 'studentGuideModal',
    openGlobalSearch: 'globalSearchModal',
    openSessionSynthesis: 'sessionSynthesisModal',
    openCompare: 'compareModal'
  };

  const OVERLAY_BY_ACTION = {
    openPresentation: 'presOverlay'
  };

  const ACTIVE_SELECTOR = [
    '.modal-overlay.active',
    '.pb-v50-modal.active',
    '.pres-overlay.active',
    '.pres-map-modal.active',
    '.lightbox.active',
    '.socratic-overlay.active'
  ].join(',');
  const MODAL_ROOT_SELECTOR = [
    '.modal-overlay',
    '.pb-v50-modal',
    '.pres-overlay',
    '.pres-map-modal',
    '.lightbox',
    '.socratic-overlay'
  ].join(',');
  const MOBILE_QUERY = '(max-width: 820px)';
  let statusTimer = 0;

  function getAction(el){
    if (!el || !el.dataset) return '';
    return el.dataset.action || el.dataset.pbV50Action || '';
  }

  function call(name, ...args){
    try {
      const fn = window[name] ||
        (window.PaleoBotFloatingActions && window.PaleoBotFloatingActions[name]) ||
        (window.PaleoBotV46ButtonBus && window.PaleoBotV46ButtonBus[name]);
      if (typeof fn === 'function') {
        return fn.apply(window, args) !== false;
      }
    } catch(err) {
      console.warn('[PB88] Acción recuperada:', name, err);
    }
    return false;
  }

  function isMobileToolsViewport(){
    return Boolean(window.matchMedia && window.matchMedia(MOBILE_QUERY).matches);
  }

  function syncWorkspaceVisibility(force){
    const entered = Boolean(force) ||
      window.location.hash === '#main-content';
    if (entered) document.body.classList.add('pb-workspace-entered');
    return document.body.classList.contains('pb-workspace-entered');
  }

  function ensureMobileToolsToggle(){
    let button = document.getElementById('pb-mobile-tools-toggle');
    if (button) return button;
    button = document.createElement('button');
    button.type = 'button';
    button.id = 'pb-mobile-tools-toggle';
    button.dataset.pbMobileTools = 'toggle';
    button.setAttribute('aria-label', 'Abrir herramientas');
    button.setAttribute('aria-controls', 'pb-floating-tools pb-a11y-toolbar-root');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = [
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"',
      ' stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">',
      '<rect x="3" y="3" width="7" height="7" rx="1"/>',
      '<rect x="14" y="3" width="7" height="7" rx="1"/>',
      '<rect x="3" y="14" width="7" height="7" rx="1"/>',
      '<rect x="14" y="14" width="7" height="7" rx="1"/>',
      '</svg>'
    ].join('');
    document.body.appendChild(button);
    return button;
  }

  function setMobileTools(open, options){
    const opts = options || {};
    const expanded = Boolean(open);
    const button = ensureMobileToolsToggle();
    const group = document.querySelector('.fab-group');
    const a11y = document.getElementById('pb-a11y-toolbar-root');
    document.body.classList.toggle('pb-mobile-tools-open', expanded);
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.setAttribute('aria-label', expanded ? 'Cerrar herramientas' : 'Abrir herramientas');
    [group, a11y].forEach(function(panel){
      if (!panel) return;
      if (!expanded) {
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('inert', '');
      } else {
        panel.setAttribute('aria-hidden', 'false');
        panel.removeAttribute('inert');
      }
    });
    if (opts.focus && button && typeof button.focus === 'function') {
      try { button.focus({ preventScroll:true }); } catch(err) {}
    }
    document.documentElement.dataset.pbMobileTools = expanded ? 'open' : 'closed';
    return expanded;
  }

  function ensureStatusRegion(){
    let region = document.getElementById('pb-floating-status');
    if (region) return region;
    region = document.createElement('div');
    region.id = 'pb-floating-status';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
    return region;
  }

  function showStatus(message){
    const region = ensureStatusRegion();
    region.textContent = String(message || '');
    region.classList.add('is-visible');
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function(){
      region.classList.remove('is-visible');
    }, 2600);
  }

  function reconcileBody(){
    const open = Boolean(document.querySelector(ACTIVE_SELECTOR));
    document.body.classList.toggle('modal-open', open);
    document.documentElement.dataset.pbModalState = open ? 'open' : 'closed';
    if (open) setMobileTools(false);
  }

  function prepareModal(modal, open){
    if (!modal) return false;
    modal.classList.toggle('active', Boolean(open));
    modal.hidden = false;
    modal.removeAttribute('inert');
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      modal.style.pointerEvents = '';
      window.setTimeout(() => {
        try {
          modal.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus?.({ preventScroll:true });
        } catch(err) {}
      }, 30);
    }
    reconcileBody();
    return true;
  }

  function openModal(id){
    const modal = document.getElementById(id);
    if (!modal) return false;
    prepareModal(modal, true);
    if (id === 'compareModal') {
      call('cmpOnModalOpen');
      call('renderComparePicker');
    }
    if (id === 'matrixModal') call('renderMatrix');
    if (id === 'statsModal') call('drawChart');
    if (id === 'glossaryModal') {
      call('renderGlossary');
      window.PaleoBotGlossaryPagination?.refresh?.();
    }
    return true;
  }

  function closeModal(id){
    return prepareModal(document.getElementById(id), false);
  }

  function toggleModal(id){
    const modal = document.getElementById(id);
    if (!modal) return false;
    return modal.classList.contains('active') ? closeModal(id) : openModal(id);
  }

  function openOverlay(id){
    const overlay = document.getElementById(id);
    if (!overlay) return false;
    overlay.classList.add('active');
    overlay.hidden = false;
    overlay.removeAttribute('inert');
    overlay.setAttribute('aria-hidden', 'false');
    reconcileBody();
    return true;
  }

  function normalizeOpenedTargets(){
    document.querySelectorAll('.modal-overlay.active,.pb-v50-modal.active,.pres-overlay.active,.pres-map-modal.active,.lightbox.active,.socratic-overlay.active').forEach(el => {
      el.hidden = false;
      el.removeAttribute('inert');
      el.setAttribute('aria-hidden', 'false');
    });
    reconcileBody();
  }

  function runAction(action){
    if (!action || action.includes('$' + '{')) return false;
    document.body.dataset.pbFloatingLastAction = action;
    if (action === 'scrollToTop') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    if (action === 'printFicha' || action === 'exportToCSV') {
      return call(action);
    }
    if (action === 'openPresentation') {
      const handled = call(action) || openOverlay(OVERLAY_BY_ACTION[action]);
      normalizeOpenedTargets();
      return handled;
    }
    if (action === 'openGlobalSearch') {
      const handled = call('openGlobalSearch') || openModal('globalSearchModal');
      normalizeOpenedTargets();
      return handled;
    }
    const modalId = MODAL_BY_ACTION[action];
    if (modalId) {
      const handled = call(action) || openModal(modalId);
      normalizeOpenedTargets();
      return handled;
    }
    const handled = call(action);
    if (handled) normalizeOpenedTargets();
    return handled;
  }

  function ownsFloatingControl(el){
    return Boolean(el && el.closest && el.closest('.fab-group,#pb-a11y-toolbar-root,.scroll-top-btn,#pb-mobile-tools-toggle'));
  }

  function handleClick(event){
    const target = event.target && event.target.closest
      ? event.target.closest('[data-pb-mobile-tools],[data-modal-toggle],[data-action],[data-pb-v50-action],.scroll-top-btn')
      : null;
    if (!target || !ownsFloatingControl(target)) return;
    syncWorkspaceVisibility(true);

    if (target.matches('[data-pb-mobile-tools]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setMobileTools(!document.body.classList.contains('pb-mobile-tools-open'));
      return;
    }

    if (target.matches('[data-modal-toggle]')) {
      const id = target.dataset.modalToggle;
      if (!id || !document.getElementById(id)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleModal(id);
      normalizeOpenedTargets();
      return;
    }

    const action = target.matches('.scroll-top-btn') ? 'scrollToTop' : getAction(target);
    if (!action) return;
    const handled = runAction(action);
    if (handled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action !== 'scrollToTop') setMobileTools(false);
    }
  }

  function handleKey(event){
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target && event.target.closest
      ? event.target.closest('[data-modal-toggle],[data-action],[data-pb-v50-action],.scroll-top-btn')
      : null;
    if (!target || !ownsFloatingControl(target)) return;
    if (target.matches('button')) return;
    event.preventDefault();
    target.click();
  }

  function normalizeFloatingMenu(){
    syncWorkspaceVisibility(false);
    const group = document.querySelector('.fab-group');
    if (group) {
      if (!group.id) group.id = 'pb-floating-tools';
      group.hidden = false;
      group.removeAttribute('inert');
      group.setAttribute('aria-hidden', 'false');
      group.querySelectorAll('button').forEach(button => {
        button.type = 'button';
        button.disabled = false;
        button.removeAttribute('aria-disabled');
        button.setAttribute('tabindex', '0');
      });
      group.querySelectorAll('[data-modal-toggle="compareModal"]').forEach(button => {
        button.dataset.action = 'openCompare';
        delete button.dataset.modalToggle;
        button.removeAttribute('data-modal-toggle');
      });
    }
    document.querySelectorAll('.scroll-top-btn,#pb-a11y-toolbar-root button').forEach(button => {
      button.type = 'button';
      button.removeAttribute('aria-disabled');
      button.setAttribute('tabindex', '0');
    });
    ensureMobileToolsToggle();
    ensureStatusRegion();
    setMobileTools(document.body.classList.contains('pb-mobile-tools-open'));
  }

  function auditFloatingControls(){
    const controls = Array.from(document.querySelectorAll(
      '.fab-group button,#pb-a11y-toolbar-root button,.scroll-top-btn,#pb-mobile-tools-toggle'
    ));
    const issues = [];
    controls.forEach(function(button){
      const label = button.getAttribute('aria-label') || button.title || button.textContent.trim();
      if (!label) issues.push('Control sin nombre accesible');
      const style = getComputedStyle(button);
      const rect = button.getBoundingClientRect();
      const visible = style.display !== 'none' && style.visibility !== 'hidden' &&
        Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
      const workspace = document.body.classList.contains('pb-workspace-entered');
      const expanded = document.body.classList.contains('pb-mobile-tools-open');
      const expected = workspace && (
        button.id === 'pb-mobile-tools-toggle' ||
        (button.matches('.scroll-top-btn') && button.classList.contains('is-visible')) ||
        expanded
      );
      if (expected && !visible) issues.push(label + ': oculto cuando deberia estar disponible');
      if (visible && (rect.left < 0 || rect.top < 0 || rect.right > innerWidth || rect.bottom > innerHeight)) {
        issues.push(label + ': fuera del viewport');
      }
      if (expected && style.pointerEvents === 'none') issues.push(label + ': no pulsable');
    });
    return {
      total: controls.length,
      mobile: isMobileToolsViewport(),
      expanded: document.body.classList.contains('pb-mobile-tools-open'),
      issues
    };
  }

  window.addEventListener('click', handleClick, true);
  window.addEventListener('keydown', handleKey, true);
  ['DOMContentLoaded','paleobot:viewchange','paleobot:v55-viewchange'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(() => {
      syncWorkspaceVisibility(false);
      normalizeFloatingMenu();
      normalizeOpenedTargets();
    }, 80));
  });
  if (document.readyState !== 'loading') window.setTimeout(() => {
    normalizeFloatingMenu();
    normalizeOpenedTargets();
  }, 80);

  const observedModals = new WeakSet();
  const modalObserver = new MutationObserver(() => {
    window.clearTimeout(modalObserver._pb88Timer);
    modalObserver._pb88Timer = window.setTimeout(reconcileBody, 20);
  });
  function observeModalTree(root){
    if (!root || root.nodeType !== 1) return;
    const candidates = [];
    if (root.matches && root.matches(MODAL_ROOT_SELECTOR)) candidates.push(root);
    if (root.querySelectorAll) candidates.push(...root.querySelectorAll(MODAL_ROOT_SELECTOR));
    candidates.forEach(function(modal){
      if (observedModals.has(modal)) return;
      observedModals.add(modal);
      modalObserver.observe(modal, {
        attributes:true,
        attributeFilter:['class','aria-hidden','hidden','inert']
      });
    });
  }
  observeModalTree(document.body);
  const insertionObserver = new MutationObserver(function(records){
    records.forEach(function(record){
      record.addedNodes.forEach(observeModalTree);
    });
  });
  if (document.body) {
    insertionObserver.observe(document.body, { childList:true, subtree:true });
  }

  const mobileMedia = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
  if (mobileMedia) {
    const onMobileChange = function(){ setMobileTools(false); };
    if (typeof mobileMedia.addEventListener === 'function') mobileMedia.addEventListener('change', onMobileChange);
    else if (typeof mobileMedia.addListener === 'function') mobileMedia.addListener(onMobileChange);
  }
  document.addEventListener('paleobot:download', function(event){
    const filename = event.detail && event.detail.filename ? event.detail.filename : 'archivo';
    showStatus('Archivo preparado: ' + filename);
  });
  document.addEventListener('paleobot:print-requested', function(){
    showStatus('Impresion preparada');
  });

  window.openCompare = function(){ return openModal('compareModal'); };
  window.PaleoBotV88FloatingMenuFinal = {
    openModal,
    closeModal,
    toggleModal,
    runAction,
    normalizeFloatingMenu,
    setMobileTools,
    showStatus,
    auditFloatingControls,
    syncWorkspaceVisibility
  };
  document.documentElement.dataset.pbFloatingObserver = 'targeted';
  document.documentElement.dataset.paleobotV88FloatingMenuFinal = 'ready';
})();
