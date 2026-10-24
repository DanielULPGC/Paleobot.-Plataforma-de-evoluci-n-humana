// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v71-compare-picker-repair
(function(){
  'use strict';

  let suppressNextClickUntil = 0;

  function pickerInput(){
    return document.getElementById('cmpPickerInput');
  }

  function pickerDropdown(){
    return document.getElementById('cmpPickerDropdown');
  }

  function closePicker(){
    const dd = pickerDropdown();
    const input = pickerInput();
    if (dd) dd.classList.remove('open');
    if (input) input.setAttribute('aria-expanded', 'false');
  }

  function positionPicker(){
    const dd = pickerDropdown();
    const input = pickerInput();
    if (!dd || !input || !dd.classList.contains('open')) return;
    const rect = input.getBoundingClientRect();
    const gap = 4;
    const maxBottom = window.innerHeight - 12;
    dd.style.left = Math.max(8, rect.left) + 'px';
    dd.style.width = Math.min(rect.width, window.innerWidth - 16) + 'px';
    dd.style.right = 'auto';
    dd.style.top = Math.min(rect.bottom + gap, maxBottom - Math.min(220, window.innerHeight * 0.32)) + 'px';
  }

  function clearPickerText(){
    const input = pickerInput();
    if (!input) return;
    input.value = '';
    input.blur();
    input.setAttribute('aria-expanded', 'false');
  }

  function addSpeciesFromPicker(option){
    if (!option) return false;
    const id = option.dataset.cmpAdd;
    if (!id) return false;
    suppressNextClickUntil = Date.now() + 500;
    if (option.classList.contains('already-added')) {
      closePicker();
      clearPickerText();
      return true;
    }
    try {
      if (typeof window.cmpAddSpecies === 'function') {
        window.cmpAddSpecies(id);
      } else if (typeof cmpAddSpecies === 'function') {
        cmpAddSpecies(id);
      } else {
        return false;
      }
      closePicker();
      clearPickerText();
      window.setTimeout(() => {
        try {
          if (typeof window.cmpOnModalOpen === 'function') window.cmpOnModalOpen(true);
          else if (typeof cmpOnModalOpen === 'function') cmpOnModalOpen(true);
        } catch(err) {}
      }, 30);
      return true;
    } catch(err) {
      console.warn('[PB71] No se pudo añadir especie al comparador:', err);
      return false;
    }
  }

  function maybeCloseEmptyPicker(){
    const input = pickerInput();
    const dd = pickerDropdown();
    if (!input || !dd) return;
    if (!input.value.trim()) closePicker();
    else window.setTimeout(positionPicker, 0);
  }

  document.addEventListener('pointerdown', function(event){
    const option = event.target.closest && event.target.closest('#compareModal [data-cmp-add]');
    if (!option) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addSpeciesFromPicker(option);
  }, true);

  document.addEventListener('click', function(event){
    const option = event.target.closest && event.target.closest('#compareModal [data-cmp-add]');
    if (!option) return;
    if (Date.now() < suppressNextClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    addSpeciesFromPicker(option);
  }, true);

  document.addEventListener('keydown', function(event){
    const option = event.target.closest && event.target.closest('#compareModal [data-cmp-add]');
    if (option && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      addSpeciesFromPicker(option);
      return;
    }
    if (event.target && event.target.id === 'cmpPickerInput') {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        closePicker();
        return;
      }
      if (event.key === 'Enter') {
        const first = document.querySelector('#compareModal .cmp-picker-dropdown.open [data-cmp-add]:not(.already-added)');
        if (first) {
          event.preventDefault();
          event.stopImmediatePropagation();
          addSpeciesFromPicker(first);
        }
      }
    }
  }, true);

  document.addEventListener('input', function(event){
    if (event.target && event.target.id === 'cmpPickerInput') {
      window.setTimeout(maybeCloseEmptyPicker, 0);
    }
  }, true);

  document.addEventListener('focusin', function(event){
    if (event.target && event.target.id === 'cmpPickerInput') {
      window.setTimeout(maybeCloseEmptyPicker, 0);
    }
  }, true);

  window.addEventListener('resize', positionPicker, { passive:true });
  window.addEventListener('scroll', positionPicker, { passive:true });
  document.addEventListener('scroll', positionPicker, true);

  window.PaleoBotV71ComparePickerRepair = { closePicker, positionPicker, addSpeciesFromPicker };
})();
