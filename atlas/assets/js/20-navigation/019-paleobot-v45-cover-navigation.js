// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v45-cover-navigation
(function(){
  function goView(view){
    if (!view) return false;
    const btn = document.querySelector(`.view-btn[data-view="${CSS.escape(view)}"]`) || document.querySelector(`[data-view="${CSS.escape(view)}"]`);
    try {
      if (typeof switchView === 'function') switchView(view, btn);
      else if (typeof renderActiveView === 'function') renderActiveView(view);
    } catch(err) {
      console.warn('Navegación de portada recuperada:', view, err);
      try { window.PaleoBotV37ControlBus?.setView?.(view); } catch(inner) { /* recuperable: suprimido intencionalmente */ }
    }
    document.querySelector('.container')?.scrollIntoView({ behavior:'smooth', block:'start' });
    document.body.dataset.v45CoverLastView = view;
    return true;
  }
  function runAction(action){
    if (action === 'abrirBiblio') {
      try {
        if (typeof abrirBiblio === 'function') abrirBiblio();
        else document.getElementById('biblioModal')?.classList.add('active');
      } catch(err) {
        document.getElementById('biblioModal')?.classList.add('active');
      }
      document.body.dataset.v45CoverLastAction = action;
      return true;
    }
    if (action === 'activateClassMode') {
      try { if (typeof activateClassMode === 'function') activateClassMode(); }
      catch(err) { document.body.classList.toggle('class-mode'); }
      document.body.dataset.v45CoverLastAction = action;
      return true;
    }
    return false;
  }
  document.addEventListener('click', function(e){
    const coverTrigger = e.target.closest('.paleobot-cover-v45 [data-view], .paleobot-cover-v45 [data-action]');
    if (!coverTrigger) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (coverTrigger.dataset.view) goView(coverTrigger.dataset.view);
    else runAction(coverTrigger.dataset.action);
  }, true);
  document.body.dataset.v45Cover = 'ready';
})();
