// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v52-no-home-bounce-guard
(function(){
  'use strict';

  const VIEW_TO_BLOCK = {
    timeline:'explorar', map:'explorar', continentes:'explorar', africa:'explorar', asia:'explorar', europe:'explorar', america:'explorar',
    yacimientos:'explorar', biogeo:'explorar', contexto:'explorar', paleoecologia:'explorar',
    tree:'interpretar', phylo:'interpretar', clima:'interpretar', coexistencias:'interpretar', primatologia:'interpretar', constructor:'interpretar',
    revisiones:'investigar', genomica:'investigar', datacion:'investigar', debates:'investigar', estratigrafia:'investigar',
    tafonomia:'investigar', introgresion:'investigar', holotipos:'investigar', dispersal:'investigar',
    aula:'aprender', recursos:'aprender', itinerarios:'aprender', socratico:'aprender'
  };
  const BLOCK_DEFAULT = { explorar:'timeline', interpretar:'tree', investigar:'revisiones', aprender:'aula' };
  let expected = null;

  function currentView() {
    return document.querySelector('.view-section.active')?.id?.replace(/^view-/, '') || '';
  }

  function setActiveView(viewId) {
    const section = document.getElementById('view-' + viewId);
    if (!section) return false;
    document.querySelectorAll('.view-section').forEach(item => item.classList.toggle('active', item === section));
    document.querySelectorAll('[data-view], [data-pb-v50-view]').forEach(btn => {
      const btnView = btn.dataset.view || btn.dataset.pbV50View;
      const active = btnView === viewId;
      btn.classList.toggle('active', active);
      if (btn.matches('button')) btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try {
      const render = typeof window.renderActiveView === 'function'
        ? window.renderActiveView
        : (typeof window.renderActiveView === 'function' ? window.renderActiveView : null);
      if (typeof render === 'function') render(viewId);
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    document.querySelectorAll('.view-section').forEach(item => item.classList.toggle('active', item === section));
    return true;
  }

  function setActiveBlock(blockId) {
    document.body.dataset.pbV50Block = blockId;
    document.querySelectorAll('[data-pb-v50-block]').forEach(btn => {
      const active = btn.dataset.pbV50Block === blockId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function restoreExpected(reason) {
    if (!expected) return;
    const age = Date.now() - expected.at;
    if (age > 1800) {
      expected = null;
      return;
    }
    const actual = currentView();
    if (actual === expected.view) return;
    if (actual === 'timeline' || actual === '' || document.body.dataset.pbV50Block !== expected.block) {
      setActiveBlock(expected.block);
      setActiveView(expected.view);
      document.body.dataset.pbV52LastRestore = `${expected.block}:${expected.view}:${reason}`;
    }
  }

  function remember(block, view) {
    if (!block || !view) return;
    expected = { block, view, at: Date.now() };
    document.body.dataset.pbV50UserNavigated = '1';
    window.setTimeout(() => restoreExpected('delay-80'), 80);
    window.setTimeout(() => restoreExpected('delay-300'), 300);
    window.setTimeout(() => restoreExpected('delay-900'), 900);
  }

  document.addEventListener('click', event => {
    const module = event.target.closest('[data-pb-v50-view], #pbV50Blocks [data-view]');
    if (module) {
      const view = module.dataset.pbV50View || module.dataset.view;
      remember(VIEW_TO_BLOCK[view] || document.body.dataset.pbV50Block || 'explorar', view);
      return;
    }
    const block = event.target.closest('button[data-pb-v50-block], [role="tab"][data-pb-v50-block], [data-pb-v50-open-block]');
    if (block) {
      const blockId = block.dataset.pbV50Block || block.dataset.pbV50OpenBlock;
      remember(blockId, BLOCK_DEFAULT[blockId] || 'timeline');
    }
  }, true);

  ['paleobot:viewchange','paleobot:v37-viewchange','paleobot:v50-viewchange','paleobot:v51-viewchange'].forEach(name => {
    document.addEventListener(name, event => {
      if (!expected) return;
      const view = event.detail?.view || currentView();
      if (view === 'timeline' && expected.view !== 'timeline') window.setTimeout(() => restoreExpected(name), 0);
    });
  });

  document.documentElement.dataset.paleobotV52NoHomeBounce = 'ready';
})();
