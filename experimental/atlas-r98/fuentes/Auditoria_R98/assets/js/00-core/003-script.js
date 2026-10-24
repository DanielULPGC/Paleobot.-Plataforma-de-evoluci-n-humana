// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
// FIX v22-F: Toolbar nav scroll indicator + swipe support
(function() {
  function initNavScroll() {
    const toolbar = document.querySelector('.toolbar');
    const nav = document.querySelector('.view-switch');
    if (!nav || !toolbar) return;

    function updateScrollIndicator() {
      const canScroll = nav.scrollWidth > nav.clientWidth + 2;
      const atEnd = nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 8;
      toolbar.classList.toggle('can-scroll-right', canScroll && !atEnd);
    }

    nav.addEventListener('scroll', updateScrollIndicator, { passive: true });
    window.addEventListener('resize', updateScrollIndicator);
    updateScrollIndicator();

    // FIX v23-1: usar evento central, sin monkey-patch
    document.addEventListener('paleobot:viewchange', (e) => {
      const btn = e.detail.btn;
      if (btn) {
        const bLeft = btn.offsetLeft - nav.offsetLeft;
        const bRight = bLeft + btn.offsetWidth;
        if (bLeft < nav.scrollLeft) {
          nav.scrollTo({ left: bLeft - 16, behavior: 'smooth' });
        } else if (bRight > nav.scrollLeft + nav.clientWidth) {
          nav.scrollTo({ left: bRight - nav.clientWidth + 16, behavior: 'smooth' });
        }
        setTimeout(updateScrollIndicator, 300);
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavScroll);
  } else {
    initNavScroll();
  }
})();
