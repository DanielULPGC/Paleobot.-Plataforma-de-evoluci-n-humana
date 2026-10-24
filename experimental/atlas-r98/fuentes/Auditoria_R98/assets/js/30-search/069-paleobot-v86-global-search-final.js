(function(){
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function speciesRows() {
    const db = Array.isArray(window.DB) ? window.DB : [];
    return db.filter(Boolean).map(function(sp){
      const title = sp.nombre || sp.nombreCorto || sp.id || 'Taxón';
      const chronology = window.PaleoBotA3Temporal.displayMetadata(sp);
      const sub = [chronology.text, sp.ubicacion || sp.region, sp.clado].filter(Boolean).join(' · ');
      return {
        type: 'taxon',
        id: sp.id,
        title: title,
        sub: sub,
        haystack: norm([title, sp.nombreCorto, sp.id, chronology.text, sp.ubicacion, sp.region, sp.clado, sp.holo].join(' '))
      };
    });
  }

  const VIEWS = [
    ['timeline','Cronología','Explorar taxones por tiempo'],
    ['map','Mapa','Distribución geográfica y yacimientos'],
    ['tree','Árbol evolutivo','Relación filogenética visual'],
    ['aula','Aula','Centro docente: materiales, banco de datos y diagnóstico'],
    ['yacimientos','Yacimientos','Fichas y contexto arqueológico'],
    ['paleoecologia','Paleoecología','Ambiente, dieta y fauna asociada'],
    ['primatologia','Primatología','Comparación primatológica'],
    ['constructor','Constructor','Hipótesis y relaciones']
  ];

  function viewRows() {
    return VIEWS.map(function(item){
      return { type:'vista', id:item[0], title:item[1], sub:item[2], haystack:norm(item.join(' ')) };
    }).filter(function(item){ return document.getElementById('view-' + item.id); });
  }

  function search(query) {
    const q = norm(query);
    if (!q) return [];

    // v63 conserva el índice semánticamente más rico (taxones, vistas y glosario),
    // pero v86 normaliza y activa los resultados.
    if (window.PaleoBotV63 && typeof window.PaleoBotV63.search === 'function') {
      try {
        const rows = window.PaleoBotV63.search(query, 18);
        if (Array.isArray(rows)) {
          return rows.map(function(item){
            return {
              type: item.type || 'resultado',
              id: item.id,
              title: item.title || item.id || 'Resultado',
              sub: item.type === 'glosario' ? 'Glosario' : '',
              haystack: norm([item.title, item.id, item.body].join(' '))
            };
          });
        }
      } catch (err) {
        window.__PALEOBOT_DEBUG && console.warn('[PaleoBot v86 search] Fallo del índice v63; usando fallback.', err);
      }
    }

    return speciesRows().concat(viewRows()).filter(function(item){
      return item.haystack.indexOf(q) !== -1;
    }).slice(0, 18);
  }

  let selectedIndex = -1;

  function listbox() {
    return document.getElementById('gs-listbox');
  }

  function render(query) {
    const list = listbox();
    const input = document.getElementById('gsInput');
    if (!list) return [];
    const results = search(query);
    window.__PB_V86_SEARCH_RESULTS = results;
    selectedIndex = results.length ? 0 : -1;
    if (input) {
      input.setAttribute('aria-expanded', String(results.length > 0));
      input.removeAttribute('aria-activedescendant');
    }
    if (!String(query || '').trim()) {
      list.innerHTML = '<div class="gs-empty"><span class="gs-empty-icon">Buscar</span><p>Empieza a escribir para buscar en el atlas</p></div>';
      return results;
    }
    if (!results.length) {
      list.innerHTML = '<div class="gs-empty"><span class="gs-empty-icon">Sin resultados</span><p>No hay coincidencias para <strong>' + esc(query) + '</strong>.</p></div>';
      return results;
    }
    list.innerHTML = results.map(function(item, index){
      const kind = item.type === 'taxon' ? 'Taxón' : (item.type === 'glosario' ? 'Glosario' : 'Vista');
      return '<button type="button" class="gs-result" id="gs-v86-opt-' + index + '" role="option" aria-selected="' + String(index === 0) + '" data-v86-search-index="' + index + '" data-gs-index="' + index + '">' +
        '<span class="gs-result-kind">' + esc(kind) + '</span>' +
        '<span><span class="gs-result-title">' + esc(item.title) + '</span>' +
        (item.sub ? '<span class="gs-result-sub">' + esc(item.sub) + '</span>' : '') + '</span>' +
      '</button>';
    }).join('');
    if (results.length && input) input.setAttribute('aria-activedescendant', 'gs-v86-opt-0');
    return results;
  }

  function selectIndex(index) {
    const results = window.__PB_V86_SEARCH_RESULTS || [];
    if (!results.length) {
      selectedIndex = -1;
      return -1;
    }
    const next = Math.max(0, Math.min(results.length - 1, Number(index) || 0));
    selectedIndex = next;
    const input = document.getElementById('gsInput');
    const items = document.querySelectorAll('#globalSearchModal .gs-result');
    items.forEach(function(item, i){
      const selected = i === selectedIndex;
      item.setAttribute('aria-selected', String(selected));
      if (selected) {
        if (input) input.setAttribute('aria-activedescendant', item.id || ('gs-v86-opt-' + i));
        if (typeof item.scrollIntoView === 'function') item.scrollIntoView({ block:'nearest' });
      }
    });
    return selectedIndex;
  }

  function getSelectedIndex() {
    return selectedIndex;
  }

  function openModal() {
    const modal = document.getElementById('globalSearchModal');
    const input = document.getElementById('gsInput');
    if (!modal) return false;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(function(){
      if (input) {
        input.focus({ preventScroll:true });
        render(input.value || '');
      }
    }, 0);
    return true;
  }

  function closeModal() {
    const modal = document.getElementById('globalSearchModal');
    if (!modal) return false;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    selectedIndex = -1;
    const input = document.getElementById('gsInput');
    if (input) {
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }
    if (!document.querySelector('.modal-overlay.active,.pb-v50-modal.active,.pres-overlay.active,.pres-map-modal.active,.lightbox.active,.socratic-overlay.active')) {
      document.body.classList.remove('modal-open');
    }
    const trigger = document.getElementById('gsOpenBtn');
    if (trigger && typeof trigger.focus === 'function') {
      try { trigger.focus({ preventScroll:true }); } catch (_) { try { trigger.focus(); } catch (_) {} }
    }
    return true;
  }

  function openGlossaryTerm(term) {
    closeModal();
    try {
      if (typeof window.openGlossary === 'function') {
        window.openGlossary();
      } else if (window.PaleoBotV68InteractionStabilizer &&
                 typeof window.PaleoBotV68InteractionStabilizer.setModal === 'function') {
        window.PaleoBotV68InteractionStabilizer.setModal('glossaryModal', true);
      }
    } catch (_) {}
    setTimeout(function(){
      const input = document.querySelector('[data-gloss-search]') || document.getElementById('glossarySearch');
      if (input) {
        input.value = term || '';
        input.dispatchEvent(new Event('input', { bubbles:true }));
      }
    }, 0);
    return true;
  }

  function activate(index) {
    const item = (window.__PB_V86_SEARCH_RESULTS || [])[index || 0];
    if (!item) return false;

    if (item.type === 'taxon') {
      // Recovery R2: ruta canónica. La búsqueda ya no abre fichas directamente.
      if (window.PaleoBot && typeof window.PaleoBot.openSpecies === 'function') {
        const result = window.PaleoBot.openSpecies(item.id, {
          source: 'global-search-v86',
          closeModal: true
        });
        if (result && result.ok) return true;
      }

      // Fallback conservador: delegar en una superficie existente si la fachada
      // no estuviera disponible. No se llama directamente a showDetail().
      const card = document.querySelector('[data-open-species="' + CSS.escape(item.id) + '"],[data-id="' + CSS.escape(item.id) + '"]');
      if (card) {
        closeModal();
        card.click();
        return true;
      }

      window.__PALEOBOT_DEBUG && console.warn('[PaleoBot v86 search] No se pudo abrir el taxón mediante la API canónica:', item.id);
      return false;
    }

    if (item.type === 'vista') {
      closeModal();
      if (window.PaleoBotV68InteractionStabilizer &&
          typeof window.PaleoBotV68InteractionStabilizer.routeView === 'function' &&
          window.PaleoBotV68InteractionStabilizer.routeView(item.id)) {
        return true;
      }
      if (typeof window.renderActiveView === 'function') window.renderActiveView(item.id);
      const btn = document.querySelector('[data-view="' + CSS.escape(item.id) + '"],[data-pb-v50-view="' + CSS.escape(item.id) + '"]');
      if (btn) btn.click();
      return true;
    }

    if (item.type === 'glosario') {
      return openGlossaryTerm(item.id || item.title);
    }

    return false;
  }

  document.addEventListener('input', function(event){
    if (event.target && event.target.id === 'gsInput') render(event.target.value || '');
  }, true);

  document.addEventListener('click', function(event){
    const opener = event.target.closest && event.target.closest('[data-action="openGlobalSearch"],[data-pb-v50-action="openGlobalSearch"],#gsOpenBtn');
    if (opener) {
      event.preventDefault();
      openModal();
      return;
    }
    const hit = event.target.closest && event.target.closest('#globalSearchModal .gs-result');
    if (hit) {
      event.preventDefault();
      activate(Number(hit.dataset.v86SearchIndex || hit.dataset.gsIndex || 0));
    }
  }, true);

  document.addEventListener('keydown', function(event){
    if (!event.target || event.target.id !== 'gsInput') return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectIndex(selectedIndex < 0 ? 0 : selectedIndex + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectIndex(selectedIndex < 0 ? 0 : selectedIndex - 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      activate(selectedIndex < 0 ? 0 : selectedIndex);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
    }
  }, true);

  window.openGlobalSearch = openModal;
  window.PaleoBotV86GlobalSearchFinal = {
    search: search,
    render: render,
    openModal: openModal,
    closeModal: closeModal,
    activate: activate,
    selectIndex: selectIndex,
    getSelectedIndex: getSelectedIndex,
    openGlossaryTerm: openGlossaryTerm
  };
  document.documentElement.dataset.paleobotV86GlobalSearchFinal = 'ready';
})();
