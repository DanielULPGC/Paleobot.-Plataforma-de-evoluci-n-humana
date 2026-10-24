// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v82-fauna-rigor-and-layout
(function(){
  'use strict';

  const V34_TO_V66 = {
    olduvai: 'omo_olduvai',
    dmanisi: 'dmanisi',
    atapuerca: 'atapuerca',
    jebel: 'jebel_irhoud_site',
    flores: 'liang_bua'
  };

  const SITE_LABELS = {
    olduvai: 'Olduvai Gorge',
    dmanisi: 'Dmanisi',
    atapuerca: 'Atapuerca TD6 / Sima',
    jebel: 'Jebel Irhoud',
    flores: 'Liang Bua'
  };

  const PBDB_QUERIES = {
    olduvai: 'Olduvai Gorge',
    dmanisi: 'Dmanisi',
    atapuerca: 'Atapuerca',
    jebel: 'Jebel Irhoud',
    flores: 'Liang Bua'
  };

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g, function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function faunaDb(){
    return window.PaleoBotV66Fauna?.FAUNA_DB || window.FAUNA_DB || {};
  }

  function pbdbUrl(key){
    const q = PBDB_QUERIES[key] || SITE_LABELS[key] || key;
    return 'https://paleobiodb.org/classic/basicCollectionSearch?collection_name=' + encodeURIComponent(q);
  }

  function renderFaunaDetail(key){
    const detail = document.getElementById('v34FaunaDetail');
    if (!detail) return false;
    const mapped = V34_TO_V66[key] || key;
    const data = faunaDb()[mapped];
    if (!data) return false;
    document.querySelectorAll('[data-v34-fauna]').forEach(function(btn){
      btn.classList.toggle('active', btn.dataset.v34Fauna === key);
      btn.setAttribute('aria-pressed', btn.dataset.v34Fauna === key ? 'true' : 'false');
    });
    const taxa = Array.isArray(data.taxa) ? data.taxa : [];
    const pills = taxa.map(function(taxon){ return '<span>' + esc(taxon) + '</span>'; }).join('');
    detail.innerHTML =
      '<h4>' + esc(SITE_LABELS[key] || mapped) + '</h4>' +
      '<div class="pb-v82-fauna-meta"><span>' + esc(data.bioma || 'Bioma no indicado') + '</span><span>riqueza ' + esc(data.riqueza || 'sin clasificar') + '</span></div>' +
      '<p><strong>Fauna asociada:</strong></p>' +
      '<div class="pb-v82-fauna-pills">' + pills + '</div>' +
      (data.nota ? '<p><strong>Lectura paleoambiental:</strong> ' + esc(data.nota) + '</p>' : '') +
      '<p class="pb-v82-fauna-caution"><strong>Cautela:</strong> la asociación faunística caracteriza el contexto sedimentario y paleoambiental del yacimiento; no prueba interacción directa con todos los homininos representados.</p>' +
      '<p><a href="' + esc(pbdbUrl(key)) + '" target="_blank" rel="noopener">Consultar colección o yacimiento en Paleobiology Database</a></p>';
    document.documentElement.dataset.paleobotV82FaunaRigor = 'ready';
    return true;
  }

  function patchPanel(){
    const panel = document.getElementById('v34FaunaPanel');
    if (!panel) return;
    const intro = panel.querySelector(':scope > p');
    if (intro && !intro.dataset.pbV82Text) {
      intro.textContent = 'Conecta homininos, fauna y paleoambiente. Lectura contextual: la fauna informa sobre bioma, preservación y competencia ecológica; no implica convivencia directa ni relación filogenética.';
      intro.dataset.pbV82Text = 'ready';
    }
    const active = panel.querySelector('[data-v34-fauna].active') || panel.querySelector('[data-v34-fauna]');
    if (active) renderFaunaDetail(active.dataset.v34Fauna || 'olduvai');
  }

  document.addEventListener('click', function(event){
    const btn = event.target.closest?.('[data-v34-fauna]');
    if (!btn) return;
    if (renderFaunaDetail(btn.dataset.v34Fauna || 'olduvai')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  const oldRenderMap = window.renderMapView;
  if (typeof oldRenderMap === 'function' && !oldRenderMap.__pbV82FaunaRigor) {
    const wrapped = function(){
      const result = oldRenderMap.apply(this, arguments);
      window.setTimeout(patchPanel, 80);
      window.setTimeout(patchPanel, 260);
      return result;
    };
    wrapped.__pbV82FaunaRigor = true;
    window.renderMapView = wrapped;
  }

  const observer = new MutationObserver(function(records){
    if (records.some(function(record){
      return Array.from(record.addedNodes).some(function(node){
        return node.nodeType === 1 && (node.matches?.('#v34FaunaPanel,.v34-fauna-card') || node.querySelector?.('#v34FaunaPanel,.v34-fauna-card'));
      });
    })) window.setTimeout(patchPanel, 40);
  });

  function init(){
    observer.observe(document.documentElement, { childList:true, subtree:true });
    patchPanel();
    window.setTimeout(patchPanel, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.PaleoBotV82FaunaRigorAndLayout = { patchPanel, renderFaunaDetail };
})();
