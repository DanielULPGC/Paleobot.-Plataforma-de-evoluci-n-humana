// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v59-block-panel-sync
(function(){
  'use strict';
  const BLOCKS = {
    explorar:{
      title:'Explorar evidencias',
      summary:'Entrada operativa para ordenar fósiles, yacimientos, regiones y contexto antes de interpretar hipótesis.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Olduvai_Gorge_or_Oldupai_Gorge.jpg?width=1400',
      coverAlt:'Paisaje de la Garganta de Olduvai, yacimiento clave del registro paleoantropológico',
      caption:'Portada: yacimientos, cronología y contexto territorial.',
      views:['timeline','map','continentes','africa','asia','europe','america','yacimientos','biogeo','contexto','paleoecologia']
    },
    interpretar:{
      title:'Interpretar relaciones',
      summary:'Herramientas para comparar rasgos, parentescos, coexistencias e hipótesis sin confundir semejanza con ascendencia directa.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Homo_sapiens_and_Neanderthal_skulls.jpg?width=1400',
      coverAlt:'Cráneos humanos comparados como punto de partida para interpretar relaciones evolutivas',
      caption:'Portada: comparar formas, parentescos e hipótesis.',
      views:['tree','phylo','clima','coexistencias','primatologia','constructor']
    },
    investigar:{
      title:'Investigar método',
      summary:'Bloque para revisar cómo se sabe lo que se afirma: estratigrafía, datación, tafonomía, holotipos, revisiones y debates.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Atapuerca_-_Sima_del_Elefante_-_2006.jpg?width=1400',
      coverAlt:'Excavación en Atapuerca como contexto de investigación paleoantropológica',
      caption:'Portada: método, estratigrafía, debate y control de evidencias.',
      views:['revisiones','genomica','paleoproteomica','datacion','debates','estratigrafia','tafonomia','introgresion','holotipos','dispersal']
    },
    aprender:{
      title:'Aprender y evaluar',
      summary:'Centro didáctico para convertir el atlas en actividad: rutas de clase, recursos externos, plantillas y productos evaluables.',
      cover:'https://commons.wikimedia.org/wiki/Special:FilePath/Museo_de_la_Evoluci%C3%B3n_Humana%2C_Burgos.jpg?width=1400',
      coverAlt:'Esquema visual de evolución humana para uso educativo',
      caption:'Portada: transformar el atlas en actividad y evaluación.',
      views:['aula','recursos','itinerarios','socratico']
    }
  };
  const LABELS = {
    timeline:'Cronología', map:'Mapa', continentes:'Continentes', africa:'África', asia:'Asia', europe:'Europa', america:'América',
    yacimientos:'Yacimientos', biogeo:'Biogeografía', contexto:'Contexto', paleoecologia:'Paleoecología', tree:'Árbol consenso',
    phylo:'Filogenia', clima:'Clima PAGES2k', coexistencias:'Coexistencias', primatologia:'Primatología', constructor:'Constructor',
    revisiones:'Revisiones', genomica:'Biomoléculas', paleoproteomica:'Paleoproteómica', datacion:'Datación', debates:'Debates', socratico:'Socrático',
    estratigrafia:'Estratigrafía', tafonomia:'Tafonomía', introgresion:'Introgresión', holotipos:'Holotipos',
    dispersal:'Dispersión', aula:'Aula', recursos:'Recursos', itinerarios:'Itinerarios'
  };
  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function activeView(){
    return document.querySelector('.view-section.active')?.id?.replace(/^view-/,'') || '';
  }
  function render(blockId = document.body.dataset.pbV50Block || 'explorar'){
    const panel = document.getElementById('pbV50BlockPanel');
    const block = BLOCKS[blockId] || BLOCKS.explorar;
    if (!panel) return false;
    const current = activeView();
    const views = block.views.filter(view => document.getElementById('view-' + view));
    panel.innerHTML = `
      <figure class="pb-v50-cover">
        <img src="${esc(block.cover)}" alt="${esc(block.coverAlt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <figcaption>${esc(block.caption)}</figcaption>
      </figure>
      <div class="pb-v50-block-copy">
        <h2>${esc(block.title)}</h2>
        <p>${esc(block.summary)}</p>
        <div class="pb-v50-module-grid" aria-label="Herramientas del bloque ${esc(block.title)}">
          ${views.map(view => `<button type="button" class="pb-v50-module${view === current ? ' active' : ''}" data-pb-v50-view="${esc(view)}" data-view="${esc(view)}" aria-pressed="${view === current ? 'true' : 'false'}">${esc(LABELS[view] || view)}</button>`).join('')}
        </div>
      </div>`;
    document.documentElement.dataset.paleobotV59BlockPanelSync = 'ready';
    return true;
  }
  function scheduleRender(){
    window.requestAnimationFrame(() => render());
    window.setTimeout(() => render(), 80);
    window.setTimeout(() => render(), 220);
  }
  ['paleobot:v55-viewchange','paleobot:v51-viewchange','paleobot:v50-viewchange','paleobot:viewchange'].forEach(name => {
    document.addEventListener(name, scheduleRender);
  });
  document.addEventListener('DOMContentLoaded', () => window.setTimeout(() => render(), 180), { once:true });
  if (document.readyState !== 'loading') window.setTimeout(() => render(), 180);
  window.PaleoBotV59BlockPanelSync = { render };
})();
