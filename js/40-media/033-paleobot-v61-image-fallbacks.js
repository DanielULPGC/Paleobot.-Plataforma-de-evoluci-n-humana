// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v61-image-fallbacks
(function(){
  'use strict';
  function esc(value){
    return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function labelFor(img){
    const fromAlt = img.getAttribute('alt') || '';
    const card = img.closest('[data-open-species], .species-card, .pb-v50-cover, .main-cover, .module-card, .timeline-card');
    const fromCard = card?.querySelector('h2,h3,h4,.species-name,.card-title')?.textContent || '';
    return (fromAlt || fromCard || 'Imagen no disponible').trim();
  }
  function makeSvg(label, wide){
    const lower = String(label || '').toLowerCase();
    if (lower.includes('neander')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_sapiens_neanderthalensis-Mr._N.jpg?width=960';
    if (lower.includes('denis')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Denisova_Cave.jpg?width=960';
    if (lower.includes('austral') || lower.includes('afarensis')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/%22Lucy%22_Australopithecus.jpg?width=960';
    if (lower.includes('habilis')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_habilis-KNM_ER_1813.jpg?width=960';
    if (lower.includes('erect') || lower.includes('ergaster')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_erectus.JPG?width=960';
    if (lower.includes('sapiens')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_sapiens_skull_-_Skhul_5.jpg?width=960';
    return wide
      ? 'https://commons.wikimedia.org/wiki/Special:FilePath/Olduvai_Gorge_or_Oldupai_Gorge.jpg?width=1280'
      : 'https://commons.wikimedia.org/wiki/Special:FilePath/Australopithecus_africanus_%28Sts_5_cast%29_at_G%C3%B6teborgs_Naturhistoriska_Museum_8945.jpg?width=960';
  }
  function applyFallback(img, reason){
    if (!img || img.dataset.pbV61FallbackApplied === '1') return;
    const rect = img.getBoundingClientRect();
    const label = labelFor(img);
    const fallback = makeSvg(label, rect.width > 520 || img.closest('.pb-v50-cover,.main-cover'));
    img.dataset.pbV61OriginalSrc = img.currentSrc || img.src || '';
    img.dataset.pbV61FallbackApplied = '1';
    img.dataset.pbV61FallbackReason = reason || 'load-failed';
    img.loading = 'lazy';
    img.decoding = 'async';
    window.PaleoBotStyleState.token(img, 'pb-r69-media-fallback-bg', true);
    img.src = fallback;
  }
  function bind(img){
    if (!img || img.dataset.pbV61Bound === '1') return;
    img.dataset.pbV61Bound = '1';
    img.addEventListener('error', () => applyFallback(img, 'error'), { once:true });
    // Una imagen diferida puede seguir descargándose; el tiempo no demuestra error.
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      window.setTimeout(() => applyFallback(img, 'error-before-bind'), 0);
    }
  }
  function scan(){
    document.querySelectorAll('img').forEach(bind);
    document.documentElement.dataset.paleobotV61ImageFallbacks = 'ready';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once:true });
  else scan();
  window.setTimeout(scan, 900);
  window.setTimeout(scan, 2200);
  window.setTimeout(scan, 4800);
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches?.('img') || node.querySelector?.('img'))))) {
      window.setTimeout(scan, 80);
    }
  }).observe(document.documentElement, { childList:true, subtree:true });
  ['paleobot:v55-viewchange','paleobot:v59-render','paleobot:viewchange'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(scan, 80));
  });
  window.PaleoBotV61ImageFallbacks = { scan };
})();
