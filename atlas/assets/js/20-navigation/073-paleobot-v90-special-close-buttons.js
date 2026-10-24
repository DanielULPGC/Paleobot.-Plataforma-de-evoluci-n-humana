(function(){
  'use strict';

  function closeOverlay(id){
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
    el.hidden = false;
    if (id === 'socraticOverlay' && typeof el._removeTrap === 'function') {
      try { el._removeTrap({ skipReturnFocus:true }); } catch(err) {}
      try { delete el._removeTrap; } catch(err) {}
    }
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal-overlay.active,.pb-v50-modal.active,.pres-overlay.active,.pres-map-modal.active,.lightbox.active,.socratic-overlay.active')));
    return true;
  }

  function handleSpecialClose(event){
    const target = event.target && event.target.closest ? event.target.closest('[data-soc-close],[data-lightbox-close],[data-pres-close],[data-pres-map-close]') : null;
    if (!target) return;
    let id = '';
    if (target.matches('[data-soc-close]')) id = 'socraticOverlay';
    else if (target.matches('[data-lightbox-close]')) id = 'lightbox';
    else if (target.matches('[data-pres-close]')) id = 'presOverlay';
    else if (target.matches('[data-pres-map-close]')) id = 'presMapModal';
    if (!id) return;
    if (closeOverlay(id)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  window.addEventListener('click', handleSpecialClose, true);
  document.addEventListener('click', handleSpecialClose, true);
  window.PaleoBotV90SpecialCloseButtons = { closeOverlay };
  document.documentElement.dataset.paleobotV90SpecialCloseButtons = 'ready';
})();