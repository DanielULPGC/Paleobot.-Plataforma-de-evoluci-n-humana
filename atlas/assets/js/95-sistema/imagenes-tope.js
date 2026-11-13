/* PB-GH-11 · Tope duro de reintentos de imagen (04, fila 1).
   El bucle infinito se corrigió en origen (40-media/025: respaldo local y un solo respaldo por imagen). Quedaba
   una oscilación acotada: 066 y 075 vuelven a asignar, en sus temporizadores de reparación, la URL remota que
   acaba de fallar a una imagen que su propio onerror ya había pasado a un SVG local, o la reasignan mientras la
   primera petición sigue en curso. Este módulo, cargado el último, hace que una imagen no vuelva a pedir una URL
   remota que ya pidió y que no cargó bien, mientras muestre su respaldo (data:) o esa misma URL: la asignación se
   ignora y se anota en data-pb-reintentos-evitados. Si la imagen muestra otra obra cargada (p. ej. un <img>
   reutilizado al cambiar de diapositiva), la asignación se permite, para no dejar una imagen con el crédito de
   otra. No cambia ninguna imagen que cargue bien ni la primera petición de ninguna URL. Solo la propiedad src. */
(function () {
  'use strict';
  var proto = window.HTMLImageElement && HTMLImageElement.prototype;
  var desc = proto && Object.getOwnPropertyDescriptor(proto, 'src');
  if (!desc || !desc.set || proto.__pbGh11Tope) return;
  var pedidas = new WeakMap();   // imagen → URL remotas ya asignadas
  var cargadas = new WeakMap();  // imagen → URL que cargaron bien

  function absoluta(v) {
    try { return new URL(String(v), document.baseURI).href; } catch (e) { return String(v); }
  }
  function conjunto(mapa, img) {
    var s = mapa.get(img); if (!s) { s = new Set(); mapa.set(img, s); } return s;
  }
  function remota(u) { return /^https?:/i.test(u) && u.indexOf(location.origin + '/') !== 0; }

  // Captura en window: las cargas correctas no burbujean; se registran aquí.
  window.addEventListener('load', function (ev) {
    var img = ev.target;
    if (img instanceof HTMLImageElement && img.naturalWidth > 0) conjunto(cargadas, img).add(absoluta(desc.get.call(img)));
  }, true);

  Object.defineProperty(proto, 'src', {
    configurable: true,
    enumerable: desc.enumerable,
    get: desc.get,
    set: function (v) {
      var nueva = absoluta(v);
      if (remota(nueva)) {
        var ya = conjunto(pedidas, this);
        var ok = cargadas.get(this);
        var actual = absoluta(desc.get.call(this) || '');
        var muestraRespaldoOEsa = /^data:/i.test(actual) || actual === nueva;
        if (ya.has(nueva) && !(ok && ok.has(nueva)) && muestraRespaldoOEsa) {
          this.dataset.pbReintentosEvitados = String((+this.dataset.pbReintentosEvitados || 0) + 1);
          return;
        }
        ya.add(nueva);
      }
      desc.set.call(this, v);
    }
  });
  proto.__pbGh11Tope = true;
  document.documentElement.dataset.pbImagenesTope = 'listo';
})();
