(function(){
  'use strict';

  function patchLeaflet(){
    if (!window.L || !L.DomUtil || L.DomUtil.__pbV89Guarded) return false;

    const originalGetPosition = L.DomUtil.getPosition;
    if (typeof originalGetPosition === 'function') {
      L.DomUtil.getPosition = function(el){
        if (!el) return new L.Point(0, 0);
        try {
          return originalGetPosition.call(this, el);
        } catch(err) {
          if (String(err && err.message || '').includes('_leaflet_pos')) return new L.Point(0, 0);
          throw err;
        }
      };
    }

    if (L.Map && L.Map.prototype && !L.Map.prototype.__pbV89Guarded) {
      const originalInvalidate = L.Map.prototype.invalidateSize;
      L.Map.prototype.invalidateSize = function(){
        if (!this || !this._container || !this._mapPane) return this;
        try {
          return originalInvalidate.apply(this, arguments);
        } catch(err) {
          if (String(err && err.message || '').includes('_leaflet_pos')) return this;
          throw err;
        }
      };
      L.Map.prototype.__pbV89Guarded = true;
    }

    L.DomUtil.__pbV89Guarded = true;
    document.documentElement.dataset.paleobotV89LeafletButtonGuard = 'ready';
    return true;
  }

  function boot(){
    if (patchLeaflet()) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (patchLeaflet() || tries > 80) window.clearInterval(timer);
    }, 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();

  window.PaleoBotV89LeafletButtonGuard = { patchLeaflet };
})();