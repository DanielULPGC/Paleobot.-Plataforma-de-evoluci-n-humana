/* =====================================================================================================
   95-sistema/dialogo-unico.js · «diálogo único» (PB-GH-11, tanda T3, L2; estrategia 06 § 3-A)
   -----------------------------------------------------------------------------------------------------
   Cabecera fija común para los diálogos .modal-overlay > .modal-content (Bibliografía, Glosario, Comparador,
   Autoevaluación, Matriz, Estadísticas, «¿Qué no sabemos aún?», Guía del alumnado, Síntesis de sesión).
   REUBICA, no recrea: crea un contenedor vacío .pb-dlg-cabecera al principio de .modal-content y mueve a él
   el título visible (el h2 al que apunta aria-labelledby, con su id, su texto y sus atributos) y el botón
   «✕» existente (.close-modal, con su data-modal-toggle y su nombre). El resto del contenido no se toca y se
   desplaza bajo la cabecera (dialogo-unico.css). Idempotente: se aplica al iniciar y de nuevo cada vez que un
   diálogo se abre (por si un módulo repintó su contenido). No escucha en captura; solo observa la clase de
   los .modal-overlay y escribe nodos dentro de .modal-content (no lo observa), así que no hay bucles.
   Quedan fuera, con su propia maquetación: la ficha (T4), la presentación, el socrático, PaleoLab, la imagen
   ampliada, el mapa v50 y la búsqueda global (paleta sin título visible); el gestor de diálogos sí los cubre.
   Revertir: quitar este archivo y dialogo-unico.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBDialogoUnico) return;

  function titulo(overlay, mc) {
    var ref = overlay.getAttribute('aria-labelledby');
    var t = ref ? document.getElementById(ref.split(/\s+/)[0]) : null;
    if (t && mc.contains(t) && /^H[1-3]$/.test(t.tagName)) return t;
    return mc.querySelector('h2') || mc.querySelector('h3');
  }
  function estructurar(overlay) {
    var mc = overlay.querySelector(':scope > .modal-content');
    if (!mc) return false;
    var t = titulo(overlay, mc);
    var x = mc.querySelector('.close-modal');
    if (!t || !x) return false;
    var cab = mc.querySelector(':scope > .pb-dlg-cabecera');
    if (!cab) {
      cab = document.createElement('div');
      cab.className = 'pb-dlg-cabecera';
      mc.insertBefore(cab, mc.firstChild);
    }
    if (t.parentElement !== cab) cab.insertBefore(t, cab.firstChild);
    if (x.parentElement !== cab) cab.appendChild(x);
    // classList.add reescribe el atributo aunque la clase ya esté y este archivo observa la clase del
    // overlay: solo se añade si falta (sin esta guarda, bucle de microtareas).
    if (!mc.classList.contains('pb-dlg-lamina')) mc.classList.add('pb-dlg-lamina');
    if (!overlay.classList.contains('pb-dlg')) overlay.classList.add('pb-dlg');
    return true;
  }
  function todos() {
    var l = document.querySelectorAll('.modal-overlay');
    for (var i = 0; i < l.length; i++) {
      if (l[i].id === 'globalSearchModal') continue;
      estructurar(l[i]);
    }
  }
  var obs = new MutationObserver(function (rs) {
    rs.forEach(function (r) {
      var o = r.target;
      if (o.classList.contains('active') && o.id !== 'globalSearchModal') estructurar(o);
    });
  });
  function iniciar() {
    todos();
    var l = document.querySelectorAll('.modal-overlay');
    for (var i = 0; i < l.length; i++) obs.observe(l[i], { attributes: true, attributeFilter: ['class'] });
    setTimeout(todos, 1500);   // contenido que algunos módulos completan tras cargar
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBDialogoUnico = { estructurar: estructurar };
})();
