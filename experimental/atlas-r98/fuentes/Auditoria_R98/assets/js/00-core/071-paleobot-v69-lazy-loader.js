(function(){
  'use strict';
  var lazyScripts = ["assets/js/90-guards/036-paleobot-v65-hero-readability-routing-fix-runtim.js","assets/js/90-guards/070-paleobot-v85-speed-guard.js"];
  var loaded = false;
  var failures = [];

  function loadOne(src) {
    return new Promise(function(resolve) {
      var script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = function(){ resolve(true); };
      script.onerror = function(){ resolve(false); };
      document.body.appendChild(script);
    });
  }

  function loadAll() {
    if (loaded) return;
    loaded = true;
    var chain = Promise.resolve();
    lazyScripts.forEach(function(src) {
      chain = chain.then(function(){ return loadOne(src).then(function(ok){ if (!ok) failures.push(src); }); });
    });
    document.documentElement.dataset.paleobotV69LazyLoader = 'running';
    chain.then(function(){
      document.documentElement.dataset.paleobotV69LazyLoader = failures.length ? 'failed' : 'ready';
      if (failures.length) window.__PALEOBOT_DEBUG && console.warn('PaleoBot: módulos diferidos no cargados', failures);
    });
  }

  function schedule() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAll, { timeout: 1400 });
      return;
    }
    window.setTimeout(loadAll, 700);
  }

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();