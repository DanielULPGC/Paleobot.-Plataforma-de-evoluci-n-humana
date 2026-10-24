// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v85-speed-guard
(function(){
  'use strict';

  const state = {
    installedAt: Date.now(),
    throttledMethods: [],
    scheduledRuns: 0
  };

  function defer(fn) {
    state.scheduledRuns += 1;
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(fn, { timeout: 500 });
    }
    return window.setTimeout(fn, 120);
  }

  function throttleObjectMethod(obj, name, label) {
    if (!obj || typeof obj[name] !== 'function' || obj[name].__pbV85Throttle) return;
    const original = obj[name];
    let scheduled = false;
    let lastArgs = [];
    let lastThis = obj;

    const wrapped = function(...args) {
      lastArgs = args;
      lastThis = this;
      if (scheduled) return undefined;
      scheduled = true;
      return defer(function(){
        scheduled = false;
        original.apply(lastThis, lastArgs);
      });
    };

    wrapped.__pbV85Throttle = true;
    wrapped.__pbV85Original = original;
    obj[name] = wrapped;
    state.throttledMethods.push(label || name);
  }

  function install() {
    if (document.documentElement.dataset.paleobotV85SpeedGuard === 'ready') return;

    throttleObjectMethod(window.PaleoBotV80MapLensImageRepair, 'repair', 'map-lens-images');
    throttleObjectMethod(window.PaleoBotV81MapAndSpeciesMediaRepair, 'repairSpeciesImages', 'species-reference-images');
    throttleObjectMethod(window.PaleoBotV82FaunaRigorAndLayout, 'patchPanel', 'fauna-panel-layout');

    document.documentElement.dataset.paleobotV85SpeedGuard = 'ready';
    window.PaleoBotV85SpeedGuard = Object.freeze(state);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  window.addEventListener('load', function(){
    window.setTimeout(install, 0);
  }, { once: true });
})();
