'use strict';
(function installPaleoBotStorageAdapter(){
  if (window.PaleoBotStorage) return;

  const persistentMemory = new Map();
  const sessionMemory = new Map();
  const rawScope = typeof window.PALEOBOT_STORAGE_SCOPE === 'string'
    ? window.PALEOBOT_STORAGE_SCOPE.trim()
    : '';
  const normalizedScope = rawScope
    ? rawScope.replace(/[^a-zA-Z0-9._:-]+/g, '_').slice(0, 120)
    : '';
  const prefix = normalizedScope ? `paleobot:${normalizedScope}:` : '';

  function physicalKey(logicalKey){
    const key = String(logicalKey ?? '');
    return prefix ? prefix + key : key;
  }

  function probe(storage, probeKey){
    if (!storage) return false;
    try {
      storage.setItem(probeKey, '1');
      storage.removeItem(probeKey);
      return true;
    } catch (_) {
      return false;
    }
  }

  let persistentAvailable = false;
  let sessionAvailable = false;
  try { persistentAvailable = probe(window.localStorage, physicalKey('__storage_probe_persistent__')); } catch (_) {}
  try { sessionAvailable = probe(window.sessionStorage, physicalKey('__storage_probe_session__')); } catch (_) {}

  function read(storage, memory, available, logicalKey, fallback){
    const pk = physicalKey(logicalKey);
    try {
      if (available) {
        const value = storage.getItem(pk);
        if (value !== null) return value;
      }
    } catch (_) {}
    return memory.has(pk) ? memory.get(pk) : fallback;
  }

  function write(storage, memory, available, logicalKey, value){
    const pk = physicalKey(logicalKey);
    const serialized = String(value);
    try {
      if (available) {
        storage.setItem(pk, serialized);
        return true;
      }
    } catch (_) {}
    memory.set(pk, serialized);
    return false;
  }

  function remove(storage, memory, available, logicalKey){
    const pk = physicalKey(logicalKey);
    try {
      if (available) storage.removeItem(pk);
    } catch (_) {}
    memory.delete(pk);
  }

  function keys(storage, memory, available, logicalPrefix=''){
    const physicalPrefix = physicalKey(logicalPrefix);
    const out = new Set();
    try {
      if (available) {
        for (let i=0;i<storage.length;i++) {
          const k=storage.key(i);
          if (k && k.startsWith(physicalPrefix)) out.add(k);
        }
      }
    } catch (_) {}
    for (const k of memory.keys()) if (k.startsWith(physicalPrefix)) out.add(k);
    const strip = prefix
      ? k => k.startsWith(prefix) ? k.slice(prefix.length) : k
      : k => k;
    return [...out].map(strip);
  }

  const api = Object.freeze({
    getPersistent(key, fallback=null){
      return read(window.localStorage, persistentMemory, persistentAvailable, key, fallback);
    },
    setPersistent(key, value){
      return write(window.localStorage, persistentMemory, persistentAvailable, key, value);
    },
    removePersistent(key){
      remove(window.localStorage, persistentMemory, persistentAvailable, key);
    },
    persistentKeys(logicalPrefix=''){
      return keys(window.localStorage, persistentMemory, persistentAvailable, logicalPrefix);
    },
    getSession(key, fallback=null){
      return read(window.sessionStorage, sessionMemory, sessionAvailable, key, fallback);
    },
    setSession(key, value){
      return write(window.sessionStorage, sessionMemory, sessionAvailable, key, value);
    },
    removeSession(key){
      remove(window.sessionStorage, sessionMemory, sessionAvailable, key);
    },
    sessionKeys(logicalPrefix=''){
      return keys(window.sessionStorage, sessionMemory, sessionAvailable, logicalPrefix);
    },
    persistentAvailable(){ return persistentAvailable; },
    sessionAvailable(){ return sessionAvailable; },
    namespace(){ return normalizedScope; },
    physicalKey
  });

  window.PaleoBotStorage = api;

  // Compatibility aliases already expected by later legacy/feature layers.
  window.ssGet = function(key, fallback=null){
    return api.getPersistent(key, fallback);
  };
  window.ssSet = function(key, value){
    if (value === null || typeof value === 'undefined') {
      api.removePersistent(key);
      return;
    }
    api.setPersistent(key, value);
  };

  document.documentElement.dataset.paleobotStorage = 'r60';
  if (normalizedScope) document.documentElement.dataset.paleobotStorageScope = normalizedScope;
})();
