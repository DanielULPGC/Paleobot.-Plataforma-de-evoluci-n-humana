// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v74-floating-a11y-repair
(function(){
  'use strict';

  const FONT_KEY = 'paleobot_font_scale';
  const COLOR_KEY = 'paleobot_color_mode';
  const FONT_VALUES = [80, 90, 100, 110, 120, 130, 140, 150];
  const FILTERS = `
    <!-- SVG filtros daltonismo (deduplicado v65) -->`;

  function clampFont(value){
    const n = Number(value) || 100;
    return Math.max(80, Math.min(150, Math.round(n / 10) * 10));
  }

  function currentFont(){
    const saved = window.PaleoBotStorage?.getPersistent(FONT_KEY, null);
    const stateClass = Array.from(document.documentElement.classList)
      .find(cls => /^pb-r77-font-\d+$/.test(cls) || /^pb-v74-font-\d+$/.test(cls));
    const fromClass = stateClass ? Number(stateClass.replace(/^pb-(?:r77|v74)-font-/, '')) : null;
    return clampFont(saved || fromClass || 100);
  }

  function ensureColorFilters(){
    if (document.getElementById('pb-colorblind-filters')) return;
    const target = document.body || document.documentElement;
    target.insertAdjacentHTML('afterbegin', FILTERS);
  }

  function updateFontDisplay(value){
    document.querySelectorAll('.pb-font-display').forEach(el => {
      el.textContent = value + '%';
    });
  }

  function setFont(value){
    const pct = clampFont(value);
    Array.from(document.documentElement.classList)
      .filter(cls => cls.startsWith('pb-r77-font-') || cls.startsWith('pb-v74-font-'))
      .forEach(cls => document.documentElement.classList.remove(cls));
    document.documentElement.classList.add('pb-r77-font-' + pct);
    window.PaleoBotStorage?.setPersistent(FONT_KEY, String(pct));
    updateFontDisplay(pct);
    return pct;
  }

  function setColorMode(mode){
    ensureColorFilters();
    const normalized = ['normal','deuteranopia','protanopia','achromatopsia','highcontrast'].includes(mode) ? mode : 'normal';
    document.body.classList.remove(
      'pb-v74-color-deuteranopia','pb-v74-color-protanopia','pb-v74-color-achromatopsia',
      'pb-color-deuteranopia','pb-color-protanopia','pb-color-achromatopsia','pb-color-highcontrast'
    );
    const highContrast = normalized === 'highcontrast';
    document.documentElement.classList.toggle('pb-v74-high-contrast', highContrast);
    document.documentElement.classList.toggle('pb-high-contrast', highContrast);
    if (normalized !== 'normal' && normalized !== 'highcontrast') {
      document.body.classList.add('pb-v74-color-' + normalized);
      document.body.classList.add('pb-color-' + normalized);
    }
    window.PaleoBotStorage?.setPersistent(COLOR_KEY, normalized);
    document.querySelectorAll('[data-color-mode]').forEach(btn => {
      const active = btn.dataset.colorMode === normalized;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function handleA11yClick(event){
    const fontBtn = event.target.closest && event.target.closest('[data-font-action]');
    const colorBtn = event.target.closest && event.target.closest('[data-color-mode]');
    if (!fontBtn && !colorBtn) return;

    // Owner local del toolbar: evita la doble ejecución del handler documental
    // de v63/045 sin bloquear listeners hermanos del mismo nodo.
    event.stopPropagation();

    if (fontBtn) {
      const action = fontBtn.dataset.fontAction;
      const base = currentFont();
      if (action === 'increase') setFont(base + 10);
      if (action === 'decrease') setFont(base - 10);
      if (action === 'reset') setFont(100);
      return;
    }
    if (colorBtn) setColorMode(colorBtn.dataset.colorMode);
  }

  function installToolbarOwner(){
    const root = document.getElementById('pb-a11y-toolbar-root');
    if (!root || root.dataset.pbV74A11yOwner === 'ready') return false;
    root.dataset.pbV74A11yOwner = 'ready';
    root.addEventListener('click', handleA11yClick);
    return true;
  }

  function restoreA11y(){
    ensureColorFilters();
    setFont(window.PaleoBotStorage?.getPersistent(FONT_KEY, '100') || '100');
    setColorMode(window.PaleoBotStorage?.getPersistent(COLOR_KEY, 'normal') || 'normal');
  }

  function tightenFloatingControls(){
    const root = document.getElementById('pb-a11y-toolbar-root');
    if (root) {
      root.setAttribute('aria-label', 'Controles de accesibilidad visual');
      installToolbarOwner();
    }
    document.querySelectorAll('.fab-group .fab').forEach(btn => {
      btn.setAttribute('type', 'button');
    });
  }

  document.documentElement.dataset.paleobotV74FloatingA11yRepair = 'local-toolbar-owner';

  ['DOMContentLoaded','paleobot:viewchange','paleobot:v55-viewchange'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(() => {
      tightenFloatingControls();
      restoreA11y();
    }, 120));
  });
  if (document.readyState !== 'loading') window.setTimeout(() => {
    tightenFloatingControls();
    restoreA11y();
  }, 120);

  window.PaleoBotV74FloatingA11yRepair = { setFont, setColorMode, restoreA11y, tightenFloatingControls };
})();
