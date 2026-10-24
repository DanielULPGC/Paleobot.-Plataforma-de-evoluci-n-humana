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
    var saved = null; try { saved = localStorage.getItem(FONT_KEY); } catch (e) { saved = null; }
    const inline = parseInt(String(document.documentElement.style.fontSize || '').replace('%', ''), 10);
    return clampFont(saved || inline || 100);
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
    FONT_VALUES.forEach(v => document.documentElement.classList.remove('pb-v74-font-' + v));
    document.documentElement.classList.add('pb-v74-font-' + pct);
    document.documentElement.style.fontSize = pct + '%';
    try { localStorage.setItem(FONT_KEY, String(pct)); } catch(err) {}
    updateFontDisplay(pct);
    return pct;
  }

  function setColorMode(mode){
    ensureColorFilters();
    const normalized = ['normal','deuteranopia','protanopia','achromatopsia','highcontrast'].includes(mode) ? mode : 'normal';
    document.body.classList.remove('pb-v74-color-deuteranopia','pb-v74-color-protanopia','pb-v74-color-achromatopsia');
    document.documentElement.classList.toggle('pb-v74-high-contrast', normalized === 'highcontrast');
    if (normalized !== 'normal' && normalized !== 'highcontrast') {
      document.body.classList.add('pb-v74-color-' + normalized);
    }
    if (normalized === 'normal' || normalized === 'highcontrast') {
      document.body.style.filter = '';
    }
    try { localStorage.setItem(COLOR_KEY, normalized); } catch(err) {}
    document.querySelectorAll('[data-color-mode]').forEach(btn => {
      const active = btn.dataset.colorMode === normalized;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function handleA11yClick(event){
    const fontBtn = event.target.closest && event.target.closest('#pb-a11y-toolbar-root [data-font-action]');
    const colorBtn = event.target.closest && event.target.closest('#pb-a11y-toolbar-root [data-color-mode]');
    if (!fontBtn && !colorBtn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
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

  function restoreA11y(){
    ensureColorFilters();
    try { setFont(localStorage.getItem(FONT_KEY) || 100); } catch(err) { setFont(100); }
    try { setColorMode(localStorage.getItem(COLOR_KEY) || 'normal'); } catch(err) { setColorMode('normal'); }
  }

  function tightenFloatingControls(){
    const root = document.getElementById('pb-a11y-toolbar-root');
    if (root) root.setAttribute('aria-label', 'Controles de accesibilidad visual');
    document.querySelectorAll('.fab-group .fab').forEach(btn => {
      btn.setAttribute('type', 'button');
    });
  }

  document.addEventListener('click', handleA11yClick, true);
  document.addEventListener('keydown', function(event){
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target.closest && event.target.closest('#pb-a11y-toolbar-root [data-font-action], #pb-a11y-toolbar-root [data-color-mode]');
    if (!target) return;
    handleA11yClick(event);
  }, true);

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
