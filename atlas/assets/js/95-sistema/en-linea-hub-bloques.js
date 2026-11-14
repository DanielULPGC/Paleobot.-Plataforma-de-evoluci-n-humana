/* PB-GH-11 · Script que estaba en línea en atlas/index.html (línea 550 en c971001, tras #pb-hub).
   Movido sin cambios a un archivo propio para retirar 'unsafe-inline' de script-src (fila 30).
   Se carga síncrono (sin defer) en la misma posición: conserva el orden de ejecución. */
  /* Lógica del HUB de bloques (Claude 2026-06). Carga durante el parseo, antes
     que los guards diferidos. Navega vía el router verificado y baja al atlas. */
  (function(){
    var L = {
      timeline:'Cronología', tree:'Árbol de consenso', phylo:'Filogenia',
      coexistencias:'Coexistencias', holotipos:'Holotipos', revisiones:'Revisiones', primatologia:'Primatología',
      map:'Mapa', continentes:'Continentes', africa:'África', asia:'Asia', europe:'Europa', america:'América',
      yacimientos:'Yacimientos', biogeo:'Biogeografía', dispersal:'Dispersión',
      contexto:'Contexto', clima:'Clima', paleoecologia:'Paleoecología',
      genomica:'Paleogenómica', paleoproteomica:'Paleoproteómica', datacion:'Datación',
      estratigrafia:'Estratigrafía', tafonomia:'Tafonomía', introgresion:'Introgresión',
      constructor:'Constructor', debates:'Debates', socratico:'Socrático',
      aula:'Aula', recursos:'Recursos', itinerarios:'Itinerarios', paleolab:'PaleoLab 50'
    };
    var BLOCKS = {
      cronologia:{ c:'#13a37f', title:'Cronología y especies', sub:'¿Quiénes vivieron y cuándo?', defaultView:'timeline',
        views:['timeline','tree','phylo','coexistencias','holotipos','revisiones','primatologia'] },
      territorio:{ c:'#4f86d6', title:'Territorio y dispersión', sub:'¿Dónde vivieron y por dónde se movieron?', defaultView:'map',
        views:['map','continentes','africa','asia','europe','america','yacimientos','biogeo','dispersal'] },
      clima:{ c:'#8aa83d', title:'Clima y ecología', sub:'¿En qué mundo vivieron?', defaultView:'clima',
        views:['clima','contexto','paleoecologia'] },
      metodos:{ c:'#c79030', title:'Métodos y evidencia', sub:'¿Cómo lo sabemos? Incluye la nueva Paleoproteómica.', defaultView:'genomica',
        views:['genomica','paleoproteomica','datacion','estratigrafia','tafonomia','introgresion','constructor','debates','socratico'] },
      aula:{ c:'#c4622f', title:'Aula y recursos', sub:'Enseñar y evaluar con el atlas.', defaultView:'aula',
        views:['aula','recursos','itinerarios','paleolab'] }
    };
    var NEW = { paleoproteomica:true, paleolab:true };
    var lastBlockTrigger = null;

    function activateHubView(view){
      var section = document.getElementById('view-' + view);
      if (!section) return false;
      try {
        if (window.PaleoBotCanonicalNav) {
          window.PaleoBotCanonicalNav.setCanonical?.(view);
          window.PaleoBotCanonicalNav.domActivate?.(view);
        }
      } catch(_){}
      try {
        if (window.PaleoBotV91FinalButtonActions && window.PaleoBotV91FinalButtonActions.routeView)
          window.PaleoBotV91FinalButtonActions.routeView(view);
        else if (window.PaleoBotV55Router && window.PaleoBotV55Router.activateView)
          window.PaleoBotV55Router.activateView(view, { scroll:false });
        else if (window.PaleoBotV68InteractionStabilizer && window.PaleoBotV68InteractionStabilizer.routeView)
          window.PaleoBotV68InteractionStabilizer.routeView(view);
        else if (typeof window.renderActiveView === 'function')
          window.renderActiveView(view);
      } catch(_){}
      return document.getElementById('view-' + view)?.classList.contains('active') || false;
    }

    function goView(view){
      if (!activateHubView(view)) return;
      document.body.classList.add('pb-workspace-entered');
      var m = document.getElementById('main-content');
      if (!m) return;
      m.setAttribute('tabindex','-1');
      if (window.location.hash !== '#main-content') window.location.hash = 'main-content';
      try { m.scrollIntoView({ behavior:'auto', block:'start' }); } catch(e){}
      var tries = 0;
      function settle(){
        var sec = document.getElementById('view-' + view);
        if (sec && !sec.classList.contains('active')) {
          try {
            window.PaleoBotCanonicalNav?.setCanonical?.(view);
            window.PaleoBotCanonicalNav?.domActivate?.(view);
          } catch(_){}
        }
        try { m.scrollIntoView({ behavior:'auto', block:'start' }); } catch(e){}
        tries++;
        if (tries < 3 && sec && !sec.classList.contains('active')) setTimeout(settle, 90);
      }
      setTimeout(settle, 60);
      try { m.focus(); } catch(e){}
    }

    function openBlock(key){
      var b = BLOCKS[key]; if(!b) return;
      lastBlockTrigger = document.querySelector('.pb-hub-card[data-hub-block="' + key + '"]');
      document.querySelectorAll('.pb-hub-card[data-hub-block]').forEach(function(card){
        card.setAttribute('aria-expanded', card === lastBlockTrigger ? 'true' : 'false');
      });
      document.getElementById('pb-hub-blocks').style.display = 'none';
      var panel = document.getElementById('pb-hub-tools');
      panel.style.display = 'block';
      document.getElementById('pb-hub-tools-dot').style.background = b.c;
      document.getElementById('pb-hub-tools-title').textContent = b.title;
      document.getElementById('pb-hub-tools-sub').textContent = b.sub;
      var grid = document.getElementById('pb-hub-tools-grid');
      grid.innerHTML = '';
      b.views.forEach(function(v){
        var btn = document.createElement('button');
        btn.type = 'button';
        if (v === 'paleolab') {
          btn.setAttribute('data-paleolab-open', '');
          btn.setAttribute('data-action', 'openPaleoLab');
          btn.setAttribute('aria-haspopup', 'dialog');
          btn.setAttribute('aria-controls', 'splDialog');
        } else {
          btn.setAttribute('data-hub-view', v);
        }
        btn.setAttribute('aria-label', 'Abrir ' + (L[v] || v));
        btn.style.cssText = 'text-align:left;cursor:pointer;font:inherit;background:#1b3144;border:1px solid #2a4357;border-left:4px solid '+b.c+';border-radius:11px;padding:15px 16px;color:#f3efe7;font-size:1.05rem;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:56px;';
        var label = (L[v]||v);
        btn.innerHTML = '<span>'+label+(NEW[v]?' <span style="font-family:JetBrains Mono,monospace;font-size:.6rem;letter-spacing:.08em;color:#102332;background:#d8a93a;border-radius:5px;padding:2px 6px;vertical-align:middle;margin-left:4px;">NUEVO</span>':'')+'</span><span style="color:'+b.c+';font-size:1.1rem;">→</span>';
        grid.appendChild(btn);
      });
      try { panel.scrollIntoView({block:'start'}); } catch(e){}
      try { document.getElementById('pb-hub-back').focus({preventScroll:true}); } catch(e){}
    }
    function backToBlocks(){
      document.getElementById('pb-hub-tools').style.display = 'none';
      document.getElementById('pb-hub-blocks').style.display = 'grid';
      document.querySelectorAll('.pb-hub-card[data-hub-block]').forEach(function(card){
        card.setAttribute('aria-expanded','false');
      });
      try { lastBlockTrigger?.focus({preventScroll:true}); } catch(e){}
    }

    function renderIndex(){
      var host = document.getElementById('pb-landing-index-grid');
      if (!host || host.children.length) return;
      Object.keys(BLOCKS).forEach(function(key){
        var block = BLOCKS[key];
        var group = document.createElement('section');
        group.className = 'pb-landing-index-group';
        group.style.setProperty('--c', block.c);
        var heading = document.createElement('h3');
        heading.textContent = block.title;
        var count = document.createElement('span');
        count.textContent = block.views.length + (block.views.length === 1 ? ' vista' : ' vistas');
        var links = document.createElement('div');
        links.className = 'pb-landing-index-links';
        block.views.forEach(function(view){
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'pb-landing-index-link';
          button.setAttribute('aria-label','Abrir ' + (L[view] || view));
          if (view === 'paleolab') {
            button.setAttribute('data-paleolab-open','');
            button.setAttribute('data-action','openPaleoLab');
            button.setAttribute('aria-haspopup','dialog');
            button.setAttribute('aria-controls','splDialog');
          } else {
            button.setAttribute('data-hub-view',view);
          }
          var label = document.createElement('span');
          label.textContent = L[view] || view;
          button.appendChild(label);
          if (NEW[view]) {
            var badge = document.createElement('small');
            badge.textContent = 'NUEVO';
            button.appendChild(badge);
          }
          links.appendChild(button);
        });
        group.appendChild(heading);
        group.appendChild(count);
        group.appendChild(links);
        host.appendChild(group);
      });
    }

    window.PaleoBotLanding = Object.freeze({
      openBlock: openBlock,
      showBlocks: backToBlocks,
      goView: goView,
      renderIndex: renderIndex
    });
    renderIndex();

    window.addEventListener('click', function(ev){
      var tool = ev.target.closest && ev.target.closest('[data-hub-view]');
      if (tool){ ev.preventDefault(); ev.stopImmediatePropagation(); goView(tool.getAttribute('data-hub-view')); return; }
      var card = ev.target.closest && ev.target.closest('.pb-hub-card[data-hub-block]');
      if (card){ ev.preventDefault(); ev.stopImmediatePropagation(); openBlock(card.getAttribute('data-hub-block')); return; }
      var back = ev.target.closest && ev.target.closest('#pb-hub-back');
      if (back){ ev.preventDefault(); ev.stopImmediatePropagation(); backToBlocks(); return; }
      var skip = ev.target.closest && ev.target.closest('#pb-hub-skip');
      if (skip){ ev.preventDefault(); ev.stopImmediatePropagation(); var m=document.getElementById('main-content'); if(m){ document.body.classList.add('pb-workspace-entered'); window.scrollTo(0, m.getBoundingClientRect().top+window.pageYOffset-8); } return; }
    }, true);

    document.addEventListener('mouseover', function(ev){
      var c = ev.target.closest && ev.target.closest('.pb-hub-card');
      if (c){ c.style.transform='translateY(-3px)'; c.style.boxShadow='0 14px 30px rgba(0,0,0,.32)'; c.style.borderColor=c.style.getPropertyValue('--c'); }
    });
    document.addEventListener('mouseout', function(ev){
      var c = ev.target.closest && ev.target.closest('.pb-hub-card');
      if (c){ c.style.transform='none'; c.style.boxShadow='none'; c.style.borderColor='#2a4357'; }
    });
  })();
