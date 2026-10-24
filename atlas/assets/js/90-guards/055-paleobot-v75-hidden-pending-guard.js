// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v75-hidden-pending-guard
(function(){
  'use strict';

  const ONBOARDING_KEY = 'paleobot_onboarding_done';

  function storageSet(key, value){
    try {
      if (typeof window.ssSet === 'function') window.ssSet(key, value);
      else localStorage.setItem(key, value);
    } catch(err) {}
  }

  function closeModal(id){
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  function activeModals(){
    return [...document.querySelectorAll('.modal-overlay')]
      .filter(modal => modal.classList.contains('active') || modal.getAttribute('aria-hidden') === 'false');
  }

  function suppressAutomaticOnboarding(){
    storageSet(ONBOARDING_KEY, '1');
    delete document.documentElement.dataset.paleobotOnboarding;
    const guide = document.getElementById('studentGuideModal');
    if (guide && guide.classList.contains('active') && !document.body.dataset.pbUserOpenedStudentGuide) {
      closeModal('studentGuideModal');
    }
  }

  function reconcileModalState(){
    const open = activeModals();
    if (open.length === 0) {
      document.body.classList.remove('modal-open');
      return;
    }
    if (open.length === 1) {
      document.body.classList.add('modal-open');
      return;
    }
    open.slice(0, -1).forEach(modal => closeModal(modal.id));
    document.body.classList.add('modal-open');
  }

  document.addEventListener('click', function(event){
    if (event.target.closest && event.target.closest('[data-action="openStudentGuide"]')) {
      document.body.dataset.pbUserOpenedStudentGuide = '1';
    }
  }, true);

  function init(){
    suppressAutomaticOnboarding();
    reconcileModalState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
  window.addEventListener('pageshow', init);
  window.PaleoBotV75HiddenPendingGuard = { suppressAutomaticOnboarding, reconcileModalState };
})();
