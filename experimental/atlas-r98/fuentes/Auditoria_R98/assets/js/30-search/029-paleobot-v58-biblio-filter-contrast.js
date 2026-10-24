// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v58-biblio-filter-contrast
(function(){
  'use strict';
  function paintBibliographyFilters(){
    document.querySelectorAll('.bib-filter-btn').forEach(function(btn){
      var active = btn.classList.contains('active') || btn.getAttribute('aria-pressed') === 'true';
      btn.classList.toggle('pb-r77-bib-filter-active', active);
    });
  }
  function schedule(){ requestAnimationFrame(paintBibliographyFilters); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once:true });
  else schedule();
  document.addEventListener('click', function(event){
    if(event.target && event.target.closest && (event.target.closest('.bib-filter-btn') || event.target.closest('[data-action="abrirBiblio"]'))){
      setTimeout(schedule, 0);
    }
  }, true);
  var observer = new MutationObserver(schedule);
  if(document.body) observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','aria-pressed'] });
})();
