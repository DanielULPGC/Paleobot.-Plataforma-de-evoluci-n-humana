(function () {
  'use strict';

  const familyLabels = {
    explorar: ['Explorar', 'Vista troncal'],
    interpretar: ['Interpretar', 'Vista analitica'],
    investigar: ['Investigar', 'Vista avanzada'],
    aprender: ['Aprender', 'Vista didactica']
  };

  let syncQueued = false;

  function textFrom(root, selector) {
    return root?.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && value && element.textContent !== value) element.textContent = value;
  }

  function syncOrientationFromActiveView() {
    syncQueued = false;
    const active = document.querySelector('.view-section.active');
    if (!active) return;

    const hero = active.querySelector('.view-hero');
    const title = textFrom(hero, '.view-hero-title-row h2') || textFrom(active, 'h2');
    const family = hero?.dataset.family || document.body.dataset.navFamily || 'explorar';
    const familyMeta = familyLabels[family] || [family, 'Vista'];

    setText('viewOrientationTitle', title);
    setText('viewOrientationFamily', familyMeta[0]);
    setText('viewOrientationTier', familyMeta[1]);
    setText('viewOrientationCopy', textFrom(hero, '.view-hero-description'));
    setText('viewOrientationAudience', textFrom(hero, '.view-hero-badge'));
    setText('viewOrientationGoal', textFrom(hero, '.view-hero-card p'));
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(syncOrientationFromActiveView);
  }

  function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.type === 'attributes' && mutation.attributeName === 'class')) {
        queueSync();
      }
    }).observe(main, { subtree: true, attributes: true, attributeFilter: ['class'] });

    ['paleobot:viewchange', 'paleobot:v37-viewchange', 'paleobot:v55-viewchange'].forEach(eventName => {
      document.addEventListener(eventName, queueSync);
    });

    queueSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
