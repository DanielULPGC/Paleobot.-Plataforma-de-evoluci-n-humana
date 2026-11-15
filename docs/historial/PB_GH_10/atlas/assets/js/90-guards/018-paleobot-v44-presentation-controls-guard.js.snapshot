// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v44-presentation-controls-guard
(function(){
  function overlay(){
    return document.getElementById('presOverlay');
  }
  function isOpen(){
    return overlay()?.classList.contains('active');
  }
  function currentSpecies(){
    try {
      if (Array.isArray(presSpecies) && presSpecies[presIndex]) return presSpecies[presIndex];
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try {
      const name = document.getElementById('presName')?.textContent?.trim();
      if (name && Array.isArray(DB)) return DB.find(sp => sp.nombre === name || sp.nombreCorto === name) || null;
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    try { return Array.isArray(DB) ? DB[0] : null; } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    return null;
  }
  function closeOverlayOnly(){
    const ov = overlay();
    if (!ov) return false;
    try { if (typeof closePresMapModal === 'function') closePresMapModal(); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden','true');
    document.body.classList.remove('pres-active');
    document.body.style.overflow = '';
    document.body.dataset.v44PresentationClose = 'ok';
    return true;
  }
  function safePresNav(dir){
    if (!isOpen()) return false;
    const oldName = document.getElementById('presName')?.textContent?.trim() || '';
    let handledByCore = false;
    try {
      if (typeof presNav === 'function') {
        presNav(dir);
        handledByCore = true;
      }
    } catch(err) {
      console.warn('presNav recuperado por v44:', err);
    }
    try {
      if (!handledByCore && Array.isArray(presSpecies)) {
        const max = presSpecies.length - 1;
        if (typeof presIndex === 'number') presIndex = Math.max(0, Math.min(max, presIndex + dir));
        if (typeof buildPresDots === 'function') buildPresDots();
        if (typeof renderPresSlide === 'function') renderPresSlide();
      }
    } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    const newName = document.getElementById('presName')?.textContent?.trim() || '';
    document.body.dataset.v44PresentationNav = newName && newName !== oldName ? 'changed' : 'handled';
    return true;
  }
  function openFullDetailFromPresentation(){
    const sp = currentSpecies();
    if (!sp) return false;
    closeOverlayOnly();
    setTimeout(() => {
      try {
        if (typeof showDetail === 'function') showDetail(sp);
      } catch(err) {
        console.warn('showDetail recuperado por v44:', err);
      }
      const panel = document.getElementById('detailView');
      if (panel) {
        panel.classList.add('active');
        panel.setAttribute('aria-hidden','false');
        panel.dataset.v44FromPresentation = sp.id || sp.nombre || 'species';
      }
      document.body.dataset.v44PresentationDetail = sp.id || sp.nombre || 'ok';
      try { window.PaleoBotV42DetailRepair?.normalizeDetailPanel?.(); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
      try { window.PaleoBotV43DetailTabs?.selectDetailTab?.('gen'); } catch(err) { /* recuperable: err suprimido intencionalmente */ }
    }, 30);
    return true;
  }
  function install(){
    document.body.dataset.v44PresentationControls = 'ready';
    document.addEventListener('click', function(e){
      const detail = e.target.closest('#presOverlay [data-pres-detail]');
      if (detail) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openFullDetailFromPresentation();
        return;
      }
      const nav = e.target.closest('#presOverlay [data-pres-nav]');
      if (nav) {
        e.preventDefault();
        e.stopImmediatePropagation();
        safePresNav(Number(nav.dataset.presNav || 0));
        return;
      }
      const close = e.target.closest('#presOverlay [data-pres-close], #presOverlay [data-pres-back]');
      if (close) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeOverlayOnly();
      }
    }, true);
    document.addEventListener('keydown', function(e){
      if (!isOpen()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeOverlayOnly();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopImmediatePropagation();
        safePresNav(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopImmediatePropagation();
        safePresNav(-1);
      }
    }, true);
  }
  install();
  window.PaleoBotV44PresentationControls = { safePresNav, openFullDetailFromPresentation, closeOverlayOnly };
})();
