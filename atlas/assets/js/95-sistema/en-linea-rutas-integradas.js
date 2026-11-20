/* PB-GH-11 · Script que estaba en línea en atlas/index.html (línea 353 en c971001, dentro de la portada, tras las rutas integradas).
   Movido sin cambios a un archivo propio para retirar 'unsafe-inline' de script-src (fila 30).
   Se carga síncrono (sin defer) en la misma posición: conserva el orden de ejecución. */
      window.addEventListener('click', function(event){
        var route = event.target && event.target.closest &&
          event.target.closest('[data-pb-integrated-route]');
        if (!route) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign(route.getAttribute('data-pb-integrated-route'));
      }, true);
    
