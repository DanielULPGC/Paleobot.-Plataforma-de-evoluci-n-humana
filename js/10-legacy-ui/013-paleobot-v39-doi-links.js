// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v39-doi-links
(function(){
  function normalizeDoiUrl(href){
    const value = String(href || '').trim();
    if (!value) return '';
    if (/^https:\/\/doi\.org\//i.test(value)) return value;
    if (/^http:\/\/doi\.org\//i.test(value)) return value.replace(/^http:/i, 'https:');
    if (/^10\.\d{4,9}\//i.test(value)) return 'https://doi.org/' + encodeURIComponent(value).replace(/%2F/gi, '/');
    return value;
  }
  function openDoi(url){
    const target = normalizeDoiUrl(url);
    if (!target || !/^https:\/\/doi\.org\//i.test(target)) return false;
    const opened = window.open(target, '_blank', 'noopener,noreferrer');
    if (opened) {
      try { opened.opener = null; } catch(err) { /* recuperable: err suprimido intencionalmente */ }
      return true;
    }

    const explainBlocked = copied => {
      alert(
        copied
          ? 'Moodle o el navegador han bloqueado la nueva pestaña. El enlace DOI se ha copiado al portapapeles.'
          : 'Moodle o el navegador han bloqueado la nueva pestaña. El enlace DOI es:\n' + target
      );
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(target)
        .then(() => explainBlocked(true))
        .catch(() => explainBlocked(false));
    } else {
      explainBlocked(false);
    }
    return false;
  }
  function installDoiLinks(){
    if (document.body.dataset.v39DoiLinks === 'native-link-normalizer') return false;
    document.body.dataset.v39DoiLinks = 'native-link-normalizer';
    document.documentElement.dataset.paleobotV39Mode = 'native-link-normalizer';
    normalizeRenderedDoiLinks();
    return true;
  }
  function normalizeRenderedDoiLinks(){
    document.querySelectorAll('a[href*="doi.org"], .bib-doi-link[href]').forEach(link => {
      const href = normalizeDoiUrl(link.getAttribute('href'));
      if (href) link.setAttribute('href', href);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.dataset.doiOpen = 'external';
    });
  }
  document.addEventListener('paleobot:bibliography-rendered', normalizeRenderedDoiLinks);
  installDoiLinks();
  normalizeRenderedDoiLinks();
  const oldApply = window.PaleoBotV38Bibliography?.applyBibliographyFilters;
  if (typeof oldApply === 'function' && !oldApply.__v39DoiWrapped) {
    window.PaleoBotV38Bibliography.applyBibliographyFilters = function(){
      const result = oldApply.apply(this, arguments);
      normalizeRenderedDoiLinks();
      return result;
    };
    window.PaleoBotV38Bibliography.applyBibliographyFilters.__v39DoiWrapped = true;
  }
  window.PaleoBotV39DoiLinks = {
    openDoi,
    normalizeDoiUrl,
    normalizeRenderedDoiLinks,
    installDoiLinks,
    mode:'native-link-normalizer'
  };
})();
