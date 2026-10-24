// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v42-detail-view-guard
(function(){
  function panel(){
    return document.getElementById('detailView');
  }
  function normalizeDetailPanel(){
    const p = panel();
    if (!p) return;
    document.body.dataset.v42DetailRepair = 'ready';
    if (p.classList.contains('active')) {
      p.setAttribute('aria-hidden','false');
      p.removeAttribute('inert');
    } else {
      p.setAttribute('aria-hidden','true');
    }
    p.querySelectorAll('[role="tab"], .tab-item').forEach(tab => {
      tab.setAttribute('tabindex', tab.classList.contains('active') || tab.getAttribute('aria-selected') === 'true' ? '0' : '0');
      tab.dataset.v42Tab = 'ready';
    });
    p.querySelectorAll('[data-panel-close], .panel-close, .panel-back-btn').forEach(btn => {
      btn.dataset.v42Close = 'ready';
      btn.removeAttribute('disabled');
    });
  }
  document.addEventListener('click', function(e){
    const close = e.target.closest('#detailView [data-panel-close], #detailView .panel-close, #detailView .panel-back-btn');
    if (!close) return;
    const p = panel();
    if (!p) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    p.classList.remove('active');
    p.setAttribute('aria-hidden','true');
    document.body.dataset.v42LastClose = 'ok';
  }, true);
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    const p = panel();
    if (!p || !p.classList.contains('active')) return;
    e.preventDefault();
    p.classList.remove('active');
    p.setAttribute('aria-hidden','true');
    document.body.dataset.v42LastClose = 'escape';
  }, true);
  document.addEventListener('paleobot:species-opened', normalizeDetailPanel);
  document.addEventListener('paleobot:viewchange', normalizeDetailPanel);
  document.addEventListener('DOMContentLoaded', normalizeDetailPanel);
  window.addEventListener('load', normalizeDetailPanel);
  setTimeout(normalizeDetailPanel, 0);
  setTimeout(normalizeDetailPanel, 300);
  window.PaleoBotV42DetailRepair = { normalizeDetailPanel };
})();
