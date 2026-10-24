// Recovery R28 — v43 detail tabs accessibility adapter
(function(){
  'use strict';

  const VALID_TABS = ['gen','anat','eco','paleo','biblio'];

  function detailPanel(){
    return document.getElementById('detailView');
  }

  function selectDetailTab(tabId, trigger){
    const panel = detailPanel();
    if (!panel) return false;

    const safeId = VALID_TABS.includes(tabId) ? tabId : 'gen';
    const tab = trigger || panel.querySelector(`[data-tab="${safeId}"]`);
    if (!tab) return false;

    // Preferir el propietario canónico del núcleo.
    try {
      if (typeof window.switchTab === 'function') {
        window.switchTab(safeId, tab);
        document.body.dataset.v43LastTab = safeId;
        return true;
      }
      if (typeof switchTab === 'function') {
        switchTab(safeId, tab);
        document.body.dataset.v43LastTab = safeId;
        return true;
      }
    } catch(_){}

    // Fallback de compatibilidad si el núcleo no expone switchTab globalmente.
    const pane = panel.querySelector(`#pane-${safeId}`);
    if (!pane) return false;

    panel.querySelectorAll('[data-tab], .tab-item[role="tab"]').forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
      item.setAttribute('tabindex', active ? '0' : '-1');
    });

    panel.querySelectorAll('.tab-pane').forEach(item => {
      const active = item === pane;
      item.classList.toggle('active', active);
      item.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    document.body.dataset.v43LastTab = safeId;
    return true;
  }

  function tabFromEventTarget(target){
    return target?.closest?.(
      '#detailView [data-tab], #detailView .tab-item[role="tab"]'
    ) || null;
  }

  function handleArrowKey(event){
    const tab = tabFromEventTarget(event.target);
    if (!tab || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return;

    const panel = detailPanel();
    if (!panel) return;

    const tabs = [...panel.querySelectorAll('[data-tab], .tab-item[role="tab"]')];
    const idx = tabs.indexOf(tab);
    if (idx < 0 || !tabs.length) return;

    event.preventDefault();
    // Impide que ArrowLeft/ArrowRight alcance la navegación global entre especies.
    event.stopPropagation();

    const next = event.key === 'ArrowRight'
      ? tabs[(idx + 1) % tabs.length]
      : tabs[(idx - 1 + tabs.length) % tabs.length];

    next.focus();
    selectDetailTab(
      next.dataset.tab ||
      (next.getAttribute('aria-controls') || '').replace(/^pane-/, ''),
      next
    );
  }

  function installLocalArrowNavigation(){
    const panel = detailPanel();
    if (!panel || panel.dataset.v43A11y === 'ready') return false;

    panel.dataset.v43A11y = 'ready';
    panel.addEventListener('keydown', handleArrowKey);
    return true;
  }

  function init(){
    document.body.dataset.v43DetailTabs = 'ready';
    document.documentElement.dataset.paleobotV43Mode = 'a11y-arrow-adapter';
    installLocalArrowNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.PaleoBotV43DetailTabs = {
    selectDetailTab,
    installLocalArrowNavigation,
    mode:'a11y-arrow-adapter'
  };
})();
