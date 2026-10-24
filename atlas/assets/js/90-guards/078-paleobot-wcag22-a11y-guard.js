(function PaleoBotWCAG22A11yGuard(){
  'use strict';

  const MODAL_SELECTOR = [
    '.modal-overlay',
    '.pb-v50-modal',
    '.pres-overlay',
    '.pres-map-modal',
    '.lightbox',
    '.socratic-overlay'
  ].join(',');

  const ACTIVE_MODAL_SELECTOR = [
    '.modal-overlay.active',
    '.pb-v50-modal.active',
    '.pres-overlay.active',
    '.pres-map-modal.active',
    '.lightbox.active',
    '.socratic-overlay.active'
  ].join(',');

  const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'summary',
    '[role="button"]:not([aria-disabled="true"])',
    '[role="tab"]:not([aria-disabled="true"])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const ACTION_LABELS = {
    abrirBiblio: 'Abrir bibliografia',
    abrirEstadisticas: 'Abrir estadisticas',
    exportBuilderSvg: 'Descargar arbol construido en SVG',
    exportPhyloSvg: 'Descargar arbol filogenetico en SVG',
    exportToCSV: 'Exportar datos a CSV',
    openCompare: 'Abrir comparador',
    openGlobalSearch: 'Abrir busqueda global',
    openGlossary: 'Abrir glosario',
    openMatrix: 'Abrir matriz de evidencia',
    openPresentation: 'Abrir modo presentacion',
    openSessionSynthesis: 'Abrir sintesis de la sesion',
    openStudentGuide: 'Abrir guia del alumnado',
    printFicha: 'Imprimir ficha',
    scrollToTop: 'Volver al inicio',
    startExam: 'Abrir autoevaluacion'
  };

  const ACTION_TARGETS = {
    abrirBiblio: 'biblioModal',
    abrirEstadisticas: 'statsModal',
    openCompare: 'compareModal',
    openGlobalSearch: 'globalSearchModal',
    openGlossary: 'glossaryModal',
    openMatrix: 'matrixModal',
    openPresentation: 'presOverlay',
    openSessionSynthesis: 'sessionSynthesisModal',
    openStudentGuide: 'studentGuideModal',
    startExam: 'examModal'
  };

  function text(el){
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function setAttr(el, name, value){
    const next = String(value);
    if (el && el.getAttribute(name) !== next) el.setAttribute(name, next);
  }

  function removeAttr(el, name){
    if (el && el.hasAttribute(name)) el.removeAttribute(name);
  }

  function ensureId(el, prefix){
    if (!el) return '';
    if (!el.id) {
      const suffix = Math.random().toString(36).slice(2, 8);
      el.id = `${prefix || 'pb-a11y'}-${suffix}`;
    }
    return el.id;
  }

  function getModalTitle(modal){
    if (!modal) return '';
    const labelledBy = modal.getAttribute('aria-labelledby');
    if (labelledBy) {
      const label = document.getElementById(labelledBy);
      if (label && text(label)) return text(label);
    }
    const heading = modal.querySelector('h1,h2,h3,h4,h5,h6,[data-modal-title]');
    if (heading && text(heading)) return text(heading);
    return modal.getAttribute('aria-label') || '';
  }

  function inferModalLabel(id){
    const modal = id ? document.getElementById(id) : null;
    const title = getModalTitle(modal);
    if (title) return `Abrir ${title}`;
    return id ? `Abrir dialogo ${id}` : 'Abrir dialogo';
  }

  function inferControlLabel(el){
    if (!el) return '';
    const explicit = el.getAttribute('aria-label') || el.getAttribute('title');
    if (explicit && explicit.trim()) return explicit.trim();
    const currentText = text(el);
    if (currentText) return currentText;
    const action = el.dataset && (el.dataset.action || el.dataset.pbV50Action);
    if (action && ACTION_LABELS[action]) return ACTION_LABELS[action];
    if (el.matches && el.matches('.scroll-top-btn')) return ACTION_LABELS.scrollToTop;
    const modalId = el.dataset && el.dataset.modalToggle;
    if (modalId) return inferModalLabel(modalId);
    const viewId = el.dataset && (el.dataset.view || el.dataset.pbV50View);
    if (viewId) return `Abrir vista ${viewId}`;
    if (el.classList && el.classList.contains('modal-back-btn')) return 'Cerrar dialogo y volver';
    if (el.classList && (el.classList.contains('close-btn') || el.classList.contains('modal-close'))) return 'Cerrar dialogo';
    return '';
  }

  function hasAccessibleName(el){
    if (!el) return false;
    if ((el.getAttribute('aria-label') || '').trim()) return true;
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy && labelledBy.split(/\s+/).some(id => text(document.getElementById(id)))) return true;
    if ((el.getAttribute('title') || '').trim()) return true;
    return Boolean(text(el));
  }

  function markIconOnly(el){
    if (!el || !el.classList) return;
    const visibleText = Array.from(el.childNodes).some(node => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim().length > 0;
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const nodeEl = node;
      if (nodeEl.getAttribute('aria-hidden') === 'true') return false;
      if (nodeEl.matches && nodeEl.matches('svg,img,.ico')) return false;
      return text(nodeEl).length > 0;
    });
    if (!visibleText && el.querySelector('svg,img,.ico')) {
      el.classList.add('pb-a11y-icon-only');
    }
  }

  function normalizeControls(root){
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('button').forEach(button => {
      if (!button.getAttribute('type')) button.setAttribute('type', 'button');
      const label = inferControlLabel(button);
      if (!hasAccessibleName(button) && label) button.setAttribute('aria-label', label);
      markIconOnly(button);
      button.querySelectorAll('svg:not([aria-label]):not([role])').forEach(svg => {
        setAttr(svg, 'aria-hidden', 'true');
        setAttr(svg, 'focusable', 'false');
      });
    });

    scope.querySelectorAll('[role="button"]:not(button)').forEach(el => {
      if (!el.hasAttribute('tabindex')) setAttr(el, 'tabindex', '0');
      const label = inferControlLabel(el);
      if (!hasAccessibleName(el) && label) el.setAttribute('aria-label', label);
      markIconOnly(el);
    });

    scope.querySelectorAll('a[href],button,[role="button"],[data-action],[data-modal-toggle],[data-view]').forEach(el => {
      if (!hasAccessibleName(el)) {
        const label = inferControlLabel(el);
        if (label) el.setAttribute('aria-label', label);
      }
    });
  }

  function normalizeToolbars(){
    const fab = document.querySelector('.fab-group');
    if (fab) {
      if (!fab.id) fab.id = 'pb-floating-tools';
      setAttr(fab, 'role', 'toolbar');
      setAttr(fab, 'aria-label', 'Herramientas flotantes');
    }
    const a11y = document.getElementById('pb-a11y-toolbar-root');
    if (a11y && !a11y.getAttribute('aria-label')) {
      setAttr(a11y, 'aria-label', 'Controles de accesibilidad visual');
    }
    const mobile = document.getElementById('pb-mobile-tools-toggle');
    if (mobile) {
      setAttr(mobile, 'aria-controls', 'pb-floating-tools pb-a11y-toolbar-root');
      if (!mobile.hasAttribute('aria-expanded')) setAttr(mobile, 'aria-expanded', 'false');
      if (!hasAccessibleName(mobile)) setAttr(mobile, 'aria-label', 'Abrir herramientas');
    }
  }

  function normalizeModals(root){
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(MODAL_SELECTOR).forEach(modal => {
      const role = modal.getAttribute('role');
      if (!role) setAttr(modal, 'role', 'dialog');
      if (modal.getAttribute('role') === 'dialog' || modal.getAttribute('role') === 'alertdialog') {
        setAttr(modal, 'aria-modal', 'true');
      }
      const active = modal.classList.contains('active') || modal.matches('[open]');
      setAttr(modal, 'aria-hidden', active ? 'false' : 'true');

      if (!modal.getAttribute('aria-labelledby') && !modal.getAttribute('aria-label')) {
        const heading = modal.querySelector('h1,h2,h3,h4,h5,h6,[data-modal-title]');
        if (heading) {
          setAttr(modal, 'aria-labelledby', ensureId(heading, 'pb-modal-title'));
        } else {
          setAttr(modal, 'aria-label', modal.id ? `Dialogo ${modal.id}` : 'Dialogo');
        }
      }

      modal.querySelectorAll('[data-modal-back],.modal-back-btn,.modal-close,.close-btn,[data-close]').forEach(close => {
        if (!hasAccessibleName(close)) setAttr(close, 'aria-label', 'Cerrar dialogo');
      });
    });
  }

  function syncExpanded(){
    document.querySelectorAll('[data-modal-toggle]').forEach(trigger => {
      const id = trigger.dataset.modalToggle;
      const target = id && document.getElementById(id);
      if (!target) return;
      setAttr(trigger, 'aria-controls', id);
      setAttr(trigger, 'aria-haspopup', 'dialog');
      setAttr(trigger, 'aria-expanded', target.classList.contains('active') ? 'true' : 'false');
    });

    document.querySelectorAll('[data-action],[data-pb-v50-action]').forEach(trigger => {
      const action = trigger.dataset.action || trigger.dataset.pbV50Action;
      const id = ACTION_TARGETS[action];
      const target = id && document.getElementById(id);
      if (!target) return;
      setAttr(trigger, 'aria-controls', id);
      setAttr(trigger, 'aria-haspopup', 'dialog');
      setAttr(trigger, 'aria-expanded', target.classList.contains('active') ? 'true' : 'false');
    });
  }

  function syncViewInert(){
    document.querySelectorAll('.view-section').forEach(section => {
      const active = section.classList.contains('active');
      if (active) {
        removeAttr(section, 'inert');
        setAttr(section, 'aria-hidden', 'false');
      } else {
        setAttr(section, 'aria-hidden', 'true');
        if (!section.hasAttribute('inert')) section.setAttribute('inert', '');
      }
    });
  }

  function focusActiveModal(){
    const modal = document.querySelector(ACTIVE_MODAL_SELECTOR);
    if (!modal || modal.contains(document.activeElement)) return;
    const preferred = modal.querySelector('[data-modal-back],.modal-back-btn,.modal-close,.close-btn,button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    try { preferred?.focus?.({ preventScroll: true }); } catch (_) {}
  }

  function patch(){
    normalizeControls(document);
    normalizeToolbars();
    normalizeModals(document);
    syncExpanded();
    syncViewInert();
    focusActiveModal();
    document.documentElement.dataset.paleobotWcag22A11y = 'ready';
  }

  function audit(){
    const unnamed = Array.from(document.querySelectorAll('button,[role="button"],a[href]'))
      .filter(el => !hasAccessibleName(el))
      .map(el => el.id || el.className || el.tagName)
      .slice(0, 25);
    const roleButtonsWithoutTabindex = Array.from(document.querySelectorAll('[role="button"]:not(button)'))
      .filter(el => !el.hasAttribute('tabindex'))
      .length;
    const modalsWithoutNames = Array.from(document.querySelectorAll(MODAL_SELECTOR))
      .filter(el => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'))
      .map(el => el.id || el.className || el.tagName)
      .slice(0, 25);
    return {
      unnamedControls: unnamed,
      roleButtonsWithoutTabindex,
      modalsWithoutNames,
      activeModal: Boolean(document.querySelector(ACTIVE_MODAL_SELECTOR))
    };
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      const control = event.target && event.target.closest
        ? event.target.closest('[role="button"]:not(button):not(a)')
        : null;
      if (control && control.getAttribute('aria-disabled') !== 'true') {
        event.preventDefault();
        control.click();
      }
    }
    if (event.key === 'Escape') {
      window.setTimeout(() => {
        syncExpanded();
        syncViewInert();
      }, 40);
    }
  }, true);

  const observer = new MutationObserver(records => {
    let shouldPatch = false;
    records.forEach(record => {
      if (record.type === 'childList' && (record.addedNodes.length || record.removedNodes.length)) shouldPatch = true;
      if (record.type === 'attributes') shouldPatch = true;
    });
    if (!shouldPatch) return;
    window.clearTimeout(observer._pbA11yTimer);
    observer._pbA11yTimer = window.setTimeout(patch, 80);
  });

  function init(){
    patch();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-hidden', 'hidden', 'open', 'aria-expanded']
    });
  }

  ['paleobot:viewchange', 'paleobot:v55-viewchange', 'paleobot:v49-viewchange'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(patch, 80));
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.PaleoBotWCAG22A11y = { patch, audit };
})();
