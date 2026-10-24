// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v66-student-guide-router-repair
(function(){
  'use strict';
  function modal(open){
    var el = document.getElementById('studentGuideModal');
    if (!el) return false;
    if (window.PaleoBotV59 && typeof window.PaleoBotV59.renderAll === 'function') {
      try { window.PaleoBotV59.renderAll(); } catch(err) {}
    }
    if (window.PaleoBotV55Router && typeof window.PaleoBotV55Router.setModal === 'function') {
      try { window.PaleoBotV55Router.setModal('studentGuideModal', open); } catch(err) {}
    }
    el.classList.toggle('active', Boolean(open));
    el.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('modal-open', Boolean(open));
    return true;
  }
  function tab(tabId){
    if (!tabId) return false;
    document.querySelectorAll('.sg-tab-btn').forEach(function(btn){
      var active = btn.dataset.sgTab === tabId;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.classList.toggle('active', active);
    });
    document.querySelectorAll('.sg-panel').forEach(function(panel){
      var active = panel.id === 'sg-panel-' + tabId;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
    return true;
  }
  function view(viewId){
    if (!viewId) return false;
    modal(false);
    if (window.PaleoBotV55Router && typeof window.PaleoBotV55Router.activateView === 'function') {
      if (window.PaleoBotV55Router.activateView(viewId, { scroll:true })) return true;
    }
    if (typeof window.switchView === 'function') {
      try { window.switchView(viewId); return true; } catch(err) {}
    }
    var section = document.getElementById('view-' + viewId);
    if (!section) return false;
    document.querySelectorAll('.view-section').forEach(function(item){ item.classList.toggle('active', item === section); });
    try { section.scrollIntoView({ behavior:'smooth', block:'start' }); } catch(err) {}
    return true;
  }
  function handle(event){
    var open = event.target.closest && event.target.closest('[data-action="openStudentGuide"]');
    if (open) {
      event.preventDefault();
      event.stopImmediatePropagation();
      modal(true);
      return;
    }
    var targetTab = event.target.closest && event.target.closest('[data-sg-tab]');
    if (targetTab) {
      event.preventDefault();
      event.stopImmediatePropagation();
      tab(targetTab.dataset.sgTab);
      return;
    }
    var gotoTab = event.target.closest && event.target.closest('[data-sg-goto-tab]');
    if (gotoTab) {
      event.preventDefault();
      event.stopImmediatePropagation();
      tab(gotoTab.dataset.sgGotoTab);
      return;
    }
    var viewBtn = event.target.closest && event.target.closest('[data-sg-open-view]');
    if (viewBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      view(viewBtn.dataset.sgOpenView);
    }
  }
  document.addEventListener('click', handle, true);
  window.openStudentGuide = function(){ modal(true); };
  document.documentElement.dataset.paleobotV66StudentGuideRouterRepair = 'ready';
})();
