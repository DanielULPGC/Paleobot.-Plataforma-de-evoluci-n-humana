// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v65-hero-readability-routing-fix-runtime
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
    document.documentElement.dataset.paleobotV65HeroReadabilityRoutingFix = 'ready';
  }
  function blockPassiveHeroClick(event){
    const passiveHeroZone = event.target.closest?.('.view-hero-card, .view-hero-pills, .view-hero-badge');
    if (!passiveHeroZone) return;
    if (event.target.closest?.('button,a,input,select,textarea,[data-view],[data-action],[data-pb-v50-view]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    document.body.dataset.pbV65PassiveHeroClick = 'blocked';
  }
  window.addEventListener('pointerdown', blockPassiveHeroClick, true);
  window.addEventListener('click', blockPassiveHeroClick, true);
  document.addEventListener('click', blockPassiveHeroClick, true);
  ['DOMContentLoaded','paleobot:v55-viewchange','paleobot:v59-render','paleobot:viewchange'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(cleanHeroCopy, 50));
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cleanHeroCopy, { once:true });
  else window.setTimeout(cleanHeroCopy, 80);
})();
