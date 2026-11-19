/* =====================================================================================================
   95-sistema/consulta-manual.js · Bibliografía y Glosario como páginas de consulta de manual
   (PB-GH-11, tanda T5, L2; estrategia 06 § 3-H)
   -----------------------------------------------------------------------------------------------------
   No recrea ni reescribe nada de 002/007/008/012/034: AÑADE un índice y deja el contenido como está.
     · Bibliografía (#biblioModal): «Índice» con un botón por grupo (temas y actualización; especies), con
       su número de referencias. Al pulsarlo se abre el grupo si estaba plegado (el mismo clic en su
       cabecera [data-bib-toggle] que haría la persona), se lleva a la vista dentro del diálogo y el foco
       pasa a su título (tabindex=-1). Los botones de grupos que el filtro o la búsqueda vacían (012 les pone
       hidden) se ocultan también en el índice. Los títulos de grupo NO se tocan (012 los compara).
     · Glosario (#glossaryModal): índice alfabético (solo las letras con términos). Al pulsar una letra se
       usa la API pública de 034 (PaleoBotGlossaryPagination.reveal) para mostrar el primer término de esa
       letra (quita búsqueda y categoría, como ya hacía esa API), se lleva a la vista y recibe el foco. Las
       definiciones NO se tocan (034 clasifica las tarjetas por su texto).
   El índice se monta al abrir cada diálogo (los módulos importados repintan su contenido) y se descarta si
   ya existe. Escuchas en burbuja dentro de los diálogos; sin escuchas en captura, red ni almacenamiento.
   Revertir: quitar este archivo y consulta-manual.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBConsultaManual) return;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function limpio(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  // Varias referencias y tarjetas usan content-visibility:auto (041): su alto real solo se conoce al pintarse,
  // así que la posición se corrige un par de veces hasta que se asienta.
  function llevar(destino, foco) {
    if (!destino) return;
    if (foco) { if (!foco.hasAttribute('tabindex')) foco.setAttribute('tabindex', '-1'); try { foco.focus({ preventScroll: true }); } catch (e) {} }
    var n = 0;
    (function otra() {
      destino.scrollIntoView({ block: 'start', behavior: 'auto' });
      if (++n < 4) setTimeout(otra, 120);
    })();
  }

  /* ---------- Bibliografía ---------- */
  function indiceBiblio() {
    var modal = document.getElementById('biblioModal');
    var cont = document.getElementById('biblioContent');
    if (!modal || !cont || !modal.classList.contains('active')) return;
    var grupos = [].slice.call(cont.querySelectorAll('.bib-species-group'));
    if (!grupos.length) return;
    var nav = modal.querySelector('.pb-bib-indice');
    if (nav && nav.getAttribute('data-grupos') === String(grupos.length)) { sincronizarBiblio(); return; }
    if (nav) nav.remove();
    nav = el('nav', 'pb-bib-indice');
    nav.setAttribute('aria-label', 'Índice de la bibliografía');
    nav.setAttribute('data-grupos', String(grupos.length));
    var det = el('details', 'pb-bib-indice-plegable');
    var sum = el('summary', 'pb-bib-indice-titulo', 'Índice: ' + grupos.length + ' grupos de referencias');
    det.appendChild(sum);
    var bloques = [['Temas y actualización', grupos.filter(function (g) { return g.classList.contains('bib-theme-group'); })],
                   ['Por especie', grupos.filter(function (g) { return !g.classList.contains('bib-theme-group'); })]];
    bloques.forEach(function (b, bi) {
      if (!b[1].length) return;
      var sec = el('div', 'pb-bib-indice-bloque');
      var idt = 'pbBibIndice' + bi;
      var h = el('p', 'pb-bib-indice-bloque-titulo', b[0]); h.id = idt;
      var ul = el('ul', 'pb-bib-indice-lista'); ul.setAttribute('aria-labelledby', idt);
      b[1].forEach(function (g, i) {
        if (!g.id) g.id = 'pbBibGrupo' + bi + '-' + i;
        var h3 = g.querySelector('.bib-species-header h3');
        var n = g.querySelector('.bib-species-count');
        var li = el('li');
        var btn = el('button', 'pb-bib-indice-boton'); btn.type = 'button';
        btn.setAttribute('data-pb-bib-grupo', g.id);
        var nom = el('span', 'pb-bib-indice-nombre', limpio(h3 && h3.textContent));
        if (!g.classList.contains('bib-theme-group')) nom.classList.add('pb-bib-indice-taxon');
        btn.appendChild(nom);
        btn.appendChild(el('span', 'pb-bib-indice-n', limpio(n && n.textContent)));
        li.appendChild(btn); ul.appendChild(li);
      });
      sec.appendChild(h); sec.appendChild(ul); det.appendChild(sec);
    });
    nav.appendChild(det);
    // Plegado por defecto: las referencias siguen siendo lo primero que se ve; el índice, a un toque.
    cont.parentNode.insertBefore(nav, cont);
    nav.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-pb-bib-grupo]');
      if (!b) return;
      var g = document.getElementById(b.getAttribute('data-pb-bib-grupo'));
      if (!g) return;
      var cab = g.querySelector('[data-bib-toggle]'), cuerpo = g.querySelector('.bib-species-body');
      if (cab && cuerpo && cuerpo.style.display === 'none') cab.click();
      llevar(g, g.querySelector('.bib-species-header h3'));
    });
    sincronizarBiblio();
  }
  function sincronizarBiblio() {
    var modal = document.getElementById('biblioModal');
    if (!modal) return;
    modal.querySelectorAll('[data-pb-bib-grupo]').forEach(function (b) {
      var g = document.getElementById(b.getAttribute('data-pb-bib-grupo'));
      var oculto = !g || g.hidden;
      if (b.parentElement.hidden !== oculto) b.parentElement.hidden = oculto;
      var n = g && g.querySelector('.bib-species-count'), s = b.querySelector('.pb-bib-indice-n');
      if (n && s && s.textContent !== limpio(n.textContent)) s.textContent = limpio(n.textContent);
    });
  }

  /* ---------- Glosario ---------- */
  function inicial(t) { return limpio(t).charAt(0).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); }
  function indiceGlosario() {
    var modal = document.getElementById('glossaryModal');
    var cont = document.getElementById('glossaryContent');
    if (!modal || !cont || !modal.classList.contains('active')) return;
    var tarjetas = [].slice.call(cont.querySelectorAll('.glossary-card'));
    if (!tarjetas.length) return;
    var primera = Object.create(null), orden = [];
    tarjetas.forEach(function (c) {
      var h = c.querySelector('h3'); var L = inicial(h && h.textContent);
      if (!/^[A-ZÑ]$/.test(L)) L = '#';
      if (!primera[L]) { primera[L] = c; orden.push(L); }
    });
    var nav = cont.querySelector('.pb-glos-indice');
    if (nav && nav.getAttribute('data-letras') === orden.join('')) return;
    if (nav) nav.remove();
    nav = el('nav', 'pb-glos-indice');
    nav.setAttribute('aria-label', 'Índice alfabético del glosario');
    nav.setAttribute('data-letras', orden.join(''));
    nav.appendChild(el('span', 'pb-glos-indice-titulo', 'Índice'));
    var ul = el('ul', 'pb-glos-indice-lista');
    orden.forEach(function (L) {
      var li = el('li'); var b = el('button', 'pb-glos-letra', L); b.type = 'button';
      b.setAttribute('data-pb-glos-letra', L);
      b.setAttribute('aria-label', L === '#' ? 'Términos que no empiezan por letra' : 'Términos que empiezan por ' + L);
      li.appendChild(b); ul.appendChild(li);
    });
    nav.appendChild(ul);
    var top = cont.querySelector('.glossary-top');
    if (top && top.nextSibling) cont.insertBefore(nav, top.nextSibling); else cont.insertBefore(nav, cont.firstChild);
    nav.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-pb-glos-letra]');
      if (!b) return;
      var actual = [].slice.call(cont.querySelectorAll('.glossary-card'));
      var L = b.getAttribute('data-pb-glos-letra');
      var c = actual.filter(function (x) { var h = x.querySelector('h3'); var i = inicial(h && h.textContent); return L === '#' ? !/^[A-ZÑ]$/.test(i) : i === L; })[0];
      if (!c) return;
      var api = window.PaleoBotGlossaryPagination;
      if (api && api.reveal) api.reveal(c);
      setTimeout(function () { llevar(c, c.querySelector('h3')); }, 60);
    });
  }

  /* ---------- Montaje: al abrir cada diálogo y cuando su contenido se repinta ---------- */
  var pendiente = null;
  function revisar() { pendiente = null; indiceBiblio(); indiceGlosario(); }
  function pronto() { if (!pendiente) pendiente = setTimeout(revisar, 150); }
  function iniciar() {
    ['biblioModal', 'glossaryModal'].forEach(function (id) {
      var m = document.getElementById(id);
      if (!m) return;
      new MutationObserver(pronto).observe(m, { attributes: true, attributeFilter: ['class'] });
      var c = document.getElementById(id === 'biblioModal' ? 'biblioContent' : 'glossaryContent');
      if (c) new MutationObserver(function (rs) { for (var i = 0; i < rs.length; i++) if (rs[i].addedNodes.length && !(rs[i].target.closest && rs[i].target.closest('.pb-glos-indice'))) { pronto(); return; } }).observe(c, { childList: true });
      // Filtros y búsqueda de la bibliografía: 012 oculta grupos; el índice los sigue.
      m.addEventListener('input', function () { setTimeout(sincronizarBiblio, 120); });
      m.addEventListener('click', function () { setTimeout(sincronizarBiblio, 120); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  window.PBConsultaManual = { revisar: revisar };
})();
