// R91-P4: restaurado de assets/css/00-core/036-style.css (extracción errónea del monolito,
// #paleobot-v66-fauna, v66 M4). Adaptado a la CSP: sin <style> inyectado ni atributos style=.
// Correcciones científicas R91 documentadas en CHANGELOG_R91.md.
(function PaleoBotV66Fauna() {
  'use strict';

  const DEBUG = typeof window.__PALEOBOT_DEBUG !== 'undefined' && window.__PALEOBOT_DEBUG;
  const log   = DEBUG ? console.log.bind(console,  '[PB66-Fauna]') : () => {};
  const warn  = DEBUG ? console.warn.bind(console, '[PB66-Fauna]') : () => {};

  /* ════════════════════════════════════════════════════════════════════════
     A. BASE DE DATOS DE FAUNA ASOCIADA
     Fuentes principales (DOI en comentarios inline):
       · Bobe & Behrensmeyer 2004 (DOI:10.1016/j.jhevol.2004.07.009)
       · Reed 1997 — Hominid paleoenvironments (DOI:10.1002/(SICI)1096-8644)
       · Faith 2011 — Late Pleistocene Africa (DOI:10.1016/j.quascirev.2011.01.005)
       · Parfitt et al. 2005 — Pakefield (DOI:10.1038/nature04117)
       · Agustí & Antón 2002 — Mammoths, Sabertooths and Hominids
       · Turner & Antón 2004 — Evolving Eden
       · Brugal & Denys 1997 (Ed.) — African Suidae fossil record
     ════════════════════════════════════════════════════════════════════════ */
  const FAUNA_DB = {

    /* ── Mioceno basal ────────────────────────────────────────────── */
    koru_rusinga: {
      taxa: ['Ekembo nyanzae (antes Proconsul nyanzae)','Limnopithecus legetet','Dendropithecus macinnesi',
             'Rhinocerotidae indet.','Anthracotheriidae','Lorisidae y Galagidae','Hyaenodonta'],
      bioma: 'Bosque cerrado tropical',
      nota: 'Fauna de bosque del Mioceno inferior; diversidad de primates catarrinos.',
      // Pickford 1986; Leakey & Leakey 1987
      riqueza: 'media'
    },
    moroto_ii: {
      taxa: ['Morotopithecus bishopi','Limnopithecus','Bovidae basales',
             'Suidae primitivos','Proboscidea'],
      bioma: 'Mosaico boscoso',
      nota: 'Conjunto restringido; Morotopithecus se discute por indicios de postura ortógrada (vértebra lumbar), no de bipedismo.',
      riqueza: 'baja'
    },
    saint_gaudens: {
      taxa: ['Dryopithecus fontani','Ursavus','Cervidae','Suidae','Proboscidea'],
      bioma: 'Bosque y matorral templado-cálido',
      nota: 'Mioceno medio europeo (MN7+8); referencia para la radiación de hominoideos europeos.',
      // Begun 2002 — European Miocene hominoids
      riqueza: 'media'
    },
    can_mata: {
      taxa: ['Pierolapithecus catalaunicus','Anoiapithecus brevirostris',
             'Dryopithecus fontani','Bovidae','Suidae','Cervidae'],
      bioma: 'Bosque subtropical',
      nota: 'Serie de referencia del ICP para hominoideos del Mioceno medio ibérico; fauna acompañante diversa.',
      // Moyà-Solà et al. 2004 (DOI:10.1126/science.1096429)
      riqueza: 'alta'
    },
    nakali: {
      taxa: ['Nakalipithecus nakayamai','Bovidae','Suidae','Proboscidea'],
      bioma: 'Sabana boscosa',
      nota: 'Mioceno tardío africano; pocos taxa documentados.',
      riqueza: 'baja'
    },
    chorora: {
      taxa: ['Chororapithecus abyssinicus','Bovidae','Rhinocerotidae'],
      bioma: 'Mosaico húmedo',
      nota: 'Registro fragmentario; propuesto como miembro temprano del linaje del gorila (Suwa et al., 2007) [DEBATIDO].',
      riqueza: 'baja'
    },
    pyrgos_azmaka: {
      taxa: ['Graecopithecus freybergi','Bovidae','Cervidae',
             'Hipparion','Proboscidea'],
      bioma: 'Sabana mediterránea',
      nota: 'Propuesto como homínino por Fuss et al. (2017) [DEBATIDO]; contexto de sabana seca.',
      // Fuss et al. 2017 (DOI:10.1371/journal.pone.0177127)
      riqueza: 'media'
    },

    /* ── Mioceno tardío – Plioceno temprano ───────────────────────── */
    toros_menalla: {
      taxa: ['Anthracotheriidae','Bovidae','Suidae','Hippopotamidae',
             'Colobinae','Proboscidea','Reptilia acuáticos'],
      bioma: 'Delta lacustre y galería forestal',
      nota: 'Asociación de lago/delta; contexto de Sahelanthropus (Brunet et al. 2002).',
      // Vignaud et al. 2002 (DOI:10.1038/nature00879)
      riqueza: 'alta'
    },
    tugen_hills: {
      taxa: ['Bovidae','Suidae','Proboscidea','Hippopotamidae','Carnivora',
             'Cercopithecidae'],
      bioma: 'Ribera lacustre y galería forestal',
      nota: 'Ambiente ribereño-lacustre; contexto de Orrorin (Senut et al. 2001).',
      riqueza: 'media'
    },
    middle_awash: {
      taxa: ['Bovidae','Suidae','Equidae','Cercopithecidae','Proboscidea',
             'Hippopotamidae','Carnivora'],
      bioma: 'Mosaico lacustre y sabana',
      nota: 'Secuencia de larga duración, no continua (Mioceno tardío–Pleistoceno); contexto de Ardipithecus, Au. garhi y H. sapiens idaltu.',
      // Bobe & Behrensmeyer 2004 (DOI:10.1016/j.jhevol.2004.07.009)
      riqueza: 'muy alta'
    },
    kanapoi_allia_bay: {
      taxa: ['Bovidae','Suidae','Equidae','Cercopithecidae Colobinae',
             'Hippopotamidae','Carnivora','Testudines de agua dulce'],
      bioma: 'Ribera de lago',
      nota: 'Plioceno inferior (ca. 4,2–3,9 Ma); contexto de Au. anamensis (Leakey et al., 1995).',
      riqueza: 'media'
    },
    hadar_dikika: {
      taxa: ['Bovidae (Tragelaphus, Reduncinae)','Equidae (Hipparion)',
             'Suidae (Kolpochoerus)','Cercopithecidae','Crocodylidae',
             'Hippopotamidae','Carnivora (Megantereon)'],
      bioma: 'Mosaico ribereño-sabana abierta',
      nota: 'Fauna de referencia del Plioceno afar; contexto de A. afarensis Lucy.',
      // Reed 1997; Kappelman et al. 1997
      riqueza: 'muy alta'
    },
    woranso_mille: {
      taxa: ['Bovidae','Suidae','Cercopithecidae','Carnivora','Hippopotamidae'],
      bioma: 'Sabana con galería riparia',
      nota: 'Fauna similar a Hadar; contexto de Australopithecus deyiremeda.',
      riqueza: 'media'
    },
    ledi_geraru: {
      taxa: ['Bovidae (predominio de pastadores C4)','Suidae','Cercopithecidae',
             'Hippopotamidae','Carnivora'],
      bioma: 'Sabana abierta con C4',
      nota: 'Fauna del Plioceno final; contexto de la mandíbula LD 350-1 (Homo, ca. 2,8 Ma).',
      // DiMaggio et al. 2015 (DOI:10.1126/science.aaa1343)
      riqueza: 'media'
    },
    koro_toro: {
      taxa: ['Bovidae','Suidae','Equidae','Hippopotamidae','Proboscidea'],
      bioma: 'Lago-sabana',
      nota: 'Contexto de Australopithecus bahrelghazali, primer australopiteco descrito al oeste del Rift [DEBATIDO: validez del taxón].',
      riqueza: 'media'
    },
    west_turkana_lomekwi: {
      taxa: ['Cercopithecidae','Bovidae','Suidae','Hippopotamidae','Carnivora'],
      bioma: 'Ribera lacustre con bosque',
      nota: 'Contexto de Kenyanthropus platyops; industria lomekwiense (ca. 3,3 Ma).',
      riqueza: 'media'
    },

    /* ── Plioceno tardío / Pleistoceno temprano ───────────────────── */
    sterkfontein: {
      taxa: ['Cercopithecidae (Parapapio)','Bovidae','Equidae','Suidae',
             'Carnivora (Dinofelis, Chasmaporthetes)','Testudines','Microfauna'],
      bioma: 'Matorral y bosque semiarido',
      nota: 'Fauna de cueva; Brain (1981) propuso a Dinofelis como depredador de australopitecos.',
      // Brain 1981 — The Hunters or the Hunted?
      riqueza: 'alta'
    },
    bouri: {
      taxa: ['Bovidae','Equidae','Hippopotamidae','Bovidae con marcas de corte',
             'Cercopithecidae'],
      bioma: 'Sabana húmeda',
      nota: 'Huesos con marcas de corte de herramientas; contexto de Australopithecus garhi.',
      riqueza: 'media'
    },
    malapa: {
      taxa: ['Cercopithecidae','Carnivora (félidos e hiénidos)',
             'Equidae','Bovidae','Microfauna','Reptilia'],
      bioma: 'Cueva con paleosuelo kárstico',
      nota: 'Preservación excepcional; contexto de Au. sediba (Berger et al., 2010).',
      // Dirks et al. 2010 (DOI:10.1126/science.1184950)
      riqueza: 'alta'
    },
    omo_olduvai: {
      taxa: ['Equidae (hiparioninos, Equus)','Bovidae Alcelaphinae','Suidae (Kolpochoerus)',
             'Carnivora (Dinofelis, Panthera)','Proboscidea','Cercopithecidae',
             'Hippopotamidae','Crocodylidae'],
      bioma: 'Mosaico lacustre, sabana y galería riparia',
      nota: 'Conjunto de referencia del Plioceno-Pleistoceno africano; industria Olduvayense.',
      // Bobe & Behrensmeyer 2004; Leakey 1971
      riqueza: 'muy alta'
    },
    swartkrans_kromdraai: {
      taxa: ['Cercopithecidae (Theropithecus, Papio)','Carnivora (Dinofelis, Megantereon)',
             'Bovidae','Suidae','Testudines','Microfauna'],
      bioma: 'Matorral semiárido y cueva',
      nota: 'Carnívoros como contexto tafonómico de Paranthropus robustus.',
      // Brain 1981; Pickering et al. 2004
      riqueza: 'alta'
    },
    koobi_fora: {
      taxa: ['Cercopithecidae (Theropithecus oswaldi, Colobus)','Bovidae Reduncinae',
             'Equidae','Suidae (Kolpochoerus, Metridiochoerus)','Hippopotamidae',
             'Proboscidea (Elephas recki)','Carnivora','Crocodylidae'],
      bioma: 'Ribera de lago tropical con sabana',
      nota: 'Fauna de referencia del Este africano del Pleistoceno inferior; contexto de H. habilis, H. rudolfensis, H. erectus.',
      // Bobe & Behrensmeyer 2004; Harris 1983
      riqueza: 'muy alta'
    },

    /* ── Pleistoceno temprano-medio: dispersión OoA ───────────────── */
    dmanisi: {
      taxa: ['Megantereon cultridens','Homotherium crenatidens','Pachycrocuta brevirostris',
             'Cervidae','Equus stenonis','Gazella borbonica',
             'Bovidae','Camelidae'],
      bioma: 'Sabana templada euroasiática',
      nota: 'Depósito euroasiático clave (ca. 1,8 Ma); fauna de transición Plio-Pleistocena.',
      // Vekua et al. 2002 (DOI:10.1126/science.1077181); Lordkipanidze et al. 2007
      riqueza: 'alta'
    },
    java: {
      taxa: ['Stegodon trigonocephalus','Elephas hysudrindicus','Rhinoceros sondaicus',
             'Hexaprotodon','Axis lydekkeri','Bibos palaeosondaicus',
             'Geochelone','Crocodylidae'],
      bioma: 'Selva tropical y sabana insular',
      nota: 'Lista combinada de Trinil/Sangiran (Pleistoceno inferior-medio) y Ngandong (ca. 117–108 ka), faunas distintas; contexto de Homo erectus.',
      // von Koenigswald 1956; Dennell & Roebroeks 2005
      riqueza: 'alta'
    },
    atapuerca: {
      taxa: ['Ursus deningeri','Cervus elaphus','Equus ferus','Bison priscus',
             'Stephanorhinus hundheimensis','Hippopotamus antiquus',
             'Canis lupus mosbachensis','Lynx pardina spelaea','Microtus arvalis'],
      bioma: 'Bosque templado con praderas',
      nota: 'Lista compuesta de niveles distintos (TD6 «Aurora», Pleistoceno inferior; Sima de los Huesos y TD10, Pleistoceno medio); no es una asociación única.',
      // Bermúdez de Castro et al. 1997 (DOI:10.1126/science.276.5317.1392)
      riqueza: 'muy alta'
    },
    sima_elefante_te7: {
      taxa: ['Ursus dolinensis','Cervidae indet.','Equus altidens',
             'Stephanorhinus etruscus','Bovidae','Lepus','Arvicolinae'],
      bioma: 'Bosque frío templado',
      nota: 'Niveles TE7–TE9: entre los restos homininos más antiguos de Europa occidental (Pleistoceno inferior, ca. 1,4–1,1 Ma).',
      // Carbonell et al. 2008 (DOI:10.1038/nature06372)
      riqueza: 'media'
    },
    ceprano: {
      taxa: ['Cervidae','Bovidae','Equidae','Palaeoloxodon antiquus'],
      bioma: 'Bosque mediterráneo interglacial',
      nota: 'Contexto sedimentario limitado; fauna inferida por correlación.',
      riqueza: 'baja'
    },
    mauer: {
      taxa: ['Palaeoloxodon antiquus','Stephanorhinus kirchbergensis','Hippopotamus antiquus',
             'Cervus elaphus','Equus mosbachensis','Bovini','Ursidae'],
      bioma: 'Bosque ribereño cálido',
      nota: 'Interglaciar del Pleistoceno medio (ca. 609 ± 40 ka; Wagner et al., 2010); contexto de la mandíbula holotipo de Homo heidelbergensis.',
      // Roebroeks & Tuffreau 1999
      riqueza: 'alta'
    },
    bodo_dar: {
      taxa: ['Hippopotamus gorgops','Equidae','Bovidae','Cercopithecidae',
             'Carnivora','Elephantidae'],
      bioma: 'Ribera lacustre africana',
      nota: 'Contexto del cráneo Bodo 1 (H. bodoensis [DEBATIDO] / H. rhodesiensis); fauna del Pleistoceno medio.',
      riqueza: 'media'
    },
    kabwe: {
      taxa: ['Equus capensis','Hippopotamus amphibius','Ceratotherium simum',
             'Syncerus caffer','Bovidae','Carnivora'],
      bioma: 'Sabana-mosaico',
      nota: 'Contexto minero; fauna del Pleistoceno medio africano.',
      riqueza: 'media'
    },

    /* ── Pleistoceno tardío ───────────────────────────────────────── */
    florisbad: {
      taxa: ['Equus capensis','Megalotragus','Pelorovis antiquus',
             'Hippopotamus amphibius','Ceratotherium simum','Lycaon pictus'],
      bioma: 'Sabana con manantial',
      nota: 'Fauna florisbadiense del Pleistoceno medio-superior; contexto de la calvaria de Florisbad (H. helmei [DEBATIDO]).',
      // Grün et al. 1996 (DOI:10.1016/0277-3791(95)00046-1)
      riqueza: 'media'
    },
    rising_star: {
      taxa: ['Micromammalia de cueva (roedores, Insectivora)','Bovidae pequeños',
             'Lepus','Carnivora pequeña','Reptilia'],
      bioma: 'Sistema cavernario con aislamiento',
      nota: 'Poca megafauna. La hipótesis de depósito intencional o enterramiento por H. naledi está [DEBATIDO].',
      // Berger et al. 2015 (DOI:10.7554/eLife.09560)
      riqueza: 'baja'
    },
    jebel_irhoud_site: {
      taxa: ['Gazella dorcas','Equus','Alcelaphus buselaphus','Phacochoerus',
             'Carnivora norteafricana (Acinonyx, Canis)','Lepus'],
      bioma: 'Estepa árida y sabana mediterránea',
      nota: 'Restos más antiguos atribuidos a Homo sapiens (315 ± 34 ka; Richter et al., 2017).',
      // Hublin et al. 2017 (DOI:10.1038/nature22336)
      riqueza: 'media'
    },
    blombos_cave: {
      taxa: ['Arctocephalus pusillus','Delphinidae','Peces marinos','Moluscos marinos',
             'Bovidae','Lepus'],
      bioma: 'Costa y dunas sudafricanas',
      nota: 'Recursos marinos abundantes; ocre grabado y dibujo con ocre (ca. 73 ka; Henshilwood et al., 2018).',
      // Henshilwood et al. 2002 (DOI:10.1126/science.1089911)
      riqueza: 'media'
    },
    omo_kibish: {
      taxa: ['Hippopotamus amphibius','Bovidae','Equidae','Cercopithecidae',
             'Crocodylidae','Tilapia (peces)'],
      bioma: 'Ribera de lago y sabana',
      nota: 'Omo I y Omo II; Homo sapiens temprano (Omo I: edad mínima 233 ± 22 ka; Vidal et al., 2022).',
      // McDougall et al. 2005 (DOI:10.1038/nature03258)
      riqueza: 'media'
    },
    neander_valley: {
      taxa: ['Coelodonta antiquitatis','Equus ferus','Bison priscus',
             'Cervus elaphus','Ursus spelaeus','Crocuta crocuta spelaea',
             'Mammuthus primigenius'],
      bioma: 'Tundra-estepa periglaciar',
      nota: 'Contexto glacial; holotipo Neanderthal 1, hallado en 1856 (Fuhlrott); Homo neanderthalensis King, 1864.',
      riqueza: 'alta'
    },
    denisova_cave: {
      taxa: ['Cervidae (Rangifer, Cervus)','Bovidae (Bison, Bos)','Equus ferus',
             'Ursus spelaeus','Felis silvestris','Panthera spelaea',
             'Coelodonta antiquitatis'],
      bioma: 'Estepa-bosque altaica',
      nota: 'Capas con denisovanos, neandertales y sapiens; fauna glaciar diversa.',
      // Douka et al. 2019 (DOI:10.1038/s41586-019-1257-6)
      riqueza: 'alta'
    },
    liang_bua: {
      taxa: ['Stegodon florensis insularis','Varanus komodoensis','Varanus salvator',
             'Leptoptilos robustus','Rattus hainaldi','Crocodylus'],
      bioma: 'Selva tropical insular con enanismo',
      nota: 'Insularidad extrema; Stegodon enano y marabú gigante en el contexto de H. floresiensis.',
      // van den Bergh et al. 2016 (DOI:10.1038/nature17418)
      riqueza: 'media'
    },
    callao: {
      taxa: ['Cervidae','Suidae','Bovidae (Bubalus)',
             'Varanus','Micromammalia filipina','Testudines'],
      bioma: 'Selva tropical insular',
      nota: 'Insularismo filipino; contexto de Homo luzonensis (Détroit et al. 2019).',
      // Détroit et al. 2019 (DOI:10.1038/s41586-019-1067-9)
      riqueza: 'baja'
    },
    dali_site: {
      taxa: ['Cervidae chinos','Equidae','Bovidae','Elephantidae',
             'Rhinocerotidae','Ursidae'],
      bioma: 'Sabana-bosque loess',
      nota: 'Pleistoceno medio tardío; contexto de Homo daliensis [DEBATIDO: validez del nombre].',
      riqueza: 'media'
    },
    harbin: {
      taxa: ['Mamíferos del Pleistoceno medio tardío chino (inferidos por correlación)',
             'Cervidae','Bovidae'],
      bioma: 'Llanura aluvial fría',
      nota: 'Contexto aislado; Homo longi (Ji et al., 2021) [DEBATIDO: nomenclatura y afinidad denisovana].',
      riqueza: 'baja'
    }
  };

  /* ── Riqueza → color ──────────────────────────────────────────────────── */
  const RIQUEZA_COLOR = {
    'muy alta': '#0e7f65',
    'alta':     '#1a4fa0',
    'media':    '#c07800',
    'baja':     '#8a96a6'
  };
  const RIQUEZA_PCT = { 'muy alta': 100, 'alta': 72, 'media': 48, 'baja': 24 };

  /* ── Escape XSS ──────────────────────────────────────────────────────── */
  function _esc(str) {
    const el = document.createElement('span');
    el.textContent = str || '';
    return el.innerHTML;
  }

  /* ── R91-P4: cursiva taxonómica conforme a la nomenclatura ─────────────
     Solo género y epítetos van en cursiva (CINZ); familias (-idae), subfamilias
     (-inae), tribus (-ini), órdenes y rótulos en español van en redonda. */
  const HIGHER_TAXA = new Set(['Carnivora','Proboscidea','Reptilia','Testudines','Microfauna',
    'Micromammalia','Hyaenodonta','Insectivora','Creodonta','Crocodylia','Primates','Rodentia',
    'Artiodactyla','Perissodactyla','Mammalia','Aves','Pisces','Peces','Moluscos','Pleistoceno',
    'Plioceno','Mioceno','Holoceno','Lista']);
  const SUPRAGENERIC = /(idae|inae|ini|oidea|iformes|ata)$/;
  const NON_EPITHET = new Set(['de','del','con','y','e','o','por','en','enano','enana','chinos',
    'europeos','africanos','pequeños','pequeña','marinos','costeros','basales','primitivos',
    'indet','antes','agua','dulce','cueva']);
  /**
   * Devuelve el nombre del taxón escapado, con <i> solo en género y epítetos.
   * @param {string} taxon
   * @returns {string} HTML seguro
   */
  function _taxonHtml(taxon) {
    let prevItalic = false;
    return String(taxon || '').split(/(\s+|[(),;])/).map(w => {
      if (!w) return '';
      if (/^\s+$/.test(w)) return _esc(w);
      if (/^[(),;]$/.test(w)) { prevItalic = false; return _esc(w); }
      const genus = /^[A-Z][a-z]+$/.test(w) && !SUPRAGENERIC.test(w) && !HIGHER_TAXA.has(w);
      const epithet = prevItalic && /^[a-z]+$/.test(w) && !NON_EPITHET.has(w);
      if (genus || epithet) { prevItalic = true; return '<i>' + _esc(w) + '</i>'; }
      prevItalic = false;
      return _esc(w);
    }).join('');
  }

  /* ════════════════════════════════════════════════════════════════════════
     B. RENDERIZADO DEL BLOQUE DE FAUNA
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Genera el HTML del bloque de fauna para una ficha de yacimiento.
   * @param {string} siteId - ID del yacimiento (clave en FAUNA_DB)
   * @returns {string|null} HTML o null si no hay datos
   */
  function _faunaBlockHtml(siteId, siteLabel) {
    const data = FAUNA_DB[siteId];
    if (!data || !data.taxa || data.taxa.length === 0) return null;

    const col = RIQUEZA_COLOR[data.riqueza] || '#8a96a6';
    const pct = RIQUEZA_PCT[data.riqueza]   || 24;

    const pills = data.taxa
      .map(t => `<span class="pb-fauna-pill">${_taxonHtml(t)}</span>`)
      .join('');

    return `
      <div class="pb-fauna-block" aria-label="Fauna asociada a este yacimiento">
        <div class="pb-fauna-header">
          <strong>Fauna asociada</strong>
          <span class="pb-fauna-bioma">${_esc(data.bioma || '')}</span>
          <div class="pb-fauna-riqueza" title="Riqueza faunística: ${_esc(data.riqueza)}">
            <!-- R91-P4: pista de anchura fija; el % de la barra se resolvía contra un
                 contenedor de anchura intrínseca y quedaba en 0 px. -->
            <div class="pb-fauna-riqueza-track"
                 role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
                 aria-valuetext="Riqueza ${_esc(data.riqueza)} (categoría cualitativa)"
                 aria-label="Riqueza faunística">
              <div class="pb-fauna-riqueza-bar" aria-hidden="true"
                   data-pb-r71-style="width:${pct}%;background:${col}"></div>
            </div>
            <span class="pb-fauna-riqueza-label">${_esc(data.riqueza)}</span>
          </div>
        </div>
        <div class="pb-fauna-pills">${pills}</div>
        ${data.nota ? `<p class="pb-fauna-nota">${_esc(data.nota)}</p>` : ''}
        <p class="pb-fauna-cautela"><span class="pb-fauna-flag">[PROVISIONAL]</span> Lista orientativa de taxones
          representativos, no inventario exhaustivo. Caracteriza el contexto paleoambiental;
          no prueba interacción directa con los homininos.${siteLabel ? ` <a href="https://paleobiodb.org/classic/basicCollectionSearch?collection_name=${encodeURIComponent(String(siteLabel).split(/\s*[\/,]\s*/)[0])}" target="_blank" rel="noopener">Consultar en Paleobiology Database</a>` : ''}</p>
      </div>`;
  }

  /* ════════════════════════════════════════════════════════════════════════
     C. INYECCIÓN EN LAS FICHAS EXISTENTES
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * Inyecta los bloques de fauna en las fichas del #siteGrid ya renderizado.
   * Usa data-site-id para localizar cada card sin reescribir renderSiteView.
   */
  function _injectFaunaIntoCards() {
    const grid = document.getElementById('siteGrid');
    /* R91-P4: sin bandera a nivel de rejilla. La marca por tarjeta basta y permite
       reinyectar cuando filtros o búsquedas regeneran #siteGrid. */
    if (!grid) return;

    const cards = grid.querySelectorAll('article.site-card');
    if (!cards.length) return;

    let injected = 0;
    cards.forEach(card => {
      if (card.dataset.pbFaunaInjected) return;

      /* Inferir site ID desde el nombre del yacimiento en la card */
      const h3 = card.querySelector('h3');
      const titleText = h3?.textContent?.trim() || '';
      const siteId = _inferSiteId(titleText);

      if (!siteId) return;

      const html = _faunaBlockHtml(siteId, titleText);
      if (!html) return;

      /* Insertar antes del último site-section (Species) si existe, o al final */
      const sections = card.querySelectorAll('.site-section');
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        lastSection.insertAdjacentHTML('beforebegin', html);
      } else {
        card.insertAdjacentHTML('beforeend', html);
      }
      card.dataset.pbFaunaInjected = '1';
      injected++;
    });

    if (injected > 0) {
      grid.dataset.pbFaunaInjected = '1';
      log(`Fauna inyectada en ${injected} fichas de yacimiento`);
    }
  }

  /* ── Mapeo nombre → site_id ──────────────────────────────────────────── */
  /**
   * Infiere el ID del SITE_CATALOG desde el nombre visible de la ficha.
   * Usamos un mapa explícito para evitar lógica frágil de normalización.
   */
  const NAME_TO_ID = {
    'Koru / Rusinga':                   'koru_rusinga',
    'Moroto II':                        'moroto_ii',
    'Saint-Gaudens y cuencas europeas': 'saint_gaudens',
    'Abocador de Can Mata / Els Hostalets de Pierola': 'can_mata',
    'Nakali':                           'nakali',
    'Formación Chorora':                'chorora',
    'Pyrgos / Azmaka':                  'pyrgos_azmaka',
    'Toros-Menalla':                    'toros_menalla',
    'Tugen Hills':                      'tugen_hills',
    'Middle Awash':                     'middle_awash',
    'Kanapoi / Allia Bay':              'kanapoi_allia_bay',
    'Hadar / Dikika':                   'hadar_dikika',
    'Woranso-Mille':                    'woranso_mille',
    'Ledi-Geraru':                      'ledi_geraru',
    'Koro Toro':                        'koro_toro',
    'Lomekwi / Turkana occidental':     'west_turkana_lomekwi',
    'Sterkfontein':                     'sterkfontein',
    'Bouri':                            'bouri',
    'Malapa':                           'malapa',
    'Omo / Olduvai / Peninj':           'omo_olduvai',
    'Swartkrans / Kromdraai':           'swartkrans_kromdraai',
    'Koobi Fora / Nariokotome':         'koobi_fora',
    'Dmanisi':                          'dmanisi',
    'Sangiran / Ngandong':              'java',
    'Atapuerca, Gran Dolina':           'atapuerca',
    'Sima del Elefante TE7':            'sima_elefante_te7',
    'Ceprano':                          'ceprano',
    'Mauer':                            'mauer',
    "Bodo D'ar":                        'bodo_dar',
    'Broken Hill / Kabwe':              'kabwe',
    'Florisbad':                        'florisbad',
    'Rising Star / Dinaledi':           'rising_star',
    'Jebel Irhoud':                     'jebel_irhoud_site',
    'Blombos Cave':                     'blombos_cave',
    'Omo Kibish':                       'omo_kibish',
    'Valle de Neander':                 'neander_valley',
    'Cueva Denisova':                   'denisova_cave',
    'Liang Bua':                        'liang_bua',
    'Cueva Callao':                     'callao',
    'Dali':                             'dali_site',
    'Harbin':                           'harbin'
  };

  function _inferSiteId(titleText) {
    if (NAME_TO_ID[titleText]) return NAME_TO_ID[titleText];
    /* Búsqueda parcial por prefijo como fallback */
    const lower = titleText.toLowerCase();
    for (const [name, id] of Object.entries(NAME_TO_ID)) {
      if (lower.startsWith(name.substring(0,8).toLowerCase())) return id;
    }
    return null;
  }

  /* ════════════════════════════════════════════════════════════════════════
     D. WRAP DE renderSiteView PARA INYECCIÓN AUTOMÁTICA
     ════════════════════════════════════════════════════════════════════════ */

  function _wrapRenderSiteView() {
    if (typeof window.renderSiteView !== 'function') return;
    const orig = window.renderSiteView;
    window.renderSiteView = function() {
      orig.apply(this, arguments);
      /* Diferir un frame para que el DOM esté actualizado */
      window.requestAnimationFrame(_injectFaunaIntoCards);
    };
    log('renderSiteView() envuelto para inyección de fauna');
  }

  /* ════════════════════════════════════════════════════════════════════════
     E. CSS DEL BLOQUE DE FAUNA
     ════════════════════════════════════════════════════════════════════════ */

  function _injectStyles() {
    /* R91-P4: la CSP (style-src 'self') bloquea <style> inyectados. El CSS vive en
       assets/css/60-science/036a-paleobot-v66-fauna.css, enlazado con id
       pb-m4-fauna-styles; esta función queda como comprobación inocua. */
    if (!document.getElementById('pb-m4-fauna-styles')) warn('Hoja de estilos de fauna no enlazada');
  }

  /* ════════════════════════════════════════════════════════════════════════
     F. INICIALIZACIÓN
     ════════════════════════════════════════════════════════════════════════ */

  function _init() {
    _injectStyles();
    _wrapRenderSiteView();

    /* Si la vista yacimientos ya está activa, inyectar inmediatamente */
    if (document.getElementById('view-yacimientos')?.classList.contains('active')) {
      window.setTimeout(_injectFaunaIntoCards, 300);
    }

    /* Escuchar cambios de vista */
    ['paleobot:viewchange','paleobot:v55-viewchange','paleobot:combined-viewchange'].forEach(evt => {
      document.addEventListener(evt, function(e) {
        const view = e.detail?.view || e.detail?.viewId || '';
        if (view === 'yacimientos') window.setTimeout(_injectFaunaIntoCards, 300);
      });
    });

    /* MutationObserver en #siteGrid como último recurso */
    const grid = document.getElementById('siteGrid');
    if (grid && window.MutationObserver) {
      const obs = new MutationObserver(() => {
        if (grid.querySelector('article.site-card')) {
          window.requestAnimationFrame(_injectFaunaIntoCards);
        }
      });
      obs.observe(grid, { childList: true });
    }

    /* Exponer API pública */
    window.FAUNA_DB = FAUNA_DB;
    window.PaleoBotV66Fauna = { FAUNA_DB, faunaBlockHtml: _faunaBlockHtml, taxonHtml: _taxonHtml };
    log(`M4 Fauna listo — ${Object.keys(FAUNA_DB).length} yacimientos con datos`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init, { once: true });
  } else {
    _init();
  }

})();
