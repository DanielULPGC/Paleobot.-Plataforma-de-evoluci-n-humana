// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v67-modal-state-reconciler
(function(){
  const ACTIVE_MODAL_SELECTOR = [
    '.modal-overlay.active',
    '.pb-v50-modal.active',
    '.pres-overlay.active',
    '.pres-map-modal.active',
    '.lightbox.active',
    '.socratic-overlay.active'
  ].join(',');

  function hasActiveModal(){
    return Boolean(document.querySelector(ACTIVE_MODAL_SELECTOR));
  }

  function reconcileModalState(){
    const open = hasActiveModal();
    document.body.classList.toggle('modal-open', open);
    document.documentElement.dataset.pbModalState = open ? 'open' : 'closed';
  }

  document.addEventListener('click', function(event){
    if (event.target.closest && event.target.closest('#globalSearchModal.active button')) {
      window.setTimeout(reconcileModalState, 0);
      window.setTimeout(reconcileModalState, 80);
      return;
    }
    if (event.target.closest && event.target.closest('button.close-modal,[data-modal-toggle],[data-pres-close],[data-pres-map-close],[data-lightbox-close]')) {
      window.setTimeout(reconcileModalState, 0);
      window.setTimeout(reconcileModalState, 80);
    }
  }, true);

  document.addEventListener('keydown', function(event){
    if (event.key === 'Escape') window.setTimeout(reconcileModalState, 80);
  }, true);

  const observer = new MutationObserver(reconcileModalState);
  if (document.body) {
    observer.observe(document.body, { subtree:true, attributes:true, attributeFilter:['class','aria-hidden'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reconcileModalState, { once:true });
  } else {
    reconcileModalState();
  }
  window.PaleoBotModalStateReconciler = { reconcile: reconcileModalState, hasActiveModal };
})();
