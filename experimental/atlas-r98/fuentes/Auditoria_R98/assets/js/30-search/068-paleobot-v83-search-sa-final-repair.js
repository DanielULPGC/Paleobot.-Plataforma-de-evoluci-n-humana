// Recovery R27 — v83 scientific filter adapter
(function(){
  'use strict';

  function norm(value){
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function speciesRange(sp){
    return window.PaleoBotA3Temporal.legacyRange(sp);
  }

  function textCorpus(sp){
    const expert = sp?.experto || {};
    const refs = Array.isArray(expert.referencias)
      ? expert.referencias.map(function(r){ return [r.a,r.t,r.j,r.d].join(' '); }).join(' ')
      : '';
    return norm([
      sp?.id, sp?.nombre, sp?.nombreCorto, window.PaleoBotA3Temporal.displayMetadata(sp).text, sp?.ubicacion, sp?.holo, sp?.datacion,
      sp?.dieta, sp?.herramientas, sp?.estado, sp?.clado, sp?.descripcion,
      expert.descripcion_tecnica, expert.debate, expert.anatomia_craneal,
      expert.anatomia_postcraneal, expert.paleoecologia, expert.cultura, refs
    ].filter(Boolean).join(' | '));
  }

  function robustMatchesActiveFilters(sp){
    if (!sp) return false;

    try {
      if (typeof cladoFilter !== 'undefined' &&
          cladoFilter !== 'all' &&
          sp.clado !== cladoFilter) return false;
    } catch(_){}

    if (typeof timeFilter !== 'undefined' &&
        !window.PaleoBotA3Temporal.include(sp, timeFilter.young, timeFilter.old)) return false;

    const input = document.getElementById('searchInput') ||
                  document.querySelector('[data-search-input]');
    const term = norm(input?.value || '');
    if (!term) return true;

    const corpus = textCorpus(sp);
    return term
      .split(/\s+/)
      .filter(Boolean)
      .every(function(piece){ return corpus.includes(piece); });
  }

  function installSearchOverride(){
    try {
      matchesActiveFilters = robustMatchesActiveFilters;
      window.matchesActiveFilters = robustMatchesActiveFilters;
    } catch(_){
      window.matchesActiveFilters = robustMatchesActiveFilters;
    }
    document.documentElement.dataset.paleobotV83SearchOverride = 'ready';
    return true;
  }

  function applySearchNow(){
    const search = document.getElementById('searchInput') ||
                   document.querySelector('[data-search-input]');
    const landing = document.getElementById('landingSearchInput');
    if (search && landing && landing.value !== search.value) {
      landing.value = search.value;
    }

    installSearchOverride();

    if (typeof applyFilters === 'function') {
      applyFilters();
      return true;
    }

    document.querySelectorAll('#timelineList .species-item').forEach(function(el){
      const id = el.dataset.id || el.dataset.openSpecies;
      const sp =
        (window.DB_INDEX || {})[id] ||
        (Array.isArray(window.DB)
          ? window.DB.find(function(item){ return item.id === id; })
          : null);
      window.PaleoBotStyleState.display(el, robustMatchesActiveFilters(sp) ? '' : 'none');
    });

    if (typeof updateCount === 'function') updateCount();
    return true;
  }

  function init(){
    installSearchOverride();
    document.documentElement.dataset.paleobotV83FinalRepair = 'filter-adapter';
    document.documentElement.dataset.paleobotV83Mode = 'scientific-filter-adapter';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.PaleoBotV83SearchSAFinalRepair = {
    applySearchNow,
    robustMatchesActiveFilters,
    installSearchOverride,
    mode:'scientific-filter-adapter'
  };
})();
