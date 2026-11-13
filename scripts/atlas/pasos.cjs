// Pasos reutilizables del atlas (PB-GH-11). Cada paso ejerce una función REAL de la interfaz (clic, teclado)
// y devuelve observaciones comparables (sin capturas). Los usan humo.cjs (JSON comparable) y recorrido.cjs
// (capturas y piso). Convención de resultado: { paso, ok, [items: {nombre: bool}], [campos de diálogo] }.
// Campos de diálogo (probarDialogo): abre, focoEntra, cierraConEscape, focoVuelve, ariaHiddenAbierto, tabFuera.
'use strict';

const VISTAS = ['timeline', 'tree', 'phylo', 'contexto', 'clima', 'paleoecologia', 'continentes', 'africa', 'america',
  'asia', 'europe', 'map', 'yacimientos', 'debates', 'socratico', 'estratigrafia', 'tafonomia', 'introgresion',
  'genomica', 'paleoproteomica', 'holotipos', 'coexistencias', 'revisiones', 'dispersal', 'constructor', 'datacion',
  'primatologia', 'aula', 'recursos', 'itinerarios', 'biogeo'];

// Estado de un diálogo y del foco (para medir entrada, trampa, Escape y retorno).
async function estadoDialogo(page, sel) {
  return page.evaluate((sel) => {
    const d = document.querySelector(sel);
    if (!d) return { existe: false };
    const r = d.getBoundingClientRect(); const s = getComputedStyle(d);
    const visible = r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    const a = document.activeElement;
    // aria-hidden en el propio diálogo o en un antecesor: para un lector de pantalla no existe.
    let oculto = false; for (let e = d; e && e !== document; e = e.parentElement) if (e.getAttribute && e.getAttribute('aria-hidden') === 'true') { oculto = true; break; }
    return { existe: true, visible, activa: d.classList.contains('active') || d.hasAttribute('open'), ariaHidden: d.getAttribute('aria-hidden'), ariaHiddenEfectivo: oculto,
      focoDentro: !!(a && d.contains(a)), foco: a ? (a.id || a.tagName.toLowerCase()) + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '') : null,
      texto: visible ? d.innerText.replace(/\s+/g, ' ').trim().length : 0 };
  }, sel);
}

async function foco(page) {
  return page.evaluate(() => { const a = document.activeElement; if (!a) return null; return (a.id || a.tagName.toLowerCase()) + (a.dataset && (a.dataset.action || a.dataset.pbV50Action) ? '[' + (a.dataset.action || a.dataset.pbV50Action) + ']' : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : ''); });
}

async function visible(page, sel) {
  const h = await page.$(sel); if (!h) return false; try { return await h.isVisible(); } catch (e) { return false; }
}

// Abre un diálogo con un clic real y mide foco, trampa de Tab, Escape y retorno del foco.
// abrirSel: selector del disparador; dialogoSel: selector del diálogo.
async function probarDialogo(page, nombre, abrirSel, dialogoSel, extra) {
  const out = { paso: nombre, ok: false };
  try {
    const btn = await page.$(abrirSel);
    if (!btn) { out.error = 'sin disparador ' + abrirSel; out.abre = false; return out; }
    if (!(await btn.isVisible())) { out.disparadorOculto = true; }
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.focus().catch(() => {});
    const opener = await foco(page);
    await btn.click({ timeout: 3000, force: !!out.disparadorOculto }).catch(async (e) => { out.clicError = String(e).split('\n')[0].slice(0, 120); await page.evaluate((s) => document.querySelector(s)?.click(), abrirSel).catch(() => {}); });
    // Varios módulos escriben aria-hidden y mueven el foco con temporizadores: se espera a que se asiente.
    await page.waitForTimeout(1200);
    out.abierto = await estadoDialogo(page, dialogoSel);
    out.abre = !!(out.abierto && out.abierto.visible);
    out.focoEntra = !!(out.abierto && out.abierto.focoDentro);
    out.ariaHiddenAbierto = !!(out.abierto && out.abierto.ariaHiddenEfectivo);
    if (extra) { try { out.extra = await extra(page); } catch (e) { out.extraError = String(e).split('\n')[0].slice(0, 160); } }
    // Trampa: 25 tabulaciones; ¿cuántas veces sale el foco del diálogo?
    let fuera = 0;
    for (let i = 0; i < 25; i++) { await page.keyboard.press('Tab'); const dentro = await page.evaluate((s) => { const d = document.querySelector(s); return !!(d && d.contains(document.activeElement)); }, dialogoSel); if (!dentro) fuera++; }
    out.tabFuera = fuera;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    out.trasEscape = await estadoDialogo(page, dialogoSel);
    out.cierraConEscape = out.abre && !out.trasEscape.visible;
    if (out.abre && !out.cierraConEscape) {
      // cerrar por su botón para seguir
      await page.evaluate((s) => { const d = document.querySelector(s); const c = d && d.querySelector('.close-modal,[data-pres-close],[data-modal-toggle],[aria-label^="Cerrar"],.spl-close,button[value=close]'); if (c) c.click(); }, dialogoSel);
      await page.waitForTimeout(400);
    }
    out.focoTrasCerrar = await foco(page);
    out.disparador = opener;
    out.focoVuelve = out.abre && out.focoTrasCerrar === opener;
    out.ok = out.abre;
  } catch (e) { out.error = String(e).split('\n')[0].slice(0, 200); }
  return out;
}

async function entrar(page) {
  const out = { paso: 'entrar' };
  try { await page.click('#pb-skip-intro-bar', { timeout: 3000 }); } catch (e) { out.error = String(e).split('\n')[0].slice(0, 100); }
  await page.waitForTimeout(800);
  out.entrado = await page.evaluate(() => document.body.classList.contains('pb-workspace-entered'));
  out.foco = await foco(page);
  out.ok = out.entrado;
  return out;
}

async function abrirCajon(page) {
  const t = await page.$('#pb-mobile-tools-toggle');
  if (!t || !(await t.isVisible())) return false;
  const exp = await t.getAttribute('aria-expanded');
  if (exp !== 'true') { await t.click().catch(() => {}); await page.waitForTimeout(400); }
  return true;
}
async function cerrarCajon(page) {
  const t = await page.$('#pb-mobile-tools-toggle');
  if (t && (await t.getAttribute('aria-expanded')) === 'true') { await t.click().catch(() => {}); await page.waitForTimeout(300); }
}

// Medidas comparables de una vista: alcanzable = con los <details> de la vista abiertos (plegar bajo un
// desplegable cuenta como conservar; ocultar con display:none, no).
async function medirVista(page, id) {
  return page.evaluate((id) => {
    const s = document.getElementById('view-' + id); if (!s) return null;
    // content-visibility:auto (041-speed-guard) hace que innerText omita lo que está fuera de pantalla: para medir
    // lo alcanzable sin depender del desplazamiento se fuerza su pintado solo durante la medida.
    const cv = document.createElement('style'); cv.textContent = '#view-' + id + ' *{content-visibility:visible!important}'; document.head.appendChild(cv);
    const cerrados = [...s.querySelectorAll('details:not([open])')]; cerrados.forEach((d) => { d.open = true; });
    const vis = (e) => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return r.width > 0 && r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden'; };
    const ctl = [...s.querySelectorAll('button,a[href],input,select,textarea,summary,[role=button],[tabindex="0"]')].filter(vis);
    const r = s.getBoundingClientRect();
    const norm = (t) => t.replace(/\s+/g, ' ').trim().slice(0, 90);
    const enc = [...new Set([...s.querySelectorAll('h2,h3,h4')].filter((h) => h.getClientRects().length > 0 && getComputedStyle(h).visibility !== 'hidden').map((h) => norm(h.textContent)).filter(Boolean))];
    const texto = s.innerText.replace(/\s+/g, ' ').trim().length;
    const datos = { alto: Math.round(r.height), controles: ctl.length, texto, encabezados: enc,
      svg: s.querySelectorAll('svg').length, canvas: s.querySelectorAll('canvas').length, imgs: s.querySelectorAll('img').length, tablas: s.querySelectorAll('table').length,
      imgsRotas: [...s.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0 && vis(i)).length };
    cerrados.forEach((d) => { d.open = false; });
    cv.remove();
    datos.pintada = datos.alto > 50 && texto > 40;
    return datos;
  }, id);
}

// Navega a una vista como el alumnado: pestaña de bloque + chip de la vista si están visibles; si no, switchView.
async function irVistaUI(page, id, conMedida = true) {
  const out = { vista: id, via: '' };
  const chip = `#pbV50Blocks [data-pb-v50-view="${id}"]`;
  if (!(await visible(page, chip))) {
    for (const blq of ['explorar', 'interpretar', 'investigar', 'aprender']) {
      const tab = await page.$(`#pbV50Blocks [data-pb-v50-block="${blq}"]`);
      if (tab && (await tab.isVisible())) { await tab.click().catch(() => {}); await page.waitForTimeout(250); if (await visible(page, chip)) break; }
    }
  }
  const errAntes = page._consola.filter((c) => c.tipo === 'pageerror').length;
  if (await visible(page, chip)) {
    await page.click(chip, { timeout: 3000 }).catch((e) => { out.clicError = String(e).split('\n')[0].slice(0, 100); });
    out.via = 'chip';
  } else {
    out.via = 'switchView';
    out.estado = await page.evaluate((id) => { try { window.switchView(id); return 'ok'; } catch (e) { return 'excepcion: ' + String(e).slice(0, 140); } }, id);
  }
  await page.waitForTimeout(700);
  out.activa = await page.evaluate((id) => !!document.getElementById('view-' + id)?.classList.contains('active'), id);
  if (!out.activa) {
    // segundo intento por la API pública (el chip pudo quedar desconectado por un repintado de la barra)
    await page.evaluate((id) => { try { window.switchView(id); } catch (e) {} }, id);
    await page.waitForTimeout(500);
    out.activa = await page.evaluate((id) => !!document.getElementById('view-' + id)?.classList.contains('active'), id);
    out.segundoIntento = true;
  }
  const nuevos = page._consola.filter((c) => c.tipo === 'pageerror').slice(errAntes);
  if (nuevos.length) out.excepciones = [...new Set(nuevos.map((c) => c.texto.slice(0, 160)))];
  if (conMedida) out.datos = await medirVista(page, id);
  out.ok = out.activa && !out.excepciones;
  return out;
}

// Recorre la vista desplazándose (carga diferida, content-visibility) y vuelve a su inicio.
async function barrerVista(page, id) {
  await page.evaluate(async (id) => {
    const s = document.getElementById('view-' + id); if (!s) return;
    const r = s.getBoundingClientRect(); const top = r.top + scrollY;
    for (let y = top; y < top + r.height; y += Math.round(innerHeight * 0.8)) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); }
    window.scrollTo(0, top);
  }, id);
  await page.waitForTimeout(350);
}

// Espera una descarga provocada por `accion`; devuelve el nombre sugerido o null.
async function descarga(page, accion, ms = 4000) {
  let nombre = null;
  const dl = page.waitForEvent('download', { timeout: ms }).then((d) => { nombre = d.suggestedFilename(); return d.cancel().catch(() => {}); }).catch(() => {});
  await accion();
  await dl;
  return nombre;
}

async function abrirFicha(page, id) {
  await irVistaUI(page, 'timeline', false);
  await page.evaluate((id) => document.querySelector(`#view-timeline [data-open-species="${id}"]`)?.scrollIntoView({ block: 'center' }), id);
  await page.click(`#view-timeline [data-open-species="${id}"]`, { timeout: 3000 }).catch(async () => { await page.evaluate((id) => document.querySelector(`#view-timeline [data-open-species="${id}"]`)?.click(), id); });
  await page.waitForTimeout(1200);
  return (await estadoDialogo(page, '#detailView')).visible;
}

async function abrirDesdeCajon(page, accion) {
  await abrirCajon(page);
  await page.evaluate((a) => document.querySelector(`#pb-floating-tools [data-action="${a}"]`)?.click(), accion);
  await page.waitForTimeout(800);
}

// ---------- Funciones del inventario (cada una devuelve {paso, ok, ...}) ----------
const FUNCIONES = {
  async 'portada.bloque'(page) {
    const out = { paso: 'portada.bloque' };
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('.pb-hub-card[data-hub-block="cronologia"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(500);
    out.herramientas = await page.$$eval('#pb-hub-tools-grid button, #pb-hub-tools-grid a', (b) => b.filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)));
    await page.click('#pb-hub-back', { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
    out.ok = out.herramientas.length > 0;
    return out;
  },
  async 'portada.indice'(page) {
    const n = await page.$$eval('#pb-landing-index-grid button, #pb-landing-index-grid a', (b) => b.map((x) => (x.dataset.hubView || x.dataset.view || x.getAttribute('href') || '') + '|' + x.innerText.trim().slice(0, 30)));
    return { paso: 'portada.indice', enlaces: n.length, destinos: n, ok: n.length > 0 };
  },
  async 'bloques'(page) {
    const out = { paso: 'bloques', chips: {} };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    for (const blq of ['explorar', 'interpretar', 'investigar', 'aprender']) {
      await page.click(`#pbV50Blocks [data-pb-v50-block="${blq}"]`, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
      out.chips[blq] = await page.$$eval('#pbV50Blocks [data-pb-v50-view]', (b) => b.filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.dataset.pbV50View));
    }
    out.totalVistasEnChips = new Set(Object.values(out.chips).flat()).size;
    out.items = Object.fromEntries(VISTAS.map((v) => [v, Object.values(out.chips).some((l) => l.includes(v))]));
    out.ok = Object.values(out.chips).every((v) => v.length > 0);
    return out;
  },
  async 'buscador.barra'(page) {
    const out = { paso: 'buscador.barra' };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    const inp = await page.$('#searchInput');
    out.visible = inp ? await inp.isVisible() : false;
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('/');
    await page.waitForTimeout(200);
    out.atajoBarra = await foco(page);
    if (inp) { await inp.fill('').catch(() => {}); await inp.type('afarensis', { delay: 15 }).catch(() => {}); await page.waitForTimeout(900); }
    out.resultado = await page.evaluate(() => {
      const gs = document.getElementById('globalSearchModal');
      const vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
      const tl = [...document.querySelectorAll('#view-timeline [data-open-species]')].filter(vis).length;
      return { modalBusqueda: vis(gs), itemsCronologiaVisibles: tl, contador: document.getElementById('countLabel')?.innerText || '' };
    });
    await page.keyboard.press('Escape');
    out.items = { atajo: /searchInput/.test(out.atajoBarra || ''), filtra: out.resultado.modalBusqueda || out.resultado.itemsCronologiaVisibles > 0 };
    out.ok = out.items.filtra;
    return out;
  },
  async 'filtros.clado'(page) {
    const out = { paso: 'filtros.clado' };
    const contar = () => page.evaluate(() => [...document.querySelectorAll('#view-timeline [data-open-species]')].filter((e) => e.getBoundingClientRect().width > 0).length);
    await irVistaUI(page, 'timeline', false);
    out.antes = await contar();
    const tog = await page.$('[data-pb-v50-filter-toggle]');
    if (tog && (await tog.isVisible())) { await tog.click().catch(() => {}); await page.waitForTimeout(400); }
    const chip = await page.$('[data-clade-filter="homo"]');
    if (chip && (await chip.isVisible())) { await chip.click().catch(() => {}); await page.waitForTimeout(600); out.homo = await contar(); }
    const pre = await page.$('[data-time-preset="2,2"]');
    if (pre && (await pre.isVisible())) { await pre.click().catch(() => {}); await page.waitForTimeout(600); out.homo2Ma = await contar(); }
    const reset = await page.$('[data-action="resetGlobalFilters"]');
    if (reset && (await reset.isVisible())) { await reset.click().catch(() => {}); await page.waitForTimeout(600); }
    out.trasLimpiar = await contar();
    out.items = { clado: out.homo !== undefined && out.homo < out.antes, tiempo: out.homo2Ma !== undefined && out.homo2Ma <= (out.homo || 0), limpiar: out.trasLimpiar === out.antes };
    out.ok = out.items.clado && out.items.limpiar;
    return out;
  },
  async 'nivel'(page) {
    const out = { paso: 'nivel' };
    const n = () => page.$$eval('#pbV50Blocks [data-pb-v50-view]', (b) => b.filter((x) => x.getBoundingClientRect().width > 0).length);
    out.universitario = await n();
    let err = null;
    await page.selectOption('#nivelEducativo', 'basico').catch((e) => { err = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(600); out.basico = await n();
    out.valorBasico = await page.$eval('#nivelEducativo', (s) => s.value).catch(() => null);
    await page.selectOption('#nivelEducativo', 'doctorado').catch(() => {}); await page.waitForTimeout(600); out.doctorado = await n();
    await page.selectOption('#nivelEducativo', 'universitario').catch(() => {}); await page.waitForTimeout(600);
    if (err) out.error = err;
    out.ok = !err && out.valorBasico === 'basico';
    return out;
  },
  async 'ficha'(page) {
    await irVistaUI(page, 'timeline', false); await barrerVista(page, 'timeline');
    return probarDialogo(page, 'ficha', '#view-timeline [data-open-species="afarensis"]', '#detailView', async (p) => p.evaluate(() => {
      const d = document.getElementById('detailView');
      const vis = (e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
      return { titulo: document.getElementById('detailViewTitle')?.innerText.slice(0, 60), pestanas: [...d.querySelectorAll('[role=tab]')].filter(vis).map((t) => t.innerText.trim().slice(0, 30)),
        imgs: [...d.querySelectorAll('img')].filter(vis).length, leaflet: !!d.querySelector('.leaflet-container') };
    }));
  },
  async 'ficha.pestanas'(page) {
    const out = { paso: 'ficha.pestanas', items: {} };
    await abrirFicha(page, 'neander');
    const tabs = await page.$$('#detailView [role=tab]');
    for (const t of tabs) {
      if (!(await t.isVisible())) continue;
      const n = (await t.innerText()).trim().slice(0, 25);
      await t.click().catch(() => {}); await page.waitForTimeout(250);
      out.items[n] = (await t.getAttribute('aria-selected')) === 'true';
    }
    if (tabs.length) { await tabs[0].focus().catch(() => {}); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200); out.flechaDerecha = await foco(page); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    out.ok = Object.keys(out.items).length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'lightbox'(page) {
    await abrirFicha(page, 'neander');
    return probarDialogo(page, 'lightbox', '#detailView img[data-lightbox-open]', '#lightbox');
  },
  async 'ficha.lagunas'(page) {
    // «¿Qué no sabemos aún?» (#researchGapModal) desde la ficha
    await abrirFicha(page, 'neander');
    return probarDialogo(page, 'ficha.lagunas', '#detailView .research-gap-btn[data-detail-action]', '#researchGapModal');
  },
  async 'minimapa.capas'(page) {
    const out = { paso: 'minimapa.capas', items: {} };
    await abrirFicha(page, 'neander');
    out.leaflet = await page.evaluate(() => typeof window.L !== 'undefined' && !!document.querySelector('#detailView .leaflet-container'));
    const capas = await page.$$('#detailView .leaflet-control-layers-selector');
    const ctl = await page.$('#detailView .leaflet-control-layers');
    if (ctl) await ctl.hover().catch(() => {});
    for (let i = 0; i < capas.length; i++) {
      const c = capas[i];
      const nombre = await c.evaluate((e) => (e.closest('label')?.innerText || '').trim().slice(0, 30)).catch(() => '') || 'capa' + i;
      await c.click({ force: true }).catch(() => {}); await page.waitForTimeout(250);
      out.items[nombre] = await c.isChecked().catch(() => false);
    }
    await page.keyboard.press('Escape');
    out.ok = out.leaflet && capas.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'comparar'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'comparar', '#pb-floating-tools [data-action="openCompare"], [data-pb-v50-action="openCompare"]', '#compareModal', async (p) => {
      const o = {};
      const inp = await p.$('#compareModal input[type=search], #compareModal input[type=text], #compareModal input');
      for (const q of ['afarensis', 'erectus']) {
        if (!inp) break;
        await inp.fill('').catch(() => {}); await inp.type(q, { delay: 10 }).catch(() => {}); await p.waitForTimeout(400);
        const op = await p.$('#compareModal [role=option], #compareModal .cmp-picker-option, #compareModal .cmp-dropdown button, #compareModal li button');
        if (op) { await op.click().catch(() => {}); await p.waitForTimeout(400); } else { await p.keyboard.press('Enter'); await p.waitForTimeout(300); }
      }
      o.contador = await p.$eval('#cmpCountLabel', (e) => e.innerText).catch(() => '');
      return o;
    });
    await cerrarCajon(page);
    return r;
  },
  async 'bibliografia'(page) {
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    return probarDialogo(page, 'bibliografia', '#pbV50Blocks [data-pb-v50-action="abrirBiblio"]', '#biblioModal', async (p) => p.evaluate(() => {
      const m = document.getElementById('biblioModal');
      return { doi: m.querySelectorAll('a[href*="doi.org"]').length };
    }));
  },
  async 'glosario'(page) {
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    return probarDialogo(page, 'glosario', '#pbV50Blocks [data-pb-v50-action="openGlossary"]', '#glossaryModal', async (p) => {
      const inp = await p.$('#glossaryModal input');
      if (inp) { await inp.type('bipedismo', { delay: 10 }).catch(() => {}); await p.waitForTimeout(500); }
      return p.evaluate(() => ({ tarjetas: [...document.querySelectorAll('#glossaryModal .glossary-card, #glossaryModal dt, #glossaryModal article')].filter((e) => e.getBoundingClientRect().width > 0).length }));
    });
  },
  async 'examen'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'examen', '#pb-floating-tools [data-action="startExam"]', '#examModal', async (p) => {
      await p.click('#examModal [data-quiz-next="classic"]', { timeout: 2000 }).catch(() => {});
      await p.waitForTimeout(500);
      const opc = await p.$$('#examModal #examQ button');
      if (opc.length) { await opc[0].click().catch(() => {}); await p.waitForTimeout(400); }
      return { opciones: opc.length };
    });
    await cerrarCajon(page); return r;
  },
  async 'matriz'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'matriz', '#pb-floating-tools [data-action="openMatrix"]', '#matrixModal', async (p) => p.evaluate(() => ({ filas: document.querySelectorAll('#matrixTableContent tr').length }))); await cerrarCajon(page); return r; },
  async 'estadisticas'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'estadisticas', '#pb-floating-tools [data-action="abrirEstadisticas"]', '#statsModal'); await cerrarCajon(page); return r; },
  async 'sintesis'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'sintesis', '#pb-floating-tools [data-action="openSessionSynthesis"]', '#sessionSynthesisModal'); await cerrarCajon(page); return r; },
  async 'guia'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'guia', '#pb-floating-tools [data-action="openStudentGuide"]', '#studentGuideModal'); await cerrarCajon(page); return r; },
  async 'guia.pestanas'(page) {
    const out = { paso: 'guia.pestanas', items: {} };
    await abrirDesdeCajon(page, 'openStudentGuide');
    const tabs = await page.$$('#studentGuideModal [data-sg-tab]');
    for (const t of tabs) {
      if (!(await t.isVisible())) continue;
      const clave = await t.getAttribute('data-sg-tab');
      await t.click().catch(() => {}); await page.waitForTimeout(300);
      out.items[clave] = await t.evaluate((e) => e.getAttribute('aria-selected') === 'true' || e.classList.contains('active'));
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    out.ok = Object.keys(out.items).length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'busqueda.global'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'busqueda.global', '#pb-a11y-toolbar-root [data-action="openGlobalSearch"]', '#globalSearchModal', async (p) => {
      const inp = await p.$('#globalSearchModal input'); if (inp) { await inp.type('Olduvai', { delay: 10 }).catch(() => {}); await p.waitForTimeout(600); }
      return p.evaluate(() => ({ resultados: [...document.querySelectorAll('#globalSearchModal button, #globalSearchModal a, #globalSearchModal li')].filter((e) => e.getBoundingClientRect().width > 0).length }));
    });
    await cerrarCajon(page); return r;
  },
  async 'presentacion'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'presentacion', '#pb-floating-tools [data-action="openPresentation"]', '#presOverlay', async (p) => {
      const t1 = await p.$eval('#presOverlay', (e) => e.innerText.slice(0, 80)).catch(() => '');
      await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500);
      const t2 = await p.$eval('#presOverlay', (e) => e.innerText.slice(0, 80)).catch(() => '');
      return { avanzaConFlecha: t1 !== t2 };
    });
    await cerrarCajon(page); return r;
  },
  async 'presentacion.controles'(page) {
    // «Solo CC» (#presFilterBtn) y «Auto» (#presAutoBtn): cambian de estado y vuelven.
    const out = { paso: 'presentacion.controles', items: {} };
    await abrirDesdeCajon(page, 'openPresentation');
    const estado = (sel) => page.evaluate((sel) => { const b = document.querySelector(sel); const o = document.getElementById('presOverlay'); return b ? [b.getAttribute('aria-pressed'), b.className, b.innerText.trim(), (o?.querySelectorAll('.pres-dot') || []).length].join('|') : null; }, sel);
    for (const [k, sel] of [['soloCC', '#presFilterBtn'], ['auto', '#presAutoBtn']]) {
      const a = await estado(sel);
      if (a === null) { out.items[k] = false; continue; }
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(500);
      const b = await estado(sel);
      out.items[k] = a !== b;
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(400);
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    out.ok = Object.values(out.items).every(Boolean);
    return out;
  },
  async 'presentacion.ampliarMapa'(page) {
    await abrirDesdeCajon(page, 'openPresentation');
    const r = await probarDialogo(page, 'presentacion.ampliarMapa', '#presOverlay [data-pres-map-expand]', '#presMapModal');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    return r;
  },
  async 'exportar.csv'(page) {
    const out = { paso: 'exportar.csv' };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    out.archivo = await descarga(page, () => page.click('#pbV50Blocks [data-pb-v50-action="exportToCSV"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }));
    out.ok = !!out.archivo; return out;
  },
  async 'exportar.svg.filogenia'(page) {
    const out = { paso: 'exportar.svg.filogenia' };
    await irVistaUI(page, 'phylo', false);
    out.archivo = await descarga(page, () => page.click('#view-phylo [data-action="exportPhyloSvg"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }));
    out.ok = !!out.archivo; return out;
  },
  async 'exportar.svg.constructor'(page) {
    const out = { paso: 'exportar.svg.constructor' };
    await irVistaUI(page, 'constructor', false);
    const esp = await page.$$('#view-constructor [data-builder-species]');
    for (const b of esp.slice(0, 2)) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch(() => {}); await page.waitForTimeout(300); }
    out.archivo = await descarga(page, () => page.click('#view-constructor [data-action="exportBuilderSvg"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }));
    out.ok = !!out.archivo; return out;
  },
  async 'aula.exportaciones'(page) {
    // Las 10 exportaciones del Centro docente (data-teaching-export)
    const out = { paso: 'aula.exportaciones', items: {}, archivos: {} };
    await irVistaUI(page, 'aula', false);
    const claves = await page.$$eval('#view-aula [data-teaching-export]', (b) => b.map((x) => x.dataset.teachingExport));
    for (const k of claves) {
      const sel = `#view-aula [data-teaching-export="${k}"]`;
      await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel);
      const f = await descarga(page, () => page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel)));
      out.items[k] = !!f; out.archivos[k] = f;
    }
    out.total = claves.length;
    out.ok = claves.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'recursos.filtros'(page) {
    const out = { paso: 'recursos.filtros', items: {}, visibles: {} };
    await irVistaUI(page, 'recursos', false);
    const claves = await page.$$eval('#view-recursos [data-resource-link-filter]', (b) => b.map((x) => x.dataset.resourceLinkFilter));
    for (const k of claves) {
      const sel = `#view-recursos [data-resource-link-filter="${k}"]`;
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(300);
      const r = await page.evaluate((s) => { const b = document.querySelector(s); const vis = [...document.querySelectorAll('#view-recursos [data-copy-link]')].filter((e) => e.getBoundingClientRect().width > 0).length; return { activo: !!b && (b.classList.contains('active') || b.getAttribute('aria-pressed') === 'true'), vis }; }, sel);
      out.items[k] = r.activo; out.visibles[k] = r.vis;
    }
    out.ok = claves.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'recursos.copiarEnlace'(page) {
    const out = { paso: 'recursos.copiarEnlace' };
    await irVistaUI(page, 'recursos', false);
    await page.evaluate(() => {
      window.__copiado = [];
      try { const c = navigator.clipboard; if (c) { c.writeText = (t) => { window.__copiado.push(String(t)); return Promise.resolve(); }; } } catch (e) {}
      const ex = document.execCommand.bind(document); document.execCommand = (cmd, ...r) => { if (cmd === 'copy') window.__copiado.push('execCommand:' + (document.getSelection()?.toString() || '')); return ex(cmd, ...r); };
    });
    const b = await page.$('#view-recursos [data-copy-link]');
    const esperado = b ? await b.getAttribute('data-copy-link') : null;
    const antes = b ? await b.innerText() : '';
    if (b) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch(() => {}); await page.waitForTimeout(500); }
    out.copiado = await page.evaluate(() => window.__copiado);
    out.rotuloCambia = b ? (await b.innerText().catch(() => antes)) !== antes : false;
    out.ok = !!esperado && out.copiado.some((t) => t.includes(esperado));
    return out;
  },
  async 'imprimir'(page) {
    const out = { paso: 'imprimir' };
    await page.evaluate(() => { window.__printCalls = 0; window.print = () => { window.__printCalls++; }; });
    await abrirCajon(page);
    await page.click('#pb-floating-tools [data-action="printFicha"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(500); out.llamadas = await page.evaluate(() => window.__printCalls);
    await cerrarCajon(page); out.ok = out.llamadas > 0; return out;
  },
  async 'diagnostico'(page) {
    // Hoy (línea base) solo produce algo visible dentro de Centro docente (04, fila 19).
    const out = { paso: 'diagnostico' };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    await page.click('#pbV50Blocks [data-pb-v50-action="runSelfAudit"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(800);
    out.informeVisible = await page.evaluate(() => { const r = document.getElementById('teachingAuditReport'); return !!r && r.getBoundingClientRect().width > 0 && r.innerText.trim().length > 20; });
    out.dialogos = await page.evaluate(() => [...document.querySelectorAll('.modal-overlay.active,.pb-v50-modal.active')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.id));
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    out.ok = out.informeVisible || out.dialogos.length > 0; return out;
  },
  async 'accesibilidad'(page) {
    const out = { paso: 'accesibilidad', items: {} };
    await abrirCajon(page);
    const raiz = () => page.evaluate(() => ({ fs: getComputedStyle(document.documentElement).fontSize, cls: document.documentElement.className }));
    out.inicio = await raiz();
    const pulsar = async (sel) => { const b = await page.$(sel); if (b && (await b.isVisible())) { await b.click().catch(() => {}); await page.waitForTimeout(300); return await raiz(); } return null; };
    out.amas = await pulsar('#pb-a11y-toolbar-root [data-font-action="increase"], #pb-a11y-toolbar-root button[aria-label="Aumentar tamaño de fuente"]');
    out.items.aumentar = !!out.amas && out.amas.fs !== out.inicio.fs;
    out.reset = await pulsar('#pb-a11y-toolbar-root [data-font-action="reset"], #pb-a11y-toolbar-root button[aria-label="Restablecer tamaño de fuente"]');
    out.items.restablecer = !!out.reset && out.reset.fs === out.inicio.fs;
    out.contraste = await pulsar('#pb-a11y-toolbar-root button:has-text("Contraste"), [data-action="toggleHighContrast"]');
    out.items.contraste = !!out.contraste && /contrast/.test(out.contraste.cls);
    if (out.items.contraste) await pulsar('#pb-a11y-toolbar-root button:has-text("Contraste"), [data-action="toggleHighContrast"]');
    await cerrarCajon(page);
    out.ok = out.items.aumentar; return out;
  },
  async 'daltonismo'(page) {
    // Simulación de daltonismo: botones [data-color-mode] del cajón (Normal, Deut., Prot., Achr., …)
    const out = { paso: 'daltonismo', items: {}, estados: {} };
    await abrirCajon(page);
    const modos = await page.$$eval('#pb-a11y-toolbar-root [data-color-mode]', (b) => b.map((x) => x.dataset.colorMode));
    const estado = () => page.evaluate(() => [document.documentElement.className, document.body.className.split(' ').filter((c) => /cvd|deut|prot|trit|achr|color|daltoni/i.test(c)).join(' '), getComputedStyle(document.documentElement).filter, getComputedStyle(document.body).filter, document.documentElement.dataset.colorMode || '', document.body.dataset.colorMode || ''].join('|'));
    const inicial = await estado();
    for (const m of modos) {
      const sel = `#pb-a11y-toolbar-root [data-color-mode="${m}"]`;
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(300);
      const e = await estado(); out.estados[m] = e;
      const pulsado = await page.$eval(sel, (b) => b.classList.contains('active') || b.getAttribute('aria-pressed') === 'true').catch(() => false);
      out.items[m] = pulsado && (m === 'normal' || m === 'none' ? true : e !== inicial);
    }
    if (modos.length) { const n = modos[0]; await page.evaluate((s) => document.querySelector(s)?.click(), `#pb-a11y-toolbar-root [data-color-mode="${n}"]`); }
    await cerrarCajon(page);
    out.ok = modos.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'modo.clase'(page) {
    const out = { paso: 'modo.clase' };
    const b = await page.$('.v36-workspace-shell [data-action="activateClassMode"]');
    out.visible = b ? await b.isVisible() : false;
    if (b) { await b.click({ force: !out.visible }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(700); }
    out.activa = await page.evaluate(() => document.body.classList.contains('class-mode-active'));
    if (b) { await b.click({ force: true }).catch(() => {}); await page.waitForTimeout(500); }
    out.trasSegundoClic = await page.evaluate(() => document.body.classList.contains('class-mode-active'));
    out.items = { activa: out.activa, desactiva: out.activa && !out.trasSegundoClic };
    out.ok = !!b && out.activa; return out;
  },
  async 'volver'(page) {
    const out = { paso: 'volver' };
    await irVistaUI(page, 'timeline', false); await irVistaUI(page, 'map', false);
    const b = await page.$('[data-back-action]');
    out.visible = b ? await b.isVisible() : false;
    if (b && out.visible) { await b.click().catch(() => {}); await page.waitForTimeout(500); }
    else await page.evaluate(() => document.querySelector('[data-back-action]')?.click());
    out.vista = await page.evaluate(() => document.querySelector('.view-section.active')?.id);
    out.ok = out.vista === 'view-timeline'; return out;
  },
  async 'mapa.yacimiento'(page) {
    const out = { paso: 'mapa.yacimiento', items: {} };
    await irVistaUI(page, 'map', false);
    const pts = await page.$$('#view-map [data-map-select]');
    const vis = []; for (const p of pts) if (await p.isVisible()) vis.push(p);
    out.puntosVisibles = vis.length;
    if (vis.length) { await vis[Math.min(5, vis.length - 1)].click().catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(600); }
    for (const sel of ['[data-map-zoom]', '[data-map-layer]', '[data-map-toggle]']) { const b = await page.$(`#view-map ${sel}`); out.items[sel] = !!(b && (await b.isVisible())); if (out.items[sel]) { await b.click().catch(() => {}); await page.waitForTimeout(300); } }
    out.ok = out.puntosVisibles > 0; return out;
  },
  async 'mapa.lentes'(page) {
    // Lente regional del mapa: 5 botones [data-map-lens] con rótulo
    const out = { paso: 'mapa.lentes', items: {} };
    await irVistaUI(page, 'map', false);
    const claves = await page.$$eval('#view-map button[data-map-lens]', (b) => [...new Set(b.filter((x) => x.innerText.trim()).map((x) => x.dataset.mapLens))]);
    for (const k of claves) {
      const sel = `#view-map button[data-map-lens="${k}"]`;
      const b = page.locator(sel).filter({ hasText: /\S/ }).first();
      await b.scrollIntoViewIfNeeded().catch(() => {});
      await b.click({ timeout: 3000 }).catch(() => page.evaluate((s) => [...document.querySelectorAll(s)].find((x) => x.innerText.trim())?.click(), sel));
      await page.waitForTimeout(400);
      out.items[k] = await page.evaluate((s) => [...document.querySelectorAll(s)].some((x) => x.getAttribute('aria-pressed') === 'true' || x.classList.contains('active')), sel);
    }
    out.ok = claves.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'socratico'(page) {
    await irVistaUI(page, 'socratico', false);
    return probarDialogo(page, 'socratico', '#view-socratico [data-soc-open]', '#socraticOverlay');
  },
  async 'paleolab'(page) {
    return probarDialogo(page, 'paleolab', '[data-action="openPaleoLab"]', '#splDialog');
  },
  async 'itinerario'(page) {
    const out = { paso: 'itinerario' };
    await irVistaUI(page, 'itinerarios', false);
    const t0 = await page.evaluate(() => document.getElementById('view-itinerarios').innerText.length);
    const b = await page.$('#view-itinerarios [data-itinerary-select]');
    if (b) { await b.click().catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(600); }
    out.cambia = (await page.evaluate(() => document.getElementById('view-itinerarios').innerText.length)) !== t0;
    out.ok = !!b; return out;
  },
  async 'aula.sa'(page) {
    const out = { paso: 'aula.sa' };
    await irVistaUI(page, 'aula', false);
    const b = await page.$('#view-aula [data-sa-generate]');
    if (b) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(700); }
    out.exportarVisible = await page.evaluate(() => { const o = document.querySelector('#view-aula [data-sa-export]'); return o ? o.getBoundingClientRect().width > 0 : false; });
    if (out.exportarVisible) out.archivo = await descarga(page, () => page.click('#view-aula [data-sa-export]', { timeout: 3000 }).catch(() => {}));
    out.items = { generar: !!b, exportarTXT: !!out.archivo };
    out.ok = !!b; return out;
  },
  async 'simulador'(page) {
    const out = { paso: 'simulador' };
    const r = await irVistaUI(page, 'dispersal', false); out.excepciones = r.excepciones || [];
    const b = await page.$('#view-dispersal [data-dispersal-play]');
    const n0 = page._consola.filter((c) => c.tipo === 'pageerror').length;
    if (b) { await b.click().catch(() => {}); await page.waitForTimeout(900); }
    out.excepcionesPlay = [...new Set(page._consola.filter((c) => c.tipo === 'pageerror').slice(n0).map((c) => c.texto.slice(0, 120)))];
    out.ok = !!b && out.excepciones.length === 0 && out.excepcionesPlay.length === 0; return out;
  },
  async 'datacion'(page) {
    const out = { paso: 'datacion' };
    await irVistaUI(page, 'datacion', false);
    const b = await page.$('#view-datacion [data-dating-method]');
    const t0 = await page.evaluate(() => document.getElementById('view-datacion').innerText.length);
    if (b) { await b.click().catch(() => {}); await page.waitForTimeout(500); }
    out.cambiaTexto = (await page.evaluate(() => document.getElementById('view-datacion').innerText.length)) !== t0;
    out.ok = !!b; return out;
  },
  async 'constructor'(page) {
    const out = { paso: 'constructor' };
    await irVistaUI(page, 'constructor', false);
    const n0 = await page.evaluate(() => document.querySelectorAll('#view-constructor svg *').length);
    const b = await page.$('#view-constructor [data-builder-species]');
    if (b) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch(() => {}); await page.waitForTimeout(500); }
    out.nodosSvg = await page.evaluate(() => document.querySelectorAll('#view-constructor svg *').length);
    out.items = { anade: out.nodosSvg > n0 };
    out.ok = !!b; return out;
  },
  async 'tafonomia'(page) {
    const out = { paso: 'tafonomia' };
    await irVistaUI(page, 'tafonomia', false);
    const s = await page.$('#tapho-sediment');
    if (s) { await s.scrollIntoViewIfNeeded().catch(() => {}); await s.focus().catch(() => {}); const v0 = await s.inputValue().catch(() => ''); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300); out.valor = await s.inputValue().catch(() => ''); out.items = { deslizador: out.valor !== v0 }; }
    out.ok = !!s; return out;
  },
};

// Enlace profundo ?view=<id>#main-content de las 31 vistas (lo usa el recorrido). Recibe una función que abre
// una página nueva; cada vista se comprueba con almacenamiento local vacío (sin «última vista» recordada).
async function enlacesProfundos(page, base, listo) {
  const out = { paso: 'enlaces.profundos', items: {} };
  await page.context().addInitScript(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  for (const v of VISTAS) {
    await page.goto(`${base}/atlas/index.html?view=${v}#main-content`, { waitUntil: 'load' }).catch(() => {});
    await listo(page, 5000);
    await page.waitForTimeout(500);
    out.items[v] = await page.evaluate((v) => !!document.getElementById('view-' + v)?.classList.contains('active'), v);
  }
  out.ok = Object.values(out.items).every(Boolean);
  return out;
}

module.exports = { VISTAS, FUNCIONES, irVistaUI, medirVista, barrerVista, entrar, abrirCajon, cerrarCajon, estadoDialogo, probarDialogo, foco, abrirFicha, descarga, enlacesProfundos };
