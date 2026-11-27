// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v77-search-guard
(function(){
  'use strict';

  let results = [];
  let focusIndex = -1;

  function norm(value){
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
  }

  function dbList(){
    if (Array.isArray(window.DB)) return window.DB;
    if (window.DB_INDEX && typeof window.DB_INDEX === 'object') return Object.values(window.DB_INDEX);
    return [];
  }

  function buildIndex(){
    const index = [];
    dbList().forEach(sp => {
      if (!sp || (!sp.id && !sp.nombre)) return;
      const title = sp.nombre || sp.id;
      index.push({
        type: 'taxon',
        id: sp.id || title,
        title,
        sub: [sp.anos, sp.clado, sp.ubicacion].filter(Boolean).join(' · '),
        body: norm(['taxon', 'taxón', 'especie', title, sp.id, sp.nombre, sp.ubicacion, sp.holo, sp.clado, sp.anos, sp.descripcion, sp.dieta].join(' '))
      });
    });

    const views = window.VIEW_META || {};
    Object.keys(views).forEach(id => {
      const meta = views[id] || {};
      const title = meta.label || meta.title || id;
      index.push({
        type: 'vista',
        id,
        title,
        sub: meta.desc || meta.description || meta.family || 'Vista del atlas',
        body: norm(['vista', id, title, meta.label, meta.title, meta.desc, meta.description, meta.family, meta.keywords].join(' '))
      });
    });

    const seenViewLabels = new Set(index.filter(item => item.type === 'vista').map(item => item.id + '::' + norm(item.title)));
    document.querySelectorAll('[data-view]').forEach(btn => {
      const id = btn.dataset.view;
      if (!id) return;
      const strong = btn.querySelector('strong')?.textContent?.trim();
      const title = strong || btn.getAttribute('aria-label') || btn.textContent.trim().replace(/\s+/g, ' ').slice(0, 70) || id;
      const key = id + '::' + norm(title);
      if (seenViewLabels.has(key)) return;
      seenViewLabels.add(key);
      const sub = btn.querySelector('span')?.textContent?.trim() || btn.closest('[aria-label]')?.getAttribute('aria-label') || 'Vista del atlas';
      index.push({
        type: 'vista',
        id,
        title,
        sub,
        body: norm(['vista', id, title, sub, btn.textContent].join(' '))
      });
    });

    const glossary = window.glosario || window.GLOSARIO || window.GLOSSARY || {};
    Object.keys(glossary).forEach(term => {
      const entry = glossary[term];
      const def = typeof entry === 'string' ? entry : (entry && (entry.def || entry.definition || entry.text)) || '';
      index.push({
        type: 'glosario',
        id: term,
        title: term,
        sub: def,
        body: norm(['glosario', 'termino', 'término', term, def].join(' '))
      });
    });
    return index;
  }

  function search(query){
    const q = norm(query);
    if (q.length < 2) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return buildIndex().map(item => {
      const title = norm(item.title);
      let score = 0;
      terms.forEach(term => {
        if (title === term) score += 90;
        else if (title.startsWith(term)) score += 55;
        else if (title.includes(term)) score += 35;
        if (norm(item.type).includes(term)) score += 14;
        if (item.body.includes(term)) score += 8;
      });
      if (terms.length > 1 && title.includes(q)) score += 60;
      return { ...item, score };
    }).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 18);
  }

  function typeMeta(type){
    if (type === 'taxon') return { label:'Taxón', icon:'', color:'var(--primary)' };
    if (type === 'vista') return { label:'Vista', icon:'', color:'#0e7f65' };
    return { label:'Glosario', icon:'', color:'#8a5a00' };
  }

  function render(query){
    const list = document.getElementById('gs-listbox');
    const input = document.getElementById('gsInput');
    if (!list || !input) return;
    results = search(query);
    focusIndex = results.length ? 0 : -1;
    input.setAttribute('aria-expanded', String(results.length > 0));
    if (norm(query).length < 2) {
      list.innerHTML = '<div class="gs-empty"><span class="gs-empty-icon">Buscar</span><p>Escribe al menos dos letras.</p></div>';
      return;
    }
    if (!results.length) {
      list.innerHTML = '<div class="gs-empty"><span class="gs-empty-icon">Sin resultados</span><p>No hay coincidencias para <strong>' + esc(query) + '</strong>.</p><p class="gs-hint">Prueba con Homo, mapa, glosario, cronología o yacimiento.</p></div>';
      return;
    }
    list.innerHTML = results.map((item, i) => {
      const meta = typeMeta(item.type);
      const sub = item.sub ? '<span class="gs-result-sub">' + esc(String(item.sub).slice(0, 120)) + '</span>' : '';
      return '<button type="button" class="gs-result" role="option" aria-selected="' + String(i === focusIndex) + '" data-v77-search-index="' + i + '" data-gs-index="' + i + '">' +
        '<span class="gs-type-badge" style="background:' + meta.color + ';">' + meta.label + '</span>' +
        '<span><span class="gs-result-title">' + esc(item.title) + '</span>' + sub + '</span>' +
      '</button>';
    }).join('');
  }

  function closeSearch(){
    const modal = document.getElementById('globalSearchModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal-overlay.active,.detail-panel.active,.side-panel.active')));
  }

  function routeView(id){
    const routers = [window.PaleoBotV68InteractionStabilizer, window.PaleoBotV55Router, window.PaleoBotCanonicalNav];
    for (const router of routers) {
      try {
        if (router?.routeView?.(id)) return true;
        if (router?.activateView?.(id, { scroll:true })) return true;
        if (router?.setCanonical) { router.setCanonical(id); return true; }
      } catch(err) {}
    }
    try { if (typeof window.switchView === 'function') { window.switchView(id); return true; } } catch(err) {}
    return false;
  }

  function openTaxon(id){
    const sp = (window.DB_INDEX && window.DB_INDEX[id]) || dbList().find(item => item && (item.id === id || item.nombre === id));
    if (!sp) return false;
    closeSearch();
    try {
      if (typeof window.showDetail === 'function') {
        window.showDetail(sp);
        const panel = document.getElementById('detailView');
        if (panel) panel.dataset.v77SearchOpened = sp.id || sp.nombre || '';
        return true;
      }
    } catch(err) {}
    routeView('timeline');
    window.setTimeout(() => {
      const safe = window.CSS && CSS.escape ? CSS.escape(sp.id || id) : String(sp.id || id).replace(/"/g, '\\"');
      document.querySelector('[data-open-species="' + safe + '"], .species-item[data-id="' + safe + '"], [data-id="' + safe + '"]')?.click?.();
    }, 120);
    return true;
  }

  function openGlossary(term){
    closeSearch();
    try {
      if (typeof window.openGlossary === 'function') window.openGlossary();
      else window.PaleoBotV68InteractionStabilizer?.setModal?.('glossaryModal', true);
    } catch(err) {}
    window.setTimeout(() => {
      const input = document.querySelector('[data-gloss-search], #glossarySearch, #glossaryModal input[type="search"], #glossaryModal input');
      if (input) {
        input.value = term;
        input.dispatchEvent(new Event('input', { bubbles:true }));
      }
    }, 180);
    return true;
  }

  function activate(index){
    const item = results[index] || results[0];
    if (!item) return false;
    if (item.type === 'taxon') return openTaxon(item.id);
    if (item.type === 'vista') { closeSearch(); return routeView(item.id); }
    if (item.type === 'glosario') return openGlossary(item.id || item.title);
    return false;
  }

  function updateSelection(){
    document.querySelectorAll('#globalSearchModal .gs-result').forEach((btn, i) => {
      btn.setAttribute('aria-selected', String(i === focusIndex));
      if (i === focusIndex) btn.scrollIntoView({ block:'nearest' });
    });
  }

  function openSearch(){
    const modal = document.getElementById('globalSearchModal');
    const input = document.getElementById('gsInput');
    if (!modal || !input) return false;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.setTimeout(() => {
      input.focus();
      render(input.value);
    }, 40);
    return true;
  }

  document.addEventListener('input', function(event){
    if (event.target?.id !== 'gsInput') return;
    window.setTimeout(() => render(event.target.value), 180);
  }, true);

  document.addEventListener('click', function(event){
    if (event.target.closest?.('[data-action="openGlobalSearch"], #gsOpenBtn')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openSearch();
      return;
    }
    const hit = event.target.closest?.('#globalSearchModal .gs-result');
    if (!hit) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activate(Number(hit.dataset.v77SearchIndex || hit.dataset.gsIndex || 0));
  }, true);

  document.addEventListener('keydown', function(event){
    const input = event.target?.id === 'gsInput' ? event.target : null;
    if (!input) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopImmediatePropagation();
      focusIndex = Math.min((focusIndex < 0 ? 0 : focusIndex + 1), results.length - 1);
      updateSelection();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopImmediatePropagation();
      focusIndex = Math.max(focusIndex - 1, 0);
      updateSelection();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!results.length) render(input.value);
      activate(focusIndex >= 0 ? focusIndex : 0);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeSearch();
    }
  }, true);

  window.addEventListener('input', function(event){
    if (event.target?.id !== 'gsInput') return;
    window.setTimeout(() => render(event.target.value), 0);
  }, true);

  window.addEventListener('click', function(event){
    const searchOpener = event.target.closest?.('[data-action="openGlobalSearch"], #gsOpenBtn');
    if (searchOpener && window.PaleoBotV88FloatingMenuFinal &&
        searchOpener.closest('.fab-group,#pb-a11y-toolbar-root')) {
      return;
    }
    if (searchOpener) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openSearch();
      return;
    }
    const hit = event.target.closest?.('#globalSearchModal .gs-result');
    if (!hit) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activate(Number(hit.dataset.v77SearchIndex || hit.dataset.gsIndex || 0));
  }, true);

  window.addEventListener('keydown', function(event){
    const input = event.target?.id === 'gsInput' ? event.target : null;
    if (!input) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopImmediatePropagation();
      focusIndex = Math.min((focusIndex < 0 ? 0 : focusIndex + 1), results.length - 1);
      updateSelection();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopImmediatePropagation();
      focusIndex = Math.max(focusIndex - 1, 0);
      updateSelection();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!results.length) render(input.value);
      activate(focusIndex >= 0 ? focusIndex : 0);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeSearch();
    }
  }, true);

  if (window.PaleoBotBus?.registerAction) {
    try { window.PaleoBotBus.registerAction('openGlobalSearch', openSearch); } catch(err) {}
  }
  window.openGlobalSearch = openSearch;
  window.PaleoBotV77SearchGuard = { search, render, openSearch, activate, openTaxon, routeView };
})();
