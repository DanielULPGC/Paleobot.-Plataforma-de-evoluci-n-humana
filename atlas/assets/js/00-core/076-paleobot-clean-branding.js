// Keeps technical build identifiers out of user-facing content.
(function(){
  'use strict';

  const VERSION_RE = /\bPaleoBot\s+v\d+(?:\.\d+)*(?:\s+(?:modular|lazy|reunificado|consolidado))*\b/gi;
  const ATLAS_VERSION_RE = /\bAtlas\s+v\d+(?:\.\d+)*(?:\s+(?:modular|lazy))*\b/gi;
  const DEA_VERSION_RE = /\bDEA\s*[·\-]\s*v\d+(?:\.\d+)*\b/gi;
  const PREFIX_VERSION_RE = /\bv\d+(?:\.\d+)*\s*[·\-]\s*PaleoBot\b/gi;
  const LABEL_VERSION_RE = /\b(?:versi[oó]n|version)\s*:?\s*v?\d+(?:\.\d+)*\b/gi;
  const ATTRIBUTES = ['aria-label', 'title', 'alt', 'placeholder', 'content'];

  function clean(value){
    return String(value || '')
      .replace(VERSION_RE, 'PaleoBot')
      .replace(ATLAS_VERSION_RE, 'Atlas')
      .replace(DEA_VERSION_RE, 'DEA · ULPGC')
      .replace(PREFIX_VERSION_RE, 'PaleoBot')
      .replace(LABEL_VERSION_RE, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([,.;:])/g, '$1')
      .trim();
  }

  function cleanElement(root){
    if (!root || root.nodeType !== 1) return;
    const elements = [root].concat(Array.from(root.querySelectorAll('*')));
    elements.forEach(function(element){
      if (element.matches('script,style,link')) return;
      ATTRIBUTES.forEach(function(attribute){
        if (!element.hasAttribute(attribute)) return;
        const before = element.getAttribute(attribute);
        const after = clean(before);
        if (after !== before) element.setAttribute(attribute, after);
      });
      Array.from(element.childNodes).forEach(function(node){
        if (node.nodeType !== Node.TEXT_NODE) return;
        const before = node.nodeValue || '';
        const after = clean(before);
        if (after !== before) node.nodeValue = after;
      });
    });
  }

  function cleanDocument(){
    document.title = 'PaleoBot — Atlas Paleoantropológico Interactivo (DEA · ULPGC)';
    cleanElement(document.body);
    document.documentElement.dataset.paleobotCleanBranding = 'ready';
  }

  const observer = new MutationObserver(function(records){
    records.forEach(function(record){
      record.addedNodes.forEach(function(node){
        if (node.nodeType === 1) cleanElement(node);
        if (node.nodeType === Node.TEXT_NODE && node.parentElement &&
            !node.parentElement.matches('script,style')) {
          const before = node.nodeValue || '';
          const after = clean(before);
          if (after !== before) node.nodeValue = after;
        }
      });
    });
  });

  function init(){
    cleanDocument();
    observer.observe(document.body, { childList:true, subtree:true });
    window.setTimeout(cleanDocument, 500);
    window.setTimeout(cleanDocument, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
