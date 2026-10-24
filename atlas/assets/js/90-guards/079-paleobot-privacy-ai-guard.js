(function PaleoBotPrivacyAIGuard(){
  'use strict';

  const AI_HOSTS = new Set([
    'api.anthropic.com',
    'generativelanguage.googleapis.com',
    'api.openai.com'
  ]);
  const ORIGINAL_FETCH = window.fetch ? window.fetch.bind(window) : null;

  function isExplicitlyEnabled(){
    return window.PALEOBOT_EXTERNAL_AI_ENABLED === true ||
      window.PALEOBOT_EXTERNAL_AI_ENABLED === 'true' ||
      window.PALEOBOT_EXTERNAL_AI_ENABLED === '1';
  }

  function toURL(value){
    try {
      if (typeof Request !== 'undefined' && value instanceof Request) return new URL(value.url, window.location.href);
      return new URL(String(value || ''), window.location.href);
    } catch (_) {
      return null;
    }
  }

  function isSameOrigin(url){
    return Boolean(url && url.origin === window.location.origin);
  }

  function configuredEndpointURL(){
    return window.PALEOBOT_CLAUDE_ENDPOINT ? toURL(window.PALEOBOT_CLAUDE_ENDPOINT) : null;
  }

  function isConfiguredExternalEndpoint(url){
    const configured = configuredEndpointURL();
    return Boolean(configured && url && configured.origin === url.origin && !isSameOrigin(configured));
  }

  function isDirectAIProvider(url){
    return Boolean(url && AI_HOSTS.has(url.hostname));
  }

  function shouldBlock(url){
    if (!url || isExplicitlyEnabled()) return false;
    return isDirectAIProvider(url) || isConfiguredExternalEndpoint(url);
  }

  function normalizeConfiguredEndpoint(){
    const endpoint = configuredEndpointURL();
    if (!endpoint) {
      document.documentElement.dataset.paleobotExternalAi = 'off';
      return;
    }
    if (isSameOrigin(endpoint)) {
      document.documentElement.dataset.paleobotExternalAi = 'proxy';
      return;
    }
    if (!isExplicitlyEnabled()) {
      window.PALEOBOT_CLAUDE_ENDPOINT = '';
      document.documentElement.dataset.paleobotExternalAi = 'blocked';
      console.warn('[PaleoBot privacidad] Endpoint IA externo bloqueado por defecto. Use un proxy institucional same-origin o active explicitamente PALEOBOT_EXTERNAL_AI_ENABLED.');
      return;
    }
    document.documentElement.dataset.paleobotExternalAi = 'direct-enabled';
  }

  function installFetchGuard(){
    if (!ORIGINAL_FETCH || window.fetch.__paleobotPrivacyGuard) return;
    const guardedFetch = function(input, init){
      const url = toURL(input);
      if (shouldBlock(url)) {
        const message = 'PaleoBot: solicitud IA externa bloqueada por defecto. Configure un proxy institucional de mismo origen para enviar datos fuera del navegador.';
        console.warn('[PaleoBot privacidad]', message, url ? url.href : input);
        return Promise.reject(new Error(message));
      }
      return ORIGINAL_FETCH(input, init);
    };
    guardedFetch.__paleobotPrivacyGuard = true;
    guardedFetch.__paleobotOriginalFetch = ORIGINAL_FETCH;
    window.fetch = guardedFetch;
  }

  function configureInstitutionalProxy(endpoint){
    const url = toURL(endpoint);
    if (!url || !isSameOrigin(url)) {
      throw new Error('El proxy institucional debe ser una ruta relativa o de mismo origen.');
    }
    window.PALEOBOT_CLAUDE_ENDPOINT = url.pathname + url.search;
    window.PALEOBOT_EXTERNAL_AI_ENABLED = false;
    normalizeConfiguredEndpoint();
    return window.PALEOBOT_CLAUDE_ENDPOINT;
  }

  function audit(){
    const endpoint = configuredEndpointURL();
    return {
      externalAIEnabled: isExplicitlyEnabled(),
      endpoint: endpoint ? endpoint.href : '',
      endpointMode: endpoint ? (isSameOrigin(endpoint) ? 'same-origin-proxy' : 'external') : 'local',
      cspMode: 'connect-src self',
      directProviderHostsBlockedByDefault: Array.from(AI_HOSTS)
    };
  }

  function init(){
    if (typeof window.PALEOBOT_EXTERNAL_AI_ENABLED === 'undefined') {
      window.PALEOBOT_EXTERNAL_AI_ENABLED = false;
    }
    normalizeConfiguredEndpoint();
    installFetchGuard();
    document.documentElement.dataset.paleobotPrivacyGuard = 'ready';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.PaleoBotPrivacy = {
    audit,
    configureInstitutionalProxy,
    normalizeConfiguredEndpoint
  };
})();
