(function () {
  'use strict';
  var cards = Array.from(document.querySelectorAll('.species'));
  var input = document.getElementById('search');
  var status = document.getElementById('search-status');
  if (input && status) {
    input.addEventListener('input', function () {
      var query = input.value.toLocaleLowerCase('es').trim();
      var visible = 0;
      cards.forEach(function (card) {
        var matches = !query || card.dataset.search.includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      status.textContent = visible + (visible === 1 ? ' ficha visible.' : ' fichas visibles.');
    });
  }
  function openLinkedSpecies() {
    var id;
    try { id = decodeURIComponent(location.hash.slice(1)); }
    catch (_) { return; }
    if (!id.startsWith('sp-')) return;
    var card = document.getElementById(id);
    if (!card || !card.matches('details.species')) return;
    if (card.hidden) {
      if (input) input.value = '';
      cards.forEach(function (item) { item.hidden = false; });
      if (status) status.textContent = cards.length + ' fichas disponibles.';
    }
    card.open = true;
    card.scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange', openLinkedSpecies);
  document.querySelectorAll('a[href^="#sp-"]').forEach(function (link) {
    link.addEventListener('click', function () { setTimeout(openLinkedSpecies, 0); });
  });
  if (location.hash) openLinkedSpecies();

  var imageStatus = document.getElementById('image-status');
  var imageSecurity = document.getElementById('image-security');
  var images = Array.from(document.querySelectorAll('.species img[data-src]'));
  var policyBlocks = 0;
  function updateStatus() {
    if (!imageStatus) return;
    var ok = images.filter(function (img) { return img.dataset.pbState === 'ok'; }).length;
    var failed = images.filter(function (img) { return img.dataset.pbState === 'failed'; }).length;
    var loading = images.filter(function (img) { return img.dataset.pbState === 'loading'; }).length;
    imageStatus.textContent = ok + ' cargadas · ' + failed + ' fallidas · ' + loading +
      ' en curso · ' + (images.length - ok - failed - loading) + ' aún sin probar (de ' + images.length + ').';
  }
  document.addEventListener('securitypolicyviolation', function (event) {
    var directive = event.effectiveDirective || event.violatedDirective || '';
    if (!/^img-src(?:-elem)?(?:$|\s)/.test(directive) &&
        !(/^default-src(?:$|\s)/.test(directive) && /wikimedia\.org/.test(event.blockedURI || ''))) return;
    policyBlocks += 1;
    if (imageSecurity) imageSecurity.textContent = 'El navegador notificó ' + policyBlocks +
      (policyBlocks === 1 ? ' bloqueo de imagen ' : ' bloqueos de imágenes ') +
      'por una política de seguridad. Los enlaces a las fuentes permanecen disponibles.';
  });
  function loadImage(img) {
    if (!img || img.dataset.pbState) return;
    var url = img.getAttribute('data-src');
    if (!url) return;
    img.dataset.pbState = 'loading';
    updateStatus();
    img.addEventListener('load', function () {
      img.hidden = false;
      img.dataset.pbState = 'ok';
      updateStatus();
    }, {once:true});
    img.addEventListener('error', function () {
      img.hidden = true;
      img.dataset.pbState = 'failed';
      var caption = img.closest('figure')?.querySelector('figcaption');
      if (caption && !caption.querySelector('.image-error')) {
        var warning = document.createElement('span');
        warning.className = 'image-error';
        warning.textContent = ' No se ha podido cargar la imagen; utilice el enlace a su fuente.';
        caption.appendChild(warning);
      }
      updateStatus();
    }, {once:true});
    img.loading = 'eager';
    img.src = url;
    img.removeAttribute('data-src');
  }
  cards.forEach(function (card) {
    card.addEventListener('toggle', function () {
      if (card.open) loadImage(card.querySelector('img[data-src]'));
    });
  });
  var probe = document.getElementById('probe-images');
  if (probe) probe.addEventListener('click', function () {
    ['sp-proconsul', 'sp-bahrelghazali', 'sp-juluensis'].forEach(function (id) {
      var card = document.getElementById(id);
      if (card) loadImage(card.querySelector('img[data-src]'));
    });
    updateStatus();
  });
})();
