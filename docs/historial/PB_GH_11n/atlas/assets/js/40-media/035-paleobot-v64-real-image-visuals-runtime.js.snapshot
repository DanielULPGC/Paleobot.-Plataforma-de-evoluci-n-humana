// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v64-real-image-visuals-runtime
(function(){
  'use strict';
  const EVENT_IMAGES = {
    nea_to_eur_asia:{
      title:'Neandertales y humanos modernos',
      note:'Registro fósil neandertal y señal genética compartida en Eurasia.',
      img:'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_sapiens_neanderthalensis-Mr._N.jpg?width=900'
    },
    den_to_melanesia:{
      title:'Denisova y Oceanía',
      note:'ADN antiguo y poblaciones actuales para discutir la señal denisovana.',
      img:'https://commons.wikimedia.org/wiki/Special:FilePath/Denisova%20cave%2001.jpg?width=900'
    },
    den_to_tibet:{
      title:'Adaptación en altura',
      note:'Meseta tibetana como contexto para EPAS1 y herencia adaptativa.',
      img:'https://commons.wikimedia.org/wiki/Special:FilePath/Tibet%20landscape.jpg?width=900'
    },
    nea_to_africa:{
      title:'Retorno hacia África',
      note:'Comparación de poblaciones y cautela ante inferencias genéticas indirectas.',
      img:'https://commons.wikimedia.org/wiki/Special:FilePath/Skhul.JPG?width=900'
    },
    arcaic_afr_to_afr:{
      title:'África y linajes arcaicos',
      note:'Paisajes africanos para recordar que la señal genética necesita contexto fósil.',
      img:'https://commons.wikimedia.org/wiki/Special:FilePath/Olduvai_Gorge_or_Oldupai_Gorge.jpg?width=900'
    }
  };
  const FALLBACKS = [
    'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_sapiens_neanderthalensis-Mr._N.jpg?width=900',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Denisova_Cave.jpg?width=900',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Olduvai_Gorge_or_Oldupai_Gorge.jpg?width=900',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_sapiens_skull_-_Skhul_5.jpg?width=900'
  ];
  function esc(value){
    return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function replaceIntrogVisual(){
    const wrap = document.querySelector('#view-introgresion .introg-svg-wrap');
    if (!wrap || wrap.dataset.pbV64RealImages === 'ready') return false;
    const events = Array.isArray(window.INTROGRESSION_EVENTS) ? window.INTROGRESSION_EVENTS : (typeof INTROGRESSION_EVENTS !== 'undefined' ? INTROGRESSION_EVENTS : []);
    const cards = (events.length ? events : Object.keys(EVENT_IMAGES).map(id => ({ id }))).map((ev, index) => {
      const meta = EVENT_IMAGES[ev.id] || {};
      const title = meta.title || `${ev.from || 'Linaje'} -> ${String(ev.to || 'población').replace(/\n/g,' ')}`;
      const note = meta.note || `${ev.pct_min || ''}-${ev.pct_max || ''}% · ${ev.ka_min || ''}-${ev.ka_max || ''} ka`;
      const img = meta.img || FALLBACKS[index % FALLBACKS.length];
      return `<button type="button" class="introg-photo-card" data-introg-event="${esc(ev.id)}">
        <img src="${esc(img)}" alt="${esc(title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <span>${esc(title)}</span>
        <small>${esc(note)}</small>
      </button>`;
    }).join('');
    wrap.setAttribute('role','group');
    wrap.setAttribute('aria-label','Imágenes reales de apoyo para eventos de introgresión');
    wrap.innerHTML = `<div class="introg-photo-grid">${cards}</div>`;
    wrap.dataset.pbV64RealImages = 'ready';
    updateEmptyPanelText();
    syncActiveCard();
    document.documentElement.dataset.paleobotV64RealImageVisuals = 'ready';
    return true;
  }
  function setSelectedEvent(id){
    try {
      if (typeof _introgState !== 'undefined') _introgState.selectedEvent = id;
    } catch(_error) { /* recuperable: suprimido intencionalmente */ }
    document.body.dataset.pbV64SelectedIntrog = id || '';
    syncActiveCard();
    const panel = document.getElementById('introgDetailPanel');
    try {
      if (panel && typeof _buildIntrogPanel === 'function') panel.innerHTML = _buildIntrogPanel();
    } catch(_error) { /* recuperable: suprimido intencionalmente */ }
    updateEmptyPanelText();
  }
  function syncActiveCard(){
    let selected = document.body.dataset.pbV64SelectedIntrog || '';
    try {
      if (!selected && typeof _introgState !== 'undefined') selected = _introgState.selectedEvent || '';
    } catch(_error) { /* recuperable: suprimido intencionalmente */ }
    document.querySelectorAll('.introg-photo-card[data-introg-event]').forEach(card => {
      const on = !!selected && card.dataset.introgEvent === selected;
      card.classList.toggle('active', on);
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function updateEmptyPanelText(){
    const empty = document.querySelector('#introgDetailPanel .introg-panel-empty');
    if (!empty) return;
    empty.textContent = empty.textContent.replace('Pulsa una flecha del diagrama', 'Selecciona una imagen del bloque');
  }
  function keepIntrogressionView(){
    const active = document.querySelector('.view-section.active, [data-view].active');
    const activeId = active?.id?.replace(/^view-/,'') || document.body.dataset.pbV50View || '';
    if (activeId === 'introgresion') return;
    if (window.PaleoBotV55Router?.activateView) {
      window.PaleoBotV55Router.activateView('introgresion', { scroll:false });
      window.setTimeout(() => {
        const wrap = document.querySelector('#view-introgresion .introg-svg-wrap');
        if (wrap) wrap.dataset.pbV64RealImages = '';
        replaceIntrogVisual();
        setSelectedEvent(document.body.dataset.pbV64SelectedIntrog || '');
      }, 80);
    }
  }
  document.addEventListener('click', event => {
    const card = event.target.closest?.('.introg-photo-card[data-introg-event]');
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    /* FIX (Claude 2026-06): delega en la API del núcleo, que sí actualiza el
       panel de detalle. Se eliminó keepIntrogressionView + pbV50Block='investigar'
       porque rebotaban al usuario de vuelta a introgresión e impedían regresar. */
    if (typeof window.selectIntrogEvent === 'function') {
      window.selectIntrogEvent(card.dataset.introgEvent || '');
    } else {
      setSelectedEvent(card.dataset.introgEvent || '');
    }
  }, true);
  const oldRender = window.renderIntrogressionView;
  if (typeof oldRender === 'function') {
    window.renderIntrogressionView = function(){
      const result = oldRender.apply(this, arguments);
      window.setTimeout(replaceIntrogVisual, 40);
      return result;
    };
  }
  document.addEventListener('paleobot:v55-viewchange', event => {
    if (event.detail?.view === 'introgresion') window.setTimeout(replaceIntrogVisual, 80);
  });
  document.addEventListener('paleobot:viewchange', event => {
    if (event.detail?.view === 'introgresion') window.setTimeout(replaceIntrogVisual, 80);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.setTimeout(replaceIntrogVisual, 300), { once:true });
  else window.setTimeout(replaceIntrogVisual, 300);
  window.PaleoBotV64RealImageVisuals = { replaceIntrogVisual };
})();
