/* =====================================================================================================
   95-sistema/cronologia.js · Cronología: la primera tarjeta en el primer pantallazo (PB-GH-11, T4, L2)
   -----------------------------------------------------------------------------------------------------
   La leyenda metodológica de Cronología (aside.evidence-legend-panel: «Lee cada taxón con cautela
   metodológica», las cinco etiquetas de evidencia y su nota) empujaba la lista de taxones fuera de la
   primera pantalla en teléfono. Se conserva íntegra y se MUEVE dentro de un desplegable nuevo
   <details class="pb-leyenda-etiquetas"> «Qué significan las etiquetas», colocado donde estaba. Dentro se
   añade una línea de interfaz que hace visible lo que antes solo decía el title de la barra temporal de cada
   tarjeta («Sólido = evidencia directa; punteado = extensión inferida»). La «Tarea de aula» ya era un
   desplegable cerrado y no cambia. El aspecto de las tarjetas (un único código de incertidumbre) lo da
   cronologia.css. Una sola vez al iniciar (la vista es estática; 002 solo repinta #timelineList).
   Revertir: quitar este archivo y cronologia.css de atlas/index.html.
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBCronologia) return;
  function iniciar() {
    var vista = document.getElementById('view-timeline');
    var aside = vista && vista.querySelector(':scope > .evidence-legend-panel');
    if (!aside || aside.closest('details.pb-leyenda-etiquetas')) return;
    var d = document.createElement('details');
    d.className = 'pb-leyenda-etiquetas';
    var s = document.createElement('summary');
    s.textContent = 'Qué significan las etiquetas';
    d.appendChild(s);
    aside.parentNode.insertBefore(d, aside);
    d.appendChild(aside);
    var barra = document.createElement('p');
    barra.className = 'pb-leyenda-barra';
    var muestra1 = document.createElement('span'); muestra1.className = 'pb-leyenda-muestra pb-directa'; muestra1.setAttribute('aria-hidden', 'true');
    var muestra2 = document.createElement('span'); muestra2.className = 'pb-leyenda-muestra pb-inferida'; muestra2.setAttribute('aria-hidden', 'true');
    barra.appendChild(document.createTextNode('Barra temporal de cada tarjeta: '));
    barra.appendChild(muestra1);
    barra.appendChild(document.createTextNode(' tramo continuo, evidencia directa; '));
    barra.appendChild(muestra2);
    barra.appendChild(document.createTextNode(' tramo discontinuo, extensión inferida. Las etiquetas en ámbar señalan incertidumbre (taxón debatido, evidencia en debate o en revisión).'));
    aside.appendChild(barra);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
  window.PBCronologia = { iniciar: iniciar };
})();
