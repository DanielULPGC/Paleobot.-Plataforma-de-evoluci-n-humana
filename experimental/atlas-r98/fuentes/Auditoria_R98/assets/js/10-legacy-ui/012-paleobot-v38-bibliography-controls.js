// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v38-bibliography-controls
(function(){
  function getBibState(){
    const active = document.querySelector('.bib-filter-btn.active[data-bib-filter]');
    return {
      filter: active?.dataset.bibFilter || 'all',
      term: (document.getElementById('bibSearch')?.value || '').trim().toLowerCase()
    };
  }
  function refMatches(ref, group, state){
    const year = Number(ref.dataset.year || 0);
    const hasDoi = ref.dataset.doi === '1';
    const isAfrica = ref.dataset.africa === '1' || group.classList.contains('bib-africa-group') || /africa|áfrica/i.test(group.textContent || '');
    const text = (ref.textContent || '').toLowerCase();
    const groupTitle = (group.querySelector('h3')?.textContent || '').toLowerCase();
    const filterOk = state.filter === 'all' ||
      (state.filter === 'recent' && year >= 2023) ||
      (state.filter === 'newdata' && year >= 2024) ||
      (state.filter === 'africaRecent' && isAfrica && year >= 2023) ||
      (state.filter === 'doi' && hasDoi);
    const searchOk = !state.term || text.includes(state.term) || groupTitle.includes(state.term);
    return filterOk && searchOk;
  }
  function applyBibliographyFilters(){
    const content = document.getElementById('biblioContent');
    if (!content) return { visible:0, total:0 };
    const state = getBibState();
    let total = 0;
    let visible = 0;
    content.querySelectorAll('.bib-update-panel').forEach(panel => {
      window.PaleoBotStyleState.display(panel, state.filter === 'all' && !state.term ? '' : 'none');
    });
    content.querySelectorAll('.bib-species-group').forEach(group => {
      let groupVisible = 0;
      const refs = Array.from(group.querySelectorAll('.bib-ref'));
      refs.forEach(ref => {
        total += 1;
        const ok = refMatches(ref, group, state);
        ref.hidden = !ok;
        window.PaleoBotStyleState.display(ref, ok ? '' : 'none');
        if (ok) {
          visible += 1;
          groupVisible += 1;
        }
      });
      group.hidden = groupVisible === 0;
      window.PaleoBotStyleState.display(group, groupVisible ? '' : 'none');
      const badge = group.querySelector('.bib-species-count');
      if (badge) badge.textContent = groupVisible + ' ref' + (groupVisible !== 1 ? 's' : '');
    });
    let status = document.getElementById('bibFilterStatus');
    const controls = document.querySelector('.bib-controls');
    if (!status && controls) {
      status = document.createElement('div');
      status.id = 'bibFilterStatus';
      status.className = 'bib-filter-status';
      status.setAttribute('aria-live','polite');
      controls.insertAdjacentElement('afterend', status);
    }
    if (status) {
      const label = document.querySelector('.bib-filter-btn.active[data-bib-filter]')?.textContent?.trim() || 'Todas';
      status.textContent = visible + ' de ' + total + ' referencias visibles · filtro: ' + label + (state.term ? ' · búsqueda: ' + state.term : '');
    }
    return { visible, total };
  }
  function setBibliographyFilter(filter, btn){
    document.querySelectorAll('.bib-filter-btn[data-bib-filter]').forEach(item => {
      const active = item === btn || item.dataset.bibFilter === filter;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    return applyBibliographyFilters();
  }
  function runPostFilter(){
    const api = window.PaleoBotV38Bibliography;
    if (api && typeof api.applyBibliographyFilters === 'function') {
      return api.applyBibliographyFilters();
    }
    return applyBibliographyFilters();
  }
  function schedulePostFilter(){
    window.setTimeout(runPostFilter, 0);
  }
  function installBibliographyControls(){
    if (document.body.dataset.v38Bibliography === 'postfilter-adapter') return false;
    const modal = document.getElementById('biblioModal');
    if (!modal) return false;
    document.body.dataset.v38Bibliography = 'postfilter-adapter';
    document.documentElement.dataset.paleobotV38Mode = 'postfilter-adapter';

    modal.addEventListener('click', function(e){
      if (!e.target.closest('[data-bib-filter]')) return;
      schedulePostFilter();
    });
    modal.addEventListener('input', function(e){
      if (!e.target.closest('[data-bib-search]')) return;
      schedulePostFilter();
    });
    document.addEventListener('paleobot:bibliography-rendered', runPostFilter);
    return true;
  }
  const oldOpen = window.abrirBiblio;
  if (typeof oldOpen === 'function' && !oldOpen.__v38Wrapped) {
    window.abrirBiblio = function(){
      const result = oldOpen.apply(this, arguments);
      applyBibliographyFilters();
      document.dispatchEvent(new CustomEvent('paleobot:bibliography-rendered'));
      return result;
    };
    window.abrirBiblio.__v38Wrapped = true;
  }
  installBibliographyControls();
  window.PaleoBotV38Bibliography = {
    applyBibliographyFilters,
    setBibliographyFilter,
    runPostFilter,
    installBibliographyControls,
    mode:'postfilter-adapter'
  };
})();
