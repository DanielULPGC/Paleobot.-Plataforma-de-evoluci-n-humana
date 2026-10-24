// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v72-compare-clear-repair
(function(){
  'use strict';

  function refreshCompare(){
    try {
      if (typeof window.cmpOnModalOpen === 'function') window.cmpOnModalOpen(true);
      else if (typeof cmpOnModalOpen === 'function') cmpOnModalOpen(true);
      return true;
    } catch(err) {
      try {
        if (typeof window.renderMultiComparison === 'function') window.renderMultiComparison();
        else if (typeof renderMultiComparison === 'function') renderMultiComparison();
      } catch(_) {}
    }
    return false;
  }

  function removeSpecies(id){
    if (!id) return false;
    try {
      if (typeof window.cmpRemoveSpecies === 'function') {
        window.cmpRemoveSpecies(id);
      } else if (typeof cmpRemoveSpecies === 'function') {
        cmpRemoveSpecies(id);
      } else {
        return false;
      }
      refreshCompare();
      const input = document.getElementById('cmpPickerInput');
      if (input) {
        input.value = '';
        input.setAttribute('aria-expanded', 'false');
      }
      document.getElementById('cmpPickerDropdown')?.classList.remove('open');
      return true;
    } catch(err) {
      console.warn('[PB72] No se pudo limpiar especie del comparador:', err);
      return false;
    }
  }

  function clearAll(){
    const chips = [...document.querySelectorAll('#compareModal [data-cmp-remove]')]
      .map(btn => btn.dataset.cmpRemove)
      .filter(Boolean);
    chips.forEach(removeSpecies);
    return chips.length > 0;
  }

  function ensureClearButton(){
    const header = document.querySelector('#compareModal .cmp-picker-header');
    const count = document.getElementById('cmpCountLabel');
    if (!header || !count || header.querySelector('[data-cmp-clear-all]')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cmp-clear-btn';
    btn.dataset.cmpClearAll = '1';
    btn.textContent = 'Limpiar';
    btn.setAttribute('aria-label', 'Limpiar todas las especies seleccionadas del comparador');
    count.insertAdjacentElement('afterend', btn);
  }

  document.addEventListener('pointerdown', function(event){
    const remove = event.target.closest && event.target.closest('#compareModal [data-cmp-remove]');
    if (!remove) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    removeSpecies(remove.dataset.cmpRemove);
  }, true);

  document.addEventListener('click', function(event){
    const clear = event.target.closest && event.target.closest('#compareModal [data-cmp-clear-all]');
    if (clear) {
      event.preventDefault();
      event.stopImmediatePropagation();
      clearAll();
      return;
    }
    const remove = event.target.closest && event.target.closest('#compareModal [data-cmp-remove]');
    if (!remove) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    removeSpecies(remove.dataset.cmpRemove);
  }, true);

  document.addEventListener('keydown', function(event){
    const remove = event.target.closest && event.target.closest('#compareModal [data-cmp-remove]');
    if (!remove || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    removeSpecies(remove.dataset.cmpRemove);
  }, true);

  ['DOMContentLoaded','click','focusin'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(ensureClearButton, 60), true);
  });
  if (document.readyState !== 'loading') window.setTimeout(ensureClearButton, 60);

  window.PaleoBotV72CompareClearRepair = { removeSpecies, clearAll, ensureClearButton };
})();
