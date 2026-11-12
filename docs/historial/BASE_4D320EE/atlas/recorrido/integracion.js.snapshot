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
  const link=document.createElement('a');
  link.className='pb-lab-link';
  link.href='../index.html'+(view?'?view='+encodeURIComponent(view)+'#main-content':'');
  link.setAttribute('aria-label','Abrir el laboratorio completo de PaleoBot');
  link.innerHTML='<span>Laboratorio completo</span><span aria-hidden="true">→</span>';
  document.body.appendChild(link);
  document.body.classList.add('pb-recorrido-esencial');
})();
