'use strict';
(function resolvePaleoBotStorageScope(){
  if (typeof window.PALEOBOT_STORAGE_SCOPE === 'string' && window.PALEOBOT_STORAGE_SCOPE.trim()) {
    window.PALEOBOT_STORAGE_SCOPE_SOURCE = 'host';
    return;
  }

  function normalize(value){
    return String(value || '')
      .trim()
      .replace(/[^a-zA-Z0-9._:-]+/g, '_')
      .slice(0, 120);
  }

  function fnv1a32(value){
    let hash = 0x811c9dc5;
    const text = String(value || '');
    for (let i=0;i<text.length;i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36).padStart(7, '0');
  }

  const meta = document.querySelector('meta[name="paleobot-storage-scope"]');
  const configured = meta ? String(meta.getAttribute('content') || '').trim() : '';

  if (configured && configured.toLowerCase() !== 'auto') {
    const explicit = normalize(configured);
    if (explicit) {
      window.PALEOBOT_STORAGE_SCOPE = explicit;
      window.PALEOBOT_STORAGE_SCOPE_SOURCE = 'meta';
      document.documentElement.dataset.paleobotStorageScopeSource = 'meta';
      return;
    }
  }

  const loc = window.location || {};
  const origin = typeof loc.origin === 'string' && loc.origin && loc.origin !== 'null'
    ? loc.origin
    : `${loc.protocol || ''}//${loc.host || ''}`;
  const pathname = typeof loc.pathname === 'string' && loc.pathname
    ? loc.pathname
    : '/';
  const basis = `${origin}${pathname}`;
  const automatic = `auto-${fnv1a32(basis)}`;

  window.PALEOBOT_STORAGE_SCOPE = automatic;
  window.PALEOBOT_STORAGE_SCOPE_SOURCE = 'auto-location';
  document.documentElement.dataset.paleobotStorageScopeSource = 'auto-location';
})();
