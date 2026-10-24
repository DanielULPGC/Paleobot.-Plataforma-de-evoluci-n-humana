"use strict";

(function PaleoBotSpeciesLab() {
  const DATA_URL = "data/paleolab-3d.json";
  const STORAGE_KEY = "paleobot_species_lab_v1";
  const MAX_COMPARE = 3;
  let CORE_3D = {};
  let core3dPromise = null;
  const CLADE_ORDER = ["basal", "australo", "paran", "homo"];
  const FALLBACK_CLADE_NAMES = {
    basal: "Basales y Mioceno",
    australo: "Australopithecus",
    paran: "Paranthropus",
    homo: "Homo"
  };
  const FALLBACK_COLORS = {
    basal: "#a86b00",
    australo: "#0a7059",
    paran: "#9b3f24",
    homo: "#235d8c"
  };
  let state = {
    selected: "",
    mode: "plate",
    clade: "all",
    query: "",
    compare: [],
    viewed: [],
    zoom: 1,
    tiltX: 0,
    tiltY: 0
  };
  let dialog = null;
  let lastTrigger = null;

  function coreApi() {
    return window.PaleoBotLabCore || {};
  }

  function announce(message) {
    const live = document.getElementById("splLive");
    if (live) live.textContent = message;
  }

  function loadCore3d() {
    if (!core3dPromise) {
      core3dPromise = fetch(DATA_URL, { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) throw new Error("No se pudieron cargar los modelos 3D");
          return response.json();
        })
        .then(function (data) {
          if (!data || !Array.isArray(data.models)) throw new Error("Formato 3D no válido");
          CORE_3D = Object.fromEntries(data.models
            .filter(function (item) { return item && speciesById(item.id) && /^https:\/\/3d\.si\.edu\//.test(item.url || ""); })
            .map(function (item) { return [item.id, item]; }));
          if (dialog && dialog.open) renderAll();
          return CORE_3D;
        })
        .catch(function (error) {
          CORE_3D = {};
          if (state.mode === "institutional") state.mode = "plate";
          announce("Los modelos 3D institucionales no están disponibles en este momento.");
          console.warn("[PaleoBot] PaleoLab 50:", error.message);
          return CORE_3D;
        });
    }
    return core3dPromise;
  }

  function allSpecies() {
    if (Array.isArray(window.DB)) return window.DB;
    if (window.DB_INDEX && typeof window.DB_INDEX === "object") return Object.values(window.DB_INDEX);
    return [];
  }

  function speciesById(id) {
    if (window.DB_INDEX && window.DB_INDEX[id]) return window.DB_INDEX[id];
    return allSpecies().find(function (item) { return item.id === id; }) || null;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char];
    });
  }

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function cladeName(clade) {
    return (window.CLADE_NAMES && window.CLADE_NAMES[clade]) || FALLBACK_CLADE_NAMES[clade] || clade;
  }

  function cladeColor(clade) {
    return (window.CLADE_COLORS && window.CLADE_COLORS[clade]) || FALLBACK_COLORS[clade] || "#52606a";
  }

  function statusLabel(status) {
    const labels = { aceptada: "Aceptada", debatida: "Debatida", revision: "En revisión" };
    return labels[status] || status || "Aceptada";
  }

  function speciesMedia(sp) {
    const api = coreApi();
    if (typeof api.getSpeciesMedia === "function") return api.getSpeciesMedia(sp);
    return { url: sp.imagen || "", thumbUrl: sp.imagen || "", nota: "Imagen de referencia" };
  }

  function completeness(sp) {
    const api = coreApi();
    if (typeof api.getFossilCompletenessProfile === "function") return api.getFossilCompletenessProfile(sp);
    return { craneo: Boolean(sp.cc), mandibula: false, dientes: false, postcraneo: false };
  }

  function confidence(sp) {
    const api = coreApi();
    if (typeof api.getInferenceConfidenceProfile === "function") return api.getInferenceConfidenceProfile(sp);
    return [];
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      state.selected = speciesById(parsed.selected) ? parsed.selected : state.selected;
      state.mode = ["plate", "morph", "evidence", "institutional"].includes(parsed.mode) ? parsed.mode : "plate";
      state.clade = parsed.clade || "all";
      state.compare = Array.isArray(parsed.compare) ? parsed.compare.filter(function (id) { return speciesById(id); }).slice(0, MAX_COMPARE) : [];
      state.viewed = Array.isArray(parsed.viewed) ? parsed.viewed.filter(function (id) { return speciesById(id); }) : [];
    } catch (error) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selected: state.selected,
        mode: state.mode,
        clade: state.clade,
        compare: state.compare,
        viewed: state.viewed
      }));
    } catch (error) {}
  }

  function markViewed(id) {
    if (!speciesById(id)) return;
    if (!state.viewed.includes(id)) state.viewed.push(id);
    saveState();
    document.dispatchEvent(new CustomEvent("paleobot:lab-species", { detail: { id: id } }));
  }

  function filteredSpecies() {
    const query = normalize(state.query);
    return allSpecies().filter(function (sp) {
      if (state.clade !== "all" && sp.clado !== state.clade) return false;
      if (!query) return true;
      return normalize([sp.nombre, sp.anos, sp.ubicacion, sp.holo, sp.descripcion].join(" ")).includes(query);
    });
  }

  function thumbUrl(sp) {
    const api = coreApi();
    if (typeof api.getSpeciesThumb === "function") return api.getSpeciesThumb(sp, 120);
    return speciesMedia(sp).thumbUrl || speciesMedia(sp).url;
  }

  function renderFilters() {
    const host = document.getElementById("splCladeFilters");
    if (!host) return;
    const species = allSpecies();
    const buttons = [["all", "Todos", species.length]].concat(CLADE_ORDER.map(function (clade) {
      return [clade, cladeName(clade), species.filter(function (sp) { return sp.clado === clade; }).length];
    }));
    host.innerHTML = buttons.map(function (item) {
      const active = state.clade === item[0];
      return '<button type="button" class="spl-filter' + (active ? " active" : "") + '" data-spl-clade="' + escapeHtml(item[0]) + '" aria-pressed="' + active + '"><span>' + escapeHtml(item[1]) + '</span><b>' + escapeHtml(item[2]) + '</b></button>';
    }).join("");
  }

  function renderSpeciesList() {
    const host = document.getElementById("splSpeciesList");
    const count = document.getElementById("splListCount");
    if (!host) return;
    const species = filteredSpecies();
    if (count) count.textContent = species.length + " visibles";
    if (!species.length) {
      host.innerHTML = '<div class="spl-empty"><strong>Sin resultados</strong><span>Prueba otro nombre, región o clado.</span></div>';
      return;
    }
    host.innerHTML = species.map(function (sp) {
      const selected = sp.id === state.selected;
      const viewed = state.viewed.includes(sp.id);
      const core = Boolean(CORE_3D[sp.id]);
      return '<button type="button" class="spl-species' + (selected ? " active" : "") + '" data-spl-species="' + escapeHtml(sp.id) + '" aria-current="' + (selected ? "true" : "false") + '">' +
        '<span class="spl-thumb"><img src="' + escapeHtml(thumbUrl(sp)) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>' +
        '<span class="spl-species-copy"><strong><i>' + escapeHtml(sp.nombre) + '</i></strong><small>' + escapeHtml(sp.anos) + " · " + escapeHtml(sp.ubicacion) + '</small></span>' +
        '<span class="spl-species-flags">' + (core ? '<i title="Modelo 3D institucional verificado">3D</i>' : '') + (viewed ? '<b title="Ficha explorada">✓</b>' : '') + '</span>' +
      '</button>';
    }).join("");
    window.requestAnimationFrame(function () {
      const active = host.querySelector(".spl-species.active");
      if (active) active.scrollIntoView({ block: "nearest" });
    });
  }

  function renderSequenceNav() {
    const species = allSpecies();
    const index = species.findIndex(function (sp) { return sp.id === state.selected; });
    const position = document.getElementById("splSequencePosition");
    const previous = document.querySelector('[data-spl-step="-1"]');
    const next = document.querySelector('[data-spl-step="1"]');
    if (position) position.textContent = index >= 0 ? (index + 1) + " / " + species.length : "- / " + species.length;
    if (previous) previous.disabled = index <= 0;
    if (next) next.disabled = index < 0 || index >= species.length - 1;
  }

  function modeButtons(sp) {
    const modes = [
      ["plate", "Lámina 2,5D"],
      ["morph", "Morfología"],
      ["evidence", "Evidencia"],
      ["institutional", "3D institucional"]
    ];
    return modes.map(function (item) {
      const unavailable = item[0] === "institutional" && !CORE_3D[sp.id];
      const active = state.mode === item[0];
      const label = unavailable ? "3D no disponible" : item[1];
      return '<button type="button" data-spl-mode="' + item[0] + '" aria-pressed="' + active + '" class="' + (active ? "active" : "") + '"' + (unavailable ? ' disabled aria-disabled="true" title="No hay un modelo institucional curado para este taxón"' : "") + '>' + label + '</button>';
    }).join("");
  }

  function plateHtml(sp) {
    const media = speciesMedia(sp);
    return '<div class="spl-plate" id="splInteractivePlate" tabindex="0" aria-label="Lámina interactiva de ' + escapeHtml(sp.nombre) + '. Usa las flechas para inclinar y más o menos para ampliar.">' +
      '<div class="spl-plate-orbit" id="splPlateOrbit"><img src="' + escapeHtml(media.url) + '" alt="' + escapeHtml(media.titulo || ("Imagen de referencia de " + sp.nombre)) + '" decoding="async" referrerpolicy="no-referrer"></div>' +
      '<div class="spl-stage-watermark">' + escapeHtml(sp.nombre) + '</div>' +
      '<p class="spl-media-note">' + escapeHtml(media.nota || "Imagen de referencia, consultar fuente y licencia en la ficha completa.") + '</p>' +
    '</div>';
  }

  function morphHtml(sp) {
    const api = coreApi();
    let svg = "";
    if (typeof api.skullSvg === "function") svg = api.skullSvg(sp, cladeColor(sp.clado));
    if (!svg) svg = '<div class="spl-empty"><strong>Esquema no disponible</strong><span>Consulta la ficha anatómica completa.</span></div>';
    let metrics = null;
    if (typeof api.metricProfile === "function") metrics = api.metricProfile(sp);
    const bars = metrics ? [
      ["Bóveda", metrics.vault], ["Prognatismo", metrics.prognathism],
      ["Toro supraorbitario", metrics.brow], ["Mandíbula", metrics.jaw]
    ].map(function (item) {
      return '<div class="spl-metric"><span>' + item[0] + '</span><i><b style="width:' + Math.round(item[1]) + '%;background:' + escapeHtml(cladeColor(sp.clado)) + '"></b></i><em>' + Math.round(item[1]) + '</em></div>';
    }).join("") : "";
    return '<div class="spl-morph"><div class="spl-morph-model">' + svg + '</div><div class="spl-metrics">' + bars + '</div><p>Modelo volumétrico esquemático. No es una reconstrucción forense ni una malla del fósil: traduce rasgos de la ficha a una comparación visual.</p></div>';
  }

  function evidenceHtml(sp) {
    const parts = completeness(sp);
    const labels = { craneo: "Cráneo", mandibula: "Mandíbula", dientes: "Dientes", postcraneo: "Postcráneo" };
    const partCards = Object.keys(labels).map(function (key) {
      return '<div class="spl-evidence-part ' + (parts[key] ? "known" : "missing") + '"><span aria-hidden="true">' + (parts[key] ? "●" : "○") + '</span><strong>' + labels[key] + '</strong><small>' + (parts[key] ? "documentado en la ficha" : "no documentado o muy limitado") + '</small></div>';
    }).join("");
    const conf = confidence(sp).map(function (item) {
      const level = { high: "Alta", medium: "Media", low: "Baja", debated: "Debatida" }[item.level] || item.level;
      return '<div class="spl-confidence ' + escapeHtml(item.level) + '"><strong>' + escapeHtml(item.label) + '<span>' + escapeHtml(level) + '</span></strong><p>' + escapeHtml(item.why) + '</p></div>';
    }).join("");
    return '<div class="spl-evidence"><div class="spl-evidence-parts">' + partCards + '</div><div class="spl-confidence-grid">' + conf + '</div><p class="spl-caution">La escala resume la cobertura de esta ficha y el estado de cada afirmación. No mide una supuesta superioridad evolutiva.</p></div>';
  }

  function institutionalHtml(sp) {
    const item = CORE_3D[sp.id];
    if (!item) return '<div class="spl-empty"><strong>Modelo 3D no curado</strong><span>Se mantiene la lámina 2,5D para no sustituir evidencia por una reconstrucción no verificada.</span></div>';
    return '<div class="spl-institutional"><span class="spl-3d-mark" aria-hidden="true">3D</span><p class="spl-kicker">Smithsonian 3D Digitization</p><h3>' + escapeHtml(item.label) + '</h3><strong>' + escapeHtml(item.specimen) + '</strong><p>' + escapeHtml(item.note) + '</p><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">Abrir el modelo 3D institucional ↗</a><small>La exploración se abre en la fuente original y requiere conexión a Internet.</small></div>';
  }

  function stageHtml(sp) {
    if (state.mode === "morph") return morphHtml(sp);
    if (state.mode === "evidence") return evidenceHtml(sp);
    if (state.mode === "institutional") return institutionalHtml(sp);
    return plateHtml(sp);
  }

  function referencesHtml(sp) {
    const refs = sp.experto && Array.isArray(sp.experto.referencias) ? sp.experto.referencias.slice(0, 4) : [];
    if (!refs.length) return '<p class="spl-no-ref">La ficha local no incorpora todavía referencias iniciales.</p>';
    return '<ol class="spl-refs">' + refs.map(function (ref) {
      const label = [ref.a, ref.y, ref.t, ref.j].filter(Boolean).join(". ");
      const link = ref.d ? '<a href="https://doi.org/' + escapeHtml(ref.d) + '" target="_blank" rel="noopener noreferrer">DOI ↗</a>' : "";
      return '<li><span>' + escapeHtml(label) + '</span>' + link + '</li>';
    }).join("") + '</ol>';
  }

  function inspectorHtml(sp) {
    const expert = sp.experto || {};
    const inCompare = state.compare.includes(sp.id);
    const status = sp.estado || "aceptada";
    return '<div class="spl-inspector-head"><div><span class="spl-clade" style="--spl-color:' + escapeHtml(cladeColor(sp.clado)) + '">' + escapeHtml(cladeName(sp.clado)) + '</span><h2><i>' + escapeHtml(sp.nombre) + '</i></h2></div><span class="spl-status ' + escapeHtml(status) + '">' + escapeHtml(statusLabel(status)) + '</span></div>' +
      '<div class="spl-facts"><div><span>Antigüedad</span><b>' + escapeHtml(sp.anos || "Sin dato") + '</b></div><div><span>Región</span><b>' + escapeHtml(sp.ubicacion || "Sin dato") + '</b></div><div><span>Holotipo</span><b>' + escapeHtml(sp.holo || "Sin dato") + '</b></div><div><span>Capacidad craneal</span><b>' + escapeHtml(sp.cc ? sp.cc + " cc" : "No disponible") + '</b></div><div><span>Datación</span><b>' + escapeHtml(sp.datacion || "No indicada") + '</b></div><div><span>Tecnología</span><b>' + escapeHtml(sp.herramientas || "No documentada") + '</b></div></div>' +
      '<section class="spl-text-section"><h3>Lectura científica</h3><p>' + escapeHtml(sp.descripcion || "Descripción no disponible.") + '</p></section>' +
      '<section class="spl-text-section spl-debate"><h3>Debate y cautela</h3><p>' + escapeHtml(expert.debate || "No se ha destacado una controversia específica en la ficha local.") + '</p></section>' +
      '<section class="spl-text-section"><h3>Referencias iniciales</h3>' + referencesHtml(sp) + '</section>' +
      '<div class="spl-inspector-actions"><button type="button" class="spl-compare-btn' + (inCompare ? " active" : "") + '" data-spl-compare="' + escapeHtml(sp.id) + '" aria-pressed="' + inCompare + '">' + (inCompare ? "Quitar de comparación" : "Añadir a comparación") + '</button><button type="button" class="spl-full-btn" data-spl-full="' + escapeHtml(sp.id) + '">Abrir ficha completa</button></div>';
  }

  function renderStageAndInspector() {
    const sp = speciesById(state.selected) || allSpecies()[0];
    if (!sp) return;
    const title = document.getElementById("splStageTitle");
    const subtitle = document.getElementById("splStageSubtitle");
    const modes = document.getElementById("splModes");
    const stage = document.getElementById("splStage");
    const inspector = document.getElementById("splInspector");
    const stageControls = document.querySelector(".spl-stage-controls");
    if (title) title.innerHTML = '<i>' + escapeHtml(sp.nombre) + '</i>';
    if (subtitle) subtitle.textContent = [sp.anos, sp.ubicacion, CORE_3D[sp.id] ? "núcleo 3D verificado" : "lámina 2,5D"].filter(Boolean).join(" · ");
    if (modes) modes.innerHTML = modeButtons(sp);
    if (stage) stage.innerHTML = stageHtml(sp);
    if (inspector) inspector.innerHTML = inspectorHtml(sp);
    if (stageControls) stageControls.hidden = state.mode !== "plate";
    renderSequenceNav();
    updatePlateTransform();
    bindPlateInteraction();
  }

  function renderCompare() {
    const host = document.getElementById("splCompareTray");
    if (!host) return;
    const species = state.compare.map(speciesById).filter(Boolean);
    if (!species.length) {
      host.innerHTML = '<div class="spl-compare-empty"><strong>Comparador</strong><span>Añade hasta tres especies para contrastar cronología, región, cerebro y tecnología.</span></div>';
      return;
    }
    host.innerHTML = '<div class="spl-compare-head"><div><strong>Comparación activa</strong><span>' + species.length + " de " + MAX_COMPARE + ' especies</span></div><button type="button" data-spl-clear-compare>Limpiar</button></div><div class="spl-compare-grid">' + species.map(function (sp) {
      return '<article><button type="button" class="spl-compare-remove" data-spl-remove="' + escapeHtml(sp.id) + '" aria-label="Quitar ' + escapeHtml(sp.nombre) + '">×</button><img src="' + escapeHtml(thumbUrl(sp)) + '" alt="" loading="lazy" referrerpolicy="no-referrer"><div><h3><i>' + escapeHtml(sp.nombre) + '</i></h3><p><b>' + escapeHtml(sp.anos) + '</b><span>' + escapeHtml(sp.ubicacion) + '</span><span>' + escapeHtml(sp.cc ? sp.cc + " cc" : "capacidad craneal no disponible") + '</span><span>' + escapeHtml(sp.herramientas || "tecnología no documentada") + '</span></p><button type="button" data-spl-species="' + escapeHtml(sp.id) + '">Examinar</button></div></article>';
    }).join("") + '</div>';
  }

  function renderProgress() {
    const count = allSpecies().length || 50;
    const seen = state.viewed.length;
    const pct = Math.round((seen / count) * 100);
    const host = document.getElementById("splProgress");
    if (host) host.innerHTML = '<span><b>' + seen + " / " + count + '</b> especies exploradas</span><i><b style="width:' + pct + '%"></b></i>';
  }

  function renderAll() {
    renderFilters();
    renderSpeciesList();
    renderStageAndInspector();
    renderCompare();
    renderProgress();
  }

  function stepSpecies(direction) {
    const species = allSpecies();
    const index = species.findIndex(function (sp) { return sp.id === state.selected; });
    const nextIndex = Math.max(0, Math.min(species.length - 1, index + direction));
    if (index < 0 && species.length) selectSpecies(species[0].id);
    else if (nextIndex !== index && species[nextIndex]) selectSpecies(species[nextIndex].id);
  }

  function selectSpecies(id) {
    if (!speciesById(id)) return;
    state.selected = id;
    if (state.mode === "institutional" && !CORE_3D[id]) state.mode = "plate";
    state.zoom = 1;
    state.tiltX = 0;
    state.tiltY = 0;
    markViewed(id);
    renderSpeciesList();
    renderStageAndInspector();
    renderCompare();
    renderProgress();
    const position = allSpecies().findIndex(function (sp) { return sp.id === id; }) + 1;
    announce("Ficha " + position + " de " + allSpecies().length + ": " + speciesById(id).nombre + ".");
  }

  function toggleCompare(id) {
    if (state.compare.includes(id)) state.compare = state.compare.filter(function (item) { return item !== id; });
    else if (state.compare.length < MAX_COMPARE) state.compare.push(id);
    else {
      const live = document.getElementById("splLive");
      if (live) live.textContent = "El comparador admite un máximo de tres especies.";
      return;
    }
    saveState();
    renderStageAndInspector();
    renderCompare();
  }

  function updatePlateTransform() {
    const orbit = document.getElementById("splPlateOrbit");
    const slider = document.getElementById("splZoom");
    if (orbit) orbit.style.transform = "perspective(1000px) rotateX(" + state.tiltX + "deg) rotateY(" + state.tiltY + "deg) scale(" + state.zoom + ")";
    if (slider) slider.value = String(Math.round(state.zoom * 100));
  }

  function resetPlate() {
    state.zoom = 1;
    state.tiltX = 0;
    state.tiltY = 0;
    updatePlateTransform();
  }

  function bindPlateInteraction() {
    const plate = document.getElementById("splInteractivePlate");
    if (!plate || plate.dataset.bound) return;
    plate.dataset.bound = "true";
    let pointerActive = false;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    plate.addEventListener("pointerdown", function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      pointerActive = true;
      dragging = false;
      startX = event.clientX;
      startY = event.clientY;
      originX = state.tiltY;
      originY = state.tiltX;
      try { plate.setPointerCapture(event.pointerId); } catch (error) {}
    });
    plate.addEventListener("pointermove", function (event) {
      if (!pointerActive) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (!dragging && Math.hypot(deltaX, deltaY) < 6) return;
      if (!dragging) {
        dragging = true;
        plate.classList.add("dragging");
      }
      state.tiltY = Math.max(-22, Math.min(22, originX + (event.clientX - startX) * 0.08));
      state.tiltX = Math.max(-10, Math.min(10, originY - (event.clientY - startY) * 0.05));
      updatePlateTransform();
    });
    function finishDrag(event) {
      pointerActive = false;
      dragging = false;
      plate.classList.remove("dragging");
      try {
        if (plate.hasPointerCapture(event.pointerId)) plate.releasePointerCapture(event.pointerId);
      } catch (error) {}
    }
    plate.addEventListener("pointerup", finishDrag);
    plate.addEventListener("pointercancel", finishDrag);
    plate.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") state.tiltY -= 2;
      else if (event.key === "ArrowRight") state.tiltY += 2;
      else if (event.key === "ArrowUp") state.tiltX -= 2;
      else if (event.key === "ArrowDown") state.tiltX += 2;
      else if (event.key === "+" || event.key === "=") state.zoom = Math.min(1.45, state.zoom + 0.05);
      else if (event.key === "-") state.zoom = Math.max(0.75, state.zoom - 0.05);
      else if (event.key === "0") resetPlate();
      else return;
      event.preventDefault();
      state.tiltX = Math.max(-10, Math.min(10, state.tiltX));
      state.tiltY = Math.max(-22, Math.min(22, state.tiltY));
      updatePlateTransform();
    });
  }

  function openLab(event) {
    if (!dialog || dialog.open || !allSpecies().length) return;
    lastTrigger = event && event.currentTarget ? event.currentTarget : document.activeElement;
    state.zoom = 1;
    state.tiltX = 0;
    state.tiltY = 0;
    markViewed(state.selected);
    renderAll();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.setAttribute("aria-hidden", "false");
    const search = document.getElementById("splSearch");
    if (search) search.focus();
    document.dispatchEvent(new CustomEvent("paleobot:paleolab-open", { detail: { selected: state.selected } }));
  }

  function closeLab() {
    if (dialog && typeof dialog.close === "function" && dialog.open) dialog.close();
    else if (dialog) dialog.removeAttribute("open");
    if (dialog) dialog.setAttribute("aria-hidden", "true");
  }

  function handleOpenRequest(event) {
    const opener = event.target.closest("[data-paleolab-open]");
    if (!opener) return;
    event.preventDefault();
    openLab({ currentTarget: opener });
  }

  function handleControl(target) {
    if (!target || typeof target.closest !== "function") return false;
    const close = target.closest("[data-spl-close]");
    if (close) { closeLab(); return true; }
    const clade = target.closest("[data-spl-clade]");
    if (clade) { state.clade = clade.dataset.splClade; renderFilters(); renderSpeciesList(); return true; }
    const species = target.closest("[data-spl-species]");
    if (species) { selectSpecies(species.dataset.splSpecies); return true; }
    const step = target.closest("[data-spl-step]");
    if (step && !step.disabled) { stepSpecies(Number(step.dataset.splStep || 0)); return true; }
    const mode = target.closest("[data-spl-mode]");
    if (mode && !mode.disabled) { state.mode = mode.dataset.splMode; saveState(); renderStageAndInspector(); return true; }
    const compare = target.closest("[data-spl-compare]");
    if (compare) { toggleCompare(compare.dataset.splCompare); return true; }
    const remove = target.closest("[data-spl-remove]");
    if (remove) { toggleCompare(remove.dataset.splRemove); return true; }
    const clear = target.closest("[data-spl-clear-compare]");
    if (clear) { state.compare = []; saveState(); renderStageAndInspector(); renderCompare(); return true; }
    const reset = target.closest("[data-spl-reset]");
    if (reset) { resetPlate(); return true; }
    const full = target.closest("[data-spl-full]");
    if (full) {
      const id = full.dataset.splFull;
      const speciesOpener = window.PaleoBotV40SpeciesOpen;
      if (!speciesOpener || typeof speciesOpener.openSpeciesById !== "function") {
        announce("La ficha completa no está disponible en este momento.");
        return true;
      }
      closeLab();
      window.setTimeout(function () { speciesOpener.openSpeciesById(id, "species-lab"); }, 30);
      return true;
    }
    return false;
  }

  function createLab() {
    dialog = document.createElement("dialog");
    dialog.id = "splDialog";
    dialog.className = "spl-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-hidden", "true");
    dialog.setAttribute("aria-labelledby", "splTitle");
    dialog.setAttribute("aria-describedby", "splCriterion");
    dialog.innerHTML = '<div class="spl-shell">' +
      '<header class="spl-header"><div class="spl-brand"><span class="spl-brand-mark">PB</span><div><p>PaleoBot Species Lab</p><h1 id="splTitle">Laboratorio híbrido de 50 especies</h1></div></div><div class="spl-progress" id="splProgress"></div><button type="button" class="spl-close" data-spl-close aria-label="Cerrar laboratorio">×</button></header>' +
      '<div class="spl-toolbar"><div class="spl-filters" id="splCladeFilters" aria-label="Filtros por clado"></div><label class="spl-search"><span>Buscar especie, región o fósil</span><input id="splSearch" type="search" autocomplete="off" placeholder="Ej.: Olduvai, neandertal, Java"></label></div>' +
      '<div class="spl-workspace">' +
        '<aside class="spl-catalog" aria-label="Catálogo de especies"><div class="spl-catalog-head"><strong>Colección</strong><span id="splListCount" aria-live="polite">50 visibles</span></div><div class="spl-species-list" id="splSpeciesList"></div></aside>' +
        '<main class="spl-center"><div class="spl-stage-head"><div><p id="splStageSubtitle"></p><h2 id="splStageTitle"></h2></div><div class="spl-stage-tools"><div class="spl-sequence" aria-label="Secuencia de especies"><button type="button" data-spl-step="-1" aria-label="Especie anterior" title="Especie anterior">&lsaquo;</button><span id="splSequencePosition" aria-live="polite">1 / 50</span><button type="button" data-spl-step="1" aria-label="Especie siguiente" title="Especie siguiente">&rsaquo;</button></div><div class="spl-modes" id="splModes" aria-label="Modo de visualización"></div></div></div><div class="spl-stage" id="splStage"></div><div class="spl-stage-controls"><label>Escala<input id="splZoom" type="range" min="75" max="145" step="5" value="100" aria-label="Escala de la lámina"></label><button type="button" data-spl-reset>Restablecer vista</button><span>Arrastra la lámina o usa flechas, +, - y 0.</span></div></main>' +
        '<aside class="spl-inspector" id="splInspector" aria-label="Ficha científica"></aside>' +
      '</div>' +
      '<section class="spl-compare" id="splCompareTray" aria-label="Comparador de especies"></section>' +
      '<footer class="spl-footer"><p id="splCriterion"><strong>Criterio:</strong> fósil, reconstrucción e hipótesis no se presentan como equivalentes. Los modelos institucionales se abren en su fuente original.</p><p>Facultad de Ciencias de la Educación, ULPGC · Uso educativo no comercial · <a href="https://creativecommons.org/licenses/by-nc/4.0/deed.es" target="_blank" rel="noopener noreferrer">CC BY-NC 4.0</a></p></footer>' +
      '<div class="sr-only" id="splLive" aria-live="polite"></div>' +
    '</div>';
    document.body.appendChild(dialog);

    document.querySelectorAll("[data-paleolab-open]").forEach(function (opener) {
      opener.setAttribute("data-action", "openPaleoLab");
      opener.setAttribute("aria-haspopup", "dialog");
      opener.setAttribute("aria-controls", "splDialog");
    });
    document.addEventListener("click", handleOpenRequest);
    dialog.addEventListener("cancel", function (event) { event.preventDefault(); closeLab(); });
    dialog.addEventListener("close", function () {
      dialog.setAttribute("aria-hidden", "true");
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeLab();
      handleControl(event.target);
    });
    dialog.addEventListener("input", function (event) {
      if (event.target.id === "splSearch") { state.query = event.target.value; renderSpeciesList(); }
      if (event.target.id === "splZoom") { state.zoom = Number(event.target.value) / 100; updatePlateTransform(); }
    });
  }

  function init() {
    loadState();
    if (!speciesById(state.selected)) state.selected = allSpecies()[0] ? allSpecies()[0].id : "";
    createLab();
    loadCore3d();
    window.openPaleoLab = function (trigger) {
      const currentTarget = trigger && trigger.currentTarget ? trigger.currentTarget : document.activeElement;
      openLab({ currentTarget: currentTarget });
      return Boolean(dialog && dialog.open);
    };
    window.paleoLabControl = function (trigger) {
      const direct = trigger && typeof trigger.closest === "function" && trigger.closest("#splDialog") ? trigger : null;
      return handleControl(direct || document.activeElement);
    };
    window.PaleoBotSpeciesLab = {
      open: openLab,
      close: closeLab,
      select: selectSpecies,
      getState: function () { return JSON.parse(JSON.stringify(state)); },
      getCore3dIds: function () { return Object.keys(CORE_3D).slice(); }
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
