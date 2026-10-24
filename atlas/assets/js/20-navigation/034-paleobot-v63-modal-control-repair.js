// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v63-modal-control-repair
(function(){
  'use strict';
  const GLOSS_GROUPS = {
    all:[],
    taxonomia:['taxonomia','filogenia','anatomia'],
    cronologia:['cronologia','datacion'],
    genomica:['genomica','paleogenomica'],
    estratigrafia:['estratigrafia','datacion','paleoambiente'],
    metodologia:['metodologia','cultura','paleoambiente','tafonomia'],
    anatomia:['anatomia','taxonomia'],
    datacion:['datacion','cronologia','estratigrafia'],
    filogenia:['filogenia','taxonomia'],
    paleogenomica:['paleogenomica','genomica'],
    paleoambiente:['paleoambiente','estratigrafia'],
    cultura:['cultura','metodologia']
  };
  const GLOSSARY_PAGE_SIZE = 24;
  let activeGlossary = 'all';
  let glossaryVisibleLimit = GLOSSARY_PAGE_SIZE;
  function text(el){
    const raw = el && typeof el.value === 'string' ? el.value : (el?.textContent || '');
    return raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }
  function cardTags(card){
    const raw = String(card.dataset.glossTags || '').toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
    const hay = text(card);
    const tags = new Set(raw);
    if (/taxonom|clado|filogen|linaje|homin|especie|rasgo|craneo|mandib|diente|pelvis|femur|biped/.test(hay)) tags.add('taxonomia');
    if (/cronolog|datacion|edad|estratigraf|radiocarbono|argon|uranio|\bka\b|\bma\b|mioceno|plioceno|pleistoceno/.test(hay)) tags.add('cronologia');
    if (/adn|genom|genetic|introgres|neandertal|denisov|proteom|mitocond/.test(hay)) tags.add('genomica');
    if (/estratigraf|sediment|nivel|capa|tafonom|yacimiento|deposicion|abrasion|acrecion/.test(hay)) tags.add('estratigrafia');
    if (/metodo|tecnica|industria|herramient|achelense|olduvayense|cultura|movimiento|analisis|proceso/.test(hay)) tags.add('metodologia');
    if (raw.includes('anatomia')) tags.add('taxonomia');
    if (raw.includes('datacion')) { tags.add('cronologia'); tags.add('estratigrafia'); }
    if (raw.includes('paleogenomica')) tags.add('genomica');
    if (raw.includes('paleoambiente')) { tags.add('estratigrafia'); tags.add('metodologia'); }
    if (raw.includes('cultura')) tags.add('metodologia');
    if (!tags.size) tags.add('metodologia');
    card.dataset.pbV63GlossTags = [...tags].join(',');
    return tags;
  }
  function cardSearchText(card){
    const prepared = String(card?.dataset?.glossSearchText || '').trim();
    if (prepared) return prepared;
    const clone = card?.cloneNode?.(true);
    clone?.querySelectorAll?.('.glossary-card-tags,.glossary-card-tag').forEach(el => el.remove());
    return text(clone);
  }
  function ensureGlossaryPager(){
    const content = document.getElementById('glossaryContent');
    if (!content) return null;
    let pager = document.getElementById('pbV63GlossPager');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'pbV63GlossPager';
      pager.className = 'pb-glossary-pager';
      pager.innerHTML = '<p id="pbV63GlossPageStatus" role="status" aria-live="polite"></p><button type="button" data-gloss-more>Mostrar 24 t&eacute;rminos m&aacute;s</button>';
      const firstSection = content.querySelector('.glossary-section');
      const firstGrid = content.querySelector('.glossary-grid');
      if (firstSection || firstGrid) content.insertBefore(pager, firstSection || firstGrid);
      else content.appendChild(pager);
    }
    return pager;
  }
  function applyGlossary(theme = activeGlossary, resetPage = false){
    activeGlossary = GLOSS_GROUPS[theme] ? theme : 'all';
    if (resetPage) glossaryVisibleLimit = GLOSSARY_PAGE_SIZE;
    const searchInput = document.querySelector('[data-gloss-search]');
    const rawSearch = String(searchInput?.value || '').trim();
    const search = text(searchInput);
    document.querySelectorAll('[data-gloss-theme]').forEach(btn => {
      const on = btn.dataset.glossTheme === activeGlossary;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    let visible = 0;
    let matches = 0;
    document.querySelectorAll('#glossaryContent .glossary-card').forEach(card => {
      const tags = cardTags(card);
      const group = GLOSS_GROUPS[activeGlossary] || [];
      const byTheme = activeGlossary === 'all' || group.some(tag => tags.has(tag)) || tags.has(activeGlossary);
      const bySearch = !search || cardSearchText(card).includes(search);
      const matched = byTheme && bySearch;
      if (matched) matches += 1;
      const show = matched && matches <= glossaryVisibleLimit;
      card.hidden = !show;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    document.querySelectorAll('#glossaryContent .glossary-section').forEach(section => {
      const hasVisibleCards = Boolean(section.querySelector('.glossary-card:not([hidden])'));
      section.hidden = !hasVisibleCards;
    });
    let status = document.getElementById('pbV63GlossStatus');
    const host = document.querySelector('#glossaryContent .v34-gloss-filter') || document.querySelector('#glossaryContent .glossary-top');
    if (!status && host) {
      status = document.createElement('span');
      status.id = 'pbV63GlossStatus';
      status.className = 'glossary-total';
      host.appendChild(status);
    }
    if (status) {
      status.textContent = matches
        ? (search
          ? `${matches} ${matches === 1 ? 'coincidencia' : 'coincidencias'}`
          : `${matches} ${matches === 1 ? 'término' : 'términos'} en la categoría`)
        : 'Sin coincidencias';
    }
    const pager = ensureGlossaryPager();
    const pageStatus = document.getElementById('pbV63GlossPageStatus');
    const more = pager?.querySelector('[data-gloss-more]');
    if (pageStatus) {
      const context = search ? ` para "${rawSearch}"` : (activeGlossary === 'all' ? ' en total' : ' en esta categoría');
      pageStatus.textContent = matches
        ? `Mostrando ${visible} de ${matches} ${matches === 1 ? 'término' : 'términos'}${context}.`
        : `No hay términos${context}.`;
    }
    if (more) {
      more.hidden = visible >= matches;
      more.disabled = visible >= matches;
    }
    document.documentElement.dataset.paleobotV63ModalControlRepair = 'ready';
  }
  function refreshGlossary(){
    if (!document.getElementById('glossaryModal')?.classList.contains('active')) return;
    glossaryVisibleLimit = GLOSSARY_PAGE_SIZE;
    window.setTimeout(() => applyGlossary(activeGlossary), 40);
  }
  document.addEventListener('click', event => {
    const theme = event.target.closest?.('[data-gloss-theme]');
    if (!theme) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    applyGlossary(theme.dataset.glossTheme, true);
  }, true);
  document.addEventListener('input', event => {
    if (!event.target.closest?.('[data-gloss-search]')) return;
    applyGlossary(activeGlossary, true);
  }, true);
  function showMoreGlossary(){
    glossaryVisibleLimit += GLOSSARY_PAGE_SIZE;
    applyGlossary(activeGlossary);
    return true;
  }
  function revealGlossaryCard(card){
    if (!card) return false;
    const input = document.querySelector('[data-gloss-search]');
    if (input) input.value = '';
    activeGlossary = 'all';
    const cards = Array.from(document.querySelectorAll('#glossaryContent .glossary-card'));
    const index = cards.indexOf(card);
    glossaryVisibleLimit = Math.max(GLOSSARY_PAGE_SIZE, Math.ceil((index + 1) / GLOSSARY_PAGE_SIZE) * GLOSSARY_PAGE_SIZE);
    applyGlossary('all');
    return index >= 0;
  }
  function refreshGlossaryPage(){
    glossaryVisibleLimit = GLOSSARY_PAGE_SIZE;
    applyGlossary(activeGlossary);
  }
  window.PaleoBotGlossaryPagination = {
    reveal: revealGlossaryCard,
    refresh: refreshGlossaryPage,
    filter: () => applyGlossary(activeGlossary, true),
    more: showMoreGlossary
  };
  document.addEventListener('click', event => {
    const zoom = event.target.closest?.('[data-chart-zoom]');
    if (!zoom) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const mode = zoom.dataset.chartZoom || 'all';
    document.querySelectorAll('[data-chart-zoom]').forEach(btn => {
      const on = btn === zoom;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (typeof window.setChartZoom === 'function') {
      window.setChartZoom(mode, zoom);
    } else if (typeof setChartZoom === 'function') {
      setChartZoom(mode, zoom);
    } else if (typeof window.drawEncefChart === 'function') {
      window.drawEncefChart();
    }
    document.body.dataset.pbV63ChartZoom = mode;
  }, true);
  document.addEventListener('click', event => {
    const action = event.target.closest?.('[data-chart-action]');
    if (!action) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const name = action.dataset.chartAction;
    const fn = window[name] || (name === 'toggleSelectMode' && window.toggleSelectMode) || (name === 'exportChartPNG' && window.exportChartPNG) || (name === 'resetChartSelection' && window.resetChartSelection);
    if (typeof fn === 'function') fn();
    document.body.dataset.pbV63ChartAction = name || '';
  }, true);
  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-action="openGlossary"], .fab.glossary')) refreshGlossary();
  }, true);
  const oldOpen = window.openGlossary;
  if (typeof oldOpen === 'function') {
    window.openGlossary = function(){
      const result = oldOpen.apply(this, arguments);
      refreshGlossary();
      return result;
    };
  }
  window.PaleoBotV63ModalControlRepair = { applyGlossary };
})();
