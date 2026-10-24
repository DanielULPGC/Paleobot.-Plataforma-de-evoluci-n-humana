// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v71-compare-picker-repair
(function(){
  'use strict';

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
    window.PaleoBotGeometryStyle.set(
      dd,
      'compare-picker-dropdown',
      {
        left: Math.max(8, rect.left) + 'px',
        width: Math.min(rect.width, window.innerWidth - 16) + 'px',
        right: 'auto',
        top: Math.min(rect.bottom + gap, maxBottom - Math.min(220, window.innerHeight * 0.32)) + 'px'
      }
    );
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
      window.__PALEOBOT_DEBUG && console.warn('[PB71] No se pudo añadir especie al comparador:', err);
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

  // Recovery R20:
  // El clic sobre [data-cmp-add] pertenece al router del núcleo.
  // v71 conserva únicamente accesibilidad de teclado y posicionamiento.
  document.documentElement.dataset.paleobotV71Mode = 'a11y-position-adapter';

  document.addEventListener('keydown', function(event){
    const option = event.target.closest && event.target.closest('#compareModal [data-cmp-add]');
    if (option && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      addSpeciesFromPicker(option);
      return;
    }
    if (event.target && event.target.id === 'cmpPickerInput') {
      if (event.key === 'Escape') {
        event.preventDefault();
          closePicker();
        return;
      }
      if (event.key === 'Enter') {
        const first = document.querySelector('#compareModal .cmp-picker-dropdown.open [data-cmp-add]:not(.already-added)');
        if (first) {
          event.preventDefault();
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

  window.PaleoBotV71ComparePickerRepair = {
    closePicker,
    positionPicker,
    addSpeciesFromPicker,
    mode:'a11y-position-adapter'
  };
})();
