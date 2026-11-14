/* PB-GH-11 · Sustituye los dos onerror="…" en línea de las imágenes de portada de atlas/index.html (fila 30):
   misma conducta (un solo cambio de src a la URL de respaldo que llevaba el atributo, ahora en data-pb-respaldo),
   sin manejadores en línea. Se carga síncrono justo después de las dos imágenes y escucha en la propia imagen
   (fase de destino, como el atributo), de modo que los escuchadores en captura de 025/066 siguen corriendo antes.
   Si la imagen ya había fallado antes de que este archivo se ejecute, aplica el respaldo al momento. */
(function () {
  'use strict';
  function respaldo(img) {
    if (img.dataset.pbRespaldoPortada === '1') return; // equivale a this.onerror = null
    img.dataset.pbRespaldoPortada = '1';
    img.src = img.getAttribute('data-pb-respaldo');
  }
  var imgs = document.querySelectorAll('img[data-pb-respaldo]');
  for (var i = 0; i < imgs.length; i++) {
    (function (img) {
      img.addEventListener('error', function () { respaldo(img); }, { once: true });
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) respaldo(img);
    })(imgs[i]);
  }
})();
