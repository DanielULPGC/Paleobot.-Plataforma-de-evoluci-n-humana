// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v41-layout-guard
(function(){
  function resetHorizontalDrift(){
    try { document.documentElement.scrollLeft = 0; } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try { document.body.scrollLeft = 0; } catch(err) { /* recuperable: err suprimido intencionalmente */ }
  }
  function tagOpenableCards(){
    document.querySelectorAll('#timelineList .species-item[data-id]').forEach(item => {
      if (!item.dataset.openSpecies) item.dataset.openSpecies = item.dataset.id;
      item.setAttribute('role','button');
      item.setAttribute('tabindex','0');
      item.dataset.v41Openable = 'true';
    });
  }
  function repairLayout(){
    document.body.dataset.v41LayoutRepair = 'ready';
    resetHorizontalDrift();
    tagOpenableCards();
    const shell = document.querySelector('.v36-workspace-shell');
    const main = document.getElementById('main-content');
    if (shell && main && main.parentElement !== shell) {
      const toolbar = document.querySelector('.toolbar');
      if (toolbar && toolbar.parentElement !== shell) shell.appendChild(toolbar);
      shell.appendChild(main);
    }
  }
  document.addEventListener('DOMContentLoaded', repairLayout);
  window.addEventListener('load', repairLayout);
  document.addEventListener('paleobot:viewchange', repairLayout);
  document.addEventListener('paleobot:v37-viewchange', repairLayout);
  document.addEventListener('paleobot:species-opened', repairLayout);
  setTimeout(repairLayout, 0);
  setTimeout(repairLayout, 300);
  window.PaleoBotV41LayoutRepair = { repairLayout, tagOpenableCards };
})();
