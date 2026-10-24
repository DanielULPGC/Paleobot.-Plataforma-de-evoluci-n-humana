// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
(function() {
  const tip   = document.getElementById('glossFloatTip');
  const title = document.getElementById('glossFloatTipTitle');
  const body  = document.getElementById('glossFloatTipBody');
  if (!tip) return;
  let _hideTimer = null;

  function positionTip(e) {
    const TW = tip.offsetWidth  || 280;
    const TH = tip.offsetHeight || 80;
    const GAP = 14;
    let L = e.clientX + GAP;
    let T = e.clientY - TH / 2;
    if (L + TW + 8 > window.innerWidth)  L = e.clientX - TW - GAP;
    if (T + TH + 8 > window.innerHeight) T = window.innerHeight - TH - 8;
    if (T < 8) T = 8;
    window.PaleoBotGeometryStyle.set(
      tip,
      'glossary-floating-tooltip',
      { left: L + 'px', top: T + 'px' }
    );
  }

  // Activar tooltip por click/focus para accesibilidad por teclado y táctil
  document.addEventListener('click', function(e) {
    const span = e.target.closest('.glossary-term[data-def]');
    if (!span) return;
    clearTimeout(_hideTimer);
    const def  = span.dataset.def  || '';
    const term = span.textContent  || '';
    title.textContent = term;
    body.textContent  = def;
    const rect = span.getBoundingClientRect();
    window.PaleoBotGeometryStyle.set(
      tip,
      'glossary-floating-tooltip',
      { left: rect.left + 'px', top: (rect.bottom + 8) + 'px' }
    );
    tip.classList.add('visible');
    span.setAttribute('aria-describedby', 'glossFloatTip');
    e.stopPropagation();
  });
  document.addEventListener('focusin', function(e) {
    const span = e.target.closest('.glossary-term[data-def]');
    if (!span) return;
    clearTimeout(_hideTimer);
    const def  = span.dataset.def  || '';
    const term = span.textContent  || '';
    title.textContent = term;
    body.textContent  = def;
    const rect = span.getBoundingClientRect();
    window.PaleoBotGeometryStyle.set(
      tip,
      'glossary-floating-tooltip',
      { left: rect.left + 'px', top: (rect.bottom + 8) + 'px' }
    );
    tip.classList.add('visible');
  });
  document.addEventListener('focusout', function(e) {
    const span = e.target.closest('.glossary-term[data-def]');
    if (!span) return;
    _hideTimer = setTimeout(() => tip.classList.remove('visible'), 300);
  });
  document.addEventListener('mouseover', function(e) {
    const span = e.target.closest('.glossary-term[data-def]');
    if (!span) return;
    clearTimeout(_hideTimer);
    const def  = span.dataset.def  || '';
    const term = span.textContent  || '';
    title.textContent = term;
    body.textContent  = def;
    positionTip(e);
    tip.classList.add('visible');
  });

  document.addEventListener('mousemove', function(e) {
    if (tip.classList.contains('visible')) positionTip(e);
  });

  document.addEventListener('mouseout', function(e) {
    const span = e.target.closest('.glossary-term[data-def]');
    if (!span) return;
    _hideTimer = setTimeout(() => tip.classList.remove('visible'), 120);
  });

  // Hide on scroll (panel scroll events)
  document.addEventListener('scroll', () => tip.classList.remove('visible'), true);
})();
