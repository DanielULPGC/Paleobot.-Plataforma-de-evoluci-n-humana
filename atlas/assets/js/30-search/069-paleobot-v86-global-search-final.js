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
      const title = sp.nombre || sp.nombreCorto || sp.id || 'Taxon';
      const sub = [sp.anos, sp.ubicacion || sp.region, sp.clado].filter(Boolean).join(' · ');
      return {
        type: 'taxon',
        id: sp.id,
        title: title,
        sub: sub,
        haystack: norm([title, sp.nombreCorto, sp.id, sp.anos, sp.ubicacion, sp.region, sp.clado, sp.holo].join(' '))
      };
    });
  }

  const VIEWS = [
    ['timeline','Cronologia','Explorar taxones por tiempo'],
    ['map','Mapa','Distribucion geografica y yacimientos'],
    ['tree','Arbol evolutivo','Relacion filogenetica visual'],
    ['aula','Aula','Generador de situaciones de aprendizaje'],
    ['yacimientos','Yacimientos','Fichas y contexto arqueologico'],
    ['paleoecologia','Paleoecologia','Ambiente, dieta y fauna asociada'],
    ['primatologia','Primatologia','Comparacion primatologica'],
    ['constructor','Constructor','Hipotesis y relaciones']
  ];

  function viewRows() {
    return VIEWS.map(function(item){
      return { type:'vista', id:item[0], title:item[1], sub:item[2], haystack:norm(item.join(' ')) };
    }).filter(function(item){ return document.getElementById('view-' + item.id); });
  }

  function search(query) {
    const q = norm(query);
    if (!q) return [];
    return speciesRows().concat(viewRows()).filter(function(item){
      return item.haystack.indexOf(q) !== -1;
    }).slice(0, 18);
  }

  function listbox() {
    return document.getElementById('gs-listbox');
  }

  function render(query) {
    const list = listbox();
    const input = document.getElementById('gsInput');
    if (!list) return [];
    const results = search(query);
    window.__PB_V86_SEARCH_RESULTS = results;
    if (input) input.setAttribute('aria-expanded', String(results.length > 0));
    if (!String(query || '').trim()) {
      list.innerHTML = '<div class="gs-empty"><span class="gs-empty-icon">Buscar</span><p>Empieza a escribir para buscar en el atlas</p></div>';
      return results;
    }
    if (!results.length) {
      list.innerHTML = '<div class="gs-empty"><span class="gs-empty-icon">Sin resultados</span><p>No hay coincidencias para <strong>' + esc(query) + '</strong>.</p></div>';
      return results;
    }
    list.innerHTML = results.map(function(item, index){
      return '<button type="button" class="gs-result" role="option" aria-selected="' + String(index === 0) + '" data-v86-search-index="' + index + '" data-gs-index="' + index + '">' +
        '<span class="gs-result-kind">' + esc(item.type === 'taxon' ? 'Taxon' : 'Vista') + '</span>' +
        '<span><span class="gs-result-title">' + esc(item.title) + '</span>' +
        (item.sub ? '<span class="gs-result-sub">' + esc(item.sub) + '</span>' : '') + '</span>' +
      '</button>';
    }).join('');
    return results;
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

  function activate(index) {
    const item = (window.__PB_V86_SEARCH_RESULTS || [])[index || 0];
    if (!item) return false;
    if (item.type === 'taxon') {
      const sp = Array.isArray(window.DB) ? window.DB.find(function(row){ return row && row.id === item.id; }) : null;
      if (sp && typeof window.showDetail === 'function') {
        window.showDetail(sp);
        return true;
      }
      const card = document.querySelector('[data-open-species="' + CSS.escape(item.id) + '"],[data-id="' + CSS.escape(item.id) + '"]');
      if (card) { card.click(); return true; }
    }
    if (item.type === 'vista') {
      if (typeof window.renderActiveView === 'function') window.renderActiveView(item.id);
      const btn = document.querySelector('[data-view="' + CSS.escape(item.id) + '"],[data-pb-v50-view="' + CSS.escape(item.id) + '"]');
      if (btn) btn.click();
      return true;
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
    if (event.key === 'Enter') {
      event.preventDefault();
      activate(0);
    }
  }, true);

  window.openGlobalSearch = openModal;
  window.PaleoBotV86GlobalSearchFinal = { search: search, render: render, openModal: openModal, activate: activate };
  document.documentElement.dataset.paleobotV86GlobalSearchFinal = 'ready';
})();
