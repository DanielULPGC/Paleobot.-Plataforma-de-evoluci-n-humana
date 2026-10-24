// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v63-error-capture
document.documentElement.dataset.pbErrorCapture = 'ready';
window.__PB_BOOT_ERRORS = [];
window.addEventListener('error', function(event){
  window.__PB_BOOT_ERRORS.push({
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno
  });
  document.documentElement.dataset.pbBootErrors = JSON.stringify(window.__PB_BOOT_ERRORS);
});
