(function () {
  'use strict';

  const DATA_URL = 'data/nutcracker-corpus.json';
  const PANEL_CLASS = 'pbnm-bank';
  const ROUTES = [
    { view: 'timeline', label: 'Cronologia' },
    { view: 'clima', label: 'Clima' },
    { view: 'map', label: 'Mapa' },
    { view: 'aula', label: 'Aula' },
    { view: 'recursos', label: 'Recursos' }
  ];
  let corpusPromise = null;
  let observer = null;
  let scheduled = false;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function loadCorpus() {
    if (!corpusPromise) {
      corpusPromise = fetch(DATA_URL, { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) {
            throw new Error('No se pudo cargar el corpus Nutcracker Man');
          }
          return response.json();
        });
    }
    return corpusPromise;
  }

  function getHost() {
    return document.getElementById('resourceBankContent');
  }

  function setResults(panel, resources) {
    const list = panel.querySelector('[data-pbnm-results]');
    const note = panel.querySelector('[data-pbnm-note]');
    if (!list || !note) return;
    note.textContent = resources.length === 1
      ? '1 lectura localizada.'
      : `${resources.length} lecturas localizadas.`;
    if (!resources.length) {
      list.innerHTML = '<p class="pbnm-empty">No hay lecturas para ese filtro.</p>';
      return;
    }
    list.innerHTML = resources.map((resource) => {
      const primaryUrl = resource.primary || resource.sourceUrl;
      const primaryLink = primaryUrl
        ? `<button type="button" data-pbnm-external="${escapeHtml(primaryUrl)}">Fuente primaria</button>`
        : '';
      return `
        <article class="pbnm-card">
          <div class="pbnm-card-meta">
            <span>${escapeHtml(resource.type || 'Recurso')}</span>
            <span>${escapeHtml(resource.date || '')}</span>
          </div>
          <h4>${escapeHtml(resource.title)}</h4>
          <p>${escapeHtml(resource.note)}</p>
          <div class="pbnm-card-actions">
            <button type="button" data-pbnm-external="${escapeHtml(resource.url)}">Abrir lectura</button>
            ${primaryLink}
          </div>
        </article>
      `;
    }).join('');
  }

  function filterResources(corpus, query) {
    const q = normalize(query);
    if (!q) return corpus.resources.slice();
    return corpus.resources.filter((resource) => {
      const haystack = [
        resource.title,
        resource.note,
        resource.type,
        resource.date,
        resource.url,
        resource.primary,
        resource.sourceUrl
      ].map(normalize).join(' ');
      return haystack.includes(q);
    });
  }

  function activateRoute(view) {
    const selector = [
      `button[data-view="${view}"]`,
      `[role="button"][data-view="${view}"]`,
      `[data-route="${view}"]`,
      `[data-target-view="${view}"]`
    ].join(',');
    const target = document.querySelector(selector);
    if (target) {
      target.click();
      return;
    }
    window.location.hash = view;
  }

  function buildPanel(corpus) {
    const panel = document.createElement('section');
    panel.className = PANEL_CLASS;
    panel.setAttribute('aria-labelledby', 'pbnm-title');
    panel.innerHTML = `
      <div class="pbnm-head">
        <div>
          <p class="pbnm-kicker">Hemeroteca critica externa</p>
          <h3 id="pbnm-title">Nutcracker Man: lecturas atribuidas</h3>
          <p class="pbnm-intro">
            Seleccion de enlaces recientes del archivo didactico integrado para contextualizar debates,
            yacimientos y noticias sobre paleoantropologia humana.
          </p>
          <p class="pbnm-disclaimer">
            Se integran metadatos y enlaces, no cuerpos textuales ni imagenes externas. Esta hemeroteca no sustituye
            la revision cientifica del atlas ni modifica las fichas validadas.
          </p>
        </div>
        <div class="pbnm-kpis" aria-label="Resumen del corpus Nutcracker Man">
          <div class="pbnm-kpi"><strong>${escapeHtml(corpus.observedPosts)}</strong><span>entradas observadas</span></div>
          <div class="pbnm-kpi"><strong>${escapeHtml(corpus.resources.length)}</strong><span>lecturas seleccionadas</span></div>
          <div class="pbnm-kpi"><strong>${escapeHtml(corpus.externalReferenceLinks)}</strong><span>enlaces externos registrados</span></div>
          <div class="pbnm-kpi"><strong>${escapeHtml(corpus.reviewedAt)}</strong><span>fecha de revision</span></div>
        </div>
      </div>
      <div class="pbnm-controls">
        <label>
          <span class="sr-only">Filtrar lecturas Nutcracker Man</span>
          <input class="pbnm-search" type="search" placeholder="Filtrar por taxon, yacimiento, fecha o tema" autocomplete="off" data-pbnm-search>
        </label>
        <div class="pbnm-route-list" aria-label="Rutas relacionadas del atlas">
          ${ROUTES.map((route) => `<button type="button" class="pbnm-route" data-pbnm-view="${escapeHtml(route.view)}">${escapeHtml(route.label)}</button>`).join('')}
          <button type="button" class="pbnm-reset" data-pbnm-reset>Ver todo</button>
        </div>
      </div>
      <p class="pbnm-results-note" data-pbnm-note aria-live="polite"></p>
      <div class="pbnm-grid" data-pbnm-results></div>
    `;

    const search = panel.querySelector('[data-pbnm-search]');
    const update = () => setResults(panel, filterResources(corpus, search.value));
    search.addEventListener('input', update);
    panel.querySelector('[data-pbnm-reset]').addEventListener('click', () => {
      search.value = '';
      update();
      search.focus();
    });
    panel.querySelectorAll('[data-pbnm-view]').forEach((button) => {
      button.addEventListener('click', () => activateRoute(button.getAttribute('data-pbnm-view')));
    });
    setResults(panel, corpus.resources);
    return panel;
  }

  function insertPanel(host, panel) {
    const kpis = host.querySelector('.resources-kpis');
    if (kpis && kpis.parentElement === host) {
      kpis.insertAdjacentElement('afterend', panel);
      return;
    }
    const firstSection = host.querySelector('.resource-section, section, article');
    if (firstSection) {
      firstSection.insertAdjacentElement('beforebegin', panel);
      return;
    }
    host.prepend(panel);
  }

  function ensurePanel() {
    scheduled = false;
    const host = getHost();
    if (!host || host.querySelector(`.${PANEL_CLASS}`)) return;
    loadCorpus()
      .then((corpus) => {
        if (!host.isConnected || host.querySelector(`.${PANEL_CLASS}`)) return;
        if (!corpus || !Array.isArray(corpus.resources) || !corpus.resources.length) return;
        insertPanel(host, buildPanel(corpus));
      })
      .catch((error) => {
        console.warn('[PaleoBot] Hemeroteca Nutcracker no disponible:', error.message);
      });
  }

  function schedulePanel() {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(ensurePanel, 60);
  }

  function init() {
    const host = getHost();
    if (host && !observer) {
      observer = new MutationObserver(schedulePanel);
      observer.observe(host, { childList: true, subtree: false });
    }
    schedulePanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
