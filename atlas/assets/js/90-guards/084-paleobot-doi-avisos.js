/* PaleoBot · PB-GH-09 · Aviso junto a los DOI que fallan en la comprobación automática.
   No cambia ni retira ninguna referencia: añade una nota detrás del DOI citado.
   Tabla: docs/fiabilidad/DOI_CORRESPONDENCIAS.json (solo los DOI que el alumnado llega a ver). */
(function () {
  'use strict';
  var COMPROBADOS = {
    '10.1038/s41586-019-1396-2': '10.1038/s41586-019-1376-z',
    '10.1073/pnas.0901987106': '10.1073/pnas.0901280106',
    '10.1073/pnas.1316780111': '10.1073/pnas.1316780110',
    '10.1126/science.1158207': '10.1126/science.1154197'
  };
  var CITADOS = Object.keys(COMPROBADOS);
  var CLASE = 'pb-doi-aviso';
  var vistos = new WeakSet();

  function nota(citado) {
    var bueno = COMPROBADOS[citado];
    var span = document.createElement('span');
    span.className = CLASE;
    span.setAttribute('data-doi-citado', citado);
    span.style.fontStyle = 'italic';
    span.appendChild(document.createTextNode(' (Aviso: el DOI citado no existe. Registro comprobado en Crossref: '));
    var a = document.createElement('a');
    a.href = 'https://doi.org/' + bueno;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'DOI: ' + bueno;
    span.appendChild(a);
    span.appendChild(document.createTextNode('.)'));
    return span;
  }

  function yaAnotado(nodo, citado) {
    var sig = nodo.nextSibling;
    return !!(sig && sig.nodeType === 1 && sig.classList && sig.classList.contains(CLASE) &&
      sig.getAttribute('data-doi-citado') === citado);
  }

  function enlaces(raiz) {
    if (!raiz.querySelectorAll) return;
    var lista = raiz.querySelectorAll('a[href*="doi.org/"]');
    for (var i = 0; i < lista.length; i++) {
      var a = lista[i];
      if (vistos.has(a) || (a.closest && a.closest('.' + CLASE))) continue;
      vistos.add(a);
      var href;
      try { href = decodeURIComponent(a.getAttribute('href') || ''); } catch (err) { href = a.getAttribute('href') || ''; }
      var doi = href.split('doi.org/')[1] || '';
      if (COMPROBADOS[doi] && !yaAnotado(a, doi) && a.parentNode) {
        a.parentNode.insertBefore(nota(doi), a.nextSibling);
      }
    }
  }

  function textos(raiz) {
    if (!raiz || (raiz.nodeType !== 1 && raiz.nodeType !== 9)) return;
    var walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null);
    var pendientes = [];
    var n;
    while ((n = walker.nextNode())) {
      if (vistos.has(n)) continue;
      var padre = n.parentNode;
      if (!padre || /^(SCRIPT|STYLE|TEXTAREA|A)$/.test(padre.nodeName)) continue;
      if (padre.closest && padre.closest('.' + CLASE)) continue;
      var valor = n.nodeValue;
      if (valor.indexOf('10.') === -1) continue;
      for (var i = 0; i < CITADOS.length; i++) {
        var pos = valor.indexOf(CITADOS[i]);
        if (pos !== -1) { pendientes.push([n, CITADOS[i], pos]); break; }
      }
    }
    pendientes.forEach(function (p) {
      var nodo = p[0], citado = p[1];
      var resto = nodo.splitText(p[2] + citado.length);
      vistos.add(nodo);
      nodo.parentNode.insertBefore(nota(citado), resto);
    });
  }

  function revisar(raiz) {
    try { enlaces(raiz); textos(raiz); } catch (err) { /* la nota es un añadido: si falla, el atlas sigue igual */ }
  }

  var cola = [];
  var turno = null;
  function programar(nodo) {
    cola.push(nodo);
    if (turno) return;
    turno = setTimeout(function () {
      turno = null;
      var lote = cola; cola = [];
      lote.forEach(function (x) { if (x.isConnected) revisar(x); });
    }, 300);
  }

  function iniciar() {
    revisar(document.body);
    if (!('MutationObserver' in window)) return;
    new MutationObserver(function (cambios) {
      for (var i = 0; i < cambios.length; i++) {
        var nuevos = cambios[i].addedNodes;
        for (var j = 0; j < nuevos.length; j++) {
          var x = nuevos[j];
          if (x.nodeType === 1 && !(x.classList && x.classList.contains(CLASE))) programar(x);
          else if (x.nodeType === 3 && x.parentNode && !vistos.has(x)) programar(x.parentNode);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
