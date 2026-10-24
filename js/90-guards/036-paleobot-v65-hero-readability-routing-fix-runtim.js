// Recovery R44 — v65 hero readability-only adapter
(function(){
  'use strict';

  function cleanHeroCopy(){
    document.querySelectorAll('.view-hero-badge').forEach(badge => {
      const text = (badge.textContent || '').trim().toLowerCase();
      if (text === 'bloque necesario') badge.textContent = 'Contexto clave';
      if (text === 'bloque prioritario') badge.textContent = 'Registro central';
    });
    document.querySelectorAll('.view-hero-actions').forEach(actions => {
      actions.hidden = true;
      actions.setAttribute('aria-hidden','true');
    });
    document.documentElement.dataset.paleobotV65HeroReadabilityRoutingFix = 'readability-only';
  }

  function scheduleCleanHeroCopy(){
    window.setTimeout(cleanHeroCopy, 50);
  }

  ['DOMContentLoaded','paleobot:v55-viewchange','paleobot:v59-render','paleobot:viewchange'].forEach(name => {
    document.addEventListener(name, scheduleCleanHeroCopy);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanHeroCopy, { once:true });
  } else {
    window.setTimeout(cleanHeroCopy, 80);
  }

  window.PaleoBotV65HeroReadability = {
    cleanHeroCopy,
    mode:'readability-only'
  };
})();
