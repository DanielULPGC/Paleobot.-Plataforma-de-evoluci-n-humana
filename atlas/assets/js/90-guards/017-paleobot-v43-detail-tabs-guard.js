// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v43-detail-tabs-guard
(function(){
  const VALID_TABS = ['gen','anat','eco','paleo','biblio'];
  function detailPanel(){
    return document.getElementById('detailView');
  }
  function selectDetailTab(tabId, trigger){
    const panel = detailPanel();
    if (!panel) return false;
    const safeId = VALID_TABS.includes(tabId) ? tabId : 'gen';
    const tab = trigger || panel.querySelector(`[data-tab="${safeId}"]`);
    const pane = panel.querySelector(`#pane-${safeId}`);
    if (!tab || !pane) return false;
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
    return target?.closest?.('#detailView [data-tab], #detailView .tab-item[role="tab"]') || null;
  }
  document.addEventListener('click', function(e){
    const tab = tabFromEventTarget(e.target);
    if (!tab) return;
    const tabId = tab.dataset.tab || (tab.getAttribute('aria-controls') || '').replace(/^pane-/, '');
    if (!tabId) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    selectDetailTab(tabId, tab);
  }, true);
  document.addEventListener('keydown', function(e){
    const tab = tabFromEventTarget(e.target);
    if (!tab) return;
    const tabs = [...detailPanel().querySelectorAll('[data-tab], .tab-item[role="tab"]')];
    const idx = tabs.indexOf(tab);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopImmediatePropagation();
      selectDetailTab(tab.dataset.tab || (tab.getAttribute('aria-controls') || '').replace(/^pane-/, ''), tab);
      return;
    }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && idx >= 0) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const next = e.key === 'ArrowRight'
        ? tabs[(idx + 1) % tabs.length]
        : tabs[(idx - 1 + tabs.length) % tabs.length];
      next.focus();
      selectDetailTab(next.dataset.tab || (next.getAttribute('aria-controls') || '').replace(/^pane-/, ''), next);
    }
  }, true);
  document.addEventListener('paleobot:species-opened', () => {
    document.body.dataset.v43DetailTabs = 'ready';
    selectDetailTab('gen');
  });
  document.body.dataset.v43DetailTabs = 'ready';
  window.PaleoBotV43DetailTabs = { selectDetailTab };
})();
