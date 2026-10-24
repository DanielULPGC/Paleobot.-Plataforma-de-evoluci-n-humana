// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v80-map-lens-image-repair
(function(){
  'use strict';

  const LENS_META = {
    east_africa: {
      title:'África oriental',
      subtitle:'Rift, Turkana, Awash y Olduvai',
      accent:'#0e7f65',
      land:'#d8c9a3',
      high:'#a8a77b',
      water:'#b7c8cc',
      paths:[
        'M226 28 C184 60 168 100 154 144 C136 198 112 242 92 304 C72 370 98 434 146 474 C188 510 244 492 268 440 C292 388 284 326 318 272 C354 214 394 160 366 96 C344 44 286 8 226 28 Z',
        'M238 56 C218 130 202 214 190 318 C186 372 192 424 206 474'
      ],
      labels:[['Turkana',190,145],['Awash',224,258],['Olduvai',205,374]]
    },
    south_africa: {
      title:'África austral',
      subtitle:'Karst sudafricano y sur continental',
      accent:'#b26900',
      land:'#d6c1a2',
      high:'#8f8f75',
      water:'#b8cad0',
      paths:[
        'M190 58 C266 28 358 58 414 118 C466 174 482 266 448 340 C418 410 346 464 270 466 C190 468 118 430 84 360 C48 286 62 198 108 138 C128 112 154 76 190 58 Z',
        'M126 330 C192 304 246 306 306 332 C348 350 394 342 438 314'
      ],
      labels:[['Sterkfontein',222,262],['Taung',284,346],['Malapa',238,304]]
    },
    mediterranean: {
      title:'Mediterráneo y Europa',
      subtitle:'Magreb, Europa occidental, Italia y Caucaso',
      accent:'#2258a8',
      land:'#d9caa4',
      high:'#989d78',
      water:'#b9cad3',
      paths:[
        'M62 180 C126 118 214 104 286 124 C358 146 408 116 478 92 L514 148 C462 194 418 224 352 230 C286 236 242 260 188 292 C136 322 84 300 48 248 C32 224 34 204 62 180 Z',
        'M126 298 C208 258 288 246 368 260 C424 270 462 250 504 222'
      ],
      labels:[['Atapuerca',230,222],['Dmanisi',452,164],['Jebel Irhoud',116,304]]
    },
    asia_pacific: {
      title:'Asia y Pacífico',
      subtitle:'Siberia, China y Sudeste Asiático insular',
      accent:'#5b6fb0',
      land:'#d6c6a2',
      high:'#8d986e',
      water:'#b6cbd2',
      paths:[
        'M78 96 C170 40 298 38 398 86 C484 128 530 214 516 296 C504 366 442 410 360 404 C290 398 248 422 190 456 C132 490 70 454 54 390 C38 326 72 276 92 222 C112 170 38 134 78 96 Z',
        'M398 402 C426 424 456 438 490 444 M430 318 C456 344 474 370 482 402'
      ],
      labels:[['Zhoukoudian',356,228],['Denisova',278,126],['Liang Bua',456,420]]
    }
  };

  function svgUrl(meta){
    const html = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360" role="img" aria-label="Mapa físico simplificado de '+meta.title+'">'+
      '<defs>'+
        '<linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+meta.water+'"/><stop offset="1" stop-color="#eef4f2"/></linearGradient>'+
        '<filter id="relief"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="4" seed="12"/><feColorMatrix type="saturate" values=".12"/><feBlend mode="multiply" in2="SourceGraphic"/></filter>'+
        '<pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0V56" fill="none" stroke="#31485c" stroke-opacity=".13" stroke-width="1"/></pattern>'+
      '</defs>'+
      '<rect width="560" height="360" fill="url(#sea)"/>'+
      '<rect width="560" height="360" fill="url(#grid)"/>'+
      '<path d="'+meta.paths[0]+'" fill="'+meta.land+'" stroke="#6d725f" stroke-width="3" filter="url(#relief)"/>'+
      '<path d="'+meta.paths[1]+'" fill="none" stroke="'+meta.high+'" stroke-width="9" stroke-linecap="round" stroke-opacity=".58"/>'+
      '<path d="'+meta.paths[1]+'" fill="none" stroke="#51604b" stroke-width="2" stroke-linecap="round" stroke-opacity=".42"/>'+
      meta.labels.map(function(label){ return '<g><circle cx="'+label[1]+'" cy="'+label[2]+'" r="6" fill="'+meta.accent+'" stroke="#fff" stroke-width="2"/><text x="'+(label[1]+10)+'" y="'+(label[2]-8)+'" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#26384a">'+label[0]+'</text></g>'; }).join('')+
      '<rect x="14" y="14" width="260" height="58" rx="12" fill="rgba(255,255,255,.78)" stroke="rgba(38,56,74,.18)"/>'+
      '<text x="30" y="39" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#1f2e3e">'+meta.title+'</text>'+
      '<text x="30" y="59" font-family="Arial, sans-serif" font-size="11" fill="#40556d">'+meta.subtitle+'</text>'+
      '<path d="M0 318 C92 296 182 326 280 308 C382 288 450 302 560 278 V360 H0 Z" fill="rgba(31,46,62,.16)"/>'+
    '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(html);
  }

  const LENS_IMAGES = Object.fromEntries(Object.entries(LENS_META).map(function(entry){
    return [entry[0], svgUrl(entry[1])];
  }));

  function repairLensImages(root){
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.map-lens-card[data-map-lens]').forEach(function(card){
      const lensId = card.dataset.mapLens;
      const url = LENS_IMAGES[lensId];
      const img = card.querySelector('.map-lens-topo');
      if (!img || !url) return;
      img.removeAttribute('data-image-error');
      img.removeAttribute('data-pb-v61-bound');
      img.removeAttribute('data-pb-v61-fallback-applied');
      img.removeAttribute('data-v50-fallback-applied');
      img.classList.remove('pb-v50-media-fallback-img');
      img.dataset.pbMapLensFixed = 'true';
      img.dataset.pbMapLensId = lensId;
      img.alt = 'Mapa físico simplificado: ' + (LENS_META[lensId].title || lensId);
      if (img.getAttribute('src') !== url) img.setAttribute('src', url);
      img.onerror = function(){
        this.classList.add('is-map-lens-hidden');
        this.removeAttribute('data-image-error');
      };
    });
    document.documentElement.dataset.paleobotV80MapLensImageRepair = 'ready';
  }

  function afterRender(){
    window.requestAnimationFrame(function(){ repairLensImages(document); });
    window.setTimeout(function(){ repairLensImages(document); }, 120);
  }

  const originalRender = window.renderMapLensGrid;
  if (typeof originalRender === 'function' && !originalRender.__pbV80MapLensRepair) {
    const wrappedRender = function(){
      const result = originalRender.apply(this, arguments);
      afterRender();
      return result;
    };
    wrappedRender.__pbV80MapLensRepair = true;
    window.renderMapLensGrid = wrappedRender;
  }

  const originalSwitch = window.switchMapLayer;
  if (typeof originalSwitch === 'function' && !originalSwitch.__pbV80MapLensRepair) {
    const wrappedSwitch = function(){
      const result = originalSwitch.apply(this, arguments);
      afterRender();
      return result;
    };
    wrappedSwitch.__pbV80MapLensRepair = true;
    window.switchMapLayer = wrappedSwitch;
  }

  document.addEventListener('error', function(event){
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('map-lens-topo')) return;
    // Observador pasivo: no cancela la cadena global de errores.
    // v80 reimpone después la imagen regional canónica de la lente.
    afterRender();
  }, true);

  const observer = new MutationObserver(function(records){
    if (records.some(function(record){
      return Array.from(record.addedNodes).some(function(node){
        return node.nodeType === 1 && (node.matches?.('.map-lens-card,.map-lens-topo') || node.querySelector?.('.map-lens-card,.map-lens-topo'));
      });
    })) afterRender();
  });

  function init(){
    repairLensImages(document);
    observer.observe(document.documentElement, { childList:true, subtree:true });
    window.setTimeout(function(){
      const count = document.querySelectorAll('.map-lens-topo[data-pb-map-lens-fixed="true"]').length;
      document.documentElement.dataset.paleobotV80MapLensImageCount = String(count);
    }, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.PaleoBotV80MapLensImageRepair = {
    repair: repairLensImages,
    images: LENS_IMAGES,
    mode:'passive-error-repair'
  };
})();
