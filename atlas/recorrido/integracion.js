(function(){
  'use strict';
  const page=(window.location.pathname.split('/').pop()||'index.html').toLowerCase();
  const routes={
    'cronologia.html':'timeline',
    'parentesco.html':'phylo',
    'territorio.html':'map',
    'clima.html':'clima',
    'metodos.html':'datacion',
    'aula.html':'aula',
    'ficha.html':'timeline'
  };
  const view=routes[page]||'';
  const nav=document.createElement('nav');
  nav.className='pb-lab-nav';
  nav.setAttribute('aria-label','Atlas completo');
  const link=document.createElement('a');
  link.className='pb-lab-link';
  link.href='../index.html'+(view?'?view='+encodeURIComponent(view)+'#main-content':'');
  link.setAttribute('aria-label','Abrir el atlas completo de PaleoBot');
  link.innerHTML='<span>Atlas completo</span><span aria-hidden="true">→</span>';
  nav.appendChild(link);
  document.body.appendChild(nav);
  document.body.classList.add('pb-recorrido-esencial');
})();
