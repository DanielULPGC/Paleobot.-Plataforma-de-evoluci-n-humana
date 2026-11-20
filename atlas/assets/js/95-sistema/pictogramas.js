/* =====================================================================================================
   95-sistema/pictogramas.js · rótulos de interfaz sin pictogramas (PB-GH-11, tanda T5, fila 34)
   -----------------------------------------------------------------------------------------------------
   Antes: rótulos, botones, pestañas, píldoras y etiquetas llevaban emoji decorativos («🌾 Paleoambiente»,
   «🌡 Cálido», «⬛ Contraste», «🔍 Buscar», «🔗 DOI: …», pestañas de la Guía «🚀 🗂️ 🔬 📚 ✅»…; recuento por
   vista en el informe T5). La línea de gusto del sistema los excluye y los lectores de pantalla los leen
   («cronómetro», «chincheta»), no aportan información.
   Ahora, al pintarse cualquier nodo, se retira SOLO el pictograma que abre un texto (o el que es todo el
   texto de un nodo, como los iconos sueltos); el texto se conserva íntegro. Nunca se toca un pictograma en
   mitad de un texto (podría ser contenido), ni los glifos tipográficos que el sistema admite (← → ↑ ↓ ↔ ↺
   ✓ ✔ ✗ ✕ ✖ ·), ni campos, código, citas (<q>, <blockquote>, <cite>) o scripts.
   Donde el pictograma era la única marca del tipo de dato (etiquetas de Biogeografía: ⏱ edad, 📍 lugar,
   ⚠ nota), se sustituye por la palabra («Edad: », «Lugar: », «Nota: »), para no perder información.
   Se hace en la misma microtarea en que otro módulo inserta el nodo (MutationObserver): no hay parpadeo ni
   desplazamiento de maquetación. Tope de 3 retiradas por nodo: si un módulo volviera a escribir el emoji,
   no se entra en un bucle. Sin escuchas en captura, red ni almacenamiento.
   Revertir: quitar el archivo (los textos vuelven a salir como los escriben las plantillas importadas).
   ===================================================================================================== */
(function () {
  'use strict';
  if (window.PBPictogramas) return;
  var EP = /\p{Extended_Pictographic}/u;
  // Glifos que el sistema admite porque se leen como texto (SISTEMA.md § 3).
  var ADMITIDOS = /^[←-⇿✓-✖✗✘·•◦]$/u;
  // Racimo de pictograma: base + selectores de variante, ZWJ, modificadores de tono y su espacio posterior.
  var LIDER = /^(\s*)((?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}])(?:️|⃣|‍(?:\p{Extended_Pictographic})|[\u{1F3FB}-\u{1F3FF}])*)[\s ]*/u;
  var TRAS_SEPARADOR = /(\u00B7[\s\u00A0]*)((?:\p{Extended_Pictographic})(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}])*)[\s\u00A0]*/gu;
  var SUSTITUTOS = [['.biogeo-tag-age', 'Edad: '], ['.biogeo-tag-loc', 'Lugar: '], ['.biogeo-tag-note', 'Nota: ']];
  var EXCLUIR = 'script, style, textarea, input, code, pre, q, blockquote, cite, [contenteditable]';
  var veces = new WeakMap();
  var retirados = 0;

  function limpiar(n) {
    var t = n.nodeValue;
    if (!t || !EP.test(t)) return;
    var p = n.parentElement;
    if (!p || p.closest(EXCLUIR)) return;
    var k = veces.get(n) || 0;
    if (k >= 3) return;
    var m = LIDER.exec(t), nuevo = t;
    if (m && !ADMITIDOS.test(m[2])) {
      var resto = t.slice(m[0].length);
      var pref = '';
      if (resto.trim()) for (var i = 0; i < SUSTITUTOS.length; i++) if (p.closest(SUSTITUTOS[i][0])) { pref = SUSTITUTOS[i][1]; break; }
      nuevo = m[1] + pref + resto;
      // Nodo formado solo por pictogramas (icono suelto): queda vacío.
      if (!resto.trim()) nuevo = '';
    }
    // Pictograma que abre un tramo tras el separador « · » («africa · ⏱ 1.4 Ma–2.3 Ma»): también decoración.
    nuevo = nuevo.replace(TRAS_SEPARADOR, function (todo, sep, racimo) { return ADMITIDOS.test(racimo) ? todo : sep; });
    if (nuevo !== t) { veces.set(n, k + 1); n.nodeValue = nuevo; retirados++; }
  }
  function recorrer(raiz) {
    if (!raiz) return;
    if (raiz.nodeType === 3) { limpiar(raiz); return; }
    if (raiz.nodeType !== 1 || (raiz.matches && raiz.matches('script, style'))) return;
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    for (var n = w.nextNode(); n; n = w.nextNode()) limpiar(n);
  }
  function iniciar() {
    recorrer(document.body);
    new MutationObserver(function (rs) {
      for (var i = 0; i < rs.length; i++) {
        var r = rs[i];
        if (r.type === 'characterData') limpiar(r.target);
        else for (var j = 0; j < r.addedNodes.length; j++) recorrer(r.addedNodes[j]);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  window.PBPictogramas = { recorrer: recorrer, retirados: function () { return retirados; } };
})();
