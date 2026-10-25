// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
// ════════════════════════════════════════════════════════════════════════
// CLIMA PAGES2K — Estado de la vista
// ════════════════════════════════════════════════════════════════════════

/** Escala temporal activa: 'full' | 'plio' | 'pleisto' | 'late' | 'holocene' */
document.documentElement.dataset.pbClimaModule = 'loading';

let _climaScale = 'full';

/** Capas visibles */
const _climaLayers = { d18o: true, temp: true, mis: true, events: true, taxa: true };

/** Bandera para evitar rerenderizados dobles */
let _climaRendered = false;

// ────────────────────────────────────────────────────────────────────────
// DATASET 1: CENOGRID Benthic δ¹⁸O Stack
// Westerhold, T. et al. (2020). An astronomically dated record of Earth's
// climate and its predictability over the last 66 million years.
// Science 369(6509):1383-1387. DOI: 10.1126/science.aba6853
// Datos NOAA NCEI: https://www.ncei.noaa.gov/access/paleo-search/study/30355
// Unidades: ‰ VPDB (Viena Pee Dee Belemnite). Tiempo: Ma antes del presente.
// Valores más altos → más hielo continental / agua oceánica más fría (glaciar).
// Los valores numéricos son puntos representativos del stack publicado CENOGRID,
// seleccionados para cubrir los principales eventos climáticos del Cenozoico.
// Para análisis de precisión, usar el dataset completo en NOAA NCEI.
// ────────────────────────────────────────────────────────────────────────
const LR04 = [
  // [Ma BP, δ¹⁸O ‰]  — ordenado de más antiguo a más reciente
  [5.30, 3.20],[5.20, 3.10],[5.10, 3.05],[5.00, 2.95],[4.90, 2.90],
  [4.80, 3.00],[4.70, 2.88],[4.60, 2.85],[4.50, 2.92],[4.40, 2.96],
  [4.30, 3.08],[4.20, 3.15],[4.10, 3.12],[4.00, 3.18],[3.90, 3.22],
  [3.80, 3.10],[3.70, 3.05],[3.60, 3.28],[3.50, 3.14],[3.40, 3.20],
  [3.30, 3.30],[3.20, 3.25],[3.10, 3.40],[3.00, 3.35],[2.90, 3.50],
  [2.80, 3.60],[2.70, 3.48],[2.60, 3.70],[2.58, 3.78],[2.50, 3.68],
  [2.40, 3.55],[2.30, 3.72],[2.20, 3.64],[2.10, 3.82],[2.00, 3.75],
  [1.90, 4.00],[1.80, 3.90],[1.70, 4.05],[1.60, 3.88],[1.50, 3.95],
  [1.40, 4.10],[1.30, 4.20],[1.20, 4.05],[1.10, 4.25],[1.00, 4.15],
  [0.90, 4.35],[0.80, 4.42],[0.78, 4.75],[0.70, 4.20],[0.65, 4.55],
  [0.60, 4.18],[0.55, 4.62],[0.50, 4.28],[0.45, 4.58],[0.43, 4.90],
  [0.40, 4.22],[0.35, 4.65],[0.34, 5.02],[0.30, 4.32],[0.25, 4.72],
  [0.24, 5.09],[0.18, 4.35],[0.13, 3.80],[0.12, 5.08],[0.10, 4.22],
  [0.07, 4.60],[0.04, 3.72],[0.02, 3.65],[0.01, 3.60],[0.000, 3.55]
];

// ────────────────────────────────────────────────────────────────────────
// DATASET 2: EPICA Dome C — Temperatura relativa (Î”T °C) — NOAA NCEI 2022
// Extier, T. et al. (2018). On the use of Î´18Oatm for ice core chronology.
// Quaternary Science Reviews 185:244-257. DOI: 10.1016/j.quascirev.2018.02.008
// Composite actualizado en NOAA World Data Service for Paleoclimatology (2022):
// https://www.ncei.noaa.gov/access/paleo-search/study/17839
// Menviel, L.C. et al. (2020). An ice-climate oscillatory framework for
// Dansgaard-Oeschger cycles. Nature Reviews Earth & Environment 1:677-693. DOI: 10.1038/s43017-020-00106-y
// Unidades: °C respecto a media del último milenio CE 1000-1850.
// Rango: 0 – 800 Ka BP. Positivo = más cálido; negativo = más frío.
// ────────────────────────────────────────────────────────────────────────
const EPICA = [
  // [Ka BP, Î”T °C] — ordenado de más antiguo a más reciente
  [800,-9.0],[790,-6.5],[780,-4.8],[770,-7.2],[760,-8.8],
  [750,-4.2],[740,-5.5],[730,-3.5],[720,-7.8],[710,-8.6],
  [700,-4.0],[690,-2.8],[680,-6.5],[670,-7.9],[660,-3.2],
  [650,-1.5],[640,-6.0],[630,-7.5],[620,-3.8],[610,-2.2],
  [600,-6.8],[590,-8.0],[580,-4.5],[570,-3.0],[560,-7.2],
  [550,-8.5],[540,-3.6],[530,-1.8],[520,-5.5],[510,-8.2],
  [500,-4.2],[490,-2.5],[480,-7.5],[470,-8.8],[460,-4.0],
  [450,-1.2],[440,-6.5],[430,-8.8],[424,-9.5],[420,-1.0],
  [410,-5.5],[400,-8.2],[390,-4.2],[380,-2.8],[370,-7.0],
  [360,-9.0],[350,-4.5],[340,-2.0],[330,-6.2],[320,-8.5],
  [310,-3.8],[300,-1.5],[290,-5.8],[280,-8.0],[270,-4.2],
  [260,-2.5],[250,-7.5],[240,-9.2],[230,-3.8],[220,-1.5],
  [210,-5.0],[200,-8.0],[190,-3.5],[180,-2.5],[170,-6.5],
  [160,-8.5],[150,-3.5],[140,-0.5],[130,  1.5],[128,  2.0],
  [120,-3.0],[110,-4.5],[100,-6.8],[90, -8.5],[80, -4.0],
  [70, -2.0],[60, -7.5],[55, -8.8],[50, -3.5],[40, -1.8],
  [30, -6.0],[20, -9.5],[18,-10.0],[14, -5.5],[12, -2.0],
  [10,  0.2],[8,   1.0],[6,   0.5],[4,   0.2],[2,   0.0],
  [1,   0.1],[0,   0.0]
];

// ────────────────────────────────────────────────────────────────────────
// DATASET 3: PAGES 2k Common Era — temperatura media global (Î”T °C)
// PAGES 2k Consortium (2019). Consistent multidecadal variability in global
// temperature reconstructions and simulations over the Common Era.
// Nature Geoscience 12:643-649. DOI: 10.1038/s41561-019-0400-0
// Neukom, R. et al. (2019). No evidence for globally coherent warm and cold
// periods over the preindustrial Common Era.
// Nature 571:550-554. DOI: 10.1038/s41586-019-1401-2
// Ref: CE 1961–1990. Resolución: ~10 años.
// Rango: CE 200 – CE 2000 (edición 2019 — mayor cobertura que 2013).
// ────────────────────────────────────────────────────────────────────────
const PAGES2K = [
  // [año CE, Î”T °C]
  [200,-0.30],[300,-0.20],[400,-0.15],[500,-0.10],[600,-0.05],
  [700, 0.00],[800, 0.10],[900, 0.15],[950, 0.20],[1000,0.10],
  [1100,0.05],[1200,0.00],[1300,-0.30],[1350,-0.40],[1400,-0.50],
  [1450,-0.60],[1500,-0.55],[1550,-0.65],[1600,-0.50],[1650,-0.70],
  [1700,-0.60],[1750,-0.45],[1800,-0.50],[1850,-0.20],[1900,-0.10],
  [1950, 0.10],[1970, 0.20],[1980, 0.35],[1990, 0.45],[2000, 0.60]
];

// ────────────────────────────────────────────────────────────────────────
// DATASET 4: Marine Isotope Stages (MIS) — Railsback et al. 2015 / tabla ICS v2023/09
// Cohen, K.M., Finney, S.C., Gibbard, P.L. & Fan, J.-X. (2013; updated). The ICS
// International Chronostratigraphic Chart (v2023/09). Episodes 36(3):199-204.
// (PB-GH-03: corrige la cita «Cohen et al. 2023, Episodes 46(2)», no localizada.)
// Railsback, L.B. et al. (2015). An optimized scheme of lettered marine isotope
// substages for the last 1.0 million years.
// Quaternary Science Reviews 111:94-106. DOI: 10.1016/j.quascirev.2015.01.012
// stage: número del MIS. warm: true = interglaciar.
// start/end en Ka BP (antes del presente).
// ────────────────────────────────────────────────────────────────────────
const MIS_STAGES = [
  // Cuaternario principal (MIS 1–22)
  { stage:1,  warm:true,  start:14,    end:0,    label:'MIS 1 — Holoceno' },
  { stage:2,  warm:false, start:29,    end:14,   label:'MIS 2 — Último glacial máximo' },
  { stage:3,  warm:true,  start:57,    end:29,   label:'MIS 3 — Interstadial' },
  { stage:4,  warm:false, start:71,    end:57,   label:'MIS 4' },
  { stage:5,  warm:true,  start:130,   end:71,   label:'MIS 5 — Eemiense' },
  { stage:6,  warm:false, start:191,   end:130,  label:'MIS 6 — Penúltimo glacial' },
  { stage:7,  warm:true,  start:243,   end:191,  label:'MIS 7' },
  { stage:8,  warm:false, start:300,   end:243,  label:'MIS 8' },
  { stage:9,  warm:true,  start:337,   end:300,  label:'MIS 9' },
  { stage:10, warm:false, start:374,   end:337,  label:'MIS 10' },
  { stage:11, warm:true,  start:424,   end:374,  label:'MIS 11 — Máximo interglaciar' },
  { stage:12, warm:false, start:478,   end:424,  label:'MIS 12 — Glaciación Elsteriense' },
  { stage:13, warm:true,  start:533,   end:478,  label:'MIS 13' },
  { stage:14, warm:false, start:563,   end:533,  label:'MIS 14' },
  { stage:15, warm:true,  start:621,   end:563,  label:'MIS 15' },
  { stage:16, warm:false, start:676,   end:621,  label:'MIS 16' },
  { stage:17, warm:true,  start:712,   end:676,  label:'MIS 17' },
  { stage:18, warm:false, start:761,   end:712,  label:'MIS 18' },
  { stage:19, warm:true,  start:790,   end:761,  label:'MIS 19' },
  { stage:20, warm:false, start:814,   end:790,  label:'MIS 20' },
  { stage:21, warm:true,  start:866,   end:814,  label:'MIS 21' },
  { stage:22, warm:false, start:900,   end:866,  label:'MIS 22 — Glaciación intensa' },
  // Plioceno tardío (ka)
  { stage:31, warm:true,  start:1081,  end:1014, label:'MIS 31 — Interglaciar intenso' },
  { stage:36, warm:false, start:1200,  end:1140, label:'MIS 36' },
  { stage:41, warm:true,  start:1354,  end:1296, label:'MIS 41' },
  { stage:55, warm:true,  start:1800,  end:1748, label:'MIS 55' },
  { stage:63, warm:true,  start:2100,  end:2048, label:'MIS 63' },
  { stage:'G1',warm:false, start:2600,  end:2540, label:'Inicio glaciaciones NH (MIS G1, ~2,6 Ma)' },
];
// MIS G1: corrección integrada en la definición del array

// ────────────────────────────────────────────────────────────────────────
// DATASET 5: Eventos climáticos clave
// ────────────────────────────────────────────────────────────────────────
const CLIMA_EVENTS = [
  // [Ka BP, etiqueta, color, y_offset_hint]
  { ka: 0.000,   label: 'Hoy',               color: '#1c2b3a', type: 'reference' },
  { ka: 11.7,    label: 'Inicio Holoceno',    color: '#16a34a', type: 'warm' },
  { ka: 20,      label: 'LGM',               color: '#2563eb', type: 'cold', note: 'Último Máximo Glacial — ~20 Ka BP' },
  { ka: 74,      label: 'Toba',              color: '#dc2626', type: 'event', note: 'Supervolcán Toba — posible cuello de botella en H. sapiens' },
  { ka: 125,     label: 'MIS 5e',            color: '#16a34a', type: 'warm', note: 'Último interglaciar (Eemiense) — T media ~1-2°C sobre hoy' },
  { ka: 257,     label: 'MPT final',         color: '#7c3aed', type: 'event', note: 'Fin de la Transición del Pleistoceno Medio (~900 ka)' },
  { ka: 315,     label: 'Jebel Irhoud',      color: '#0a6b49', type: 'hominin', note: 'H. sapiens más antiguos conocidos (Marruecos, ~315 Ka)' },
  { ka: 424,     label: 'MIS 11',            color: '#16a34a', type: 'warm', note: 'Máximo interglaciar — ≥2°C sobre hoy; nivel del mar +6-13 m' },
  { ka: 600,     label: 'Bodo / H. heidelb.', color: '#0e7f65', type: 'hominin', note: 'H. bodoensis / H. heidelbergensis — plena glaciación media' },
  { ka: 780,     label: 'Brunhes–Matuyama', color: '#9333ea', type: 'event', note: 'Inversión del campo magnético terrestre — referencia estratigráfica global' },
  { ka: 900,     label: 'MPT inicio',        color: '#7c3aed', type: 'event', note: 'Inicio Transición Pleistoceno Medio: ciclos de 41 ka→100 ka' },
  { ka: 1800,    label: 'Olduvai',           color: '#0a6b49', type: 'hominin', note: 'Subcrón Olduvai — coincide con primeros Homo fuera de África' },
  { ka: 2580,    label: 'Inicio glaciaciones NH', color: '#2563eb', type: 'cold', note: 'Instauración ciclos glaciales en hemisferio norte — ~2,58 Ma' },
  { ka: 3170,    label: 'Cierre istmo Panamá', color: '#8b5a2b', type: 'tectonica', note: 'Cierre istmo de Panamá — reorganización circulación oceánica global' },
  { ka: 3600,    label: 'Australopithecus',   color: '#0a6b49', type: 'hominin', note: 'Pico de diversidad de Australopithecus — mosaico ambiental plioceno' },
  { ka: 5330,    label: 'Messiniense',        color: '#b98b3f', type: 'tectonica', note: 'Crisis de salinidad messiniense — desecación temporal del Mediterráneo' },
  { ka: 7000,    label: 'Expansión C4',       color: '#6f8f3a', type: 'vegetal', note: 'Expansión global de gramíneas C4 — sabanización progresiva de África' },
  { ka: 14000,   label: 'Proconsul',          color: '#c07800', type: 'hominin', note: 'Primeros hominoideos — bosques tropicales del Mioceno inferior' },
  { ka: 23000,   label: 'Neógeno inicio',     color: '#8b5a2b', type: 'tectonica', note: 'Inicio del Neógeno — clima global más frío que Eoceno/Oligoceno' },
];

// ════════════════════════════════════════════════════════════════════════
// LÓGICA DE RENDERIZADO
// ════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────
// DATASET 6: Eventos Heinrich — capas de iceberg en el Atlántico Norte
// Menviel, L.C. et al. (2020). An ice-climate oscillatory framework for
// Dansgaard-Oeschger cycles. Nature Reviews Earth & Environment 1:677-693.
// DOI: 10.1038/s43017-020-00106-y
// Barker, S. et al. (2022). Persistent influence of precession on northern
// ice sheet variability since the early Pleistocene. Science 376(6596):961-967.
// DOI: 10.1126/science.abm4033
// ────────────────────────────────────────────────────────────────────────
const HEINRICH_EVENTS = [
  { name:'H1', ka:17,  note:'~17 Ka BP — último evento Heinrich antes del Holoceno; colapso Laurentide' },
  { name:'H2', ka:24,  note:'~24 Ka BP — durante LGM; reducción AMOC documentada' },
  { name:'H3', ka:31,  note:'~31 Ka BP — enfriamiento súbito en el Atlántico Norte' },
  { name:'H4', ka:38,  note:'~38 Ka BP — coincide con pico de erupción Campano-Flegreana' },
  { name:'H5', ka:45,  note:'~45 Ka BP — transición a período Denisovano tardío' },
  { name:'H5a',ka:52,  note:'~52 Ka BP — evento frío menor; estadio MIS 3' },
  { name:'H6', ka:60,  note:'~60 Ka BP — período de expansión de H. sapiens fuera de África' },
];

// ────────────────────────────────────────────────────────────────────────
// DATASET 7: Eventos Dansgaard-Oeschger (DO) — oscilaciones milenarias
// Menviel, L.C. et al. (2020). An ice-climate oscillatory framework for
// Dansgaard-Oeschger cycles. Nature Reviews Earth & Environment 1:677-693. DOI: 10.1038/s43017-020-00106-y
// Rasmussen, S.O. et al. (2014, base revisada en uso hasta 2025).
// A stratigraphic framework for abrupt climatic changes during the Last Glacial
// period. Quaternary Science Reviews 106:14-28.
// DOI: 10.1016/j.quascirev.2014.09.007
// Representan calentamientos abruptos de 8-16°C en Groenlandia en décadas.
// ────────────────────────────────────────────────────────────────────────
const DO_EVENTS = [
  { id:1,  ka: 14.7, note:'DO-1 / Bølling-Allerød — calentamiento abrupto +10°C en Groenlandia' },
  { id:3,  ka: 27.8, note:'DO-3 — interstadio breve en pleno LGM' },
  { id:4,  ka: 29.0, note:'DO-4' },
  { id:5,  ka: 32.5, note:'DO-5' },
  { id:6,  ka: 33.7, note:'DO-6' },
  { id:7,  ka: 35.5, note:'DO-7' },
  { id:8,  ka: 38.3, note:'DO-8' },
  { id:9,  ka: 40.2, note:'DO-9' },
  { id:10, ka: 41.8, note:'DO-10' },
  { id:11, ka: 43.5, note:'DO-11' },
  { id:12, ka: 46.9, note:'DO-12' },
  { id:14, ka: 55.0, note:'DO-14' },
  { id:17, ka: 59.4, note:'DO-17 — interstadio notable en MIS 3' },
  { id:19, ka: 72.0, note:'DO-19 — inicio del período de Groenlandia GI-19' },
  { id:20, ka: 76.0, note:'DO-20 — complejo MIS 4/5 temprano' },
  { id:21, ka: 85.0, note:'DO-21' },
  { id:24, ka:107.0, note:'DO-24 — Eemiense tardío' },
];

/** Rangos de cada escala temporal [max_Ka, min_Ka] */
const CLIMA_SCALES = {
  full:     { maxKa: 23000, minKa: 0,   label: '23 Ma',   dataset: 'lr04' },
  plio:     { maxKa: 5300,  minKa: 0,   label: '5,3 Ma',  dataset: 'lr04' },
  pleisto:  { maxKa: 2600,  minKa: 0,   label: '2,6 Ma',  dataset: 'lr04' },
  late:     { maxKa: 800,   minKa: 0,   label: '800 Ka',  dataset: 'epica' },
  holocene: { maxKa: 12,    minKa: 0,   label: '12 Ka',   dataset: 'pages2k' },
};

/**
 * Cambia la escala temporal de la vista climática.
 * @param {'full'|'plio'|'pleisto'|'late'|'holocene'} scale
 * @param {HTMLElement} btn
 */
/**
 * Cambia la escala temporal de la vista climática y actualiza KPIs.
 * @param {'full'|'plio'|'pleisto'|'late'|'holocene'} scale
 * @param {HTMLElement} btn
 */
function setClimaScale(scale, btn) {
  _climaScale = scale;
  document.body.dataset.pbClimaScale = scale;
  document.querySelectorAll('.clima-scale-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');

  // Actualizar KPI de MIS según escala
  const sc = CLIMA_SCALES[scale];
  if (sc) {
    const misCount = MIS_STAGES.filter(m => m.start <= sc.maxKa && m.end >= sc.minKa).length;
    const el = document.getElementById('climaMisCount');
    if (el) el.textContent = `${misCount} MIS en rango`;
  }

  _climaRendered = false;
  renderClimaView();
}

/**
 * Activa/desactiva una capa del gráfico climático.
 * @param {'d18o'|'temp'|'mis'|'events'|'taxa'} layer
 * @param {HTMLElement} btn
 */
function toggleClimaLayer(layer, btn) {
  _climaLayers[layer] = !_climaLayers[layer];
  document.body.dataset.pbClimaLayer = `${layer}:${_climaLayers[layer]}`;
  btn.classList.toggle('on', _climaLayers[layer]);
  btn.setAttribute('aria-pressed', String(_climaLayers[layer]));
  _climaRendered = false;
  renderClimaView();
}

/**
 * Muestra el tooltip flotante del gráfico climático.
 * @param {MouseEvent} evt
 * @param {string} title
 * @param {string} val
 * @param {string} sub
 */
function showClimaTooltip(evt, title, val, sub) {
  const tip = document.getElementById('climaTooltip');
  if (!tip) return;
  document.getElementById('ctTitle').textContent = title;
  document.getElementById('ctVal').textContent   = val;
  document.getElementById('ctSub').textContent   = sub;
  const x = evt.clientX + 14;
  const y = evt.clientY - 40;
  tip.style.left = Math.min(x, window.innerWidth  - 295) + 'px';
  tip.style.top  = Math.max(y, 10) + 'px';
  tip.classList.add('visible');
  tip.removeAttribute('aria-hidden');
}

function hideClimaTooltip() {
  const tip = document.getElementById('climaTooltip');
  if (tip) { tip.classList.remove('visible'); tip.setAttribute('aria-hidden','true'); }
}

function climaTooltipAttrs(title, val, sub) {
  return `data-clima-tip-title="${escapeHtmlAttr(title)}" data-clima-tip-val="${escapeHtmlAttr(val)}" data-clima-tip-sub="${escapeHtmlAttr(sub)}"`;
}

/**
 * Renderiza la visualización completa de la vista Clima PAGES2k.
 * Dibuja: δ¹⁸O LR04, Î”T EPICA, MIS, eventos clave y rangos de homininos.
 */
function renderClimaView() {
  const svg = document.getElementById('climaSvg');
  if (!svg) return;
  if (_climaRendered && svg.innerHTML.trim()) return;

  const sc = CLIMA_SCALES[_climaScale];
  if (!sc) return;

  // ── Dimensiones del canvas ────────────────────────────────────────
  const W      = 1520;
  const LEFT   = 0;    // sin panel de etiquetas fijo — labels en SVG
  const PAD_L  = 18;
  const PAD_R  = 28;
  const PAD_T  = 56;
  const PAD_B  = 52;

  // Alturas de cada banda:
  const H_MIS    = _climaLayers.mis    ? 28  : 0;
  const H_D18O   = _climaLayers.d18o   ? 110 : 0;
  const H_TEMP   = _climaLayers.temp   ? 100 : 0;
  const H_EVENTS = _climaLayers.events ? 36  : 0;
  const H_TAXA   = _climaLayers.taxa   ? 0   : 0; // dinámica

  // Taxones filtrados
  const taxa = _climaLayers.taxa
    ? DB.filter(matchesActiveFilters)
        .map(sp => ({ ...sp, range: getSpeciesTimeRange(sp) }))
        .filter(sp => sp.range.start * 1000 >= sc.minKa && sp.range.end * 1000 <= sc.maxKa * 1.02)
        .sort((a, b) => b.range.start - a.range.start)
    : [];

  const H_TAXA_ACTUAL = taxa.length * 26;
  const TOTAL_H = PAD_T + H_MIS + H_D18O + H_TEMP + H_EVENTS + H_TAXA_ACTUAL + PAD_B;

  // Rangos Y acumulados
  let yMIS    = PAD_T;
  let yD18O   = yMIS    + H_MIS;
  let yTEMP   = yD18O   + H_D18O;
  let yEVENTS = yTEMP   + H_TEMP;
  let yTAXA   = yEVENTS + H_EVENTS;

  const plotW = W - PAD_L - PAD_R;

  /** Convierte Ka BP a coordenada X en el SVG */
  function xKa(ka) {
    return PAD_L + ((sc.maxKa - ka) / (sc.maxKa - sc.minKa)) * plotW;
  }

  svg.setAttribute('viewBox',`0 0 ${W} ${TOTAL_H}`);
  svg.setAttribute('width',  W);
  svg.setAttribute('height', TOTAL_H);

  // ── Gradientes y defs ─────────────────────────────────────────────
  let html = `<defs>
    <linearGradient id="gradD18o" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#2563eb" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="gradTempWarm" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"   stop-color="#c0392b" stop-opacity="0.0"/>
      <stop offset="100%" stop-color="#c0392b" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="gradTempCold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#2563eb" stop-opacity="0.0"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0.55"/>
    </linearGradient>
    <clipPath id="clipD18o"><rect x="${PAD_L}" y="${yD18O}" width="${plotW}" height="${H_D18O}"/></clipPath>
    <clipPath id="clipTemp"><rect x="${PAD_L}" y="${yTEMP}" width="${plotW}" height="${H_TEMP}"/></clipPath>
    <filter id="climaGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  // ── Fondo general ─────────────────────────────────────────────────
  html += `<rect x="0" y="0" width="${W}" height="${TOTAL_H}" fill="#fffdf9" rx="12"/>`;

  // ── Épocas geológicas (fondo de color) ───────────────────────────
  const EPOCHS = [
    { label:'Mioceno',     startKa:23000, endKa:5333, fill:'rgba(192,120,0,0.06)' },
    { label:'Plioceno',    startKa:5333,  endKa:2580, fill:'rgba(14,127,101,0.06)' },
    { label:'Pleistoceno', startKa:2580,  endKa:11.7, fill:'rgba(26,79,160,0.05)' },
    { label:'Holoceno',    startKa:11.7,  endKa:0,    fill:'rgba(28,43,58,0.04)' },
  ];
  EPOCHS.forEach(ep => {
    if (ep.endKa > sc.maxKa || ep.startKa < sc.minKa) return;
    const x1 = xKa(Math.min(ep.startKa, sc.maxKa));
    const x2 = xKa(Math.max(ep.endKa,   sc.minKa));
    html += `<rect x="${x1}" y="${PAD_T}" width="${x2-x1}" height="${TOTAL_H-PAD_T-PAD_B}" fill="${ep.fill}"/>`;
    html += `<text x="${(x1+x2)/2}" y="20" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="#a0957e" font-weight="700">${ep.label}</text>`;
  });

  // ── Grid vertical y ticks de tiempo ──────────────────────────────
  const TICKS_MAP = {
    full:     [20000,15000,10000,7000,5000,3000,2000,1000,500,100,0],
    plio:     [5000,4000,3000,2500,2000,1500,1000,500,200,0],
    pleisto:  [2500,2000,1500,1000,700,500,300,100,0],
    late:     [800,700,600,500,400,300,200,100,50,0],
    holocene: [12,10,8,6,4,2,0],
  };
  const ticks = TICKS_MAP[_climaScale] || [];
  ticks.forEach(ka => {
    if (ka > sc.maxKa || ka < sc.minKa) return;
    const x = xKa(ka);
    html += `<line x1="${x}" y1="${PAD_T}" x2="${x}" y2="${TOTAL_H-PAD_B}" stroke="#ddd8d0" stroke-width="0.8" stroke-dasharray="3 4"/>`;
    const label = ka === 0 ? 'Hoy' : ka >= 1000 ? `${(ka/1000).toFixed(ka%1000===0?0:1)} Ma` : `${ka} Ka`;
    html += `<text x="${x}" y="${TOTAL_H - PAD_B + 16}" text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="#9aa0ab">${label}</text>`;
  });

  // Eje de tiempo inferior
  html += `<line x1="${PAD_L}" y1="${TOTAL_H-PAD_B}" x2="${PAD_L+plotW}" y2="${TOTAL_H-PAD_B}" stroke="#c8c0b4" stroke-width="1.2"/>`;
  html += `<text x="${PAD_L + plotW/2}" y="${TOTAL_H - 10}" text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="#9aa0ab">← Más antiguo · Tiempo (Ka antes del presente) · Más reciente →</text>`;

  // ── MIS — Estadios Isotópicos Marinos ─────────────────────────────
  if (_climaLayers.mis && H_MIS > 0) {
    html += `<text x="${PAD_L+6}" y="${yMIS+10}" font-family="var(--font-mono)" font-size="9.5" fill="#7c3aed" font-weight="800">MIS</text>`;
    MIS_STAGES.forEach(mis => {
      const startKa = mis.start;
      const endKa   = mis.end;
      if (startKa < sc.minKa || endKa > sc.maxKa * 1.05) return;
      const x1 = xKa(Math.min(startKa, sc.maxKa));
      const x2 = xKa(Math.max(endKa,   sc.minKa));
      const fill   = mis.warm ? 'rgba(22,163,74,0.28)' : 'rgba(124,58,237,0.22)';
      const stroke = mis.warm ? 'rgba(22,163,74,0.6)'  : 'rgba(124,58,237,0.5)';
      html += `<rect x="${x1}" y="${yMIS+2}" width="${Math.max(x2-x1,2)}" height="${H_MIS-4}" rx="3"
               fill="${fill}" stroke="${stroke}" stroke-width="0.7"
               style="cursor:pointer"
               ${climaTooltipAttrs(`Estadio Isotópico Marino ${mis.stage}`, mis.warm?'🌿 Interglaciar cálido':'❄ Glaciar frío', mis.label || '')}/>`;
      if (x2 - x1 > 28) {
        html += `<text x="${(x1+x2)/2}" y="${yMIS+16}" text-anchor="middle" font-family="var(--font-mono)" font-size="8.5" fill="${mis.warm?'#15803d':'#6d28d9'}" font-weight="800">${mis.stage}</text>`;
      }
    });
  }

  // ── δ¹⁸O LR04 ────────────────────────────────────────────────────
  if (_climaLayers.d18o && H_D18O > 0) {
    // Etiqueta del panel
    html += `<text x="${PAD_L+8}" y="${yD18O+14}" font-family="var(--font-mono)" font-size="9.5" fill="#2563eb" font-weight="800">δ¹⁸O LR04 (‰)</text>`;

    // Filtrar LR04 al rango de escala
    const lr04Filtered = LR04.filter(([ma]) => {
      const ka = ma * 1000;
      return ka >= sc.minKa && ka <= sc.maxKa;
    });

    if (lr04Filtered.length > 1) {
      // Rango de δ¹⁸O visible
      const vals   = lr04Filtered.map(d => d[1]);
      const minV   = Math.min(...vals) - 0.2;
      const maxV   = Math.max(...vals) + 0.2;
      const range  = maxV - minV || 1;

      function yD18oVal(v) {
        return yD18O + H_D18O - ((v - minV) / range) * (H_D18O - 8) - 4;
      }

      // Grid horizontal de δ¹⁸O
      [3.0, 3.5, 4.0, 4.5, 5.0].forEach(v => {
        if (v < minV || v > maxV) return;
        const y = yD18oVal(v);
        html += `<line x1="${PAD_L}" x2="${PAD_L+plotW}" y1="${y}" y2="${y}" stroke="#dce8fb" stroke-width="0.7"/>`;
        html += `<text x="${PAD_L+plotW-2}" y="${y-2}" text-anchor="end" font-family="var(--font-mono)" font-size="8" fill="#6b93cf">${v}‰</text>`;
      });

      // Área rellena (clip)
      let areaPath = `M ${xKa(lr04Filtered[0][0]*1000)} ${yD18O + H_D18O}`;
      areaPath += ` L ${xKa(lr04Filtered[0][0]*1000)} ${yD18oVal(lr04Filtered[0][1])}`;
      lr04Filtered.forEach(([ma,v]) => {
        areaPath += ` L ${xKa(ma*1000)} ${yD18oVal(v)}`;
      });
      areaPath += ` L ${xKa(lr04Filtered[lr04Filtered.length-1][0]*1000)} ${yD18O + H_D18O} Z`;
      html += `<path d="${areaPath}" fill="url(#gradD18o)" clip-path="url(#clipD18o)" opacity="0.6"/>`;

      // Línea
      let linePath = '';
      lr04Filtered.forEach(([ma,v], i) => {
        linePath += (i === 0 ? 'M' : 'L') + ` ${xKa(ma*1000)} ${yD18oVal(v)} `;
      });
      html += `<path d="${linePath}" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round" clip-path="url(#clipD18o)"/>`;

      // Puntos interactivos (cada 5 puntos para no saturar)
      lr04Filtered.filter((_,i)=> i%5===0).forEach(([ma,v]) => {
        const px = xKa(ma * 1000);
        const py = yD18oVal(v);
        const ka = ma * 1000;
        const label = ka >= 1000 ? `${(ka/1000).toFixed(1)} Ma` : `${Math.round(ka)} Ka`;
        html += `<circle cx="${px}" cy="${py}" r="3.5" fill="white" stroke="#2563eb" stroke-width="1.5"
                 style="cursor:crosshair"
                 ${climaTooltipAttrs(`δ¹⁸O LR04 · ${label}`, `${v.toFixed(2)} ‰ VPDB`, v > 4.0 ? '❄ Período glaciar' : v < 3.2 ? '🌿 Período cálido' : 'Transición climática')}/>`;
      });
    }
  }

  // ── Î”T EPICA Dome C ──────────────────────────────────────────────
  if (_climaLayers.temp && H_TEMP > 0 && sc.maxKa <= 25000) {
    html += `<text x="${PAD_L+8}" y="${yTEMP+14}" font-family="var(--font-mono)" font-size="9.5" fill="#c0392b" font-weight="800">Î”T EPICA °C</text>`;

    // Datos según escala
    let tempData;
    if (_climaScale === 'holocene') {
      // Usar PAGES 2k para Holoceno — convertir año CE a Ka BP
      tempData = PAGES2K.map(([ce, dt]) => [12 - ce/1000, dt]);
    } else {
      tempData = EPICA.filter(([ka]) => ka >= sc.minKa && ka <= sc.maxKa);
    }

    if (tempData.length > 1) {
      const temps  = tempData.map(d => d[1]);
      const minT   = Math.min(...temps) - 0.5;
      const maxT   = Math.max(...temps) + 0.5;
      const rangeT = maxT - minT || 1;
      const midY   = yTEMP + H_TEMP / 2;

      function yTempVal(t) {
        return yTEMP + H_TEMP - ((t - minT) / rangeT) * (H_TEMP - 8) - 4;
      }

      // Línea de referencia 0°C
      const y0 = yTempVal(0);
      html += `<line x1="${PAD_L}" x2="${PAD_L+plotW}" y1="${y0}" y2="${y0}" stroke="#f87171" stroke-width="0.9" stroke-dasharray="5 3"/>`;
      html += `<text x="${PAD_L+plotW-2}" y="${y0-3}" text-anchor="end" font-family="var(--font-mono)" font-size="8" fill="#f87171">0°C ref.</text>`;

      // Área bicolor (cálido arriba, frío abajo)
      let warmArea = `M ${xKa(tempData[0][0])} ${y0}`;
      let coldArea = `M ${xKa(tempData[0][0])} ${y0}`;

      tempData.forEach(([ka, t]) => {
        const x = xKa(ka);
        const y = yTempVal(t);
        warmArea += ` L ${x} ${t >= 0 ? y : y0}`;
        coldArea += ` L ${x} ${t <= 0 ? y : y0}`;
      });
      warmArea += ` L ${xKa(tempData[tempData.length-1][0])} ${y0} Z`;
      coldArea += ` L ${xKa(tempData[tempData.length-1][0])} ${y0} Z`;

      html += `<path d="${warmArea}" fill="url(#gradTempWarm)" clip-path="url(#clipTemp)" opacity="0.5"/>`;
      html += `<path d="${coldArea}" fill="url(#gradTempCold)" clip-path="url(#clipTemp)" opacity="0.55"/>`;

      // Línea de temperatura
      let tPath = '';
      tempData.forEach(([ka,t], i) => {
        tPath += (i===0?'M':'L') + ` ${xKa(ka)} ${yTempVal(t)} `;
      });
      html += `<path d="${tPath}" fill="none" stroke="#c0392b" stroke-width="1.7" stroke-linejoin="round" clip-path="url(#clipTemp)"/>`;

      // Puntos interactivos
      tempData.filter((_,i) => i % 4 === 0).forEach(([ka,t]) => {
        const label = ka >= 1 ? `${ka.toFixed(0)} Ka BP` : `${(ka*1000).toFixed(0)} años BP`;
        const desc  = t >  1.5 ? '🌡 Período significativamente cálido'
                    : t < -6   ? '❄ Glacial intenso'
                    : t < -3   ? '❄ Período glacial'
                    : '~ Temperatura cercana al nivel actual';
        html += `<circle cx="${xKa(ka)}" cy="${yTempVal(t)}" r="3" fill="white" stroke="${t>=0?'#c0392b':'#2563eb'}" stroke-width="1.4"
                 style="cursor:crosshair"
                 ${climaTooltipAttrs(`Î”T EPICA · ${label}`, `${t>0?'+':''}${t.toFixed(1)} °C`, desc)}/>`;
      });

      // Etiquetas de escala eje Y
      [-10,-6,-3,0,2].forEach(t => {
        if (t < minT || t > maxT) return;
        html += `<text x="${PAD_L+plotW-2}" y="${yTempVal(t)-3}" text-anchor="end" font-family="var(--font-mono)" font-size="8" fill="${t>=0?'#c0392b':'#2563eb'}">${t>0?'+':''}${t}°</text>`;
      });
    }
  }

  // ── Eventos clave ────────────────────────────────────────────────
  if (_climaLayers.events && H_EVENTS > 0) {
    const eventsInRange = CLIMA_EVENTS.filter(ev => ev.ka >= sc.minKa && ev.ka <= sc.maxKa);
    html += `<text x="${PAD_L+8}" y="${yEVENTS+14}" font-family="var(--font-mono)" font-size="9.5" fill="#d97706" font-weight="800">Eventos clave</text>`;
    eventsInRange.forEach(ev => {
      const x = xKa(ev.ka);
      html += `<line x1="${x}" y1="${PAD_T}" x2="${x}" y2="${yEVENTS+H_EVENTS-2}" stroke="${ev.color}" stroke-width="1" stroke-dasharray="2 3" opacity="0.6"/>`;
      html += `<circle cx="${x}" cy="${yEVENTS+18}" r="5" fill="${ev.color}" opacity="0.85"
               style="cursor:pointer"
               ${climaTooltipAttrs(ev.label, ev.ka >= 1000 ? (ev.ka/1000).toFixed(1)+' Ma BP' : ev.ka+' Ka BP', ev.note || '')}/>`;
      if (eventsInRange.length < 10) {
        html += `<text x="${x}" y="${yEVENTS+32}" text-anchor="middle" font-family="var(--font-mono)" font-size="8.5" fill="${ev.color}" font-weight="700">${ev.label.substring(0,12)}</text>`;
      }
    });
  }

  // ── Heinrich y D-O — sólo visible en escala 'late' (≤800 Ka) ───────
  if (_climaLayers.events && sc.maxKa <= 800 && H_EVENTS > 0) {
    // Eventos Heinrich
    HEINRICH_EVENTS.filter(ev => ev.ka >= sc.minKa && ev.ka <= sc.maxKa).forEach(ev => {
      const x = xKa(ev.ka);
      html += `<rect x="${x-2}" y="${yTEMP}" width="4" height="${H_TEMP}" fill="#1e3a5f" opacity="0.25"/>`;
      html += `<text x="${x}" y="${yTEMP - 4}" text-anchor="middle" font-family="var(--font-mono)" font-size="8.5" fill="#1e3a5f" font-weight="800"
               style="cursor:pointer"
               ${climaTooltipAttrs(`Evento Heinrich ${ev.name}`, `${ev.ka} Ka BP`, ev.note)}>${ev.name}</text>`;
    });

    // Eventos D-O — triángulos pequeños en el eje de temperatura
    if (H_TEMP > 0 && sc.maxKa <= 800) {
      DO_EVENTS.filter(ev => ev.ka >= sc.minKa && ev.ka <= sc.maxKa).forEach(ev => {
        const x = xKa(ev.ka);
        html += `<polygon points="${x},${yTEMP + 2} ${x-4},${yTEMP + 12} ${x+4},${yTEMP + 12}" fill="#f59e0b" opacity="0.7"
                 style="cursor:pointer"
                 ${climaTooltipAttrs(`D-O ${ev.id}`, `${ev.ka} Ka BP`, ev.note)}/>`;
      });
    }
  }

  // ── Taxones homininos ────────────────────────────────────────────
  if (_climaLayers.taxa && taxa.length > 0) {
    html += `<text x="${PAD_L+8}" y="${yTAXA+16}" font-family="var(--font-mono)" font-size="9.5" fill="var(--accent)" font-weight="800">Homininos filtrados (${taxa.length})</text>`;
    html += `<line x1="${PAD_L}" y1="${yTAXA}" x2="${PAD_L+plotW}" y2="${yTAXA}" stroke="#ddd8d0" stroke-width="0.8"/>`;

    taxa.forEach((sp, i) => {
      const rowY   = yTAXA + 22 + i * 26;
      const color  = CLADE_COLORS[sp.clado] || '#888';
      const startKa = sp.range.start * 1000;
      const endKa   = sp.range.end   * 1000;
      const x1 = xKa(Math.min(startKa, sc.maxKa));
      const x2 = xKa(Math.max(endKa,   sc.minKa));
      const barW = Math.max(x2 - x1, 8);
      const debated = sp.estado === 'debatida' || sp.estado === 'revision';

      // Etiqueta izquierda solo si hay espacio
      if (PAD_L + 220 < x1) {
        html += `<text x="${x1 - 5}" y="${rowY + 7}" text-anchor="end" font-family="var(--font-sans)" font-size="10.5" font-style="italic" fill="#1c2b3a">${sp.nombre}</text>`;
      } else {
        html += `<text x="${x2 + 6}" y="${rowY + 7}" font-family="var(--font-sans)" font-size="10.5" font-style="italic" fill="#1c2b3a">${sp.nombre}</text>`;
      }

      // Barra temporal
      html += `<g style="cursor:pointer"
               data-open-species="${escapeHtmlAttr(sp.id)}"
               role="button" tabindex="0" aria-label="Ver ficha de ${escapeHtmlAttr(sp.nombre)}"
               ${climaTooltipAttrs(sp.nombre, formatMaRange(sp.range.start, sp.range.end), `${(CLADE_NAMES[sp.clado]||sp.clado)} · Clic para abrir la ficha`)}>
        <rect x="${x1}" y="${rowY-2}" width="${barW}" height="18" rx="9"
              fill="${color}" opacity="${debated?'0.45':'0.88'}"
              stroke="${color}" stroke-width="1.2"
              ${debated?'stroke-dasharray="4 3"':''}/>
        <circle cx="${x1}" cy="${rowY+7}" r="4" fill="${color}" stroke="white" stroke-width="1.5"/>
      </g>`;
    });
  } else if (_climaLayers.taxa) {
    html += `<text x="${PAD_L + plotW/2}" y="${yTAXA + 30}" text-anchor="middle" font-family="var(--font-mono)" font-size="12" fill="#8a96a6">Sin taxones visibles para esta escala temporal y filtros activos</text>`;
  }

  svg.innerHTML = html;
  _climaRendered = true;
}

window.setClimaScale = setClimaScale;
window.toggleClimaLayer = toggleClimaLayer;
window.renderClimaView = renderClimaView;
document.documentElement.dataset.pbClimaModule = 'ready';
