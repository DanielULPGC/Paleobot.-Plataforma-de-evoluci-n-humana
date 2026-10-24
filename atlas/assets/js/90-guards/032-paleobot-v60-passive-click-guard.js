// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v60-passive-click-guard
(function(){
  'use strict';
  const INTERACTIVE = [
    'button','a[href]','input','select','textarea','summary','label',
    '[role="button"]','[role="tab"]','[tabindex]:not([tabindex="-1"])',
    '[data-view]','[data-pb-v50-view]','[data-action]','[data-pb-v50-action]',
    'button[data-pb-v50-block]','[role="tab"][data-pb-v50-block]','[data-pb-v50-open-block]','[data-pb-v50-jump]',
    '[data-pb-v50-map-expand]','[data-pb-v50-close-map]','[data-modal-toggle]',
    '[data-open-species]','[data-show-map-species]','[data-map-layer]',
    '[data-map-toggle]','[data-map-zoom]','[data-map-lens]','[data-map-select]',
    '[data-bib-filter]','[data-resource-link-filter]','[data-copy-link]',
    '[data-lightbox-open]','[data-lightbox-close]','[data-panel-nav]',
    '[data-panel-close]','[data-tab]','[data-detail-action]'
  ].join(',');
  const PASSIVE_SURFACE = [
    '#pbV50BlockPanel .pb-v50-cover',
    '#pbV50BlockPanel .pb-v50-block-copy',
    '#pbV50BlockPanel h2',
    '#pbV50BlockPanel p',
    '#main-content > .container',
    '.view-section.active > .section-header',
    '.view-section.active > .section-intro'
  ].join(',');
  function hasActionableAncestor(target, stopAt){
    let node = target;
    while (node && node !== stopAt && node.nodeType === 1) {
      if (node.matches?.('button,a[href],input,select,textarea,summary,label,[role="button"],[role="tab"],[tabindex]:not([tabindex="-1"])')) return true;
      const attrs = [...(node.attributes || [])].map(attr => attr.name);
      if (attrs.some(name => name.startsWith('data-') && !['data-rendered','data-pb-v61-bound','data-pb-v61-fallback-applied','data-pb-v61-fallback-reason','data-pb-v61-original-src'].includes(name))) return true;
      if (node.matches?.('canvas,.species-item,.matrix-row-clickable,.builder-node,.glossary-card,.map-node,.map-region-frame')) return true;
      node = node.parentElement;
    }
    return false;
  }
  function guard(event){
    const target = event.target;
    if (!target?.closest) return;
    if (target.closest(INTERACTIVE)) return;
    const activeSection = target.closest('.view-section.active');
    const isPassiveMapCanvas = target.id === 'mapSvg';
    const isPassiveViewBackground = activeSection && !hasActionableAncestor(target, activeSection);
    if (!target.closest(PASSIVE_SURFACE) && !isPassiveViewBackground && !isPassiveMapCanvas) return;
    const keepBlock = document.body.dataset.pbV50Block || '';
    const keepView = document.querySelector('.view-section.active')?.id?.replace(/^view-/,'') || '';
    event.stopImmediatePropagation();
    document.body.dataset.pbV60PassiveClickGuard = 'blocked';
    window.setTimeout(() => {
      const current = document.querySelector('.view-section.active')?.id?.replace(/^view-/,'') || '';
      if (!keepView || current === keepView) return;
      if (typeof window.PaleoBotV55Router?.activateView === 'function') {
        window.PaleoBotV55Router.activateView(keepView, { scroll:false });
      } else {
        document.body.dataset.pbV50Block = keepBlock;
        document.querySelectorAll('.view-section').forEach(section => {
          const active = section.id === 'view-' + keepView;
          section.classList.toggle('active', active);
          section.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
      }
      document.body.dataset.pbV60PassiveRestore = keepView;
    }, 0);
  }
  window.addEventListener('pointerdown', guard, true);
  window.addEventListener('click', guard, true);
  document.documentElement.dataset.paleobotV60PassiveClickGuard = 'ready';
})();
